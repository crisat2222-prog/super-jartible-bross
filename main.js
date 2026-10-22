// ---------- Datos del juego ----------
const MUNDOS = [
  { id: 1, nombre: "Centro de Sevilla" },
  { id: 2, nombre: "Triana" },
  { id: 3, nombre: "Feria de Sevilla" },
  { id: 4, nombre: "Semana Santa" },
  { id: 5, nombre: "La Giralda" },
];

// Un símbolo por mundo superado (el 5 es el nivel final, no da símbolo).
const SIMBOLOS = ["Plaza de España", "Triana", "Feria", "Semana Santa"];

// Texto provisional: cámbialo cuando cierres el guion.
const HISTORIA = [
  "Sevilla amanece sin su brillo. Algo ha apagado la ciudad.",
  "BY INFLUENCE despierta sin recordar cómo llegó hasta aquí.",
  "Solo sabe una cosa: la respuesta está en lo más alto de La Giralda.",
  "Para llegar tendrá que cruzar cinco mundos. Que empiece el viaje.",
];

// ---------- Utilidades ----------
const $ = (id) => document.getElementById(id);
const screens = document.querySelectorAll(".screen");
const show = (id) => { screens.forEach((s) => s.classList.toggle("active", s.id === id)); document.body.dataset.screen = id; ajustar(); };

// Los lienzos llenan la página (el área visible bajo las pestañas) sin deformarse
function ajustar() {
  ["canvas", "mapa"].forEach((id) => {
    const c = document.getElementById(id);
    if (!c || !c.closest(".screen").classList.contains("active")) return;
    const s = Math.min(window.innerWidth / c.width, window.innerHeight / c.height);
    c.style.width = Math.floor(c.width * s) + "px";
    c.style.height = Math.floor(c.height * s) + "px";
  });
}
window.addEventListener("resize", ajustar);


// ---------- Progreso (localStorage) ----------
// progreso = número de mundos superados (0 a 5)
function getProgreso() {
  try { return Number(localStorage.getItem("bi-progreso")) || 0; }
  catch { return 0; }
}
function setProgreso(n) {
  try { localStorage.setItem("bi-progreso", String(n)); } catch {}
}

// ---------- Historia ----------
let paso = 0;
function mostrarHistoria() {
  paso = 0;
  show("story");
  escribir(HISTORIA[0]);
}
function escribir(texto) {
  const el = $("story-text");
  el.textContent = "";
  let i = 0;
  clearInterval(escribir.id);
  escribir.id = setInterval(() => {
    el.textContent += texto[i++];
    if (i >= texto.length) clearInterval(escribir.id);
  }, 35);
}
$("story").addEventListener("click", () => {
  paso++;
  if (paso < HISTORIA.length) escribir(HISTORIA[paso]);
  else { clearInterval(escribir.id); mostrarMapa(); }
});

// ---------- Mapa de mundos ----------
let pararMapa = () => {};
function mostrarMapa() {
  const progreso = getProgreso();
  pararMapa();
  pararMapa = iniciarMapa($("mapa"), progreso, MUNDOS, empezarMundo);
  const ganados = SIMBOLOS.slice(0, progreso).join(" · ");
  $("simbolos").textContent = ganados ? "Piezas: " + ganados : "Piezas: ninguna todavía";
  show("worlds");
}

// ---------- Nivel (punto de enganche para tus mundos) ----------
let mundoActual = 0;
function empezarMundo(i) {
  pararMapa();
  mundoActual = i;
  $("level-name").textContent = `Mundo ${MUNDOS[i].id}: ${MUNDOS[i].nombre}`;
  pararNivel();
  $("btn-win").style.display = "none"; // el botón de prueba ya no se muestra en ningún mundo
  show("level");
  // Mundo 1 ya es jugable. Los demás usan el botón de prueba "Superar mundo".
  if (i === 0) {
    pararNivel = iniciarMundo1($("canvas"), () => {
      if (getProgreso() < 1) setProgreso(1);
      mostrarMapa();
    });
  } else if (i === 1) {
    pararNivel = iniciarMundo2($("canvas"), () => {
      if (getProgreso() < 2) setProgreso(2);
      mostrarMapa();
    });
  } else if (i === 2) {
    pararNivel = iniciarMundo3($("canvas"), () => {
      if (getProgreso() < 3) setProgreso(3);
      mostrarMapa();
    });
  } else if (i === 3) {
    pararNivel = iniciarMundo4($("canvas"), () => {
      if (getProgreso() < 4) setProgreso(4);
      mostrarMapa();
    });
  } else if (i === 4) {
    pararNivel = iniciarMundo5($("canvas"), () => {
      if (getProgreso() < 5) setProgreso(5);
      mostrarMapa();
    });
  }
  ajustar();
}
let pararNivel = () => {};
$("btn-win").addEventListener("click", () => {
  pararNivel();
  if (mundoActual + 1 > getProgreso()) setProgreso(mundoActual + 1);
  mostrarMapa();
});
$("btn-exit").addEventListener("click", () => { pararNivel(); mostrarMapa(); });

// ---------- Botones del título ----------
$("btn-start").addEventListener("click", () => { setProgreso(0); mostrarHistoria(); });
$("btn-continue").addEventListener("click", () => { mostrarMapa(); });
$("btn-title").addEventListener("click", () => { pararMapa(); iniciarTitulo(); show("title"); });
$("btn-reset").addEventListener("click", () => { setProgreso(0); iniciarTitulo(); });

function iniciarTitulo() {
  const hayPartida = getProgreso() > 0;
  $("btn-continue").hidden = !hayPartida;
  $("btn-reset").hidden = !hayPartida;
}
iniciarTitulo();
