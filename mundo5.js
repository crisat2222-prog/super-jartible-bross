// MUNDO 5: La Giralda (EL ÚLTIMO RETO)
// Clic = elegir · ENTER = continuar
function iniciarMundo5(canvas, alGanar) {
  canvas.width = 640; canvas.height = 440; // la foto de la Giralda es casi 1.45:1
  const ctx = canvas.getContext("2d"), W = canvas.width, H = canvas.height;

  // ============ DATOS DE CONTACTO (cámbialos aquí) ============
  const CONTACTO = { nombre: "Cristina Arias", linkedin: "https://www.linkedin.com/in/cristina-arias-tena-9bb550435", email: "crisat2222@gmail.com", telefono: "711 797 327", asunto: "Candidatura: Cristina Arias" };

  // ============ Contenido ============
  const INVENTARIO = [
    { icono: "", nombre: "Pieza de Plaza de España", concepto: "OBSERVAR", texto: ["Antes de actuar hay que saber mirar.", "Detectar lo que otros pasan por alto."] },
    { icono: "", nombre: "Pieza de Triana", concepto: "RESOLVER", texto: ["No siempre existe una respuesta evidente.", "Hay que conectar las pistas."] },
    { icono: "", nombre: "Farolillo de Feria", concepto: "REACCIONAR", texto: ["Las oportunidades no siempre esperan.", "Hay que saber reaccionar a tiempo."] },
    { icono: "", nombre: "Palabra: IMPACTO", concepto: "CONECTAR", texto: ["Una buena idea no solo llama la atención.", "Hace que algo se quede contigo."] },
  ];
  // "ok" = posición de la respuesta correcta en la lista original (después se mezclan al mostrarlas)
  const PREGUNTAS = {
    p1: { titulo: "OBSERVAR + RESOLVER + REACCIONAR + CONECTAR", texto: ["¿Qué hacen estas cuatro cosas juntas?"],
          opciones: ["Seguir instrucciones", "Crear una idea", "Pasar de nivel"], ok: 1, sig: "ok1", veil: 0.8 },
    brief: { titulo: "BRIEF FINAL", texto: ["Tenéis una misión.", "Hay alguien que quiere conseguir algo de vosotros.", "Pero no quiere hacerlo de la manera habitual.", "No quiere limitarse a enviaros un CV.", "Quiere conseguir que recordéis su candidatura.", "¿Cómo lo haríais?"],
          opciones: ["Enviar un CV por email con una carta de presentación convencional.", "Enviar un mensaje explicando por qué quiere trabajar en By Influence.", "Crear una experiencia que os haga interactuar con su candidatura antes de saber quién está detrás."], ok: 2, sig: "ok2", veil: 0.88 },
    p3: { titulo: "", texto: ["Pero todavía falta una cosa.", "Una experiencia no termina cuando alguien participa.", "Tiene que conseguir que algo ocurra después.", "¿Qué debería conseguir esta?"],
          opciones: ["Que la archiven", "Que la recuerden", "Que pasen a la siguiente"], ok: 1, sig: "ok3", veil: 0.5 },
    ultima: { titulo: "ÚLTIMA PREGUNTA", texto: ["Después de cinco mundos...", "¿Qué creéis que había realmente detrás de todo esto?"],
          opciones: ["Un reto diseñado para entreteneros.", "Una demostración de cómo convertir una idea en una experiencia.", "Una campaña para By Influence."], ok: 1, sig: "ok4", veil: 0.85 },
  };
  const FEEDBACK = {
    ok1: { lineas: ["CORRECTO."], sig: "brief" },
    ok2: { lineas: ["CORRECTO.", "", "Habéis entendido el reto.", "Pero todavía no termina."], sig: "p3" },
    ok3: { lineas: ["EXACTO.", "", "Porque si una idea consigue que alguien", "participe, la recuerde y quiera saber", "qué hay detrás...", "", "ha conseguido su objetivo."], sig: "unir" },
    ok4: { lineas: ["CORRECTO.", "", "Aunque todavía os falta una pieza."], sig: "negro" },
  };
  const PAGINAS = [
    { titulo: "GAME COMPLETE", lineas: ["Habéis jugado.", "Habéis resuelto.", "Habéis llegado hasta el final", "sin saber exactamente para qué."] },
    { titulo: "", lineas: ["Soy Cristina.", "Graduada en Marketing e", "Investigación de Mercados.", "", "Y en lugar de mandaros otro CV más...", "preferí hacer esto.", "", "Porque quería que antes de leer", "mi candidatura pudierais vivirla."] },
    { titulo: "MI OBJETIVO REAL ERA MUCHO MÁS SENCILLO:", lineas: ["CONSEGUIR UNA ENTREVISTA", "CON BY INFLUENCE."], golpe: true },
  ];

  // ============ Imagen imagenes/giralda.* ============
  const ext = ["jpg", "jfif", "png", "jpeg", "webp"], img = new Image();
  let ei = 0, imgOk = false, imgErr = false;
  img.onload = () => (imgOk = true);
  img.onerror = () => { ei++; if (ei < ext.length) img.src = `imagenes/giralda.${ext[ei]}`; else imgErr = true; };
  img.src = `imagenes/giralda.${ext[0]}`;

  // ============ Estado ============
  let estado = "entrada", t0 = Date.now(), abiertos = [], modal = -1, pag = 0, ord = [], msg = "", msgFin = 0;
  let hits = [], mouse = { x: -1, y: -1 };
  const barajar = (a) => a.map((v) => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
  function ir(e) { estado = e; t0 = Date.now(); if (PREGUNTAS[e]) ord = barajar(PREGUNTAS[e].opciones.map((_, i) => i)); }
  const aviso = (t, ms = 1300) => { msg = t; msgFin = Date.now() + ms; };

  // ============ Entrada ============
  const kd = (e) => { if (["Space", "Enter"].includes(e.code)) { e.preventDefault(); if (!e.repeat) avanzar(); } };
  const mm = (e) => {
    const r = canvas.getBoundingClientRect();
    mouse = { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height };
    canvas.style.cursor = hits.some((h) => sobre(h)) ? "pointer" : "default";
  };
  const clic = () => { const h = hits.find((b) => sobre(b)); if (h) h.fn(); else if (!["inventario", "p1", "brief", "p3", "ultima", "entrada", "reto", "entrevista"].includes(estado)) avanzar(); };
  const sobre = (b) => mouse.x >= b.x && mouse.x <= b.x + b.w && mouse.y >= b.y && mouse.y <= b.y + b.h;
  window.addEventListener("keydown", kd);
  canvas.addEventListener("click", clic);
  canvas.addEventListener("mousemove", mm);

  function avanzar() {
    if (estado === "entrada") ir("inventario");
    else if (estado === "inventario" && modal >= 0) cerrarModal();
    else if (FEEDBACK[estado]) ir(FEEDBACK[estado].sig);
    else if (estado === "unir") ir("solo");
    else if (estado === "solo") ir("ultima");
    else if (estado === "negro") { pag = 0; ir("pagina"); }
    else if (estado === "pagina") { if (pag < PAGINAS.length - 1) { pag++; t0 = Date.now(); } else ir("reto"); }
    else if (estado === "reto") ir("entrevista");
  }
  function cerrarModal() { modal = -1; if (abiertos.length === 4) ir("p1"); }
  function copiar() {
    try { navigator.clipboard.writeText(CONTACTO.email).then(() => aviso("Email copiado", 1800)).catch(() => aviso(CONTACTO.email, 3000)); }
    catch (e) { aviso(CONTACTO.email, 3000); }
  }
  function terminar() { detener(); alGanar(); }

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
    else { ctx.fillStyle = "#1e2228"; ctx.fillRect(0, 0, W, H); texto(imgErr ? "NO ENCUENTRO imagenes/giralda.jpg" : "CARGANDO...", H / 2, "#f5f0d6", 11); }
  }
  const velo = (a) => { ctx.fillStyle = `rgba(30,34,40,${a})`; ctx.fillRect(0, 0, W, H); };
  function boton(x, y, w, h, fn, fill = "#34578a") {
    hits.push({ x, y, w, h, fn });
    const hov = sobre({ x, y, w, h });
    ctx.fillStyle = hov ? "#f08020" : fill; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#f5f0d6"; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h);
    return hov;
  }
  function etiqueta(t, x, y, w, h, tam = 11, fill = "#c41e3a") {
    const hov = boton(x, y, w, h, null, fill);
    texto(t, y + h / 2 + tam / 2 - 1, hov ? "#1e2228" : "#f5f0d6", tam, x + w / 2);
  }
  function bloque(titulo, lineas, y0, c = "#f5f0d6") { // texto centrado con título; devuelve la y final
    let y = y0;
    if (titulo) { envolver(titulo, 580, 13).forEach((l) => { texto(l, y, "#f08020", 13); y += 22; }); y += 8; }
    lineas.forEach((p) => { if (p === "") { y += 10; return; } envolver(p, 560, 9).forEach((l) => { texto(l, y, c, 9); y += 16; }); y += 4; });
    return y;
  }
  function pregunta(q) {
    velo(q.veil);
    let y = bloque(q.titulo, q.texto, 50) + 8;
    ord.forEach((idx, pos) => {
      const lineas = envolver(q.opciones[idx], 500, 9), h = 22 + lineas.length * 15, x = 50, w = W - 100;
      const hov = boton(x, y, w, h, () => { if (idx === q.ok) ir(q.sig); else aviso("Pensadlo de nuevo"); });
      texto("ABC"[pos] + ".", y + h / 2 + 4, hov ? "#1e2228" : "#f08020", 12, x + 14, "left");
      lineas.forEach((l, i) => texto(l, y + 20 + i * 15, hov ? "#1e2228" : "#f5f0d6", 9, x + 46, "left"));
      y += h + 12;
    });
    if (Date.now() < msgFin) texto(msg, H - 18, "#ee3c28", 11);
  }

  function dibujar() {
    hits = [];
    const a = Date.now(), el = a - t0;

    // ---------- Estética "limpia" del final ----------
    if (estado === "negro") {
      ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
      if (el > 3000) { const t = "¿QUIÉN HA DISEÑADO LA EXPERIENCIA?", n = Math.min(t.length, Math.floor((el - 3000) / 90)); texto(t.slice(0, n), H / 2, "#f5f0d6", 13); }
      if (el > 9000) avanzar();
      return;
    }
    if (estado === "pagina" || estado === "reto" || estado === "entrevista") {
      ctx.fillStyle = "#14171a"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#f08020"; ctx.fillRect(40, 30, W - 80, 3); ctx.fillRect(40, H - 33, W - 80, 3);
      ctx.globalAlpha = Math.min(1, el / 700);
      if (estado === "pagina") {
        const P = PAGINAS[pag]; let y = P.golpe ? 130 : 90;
        if (P.titulo) envolver(P.titulo, 580, P.golpe ? 12 : 22).forEach((l) => { texto(l, y, P.golpe ? "#f5f0d6" : "#f08020", P.golpe ? 12 : 22); y += 34; });
        y += 14;
        P.lineas.forEach((l) => { if (l === "") { y += 12; return; } texto(l, y, P.golpe ? "#f2c91e" : "#f5f0d6", P.golpe ? 16 : 11); y += P.golpe ? 30 : 24; });
        texto("Pulsa ENTER", H - 50, "#a8a28a", 9);
      } else if (estado === "reto") {
        texto("¿ACEPTÁIS EL ÚLTIMO RETO?", 120, "#f08020", 18);
        texto("CONOCERNOS EN UNA ENTREVISTA", 180, "#f5f0d6", 13);
        etiqueta("ACEPTAR EL RETO", W / 2 - 150, 250, 300, 50, 13, "#c41e3a");
        hits[hits.length - 1].fn = () => ir("entrevista");
      } else {
        texto("NIVEL DESBLOQUEADO", 80, "#f08020", 13);
        texto("ENTREVISTA", 128, "#f2c91e", 32);
        texto(CONTACTO.nombre, 190, "#f5f0d6", 18);
        texto("Marketing · Creatividad · Comunicación", 220, "#ccc6b0", 10);
        etiqueta("HABLAMOS", W / 2 - 130, 255, 260, 50, 16, "#c41e3a");
        hits[hits.length - 1].fn = () => { window.open(CONTACTO.linkedin, "_blank", "noopener"); }; // abre tu LinkedIn en otra pestaña
        etiqueta("COPIAR EMAIL", W / 2 - 100, 318, 200, 30, 9, "#34578a");
        hits[hits.length - 1].fn = copiar;
        texto(`${CONTACTO.email}   ·   ${CONTACTO.telefono}`, 376, "#f5f0d6", 10);
        etiqueta("VOLVER AL INICIO", W / 2 - 90, H - 62, 180, 24, 8, "#5a7a88");
        hits[hits.length - 1].fn = terminar;
        if (a < msgFin) texto(msg, 352, "#4c9c3c", 10);
      }
      ctx.globalAlpha = 1;
      return;
    }

    // ---------- Con la imagen de la Giralda ----------
    fondo();
    if (estado === "entrada") {
      velo(0.8);
      texto("MUNDO 5 — LA GIRALDA", 70, "#f08020", 16);
      ["Habéis llegado hasta aquí.", "", "Pero ninguna de las pruebas", "anteriores era independiente.", "", "Cada una os ha dado una pieza.", "", "Ahora tendréis que descubrir", "para qué sirven."].forEach((l, i) => texto(l, 120 + i * 24, "#f5f0d6", 10));
      etiqueta("ACEPTAR EL ÚLTIMO RETO", W / 2 - 170, 360, 340, 46, 12, "#c41e3a");
      hits[hits.length - 1].fn = () => ir("inventario");
    }
    else if (estado === "inventario") {
      ctx.fillStyle = "rgba(30,34,40,.78)"; ctx.fillRect(0, 0, W, 86);
      texto("No habéis llegado hasta aquí solo para coleccionarlas.", 36, "#f5f0d6", 10);
      texto("¿Qué tienen en común?", 62, "#f2c91e", 12);
      ctx.fillStyle = "rgba(30,34,40,.85)"; ctx.fillRect(0, H - 128, W, 128);
      texto("VUESTRO INVENTARIO", H - 108, "#f08020", 10);
      INVENTARIO.forEach((it, i) => {
        const x = 22 + i * 152, y = H - 96, w = 140, h = 84;
        const hov = boton(x, y, w, h, () => { if (modal < 0) { modal = i; if (!abiertos.includes(i)) abiertos.push(i); } });
        const ls = envolver(it.nombre, w - 16, 9);
        ls.forEach((l, k) => texto(l, y + h / 2 + 4 - (ls.length - 1) * 8 + k * 16, hov ? "#1e2228" : "#f5f0d6", 9, x + w / 2));
        if (abiertos.includes(i) && modal !== i) texto("OK", y + 16, "#f2c91e", 14, x + w - 14);
      });
      if (modal >= 0) {
        hits = [{ x: 0, y: 0, w: W, h: H, fn: cerrarModal }];
        const it = INVENTARIO[modal], x = 60, y = 90, w = 520, h = 250;
        ctx.fillStyle = "#263640"; ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = "#f08020"; ctx.lineWidth = 4; ctx.strokeRect(x, y, w, h); UI.caja(ctx, x, y, w, h, "giralda");
        texto(`${it.nombre}`, y + 34, "#f5f0d6", 11);
        texto(it.concepto, y + 90, "#f2c91e", 28);
        it.texto.forEach((l, i) => texto(l, y + 142 + i * 26, "#f5f0d6", 10));
        texto("[ CERRAR ]", y + h - 18, "#f5f0d6", 10);
      }
    }
    else if (PREGUNTAS[estado]) pregunta(PREGUNTAS[estado]);
    else if (FEEDBACK[estado]) {
      velo(0.85);
      const F = FEEDBACK[estado]; let y = 140;
      F.lineas.forEach((l, i) => { if (l === "") { y += 14; return; } texto(l, y, i === 0 ? "#4c9c3c" : "#f5f0d6", i === 0 ? 26 : 10); y += i === 0 ? 40 : 22; });
      texto("Pulsa ENTER", H - 30, "#ccc6b0", 9);
    }
    else if (estado === "unir") {
      velo(0.85);
      const fila1 = ["OBSERVAR", "RESOLVER", "REACCIONAR", "CONECTAR"], fila2 = ["UNA IDEA", "UNA EXPERIENCIA", "UNA REACCIÓN"];
      const pasos = (f, t) => f.slice(0, Math.min(f.length, 1 + Math.floor(t / 600))).join("  →  ");
      if (el < 4000) texto(pasos(fila1, el), H / 2, "#f08020", 13);
      else if (el < 8000) texto(pasos(fila2, el - 4000), H / 2, "#f2c91e", 15);
      if (el > 9000) avanzar(); // sin "¿quién ha diseñado todo esto?": esa pregunta solo sale en la pantalla negra
    }
    else if (estado === "solo") { if (el > 4000) avanzar(); } // solo la imagen de la Giralda
  }

  let raf;
  (function bucle() { dibujar(); raf = requestAnimationFrame(bucle); })();

  function detener() {
    cancelAnimationFrame(raf);
    canvas.style.cursor = "default";
    window.removeEventListener("keydown", kd);
    canvas.removeEventListener("click", clic);
    canvas.removeEventListener("mousemove", mm);
    canvas.width = 640; canvas.height = 360; // tamaño estándar
  }
  return detener;
}
