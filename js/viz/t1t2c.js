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
        var $chartContainer = $('#T1-T2-C');
        $chartContainer.prepend('<h3 class="chart-title"></h3>');
        var $chartTitle = $chartContainer.find('h3.chart-title');

        // Set the default highcharts separator
        Highcharts.setOptions({
            lang: {
                decimalPoint: '.',
                thousandsSep: ','
            }
        });

        //REQUEST DATA FROM SERVER
        $.ajax({
            dataType: "json",
            url: "http://vitalsignsvs2.elasticbeanstalk.com/api/t1/metro",
            //data: data,
            async: false,
            success: successMetroDatat1a
        });

        function successMetroDatat1a(data) {
            t1aMetroData = data;
        }

        regionnames = _(t1aMetroData)
        .filter('Mode', 'Drive Alone')
        .sortBy('Share')
        .pluck('Metro')
        .value();
        
        var order = {};
        _.forEach(regionnames, function (name, index) {
          order[name] = index;
        });

        function getOrder(item) {
          return order[item.Metro];
        }
        
        function times100(x) {
          return x * 100;
        }

        drivealone = _(t1aMetroData)
        .filter('Mode', 'Drive Alone')
        .sortBy(getOrder)
        .pluck('Share')
        .map(times100)
        .value();

        carpool = _(t1aMetroData)
        .filter('Mode', 'Carpool')
        .sortBy(getOrder)
        .pluck('Share')
        .map(times100)
        .value();

        publictransit = _(t1aMetroData)
        .filter('Mode', 'Public Transit')
        .sortBy(getOrder)
        .pluck('Share')
        .map(times100)
        .value();

        walk = _(t1aMetroData)
        .filter('Mode', 'Walk')
        .sortBy(getOrder)
        .pluck('Share')
        .map(times100)
        .value();

        bike = _(t1aMetroData)
        .filter('Mode', 'Bike')
        .sortBy(getOrder)
        .pluck('Share')
        .map(times100)
        .value();

        other = _(t1aMetroData)
        .filter('Mode', 'Other')
        .sortBy(getOrder)
        .pluck('Share')
        .map(times100)
        .value();

        workathome = _(t1aMetroData)
        .filter('Mode', 'Telework')
        .sortBy(getOrder)
        .pluck('Share')
        .map(times100)
        .value();
        
        //CREATE CHART
        $chartTitle.html('Metro Comparison for 2014 Commute Mode Choice');
        var t1t2cChart = $('#T1-T2-C-chart').highcharts({
            chart: {
                type: 'bar',
                spacingTop: 0
            },
            title: {
                text: '&nbsp;',
                useHTML: true
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
