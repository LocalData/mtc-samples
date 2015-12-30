//CREATE BAR CHART T16-A
var t16acountylist;
var t16acitydata;
var t16acountydata;
var t16aregiondata;
var countyname;
var cityname;
(function($) {
    $(function() {
        // Set the default highcharts separator
        Highcharts.setOptions({
            lang: {
                decimalPoint: '.',
                thousandsSep: ','
            }
        });

        //REQUEST REGION DATA FROM SERVER
        $.ajax({
            dataType: "json",
            url: "http://vitalsigns-production.elasticbeanstalk.com/t17/region",
            //data: data,
            async: false,
            success: successt16aRegionData
        });

        function successt16aRegionData(data) {
            t16aregiondata = data;
        }
        var yearNames = [2000,2001, 2002, 2003, 2004, 2005, 2007,2011, 2013];
        var regionData = [];

        for (var key in t16aregiondata) {
            if(t16aregiondata[key]["Share"] != null) {
                regionData.push([Date.UTC(t16aregiondata[key].Year, 0, 1),Math.round((t16aregiondata[key]["Share"])*100)*1/1]);
            }
        }
        console.log(regionData);
        var t1t2cChart = $('#T17-A-chart').highcharts({
            chart: {
                type: 'line',
                marginTop: 40
            },
            title: {
                text: ''
            },
            exporting: {
                chartOptions: {
                    title: {
                        text: 'Historical Trend for Highway Pavement Condition - Bay Area'
                    }
                }
            },
            xAxis: {
                type: 'datetime',
                //categories: yearNames,
                title: {
                    text: ''
                }
            },
            colors: altColors,
            yAxis: {
                min: 0,
                title: {
                    text: 'Distressed Share of Highway Lane-Miles'
                },
                labels: {
                    format: '{value}%'
                }
            },
            legend: {
                reversed: true,
                enabled: false
            },
            tooltip: {
                shared: true,
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:,.0f}%</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
                // pointFormat: "Region: {point.y:.0f}% "
            },
            series: [{
                name: 'Region',
                data: regionData
            }]

        });
    });
    function sortData(data, value) {
        var sorted = data.sort(function (a, b) {
            if (a[value] < b[value]) {
                return 1;
            }
            if (a[value] > b[value]) {
                return -1;
            }
            // a must be equal to b
            return 0;
        });
        return sorted.reverse()
    }
})(jQuery);
