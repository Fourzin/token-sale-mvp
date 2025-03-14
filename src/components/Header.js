// src/components/Header.js
import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WalletMenu from './WalletMenu'; 
import SignUpWindow from './SignUpWindow'; 
import logo from '../assets/images/adalink-logo-white.png';

import './Header.css'




function Header({isLoggedIn,setLoggedIn,setAccountInfo,accountInfo,setImportantTPOsList,setImportantBRsList,walletAPI,setWalletAPI,walletName,setWalletName,walletIcon,setWalletIcon,lucid,Cookies,selectedIPID,selectedSPOID,setMessageWindowContent,setMessageWindowButtonText,setShowMessageWindow}) {

  const navigate = useNavigate();

  const [isWalletMenuOpen, setWalletMenuOpen] = useState(false);
  const [isSignUpWindowOpen, setSignUpWindowOpen] = useState(false);
  const [mode,setMode] = useState();
  

  const handleOpenWalletMenu = (m) => {
    setMode(m);
    setWalletMenuOpen(true);
  };
  
  const handleCloseWalletMenu = () => {
    setWalletMenuOpen(false);
  };

  const handleOpenSignUpWindow = () => {
    setSignUpWindowOpen(true);
  };

  const handleCloseSignUpWindow = () => {
    setSignUpWindowOpen(false);
  };
  

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">
          <img src={logo} alt="Your Logo" />
        </Link>
        <div className='preview-badge'>Preview Net</div>
        <div className='go-to-market-button' onClick={() => {window.location = "https://affiliate-programs-preview.adalink.io/"}}>
          Go to Affiliate Market
        </div>
      </div>
      
      <nav className="nav">
        <ul className="nav-list">
          <li className="nav-item" id="nav-item-1" onClick={() => {selectedSPOID="0";document.getElementById("nav-item-1").style.fontWeight="bold";document.getElementById("nav-item-3").style.fontWeight="normal";document.getElementById("nav-item-2").style.fontWeight="normal"}}>
            <Link to="/">Token Campaigns</Link>
          </li>
          <li className="nav-item" id="nav-item-2" onClick={() => {selectedIPID="0";document.getElementById("nav-item-2").style.fontWeight="bold";document.getElementById("nav-item-3").style.fontWeight="normal";document.getElementById("nav-item-1").style.fontWeight="normal"}} >
            <Link to="/projects">Explore Projects</Link>
          </li>
          <li className="nav-item" id="nav-item-3" style={{display:"none"}} onClick={() => {selectedIPID="0";document.getElementById("nav-item-3").style.fontWeight="bold";document.getElementById("nav-item-2").style.fontWeight="normal";document.getElementById("nav-item-1").style.fontWeight="normal"}} >
            <Link to="/tokens">Explore Tokens</Link>
          </li>
        </ul>
      </nav>
      <div className="wallet-connect">
        {isLoggedIn ? (
          <>
            <div className='login-text' onClick={() => {setWalletAPI();setWalletName("");setLoggedIn(false);navigate('/');setAccountInfo({StakeAddress:"0"})}}>Log out</div>
            <Link to="/profile"><button onClick={() => {selectedIPID="0";selectedSPOID="0";document.getElementById("nav-item-1").style.fontWeight="normal";document.getElementById("nav-item-2").style.fontWeight="normal"}}>{accountInfo['DisplayName']}</button></Link>
          </>
        ) : (
          <>
          <div className='login-text' onClick={() => {handleOpenWalletMenu("login");}}>Login</div>
          <button onClick={() => {;handleOpenSignUpWindow()}}>Sign up</button>
          </>
        )}
      </div>
      { isSignUpWindowOpen && 
        <SignUpWindow 
          walletAPI={walletAPI} 
          walletName={walletName} 
          walletIcon={walletIcon} 
          lucid={lucid} 
          openWalletMenu={handleOpenWalletMenu} 
          onClose={handleCloseSignUpWindow}
          setLoggedIn={setLoggedIn}
          setAccountInfo={setAccountInfo}
          selectedSPOID={selectedSPOID}
          selectedIPID={selectedIPID}
          setMessageWindowContent={setMessageWindowContent}
          setMessageWindowButtonText={setMessageWindowButtonText}
          setShowMessageWindow={setShowMessageWindow}
        /> 
      }
      { isWalletMenuOpen && 
        <WalletMenu 
          mode={mode} 
          setLoggedIn={setLoggedIn} 
          lucid={lucid} 
          setWalletAPI={setWalletAPI}  
          setWalletName={setWalletName} 
          setWalletIcon={setWalletIcon} 
          Cookies={Cookies} 
          onClose={handleCloseWalletMenu}
          setAccountInfo={setAccountInfo}
          setImportantTPOsList={setImportantTPOsList}
          setImportantBRsList={setImportantBRsList}
          setMessageWindowContent={setMessageWindowContent}
          setMessageWindowButtonText={setMessageWindowButtonText}
          setShowMessageWindow={setShowMessageWindow}  
        /> 
      }
    </header>
  );
}

export default Header;
