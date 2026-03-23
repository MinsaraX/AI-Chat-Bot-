document.addEventListener('DOMContentLoaded', function() {
    const apiKeyModal = document.getElementById('api-key-modal');
    const apiKeyInput = document.getElementById('api-key-input');
    const saveApiKeyButton = document.getElementById('save-api-key');
    const chatContainer = document.getElementById('chat-container');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const stopButton = document.getElementById('stop-button');
    const modelSelect = document.getElementById('model-select');
    const themeToggle = document.getElementById('theme-toggle');
    const newChatBtn = document.getElementById('new-chat-btn');
    const imageInput = document.getElementById('image-input');
    const imagePreview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    const removeImage = document.getElementById('remove-image');
    const dragZone = document.getElementById('drag-zone');
    const imagePreviewModal = document.getElementById('image-preview-modal');
    const modalPreviewImg = document.getElementById('modal-preview-img');
    const closeModal = document.getElementById('close-modal');
    const body = document.body;
    const html = document.documentElement;

    let apiKey = localStorage.getItem('openrouter-api-key');
    let currentChatId = null;
    let chats = [];
    let isDarkMode = localStorage.getItem('theme') === 'dark';
    let currentImage = null;
    let isSending = false;
    let thinkingMessageId = null;
    let abortController = null;

    // Theme setup
    if (isDarkMode) {
        html.classList.add('modern-bg-dark');
        html.classList.remove('modern-bg');
        html.classList.remove('light');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        html.classList.add('modern-bg');
        html.classList.remove('modern-bg-dark');
        html.classList.add('light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }

    // API Key modal
    if (!apiKey) {
        apiKeyModal.style.display = 'flex';
    } else {
        apiKeyModal.style.display = 'none';
        createNewChat();
    }

    saveApiKeyButton.addEventListener('click', function() {
        const key = apiKeyInput.value.trim();
        if (key) {
            localStorage.setItem('openrouter-api-key', key);
            apiKey = key;
            apiKeyModal.style.display = 'none';
            createNewChat();
        }
    });

    // Theme toggle
    themeToggle.addEventListener('click', function() {
        isDarkMode = !isDarkMode;
        if (isDarkMode) {
            html.classList.add('modern-bg-dark');
            html.classList.remove('modern-bg');
            html.classList.remove('light');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            html.classList.remove('modern-bg-dark');
            html.classList.add('modern-bg');
            html.classList.add('light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    });

    // Image upload
    imageInput.addEventListener('change', handleImageSelect);
    removeImage.addEventListener('click', removeSelectedImage);

    // Drag and drop functionality
    dragZone.addEventListener('click', () => imageInput.click());
    dragZone.addEventListener('dragover', handleDragOver);
    dragZone.addEventListener('dragleave', handleDragLeave);
    dragZone.addEventListener('drop', handleDrop);

    // Modal functionality
    closeModal.addEventListener('click', () => imagePreviewModal.classList.add('hidden'));
    imagePreviewModal.addEventListener('click', (e) => {
        if (e.target === imagePreviewModal) {
            imagePreviewModal.classList.add('hidden');
        }
    });

    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        dragZone.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        dragZone.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        dragZone.classList.remove('drag-over');

        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            handleImageFile(files[0]);
        }
    }

    function handleImageSelect(event) {
        const file = event.target.files[0];
        if (file) {
            handleImageFile(file);
        }
    }

    function handleImageFile(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentImage = e.target.result;
            previewImg.src = currentImage;
            imagePreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }

    function removeSelectedImage() {
        currentImage = null;
        imageInput.value = '';
        imagePreview.classList.add('hidden');
    }

    // Global function for opening image preview
    window.openImagePreview = function() {
        modalPreviewImg.src = currentImage;
        imagePreviewModal.classList.remove('hidden');
    };

    // New chat
    newChatBtn.addEventListener('click', createNewChat);

    function createNewChat() {
        const chatId = Date.now().toString();
        const newChat = {
            id: chatId,
            title: 'New Chat',
            messages: []
        };
        chats = [newChat];
        currentChatId = chatId;
        saveChats();
        chatContainer.innerHTML = '';
    }


    function loadChat(chatId) {
        currentChatId = chatId;
        chatContainer.innerHTML = '';
    }

    function saveChats() {
        // Chat history saving disabled - fresh start on each reload
    }

    function addMessage(content, isUser = false, animate = true, image = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'} ${animate ? 'message-animation' : ''}`;
        const messageBubble = document.createElement('div');
        messageBubble.className = `max-w-xs lg:max-w-2xl px-4 py-3 rounded-2xl ${isUser ? 'message-bubble-user' : 'message-bubble-ai'}`;
        
        const icon = document.createElement('i');
        icon.className = `fas ${isUser ? 'fa-user' : 'fa-robot'} mr-2 opacity-75`;
        messageBubble.appendChild(icon);
        
        if (image && isUser) {
            const img = document.createElement('img');
            img.src = image;
            img.className = 'max-w-32 max-h-32 rounded-lg mb-2 border';
            messageBubble.appendChild(img);
        }
        
        const textSpan = document.createElement('span');
        messageBubble.appendChild(textSpan);
        
        // Add action buttons for AI messages
        if (!isUser) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'flex items-center space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200';
            messageBubble.classList.add('group'); // Add group class for hover effect
            
            // Copy button
            const copyBtn = document.createElement('button');
            copyBtn.className = 'glass p-1 rounded hover-scale transition text-xs text-[#94A3B8] hover:text-[#F8FAFC]';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            copyBtn.title = 'Copy message';
            copyBtn.onclick = () => copyToClipboard(content);
            actionsDiv.appendChild(copyBtn);
            
            // Like button
            const likeBtn = document.createElement('button');
            likeBtn.className = 'glass p-1 rounded hover-scale transition text-xs text-[#94A3B8] hover:text-green-400';
            likeBtn.innerHTML = '<i class="fas fa-thumbs-up"></i>';
            likeBtn.title = 'Like this response';
            likeBtn.onclick = () => showFeedback(likeBtn, 'liked');
            actionsDiv.appendChild(likeBtn);
            
            // Dislike button
            const dislikeBtn = document.createElement('button');
            dislikeBtn.className = 'glass p-1 rounded hover-scale transition text-xs text-[#94A3B8] hover:text-red-400';
            dislikeBtn.innerHTML = '<i class="fas fa-thumbs-down"></i>';
            dislikeBtn.title = 'Dislike this response';
            dislikeBtn.onclick = () => showFeedback(dislikeBtn, 'disliked');
            actionsDiv.appendChild(dislikeBtn);
            
            // Try again button
            const tryAgainBtn = document.createElement('button');
            tryAgainBtn.className = 'glass p-1 rounded hover-scale transition text-xs text-[#94A3B8] hover:text-[#F8FAFC]';
            tryAgainBtn.innerHTML = '<i class="fas fa-redo"></i>';
            tryAgainBtn.title = 'Try again';
            tryAgainBtn.onclick = () => tryAgain(messageDiv);
            actionsDiv.appendChild(tryAgainBtn);
            
            messageBubble.appendChild(actionsDiv);
        }
        
        messageDiv.appendChild(messageBubble);
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        if (!isUser) {
            if (animate) {
                typeText(textSpan, content, function() {
                    textSpan.innerHTML = formatBotMessage(content);
                });
            } else {
                textSpan.innerHTML = formatBotMessage(content);
            }
        } else {
            textSpan.textContent = content;
        }

        // Save to current chat (without localStorage - fresh start on reload)
        if (currentChatId) {
            const chat = chats.find(c => c.id === currentChatId);
            if (chat) {
                chat.messages.push({ content, isUser, image: null });
                if (chat.messages.length === 1 && !isUser) {
                    chat.title = content.slice(0, 30) + (content.length > 30 ? '...' : '');
                }
            }
        }
    }

    function typeText(element, text, onComplete) {
        let index = 0;
        element.classList.add('typing-cursor');
        element.textContent = '';

        const interval = setInterval(() => {
            if (index < text.length) {
                element.textContent = text.slice(0, index + 1);
                index++;
            } else {
                clearInterval(interval);
                element.classList.remove('typing-cursor');
                if (typeof onComplete === 'function') {
                    onComplete();
                }
            }
        }, 16);
    }

    function formatBotMessage(content) {
        if (!content) return '';

        // escape HTML first
        const escaped = content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        const lines = escaped.split('\n');
        let output = '';
        let listOpen = false;
        let listType = null;

        const closeList = () => {
            if (listOpen) {
                output += listType === 'ol' ? '</ol>' : '</ul>';
                listOpen = false;
                listType = null;
            }
        };

        lines.forEach(rawLine => {
            const line = rawLine.trim();
            if (line === '') {
                closeList();
                output += '<br>';
                return;
            }

            // heading with optional separator ----
            let normalized = line;
            if (normalized.startsWith('---')) {
                closeList();
                output += '<hr class="border-gray-500 my-2">';
                normalized = normalized.replace(/^---\s*/, '');
            }

            if (/^#{1,6}\s+/.test(normalized)) {
                closeList();
                const level = normalized.match(/^#{1,6}/)[0].length;
                let text = normalized.replace(/^#{1,6}\s+/, '');
                text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                output += `<h${level} class="text-[#38BDF8] font-bold text-lg mt-2 mb-1">${text}</h${level}>`;
                return;
            }

            // bullet list line
            if (/^[-*]\s+/.test(normalized)) {
                if (!listOpen) {
                    listOpen = true;
                    listType = 'ul';
                    output += '<ul class="list-disc list-inside ml-4 mb-2">';
                }
                let item = normalized.replace(/^[-*]\s+/, '');
                item = item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                output += `<li class="mb-1">${item}</li>`;
                return;
            }

            // numbered list line
            if (/^\d+\.\s+/.test(normalized)) {
                if (!listOpen) {
                    listOpen = true;
                    listType = 'ol';
                    output += '<ol class="list-decimal list-inside ml-4 mb-2">';
                }
                let item = normalized.replace(/^\d+\.\s+/, '');
                item = item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                output += `<li class="mb-1">${item}</li>`;
                return;
            }

            closeList();
            let inline = normalized.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            output += `<p class="leading-relaxed">${inline}</p>`;
        });

        closeList();
        return output;
    }

    function addThinkingMessage() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex justify-start message-animation';
        const messageBubble = document.createElement('div');
        messageBubble.className = 'max-w-xs lg:max-w-2xl px-4 py-3 rounded-2xl message-bubble-ai';
        
        const icon = document.createElement('i');
        icon.className = 'fas fa-robot mr-2 opacity-75';
        messageBubble.appendChild(icon);
        
        const thinkingContainer = document.createElement('div');
        thinkingContainer.className = 'thinking-dots';
        thinkingContainer.innerHTML = '<span class="thinking-dot"></span><span class="thinking-dot"></span><span class="thinking-dot"></span>';
        messageBubble.appendChild(thinkingContainer);
        
        messageDiv.appendChild(messageBubble);
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        thinkingMessageId = messageDiv.id = 'thinking-' + Date.now();
        return thinkingMessageId;
    }

    function removeThinkingMessage() {
        if (thinkingMessageId) {
            const element = document.getElementById(thinkingMessageId);
            if (element) {
                element.remove();
            }
            thinkingMessageId = null;
        }
    }

    async function sendMessage() {
        const message = messageInput.value.trim();
        if ((!message && !currentImage) || !apiKey || !currentChatId || isSending) return;

        isSending = true;
        abortController = new AbortController();
        
        // Show stop button, hide send button
        sendButton.classList.add('hidden');
        stopButton.classList.remove('hidden');
        
        addMessage(message, true, true, currentImage);
        const imageToSend = currentImage;
        messageInput.value = '';
        removeSelectedImage();

        const model = modelSelect.value;
        const chat = chats.find(c => c.id === currentChatId);
        
        // Build messages array with conversation history
        const messages = chat.messages.map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.content
        }));
        
        // Add current user message with image if present
        let userMessageContent;
        if (imageToSend) {
            userMessageContent = [
                { type: "image_url", image_url: { url: imageToSend } },
                { type: "text", text: message }
            ];
        } else {
            userMessageContent = message;
        }
        
        messages.push({
            role: 'user',
            content: userMessageContent
        });

        try {
            // Show thinking/analyzing state
            addThinkingMessage();
            
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: messages
                }),
                signal: abortController.signal
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'API request failed');
            }

            const data = await response.json();
            const aiMessage = data.choices[0].message.content;
            removeThinkingMessage();
            addMessage(aiMessage, false);
        } catch (error) {
            if (error.name === 'AbortError') {
                // Request was aborted, show stopped message
                removeThinkingMessage();
                addMessage('Response stopped.', false);
            } else {
                removeThinkingMessage();
                console.error('Error:', error);
                addMessage('Sorry, there was an error: ' + error.message, false);
            }
        } finally {
            isSending = false;
            abortController = null;
            
            // Show send button, hide stop button
            sendButton.classList.remove('hidden');
            stopButton.classList.add('hidden');
        }
    }

    // Copy message to clipboard
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            // Show temporary success feedback
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 glass px-4 py-2 rounded-lg text-[#F8FAFC] z-50';
            notification.textContent = 'Copied to clipboard!';
            document.body.appendChild(notification);
            setTimeout(() => document.body.removeChild(notification), 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    }

    // Show feedback for like/dislike
    function showFeedback(button, type) {
        const icon = button.querySelector('i');
        const originalClass = icon.className;
        
        // Visual feedback
        if (type === 'liked') {
            icon.className = 'fas fa-thumbs-up text-green-400';
            button.classList.add('text-green-400');
        } else {
            icon.className = 'fas fa-thumbs-down text-red-400';
            button.classList.add('text-red-400');
        }
        
        // Disable buttons after feedback
        const actionsDiv = button.parentElement;
        const buttons = actionsDiv.querySelectorAll('button');
        buttons.forEach(btn => btn.disabled = true);
        
        // Show notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 glass px-4 py-2 rounded-lg text-[#F8FAFC] z-50';
        notification.textContent = `Response ${type}!`;
        document.body.appendChild(notification);
        setTimeout(() => document.body.removeChild(notification), 2000);
    }

    // Try again functionality
    function tryAgain(messageDiv) {
        if (isSending) return;
        
        // Find the previous user message to regenerate response
        const chat = chats.find(c => c.id === currentChatId);
        if (!chat || chat.messages.length < 2) return;
        
        // Remove the current AI message
        chatContainer.removeChild(messageDiv);
        
        // Remove from chat history
        const lastMessage = chat.messages.pop();
        if (lastMessage && !lastMessage.isUser) {
            // Regenerate response using the last user message
            const lastUserMessage = chat.messages[chat.messages.length - 1];
            if (lastUserMessage && lastUserMessage.isUser) {
                regenerateResponse(lastUserMessage.content);
            }
        }
    }

    // Regenerate response for try again
    async function regenerateResponse(userMessage) {
        if (!apiKey || !currentChatId || isSending) return;

        isSending = true;
        abortController = new AbortController();
        
        // Show stop button, hide send button
        sendButton.classList.add('hidden');
        stopButton.classList.remove('hidden');
        
        const model = modelSelect.value;
        const chat = chats.find(c => c.id === currentChatId);
        
        // Build messages array up to the user message
        const messages = [];
        for (let i = 0; i < chat.messages.length; i++) {
            const msg = chat.messages[i];
            if (msg.isUser) {
                messages.push({
                    role: 'user',
                    content: msg.content
                });
            } else {
                messages.push({
                    role: 'assistant',
                    content: msg.content
                });
            }
        }

        try {
            addThinkingMessage();
            
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: messages
                }),
                signal: abortController.signal
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'API request failed');
            }

            const data = await response.json();
            const aiMessage = data.choices[0].message.content;
            removeThinkingMessage();
            addMessage(aiMessage, false);
        } catch (error) {
            if (error.name === 'AbortError') {
                // Request was aborted, show stopped message
                removeThinkingMessage();
                addMessage('Response stopped.', false);
            } else {
                removeThinkingMessage();
                console.error('Error:', error);
                addMessage('Sorry, there was an error: ' + error.message, false);
            }
        } finally {
            isSending = false;
            abortController = null;
            
            // Show send button, hide stop button
            sendButton.classList.remove('hidden');
            stopButton.classList.add('hidden');
        }
    }

    // Stop responding function
    function stopResponding() {
        if (abortController && isSending) {
            abortController.abort();
        }
    }

    // API Key Change Functionality
    const changeApiKeyBtn = document.getElementById('change-api-key-btn');
    const passwordModal = document.getElementById('password-modal');
    const passwordInput = document.getElementById('password-input');
    const verifyPasswordBtn = document.getElementById('verify-password-btn');
    const cancelPasswordBtn = document.getElementById('cancel-password-btn');
    const changeApiKeyModal = document.getElementById('change-api-key-modal');
    const currentApiKeyDisplay = document.getElementById('current-api-key');
    const toggleApiKeyBtn = document.getElementById('toggle-api-key-btn');
    const newApiKeyInput = document.getElementById('new-api-key-input');
    const saveNewApiKeyBtn = document.getElementById('save-new-api-key-btn');
    const closeChangeApiKeyBtn = document.getElementById('close-change-api-key-btn');

    const CORRECT_PASSWORD = '0000';
    let apiKeyVisible = false;

    // Open password modal when change api key button is clicked
    changeApiKeyBtn.addEventListener('click', function() {
        passwordModal.classList.remove('hidden');
        passwordInput.value = '';
        passwordInput.focus();
    });

    // Cancel password verification
    cancelPasswordBtn.addEventListener('click', function() {
        passwordModal.classList.add('hidden');
        passwordInput.value = '';
    });

    // Verify password
    verifyPasswordBtn.addEventListener('click', function() {
        const enteredPassword = passwordInput.value;
        if (enteredPassword === CORRECT_PASSWORD) {
            passwordModal.classList.add('hidden');
            openChangeApiKeyModal();
        } else {
            // Show error message
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 glass px-4 py-2 rounded-lg text-red-400 z-50 font-semibold';
            notification.innerHTML = '<i class="fas fa-times-circle mr-2"></i>Incorrect password!';
            document.body.appendChild(notification);
            setTimeout(() => document.body.removeChild(notification), 2000);
            passwordInput.value = '';
            passwordInput.focus();
        }
    });

    // Allow Enter key to verify password
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            verifyPasswordBtn.click();
        }
    });

    // Open change API key modal after password verification
    function openChangeApiKeyModal() {
        apiKeyVisible = false;
        updateApiKeyDisplay();
        toggleApiKeyBtn.innerHTML = '<i class="fas fa-eye"></i>';
        newApiKeyInput.value = '';
        changeApiKeyModal.classList.remove('hidden');
        newApiKeyInput.focus();
    }

    // Toggle visibility of current API key
    toggleApiKeyBtn.addEventListener('click', function() {
        apiKeyVisible = !apiKeyVisible;
        updateApiKeyDisplay();
        toggleApiKeyBtn.innerHTML = `<i class="fas fa-eye${apiKeyVisible ? '-slash' : ''}"></i>`;
    });

    // Update API key display based on visibility
    function updateApiKeyDisplay() {
        if (apiKeyVisible) {
            currentApiKeyDisplay.textContent = apiKey;
        } else {
            currentApiKeyDisplay.textContent = '••••••••••••••••';
        }
    }

    // Save new API key
    saveNewApiKeyBtn.addEventListener('click', function() {
        const newKey = newApiKeyInput.value.trim();
        
        if (newKey && newKey !== apiKey) {
            // Save the new API key
            localStorage.setItem('openrouter-api-key', newKey);
            apiKey = newKey;
            
            // Show success notification
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 glass px-4 py-2 rounded-lg text-green-400 z-50 font-semibold';
            notification.innerHTML = '<i class="fas fa-check-circle mr-2"></i>API Key updated successfully!';
            document.body.appendChild(notification);
            setTimeout(() => document.body.removeChild(notification), 2000);
            
            changeApiKeyModal.classList.add('hidden');
        } else if (!newKey) {
            // Show info notification
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 glass px-4 py-2 rounded-lg text-[#94A3B8] z-50 font-semibold';
            notification.innerHTML = '<i class="fas fa-info-circle mr-2"></i>No changes made.';
            document.body.appendChild(notification);
            setTimeout(() => document.body.removeChild(notification), 2000);
            
            changeApiKeyModal.classList.add('hidden');
        } else {
            // Show info notification
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 glass px-4 py-2 rounded-lg text-[#94A3B8] z-50 font-semibold';
            notification.innerHTML = '<i class="fas fa-info-circle mr-2"></i>API Key is the same.';
            document.body.appendChild(notification);
            setTimeout(() => document.body.removeChild(notification), 2000);
            
            changeApiKeyModal.classList.add('hidden');
        }
    });

    // Close change API key modal
    closeChangeApiKeyBtn.addEventListener('click', function() {
        changeApiKeyModal.classList.add('hidden');
    });

    // Allow Enter key in change API key modal
    newApiKeyInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            saveNewApiKeyBtn.click();
        }
    });

    sendButton.addEventListener('click', sendMessage);
    stopButton.addEventListener('click', stopResponding);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (isSending) {
                stopResponding();
            } else {
                sendMessage();
            }
        }
    });
});