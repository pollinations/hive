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

  const handleGuess = async (e) => {
    e.preventDefault()
    if (!userGuess.trim()) return

    try {
      setLoading(true)
      const result = await evaluateGuess(userGuess, actualPrompt)
      setFeedback(result.message)
      setAttempts(prev => prev + 1)

      if (result.isCorrect) {
        setTimeout(() => {
          alert('Congratulations! You guessed the prompt correctly!')
          startNewGame()
        }, 1500)
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

  return (
    <div className="app">
      <h1>Prompt Guessing Game</h1>
      
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
                disabled={loading}
              />
              <button type="submit" disabled={loading || !userGuess.trim()}>
                Submit Guess
              </button>
            </form>
            
            <div className="game-info">
              <p>Attempts: {attempts}</p>
              {feedback && <p className="feedback">{feedback}</p>}
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
