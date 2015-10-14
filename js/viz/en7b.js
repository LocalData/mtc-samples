/*globals
jQuery, L, geocities, econColors, altColors, Highcharts, turf, chroma,
regionPromise, countyPromise, cityPromise, _, cartodb
*/
(function($) {
    /*
    Map showing injuries across the region - when at a higher level of zoom, a
    heat map should be shown, while at a lower zoom level the individual points
    can be presented to the user. 2012 year should be displayed for sure; please
    investigate the feasibility of showing multiple historical years as well
    (preferably all at once to create a more accurate distribution). Use
    per-capita-ization based on population to avoid the "high population" bias
    issue, but clip out unpopulated areas to avoid a "small denominator" issue.
    Develop heat map based on census tract population. Color code points based o
    n mode of transport (car, bike, etc.) of victim. User should be able to click
    on a point or a zone and get more information about the incident or the risk
    in the given zone.

    Develop heat map based on census tract population. Color code points based
    on mode of transport (car, bike, etc.) of victim. User should be able to
    click on a point or a zone and get more information about the incident or
    the risk in the given zone.

    MISC

    TODO

    REQUESTS

    */

    $(function(){
        //var CHART_BASE_TITLE = 'Historical Trend for Labor Force Participation by Age Group';
        var MAP_TITLE = 'Injuries from Crashes';

        // Chart Settings
        var CHART_ID = '#en-b-chart';
        var CHART_BASE_TITLE = '';
        var Y_LABEL = 'Injuries per 100,000 Residents';
        var YEAR_KEY = 'Year';
        var FOCUS_KEY = 'Rate of SevInj Per 100k Pop';

        // A null for every year we don't have tract data (2001-2007)
        var NULL_YEARS = [null, null, null, null, null, null, null];
        var years = [];

        // The raw data uses numbers to refer to months
        var MONTHS = {
            1: 'January',
            2: 'February',
            3: 'March',
            4: 'April',
            5: 'May',
            6: 'June',
            7: 'July',
            8: 'August',
            9: 'September',
            10: 'October',
            11: 'November',
            12: 'December'
        };

        var CITY_KEY = 'City';
        var CITY_FEATURE_KEY = 'NAME';
        var COUNTY_KEY = 'County';
        var TRACT_KEY = 'Tract';

        var BIKE_KEY = 'BICCOL';
        var BIKE_COLOR = altColors[0];

        var PED_KEY = 'PEDCOL';
        var PED_COLOR = altColors[1];

        var CAR_KEY = 'MCCOL';
        var TRUCK_KEY = 'TRUCKCOL';
        var VEHICLE_COLOR = altColors[3];

        var TRACT_MIN_ZOOM = 8;
        var TRACT_MAX_ZOOM = 13;
        var POINT_MIN_ZOOM = 13;

        // Red-oranges
        var COLORS = [
            '#EA9E77',
            '#E19063',
            '#EC7429',
            '#BD5D21',
            '#843F1D'
        ];

        // Quintiles (rounded slightly)
        var BREAKS = [
            0,
            0.00131191,
            0.00232558,
            0.00397847,
            0.00712808
        ];

        var map;
        var activeLayer = {};
        var tractLayer, pointLayer;
        var year = 2012;

        var cartoCSSTemplate = _.template($('#template-carto').html());
        var mapLegendTemplate = _.template($('#template-map-legend').html());

        var point_styles = {
            radius: 5,
            fillColor: "#ff7800",
            color: "#fff",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.65
        };

        var i;
        var regionData;
        var selectedGeography = 'Bay Area';

        Highcharts.setOptions({
            lang: {
                decimalPoint: '.',
                thousandsSep: ','
            }
        });


        function formatter() {
            if (this.value === 'Bay Area') {
                return '<span style="font-weight:800;color:#000;">' + this.value + '</span>';
            }
            return this.value;
        }


        // Set up the tract legend
        var tractLegendControl = new L.control({
            position: 'bottomright'
        });
        tractLegendControl.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend');
            $(div).addClass("col-lg-12");
            $(div).append("<h5>Injuries from Crashes Per 100,000 Residents<br></h5>");

            // loop through our density intervals and generate a label
            // with a colored square for each interval
            var i;
            for (i = 0; i < BREAKS.length; i++) {
                var s = '<div class="legend-row"><div class="legend-color" style="background:' + COLORS[i] + ';">&nbsp; </div><div class="legend-text">';
                var currentBreak = Math.round(BREAKS[i] * 100);

                // If this is the first break
                if (i === 0) {
                    s += currentBreak.toLocaleString() + ' - ' + Math.round(BREAKS[i+1] * 100).toLocaleString();
                }

                // If this is not the last break and not the first
                if (i !== BREAKS.length - 1 && i !== 0) {
                    s += currentBreak.toLocaleString() + ' - ' + Math.round(BREAKS[i+1] * 100).toLocaleString();
                }

                // If this is the last break
                if (i === BREAKS.length - 1) {
                    s += currentBreak.toLocaleString() + '+</div>';
                }

                $(div).append(s);
            }

            return div;
        };


        // Set up the point legend
        var pointLegendControl = new L.control({
            position: 'bottomright'
        });
        pointLegendControl.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend');
            $(div).addClass("col-lg-12");
            // $(div).append("<h5>Mode of transportation<br></h5>");

            var s = '<div class="legend-row"><div class="legend-color" style="background:' + PED_COLOR + ';">&nbsp; </div><div class="legend-text">Pedestrian injured</div>';
            s += '<div class="legend-row"><div class="legend-color" style="background:' + BIKE_COLOR + ';">&nbsp; </div><div class="legend-text">Bicyclist injured</div>';
            s += '<div class="legend-row"><div class="legend-color" style="background:' + VEHICLE_COLOR + ';">&nbsp; </div><div class="legend-text">Unclassified</div>';

            $(div).append(s);
            return div;
        };


        // Hide / show a specific legend based on zoom
        function setupLegend() {
            try {
                tractLegendControl.removeFrom(map);
            } catch(tractLegendRemoveError) {
                // noop
            }

            try {
                pointLegendControl.removeFrom(map);
            } catch(pointLegendRemoveError) {
                // noop
            }

            if (map.getZoom() >= POINT_MIN_ZOOM) {
                pointLegendControl.addTo(map);
            } else {
                tractLegendControl.addTo(map);
            }
        }


        /*
        Convert times like 1500 to "3:00pm"
         */
        function stringifyHours(time) {
            if (time === 1200) {
                return 'Noon';
            }

            if (time === 2400) {
                return 'Midnight';
            }

            if (time > 1200) {
                time = (time - 1200) / 100;
                return time + ':00 PM';
            }

            time = time / 100;
            return time + ':00 AM';
        }


        // Handle clicks on points
        function interaction(event, feature) {
            var p = feature.properties;

            feature.properties.time = stringifyHours(feature.properties.TIMECAT);

            $('#en-b-chart').html(mapLegendTemplate({
                data: feature.properties,
                months: MONTHS
            }));
        }


        function setupInteraction(feature, layer) {
            layer.on('click', function(event) {
                interaction(event, feature);
            });
        }


        function getStyle(feature) {
            var color, u;
            var properties = feature.properties;

            if (properties.PEDCOL) {
                color = PED_COLOR;
            }

            if (properties.BICCOL) {
                color = BIKE_COLOR;
            }

            if (!properties.PEDCOL && !properties.BICCOL) {
                color = VEHICLE_COLOR;
            }

            return {
              color: '#fff',
              fillColor: color,
              fillOpacity: 0.9,
              radius: 4
            };
        }


        function pointToLayer(feature, latlng) {
            var style = getStyle(feature);

            return L.circleMarker(latlng, style);
        }


        function getSeries(data) {
            var series = [{
                name: 'Bay Area',
                data: _.pluck(regionData, FOCUS_KEY)
            }, {
                name: 'Tract ' + data.geoid10,
                data: NULL_YEARS.concat([
                    data.en_ped_injured_per_2008,
                    data.en_ped_injured_per_2009,
                    data.en_ped_injured_per_2010,
                    data.en_ped_injured_per_2011,
                    data.en_ped_injured_per_2012
                ])
            }];

            return series;
        }


        function chart(data) {
            var tooltip = {
                headerFormat: '<span style="font-size:10px">{point.key} Injuries from Crashes per 100,00 Residents</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:,.1f}</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            };

            var series = getSeries(data);

            var options = {
                chart: {
                    type: 'line'
                },
                title: {
                    text: CHART_BASE_TITLE
                },
                xAxis: {
                    categories: years,
                    tickmarkPlacement: 'on',
                    labels: {
                        step: 3
                    }
                },
                yAxis: {
                    title: {
                        text: Y_LABEL
                    },
                    min: 0,
                    reversedStacks: true,
                    stackLabels: {
                        enabled: false
                    }
                },
                legend: {
                    enabled: true
                },
                colors: altColors,
                plotOptions: {
                    line: {
                         events: {
                            legendItemClick: function () {
                                return false;
                            }
                        }
                    }
                },
                tooltip: tooltip,
                series: series
            };

            // Don't explicitly set step size on smaller screens
            if (window.innerWidth < 650) {
                delete options.xAxis.labels.step;
            }

            $(CHART_ID).highcharts(options);
        }


        function tractsLoaded(layer) {
            tractLayer = layer; //.getSubLayer(0);
            var tractSubLayer = tractLayer.getSubLayer(0);

            // Add cursor interaction
            tractSubLayer.setInteraction(true);
            cartodb.vis.Vis.addCursorInteraction(map, tractSubLayer);

            // Show the tract when cursor is l
            tractSubLayer.on('featureClick', function(event, latlng, pos, data, layerIndex) {
                chart(data);
            });

            // Listen for zoom changes and remove the layer if we are
            // zoomed far enough in.
            map.on('zoomend', function (event) {
                setupLegend();

                var zoom = event.target.getZoom();
                if (zoom >= TRACT_MAX_ZOOM) {
                    map.removeLayer(tractLayer);
                } else if (!map.hasLayer(tractLayer)) {
                    tractLayer.addTo(map);
                }
            });

            // Update the map after the slider is changed
            function update(e) {
                year = e.value;

                // Update the map title
                $('#map_title').html(year + ' ' + MAP_TITLE);

                // Update the tract layer
                tractSubLayer.set({
                    sql: "SELECT * FROM ec_tracts",
                    cartocss: cartoCSSTemplate({ year: year })
                });

                // Update the point layer
                pointLayer.setWhere('SEVINJ > 0 AND YEAR_=' + year);
            }

            // Set up the year slider
            var slider = $("#en-b-select").kendoSlider({
                min: 2008,
                max: 2012,
                tickPlacement: "none",
                change: update,
                slide: update,
                value: year,
                tooltip: {
                    template: function(e) {
                        return e.value;
                    }
                }
            });

        }


        function setupTracts() {
            // Add the tract layer
            var cdbTracts = cartodb.createLayer(map, {
              user_name: 'mtc',
              cartodb_logo: false,
              type: 'cartodb',
              sublayers: [{
                sql: "SELECT * FROM ec_tracts",
                cartocss: cartoCSSTemplate({ year: year }),
                interactivity: "geoid10, en_ped_injured_per_2008, en_ped_injured_per_2009, en_ped_injured_per_2010, en_ped_injured_per_2011, en_ped_injured_per_2012"
              }]
            })
            .addTo(map)
            .done(tractsLoaded);
        }


        function setupPoints() {
            pointLayer = L.esri.featureLayer('http://gis.mtc.ca.gov/mtc/rest/services/VitalSigns/EN4_9_Safety/FeatureServer/0', {
                cacheLayers: false,
                radius: 25,
                max: 2500000,
                onEachFeature: setupInteraction,
                fields: [
                    'OBJECTID',
                    'CITY',
                    'COUNTY',
                    'STATE',
                    BIKE_KEY,
                    PED_KEY,
                    CAR_KEY,
                    TRUCK_KEY,
                    'ETOH',
                    'PRIMARYRD',
                    'SECONDRD',
                    'CRASHSEV',
                    'VIOLCAT',
                    'KILLED',
                    'INJURED',
                    'YEAR_',
                    'MONTH_',
                    'TIMECAT',
                    'PEDKILL',
                    'PEDINJ',
                    'BICKILL',
                    'BICINJ',
                    'MCKILL',
                    'MCINJURE'
                ],
                pointToLayer: pointToLayer,
                minZoom: POINT_MIN_ZOOM,
                where: 'SEVINJ > 0 AND YEAR_ = ' + year

            }).addTo(map);
        }


        function setupMap() {
            $('#map_title').html(year + ' ' + MAP_TITLE);

            map = L.map('map', {
                infoControl: true,
                attributionControl: false,
                scrollWheelZoom: false,
                center: [37.809911,-122.402115],
                zoom: 9,
                minZoom: 8
            });

            var baseLayer = L.tileLayer('http://a.tiles.mapbox.com/v3/postcode.mna0lfce/{z}/{x}/{y}.png');
            baseLayer.addTo(map);

            L.control.scale().addTo(map);

            setupPoints();
            setupTracts();

            setupLegend();
        }

        function setupNumbers(d) {
            var i;
            // for(i = 0; i < d.length; i++) {
            //     d[i][FOCUS_KEY] = percent(d[i][FOCUS_KEY]);
            // }
            return d;
        }

        // Load the base data.
        var localTotalsPromise = $.ajax({
            dataType: "json",
            url: "http://vitalsigns-production.elasticbeanstalk.com/en/8/region"
        }).done(function(data) {
            regionData = data;
            years = _.uniq(_.pluck(regionData, YEAR_KEY));
            setupMap();
        });

    });
})(jQuery);
