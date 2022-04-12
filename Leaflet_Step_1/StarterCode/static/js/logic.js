// Store our API endpoint as queryUrl.
var queryUrl = ("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson");

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
    // A function to determine the circle size based on the magnitude
    function getRadius(mag)  {
    //console.log(feature.properties.mag);
    return mag * 4
  }

  function getColor(feature){
    //console.log(feature.geometry.coordinates[2]);
    let depth = feature.geometry.coordinates[2];
    let color = "#DAF7A6";
    if      ( depth > 75) { color = "#581845" }
    else if ( depth > 50) { color = "#900C3F"}
    else if ( depth > 30) { color = "#C70039" }
    else if ( depth > 15) { color = "#FF5733" }
    else if ( depth > 5) { color = "#FFC300" }
    return(color)
  }


  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}<br>Magnitude: ${(feature.properties.mag)}<br>Depth: ${(feature.geometry.coordinates[2])}</p>`);
  }

  function pointToLayer (feature, latlng) {
    return new L.CircleMarker ( latlng, 
                                { radius      : getRadius(feature.properties.mag),
                                  color       : '#555',
                                  fillColor   : getColor(feature),
                                  fillOpacity : 1,
                                  weight      : 1
                                }
                              );
  }


  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: pointToLayer,
    onEachFeature : onEachFeature
  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Create the base layers.
  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  var baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var legend= L.control({position: 'bottomright'});

  legend.onAdd=function(myMap){
      var div=L.DomUtil.create('div','legend');
      var grades=[
          "-10 to +5", "6 - 15", "16 - 30", "31 - 50", "51 - 75", "75+"
      ];
      var colors= [
          '#DAF7A6', '#FFC300', '#FF5733', '#C70039', '#900C3F', '#581845'
          
      ];
  
      //create title
      var legendtitle="<h4> Earthquake Depth (km)</h4>";
      div.innerHTML=legendtitle
      
      // create labels array for legend values
      var labels=[];
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
            "<i style='background: " + colors[i] + "'></i> " +
           grades[i] + (grades[i + 1] ? ""  + "<br>" : "");
          }
          return div;
        };
  
  
  legend.addTo(myMap)
  
  }
