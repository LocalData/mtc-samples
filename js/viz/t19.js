(function($) {
    // Set the default highcharts separator
    Highcharts.setOptions({
        lang: {
            decimalPoint: '.',
            thousandsSep: ','
        }
    });

    $(function () {
        var t19aRegionData;
        $.ajax({
            dataType: "json",
            url: "http://vitalsigns-production.elasticbeanstalk.com/t19/operator",
            async: false,
            success: successRegionDatat19a
        });

        function successRegionDatat19a(data) {
            t19aRegionData = data;
        }
        var regionnames = [];
        var pastuseful = [];
        var useful = [];

        for (var key in t19aRegionData) {
            regionnames.push(t19aRegionData[key].System);
            pastuseful.push(t19aRegionData[key].PAOUL);
            useful.push(1 - (t19aRegionData[key].PAOUL));
        }

        var t1t2cChart = $('#T19-chart').highcharts({
            chart: {
                type: 'bar',
                height: 650,
                marginTop: 40
            },
            title: {
                text: ''
            },
            exporting: {
                chartOptions: {
                    title: {
                        text: '2015 Transit Asset Condition by Operator'
                    }
                }
            },
            xAxis: {
                categories: regionnames,
                labels: {
                    style: {
                        fontSize:'10px'
                    }
                }
            },
            colors: [altColors[1], altColors[0]],
            yAxis: {
                min: 0,
                max: 100,
                title: {
                    text: 'Share of Assets Past Useful Life'
                }
            },
            legend: {
                enabled: false,
                reversed: true
            },
            tooltip: {
                enabled: true,
                pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.1f}%</b><br>',
                shared: true
            },
            plotOptions: {
                series: {
                    stacking: 'percent'

                }
            },
            series: [{
                name: 'Within Useful Life',
                data: useful
            }, {
                name: 'Past Useful Life',
                data: pastuseful
            }]

        });

    });
})(jQuery);
