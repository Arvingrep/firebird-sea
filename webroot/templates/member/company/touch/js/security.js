$(function(){

  //导航
  $('.header-r .screen').click(function(){
    var nav = $('.nav'), t = $('.nav').css('display') == "none";
    if (t) {nav.show();}else{nav.hide();}
  })

	//退出
	$('.logout').bind("click", function(){
		$.cookie(cookiePre+'login_user', null, {expires: -10, domain: channelDomain, path: '/'});
	});

})
