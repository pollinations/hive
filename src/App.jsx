import { useState } from 'react'
import './App.css'

function App() {
  const [currentImage, setCurrentImage] = useState(null)
  const [userGuess, setUserGuess] = useState('')
  const [feedback, setFeedback] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [actualPrompt, setActualPrompt] = useState('')

  const handleGuess = async (e) => {
    e.preventDefault()
    // TODO: Implement guess evaluation logic using text.pollinations.ai
    setAttempts(prev => prev + 1)
  }

  const startNewGame = async () => {
    // TODO: Generate new prompt using text.pollinations.ai
    // TODO: Generate image using image.pollinations.ai
    setAttempts(0)
    setFeedback('')
    setUserGuess('')
  }

  return (
    <div className="app">
      <h1>Prompt Guessing Game</h1>
      
      <div className="game-container">
        {currentImage ? (
          <>
            <div className="image-container">
              <img src={currentImage} alt="AI generated" />
            </div>
            
            <form onSubmit={handleGuess}>
              <input
                type="text"
                value={userGuess}
                onChange={(e) => setUserGuess(e.target.value)}
                placeholder="What's the prompt for this image?"
              />
              <button type="submit">Submit Guess</button>
            </form>
            
            <div className="game-info">
              <p>Attempts: {attempts}</p>
              {feedback && <p className="feedback">{feedback}</p>}
            </div>
          </>
        ) : (
          <button onClick={startNewGame}>Start New Game</button>
        )}
      </div>
    </div>
  )
}

export default App