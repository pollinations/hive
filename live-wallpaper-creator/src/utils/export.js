import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpeg = null;

const initFFmpeg = async () => {
  if (!ffmpeg) {
    ffmpeg = new FFmpeg();
    try {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
      const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');
      const workerURL = await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript');

      console.log('Loading FFmpeg with URLs:', { coreURL, wasmURL, workerURL });
      
      await ffmpeg.load({
        coreURL,
        wasmURL,
        workerURL,
        logger: ({ message }) => console.log('FFmpeg:', message)
      });
      
      // Test FFmpeg initialization
      await ffmpeg.writeFile('test.txt', new Uint8Array([1]));
      await ffmpeg.deleteFile('test.txt');
      console.log('FFmpeg initialized successfully');
    } catch (error) {
      console.error('FFmpeg initialization failed:', error);
      throw new Error(`Failed to initialize FFmpeg: ${error.message}`);
    }
  }
  return ffmpeg;
};

export const exportAsGif = async (canvas, fps = 30, onProgress = () => {}) => {
  const frames = [];
  const frameCount = (fps * 3); // 3 seconds
  
  // Capture frames
  for (let i = 0; i < frameCount; i++) {
    frames.push(canvas.toDataURL('image/png'));
    onProgress(i / (frameCount * 2)); // First half of progress for frame capture
    await new Promise(resolve => setTimeout(resolve, 1000 / fps));
  }

  const ffmpeg = await initFFmpeg();

  try {
    // Convert frames to GIF
    for (let i = 0; i < frames.length; i++) {
      const base64Data = frames[i].replace(/^data:image\/\w+;base64,/, '');
      const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      await ffmpeg.writeFile(`frame_${i}.png`, buffer);
      onProgress(0.5 + (i / (frames.length * 2))); // Second half of progress for conversion
    }

    await ffmpeg.exec([
      '-framerate', `${fps}`,
      '-pattern_type', 'glob',
      '-i', 'frame_*.png',
      '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
      'output.gif'
    ]);

    // Read the output file
    const data = await ffmpeg.readFile('output.gif');
    
    // Clean up files
    for (let i = 0; i < frames.length; i++) {
      await ffmpeg.deleteFile(`frame_${i}.png`);
    }
    await ffmpeg.deleteFile('output.gif');

    onProgress(1); // Complete
    return new Blob([data.buffer], { type: 'image/gif' });
  } catch (error) {
    console.error('GIF export failed:', error);
    throw error;
  }
};

export const exportAsMP4 = async (canvas, fps = 30, onProgress = () => {}) => {
  const frames = [];
  const frameCount = (fps * 3); // 3 seconds
  
  // Capture frames
  for (let i = 0; i < frameCount; i++) {
    frames.push(canvas.toDataURL('image/png'));
    onProgress(i / (frameCount * 2)); // First half of progress for frame capture
    await new Promise(resolve => setTimeout(resolve, 1000 / fps));
  }

  const ffmpeg = await initFFmpeg();

  try {
    // Convert frames to video
    for (let i = 0; i < frames.length; i++) {
      const base64Data = frames[i].replace(/^data:image\/\w+;base64,/, '');
      const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      await ffmpeg.writeFile(`frame_${i}.png`, buffer);
      onProgress(0.5 + (i / (frames.length * 2))); // Second half of progress for conversion
    }

    await ffmpeg.exec([
      '-framerate', `${fps}`,
      '-pattern_type', 'glob',
      '-i', 'frame_*.png',
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      'output.mp4'
    ]);

    // Read the output file
    const data = await ffmpeg.readFile('output.mp4');
    
    // Clean up files
    for (let i = 0; i < frames.length; i++) {
      await ffmpeg.deleteFile(`frame_${i}.png`);
    }
    await ffmpeg.deleteFile('output.mp4');

    onProgress(1); // Complete
    return new Blob([data.buffer], { type: 'video/mp4' });
  } catch (error) {
    console.error('MP4 export failed:', error);
    throw error;
  }
};
