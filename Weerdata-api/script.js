document.addEventListener('DOMContentLoaded', function() {
  const API_KEY = '90951cb21e8b08d1e6800e6af6230ffa';
  const weatherData = document.getElementById('weatherData');
  const locationInput = document.getElementById('location');
  const clearInput = document.getElementById('clearInput');
  const tempBtn = document.getElementById('temperature');
  const precipBtn = document.getElementById('precipitation');
  const windBtn = document.getElementById('wind');
  const humidityBtn = document.getElementById('humidity');
  const timeframeBtns = document.querySelectorAll('[name="forecast"]');
  const toggleBtns = document.querySelectorAll('.toggle-buttons input[type="checkbox"]');
  const mapContainer = document.getElementById('map');

  let currentData = null;

  function fetchWeatherData(location, timeframe) {
    let url;
    if (timeframe === 'today') {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`;
    } else { // assuming timeframe is 'fiveDays'
      url = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${API_KEY}&units=metric`;
    }
    fetch(url)
      .then(response => response.json())
      .then(data => {
        currentData = data;
        console.log(currentData);
        displayWeatherData(timeframe);
      })
      .catch(error => console.error('Error:', error));
  }


  

  function translateDescription(description) {
    const translations = {
      'clear sky': 'heldere hemel',
      'few clouds': 'enkele wolken',
      'scattered clouds': 'verspreide wolken',
      'broken clouds': 'Zware bewolking',
      'shower rain': 'buien',
      'rain': 'regen',
      'thunderstorm': 'onweersbui',
      'snow': 'sneeuw',
      'mist': 'mist',
      'light rain': 'lichte regen',
      'overcast clouds': 'Matig bewolkt'
    };

    return translations[description] || description;
  }

  function displayWeatherData(timeframe) {
    // Clear previous data
    weatherData.innerHTML = '';

    if (timeframe === 'today') {
      if (tempBtn.checked) {
        let temp = document.createElement('p');
        temp.textContent = `Temperatuur: ${currentData.main.temp.toFixed(1)} °C`;
        weatherData.appendChild(temp);
      }

      if (precipBtn.checked) {
        let precip = document.createElement('p');
        precip.textContent = `Neerslag: ${translateDescription(currentData.weather[0].description)}`;
        weatherData.appendChild(precip);
      }

      if (windBtn.checked) {
        let wind = document.createElement('p');
        wind.textContent = `Windsnelheid: ${currentData.wind.speed} km/u`;
        weatherData.appendChild(wind);
      }

      if (humidityBtn.checked) {
        let humidity = document.createElement('p');
        humidity.textContent = `Luchtvochtigheid: ${currentData.main.humidity} %`;
        weatherData.appendChild(humidity);
      }

      let icon = document.createElement('img');
      icon.src = `http://openweathermap.org/img/w/${currentData.weather[0].icon}.png`;
      weatherData.appendChild(icon);
    } else { // assuming timeframe is 'fiveDays'
      let daysContainer = document.createElement('div');
      daysContainer.classList.add('days-container');

      for (let i = 0; i < 5; i++) {
        let dayData = currentData.list[i * 8];

        let dayDiv = document.createElement('div');
        dayDiv.classList.add('day');

        if (tempBtn.checked) {
          let temp = document.createElement('p');
          temp.textContent = `Max Temp: ${dayData.main.temp_max.toFixed(1)} °C`;
          dayDiv.appendChild(temp);
        }

        if (precipBtn.checked) {
          let precip = document.createElement('p');
          precip.textContent = `Neerslag: ${translateDescription(dayData.weather[0].description)}`;
          dayDiv.appendChild(precip);
        }

        if (windBtn.checked) {
          let wind = document.createElement('p');
          wind.textContent = `Max Windsnelheid: ${dayData.wind.speed} km/u`;
          dayDiv.appendChild(wind);
        }

        if (humidityBtn.checked) {
          let humidity = document.createElement('p');
          humidity.textContent = `Max Luchtvochtigheid: ${dayData.main.humidity} %`;
          dayDiv.appendChild(humidity);
        }

        let icon = document.createElement('img');
        icon.src = `http://openweathermap.org/img/w/${dayData.weather[0].icon}.png`;
        dayDiv.appendChild(icon);

        daysContainer.appendChild(dayDiv);
      }

      weatherData.appendChild(daysContainer);
    }
  }

  let debounceTimeout = null;

locationInput.addEventListener('input', function() {
  clearTimeout(debounceTimeout); // Annuleer de vorige timeout
  debounceTimeout = setTimeout(function() {
    let timeframe = document.querySelector('[name="forecast"]:checked').value;
    fetchWeatherData(locationInput.value, timeframe);
  }, 2500); // Wacht 500 milliseconden na de laatste invoer van de gebruiker voordat de functie wordt uitgevoerd
});


  clearInput.addEventListener('click', function() {
    locationInput.value = '';
    weatherData.innerHTML = '';
  });

  timeframeBtns.forEach(btn => {
    btn.addEventListener('change', function() {
      fetchWeatherData(locationInput.value, this.value);
    });
  });

  toggleBtns.forEach(btn => {
    btn.addEventListener('change', function() {
      if (currentData) {
        displayWeatherData(document.querySelector('[name="forecast"]:checked').value);
      }
    });
  });

    const lastLocation = getLastEnteredLocation();
  if (lastLocation) {
    const timeframe = document.querySelector('[name="forecast"]:checked').value;
    fetchWeatherData(lastLocation, timeframe);
  }

});