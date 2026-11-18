import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ServiceType } from '@/theme/colors';
import type {
  AccesorioId,
  Analisis,
  Datos,
  PerfilHogar,
  PreferenciaTema,
  RespuestasCuestionario,
  SlotAccesorio,
} from '@/store/types';
import {
  agregarRegistro,
  analizar,
  datosDemo,
  eliminarRegistro as quitarRegistro,
  normalizarDatos,
} from '@/store/consumo';
import { estandaresDe } from '@/store/perfil';
import { tarifasDe } from '@/store/costos';
import { calcularProgreso, evaluarLogros, EstadoLogro, ProgresoServicio } from '@/store/progreso';
import { generarRecomendacion } from '@/utils/recomendaciones';

const STORAGE_KEY = 'ecopet.datos.v1';

interface AppContextValue {
  cargando: boolean;
  servicioActivo: ServiceType;
  setServicioActivo: (s: ServiceType) => void;
  datos: Datos;
  estandares: Record<ServiceType, number>;
  tarifas: Record<ServiceType, number>;
  analisis: Record<ServiceType, Analisis>;
  progreso: Record<ServiceType, ProgresoServicio>;
  logros: EstadoLogro[];
  /** Logros desbloqueados que aún no se han anunciado. */
  logrosNuevos: EstadoLogro[];
  registrar: (servicio: ServiceType, valor: number, periodo?: string) => Analisis;
  eliminarRegistro: (servicio: ServiceType, id: number) => void;
  responderCuestionario: (servicio: ServiceType, respuestas: RespuestasCuestionario) => string;
  guardarPerfil: (perfil: PerfilHogar) => void;
  setTema: (tema: PreferenciaTema) => void;
  setTarifa: (servicio: ServiceType, valor: number | null) => void;
  equiparAccesorio: (servicio: ServiceType, slot: SlotAccesorio, id: AccesorioId | null) => void;
  marcarLogroVisto: (id: string) => void;
  restablecerDemo: () => void;
  borrarTodo: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

/** Todo lo que se calcula a partir de los datos guardados. */
function derivar(datos: Datos) {
  const estandares = estandaresDe(datos);
  const analisis = {
    agua: analizar(datos.registros.agua, estandares.agua),
    luz: analizar(datos.registros.luz, estandares.luz),
  };
  const progreso = {
    agua: calcularProgreso(datos.registros.agua, estandares.agua),
    luz: calcularProgreso(datos.registros.luz, estandares.luz),
  };
  const logros = evaluarLogros({ datos, estandares, analisis, progreso });
  return { estandares, analisis, progreso, logros, tarifas: tarifasDe(datos) };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [servicioActivo, setServicioActivo] = useState<ServiceType>('agua');
  const [datos, setDatos] = useState<Datos>(() => datosDemo());
  const [cargando, setCargando] = useState(true);

  // Carga los datos guardados en el dispositivo (si no hay, quedan los de ejemplo).
  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const guardado = await AsyncStorage.getItem(STORAGE_KEY);
        if (guardado && activo) setDatos(normalizarDatos(JSON.parse(guardado)));
      } catch {
        // Sin almacenamiento disponible: la app sigue con los datos en memoria.
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  // Guarda cada cambio, una vez cargado lo anterior.
  useEffect(() => {
    if (cargando) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(datos)).catch(() => {});
  }, [datos, cargando]);

  const derivados = useMemo(() => derivar(datos), [datos]);

  // La primera vez, los logros ya cumplidos se dan por vistos para no anunciarlos todos juntos.
  useEffect(() => {
    if (cargando || datos.logrosVistos !== null) return;
    const ids = derivados.logros.filter((l) => l.desbloqueado).map((l) => l.id);
    setDatos((prev) => ({ ...prev, logrosVistos: ids }));
  }, [cargando, datos.logrosVistos, derivados.logros]);

  const logrosNuevos = useMemo(() => {
    const vistos = datos.logrosVistos;
    if (vistos === null) return [];
    return derivados.logros.filter((l) => l.desbloqueado && !vistos.includes(l.id));
  }, [datos.logrosVistos, derivados.logros]);

  const registrar = useCallback(
    (servicio: ServiceType, valor: number, periodo?: string) => {
      const nuevos = agregarRegistro(datos, servicio, valor, periodo);
      setDatos(nuevos);
      return analizar(nuevos.registros[servicio], estandaresDe(nuevos)[servicio]);
    },
    [datos]
  );

  const eliminarRegistro = useCallback((servicio: ServiceType, id: number) => {
    setDatos((prev) => quitarRegistro(prev, servicio, id));
  }, []);

  const responderCuestionario = useCallback(
    (servicio: ServiceType, respuestas: RespuestasCuestionario) => {
      const texto = generarRecomendacion(servicio, respuestas);
      setDatos((prev) => ({
        ...prev,
        cuestionarioRespondido: true,
        recomendaciones: { ...prev.recomendaciones, [servicio]: texto },
      }));
      return texto;
    },
    []
  );

  const guardarPerfil = useCallback((perfil: PerfilHogar) => {
    setDatos((prev) => ({ ...prev, perfil }));
  }, []);

  const setTema = useCallback((tema: PreferenciaTema) => {
    setDatos((prev) => ({ ...prev, preferencias: { ...prev.preferencias, tema } }));
  }, []);

  const setTarifa = useCallback((servicio: ServiceType, valor: number | null) => {
    setDatos((prev) => ({ ...prev, tarifas: { ...prev.tarifas, [servicio]: valor } }));
  }, []);

  const equiparAccesorio = useCallback(
    (servicio: ServiceType, slot: SlotAccesorio, id: AccesorioId | null) => {
      setDatos((prev) => ({
        ...prev,
        accesorios: {
          ...prev.accesorios,
          [servicio]: { ...prev.accesorios[servicio], [slot]: id },
        },
      }));
    },
    []
  );

  const marcarLogroVisto = useCallback((id: string) => {
    setDatos((prev) => ({ ...prev, logrosVistos: [...(prev.logrosVistos ?? []), id] }));
  }, []);

  // Vuelven los registros de ejemplo; se conservan el hogar y las preferencias.
  const restablecerDemo = useCallback(() => {
    setDatos((prev) => ({
      ...prev,
      registros: datosDemo().registros,
      recomendaciones: { agua: null, luz: null },
    }));
  }, []);

  // Deja la app como recién instalada (solo se conserva el tema).
  const borrarTodo = useCallback(() => {
    setDatos((prev) => ({ ...datosDemo(), preferencias: prev.preferencias }));
  }, []);

  const value = useMemo(
    () => ({
      cargando,
      servicioActivo,
      setServicioActivo,
      datos,
      ...derivados,
      logrosNuevos,
      registrar,
      eliminarRegistro,
      responderCuestionario,
      guardarPerfil,
      setTema,
      setTarifa,
      equiparAccesorio,
      marcarLogroVisto,
      restablecerDemo,
      borrarTodo,
    }),
    [
      cargando,
      servicioActivo,
      datos,
      derivados,
      logrosNuevos,
      registrar,
      eliminarRegistro,
      responderCuestionario,
      guardarPerfil,
      setTema,
      setTarifa,
      equiparAccesorio,
      marcarLogroVisto,
      restablecerDemo,
      borrarTodo,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return ctx;
}
