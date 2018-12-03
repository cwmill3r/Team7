// 'use strict';
// Use strict doesnt allow stringified portfolio to be saved to local storage

// This portfolio object contains all the info needed to render a users portfolio
// investedTotal is the amount they paid for assets - when a user adds a crypto
// asset or stock this amount is updated. It's used to calculate a gain or loss for the
// entire portfolio. We dont track gains or losses for individual assets at this point
// If a user decreases (sells) an asset they have to update their usd themselves
// The current value of the portfolio is calculated with the amount of a certain
// asset in the portfolio * the price which comes from the API calls
// Finally the historical array is an array of total portfolio values calculated
// daily (we simulate a daily calculation) at this point 11/24/18

// We could make a function which gets the end of day portfolio value and
// and then pushes it to the historical array
// And then if edits were made to holdings we could edit the last value of the historical
// array to get a current portfolio value

// We also need to make an onClick action for the student debt card which maps
// over the historical array and decreases all values by the student debt ammount
// Then it rerenders the graph and updates the total current portfolio value
// It should also change the color of the graph's background

// If user has localStorage.portfolio === undefined then the demoPortfolio is loaded
let demoPortfolio = {
  "name": "Sparky",
  "investedTotal": 9035,
  "currentPortfolioValue": undefined,
  "currentCryptoValue": undefined,
  "currentStockValue": undefined,
  "usd": 35,
  "studentDebt": 20000,
  "assets": [
    { "assetName": "Bitcoin", "symbol": "btc", "amount": 1.4, "currentPrice": undefined, "crypto": true },
    { "assetName": "Ethereum", "symbol": "eth", "amount": 14, "currentPrice": undefined, "crypto": true },
    { "assetName": "Apple", "symbol": "aapl", "amount": 2, "currentPrice": undefined, "crypto": false },
    { "assetName": "Google", "symbol": "googl", "amount": 4, "currentPrice": undefined, "crypto": false }
  ],
  "historical": [
    6000,
    6100,
    5800,
    4400,
    6200,
    6100,
    6800,
    7000,
    7500,
    9500,
    10000,
    8500,
    9000,
    10000,
    12000,
  ],
  "watching":[
  {"name":"Apple","abbreviation":"aapl","crypto":false},
  {"name":"Bitcoin","abbreviation":"btc","crypto":true}
  ],

};

// Either the demo portfolio or the portfolio from localStorage.portfolio becomes
// this portfolio which is used throughout the app 
let portfolio = undefined;


// function runQuery() {
//   MySql.Execute(
//     "sql.wpc-is.online",	// mySQL server
//     "cwmiller", 				// login name
//     "cwmi3301", 			// login password
//     "db_test_cwmiller", 			// database to use
//     // SQL query string:
//     "SELECT 											\
// 				portfolio 						\
// 			 FROM 												\
// 				users 							\
// 			 WHERE 												\
// 				id = 4  	\
// 			 ;",
//     function (data) {
//       processQueryResult(data);
//     }
//   );
// }

// function processQueryResult(queryReturned) {
//   if (!queryReturned.Success) {
//     alert(queryReturned.Error);
//   } else {
//     console.log(JSON.stringify(queryReturned.Result), null, 2);
//     //portfolio = JSON.parse(queryReturned.Result, null, 2);
//   }
// }

async function fetchCryptoPrice(coinName) {
  const url = `https://api.coinmarketcap.com/v1/ticker/${coinName}/?convert=USD`;
  const response = await fetch(url);
  const json = await response.json();
  //console.log(json);
  const cryptoPrice = json[0].price_usd;
  //console.log(cryptoPrice + 'inside fetchCryptoPrice()');
  return cryptoPrice;
};

async function fetchStockPrice(symbol) {
  const url = `https://api.iextrading.com/1.0/stock/${symbol}/price`;
  const response = await fetch(url);
  const json = await response.json();
  //console.log(json);
  const stockPrice = json;
  //console.log(cryptoPrice + 'inside fetchStockPrice()');
  return stockPrice;
};

const setCurrentPrices= () => {
  // sets current price for crypto assets
  const cryptoAssets = portfolio.assets.filter(asset => asset.crypto);
  cryptoAssets.map(function (crypto) {
    crypto.currentPrice = fetchCryptoPrice(crypto.assetName);
  });
  // sets current price for stock assets
  const stockAssets = portfolio.assets.filter(asset => !asset.crypto);
  stockAssets.map(function (stock) {
    stock.currentPrice = fetchStockPrice(stock.symbol);
  });
}

// This is basically a total of the whole portfolio using current prices
async function setCurrentPortfolioValue() {
  const assetCurrentValuesArr = portfolio.assets.map(async function (asset) {
    const currentPrice = await asset.currentPrice;
    return asset.amount * currentPrice;
  });
  let stockCryptoValue = 0;
  for (let i = 0; i < assetCurrentValuesArr.length; i++) {
    stockCryptoValue += await assetCurrentValuesArr[i];
  };
  portfolio.currentPortfolioValue = stockCryptoValue + portfolio.usd;
  portfolio.historical[portfolio.historical.length - 1] = portfolio.currentPortfolioValue;
}

// Subtotal for crypto with current prices
async function setCryptoCurrentValue() {
  const cryptoCurrentValue = portfolio.assets.filter(asset => asset.crypto)
    .map(async function (asset) {
      const currentPrice = await asset.currentPrice;
      return asset.amount * currentPrice;
    });
  let cryptoValue = 0;
  for (let i = 0; i < cryptoCurrentValue.length; i++) {
    cryptoValue += await cryptoCurrentValue[i];
  };
  portfolio.currentCryptoValue = cryptoValue;
}

// Subtotal for stocks with current prices
async function setStockCurrentValue() {
  const stockCurrentValue = portfolio.assets.filter(asset => !asset.crypto)
    .map(async function (asset) {
      const currentPrice = await asset.currentPrice;
      return asset.amount * currentPrice;
    });
  let stockValue = 0;
  for (let i = 0; i < stockCurrentValue.length; i++) {
    stockValue += await stockCurrentValue[i];
  };
  portfolio.currentStockValue = stockValue;
}

async function renderMainApp (portfolio) {
  // Call portfolio objects functions to get all the values set & refreshed
  setCurrentPrices();
  setCryptoCurrentValue();
  setStockCurrentValue();
  await setCurrentPortfolioValue();
  // Save to Local Storage need to move this to the end of the app eventually. 
  saveToLocalStorage(portfolio);
  // console.log(JSON.parse(localStorage.portfolio));
  // Render the app
  renderHeading(portfolio);
  renderGraph(portfolio);
  renderCashCard(portfolio);
  renderStudentLoanCard(portfolio);
  renderCryptoCard(portfolio); // fetches current prices within function
  renderStockCard(portfolio); // fetches current prices within function
}

const renderHeading = (portfolio) => {
  // Writes heading text with total portfolio value
  let headingText = `<h3>${portfolio.name}</h3>` + `<p>$${Math.round(portfolio.historical[portfolio.historical.length - 1]).toLocaleString()}</p>`;
  document.querySelector('#sparkline').innerHTML = headingText;
}

const renderGraph = (portfolio) => {
  // Start of sparkline code
  // create an SVG element inside the #graph div that fills 100% of the div
  var graph = d3.select("#sparkline").append("svg:svg").attr("width", "100%").attr("height", "100%");
  var data = portfolio.historical;
  let max = data.reduce((max, n) => n > max ? n : max); // gets the max from historical
  let screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

  // X scale will fit values from 0-portfolio.historical.length within pixels 0- screenWidth
  var x = d3.scaleLinear().domain([0, portfolio.historical.length]).range([0, screenWidth]);
  // Y scale will fit values from 0-max in array within pixels 0-120
  var y = d3.scaleLinear().domain([0, max]).range([120, 0]);
  // create a line object that represents the SVG line
  var line = d3.line()
    // assign the X function to plot line
    .x(function (d, i) {
      // verbose logging to show what's actually being done
      //console.log('Plotting X value for data point: ' + d + ' using index: ' + i + ' to be at: ' + x(i) + ' using our xScale.');
      // return the X coordinate where we want to plot this datapoint
      return x(i);
    })
    .y(function (d) {
      // verbose logging to show what's actually being done
      //console.log('Plotting Y value for data point: ' + d + ' to be at: ' + y(d) + " using our yScale.");
      // return the Y coordinate where we want to plot this datapoint
      return y(d);
    })
    .curve(d3.curveNatural)
  // Listed below are differnt line types that can be tried: 
  // var interpolateTypes = [d3.curveLinear,d3.curveStepBefore,d3.curveStepAfter,d3.curveBasis,// d3.curveBasisOpen, d3.curveBasisClosed, d3.curveBundle,d3.curveCardinal,d3.curveCardinal,// d3.curveCardinalOpen,d3.curveCardinalClosed,d3.curveNatural];
  // display the line by appending an svg:path element with the data line we created above
  graph.append("svg:path").attr("d", line(data));
}

const renderCryptoCard = (portfolio) => {
  // * See renderMainApp() function
  // current prices and properties of portfolio are already set and refreshed
  // Renders a name and total for each row of the portfolio
  document.querySelector('#cryptoTotalAmountSpan').innerHTML = "";
  document.querySelector('#cryptoTable').innerHTML = "";
  document.querySelector('#cryptoTotalAmountSpan').innerHTML = '$' + Math.round(portfolio.currentCryptoValue);
  const cryptoAssets = portfolio.assets.filter(asset => asset.crypto);
  cryptoAssets.map(async function (x) {
    const currentPrice = await x.currentPrice;
    // Renders Crypto Table
    document.querySelector('#cryptoTable').innerHTML +=
      `<tr>
            <td>
              <span style="float: left; padding: 0 5vw 0 10vw; color:slateblue">${x.assetName}</span>
            </td>
            <td>
              <span style="float: right; padding: 0 5vw 0 5vw; color:slateblue;">${Math.round(currentPrice * x.amount)}</span>
            </td>
       </tr>`
  });
}

const renderStockCard = (portfolio) => {
  document.querySelector('#stockTotalAmountSpan').innerHTML = "";
  document.querySelector('#stockTable').innerHTML = "";
  // * See renderMainApp() function
  // current prices and properties of portfolio are already set and refreshed
  // Renders a name and total for each row of the portfolio
  document.querySelector('#stockTotalAmountSpan').innerHTML = '$' + Math.round(portfolio.currentStockValue);
  const stockAssets = portfolio.assets.filter(asset => !asset.crypto);
  console.log(stockAssets);
  stockAssets.map(async function (x) {
    const currentPrice = await x.currentPrice;
    console.log(x.currentPrice);
    //<span style="float: left; padding: 0 5vw 0 10vw;">${x.assetName} (${x.amount})
    document.querySelector('#stockTable').innerHTML +=
      `<tr>
            <td>
              <span style="float: left; padding: 0 5vw 0 10vw; color:slateblue">${x.assetName}</span>
            </td>
            <td>
              <span style="float: right; padding: 0 5vw 0 5vw; color:slateblue;">${Math.round(currentPrice * x.amount)}</span>
            </td>
        </tr>`
  });
}

const renderCashCard = (portfolio) => {
  document.querySelector('#cashAmountSpan').innerHTML = "";
  document.querySelector('#cashAmountSpan').innerHTML = `$${portfolio.usd.toLocaleString()}`;
}

const renderStudentLoanCard = (portfolio) => {
  document.querySelector('#studentLoanSpan').innerHTML = "";
  document.querySelector('#studentLoanSpan').innerHTML = `$${portfolio.studentDebt.toLocaleString()}`;
}

// EDIT TAB JAVASCRIPT
const renderEditCryptoCard = (portfolio) => {
  document.querySelector('#editCryptoTable').innerHTML = "";
  // * See renderMainApp() function
  // current prices and properties of portfolio are already set and refreshed
  // Renders a name and total for each row of the portfolio
  document.querySelector('#editCryptoTotalAmountSpan').innerHTML = `<button id="addCrypto" type="button" onclick="displayAddCurrencyToEdit('crypto')">Add</button>`;
  const cryptoAssets = portfolio.assets.filter(asset => asset.crypto);
  cryptoAssets.map(async function (x) {
    const currentPrice = await x.currentPrice;
    // Renders Crypto Table
    document.querySelector('#editCryptoTable').innerHTML +=
      `<tr>
            <td>
              <span style="float: left; padding: 0 5vw 0 10vw; color:slateblue">${x.assetName}</span>
            </td>
            <td>
              <input id="${x.assetName}" class="editTextBox" type="number" step=0.1 value="${x.amount}"></input>     
            </td>
       </tr>`
  });
}

const renderEditStockCard = (portfolio) => {
  document.querySelector('#editStockTable').innerHTML = "";
  // * See renderMainApp() function
  // current prices and properties of portfolio are already set and refreshed
  // Renders a name and total for each row of the portfolio
  document.querySelector('#editStockTotalAmountSpan').innerHTML = `<button id="addStock" type="button" onclick="displayAddCurrencyToEdit('stock')">Add</button>`;
  const stockAssets = portfolio.assets.filter(asset => !asset.crypto);
  console.log(stockAssets);
  stockAssets.map(async function (x) {
    const currentPrice = await x.currentPrice;
    console.log(x.currentPrice);
    //<span style="float: left; padding: 0 5vw 0 10vw;">${x.assetName} (${x.amount})
    
    document.querySelector('#editStockTable').innerHTML +=
      `<tr>
            <td>
              <span style="float: left; padding: 0 5vw 0 10vw; color:slateblue">${x.assetName}</span>
            </td>
            <td>
              <input id="${x.assetName}" class="editTextBox" type="number" step=0.1 value="${x.amount}"style="float: right"></input>
            </td>
        </tr>`
  });
}

const renderEditCashCard = (portfolio) => {
  document.querySelector('#editCashAmountSpan').innerHTML = "";
  document.querySelector('#editCashAmountSpan').innerHTML = `<input id="usd" class="editTextBox" type="number" value="${portfolio.usd}"style="float: right"></input>`;
}

const renderEditStudentLoanCard = (portfolio) => {
  document.querySelector('#editStudentLoanSpan').innerHTML = "";
  document.querySelector('#editStudentLoanSpan').innerHTML = `<input id="studentLoan"class="editTextBox" type="number" step=100 value="${portfolio.studentDebt}"style="float: right"></input>`;
}


// END OF EDIT TAB CODE


const saveToLocalStorage = (portfolio) => {
  if (localStorage.portfolio === null) {
    localStorage.portfolio = JSON.stringify(portfolio);
  };
}


// add event listeners below

/* wait until all phonegap/cordova is loaded then call onDeviceReady*/
document.addEventListener("deviceready", onDeviceReady(), false);
function onDeviceReady() {
  init();
  console.log('onDeviceReady worked');
}
//Below is the onLoad function I was calling before converting to phonegap
// document.body.addEventListener('load', init(), false);
async function init() {
  if (localStorage.portfolio === undefined) {
    portfolio = demoPortfolio;
    renderMainApp(portfolio);
  } else {
    portfolio = localStorage.portfolio;
    renderMainApp(portfolio);
  }
  fillWatching();
}

document.querySelector('#editTabButton').addEventListener('click', function (e) {
  // To prevent it reloading
  e.preventDefault();
  renderEditCashCard(portfolio);
  renderEditCryptoCard(portfolio);
  renderEditStockCard(portfolio);
  renderEditStudentLoanCard(portfolio);
})

document.querySelector('#editSubmitButton').addEventListener('click', function (e) {
  // To prevent it reloading
  e.preventDefault();
  // need to read all the values and match them to values in the portfolio object.
  var els = document.getElementsByClassName("editTextBox");

  // This loops through the textboxes and then uses their value to change the
  // portfolio object
  Array.prototype.forEach.call(els, function (el) {
    
    portfolio.assets.forEach(function(asset) {
      if (el.id === asset.assetName) {
        asset.amount = el.value;
      } else if (el.id === "usd") {
        portfolio.usd = el.value;
      } else if(el.id == "studentLoan") {
        portfolio.studentDebt = el.value;
      };
    });
  });

  console.log(portfolio);
  // call renderMainApp at the end so the graphs and everything chang
  //document.getElementById("Edit").submit();
  renderMainApp(portfolio);
  openCurrency(event, 'Total')
});

// document.querySelector('#defaultOpen').addEventListener('click', function (e) {
//   // To prevent it reloading
//   e.preventDefault();
//   renderMainApp(portfolio);
// });

function openCurrency(evt, CurrencyName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(CurrencyName).style.display = "block";
    evt.currentTarget.className += " active";
}

function displayAddCurrencyToEdit(crypto){
  document.getElementById('addCurrencyCardId').style.display = 'block'
  document.getElementById('addType').innerHTML = crypto
}

async function addCurrencyToEdit(type){
  try{
  if (type == 'crypto'){
    var res = await fetchCryptoPrice(document.getElementById('addName').value)
    if (res != undefined){
    portfolio.assets.push({assetName:document.getElementById('addName').value,symbol:document.getElementById('addAbbr').value,amount:Number(document.getElementById('addAmount').value),currentPrice: undefined, crypto: true})
    }
  }
  if (type == 'stock'){
    var res = fetchStockPrice(document.getElementById('addAbbr').value)
    if (res != undefined){
    console.log(res.json)
    portfolio.assets.push({assetName:document.getElementById('addName').value,symbol:document.getElementById('addAbbr').value,amount:Number(document.getElementById('addAmount').value),currentPrice: undefined, crypto: false})
    }
  }
}
  catch(err){
    console.log(portfolio.assets)
  }
  console.log(portfolio.assets)
}


// function loadEdit(){
//   document.getElementById("ethereumCryptoAmount").value = portfolio.ethereumAmount;
//   document.getElementById("bitcoinCryptoAmount").value = portfolio.bitcoinAmount;
//   document.getElementById("appleStockAmount").value = portfolio.appleStockAmount;
//   document.getElementById("googleStockAmount").value = portfolio.googleStockAmount;
//   document.getElementById("cashAmount").value = portfolio.usd;
//   document.getElementById("loanAmount").value = portfolio.studentDebt;
// }

// function setPortfolioValues(){
//   // console.log(document.getElementsByClassName('cryptoTypes')[0].childNodes[0].innerHTML);
//   assetPortfolio[0].amount.value = document.getElementById('cashAmount');
//   assetPortfolio[1].amount.value = document.getElementById('bitcoinCryptoAmount');
//   assetPortfolio[2].amount.value = document.getElementById('ethereumCryptoAmount');
//   assetPortfolio[3].amount.value = document.getElementById('appleStockAmount');
//   assetPortfolio[4].amount.value = document.getElementById('googleStockAmount');
  
// }

// function addCrypto(){
//   document.getElementById("cryptoDiv").innerHTML = document.getElementById("cryptoDiv").innerHTML + '<span class="cryptoTypes" style="display: block; padding: 1vh 5vw 1vh 5vw;"><span><input class="cryptoAmounts" style="width: 15vw"></input> </span><input class="cryptoAmounts" style="width: 15vw"></input></span>'
// }

// function addStock(){
//   document.getElementById("stockDiv").innerHTML = document.getElementById("stockDiv").innerHTML + '<span class="stockTypes" style="display: block; padding: 1vh 5vw 1vh 5vw;"><span><input class="stockAmounts" style="width: 15vw"></input> </span><input class="stockAmounts" style="width: 15vw"></input></span>'
// }



async function addWatching(name,abbr,crypto = false,pass = false){
  var type = 'Addition'
  var price = null
  console.log(pass)
  console.log(crypto)
try{
  if (pass == true && crypto == true){
    type = 'crypto';
    var url = `https://api.coinmarketcap.com/v1/ticker/${name}/?convert=USD`;
    var response = await fetch(url);
    var json = await response.json();
    //console.log(json);
    price = json[0].price_usd;
  }
  if (pass == true && crypto == false){
    type = 'stock';
    var url = `https://api.iextrading.com/1.0/stock/${abbr}/price`;
    var response =  await fetch(url);
    var json = await response.json();
    //console.log(json);
    price = json;
  }
  if (document.getElementById("stockRadio").checked && pass == false) {
    type = 'stock';
    var url = `https://api.iextrading.com/1.0/stock/${abbr}/price`;
    var response =  await fetch(url);
    var json = await response.json();
    //console.log(json);
    price = json;
    portfolio.watching.push({name:name,abbreviation:abbr,crypto:false})
  }
  if (document.getElementById("cryptoRadio").checked && pass == false){
    type = 'crypto';
    var url = `https://api.coinmarketcap.com/v1/ticker/${name}/?convert=USD`;
    var response = await fetch(url);
    var json = await response.json();
    //console.log(json);
    price = json[0].price_usd;
    portfolio.watching.push({name:name,abbreviation:abbr,crypto:true})
  }
  
  if(price != null){
  var mytable = document.getElementById("watchingTable");
  var row = mytable.insertRow(0);
  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  cell1.innerHTML = abbr
  cell2.innerHTML = price
  }
  else{
    alert(`Invalid ${type}: Please check that the correct radio button is selected and textbox values are accurate.`)
  }
}
catch(err){
      alert(`Invalid ${type}: Please check that the correct radio button is selected and textbox values are accurate.`)
}
console.log(portfolio.watching)
}

function fillWatching(){
  for(i = 0; i < portfolio.watching.length; i++){
    addWatching(portfolio.watching[i].name,portfolio.watching[i].abbreviation,portfolio.watching[i].crypto,true)
  }
}

// const clearScreen = () => {
//   document.body.innerHTML = '';
// }

// const unhide = (clickedButton, divID) => {
//   var item = document.getElementById(divID);
//   if (item) {
//     if (item.className == 'hidden') {
//       item.className = 'unhidden';
//       clickedButton.value = 'hide'
//     } else {
//       item.className = 'hidden';
//       clickedButton.value = 'unhide'
//     }
//   }
// }

// window.smoothScroll = function(target) {
//     var scrollContainer = target;
//     do { //find scroll container
//         scrollContainer = scrollContainer.parentNode;
//         if (!scrollContainer) return;
//         scrollContainer.scrollTop += 1;
//     } while (scrollContainer.scrollTop == 0);

//     var targetY = 0;
//     do { //find the top of target relatively to the container
//         if (target == scrollContainer) break;
//         targetY += target.offsetTop;
//     } while (target = target.offsetParent);

//     scroll = function(c, a, b, i) {
//         i++; if (i > 30) return;
//         c.scrollTop = a + (b - a) / 30 * i;
//         setTimeout(function(){ scroll(c, a, b, i); }, 20);
//     }
//     // start scrolling
//     scroll(scrollContainer, scrollContainer.scrollTop, targetY, 0);
// }
