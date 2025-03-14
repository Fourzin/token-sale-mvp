import React from 'react';
import { displayNumberInPrettyFormat,displayNumberInPrettierFormat,numberOfDecimals } from '../Constants';
import './OrderItem.css';


const OrderItem = ({ order, allPairs,onCancelOrder }) => {
  const { token_name, call, price,required_coins,received_coins } = order;

  let pairInfo = allPairs.filter((pair) => token_name === pair.token_name)
  let decimals = 0;
  if (pairInfo.length != 0) decimals = pairInfo[0].decimals;
  let quantity;
  switch(call){
    case 'sell':
      quantity = parseFloat(((parseFloat(required_coins) / parseFloat(price))/Math.pow(10,decimals)).toFixed(decimals));
      break;
    case 'buy':
      quantity = parseFloat(required_coins)/Math.pow(10,decimals);
      break;
  }
  
  return (
    <div className="order-item">
      <div className='order-parameter-group'>
        <div className="order-parameter">
          <div className="order-parameter-name">Pair</div>
          <div className="order-parameter-value">{token_name}-ADA</div>
        </div>
        <div className="order-parameter">
          <div className="order-parameter-name">Call</div>
          <div className="order-parameter-value">{call}</div>
        </div>
      </div>
      <div className='order-parameter-group'>
        <div className="order-parameter">
          <div className="order-parameter-name">Price</div>
          <div className="order-parameter-value">{displayNumberInPrettierFormat(parseFloat(parseFloat(parseFloat(price)*Math.pow(10,decimals-6)).toPrecision(numberOfDecimals(price)+numberOfDecimals(Math.pow(10,decimals-6)))))} ADA/{token_name}</div>
        </div>
        <div className="order-parameter">
          <div className="order-parameter-name">Quantity</div>
          <div className="order-parameter-value">{displayNumberInPrettyFormat(quantity)} {token_name}</div>
        </div>
      </div>
      <div className='order-parameter-group'>
        <div className="order-parameter">
          <div className="order-parameter-name">Fulfillment</div>
          <div className="order-parameter-value">{parseFloat((parseFloat(order.received_coins)/parseFloat(order.required_coins)*100).toFixed(2))}%</div>
        </div>
        <div className="order-parameter"><button onClick={() => onCancelOrder(order)}>Cancel</button></div>
      </div>
    </div>
  );
};

export default OrderItem;
