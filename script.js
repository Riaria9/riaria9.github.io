const canvas = document.querySelector("#systemsCanvas");
const context = canvas.getContext("2d");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let width = 0;
let height = 0;
let frame = 0;

const nodes = [
  { x: 0.18, y: 0.24, label: "client", color: "#7dd3fc" },
  { x: 0.5, y: 0.18, label: "scheduler", color: "#facc15" },
  { x: 0.8, y: 0.27, label: "miner", color: "#34d399" },
  { x: 0.28, y: 0.62, label: "lambda", color: "#fb923c" },
  { x: 0.58, y: 0.72, label: "queue", color: "#c084fc" },
  { x: 0.83, y: 0.64, label: "store", color: "#60a5fa" },
];

const links = [
  [0, 1],
  [1, 2],
  [1, 4],
  [0, 3],
  [3, 4],
  [4, 5],
  [2, 5],
];

function resizeCanvas() {
  const bounds = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);

  width = Math.floor(bounds.width);
  height = Math.floor(bounds.height);
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawGrid() {
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#111316";
  context.fillRect(0, 0, width, height);

  context.strokeStyle = "rgba(255,255,255,0.06)";
  context.lineWidth = 1;

  for (let x = 28; x < width; x += 42) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }

  for (let y = 28; y < height; y += 42) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
}

function nodePoint(node) {
  return {
    x: node.x * width,
    y: node.y * height,
  };
}

function drawLinks() {
  links.forEach(([from, to]) => {
    const start = nodePoint(nodes[from]);
    const end = nodePoint(nodes[to]);

    context.strokeStyle = "rgba(232,237,245,0.22)";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
  });
}

function drawPackets() {
  links.forEach(([from, to], index) => {
    const start = nodePoint(nodes[from]);
    const end = nodePoint(nodes[to]);
    const progress = prefersReducedMotion ? 0.58 : ((frame * 0.012 + index * 0.17) % 1);
    const x = start.x + (end.x - start.x) * progress;
    const y = start.y + (end.y - start.y) * progress;

    context.fillStyle = index % 2 === 0 ? "#7dd3fc" : "#facc15";
    context.beginPath();
    context.arc(x, y, 4.5, 0, Math.PI * 2);
    context.fill();
  });
}

function drawNodes() {
  nodes.forEach((node, index) => {
    const point = nodePoint(node);
    const pulse = prefersReducedMotion ? 0 : Math.sin(frame * 0.04 + index) * 3;

    context.fillStyle = "rgba(255,255,255,0.07)";
    context.beginPath();
    context.arc(point.x, point.y, 34 + pulse, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = node.color;
    context.beginPath();
    context.arc(point.x, point.y, 13, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#e8edf5";
    context.font = "700 13px Inter, system-ui, sans-serif";
    context.textAlign = "center";
    context.fillText(node.label, point.x, point.y + 38);
  });
}

function roundedRect(x, y, rectWidth, rectHeight, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + rectWidth - radius, y);
  context.quadraticCurveTo(x + rectWidth, y, x + rectWidth, y + radius);
  context.lineTo(x + rectWidth, y + rectHeight - radius);
  context.quadraticCurveTo(x + rectWidth, y + rectHeight, x + rectWidth - radius, y + rectHeight);
  context.lineTo(x + radius, y + rectHeight);
  context.quadraticCurveTo(x, y + rectHeight, x, y + rectHeight - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function drawStatusPanel() {
  const panelWidth = Math.min(260, width - 44);
  context.fillStyle = "rgba(255,255,255,0.08)";
  context.strokeStyle = "rgba(255,255,255,0.14)";
  context.lineWidth = 1;
  roundedRect(22, 22, panelWidth, 112, 8);
  context.fill();
  context.stroke();

  context.fillStyle = "#e8edf5";
  context.font = "800 13px Inter, system-ui, sans-serif";
  context.textAlign = "left";
  context.fillText("system snapshot", 42, 54);

  const load = prefersReducedMotion ? 74 : Math.round(68 + Math.sin(frame * 0.03) * 12);
  const retry = prefersReducedMotion ? 2 : Math.round(2 + Math.cos(frame * 0.025) * 1);

  context.fillStyle = "#aab6c5";
  context.font = "650 12px Inter, system-ui, sans-serif";
  context.fillText(`parallel load ${load}%`, 42, 84);
  context.fillText(`retries ${retry}`, 42, 108);
}

function render() {
  drawGrid();
  drawLinks();
  drawPackets();
  drawNodes();
  drawStatusPanel();

  frame += 1;

  if (!prefersReducedMotion) {
    window.requestAnimationFrame(render);
  }
}

resizeCanvas();
render();

window.addEventListener("resize", () => {
  resizeCanvas();
  render();
});
