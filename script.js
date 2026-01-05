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
            const candidatesRef = database.ref('rooms/' + currentRoomId + '/candidates');
            candidatesRef.push(event.candidate.toJSON());
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

// Firebase Database helpers (replacing localStorage for cross-device support)
function saveToDatabase(path, data) {
    return database.ref(path).set(data);
}

function getFromDatabase(path) {
    return database.ref(path).once('value').then(snapshot => snapshot.val());
}

function listenToDatabase(path, callback) {
    return database.ref(path).on('value', snapshot => {
        callback(snapshot.val());
    });
}

function removeFromDatabase(path) {
    return database.ref(path).remove();
}

function clearRoomData(roomId) {
    return database.ref('rooms/' + roomId).remove();
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
        
        // Save offer to Firebase
        await saveToDatabase('rooms/' + currentRoomId + '/offer', peerConnection.localDescription.toJSON());
        
        // Listen for answer in real-time
        listenToDatabase('rooms/' + currentRoomId + '/answer', async (answer) => {
            if (answer && peerConnection.signalingState !== 'stable') {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
                updateStatus('Connecting...', false);
                
                // Listen for remote ICE candidates
                listenForCandidates();
            }
        });
        
    } catch (error) {
        console.error('Error creating offer:', error);
        alert('Failed to create meeting');
    }
});

// Listen for ICE candidates from remote peer
function listenForCandidates() {
    const candidatesRef = database.ref('rooms/' + currentRoomId + '/candidates');
    candidatesRef.on('child_added', async (snapshot) => {
        const candidate = snapshot.val();
        if (candidate && peerConnection) {
            try {
                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.error('Error adding ICE candidate:', error);
            }
        }
    });
}

// Join Meeting
joinMeetingBtn.addEventListener('click', async () => {
    const roomId = roomIdInput.value.trim();
    
    if (roomId.length !== 9 || !/^\d+$/.test(roomId)) {
        alert('Please enter a valid 9-digit Room ID');
        return;
    }
    
    // Check if room exists in Firebase
    const offer = await getFromDatabase('rooms/' + roomId + '/offer');
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
        
        // Save answer to Firebase
        await saveToDatabase('rooms/' + currentRoomId + '/answer', peerConnection.localDescription.toJSON());
        
        // Listen for remote ICE candidates
        listenForCandidates();
        
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
    
    // Clean up Firebase listeners and data
    if (currentRoomId) {
        database.ref('rooms/' + currentRoomId).off();
        if (isHost) {
            clearRoomData(currentRoomId);
        }
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
