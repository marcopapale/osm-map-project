// Aggiungi barra di ricerca e filtro nella mappa
document.body.insertAdjacentHTML('beforeend', `
  <div style="position: absolute; top: 10px; left: 50%; transform: translateX(-50%); z-index: 1000; background: white; padding: 10px; border-radius: 25px; display: flex; align-items: center; gap: 10px; box-shadow: 0px 2px 6px rgba(0,0,0,0.3);">
    <input id="searchInput" type="text" placeholder="Cerca un indirizzo" style="flex: 1; border: none; outline: none; padding: 8px; font-size: 14px; border-radius: 25px;">
    <button id="searchButton" style="padding: 8px 16px; background: #007bff; color: white; border: none; outline: none; cursor: pointer; border-radius: 25px;">Cerca</button>
    <select id="categoryFilter" style="padding: 8px; border-radius: 25px; border: 1px solid #ccc;">
      <option value="">Tutte le categorie</option>
      <option value="restaurant">Ristoranti</option>
      <option value="cafe">Caffè</option>
      <option value="library">Biblioteche</option>
      <option value="toilets">Toilette</option>
    </select>
  </div>
`);

// Focalizza la mappa su Milano con maggiore livello di zoom
const map = L.map('map').setView([45.4642, 9.1900], 17);

// Aggiungi il layer OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

// Icona personalizzata per i luoghi accessibili
const wheelchairIcon = L.icon({
  iconUrl: 'https://github.com/marcopapale/osm-map-project/blob/main/wheel.png?raw=true', // Sostituisci con il link dell'icona desiderata
  iconSize: [32, 32], // Dimensione dell'icona
  iconAnchor: [16, 32], // Punto di ancoraggio dell'icona
  popupAnchor: [0, -32], // Punto di ancoraggio del popup rispetto all'icona
});

// Funzione per aggiungere marker sulla mappa
function addMarker(lat, lng, name, category) {
  const marker = L.marker([lat, lng], { icon: wheelchairIcon }).addTo(map);
  marker.bindPopup(
    `<strong>${name}</strong><br>
    Categoria: ${category || 'N/A'}<br>
    <span style='color: red;'>Accessibile</span>`
  );
  return marker;
}

// Funzione per caricare POI in base alle coordinate e categoria
function loadPOIs(lat, lng, categoryFilter = "") {
  const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json][timeout:25];node["wheelchair"="yes"]${categoryFilter ? `["amenity"="${categoryFilter}"]` : ""}(${lat - 0.05},${lng - 0.05},${lat + 0.05},${lng + 0.05});out body;`;

  fetch(overpassUrl)
    .then((response) => response.json())
    .then((data) => {
      console.log("Dati ricevuti dall'Overpass API:", data);
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });
      data.elements.forEach((element) => {
        const lat = element.lat;
        const lng = element.lon;
        const name = element.tags.name || "Luogo accessibile";
        const category = element.tags.amenity || "Non specificata";
        addMarker(lat, lng, name, category);
      });
    })
    .catch((error) => console.error("Errore nel caricamento dei dati dall'Overpass API:", error));
}

// Carica i POI iniziali
loadPOIs(45.4642, 9.1900);

// Aggiungi evento per il pulsante di ricerca
document.getElementById('searchButton').addEventListener('click', () => {
  const address = document.getElementById('searchInput').value;
  const categoryFilter = document.getElementById('categoryFilter').value;
  if (!address) return alert('Inserisci un indirizzo.');

  // Usa un servizio geocoding per trovare le coordinate dell'indirizzo
  const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

  fetch(geocodeUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data.length === 0) return alert('Indirizzo non trovato.');

      const { lat, lon } = data[0];
      map.setView([lat, lon], 17);

      // Carica nuovi POI filtrati
      loadPOIs(lat, lon, categoryFilter);
    })
    .catch((error) => console.error("Errore nel geocoding:", error));
});

// Aggiungi evento per il tasto Invio nella barra di ricerca
document.getElementById('searchInput').addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    document.getElementById('searchButton').click();
  }
});

// Aggiungi evento per il filtro delle categorie
document.getElementById('categoryFilter').addEventListener('change', () => {
  const categoryFilter = document.getElementById('categoryFilter').value;
  const center = map.getCenter();
  loadPOIs(center.lat, center.lng, categoryFilter);
});
