/*globals
jQuery, L, cartodb, geocities, allBlue, altColors, Highcharts, science,
regionPromise, countyPromise: true
*/

(function($) {
  var regionData = [];
  var countyData;
  var selectedGeography = 'Bay Area';

  var COUNTY_KEY = 'County';
  var FOCUS_KEY = 'Congest_Share';
  var YEAR_KEY = 'Year';
  var DASH = 'ShortDash';

  var yearNames;
  var i;

  // Set the default highcharts separator
  Highcharts.setOptions({
    lang: {
      decimalPoint: '.',
      thousandsSep: ','
    }
  });

  function getSeries() {
    var series = [];
    // Add the regional data to series
    series.push({
      name: 'Bay Area',
      data: regionData,
      lineWidth: 3.5
    });

    // If all we need is the Bay Area:
    if (selectedGeography === 'Bay Area') {
      return series;
    }

    // Get the data for a selected county:
    var dataForCounty = _.where(countyData, {
      County: selectedGeography
    });

    // Add cthe county data to the series
    series.push({
      name: selectedGeography,
      data: _.pluck(dataForCounty, FOCUS_KEY),
      lineWidth: 1.5,
      dashStyle: DASH
    });

    return series;
  }

  function chart() {
    // We build the chart
    // var counties =  [{ GeoName: 'Bay Area' }].concat(_.uniq(countyData, COUNTY_KEY));
    var tooltip = {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y:,.1f}%</b></td></tr>',
        footerFormat: '</table>',
        formatter: function() {
          // Sort the tooltip by size to track the line order
          var points = _.sortBy(this.points, 'y').reverse();
          var s = '<span style="font-size:10px">' + this.x + '</span><table>';
          _.each(points, function(p) {
            s += '<tr><td><strong style="color:' + p.series.color + '">';
            s += p.series.name + ':';
            s += '</strong></td><td> <strong>';
            s += p.y + '%';
            s += '</strong></tr>';
          });
          s += '</table>';
          return s;
        },
        shared: true,
        useHTML: true
    };

    $('#T8-chart').highcharts({
      title: {
        text: '' // 'Historical Trend for Share of Miles Traveled in Congestion'
      },
      colors: allBlue,
      xAxis: {
        categories: yearNames
      },
      labels: {
      },
      yAxis: {
        title: {
          text: "Share of Miles Traveled in Congestion (%)"
        },
        min: 0,
        max: 10
      },
      legend: {
        symbolWidth: 35
      },
      tooltip: tooltip,
      series: getSeries()
    });
  }

  function selectLocation(e) {
    if (!e) {
      selectedGeography = 'Bay Area';
      chart();
      return;
    }

    // e might be an event or actual location data.
    var location;
    if (e.County) {
        location = e;
    } else {
        location = this.dataItem(e.item.index());
    }

    var county = location[COUNTY_KEY];
    selectedGeography = county;

    chart();
  }

  function setup() {
    var counties =  [{ County: 'Bay Area' }].concat(_.uniq(countyData, COUNTY_KEY));
    console.log("Using counties", counties, countyData);
    $("#t-county-select").kendoComboBox({
      text: "Select County...",
      dataTextField: COUNTY_KEY,
      dataValueField: COUNTY_KEY,
      dataSource: counties,
      select: selectLocation
    });

    chart();
  }

  function prepData(regionDataRaw, countyDataRaw) {
    // Get the years available
    yearNames = [];
    var years = _.pluck(regionDataRaw[0], YEAR_KEY);
    var maxYear = _.max(years);
    var minYear = _.min(years);
    for (i = minYear; i <= maxYear; i++) {
        yearNames.push(i);
    }

    // Format the regional data
    _.each(regionDataRaw[0], function(data) {
      regionData.push(Number((data[FOCUS_KEY]*100).toFixed(1)));
    });

    // Format the county data
    countyData = countyDataRaw[0];
    for (i = 0; i < countyData.length; i++) {
      countyData[i][FOCUS_KEY] = Number((countyData[i][FOCUS_KEY] * 100).toFixed(1));
    }

    setup();
  }

  var regionPromise = $.ajax({
      dataType: "json",
      url: "http://vitalsigns-production.elasticbeanstalk.com/t8/region"
  });
  var countyPromise = $.ajax({
      dataType: "json",
      url: "http://vitalsigns-production.elasticbeanstalk.com/t8/counties"
  });

  $.when(regionPromise, countyPromise).done(prepData);
})(jQuery);
