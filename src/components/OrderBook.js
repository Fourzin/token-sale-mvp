// src/components/OrderBook.js
import React from 'react';
import { displayNumberInPrettyFormat,displayNumberInPrettierFormat } from '../Constants';
import './OrderBook.css';

function OrderBook(props) {
  // Sample data for buy and sell orders
  let buyOrders = [];
  if(props.buyOrders!=undefined) buyOrders=props.buyOrders;
  
    // Add more buy orders as needed

  let sellOrders = [];
  if(props.sellOrders!=undefined) sellOrders=props.sellOrders;




  
  return (
    <div className="order-book">
      <div className='current-price'><div>Bid Price: {displayNumberInPrettierFormat(props.tokenPrices.bidPrice)}</div><div>Ask Price: {displayNumberInPrettierFormat(props.tokenPrices.askPrice)}</div><div style={{display:"none"}}>Spread: {props.tokenPrices.spread}</div></div>
      <div className="order-lists">
      <div className="orders-section">
        <div className="order-title">Buy Orders</div>
        {buyOrders.length > 0?
        <ul>
          {buyOrders.map((order, index) => (
            <li key={index} 
              onClick={() => {
                props.setFormData({type:'sell',price: (parseFloat(order.price)*Math.pow(10,props.selectedPair.decimals-6)).toFixed(6),quantity:parseFloat(order.available_quantity)/Math.pow(10,props.selectedPair.decimals)});
                
                }}>
              <div><div style={{width:"80px"}}>Price:</div><div>{displayNumberInPrettierFormat(parseFloat((parseFloat(order.price)*Math.pow(10,props.selectedPair.decimals-6)).toFixed(6)))} ADA/{props.selectedPair.token_name}</div></div>
              <div><div style={{width:"80px"}}>Quantity:</div><div>{displayNumberInPrettyFormat(parseFloat(order.available_quantity)/Math.pow(10,props.selectedPair.decimals))} {props.selectedPair.token_name}</div></div>
            </li>
          ))}
        </ul>
        :
        <ul>
          <div style={{color:"grey",textAlign:"left",padding:"5px"}}>No buy orders.</div>
        </ul>
        }
      </div>

      <div className="orders-section">
        <div className="order-title">Sell Orders</div>
        {sellOrders.length > 0?
        <ul>
          {sellOrders.map((order, index) => (
            <li key={index} onClick={() => {props.setFormData({type:'buy',price: (parseFloat(order.price)*Math.pow(10,props.selectedPair.decimals-6)).toFixed(6),quantity:parseFloat(order.available_quantity)/Math.pow(10,props.selectedPair.decimals)})}}>
              <div><div style={{width:"80px"}}>Price:</div><div>{displayNumberInPrettierFormat(parseFloat((parseFloat(order.price)*Math.pow(10,props.selectedPair.decimals-6)).toFixed(6)))} ADA/{props.selectedPair.token_name}</div></div>
              <div><div style={{width:"80px"}}>Quantity:</div><div>{displayNumberInPrettyFormat(parseFloat(order.available_quantity)/Math.pow(10,props.selectedPair.decimals))} {props.selectedPair.token_name}</div></div>
            </li>
          ))}
        </ul>
        :
        <ul>
          <div style={{color:"grey",textAlign:"left",padding:"5px"}}>No sell orders.</div>
        </ul>
        }        
      </div>
      </div>
    </div>
  );
}

export default OrderBook;
