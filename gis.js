document.addEventListener('DOMContentLoaded', () => {
  console.log('gis.js script loaded and running!');
  const API_URL = 'https://alpha-gis.onrender.com';

  const stateSelect = document.getElementById('state-select');
  const countySelect = document.getElementById('county-select');
  const searchButton = document.getElementById('search-button');
  const resultsDiv = document.getElementById('gis-results');
  const heatmapLegendDiv = document.getElementById('heatmap-legend');
  
  let geojsonLayer = null;
  let countiesData = null;

  // 1. Initialize Leaflet Map
  const map = L.map('map').setView([39.8283, -98.5795], 4);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CartoDB</a>',
    subdomains: 'abcd',
    maxZoom: 19
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
    // Hide results and legend while searching
    resultsDiv.style.display = 'none';
    heatmapLegendDiv.style.display = 'none'; // NEW
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
        resultsDiv.style.display = 'block'; // Show message
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
      // The heatmapLegendDiv is now shown inside drawHeatmap

    } catch (error) {
      console.error('Search failed:', error);
      resultsDiv.innerHTML = `<p>An error occurred during the search. Please try again.</p>`;
      resultsDiv.style.display = 'block'; // Show error message
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
    resultsDiv.style.display = 'block';
  }

  // 7. Draw Heatmap on the map
  function drawHeatmap(heatmapData, maxScore) {
    console.log('drawHeatmap called:'); // RE-ADDED DEBUG LOG
    console.log('  maxScore:', maxScore); // RE-ADDED DEBUG LOG
    console.log('  heatmapData sample:', Object.entries(heatmapData).slice(0, 5)); // RE-ADDED DEBUG LOG
    window.logCounter = 0; // Reset counter for limited logging


    if (geojsonLayer) {
      map.removeLayer(geojsonLayer);
    }
    if (!countiesData) {
        resultsDiv.innerHTML += '<p style="color: red;">Could not draw heatmap because map shapes failed to load.</p>';
        return;
    }

    function getColor(score) {
        if (score === 0 || maxScore === 0) return '#f7f7f7'; // Light grey for no matches
        const ratio = score / maxScore;
        // Using a green scale for "growing" plants
        return ratio > 0.75 ? '#005a32' : // Darkest Green (High Similarity)
               ratio > 0.50 ? '#238b45' :
               ratio > 0.25 ? '#43a2ca' : // Medium Green
               ratio > 0.05 ? '#7bccc4' : // Lighter Green
               ratio > 0.00 ? '#bae4bc' : // Very Light Green (Low Similarity)
                             '#f7f7f7'; // Light grey for no match
    }

    geojsonLayer = L.geoJson(countiesData, {
      style: function(feature) {
        const fips = feature.id; // Corrected: FIPS is in feature.id
        const score = heatmapData[fips] || 0;
        const ratio = maxScore > 0 ? score / maxScore : 0; // RE-ADDED for logging
        
        // RE-ADDED DEBUG LOG, now with a limit
        if (window.logCounter < 20) { // Log only first 20 features
            console.log('  Feature FIPS:', fips, 'Score:', score, 'Ratio:', ratio.toFixed(2), 'Color:', getColor(score));
            window.logCounter++;
        }
        
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
                const fips = feature.id; // Corrected: FIPS is in feature.id
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