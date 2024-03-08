

$(function(){
  var body=$("body");
  var win=$(window);
  var winW=win.width();
  var winH=win.height();
  var keyW = 768;
  var scrollTop=0;
  var fix_posi = 0;

  var header = $("header");
  var nav = $("nav");
  var menuBtn = $(".menu-btn");

  var html=$("html");

  $(".size_btn").bind('click',function(){
    if ( $(this).hasClass("size_btn_s") ) {
      $.cookie("font-size", "s", { expires: 30, path: "/" });
    } else if ( $(this).hasClass("size_btn_m") ) {
      $.cookie("font-size", "m", { expires: 30, path: "/" });
    } else if ( $(this).hasClass("size_btn_l") ) {
      $.cookie("font-size", "l", { expires: 30, path: "/" });
    }
    checkSize();
  })
  function checkSize(){
    if ( $.cookie("font-size")=="s" ) {
      $(html).removeClass("size_m size_l").addClass("size_s");
      $(".size_btn").removeClass("on");
      $(".size_btn_s").addClass("on");
    } else if ( $.cookie("font-size")=="m" ) {
      $(html).removeClass("size_s size_l").addClass("size_m");
      $(".size_btn").removeClass("on");
      $(".size_btn_m").addClass("on");
    } else if ( $.cookie("font-size")=="l" ) {
      $(html).removeClass("size_s size_m").addClass("size_l");
      $(".size_btn").removeClass("on");
      $(".size_btn_l").addClass("on");
    }
  }
  checkSize();

  setNav();
  $(".start_white").addClass("hide");
  win.onpageshow = function(event) {
    setNav();
  }
  function setNav(){
    nav.addClass("notransition");
    nav.removeClass("open");
    body.removeClass("nav_open");
    menuBtn.removeClass("open");
  }
  function setNotransition(){
    nav.addClass("notransition");
  }
  $("nav a:not(.size_btn)").bind("click",function(e){
    openClose();
  })


  menuBtn.bind('click',openClose);

  if ( location.hash ) {
    var urlHash = location.hash;
    var target = $(urlHash);
    var headerH = $("header").outerHeight();
    var position = target.offset().top - headerH;
    $("html, body").scrollTop(position);
  }
  function openClose(){
    if ( menuBtn.hasClass("open") ) {
      menuBtn.removeClass("open");
      nav.removeClass("notransition");
      nav.removeClass("open");
      body.removeClass("nav_open");
    } else {
      menuBtn.addClass("open");
      nav.removeClass("notransition");
      nav.addClass("open");
      body.addClass("nav_open");
    }
  }


  resize_event();
  $(window).bind("resize", resize_event);
	$(window).bind("scroll", scroll_event);

  $('a[href^="#"]').click(function () {
    var headerH = $("header").outerHeight();
		var href = $(this).attr('href');
    var targetTop = 0;
    try{
      targetTop = $(href == '#top' ? 'html' : href).offset().top;
    }catch(e){
      targetTop=-1;
    }


		if (href != '#' && targetTop>=0 ) {
      $('html, body').stop().delay(100).animate({ scrollTop: targetTop }, 500);
      return false;
    }
	});

  $(".ac_set").each(function(){
    var set = $(this);
    $(".ac_btn",$(this)).bind("click",function(){
      set.toggleClass("open");
      checkH();
    })
  })
   function checkH(){

      $(".ac_set").each(function(){

        if ( $(this).hasClass("open")  ) {
          var h = $(".ac_inner",$(this)).outerHeight();
          $(".ac_wrap",$(this)).css({"height":h+"px"});
        } else {
          $(".ac_wrap",$(this)).attr("style","");
        }
      })
  }

  function resize_event(){
    winW=win.width();
    winH=win.height();
    winH=window.innerHeight;
    checkH();

    if (winW<=keyW) {
      fix_posi = 0;
    } else {
      fix_posi = header.outerHeight();
    }
    scroll_event();
  }

	function scroll_event(){
    scrollTop=win.scrollTop();

    if ( scrollTop >= fix_posi ) {
      if ( $("header").length<2 ) {
        var $clone = $(header).clone();
    		$clone.addClass("fixed clone");
    		$(header).after($clone);
        $('a[href^="#"]').click(function () {
          var headerH = $("header").outerHeight();
      		var href = $(this).attr('href');
          var targetTop = 0;
          try{
            targetTop = $(href == '#top' ? 'html' : href).offset().top;
          }catch(e){
            targetTop=-1;
          }


      		if (href != '#' && targetTop>=0 ) {
            $('html, body').stop().delay(100).animate({ scrollTop: targetTop }, 500);
            return false;
          }
      	});
        nav = $("nav");
        menuBtn = $(".menu-btn");
        $(".menu-btn").bind('click',openClose);
        $("nav a:not(.size_btn)").bind("click",function(e){
          openClose();
        })
        $(".size_btn").bind('click',function(){
          if ( $(this).hasClass("size_btn_s") ) {
            $.cookie("font-size", "s", { expires: 30, path: "/" });
          } else if ( $(this).hasClass("size_btn_m") ) {
            $.cookie("font-size", "m", { expires: 30, path: "/" });
          } else if ( $(this).hasClass("size_btn_l") ) {
            $.cookie("font-size", "l", { expires: 30, path: "/" });
          }
          checkSize();
        })
      }
    } else {
      $("header.clone").remove();
    }
	}






  $('.yogo').click(function(){
    window.location.href = "../glossary.html" + "?" + this.id
  })

  $('.pop_link').click(function(){
    if(winW >= keyW){
      if($(this).hasClass("s4_beshi") == true){
        window.open('seminar04/beshi.html',null,'top=100,left=100,width=960')
      }
      else if($(this).hasClass("s5_beshi") == true){
        window.open('seminar05/beshi.html',null,'top=100,left=100,width=960')
      }
      else{
        window.open('beshi.html',null,'top=100,left=100,width=960')
      }
    }else{
      if($(this).hasClass("s4_beshi") == true){
        window.open('seminar04/beshi.html')
      }
      else if($(this).hasClass("s5_beshi") == true){
        window.open('seminar05/beshi.html')
      }
      else{
        window.open('beshi.html')
      }
    }

  })

})