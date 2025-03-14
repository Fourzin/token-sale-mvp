// src/pages/Home.js
import React, { useState,useEffect } from 'react';
import './Projects.css'; // Import the CSS file
import searchIcon from '../assets/images/search-icon.svg';
import filterIcon from '../assets/images/filter-icon.png';

import {displayNumberInPrettyFormat,getCurrentEpochNumber} from '../Constants';

let response = await fetch('https://adalink.io/api/get-projects-list.php',{cache:"reload"}); 
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
    searchResult = sposList.reduce(function(list,spo) {if(spo['DisplayName'].toLowerCase().includes(searchString.toLowerCase()) || spo['Type'].toLowerCase().includes(searchString) ){list.push(spo);}return list;},[]);
  
  
  //check filter values
  let projectType = document?.getElementById("projectType").value;
  let availableCampaign = document?.getElementById("availableCampaign").value;

  //let filteredResult = searchResult;
  
  if(projectType != "All"){
    searchResult = searchResult.reduce(function(list,spo) {if(spo['Type']==projectType)list.push(spo);return list;},[]);
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
      fetch('https://adalink.io/api/get-projects-list.php',{cache:'reload'})
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
      <div key={spo['UniqueID']} className="spo-section "  onClick={() => {if(selectedSPOID===spo["ID"]){selectedSPOID="0";SPOSaver=undefined}else{selectedSPOID=spo["ID"];SPOSaver=spo;}setSPOsListHTMLSyntax(constructSPOsListSyntax())} }>
        <div className='spo-section-header'>
          <div className='project-pfp-and-name-in-header'>
            <div className='spo-pfp-in-spo-header'>
              <img alt="" src={spo["PFP"]} width={100} />
            </div>
            <div className='spo-header-parameter-section'>
              <div>Project Name</div>
              <div>{spo["DisplayName"]}</div>
            </div>
            <div className='spo-header-parameter-section'>
              <div>Type</div>
              <div>{spo["Type"]}</div>
            </div>
          </div>
          <div className='spo-header-parameter-section'>
            <div>Available Campaign</div>
            {tposList.some((ip) => ip["ProjectID"]==spo["UniqueID"] && ip["EndAfter"]>parseInt(Date.now()/1000))?
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
            <div>Website:</div>
            <div>{spo["Website"]}</div>
          </div>
          <div className='spo-parameter-area'>
            <div>Social Link:</div>
            <div>{spo["SocialLink"]}</div>
          </div>
          <div className='spo-parameter-area'>
            <div>Description:</div>
            <div>{spo["Description"]}</div>
          </div>
        </div>
      </div>
    ));
    
    
    return(
      <div className={"slide-in-fwd-center"} id="spos-list">
          {htmlBlocks.every(function (block) {return block === ''})?
          <div className="" style={{marginLeft:"5px",color:"var(--major-color)"}}>None of the registered projects include the search input.</div>
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
              <input className="search-input" placeholder="Search by project name or type..." id="spoSearchInput" onChange={() => {updateSPOsSearchResult(document.getElementById('spoSearchInput').value);setSPOsListHTMLSyntax(constructSPOsListSyntax())}}></input>
            </div>
          </div>
          <div className='projects-filter-container'>
            <img alt='' src={filterIcon} width={26}/>   
            <div className='filter-parameter-element'>
              <div>Type</div>
              <select id="projectType" onChange={() => {updateSPOsSearchResult(document.getElementById('spoSearchInput').value);setSPOsListHTMLSyntax(constructSPOsListSyntax())}}>
                <option value="All">All</option>
                <option value="DEFI">DEFI</option>
                <option value="DEPIN">DEPIN</option>
                <option value="NFT">NFT</option>
                <option value="DAO">DAO</option>
                <option value="MEME">MEME</option>
                <option value="Marketing">Marketing</option>
              </select>
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
