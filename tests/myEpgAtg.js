
function getCookie() {
    var theCookies = document.cookie.split(';');
    var aString = '';
    for (var i = 1 ; i <= theCookies.length; i++) {
        aString += i + ' ' + theCookies[i-1] + "\n";
    }
    return aString;
};
casper.start();



var x = require('casper').selectXPath;
//global
var detailHref;
var LOGIN_USERNAME = casper.cli.get('username');
var LOGIN_PASSWORD = casper.cli.get('password');

var screenNumber = 0;

if(LOGIN_USERNAME=='' || LOGIN_PASSWORD == '') {
    casper.echo('Usage: $ casperjs test myEpgATG.js --username=[xxxxxx] --password=[xxxxxx]');
    casper.exit(1);

}

casper.on('error', function on_error(failure) {
    casper.echo(failure, 'ERROR');
    casper.capture(new Date().getTime()+"_failure_sceen.jpg");
    //casper.exit(1);
});

casper.on('page.error', function(message, trace) {
    this.echo('remote error caught: ' + message, 'ERROR');
});

//for basic auth
//casper.setHttpAuth('here_i_type_username', 'here_password');

casper.test.begin('testing home epg atg', 27 ,function suite(test) {

    // testing home
    casper.start("http://www.mycanal.fr/", function() {
        this.echo('Browser Cookie: \n' + this.evaluate(getCookie));
        test.assertHttpStatus(200, 'mycanal is up');
        test.assertTitle("Accueil - myCANAL", "mycanal homepage title is the one expected");
    });
    // wait for ilex bundle
    casper.waitForResource("bundle.js", function() {

        //wait & check ilex header
        casper.waitForSelector("#user a.ident",
            function success() {
                this.test.assertExists("#user a.ident","ilex identification link in header OK");
                this.capture(toString(screenNumber++)+'_home.jpg', undefined, {
                    format: 'jpg',
                    quality: 75
                })
                this.click("#user a.ident");


            },
            function fail() {
                this.test.assertExists("#user a.ident","ilex identification link in header KO");
            });

    });
    // wait & fill ilex auth popin
    casper.withFrame('pass_iframe', function() {
        this.wait(100000,function() {
                this.test.assertTitle('CANAL+ - Authentification en cours...',"Ilex popin title OK");
             casper.waitForResource("checkbox.png", function() {
                casper.waitForSelector("#sso-omniture",
                    function success() {
                        this.test.assertExists("#sso-omniture","ilex popin fully loaded");
                    },
                    function fail() {
                        this.capture('home_popin_ilex_load_failed.jpg', undefined, {
                            format: 'jpg',
                            quality: 75
                        });
                        this.test.assertExists("#sso-omniture","ilex not fully loaded");

                    });

                casper.waitForSelector("#sso-email",
                    function success() {
                        this.test.assertExists("#sso-email","ilex email input ok");
                        this.test.assertExists("#sso-pass","ilex password input ok");
                        this.capture('home_popin_ilex_form_loaded.jpg', undefined, {
                            format: 'jpg',
                            quality: 75
                        });

                        casper.fill('form#sso-form',{
                           'ssoEmail' : LOGIN_USERNAME,
                           'ssoPass' : LOGIN_PASSWORD

                        },false);
                        this.click("input#submit");
                        this.wait(50000);

                    },
                    function fail() {
                        this.capture('home_popin_ilex_failed.jpg', undefined, {
                            format: 'jpg',
                            quality: 75
                        });
                        this.test.assertExists("#sso-email","ilex email input KO");

                    });
                });
        });
    });
    //check logged home
    casper.then(function() {
        this.echo("Testing logged home",'WARN_BAR');
        this.echo('Browser Cookie: \n' + this.evaluate(getCookie));
        this.capture('home_logged.jpg', undefined, {
            format: 'jpg',
            quality: 75
        });
        casper.waitForSelector("#bt-user",
        function success() {
            this.test.assertExists("#bt-user","header ilex user information OK");
            this.test.assertExists('#recos-eureka-1',"Section eureka OK");
            this.test.assertExists('#programmes',"Section ce soir OK");

        },
        function fail() {
            this.capture('home_loging_failed.jpg', undefined, {
                format: 'jpg',
                quality: 75
            });
            this.test.assertExists("#bt-user","home logged  KO");
        });

    });
    // check logged replay cplus home
    casper.thenOpen("http://replay.mycanal.fr/cplus/selection",function() {
        this.echo("Testing cplus replay home",'WARN_BAR');
        this.capture('home_replay_cplus.jpg', undefined, {
            format: 'jpg',
            quality: 75
        });
        test.assertHttpStatus(200, 'cplus replay is up');
        test.assertTitle("Canal+ A la demande - Sélection - myCANAL", "cplus replay title is the one expected");
        test.assertEval(function() {
            return __utils__.findAll("div.programme.content-detail").length >= 10;
        }, "more than 10 programs details on page");
    });
    // check logged replay cinema page
    casper.thenOpen("http://replay.mycanal.fr/cplus/cinema/",function() {
        this.echo("Testing logged replay cinema page",'WARN_BAR');
        this.capture('home_replay_cplus_cinema_list.jpg', undefined, {
            format: 'jpg',
            quality: 75
        });
        test.assertHttpStatus(200, 'cplus replay cinema  is up');
        test.assertTitle("Canal+ A la demande - Cinéma - myCANAL", "cplus replay cinema title is the one expected");
        test.assertEval(function() {
            return __utils__.findAll("div.programme.unit3lines.content-detail").length >= 10;
        }, "more than 10 programs details on list page");
        this.click('a.bt-grid');
        this.capture('home_replay_cplus_cinema_grid.jpg', undefined, {
            format: 'jpg',
            quality: 75
        });

        test.assertEval(function() {
            return __utils__.findAll("div.programme.unit3lines.content-detail").length >= 10;
        }, "more than 10 programs details on grid page");

        detailHref = this.evaluate(function() {
            return __utils__.findOne('div.programme.unit3lines.content-detail>h4>a').getAttribute('href');
        });
        this.echo("going to first program "+detailHref,'INFO');
        casper.open(detailHref);


    });

    //check program détail
    casper.then(function() {
        this.echo("Testing program detail",'WARN_BAR');
        this.capture('home_replay_cplus_program_detail.jpg', undefined, {
            format: 'jpg',
            quality: 75
        });
        test.assertHttpStatus(200, 'progam detail is up');

    });
    //check ce soir home
    casper.thenOpen("http://www.mycanal.fr/guide/ce-soir/selection", function() {
        this.echo("Testing guide ce soir",'WARN_BAR');
        this.capture('home_epg_cesoir.jpg', undefined, {
            format: 'jpg',
            quality: 75
        });
        test.assertHttpStatus(200, 'home epg ces soir is up');
        test.assertEval(function() {
            return __utils__.findAll("div.programme.unit3lines.content-detail-EPG").length >= 8;
        }, "at leat 10 programs details on ce soir page");


    });
    //check ce soir/cinema
    casper.thenOpen("http://www.mycanal.fr/guide/ce-soir/cinema", function() {
            this.echo("Testing guide ce soir/cinema",'WARN_BAR');
            this.capture('home_epg_cesoir_cinema.jpg', undefined, {
                format: 'jpg',
                quality: 75
            });
        test.assertHttpStatus(200, 'home epg ces soir is up');
        test.assertEval(function() {
                return __utils__.findAll("div.programme.unit3lines.content-detail-EPG").length >= 12;
            }, "at leat 12 programs details on ce soir list page");


        this.click('a.bt-grid');
        test.assertEval(function() {
            return __utils__.findAll("div.programme.unit3lines.content-detail-EPG").length >= 12;
        }, "at leat 12 programs details on ce soir grid page");

        //non fonctionnel
        /*this.click(x('//input[@name="timePeriod"][2]'));
        this.capture('home_epg_cesoir_cinema_firt_part.jpg', undefined, {
            format: 'jpg',
            quality: 75
        });
        test.assertEval(function() {
            return __utils__.findAll("div.programme.unit3lines.content-detail-EPG").length >= 12;
        }, "at leat 12 programs details on ce soir grid page filter by evening first part");*/


    });
    //check grille
    casper.thenOpen('http://www.mycanal.fr/guide/grille/',function() {
        this.echo("Testing guide ce grille",'WARN_BAR');
        this.capture('home_epg_guide_grille.jpg', undefined, {
            format: 'jpg',
            quality: 75
        });
        test.assertHttpStatus(200, 'guide grille is up');

        test.assertEval(function() {
            return __utils__.findAll("section.dynContent > div.prog-chaine").length == 6;
        }, " display 6 channel OK");

        test.assertEval(function() {
            return __utils__.findAll("section.dynContent > div.prog-chaine > div.txt").length >= 12;
        }, " display at least 12 programs OK");


        this.click('a.popProg:first-of-type');
        casper.waitForSelector("div.lb-fiche",
            function success() {
                this.capture('home_epg_guide_grille_popup.jpg', undefined, {
                    format: 'jpg',
                    quality: 75
                });
                this.test.assertExists("div.lb-fiche","popup programme open OK");


            },
            function fail() {
                this.capture('home_epg_guide_grille_popup_failed.jpg', undefined, {
                    format: 'jpg',
                    quality: 75
                });
                this.test.assertExists("div.lb-fiche","popup programme  KO");
            });



    });

    casper.run(function() {
        test.done();
    });
});

