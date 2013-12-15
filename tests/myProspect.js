/**
 * Created by patrick on 15/12/13.
 */
casper.start();


casper.on('error', function on_error(failure) {
    casper.echo(failure, 'ERROR');
    casper.capture(new Date().getTime()+"_failure_sceen.jpg");
    //casper.exit(1);
});

casper.on('page.error', function(message, trace) {
    this.echo('remote error caught: ' + message, 'ERROR');
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
