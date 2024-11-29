const sendButton = document.getElementById('send-button');
const userInput = document.getElementById('user-input');
const messagesDiv = document.getElementById('messages');

// Hàm thêm tin nhắn vào giao diện
function addMessage(content, sender, isMarkdown = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);

    // Kiểm tra xem nội dung có phải Markdown không
    if (isMarkdown) {
        messageDiv.innerHTML = marked.parse(content); // Sử dụng marked.parse() để chuyển đổi Markdown
    } else {
        messageDiv.textContent = content; // Hiển thị văn bản thông thường
    }

    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Cuộn xuống tin nhắn mới nhất
}

// Hàm hiển thị hiệu ứng "đang gõ"
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'bot', 'typing'); // Thêm lớp "typing"
    typingDiv.innerHTML = `
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    messagesDiv.appendChild(typingDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Cuộn xuống
}

// Hàm xóa hiệu ứng "đang gõ"
function removeTypingIndicator() {
    const typingDiv = document.querySelector('.typing');
    if (typingDiv) {
        typingDiv.remove(); // Xóa phần tử "typing"
    }
}

// Hàm gửi yêu cầu tới API
async function sendMessage() {
    const userMessage = userInput.value.trim();
    if (!userMessage) return; // Không gửi tin nhắn rỗng

    addMessage(userMessage, 'user'); // Hiển thị tin nhắn người dùng
    userInput.value = ''; // Xóa nội dung ô nhập

    showTypingIndicator(); // Hiển thị hiệu ứng "đang gõ"

    try {
        // Gửi yêu cầu tới backend API
        const response = await fetch('http://127.0.0.1:5000/api', { // Sử dụng URL cục bộ
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage }), // Truyền tin nhắn người dùng
        });

        if (!response.ok) {
            // Xử lý lỗi HTTP (ví dụ: 404, 500)
            throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        removeTypingIndicator(); // Xóa hiệu ứng "đang gõ"

        // Kiểm tra và hiển thị phản hồi từ bot
        if (data.reply) {
            addMessage(data.reply, 'bot', true); // Hiển thị phản hồi từ bot, xử lý Markdown
        } else if (data.error) {
            addMessage(data.error, 'bot'); // Hiển thị thông báo lỗi từ backend
        } else {
            addMessage('Không nhận được phản hồi.', 'bot');
        }
    } catch (error) {
        removeTypingIndicator(); // Xóa hiệu ứng "đang gõ"
        console.error('Lỗi:', error);
        addMessage('Có lỗi xảy ra, vui lòng thử lại sau.', 'bot');
    }
}

// Xử lý sự kiện khi nhấn nút "Gửi"
sendButton.addEventListener('click', sendMessage);

// Xử lý sự kiện khi nhấn phím Enter
userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});
