var regional_series=[];
var countydata;
(function($) {
    String.prototype.capitalize = function() {
        return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
    };
    //Actualizamos la información del diagrama
    $.fn.updateChartB = function(title,yTitle,xTitle,series,decimal_format) {

        $('#Bchart').highcharts({
            chart: {
                type: 'area'
            },
            title: {
                text: title
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    year: '%Y'
                },
                //categories: xCategories,
                tickmarkPlacement: 'on',
                title: {
                    text: xTitle
                }
            },
            yAxis: {
                title: {
                    text: yTitle
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span>',
                pointFormat: '<div style="color:{series.color};padding:0">{series.name}: </div>' +
                '<div style="padding:0"><b>{point.y:'+decimal_format+'</b></div>',
                shared: true,
                useHTML: true
            },
            colors: altColors,
            plotOptions: {
                area: {
                    stacking: 'percent',
                    lineColor: '#ffffff',
                    lineWidth: 1,
                    marker: {
                        lineWidth: 1,
                        lineColor: '#ffffff'
                    }
                }
            },
            series: series
        });
    }

//Cuando carga el documento
$(function() {

/********************************************************************************/
        $.ajax({
            dataType: "json",
            url: "http://54.213.139.235:1337/counties",
            //data: data,
            async: false,
            success: successtCityList
        });

        function successtCityList(data) {
            var dataCity=[];
            cities = data;
            dataCity.push({
                "text": "Bay Area",
                "value": "Bay Area"
            });
            cities.forEach(
                function(element,index,array){
                    dataCity.push({
                        "text": element.County,
                        "value": element.County
                    });

                }
            );
            $("#BCityCombo").kendoComboBox({
                placeholder: "Select a County...",
                dataTextField: "text",
                dataValueField: "value",
                dataSource: dataCity,
                select: onCitySelect
            });

        }
        //ON SELECT
        function onCitySelect(e) {
            var dataItem = this.dataItem(e.item.index());
            county = dataItem.text.toLowerCase();

            var decimal_format = ".1f}%";

            if(county == "bay area"){
                $(this).updateChartB('Historical Trend for Population Shares by Geographical Area - Bay Area','Percent (Share)','',regional_series,decimal_format);
            }else{
                var series = [];
                var big_tree=[],core=[],exurban=[],suburban=[],uni=[];
                countydata.forEach(function(element,index,array){
                    if(county==element.County.toLowerCase()) {
                        var val = (element.BigThree_Shares*100);
                        big_tree.push([Date.UTC(element.Year, 0, 1), parseFloat(val.toFixed(2))]);
                        val = (element.Core_Shares*100);
                        core.push([Date.UTC(element.Year, 0, 1), parseFloat(val.toFixed(2))]);
                        val = (element.Exurban_Shares*100);
                        exurban.push([Date.UTC(element.Year, 0, 1), parseFloat(val.toFixed(2))]);
                        val = (element.Suburban_Shares*100);
                        suburban.push([Date.UTC(element.Year, 0, 1), parseFloat(val.toFixed(2))]);
                        val = (element.Unincorporated_Shares*100);
                        uni.push([Date.UTC(element.Year, 0, 1), parseFloat(val.toFixed(2))]);
                    }
                });
                series.push({
                    "name": "Big Three",
                    "data": big_tree
                });
                series.push({
                    "name": "Core",
                    "data": core
                });
                series.push({
                    "name": "Suburban",
                    "data": suburban
                });
                series.push({
                    "name": "Exurban",
                    "data": exurban
                });
                series.push({
                    "name": "Unincorporated",
                    "data": uni
                });
                $(this).updateChartB('Historical Trend for Population Shares by Geographical Area - '+county.capitalize()+' County','Percent (Share)','',series,decimal_format);
            }
            //$(this).display();
        }


/********************************************************************************/
        //REQUEST COUNTY DATA FROM SERVER
        $.ajax({
            dataType: "json",
            url: "http://54.213.139.235:1337/lu1/countyshares",
            //data: data,
            async: false,
            success: successtACountyData
        });

        function successtACountyData(data) {
            countydata=data;
        }




/********************************************************************************/
        //REQUEST REGION DATA FROM SERVER
        $.ajax({
            dataType: "json",
            url: "http://54.213.139.235:1337/lu1/regionshares",
            //data: data,
            async: false,
            success: successRegionData
        });

        function successRegionData(data) {
            var big_tree=[],core=[],exurban=[],suburban=[],uni=[];
            data.forEach(function(element,index,array){
                    var val = (element.BigThree_Shares*100);
                    big_tree.push([Date.UTC(element.Year, 0, 1), parseFloat(val.toFixed(2))]);
                    val = (element.Core_Shares*100);
                    core.push([Date.UTC(element.Year, 0, 1), parseFloat(val.toFixed(2))]);
                    val = (element.Exurban_Shares*100);
                    exurban.push([Date.UTC(element.Year, 0, 1), parseFloat(val.toFixed(2))]);
                    val = (element.Suburban_Shares*100);
                    suburban.push([Date.UTC(element.Year, 0, 1), parseFloat(val.toFixed(2))]);
                    val = (element.Unincorporated_Shares*100);
                    uni.push([Date.UTC(element.Year, 0, 1), parseFloat(val.toFixed(2))]);
                }
            );
            regional_series.push({
                "name": "Big Three",
                "data": big_tree
            });
            regional_series.push({
                "name": "Core",
                "data": core
            });
            regional_series.push({
                "name": "Suburban",
                "data": suburban
            });
            regional_series.push({
                "name": "Exurban",
                "data": exurban
            });
            regional_series.push({
                "name": "Unincorporated",
                "data": uni
            });
            var decimal_format = ".1f}%";
            $(this).updateChartB('Historical Trend for Population Shares by Geographical Area - Bay Area','Percent (Share)','',regional_series,decimal_format);
        }

    });
})(jQuery);