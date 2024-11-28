const sendButton = document.getElementById('send-button');
const userInput = document.getElementById('user-input');
const messagesDiv = document.getElementById('messages');

function addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    messageDiv.textContent = content;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function sendMessage() {
    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    addMessage(userMessage, 'user');
    userInput.value = '';

    try {
        const response = await fetch('/api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage }),
        });

        const data = await response.json();
        addMessage(data.reply || 'Không nhận được phản hồi.', 'bot');
    } catch (error) {
        addMessage('Có lỗi xảy ra, vui lòng thử lại.', 'bot');
    }
}

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});
