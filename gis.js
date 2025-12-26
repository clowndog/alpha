document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'https://gis-7t7s.onrender.com';

  const stateSelect = document.getElementById('state-select');
  const countySelect = document.getElementById('county-select');
  const searchButton = document.getElementById('search-button');
  const resultsDiv = document.getElementById('gis-results');
  
  let geojsonLayer = null;
  let countiesData = null;

  // 1. Initialize Leaflet Map
  const map = L.map('map').setView([39.8283, -98.5795], 4);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // 2. Pre-fetch GeoJSON data
  async function fetchCountyShapes() {
    try {
      const response = await fetch('./assets/counties.json');
      countiesData = await response.json();
      console.log('County shapes loaded.');
    } catch (error) {
      console.error('Error fetching county shapes:', error);
      resultsDiv.textContent = 'Error loading map data. The heatmap will not be available.';
    }
  }

  // 3. Fetch States and Populate Dropdown
  async function fetchStates() {
    try {
      const response = await fetch(`${API_URL}/api/states`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const states = await response.json();
      
      stateSelect.innerHTML = '<option value="">Select a State</option>';
      states.forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateSelect.appendChild(option);
      });
    } catch (error) {
      console.error('Error fetching states:', error);
      resultsDiv.textContent = 'Error loading states. Please try refreshing.';
    }
  }

  // 4. Fetch Counties based on State Selection
  async function fetchCounties(state) {
    if (!state) {
      countySelect.innerHTML = '<option value="">Select a County</option>';
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/counties/${state}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const counties = await response.json();
      
      countySelect.innerHTML = '<option value="">Select a County</option>';
      counties.forEach(county => {
        const option = document.createElement('option');
        option.value = county;
        option.textContent = county;
        countySelect.appendChild(option);
      });
    } catch (error) {
      console.error('Error fetching counties:', error);
      resultsDiv.textContent = 'Error loading counties for the selected state.';
    }
  }

  // 5. Main Search Function
  async function performSearch() {
    const state = stateSelect.value;
    const county = countySelect.value;

    if (!state || !county) {
      alert('Please select both a state and a county.');
      return;
    }

    resultsDiv.innerHTML = `<p>Searching for species in ${county}, ${state}...</p>`;
    searchButton.disabled = true;

    try {
      // Step 1: Get species for the county
      const searchResponse = await fetch(`${API_URL}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state, county })
      });
      if (!searchResponse.ok) throw new Error('Failed to fetch species data.');
      const searchResult = await searchResponse.json();

      if (!searchResult.found) {
        resultsDiv.innerHTML = `<p>No species data found for ${county}, ${state}.</p>`;
        return;
      }

      displayResults(searchResult);

      // Step 2: Get heatmap data
      const heatmapResponse = await fetch(`${API_URL}/api/heatmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ species_set: searchResult.species_set })
      });
      if (!heatmapResponse.ok) throw new Error('Failed to fetch heatmap data.');
      const heatmapData = await heatmapResponse.json();

      // Step 3: Draw heatmap on map
      drawHeatmap(heatmapData, searchResult.total);

    } catch (error) {
      console.error('Search failed:', error);
      resultsDiv.innerHTML = `<p>An error occurred during the search. Please try again.</p>`;
    } finally {
      searchButton.disabled = false;
    }
  }

  // 6. Display formatted results
  function displayResults(result) {
    let html = `<h3>Found ${result.total} species in ${result.county}, ${result.state}</h3>`;
    for (const category in result.data) {
      html += `<h4>${category}</h4><ul>`;
      result.data[category].forEach(species => {
        html += `<li>${species.common} (<em>${species.latin}</em>)</li>`;
      });
      html += `</ul>`;
    }
    resultsDiv.innerHTML = html;
  }

  // 7. Draw Heatmap on the map
  function drawHeatmap(heatmapData, maxScore) {
    if (geojsonLayer) {
      map.removeLayer(geojsonLayer);
    }
    if (!countiesData) {
        resultsDiv.innerHTML += '<p style="color: red;">Could not draw heatmap because map shapes failed to load.</p>';
        return;
    }

    function getColor(score) {
        if (score === 0 || maxScore === 0) return '#FFFFFF'; // White for no matches
        const ratio = score / maxScore;
        return ratio > 0.8 ? '#800026' :
               ratio > 0.6 ? '#BD0026' :
               ratio > 0.4 ? '#E31A1C' :
               ratio > 0.2 ? '#FC4E2A' :
               ratio > 0.1 ? '#FD8D3C' :
               ratio > 0.0 ? '#FEB24C' :
                             '#FFFFFF';
    }

    geojsonLayer = L.geoJson(countiesData, {
      style: function(feature) {
        const fips = feature.properties.FIPS;
        const score = heatmapData[fips] || 0;
        return {
          fillColor: getColor(score),
          weight: 1,
          opacity: 1,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.7
        };
      },
      onEachFeature: function(feature, layer) {
        layer.on({
            mouseover: function(e) {
                const l = e.target;
                l.setStyle({ weight: 3, color: '#666', dashArray: '' });
                if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                    l.bringToFront();
                }
                const fips = feature.properties.FIPS;
                const score = heatmapData[fips] || 0;
                l.bindTooltip(`<b>${feature.properties.NAME}</b><br>${score} matching species`).openTooltip();
            },
            mouseout: function(e) {
                geojsonLayer.resetStyle(e.target);
                e.target.closeTooltip();
            }
        });
      }
    }).addTo(map);
  }


  // Event Listeners
  stateSelect.addEventListener('change', (e) => fetchCounties(e.target.value));
  searchButton.addEventListener('click', performSearch);

  // Initial Fetches
  fetchCountyShapes();
  fetchStates();
});