/*globals
jQuery, L, cartodb, geocities, geocounties, Highcharts, science, countylist,
regionPromise, cityPromiseT1, cityPromiseT2, countyPromiseT1, countyPromiseT2,
tractPromise,
altColors, allRed, allOrange, allBlue, allGreen, allYellow, allPurple, allGray
*/

(function($, _) {
    var currentVariable = 'DriveAlone_Est';
    var homeWork = "home";
    var tractData, cityData, cityDataWork, countyData, countyDataWork, regionData;

    var t1aRegionData;
    var t1aCountyData;
    var t2aCountyData;
    var t1aCityData;
    var t2aCityData;

    var variables = [
        'DriveAlone_Est',
        'Carpool_Est',
        'Transit_Est',
        'Walk_Est',
        'Bike_Est',
        'Telework_Est',
        'Other_Est'
    ];
    var variablesObj = {
        'DriveAlone_Est': {title: 'Drive Alone', hues: allRed},
        'Carpool_Est': {title: 'Carpool', hues: allOrange},
        'Transit_Est': {title: 'Transit', hues: allBlue },
        'Walk_Est': {title: 'Walk', hues: allGreen},
        'Bike_Est': {title: 'Bike', hues: allYellow},
        'Telework_Est': {title: 'Telecommute', hues: allPurple},
        'Other_Est': {title: 'Other', hues: allGray}
    };


    var ranges = {};

    var hues = [
        '#bdd7e7',
        '#6baed6',
        '#3182bd',
        '#08519c'
    ];

    function getRange(data, value) {
        var range = [];
        $.each(data, function(key, v) {
            if(v[value] != null) {
                range.push(v[value]);
            }
        });
        var breaks = science.stats.quantiles(range, [0, 0.25, 0.50, 0.75]);
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


    function changeLegend(quantiles, title, hues) {
        var div = $('.info.legend');
        $(div).empty();
        $(div).addClass("col-lg-12");
        $(div).append("<h5>" + variablesObj[title].title + "</h5>");

        // loop through our density intervals and generate a label with a
        // colored square for each interval
        var i;
        for (i = 0; i < quantiles.length; i++) {
            $(div).append('<div><div class="col-lg-1" style="background:' + variablesObj[title].hues[i] + ';">&nbsp; </div><div class="col-lg-8">' +
                Math.round(quantiles[i]*100)/100 + (Math.round(quantiles[i + 1]*100)/100 ? '&ndash;' + Math.round(quantiles[i + 1]*100)/100 + '</div>' : '+'));
        }
    }


    function setVariable(name, dataLayer) {
        currentVariable = name;
        var scale = [];
        $.each(ranges[name], function(i, range){
            scale.push(range);
        });

        changeLegend(scale, name, hues);

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
                q = -1;
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
                });
            }
        });
    }


    function sortTopTen(data, mode) {
        var sortData =[];
        $.each(data, function(index, value) {
            if(value[mode] !== null) {
                sortData[index] = [];
                sortData[index][mode] = [];
                sortData[index].City = [];
                sortData[index][mode].push(value[mode]);
                sortData[index].City.push(value.City);
             }
        });
         var sorted = sortData.sort(function (a, b) {
            return b[mode] - a[mode];
        });

        var topTenText = "<h4>Top Cities for " + variablesObj[mode].title + "</h4><div class='row'><div class='col-lg-6'>";
        $.each(sorted.slice(0,10), function(key, value) {
            if(key === 5) {
                topTenText += "</div><div class='col-lg-6'>";
            }
            topTenText += "<h6>" + (key * 1 + 1) + ". " + value.City + ": " + (Math.round(value[mode]*1000)/1000).toFixed(1) + "%</h6>";
        });
        topTenText += "</div>";
        $("#T1-T2-B-chart3").html(topTenText);
    }


    function joinData(data, layer, nameField, year) {
        var modes = [],
                name,
                newLayer = layer.toGeoJSON(),
                byName = {};

        var i;
        for (i = 0; i < newLayer.features.length; i++) {
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

        modes = variables;

        var j;
        for (j = 0; j < modes.length; j++) {
            var n = modes[j];
            var breaks = getRange(data, n);
            $.each(breaks, function(i, b) {
                ranges[n][i] = b;
            });
        }
        for (i = 0; i < data.length; i++) {
            name = data[i][nameField];
            if (name && (data[i].Year === year) && byName[name]) {
                byName[name].map(function (feature) {
                    feature.properties = data[i];
                });
            }
        }

        var newFeatures = _(byName).values().flatten().value();

        layer.setGeoJSON(newFeatures);
        setVariable(currentVariable, layer);
    }


    function pieChart(data, seriesName, seriesData, title, container, year, searchValue, searchTerm) {
        // Get the CSV and create the chart
        var options = {
            chart: {
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
        };
        var dataArray = [];
        options.series[0].data = [];
        jQuery.each(seriesData, function(key, name) {
            dataArray = [];
            jQuery.each(data, function(i,value) {
                if(value.Year === year && value[searchValue] === searchTerm) {
                    options.series[0].data.push([variablesObj[name].title, value[name]]);
                }
            });
        });
        options.title.text = title;
        var chart = new Highcharts.Chart(options);
    }

    zoomFilter("DriveAlone_Est");
    $('#autoButton').addClass("active");


    function ready() {
        var i;
        for (i = 0; i < variables.length; i++) {
            ranges[variables[i]] = {};
        }

        L.mapbox.accessToken = 'pk.eyJ1IjoicG9zdGNvZGUiLCJhIjoiWWdxRTB1TSJ9.phHjulna79QwlU-0FejOmw';

        var map = L.mapbox.map('map', undefined, {
                infoControl: true,
                attributionControl: false
        });

        var legendControl = new L.mapbox.legendControl();
        L.control.scale().addTo(map);

        legendControl.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend');
            $(div).addClass("col-lg-12");
            $(div).append("<h5>Drive Alone Percentage</h5>")
                return div;
        };
        legendControl.addTo(map);

        var basemap = L.mapbox.tileLayer('postcode.kh28fdpk').addTo(map);

        var flatCities = flatten(geocities);
        var cityLayer = L.mapbox.featureLayer(flatCities)
                .on('click', function(e) {
                    pieChart(cityData, "Year", variables, e.layer.feature.properties.City, "T1-T2-B-chart", 2013, "City", e.layer.feature.properties.City );
                })
                .addTo(map);

        var cityLayerWork = L.mapbox.featureLayer(flatCities)
                .on('click', function(e) {
                    pieChart(cityDataWork, "Year", variables, e.layer.feature.properties.City, "T1-T2-B-chart", 2013, "City", e.layer.feature.properties.City );
                 })
                .addTo(map);

        var flatCounties = flatten(geocounties);
        var countyLayer = L.mapbox.featureLayer(flatCounties)
                .on('click', function(e) {
                    pieChart(countyData, "Year", variables, e.layer.feature.properties.County + " County", "T1-T2-B-chart", 2013, "County", e.layer.feature.properties.County );
                })
                .addTo(map);


        var countyLayerWork = L.mapbox.featureLayer(flatCounties)
                .on('click', function(e) {
                pieChart(countyDataWork, "Year", variables, e.layer.feature.properties.County + " County", "T1-T2-B-chart", 2013, "County", e.layer.feature.properties.County )
                })
                .addTo(map);

        var flatTracts = flatten(tracts)
        var tractLayer = L.mapbox.featureLayer(flatTracts)
                .on('click', function(e) {
                    pieChart(tractData, "Year", variables, "Tract " + e.layer.feature.properties.Id2, "T1-T2-B-chart", 2013, "Id2", e.layer.feature.properties.Id2 );
                })
            .addTo(map);


        joinData(t1aCityData, cityLayer, "City", "2013");
        cityData = t1aCityData;

        joinData(t2aCityData, cityLayerWork, "City", "2013");
        cityDataWork = t2aCityData;

        joinData(t1aCountyData, countyLayer, "County", "2013");
        countyData = t1aCountyData;

        joinData(t2aCountyData, countyLayerWork, "County", "2013");
        countyDataWork = t2aCountyData;

        joinData(tractData, tractLayer, "Id2", "2013");

        pieChart(regionData, "Year", variables, "Region", "T1-T2-B-chart", 2013, "Residence_Geo", "Bay Area" );

        map.setView([37.7833, -122.4167], 10);

        map.on('viewreset', function() {
            if(map.getZoom() >= 13) {
                tractLayer.setFilter(function() { return true; });
                setVariable(currentVariable, tractLayer);
                countyLayer.setFilter(function() { return false; });
                cityLayer.setFilter(function() { return false; });
                cityLayerWork.setFilter(function() { return false; });
                sortTopTen(cityData, currentVariable);
            } else if (map.getZoom() === 10 || map.getZoom() === 11 || map.getZoom() === 12) {
                if(homeWork === "home") {
                    cityLayer.setFilter(function() { return true; });
                    setVariable(currentVariable, cityLayer);
                    sortTopTen(cityData, currentVariable);
                    cityLayerWork.setFilter(function() { return false; });
                } else {
                    cityLayerWork.setFilter(function() { return true; });
                    setVariable(currentVariable, cityLayerWork);
                    sortTopTen(cityDataWork, currentVariable);
                    cityLayer.setFilter(function() { return false; });
                }
                tractLayer.setFilter(function() { return false; });
                countyLayer.setFilter(function() { return false; });
                countyLayerWork.setFilter(function() { return false; });
            } else {
                if(homeWork === "home") {
                    countyLayer.setFilter(function() { return true; });
                    setVariable(currentVariable, countyLayer);
                    countyLayerWork.setFilter(function() { return false; });
                    tractLayer.setFilter(function() { return false; });
                    cityLayer.setFilter(function() { return false; });
                    cityLayerWork.setFilter(function() { return false; });
                    sortTopTen(cityData, currentVariable);
                } else {
                    countyLayerWork.setFilter(function() { return true; });
                    countyLayer.setFilter(function() { return false; });
                    setVariable(currentVariable, countyLayerWork);
                    tractLayer.setFilter(function() { return false; });
                    cityLayer.setFilter(function() { return false; });
                    cityLayerWork.setFilter(function() { return false; });
                    sortTopTen(cityDataWork, currentVariable);
                }

            }
        });

        function zoomFilter(mode) {
            if (map.getZoom() >= 10 && map.getZoom() < 13) {
                if(homeWork === "home") {
                    cityLayer.setFilter(function() { return true; });
                    setVariable(mode, cityLayer);
                    sortTopTen(cityData, mode);
                    cityLayerWork.setFilter(function() { return false; });
                } else {
                    cityLayerWork.setFilter(function() { return true; });
                    setVariable(mode, cityLayerWork);
                    sortTopTen(cityDataWork, mode);
                    cityLayer.setFilter(function() { return false; });
                }
                    tractLayer.setFilter(function() { return false; });
                    countyLayer.setFilter(function() { return false; });
                    countyLayerWork.setFilter(function() { return false; });
            } else if (map.getZoom() >= 13) {
                    tractLayer.setFilter(function() { return true; });
                    setVariable(mode, tractLayer);
                    countyLayer.setFilter(function() { return false; });
                    cityLayer.setFilter(function() { return false; });
                    cityLayerWork.setFilter(function() { return false; });
                    sortTopTen(cityData, mode);
            } else {
                if(homeWork === "home") {
                    countyLayer.setFilter(function() { return true; });
                    setVariable(mode, countyLayer);
                    countyLayerWork.setFilter(function() { return false; });
                    tractLayer.setFilter(function() { return false; });
                    cityLayer.setFilter(function() { return false; });
                    cityLayerWork.setFilter(function() { return false; });
                    sortTopTen(cityData, mode);
                } else {
                    countyLayerWork.setFilter(function() { return true; });
                    countyLayer.setFilter(function() { return false; });
                    setVariable(mode, countyLayerWork);
                    tractLayer.setFilter(function() { return false; });
                    cityLayer.setFilter(function() { return false; });
                    cityLayerWork.setFilter(function() { return false; });
                    sortTopTen(cityDatawork, mode);
                }
            }
        }

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
            $(this).siblings('a.button-mode').removeClass('active');
        });

        $("#homeButton").click(function() {
            $(this).addClass("active");
            $("#workButton ").removeClass("active");
            homeWork = "home";
            zoomFilter(currentVariable);
        });

        $("#workButton").click(function() {
            $(this).addClass("active");
            $("#homeButton ").removeClass("active");
            homeWork = "work";
            zoomFilter(currentVariable);
        });


        function loadData(url, geoLayer, nameField, year) {
            $.getJSON(url)
                .done(function(data) {
                    joinData(data, geoLayer, nameField, year);
                });
        }


    function prep(region, cityT1, cityT2, countyT1, countyT2, tract) {
        regionData = region[0];
        t1aCityData = cityT1[0];
        t2aCityData = cityT2[0];
        t1aCountyData = countyT1[0];
        t2aCountyData = countyT2[0];
        tractData = tract[0];

        ready();
    }

    $.when(
        regionPromise,
        cityPromiseT1,
        cityPromiseT2,
        countyPromiseT1,
        countyPromiseT2,
        tractPromise
    ).done(prep);


})(window.jQuery, window._);
