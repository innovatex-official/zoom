# Zoom - P2P Video Meeting Platform

A simple, lightweight peer-to-peer video meeting application built with pure WebRTC, HTML, CSS, and vanilla JavaScript.

**Created by:** Suryanshu Nabheet

---

## 🚀 Features

- **Simple Room System**: 9-digit Room ID for easy sharing
- **True P2P Connection**: Direct peer-to-peer video/audio streaming using WebRTC
- **No Backend Required**: Works entirely in the browser using localStorage for signaling
- **Clean UI**: Modern black and blue theme with 50-50 video split
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Privacy First**: No data sent to external servers

---

## 🛠️ Technologies Used

### Core Technologies

- **HTML5**: Semantic structure and video elements
- **CSS3**: Modern styling with gradients, flexbox, and grid
- **Vanilla JavaScript**: Pure JS, no frameworks or libraries

### WebRTC APIs

- **RTCPeerConnection**: Peer-to-peer connection management
- **getUserMedia**: Camera and microphone access
- **MediaStream**: Audio/video stream handling

### Browser APIs

- **localStorage**: Signaling mechanism (offer/answer exchange)
- **Clipboard API**: One-click Room ID copying

---

## 📁 Project Structure

```
Zoom/
├── index.html      # Main HTML structure
├── style.css       # Styling and theme
├── script.js       # WebRTC logic and app functionality
└── README.md       # Documentation
```

**Total Files:** 3 core files (+ README)  
**Total Lines:** ~600 lines of clean, commented code  
**Dependencies:** Zero! Pure vanilla implementation

---

## 🎯 How It Works

### 1. **Create a Meeting**

- Click "New Meeting"
- A 9-digit Room ID is generated automatically
- Your camera/microphone activates
- Share the Room ID with the other participant

### 2. **Join a Meeting**

- Enter the 9-digit Room ID
- Click "Join"
- Your camera/microphone activates
- Connection establishes automatically

### 3. **Signaling Process**

- **Host** creates an SDP offer and saves it to localStorage
- **Joiner** reads the offer, creates an SDP answer, and saves it
- **Host** reads the answer and completes the connection
- ICE candidates are exchanged for NAT traversal

### 4. **P2P Connection**

- Once signaling completes, direct peer-to-peer connection is established
- Audio and video streams flow directly between browsers
- No intermediary server involved in media transmission

---

## 🚀 How to Run

### Option 1: Direct File Opening

1. Download all files to a folder
2. Open `index.html` in a modern browser (Chrome, Firefox, Edge, Safari)
3. Allow camera/microphone permissions when prompted
4. Start creating or joining meetings!

### Option 2: Local Server (Recommended)

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

---

## 💡 Usage Guide

### Creating a Meeting

1. Click **"New Meeting"**
2. Copy the generated 9-digit Room ID
3. Share it with your participant (via text, email, etc.)
4. Wait for them to join

### Joining a Meeting

1. Get the Room ID from the meeting host
2. Enter it in the input field
3. Click **"Join"**
4. Connection will establish automatically

### During the Meeting

- **🎤 Microphone**: Click to mute/unmute
- **📹 Camera**: Click to turn video on/off
- **📞 Leave**: End the call and return to home

---

## 🔧 Technical Implementation

### WebRTC Flow

```
Host                          Joiner
  |                             |
  |-- Create Offer ------------>|
  |   (save to localStorage)    |
  |                             |
  |<--------- Create Answer ----|
  |   (save to localStorage)    |
  |                             |
  |-- Read Answer ------------->|
  |                             |
  |<==== P2P Connection =======>|
  |   (direct media stream)     |
```

### Key Components

**1. Media Initialization**

```javascript
navigator.mediaDevices.getUserMedia({ video: true, audio: true });
```

**2. Peer Connection Setup**

```javascript
new RTCPeerConnection(config);
peerConnection.addTrack(track, localStream);
```

**3. Signaling via localStorage**

```javascript
localStorage.setItem("offer_" + roomId, offer);
localStorage.getItem("answer_" + roomId);
```

**4. ICE Candidate Exchange**

```javascript
peerConnection.onicecandidate = (event) => { ... }
```

---

## 🌐 Browser Compatibility

| Browser | Version | Support |
| ------- | ------- | ------- |
| Chrome  | 80+     | ✅ Full |
| Firefox | 75+     | ✅ Full |
| Safari  | 14+     | ✅ Full |
| Edge    | 80+     | ✅ Full |

**Note:** Requires HTTPS or localhost for camera/microphone access.

---

## ⚠️ Limitations

1. **Same Device Limitation**: Both users must open the app on the same computer (due to localStorage signaling)
2. **No Persistence**: Room data is cleared when the host leaves
3. **Two Participants Only**: Designed for 1-on-1 meetings
4. **NAT Traversal**: May not work behind strict firewalls (STUN servers help, but TURN server would be needed for 100% reliability)

---

## 🔮 Future Enhancements

- [ ] Add Firebase/WebSocket for cross-device signaling
- [ ] Support for multiple participants
- [ ] Screen sharing capability
- [ ] Chat messaging
- [ ] Recording functionality
- [ ] Virtual backgrounds
- [ ] Network quality indicators

---

## 📝 Code Highlights

### Clean Architecture

- Separation of concerns (HTML/CSS/JS)
- Event-driven design
- Async/await for clean asynchronous code
- Proper error handling

### Performance

- Minimal DOM manipulation
- Efficient event listeners
- No external dependencies = fast load time
- Optimized video rendering

### User Experience

- Instant feedback on all actions
- Clear status indicators
- Responsive controls
- Smooth animations

---

## 🤝 Contributing

This is a learning project demonstrating WebRTC fundamentals. Feel free to:

- Fork and experiment
- Suggest improvements
- Report issues
- Build upon it for your own projects

---

## 📄 License

This project is open source and available for educational purposes.

---

## 👨‍💻 Author

**Suryanshu Nabheet**

Built with ❤️ using pure WebRTC and vanilla JavaScript.

---

## 🙏 Acknowledgments

- WebRTC community for excellent documentation
- STUN servers provided by Google
- Modern browser vendors for implementing WebRTC standards

---

**Last Updated:** January 2026
