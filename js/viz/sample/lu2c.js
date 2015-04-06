var metrodata;
(function($) {

    //Actualizamos la información del diagrama
    $.fn.updateChartC = function(title,yTitle,xTitle,series,decimal_format,xCategories) {

        $('#CChart').highcharts({
            chart: {
                type: 'bar'
            },
            title: {
                text: title
            },
            xAxis: {
                categories: xCategories,
                title: {
                    text: xTitle
                },
                labels: {
                    formatter: function () {
                        if(this.value=="Bay Area")
                            return "<strong>"+this.value+"</strong>";
                        else
                            return this.value;
                    }
                }
            },
            legend: {
                enabled: false
            },
            yAxis: {
                title: {
                    text: yTitle
                }
            },
            tooltip: {
                pointFormat: '<div style="padding:0"><b>{point.y:'+decimal_format+'</b></div>',
                shared: true,
                useHTML: true
            },
            colors: altColors,
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: false
                    }
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
            url: "http://54.213.139.235:1337/lu2/metro",
            //data: data,
            async: false,
            success: successtMetroList
        });

        function successtMetroList(data) {
            metrodata = data;

        }

        $('#percent1').click(function(){
            $(this).addClass("active")
            $(this).siblings('a').removeClass('active');
            var series = [];
            var vals = [];
            var cats = [];

            metrodata.sort(function(b,a){return a.PercentChng_1990- b.PercentChng_1990});

            metrodata.forEach(function(element,index,array) {
                if(element.Year==2013){
                    cats.push(element.Area);
                    var val = (element.PercentChng_1990 * 100);
                    vals.push(parseFloat(val.toFixed(2)));
                }
             });

            series.push({
                "name": "1990",
                "data": vals
            });
            var decimal_format = ",.1f}%";
            $(this).updateChartC('Metro Comparison for Percent Change in Jobs Since 1990','Percent Change','',series,decimal_format,cats);
        });

        $('#percent2').click(function(){
            $(this).addClass("active")
            $(this).siblings('a').removeClass('active');
            var series = [];
            var vals = [];
            var cats = [];

            metrodata.sort(function(b,a){return a.PercentChng_2000- b.PercentChng_2000});

            metrodata.forEach(function(element,index,array) {
                if(element.Year==2013){
                    cats.push(element.Area);
                    var val = (element.PercentChng_2000 * 100);
                    vals.push(parseFloat(val.toFixed(2)));
                }
            });

            series.push({
                "name": "2000",
                "data": vals
            });

            var decimal_format = ",.1f}%";
            $(this).updateChartC('Metro Comparison for Percent Change in Jobs Since 2000','Percent Change','',series,decimal_format,cats);
        });

        $('#percent3').click(function(){
            $(this).addClass("active")
            $(this).siblings('a').removeClass('active');
            var series = [];
            var vals = [];
            var cats = [];

            metrodata.sort(function(b,a){return a.PercentChng_2010- b.PercentChng_2010});

            metrodata.forEach(function(element,index,array) {
                if(element.Year==2013){
                    cats.push(element.Area);
                    var val = (element.PercentChng_2010 * 100);
                    vals.push(parseFloat(val.toFixed(2)));
                }
            });

            series.push({
                "name": "2010",
                "data": vals
            });

            var decimal_format = ",.1f}%";
            $(this).updateChartC('Metro Comparison for Percent Change in Jobs Since 2010','Percent Change','',series,decimal_format,cats);
        });

        $('#percent1').click();


    });
})(jQuery);