const hatCanvas = document.getElementById('hatLayer');
const hatCtx = hatCanvas.getContext('2d');
const drawCanvas = document.getElementById('drawLayer');
const drawCtx = drawCanvas.getContext('2d');

const colorPicker = document.getElementById('colorPicker');
const brushBtn = document.getElementById('brushBtn');
const eraserBtn = document.getElementById('eraserBtn');
const widthPicker = document.getElementById('widthPicker');
const undoBtn = document.getElementById('undoBtn');
const saveBtn = document.getElementById('saveBtn');

let isDrawing = false;
let lastX = 0, lastY = 0;
let drawingColor = colorPicker.value;
let drawingWidth = parseInt(widthPicker.value);
let eraserMode = false;

// ------ Undo stack 只針對畫圖層 ------ 
let undoStack = [];
const maxUndoSteps = 30;
function pushUndo() {
    if (undoStack.length >= maxUndoSteps) undoStack.shift();
    undoStack.push(drawCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height));
}
function popUndo() {
    if (undoStack.length > 1) {
        undoStack.pop();
        drawCtx.putImageData(undoStack[undoStack.length-1], 0, 0);
    }
}

// ------ 畫帽子底圖在 hatLayer ------ 
const hatImg = new Image();
hatImg.src = 'hat.png';
hatImg.onload = function() {
    hatCtx.clearRect(0, 0, hatCanvas.width, hatCanvas.height);
    hatCtx.drawImage(hatImg, 0, 0, hatCanvas.width, hatCanvas.height);
    // 畫圖層也要初始化
    drawCtx.clearRect(0,0,drawCanvas.width,drawCanvas.height);
    pushUndo();
};

// ------ 手指/滑鼠位置 ------ 
function getPos(e) {
    const rect = drawCanvas.getBoundingClientRect();
    if (e.touches && e.touches.length) {
        return {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top
        };
    } else {
        return { x: e.offsetX, y: e.offsetY };
    }
}

// ------ 事件處理 ------ 
function handleStart(e) {
    e.preventDefault();
    isDrawing = true;
    const pos = getPos(e);
    lastX = pos.x;
    lastY = pos.y;
}
function handleMove(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    drawCtx.lineCap = 'round';
    drawCtx.lineJoin = 'round';
    drawCtx.lineWidth = drawingWidth;
    if (eraserMode) {
        drawCtx.globalCompositeOperation = 'destination-out'; // 只擦畫圖層
        drawCtx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
        drawCtx.globalCompositeOperation = 'source-over';
        drawCtx.strokeStyle = drawingColor;
    }
    drawCtx.beginPath();
    drawCtx.moveTo(lastX, lastY);
    drawCtx.lineTo(pos.x, pos.y);
    drawCtx.stroke();
    lastX = pos.x;
    lastY = pos.y;
}
function handleEnd(e) {
    if (isDrawing) {
        isDrawing = false;
        drawCtx.globalCompositeOperation = 'source-over'; // 回復
        pushUndo();
    }
}

// ------ 事件監聽加在 drawLayer ------ 
drawCanvas.addEventListener('mousedown', handleStart);
drawCanvas.addEventListener('mousemove', handleMove);
drawCanvas.addEventListener('mouseup', handleEnd);
drawCanvas.addEventListener('mouseout', handleEnd);
// 手機
drawCanvas.addEventListener('touchstart', handleStart, { passive: false });
drawCanvas.addEventListener('touchmove', handleMove, { passive: false });
drawCanvas.addEventListener('touchend', handleEnd);

// 切換顏色/筆/擦
colorPicker.addEventListener('change', function() {
    drawingColor = colorPicker.value;
    eraserMode = false;
    brushBtn.classList.add('active');
    eraserBtn.classList.remove('active');
});
brushBtn.addEventListener('click', function() {
    eraserMode = false;
    brushBtn.classList.add('active');
    eraserBtn.classList.remove('active');
});
eraserBtn.addEventListener('click', function() {
    eraserMode = true;
    brushBtn.classList.remove('active');
    eraserBtn.classList.add('active');
});
widthPicker.addEventListener('change', function() {
    drawingWidth = parseInt(widthPicker.value);
});
undoBtn.addEventListener('click', popUndo);

// ------ 存檔時，合成兩層 canvas ------ 
saveBtn.addEventListener('click', function() {
    // 建立一個暫時 canvas 並合併兩層
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = hatCanvas.width;
    tempCanvas.height = hatCanvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    // 先畫帽子
    tempCtx.drawImage(hatCanvas, 0, 0);
    // 再疊畫圖層
    tempCtx.drawImage(drawCanvas, 0, 0);
    const link = document.createElement('a');
    link.download = 'my_hat.png';
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
});

// 初始化按鈕狀態
brushBtn.classList.add('active');
