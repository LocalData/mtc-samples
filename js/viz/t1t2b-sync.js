/*globals L, Highcharts, science,
    allRed, allOrange, allBlue, allYellow, allPurple, allGray, allGreen */
 (function($, _) {
    var currentVariable = 'DriveAlone_Est';
    var homeWork = "home";
    var map, tractData, cityData, cityDataWork, regionData;
    var variables = [
      'DriveAlone_Est',
      'Carpool_Est',
      'Transit_Est',
      'Walk_Est',
      'Bike_Est',
      'Telework_Est',
      'Other_Est'
    ];

    var ranges = {};

    var hues = [
        '#bdd7e7',
        '#6baed6',
        '#3182bd',
        '#08519c'
        ];
  $(function() {
    // Set the default highcharts separator
    Highcharts.setOptions({
        lang: {
            decimalPoint: '.',
            thousandsSep: ','
        }
    });

    var variablesObj = {
      'DriveAlone_Est': {title: 'Drive Alone', topTenTitle: 'Driving Alone', hues: allRed},
      'Carpool_Est': {title: 'Carpool', topTenTitle: 'Carpooling', hues: allOrange},
      'Transit_Est': {title: 'Public Transit', hues: allBlue, topTenTitle: 'Taking Transit' },
      'Walk_Est': {title: 'Walk', topTenTitle: 'Walking', hues: allGreen},
      'Bike_Est': {title: 'Bike', topTenTitle: 'Biking', hues: allYellow},
      'Telework_Est': {title: 'Telecommute', topTenTitle: 'Telecommuting', hues: allPurple},
      'Other_Est': {title: 'Other', topTenTitle: 'Other Modes', hues: allGray}
    };

    var i;
    for (i = 0; i < variables.length; i++) {
      ranges[variables[i]] = {};
    }

    function makeMapFullScreen(event) {
      event.preventDefault();
      $('.make-map-fullscreen').hide();
      $('.reduce-map-size').show();
      var center = map.getCenter();

      var $container = $('#map');
      var $sidebar = $('#T1-T2-B-sidebar');
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

        var $sidebar = $('#T1-T2-B-sidebar');
        $sidebar.css({
          right: 'auto',
          position: 'inherit'
        });

        map._onResize();
        map.panTo(center);
    }

    L.mapbox.accessToken = 'pk.eyJ1IjoicG9zdGNvZGUiLCJhIjoiWWdxRTB1TSJ9.phHjulna79QwlU-0FejOmw';

    map = L.mapbox.map('map', undefined, {
        infoControl: true,
        attributionControl: false,
        scrollWheelZoom: false
    });

    var legendControl = new L.mapbox.legendControl();
    L.control.scale().addTo(map);

    legendControl.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'info legend');
      $(div).addClass("col-lg-12");
      $(div).append("<h5>Drive Alone Percentage</h5>");
      return div;
    };
    legendControl.addTo(map);

    L.mapbox.tileLayer('postcode.kh28fdpk').addTo(map);

    // Add the zoom in indicator
    $('#map').append('<div class="zoom-in-prompt"><div>Zoom in to see neighborhood data</div></div>');

    var flatCities = flatten(geocities);
    var flatTracts = flatten(tracts);

    // Add the layers to the map
    var cityLayer = L.mapbox.featureLayer(flatCities)
      .on('click', function(e) {
        pieChart(cityData, "Year", variables, e.layer.feature.properties.City, "T1-T2-B-chart", 2014, "City", e.layer.feature.properties.City );
      })
      .addTo(map);

    // Add the tract layer
    var tractLayer = L.mapbox.featureLayer(flatTracts)
      .on('click', function(e) {
        pieChart(tractData, "Year", variables, "Tract " + e.layer.feature.properties.Id2, "T1-T2-B-chart", 2014, "Id2", e.layer.feature.properties.Id2 );
      })
      //.addTo(map);

    // Add the city work layer
    var cityLayerWork = L.mapbox.featureLayer(flatCities)
      .on('click', function(e) {
        pieChart(cityDataWork, "Year", variables, e.layer.feature.properties.City, "T1-T2-B-chart", 2014, "City", e.layer.feature.properties.City )
       })
      .addTo(map);


    var fieldToModeMapping = {
      'Drive Alone': 'DriveAlone_Est',
      'Carpool': 'Carpool_Est',
      'Public Transit': 'Transit_Est',
      'Walk': 'Walk_Est',
      'Bike': 'Bike_Est',
      'Telecommute': 'Telework_Est',
      'Other': 'Other_Est'
    };

    // Converts data from the new format to the format we need to
    // join it to geodata later.
    //
    // TODO: We should simply add the geodata in this step instead of having
    // a separate join step.
    function convertNewDataFormat(data, scale) {
      var geographies = [];
      var geoKey;
      var i;

      // Figure out the names of all cities we'll want data for
      if (scale === 'City') {
        _.each(flatCities.features, function(f) {
          geographies.push(f.properties.NAME);
        });
        geoKey = scale;
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
            formattedData[geo].Id2 = geo;
          }
        }
      });

      // Go over each piece of data and match it to a geo
      for (i = 0; i < data.length; i++) {
        var d = data[i];
        if (d.City === null) {
          continue;
        }
        var key = fieldToModeMapping[d.Mode];
        //console.log("Setting", d, geoKey, key);
        if (formattedData[d[geoKey]] === undefined) {
          // console.log("Missing base geodata for", d, geoKey, formattedData);
          continue;
        }
        formattedData[d[geoKey]][key] = d.Share * 100;
      }

      // console.log("Got values", formattedData);
      return _.values(formattedData);
    }

    // Fetch & prep city home data
    // TODO: Convert back to async. Async was causing problems with lockup on load
    // -- maybe a problem with garbage collection, or a jquery performance issue?
    var cityHomePromise = $.ajax({
      dataType: "json",
      url: "http://vitalsignsvs2.elasticbeanstalk.com/api/t1/city",
      async: false,
      success: function(cityHomeData) {
        // Convert the city home data
        var convertedData = convertNewDataFormat(cityHomeData, "City");
        joinData(convertedData, cityLayer, "City", 2014);
        //console.log("Got joined data", cityHomeData, cityLayer);
        cityData = convertedData;
      }
    });
    var cityWorkPromise = $.ajax({
      dataType: "json",
      url: "http://vitalsignsvs2.elasticbeanstalk.com/api/t2/city",
      async: false,
      success: function(cityWorkData) {
        var convertedData = convertNewDataFormat(cityWorkData, "City");
        joinData(convertedData, cityLayerWork, "City", 2014);
        cityDataWork = convertedData;
      }
    });
    var tractHomePromise = $.ajax({
      dataType: "json",
      url: "http://vitalsignsvs2.elasticbeanstalk.com/api/t1/tract",
      async: false,
      success: function(tractHomeData) {
        var convertedData = convertNewDataFormat(tractHomeData, "Tract");
        console.log("Before join", convertedData, tractLayer);
        // joinData(convertedData, tractLayer, "Id2", 2014);
        console.log("Joined data", convertedData, tractLayer);
        tractData = convertedData;
      }
    });


      map.setView([37.7833, -122.4167], 10);

      $('.make-map-fullscreen').click(makeMapFullScreen);
      $('.reduce-map-size').click(disableFullScreen);

      zoomFilter("Transit_Est");

      map.on('viewreset', function() {
        if(map.getZoom() >= 13) {
          if (homeWork !== 'home') {
            $('.zoom-in-prompt').hide();
            map.setZoom(12);
            return;
          }
          $('.zoom-in-prompt').hide();
          tractLayer.setFilter(function() { return true; });
          setVariable(currentVariable, tractLayer);
          cityLayer.setFilter(function() { return false; });
          cityLayerWork.setFilter(function() { return false; });
          sortTopTen(cityData, currentVariable);
        } else {
          if(homeWork == "home") {
            $('.zoom-in-prompt').show();
            cityLayer.setFilter(function() { return true; });
            setVariable(currentVariable, cityLayer);
            sortTopTen(cityData, currentVariable);
            cityLayerWork.setFilter(function() { return false; });
          } else {
            $('.zoom-in-prompt').hide();
            cityLayerWork.setFilter(function() { return true; });
            setVariable(currentVariable, cityLayerWork);
            sortTopTen(cityDataWork, currentVariable);
            cityLayer.setFilter(function() { return false; });
          }
          tractLayer.setFilter(function() { return false; });
        }
      });
    //} // end start

    $("#autoButton").click(function() {
      zoomFilter("DriveAlone_Est");
      $(this).addClass("active");
      $('a.button-mode',$(this).parent().parent()).not(this).removeClass('active');
    });

    $("#carpoolButton").click(function() {
      zoomFilter("Carpool_Est");
      $(this).addClass("active");
      $('a.button-mode',$(this).parent().parent()).not(this).removeClass('active');
    });

    $("#transitButton").click(function() {
      zoomFilter("Transit_Est");
      $(this).addClass("active");
      $('a.button-mode',$(this).parent().parent()).not(this).removeClass('active');
    });

    $("#walkingButton").click(function() {
      zoomFilter("Walk_Est");
      $(this).addClass("active");
      $('a.button-mode',$(this).parent().parent()).not(this).removeClass('active');
    });

    $("#bikingButton").click(function() {
      zoomFilter("Bike_Est");
      $(this).addClass("active");
      $('a.button-mode',$(this).parent().parent()).not(this).removeClass('active');
    });

    $("#otherButton").click(function() {
      zoomFilter("Other_Est");
      $(this).addClass("active");
      $('a.button-mode',$(this).parent().parent()).not(this).removeClass('active');
    });

    $("#teleworkButton").click(function() {
      zoomFilter("Telework_Est");
      $(this).addClass("active");
      $('a.button-mode',$(this).parent().parent()).not(this).removeClass('active');
    });

    $("#homeButton").click(function() {
      $(this).addClass("active");
      $("#workButton ").removeClass("active");
      homeWork = "home";

      if (map.getZoom() <= 12) {
        $('.zoom-in-prompt').show();
      }

      zoomFilter(currentVariable)
    });

    $("#workButton").click(function() {
      $(this).addClass("active")
      $("#homeButton ").removeClass("active")
      homeWork = "work"
      $('.zoom-in-prompt').hide(); // No tract data for work

      zoomFilter(currentVariable);
    });


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
        scale.push(range);
      });
      changeLegend(scale, name, hues)
      dataLayer.eachLayer(function(layer) {
        var q;
        if (layer.feature.properties[name] >= ranges[name][3]) {
          q = 3;
        } else if(layer.feature.properties[name] >= ranges[name][2] && layer.feature.properties[name] < ranges[name][3]) {
          q = 2;
        } else if(layer.feature.properties[name] >= ranges[name][1] && layer.feature.properties[name] < ranges[name][2]) {
          q = 1;
        } else if(layer.feature.properties[name] >= ranges[name][0] && layer.feature.properties[name] < ranges[name][1]) {
          q = 0;
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
      if (map.getZoom() < 13) {
        // City mode
        if(homeWork == "home") {
          // Home mode
          cityLayer.setFilter(function() { return true; })
          setVariable(mode, cityLayer);
          sortTopTen(cityData, mode);
          cityLayerWork.setFilter(function() { return false; })
        } else {
          // Work mode
          cityLayerWork.setFilter(function() { return true; })
          setVariable(mode, cityLayerWork);
          sortTopTen(cityDataWork, mode);
          cityLayer.setFilter(function() { return false; })
        }
          tractLayer.setFilter(function() { return false; })
      } else if (map.getZoom() >= 13) {
          // If we aren't in home mode, zoom out a level, because
          // tract data isn't available.
          if(homeWork !== "home") {
            map.setZoom(12);
            return;
          }

          // Tract mode
          tractLayer.setFilter(function() { return true; })
          setVariable(mode, tractLayer);
          cityLayer.setFilter(function() { return false; })
          cityLayerWork.setFilter(function() { return false; })
          sortTopTen(cityData, mode);
      }
    }

    function sortTopTen(data, mode) {
      var sortData =[]
      $.each(data, function(index, value) {
        if(value[mode] !== null) {
          sortData[index] = []
          sortData[index][mode] = []
          sortData[index].City = []
          sortData[index][mode].push(value[mode])
          sortData[index].City.push(value.City)
         }
      })
       var sorted = sortData.sort(function (a, b) {
        return b[mode] - a[mode];
      });

       var topTenTitle = variablesObj[mode].title;
       if (_.has(variablesObj[mode], 'topTenTitle')) {
         topTenTitle = variablesObj[mode].topTenTitle;
       }
       var topTenText = "<h5>Top Cities for " + topTenTitle + "</h5><div class='row'><div class='col-md-12'>"
       topTenText += "<ol class='broken-list'>";
        $.each(sorted.slice(0,10), function(key, value) {
            topTenText += "<li>" + value.City + ": " + (Math.round(value[mode]*1000)/1000).toFixed(1) + "%</li>"
        })
        topTenText += "</ol></div>"
        $("#T1-T2-B-chart3").html(topTenText);
    }

    function changeLegend(quantiles, title, hues) {
      var legendTemplate = _.template(
        '<h5><%= title %></h5>' +
        '<% _.forEach(rangeStrings, function (rangeString, i) { %>' +
        '<div class="legend-row"><div class="legend-color" style="background:<%= hues[i] %>;">&nbsp; </div>' +
        '<div class="legend-text"><%= rangeStrings[i] %>%</div></div><% }) %>'
      );
      var div = $('.info.legend');
      var rangeStrings = [];
      var i;
      var start;
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
  //} // end start

    function pieChart(data, seriesName, seriesData, title, container, year, searchValue, searchTerm) {
        $('#select-location-prompt').hide();
        $('#T1-T2-B-chart').show();

        // Get the CSV and create the chart
        var options = {
          chart: {
            backgroundColor: null,
            renderTo: container,
            type: 'pie',
            spacingLeft: 0,
            spacingRight: 0

            },
            tooltip: {
              pointFormat: '<b>{point.percentage:.1f}%</b>'
            },
            title: {
                text: ""
            },
            colors: ['#BD5D21', '#E19063', '#3D9CC8', '#62A60A', '#D9B305', '#65598A', '#A8ABAF'],
            plotOptions: {
              pie: {
                allowPointSelect: true,
                dataLabels: {
                    enabled: false
                },
                showInLegend: true
              }
            },
            credits: {
                enabled: false
            },
          series: [{
            type: 'pie',
              name: false,
              data: []
           }]
        }
        options.series[0].data = []
        $.each(seriesData, function(key, name) {
          $.each(data, function(i,value) {
            if(value.Year == year && value[searchValue] == searchTerm) {
              options.series[0].data.push([variablesObj[name].title, value[name]]);
            }
          });
        })
        options.title.text = title;
        var chart = new Highcharts.Chart(options);
    } // end pie chart

  });


function getRange(data, value) {
  var range = [];
  $.each(data, function(key, v) {
    if(v[value] != null) {
      range.push(v[value]);
    }
  })
  var breaks = science.stats.quantiles(range, [0, .25, .50, .75]);
  return breaks;
}

function isMulti(geometry) {
  var type = geometry.type;
  return ((type === 'MultiPolygon') ||
          (type === 'MultiLineString') ||
          (type === 'MultiPoint') ||
          (type === 'GeometryCollection'));
}

function flatten(gj, up) {
    if (!gj || !gj.type) {
      return gj;
    }
    switch ((gj && gj.type) || null) {
        case 'FeatureCollection':
            gj.features = _(gj.features).map(function (feature) {
                return flatten(feature);
            }).flatten().value();
            return gj;
        case 'Feature':
            if (!isMulti(gj.geometry)) {
                return gj;
            }
            return flatten(gj.geometry).map(function(geom) {
                return {
                    type: 'Feature',
                    properties: _.clone(gj.properties),
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
        default:
            return gj;
    }
}
})(window.jQuery, window._);
