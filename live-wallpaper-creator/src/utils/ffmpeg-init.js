import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';

let ffmpeg = null;

export const initFFmpeg = async () => {
  if (!ffmpeg) {
    ffmpeg = new FFmpeg();
    try {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          'text/javascript',
          { type: 'text/javascript', crossOrigin: 'anonymous' }
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          'application/wasm',
          { type: 'application/wasm', crossOrigin: 'anonymous' }
        ),
      });
      
      // Test FFmpeg initialization
      await ffmpeg.writeFile('test.txt', new Uint8Array([1]));
      await ffmpeg.deleteFile('test.txt');
    } catch (error) {
      console.error('FFmpeg initialization failed:', error);
      throw new Error('Failed to initialize FFmpeg');
    }
  }
  return ffmpeg;
};
