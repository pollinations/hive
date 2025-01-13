import { useState } from 'react'
import { usePollinationsImage, usePollinationsText } from '@pollinations/react'
import './App.css'

function App() {
  const [drawnCard, setDrawnCard] = useState(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const majorArcana = [
    'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
    'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
    'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
    'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun',
    'Judgement', 'The World'
  ]

  const handleDrawCard = () => {
    if (!isDrawing) {
      setIsDrawing(true)
      const randomIndex = Math.floor(Math.random() * majorArcana.length)
      setDrawnCard(majorArcana[randomIndex])
    }
  }

  const cardImage = usePollinationsImage(
    drawnCard ? `Tarot card ${drawnCard}, mystical, detailed illustration, golden ornaments` : null,
    { width: 512, height: 768 }
  )

  const cardReading = usePollinationsText(
    drawnCard ? `Give a brief tarot reading for ${drawnCard} card. Be mystical but concise.` : null
  )

  return (
    <div className="app">
      <h1>Mystic Tarot Reader</h1>
      <div className="card-container">
        {!drawnCard ? (
          <button className="draw-button" onClick={handleDrawCard} disabled={isDrawing}>
            Draw a Card
          </button>
        ) : (
          <div className="reading">
            <h2>{drawnCard}</h2>
            {cardImage && (
              <img 
                src={cardImage} 
                alt={drawnCard} 
                className="tarot-card"
                onLoad={() => setIsDrawing(false)}
              />
            )}
            {cardReading && (
              <div className="reading-text">
                <p>{cardReading}</p>
                <button className="draw-button" onClick={() => {
                  setDrawnCard(null)
                  setIsDrawing(false)
                }}>
                  Draw Another Card
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
