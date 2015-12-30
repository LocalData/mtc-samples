//CREATE BAR CHART T18-A
var tregion18;
var tcounty18;
var tlistcounty18;
var countyname;
var vmtCounty;
(function($) {
    $(function() {

        // Set the default highcharts separator
        Highcharts.setOptions({
            lang: {
                decimalPoint: '.',
                thousandsSep: ','
            }
        });

        //REQUEST COUNTY LIST DATA FROM SERVER
        $.ajax({
            dataType: "json",
            url: "http://vitalsigns-production.elasticbeanstalk.com/counties",
            async: false,
            success: successCountyListt18a
        });

        function successCountyListt18a(data) {
            tlistcounty18 = data;
        }

        $.ajax({
            dataType: "json",
            url: "http://vitalsigns-production.elasticbeanstalk.com/t18/region",
            //data: data,
            async: false,
            success: successRegionData18
        });

        function successRegionData18(data) {
            tregion18 = data;
        }

        // T18
        $.ajax({
            dataType: 'json',
            url: "http://vitalsigns-production.elasticbeanstalk.com/t18/county",
            //data: data,
            async: false,
            success: successCountyData18
        });

        function successCountyData18(data){
            tcounty18 = data;
        }

        var yearNames = [1992, 1993, 1994, 1995, 1996, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2010, 2011, 2012, 2013];
        var vmtRegion = [];

        for(var ind in tregion18){
            var valor = (tregion18[ind].sdshare * 100).toFixed(1);
            vmtRegion.push(parseFloat(valor));
        }
        var dataCounties = [];
        dataCounties.push({
            "text": "Bay Area",
            "value": "Bay Area"
        });
        for (var item in tlistcounty18) {
            dataCounties.push({
                "text": tlistcounty18[item].County,
                "value": tlistcounty18[item].County
            });
        }
        console.log(dataCounties);

        $("#btnRegion").click(function() {
            updateChartModo("region");
            console.log('click');
        });

        $("#t18aCityCombo").kendoComboBox({
            text: "Select County...",
            dataTextField: "text",
            dataValueField: "value",
            dataSource: dataCounties,
            select: ont18aSelect

        });

        //ON SELECT FUNCTION FOR COMBOBOX T6-A
        function ont18aSelect(e) {
            console.log(e);
            var dataItem = this.dataItem(e.item.index());
            console.log(dataItem);
            $(this).Updatet18aChartData(dataItem.text);
            //cityinfo = dataItem.text;
        }

        var t1t2cChart = $('#T18-A-chart').highcharts({
            chart: {
                type: 'line'
            },
            title: {
                text: ''
            },
            exporting: {
                chartOptions: {
                    title: {
                        text: '2012 Bridge Condition'
                    }
                }
            },
            xAxis: {
                categories: yearNames
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Weighted Share of Structurally Deficient Bridges'
                }
            },
            legend: {
                reversed: true
            },
            tooltip: {
                enabled: true,
                pointFormat: '<span style="color:{series.color}">{series.name}</span>: {point.y:,.1f}%</b>',
            },
            colors: altColors,
            /*plotOptions: {
                series: {
                    stacking: 'normal',
                    point: {
                        events: {
                            mouseOver: function() {
                                //console.log(this);
                                update_areachartinfot14t15a(this.category, this.y);

                            },
                            click: function() {
                                update_areachartinfot14t15a(this.category, this.y);
                            }
                        }
                    }
                }
            },*/
            series: [{
                name: 'Bay Area',
                data: vmtRegion
            }]
        });

        $.fn.Updatet18aChartData = function(searchcounty) {
            if(searchcounty == "Bay Area"){
                var title = 'Historical Trend for Bridge Conditions - Bay Area';
                $('#T18-A .chart-title').html(title);
                $('#T18-A-chart').highcharts({
                    chart: {
                        type: 'line'
                    },
                    title: {
                        text: ''
                    },
                    exporting: {
                        chartOptions: {
                            title: {
                                text: title
                            }
                        }
                    },
                    xAxis: {
                        categories: yearNames
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Weighted Share of Structurally Deficient Bridges'
                        }
                    },
                    legend: {
                        reversed: true
                    },
                    tooltip: {
                        enabled: true,
                        pointFormat: '<span style="color:{series.color}">{series.name}</span>: {point.y:,.1f}%</b>',
                    },
                    colors: altColors,
                    /*plotOptions: {
                        series: {
                            stacking: 'normal',
                            point: {
                                events: {
                                    mouseOver: function() {
                                        //console.log(this);
                                        update_areachartinfot14t15a(this.category, this.y);

                                    },
                                    click: function() {
                                        update_areachartinfot14t15a(this.category, this.y);
                                    }
                                }
                            }
                        }
                    },*/
                    series: [{
                        name: 'Bay Area',
                        data: vmtRegion
                    }]
                });
            }else{
                vmtCounty = [];
                countyname = searchcounty;
                for (var key in tcounty18) {
                    var updatecounty = tcounty18[key].geography;
                    if (updatecounty === countyname) {
                        var valor = (tcounty18[key].sdshare * 100).toFixed(1);
                        vmtCounty.push(parseFloat(valor));
                    }
                }

                var title = 'Historical Trend for Bridge Conditions - ' + countyname + " County";
                $('#T18-A .chart-title').html(title);
                var t1t2cChart = $('#T18-A-chart').highcharts({
                    chart: {
                        type: 'line'
                    },
                    title: {
                        text: ''
                    },
                    exporting: {
                        chartOptions: {
                            title: {
                                text: title
                            }
                        }
                    },
                    xAxis: {
                        categories: yearNames
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Weighted Share of Structurally Deficient Bridges'
                        }
                    },
                    legend: {
                        reversed: true,
                        labelFormatter: function () {
                            if(this.name != "Bay Area"){
                                return this.name + ' County';
                            }else{
                                return this.name;
                            }
                        }
                    },
                    tooltip: {
                        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                            '<td style="padding:0"><b>{point.y:,.1f}%</b></td></tr>',
                        footerFormat: '</table>',
                        shared: true,
                        useHTML: true,
                        enabled: true
                    },
                    colors: altColors,
                    /*plotOptions: {
                        series: {
                            stacking: 'normal',
                            point: {
                                events: {
                                    mouseOver: function() {
                                        //console.log(this);
                                        update_areachartinfot14t15a(this.category, this.y);

                                    },
                                    click: function() {
                                        update_areachartinfot14t15a(this.category, this.y);
                                    }
                                }
                            }
                        }
                    },*/
                    series: [{
                        name: 'Bay Area',
                        data: vmtRegion
                    }, {
                        name: searchcounty,
                        data: vmtCounty
                    }]

                });
            }
        };

        //UPDATE T14-T15-A-info Div with mode share estimates by city
        function update_areachartinfot14t15a(year, modevalue) {
            console.log(year);
            console.log(modevalue);
        }

        //UPDATE CHART BASED ON MODE
        function updateChartModo(mode) {
            var actual;
            var title = 'Metro Comparison - Drive Alone';
            $('#T18-A .chart-title').html(title);
            $('#T18-A-chart').highcharts({
                chart: {
                    type: 'line'
                },
                title: {
                    text: ''
                },
                exporting: {
                    chartOptions: {
                        title: {
                            text: title
                        }
                    }
                },
                xAxis: {
                    categories: yearNames
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Weighted Share of Structurally Deficient Bridges'
                    }
                },
                legend: {
                    reversed: true
                },
                //                tooltip: {
                //                    enabled: true,
                //                    pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.1f}%</b> ({point.y:,.0f})</b>',
                //                    shared: true
                //                },
                colors: altColors,
                /*plotOptions: {
                    series: {
                        stacking: 'normal',
                        point: {
                            events: {
                                mouseOver: function() {
                                    //console.log(this);
                                    update_areachartinfot14t15a(this.category, this.y);

                                },
                                click: function() {
                                    update_areachartinfot14t15a(this.category, this.y);
                                }
                            }
                        }
                    }
                },*/
                series: [{
                    name: 'Bay Area',
                    data: vmtRegion
                }]
            });
        }

    });
})(jQuery);
