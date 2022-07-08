//
var apiKey = '9cf344a97fc35b51b344edd2744c0642'
var today = moment().format('MM/DD/YYYY')
var searchHistory = []

function weatherNow(city) {
	var queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
	$.ajax({
		url: queryURL,
	}).then(function (response) {
		console.log(response)

		$('#detail').empty()
		//get the icons
		var icon = response.weather[0].icon
		console.log(icon)
		var iconImage = `http://openweathermap.org/img/wn/${icon}@2x.png`

		var currentCity = $(`
        <h2 id="currentCity">
                ${response.name} ${today} <img src="${iconImage}" alt="${response.weather[0].description}" />
            </h2>
            <p>Temperature: ${response.main.temp} °F</p>
            <p>Humidity: ${response.main.humidity}\%</p>
            <p>Wind Speed: ${response.wind.speed} MPH</p>
        `)
		$('#detail').append(currentCity)
		var lat = response.coord.lat
		var lon = response.coord.lon

		var newURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`
		$.ajax({
			url: newURL,
		}).then(function (response) {
			console.log(response)
			var push = $(`
        <p>UV Index: <span id='uvIndexColor' class="px-2 py-2 rounded">${response.value}</span></p>
        `)

			$('#detail').append(push)

			//Set color for UV INdex
			if (response.value >= 0 && response.value <= 2) {
				$('#uvIndexColor')
					.css('background-color', 'green')
					.css('color', 'white')
			} else if (response.value >= 3 && response.value <= 5) {
				$('#uvIndexColor').css('background-color', 'yellow')
			} else if (response.value >= 6 && response.value <= 7) {
				console.log('pretty dangerous')
				$('#uvIndexColor').css('background-color', 'orange')
			} else if (response.value >= 8 && response.value <= 10) {
				$('#uvIndexColor').css('background-color', 'red').css('color', 'white')
			} else {
				$('uvIndexColor')
					.css('background-color', 'violet')
					.css('color', 'white')
			}
		})

		weatherFuture(lat, lon)
	})
}
function weatherFuture(lat, lon) {
	var url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=current,minutely,hourly,alerts&appid=${apiKey}`
	$.ajax({
		url: url,
	}).then(function (response) {
		console.log(response.daily)

		$('#five-day').empty()

		for (let i = 0; i < 5; i++) {
			var info = {
				date: response.daily[i].dt,
				icon: response.daily[i].weather[0].icon,
				temp: response.daily[i].temp.day,
				humidity: response.daily[i].humidity,
				windSpeed: response.daily[i].wind_speed,
			}

			var newDate = moment.unix(info.date).format('MM / DD / YYYY')
			var iconImage = `<img
					src='https://openweathermap.org/img/w/${info.icon}.png'
					alt='${response.daily[i].weather[0].main}'
				/>`

			var forecastCard = $(`
                <div class="pl-3">
                    <div class="card pl-3 pt-3 mb-3 bg-primary text-light" style="width: 12rem;>
                        <div class="card-body">
                            <h5>${newDate}</h5>
                            <p>${iconImage}</p>
                            <p>Temp: ${info.temp} °F</p>
                            <p>WindSpeed: ${info.windSpeed} MPH
                            <p>Humidity: ${info.humidity}\%</p>
                        </div>
                    </div>
                <div>
            `)
			$('#five-day').append(forecastCard)
		}
	})
}
$('#searchButton').on('click', function (e) {
	e.preventDefault()

	var city = $('#cityName').val().trim()
	weatherNow(city)

	//add search history
	if (!searchHistory.includes(city)) {
		searchHistory.push(city)
		var historyCity = $(`
        <li class="list-group-item">${city}</li>
        `)
		$('#history').append(historyCity)
	}
	localStorage.setItem('city', JSON.stringify(searchHistory))
})
// click history
$(document).on('click', '.list-group-item', function () {
	var listCity = $(this).text()
	weatherNow(listCity)
})
//load last city searched
$(document).ready(function () {
	var searchHistoryArr = JSON.parse(localStorage.getItem('city'))

	if (searchHistoryArr !== null) {
		var lastSearchedIndex = searchHistoryArr.length - 1
		var lastSearchedCity = searchHistoryArr[lastSearchedIndex]
		weatherNow(lastSearchedCity)
	}
})
