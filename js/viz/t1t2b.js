/*globals L, Highcharts, science, geocities, tracts,
    allRed, allOrange, allBlue, allYellow, allPurple, allGray, allGreen */
 (function($, _) {
    var currentVariable = 'DriveAlone_Est';
    var homeWork = "home";
    var map, tractData, cityData, cityDataWork, regionData, tractLayer;
    var cdbCityWork, cdbCityHome;

    var sql = new cartodb.SQL({user: 'mtc'});
    var TRACT_ZOOM = 12;
    var tractTemplate = _.template($('#tract-template').html());
    var cityTemplate = _.template($('#city-template').html());

    var variables = [
      'DriveAlone_Est',
      'Carpool_Est',
      'Transit_Est',
      'Walk_Est',
      'Bike_Est',
      'Telework_Est',
      'Other_Est'
    ];

    // Set up the ranges object
    var ranges = {
       "DriveAlone_Est":{
          "0":0,
          "1":59.3719069,
          "2":71.38531420000001,
          "3":77.8513322
       },
       "Carpool_Est":{
          "0":0,
          "1":6.3774776,
          "2":9.6850394,
          "3":13.2277822
       },
       "Transit_Est":{
          "0":0,
          "1":2.6060157999999998,
          "2":6.456846199999999,
          "3":15.11244845
       },
       "Walk_Est":{
          "0":0,
          "1":0.5310258000000001,
          "2":1.7142857,
          "3":4.0272135
       },
       "Bike_Est":{
          "0":0,
          "1":0,
          "2":0.6561680000000001,
          "3":2.0247471
       },
       "Telework_Est":{
          "0":0,
          "1":2.9070182,
          "2":5.0973451,
          "3":8.025687600000001
       },
       "Other_Est":{
          "0":0,
          "1":0.3016653,
          "2":0.9397024,
          "3":1.9194039500000002
       }
    };

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
      'DriveAlone_Est': {
        title: 'Drive Alone',
        topTenTitle: 'Driving Alone',
        hues: allRed
      },
      'Carpool_Est': {
        title: 'Carpool',
        topTenTitle: 'Carpooling',
        hues: allOrange
      },
      'Transit_Est': {
        title: 'Public Transit',
        hues: allBlue,
        topTenTitle: 'Taking Transit'
      },
      'Walk_Est': {
        title: 'Walk',
        topTenTitle: 'Walking',
        hues: allGreen
      },
      'Bike_Est': {
        title: 'Bike',
        topTenTitle: 'Biking',
        hues: allYellow
      },
      'Telework_Est': {
        title: 'Telecommute',
        topTenTitle: 'Telecommuting',
        hues: allPurple
      },
      'Other_Est': {
        title: 'Other',
        topTenTitle: 'Other Modes',
        hues: allGray
      }
    };

    function pieChart(data) {
      console.log("Pie chart with", data);
        $('#select-location-prompt').hide();
        $('#T1-T2-B-chart').show();

        // Get the CSV and create the chart
        var options = {
          chart: {
            backgroundColor: null,
            renderTo: 'T1-T2-B-chart',
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
        options.series[0].data = [];

        _.each(variablesObj, function(variable, key) {
          var cartoKey = key.toLowerCase();
          options.series[0].data.push([variable.title, data[cartoKey]]);
          data[cartoKey];
        });
        console.log("Chart options", options);

        options.title.text = data.city;
        if (_.has(data, 'id2')) {
          options.title.text = 'Tract ' + data.id2;
        }

        var chart = new Highcharts.Chart(options);
    } // end pie chart

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

    map.on('viewreset', function() {
      if (map.getZoom() >= TRACT_ZOOM) {
        $('.zoom-in-prompt').hide();
        if (homeWork === 'work') {
          // map.setZoom(TRACT_ZOOM - 1);
        }
      } else {
        if (homeWork === 'home') {
          $('.zoom-in-prompt').show();
        }
      }
    });

    // Add the zoom in indicator
    $('#map').append('<div class="zoom-in-prompt"><div>Zoom in to see neighborhood data</div></div>');

    var fieldToModeMapping = {
      'Drive Alone': 'DriveAlone_Est',
      'Carpool': 'Carpool_Est',
      'Public Transit': 'Transit_Est',
      'Walk': 'Walk_Est',
      'Bike': 'Bike_Est',
      'Telecommute': 'Telework_Est',
      'Other': 'Other_Est'
    };

    start();

    function handleFeatureClick(event, latlng, pos, data, layerIndex) {
      pieChart(data);
    }

    function start() {
      var interactivity = 'cartodb_id, city, ' + variables.join(', ').toLowerCase();

      cdbCityHome = cartodb.createLayer(map, {
        user_name: 'mtc',
        cartodb_logo: false,
        type: 'cartodb',
        sublayers: [{
          sql: "SELECT * FROM t1t2cityhome",
          cartocss: cityTemplate({
            selector: '#t1t2cityhome',
            maxzoom: TRACT_ZOOM - 1,
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
          sql: "SELECT * FROM t1t2citywork",
          cartocss: cityTemplate({
            selector: '#t1t2citywork',
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
          sql: "SELECT * FROM t1t2tractdata",
          cartocss: tractTemplate({
            colors: variablesObj[currentVariable].hues,
            range: ranges[currentVariable],
            field: currentVariable.toLowerCase()
          }),
          interactivity: 'cartodb_id, id2, drivealone_est, carpool_est, transit_est, walk_est, bike_est, telework_est, other_est'
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

      changeLegend();
      sortTopTen();

      $('.make-map-fullscreen').click(makeMapFullScreen);
      $('.reduce-map-size').click(disableFullScreen);
    } // end start

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

      if (map.getZoom() <= TRACT_ZOOM) {
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

    function zoomFilter(mode) {
      currentVariable = mode;

      changeLegend();

      cityLayer.setCartoCSS(cityTemplate({
        selector: '#t1t2cityhome',
        maxzoom: TRACT_ZOOM - 1,
        colors: variablesObj[currentVariable].hues,
        range: ranges[currentVariable],
        field: currentVariable.toLowerCase()
      }));
      cityLayerWork.setCartoCSS(cityTemplate({
        selector: '#t1t2citywork',
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
        sortTopTen();
      } else {
        map.addLayer(cityLayerWork);
        map.removeLayer(cityLayer);
        map.removeLayer(tractLayer);
        sortTopTen();

        if (map.getZoom() >= TRACT_ZOOM) {
          map.setZoom(TRACT_ZOOM - 1);
        }
      }
    }

    function sortTopTen() {
      var mode = currentVariable;

      var table = 't1t2cityhome';
      if (homeWork === 'work') {
        table = 't1t2citywork';
      }

      var column = currentVariable.toLowerCase();

      var dataPromise = sql.execute("SELECT city, " + column + " FROM " + table + " where " + column + " IS NOT NULL ORDER BY " + column + " DESC limit 10");
      dataPromise.done(function(data) {
        console.log("Got data", data);
        var topTenTitle = variablesObj[mode].title;
        if (_.has(variablesObj[mode], 'topTenTitle')) {
          topTenTitle = variablesObj[mode].topTenTitle;
        }
        var topTenText = "<h5>Top Cities for " + topTenTitle + "</h5><div class='row'><div class='col-md-12'>";
        topTenText += "<ol class='broken-list'>";
        _.each(data.rows, function(value) {
          topTenText += "<li>" + value.city + ": " + (Math.round(value[column]*1000)/1000).toFixed(1) + "%</li>";
        });
        topTenText += "</ol></div>";
        $("#T1-T2-B-chart3").html(topTenText);
      });

/*
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
*/
    }

    function changeLegend() {
      console.log("Changing legend");
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
  });

})(window.jQuery, window._);
