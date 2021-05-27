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

class Workout {
  date = new Date();
  id = String(Date.now()).slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance; // in km
    this.duration = duration; // in minutes
  }
  setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    }${this.date.getDate()}`;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this.setDescription();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this.setDescription();
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

class App {
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('could not get your current location');
        }
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];
    console.log(coords);

    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    L.marker(coords)
      .addTo(this.#map)
      .bindPopup('This is your current<br> location.')
      .openPopup();

    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    // clear inputs
    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        '';
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    let workout;
    const validate = (...inputs) => inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    const { lat, lng } = this.#mapEvent.latlng;
    e.preventDefault();

    // Get data from form
    const input = inputType.value;
    const duration = +inputDuration.value;
    const distance = +inputDistance.value;

    // If workout is running, create running object
    if (input === 'running') {
      const cadence = +inputCadence.value;
      // Check if data is valid
      if (
        !allPositive(distance, duration, cadence) ||
        !validate(distance, duration, cadence)
      ) {
        alert('needs positive numbers');
      }
      workout = new Running([lat, lng], distance, duration, cadence);
      this.#workouts.push(workout);
    }

    // If workout is cycling, create cycling object

    if (input === 'cycling') {
      const elevation = +inputElevation.value;
      // Check if data is valid
      if (
        !validate(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Inputs have to be positive numbers');
      workout = new Cycling([lat, lng], distance, duration, elevation);
      this.#workouts.push(workout);
    }

    console.log(this.#workouts);
    // hide form + clear inputs
    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        '';
    console.log(workout);
    this._createNewMarker(workout);
  }

  _createNewMarker(workout) {
    // Make new marker
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        }).setContent('Workout')
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}"> 
        <h2 class="workout__title">${workout.description}</h2> 
        <div class="workout__details"> 
          <span class="workout__icon">${
            workout.type === 'running' ? '🏃‍♂' : '🚴‍♀‍'
          }</span> 
          <span class="workout__value">${workout.distance}</span> 
          <span class="workout__unit">km</span> 
        </div> 
        <div class="workout__details"> 
          <span class="workout__icon">⏱</span> 
          <span class="workout__value">${workout.duration}</span> 
          <span class="workout__unit">min</span> 
        </div> 
      </li>
`;
    if (workout.type === 'running') {
      html += ` 
          <div class="workout__details"> 
            <span class="workout__icon">⚡️</span> 
            <span class="workout__value">${workout.pace.toFixed()}</span> 
            <span class="workout__unit">min/km</span> 
          </div> 
          <div class="workout__details"> 
            <span class="workout__icon">🦶🏼</span> 
            <span class="workout__value">${workout.cadence}</span> 
            <span class="workout__unit">spm</span> 
          </div>`;
    }
    if (workout.type === 'cycling') {
      html += ` 
            <div class="workout__details"> 
              <span class="workout__icon">⚡️</span> 
              <span class="workout__value">${workout.speed.toFixed()}</span> 
              <span class="workout__unit">km/h</span> 
            </div> 
            <div class="workout__details"> 
              <span class="workout__icon">⛰</span> 
              <span class="workout__value">${workout.elevationGain}</span> 
              <span class="workout__unit">m</span> 
            </div>`;
    }
  }
}

const app = new App();
