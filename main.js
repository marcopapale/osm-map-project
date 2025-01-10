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
window.onAccessibilityCloudLoaded = function (AccessibilityCloud) {
  var element = document.querySelector('#accessibility-cloud-results');
  AccessibilityCloud.render(element, {
    token: '7178cfee53eac8f159d6fe5db189d112',
    locale: 'it_IT',
    requestParameters: {
      latitude: 45.4642, // Milano
      longitude: 9.1900,
      accuracy: 1000, // Raggio di ricerca in metri
      limit: 20, // Numero massimo di risultati
      filter: 'at-least-partially-accessible-by-wheelchair',
    },
    onDataLoaded: (data) => {
      // Itera sui dati e aggiungi marker
      data.places.forEach((place) => {
        const lat = place.location.latitude;
        const lng = place.location.longitude;
        const name = place.name || 'Punto di interesse';
        addMarker(lat, lng, name);
      });
    },
  });
};
