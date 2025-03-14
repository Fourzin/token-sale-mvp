/* global BigInt */
// src/pages/Home.js
import React, { useEffect, useState } from 'react';
import {Constr, Data} from 'lucid-cardano';
import './RSO.css'; // Import the CSS file
import { handlePrettyNumberInputChange,removePrettyFormat,WEBSITE,RSO_ADDRESS, displayNumberInPrettyFormat } from '../Constants';
import clockIcon from '../assets/images/clock-icon.png';
import loadingGIF from '../assets/images/loading.gif';

const rsoEndingTimeInPosix = Date.UTC(2023,11,5,0,0,0,0)/1000;

function RSO({lucid,walletAPI,setMessageWindowContent,setMessageWindowButtonText,setShowMessageWindow}) {

  const [rsoAdaAmount,setRSOAdaAmount] =useState([]);
  const [rsoInputAmounts,setRSOInputAmounts]=useState([]);
  const [rsoInputAmountsOfUser,setRSOInputAmountsOfUser] = useState([]);
  const [rsoTotalFunds,setRSOTotalFunds] =useState();
  const [rsoUserTotalFunds,setRSOUserTotalFunds] =useState();
  const [rsoTimeCounter,setRSOEndTime]=useState({days:'',hours:'',minutes:'',seconds:''})

  function fetchRSOInputAmounts(){
    let subdomain;
    switch (WEBSITE){
      case 'https://orderbook.adalink.io':
        subdomain = 'orderbook';
      break;
      case 'https://test-orderbook.adalink.io':
        subdomain = 'test-orderbook';
      break;
    }
    fetch('https://'+subdomain+'.adalink.io/api/get-rso-total-inputs.php',{cache:'reload'})
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      setRSOInputAmounts(data);
      let totalAda=0n;
      data.forEach(utxo => {
        totalAda += BigInt(utxo['AdaAmount'])
      });
      totalAda = parseFloat((parseFloat(totalAda.toString())/1000000).toFixed(6));
      setRSOTotalFunds(totalAda);
    
    })
    lucid.selectWallet(walletAPI);
    lucid.wallet.address()
    .then((response) => {
      const stakeKeyHash = lucid.utils.getAddressDetails(response).stakeCredential?.hash;
      fetch('https://'+subdomain+'.adalink.io/api/get-rso-inputs-of-user.php?user='+stakeKeyHash,{cache:'reload'})
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setRSOInputAmountsOfUser(data);
        let userTotalAda=0n;
        data.forEach(utxo => {
          userTotalAda += BigInt(utxo['AdaAmount'])
        });
        userTotalAda = parseFloat((parseFloat(userTotalAda.toString())/1000000).toFixed(6));
        setRSOUserTotalFunds(userTotalAda);
      })   
    })
  }

  useEffect(() => {
    //this will run once!
    fetchRSOInputAmounts();
  },[])

  useEffect(() => {
    // Your code here

    const intervalId = setInterval(() => {
      // This code will run every 5 seconds
      fetchRSOInputAmounts();
    
    }, 5000);

    const secondsTicker = setInterval(async () => {
      // This code will run every second
      let posixTimeInSeconds = Date.now()/1000;
      
      let secondsLeft = rsoEndingTimeInPosix - posixTimeInSeconds;
      let fullDaysUntillRSOEnd = (Math.floor(secondsLeft/86400));
      let fullHoursUntillRSOEnd = String(Math.floor(secondsLeft%86400/3600)).padStart(2,'0');
      let fullMinutesUntillRSOEnd = String(Math.floor(secondsLeft%86400%3600/60)).padStart(2,'0');
      let fullSecondsUntillRSOEnd = String(Math.floor(secondsLeft%86400%3600%60)).padStart(2,'0');
      setRSOEndTime({days:fullDaysUntillRSOEnd,hours:fullHoursUntillRSOEnd,minutes:fullMinutesUntillRSOEnd,seconds:fullSecondsUntillRSOEnd})
    }, 1000);

    // Don't forget to clean up the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
      clearInterval(secondsTicker);
    };
  }, []); // Empty dependency array to run the effect only once
  
  const handleChange = (e) => {
    setRSOAdaAmount(e.target.value)
  };

  async function sendFunds(){
    

    if(walletAPI == undefined){
      setMessageWindowContent('Connect your wallet first');
      setMessageWindowButtonText('Ok');
      setShowMessageWindow(true);
      return;
    }

    switch(WEBSITE){
      case 'https://orderbook.adalink.io':
        if(await walletAPI.getNetworkId() != 1){
          setMessageWindowContent('Make sure to set your wallet on Mainnet');
          setMessageWindowButtonText('Ok');
          setShowMessageWindow(true);
          return;
        }
      break;
      case 'https://test-orderbook.adalink.io':
        if(await walletAPI.getNetworkId() != 0){
          setMessageWindowContent('Make sure to set your wallet on Testnet');
          setMessageWindowButtonText('Ok');
          setShowMessageWindow(true);
          return;
        }
      break;
    }


    setMessageWindowContent('Building Transaction...');
    setMessageWindowButtonText('');
    setShowMessageWindow(true);

    lucid.selectWallet(walletAPI);
    const publicKeyHash = lucid.utils.getAddressDetails(
      await lucid.wallet.address()
    ).paymentCredential?.hash;
    const stakeKeyHash = lucid.utils.getAddressDetails(await lucid.wallet.address()).stakeCredential?.hash;

    let tx = lucid.newTx();
    const datum = Data.to(new Constr(0, [publicKeyHash,stakeKeyHash]));
    let ada_value = BigInt(parseFloat(removePrettyFormat(rsoAdaAmount))*1000000);
    if (ada_value < 100000000n){
      ada_value = ada_value + 2000000n;
      console.log(ada_value)
    }
    tx.payToAddressWithData(RSO_ADDRESS,{inline : datum},{lovelace: ada_value});

    try{
      tx = await tx.complete();
     }
     catch(e){
       
       //window.alert(e);
       if (e=='InputsExhaustedError'){
         setMessageWindowContent('Make sure you have enough assets in wallet');
         setMessageWindowButtonText('Ok');
         return;
       }else{
         window.alert(e);
       }
     }
     setShowMessageWindow(false)
     try{
      const signedTx = await tx.sign().complete();
      const txHash = await signedTx.submit();
      //console.log(txHash);
      setMessageWindowContent(<><div>Transaction has been submitted to chain</div><div style={{fontSize:"x-small",marginTop:"5px"}}>Tx Hash: {txHash}</div></>);
      setMessageWindowButtonText('Ok');
      setShowMessageWindow(true);
    }catch{
      window.alert('User declined transaction');
    }
    
  }

  return (
    <div className="rso">
      <div className='container'>
        <h1>Revenue Share Offering</h1>
        <br/>
        <div className='rso-info'>
          <div style={{textAlign:"justify",lineHeight:"1.6rem"}}>Introducing the "Revenue Share Offering" – an opportunity to invest and receive 
            tokens in proportion to your contribution relative to the total funds raised. 
            There is a fixed supply of 100,000 tokens. Token holders will be entitled to 50% of the project's revenue. 
            The minimum goal to raise is 200,000 ADA, if not met, contributors will receive a refund. 
            If the goal is surpassed, tokens will be distributed based on individual contributions relative to the total funds raised. 
            The minimum amount raised will be used to fund the developer for the first six months to ensure platform sustainability. Remaining amount, will be used toward expanding the platform.
          </div>
        </div>
        <div style={{display:"flex",width:"100%",maxWidth:"832px",justifyContent:"space-between",gap:"2rem"}}>
          <div className='rso-info'>
              <h4>Offering Stats</h4>
              {Date.now()/1000>rsoEndingTimeInPosix?
              <></>
              :
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"5px"}}><img src={clockIcon} width={24}/><div>{rsoTimeCounter.days} Day : {rsoTimeCounter.hours} Hours : {rsoTimeCounter.minutes} Minutes : {rsoTimeCounter.seconds} Seconds</div></div>
              }
              <div className='rso-parameter' style={{marginTop:"1rem"}}><div>Total Amount Raised:</div><div>{rsoTotalFunds ==undefined?<img src={loadingGIF} width={14}/>:displayNumberInPrettyFormat(rsoTotalFunds)+' ADA'}</div></div>
              <div className='rso-parameter'><div>Minimum Target:</div><div>{ rsoTotalFunds>=200000?'Reached':'Not reached, yet'}</div></div>
              <div className='rso-parameter'><div>Current Token Price:</div><div>{rsoTotalFunds>=200000?parseFloat((rsoTotalFunds/100000).toFixed(6)):'2'} ADA/Token</div></div>
              <br/>
              <div className='rso-parameter'><div>My Total Amount:</div><div>{rsoUserTotalFunds == undefined?<img src={loadingGIF} width={14}/>:displayNumberInPrettyFormat(rsoUserTotalFunds)+' ADA'} </div></div>
              <div className='rso-parameter'>
                <div>Current Tokens to Receive:</div>
                <div>
                  {rsoUserTotalFunds == undefined?
                  <img src={loadingGIF} width={14}/>
                  :
                  <>{rsoTotalFunds>=200000?parseFloat((rsoTotalFunds/100000*rsoUserTotalFunds).toFixed(6)):parseFloat((0.5*rsoUserTotalFunds).toFixed(6))} Token</>
                  }
                </div>
              </div>
          </div>
          <div className='rso-info'>
          {Date.now()/1000>rsoEndingTimeInPosix?
            <>
            <h4>RSO Ended</h4>
            {rsoTotalFunds>=200000?
            <div style={{marginTop:"1rem"}}>Target met, tokens will be distributed in 24 hours.</div>
            :
            <div style={{marginTop:"1rem"}}>Target not met, wallets will be refunded in 24 hours.</div>
            }
            </>
          :
            <div style={{display:"flex",flexDirection:"column",justifyContent:"space-between",height:"100%"}}>
            <div>
            <h4>Purchase</h4>
            <div style={{textAlign:"left",marginTop:"2rem"}}>
              Amount <em style={{color:"grey"}}>[ADA]</em>
            </div>
            
            <input
              //type="number"
              id='rsoInput'
              name="rsoInput"
              value={rsoAdaAmount}
              onKeyDown={(event) => {
                if ((!/[0-9.]/.test(event.key)) && (!/[\B]/.test(event.key)) && event.key != 'ArrowLeft' && event.key != 'ArrowRight' ) {
                  event.preventDefault();
                }
                if (event.key == '.' && document.getElementById('rsoInput').value.split(".").length>1){
                  event.preventDefault();
                }
              }}
              onChange={(e) => {handlePrettyNumberInputChange('rsoInput');handleChange(e)}}
              required
            />
            <div style={{fontSize:"x-small",textAlign:"left",marginTop:"5px"}}>* 2 ADA deposit will be added for orders less than 100 ADA</div>
            </div>
            <button onClick={sendFunds}>Place Order</button>
            </div>
          }
          </div>
        </div>
      </div>
    </div>
  );
}

export default RSO;
