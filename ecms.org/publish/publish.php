<?php
define("PUBLISH_FROM_DIR_TOPICS", "/var/www/vhosts/cybersecurity.metro.tokyo.lg.jp/stg.cybersecurity/topics/");
define("PUBLISH_TO_DIR_TOPICS", "/var/www/vhosts/cybersecurity.metro.tokyo.lg.jp/httpdocs/topics/");
define("PUBLISH_FROM_DIR_TORIKUMI", "/var/www/vhosts/cybersecurity.metro.tokyo.lg.jp/stg.cybersecurity/torikumi/");
define("PUBLISH_TO_DIR_TORIKUMI", "/var/www/vhosts/cybersecurity.metro.tokyo.lg.jp/httpdocs/torikumi/");
define("PUBLISH_FROM_DIR_ALL", "/var/www/vhosts/cybersecurity.metro.tokyo.lg.jp/stg.cybersecurity/");
define("PUBLISH_TO_DIR_ALL", "/var/www/vhosts/cybersecurity.metro.tokyo.lg.jp/httpdocs/");
define("PUBLISH_FROM_DIR_TOP", "/var/www/vhosts/cybersecurity.metro.tokyo.lg.jp/stg.cybersecurity/index.html");
define("PUBLISH_TO_DIR_TOP", "/var/www/vhosts/cybersecurity.metro.tokyo.lg.jp/httpdocs/");
define("PUBLISH_OUTH_TOKEN", "password");

if($_GET["token"] == PUBLISH_OUTH_TOKEN){
  if($_GET["type"] == "topics"){
    system("rsync -av --exclude='.htaccess' --delete --log-file=publish.log ".PUBLISH_FROM_DIR_TOPICS." ".PUBLISH_TO_DIR_TOPICS,$arr);
    system("rsync -av --exclude='.htaccess' --delete --log-file=publish.log ".PUBLISH_FROM_DIR_TOP." ".PUBLISH_TO_DIR_TOP,$arr);
    file_get_contents('https://waf.sucuri.net/api?k=8414cc2a552d39622ed3ee421cb236b9&s=d6977448af59f41a87116862b0248fd8&a=clearcache');
  }else if($_GET["type"] == "torikumi"){
    system("rsync -av --exclude='.htaccess' --delete --log-file=publish.log ".PUBLISH_FROM_DIR_TORIKUMI." ".PUBLISH_TO_DIR_TORIKUMI,$arr);
    system("rsync -av --exclude='.htaccess' --delete --log-file=publish.log ".PUBLISH_FROM_DIR_TOP." ".PUBLISH_TO_DIR_TOP,$arr);
    file_get_contents('https://waf.sucuri.net/api?k=8414cc2a552d39622ed3ee421cb236b9&s=d6977448af59f41a87116862b0248fd8&a=clearcache');
  }else if($_GET["type"] == "all"){
    system("rsync -av --exclude='.htaccess' --delete --log-file=publish.log ".PUBLISH_FROM_DIR_ALL." ".PUBLISH_TO_DIR_ALL,$arr);
    file_get_contents('https://waf.sucuri.net/api?k=8414cc2a552d39622ed3ee421cb236b9&s=d6977448af59f41a87116862b0248fd8&a=clearcache');
  }
    echo $arr;
}else{
  exit();
}
