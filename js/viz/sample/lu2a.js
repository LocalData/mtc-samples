var regional1=[];
var regional2 = [];
var countydata;
(function($) {

    //Actualizamos la información del diagrama
    $.fn.updateChartA = function(title,yTitle,xTitle,series,decimal_format,y_min) {

        $('#AChart').highcharts({
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
                min: y_min
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
        $.ajax({
            dataType: "json",
            url: "http://54.213.139.235:1337/lu2/county",
            //data: data,
            async: false,
            success: successtCountyList
        });

        function successtCountyList(data) {
            countydata = data;

        }

        /********************************************************************************/
        //REQUEST REGION DATA FROM SERVER
        $.ajax({
            dataType: "json",
            url: "http://54.213.139.235:1337/lu2/region",
            //data: data,
            async: false,
            success: successRegionData
        });

        function successRegionData(data) {
            var array_ = [];
            var array2_ = [];
            data.forEach(function(element,index,array){
                array_.push([Date.UTC(element.Year, 0, 1), element.Jobs]);
                var val = (element.PercentChng_1990*100);
                array2_.push([Date.UTC(element.Year, 0, 1), parseFloat(val.toFixed(2))]);
            });
            regional1=array_;
            regional2 =array2_;

        }


        $('#jobsA').click(function(){
            $(this).addClass("active")
            $(this).siblings('a').removeClass('active');
            var area = '';
            var series = [];
            series.push({
                "name": "Bay Area",
                "data": regional1
            });
            var array_ = [];

            countydata.forEach(function(element,index,array) {
                if(area.toLowerCase().trim()!= element.County.toLowerCase().trim()){
                    if(area!=''){
                        series.push({
                            "name": area,
                            "data": array_,
                            "visible": false,
                        });
                        array_ = [];
                    }
                    area = element.County;
                    array_.push([Date.UTC(element.Year, 0, 1), element.Jobs]);
                }else{
                    array_.push([Date.UTC(element.Year, 0, 1), element.Jobs]);
                }
            });
            //console.log(series);
            var decimal_format = ",.0f}";
            $(this).updateChartA('Historical Trend for Jobs','Number of Jobs','',series,decimal_format,0);
        });

        $('#percentA').click(function(){
            $(this).addClass("active")
            $(this).siblings('a').removeClass('active');
            var area = '';
            var series = [];
            series.push({
                "name": "Bay Area",
                "data": regional2
            });
            var array_ = [];
            countydata.forEach(function(element,index,array) {
                if(area.toLowerCase().trim()!= element.County.toLowerCase().trim()){
                    if(area!=''){
                        series.push({
                            "name": area,
                            "data": array_,
                            "visible": false,
                        });
                        array_ = [];
                    }
                    var val = (element.PercentChng_1990*100);
                    array_.push([Date.UTC(element.Year, 0, 1), parseFloat(val.toFixed(2))]);
                    area = element.County;
                }else{
                    var val = (element.PercentChng_1990*100);
                    array_.push([Date.UTC(element.Year, 0, 1), parseFloat(val.toFixed(2))]);
                }
            });
            //console.log(series);
            var decimal_format = ".1f}%";
            $(this).updateChartA('Historical Trend for Percent Change in Jobs','Percent Change Since 1990','',series,decimal_format,null);
        });
        $('#jobsA').click();


    });
})(jQuery);