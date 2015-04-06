    var counties,cities;
    var regiondata,countydataA,citydata;
    var xCategories=[];
    var xCategories2=[];
    var series = [];
    var pop_info=[];
    var pop_perc=[];

    var county="";
    var type = "Population";
    var city = "Bay Area";
    var type_display = "City";

(function($) {
    String.prototype.capitalize = function() {
        return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
    };
    //Actualizamos la información del diagrama
    $.fn.updateChartA = function(title,yTitle,xTitle,series,xCategories,decimal_format,min) {

        $('#Achart').highcharts({
            chart: {
                type: 'line'
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
                },
                min:min
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
                line: {
                    enableMouseTracking: true
                }
            },
            series: series
        });
    }

    //Decidimos que chart despelgamos county/ciudad/tipo
    $.fn.display = function() {

        if(type_display=="City") {
            console.log(city);
            //Si es bay area
            if (city == "Bay Area" || city == "Select a City..." || city == "") {
                var xTitle = '';

                if (type == "Population") {
                    var decimal_format = ",.0f}";
                    //Titulos para todos
                    var yTitle = 'Population';


                    //Regional
                    var title = 'Historical Trend for Population - Bay Area';
                    series = [];
                    series.push({
                        "name": "Bay Area",
                        "data": pop_info
                    });

                    var xCategories = xCategories2;
                } else {
                    var decimal_format = ".1f}%";
                    //Titulos para todos
                    var yTitle = 'Percent Change Since 1960';


                    //Regional
                    var title = 'Historical Trend for Percent Change in Population - Bay Area';
                    series = [];
                    series.push({
                        "name": "Bay Area",
                        "data": pop_perc
                    });
                    var xCategories = xCategories2;
                }

                //Para todos
                $(this).updateChartA(title, yTitle, xTitle, series, xCategories, decimal_format,0);


                /*********************CITY***********************************************************/
            } else {

                //Data de la serie
                var data = [];
                var data_county = [];

                var xTitle = '';


                //Si es population
                if (type == "Population") {
                    var decimal_format = ",.0f}";
                    //Titulos para todos
                    var yTitle = 'Population';

                    var count = '';
                    citydata.forEach(function (element, index, array) {
                        if (element.City.toLowerCase() == city.toLowerCase()) {
                            data.push([Date.UTC(element.Year, 0, 1), element.Pop]);
                            count = element.County.toLowerCase();
                        }
                    });

                    //City
                    var title = 'Historical Trend for Population - ' + city.capitalize();


                    series = [];
                    series.push({
                        "name": city,
                        "data": data
                    });

                    //County
                    countydataA.forEach(function (element, index, array) {

                        if (element.County.toLowerCase() == count.toLowerCase()) {
                            data_county.push([Date.UTC(element.Year, 0, 1), element.Pop]);
                        }
                    });

                    /*
                     series.push({
                     "name": count,
                     "data": data_county
                     });
                     */

                    var xCategories = xCategories2;

                    $(this).updateChartA(title, yTitle, xTitle, series, xCategories, decimal_format,0);
                } else {
                    var decimal_format = ".1f}%";
                    //Titulos para todos
                    var yTitle = 'Percent Change Since 1960';


                    //Regional
                    var count = '';
                    var c = 1;
                    citydata.forEach(function (element, index, array) {
                        if (element.City.toLowerCase() == city.toLowerCase()) {
                            var val = (element.PercentChng_1960 * 100);
                            data.push([Date.UTC(element.Year, 0, 1), parseFloat(val.toFixed(2))]);
                            count = element.County.toLowerCase();
                            if (!element.PercentChng_FLAG) {
                                c = 0;
                            }
                        }
                    });

                    series = [];
                    if (c == 1) {
                        series.push({
                            "name": city,
                            "data": data
                        });
                    } else {
                        alert("City was incorporated after 1960.");
                    }

                    //County
                    countydataA.forEach(function (element, index, array) {

                        if (element.County.toLowerCase() == count.toLowerCase()) {
                            var val = (element.PercentChng_1960 * 100);
                            data_county.push([Date.UTC(element.Year, 0, 1), parseFloat(val.toFixed(2))]);
                        }
                    });

                    var title = 'Historical Trend for Percent Change in Population - '+ city.capitalize() + ' and ' + count.capitalize() + ' County';

                    series.push({
                        "name": count.capitalize() + ' County',
                        "data": data_county
                    });
                    if (c == 1) {
                        $(this).updateChartA(title, yTitle, xTitle, series, xCategories, decimal_format, null);
                    }
                }

            }
        }else{
            //Data de la serie
            var data = [];
            var data_county = [];

            var xTitle = '';


            //Si es population
            if (type == "Population") {
                var decimal_format = ",.0f}";
                //Titulos para todos
                var yTitle = 'Population';


                //City
                var title = 'Historical Trend for Population - ' + county.capitalize() + ' County';

                //County
                countydataA.forEach(function (element, index, array) {

                    if (element.County.toLowerCase() == county.toLowerCase()) {
                        data_county.push([Date.UTC(element.Year, 0, 1), element.Pop]);
                    }
                });

                series = [];
                series.push({
                 "name": county.capitalize() + ' County',
                 "data": data_county
                });

                var xCategories = xCategories2;
            } else {
                var decimal_format = ".1f}%";
                //Titulos para todos
                var yTitle = 'Percent Change Since 1960';

                var title = 'Historical Trend for Percent Change in Population - ' + county.capitalize() + ' County';

                series = [];

                //County
                countydataA.forEach(function (element, index, array) {

                    if (element.County.toLowerCase() == county.toLowerCase()) {
                        var val = (element.PercentChng_1960 * 100);
                        data_county.push([Date.UTC(element.Year, 0, 1), parseFloat(val.toFixed(2))]);
                    }
                });

                series.push({
                    "name": county.capitalize() + ' County',
                    "data": data_county
                });
            }

            //Para todos
            $(this).updateChartA(title, yTitle, xTitle, series, xCategories, decimal_format,null);
        }
    }




//Cuando carga el documento
$(function() {



/*************************Botones***************************************************************************************/

    $('#btn1').click(function(){
        $(this).addClass("active")
        $(this).siblings('a').removeClass('active');

        type = "Population";

        combobox = $("#ACityCombo").data("kendoComboBox");
        city = combobox.text();

        $(this).display();
    });
    $('#btn2').click(function(){
        $(this).addClass("active")
        $(this).siblings('a').removeClass('active');

        type = "Percent change since 1960";

        combobox = $("#ACityCombo").data("kendoComboBox");
        city = combobox.text();

        $(this).display();
    });
/********************************************************************************/
    $.ajax({
        dataType: "json",
        url: "http://54.213.139.235:1337/cities",
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
                    "text": element.City,
                    "value": element.County
                });

            }
        );
        $("#ACityCombo").kendoComboBox({
            placeholder: "Select a City...",
            dataTextField: "text",
            dataValueField: "value",
            dataSource: dataCity,
            select: onCitySelect
        });

    }
    //ON SELECT
    function onCitySelect(e) {
        type_display = "City";
        $("#ACountyCombo").data("kendoComboBox").text('');
        var dataItem = this.dataItem(e.item.index());
        city = dataItem.text;
        county = dataItem.val;

        //var combobox = $("#AType").data("kendoComboBox");
        //var type = combobox.text();

        $(this).display();
    }

/********************************************************************************/
    $.ajax({
        dataType: "json",
        url: "http://54.213.139.235:1337/counties",
        //data: data,
        async: false,
        success: successtCountyList
    });

    function successtCountyList(data) {
        var dataCity=[];
        counties = data;
        counties.forEach(
            function(element,index,array){
                dataCity.push({
                    "text": element.County,
                    "value": element.County
                });

            }
        );
        $("#ACountyCombo").kendoComboBox({
            placeholder: "Select a County...",
            dataTextField: "text",
            dataValueField: "value",
            dataSource: dataCity,
            select: onCountySelect
        });

    }
    //ON SELECT
    function onCountySelect(e) {
        $("#ACityCombo").data("kendoComboBox").text('');
        type_display = "County";
        var dataItem = this.dataItem(e.item.index());
        county = dataItem.text;

        $(this).display();
    }

/********************************************************************************/
        //REQUEST COUNTY DATA FROM SERVER
        $.ajax({
            dataType: "json",
            url: "http://54.213.139.235:1337/lu1/city",
            //data: data,
            async: false,
            success: successtACityData
        });

        function successtACityData(data) {
            citydata = data;

        }
        //REQUEST COUNTY DATA FROM SERVER
        $.ajax({
            dataType: "json",
            url: "http://54.213.139.235:1337/lu1/county",
            //data: data,
            async: false,
            success: successtACountyData
        });

        function successtACountyData(data) {
            countydataA = data;

        }

        //REQUEST REGION DATA FROM SERVER
        $.ajax({
            dataType: "json",
            url: "http://54.213.139.235:1337/lu1/region",
            //data: data,
            async: false,
            success: successRegionData
        });

        function successRegionData(data) {
            regiondata = data;

            //We get the information for the years
            xCategories=[];
            pop_info=[];
            pop_perc=[];
            regiondata.forEach(
                function(element,index,array){
                    xCategories2.push(element.Year);
                    pop_info.push([Date.UTC(element.Year, 0, 1), element.Pop]);
                    var val = (element.PercentChng_1960*100);
                    pop_perc.push([Date.UTC(element.Year, 0, 1),parseFloat(val.toFixed(2))]);
                }
            );
        }

    $('#btn1').addClass("active");
    type = "Population";
    city = "Bay Area";
    type_display = "City";
    $(this).display();
    /*
        //Primera carga del chart
        series = [];
        series.push({
            "name": "Bay Area",
            "data": pop_info
        });
        var decimal_format = ",.0f}";
        $(this).updateChartA('Population view: Historical Trend for Population - Bay Area','Percent Change Since 1960','annual from 1960 to 2014',series,xCategories2,decimal_format);
        */

    });
})(jQuery);