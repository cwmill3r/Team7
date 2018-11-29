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

let portfolio = {
  "name": "Sparky",
  "investedTotal": 4035,
  "usd": 35,
  "studentDebt": 20000,
  "bitcoinAmount": 1.4,
  "ethereumAmount": 14,
  "appleStockAmount": 2,
  "googleStockAmount": 4,
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
  ]
}



let assetPortfolio = [
{"assetName" : "Bitcoin" , "symbol" : "btc" ,"amount" : 1.4 , "crypto" : true},
{"assetName" : "Ethereum" , "symbol" : "eth" ,"amount" : 14 , "crypto" : true},
{"assetName" : "Apple" , "symbol" : "aapl" ,"amount" : 2 , "crypto" : false},
{"assetName" : "Google" , "symbol" : "googl" ,"amount" : 4 , "crypto" : false}
];


// Global variables used for calculating curernt value
// set via API calls in init() method
let bitcoinPrice;
let ethereumPrice;
let appleStockPrice;
let googleStockPrice;
let currentPortfolioValue;

const fetchCryptoPrice = async (coinName) => {
  const url = `https://api.coinmarketcap.com/v1/ticker/${coinName}/?convert=USD`;
  const response = await fetch(url);
  const json = await response.json();
  //console.log(json);
  const cryptoPrice = json[0].price_usd;
  //console.log(cryptoPrice + 'inside fetchCryptoPrice()');
  return cryptoPrice;
}

const fetchStockPrice = async (symbol) => {
  const url = `https://api.iextrading.com/1.0/stock/${symbol}/price`;
  const response = await fetch(url);
  const json = await response.json();
  console.log(json);
  const stockPrice = json;
  //console.log(cryptoPrice + 'inside fetchStockPrice()');
  return stockPrice;
}

// This function pushes a new portfolio total to the historical array
const pushNewPortfolioTotal = () => {
  const ethAmount = ethereumPrice * portfolio.ethereumAmount;
  const btcAmount = bitcoinPrice * portfolio.bitcoinAmount;
  const appleAmount = appleStockPrice * portfolio.appleStockAmount;
  const googleAmount = googleStockPrice * portfolio.googleStockAmount;
  const cashAmount = portfolio.usd;
  const total = Math.round(ethAmount + btcAmount + appleAmount + googleAmount + cashAmount);
  console.log(`${total} pushNewPortfolioTotal`);
  // pushed to historical array here
  portfolio.historical.push(total);
}

const renderMainApp = (portfolio) => {
  // Writes heading text with total portfolio value
  let headingText = `<h3>${portfolio.name}</h3>` + `<p>$${portfolio.historical[portfolio.historical.length - 1].toLocaleString()}</p>`;
  document.querySelector('#sparkline').innerHTML = headingText;

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

  // Render the portfolio amounts on the cards
  renderCashAmount(portfolio);
  renderBitcoinAmount(portfolio);
  renderEthereumAmount(portfolio);
  renderAppleStockAmount(portfolio);
  renderGoogleStockAmount(portfolio);
  renderCryptoTotalAmount(portfolio);
  renderStudentLoanAmount(portfolio);
  renderStockTotalAmount(portfolio);
}

const renderCashAmount = (portfolio) => {
  document.querySelector('#cashAmountSpan').innerHTML = `$${portfolio.usd.toLocaleString()}`;
}

const renderBitcoinAmount = (portfolio) => {
  document.querySelector('#bitcoinAmountSpan').innerHTML = 
    `$ ${Math.round(bitcoinPrice * portfolio.bitcoinAmount)}`;
}

const renderEthereumAmount = (portfolio) => {
  document.querySelector('#ethereumAmountSpan').innerHTML =
    `$ ${Math.round(ethereumPrice * portfolio.ethereumAmount)}`;
}

const renderCryptoTotalAmount = (portfolio) => {
  const ethAmount = ethereumPrice * portfolio.ethereumAmount;
  const btcAmount = bitcoinPrice * portfolio.bitcoinAmount;
  document.querySelector('#cryptoTotalAmountSpan').innerHTML =
    `$ ${Math.round(ethAmount + btcAmount)}`;
}

const renderAppleStockAmount = (portfolio) => {
  document.querySelector('#appleStockAmountSpan').innerHTML =
    `$ ${Math.round(appleStockPrice * portfolio.appleStockAmount)}`;

  console.log(portfolio.appleStockAmount * appleStockPrice);
}

const renderGoogleStockAmount = (portfolio) => {
  document.querySelector('#googleStockAmountSpan').innerHTML =
    `$ ${Math.round(googleStockPrice * portfolio.googleStockAmount)}`;

  console.log(portfolio.googleStockAmount * googleStockPrice);
}

const renderStockTotalAmount = (portfolio) => {
  const appleAmount = appleStockPrice * portfolio.appleStockAmount;
  const googleAmount = googleStockPrice * portfolio.googleStockAmount;
  document.querySelector('#stockTotalAmountSpan').innerHTML =
    `$ ${Math.round(appleAmount + googleAmount)}`;
}

const renderStudentLoanAmount = (portfolio) => {
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
  bitcoinPrice = await fetchCryptoPrice('bitcoin');
  console.log(bitcoinPrice);
  ethereumPrice = await fetchCryptoPrice('ethereum');
  console.log(ethereumPrice);
  appleStockPrice = await fetchStockPrice('aapl');
  console.log(appleStockPrice);
  googleStockPrice = await fetchStockPrice('googl');
  console.log(appleStockPrice);
  pushNewPortfolioTotal(); // push the total to historical array
  renderMainApp(portfolio);
}

document.querySelector('#cashCard').addEventListener('click', function (e) {
  e.preventDefault();

  document.querySelector('#sparkline').innerHTML = renderCashForm(portfolio);
});

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
