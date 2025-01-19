const elements = {
    presetSelect: document.getElementById('preset-select'),
    basePrompt: document.getElementById('base-prompt'),
    modelSelect: document.getElementById('model-select'),
    temperature: document.getElementById('temperature'),
    temperatureValue: document.getElementById('temperature-value'),
    seed: document.getElementById('seed'),
    preview: document.getElementById('mermaid-container'),
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

// Fetch available models
fetch('https://text.pollinations.ai/models')
    .then(r => r.json())
    .then(models => {
        elements.modelSelect.innerHTML = models
            .map(m => `<option value="${m.name}" ${m.name === 'openai-large' ? 'selected' : ''}>${m.name} - ${m.description}</option>`)
            .join('');
    });

function getSelectedModel() {
    return elements.modelSelect.value;
}

// State
let isRunning = false;
let frames = [];
let frameIndex = 0;
let currentSeed = 42;
let initialSeed = 42;
let lastFrameTime = 0;
let animationFrame = null;
let currentState = null;

function createEmptyCanvas() {
    const initialDiagram = `graph TD
        A[Start Evolution] --> B[Generate Diagram]`;
    
    elements.preview.innerHTML = `<div class="mermaid">
        ${initialDiagram}
    </div>`;
    
    if (window.mermaid) {
        try {
            mermaid.contentLoaded();
        } catch (error) {
            console.error('Mermaid rendering error:', error);
        }
    }
}

function extractMermaidContent(text) {
    // Try to match Mermaid with language specifier
    let mermaidMatch = text.match(/```(?:mermaid|md)\n([\s\S]*?)\n```/);
    if (mermaidMatch) return mermaidMatch[1].trim();
    
    // Try to match Mermaid without language specifier
    mermaidMatch = text.match(/```([\s\S]*?)```/);
    if (mermaidMatch && mermaidMatch[1].trim().startsWith('graph')) {
        return mermaidMatch[1].trim();
    }
    
    // If the text itself starts with graph, return it directly
    if (text.trim().startsWith('graph')) {
        return text.trim();
    }
    
    return null;
}

function updateFrame(currentFrame) {
    // Update preview
    elements.preview.innerHTML = frames[currentFrame];
    console.log("set innerHTML", frames[currentFrame]);
    elements.preview.removeAttribute('data-processed');

    try {
        mermaid.contentLoaded();
    } catch (error) {
        console.error("Mermaid error:", error);
        // Remove the problematic frame
        frames.splice(currentFrame, 1);
        
        // If we have no frames left, create empty canvas
        if (frames.length === 0) {
            createEmptyCanvas();
            return;
        }
        
        // Increment seed and try to regenerate
        currentSeed = Math.floor(Math.random() * 1000000);
        console.log("Regenerating with new seed:", currentSeed);
        
        // If we're evolving, trigger a new evolution
        if (isRunning) {
            evolve();
        }
        
        // Show previous valid frame
        const newFrameIndex = Math.max(0, frames.length - 1);
        updateFrame(newFrameIndex);
        return;
    }
    
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

async function generateText(prompt, currentState, retryCount = 0) {
    const maxRetries = 8;
    const model = getSelectedModel();
    const temperature = parseFloat(elements.temperature.value);
    const seed = currentSeed;// + retryCount; // Increment seed based on retry count

    const systemPrompt = `You are a Mermaid diagram generator. Create Mermaid code.
    Follow these rules:
    0. Your code should be inspired by the demoscene. Self-containted. Small. Re-using elements and groups creatively.
    2. Dont modify too many things at once if receiving a previous state
    4. Always ensure the Mermaid is complete and properly closed
    5. If evolving from a previous state, introduce only gradual changes!
    6. Return ONLY the Mermaid code wrapped in \`\`\`mermaid code blocks
    7. animations should be slow and fluid
    8. please add directions for the next evolution as explanation underneath the mermaid
    9. The mermaid should have a clear and concise layout
    10. The background is dark
    Creative Direction: ${prompt}`;

    const userMessage = currentState ? 
        `Here is the previous Mermaid state. Evolve it gradually while maintaining its essence:\n\n${currentState}` :
        "Generate the initial Mermaid state following the creative direction.";

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
        
        const mermaidContent = extractMermaidContent(text);
        
        // Validate Mermaid completeness
        
        if (!mermaidContent) {
            throw new Error('Incomplete Mermaid content');
        }
        
        console.log(`Response character count: ${text.length}`);
        
        return mermaidContent;

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
            ? `Evolve this Mermaid diagram while maintaining some consistency with the previous state. ${basePrompt}`
            : basePrompt;

        const mermaidContent = await generateText(evolutionPrompt, currentState);
        
        if (mermaidContent) {
            currentState = mermaidContent;
            frames.push(mermaidContent);
            
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
            const mermaidContent = extractMermaidContent(initialSvg);
            if (mermaidContent) {
                currentState = mermaidContent + `\n\nPrompt: ${prompt}`;
                frames.push(mermaidContent);
                updateFrame(frameIndex);
                startPreviewAnimation();
            }
        } catch (error) {
            console.error('Invalid initial Mermaid:', error);
        }
    }

    await evolve();
}

function stopEvolution() {
    isRunning = false;
    elements.start.disabled = false;
    elements.stop.disabled = true;
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
    // Reset seed to initial value
    currentSeed = initialSeed;
}

function getFirstThreeWords(str) {
    return str.trim().split(/\s+/).slice(0, 3).join(' ');
}

function saveCurrentPreset() {
    const defaultName = getFirstThreeWords(elements.basePrompt.value);
    const name = prompt('Enter a name for this preset:', defaultName);
    if (!name) return;
    
    const preset = {
        name,
        prompt: elements.basePrompt.value,
        temperature: elements.temperature.value,
        initialSvg: elements.initialSvg.value,
        model: elements.modelSelect.value,
        seed: initialSeed
    };
    
    const savedPresets = JSON.parse(localStorage.getItem('savedPresets2') || '{}');
    savedPresets[name] = preset;
    
    localStorage.setItem('savedPresets2', JSON.stringify(savedPresets));
    
    // Add to select if not exists
    if (!elements.presetSelect.querySelector(`option[value="${name}"]`)) {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        elements.presetSelect.appendChild(option);
    }
    
    elements.presetSelect.value = name;
}

elements.presetSelect.addEventListener('change', () => {
    const preset = { ...presets[elements.presetSelect.value] };
    console.log('Loading preset:', preset);
    elements.basePrompt.value = preset.prompt;
    elements.temperature.value = preset.temperature;
    elements.temperatureValue.textContent = preset.temperature;
    if (preset.initialSvg) {
        elements.initialSvg.value = preset.initialSvg;
    }
    if (preset.model) {
        elements.modelSelect.value = preset.model;
    }
    if (preset.seed) {
        currentSeed = preset.seed;
        initialSeed = preset.seed;
    } else {
        currentSeed = 42;
        initialSeed = 42;
    }
});

// Event Listeners
elements.start.addEventListener('click', startEvolution);
elements.stop.addEventListener('click', stopEvolution);
elements.temperature.addEventListener('input', (e) => {
    elements.temperatureValue.textContent = e.target.value;
});

// Wait for mermaid to be available
function waitForMermaid(callback) {
    if (window.mermaid) {
        callback();
    } else {
        setTimeout(() => waitForMermaid(callback), 100);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    waitForMermaid(() => {
        // Add saved presets to select
        Object.entries(savedPresets).forEach(([key, preset]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = preset.name;
            elements.presetSelect.appendChild(option);
        });
        createEmptyCanvas();
        elements.presetSelect.value = 'digital-nature';
        elements.basePrompt.value = presets['digital-nature'].prompt;
        if (presets['digital-nature'].initialSvg) {
            elements.initialSvg.value = presets['digital-nature'].initialSvg;
        }
    });
});

// Initialize when mermaid is ready
document.addEventListener('DOMContentLoaded', function() {
    if (window.mermaid) {
        createEmptyCanvas();
    } else {
        const checkMermaid = setInterval(() => {
            if (window.mermaid) {
                clearInterval(checkMermaid);
                createEmptyCanvas();
            }
        }, 100);
    }
});

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
