import { useState } from 'react'
import { generatePrompt, generateImage, evaluateGuess } from './utils'
import './App.css'

function App() {
  const [currentImage, setCurrentImage] = useState(null)
  const [userGuess, setUserGuess] = useState('')
  const [feedback, setFeedback] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [actualPrompt, setActualPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showHint, setShowHint] = useState(false)
  const [gameWon, setGameWon] = useState(false)

  const handleGuess = async (e) => {
    e.preventDefault()
    if (!userGuess.trim()) return

    try {
      setLoading(true)
      const result = await evaluateGuess(userGuess, actualPrompt)
      setFeedback(result.message)
      setAttempts(prev => prev + 1)

      if (result.isCorrect) {
        setGameWon(true)
        setFeedback(`Perfect! The prompt was: "${actualPrompt}"`)
        setTimeout(() => {
          if (confirm('Congratulations! Would you like to play again?')) {
            startNewGame()
          }
        }, 2000)
      } else if (attempts >= 4 && !showHint) {
        setShowHint(true)
      }
    } catch (err) {
      setError('Failed to evaluate guess. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const startNewGame = async () => {
    try {
      setLoading(true)
      setError(null)
      setShowHint(false)
      setGameWon(false)
      
      // Generate new prompt
      const prompt = await generatePrompt()
      setActualPrompt(prompt)
      
      // Generate image from prompt
      const imageUrl = await generateImage(prompt)
      setCurrentImage(imageUrl)
      
      // Reset game state
      setAttempts(0)
      setFeedback('')
      setUserGuess('')
    } catch (err) {
      setError('Failed to start new game. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getHint = () => {
    const words = actualPrompt.split(' ')
    return words.map(word => word[0] + '...').join(' ')
  }

  return (
    <div className="app">
      <h1>Prompt Guessing Game</h1>
      
      <div className="instructions">
        <p>Try to guess the AI-generated prompt that was used to create this image!</p>
        <p>The more accurate your guess, the higher your score.</p>
      </div>
      
      <div className="game-container">
        {error && <p className="error">{error}</p>}
        
        {loading ? (
          <div className="loading">Loading...</div>
        ) : currentImage ? (
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
                disabled={loading || gameWon}
              />
              <button type="submit" disabled={loading || !userGuess.trim() || gameWon}>
                Submit Guess
              </button>
            </form>
            
            <div className="game-info">
              <p>Attempts: {attempts}</p>
              {feedback && <p className="feedback">{feedback}</p>}
              {showHint && !gameWon && (
                <p className="hint">
                  Hint: The prompt starts with: {getHint()}
                </p>
              )}
            </div>
          </>
        ) : (
          <button onClick={startNewGame} disabled={loading}>
            Start New Game
          </button>
        )}
      </div>
    </div>
  )
}

export default App
