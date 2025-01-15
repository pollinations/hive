import { handleTextCommand, executeAction } from './textInterface.js';

// Canvas state and context
const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');
let currentTool = 'select';
let isDrawing = false;
let startX, startY;
let isDragging = false;
let isResizing = false;
let resizeHandle = null;

// Object to store all canvas elements
export const canvasObjects = [];
export let selectedObject = null;

// Transformation handles size
const HANDLE_SIZE = 8;
const HANDLE_POSITIONS = ['nw', 'ne', 'se', 'sw'];

// Initialize canvas size
function initCanvas() {
    canvas.width = 800;
    canvas.height = 600;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Tool selection
const tools = document.querySelectorAll('.tool-btn');
tools.forEach(tool => {
    tool.addEventListener('click', (e) => {
        tools.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        currentTool = e.target.id.replace('-tool', '');
    });
});

// Canvas object class
class CanvasObject {
    constructor(type, props) {
        this.type = type;
        this.props = props;
        this.id = Date.now();
        this.zIndex = canvasObjects.length;
    }

    draw() {
        ctx.save();
        switch(this.type) {
            case 'text':
                ctx.font = `${this.props.fontSize}px ${this.props.fontFamily}`;
                ctx.fillStyle = this.props.color;
                ctx.fillText(this.props.text, this.props.x, this.props.y);
                break;
            case 'shape':
                ctx.fillStyle = this.props.color;
                ctx.beginPath();
                if (this.props.shapeType === 'rectangle') {
                    ctx.rect(this.props.x, this.props.y, this.props.width, this.props.height);
                } else if (this.props.shapeType === 'circle') {
                    ctx.arc(this.props.x, this.props.y, this.props.radius, 0, Math.PI * 2);
                }
                ctx.fill();
                break;
            case 'image':
                if (this.props.image) {
                    ctx.drawImage(
                        this.props.image,
                        this.props.x,
                        this.props.y,
                        this.props.width,
                        this.props.height
                    );
                }
                break;
        }
        ctx.restore();
    }

    isPointInside(x, y) {
        switch(this.type) {
            case 'text':
                const metrics = ctx.measureText(this.props.text);
                return x >= this.props.x &&
                       x <= this.props.x + metrics.width &&
                       y >= this.props.y - this.props.fontSize &&
                       y <= this.props.y;
            case 'shape':
                if (this.props.shapeType === 'rectangle') {
                    return x >= this.props.x &&
                           x <= this.props.x + this.props.width &&
                           y >= this.props.y &&
                           y <= this.props.y + this.props.height;
                }
                break;
        }
        return false;
    }
}

// Text tool implementation
document.getElementById('text-tool').addEventListener('click', () => {
    canvas.addEventListener('click', addText);
});

function addText(e) {
    if (currentTool !== 'text') return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const text = prompt('Enter text:', '');
    if (!text) return;

    const textObject = new CanvasObject('text', {
        text,
        x,
        y,
        fontSize: parseInt(document.getElementById('font-size').value),
        fontFamily: document.getElementById('font-family').value,
        color: document.getElementById('color-picker').value
    });

    canvasObjects.push(textObject);
    updateCanvas();
    updateLayersList();
}

// Shape tool implementation
let shapeStartX, shapeStartY;

canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);

function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;

    if (currentTool === 'select') {
        // Check for resize handles first
        if (selectedObject) {
            resizeHandle = getResizeHandle(startX, startY);
            if (resizeHandle) {
                isResizing = true;
                return;
            }
        }

        // Check for object selection
        selectedObject = canvasObjects
            .slice()
            .reverse()
            .find(obj => obj.isPointInside(startX, startY));

        if (selectedObject) {
            isDragging = true;
        }
        updateLayersList();
    } else if (currentTool === 'shape') {
        shapeStartX = startX;
        shapeStartY = startY;
        isDrawing = true;
    }
}

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging && selectedObject) {
        const dx = x - startX;
        const dy = y - startY;
        selectedObject.props.x += dx;
        selectedObject.props.y += dy;
        startX = x;
        startY = y;
        updateCanvas();
        drawSelectionHandles();
    } else if (isResizing && selectedObject) {
        const newWidth = x - selectedObject.props.x;
        const newHeight = y - selectedObject.props.y;
        
        if (resizeHandle.includes('e')) {
            selectedObject.props.width = newWidth;
        }
        if (resizeHandle.includes('s')) {
            selectedObject.props.height = newHeight;
        }
        if (resizeHandle.includes('w')) {
            const dx = x - startX;
            selectedObject.props.x += dx;
            selectedObject.props.width -= dx;
        }
        if (resizeHandle.includes('n')) {
            const dy = y - startY;
            selectedObject.props.y += dy;
            selectedObject.props.height -= dy;
        }
        
        startX = x;
        startY = y;
        updateCanvas();
        drawSelectionHandles();
    } else if (isDrawing && currentTool === 'shape') {
        updateCanvas();
        // Preview shape
        ctx.beginPath();
        ctx.fillStyle = document.getElementById('color-picker').value;
        ctx.rect(
            shapeStartX,
            shapeStartY,
            x - shapeStartX,
            y - shapeStartY
        );
        ctx.fill();
    }
}

function handleMouseUp(e) {
    if (isDrawing && currentTool === 'shape') {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const shapeObject = new CanvasObject('shape', {
            shapeType: 'rectangle',
            x: Math.min(shapeStartX, x),
            y: Math.min(shapeStartY, y),
            width: Math.abs(x - shapeStartX),
            height: Math.abs(y - shapeStartY),
            color: document.getElementById('color-picker').value
        });

        canvasObjects.push(shapeObject);
        updateCanvas();
        updateLayersList();
    }

    isDrawing = false;
    isDragging = false;
    isResizing = false;
    resizeHandle = null;
}

function getResizeHandle(x, y) {
    if (!selectedObject) return null;

    const handles = {
        nw: { x: selectedObject.props.x, y: selectedObject.props.y },
        ne: { x: selectedObject.props.x + selectedObject.props.width, y: selectedObject.props.y },
        se: { x: selectedObject.props.x + selectedObject.props.width, y: selectedObject.props.y + selectedObject.props.height },
        sw: { x: selectedObject.props.x, y: selectedObject.props.y + selectedObject.props.height }
    };

    for (const [position, handle] of Object.entries(handles)) {
        if (Math.abs(x - handle.x) <= HANDLE_SIZE / 2 && 
            Math.abs(y - handle.y) <= HANDLE_SIZE / 2) {
            return position;
        }
    }
    return null;
}

function drawSelectionHandles() {
    if (!selectedObject) return;

    const handles = {
        nw: { x: selectedObject.props.x, y: selectedObject.props.y },
        ne: { x: selectedObject.props.x + selectedObject.props.width, y: selectedObject.props.y },
        se: { x: selectedObject.props.x + selectedObject.props.width, y: selectedObject.props.y + selectedObject.props.height },
        sw: { x: selectedObject.props.x, y: selectedObject.props.y + selectedObject.props.height }
    };

    ctx.strokeStyle = '#00f';
    ctx.strokeRect(
        selectedObject.props.x,
        selectedObject.props.y,
        selectedObject.props.width,
        selectedObject.props.height
    );

    for (const handle of Object.values(handles)) {
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#00f';
        ctx.beginPath();
        ctx.rect(
            handle.x - HANDLE_SIZE / 2,
            handle.y - HANDLE_SIZE / 2,
            HANDLE_SIZE,
            HANDLE_SIZE
        );
        ctx.fill();
        ctx.stroke();
    }
}

// Layer management
function updateLayersList() {
    const layersList = document.getElementById('layers-list');
    layersList.innerHTML = '';
    
    canvasObjects.slice().reverse().forEach(obj => {
        const layer = document.createElement('div');
        layer.style.padding = '8px';
        layer.style.border = '1px solid #ddd';
        layer.style.backgroundColor = obj === selectedObject ? '#e3f2fd' : 'white';
        layer.textContent = `${obj.type} ${obj.id}`;
        layersList.appendChild(layer);
    });
}

// Canvas rendering
function updateCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    canvasObjects.forEach(obj => obj.draw());

    if (selectedObject) {
        drawSelectionHandles();
    }
}

// Image upload handling
document.getElementById('image-tool').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    // Scale image to fit within canvas while maintaining aspect ratio
                    let width = img.width;
                    let height = img.height;
                    const maxSize = 400;

                    if (width > maxSize || height > maxSize) {
                        const ratio = Math.min(maxSize / width, maxSize / height);
                        width *= ratio;
                        height *= ratio;
                    }

                    const imageObject = new CanvasObject('image', {
                        image: img,
                        x: (canvas.width - width) / 2,
                        y: (canvas.height - height) / 2,
                        width: width,
                        height: height
                    });

                    canvasObjects.push(imageObject);
                    updateCanvas();
                    updateLayersList();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
});

// Layer controls
document.getElementById('bring-forward').addEventListener('click', () => {
    if (!selectedObject) return;
    const index = canvasObjects.indexOf(selectedObject);
    if (index < canvasObjects.length - 1) {
        [canvasObjects[index], canvasObjects[index + 1]] = 
        [canvasObjects[index + 1], canvasObjects[index]];
        updateCanvas();
        updateLayersList();
    }
});

document.getElementById('send-backward').addEventListener('click', () => {
    if (!selectedObject) return;
    const index = canvasObjects.indexOf(selectedObject);
    if (index > 0) {
        [canvasObjects[index], canvasObjects[index - 1]] = 
        [canvasObjects[index - 1], canvasObjects[index]];
        updateCanvas();
        updateLayersList();
    }
});

// Export functionality
document.getElementById('export-btn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'canvas-export.png';
    link.href = canvas.toDataURL();
    link.click();
});

// Text command handling
document.getElementById('execute-command').addEventListener('click', async () => {
    const commandInput = document.getElementById('text-command');
    const command = commandInput.value.trim();
    
    if (!command) return;
    
    try {
        const action = await handleTextCommand(command);
        executeAction(action);
        commandInput.value = ''; // Clear input after successful execution
    } catch (error) {
        console.error('Failed to execute command:', error);
        alert('Failed to execute command. Please try again.');
    }
});

document.getElementById('text-command').addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        document.getElementById('execute-command').click();
    }
});

// Initialize the editor
function initEditor() {
    try {
        initCanvas();
        console.log('Graphics editor initialized successfully');
    } catch (error) {
        console.error('Failed to initialize editor:', error);
    }
}

// Wait for DOM content to be loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEditor);
} else {
    initEditor();
}

// Export canvas-related functions and classes
export { CanvasObject, updateCanvas, updateLayersList, canvas };