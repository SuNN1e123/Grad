const hatCanvas = document.getElementById('hatLayer');
const hatCtx = hatCanvas.getContext('2d');
const drawCanvas = document.getElementById('drawLayer');
const drawCtx = drawCanvas.getContext('2d');

const colorPicker = document.getElementById('colorPicker');
const widthPicker = document.getElementById('widthPicker');
const saveBtn = document.getElementById('saveBtn');

let drawing = false;
let lastX = 0, lastY = 0;
let lineWidth = parseInt(widthPicker.value);
let lineColor = colorPicker.value;

// -----------畫帽子底圖到 hatLayer-----------
const hatImg = new Image();
hatImg.src = 'hat.png';
hatImg.onload = function(){
    hatCtx.clearRect(0,0,hatCanvas.width,hatCanvas.height);
    hatCtx.drawImage(hatImg,0,0,hatCanvas.width,hatCanvas.height);
};

// -----------事件只在 drawLayer-----------
function getXY(e){
    const rect = drawCanvas.getBoundingClientRect();
    if(e.touches){
        return {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top
        };
    }
    return { x: e.offsetX, y: e.offsetY };
}

function startDraw(e){
    drawing = true;
    const {x, y} = getXY(e);
    lastX = x; lastY = y;
}

function moveDraw(e){
    if(!drawing) return;
    const {x, y} = getXY(e);

    drawCtx.lineCap = 'round';
    drawCtx.lineJoin = 'round';
    drawCtx.lineWidth = lineWidth;
    drawCtx.globalCompositeOperation = 'source-over';
    drawCtx.strokeStyle = lineColor;

    drawCtx.beginPath();
    drawCtx.moveTo(lastX, lastY);
    drawCtx.lineTo(x, y);
    drawCtx.stroke();

    lastX = x; lastY = y;
}

function endDraw(){
    drawing = false;
}

// 事件綁定（只畫畫層）
drawCanvas.addEventListener('mousedown', startDraw);
drawCanvas.addEventListener('mousemove', moveDraw);
drawCanvas.addEventListener('mouseup', endDraw);
drawCanvas.addEventListener('mouseout', endDraw);
// 手機
drawCanvas.addEventListener('touchstart', startDraw, {passive:false});
drawCanvas.addEventListener('touchmove', moveDraw, {passive:false});
drawCanvas.addEventListener('touchend', endDraw);

colorPicker.oninput = ()=>{lineColor = colorPicker.value;}
widthPicker.oninput = ()=>{lineWidth = parseInt(widthPicker.value);}

// 下載：合併兩層 canvas
saveBtn.onclick = ()=>{
    const merged = document.createElement('canvas');
    merged.width = hatCanvas.width;
    merged.height = hatCanvas.height;
    const mCtx = merged.getContext('2d');
    mCtx.drawImage(hatCanvas,0,0);
    mCtx.drawImage(drawCanvas,0,0);
    const link = document.createElement('a');
    link.download = 'my_hat.png';
    link.href = merged.toDataURL('image/png');
    link.click();
};
