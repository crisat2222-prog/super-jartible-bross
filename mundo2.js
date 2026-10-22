// MUNDO 2: Triana (EL CÓDIGO DEL RÍO)
// ENTER = avanzar · Clic = investigar · Números = teclear el código · C = ver zonas (calibrar)
function iniciarMundo2(canvas, alGanar) {
  canvas.width = 640; canvas.height = 360; // 16:9, igual que el resto de mundos
  const ctx = canvas.getContext("2d"), W = canvas.width, H = canvas.height;
  const TACTIL = window.matchMedia("(pointer: coarse)").matches; // true solo en móvil y tablet
  // La foto de Triana se ve entera (sin recortar) y centrada; a los lados queda un fondo difuminado.
  // Las zonas siguen en fracciones de la foto; R() las pasa a píxeles del lienzo.
  let ox = 0, dw = W; // ox = hueco a la izquierda, dw = ancho con el que se dibuja la foto
  const R = (z) => [ox + z.x * dw, z.y * H, z.w * dw, z.h * H];
  const CODIGO = "231";

  // ============ ZONAS (fracciones de la imagen: 0 = izquierda/arriba, 1 = derecha/abajo) ============
  const PISTAS = [
    { titulo: "PISTA 01", texto: ["Busca a los pequeños", "habitantes del río."], num: "2", ordinal: "primer",
      icono: "", extra: [],
      lugar: [{ x: 0.108, y: 0.670, w: 0.028, h: 0.112 }],   // panel amarillo izquierdo del puente
      resp:  [{ x: 0.057, y: 0.772, w: 0.064, h: 0.045 }] },  // los dos patos
    { titulo: "PISTA 02", texto: ["Ahora mira al cielo.", "No busques aves."], num: "3", ordinal: "segundo",
      icono: "", extra: ["Has encontrado los tres."],
      lugar: [{ x: 0.457, y: 0.440, w: 0.104, h: 0.230 }],   // edificio amarillo del fondo
      resp:  [{ x: 0.119, y: 0.070, w: 0.058, h: 0.060 },     // nube 1
              { x: 0.333, y: 0.108, w: 0.112, h: 0.058 },     // nube 2
              { x: 0.578, y: 0.070, w: 0.084, h: 0.060 }] },  // nube 3
    { titulo: "PISTA 03", texto: ["La última respuesta", "vigila Triana desde", "arriba."], num: "1", ordinal: "tercer",
      icono: "", extra: ["Hay una."],
      lugar: [{ x: 0.755, y: 0.450, w: 0.050, h: 0.220 }],   // edificio cerca de la torre
      resp:  [{ x: 0.843, y: 0.190, w: 0.080, h: 0.210 }] }, // la torre ("la Giralda")
  ];
  const SECRETO = { x: 0.551, y: 0.700, w: 0.025, h: 0.090 }; // azulejo del puente que brilla

  // ============ Imagen imagenes/triana.* ============
  const ext = ["jpg", "png", "jpeg", "webp"], img = new Image();
  let ei = 0, imgOk = false, imgErr = false;
  img.onload = () => { dw = Math.min(W, H * img.naturalWidth / img.naturalHeight); ox = (W - dw) / 2; imgOk = true; };
  img.onerror = () => { ei++; if (ei < ext.length) img.src = `imagenes/triana.${ext[ei]}`; else imgErr = true; };
  img.src = `imagenes/triana.${ext[0]}`;

  // ============ Estado ============
  let estado = "entrada", t0 = 0, paso = 0, fase = "pista";
  let numeros = [], entrada = "", vidas = 3, msgs = [], aviso = "", avisoFin = 0;
  let secreto = false, calib = false, ultimo = "";
  const BTN = TACTIL ? { x: 70, y: 252, w: 212, h: 38 } : { x: W / 2 - 80, y: H / 2 + 62, w: 160, h: 34 }; // botón ABRIR
  const TECLAS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "<", "0", "OK"];
  const tecla = (i) => ({ x: 330 + (i % 3) * 86, y: 90 + Math.floor(i / 3) * 52, w: 80, h: 46 });

  function reiniciar() { estado = "juego"; paso = 0; fase = "pista"; numeros = []; entrada = ""; vidas = 3; msgs = []; secreto = false; }

  // ============ Entrada ============
  const kd = (e) => {
    if (["Space", "Enter", "Backspace"].includes(e.code)) e.preventDefault();
    if (e.code === "KeyC" && !e.repeat && estado !== "caja") calib = !calib;
    if (estado === "caja") {
      if (/^[0-9]$/.test(e.key) && entrada.length < 3) entrada += e.key;
      else if (e.code === "Backspace") entrada = entrada.slice(0, -1);
    }
    if ((e.code === "Enter" || e.code === "Space") && !e.repeat) avanzar();
  };
  window.addEventListener("keydown", kd);
  canvas.addEventListener("click", clic);
  let hover = null, ayudaFin = 0; // ayudaFin: hasta cuándo brillan las pistas tras pulsar AYUDA (móvil)
  const mm = (e) => {
    const r = canvas.getBoundingClientRect();
    hover = { x: ((((e.clientX - r.left) / r.width) * W) - ox) / dw, y: (e.clientY - r.top) / r.height };
    const z = objetivo(); canvas.style.cursor = z && z.some((q) => dentro(q, hover.x, hover.y)) ? "pointer" : "default";
  };
  canvas.addEventListener("mousemove", mm);
  // zonas que se pueden pulsar ahora mismo (la pista actual o su respuesta)
  function objetivo() {
    if (estado !== "juego" || paso >= PISTAS.length) return null;
    return fase === "pista" ? PISTAS[paso].lugar : fase === "resp" ? PISTAS[paso].resp : null;
  }

  function avanzar() {
    if (estado === "entrada" || estado === "gameover") reiniciar();
    else if (estado === "juego") {
      if (fase === "ventana") fase = "resp";
      else if (fase === "resuelta") { paso++; if (paso >= 3) { estado = "caja"; msgs = []; } else fase = "pista"; }
    }
    else if (estado === "caja") { if (entrada.length === 3) comprobar(); }
    else if (estado === "desbloqueada") { estado = "secreto"; t0 = Date.now(); }
    else if (estado === "secretoOK") estado = "resumen";
    else if (estado === "resumen") estado = "final";
    else if (estado === "final") { detener(); alGanar(); }
  }

  function comprobar() {
    if (entrada === CODIGO) { estado = "correcto"; t0 = Date.now(); return; }
    vidas--; entrada = "";
    if (vidas <= 0) { estado = "gameover"; return; }
    msgs = ["CÓDIGO INCORRECTO"]; if (vidas === 1) msgs.push("ÚLTIMA OPORTUNIDAD");
  }

  const dentro = (r, mx, my, m = 0.01) => mx >= r.x - m && mx <= r.x + r.w + m && my >= r.y - m && my <= r.y + r.h + m;
  function clic(e) {
    const r = canvas.getBoundingClientRect();
    const cxp = ((e.clientX - r.left) / r.width) * W, mx = (cxp - ox) / dw, my = (e.clientY - r.top) / r.height;
    if (calib) { ultimo = `x: ${mx.toFixed(3)}  y: ${my.toFixed(3)}`; console.log(ultimo); return; }
    if (TACTIL && estado === "juego" && (fase === "pista" || fase === "resp") && cxp > W - 112 && cxp < W - 8 && my * H > 36 && my * H < 62) { ayudaFin = Date.now() + 3000; return; }
    if (["entrada", "desbloqueada", "secretoOK", "resumen", "final", "gameover"].includes(estado)) { avanzar(); return; }
    if (estado === "juego") {
      const P = PISTAS[paso];
      if (fase === "ventana" || fase === "resuelta") avanzar();
      else if (fase === "pista" && P.lugar.some((z) => dentro(z, mx, my))) { fase = "brillo"; t0 = Date.now(); }
      else if (fase === "resp" && P.resp.some((z) => dentro(z, mx, my))) { fase = "resuelta"; numeros.push(P.num); }
      else if (fase === "pista" || fase === "resp") { aviso = "Nada por aquí..."; avisoFin = Date.now() + 900; }
    } else if (estado === "caja") {
      const px = cxp, py = my * H;
      const sobreB = (b) => px > b.x && px < b.x + b.w && py > b.y && py < b.y + b.h;
      if (sobreB(BTN) && entrada.length === 3) comprobar();
      if (TACTIL) TECLAS.forEach((t, i) => {
        if (!sobreB(tecla(i))) return;
        if (t === "<") entrada = entrada.slice(0, -1);
        else if (t === "OK") { if (entrada.length === 3) comprobar(); }
        else if (entrada.length < 3) entrada += t;
      });
    } else if (estado === "secreto" && dentro(SECRETO, mx, my, 0.015)) { secreto = true; estado = "secretoOK"; }
  }

  // ============ Actualizar ============
  function actualizar() {
    const a = Date.now();
    if (estado === "juego" && fase === "brillo" && a - t0 > 700) fase = "ventana";
    else if (estado === "correcto" && a - t0 > 1000) estado = "desbloqueada";
    else if (estado === "secreto" && a - t0 > 3500) estado = "resumen";
  }

  // ============ Dibujo ============
  function texto(t, y, c = "#f5f0d6", tam = 12, xx = W / 2, al = "center") {
    ctx.font = `${tam}px 'Press Start 2P', monospace`;
    ctx.fillStyle = c; ctx.textAlign = al; ctx.fillText(t, xx, y);
  }
  function pantalla(lineas) {
    ctx.fillStyle = "#1e2228"; ctx.fillRect(0, 0, W, H); UI.marco(ctx, W, H, "triana");
    lineas.forEach((l, i) => texto(l, 62 + i * 32, i === 0 ? "#f08020" : "#f5f0d6", i === 0 ? 16 : 11));
  }
  function fondo() {
    if (imgOk) {
if (dw < W - 1) {
        if (TACTIL) { // en móvil: se alarga el borde de la foto (el desenfoque no funciona en todos los móviles y se veía doble)
          ctx.drawImage(img, 0, 0, 1, img.naturalHeight, 0, 0, ox, H);
          ctx.drawImage(img, img.naturalWidth - 1, 0, 1, img.naturalHeight, ox + dw, 0, W - ox - dw, H);
        } else { ctx.save(); ctx.filter = "blur(14px) brightness(.55)"; ctx.drawImage(img, -20, -20, W + 40, H + 40); ctx.restore(); }
      }
      ctx.drawImage(img, ox, 0, dw, H);
    }
    else { ctx.fillStyle = "#1e2228"; ctx.fillRect(0, 0, W, H); texto(imgErr ? "NO ENCUENTRO imagenes/triana.jpg" : "CARGANDO...", H / 2, "#f5f0d6", 11); }
  }
  function ventana(titulo, lineas, grande, boton) {
    const x = W / 2 - 220, y = H / 2 - 110, w = 440, h = 220;
    ctx.fillStyle = "#34578a"; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#f5f0d6"; ctx.lineWidth = 4; ctx.strokeRect(x, y, w, h); UI.caja(ctx, x, y, w, h, "triana");
    texto(titulo, y + 36, "#f08020", 14);
    lineas.forEach((l, i) => texto(l, y + 72 + i * 24, "#f5f0d6", 11));
    if (grande) texto(grande, y + 160, "#f08020", 36);
    texto(boton, y + h - 16, "#f5f0d6", 10);
  }
  function barra() {
    ctx.fillStyle = "rgba(0,0,0,.7)"; ctx.fillRect(0, 0, W, 30);
    const slots = [0, 1, 2].map((i) => `[ ${numeros[i] ?? "?"} ]`).join(" ");
    texto(`CÓDIGO ${slots}`, 20, "#f08020", 10, 10, "left");
    texto(estado === "caja" ? "♥".repeat(vidas) : `PISTAS ${numeros.length}/3`, 20, "#f08020", 10, W - 10, "right");
  }
  function pie(t) { ctx.fillStyle = "rgba(0,0,0,.7)"; ctx.fillRect(0, H - 34, W, 34); texto(t, H - 13, "#f5f0d6", 9); }

  function dibujar() {
    const a = Date.now();
    if (estado === "entrada") { pantalla(["MUNDO 2", "TRIANA", "EL CÓDIGO DEL RÍO", "", "Una combinación está escondida", "en Triana. Encuentra las tres", "pistas y descubre el código.", "", "[ ENTRAR EN TRIANA ]"]); return; }
    if (estado === "gameover") { pantalla(["GAME OVER", "TRIANA TE HA VENCIDO.", "", "[ REINTENTAR NIVEL ]"]); return; }
    if (estado === "desbloqueada") { pantalla(["CÓDIGO CORRECTO", "TRIANA DESBLOQUEADA", "", "Has descubierto el código", "del Guadalquivir.", "", "Pulsa ENTER"]); return; }
    if (estado === "secretoOK") { pantalla(["SECRETO ENCONTRADO", "Has descubierto un fragmento", "de azulejo.", "", "SECRETOS: 1/1", "", "Pulsa ENTER"]); return; }
    if (estado === "resumen") { pantalla(["TRIANA", "COMPLETADO", "", "Pistas      3/3", `Código      ${CODIGO}`, `Secreto     ${secreto ? 1 : 0}/1`, "", "HAS CONSEGUIDO:", "AZULEJO DE TRIANA"]); return; }
    if (estado === "final") { pantalla(["El río ya no guarda secretos.", "", "Pero ahora llega el ruido.", "", "PRÓXIMO DESTINO:", "FERIA DE SEVILLA", "", "[ CONTINUAR ]"]); return; }

    ctx.save();
    if (estado === "correcto") ctx.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10); // vibración
    fondo();
    ctx.restore();

    if (estado === "secreto") { // brillo breve en un azulejo del puente, sin avisar
      if (Math.floor((a - t0) / 280) % 2 === 0) {
        const cx = ox + (SECRETO.x + SECRETO.w / 2) * dw, cy = (SECRETO.y + SECRETO.h / 2) * H;
        ctx.fillStyle = "#fff"; ctx.fillRect(cx - 2, cy - 10, 4, 20); ctx.fillRect(cx - 10, cy - 2, 20, 4);
        ctx.fillStyle = "#f2c91e"; ctx.fillRect(cx - 4, cy - 4, 8, 8);
      }
    } else if (estado === "correcto") {
      texto("CÓDIGO CORRECTO", H / 2, "#4c9c3c", 20);
    } else if (estado === "juego") {
      const P = PISTAS[paso];
      barra();
      const objs = objetivo(); // brillo al pasar el cursor por lo que se puede investigar
      if (objs && hover) objs.filter((z) => dentro(z, hover.x, hover.y)).forEach((z) => {
        const [x, y, w, h] = R(z), p = (a % 800) / 800, al = 0.5 + 0.5 * Math.sin(p * Math.PI * 2);
        ctx.fillStyle = "rgba(242,201,30,.22)"; ctx.fillRect(x - 5, y - 5, w + 10, h + 10);
        ctx.strokeStyle = `rgba(255,240,150,${al})`; ctx.lineWidth = 3; ctx.strokeRect(x - 5, y - 5, w + 10, h + 10);
      });
      if (objs && TACTIL) { // en móvil no hay cursor: el botón AYUDA hace brillar lo que hay que pulsar
        if (a < ayudaFin) objs.forEach((z) => {
          const [x, y, w, h] = R(z), al = 0.5 + 0.5 * Math.sin(((a % 800) / 800) * Math.PI * 2);
          ctx.fillStyle = "rgba(242,201,30,.22)"; ctx.fillRect(x - 5, y - 5, w + 10, h + 10);
          ctx.strokeStyle = `rgba(255,240,150,${al})`; ctx.lineWidth = 3; ctx.strokeRect(x - 5, y - 5, w + 10, h + 10);
        });
      ctx.fillStyle = "rgba(30,34,40,.85)"; ctx.fillRect(W - 112, 36, 104, 26);
      ctx.strokeStyle = "#f5f0d6"; ctx.lineWidth = 2; ctx.strokeRect(W - 112, 36, 104, 26);
      texto("AYUDA", 54, "#f2c91e", 10, W - 60);
      }
      if (fase === "brillo") {
        const z = P.lugar[0], p = (a - t0) / 700;
        ctx.fillStyle = `rgba(255,240,150,${0.8 * Math.sin(p * Math.PI * 3) ** 2})`;
        ctx.fillRect(...R(z));
      }
      if (fase === "ventana") ventana(P.titulo, P.texto, "", "[ CERRAR ]");
      else if (fase === "resuelta") ventana(`PISTA RESUELTA`, [...P.extra, `El ${P.ordinal} número es:`], P.num, "[ CONTINUAR ]");
      else if (fase === "resp") pie(`${P.titulo}: ${P.texto.join(" ")}`);
      else if (a < avisoFin) pie(aviso);
      else pie(paso === 0 ? "Investiga la imagen: haz clic en los detalles." : "Busca la siguiente pista en la imagen.");
      if (fase === "resp" && a < avisoFin) pie(aviso);
    } else if (estado === "caja") {
      barra();
      ctx.fillStyle = "rgba(0,0,0,.55)"; ctx.fillRect(0, 30, W, H - 30);
      if (TACTIL) {
      const x = 40, y = 40, w = 560, h = 290;
      ctx.fillStyle = "#1e2228"; ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = "#f08020"; ctx.lineWidth = 4; ctx.strokeRect(x, y, w, h);
      texto("CÓDIGO FINAL", y + 34, "#f08020", 14, 176);
      for (let i = 0; i < 3; i++) {
        const sx = 70 + i * 76;
        ctx.fillStyle = "#34578a"; ctx.fillRect(sx, 100, 60, 70);
        ctx.strokeStyle = "#f5f0d6"; ctx.lineWidth = 3; ctx.strokeRect(sx, 100, 60, 70);
        texto(entrada[i] ?? "_", 152, "#f5f0d6", 32, sx + 30);
      }
      msgs.forEach((m, i) => texto(m, 200 + i * 18, "#ee3c28", 9, 176));
      ctx.fillStyle = entrada.length === 3 ? "#c41e3a" : "#6b7478"; ctx.fillRect(BTN.x, BTN.y, BTN.w, BTN.h);
      texto("ABRIR", BTN.y + 25, "#f5f0d6", 12, BTN.x + BTN.w / 2);
      TECLAS.forEach((t, i) => { // teclado numérico (sirve con el dedo)
        const k = tecla(i);
        ctx.fillStyle = "#34578a"; ctx.fillRect(k.x, k.y, k.w, k.h);
        ctx.strokeStyle = "#f5f0d6"; ctx.lineWidth = 2; ctx.strokeRect(k.x, k.y, k.w, k.h);
        texto(t, k.y + 31, "#f5f0d6", 18, k.x + k.w / 2);
      });
      } else {
      const x = W / 2 - 170, y = H / 2 - 120, w = 340, h = 250;
      ctx.fillStyle = "#1e2228"; ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = "#f08020"; ctx.lineWidth = 4; ctx.strokeRect(x, y, w, h);
      texto("CÓDIGO FINAL", y + 36, "#f08020", 14);
      for (let i = 0; i < 3; i++) {
        const sx = W / 2 - 100 + i * 70;
        ctx.fillStyle = "#34578a"; ctx.fillRect(sx, y + 60, 60, 70);
        ctx.strokeStyle = "#f5f0d6"; ctx.lineWidth = 3; ctx.strokeRect(sx, y + 60, 60, 70);
        texto(entrada[i] ?? "_", y + 112, "#f5f0d6", 32, sx + 30);
      }
      msgs.forEach((m, i) => texto(m, y + 150 + i * 18, "#ee3c28", 9));
      ctx.fillStyle = entrada.length === 3 ? "#c41e3a" : "#6b7478"; ctx.fillRect(BTN.x, BTN.y, BTN.w, BTN.h);
      texto("[ ABRIR ]", BTN.y + 22, "#f5f0d6", 12);
      texto("Escribe los 3 números", y + h - 8, "#f5f0d6", 8);
      }
    }

    if (calib) { // zonas en rojo, secreto en amarillo, coordenadas del último clic
      ctx.lineWidth = 2; ctx.strokeStyle = "#ee3c28";
      PISTAS.forEach((p) => [...p.lugar, ...p.resp].forEach((z) => ctx.strokeRect(...R(z))));
      ctx.strokeStyle = "#f2c91e"; ctx.strokeRect(...R(SECRETO));
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
    canvas.removeEventListener("mousemove", mm);
    canvas.style.cursor = "default";
    canvas.width = 640; canvas.height = 360; // tamaño estándar para los demás mundos
  }
  return detener;
}
