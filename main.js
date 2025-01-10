// Focalizza la mappa su Milano
const map = L.map('map').setView([45.4642, 9.1900], 13);

// Aggiungi il layer OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

// Funzione per aggiungere marker sulla mappa
function addMarker(lat, lng, name) {
  L.marker([lat, lng]).addTo(map).bindPopup(`<strong>${name}</strong>`);
}

// URL dell'Overpass API con query per luoghi accessibili
const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json][timeout:25];node["wheelchair"="yes"](45.40,9.10,45.50,9.30);out body;`;

// Effettua la chiamata API
fetch(overpassUrl)
  .then((response) => response.json())
  .then((data) => {
    console.log("Dati ricevuti dall'Overpass API:", data);
    data.elements.forEach((element) => {
      const lat = element.lat;
      const lng = element.lon;
      const name = element.tags.name || "Luogo accessibile";
      addMarker(lat, lng, name);
    });
  })
  .catch((error) => console.error("Errore nel caricamento dei dati dall'Overpass API:", error));
