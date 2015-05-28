/*globals jQuery, L, cartodb, geocities, econColors, altColors, Highcharts, science: true */
var cityPromise, countyPromise, regionPromise, metroPromise;

(function($) {
    /*
    Load all the data we'll need for these visualizations
    */

    // Request all the data
    cityPromise = $.ajax({
        dataType: "json",
        url: "http://vitalsigns-production.elasticbeanstalk.com/ec/11/city"
    });
    countyPromise = $.ajax({
        dataType: "json",
        url: "http://vitalsigns-production.elasticbeanstalk.com/ec/11/county"
    });
    regionPromise = $.ajax({
        dataType: "json",
        url: "http://vitalsigns-production.elasticbeanstalk.com/ec/11/region"
    });
    metroPromise = $.ajax({
        dataType: "json",
        url: "http://vitalsigns-production.elasticbeanstalk.com/ec/11/metro"
    });

})(jQuery);
