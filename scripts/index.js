// https://api.weatherapi.com/v1/forecast.json?key=26bb7319fff6419294d13727242905&q=London&days=1&aqi=no&alerts=no
// ^ example reference call for weather in London (q) and daily (days=1)

const weatherApiUrl = "https://api.weatherapi.com/v1";
const forecast = "forecast.json";
const weatherApiKey = "26bb7319fff6419294d13727242905";

// create a function which pulls the data from the api with the correct location & q = 1 always daily (for now)

const getDailyForecast = async (location) => {
  try {
    const response = await axios.get(
      `${weatherApiUrl}/${forecast}.json?key=${weatherApiKey}&q=${location}&days=1&aqi=no&alerts=no`
    );
    console.log(response); // this works! gives you the forecast
  } catch (error) {
    console.log(error);
  }
};

getDailyForecast("Toronto");

// add an event listener that listens for a submit event from the form
// extract location from the form submit and call the getDailyForecast(event.target.location.value)

// want to extract the data for the time of day, morning, afternoon, evening or night
// for each then look in a different range
// create an array of objects?
// can assign an array to the subset array of objects corresponsing to this timeframe with .slice
// loop through array checking the .chance_of_rain, .humidity, .temp_C
// create an object with the array.time key and the changce of rain as the value

// have another function that writes it to html
