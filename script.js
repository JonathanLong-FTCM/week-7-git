const clearTable = () => {
    const dataCells = ['name', 'official-name', 'capital', 'language', 'map', 'population', 'flag', 'coordinate', 'rainfall', 'temperature'];
    dataCells.forEach(id => {
        const cell = document.getElementById(id);
        if (cell) {
            if (id === 'map' || id === 'flag') {
                cell.innerHTML = '';
            } else {
                cell.textContent = '';
            }
        }
    });
};

const loadingSpinner = (show) => {
    document.getElementById('loading-spinner').style.display = show ? 'block' : 'none';
};

async function country() {
    const countryName = document.getElementById('country-select').value;
    if (!countryName) {
        clearTable();
        return;
    }

    clearTable();
    loadingSpinner(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
        const resCountry = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);
        if (!resCountry.ok) {
           throw new Error('Network response was not ok');
        }
        const country = (await resCountry.json())[0];

        const latitude = country.capitalInfo.latlng[0];
        const longitude = country.capitalInfo.latlng[1];

        const resWeather = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,rain&forecast_days=1`);
        if (!resWeather.ok) {
            throw new Error('Network response was not ok');
        }
        const hourly = (await resWeather.json()).hourly;

        document.getElementById('name').textContent = country.name.common;
        document.getElementById('official-name').textContent = country.name.official;
        document.getElementById('capital').textContent = country.capital ? country.capital[0] : 'N/A';
        document.getElementById('language').textContent = Object.values(country.languages ?? {})[0] ?? 'N/A';
        document.getElementById('map').innerHTML = `<a href="${country.maps.googleMaps}" target="_blank">View Map</a>`;
        document.getElementById('population').textContent = new Intl.NumberFormat().format(country.population);
        document.getElementById('flag').innerHTML = `<img src="${country.flags.svg}" alt="${country.name.common} Flag" />`;
        document.getElementById('coordinate').textContent = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
        document.getElementById('rainfall').textContent = `${hourly.rain.reduce((a, b) => a+b, 0).toFixed(2)} mm`;
        document.getElementById('temperature').textContent = `${(hourly.temperature_2m.reduce((a, b) => a+b, 0)/hourly.temperature_2m.length).toFixed(2)} °C`;
        
    } catch (error) {
        const output = document.getElementById('output');
        if (output) output.textContent = 'Error';
    }
    finally {
        loadingSpinner(false);
    }
};