/* global BigInt */
import React, { useRef, useEffect } from 'react';
import { Constr, Data } from 'lucid-cardano';
import {displayNumberInPrettyFormat,displayNumberInPrettierFormat, FEE_ADDRESS,stringToHex} from '../Constants';
import './TokenOfferingSummary.css';
import { SCRIPT_ADDRESS,NETWORK } from '../Constants';

const TokenOfferingSummary = ({ tokenOfferingSummary,walletAPI,lucid,onClose,accountInfo,setMessageWindowContent,setMessageWindowButtonText,setShowMessageWindow }) => {
  const orderSummaryRef = useRef();
  let averagePrice;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (orderSummaryRef.current && !orderSummaryRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);


  async function listTokenOffering(txHash,offeringID,adalinkFees){
    console.log(accountInfo)
    //create formData object and populate the account data
    let newOfferingData = new FormData();
    newOfferingData.append('network',NETWORK==0?"preview":"mainnet");
    newOfferingData.append('tokenSignature',tokenOfferingSummary.signature);
    newOfferingData.append('txHash',txHash);
    newOfferingData.append('offeringID',offeringID);
    newOfferingData.append('metadataSource',tokenOfferingSummary.metadataSource);
    newOfferingData.append('tokenPolicyID',tokenOfferingSummary.policyID);
    newOfferingData.append('tokenName',tokenOfferingSummary.tokenName);
    newOfferingData.append('tokenTicker',tokenOfferingSummary.ticker);
    newOfferingData.append('tokenDecimals',tokenOfferingSummary.decimals);
    newOfferingData.append('tokenDescription',tokenOfferingSummary.description);
    newOfferingData.append('tokenURL',tokenOfferingSummary.url);
    newOfferingData.append('tokenLogo',tokenOfferingSummary.logo);

    newOfferingData.append('tokenPrice',tokenOfferingSummary.price);
    newOfferingData.append('initialTotalFunds',tokenOfferingSummary.totalFunds);
    newOfferingData.append('currentTotalFunds',tokenOfferingSummary.totalFunds);
    newOfferingData.append('commissionRate',tokenOfferingSummary.commissionRate);
    newOfferingData.append('durationType',tokenOfferingSummary.durationType);
    newOfferingData.append('projectID',accountInfo['ProjectID']);
    newOfferingData.append('listingCost',adalinkFees);
    newOfferingData.append('endAfter',parseInt(Date.now()/1000+tokenOfferingSummary.endAfter*24*60*60));

    //setBufferWindowMessage("Creating account...");
    
    let url="https://adalink.io/api/list-new-token-offering.php";
    let queryResponse = await fetch(url, {
        method: 'POST', 
        mode: 'cors', 
        cache: 'no-cache', 
        credentials: 'same-origin', 
        
        redirect: 'follow',
        referrerPolicy: 'no-referrer', 
        body: newOfferingData // string variable
      });

    let queryResult=await queryResponse.text();
    console.log(queryResponse)
    console.log(queryResult)
  }
  
  async function handleOfferingLaunch(){


    //waiting user confirmation
    setMessageWindowContent("Waiting user confirmation...");
    setMessageWindowButtonText("");
    setShowMessageWindow(true);

    //check if token has an ongoing offering
    /*if(await doesTokenHaveActiveOffering(tokenPolicyID,tokenNameInHex)){
      setMessageWindowContent("Can not launch offering. This token already has an ongoing offering.");
      setMessageWindowButtonText('OK');
      setShowMessageWindow(true);
      return;
    }*/
    
    let adalinkFees = 400000000n;
    if (tokenOfferingSummary.durationType == "Time"){
      adalinkFees = 100000000n + BigInt(parseInt(tokenOfferingSummary.endAfter)*1000000);
    }
    

    lucid.selectWallet(walletAPI);
    /*const publicKeyHash = lucid.utils.getAddressDetails(
      await lucid.wallet.address()
    ).paymentCredential?.hash;*/
    let currentTimeStamp = parseInt(Date.now()/1000).toString();
    let offeringID =  tokenOfferingSummary.signature.substring(0,5).toUpperCase()+"-"+accountInfo['ProjectID']+"-"+currentTimeStamp.substring(currentTimeStamp.length-5);
    const datum = Data.to(new Constr(0, [stringToHex(offeringID)]));
    let tx = lucid.newTx();

    tx.payToContract(SCRIPT_ADDRESS,{inline : datum},{lovelace:2000000n,[tokenOfferingSummary.signature]:BigInt(tokenOfferingSummary.totalFunds)})
    tx.payToAddress(FEE_ADDRESS,{lovelace:adalinkFees})

    try{
      tx = await tx.complete();
    }catch(e){
      console.log(e)
      setMessageWindowContent(e);
      setMessageWindowButtonText("Ok");
      setShowMessageWindow(true);
      return;
    }
    try{
      const signedTx = await tx.sign().complete();
      const txHash = await signedTx.submit();
      //let txHash= "abcdef123456789abcdef123456789abcdef123456789"
      
      await listTokenOffering(txHash,offeringID,adalinkFees);
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

  return (
    <div className="order-summary-container">
      <div className="order-summary" ref={orderSummaryRef}>
        <div className="close-button" onClick={onClose}>
            X
        </div>
        <div className="order-summary-header">
          <h2>Token Campaign Summary</h2>
        </div>
        <div className="order-summary-content">
          <div className='item-container'><div>Token Name:</div> <div>{tokenOfferingSummary.tokenName}</div></div>
          <div className='item-container'><div>Ticker:</div> <div>{tokenOfferingSummary.ticker}</div></div>
          
          <div className='item-container'><div>Logo:</div> <div><img width={20} src={tokenOfferingSummary.metadataSource=="cardano"?"data:image/png;base64, "+tokenOfferingSummary.logo:tokenOfferingSummary.logo} /></div></div>
          
          <div className='item-container'><div>Duration Time:</div> <div>{tokenOfferingSummary.durationType=="Time"?tokenOfferingSummary.endAfter+" Days":"Until funds are purchased"}</div></div>
          <div className='item-container'><div>Price:</div> <div>{displayNumberInPrettierFormat(tokenOfferingSummary.price)} ₳/{tokenOfferingSummary.ticker}</div></div> 
          <div className='item-container'><div>Total Funds:</div> <div>{displayNumberInPrettierFormat(tokenOfferingSummary.totalFunds)} {tokenOfferingSummary.ticker}</div></div> 
          <div className='item-container'><div>Affiliates' Commission Rate:</div> <div>{displayNumberInPrettierFormat(tokenOfferingSummary.commissionRate)}% </div></div> 
          <div className='item-container'><div>Launching Fees:</div> <div>{displayNumberInPrettyFormat(tokenOfferingSummary.durationType=="Time"?100+parseInt(tokenOfferingSummary.endAfter):350)} ₳</div></div>
          <div style={{color:"var(--major-color)",fontSize:"x-small",textAlign:"left",paddingLeft:"5px"}}>*transactional fees are 0.3% of total ADA volume or a minimum of 1 ADA</div>
        </div>
        

        <div className="order-summary-footer">
          <button className="place-order-button" onClick={async () => await handleOfferingLaunch()}>
            Launch Token Campaign
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenOfferingSummary;
