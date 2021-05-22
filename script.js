'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let map, mapEvent;

// getting map to show
if (navigator.geolocation)
  navigator.geolocation.getCurrentPosition(function (position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    const coords = [latitude, longitude];
    map = L.map('map').setView(coords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    L.marker(coords)
      .addTo(map)
      .bindPopup('This is your current<br> location.')
      .openPopup();

    map.on(
      'click',
      function (mapE) {
        mapEvent = mapE;
        // clear inputs
        inputDistance.value =
          inputCadence.value =
          inputDuration.value =
          inputElevation.value =
            '';
        form.classList.remove('hidden');
        inputDistance.focus();
      },
      function () {
        alert('Could not get your location.');
      }
    );
  });

form.addEventListener('submit', function (e) {
  e.preventDefault();

  // clear inputs
  inputDistance.value =
    inputCadence.value =
    inputDuration.value =
    inputElevation.value =
      '';

  console.log(mapEvent);
  // Get coordinates
  const { lat, lng } = mapEvent.latlng;
  const newCoords = [lat, lng];
  console.log('still works');
  // Make new marker
  L.marker(newCoords)
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: 'running-popup',
      }).setContent('Workout')
    )
    .openPopup();
  console.log('even still works');
});

inputType.addEventListener('change', function (e) {
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
});
