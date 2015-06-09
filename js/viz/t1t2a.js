/*globals
jQuery, L, cartodb, geocities, altColors, Highcharts, science, countylist,
regionPromise, cityPromiseT1, cityPromiseT2, countyPromiseT1, countyPromiseT2
*/

//Global Variables
var t1aRegionData;
var t1aCountyData;
var t2aCountyData;
var t1aCityData;
var t2aCityData;
var countycombot1t2;
var countyinfo = null;

var drivealonereg = [];
var drivereg = [];
var carpoolreg = [];
var transitreg = [];
var walkreg = [];
var bikereg = [];
var otherreg = [];
var teleworkreg = [];

var areaChart;
(function($) {

    function ready() {

        // Create the initial area chart
        areaChart =  $('#areaChart_T1-T2-A').highcharts({
            chart: {
                type: 'area'
            },
            title: {
                text: 'Historical Trend for Commute Mode Choice - Bay Area'
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    year: '%Y'
                },
                tickmarkPlacement: 'on',
                title: {
                    enabled: false
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Percent (Share)'
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:,.1f}%</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            legend:{
                enabled: true
            },
            plotOptions: {
                area: {
                    stacking: 'percent',
                    lineColor: '#ffffff',
                    lineWidth: 1,
                    marker: {
                        lineWidth: 1,
                        lineColor: '#ffffff'
                    },
                    point:{
               events : {
                legendItemClick: function(e){
                    e.preventDefault();
                }
               }
           }
                }
            },
            colors: altColors,
            series: [{
                name: 'Auto',
                data: drivereg
            }, {
                name: 'Transit',
                data: transitreg
            }, {
                name: 'Walk',
                data: walkreg
            }, {
                name: 'Other',
                data: otherreg
            }, {
                name: 'Telecommute',
                data: teleworkreg
            }]
        });


        // CREATE DATA FOR COMBOBOX
        var datat1t2a = [];
        var id;
        _.each(countylist, function(county) {
            datat1t2a.push({
                "value": county.County,
                "text": county.County,
                "id": county.CountyID
            });
        });

        function onSelect(e) {
            $(this).UpdateChartData(e.text);
            countyinfo = e.text;
        }

        $("#countySelect").select2({
            placeholder: "Select a County",
            allowClear: true,
            data:{ results: datat1t2a, text: 'text' },
            id: function(data){return {id: data.id};}
        });
        $("#countySelect").on("change", function(e) {
          onSelect(e.added);
        });


        $.fn.UpdateChartData = function(searchtext) {
            searchtext = searchtext.toString();

            //FOR BAY AREA
            if (searchtext === "Bay Area") {
                $('#areaChart_T1-T2-A').highcharts({
                    chart: {
                        type: 'area'
                    },
                    title: {
                        text: 'Historical Trend for Commute Mode Choice - Bay Area'
                    },
                    xAxis: {
                        type: 'datetime',
                    dateTimeLabelFormats: {
                        year: '%Y'
                    },
                        tickmarkPlacement: 'on',
                        title: {
                            enabled: false
                        }
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Percent (Share)'
                        }
                    },
                    legend:{
                        enabled: true
                    },
                    tooltip: {
                        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        '<td style="padding:0"><b>{point.y:,.1f}%</b></td></tr>',
                        footerFormat: '</table>',
                        shared: true,
                        useHTML: true
                    },
                    plotOptions: {
                        area: {
                            stacking: 'percent',
                            lineColor: '#ffffff',
                            lineWidth: 1,
                            marker: {
                                lineWidth: 1,
                                lineColor: '#ffffff'
                            },
                        events: {
                            legendItemClick: function () {
                                return false;
                            }
                        }
                        }
                    },
                    colors: altColors,

                    series: [{
                        name: 'Auto',
                        data: drivereg
                    }, {
                        name: 'Transit',
                        data: transitreg
                    }, {
                        name: 'Walk',
                        data: walkreg
                    }, {
                        name: 'Other',
                        data: otherreg
                    }, {
                        name: 'Telecommute',
                        data: teleworkreg
                    }]
                });
            }

            //FOR ALL OTHER VALUES
            var drive= [];
            var carpool = [];
            var transit = [];
            var walk = [];
            var bike = [];
            var other = [];
            var telework = [];

            // Area Chart Data
            var key;

            for (key in t1aCountyData) {
                var updatetext = t1aCountyData[key].County;
                if (updatetext === searchtext) {

                    if (t1aCountyData[key].DriveTot_Est === null) {
                        drive.push([Date.UTC(t1aCountyData[key].Year, 0, 1), t1aCountyData[key].DriveTot_Est]);
                    } else {

                        drive.push([Date.UTC(t1aCountyData[key].Year, 0, 1), parseFloat(t1aCountyData[key].DriveTot_Est)]);
                    }

                    if (t1aCountyData[key].Carpool_Est === null) {
                        carpool.push(t1aCountyData[key].Carpool_Est);
                    } else {

                        carpool.push(parseFloat(t1aCountyData[key].Carpool_Est));
                    }

                    if (t1aCountyData[key].Transit_Est === null) {
                        transit.push(Date.UTC(t1aCountyData[key].Year, 0, 1), [t1aCountyData[key].Transit_Est]);
                    } else {

                        transit.push([Date.UTC(t1aCountyData[key].Year, 0, 1), parseFloat(t1aCountyData[key].Transit_Est)]);
                    }

                    if (t1aCountyData[key].Walk_Est === null) {
                        walk.push([Date.UTC(t1aCountyData[key].Year, 0, 1), t1aCountyData[key].Walk_Est]);
                    } else {

                        walk.push([Date.UTC(t1aCountyData[key].Year, 0, 1), parseFloat(t1aCountyData[key].Walk_Est)]);
                    }

                    if (t1aCountyData[key].Bike_Est === null) {
                        bike.push([Date.UTC(t1aCountyData[key].Year, 0, 1), t1aCountyData[key].Bike_Est]);
                    } else {
                        bike.push([Date.UTC(t1aCountyData[key].Year, 0, 1), parseFloat(t1aCountyData[key].Bike_Est)]);
                    }

                    if (t1aCountyData[key].Other_w_Bike_Est === null) {
                        other.push([Date.UTC(t1aCountyData[key].Year, 0, 1), t1aCountyData[key].Other_w_Bike_Est]);
                    } else {
                        other.push([Date.UTC(t1aCountyData[key].Year, 0, 1), parseFloat(t1aCountyData[key].Other_w_Bike_Est)]);
                    }

                    if (t1aCountyData[key].Telework_Est === null) {
                        telework.push([Date.UTC(t1aCountyData[key].Year, 0, 1), t1aCountyData[key].Telework_Est]);
                    } else {
                        telework.push([Date.UTC(t1aCountyData[key].Year, 0, 1), parseFloat(t1aCountyData[key].Telework_Est)]);
                    }

                    $('#areaChart_T1-T2-A').highcharts({
                        chart: {
                            type: 'area'
                        },
                        title: {
                            text: 'Historical Trend for Commute Mode Choice - '  + searchtext +' County'
                        },
                        xAxis: {
                            type: 'datetime',
                            dateTimeLabelFormats: {
                                year: '%Y'
                            },
                            tickmarkPlacement: 'on',
                            title: {
                                enabled: false
                            }
                        },
                        yAxis: {
                            min: 0,
                            title: {
                                text: 'Percent (Share)'
                            }
                        },
                        tooltip: {
                            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                            '<td style="padding:0"><b>{point.y:,.1f}%</b></td></tr>',
                            footerFormat: '</table>',
                            shared: true,
                            useHTML: true
                        },
                        legend:{
                            enabled: true
                        },
                        plotOptions: {
                            area: {
                                stacking: 'percent',
                                lineColor: '#ffffff',
                                lineWidth: 1,
                                marker: {
                                    lineWidth: 1,
                                    lineColor: '#ffffff'
                                },
                        events: {
                            legendItemClick: function () {
                                return false;
                            }
                        }
                            }
                        },
                        colors: altColors,
                        series: [{
                            name: 'Auto',
                            data: drive
                        }, {
                            name: 'Transit',
                            data: transit
                        }, {
                            name: 'Walk',
                            data: walk
                        }, {
                            name: 'Other',
                            data: other
                        }, {
                            name: 'Telecommute',
                            data: telework
                        }]
                    });
                }
            }


        };

    }; // end ready fn


    function prep(region, cityT1, cityT2, countyT1, countyT2) {
        t1aRegionData = region[0];
        t1aCityData = cityT1[0];
        t2aCityData = cityT2[0];
        t1aCountyData = countyT1[0];
        t2aCountyData = countyT2[0];

        //POPULATE CHART ARRAYS
        var regionid;
        for (regionid in t1aRegionData) {

            if (t1aRegionData[regionid].DriveAlone_Est === null) {
                drivealonereg.push(t1aRegionData[regionid].DriveAlone_Est);
            } else {
                drivealonereg.push(parseFloat(t1aRegionData[regionid].DriveAlone_Est));

            }

            if (t1aRegionData[regionid].DriveTot_Est === null) {
                drivereg.push([Date.UTC(t1aRegionData[regionid].Year, 0, 1), t1aRegionData[regionid].DriveTot_Est]);
            } else {
                drivereg.push([Date.UTC(t1aRegionData[regionid].Year, 0, 1), parseFloat(t1aRegionData[regionid].DriveTot_Est)]);

            }

            if (t1aRegionData[regionid].Carpool_Est === null) {
                carpoolreg.push(t1aRegionData[regionid].Carpool_Est);
            } else {

                carpoolreg.push(parseFloat(t1aRegionData[regionid].Carpool_Est));
            }

            if (t1aRegionData[regionid].Transit_Est === null) {
                transitreg.push([Date.UTC(t1aRegionData[regionid].Year, 0, 1),t1aRegionData[regionid].Transit_Est]);
            } else {

                transitreg.push([Date.UTC(t1aRegionData[regionid].Year, 0, 1),parseFloat(t1aRegionData[regionid].Transit_Est)]);
            }

            if (t1aRegionData[regionid].Walk_Est === null) {
                walkreg.push([Date.UTC(t1aRegionData[regionid].Year, 0, 1),t1aRegionData[regionid].Walk_Est]);
            } else {

                walkreg.push([Date.UTC(t1aRegionData[regionid].Year, 0, 1),parseFloat(t1aRegionData[regionid].Walk_Est)]);
            }

            if (t1aRegionData[regionid].Bike_Est === null) {
                bikereg.push([Date.UTC(t1aRegionData[regionid].Year, 0, 1),t1aRegionData[regionid].Bike_Est]);
            } else {

                bikereg.push([Date.UTC(t1aRegionData[regionid].Year, 0, 1),parseFloat(t1aRegionData[regionid].Bike_Est)]);
            }

            if (t1aRegionData[regionid].Other_w_Bike_Est === null) {
                otherreg.push([Date.UTC(t1aRegionData[regionid].Year, 0, 1),t1aRegionData[regionid].Other_w_Bike_Est]);
            } else {

                otherreg.push([Date.UTC(t1aRegionData[regionid].Year, 0, 1),parseFloat(t1aRegionData[regionid].Other_w_Bike_Est)]);
            }

            if (t1aRegionData[regionid].Telework_Est === null) {
                teleworkreg.push([Date.UTC(t1aRegionData[regionid].Year, 0, 1),t1aRegionData[regionid].Telework_Est]);
            } else {

                teleworkreg.push([Date.UTC(t1aRegionData[regionid].Year, 0, 1),parseFloat(t1aRegionData[regionid].Telework_Est)]);
            }
        }

        ready();
    }

    function load() {

        $.when(
            regionPromise,
            cityPromiseT1,
            cityPromiseT2,
            countyPromiseT1,
            countyPromiseT2
        ).done(prep);
    }

    load();

})(jQuery);
