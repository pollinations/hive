# Live Wallpaper Creator

A web-based tool for creating animated wallpapers with customizable overlays. Built with React and FFmpeg.

## Features

- 🖼️ Upload and manipulate background images
- 🎞️ Export as GIF or MP4
- ⌨️ Keyboard shortcuts for common actions
- 📊 Progress tracking for exports
- 🎨 Modern dark theme UI
- ♿ Accessibility features

## Keyboard Shortcuts

- `Ctrl/⌘ + O`: Open file picker
- `Ctrl/⌘ + S`: Save as GIF
- `Ctrl/⌘ + Shift + S`: Save as MP4
- `?`: Toggle help dialog

## Browser Requirements

- Modern browser (Chrome, Firefox, or Edge)
- HTTPS connection (required for SharedArrayBuffer)
- WebAssembly support

## Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```

### Building

```bash
npm run build
```

The built files will be in the `dist` directory.

## Technical Details

- Built with:
  - React
  - Material-UI
  - FFmpeg.wasm
  - Vite

- Features:
  - Client-side video processing
  - Drag and drop interface
  - Progress tracking
  - Accessibility support
  - Keyboard shortcuts

## Browser Support

The app requires:
- SharedArrayBuffer support
- WebAssembly support
- Secure context (HTTPS)

For best results, use:
- Chrome (latest)
- Firefox (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
