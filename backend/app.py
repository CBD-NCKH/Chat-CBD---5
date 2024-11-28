from flask import Flask, request, jsonify
import openai
import os
from dotenv import load_dotenv

load_dotenv()  # Load API Key từ file .env
openai.api_key = os.getenv("OPENAI_API_KEY")

app = Flask(__name__)

@app.route('/api', methods=['POST'])
def api():
    try:
        data = request.json
        user_message = data.get("message")

        # Gửi yêu cầu tới OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Bạn là một trợ lý AI thông minh và thân thiện."},
                {"role": "user", "content": user_message}
            ],
            max_tokens=4000,
            temperature=0.7
        )

        bot_reply = response.choices[0].message["content"]
        return jsonify({"reply": bot_reply})

    except Exception as e:
        print(f"Lỗi: {e}")
        return jsonify({"error": "Có lỗi xảy ra khi kết nối OpenAI"}), 500

if __name__ == '__main__':
    app.run(debug=True)
