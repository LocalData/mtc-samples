/*globals jQuery, L, cartodb, geocities, econColors, altColors,
Highcharts, science: true */

var requestArray = [];

(function($) {
    /*
    Load all the data we'll need for these visualizations
    A & B share the same data, so we don't want to load them twice.
    */

    // Fetch all the data in one go.
    var sources = [
        'http://vitalsigns-production.elasticbeanstalk.com/ec/4/city',
        'http://vitalsigns-production.elasticbeanstalk.com/ec/4/county',
        'http://vitalsigns-production.elasticbeanstalk.com/ec/4/region',
        'http://vitalsigns-production.elasticbeanstalk.com/ec/5/county',
        'http://vitalsigns-production.elasticbeanstalk.com/ec/5/region',
        'http://vitalsigns-production.elasticbeanstalk.com/ec/4/tract',
        'http://vitalsigns-production.elasticbeanstalk.com/ec/4/metro',
        'http://vitalsigns-production.elasticbeanstalk.com/ec/5/metro'
    ];
    var i;
    for (i = 0; i < sources.length; i++) {
        requestArray.push($.ajax({
            dataType: 'json',
            url: sources[i]
        }));
    }

})(jQuery);
