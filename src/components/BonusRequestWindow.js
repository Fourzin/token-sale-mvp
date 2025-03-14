/* global BigInt */
import React, { useState } from 'react';
import './SignUpWindow.css';
import {SCRIPT_ADDRESS,stringToHex,getCurrentEpochNumber,displayNumberInPrettyFormat,removePrettyFormat} from '../Constants';


const BonusRequestWindow = ({ ip,spo,onClose,accountInfo,setImportantIPsList,setMessageWindowContent,setMessageWindowButtonText,setShowMessageWindow}) => {





  const closeWindow = (event) => {
      if(event.target.className.toString()==="backdrop"){ 
        onClose();
    }
  }

  function showNeedToSignInMessage(){
    setMessageWindowContent("Sign in as an affiliate first.");
    setMessageWindowButtonText("OK");
    setShowMessageWindow(true);
    onClose();
  }


  async function handleSubscribeToCampaign(){
    setMessageWindowContent("Reqeusting bonus from SPO...");
    setMessageWindowButtonText("");
    setShowMessageWindow(true);
    let requestID = ip['StartEpoch']+"-"+spo['Ticker']+"-"+accountInfo['UniqueID'];
    let response = await fetch("https://adalink.io/api/create-new-bonus-request.php?requestID="+requestID+"&affiliateID="+accountInfo['UniqueID']+'&affiliateDisplayName='+accountInfo['DisplayName']+'&poolID='+ip["PoolID"]+'&poolTicker='+spo['Ticker']+'&startEpoch='+ip['StartEpoch']+'&endEpoch='+ip['EndEpoch'],{cache:"reload"});
    let result = await response.text();
    if(result == "New record created successfully"){
      setMessageWindowContent("Successfully requested bonus on this program.");
      setMessageWindowButtonText("OK");
    }else{
      setMessageWindowContent("Already requested bonus on this program.");
      setMessageWindowButtonText("OK");
    }
    onClose();
  }


  return (
    <div className="backdrop" onClick={closeWindow}>
      {accountInfo["UniqueID"]===undefined?
      showNeedToSignInMessage()
      :
      <div className='affiliate-link-window'>
        <h3>Bonus Request</h3>
        <br/>
        <div style={{display:"flex",gap:"30px"}}>
          <div className='sign-up-text-fields-area'>
            <div className='sign-up-text-field'>
              <div className='sign-up-text-field-title'>Affiliate:</div>
              <div className='sign-up-text-field-input' >
                {accountInfo["DisplayName"]}
              </div>
            </div>
            <div className='sign-up-text-field'>
              <div className='sign-up-text-field-title'>Affiliate ID:</div>
              <div className='sign-up-text-field-input' >
                {accountInfo["UniqueID"]}
              </div>
            </div>
            <div className='sign-up-text-field'>
              <div className='sign-up-text-field-title'>Incentive Program:</div>
              <div className='affiliate-link-text-field-input' style={{flex:1}}>
                {ip['StartEpoch']}-{spo["Ticker"]}
              </div>
            </div>
          </div>
        </div>
        <div style={{textAlign:"center",marginTop:"2rem"}}>
          <button className='btnType1' style={{width:"200px"}} onClick={() => {handleSubscribeToCampaign()}}>Send request</button>
        </div>
      </div>
      }
    </div>
  );
};

export default BonusRequestWindow;
