import React from 'react';

import "../App.css";

// Component for remote peer connection input
const RemotePeerConnection = ({
    remotePeerIdValue,
    setRemotePeerIdValue,
    connectToPeer,
  }) => (
    <div className="remote-peer">
      <label>Add Remote Peer ID:</label>
      <input
        type="text"
        value={remotePeerIdValue}
        onChange={(e) => setRemotePeerIdValue(e.target.value)}
      />
      <button onClick={() => connectToPeer(remotePeerIdValue)}>Call</button>
    </div>
  );

  export default RemotePeerConnection;