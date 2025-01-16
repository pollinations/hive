import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// Mock the Pollinations hooks
vi.mock('@pollinations/react', () => ({
  usePollinationsText: () => 'a beautiful sunset over the ocean',
  usePollinationsImage: () => 'https://image.pollinations.ai/prompt/test',
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/AI Prompt Guesser/i)).toBeDefined();
  });

  it('allows user input and shows feedback', async () => {
    render(<App />);
    
    // Find and fill the input
    const input = screen.getByPlaceholderText(/What do you think/i);
    fireEvent.change(input, { target: { value: 'sunset at the beach' } });
    
    // Submit guess
    const submitButton = screen.getByText(/Submit Guess/i);
    fireEvent.click(submitButton);
    
    // Check if feedback is shown
    expect(screen.getByText(/Round 1 Results/i)).toBeDefined();
    
    // Check if next round button appears
    expect(screen.getByText(/Next Round/i)).toBeDefined();
  });

  it('starts new round when next round button is clicked', () => {
    render(<App />);
    
    // Submit a guess first
    const input = screen.getByPlaceholderText(/What do you think/i);
    fireEvent.change(input, { target: { value: 'test guess' } });
    const submitButton = screen.getByText(/Submit Guess/i);
    fireEvent.click(submitButton);
    
    // Click next round
    const nextRoundButton = screen.getByText(/Next Round/i);
    fireEvent.click(nextRoundButton);
    
    // Check if we're back to guessing state
    expect(screen.getByPlaceholderText(/What do you think/i)).toBeDefined();
  });
});