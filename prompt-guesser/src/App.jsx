import { useState, useEffect } from 'react';
import { usePollinationsText, usePollinationsImage } from '@pollinations/react';
import { compareTwoStrings } from 'string-similarity';

function App() {
  const [gameState, setGameState] = useState('start'); // start, playing, feedback
  const [userGuess, setUserGuess] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [round, setRound] = useState(1);

  // Generate a creative prompt using text.pollinations.ai
  const generatedPrompt = usePollinationsText(
    'Generate a creative, detailed and imaginative image prompt that would work well with an AI image generator. The prompt should be descriptive and specific, but not too long. Format: just return the prompt text without quotes or explanation.',
    {
      seed: round, // Use round as seed to get different prompts each round
      model: 'openai',
      systemPrompt: 'You are a creative prompt engineer. Generate imaginative and detailed prompts that work well with AI image generators.'
    }
  );

  // Generate image using the prompt
  const imageUrl = usePollinationsImage(currentPrompt, {
    width: 512,
    height: 512,
    seed: round,
    model: 'flux'
  });

  useEffect(() => {
    if (generatedPrompt && gameState === 'start') {
      setCurrentPrompt(generatedPrompt);
      setGameState('playing');
    }
  }, [generatedPrompt, gameState]);

  const handleGuess = () => {
    if (!userGuess.trim()) return;

    // Calculate similarity score between user's guess and actual prompt
    const similarity = compareTwoStrings(userGuess.toLowerCase(), currentPrompt.toLowerCase());
    const roundScore = Math.round(similarity * 100);

    // Update total score
    setScore(prevScore => prevScore + roundScore);

    // Provide feedback
    setFeedback(`
      Round ${round} Results:
      Your guess: "${userGuess}"
      Actual prompt: "${currentPrompt}"
      Similarity score: ${roundScore}%
    `);

    setGameState('feedback');
  };

  const startNewRound = () => {
    setRound(prev => prev + 1);
    setUserGuess('');
    setFeedback('');
    setGameState('start');
  };

  if (!imageUrl) {
    return <div>Loading...</div>;
  }

  return (
    <div className="game-container">
      <h1>AI Prompt Guesser</h1>
      <p>Round {round} - Total Score: {score}</p>
      
      <div className="image-container">
        <img src={imageUrl} alt="AI generated" />
      </div>

      <div className="input-container">
        {gameState === 'playing' && (
          <>
            <input
              type="text"
              value={userGuess}
              onChange={(e) => setUserGuess(e.target.value)}
              placeholder="What do you think was the prompt for this image?"
              onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
            />
            <button onClick={handleGuess}>Submit Guess</button>
          </>
        )}

        {gameState === 'feedback' && (
          <>
            <div className="feedback">{feedback}</div>
            <button onClick={startNewRound}>Next Round</button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;