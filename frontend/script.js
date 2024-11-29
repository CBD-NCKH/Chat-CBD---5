const sendButton = document.getElementById('send-button');
const userInput = document.getElementById('user-input');
const messagesDiv = document.getElementById('messages');

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

        // Lấy tất cả các đoạn (nodes) từ HTML
        const nodes = Array.from(tempContainer.childNodes);

        let currentNodeIndex = 0; // Để theo dõi đoạn nào đang được xử lý
        let currentCharIndex = 0; // Để theo dõi ký tự nào đang được gõ trong đoạn

        const typeEffect = setInterval(() => {
            if (currentNodeIndex < nodes.length) {
                const currentNode = nodes[currentNodeIndex]; // Đoạn hiện tại
                if (currentNode.nodeType === Node.TEXT_NODE) {
                    // Xử lý đoạn văn bản
                    if (currentCharIndex < currentNode.textContent.length) {
                        messageDiv.innerHTML += currentNode.textContent[currentCharIndex];
                        currentCharIndex++;
                    } else {
                        currentCharIndex = 0; // Reset chỉ số ký tự
                        currentNodeIndex++; // Chuyển sang đoạn kế tiếp
                    }
                } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
                    // Xử lý đoạn HTML (thêm toàn bộ phần tử)
                    messageDiv.innerHTML += currentNode.outerHTML;
                    currentNodeIndex++; // Chuyển sang đoạn kế tiếp
                }
            } else {
                clearInterval(typeEffect); // Dừng hiệu ứng khi hoàn tất
            }
        }, typingSpeed);
    } else {
        // Hiển thị tin nhắn người dùng ngay lập tức
        messageDiv.innerHTML = content; // Dùng innerHTML để hỗ trợ Markdown/HTML
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

    addMessage(userMessage, 'user'); // Hiển thị tin
