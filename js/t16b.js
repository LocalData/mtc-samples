(function($) {
  $(function() {
    var geojson;
    L.mapbox.accessToken = 'pk.eyJ1IjoicG9zdGNvZGUiLCJhIjoiWWdxRTB1TSJ9.phHjulna79QwlU-0FejOmw';
    // Replace 'examples.map-i87786ca' with your map id.

    var map = L.mapbox.map('map', undefined, {
        infoControl: true,
        attributionControl: false,
        maxZoom: 16
    });

    map.on({
        zoomend: manageLayers
    });
    map.addControl(L.mapbox.geocoderControl('mapbox.places-v1'));

    // var stamenLayer = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png', {
    //     attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
    //   }).addTo(map);
    // The visible tile layer
    var streetLayer = L.mapbox.tileLayer('postcode.kfgfmda1');

    var basemap = L.mapbox.tileLayer('postcode.kh28fdpk').addTo(map)

    // Load interactivity data into the map with a gridLayer
    var myGridLayer = L.mapbox.gridLayer('postcode.kfgfmda1');

    // And use that interactivity to drive a control the user can see.
    // var myGridControl = L.mapbox.gridControl(myGridLayer).addTo(map);

    myGridLayer.on('mouseover', function (evt) {
      if (evt.data) {
        $("#cityDiv").css("display", "none");
        // $("#legendDiv").css("display", "block");
        $("#infoDiv").css("display", "block");
        $("#legendDiv").css("display", "block");

        //console.log(layer.PCI);

        $("#Street_value").html(evt.data.RoadName);
        $("#From_value").html(evt.data.BegLocatio);
        $("#To_value").html(evt.data.EndLocatio);

        var color;
        var text;
        var value;
        if (evt.data.PCI <= 50) {
            color = '#A70C03';
            text = '#ffffff';
            value = 'Poor/Failed';
        } else if (evt.data.PCI > 50 && evt.data.PCI <= 59) {
            color = '#F01B0F';
            text = '#ffffff';
            value = 'At Risk';
        } else if (evt.data.PCI > 59 && evt.data.PCI <= 79) {
            color = '#00FF00';
            text = '#000000';
            value = 'Good/Fair';
        } else if (evt.data.PCI > 79) {
            color = '#398615';
            text = '#ffffff';
            value = 'Excellent/Very Good';
        }
        $("#PCI_value").html(value);
        $("#PCI_value").css("background-color", color);
        $("#PCI_value").css("color", text);
        $("#pciLabel").css("color", text);
      }
    });

    myGridLayer.on('click', function (evt) {
      if (evt.data) {
        $("#cityDiv").css("display", "none");
        // $("#legendDiv").css("display", "block");
        $("#infoDiv").css("display", "block");
        $("#legendDiv").css("display", "block");

        //console.log(layer.PCI);

        $("#Street_value").html(evt.data.RoadName);
        $("#From_value").html(evt.data.BegLocatio);
        $("#To_value").html(evt.data.EndLocatio);

        var color;
        var text;
        var value;
        if (evt.data.PCI <= 50) {
            color = '#A70C03';
            text = '#ffffff';
            value = 'Poor/Failed';
        } else if (evt.data.PCI > 50 && evt.data.PCI <= 59) {
            color = '#F01B0F';
            text = '#ffffff';
            value = 'At Risk';
        } else if (evt.data.PCI > 59 && evt.data.PCI <= 79) {
            color = '#00FF00';
            text = '#000000';
            value = 'Good/Fair';
        } else if (evt.data.PCI > 79) {
            color = '#398615';
            text = '#ffffff';
            value = 'Excellent/Very Good';
        }
        $("#PCI_value").html(value);
        $("#PCI_value").css("background-color", color);
        $("#PCI_value").css("color", text);
        $("#pciLabel").css("color", text);
      }
    });

    map.setView([37.7833, -122.4167], 10)


    function getColort7a(d) {
      return d > 100 ? '#398615' :
          d > 79 ? '#,00FF00' :
          d > 59 ? '#00FF00' :
          d > 50 ? '#F01B0F' :
          '#A70C03';
    }

    //Add City styling based on 3yr pci average
    function stylet7a(feature) {
      return {
          fillColor: getColort7a(feature.properties.F3YrAverage),
          weight: 2,
          opacity: 1,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.7
      };
    }

   //ADD City Layer
          var citylayer = L.esri.featureLayer('http://54.213.139.235:6080/arcgis/rest/services/VitalSigns/PCI_Cities/FeatureServer/0', {
              simplifyFactor: 0.75,
              onEachFeature: function (feature, layer) {
                  citysearchdata.push({
                      name: layer.feature.properties.NAME,
                      source: "Cities",
                      bounds: layer.getBounds()
                  });
                  layer.on({
                      click: function (e) {
                          map.fitBounds(layer.getBounds());
                      }

                  });
                  layer.on({
                      mouseover: function (e) {
                          $("#cityDiv").css("display", "block");
                          $("#citypciInfoDiv").css("display", "block");
                          // $("#legendDiv").css("display", "block");
                          $("#infoDiv").css("display", "none");
                          $("#legendDiv").css("display", "none");
                          if (layer.feature.properties.F3YrAverage) {
                              var color;
                              var text;
                              if (layer.feature.properties.F3YrAverage <= 50) {
                                  color = "#A70C03";
                                  text = "#fff";
                              } else if (feature.properties.F3YrAverage > 50 && feature.properties.F3YrAverage <= 59) {
                                  color = '#F01B0F';
                                  text = "#fff";
                              } else if (feature.properties.F3YrAverage > 59 && feature.properties.F3YrAverage <= 79) {
                                  color = '#00FF00';
                                  text = "#000";
                              } else if (feature.properties.F3YrAverage > 79) {

                                  color = '#398615';
                                  text = "#fff";

                              }
                              $("#City_Value").html(layer.feature.properties.F3YrAverage);
                              $("#City_Name").html(layer.feature.properties.NAME);
                              $("#City_Value").css("background-color", color);
                              $("#City_Value").css("color", text);
                              $("#pciCityLabel").css("color", text);
                          }
                      }
                  });

              },
              style: function (feature) {
                  if (feature.properties.F3YrAverage <= 50) {
                      return {
                          color: '#A70C03',
                          weight: 2
                      };
                  } else if (feature.properties.F3YrAverage > 50 && feature.properties.F3YrAverage <= 59) {
                      return {
                          color: '#F01B0F',
                          weight: 2
                      };
                  } else if (feature.properties.F3YrAverage > 59 && feature.properties.F3YrAverage <= 79) {
                      return {
                          color: '#00FF00',
                          weight: 2,
                          opacity: 1
                      };
                  } else if (feature.properties.F3YrAverage > 79) {
                      return {
                          color: '#398615',
                          weight: 2
                      };
                  }
              }
          });

         //  ADD Street Query Layer
           query = L.esri.Tasks.query({ url: 'http://54.213.139.235:6080/arcgis/rest/services/VitalSigns/PCI_Local_Sttreets/FeatureServer/0' });

         // Add City query and convert cities to geojson
          queryCities = L.esri.Tasks.query({ url: 'http://54.213.139.235:6080/arcgis/rest/services/VitalSigns/PCI_Cities/FeatureServer/0' });
          queryCities.where("1=1");

          queryCities.run(function(error, featureCollection, response){
      //alert('Found ' + featureCollection.features.length + ' features');
        geojson  = L.geoJson(featureCollection, {
        onEachFeature: onEachFeature,
        style:stylet7a}).addTo(map);
      });



  //Add zoom to feature on city click
      function onEachFeature(feature, layer)
      {
          //console.log("oneachfeature");
          layer.on({
                  click: function (e) {
                      map.fitBounds(layer.getBounds());
                  }

              });
           layer.on({
                  mouseover: function (e) {
                     // console.log(e);
                      $("#cityDiv").css("display", "block");
                      $("#citypciInfoDiv").css("display", "block");
                      // $("#legendDiv").css("display", "block");
                      $("#infoDiv").css("display", "none");
                      $("#legendDiv").css("display", "none");
                      if (layer.feature.properties.F3YrAverage) {
                          var color;
                          var text;
                          if (layer.feature.properties.F3YrAverage <= 50) {
                              color = "#A70C03";
                              text = "#fff";
                          } else if (feature.properties.F3YrAverage > 50 && feature.properties.F3YrAverage <= 59) {
                              color = '#F01B0F';
                              text = "#fff";
                          } else if (feature.properties.F3YrAverage > 59 && feature.properties.F3YrAverage <= 79) {
                              color = '#00FF00';
                              text = "#000";
                          } else if (feature.properties.F3YrAverage > 79) {

                              color = '#398615';
                              text = "#fff";

                          }
                          $("#City_Value").html(layer.feature.properties.F3YrAverage);
                          $("#City_Name").html(layer.feature.properties.NAME);
                          $("#City_Value").css("background-color", color);
                          $("#City_Value").css("color", text);
                          $("#pciCityLabel").css("color", text);
                      }
                  }

              });
      }

    function manageLayers() {
      var zoomLevel = map.getZoom();
      if (zoomLevel >= 12) {
        map.removeLayer(geojson);
        streetLayer.addTo(map);
        myGridLayer.addTo(map);
     } else {
      if (geojson) {
        map.removeLayer(streetLayer);
        map.removeLayer(myGridLayer);
        map.addLayer(geojson);
       }
     }
    }

  })
})(jQuery);
