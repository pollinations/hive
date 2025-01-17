// DOM Elements
const elements = {
    start: document.getElementById('startBtn'),
    stop: document.getElementById('stopBtn'),
    temperature: document.getElementById('temperature'),
    seed: document.getElementById('seed'),
    history: document.getElementById('history'),
    preset: document.getElementById('preset-select'),
    prompt: document.getElementById('base-prompt'),
    preview: document.getElementById('preview-window'),
    modelSelect: document.getElementById('model-select'),
    speedSlider: document.getElementById('speed-slider')
};

// State
let isRunning = false;
let frames = [];
let frameIndex = 0;
let animationInterval;

// Initialize model selector
fetch('https://text.pollinations.ai/models')
    .then(r => r.json())
    .then(models => {
        elements.modelSelect.innerHTML = models
            .map(m => `<option value="${m.name}" ${m.name === 'openai' ? 'selected' : ''}>${m.name} - ${m.description}</option>`)
            .join('');
    })
    .catch(() => elements.modelSelect.innerHTML = '<option value="openai" selected>OpenAI (Default)</option>');

// Get selected model
function getSelectedModel() {
    return elements.modelSelect.value;
}

// Core functions
function createEmptyCanvas() {
    return 'no input yet. please create the first state';
}

function extractDisplayContent(text) {
    // Extract both style and ASCII art content
    const asciiMatch = text.toLowerCase().match(/```([\s\S]*?)```/) || text.match(/^[^<][\s\S]*$/);
    const styleMatch = asciiMatch && asciiMatch[1]?.match(/<style>([\s\S]*?)<\/style>/);

    // Get the style content or empty string if no style found
    const style = styleMatch ? styleMatch[1].trim() : '';
    // remove style from ascii art
    // asciiMatch = asciiMatch && asciiMatch[1]?.replace(/<style>([\s\S]*?)<\/style>/, '');

    // Get the ASCII art content
    let asciiArt = asciiMatch ? asciiMatch[1] || asciiMatch[0] : text;
    
    // get everything after </style> if present
    asciiArt = asciiArt && asciiArt.replace(/<style>([\s\S]*?)<\/style>/, '');
    console.log('Extracted text:', text);
    console.log('Extracted style:', style);
    console.log('Extracted ASCII art:', asciiArt);
    // Update the preview window style
    const styleElement = document.getElementById('dynamic-preview-style');
    if (styleElement) {
        styleElement.textContent = style;
    } else {
        const newStyle = document.createElement('style');
        newStyle.id = 'dynamic-preview-style';
        newStyle.textContent = style;
        document.head.appendChild(newStyle);
    }
    
    return asciiArt.trim();
}

async function generateText(prompt, currentState) {
    const formatInstructions = `- You create an output state from an input state according to the prompt. It will be visualized in a 30x15 grid.
- First output a <style> block containing CSS that reflects the mood and theme of the prompt. This CSS will style the preview-window container.
- Then output exactly 15 lines, each exactly 30 characters wide
- Wrap the state in triple backticks \`\`\`
- Example format:

\`\`\`
<style>
#preview-window {
    background: linear-gradient(...);
    color: #...;
    /* other relevant styles */
}
</style>
[ascii art here]
\`\`\`

- If there is an input state, transform it gradually according to the prompt.`;

    try {
        console.log('System instructions:', formatInstructions);
        
        elements.start.textContent = 'Generating...';
        
        let seed = elements.seed.value && elements.seed.value !== '-1' ? 
            parseInt(elements.seed.value) : 
            Math.floor(Math.random() * 1000000);

        const messages = [
            {
                role: "system",
                content: formatInstructions
            },
            {
                role: "user",
                content: currentState
            }
        ];

        const response = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: messages,
                model: getSelectedModel(),
                temperature: parseFloat(elements.temperature.value),
                seed: seed
            })
        });
        
        if (!response.ok) {
            console.error(`Failed to generate text: ${response.status} ${response.statusText}`);
            elements.start.textContent = 'Start Evolution';
            return '';
        }
        
        const text = await response.text();
        console.log('Raw response:', text);
        elements.start.textContent = 'Start Evolution';
        return text;
    } catch (error) {
        console.error('Generation error:', error);
        elements.start.textContent = 'Start Evolution';
        return '';
    }
}

async function evolve() {
    console.log('Starting evolution');
    let currentState = createEmptyCanvas();
    console.log('Initial state created:', currentState);
    
    while (isRunning) {
        try {
            console.log('--- New iteration ---');
            const prompt = elements.prompt.value;
            console.log('Getting next state for prompt:', prompt);
            
            const text = await generateText(prompt, currentState);
            console.log('Generation completed');
            
            if (!isRunning) {
                console.log('Breaking loop:', !text ? 'no text' : 'stopped');
                break;
            }

            if (!text) {
                console.error("No text. Trying again...");
                continue;
            }

            // Extract the state from between backticks if present
            // const stateMatch = text.match(/```([\s\S]*?)```/);
            // const state = stateMatch ? stateMatch[1] : text;
            
            // // Split into lines and ensure correct dimensions (35x20)
            // const lines = state.split('\n').map(line => line.padEnd(35, ' ').slice(0, 35));
            // const paddedState = lines.slice(0, 20).join('\n');
            // const finalState = paddedState.padEnd(35 * 20 + 19, '\n' + ' '.repeat(35)).slice(0, 35 * 20 + 19);

            frames.push(text);
            currentState = text; // Keep full text for LLM context
            console.log('State updated, frame count:', frames.length);
            
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item mono';
            historyItem.textContent = text;
            elements.history.insertBefore(historyItem, elements.history.firstChild);
            
            console.log('UI updated');
            
            // Wait before next iteration
            console.log('Waiting...');
            await new Promise(resolve => setTimeout(resolve, 200));
            console.log('Wait complete');
        } catch (error) {
            console.error('Evolution error:', error);
            if (!isRunning) {
                console.log('Breaking loop due to error');
                break;
            }
        }
    }
    console.log('Evolution stopped');
}

async function startEvolution() {
    frames = []; // Clear frames array
    frameIndex = 0; // Reset frame index
    isRunning = true;
    elements.start.disabled = true;
    elements.stop.disabled = false;
    await evolve();
}

function stopEvolution() {
    isRunning = false;
    elements.start.disabled = false;
    elements.stop.disabled = true;
}

function startPreviewAnimation() {
    frameIndex = 0;
    if (animationInterval) clearInterval(animationInterval);
    
    animationInterval = setInterval(() => {
        if (frames.length > 0) {
            elements.preview.textContent = extractDisplayContent(frames[frameIndex]);
            frameIndex = (frameIndex + 1) % frames.length;
        }
    }, parseInt(elements.speedSlider.value));
}

// Event Listeners
elements.start.addEventListener('click', startEvolution);
elements.stop.addEventListener('click', stopEvolution);
elements.temperature.addEventListener('input', (e) => {
    document.getElementById('temperature-value').textContent = e.target.value;
});
elements.preset.addEventListener('change', () => {
    const preset = presets[elements.preset.value];
    elements.prompt.value = preset.prompt;
    elements.temperature.value = preset.temperature;
    document.getElementById('temperature-value').textContent = preset.temperature;
});

elements.prompt.addEventListener('input', () => {
    // Don't clear frames on prompt change anymore
});

elements.speedSlider.addEventListener('change', () => {
    if (frames.length > 0) startPreviewAnimation();
});

// Initialize
elements.preset.value = 'calligram';
elements.prompt.value = presets.calligram.prompt;
startPreviewAnimation();
