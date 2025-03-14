// src/pages/Home.js
import React, { useState, useEffect } from 'react';

import './ProfilePage.css'; // Import the CSS file
import { useNavigate } from 'react-router-dom';
import editIcon from '../assets/images/edit-icon.png';
import { displayNumberInPrettyFormat, getCurrentEpochNumber } from '../Constants';
import EditWindow from '../components/EditWindow';
import ConfirmWindow from '../components/ConfirmWindow';


function ProfilePage({accountInfo,importantTPOsList,setImportantBRsList,importantBRsList,setAccountInfo,setMessageWindowContent,setMessageWindowButtonText,setShowMessageWindow}) {
  
  const navigate = useNavigate();
  const [isEditWindowOpen,setEditWindowOpen] =useState(false);
  const [isConfirmWindoOpen,setConfirmWindowOpen]=useState(false);
  const [parameterToBeEdited,setParameterToBeEdited]=useState();

  const [ipDropDownListHTMLSyntax,setIPDropDownListHTMLSyntax]=useState();
  const [selectedIP,setSelectedIP]=useState();
  const [selectedBR,setSelectedBr]=useState();
  const [currentEpoch,setCurrentEpoch]=useState(getCurrentEpochNumber());
  const [totalFunds,setTotalFunds]=useState();
  const [broughtADA,setBroughtADA]=useState();

  function redirectTo(page){
    navigate('/'+page);
  }

  useEffect(() => {
    setIPDropDownListHTMLSyntax(constructIPDropDownListHTMLSyntax());
    setCurrentEpoch(getCurrentEpochNumber());
    calculateAccountAnalytics();
  },[])

  useEffect(() => {
    setIPDropDownListHTMLSyntax(constructIPDropDownListHTMLSyntax());
  },[importantTPOsList])

  function calculateAccountAnalytics(){
    
    let buffer1=0,buffer2=0;
    if(accountInfo["UniqueID"]==undefined){

      importantTPOsList?.forEach(ip => {
        buffer1=buffer1+parseInt(ip["TotalMamimumReward"]);
        if(parseInt(ip["EndEpoch"])>currentEpoch)
          buffer2=parseInt(accountInfo["LiveStake"])-parseInt(ip["PoolInitialStake"]);
        else
          buffer2=parseInt(ip["PoolFinalStake"])-parseInt(ip["PoolInitialStake"]);
      });
    }else{
      importantTPOsList?.forEach(ip => {
        buffer1=buffer1+parseInt(ip["RewardsReceived"]);
        buffer2=buffer2+parseInt(ip["BroughtADA"]);
      });
    }
    setTotalFunds(buffer1);
    setBroughtADA(buffer2);
  }

  function constructIPDropDownListHTMLSyntax(){
    
    let htmlBlocks;
    if(accountInfo["UniqueID"]!=undefined){
      if(importantTPOsList === undefined)
        return "";
        
      htmlBlocks = importantTPOsList.map((ip,ipIndex) => (
        <option key={ip['ProgramID']} value={ipIndex}>{ip["ProjectName"]} - {ip['ProgramName']}</option>
      ));
    }else{
      if(importantTPOsList === undefined)
        return "";
      htmlBlocks = importantTPOsList.map((ip,ipIndex) => (
        <option key={ip['ProgramID']} value={ipIndex}>{ip['DisplayName']}</option>
      ));
    }
    setSelectedIP(importantTPOsList[0]);
    
    return(
      <select className='dropdown-type1' id='selected-ip' onChange={() => setSelectedIP(importantTPOsList[document.getElementById('selected-ip').value])}>
        {htmlBlocks}
      </select>
    );
  }

  function handleCopyLink(){
    let affiliateLink="https://affiliate-programs-preview.adalink.io/affiliate-program?linkid="+selectedIP["LinkID"];
    navigator.clipboard.writeText(affiliateLink);
    setMessageWindowContent("Affiliate link copied to clipboard.");
    setMessageWindowButtonText("OK");
    setShowMessageWindow(true);
  }

  async function handleBRRemoval(br){
    //delete br from database
    let response = await fetch('https://adalink.io/api/remove-bonus-request.php?requestID='+br["RequestID"],{cache:'reload'}); 
    //delete br from importantBRList
    let newImportantBRsList = importantBRsList.filter((item) => (item["Request"] ===br["RequestID"]));
    setImportantBRsList(newImportantBRsList);
    
  }

  return (
    <div className="home">
      <div className="container">
        <div style={{height:"4rem"}}></div>
        {accountInfo===undefined?
        <>
        {redirectTo('')}
        </>
        :
        <>
        <div className='profile-section'>
          <div className='section-title'>
            <div>Account Info</div>
            <div style={{flex:2}} ><hr/></div>
          </div>
          <div className='account-info-section'>
              <div className='account-info-text'>
                <div className='account-info-parameter-section'>
                  <div>Display Name:</div>
                  <div>{accountInfo["DisplayName"]}</div>
                  <img className='account-info-parameter-edit-icon' src={editIcon} onClick={() => {setParameterToBeEdited('Display Name');setEditWindowOpen(true)}}/>
                </div>
                {accountInfo["Description"]!=undefined?
                <>
                <div className='account-info-parameter-section'>
                  <div>Project ID:</div>
                  <div>{accountInfo["UniqueID"]}</div>
                </div>                
                <div className='account-info-parameter-section'>
                  <div>Project Type:</div>
                  <div>{accountInfo["Type"]}</div>
                </div>
                <div className='account-info-parameter-section'>
                  <div>Description:</div>
                  <div>{accountInfo["Description"]}</div>
                  <img className='account-info-parameter-edit-icon' src={editIcon} onClick={() => {setParameterToBeEdited('Description');setEditWindowOpen(true)}}/>
                </div>
                </>
                :
                <>
                <div className='account-info-parameter-section'>
                  <div>Affiliate ID:</div>
                  <div>{accountInfo["UniqueID"]}</div>
                </div>
                </>}
                <div className='account-info-parameter-section'>
                  <div>Website:</div>
                  <div>{accountInfo["Website"]}</div>
                  <img className='account-info-parameter-edit-icon' src={editIcon} onClick={() => {setParameterToBeEdited('Website');setEditWindowOpen(true)}}/>
                </div>
                <div className='account-info-parameter-section'>
                  <div>Social Link:</div>
                  <div>{accountInfo["SocialLink"]}</div>
                  <img className='account-info-parameter-edit-icon' src={editIcon} onClick={() => {setParameterToBeEdited('Social Link');setEditWindowOpen(true)}}/>
                </div>
              </div>
            <div className='account-info-pfp-container'>
              <img className='account-info-pfp' src={accountInfo["PFP"]}/>
            </div>
          </div>
        </div>
        {accountInfo["Description"]!=undefined?
        <></>
        :
        <></>}
        {accountInfo['Description']!=undefined?
        <></>
        :
        <></>}
        {accountInfo['Description']!=undefined?
        <div className='profile-section'>
          <div className='section-title'>
              <div>Incentive Programs’ Summary</div>
              <div style={{flex:2}} ><hr/></div>
          </div>
          {selectedIP==undefined?
          <div className='incentive-programs-summary-section'>
            No incentive programs are associated with this account.
          </div>
          :
          <div className='incentive-programs-summary-section'>
            <div className='incentive-programs-summary-parameter-section'>
              <div>Incentive Program:</div>
              {ipDropDownListHTMLSyntax}
            </div>
            <div className='incentive-programs-summary-parameter-section'>
              <div>Status:</div>
              <div>{parseInt(Date.now()/1000)<=selectedIP["EndDate"]?"Active":"Ended"}</div>
            </div> 
            <div className='incentive-programs-summary-parameter-section'>
              <div>Start Date:</div>
              <div>{new Date(selectedIP["StartDate"]*1000).toLocaleDateString()}</div>
            </div> 
            <div className='incentive-programs-summary-parameter-section'>
              <div>End Date:</div>
              <div>{new Date(selectedIP["EndDate"]*1000).toLocaleDateString()}</div>
            </div> 
            <div className='incentive-programs-summary-parameter-section'>
              <div>Funds paid:</div>
              <div>{displayNumberInPrettyFormat(selectedIP["ListDuration"]*2)} ₳</div>
            </div>            
          </div>
          }
        </div>
        :
        <div className='profile-section'>
          <div className='section-title'>
              <div>Affiliate Programs’ Summary</div>
              <div style={{flex:2}} ><hr/></div>
          </div>
          {selectedIP==undefined?
          <div className='incentive-programs-summary-section'>
            No incentive programs are associated with this account.
          </div>
          :
          <div className='incentive-programs-summary-section'>
            <div className='incentive-programs-summary-parameter-section'>
              <div>Affiliate Program:</div>
              {ipDropDownListHTMLSyntax}
            </div>
            <div className='incentive-programs-summary-parameter-section'>
              <div>Affiliate Link:</div>
              <div>https://affiliate-programs-preview.adalink.io/affiliate-program?linkid={selectedIP['LinkID']}</div>
              <button className='btnType1' onClick={() => {handleCopyLink()}}>Copy link</button>
            </div>
            <div className='incentive-programs-summary-parameter-section'>
              <div>Status:</div>
              <div>{parseInt(Date.now()/1000)<selectedIP["EndDate"]?"Active":"Ended"}</div>
            </div> 
            <div className='incentive-programs-summary-parameter-section'>
              <div>Start Date:</div>
              <div>{new Date(selectedIP["StartDate"]*1000).toLocaleDateString()}</div>
            </div> 
            <div className='incentive-programs-summary-parameter-section'>
              <div>End Date:</div>
              <div>{new Date(selectedIP["EndDate"]*1000).toLocaleDateString()}</div>
            </div> 
            {/*<div className='incentive-programs-summary-parameter-section'>
              <div>Brought ₳ to Pool During the Program:</div>
              <div>{displayNumberInPrettyFormat(selectedIP["BroughtADA"]/10000000)} ₳</div>
            </div> 
            <div className='incentive-programs-summary-parameter-section'>
              <div>Rewards Received:</div>
              <div>{displayNumberInPrettyFormat(selectedIP["RewardsReceived"]/1000000)} ₳</div>
            </div>*/ }            
          </div>
          }
        </div>}
        </>}
        {accountInfo["ProjectID"]!=undefined?
        <div className='profile-section'>
          <div className='section-title'>
              <div>Bonus Requests</div>
              <div style={{flex:2}} ><hr/></div>
          </div>
          <div className='br-container'>
            <div>
              {importantBRsList.map((br) => (
                <div className='br-item'>
                  <div className='br-details'>
                    <div>Affiliate ID: {br["AffiliateID"]}</div>
                    <div>Affiliate Name: {br["AffiliateDisplayName"]}</div>
                    <div>Campaign Code: {br["StartEpoch"]}-{br["PoolTicker"]}</div>
                  </div>
                  <div className='br-buttons'>
                    <button className='btnType1' onClick={() => {window.open("https://tip-preview.adalink.io/tip?AffEq="+br["AffiliateID"])}}>Tip</button>
                    <button className='btnType1'  onClick={() => {setSelectedBr(br);setConfirmWindowOpen(true)}}>Remove</button>
                  </div>
                </div>))}
            </div>
          </div>
       </div>
       :
       <></>}
        {isEditWindowOpen &&
        <EditWindow
          onClose={() => setEditWindowOpen(false)}
          parameterToBeEdited={parameterToBeEdited}
          accountInfo={accountInfo}
          setAccountInfo={setAccountInfo}
          setMessageWindowContent={setMessageWindowContent}
          setMessageWindowButtonText={setMessageWindowButtonText}
          setShowMessageWindow={setShowMessageWindow}
        />
        }      
        {isConfirmWindoOpen &&
        <ConfirmWindow
          onClose={() => setConfirmWindowOpen(false)}
          onAction={() => handleBRRemoval(selectedBR)}
        />
        }
      </div>
    </div>
  );
}

export default ProfilePage;
