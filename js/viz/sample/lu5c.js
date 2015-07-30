//MAP SCRIPT
var mapt9b;
var type = 1,loaded=1;
var sub,s92,s94,s96,s98,s00,s02,s04,s06,s08,s10,s12;
var year_ = 2012;
var layersByYear = {};
(function($) {
    function formatNumber (num) {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
    }
    $(function() {
        var mapbounds;

        //CREATE MAP AND ADD BASEMAP LAYER for T1-T2-B
        mapt9b = L.map('map', {
            center: [37.505275, -121.929203],
            zoom: 10,
            minZoom: 8,
            fullscreenControl: true
        });
        //Tiled layer
        var baseLayer = L.tileLayer('http://a.tiles.mapbox.com/v3/matth.map-zmpggdzn/{z}/{x}/{y}.png');
        mapt9b.addLayer(baseLayer);
        var allLayers = 'http://gis.mtc.ca.gov/mtc/rest/services/VitalSigns/LU5_Greenfield_1992_2012/MapServer/11/query';

        // When the map is clicked, display the development year.
        mapt9b.on('click', function(event) {
            var options = {
                f: 'json',
                geometryType: 'esriGeometryPoint',
                inSR: '4326',
                outFields: '*',
                spatialRel: 'esriSpatialRelIntersects',
                geometry: event.latlng.lng + ',' + event.latlng.lat
            };

            $.get(allLayers, options).done(function(response) {
                var data = JSON.parse(response);
                // If we got data, let's open a popup
                if (data.features.length > 0) {
                    var year = data.features[0].attributes.YEAR;
                    if(year==1990){
                        $('.year_info').html("This area was developed before <strong>1990</strong>.");
                    }else{
                        if(year<=year_) {
                            $('.year_info').html("This area was developed by <strong>" + year + "</strong>.");
                        }else{
                            $('.year_info').html("This area was not developed.");
                        }
                    }
                }else{
                    $('.year_info').html("This area was not developed.");
                }
            });
        });

        //We add the legend
        var legendControl = new L.mapbox.legendControl();
        L.control.scale().addTo(mapt9b);

        legendControl.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend col-lg-9 col-sm-9 col-xs-9');
            $(div).append("<h5></h5>");
            return div;
        };
        legendControl.addTo(mapt9b);


        var results = new L.LayerGroup().addTo(mapt9b);

        //Set map bounds for the reload map button
        mapbounds = mapt9b.getBounds();

        // Add ArcGIS Online basemap
        L.esri.basemapLayer("Gray").addTo(mapt9b);

        // Add the pre-1990 layer
        $.ajax({
            url: 'https://localdata.cartodb.com/api/v1/map',
            type: 'GET',
            dataType: 'jsonp',
            data: {
                config: JSON.stringify({
                    version: '1.0.1',
                    layers:[{
                        type:'cartodb',
                        options:{
                            sql: 'select * from lu5_greenfield_1990',
                            cartocss: '#lu5_greenfield_1990 { polygon-fill: #9fa1a4; } ',
                            cartocss_version: '2.1.1',
                            interactivity: ['cartodb_id']
                        }
                    }]
                })
            }
        }).done(function(data) {
            var url = 'https://' + data.cdn_url.https +
                '/localdata/api/v1/map/' + data.layergroupid +
                '/{z}/{x}/{y}.png';
            var layer = L.tileLayer(url);
            layer.addTo(mapt9b);
        });

        // Define the years and colors we'll want to add.
        var layerDefs = [{
                year:  '1992',
                color: '#EBBD2F'
            },
            {
                year:  '1994',
                color: '#EBBD2F'
            },
            {
                year:  '1996',
                color: '#EBBD2F'
            },
            {
                year:  '1998',
                color: '#EBBD2F'
            },
            {
                year:  '2000',
                color: '#EBBD2F'
            },
            {
                year:  '2002',
                color: '#0C8EC5'
            },
            {
                year:  '2004',
                color: '#0C8EC5'
            },
            {
                year:  '2006',
                color: '#0C8EC5'
            },
            {
                year:  '2008',
                color: '#0C8EC5'
            },
            {
                year:  '2010',
                color: '#0C8EC5'
            },
            {
                year:  '2012',
                color: '#C32726'
            }];


        // Start loading all the layers
        var tileSets = [];
        var i;
        for (i = 0; i < layerDefs.length; i++) {
            var layer = 'lu5_greenfield_' + layerDefs[i].year;

            // Set up the request to get the tiles
            var p = Promise.resolve($.ajax({
                url: 'https://localdata.cartodb.com/api/v1/map',
                type: 'GET',
                dataType: 'jsonp',
                data: {
                    config: JSON.stringify({
                        version: '1.0.1',
                        layers:[{
                            type:'cartodb',
                            options:{
                                sql: 'select * from ' + layer,
                                cartocss: '#' + layer + ' { polygon-fill: ' + layerDefs[i].color + '; } ',
                                cartocss_version: '2.1.1',
                                interactivity: ['cartodb_id']
                            }
                        }]
                    })
                }
            }));

            tileSets.push(p);
        }

        // Load all the layers (but don't add them to the map until we need them)
        Promise.all(tileSets).then(function(data) {

           // Create each of the layers.
            for (i = 0; i < data.length; i++) {
                var url = 'https://' + data[i].cdn_url.https +
                    '/localdata/api/v1/map/' + data[i].layergroupid +
                    '/{z}/{x}/{y}.png';
                var layer = L.tileLayer(url);

                // Save the layers by year
                var year = layerDefs[i].year;
                layersByYear[year] = layer;
                layer.addTo(mapt9b);
            }
            // Add 1992 to the map
        });

        function onEachFeature2(feature, layer) {
            layer.on({
                //mouseover: mouseoverUpdate,
                click: clickUpdate
            });
        }

        function clickUpdate(e) {
            //console.log(e.target.feature.properties);
            if(e.target.feature.properties.YEAR==1990){
                $('.year_info').html("This area was developed before 1990.");
            }else{
                $('.year_info').html("This area was developed by "+e.target.feature.properties.YEAR+".");
            }
        }



        //DEFINE SLIDER AND ASSOCIATED FUNCTIONS
        var t9btimeslider = $("#t9btimeslider").kendoSlider({
            increaseButtonTitle: "Right",
            decreaseButtonTitle: "Left",
            min: 1990,
            max: 2012,
            smallStep: 2,
            largeStep: 2,
            tickPlacement: "none",
            change: sliderChanget9b,
            slide: sliderChanget9b,
            value: 2012,
            tooltip: {
                enabled: false
            }
        }).data("kendoSlider");

        function sliderChanget9b(e) {
            //console.log(e.value);
            var val =t9btimeslider.value();
            $('.year').html(val);

            year_ = val;

            for(i=1992;i<=val;i=i+2) {
                if(!mapt9b.hasLayer(layersByYear[i]))
                    layersByYear[i].addTo(mapt9b);
            }

            for(i=val+2;i<2014;i=i+2){
                if(mapt9b.hasLayer(layersByYear[i]))
                    mapt9b.removeLayer(layersByYear[i]);
            }

            /*
            if(val ==1990){
                if(year_>val) {
                    mapt9b.removeLayer(layersByYear['1992']);
                }
            }
            if(val ==1992){
                if(year_>val) {
                    mapt9b.removeLayer(layersByYear['1994']);
                }else{
                    layersByYear['1992'].addTo(mapt9b);
                }
            }
            if(val ==1994){
                if(year_>val) {
                    mapt9b.removeLayer(layersByYear['1996']);
                }else{
                    layersByYear['1994'].addTo(mapt9b);
                }
            }
            if(val ==1996){
                if(year_>val) {
                    mapt9b.removeLayer(layersByYear['1998']);
                }else{
                    layersByYear['1996'].addTo(mapt9b);
                }
            }
            if(val ==1998){
                if(year_>val) {
                    mapt9b.removeLayer(layersByYear['2000']);
                }else{
                    layersByYear['1998'].addTo(mapt9b);
                }
            }
            if(val ==2000){
                if(year_>val) {
                    mapt9b.removeLayer(layersByYear['2002']);
                }else{
                    layersByYear['2000'].addTo(mapt9b);
                }
            }
            if(val ==2002){
                if(year_>val) {
                    mapt9b.removeLayer(layersByYear['2004']);
                }else{
                    layersByYear['2002'].addTo(mapt9b);
                }
            }
            if(val ==2004){
                if(year_>val) {
                    mapt9b.removeLayer(layersByYear['2006']);
                }else{
                    layersByYear['2004'].addTo(mapt9b);
                }
            }
            if(val ==2006){
                if(year_>val) {
                    mapt9b.removeLayer(layersByYear['2008']);
                }else{
                    layersByYear['2006'].addTo(mapt9b);
                }
            }
            if(val ==2008){
                if(year_>val) {
                    mapt9b.removeLayer(layersByYear['2010']);
                }else{
                    layersByYear['2008'].addTo(mapt9b);
                }
            }
            if(val ==2010){
                if(year_>val) {
                    mapt9b.removeLayer(layersByYear['2012']);
                }else{
                    layersByYear['2010'].addTo(mapt9b);
                }
            }
            if(val ==2012){
                layersByYear['2012'].addTo(mapt9b);
            }
            */

            year_=val;
        }

        changeLegend();
    });
    function changeLegend() {
        //console.log(quantiles);
        var div = $('.info.legend')
        $(div).empty();
        $(div).append($('#lu5c_legend').html());
    }
})(jQuery);
