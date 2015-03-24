/*globals jQuery, L, geocities, allGreen, altColors, science: true */
(function($) {
    /*
    http://54.149.29.2/ec/3/city
    http://54.149.29.2/ec/3/county
    http://54.149.29.2/ec/3/region
    http://www.vitalsigns.mtc.ca.gov/bridge-condition
    Line graph showing the regional unemployment trend by default.
    - Using  drop-down menus, user can select a county or a city to see its historical
    trend.
    - If a county is selected, show lines both for county and for region.
    - If city is selected, show lines for both city, county, and region.
    - X-axis should be years and Y-axis should be unemployment rate (%).
    - Hovering over the line(s) should show the unemployment rates for each jurisdiction (e.g.
    "Regional Unemployment: X%; Alameda County Unemployment: Y%; Berkeley
    Unemployment: Z%) (T18-A: http://www.vitalsigns.mtc.ca.gov/bridge-condition)
    Example: http://dev-mtc-vital-signs.pantheon.io/sites/all/themes/vitalsigns/js/t18a.js?nlgw9a


    Chloropleth map showing cities color-coded by unemployment rate in 2013.
    -  When city is clicked in the map, a bar graph appears in the info panel
    showing the city unemployment rate compared to the county and the region for
    2013 (can hover to see details);
    _ graph should use consistent scale throughout.
    - The panel also include a top 5 list of cities with highest
    unemployment and a bottom 5 list with cities with the lowest unemployment.
    - No need for button bar or dropdowns.
    (T3-T4-B (interactive map),
    http://dev-mtc-vital-signs.pantheon.io/commute-time)
    http://dev-mtc-vital-signs.pantheon.io/sites/all/themes/vitalsigns/js/t3t4b-new.js?nlq112

    Line graph showing the unemployment trends for major metro areas.
    - When hovering over lines, show unemployment rates for all metros in year user is
    hovering over.
    - X-axis should be year, Y-axis should be unemployment rate.
    - User should be able to turn on or off metro areas in graph.
    - No dropdowns or button bars needed. (T11-12-C (without button bar),
    http://dev-mtc-vital-signs.pantheon.io/transit-ridership)
    http://54.149.29.2/ec/3/metro


    MISC

    http://54.213.139.235:1337/counties
    http://54.213.139.235:1337/cities

    Requests
    - Region data includes a blank at the end
    - Remove regional 2014 data?
    - City data: each name contains a space at the end
        (eg Residence_Geo: "Antioch ")
    - Several cities don't have economic data
    */

    var FOCUSYEAR = 2013;
    var YEARNAMES = [1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013];
    var METROYEARNAMES = [1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014];
    var CITYBLANKS = [null, null, null, null, null, null, null, null, null, null];

    var cityData, countyData, regionData, metroData;

    function graph(id, series) {
        $(id).highcharts({
            chart: {
                type: 'line'
            },
            title: {
                text: 'Unemployment'
            },
            xAxis: {
                categories: YEARNAMES
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Unemployment'
                }
            },
            legend: {
                reversed: true
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:,.1f}%</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            colors: altColors,
            series: series
        });
    }

    function selectLocation(e) {
        var location = this.dataItem(e.item.index());
        var city, county;

        if (location.Residence_Geo_CountyRef) {
            county = location.Residence_Geo_CountyRef;
            city = location.Residence_Geo;
        } else {
            county = location.Residence_Geo;
        }

        // Get the regional data
        var graphData = [];
        graphData.push({
            name: "Regional Unemployment",
            data: regionData
        });

        // Get the county data.
        var selectedCountyData = _.filter(countyData, {'Residence_Geo': county});
        var data = _.pluck(selectedCountyData, 'Unemployment_Rate');
        graphData.push({
            name: county + " Unemployment",
            data: data
        });

        // Push the city data, if any.
        if (city) {
            var selectedCityData = _.filter(cityData, {'Residence_Geo': location.Residence_Geo});
            data = _.pluck(selectedCityData, 'Unemployment_Rate');

            graphData.push({
                name: location.Residence_Geo + " Unemployment",
                data: CITYBLANKS.concat(data)
            });
        }

        graph('#ec3-a-chart', graphData);
    }

    // Given an object
    function getRange(data, property) {
      var range = [];
      $.each(data, function(key, v) {
        if(v[property] !== null) {
          range.push(v[property]);
        }
      });
      var breaks = science.stats.quantiles(range, [0, 0.25, 0.50, 0.75]);
      return breaks;
    }

    // Display the top 5 and lowest 5 unemployment rates
    function ec3bLeaderboard(data) {
        console.log("set up leaderboard", data);
        data = _.sortBy(data, 'Unemployment_Rate');
        var bottom5 = data.slice(0,5);
        var top5 = _.takeRight(data, 5).reverse();

        var topText = "<div class='col-lg-6'><h4>Highest Unemployment Rate</h4><ol>";
        _.each(top5, function(city, i) {
            topText += "<li>" + city.Residence_Geo + ": " + city.Unemployment_Rate + "%</li>";
        });
        topText += '</ol></div>';
        $("#ec3-b-top-cities").html(topText);


        var bottomText = "<div class='col-lg-6'><h4>Lowest Unemployment Rate</h4><ol>";
        _.each(bottom5, function(city, i) {
            bottomText += "<li>" + city.Residence_Geo + ": " + city.Unemployment_Rate + "%</li>";
        });
        topText += '</ol></div>';
        $("#ec3-b-bottom-cities").html(bottomText);
    }

    function ec3bBarChart(series, options) {
        // http://dev-mtc-vital-signs.pantheon.io/sites/all/themes/vitalsigns/js/t3t4b-new.js?nlq112
        $('#ec3-b-chart').highcharts({
            chart: {
                defaultSeriesType: 'bar'
            },
            series: series,
            exporting: {
                enabled: true
            },
            legend: {
                enabled: false
            },
            yAxis: {
                title: {
                    text: 'Unemployment Rate'
                },
                max:  16 // Max unemployment
            },
            xAxis: {
                categories: options.categories
            },
            title: {
                text: ''
            },
            tooltip: {
                shared: true,
                crosshairs: false,
                pointFormat: '<b>{point.y:.1f}%</b>'
            }
        });
    }

    function ec3bMapInteraction(event, feature) {
        // Create bar graph
        // showing the city unemployment rate compared to the county and the
        // region for 2013

        console.log("Got map interaction", event, feature);
        var cityName = feature.properties.NAME;
        var countyName = feature.properties.NAME_1 + " County";
        var county2013 = _.find(countyData, {
            'Year': FOCUSYEAR,
            Residence_Geo: countyName
        });

        var series = [
        {
            name: cityName + ' Unemployment Rate',
            data: [
                feature.properties.unemployment,
                county2013.Unemployment_Rate,
                regionData[regionData.length - 2]
            ]
        }];

        console.log("Data for graph", series);

        ec3bBarChart(series, {
            categories: [
                cityName,
                countyName,
                'Region'
            ]
        });
    }

    function ec3bSetupMapInteraction(feature, layer) {
        layer.on('click', function(event) {
            ec3bMapInteraction(event, feature);
        });
    }

    // Set up the interactive map
    function setupEC3B() {
        L.mapbox.accessToken = 'pk.eyJ1IjoicG9zdGNvZGUiLCJhIjoiWWdxRTB1TSJ9.phHjulna79QwlU-0FejOmw';
        var map = L.mapbox.map('map', 'postcode.kh28fdpk', {
            infoControl: true,
            attributionControl: false
        });
        L.control.scale().addTo(map);

        // Prep the city data
        var focusYearData = _.filter(cityData, {'Year': FOCUSYEAR});
        var joinedFeatures = [];
        var cities = [];
        _.each(geocities.features, function(feature, i) {
            var city = _.find(focusYearData, {
                Residence_Geo: feature.properties.NAME + " " // todo: cut space
            });
            if (city) {
                cities.push(city);
                feature.properties.unemployment = city.Unemployment_Rate;
                joinedFeatures.push(feature);
            }
        });
        geocities.features = joinedFeatures;

        // Display the city data based on breaks
        var breaks = getRange(cities, 'Unemployment_Rate');
        var cityLayer = L.geoJson(geocities, {
            onEachFeature: ec3bSetupMapInteraction,
            style: function(f) {
                var color;
                var u = f.properties.unemployment;
                if (u > breaks[3]) {
                    color = allGreen[4];
                } else if (u > breaks[2]) {
                    color = allGreen[3];
                } else if (u > breaks[1]) {
                    color = allGreen[2];
                } else if (u > breaks[0]) {
                    color = allGreen[1];
                } else {
                    color = allGreen[0];
                }
                // feature.properties.unemployment
                return {
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.8,
                  weight: 0.5
                };
            }
        }).addTo(map);
        map.fitBounds(cityLayer.getBounds());

        ec3bLeaderboard(focusYearData);
    }

    // Create graph EC-3, showing unemployment trend for US metro areas
    function setupEC3C() {
        // Group the metro data as needed
        var dataByMetro = _.groupBy(metroData, 'Residence_Geo');
        var series = [];
        _.each(dataByMetro, function(d, metro) {
            series.push({
                name: metro,
                data: _.pluck(d, 'Unemployment_Rate')
            });
        });
        series = _.sortBy(series, 'name');


        $('#ec3-c-chart').highcharts({
            chart: {
                type: 'line'
            },
            title: {
                text: 'Unemployment Rate of Major Metropolitan Areas'
            },
            xAxis: {
                categories: METROYEARNAMES
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Unemployment Rate'
                }
            },
            tooltip: {
                enabled: true,
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:,.1f}%</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            colors: altColors,
            series: series
        });
    }

    // Once we have the data, start setting up the various visualizations
    function setup() {
        console.log("Setting up with", cityData, countyData, regionData);
        setupEC3B();
        setupEC3C();

        graph('#ec3-a-chart', [{
            name: 'Regional Unemployment',
            data: regionData
        }]);

        var cities = _.uniq(cityData, 'Residence_Geo');
        var counties = _.uniq(countyData, 'Residence_Geo');
        var combined = _.sortBy(cities.concat(counties), 'Residence_Geo');

        // Set up select boxes for county / city search
        // Could potentially use a cascading combo box:
        // http://demos.telerik.com/kendo-ui/combobox/cascadingcombobox
        $("#ec3-a-city-select").kendoComboBox({
            text: "Select a city or county",
            dataTextField: "Residence_Geo",
            dataValueField: "Residence_Geo",
            dataSource: combined,
            select: selectLocation
        });
    }

    // Get all the data needed for the interactives in one go.
    function prepData(cityRaw, countyRaw, regionRaw, metroRaw) {
        regionData = [];
        _.each(regionRaw[0], function(r, i) {
            regionData.push(r.Unemployment_Rate);
        });

        cityData = cityRaw[0];
        countyData = countyRaw[0];
        metroData = metroRaw[0];
        setup();
    }

    // Request all the data
    var cityPromise = $.ajax({
        dataType: "json",
        url: "http://54.149.29.2/ec/3/city"
    });
    var countyPromise = $.ajax({
        dataType: "json",
        url: "http://54.149.29.2/ec/3/county"
    });
    var regionPromise = $.ajax({
        dataType: "json",
        url: "http://54.149.29.2/ec/3/region"
    });
    var metroPromise = $.ajax({
        dataType: "json",
        url: "http://54.149.29.2/ec/3/metro"
    });

    $.when(cityPromise, countyPromise, regionPromise, metroPromise).done(prepData);

}(jQuery));
