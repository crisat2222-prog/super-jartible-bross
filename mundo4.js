// MUNDO 4: Semana Santa (EL MISTERIO DE LA PROCESIÓN)
// Clic = investigar · Arrastrar o clic en las letras = ordenar · ENTER = avanzar · C = ver zonas (calibrar)
function iniciarMundo4(canvas, alGanar) {
  canvas.width = 640; canvas.height = 360;
  const ctx = canvas.getContext("2d"), W = canvas.width, H = canvas.height;

  // ============ LAS 7 PISTAS ============
  // Zonas en fracciones de la imagen (0 = izquierda/arriba, 1 = derecha/abajo). Cada pista puede tener varias zonas.
  const PISTAS = [
    { icono: "", nombre: "Cirios", concepto: "INTERÉS", letra: "I",
      zonas: [{ x: 0.335, y: 0.410, w: 0.085, h: 0.200 }],
      texto: ["En una procesión, una luz puede hacer que tu mirada se vaya directamente hacia ella.", "En marketing ocurre exactamente lo mismo.", "¿Qué queremos conseguir primero?"] },
    { icono: "", nombre: "Flores", concepto: "MEMORIA", letra: "M",
      zonas: [{ x: 0.280, y: 0.660, w: 0.280, h: 0.160 }, { x: 0.005, y: 0.640, w: 0.150, h: 0.150 }],
      texto: ["Hay imágenes que pasan delante de ti.", "Y hay imágenes que recuerdas días después.", "Una buena campaña busca exactamente eso."] },
    { icono: "", nombre: "Paso", concepto: "PASIÓN", letra: "P",
      zonas: [{ x: 0.000, y: 0.070, w: 0.500, h: 0.260 }],
      texto: ["¿Qué hace que miles de personas salgan a la calle año tras año por algo que sienten como suyo?"] },
    { icono: "", nombre: "Figura", concepto: "ATENCIÓN", letra: "A",   // en tu imagen no hay nazarenos: se usa la Virgen del paso
      zonas: [{ x: 0.100, y: 0.330, w: 0.145, h: 0.285 }],
      texto: ["Antes de conseguir que alguien recuerde una campaña, tienes que conseguir que la mire."] },
    { icono: "", nombre: "Giralda", concepto: "CONEXIÓN", letra: "C",
      zonas: [{ x: 0.547, y: 0.030, w: 0.070, h: 0.490 }],
      texto: ["Hay lugares que reconoces sin que nadie tenga que decirte dónde estás.", "Eso también es marketing."] },
    { icono: "", nombre: "Nubes", concepto: "TRADICIÓN", letra: "T",
      zonas: [{ x: 0.602, y: 0.052, w: 0.083, h: 0.072 }, { x: 0.811, y: 0.114, w: 0.140, h: 0.090 }, { x: 0.658, y: 0.228, w: 0.083, h: 0.072 }, { x: 0.093, y: 0.031, w: 0.105, h: 0.083 }],
      texto: ["Una tradición puede mantenerse durante siglos porque consigue adaptarse sin perder su esencia.", "Las marcas hacen lo mismo."] },
    { icono: "", nombre: "Edificios", concepto: "OPINIÓN", letra: "O",
      zonas: [{ x: 0.560, y: 0.550, w: 0.340, h: 0.260 }],
      texto: ["Cuando una experiencia genera conversación, deja de ser solamente una experiencia.", "Se convierte en algo que la gente comparte."] },
  ];
  const PALABRA = "IMPACTO";
  const FRASE_FINAL = ["En Semana Santa, una imagen puede detener una mirada, provocar una emoción y permanecer en la memoria.", "En marketing, también."];

  // ============ Imagen imagenes/semanasanta.* ============
  const ext = ["jpg", "jfif", "png", "jpeg", "webp"], img = new Image();
  let ei = 0, imgOk = false, imgErr = false;
  img.onload = () => (imgOk = true);
  img.onerror = () => { ei++; if (ei < ext.length) img.src = `imagenes/semanasanta.${ext[ei]}`; else imgErr = true; };
  img.src = `imagenes/semanasanta.${ext[0]}`;

  // ============ Estado ============
  let estado = "entrada", orden = [], modal = -1, hover = null, hoverPx = { x: 0, y: 0 };
  let calib = false, ultimo = "", err = "", errFin = 0;
  let fichas = [], drag = null;
  const SLOT = { x0: 76, y: 120, w: 56, gap: 16 }, BAND = { y: 240 };
  const slotX = (i) => SLOT.x0 + i * (SLOT.w + SLOT.gap);

  // ============ Utilidades ============
  const dentro = (r, mx, my, m = 0.004) => mx >= r.x - m && mx <= r.x + r.w + m && my >= r.y - m && my <= r.y + r.h + m;
  const pistaEn = (mx, my) => PISTAS.findIndex((p) => p.zonas.some((z) => dentro(z, mx, my)));
  const pos = (e) => { const r = canvas.getBoundingClientRect(); return { fx: (e.clientX - r.left) / r.width, fy: (e.clientY - r.top) / r.height, px: (e.clientX - r.left) * W / r.width, py: (e.clientY - r.top) * H / r.height }; };
  const barajar = (a) => a.map((v) => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);

  function prepararPuzzle() {
    let letras;
    do { letras = barajar(PALABRA.split("")); } while (letras.join("") === PALABRA);
    fichas = letras.map((L, i) => ({ L, slot: -1, x: slotX(i), y: BAND.y }));
    drag = null; err = "";
  }
  const posFicha = (f) => (f.slot >= 0 ? { x: slotX(f.slot), y: SLOT.y } : { x: f.hx ?? f.x, y: BAND.y });
  fichas.forEach(() => {});

  // ============ Entrada ============
  const kd = (e) => {
    if (["Space", "Enter"].includes(e.code)) e.preventDefault();
    if (e.code === "KeyC" && !e.repeat) calib = !calib;
    if ((e.code === "Enter" || e.code === "Space") && !e.repeat) avanzar();
  };
  const md = (e) => {
    if (estado !== "puzzle") return;
    const { px, py } = pos(e);
    for (let i = fichas.length - 1; i >= 0; i--) {
      const f = fichas[i], p = posFicha(f);
      if (px >= p.x && px <= p.x + SLOT.w && py >= p.y && py <= p.y + SLOT.w) { drag = { f, ox: px - p.x, oy: py - p.y, sx: px, sy: py, x: p.x, y: p.y, mov: false }; return; }
    }
  };
  const mm = (e) => {
    const { fx, fy, px, py } = pos(e); hover = { x: fx, y: fy }; hoverPx = { x: px, y: py };
    if (drag) { drag.x = px - drag.ox; drag.y = py - drag.oy; if (Math.hypot(px - drag.sx, py - drag.sy) > 5) drag.mov = true; }
    canvas.style.cursor = (estado === "juego" && modal < 0 && pistaEn(fx, fy) >= 0) || estado === "puzzle" ? "pointer" : "default";
  };
  const mu = (e) => {
    if (!drag) return;
    const { px, py } = pos(e), f = drag.f;
    if (!drag.mov) { // clic simple: colocar en el primer hueco / devolver
      if (f.slot >= 0) f.slot = -1;
      else { const libre = [...Array(7).keys()].find((s) => !fichas.some((o) => o.slot === s)); if (libre !== undefined) f.slot = libre; }
    } else {
      const s = [...Array(7).keys()].find((i) => px >= slotX(i) && px <= slotX(i) + SLOT.w && py >= SLOT.y - 10 && py <= SLOT.y + SLOT.w + 10);
      if (s !== undefined) { const o = fichas.find((x) => x.slot === s && x !== f); if (o) o.slot = -1; f.slot = s; }
      else f.slot = -1;
    }
    drag = null;
    if (fichas.every((x) => x.slot >= 0)) {
      const palabra = [...fichas].sort((a, b) => a.slot - b.slot).map((x) => x.L).join("");
      if (palabra === PALABRA) estado = "completado";
      else { err = "ESAS LETRAS NO FORMAN LA PALABRA"; errFin = Date.now() + 1400; setTimeout(() => { if (estado === "puzzle") fichas.forEach((x) => (x.slot = -1)); }, 1400); }
    }
  };
  window.addEventListener("keydown", kd);
  canvas.addEventListener("click", clic);
  canvas.addEventListener("mousedown", md);
  canvas.addEventListener("mousemove", mm);
  window.addEventListener("mouseup", mu);

  function cerrarModal() { modal = -1; if (orden.length === 7) { estado = "intro7"; prepararPuzzle(); } }
  function avanzar() {
    if (estado === "entrada") estado = "juego";
    else if (estado === "juego" && modal >= 0) cerrarModal();
    else if (estado === "intro7") estado = "puzzle";
    else if (estado === "completado") estado = "final1";
    else if (estado === "final1") estado = "final2";
    else if (estado === "final2") { detener(); alGanar(); }
  }
  function clic(e) {
    const { fx, fy } = pos(e);
    if (calib) { ultimo = `x: ${fx.toFixed(3)}  y: ${fy.toFixed(3)}`; console.log(ultimo); return; }
    if (["entrada", "intro7", "completado", "final1", "final2"].includes(estado)) { avanzar(); return; }
    if (estado === "juego") {
      if (modal >= 0) { cerrarModal(); return; }
      const i = pistaEn(fx, fy);
      if (i >= 0) { modal = i; if (!orden.includes(i)) orden.push(i); }
    }
  }

  // ============ Dibujo ============
  function texto(t, y, c = "#f5f0d6", tam = 12, xx = W / 2, al = "center") {
    ctx.font = `${tam}px 'Press Start 2P', monospace`;
    ctx.fillStyle = c; ctx.textAlign = al; ctx.fillText(t, xx, y);
  }
  function envolver(t, ancho, tam) {
    ctx.font = `${tam}px 'Press Start 2P', monospace`;
    const out = []; let l = "";
    t.split(" ").forEach((w) => { const s = l ? l + " " + w : w; if (ctx.measureText(s).width > ancho && l) { out.push(l); l = w; } else l = s; });
    if (l) out.push(l); return out;
  }
  function fondo() {
    if (imgOk) ctx.drawImage(img, 0, 0, W, H);
    else { ctx.fillStyle = "#1e2228"; ctx.fillRect(0, 0, W, H); texto(imgErr ? "NO ENCUENTRO imagenes/semanasanta.jpg" : "CARGANDO...", H / 2, "#f5f0d6", 11); }
  }
  function velo(a = 0.72) { ctx.fillStyle = `rgba(30,34,40,${a})`; ctx.fillRect(0, 0, W, H); }
  function pantalla(lineas, c = "#1e2228") { ctx.fillStyle = c; ctx.fillRect(0, 0, W, H); if (c !== "#000") UI.marco(ctx, W, H, "semana"); lineas.forEach((l, i) => texto(l, 62 + i * 32, i === 0 ? "#f08020" : "#f5f0d6", i === 0 ? 16 : 11)); }
  function barra() {
    ctx.fillStyle = "rgba(0,0,0,.72)"; ctx.fillRect(0, 0, W, 28);
    texto("MISTERIO", 19, "#f08020", 10, 10, "left");
    texto(`PISTAS: ${orden.length}/7`, 19, "#f08020", 10, W - 10, "right");
  }
  function ventanaPista(i) {
    const P = PISTAS[i], x = 40, y = 26, w = 560, h = 308;
    ctx.fillStyle = "#263640"; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#f08020"; ctx.lineWidth = 4; ctx.strokeRect(x, y, w, h); UI.caja(ctx, x, y, w, h, "semana");
    texto(`PISTA 0${i + 1}`, y + 32, "#f08020", 14);
    let cy = y + 66;
    P.texto.forEach((par) => { envolver(par, w - 50, 9).forEach((l) => { texto(l, cy, "#f5f0d6", 9); cy += 17; }); cy += 8; });
    texto(P.concepto, y + h - 88, "#f2c91e", 20);
    texto("Aparece:", y + h - 46, "#f5f0d6", 10, W / 2 - 36, "right");
    ctx.fillStyle = "#34578a"; ctx.fillRect(W / 2 - 26, y + h - 70, 40, 36);
    ctx.strokeStyle = "#f5f0d6"; ctx.lineWidth = 2; ctx.strokeRect(W / 2 - 26, y + h - 70, 40, 36);
    texto(P.letra, y + h - 42, "#f2c91e", 20, W / 2 - 6);
    texto("[ CERRAR ]", y + h - 12, "#f5f0d6", 9);
  }
  function brillo(z) {
    const p = (Date.now() % 800) / 800, a = 0.5 + 0.5 * Math.sin(p * Math.PI * 2);
    ctx.fillStyle = "rgba(255,230,120,.16)"; ctx.fillRect(z.x * W, z.y * H, z.w * W, z.h * H);
    ctx.strokeStyle = `rgba(255,230,120,${a})`; ctx.lineWidth = 3; ctx.strokeRect(z.x * W, z.y * H, z.w * W, z.h * H);
  }
  function ficha(L, x, y, c = "#34578a") {
    ctx.fillStyle = c; ctx.fillRect(x, y, SLOT.w, SLOT.w);
    ctx.strokeStyle = "#f5f0d6"; ctx.lineWidth = 3; ctx.strokeRect(x, y, SLOT.w, SLOT.w);
    texto(L, y + 38, "#f5f0d6", 24, x + SLOT.w / 2);
  }

  function dibujar() {
    const a = Date.now();
    if (estado === "final1") { pantalla(["Habéis recorrido Sevilla.", "", "Habéis observado.", "Habéis pensado.", "Habéis reaccionado.", "", "Pero todavía falta", "una última prueba."], "#000"); return; }
    if (estado === "final2") { pantalla(["MUNDO FINAL", "LA GIRALDA", "", "Esta vez necesitarás todo", "lo que has aprendido.", "", "[ CONTINUAR ]"], "#000"); return; }

    fondo();
    if (estado === "entrada") {
      velo(0.78);
      texto("MUNDO 4 — SEMANA SANTA", 62, "#f08020", 14);
      texto("EL MISTERIO", 98, "#f2c91e", 22);
      ["Hay algo que hace que una imagen", "no se olvide.", "", "En esta escena hay 7 pistas.", "Encontradlas todas y descubrid", "qué tienen en común."].forEach((l, i) => texto(l, 142 + i * 24, "#f5f0d6", 10));
      texto("[ COMENZAR ]", 318, "#f5f0d6", 13);
    }
    else if (estado === "juego") {
      barra();
      orden.forEach((i) => { // distintivo sobre lo ya encontrado
        const z = PISTAS[i].zonas[0], cx = (z.x + z.w / 2) * W, cy = (z.y + z.h / 2) * H;
        ctx.fillStyle = "#f2c91e"; ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.fill();
        texto(PISTAS[i].letra, cy + 5, "#1e2228", 14, cx);
      });
      if (modal < 0 && hover) { const i = pistaEn(hover.x, hover.y); if (i >= 0 && !orden.includes(i)) PISTAS[i].zonas.forEach(brillo); }
      if (modal >= 0) ventanaPista(modal);
    }
    else if (estado === "intro7") {
      velo(0.82);
      texto("PISTAS COMPLETADAS: 7/7", 62, "#f2c91e", 15);
      texto(fichas.map((f) => f.L).join(" — "), 118, "#f08020", 20); // desordenadas
      ["Habéis encontrado 7 conceptos.", "Ahora ordenadlos.", "", "¿Qué palabra forman sus iniciales?"].forEach((l, i) => texto(l, 176 + i * 26, "#f5f0d6", 11));
      texto("Pulsa ENTER", 318, "#f5f0d6", 10);
    }
    else if (estado === "puzzle") {
      velo(0.9);
      texto("¿QUÉ PALABRA FORMAN SUS INICIALES?", 44, "#f08020", 12);
      texto("Arrastra las letras (o haz clic en ellas)", 70, "#f5f0d6", 9);
      for (let i = 0; i < 7; i++) { ctx.fillStyle = "#263640"; ctx.fillRect(slotX(i), SLOT.y, SLOT.w, SLOT.w); ctx.strokeStyle = "#f08020"; ctx.lineWidth = 3; ctx.strokeRect(slotX(i), SLOT.y, SLOT.w, SLOT.w); }
      fichas.forEach((f) => { if (f !== (drag && drag.f)) { const p = posFicha(f); ficha(f.L, p.x, p.y); } });
      if (drag) ficha(drag.f.L, drag.x, drag.y, "#c41e3a");
      if (a < errFin) texto(err, 330, "#ee3c28", 10);
    }
    else if (estado === "completado") {
      velo(0.9);
      texto("IMPACTO", 80, "#f2c91e", 36);
      let cy = 130;
      FRASE_FINAL.forEach((par) => { envolver(par, 540, 10).forEach((l) => { texto(l, cy, "#f5f0d6", 10); cy += 20; }); cy += 10; });
      texto("MUNDO 4 COMPLETADO", 310, "#4c9c3c", 16);
    }

    if (calib) { // zonas en rojo y coordenadas del último clic
      ctx.lineWidth = 2; ctx.strokeStyle = "#ee3c28";
      PISTAS.forEach((p) => p.zonas.forEach((z) => ctx.strokeRect(z.x * W, z.y * H, z.w * W, z.h * H)));
      ctx.fillStyle = "#000"; ctx.fillRect(0, H - 24, W, 24);
      texto("CALIBRAR (C para salir) " + ultimo, H - 8, "#ee3c28", 9);
    }
  }

  let raf;
  (function bucle() { dibujar(); raf = requestAnimationFrame(bucle); })();

  function detener() {
    cancelAnimationFrame(raf);
    canvas.style.cursor = "default";
    window.removeEventListener("keydown", kd);
    window.removeEventListener("mouseup", mu);
    canvas.removeEventListener("click", clic);
    canvas.removeEventListener("mousedown", md);
    canvas.removeEventListener("mousemove", mm);
  }
  return detener;
}
