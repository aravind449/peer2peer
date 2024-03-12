import React from 'react';

import "../App.css";

// Component for screen share input
const ScreenShareInput = ({ screenName, setScreenName, startScreenShare }) => (
    <div className="remote-peer">
      <label>Add Screen Share Name</label>
      <input
        type="text"
        value={screenName}
        onChange={(e) => setScreenName(e.target.value)}
      />
      <button onClick={() => startScreenShare(screenName)}>Share</button>
    </div>
  );

  export default ScreenShareInput;