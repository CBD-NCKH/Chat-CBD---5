const sendButton = document.getElementById('send-button');
const userInput = document.getElementById('user-input');
const messagesDiv = document.getElementById('messages');

// Xóa các tin nhắn mặc định ban đầu
document.addEventListener("DOMContentLoaded", () => {
    messagesDiv.innerHTML = ""; // Xóa toàn bộ nội dung khung chat khi tải trang
});

// Hàm thêm tin nhắn vào giao diện với hiệu ứng gõ từng ký tự
function addMessage(content, sender, isMarkdown = false, typingSpeed = 30) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);

    // Nếu là Markdown, chuyển đổi thành HTML
    if (isMarkdown) {
        content = marked.parse(content); // Chuyển đổi Markdown thành HTML
    }

    if (sender === 'bot') {
        // Tạo container tạm thời để xử lý nội dung HTML
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = content;

        const nodes = Array.from(tempContainer.childNodes);
        let currentNodeIndex = 0;
        let currentCharIndex = 0;

        const typeEffect = setInterval(() => {
            if (currentNodeIndex < nodes.length) {
                const currentNode = nodes[currentNodeIndex];
                if (currentNode.nodeType === Node.TEXT_NODE) {
                    if (currentCharIndex < currentNode.textContent.length) {
                        messageDiv.appendChild(document.createTextNode(currentNode.textContent[currentCharIndex]));
                        currentCharIndex++;
                    } else {
                        currentCharIndex = 0;
                        currentNodeIndex++;
                    }
                } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
                    messageDiv.appendChild(currentNode.cloneNode(true));
                    currentNodeIndex++;
                }
            } else {
                clearInterval(typeEffect);
            }
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }, typingSpeed);
    } else {
        messageDiv.innerHTML = content;
    }

    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Hiển thị hiệu ứng "đang gõ" từ bot
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'bot', 'typing');
    typingDiv.innerHTML = `
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    messagesDiv.appendChild(typingDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Xóa hiệu ứng "đang gõ"
function removeTypingIndicator() {
    const typingDiv = document.querySelector('.typing');
    if (typingDiv) {
        typingDiv.remove();
    }
}

// Gửi tin nhắn và lấy phản hồi từ backend
async function sendMessage() {
    const userMessage = userInput.value.trim();
    if (!userMessage) return; // Không gửi tin nhắn rỗng

    addMessage(userMessage, 'user'); // Thêm tin nhắn người dùng
    userInput.value = ''; // Xóa nội dung ô nhập
    showTypingIndicator(); // Hiển thị hiệu ứng typing

    try {
        // Gửi tin nhắn tới backend API
        const response = await fetch('http://127.0.0.1:5000/api', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage }),
        });

        if (!response.ok) throw new Error(`Lỗi ${response.status}: ${response.statusText}`);

        const data = await response.json();
        removeTypingIndicator(); // Xóa hiệu ứng typing

        if (data.reply) {
            addMessage(data.reply, 'bot', true, 30); // Gõ tin nhắn phản hồi với typingSpeed = 30ms
        } else if (data.error) {
            addMessage(data.error, 'bot');
        } else {
            addMessage('Không nhận được phản hồi.', 'bot');
        }
    } catch (error) {
        console.error('Lỗi:', error);
        removeTypingIndicator();
        addMessage('Có lỗi xảy ra, vui lòng thử lại sau.', 'bot');
    }
}

// Xử lý sự kiện gửi tin nhắn
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') sendMessage();
});

