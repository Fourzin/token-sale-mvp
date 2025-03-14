/* global BigInt */
import React, { useRef, useEffect } from 'react';
import { Constr, Data } from 'lucid-cardano';
import {displayNumberInPrettyFormat,displayNumberInPrettierFormat, FEE_ADDRESS,stringToHex} from '../Constants';
import './TokenOfferingSummary.css';
import { SCRIPT_ADDRESS,ENGINE_ADDRESS,NETWORK } from '../Constants';

const PurchaseSummary = ({ tpoDetails,affiliateDetails,tokenAmount,adaAmount,walletAPI,lucid,onClose,setMessageWindowContent,setMessageWindowButtonText,setShowMessageWindow }) => {
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

  
  async function handleOfferingLaunch(){


    //waiting user confirmation
    setMessageWindowContent("Waiting user confirmation...");
    setMessageWindowButtonText("");
    setShowMessageWindow(true);

    lucid.selectWallet(walletAPI);
    const walletAddress = await lucid.wallet.address();
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
    .complete();

    try{
      const signedTx = await tx.sign().complete();
      const txHash = await signedTx.submit();
      //let txHash= "abcdef123456789abcdef123456789abcdef123456789"
      setMessageWindowContent(<><div>Transaction has been submitted successfully!</div><br/><div style={{textAlign:"left",fontSize:"13px",paddingLeft:"1.2rem"}}>Tokens will land on wallet soon.</div></>)
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
          <h2>Purchase Summary</h2>
        </div>
        <div className="order-summary-content">
          <div className='item-container'><div>Token Name:</div> <div>{tpoDetails['Name']}</div></div>
          <div className='item-container'><div>Ticker:</div> <div>{tpoDetails['Ticker']}</div></div>
          
          <div className='item-container'><div>Logo:</div> <div><img width={20} src={tpoDetails['MetaDataSource']=="cardano"?"data:image/png;base64, "+tpoDetails['Logo_Base64']:tpoDetails['Logo_URL']} /></div></div>
          <div className='item-container'><div>Price:</div> <div>{displayNumberInPrettierFormat(tpoDetails['Price'])} ₳/{tpoDetails['Ticker']}</div></div> 
          <div className='item-container'><div>Amount to be Bought:</div> <div>{displayNumberInPrettierFormat(tokenAmount)} {tpoDetails['Ticker']}</div></div> 
          <div className='item-container'><div>Price in ADA:</div> <div>{displayNumberInPrettierFormat(adaAmount)} ₳ </div></div> 
          <div className='item-container'><div>AdaLink Fee:</div> <div>1 ₳ </div></div> 
          <div className='item-container'><div>Deposit:</div> <div>2 ₳ </div></div> 
          <div className='item-container'><div>Total:</div> <div>{displayNumberInPrettierFormat(parseFloat(adaAmount)+3)} ₳ </div></div> 
          <div style={{color:"var(--major-color)",fontSize:"x-small",textAlign:"left"}}>*Deposit amount will be sent back to you along with the bought tokens.</div>
        </div>
        

        <div className="order-summary-footer">
          <button className="place-order-button" onClick={async () => await handleOfferingLaunch()}>
            Buy Tokens
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSummary;
