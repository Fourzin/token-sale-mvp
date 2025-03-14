/* global BigInt */
import React, { useState } from 'react';
import './SignUpWindow.css';
import {SCRIPT_ADDRESS,stringToHex,getCurrentEpochNumber,displayNumberInPrettyFormat,removePrettyFormat} from '../Constants';


const AffiliateLinkWindow = ({ tpo,project,onClose,accountInfo,setImportantTPOsList,setMessageWindowContent,setMessageWindowButtonText,setShowMessageWindow}) => {





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

  function handleCopyLink(){
    let affiliateLink="https://app-preview.adalink.io/affiliate-transaction?poolid="+tpo['PoolID']+"&aid="+accountInfo['UniqueID'];
    navigator.clipboard.writeText(affiliateLink);
    setMessageWindowContent("Affiliate link copied to clipboard.");
    setMessageWindowButtonText("OK");
    setShowMessageWindow(true);
  }

  async function handleSubscribeToCampaign(){
    setMessageWindowContent("Subscribing to campaign...");
    setMessageWindowButtonText("");
    setShowMessageWindow(true);
    let linkID = tpo['ID'].substring(0,5).toUpperCase()+"-"+accountInfo['UniqueID'];
    let affiliateLink="https://token-campaigns-preview.adalink.io/affiliate-transaction?linkid="+linkID;
    navigator.clipboard.writeText(affiliateLink);
    let response = await fetch("https://adalink.io/api/create-new-affiliate-link-for-tpo.php?linkID="+linkID+"&affiliateID="+accountInfo['UniqueID']+'&tpoID='+tpo['ID'].substring(0,5)+'&projectID='+tpo["ProjectID"]+'&ticker='+tpo['Ticker']+'&endAfter='+tpo['EndAfter'],{cache:"reload"});
    let result = await response.text();
    if(result == "New record created successfully"){
      response = await fetch("https://adalink.io/api/get-affiliate-subscribed-tpo-list.php?aID="+accountInfo['UniqueID'],{cache:"reload"});
      let importantTPOsList = JSON.parse(await response.text());
      setImportantTPOsList(importantTPOsList);
      setMessageWindowContent(<><div style={{textAlign:"left"}}>Successfully subscribed to program.</div><div style={{textAlign:"left"}}>Link is copied to clipboard. You can always find the link from your profile page.</div></>);
      setMessageWindowButtonText("OK");
    }else{
      setMessageWindowContent(<><div style={{textAlign:"left"}}>Already subscribed to program.</div><div style={{textAlign:"left"}}>Link is copied to clipboard. You can always find the link from your profile page.</div></>);
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
        <h3>Affiliate Link</h3>
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
              <div className='sign-up-text-field-title'>Token Campaign:</div>
              <div className='affiliate-link-text-field-input' style={{flex:1}}>
                {tpo['ID'].substring(0,5).toUpperCase()}-{tpo["Ticker"]}
              </div>
            </div>
            <div className='affiliate-link-field'>
              Affiliate link: https://token-campaigns-preview.adalink.io/affiliate-transaction?linkid={tpo['ID'].substring(0,5).toUpperCase()}-{accountInfo['UniqueID']}
            </div>
          </div>
          <div>
          <div className='token-pfp-affiliate-link-window'>
            <img alt="" src={tpo["MetadataSource"]=="cardano"?"data:image/png;base64, "+tpo["Logo_Base64"]:tpo['Logo_URL']} width={100} />
          </div>
        </div>
        </div>
        <div className='affiliate-link-field' style={{marginTop:"40px"}}>
          Note: Any wallet particpate through this link will be considered toward the affiliate's contribution in this specific campaign.
        </div>
        <div style={{textAlign:"right",marginTop:"2rem"}}>
          <button className='btnType1' style={{width:"200px"}} onClick={() => {handleSubscribeToCampaign()}}>Subscribe to program</button>
        </div>
      </div>
      }
    </div>
  );
};

export default AffiliateLinkWindow;
