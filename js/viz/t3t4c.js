//CREATE CHART T3-T4-C
var t3t4metrodata;
var metros2009 = [];
var metros2010 = [];
var metros2011 = [];
var metros2012 = [];
var mode = "OverallTime_Est";

(function($) {
  $(function() {
    $('#T3-T4-C').prepend('<h3 class="chart-title">Metro Comparison for 2012 Commute Time</h3>');

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
      stackedChart('http://vitalsigns-production.elasticbeanstalk.com/t3t4/metros', 'Metro_Name', ["OverallTime_Est"])
      $(this).addClass("active")
      $(this).siblings('a').removeClass('active');
    });

    $("#datimeButtont3t4c").kendoButton({
        enable: true
    });
    $("#datimeButtont3t4c").click(function() {
      stackedChart('http://vitalsigns-production.elasticbeanstalk.com/t3t4/metros', 'Metro_Name', ["DATime_Est"])
      $(this).addClass("active")
      $(this).siblings('a').removeClass('active');
    });
    $("#cptimeButtont3t4c").kendoButton({
        enable: true
    });
    $("#cptimeButtont3t4c").click(function() {
      stackedChart('http://vitalsigns-production.elasticbeanstalk.com/t3t4/metros', 'Metro_Name', ["CPTime_Est"])
      $(this).addClass("active")
      $(this).siblings('a').removeClass('active');
    });

    $("#pttimeButtont3t4c").kendoButton({
        enable: true
    });
    $("#pttimeButtont3t4c").click(function() {
      stackedChart('http://vitalsigns-production.elasticbeanstalk.com/t3t4/metros', 'Metro_Name', ["PTTime_Est"])
      $(this).addClass("active")
      $(this).siblings('a').removeClass('active');
    });
    stackedChart('http://vitalsigns-production.elasticbeanstalk.com/t3t4/metros', 'Metro_Name', ["OverallTime_Est"])
});


function stackedChart(dataUrl, seriesName, seriesData) {
    // Get the CSV and create the chart
    var options = {
          chart: {
              renderTo: 'chart1',
              defaultSeriesType: 'bar'
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
              text: '&nbsp;',
              useHTML: true
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
  jQuery.getJSON(dataUrl, function(data) {
    yaxis = [];
    dataArray = []
    data = sortData(data, seriesData)
    jQuery.each(seriesData, function(key, name) {
      dataArray[name] = []
      options.series[key] = [{}]
      options.series[key].data = []
      options.series[key].name = []
      jQuery.each(data, function(i,value) {
        if(value.Year == "2012") {
            nameVal = value[seriesName]
            dataArray[name].push(value[name]);
            yaxis.push([nameVal])
        }
      });
    options.series[key].data = dataArray[name];
    switch(name) {
      case "DATime_Est":
        options.series[key].name = "Drive Alone";
        break;
      case "CPTime_Est":
        options.series[key].name = "Carpool";
        break;
      case "PTTime_Est":
        options.series[key].name = "Transit";
        break;

      }
    })
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
    return sorted.reverse()
  }
})(jQuery);
