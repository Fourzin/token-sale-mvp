import React, { useRef } from 'react';
import './MessageWindow.css';


const ConfirmWindow = ({ onClose, onAction }) => {
  const messageWindoRef = useRef();
  
  return (
    <div className="message-window-container">
      <div className="message-window" ref={messageWindoRef}>
        <div className='message-window-content'>Are you sure?</div>
        <div className="message-window-footer" style={{display:"flex",gap:"10px"}}>
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

export default ConfirmWindow;
