// Crea la mappa e centrarla su una posizione iniziale
const map = L.map('map').setView([37.7749, -122.4194], 13); // [Latitudine, Longitudine]

// Aggiungi il layer OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Esempio di marker
const marker = L.marker([37.7749, -122.4194]).addTo(map);
marker.bindPopup('San Francisco').openPopup();
        