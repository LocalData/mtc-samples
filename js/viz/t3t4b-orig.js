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

    var variablesObj = {
      'OverallTime_Est': {title: 'Overall Commute Time', hues: allBlue},
      'DATime_Est': {title: 'Drive Alone Commute Time', hues: allGreen},
      'CPTime_Est': {title: 'Carpool Commute Time', hues: allYellow},
      'PTTime_Est': {title: 'Public Transit Commute Time', hues: allOrange },
      'Workers_Est': {title: 'Overall Commute Time', hues: allBlue},
      'DAWorkers_Est': {title: 'Drive Alone Commute Time', hues: allGreen},
      'CPWorkers_Est': {title: 'Carpool Commute Time', hues: allYellow},
      'PTWorkers_Est': {title: 'Public Transit Commute Time', hues: allOrange }
    }

    var variables = [
      'OverallTime_Est',
      'DATime_Est',
      'CPTime_Est',
      'PTTime_Est'
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
        var $sidebar = $('#T3-T4-B-sidebar');
        $container.toggleClass('fullscreen-map-container');

        // Move the legend
        // $('.info.legend').show();
        // $('#map .info.legend').hide();
        //$container.height(625);
        $sidebar.height($container.height());

        // Calculate thew new offset
        var offset = $container.offset();
        var leftOffset = offset.left;

        // Get any existing left offset
        var left = $container.css('left');
        left = _.trim(left, 'px');
        left = parseInt(left, 10);
        if (left) {
            leftOffset -= left;
        }

        // Set the new offset
        $container.css('left', '-' + leftOffset + 'px');

        // Set the sidebar location
        var sidebarPadding = 30;
        console.log("Sidebar offset calc", window.innerWidth, $sidebar.offset().left, $sidebar.width())
        var sidebarOffsetRight = window.innerWidth - ($sidebar.offset().left + $sidebar.width() + sidebarPadding);

        // Get any existing right offset
        var right = $sidebar.css('right');
        right = _.trim(right, 'px');
        right = parseInt(right, 10);
        if (right) {
            sidebarOffsetRight -= right;
        }

        $sidebar.css({
          position: 'relative',
          right: (-sidebarOffsetRight) + 12
        });

        // console.log("Final sidebar offset", sidebarOffsetRight);

        // Set the new map
        var fullWidth = window.innerWidth - $sidebar.width() - sidebarPadding;
        $container.width(fullWidth);
        // console.log("Resizing container", offset, leftOffset, fullWidth, $sidebar.width(), window.innerWidth);

        // Resize the map if the window resizes
        window.addEventListener('resize', makeMapFullScreen);
        map._onResize();

        map.panTo(center);
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

        var $sidebar = $('#T3-T4-B-sidebar');
        $sidebar.css({
          right: 'auto',
          position: 'inherit'
        });

        map._onResize();
        map.panTo(center);
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

    // Add the zoom in indicator
    $('#map').append('<div class="zoom-in-prompt"><div>Zoom in to see neighborhood data</div></div>');


    // Initiate the data requests early, so we can do some geodata processing
    // while we wait on the responses.
    var cityHomePromise = get('http://vitalsignsvs2.elasticbeanstalk.com/api/t3/city');
    var cityWorkPromise = get('http://vitalsignsvs2.elasticbeanstalk.com/api/t4/city');
    var tractPromise = get('http://vitalsignsvs2.elasticbeanstalk.com/api/t3/tract');
    var regionPromise = get('http://vitalsigns-production.elasticbeanstalk.com/t3t4/region');

    // Flatten the tract and city data
    var flatTracts = flatten(window.tracts)
    var flatCities = flatten(window.geocities);

    // We don't need a reference to the original city & tract GeoJSON.
    window.geocities = undefined;
    window.tracts = undefined;


    var fieldToModeMapping = {
      'Overall': 'OverallTime_Est',
      'Drive Alone': 'DATime_Est',
      'Carpool': 'CPTime_Est',
      'Public Transit': 'PTTime_Est'
    };

    function convertNewDataFormat(data, scale) {
      // console.log("Cleaning", data);
      var geographies = [];
      var geoKey;
      var i;

      // Figure out the names of all cities we'll want data for
      if (scale === 'City') {
        _.each(flatCities.features, function(f) {
          geographies.push(f.properties.NAME);
        });
        geoKey = 'City';
      }

      // Or, figure out all the tracts.
      if (scale === 'Tract') {
        _.each(flatTracts.features, function(f) {
          geographies.push(Number(f.properties.NAME));
        });
        geoKey = 'ID2';
      }

      // Match the raw data to each geography
      formattedData = {};
      _.each(geographies, function(geo) {
        // If we don't yet have any data for this city/tract yet,
        // set up an object to store it:
        if (formattedData[geo] == undefined) {
          formattedData[geo] = {};

          formattedData[geo][scale] = geo;
          formattedData[geo].Year = 2014;

          for (i = 0; i < variables.length; i++) {
            formattedData[geo][variables[i]] = null;
          }

          if (scale === 'Tract') {
            formattedData[geo].ID2 = geo;
          }
        }
      });

      // Go over each piece of data and match it to a geo
      for (i = 0; i < data.length; i++) {
        var d = data[i];
        // if (d.City === null) {
        //   continue;
        // }
        var key = fieldToModeMapping[d.Mode];
        if (formattedData[d[geoKey]] === undefined) {
          // console.log("Missing base geodata for", d, geoKey, formattedData);
          continue;
        }
        formattedData[d[geoKey]][key] = d.Time;
      }

      return _.values(formattedData);
    }


    var cityLayer = L.mapbox.featureLayer(flatCities)
        .on('click', function(e) {
          barChart(cityData, "Year", variables, e.layer.feature.properties["City"], "T3-T4-B-chart", 2014, "City", e.layer.feature.properties["City"] )
         })
        .addTo(map);

    var cityLayerWork = L.mapbox.featureLayer(flatCities)
        .on('click', function(e) {
          barChart(cityDataWork, "Year", variables, e.layer.feature.properties["City"], "T3-T4-B-chart", 2014, "City", e.layer.feature.properties["City"] )
         })
        .addTo(map);

    var tractLayer = L.mapbox.featureLayer(flatTracts)
        .on('click', function(e) {
          barChart(tractData, "Year", variables, "Tract " + e.layer.feature.properties["ID2"], "T3-T4-B-chart", 2014, "ID2", e.layer.feature.properties["ID2"] )
        })
        .addTo(map);

    // As the remote data comes in, we can join it to the geodata.
    cityHomePromise = cityHomePromise.then(function (home) {
      var convertedData = convertNewDataFormat(home, "City");
      joinData(convertedData, cityLayer, "City", 2014);
      cityData = convertedData;
    });
    cityWorkPromise = cityWorkPromise.then(function (work) {
      var convertedData = convertNewDataFormat(work, "City");
      joinData(convertedData, cityLayerWork, "City", 2014);
      cityDataWork = convertedData;
    });
    tractPromise = tractPromise.then(function (tract) {
      convertedData = convertNewDataFormat(tract, "Tract");
      joinData(convertedData, tractLayer, "Tract", 2014);
      tractData = convertedData;
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

      // barChart(regionData, "Year", variables, "Region", "T3-T4-B-chart", 2014, "Region", "Bay Area" )

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
        $('#T3-T4-B-chart').html('');
        // barChart(regionData, "Year", variables, "Region", "T3-T4-B-chart", 2014, "Region", "Bay Area" )
      });

      $("#workButton").click(function() {
        $(this).addClass("active")
        $("#homeButton ").removeClass("active")
        homeWork = "work"
        zoomFilter(currentVariable)
        // If we switch between home and work, the bar chart no longer corresponds to the map.
        $('#T3-T4-B-chart').html('');
        // barChart(regionData, "Year", variables, "Region", "T3-T4-B-chart", 2014, "Region", "Bay Area" )
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
          $('.zoom-in-prompt').show();
          cityLayer.setFilter(function() { return true; })
          cityLayerWork.setFilter(function() { return false; })
          setVariable(mode, cityLayer);
          sortTopTen(cityData, mode);
          sortBottomFive(cityData, mode);
        } else {
          $('.zoom-in-prompt').hide();
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
          $('.zoom-in-prompt').hide();
          tractLayer.setFilter(function() { return true; })
          setVariable(mode, tractLayer);
          cityLayer.setFilter(function() { return false; })
          cityLayerWork.setFilter(function() { return false; })
          sortTopTen(cityData, mode);
          sortBottomFive(cityData, mode);
        } else {
          // No tract data is available in this mode.
          $('.zoom-in-prompt').hide();
          map.setZoom(12);
          // tractLayer.setFilter(function() { return true; })
          // setVariable(mode, tractLayer, true);
          // cityLayer.setFilter(function() { return false; })
          // cityLayerWork.setFilter(function() { return false; })
          // sortTopTen(cityData, mode);
          // sortBottomFive(cityData, mode);
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

       var topTenText = "<div class='col-lg-6'><h5>Cities with the Longest " + variablesObj[mode].title + "</h5>"
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

        var bottomFiveText = "<div class='col-lg-6'><h5>Cities with the Shortest " + variablesObj[mode].title + "</h5>"
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
        '<div class="legend-text"><%= rangeStrings[i] %> minutes</div></div><% }) %>'
      );
      var div = $('.info.legend');
      var rangeStrings = [];
      var i;
      var start;
      quantiles.unshift(1);
      for (i = 0; i < quantiles.length; i += 1) {
        start = Math.round(quantiles[i] * 100) / 100;
        if (i + 1 < quantiles.length) {
          rangeStrings.push(start.toFixed(1) + '&ndash;' + (Math.round(quantiles[i + 1] * 100) / 100).toFixed(1));
        } else {
          rangeStrings.push(start.toFixed(1) + '+');
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
    $('#select-location-prompt').hide();
    $('#T3-T4-B-chart').show()

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
        if(value[searchValue] === searchTerm && value.Year === 2014) {
            dataArray.push({
              y: value[name],
              color: variablesObj[name].hues[2]
            });
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
          yaxis.push("Public Transit");
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
