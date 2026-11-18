import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ServiceType } from '@/theme/colors';
import type { Analisis, Datos, RespuestasCuestionario } from '@/store/types';
import { agregarRegistro, analizar, datosDemo } from '@/store/consumo';
import { generarRecomendacion } from '@/utils/recomendaciones';

const STORAGE_KEY = 'ecopet.datos.v1';

interface AppContextValue {
  cargando: boolean;
  servicioActivo: ServiceType;
  setServicioActivo: (s: ServiceType) => void;
  datos: Datos;
  analisis: Record<ServiceType, Analisis>;
  registrar: (servicio: ServiceType, valor: number) => Analisis;
  responderCuestionario: (servicio: ServiceType, respuestas: RespuestasCuestionario) => string;
  restablecerDemo: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

function analizarTodo(datos: Datos): Record<ServiceType, Analisis> {
  return {
    agua: analizar(datos.registros.agua, datos.estandares.agua),
    luz: analizar(datos.registros.luz, datos.estandares.luz),
  };
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
        if (guardado && activo) setDatos(JSON.parse(guardado) as Datos);
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

  const analisis = useMemo(() => analizarTodo(datos), [datos]);

  const registrar = useCallback(
    (servicio: ServiceType, valor: number) => {
      const nuevos = agregarRegistro(datos, servicio, valor);
      setDatos(nuevos);
      return analizar(nuevos.registros[servicio], nuevos.estandares[servicio]);
    },
    [datos]
  );

  const responderCuestionario = useCallback(
    (servicio: ServiceType, respuestas: RespuestasCuestionario) => {
      const texto = generarRecomendacion(servicio, respuestas);
      setDatos((prev) => ({
        ...prev,
        recomendaciones: { ...prev.recomendaciones, [servicio]: texto },
      }));
      return texto;
    },
    []
  );

  const restablecerDemo = useCallback(() => setDatos(datosDemo()), []);

  const value = useMemo(
    () => ({
      cargando,
      servicioActivo,
      setServicioActivo,
      datos,
      analisis,
      registrar,
      responderCuestionario,
      restablecerDemo,
    }),
    [cargando, servicioActivo, datos, analisis, registrar, responderCuestionario, restablecerDemo]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return ctx;
}
