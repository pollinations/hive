// DOM Elements
const elements = {
    presetSelect: document.getElementById('preset-select'),
    basePrompt: document.getElementById('base-prompt'),
    modelSelect: document.getElementById('model-select'),
    temperature: document.getElementById('temperature'),
    temperatureValue: document.getElementById('temperature-value'),
    seed: document.getElementById('seed'),
    preview: document.getElementById('preview-window'),
    start: document.getElementById('start'),
    stop: document.getElementById('stop'),
    speedSlider: document.getElementById('speed-slider'),
    frameCounter: document.getElementById('frame-counter'),
    history: document.getElementById('history'),
    initialSvg: document.getElementById('initial-svg')
};

// Load saved presets from localStorage
const savedPresets = JSON.parse(localStorage.getItem('savedPresets2') || '{}');

// Base presets combined with saved presets
const presets = {
    'neural': {
        name: 'Neural Gardens',
        prompt: "Create an abstract garden of neural networks. Use flowing lines and organic shapes to represent neurons, synapses, and the flow of information. Incorporate subtle color transitions and pulsing animations to suggest the dynamic nature of neural processing.",
        temperature: 0.8
    },
    biomorphic: {
        prompt: "Create a living system of biomorphic forms inspired by Ernst Haeckel's scientific illustrations. Design intricate organic shapes that grow, divide, and evolve. Use animated transformations to suggest cellular processes and biological rhythms. Include delicate details and symmetrical patterns.",
        temperature: 0.9
    },
    boids: {
        prompt: "Create a dynamic flock of abstract geometric birds (boids) following Craig Reynolds' flocking rules: alignment, cohesion, and separation. Use simple triangular or arrow-like shapes for the boids. Animate their movement with smooth paths, rotation, and subtle variations. Include emergent flocking behavior and occasional splitting/merging of groups. Use a minimal color palette inspired by early computer graphics.",
        temperature: 0.85
    },
    retrogame: {
        prompt: "Create an animated scene inspired by classic 8-bit and 16-bit video games. Use pixel-perfect geometric shapes, limited color palettes, and simple patterns. Include game elements like platforms, power-ups, or enemies with classic gaming animations (bouncing, rotating, pulsing). Add scan lines or CRT effects for authenticity. Think early Nintendo or Atari aesthetic with smooth sprite animations.",
        temperature: 0.85
    },
    solarpunk: {
        prompt: "Isometric minimalism. Game engine. Create an evolving solarpunk cityscape where nature and technology harmoniously intertwine. Use flowing organic curves for plant life mixed with clean geometric shapes for sustainable architecture. Include animated elements like swaying trees, floating gardens, and shimmering solar panels. Use vibrant greens and warm sunlit colors.",
        temperature: 0.9
    },
    isometric: {
        prompt: "Generate an isometric architectural composition inspired by M.C. Escher and impossible geometry. Create intricate 3D structures with precise angles, interconnected pathways, and recursive patterns. Use animated perspective shifts and transformations. Employ a sophisticated color palette with subtle gradients.",
        temperature: 0.8
    },
    cellular: {
        prompt: "Visualize a cellular automaton system inspired by Conway's Game of Life but with artistic flair. Create evolving patterns of geometric cells that pulse, grow, and transform. Use animated transitions between states. Incorporate mathematical beauty with organic unpredictability.",
        temperature: 0.85
    },
    bauhaus: {
        prompt: "Design an animated Bauhaus-inspired composition that celebrates geometric abstraction and modernist principles. Use primary colors, bold shapes, and clean lines in dynamic arrangements. Include subtle rotations and translations that reflect industrial rhythm and mechanical precision.",
        temperature: 0.7
    },
    quantum: {
        prompt: "Visualize quantum phenomena through abstract art - wave-particle duality, superposition, and entanglement. Create animated probability clouds, interference patterns, and quantum tunneling effects. Use ethereal colors and translucent layers to suggest the mysterious nature of quantum reality.",
        temperature: 0.95
    },
    cosmology: {
        prompt: "Design an abstract representation of cosmic architecture - galaxy formations, gravitational lensing, and spacetime fabric. Create animated elements suggesting orbital motion and celestial mechanics. Use deep space colors and geometric patterns inspired by astronomical phenomena.",
        temperature: 0.85
    },
    meditation: {
        prompt: "Generate abstract visualizations of inner mental states and consciousness. Create flowing mandalas and organic patterns that pulse with meditative rhythms. Use subtle animations and transitions to induce contemplative states. Incorporate sacred geometry and archetypal forms.",
        temperature: 0.8
    },
    emergence: {
        prompt: "Design a complex system showing emergent behavior from simple rules. Create animated patterns that suggest flocking birds, forming crystals, or growing cities. Use mathematical principles to generate organic complexity. Show how individual elements combine to create larger organized structures.",
        temperature: 0.85
    },
    'digital-nature': {
        prompt: `Create a mesmerizing fusion of nature and technology: a fractal tree growing from a digital seedling, 
with branches that transform into circuitboard pathways lit by electric blue lightning. 
Matrix-style digital rain falls in the background, but using varying shades of green and cyan.
The tree should grow slowly and majestically,
while the lightning pulses should be subtle and ethereal. The digital rain should fall at different speeds,
creating layers of depth. Color palette should focus on deep greens, electric blues, and cyan accents,
with occasional golden sparks where the lightning meets the tree branches.`,
        temperature: 0.9
    }
};

// Add saved presets to base presets
Object.assign(presets, savedPresets);

// State
let isRunning = false;
let frames = [];
let frameIndex = 0;
let currentState = null;
let animationFrame = null;
let lastFrameTime = 0;
let initialSeed = 42;
let currentSeed = initialSeed;

// Functions
function getSelectedModel() {
    return elements.modelSelect.value;
}

function createEmptyCanvas() {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <svg width="100%" height="100%" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#1a1a1a"/>
        <text x="50%" y="50%" text-anchor="middle" fill="#666">Generating...</text>
    </svg>`;
}

function extractSvgContent(text) {
    const svgMatch = text.match(/\`\`\`svg\n([\s\S]*?)\n\`\`\`/);
    
    if (svgMatch) {
        return svgMatch[1].trim();
    }
    
    // Try finding SVG tags directly
    const svgTagMatch = text.match(/<svg[\s\S]*?<\/svg>/);
    
    if (svgTagMatch) {
        return svgTagMatch[0].trim();
    }
    
    return null;
}

function updateFrame(currentFrame) {
    // Update preview
    elements.preview.innerHTML = frames[currentFrame];
    
    // Update frame counter
    elements.frameCounter.textContent = `Frame ${currentFrame + 1}/${frames.length}`;
    
    // Update history highlight
    const historyItems = document.querySelectorAll('.history-item');
    historyItems.forEach((item, index) => {
        if (index === currentFrame) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function startPreviewAnimation() {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
    
    lastFrameTime = performance.now();
    
    function animate(currentTime) {
        const frameDelay = parseInt(elements.speedSlider.value);
        const elapsed = currentTime - lastFrameTime;
        
        if (elapsed >= frameDelay && frames.length > 1) {
            frameIndex = (frameIndex + 1) % frames.length;
            updateFrame(frameIndex);
            lastFrameTime = currentTime;
        }
        
        if (isRunning) {
            animationFrame = requestAnimationFrame(animate);
        }
    }
    
    animationFrame = requestAnimationFrame(animate);
}

async function generateText(prompt, currentState, retryCount = 0) {
    const maxRetries = 3;
    const model = getSelectedModel();
    const temperature = parseFloat(elements.temperature.value);
    const seed = currentSeed;

    const systemPrompt = `You are an animated SVG art generator. Create SVG code with 100% width and height.
    Follow these rules:
    0. Your code should be inspired by the demoscene. Self-containted. Small. Re-using elements and groups creatively.
    1. Always start with <?xml version="1.0" encoding="UTF-8"?> and proper SVG tags
    2. Dont modify too many things at once if receiving a previous state
    3. Include style definitions in a <defs> section
    4. Always ensure the SVG is complete and properly closed
    5. If evolving from a previous state, introduce only gradual changes!
    6. Return ONLY the SVG code wrapped in \`\`\`svg code blocks
    7. animations should be slow and fluid
    8. please add directions for the next evolution as explanation underneath the svg
    9. The svg should have width and height 100%
    10. The background is dark
    Creative Direction: ${prompt}`;

    const userMessage = currentState ? 
        `Here is the previous SVG state. Evolve it gradually while maintaining its essence:\n\n${currentState}` :
        "Generate the initial SVG state following the creative direction.";

    console.log('=== LLM Request ===');
    console.log('System:', systemPrompt);
    console.log('User:', userMessage);
    console.log('Temperature:', temperature);
    console.log('Seed:', seed);
    console.log('Model:', model);

    try {
        const response = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ],
                temperature,
                seed
            })
        });

        if (!response.ok) throw new Error('API request failed');
        
        const text = await response.text();
        console.log('=== LLM Response ===');
        console.log(text);
        
        const svgContent = extractSvgContent(text);
        
        if (!svgContent || !svgContent.includes('</svg>')) {
            throw new Error('Incomplete SVG content');
        }
        
        console.log(`Response character count: ${text.length}`);
        
        return svgContent;

    } catch (error) {
        console.error('Error:', error);
        currentSeed++;
        if (retryCount < maxRetries) {
            console.log(`Retry ${retryCount + 1}/${maxRetries}: ${error.message}`);
            return generateText(prompt, currentState, retryCount + 1);
        }
        return null;
    }
}

async function evolve() {
    if (!isRunning) return;

    const preset = presets[elements.presetSelect.value];
    const basePrompt = elements.basePrompt.value || preset.prompt;
    
    try {
        const evolutionPrompt = currentState 
            ? `Evolve this SVG art while maintaining some consistency with the previous state. ${basePrompt}`
            : basePrompt;

        const svgContent = await generateText(evolutionPrompt, currentState);
        
        if (svgContent) {
            currentState = svgContent;
            frames.push(svgContent);
            
            // Update history with all frames
            elements.history.innerHTML = frames.map(frame => `
                <div class="history-item">
                    <div style="width: 160px; height: 120px;">
                        ${frame}
                    </div>
                </div>
            `).join('');

            // Update frame index to show the latest frame
            frameIndex = frames.length - 1;
            updateFrame(frameIndex);

            // Start animation if it's not already running
            if (frames.length === 1) {
                startPreviewAnimation();
            }
            
            // Keep evolving
            if (isRunning) {
                currentSeed++;
                setTimeout(evolve, 1500);
            }
        }
    } catch (error) {
        console.error('Evolution error:', error);
        if (isRunning) {
            currentSeed++;
            setTimeout(evolve, 1500);
        }
    }
}

async function startEvolution() {
    if (isRunning) return;
    
    isRunning = true;
    elements.start.disabled = true;
    elements.stop.disabled = false;

    if (parseInt(elements.seed.value) >= 0) {
        initialSeed = parseInt(elements.seed.value);    
    }
    
    frames = [];
    frameIndex = 0;
    currentState = null;
    
    // Reset seed to initial value
    currentSeed = initialSeed;
    
    if (elements.initialSvg.value?.trim?.()) {
        const prompt = elements.basePrompt.value;
        const initialSvg = elements.initialSvg.value.trim();
        try {
            const svgContent = extractSvgContent(initialSvg);
            if (svgContent) {
                currentState = svgContent + `\n\nPrompt: ${prompt}`;
                frames.push(svgContent);
                updateFrame(0);
            }
        } catch (error) {
            console.error('Error parsing initial SVG:', error);
        }
    }
    
    evolve();
}

function stopEvolution() {
    isRunning = false;
    elements.start.disabled = false;
    elements.stop.disabled = true;
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }
}

function getFirstThreeWords(str) {
    return str.split(/\s+/).slice(0, 3).join(' ');
}

function saveCurrentPreset() {
    const name = prompt('Enter a name for this preset:');
    if (!name) return;
    
    const preset = {
        name,
        prompt: elements.basePrompt.value,
        temperature: parseFloat(elements.temperature.value)
    };
    
    // Save to localStorage
    const savedPresets = JSON.parse(localStorage.getItem('savedPresets2') || '{}');
    savedPresets[name.toLowerCase()] = preset;
    localStorage.setItem('savedPresets2', JSON.stringify(savedPresets));
    
    // Refresh page to update presets
    location.reload();
}

// Event Listeners
elements.presetSelect.addEventListener('change', () => {
    const preset = { ...presets[elements.presetSelect.value] };
    console.log('Loading preset:', preset);
    elements.basePrompt.value = preset.prompt;
    if (preset.temperature) {
        elements.temperature.value = preset.temperature;
        elements.temperatureValue.textContent = preset.temperature;
    }
});

elements.temperature.addEventListener('input', (e) => {
    elements.temperatureValue.textContent = e.target.value;
});

// Fetch available models
fetch('https://text.pollinations.ai/models')
    .then(r => r.json())
    .then(models => {
        elements.modelSelect.innerHTML = models
            .map(m => `<option value="${m.name}" ${m.name === "mistral-7b-instruct" ? 'selected' : ''}>${m.name}</option>`)
            .join('');
    });

// Initialize preview with empty canvas
elements.preview.innerHTML = createEmptyCanvas();
