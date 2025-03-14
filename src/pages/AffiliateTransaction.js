/* global BigInt */
import React, { useState,useEffect } from 'react';
import './AffiliateTransaction.css';
import WalletMenu from '../components/WalletMenu';
import PurchaseSummary from '../components/PurchaseSummary';
import { NETWORK,SCRIPT_ADDRESS,stringToHex,displayNumberInPrettyFormat,removePrettyFormat,addHttpsToURL, ENGINE_ADDRESS } from '../Constants';
import {Constr, Data} from 'lucid-cardano';
import loadingIcon from '../assets/images/loading.gif';
import downArrow from '../assets/images/down-arrow.svg';


const queryParameters = new URLSearchParams(window.location.search);
let linkID=queryParameters.get('linkid');
let response,tpoDetails,poolID,affiliateDetails;
let tokenPrice,initialAvailableFunds,currentAvailableFunds;
let tpoID,aid;
if(linkID!==null){

  //link id is TPOID-AID
  let ids = linkID.split('-');
  tpoID = ids[0];
  aid = ids[1];
  let network;
  NETWORK==1?network='mainnet':network='preview';
  response = await fetch('https://adalink.io/api/get-tpo-details.php?network='+network+'&tpoid='+tpoID,{cache:"reload"}); 
  tpoDetails = JSON.parse(await response.text());
  tokenPrice=parseFloat(tpoDetails["Price"]);
  //poolID=ipDetails[0]['PoolID'];
  //affiliateID = ipDetails[0]['AffiliateID'];
  response = await fetch('https://adalink.io/api/get-affiliate-details.php?aid='+aid,{cache:"reload"}); 
  affiliateDetails = JSON.parse(await response.text());
}
let linkDetails;
try{
  linkDetails = JSON.parse(await response.text());
}catch{
  console.log('Could not load linkDetails')
}
let poolTicker,affiliateDisplayName;
if(linkDetails?.length>0){
  poolTicker = linkDetails[0]['TICKER'];
  affiliateDisplayName = linkDetails[1]['DisplayName'];
}

const AffiliateTransaction = ({lucid,setShowMessageWindow,setMessageWindowButtonText,setMessageWindowContent}) => {

  const [buttonText,setButtonText]=useState("Delegate")
  const [isDelegated,setIsDelegated]=useState(false);
  const [isWalletMenuOpen,setWalletMenuOpen]=useState(false);
  
  const [walletAPI,setWalletAPI]=useState();
  const [walletIcon,setWalletIcon]=useState();
  const [walletName,setWalletName]=useState();

  const [adaPriceInUSD,setAdaPriceInUSD] = useState(0); 
  const [tokensAmount,setTokensAmount] = useState(0);
  const [adaAmount,setAdaAmount] = useState(0);

  const [showPurchaseSummary,setShowPruchaseSummary] =useState(false);

  function getSharesAmountFromAdaAmount(adaAmount){
    let tokensAmount = parseFloat(adaAmount)/tokenPrice;
    return tokensAmount.toString();
  }

  function getAdaAmountFromSharesAmount(tokensAmount){
    let adaAmount = tokenPrice*parseFloat(tokensAmount);
    return adaAmount.toString();
  }

  async function fetchAdaPrice(){
    let response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd'); 
    let responseJson = JSON.parse(await response.text());
    let priceFloat = 0;
    if (responseJson['cardano'] != undefined)
        priceFloat = responseJson['cardano']['usd'];
    setAdaPriceInUSD(priceFloat.toFixed(4));
  }

  function getAdaAmountValueInUSD(){
    return (adaPriceInUSD*parseFloat(adaAmount)).toFixed(2).toString();
  }

  useEffect(() => {

    const refreshAdaPrice = setInterval(async () => {
            await fetchAdaPrice();
            //await fetchIPOStatus();
    }
    ,20000);

    return () => {
        clearInterval(refreshAdaPrice);
    };
  }, []);
  
  async function handleButtonClick(){
    if(walletAPI===undefined){
      setWalletMenuOpen(true);
    }else{
      //setButtonText(<img alt='' src={loadingIcon} width={16} style={{verticalAlign:"center"}} />);
      lucid.selectWallet(walletAPI);
      if(await walletAPI.getNetworkId() != NETWORK){
        alert("Incorrect wallet network.");
        return;
      }
      if(adaAmount < 10){
        //alert("Purchase amount must be bigger than 10 ADA");
        setMessageWindowContent("Purchase amount must be bigger than 10 ADA");
        setMessageWindowButtonText("OK");
        setShowMessageWindow(true);
        return;
      }
      if(parseInt(parseFloat(tokensAmount)*Math.pow(10,parseInt(tpoDetails['Decimals'])))>=parseInt(tpoDetails["CurrentTotalFunds"]))
      {
        setMessageWindowContent("Not enough funds in campaign pool, try lower amount.");
        setMessageWindowButtonText("OK");
        setShowMessageWindow(true);
        return;        
      }
      setShowPruchaseSummary(true);

      /*const walletAddress = await lucid.wallet.address();
      let commission = parseInt((parseFloat(adaAmount.toString())*parseFloat(tpoDetails["CommissionRate"])/100*1000000).toString());
      if (commission < 1000000)
        commission = 1000000
      let remainingAdaAmount = adaAmount*1000000 - commission;
      //const rewardAddress = await lucid.wallet.rewardAddress();
      //const walletDelegation = await lucid.wallet.getDelegation();
      //console.log(walletDelegation)
      //console.log(tpoDetails["OfferingID"])
      console.log(affiliateDetails["WalletAddress"])
      const datum = Data.to(new Constr(0, [stringToHex(walletAddress),stringToHex(tpoDetails["OfferingID"]),stringToHex(affiliateDetails['UniqueID'])]));
      let tx ;
      
      tx = await lucid.newTx()
      .payToContract(ENGINE_ADDRESS,{inline:datum},{lovelace:BigInt((remainingAdaAmount+2000000).toString())})
      .payToAddress(SCRIPT_ADDRESS,{lovelace:BigInt("1000000")})
      .payToAddress(affiliateDetails["WalletAddress"],{lovelace:BigInt(commission.toString())})
      .complete();*/
      
      /*try{
        const signedTx = await tx.sign().complete();
        const txHash = await signedTx.submit();
      }catch{
        //setButtonText('Delegate');
        return;
      }*/
      //document.getElementById('delegateBtn').classList.replace('btnType1','staticBtn');
    }
  }

  return (
    <div className="affiliate-transaction-background" >
      <div className='affiliate-transaction-window'>
        <h3>Token Campaign Details</h3>
        <br/>
        <div style={{display:"flex",gap:"30px"}}>
          <div className='sign-up-text-fields-area'>
            {/*<div className='affiliate-link-field'>
              Put in the deisred amount to buy.
            </div>*/}
            <div className='affiliate-link-field'>
              <b>Affiliate</b>: {affiliateDetails['DisplayName']}
            </div>
            <div className='affiliate-link-field'>
              <b>Token Policy ID</b>: {tpoDetails['PolicyID'].substring(0,8)}....{tpoDetails['PolicyID'].substring(tpoDetails['PolicyID'].length-8)}
            </div>
            <div className='affiliate-link-field'>
              <b>Token Name</b>: {tpoDetails['Name']}
            </div>
            <div className='affiliate-link-field'>
              <b>Ticker</b>: {tpoDetails['Ticker']}
            </div>
            <div className='affiliate-link-field'>
              <b>Description</b>: {tpoDetails['Description']}
            </div>
            <div className='affiliate-link-field'>
              <b>URL</b>: {addHttpsToURL(tpoDetails['URL'])}
            </div>
            <div className='affiliate-link-field'>
              <b>Price</b>: {tpoDetails['Price']} ₳/{tpoDetails['Ticker']}
            </div>
            <div className='affiliate-link-field'>
              <b>Remaining Funds in Pool</b>: {displayNumberInPrettyFormat(parseFloat(tpoDetails['CurrentTotalFunds'])/Math.pow(10,parseInt(tpoDetails["Decimals"])))} {tpoDetails["Ticker"]} 
            </div>
          </div>
        </div>
        {/*<div style={{marginTop:"3rem"}}>
          <button className='btnType1' id='delegateBtn' style={{width:"160px"}} onClick={() => {handleButtonClick()}}>{walletAPI===undefined?"Connect wallet":buttonText}</button>
        </div>*/}
      </div>
      <div className="normalText token-buying-window">
        <h3>Token Buying</h3>
        <br/>
        <div style={{textAlign:"left"}}>Token amount</div>
        <input className="token-amount" placeholder="0" name="sharesAmount" id="sharesAmount" onKeyDown={(event) => {if ((!/[0-9.]/.test(event.key)) && (!/[\B]/.test(event.key)) ) {event.preventDefault();}}}
          onChange={() => {
            setTokensAmount(removePrettyFormat(document.getElementById('sharesAmount').value));
            document.getElementById('sharesAmount').value=displayNumberInPrettyFormat(removePrettyFormat(document.getElementById('sharesAmount').value));
            if(document.getElementById('sharesAmount').value!=""){
              setAdaAmount(getAdaAmountFromSharesAmount(removePrettyFormat(document.getElementById('sharesAmount').value)));
                                          document.getElementById('adaAmount').value=displayNumberInPrettyFormat(getAdaAmountFromSharesAmount(removePrettyFormat(document.getElementById('sharesAmount').value)));
            }else{
              document.getElementById('adaAmount').value="";
              setAdaAmount("0");
              setTokensAmount("0");
            }
          }}>
        </input>
        <div style={{textAlign:"center",margin:"12px"}}><img src={downArrow} width="64"/></div>
        <div style={{textAlign:"left"}}>ADA amount</div>
        <input className="ada-amount" placeholder="0" name="adaAmount" id="adaAmount" onKeyDown={(event) => {if ((!/[0-9.]/.test(event.key)) && (!/[\B]/.test(event.key)) ) {event.preventDefault();}}} 
          onChange={() => {
            setAdaAmount(removePrettyFormat(document.getElementById('adaAmount').value));
            document.getElementById('adaAmount').value=displayNumberInPrettyFormat(removePrettyFormat(document.getElementById('adaAmount').value));
            if(document.getElementById('adaAmount').value!=""){
              setTokensAmount(getSharesAmountFromAdaAmount(removePrettyFormat(document.getElementById('adaAmount').value)));
                                                          document.getElementById('sharesAmount').value=displayNumberInPrettyFormat(getSharesAmountFromAdaAmount(removePrettyFormat(document.getElementById('adaAmount').value)));
            }else{
              document.getElementById('sharesAmount').value="";
              setAdaAmount("0");
              setTokensAmount("0");
            }
          }}>
        </input>
        <div style={{textAlign:"left",color:"grey"}}>Value in USD: {displayNumberInPrettyFormat(getAdaAmountValueInUSD())}</div>
        <button className="purchase-button" onClick={() => {handleButtonClick()}/*currentAvailableFunds!=0? setSuccessWindowTrigger(true):setWarningWindowTrigger(true)*/}>Purchase</button>
        <div className='wallet-connect-link' onClick={() => {walletAPI===undefined?setWalletMenuOpen(true):setWalletAPI()}}>{walletAPI===undefined?"Connect Wallet":"Disconnect "+walletName}</div>
      </div>      
      {isWalletMenuOpen &&
      <WalletMenu
        onClose={setWalletMenuOpen}
        setWalletAPI={setWalletAPI}
        setWalletIcon={setWalletIcon}
        setWalletName={setWalletName}
      />
      }
      {showPurchaseSummary &&
      <PurchaseSummary
        onClose={setShowPruchaseSummary}
        tpoDetails={tpoDetails}
        affiliateDetails={affiliateDetails}
        adaAmount={adaAmount}
        tokenAmount={tokensAmount}
        walletAPI={walletAPI}
        lucid={lucid}
        setMessageWindowContent={setMessageWindowContent}
        setShowMessageWindow={setShowMessageWindow}
        setMessageWindowButtonText={setMessageWindowButtonText}
        />
      }
    </div>
  );
};

export default AffiliateTransaction;
