// src/components/Footer.js
import React from 'react';
import './Footer.css'; // Import the CSS file

function Footer() {
  return (
    <footer className='footer'>
      <div className="container">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} AdaLink. All rights reserved. <e style={{color:"transparent"}}>Signed</e></p>
          <div className="footer-links" style={{display:"none"}}>
            <a href="/terms">Terms of Service</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/contact">Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
