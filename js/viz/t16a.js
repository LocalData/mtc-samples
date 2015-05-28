    //CREATE BAR CHART T16-A
    var t16acountylist;
    var t16acitydata;
    var t16acountydata;
    var t16aregiondata;
    var countyname;
    var cityname;
(function($) {
    $(function() {
        //REQUEST COUNTY LIST DATA FROM SERVER
        $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/counties",
            //data: data,
            async: false,
            success: successt16aCountyList
        });

        function successt16aCountyList(data) {
            t16acountylist = data;

        }


        //REQUEST COUNTY DATA FROM SERVER
        $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/t16/city",
            //data: data,
            async: false,
            success: successt16aCityData
        });

        function successt16aCityData(data) {
            t16acitydata = data;

        }


        //REQUEST COUNTY DATA FROM SERVER
        $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/t16/county",
            //data: data,
            async: false,
            success: successt16aCountyData
        });

        function successt16aCountyData(data) {
            t16acountydata = data;

        }

        //REQUEST REGION DATA FROM SERVER
        $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/t16/region",
            //data: data,
            async: false,
            success: successt16aRegionData
        });

        function successt16aRegionData(data) {
            t16aregiondata = data;

        }
        var yearNames = [2003, 2004, 2005, 2006, 2007,2009, 2010, 2011, 2012, 2013, 2014];
        var regionalPCI = [];

        for (var i = 0; i < yearNames.length; i++) {
          for (var key in t16aregiondata) {
            if(t16aregiondata[key]["3YRAverage"] != null && t16aregiondata[key].Year == yearNames[i]) {
                regionalPCI.push(Math.round(t16aregiondata[key]["3YRAverage"])*1/1);
            }
          }
        }


        var t1t2cChart = $('#T16-A-chart').highcharts({
            chart: {
                type: 'line'
            },
            colors: altColors,
            title: {
                text: 'Historical Trend for Street Pavement Condition - Bay Area'
            },
            xAxis: {
                categories: yearNames,
                title: {
                  text: ''
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Pavement Condition Index (PCI)<br/> ranging from 0 to 100',
                    margin: 25
                }
            },
            legend: {
                reversed: true
            },
            tooltip: {
                shared: true
            },
            plotOptions: {
                series: {
                    point: {
                        events: {
                            mouseOver: function() {
                                //console.log(this);
                                update_areachartinfot16a(this.category, this.y);

                            },
                            click: function() {
                                update_areachartinfot16a(this.category, this.y);
                            }
                        }
                    }
                }
            },
            series: [{
                name: 'PCI',
                data: regionalPCI
            }]

        });

        //CREATE COMBOX T16-A
        var cityid;
        var datat16a = [];
        t16acitydata = sortData(t16acitydata, "Jurisdiction")
        datat16a.push({
            text: "Bay Area",
            value: "Bay Area"
        });
        for (var id in t16acitydata) {

            if (cityid !== t16acitydata[id].Jurisdiction && t16acitydata[id].Jurisdiction != null) {
                datat16a.push({
                    text: t16acitydata[id].Jurisdiction,
                    value: t16acitydata[id].Jurisdiction
                });
            }
            cityid = t16acitydata[id].Jurisdiction;
        }


        $("#t16aCityCombo").kendoComboBox({
            text: "Select City...",
            dataTextField: "text",
            dataValueField: "value",
            dataSource: datat16a,
            select: ont16aSelect

        });

        //ON SELECT FUNCTION FOR COMBOBOX T6-A
        function ont16aSelect(e) {
            var dataItem = this.dataItem(e.item.index());
            if(dataItem.text == "Bay Area") {
              regionChart()
            } else {
              $(this).Updatet16aChartData(dataItem.text);
              cityinfo = dataItem.text;
            }
        }



        $.fn.Updatet16aChartData = function(searchcity) {
            var countyPCI = [];
            var cityPCI = [];
            var countyname
            cityname = searchcity;
            for (var i = 0; i < yearNames.length; i++) {
              for (var key in t16acitydata) {
                if (t16acitydata[key].Year == yearNames[i] && t16acitydata[key].Jurisdiction === searchcity){
                  cityPCI.push(Math.round(t16acitydata[key]["3YRAverage"]*1)/1);
                  countyname = t16acitydata[key].County;
                }
              }
              for (var items in t16acountydata) {
                if (t16acountydata[items].Year == yearNames[i] && t16acountydata[items].Jurisdiction == countyname) {
                    countyPCI.push(Math.round(t16acountydata[items]["3YRAverage"]*1)/1);
                }
              }
            }
            countyname += " County"

            var t14t15Chart = $('#T16-A-chart').highcharts({
                chart: {
                    type: 'line'
                },
                colors: altColors,
                title: {
                    text: "Historical Trend for Street Pavement Condition - "+searchcity +" and "+countyname
                },
                xAxis: {
                    categories: yearNames,
                    title: {
                        text: ''
                    }
                },
                yAxis: {
                  min: 0,
                  title: {
                    text: 'Pavement Condition Index (PCI)<br/> ranging from 0 to 100',
                    margin: 25
                  }
                },
                legend: {
                    reversed: false,
                    align: 'center',
                },
                tooltip: {
                    shared: true
                },
                plotOptions: {
                    series: {
                        point: {
                            events: {
                                mouseOver: function() {
                                    update_areachartinfot16a(this.category, this.y);
                                },
                                click: function() {
                                    update_areachartinfot16a(this.category, this.y);
                                }
                            }
                        }
                    }
                },
                series: [{
                    name: searchcity,
                    data: cityPCI
                }, {
                    name: countyname,
                    data: countyPCI
                }]

            });

        };

        //UPDATE T16-A-info Div with mode share estimates by city
        function update_areachartinfot16a(year, modevalue) {
            var cityvalue;
            var countyvalue;
            for (var key in t16acitydata) {
                if (year === t16acitydata[key].Year && t16acitydata[key].Jurisdiction === cityname) {
                    cityvalue = Math.round(t16acitydata[key]["3YRAverage"]*1)/1;
                }
            }
            for (var items in t16acountydata) {
                if (year === t16acountydata[items].Year && t16acountydata[items].Jurisdiction === countyname) {
                    countyvalue = Math.round(t16acountydata[items]["3YRAverage"]*1)/1;
                }
            }
            $("#T16-A-info").html("<table align='center'><tr><td class='tablecell'><i class='fa fa-car fa-2x' style='color: blue; text-shadow: 1px 1px 1px #000'></i>&nbsp;<b>" + cityvalue + "</b>&nbsp;</td><td class='tablecell'><i class='fa fa-cab fa-2x' style='color: orange; text-shadow: 1px 1px 1px #000'></i>&nbsp;<b>" + countyvalue + "</b>&nbsp;</td></tr></table>");

        }

      function regionChart() {
      var t1t2cChart = $('#T16-A-chart').highcharts({
              chart: {
                  type: 'line'
              },
             colors: altColors,
              title: {
                  text: 'Regional Annual PCI'
              },
              xAxis: {
                  categories: yearNames,
                  title: {
                    text: 'Pavement Condition Index (PCI) ranging from 0 to 100'
                  }
              },
              yAxis: {
                  min: 0,
                  title: {
                      text: ''
                  }
              },
              legend: {
                  reversed: true
              },
              plotOptions: {
                  series: {
                      point: {
                          events: {
                              mouseOver: function() {
                                  //console.log(this);
                                  update_areachartinfot16a(this.category, this.y);

                              },
                              click: function() {
                                  update_areachartinfot16a(this.category, this.y);
                              }
                          }
                      }
                  }
              },
              series: [{
                  name: 'PCI',
                  data: regionalPCI
              }]

          });
        return t1t2cChart
      }

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

    // function updateChartst16a(modet16a) {
    //     // console.log(modet6a);
    //     var regionnames = [];
    //     var drivealone = [];
    //     var carpool = [];
    //     var publictransit = [];
    //     var walk = [];
    //     var bike = [];
    //     var other = [];
    //     var workathome = [];
    //     for (var key in regions) {
    //         regionnames.push(regions[key].Region);
    //         drivealone.push(regions[key].DriveAlone);
    //         carpool.push(regions[key].Carpool);
    //         publictransit.push(regions[key].PublicTransit);
    //         walk.push(regions[key].Walk);
    //         bike.push(regions[key].Bike);
    //         other.push(regions[key].Other);
    //         workathome.push(regions[key].WorkatHome);
    //     }

    //     $('#T16-A-chart').highcharts({
    //         chart: {
    //             type: 'line'
    //         },
    //         title: {
    //             text: city + ': Historic Commute Mode Share (Data: 1980-2012)'
    //         },
    //         subtitle: {
    //             text: mode
    //         },
    //         xAxis: {
    //             categories: ['1750', '1800', '1850', '1900', '1950', '1999', '2050'],
    //             tickmarkPlacement: 'on',
    //             title: {
    //                 enabled: false
    //             }
    //         },
    //         yAxis: {
    //             title: {
    //                 text: 'Percent'
    //             }
    //         },
    //         tooltip: {
    //             enabled: false,
    //             pointFormat: '<span style="color:{series.color} ">{series.name}</span>: <b>{point.percentage:.1f}%</b> ({point.y:,.0f})</b>',
    //             shared: true
    //         },
    //         plotOptions: {
    //             series: {
    //                 lineWidth: 5
    //             },
    //             line: {
    //                 //                        dataLabels: {
    //                 //                            enabled: true
    //                 //                        },
    //                 enableMouseTracking: false
    //             }
    //         },
    //         series: [{
    //             name: 'Region',
    //             data: regiondata
    //         }, {
    //             name: 'County',
    //             data: countydata
    //         }, {
    //             name: city,
    //             data: citydata
    //         }]
    //     });



    // }
    })(jQuery);
