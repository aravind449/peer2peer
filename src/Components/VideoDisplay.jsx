import React from 'react';

import "../App.css";

// Component for video display
const VideoDisplay = ({
    currentUserVideoRef,
    remoteUserVideoRef,
    toggleFullScreen,
  }) => (
    <div className="video-container">
      <div className="local-video">
        <label>Your Screen:</label>
        <video ref={currentUserVideoRef} autoPlay muted playsInline />
        <button onClick={toggleFullScreen}>Toggle Full Screen</button>
      </div>
      <div className="remote-videos">
        <label>Remote Screens:</label>
        <video ref={remoteUserVideoRef} />
      </div>
    </div>
  );

  export default VideoDisplay;