# Aliada — Interfaz web de teleasistencia domiciliaria

Interfaz de monitoreo y control para un **robot móvil autónomo de teleasistencia domiciliaria** dirigido a adultos mayores (60+) que viven solos o con supervisión limitada.

Proyecto de tesis de título profesional en **Ingeniería Mecatrónica** — Universidad Privada del Norte (UPN), Perú.

> El robot **complementa**, no reemplaza, el cuidado humano.

## Subsistemas que refleja la interfaz

| Subsistema | Hardware / stack | Dónde se ve en la interfaz |
|---|---|---|
| **Navegación autónoma** | Intel RealSense D435i (RGB-D) + NVIDIA Jetson Orin NX 16 GB | Ubicación del robot en el hogar, cruceta de teleoperación |
| **Telepresencia + agente LLM** | Videollamada y voz | Pantalla de telepresencia, transcripción de conversaciones |
| **Detección de emergencias/caídas** | Visión artificial → N8N → Telegram | Banner de alerta, historial de alertas, sensibilidad configurable |

## Usuarios

- **Cuidador/familiar remoto** — usuario principal de esta interfaz web.
- **Adulto mayor** — interactúa físicamente con el robot (voz/pantalla del robot), no con esta web.

## Pantallas

| Ruta | Pantalla | Contenido |
|---|---|---|
| `/` | Dashboard | Estado del adulto mayor, estado del robot (batería, conexión, ubicación), alertas y conversaciones recientes |
| `/telepresencia` | Telepresencia | Video en vivo, controles de mic/cámara, teleoperación, chat con el agente conversacional |
| `/alertas` | Alertas | Historial filtrable por estado, severidad, notas del cuidador |
| `/historial` | Reportes | Actividad diaria, horas activa, tiempos de respuesta, temas de conversación |
| `/configuracion` | Configuración | Contactos de emergencia, sensibilidad de caídas, horarios de check-in |

## Criterios de diseño

- **La persona antes que la máquina** — el dashboard abre con el estado del adulto mayor; las métricas técnicas del robot son secundarias.
- **Tono cálido, no clínico ni alarmista** — el cuidador suele estar preocupado por un familiar.
- **La alerta crítica es inescapable** — banner persistente en las cinco pantallas, con acción directa a la videollamada.
- **Accesibilidad** — jerarquía visual clara, roles ARIA, y animaciones que respetan `prefers-reduced-motion`.

## Stack

- **Next.js 15** (App Router) + **React 19**
- **TypeScript** en modo estricto
- **Tailwind CSS** con paleta personalizada (azul-verde calmo + acento cálido)
- **Recharts** para visualización de datos
- **lucide-react** para iconografía

## Ejecutar localmente

```bash
npm install
npm run dev
```

Abre <http://localhost:3000>.

```bash
npm run build   # build de producción
npm run lint    # linting
```

## Estado actual y datos

Esta es la **capa de visualización y control para el cuidador**. No implementa la lógica real del robot.

Todos los datos provienen de [`lib/mock-data.ts`](lib/mock-data.ts) y son **ficticios** (nombres, teléfonos y eventos de ejemplo). En producción vendrían de un backend que integra:

- el video stream del robot,
- los eventos de N8N/Telegram para alertas,
- los logs del agente conversacional (LLM).

El video en vivo es un marcador de posición visual: no hay WebRTC implementado.

## Estructura

```
app/                    # Rutas (App Router)
  layout.tsx            # Shell: navegación + banner de alerta
  page.tsx              # Dashboard
  telepresencia/
  alertas/
  historial/
  configuracion/
components/
  nav.tsx               # Navegación lateral/superior
  banner-alerta.tsx     # Alerta crítica persistente
  ui.tsx                # Primitivas: Card, Badge, Métrica, Barra…
lib/
  mock-data.ts          # Datos simulados y tipos
  utils.ts              # Formato de fechas, cn()
```
