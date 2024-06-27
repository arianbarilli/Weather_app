document.getElementById('search-button').addEventListener('click', function () {
    const cityInput = document.getElementById('city-input');
    const city = cityInput.value;
    cityInput.value = '';
    const apiKey = '806ea9d63ea8349e2ff35089b9f6e35c';
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&lang=pt_br&units=metric`;

    fetch(apiUrl)
        .then(response => handleResponse(response))
        .then(data => {
            if (data && data.coord && data.wind) {
                getStateAndCountry(data);
            } else {
                throw new Error('Dados incompletos recebidos da API');
            }
        })
        .catch(error => showError(error));
});

function handleResponse(response) {
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Cidade não encontrada');
        } else {
            throw new Error('Erro ao buscar os dados');
        }
    }
    return response.json();
}

function getStateAndCountry(data) {
    const { lat, lon } = data.coord;
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;

    fetch(url)
        .then(response => response.json())
        .then(locationData => {
            const { state, country } = locationData.address;
            const stateDisplay = state ? state : 'Estado não encontrado';
            updateWeatherInfo(data, stateDisplay, country);
        })
        .catch(error => {
            console.error('Erro ao buscar os dados de localização:', error);
            showError('Erro ao buscar os dados de localização.');
        });
}

function updateWeatherInfo(data, stateDisplay, country) {
    const weatherInfo = document.getElementById('weather-info');
    const windDirection = getWindDirection(data.wind.deg);
    const windSpeedKmh = data.wind.speed * 3.6;

    const timezoneOffsetSeconds = data.timezone;
    const currentTimeUTC = new Date();
    const localTime = new Date(currentTimeUTC.getTime() + timezoneOffsetSeconds * 1000);
    const formattedDate = localTime.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    const formattedTime = localTime.toLocaleTimeString('pt-BR', { timeZone: 'UTC' });

    weatherInfo.innerHTML = `
        <h2>${data.name}, ${stateDisplay}, ${country}</h2>
        <p>Temperatura: ${data.main.temp} °C</p>
        <p>Sensação Térmica ${data.main.feels_like} °C</p>
        <p>Vento: ${windSpeedKmh.toFixed(2)} km/h, ${windDirection}</p>
        <p>Clima: ${capitalizeFirstLetter(data.weather[0].description)}</p>
        <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Ícone do tempo">
        <p>${formattedDate} - ${formattedTime}</p>
    `;
}

function getWindDirection(degrees) {
    const directions = ['Norte', 'Nordeste', 'Leste', 'Sudeste', 'Sul', 'Sudoeste', 'Oeste', 'Noroeste'];
    const index = Math.round((degrees % 360) / 45) % 8;
    return directions[index];
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function showError(error) {
    document.getElementById('weather-info').innerHTML = `<p>Erro: ${error.message}</p>`;
}
