import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUpWindow.css';
import downArrow from '../assets/images/down-arrow.svg';
import uploadImg from '../assets/images/upload.png';
import infoLogo from "../assets/images/q-mark.png";
import { NETWORK,stringToHex } from '../Constants';


const TokenMetaEnteringWindow = ({ tokenPolicyID,tokenName,onClose,setMessageWindowContent,setMessageWindowButtonText,setShowMessageWindow}) => {

  const navigate = useNavigate();

  const [userType,setUserType] = useState("Project");
  const [projectType, setProjectType] = useState("DEFI")
  const [userPFP,setUserPFP] = useState();
  const [userPFPsrc,setUserPFPsrc] = useState(uploadImg);

  let reader = new FileReader();
  reader.onload = (e) => {
    setUserPFPsrc(e.target.result);
  };

  const closeWindow = (event) => {
      if(event.target.className.toString()==="backdrop"){ 
        onClose();
    }

  }

  async function handleRegistration() {

    
    //let policyID = document.getElementById('poolIDInput')?.value;
    //let tokenName;
    let tokenDisplayName = document.getElementById('tokenNameInput').value;
    let tokenNameInHex = stringToHex(tokenName);
    let tokenTicker = document.getElementById('tokenTickerInput').value;
    let tokenDecimals = document.getElementById('decimalsInput').value;
    let tokenDescription = document.getElementById('tokenDescription').value;
    let tokenURL = document.getElementById('urlInput').value;
    let tokenPFP = document.getElementById('tokenPFPInput').files[0];

    setMessageWindowContent("Checking user input...");
    setMessageWindowButtonText('')
    setShowMessageWindow(true);

    if(tokenDisplayName.replace(/\s/g, "").length<2){
      setMessageWindowContent("Display name has to be longer than 1 charecters.");
      setMessageWindowButtonText('OK');
      setShowMessageWindow(true);
      return;
    }

    if(userPFP===undefined){
      setMessageWindowContent("It is always better to upload a token logo.");
      setMessageWindowButtonText('OK');
      setShowMessageWindow(true);
      return;
    }

    //create formData object and populate the account data
    let newAccountData = new FormData();
    newAccountData.append('tokenPolicyID',tokenPolicyID);
    newAccountData.append('tokenName',tokenName);
    newAccountData.append('tokenNameInHex',tokenNameInHex);
    newAccountData.append('tokenDisplayName',tokenDisplayName);
    newAccountData.append('tokenTicker',tokenTicker);
    newAccountData.append('tokenDecimals',tokenDecimals);
    newAccountData.append('tokenDescription',tokenDescription);
    newAccountData.append('tokenURL',tokenURL);
    newAccountData.append('tokenPFP',tokenPFP,tokenPFP.name);


    //setBufferWindowMessage("Creating account...");
    
    let url="https://adalink.io/api/register-new-token.php";
    let queryResponse = await fetch(url, {
        method: 'POST', 
        mode: 'cors', 
        cache: 'no-cache', 
        credentials: 'same-origin', 
        
        redirect: 'follow',
        referrerPolicy: 'no-referrer', 
        body: newAccountData // string variable
      });

    let queryResult=await queryResponse.text();
    //console.log(await queryResponse.text());
    
    if(queryResult==="New record created successfully"){
      setMessageWindowContent("Token metadata has been registered successfully!")
      setMessageWindowButtonText("Ok");
      setShowMessageWindow(true);
      onClose();
    }else{
      //setMessageWindowContent("Unable to create new account.");
      setMessageWindowContent(queryResult);
      setMessageWindowButtonText("Ok");
      setShowMessageWindow(true);
    }
    //await loginToAccount(rewardAddress);

  }

  async function isTokenRegistered(userType,checkWith,checkValue){
        
    let response, accountInfo;
    response = await fetch('https://adalink.io/api/is-token-registered.php?userType='+userType+'&'+checkWith+'='+checkValue); 
    accountInfo = JSON.parse(await response.text());
    
    if(accountInfo=="-1"){
        return false;
    }
    else
        return true;
  }


  return (
    <div className="backdrop" onClick={closeWindow}>
      <div className='signup-menu'>
        <h3>Registering Token's Metadata</h3>
        <br/>
        <div style={{display:"flex",gap:"30px"}}>
          <div className='sign-up-text-fields-area'>
            <div className='sign-up-text-field'>
              <div className='sign-up-text-field-title'>Token Name:</div>
              <div className='sign-up-text-field-input' style={{flex:1}}>
                <input type='text' id='tokenNameInput' style={{width:"100%",height:"20px"}}></input>
              </div>
            </div>
            <div className='sign-up-text-field'>
              <div className='sign-up-text-field-title'>Ticker:</div>
              <div className='sign-up-text-field-input' style={{flex:1}}>
                <input type='text' id='tokenTickerInput' style={{width:"100%",height:"20px"}}></input>
              </div>
            </div>
            <div className='sign-up-text-field'>
              <div className='sign-up-text-field-title'>Decimals:</div>
              <div className='sign-up-text-field-input' style={{flex:1}}>
                <input type='number' step="1" id='decimalsInput' style={{width:"100%",height:"20px"}} min="0" max="10" onKeyDown={(event) => {if (event.key === '.' || event.key === '-' || event.key === '+') event.preventDefault();}}></input>
              </div>
            </div>
            <div className='sign-up-text-field' style={{gap:"22px",alignItems:"flex-start"}}>
              <div className='sign-up-text-field-title'>Description:</div>
              <div className='sign-up-text-field-input' style={{flex:1}}>
                <textarea id='tokenDescription' style={{width:"100%",height:"62px"}}></textarea>
              </div>
            </div>
            <div className='sign-up-text-field'>
              <div className='sign-up-text-field-title'>Website:</div>
              <div className='sign-up-text-field-input' style={{flex:1}}>
                <input type='text' id='urlInput' style={{width:"100%",height:"20px"}}></input>
              </div>
            </div>
          </div>
          <div className='sign-up-img-upload'>
            <label>
            <img className='sign-up-img-element' alt='' src={userPFPsrc} width={"100%"}/>
            <input type='file' name='userPFP' style={{display:"none"}} id='tokenPFPInput' placeholder='' accept='image/png,image/jpeg' 
                        onChange={() => {setUserPFP(document.getElementById('tokenPFPInput').files[0]);reader.readAsDataURL(document.getElementById('tokenPFPInput')?.files[0]);}} />
            </label>
          </div>
        </div>
        <div style={{textAlign:"right",marginTop:"2rem"}}>
          <button className='btnType1' style={{width:"120px"}} onClick={async () => await handleRegistration()}>Register</button>
        </div>
      </div>
    </div>
  );
};

export default TokenMetaEnteringWindow;
