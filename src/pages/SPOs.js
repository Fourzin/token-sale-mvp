// src/pages/Home.js
import React, { useState,useEffect } from 'react';
import './SPOs.css'; // Import the CSS file
import searchIcon from '../assets/images/search-icon.svg';
import filterIcon from '../assets/images/filter-icon.png';

import {displayNumberInPrettyFormat,getCurrentEpochNumber} from '../Constants';

let response = await fetch('https://adalink.io/api/get-spos-list.php',{cache:"reload"}); 
let sposList = JSON.parse(await response.text());
let searchedSPOsList = sposList;
//console.log(sposList)
//let selectedSPOID="0";
let currentEpoch = getCurrentEpochNumber();

function updateSPOsSearchResult(searchString){
    
  let searchResult;
  if(searchString === "" || searchString === " ")
    searchResult=sposList;
  else
    searchResult = sposList.reduce(function(list,spo) {if(spo['DisplayName'].toLowerCase().includes(searchString.toLowerCase()) || spo['PoolID'].toLowerCase().includes(searchString) || spo['Ticker'].toLowerCase().includes(searchString)){list.push(spo);}return list;},[]);
  
  
  //check filter values
  let minFee = document?.getElementById('minRangeFixedFees').value;
  let maxFee = document?.getElementById('maxRangeFixedFees').value;
  let minMargin = document?.getElementById('minRangeMargin').value;
  let maxMargin = document?.getElementById('maxRangeMargin').value;
  let minSaturation = document?.getElementById('minRangeSaturation').value;
  let maxSaturation = document?.getElementById('maxRangeSaturation').value;
  let availableCampaign = document?.getElementById("availableCampaign").value;

  //let filteredResult = searchResult;
  
  if(minFee !== ''){
    searchResult = searchResult.reduce(function(list,spo) {if(parseFloat(spo['FixedFees'])/1000000>=parseFloat(minFee))list.push(spo);return list;},[]);
  }
  if(maxFee !== ''){
    searchResult = searchResult.reduce(function(list,spo) {if(parseFloat(spo['FixedFees'])/1000000<=parseFloat(maxFee))list.push(spo);return list;},[]);
  }  
  if(minMargin !== ''){
    searchResult = searchResult.reduce(function(list,spo) {if(parseFloat(spo['Margin'])*100>=parseFloat(minMargin))list.push(spo);return list;},[]);
  }  
  if(maxMargin !== ''){
    searchResult = searchResult.reduce(function(list,spo) {if(parseFloat(spo['Margin'])*100<=parseFloat(maxMargin))list.push(spo);return list;},[]);
  } 
  if(minSaturation !== ''){
    searchResult = searchResult.reduce(function(list,spo) {if(parseFloat(spo['Saturation'])*100>=parseFloat(minSaturation))list.push(spo);return list;},[]);
  }  
  if(maxSaturation !== ''){
    searchResult = searchResult.reduce(function(list,spo) {if(parseFloat(spo['Saturation'])*100<=parseFloat(maxSaturation))list.push(spo);return list;},[]);
  } 
  if(availableCampaign!="All"){
    searchResult = searchResult.reduce(function(list,spo) {if(spo['AvailableCampaign']==availableCampaign)list.push(spo);return list;},[]);
  }

  searchedSPOsList = searchResult;
      
  
}


let SPOSaver;

function SPOs({tposList,selectedSPOID}) {

  let searchOrdering = 0;
  let orderBy;
  const [searchOrderingState,setSearchOrdering] = useState(0); // -1:decending, 0:no preference, 1:ascending
  const [orderByState,setOrderBy] = useState(); //fixedFees,margin,saturation
  //const [selectedSPOID,setSelectedSPOID] = useState();

  const [sposListHTMLSyntax,setSPOsListHTMLSyntax] = useState(constructSPOsListSyntax());

  

  useEffect(() => {

    const intervalId = setInterval(() => {
      // This code will run every 10 seconds
      //In developmenet it is set to 10hrs
      fetch('https://adalink.io/api/get-spos-list.php',{cache:'reload'})
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        sposList = data;
        if(SPOSaver!==undefined)
          selectedSPOID=SPOSaver["ID"];
        updateSPOsSearchResult((document.getElementById('spoSearchInput').value))
        setSPOsListHTMLSyntax(constructSPOsListSyntax())
      })
      .catch((error) => {
        console.error('Error fetching incentive programs:', error);
      });
    }, 10000);

    // Don't forget to clean up the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }); // Empty dependency array to run the effect only once


  function constructSPOsListSyntax(){
    if(searchedSPOsList === undefined)
      return "";
    //order searchedIPsList before mapping
    if(searchOrdering==1){
      searchedSPOsList=searchedSPOsList.sort((a,b) => parseFloat(a[orderBy])-parseFloat(b[orderBy]));
    }else if(searchOrdering==-1){
      searchedSPOsList=searchedSPOsList.sort((a,b) => parseFloat(b[orderBy])-parseFloat(a[orderBy]));
    }
    
    let htmlBlocks = searchedSPOsList.map((spo) => (
      <div key={spo['PoolID']} className="spo-section "  onClick={() => {if(selectedSPOID===spo["ID"]){selectedSPOID="0";SPOSaver=undefined}else{selectedSPOID=spo["ID"];SPOSaver=spo;}setSPOsListHTMLSyntax(constructSPOsListSyntax())} }>
        <div className='spo-section-header'>
          <div className='spo-pfp-in-spo-header'>
            <img alt="" src={spo["PFP"]} width={100} />
          </div>
          <div className='spo-header-parameter-section'>
            <div>TICKER</div>
            <div>{spo["Ticker"]}</div>
          </div>
          <div className='spo-header-parameter-section'>
            <div>Display Name</div>
            <div>{spo["DisplayName"]}</div>
          </div>
          <div className='spo-header-parameter-section'>
            <div>Fixed Fees</div>
            <div>{(parseFloat(spo["FixedFees"])/1000000).toFixed(2)} ₳</div>
          </div>
          <div className='spo-header-parameter-section'>
            <div>Margin</div>
            <div>{(parseFloat(spo["Margin"])*100).toFixed(2)}%</div>
          </div>
          <div className='spo-header-parameter-section'>
            <div>Saturation</div>
            <div>{(parseFloat(spo["Saturation"])*100).toFixed(2)}%</div>
          </div>
          <div className='spo-header-parameter-section'>
            <div>Available Campaign</div>
            {tposList.some((ip) => ip["PoolID"]==spo["PoolID"] && ip["EndEpoch"]>currentEpoch)?
            <>
            <div style={{display:"none"}}>{spo["AvailableCampaign"]="Yes"}</div>
            <div>{"Yes"}</div>
            </>
            :
            <>
            <div style={{display:"none"}}>{spo["AvailableCampaign"]="No"}</div>
            <div>{"No"}</div>
            </>
            }
          </div>                                
        </div>
        <div className='spo-section-body' id={"spo-"+spo["ID"]} style={{height: selectedSPOID===spo["ID"]?document.getElementById("spo-"+spo["ID"]).scrollHeight:'0px'}}>
          <hr />
          <div className='spo-parameter-area'>
            <div>Pool ID:</div>
            <div>{spo["PoolID"]}</div>
          </div>
          <div className='spo-details-area'>
            <div className='spo-sub-details-area'>
              <div className='spo-parameter-area'>
                <div>Live Stake:</div>
                <div>{displayNumberInPrettyFormat((parseFloat(spo["LiveStake"])/1000000).toFixed(0))} ₳</div>
              </div>    
              <div className='spo-parameter-area'>
                <div>Active Stake:</div>
                <div>{displayNumberInPrettyFormat((parseFloat(spo["ActiveStake"])/1000000).toFixed(0))} ₳</div>
              </div>    
              {/*<div className='spo-parameter-area'>
                <div>Recent ROA:</div>
                <div>{spo["RecentROA"]}</div>
              </div>*/}    
            </div>
            <div className='spo-sub-details-area'>
              <div className='spo-parameter-area'>
                <div>Delegators Count:</div>
                <div>{displayNumberInPrettyFormat(spo["DelegatorsCount"])}</div>
              </div>    
              <div className='spo-parameter-area'>
                <div>Pledge Amount:</div>
                <div>{displayNumberInPrettyFormat((parseFloat(spo["Pledge"])/1000000).toFixed(0))} ₳</div>
              </div>    
            </div>   
            <div className='spo-sub-details-area'>
              <div className='spo-parameter-area'>
                <div>Creation Date:</div>
                <div>{new Date(spo["CreationDate"]*1000).toUTCString()}</div>
              </div> 
              {/*<div className='spo-parameter-area'>
                <div>Lifetime ROA:</div>
                <div>{spo["LifeTimeROA"]}</div>
              </div>   
              <div className='spo-parameter-area'>
                <div>Lifetime Luck:</div>
                <div>{spo["LifeTimeLuck"]}</div>
              </div>*/}   
            </div>      
          </div>
        </div>
      </div>
    ));
    
    
    return(
      <div className={"slide-in-fwd-center"} id="spos-list">
          {htmlBlocks.every(function (block) {return block === ''})?
          <div className="" style={{marginLeft:"5px",color:"var(--major-color)"}}>None of the stake pools include the search input.</div>
          :
          htmlBlocks}
      </div>
  );
  }
  


  return (
    <div className="home">
      <div className="container">
        <div style={{height:"4rem"}}></div>
        <div className=''>
          <div className="search-bar-container">
            <div className="search-bar">
              <img alt='' src={searchIcon} style={{marginLeft:"5px",marginTop:"6px",float:"left"}}/>  
              <input className="search-input" placeholder="Search by pool ticker, id or name..." id="spoSearchInput" onChange={() => {updateSPOsSearchResult(document.getElementById('spoSearchInput').value);setSPOsListHTMLSyntax(constructSPOsListSyntax())}}></input>
            </div>
          </div>
          <div className='filter-container'>
            <img alt='' src={filterIcon} width={26}/>
            <div className='filter-parameter-element'>
              <div>Fixed Fees</div>
              <div className='filter-arrows'>
                <div  className='filter-arrow-icon'
                      style={{color:(searchOrderingState===1&&orderByState==="FixedFees")?"var(--major-backgroundColor)":"var(--main-borderColor)"}}
                      onClick={() => {if(searchOrdering===1&&orderBy==="FixedFees"){searchOrdering=0;orderBy=null;setSearchOrdering(0);setOrderBy()}else{searchOrdering=1;orderBy="FixedFees";setSearchOrdering(1);setOrderBy("FixedFees")};setSPOsListHTMLSyntax(constructSPOsListSyntax())}}>
                  ▲
                </div>
                <div  className='filter-arrow-icon'
                      style={{color:(searchOrderingState===-1&&orderByState==="FixedFees")?"var(--major-backgroundColor)":"var(--main-borderColor)"}}
                      onClick={() => {if(searchOrdering===-1&&orderBy==="FixedFees"){searchOrdering=0;orderBy=null;setSearchOrdering(0);setOrderBy()}else{searchOrdering=-1;orderBy="FixedFees";setSearchOrdering(-1);setOrderBy("FixedFees")};setSPOsListHTMLSyntax(constructSPOsListSyntax())}}>
                  ▼
                </div>
              </div>
              <div className='filter-input-range'>
                <input  className='filter-input-text' type='number' id='minRangeFixedFees' onChange={() => {updateSPOsSearchResult(document.getElementById('spoSearchInput').value);setSPOsListHTMLSyntax(constructSPOsListSyntax())}}/>
                <div>-</div>
                <input className='filter-input-text' type='number' id='maxRangeFixedFees' onChange={() => {updateSPOsSearchResult(document.getElementById('spoSearchInput').value);setSPOsListHTMLSyntax(constructSPOsListSyntax())}}/>
              </div>
            </div>
            <div className='filter-parameter-element'>
              <div>Margin</div>
              <div className='filter-arrows'>
                <div  className='filter-arrow-icon'
                      style={{color:(searchOrderingState===1&&orderByState==="Margin")?"var(--major-backgroundColor)":"var(--main-borderColor)"}}
                      onClick={() => {if(searchOrdering===1&&orderBy==="Margin"){searchOrdering=0;orderBy=null;setSearchOrdering(0);setOrderBy()}else{searchOrdering=1;orderBy="Margin";setSearchOrdering(1);setOrderBy("Margin")};setSPOsListHTMLSyntax(constructSPOsListSyntax())}}>
                  ▲
                </div>
                <div  className='filter-arrow-icon'
                      style={{color:(searchOrderingState===-1&&orderByState==="Margin")?"var(--major-backgroundColor)":"var(--main-borderColor)"}}
                      onClick={() => {if(searchOrdering===-1&&orderBy==="Margin"){searchOrdering=0;orderBy=null;setSearchOrdering(0);setOrderBy()}else{searchOrdering=-1;orderBy="Margin";setSearchOrdering(-1);setOrderBy("Margin")};setSPOsListHTMLSyntax(constructSPOsListSyntax())}}>
                  ▼
                </div>
              </div>
              <div className='filter-input-range'>
                <input className='filter-input-text' type='number' id='minRangeMargin' onChange={() => {updateSPOsSearchResult(document.getElementById('spoSearchInput').value);setSPOsListHTMLSyntax(constructSPOsListSyntax())}}/>
                <div>-</div>
                <input className='filter-input-text' type='number' id='maxRangeMargin' onChange={() => {updateSPOsSearchResult(document.getElementById('spoSearchInput').value);setSPOsListHTMLSyntax(constructSPOsListSyntax())}}/>
              </div>
            </div>     
            <div className='filter-parameter-element'>
              <div>Saturation</div>
              <div className='filter-arrows'>
                <div  className='filter-arrow-icon'
                      style={{color:(searchOrderingState===1&&orderByState==="Saturation")?"var(--major-backgroundColor)":"var(--main-borderColor)"}}
                      onClick={() => {if(searchOrdering===1&&orderBy==="Saturation"){searchOrdering=0;orderBy=null;setSearchOrdering(0);setOrderBy()}else{searchOrdering=1;orderBy="Saturation";setSearchOrdering(1);setOrderBy("Saturation")};setSPOsListHTMLSyntax(constructSPOsListSyntax())}}>
                  ▲
                </div>
                <div  className='filter-arrow-icon'
                      style={{color:(searchOrderingState===-1&&orderByState==="Saturation")?"var(--major-backgroundColor)":"var(--main-borderColor)"}}
                      onClick={() => {if(searchOrdering===-1&&orderBy==="Saturation"){searchOrdering=0;orderBy=null;setSearchOrdering(0);setOrderBy()}else{searchOrdering=-1;orderBy="Saturation";setSearchOrdering(-1);setOrderBy("Saturation")};setSPOsListHTMLSyntax(constructSPOsListSyntax())}}>
                  ▼
                </div>
              </div>
              <div className='filter-input-range'>
                <input className='filter-input-text' type='number' id='minRangeSaturation' onChange={() => {updateSPOsSearchResult(document.getElementById('spoSearchInput').value);setSPOsListHTMLSyntax(constructSPOsListSyntax())}}/>
                <div>-</div>
                <input className='filter-input-text' type='number' id='maxRangeSaturation' onChange={() => {updateSPOsSearchResult(document.getElementById('spoSearchInput').value);setSPOsListHTMLSyntax(constructSPOsListSyntax())}}/>
              </div>
            </div>
            <div className='filter-parameter-element'>
              <div>Available Campaign</div>
              <select id="availableCampaign" onChange={() => {updateSPOsSearchResult(document.getElementById('spoSearchInput').value);setSPOsListHTMLSyntax(constructSPOsListSyntax())}}>
                <option value="All">All</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>                    
          </div>
          <div className='spos-section'>
            {sposListHTMLSyntax}  
          </div>          
        </div>
      </div>
    </div>
  );
}

export default SPOs;
