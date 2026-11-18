# EcoPet - App móvil (React Native + Expo + TypeScript)

App para registrar el consumo de agua y luz, con una mascota virtual por servicio
cuyo estado cambia con el consumo. Diseño basado en los mockups de referencia
(portada, pantalla principal de agua y pantalla principal de luz).

**Funciona sin servidor:** los datos se guardan en el propio celular (AsyncStorage)
y toda la lógica corre en la app. No necesita backend ni base de datos para probarla.

## Cómo ejecutarla en tu celular

1. Instala **Node.js 18+** en tu computador.
2. Instala la app **Expo Go** en tu celular (Play Store / App Store).
3. En esta carpeta:

   ```bash
   npm install
   npx expo start
   ```

4. Escanea el código QR que aparece en la terminal:
   - **Android:** desde la app Expo Go.
   - **iPhone:** con la cámara del celular.

Celular y computador deben estar en la **misma red Wi-Fi**. Si no conecta
(redes de universidad u oficina suelen bloquearlo), usa:

```bash
npx expo start --tunnel
```

Para ver una vista previa en el navegador del computador: `npx expo start --web`.

## Qué hace

- **Portada** con el logo (gota + rayo) y botón "Comenzar".
- **Pantalla principal** con la mascota, consumo actual, variación contra el mes
  anterior, historial en barras y la **toolbar inferior** para cambiar entre la
  mascota de **Agua** (Gotín) y la de **Luz** (Voltín).
- **Estado de la mascota:**
  - consumo bajó o se mantuvo → feliz
  - subió y supera el estándar → decaída
  - subió pero sigue dentro del estándar → tranquila
- **Cuestionario de hábitos:** si el consumo supera el estándar, aparece un
  aviso que lleva al cuestionario y genera una recomendación personalizada,
  que queda visible en la pantalla principal.
- **Alerta de posible fuga:** si el consumo sube 60 % o más de golpe respecto
  al mes anterior.
- **Registrar consumo:** el valor del mes actual (si ya existe, se reemplaza).
- La campana muestra las alertas activas de ambos servicios.

### Datos de ejemplo

Al abrir por primera vez se cargan 5 meses de datos que reproducen los mockups:
agua baja 12 % (mascota feliz) y luz sube 27 % por encima del estándar (mascota
decaída + aviso del cuestionario). Estándares de ejemplo: agua 10 m³, luz 150 kWh.
Para volver a ese estado: "Restablecer datos de ejemplo" al final de la pantalla principal.

Para probar la alerta de fuga: registra un consumo de luz de 300 kWh o más.

## Estructura

```
App.tsx                      entrada de la app
src/
  store/
    consumo.ts               lógica: estado de la mascota, estándar, fuga, datos de ejemplo
    types.ts                 tipos
  context/AppContext.tsx     estado global + guardado local (AsyncStorage)
  screens/                   Portada, Home, RegistrarConsumo, Cuestionario
  components/                Mascota, Logo, MetricCard, HistorialBarras,
                             ServiceToggle, AlertBanner, OpcionChip
  theme/colors.ts            paleta de los mockups
  utils/                     formato y reglas de recomendación
```

## Comandos útiles

```bash
npm run typecheck    # revisa tipos TypeScript
npx expo start -c    # arranca limpiando la caché
```

## Pendiente / siguientes pasos

- Pantalla de configuración del estándar y cuestionario inicial de vivienda
  (área, habitantes, etc.) para calcular el estándar de cada hogar.
- Sincronizar con el backend (`ecopet-backend`, Node + Express + MySQL) si más
  adelante se quiere guardar los datos fuera del celular.
- Ícono de app y splash nativo para generar el APK/IPA (hoy corre en Expo Go).
