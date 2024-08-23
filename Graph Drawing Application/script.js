const gridSize = 50;
const axisColor = "#ff0000";
let radius = 20;
let canvas, ctx;

// Vertex Colors:
const vertexDefaultColor = "#00ccff";
const vertexHoveredColor = "#0093b8";
const vertexSelectedColor = "#ffd700";
const vertexExploringColor = "#bfff00";
const vertexExploredColor = "#07eb9f";
const vertexShortestPathColor = "#ff8800";
const vertexShortestPathTargetColor = "#aa3900";

// Vertices:
const vertices = [];
// Edges:
let edges = [];
let drawnEdges = [];

const edgeDefaultColor = "#000000";
const edgeDefaultTextColor = "#000000";
const edgeExplorationStepColor = "#07eb9f";
const edgeShortestPathColor = "#ff0000";
let currentEdge = null; 
let currentEdgeRev = null; 

// Switching the mode:
let mode = "vertex"; // Default mode
let selectedVertices = [];

// Dragging the vertices:
let isDragging = false;
let draggingVertex = null;

// A check if an algorithm is being ran:
let isDijkstraRunning = false;
let isAStarRunning = false;
let isRunningBellmanFord = false;

// Buttons:
let modeButton, downloadButton, clearCanvasButton, resetGraphButton;
let dijkstraButton, aStarButton, bellmanFordButton;
let dijkstraRobotButton, aStarRobotButton, bellmanFordRobotButton;
let dijkstraShowPseudoButton,
  aStarShowPseudoButton,
  bellmanFordShowPseudoButton;

window.onload = function () {
  hideBellmanFordInfo();
  canvas = document.getElementById("canvas"); 
  ctx = canvas.getContext("2d");

  drawGrid(ctx, canvas.width, canvas.height, gridSize);
  //drawAxes(ctx, canvas.width, canvas.height, axisColor);
  //drawLabels(ctx, canvas.width, canvas.height, gridSize);

  canvas.addEventListener("click", handleClick);
  canvas.addEventListener("contextmenu", handleContextMenu);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mouseup", handleMouseUp);

  modeButton = document.getElementById("modeButton");
  downloadButton = document.getElementById("downloadButton");
  clearCanvasButton = document.getElementById("clearCanvasButton");
  resetGraphButton = document.getElementById("resetGraphButton");

  dijkstraButton = document.getElementById("dijkstraButton");
  dijkstraRobotButton = document.getElementById("dijkstraRobotButton");
  dijkstraShowPseudoButton = document.getElementById("showDijkstraPseudo");

  aStarButton = document.getElementById("aStarButton");
  aStarRobotButton = document.getElementById("aStarRobotButton");
  aStarShowPseudoButton = document.getElementById("aStarShowPseudoButton");

  bellmanFordButton = document.getElementById("bellmanFordButton");
  bellmanFordRobotButton = document.getElementById("bellmanFordRobotButton");
  bellmanFordShowPseudoButton = document.getElementById(
    "showBellmanFordPseudo"
  );

  modeButton.addEventListener("click", switchMode);
  downloadButton.addEventListener("click", handleStartingDownloads);
  clearCanvasButton.addEventListener("click", createNewCanvas);
  resetGraphButton.addEventListener("click", resetGraph);

  dijkstraButton.addEventListener("click", runDijkstrasScreen);
  dijkstraShowPseudoButton.addEventListener("click", showDijkstraPseudo);
  dijkstraRobotButton.addEventListener("click", runDijkstrasRobotCondition);

  aStarButton.addEventListener("click", runAStar);
  aStarRobotButton.addEventListener("click", runAStarRobot);
  aStarShowPseudoButton.addEventListener("click", showAStarPseudo);

  bellmanFordButton.addEventListener("click", runBellmanFord);
  bellmanFordRobotButton.addEventListener("click", runBellmanFordRobot);
  bellmanFordShowPseudoButton.addEventListener("click", showBellmanFordPseudo);
};

function getShortestPath(path) {
  const shortestPath = [];

  path.forEach((vertex) => {
    shortestPath.push(vertex.name);
  });

  return shortestPath;
}

function showDijkstraPseudo() {
  const popup = document.getElementById("popup-dijkstraPseudo");
  popup.classList.add("active");
}

function closeDijkstraPseudo() {
  const popup = document.getElementById("popup-dijkstraPseudo");
  popup.classList.remove("active");
}

function showAStarPseudo() {
  const popup = document.getElementById("popup-aStarPseudo");
  popup.classList.add("active");
}

function closeAStarPseudo() {
  const popup = document.getElementById("popup-aStarPseudo");
  popup.classList.remove("active");
}

function convertAllVerticesCoordinates(vertices) {
  const convertedVertices = vertices.map((vertex) => {
    const { readableX, readableY } = convertToReadableCoordinates(
      vertex.x,
      vertex.y
    );

    return new Vertex(
      readableX,
      readableY,
      vertex.name,
      vertex.color,
      vertex.className,
      vertex.radius
    );
  });

  return convertedVertices;
}

// ------------------------------------------------------------------------
// ------------------------------------------------------------------------
// ------------------------------------------------------------------------
//  DOWNLOADS DOWNLOADS DOWNLOADS DOWNLOADS DOWNLOADS DOWNLOADS DOWNLOADS

function handleStartingDownloads() {
  downloadVertexPositions();
  downloadAdjacency();
}

async function downloadAdjacency() {
  let linesEdge = [];
  edges.forEach((edge) => {
    linesEdge.push(`Edge name: ${edge.name}, Weight: ${edge.weight}`);
  });
  const textContentEdge = linesEdge.join("\n");
  const textBlobEdge = new Blob([textContentEdge], { type: "text/plain" });
  const downloadLinkEdge = document.createElement("a");
  downloadLinkEdge.download = "adjacency.txt";
  downloadLinkEdge.href = window.URL.createObjectURL(textBlobEdge);
  document.body.appendChild(downloadLinkEdge);
  downloadLinkEdge.click();
  setTimeout(() => {
    window.URL.revokeObjectURL(downloadLinkEdge.href);
    document.body.removeChild(downloadLinkEdge);
  }, 0);
}

async function downloadVertexPositions() {
  const convertedVertices = convertAllVerticesCoordinates(vertices);
  let linesVertex = [];
  convertedVertices.forEach((vertex) => {
    linesVertex.push(
      `Vertex name: ${vertex.name}, X: ${vertex.x}, Y: ${vertex.y}`
    );
  });
  const textContentVertex = linesVertex.join("\n");
  const textBlobVertex = new Blob([textContentVertex], { type: "text/plain" });
  const downloadLinkVertex = document.createElement("a");
  downloadLinkVertex.download = "verticesPositions.txt";
  downloadLinkVertex.href = window.URL.createObjectURL(textBlobVertex);
  document.body.appendChild(downloadLinkVertex);
  downloadLinkVertex.click();
  setTimeout(() => {
    window.URL.revokeObjectURL(downloadLinkVertex.href);
    document.body.removeChild(downloadLinkVertex);
  }, 0);
}

function downloadShortestPath(shortestPath) {
  const textContentPath = shortestPath.join("\n");
  const textBlobPath = new Blob([textContentPath], { type: "text/plain" });
  const downloadLinkPath = document.createElement("a");
  downloadLinkPath.download = "shortestPath.txt";
  downloadLinkPath.href = window.URL.createObjectURL(textBlobPath);
  document.body.appendChild(downloadLinkPath);
  downloadLinkPath.click();
  setTimeout(() => {
    window.URL.revokeObjectURL(downloadLinkPath.href);
    document.body.removeChild(downloadLinkPath);
  }, 0);
}

async function downloadAndWait(filename, content, waitTime) {
  downloadLog(filename, content, waitTime);
  await sleep(waitTime); 
}

function downloadLog(filename, data) {
  const blob = new Blob([data], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ------------------------------------------------------------------------
// ------------------------------------------------------------------------
// ------------------------------------------------------------------------

// ------------------------------------------------------------------------
// ------------------------------------------------------------------------
// ------------------------------------------------------------------------
// GRAPH DRAWER / GRAPH DRAWER / GRAPH DRAWER

function disableButtons() {
  modeButton.disabled = true;
  downloadButton.disabled = true;
  resetGraphButton.disabled = true;
  clearCanvasButton.disabled = true;
  dijkstraShowPseudoButton.disabled = true;
  aStarShowPseudoButton.disabled = true;
  bellmanFordShowPseudoButton.disabled = true;
  dijkstraButton.disabled = true;
  aStarButton.disabled = true;
  bellmanFordButton.disabled = true;
  dijkstraRobotButton.disabled = true;
  aStarRobotButton.disabled = true;
  bellmanFordRobotButton.disabled = true;
}

function enableButtons() {
  modeButton.disabled = false;
  downloadButton.disabled = false;
  resetGraphButton.disabled = false;
  clearCanvasButton.disabled = false;
  dijkstraShowPseudoButton.disabled = false;
  aStarShowPseudoButton.disabled = false;
  bellmanFordShowPseudoButton.disabled = false;
  dijkstraButton.disabled = false;
  aStarButton.disabled = false;
  bellmanFordButton.disabled = false;
  dijkstraRobotButton.disabled = false;
  aStarRobotButton.disabled = false;
  bellmanFordRobotButton.disabled = false;
}

function disableMouseEvents() {
  const graphCanvas = document.getElementById("canvas");
  graphCanvas.style.pointerEvents = "none";
}

function enableMouseEvents() {
  const graphCanvas = document.getElementById("canvas");
  graphCanvas.style.pointerEvents = "auto";
}

function handleClick(event) {
  if (mode === "vertex") {
    handleVertexClick(event);
  } else if (mode === "edge") {
    handleEdgeClick(event);
  }
}

function handleVertexClick(event) {
  updateCanvas();

  if (alphabetStack.length == 0) {
    console.log("You cannot create any more vertices.");
  } else {
    const { x, y } = snapToGrid(event.offsetX, event.offsetY);

    let isPositionTaken = false; 

    isPositionTaken = checkIfPositionTaken(x, y);

    if (isPositionTaken) {
      console.log("You cannot draw vertex on top of another vertex.");
    } else {
      const name = alphabetStack.pop();
      addVertex(x, y, name);
      console.log("Vertex: " + x, y, name, vertices[vertices.length - 1].color);
    }
    updateCanvas();
  }
}

function handleEdgeClick(event) {
  const { x, y } = { x: event.offsetX, y: event.offsetY };

  // Find clicked vertex
  const clickedVertex = vertices.find((vertex) => vertex.isPointInside(x, y));

  // Find clicked edge
  const clickedEdge = findEdgeAtPoint(x, y);

  // Handle vertex click
  if (clickedVertex) {
    if (selectedVertices.length < 2) {
      selectedVertices.push(clickedVertex);
      clickedVertex.color = vertexSelectedColor;
      clickedVertex.className = "vertex-selected";
      updateCanvas();
    }

    if (selectedVertices.length === 2) {
      const [vertex1, vertex2] = selectedVertices;
      addEdge(vertex1, vertex2);
      selectedVertices.forEach((vertex) => {
        vertex.color = vertexDefaultColor;
        vertex.className = "vertex-default";
      });
      selectedVertices = []; 
    }
  } else {
    // Handle edge click
    if (clickedEdge) {
      if (isClickInsideWeightBox(clickedEdge, x, y)) {
        currentEdge = clickedEdge;
        currentEdgeRev = edges.find(
          (edge) =>
            edge.vertex1 === clickedEdge.vertex2 &&
            edge.vertex2 === clickedEdge.vertex1
        );
        showWeightPopup();
      }
    }
  }
}

function handleContextMenu(event) {
  event.preventDefault();
}

function handleMouseMove(event) {
  const { x, y, readableX, readableY } = snapToGrid(
    event.offsetX,
    event.offsetY
  );

  if (isDragging && draggingVertex) {
    if (!checkIfPositionTaken(x, y)) {
      draggingVertex.x = x;
      draggingVertex.y = y;
      updateCanvas();
    } else {
      console.log("This position is taken by another vertex.");
    }

    updateCanvas();
  } else {
    vertices.forEach((vertex) => {
      if (vertex.x === x && vertex.y === y) {
        if (vertex.className === "vertex-selected") {
          return;
        }
        vertex.className = "vertex-hovered";
        updateCanvas();
      } else {
        if (vertex.className === "vertex-selected") {
          return;
        }
        vertex.className = "vertex-default"; 
      }
    });
    updateCanvas(x, y);
  }
}

function handleMouseDown(event) {
  if (mode === "vertex") {
    const { x, y } = snapToGrid(event.offsetX, event.offsetY); 
    if (event.button == 0) {
      const draggedVertex = vertices.find((vertex) =>
        vertex.isPointInside(x, y)
      );
      if (draggedVertex) {
        draggingVertex = draggedVertex;
        draggingVertex.color = vertexSelectedColor;
        isDragging = true;
        updateCanvas();
      }
    } else if (event.button == 2) {
      const clickedVertex = vertices.find((vertex) =>
        vertex.isPointInside(x, y)
      );

      deleteVertex(clickedVertex);

      // if (clickedVertex) {
      //   const vertexIndex = vertices.findIndex(
      //     (vertex) => vertex.name === clickedVertex.name
      //   );

      //   if (vertexIndex !== -1) {
      //     alphabetStack.push(clickedVertex.name);
      //     sortAlphabetStackDescending(alphabetStack);
      //     vertices.splice(vertexIndex, 1);
      //     updateCanvas();
      //   }
      // }
    }
  } else if (mode === "edge") {
    const { x, y } = { x: event.offsetX, y: event.offsetY }; 
    if (event.button == 2) {
      const clickedEdge = findEdgeAtPoint(x, y);
      if (clickedEdge) {
        deleteEdge(clickedEdge.vertex1, clickedEdge.vertex2);
        updateCanvas();
      } else {
        console.log("You cannot delete vertices in edge mode.");
      }
    }
  }
}

function handleMouseUp(event) {
  isDragging = false;
  draggingVertex = null;
}

// --------------------------------------------------------------------
// --------------------------------------------------------------------
// -------------------------------------------------------------------
// BUTTONS / BUTTONS / BUTTONS / BUTTONS / BUTTONS / BUTTONS

// Mode Button:
function switchMode() {
  if (mode === "vertex") {
    mode = "edge";
    document.getElementById("mode").textContent = "Edge Mode";
  } else {
    mode = "vertex";
    clearSelectedVertices();
    document.getElementById("mode").textContent = "Vertex Mode";
  }
}


// --------------------------------------------------------------------
// --------------------------------------------------------------------
// --------------------------------------------------------------------

function drawGrid(context, width, height, gridSize) {
  context.strokeStyle = "#cccccc"; 
  context.lineWidth = 1; 

  // Draw vertical grid lines
  for (let x = 0; x <= width; x += gridSize) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }

  // Draw horizontal grid lines
  for (let y = 0; y <= height; y += gridSize) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
}

function drawAxes(context, width, height, axisColor) {
  context.strokeStyle = axisColor; 
  context.lineWidth = 2; 

  const midX = Math.floor(width / 2);
  const midY = Math.floor(height / 2);

  // Draw x-axis
  context.beginPath();
  context.moveTo(0, midY);
  context.lineTo(width, midY);
  context.stroke();

  // Draw y-axis
  context.beginPath();
  context.moveTo(midX, 0);
  context.lineTo(midX, height);
  context.stroke();
}

function drawLabels(context, width, height, gridSize) {
  context.fillStyle = "#000000"; 
  context.font = "12px Arial"; 

  const midX = Math.floor(width / 2);
  const midY = Math.floor(height / 2);

  // Draw x-axis labels
  for (let x = 0; x <= width; x += gridSize) {
    const label = (x - midX) / gridSize;
    context.fillText(label, x - 5, midY + 15);
  }

  // Draw y-axis labels
  for (let y = 0; y <= height; y += gridSize) {
    const label = (midY - y) / gridSize;
    context.fillText(label, midX + 5, y + 5);
  }
}

function snapToGrid(x, y) {
  const borderSize = 2 * radius + 10;

  const innerWidth = canvas.width - borderSize;
  const innerHeight = canvas.height - borderSize;

  const snappedX = Math.min(
    Math.max(borderSize, Math.round(x / gridSize) * gridSize),
    innerWidth
  );
  const snappedY =
    Math.min(
      Math.max(borderSize, Math.round(y / gridSize) * gridSize),
      innerHeight
    ) - 5;

  drawRedDot(snappedX, snappedY);

  const { readableX, readableY } = convertToReadableCoordinates(
    snappedX,
    snappedY
  );
  return { x: snappedX, y: snappedY, readableX, readableY };
}

function checkIfPositionTaken(posX, posY) {
  let isPositionTakenLoc = false;

  isPositionTakenLoc = vertices.find((vertex) =>
    vertex.isPointInside(posX, posY)
  );

  return isPositionTakenLoc;
}

function convertToReadableCoordinates(x, y) {
  const originX = 400;
  const originY = 295;

  let readableX = (x - originX) / gridSize;
  let readableY = ((y - originY) / gridSize) * -1; 

  if (readableY === -0) {
    readableY = 0;
  }

  console.log(readableX, readableY);
  return { readableX, readableY };
}

function clearCanvas(canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid(ctx, canvas.width, canvas.height, gridSize);
}

function createNewCanvas(canvas) {
  for (let vertex of vertices) {
    alphabetStack.push(vertex.name);
  }
  sortAlphabetStackDescending(alphabetStack);
  // Clear arrays
  edges.splice(0, edges.length);
  drawnEdges.splice(0, drawnEdges.length);
  vertices.splice(0, vertices.length);
  clearSelectedVertices();

  // Reset current edge varibles
  currentEdge = null;
  currentEdgeRev = null;

  updateCanvas();
}

function resetGraph() {
  vertices.forEach((vertex) => {
    vertex.className = "vertex-default";
  });

  edges.forEach((edge) => {
    edge.color = edgeDefaultColor;
  });

  clearSelectedVertices();
  updateCanvas();
}

function drawRedDot(x, y, radius = 3) {
  ctx.beginPath();
  ctx.arc(x, y + 5, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#FF0000"; // Red color
  ctx.fill();
  ctx.closePath();
}

function updateCanvas(x, y) {
  clearCanvas(canvas);
  drawRedDot(x, y);
  drawEdges(ctx);
  drawVertices(ctx); 
  drawVertexCosts(ctx);
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// NODES / NODES / NODES / NODES / NODES / NODES / NODES / NODES / NODES
class Vertex {
  constructor(
    x,
    y,
    name,
    color = null,
    className = "vertex-default",
    cost = 0,
    predecessor = null,
    heuristicCost = 0 
  ) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.color = color;
    this.className = className;
    this.radius = radius;
    this.cost = cost;
    this.predecessor = predecessor;
    this.heuristicCost = heuristicCost; 
  }

  draw(context) {
    context.beginPath();
    context.arc(this.x, this.y + 5, this.radius, 0, Math.PI * 2);

    let fillStyle;
    let color;
    switch (this.className) {
      case "vertex-default":
        color = vertexDefaultColor;
        fillStyle = color;
        vertices[vertices.length - 1].color = color;
        break;
      case "vertex-hovered":
        color = vertexHoveredColor;
        fillStyle = color;
        vertices[vertices.length - 1].color = color;
        break;
      case "vertex-selected":
        color = vertexSelectedColor;
        fillStyle = color;
        vertices[vertices.length - 1].color = color;
        break;
      case "vertex-explored":
        color = vertexExploredColor;
        fillStyle = color;
        vertices[vertices.length - 1].color = color;
        break;
      case "vertex-exploring":
        color = vertexExploringColor;
        fillStyle = color;
        vertices[vertices.length - 1].color = color;
        break;
      case "vertex-shortestPath":
        color = vertexShortestPathColor;
        fillStyle = color;
        vertices[vertices.length - 1].color = color;
        break;
      case "vertex-shortestPathTarget":
        color = vertexShortestPathTargetColor;
        fillStyle = color;
        vertices[vertices.length - 1].color = color;
        break;
      default:
        fillStyle = "#008080"; 
    }

    context.fillStyle = fillStyle;
    context.strokeStyle = "#000000"; 
    context.fill();
    context.stroke();
    context.closePath();

    context.fillStyle = "#000000"; 
    context.font = "12px Arial"; 
    context.textAlign = "center"; 
    context.textBaseline = "middle";
    context.fillText(this.name, this.x, this.y + 5); 

    if (isDijkstraRunning) {
      context.font = "bold 14px Arial";
      const costText = this.cost === Infinity ? "∞" : `Cost: ${this.cost}`;
      const predText = this.predecessor
        ? `PRED: ${this.predecessor.name}`
        : "PRED: None";

      const costTextWidth = context.measureText(costText).width;
      const predTextWidth = context.measureText(predText).width;
      const textWidth = Math.max(costTextWidth, predTextWidth);
      const textHeight = 45; 

      // Draw the white background rectangle
      context.fillStyle = "rgba(255, 255, 255, 0.5)";
      context.fillRect(
        this.x - textWidth / 2 - 2,
        this.y - 45 - textHeight / 2 - 2,
        textWidth + 4,
        textHeight + 4
      );

      // Draw the cost text
      context.fillStyle = "#3300ff";
      context.fillText(costText, this.x, this.y - 55);

      // Draw the predecessor text
      context.fillStyle = "#ff3300";
      context.fillText(predText, this.x, this.y - 30);
    }

    if (isAStarRunning) {
      context.font = "bold 14px Arial"; 

      // Text for cost, heuristic cost, and combined cost
      const costText = this.cost === Infinity ? " ∞ " : ` ${this.cost} `;
      const heuristicCostText =
        this.heuristicCost === Infinity ? " ∞ " : ` ${this.heuristicCost} `;
      const combinedCost =
        this.cost === Infinity || this.heuristicCost === Infinity
          ? " ∞ "
          : this.cost + this.heuristicCost;
      const combinedCostText = ` ${costText} + ${heuristicCostText} = ${combinedCost}`;
      const predText = this.predecessor
        ? `PRED: ${this.predecessor.name}`
        : "PRED: None";

      // Measure width of each text part
      const costWidth = context.measureText(costText).width;
      const plusWidth = context.measureText(" + ").width;
      const heuristicWidth = context.measureText(heuristicCostText).width;
      const equalsWidth = context.measureText(" = ").width;
      const combinedWidth = context.measureText(combinedCost).width;
      const predWidth = context.measureText(predText).width;
      const maxWidth = Math.max(combinedWidth, predWidth);
      const textHeight = 20; 
      const padding = 10;
      const totalHeight = textHeight * 2 + padding; 

      // White background rectangle
      context.fillStyle = "rgba(255, 255, 255, 0.7)";
      context.fillRect(
        this.x - maxWidth / 2 - 2,
        this.y - totalHeight / 2 - 2 - 50,
        maxWidth + 4,
        totalHeight + 4
      );

      let currentX = this.x - combinedWidth / 2 - 30;

      // Draw cost text
      context.fillStyle = "#33cc33"; // Green for cost
      context.fillText(costText, currentX, this.y - totalHeight / 2 - 30);
      currentX += costWidth;

      // Draw '+' sign
      context.fillStyle = "#000000"; // Black for '+'
      context.fillText(" + ", currentX, this.y - totalHeight / 2 - 30);
      currentX += plusWidth;

      // Draw heuristic cost text
      context.fillStyle = "#ff5733";
      context.fillText(
        heuristicCostText,
        currentX,
        this.y - totalHeight / 2 - 30
      );
      currentX += heuristicWidth;

      // Draw '=' sign
      context.fillStyle = "#000000"; 
      context.fillText(" = ", currentX, this.y - totalHeight / 2 - 30);
      currentX += equalsWidth;

      // Draw combined total cost
      context.fillStyle = "#3399ff"; 
      context.fillText(combinedCost, currentX, this.y - totalHeight / 2 - 30);

      // Draw the predecessor text
      context.fillStyle = "#ff3300";
      context.fillText(predText, this.x, this.y - totalHeight / 2 - 5);
    }

    if (isRunningBellmanFord) {
      context.font = "bold 14px Arial";
      const costText = this.cost === Infinity ? "∞" : `Cost: ${this.cost}`;
      const predText = this.predecessor
        ? `PRED: ${this.predecessor.name}`
        : "PRED: None";

      const costTextWidth = context.measureText(costText).width;
      const predTextWidth = context.measureText(predText).width;
      const textWidth = Math.max(costTextWidth, predTextWidth);
      const textHeight = 45;

      // White background rectangle
      context.fillStyle = "rgba(255, 255, 255, 0.7)";
      context.fillRect(
        this.x - textWidth / 2 - 2,
        this.y - 45 - textHeight / 2 - 2,
        textWidth + 4,
        textHeight + 4
      );

      // Draw the cost text
      context.fillStyle = "#3300ff";
      context.fillText(costText, this.x, this.y - 55);

      // Draw the predecessor text
      context.fillStyle = "#ff3300";
      context.fillText(predText, this.x, this.y - 30);
    }
  }

  isPointInside(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= this.radius;
  }

  setClassname(newClass) {
    this.className = newClass;
  }

  setCost(newCost) {
    this.cost = newCost;
  }

  setPredecessor(predecessor) {
    this.predecessor = predecessor;
  }

  setHeuristicCost(newHeuristicCost) {
    this.heuristicCost = newHeuristicCost;
  }
}

function addVertex(x, y, name, color) {
  const vertex = new Vertex(x, y, name, color);
  vertices.push(vertex);

  // Create an edge to itself:
  const selfEdge = new Edge(vertex, vertex, 0);
  edges.push(selfEdge);
}

function drawVertices(context) {
  vertices.forEach((vertex) => vertex.draw(context));
}

function deleteVertex(clickedVertex) {
  if (clickedVertex) {
    const vertexIndex = vertices.findIndex(
      (vertex) => vertex.name === clickedVertex.name
    );

    if (vertexIndex !== -1) {
      alphabetStack.push(clickedVertex.name);
      sortAlphabetStackDescending(alphabetStack);
      vertices.splice(vertexIndex, 1);

      edges = edges.filter((edge) => {
        return edge.vertex1 !== clickedVertex && edge.vertex2 !== clickedVertex;
      });

      drawnEdges = drawnEdges.filter((drawmEdge) => {
        return (
          drawmEdge.vertex1 !== clickedVertex &&
          drawmEdge.vertex2 !== clickedVertex
        );
      });

      updateCanvas();
    }
  }
}
function changeVertexColor(vertex, newClass) {
  if (vertex) {
    vertex.setClassname(newClass);
    updateCanvas();
  } else {
    console.log("Vertex not found.");
  }
}

// -----------------------------------------------------------------------------
// NAMES OF VERTICES:

function getNextVertexName() {
  const name = String.fromCharCode(65 + currentNameIndex);
  currentNameIndex = (currentNameIndex + 1) % 26;
  return name;
}

function drawVertexCosts(context) {
  vertices.forEach((vertex) => {
    vertex.draw(context);
  });
}

const alphabetStack = [];

for (let i = 25; i >= 0; i--) {
  alphabetStack.push(String.fromCharCode(65 + i));
}

// Sorting the stack
function sortAlphabetStackDescending(stack) {
  // Locale compares if a string is before another:
  stack.sort((a, b) => b.localeCompare(a));
}


// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// EDGES / EDGES / EDGES / EDGES / EDGES / EDGES / EDGES / EDGES

class Edge {
  constructor(vertex1, vertex2, weight = 0) {
    this.vertex1 = vertex1;
    this.vertex2 = vertex2;
    this.name = vertex1.name + vertex2.name;
    this.color = edgeDefaultColor;
    this.weight = weight;
  }

  draw(context) {
    context.strokeStyle = this.color;
    context.lineWidth = 2;

    // Draw the line:
    context.beginPath();
    context.moveTo(this.vertex1.x, this.vertex1.y + 5);
    context.lineTo(this.vertex2.x, this.vertex2.y + 5);
    context.stroke();
    context.closePath();

    // Draw the weight in the middle of the edge:
    const middleX = (this.vertex1.x + this.vertex2.x) / 2;
    const middleY = (this.vertex1.y + this.vertex2.y) / 2;
    const text = this.weight.toString();

    context.fillStyle = edgeDefaultTextColor;
    context.font = "16px Arial";

    // Measure text width and height
    const textMetrics = context.measureText(text);
    const textWidth = textMetrics.width;
    const textHeight = parseInt(context.font, 10); 

    // Draw the background rectangle
    context.fillStyle = "#07eb9f";
    context.fillRect(
      middleX - textWidth / 2 - 4,
      middleY - textHeight / 2 - 4,
      textWidth + 8,
      textHeight + 8
    );

    // Draw the border around the rectangle
    context.strokeStyle = edgeDefaultColor;
    context.lineWidth = 1;
    context.strokeRect(
      middleX - textWidth / 2 - 4,
      middleY - textHeight / 2 - 4,
      textWidth + 8,
      textHeight + 8
    );

    // Draw the text
    context.fillStyle = edgeDefaultTextColor;
    context.fillText(
      this.weight,
      middleX - textWidth / 2 + 4,
      middleY + textHeight / 2 - 4
    );
  }

  setColor(newColor) {
    this.color = newColor;
  }
}

function addEdge(vertex1, vertex2) {
  // Check if the edge exists:
  const edgeExists = edges.some(
    (edge) =>
      (edge.vertex1 === vertex1 && edge.vertex2 === vertex2) ||
      (edge.vertex1 === vertex2 && edge.vertex2 === vertex1)
  );

  if (!edgeExists) {
    // Creating undirected graph:

    const edge1 = new Edge(vertex1, vertex2);
    const edge2 = new Edge(vertex2, vertex1);
    currentEdge = edge1;
    currentEdgeRev = edge2;
    showWeightPopup();
  } else {
    clearSelectedVertices();
    alert("Edge between these vertices already exists.");
  }
  updateCanvas();
}

function drawEdges(context) {
  drawnEdges.forEach((edge) => edge.draw(context));
}

function changeEdgeColor(edge, newColor) {
  if (edge) {
    edge.setColor(newColor);
    updateCanvas();
  } else {
    console.log("Edge not found.");
  }
}

function showWeightPopup() {
  const popup = document.getElementById("popup");
  popup.classList.add("active");
}

function confirmWeight() {
  const weightInput = document.getElementById("edge-weight");
  let weight = parseInt(weightInput.value, 10);

  if (weight < 0) {
    weight = 0;
    window.alert(
      "You cannot set weights less than 0. Automatic weight set to 0."
    );
  }

  if (currentEdge) {
    const edgeIndex = edges.findIndex(
      (edge) =>
        edge.vertex1 === currentEdge.vertex1 &&
        edge.vertex2 === currentEdge.vertex2
    );

    const edgeIndexRev = edges.findIndex(
      (edge) =>
        edge.vertex1 === currentEdge.vertex2 &&
        edge.vertex2 === currentEdge.vertex1
    );

    if (edgeIndex !== -1 && edgeIndexRev !== -1) {
      edges[edgeIndex].weight = weight;
      edges[edgeIndexRev].weight = weight;
    } else {
      currentEdge.weight = weight;
      currentEdgeRev.weight = weight;
      drawnEdges.push(currentEdge);
      edges.push(currentEdge);
      edges.push(currentEdgeRev);
      updateCanvas();
    }
  }

  clearSelectedVertices();
  const popup = document.getElementById("popup");
  popup.classList.remove("active");
  updateCanvas();
}

function isClickInsideWeightBox(edge, x, y) {
  const weightBoxWidth = 30;
  const weightBoxHeight = 20;

  const edgeCenterX = (edge.vertex1.x + edge.vertex2.x) / 2;
  const edgeCenterY = (edge.vertex1.y + edge.vertex2.y) / 2;

  const weightBoxX = edgeCenterX - weightBoxWidth / 2;
  const weightBoxY = edgeCenterY - weightBoxHeight / 2;

  if (
    x >= weightBoxX &&
    x <= weightBoxX + weightBoxWidth &&
    y >= weightBoxY &&
    y <= weightBoxY + weightBoxHeight
  ) {
    return true;
  }
  return false;
}

function clearSelectedVertices() {
  selectedVertices.forEach((selectedVertex) => {
    // Finds the selected vertices inside the vertices array
    let tempVertex = vertices.find((vertex) => {
      return vertex.name === selectedVertex.name;
    });
    if (tempVertex) {
      tempVertex.className = "vertex-default";
    }
  });

  selectedVertices = [];
  currentEdge = null;
  currentEdgeRev = null;
  updateCanvas();
}
// -----------------------------------------------------------------------------
// Deleting Edges:

function deleteEdge(vertex1, vertex2) {
  if (vertex1 === vertex2) {
    console.log("You cannot delete self edge.");
    return;
  }
  // Find the index of the edge in the array:
  const index = edges.findIndex(
    (edge) => edge.vertex1 === vertex1 && edge.vertex2 === vertex2
  );

  const indexRev = edges.findIndex(
    (edge) => edge.vertex1 === vertex2 && edge.vertex2 === vertex1
  );

  // Deleting the reversed edge:
  if (indexRev !== -1) {
    edges.splice(indexRev, 1);
  }

  if (index !== -1) {
    // Remove from drawnEdges
    edges.splice(index, 1);

    const drawnIndex = drawnEdges.findIndex(
      (drawnEdge) =>
        (drawnEdge.vertex1 === vertex1 && drawnEdge.vertex2 === vertex2) ||
        (drawnEdge.vertex1 === vertex2 && drawnEdge.vertex2 === vertex1)
    );

    if (drawnIndex !== -1) {
      drawnEdges.splice(drawnIndex, 1);
    }
  } else {
    console.log(`Edge between ${vertex1.name} and ${vertex2.name} not found.`);
  }
}

function findEdgeAtPoint(x, y) {
  const tolerance = 6;
  for (let edge of drawnEdges) {
    if (
      isPointNearLine(
        x,
        y,
        edge.vertex1.x,
        edge.vertex1.y,
        edge.vertex2.x,
        edge.vertex2.y,
        tolerance
      )
    ) {
      return edge;
    }
  }
  return null;
}

function isPointNearLine(px, py, x1, y1, x2, y2, tolerance) {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  const param = len_sq !== 0 ? dot / len_sq : -1;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;
  return dx * dx + dy * dy <= tolerance * tolerance;
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// DIJKSTRA / DIJKSTRA / DIJKSTRA / DIJKSTRA / DIJKSTRA / DIJKSTRA / DIJKSTRA

async function runDijkstrasScreen() {
  isDijkstraRunning = true;

  disableMouseEvents();
  disableButtons();

  const sourceText = "Select starting vertex: ";
  let sourceLetter = prompt(sourceText);
  const targetText = "Select target vertex: ";
  let targetLetter = prompt(targetText);

  if (!sourceLetter || !targetLetter) {
    alert("Please specify both, source and target vertices.");
    console.log("Please specify both, source and target vertices.");
    enableMouseEvents();
    enableButtons();
    isDijkstraRunning = false;
    return;
  }

  sourceLetter = sourceLetter.toUpperCase();
  targetLetter = targetLetter.toUpperCase();

  if (sourceLetter.length > 1 || targetLetter.length > 1) {
    alert("Please write a single letter for both source and target vertex.");
    console.log(
      "Please write a single letter for both source and target vertex."
    );
    enableMouseEvents();
    enableButtons();
    isDijkstraRunning = false;
    return;
  }

  const startVertex = sourceLetter.charCodeAt(0) - 65;
  const targetVertex = targetLetter.charCodeAt(0) - 65;

  console.log("This is startVertex", startVertex);
  console.log("This is targetVertex", targetVertex);
  if (startVertex < 0 || targetVertex < 0) {
    alert("Please only write letters for source and target vertices.");
    console.log("Please only write letters for source and target vertices.");
    enableMouseEvents();
    enableButtons();
    isDijkstraRunning = false;
    return;
  }

  if (isNaN(startVertex) || isNaN(targetVertex)) {
    enableMouseEvents();
    enableButtons();
    alert("Please specify, valid source and target vertices.");
    console.log("Please specify both, source and target vertices.");
    isDijkstraRunning = false;
    return;
  }

  const source = vertices[startVertex];
  const target = vertices[targetVertex];

  if (!source || !target) {
    alert("Please specify, valid source and target vertices.");
    console.log("Please specify, valid source and target vertices.");
    enableMouseEvents();
    enableButtons();
    isDijkstraRunning = false;
    return;
  }

  if (sourceLetter === targetLetter) {
    await sleep(500);
    changeVertexColor(target, "vertex-exploring");
    target.setPredecessor(source);
    await sleep(2000);
    changeVertexColor(target, "vertex-shortestPathTarget");
    await sleep(2000);
    isDijkstraRunning = false;
    resetGraph();
    enableMouseEvents();
    enableButtons();
    return;
  }

  const result = await dijkstraSreenCondition(source);
  console.log("This is the path: ", result);

  if (result.distances[target.name] === Infinity) {
    alert("The source and the target values are not connected over any path.");
    console.log(
      "The source and the target values are not connected over any path."
    );
    resetGraph();
    enableMouseEvents();
    enableButtons();
    isDijkstraRunning = false;
    return;
  }

  const pathOfObjects = await shortestPathFunct(
    result.predecessors,
    source,
    target
  );

  const shortestPath = getShortestPath(pathOfObjects);
  console.log("Shortest path by dijsktras is: ", shortestPath);
  
  updateCanvas();

  await sleep(15000); // Time for people to look at the graph.
  isDijkstraRunning = false;

  resetGraph();
  enableMouseEvents();
  enableButtons();
}

async function dijkstraSreenCondition(source) {
  isDijkstraRunning = true;

  const distances = {};
  const predecessors = {};
  const pq = new PriorityQueue();
  const exploredVertices = new Set();

  vertices.forEach((vertex) => {
    distances[vertex.name] = Infinity;
    predecessors[vertex.name] = null;
    vertex.setCost(Infinity);
  });

  distances[source.name] = 0;
  source.setCost(0);
  source.setPredecessor(source);

  edges.sort((a, b) => {
    if (a.weight !== b.weight) {
      return a.weight - b.weight;
    } else {
      const aNames = [a.vertex1.name, a.vertex2.name].sort().join();
      const bNames = [b.vertex1.name, b.vertex2.name].sort().join();
      return aNames.localeCompare(bNames);
    }
  });

  pq.enqueue(source, 0);

  while (!pq.isEmpty()) {
    const currentVertex = pq.dequeue().element;

    if (exploredVertices.has(currentVertex.name)) {
      continue; 
    }

    exploredVertices.add(currentVertex.name);

    changeVertexColor(currentVertex, "vertex-selected");
    await sleep(1000); 

    for (const edge of edges) {
      let neighbor;
      if (edge.vertex1 === currentVertex) {
        neighbor = edge.vertex2;
      } else if (edge.vertex2 === currentVertex) {
        neighbor = edge.vertex1;
      } else {
        continue;
      }

      if (!exploredVertices.has(neighbor.name)) {
        const newDist = distances[currentVertex.name] + edge.weight;
        if (newDist < distances[neighbor.name]) {
          distances[neighbor.name] = newDist;
          predecessors[neighbor.name] = currentVertex;
          neighbor.setCost(newDist);
          neighbor.setPredecessor(currentVertex);

          if (!pq.contains(neighbor)) {
            pq.enqueue(neighbor, newDist);
          }

          // Visualize the edge relaxation step
          changeEdgeColor(edge, edgeExplorationStepColor); 
          await sleep(2000);
          changeEdgeColor(edge, edgeDefaultColor);

          await sleep(500); 
        }
      }
    }
    changeVertexColor(currentVertex, "vertex-explored");
    console.table(distances);
    console.table(predecessors);
    await sleep(3000); 
  }

  console.log("Distances: ", distances);
  console.log("Predecessors: ", predecessors);
  return { distances, predecessors };
}

// Utility function to sleep for visualization delay
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Priority Queue implementation
class PriorityQueue {
  constructor() {
    this.items = [];
  }

  enqueue(element, priority) {
    if (this.contains(element)) {
      return; 
    }

    const queueElement = { element, priority };
    let added = false;

    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].priority > queueElement.priority) {
        this.items.splice(i, 0, queueElement);
        added = true;
        break;
      }
    }

    if (!added) {
      this.items.push(queueElement);
    }
  }

  dequeue() {
    return this.items.shift();
  }

  isEmpty() {
    return this.items.length === 0;
  }

  contains(element) {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].element === element) {
        return true;
      }
    }
    return false;
  }
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// SHOWING THE SHORTEST PATH / SHOWING THE SHORTEST PATH / SHOWING THE SHORTEST PATH

async function shortestPathFunct(predecessors, source, target) {
  let current = target;
  const path = [];

  while (current !== source) {
    path.unshift(current);
    current = predecessors[current.name];
  }

  path.unshift(current); 

  for (let i = 0; i < path.length - 1; i++) {
    const vertex = path[i];
    const nextVertex = path[i + 1];
    const edge = edges.find(
      (edge) =>
        (edge.vertex1 === vertex && edge.vertex2 === nextVertex) ||
        (edge.vertex1 === nextVertex && edge.vertex2 === vertex)
    );

    // Source vertex
    changeVertexColor(vertex, "vertex-shortestPath");
    await sleep(2000); 

    // Change the color of the target vertex
    changeVertexColor(target, "vertex-shortestPathTarget");
    await sleep(2000);

    if (edge) {
      changeEdgeColor(edge, edgeShortestPathColor);
      await sleep(2000); 
    }
  }

  return path;
}

async function shortestPathRobotFunct(predecessors, source, target) {
  let current = target;
  const path = [];

  while (current !== source) {
    path.unshift(current);
    current = predecessors[current.name];
  }

  path.unshift(current); 
  return path;
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// A-STAR A-STAR A-STAR A-STAR A-STAR A-STAR A-STAR A-STAR A-STAR A-STAR A-STAR

async function runAStar() {
  isAStarRunning = true;

  disableMouseEvents();
  disableButtons();

  const sourceText = "Select starting vertex: ";
  let sourceLetter = prompt(sourceText);
  const targetText = "Select target vertex: ";
  let targetLetter = prompt(targetText);

  if (!sourceLetter || !targetLetter) {
    alert("Please specify both, source and target vertices.");
    console.log("Please specify both, source and target vertices.");
    enableMouseEvents();
    enableButtons();
    isAStarRunning = false;
    return;
  }

  sourceLetter = sourceLetter.toUpperCase();
  targetLetter = targetLetter.toUpperCase();

  if (sourceLetter.length > 1 || targetLetter.length > 1) {
    alert("Please write a single letter for both source and target vertex.");
    console.log(
      "Please write a single letter for both source and target vertex."
    );
    enableMouseEvents();
    enableButtons();
    isAStarRunning = false;
    return;
  }

  const startVertex = sourceLetter.charCodeAt(0) - 65;
  const targetVertex = targetLetter.charCodeAt(0) - 65;

  console.log("This is startVertex", startVertex);
  console.log("This is targetVertex", targetVertex);
  if (startVertex < 0 || targetVertex < 0) {
    alert("Please only write letters for source and target vertices.");
    console.log("Please only write letters for source and target vertices.");
    enableMouseEvents();
    enableButtons();
    isAStarRunning = false;
    return;
  }

  if (isNaN(startVertex) || isNaN(targetVertex)) {
    enableMouseEvents();
    enableButtons();
    alert("Please specify valid source and target vertices.");
    console.log("Please specify both, valid source and target vertices.");
    isAStarRunning = false;
    return;
  }

  const source = vertices[startVertex];
  const target = vertices[targetVertex];

  if (!source || !target) {
    alert("Please specify valid source and target vertices.");
    console.log("Please specify valid source and target vertices.");
    enableMouseEvents();
    enableButtons();
    isAStarRunning = false;
    return;
  }

  if (sourceLetter === targetLetter) {
    await sleep(500);
    changeVertexColor(target, "vertex-exploring");
    await sleep(2000);
    target.setPredecessor(source);
    changeVertexColor(target, "vertex-shortestPathTarget");
    await sleep(2000);
    changeVertexColor(target, "vertex-default");
    enableMouseEvents();
    enableButtons();
    isAStarRunning = false;
    resetGraph();
    return;
  }

  const result = await aStar(source, target);
  console.log("This is the path: ", result);

  if (result.distances[target.name] === Infinity) {
    alert("The source and the target values are not connected over any path.");
    console.log(
      "The source and the target values are not connected over any path."
    );
    resetGraph();
    enableMouseEvents();
    enableButtons();
    isAStarRunning = false;
    return;
  }

  const pathOfObjects = await shortestPathFunct(
    result.predecessors,
    source,
    target
  );

  const shortestPath = getShortestPath(pathOfObjects);
  console.log("This is the shortest pathh: using astarus: ", shortestPath);
  updateCanvas();
  await sleep(15000); // Time for people to look at the graph.
  isAStarRunning = false;
  resetGraph();
  enableMouseEvents();
  enableButtons();
}

async function aStar(source, target) {
  const openSet = new PriorityQueue();
  openSet.enqueue(source, 0);

  const cameFrom = {};
  const gScore = {};
  const fScore = {};

  vertices.forEach((vertex) => {
    gScore[vertex.name] = Infinity;
    fScore[vertex.name] = Infinity;
    vertex.setCost(Infinity);
    vertex.setPredecessor(null);
    vertex.setHeuristicCost(heuristic(vertex, target));
  });

  gScore[source.name] = 0;
  fScore[source.name] = heuristic(source, target);
  source.setCost(0);
  source.setPredecessor(source);

  while (!openSet.isEmpty()) {
    const current = openSet.dequeue().element;

    if (current === target) {
      break;
    }

    changeVertexColor(current, "vertex-selected");
    await sleep(2000);

    for (const edge of edges) {
      let neighbor;
      if (edge.vertex1 === current) {
        neighbor = edge.vertex2;
      } else if (edge.vertex2 === current) {
        neighbor = edge.vertex1;
      } else {
        continue;
      }

      const tentativeGScore = gScore[current.name] + edge.weight;

      if (tentativeGScore < gScore[neighbor.name]) {
        cameFrom[neighbor.name] = current;
        gScore[neighbor.name] = tentativeGScore;
        fScore[neighbor.name] = tentativeGScore + heuristic(neighbor, target);
        neighbor.setCost(gScore[neighbor.name]);
        neighbor.setPredecessor(current);

        if (!openSet.contains(neighbor)) {
          openSet.enqueue(neighbor, fScore[neighbor.name]);
          console.log("Priority queue neighbor: ", openSet);
        }

        changeEdgeColor(edge, edgeExplorationStepColor);
        await sleep(2000);
        changeEdgeColor(edge, edgeDefaultColor);
        await sleep(500);
      }
    }
    changeVertexColor(current, "vertex-explored");
    console.table(gScore);
    console.table(fScore);
    await sleep(3000);
  }
  changeVertexColor(target, "vertex-selected");
  await sleep(1000);

  changeVertexColor(target, "vertex-explored");
  await sleep(2000);

  return { distances: gScore, predecessors: cameFrom };
}

function heuristic(vertex, target) {
  const visited = new Set();
  const queue = [[vertex, 0]]; 

  while (queue.length > 0) {
    const [current, distance] = queue.shift();

    if (current === target) {
      return distance;
    }

    visited.add(current);

    for (const edge of edges) {
      let neighbor = null;

      if (edge.vertex1 === current && !visited.has(edge.vertex2)) {
        neighbor = edge.vertex2;
      } else if (edge.vertex2 === current && !visited.has(edge.vertex1)) {
        neighbor = edge.vertex1;
      }

      if (neighbor && !visited.has(neighbor)) {
        queue.push([neighbor, distance + 1]);
      }
    }
  }

  return Infinity;
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
//  BELLMANFORD BELLMANFORD  BELLMANFORD  BELLMANFORD  BELLMANFORD  BELLMANFORD

async function runBellmanFord() {
  isRunningBellmanFord = true;
  disableMouseEvents();
  disableButtons();

  const sourceText = "Select starting vertex: ";
  let sourceLetter = prompt(sourceText);
  const targetText = "Select target vertex: ";
  let targetLetter = prompt(targetText);

  if (!sourceLetter || !targetLetter) {
    alert("Please specify both, source and target vertices.");
    console.log("Please specify both, source and target vertices.");
    enableMouseEvents();
    enableButtons();
    isRunningBellmanFord = false;
    return;
  }

  sourceLetter = sourceLetter.toUpperCase();
  targetLetter = targetLetter.toUpperCase();

  if (sourceLetter.length > 1 || targetLetter.length > 1) {
    alert("Please write a single letter for both source and target vertex.");
    console.log(
      "Please write a single letter for both source and target vertex."
    );
    enableMouseEvents();
    enableButtons();
    isRunningBellmanFord = false;
    return;
  }

  const startVertex = sourceLetter.charCodeAt(0) - 65;
  const targetVertex = targetLetter.charCodeAt(0) - 65;

  console.log("This is startVertex", startVertex);
  console.log("This is targetVertex", targetVertex);
  if (startVertex < 0 || targetVertex < 0) {
    alert("Please only write letters for source and target vertices.");
    console.log("Please only write letters for source and target vertices.");
    enableMouseEvents();
    enableButtons();
    isRunningBellmanFord = false;
    return;
  }

  if (isNaN(startVertex) || isNaN(targetVertex)) {
    enableMouseEvents();
    enableButtons();
    alert("Please specify valid source and target vertices.");
    console.log("Please specify both, valid source and target vertices.");
    isRunningBellmanFord = false;
    return;
  }

  const source = vertices[startVertex];
  const target = vertices[targetVertex];

  if (!source || !target) {
    alert("Please specify valid source and target vertices.");
    console.log("Please specify valid source and target vertices.");
    enableMouseEvents();
    enableButtons();
    isRunningBellmanFord = false;
    return;
  }

  if (sourceLetter === targetLetter) {
    await sleep(1000);
    changeVertexColor(target, "vertex-exploring");
    await sleep(2000);
    target.setPredecessor(source);
    changeVertexColor(target, "vertex-shortestPathTarget");
    await sleep(2000);
    changeVertexColor(target, "vertex-default");
    enableMouseEvents();
    enableButtons();
    isRunningBellmanFord = false;
    resetGraph();
    return;
  }

  const result = await bellmanFord(source);
  console.log("This is the path: ", result);

  if (result.distances[target.name] === Infinity) {
    alert("The source and the target values are not connected over any path.");
    console.log(
      "The source and the target values are not connected over any path."
    );
    resetGraph();
    enableMouseEvents();
    enableButtons();
    isRunningBellmanFord = false;
    return;
  }

  const pathOfObjects = await shortestPathFunct(
    result.predecessors,
    source,
    target
  );

  const shortestPath = getShortestPath(pathOfObjects);
  console.log("This is the shortest pathh: using astarus: ", shortestPath);
  updateCanvas();
  await sleep(15000); // Time for people to look at the graph.
  isRunningBellmanFord = false;
  resetGraph();
  enableMouseEvents();
  enableButtons();
  hideBellmanFordInfo();
}

async function bellmanFord(source) {
  const distances = {};
  const predecessors = {};
  let updated = false;
  const totalIterations = vertices.length - 1;

  vertices.forEach((vertex) => {
    distances[vertex.name] = Infinity;
    predecessors[vertex.name] = null;
    vertex.setCost(Infinity);
    vertex.setPredecessor(null);
  });

  distances[source.name] = 0;
  source.setCost(0);
  source.setPredecessor(source);

  for (let i = 0; i < totalIterations; i++) {
    console.log(`Iteration ${i + 1}`);
    updated = false;

    drawIterationInfo(i + 1, totalIterations);

    for (const vertex of vertices) {
      changeVertexColor(vertex, "vertex-selected");
      await sleep(1000);
      for (const edge of edges) {
        if (edge.vertex1 !== vertex) continue;

        const u = edge.vertex1;
        const v = edge.vertex2;

        let drawnEdge = drawnEdges.find(
          (e) =>
            (e.vertex1 === u && e.vertex2 === v) ||
            (e.vertex1 === v && e.vertex2 === u)
        );

        changeEdgeColor(drawnEdge, edgeExplorationStepColor);
        await sleep(1000);

        if (distances[u.name] + edge.weight < distances[v.name]) {
          distances[v.name] = distances[u.name] + edge.weight;
          predecessors[v.name] = u;
          v.setCost(distances[v.name]);
          v.setPredecessor(u);
          updated = true;
          console.log(`Updated ${v.name}: new distance = ${distances[v.name]}`);
        }

        changeEdgeColor(drawnEdge, edgeDefaultColor);
        await sleep(1000);
      }

      changeVertexColor(vertex, "vertex-explored");
      await sleep(500);
    }

    vertices.forEach((vertex) => changeVertexColor(vertex, "vertex-default"));
    await sleep(500);
    updateCanvas();

    if (!updated) {
      console.log("No updates in this iteration. Stopping early.");
      drawIterationInfo(i + 1, totalIterations, true);
      await sleep(2000);
      break;
    }
  }

  // Check for negative-weight cycles
  for (const edge of edges) {
    const u = edge.vertex1;
    const v = edge.vertex2;
    if (distances[u.name] + edge.weight < distances[v.name]) {
      return { hasNegativeCycle: true };
    }
  }

  return { distances, predecessors, hasNegativeCycle: false };
}

function showBellmanFordPseudo() {
  const popup = document.getElementById("popup-bellmanFordPseudo");
  popup.classList.add("active");
}

function closeBellmanFordPseudo() {
  const popup = document.getElementById("popup-bellmanFordPseudo");
  popup.classList.remove("active");
}

function drawIterationInfo(
  currentIteration,
  totalIterations,
  stoppedEarly = false
) {
  const infoDiv = document.getElementById("bellmanFordInfo");
  const currentIterationP = document.getElementById("currentIteration");
  const totalIterationsP = document.getElementById("totalIterations");
  const earlyStopP = document.getElementById("earlyStop");
  const numOfVertices = totalIterations + 1;

  infoDiv.style.display = "block";
  totalIterationsP.textContent = `Total iterations: # Vertices: ${numOfVertices} -  1 = ${totalIterations}`;
  currentIterationP.textContent = `Current Iteration: ${currentIteration} / ${totalIterations}`;

  if (stoppedEarly) {
    earlyStopP.textContent = "Stopped early: No updates in last iteration";
    earlyStopP.style.color = "green";
  } else {
    earlyStopP.textContent = "";
  }
}

function hideBellmanFordInfo() {
  const infoDiv = document.getElementById("bellmanFordInfo");
  infoDiv.style.display = "none";
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// ROBOTS ROBOTS ROBOTS ROBOTS ROBOTS ROBOTS ROBOTS ROBOTS ROBOTS ROBOTS

class RobotNavigator {
  constructor(initialRotation = 45) {
    this.totalRotation = initialRotation; // Initial rotation of the robot
  }

  calculateAngleAndDistance(sourcePoint, targetPoint) {
    // Transform the points
    const { readableX: sourceX, readableY: sourceY } =
      convertToReadableCoordinates(...sourcePoint);
    const { readableX: targetX, readableY: targetY } =
      convertToReadableCoordinates(...targetPoint);

    // Calculate the change in x and y coordinates
    const deltaX = targetX - sourceX;
    const deltaY = targetY - sourceY;

    // Calculate angle
    const angleRad = Math.atan2(deltaY, deltaX);
    const angleDeg = (angleRad * 180) / Math.PI;

    // Adjust for total rotation
    const adjustedAngle = angleDeg - this.totalRotation;

    // Normalize angle to be between -180 and 180 degrees
    let normalizedAngle = adjustedAngle % 360;
    if (normalizedAngle > 180) {
      normalizedAngle -= 360;
    }

    // Calculate distance
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    return {
      angle: normalizedAngle,
      distance: distance,
    };
  }

  calculateWaitTimeForAngle(angle) {
    const waitTime = Math.abs(angle) * 7; // 7ms per degree
    return waitTime;
  }

  calculateWaitTimeForDistance(distance) {
    const distanceInCm = distance * 3;
    const waitTime = (distanceInCm / 10) * 706; // 706ms per 10 cm
    return waitTime;
  }

  updateRotation(angle) {
    this.totalRotation += angle;
    this.totalRotation %= 360;
    if (this.totalRotation > 180) {
      this.totalRotation -= 360;
    }
  }
}

// CALCULATING TIME FOR SHORTEST PATH WITH ROBOT:
async function calculateTotalTraversalTime(pathOfObjects, navigator) {
  let totalWaitTime = 0;

  for (let i = 0; i < pathOfObjects.length - 1; i++) {
    const source = pathOfObjects[i];
    const target = pathOfObjects[i + 1];
    console.log("This is a source: ", source);
    console.log("This is the target: ", target);
    const sourcePos = [source.x, source.y];
    const targetPos = [target.x, target.y];

    // Calculate movement details
    const movement = navigator.calculateAngleAndDistance(sourcePos, targetPos);
    const angleWaitTime = navigator.calculateWaitTimeForAngle(movement.angle);
    const distanceWaitTime = navigator.calculateWaitTimeForDistance(
      movement.distance
    );

    // Sum up wait times
    totalWaitTime += angleWaitTime + distanceWaitTime;

    // Optional: Log each segment's wait time
    console.log(`Moving from ${source.name} to ${target.name}`);
    console.log(`Angle Wait Time: ${angleWaitTime} ms`);
    console.log(`Distance Wait Time: ${distanceWaitTime} ms`);
    console.log(
      `Total Segment Wait Time: ${angleWaitTime + distanceWaitTime} ms`
    );
  }

  console.log(`Total Traversal Time: ${totalWaitTime} ms`);

  return totalWaitTime;
}

function calculateMovementDetails(source, target, navigator) {
  const sourcePos = [source.x, source.y];
  const targetPos = [target.x, target.y];

  const movement = navigator.calculateAngleAndDistance(sourcePos, targetPos);
  const angleWaitTime = navigator.calculateWaitTimeForAngle(movement.angle);
  const distanceWaitTime = navigator.calculateWaitTimeForDistance(
    movement.distance
  );
  const totalWaitTime = angleWaitTime + distanceWaitTime;

  return totalWaitTime;
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// SPECIAL FUNCTIONS / SPECIAL FUNCTIONS / SPECIAL FUNCTIONS / SPECIAL FUNCTIONS

async function celebrate(spins) {
  const duration = spins * 2220;
  const fileName = "celebrate.txt";
  const fileContent = spins.toString();

  await downloadAndWait(fileName, fileContent, duration);

  console.log(`Celebrating with ${spins} spins!`);
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// DIJKSTRA DIJKSTRA DIJKSTRA DIJKSTRA DIJKSTRA DIJKSTRA DIJKSTRA DIJKSTRA DIJKSTRA

async function runDijkstrasRobotCondition() {
  isDijkstraRunning = true;

  const navigator = new RobotNavigator();

  disableMouseEvents();
  disableButtons();

  const sourceText = "Select starting vertex: ";
  let sourceLetter = prompt(sourceText);
  const targetText = "Select target vertex: ";
  let targetLetter = prompt(targetText);

  if (!sourceLetter || !targetLetter) {
    alert("Please specify both, source and target vertices.");
    console.log("Please specify both, source and target vertices.");
    enableMouseEvents();
    enableButtons();
    isDijkstraRunning = false;
    return;
  }

  sourceLetter = sourceLetter.toUpperCase();
  targetLetter = targetLetter.toUpperCase();

  if (sourceLetter.length > 1 || targetLetter.length > 1) {
    alert("Please write a single letter for both source and target vertex.");
    console.log(
      "Please write a single letter for both source and target vertex."
    );
    enableMouseEvents();
    enableButtons();
    isDijkstraRunning = false;
    return;
  }

  const startVertex = sourceLetter.charCodeAt(0) - 65;
  const targetVertex = targetLetter.charCodeAt(0) - 65;

  console.log("This is startVertex", startVertex);
  console.log("This is targetVertex", targetVertex);
  if (startVertex < 0 || targetVertex < 0) {
    alert("Please only write letters for source and target vertices.");
    console.log("Please only write letters for source and target vertices.");
    enableMouseEvents();
    enableButtons();
    isDijkstraRunning = false;
    return;
  }

  if (isNaN(startVertex) || isNaN(targetVertex)) {
    enableMouseEvents();
    enableButtons();
    alert("Please specify, valid source and target vertices.");
    console.log("Please specify both, source and target vertices.");
    isDijkstraRunning = false;
    return;
  }

  const source = vertices[startVertex];
  const target = vertices[targetVertex];

  if (!source || !target) {
    alert("Please specify, valid source and target vertices.");
    console.log("Please specify, valid source and target vertices.");
    enableMouseEvents();
    enableButtons();
    isDijkstraRunning = false;
    return;
  }

  if (sourceLetter === targetLetter) {
    await sleep(1500);
    target.setPredecessor(source);
    updateCanvas();
    await celebrate(2);
    isDijkstraRunning = false;
    resetGraph();
    enableMouseEvents();
    enableButtons();
    return;
  }

  const result = await dijkstraRobotCondition(source, navigator);

  if (result.distances[target.name] === Infinity) {
    alert("The source and the target values are not connected over any path.");
    console.log(
      "The source and the target values are not connected over any path."
    );
    resetGraph();
    enableMouseEvents();
    enableButtons();
    isDijkstraRunning = false;
    return;
  }

  const pathOfObjects = await shortestPathRobotFunct(
    result.predecessors,
    source,
    target
  );

  const totalWaitTime = calculateMovementDetails(target, source, navigator);
  console.log(
    "We are currently at: ",
    target,
    " to get to: ",
    source,
    " it will take: ",
    totalWaitTime + 2500
  );

  await downloadAndWait(`selectedVertex.txt`, `${source.name}`, totalWaitTime);
  await sleep(totalWaitTime + 2500);

  const shortestPath = getShortestPath(pathOfObjects);

  const totalTraversalTime = await calculateTotalTraversalTime(
    pathOfObjects,
    navigator
  );

  console.log(
    "Traversing the shortest path: ",
    shortestPath,
    " it will take: ",
    totalTraversalTime
  );

  await downloadAndWait(
    `shortestPath.txt`,
    `${shortestPath}`,
    totalTraversalTime
  );
  await sleep(totalTraversalTime + 500);

  updateCanvas();

  celebrate(1);

  await sleep(15000); // Time for people to look at the graph.
  isDijkstraRunning = false;

  resetGraph();
  enableMouseEvents();
  enableButtons();
}

async function dijkstraRobotCondition(source, navigator) {
  await downloadVertexPositions();
  await downloadAdjacency();
  const distances = {};
  const predecessors = {};
  const pq = new PriorityQueue();
  const exploredVertices = new Set();
  let previousVertex = null;

  vertices.forEach((vertex) => {
    distances[vertex.name] = Infinity;
    predecessors[vertex.name] = null;
    vertex.setCost(Infinity);
  });

  distances[source.name] = 0;
  source.setCost(0);
  source.setPredecessor(source);

  edges.sort((a, b) => {
    if (a.weight !== b.weight) {
      return a.weight - b.weight;
    } else {
      const aNames = [a.vertex1.name, a.vertex2.name].sort().join();
      const bNames = [b.vertex1.name, b.vertex2.name].sort().join();
      return aNames.localeCompare(bNames);
    }
  });

  // Initialize priority queue
  pq.enqueue(source, 0);
  updateCanvas();

  while (!pq.isEmpty()) {
    const currentVertex = pq.dequeue().element;

    if (exploredVertices.has(currentVertex.name)) {
      continue;
    }

    exploredVertices.add(currentVertex.name);

    // Set the selected vertex:
    if (previousVertex !== null) {
      const totalWaitTime = calculateMovementDetails(
        previousVertex,
        currentVertex,
        navigator
      );
      console.log(
        "Moving from: ",
        previousVertex.name,
        " to: ",
        currentVertex.name,
        " will take: ",
        totalWaitTime
      );
      await downloadAndWait(
        `selectedVertex.txt`,
        `${currentVertex.name}`,
        totalWaitTime + 500
      );
      await sleep(totalWaitTime + 500);
    } else {
      // Initial vertex, no movement calculation needed
      await downloadAndWait(
        `selectedVertex.txt`,
        `${currentVertex.name}`,
        3000
      );
      await sleep(3000);
    }

    for (const edge of edges) {
      let neighbor;
      if (edge.vertex1 === currentVertex) {
        neighbor = edge.vertex2;
      } else if (edge.vertex2 === currentVertex) {
        neighbor = edge.vertex1;
      } else {
        continue;
      }

      if (!exploredVertices.has(neighbor.name)) {
        const newDist = distances[currentVertex.name] + edge.weight;
        if (newDist < distances[neighbor.name]) {
          distances[neighbor.name] = newDist;
          predecessors[neighbor.name] = currentVertex;
          neighbor.setCost(newDist);
          neighbor.setPredecessor(currentVertex);

          if (!pq.contains(neighbor)) {
            pq.enqueue(neighbor, newDist);
          }

          const pokeWaitTime = calculateMovementDetails(
            currentVertex,
            neighbor,
            navigator
          );
          console.log(
            "Poking from: ",
            currentVertex.name,
            " to: ",
            neighbor.name,
            " will take: ",
            pokeWaitTime
          );

          await downloadAndWait(
            `poke.txt`,
            `${neighbor.name}`,
            pokeWaitTime + 500
          );
          updateCanvas();

          await sleep(pokeWaitTime + 1500);

          console.log(
            "Reversing from: ",
            neighbor.name,
            " to: ",
            currentVertex.name,
            " will take: ",
            pokeWaitTime + 3000
          );
        }
      }
    }
    changeVertexColor(currentVertex, "vertex-explored");
    updateCanvas();
    previousVertex = currentVertex;

    await sleep(3000);
  }

  console.log("Distances: ", distances);
  console.log("Predecessors: ", predecessors);
  return { distances, predecessors };
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// A-STAR A-STAR A-STAR A-STAR A-STAR A-STAR A-STAR A-STAR A-STAR A-STAR A-STAR

async function runAStarRobot() {
  isAStarRunning = true;

  const navigator = new RobotNavigator();

  disableMouseEvents();
  disableButtons();

  const sourceText = "Select starting vertex: ";
  let sourceLetter = prompt(sourceText);
  const targetText = "Select target vertex: ";
  let targetLetter = prompt(targetText);

  if (!sourceLetter || !targetLetter) {
    alert("Please specify both, source and target vertices.");
    console.log("Please specify both, source and target vertices.");
    enableMouseEvents();
    enableButtons();
    isAStarRunning = false;
    return;
  }

  sourceLetter = sourceLetter.toUpperCase();
  targetLetter = targetLetter.toUpperCase();

  if (sourceLetter.length > 1 || targetLetter.length > 1) {
    alert("Please write a single letter for both source and target vertex.");
    console.log(
      "Please write a single letter for both source and target vertex."
    );
    enableMouseEvents();
    enableButtons();
    isAStarRunning = false;
    return;
  }

  const startVertex = sourceLetter.charCodeAt(0) - 65;
  const targetVertex = targetLetter.charCodeAt(0) - 65;

  console.log("This is startVertex", startVertex);
  console.log("This is targetVertex", targetVertex);
  if (startVertex < 0 || targetVertex < 0) {
    alert("Please only write letters for source and target vertices.");
    console.log("Please only write letters for source and target vertices.");
    enableMouseEvents();
    enableButtons();
    isAStarRunning = false;
    return;
  }

  if (isNaN(startVertex) || isNaN(targetVertex)) {
    enableMouseEvents();
    enableButtons();
    alert("Please specify valid source and target vertices.");
    console.log("Please specify both, valid source and target vertices.");
    isAStarRunning = false;
    return;
  }

  const source = vertices[startVertex];
  const target = vertices[targetVertex];

  if (!source || !target) {
    alert("Please specify valid source and target vertices.");
    console.log("Please specify valid source and target vertices.");
    enableMouseEvents();
    enableButtons();
    isAStarRunning = false;
    return;
  }

  if (sourceLetter === targetLetter) {
    await sleep(1500);
    target.setPredecessor(source);
    changeVertexColor(target, "vertex-shortestPathTarget");
    await celebrate(2);
    isAStarRunning = false;
    enableMouseEvents();
    enableButtons();
    resetGraph();
    return;
  }

  const result = await aStarRobot(source, target, navigator);

  if (result.distances[target.name] === Infinity) {
    alert("The source and the target values are not connected over any path.");
    console.log(
      "The source and the target values are not connected over any path."
    );
    resetGraph();
    enableMouseEvents();
    enableButtons();
    isAStarRunning = false;
    return;
  }

  const pathOfObjects = await shortestPathRobotFunct(
    result.predecessors,
    source,
    target
  );

  const totalWaitTime = calculateMovementDetails(target, source, navigator);
  console.log(
    "We are currently at: ",
    target,
    " to get to: ",
    source,
    " it will take: ",
    totalWaitTime + 2500
  );

  await downloadAndWait(`selectedVertex.txt`, `${source.name}`, totalWaitTime);
  await sleep(totalWaitTime + 2500);

  const shortestPath = getShortestPath(pathOfObjects);

  const totalTraversalTime = await calculateTotalTraversalTime(
    pathOfObjects,
    navigator
  );

  console.log(
    "Traversing the shortest path: ",
    shortestPath,
    " it will take: ",
    totalTraversalTime
  );

  await downloadAndWait(
    `shortestPath.txt`,
    `${shortestPath}`,
    totalTraversalTime
  );
  await sleep(totalTraversalTime + 500);
  updateCanvas();

  celebrate(1);

  await sleep(15000); // Time for people to look at the graph.
  isAStarRunning = false;
  resetGraph();
  enableMouseEvents();
  enableButtons();
}

async function aStarRobot(source, target, navigator) {
  await downloadVertexPositions();
  await downloadAdjacency();
  const openSet = new PriorityQueue();
  openSet.enqueue(source, 0);
  let previousVertex = source;

  const cameFrom = {};
  const gScore = {};
  const fScore = {};

  vertices.forEach((vertex) => {
    gScore[vertex.name] = Infinity;
    fScore[vertex.name] = Infinity;
    vertex.setCost(Infinity);
    vertex.setPredecessor(null);
    vertex.setHeuristicCost(heuristic(vertex, target));
  });

  updateCanvas();

  gScore[source.name] = 0;
  fScore[source.name] = heuristic(source, target);
  source.setCost(0);
  source.setPredecessor(source);
  updateCanvas();

  while (!openSet.isEmpty()) {
    const current = openSet.dequeue().element;

    if (current === target) {
      break;
    }

    const totalWaitTime = calculateMovementDetails(
      previousVertex,
      current,
      navigator
    );
    console.log(
      "Moving from: ",
      source.name,
      " to: ",
      current.name,
      " will take: ",
      totalWaitTime + 2500
    );
    await downloadAndWait(
      `selectedVertex.txt`,
      `${current.name}`,
      totalWaitTime + 2500
    );
    await sleep(totalWaitTime + 2500);

    for (const edge of edges) {
      let neighbor;
      if (edge.vertex1 === current) {
        neighbor = edge.vertex2;
      } else if (edge.vertex2 === current) {
        neighbor = edge.vertex1;
      } else {
        continue;
      }

      const tentativeGScore = gScore[current.name] + edge.weight;

      if (tentativeGScore < gScore[neighbor.name]) {
        cameFrom[neighbor.name] = current;
        gScore[neighbor.name] = tentativeGScore;
        fScore[neighbor.name] = tentativeGScore + heuristic(neighbor, target);
        neighbor.setCost(gScore[neighbor.name]);
        neighbor.setPredecessor(current);

        if (!openSet.contains(neighbor)) {
          openSet.enqueue(neighbor, fScore[neighbor.name]);
          console.log("Priority queue neighbor: ", openSet);
        }

        const pokeWaitTime = calculateMovementDetails(
          current,
          neighbor,
          navigator
        );
        console.log(
          "Poking from: ",
          current.name,
          " to: ",
          neighbor.name,
          " will take: ",
          pokeWaitTime
        );

        await downloadAndWait(
          `poke.txt`,
          `${neighbor.name}`,
          pokeWaitTime + 500
        );
        updateCanvas();

        console.log(
          "Reversing from: ",
          neighbor.name,
          " to: ",
          current.name,
          " will take: ",
          pokeWaitTime + 1500
        );
        await sleep(pokeWaitTime + 1500);
      }
    }
    changeVertexColor(current, "vertex-explored");
    updateCanvas();
    previousVertex = current;

    await sleep(3000);
  }
  console.table(gScore);
  console.table(fScore);
  return { distances: gScore, predecessors: cameFrom };
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
//  BELLMANFORD BELLMANFORD  BELLMANFORD  BELLMANFORD  BELLMANFORD  BELLMANFORD

async function runBellmanFordRobot() {
  isRunningBellmanFord = true;

  const navigator = new RobotNavigator();

  disableMouseEvents();
  disableButtons();

  const sourceText = "Select starting vertex: ";
  let sourceLetter = prompt(sourceText);
  const targetText = "Select target vertex: ";
  let targetLetter = prompt(targetText);

  if (!sourceLetter || !targetLetter) {
    alert("Please specify both, source and target vertices.");
    console.log("Please specify both, source and target vertices.");
    enableMouseEvents();
    enableButtons();
    isRunningBellmanFord = false;
    return;
  }

  sourceLetter = sourceLetter.toUpperCase();
  targetLetter = targetLetter.toUpperCase();

  if (sourceLetter.length > 1 || targetLetter.length > 1) {
    alert("Please write a single letter for both source and target vertex.");
    console.log(
      "Please write a single letter for both source and target vertex."
    );
    enableMouseEvents();
    enableButtons();
    isRunningBellmanFord = false;
    return;
  }

  const startVertex = sourceLetter.charCodeAt(0) - 65;
  const targetVertex = targetLetter.charCodeAt(0) - 65;

  console.log("This is startVertex", startVertex);
  console.log("This is targetVertex", targetVertex);
  if (startVertex < 0 || targetVertex < 0) {
    alert("Please only write letters for source and target vertices.");
    console.log("Please only write letters for source and target vertices.");
    enableMouseEvents();
    enableButtons();
    isRunningBellmanFord = false;
    return;
  }

  if (isNaN(startVertex) || isNaN(targetVertex)) {
    enableMouseEvents();
    enableButtons();
    alert("Please specify valid source and target vertices.");
    console.log("Please specify both, valid source and target vertices.");
    isRunningBellmanFord = false;
    return;
  }

  const source = vertices[startVertex];
  const target = vertices[targetVertex];

  if (!source || !target) {
    alert("Please specify valid source and target vertices.");
    console.log("Please specify valid source and target vertices.");
    enableMouseEvents();
    enableButtons();
    isRunningBellmanFord = false;
    return;
  }

  if (sourceLetter === targetLetter) {
    await sleep(1500);
    target.setPredecessor(source);
    changeVertexColor(target, "vertex-shortestPathTarget");
    await celebrate(2);
    isRunningBellmanFord = false;
    enableMouseEvents();
    enableButtons();
    resetGraph();
    return;
  }

  const result = await bellmanFordRobot(source, navigator);

  if (result.distances[target.name] === Infinity) {
    alert("The source and the target values are not connected over any path.");
    console.log(
      "The source and the target values are not connected over any path."
    );
    resetGraph();
    enableMouseEvents();
    enableButtons();
    isRunningBellmanFord = false;
    return;
  }

  const pathOfObjects = await shortestPathRobotFunct(
    result.predecessors,
    source,
    target
  );

  const totalWaitTime = calculateMovementDetails(target, source, navigator);
  console.log(
    "We are currently at: ",
    target,
    " to get to: ",
    source,
    " it will take: ",
    totalWaitTime + 2500
  );

  await downloadAndWait(`selectedVertex.txt`, `${source.name}`, totalWaitTime);
  await sleep(totalWaitTime + 2500);

  const shortestPath = getShortestPath(pathOfObjects);

  const totalTraversalTime = await calculateTotalTraversalTime(
    pathOfObjects,
    navigator
  );

  console.log(
    "Traversing the shortest path: ",
    shortestPath,
    " it will take: ",
    totalTraversalTime
  );

  await downloadAndWait(
    `shortestPath.txt`,
    `${shortestPath}`,
    totalTraversalTime
  );
  await sleep(totalTraversalTime + 500);

  updateCanvas();

  celebrate(1);

  await sleep(15000);
  isRunningBellmanFord = false;
  resetGraph();
  enableMouseEvents();
  enableButtons();
  hideBellmanFordInfo();
}

async function bellmanFordRobot(source, navigator) {
  await downloadVertexPositions();
  await downloadAdjacency();
  const distances = {};
  const predecessors = {};
  let updated = false;
  const totalIterations = vertices.length - 1;
  let previousVertex = source;

  vertices.forEach((vertex) => {
    distances[vertex.name] = Infinity;
    predecessors[vertex.name] = null;
    vertex.setCost(Infinity);
    vertex.setPredecessor(null);
  });
  updateCanvas();

  distances[source.name] = 0;
  source.setCost(0);
  source.setPredecessor(source);
  updateCanvas();

  for (let i = 0; i < totalIterations; i++) {
    console.log(`Iteration ${i + 1}`);
    updated = false;

    drawIterationInfo(i + 1, totalIterations);

    for (const vertex of vertices) {
      const totalWaitTime = calculateMovementDetails(
        previousVertex,
        vertex,
        navigator
      );
      console.log(
        "Moving from: ",
        previousVertex.name,
        " to: ",
        vertex.name,
        " will take: ",
        totalWaitTime + 2500
      );
      await downloadAndWait(
        `selectedVertex.txt`,
        `${vertex.name}`,
        totalWaitTime + 2500
      );
      await sleep(totalWaitTime + 2500);

      for (const edge of edges) {
        if (edge.vertex1 !== vertex) continue;

        const u = edge.vertex1;
        const v = edge.vertex2;

        let drawnEdge = drawnEdges.find(
          (e) =>
            (e.vertex1 === u && e.vertex2 === v) ||
            (e.vertex1 === v && e.vertex2 === u)
        );

        const pokeWaitTime = calculateMovementDetails(u, v, navigator);
        console.log(
          "Poking from: ",
          u.name,
          " to: ",
          v.name,
          " will take: ",
          pokeWaitTime
        );

        await downloadAndWait(`poke.txt`, `${v.name}`, pokeWaitTime + 500);
        updateCanvas();

        if (distances[u.name] + edge.weight < distances[v.name]) {
          distances[v.name] = distances[u.name] + edge.weight;
          predecessors[v.name] = u;
          v.setCost(distances[v.name]);
          v.setPredecessor(u);
          updated = true;
          console.log(`Updated ${v.name}: new distance = ${distances[v.name]}`);
        }
        updateCanvas();
        console.log(
          "Reversing from: ",
          v.name,
          " to: ",
          u.name,
          " will take: ",
          pokeWaitTime + 1500
        );
        await sleep(pokeWaitTime + 1500);
      }

      changeVertexColor(vertex, "vertex-explored");
      previousVertex = vertex;
      await sleep(500);
    }

    vertices.forEach((vertex) => changeVertexColor(vertex, "vertex-default"));
    await sleep(500);
    updateCanvas();

    if (!updated) {
      console.log("No updates in this iteration. Stopping early.");
      drawIterationInfo(i + 1, totalIterations, true);
      await sleep(2000);
      break;
    }
  }

  // Check for negative-weight cycles
  for (const edge of edges) {
    const u = edge.vertex1;
    const v = edge.vertex2;
    if (distances[u.name] + edge.weight < distances[v.name]) {
      return { hasNegativeCycle: true };
    }
  }

  return { distances, predecessors, hasNegativeCycle: false };
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------