//MAP SCRIPT
var map;
var info = [];
var featureGroup,featureGroup2,featureGroup3;

(function($) {
    function formatNumber (num) {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
    }
    $.fn.updateChart = function(title,series_val,avg) {
        $('.Mpie').highcharts({
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false
            },
            title: {
                text: title
            },
            tooltip: {
                pointFormat: '<b>{point.percentage:.1f}%</b>'
            },
            colors: ['#3D9CC8','#EC7429'],
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false
                    },
                    size:150
                }
            },
            series: [{
                type: 'pie',
                name: '',
                data: series_val
            }]
        });
        $('.avg_').html(avg.toFixed(1));
        $('.average').show();
    };
    $(function() {
        var mapbounds;
        var hues = allOrange;
        var range = [];

        //CREATE MAP AND ADD BASEMAP LAYER for T1-T2-B
        map = L.map('map', {
            center: [37.783367, -122.062378],
            zoom: 9,
            minZoom: 8,
            fullscreenControl: true
        });

        //Tiled layer
        L.mapbox.accessToken = 'pk.eyJ1IjoicG9zdGNvZGUiLCJhIjoiWWdxRTB1TSJ9.phHjulna79QwlU-0FejOmw';
        var basemap = L.mapbox.tileLayer('postcode.kh28fdpk').addTo(map);



        var results = new L.LayerGroup().addTo(map);

        //Set map bounds for the reload map button
        mapbounds = map.getBounds();

        featureGroup = L.featureGroup().addTo(map);
        featureGroup2 = L.featureGroup();//.addTo(map);
        featureGroup3 = L.featureGroup();//.addTo(map);

        //Feature layer for updating infopanel
        sub = L.esri.featureLayer('http://gis.mtc.ca.gov/mtc/rest/services/VitalSigns/LU_Features/FeatureServer/4', {
            style: function() {
                return {

                };
            }
        });
        sub.on('load', function(e) {

            $.each(e.target._layers, function(i, layer) {

                //Escondemos el layer
                layer._removeIcon();
                layer._removeShadow();
                layer.off();

                var coords = [layer._latlng.lat, layer._latlng.lng];
                var radius = Math.round(layer.feature.properties.AVG_1990s/50);
console.log(layer.feature.properties);

                var color = "#3D9CC8";
                var c = layer.feature.properties.SFUNITS_1990s/(layer.feature.properties.SFUNITS_1990s+layer.feature.properties.MFUNITS_1990s)*100;
                if(c>50){
                    color = "#EC7429";
                }

                var circle_options = {
                    opacity: 0,
                    weight: 10,         // Stroke weight
                    fillColor: color,  // Fill color
                    fillOpacity: 1,    // Fill opacity
                    radius: radius+5
                };

                if(layer.feature.properties.NAME!="Clayton" && layer.feature.properties.NAME!="Lafayette" && layer.feature.properties.NAME!="Moraga" && layer.feature.properties.NAME!="Orinda" ) {
                    var circle_one = L.circleMarker(coords, circle_options).addTo(featureGroup);
                    circle_one.on('click', function (e) {
                        var array_ = [
                            ["Multi Family", layer.feature.properties.MFUNITS_1990s],
                            ["Single Family", layer.feature.properties.SFUNITS_1990s]
                        ];
                        //console.log(layer.feature.properties);
                        $(this).updateChart(layer.feature.properties.NAME, array_, layer.feature.properties.AVG_1990s);
                    });
                }


                /*
                radius = 0;
                val = layer.feature.properties.AVG_2000s;
                if(val<=50){
                    radius = 5;
                }else if(val>50 && val<=100){
                    radius = 10;
                }else if(val>100 && val<=500){
                    radius = 15;
                }else if(val>500){
                    radius = 20;
                }
                */

                color = "#3D9CC8";
                var c = layer.feature.properties.SFUNITS_2000s/(layer.feature.properties.SFUNITS_2000s+layer.feature.properties.MFUNITS_2000s)*100;
                if(c>50){
                    color = "#EC7429";
                }

                radius = Math.round(layer.feature.properties.AVG_2000s/50);
                var circle_options2 = {
                    opacity: 0,
                    weight: 10,         // Stroke weight
                    fillColor: color,  // Fill color
                    fillOpacity: 1,    // Fill opacity
                    radius: radius+5
                };

                if(layer.feature.properties.NAME!="Clayton" && layer.feature.properties.NAME!="Lafayette" && layer.feature.properties.NAME!="Moraga" && layer.feature.properties.NAME!="Orinda" ) {
                    var circle_one2 = L.circleMarker(coords, circle_options2).addTo(featureGroup2);
                    circle_one2.on('click', function (e) {
                        var array_ = [
                            ["Multi Family", layer.feature.properties.MFUNITS_2000s],
                            ["Single Family", layer.feature.properties.SFUNITS_2000s]
                        ];
                        $(this).updateChart(layer.feature.properties.NAME, array_, layer.feature.properties.AVG_2000s);
                    });
                }



                /*
                radius = 0;
                val = layer.feature.properties.AVG_2010s;
                if(val<=50){
                    radius = 5;
                }else if(val>50 && val<=100){
                    radius = 10;
                }else if(val>100 && val<=500){
                    radius = 15;
                }else if(val>500){
                    radius = 20;
                }
                */

                color = "#3D9CC8";
                var c = layer.feature.properties.SFUNITS_2010s/(layer.feature.properties.SFUNITS_2010s+layer.feature.properties.MFUNITS_2010s)*100;
                if(c>50){
                    color = "#EC7429";
                }
                radius = Math.round(layer.feature.properties.AVG_2010s/50);

                var circle_options3 = {
                    opacity: 0,
                    weight: 10,         // Stroke weight
                    fillColor: color,  // Fill color
                    fillOpacity: 1,    // Fill opacity
                    radius: radius+5
                };
                var circle_one3 = L.circleMarker(coords, circle_options3).addTo(featureGroup3);
                circle_one3.on('click', function (e) {
                    var array_ = [
                        ["Multi Family", layer.feature.properties.MFUNITS_2010s],
                        ["Single Family", layer.feature.properties.SFUNITS_2010s]
                    ];
                    //console.log(layer.feature.properties);
                    $(this).updateChart(layer.feature.properties.NAME, array_, layer.feature.properties.AVG_2010s);
                });

            });
        }).addTo(map);


        //We add the legend
        var legendControl = new L.mapbox.legendControl();
        L.control.scale().addTo(map);

        legendControl.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend col-lg-3 col-sm-3 col-xs-4');
            $(div).append("<h5></h5>");
            return div;
        };
        legendControl.addTo(map);


        $('#mbtn1').click(function(){
            $(this).addClass("active")
            $(this).siblings('a').removeClass('active');
            map.removeLayer(featureGroup2);
            map.removeLayer(featureGroup3);
            map.addLayer(featureGroup);

            $('.top2,.top3').hide();
            $('.top1').show();
            $('.average').hide();

            var uniqueNames = [];
            $.each(info, function(i, el){
                if($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
            });
            changeLegend();
        });

        $('#mbtn2').click(function(){
            $(this).addClass("active")
            $(this).siblings('a').removeClass('active');
            map.removeLayer(featureGroup);
            map.removeLayer(featureGroup3);
            map.addLayer(featureGroup2);

            $('.top1,.top3').hide();
            $('.top2').show();

            $('.average').hide();

        });
        $('#mbtn3').click(function(){
            $(this).addClass("active")
            $(this).siblings('a').removeClass('active');
            map.removeLayer(featureGroup);
            map.removeLayer(featureGroup2);
            map.addLayer(featureGroup3);

            $('.top2,.top1').hide();
            $('.top3').show();
            $('.average').hide();
        });

        $('#mbtn1').click();

        // Add ArcGIS Online basemap
        L.esri.basemapLayer("Gray").addTo(map);
    });

    function changeLegend() {
        //console.log(quantiles);
        var div = $('.info.legend')
        $(div).empty();
        $(div).append($('#c_cont').html());
    }

})(jQuery);

/*
 [2877.7, 205.7, 196.2, 158.5, 14.2, 277.7, 302.3, 8.5, 284.4, 41.6, 71.5, 109.5, 131.3, 15.5, 18.9, 2, 409.8, 333.1111111111111, 181.7, 87, 16.7, 27, 478, 1.9, 30.6, 229.1, 17.2, 103.8, 739.5, 1450.3, 2.4, 14.6, 156.4, 7.2, 248.5, 38, 17.7, 2.1, 30.7, 78.8, 68.7, 44.1, 277.8, 11.1, 43.7, 176.9, 55.5, 7.9, 252.7, 88, 10.1, 4.3, 281.5, 806.3, 97, 483.3, 37.6, 27.1, 135, 159.8, 273.2, 236.4, 58.7, 749.6, 242, 89.8, 85.2, 4.4, 27.8, 34.8, 421.7, 190, 127.9, 57.2, 68.9, 84.1, 17.5, 83.4, 32.1, 56.6, 22.9, 308.2, 31.75, 531.9, 53.7, 520.3, 26.4, 70.1, 3.3, 176.7, 329.4, 23.1, 372, 1171.9, 168.7, 123.5, 151.4, 142.9, 50.3, 42.7, 536.1, 16.1, 474.5]
 [2832.7, 138.7, 162.2, 117.3, 13.3, 490, 210.5, 8.4, 287.5, 10.9, 72.4, 194.8, 196.3, 17.1, 6.6, 8.9, 189.4, 56.9, 253.7, 37.6, 10.1, 49.2, 370.6, 2.2, 16, 59.2, 9.8, 124.9, 11.5, 459.1, 2177.8, 1.9, 9.4, 81.5, 2.5, 8.6, 640.5, 73.8, 16.2, 186, 71.4, 23.9, 178.9, 16.8, 64.9, 34.2, 89.9, 44.4, 9.9, 231.7, 77.7, 10.6, 110.7, 219.3, 807.8, 140, 599.9, 47.4, 34.4, 86.2, 96, 276.7, 321.4, 209.7, 309.5, 158.4, 70.1, 24, 11.6, 19.5, 30.5, 190.5, 230.6, 158.9, 192.8, 206, 72.6, 5.2, 53.4, 82.8, 60.1, 39.7, 51.7, 260.2, 1007.8, 25.6, 934.1, 26.8, 75.6, 0, 2.1, 15.5, 366.2, 259.8, 60.8, 329, 182.5, 1456.4, 86.1, 87.9, 238.7, 128.6, 50.8, 11, 374, 13.8, 445.5]
 [2692.75, 113.75, 360.5, 7, 18.5, 208.5, 440.75, 2, 234.5, 11.5, 49, 4.25, 44.5, 12, 5, 0, 166.75, 17.25, 41.5, 2.5, 45.5, 0.5, 146.75, 0.75, 14.25, 233.25, 138.75, 36, 177.75, 2807, 13.75, 1.75, 1.25, 696.25, 31.5, 3.25, 243.5, 21.75, 3.5, 252.75, 24.5, 123.5, 50.5, 5.75, 95, 6.5, 47.5, 300.5, 32.5, 203, 75.25, 9.25, 30, 162.75, 24, 54.5, 346.5, 28.75, 3.75, 35.75, 222.25, 149.75, 155.5, 59.25, 11.25, 4, 41.25, 4.5, 18.25, 22.5, 437, 261, 23.5, 24.75, 1, 165, 539.5, 178.25, 49.5, 564.75, 15, 32.75, 48.75, 109, 12.5, 7.75, 131, 199.5]
 */