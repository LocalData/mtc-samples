/*globals
jQuery, L, geocities, allBlue, allOrange, altColors, Highcharts, turf, cartodb,
regionPromise, countyPromise, cityPromise, _
*/
var t3t4bcountylist;
var t3t4bcountydata;
var t3t4bregiondata;
var t3t4bmetrodata;
var t3t4bcitydata;
var t3t4bmetrochartdata = [];
var t3t4bmode;
var regiondata = [];

var drivealone;
var geojson;
var citydata;
var citysearchdata = [];
var countysearchdata = [];
var layersymbols;
var geocodelayer;
var citycombo;
var cityinfo;

var fieldToModeMapping = {
    OverallTime_Est: 'Overall',
    DATime_Est: 'Drive Alone',
    CPTime_Est: 'Carpool',
    PTTime_Est: 'Pubic Transit'
};

(function($) {
$(function() {
    // Set the default highcharts separator
    Highcharts.setOptions({
        lang: {
            decimalPoint: '.',
            thousandsSep: ','
        }
    });


    /*
    T1 & T3 are Home
    T2 & T4 are Work

    T3: Home
    T4: Work

    http://vitalsignsvs2.elasticbeanstalk.com/api/t3/region
    http://vitalsignsvs2.elasticbeanstalk.com/api/t3/city
    http://vitalsignsvs2.elasticbeanstalk.com/api/t3/tract
    http://vitalsignsvs2.elasticbeanstalk.com/api/t4/city
    */
    // Get the city data
    // Get the tract data
    // Show tract geodata the right zoom
    // Zoom out at right levels
    // Load the graphs and charts from existing data.

    //REQUEST CITY DATA FROM SERVER
    $.ajax({
        dataType: "json",
        // url: "http://vitalsigns-production.elasticbeanstalk.com/t3t4/cities",
        url: "http://vitalsignsvs2.elasticbeanstalk.com/api/t3/city",
        async: false,
        success: successCityDatat3t4b
    });

    function successCityDatat3t4b(data) {
        // Massage the data into the right format
        console.log("Got data", data);
        var cities = _.uniq(_.pluck(data, 'City'));
        t3t4bcitydata = {};
        _.each(cities, function(city) {
            if t3t4bcitydata[city] == undefined {
                t3t4bcitydata[city] = {};
            }

            _.each(fieldToModeMapping, function(mode, key) {
                var datapoint = _.find(data, {
                    City: city,
                    Mode: mode
                }).Time;
                t3t4bcitydata[city][key] = datapoint;
            });
        });

        console.log("GotT3T4 city data");
    }

    //REQUEST METRO DATA FROM SERVER
    $.ajax({
        dataType: "json",
        url: "http://vitalsigns-production.elasticbeanstalk.com/t3t4/metros",
        //data: data,
        async: false,
        success: successMetroDatat3t4b
    });

    function successMetroDatat3t4b(data) {
        t3t4bmetrodata = data;
    }

    //REQUEST REGION DATA FROM SERVER
    $.ajax({
        dataType: "json",
        url: "http://vitalsigns-production.elasticbeanstalk.com/t3t4/region",
        //data: data,
        async: false,
        success: successRegionDatat3t4b
    });

    function successRegionDatat3t4b(data) {
        t3t4bregiondata = data;

    }

    barChart("http://vitalsigns-production.elasticbeanstalk.com/t3t4/region", ["OverallTime_Est", "DATime_Est", "CPTime_Est", "PTTime_Est"], "Year", 2012, "Region")

    var hues = [
      '#bdd7e7',
      '#6baed6',
      '#3182bd',
      '#08519c'
      ];

    //CREATE DATA FOR COMBOBOXES
    var countiesDatat3t4b = [];
    var citiesDatat3t4b = [];
    for (var key in countylist) {
        countiesDatat3t4b.push({
            "county": countylist[key].County,
            "categoryid": countylist[key].CountyID
        });
    }

    for (var key2 in citylist) {
        citiesDatat3t4b.push({
            "name": citylist[key2].City,
            "categoryid": citylist[key2].CountyID,
            "value": citylist[key2].City
        });
    }

    //CREATE BUTTONS AND CLICK EVENTS T3-T4-B
    $("#overallButtont3t4b").click(function() {
        t3t4bmode = "OverallTime_Est";
        updateMapLayerst3t4b(t3t4bmode);
    });
    $("#datimeButtont3t4b").click(function() {
        t3t4bmode = "DATime_Est";
        updateMapLayerst3t4b(t3t4bmode);
    });
    $("#cptimeButtont3t4b").click(function() {
        t3t4bmode = "CPTime_Est";
        updateMapLayerst3t4b(t3t4bmode);
    });
    $("#pttimeButtont3t4b").click(function() {
        t3t4bmode = "PTTime_Est";
        updateMapLayerst3t4b(t3t4bmode);
    });

    //CREATE MAP AND ADD BASEMAP LAYER for T3-T4-B
    var t3t4map = L.map('t3t4map', {
        center: [37.7833, -122.4167],
        zoom: 9,
        fullscreenControl: true
    });

    // Add zoom prompt
    $('#map').append('<div class="zoom-in-prompt">Zoom in to see city-level data</div>');

    //CHANGE LAYERS BASED ON ZOOM EXTENT
    t3t4map.on({
        zoomend: manageLayerst3t4b
    });

    var CartoDB_PositronNoLabels = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
          subdomains: 'abcd',
          minZoom: 0,
          maxZoom: 18
        }).addTo(t3t4map);

    var legendControl = new L.Control.Legend();
    L.control.scale().addTo(t3t4map);

    legendControl.onAdd = function (t3t4map) {
      var startingValue = getRange(t3t4bcitydata, "OverallTime_Est")
      var div = L.DomUtil.create('div', 'info legend')
      $(div).addClass("col-lg-10")
      $(div).append("<h5>Overall Time</h5>")
      startingValue.unshift(1)
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < startingValue.length; i++) {
            div.innerHTML +=
                '<div><div class="col-lg-1" style="background:' + hues[i] + ';">&nbsp; </div><div class="col-lg-8">' +
                startingValue[i] + (startingValue[i + 1] ? '&ndash;' + startingValue[i + 1] + '</div>' : '+');
        }
        return div;
    }
    legendControl.addTo(t3t4map);

    function changeLegend(quantiles, title) {
      var div = $('.info.legend')
      $(div).empty()
      $(div).addClass("col-lg-10")
      $(div).append("<h5>"+title+"</h5>")
      quantiles.unshift(1)
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < quantiles.length; i++) {
            $(div).append('<div><div class="col-lg-1" style="background:' + hues[i] + ';">&nbsp; </div><div class="col-lg-8">' +
                quantiles[i] + (quantiles[i + 1] ? '&ndash;' + quantiles[i + 1] + '</div>' : '+'));
        }
     }

    var topTen = sortTopTen("OverallTime_Est");
    var bottomFive = sortBottomTen("OverallTime_Est")
    var topTenText = "<div class='row'><div class='col-lg-6'><h5>Cities with Shortest " + "Overall Commute" + "</h5>"
    $.each(topTen.slice(0,5), function(key, value) {
        topTenText += "<h6>" + (key *1 +1) + ". " + value.City + " " + value.OverallTime_Est + " minutes</h6>"
    })
    topTenText += "</div>"
    topTenText += "<div class='col-lg-6'><h5>Cities with Longest " + "Overall Commute" + "</h5>"
    $.each(bottomFive.slice(0,5), function(key, value) {
        topTenText += "<h6>" + (key *1 +1) + ". " + value.City + " " + value.OverallTime_Est + " minutes</h6>"
    })
    topTenText += "</div></div>"
    $("#T3-T4-B-chart3").html(topTenText);

    //CREATE SYMBOLOGY FOR INITIAL LAYER LOAD

    function stylet3t4b(feature) {
        t3t4bmode = "OverallTime_Est";
        return {
            fillColor: getUpdatedColort3t4b(feature.properties.NAME, t3t4bmode, "city"),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }

    function manageLayerst3t4b() {
        var zoomLevel = t3t4map.getZoom();
        if (zoomLevel >= 10) {
            $('.zoom-in-prompt').hide();
            if (!t3t4map.hasLayer(geojsont3t4b)) {
                t3t4map.removeLayer(geojson_countiest3t4b);
                geojsont3t4b.addTo(t3t4map);
            }
        } else if (zoomLevel < 10) {
            $('.zoom-in-prompt').show();
            if (t3t4map.hasLayer(geojsont3t4b)) {
                t3t4map.removeLayer(geojsont3t4b);
                t3t4map.addLayer(geojson_countiest3t4b);
            }
        }
    }

    // ZOOM TO FEATURES ON MAP CLICK AND UPDATE CHARTS
    function zoomToFeaturet3t4b(e) {

        var cityname = e.target.feature.properties.NAME;
        //console.log(cityname);

        //Dynamically update Shield Charts
        $(this).UpdateChartDatat3t4b(cityname);
        //Zoom to feature
        t3t4map.fitBounds(e.target.getBounds());
    }

    function zoomToFeatureCountyt3t4b(e) {

        var countyname = e.target.feature.properties.NAME;

        //Dynamically update Shield Charts
        $(this).UpdateCountyChartDatat3t4B(countyname);
        //Zoom to feature
        t3t4map.fitBounds(e.target.getBounds());
    }

    //SET PARAMETERS FOR EACH FEATURE AS IT IS INITIALIZED. POPULATE SEARCH ARRAYS
    function onEachFeaturet3t4b(feature, layer) {
        features = feature.properties;
        var bounds = layer.getBounds();
        citysearchdata.push({
            name: features.NAME,
            swbounds: bounds._southWest,
            nebounds: bounds._northEast,
            countyfip: features.COUNTY_FIP,
            county: features.NAME_1

        });
        layer.on({
            click: zoomToFeaturet3t4b
        });
        layer.bindLabel(feature.properties.NAME, { noHide: true })
    }

    //SET PARAMETERS FOR EACH FEATURE AS IT IS INITIALIZED. POPULATE COUNTY SEARCH ARRAY
    function onEachFeatureCountyt3t4b(feature, layer) {
        var extent = "county";
        features = feature.properties;
        var bounds = layer.getBounds();
        countysearchdata.push({
            name: features.NAME,
            swbounds: bounds._southWest,
            nebounds: bounds._northEast,
            countyfip: features.COUNTY_KEY

        });
        layer.on({
            click: zoomToFeatureCountyt3t4b
        });
        layer.bindLabel(feature.properties.NAME, { noHide: true })
    }

    //ADD LAYERS to T3-T4-B map
    var geojsont3t4b = L.geoJson(geocities, {
        style: stylet3t4b,
        onEachFeature: onEachFeaturet3t4b
    });

    var geojson_countiest3t4b = L.geoJson(geocounties, {
        style: stylet3t4bCounty,
        onEachFeature: onEachFeatureCountyt3t4b
    }).addTo(t3t4map);

   function getRange(data, value) {
      var range = []
      $.each(data, function(key, v) {
        range.push(v[value])
      })
      var breaks = science.stats.quantiles(range, [.25, .50, .75])
      return breaks
    }

    //CREATE SYMBOLOGY FOR MODE LAYERS. SYMBOLOBY UPDATES BASED ON BUTTON CLICK IN MODE MENU

    function getUpdatedColort3t4b(name, mode, geo) {
      var d;
      var key;
      var timeData;
      switch (mode) {
        case "OverallTime_Est":
          var quantiles = getRange(t3t4bcitydata, "OverallTime_Est")
          for (key in t3t4bcitydata) {
            if (name === t3t4bcitydata[key].City) {
              d = t3t4bcitydata[key].OverallTime_Est;
              return d > quantiles[2] ? hues[3] :
                    d > quantiles[1] ? hues[2] :
                    d > quantiles[0] ? hues[1] :
                    d <= quantiles[0] ? hues[0] :

                  '#d7f4f5';
            }
          }
          changeLegend(quantiles, "Overall Time")
          break;

          case "CPTime_Est":
            var quantiles = getRange(t3t4bcitydata, "CPTime_Est")
              for (key in t3t4bcitydata) {
                if (name === t3t4bcitydata[key].City) {
                  d = t3t4bcitydata[key].CPTime_Est;
                  return d > quantiles[2] ? hues[3] :
                          d > quantiles[1] ? hues[2] :
                          d > quantiles[0] ? hues[1] :
                          d <= quantiles[0] ? hues[0] :

                      '#d7f4f5';
                }
              }
              changeLegend(quantiles, "Carpool Time")
              break;

          case "PTTime_Est":
            var quantiles = getRange(t3t4bcitydata, "PTTime_Est")
              for (key in t3t4bcitydata) {
                if (name === t3t4bcitydata[key].City) {
                  d = t3t4bcitydata[key].PTTime_Est;
                  return d > quantiles[2] ? hues[3] :
                          d > quantiles[1] ? hues[2] :
                          d > quantiles[0] ? hues[1] :
                          d <= quantiles[0] ? hues[0] :

                      '#d7f4f5';
                }
              }
              changeLegend(quantiles, "Transit Time")
              break;

          case "DATime_Est":
            var quantiles = getRange(t3t4bcitydata, "DATime_Est")
              for (key in t3t4bcitydata) {
                if (name === t3t4bcitydata[key].City) {
                  d = t3t4bcitydata[key].DATime_Est;
                  return d > quantiles[2] ? hues[3] :
                          d > quantiles[1] ? hues[2] :
                          d > quantiles[0] ? hues[1] :
                          d <= quantiles[0] ? hues[0] :

                      '#d7f4f5';
                }
              }
              changeLegend(quantiles, "Drive Alone Time")
              break;
        }
      }

    function resetstylet3t4b(feature) {
        return {
            fillColor: getUpdatedColort3t4b(feature.properties.NAME, t3t4bmode),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }



    function updateMapLayerst3t4b(type) {
        t3t4bmetrochartdata = [];
        geojsont3t4b.setStyle(resetstylet3t4b);

        //UPDATE Top 10 Cities Div T3-T4-B-chart3 based on mode selected on the map

        switch (type) {
            case "DATime_Est":
                var topTen = sortTopTen("DATime_Est");
                var bottomFive = sortBottomTen("DATime_Est")
                var topTenText = "<div class='row'><div class='col-lg-6'><h5>Cities with Shortest " + "Single Driver Commute" + "</h5>"
                $.each(topTen.slice(0,5), function(key, value) {
                    topTenText += "<h6>" + (key *1 +1) + ". " + value.City + " " + value.DATime_Est + " minutes</h6>"
                })
                topTenText += "</div>"
                topTenText += "<div class='col-lg-6'><h5>Cities with Longest " + "Single Driver Commute" + "</h5>"
                $.each(bottomFive.slice(0,5), function(key, value) {
                    topTenText += "<h6>" + (key *1 +1) + ". " + value.City + " " + value.DATime_Est + " minutes</h6>"
                })
                topTenText += "</div></div>"
                $("#T3-T4-B-chart3").html(topTenText);
                break;
            case "CPTime_Est":
                var topTen = sortTopTen("CPTime_Est");
                var bottomFive = sortBottomTen("CPTime_Est")
                var topTenText = "<div class='row'><div class='col-lg-6'><h5>Cities with Shortest " + "Carpool" + "</h5>"
                $.each(topTen.slice(0,5), function(key, value) {
                    topTenText += "<h6>" + (key *1 +1) + ". " + value.City + " " + value.CPTime_Est + " minutes</h6>"
                })
                topTenText += "</div>"
                topTenText += "<div class='col-lg-6'><h5>Cities with Longest " + "Carpool" + "</h5>"
                $.each(bottomFive.slice(0,5), function(key, value) {
                    topTenText += "<h6>" + (key *1 +1) + ". " + value.City + " " + value.CPTime_Est + " minutes</h6>"
                })
                topTenText += "</div></div>"
                  $("#T3-T4-B-chart3").html(topTenText);
                break;
            case "PTTime_Est":
                var topTen = sortTopTen("PTTime_Est");
                var bottomFive = sortBottomTen("PTTime_Est")
                var topTenText = "<div class='row'><div class='col-lg-6'><h5>Cities with Shortest " + "Transit" + "</h5>"
                $.each(topTen.slice(0,5), function(key, value) {
                    topTenText += "<h6>" + (key *1 +1) + ". " + value.City + " " + value.PTTime_Est + " minutes</h6>"
                })
                topTenText += "</div>"
                topTenText += "<div class='col-lg-6'><h5>Cities with Longest " + "Transit" + "</h5>"
                $.each(bottomFive.slice(0,5), function(key, value) {
                    topTenText += "<h6>" + (key *1 +1) + ". " + value.City + " " + value.PTTime_Est + " minutes</h6>"
                })
                topTenText += "</div></div>"
                $("#T3-T4-B-chart3").html(topTenText);
                break;
            case "OverallTime_Est":
                var topTen = sortTopTen("OverallTime_Est");
                var bottomFive = sortBottomTen("OverallTime_Est")
                var topTenText = "<div class='row'><div class='col-lg-6'><h5>Cities with Shortest " + "Overall Commute" + "</h5>"
                $.each(topTen.slice(0,5), function(key, value) {
                    topTenText += "<h6>" + (key *1 +1) + ". " + value.City + " " + value.OverallTime_Est + " minutes</h6>"
                })
                topTenText += "</div>"
                topTenText += "<div class='col-lg-6'><h5>Cities with Longest " + "Overall Commute" + "</h5>"
                $.each(bottomFive.slice(0,5), function(key, value) {
                    topTenText += "<h6>" + (key *1 +1) + ". " + value.City + " " + value.OverallTime_Est + " minutes</h6>"
                })
                topTenText += "</div></div>"
                $("#T3-T4-B-chart3").html(topTenText);
                break;

        }
    }

  function sortTopTen(mode) {
    var noNull =[]
    $.each(t3t4bcitydata, function(index, val) {
       if(val[mode] !== null) {
        noNull[index] = []
        noNull[index][mode] = []
        noNull[index]["City"] = []
        noNull[index][mode].push(val[mode])
        noNull[index]["City"].push(val.City)
       }
    });
    var sorted = noNull.sort(function (a, b) {
      if (a[mode] > b[mode]) {
        return 1;
      }
      if (a[mode] < b[mode]) {
        return -1;
      }
      // a must be equal to b
      return 0;
    });
    return sorted
  }

  function sortBottomTen(mode) {
    var noNull =[]
    $.each(t3t4bcitydata, function(index, val) {
       if(val[mode] !== null) {
        noNull[index] = []
        noNull[index][mode] = []
        noNull[index]["City"] = []
        noNull[index][mode].push(val[mode])
        noNull[index]["City"].push(val.City)
       }
    });
    var sorted = noNull.sort(function (a, b) {
      if (a[mode] < b[mode]) {
        return 1;
      }
      if (a[mode] > b[mode]) {
        return -1;
      }
      // a must be equal to b
      return 0;
    });
    return sorted
  }
});


//JQUERY FUNCTINO FOR UPDATING CHARTS BASED ON MAP INTERACTION

$.fn.UpdateChartDatat3t4b = function(searchcity) {
    var chartTitle = searchcity
    barChart("http://vitalsigns-production.elasticbeanstalk.com/t3t4/cities", ["OverallTime_Est", "DATime_Est", "CPTime_Est", "PTTime_Est"], "City", searchcity, chartTitle)
}

$.fn.UpdateCountyChartDatat3t4B = function(searchcounty) {
    var chartTitle = searchcounty + " County"
    barChartYear("http://vitalsigns-production.elasticbeanstalk.com/t3t4/counties", ["OverallTime_Est", "DATime_Est", "CPTime_Est", "PTTime_Est"], "County", searchcounty, chartTitle)
    // Line Chart Data

};

function barChart(dataUrl, seriesData, searchField, searchTerm, title) {
    // Get the CSV and create the chart
    var options = {
          chart: {
              renderTo: 'T3-T4-B-chart',
              defaultSeriesType: 'bar'
              },

          series: [{
              name: 'val1',
              data: []
     }],
     exporting: {
         enabled: true
    },
    legend: {
        enabled: false
    },
    yAxis: {
          title: {
            text: 'Minutes'
          }
         },
     xAxis: {
          categories: []
      },

          title: {
              text: ''
          },

          tooltip: {
              shared: true,
              crosshairs: false,
              pointFormat: '<b>{point.y:.1f} minutes</b>'
          }
      }
  jQuery.getJSON(dataUrl, function(data) {
    yaxis = [];
    dataArray = []
    jQuery.each(seriesData, function(key, name) {
      jQuery.each(data, function(i,value) {
        if(value[searchField] === searchTerm) {
            dataArray.push(value[name]);
        }
      });
      switch(name) {
        case "DATime_Est":
          yaxis.push("Drive Alone");
          break;
        case "CPTime_Est":
          yaxis.push("Carpool");
          break;
        case "PTTime_Est":
          yaxis.push("Transit");
          break;
        case "OverallTime_Est":
          yaxis.push("Overall");
          break;
        }

    })
    options.series[0].data = dataArray;
    options.series[0].name = "Time";
    options.xAxis.categories = yaxis
    options.xAxis.title = "Time"
    options.title.text = title
    chart = new Highcharts.Chart(options);
  })
}

function barChartYear(dataUrl, seriesData, searchField, searchTerm, title) {
    // Get the CSV and create the chart
    var options = {
          chart: {
              renderTo: 'T3-T4-B-chart',
              defaultSeriesType: 'bar'
              },

          series: [{
              name: 'val1',
              data: []
     }],
     exporting: {
         enabled: true
    },
    legend: {
        enabled: false
    },
    yAxis: {
      title: {
        text: 'Minutes'
      }
     },
     xAxis: {
          categories: []
      },

          title: {
              text: ''
          },

          tooltip: {
              shared: true,
              crosshairs: false,
              pointFormat: '<b>{point.y:.1f} minutes</b>'
          }
      }

  jQuery.getJSON(dataUrl, function(data) {
    yaxis = [];
    dataArray = []
    jQuery.each(seriesData, function(key, name) {
      jQuery.each(data, function(i,value) {
        if(value[searchField] === searchTerm && value.Year === 2012) {
            dataArray.push(value[name]);
        }
      });
      switch(name) {
        case "DATime_Est":
          yaxis.push("Drive Alone");
          break;
        case "CPTime_Est":
          yaxis.push("Carpool");
          break;
        case "PTTime_Est":
          yaxis.push("Transit");
          break;
        case "OverallTime_Est":
          yaxis.push("Overall");
          break;
        }
    })
    options.series[0].data = dataArray;
    options.series[0].name = "Time";
    options.xAxis.categories = yaxis
    options.xAxis.title = "Time"
    options.title.text = title
    chart = new Highcharts.Chart(options);
  })
}
})(jQuery);
