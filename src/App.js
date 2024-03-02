import { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import './App.css';

function App() {
  const [peerId, setPeerId] = useState('');
  const [remotePeerIds, setRemotePeerIds] = useState([]);
  const [remotePeerIdValue, setRemotePeerIdValue] = useState('');
  const [loading, setLoading] = useState(true);
  const currentUserVideoRef = useRef(null);
  const peerInstance = useRef(null);
  const screenStreamRef = useRef(null);
  const [requestingRemoteControl, setRequestingRemoteControl] = useState(false);
  const [remoteControlEnabled, setRemoteControlEnabled] = useState(false);
  const [targetPeerId, setTargetPeerId] = useState('');

  useEffect(() => {
    const peer = new Peer();

    peer.on('open', (id) => {
      setPeerId(id);
      setLoading(false);
    });

    peer.on('call', (call) => {
      call.answer(screenStreamRef.current); // Answer the call with screen stream

      call.on('stream', (remoteStream) => {
        const remoteVideoRef = document.createElement('video');
        remoteVideoRef.srcObject = remoteStream;
        remoteVideoRef.autoplay = true;
        remoteVideoRef.playsInline = true;
        document.getElementById('remoteVideos').appendChild(remoteVideoRef);
      });
    });

    peer.on('connection', (conn) => {
      conn.on('data', (data) => {
        if (data.type === 'requestRemoteControl') {
          setRequestingRemoteControl(true);
          setTargetPeerId(conn.peer);
        } else if (data.type === 'grantRemoteControl') {
          setRemoteControlEnabled(true);
          setRequestingRemoteControl(false);
        } else if (data.type === 'denyRemoteControl') {
          setRequestingRemoteControl(false);
        }
      });
    });

    peerInstance.current = peer;

    return () => {
      if (peerInstance.current) {
        peerInstance.current.destroy();
      }
    };
  }, []);

  const startScreenShare = () => {
    navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
      .then((screenStream) => {
        screenStreamRef.current = screenStream;

        currentUserVideoRef.current.srcObject = screenStream;
        currentUserVideoRef.current.play();

        remotePeerIds.forEach(peerId => {
          const call = peerInstance.current.call(peerId, screenStream);
          call.on('stream', (remoteStream) => {
            const remoteVideoRef = document.createElement('video');
            remoteVideoRef.srcObject = remoteStream;
            remoteVideoRef.autoplay = true;
            remoteVideoRef.playsInline = true;
            document.getElementById('remoteVideos').appendChild(remoteVideoRef);
          });
        });
      })
      .catch((err) => {
        console.error('Error accessing screen sharing:', err);
      });
  };

  const addRemotePeerId = () => {
    setRemotePeerIds([...remotePeerIds, remotePeerIdValue]);
    setRemotePeerIdValue('');
  };

  const toggleFullScreen = (videoRef) => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.mozRequestFullScreen) {
        videoRef.current.mozRequestFullScreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      } else if (videoRef.current.msRequestFullscreen) {
        videoRef.current.msRequestFullscreen();
      }
    }
  };

  const requestRemoteControl = () => {
    const conn = peerInstance.current.connect(targetPeerId);
    conn.on('open', () => {
      console.log('Connection opened');
      conn.send({ type: 'requestRemoteControl' });
      console.log('Request sent');
    });
  };
  

  const grantRemoteControl = () => {
    const conn = peerInstance.current.connect(targetPeerId);
    conn.on('open', () => {
      conn.send({ type: 'grantRemoteControl' });
    });
  };

  const denyRemoteControl = () => {
    const conn = peerInstance.current.connect(targetPeerId);
    conn.on('open', () => {
      conn.send({ type: 'denyRemoteControl' });
    });
  };

  return (
    <div className="App">
      <h1>Screen Sharing App</h1>
      <div className="peer-id">
        <label>Your Peer ID:</label>
        <div>{loading ? 'Loading...' : peerId}</div>
      </div>
      <div className="remote-peer">
        <label>Add Remote Peer ID:</label>
        <input type="text" value={remotePeerIdValue} onChange={e => setRemotePeerIdValue(e.target.value)} />
        <button onClick={addRemotePeerId}>Add</button>
      </div>
      <div className="actions">
        <button onClick={startScreenShare}>Start Screen Share</button>
        {requestingRemoteControl && (
          <button onClick={grantRemoteControl}>Grant Remote Control</button>
        )}
      </div>
      <div className="video-container">
        <div className="local-video">
          <label>Your Screen:</label>
          <video ref={currentUserVideoRef} autoPlay muted playsInline onClick={() => toggleFullScreen(currentUserVideoRef)} />
        </div>
        <div className="remote-videos">
          <label>Remote Screens:</label>
          <div id="remoteVideos"></div>
        </div>
      </div>
      {requestingRemoteControl && (
        <div className="remote-control-request">
          <p>{`User ${targetPeerId} requests remote control access.`}</p>
          <button onClick={grantRemoteControl}>Grant</button>
          <button onClick={denyRemoteControl}>Deny</button>
        </div>
      )}
      {!remoteControlEnabled && (
        <div className="request-remote-control">
          <p>Request Remote Control</p>
          <button onClick={requestRemoteControl}>Request</button>
        </div>
      )}
    </div>
  );
}

export default App;
