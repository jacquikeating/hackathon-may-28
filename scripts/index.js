// https://api.weatherapi.com/v1/forecast.json?key=26bb7319fff6419294d13727242905&q=London&days=1&aqi=no&alerts=no
// ^ example reference call for weather in London (q) and daily (days=1)

const weatherApiUrl = "https://api.weatherapi.com/v1";
const forecast = "forecast.json";
const weatherApiKey = "26bb7319fff6419294d13727242905";

// create a function which pulls the data from the api with the correct location & q = 1 always daily (for now)

const getDailyForecast = async (location, timeRange, condition) => {
  try {
    const response = await axios.get(
      `${weatherApiUrl}/${forecast}.json?key=${weatherApiKey}&q=${location}&days=1&aqi=no&alerts=no`
    );
    // console.log(response); // this works! gives you the forecast

    let timeOfDay; // array of objects
    if (timeRange === "morning") {
      timeOfDay = response.data.forecast.forecastday[0].hour.slice(6, 13);
    } else if (timeRange === "afternoon") {
      timeOfDay = response.data.forecast.forecastday[0].hour.slice(12, 19);
    } else if (timeRange === "evening") {
      timeOfDay = response.data.forecast.forecastday[0].hour.slice(18, 24);
      timeOfDay.push(response.data.forecast.forecastday[0].hour[0]);
    } else {
      timeOfDay = response.data.forecast.forecastday[0].hour.slice(0, 7); // can fix later if time
    }

    console.log(timeOfDay);
    // console.log(timeOfDay.push("hello"));
    // can wrap each of these in functions if want to eventually
    let resultToSort = {};
    let sorted;
    if (condition === "temp") {
      for (let i = 0; i < timeOfDay.length; i++) {
        // console.log(timeOfDay[i]);
        resultToSort[timeOfDay[i].time] = timeOfDay[i]["temp_c"];
        sorted = Object.values(resultToSort).sort((a, b) => a - b);
      }
    } else if (condition === "humidity") {
      for (let i = 0; i < timeOfDay.length; i++) {
        // console.log(timeOfDay[i]);
        resultToSort[timeOfDay[i].time] = timeOfDay[i]["humidity"];
        sorted = Object.values(resultToSort).sort((a, b) => a - b);
      }
    } else {
      for (let i = 0; i < timeOfDay.length; i++) {
        // console.log(timeOfDay[i]);
        resultToSort[timeOfDay[i].time] = timeOfDay[i]["chance_of_rain"];
        sorted = Object.values(resultToSort).sort((a, b) => a - b);
      }
    }
    console.log(resultToSort);

    // console.log(Object.values(resultToSort).sort((a, b) => a - b));
    console.log(sorted);

    // getKeyByValue(resultToSort, ) // how to handle equivalent values??, get a current conditions img and text, want to use?

    let results = {};
    const temp = resultToSort;
    console.log(condition);

    if (condition === "rain") {
      for (let i = 0; i < sorted.length; i++) {
        if (sorted[i] < 50) {
          let key = getKeyByValue(temp, sorted[i]);
          results[`${key}`] = sorted[i];
          delete temp[`${key}`]; // this line takes care of duplicate values
          console.log(results);
        }
      }
    } else {
      for (let i = 0; i < 3; i++) {
        let key = getKeyByValue(temp, sorted[i]);
        // results[`${getKeyByValue(resultToSort, sorted[i])}`] = sorted[i];
        results[`${key}`] = sorted[i];
        delete temp[`${key}`]; // this line takes care of duplicate values

        // console.log(`${getKeyByValue(resultToSort, sorted[i])}`);
        // sorted.splice(i, 1);
        // console.log(sorted);
      }
    }

    // for (let i = 0; i < 3; i++) {
    //   let key = getKeyByValue(temp, sorted[i]);
    //   // results[`${getKeyByValue(resultToSort, sorted[i])}`] = sorted[i];
    //   results[`${key}`] = sorted[i];
    //   delete temp[`${key}`]; // this line takes care of duplicate values

    //   // console.log(`${getKeyByValue(resultToSort, sorted[i])}`);
    //   // sorted.splice(i, 1);
    //   // console.log(sorted);
    // }

    console.log(results);

    // call the html function here
    displayResults(results, condition);
  } catch (error) {
    console.log(error);
  }
};

function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

// getDailyForecast("Toronto");

// add an event listener that listens for a submit event from the form
// extract location from the form submit and call the getDailyForecast(event.target.location.value)

const walkForm = document.querySelector(".form");
// console.log(walkForm);

walkForm.addEventListener("submit", (event) => {
  event.preventDefault();

  //   getDailyForecast(event.target.location.value);

  const location = event.target.location.value;
  const timesOfDay = {
    morning: event.target.morning.checked,
    afternoon: event.target.afternoon.checked,
    evening: event.target.evening.checked,
    night: event.target.night.checked,
  };
  const weatherConditions = {
    temp: event.target.temp.checked,
    humidity: event.target.humidity.checked,
    rain: event.target.rain.checked,
  };

  let timeRange;
  let condition;
  for (const time of Object.entries(timesOfDay)) {
    if (time[1]) {
      timeRange = time[0];
    }
  }
  for (const weather of Object.entries(weatherConditions)) {
    if (weather[1]) {
      condition = weather[0];
    }
  }

  console.log(location);
  console.log(timeRange);
  console.log(condition);

  walkForm.reset();

  getDailyForecast(location, timeRange, condition);
});

// want to extract the data for the time of day, morning, afternoon, evening or night
// for each then look in a different range
// create an array of objects?
// can assign an array to the subset array of objects corresponsing to this timeframe with .slice
// loop through array checking the .chance_of_rain, .humidity, .temp_C
// create an object with the array.time key and the chance of rain as the value

// have another function that writes it to html

const resultsListEl = document.querySelector(".results__list");
// const resultsTimeEl = document.querySelector(".results__time");
// const resultsCritEl = document.querySelector(".results__primary-criteria");

function displayResults(results, condition) {
  resultsListEl.innerHTML = "";
  const times = Object.keys(results);
  for (let i = 0; i < times.length; i++) {
    displayOneResult(results, times[i], condition);
  }
}

function displayOneResult(results, key, condition) {
  const resultsListItemEl = document.createElement("li");
  resultsListItemEl.classList.add("results__list-item");
  resultsListEl.appendChild(resultsListItemEl);

  const resultsTimeEl = document.createElement("h3");
  resultsTimeEl.classList.add("results__time");
  resultsTimeEl.textContent = key.slice(-4, key.length);
  resultsListItemEl.appendChild(resultsTimeEl);

  const resultsCritEl = document.createElement("p");
  resultsCritEl.classList.add("results__primary-criteria");

  if (condition === "temp") {
    resultsCritEl.textContent = results[key] + "° C";
  } else {
    resultsCritEl.textContent = results[key] + "%";
  }

  resultsListItemEl.appendChild(resultsCritEl);
}
