        //CREATE BAR CHART T9-A
    var t9ametrodata;
    var t9aregiondata;
    var data_years;
    var fwy_buffer_ampeak = [];
    var fwy_buffer_pmpeak = [];
    var fwy_buffer_overall = [];
    var regions;
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
        We no longer use the corridor data:
        //REQUEST DATA FROM SERVER
        //http://vitalsigns-production.elasticbeanstalk.com/t9/metros
        $.ajax({
            dataType: "json",
            url: "http://vitalsignsvs2.elasticbeanstalk.com/api/t9/corridor",
            //data: data,
            async: false,
            success: successCountyDatat9a
        });

        function successCountyDatat9a(data) {
            t9ametrodata = data;
        }*/

        //http://vitalsigns-production.elasticbeanstalk.com/t9/region
        $.ajax({
            dataType: "json",
            url: "http://vitalsignsvs2.elasticbeanstalk.com/api/t9/region"
        }).done(function(data) {
            regions = t9aregiondata = data;

            // Automatically pull the years available
            data_years = _.uniq(_.pluck(data, 'Year'));

            for (var id in t9aregiondata) {
                fwy_buffer_ampeak.push(t9aregiondata[id].BTI_AMPEAK);
                fwy_buffer_pmpeak.push(t9aregiondata[id].BTI_PMPEAK);
            }

            var t9aChart = $('#T9-A-chart').highcharts({
                chart: {
                    type: 'column',
                    marginTop: 40
                },
                title: {
                    text: ''
                },
                exporting: {
                    chartOptions: {
                        title: {
                            text: 'Historical Trend for Travel Time Reliability - Bay Area'
                        }
                    }
                },
                xAxis: {
                    categories: data_years
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Peak Period Buffer Time Index'
                    }
                },
                legend: {
                    reversed: false
                },
                tooltip: {
                    enabled: true,
                    pointFormat: '<span style="color:{series.color}">{series.name}</span>: {point.y:,.2f}</b>'
                },
                colors: altColors,
                plotOptions: {
                    series: {
                        //stacking: 'normal',
                        point: {
                            events: {
                                mouseOver: function() {
                                    //console.log(this);
                                    //update_areachartinfot9a(this.category, this.y.toFixed(2));

                                },
                                click: function() {
                                    //update_areachartinfot9a(this.category, this.y.toFixed(2));
                                }
                            }
                        }
                    }
                },
                series: [{
                    name: 'AM Peak',
                    data: fwy_buffer_ampeak
                }, {
                    name: 'PM Peak',
                    data: fwy_buffer_pmpeak
                }]

            });

        });


        //CREATE COMBOX T9-A

        var datat9a = [{
            text: "Metropolitan Areas",
            value: "Metropolitan Areas"
        }];
        $('#t9aCityCombo').hide();

        $.fn.Updatet9aChartData = function(searchcity) {
            fwy_buffer_overall = [];

            if (searchcity === "Metropolitan Areas") {
                var metronames = ["Atlanta", "Chicago", "Dallas", "Houston", "Los Angeles", "Miami", "New York", "Philadelphia", "San Francisco", "Washington"];
                for (var id in t9ametrodata) {

                    fwy_buffer_overall.push(t9ametrodata[id].BTI_overall);

                }
                //console.log(fwy_buffer_overall);
                var t9aChart = $('#T9-A-chart').highcharts({
                    chart: {
                        type: 'column'
                    },
                    title: {
                        text: 'Historical Trend for Travel Time Reliability'
                    },

                    subtitle: {
                        text: 'Top Metropolitan Areas'
                    },
                    xAxis: {
                        categories: metronames
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Peak Period Buffer Time Index'
                        }
                    },
                    legend: {
                        reversed: true
                    },
                    tooltip: {
                            enabled: true,
                            pointFormat: '<span style="color:{series.color}">{series.name}</span>: {point.y:,.2f}</b>',
                            shared: true
                    },
                    colors: altColors,
                    plotOptions: {
                        series: {
                            //stacking: 'normal',
                            point: {
                            }
                        }
                    },
                    series: [{
                        name: 'Overall',
                        data: fwy_buffer_overall
                    }]

                });
            }

        };

        //UPDATE T9-A-info Div with mode share estimates by city
        function update_areachartinfot9a(city, modevalue) {
            // console.log(city);
            for (var key in regions) {
                if (city === regions[key].Region) {
                    var total = regions[key].Bike + regions[key].Carpool + regions[key].DriveAlone + regions[key].Other + regions[key].PublicTransit + regions[key].Walk + regions[key].WorkatHome;
                    var drivealoneEst = (regions[key].DriveAlone / total * 100).toFixed();
                    var carpoolEst = (regions[key].Carpool / total * 100).toFixed();
                    var publictransitEst = (regions[key].PublicTransit / total * 100).toFixed();
                    var walkEst = (regions[key].Walk / total * 100).toFixed();
                    var bikeEst = (regions[key].Bike / total * 100).toFixed();
                    var otherEst = (regions[key].Other / total * 100).toFixed();
                    var workathomeEst = (regions[key].WorkatHome / total * 100).toFixed();

                    $("#T9-A-info").html("<table align='center'><tr><td class='tablecell'><i class='fa fa-car fa-2x' style='color: blue; text-shadow: 1px 1px 1px #000'></i>&nbsp;<b>" + drivealoneEst + "%</b>&nbsp;</td><td class='tablecell'><i class='fa fa-cab fa-2x' style='color: orange; text-shadow: 1px 1px 1px #000'></i>&nbsp;<b>" + carpoolEst + "%</b>&nbsp;</td><td class='tablecell'><i class='fa fa-plane fa-2x' style='color: green; text-shadow: 1px 1px 1px #000'></i>&nbsp;<b>" + publictransitEst + "%</b>&nbsp;</td><td class='tablecell'><i class='fa fa-gears fa-2x' style='color: red; text-shadow: 1px 1px 1px #000'></i>&nbsp;<b>" + walkEst + "%</b>&nbsp;</td><td class='tablecell'><i class='fa fa-male fa-2x' style='color: #1ea9af; text-shadow: 1px 1px 1px #000'></i>&nbsp;<b>" + bikeEst + "%</b>&nbsp;</td> <td class='tablecell'><i class='fa fa-cube fa-2x' style='color: brown; text-shadow: 1px 1px 1px #000'></i>&nbsp;<b>" + otherEst + "%</b>&nbsp;</td><td class='tablecell'><i class='fa fa-home fa-2x' style='color: purple; text-shadow: 1px 1px 1px #000'></i>&nbsp;<b>" + workathomeEst + "%</b>&nbsp;</td></tr><tr><td><b>Drive Alone</b></td><td><b>Carpool</b></td><td><b>Public Transit</b></td><td><b>Walk</b></td><td><b>Bike</b></td><td><b>Other</b></td><td><b>Work from Home</b></td></tr></table>");
                }
            }
        }

    });
})(jQuery);
