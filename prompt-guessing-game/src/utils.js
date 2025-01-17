// Function to generate a creative prompt using text.pollinations.ai
export async function generatePrompt() {
  try {
    const seed = Math.floor(Math.random() * 1000000);
    const promptRequest = encodeURIComponent('Generate a creative and descriptive image prompt that would be interesting to visualize. Keep it concise.');
    const response = await fetch(`https://text.pollinations.ai/${promptRequest}?seed=${seed}`);
    
    if (!response.ok) {
      throw new Error('Failed to generate prompt');
    }
    
    const text = await response.text();
    return text.trim();
  } catch (error) {
    console.error('Error generating prompt:', error);
    throw error;
  }
}

// Function to generate an image from a prompt using image.pollinations.ai
export async function generateImage(prompt) {
  try {
    const seed = Math.floor(Math.random() * 1000000);
    const response = await fetch(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${seed}`);
    
    if (!response.ok) {
      throw new Error('Failed to generate image');
    }
    
    return response.url;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

// Function to evaluate similarity between guess and actual prompt
export async function evaluateGuess(guess, actualPrompt) {
  try {
    const seed = Math.floor(Math.random() * 1000000);
    const promptRequest = encodeURIComponent(
      `Rate how similar these two image prompts are on a scale of 0-100, responding with ONLY a number:
      Prompt 1: "${guess}"
      Prompt 2: "${actualPrompt}"`
    );
    
    const response = await fetch(`https://text.pollinations.ai/${promptRequest}?seed=${seed}`);
    if (!response.ok) {
      throw new Error('Failed to evaluate guess');
    }
    
    const scoreText = await response.text();
    const similarity = parseInt(scoreText.trim(), 10) / 100;

    // Return feedback based on similarity score
    if (similarity > 0.8) {
      return { message: `Perfect! You got it! (Score: ${Math.round(similarity * 100)}%)`, isCorrect: true, similarity };
    } else if (similarity > 0.6) {
      return { message: `Very close! Try being more specific. (Score: ${Math.round(similarity * 100)}%)`, isCorrect: false, similarity };
    } else if (similarity > 0.4) {
      return { message: `You're on the right track! (Score: ${Math.round(similarity * 100)}%)`, isCorrect: false, similarity };
    } else {
      return { message: `Not quite. Try a different approach. (Score: ${Math.round(similarity * 100)}%)`, isCorrect: false, similarity };
    }
  } catch (error) {
    console.error('Error evaluating guess:', error);
    // Fallback to word overlap method if API fails
    const normalizedGuess = guess.toLowerCase().trim();
    const normalizedActual = actualPrompt.toLowerCase().trim();
    
    const guessWords = new Set(normalizedGuess.split(/\s+/));
    const actualWords = new Set(normalizedActual.split(/\s+/));
    const intersection = new Set([...guessWords].filter(x => actualWords.has(x)));
    const union = new Set([...guessWords, ...actualWords]);
    const similarity = intersection.size / union.size;

    return {
      message: `Score (word overlap): ${Math.round(similarity * 100)}%`,
      isCorrect: similarity > 0.8,
      similarity
    };
  }
}