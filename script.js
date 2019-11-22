const input = document.querySelector('input');
const listContainer = document.querySelector('.list-container');
const loadingSpinner = document.querySelector('.loading-spinner');

document.addEventListener('change', getInput);

function getInput() {
	let location = document.querySelector('input').value;
	return location;
}

document.querySelector('button').addEventListener('click', () => {
	displayLoader();
	getLocation(getInput())
		.then(result => {
			DOMController(result);
		})
		.catch(error => {
			console.log(error);
			zeroEverything();
			removeLoader();
			showWeather();
		});
});

document.addEventListener('keypress', e => {
	if (e.code === 'Enter') {
		e.preventDefault();
		if (input.value !== '') {
			closeListContainer();
			displayLoader();
			getLocation(getInput())
				.then(result => {
					DOMController(result);
				})
				.catch(error => {
					console.log(error);
					zeroEverything();
					removeLoader();
					showWeather();
				});
		}
	}
});
// } else if (
//   (e.code === "ArrowDown" || e.code === "ArrowUp") &&
//   input.value !== ""
// ) {
//   e.preventDefault();
//   console.log(e.code);
//   navigateListContainer(e);
// }
// });

input.addEventListener('keyup', displayMatches);

listContainer.addEventListener('click', function(e) {
	closeListContainer();
	displayLoader();
	if (input.value) {
		if (
			e.target.classList.contains('list-item') ||
			e.target.classList.contains('hl')
		) {
			getLocation(e.target.textContent)
				.then(result => {
					const dataArray = result.details.consolidated_weather;

					updateDOM(
						result.details.title,
						dataArray[0].weather_state_name,
						dataArray[0].the_temp,
						dataArray[0].humidity,
						dataArray[0].wind_speed
					);
					updateIcons(
						dataArray[0].weather_state_abbr,
						isDayOrNight(result.details),
						// document.querySelector(".weather-icon")
						null
					);
					updateBackground(isDayOrNight(result.details));
					updateDayWeathers(result.details.consolidated_weather);
					removeLoader();
					showWeather();
				})
				.catch(error => {
					console.log(error);
					zeroEverything();
					removeLoader();
					showWeather();
				});
		}
	}
});

async function getLocation(location) {
	console.log('getting location');
	const endpoint = `https://cors-anywhere.herokuapp.com/https://www.metaweather.com/api/location/search/?query=${location}`;
	try {
		const data = await fetch(endpoint);
		const jsonData = await data.json();
		const place = jsonData[0].woeid;
		const details = await fetch(
			`https://cors-anywhere.herokuapp.com/https://www.metaweather.com/api/location/${place}/`
		);
		const detailsJson = await details.json();
		isDayOrNight(detailsJson);

		return {
			place: place,
			details: detailsJson,
		};
	} catch (error) {
		console.log('Error, please try again');
		zeroEverything();
		showWeather();
		document.querySelector('.city-name').textContent = 'City Not Found';
	}
}

function DOMController(data) {
	const dataArray = data.details.consolidated_weather;

	updateDOM(
		data.details.title,
		dataArray[0].weather_state_name,
		dataArray[0].the_temp,
		dataArray[0].humidity,
		dataArray[0].wind_speed
	);
	updateIcons(
		dataArray[0].weather_state_abbr,
		isDayOrNight(data.details),
		// document.querySelector(".weather-icon")
		null
	);
	removeLoader();
	updateBackground(isDayOrNight(data.details));
	updateDayWeathers(dataArray);
	updateDOMDays();
	showWeather();
}

function updateDOM(name, weatherName, theTemp, humidity, windSpeed) {
	updateDOMWeather(name, weatherName, theTemp, humidity, windSpeed);

	updateWindSpeed(windSpeed);

	updateDOMDays();
}

function updateDOMWeather(name, weatherName, theTemp, humidity) {
	document.querySelector('.max-temperature').textContent = `${Math.round(
		Number(theTemp)
	)}º`;
	document.querySelector('.min-temperature').textContent = weatherName;

	document.querySelector('.city-name').textContent = name;
	document.querySelector('#precip-num').textContent = `${humidity}%`;
	resetinputField();
}

function updateIcons(weather, day, icon) {
	if (day) {
		if (icon) {
			switch (weather) {
				case 'sn':
					icon.innerHTML = `<i class="wi wi-day-snow"></i>` || 'SNOW';
					break;
				case 'sl':
					icon.innerHTML = `<i class="wi wi-day-sleet"></i>` || 'SLEET';
					break;
				case 'h':
					icon.innerHTML = `<i class="wi wi-day-hail"></i>` || 'HAIL';
					break;
				case 't':
					icon.innerHTML =
						`<i class="wi wi-day-thunderstorm"></i>` || 'THUNDER';
					break;
				case 'hr':
					icon.innerHTML = `<i class="wi wi-day-rain"></i>` || 'HEAVY RAIN';
					break;
				case 'lr':
					icon.innerHTML = `<i class="wi wi-day-showers"></i>` || 'LIGHT RAIN';
					break;
				case 's':
					icon.innerHTML = `<i class="wi wi-day-showers"></i>` || 'SHOWERS';
					break;
				case 'hc':
					icon.innerHTML = `<i class="wi wi-cloudy"></i>` || 'HEAVY CLOUD';
					break;
				case 'lc':
					icon.innerHTML = `<i class="wi wi-day-cloudy"></i>` || 'LIGHT CLOUD';
					break;
				case 'c':
					icon.innerHTML = `<i class="wi wi-day-sunny"></i>` || 'CLEAR';
					break;
				default:
					icon.innerHTML = `<i class="wi wi-day-cloudy"></i>` || 'LIGHT CLOUD';
					break;
			}
		} else {
			if (icon) {
				switch (weather) {
					case 'sn':
						icon.innerHTML = `<i class="wi wi-night-alt-snow"></i>` || 'SNOW';
						break;
					case 'sl':
						icon.innerHTML = `<i class="wi wi-night-sleet"></i>` || 'SLEET';
						break;
					case 'h':
						icon.innerHTML = `<i class="wi wi-night-alt-hail"></i>` || 'HAIL';
						break;
					case 't':
						icon.innerHTML =
							`<i class="wi wi-night-alt-thunderstorm"></i>` || 'THUNDER';
						break;
					case 'hr':
						icon.innerHTML =
							`<i class="wi wi-night-alt-rain"></i>` || 'HEAVY RAIN';
						break;
					case 'lr':
						icon.innerHTML =
							`<i class="wi wi-night-sprinkle"></i>` || 'LIGHT RAIN';
						break;
					case 's':
						icon.innerHTML = `<i class="wi wi-night-showers"></i>` || 'SHOWERS';
						break;
					case 'hc':
						icon.innerHTML = `<i class="wi wi-cloudy"></i>` || 'HEAVY CLOUD';
						break;
					case 'lc':
						icon.innerHTML =
							`<i class="wi wi-night-alt-cloudy"></i>` || 'LIGHT CLOUD';
						break;
					case 'c':
						icon.innerHTML = `<i class="wi wi-night-clear"></i>` || 'CLEAR';
						break;
					default:
						icon.innerHTML =
							`<i class="wi wi-night-alt-cloudy"></i>` || 'LIGHT CLOUD';
						break;
				}
			}
		}
	}
}

function convertWindSpeed(windSpeed) {
	return windSpeed * 1.852;
}

function updateWindSpeed(windSpeed) {
	const convertedWindSpeed = Math.round(convertWindSpeed(windSpeed));
	const windSpeedMeasure = document.querySelector('#wind-speed-measure');
	windSpeedMeasure.textContent = `${convertedWindSpeed}`;
	document
		.querySelector('.wind-speed .wind-speed-unit')
		.classList.add('visible');
}

function updateDayWeathers(arr) {
	const dayIconNodes = Array.from(document.querySelectorAll('.days-icon'));
	const dayTempNodes = Array.from(
		document.querySelectorAll('.days-temperature')
	);
	const dayWeatherTextNodes = Array.from(
		document.querySelectorAll('.days-weather-text')
	);

	arr.forEach((item, index) => {
		updateIcons(item.weather_state_abbr, true, dayIconNodes[index]);
		update5DayWeathers(item.weather_state_name, dayWeatherTextNodes[index]);
		updateDayTemps(Math.round(item.the_temp), dayTempNodes[index]);
	});
}

function updateDayTemps(temp, day) {
	if (typeof day === 'undefined') {
		return;
	} else {
		day.textContent = `${temp}º`;
	}
}

function getAverage(num1, num2) {
	return Math.round((num1 + num2) / arguments.length);
}

//change middle boxes to grid layout
//update day weathers

const fetchCities = () => {
	const endpoint = `https://gist.githubusercontent.com/Miserlou/c5cd8364bf9b2420bb29/raw/2bf258763cdddd704f8ffd3ea9a3e81d25e2c6f6/cities.json`;
	const cities = [];
	fetch(endpoint)
		.then(res => res.json())
		.then(data => cities.push(...data));
	return cities;
};

const cities = fetchCities();

function findCities(word, cities) {
	return cities.filter(location => {
		const cityRegex = new RegExp(word, 'gi');
		return location.city.match(cityRegex);
	});
}

function displayMatches() {
	const matchedCities = findCities(this.value, cities);
	if (!this.value) {
		html = '';
		listContainer.innerHTML = html;
	} else {
		const html = matchedCities
			.map(location => {
				const regex = new RegExp(this.value, 'gi');
				const cityName = location.city.replace(
					regex,
					`<span class="hl">${this.value}</span>`
				);
				return `<li class="list-item">${cityName}</li>`;
			})
			.join('');
		listContainer.innerHTML = html;
	}
}

function resetinputField() {
	listContainer.textContent = '';
	input.value = '';
}

function isDayOrNight(data) {
	const sunRise = turnTimeIntoNumber(data.sun_rise);
	const sunSet = turnTimeIntoNumber(data.sun_set);
	const currentTime = turnTimeIntoNumber(data.time);

	return currentTime > sunRise && currentTime < sunSet;
}

function turnTimeIntoNumber(time) {
	let splitArr = time.split('');
	let newArr = [];
	for (let i = 11; i < 16; i++) {
		newArr.push(splitArr[i]);
	}
	let timeNum = Number(newArr.join('').replace(':', '.'));
	return timeNum;
}

function getDays(date = new Date().getDay()) {
	let day;

	switch (date) {
		case 0:
			day = 'SUN';
			break;
		case 1:
			day = 'MON';
			break;
		case 2:
			day = 'TUE';
			break;
		case 3:
			day = 'WED';
			break;
		case 4:
			day = 'THU';
			break;
		case 5:
			day = 'FRI';
			break;
		case 6:
			day = 'SAT';
			break;
		default:
			break;
	}
	return day;
}

function setDays() {
	let dateNum = new Date().getDay() + 1;
	let arr = [];
	for (let i = dateNum; arr.length < 5; i++) {
		if (getDays([i]) === getDays()) {
			continue;
		}

		if (i === 6) {
			arr.push(getDays(i));
			i = 0;
			arr.push(getDays(0));
		} else {
			arr.push(getDays(i));
		}
	}
	return arr;
}

function updateDOMDays() {
	let days = document.querySelectorAll('.week-days');
	let daysArr = setDays();
	days.forEach((day, index) => {
		day.textContent = daysArr[index];
	});
}

function updateBackground(day) {
	let topSection = document.querySelector('.main-top');
	let bottomSection = document.querySelector('.main-bottom');
	let topDetailsContainer = document.querySelector('.precip-humid-container');
	let cityName = document.querySelector('.city-name');
	var mq = window.matchMedia('(max-width: 624px)');

	if (day) {
		mq ? (cityName.style.backgroundColor = 'rgba(125, 75, 107, 0.8)') : null;
		topSection.style.backgroundImage = `url(
      "https://image.freepik.com/free-vector/vector-illustration-mountain-landscape_1441-71.jpg"
    )`;
		bottomSection.style.backgroundColor = 'rgb(125, 75, 107)';
		topDetailsContainer.style.backgroundColor = 'rgb(222, 139, 69)';
	} else {
		mq ? (cityName.style.backgroundColor = 'rgba(73, 127, 171, 0.8)') : null;
		topSection.style.backgroundImage =
			"url('https://image.freepik.com/free-vector/vector-illustration-mountain-landscape_1441-72.jpg')";
		bottomSection.style.backgroundColor = 'rgb(26,66,114)';
		topDetailsContainer.style.backgroundColor = 'rgb(73,127,171)';
	}
}

function update5DayWeathers(weather, node) {
	if (typeof node === 'undefined') {
		return;
	} else {
		node.textContent = weather;
	}
}

document
	.querySelector('body')
	.addEventListener('click', () =>
		listContainer.innerHTML !== '' ? closeListContainer() : null
	);

function closeListContainer() {
	listContainer.innerHTML = '';
}

function showWeather() {
	document.querySelector('.main').style.visibility = 'visible';
}

function displayLoader() {
	document.querySelector('.type-something').style.display = 'none';
	loadingSpinner.style.display = 'initial';
}

function removeLoader() {
	loadingSpinner.style.display = 'none';
}

function zeroEverything() {
	const temp = document.querySelector('.max-temperature');
	const weatherText = document.querySelector('.min-temperature');
	const precipMeasure = document.querySelector('#precip-num');
	const windSpeedMeasure = document.querySelector('#wind-speed-measure');
	const weekDays = Array.from(document.querySelectorAll('.week-days'));
	const weekDayIcons = Array.from(document.querySelectorAll('.days-icon'));
	const weekDayTemps = Array.from(
		document.querySelectorAll('.days-temperature')
	);
	const weekDayWeatherText = Array.from(
		document.querySelectorAll('.days-weather-text')
	);

	temp.textContent = '0';
	weatherText.textContent = 'No Data';
	precipMeasure.textContent = '0%';
	windSpeedMeasure.textContent = '0';

	for (let i = 0; i < weekDays.length; i++) {
		weekDays[i].textContent = 'No Data';
		weekDayIcons[i].textContent = '';
		weekDayTemps[i].textContent = '0';
		weekDayWeatherText[i].textContent = 'No Data';
	}
}

// function navigateDownListContainer(e) {
//   listItems = Array.from(document.querySelectorAll("list-item"));
//   let index;
//   if (e.code === "ArrowDown") {
//     index += 1;
//     console.log(index);
//     list[index].style.backgroundColor = "rgba(0, 0, 0, 0.2)";
//   } else if (e.code === "ArrowUp") {
//     index -= 1;
//     console.log(index);
//     list[index].style.backgroundColor = "rgba(0,0,0,0.2)";
//   }
// }
