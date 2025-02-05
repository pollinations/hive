# Overlay Assets

This directory contains overlay assets for the Live Wallpaper Creator.

## Structure

```
overlays/
├── sparkles/     # Sparkle and glitter effects
├── effects/      # General visual effects
├── nature/       # Nature-themed animations
└── animals/      # Animal animations
```

## Adding New Overlays

1. Add your GIF/APNG file to the appropriate category directory
2. Update overlays.json with the new overlay information:

```json
{
  "category": [
    {
      "name": "Display Name",
      "file": "filename.gif",
      "description": "Brief description"
    }
  ]
}
```

## Requirements

- Files should be transparent GIF or APNG format
- Keep file sizes reasonable (< 1MB recommended)
- Use appropriate category or create new one if needed
