/*globals jQuery, L, cartodb, geocities, econColors, altColors, Highcharts, science: true */


(function($) {
    var GEO_KEY = 'Jurisdiction';
    var FOCUS_KEY = '3YRAverage';
    var PCI_KEY = 'PCI_Catego';
    var PCI_COLORS = {
      'Poor/Failed': {
        color: '#A70C03',
        textColor: '#ffffff'
      },
      'At Risk': {
        color: '#F01B0F',
        textColor: '#ffffff'
      },
      'Good/Fair': {
        color: '#00FF00',
        textColor: '#000000'
      },
      'Excellent/Very Good': {
        color: '#398615',
        textColor: '#ffffff'
      }
    };

    var cityLayer;
    L.mapbox.accessToken = 'pk.eyJ1IjoicG9zdGNvZGUiLCJhIjoiWWdxRTB1TSJ9.phHjulna79QwlU-0FejOmw';

    var map = L.mapbox.map('map', undefined, {
        infoControl: true,
        attributionControl: false,
        maxZoom: 16
    });

    // The visible tile layer
    var streetLayer = L.mapbox.tileLayer('postcode.mdgeh8i5');
    var basemap = L.mapbox.tileLayer('postcode.kh28fdpk').addTo(map); //

    // Load interactivity data into the map with a gridLayer
    var gridLayer = L.mapbox.gridLayer('postcode.mdgeh8i5'); //postcode.kfgfmda1

    function manageLayers() {
      var zoomLevel = map.getZoom();
      if (zoomLevel >= 12) {
        $('.zoom-in-prompt').hide();
        map.removeLayer(cityLayer);
        streetLayer.addTo(map);
        gridLayer.addTo(map);
     } else {
      if (cityLayer) {
        $('.zoom-in-prompt').show();
        map.removeLayer(streetLayer);
        map.removeLayer(gridLayer);
        map.addLayer(cityLayer);
       }
     }
    }

    $('#map').append('<div class="zoom-in-prompt"><div>Zoom in to see individual street segments</div></div>');

    map.on({
        zoomend: manageLayers
    });
    map.addControl(L.mapbox.geocoderControl('mapbox.places-v1'));
    map.setView([37.7833, -122.4167], 10);

    function interaction(event) {
      if (event.data) {
        $("#cityDiv").css("display", "none");
        // $("#legendDiv").css("display", "block");
        $("#infoDiv").css("display", "block");
        $("#legendDiv").css("display", "block");

        $("#Street_value").html(event.data.RoadName);
        $("#From_value").html(event.data.BegLocatio);
        $("#To_value").html(event.data.EndLocatio);

        var text = event.data[PCI_KEY];
        var color = PCI_COLORS[text].color;
        var textColor = PCI_COLORS[text].textColor;

        $("#PCI_value").html(text);
        $("#PCI_value").css("background-color", color);
        $("#PCI_value").css("color", textColor);
        $("#pciLabel").css("color", textColor);
      }
    }

    gridLayer.on('mouseover', interaction);
    gridLayer.on('click', interaction);

    // Add city layer
    function setupFeatures(data) {
        var latestYear = _.max(data, 'Year').Year;
        var latestData = _.filter(data, { 'Year': latestYear });
        var cityData = _.groupBy(latestData, GEO_KEY);

        function getColor(d) {
          return d > 100 ? '#398615' :
              d > 79 ? '#398615' :
              d > 59 ? '#00FF00' :
              d > 50 ? '#F01B0F' :
              '#A70C03';
        }

        //Add City styling based on 3yr pci average
        function style(feature) {
            var cityStyle = {
                fillColor: 'white',
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            };

            var data = cityData[feature.properties.NAME];
            if (data === undefined) {
                cityStyle.opacity = 0;
                cityStyle.weight = 0;
                return cityStyle;
            }
            data = data[0];

            feature.properties[FOCUS_KEY] = data[FOCUS_KEY];
            feature.properties[PCI_KEY] = data[PCI_KEY];

            cityStyle.fillColor = getColor(data[FOCUS_KEY]);
            return cityStyle;
        }

        //Add zoom to feature on city click
        function onEachFeature(feature, layer) {
            layer.on({
                click: function (e) {
                  map.fitBounds(layer.getBounds());
                },

                mouseover: function (e) {
                    $("#cityDiv").css("display", "block");
                    $("#citypciInfoDiv").css("display", "block");
                    // $("#legendDiv").css("display", "block");
                    $("#infoDiv").css("display", "none");
                    $("#legendDiv").css("display", "none");

                    if (layer.feature.properties[FOCUS_KEY]) {
                        var color;
                        var text;
                        if (layer.feature.properties[FOCUS_KEY] <= 50) {
                            color = "#A70C03";
                            text = "#fff";
                        } else if (feature.properties[FOCUS_KEY] > 50 && feature.properties[FOCUS_KEY] <= 59) {
                            color = '#F01B0F';
                            text = "#fff";
                        } else if (feature.properties[FOCUS_KEY] > 59 && feature.properties[FOCUS_KEY] <= 79) {
                            color = '#00FF00';
                            text = "#000";
                        } else if (feature.properties[FOCUS_KEY] > 79) {
                            color = '#398615';
                            text = "#fff";
                        }
                        $("#City_Value").html(layer.feature.properties[FOCUS_KEY]);
                        $("#City_Name").html(layer.feature.properties.NAME);
                        $("#City_Value").css("background-color", color);
                        $("#City_Value").css("color", text);
                        $("#pciCityLabel").css("color", text);
                    }
                }
            });
        }

        cityLayer = L.geoJson(geocities, {
          onEachFeature: onEachFeature,
          style: style
        }).addTo(map);
    }

    $.ajax({
      dataType: "json",
      url: "http://vitalsigns-production.elasticbeanstalk.com/t16/city",
      success: setupFeatures
    });

})(jQuery);
