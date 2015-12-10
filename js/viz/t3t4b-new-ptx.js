 /* globals Highcharts, science,
    allRed, allOrange, allBlue, allGreen */
 (function($, Promise, L, _) {
    var currentVariable = "OverallTime_Est"
    var homeWork = "home"
    var cityData, cityDataWork, tractData, regionData

    // Set the default highcharts separator
    Highcharts.setOptions({
        lang: {
            decimalPoint: '.',
            thousandsSep: ','
        }
    });

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

    // TODO: If each range is an object indexed by a number, and if those
    // numbers are sequential integers starting with zero, then we should
    // probably just use an array.
    for (var i = 0; i < variables.length; i++) {
      ranges[variables[i]] = {};
    }

    function makeMapFullScreen(event) {
        event.preventDefault();
        $('.make-map-fullscreen').hide();
        $('.reduce-map-size').show();
        var center = map.getCenter();

        var $container = $('#map');
        $container.toggleClass('fullscreen-map-container');

        // Move the legend
        $('.info.legend').show();
        $('#map .info.legend').hide();

        // Calculate thew new offset
        var offset = $('#map').offset();
        var leftOffset = offset.left;

        // Get any existing left offset
        var left = $container.css('left');
        left = _.trim(left, 'px');
        left = parseInt(left, 10);
        console.log('left', left);
        if (left) {
            console.log("We need add subtract", left);
            leftOffset -= left;
        }

        // Set the new offiset
        $container.css('left', '-' + leftOffset + 'px');

        // Set the new width
        var fullWidth = window.innerWidth - 30;
        $container.width(fullWidth);

        console.log("Resizing?", offset, leftOffset, fullWidth);

        // Resize the map if the window resizes
        window.addEventListener('resize', makeMapFullScreen);
        map._onResize();

        map.panTo(center);
        console.log("Panned to ", center);
    }

    function disableFullScreen(event) {
        event.preventDefault();
        $('.make-map-fullscreen').show();
        $('.reduce-map-size').hide();

        var center = map.getCenter();

        // Move the legend
        $('.info.legend').hide();
        $('#map .info.legend').show();

        window.removeEventListener('resize', makeMapFullScreen);

        var $container = $('#map');
        $container.removeClass('fullscreen-map-container');
        $container.css('left', 'auto');
        $container.css('width', '100%');

        map._onResize();
        map.panTo(center);
        console.log("Panned to ", center);
    }

    L.mapbox.accessToken = 'pk.eyJ1IjoicG9zdGNvZGUiLCJhIjoiWWdxRTB1TSJ9.phHjulna79QwlU-0FejOmw';

    var map = L.mapbox.map('map', undefined, {
        infoControl: true,
        attributionControl: false,
        scrollWheelZoom: false
    });
   map.on('load', function() {
    cityLayer.setFilter(function() { return true; })
  })

    var legendControl = L.mapbox.legendControl();
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

    // Initiate the data requests early, so we can do some geodata processing
    // while we wait on the responses.
    var cityHomePromise = get('http://vitalsigns-production.elasticbeanstalk.com/t3t4/cities');
    var cityWorkPromise = get('http://vitalsigns-production.elasticbeanstalk.com/t3t4/t4/cities');
    var tractPromise = get('http://vitalsigns-production.elasticbeanstalk.com/t3t4/tracts');
    var regionPromise = get('http://vitalsigns-production.elasticbeanstalk.com/t3t4/region');

    var flatCities = flatten(window.geocities);
    // We don't need a reference to the original city GeoJSON.
    window.geocities = undefined;

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

    var flatTracts = flatten(window.tracts)
    // We don't need a reference to the original tract GeoJSON.
    window.tracts = undefined;
    var tractLayer = L.mapbox.featureLayer(flatTracts)
        .on('click', function(e) {
          barChart(tractData, "Year", variables, "Tract " + e.layer.feature.properties["Id2"], "T3-T4-B-chart", 2013, "Id2", e.layer.feature.properties["Id2"] )
        })
        .addTo(map);

    // As the remote data comes in, we can join it to the geodata.
    cityHomePromise = cityHomePromise.then(function (home) {
      joinData(home, cityLayer, "City", "2013");
      cityData = home;
    });
    cityWorkPromise = cityWorkPromise.then(function (work) {
      // For overall, city-level, to-work data, we should use the
      // OverallTime_Est2 field rather than OverallTime_Est. Since this is the
      // only situation where we have a field naming exception, it's much
      // simpler to switch the field here, rather than track the mode, variable,
      // and zoom-level states and place exceptions everywhere else.
      work.forEach(function (city) {
        city.OverallTime_Est = city.OverallTime_Est2;
      });
      joinData(work, cityLayerWork, "City", "2013");
      cityDataWork = work;
    });
    tractPromise = tractPromise.then(function (tract) {
      joinData(tract, tractLayer, "Id2", "2013");
      tractData = tract;
    });
    regionPromise = regionPromise.then(function (region) {
      regionData = region;
    });

    // Once we've received and processed all of the remote data, we can finish
    // setting up the map and bar chart.
    Promise.join(
      cityHomePromise,
      cityWorkPromise,
      tractPromise,
      regionPromise
    ).then(function () {

      barChart(regionData, "Year", variables, "Region", "T3-T4-B-chart", 2013, "Region", "Bay Area" )

      map.setView([37.7833, -122.4167], 9)

      map.on('viewreset', function() {
        zoomFilter(currentVariable);
      });

      $('.make-map-fullscreen').click(makeMapFullScreen);
      $('.reduce-map-size').click(disableFullScreen);

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
        // If we switch between home and work, the bar chart no longer corresponds to the map.
        barChart(regionData, "Year", variables, "Region", "T3-T4-B-chart", 2013, "Region", "Bay Area" )
      });

      $("#workButton").click(function() {
        $(this).addClass("active")
        $("#homeButton ").removeClass("active")
        homeWork = "work"
        zoomFilter(currentVariable)
        // If we switch between home and work, the bar chart no longer corresponds to the map.
        barChart(regionData, "Year", variables, "Region", "T3-T4-B-chart", 2013, "Region", "Bay Area" )
      });

      // Kick things off
      zoomFilter("OverallTime_Est")
      $('#overallButton').addClass("active")
    });

    function joinData(data, layer, nameField, year) {
      var modes = [],
          name,
          newLayer = layer.toGeoJSON(),
          byName = {};

      // Create a mapping from name to data.
      for (var i = 0; i < data.length; i +=1) {
        name = data[i][nameField];
        if (name) {
          byName[name] = data[i];
        }
      }

      // Copy properties from the data to the features with the same name. If a
      // feature has no corresponding data, leave it out.
      var newFeatures = [];
      for (i = 0; i < newLayer.features.length; i+= 1) {
        name = newLayer.features[i].properties.NAME;
        var datum = byName[name];
        if (name && datum && datum.Year == year) {
          newLayer.features[i].properties = datum;
          newFeatures.push(newLayer.features[i]);
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

      layer.setGeoJSON(newFeatures);
      setVariable(currentVariable, layer);
    }

    var nullStyle = {
      fillColor: window.allGray[0],
      fillOpacity: 0.8,
      weight: 0.5
    };

    // allNull will be true if we have a dataset that's entirely absent
    // (tract-level data for to-work). Otherwise we would need a separate map
    // layer with just a bunch of null-valued fields, which is a waste of
    // memory.
    // If we refactor the way the interactive joins data and styles layers, we
    // should not need this hack.
    function setVariable(name, dataLayer, allNull) {
      currentVariable = name;
      var range = ranges[name];
      var scale = [];
      $.each(range, function(i, value){
        scale.push(value)
      })
      changeLegend(scale, name, hues)

      if (allNull) {
        dataLayer.setStyle(nullStyle);
        return;
      }

      dataLayer.eachLayer(function(layer) {
        var value = layer.feature.properties[name];
        var color;
        if (value === null || value === undefined) {
          // No data for this geography.
          layer.setStyle(nullStyle);
        } else {
          // Determine which color to use based on which range the value falls
          // in.
          if (value > ranges[name][2]) {
            color = variablesObj[name].hues[3];
          } else if (value > ranges[name][1]) {
            color = variablesObj[name].hues[2];
          } else if (value > ranges[name][0]) {
            color = variablesObj[name].hues[1];
          } else {
            color = variablesObj[name].hues[0];
          }
          layer.setStyle({
              fillColor: color,
              fillOpacity: 0.8,
              weight: 0.5
          });
        }
      });
    }

    function zoomFilter(mode) {
      if ((map.getZoom() < 13)) {
        // City mode
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
      } else {
        // Tract mode
        if (homeWork === "home") {
          tractLayer.setFilter(function() { return true; })
          setVariable(mode, tractLayer);
          cityLayer.setFilter(function() { return false; })
          cityLayerWork.setFilter(function() { return false; })
          sortTopTen(cityData, mode);
          sortBottomFive(cityData, mode);
        } else {
          tractLayer.setFilter(function() { return true; })
          setVariable(mode, tractLayer, true);
          cityLayer.setFilter(function() { return false; })
          cityLayerWork.setFilter(function() { return false; })
          sortTopTen(cityData, mode);
          sortBottomFive(cityData, mode);
        }
      }
    }

    function sortTopTen(data, mode) {
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

       var topTenText = "<div class='col-lg-6'><h5>Top Cities for " + variablesObj[mode].title + "</h5>"
       topTenText += "<ol>";
        $.each(sorted.slice(0, 5), function(key, v) {
            topTenText += "<li>" + v.City + ": " + (Math.round(v[mode]*100)/100).toFixed(1) + " min</li>"
        })
        topTenText += "</ol></div>"
        $("#T3-T4-B-chart3").html(topTenText);
    }

    function sortBottomFive(data, mode) {
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

        var bottomFiveText = "<div class='col-lg-6'><h5>Bottom Cities for " + variablesObj[mode].title + "</h5>"
        bottomFiveText += "<ol>";
        $.each(sortedBottom.slice(0, 5), function(k, value) {
            bottomFiveText += "<li>" + value.City + ": " + (Math.round(value[mode]*100)/100).toFixed(1) + " min</li>"
        })
        bottomFiveText += "</ol></div>"
          $("#T3-T4-B-chart3").append(bottomFiveText);
    }

    function changeLegend(quantiles, title, hues) {
      var legendTemplate = _.template(
        '<h5><%= title %></h5>' +
        '<% _.forEach(rangeStrings, function (rangeString, i) { %>' +
        '<div class="legend-row"><div class="legend-color" style="background:<%= hues[i] %>;">&nbsp; </div>' +
        '<div class="legend-text"><%= rangeStrings[i] %></div></div><% }) %>' +
        '<div class="legend-row"><div class="legend-text">Zoom to see detailed geographies</div></div>'
      );
      var div = $('.info.legend');
      var rangeStrings = [];
      var i;
      var start;
      quantiles.unshift(1);
      for (i = 0; i < quantiles.length; i += 1) {
        start = Math.round(quantiles[i] * 100) / 100;
        if (i + 1 < quantiles.length) {
          rangeStrings.push(start + '&ndash;' + (Math.round(quantiles[i + 1] * 100) / 100));
        } else {
          rangeStrings.push(start + '+');
        }
      }
      $(div).html(legendTemplate({
        title: variablesObj[title].title,
        hues: variablesObj[title].hues,
        rangeStrings: rangeStrings
      }));
    }
  })


function getRange(data, value) {
  var range = []
  $.each(data, function(key, v) {
    if(v[value] != null) {
      range.push(v[value])
    }
  })
  var breaks = science.stats.quantiles(range, [0, 0.25, 0.50, 0.75])
  return breaks
}


function barChart(data, seriesName, seriesData, title, container, year, searchValue, searchTerm) {
    // Get the CSV and create the chart
    var options = {
        chart: {
            backgroundColor: null,
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
    var yaxis = [];
    var dataArray = []
    $.each(seriesData, function(key, name) {
      $.each(data, function(i,value) {
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
    var chart = new Highcharts.Chart(options);
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
}(window.jQuery, window.Promise, window.L, window._));
