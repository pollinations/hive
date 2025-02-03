import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpeg = null;

const initFFmpeg = async () => {
  if (!ffmpeg) {
    ffmpeg = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
  }
  return ffmpeg;
};

export const exportAsGif = async (canvas, fps = 30) => {
  const frames = [];
  const context = canvas.getContext('2d');
  const duration = 3000; // 3 seconds
  const frameCount = (fps * duration) / 1000;

  // Capture frames
  for (let i = 0; i < frameCount; i++) {
    frames.push(canvas.toDataURL('image/png'));
    // Here you would update animations if any
    await new Promise(resolve => setTimeout(resolve, 1000 / fps));
  }

  const ffmpeg = await initFFmpeg();

  // Convert frames to GIF
  for (let i = 0; i < frames.length; i++) {
    const base64Data = frames[i].replace(/^data:image\/\w+;base64,/, '');
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    await ffmpeg.writeFile(`frame_${i}.png`, buffer);
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

  return new Blob([data.buffer], { type: 'image/gif' });
};

export const exportAsMP4 = async (canvas, fps = 30) => {
  const frames = [];
  const context = canvas.getContext('2d');
  const duration = 3000; // 3 seconds
  const frameCount = (fps * duration) / 1000;

  // Capture frames
  for (let i = 0; i < frameCount; i++) {
    frames.push(canvas.toDataURL('image/png'));
    // Here you would update animations if any
    await new Promise(resolve => setTimeout(resolve, 1000 / fps));
  }

  const ffmpeg = await initFFmpeg();

  // Convert frames to video
  for (let i = 0; i < frames.length; i++) {
    const base64Data = frames[i].replace(/^data:image\/\w+;base64,/, '');
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    await ffmpeg.writeFile(`frame_${i}.png`, buffer);
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

  return new Blob([data.buffer], { type: 'video/mp4' });
};
