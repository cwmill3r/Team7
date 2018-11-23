let portfolio = {
  "name": "Sparky",
  "invested": 20035.00,
  "usd": 35,
  "studentDebt": 20000,
  "bitcoin": 1.4,
  "appleStock": 2,
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
    9000,
    10000
  ],
  getStockTotal: function() {
    let stockAmount = this.applestock;
    let stockPrice;
    let totalStock;
    let tickers = "AAPL"
    console.log(stockAmount);
    let request = new XMLHttpRequest();
    request.open('GET', 'https://www.worldtradingdata.com/api/v1/stock_search?search_term=AAPL&search_by=symbol,name&limit=50&page=1&api_token=y5bn89U9AxqH2xXQebsJS1BNmLMoyCBcaEC2KalzdCKxtK8pabCP0On3d97Y', true);
    request.onload = function () {
      let data = JSON.parse(this.response);
      console.log(data);
      console.log(data[0].price);
      stockPrice = data[0].price;
      document.querySelector('#stockAmountSpan').innerHTML = `$ ${Math.round(stockPrice)}`;
    };
    request.send();
  },
  getBitcoinTotal: function() {
    let bitcoinAmount = this.bitcoin;
    let bitcoinPrice;
    let totalBitcoin;
    console.log(bitcoinAmount);
    let request = new XMLHttpRequest();
    request.open('GET', 'https://api.coinmarketcap.com/v1/ticker/bitcoin/?convert=USD', true);
    request.onload = function () {
      let data = JSON.parse(this.response);
      console.log(data);
      console.log(data[0].price_usd);
      bitcoinPrice = data[0].price_usd;
      document.querySelector('#bitcoinAmountSpan').innerHTML = `$ ${Math.round(bitcoinPrice)}`;
    };
    request.send();
  },
}


const renderMainApp = (portfolio) => {
  // Writes heading text with total portfolio value
  let headingText = `<h3>${portfolio.name}</h3>` + `<p>$${portfolio.historical[portfolio.historical.length - 1].toLocaleString()}</p>`;
  document.querySelector('#sparkline').innerHTML = headingText;

  // Start of sparkline code
  // create an SVG element inside the #graph div that fills 100% of the div
  var graph = d3.select("#sparkline").append("svg:svg").attr("width", "100%").attr("height", "100%");

  // create a simple data array that we'll plot with a line (this array represents only the Y values, X will just be the index location)
  // var data = [3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 3, 6, 3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9];

  var data = portfolio.historical;
  let max = data.reduce((max, n) => n > max ? n : max);
  let screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

  console.log(data);
  console.log(max);

  // X scale will fit values from 0-10 within pixels 0-100
  var x = d3.scaleLinear().domain([0, portfolio.historical.length]).range([0, screenWidth]);
  // Y scale will fit values from 0-10 within pixels 0-100
  var y = d3.scaleLinear().domain([0, max]).range([100, 0]);

  // create a line object that represents the SVN line we're creating
  var line = d3.line()
    // assign the X function to plot our line as we wish
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

  // display the line by appending an svg:path element with the data line we created above
  graph.append("svg:path").attr("d", line(data));

  // Render the cards
  renderCashAmount(portfolio);
  renderBitcoinAmount(portfolio);
  renderStudentLoanAmount(portfolio);
  renderStockAmount(portfolio);
}

const renderCashAmount = (portfolio) => {
  document.querySelector('#cashAmountSpan').innerHTML = `$${portfolio.usd.toLocaleString()}`;
}

const renderBitcoinAmount = (portfolio) => {
  let bitcoinTotal = portfolio.getBitcoinTotal();
  document.querySelector('#bitcoinAmountSpan').innerHTML = `$${bitcoinTotal}`;
}

const renderStockAmount = (portfolio) => {
  let stockTotal = portfolio.getStockTotal();
  document.querySelector('#StockAmountSpan').innerHTML = `$${stockTotal}`;
}

const renderStudentLoanAmount = (portfolio) => {
  document.querySelector('#studentLoanSpan').innerHTML = `$${portfolio.studentDebt.toLocaleString()}`;
}

document.body.addEventListener('load', init(), false);
function init() {
  renderMainApp(portfolio);
}

document.querySelector('#cashCard').addEventListener('click', function (e) {
  // To prevent it reloading
  e.preventDefault();
  document.querySelector('#sparkline').innerHTML = renderCashForm(portfolio);

});

const clearScreen = () => {
  document.body.innerHTML = '';
}


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