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

// Esempio: Ottieni dati dall'API
fetch('https://accessibility-cloud-url-endpoint') // Sostituisci con l'URL API reale
  .then(response => response.json())
  .then(data => {
    // Itera sui dati e aggiungi marker
    data.features.forEach(feature => {
      const lat = feature.geometry.coordinates[1];
      const lng = feature.geometry.coordinates[0];
      const name = feature.properties.name || 'Punto di interesse';
      addMarker(lat, lng, name);
    });
  })
  .catch(error => console.error('Errore nel caricamento dei dati:', error));
