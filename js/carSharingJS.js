// JavaScript Document
window.addEventListener('load', function(){
          // Everything has loaded!
var latlngUser = 0;
var latlngSearch =0 ;

var allPost = null ;
var startPoint =null;
var destPoint =null;
var markerUser = null;
var searchMarker = null ;
var routingControl = null ;
var nearestMarker = null;

//var L = require('leaflet');
//require('leaflet-routing-machine');
//require('lrm-graphhopper'); // This will tack on the class to the L.Routing namespace

var map = L.map( 'map', {

                center: [43.79, 11.26],
                minZoom: 2,
                zoom: 13
                });



var currentMap = L.tileLayer( 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                  subdomains: ['a', 'b', 'c']
                }).addTo(map);
var currentMapLink =  'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var Esri_WorldImagery = 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
var defaultmap = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
console.log("map is created");
L.esri.basemapLayer('Streets');

var redIcon = new L.Icon({
                      iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                      iconSize: [25, 41],
                      iconAnchor: [12, 41],
                      popupAnchor: [1, -34],
                      shadowSize: [41, 41]
                    });

var greenIcon = new L.Icon({
                      iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                      iconSize: [25, 41],
                      iconAnchor: [12, 41],
                      popupAnchor: [1, -34],
                      shadowSize: [41, 41]
                    });

var myURL = jQuery( 'script[src$="carSharingJS.js"]' ).attr( 'src' ).replace( 'carSharingJS.js', '' )
//var layersControl = L.control.layers(null, null).addTo(map);


var groupLayer = L.layerGroup().addTo(map);



var geocodeService = L.esri.Geocoding.geocodeService();

var searchControl = L.esri.Geocoding.geosearch().addTo(map);
console.log("searchControl");
console.log(searchControl.getContainer());

var results = L.layerGroup().addTo(map);

searchControl.on('results', function (data) {
                    results.clearLayers();
                    if (markerUser != null){
                    groupLayer.removeLayer(markerUser);

                    }
                    cancelRouting();
                    for (var i = data.results.length - 1; i >= 0; i--) {
                    console.log(data.results.length);
                    latlngSearch = data.results[i].latlng ;


                     searchMarker =L.marker(latlngSearch,{icon : greenIcon});
                     groupLayer.addLayer(searchMarker);
                     results.addLayer(searchMarker);
                     startPoint = latlngSearch ;

                     console.log(latlngUser);
                     searchMarker.bindPopup(data.results[i].text);
                     creatPopup();
                     findTheNearst(latlngSearch);

                    }
                    });


document.getElementById("trovabtn").addEventListener("click", getLocation);

document.getElementById("switchbtn").addEventListener("click", switchMap);

document.getElementById("tuttibtn").addEventListener("click", trovaTutti);

getLocation();


function trovaTutti (){
if (allPost == null ){
$.getJSON("js/markers.geojson", function(markers) {
                        allPost = L.geoJSON(markers).bindPopup("loading..").addTo(groupLayer).addTo(map);
                        creatPopup();
                        console.log("1");
                                });
                                $("#tuttibtn").text("NASCONDI TUTTI");

}
if (allPost != null){

map.removeLayer(allPost);

console.log("tutti posti is removed");
$("#tuttibtn").text("TUTTI POSTI ");
allPost = null;
}

}



function getLocation() {

              if (navigator.geolocation) {
                                           navigator.geolocation.getCurrentPosition(addUserPosition, errorCoor, {maximumAge:1000, timeout:5000, enableHighAccuracy:true});
                                         }
             function errorCoor(){ document.getElementById("mainpart").innerHTML="error position";}

                               }



function addUserPosition(position){

if (searchMarker != null){
results.clearLayers();
}
cancelRouting;
if (markerUser != null){
groupLayer.removeLayer(markerUser);
markerUser = null;
}
latlngUser = [ position.coords.latitude , position.coords.longitude];
markerUser = L.marker(latlngUser,{icon : greenIcon}).bindPopup("loading..").bindTooltip('You are Here!').addTo(map);
startPoint = latlngUser ;

groupLayer.addLayer(markerUser);
creatPopup();
map.panTo(latlngUser);
console.log("marker of user is added");
findTheNearst(latlngUser);

}

function findTheNearst(latlangObject){


var latlang1= latlangObject;
if ( nearestMarker != null){
map.removeLayer(nearestMarker);
nearestMarker = null ;
}

if(latlngUser==0 && latlngSearch ==0){
alert("please, choose start point click on TROVA LA MIA POSIZIONE or search an address")
}
if( latlang1 != null){

var minDistance = Infinity;

$.getJSON("js/markers.geojson", function(markers) {
                var features = markers.features ;
                var minDistance = Infinity;
                var nearestLocation = 0 ;

for (var i=0;i<features.length;i++){
                    var latlngB = [features[i].geometry.coordinates[1],features[i].geometry.coordinates[0]] ;
                    var bestDistance= distance(map,latlang1,latlngB);


                    if (minDistance > bestDistance ){
                        minDistance = bestDistance;
                        nearestLocation = latlngB ;
                                                     }
                                                    }

                   nearestMarker = L.marker( nearestLocation ,{icon : redIcon})
                  .bindPopup("Here is the nearest post, click on marker for routing.").addTo(map);

                  console.log("Nearest location is added");
                  groupLayer.addLayer(nearestMarker);
                  creatPopup();

                  nearestMarker.openPopup();
                });




}}




function creatPopup(){
groupLayer.eachLayer(function(layer){
                        layer.on('click',bindPopupCostum);});

}
function bindPopupCostum(e){


    var popup = e.target.getPopup();
    var container = L.DomUtil.create('div'),
        address=L.DomUtil.create('p', '', container);

        destBtn = createButton('Go to this location', container);



    geocodeService.reverse().latlng(e.latlng).run(function (error, result) {
                                  if (error) {
                                    return;
                                  }
                                  address.innerHTML= result.address.Match_addr;
                                  address.style.fontWeight = 600 ;
                                  address.style.fontSize = "medium" ;
                                  address.style.color = "#292929";
                                  popup.setContent( container);
                                  popup.update();
                                  });


      L.DomEvent.on(destBtn, 'click', function() {

      if (startPoint != null){

        destPoint= e.latlng ;

         console.log("destination point is choose");
         map.closePopup();
        routing([startPoint,destPoint]);
      }
      else {
      alert( "click on MIA POSIZIONE o cerca un indirizio per determinare il punto di inizio.");
      }

    });






}

function routing(points){
if( routingControl != null){

map.removeControl(routingControl);
            routingControl = null;
}

routingControl = L.Routing.control({
summaryTemplate : '<h2 style ={"font-weight:700;}>{name}</h2><h3>{distance}, {time}</h3>' ,
pointMarkerStyle : {color: '#292929',radius: 7 ,fill: true, fillColor: 'yellow'},
collapsible : true,
containerClassName : 'routing_container',
itineraryClassName : 'itinerary',
    waypoints: points,
    routeWhileDragging: true,
    createMarker: function(i, wp, nWps) {
    if ( i === nWps - 1) {
        return L.marker(wp.latLng, {icon: redIcon  });
    } else {
        return L.marker(wp.latLng, {icon: greenIcon });
    }
},

                            lineOptions: {
                                           styles: [
                                                       {color: 'white', opacity: 0.9, weight: 9},
                                                       {color: '#FC8428', opacity: 1, weight: 3.5}
                                                                                                   ]
                                                                                                }
}).addTo(map);


}
document.getElementById("cancelRoutingtbtn").addEventListener("click", cancelRouting);

function  cancelRouting(){
if (routingControl != null)
{
//routingControl.setWaypoints([]);
//spliceWaypoints(0, 2)
map.removeControl( routingControl);

groupLayer.removeLayer(nearestMarker);
startPoint = null;
if(markerUser != null){
groupLayer.removeLayer(markerUser);
}
if(searchMarker != null){
groupLayer.removeLayer(searchMarker);
}
}
}
function createButton(label, container) {
    var btn = L.DomUtil.create('button', 'btn btn-outline-secondary container', container);
    btn.setAttribute('type', 'button');
    btn.innerHTML = label;
    return btn;
}
       // ---------------------------------------------------------------//
        // calcolare la distanza tra due punti.
function distance(map, latlngA, latlngB) {


                return map.latLngToLayerPoint(latlngA).distanceTo(map.latLngToLayerPoint(latlngB));
            }

function switchMap(){

if (currentMapLink == defaultmap){
currentMap.setUrl(Esri_WorldImagery);
currentMapLink = Esri_WorldImagery ;
$("#switchbtn").text(" DEFUALT MAP");
}
else if (currentMapLink == Esri_WorldImagery )
{ currentMap.setUrl(defaultmap);
currentMapLink = defaultmap;
$("#switchbtn").text(" SATELLIET MAP");


}

}



                });




