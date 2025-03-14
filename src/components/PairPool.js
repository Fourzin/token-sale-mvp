import React, { useState } from 'react';
import { stringToHex,WEBSITE } from '../Constants';
import loadingGIF from '../assets/images/loading.gif';

import './PairPool.css';

function PairPool({ allPairs, selectedPair, onPairSelect }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPairs, setFilteredPairs] = useState(allPairs);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    const filtered = allPairs.filter(pair => pair.name.toLowerCase().includes(query.toLowerCase()));
    setFilteredPairs(filtered);
  };

  if (allPairs != undefined && filteredPairs == undefined){
    setFilteredPairs(allPairs);
  }

  // <button>Add New Pair</button>
  return (
    <div className="pair-pool">
      

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search Trading Pairs"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      <div className="pair-selection">
        <label>Trading Pairs</label>
        <div className="pair-dropdown">
          <ul>
            {allPairs == undefined || filteredPairs == undefined? 
            <div style={{textAlign:"center"}}><br/><img width={32} src={loadingGIF}/></div>
            :
            filteredPairs.map((pair, index) => (
              <li
                key={index}
                onClick={() => onPairSelect(pair)}
                className={pair === selectedPair ? 'selected-pair' : ''}
              >
                <img width='32' src={WEBSITE+'/api/token-logos/'+pair.policy_id+stringToHex(pair.token_name)+'.png'}/>
                {pair.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PairPool;
