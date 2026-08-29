# Notas de la conexión WebRTC con el robot

Problemas reales que costaron tiempo, con su causa y su arreglo. Todo lo que
está aquí se comprobó en funcionamiento, no es teoría.

El servidor vive en la Raspberry Pi, en `~/proyectos/robot-teleasistencia`, y
tiene su propio `NOTAS.md` con los problemas del lado del robot (color de la
cámara, CORS de aiohttp, captura compartida entre espectadores).

---

## 1. La conexión no llegaba a intentarse

**Síntoma.** El botón se quedaba en «Conectando…» y **en el log del robot no
aparecía ningún intento**. Con `curl` todo funcionaba.

**Causa — dos cosas juntas.** La oferta se enviaba sólo tras completar la
recolección de candidatos, sin límite de tiempo:

```ts
await new Promise((r) => { /* espera 'complete', sin tope */ });
const r = await fetch(`${URL_ROBOT}/offer`, ...);  // nunca se llegaba aquí
```

Y estaban declarados los TURN públicos de openrelay, que **ya no aceptan sus
credenciales abiertas** (comprobado: cero candidatos de relevo). El navegador
esperaba a un servidor que no contesta, la recolección no completaba nunca, y
la petición no salía del equipo.

**Arreglo.** Fuera los TURN muertos, y tope de 3 s a la espera. Ver
[lib/webrtc.ts](lib/webrtc.ts).

**Cómo se distingue de un fallo de red:** si el log del robot no registra el
intento, el problema está *antes* del envío. Si lo registra y falla después,
es ICE o el transporte. Esa pregunta ahorra horas.

---

## 2. La conexión se cortaba en cada re-render

**Causa.** El efecto de limpieza llevaba `desconectar` en sus dependencias:

```ts
useEffect(() => desconectar, [desconectar]);          // ✗ limpia en cada re-render
useEffect(() => { return () => { /* … */ }; }, []);   // ✓ sólo al desmontar
```

Como el contador de fps actualiza estado **cada segundo**, la conexión se
cerraba continuamente. En desarrollo apenas se nota; en el build de
producción es constante.

---

## 3. La página se rompía sola tras cada despliegue

**Causa.** GitHub Pages sirve el HTML con `Cache-Control: max-age=600` y no
permite cambiar esa cabecera. Durante diez minutos el navegador seguía
pidiendo bundles del build anterior, que ya no existen.

**Arreglo.** Metaetiquetas de revalidación en [app/layout.tsx](app/layout.tsx)
y una pantalla de error, [app/error.tsx](app/error.tsx), que detecta el fallo
de carga de chunk y recarga sola una vez (con marca en `sessionStorage` para
no entrar en bucle).

Aun así, **tras desplegar hace falta `Ctrl + Shift + R` casi siempre**.

---

## 4. Faltaba STUN para conectar desde fuera de la red

**Causa.** El navegador se creaba sin servidores STUN, así que sólo anunciaba
su IP privada. La Pi sí descubre su dirección pública sola (aiortc lo hace),
pero sin un par de rutas viable la negociación fallaba en milisegundos.

**Señal útil:** un `ICE checking → failed` **instantáneo** (~20 ms) significa
que no había ni un par de candidatos que probar. Un fallo lento es otra cosa.

---

## 5. El túnel cambia de URL al reconectar

**Síntoma.** Dejaba de conectar sin que nadie tocara nada.

**Causa.** El hotspot cortó la conexión QUIC y, al reconectar, Cloudflare
asignó **otra URL**. La web seguía apuntando a la vieja.

**Qué hacer.** Relanzar el túnel en la Pi, actualizar la variable y
redesplegar:

```bash
bash ~/proyectos/robot-teleasistencia/tunel.sh   # imprime la URL nueva
gh variable set NEXT_PUBLIC_ROBOT_URL --body "<url>" --repo Maykhol10/tesis-robot-teleasistencia
gh workflow run deploy.yml --ref main
```

**Pendiente.** Un quick tunnel siempre tendrá este problema. La solución
definitiva es un túnel con nombre (cuenta de Cloudflare + dominio propio),
que da URL fija, más `cloudflared` y el servidor como servicios systemd para
que sobrevivan a un reinicio.

---

## 6. Las tarjetas de telepresencia no cuadraban de altura

**Síntoma.** Las tres columnas —vídeo, controles, conversación—
terminaban a alturas distintas. Al abrir el chat todo se estiraba hasta
salirse de la pantalla, con la cruceta flotando en un hueco enorme.

**Causa.** La tarjeta del vídeo lleva `p-0`, así que su altura es
exactamente el `aspect-video` (16:9) más la barra de acciones. Las otras
dos llevan `p-5` y crecen con su contenido. **Nunca iban a coincidir.**
Y cuando una columna se estiraba con `h-full`, empujaba la fila entera:
en una rejilla eso no significa «la altura de la fila», significa que
ese hijo la define.

**Arreglo.** Que **una sola columna aporte altura** —el vídeo— y las
demás la llenen sin definirla:

```tsx
{/* la celda es el ancla */}
<div className="relative min-h-0">
  <Card className="flex min-h-0 flex-col overflow-y-auto lg:absolute lg:inset-0">
```

`absolute` saca la tarjeta del cálculo de altura de la fila; `inset-0`
la estira a la celda; `min-h-0` permite que desplace por dentro. En
móvil se apila y cada tarjeta recupera su altura natural.

**Cómo se diagnostica.** Antes de tocar clases de altura, **leer el
componente**: si dos tarjetas tienen padding distinto (`p-0` frente a
`p-5`) no van a igualarse solas, y ajustar `items-start` / `h-fit` /
`self-start` a ojo no lo resuelve. La pregunta útil es *quién define la
altura de la fila*, y la respuesta debe ser uno solo.

---

## 7. El chat no puede ir superpuesto

**Causa.** Una burbuja flotante estilo WhatsApp tapaba el vídeo. Es el
antipatrón que WCAG 2.2 AA nombra literalmente en **«Focus Not
Obscured»**: *«chat widgets que cubren el contenido»*.

Aquí además es de seguridad, no sólo de accesibilidad: se está
conduciendo un robot dentro de la casa de una persona mayor, y tapar el
vídeo es tapar lo único que dice qué está haciendo.

**Arreglo.** El chat es **una columna más de la rejilla**, no una capa
encima. Al abrirlo la rejilla pasa de 3 a 4 columnas y el vídeo cede
ancho en vez de quedar oculto:

```tsx
chatAbierto ? "lg:grid-cols-4" : "lg:grid-cols-3"
```

El botón vive en la barra de acciones del vídeo, junto a micrófono y
cámara. Ver [components/chat.tsx](components/chat.tsx).

---

## 8. Teleoperación: el robot debe parar solo

El control de motores va por I2C a la controladora en `0x34` (motores
JGB37-520). El código sale de
`Robotica_Avanzada/Proyecto/Seguidor_de_objetos/Encoder_test3.py`, que ya
movía el robot desde el teclado; sólo cambia de dónde vienen las órdenes.

**La decisión que importa: mantener pulsado, no alternar.** El navegador
repite la dirección cada 200 ms mientras el botón siga pulsado, y un
vigilante en la Pi para los motores si dejan de llegar en 600 ms.

Sin ese vigilante, cerrar la pestaña o perder el WiFi dejaría al robot
andando por la casa hasta chocar. Con él se detiene en medio segundo.
El margen es mayor que el intervalo de repetición a propósito: si fueran
iguales, el movimiento se cortaría entre órdenes.

En la web para también al soltar, al sacar el puntero del botón, al
perder el foco y al salir de la página (con `keepalive` para que la
petición salga aunque se cierre).

**Velocidad ajustable** de 3 a 25 (por defecto 5, el valor fijo que tenía
el script original). Por debajo de 3 los motores zumban sin girar; 25 ya
es rápido de más para una vivienda. Un valor fuera de rango se **acota en
vez de rechazarse**: viene de la interfaz, no de la persona, y es mejor
moverse despacio que quedarse quieto por un error.

Se puede cambiar con el robot en marcha — la siguiente repetición sale
con el valor nuevo.

Ver [lib/teleoperacion.ts](lib/teleoperacion.ts) y `scripts/motores.py`
en la Pi.

---

## 9. Modo automático: portar código probado sin reescribirlo

El seguimiento de personas viene de
`Robotica_Avanzada/Proyecto/Seguidor_de_objetos/object_tracker.py`, que ya
funcionaba en este robot. **Lo traduje a otra estructura en vez de copiarlo
literalmente, y esa traducción arrastró diferencias que costó detectar.**

Las confirmadas y ya corregidas: faltaba el `cv2.flip(im, 1)` previo a la
inferencia —sin él el desvío sale con el signo cambiado y el robot gira al
lado contrario— e interpreté mal `top_k=1`, mirando diez candidatos en vez
del más fiable, que es bastante más permisivo que el original.

**Queda pendiente auditar el flujo de decisión completo** (`_move_robot`
frente a `_decidir`): el orden en que se atienden giro y distancia, y el
sentido de cada orden. Comparar constantes no basta para darlo por bueno.

**La lección:** cuando el código de origen ya está probado en el hardware,
se copia tal cual y sólo se adapta el envoltorio. Aquí lo que obligaba a
cambiar era la cámara (viene compartida del servidor WebRTC, no de
`cv2.VideoCapture(0)`) y la salida a motores (`Motores` en vez de `util1`).
La lógica de decisión no debió tocarse.

Para verificar un port así no basta comparar constantes: hay que poner las
funciones **una al lado de otra** y leerlas. Comparar sólo los números decía
que todo coincidía mientras el robot hacía lo contrario.

### Detalles del port que sí eran necesarios

- **Velocidades sin acotar.** El seguidor calcula hasta 70 con la fórmula del
  original. El límite 3–25 de la teleoperación manual es para un mando que
  maneja una persona, así que el seguidor usa `mover_directo()`, que escribe
  al bus sin recortar, igual que `util1.py`.
- **Etiquetas en español.** El `coco_labels.txt` de este robot está traducido:
  dice `persona`, no `person`. Buscar la etiqueta inglesa descartaba todas las
  detecciones aunque el detector funcionara bien.
- **Los gráficos van en SVG sobre el vídeo**, no quemados en la imagen con
  OpenCV. Reproducen `_draw_overlays` —bandas negras, cuadro de puntería con
  su `area_factor = 2.1`, recuadro y punto rojo del centro de Kalman— pero el
  vídeo llega limpio y la Pi no gasta CPU dibujando, que con la inferencia
  corriendo va justa.
- **Cambiar a Teleoperado detiene el seguimiento**: si no, el robot seguiría
  corrigiendo por su cuenta mientras el cuidador intenta conducirlo.

---

## Configuración

`NEXT_PUBLIC_ROBOT_URL` define a qué robot apunta la web:

- **Desarrollo:** en `.env.local` (ignorado por git), la IP de la Pi en la red
  local — `http://192.168.214.158:8080`.
- **GitHub Pages:** variable del repositorio (Settings → Secrets and variables
  → Actions → Variables), leída por el workflow al construir.

Sin esa variable la interfaz se queda en **modo demostración**: se ve con los
datos simulados y no ofrece conectar. Es el estado correcto cuando el robot
está apagado.

Un detalle que importa: **la web se sirve por HTTPS**, así que no puede llamar
a `http://` ni a una IP local desde Pages. De ahí el túnel.

---

## Rendimiento medido

| Escenario | fps | Primer frame |
|---|---|---|
| Red local | 30.0 | 159 ms |
| Por el túnel HTTPS | 30.0 | ~540 ms |

Los fps por el túnel fluctúan (se llegaron a ver 15–25) según el estado de la
red. La cifra de red local es la estable.

**Límite de espectadores:** cada uno añade ~29 % de CPU en la Pi, porque VP8
se codifica por separado para cada conexión y la Pi 5 no tiene codificador
H.264 por hardware. Tres espectadores llegan al 91 % de un núcleo; el cuarto
ya no cabe.

---

## Cómo diagnosticar la próxima vez

El orden importa. Cada paso descarta una capa entera:

1. **¿El log del robot registra el intento?**
   `grep 'nueva conexion' /tmp/webrtc.log | tail`
   Si no aparece, el problema está en el cliente o en la red — no en el robot.

2. **¿El túnel responde?**
   `curl -s -o /dev/null -w '%{http_code}' <url>/`
   Si `curl` funciona y el navegador no, sospechar del código del cliente:
   `curl` no hace ICE.

3. **¿La URL del túnel sigue siendo la misma?**
   `cat /tmp/tunel_url.txt` en la Pi, comparada con la publicada.

4. **¿El navegador tiene el bundle nuevo?** `Ctrl + Shift + R`.

**Lo que más tiempo costó fue no empezar por el paso 1.** Que el intento no
aparezca en el log del robot es la señal más informativa que hay: descarta de
golpe el servidor, la red y el túnel.

### Para problemas de maquetación

La misma idea, aplicada al CSS: **leer el componente antes de tocar sus
clases**. Las alturas de telepresencia costaron varias rondas de probar
`items-start`, `h-fit` y `self-start` a ojo; la respuesta estaba en que
`Card` recibía `p-0` en un sitio y `p-5` en otro.

La pregunta que lo resuelve es *quién define la altura de la fila*. Si
la respuesta es «varias cosas a la vez», ahí está el fallo.

---

## Seguridad — pendiente

Mientras el túnel esté activo, **cualquiera con la URL ve el interior de la
casa, sin contraseña**. Está bien para probar; no para dejarlo corriendo.

Lo que falta antes de que esto sea un servicio de verdad:

- Token de autenticación en el servidor de la Pi.
- Cloudflare Access, o equivalente, delante del túnel.
- Restringir CORS al dominio de la web en vez de `*`.
