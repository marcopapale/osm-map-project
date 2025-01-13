// Aggiungi barra di navigazione per il calcolo del percorso
document.body.insertAdjacentHTML('beforeend', `
  <div style="position: absolute; top: 80px; left: 50%; transform: translateX(-50%); z-index: 1000; background: white; padding: 10px; border-radius: 25px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0px 2px 6px rgba(0,0,0,0.3); width: 90%; max-width: 400px;">
    <label for="startInput" style="font-size: 14px;">Partenza</label>
    <input id="startInput" type="text" placeholder="Inserisci indirizzo di partenza" style="width: 100%; border: none; outline: none; padding: 8px; font-size: 14px; border-radius: 25px;">
    <label for="endInput" style="font-size: 14px;">Destinazione</label>
    <input id="endInput" type="text" placeholder="Inserisci indirizzo di destinazione" style="width: 100%; border: none; outline: none; padding: 8px; font-size: 14px; border-radius: 25px;">
    <button id="routeButton" style="padding: 8px 16px; background: #007bff; color: white; border: none; outline: none; cursor: pointer; border-radius: 25px; transition: background-color 0.3s ease;">Andiamo</button>
  </div>
`);

// Effetti di mouse over sul pulsante Andiamo
const routeButton = document.getElementById('routeButton');
routeButton.addEventListener('mouseover', () => {
  routeButton.style.backgroundColor = '#0056b3';
});
routeButton.addEventListener('mouseout', () => {
  routeButton.style.backgroundColor = '#007bff';
});

// Inizializza il routing layer
let routingControl;

// Funzione per calcolare il percorso
document.getElementById('routeButton').addEventListener('click', () => {
  const startAddress = document.getElementById('startInput').value;
  const endAddress = document.getElementById('endInput').value;

  if (!startAddress || !endAddress) {
    alert('Inserisci sia la partenza che la destinazione.');
    return;
  }

  const geocodeUrl = (address) => `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

  Promise.all([
    fetch(geocodeUrl(startAddress)).then((res) => res.json()),
    fetch(geocodeUrl(endAddress)).then((res) => res.json()),
  ])
    .then(([startData, endData]) => {
      if (startData.length === 0 || endData.length === 0) {
        alert('Indirizzo non trovato. Controlla gli indirizzi inseriti.');
        return;
      }

      const startCoords = [startData[0].lat, startData[0].lon];
      const endCoords = [endData[0].lat, endData[0].lon];

      // Rimuovi il percorso precedente, se presente
      if (routingControl) {
        map.removeControl(routingControl);
      }

      // Usa Leaflet Routing Machine per calcolare e visualizzare il percorso
      routingControl = L.Routing.control({
        waypoints: [
          L.latLng(startCoords[0], startCoords[1]),
          L.latLng(endCoords[0], endCoords[1]),
        ],
        routeWhileDragging: false,
        show: false,
        addWaypoints: false,
      }).addTo(map);

      map.fitBounds([
        [startCoords[0], startCoords[1]],
        [endCoords[0], endCoords[1]],
      ]);
    })
    .catch((error) => console.error('Errore nel calcolo del percorso:', error));
});

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
    `<strong>${name}</strong><br>
      Categoria: ${category || 'N/A'}<br>
      <span style='color: red;'>Accessibile</span>`
  );
  return marker;
}
