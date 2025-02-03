import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({ log: true });

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

  // Load FFmpeg if not loaded
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }

  // Convert frames to GIF
  for (let i = 0; i < frames.length; i++) {
    const base64Data = frames[i].replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    ffmpeg.FS('writeFile', `frame_${i}.png`, buffer);
  }

  await ffmpeg.run(
    '-framerate', `${fps}`,
    '-pattern_type', 'glob',
    '-i', 'frame_*.png',
    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
    'output.gif'
  );

  // Read the output file
  const data = ffmpeg.FS('readFile', 'output.gif');
  
  // Clean up files
  frames.forEach((_, i) => {
    ffmpeg.FS('unlink', `frame_${i}.png`);
  });
  ffmpeg.FS('unlink', 'output.gif');

  return new Blob([data.buffer], { type: 'image/gif' });
};

export const exportAsMP4 = async (canvas, fps = 30) => {
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }

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

  // Convert frames to video
  for (let i = 0; i < frames.length; i++) {
    const base64Data = frames[i].replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    ffmpeg.FS('writeFile', `frame_${i}.png`, buffer);
  }

  await ffmpeg.run(
    '-framerate', `${fps}`,
    '-pattern_type', 'glob',
    '-i', 'frame_*.png',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    'output.mp4'
  );

  // Read the output file
  const data = ffmpeg.FS('readFile', 'output.mp4');
  
  // Clean up files
  frames.forEach((_, i) => {
    ffmpeg.FS('unlink', `frame_${i}.png`);
  });
  ffmpeg.FS('unlink', 'output.mp4');

  return new Blob([data.buffer], { type: 'video/mp4' });
};
