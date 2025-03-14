/* global BigInt */
import React, { useState, useEffect } from 'react';
import OrderItem from '../components/OrderItem';
import { Constr, Data } from 'lucid-cardano';
import {SCRIPT_ADDRESS,SCRIPT_UTXO_REFERENCE,stringToHex,WEBSITE} from '../Constants.js';
import loadingGIF from '../assets/images/loading.gif';

import './MyOrders.css'; // Import the CSS file



function MyOrders({orders,myOrders,setMyOrders,allPairs,lucid,walletAPI,setMessageWindowContent,setMessageWindowButtonText,setShowMessageWindow}) {

  let publicKeyHash;


  useEffect(() => {
    // Your code here

    const intervalId = setInterval(() => {
      // This code will run every 5 seconds
      if (walletAPI != undefined){
        lucid.selectWallet(walletAPI);
        
        lucid.wallet.address().then((address) => {
          publicKeyHash = lucid.utils.getAddressDetails(address).paymentCredential?.hash;
          setMyOrders(orders.filter((order) => order.bidder == publicKeyHash));
        })  
    }}, 5000);

    // Don't forget to clean up the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, []); // Empty dependency array to run the effect only once

  const cancelOrderHandler = async (order) => {

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

    let outRefInfo = order.utxoId.split("#");
    const outRef = {txHash: outRefInfo[0],outputIndex: parseInt(outRefInfo[1])};
    const scriptRef = {txHash: SCRIPT_UTXO_REFERENCE,outputIndex: 0};
    const [utxo] = await lucid.utxosByOutRef([outRef]);
    const [script_utxo_ref] = await lucid.utxosByOutRef([scriptRef]);
    const redeemerValue = stringToHex('cancel');
    const redeemer = Data.to(new Constr(0, [redeemerValue]));
    const tx = await lucid.newTx()
    .collectFrom([utxo], redeemer)
    .addSigner(await lucid.wallet.address())
    .readFrom([script_utxo_ref])//.attachSpendingValidator(validator)
    .complete();
    try{
      const signedTx = await tx.sign().complete();
      const txHash = await signedTx.submit();
      //console.log(txHash);
    }catch{
      window.alert('User declined transaction');
    }
    
    setShowMessageWindow(false);
  }
  
  return (
    <div className="my-orders">
      <div className="container">
        <h1>My Orders</h1>
        <div className="wallet-order-list ">
          <h2>Active Orders</h2>
          <div className="order-list">
            {myOrders == undefined?
              <div style={{textAlign:"center"}}><br/><img width={32} src={loadingGIF}/></div>
              :
              <>
              {myOrders?.length>0?
                myOrders.map((order) => (
                <OrderItem key={order.utxoId} order={order} allPairs={allPairs} onCancelOrder={cancelOrderHandler}/>))
              :
              <p style={{color:'grey'}}> No orders available.</p>
              }
              </> 
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyOrders;
