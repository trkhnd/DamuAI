// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    const topicInput = document.getElementById('topic');
    const explainBtn = document.getElementById('explainBtn');
    const outputSection = document.getElementById('outputSection');
    const explanationText = document.getElementById('explanationText');
    const loadingDiv = document.getElementById('loading');
    const copyBtn = document.getElementById('copyBtn');
    const exampleList = document.getElementById('exampleList');

    // Popular examples (cached locally)
    const popularExamples = [
        "How does a blockchain work?",
        "What is quantum computing?",
        "How does ChatGPT work?",
        "What is inflation?",
        "How do vaccines work?",
        "What is a stock market?"
    ];

    // Load examples into sidebar
    popularExamples.forEach(example => {
        const li = document.createElement('li');
        li.textContent = example;
        li.addEventListener('click', () => {
            topicInput.value = example;
            generateExplanation(example);
        });
        exampleList.appendChild(li);
    });

    // Explain button click
    explainBtn.addEventListener('click', () => {
        const topic = topicInput.value.trim();
        if (!topic) {
            alert('Please enter a topic!');
            return;
        }
        generateExplanation(topic);
    });

    // Enter key support
    topicInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            explainBtn.click();
        }
    });

    // Copy button
    copyBtn.addEventListener('click', () => {
        const text = explanationText.innerText;
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✅ Copied!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        });
    });

    // Function to generate explanation
    async function generateExplanation(topic) {
        // Show loading, hide output
        loadingDiv.style.display = 'block';
        outputSection.style.display = 'none';
        
        try {
            // Try to call our backend (if running)
            let explanation;
            try {
                const response = await fetch('/explain', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ topic: topic })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    explanation = data.explanation;
                } else {
                    throw new Error('Backend not available');
                }
            } catch (error) {
                // Fallback to local mock explanations if no backend
                console.warn('Backend unavailable, using local mock');
                explanation = getMockExplanation(topic);
            }
            
            // Display result
            explanationText.innerText = explanation;
            outputSection.style.display = 'block';
            
        } catch (error) {
            console.error('Error:', error);
            explanationText.innerText = 'Oops! Something went wrong. Please try again.';
            outputSection.style.display = 'block';
        } finally {
            loadingDiv.style.display = 'none';
        }
    }

    // Mock ELI5 explanations (works offline / without API key)
    function getMockExplanation(topic) {
        const lowerTopic = topic.toLowerCase();
        
        if (lowerTopic.includes('blockchain')) {
            return `Imagine you and your friends have a shared notebook. Every time someone gets a new toy, everyone writes it down in their own copy. If someone tries to cheat and say "I had 10 candies" when they only had 2, everyone else's notebooks would show the truth. Blockchain is like that — a shared notebook that everyone checks so no one can lie. 🔗`;
        }
        else if (lowerTopic.includes('quantum')) {
            return `Normal computers are like reading a book one page at a time. Quantum computers are like reading ALL the pages at the same time! They use tiny magic (superposition) to solve super hard puzzles way faster. But they're still very cold and tricky. 🌀`;
        }
        else if (lowerTopic.includes('chatgpt')) {
            return `ChatGPT is like a super smart parrot that has read almost everything on the internet. When you ask it something, it guesses the most likely next word, again and again, until it makes a whole sentence. It doesn't really "think" — it's just REALLY good at guessing. 🦜`;
        }
        else if (lowerTopic.includes('inflation')) {
            return `Imagine you have 10 cookies and your friend has $10. If the cookie monster prints more money, now everyone has $20 but still only 10 cookies exist. So cookies now cost $2 each instead of $1. That's inflation — your money buys fewer cookies because there's more money chasing the same cookies. 🍪`;
        }
        else if (lowerTopic.includes('vaccine')) {
            return `A vaccine is like a WANTED poster for germs. It shows your body's army a picture of the bad germ so they can practice fighting it. Then if the real germ shows up, your body already knows how to win — fast! 💉🛡️`;
        }
        else {
            return `Okay, imagine you're 5 years old. ${topic} is like... (think of the simplest thing ever). 

But honestly? That's a great question! Try to break it down: What part confuses you most? I can explain that part like you're eating ice cream — one scoop at a time. 🍦

For now: Everything complicated is just many simple things stacked together, like LEGO blocks. Keep asking "why?" and you'll understand!`;
        }
    }
});