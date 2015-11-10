var t6acountylist = [];
var t6acountydata = [];
var t6achartdata = [];
var t6aHaloCountylist = [];
var t6achart;
var totaldata=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

(function($) {

// Set the default highcharts separator
Highcharts.setOptions({
    lang: {
        decimalPoint: '.',
        thousandsSep: ','
    }
});


//UPDATEFUNCTION FOR T6-A Chart based on city selection
    $.fn.UpdateT6AChartData = function(searchcounty,op) {
        var series = [];
        for (var id in t6acountydata) {
            var routes = [];
            t6achartdata = [];
            if (t6acountydata[id].County === searchcounty) {
                var name = t6acountydata[id].Route_Text;

                // Find if this highway intersects the county in more than one place
                // If so, add the location of the intersection
                var intersections = _.where(t6acountydata, {
                    County: searchcounty,
                    Route_Text: name
                });
                if (intersections.length > 1) {
                    name += ' - ' + t6acountydata[id]['Halo County'];
                }

                t6achartdata.push(fix_(t6acountydata[id]['1992_BD_AADT']), fix_(t6acountydata[id]['1993_BD_AADT']), fix_(t6acountydata[id]['1994_BD_AADT']), fix_(t6acountydata[id]['1995_BD_AADT']), fix_(t6acountydata[id]['1996_BD_AADT']), fix_(t6acountydata[id]['1997_BD_AADT']), fix_(t6acountydata[id]['1998_BD_AADT']), fix_(t6acountydata[id]['1999_BD_AADT']), fix_(t6acountydata[id]['2000_BD_AADT']), fix_(t6acountydata[id]['2001_BD_AADT']), fix_(t6acountydata[id]['2002_BD_AADT']), fix_(t6acountydata[id]['2003_BD_AADT']), fix_(t6acountydata[id]['2004_BD_AADT']), fix_(t6acountydata[id]['2005_BD_AADT']), fix_(t6acountydata[id]['2006_BD_AADT']), fix_(t6acountydata[id]['2007_BD_AADT']), fix_(t6acountydata[id]['2008_BD_AADT']), fix_(t6acountydata[id]['2009_BD_AADT']), fix_(t6acountydata[id]['2010_BD_AADT']), fix_(t6acountydata[id]['2011_BD_AADT']),fix_(t6acountydata[id]['2012_BD_AADT']),fix_(t6acountydata[id]['2013_BD_AADT']));
                series.push({
                    "name": name,
                    "data": t6achartdata
                });
            } else if (t6acountydata[id]['Halo County'] === searchcounty) {
                t6achartdata.push(fix_(t6acountydata[id]['1992_BD_AADT']), fix_(t6acountydata[id]['1993_BD_AADT']), fix_(t6acountydata[id]['1994_BD_AADT']), fix_(t6acountydata[id]['1995_BD_AADT']), fix_(t6acountydata[id]['1996_BD_AADT']), fix_(t6acountydata[id]['1997_BD_AADT']), fix_(t6acountydata[id]['1998_BD_AADT']), fix_(t6acountydata[id]['1999_BD_AADT']), fix_(t6acountydata[id]['2000_BD_AADT']), fix_(t6acountydata[id]['2001_BD_AADT']), fix_(t6acountydata[id]['2002_BD_AADT']), fix_(t6acountydata[id]['2003_BD_AADT']), fix_(t6acountydata[id]['2004_BD_AADT']), fix_(t6acountydata[id]['2005_BD_AADT']), fix_(t6acountydata[id]['2006_BD_AADT']), fix_(t6acountydata[id]['2007_BD_AADT']), fix_(t6acountydata[id]['2008_BD_AADT']), fix_(t6acountydata[id]['2009_BD_AADT']), fix_(t6acountydata[id]['2010_BD_AADT']), fix_(t6acountydata[id]['2011_BD_AADT']), fix_(t6acountydata[id]['2012_BD_AADT']), fix_(t6acountydata[id]['2013_BD_AADT']));
                series.push({
                    "name": t6acountydata[id].Route_Text,
                    "data": t6achartdata
                });
            }
        }
        function fix_(number){
            return parseInt(number);
        }

        var title = "";
        //If the option is for Counties
        if(op==1){
            title = "Entering/Exiting "+searchcounty+" County from outside Bay Area";
        }
        //If the option is for Halo Counties
        if(op==2){
            title = "Entering/Exiting "+searchcounty+" County from Bay Area";
        }

        $('#T6 .chart-title').html(title);

        $('#T6-A-chart').highcharts({
            chart: {
                type: 'line'
            },
            title: {
                text: ''
            },
            xAxis: {
                categories: ['1992', '1993', '1994', '1995', '1996', '1997', '1998', '1999', '2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012','2013'],
                tickmarkPlacement: 'on'
            },
            yAxis: {
                min: 0,
                max: 140000,
                title: {
                    text: 'Average Daily Vehicle Trips'
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:,.0f}</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            colors: altColors,
            plotOptions: {
                line: {
                    enableMouseTracking: true
                }
            },
            series: series
        });



    };

    $(function() {
/****************************GET DATA FROM SERVER****************************************/
    //REQUEST COUNTY LIST DATA FROM SERVER
    $.ajax({
        dataType: "json",
        url: "http://vitalsigns-production.elasticbeanstalk.com/t6/counties",
        //data: data,
        async: false,
        success: successCountyListt6a
    });

    function successCountyListt6a(data) {
        t6acountylist = data;
    }

    $.ajax({
        dataType: "json",
        url: "http://vitalsigns-production.elasticbeanstalk.com/t6/halocounties",
        //data: data,
        async: false,
        success: successHaloCountyListt6a
    });

    function successHaloCountyListt6a(data) {
        t6aHaloCountylist = data;
    }

    //REQUEST COUNTY DATA FROM SERVER
    $.ajax({
        dataType: "json",
        url: "http://vitalsigns-production.elasticbeanstalk.com/t6",
        //data: data,
        async: false,
        success: successCountyDatat6a
    });

    function successCountyDatat6a(data) {
        t6acountydata = data;

    }

    for (var id in t6acountydata) {
        //totaldata[0] = fix_(totaldata[0]+t6acountydata[id]['1990_BD_AADT']);
        //totaldata[1] = fix_(totaldata[1]+t6acountydata[id]['1991_BD_AADT']);
        totaldata[0] = fix_(totaldata[0]+t6acountydata[id]['1992_BD_AADT']);
        totaldata[1] = fix_(totaldata[1]+t6acountydata[id]['1993_BD_AADT']);
        totaldata[2] = fix_(totaldata[2]+t6acountydata[id]['1994_BD_AADT']);
        totaldata[3] = fix_(totaldata[3]+t6acountydata[id]['1995_BD_AADT']);
        totaldata[4] = fix_(totaldata[4]+t6acountydata[id]['1996_BD_AADT']);
        totaldata[5] = fix_(totaldata[5]+t6acountydata[id]['1997_BD_AADT']);
        totaldata[6] = fix_(totaldata[6]+t6acountydata[id]['1998_BD_AADT']);
        totaldata[7] = fix_(totaldata[7]+t6acountydata[id]['1999_BD_AADT']);
        totaldata[8] = fix_(totaldata[8]+t6acountydata[id]['2000_BD_AADT']);
        totaldata[9] = fix_(totaldata[9]+t6acountydata[id]['2001_BD_AADT']);
        totaldata[10] = fix_(totaldata[10]+t6acountydata[id]['2002_BD_AADT']);
        totaldata[11] = fix_(totaldata[11]+t6acountydata[id]['2003_BD_AADT']);
        totaldata[12] = fix_(totaldata[12]+t6acountydata[id]['2004_BD_AADT']);
        totaldata[13] = fix_(totaldata[13]+t6acountydata[id]['2005_BD_AADT']);
        totaldata[14] = fix_(totaldata[14]+t6acountydata[id]['2006_BD_AADT']);
        totaldata[15] = fix_(totaldata[15]+t6acountydata[id]['2007_BD_AADT']);
        totaldata[16] = fix_(totaldata[16]+t6acountydata[id]['2008_BD_AADT']);
        totaldata[17] = fix_(totaldata[17]+t6acountydata[id]['2009_BD_AADT']);
        totaldata[18] = fix_(totaldata[18]+t6acountydata[id]['2010_BD_AADT']);
        totaldata[19] = fix_(totaldata[19]+t6acountydata[id]['2011_BD_AADT']);
        totaldata[20] = fix_(totaldata[20]+t6acountydata[id]['2012_BD_AADT']);
        totaldata[21] = fix_(totaldata[21]+t6acountydata[id]['2013_BD_AADT']);
    }

    function fix_(number){
        return parseInt(number);
    }

    $(this).build_initial();

/****************************We create the combo boxes****************************************/
    var datat6a = [];
    for (var key in t6acountylist) {
        datat6a.push({
            "text": t6acountylist[key].County,
            "value": t6acountylist[key].County
        });
    }

    var dataHalot6a = [];
    for (key in t6aHaloCountylist) {
        dataHalot6a.push({
            "text": t6aHaloCountylist[key].County,
            "value": t6aHaloCountylist[key].County
        });
    }

    $("#t6aCountyCombo").kendoComboBox({
        text: "Gateway Counties",
        dataTextField: "text",
        dataValueField: "value",
        dataSource: datat6a,
        select: ont6aSelect

    });
    //ON SELECT FUNCTION FOR COMBOBOX T6-A
    function ont6aSelect(e) {
        $("#t6aHaloCountyCombo").data("kendoComboBox").text('Halo Counties');
        var dataItem = this.dataItem(e.item.index());
        $(this).UpdateT6AChartData(dataItem.text,1);
        cityinfo = dataItem.text;
    }
    $("#t6aHaloCountyCombo").kendoComboBox({
        text: "Halo Counties",
        dataTextField: "text",
        dataValueField: "value",
        dataSource: dataHalot6a,
        select: ont6aHaloSelect

    });

    //ON SELECT FUNCTION FOR COMBOBOX T6-A
    function ont6aHaloSelect(e) {
        $("#t6aCountyCombo").data("kendoComboBox").text('Gateway Counties');
        var dataItem = this.dataItem(e.item.index());
        $(this).UpdateT6AChartData(dataItem.text,2);
        cityinfo = dataItem.text;
    }

    var button = $('<a class="btn btn-primary btn-fix k-button">Regional Trend</a>').click(function () {
        $(this).build_initial();
    });

    $('#T6 div:first').prepend(button);

});
    $.fn.build_initial = function(){
    var series = [];
    series.push({
        "name": "Bay Area",
        "data": totaldata
    });
    /****************************We build the chart****************************************/
    $('#T6-A-chart').highcharts({
        chart: {
            defaultSeriesType: 'line'
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: ['1992', '1993', '1994', '1995', '1996', '1997', '1998', '1999', '2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012','2013'],
            tickmarkPlacement: 'on'
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Average Daily Vehicle Trips'
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:,.0f}</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        colors: altColors,
        plotOptions: {
            line: {
                enableMouseTracking: true
            }
        }
    });
    t6achart = $('#T6-A-chart').highcharts();
    for (i = 0; i < series.length; i++) {
        t6achart.addSeries({
            "name": series[i].name,
            "data": series[i].data
        });
    }
    }
})(jQuery);
