/*globals jQuery, L, cartodb, geocities, allYellow, altColors, Highcharts, science: true */
var cityPromise, countyPromise, regionPromise;

(function($) {
    /*
    Load all the data we'll need for these visualizations
    */

    // Request all the data
    cityPromise = $.ajax({
        dataType: "json",
        url: "http://54.149.29.2/ec/7/city"
    });
    countyPromise = $.ajax({
        dataType: "json",
        url: "http://54.149.29.2/ec/7/county"
    });
    regionPromise = $.ajax({
        dataType: "json",
        url: "http://54.149.29.2/ec/7/region"
    });

})(jQuery);
