/**
 * @author : patrick.deroubaix@gmail.com
 */

//casper.start();

casper.options.clientScripts = ["js/boomerang/boomerang.js"];

casper.on('error', function on_error(failure) {
    casper.echo(failure, 'ERROR');
    casper.capture(new Date().getTime()+"_failure_sceen.jpg");
    //casper.exit(1);
});

casper.on('page.error', function(message, trace) {
    this.echo('remote error caught: ' + message, 'ERROR');
});

var resources = [];
casper.on('page.resource.requested', function(requestData, request) {
    var now = new Date().getTime();
    resources[requestData.id] = {
        id: requestData.id,
        url: requestData.url,
        request: request,
        responses: {},
        duration: '',
        times: {
            request: now
        }
    };

});

casper.on('page.resource.received', function(response) {
    var now = new Date().getTime(),
        resource = resources[response.id];
    resource.responses[response.stage] = response;
    if (!resource.times[response.stage]) {
        resource.times[response.stage] = now;
        resource.duration = now - resource.times.request;
        console.log(resource.url+" "+resource.duration);
    }

});


casper.test.begin('testing home epg atg', 3 ,function suite(test) {

    // testing home
    casper.start("http://www.mycanal.fr/", function() {
        test.assertHttpStatus(200, 'mycanal is up');
        test.assertTitle("Accueil - myCANAL", "mycanal homepage title is the one expected");

    });

    casper.thenOpen("http://live.mycanal.fr/tv/",function() {
        test.assertHttpStatus(200, 'liveTV is up');

    });

    casper.run(function() {
        test.done();
    });

});
