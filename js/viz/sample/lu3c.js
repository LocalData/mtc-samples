var metrodata;
(function($) {

    //Actualizamos la información del diagrama
    $.fn.updateChartC = function(title,yTitle,xTitle,series,decimal_format) {

        $('#CChart').highcharts({
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
                min:0
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span>',
                pointFormat: '<div style="color:{series.color};padding:0">{series.name}: </div>' +
                '<div style="padding:0;font-size:10px;"><b>{point.y:'+decimal_format+'</b></div>',
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
    };

//Cuando carga el documento
    $(function() {

        /********************************************************************************/
        $.ajax({
            dataType: "json",
            url: "http://54.213.139.235:1337/lu3/metro",
            //data: data,
            async: false,
            success: successtMetroList
        });

        function successtMetroList(data) {
            var area = '';
            var series = [];
            var array_ = [];
            data.forEach(function(element,index,array) {
                if(area.toLowerCase().trim()!= element.Area.toLowerCase().trim()){
                    if(area!=''){
                        series.push({
                            "name": area,
                            "data": array_
                        });
                        array_ = [];
                    }
                    area = element.Area;
                    array_.push([Date.UTC(element.Year, 1, 1), element.UNITS_per1000]);
                }else{
                    if(element.Year) {
                        array_.push([Date.UTC(element.Year, 1, 1), element.UNITS_per1000]);
                    }
                }
            });
            series.push({
                "name": area,
                "data": array_
            });

            var decimal_format = ",.1f}";
            $(this).updateChartC('Metro Comparison for Housing Growth','Number of Permitted Units per 1,000 Residents','',series,decimal_format);

        }

    });
})(jQuery);