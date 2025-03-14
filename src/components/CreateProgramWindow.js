/* global BigInt */
import React, { useEffect, useState } from 'react';
import {Constr, Data, toHex,fromHex} from 'lucid-cardano';
import './SignUpWindow.css';
import './CreateProgramWindow.css';
import downArrow from '../assets/images/down-arrow.svg';
import infoLogo from '../assets/images/q-mark.png';
import {SCRIPT_ADDRESS,stringToHex,getCurrentEpochNumber,displayNumberInPrettyFormat,removePrettyFormat} from '../Constants';


const CreateProgramWindow = ({ walletAPI,walletName,walletIcon,lucid,openWalletMenu,onClose,setLoggedIn,accountInfo,setMessageWindowContent,setMessageWindowButtonText,setShowMessageWindow,setTakeActionMessage,setTakeActionMethod,setTakeActionWindowOpen,setTokenMetaEnteringWindowOpen,setTokenOfferingSummary,setTokenOfferingSummaryWindowOpen}) => {


  const closeWindow = (event) => {
      if(event.target.className.toString()==="backdrop"){ 
        onClose();
    }
  }

  //get current epoch number
  let currentEpoch = getCurrentEpochNumber();
  //

  const [startEpoch,setStartEpoch]=useState(currentEpoch);
  const [endEpoch,setEndEpoch]=useState(currentEpoch+1);
  const [durationType, setDurationType] = useState("Time");
  const [endAfter,setEndAfter]=useState("7");

  const [saturationTarget,setSaturationTarget]=useState((100+Math.ceil(accountInfo['Saturation']*100))/2);

  

  function updateProgramParametersGivenMaximumRewardPerEpoch(){
    let startEpoch=document.getElementById('startEpoch').value;
    let endEpoch=document.getElementById('endEpoch').value;
    let maximumRewardPerEpoch= document?.getElementById('maximumRewardPerEpoch').value;
    let totalMaximumRewards,rewardRate;
    if(maximumRewardPerEpoch == ''){
      //maximumRewardPerEpoch = 0;
      document.getElementById('totalMaximumRewards').value= '';
      document.getElementById('rewardRate').value= '';
      return;
    }
    maximumRewardPerEpoch = removePrettyFormat(maximumRewardPerEpoch);
    totalMaximumRewards = maximumRewardPerEpoch * (endEpoch-startEpoch);
    let saturationTarget=document.getElementById('saturationTargetSlider').value/100;
    rewardRate = totalMaximumRewards / ((accountInfo['LiveStake']/1000000/accountInfo['Saturation']*saturationTarget)*(1-accountInfo['Saturation']));
    //rewardRate = totalMaximumRewards / ((accountInfo['LiveStake']/1000000)*(1/accountInfo['Saturation']-1));
    document.getElementById('totalMaximumRewards').value= displayNumberInPrettyFormat(totalMaximumRewards);
    if(rewardRate<0.000001)
      document.getElementById('rewardRate').value=0;
    else
      document.getElementById('rewardRate').value= displayNumberInPrettyFormat(rewardRate);
    
  }
  function updateProgramParametersGivenTotalMaximumReward(){
    let startEpoch=document.getElementById('startEpoch').value;
    let endEpoch=document.getElementById('endEpoch').value; 
    let totalMaximumRewards= document?.getElementById('totalMaximumRewards').value;
    let maximumRewardPerEpoch,rewardRate;
    if(totalMaximumRewards == ''){
      //maximumRewardPerEpoch = 0;
      document.getElementById('maximumRewardPerEpoch').value= '';
      document.getElementById('rewardRate').value= '';
      return;
    }
    totalMaximumRewards = removePrettyFormat(totalMaximumRewards);
    maximumRewardPerEpoch = totalMaximumRewards / (endEpoch-startEpoch);
    let saturationTarget=document.getElementById('saturationTargetSlider').value/100;
    rewardRate = totalMaximumRewards / ((accountInfo['LiveStake']/1000000/accountInfo['Saturation']*saturationTarget)*(1-accountInfo['Saturation']));
    //rewardRate = totalMaximumRewards / ((accountInfo['LiveStake']/1000000)*(1/accountInfo['Saturation']-1));
    document.getElementById('maximumRewardPerEpoch').value= displayNumberInPrettyFormat(maximumRewardPerEpoch);
    if(rewardRate<0.000001)
      document.getElementById('rewardRate').value=0;
    else
      document.getElementById('rewardRate').value= displayNumberInPrettyFormat(rewardRate);
    
  }
  function updateProgramParametersGivenRewardRate(){
    let startEpoch=document.getElementById('startEpoch').value;
    let endEpoch=document.getElementById('endEpoch').value; 
    let rewardRate= document?.getElementById('rewardRate').value;
    let maximumRewardPerEpoch,totalMaximumRewards;
    if(rewardRate == ''){
      //maximumRewardPerEpoch = 0;
      document.getElementById('maximumRewardPerEpoch').value= '';
      document.getElementById('totalMaximumRewards').value= '';
      return;
    }
    rewardRate = removePrettyFormat(rewardRate);
    let saturationTarget=document.getElementById('saturationTargetSlider').value/100;
    //let rewardRate = totalMaximumRewards / ((accountInfo['LiveStake']/1000000/accountInfo['Saturation']*saturationTarget)*(1-accountInfo['Saturation']));
    totalMaximumRewards = rewardRate * ((accountInfo['LiveStake']/1000000/accountInfo['Saturation']*saturationTarget)*(1-accountInfo['Saturation']));
    maximumRewardPerEpoch = totalMaximumRewards / (endEpoch-startEpoch);
    document.getElementById('maximumRewardPerEpoch').value= displayNumberInPrettyFormat(maximumRewardPerEpoch);
    document.getElementById('totalMaximumRewards').value= displayNumberInPrettyFormat(totalMaximumRewards);
  }
  function updateProgramParametersGivenStartEpoch(){
    let startEpoch=document.getElementById('startEpoch').value;
    let endEpoch=document.getElementById('endEpoch').value;
    let maximumRewardPerEpoch= document?.getElementById('maximumRewardPerEpoch').value;
    let totalMaximumRewards,rewardRate;
    if(maximumRewardPerEpoch == ''){
      //maximumRewardPerEpoch = 0;
      document.getElementById('totalMaximumRewards').value= '';
      document.getElementById('rewardRate').value= '';
      return;
    }
    maximumRewardPerEpoch = removePrettyFormat(maximumRewardPerEpoch);
    totalMaximumRewards = maximumRewardPerEpoch * (endEpoch-startEpoch);
    //rewardRate = totalMaximumRewards / ((accountInfo['LiveStake']/1000000)*(1/accountInfo['Saturation']-1));
    let saturationTarget=document.getElementById('saturationTargetSlider').value/100;
    rewardRate = totalMaximumRewards / ((accountInfo['LiveStake']/1000000/accountInfo['Saturation']*saturationTarget)*(1-accountInfo['Saturation']));
    document.getElementById('totalMaximumRewards').value= displayNumberInPrettyFormat(totalMaximumRewards);
    if(rewardRate<0.000001)
      document.getElementById('rewardRate').value=0;
    else
      document.getElementById('rewardRate').value= displayNumberInPrettyFormat(rewardRate);
  }
  function updateRewardRateGivenSaturationTarget(){
    
    let totalMaximumRewards = removePrettyFormat(document.getElementById('totalMaximumRewards')?.value);
    let saturationTarget=document.getElementById('saturationTargetSlider').value/100;
    let rewardRate = totalMaximumRewards / ((accountInfo['LiveStake']/1000000/accountInfo['Saturation']*saturationTarget)*(1-accountInfo['Saturation']));
    //let rewardRate = totalMaximumRewards / ((accountInfo['LiveStake']/1000000)*(1/accountInfo['Saturation']-1));

    if(rewardRate<0.000001)
      document.getElementById('rewardRate').value=0;
    else
      document.getElementById('rewardRate').value= displayNumberInPrettyFormat(rewardRate);
  }

  async function getTokenMetadataFromCardanoTokenRegistry(tokenSignature){

    let response = await fetch("https://tokens.cardano.org/metadata/"+tokenSignature,{cache:'reload'});
    console.log(response.status);
    let responseInfo;
    if (response.status == 200)
      responseInfo = JSON.parse(await response.text())
    return responseInfo;

  }

  async function getTokenMetadataFromLocalTokenRegistry(tokenSignature){

    let response = await fetch("https://adalink.io/api/get-token-metadata.php?tokenSignature="+tokenSignature,{cache:'reload'});
    //console.log(response.status);
    let responseInfo;
    responseInfo = JSON.parse(await response.text())
    return responseInfo;
  }

  async function handleProgramLaunch() {

    let durationType = document.getElementById('durationType').value;
    let endAfter=0;
    if (durationType=="Time")
      endAfter = parseInt(document.getElementById('endAfter').value);
    let tokenPolicyID = document.getElementById('tokenPolicyID').value;
    let tokenName = document.getElementById('tokenName').value;
    let tokenNameInHex = stringToHex(tokenName);
    let commissionRate = removePrettyFormat(document.getElementById('commissionRate')?.value);
    let totalFunds = removePrettyFormat(document.getElementById('totalFunds')?.value);
    let tokenPrice = removePrettyFormat(document.getElementById('tokenPrice')?.value);

    setMessageWindowContent("Checking user input...");
    setMessageWindowButtonText('')
    setShowMessageWindow(true);

    if(tokenPolicyID == '' || commissionRate == '' || totalFunds == '' || tokenPrice == ''){
      setMessageWindowContent("Please specify token campaign details.");
      setMessageWindowButtonText('OK');
      setShowMessageWindow(true);
      return;
    }

    let tokenSignature = tokenPolicyID+tokenNameInHex;
    let tokenMetadataSource = "cardano";
    //get token metadata from cardano token registry
    let tokenMetadata;
    tokenMetadata = await getTokenMetadataFromCardanoTokenRegistry(tokenSignature);
    console.log(tokenMetadata)
    if (tokenMetadata===undefined){
      tokenMetadata = await getTokenMetadataFromLocalTokenRegistry(tokenSignature);
      tokenMetadataSource = "adalink";
    }
    if (tokenMetadata===undefined || tokenMetadata === null){
      setShowMessageWindow(false)
      setTakeActionMessage("No records in Cardano's Token Registry for this token. Would you like to enter token meta manually?");
      setTakeActionMethod(() => (a) => {setTokenMetaEnteringWindowOpen(a);});
      setTokenOfferingSummary({tokenPolicyID:tokenPolicyID,tokenName:tokenName})
      setTakeActionWindowOpen(true);
      return; 
    }
    else {
      console.log("tokenMetadata")
      console.log(tokenMetadata)
      if(tokenMetadataSource=="cardano")
        setTokenOfferingSummary({metadataSource:"cardano",
          signature:tokenSignature,
          policyID:tokenPolicyID,
          tokenName:tokenMetadata.name.value,
          description:tokenMetadata.description.value,
          url:tokenMetadata.url.value,
          ticker:tokenMetadata.ticker.value,
          decimals:tokenMetadata.decimals.value,
          logo:tokenMetadata.logo.value,
          price:tokenPrice,
          totalFunds:totalFunds,
          commissionRate:commissionRate,
          durationType:durationType,
          endAfter:endAfter});
      else
        setTokenOfferingSummary({metadataSource:"adalink",
          signature:tokenSignature,
          policyID:tokenPolicyID,
          tokenName:tokenMetadata.Name,
          description:tokenMetadata.Description,
          url:tokenMetadata.URL,
          ticker:tokenMetadata.Ticker,
          decimals:tokenMetadata.Decimals,
          logo:tokenMetadata.Logo,
          price:tokenPrice,
          totalFunds:totalFunds,
          commissionRate:commissionRate,
          durationType:durationType,
          endAfter:endAfter});
      
      setTokenOfferingSummaryWindowOpen(true);
      setShowMessageWindow(false);
      onClose();
      return;
    }
    console.log(tokenMetadata);
    return;
    //exit if user did not permit access or choose wallet
    if(walletAPI===undefined){
      setMessageWindowContent("Please select a wallet");
      setMessageWindowButtonText('OK');
      setShowMessageWindow(true);
      return;
    }

    if(await doesTokenHaveActiveOffering(tokenPolicyID,tokenNameInHex)){
      setMessageWindowContent("Can not launch campaign. This token already has an ongoing campaign.");
      setMessageWindowButtonText('OK');
      setShowMessageWindow(true);
      return;
    }

    lucid.selectWallet(walletAPI);
    const publicKeyHash = lucid.utils.getAddressDetails(
      await lucid.wallet.address()
    ).paymentCredential?.hash;
    //let paymentAddress = await lucid.wallet.address();
    //let stakeAddress = await lucid.wallet.rewardAddress();

    //calculate target stake 
    //const datum = Data.to(new Constr(0, [publicKeyHash,stringToHex(accountInfo['PoolID']),BigInt(startEpoch),BigInt(endEpoch),BigInt(parseInt(maximumRewardPerEpoch*1000000)),BigInt(parseInt(rewardRate*1000000)),BigInt(parseInt(totalMaximumRewards*1000000)),BigInt(accountInfo['LiveStake']),BigInt(stakeTarget)]));
    
    let tx = lucid.newTx();
    //add 2.5 ada per epoch for adalink and tx fees
    let adalinkFees = 300000000n;
    if (endAfter>0)
      adalinkFees = BigInt(endAfter*1000000);
    //tx.payToContract(SCRIPT_ADDRESS,{inline : datum},{lovelace: BigInt(parseInt(totalMaximumRewards*1000000+adalinkFees))});
    tx.payToAddress(SCRIPT_ADDRESS,{lovelace:2000000n,[tokenSignature]:totalFunds})
    tx.payToAddress(SCRIPT_ADDRESS,{lovelace:adalinkFees})
    try{
      tx = await tx.complete();
    }catch(e){
      setMessageWindowContent(e);
      setMessageWindowButtonText("Ok");
      setShowMessageWindow(true);
      return;
    }

    try{
      const signedTx = await tx.sign().complete();
      const txHash = await signedTx.submit();
      setMessageWindowContent(<><div>Token campaign has been launched successfully!</div><br/><div style={{textAlign:"left",fontSize:"13px",paddingLeft:"1.2rem"}}>Token campaign will be automatically displayed as soon as the transaction is confirmed on chain.</div></>)
      setMessageWindowButtonText("Ok");
      setShowMessageWindow(true);
      onClose();
      return;      
    }catch{
      setMessageWindowContent("User declined transaction.")
      setMessageWindowButtonText("Ok");
      setShowMessageWindow(true);
      return;
    }


  }

  async function doesTokenHaveActiveOffering(poolID){
        
    return false;
    let response, responseInfo;
    response = await fetch('https://adalink.io/api/does-pool-have-active-program.php?poolID='+poolID+'&startEpoch='+currentEpoch,{cache:'reload'}); 
    responseInfo = JSON.parse(await response.text());
    
    if(responseInfo=="-1"){
        return false;
    }
    else
        return true;
  }

  /*
            <div className='sign-up-text-field' >
              <div className='sign-up-text-field-title'>Duration Type:</div>
              <div className='sign-up-text-field-input' >
                <select id="durationType" style={{height:"25px"}} 
                  onChange={() => {
                    setDurationType(document.getElementById('durationType').value);
                  }}>
                  <option value={"Time"}>{"Time Specific"}</option>
                  <option value={"Fund"}>{"Fund Specific"}</option>
                </select>
              </div>
            </div>
  */

  return (
    <div className="backdrop" onClick={closeWindow}>
      <div className='token-launch-menu'>
        <h3>New Token Campaign</h3>
        <br/>
        <div style={{display:"flex",gap:"30px"}}>
          <div className='sign-up-text-fields-area'>

            {durationType=="Time"?
              <div className='sign-up-text-field'>
                <div className='sign-up-text-field-title'>End after:</div>
                <div className='sign-up-text-field-input' >
                  <select id="endAfter" style={{height:"25px"}} 
                    onChange={() => {
                      /*setEndEpoch(document.getElementById('endEpoch').value);
                      if(document.getElementById('startEpoch').value>=document.getElementById('endEpoch').value){
                        document.getElementById('startEpoch').value=parseInt(document.getElementById('endEpoch').value)-1;
                        setStartEpoch(document.getElementById('startEpoch').value);
                      }
                      updateProgramParametersGivenStartEpoch();  */                  
                    }}>
                    <option value={"7"}>{"1 week"}</option>
                    <option value={"30"}>{"1 month"}</option>
                    <option value={"91"}>{"3 months"}</option>
                    <option value={"183"}>{"6 months"}</option>
                    <option value={"365"}>{"1 year"}</option>
                  </select>
                </div>
              </div>
              :
              <div className='sign-up-text-field' style={{textAlign:"left",fontSize:"12px"}}>
                *Token campaign will automatically conclude when all funds are purchased.
              </div>
            }
            <div className='token-launch-text-field'>
              <div className='sign-up-text-field-title'>Token policy ID:</div>
              <div className='sign-up-text-field-input' style={{flex:1}}>
                <input type='text' id='tokenPolicyID' style={{width:"100%",height:"20px"}}
                  
                />
              </div>
            </div>
            <div className='token-launch-text-field'>
              <div className='sign-up-text-field-title'>Token name on-chain:</div>
              <a className="qMark"><img src={infoLogo} width="15px" height={"15px"} /><p className="tooltiptext slide-in-fwd-center">{"Make sure this corresponds exactly to the token name when the token was minted on-chain."}</p></a>
              <div className='sign-up-text-field-input' style={{flex:1}}>
                <input type='text' id='tokenName' style={{width:"100%",height:"20px"}}
                  
                />
              </div>
            </div>
            <div className='token-launch-text-field'>
              <div className='sign-up-text-field-title'>Token price:</div>
              <div className='sign-up-text-field-input' style={{flex:1}}>
                <input type='text' id='tokenPrice' style={{width:"100%",height:"20px"}}
                  onKeyDown={(event) => {
                    if ((!/[0-9.]/.test(event.key)) && (!/[\B]/.test(event.key)) && event.key != 'ArrowLeft' && event.key != 'ArrowRight' ) {
                      event.preventDefault();
                    }
                    if (event.key == '.' && document.getElementById('tokenPrice').value.split(".").length>1){
                      event.preventDefault();
                    }
                  }}
                  onChange={() => {
                    document.getElementById('tokenPrice').value=displayNumberInPrettyFormat(removePrettyFormat(document.getElementById('tokenPrice').value));
                    //updateProgramParametersGivenMaximumRewardPerEpoch();
                  }}
                />
              </div>
              <div style={{paddingLeft:"5px"}}>₳/ Token</div>
            </div>
            <div className='token-launch-text-field'>
              <div className='sign-up-text-field-title'>Total funds to be deposited:</div>
              <div className='sign-up-text-field-input' style={{flex:1}}>
                <input type='text' id='totalFunds' style={{width:"100%",height:"20px"}}
                  onKeyDown={(event) => {
                    if ((!/[0-9.]/.test(event.key)) && (!/[\B]/.test(event.key)) && event.key != 'ArrowLeft' && event.key != 'ArrowRight' ) {
                      event.preventDefault();
                    }
                    if (event.key == '.' && document.getElementById('totalFunds').value.split(".").length>1){
                      event.preventDefault();
                    }
                  }}                
                  onChange={() => {
                    document.getElementById('totalFunds').value=displayNumberInPrettyFormat(removePrettyFormat(document.getElementById('totalFunds').value));
                    //updateProgramParametersGivenTotalMaximumReward();                    
                  }}
                />
              </div>
              <div style={{paddingLeft:"5px"}}>Tokens</div>
            </div>
            <div className='token-launch-text-field' style={{width:"264px"}}>
              <div className='sign-up-text-field-title'>Affiliates commission:</div>
              <a className="qMark"><img src={infoLogo} width="15px" height={"15px"} /><p className="tooltiptext slide-in-fwd-center">{"Percentage of each purchase that goes to the affiliate. If the commission is less than 1 ₳, it will be rounded up to 1 ₳ for each transaction."}</p></a>
              <div className='sign-up-text-field-input' style={{flex:1}}>
                <input type='text' id='commissionRate' style={{width:"100%",height:"20px"}}
                  onKeyDown={(event) => {
                    if ((!/[0-9.]/.test(event.key)) && (!/[\B]/.test(event.key)) && event.key != 'ArrowLeft' && event.key != 'ArrowRight' ) {
                      event.preventDefault();
                    }
                    if (event.key == '.' && document.getElementById('commissionRate').value.split(".").length>1){
                      event.preventDefault();
                    }
                    
                  }}
                  onChange={() => {
                    document.getElementById('commissionRate').value=displayNumberInPrettyFormat(removePrettyFormat(document.getElementById('commissionRate').value));
                    //updateProgramParametersGivenMaximumRewardPerEpoch();
                  }}
                />
              </div>
              <div style={{paddingLeft:"5px"}}>%</div>
            </div>
          </div>
        </div>
        <div style={{textAlign:"right",marginTop:"2rem"}}>
          <button className='btnType1' style={{width:"120px"}} onClick={async () => await handleProgramLaunch()}>Launch</button>
        </div>
      </div>
    </div>
  );
};

export default CreateProgramWindow;
