// PairInfo.js

import React from 'react';
import poolPmLogo from '../assets/images/poolpm-logo.svg';
import { NETWORK } from '../Constants';
import cardanoscanLogo from '../assets/images/cardanoscan-logo.png';
import './PairInfo.css'; // Import the PairInfo CSS

const PairInfo = ({ selectedPair }) => {
  if (!selectedPair) {
    return null;
  }

  return (
    <div className="pair-info">
      <h2>Token Info</h2>
      <div className='pair-info-parameter'><div>Policy ID:</div><div>{selectedPair.policy_id}</div></div>
      <div className='pair-info-parameter'><div>Token Name::</div><div>{selectedPair.token_name}</div></div>
      <div className='pair-info-parameter'><div>Decimals:</div><div>{selectedPair.decimals}</div></div>
      <div className='pair-info-parameter'><div>Website:</div><div>{selectedPair.url==""?"No website":<a href={selectedPair.url} target="_blank" rel="noopener noreferrer">{selectedPair.url}</a>}</div></div>
      <div className='pair-info-parameter'>
        <div>Reference Links:</div>
        <div style={{display:"flex",gap:"5px"}}>
        <a className="normalLink" href={"https://pool.pm/"+selectedPair.policy_id+"."+selectedPair.token_name} target="_blank" rel="noreferrer noopener"><img className="marketPlaceLogo" src={poolPmLogo} width="26"/></a>
        {NETWORK==1?
            <a className="normalLink" href={"https://cardanoscan.io/token/"+selectedPair.policy_id+"."+selectedPair.token_name} target="_blank" rel="noreferrer noopener"><img className="marketPlaceLogo" src={cardanoscanLogo} width="26"/></a>
            :
            <a className="normalLink" href={"https://preview.cardanoscan.io/token/"+selectedPair.policy_id+"."+selectedPair.token_name} target="_blank" rel="noreferrer noopener"><img className="marketPlaceLogo" src={cardanoscanLogo} width="26"/></a>
        }
        </div>
      </div>
    </div>
  );
};

export default PairInfo;



