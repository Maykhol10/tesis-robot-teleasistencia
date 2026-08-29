// ============================================================================
// Datos simulados (mock) para la interfaz de teleasistencia.
// Representan lo que en producción vendría de: video stream del robot,
// eventos de N8N/Telegram (alertas), y logs del agente conversacional (LLM).
// ============================================================================

// ---------- Tipos ----------

export type EstadoConexion = "en-linea" | "inestable" | "desconectado";

export interface AdultoMayor {
  nombre: string;
  edad: number;
  ubicacionHogar: string; // habitación actual detectada
  ultimaActividad: string; // ISO — última actividad/movimiento detectado
  descripcionActividad: string;
}

export interface EstadoRobot {
  bateria: number; // 0-100
  cargando: boolean;
  conexion: EstadoConexion;
  ubicacion: string; // habitación donde está el robot
  senalWifi: number; // 0-4
  ultimoCheckIn: string; // ISO
  version: string;
}

export type SeveridadAlerta = "critica" | "alta" | "media";
export type EstadoAlerta = "pendiente" | "en-proceso" | "atendida";
export type TipoAlerta =
  | "caida"
  | "inactividad"
  | "emergencia-voz"
  | "fuera-de-rango"
  | "bateria-baja";

export interface Alerta {
  id: string;
  tipo: TipoAlerta;
  severidad: SeveridadAlerta;
  estado: EstadoAlerta;
  timestamp: string; // ISO
  ubicacion: string;
  descripcion: string;
  notas?: string;
  canalNotificacion: "telegram" | "app";
}

export type Emisor = "adulto-mayor" | "cuidador" | "agente-llm";

export interface MensajeConversacion {
  id: string;
  emisor: Emisor;
  texto: string;
  timestamp: string; // ISO
}

export interface RegistroActividad {
  dia: string; // etiqueta corta ("Lun", "Mar", ...)
  fecha: string; // ISO del día
  movimientos: number; // eventos de movimiento detectados
  interaccionesLLM: number;
  horasActivo: number;
}

/**
 * Habitación del croquis. Coordenadas en un lienzo de 100x70 unidades,
 * proporcional al plano real de la vivienda.
 */
export interface Habitacion {
  id: string;
  nombre: string;
  x: number;
  y: number;
  ancho: number;
  alto: number;
}

/** Vano en un muro: puerta o paso abierto. */
export interface Vano {
  /** Orientación del muro donde se abre. */
  eje: "h" | "v";
  /** Posición del muro en el eje perpendicular. */
  pos: number;
  /** Inicio y fin de la abertura a lo largo del muro. */
  desde: number;
  hasta: number;
  /** Puerta batiente (dibuja hoja y arco) o paso libre. */
  tipo: "puerta" | "paso";
  /** Sentido de apertura de la hoja. */
  giro?: 1 | -1;
}

/** Un paso del recorrido de la persona durante el día. */
export interface PasoRecorrido {
  habitacionId: string;
  hora: string; // "HH:MM"
}

export interface ResumenRespuesta {
  alertaId: string;
  tipo: TipoAlerta;
  timestamp: string;
  tiempoRespuestaMin: number; // minutos hasta que un cuidador atendió
  atendidoPor: string;
}

export interface ContactoEmergencia {
  id: string;
  nombre: string;
  telefono: string;
  relacion: string;
  prioridad: number; // orden de notificación
  telegram: boolean;
}

export interface ConfiguracionRobot {
  sensibilidadCaidas: number; // 0-100
  checkInInicio: string; // "08:00"
  checkInFin: string; // "20:00"
  intervaloCheckInMin: number;
  alertasInactividadMin: number; // minutos sin actividad para alertar
  teleoperacionPermitida: boolean;
}

// ---------- Datos ----------

// Base temporal fija para que el mock sea determinista (sin Date.now()).
const HOY = "2026-08-26";

export const adultoMayor: AdultoMayor = {
  nombre: "Rosa Quispe",
  edad: 78,
  ubicacionHogar: "Sala",
  ultimaActividad: `${HOY}T14:35:00-05:00`,
  descripcionActividad: "Caminando hacia la sala",
};

export const estadoRobot: EstadoRobot = {
  bateria: 72,
  cargando: false,
  conexion: "en-linea",
  ubicacion: "Sala",
  senalWifi: 3,
  ultimoCheckIn: `${HOY}T14:30:00-05:00`,
  version: "Orin-NX · v1.4.2",
};

// ---------------------------------------------------------------------------
// Croquis de la vivienda. Un solo piso, distribución típica de casa peruana:
// zona social al frente (sala/comedor), servicios al fondo, dormitorio
// separado por el pasillo.
//
// Lienzo 100 x 70. El origen (0,0) es la esquina superior izquierda.
// ---------------------------------------------------------------------------
export const habitaciones: Habitacion[] = [
  { id: "sala", nombre: "Sala", x: 0, y: 0, ancho: 42, alto: 38 },
  { id: "comedor", nombre: "Comedor", x: 42, y: 0, ancho: 32, alto: 38 },
  { id: "cocina", nombre: "Cocina", x: 74, y: 0, ancho: 26, alto: 38 },
  { id: "pasillo", nombre: "Pasillo", x: 0, y: 38, ancho: 100, alto: 12 },
  { id: "dormitorio", nombre: "Dormitorio", x: 0, y: 50, ancho: 58, alto: 20 },
  { id: "bano", nombre: "Baño", x: 58, y: 50, ancho: 42, alto: 20 },
];

/**
 * Vanos del croquis. El muro perimetral y los tabiques se dibujan macizos y
 * estas aberturas se restan, igual que en un plano de arquitecto.
 */
export const vanos: Vano[] = [
  // Tabiques verticales de la zona social
  { eje: "v", pos: 42, desde: 24, hasta: 34, tipo: "paso" },
  { eje: "v", pos: 74, desde: 24, hasta: 34, tipo: "paso" },
  // Zona social -> pasillo
  { eje: "h", pos: 38, desde: 14, hasta: 24, tipo: "paso" },
  { eje: "h", pos: 38, desde: 54, hasta: 64, tipo: "paso" },
  { eje: "h", pos: 38, desde: 82, hasta: 92, tipo: "puerta", giro: 1 },
  // Pasillo -> dormitorio y baño
  { eje: "h", pos: 50, desde: 16, hasta: 26, tipo: "puerta", giro: -1 },
  { eje: "h", pos: 50, desde: 70, hasta: 79, tipo: "puerta", giro: -1 },
  // Puerta de entrada al departamento
  { eje: "v", pos: 0, desde: 12, hasta: 24, tipo: "puerta", giro: 1 },
];

/** Recorrido de la persona en lo que va del día. */
export const recorridoHoy: PasoRecorrido[] = [
  { habitacionId: "dormitorio", hora: "07:40" },
  { habitacionId: "bano", hora: "08:05" },
  { habitacionId: "comedor", hora: "08:15" },
  { habitacionId: "cocina", hora: "09:30" },
  { habitacionId: "sala", hora: "11:20" },
  { habitacionId: "dormitorio", hora: "13:10" },
  { habitacionId: "pasillo", hora: "14:28" },
  { habitacionId: "sala", hora: "14:35" },
];

export const alertas: Alerta[] = [
  {
    id: "alt-006",
    tipo: "caida",
    severidad: "critica",
    estado: "pendiente",
    timestamp: `${HOY}T14:42:00-05:00`,
    ubicacion: "Baño",
    descripcion:
      "Posible caída detectada por visión artificial. Persona en el suelo por más de 15 segundos.",
    canalNotificacion: "telegram",
  },
  {
    id: "alt-005",
    tipo: "inactividad",
    severidad: "media",
    estado: "atendida",
    timestamp: `${HOY}T11:10:00-05:00`,
    ubicacion: "Dormitorio",
    descripcion: "Sin actividad detectada durante 90 minutos en horario diurno.",
    notas: "Llamé por videollamada, estaba descansando. Todo bien.",
    canalNotificacion: "app",
  },
  {
    id: "alt-004",
    tipo: "emergencia-voz",
    severidad: "alta",
    estado: "atendida",
    timestamp: `2026-08-25T19:22:00-05:00`,
    ubicacion: "Cocina",
    descripcion: 'El agente detectó la frase de ayuda: "no me siento bien".',
    notas: "Contacté a la Sra. Rosa, se sentía mareada. Le pedí que se sentara.",
    canalNotificacion: "telegram",
  },
  {
    id: "alt-003",
    tipo: "bateria-baja",
    severidad: "media",
    estado: "atendida",
    timestamp: `2026-08-25T08:05:00-05:00`,
    ubicacion: "Sala",
    descripcion: "Batería del robot por debajo del 15%. Regresando a base de carga.",
    notas: "Auto-resuelto: el robot volvió a cargar.",
    canalNotificacion: "app",
  },
  {
    id: "alt-002",
    tipo: "caida",
    severidad: "alta",
    estado: "atendida",
    timestamp: `2026-08-24T16:48:00-05:00`,
    ubicacion: "Pasillo",
    descripcion: "Movimiento brusco detectado, posible tropiezo.",
    notas: "Falsa alarma: se agachó a recoger algo. Ajusté sensibilidad.",
    canalNotificacion: "telegram",
  },
  {
    id: "alt-001",
    tipo: "inactividad",
    severidad: "media",
    estado: "atendida",
    timestamp: `2026-08-24T13:15:00-05:00`,
    ubicacion: "Dormitorio",
    descripcion: "Sin actividad durante la siesta habitual.",
    notas: "Rutina normal de siesta.",
    canalNotificacion: "app",
  },
];

export const conversacion: MensajeConversacion[] = [
  {
    id: "msg-1",
    emisor: "agente-llm",
    texto: "Buenos días, Rosa. ¿Cómo amaneció hoy? ¿Ya desayunó?",
    timestamp: `${HOY}T08:15:00-05:00`,
  },
  {
    id: "msg-2",
    emisor: "adulto-mayor",
    texto: "Sí, tomé mi avena. Me duele un poco la rodilla hoy.",
    timestamp: `${HOY}T08:16:00-05:00`,
  },
  {
    id: "msg-3",
    emisor: "agente-llm",
    texto:
      "Lamento escuchar eso. Recuerde su cita con el Dr. Mendoza el jueves. ¿Le aviso a su hija Carla?",
    timestamp: `${HOY}T08:16:30-05:00`,
  },
  {
    id: "msg-4",
    emisor: "adulto-mayor",
    texto: "Sí, avísale por favor.",
    timestamp: `${HOY}T08:17:00-05:00`,
  },
  {
    id: "msg-5",
    emisor: "cuidador",
    texto: "Hola mamá, me avisó el asistente. Te acompaño el jueves a la cita 💙",
    timestamp: `${HOY}T09:02:00-05:00`,
  },
  {
    id: "msg-6",
    emisor: "agente-llm",
    texto:
      "Recordatorio: es hora de tomar su pastilla para la presión. Le acerco un vaso con agua.",
    timestamp: `${HOY}T12:00:00-05:00`,
  },
];

export const actividadSemanal: RegistroActividad[] = [
  { dia: "Lun", fecha: "2026-08-20", movimientos: 142, interaccionesLLM: 8, horasActivo: 9.5 },
  { dia: "Mar", fecha: "2026-08-21", movimientos: 128, interaccionesLLM: 6, horasActivo: 8.2 },
  { dia: "Mié", fecha: "2026-08-22", movimientos: 156, interaccionesLLM: 11, horasActivo: 10.1 },
  { dia: "Jue", fecha: "2026-08-23", movimientos: 98, interaccionesLLM: 5, horasActivo: 7.0 },
  { dia: "Vie", fecha: "2026-08-24", movimientos: 134, interaccionesLLM: 9, horasActivo: 9.0 },
  { dia: "Sáb", fecha: "2026-08-25", movimientos: 167, interaccionesLLM: 13, horasActivo: 10.8 },
  { dia: "Dom", fecha: "2026-08-26", movimientos: 89, interaccionesLLM: 7, horasActivo: 5.5 },
];

export const tiemposRespuesta: ResumenRespuesta[] = [
  {
    alertaId: "alt-005",
    tipo: "inactividad",
    timestamp: `${HOY}T11:10:00-05:00`,
    tiempoRespuestaMin: 4,
    atendidoPor: "Carla (hija)",
  },
  {
    alertaId: "alt-004",
    tipo: "emergencia-voz",
    timestamp: `2026-08-25T19:22:00-05:00`,
    tiempoRespuestaMin: 2,
    atendidoPor: "Carla (hija)",
  },
  {
    alertaId: "alt-002",
    tipo: "caida",
    timestamp: `2026-08-24T16:48:00-05:00`,
    tiempoRespuestaMin: 1,
    atendidoPor: "Luis (hijo)",
  },
  {
    alertaId: "alt-001",
    tipo: "inactividad",
    timestamp: `2026-08-24T13:15:00-05:00`,
    tiempoRespuestaMin: 6,
    atendidoPor: "Carla (hija)",
  },
];

export const contactosEmergencia: ContactoEmergencia[] = [
  { id: "c1", nombre: "Carla Quispe", telefono: "+51 987 654 321", relacion: "Hija", prioridad: 1, telegram: true },
  { id: "c2", nombre: "Luis Quispe", telefono: "+51 912 345 678", relacion: "Hijo", prioridad: 2, telegram: true },
  { id: "c3", nombre: "Dr. Mendoza", telefono: "+51 998 877 665", relacion: "Médico de cabecera", prioridad: 3, telegram: false },
  { id: "c4", nombre: "SAMU", telefono: "106", relacion: "Emergencias", prioridad: 4, telegram: false },
];

export const configuracionInicial: ConfiguracionRobot = {
  sensibilidadCaidas: 70,
  checkInInicio: "08:00",
  checkInFin: "20:00",
  intervaloCheckInMin: 120,
  alertasInactividadMin: 90,
  teleoperacionPermitida: true,
};

// Temas frecuentes detectados por el agente conversacional (resumen).
export const temasFrecuentes: { tema: string; conteo: number }[] = [
  { tema: "Recordatorios de medicación", conteo: 24 },
  { tema: "Compañía / conversación", conteo: 18 },
  { tema: "Consultas de clima/hora", conteo: 12 },
  { tema: "Recordatorios de citas", conteo: 7 },
  { tema: "Solicitudes de ayuda", conteo: 3 },
];

// ---------- Selectores derivados ----------

/** Resuelve el nombre libre que traen las alertas al id del croquis. */
export function habitacionPorNombre(nombre: string): Habitacion | undefined {
  const limpio = nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  return habitaciones.find(
    (h) =>
      h.id === limpio ||
      h.nombre
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "") === limpio
  );
}

export const alertasPendientes = alertas.filter((a) => a.estado !== "atendida");
export const alertaCritica = alertas.find(
  (a) => a.estado === "pendiente" && a.severidad === "critica"
);

// Etiquetas legibles
export const etiquetaTipoAlerta: Record<TipoAlerta, string> = {
  caida: "Caída",
  inactividad: "Inactividad prolongada",
  "emergencia-voz": "Emergencia por voz",
  "fuera-de-rango": "Fuera de rango",
  "bateria-baja": "Batería baja",
};

export const etiquetaSeveridad: Record<SeveridadAlerta, string> = {
  critica: "Crítica",
  alta: "Alta",
  media: "Media",
};

export const etiquetaEstadoAlerta: Record<EstadoAlerta, string> = {
  pendiente: "Pendiente",
  "en-proceso": "En proceso",
  atendida: "Atendida",
};

export const etiquetaEmisor: Record<Emisor, string> = {
  "adulto-mayor": "Rosa",
  cuidador: "Cuidador",
  "agente-llm": "Asistente",
};
