 /*globals Highcharts, science, cartodb, allRed, allOrange, allYellow, allBlue, allGreen */
 (function($, Promise, L, _) {
    var currentVariable = "OverallTime_Est";
    var homeWork = "home";
    var map, cityData, cityDataWork, tractData, regionData, cityLayer, cityWorkLayer, tractLayer;
    var cdbCityWork, cdbCityHome;

    var sql = new cartodb.SQL({user: 'mtc'});
    var TRACT_ZOOM = 12;
    var tractTemplate = _.template($('#tract-template').html());
    var cityTemplate = _.template($('#city-template').html());


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
      'PTTime_Est': {title: 'Public Transit Commute Time', hues: allOrange }
      // 'Workers_Est': {title: 'Overall Commute Time', hues: allBlue},
      // 'DAWorkers_Est': {title: 'Drive Alone Commute Time', hues: allGreen},
      // 'CPWorkers_Est': {title: 'Carpool Commute Time', hues: allYellow},
      // 'PTWorkers_Est': {title: 'Public Transit Commute Time', hues: allOrange }
    };

    var variables = [
      'OverallTime_Est',
      'DATime_Est',
      'CPTime_Est',
      'PTTime_Est'
    ];

    var ranges = {"OverallTime_Est":{"0":8.084415584,"1":25.21067241,"2":28.51762267,"3":31.540992109999998},"DATime_Est":{"0":18.05652826,"1":23.11518325,"2":25.56719653,"3":28.30715532},"CPTime_Est":{"0":12.08333333,"1":23.84180791,"2":29.18604651,"3":33.41176471},"PTTime_Est":{"0":20.3125,"1":39.70183486,"2":45.29761905,"3":53.84615385}};

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

  function barChart(data) {
    $('#select-location-prompt').hide();
    $('#T3-T4-B-chart').show();

    // seriesName, seriesData, title, container, year, searchValue

    // Get the CSV and create the chart
    var options = {
        chart: {
            backgroundColor: null,
            renderTo: 'T3-T4-B-chart',
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
    };

    var yaxis = [];
    var dataArray = [];

    _.each(variablesObj, function(variable, key) {
      var cartoKey = key.toLowerCase();
      dataArray.push({
        y: data[cartoKey],
        color: variablesObj[key].hues[2]
      });

      switch(key) {
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

      // options.series[0].data.push([variable.title, data[cartoKey]]);
      // data[cartoKey];
    });

    /*
    $.each(seriesData, function(key, name) {
      $.each(data, function(i,value) {
        if(value[searchValue] === searchTerm && value.Year === 2014) {
            dataArray.push({
              y: value[name],
              color: variablesObj[name].hues[2]
            });
        }
      });
    });*/

    options.series[0].data = dataArray;
    options.series[0].name = "Time";
    options.xAxis.categories = yaxis;
    options.xAxis.title = "Time";
    options.title.text = data.city;
    if (_.has(data, 'id2')) {
      options.title.text = 'Tract ' + data.id2;
    }
    var chart = new Highcharts.Chart(options);
  }

  function handleFeatureClick(event, latlng, pos, data, layerIndex) {
    barChart(data);
  }

  $(function(){
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
        console.log("Sidebar offset calc", window.innerWidth, $sidebar.offset().left, $sidebar.width());
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

    // Create the map
    map = L.map('map', {
        zoom: 10,
        center: [37.7833, -122.4167],
        fullscreen: true,
        scrollWheelZoom: false,
        attributionControl: false
    });

    L.tileLayer('http://a.tiles.mapbox.com/v3/postcode.kh28fdpk/{z}/{x}/{y}.png')
      .addTo(map);

    // map.on('load', function() {
    //   cityLayer.setFilter(function() { return true; })
    // });

    var legendControl = new L.control({
      position: 'bottomright'
    });
    L.control.scale().addTo(map);

    legendControl.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'info legend');
      $(div).addClass("col-lg-12");
      $(div).append("<h5>Drive Alone Percentage</h5>");
      return div;
    };
    legendControl.addTo(map);

    // Add the zoom in indicator
    $('#map').append('<div class="zoom-in-prompt"><div>Zoom in to see neighborhood data</div></div>');


    var fieldToModeMapping = {
      'Overall': 'OverallTime_Est',
      'Drive Alone': 'DATime_Est',
      'Carpool': 'CPTime_Est',
      'Public Transit': 'PTTime_Est'
    };

    // barChart(cityData, "Year", variables, e.layer.feature.properties["City"], "T3-T4-B-chart", 2014, "City", e.layer.feature.properties["City"] )
    start();
    function start() {
      // barChart(regionData, "Year", variables, "Region", "T3-T4-B-chart", 2014, "Region", "Bay Area" )

      var interactivity = 'cartodb_id, city, ' + variables.join(', ').toLowerCase();
      cdbCityHome = cartodb.createLayer(map, {
        user_name: 'mtc',
        cartodb_logo: false,
        type: 'cartodb',
        sublayers: [{
          sql: "SELECT * FROM t3t4cityhome",
          cartocss: cityTemplate({
            selector: '#t3t4cityhome',
            maxzoom: TRACT_ZOOM,
            colors: variablesObj[currentVariable].hues,
            range: ranges[currentVariable],
            field: currentVariable.toLowerCase()
          }),
          interactivity: interactivity
        }]
      })
      .addTo(map)
      .done(function(layer) {
        cityLayer = layer;
        var sublayer = layer.getSubLayer(0);
        sublayer.setInteraction(true);
        cartodb.vis.Vis.addCursorInteraction(map, sublayer);
        sublayer.on('featureClick', handleFeatureClick);
      });

      cdbCityWork = cartodb.createLayer(map, {
        user_name: 'mtc',
        cartodb_logo: false,
        type: 'cartodb',
        sublayers: [{
          sql: "SELECT * FROM t3t4citywork where year = 2014",
          cartocss: cityTemplate({
            selector: '#t3t4citywork',
            maxzoom: 21,
            colors: variablesObj[currentVariable].hues,
            range: ranges[currentVariable],
            field: currentVariable.toLowerCase()
          }),
          interactivity: interactivity
        }]
      })
      .done(function(layer) {
        cityLayerWork = layer;
        var sublayer = layer.getSubLayer(0);
        sublayer.setInteraction(true);
        cartodb.vis.Vis.addCursorInteraction(map, sublayer);
        sublayer.on('featureClick', handleFeatureClick);
      });

      var cdbTracts = cartodb.createLayer(map, {
        user_name: 'mtc',
        cartodb_logo: false,
        type: 'cartodb',
        sublayers: [{
          sql: "SELECT * FROM t3t4tract",
          cartocss: tractTemplate({
            colors: variablesObj[currentVariable].hues,
            range: ranges[currentVariable],
            field: currentVariable.toLowerCase()
          }),
          interactivity: 'cartodb_id, id2, overalltime_est, datime_est, cptime_est, pttime_est'
        }]
      })
      .addTo(map)
      .done(function(layer) {
        tractLayer = layer;
        var sublayer = layer.getSubLayer(0);
        sublayer.setInteraction(true);
        cartodb.vis.Vis.addCursorInteraction(map, sublayer);
        sublayer.on('featureClick', handleFeatureClick);
      });

      map.on('viewreset', function() {
        if (map.getZoom() >= TRACT_ZOOM) {
          $('.zoom-in-prompt').hide();
          if (homeWork === 'work') {
            // map.setZoom(TRACT_ZOOM - 1);
          }
        } else {
          if (homeWork === 'home') {
            $('.zoom-in-prompt').show();
            if(!map.hasLayer(cityLayer)) {
              map.addLayer(cityLayer);
            }
          }
        }
      });

      sortTopFive();
      sortBottomFive();

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
      // zoomFilter("OverallTime_Est");
      $('#overallButton').addClass("active");
    };

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
      currentVariable = mode;

      changeLegend();

      cityLayer.setCartoCSS(cityTemplate({
        selector: '#t3t4cityhome',
        maxzoom: TRACT_ZOOM,
        colors: variablesObj[currentVariable].hues,
        range: ranges[currentVariable],
        field: currentVariable.toLowerCase()
      }));
      cityLayerWork.setCartoCSS(cityTemplate({
        selector: '#t3t4citywork',
        maxzoom: 21,
        colors: variablesObj[currentVariable].hues,
        range: ranges[currentVariable],
        field: currentVariable.toLowerCase()
      }));
      tractLayer.setCartoCSS(tractTemplate({
        colors: variablesObj[currentVariable].hues,
        range: ranges[currentVariable],
        field: currentVariable.toLowerCase()
      }));

      if(homeWork == "home") {
        // Home mode
        map.addLayer(cityLayer);
        map.addLayer(tractLayer);
        map.removeLayer(cityLayerWork);

        console.log("Should I show zoom", map.getZoom());
        if (map.getZoom() < TRACT_ZOOM) {
          console.log("Showing prompt");
          $('.zoom-in-prompt').show();
        }
      } else {
        // Work mode
        map.addLayer(cityLayerWork);
        map.removeLayer(cityLayer);
        map.removeLayer(tractLayer);

        // Zoom out if we're too far in for tracts
        if (map.getZoom() >= TRACT_ZOOM) {
          map.setZoom(TRACT_ZOOM - 1);
        }
      }

      sortTopFive();
      sortBottomFive();
    }

    function sortTopFive(data, mode) {
      var mode = currentVariable;
      var column = currentVariable.toLowerCase();

      var table = 't3t4cityhome';
      if (homeWork === 'work') {
        table = 't3t4citywork';
      }

      var dataPromise = sql.execute("SELECT city, " + column + " FROM " + table + " where year=2014 and " + column + " IS NOT NULL ORDER BY " + column + " DESC limit 5");
      dataPromise.done(function(data) {
        var sorted = data.rows;
        var topTenTitle = variablesObj[mode].title;
        if (_.has(variablesObj[mode], 'topTenTitle')) {
          topTenTitle = variablesObj[mode].topTenTitle;
        }
        var topTenText = "<div class='col-lg-6'><h5>Cities with the Longest " + variablesObj[mode].title + "</h5>"
        topTenText += "<ol>";
        $.each(sorted.slice(0, 5), function(key, v) {
          topTenText += "<li>" + v.city + ": " + (Math.round(v[mode.toLowerCase()]*100)/100).toFixed(1) + " min</li>"
        })
        topTenText += "</ol></div>"
        $("#T3-T4-B-chart3").html(topTenText);
      });
    }

    function sortBottomFive(data, mode) {
      var mode = currentVariable;
      var column = currentVariable.toLowerCase();

      var table = 't3t4cityhome';
      if (homeWork === 'work') {
        table = 't3t4citywork';
      }

      var dataPromise = sql.execute("SELECT city, " + column + " FROM " + table + " where year=2014 and " + column + " IS NOT NULL ORDER BY " + column + " ASC limit 5");
      dataPromise.done(function(data) {
        var sortedBottom = data.rows;
        var bottomFiveText = "<div class='col-lg-6'><h5>Cities with the Shortest " + variablesObj[mode].title + "</h5>";
        bottomFiveText += "<ol>";
        $.each(sortedBottom.slice(0, 5), function(k, value) {
            bottomFiveText += "<li>" + value.city + ": " + (Math.round(value[mode.toLowerCase()]*100)/100).toFixed(1) + " min</li>";
        });
        bottomFiveText += "</ol></div>";
        $("#T3-T4-B-chart3").append(bottomFiveText);
      });
    }

    function changeLegend() {
      var title = currentVariable;
      var hues = variablesObj[title].hues;
      var quantiles = [];


      _.each(ranges[currentVariable], function(range){
        quantiles.push(range);
      });

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
}(window.jQuery, window.Promise, window.L, window._));
