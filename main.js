// Focalizza la mappa su Milano
const map = L.map('map').setView([45.4642, 9.1900], 13);

// Aggiungi il layer OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Funzione per aggiungere marker sulla mappa
function addMarker(lat, lng, name) {
  L.marker([lat, lng]).addTo(map).bindPopup(`<strong>${name}</strong>`);
}

// Chiamata API per ottenere i POI direttamente senza proxy
const apiUrl = 'https://accessibility-cloud.freetls.fastly.net/place-infos';
const params = {
  appToken: '7178cfee53eac8f159d6fe5db189d112',
  latitude: 45.4642,
  longitude: 9.1900,
  accuracy: 1000, // 1 km di raggio
};

// Costruisci l'URL con i parametri
const url = `${apiUrl}?${new URLSearchParams(params).toString()}`;

// Effettua la chiamata API
fetch(url)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Errore nella richiesta: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    console.log(data); // Debug: stampa i dati
    if (data.length > 0) {
      data.forEach((place) => {
        const lat = place.location.latitude;
        const lng = place.location.longitude;
        const name = place.name || 'Punto di interesse';
        addMarker(lat, lng, name);
      });
    } else {
      console.warn('Nessun luogo trovato.');
    }
  })
  .catch((error) => console.error('Errore nel caricamento dei dati:', error));
