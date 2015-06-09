/*globals jQuery, L, cartodb, geocities, econColors, altColors, Highcharts, science: true */
var cityPromise, countyPromise, regionPromise, metroPromise;

(function($) {
    /*
    Load all the data we'll need for these visualizations
    A & B share the same data, so we don't want to load them twice.
    */

    // Request all the data
    cityPromise = $.ajax({
        dataType: "json",
        url: "http://vitalsigns-production.elasticbeanstalk.com/ec/3/city"
    });
    countyPromise = $.ajax({
        dataType: "json",
        url: "http://vitalsigns-production.elasticbeanstalk.com/ec/3/county"
    });
    regionPromise = $.ajax({
        dataType: "json",
        url: "http://vitalsigns-production.elasticbeanstalk.com/ec/3/region"
    });
    metroPromise = $.ajax({
        dataType: "json",
        url: "http://vitalsigns-production.elasticbeanstalk.com/ec/3/metro"
    });

})(jQuery);
