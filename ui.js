// Marcos propios de cada mundo (para que cada pantalla de texto tenga su carácter)
const UI = {
  fondos: { plaza: "#1e2228", triana: "#2a4044", feria: "#231812", semana: "#2e2140", giralda: "#14171a" },
  marco(ctx, W, H, t) {
    ctx.fillStyle = this.fondos[t]; ctx.fillRect(0, 0, W, H);
    if (t === "plaza") { // cenefa de azulejos azules y blancos
      for (let i = 0; i < W; i += 16) [0, H - 16].forEach((y) => { ctx.fillStyle = (i / 16) % 2 ? "#f5f0d6" : "#34578a"; ctx.fillRect(i, y, 16, 16); });
      for (let j = 16; j < H - 16; j += 16) [0, W - 16].forEach((x) => { ctx.fillStyle = (j / 16) % 2 ? "#f5f0d6" : "#34578a"; ctx.fillRect(x, j, 16, 16); });
    } else if (t === "triana") { // filete de cerámica amarillo y azul
      ctx.strokeStyle = "#f2c91e"; ctx.lineWidth = 3; ctx.strokeRect(10, 10, W - 20, H - 20);
      ctx.strokeStyle = "#4f86bf"; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.strokeRect(18, 18, W - 36, H - 36); ctx.setLineDash([]);
    } else if (t === "feria") { // toldo de caseta a rayas
      for (let i = 0; i < W; i += 20) { ctx.fillStyle = (i / 20) % 2 ? "#f5f0d6" : "#ee3c28"; ctx.fillRect(i, 0, 20, 22); ctx.beginPath(); ctx.arc(i + 10, 22, 10, 0, Math.PI); ctx.fill(); }
    } else if (t === "semana") { // doble filete dorado con esquinas, como un paso de palio
      ctx.strokeStyle = "#cfa14c"; ctx.lineWidth = 1; ctx.strokeRect(12, 12, W - 24, H - 24); ctx.strokeRect(17, 17, W - 34, H - 34);
      [[12, 12], [W - 12, 12], [12, H - 12], [W - 12, H - 12]].forEach(([x, y]) => { ctx.fillStyle = "#cfa14c"; ctx.fillRect(x - 4, y - 4, 8, 8); });
    } else { ctx.fillStyle = "#f08020"; ctx.fillRect(40, 24, W - 80, 2); ctx.fillRect(40, H - 26, W - 80, 2); }
  },
  caja(ctx, x, y, w, h, t) { // decoración de las ventanas emergentes
    if (t === "triana") { ctx.strokeStyle = "#4f86bf"; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); ctx.strokeRect(x + 8, y + 8, w - 16, h - 16); ctx.setLineDash([]); }
    else if (t === "semana") { ctx.strokeStyle = "#cfa14c"; ctx.lineWidth = 1; ctx.strokeRect(x + 7, y + 7, w - 14, h - 14); }
    else if (t === "giralda") { ctx.fillStyle = "#f08020"; ctx.fillRect(x, y, w, 6); }
  },
};
