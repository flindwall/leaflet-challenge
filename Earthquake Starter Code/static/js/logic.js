 // Define a function we want to run once for each feature in the features array
 //give each feature a popup describing the place and time of the earthquake
function popUpMSG(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place + ", Magnitude = " + feature.geometry.coordinates[2] +  "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
 }


 //create function to calculate circle size based om earthquake magnitude
 function circleSize(feature){
    radius = feature.properties.mag
    return radius**2;
 }

 //create function to calculate circle color based on depth of earthquake 
 function circleColor(feature){
    depth = feature.geometry.coordinates[2]
    
    if(depth < 5){
        color = "yellow"
    }
    else if (depth < 10){
        color = "orange"
    }
    else {
        color = "red"
    }
    return color
 }
 //Define streetmap and darkmap layers
let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1
  });

let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    maxZoom: 18
  });

//create baseMaps object to hold base layers
let baseMaps = {
    "Street Map" : streetmap,
    "Topographic Map": topo
  };

//Create map
let myMap = L.map("map", {
    center : [37.09, -95.71],
    zoom : 5,
    layers : [streetmap]
  });

//add streetmap tile to map
streetmap.addTo(myMap);

//create layer for earthquakes
let earthquakes = new L.LayerGroup();


//create overlay object to hold overlay layer
let overlayMaps = {
    Earthquakes: earthquakes
};


//create layer control
//pass in our baseMaps and overlayMaps
L.control.layers(baseMaps, overlayMaps, {
    collapsed : false
}).addTo(myMap);


//retrieve data using a GET request to the query URL
const queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2021-01-01&endtime=2021-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

d3.json(queryUrl).then(function(data) {

    console.log(data)
    //create GeoJSON layer containing the features arry on earthquakeData object

    L.geoJSON(data, {
        onEachFeature: popUpMSG,
        pointToLayer: function(feature, latlong){
            return new L.CircleMarker(latlong, {
                radius: circleSize(feature),
                fillOpacity: 0.8
            });
        },
        style:function(feature){
            return {color: circleColor(feature)}
        }

    }).addTo(earthquakes);
    earthquakes.addTo(myMap);


    //create legend for map
    var legend = L.control({position : 'bottomright'});
    legend.onAdd = function(){

        //code for legend
        var div = L.DomUtil.create('div', 'info legend')

        //define separation of colors
        colorChange = [0, 5, 10]
        colors = ["yellow", "orange", "red"]

        for (var i = 0; i < colors.length; i++) {
            div.innerHTML +=
                '<i style="background:' + circleColor({geometry: {coordinates: [0, 0, colors[i]]}}) + '"></i> ' +
                colors[i] + (colors[i + 1] ? '&ndash;' + colors[i + 1] + ' km<br>' : '+ km');
        }

        div.innerHTML = '<div style="background-color: white; padding: 5px; border: 1px solid black;">' + div.innerHTML + '</div>';


        return div;


    };

    legend.addTo(myMap);

    });



