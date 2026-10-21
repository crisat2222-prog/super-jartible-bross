// MUNDO 3: Feria de Sevilla (LA NOCHE DE LA FERIA)
// ENTER = avanzar · Clic = atrapar farolillos · C = ver zonas (calibrar)
function iniciarMundo3(canvas, alGanar) {
  canvas.width = 640; canvas.height = 337; // la foto de la Feria es casi 1.9:1
  const ctx = canvas.getContext("2d"), W = canvas.width, H = canvas.height;

  // ============ AJUSTES ============
  const TIEMPO = 30, PENAL = 3;             // segundos de partida y castigo por fallo
  const DUR = [4, 4, 3, 2.5, 2];            // segundos que sale cada farolillo
  // Sitios donde pueden aparecer farolillos (fracciones de la imagen: 0 = izq/arriba, 1 = der/abajo)
  const SPOTS = [
    { x: 0.089, y: 0.230 }, { x: 0.259, y: 0.236 }, { x: 0.470, y: 0.258 }, { x: 0.646, y: 0.264 }, { x: 0.835, y: 0.257 }, { x: 0.947, y: 0.244 },
    { x: 0.029, y: 0.295 }, { x: 0.177, y: 0.282 }, { x: 0.388, y: 0.301 }, { x: 0.557, y: 0.319 }, { x: 0.738, y: 0.310 }, { x: 0.932, y: 0.299 },
    { x: 0.062, y: 0.325 }, { x: 0.245, y: 0.317 }, { x: 0.477, y: 0.314 }, { x: 0.679, y: 0.344 }, { x: 0.866, y: 0.310 },
  ];
  const SECRETO = { x: 0.710, y: 0.524 };   // destello final (el farolillo de la caseta amarilla)
  const RADIO = 22;                          // tamaño de la zona de clic, en píxeles

  // ============ Imagen imagenes/feria.* ============
  const ext = ["jpg", "jfif", "png", "jpeg", "webp"], img = new Image();
  let ei = 0, imgOk = false, imgErr = false;
  img.onload = () => (imgOk = true);
  img.onerror = () => { ei++; if (ei < ext.length) img.src = `imagenes/feria.${ext[ei]}`; else imgErr = true; };
  img.src = `imagenes/feria.${ext[0]}`;

  // ============ Estado ============
  let estado = "entrada", f = "espera", t0 = 0, tInicio = 0, tStop = 0, penal = 0, capt = 0;
  let L = null, ultimo = null, secreto = false, restFinal = 0;
  let msg = "", msgColor = "#fff", msgFin = 0, flashFin = 0, flashColor = "#fff";
  let calib = false, ultimoClic = "";

  const dist = (a, b) => Math.hypot((a.x - b.x) * W, (a.y - b.y) * H);
  const barajar = (a) => a.map((v) => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
  const elegir = (excl) => barajar(SPOTS).find((s) => excl.every((e) => !e || dist(s, e) > 90));
  const aviso = (t, c, ms = 1000) => { msg = t; msgColor = c; msgFin = Date.now() + ms; };
  const flash = (c, ms) => { flashColor = c; flashFin = Date.now() + ms; };
  const restante = () => (f === "espera" && !tInicio ? TIEMPO : Math.max(0, TIEMPO - ((tStop || Date.now()) - tInicio) / 1000 - penal));

  function empezar() { estado = "juego"; f = "espera"; t0 = Date.now(); tInicio = 0; tStop = 0; penal = 0; capt = 0; L = null; ultimo = null; secreto = false; msgFin = 0; }

  // ============ Lógica de farolillos ============
  function aparecer(n) {
    const real = elegir([ultimo]); ultimo = real;
    L = { n, t0: Date.now(), real, decoys: [], ph: "C", tC: Date.now() };
    if (n === 2) { // sorpresa: varios farolillos, solo cuenta el que parpadea
      L.decoys = barajar(SPOTS.filter((s) => dist(s, real) > 70)).slice(0, 3);
      flash("#ffffff", 300); aviso("¡CUIDADO! Solo uno cuenta.", "#f2c91e", 2000);
    }
    if (n === 3) L.ph = "A"; // parpadea (no clicable) > desaparece > vuelve a aparecer
    if (n === 4) aviso("ÚLTIMO FAROLILLO", "#ee3c28", 1500);
    f = "farolillo";
  }
  function escapar() { aviso("¡SE ESCAPÓ!", "#f2c91e", 700); f = "escape"; t0 = Date.now(); L = null; }
  function fallo() { penal += PENAL; aviso(`¡FALLO!  -${PENAL}s`, "#ee3c28", 900); flash("#ff0000", 250); }

  // ============ Entrada ============
  const kd = (e) => {
    if (["Space", "Enter"].includes(e.code)) e.preventDefault();
    if (e.code === "KeyC" && !e.repeat) calib = !calib;
    if ((e.code === "Enter" || e.code === "Space") && !e.repeat) avanzar();
  };
  window.addEventListener("keydown", kd);
  canvas.addEventListener("click", clic);

  function avanzar() {
    if (estado === "entrada" || estado === "tiempo") empezar();
    else if (estado === "conseguido") { estado = "seguro"; t0 = Date.now(); }
    else if (estado === "secretoOK") estado = "resultado";
    else if (estado === "resultado") estado = "final";
    else if (estado === "final") { detener(); alGanar(); }
  }

  function clic(e) {
    const r = canvas.getBoundingClientRect();
    const mx = (e.clientX - r.left) / r.width, my = (e.clientY - r.top) / r.height;
    if (calib) { ultimoClic = `x: ${mx.toFixed(3)}  y: ${my.toFixed(3)}`; console.log(ultimoClic); return; }
    if (["entrada", "tiempo", "conseguido", "secretoOK", "resultado", "final"].includes(estado)) { avanzar(); return; }
    const cerca = (s) => s && Math.hypot((mx - s.x) * W, (my - s.y) * H) < RADIO;
    if (estado === "secretoBrilla") { if (cerca(SECRETO)) { secreto = true; estado = "secretoOK"; } return; }
    if (estado !== "juego" || f !== "farolillo" || !L) { if (estado === "juego" && f !== "espera") fallo(); return; }

    const clicable = L.n !== 3 || L.ph === "C";
    if (clicable && cerca(L.real)) {
      capt++;
      aviso(["¡FAROLILLO CONSEGUIDO!", "¡BIEN!", " 3/5", " 4/5", "¡5/5!"][L.n], "#4c9c3c", 900);
      flash("#f2c91e", 200);
      L = null;
      if (capt >= 5) { tStop = Date.now(); restFinal = restante(); estado = "conseguido"; }
      else { f = "entre"; t0 = Date.now(); }
    } else fallo();
  }

  // ============ Actualizar ============
  function actualizar() {
    const a = Date.now();
    if (estado === "juego") {
      if (f === "espera" && a - t0 > 2500) { f = "campana"; t0 = a; tInicio = a; }
      else if (f === "campana" && a - t0 > 1400) aparecer(capt);
      else if ((f === "entre" && a - t0 > 700) || (f === "escape" && a - t0 > 600)) aparecer(capt);
      else if (f === "farolillo" && L) {
        if (L.n === 3) {
          const el = a - L.t0;
          if (el < 1400) L.ph = "A";
          else if (el < 2000) L.ph = "B";
          else if (L.ph !== "C") { L.ph = "C"; L.real = elegir([L.real]); L.tC = a; }
          if (L.ph === "C" && a - L.tC > DUR[3] * 1000) escapar();
        } else if (a - L.t0 > DUR[L.n] * 1000) escapar();
      }
      if (tInicio && restante() <= 0) estado = "tiempo";
    }
    else if (estado === "seguro" && a - t0 > 2500) { estado = "secretoEspera"; t0 = a; }
    else if (estado === "secretoEspera" && a - t0 > 3000) { estado = "secretoBrilla"; t0 = a; }
    else if (estado === "secretoBrilla" && a - t0 > 4500) estado = "resultado";
  }

  // ============ Dibujo ============
  function texto(t, y, c = "#f5f0d6", tam = 12, xx = W / 2, al = "center") {
    ctx.font = `${tam}px 'Press Start 2P', monospace`;
    ctx.fillStyle = c; ctx.textAlign = al; ctx.fillText(t, xx, y);
  }
  function pantalla(lineas) {
    ctx.fillStyle = "#1e2228"; ctx.fillRect(0, 0, W, H); UI.marco(ctx, W, H, "feria");
    lineas.forEach((l, i) => texto(l, 70 + i * 34, i === 0 ? "#f08020" : "#f5f0d6", i === 0 ? 16 : 11));
  }
  function fondo() {
    if (imgOk) ctx.drawImage(img, 0, 0, W, H);
    else { ctx.fillStyle = "#1e2228"; ctx.fillRect(0, 0, W, H); texto(imgErr ? "NO ENCUENTRO imagenes/feria.jfif" : "CARGANDO...", H / 2, "#f5f0d6", 11); }
  }
  function brillo(s, real) { // efecto pixel-art sobre un farolillo (el real pulsa, los señuelos no)
    const x = s.x * W, y = s.y * H, p = (Date.now() % 500) / 500;
    const r = 13 + (real ? Math.sin(p * Math.PI * 2) * 5 : 0);
    ctx.fillStyle = real ? "rgba(255,235,90,.55)" : "rgba(255,150,50,.5)";
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";
    [[-r, 0], [r, 0], [0, -r], [0, r]].forEach(([dx, dy]) => ctx.fillRect(Math.round(x + dx) - 2, Math.round(y + dy) - 2, 4, 4));
  }
  function barra() {
    const a = Date.now(), rest = Math.ceil(restante());
    ctx.fillStyle = "rgba(0,0,0,.7)"; ctx.fillRect(0, 0, W, 30);
    texto("FERIA", 20, "#f08020", 10, 10, "left");
    texto(`FAROLILLOS ${capt}/5`, 20, "#f08020", 10);
    const urgente = capt === 4 && f === "farolillo" && Math.floor(a / 250) % 2 === 0;
    texto(`TIEMPO ${rest}`, 20, urgente || rest <= 5 ? "#ee3c28" : "#f08020", 10, W - 10, "right");
  }
  function dibujar() {
    const a = Date.now();
    if (estado === "entrada") { pantalla(["MUNDO 3", "FERIA DE SEVILLA", "LA NOCHE DE LA FERIA", "", "Aquí no hay pistas.", "Aquí no hay tiempo para pensar.", "Consigue los 5 farolillos", "antes de que se acabe el tiempo.", "[ ENTRAR EN LA FERIA ]"]); return; }
    if (estado === "tiempo") { pantalla(["SE ACABÓ EL TIEMPO", "La Feria te ha ganado.", "", "[ REINTENTAR ]"]); return; }
    if (estado === "conseguido") { pantalla(["¡LO HAS CONSEGUIDO!", "5/5 FAROLILLOS", "", "Pulsa ENTER"]); return; }
    if (estado === "seguro") { pantalla(["", "¿Seguro que eran solo cinco?"]); return; }
    if (estado === "secretoOK") { pantalla(["¡SECRETO DE LA FERIA!", "Has encontrado el farolillo", "oculto.", "", "+1 SECRETO", "", "Pulsa ENTER"]); return; }
    if (estado === "resultado") { pantalla(["FERIA COMPLETADA", "", "Farolillos: 5/5", `Secreto: ${secreto ? 1 : 0}/1`, `Tiempo restante: ${String(Math.ceil(restFinal)).padStart(2, "0")}`, "", "OBJETO CONSEGUIDO", "FAROLILLO DE LA FERIA"]); return; }
    if (estado === "final") { pantalla(["Habéis sobrevivido a la Feria.", "", "Pero el siguiente mundo", "será diferente.", "Allí no tendréis que correr.", "Tendréis que descubrir", "qué está ocurriendo.", "MUNDO 4   [ CONTINUAR ]"]); return; }

    fondo();
    if (estado === "juego") {
      barra();
      if (f === "campana") texto("¡EMPIEZA LA FERIA!", H / 2, "#f2c91e", 20);
      if (f === "farolillo" && L) {
        if (L.n === 3) {
          if (L.ph === "A" && Math.floor(a / 110) % 2 === 0) brillo(L.real, true);
          else if (L.ph === "C") brillo(L.real, true);
        } else { L.decoys.forEach((s) => brillo(s, false)); brillo(L.real, true); }
        if (L.n === 4 && a - L.t0 < 1500) texto("ÚLTIMO FAROLILLO", H / 2, "#ee3c28", 18);
      }
      if (a < msgFin) { ctx.fillStyle = "rgba(0,0,0,.75)"; ctx.fillRect(0, H - 34, W, 34); texto(msg, H - 12, msgColor, 12); }
    } else if (estado === "secretoBrilla") { // destello pequeño, sin avisar
      if (Math.floor((a - t0) / 300) % 2 === 0) {
        const x = SECRETO.x * W, y = SECRETO.y * H;
        ctx.fillStyle = "#fff"; ctx.fillRect(x - 1, y - 8, 3, 16); ctx.fillRect(x - 8, y - 1, 16, 3);
        ctx.fillStyle = "#f2c91e"; ctx.fillRect(x - 3, y - 3, 6, 6);
      }
    }
    if (a < flashFin) { ctx.globalAlpha = ((flashFin - a) / 300) * 0.5; ctx.fillStyle = flashColor; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }

    if (calib) { // posibles sitios de farolillo en rojo, secreto en amarillo
      ctx.lineWidth = 2; ctx.strokeStyle = "#ee3c28";
      SPOTS.forEach((s) => { ctx.beginPath(); ctx.arc(s.x * W, s.y * H, RADIO, 0, Math.PI * 2); ctx.stroke(); });
      ctx.strokeStyle = "#f2c91e"; ctx.beginPath(); ctx.arc(SECRETO.x * W, SECRETO.y * H, RADIO, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "#000"; ctx.fillRect(0, H - 24, W, 24);
      texto("CALIBRAR (C para salir) " + ultimoClic, H - 8, "#ee3c28", 9);
    }
  }

  let raf;
  (function bucle() { actualizar(); dibujar(); raf = requestAnimationFrame(bucle); })();

  function detener() {
    cancelAnimationFrame(raf);
    window.removeEventListener("keydown", kd);
    canvas.removeEventListener("click", clic);
    canvas.width = 640; canvas.height = 360; // tamaño estándar para los demás mundos
  }
  return detener;
}
