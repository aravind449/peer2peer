// Component for displaying peer ID
import React from 'react';

import "../App.css";

const PeerIdDisplay = ({ loading, peerId }) => (
    <div className="peer-id">
      <label>Your Peer ID:</label>
      <div>{loading ? "Loading..." : peerId}</div>
    </div>
  );

export default PeerIdDisplay;