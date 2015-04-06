//MAP SCRIPT
var tract,tract2,pda,pda2,map;
var pdaA,pdaB,pda2A,pda2B;
var type = 1,loaded=1;
var show_ = 0;
var test =[];
var test2=[];

(function($) {
    function formatNumber (num) {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
    }
    Array.min = function( array ){
        return Math.min.apply( Math, array );
    };

    //Actualizamos la información del diagrama
    $.fn.updateChartC = function(title,yTitle,xTitle,s_title,s_data,xcats,color,id,decimal_format) {
        $('#'+id).highcharts({
            chart: {
                type: 'bar'
            },
            colors: [color],
            title: {
                text: title,
                style: {
                    fontSize:'12px'
                }
            },
            xAxis: {
                categories: xcats,
                title: {
                    text: null
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: null
                }
            },
            tooltip: {
                pointFormat: '<div style="padding:0"><b>{point.y:'+decimal_format+'</b></div>',
                useHTML: true
            },
            plotOptions: {
            },
            series: [{
                name: s_title,
                data: s_data
            }]
        });
    };
    $(function() {
        var mapbounds;
        var range1 = [];
        var range2 = [];
        var range3=[];
        var range4=[];
        var hues = allOrange;
        var hues2 = allBlue;
        type =1;
        //CREATE MAP AND ADD BASEMAP LAYER for T1-T2-B
        map = L.map('map', {
            center: [37.783367, -122.062378],
            zoom: 10,
            minZoom: 8,
            fullscreenControl: true
        });

        var results = new L.LayerGroup().addTo(map);

        //Set map bounds for the reload map button
        mapbounds = map.getBounds();

        // Add ArcGIS Online basemap
        L.esri.basemapLayer("Gray").addTo(map);

/************************************************************************/
/************************************************************************/
        //Feature layer for updating infopanel
        pda = L.esri.featureLayer('http://gis.mtc.ca.gov/mtc/rest/services/VitalSigns/LU_Features/FeatureServer/0', {
            onEachFeature: onEachFeature2,
            simplifyFactor: 0.35,
            precision: 5,
            //fields: ['name', 'Pop10', 'PtChange12','Dens10','PercentChng_1970','OBJECTID'],
            style:{
                fillColor: '#ffffff',
                fillOpacity: 0,
                weight: 0
            }
        });
        pda.on('load', function(e) {
            //var ranges = science.stats.quantiles(range2, [0, .25, .50, .75]);
            var ranges = [0,5,11,18.5,40];
            changeLegend(ranges, "PDA - Density", hues);
            pda.setStyle(style);
        }).addTo(map);
        function style(feature) {
            //var ranges = science.stats.quantiles(range2, [0, .25, .50, .75]);
            var ranges = [0,5,11,18.5,40];

            var ret;

            var q;
            var val = feature.properties.Dens10;

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
                ret = {
                    fillColor: hues[q],
                    fillOpacity: 1,
                    weight: 0.5,
                    color: '#666',
                    dashArray: ''
                };
            } else {
                ret = {
                    fillColor: '#ffffff',
                    fillOpacity: 0,
                    weight: 0
                };
            }

            return ret;

        }

        //Feature layer for updating infopanel
        pdaA = L.esri.featureLayer('http://gis.mtc.ca.gov/mtc/rest/services/VitalSigns/LU_Features/FeatureServer/5', {
            onEachFeature: onEachFeature2,
            simplifyFactor: 0.35,
            precision: 5,
            //fields: ['name', 'Pop10', 'PtChange12','Dens10','PercentChng_1970','OBJECTID'],
            style:{
                fillColor: '#ffffff',
                fillOpacity: 0,
                weight: 0
            }
        });//.addTo(map);
        pdaA.on('load', function(e) {
            pdaA.setStyle(style);
        }).addTo(map);

        //Feature layer for updating infopanel
        pdaB = L.esri.featureLayer('http://gis.mtc.ca.gov/mtc/rest/services/VitalSigns/LU_Features/FeatureServer/6', {
            onEachFeature: onEachFeature2,
            simplifyFactor: 0.35,
            precision: 5,
            //fields: ['name', 'Pop10', 'PtChange12','Dens10','PercentChng_1970','OBJECTID'],
            style:{
                fillColor: '#ffffff',
                fillOpacity: 0,
                weight: 0
            }
        });//.addTo(map);
        pdaB.on('load', function(e) {
            pdaB.setStyle(style);
        }).addTo(map);

/************************************************************************/
        //Feature layer for updating infopanel
        pda2 = L.esri.featureLayer('http://gis.mtc.ca.gov/mtc/rest/services/VitalSigns/LU_Features/FeatureServer/0', {
            onEachFeature: onEachFeature2,
            simplifyFactor: 0.35,
            precision: 5,
            //fields: ['name', 'Pop10', 'PtChange12','Dens10','PercentChng_1970','OBJECTID'],
            style:{
                fillColor: '#ffffff',
                fillOpacity: 0,
                weight: 0
            }
        });
        pda2.on('load', function(e) {
            var ranges = [0,30,100,300];
            changeLegend2(ranges, "PDA - Percent Change", hues2);
            pda2.setStyle(style2);
        });
        //Feature layer for updating infopanel
        pda2A = L.esri.featureLayer('http://gis.mtc.ca.gov/mtc/rest/services/VitalSigns/LU_Features/FeatureServer/5', {
            onEachFeature: onEachFeature2,
            simplifyFactor: 0.35,
            precision: 5,
            //fields: ['name', 'Pop10', 'PtChange12','Dens10','PercentChng_1970','OBJECTID'],
            style:{
                fillColor: '#ffffff',
                fillOpacity: 0,
                weight: 0
            }
        });
        pda2A.on('load', function(e) {
            pda2A.setStyle(style2);
        });

        //Feature layer for updating infopanel
        pda2B = L.esri.featureLayer('http://gis.mtc.ca.gov/mtc/rest/services/VitalSigns/LU_Features/FeatureServer/6', {
            onEachFeature: onEachFeature2,
            simplifyFactor: 0.35,
            precision: 5,
            //fields: ['name', 'Pop10', 'PtChange12','Dens10','PercentChng_1970','OBJECTID'],
            style:{
                fillColor: '#ffffff',
                fillOpacity: 0,
                weight: 0
            }
        });
        pda2B.on('load', function(e) {
            pda2B.setStyle(style2);
        });

        function style2(feature) {
            //var ranges = science.stats.quantiles(range4, [0, .25, .50, .75]);
            var ranges = [0,30,100,300];
            var ret;

            var q;
            var val = feature.properties.PercentChng_1970;
            val = val*100;

            if(val<0) {
                q=0;
            }else if (val >= ranges[3]) {
                q = 4;
            } else if(val >= ranges[2] && val<ranges[3]) {
                q = 3;
            } else if(val >= ranges[1] && val<ranges[2]) {
                q = 2;
            } else if(val >= ranges[0] && val < ranges[1]) {
                q = 1;
            } else {
                q = -1
            }
            if(q > -1) {
                ret = {
                    fillColor: hues2[q],
                    fillOpacity: 1,
                    weight: 0.5,
                    color: '#666',
                    dashArray: ''
                };
            } else {
                ret = {
                    fillColor: '#ffffff',
                    fillOpacity: 0,
                    weight: 0
                };
            }

            return ret;

        }

/************************************************************************/
/************************************************************************/
        tract = L.esri.featureLayer('http://gis.mtc.ca.gov/mtc/rest/services/VitalSigns/LU_Features/FeatureServer/1', {
            onEachFeature: onEachFeature,
            simplifyFactor: 0.35,
            precision: 5,
            //fields: ['Pop12', 'Density12', 'PtChange12','TRACT','OBJECTID'],
            style:{
                fillColor: '#ffffff',
                fillOpacity: 0,
                weight: 0
            }
        });
        tract.on('load', function(e) {
            var ranges = [0,5,11,18.5,40];
            changeLegend(ranges, "Tract - Density", hues);
            tract.setStyle(style3);
        });
        function style3(feature) {
            var ranges = [0,5,11,18.5,40];

            var ret;

            var q;
            var val = feature.properties.Density12;

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
                ret = {
                    fillColor: hues[q],
                    fillOpacity: 0.8,
                    weight: 0.5,
                    color: '#666',
                    dashArray: ''
                };
            } else {
                ret = {
                    fillColor: '#ffffff',
                    fillOpacity: 0,
                    weight: 0
                };
            }

            return ret;

        }

/************************************************************************/
        tract2 = L.esri.featureLayer('http://gis.mtc.ca.gov/mtc/rest/services/VitalSigns/LU_Features/FeatureServer/1', {
            onEachFeature: onEachFeature,
            simplifyFactor: 0.35,
            precision: 5,
            //fields: ['Pop12', 'Density12', 'PtChange12','TRACT','OBJECTID'],
            style:{
                fillColor: '#ffffff',
                fillOpacity: 0,
                weight: 0
            }
        });
        tract2.on('load', function(e) {
            var ranges = [0,30,100,300];
            changeLegend2(ranges, "Tract - Percent Change", hues2);
            tract2.setStyle(style4);
        });
        function style4(feature) {
            var ranges = [0,30,100,300];

            var ret;

            var q;
            var val = feature.properties.PtChange12;
            val = val*100;

            if(val<0) {
                q=0;
            }else if (val >= ranges[3]) {
                q = 4;
            } else if(val >= ranges[2] && val<ranges[3]) {
                q = 3;
            } else if(val >= ranges[1] && val<ranges[2]) {
                q = 2;
            } else if(val >= ranges[0] && val < ranges[1]) {
                q = 1;
            } else {
                q = -1
            }
            if(q > -1) {
                ret = {
                    fillColor: hues2[q],
                    fillOpacity: 0.8,
                    weight: 0.5,
                    color: '#666',
                    dashArray: ''
                };
            } else {
                ret = {
                    fillColor: '#ffffff',
                    fillOpacity: 0,
                    weight: 0
                };
            }

            return ret;
        }


        //Tiled layer
        L.mapbox.accessToken = 'pk.eyJ1IjoicG9zdGNvZGUiLCJhIjoiWWdxRTB1TSJ9.phHjulna79QwlU-0FejOmw';
        var basemap = L.mapbox.tileLayer('postcode.kh28fdpk').addTo(map);
        /*
        var streetsTiledLayer = L.esri.tiledMapLayer("http://gis.mtc.ca.gov/mtc/rest/services/VitalSigns/LU1_Tracts_PDAs/MapServer", {
            maxZoom: 8
        }).addTo(map);
        */



        //We add the legend
        var legendControl = new L.mapbox.legendControl();
        L.control.scale().addTo(map);

        legendControl.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend')
            $(div).addClass("col-lg-11")
            $(div).append("<h5></h5>")
            return div;
        };
        legendControl.addTo(map);



        function onEachFeature(feature, layer) {
            layer.on({
                //mouseover: mouseoverUpdate,
                click: clickUpdate
            });

            var val =parseInt(layer.feature.properties.Density12);
            range1.push(val);
            val = layer.feature.properties.PtChange12*100;
            if(val>0)
                range3.push(val.toFixed(0));
            else
                test.push(val.toFixed(0));
        }

        function onEachFeature2(feature, layer) {
            layer.on({
                //mouseover: mouseoverUpdate,
                click: clickUpdate
            });
            var val =layer.feature.properties.Dens10;
            range2.push(val);
            val = layer.feature.properties.PercentChng_1970;
            val = val*100;
            if(val>0)
                range4.push(val);
            else
                test2.push(val);

        }

        function clickUpdate(e) {
            var val =0;
            $(show_).show();
            $('.initial_map').hide();
            //console.log(e.target.feature.properties);
            //Tracts
            $('.tntext').html(e.target.feature.properties.TRACT);
            if(typeof e.target.feature.properties.Pop12 !== 'undefined') {
                $('.p12text').html(formatNumber(e.target.feature.properties.Pop12));
            }
            if(typeof e.target.feature.properties.Density12 !== 'undefined' ) {
                $('.dtext').html(e.target.feature.properties.Density12.toFixed(1));
            }
            if(typeof e.target.feature.properties.PtChange12 !== 'undefined' ) {
                val = e.target.feature.properties.PtChange12*100;
                $('.pt12text').html(val.toFixed(1) + ' %');
            }

            //PDA
            $('.namtext').html(e.target.feature.properties.name);
            if(typeof e.target.feature.properties.Pop10 !== 'undefined' ) {
                $('.po10text').html(formatNumber(e.target.feature.properties.Pop10));
            }
            if(typeof e.target.feature.properties.Dens10 !== 'undefined' ) {
                $('.d10text').html(e.target.feature.properties.Dens10.toFixed(1));
            }
            if(typeof e.target.feature.properties.PercentChng_1970 !== 'undefined') {
                val = e.target.feature.properties.PercentChng_1970*100;
                $('.pc70text').html(val.toFixed(1) + ' %');
            }


            //Actualizamos la grafica pda
            if(typeof e.target.feature.properties.Dens10 !== 'undefined' ) {
                var series_=[];
                series_.push(e.target.feature.properties.Dens70);
                series_.push(e.target.feature.properties.Dens80);
                series_.push(e.target.feature.properties.Dens90);
                series_.push(e.target.feature.properties.Dens00);
                series_.push(e.target.feature.properties.Dens10);

                var xcats = ['1970','1980','1990','2000','2010'];

                var decimal_format = ",.1f} people per acre";
                $(this).updateChartC(e.target.feature.properties.name,'','','Density',series_,xcats,"#EC7429","CChart",decimal_format);


                var s2 = [];
                s2.push(e.target.feature.properties.Pop70);
                s2.push(e.target.feature.properties.Pop80);
                s2.push(e.target.feature.properties.Pop90);
                s2.push(e.target.feature.properties.Pop0);
                s2.push(e.target.feature.properties.Pop10);

                decimal_format = ",.0f} people";
                $(this).updateChartC(e.target.feature.properties.name,'','','Population',s2,xcats,"#3D9CC8","CChart2",decimal_format);
            }

            //Actualizamos la density del tract
            if(typeof e.target.feature.properties.Density12 !== 'undefined' ) {
                var series_=[];
                series_.push(e.target.feature.properties.Dens70);
                series_.push(e.target.feature.properties.Dens80);
                series_.push(e.target.feature.properties.Dens90);
                series_.push(e.target.feature.properties.Dens00);
                series_.push(e.target.feature.properties.Dens10);
                series_.push(e.target.feature.properties.Density12);

                var xcats = ['1970','1980','1990','2000','2010','2012'];

                var decimal_format = ",.1f} people per acre";
                $(this).updateChartC("Tract " + e.target.feature.properties.TRACT,'','','Density',series_,xcats,"#EC7429","CChart3",decimal_format);


                var s2 = [];
                s2.push(e.target.feature.properties.Pop70);
                s2.push(e.target.feature.properties.Pop80);
                s2.push(e.target.feature.properties.Pop90);
                s2.push(e.target.feature.properties.Pop0);
                s2.push(e.target.feature.properties.Pop10);
                s2.push(e.target.feature.properties.Pop12);

                decimal_format = ",.0f} people";
                $(this).updateChartC("Tract " + e.target.feature.properties.TRACT,'','','Population',s2,xcats,"#3D9CC8","CChart4",decimal_format);
            }

        }

        function reloadMap() {
            map.fitBounds(mapbounds);
        }

        $('#btnd1').click(function(){
            $(this).addClass("active")
            $('#btnd2').removeClass('active');
            loaded=1;
            $('.map_info .text,.map_info2 .text').html('');

            if(type==1){

                if(!map.hasLayer(pda))
                    pda.addTo(map);
                if(!map.hasLayer(pdaA))
                    pdaA.addTo(map);
                if(!map.hasLayer(pdaB))
                    pdaB.addTo(map);

                if(map.hasLayer(pda2))
                    map.removeLayer(pda2);
                if(map.hasLayer(pda2A))
                    map.removeLayer(pda2A);
                if(map.hasLayer(pda2B))
                    map.removeLayer(pda2B);

                if(map.hasLayer(tract))
                    map.removeLayer(tract);

                if(map.hasLayer(tract2))
                    map.removeLayer(tract2);

                show_ = $('.map_info2');
                $('.map_info,.map_info2,.map_info3,.map_info4').hide();
                $('.initial_map').show();
                $('#map_title').html("2010 Population Density for Priority Development Areas");
                $('#CChart').show().html('');
                $('#CChart2,#CChart3,#CChart4').hide().html('');
            }else{

                if(!map.hasLayer(pda2))
                    pda2.addTo(map);
                if(!map.hasLayer(pda2A))
                    pda2A.addTo(map);
                if(!map.hasLayer(pda2B))
                    pda2B.addTo(map);

                if(map.hasLayer(pda))
                    map.removeLayer(pda);
                if(map.hasLayer(pdaA))
                    map.removeLayer(pdaA);
                if(map.hasLayer(pdaB))
                    map.removeLayer(pdaB);

                if(map.hasLayer(tract))
                    map.removeLayer(tract);

                if(map.hasLayer(tract2))
                    map.removeLayer(tract2);

                show_ = $('.map_info3');
                $('.map_info,.map_info2,.map_info3,.map_info4').hide();
                $('.initial_map').show();
                $('#map_title').html("Percent Change Since 1970 for Priority Development Areas");
                $('#CChart2').show().html('');
                $('#CChart,#CChart3,#CChart4').hide().html('');
            }

        });
        $('#btnd2').click(function(){
            loaded =2;
            $('.map_info .text,.map_info2 .text').html('');
            $(this).addClass("active")
            $('#btnd1').removeClass('active');
            if(type==1){
                if(!map.hasLayer(tract))
                    tract.addTo(map);

                if(map.hasLayer(pda))
                    map.removeLayer(pda);
                if(map.hasLayer(pdaA))
                    map.removeLayer(pdaA);
                if(map.hasLayer(pdaB))
                    map.removeLayer(pdaB);

                if(map.hasLayer(pda2))
                    map.removeLayer(pda2);
                if(map.hasLayer(pda2A))
                    map.removeLayer(pda2A);
                if(map.hasLayer(pda2B))
                    map.removeLayer(pda2B);


                if(map.hasLayer(tract2))
                    map.removeLayer(tract2);

                show_ = $('.map_info');
                $('.map_info,.map_info2,.map_info3,.map_info4').hide();
                $('.initial_map').show();

                $('#map_title').html("2012 Population Density for Tracts");
                $('#CChart3').show().html('');
                $('#CChart2,#CChart,#CChart4').hide().html('');

            }else{
                if(!map.hasLayer(tract2))
                    tract2.addTo(map);

                if(map.hasLayer(pda))
                    map.removeLayer(pda);
                if(map.hasLayer(pdaA))
                    map.removeLayer(pdaA);
                if(map.hasLayer(pdaB))
                    map.removeLayer(pdaB);

                if(map.hasLayer(pda2))
                    map.removeLayer(pda2);
                if(map.hasLayer(pda2A))
                    map.removeLayer(pda2A);
                if(map.hasLayer(pda2B))
                    map.removeLayer(pda2B);


                if(map.hasLayer(tract))
                    map.removeLayer(tract);

                show_ = $('.map_info4');
                $('.map_info,.map_info2,.map_info3,.map_info4').hide();
                $('.initial_map').show();
                $('#map_title').html("Percent Change Since 1970 for Tracts");
                $('#CChart4').show().html('');
                $('#CChart2,#CChart3,#CChart').hide().html('');
            };

        });

        $('#btnd3').click(function() {
            type=1;
            $(this).addClass("active")
            $('#btnd4').removeClass('active');
            if(loaded==1){
                if(!map.hasLayer(pda))
                    pda.addTo(map);
                if(!map.hasLayer(pdaA))
                    pdaA.addTo(map);
                if(!map.hasLayer(pdaB))
                    pdaB.addTo(map);

                if(map.hasLayer(pda2))
                    map.removeLayer(pda2);
                if(map.hasLayer(pda2A))
                    map.removeLayer(pda2A);
                if(map.hasLayer(pda2B))
                    map.removeLayer(pda2B);

                if(map.hasLayer(tract))
                    map.removeLayer(tract);

                if(map.hasLayer(tract2))
                    map.removeLayer(tract2);

                show_ = $('.map_info2');
                $('.map_info,.map_info2,.map_info3,.map_info4').hide();
                $('.initial_map').show();
                $('#map_title').html("2010 Population Density for Priority Development Areas");
                $('#CChart').show().html('');
                $('#CChart2,#CChart3,#CChart4').hide().html('');
            }else{
                if(!map.hasLayer(tract))
                    tract.addTo(map);

                if(map.hasLayer(pda))
                    map.removeLayer(pda);
                if(map.hasLayer(pdaA))
                    map.removeLayer(pdaA);
                if(map.hasLayer(pdaB))
                    map.removeLayer(pdaB);

                if(map.hasLayer(pda2))
                    map.removeLayer(pda2);

                if(map.hasLayer(tract2))
                    map.removeLayer(tract2);

                show_ = $('.map_info');
                $('.map_info,.map_info2,.map_info3,.map_info4').hide();
                $('.initial_map').show();
                $('#map_title').html("2012 Population Density for Tracts");
                $('#CChart3').show().html('');
                $('#CChart2,#CChart,#CChart4').hide().html('');
            }


        });
        $('#btnd4').click(function() {
            type=2;
            $(this).addClass("active")
            $('#btnd3').removeClass('active');
            if(loaded==1){
                if(!map.hasLayer(pda2))
                    pda2.addTo(map);
                if(!map.hasLayer(pda2A))
                    pda2A.addTo(map);
                if(!map.hasLayer(pda2B))
                    pda2B.addTo(map);

                if(map.hasLayer(pda))
                    map.removeLayer(pda);
                if(map.hasLayer(pdaA))
                    map.removeLayer(pdaA);
                if(map.hasLayer(pdaB))
                    map.removeLayer(pdaB);

                if(map.hasLayer(tract))
                    map.removeLayer(tract);

                if(map.hasLayer(tract2))
                    map.removeLayer(tract2);

                show_ = $('.map_info3');
                $('.map_info,.map_info2,.map_info3,.map_info4').hide();
                $('.initial_map').show();
                $('#map_title').html("Percent Change Since 1970 for Priority Development Areas");
                $('#CChart2').show().html('');
                $('#CChart,#CChart3,#CChart4').hide().html('');
            }else{
                if(!map.hasLayer(tract2))
                    tract2.addTo(map);

                if(map.hasLayer(pda))
                    map.removeLayer(pda);
                if(map.hasLayer(pdaA))
                    map.removeLayer(pdaA);
                if(map.hasLayer(pdaB))
                    map.removeLayer(pdaB);

                if(map.hasLayer(pda2))
                    map.removeLayer(pda2);
                if(map.hasLayer(pda2A))
                    map.removeLayer(pda2A);
                if(map.hasLayer(pda2B))
                    map.removeLayer(pda2B);


                if(map.hasLayer(tract))
                    map.removeLayer(tract);


                show_ = $('.map_info4');
                $('.map_info,.map_info2,.map_info3,.map_info4').hide();
                $('.initial_map').show();
                $('#map_title').html("Percent Change Since 1970 for Tracts");
                $('#CChart4').show().html('');
                $('#CChart2,#CChart3,#CChart').hide().html('');
            }

        });

        //$('#btnd1').click();
        show_ = $('.map_info2');
    });

    function changeLegend(quantiles, title, hues) {
        //console.log(quantiles);
        var div = $('.info.legend')
        $(div).empty();
        $(div).addClass("col-lg-11 col-md-11 col-sm-11 col-xs-11");
        $(div).append("<h5 style='font-size: 13px'>"+title+"</h5>");
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < quantiles.length; i++) {
            $(div).append('<div><div class="col-lg-1" style="background:' + hues[i] + ';">&nbsp; </div><div class="col-lg-8">' +
            Math.round(quantiles[i]*100)/100 + (Math.round(quantiles[i + 1]*100)/100 ? '&ndash;' + Math.round(quantiles[i + 1]*100)/100 + '</div>' : '+'));
        }
    }
    function changeLegend2(quantiles, title, hues) {
        var div = $('.info.legend');
        $(div).empty()
        $(div).addClass("col-lg-11 col-md-11 col-sm-11 col-xs-11");
        $(div).append("<h5 style='font-size: 13px'>"+title+"</h5>");


        $(div).append('<div><div class="col-lg-1" style="background:' + hues[0] + ';">&nbsp; </div><div class="col-lg-9" style="font-size:10px;">' +
        '< 0 % </div>');

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < quantiles.length; i++) {
            $(div).append('<div><div class="col-lg-1" style="background:' + hues[i+1] + ';">&nbsp; </div><div class="col-lg-9" style="font-size:10px;">' +
            Math.round(quantiles[i]*100)/100 + ' % ' + (Math.round(quantiles[i + 1]*100)/100 ? '&ndash; ' + Math.round(quantiles[i + 1]*100)/100 + ' % </div>' : '+'));
        }
    }
})(jQuery);