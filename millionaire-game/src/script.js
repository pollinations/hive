class MillionaireGame {
    constructor() {
        this.currentQuestion = 0;
        this.currentPrize = 0;
        this.isGameActive = false;
        this.helpLinesUsed = {
            fiftyFifty: false,
            phoneFriend: false,
            askAudience: false,
            askHost: false
        };
        this.moneyLadder = [500, 1000, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];
        this.safeHavens = [1000, 50000];
        
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.questionElement = document.getElementById('question');
        this.answerButtons = Array.from(document.getElementsByClassName('answer-button'));
        this.moneyItems = Array.from(document.getElementsByClassName('money-item'));
        this.currentPrizeElement = document.getElementById('current-prize');
        this.messageElement = document.getElementById('message');
        this.startButton = document.getElementById('start-game');
        this.quitButton = document.getElementById('quit-game');
        
        // Help line buttons
        this.fiftyFiftyButton = document.getElementById('fifty-fifty');
        this.phoneFriendButton = document.getElementById('phone-friend');
        this.askAudienceButton = document.getElementById('ask-audience');
        this.askHostButton = document.getElementById('ask-host');
    }

    attachEventListeners() {
        this.startButton.addEventListener('click', () => this.startGame());
        this.quitButton.addEventListener('click', () => this.quitGame());
        this.answerButtons.forEach(button => {
            button.addEventListener('click', () => this.handleAnswer(button));
        });
        
        // Help line event listeners
        this.fiftyFiftyButton.addEventListener('click', () => this.useFiftyFifty());
        this.phoneFriendButton.addEventListener('click', () => this.usePhoneFriend());
        this.askAudienceButton.addEventListener('click', () => this.useAskAudience());
        this.askHostButton.addEventListener('click', () => this.useAskHost());
    }

    async startGame() {
        this.isGameActive = true;
        this.currentQuestion = 0;
        this.currentPrize = 0;
        this.helpLinesUsed = {
            fiftyFifty: false,
            phoneFriend: false,
            askAudience: false,
            askHost: false
        };
        
        this.startButton.style.display = 'none';
        this.quitButton.style.display = 'block';
        this.currentPrizeElement.textContent = '0';
        
        await this.loadNextQuestion();
    }

    quitGame() {
        const guaranteedPrize = this.getGuaranteedPrize();
        this.showMessage(`Game Over! You're walking away with $${guaranteedPrize.toLocaleString()}`);
        this.resetGame();
    }

    resetGame() {
        this.isGameActive = false;
        this.startButton.style.display = 'block';
        this.quitButton.style.display = 'none';
        this.answerButtons.forEach(button => {
            button.disabled = false;
            button.className = 'answer-button';
            button.textContent = button.getAttribute('data-index') === '0' ? 'A: ' :
                               button.getAttribute('data-index') === '1' ? 'B: ' :
                               button.getAttribute('data-index') === '2' ? 'C: ' : 'D: ';
        });
        this.enableAllHelpLines();
        this.updateMoneyLadder(-1);
    }

    async loadNextQuestion() {
        const difficulty = Math.min(9, Math.floor(this.currentQuestion / 2));
        const prompt = `Generate a multiple choice trivia question for "Who Wants to Be a Millionaire?" 
                       Difficulty level: ${difficulty}/9 (0 being easiest, 9 being hardest).
                       Format: Return a JSON object with the following structure:
                       {
                           "question": "The question text",
                           "answers": ["correct answer", "wrong answer 1", "wrong answer 2", "wrong answer 3"],
                           "correctIndex": 0
                       }
                       Make sure the question is challenging but fair, and all answers are plausible.`;

        try {
            const response = await fetch('https://text.pollinations.ai/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: 'You are a game show question writer.' },
                        { role: 'user', content: prompt }
                    ],
                    jsonMode: true
                }),
            });

            const data = await response.json();
            this.currentQuestionData = data;
            
            // Update UI with new question
            this.questionElement.textContent = data.question;
            this.answerButtons.forEach((button, index) => {
                button.textContent = `${String.fromCharCode(65 + index)}: ${data.answers[index]}`;
                button.disabled = false;
                button.className = 'answer-button';
            });
            
            this.updateMoneyLadder(this.currentQuestion);
        } catch (error) {
            console.error('Error loading question:', error);
            this.showMessage('Error loading question. Please try again.');
        }
    }

    async handleAnswer(button) {
        if (!this.isGameActive) return;
        
        const selectedIndex = parseInt(button.getAttribute('data-index'));
        button.classList.add('selected');
        this.answerButtons.forEach(btn => btn.disabled = true);
        
        // Dramatic pause
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (selectedIndex === this.currentQuestionData.correctIndex) {
            button.classList.add('correct');
            this.currentPrize = this.moneyLadder[this.currentQuestion];
            this.currentPrizeElement.textContent = this.currentPrize.toLocaleString();
            
            if (this.currentQuestion === this.moneyLadder.length - 1) {
                this.showMessage('Congratulations! You\'ve won the million dollars!');
                this.resetGame();
            } else {
                this.currentQuestion++;
                await new Promise(resolve => setTimeout(resolve, 1500));
                await this.loadNextQuestion();
            }
        } else {
            button.classList.add('wrong');
            const correctButton = this.answerButtons[this.currentQuestionData.correctIndex];
            correctButton.classList.add('correct');
            
            const guaranteedPrize = this.getGuaranteedPrize();
            this.showMessage(`Game Over! You walk away with $${guaranteedPrize.toLocaleString()}`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            this.resetGame();
        }
    }

    getGuaranteedPrize() {
        let guaranteedPrize = 0;
        for (let i = 0; i < this.currentQuestion; i++) {
            if (this.safeHavens.includes(this.moneyLadder[i])) {
                guaranteedPrize = this.moneyLadder[i];
            }
        }
        return guaranteedPrize;
    }

    updateMoneyLadder(currentQuestionIndex) {
        this.moneyItems.forEach((item, index) => {
            item.classList.remove('active');
            if (index === currentQuestionIndex) {
                item.classList.add('active');
            }
        });
    }

    showMessage(message) {
        this.messageElement.textContent = message;
    }

    // Help Line Implementations
    async useFiftyFifty() {
        if (this.helpLinesUsed.fiftyFifty || !this.isGameActive) return;
        
        this.helpLinesUsed.fiftyFifty = true;
        this.fiftyFiftyButton.disabled = true;
        
        const correctIndex = this.currentQuestionData.correctIndex;
        const wrongIndices = [0, 1, 2, 3].filter(i => i !== correctIndex);
        const indicesToKeep = [correctIndex, wrongIndices[Math.floor(Math.random() * wrongIndices.length)]];
        
        this.answerButtons.forEach((button, index) => {
            if (!indicesToKeep.includes(index)) {
                button.disabled = true;
                button.style.opacity = '0.3';
            }
        });
    }

    async usePhoneFriend() {
        if (this.helpLinesUsed.phoneFriend || !this.isGameActive) return;
        
        this.helpLinesUsed.phoneFriend = true;
        this.phoneFriendButton.disabled = true;
        
        const prompt = `As an expert friend, analyze this question and provide your thoughts:
                       Question: ${this.currentQuestionData.question}
                       Options: ${this.answerButtons.map(b => b.textContent).join(', ')}
                       Provide a natural response as if you're on the phone, with about 80% accuracy.`;

        try {
            const response = await fetch('https://text.pollinations.ai/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: 'You are an expert friend helping on Who Wants to Be a Millionaire.' },
                        { role: 'user', content: prompt }
                    ]
                }),
            });

            const data = await response.json();
            this.showMessage(`Friend says: ${data.content}`);
        } catch (error) {
            this.showMessage('Sorry, couldn\'t reach your friend. Try another lifeline!');
        }
    }

    async useAskAudience() {
        if (this.helpLinesUsed.askAudience || !this.isGameActive) return;
        
        this.helpLinesUsed.askAudience = true;
        this.askAudienceButton.disabled = true;
        
        const correctIndex = this.currentQuestionData.correctIndex;
        const percentages = Array(4).fill(0);
        const difficulty = Math.min(9, Math.floor(this.currentQuestion / 2));
        
        // Audience is more accurate on easier questions
        const accuracy = 1 - (difficulty * 0.08); // 92% accurate at easiest, 20% at hardest
        const correctPercentage = Math.floor(accuracy * 100);
        percentages[correctIndex] = correctPercentage;
        
        // Distribute remaining percentage among wrong answers
        const remaining = 100 - correctPercentage;
        const wrongIndices = [0, 1, 2, 3].filter(i => i !== correctIndex);
        wrongIndices.forEach((index, i) => {
            percentages[index] = i === wrongIndices.length - 1 
                ? remaining - wrongIndices.slice(0, -1).reduce((sum, idx) => sum + percentages[idx], 0)
                : Math.floor(remaining / (wrongIndices.length - i));
        });
        
        const audienceResults = this.answerButtons.map((button, index) => 
            `${button.textContent.split(':')[0]}: ${percentages[index]}%`
        ).join('\n');
        
        this.showMessage(`Audience Results:\n${audienceResults}`);
    }

    async useAskHost() {
        if (this.helpLinesUsed.askHost || !this.isGameActive) return;
        
        this.helpLinesUsed.askHost = true;
        this.askHostButton.disabled = true;
        
        const prompt = `As the game show host, provide a helpful but indirect hint about this question:
                       Question: ${this.currentQuestionData.question}
                       Options: ${this.answerButtons.map(b => b.textContent).join(', ')}
                       Give a clever hint that helps narrow down the options without directly revealing the answer.`;

        try {
            const response = await fetch('https://text.pollinations.ai/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: 'You are the host of Who Wants to Be a Millionaire.' },
                        { role: 'user', content: prompt }
                    ]
                }),
            });

            const data = await response.json();
            this.showMessage(`Host: ${data.content}`);
        } catch (error) {
            this.showMessage('The host seems to be at a loss for words!');
        }
    }

    enableAllHelpLines() {
        Object.keys(this.helpLinesUsed).forEach(helpLine => {
            this.helpLinesUsed[helpLine] = false;
        });
        this.fiftyFiftyButton.disabled = false;
        this.phoneFriendButton.disabled = false;
        this.askAudienceButton.disabled = false;
        this.askHostButton.disabled = false;
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new MillionaireGame();
});