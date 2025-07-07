class Coord {
    constructor(lat = 0, lon = 0) {
        this.lat = lat;
        this.lon = lon;
    }
}

class Weights {
    constructor(distance = 0, cost = 0, time = 0) {
        this.distance = distance;
        this.cost = cost;
        this.time = time;
    }
}

class PriorityQueue {
    constructor() {
        this.values = [];
    }

    enqueue(node) {
        this.values.push(node);
        this.sort();
    }

    dequeue() {
        return this.values.shift();
    }

    sort() {
        this.values.sort((a, b) => a.fScore - b.fScore);
    }

    isEmpty() {
        return this.values.length === 0;
    }
}

class FlightGraph {
    constructor() {
        this.graph = {};
        this.coords = {};
        this.airportCodes = [];
        this.cityNames = {
            'DEL': 'Delhi',
            'BOM': 'Mumbai',
            'BLR': 'Bangalore',
            'HYD': 'Hyderabad',
            'MAA': 'Chennai',
            'CCU': 'Kolkata',
            'AMD': 'Ahmedabad',
            'GOI': 'Goa',
            'COK': 'Kochi',
            'PNQ': 'Pune',
            'JAI': 'Jaipur',
            'LKO': 'Lucknow',
            'VNS': 'Varanasi',
            'PAT': 'Patna',
            'BBI': 'Bhubaneswar',
            'TRV': 'Thiruvananthapuram',
            'IXC': 'Chandigarh',
            'NAG': 'Nagpur',
            'SXR': 'Srinagar',
            'GAU': 'Guwahati'
        };
    }

    addAirport(code, lat, lon) {
        this.coords[code] = new Coord(lat, lon);
        this.airportCodes.push(code);
        if (!(code in this.graph)) {
            this.graph[code] = [];
        }
    }

    addFlight(src, dest, cost, time, distance) {
        this.graph[src].push({ dest, weights: new Weights(distance, cost, time) });
        if (!(dest in this.graph)) {
            this.graph[dest] = [];
        }
    }

    getGraph() {
        return this.graph;
    }

    getHeuristic(src, dest) {
        const x1 = this.coords[src].lat, y1 = this.coords[src].lon;
        const x2 = this.coords[dest].lat, y2 = this.coords[dest].lon;
        // Scale heuristic to approximate km (1 degree ~ 111 km)
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) * 111;
    }

    hasAirport(airport) {
        return airport in this.coords || airport in this.graph;
    }

    hasDirectRoute(src, dest) {
        console.log(`Checking direct route from ${src} to ${dest}`);
        if (!(src in this.graph)) {
            console.log(`Source ${src} not in graph`);
            return { hasRoute: false, weights: null };
        }
        console.log(`Source ${src} edges:`, this.graph[src]);
        for (const edge of this.graph[src]) {
            console.log(`Comparing edge.dest=${edge.dest} with dest=${dest}`);
            if (edge.dest === dest) {
                console.log(`Found direct route: ${src} -> ${dest}, weights:`, edge.weights);
                return { hasRoute: true, weights: edge.weights };
            }
        }
        console.log(`No direct route found from ${src} to ${dest}`);
        return { hasRoute: false, weights: null };
    }

    getAirportCount() {
        return this.airportCodes.length;
    }

    getCoordinates(code) {
        return this.coords[code];
    }

    getCityName(code) {
        return this.cityNames[code] || code;
    }
}

function combinedCost(weights, prefs, primaryCriterion) {
    if (primaryCriterion === 'distance') return weights.distance;
    if (primaryCriterion === 'cost') return weights.cost;
    if (primaryCriterion === 'time') return weights.time;
    return prefs[0] * weights.distance + prefs[1] * weights.cost + prefs[2] * weights.time;
}

function aStar(graph, start, goal, prefs) {
    const primaryCriterion = getPrimaryCriterion(prefs);
    console.log(`A* running with primary criterion: ${primaryCriterion}, prefs: [${prefs}]`);
    
    const openSet = new PriorityQueue();
    const gScores = { [start]: 0 };
    const paths = { [start]: [start] };
    const costs = { [start]: 0 };
    const times = { [start]: 0 };
    const distances = { [start]: 0 };

    openSet.enqueue({
        fScore: 0,
        airport: start,
        gScore: 0,
        path: [start],
        totalCost: 0,
        totalTime: 0,
        totalDistance: 0
    });

    while (!openSet.isEmpty()) {
        const current = openSet.dequeue();
        console.log(`Exploring: ${current.airport}, gScore: ${current.gScore}, path: ${current.path}`);

        if (current.airport === goal) {
            console.log(`Goal reached: ${current.path}, distance: ${current.totalDistance}`);
            return {
                path: current.path,
                totalDistance: current.totalDistance,
                totalCost: current.totalCost,
                totalTime: current.totalTime
            };
        }

        if (!(current.airport in graph.getGraph())) continue;

        for (const edge of graph.getGraph()[current.airport]) {
            const neighbor = edge.dest;
            const weights = edge.weights;

            const tentativeG = current.gScore + combinedCost(weights, prefs, primaryCriterion);
            console.log(`Evaluating ${current.airport} -> ${neighbor}: tentativeG=${tentativeG}, weights=`, weights);

            if (!(neighbor in gScores) || tentativeG < gScores[neighbor]) {
                gScores[neighbor] = tentativeG;
                const hScore = graph.getHeuristic(neighbor, goal);
                const fScore = tentativeG + hScore;

                const newPath = [...current.path, neighbor];
                const newCost = current.totalCost + weights.cost;
                const newTime = current.totalTime + weights.time;
                const newDistance = current.totalDistance + weights.distance;

                paths[neighbor] = newPath;
                costs[neighbor] = newCost;
                times[neighbor] = newTime;
                distances[neighbor] = newDistance;

                console.log(`Adding to openSet: ${neighbor}, fScore=${fScore}, path=${newPath}, distance=${newDistance}`);

                openSet.enqueue({
                    fScore,
                    airport: neighbor,
                    gScore: tentativeG,
                    path: newPath,
                    totalCost: newCost,
                    totalTime: newTime,
                    totalDistance: newDistance
                });
            }
        }
    }

    console.log(`No path found from ${start} to ${goal}`);
    return { path: [], totalDistance: 0, totalCost: 0, totalTime: 0 };
}

function readFlightData(graph, data) {
    try {
        console.log("Parsing flight data...");
        const lines = data.split('\n');
        let lineIndex = 0;

        const numAirports = parseInt(lines[lineIndex++]);
        console.log(`Number of airports: ${numAirports}`);
        if (isNaN(numAirports) || numAirports <= 0) {
            throw new Error('Invalid number of airports.');
        }

        for (let i = 0; i < numAirports; i++) {
            const line = lines[lineIndex++].trim();
            if (!line) {
                throw new Error(`Incomplete airport data at line ${lineIndex}.`);
            }
            const [code, lat, lon] = line.split(/\s+/);
            const latNum = parseFloat(lat), lonNum = parseFloat(lon);
            if (!code || isNaN(latNum) || isNaN(lonNum)) {
                throw new Error(`Invalid airport format at line ${lineIndex}: ${line}`);
            }
            console.log(`Adding airport: ${code} (${latNum}, ${lonNum})`);
            graph.addAirport(code, latNum, lonNum);
        }

        let edgeCount = 0;
        while (lineIndex < lines.length) {
            const line = lines[lineIndex++].trim();
            if (!line) continue;
            const [src, dest, cost, time, distance] = line.split(/\s+/);
            const costNum = parseFloat(cost), timeNum = parseFloat(time), distanceNum = parseFloat(distance);
            if (!src || !dest || isNaN(costNum) || isNaN(timeNum) || isNaN(distanceNum)) {
                console.warn(`Skipping invalid edge at line ${lineIndex}: ${line}`);
                continue;
            }
            if (costNum <= 0 || timeNum <= 0 || distanceNum <= 0) {
                console.warn(`Invalid edge weights for ${src} -> ${dest} at line ${lineIndex}. Skipping.`);
                continue;
            }
            console.log(`Adding flight: ${src} -> ${dest}, cost=${costNum}, time=${timeNum}, distance=${distanceNum}`);
            graph.addFlight(src, dest, costNum, timeNum, distanceNum);
            edgeCount++;
        }
        console.log(`Total edges added: ${edgeCount}`);
        console.log("Graph after parsing:", graph.getGraph());
        return true;
    } catch (err) {
        throw new Error(`Error reading data: ${err.message}`);
    }
}

function getPrimaryCriterion(prefs) {
    const maxWeight = Math.max(...prefs);
    if (maxWeight < 0.34) {
        return 'combined (equal preferences)';
    }
    if (prefs[0] === maxWeight) return 'distance';
    if (prefs[1] === maxWeight) return 'cost';
    return 'time';
}

document.addEventListener('DOMContentLoaded', () => {
    const flightGraph = new FlightGraph();
    const sourceSelect = document.getElementById('source');
    const destinationSelect = document.getElementById('destination');
    const findRouteBtn = document.getElementById('findRoute');
    const resultsDiv = document.getElementById('results');
    const directRouteDiv = document.getElementById('directRoute');
    const shortestRouteDiv = document.getElementById('shortestRoute');
    const errorDiv = document.getElementById('error');
    const mapContainer = document.getElementById('mapContainer');
    const mapDiv = document.getElementById('map');
    const mapLoading = document.getElementById('mapLoading');

    let map = null;
    let airportMarkers = [];
    let directRouteLayer = null;
    let shortestRouteLayer = null;

    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
        resultsDiv.classList.add('hidden');
        mapContainer.classList.add('hidden');
    }

    function clearError() {
        errorDiv.textContent = '';
        errorDiv.classList.add('hidden');
    }

    function populateAirports() {
        console.log("Populating airports:", flightGraph.airportCodes);
        sourceSelect.innerHTML = '<option value="">Select Source</option>';
        destinationSelect.innerHTML = '<option value="">Select Destination</option>';
        flightGraph.airportCodes.forEach(code => {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = `${code} - ${flightGraph.getCityName(code)}`;
            sourceSelect.appendChild(option.cloneNode(true));
            destinationSelect.appendChild(option);
        });
    }

    function initializeMap() {
        if (map) return;
        map = L.map(mapDiv).setView([20.5937, 78.9629], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            tileSize: 256,
            maxZoom: 18,
            minZoom: 4
        }).addTo(map);

        airportMarkers.forEach(marker => marker.marker.remove());
        airportMarkers = [];
        flightGraph.airportCodes.forEach(code => {
            const coord = flightGraph.getCoordinates(code);
            const marker = L.circleMarker([coord.lat, coord.lon], {
                radius: 5,
                color: '#3388ff',
                fillColor: '#3388ff',
                fillOpacity: 0.8
            }).addTo(map).bindPopup(`${code} - ${flightGraph.getCityName(code)}`);
            airportMarkers.push({ code, marker });
        });

        if (flightGraph.airportCodes.length > 0) {
            const bounds = flightGraph.airportCodes.map(code => {
                const coord = flightGraph.getCoordinates(code);
                return [coord.lat, coord.lon];
            });
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
        }

        mapLoading.classList.add('hidden');
    }

    function updateMap(start, goal, directRouteExists, shortestPath) {
        if (!map) {
            mapContainer.classList.remove('hidden');
            initializeMap();
        }

        airportMarkers.forEach(({ code, marker }) => {
            let color = '#3388ff';
            if (code === start) color = '#00ff00';
            else if (code === goal) color = '#ff0000';
            marker.setStyle({
                color,
                fillColor: color,
                fillOpacity: 0.8
            });
        });

        if (directRouteLayer) directRouteLayer.remove();
        if (shortestRouteLayer) shortestRouteLayer.remove();

        if (directRouteExists) {
            const startCoord = flightGraph.getCoordinates(start);
            const goalCoord = flightGraph.getCoordinates(goal);
            directRouteLayer = L.polyline([[startCoord.lat, startCoord.lon], [goalCoord.lat, goalCoord.lon]], {
                color: 'blue',
                weight: 4,
                opacity: 0.7
            }).addTo(map);
        }

        if (shortestPath.length > 0) {
            const coords = shortestPath.map(code => {
                const coord = flightGraph.getCoordinates(code);
                return [coord.lat, coord.lon];
            });
            shortestRouteLayer = L.polyline(coords, {
                color: 'red',
                weight: 4,
                opacity: 0.7
            }).addTo(map);
        }

        if (directRouteExists || shortestPath.length > 0) {
            const bounds = shortestPath.length > 0
                ? shortestPath.map(code => {
                    const coord = flightGraph.getCoordinates(code);
                    return [coord.lat, coord.lon];
                })
                : [[flightGraph.getCoordinates(start).lat, flightGraph.getCoordinates(start).lon], [flightGraph.getCoordinates(goal).lat, flightGraph.getCoordinates(goal).lon]];
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
        }
    }

    fetch('flight_data_india.txt')
        .then(response => {
            console.log("Fetching flight_data_india.txt...");
            if (!response.ok) {
                throw new Error('Failed to load flight_data_india.txt. Ensure it is in the same folder and the server is running.');
            }
            return response.text();
        })
        .then(data => {
            console.log("Raw flight data:", data.substring(0, 200) + "...");
            try {
                flightGraph.graph = {};
                flightGraph.coords = {};
                flightGraph.airportCodes = [];
                readFlightData(flightGraph, data);
                console.log("Flight graph after loading:", flightGraph.getGraph());
                console.log("Airports loaded:", flightGraph.airportCodes);
                populateAirports();
                clearError();
                mapContainer.classList.remove('hidden');
                initializeMap();
            } catch (err) {
                showError(err.message);
            }
        })
        .catch(err => {
            showError(err.message);
        });

    findRouteBtn.addEventListener('click', () => {
        clearError();
        const start = sourceSelect.value;
        const goal = destinationSelect.value;
        const distanceWeight = parseFloat(document.getElementById('distanceWeight').value);
        const costWeight = parseFloat(document.getElementById('costWeight').value);
        const timeWeight = parseFloat(document.getElementById('timeWeight').value);

        console.log(`Find Route clicked: start=${start}, goal=${goal}, weights=[${distanceWeight}, ${costWeight}, ${timeWeight}]`);

        if (!start || !goal) {
            showError('Please select both source and destination airports.');
            return;
        }

        if (start === goal) {
            showError('Source and destination cannot be the same.');
            return;
        }

        if (isNaN(distanceWeight) || isNaN(costWeight) || isNaN(timeWeight) ||
            distanceWeight < 0 || costWeight < 0 || timeWeight < 0 ||
            Math.abs(distanceWeight + costWeight + timeWeight - 1.0) > 0.01) {
            showError('Weights must be non-negative and sum to 1 (within 0.01).');
            return;
        }

        if (!flightGraph.hasAirport(start) || !flightGraph.hasAirport(goal)) {
            showError('Invalid airport code.');
            return;
        }

        const prefs = [distanceWeight, costWeight, timeWeight];
        const primaryCriterion = getPrimaryCriterion(prefs);
        console.log(`Preferences: ${prefs}, primary criterion: ${primaryCriterion}`);

        const { hasRoute, weights } = flightGraph.hasDirectRoute(start, goal);
        directRouteDiv.innerHTML = `<h3 class="text-md font-semibold">Direct Route from ${start} - ${flightGraph.getCityName(start)} to ${goal} - ${flightGraph.getCityName(goal)}</h3>`;
        if (hasRoute) {
            directRouteDiv.innerHTML += `
                <p>Route: ${start} -> ${goal}</p>
                <p>Distance: ${weights.distance.toFixed(2)} km</p>
                <p>Cost: ${weights.cost.toFixed(2)} INR</p>
                <p>Time: ${weights.time.toFixed(2)} hours</p>
            `;
        } else {
            directRouteDiv.innerHTML += `<p>No direct route found.</p>`;
        }

        const result = aStar(flightGraph, start, goal, prefs);
        console.log("A* result:", result);
        shortestRouteDiv.innerHTML = `<h3 class="text-md font-semibold">Shortest Route from ${start} - ${flightGraph.getCityName(start)} to ${goal} - ${flightGraph.getCityName(goal)} (by ${primaryCriterion})</h3>`;
        if (result.path.length > 0) {
            shortestRouteDiv.innerHTML += `
                <p>Route: ${result.path.map(code => `${code} - ${flightGraph.getCityName(code)}`).join(' -> ')}</p>
                <p>Total Distance: ${result.totalDistance.toFixed(2)} km</p>
                <p>Total Cost: ${result.totalCost.toFixed(2)} INR</p>
                <p>Total Time: ${result.totalTime.toFixed(2)} hours</p>
            `;
            if (result.path.length === 2 && result.path[0] === start && result.path[1] === goal) {
                shortestRouteDiv.innerHTML += `<p>The direct route is already the shortest path.</p>`;
            }
        } else {
            shortestRouteDiv.innerHTML += `<p>No route found.</p>`;
        }

        updateMap(start, goal, hasRoute, result.path);
        resultsDiv.classList.remove('hidden');
    });
});