# EcoPet - App móvil (React Native + Expo SDK 58 + TypeScript)

Versiones: Expo SDK 58, React 19.3, React Native 0.88, React Navigation 7, TypeScript 6.

App para registrar el consumo de agua y luz, con una mascota virtual por servicio
cuyo estado cambia con el consumo. Diseño basado en los mockups de referencia
(portada, pantalla principal de agua y pantalla principal de luz).

**Funciona sin servidor:** los datos se guardan en el propio celular (AsyncStorage)
y toda la lógica corre en la app. No necesita backend ni base de datos para probarla.

## Cómo ejecutarla en tu celular

1. Instala **Node.js 22.13 o superior** (LTS 22 o 24) en tu computador. Con Node 18 o 20 no funciona: el SDK 58 lo exige. Verifícalo con `node -v`.
2. Instala o actualiza la app **Expo Go** en tu celular (Play Store / App Store). Debe ser una versión que soporte el **SDK 58**.
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
decaída + aviso del cuestionario). Estándares por defecto (sin encuesta): agua 10 m³, luz 150 kWh; con la encuesta
se calculan según el hogar.
Para volver a ese estado: menú de usuario → "Restablecer datos de ejemplo".

Para probar la alerta de fuga: registra un consumo de luz de 300 kWh o más.

### Funciones añadidas

- **Encuesta inicial del hogar** (al pulsar "Comenzar" la primera vez): nombre,
  personas, tipo y tamaño de vivienda, habitaciones, baños, estrato, lavadora,
  jardín, aire acondicionado, calentador y teletrabajo. Con eso se calcula el
  **estándar de consumo** de cada hogar (`src/store/perfil.ts`) y se muestra el
  desglose al final.
- **Menú de usuario** (avatar arriba a la derecha): editar los datos del hogar,
  historial, logros, mascota y accesorios, tarifas, tema claro/oscuro/sistema,
  restablecer los datos de ejemplo o borrar todo.
- **Modo oscuro**: claro, oscuro o según el sistema.
- **Costos estimados** en pesos: costo del mes y ahorro o gasto extra frente al
  mes anterior. La tarifa automática depende del estrato y es una aproximación
  (`src/store/costos.ts`); en "Tarifas y costos" se puede poner la del recibo.
- **Historial completo**: todos los meses con su costo y variación, editar o
  eliminar cada registro y registrar meses anteriores.
- **Racha y logros**: un mes es "bueno" si queda dentro del estándar o baja
  frente al anterior. Hay 10 logros y un aviso animado al desbloquear cada uno.
- **Evolución y accesorios**: la mascota pasa por las etapas Bebé → Joven →
  Adulto → Legendario según los meses buenos (crece, le salen mejillas,
  destellos y un aura). Los accesorios (moño, gafas, gorra, bigote, corona) se
  desbloquean por etapa, racha o logro.
- **Animaciones**: la mascota parpadea, salta y suelta un corazón al tocarla,
  llora cuando está decaída y aparece con un rebote; las barras del historial y
  las barras de progreso crecen animadas.

## Estructura

```
App.tsx                      entrada de la app
src/
  store/
    consumo.ts               lógica: estado de la mascota, fuga, registros, datos de ejemplo
    perfil.ts                estándar de consumo según la encuesta del hogar
    costos.ts                tarifas por estrato y costos
    progreso.ts              rachas, etapas de evolución, logros y accesorios
    types.ts                 tipos
  context/AppContext.tsx     estado global + guardado local (AsyncStorage)
  screens/                   Portada, EncuestaHogar, Home, RegistrarConsumo, Cuestionario,
                             Historial, Logros, Evolucion, Tarifas
  components/                Mascota, Logo, MetricCard, HistorialBarras,
                             ServiceToggle, AlertBanner, OpcionChip, MenuUsuario,
                             LogroToast, BarraProgreso, Contador, SelectorServicio
  theme/                     paletas clara/oscura y ThemeContext (useTheme, useStyles)
  utils/                     formato y reglas de recomendación
```

## Comandos útiles

```bash
npm run typecheck    # revisa tipos TypeScript
npx expo start -c    # arranca limpiando la caché
```

## Pendiente / siguientes pasos

- Sincronizar con el backend (`ecopet-backend`, Node + Express + MySQL) si más
  adelante se quiere guardar los datos fuera del celular.
- Ícono de app y splash nativo para generar el APK/IPA (hoy corre en Expo Go).
