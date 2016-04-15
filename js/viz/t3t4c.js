//CREATE CHART T3-T4-C
var t3t4metrodata;
var metros2009 = [];
var metros2010 = [];
var metros2011 = [];
var metros2012 = [];
var mode = "OverallTime_Est";

(function($) {
  $(function() {
    var data;
    $('#T3-T4-C').prepend('<h3 class="chart-title">Metro Comparison for 2014 Commute Time</h3>');

    // Set the default highcharts separator
    Highcharts.setOptions({
        lang: {
            decimalPoint: '.',
            thousandsSep: ','
        }
    });

    //ON SELECT FUNCTION FOR COMBOBOX T3-T4-C
    function ont3t4cSelect(e) {
       // console.log(e);
        var dataItem = this.dataItem(e.item.index());
       // console.log(dataItem);
        $(this).Updatet3t4cChartData(dataItem.text);
        cityinfo = dataItem.text;
    }

    //CREATE BUTTONS AND CLICK EVENTS T3-T4-C
    $("#overallButtont3t4c").kendoButton({
        enable: true

    });
    $("#overallButtont3t4c").click(function() {
      stackedChart(data, 'Metro', 'Overall')
      $(this).addClass("active")
      $(this).siblings('a').removeClass('active');
    });

    $("#datimeButtont3t4c").kendoButton({
        enable: true
    });
    $("#datimeButtont3t4c").click(function() {
      stackedChart(data, 'Metro', 'Drive Alone')
      $(this).addClass("active")
      $(this).siblings('a').removeClass('active');
    });
    $("#cptimeButtont3t4c").kendoButton({
        enable: true
    });
    $("#cptimeButtont3t4c").click(function() {
      stackedChart(data, 'Metro', 'Carpool')
      $(this).addClass("active")
      $(this).siblings('a').removeClass('active');
    });

    $("#pttimeButtont3t4c").kendoButton({
        enable: true
    });
    $("#pttimeButtont3t4c").click(function() {
      stackedChart(data, 'Metro', 'Public Transit')
      $(this).addClass("active")
      $(this).siblings('a').removeClass('active');
    });

    jQuery.getJSON('http://vitalsignsvs2.elasticbeanstalk.com/api/t3/metro', function (result) {
        data = result;
        stackedChart(data, 'Metro', 'Overall')
    });
});


function stackedChart(rawData, seriesName, seriesData) {
    // Get the CSV and create the chart
    var options = {
          chart: {
              renderTo: 'chart1',
              defaultSeriesType: 'bar',
              marginTop: 40
              },
              plotOptions: {
            },
          series: [{
              name: 'val1',
              data: []
         }],
         yAxis: {
          title: {
            text: 'Minutes'
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
        legend: {
          enabled: false
        },
        title: {
          text: ''
        },
        exporting: {
            chartOptions: {
                title: {
                    text: 'Metro Comparison for 2014 Commute Time'
                }
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="padding:0"><b>{point.y:,.1f} minutes</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true,
            crosshairs: false
        }
    }
    var data = _(rawData).filter('Mode', seriesData).sortBy('Avg_Commute_Time').value();
    options.series = [{
      data: _.pluck(data, 'Avg_Commute_Time')
    }];
    options.xAxis.categories = _.pluck(data, 'Metro');
    chart = new Highcharts.Chart(options);
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
    return sorted.reverse()
  }
})(jQuery);
