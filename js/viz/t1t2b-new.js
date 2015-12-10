 /*globals L, Highcharts, science, allRed, allOrange, allBlue, allGreen, allYellow, allPurple, allGray */
 (function($, _) {
  var currentVariable = 'DriveAlone_Est';
  var homeWork = "home";
  var tractData, cityData, cityDataWork, regionData;
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
      'DriveAlone_Est': {title: 'Drive Alone', hues: allRed},
      'Carpool_Est': {title: 'Carpool', hues: allOrange},
      'Transit_Est': {title: 'Transit', hues: allBlue },
      'Walk_Est': {title: 'Walk', hues: allGreen},
      'Bike_Est': {title: 'Bike', hues: allYellow},
      'Telework_Est': {title: 'Telecommute', hues: allPurple},
      'Other_Est': {title: 'Other', hues: allGray}
    };

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

    var legendControl = new L.mapbox.legendControl();
    L.control.scale().addTo(map);

    legendControl.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'info legend')
      $(div).addClass("col-lg-12")
      $(div).append("<h5>Drive Alone Percentage</h5>")
        return div;
    }
    legendControl.addTo(map);

    L.mapbox.tileLayer('postcode.kh28fdpk').addTo(map)
    // The visible tile layer

    $('#map').append('<div class="zoom-in-prompt">Zoom in to see census tract data</div>');

    var flatCities = flatten(geocities);
    var cityLayer = L.mapbox.featureLayer(flatCities)
        .on('mouseover', function() {

        })
        .on('click', function(e) {
          pieChart(cityData, "Year", variables, e.layer.feature.properties["City"], "T1-T2-B-chart", 2013, "City", e.layer.feature.properties["City"] )
         })
        .addTo(map);

     $.ajax({
      dataType: "json",
      url: "http://vitalsigns-production.elasticbeanstalk.com/t1t2/t1/cities",
      async: false,
      success: function(data) {
        joinData(data, cityLayer, "City", "2013")
        cityData = data
      }
    });

    var cityLayerWork = L.mapbox.featureLayer(flatCities)
        .on('mouseover', function() {

        })
        .on('click', function(e) {
          pieChart(cityDataWork, "Year", variables, e.layer.feature.properties["City"], "T1-T2-B-chart", 2013, "City", e.layer.feature.properties["City"] )
         })
        .addTo(map);

    $.ajax({
      dataType: "json",
      url: "http://vitalsigns-production.elasticbeanstalk.com/t1t2/t2/cities",
      async: false,
      success: function(data) {
        joinData(data, cityLayerWork, "City", "2013")
        cityDataWork = data
      }
    });

    var flatTracts = flatten(tracts)
    var tractLayer = L.mapbox.featureLayer(flatTracts)
        .on('click', function(e) {
          pieChart(tractData, "Year", variables, "Tract " + e.layer.feature.properties["Id2"], "T1-T2-B-chart", 2013, "Id2", e.layer.feature.properties["Id2"] )
        })
      .addTo(map);

    $.ajax({
      dataType: "json",
      url: "http://vitalsigns-production.elasticbeanstalk.com/t1t2/t1/tract",
      async: false,
      success: function(data) {
        joinData(data, tractLayer, "Id2", "2013")
        tractData = data
      }
    });

    $.ajax({
      dataType: "json",
      url: "http://vitalsigns-production.elasticbeanstalk.com/t1t2/t1/region",
      // Was: http://vitalsigns-production.elasticbeanstalk.com/t1t2/t1/region
      async: false,
      success: function(data) {
        // Process the region data into the new format.
        // DriveTot_Est: 69.9,
        // DriveAlone_Est: null,
        // Carpool_Est: null,
        // Transit_Est: 15.5,
        // Walk_Est: 7.8,
        // Other_w_Bike_Est: 2.2,
        // Bike_Est: null,
        // Other_Est: null,
        // Telework_Est: 5,

        var formattedData = {};

        // We only need the 2014 data here.
        data = _.where(data, { Year: 2014 });
        console.log("Using region data", 2014);
        var regionData = data[0];
        regionData.DriveTot_Est = _.find(data, { });
        regionData.DriveAlone_Est =  _.find(data, { Mode: "Auto"}).Share;
        regionData.Carpool_Est = ;
        regionData.Transit_Est =  _.find(data, { Mode: "Public Transit"}).Share;
        regionData.Walk_Est =  _.find(data, { Mode: "Walk"}).Share;
        regionData.Other_w_Bike_Est = ;
        regionData.Bike_Est = ;
        regionData.Other_Est = ;
        regionData.Telework_Est = _.find(data, { Mode: "Telecommute"}).Share;
      }
    });

    pieChart(regionData, "Year", variables, "Region", "T1-T2-B-chart", 2014, "Region", "Bay Area" )

    map.setView([37.7833, -122.4167], 10)

    $('.make-map-fullscreen').click(makeMapFullScreen);
    $('.reduce-map-size').click(disableFullScreen);

    map.on('viewreset', function() {
      if(map.getZoom() >= 13) {
        $('.zoom-in-prompt').hide();
        tractLayer.setFilter(function() { return true; })
        setVariable(currentVariable, tractLayer);
        cityLayer.setFilter(function() { return false; })
        cityLayerWork.setFilter(function() { return false; })
        sortTopTen(cityData, currentVariable);
      } else {
        $('.zoom-in-prompt').show();
        if(homeWork == "home") {
          cityLayer.setFilter(function() { return true; })
          setVariable(currentVariable, cityLayer);
          sortTopTen(cityData, currentVariable);
          cityLayerWork.setFilter(function() { return false; })
        } else {
          cityLayerWork.setFilter(function() { return true; })
          setVariable(currentVariable, cityLayerWork);
          sortTopTen(cityDataWork, currentVariable);
          cityLayer.setFilter(function() { return false; })
        }
        tractLayer.setFilter(function() { return false; })
      }
    });

    $("#autoButton").click(function() {
      zoomFilter("DriveAlone_Est");
      $(this).addClass("active");
        $('a.button-mode',$(this).parent().parent()).not(this).removeClass('active');
    });

    $("#carpoolButton").click(function() {
      zoomFilter("Carpool_Est")
      $(this).addClass("active")
        $('a.button-mode',$(this).parent().parent()).not(this).removeClass('active');
    });

    $("#transitButton").click(function() {
      zoomFilter("Transit_Est")
      $(this).addClass("active")
        $('a.button-mode',$(this).parent().parent()).not(this).removeClass('active');
    });

    $("#walkingButton").click(function() {
      zoomFilter("Walk_Est")
      $(this).addClass("active")
        $('a.button-mode',$(this).parent().parent()).not(this).removeClass('active');
    });

    $("#bikingButton").click(function() {
      zoomFilter("Bike_Est")
      $(this).addClass("active")
        $('a.button-mode',$(this).parent().parent()).not(this).removeClass('active');
    });

    $("#otherButton").click(function() {
      zoomFilter("Other_Est")
      $(this).addClass("active")
        $('a.button-mode',$(this).parent().parent()).not(this).removeClass('active');
    });

    $("#teleworkButton").click(function() {
      zoomFilter("Telework_Est")
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
        cityLayer.setFilter(function() { return true; })
        setVariable(mode, cityLayer);
        sortTopTen(cityData, mode);
        cityLayerWork.setFilter(function() { return false; })
      } else {
        cityLayerWork.setFilter(function() { return true; })
        setVariable(mode, cityLayerWork);
        sortTopTen(cityDataWork, mode);
        cityLayer.setFilter(function() { return false; })
      }
        tractLayer.setFilter(function() { return false; })
    } else if (map.getZoom() >= 13) {
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
          sortData[index]["City"] = []
          sortData[index][mode].push(value[mode])
          sortData[index]["City"].push(value.City)
         }
      })
       var sorted = sortData.sort(function (a, b) {
        return b[mode] - a[mode];
      });

       var topTenText = "<h5>Top Cities for " + variablesObj[mode].title + "</h5><div class='row'><div class='col-lg-6'>"
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
        '<div class="legend-text"><%= rangeStrings[i] %></div></div><% }) %>'
      );
      var div = $('.info.legend');
      var rangeStrings = [];
      var i;
      var start;
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
    function pieChart(data, seriesName, seriesData, title, container, year, searchValue, searchTerm) {
        // Get the CSV and create the chart
        var options = {
          chart: {
            backgroundColor: null,
            renderTo: container,
            type: 'pie'
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
        options.title.text = title
        var chart = new Highcharts.Chart(options);
    }

    zoomFilter("DriveAlone_Est")
    $('#autoButton').addClass("active")

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
