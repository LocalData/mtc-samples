/*globals
jQuery, L, geocities, allBlue, allOrange, altColors, Highcharts, turf, cartodb, _
*/

//Global Variables
var t1aRegionData;
var t1aCountyData;
var countycombot1t2;
var countyinfo = null;

var drivealonereg = [];
var drivereg = [];
var transitreg = [];
var walkreg = [];
var otherreg = [];
var teleworkreg = [];

var areaChart;
var $areaChartTitle;
(function($) {
function pullYearShare(item) {
    if (item.Share === null) {
        return [item.Year, null];
    }

    return [item.Year, 100 * item.Share];
}
$(function() {
    // Gross, but this avoids really tight coupling between git-tracked code and
    // drupal-managed content.
    var $chartContainer = $('[id="T1-T2-A + Data"]');
    $chartContainer.prepend('<h3 class="chart-title"></h3>');
    $areaChartTitle = $chartContainer.find('h3.chart-title');

    // Set the default highcharts separator
    Highcharts.setOptions({
        lang: {
            decimalPoint: '.',
            thousandsSep: ','
        }
    });

    var regionPromise = $.ajax({
        dataType: "json",
        url: "http://vitalsignsvs2.elasticbeanstalk.com/api/t1/regionsimple"
    });
    var countyPromise = $.ajax({
        dataType: "json",
        url: "http://vitalsignsvs2.elasticbeanstalk.com/api/t1/countysimple"
    });

    $.when(regionPromise, countyPromise).done(setup);

    function setup(regionData, countyData) {
        t1aCountyData = countyData[0];
        t1aRegionData = regionData[0];

        //POPULATE CHART ARRAYS
        drivereg = _.map(_.filter(t1aRegionData, 'Mode', 'Auto'), pullYearShare);
        transitreg = _.map(_.filter(t1aRegionData, 'Mode', 'Public Transit'), pullYearShare);
        walkreg = _.map(_.filter(t1aRegionData, 'Mode', 'Walk'), pullYearShare);
        otherreg = _.map(_.filter(t1aRegionData, 'Mode', 'Other'), pullYearShare);
        teleworkreg = _.map(_.filter(t1aRegionData, 'Mode', 'Telecommute'), pullYearShare);

        //CREATE AREA CHART
        $areaChartTitle.text('Historical Trend for Commute Mode Choice - Bay Area');
        areaChart =  $('#areaChart_T1-T2-A').highcharts({
            chart: {
                type: 'area',
                marginTop: 40
            },
            title: {
                text: '',
                useHTML: true
            },
            exporting: {
                chartOptions: {
                    title: {
                        text: 'Historical Trend for Commute Mode Choice - Bay Area'
                    }
                }
            },
            xAxis: {
                // type: 'linear',
                tickInterval: 10,
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
                    connectNulls: true,
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
        var countyList = _(t1aCountyData)
        .pluck('County')
        .unique()
        .map(function (name, i) {
          return {
            value: name,
            text: name,
            id: i + 1
          };
        }).value();

        var datat1t2a = [{
          value: 'Bay Area',
          text: 'Bay Area',
          id: 0
        }].concat(countyList);

        //CREATE COMBOBOX
        $("#countySelect").kendoComboBox({
            placeholder: "Select a County...",
            dataTextField: "text",
            dataValueField: "value",
            dataSource: datat1t2a,
            select: onSelect
        });
    }
});


//ON SELECT FUNCTION FOR COMBOBOX T1-T2-A
function onSelect(e) {
    var dataItem = this.dataItem(e.item.index());
    countyinfo = dataItem.text;
    $(this).UpdateChartData(dataItem.text);
}


$.fn.UpdateChartData = function(searchtext) {
    searchtext = searchtext.toString();
    //FOR BAY AREA
    if (searchtext === "Bay Area") {
        var title = 'Historical Trend for Commute Mode Choice - Bay Area';
        $areaChartTitle.text(title);
        $('#areaChart_T1-T2-A').highcharts({
            chart: {
                type: 'area',
                marginTop: 40
            },
            title: {
                text: '',
                useHTML: true
            },
            exporting: {
                chartOptions: {
                    title: {
                        text: title
                    }
                }
            },
            xAxis: {
                type: 'linear',
                tickInterval: 10,
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
                    connectNulls: true,
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
        return;
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
    drive = _(t1aCountyData)
    .filter('Mode', 'Auto')
    .filter('County', searchtext)
    .map(pullYearShare).value();

    transit = _(t1aCountyData)
    .filter('Mode', 'Public Transit')
    .filter('County', searchtext)
    .map(pullYearShare).value();

    walk = _(t1aCountyData)
    .filter('Mode', 'Walk')
    .filter('County', searchtext)
    .map(pullYearShare).value();

    other = _(t1aCountyData)
    .filter('Mode', 'Other')
    .filter('County', searchtext)
    .map(pullYearShare).value();

    telework = _(t1aCountyData)
    .filter('Mode', 'Telecommute')
    .filter('County', searchtext)
    .map(pullYearShare).value();

    var title = 'Historical Trend for Commute Mode Choice - ' + searchtext;
    $areaChartTitle.text(title);
    $('#areaChart_T1-T2-A').highcharts({
        chart: {
            type: 'area',
            marginTop: 40
        },
        title: {
            text: '',
            useHTML: true
        },
        exporting: {
            chartOptions: {
                title: {
                    text: title
                }
            }
        },
        xAxis: {
            type: 'linear',
            tickInterval: 10,
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
                connectNulls: true,
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


};

})(jQuery);
