/*globals
jQuery, L, cartodb, geocities, allGreen, allBlue, altColors, Highcharts, science,
regionPromise, countyPromise: true
*/

(function($) {
  // Set the default highcharts separator
  Highcharts.setOptions({
      lang: {
          decimalPoint: '.',
          thousandsSep: ','
      }
  });


  $(function() {
    var mapbounds;
    var countyinfo = [{
      "Name": "Alameda",
      "Code": "ALA"
    }, {
      "Name": "Contra Costa",
      "Code": "CC"
    }, {
      "Name": "Marin",
      "Code": "MRN"
    }, {
      "Name": "Napa",
      "Code": "NAP"
    }, {
      "Name": "San Francisco",
      "Code": "SF"
    }, {
      "Name": "San Mateo",
      "Code": "SM"
    }, {
      "Name": "Santa Clara",
      "Code": "SCL"
    }, {
      "Name": "Solano",
      "Code": "SOL"
    }, {
      "Name": "Sonoma",
      "Code": "SON"
    }];
    var county_html;

    //CREATE MAP AND ADD BASEMAP LAYER for T1-T2-B
    var map = L.map('mapt17b', {
      center: [37.7833, -122.4167],
      zoom: 9,
      minZoom: 8,
      fullscreenControl: true
    });

    L.mapbox.accessToken = 'pk.eyJ1IjoicG9zdGNvZGUiLCJhIjoiWWdxRTB1TSJ9.phHjulna79QwlU-0FejOmw';
    var baseStreets = L.mapbox.tileLayer('postcode.kh28fdpk').addTo(map);

    // Add the legend
    var legendControl = new L.control({
      position: 'bottomright'
    });

    legendControl.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'info legend');
      $(div).addClass("col-lg-12");

      $(div).append("<h5>Highway pavement condition</h5>");
      // $(div).append("<p>Amount of buffer time needed on a trip</p>");

      var s = '';
      s += '<div class="legend-row"><div class="legend-color" style="background:#e60000;">&nbsp; </div><div class="legend-text">Distressed</div></div>';
      s += '<div class="legend-row"><div class="legend-color" style="background:#ffaa00;">&nbsp; </div><div class="legend-text">At Risk</div></div>';
      s += '<div class="legend-row"><div class="legend-color" style="background:#ffff00;">&nbsp; </div><div class="legend-text">No Minimum Service Life</div></div>';
      s += '<div class="legend-row"><div class="legend-color" style="background:#38a800;">&nbsp; </div><div class="legend-text">Good/Excellent</div></div>';
      $(div).append(s);

      $('.info.legend').html($(div).html());

      return div;
    };
    legendControl.addTo(map);


    // create an empty layer group to store the results and add it to the map
    var results = new L.LayerGroup().addTo(map);

    // listen for the results event and add every result to the map
    // searchControl.on("results", function(data) {
    //   results.clearLayers();
    //   for (var i = data.results.length - 1; i >= 0; i--) {
    //     results.addLayer(L.marker(data.results[i].latlng));
    //   };
    // });
    //End Geocoding

    //Set map bounds for the reload map button
    mapbounds = map.getBounds();

    // Add ArcGIS Online basemap
    // L.esri.basemapLayer("Gray").addTo(map);

    function mouseoverUpdate(e) {
      $("#infoPrompt").css("display", "none");
      $("#infoDiv").css("display", "block");
      $("#legendDiv").css("display", "block");

      var layer = e.target.feature.properties;
      console.log(layer);
      for (var i in countyinfo) {
        if (countyinfo[i].Code === layer.county) {
          county_html = countyinfo[i].Name;
        }
      }
      $("#Street_value").html(layer.caltrans_i);
      $("#From_value").html(county_html);
      $("#To_value").html(layer.type);

      var color;
      var text;
      var value;
      if (layer.condition === "Good/Excellent") {
        color = '#38a800';
        text = '#ffffff';
        value = 'Good/Excellent';
      } else if (layer.condition === "Distressed") {
        color = '#e60000';
        text = '#ffffff';
        value = 'Distressed';
      } else if (layer.condition === "Maintenance") {
        color = '#ffaa00';
        text = '#000000';
        value = 'At Risk';
      } else if (layer.condition === "No MSL") {
        color = '#ffff00';
        text = '#ffffff';
        value = 'No MSL';
      }
      $("#PCI_value").html(value);
      $("#PCI_value").css("background-color", color);
      $("#PCI_value").css("color", text);
      $("#pciLabel").css("color", text);

    }

    function clickUpdate(e) {
      $("#infoPrompt").css("display", "none");
      $("#infoDiv").css("display", "block");
      $("#legendDiv").css("display", "block");

      var layer = e.target.feature.properties;
      for (var i in countyinfo) {
        if (countyinfo[i].Code === layer.county) {
          county_html = countyinfo[i].Name;
        }
      }
      $("#Street_value").html(layer.caltrans_i);
      $("#From_value").html(county_html);
      $("#To_value").html(layer.type);

      var color;
      var text;
      var value;
      if (layer.condition === "Good/Excellent") {
        color = '#38a800';
        text = '#ffffff';
        value = 'Good/Excellent';
      } else if (layer.condition === "Distressed") {
        color = '#e60000';
        text = '#ffffff';
        value = 'Distressed';
      } else if (layer.condition === "Maintenance") {
        color = '#ffaa00';
        text = '#000000';
        value = 'At Risk';
      } else if (layer.condition === "No MSL") {
        color = '#ffff00';
        text = '#ffffff';
        value = 'No MSL';
      }
      $("#PCI_value").html(value);
      $("#PCI_value").css("background-color", color);
      $("#PCI_value").css("color", text);
      $("#pciLabel").css("color", text);
    }


    function onEachFeature(feature, layer) {
      layer.on({
        mouseover: mouseoverUpdate,
        click: clickUpdate
      })
    }

    function style(feature) {
      var color;
      if (feature.properties.condition === "Good/Excellent") {
        color = '#38a800';
      } else if (feature.properties.condition === "Distressed") {
        color = '#e60000';
      } else if (feature.properties.condition === "Maintenance") {
        color = '#ffaa00';
      } else if (feature.properties.condition === "No MSL") {
        color = '#ffff00';
      }

      return {
        opacity: 0,
        color: color
      };
    }

    //Feature layer for updating infopanel
    var streetsLayer = L.esri.featureLayer('http://gis.mtc.ca.gov/mtc/rest/services/VitalSigns/T17_Highway_Pavement_Condition/FeatureServer/0', {
      onEachFeature: onEachFeature,
      // fields: ['OBJECTID'],
      style: style
    }).addTo(map);


    //Tiled layer
    var streetsTiledLayer = L.esri.tiledMapLayer("http://54.213.139.235:6080/arcgis/rest/services/VitalSigns/T_17_HighwayPavementTiled/MapServer", {
      maxZoom: 15
    }).addTo(map);


    function reloadMap() {
      map.fitBounds(mapbounds);
    }

  })
})(jQuery);
