    //CREATE BAR CHART T7-A
        var t7cRegionData;
(function($) {
    $(function() {
      stackedColumnChart("http://vitalsignsvs2.elasticbeanstalk.com/api/t7/metro")
  });

  var focus_key = 'Total_Delay_per_Worker_Wkdy_min';
  var geo_key = 'Urbanized_Area';

  // Set the default highcharts separator
  Highcharts.setOptions({
      lang: {
          decimalPoint: '.',
          thousandsSep: ','
      }
  });

  function stackedColumnChart(dataUrl) {
    // Get the CSV and create the chart
    var options = {
      chart: {
        renderTo: 'T7-C-chart',
        defaultSeriesType: 'bar',
        marginTop: 40
      },
      title: {
        text: ''
      },
      exporting: {
          chartOptions: {
              title: {
                  text: 'Metro Comparison for 2014 Time Spent in Congestion'
              }
          }
      },
      exporting: {
          chartOptions: {
              title: {
                  text: 'Metro Comparison for 2011 Time Spent in Congestion'
              }
          }
      },      colors: allBlue, // ['#D9B305', '#EC7429'],
      series: [{
          name: 'val1',
          data: []
    }],
      yAxis: {
        title: {
          text: "Daily Minutes per Worker"
        }
      },
     xAxis: {
          categories: [],
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
      tooltip: {
          headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
          pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
          '<td style="padding:0"><b>{point.y:,.0f}</b> minutes</td></tr>',
          valueSuffix: ' minutes',
          footerFormat: '</table>',
          shared: true,
          useHTML: true
      },
      legend: {
        reversed: true
          },
        plotOptions: {
          bar: {
            grouping: false,
            shadow: false
          }
        }
      }

    jQuery.getJSON(dataUrl, function(data) {
      yaxis = [];
      dataArray = [];
      data = sortData(data, focus_key);

      _.each(data, function(data) {
        // console.log(data, Number(data[focus_key].toFixed(0)));
        dataArray.push(data[focus_key]);
        yaxis.push(data[geo_key]);
      })
      options.series = [{
        name: 'Total Delay',
        data: dataArray
      }];

      options.xAxis.categories = yaxis
      chart = new Highcharts.Chart(options);
    })
  }

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
    return sorted
}
})(jQuery);
