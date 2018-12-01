"use strict";
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
// It should also change the color of the graphs background

// let portfolio = {
//   "name": "Sparky",
//   "investedTotal": 4035,
//   "usd": 35,
//   "studentDebt": 20000,
//   "bitcoinAmount": 1.4,
//   "ethereumAmount": 14,
//   "appleStockAmount": 2,
//   "googleStockAmount": 4,
//   "historical": [
//     5000,
//     5100,
//     4800,
//     3400,
//     5200,
//     5100,
//     5800,
//     6000,
//     6500,
//     8500,
//     7000
//   ]
// }
// let assetPortfolio = [
// {"assetName" : "Bitcoin" , "symbol" : "btc" ,"amount" : 1.4 , "crypto" : true},
// {"assetName" : "Ethereum" , "symbol" : "eth" ,"amount" : 14 , "crypto" : true},
// {"assetName" : "Apple" , "symbol" : "aapl" ,"amount" : 2 , "crypto" : false},
// {"assetName" : "Google" , "symbol" : "googl" ,"amount" : 4 , "crypto" : false}
// ];

let portfolio = {
  "name": "Sparky",
  "investedTotal": 5035,
  "currentPortfolioValue": undefined,
  "usd": 35,
  "studentDebt": 20000,
  "assets": [
    { "assetName": "Bitcoin", "symbol": "btc", "amount": 1.4, "currentPrice": undefined, "crypto": true },
    { "assetName": "Ethereum", "symbol": "eth", "amount": 14, "currentPrice": undefined, "crypto": true },
    { "assetName": "Apple", "symbol": "aapl", "amount": 2, "currentPrice": undefined, "crypto": false },
    { "assetName": "Google", "symbol": "googl", "amount": 4, "currentPrice": undefined, "crypto": false }
  ],
  "historical": [
    5000,
    5100,
    4800,
    3400,
    5200,
    5100,
    5800,
    6000,
    6500,
    8500,
    7000
  ],
  fetchCryptoPrice: async function(coinName) {
    const url = `https://api.coinmarketcap.com/v1/ticker/${coinName}/?convert=USD`;
    const response = await fetch(url);
    const json = await response.json();
    //console.log(json);
    const cryptoPrice = json[0].price_usd;
    //console.log(cryptoPrice + 'inside fetchCryptoPrice()');
    return cryptoPrice;
  },
  fetchStockPrice: async function(symbol) {
    const url = `https://api.iextrading.com/1.0/stock/${symbol}/price`;
    const response = await fetch(url);
    const json = await response.json();
    //console.log(json);
    const stockPrice = json;
    //console.log(cryptoPrice + 'inside fetchStockPrice()');
    return stockPrice;
  },
  setCurrentPrices: function() {
    // sets current price for crypto assets
    const cryptoAssets = portfolio.assets.filter(asset => asset.crypto);
    cryptoAssets.map(function (crypto) {
      crypto.currentPrice = portfolio.fetchCryptoPrice(crypto.assetName);
    });
    // sets current price for stock assets
    const stockAssets = portfolio.assets.filter(asset => !asset.crypto);
    stockAssets.map(function(stock) {
      stock.currentPrice = portfolio.fetchStockPrice(stock.symbol);
    });
  },
  setCurrentPortfolioValue: function() {

  },
}

// Global variables used for calculating curernt value
// set via API calls
let currentPortfolioValue;

// This function pushes a new portfolio total to the historical array
const pushNewPortfolioTotal = (portfolio) => {
  // const ethAmount = ethereumPrice * portfolio.ethereumAmount;
  // const btcAmount = bitcoinPrice * portfolio.bitcoinAmount;
  // const appleAmount = appleStockPrice * portfolio.appleStockAmount;
  // const googleAmount = googleStockPrice * portfolio.googleStockAmount;
  // const cashAmount = portfolio.usd;
  // const total = Math.round(ethAmount + btcAmount + appleAmount + googleAmount + cashAmount);
  // console.log(`${total} pushNewPortfolioTotal`);
  // // pushed to historical array here
  // portfolio.historical.push(total);
  console.log('fix pushNewPortfolioTotal');
}

const renderMainApp = (portfolio) => {
  renderHeading(portfolio);
  renderGraph(portfolio);
  renderCashCard(portfolio);
  renderStudentLoanCard(portfolio);
  renderCryptoCard(portfolio);
  renderStockCard(portfolio);
}

const renderHeading = (portfolio) => {
  // Writes heading text with total portfolio value
  let headingText = `<h3>${portfolio.name}</h3>` + `<p>$${portfolio.historical[portfolio.historical.length - 1].toLocaleString()}</p>`;
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
  // Renders a name and total for each row of the portfolio
  portfolio.setCurrentPrices(); // fetches fresh prices
  console.log(portfolio);
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

  // calculate the crypto total

  // // calculate the crypto total
  // const totalCrypto = cryptoAssets.reduce(async function(x) {
  //   const currentPrice = await x.currentPrice;
  //   return x.amount * currentPrice;
  // });

  // async function renderCryptoTotal() {
  //   const totalCryptoRender = await totalCrypto;
  //   console.log(totalCryptoRender);
  //   document.querySelector('#cryptoTotalAmountSpan').innerHTML = Math.round(totalCryptoRender);
  // }
  // renderCryptoTotal();

}

const renderStockCard = (portfolio) => {
  portfolio.setCurrentPrices(portfolio); // fetches fresh prices
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
  // render the total for Stock Assets  
}

const renderCashCard = (portfolio) => {
  document.querySelector('#cashAmountSpan').innerHTML = `$${portfolio.usd.toLocaleString()}`;
}

const renderStudentLoanCard = (portfolio) => {
  document.querySelector('#studentLoanSpan').innerHTML = `$${portfolio.studentDebt.toLocaleString()}`;
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
  pushNewPortfolioTotal(); // push the total to historical array
  renderMainApp(portfolio);
}

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

function loadEdit(){
  document.getElementById("ethereumCryptoAmount").value = portfolio.ethereumAmount;
  document.getElementById("bitcoinCryptoAmount").value = portfolio.bitcoinAmount;
  document.getElementById("appleStockAmount").value = portfolio.appleStockAmount;
  document.getElementById("googleStockAmount").value = portfolio.googleStockAmount;
  document.getElementById("cashAmount").value = portfolio.usd;
  document.getElementById("loanAmount").value = portfolio.studentDebt;
}

function setPortfolioValues(){
  // console.log(document.getElementsByClassName('cryptoTypes')[0].childNodes[0].innerHTML);
  assetPortfolio[0].amount.value = document.getElementById('cashAmount');
  assetPortfolio[1].amount.value = document.getElementById('bitcoinCryptoAmount');
  assetPortfolio[2].amount.value = document.getElementById('ethereumCryptoAmount');
  assetPortfolio[3].amount.value = document.getElementById('appleStockAmount');
  assetPortfolio[4].amount.value = document.getElementById('googleStockAmount');
  
}

function addCrypto(){
  document.getElementById("cryptoDiv").innerHTML = document.getElementById("cryptoDiv").innerHTML + '<span class="cryptoTypes" style="display: block; padding: 1vh 5vw 1vh 5vw;"><span><input class="cryptoAmounts" style="width: 15vw"></input> </span><input class="cryptoAmounts" style="width: 15vw"></input></span>'
}

function addStock(){
  document.getElementById("stockDiv").innerHTML = document.getElementById("stockDiv").innerHTML + '<span class="stockTypes" style="display: block; padding: 1vh 5vw 1vh 5vw;"><span><input class="stockAmounts" style="width: 15vw"></input> </span><input class="stockAmounts" style="width: 15vw"></input></span>'
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
