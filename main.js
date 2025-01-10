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

// Funzione per caricare i dati di Accessibility Cloud
fetch('https://accessibility-cloud.freetls.fastly.net/place-infos?appToken=7178cfee53eac8f159d6fe5db189d112&latitude=45.4642&longitude=9.1900&accuracy=1000')
  .then(response => response.json())
  .then(data => {
    console.log(data); // Stampa i dati per debug
    if (data.length > 0) {
      data.forEach((place) => {
        const lat = place.location.latitude;
        const lng = place.location.longitude;
        const name = place.name || 'Punto di interesse';
        addMarker(lat, lng, name);
      });
    } else {
      console.warn('Nessun dato trovato.');
    }
  })
  .catch(error => console.error('Errore nel caricamento dei dati:', error));
