(function($) {
    // Set the default highcharts separator
    Highcharts.setOptions({
        lang: {
            decimalPoint: '.',
            thousandsSep: ','
        }
    });

    $(function() {
        lineChartAggregate("http://vitalsigns-production.elasticbeanstalk.com/t18/metros", "Year", ["Percent"], "Metro", "" )
    })
    function lineChartAggregate(dataUrl, seriesName, seriesData, aggregate, title) {
        // Get the CSV and create the chart
        var options = {
            chart: {
                renderTo: 'T18-C-chart',
                defaultSeriesType: 'line'
            },

            series: [{
                name: 'val1',
                data: []
            }],
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    second: '%Y-%m-%d<br/>%H:%M:%S',
                    minute: '%Y-%m-%d<br/>%H:%M',
                    hour: '%Y-%m-%d<br/>%H:%M',
                    day: '%Y<br/>%m-%d',
                    week: '%Y<br/>%m-%d',
                    month: '%Y-%m',
                    year: '%Y'
                },
                tickmarkPlacement: 'on',
                title: {
                    enabled: false
                }
            },

            title: {
                text: ''
            },
            exporting: {
                chartOptions: {
                    title: {
                        text: 'Metro Comparison for Bridge Condition'
                    }
                }
            },
            yAxis: {
                min: 1,
                max: 40,
                labels: {
                    format: '{value}%'
                },
                title: {
                    text: 'Weighted Share of Structurally Deficient Bridges'
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' + '<td style="padding:0"><b>{point.y:,.1f}%</b></td></tr>',
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
            });
            types.sort();
            years.sort();
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
                            dataVal += value[seriesData]*100
                        }
                    })
                    dataArray[typeName].push([Date.UTC(year, 0, 1),dataVal]);
                })
                options.series[typeKey].name = typeName;
                options.series[typeKey].data = dataArray[typeName];
            })

            var temp_year=[];
            $.each(years, function(i, year){
                temp_year.push(Date.UTC(year, 0, 1));
            });

            //options.xAxis.categories = temp_year;
            options.title.text = title;
            chart = new Highcharts.Chart(options);
        })
    }
})(jQuery);
