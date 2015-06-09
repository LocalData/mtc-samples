    //Global Variables
    var t1aMetroData;
    var regionnames = [];
    var drivealone = [];
    var carpool = [];
    var publictransit = [];
    var walk = [];
    var bike = [];
    var other = [];
    var workathome = [];
    var year = 2012;
(function($) {
    $(function() {
        //REQUEST DATA FROM SERVER
        $.ajax({
            dataType: "json",
            url: "http://vitalsigns-production.elasticbeanstalk.com/t1t2/t1/metros",
            //data: data,
            async: false,
            success: successMetroDatat1a
        });

        function successMetroDatat1a(data) {
            t1aMetroData = data;
        }
        t1aMetroData = sortData(t1aMetroData, "DriveAlone_Est")
        for (var key in t1aMetroData) {
            if (t1aMetroData[key].Year === 2012) {
                regionnames.push(t1aMetroData[key].Name);
                drivealone.push(t1aMetroData[key].DriveAlone_Est);
                carpool.push(t1aMetroData[key].Carpool_Est);
                publictransit.push(t1aMetroData[key].Transit_Est);
                walk.push(t1aMetroData[key].Walk_Est);
                bike.push(t1aMetroData[key].Bike_Est);
                other.push(t1aMetroData[key].Other_Est);
                workathome.push(t1aMetroData[key].Telework_Est);
            }
        }

        //CREATE CHART
        var t1t2cChart = $('#T1-T2-C-chart').highcharts({
            chart: {
                type: 'bar'
            },
            title: {
                text: 'Metro Comparison for 2012 Commute Mode Choice'
            },
            xAxis: {
                categories: regionnames,
                labels: {
                formatter: function () {
                    if ('Bay Area' == this.value) {
                        return '<span style="font-weight:800;color:#000;">' + this.value + '</span>';
                    } else {
                        return this.value;
                    }
                }
              }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Percent (Share)'
                },
                reversedStacks: false
            },
            legend: {
                enabled: true,
            },
            colors: altColors,

            plotOptions: {
                series: {
                    stacking: 'percent'
                }
              },
            tooltip: {
                pointFormat: "<b>{series.name}</b> {point.y:.1f}% "
            },
            series: [{
                name: 'Drive Alone',
                data: drivealone
            },{
                name: 'Carpool',
                data: carpool
            }, {
                name: 'Public Transit',
                data: publictransit
            }, {
                name: 'Walk',
                data: walk
            }, {
                name: 'Bike',
                data: bike
            }, {
                name: 'Other',
                data: other
            }, {
                name: 'Telecommute',
                data: workathome
            }]
        });
  })

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
