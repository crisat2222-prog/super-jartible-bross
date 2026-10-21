// MAPA DE LOS 5 MUNDOS: una ilustración de fondo (imagenes/mapamundos.jpg) con los mundos encima.
// Uso: const parar = iniciarMapa(canvas, progreso, MUNDOS, (indice) => { ... });
function iniciarMapa(canvas, progreso, mundos, alElegir) {
  canvas.width = 1280; canvas.height = 720; // proporción de la ilustración
  const ctx = canvas.getContext("2d"), W = canvas.width, H = canvas.height;

  // Dónde está cada mundo sobre la ilustración (fracciones: 0 = izquierda/arriba, 1 = derecha/abajo)
  // Es el punto del suelo donde clavamos el marcador. Pulsa C en el mapa para ver y ajustar los puntos.
  const SITIOS = [
    { x: 0.245, y: 0.235 },  // 1 Plaza de España
    { x: 0.815, y: 0.335 },  // 2 Triana
    { x: 0.345, y: 0.705 },  // 3 Feria
    { x: 0.866, y: 0.725 },  // 4 Semana Santa
    { x: 0.520, y: 0.390 },  // 5 La Giralda
  ];
  const NOMBRES = ["PLAZA DE ESPAÑA", "TRIANA", "FERIA", "SEMANA SANTA", "LA GIRALDA"];
  const RADIO = 95; // zona de clic alrededor de cada marcador, en píxeles del lienzo

  // ---------- Imagen de fondo ----------
  const ext = ["jpg", "jfif", "png", "jpeg", "webp"], img = new Image();
  let ei = 0, ok = false, err = false;
  img.onload = () => (ok = true);
  img.onerror = () => { ei++; if (ei < ext.length) img.src = `imagenes/mapamundos.${ext[ei]}`; else err = true; };
  img.src = `imagenes/mapamundos.${ext[0]}`;

  // ---------- Ratón ----------
  let mouse = { x: -999, y: -999 }, aviso = "", avisoFin = 0, calib = false, ultimo = "", raf;
  const pos = (e) => { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; };
  const bajo = () => SITIOS.findIndex((s) => Math.hypot(mouse.x - s.x * W, mouse.y - (s.y * H - 35)) < RADIO);
  const mm = (e) => { mouse = pos(e); const i = bajo(); canvas.style.cursor = i >= 0 && i <= progreso ? "pointer" : "default"; };
  const clic = (e) => {
    mouse = pos(e);
    if (calib) { ultimo = `x: ${(mouse.x / W).toFixed(3)}  y: ${(mouse.y / H).toFixed(3)}`; console.log(ultimo); return; }
    const i = bajo();
    if (i < 0) return;
    if (i <= progreso) alElegir(i);
    else { aviso = "Supera antes el mundo anterior"; avisoFin = Date.now() + 1800; }
  };
  const kd = (e) => { if (e.code === "KeyC" && !e.repeat) calib = !calib; };
  canvas.addEventListener("mousemove", mm);
  canvas.addEventListener("click", clic);
  window.addEventListener("keydown", kd);

  // ---------- Dibujo ----------
  const texto = (t, x, y, tam, c, al = "center") => { ctx.font = `${tam}px 'Press Start 2P', monospace`; ctx.fillStyle = c; ctx.textAlign = al; ctx.fillText(t, x, y); };

  function aura(x, y, c1) { // oscurece o ilumina la zona de un mundo
    const g = ctx.createRadialGradient(x, y - 60, 10, x, y - 60, 160);
    g.addColorStop(0, c1); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(x - 170, y - 230, 340, 340);
  }
  function marcador(x, y, color, contenido) { // chincheta con número, candado o check
    ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.beginPath(); ctx.ellipse(x, y + 2, 16, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y - 46, 24, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - 17, y - 33); ctx.lineTo(x + 17, y - 33); ctx.lineTo(x, y); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#f5f0d6"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y - 46, 24, 0, Math.PI * 2); ctx.stroke();
    if (contenido === "check") { ctx.beginPath(); ctx.moveTo(x - 10, y - 46); ctx.lineTo(x - 3, y - 38); ctx.lineTo(x + 11, y - 56); ctx.lineWidth = 5; ctx.stroke(); }
    else if (contenido === "lock") {
      ctx.fillStyle = "#f5f0d6"; ctx.fillRect(x - 9, y - 46, 18, 14);
      ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y - 47, 6, Math.PI, 0); ctx.stroke();
    } else texto(contenido, x, y - 39, 18, "#fff");
  }
  function placa(x, y, nombre, bloqueado, hover) {
    ctx.font = "13px 'Press Start 2P', monospace";
    const w = ctx.measureText(nombre).width + 28, h = 30, px = x - w / 2, py = y + 14;
    ctx.fillStyle = bloqueado ? "#ccc6b0" : hover ? "#fff8dc" : "#f5f0d6"; ctx.fillRect(px, py, w, h);
    ctx.strokeStyle = "#6a4018"; ctx.lineWidth = 3; ctx.strokeRect(px, py, w, h);
    texto(nombre, x, py + 20, 13, bloqueado ? "#6b7478" : "#4a2c14");
  }

  function dibujar() {
    const a = Date.now(), ver = bajo();
    if (ok) ctx.drawImage(img, 0, 0, W, H);
    else {
      ctx.fillStyle = "#ecd9a8"; ctx.fillRect(0, 0, W, H);
      texto(err ? "No encuentro imagenes/mapamundos.jpg" : "CARGANDO...", W / 2, H / 2, 16, "#4a2c14");
    }
    SITIOS.forEach((s, i) => { // auras
      const x = s.x * W, y = s.y * H;
      if (i > progreso) aura(x, y, "rgba(20,23,26,.55)");
      else if (ver === i) aura(x, y, "rgba(255,240,170,.35)");
      if (i === progreso) { const p = (a % 1400) / 1400; ctx.strokeStyle = `rgba(240,128,32,${1 - p})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(x, y, 30 + p * 70, 10 + p * 24, 0, 0, Math.PI * 2); ctx.stroke(); }
    });
    SITIOS.forEach((s, i) => {
      const x = s.x * W, y = s.y * H, hecho = i < progreso, actual = i === progreso, bloq = i > progreso;
      const salto = actual ? -Math.abs(Math.sin(a / 260)) * 10 : 0;
      marcador(x, y + salto, hecho ? "#4c9c3c" : actual ? "#f08020" : "#6b7478", hecho ? "check" : bloq ? "lock" : String(i + 1));
    });
    // aviso inferior
    ctx.fillStyle = "rgba(20,23,26,.8)"; ctx.fillRect(W / 2 - 300, H - 44, 600, 32);
    texto(a < avisoFin ? aviso : "Pulsa un mundo para entrar", W / 2, H - 22, 12, "#f5f0d6");

    if (calib) { // zonas de clic y coordenadas
      ctx.strokeStyle = "#ee3c28"; ctx.lineWidth = 3;
      SITIOS.forEach((s) => { ctx.beginPath(); ctx.arc(s.x * W, s.y * H - 35, RADIO, 0, Math.PI * 2); ctx.stroke(); });
      ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, 30); texto("CALIBRAR (C para salir)  " + ultimo, W / 2, 20, 12, "#ee3c28");
    }
    raf = requestAnimationFrame(dibujar);
  }
  dibujar();

  return function parar() {
    cancelAnimationFrame(raf);
    canvas.style.cursor = "default";
    canvas.removeEventListener("mousemove", mm);
    canvas.removeEventListener("click", clic);
    window.removeEventListener("keydown", kd);
  };
}
