import { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import { FaYoutube, FaAmazon } from 'react-icons/fa';
import './App.css';

function App() {
  const [peerId, setPeerId] = useState('');
  const [remotePeerIds, setRemotePeerIds] = useState([]);
  const [remotePeerIdValue, setRemotePeerIdValue] = useState('');
  const [screenName, setScreenName] = useState('');
  const [loading, setLoading] = useState(true);
  const currentUserVideoRef = useRef(null);
  const remoteUserVideoRef = useRef(null);

  const peerInstance = useRef(null);
  const screenStreamRef = useRef(null);
  const globalScreens = useRef([]);
  const dataConnection = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [requestingRemoteControl, setRequestingRemoteControl] = useState(false);
  const [remoteControlEnabled, setRemoteControlEnabled] = useState(false);
  const [targetPeerId, setTargetPeerId] = useState('');
  const [allScreens, setAllScreens] = useState([]);


  useEffect(() => {
    const peer = new Peer();

    peer.on('open', (id) => {
      setPeerId(id);
      setLoading(false);
    });
    peer.on('connection', (conn) => {
      addRemotePeerId(conn.peer);
      setTargetPeerId(conn.peer);
    globalScreens.current.forEach((tracksVA)=> {
       if(tracksVA.uniqueId === "you"){
        peerInstance.current.call(conn.peer, tracksVA);
      }
    });
      setConnectionStatus(`Connected to ${conn.peer}`);
      dataConnection.current = conn;
      dataConnection.current.on('data', (data) => {
        if (data.channel === 'youtube') {
          console.log("on channel ....", data.channel);
          globalScreens.current.forEach((tracksVA)=> {
             if(tracksVA.uniqueId === data.channel){
              peerInstance.current.call(conn.peer, tracksVA);
            }
          });
        }
        if (data.channel === 'netflix') {
          console.log("on channel ....", data.channel);
          globalScreens.current.forEach((tracksVA)=> {
             if(tracksVA.uniqueId === data.channel){
              peerInstance.current.call(conn.peer, tracksVA);
            }
          });
        }
      }); 
    });
    peer.on('call', (call) => {
      addRemotePeerId(call.peer);
      console.log("on calll........");
     // chooseScreenToShare(call.peer);
      call.answer(screenStreamRef.current); // Answer the call with screen stream
      call.on('stream', (remoteStream) => {
        console.log("in stream........4444");
        remoteUserVideoRef.current.srcObject = remoteStream;
        remoteUserVideoRef.current.autoplay = true;
        remoteUserVideoRef.current.playsInline = true;


       // document.getElementById('remoteVideos').append(remoteVideoRef);
      });

      call.on('data', (data) => {
        // Handle control commands from receiver
         
        if (data === 'youtube') {
           console.log("on data....",allScreens);
           console.log("on data change useref....",globalScreens.current);
        }
        // You can add more control commands here
      });
    });

    peerInstance.current = peer;

    return () => {
      if (peerInstance.current) {
        peerInstance.current.destroy();
      }
    };
  }, []);


  

  const startScreenShare = (screenName) => {
    navigator.mediaDevices.getDisplayMedia({ video: true, 
      audio: {
             echoCancellation: true,
             noiseSuppression: true,
             autoGainControl: true,
             systemAudio: "include"
    } })
      .then((screenStream) => {
        let trackValue = screenStream;
        trackValue.uniqueId = screenName;
        console.log('test 123 ',trackValue)
        setAllScreens([...allScreens, trackValue]);
        globalScreens.current.push(trackValue);
        trackValue.getVideoTracks().forEach((tracker) =>  {

        //  tracker.label = screenName;
          console.log("audio ...",tracker);
        })
        screenStreamRef.current = screenStream;

        currentUserVideoRef.current.srcObject = trackValue;
        currentUserVideoRef.current.play();

        // remotePeerIds.forEach(peerId => {
        //  const call = peerInstance.current.call(peerId, trackValue);
        //  const remoteVideoRef = document.createElement('video');
        //  call.on('stream', (remoteStream) => {
        //     remoteVideoRef.srcObject = remoteStream;
        //     remoteVideoRef.autoplay = true;
        //     remoteVideoRef.playsInline = true;
        //     document.getElementById('remoteVideos').appendChild(remoteVideoRef);
        //   });
        // });
      })
      .catch((err) => {
        console.error('Error accessing screen sharing:', err);
      });
  };

  const addRemotePeerId = (callerPeer) => {
    setRemotePeerIds([...remotePeerIds, callerPeer]);
  };

  const toggleFullScreen = () => {
    const videoRef = remoteUserVideoRef;
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
      conn.send({ type: 'requestRemoteControl' });
    });
  };

  const grantRemoteControl = () => {
    const conn = peerInstance.current.connect(targetPeerId);
    conn.on('open', () => {
      conn.send({ type: 'grantRemoteControl' });
      setRemoteControlEnabled(true);
    });
  };

  const denyRemoteControl = () => {
    const conn = peerInstance.current.connect(targetPeerId);
    conn.on('open', () => {
      conn.send({ type: 'denyRemoteControl' });
    });
  };
  const playVideo = (channel) => { 
    const conn = peerInstance.current.connect(remotePeerIdValue);
    conn.on('open', () => {

    conn.send({ channel });
    })
  }
  const sendControlCommand = (type) => {
    const conn = peerInstance.current.connect(targetPeerId);
    conn.on('open', () => {
      conn.send({ type });
    });
  };
  const connectToPeer = (remotePeerId) => {
    peerInstance.current.connect(remotePeerId);
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
        <button onClick={() => connectToPeer(remotePeerIdValue)}>Call</button>
      </div>
      <div className="remote-peer">
        <label>Add Screen Share Name</label>
        <input type="text" value={screenName} onChange={e => setScreenName(e.target.value)} />
        <button onClick={() => startScreenShare(screenName)}>Share</button>
      </div>
      <div className="actions">
        <button onClick={() => startScreenShare("screenName")}>Share456</button>
        <button className="playIcons" onClick={() => playVideo("youtube")}>          
        <FaYoutube />
        </button>
        <button className="playIcons" onClick={() => playVideo("netflix")}>
        <FaAmazon />
        </button>

        {requestingRemoteControl && (
          <button onClick={grantRemoteControl}>Grant Remote Control</button>
        )}
      </div>
      <div className="video-container">
        <div className="local-video">
          <label>Your Screen:</label>
          <video ref={currentUserVideoRef} autoPlay muted playsInline />
          <button onClick={toggleFullScreen}>Toggle Full Screen</button>
        </div>
        <div className="remote-videos">
          <label>Remote Screens:</label>
          {/* <div id="remoteVideos"></div> */}
          <video ref={remoteUserVideoRef}/>
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
          <button onClick={denyRemoteControl}>Request</button>
        </div>
      )}
    </div>
  );
}

export default App;
