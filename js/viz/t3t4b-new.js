 (function($, Promise, L, _) {
    var currentVariable = "OverallTime_Est"
    var homeWork = "home"
    var countyData, countyDataWork, cityData, cityDataWork, tractData, regionData

    var variables = [
      'OverallTime_Est',
      'DATime_Est',
      'CPTime_Est',
      'PTTime_Est'
      ];

    var variablesWork = [
      'Workers_Est',
      'DAWorkers_Est',
      'CPWorkers_Est',
      'PTWorkers_Est'
      ];

    var ranges = {};
    var rangesWork = {};

    var hues = [
        '#bdd7e7',
        '#6baed6',
        '#3182bd',
        '#08519c'
        ];

    function get(url) {
      return Promise.resolve($.ajax({
        dataType: 'json',
        url: url
      }));
    }

  $(function(){
    var variablesObj = {
      'OverallTime_Est': {title: 'Overall Commute Time', hues: allGreen},
      'DATime_Est': {title: 'Single Driver Commute', hues: allRed},
      'CPTime_Est': {title: 'Carpool Commute Time', hues: allOrange},
      'PTTime_Est': {title: 'Transit Commute Time', hues: allBlue },
      'Workers_Est': {title: 'Overall Commute Time', hues: allGreen},
      'DAWorkers_Est': {title: 'Single Driver Commute', hues: allRed},
      'CPWorkers_Est': {title: 'Carpool Commute Time', hues: allOrange},
      'PTWorkers_Est': {title: 'Transit Commute Time', hues: allBlue }
    }

    for (var i = 0; i < variables.length; i++) {
      ranges[variables[i]] = {};
    }

    L.mapbox.accessToken = 'pk.eyJ1IjoicG9zdGNvZGUiLCJhIjoiWWdxRTB1TSJ9.phHjulna79QwlU-0FejOmw';

    var map = L.mapbox.map('map', undefined, {
        infoControl: true,
        attributionControl: false
    });
   map.on('load', function() {
    countyLayer.setFilter(function() { return true; })
  })

    var legendControl = new L.mapbox.legendControl();
    L.control.scale().addTo(map);

    legendControl.onAdd = function (map) {
          var div = L.DomUtil.create('div', 'info legend')
          $(div).addClass("col-lg-12")
          $(div).append("<h5>Drive Alone Percentage</h5>")
            return div;
        }
        legendControl.addTo(map);

    var basemap = L.mapbox.tileLayer('postcode.kh28fdpk').addTo(map)
    // The visible tile layer

    var flatCities = flatten(geocities);
    var cityLayer = L.mapbox.featureLayer(flatCities)
        .on('mouseover', function() {

        })
        .on('click', function(e) {
          barChart(cityData, "Year", variables, e.layer.feature.properties["City"], "T3-T4-B-chart", 2013, "City", e.layer.feature.properties["City"] )
         })
        .addTo(map);

    var cityLayerWork = L.mapbox.featureLayer(flatCities)
        .on('mouseover', function() {

        })
        .on('click', function(e) {
          barChart(cityDataWork, "Year", variables, e.layer.feature.properties["City"], "T3-T4-B-chart", 2013, "City", e.layer.feature.properties["City"] )
         })
        .addTo(map);

    var flatCounties = flatten(geocounties);

    var countyLayer = L.mapbox.featureLayer(flatCounties)
        .on('mouseover', function(e) {
        })
        .on('click', function(e) {
        barChart(countyData, "Year", variables, e.layer.feature.properties["County"] + " County", "T3-T4-B-chart", 2013, "County", e.layer.feature.properties["County"] )
        })
        .addTo(map);


     var countyLayerWork = L.mapbox.featureLayer(flatCounties)
        .on('mouseover', function(e) {
        })
        .on('click', function(e) {
        barChart(countyDataWork, "Year", variables, e.layer.feature.properties["County"] + " County", "T3-T4-B-chart", 2013, "County", e.layer.feature.properties["County"] )
        })
        .addTo(map);

    var flatTracts = flatten(tracts)
    var tractLayer = L.mapbox.featureLayer(flatTracts)
        .on('click', function(e) {
          barChart(tractData, "Year", variables, "Tract " + e.layer.feature.properties["Id2"], "T3-T4-B-chart", 2013, "Id2", e.layer.feature.properties["Id2"] )
        })
        .addTo(map);

    Promise.join(
      get('http://vitalsigns-production.elasticbeanstalk.com/t3t4/cities'),
      get('http://vitalsigns-production.elasticbeanstalk.com/t3t4/t4/cities'),
      get('http://vitalsigns-production.elasticbeanstalk.com/t3t4/counties'),
      get('http://vitalsigns-production.elasticbeanstalk.com/t3t4/t4/counties'),
      get('http://vitalsigns-production.elasticbeanstalk.com/t3t4/tracts'),
      get('http://vitalsigns-production.elasticbeanstalk.com/t3t4/region'),
      function (city, cityWork, county, countyWork, tract, region) {
        joinData(city, cityLayer, "City", "2013");
        cityData = city;
        joinData(cityWork, cityLayerWork, "City", "2013");
        cityDataWork = cityWork;
        joinData(county, countyLayer, "County", "2013");
        countyData = county;
        joinData(countyWork, countyLayerWork, "County", "2013");
        countyDataWork = countyWork;
        joinData(tract, tractLayer, "Id2", "2013");
        tractData = tract;
        regionData = region;
      }
    ).then(function () {

      barChart(regionData, "Year", variables, "Region", "T3-T4-B-chart", 2013, "Region", "Bay Area" )

      map.setView([37.7833, -122.4167], 9)

      map.on('viewreset', function() {
        if ((map.getZoom() === 10 || map.getZoom() === 11 || map.getZoom() === 12)) {
          if(homeWork == "home") {
            cityLayer.setFilter(function() { return true; })
            cityLayerWork.setFilter(function() { return false; })
            setVariable(currentVariable, cityLayer);
            sortTopTen(cityData, currentVariable);
            sortBottomFive(cityData, currentVariable);
          } else {
            cityLayerWork.setFilter(function() { return true; })
            cityLayer.setFilter(function() { return false; })
            setVariable(currentVariable, cityLayerWork);
            sortTopTen(cityDataWork, currentVariable);
            sortBottomFive(cityDataWork, currentVariable);
          }
          tractLayer.setFilter(function() { return false; })
          countyLayer.setFilter(function() { return false; })
          countyLayerWork.setFilter(function() { return false; })
        } else if (map.getZoom() >= 13) {
          tractLayer.setFilter(function() { return true; })
          setVariable(currentVariable, tractLayer);
          countyLayer.setFilter(function() { return false; })
          cityLayer.setFilter(function() { return false; })
          cityLayerWork.setFilter(function() { return false; })
          sortTopTen(cityData, currentVariable);
          sortBottomFive(cityData, currentVariable);
        } else {
          if(homeWork == "home") {
            countyLayer.setFilter(function() { return true; })
            countyLayerWork.setFilter(function() { return false; })
            setVariable(currentVariable, countyLayer);
            tractLayer.setFilter(function() { return false; })
            cityLayer.setFilter(function() { return false; })
            cityLayerWork.setFilter(function() { return false; })
            sortTopTen(cityData, currentVariable);
            sortBottomFive(cityData, currentVariable);
          } else {
            countyLayer.setFilter(function() { return false; })
            countyLayerWork.setFilter(function() { return true; })
            setVariable(currentVariable, countyLayerWork);
            tractLayer.setFilter(function() { return false; })
            cityLayer.setFilter(function() { return false; })
            cityLayerWork.setFilter(function() { return false; })
            sortTopTen(cityDataWork, currentVariable);
            sortBottomFive(cityDataWork, currentVariable);
          }
        }
      });

      $("#overallButton").click(function() {
        zoomFilter("OverallTime_Est")
        $(this).addClass("active")
        $(this).siblings('a.button-mode').removeClass('active');
      });

      $("#autoButton").click(function() {
        zoomFilter("DATime_Est")
        $(this).addClass("active")
        $(this).siblings('a.button-mode').removeClass('active');
        });

      $("#carpoolButton").click(function() {
        zoomFilter("CPTime_Est")
        $(this).addClass("active")
        $(this).siblings('a.button-mode').removeClass('active');
      });

      $("#transitButton").click(function() {
        zoomFilter("PTTime_Est")
        $(this).addClass("active")
        $(this).siblings('a.button-mode').removeClass('active');
      });

      $("#homeButton").click(function() {
        $(this).addClass("active")
        $("#workButton ").removeClass("active")
        homeWork = "home"
        zoomFilter(currentVariable)
      });

      $("#workButton").click(function() {
        $(this).addClass("active")
        $("#homeButton ").removeClass("active")
        homeWork = "work"
        zoomFilter(currentVariable)
      });

      // Kick things off
      zoomFilter("OverallTime_Est")
      $('#overallButton').addClass("active")
    });

  function loadData(url, geoLayer, nameField, year) {
    $.getJSON(url)
      .done(function(data) {
          joinData(data, geoLayer, nameField, year);
      });
    }

    function joinData(data, layer, nameField, year) {
      var modes = [],
          name,
          newLayer = layer.toGeoJSON(),
          byName = {};

      for (var i = 0; i < newLayer.features.length; i++) {
          name = newLayer.features[i].properties.NAME;
          // We can have multiple features with the same name, since we have
          // flattened multi-geometries into separate features.
          var set = byName[name];
          if (!set) {
            byName[name] = [newLayer.features[i]];
          } else {
            set.push(newLayer.features[i]);
          }
      }

      modes = variables

      for (var j = 0; j < modes.length; j++) {
        var n = modes[j];
        var breaks = getRange(data, n)
        $.each(breaks, function(i, b) {
          ranges[n][i] = b;
        })
      }
      for (i = 0; i < data.length; i++) {
          name = data[i][nameField];
          if (name && (data[i].Year == year) && byName[name]) {
              byName[name].map(function (feature) {
                feature.properties = data[i];
              });
          }
      }

      var newFeatures = _(byName).values().flatten().value();

      layer.setGeoJSON(newFeatures);
      setVariable(currentVariable, layer);
    }

    function setVariable(name, dataLayer) {
      currentVariable = name
      var scale = [];
      $.each(ranges[name], function(i, range){
        scale.push(range)
      })
      changeLegend(scale, name, hues)
      dataLayer.eachLayer(function(layer) {
        var q
        if (layer.feature.properties[name] > ranges[name][2]) {
          q = 3
        } else if(layer.feature.properties[name] > ranges[name][1]) {
          q = 2
        } else if(layer.feature.properties[name] > ranges[name][0]) {
          q = 1
        } else if(layer.feature.properties[name] < ranges[name][0]) {
          q = 0
        } else {
          q = -1
        }
        if(q > -1) {
          layer.setStyle({
              fillColor: variablesObj[name].hues[q],
              fillOpacity: 0.8,
              weight: 0.5
          });
        } else {
          layer.setStyle({
            fillColor: '#ffffff',
            fillOpacity: 0,
            weight: 0
        })
        }
      });
    }

    function zoomFilter(mode) {
      if ((map.getZoom() === 10 || map.getZoom() === 11 || map.getZoom() === 12)) {
        if(homeWork == "home") {
          cityLayer.setFilter(function() { return true; })
          cityLayerWork.setFilter(function() { return false; })
          setVariable(mode, cityLayer);
          sortTopTen(cityData, mode);
          sortBottomFive(cityData, mode);
        } else {
          cityLayerWork.setFilter(function() { return true; })
          cityLayer.setFilter(function() { return false; })
          setVariable(mode, cityLayerWork);
          sortTopTen(cityDataWork, mode);
          sortBottomFive(cityDataWork, mode);
        }
        tractLayer.setFilter(function() { return false; })
        countyLayer.setFilter(function() { return false; })
        countyLayerWork.setFilter(function() { return false; })
      } else if (map.getZoom() >= 13) {
        tractLayer.setFilter(function() { return true; })
        setVariable(mode, tractLayer);
        countyLayer.setFilter(function() { return false; })
        cityLayer.setFilter(function() { return false; })
        cityLayerWork.setFilter(function() { return false; })
        sortTopTen(cityData, mode);
        sortBottomFive(cityData, mode);
      } else {
        if(homeWork == "home") {
          countyLayer.setFilter(function() { return true; })
          countyLayerWork.setFilter(function() { return false; })
          setVariable(mode, countyLayer);
          tractLayer.setFilter(function() { return false; })
          cityLayer.setFilter(function() { return false; })
          cityLayerWork.setFilter(function() { return false; })
          sortTopTen(cityData, mode);
          sortBottomFive(cityData, mode);
        } else {
          countyLayer.setFilter(function() { return false; })
          countyLayerWork.setFilter(function() { return true; })
          setVariable(mode, countyLayerWork);
          tractLayer.setFilter(function() { return false; })
          cityLayer.setFilter(function() { return false; })
          cityLayerWork.setFilter(function() { return false; })
          sortTopTen(cityDataWork, mode);
          sortBottomFive(cityDataWork, mode);
        }
      }
    }

    function sortTopTen(data, mode) {
      var sortList = []
      var bottom = []
      var sortData =[]
      $.each(data, function(index, value) {
        if(value[mode] !== null) {
          sortData[index] = []
          sortData[index][mode] = []
          sortData[index]["City"] = []
          sortData[index][mode].push(value[mode])
          sortData[index]["City"].push(value.City)
         }
      })
        var sorted = sortData.sort(function (a, b) {
        return b[mode] - a[mode];
      })

       var topTenText = "<div class='col-lg-6'><h4>Top Cities for " + variablesObj[mode].title + "</h4>"
        $.each(sorted.slice(0, 5), function(key, v) {
            topTenText += "<h6>" + (key *1 +1) + ". " + v.City + ": " + (Math.round(v[mode]*100)/100).toFixed(1) + " min</h6>"
        })
        topTenText += "</div>"
        $("#T3-T4-B-chart3").html(topTenText);
    }

    function sortBottomFive(data, mode) {
      var sortList = []
      var bottom = []
      var sortData =[]
      $.each(data, function(index, value) {
        if(value[mode] !== null) {
          sortData[index] = []
          sortData[index][mode] = []
          sortData[index]["City"] = []
          sortData[index][mode].push(value[mode])
          sortData[index]["City"].push(value.City)
         }
      })

        var sortedBottom = sortData.sort(function (a, b) {
        return a[mode] - b[mode];
      })

        var bottomFiveText = "<div class='col-lg-6'><h4>Bottom Cities for " + variablesObj[mode].title + "</h4>"
        $.each(sortedBottom.slice(0, 5), function(k, value) {
            bottomFiveText += "<h6>" + (k *1 +1) + ". " + value.City + ": " + (Math.round(value[mode]*100)/100).toFixed(1) + " min</h6>"
        })
        bottomFiveText += "</div>"
          $("#T3-T4-B-chart3").append(bottomFiveText);
    }

    function changeLegend(quantiles, title, hues) {
      var div = $('.info.legend')
      $(div).empty()
      $(div).addClass("col-lg-12")
      $(div).append("<h5>"+variablesObj[title].title+"</h5>")
      quantiles.unshift(1)
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < quantiles.length; i++) {
          $(div).append('<div><div class="col-lg-1" style="background:' + variablesObj[title].hues[i] + ';">&nbsp; </div><div class="col-lg-8">' +
            Math.round(quantiles[i]*100)/100 + (Math.round(quantiles[i + 1]*100)/100 ? '&ndash;' + Math.round(quantiles[i + 1]*100)/100 + '</div>' : '+'));
        }
    }
  })


function getRange(data, value) {
  var range = []
  $.each(data, function(key, v) {
    if(v[value] != null) {
      range.push(v[value])
    }
  })
  var breaks = science.stats.quantiles(range, [0, .25, .50, .75])
  return breaks
}


function barChart(data, seriesName, seriesData, title, container, year, searchValue, searchTerm) {
    // Get the CSV and create the chart
    var options = {
          chart: {
              renderTo: container,
              defaultSeriesType: 'bar'
              },

          series: [{
              name: 'val1',
              data: []
     }],
     exporting: {
         enabled: true
    },
    legend: {
        enabled: false
    },
    yAxis: {
      title: {
        text: 'Minutes'
      }
     },
     xAxis: {
          categories: []
      },

          title: {
              text: ''
          },

          tooltip: {
              shared: true,
              crosshairs: false,
              pointFormat: '<b>{point.y:.1f} minutes</b>'
          }
      }
    yaxis = [];
    dataArray = []
    jQuery.each(seriesData, function(key, name) {
      jQuery.each(data, function(i,value) {
        if(value[searchValue] === searchTerm && value.Year === 2013) {
            dataArray.push(value[name]);
        }
      });
      switch(name) {
        case "DATime_Est":
          yaxis.push("Drive Alone");
          break;
        case "CPTime_Est":
          yaxis.push("Carpool");
          break;
        case "PTTime_Est":
          yaxis.push("Transit");
          break;
        case "OverallTime_Est":
          yaxis.push("Overall");
          break;
        }
    })
    options.series[0].data = dataArray;
    options.series[0].name = "Time";
    options.xAxis.categories = yaxis
    options.xAxis.title = "Time"
    options.title.text = title
    chart = new Highcharts.Chart(options);
}

function flatten(gj, up) {
    switch ((gj && gj.type) || null) {
        case 'FeatureCollection':
            gj.features = gj.features.reduce(function(mem, feature) {
                return mem.concat(flatten(feature));
            }, []);
            return gj;
        case 'Feature':
            return flatten(gj.geometry).map(function(geom) {
                return {
                    type: 'Feature',
                    properties: JSON.parse(JSON.stringify(gj.properties)),
                    geometry: geom
                };
            });
        case 'MultiPoint':
            return gj.coordinates.map(function(_) {
                return { type: 'Point', coordinates: _ };
            });
        case 'MultiPolygon':
            return gj.coordinates.map(function(_) {
                return { type: 'Polygon', coordinates: _ };
            });
        case 'MultiLineString':
            return gj.coordinates.map(function(_) {
                return { type: 'LineString', coordinates: _ };
            });
        case 'GeometryCollection':
            return gj.geometries;
        case 'Point':
        case 'Polygon':
        case 'LineString':
            return [gj];
        default:
            return gj;
    }
}
})(window.jQuery, window.Promise, window.L, window._);
