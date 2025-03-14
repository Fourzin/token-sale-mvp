// src/pages/Home.js
import React, { useState,useEffect } from 'react';
import './Home.css';
import './SPOs.css'; // Import the CSS file
import { NETWORK } from '../Constants';
import CreateProgramWindow from '../components/CreateProgramWindow';
import AffiliateLinkWindow from '../components/AffiliateLinkWindow';
import BonusRequestWindow from '../components/BonusRequestWindow';
import searchIcon from '../assets/images/search-icon.svg';
import filterIcon from '../assets/images/filter-icon.png';

import {displayNumberInPrettyFormat,getCurrentEpochNumber} from '../Constants';
import TokenOfferingSummary from '../components/TokenOfferingSummary';
import TakeActionWindow from '../components/TakeActionWindow';
import TokenMetaEnteringWindow from '../components/TokenMetaEnteringWindow';

let response = await fetch('https://adalink.io/api/get-projects-record.php',{cache:"reload"}); 
let projectsRecord = JSON.parse(await response.text());
projectsRecord = JSON.parse(projectsRecord);
//let searchedIPsList = ipsList;
let selectedIP;
let currentEpoch = getCurrentEpochNumber();


function Home({isLoggedIn,tposList,setTPOsList,accountInfo,setImportantTPOsList,walletAPI,lucid,selectedIPID,setMessageWindowContent,setMessageWindowButtonText,setShowMessageWindow}) {

  let searchedIPsList;
  //ipsList;
  let searchOrdering = 0;
  let orderBy;
  const [searchOrderingState,setSearchOrdering] = useState(0); // -1:decending, 0:no preference, 1:ascending
  const [orderByState,setOrderBy] = useState(); //fixedFees,margin,saturation
  
  const [isCreateProgramWindowOpen,setCreateWindowOpen]=useState(false);
  const [isAffiliateLinkWindowOpen,setAffiliateLinkWindowOpen]=useState(false);
  const [isBonusRequestWindowOpen,setBonusRequestWindowOpen]=useState(false);
  const [isTokenOfferingSummaryWindowOpen,setTokenOfferingSummaryWindowOpen] = useState(false);
  const [isTokenMetaEnteringWindowOpen,setTokenMetaEnteringWindowOpen] = useState(false);
  
  const [tokenOfferingSummary,setTokenOfferingSummary]=useState();
  const [isTakeActionWindowOpen,setTakeActionWindowOpen] = useState(false);
  const [takeActionMessage,setTakeAcitonMessage] = useState("");
  const [takeActionMethod,setTakeActionMethod] = useState();
  
  const [ipsListHTMLSyntax,setIPsListHTMLSyntax] = useState(constructTPOsListSyntax());

  useEffect(() => {
    document.getElementById("nav-item-1").style.fontWeight="bold";
    updateIPsSearchResult(' ');
    setIPsListHTMLSyntax(constructTPOsListSyntax());
  },[])

  useEffect(() => {

    const intervalId = setInterval(() => {
      // This code will run every 10 seconds
      //in development it is set to 10 hrs instead of 10000
      
      fetch(NETWORK===1?"https://adalink.io/api/get-tpos-list.php?network=mainnet":"https://adalink.io/api/get-tpos-list.php?network=preview",{cache:'reload'})
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setTPOsList(data);
        if(selectedIP!==undefined)
          selectedIPID=selectedIP["ID"];
        updateIPsSearchResult((document.getElementById('ipSearchInput').value))
        setIPsListHTMLSyntax(constructTPOsListSyntax())
        
      })
      .catch((error) => {
        console.error('Error fetching incentive programs:', error);
      });
    }, 10000); //36000000 10000

    // Don't forget to clean up the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }); // Empty dependency array to run the effect only once
 
  function updateIPsSearchResult(searchString){
    
    let searchResult;
    
    if(searchString === "" || searchString === " ")
      searchResult=tposList;
    else
      searchResult = tposList.reduce(function(list,ip) {if(projectsRecord[ip['ProjectID']]['DisplayName'].toLowerCase().includes(searchString.toLowerCase()) || ip['Name'].toLowerCase().includes(searchString) || ip['Ticker'].toLowerCase().includes(searchString)){list.push(ip);}return list;},[]);
    
    
    //check filter values
    let minRewardRate = document?.getElementById('minRewardRate').value;
    let maxRewardRate = document?.getElementById('maxRewardRate').value;
    /*let minStartEpoch = document?.getElementById('minStartEpoch').value;
    let maxStartEpoch = document?.getElementById('maxStartEpoch').value;
    let minEndEpoch = document?.getElementById('minEndEpoch').value;
    let maxEndEpoch = document?.getElementById('maxEndEpoch').value;
    let campaignStatus = document?.getElementById("campaignStatus").value;*/
  
    //let filteredResult = searchResult;
    
    if(minRewardRate !== ''){
      searchResult = searchResult.reduce(function(list,ip) {if(parseFloat(ip['CommissionRate'])>=parseFloat(minRewardRate))list.push(ip);return list;},[]);
    }
    if(maxRewardRate !== ''){
      searchResult = searchResult.reduce(function(list,ip) {if(parseFloat(ip['CommissionRate'])<=parseFloat(maxRewardRate))list.push(ip);return list;},[]);
    }  
    /*if(minStartEpoch !== ''){
      searchResult = searchResult.reduce(function(list,ip) {if(ip['StartEpoch']>=minStartEpoch)list.push(ip);return list;},[]);
    }  
    if(maxStartEpoch !== ''){
      searchResult = searchResult.reduce(function(list,ip) {if(ip['StartEpoch']<=maxStartEpoch)list.push(ip);return list;},[]);
    } 
    if(minEndEpoch !== ''){
      searchResult = searchResult.reduce(function(list,ip) {if(ip['EndEpoch']>=minEndEpoch)list.push(ip);return list;},[]);
    }  
    if(maxEndEpoch !== ''){
      searchResult = searchResult.reduce(function(list,ip) {if(ip['EndEpoch']<=maxEndEpoch)list.push(ip);return list;},[]);
    } 
    if(campaignStatus == "active"){
      //searchResult = searchResult.reduce(function(list,ip) {if((ip['EndEpoch']-1)>currentEpoch)list.push(ip);return list;},[]);
    }
    if(campaignStatus == "ended"){
      searchResult = searchResult.reduce(function(list,ip) {if((ip['EndEpoch']-1)<=currentEpoch)list.push(ip);return list;},[]);
    }*/
  
  
    searchedIPsList = searchResult;
    
    
  }


  function constructTPOsListSyntax(){
    
    if(searchedIPsList === undefined)
      return "";
    //order searchedIPsList before mapping
    if(searchOrdering==1){
      searchedIPsList=searchedIPsList.sort((a,b) => parseInt(a[orderBy])-parseInt(b[orderBy]));
    }else if(searchOrdering==-1){
      searchedIPsList=searchedIPsList.sort((a,b) => parseInt(b[orderBy])-parseInt(a[orderBy]));
    }
    let htmlBlocks = searchedIPsList.map((ip) => (
      <div key={ip['ID']} className="ip-section "  >
        <div className='ip-section-header ' onClick={() => {if(selectedIPID===ip["ID"]){selectedIPID="0";selectedIP=undefined}else{selectedIPID=ip["ID"];selectedIP=ip};setIPsListHTMLSyntax(constructTPOsListSyntax())} }>
          <div className='spo-pfp-in-spo-header'>
            <img alt="" src={ip["MetadataSource"]=="cardano"?"data:image/png;base64, "+ip["Logo_Base64"]:ip['Logo_URL']} width={100} />
          </div>
          <div className='spo-header-parameter-section'>
            <div>Name</div>
            <div>{ip['Name']}</div>
          </div>
          <div className='spo-header-parameter-section'>
            <div>TICKER</div>
            <div>{ip["Ticker"]}</div>
          </div>
          <div className='spo-header-parameter-section'>
            <div>Price</div>
            <div>{ip["Price"]} ₳/{ip['Ticker']}</div>
          </div>
          <div className='spo-header-parameter-section'>
            <div>Status</div>
            {Date.now()/1000<(ip['EndAfter'])?
            <div>Active</div>
            :
            <div>Ended</div>
            }
          </div>
          <div className='spo-header-parameter-section'>
            {Date.now()/1000<(ip['EndAfter'])?
            <>
            <div>Ends After</div>
            <div>{new Date(ip['EndAfter']*1000).toLocaleDateString('default', {day:'numeric',month: 'short',year:'numeric' })}</div>
            </>
            :
            <>
            <div>Ends After</div>
            <div>{new Date(ip['EndAfter']*1000).toLocaleDateString('default', {day:'numeric',month: 'short',year:'numeric' })}</div>
            </>
            }
          </div>
          <div className='spo-header-parameter-section'>
            <div>Commission Rate</div>
            <div>{ip["CommissionRate"]} %</div>
          </div>                            
        </div>
        <div className='spo-section-body' id={"ip-"+ip["ID"]} style={{height: selectedIPID===ip["ID"]?document.getElementById("ip-"+ip["ID"]).scrollHeight:'0px'}}>
          <hr />
          <div className='spo-parameter-area'>
            <div><b>Policy ID</b>:</div>
            <div>{ip['PolicyID']}</div>
          </div>
          <div className='spo-parameter-area'>
            <div><b>Description</b>:</div>
            <div>{ip['Description']}</div>
          </div>
          <div className='spo-parameter-area'>
            <div><b>URL</b>:</div>
            <div>{ip['URL']}</div>
          </div>
          <div className='spo-parameter-area'>
            <div><b>Initial Amount of Total Fund</b>:</div>
            <div>{displayNumberInPrettyFormat((parseFloat(ip["InitialTotalFunds"])/Math.pow(10,parseInt(ip['Decimals']))).toFixed(parseInt(ip['Decimals'])))} {ip['Ticker']}</div>
          </div>
          <div className='ip-details-area'>
            <div className='spo-sub-details-area'>
              <div className='spo-parameter-area'>
                {Date.now()/1000<(ip['EndAfter'])?
                <>
                <div><b>Current Available Fund in Pool</b>:</div>
                <div>{displayNumberInPrettyFormat((parseFloat(ip["CurrentTotalFunds"])/Math.pow(10,parseInt(ip['Decimals']))).toFixed(ip['Decimals']))} {ip['Ticker']}</div>
                </>
                :
                <>
                <div><b>Final Remaind Funds After Campaign</b>:</div>
                <div>{displayNumberInPrettyFormat((parseFloat(ip["CurrentTotalFunds"])/Math.pow(10,parseInt(ip['Decimals']))).toFixed(ip['Decimals']))} {ip['Ticker']}</div>              
                </>}
              </div>      
            </div>
            {
            Date.now()/1000<(ip['EndAfter'])?
            <div className='ip-sub-details-area'>
              <button className='btnType1' style={{display:"none"}} onClick={() => {setBonusRequestWindowOpen(true)}}>Request bonus</button>
              <button className='btnType1' onClick={() => {setAffiliateLinkWindowOpen(true)}}>Generate affiliate link</button>
            </div>
            :
            <></>
            }
          </div>
        </div>
      </div>
    ));
    
    return(
      <div className={"slide-in-fwd-center"} id="spos-list">
          {htmlBlocks.every(function (block) {return block === ''})?
          <div className="" style={{marginLeft:"5px",color:"var(--major-color)"}}>There are no available token campaigns at the moment.</div>
          :
          htmlBlocks}
      </div>
  );
  }
  


  return (
    <div className="home">
      <div className="container">
        <div style={{height:"4rem"}}>{}</div>
        <div className=''>
          <div className='header-section-of-ips'>
            <div className="search-bar-container">
              <div className="search-bar">
                <img alt='' src={searchIcon} style={{marginLeft:"5px",marginTop:"6px",float:"left"}}/>  
                <input className="search-input" placeholder="Search by token ticker, name or project name..." id="ipSearchInput" onChange={() => {updateIPsSearchResult(document.getElementById('ipSearchInput').value);setIPsListHTMLSyntax(constructTPOsListSyntax())}}></input>
              </div>
            </div>
            {(isLoggedIn && accountInfo["ProjectID"]!==undefined)?
              <button className='btnType1' onClick={() => {setCreateWindowOpen(true)}}>Launch new token campaign</button>
              :
              <></>
            }
          </div>
          <div className='filter-container'>
            <img alt='' src={filterIcon} width={26}/>
            <div className='filter-parameter-element'>
              <div>Commission Rate</div>
              <div className='filter-arrows'>
                <div  className='filter-arrow-icon'
                      style={{color:(searchOrderingState===1&&orderByState==="RewardRate")?"var(--major-backgroundColor)":"var(--main-borderColor)"}}
                      onClick={() => {if(searchOrdering===1&&orderBy==="RewardRate"){searchOrdering=0;orderBy=null;setSearchOrdering(0);setOrderBy()}else{searchOrdering=1;orderBy="RewardRate";setSearchOrdering(1);setOrderBy("RewardRate")};setIPsListHTMLSyntax(constructTPOsListSyntax())}}>
                  ▲
                </div>
                <div  className='filter-arrow-icon'
                      style={{color:(searchOrderingState===-1&&orderByState==="RewardRate")?"var(--major-backgroundColor)":"var(--main-borderColor)"}}
                      onClick={() => {if(searchOrdering===-1&&orderBy==="RewardRate"){searchOrdering=0;orderBy=null;setSearchOrdering(0);setOrderBy()}else{searchOrdering=-1;orderBy="RewardRate";setSearchOrdering(-1);setOrderBy("RewardRate")};setIPsListHTMLSyntax(constructTPOsListSyntax())}}>
                  ▼
                </div>
              </div>
              <div className='filter-input-range' >
                <input  className='filter-input-text'  type='number' id='minRewardRate' onChange={() => {updateIPsSearchResult(document.getElementById('ipSearchInput').value);setIPsListHTMLSyntax(constructTPOsListSyntax())}}/>
                <div>%</div>
                <div>-</div>
                <input className='filter-input-text' type='number' id='maxRewardRate' onChange={() => {updateIPsSearchResult(document.getElementById('ipSearchInput').value);setIPsListHTMLSyntax(constructTPOsListSyntax())}}/>
                <div>%</div>
              </div>
            </div>
            {/*<div className='filter-parameter-element'>
              <div>Start Epoch</div>
              <div className='filter-arrows'>
                <div  className='filter-arrow-icon'
                      style={{color:(searchOrderingState===1&&orderByState==="StartEpoch")?"var(--major-backgroundColor)":"var(--main-borderColor)"}}
                      onClick={() => {if(searchOrdering===1&&orderBy==="StartEpoch"){searchOrdering=0;orderBy=null;setSearchOrdering(0);setOrderBy()}else{searchOrdering=1;orderBy="StartEpoch";setSearchOrdering(1);setOrderBy("StartEpoch")};setIPsListHTMLSyntax(constructTPOsListSyntax())}}>
                  ▲
                </div>
                <div  className='filter-arrow-icon'
                      style={{color:(searchOrderingState===-1&&orderByState==="StartEpoch")?"var(--major-backgroundColor)":"var(--main-borderColor)"}}
                      onClick={() => {if(searchOrdering===-1&&orderBy==="StartEpoch"){searchOrdering=0;orderBy=null;setSearchOrdering(0);setOrderBy()}else{searchOrdering=-1;orderBy="StartEpoch";setSearchOrdering(-1);setOrderBy("StartEpoch")};setIPsListHTMLSyntax(constructTPOsListSyntax())}}>
                  ▼
                </div>
              </div>
              <div className='filter-input-range'>
                <input className='filter-input-text' type='number' id='minStartEpoch' onChange={() => {updateIPsSearchResult(document.getElementById('ipSearchInput').value);setIPsListHTMLSyntax(constructTPOsListSyntax())}}/>
                <div>-</div>
                <input className='filter-input-text' type='number' id='maxStartEpoch' onChange={() => {updateIPsSearchResult(document.getElementById('ipSearchInput').value);setIPsListHTMLSyntax(constructTPOsListSyntax())}}/>
              </div>
            </div>*/}     
            {/*<div className='filter-parameter-element'>
              <div>End Epoch</div>
              <div className='filter-arrows'>
                <div  className='filter-arrow-icon'
                      style={{color:(searchOrderingState===1&&orderByState==="EndEpoch")?"var(--major-backgroundColor)":"var(--main-borderColor)"}}
                      onClick={() => {if(searchOrdering===1&&orderBy==="EndEpoch"){searchOrdering=0;orderBy=null;setSearchOrdering(0);setOrderBy()}else{searchOrdering=1;orderBy="EndEpoch";setSearchOrdering(1);setOrderBy("EndEpoch")};setIPsListHTMLSyntax(constructTPOsListSyntax())}}>
                  ▲
                </div>
                <div  className='filter-arrow-icon'
                      style={{color:(searchOrderingState===-1&&orderByState==="EndEpoch")?"var(--major-backgroundColor)":"var(--main-borderColor)"}}
                      onClick={() => {if(searchOrdering===-1&&orderBy==="EndEpoch"){searchOrdering=0;orderBy=null;setSearchOrdering(0);setOrderBy()}else{searchOrdering=-1;orderBy="EndEpoch";setSearchOrdering(-1);setOrderBy("EndEpoch")};setIPsListHTMLSyntax(constructTPOsListSyntax())}}>
                  ▼
                </div>
              </div>
              <div className='filter-input-range'>
                <input className='filter-input-text' type='number' id='minEndEpoch' onChange={() => {updateIPsSearchResult(document.getElementById('ipSearchInput').value);setIPsListHTMLSyntax(constructTPOsListSyntax())}}/>
                <div>-</div>
                <input className='filter-input-text' type='number' id='maxEndEpoch' onChange={() => {updateIPsSearchResult(document.getElementById('ipSearchInput').value);setIPsListHTMLSyntax(constructTPOsListSyntax())}}/>
              </div>
            </div>*/}
            {/*<div className='filter-parameter-element'>
              <div>Status</div>
              <select id="campaignStatus" onChange={() => {updateIPsSearchResult(document.getElementById('ipSearchInput').value);setIPsListHTMLSyntax(constructTPOsListSyntax())}}>
                <option value="active">Active</option>
                <option value="all">All</option>
                <option value="ended">Ended</option>
              </select>
            </div>*/}                    
          </div>
          <div className='spos-section'>
            {ipsListHTMLSyntax}  
          </div>          
        </div>
      </div>
    {isCreateProgramWindowOpen &&
    <CreateProgramWindow
      isLoggedIn={isLoggedIn}
      accountInfo={accountInfo}
      walletAPI={walletAPI}
      lucid={lucid}
      onClose={() => {setCreateWindowOpen(false)}}
      setMessageWindowContent={setMessageWindowContent}
      setMessageWindowButtonText={setMessageWindowButtonText}
      setShowMessageWindow={setShowMessageWindow}  
      setTakeActionMessage={setTakeAcitonMessage}
      setTakeActionMethod={setTakeActionMethod}
      setTokenMetaEnteringWindowOpen={setTokenMetaEnteringWindowOpen}
      setTakeActionWindowOpen={setTakeActionWindowOpen}
      setTokenOfferingSummaryWindowOpen={setTokenOfferingSummaryWindowOpen}
      setTokenOfferingSummary={setTokenOfferingSummary}
    />
    }
    {isTokenOfferingSummaryWindowOpen &&
    <TokenOfferingSummary
      tokenOfferingSummary={tokenOfferingSummary}
      walletAPI={walletAPI}
      lucid={lucid}
      accountInfo={accountInfo}
      onClose={() => setTokenOfferingSummaryWindowOpen(false)} // Close OrderSummary
      setMessageWindowContent={setMessageWindowContent}
      setMessageWindowButtonText={setMessageWindowButtonText}
      setShowMessageWindow={setShowMessageWindow}  
    />
    }
    {isTakeActionWindowOpen &&
    <TakeActionWindow
        message={takeActionMessage}
        onClose={() => setTakeActionWindowOpen(false)}
        onAction={ () => {takeActionMethod(true)}}
    />
    }
    {isTokenMetaEnteringWindowOpen &&
    <TokenMetaEnteringWindow
      tokenPolicyID={tokenOfferingSummary.tokenPolicyID}
      tokenName={tokenOfferingSummary.tokenName}
      onClose={() => setTokenMetaEnteringWindowOpen(false)}
      setMessageWindowContent={setMessageWindowContent}
      setMessageWindowButtonText={setMessageWindowButtonText}
      setShowMessageWindow={setShowMessageWindow}
    />
    }
    {isAffiliateLinkWindowOpen &&
    <AffiliateLinkWindow
      isLoggedIn={isLoggedIn}
      accountInfo={accountInfo}
      tpo={selectedIP}
      project={projectsRecord[selectedIP["ProjectID"]]}
      setImportantTPOsList={setImportantTPOsList}
      onClose={() => {setAffiliateLinkWindowOpen(false)}}
      setMessageWindowContent={setMessageWindowContent}
      setMessageWindowButtonText={setMessageWindowButtonText}
      setShowMessageWindow={setShowMessageWindow}  
    />
    }
    {isBonusRequestWindowOpen &&
    <BonusRequestWindow
      isLoggedIn={isLoggedIn}
      accountInfo={accountInfo}
      ip={selectedIP}
      spo={projectsRecord[selectedIP["ProjectID"]]}
      setImportantTPOsList={setImportantTPOsList}
      onClose={() => {setBonusRequestWindowOpen(false)}}
      setMessageWindowContent={setMessageWindowContent}
      setMessageWindowButtonText={setMessageWindowButtonText}
      setShowMessageWindow={setShowMessageWindow}  
    />
    }
    </div>
  );
}

export default Home;
