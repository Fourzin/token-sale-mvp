/* global BigInt */
// src/components/OrderForm.js
import React, { useState } from 'react';
import {SCRIPT_ADDRESS,SCRIPT_UTXO_REFERENCE,FEE_ADDRESS,WEBSITE,stringToHex,convertToMultiplier,numberOfDecimals,displayNumberInPrettyFormat,removePrettyFormat} from '../Constants.js';
import {Constr, Data, toHex,fromHex} from 'lucid-cardano';
import { encode } from 'cbor-x';
import OrderSummary from './OrderSummary';


import './OrderForm.css'; // Import the CSS file

function OrderForm( {formData,setFormData,sellOrders,buyOrders,lucid,walletAPI,selectedPair,setMessageWindowContent,setMessageWindowButtonText,setShowMessageWindow}) {

  const [orderTx,setOrderTx] = useState();
  const [availableTokenAmount,setAvailableTokenAmount]=useState(0);
  const [paidCoins,setPaidCoins]=useState(0);
  const [averagePrice,setAveragePrice] = useState(0);
  const [feesToPay,setFeesToPay] = useState();
  const [showOrderSummary, setShowOrderSummary] = useState(false);


  const handlePrettyNumberInputChange = (elementId) => {
    
    if(document.getElementById(elementId).value.slice(-1)!="." && document.getElementById(elementId).value.split(".")[1]?.slice(-1)!="0"){

      if(document.getElementById(elementId).value!="" ){
          document.getElementById(elementId).value=displayNumberInPrettyFormat(removePrettyFormat(document.getElementById(elementId).value));
          
      }
    } 
  }
  const handleChange = (e) => {

    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add code to handle order placement
  };

  const buildOrderHandler = async () => {

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

    if(formData.price == '' || formData.quantity == ''){
      setMessageWindowContent('Enter desired price and quantity');
      setMessageWindowButtonText('Ok');
      setShowMessageWindow(true);
      return;      
    }

    // remove pretty format from price and quantity

    formData.price = removePrettyFormat(formData.price);
    formData.quantity = removePrettyFormat(formData.quantity);

    formData.price = formData.price;
    
    formData.quantity = parseFloat(formData.quantity).toFixed(selectedPair.decimals);
    
    //check if wallet has enough ada or tokens
    
    


    setMessageWindowContent('Building Transaction...');
    setMessageWindowButtonText('');
    setShowMessageWindow(true);

    lucid.selectWallet(walletAPI);
    
    const publicKeyHash = lucid.utils.getAddressDetails(
      await lucid.wallet.address()
    ).paymentCredential?.hash;
    const stakeKeyHash = lucid.utils.getAddressDetails(await lucid.wallet.address()).stakeCredential?.hash;

    const scriptRef = {txHash: SCRIPT_UTXO_REFERENCE,outputIndex: 0};
    const [script_utxo_ref] = await lucid.utxosByOutRef([scriptRef]);
    //check if there are opposing calls that fulfills the order
    //if the fulfillment is not 100% then the remaining will be sent as a new order to the book
    let tx;
    let fulfilledQuantity = 0n;
    let numberOfSelectedOrders = 0;
    let requiredQuantity = BigInt(parseInt(parseFloat(formData.quantity)*Math.pow(10,selectedPair.decimals)));
    let paid_coins = 0;
    let fee_percentage = 0.003;
    let fees_to_pay = 0;
    switch(formData.type){
      case 'buy':
        //first check if there are buy orders that have equal or higher prices
        //console.log(sellOrders)
        let validSellOrders = sellOrders.filter((sellOrder) => parseFloat(sellOrder.price) <= parseFloat(formData.price)*Math.pow(10,6-selectedPair.decimals));
        for (let i=0;i<validSellOrders.length;i++){
          fulfilledQuantity += BigInt(sellOrders[i].available_quantity);
          numberOfSelectedOrders++;
          if (fulfilledQuantity >= requiredQuantity)
            break;
        }
        //console.log(fulfilledQuantity+':?'+requiredQuantity)
        if (fulfilledQuantity < requiredQuantity){
          const policy_id = selectedPair.policy_id;
          const token_name = stringToHex(selectedPair.token_name);
          const tokenSigniture = selectedPair.policy_id+stringToHex(selectedPair.token_name);
          tx = lucid.newTx();
          for (let i=0;i<numberOfSelectedOrders;i++){
          const bidderAddress = lucid.utils.credentialToAddress(lucid.utils.keyHashToCredential(validSellOrders[i].bidder),lucid.utils.keyHashToCredential(validSellOrders[i].bidder_stake_key_hash));
          const outRefInfo = validSellOrders[i].utxoId.split("#");
          const outRef = {txHash: outRefInfo[0],outputIndex: parseInt(outRefInfo[1])};
          const [utxo] = await lucid.utxosByOutRef([outRef]);
          let redeemer_value;
          if (publicKeyHash != validSellOrders[i].bidder){
            redeemer_value = ''
            tx.payToAddress(bidderAddress,{lovelace:2000000n+BigInt(validSellOrders[i].required_coins)});
          }else{
            redeemer_value = stringToHex('cancel');
            tx.addSigner(await lucid.wallet.address())
          }
          paid_coins += parseFloat(validSellOrders[i].available_quantity).toString()*validSellOrders[i].price;
          
          const redeemer = Data.to(new Constr(0, [redeemer_value]));
          tx.collectFrom([utxo], redeemer);
          }
          if(numberOfSelectedOrders>0){
            //tx.attachSpendingValidator(validator);
            tx.readFrom([script_utxo_ref]);
          }
          
          let price_unit_type = 1;
          let priceBuffer;
          if ((numberOfDecimals(formData.price)+numberOfDecimals(Math.pow(10,6-selectedPair.decimals))) == 0)
            priceBuffer = (parseFloat(formData.price)*Math.pow(10,6-selectedPair.decimals));
          else
            priceBuffer = parseFloat((parseFloat(formData.price)*Math.pow(10,6-selectedPair.decimals)).toFixed(numberOfDecimals(formData.price)+numberOfDecimals(Math.pow(10,6-selectedPair.decimals))));
          
          const { y: priceInt, a: priceCorrection } = convertToMultiplier(priceBuffer);
          const call = stringToHex(formData.type);
          const required_coins = requiredQuantity - fulfilledQuantity;
          
          const datum = Data.to(new Constr(0, [publicKeyHash,stakeKeyHash,call,policy_id,token_name,BigInt(priceInt),BigInt(priceCorrection),BigInt(price_unit_type),BigInt(required_coins),0n]));
          let price = parseFloat(formData.price)*Math.pow(10,6-selectedPair.decimals);
          const ada_value = parseInt(parseFloat(required_coins)*price)+2000000; // 2000000 is the depoist 
          tx.payToContract(SCRIPT_ADDRESS,{inline : datum},{lovelace: ada_value});
          fees_to_pay = BigInt(parseInt(paid_coins * fee_percentage)+3);
          if (fees_to_pay < 1500000n)
            fees_to_pay = 1500000n;
          if (paid_coins > 0)
            tx.payToAddress(FEE_ADDRESS,{lovelace:fees_to_pay});
          //tx = await tx.complete();



  
        }else if (fulfilledQuantity == requiredQuantity){
          const tokenSigniture = selectedPair.policy_id+stringToHex(selectedPair.token_name);
          tx = lucid.newTx();
          for (let i=0;i<numberOfSelectedOrders;i++){
          const bidderAddress = lucid.utils.credentialToAddress(lucid.utils.keyHashToCredential(validSellOrders[i].bidder),lucid.utils.keyHashToCredential(validSellOrders[i].bidder_stake_key_hash));
          const outRefInfo = validSellOrders[i].utxoId.split("#");
          const outRef = {txHash: outRefInfo[0],outputIndex: parseInt(outRefInfo[1])};
          const [utxo] = await lucid.utxosByOutRef([outRef]);
          let redeemer_value;
          if (publicKeyHash != validSellOrders[i].bidder){
            redeemer_value = '';
            tx.payToAddress(bidderAddress,{lovelace:2000000n+BigInt(validSellOrders[i].required_coins)});
          }else{
            redeemer_value = stringToHex('cancel');
            tx.addSigner(await lucid.wallet.address())
          }
          paid_coins += (validSellOrders[i].available_quantity)*parseFloat(validSellOrders[i].price);
          const redeemer = Data.to(new Constr(0, [redeemer_value]));
          tx.collectFrom([utxo], redeemer);
          }
          fees_to_pay = BigInt(parseInt(paid_coins * fee_percentage)+3);
          if (fees_to_pay < 1500000n)
            fees_to_pay = 1500000n
          if (paid_coins > 0)
            tx.payToAddress(FEE_ADDRESS,{lovelace:fees_to_pay});
          //tx.attachSpendingValidator(validator)
          tx.readFrom([script_utxo_ref]);
        }else{ //if  (fulfilledQuantity > requiredQuantity)
          const policy_id = selectedPair.policy_id;
          const token_name = stringToHex(selectedPair.token_name);
          const tokenSigniture = selectedPair.policy_id+stringToHex(selectedPair.token_name);
          
          let total_available_quantity_except_last_utxo = 0n;
          tx = lucid.newTx();
          for (let i=0;i<(numberOfSelectedOrders-1);i++){
            let bidderAddress = lucid.utils.credentialToAddress(lucid.utils.keyHashToCredential(validSellOrders[i].bidder),lucid.utils.keyHashToCredential(validSellOrders[i].bidder_stake_key_hash));
            const outRefInfo = validSellOrders[i].utxoId.split("#");
            const outRef = {txHash: outRefInfo[0],outputIndex: parseInt(outRefInfo[1])};
            const [utxo] = await lucid.utxosByOutRef([outRef]);
            total_available_quantity_except_last_utxo += BigInt(validSellOrders[i].available_quantity);
            let redeemer_value;
            if (publicKeyHash != validSellOrders[i].bidder){
              redeemer_value = '';
              tx.payToAddress(bidderAddress,{lovelace:2000000n+BigInt(validSellOrders[i].required_coins)});
            }else{
              redeemer_value = stringToHex('cancel');
              tx.addSigner(await lucid.wallet.address())
            }
            paid_coins += parseFloat(validSellOrders[i].available_quantity.toString())*validSellOrders[i].price;
            const redeemer = Data.to(new Constr(0, [redeemer_value]));
            tx.collectFrom([utxo], redeemer);
          }
          const call = stringToHex('sell');
          const outRefInfo = validSellOrders[numberOfSelectedOrders-1].utxoId.split("#");
          const outRef = {txHash: outRefInfo[0],outputIndex: parseInt(outRefInfo[1])};
          const [utxo] = await lucid.utxosByOutRef([outRef]);
          let price_unit_type = 1;
          let priceBuffer = parseFloat(validSellOrders[numberOfSelectedOrders-1].price)

          const { y: priceInt, a: priceCorrection } = convertToMultiplier(priceBuffer);
          let remaining_required_quantity = requiredQuantity - total_available_quantity_except_last_utxo; 
          //console.log(': '+remaining_required_quantity+' '+validSellOrders[numberOfSelectedOrders-1].price)
          let ada_value_of_remaining_required_quantity = BigInt(Math.ceil(parseFloat(remaining_required_quantity.toString()) * parseFloat(validSellOrders[numberOfSelectedOrders-1].price)))
          paid_coins += parseFloat(ada_value_of_remaining_required_quantity.toString());
          //console.log('highest_price: '+priceInt+' '+priceCorrection)
          const datum = Data.to(new Constr(0, [validSellOrders[numberOfSelectedOrders-1].bidder,validSellOrders[numberOfSelectedOrders-1].bidder_stake_key_hash,call,policy_id,token_name,BigInt(priceInt),BigInt(priceCorrection),BigInt(price_unit_type),BigInt(validSellOrders[numberOfSelectedOrders-1].required_coins),BigInt(validSellOrders[numberOfSelectedOrders-1].received_coins)+ada_value_of_remaining_required_quantity]));

          
          let change_to_give_back = BigInt((parseInt(validSellOrders[numberOfSelectedOrders-1].available_quantity) - parseInt(remaining_required_quantity.toString())))

          tx.payToContract(SCRIPT_ADDRESS,{inline:datum},{lovelace:(2000000n+BigInt(validSellOrders[numberOfSelectedOrders-1].received_coins)+ada_value_of_remaining_required_quantity),[tokenSigniture]:change_to_give_back});
          let redeemer_value;
          if (publicKeyHash != validSellOrders[numberOfSelectedOrders-1].bidder){
            redeemer_value = '';
          }else{
            redeemer_value = stringToHex('cancel');
            tx.addSigner(await lucid.wallet.address())
          }
          const redeemer = Data.to(new Constr(0, [redeemer_value]));
          tx.collectFrom([utxo],redeemer);
          fees_to_pay = BigInt(parseInt(paid_coins * fee_percentage)+3);
          if (fees_to_pay < 1500000n)
            fees_to_pay = 1500000n;
          if (paid_coins > 0)
            tx.payToAddress(FEE_ADDRESS,{lovelace:fees_to_pay});
          //tx.attachSpendingValidator(validator);
          tx.readFrom([script_utxo_ref]);
        }
        break;
      case 'sell':
        //first check if there are buy orders that have equal or higher prices
        let validBuyOrders = buyOrders.filter((buyOrder) => parseFloat(buyOrder.price) >= parseFloat(formData.price)*Math.pow(10,6-selectedPair.decimals));
        for (let i=0;i<validBuyOrders.length;i++){
          fulfilledQuantity += BigInt(buyOrders[i].available_quantity);
          numberOfSelectedOrders++;
          if (fulfilledQuantity >= requiredQuantity)
            break;
        }
        //console.log(fulfilledQuantity+' ? '+requiredQuantity)
        if (fulfilledQuantity < requiredQuantity){
          const policy_id = selectedPair.policy_id;
          const token_name = stringToHex(selectedPair.token_name);
          const tokenSigniture = selectedPair.policy_id+stringToHex(selectedPair.token_name);
          tx = lucid.newTx();
          for (let i=0;i<numberOfSelectedOrders;i++){
          const bidderAddress = lucid.utils.credentialToAddress(lucid.utils.keyHashToCredential(validBuyOrders[i].bidder),lucid.utils.keyHashToCredential(validBuyOrders[i].bidder_stake_key_hash));
          const outRefInfo = validBuyOrders[i].utxoId.split("#");
          const outRef = {txHash: outRefInfo[0],outputIndex: parseInt(outRefInfo[1])};
          const [utxo] = await lucid.utxosByOutRef([outRef]);
          
          
          let redeemer_value;
          if (publicKeyHash != validBuyOrders[i].bidder){
            redeemer_value = '';
            tx.payToAddress(bidderAddress,{lovelace:2000000n,[tokenSigniture]:validBuyOrders[i].required_coins});
          }else{
            redeemer_value = stringToHex('cancel');
            tx.addSigner(await lucid.wallet.address())
          }
          paid_coins += parseFloat(validBuyOrders[i].available_quantity.toString())*validBuyOrders[i].price;//* Math.pow(10,6-selectedPair.decimals);
          const redeemer = Data.to(new Constr(0, [redeemer_value]));
          tx.collectFrom([utxo], redeemer);
          }
          if(numberOfSelectedOrders>0){
            //tx.attachSpendingValidator(validator);
            tx.readFrom([script_utxo_ref]);
          }
          
          let price_unit_type = 1;
          let priceBuffer;
          if ( (numberOfDecimals(formData.price)+numberOfDecimals(Math.pow(10,6-selectedPair.decimals))) == 0){
            priceBuffer = (parseFloat(formData.price)*Math.pow(10,6-selectedPair.decimals));
            
          }
            
          else
            priceBuffer = parseFloat((parseFloat(formData.price)*Math.pow(10,6-selectedPair.decimals)).toFixed(numberOfDecimals(formData.price)+numberOfDecimals(Math.pow(10,6-selectedPair.decimals))));
          
          const { y: priceInt, a: priceCorrection } = convertToMultiplier(priceBuffer);
          const call = stringToHex(formData.type);
          const required_coins = BigInt(parseInt(parseFloat(formData.price) * Math.pow(10,6-selectedPair.decimals) * parseFloat((requiredQuantity - fulfilledQuantity).toString())))
          
          const datum = Data.to(new Constr(0, [publicKeyHash,stakeKeyHash,call,policy_id,token_name,BigInt(priceInt),BigInt(priceCorrection),BigInt(price_unit_type),BigInt(required_coins),0n]));

          tx.payToContract(SCRIPT_ADDRESS,{inline : datum},{lovelace: 2000000n,[tokenSigniture]:(requiredQuantity-fulfilledQuantity)});
          fees_to_pay = BigInt(parseInt(paid_coins * fee_percentage)+3);
          if (fees_to_pay < 1500000n)
            fees_to_pay = 1500000n;
          if (paid_coins > 0)
            tx.payToAddress(FEE_ADDRESS,{lovelace:fees_to_pay});
          //tx = await tx.complete();
        }else if (fulfilledQuantity == requiredQuantity){
          const tokenSigniture = selectedPair.policy_id+stringToHex(selectedPair.token_name);
          tx = lucid.newTx();
          for (let i=0;i<numberOfSelectedOrders;i++){
          const bidderAddress = lucid.utils.credentialToAddress(lucid.utils.keyHashToCredential(validBuyOrders[i].bidder),lucid.utils.keyHashToCredential(validBuyOrders[i].bidder_stake_key_hash));
          const outRefInfo = validBuyOrders[i].utxoId.split("#");
          const outRef = {txHash: outRefInfo[0],outputIndex: parseInt(outRefInfo[1])};
          const [utxo] = await lucid.utxosByOutRef([outRef]);
          let redeemer_value;
          if (publicKeyHash != validBuyOrders[i].bidder){
            redeemer_value = '';
            tx.payToAddress(bidderAddress,{lovelace:2000000n,[tokenSigniture]:validBuyOrders[i].required_coins});
          }else{
            redeemer_value = stringToHex('cancel');
            tx.addSigner(await lucid.wallet.address())
          }
          paid_coins += parseFloat((validBuyOrders[i].available_quantity).toString())*validBuyOrders[i].price;
          const redeemer = Data.to(new Constr(0, [redeemer_value]));
          tx.collectFrom([utxo], redeemer);
          }
          fees_to_pay = BigInt(parseInt(paid_coins * fee_percentage)+3);
          if (fees_to_pay < 1500000n)
            fees_to_pay = 1500000n;
          if (paid_coins > 0){
            
            tx.payToAddress(FEE_ADDRESS,{lovelace:fees_to_pay});
          }
            
          //tx.attachSpendingValidator(validator)
          tx.readFrom([script_utxo_ref]);
        }else{ //if  (fulfilledQuantity > requiredQuantity)
          const policy_id = selectedPair.policy_id;
          const token_name = stringToHex(selectedPair.token_name);
          const tokenSigniture = selectedPair.policy_id+stringToHex(selectedPair.token_name);
          
          let total_available_quantity_except_last_utxo = 0n;
          tx = lucid.newTx();
          for (let i=0;i<(numberOfSelectedOrders-1);i++){
            let bidderAddress = lucid.utils.credentialToAddress(lucid.utils.keyHashToCredential(validBuyOrders[i].bidder),lucid.utils.keyHashToCredential(validBuyOrders[i].bidder_stake_key_hash));
            const outRefInfo = validBuyOrders[i].utxoId.split("#");
            const outRef = {txHash: outRefInfo[0],outputIndex: parseInt(outRefInfo[1])};
            const [utxo] = await lucid.utxosByOutRef([outRef]);
            total_available_quantity_except_last_utxo += BigInt(validBuyOrders[i].available_quantity);
            let redeemer_value;
            if (publicKeyHash != validBuyOrders[i].bidder){
              redeemer_value = '';
              tx.payToAddress(bidderAddress,{lovelace:2000000n,[tokenSigniture]:validBuyOrders[i].required_coins});
            }else{
              redeemer_value = stringToHex('cancel');
              tx.addSigner(await lucid.wallet.address())
            }
            paid_coins += parseFloat(validBuyOrders[i].available_quantity).toString()*validBuyOrders[i].price;
            const redeemer = Data.to(new Constr(0, [redeemer_value]));
            tx.collectFrom([utxo], redeemer);
          }
          const call = stringToHex('buy');
          const outRefInfo = validBuyOrders[numberOfSelectedOrders-1].utxoId.split("#");
          const outRef = {txHash: outRefInfo[0],outputIndex: parseInt(outRefInfo[1])};
          //console.log(outRefInfo[0]+'#'+outRefInfo[1])
          const [utxo] = await lucid.utxosByOutRef([outRef]);
          let price_unit_type = 1;
          let priceBuffer = parseFloat(validBuyOrders[numberOfSelectedOrders-1].price);//*Math.pow(10,6-selectedPair.decimals);

          const { y: priceInt, a: priceCorrection } = convertToMultiplier(priceBuffer);
          //console.log(priceInt+' '+priceCorrection) 
          let remaining_required_quantity = requiredQuantity - total_available_quantity_except_last_utxo; 
          const datum = Data.to(new Constr(0, [validBuyOrders[numberOfSelectedOrders-1].bidder,validBuyOrders[numberOfSelectedOrders-1].bidder_stake_key_hash,call,policy_id,token_name,BigInt(priceInt),BigInt(priceCorrection),BigInt(price_unit_type),BigInt(validBuyOrders[numberOfSelectedOrders-1].required_coins),BigInt(validBuyOrders[numberOfSelectedOrders-1].received_coins)+BigInt(remaining_required_quantity)]));

                  
          let change_to_give_back = BigInt(Math.ceil((parseInt(validBuyOrders[numberOfSelectedOrders-1].available_quantity) - parseInt(remaining_required_quantity.toString()))*parseFloat(validBuyOrders[numberOfSelectedOrders-1].price)))
          paid_coins += parseFloat(remaining_required_quantity.toString())*parseFloat(validBuyOrders[numberOfSelectedOrders-1].price);
          
          //console.log(change_to_give_back+' '+BigInt(BigInt(validBuyOrders[numberOfSelectedOrders-1].received_coins)+BigInt(remaining_required_quantity)))
          tx.payToContract(SCRIPT_ADDRESS,{inline:datum},{lovelace:(2000000n+change_to_give_back),[tokenSigniture]:BigInt(BigInt(validBuyOrders[numberOfSelectedOrders-1].received_coins)+BigInt(remaining_required_quantity))});
          let redeemer_value;
          if (publicKeyHash != validBuyOrders[numberOfSelectedOrders-1].bidder){
            redeemer_value = '';
          }else{
            redeemer_value = stringToHex('cancel');
            tx.addSigner(await lucid.wallet.address())
          }
          const redeemer = Data.to(new Constr(0, [redeemer_value]));
          tx.collectFrom([utxo],redeemer);
          fees_to_pay = BigInt(parseInt(paid_coins * fee_percentage)+3);
          if (fees_to_pay < 1500000n)
            fees_to_pay = 1500000n
          if (paid_coins > 0){
            //console.log('tik')
            tx.payToAddress(FEE_ADDRESS,{lovelace:fees_to_pay});
          }
            
          //tx.attachSpendingValidator(validator);
          tx.readFrom([script_utxo_ref]);
        }
      break;
      }
      //tx = await tx.complete();
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
          //console.log(e)
        }
      }
      
      setAvailableTokenAmount(parseInt(fulfilledQuantity)/Math.pow(10,selectedPair.decimals));
      setPaidCoins(paid_coins/1000000);
      setFeesToPay(parseFloat((parseFloat(fees_to_pay.toString())/1000000).toFixed(6)));
      setShowMessageWindow(false);
      setOrderTx(tx);
      setShowOrderSummary(true);
    //return tx;

    //

    //
  }

  const placeOrderHandler = async (tx) => {
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
    setShowOrderSummary(false);
  }

  return (
    <div className="order-form">
      <h2>Place Order</h2>
      <form onSubmit={handleSubmit}>
        <div className="left-side">
            <label>
                Price <em style={{color:"grey"}}>[ADA/{selectedPair?.token_name}]</em>
            </label>
            <input
              //type="number"
              id='priceInput'
              name="price"
              value={formData.price}
              onKeyDown={(event) => {
                if ((!/[0-9.]/.test(event.key)) && (!/[\B]/.test(event.key)) && event.key != 'ArrowLeft' && event.key != 'ArrowRight' ) {
                  event.preventDefault();
                }
                if (event.key == '.' && document.getElementById('priceInput').value.split(".").length>1){
                  event.preventDefault();
                }
              }}
              onChange={(e) => {handlePrettyNumberInputChange('priceInput');handleChange(e)}}
              required
            />

            <label>
            Quantity <em style={{color:"grey"}}>[{selectedPair?.token_name}]</em>
            </label>
            <input
              //type="number"
              id='quantityInput'
              name="quantity"
              value={formData.quantity}
              onKeyDown={(event) => {
                if ((!/[0-9.]/.test(event.key)) && (!/[\B]/.test(event.key)) && event.key != 'ArrowLeft' && event.key != 'ArrowRight') {
                  event.preventDefault();
                }
                if (event.key == '.' && document.getElementById('quantityInput').value.split(".").length>1){
                  event.preventDefault();
                }
              }}
              onChange={(e) => {handlePrettyNumberInputChange('quantityInput');handleChange(e)}}
              //step="0.01"
              required
            />
          
        </div>
        <div className="right-side">
            <select id='orderTypeInput' name="type" value={formData.type} onChange={handleChange}>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
            <button type="submit" onClick={async () => {await buildOrderHandler()}}>Place Order</button>
        </div>
      </form>
      {showOrderSummary && ( // Show OrderSummary when orderSummaryVisible is true
        <OrderSummary
          orderSummary={{userInputs: formData,selectedPair:selectedPair,availableTokenAmount:availableTokenAmount, paidCoins:paidCoins, feesToPay:feesToPay}}
          onClose={() => setShowOrderSummary(false)} // Close OrderSummary
          onPlaceOrder={ () => {placeOrderHandler(orderTx)}} // Pass placeOrderHandler as onPlaceOrder
        />
      )}
    </div>
  );
}

export default OrderForm;
