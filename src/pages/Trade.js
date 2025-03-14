// src/pages/Trade.js
import React, {useState} from 'react';
import './Trade.css'; // Import the CSS file
import PairInfo from '../components/PairInfo';
import OrderBook from '../components/OrderBook';
import OrderForm from '../components/OrderForm';
import PairPool from '../components/PairPool'; // Import the PairPool component


function Trade(props) {

  const [formData, setFormData] = useState({
    type: 'buy', // Default to 'buy', but you can change it
    price: '',
    quantity: '',
  });

  return (
    <div className="trade">
      <div className="container">
        <div style={{height:"40px"}}/>
        <div className='testnet-badge-bar'>
        <div className='testnet-badge'>
          To interact with the MVP, set wallet on Preview Testnet.
        </div>
        </div>
        <div style={{height:"40px"}}/>
        <div className="trade-content">
          <div className='order-content'>
            <PairInfo selectedPair={props.selectedPair} />
            <OrderBook sellOrders={props.sellOrders} buyOrders={props.buyOrders} tokenPrices={props.tokenPrices} selectedPair={props.selectedPair} setFormData={setFormData} />
            <OrderForm 
              formData={formData}
              setFormData={setFormData}
              sellOrders={props.sellOrders} 
              buyOrders={props.buyOrders} 
              lucid={props.lucid} 
              walletAPI={props.walletAPI} 
              selectedPair={props.selectedPair}
              setMessageWindowContent={props.setMessageWindowContent}
              setMessageWindowButtonText={props.setMessageWindowButtonText}
              setShowMessageWindow={props.setShowMessageWindow} 
            />
          </div>
          <PairPool
            allPairs={props.allPairs}
            selectedPair={props.selectedPair}
            onPairSelect={props.onPairSelect}
          />
        </div>
      </div>
    </div>
  );
}

export default Trade;
