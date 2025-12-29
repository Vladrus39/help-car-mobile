/**
 * WebRTC Video Chat Service for RoadHelp
 * Enables real-time video/audio communication between users
 * 
 * Uses STUN/TURN servers for NAT traversal
 */

class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.socket = null;
    this.roomId = null;
    this.isInitiator = false;
    this.callbacks = {};
    
    // ICE servers configuration
    this.iceServers = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        // Add TURN server for better connectivity
        // {
        //   urls: 'turn:your-turn-server.com:3478',
        //   username: 'user',
        //   credential: 'pass'
        // }
      ]
    };
  }

  /**
   * Initialize with WebSocket connection
   */
  init(socket) {
    this.socket = socket;
    this.setupSocketListeners();
    console.log('🎥 WebRTC: Initialized');
  }

  /**
   * Setup socket event listeners
   */
  setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('webrtc:offer', async (data) => {
      console.log('📞 Received offer');
      await this.handleOffer(data);
    });

    this.socket.on('webrtc:answer', async (data) => {
      console.log('📞 Received answer');
      await this.handleAnswer(data);
    });

    this.socket.on('webrtc:ice-candidate', async (data) => {
      await this.handleIceCandidate(data);
    });

    this.socket.on('webrtc:call-ended', () => {
      console.log('📞 Call ended by remote');
      this.endCall();
      this.emit('callEnded', { reason: 'remote' });
    });

    this.socket.on('webrtc:call-rejected', () => {
      console.log('📞 Call rejected');
      this.endCall();
      this.emit('callRejected');
    });
  }

  /**
   * Get local media stream
   */
  async getLocalStream(video = true, audio = true) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: video ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } : false,
        audio: audio ? {
          echoCancellation: true,
          noiseSuppression: true
        } : false
      });
      
      console.log('🎥 Local stream obtained');
      this.emit('localStream', this.localStream);
      return this.localStream;
    } catch (error) {
      console.error('🎥 Error getting local stream:', error);
      throw error;
    }
  }

  /**
   * Create peer connection
   */
  createPeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.iceServers);

    // Add local tracks to connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });
    }

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket?.emit('webrtc:ice-candidate', {
          roomId: this.roomId,
          candidate: event.candidate
        });
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      console.log('🔗 Connection state:', this.peerConnection.connectionState);
      this.emit('connectionState', this.peerConnection.connectionState);
      
      if (this.peerConnection.connectionState === 'failed') {
        this.emit('connectionFailed');
      }
    };

    // Handle ICE connection state
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('🧊 ICE state:', this.peerConnection.iceConnectionState);
    };

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('🎥 Remote track received');
      this.remoteStream = event.streams[0];
      this.emit('remoteStream', this.remoteStream);
    };

    return this.peerConnection;
  }

  /**
   * Start call (initiator)
   */
  async startCall(roomId, video = true, audio = true) {
    this.roomId = roomId;
    this.isInitiator = true;

    try {
      await this.getLocalStream(video, audio);
      this.createPeerConnection();

      // Create and send offer
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      this.socket?.emit('webrtc:offer', {
        roomId: this.roomId,
        offer: offer
      });

      console.log('📞 Call started, offer sent');
      this.emit('callStarted');
    } catch (error) {
      console.error('📞 Error starting call:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Handle incoming offer
   */
  async handleOffer(data) {
    this.roomId = data.roomId;
    this.isInitiator = false;

    try {
      await this.getLocalStream(true, true);
      this.createPeerConnection();

      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
      
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      this.socket?.emit('webrtc:answer', {
        roomId: this.roomId,
        answer: answer
      });

      console.log('📞 Answer sent');
      this.emit('callConnecting');
    } catch (error) {
      console.error('📞 Error handling offer:', error);
      this.emit('error', error);
    }
  }

  /**
   * Handle answer from remote
   */
  async handleAnswer(data) {
    try {
      await this.peerConnection?.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );
      console.log('📞 Answer processed');
    } catch (error) {
      console.error('📞 Error handling answer:', error);
      // Не бросаем - WebRTC ошибки не должны ломать приложение
    }
  }

  /**
   * Handle ICE candidate
   */
  async handleIceCandidate(data) {
    try {
      if (this.peerConnection && data.candidate) {
        await this.peerConnection.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
      }
    } catch (error) {
      console.error('🧊 Error adding ICE candidate:', error);
    }
  }

  /**
   * Accept incoming call
   */
  async acceptCall(roomId) {
    this.socket?.emit('webrtc:accept', { roomId });
  }

  /**
   * Reject incoming call
   */
  rejectCall(roomId) {
    this.socket?.emit('webrtc:reject', { roomId });
  }

  /**
   * End call
   */
  endCall() {
    // Notify remote
    if (this.roomId) {
      this.socket?.emit('webrtc:end-call', { roomId: this.roomId });
    }

    // Stop local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.remoteStream = null;
    this.roomId = null;
    this.isInitiator = false;

    console.log('📞 Call ended');
    this.emit('callEnded', { reason: 'local' });
  }

  /**
   * Toggle video
   */
  toggleVideo(enabled) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
      console.log('🎥 Video:', enabled ? 'ON' : 'OFF');
    }
  }

  /**
   * Toggle audio
   */
  toggleAudio(enabled) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
      console.log('🎤 Audio:', enabled ? 'ON' : 'OFF');
    }
  }

  /**
   * Switch camera (mobile)
   */
  async switchCamera() {
    if (!this.localStream) return;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (!videoTrack) return;

    const currentFacing = videoTrack.getSettings().facingMode;
    const newFacing = currentFacing === 'user' ? 'environment' : 'user';

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacing }
      });

      const newVideoTrack = newStream.getVideoTracks()[0];
      
      // Replace track in peer connection
      const sender = this.peerConnection?.getSenders().find(s => 
        s.track?.kind === 'video'
      );
      if (sender) {
        await sender.replaceTrack(newVideoTrack);
      }

      // Replace in local stream
      videoTrack.stop();
      this.localStream.removeTrack(videoTrack);
      this.localStream.addTrack(newVideoTrack);

      console.log('📷 Camera switched to:', newFacing);
      this.emit('localStream', this.localStream);
    } catch (error) {
      console.error('📷 Error switching camera:', error);
    }
  }

  /**
   * Event handling
   */
  on(event, callback) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  off(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(data));
    }
  }
}

// Singleton instance
const webrtcService = new WebRTCService();

export default webrtcService;
