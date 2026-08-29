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

---

## Seguridad — pendiente

Mientras el túnel esté activo, **cualquiera con la URL ve el interior de la
casa, sin contraseña**. Está bien para probar; no para dejarlo corriendo.

Lo que falta antes de que esto sea un servicio de verdad:

- Token de autenticación en el servidor de la Pi.
- Cloudflare Access, o equivalente, delante del túnel.
- Restringir CORS al dominio de la web en vez de `*`.
