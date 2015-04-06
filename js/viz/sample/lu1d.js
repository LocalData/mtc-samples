var regional_series=[];
var countydata;
(function($) {

    //Actualizamos la información del diagrama
    $.fn.updateChartD = function(title,yTitle,xTitle,series,decimal_format) {

        $('#Dchart').highcharts({
            chart: {
                type: 'line'
            },
            title: {
                text: title
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    year: '%Y'
                },
                //categories: xCategories,
                tickmarkPlacement: 'on',
                title: {
                    text: xTitle
                }
            },
            yAxis: {
                title: {
                    text: yTitle
                },
                min: 0
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span>',
                pointFormat: '<div style="color:{series.color};padding:0">{series.name}: </div>' +
                '<div style="padding:0"><b>{point.y:'+decimal_format+'</b></div>',
                shared: true,
                useHTML: true
            },
            colors: altColors,
            plotOptions: {
                line: {
                    enableMouseTracking: true
                }
            },
            series: series
        });
    }

//Cuando carga el documento
$(function() {

/********************************************************************************/
        //REQUEST COUNTY DATA FROM SERVER
        $.ajax({
            dataType: "json",
            url: "http://54.213.139.235:1337/lu1/metro",
            //data: data,
            async: false,
            success: successMetro
        });

        function successMetro(data) {
            metrodata = data;
        }

        $('#populationD').click(function(){
            $(this).addClass("active")
            $(this).siblings('a').removeClass('active');
            var area = '';
            var series = [];
            var array_ = [];
            metrodata.forEach(function(element,index,array) {
                if(area.toLowerCase().trim()!= element['Short Name'].toLowerCase().trim()){
                    if(area!=''){
                        series.push({
                            "name": area,
                            "data": array_
                        });
                        array_ = [];
                    }
                    area = element['Short Name'];
                    array_.push([Date.UTC(element.Year, 0, 1), element.Pop]);
                }else{
                    array_.push([Date.UTC(element.Year, 0, 1), element.Pop]);
                }
            });
            series.push({
                "name": area,
                "data": array_
            });
            array_ = [];

            series.sort(function(b,a){
                return a.data[0][1]- b.data[0][1]});

            //console.log(series);
            var decimal_format = ",.0f}";
            $(this).updateChartD('Metro Comparison for Population','Population','',series,decimal_format);

        });

        $('#percentD').click(function(){
            $(this).addClass("active")
            $(this).siblings('a').removeClass('active');
            var area = '';
            var series = [];
            var array_ = [];
            metrodata.forEach(function(element,index,array) {
                if(area.toLowerCase().trim()!= element['Short Name'].toLowerCase().trim()){
                    if(area!=''){
                        series.push({
                            "name": area,
                            "data": array_
                        });
                        array_ = [];
                    }
                    area = element['Short Name'];
                    var val = (element.PercentChng_1960*100);
                    array_.push([Date.UTC(element.Year, 0, 1), parseFloat(val.toFixed(2)),element.Pop]);
                }else{
                    var val = (element.PercentChng_1960*100);
                    array_.push([Date.UTC(element.Year, 0, 1), parseFloat(val.toFixed(2)),element.Pop]);
                }
            });
            series.push({
                "name": area,
                "data": array_
            });


            series.sort(function(b,a){
                return a.data[0][2]- b.data[0][2]});
            var decimal_format = ".1f}%";
            $(this).updateChartD('Metro Comparison for Percent Change in Population','Percent Change Since 1960','',series,decimal_format);
        });
        $('#populationD').click();
    });
})(jQuery);