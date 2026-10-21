// MUNDO 1: Plaza de España (OBSERVA Y ENCUENTRA LAS 3 DIFERENCIAS)
// ENTER = avanzar · Clic = responder · C = modo calibración (ver zonas y coordenadas)
function iniciarMundo1(canvas, alGanar) {
  const ctx = canvas.getContext("2d"), W = canvas.width, H = canvas.height;

  // ============ AJUSTES ============
  const T_OBSERVA = 10, T_BUSCA = 60, PENALIZACION = 5; // segundos
  // Dónde se esconde el símbolo secreto (fracciones: 0 = izquierda/arriba, 1 = derecha/abajo)
  const SECRETO = { x: 0.78, y: 0.835, w: 0.04, h: 0.06 }; // en el agua del canal, abajo a la derecha
  // Las 3 diferencias se detectan solas comparando las dos imágenes.
  // Si no acierta, rellena esta lista a mano: { x, y, w, h } en fracciones. Ejemplo:
  // [{ x: 0.20, y: 0.55, w: 0.05, h: 0.20 }, { x: 0.60, y: 0.50, w: 0.06, h: 0.18 }, { x: 0.45, y: 0.82, w: 0.05, h: 0.06 }]
  const ZONAS_MANUALES = [
    { x: 0.012, y: 0.638, w: 0.092, h: 0.102 }, // árboles de la izquierda
    { x: 0.646, y: 0.488, w: 0.050, h: 0.226 }, // farolas a la derecha del puente
    { x: 0.826, y: 0.147, w: 0.097, h: 0.074 }, // nube de la derecha del todo
  ];

  // ============ Imágenes: imagenes/plazaespana.* e imagenes/plazaespanacambio.* ============
  function cargar(base) {
    const ext = ["jpg", "png", "jpeg", "webp"], im = new Image(), o = { im, base, ok: false, err: false };
    let i = 0;
    im.onload = () => (o.ok = true);
    im.onerror = () => { i++; if (i < ext.length) im.src = `imagenes/${base}.${ext[i]}`; else o.err = true; };
    im.src = `imagenes/${base}.${ext[0]}`;
    return o;
  }
  const A = cargar("plazaespana"), B = cargar("plazaespanacambio");

  // ============ Detección automática de diferencias ============
  function detectar() {
    const cols = 64, rows = 36, cs = 5, w = cols * cs, h = rows * cs; // rejilla de 64x36 celdas
    const datos = [A, B].map((o) => {
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      const x = c.getContext("2d"); x.drawImage(o.im, 0, 0, w, h);
      return x.getImageData(0, 0, w, h).data;
    });
    const dif = new Array(cols * rows).fill(0);
    for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
      const p = (py * w + px) * 4, ci = Math.floor(py / cs) * cols + Math.floor(px / cs);
      dif[ci] += (Math.abs(datos[0][p] - datos[1][p]) + Math.abs(datos[0][p + 1] - datos[1][p + 1]) + Math.abs(datos[0][p + 2] - datos[1][p + 2])) / 3 / (cs * cs);
    }
    const marca = dif.map((d) => d > 22);
    // agrupar celdas marcadas (se unen si están a 2 celdas o menos)
    const visto = new Array(cols * rows).fill(false), grupos = [];
    marca.forEach((m, i) => {
      if (!m || visto[i]) return;
      const pila = [i], celdas = []; visto[i] = true;
      while (pila.length) {
        const c = pila.pop(); celdas.push(c);
        const cx = c % cols, cy = Math.floor(c / cols);
        for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
          const nx = cx + dx, ny = cy + dy, n = ny * cols + nx;
          if (nx >= 0 && ny >= 0 && nx < cols && ny < rows && marca[n] && !visto[n]) { visto[n] = true; pila.push(n); }
        }
      }
      grupos.push(celdas);
    });
    return grupos
      .map((g) => ({ g, score: g.reduce((s, c) => s + dif[c], 0) }))
      .sort((a, b) => b.score - a.score).slice(0, 3)
      .map(({ g }) => {
        const xs = g.map((c) => c % cols), ys = g.map((c) => Math.floor(c / cols));
        const x0 = Math.min(...xs), x1 = Math.max(...xs) + 1, y0 = Math.min(...ys), y1 = Math.max(...ys) + 1;
        const w = Math.max((x1 - x0) / cols, 0.04), h = Math.max((y1 - y0) / rows, 0.06);
        return { x: (x0 + x1) / 2 / cols - w / 2, y: (y0 + y1) / 2 / rows - h / 2, w, h };
      });
  }

  // ============ Estado ============
  let zonas = null, errorDeteccion = "";
  let estado = "bienvenida", t0 = Date.now(), tiempoFin = 0;
  let encontrados = [], efectos = [], msg = "", msgFin = 0, msgColor = "#4c9c3c";
  let secreto = false, calib = false, ultimo = "";

  // ============ Entrada ============
  const kd = (e) => {
    if (["Space", "Enter"].includes(e.code)) e.preventDefault();
    if (e.code === "KeyC" && !e.repeat) calib = !calib;
    if ((e.code === "Enter" || e.code === "Space") && !e.repeat) avanzar();
  };
  window.addEventListener("keydown", kd);
  canvas.addEventListener("click", clic);

  function avanzar() {
    const a = Date.now();
    if (estado === "bienvenida") estado = "instrucciones";
    else if (estado === "instrucciones") estado = "aviso";
    else if (estado === "aviso") { estado = "observa"; t0 = a; }
    else if (estado === "tiempo") { encontrados = []; efectos = []; estado = "observa"; t0 = a; }
    else if (estado === "tres") estado = "espera";
    else if (estado === "espera") { estado = "bonus"; t0 = a; }
    else if (estado === "secretoOK") estado = "resumen";
    else if (estado === "resumen") { detener(); alGanar(); }
  }

  const dentro = (r, mx, my, m = 0.015) => mx >= r.x - m && mx <= r.x + r.w + m && my >= r.y - m && my <= r.y + r.h + m;
  const aviso = (t, color) => { msg = t; msgColor = color; msgFin = Date.now() + 1000; };

  function clic(e) {
    const r = canvas.getBoundingClientRect();
    const mx = (e.clientX - r.left) / r.width, my = (e.clientY - r.top) / r.height;
    if (calib) { ultimo = `x: ${mx.toFixed(3)}  y: ${my.toFixed(3)}`; console.log(ultimo); return; }
    if (estado === "resumen") { avanzar(); return; }
    if (estado === "bonus" && dentro(SECRETO, mx, my, 0.01)) { secreto = true; estado = "secretoOK"; return; }
    if (estado !== "busca" || !zonas) return;
    const i = zonas.findIndex((z, j) => !encontrados.includes(j) && dentro(z, mx, my));
    if (i >= 0) {
      encontrados.push(i);
      const z = zonas[i];
      efectos.push({ x: (z.x + z.w / 2) * W, y: (z.y + z.h / 2) * H, t: Date.now() });
      aviso(`¡BIEN! ${encontrados.length}/${zonas.length}   MONEDAS +1`, "#4c9c3c");
      if (encontrados.length === zonas.length) { estado = "flash"; t0 = Date.now(); }
    } else {
      tiempoFin -= PENALIZACION * 1000;
      aviso(`NOPE  -${PENALIZACION}s`, "#ee3c28");
    }
  }

  // ============ Actualizar ============
  function actualizar() {
    const a = Date.now();
    if (!zonas && A.ok && B.ok) {
      try { zonas = ZONAS_MANUALES.length ? ZONAS_MANUALES : detectar(); }
      catch (err) { zonas = []; errorDeteccion = "Abre la página con Live Server (no con doble clic) o rellena ZONAS_MANUALES."; }
      if (!zonas.length && !errorDeteccion) errorDeteccion = "No detecto diferencias entre las dos imágenes. Rellena ZONAS_MANUALES.";
    }
    if (estado === "observa" && a - t0 > T_OBSERVA * 1000) { estado = "transicion"; t0 = a; }
    else if (estado === "transicion" && a - t0 > 1600) { estado = "busca"; tiempoFin = a + T_BUSCA * 1000; }
    else if (estado === "busca" && zonas && zonas.length && tiempoFin - a <= 0) estado = "tiempo";
    else if (estado === "flash" && a - t0 > 600) estado = "tres";
    else if (estado === "bonus" && a - t0 > 12000) estado = "resumen";
  }

  // ============ Dibujo ============
  function texto(t, y, c = "#f5f0d6", tam = 12, xx = W / 2, al = "center") {
    ctx.font = `${tam}px 'Press Start 2P', monospace`;
    ctx.fillStyle = c; ctx.textAlign = al; ctx.fillText(t, xx, y);
  }
  function pantalla(lineas) {
    ctx.fillStyle = "#1e2228"; ctx.fillRect(0, 0, W, H); UI.marco(ctx, W, H, "plaza");
    lineas.forEach((l, i) => texto(l, 80 + i * 38, i === 0 ? "#f08020" : "#f5f0d6", i === 0 ? 16 : 12));
  }
  function panel(t, xx, al) {
    ctx.fillStyle = "rgba(0,0,0,.65)"; ctx.fillRect(al === "left" ? xx : xx - 130, 8, 130, 24);
    texto(t, 26, "#f08020", 10, al === "left" ? xx + 8 : xx - 8, al);
  }
  function imagen(version) {
    if (!version.ok) { pantalla([version.err ? "NO ENCUENTRO LA IMAGEN" : "CARGANDO...", version.err ? `imagenes/${version.base}.jpg` : ""]); return; }
    ctx.drawImage(version.im, 0, 0, W, H);
  }
  function marcasYEfectos() {
    const a = Date.now();
    encontrados.forEach((j) => {
      const z = zonas[j];
      ctx.strokeStyle = "#4c9c3c"; ctx.lineWidth = 3; ctx.setLineDash([6, 4]);
      ctx.strokeRect(z.x * W - 4, z.y * H - 4, z.w * W + 8, z.h * H + 8); ctx.setLineDash([]);
    });
    efectos.forEach((f) => {
      const p = (a - f.t) / 700;
      if (p > 1) return;
      ctx.fillStyle = `rgba(242,201,30,${1 - p})`;
      for (let n = 0; n < 12; n++) {
        const ang = n * 0.52, r = p * 45;
        ctx.fillRect(Math.round((f.x + Math.cos(ang) * r) / 6) * 6, Math.round((f.y + Math.sin(ang) * r) / 6) * 6, 6, 6);
      }
    });
    if (a < msgFin) { ctx.fillStyle = "rgba(0,0,0,.75)"; ctx.fillRect(0, H - 40, W, 40); texto(msg, H - 15, msgColor, 14); }
  }
  function dibujar() {
    const a = Date.now(), N = zonas ? zonas.length : 3;
    if (estado === "bienvenida") pantalla(["BIENVENIDOS A SEVILLA.", "", "Pulsa ENTER"]);
    else if (estado === "instrucciones") pantalla(["CÓMO SE JUEGA", `Mira la imagen ${T_OBSERVA} segundos.`, "Después la escena cambiará:", "habrá 3 diferencias.", `Haz clic en ellas: tienes ${T_BUSCA} s.`, `Cada fallo te quita ${PENALIZACION} segundos.`, "Pulsa ENTER"]);
    else if (estado === "aviso") pantalla(["OBSERVAD BIEN.", `Tenéis ${T_OBSERVA} segundos.`, "", "Pulsa ENTER para empezar"]);
    else if (estado === "observa" || estado === "transicion") {
      imagen(A);
      if (estado === "observa") {
        const s = Math.max(0, T_OBSERVA - (a - t0) / 1000);
        panel(`OBSERVA ${Math.ceil(s)}`, 8, "left");
        ctx.fillStyle = "#f08020"; ctx.fillRect(0, H - 6, W * (s / T_OBSERVA), 6);
      } else {
        const p = (a - t0) / 1600, cols = 16, rows = 9, total = cols * rows;
        ctx.fillStyle = "#000";
        for (let n = 0; n < Math.min(total, p * 1.5 * total); n++) {
          const idx = (n * 37) % total;
          ctx.fillRect((idx % cols) * (W / cols), Math.floor(idx / cols) * (H / rows), W / cols + 1, H / rows + 1);
        }
        if (p > 0.45) texto("¡CAMBIO DE ESCENA!", H / 2, "#f08020", 18);
      }
    }
    else if (estado === "busca") {
      if (zonas && !zonas.length) { pantalla(["NO PUEDO CONTINUAR", ...errorDeteccion.match(/.{1,48}(\s|$)/g)]); }
      else {
        imagen(B); if (zonas) marcasYEfectos();
        panel(`MONEDAS ${encontrados.length}/${N}`, 8, "left");
        panel(`TIEMPO ${Math.max(0, Math.ceil((tiempoFin - a) / 1000))}`, W - 8, "right");
      }
    }
    else if (estado === "flash") { imagen(B); ctx.fillStyle = `rgba(255,255,255,${1 - (a - t0) / 600})`; ctx.fillRect(0, 0, W, H); texto(`¡${N}/${N}!`, H / 2, "#1e2228", 40); }
    else if (estado === "tres") pantalla(["¡PLAZA DE ESPAÑA COMPLETADA!", `${N}/${N} MONEDAS CONSEGUIDAS`, "", "Pulsa ENTER"]);
    else if (estado === "espera") pantalla(["ESPERA...", "Habéis encontrado las diferencias.", "Pero habéis pasado por alto algo.", "", "Pulsa ENTER"]);
    else if (estado === "bonus") {
      imagen(B);
      const sx = SECRETO.x * W, sy = SECRETO.y * H, sw = SECRETO.w * W, sh = SECRETO.h * H;
      ctx.fillStyle = "#f08020"; ctx.fillRect(sx, sy, sw, sh);
      ctx.strokeStyle = "#1e2228"; ctx.lineWidth = 2; ctx.strokeRect(sx, sy, sw, sh);
      texto("BI", sy + sh * 0.68, "#1e2228", Math.max(7, sh * 0.4), sx + sw / 2);
      ctx.fillStyle = "rgba(0,0,0,.7)"; ctx.fillRect(0, H - 40, W, 40);
      texto("BONUS SECRETO: ¿LO HABÉIS VISTO?", H - 15, "#f08020", 11);
    }
    else if (estado === "secretoOK") pantalla(["SECRETO DESCUBIERTO", "+1", "", "Pulsa ENTER"]);
    else if (estado === "tiempo") pantalla(["SE ACABÓ EL TIEMPO", "Observad de nuevo.", "", "Pulsa ENTER"]);
    else if (estado === "resumen") pantalla(["NIVEL 1 COMPLETADO", `MONEDAS: ${N}/${N}`, `SECRETOS: ${secreto ? 1 : 0}/1`, "PLAZA DE ESPAÑA", "NUEVO MUNDO: TRIANA", "[ CONTINUAR ]"]);

    if (calib) { // zonas en rojo, secreto en amarillo, y coordenadas del último clic
      ctx.lineWidth = 2; ctx.strokeStyle = "#ee3c28";
      (zonas || []).forEach((z) => ctx.strokeRect(z.x * W, z.y * H, z.w * W, z.h * H));
      ctx.strokeStyle = "#f2c91e"; ctx.strokeRect(SECRETO.x * W, SECRETO.y * H, SECRETO.w * W, SECRETO.h * H);
      ctx.fillStyle = "#000"; ctx.fillRect(0, H - 24, W, 24);
      texto("CALIBRAR (C para salir) " + ultimo, H - 8, "#ee3c28", 9);
    }
  }

  let raf;
  (function bucle() { actualizar(); dibujar(); raf = requestAnimationFrame(bucle); })();

  function detener() {
    cancelAnimationFrame(raf);
    window.removeEventListener("keydown", kd);
    canvas.removeEventListener("click", clic);
  }
  return detener;
}
