/* global BigInt */
import React from 'react';

import './SignUpWindow.css';



const EditWindow = ({ onClose,parameterToBeEdited,accountInfo,setAccountInfo,setMessageWindowContent,setMessageWindowButtonText,setShowMessageWindow}) => {


  const closeWindow = (event) => {
      if(event.target.className.toString()==="backdrop"){ 
        onClose();
    }
  }

  async function handleParameterEdit() {

    let parameterNewValue = document.getElementById('parameterToBeEdited').value;
    //check user input
    switch(parameterToBeEdited){
      case "Display Name":
        if(parameterNewValue.replace(/\s/g, "").length<5){
          setMessageWindowContent("Display name has to be longer than 4 charecters.");
          setMessageWindowButtonText('OK');
          setShowMessageWindow(true);
          return;
        }
      break;
      case 'Website':
        if(parameterNewValue.replace(/\s/g, "").length<1){
          setMessageWindowContent("No user input.");
          setMessageWindowButtonText('OK');
          setShowMessageWindow(true);
          return;
        }
      break;
      case "Social Link":
        if(parameterNewValue.replace(/\s/g, "").length<1){
          setMessageWindowContent("No user input.");
          setMessageWindowButtonText('OK');
          setShowMessageWindow(true);
          return;
        }
      break;
    }
    
    setMessageWindowContent("Editing...");
    setMessageWindowButtonText('')
    setShowMessageWindow(true);

    let paymentAddress = accountInfo["WalletAddress"];
    let stakeAddress = accountInfo["StakeAddress"];
    let userType = "Affiliate";
    if (accountInfo["UniqueID"]===undefined)
      userType = "SPO";

    let key=paymentAddress.substring(11,12)+paymentAddress.substring(22,23)+paymentAddress.substring(33,34)+paymentAddress.substring(44,45);
    //console.log(key)
    //console.log("https://adalink.io/api/edit-user-parameter-adalink.php?stakeAddress="+stakeAddress+'&parameter='+parameterToBeEdited.replace(/\s/g, "")+'&value='+parameterNewValue+'&type='+userType+'&key='+key)
    let response = await fetch("https://adalink.io/api/edit-user-parameter-adalink.php?stakeAddress="+stakeAddress+'&parameter='+parameterToBeEdited.replace(/\s/g, "")+'&value='+parameterNewValue+'&type='+userType+'&key='+key,{cache:'reload'});
    let result = await response.text();
    //console.log(result);
    if (result === "Record updated successfully"){
      accountInfo[parameterToBeEdited.replace(/\s/g, "")]=parameterNewValue;
      setMessageWindowContent(parameterToBeEdited+" edited successfully.");
      setMessageWindowButtonText('OK');
      setShowMessageWindow(true);
      onClose();
    }else{
      setMessageWindowContent(parameterToBeEdited+" is not edited.");
      setMessageWindowButtonText('OK');
      setShowMessageWindow(true);
    }
  }


  return (
    <div className="backdrop" onClick={closeWindow}>
      <div className='signup-menu'>
        <h3>Edit {parameterToBeEdited}</h3>
        <br/>
        <div style={{display:"flex",gap:"30px"}}>
          <div className='sign-up-text-fields-area'>
            <div className='sign-up-text-field'>
              <div className='sign-up-text-field-title'>{parameterToBeEdited}:</div>
              <div className='sign-up-text-field-input' style={{flex:1}}>
                <input type='text' id='parameterToBeEdited' style={{width:"100%",height:"20px"}}/>
              </div>
            </div>
          </div>
        </div>
        <div style={{textAlign:"right",marginTop:"2rem"}}>
          <button className='btnType1' style={{width:"120px"}} onClick={async () => await handleParameterEdit()}>Change</button>
        </div>
      </div>
    </div>
  );
};

export default EditWindow;
