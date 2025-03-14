// src/constants.js

// For Testnet settings: 
let WEBSITE, SCRIPT_ADDRESS, ENGINE_ADDRESS, FEE_ADDRESS, SCRIPT_UTXO_REFERENCE,RSO_ADDRESS;
let NETWORK = 0; // 0 for testnet, 1 for mainnet
switch (NETWORK){
case 0: 
  WEBSITE = 'https://test-orderbook.adalink.io';
  SCRIPT_ADDRESS = 'addr_test1vq97aq769a545aytr3dczpw3wque7j5zt6nyku94vr3lwqspx6hu8';//'';
  ENGINE_ADDRESS = 'addr_test1vzyjr2kpx3rxks6nv00c0j56frmg42d5k8sfz73ssfc5dfcv674u7';
  FEE_ADDRESS = "addr_test1qqq5wtc8tad6c0pwclnhcmp4tpwwx5ga50nvjzudgrqrmmdx7507pa0hyl2c8vc8le0lpegak7q75h4mf75rq5hfzpxslaa0nc";
  SCRIPT_UTXO_REFERENCE = "25e5cc55c416c5e08920d7e42072c3c98b6373a7ff26610e7782a9f6dccab14c";//"ab0dfb8f083ca8edd36d8c72e36d1bc039bf79d82a332bed671463846b89f5e0" // always #0
  RSO_ADDRESS = "addr_test1qqz3tzmetfsglancmpcw2gz7easy7w7hy2cgrjhj0sy6vad25dur7dqaf6pq6snaeywx45g0v824mzk8lxh3vntju2cs7s0mws";
break;
case 1:
  // For Mainnet settings
  WEBSITE = 'https://orderbook.adalink.io';
  SCRIPT_ADDRESS = 'addr1z9v4anaqysach58zsr9vl47s4laqlthl82eytnu72wdmhzfayyl96kffwyvq7ylkfuggu4p89nxtvnggmnspknnvaems977zmn';
  ENGINE_ADDRESS = 'addr1z9v4anaqysach58zsr9vl47s4laqlthl82eytnu72wdmhzfayyl96kffwyvq7ylkfuggu4p89nxtvnggmnspknnvaems977zmn';
  FEE_ADDRESS = "addr1q9mqg0svkvf20m78mgmjgf4jxzngvjyen5hcrtml9fd2h73ayyl96kffwyvq7ylkfuggu4p89nxtvnggmnspknnvaems20a4lu";
  SCRIPT_UTXO_REFERENCE = "96a4b124fa488533b832f336b77ab232a6223c6769147139ac8bdbb712a8cbd8" // always #0
  RSO_ADDRESS = "addr1qx3q025xd9ugypwr4vad80t2snvyaq2ym943wpcugcw0992xnhwkwn5fkw3v0sj8u65glsql7sjqwwr7379rxszatsysh6a39k";
break;
default:
}
export { NETWORK,WEBSITE, SCRIPT_ADDRESS, ENGINE_ADDRESS, FEE_ADDRESS, SCRIPT_UTXO_REFERENCE,RSO_ADDRESS };

// script address with traces 'addr_test1wqyrludzpysdwvt9nue4z7qz99s74hjhkkwtknr9sgsdrtq37yd9c'
// txid with traces "edfaa5ab199ffd811d0a2048599408022e2cd64ff6d77286d332ff42f2a25f32"

export function stringToHex(input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
  
    let hex = '';
    for (const byte of data) {
      hex += byte.toString(16).padStart(2, '0');
    }
  
    return hex;
  }
  export function convertToMultiplier(x) {
    // Calculate a suitable multiplier (a) based on the number of decimal places in x
    const xStr = x.toString();
    const decimalPlaces = xStr.split('.')[1] ? xStr.split('.')[1].length : 0;
    const a = Math.pow(10, decimalPlaces);
  
    // Calculate y by multiplying x by a
    const y = parseInt(x * a);
  
    return { y, a };
    // const { y: y1, a: a1 } = convertToMultiplier(x1);
  }



export function numberOfDecimals(number) {
  /*if (typeof number !== 'number' || !isFinite(number)) {
    return 0; // Handle non-numeric input
  }*/

  // Convert the number to a string to inspect the decimal places
  const numberString = number.toString();

  // Use a regular expression to find and count decimal places
  const match = numberString.match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
  if (!match) {
      return 0; // Invalid number format
  }

  // The first part of the match (match[1]) is the decimal places
  const decimalPlaces = match[1] ? match[1].length : 0;

  return decimalPlaces;
}


export function displayNumberInPrettyFormat(number){
    let numberAsString = number.toString();
    let splitedString, wholeNumber, fractions, prettyNumber;
    splitedString = numberAsString.split(".");
    wholeNumber = splitedString[0];
    if (splitedString.length > 1){
        fractions = splitedString[1];
        if(fractions.length>6)
          fractions=fractions.substring(0,6);
        prettyNumber = wholeNumber.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1,')+"."+fractions;
    }else{
        prettyNumber = wholeNumber.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1,')
    }
    return prettyNumber;
}


export function removePrettyFormat(prettyNumberString){

    let output = prettyNumberString.toString().replace(/,/g, '');
    let splitedString = output.split(".");
    let wholeNumber = splitedString[0];
    if (splitedString.length > 1){
      let fractions = splitedString[1];
      
      output = wholeNumber+'.'+fractions;
    }else{
      
    }
    return output; 
}

export const handlePrettyNumberInputChange = (elementId) => {
    
  if(document.getElementById(elementId).value.slice(-1)!=="." && document.getElementById(elementId).value.split(".")[1]?.slice(-1)!=="0"){

    if(document.getElementById(elementId).value!=="" ){
        document.getElementById(elementId).value=displayNumberInPrettyFormat(removePrettyFormat(document.getElementById(elementId).value));
        
    }
  } 
}

export function displayNumberInPrettierFormat(number){
  let numberAsString = number.toString();

  let splitedString, wholeNumber, fractions, prettyNumber;
  splitedString = numberAsString.split(".");
  wholeNumber = splitedString[0];
  if (splitedString.length > 1){
      fractions = splitedString[1];
      fractions = formatLeadingZeros(fractions);
      return (<>{wholeNumber.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1,')+"."}{fractions}</>);
  }else{
      return (wholeNumber.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1,'));
  }
  return (<>{prettyNumber}</>);
}

function formatLeadingZeros(num) {
  const numStr = num.toString(); // Convert the number to a string
  let consecutiveZeros = 0;

  // Count consecutive leading zeros
  for (let i = 0; i < numStr.length; i++) {
    if (numStr[i] === '0') {
      consecutiveZeros++;
    } else {
      break;
    }
  }

  // Create the formatted string
  let formattedString;
  if (consecutiveZeros>3)
    return (<>0<sup>({consecutiveZeros})</sup>{numStr.slice(consecutiveZeros)}</>);
  else
    return numStr;

}

function revertLeadingZeros(formattedStr) {
  // Use a regular expression to match the superscript notation
  const regex = /0\.0<sup>(\d+)<\/sup>(\d+)/;
  const match = formattedStr.match(regex);

  if (match) {
    const consecutiveZeros = parseInt(match[1]);
    const numStr = '0'.repeat(consecutiveZeros) + match[2];
    const originalNum = parseFloat(numStr);
    return originalNum;
  } else {
    // If the input string doesn't match the expected format, return NaN or handle the error accordingly.
    return formattedStr;
  }
}

export function getCurrentEpochNumber(){

  let referenceEpoch,referencePosix,epochLengthInSeconds;
  
  switch(NETWORK){
    case 0:
      referenceEpoch = 555;
      referencePosix = 1714618800;
      epochLengthInSeconds = 86400;
    break;
    case 1:
      referenceEpoch = 480;
      referencePosix = 1713570291;
      epochLengthInSeconds = 432000;
    break;
  }

  let currentPosix = Date.now()/1000;
  let numberOfEpochsFromReference = Math.floor((currentPosix-referencePosix)/epochLengthInSeconds);
  let currentEpoch = referenceEpoch + numberOfEpochsFromReference;
  return currentEpoch;
}


export function addHttpsToURL(url){
  let header = url.substring(0, 8).toLowerCase();
  if (header=="https://")
      return url;
  else
      return "https://"+url;
}