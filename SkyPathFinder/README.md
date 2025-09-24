# SkyPathFinder

A web-based flight route planner that uses the A* algorithm to find optimal flight paths between Indian airports based on user-defined preferences for distance, cost, or time. Features interactive map visualization using Leaflet.js and a responsive UI built with JavaScript, HTML, and CSS.

## Features
- **A* Pathfinding**: Optimizes routes based on user-specified weights for distance, cost, or time.
- **Interactive Map**: Visualizes airports and routes using Leaflet.js with OpenStreetMap tiles.
- **Dynamic Preferences**: Allows users to prioritize distance, cost, or time (weights sum to 1).
- **Flight Data Processing**: Parses airport and flight data from a text file for graph-based pathfinding.
- **Responsive UI**: Built with JavaScript, HTML, and CSS for seamless user interaction.

## Technologies
- **Languages**: JavaScript, HTML, CSS
- **Libraries**: Leaflet.js for map visualization
- **Algorithms**: A* algorithm, graph data structure, priority queue
- **Data**: Text file (`flight_data_india.txt`) for airport and flight details
- **External Resources**: OpenStreetMap for map tiles

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/skypathfinder.git
   ```
2. Ensure `flight_data_india.txt` is in the project root directory.
3. Install a local server (e.g., `http-server`):
   ```bash
   npm install -g http-server
   ```
4. Run the server:
   ```bash
   http-server
   ```
5. Open `index.html` in a web browser (e.g., `http://localhost:8080`).

## Usage
1. Select source and destination airports from the dropdown menus.
2. Adjust preference sliders for distance, cost, and time (weights must sum to 1).
3. Click "Find Route" to view the direct route (if available) and the shortest path, displayed on an interactive map with detailed metrics (distance, cost, time).

## Project Structure
- `index.html`: Main HTML file for the web interface.
- `styles.css`: Styling for responsive UI.
- `app.js`: Core logic, including A* algorithm, graph processing, and map rendering.
- `flight_data_india.txt`: Sample dataset with Indian airport coordinates and flight details.

## Future Enhancements
- Integrate real-time flight data via APIs.
- Support multi-city itinerary planning.
- Add alternative pathfinding algorithms (e.g., Dijkstra’s).
- Enhance UI with advanced styling and mobile responsiveness.



