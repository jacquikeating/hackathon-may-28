// https://api.weatherapi.com/v1/forecast.json?key=26bb7319fff6419294d13727242905&q=London&days=1&aqi=no&alerts=no
// ^ example reference call for weather in London (q) and daily (days=1)

const weatherApiUrl = "https://api.weatherapi.com/v1";
const forecast = "forecast.json";
const weatherApiKey = "26bb7319fff6419294d13727242905";

// create a function which pulls the data from the api with the correct location & q = 1 always DAILY (for now)
const getDailyForecast = async (location, timeRange, condition) => {
  try {
    const response = await axios.get(
      `${weatherApiUrl}/${forecast}.json?key=${weatherApiKey}&q=${location}&days=1&aqi=no&alerts=no`
    );
    let timeOfDay; // array of objects
    if (timeRange === "morning") {
      timeOfDay = response.data.forecast.forecastday[0].hour.slice(6, 13);
    } else if (timeRange === "afternoon") {
      timeOfDay = response.data.forecast.forecastday[0].hour.slice(12, 19);
    } else if (timeRange === "evening") {
      timeOfDay = response.data.forecast.forecastday[0].hour.slice(18, 24);
      timeOfDay.push(response.data.forecast.forecastday[0].hour[0]);
    } else {
      timeOfDay = response.data.forecast.forecastday[0].hour.slice(0, 7);
    }

    let resultToSort = {};
    let sorted;
    if (condition === "temp") {
      for (let i = 0; i < timeOfDay.length; i++) {
        resultToSort[timeOfDay[i].time] = timeOfDay[i]["temp_c"];
        sorted = Object.values(resultToSort).sort((a, b) => a - b);
      }
    } else if (condition === "humidity") {
      for (let i = 0; i < timeOfDay.length; i++) {
        resultToSort[timeOfDay[i].time] = timeOfDay[i]["humidity"];
        sorted = Object.values(resultToSort).sort((a, b) => a - b);
      }
    } else {
      for (let i = 0; i < timeOfDay.length; i++) {
        resultToSort[timeOfDay[i].time] = timeOfDay[i]["chance_of_rain"];
        sorted = Object.values(resultToSort).sort((a, b) => a - b);
      }
    }

    let results = {};
    const temp = resultToSort;

    if (condition === "rain") {
      for (let i = 0; i < sorted.length; i++) {
        if (sorted[i] < 50) {
          let key = getKeyByValue(temp, sorted[i]);
          results[`${key}`] = sorted[i];
          delete temp[`${key}`]; // this line takes care of duplicate values
        }
      }
    } else {
      for (let i = 0; i < 3; i++) {
        let key = getKeyByValue(temp, sorted[i]);
        results[`${key}`] = sorted[i];
        delete temp[`${key}`]; // this line takes care of duplicate values
      }
    }

    // call the html function here
    displayResults(results, condition);
  } catch (error) {
    console.log(error);
  }
};

function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

// add an event listener that listens for a submit event from the form

const walkForm = document.querySelector(".form");

walkForm.addEventListener("submit", (event) => {
  event.preventDefault();

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

  walkForm.reset();

  getDailyForecast(location, timeRange, condition);
  toggleResults();
});

function toggleResults() {
  const main = document.querySelector(".main");
  main.classList.add("show-results");
  main.classList.remove("show-form");
}

function toggleForm() {
  const main = document.querySelector(".main");
  main.classList.add("show-form");
  main.classList.remove("show-results");
}

const resultsListEl = document.querySelector(".results__list");

function displayResults(results, condition) {
  resultsListEl.innerHTML = "";
  const times = Object.keys(results);
  for (let i = 0; i < times.length; i++) {
    displayOneResult(results, times[i], condition, i);
  }
}

function displayOneResult(results, key, condition, i) {
  const resultsListItemEl = document.createElement("li");
  resultsListItemEl.classList.add("results__list-item");
  if (i === 0) {
    resultsListItemEl.classList.add("results__list-item--top");
    resultsListEl.appendChild(resultsListItemEl);
  } else {
    resultsListEl.appendChild(resultsListItemEl);
  }

  const resultsTimeEl = document.createElement("h3");
  resultsTimeEl.classList.add("results__time");
  if (i === 0) {
    resultsTimeEl.classList.add("results__time--top");
  }
  resultsTimeEl.textContent = key.slice(-4, key.length);
  resultsListItemEl.appendChild(resultsTimeEl);

  const resultsCritEl = document.createElement("p");
  resultsCritEl.classList.add("results__primary-criteria");
  if (i === 0) {
    resultsCritEl.classList.add("results__primary-criteria--top");
  }
  if (condition === "temp") {
    resultsCritEl.textContent = results[key] + "° C";
  } else {
    resultsCritEl.textContent = results[key] + "%";
  }

  resultsListItemEl.appendChild(resultsCritEl);

  if (i === 0 && condition === "temp") {
    const resultsIconEl = document.createElement("img");
    resultsIconEl.src = "./attributes/temperature-quarter-solid.svg";
    resultsIconEl.classList.add("results__icon");
    resultsListItemEl.appendChild(resultsIconEl);
  }

  if (i === 0 && condition === "humidity") {
    const resultsIconEl = document.createElement("img");
    resultsIconEl.src = "./attributes/droplet-solid.svg";
    resultsIconEl.classList.add("results__icon");
    resultsListItemEl.appendChild(resultsIconEl);
  }

  if (i === 0 && condition === "rain") {
    const resultsIconEl = document.createElement("img");
    resultsIconEl.src = "./attributes/umbrella-solid.svg";
    resultsIconEl.classList.add("results__icon");
    resultsListItemEl.appendChild(resultsIconEl);
  }
}

const toggleFormBtn = document.querySelector(".main__toggle-form-btn");
toggleFormBtn.addEventListener("click", toggleForm);
