// Focalizza la mappa su Milano
const map = L.map('map').setView([45.4642, 9.1900], 13);

// Aggiungi il layer OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

// Icona personalizzata per i luoghi accessibili
const wheelchairIcon = L.icon({
  iconUrl: 'https://example.com/wheelchair-icon.png', // Sostituisci con il link dell'icona desiderata
  iconSize: [32, 32], // Dimensione dell'icona
  iconAnchor: [16, 32], // Punto di ancoraggio dell'icona
  popupAnchor: [0, -32], // Punto di ancoraggio del popup rispetto all'icona
});

// Funzione per aggiungere marker sulla mappa
function addMarker(lat, lng, name, category) {
  L.marker([lat, lng], { icon: wheelchairIcon }).addTo(map).bindPopup(
    `<strong>${name}</strong><br>
    Categoria: ${category || 'N/A'}<br>
    <span style='color: red;'>Accessibile</span>`
  );
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
      const category = element.tags.amenity || "Non specificata";
      addMarker(lat, lng, name, category);
    });
  })
  .catch((error) => console.error("Errore nel caricamento dei dati dall'Overpass API:", error));
