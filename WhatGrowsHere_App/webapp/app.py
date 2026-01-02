#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════════════════╗
║        WHAT GROWS HERE? - WEB APPLICATION                                    ║
║        Alpha Nurseries - Flask Web Server                                    ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

import logging
import sys
import os
import csv # <-- Added this line
from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
from collections import defaultdict # <-- Added this line

# Configure logging
logging.basicConfig(stream=sys.stdout, level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')
app = Flask(__name__)
CORS(app, origins=["http://localhost:8888", "https://alpha-gis.onrender.com"])

# ============================================================================
# CONFIGURATION & CONSTANTS
# ============================================================================
logging.info("Application starting up...")
STATE_ABBREVS = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
    'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
    'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
    'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
    'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
    'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
    'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
    'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
    'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
    'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
    'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia'
}

FIPS_REMAP = {
    '24510': '24005',  # Baltimore City -> Baltimore County
    '51510': '51013',  # Alexandria -> Arlington
    '51520': '51191', '51530': '51163', '51540': '51003', '51600': '51059',
    '51610': '51059', '51630': '51177', '51680': '51031', '51770': '51161',
    '29510': '29189',  # St. Louis City -> St. Louis County
    '32510': '32007',  # Carson City -> Elko
}

# ============================================================================
# SPECIES DATABASE
# ============================================================================

class SpeciesDatabase:
    def __init__(self):
        self.counties = []
        self.species_info = {}
        self.county_species_sets = {}
        self.loaded = False
        logging.info("SpeciesDatabase initialized.")

    def normalize_fips(self, fips_raw):
        """Standardize FIPS to 5 digits."""
        if not fips_raw:
            return ""
        return str(fips_raw).split('.')[0].strip().zfill(5)

    def load(self, master_csv, species_csv):
        logging.info(f"Attempting to load data from: {master_csv} and {species_csv}")
        try:
            # 1. Load Species Metadata
            with open(species_csv, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    code = row.get('PLANTS Distribution', '').strip()
                    if code and code != '0':
                        c_name = row.get('Common Name', '').strip()
                        if ',' in c_name:
                            parts = c_name.split(',')
                            c_name = f"{parts[1].strip()} {parts[0].strip()}"
                        self.species_info[f"{code}_presence"] = {
                            'common': c_name,
                            'latin': row.get('Latin Name', '').strip(),
                            'category': row.get('Category', 'Other').strip()
                        }
            logging.info(f"Loaded {len(self.species_info)} species metadata records.")

            # 2. Load County Data
            with open(master_csv, 'r', encoding='utf-8') as f:
                pos = f.tell()
                line = f.readline().strip()
                if line != 'master_species_distribution_data':
                    f.seek(pos)

                reader = csv.DictReader(f)
                species_cols = [c for c in reader.fieldnames if c.endswith('_presence')]

                temp_storage = defaultdict(set)

                for row in reader:
                    self.counties.append(row)

                    raw = row.get('FIPS', row.get('fips', row.get('Fips', '')))
                    if not raw:
                        continue

                    fips = self.normalize_fips(raw)
                    active_species = {col for col in species_cols if row.get(col) == '1'}

                    if active_species:
                        if fips in temp_storage:
                            temp_storage[fips] = temp_storage[fips].union(active_species)
                        else:
                            temp_storage[fips] = active_species
            
            logging.info(f"Loaded {len(self.counties)} county records.")

            # 3. Apply Maryland/Virginia Fixes
            self.county_species_sets = temp_storage.copy()

            for child, parent in FIPS_REMAP.items():
                if child in temp_storage and parent in temp_storage:
                    combined = temp_storage[child].union(temp_storage[parent])
                    self.county_species_sets[child] = combined
                    self.county_species_sets[parent] = combined
                elif parent in temp_storage:
                    self.county_species_sets[child] = temp_storage[parent]

            self.loaded = True
            logging.info("Database load successful.")
            return True

        except Exception as e:
            logging.error(f"CRITICAL: Error loading DB: {e}", exc_info=True)
            return False

    def get_counties_in_state(self, state):
        logging.info(f"get_counties_in_state called for state: '{state}'. Total counties in memory: {len(self.counties)}")
        if not state:
            return []
        state_u = state.upper()
        seen = set()
        results = []
        for c in self.counties:
            if c.get('STATE_NAME', '').upper() == state_u:
                name = c.get('NAME', '')
                if name and name not in seen:
                    results.append(name)
                    seen.add(name)
        logging.info(f"Found {len(results)} counties for state '{state}'.")
        return sorted(results)

    def lookup(self, county_name, state_name):
        t_state = state_name.upper()
        t_county = county_name.upper().replace(" COUNTY", "").strip()

        target = None
        for row in self.counties:
            if row.get('STATE_NAME', '').upper() == t_state:
                r_county = row.get('NAME', '').upper().replace(" COUNTY", "").strip()
                if t_county == r_county:
                    target = row
                    break

        if not target:
            return {'found': False}

        raw = target.get('FIPS', target.get('fips', target.get('Fips', '')))
        fips = self.normalize_fips(raw)

        active_cols = self.county_species_sets.get(fips, set())

        found_species = defaultdict(list)
        for col in active_cols:
            meta = self.species_info.get(col, {'common': col, 'latin': '?', 'category': 'Other'})
            found_species[meta['category']].append(meta)

        for cat in found_species:
            found_species[cat].sort(key=lambda x: x['common'])

        return {
            'found': True,
            'county': target.get('NAME', ''),
            'state': target.get('STATE_NAME', ''),
            'fips': fips,
            'total': len(active_cols),
            'species_set': list(active_cols),
            'data': dict(found_species)
        }

    def get_heatmap_data(self, target_species_set):
        heatmap = {}
        target_set = set(target_species_set)
        for fips, c_set in self.county_species_sets.items():
            heatmap[fips] = len(target_set.intersection(c_set))
        return heatmap

# Initialize database
db = SpeciesDatabase()

def get_data_path(filename):
    """Get path to data files"""
    logging.info(f"Searching for data file: {filename}")
    # Try webapp/data first
    webapp_data = os.path.join(os.path.dirname(__file__), 'data', filename)
    logging.info(f"Checking path: {webapp_data}")
    if os.path.exists(webapp_data):
        logging.info(f"Found data file at: {webapp_data}")
        return webapp_data

    # Try parent data folder
    parent_data = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', filename)
    logging.info(f"Checking path: {parent_data}")
    if os.path.exists(parent_data):
        logging.info(f"Found data file at: {parent_data}")
        return parent_data

    logging.warning(f"Data file not found: {filename}")
    return None

# Load database on startup
master_csv = get_data_path('master_species_distribution_data.csv')
species_csv = get_data_path('species_name_master.csv')

if master_csv and species_csv:
    logging.info("Required CSV files found. Calling db.load().")
    db.load(master_csv, species_csv)
else:
    logging.error("CRITICAL: Could not find one or more required data files on startup.")

# ============================================================================
# ROUTES
# ============================================================================

@app.route('/')
def index():
    """Main page"""
    return render_template('index.html', states=sorted(STATE_ABBREVS.values()))

@app.route('/api/states')
def get_states():
    """Get list of all states"""
    return jsonify(sorted(STATE_ABBREVS.values()))

@app.route('/api/counties/<state>')
def get_counties(state):
    """Get counties for a given state"""
    counties = db.get_counties_in_state(state)
    return jsonify(counties)

@app.route('/api/search', methods=['POST'])
def search():
    """Search for species in a county"""
    data = request.get_json()
    state = data.get('state')
    county = data.get('county')

    if not state or not county:
        return jsonify({'error': 'Missing state or county'}), 400

    result = db.lookup(county, state)
    return jsonify(result)

@app.route('/api/heatmap', methods=['POST'])
def heatmap():
    """Generate heatmap data for a county's species"""
    data = request.get_json()
    species_set = data.get('species_set', [])

    if not species_set:
        return jsonify({'error': 'No species set provided'}), 400

    heatmap_data = db.get_heatmap_data(species_set)
    return jsonify(heatmap_data)

@app.route('/api/export/<format>', methods=['POST'])
def export_data(format):
    """Export species data in various formats"""
    data = request.get_json()
    result = data.get('result')

    if not result:
        return jsonify({'error': 'No data to export'}), 400

    if format == 'csv':
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['Category', 'Common Name', 'Latin Name'])

        for category, species_list in result.get('data', {}).items():
            for species in species_list:
                writer.writerow([category, species['common'], species['latin']])

        output.seek(0)
        return send_file(
            io.BytesIO(output.getvalue().encode('utf-8')),
            mimetype='text/csv',
            as_attachment=True,
            download_name=f"{result['county']}_{result['state']}_species.csv"
        )

    elif format == 'json':
        return jsonify(result)

    else:
        return jsonify({'error': 'Unsupported format'}), 400

# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
