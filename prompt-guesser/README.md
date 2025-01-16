# AI Prompt Guesser Game

A fun game where players try to guess the prompt used to generate an AI image. The game:

1. Uses text.pollinations.ai to generate creative image prompts
2. Uses image.pollinations.ai to generate images from those prompts
3. Lets users guess what the original prompt was
4. Scores their guesses based on similarity to the actual prompt

## Features

- AI-generated creative prompts
- Real-time image generation
- String similarity scoring
- Multiple rounds of play
- Running score tracking

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## How to Play

1. Look at the AI-generated image
2. Type your best guess at what prompt was used to create it
3. Submit your guess to see how close you were
4. Continue to the next round to try again

## Technologies Used

- React
- Vite
- @pollinations/react hooks
- string-similarity for comparing prompts