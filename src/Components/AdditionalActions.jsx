import React from 'react';
import { FaYoutube, FaAmazon } from "react-icons/fa";
import "../App.css";
// Component for additional actions (Share456, YouTube, Netflix)
const AdditionalActions = ({ startScreenShare, playVideo }) => (
    <div className="actions">
      <button onClick={() => startScreenShare("screenName")}>Share456</button>
      <button className="playIcons" onClick={() => playVideo("youtube")}>
        <FaYoutube />
      </button>
      <button className="playIcons" onClick={() => playVideo("netflix")}>
        <FaAmazon />
      </button>
    </div>
  );

  export default AdditionalActions;