//Global Variables
var t13aData;
var years = [];
var values = [];
//Data
var list;
var modeList;
var operatorList;
var metrosList;
(function($) {
    // Set the default highcharts separator
    Highcharts.setOptions({
        lang: {
            decimalPoint: '.',
            thousandsSep: ','
        }
    });

    $(function() {
        //Default
        barChart(null, 'Region', "Region", "")
        //mode
        setComboBox("http://vitalsignsvs2.elasticbeanstalk.com/api/t13/mode", "Mode", "t13amodecombo", "Mode_Simple", "Bus");
        // //metros
        // setComboBox("http://vitalsignsvs2.elasticbeanstalk.com/api/t13/metro", "Metros", "t13ametroscombo", "Metro", "Atlanta");
        //operator
        setComboBox("http://vitalsignsvs2.elasticbeanstalk.com/api/t13/system", "Operator", "t13aoperatorcombo", "SysName_Simple", "AC Transit");


    });
    function successData(data) {
        data = _.sortBy(data, "Year");
        t13aData = data;
    }
    function barChart(dataList, title, filter, field){
        if(title == "Region"){
            var reset = $("#t13amodecombo").data("kendoComboBox");
            if(reset)
                reset.value("");
            reset = $("#t13aoperatorcombo").data("kendoComboBox");
            if(reset)
                reset.value("");
            //REQUEST DATA FROM SERVER
            $.ajax({
                dataType: "json",
                url: "http://vitalsignsvs2.elasticbeanstalk.com/api/t13/region",
                async: false,
                success: successData
            });
        }else{
            t13aData = _.sortBy(dataList, "Year");
            if(field=="Mode_Simple"){
                reset = $("#t13aoperatorcombo").data("kendoComboBox");
            }else{
                reset = $("#t13amodecombo").data("kendoComboBox");
            }
            if(reset)
                reset.value("");
        }
        values = [];
        costperboard = [];
        farebox = [];
        years = [];
        for (var key in t13aData){
            if(title == "Region"){
                //values.push({year:t13aData[key].Year, value:t13aData[key].CostperBoard_IA});
                costperboard.push(t13aData[key].NetCostperBoard_IA);
                farebox.push(t13aData[key].FareperBoard_IA);
                years.push(t13aData[key].Year);
                filter = "Region";
            }else{
                if(t13aData[key][field] == filter){
                    costperboard.push(t13aData[key].NetCostperBoard_IA);
                    farebox.push(t13aData[key].FareperBoard_IA);
                    years.push(t13aData[key].Year);
                }
            }
        }
        //CREATE CHART
        var title = 'Historical Trend for Transit System Efficiency - ' + filter;
        $('#T13A-chart').highcharts({
            chart: {
                type: 'bar',
                marginTop: 40
            },
            bar: {
                colorByPoint: true
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
                categories:  years
            },
            yAxis: {
                min: 0,
                max: 45,
                title: {
                    text: ''
                },
                reversedStacks: false,
                labels: {
                    format: '${value}'
                }
            },
            legend: {
                enabled: true,
            },
            colors: altColors,

            plotOptions: {
                series: {
                    stacking: 'normal'
                }
            },
            tooltip: {
                pointFormat: "<b>{series.name}</b> ${point.y:.2f}"
            },
            series: [{
                name: 'Net Cost per Boarding',
                data: costperboard
            },
            {
                name: 'Fare Paid per Boarding',
                data: farebox
            }]
        });

        $('#T13-A .chart-title').html(title);
    }
    function setComboBox(url, title, idcombo, field, default_item){
        //REQUEST MODE  LIST DATA FROM SERVER
        $.ajax({
            dataType: "json",
            url: url,
            async: false,
            success: successList
        });
        var placeholder_ = "";
        function successList(data) {
            list = data;
            if(idcombo == "t13amodecombo"){modeList = data; }
            if(idcombo == "t13ametroscombo"){metrosList = data;}
            if(idcombo == "t13aoperatorcombo"){operatorList = data;}
        }
        //CREATE COMBOBOX
        var dataCombo = [];
        var array = [];
        for (var id in list) {
            array.push(list[id][field]);
        }
        var uniqueNames = [];
        $.each(array, function(i, el){
            if($.inArray(el, uniqueNames) === -1 && el) uniqueNames.push(el);
        });
        uniqueNames.sort();
        uniqueNames.unshift("Region");
        for (i=0; i < uniqueNames.length; i++) {
            dataCombo.push({
                "text": uniqueNames[i],
                "value": uniqueNames[i]
            });
        }
        if(idcombo == "t13amodecombo"){placeholder_="Select a Mode";}
        if(idcombo == "t13aoperatorcombo"){placeholder_="Select an Operator";}
        //CREATE COMBOBOX
        modeCombo = $("#"+idcombo).kendoComboBox({
            placeholder: placeholder_,
            allowClear: true,
            //text: default_item,
            dataTextField: "text",
            dataValueField: "value",
            dataSource: dataCombo,
            select:
                function onSelect(e) {

                    if(e.item.text()=="Region"){
                        barChart(null, 'Region', "", "");
                    }else {
                        var dataItem = this.dataItem(e.item.index());
                        if (idcombo == "t13amodecombo") {
                            barChart(modeList, title, dataItem.text, field)
                        }
                        if (idcombo == "t13ametroscombo") {
                            barChart(metrosList, title, dataItem.text, field)
                        }
                        if (idcombo == "t13aoperatorcombo") {
                            barChart(operatorList, title, dataItem.text, field)
                        }
                    }
                }
        });
    }
})(jQuery);
