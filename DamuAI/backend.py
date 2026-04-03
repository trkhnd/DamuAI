from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os

app = Flask(__name__)
CORS(app)

# Set your OpenAI API key (better to use environment variable)
# On terminal: export OPENAI_API_KEY='your-key-here'
openai.api_key = os.getenv('OPENAI_API_KEY')

@app.route('/explain', methods=['POST'])
def explain():
    data = request.json
    topic = data.get('topic', '')
    
    if not topic:
        return jsonify({'error': 'No topic provided'}), 400
    
    # If no API key, fallback to mock mode
    if not openai.api_key:
        return jsonify({
            'explanation': get_mock_explanation(topic)
        })
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert at explaining complex topics to a 5-year-old. Use simple words, fun analogies, and keep it under 150 words. No jargon."},
                {"role": "user", "content": f"Explain {topic} like I'm 5 years old."}
            ],
            temperature=0.7,
            max_tokens=300
        )
        
        explanation = response.choices[0].message.content
        return jsonify({'explanation': explanation})
    
    except Exception as e:
        return jsonify({'error': str(e), 'explanation': get_mock_explanation(topic)}), 500

def get_mock_explanation(topic):
    topic_lower = topic.lower()
    
    if 'blockchain' in topic_lower:
        return "Imagine a shared piggy bank that everyone watches. No one can cheat because everyone has a copy of who put what in. That's blockchain!"
    elif 'quantum' in topic_lower:
        return "Normal computers are like flipping one coin at a time. Quantum computers flip ALL coins at once - super fast! They can solve puzzles that would take normal computers millions of years."
    elif 'chatgpt' in topic_lower or 'ai' in topic_lower:
        return "ChatGPT is like a super smart parrot that has read almost everything on the internet. When you ask it something, it guesses the most likely next word, again and again. It doesn't really 'think' — it's just REALLY good at guessing!"
    elif 'inflation' in topic_lower:
        return "Imagine you have 10 cookies. If someone prints more money, now everyone has more dollars but still only 10 cookies. So cookies cost more dollars. That's inflation — your money buys fewer cookies!"
    elif 'vaccine' in topic_lower:
        return "A vaccine is like a WANTED poster for germs. It shows your body's army a picture of the bad germ so they can practice fighting it. Then if the real germ shows up, your body already knows how to win — fast!"
    else:
        return f"Okay, imagine you're 5 years old. {topic} is like a big box of LEGOs — complicated but made of tiny simple pieces. Keep asking 'why?' and you'll understand everything, one piece at a time! 🧱"

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ELI5 Hub is running!'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)