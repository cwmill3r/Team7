// 'use strict';
// Use strict doesnt allow stringified portfolio to be saved to local storage

// If user has localStorage.portfolio === undefined then the demoPortfolio is loaded
// else their saved portfolio is loaded
let demoPortfolio = {
  "name": "Sparky",
  "investedTotal": 9035,
  "currentPortfolioValue": null,
  "currentCryptoValue": null,
  "currentStockValue": null,
  "usd": 35,
  "studentDebt": 20000,
  "assets": [
    { "assetName": "Bitcoin", "symbol": "btc", "amount": 1, "currentPrice": null, "crypto": true },
    { "assetName": "Ethereum", "symbol": "eth", "amount": 10, "currentPrice": null, "crypto": true },
    { "assetName": "Apple", "symbol": "aapl", "amount": 10, "currentPrice": null, "crypto": false },
    { "assetName": "Google", "symbol": "googl", "amount": 5, "currentPrice": null, "crypto": false }
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

// Stores portfolio to localStorage
async function saveToLocalStorage(){
  localStorage.portfolio = JSON.stringify(portfolio);
}

// Fetches crypto prices using coin name
// Names with spaces need to use -
async function fetchCryptoPrice(coinName) {
  const url = `https://api.coinmarketcap.com/v1/ticker/${coinName}/?convert=USD`;
  const response = await fetch(url);
  const json = await response.json();
  //console.log(json);
  const cryptoPrice = json[0].price_usd;
  return cryptoPrice;
};

// Fetches stocks prices using symbol
async function fetchStockPrice(symbol) {
  const url = `https://api.iextrading.com/1.0/stock/${symbol}/price`;
  const response = await fetch(url);
  try {
    const json = await response.json();
    //console.log(json);
    const stockPrice = json;
    return stockPrice;
  } catch (error) {
    alert('Not a valid stock - Try again :)');
  };
};

// Uses the API calls to get the current prices of both stock
// and crypto assets
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
  portfolio.historicalStudentDebt = portfolio.historical.map(function(x) {
    return x - portfolio.studentDebt;
  });
  console.log(portfolio);
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

// Deletes an asset from the portfolio
// Used within Edit Tab
const deleteFromEditButton = (symbol) => {
  portfolio.assets.forEach(function(asset, index) {
    if(symbol === asset.symbol) {
      portfolio.assets.splice(index, 1);
    }
  });
  // Re renders stuff to show updates
  renderMainApp(portfolio);
  renderEditCryptoCard(portfolio);
  renderEditStockCard(portfolio);
}

// This is renders the Portfolio Tab
// The main functions for the math are called here
async function renderMainApp (portfolio) {
  // Call portfolio objects functions to get all the values set & refreshed
  setCurrentPrices();
  setCryptoCurrentValue();
  setStockCurrentValue();
  await setCurrentPortfolioValue();
  // With the portfolio updated we can save to local storage
  saveToLocalStorage();
  // Render the Portfolio Tab
  renderHeading(portfolio);
  renderGraph(portfolio);
  renderCashCard(portfolio);
  renderStudentLoanCard(portfolio);
  renderCryptoCard(portfolio); // fetches current prices within function
  renderStockCard(portfolio); // fetches current prices within function
}

// Renders the heading within the Portfolio Tab
const renderHeading = (portfolio) => {
  // Writes heading text with total portfolio value
  let headingText = `<h3>${portfolio.name}</h3>` + `<p>$${Math.round(portfolio.historical[portfolio.historical.length - 1]).toLocaleString()}</p>`;
  document.querySelector('#sparkline').innerHTML = headingText;
}

// Render the alternate heading if the Student Loan card is clicked
const renderStudentLoanHeading = (portfolio) => {
  // Writes heading text with total portfolio value
  let headingText = `<h3>${portfolio.name}</h3>` + `<p>$${Math.round(portfolio.currentPortfolioValue - portfolio.studentDebt).toLocaleString()}</p>`;
  document.querySelector('#sparkline').innerHTML = headingText;
  console.log('im doing something');
}

// Renders the graph using d3.js charting library
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

// Renders the crypto card in the Portfolio Tab
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

// Renders the Stock Card in the Portfolio Tab
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

// Renders the Cash Card in the Portfolio Tab
const renderCashCard = (portfolio) => {
  document.querySelector('#cashAmountSpan').innerHTML = "";
  document.querySelector('#cashAmountSpan').innerHTML = `$${portfolio.usd.toLocaleString()}`;
}

// Renders the Student Loan Card in the Portfolio Tab
const renderStudentLoanCard = (portfolio) => {
  document.querySelector('#studentLoanSpan').innerHTML = "";
  document.querySelector('#studentLoanSpan').innerHTML = `$${portfolio.studentDebt.toLocaleString()}`;
}

// EDIT TAB JAVASCRIPT BEGINS
// Renders the Crypto Card in the Edit Tab
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
            <td style="white-space:nowrap;">
              <button
                id="${x.symbol}"
                onclick="deleteFromEditButton('${x.symbol}')"
                type="button"
                style="width: 2vw; color: asuMaroon; background-color: grey; border: none;"
              > x</button>
              <input
                style="margin: 0 5vw"
                id="${x.assetName}"
                class="editTextBox"
                type="number"
                step=0.1
                value="${x.amount}">
              </input>
            </td>
       </tr>`
  });
}

// Renders the Stock Card in the Edit Tab
const renderEditStockCard = (portfolio) => {
  document.querySelector('#editStockTable').innerHTML = "";
  // * See renderMainApp() function
  // current prices and properties of portfolio are already set and refreshed
  // Renders a name and total for each row of the portfolio
  document.querySelector('#editStockTotalAmountSpan').innerHTML = `<button id="addStock" type="button" onclick="displayAddCurrencyToEdit('stock')">Add</button>`;
  const stockAssets = portfolio.assets.filter(asset => !asset.crypto);
  stockAssets.map(async function (x) {
    const currentPrice = await x.currentPrice;

    document.querySelector('#editStockTable').innerHTML +=
      `<tr>
            <td>
              <span style="float: left; padding: 0 5vw 0 10vw; color:slateblue">${x.assetName}</span>
            </td>
            <td style="white-space:nowrap;">
              <button
                id="${x.symbol}"
                onclick="deleteFromEditButton('${x.symbol}')"
                type="button"
                style="width: 2vw; color: asuMaroon; background-color: grey; border: none;"
              > x</button>
              <input
                style="margin: 0 5vw"
                id="${x.assetName}"
                class="editTextBox"
                type="number"
                step=0.1
                value="${x.amount}">
              </input>
            </td>
        </tr>`
  });
}

// Renders the Cash Card in the Edit Tab
const renderEditCashCard = (portfolio) => {
  document.querySelector('#editCashAmountSpan').innerHTML = "";
  document.querySelector('#editCashAmountSpan').innerHTML = `<input id="usd" class="editTextBox" type="number" value="${portfolio.usd}" style="float: right"></input>`;
}

// Renders the Student Loan Card in the Edit Tab
const renderEditStudentLoanCard = (portfolio) => {
  document.querySelector('#editStudentLoanSpan').innerHTML = "";
  document.querySelector('#editStudentLoanSpan').innerHTML = `<input id="studentLoan" class="editTextBox" type="number" step=100 value="${portfolio.studentDebt}" style="float: right;"></input>`;
}

// END OF EDIT TAB CODE

// Opens the current tab
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

// Handles the onClick event from Edit > add new stock or crypto
async function addCurrencyToEdit(type) {
  try{
    if (type == 'crypto'){
      let res = await fetchCryptoPrice(document.getElementById('addName').value)
      if (res != undefined) {
        portfolio.assets.push({ assetName: document.getElementById('addName').value, symbol: document.getElementById('addAbbr').value, amount: Number(document.getElementById('addAmount').value), currentPrice: undefined, crypto: true });
      }
      var millisecondsToWait = 200;
      setTimeout(function () {
        renderEditCryptoCard(portfolio);
      }, millisecondsToWait);
    }
  } catch(err){
    alert('Not a valid asset - Try again');
    var millisecondsToWait = 500;
    setTimeout(function () {
      renderEditCryptoCard(portfolio);
    }, millisecondsToWait);
  }
  try {
    if (type == 'stock') {
      var res = fetchStockPrice(document.getElementById('addAbbr').value)
      console.log(res.status);
      if (res != undefined) {
        console.log(res.json)
        portfolio.assets.push({ assetName: document.getElementById('addName').value, symbol: document.getElementById('addAbbr').value, amount: Number(document.getElementById('addAmount').value), currentPrice: undefined, crypto: false })
      }
    }
    var millisecondsToWait = 200;
    setTimeout(function () {
      renderEditStockCard(portfolio);
    }, millisecondsToWait);
  }
  catch {
    alert('Not a valid asset - Try again');
    var millisecondsToWait = 500;
    setTimeout(function () {
      renderEditStockCard(portfolio);
    }, millisecondsToWait);
  }
  renderMainApp(portfolio);
  document.querySelector('#addCurrencyCardId').style.display = "none";
  document.querySelector('#addName').value = "";
  document.querySelector('#addAbbr').value = "";
  document.querySelector('#addAmount').value = "";
}

// Adds assets to the watching array in the portfolio and renders them in the app
async function addWatching(name,abbr,crypto = false,pass = false){
  name = name.toLowerCase();
  abbr = abbr.toLowerCase();
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
    var cell3 = row.insertCell(1);
      cell1.innerHTML = `
        <div class="col-lg-06 col-md-06 col-sm-12" id="${name}WatchingCard">
          <span class="cardHeadingSpan">${name.charAt(0).toUpperCase() + name.slice(1)}</span>
            <button
              id="${name}WatchingCardX"
              onclick="deleteFromWatching('${name}','${name}WatchingCard')"
              type="button"
              style="width: 2vw; color: asuMaroon; background-color: light-grey; border: none;"
            > x </button>
          <span class="cardSubHeadingSpan" id="cashAmountSpan">$${Math.round(price * 100) / 100}</span>
        </div>`;
    }
    else{
      alert(`Invalid ${type}: Please check that the correct radio button is selected and textbox values are accurate.`)
    }
  }
  catch(err){
        alert(`Invalid ${type}: Please check that the correct radio button is selected and textbox values are accurate.`)
  }
  saveToLocalStorage();
  renderMainApp(portfolio);
}

function deleteFromWatching(Name,id){
  //console.log(Name)

  for(i=0;i<=portfolio.watching.length-1;i++){
    //console.log(portfolio.watching[i])
    if (portfolio.watching[i].name.toLowerCase() == Name.toLowerCase()){
      console.log(i)
      portfolio.watching.splice(i, 1);
      renderMainApp(portfolio)
    }
  }
  console.log(id)
  document.getElementById(id).outerHTML = "";

}



function fillWatching(){
  for(i = 0; i < portfolio.watching.length; i++){
    addWatching(portfolio.watching[i].name,portfolio.watching[i].abbreviation,portfolio.watching[i].crypto,true)
  }
}

// EVENT LISTENERS SECTION && INITIALIZATION

/* wait until all phonegap/cordova is loaded then call onDeviceReady*/
document.addEventListener("deviceready", onDeviceReady(), false);
function onDeviceReady() {
  init();
}

async function init() {
  if (localStorage.portfolio === undefined) {
    portfolio = demoPortfolio;
    renderMainApp(portfolio);
    console.log('App started with Demo portfolio');
  } else {
    portfolio = JSON.parse(localStorage.portfolio);
    renderMainApp(portfolio);
    console.log('App started with Portfolio from localStorage')
  }
  saveToLocalStorage();
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

document.querySelector('#studentLoanCard').addEventListener('click', function (e) {
  // To prevent it reloading
  e.preventDefault();
  
  document.querySelector('#sparkline').style.backgroundColor = "black";
  renderStudentLoanHeading(portfolio);
  renderGraph(portfolio);
  // switchBack to main view after a while
  var millisecondsToWait = 2000;
  setTimeout(function () {
    document.querySelector('#sparkline').style.backgroundColor = "#008080";
    renderMainApp(portfolio);
  }, millisecondsToWait);
})

document.querySelector('#editSubmitButton').addEventListener('click', function (e) {
  // To prevent it reloading
  e.preventDefault();
  // need to read all the values and match them to values in the portfolio object.
  var els = document.getElementsByClassName("editTextBox");

  // This loops through the textboxes and then uses their value to change the
  // portfolio object
  Array.prototype.forEach.call(els, function (el) {

    portfolio.assets.forEach(function (asset) {
      if (el.id === asset.assetName) {
        asset.amount = el.value;
      }
    });

    if (el.id === "usd") {
      portfolio.usd = parseFloat(el.value);
    } else if (el.id == "studentLoan") {
      portfolio.studentDebt = parseFloat(el.value);
    };
  });

  // call renderMainApp at the end so the graphs and everything chang
  //document.getElementById("Edit").submit();
  renderMainApp(portfolio);
  openCurrency(event, 'Total');
});
