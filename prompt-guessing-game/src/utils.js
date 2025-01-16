// Function to generate a creative prompt using text.pollinations.ai
export async function generatePrompt() {
  try {
    const response = await fetch('https://text.pollinations.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'Generate a creative and descriptive image prompt that would be interesting to visualize.',
        max_tokens: 50,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate prompt');
    }
    
    const data = await response.json();
    return data.choices[0].text.trim();
  } catch (error) {
    console.error('Error generating prompt:', error);
    throw error;
  }
}

// Function to generate an image from a prompt using image.pollinations.ai
export async function generateImage(prompt) {
  try {
    const response = await fetch('https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt));
    
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
    const response = await fetch('https://text.pollinations.ai/v1/similarity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text1: guess,
        text2: actualPrompt,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to evaluate guess');
    }
    
    const data = await response.json();
    const similarity = data.similarity;
    
    // Return feedback based on similarity score
    if (similarity > 0.9) {
      return { message: "Perfect! You got it!", isCorrect: true, similarity };
    } else if (similarity > 0.7) {
      return { message: "Very close! Try being more specific.", isCorrect: false, similarity };
    } else if (similarity > 0.5) {
      return { message: "You're on the right track!", isCorrect: false, similarity };
    } else {
      return { message: "Not quite. Try a different approach.", isCorrect: false, similarity };
    }
  } catch (error) {
    console.error('Error evaluating guess:', error);
    throw error;
  }
}