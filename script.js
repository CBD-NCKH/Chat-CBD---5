const sendButton = document.getElementById('send-button');
const userInput = document.getElementById('user-input');
const messagesDiv = document.getElementById('messages');

// Hàm thêm tin nhắn vào giao diện
function addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    messageDiv.textContent = content;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Hàm gửi yêu cầu tới API
async function sendMessage() {
    const userMessage = userInput.value.trim();
    if (!userMessage) return; // Không gửi tin nhắn rỗng

    addMessage(userMessage, 'user'); // Hiển thị tin nhắn người dùng
    userInput.value = ''; // Xóa nội dung ô nhập

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

        // Kiểm tra và hiển thị phản hồi từ bot
        if (data.reply) {
            addMessage(data.reply, 'bot'); // Hiển thị phản hồi từ bot
        } else if (data.error) {
            addMessage(data.error, 'bot'); // Hiển thị thông báo lỗi từ backend
        } else {
            addMessage('Không nhận được phản hồi.', 'bot');
        }
    } catch (error) {
        // Hiển thị lỗi kết nối hoặc lỗi khác
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
