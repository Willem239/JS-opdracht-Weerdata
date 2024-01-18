function getLastEnteredLocation() {
  return localStorage.getItem('lastLocation');
}

document.addEventListener('DOMContentLoaded', function() {
  const API_KEY = '90951cb21e8b08d1e6800e6af6230ffa';
  const locationInput = document.getElementById('location');
  const mapContainer = document.getElementById('map');

  let map = null;
  let marker = null;

  function initializeMap(latitude, longitude) {
    map = L.map('map').setView([latitude, longitude], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);
  }

  function updateMap(lat, lon) {
    if (marker) {
      map.removeLayer(marker);
    }
    fetchWeatherDataAndAddIconToMap(lat, lon);
    map.setView([lat, lon], 10);
  }

  function fetchWeatherDataAndAddIconToMap(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
      .then(response => response.json())
      .then(data => {
        let iconUrl = `http://openweathermap.org/img/w/${data.weather[0].icon}.png`;
        let html = `<div><img src="${iconUrl}" width="50" height="50"/><div class="temp">${data.main.temp.toFixed(1)} °C</div></div>`;
        let icon = L.divIcon({
          html: html,
          className: 'myDivIcon',
          iconSize: [50, 50],
          iconAnchor: [15, 55],
        });
        marker = L.marker([lat, lon], { icon: icon }).addTo(map);
      })
      .catch(error => console.error('Error:', error));
  }

  function getDefaultGeolocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        if (!map) {
          initializeMap(latitude, longitude);
        }
        updateMap(latitude, longitude);
      }, () => {
        console.error('Geolocation API is not allowed or failed.');
        const lastLocation = getLastEnteredLocation();
        if (lastLocation) {
          getGeolocationByInput(lastLocation);
        } else {
          initializeMapAndDefaultLocation();
        }
      });
    } else {
      console.error('Geolocation API is not supported by this browser.');
      const lastLocation = getLastEnteredLocation();
      if (lastLocation) {
        getGeolocationByInput(lastLocation);
      } else {
        initializeMapAndDefaultLocation();
      }
    }
  }

  function initializeMapAndDefaultLocation() {
    const defaultLat = 52.370216;
    const defaultLon = 4.895168;
    if (!map) {
      initializeMap(defaultLat, defaultLon);
    }
    updateMap(defaultLat, defaultLon);
  }

  function getGeolocationByInput(location) {
    fetch(`https://nominatim.openstreetmap.org/search?q=${location}&format=json`)
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          let lat = parseFloat(data[0].lat);
          let lon = parseFloat(data[0].lon);
          if(!map){
            initializeMap(lat, lon);
          }
          updateMap(lat, lon);
        } else {
          console.error('Geen locatie gevonden');
        }
      })
      .catch(error => console.error('Error:', error));
  }

  function setLastEnteredLocation(location) {
    localStorage.setItem('lastLocation', location);
  }

  const lastLocation = getLastEnteredLocation();
  if (lastLocation) {
    locationInput.value = lastLocation;
    getGeolocationByInput(lastLocation);
  } else {
    getDefaultGeolocation();
  }

  let debounceMapTimeout = null;
  
  locationInput.addEventListener('input', function() {
    let location = this.value;
    clearTimeout(debounceMapTimeout); // Annuleer de vorige timeout
    debounceMapTimeout = setTimeout(function() {
      if (location) {
        getGeolocationByInput(location);
        setLastEnteredLocation(location);
      } else {
        getDefaultGeolocation();
        setLastEnteredLocation('');
      }
    }, 500); // Wacht 500 milliseconden na de laatste invoer van de gebruiker voordat de functie wordt uitgevoerd
  });
});
