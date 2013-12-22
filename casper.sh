export PATH=/home/vagrant/local/bin:/home/vagrant/local/bin:/home/vagrant/local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/opt/vagrant_ruby/
rm -f /tmp/casper-*
cd /home/nodedata/mycasperttest/
casperjs test tests/myEpgAtg.js --username=$1 --password=$2 --force --xunit=/tmp/casper-$(date +"%Y.%m.%d.%S.%N").xml
casperjs test tests/myProspect.js --username=$1 --password=$2 --force --xunit=/tmp/casper-$(date +"%Y.%m.%d.%S.%N").xml