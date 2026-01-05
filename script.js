// WebRTC Configuration
const config = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

// State
let localStream = null;
let peerConnection = null;
let currentRoomId = null;
let isHost = false;
let micEnabled = true;
let camEnabled = true;

// DOM Elements
const homeScreen = document.getElementById('homeScreen');
const meetingScreen = document.getElementById('meetingScreen');
const newMeetingBtn = document.getElementById('newMeetingBtn');
const joinMeetingBtn = document.getElementById('joinMeetingBtn');
const roomIdInput = document.getElementById('roomIdInput');
const displayRoomId = document.getElementById('displayRoomId');
const copyRoomIdBtn = document.getElementById('copyRoomIdBtn');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const toggleMicBtn = document.getElementById('toggleMicBtn');
const toggleCamBtn = document.getElementById('toggleCamBtn');
const leaveBtn = document.getElementById('leaveBtn');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const remoteLabel = document.getElementById('remoteLabel');

// Generate 9-digit Room ID
function generateRoomId() {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
}

// Update Status
function updateStatus(status, isConnected = false) {
    statusText.textContent = status;
    if (isConnected) {
        statusDot.classList.add('connected');
    } else {
        statusDot.classList.remove('connected');
    }
}

// Initialize Media
async function initMedia() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        localVideo.srcObject = localStream;
        return true;
    } catch (error) {
        console.error('Media access error:', error);
        alert('Please allow camera and microphone access');
        return false;
    }
}

// Create Peer Connection
function createPeerConnection() {
    peerConnection = new RTCPeerConnection(config);

    // Add local tracks
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    // Handle remote tracks
    peerConnection.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0];
        remoteLabel.textContent = 'Participant';
        updateStatus('Connected', true);
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            saveToStorage('candidate_' + currentRoomId, event.candidate);
        }
    };

    // Connection state
    peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnection.connectionState);
        if (peerConnection.connectionState === 'connected') {
            updateStatus('Connected', true);
        } else if (peerConnection.connectionState === 'disconnected') {
            updateStatus('Disconnected', false);
        }
    };
}

// Storage helpers (using localStorage for signaling)
function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getFromStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

function clearRoomStorage(roomId) {
    localStorage.removeItem('offer_' + roomId);
    localStorage.removeItem('answer_' + roomId);
    localStorage.removeItem('candidate_' + roomId);
}

// New Meeting
newMeetingBtn.addEventListener('click', async () => {
    const mediaReady = await initMedia();
    if (!mediaReady) return;

    currentRoomId = generateRoomId();
    isHost = true;
    displayRoomId.textContent = currentRoomId;
    
    homeScreen.classList.remove('active');
    meetingScreen.classList.add('active');
    
    updateStatus('Waiting for participant...', false);
    
    // Create peer connection and offer
    createPeerConnection();
    
    try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        // Wait for ICE gathering
        await new Promise(resolve => {
            if (peerConnection.iceGatheringState === 'complete') {
                resolve();
            } else {
                peerConnection.addEventListener('icegatheringstatechange', () => {
                    if (peerConnection.iceGatheringState === 'complete') {
                        resolve();
                    }
                });
            }
        });
        
        // Save offer to storage
        saveToStorage('offer_' + currentRoomId, peerConnection.localDescription);
        
        // Poll for answer
        pollForAnswer();
        
    } catch (error) {
        console.error('Error creating offer:', error);
        alert('Failed to create meeting');
    }
});

// Poll for Answer (host waits for joiner)
function pollForAnswer() {
    const interval = setInterval(() => {
        const answer = getFromStorage('answer_' + currentRoomId);
        if (answer) {
            clearInterval(interval);
            peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
                .then(() => {
                    updateStatus('Connecting...', false);
                })
                .catch(err => console.error('Error setting answer:', err));
        }
    }, 1000);
    
    // Stop polling after 5 minutes
    setTimeout(() => clearInterval(interval), 300000);
}

// Join Meeting
joinMeetingBtn.addEventListener('click', async () => {
    const roomId = roomIdInput.value.trim();
    
    if (roomId.length !== 9 || !/^\d+$/.test(roomId)) {
        alert('Please enter a valid 9-digit Room ID');
        return;
    }
    
    const offer = getFromStorage('offer_' + roomId);
    if (!offer) {
        alert('Room not found. Please check the Room ID');
        return;
    }
    
    const mediaReady = await initMedia();
    if (!mediaReady) return;
    
    currentRoomId = roomId;
    isHost = false;
    displayRoomId.textContent = currentRoomId;
    
    homeScreen.classList.remove('active');
    meetingScreen.classList.add('active');
    
    updateStatus('Connecting...', false);
    
    // Create peer connection
    createPeerConnection();
    
    try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        // Wait for ICE gathering
        await new Promise(resolve => {
            if (peerConnection.iceGatheringState === 'complete') {
                resolve();
            } else {
                peerConnection.addEventListener('icegatheringstatechange', () => {
                    if (peerConnection.iceGatheringState === 'complete') {
                        resolve();
                    }
                });
            }
        });
        
        // Save answer to storage
        saveToStorage('answer_' + currentRoomId, peerConnection.localDescription);
        
    } catch (error) {
        console.error('Error joining meeting:', error);
        alert('Failed to join meeting');
    }
});

// Copy Room ID
copyRoomIdBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(currentRoomId);
    copyRoomIdBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyRoomIdBtn.textContent = 'Copy';
    }, 2000);
});

// Toggle Microphone
toggleMicBtn.addEventListener('click', () => {
    if (localStream) {
        micEnabled = !micEnabled;
        localStream.getAudioTracks().forEach(track => {
            track.enabled = micEnabled;
        });
        toggleMicBtn.classList.toggle('active', micEnabled);
        toggleMicBtn.querySelector('.icon').textContent = micEnabled ? '🎤' : '🔇';
    }
});

// Toggle Camera
toggleCamBtn.addEventListener('click', () => {
    if (localStream) {
        camEnabled = !camEnabled;
        localStream.getVideoTracks().forEach(track => {
            track.enabled = camEnabled;
        });
        toggleCamBtn.classList.toggle('active', camEnabled);
        toggleCamBtn.querySelector('.icon').textContent = camEnabled ? '📹' : '🚫';
    }
});

// Leave Meeting
leaveBtn.addEventListener('click', () => {
    cleanup();
    meetingScreen.classList.remove('active');
    homeScreen.classList.add('active');
});

// Cleanup
function cleanup() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    
    if (currentRoomId && isHost) {
        clearRoomStorage(currentRoomId);
    }
    
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
    roomIdInput.value = '';
    currentRoomId = null;
    isHost = false;
    micEnabled = true;
    camEnabled = true;
    toggleMicBtn.classList.add('active');
    toggleCamBtn.classList.add('active');
    toggleMicBtn.querySelector('.icon').textContent = '🎤';
    toggleCamBtn.querySelector('.icon').textContent = '📹';
    remoteLabel.textContent = 'Waiting for participant...';
    updateStatus('Waiting...', false);
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup);

// Only allow numbers in room ID input
roomIdInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
});
