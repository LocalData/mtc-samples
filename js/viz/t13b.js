(function($) {
    // Set the default highcharts separator
    Highcharts.setOptions({
        lang: {
            decimalPoint: '.',
            thousandsSep: ','
        }
    });

    $(function() {
        lineChartAggregate("http://vitalsignsvs2.elasticbeanstalk.com/api/t13/metro", "Year", "NetCostperBoard_IA", "Metro", "" )
    })

    function lineChartAggregate(dataUrl, seriesName, seriesData, aggregate, title) {
        // Get the CSV and create the chart
        var options = {
            chart: {
                renderTo: 'T13-B-chart',
                defaultSeriesType: 'line',
                marginTop: 40
            },
            series: [{
                name: 'val1',
                data: []
            }],
            xAxis: {
                categories: []
            },
            title: {
                text: ''
            },
            exporting: {
                chartOptions: {
                    title: {
                        text: 'Metro Comparison for Transit System Efficiency'
                    }
                }
            },
            yAxis: {
                min: 0,
                max: 7.5,
                tickInterval: 2.5,
                labels: {
                    format: '${value:.2f}'
                },
                title: {
                    text: 'Net Cost per Boarding'
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' + '<td style="padding:0"><b>${point.y:,.2f}</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            colors: altColors
        }
        jQuery.getJSON(dataUrl, function(data) {
            yaxis = [];
            dataArray = []
            var years = []
            var types = []
            $.each(data, function(key, value) {
                if ($.inArray(value.Year, years) < 0) {
                    years.push(value.Year)
                }
                if ($.inArray(value[aggregate], types) < 0) {
                    types.push(value[aggregate])
                }
            })
            $.each(types, function(typeKey, typeName) {
                dataArray = []
                labelArray = []
                options.series[typeKey] = [{}]
                options.series[typeKey].data = []
                options.series[typeKey].name = []
                dataArray[typeName] = []
                $.each(years, function(i, year){
                    dataVal = 0
                    $.each(data, function(key, value) {
                        if (value[aggregate] === typeName && value.Year == year) {
                            if(seriesData == "PercentChg_1991") {
                                dataVal += value[seriesData] * 100
                            } else {
                                dataVal += value[seriesData]
                            }
                        }
                    })
                    dataArray[typeName].push(dataVal);
                })
                options.series[typeKey].name = typeName;
                options.series[typeKey].data = dataArray[typeName];
            })

            options.xAxis.categories = years
            options.title.text = title
            chart = new Highcharts.Chart(options);
        })
    }
})(jQuery);
