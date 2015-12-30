/* globals _ */
//CREATE BAR CHART T14-T15-A
var tcounty14;
var tregion14;
var t1415acountylist;
var tregion15;
var tcounty15;
var countyname;
var type;
(function($) {
    // Set the default highcharts separator
    Highcharts.setOptions({
        lang: {
            decimalPoint: '.',
            thousandsSep: ','
        }
    });

    $(function() {

        //GET DATA FROM SERVER

        // T14
        $.ajax({
            dataType: "json",
            url: "http://vitalsignsvs2.elasticbeanstalk.com/api/t14/county",
            //data: data,
            async: false,
            success: successCountyData14
        });

        function successCountyData14(data) {
            tcounty14 = data;
            // Generate list of counties.
            t1415acountylist = _.uniq(_.pluck(tcounty14, 'County'));
        }

        $.ajax({
            dataType: "json",
            url: "http://vitalsignsvs2.elasticbeanstalk.com/api/t14/region",
            //data: data,
            async: false,
            success: successRegionData14
        });

        function successRegionData14(data) {
            tregion14 = data;
        }

        // T15
        $.ajax({
            dataType: 'json',
            url: "http://vitalsignsvs2.elasticbeanstalk.com/api/t15/county",
            //data: data,
            async: false,
            success: successCountyData15
        });

        function successCountyData15(data){
            tcounty15 = data;
        }

        $.ajax({
            dataType: "json",
            url: "http://vitalsignsvs2.elasticbeanstalk.com/api/t15/region",
            //data: data,
            async: false,
            success: successRegionData15
        });

        function successRegionData15(data) {
            tregion15 = data;
        }

        var yearNames = [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013];
        var vmtCounty = [];
        var vmtRegion = [];

        $('#btnRegion').addClass("active");

        for (var key in tregion14) {
            vmtRegion.push(tregion14[key].VMT);
        }

        var t1t2cChart = $('#T14-T15-A-chart').highcharts({
            chart: {
                type: 'line',
                marginTop: 40
            },
            title: {
                text: '',
                useHTML: true
            },
            xAxis: {
                categories: yearNames
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Miles'
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
            series: [{
                name: 'Bay Area',
                data: vmtRegion
            }]

        });

        //CREATE COMBOX T14-T15-A

        var datat14t15a = [];
        _.forEach(t1415acountylist, function (county) {
            datat14t15a.push({
                text: county,
                value: county
            });
        });

        $("#btnRegion").click(function() {
            type = "region";
            updateChartModo(type);
            //updateChartst3t4a(t3t4mode);
            $(this).addClass("active");
            $(this).siblings('a').removeClass('active');
        });

        $("#btnRegioncp").click(function() {
            type = "regioncp";
            updateChartModo(type);
            $(this).addClass("active");
            $(this).siblings('a').removeClass('active');
        });

        $("#btnCounty").click(function() {
            type = "county";
            updateChartModo(type);
            //updateChartst3t4a(t3t4mode);
            $(this).addClass("active");
            $(this).siblings('a').removeClass('active');
        });

        $("#btnCountycp").click(function() {
            type = "countycp";
            updateChartModo(type);
            //updateChartst3t4a(t3t4mode);
            $(this).addClass("active");
            $(this).siblings('a').removeClass('active');
        });


        $("#t14t15aCityCombo").kendoComboBox({
            text: "Select Mode...",
            dataTextField: "text",
            dataValueField: "value",
            dataSource: datat14t15a,
            select: ont14t15aSelect

        });

        //ON SELECT FUNCTION FOR COMBOBOX T6-A
        function ont14t15aSelect(e) {
            var dataItem = this.dataItem(e.item.index());
            $(this).Updatet14t15aChartData(dataItem.text);
            cityinfo = dataItem.text;
        }

        $.fn.Updatet14t15aChartData = function(searchcounty) {
            vmtCounty = [];
            countyname = searchcounty;
            for (var key in tcounty14) {
                var updatecounty = tcounty14[key].County;
                if (updatecounty === countyname) {
                    vmtCounty.push(tcounty14[key].VMT);
                }
            }

            $('#T14-T15-A .chart-title').html(countyname + ' County: Vehicle Miles Traveled (VMT)');

            var t1t2cChart = $('#T14-T15-A-chart').highcharts({
                chart: {
                    type: 'line',
                    marginTop: 40
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: yearNames
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Total'
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
                colors: ['#7a0ea2', '#b46f11', '#1595b4', 'red', '#6bd855', '#e88017', '#1a74dd', '#8085e8', '#8d4653', '#91e8e1'],
                series: [{
                    name: 'Region',
                    data: vmtRegion
                }, {
                    name: searchcounty,
                    data: vmtCounty
                }]

            });


        };

        //UPDATE T14-T15-A-info Div with mode share estimates by city
        // FIXME: This function seems not to have a use anymore. It conditions
        // on countyname, which would be set by a combobox that does not appear
        // with this interactive, so it should always do nothing.
        function update_areachartinfot14t15a(type, year, modevalue) {
            var vmtCountyValue;
            var vmtRegionValue;
            var vmtPercent;
            var searchYear = "VMT_" + year;
            if(type == 'region'){
                for (var key in tregion14) {
                    if (countyname === tregion14[key].Region) {
                        if(tregion14[key]['Year'] == year){
                            vmtCountyValue = tregion14[key]['VMT'];
                            for (var item in tregion14) {
                                vmtRegionValue = tregion14[item]['VMT'];
                            }
                            $("#T14-T15-A-info").html("<table align='center'><tr><td class='tablecell'><i class='fa fa-car fa-2x' style='color: blue; text-shadow: 1px 1px 1px #000'></i>&nbsp;<b>" + vmtCountyValue + "</b>&nbsp;</td><td class='tablecell'><i class='fa fa-cab fa-2x' style='color: orange; text-shadow: 1px 1px 1px #000'></i>&nbsp;<b>" + vmtRegionValue + "</b>&nbsp;</td></tr></table>");
                        }
                    }
                }
            }else if(type == "regioncp"){
                for (var key in tregion15) {
                    if (countyname === tregion15[key].Region) {
                        if(tregion15[key]['Year'] == year){
                            vmtCountyValue = tregion15[key]['VMT'];
                            for (var item in tregion15) {
                                vmtRegionValue = tregion15[item]['VMT'];
                            }
                            $("#T14-T15-A-info").html("<table align='center'><tr><td class='tablecell'><i class='fa fa-car fa-2x' style='color: blue; text-shadow: 1px 1px 1px #000'></i>&nbsp;<b>" + vmtCountyValue + "</b>&nbsp;</td><td class='tablecell'><i class='fa fa-cab fa-2x' style='color: orange; text-shadow: 1px 1px 1px #000'></i>&nbsp;<b>" + vmtRegionValue + "</b>&nbsp;</td></tr></table>");
                        }
                    }
                }
            }else if(type == "county"){
                for (var key in tcounty14) {
                    if (countyname === tcounty14[key].Region) {
                        if(tcounty14[key]['Year'] == year){
                            vmtCountyValue = tcounty14[key]['VMT'];
                            for (var item in tcounty14) {
                                vmtRegionValue = tcounty14[item]['VMT'];
                            }
                            $("#T14-T15-A-info").html("<table align='center'><tr><td class='tablecell'><i class='fa fa-car fa-2x' style='color: blue; text-shadow: 1px 1px 1px #000'></i>&nbsp;<b>" + vmtCountyValue + "</b>&nbsp;</td><td class='tablecell'><i class='fa fa-cab fa-2x' style='color: orange; text-shadow: 1px 1px 1px #000'></i>&nbsp;<b>" + vmtRegionValue + "</b>&nbsp;</td></tr></table>");
                        }
                    }
                }
            }else if(type == "countycp"){
                for (var key in tcounty15) {
                    if (countyname === tcounty15[key].Region) {
                        if(tcounty15[key]['Year'] == year){
                            vmtCountyValue = tcounty15[key]['VMT'];
                            for (var item in tcounty15) {
                                vmtRegionValue = tcounty15[item]['VMT'];
                            }
                            $("#T14-T15-A-info").html("<table align='center'><tr><td class='tablecell'><i class='fa fa-car fa-2x' style='color: blue; text-shadow: 1px 1px 1px #000'></i>&nbsp;<b>" + vmtCountyValue + "</b>&nbsp;</td><td class='tablecell'><i class='fa fa-cab fa-2x' style='color: orange; text-shadow: 1px 1px 1px #000'></i>&nbsp;<b>" + vmtRegionValue + "</b>&nbsp;</td></tr></table>");
                        }
                    }
                }
            }
        }


        //UPDATE CHART BASED ON MODE
        function updateChartModo(mode) {
            var actual;
            var ListRegion = [];
            var ListRegionCP = [];
            var ListCounty = [];
            var ListCountyCP = [];
            if(mode == 'region'){
                for (var key in tregion14) {
                    ListRegion.push(tregion14[key].VMT);
                }
                actual = ListRegion;

                $('#T14-T15-A-chart .chart-title').html('Historical Trend for Daily Miles Traveled');

                $('#T14-T15-A-chart').highcharts({
                    chart: {
                        type: 'line',
                        marginTop: 40
                    },
                    title: {
                        text: ''
                    },
                    xAxis: {
                        categories: yearNames
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Miles'
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
                    series: [{
                        name: 'Bay Area',
                        data: actual
                    }]

                });
            }else if(mode == 'regioncp'){
                tregion15.forEach(function (item) {
                    ListRegionCP.push(parseFloat(item.VMTpc.toFixed(1)));
                });
                actual = ListRegionCP;

                $('#T14-T15-A-chart .chart-title').html('Historical Trend for Per-Capita Daily Miles Traveled');
                $('#T14-T15-A-chart').highcharts({
                    chart: {
                        type: 'line',
                        marginTop: 40
                    },
                    title: {
                        text:''
                    },
                    xAxis: {
                        categories: yearNames
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Miles'
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
                    series: [{
                        name: 'Bay Area',
                        data: actual
                    }]

                });
            }else if(mode == 'county'){
                var listaActual = [];
                for (var k in t1415acountylist){
                    var county = t1415acountylist[k];
                    var listC = [];
                    for (var key in tcounty14){
                        if (tcounty14[key].County === 'Conta Costa'){
                            if (county === "Contra Costa"){
                                listC.push(tcounty14[key].VMT);
                            }
                        } else {
                            if (county === tcounty14[key].County){
                                listC.push(tcounty14[key].VMT);
                            }
                        }
                    }
                    ListCounty.push({name: county, data:listC});
                }
                for(var i in ListCounty){
                    listaActual.push({name: ListCounty[i].name, data: ListCounty[i].data});
                }
                listaActual.reverse();

                $('#T14-T15-A-chart .chart-title').html('Historical Trend for Daily Miles Traveled by County');
                $('#T14-T15-A-chart').highcharts({
                    chart: {
                        type: 'line',
                        marginTop: 40
                    },
                    title: {
                        text:''
                    },
                    xAxis: {
                        categories: yearNames
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Miles'
                        }
                    },
                    legend: {
                        reversed: true
                    },
                    tooltip: {
                        enabled: true,
                        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}:</td>' +
                                        '<td style="padding:0"><b>{point.y:,.0f}</b></td></tr>',
                        footerFormat: '</table>',
                        //pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.1f}%</b> ({point.y:,.1f})</b>',
                        shared: true,
                        useHTML: true
                    },
                    colors: altColors,
                    series: listaActual

                });
            }else if(mode == 'countycp'){
                var listaActual = [];
                for(var k in t1415acountylist){
                    var county = t1415acountylist[k];
                    var listC = [];
                    for(var key in tcounty15){
                        if (county == tcounty15[key].County){
                            listC.push(parseFloat(tcounty15[key].VMTpc.toFixed(1)));
                        }
                    }
                    ListCountyCP.push({name: county, data:listC});
                }
                for(var i in ListCountyCP){
                    listaActual.push({name: ListCountyCP[i].name, data: ListCountyCP[i].data});
                }

                listaActual.reverse();
                $('#T14-T15-A-chart .chart-title').html('Historical Trend for Per-Capita Daily Miles Traveled by County');
                $('#T14-T15-A-chart').highcharts({
                    chart: {
                        type: 'line',
                        marginTop: 40
                    },
                    title: {
                        text:''
                    },
                    xAxis: {
                        categories: yearNames
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Miles'
                        }
                    },
                    legend: {
                        reversed: true
                    },
                    tooltip: {
                        enabled: true,
                        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}:</td>' +
                                        '<td style="padding:0"><b>{point.y:,.1f}</b></td></tr>',
                        footerFormat: '</table>',
                        shared: true,
                        useHTML: true
                        //pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.1f}%</b> ({point.y:,.0f})</b>',
                    },
                    colors: altColors,
                    series: listaActual

                });
            }
        }

    });
})(jQuery);

