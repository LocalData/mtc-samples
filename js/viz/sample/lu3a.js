var regional_series=[];
var countydata;
(function($) {
    String.prototype.capitalize = function() {
        return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
    };
    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    //Actualizamos la información del diagrama
    $.fn.updateChartA = function(title,yTitle,xTitle,series,decimal_format) {

        $('#Achart').highcharts({
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
                /*
                headerFormat: '<span style="font-size:10px">{point.key}</span>',
                pointFormat: '<div style="color:{series.color};padding:0">{series.name}: </div>' +
                '<div style="padding:0"><b>{point.percentage:'+decimal_format+'</b></div>',
                footerFormat: '<div style="padding:0"><b>Total Units: '+this.total+'</b></div>',
*/

                formatter: function () {
                    var d = new Date(this.x);
                    var total = 0;

                    var s = '<span style="font-size:10px">' + d.getFullYear() + '</span>';
                    $.each(this.points, function (a,b) {
                        s += '<div style="color:'+this.series.color+';padding:0">' + this.series.name + ':</div> ' +
                        '<div style="padding:0"><b>' + b.percentage.toFixed(1) + '%</b></div>';
                        total += this.y;
                    });

                    s+= '<div style="padding:0"><b>Total Units: '+numberWithCommas(total)+'</b></div>';

                    return s;
                },
                shared: true,
                useHTML: true
            },
            colors: altColors,
            plotOptions: {
                area: {
                    stacking: 'normal'
                }
            },
            series: series
        });
    };

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
            $("#ACountyCombo").kendoComboBox({
                text: "Select a County...",
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

            var decimal_format = ",.1f}%";

            if(county == "bay area"){
                $(this).updateChartA('Historical Trend for Housing Growth - Bay Area','Number of Permitted Units','',regional_series,decimal_format);
            }else{
                var series = [];
                var SFUNITS=[],MFUNITS=[],SF_Share=[],MF_Share=[];
                countydata.forEach(function(element,index,array){
                    if(county==element.County.toLowerCase()) {
                        /*
                        var val = (element.SF_Share*100);
                        SF_Share.push([Date.UTC(element.YEAR, 0, 1), parseFloat(val.toFixed(2))]);
                        val = (element.MF_Share*100);
                        MF_Share.push([Date.UTC(element.YEAR, 0, 1), parseFloat(val.toFixed(2))]);
                        */
                        SF_Share.push([Date.UTC(element.YEAR, 1, 1), element.SFUNITS]);
                        MF_Share.push([Date.UTC(element.YEAR, 1, 1), element.MFUNITS]);
                    }
                });
                series.push({
                    "name": "Single-Family Units",
                    "data": SF_Share
                });
                series.push({
                    "name": "Multi-Family Units",
                    "data": MF_Share
                });
                $(this).updateChartA('Historical Trend for Housing Growth - '+county.capitalize()+' County','Number of Permitted Units','',series,decimal_format);
            }
            //$(this).display();
        }


/********************************************************************************/
        //REQUEST COUNTY DATA FROM SERVER
        $.ajax({
            dataType: "json",
            url: "http://54.213.139.235:1337/lu3/county",
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
            url: "http://54.213.139.235:1337/lu3/region",
            //data: data,
            async: false,
            success: successRegionData
        });

        function successRegionData(data) {
            var SFUNITS=[],MFUNITS=[],SF_Share=[],MF_Share=[];
            data.forEach(function(element,index,array){
                    SF_Share.push([Date.UTC(element['Row Labels'], 1, 1), element.SFUNITS]);
                    MF_Share.push([Date.UTC(element['Row Labels'], 1, 1), element.MFUNITS]);
                    /*
                    var val = (element.SF_Share*100);
                    SF_Share.push([Date.UTC(element['Row Labels'], 0, 1), parseFloat(val.toFixed(2))]);
                    val = (element.MF_Share*100);
                    MF_Share.push([Date.UTC(element['Row Labels'], 0, 1), parseFloat(val.toFixed(2))]);
                    */
                }
            );
            regional_series.push({
                "name": "Single-Family Units",
                "data": SF_Share
            });
            regional_series.push({
                "name": "Multi-Family Units",
                "data": MF_Share
            });
            var decimal_format = ",.1f}%";
            $(this).updateChartA('Historical Trend for Housing Growth - Bay Area','Number of Permitted Units','',regional_series,decimal_format);
        }


    });
})(jQuery);