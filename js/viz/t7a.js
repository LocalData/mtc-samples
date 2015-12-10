    //CREATE BAR CHART T7-A
  (function($) {
    $(function() {
      lineChart("http://vitalsignsvs2.elasticbeanstalk.com/api/t7/region", "Year", ["Congested_Delay_per_Worker_Wkdy_min", "Total_Delay_per_Worker_Wkdy_min"]);
    });

    // Set the default highcharts separator
    Highcharts.setOptions({
        lang: {
            decimalPoint: '.',
            thousandsSep: ','
        }
    });

  function lineChart(dataUrl, seriesName, seriesData) {
    // Get the CSV and create the chart
    var options = {
      chart: {
        renderTo: 'T7-A-chart',
        defaultSeriesType: 'area',
        marginTop: 40
      },
      title: {
        text: ''
      },
      colors: [allBlue[3], allBlue[0]], // ['#EC7429', '#D9B305'],
      series: [{
          name: 'val1',
          data: []
      }],
      plotOptions: {
            series: {
                fillOpacity: 0.25
            }
        },
      yAxis: {
        title: {
          text: "Daily Minutes per Worker"
        }
      },
      xAxis: {
          categories: []
      },
      tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y:,.1f} minutes</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
      }
    }

    jQuery.getJSON(dataUrl, function(data) {
      yaxis = [];
      dataArray = []
      jQuery.each(seriesData, function(key, name) {
        dataArray[name] = []
        options.series[key] = [{}]
        options.series[key].data = []
        options.series[key].name = []
        jQuery.each(data, function(i,value) {
          nameVal = value[seriesName]
          dataArray[name].push(value[name]);
          yaxis.push([nameVal])
        });
      options.series[key].data = dataArray[name];
      switch(name) {
        case "Total_Delay_per_Worker_Wkdy_min":
          options.series[key].name = "Total Delay";
          break;
        case "Congested_Delay_per_Worker_Wkdy_min":
          options.series[key].name = "Congested Delay";
          break;
        }
      })
      options.xAxis.categories = yaxis
      chart = new Highcharts.Chart(options);
    })
  }
})(jQuery);
