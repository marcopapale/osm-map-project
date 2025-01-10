
// Importa FontAwesome per le icone
const script = document.createElement('script');
script.src = "https://kit.fontawesome.com/a076d05399.js";
document.head.appendChild(script);

// Aggiungi barra di ricerca nella mappa
document.body.insertAdjacentHTML('beforeend', `
  <div style="position: absolute; top: 10px; left: 50%; transform: translateX(-50%); z-index: 1000; background: white; padding: 10px; border-radius: 25px; display: flex; align-items: center; box-shadow: 0px 2px 6px rgba(0,0,0,0.3);">
    <input id="searchInput" type="text" placeholder="Cerca un indirizzo" style="flex: 1; border: none; outline: none; padding: 8px; font-size: 14px; border-radius: 25px 0 0 25px;">
    <button id="searchButton" style="padding: 8px 16px; background: #007bff; color: white; border: none; outline: none; cursor: pointer; border-radius: 0 25px 25px 0;">Cerca</button>
  </div>
`);

// Focalizza la mappa su Milano con maggiore livello di zoom
const map = L.map('map').setView([45.4642, 9.1900], 15);

// Aggiungi il layer OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

// Icona personalizzata per i luoghi accessibili con FontAwesome
const wheelchairIcon = L.divIcon({
  html: '<i class="fas fa-wheelchair" style="color: green; font-size: 24px;"></i>',
  className: 'custom-div-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
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

// Aggiungi evento per il pulsante di ricerca
document.getElementById('searchButton').addEventListener('click', () => {
  const address = document.getElementById('searchInput').value;
  if (!address) return alert('Inserisci un indirizzo.');

  // Usa un servizio geocoding per trovare le coordinate dell'indirizzo
  const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

  fetch(geocodeUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data.length === 0) return alert('Indirizzo non trovato.');

      const { lat, lon } = data[0];
      map.setView([lat, lon], 15);
    })
    .catch((error) => console.error("Errore nel geocoding:", error));
});
