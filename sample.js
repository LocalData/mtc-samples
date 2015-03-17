//MAP SCRIPT
var mapt9b;
var type = 1,loaded=1;
var sub,s92,s94,s96,s98,s00,s02,s04,s06,s08,s10,s12;
var year_ = 1990;
(function($) {
    function formatNumber (num) {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    }
    $(function() {
        var mapbounds;

        //CREATE MAP AND ADD BASEMAP LAYER for T1-T2-B
        mapt9b = L.map('map', {
            center: [37.7833, -122.4167],
            zoom: 12,
            minZoom: 8,
            fullscreenControl: true
        });

        // Set map bounds for the reload map button
        mapbounds = mapt9b.getBounds();

        // Add the base tile layer
        L.mapbox.accessToken = 'pk.eyJ1IjoicG9zdGNvZGUiLCJhIjoiWWdxRTB1TSJ9.phHjulna79QwlU-0FejOmw';
        var basemap = L.mapbox.tileLayer('postcode.kh28fdpk').addTo(mapt9b);
        L.control.scale().addTo(mapt9b);

        // Add
        sub = new L.TileLayer('http://gis.mtc.ca.gov/mtc/rest/services/VitalSigns/LU5_Greenfield_1990_Cache/MapServer/tile/{z}/{y}/{x}')
            .addTo(mapt9b);

        function clickUpdate(e) {
            //console.log(e.target.feature.properties);
            if(e.target.feature.properties.YEAR==1990){
                $('.year_info').html("This area was developed before 1990.");
            }else{
                $('.year_info').html("This area was developed in "+e.target.feature.properties.YEAR+".");
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
            tooltip: {
                enabled: false
            }
        }).data("kendoSlider");

        var s92, s94, s96, s98, s00, s02, s04, s06, s08, s10, s12;
        function sliderChanget9b(e) {
            //console.log(e.value);
            var val =t9btimeslider.value();
            $('.year').html(val);

            if(val ==1990){
                if(year_>val && s92) {
                    mapt9b.removeLayer(s92);
                }
            }
            if(val ==1992){
                if(year_>val && s94) {
                    mapt9b.removeLayer(s94);
                }else{
                    cartodb.createLayer(map, 'http://localdata.cartodb.com/api/v2/viz/4a796c3c-c849-11e4-b0d5-0e018d66dc29/viz.json')
                        .addTo(map)
                        .on('done', function(layer) {
                            s92 = layer;
                        });
                }
            }
            if(val ==1994){
                if(year_>val && s96) {
                    mapt9b.removeLayer(s96);
                }else{
                    cartodb.createLayer(map, 'http://localdata.cartodb.com/api/v2/viz/4a796c3c-c849-11e4-b0d5-0e018d66dc29/viz.json')
                        .addTo(map)
                        .on('done', function(layer) {
                            s96 = layer;
                        });
                }
            }
            if(val ==1996){
                if(year_>val && s98) {
                    mapt9b.removeLayer(s98);
                }else{
                    // etc etc
                }
            }
            if(val ==1998){
                if(year_>val) {
                    mapt9b.removeLayer(s00);
                }else{

                }
            }
            if(val ==2000){
                if(year_>val) {
                    mapt9b.removeLayer(s02);
                }else{

                }
            }
            if(val ==2002){
                if(year_>val) {
                    mapt9b.removeLayer(s04);
                }else{

                }
            }
            if(val ==2004){
                if(year_>val) {
                    mapt9b.removeLayer(s06);
                }else{

                }
            }
            if(val ==2006){
                if(year_>val) {
                    mapt9b.removeLayer(s08);
                }else{

                }
            }
            if(val ==2008){
                if(year_>val) {
                    mapt9b.removeLayer(s10);
                }else{

                }
            }
            if(val ==2010){
                if(year_>val) {
                    mapt9b.removeLayer(s12);
                }else{
                }
            }

            if(val ==2012){
                s96.addTo(mapt9b);
            }

            year_=val;
        }


    });

})(jQuery);
