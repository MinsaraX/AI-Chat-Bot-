# MinsaraX-Chatbot

A modern browser-based chatbot UI that works with OpenRouter API key (or any similar chat completion engine).

## 🚀 Features

- Light/dark theme toggle (with persistence)
- New chat button
- Drag-and-drop image upload and inline image send support
- Pause/stop streaming response support
- AI/user chat bubbles with typing animation
- API key entry modal (initial prompt)
- Password-protected API key management:
  - Reveal/hide current API key
  - Save new API key to localStorage
- Markdown-like bot message formatting:
  1. `**bold**` text support
  2. `---` and `###` heading/topic support
  3. Bullet/numbered list formatting for pointwise response

## Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- OpenRouter API Key (https://openrouter.io)
- Internet connection

## Getting Started

### 1.🚀Get Your OpenRouter API Key

1. Visit [OpenRouter.io](https://openrouter.io)
2. Sign up or log in to your account
3. Go to your Dashboard
4. Create your API
4. Copy your API Key

### 2.📁Open the Application

1. Open `index.html` directly in your web browser
   - Double-click the file, or
   - Drag it into your browser, or
   - Right-click → Open with → Browser

### 3.🛠️Setup

1. Click API key button.
2. Enter the password(0000).
3. Paste your OpenRouter API Key in the `**New API Key (optional)**` field
4. Click **💾 Save** button
5. Your API key will be saved to browser localStorage.
6. Now you can use the AI chatbot.

## 📁 Project structure

- `index.html` — main interface, dialog modals, style, and layout
- `script.js` — event logic, message rendering, API call handling
- `README.md` — this file

## 🧩 Usage

1. Type your prompt in the input box and click send.
2. Optionally upload an image via drag-and-drop.
3. Click the moon/sun icon to switch themes.
4. New chat resets conversation.

## 🔒 Password-protected API key change flow

- Click `API Key` button.
- Enter password `0000`.
- View current API key or type a new one.
- Save to persist in localStorage.

## 📝 Bot formatting

- `**text**` => **text**
- `---` + `###` lines => section headers
- `- item` or `* item` => bullet list
- `1. item` => numbered list

## ✨ Customization

- Change default password in `script.js`:
  - `const CORRECT_PASSWORD = '0000';`

- Change API endpoint or model name in `sendMessage()`.

## 📌 Notes

- All key storage is in browser localStorage (not secure for production).
- For production you'll need backend API key management and secure auth.

## 🤝 Contributing

1. Fork the repo
2. Create a branch `feature/your-feature`
3. Commit changes
4. Open a PR

## 📄 License

MIT
