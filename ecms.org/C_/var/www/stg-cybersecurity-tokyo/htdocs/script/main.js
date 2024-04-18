//ナビゲーションアクティブ化
function navActive() {
  var url = location.pathname;
  var activeUrlGnav = url.split('/')[1];
  var activeUrlLnav = url.split('/')[2];
  var $navList = $('.c-listGnav__link');

  //ローカルナビアクティブ化
  if($('.c-navLocal').length) {
    //取り組みページと外部の情報紹介ページのみ階層ルールが異なるため
    if(activeUrlGnav === 'torikumi' || activeUrlGnav === 'links') {
      $('.c-listLnav__item__link').each(function(){
        if($(this).attr('href').split('/')[1] === activeUrlGnav) {
          $(this).addClass('is-active');
        }
      });
    } else {
      $('.c-listLnav__item__link').each(function(){
        if($(this).attr('href').split('/')[2] === activeUrlLnav) {
          $(this).addClass('is-active');
        }
      });
    }
  }
  //「東京都の取組」ページと「外部の情報紹介」ページが「セキュリティの部屋」配下になったため
  if(activeUrlGnav === 'torikumi' || activeUrlGnav === 'links') {
    activeUrlGnav = 'security';
  }

  $navList.each(function(){
    if($(this).attr('href').split('/')[1] === activeUrlGnav) {
      $(this).addClass('is-active');
    }
  });


  //コラムエピソードボタン　アクティブ化
  if($('.p-episodeBtnList').length) {
    $('.p-episodeBtn').each(function(){
      if($(this).attr('href').split('/')[2] === activeUrlLnav) {
        $(this).addClass('is-active');
      }
    });
  }
}

//高さを揃える
function heightLine() {
  $('.p-dlBox__item__cont__top').matchHeight();
  $('.p-dlBox__item__cont__bottom').matchHeight();
  $('.p-episodeBtn__body').matchHeight();
  $('.p-introPanel__head').matchHeight();
}

function returnTop() {
  var $pageTop = $('.js-return');
  $pageTop.hide();
  $(window).scroll(function() {
    if ($(this).scrollTop() > 400) {
      $pageTop.fadeIn();
    } else {
      $pageTop.fadeOut();
    }
  });
}

//スムーススクロール
function smoothScroll(elm){
  $(elm).on('click', function(){
    var href= $(this).attr('href'),
        target = $(href == '#' || href == '' ? 'html' : href),
        position = target.offset().top;
    if($('.c-navLocal, .p-anchor').length && !tabWidth()) {
      position = position - $('.c-navLocal, .p-anchor').height() - 10;
    }
    $('html, body').animate({scrollTop:position}, 'slow', 'swing');
    return false;
  });
}

//上固定アンカー
function scrollAnchor() {
  if($('.p-anchor').length >= 1) {
    var elements = $('.p-anchor');
    Stickyfill.add(elements);

    var $anchorLink = $('.p-anchorBtn');
    var contentsTop = new Array();

    for (var i = 0; i < $anchorLink.length; i++) {
      var targetContents = $anchorLink.eq(i).attr('href');
      if(targetContents.charAt(0) == '#') {
        var targetContentsTop = $(targetContents).offset().top;
        var targetContentsBottom = targetContentsTop + $(targetContents).outerHeight(true) - 1;
        contentsTop[i] = [targetContentsTop, targetContentsBottom];
      }
    };
    currentCheck();

    // 現在地をチェックする
    function currentCheck() {
      var winTop = $(window).scrollTop();
      var winHeight = $(window).height();
      for (var i=0; i < contentsTop.length; i++) {
        if(contentsTop[i][0] <= winTop + winHeight / 2 && contentsTop[i][1] >= winTop - winHeight / 2) {
          $anchorLink.removeClass('is-active');
          $anchorLink.eq(i).addClass('is-active');
          i == contentsTop.length;
        }
      };

      if(!$('.p-anchorBtn.is-active').length) {
        $anchorLink.eq(0).addClass('is-active');
      }
    }

    $(window).on('scroll resize', function() {
      currentCheck();
    });

    $anchorLink.on('click', function() {
      var url = $(this).attr('href');
      var anchorContentHeight = 0;
      if(!tabWidth()) {
        anchorContentHeight = $('.p-anchor').outerHeight() + 26;
      }
      if(url.indexOf('#') != -1){
        var anchor = url.split('#');
        var target = $('#' + anchor[1]);
        if(target.length){
          var pos = Math.floor(target.offset().top) - anchorContentHeight;
          $('html, body').animate({scrollTop:pos}, 500);
        }
      }
    });
  }
}

//ローカルナビ 固定
function localNav() {
  if($('.c-navLocal').length >= 1) {
    var elements = $('.l-main__middle__head');
    Stickyfill.add(elements);
  }
}

//更新情報一覧の生成
function createNewsList() {
  var newsDate = [];
  var $infoBox = $('#js-info');
  var showsNum = 20;
  if($infoBox.length) {
    var url = location.pathname;
    var secondPath = url.split('/')[1];
    var thirdPath = url.split('/')[2];
    var timestamp = new Date().getTime();
    var jsonPath = '/json/news.json?' + timestamp;
    $.getJSON(jsonPath, function(data) {
      newsDate = data;

      //現在のページがセキュリティの部屋配下の場合
      if(secondPath === 'security') {
        showsNum = 5;
        //絞り込んだデータをfilterdArrayへ
        var filterdArray = newsDate.filter(function(item, index){
          if (item.page.indexOf(thirdPath) >= 0) {
            //コラムとサイバーゴースト情報を除外
            if(item.page === 'column' || item.page === 'ghost' || item.page === '') {
              return false;
            } else {
              return true;
            }
          }
        });

        //newsDate配列を空にする
        newsDate.length = 0;
        newsDate = filterdArray;
      }


      //現在のページが「東京都の取組」または「外部の情報紹介」、「サイバー脅威」の場合
      if(secondPath === 'torikumi' || secondPath === 'links' || secondPath === 'cyberthreat') {
        showsNum = 5;
        //絞り込んだデータをfilterdArrayへ
        var filterdArray = newsDate.filter(function(item, index){
          if (item.page.indexOf(secondPath) >= 0) {
            return true;
          }
        });

        //newsDate配列を空にする
        newsDate.length = 0;
        newsDate = filterdArray;
      }

      addArticle();
      getCurrentTime();
      pagination(showsNum);
    });
  }

  function addArticle() {
    var showsLength = newsDate.length;
    if(showsLength >= 1) {
      if($('.l-base--top').length || $('.catGhost').length) {
        showsLength = 5;
      }
      for (var i = 0; i <= showsLength - 1; i++) {
        var articleDate = newsDate[i].date.split(' ')[0];
        var articleDateData = articleDate.replace(/\./g, '-');
        var targetBlank = '';
        var removeParamUrl = newsDate[i].link.split('?')[0].split('#')[0];
        var matchCheckUrl = removeParamUrl + ' ';
        if(removeParamUrl.indexOf('http') !== -1 || matchCheckUrl.indexOf('.pdf' + ' ')!== -1) {
          targetBlank = 'target="_blank"';
        }

        //見出しが非リンクの場合の判定
        var linkTags = '';
        if(newsDate[i].link !== '') {
          linkTags = '<a href="' + newsDate[i].link + '" class="p-infoItem__ttl__link"' + targetBlank + '>' + newsDate[i].title + '</a>';
        } else {
          linkTags = '<span class="p-infoItem__ttl__link">' + newsDate[i].title + '</span>';
        }

        var article = '<article data-time="' + articleDateData + '" class="p-infoItem">' +
                      '<div class="p-infoItem__data">' +
                      '<time datetime="' + articleDateData + '" class="p-infoItem__data__date">' + articleDate + '</time>' +
                      '<div class="p-infoItem__data__label--' + newsDate[i].category_label + '">' + newsDate[i].category_name + '</div>' +
                      '</div>' +
                      '<h2 class="p-infoItem__ttl">' +
                      linkTags +
                      '</h2>' +
                      '</article>';

        $infoBox.append(article);
      }
    } else {
      $infoBox.append('<p>関連する情報はありません。</p>');
    }
  }
}

function getCurrentTime() {
  var currentTime = new Date();
  $.ajax({
    type: 'GET',
    cache: false
  }).done(function(data, status, xhr) {
    try {
      var serverTime = new Date(xhr.getResponseHeader('Date'));
      var offset = serverTime.getTimezoneOffset() * 60 * 1000;
      currentTime = new Date(serverTime.getTime() + offset + 9 * 60 * 60 * 1000);
    } catch(e) {
    } finally {
      addNew(currentTime);
    }
  }).fail(function() {
    addNew(currentTime);
  });


  function addNew(currentTime) {
    $('.p-infoItem, .p-infoItem--ttlOnly').each(function(){
      var articleDate = $(this).attr('data-time').split('-');
      var articleDateDetail = new Date(articleDate[0], articleDate[1]-1, articleDate[2], 0, 0);
      var offset = articleDateDetail.getTimezoneOffset() * 60 * 1000;
      articleDateDetail = new Date(articleDateDetail.getTime() + offset);
      var timeJP = new Date(articleDateDetail.getTime() + 9 * 60 * 60 * 1000);
      var df = currentTime - timeJP;
      var dfDate = df / 1000 / 60 / 60 / 24;

      if(dfDate <= 14) {
        $(this).find('.p-infoItem__ttl__link').append('<span class="p-infoItem__new">NEW!</span>');
      }
    });
    textLine();
  }
}


//SP用メニュー
function spMenu() {
  $('body').append('<div class="overlay"></div>');
  $btn = $('.c-navToggle__btn');
  $overlay = $('.overlay');

  $btn.on('click', function(){
    if(!$('#base').hasClass('is-open')) {
      $('#base, #header').addClass('is-open');
      $btn.find('span').text('閉じる');
      $overlay.fadeIn();
      $('a, button, input, textarea').each(function(){
        $(this).attr('tabindex', '-1');
      });
      $('.c-spNav').find('a, button').each(function(){
        $(this).attr('tabindex', '');
      });

    } else {
      $overlay.fadeOut();
      $('#base, #header').removeClass('is-open');
      $('.c-spNav__body').hide();
      $btn.find('span').text('メニュー');
      $('a, button, input, textarea').each(function(){
        $(this).attr('tabindex', '');
      });
    }
  });

  $overlay.on('click', function(){
    $overlay.fadeOut();
    $('#base, #header').removeClass('is-open');
    $btn.find('span').text('メニュー');
    $('a, button, input, textarea').each(function(){
      $(this).attr('tabindex', '');
    });
  });

  $(window).on('resize', function() {
    if(!tabWidth()) {
      $('.overlay').fadeOut();
      $('#base, #header').removeClass('is-open');
      $('.c-navToggle__btn').find('span').text('メニュー');
      $('a, button, input, textarea').each(function(){
        $(this).attr('tabindex', '');
      });
    }
  });
}

function imgReplace() {
  var targetImg = '.imgReplace, .p-epColumnItem__chara img, .p-sectionTtl img, .p-sectionTtl--line img, .p-ghostLink img, .p-ghostLink--disable img, .p-ghostDetail__right img, .p-ghostDetail__right--wide img, .p-mainvisual__logo img';
  if(tabWidth()) {
    $(targetImg).each(function(){
      $(this).attr('src',$(this).attr('src').replace('__pc', '__sp'));
    });
  } else {
    $(targetImg).each(function(){
      $(this).attr('src',$(this).attr('src').replace('__sp', '__pc'));
    });
  }
  if(middleWidth()) {
    $('.p-categoryHeading__body__character img').each(function(){
      $(this).attr('src',$(this).attr('src').replace('__pc', '__sp'));
    });
  } else {
    $('.p-categoryHeading__body__character img').each(function(){
      $(this).attr('src',$(this).attr('src').replace('__sp', '__pc'));
    });
  }
}

function pagination(num){
  var maxShow = num;
  var $targetArticle = $('.p-sectionInfo__body__content').find('article');
  var articleLength = $targetArticle.length;
  var urlHash = location.hash.split('#page')[1];
  var $totalPage;

  if($('.p-pagination').length > 0){
    if($('.p-categoryHeading.catTorikumi').length > 0){
      maxShow = 10;
    }
    if(articleLength > maxShow) {
      createPagination(articleLength, maxShow);
      showPage();
    }
  }


  $('.p-pagination__list__btn').not('.js-prev, .js-next').on('click', function(){
    var $clickIndex = $(this).index('.p-pagination__list__btn');
    var $clickParent = $(this).parent('.p-pagination__list__item');
    if(!$clickParent.hasClass('is-active')){
      window.history.pushState(null,null,'#page'+$clickIndex);
      $('.p-pagination__list__item').removeClass('is-active');
      $('.js-articleWrap').hide();
      $clickParent.addClass('is-active');
      $('.js-articleWrap').eq($clickIndex - 1).show();
      paginationShift();
      paginationShiftScroll();
    }
  });

  $('.js-prev').on('click', function() {
    var urlHash = location.hash.split('#page')[1];
    var prevNum = urlHash - 1;
    if(urlHash == 1 || !urlHash) {
      return;
    } else {
      $('.p-pagination__list__item').removeClass('is-active');
      $('.p-pagination__list__item').eq(prevNum).addClass('is-active');
      $('.js-articleWrap').hide();
      window.history.pushState(null,null,'#page'+prevNum);
      $('.js-articleWrap').eq(urlHash - 2).show();
      paginationShift();
      paginationShiftScroll();
    }
  });

  $('.js-next').on('click', function() {
    var urlHash = location.hash.split('#page')[1];
    var nextNum = parseInt(urlHash) + 1;

    if(urlHash == $totalPage) {
      return;
    } else {
      $('.p-pagination__list__item').removeClass('is-active');
      $('.p-pagination__list__item').eq(nextNum).addClass('is-active');
      $('.js-articleWrap').hide();
      window.history.pushState(null,null,'#page'+nextNum);
      $('.js-articleWrap').eq(urlHash).show();
      paginationShift();
      paginationShiftScroll();

    }

    if(!urlHash){
      $('.p-pagination__list__item').removeClass('is-active');
      $('.p-pagination__list__item').eq(2).addClass('is-active');
      $('.js-articleWrap').hide();
      window.history.pushState(null,null,'#page2');
      $('.js-articleWrap').eq(1).show();
      paginationShift();
      paginationShiftScroll();
    }
  });

  function createPagination(articleLength, maxShow) {
    var showPagination = 3;
    var pageNum = Math.ceil(articleLength / maxShow);
    do {
        $('.p-sectionInfo__body__content').children('article:lt(' + maxShow + ')').wrapAll('<div class="js-articleWrap"></div>')
      } while ($('.p-sectionInfo__body__content').children('article').length);

    //初期化
    $('.js-articleWrap').hide();
    $('.js-articleWrap').eq(0).show();
    $('.p-pagination__list__item').eq(1).addClass('is-active');
    $totalPage = $('.js-articleWrap').length;

    if(urlHash > $totalPage || isNaN(urlHash)) {
      window.history.replaceState(null, null, '#page1');
    }

    $('.p-pagination').append('<div class="p-pagination__body"></div>');
    $('.p-pagination__body').append('<ul class="p-pagination__list"></ul>');

    for(i=1; i<=pageNum+2; i++) {
      $('.p-pagination__list').append('<li class="p-pagination__list__item"><button class="p-pagination__list__btn"></button></li>');
    };

    for(i=1; i<=pageNum; i++) {
      $('.p-pagination__list__btn').eq(i).addClass('page' + i).text(i);
    };

    $('.p-pagination__list__item:first-child').find('button').addClass('js-prev').text('戻る');
    $('.p-pagination__list__item:last-child').find('button').addClass('js-next').text('進む');

    if($('.p-pagination__list__item').length > 5) {
      $('.p-pagination__list__item').hide();
      $('.js-prev').parent('.p-pagination__list__item').show();
      $('.js-next').parent('.p-pagination__list__item').show();
      for(i=1; i<=3; i++){
        $('.p-pagination__list__item').eq(i).show();
      }
    }
  };
}

function showPage() {
  var urlHash = location.hash.split('#page')[1];
  var $totalPage = $('.js-articleWrap').length;

  if(urlHash <= $totalPage) {
    $('.js-articleWrap').hide();
    $('.js-articleWrap').eq(urlHash - 1).show();
    $('.p-pagination__list__item').removeClass('is-active');
    $('.p-pagination__list__item').eq(urlHash).addClass('is-active');
    paginationShift();
  } else if(urlHash > $totalPage || isNaN(urlHash)) {
    $('.js-articleWrap').hide();
    $('.js-articleWrap').eq(0).show();
    $('.p-pagination__list__item').removeClass('is-active');
    $('.p-pagination__list__item').eq(1).addClass('is-active');
  } else {
    $('.js-articleWrap').eq(0).show();
    $('.p-pagination__list__item').eq(1).addClass('is-active');
  }
}

function paginationShift() {
  var urlHash = location.hash.split('#page')[1];
  var $totalPage = $('.js-articleWrap').length;
  if(urlHash >= 2 && urlHash <= $totalPage-1) {
    $('.p-pagination__list__item').hide();
    $('.p-pagination__list__item').first().show();
    $('.p-pagination__list__item').last().show();
    $('.p-pagination__list__item.is-active').show();
    $('.p-pagination__list__item.is-active').next('.p-pagination__list__item').show();
    $('.p-pagination__list__item.is-active').prev('.p-pagination__list__item').show();
  }

  if(urlHash == 1) {
    $('.p-pagination__list__item').hide();
    $('.p-pagination__list__item').first().show();
    $('.p-pagination__list__item').last().show();
    for(i=1; i<=3; i++) {
      $('.p-pagination__list__item').eq(i).show();
    }
  } 

  if(urlHash == $totalPage) {
    $('.p-pagination__list__item').hide();
    $('.p-pagination__list__item').first().show();
    $('.p-pagination__list__item').last().show();
    for(i=$totalPage; i>=$totalPage-2; i--) {
      $('.p-pagination__list__item').eq(i).show();
    }
  }
}

//更新情報一覧ページであれば先頭へスクロール
function paginationShiftScroll() {
  if($('.catInfo').length) {
    $('html, body').animate({scrollTop: $('#js-info').offset().top - 70}, 'slow', 'swing');
  }
}

//記事一覧の行数制限
function textLine() {
  $('.p-infoItem__ttl__link').each(function(){
    var newIcon = $(this).find('.p-infoItem__new').length;
    var newIconTag = '<span class="p-infoItem__new"></span>';

      if(newIcon != 0) {
        $(this).trunk8({
          lines: 2,
          fill: '&hellip;' + newIconTag
        });
      } else {
        $(this).trunk8({
            lines: 2
        });
      }
  });
}

function bannerSlider() {
  var length = $('.p-fSlider').find('.p-fSlider__item').length;
  var $slider = $('.p-fSlider__body').slick({
    autoplay: true,
    infinite: true,
    slidesToShow: 4,
    slidesToScroll: 4,
    autoplaySpeed: 5000,
    dots: true,
    arrows: false,
    responsive: [
    {
      breakpoint: 750,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2
      }
    }]
  });

  var playBtn = '<li class="stopBtn"><button>停止</button></li>';
  $slider.addClass('is-play');
  $slider.find('.slick-dots').append(playBtn);
  playBtnClick();

  if($(window).width() >= 750) {
    if(length <= 4) {
      $slider.find('.slick-dots').hide();
    }
  }

  $slider.on('breakpoint', function(event, slick, breakpoint){
    $slider.addClass('is-play');
    $slider.find('.slick-dots').append(playBtn);
    playBtnClick();
    if($(window).width() >= 750) {
      if(length <= 4) {
        $slider.find('.slick-dots').hide();
      }
    }
  });

  function playBtnClick() {
    $('.p-fSlider').find('.stopBtn').on('click', 'button', function(event) {
      event.preventDefault();
      if($slider.hasClass('is-play')) {
        $slider.removeClass('is-play');
        $slider.slick('slickPause');
        $(this).text('再生');
      }
      else {
        $slider.addClass('is-play');
        $slider.slick('slickPlay');
        $(this).text('停止');
      }
    });
  }
}

$(function(){
  navActive();
  smoothScroll('.c-returnTop__body__link, .p-ttlBtn');
  heightLine();
  returnTop();
  spMenu();
  bannerSlider();
  imgReplace();
  scrollAnchor();
  localNav();
  createNewsList();
});

$(window).on('resize', function() {
  if(!spWidth()) {
    imgReplace();
  }
  heightLine();
  textLine();
});

$(window).on('popstate', function() {
  showPage();
  paginationShift();
});

function spWidth(){
  return window.matchMedia('screen and (max-width:450px)').matches;
}
function middleWidth() {
  return window.matchMedia('screen and (max-width:640px)').matches;
}
function tabWidth(){
  return window.matchMedia('screen and (max-width:870px)').matches;
}