// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Update the import statement
import { Lucid, Blockfrost, Maestro } from 'lucid-cardano';
import Cookies from 'js-cookie';
import { NETWORK,WEBSITE } from './Constants';

import './App.css';

// Use the Lucid object in your component


import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProfilePage from './pages/ProfilePage';
import SPOs from './pages/SPOs';
import Projects from './pages/Projects';


import MessageWindow from './components/MessageWindow';
import AffiliateTransaction from './pages/AffiliateTransaction';

let lucid;
switch(WEBSITE){
  case 'https://test-orderbook.adalink.io':
    try{
    lucid = await Lucid.new(
      new Blockfrost("https://cardano-preview.blockfrost.io/api/v0", "preview2veeuotXrSHV9blXL7rZo8Ty6fuyhtdP"),
      "Preview",
    );
    //lucid = await Lucid.new(new Maestro({network:"Preview",apiKey:"B90DdooxknSeMoNcHLrz4i6wap9EDvt9",turboSubmit:false}))
    }
    catch{
      console.log("could not load chain parameters!")
    }
  break;
  case 'https://orderbook.adalink.io':
    lucid = await Lucid.new(
      new Blockfrost("https://cardano-mainnet.blockfrost.io/api/v0", "mainnetedOr1A0jt3OG6NJ4dI0U59cFb42hgD3t"),
      "Mainnet",
    );
  break;
  default:
}




let checkForLastConnectedWalletEnabled = true;
let connectedWalletAPI;
let response = await fetch(NETWORK===1?"https://adalink.io/api/get-tpos-list.php?network=mainnet":"https://adalink.io/api/get-tpos-list.php?network=preview",{cache:'reload'});
let initialTPOsList = JSON.parse(await response.text());
console.log(initialTPOsList)
let selectedSPOID="0";
let selectedTPOID="0";
function App() {
  const [walletAPI,setWalletAPI]=useState();
  const [walletName,setWalletName]=useState();
  const [walletIcon,setWalletIcon]=useState();
  const [isLoggedIn,setLoggedIn] = useState(false);
  const [tposList,setTPOsList]=useState(initialTPOsList);

  
  const [accountInfo,setAccountInfo] = useState({StakeAddress:"0"});
  const [importantTPOsList,setImportantTPOsList]=useState();
  const [importantBRsList,setImportantBRsList]=useState();
  
  const [showMessageWindow,setShowMessageWindow] = useState(false);
  const [messageWindowContent,setMessageWindowContent] = useState('');
  const [messageWindowButtonText,setMessageWindowButtonText] = useState('Ok');


  useEffect(() => {
    //this will run once!
    if (checkForLastConnectedWalletEnabled) {
      connectLastConnectedWallet();
      checkForLastConnectedWalletEnabled=false
    }
    
  },[]) // Empty dependency array to run the effect only once

  async function connectLastConnectedWallet(){
    if(Cookies.get('lastConnectedWalletName')){
      //console.log('checking last connected wallet...');
      let lastConnectedWalletName = Cookies.get('lastConnectedWalletName');
      //console.log(lastConnectedWalletName)
      let lastConnectedWalletAPI;
      switch(lastConnectedWalletName){
        case 'eternl':
          lastConnectedWalletAPI = await window.cardano.eternl.enable();
          
          setWalletName('Eternl');
        break;
        case 'vespr':
          lastConnectedWalletAPI = await window.cardano.vespr.enable();
          setWalletName('Vespr');
        break; 
        case 'begin':
          lastConnectedWalletAPI = await window.cardano.begin.enable();
          setWalletName('Begin');
        break;     
        default:
      }
      
      setWalletAPI(lastConnectedWalletAPI);
      //console.log(Cookies.get('lastConnectedWalletName'))
      //console.log(walletName)
      connectedWalletAPI=lastConnectedWalletAPI;
      Cookies.set('lastConnectedWalletName',lastConnectedWalletName,{expires:1000});
      showLoadingWindow();
      handleLogin(connectedWalletAPI);
    }
  }

  async function handleLogin(walletAPI) {
    try{
      lucid.selectWallet(walletAPI);
    }catch{setShowMessageWindow(false);return}
    let stakeAddress = await lucid.wallet.rewardAddress();
        //console.log(stakeAddress)
    let response = await fetch('https://adalink.io/api/get-account-info-tpo.php?stakeAddress='+stakeAddress,{cache:'reload'}); 
    let accountInfo = JSON.parse(await response.text());

    if (accountInfo!==null){
      setAccountInfo(accountInfo);
      setLoggedIn(true);
      setShowMessageWindow(false);
      if(accountInfo['UniqueID']!=undefined){
        response = await fetch("https://adalink.io/api/get-affiliate-subscribed-tpo-list.php?aID="+accountInfo['UniqueID'],{cache:"reload"});
      }else{
        response = await fetch("https://adalink.io/api/get-project-tpo-list.php?projectID="+accountInfo['ProjectID']+'&network='+NETWORK,{cache:"reload"});
        let bonusRequestResponse = await fetch("https://adalink.io/api/get-spo-br-list.php?poolID="+accountInfo['ProjectID'],{cache:"reload"});
        let importantBRsList = JSON.parse(await bonusRequestResponse.text());
        setImportantBRsList(importantBRsList);
        
      }
      let importantTPOsList = JSON.parse(await response.text());
      setImportantTPOsList(importantTPOsList);
      console.log("importantTPOsList")
        console.log(importantTPOsList)
      //console.log(importantTPOsList)
    } else {
      setMessageWindowContent("Wallet is not linked to an account.");
      setMessageWindowButtonText("OK");
      setShowMessageWindow(true);
    }
  }
    
    function showLoadingWindow(){
      setMessageWindowContent("Logging in");
      setMessageWindowButtonText("");
      setShowMessageWindow(true);
    }

  return (
    <Router>
      <div className="App">
        <Header 
          isLoggedIn={isLoggedIn} 
          setLoggedIn={setLoggedIn} 
          setAccountInfo={setAccountInfo}
          accountInfo={accountInfo}
          setImportantTPOsList={setImportantTPOsList}
          setImportantBRsList={setImportantBRsList}
          walletAPI={walletAPI} 
          setWalletAPI={setWalletAPI} 
          walletName={walletName} 
          setWalletName={setWalletName} 
          walletIcon={walletIcon} 
          setWalletIcon={setWalletIcon} 
          lucid={lucid} 
          Cookies={Cookies}
          selectedTPOID={selectedTPOID}
          selectedSPOID={selectedSPOID}
          setMessageWindowContent={setMessageWindowContent}
          setMessageWindowButtonText={setMessageWindowButtonText}
          setShowMessageWindow={setShowMessageWindow}  
        />
        <Routes onChange={(path) => console.log(path)}>
          <Route 
            path="/" 
            element={
              <Home 
                isLoggedIn={isLoggedIn}
                tposList={tposList}
                setTPOsList={setTPOsList}
                accountInfo={accountInfo}
                setImportantTPOsList={setImportantTPOsList}
                walletAPI={walletAPI}
                lucid={lucid}
                selectedTPOID={selectedTPOID}
                setMessageWindowContent={setMessageWindowContent}
                setMessageWindowButtonText={setMessageWindowButtonText}
                setShowMessageWindow={setShowMessageWindow}  
              />
            }
            
            onAction={() => {document.getElementById("nav-item-1").style.fontWeight="bold";document.getElementById("nav-item-2").style.fontWeight="normal"}}
          />
          <Route
            path="/projects"
            element={(
              <Projects
                tposList={tposList}
                selectedSPOID={selectedSPOID}
                setMessageWindowContent={setMessageWindowContent}
                setMessageWindowButtonText={setMessageWindowButtonText}
                setShowMessageWindow={setShowMessageWindow}  
              />
            )}
            onAction={() => {document.getElementById("nav-item-1").style.fontWeight="normal";document.getElementById("nav-item-2").style.fontWeight="bold"}}
          />
          {/*<Route
            path="/tokens"
            element={(
              <SPOs
                tposList={tposList}
                selectedSPOID={selectedSPOID}
                setMessageWindowContent={setMessageWindowContent}
                setMessageWindowButtonText={setMessageWindowButtonText}
                setShowMessageWindow={setShowMessageWindow}  
              />
            )}
            onAction={() => {document.getElementById("nav-item-1").style.fontWeight="normal";document.getElementById("nav-item-2").style.fontWeight="bold"}}
          />*/}        
          <Route
            path="/profile"
            element={(
              <ProfilePage
                accountInfo={accountInfo}
                importantTPOsList={importantTPOsList}
                setImportantBRsList={setImportantBRsList}
                importantBRsList={importantBRsList}
                setAccountInfo={setAccountInfo}
                setMessageWindowContent={setMessageWindowContent}
                setMessageWindowButtonText={setMessageWindowButtonText}
                setShowMessageWindow={setShowMessageWindow}  
              />
            )}
            onAction={() => {document.getElementById("nav-item-1").style.fontWeight="normal";document.getElementById("nav-item-2").style.fontWeight="normal"}}
          />
          <Route
            path='/affiliate-transaction'
            element={(
              <AffiliateTransaction
                lucid={lucid}
                setShowMessageWindow={setShowMessageWindow}
                setMessageWindowButtonText={setMessageWindowButtonText}
                setMessageWindowContent={setMessageWindowContent}
              />
            )}
          />
        </Routes>
        {showMessageWindow && ( // Show OrderSummary when orderSummaryVisible is true
          <MessageWindow
            message={messageWindowContent}
            buttonText={messageWindowButtonText}
            onClose={() => setShowMessageWindow(false)} // Close OrderSummary
            onAction={ () => setShowMessageWindow(false)} // Pass placeOrderHandler as onPlaceOrder
          />
        )}
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;

