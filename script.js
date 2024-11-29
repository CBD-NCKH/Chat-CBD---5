const sendButton = document.getElementById('send-button');
const userInput = document.getElementById('user-input');
const messagesDiv = document.getElementById('messages');

// Hàm thêm tin nhắn vào giao diện với hiệu ứng gõ từng ký tự
function addMessage(content, sender, isMarkdown = false, typingSpeed = 30) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);

    // Nếu là Markdown, xử lý thành HTML trước khi thêm vào giao diện
    if (isMarkdown) {
        content = marked.parse(content); // Chuyển đổi Markdown thành HTML
    }

    if (sender === 'bot') {
        // Hiệu ứng gõ từng ký tự cho tin nhắn bot
        let currentIndex = 0;

        // Chia nhỏ nội dung HTML thành các ký tự
        const characters = Array.from(content);

        const typeEffect = setInterval(() => {
            if (currentIndex < characters.length) {
                messageDiv.innerHTML += characters[currentIndex]; // Thêm từng ký tự
                currentIndex++;
            } else {
                clearInterval(typeEffect); // Dừng hiệu ứng khi hoàn tất
            }
        }, typingSpeed);
    } else {
        // Nếu không phải bot, hiển thị nội dung ngay lập tức
        messageDiv.innerHTML = content; // Sử dụng innerHTML để hiển thị HTML
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

        // Kiểm tra và hiển thị phản hồi từ bot với hiệu ứng gõ từng ký tự
        if (data.reply) {
            addMessage(data.reply, 'bot', true, 30); // Tốc độ gõ nhanh hơn (30ms mỗi ký tự)
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
