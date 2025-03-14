import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUpWindow.css';
import downArrow from '../assets/images/down-arrow.svg';
import uploadImg from '../assets/images/upload.png';
import infoLogo from "../assets/images/q-mark.png";
import { NETWORK } from '../Constants';


const SignUpWindow = ({ walletAPI,walletName,walletIcon,lucid,openWalletMenu,onClose,setLoggedIn,setAccountInfo,selectedIPID,selectedSPOID,setMessageWindowContent,setMessageWindowButtonText,setShowMessageWindow}) => {

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

    

    let userType = document.getElementById('userType').value;
    let displayName = document.getElementById('dispalyNameInput').value;
    let projectType = document.getElementById('projectTypeR')?.value;
    let projectDescription = document.getElementById('projectDescription')?.value;
    let website = document.getElementById('websiteInput').value;
    let socialLink = document.getElementById('socialLinkInput').value;
    let userPFP = document.getElementById('userPFPInput').files[0];

    setMessageWindowContent("Checking user input...");
    setMessageWindowButtonText('')
    setShowMessageWindow(true);

    if(displayName.replace(/\s/g, "").length<5){
      setMessageWindowContent("Display name has to be longer than 4 charecters.");
      setMessageWindowButtonText('OK');
      setShowMessageWindow(true);
      return;
    }

    if(userPFP===undefined){
      setMessageWindowContent("It is always better to upload a profile picture.");
      setMessageWindowButtonText('OK');
      setShowMessageWindow(true);
      return;
    }

    //exit if user did not permit access or choose wallet
    if(walletAPI===undefined){
      setMessageWindowContent("Please select a wallet");
      setMessageWindowButtonText('OK');
      setShowMessageWindow(true);
      return;
    }
    

    lucid.selectWallet(walletAPI);
    let paymentAddress = await lucid.wallet.address();
    let stakeAddress = await lucid.wallet.rewardAddress();
    let walletNetwork = await walletAPI.getNetworkId();

    //exit if wallet network does not match dapp network
    if(walletNetwork!==NETWORK){
      setMessageWindowContent("Please select correct wallet's network.");
      setMessageWindowButtonText('OK');
      setShowMessageWindow(true);
      return;
    }    


    if(await isAccountRegistered(userType,"stakeAddress",stakeAddress)){
      setMessageWindowContent("Can not create account. This wallet is already associated with an account.");
      setMessageWindowButtonText('OK');
      setShowMessageWindow(true);
      return;
    }    

    //create formData object and populate the account data
    let newAccountData = new FormData();
    newAccountData.append('network',NETWORK);
    newAccountData.append('userType',userType);
    newAccountData.append('displayName',displayName);
    newAccountData.append('projectType',projectType);
    newAccountData.append('projectDescription',projectDescription);
    newAccountData.append('website',website);
    newAccountData.append('socialLink',socialLink);
    newAccountData.append('userPFP',userPFP,userPFP.name);
    newAccountData.append('walletType',walletName);

    newAccountData.append('paymentAddress',paymentAddress);
    newAccountData.append('stakeAddress',stakeAddress);

    //setBufferWindowMessage("Creating account...");
    
    let url="https://adalink.io/api/create-new-account-bz.php";
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
      let response = await fetch('https://adalink.io/api/get-account-info-bz.php?stakeAddress='+stakeAddress,{cache:'reload'}); 
      let accountInfo = JSON.parse(await response.text());
      setAccountInfo(accountInfo);
      setLoggedIn(true);
      setMessageWindowContent("Your account has been created successfully!")
      setMessageWindowButtonText("Ok");
      setShowMessageWindow(true);
      onClose();
      navigate('/profile');
      selectedSPOID="0";
      selectedIPID="0";
    }else{
      //setMessageWindowContent("Unable to create new account.");
      setMessageWindowContent(queryResult);
      setMessageWindowButtonText("Ok");
      setShowMessageWindow(true);
    }
    //await loginToAccount(rewardAddress);

  }

  async function isAccountRegistered(userType,checkWith,checkValue){
        
    let response, accountInfo;
    response = await fetch('https://adalink.io/api/is-account-registered.php?userType='+userType+'&'+checkWith+'='+checkValue); 
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
        <h3>Sign Up</h3>
        <br/>
        <div style={{display:"flex",gap:"30px"}}>
          <div className='sign-up-text-fields-area'>
            <div className='sign-up-text-field'  style={{gap:"21px"}}>
              <div className='sign-up-text-field-title'>User Type
              <a className="qMark"><img src={infoLogo} width="15px" height={"15px"} /><p className="tooltiptext slide-in-fwd-center">{userType=="Project"?"A web3 Project that issued one or more tokens.":"Affiliate is an influencer who works on bringing users to registered projects. For more information read about \"Affiliate Marketing\" concept."}</p></a>
              :
              </div>
              <div className='sign-up-text-field-input' >
                <select id="userType" style={{height:"25px"}} onChange={() => setUserType(document.getElementById("userType").value)}>
                  <option value={"Project"}>Project</option>
                  <option value={"Affiliate"}>Affiliate</option>
                </select>
              </div>
            </div>
            <div className='sign-up-text-field'>
              <div className='sign-up-text-field-title'>Display Name:</div>
              <div className='sign-up-text-field-input' style={{flex:1}}>
                <input type='text' id='dispalyNameInput' style={{width:"100%",height:"20px"}}></input>
              </div>
            </div>
            {userType==="Project"?
            <div className='sign-up-text-field' style={{gap:"16px"}}>
              <div className='sign-up-text-field-title'>Project Type:</div>
              <div className='sign-up-text-field-input' >
                <select id="projectType" style={{height:"25px"}} onChange={() => setProjectType(document.getElementById("projectType").value)}>
                  <option value="DEFI">DEFI</option>
                  <option value="DEPIN">DEPIN</option>
                  <option value="NFT">NFT</option>
                  <option value="DAO">DAO</option>
                  <option value="MEME">MEME</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
            </div>
            :
            <></>}
            {userType==="Project"?
            <div className='sign-up-text-field' style={{gap:"22px",alignItems:"flex-start"}}>
              <div className='sign-up-text-field-title'>Description:</div>
              <div className='sign-up-text-field-input' style={{flex:1}}>
                <textarea id='projectDescription' style={{width:"100%",height:"62px"}}></textarea>
              </div>
            </div>
            :
            <></>}              
            <div className='sign-up-text-field'>
              <div className='sign-up-text-field-title'>Website:</div>
              <div className='sign-up-text-field-input' style={{flex:1}}>
                <input type='text' id='websiteInput' style={{width:"100%",height:"20px"}}></input>
              </div>
            </div>
            <div className='sign-up-text-field'>
              <div className='sign-up-text-field-title'>Social Link:</div>
              <div className='sign-up-text-field-input' style={{flex:1}}>
                <input type='text' id='socialLinkInput' style={{width:"100%",height:"20px"}}></input>
              </div>
            </div>
            <div className='sign-up-text-field' >
              <div className='sign-up-text-field-title'>Wallet:</div>
              <div className='sign-up-text-field-input' >
                <div className='select-wallet-div' style={{height:"25px"}} onClick={() => openWalletMenu("signup")}>
                  {walletAPI !== undefined?
                  <>
                    <img src={walletIcon} alt="" width='16px' height={20}/>
                    <div style={{color:"black"}}>{walletName}</div>
                    <img src={downArrow} alt='' height={5} />
                  </>
                  :
                  <>
                    <div>Select</div>
                    <img src={downArrow} alt='' height={5}/>                  
                  </>
                  }
                </div>
              </div>
            </div>
          </div>
          <div className='sign-up-img-upload'>
            <label>
            <img className='sign-up-img-element' alt='' src={userPFPsrc} width={"100%"}/>
            <input type='file' name='userPFP' style={{display:"none"}} id='userPFPInput' placeholder='' accept='image/png,image/jpeg' 
                        onChange={() => {setUserPFP(document.getElementById('userPFPInput').files[0]);reader.readAsDataURL(document.getElementById('userPFPInput')?.files[0]);}} />
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

export default SignUpWindow;
