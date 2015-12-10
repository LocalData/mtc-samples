(function($) {
  $(function() {
    // Set the default highcharts separator
    Highcharts.setOptions({
        lang: {
            decimalPoint: '.',
            thousandsSep: ','
        }
    });

    L.mapbox.accessToken = 'pk.eyJ1IjoicG9zdGNvZGUiLCJhIjoiWWdxRTB1TSJ9.phHjulna79QwlU-0FejOmw';

    var map = L.mapbox.map('map', undefined, {
        infoControl: true,
        attributionControl: false
    });
    map.addControl(L.mapbox.geocoderControl('mapbox.places-v1'));
    map.legendControl.addLegend(document.getElementById('legend').innerHTML);

    var baseStreets = L.mapbox.tileLayer('postcode.kh28fdpk').addTo(map)
    var bridgeLayer = L.mapbox.tileLayer('postcode.kk0d3i25').addTo(map);

    // Load interactivity data into the map with a gridLayer
    var myGridLayer = L.mapbox.gridLayer('postcode.kk0d3i25').addTo(map);

    myGridLayer.on('mouseover', function (evt) {
      if (evt.data) {
        $("#infoDiv").css("display", "block");
        $("#location").html("<h4>"+evt.data.FACILITY_C+"</h4>");
        if(evt.data.STATUS == 1) {
          $("#status").html("Structurally Deficient");
        } else {
          $("#status").html("Structurally Sound");
        }
      }
    });

    myGridLayer.on('click', function (evt) {
      if (evt.data) {
        $("#infoDiv").css("display", "block");
        $("#location").html("<h4>"+evt.data.FACILITY_C+"</h4>");
        if(evt.data.STATUS == 1) {
          $("#status").html("Structurally Deficient");
        } else {
          $("#status").html("Structurally Sound");
        }
      }
    });
    map.setView([37.7833, -122.4167], 10)
    $('.map-legend').addClass("leaflet-control")
  })
})(jQuery);
