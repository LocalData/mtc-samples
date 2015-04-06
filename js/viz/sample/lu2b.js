//MAP SCRIPT
var map;
var type = 1,loaded=1;
(function($) {
    function formatNumber (num) {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
    }
    $(function() {
        var mapbounds;
        var hues = allOrange;
        var range = [];
        var range2 = [];

        //CREATE MAP AND ADD BASEMAP LAYER for T1-T2-B
        map = L.map('map', {
            center: [37.783367, -122.062378],
            zoom: 9,
            minZoom: 8,
            fullscreenControl: true
        });

        var results = new L.LayerGroup().addTo(map);

        //Set map bounds for the reload map button
        mapbounds = map.getBounds();

        // Add ArcGIS Online basemap
        L.esri.basemapLayer("Gray").addTo(map);


        //Feature layer for updating infopanel
        sub = L.esri.featureLayer('http://gis.mtc.ca.gov/mtc/rest/services/VitalSigns/LU_Features/FeatureServer/2', {
            onEachFeature: onEachFeature2,
            style: function() {
                return {
                    color: '#FF0000',
                    opacity: 1
                };
            }
        });
        sub.on('load', function(e) {
            //var ranges = science.stats.quantiles(range, [0, .25, .50, .75]);
            //var ranges2 = science.stats.quantiles(range2, [0, .25, .50, .75]);
            var ranges = [13600,50900,98900,227800,350000];

            changeLegend(ranges, "Number of Jobs", hues);

            $.each(e.target._layers, function(i, layer) {
                var q;
                var val = layer.feature.properties.Estimate_2013;

                if (val >= ranges[4]) {
                    q = 4
                } else if(val >= ranges[3] && val<ranges[4]) {
                    q = 3
                } else if(val >= ranges[2] && val<ranges[3]) {
                    q = 2
                } else if(val >= ranges[1] && val < ranges[2]) {
                    q = 1
                } else if(val >= ranges[0] && val < ranges[1]) {
                    q = 0
                } else {
                    q = -1
                }
                if(q > -1) {
                    layer.setStyle({
                        fillColor: hues[q],
                        fillOpacity: 0.8,
                        weight: 0.5,
                        color: '#666',
                        dashArray: ''
                    });
                } else {
                    layer.setStyle({
                        fillColor: '#ffffff',
                        fillOpacity: 0,
                        weight: 0
                    });
                }
            });

        }).addTo(map);


        //Tiled layer
        L.mapbox.accessToken = 'pk.eyJ1IjoicG9zdGNvZGUiLCJhIjoiWWdxRTB1TSJ9.phHjulna79QwlU-0FejOmw';
        var basemap = L.mapbox.tileLayer('postcode.kh28fdpk').addTo(map);



        //We add the legend
        var legendControl = new L.mapbox.legendControl();
        L.control.scale().addTo(map);

        legendControl.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend')
            $(div).addClass("col-lg-10")
            $(div).append("<h5></h5>")
            return div;
        };
        legendControl.addTo(map);

        function onEachFeature2(feature, layer) {
            layer.on({
                //mouseover: mouseoverUpdate,
                click: clickUpdate
            });
            var val = layer.feature.properties.Estimate_2013/100000;
            range.push(val);
            range2.push(layer.feature.properties.Estimate_2013);
        }

        function clickUpdate(e) {

            //console.log(e.target.feature.properties);
            $('.initial_map').hide();
            $('.description_').show();
            var val =e.target.feature.properties.Estimate_2013;
            $('.stext').html(formatNumber(val));
            $('.jtext').html(e.target.feature.properties.Name);

        }

        function style(feature) {
            return {
                opacity: 0
            };
        }


        function reloadMap() {
            map.fitBounds(mapbounds);
        }

    });

    function changeLegend(quantiles, title, hues) {
        var div = $('.info.legend')
        $(div).empty()
        $(div).addClass("col-lg-12")
        $(div).append("<h5>"+title+"</h5>")
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < quantiles.length; i++) {
            $(div).append('<div><div class="col-lg-1" style="background:' + hues[i] + ';">&nbsp; </div><div class="col-lg-8">' +
            formatNumber(Math.round(quantiles[i]*100)/100) + (Math.round(quantiles[i + 1]*100)/100 ? '&ndash;' + formatNumber(Math.round(quantiles[i + 1]*100)/100) + '</div>' : '+'));
        }
    }
})(jQuery);