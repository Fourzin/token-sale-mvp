import React, { useRef } from 'react';
import './MessageWindow.css';

import loadingGIF from '../assets/images/loading.gif';

const MessageWindow = ({ message, buttonText, onClose, onAction }) => {
  const messageWindoRef = useRef();

  /*useEffect(() => {
    const handleClickOutside = (event) => {
      if (messageWindoRef.current && !messageWindoRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);*/
  
  return (
    <div className="message-window-container">
      <div className="message-window" ref={messageWindoRef}>
        <div className='message-window-content'>{message}</div>
        {buttonText!=''?
        <div className="message-window-footer">
          <button className="message-window-button" onClick={onAction}>
            {buttonText}
          </button>
        </div>
        :<><br/><img width={32} src={loadingGIF}/></>}
      </div>
    </div>
  );
};

export default MessageWindow;
