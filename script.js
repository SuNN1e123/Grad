const canvas = document.getElementById('drawArea');
const ctx = canvas.getContext('2d');
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

// ------------- Undo 相關 ---------------
let undoStack = [];
const maxUndoSteps = 30;

function pushUndo() {
    // 存畫布資料進 stack
    if (undoStack.length >= maxUndoSteps) undoStack.shift();
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
}

function popUndo() {
    if (undoStack.length > 1) {
        undoStack.pop();
        ctx.putImageData(undoStack[undoStack.length-1], 0, 0);
    }
}

// ----------- 畫帽子底圖 ---------------
const hatImg = new Image();
hatImg.src = 'hat.png';

hatImg.onload = function() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(hatImg, 0, 0, canvas.width, canvas.height);
    pushUndo(); // 一開始
};

// ----------- 繪圖事件設定 -------------

function getPos(e) {
    if (e.touches && e.touches.length) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top
        };
    } else {
        return { x: e.offsetX, y: e.offsetY };
    }
}

// 滑鼠或觸控開始
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
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = drawingWidth;
    if (eraserMode) {
        ctx.globalCompositeOperation = 'destination-out'; // 橡皮擦-變透明
        ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = drawingColor;
    }
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastX = pos.x;
    lastY = pos.y;
}

function handleEnd(e) {
    if (isDrawing) {
        isDrawing = false;
        ctx.globalCompositeOperation = 'source-over'; // 功能歸回
        pushUndo();
    }
}

// ------ 事件監聽 ------
// 電腦滑鼠
canvas.addEventListener('mousedown', handleStart);
canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('mouseup', handleEnd);
canvas.addEventListener('mouseout', handleEnd);
// 手機
canvas.addEventListener('touchstart', handleStart, { passive: false });
canvas.addEventListener('touchmove', handleMove, { passive: false });
canvas.addEventListener('touchend', handleEnd);

// 切換顏色
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

// Undo 按鈕
undoBtn.addEventListener('click', popUndo);

// 儲存下載
saveBtn.addEventListener('click', function() {
    // 下載圖片（含帽子與畫圖）
    const link = document.createElement('a');
    link.download = 'my_hat.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// 初始化按鈕狀態
brushBtn.classList.add('active');