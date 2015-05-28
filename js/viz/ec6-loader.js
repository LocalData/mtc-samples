/*globals jQuery, L, cartodb, geocities, econColors, altColors, Highcharts, science: true */
var tractPromise, cityPromise, countyPromise, regionPromise;

(function($) {
    /*
    Load all the data we'll need for these visualizations
    */

    // Request all the data
    // tractPromise = $.ajax({
    //     dataType: "json",
    //     url: "http://vitalsigns-production.elasticbeanstalk.com/ec/6/tract"
    // });
    cityPromise = $.ajax({
        dataType: "json",
        url: "http://vitalsigns-production.elasticbeanstalk.com/ec/6/city"
    });
    countyPromise = $.ajax({
        dataType: "json",
        url: "http://vitalsigns-production.elasticbeanstalk.com/ec/6/county"
    });
    regionPromise = $.ajax({
        dataType: "json",
        url: "http://vitalsigns-production.elasticbeanstalk.com/ec/6/region"
    });

})(jQuery);
