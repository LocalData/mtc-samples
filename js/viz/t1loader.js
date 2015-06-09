/*globals jQuery, L, cartodb, geocities, econColors, altColors, Highcharts, science: true */

var regionPromise,
    cityPromiseT1,
    cityPromiseT2,
    countyPromiseT1,
    countyPromiseT2,
    tractPromise;

(function($) {
    /*
    Load all the data we'll need for these visualizations
    */


    regionPromise = $.ajax({
        dataType: 'json',
        url: 'http://vitalsigns-production.elasticbeanstalk.com/t1t2/t1/region'
    });
    cityPromiseT1 = $.ajax({
        dataType: 'json',
        url: 'http://vitalsigns-production.elasticbeanstalk.com/t1t2/t1/cities'
    });
    cityPromiseT2 = $.ajax({
        dataType: 'json',
        url: 'http://vitalsigns-production.elasticbeanstalk.com/t1t2/t2/cities'
    });
    countyPromiseT1 = $.ajax({
        dataType: 'json',
        url: 'http://vitalsigns-production.elasticbeanstalk.com/t1t2/t1/counties'
    });
    countyPromiseT2 = $.ajax({
        dataType: 'json',
        url: 'http://vitalsigns-production.elasticbeanstalk.com/t1t2/t2/counties'
    });
    tractPromise = $.ajax({
        dataType: 'json',
        url: 'http://vitalsigns-production.elasticbeanstalk.com/t1t2/t1/tract'
    });

})(jQuery);
