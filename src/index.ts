import "./assets/styles/style.css";
import Stack from "./Stack";
const canvasContainer = document.createElement("div") as HTMLDivElement;
canvasContainer.setAttribute("id", "container");
document.body.appendChild(canvasContainer);
const canvas = document.createElement("canvas") as HTMLCanvasElement;
canvas.innerText = "Your browser does not seem to support HTML5 canvas.";
canvasContainer.appendChild(canvas);
canvas.setAttribute("id", "board");

const canvasW: number = (canvas.width = 600);
const canvasH: number = (canvas.height = 600);
const scaleW: number = 30;
const scaleH: number = 30;
const boardW: number = canvasW / scaleW; //20
const boardH: number = canvasH / scaleH; //20
const radius: number = 0.25;
const circlesW = boardW - 8 * radius;
const circlesH = boardH - 8 * radius;

const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

// Form
const formContainer = document.createElement("div") as HTMLDivElement;
document.body.appendChild(formContainer);
const startBtn = document.createElement("button") as HTMLButtonElement;
const resetBtn = document.createElement("button") as HTMLButtonElement;

startBtn.innerText = "start";
resetBtn.innerText = "reset";

formContainer.appendChild(startBtn);
formContainer.appendChild(resetBtn);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

CanvasRenderingContext2D.prototype.pFillRect = function (
  x: number,
  y: number,
  xd: number,
  yd: number
) {
  return this.fillRect(scaleW * x, scaleH * y, scaleW * xd, scaleH * yd);
};
CanvasRenderingContext2D.prototype.pArc = function (
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  return this.arc(
    scaleW * x,
    scaleH * y,
    scaleH * radius,
    startAngle,
    endAngle
  );
};

CanvasRenderingContext2D.prototype.pMoveTo = function (x: number, y: number) {
  return this.moveTo(scaleW * x, scaleH * y);
};

CanvasRenderingContext2D.prototype.pLineTo = function (x: number, y: number) {
  return this.lineTo(scaleW * x, scaleH * y);
};

CanvasRenderingContext2D.prototype.circle = function (
  x: number,
  y: number,
  color: string
) {
  const radius = 0.25;
  this.beginPath();
  this.pArc(x + 1, y + 1, radius, 0, 2 * Math.PI);
  this.fillStyle = color;
  this.fill();
  this.closePath();
};

const makeGraph = (circlesW: number, circlesH: number) => {
  for (let c = 0; c <= circlesW; c++) {
    for (let r = 0; r <= circlesH; r++) {
      ctx.circle(r, c, "black");
    }
  }
};

makeGraph(circlesW, circlesH);

const makeGrid = (
  ctx: CanvasRenderingContext2D,
  boardW: number,
  boardH: number
) => {
  ctx.lineWidth = 1;
  ctx.strokeStyle = "white";

  for (let r = 1; r < boardH; r += 1) {
    // Horizontal lines
    ctx.beginPath();
    ctx.pMoveTo(0, r);
    ctx.pLineTo(boardW, r);
    ctx.stroke();
    ctx.closePath();
  }
  for (let c = 1; c < boardW; c += 1) {
    // Vertical lines
    ctx.beginPath();
    ctx.pMoveTo(c, 0);
    ctx.pLineTo(c, boardH);
    ctx.stroke();
    ctx.closePath();
  }
};

makeGrid(ctx, boardW, boardH);

let startNode: string;
let endNode: string;
let eventCounter = 0;
const handleClick = ({
  pageX,
  pageY,
}: {
  pageX: number;
  pageY: number;
}): void => {
  const i = Math.round(pageX / scaleW) - 1;
  const j = Math.round(pageY / scaleH) - 1;
  if (i < 0 || i > circlesW || j < 0 || j > circlesH) {
    console.log("bad");
    return;
  }
  if (eventCounter === 0) {
    startNode = `${i},${j}`;
    ctx.circle(i, j, "violet");
    eventCounter++;
  } else if (eventCounter === 1) {
    endNode = `${i},${j}`;
    ctx.circle(i, j, "blue");
    eventCounter++;
  } else {
    canvas.removeEventListener("click", handleClick);
  }
};

canvas.addEventListener("click", handleClick);

// GRAPH

const nodeToXY = (node: string) => {
  const coordinate = node.split(",");
  const x = parseInt(coordinate[0], 10);
  const y = parseInt(coordinate[1], 10);
  return [x, y];
};

const neighbors = (node: string): Set<string> => {
  const [x,y] = nodeToXY(node);
  const neighborNode: Set<string> = new Set();
  if (x - 1 >= 0) {
    neighborNode.add(`${x - 1},${y}`);
  }
  if (y - 1 >= 0) {
    neighborNode.add(`${x},${y - 1}`);
  }
  if (x + 1 <= circlesW) {
    neighborNode.add(`${x + 1},${y}`);
  }
  if (y + 1 <= circlesH) {
    neighborNode.add(`${x},${y + 1}`);
  }
  return neighborNode;
};

const start = (): void => {
  const stack = new Stack();
  let point: string = startNode;

  const visitedNodes = new Set();
  visitedNodes.add(startNode);
  (async () => {
    let flag = true;
    while (flag) {
      const neighborsSet = neighbors(point);
      for (const neighbor of neighborsSet) {
        if (!visitedNodes.has(neighbor)) {
          visitedNodes.add(neighbor);
          const coordinate = nodeToXY(neighbor);
          await sleep(200);
          ctx.circle(coordinate[0], coordinate[1], "yellow");
          if (neighbor === endNode) {
            console.log("GOAL!");
            flag = false;
            break;
          } else {
            stack.add(neighbor);
          }
        }
      }
      point = stack.pick();
    }
  })();
};


// End of GRAPH

startBtn.onclick = () => {
  start();
};
resetBtn.onclick = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  makeGraph(circlesW, circlesH);
  makeGrid(ctx, boardW, boardH);
  eventCounter = 0;
  canvas.addEventListener("click", handleClick);
};
