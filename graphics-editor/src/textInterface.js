// Import required dependencies from main.js
import { CanvasObject, canvasObjects, selectedObject, updateCanvas, updateLayersList } from './main.js';

// Text interface handler for graphics editor
export async function handleTextCommand(command) {
    try {
        const response = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'system',
                        content: `You are a graphics editor command interpreter. Convert natural language commands into structured JSON actions.
Available actions and their parameters:
- addText: {text, x, y, color, fontSize, fontFamily}
- addShape: {type: "rectangle"|"circle", x, y, width, height, color}
- addImage: {url, x, y, width, height}
- select: {id}
- move: {x, y}
- resize: {width, height}
- changeStyle: {color?, fontSize?, fontFamily?}
- layer: {action: "forward"|"backward"}
- export: {}

Respond with only valid JSON matching this schema:
{
    "action": string,
    "params": object
}`
                    },
                    {
                        role: 'user',
                        content: command
                    }
                ],
                jsonMode: true
            }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error processing text command:', error);
        throw error;
    }
}

// Execute the action returned from the text interface
export function executeAction(action) {
    switch (action.action) {
        case 'addText':
            const textObject = new CanvasObject('text', {
                text: action.params.text,
                x: action.params.x,
                y: action.params.y,
                fontSize: action.params.fontSize || 16,
                fontFamily: action.params.fontFamily || 'Arial',
                color: action.params.color || '#000000'
            });
            canvasObjects.push(textObject);
            break;

        case 'addShape':
            const shapeObject = new CanvasObject('shape', {
                shapeType: action.params.type,
                x: action.params.x,
                y: action.params.y,
                width: action.params.width,
                height: action.params.height,
                color: action.params.color || '#000000'
            });
            canvasObjects.push(shapeObject);
            break;

        case 'addImage':
            const img = new Image();
            img.onload = () => {
                const imageObject = new CanvasObject('image', {
                    image: img,
                    x: action.params.x,
                    y: action.params.y,
                    width: action.params.width || img.width,
                    height: action.params.height || img.height
                });
                canvasObjects.push(imageObject);
                updateCanvas();
                updateLayersList();
            };
            img.src = action.params.url;
            return;

        case 'select':
            selectedObject = canvasObjects.find(obj => obj.id === action.params.id);
            break;

        case 'move':
            if (selectedObject) {
                selectedObject.props.x = action.params.x;
                selectedObject.props.y = action.params.y;
            }
            break;

        case 'resize':
            if (selectedObject) {
                selectedObject.props.width = action.params.width;
                selectedObject.props.height = action.params.height;
            }
            break;

        case 'changeStyle':
            if (selectedObject) {
                if (action.params.color) selectedObject.props.color = action.params.color;
                if (action.params.fontSize) selectedObject.props.fontSize = action.params.fontSize;
                if (action.params.fontFamily) selectedObject.props.fontFamily = action.params.fontFamily;
            }
            break;

        case 'layer':
            if (selectedObject) {
                const index = canvasObjects.indexOf(selectedObject);
                if (action.params.action === 'forward' && index < canvasObjects.length - 1) {
                    [canvasObjects[index], canvasObjects[index + 1]] = 
                    [canvasObjects[index + 1], canvasObjects[index]];
                } else if (action.params.action === 'backward' && index > 0) {
                    [canvasObjects[index], canvasObjects[index - 1]] = 
                    [canvasObjects[index - 1], canvasObjects[index]];
                }
            }
            break;

        case 'export':
            const link = document.createElement('a');
            link.download = 'canvas-export.png';
            link.href = canvas.toDataURL();
            link.click();
            break;
    }

    updateCanvas();
    updateLayersList();
}