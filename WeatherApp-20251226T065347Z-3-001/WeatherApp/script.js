// WEATHER_API_KEY is loaded from config.js
const weatherForm = document.getElementById('weatherForm');
const cityInput = document.getElementById('cityInput');
const weatherInfo = document.getElementById('weatherInfo');
const weatherIcon = document.getElementById('weatherIcon');
const temp = document.getElementById('temp');
const humidity = document.getElementById('humidity');
const desc = document.getElementById('desc');
const errorMsg = document.getElementById('errorMsg');
const themeToggle = document.getElementById('themeToggle');

function getWeatherIcon(iconCode) {
  // Map OpenWeatherMap icon codes to emoji for simplicity
  const iconMap = {
    '01d': '☀️', '01n': '🌙',
    '02d': '🌤️', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️',
  };
  return iconMap[iconCode] || '❔';
}

weatherForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return;
  errorMsg.textContent = '';
  weatherInfo.style.display = 'none';
  document.getElementById('forecast').innerHTML = '';
  try {
    // Current weather
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`);
    if (!res.ok) throw new Error('City not found');
    const data = await res.json();
    temp.textContent = `${Math.round(data.main.temp)}°C`;
    humidity.textContent = `Humidity: ${data.main.humidity}%`;
    desc.textContent = data.weather[0].description;
    weatherIcon.textContent = getWeatherIcon(data.weather[0].icon);
    weatherInfo.style.display = 'flex';

    // 5-day forecast
    const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`);
    if (!forecastRes.ok) throw new Error('Forecast not found');
    const forecastData = await forecastRes.json();
    const forecastDiv = document.getElementById('forecast');
    // Group by day, pick midday (12:00) for each day
    const days = {};
    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      const hour = date.getHours();
      if (!days[day] || Math.abs(hour - 12) < Math.abs(days[day].hour - 12)) {
        days[day] = { ...item, hour };
      }
    });
    let count = 0;
    for (const [day, item] of Object.entries(days)) {
      if (count++ >= 5) break;
      const icon = getWeatherIcon(item.weather[0].icon);
      const temp = `${Math.round(item.main.temp)}°C`;
      const desc = item.weather[0].description;
      forecastDiv.innerHTML += `
        <div class="forecast-day">
          <div>${day}</div>
          <div class="icon">${icon}</div>
          <div class="temp">${temp}</div>
          <div class="desc">${desc}</div>
        </div>
      `;
    }
  } catch (err) {
    errorMsg.textContent = err.message || 'Failed to get weather.';
  }
});

// Theme toggle logic
let darkMode = true;
function setTheme(dark) {
  document.body.classList.toggle('dark-mode', dark);
  document.body.classList.toggle('light-mode', !dark);
  themeToggle.classList.toggle('dark', dark);
}
themeToggle.addEventListener('click', () => {
  darkMode = !darkMode;
  setTheme(darkMode);
});
setTheme(true);
