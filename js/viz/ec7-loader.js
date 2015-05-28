/*globals jQuery, L, cartodb, geocities, econColors, altColors, Highcharts, science: true */
var cityPromise, countyPromise, regionPromise;

(function($) {
    /*
    Load all the data we'll need for these visualizations
    */

    // Request all the data
    cityPromise = $.ajax({
        dataType: "json",
        url: "http://vitalsigns-production.elasticbeanstalk.com/ec/7/city"
    });
    countyPromise = $.ajax({
        dataType: "json",
        url: "http://vitalsigns-production.elasticbeanstalk.com/ec/7/county"
    });
    regionPromise = $.ajax({
        dataType: "json",
        url: "http://vitalsigns-production.elasticbeanstalk.com/ec/7/region"
    });

})(jQuery);
