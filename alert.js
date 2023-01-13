const StreamDeck = require('elgato-stream-deck');
const open = require('open');
const request = require('request');

const API_KEY = "YOUR_API_KEY_HERE";
const streamDeck = new StreamDeck();
let isTriggered = false;

// Function to change button color
function changeButtonColor(buttonNumber, color) {
  const button = streamDeck.getButton(buttonNumber);
  button.fillColor(color);
}

// Function to check for alerts on Datadog
function checkForAlerts() {
  request({
    method: 'GET',
    uri: 'https://api.datadoghq.com/api/v1/alerts',
    headers: {
      'Content-Type': 'application/json',
      'DD-API-KEY': API_KEY
    }
  }, function (error, response, body) {
    if (error) {
      console.log(error);
    } else {
      // Parse response as JSON
      const alerts = JSON.parse(body);

      // Check if any alerts are in a triggered state
      const triggeredAlerts = alerts.alerts.filter(alert => alert.status === 'triggered');
      if (triggeredAlerts.length > 0) {
        isTriggered = true;
        changeButtonColor(0, 'red');
      } else {
        isTriggered = false;
        changeButtonColor(0, 'green');
      }
    }
  });
}

// Call checkForAlerts every minute
setInterval(checkForAlerts, 60000);

// Handle button press events
streamDeck.on('down', keyIndex => {
    if (isTriggered) {
        open('https://app.datadoghq.com/alert/list');
    } else {
        checkForAlerts();
    }
});
