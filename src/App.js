import React, { useEffect, useRef, useState } from "react";
import Peer from "peerjs";

// Import components
import PeerIdDisplay from "./Components/PeerIdDisplay";
import RemotePeerConnection from "./Components/RemotePeerConnection";
import ScreenShareInput from "./Components/ScreenShareInput";
import AdditionalActions from "./Components/AdditionalActions";
import VideoDisplay from "./Components/VideoDisplay";

function App() {
  const [peerId, setPeerId] = useState("");
  const [remotePeerIds, setRemotePeerIds] = useState([]);
  const [remotePeerIdValue, setRemotePeerIdValue] = useState("");
  const [screenName, setScreenName] = useState("");
  const [loading, setLoading] = useState(true);
  const currentUserVideoRef = useRef(null);
  const remoteUserVideoRef = useRef(null);

  const peerInstance = useRef(null);
  const screenStreamRef = useRef(null);
  const globalScreens = useRef([]);
  const dataConnection = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState("");
  const [targetPeerId, setTargetPeerId] = useState("");
  const [allScreens, setAllScreens] = useState([]);

  useEffect(() => {
    const peer = new Peer();

    peer.on("open", (id) => {
      setPeerId(id);
      setLoading(false);
    });
    peer.on("connection", (conn) => {
      addRemotePeerId(conn.peer);
      setTargetPeerId(conn.peer);
      globalScreens.current.forEach((tracksVA) => {
        if (tracksVA.uniqueId === "you") {
          peerInstance.current.call(conn.peer, tracksVA);
        }
      });
      setConnectionStatus(`Connected to ${conn.peer}`);
      dataConnection.current = conn;
      dataConnection.current.on("data", (data) => {
        if (data.channel === "youtube") {
          globalScreens.current.forEach((tracksVA) => {
            if (tracksVA.uniqueId === data.channel) {
              peerInstance.current.call(conn.peer, tracksVA);
            }
          });
        }
        if (data.channel === "netflix") {
          globalScreens.current.forEach((tracksVA) => {
            if (tracksVA.uniqueId === data.channel) {
              peerInstance.current.call(conn.peer, tracksVA);
            }
          });
        }
      });
    });
    peer.on("call", (call) => {
      addRemotePeerId(call.peer);
      call.answer(screenStreamRef.current);
      call.on("stream", (remoteStream) => {
        remoteUserVideoRef.current.srcObject = remoteStream;
        remoteUserVideoRef.current.autoplay = true;
        remoteUserVideoRef.current.playsInline = true;
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
    navigator.mediaDevices
      .getDisplayMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          systemAudio: "include",
        },
      })
      .then((screenStream) => {
        let trackValue = screenStream;
        trackValue.uniqueId = screenName;
        setAllScreens([...allScreens, trackValue]);
        globalScreens.current.push(trackValue);
        trackValue.getVideoTracks().forEach((tracker) => {});
        screenStreamRef.current = screenStream;

        currentUserVideoRef.current.srcObject = trackValue;
        currentUserVideoRef.current.play();
      })
      .catch((err) => {
        console.error("Error accessing screen sharing:", err);
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

  const playVideo = (channel) => {
    const conn = peerInstance.current.connect(remotePeerIdValue);
    conn.on("open", () => {
      conn.send({ channel });
    });
  };
  const connectToPeer = (remotePeerId) => {
    peerInstance.current.connect(remotePeerId);
  };

  return (
    <div className="App">
      <h1>Screen Sharing App</h1>
      <PeerIdDisplay loading={loading} peerId={peerId} />
      <RemotePeerConnection
        remotePeerIdValue={remotePeerIdValue}
        setRemotePeerIdValue={setRemotePeerIdValue}
        connectToPeer={connectToPeer}
      />
      <ScreenShareInput
        screenName={screenName}
        setScreenName={setScreenName}
        startScreenShare={startScreenShare}
      />
      <AdditionalActions
        startScreenShare={startScreenShare}
        playVideo={playVideo}
      />
      <VideoDisplay
        currentUserVideoRef={currentUserVideoRef}
        remoteUserVideoRef={remoteUserVideoRef}
        toggleFullScreen={toggleFullScreen}
      />
    </div>
  );
}

export default App;
