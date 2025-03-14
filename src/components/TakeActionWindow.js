import React, { useRef } from 'react';
import './TakeActionWindow.css';


const TakeActionWindow = ({ message,onClose, onAction }) => {
  const messageWindoRef = useRef();
  
  return (
    <div className="message-window-container">
      <div className="message-window" ref={messageWindoRef}>
        <div className='take-action-message'>{message}</div>
        <div className="take-action-buttons-container" >
          <button className="message-window-button" onClick={() => {onAction();onClose()}}>
            Yes
          </button>
          <button className="message-window-button" onClick={onClose}>
            No
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default TakeActionWindow;
