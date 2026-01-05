# Zoom - P2P Video Meeting Platform

A simple, lightweight peer-to-peer video meeting application built with pure WebRTC, HTML, CSS, and vanilla JavaScript.

**Created by:** Suryanshu Nabheet

---

## 🚀 Features

- **Simple Room System**: 9-digit Room ID for easy sharing
- **True P2P Connection**: Direct peer-to-peer video/audio streaming using WebRTC
- **Cross-Device Support**: Works across different devices using Firebase Realtime Database
- **Real-time Signaling**: Instant connection establishment with Firebase
- **Clean UI**: Modern black and blue theme with 50-50 video split
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Privacy First**: Only signaling data stored in Firebase, media streams are P2P

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

### Backend & Database

- **Firebase Realtime Database**: Cross-device signaling and room management
- **Firebase Hosting**: Static file hosting and deployment

### Browser APIs

- **Clipboard API**: One-click Room ID copying

---

## 📁 Project Structure

```
Zoom/
├── index.html           # Main HTML structure
├── style.css            # Styling and theme
├── script.js            # WebRTC logic and app functionality
├── config.js            # Firebase configuration
├── README.md            # Documentation
└── FIREBASE_SETUP.md    # Firebase setup guide
```

**Total Files:** 4 core files (+ 2 docs)  
**Total Lines:** ~700 lines of clean, commented code  
**Dependencies:** Firebase SDK (CDN)

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

- **Host** creates an SDP offer and saves it to Firebase Realtime Database
- **Joiner** reads the offer from Firebase, creates an SDP answer, and saves it back
- **Host** receives the answer in real-time via Firebase listeners
- ICE candidates are exchanged automatically through Firebase
- All signaling happens instantly across devices

### 4. **P2P Connection**

- Once signaling completes, direct peer-to-peer connection is established
- Audio and video streams flow directly between browsers
- No intermediary server involved in media transmission (only signaling uses Firebase)

---

## 🚀 How to Run

### Prerequisites

1. **Firebase Project**: You need a Firebase project with Realtime Database enabled
2. **Follow the setup guide**: See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for detailed instructions

### Quick Start

1. **Setup Firebase** (5 minutes):

   - Create a Firebase project
   - Enable Realtime Database
   - Copy your config to `config.js`
   - See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for step-by-step guide

2. **Deploy Your App**:

```bash
# Using Firebase Hosting (Recommended)
npm install -g firebase-tools
firebase login
firebase init
firebase deploy

# Or use any static hosting (Netlify, Vercel, GitHub Pages, etc.)
```

3. **Test Across Devices**:
   - Open the deployed URL on Device 1
   - Create a meeting and copy the Room ID
   - Open the same URL on Device 2
   - Join using the Room ID
   - Enjoy your video call! 🎉

**Note**: The app must be deployed to work across devices. Local testing only works on the same device.

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

### WebRTC Flow with Firebase

```
Host                    Firebase                    Joiner
  |                        |                          |
  |-- Save Offer --------->|                          |
  |                        |<-------- Read Offer -----|
  |                        |                          |
  |                        |<----- Save Answer -------|
  |<--- Read Answer -------|                          |
  |                        |                          |
  |<======== P2P Connection (Direct) ===============>|
  |                        |                          |
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

**3. Signaling via Firebase**

```javascript
// Save offer
database.ref("rooms/" + roomId + "/offer").set(offer);

// Listen for answer
database.ref("rooms/" + roomId + "/answer").on("value", callback);
```

**4. ICE Candidate Exchange**

```javascript
peerConnection.onicecandidate = (event) => {
  database.ref("rooms/" + roomId + "/candidates").push(candidate);
};
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

1. **Two Participants Only**: Designed for 1-on-1 meetings
2. **NAT Traversal**: May not work behind strict firewalls (STUN servers help, but TURN server would be needed for 100% reliability)
3. **Firebase Free Tier**: Limited to Firebase free tier quotas (sufficient for testing and small deployments)

---

## 🔮 Future Enhancements

- [ ] Support for multiple participants (3+ people)
- [ ] Screen sharing capability
- [ ] Chat messaging
- [ ] Recording functionality
- [ ] Virtual backgrounds
- [ ] Network quality indicators
- [ ] User authentication
- [ ] Room passwords/security

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
