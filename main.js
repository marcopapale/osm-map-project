// Aggiungi barra di ricerca e filtro nella mappa
document.body.insertAdjacentHTML('beforeend', `
  <div style="position: absolute; top: 10px; left: 50%; transform: translateX(-50%); z-index: 1000; background: white; padding: 10px; border-radius: 25px; display: flex; align-items: center; gap: 10px; box-shadow: 0px 2px 6px rgba(0,0,0,0.3);">
    <input id="searchInput" type="text" placeholder="Cerca un indirizzo" style="flex: 1; border: none; outline: none; padding: 8px; font-size: 14px; border-radius: 25px;">
    <button id="searchButton" style="padding: 8px 16px; background: #007bff; color: white; border: none; outline: none; cursor: pointer; border-radius: 25px; transition: background-color 0.3s ease;">Cerca</button>
    <select id="categoryFilter" style="padding: 8px; border-radius: 25px; border: 1px solid #ccc;">
      <option value="">Tutte le categorie</option>
    </select>
  </div>
`);

// Effetti di mouse over sul pulsante di ricerca
const searchButton = document.getElementById('searchButton');
searchButton.addEventListener('mouseover', () => {
  searchButton.style.backgroundColor = '#0056b3';
});
searchButton.addEventListener('mouseout', () => {
  searchButton.style.backgroundColor = '#007bff';
});

// Focalizza la mappa su Milano con maggiore livello di zoom
const mapContainer = document.createElement('div');
mapContainer.id = 'map';
mapContainer.style.cssText = 'height: 80vh; margin: 20px auto; border-radius: 25px; overflow: hidden; box-shadow: 0px 2px 6px rgba(0,0,0,0.3);';
document.body.appendChild(mapContainer);

const map = L.map('map').setView([45.4642, 9.1900], 17);

// Aggiungi il layer OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

// Icona personalizzata per i luoghi accessibili
const wheelchairIcon = L.icon({
  iconUrl: 'https://github.com/marcopapale/osm-map-project/blob/main/wheel.png?raw=true',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Funzione per aggiungere marker sulla mappa
function addMarker(lat, lng, name, category) {
  const marker = L.marker([lat, lng], { icon: wheelchairIcon }).addTo(map);
  marker.bindPopup(
    `<div style='position: relative;'>
      <button style='position: absolute; top: -10px; right: -10px; width: 20px; height: 20px; background: red; color: white; border: none; border-radius: 50%; cursor: pointer;' onclick='map.closePopup()'>×</button>
      <strong>${name}</strong><br>
      Categoria: ${category || 'N/A'}<br>
      <span style='color: red;'>Accessibile</span>
    </div>`
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
      const categories = new Set();
      data.elements.forEach((element) => {
        const lat = element.lat;
        const lng = element.lon;
        const name = element.tags.name || "Luogo accessibile";
        const category = element.tags.amenity || "Non specificata";
        categories.add(category);
        addMarker(lat, lng, name, category);
      });
      populateCategories(Array.from(categories));
    })
    .catch((error) => console.error("Errore nel caricamento dei dati dall'Overpass API:", error));
}

// Funzione per popolare dinamicamente il filtro delle categorie
function populateCategories(categories) {
  const categoryFilter = document.getElementById('categoryFilter');
  categoryFilter.innerHTML = '<option value="">Tutte le categorie</option>';
  categories.forEach((category) => {
    categoryFilter.innerHTML += `<option value="${category}">${category.charAt(0).toUpperCase() + category.slice(1)}</option>`;
  });
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
  if (categoryFilter === '') {
    const center = map.getCenter();
    loadPOIs(center.lat, center.lng);
    return;
  }
  const categoryFilter = document.getElementById('categoryFilter').value;
  const center = map.getCenter();
  loadPOIs(center.lat, center.lng, categoryFilter);
});
