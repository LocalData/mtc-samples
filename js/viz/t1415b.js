//Global Variables
var t11415bData;
var regionnames = [];
var years = [];
var values = [];
(function($) {
    // Set the default highcharts separator
    Highcharts.setOptions({
        lang: {
            decimalPoint: '.',
            thousandsSep: ','
        }
    });

    $(function() {
        // $("#t14Button").kendoButton({
        //     enable: true
        // });
        $("#t14Button").click(function() {
            $(this).addClass("active")
            $(this).siblings('a').removeClass('active');
            lineChart14();
        });
        // $("#t15Button").kendoButton({
        //     enable: true
        // });
        $("#t15Button").click(function() {
            $(this).addClass("active")
            $(this).siblings('a').removeClass('active');
            lineChart15();
        });
        //First
        lineChart15();
    })
    function lineChart14(){
        //REQUEST DATA FROM SERVER
        $.ajax({
            dataType: "json",
            url: "http://vitalsignsvs2.elasticbeanstalk.com/api/t14/metro",
            //data: data,
            async: false,
            success: successData
        });
        function successData(data) {
            t11415bData = data;
        }
        values = [];
        regionnames = [];
        years = [];
        t11415bData.sort(function(a, b){
            return a.VMT - b.VMT;
        });
        for (var key in t11415bData) {
            var valor = t11415bData[key].VMT;
            values.push({year:t11415bData[key].Year, value: parseFloat(t11415bData[key].VMT.toFixed())});
            regionnames.push(t11415bData[key].Metro);
            years.push(t11415bData[key].Year);
        }
        var yearValues = {}, letter, i;
        for (i=0; i < values.length; i++) {
            letter = values[i].year;
            // if other doesn't already have a property for the current letter
            // create it and assign it to a new empty array
            if (!(letter in yearValues)){
                yearValues[letter] = [];
            }
            yearValues[letter].push(values[i].value);
        }
        //Remove duplicates = years
        var uniqueYears = [];
        $.each(years, function(i, el){
            if($.inArray(el, uniqueYears) === -1) uniqueYears.push(el);
        });
        //Remove duplicates = names
        var uniqueNames = [];
        $.each(regionnames, function(i, el){
            if($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
        });
        //CREATE CHART
        var title = 'Metro Comparison for 2013 Daily Miles Traveled';
        $('#T1415-B .chart-title').html(title);
        var t1t2cChart = $('#T1415B-chart').highcharts({
            chart: {
                type: 'bar',
                marginTop: 40
            },
            title: {
                text: ''
            },
            exporting: {
                chartOptions: {
                    title: {
                        text: title
                    }
                }
            },
            xAxis: {
                categories:  uniqueNames,
                labels: {
                    formatter: function () {
                        if ('Bay Area' === this.value) {
                            return '<span style="font-weight:bold">' + this.value + '</span>';
                        } else {
                            return this.value;
                        }
                    }
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Miles'
                },
                reversedStacks: false
            },
            legend: {
                enabled: false,
            },
            colors: altColors,
            plotOptions: {
                series: {
                    stacking: 'normal'
                },
                bar: {
                    colorByPoint: true
                }
            },
            tooltip: {
                pointFormat: "<b>{series.name}</b> {point.y:,.0f}"
            }
        });
        t13achart = $('#T1415B-chart').highcharts();
        for (i=0; i < uniqueYears.length; i++) {
            t13achart.addSeries({
                "name": uniqueYears[i],
                "data":yearValues[uniqueYears[i]]
            });
        }
    }
    function lineChart15(){
        //REQUEST DATA FROM SERVER
        $.ajax({
            dataType: "json",
            url: "http://vitalsignsvs2.elasticbeanstalk.com/api/t15/metro",
            //data: data,
            async: false,
            success: successData
        });
        function successData(data) {
            t11415bData = data;
        }
        values = [];
        regionnames = [];
        years = [];
        t11415bData.sort(function(a, b){
            return parseFloat(a.VMTpc) - parseFloat(b.VMTpc)
        });
        for (var key in t11415bData) {
            values.push({year:t11415bData[key].Year, value:t11415bData[key].VMTpc});
            regionnames.push(t11415bData[key].Metro);
            years.push(t11415bData[key].Year);
        }
        var yearValues = {}, letter, i;
        for (i=0; i < values.length; i++) {
            letter = values[i].year;
            // if other doesn't already have a property for the current letter
            // create it and assign it to a new empty array
            if (!(letter in yearValues)){
                yearValues[letter] = [];
            }
            yearValues[letter].push(values[i].value);
        }
        //Remove duplicates = years
        var uniqueYears = [];
        $.each(years, function(i, el){
            if($.inArray(el, uniqueYears) === -1) uniqueYears.push(el);
        });
        //Remove duplicates = names
        var uniqueNames = [];
        $.each(regionnames, function(i, el){
            if($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
        });
        //uniqueNames.sort(function(a, b){return b-a});
        //CREATE CHART
        var title = 'Metro Comparison for 2013 Per-Capita Daily Miles Traveled';
        $('#T1415-B .chart-title').html();
        var t1t2cChart = $('#T1415B-chart').highcharts({
            chart: {
                type: 'bar',
                marginTop: 40
            },
            title: {
                text: ''
            },
            exporting: {
                chartOptions: {
                    title: {
                        text: title
                    }
                }
            },
            xAxis: {
                categories:  uniqueNames,
                labels: {
                    formatter: function () {
                        if ('Bay Area' === this.value) {
                            return '<span style="font-weight:bold">' + this.value + '</span>';
                        } else {
                            return this.value;
                        }
                    }
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Miles'
                },
                reversedStacks: false
            },
            legend: {
                enabled: false,
            },
            colors: altColors,
            plotOptions: {
                series: {
                    stacking: 'normal'
                },
                bar: {
                    colorByPoint: true
                }
            },
            tooltip: {
                pointFormat: "<b>{series.name}</b> {point.y:.1f} "
            }
        });
        t13achart = $('#T1415B-chart').highcharts();
        yearValues[2013].sort();
        for (i=0; i < uniqueYears.length; i++) {
            t13achart.addSeries({
                "name": uniqueYears[i],
                "data":yearValues[uniqueYears[i]]
            });
        }
    }
})(jQuery);
