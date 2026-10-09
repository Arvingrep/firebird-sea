$(function(){

  $(".list-box .level2 i").bind("click", function(){
    var t = $(this), level2 = t.closest(".level2"), level3 = level2.next(".level3-box");
    if(level3.size() > 0){
      if(level2.hasClass("selected")){
        level3.stop().slideUp(150);
        level2.removeClass("selected");
      }else{
        level3.stop().slideDown(150);
        level2.addClass("selected");
      }
    }
  });

  $(".level3").each(function(){
    var t = $(this);
    if(t.hasClass("curr")){
      var box = t.closest(".level3-box");
      box.show();
      box.prev(".level2").addClass("selected");
    }
  });


  // 分享
	var staticPath = (u=window.staticPath||window.cfg_staticPath)?u:((window.masterDomain?window.masterDomain:document.location.origin)+'/static/');
  var shareApiUrl = staticPath.indexOf('https://')>-1?staticPath+'api/baidu_share/js/share.js':'http://bdimg.share.baidu.com/static/api/js/share.js?v=89860593.js?cdnversion='+~(-new Date()/36e5);
  window._bd_share_config={"common":{"bdSnsKey":{},"bdText":"","bdMini":"2","bdMiniList":false,"bdPic":"","bdStyle":"1","bdSize":"16"},"share":{"bdSize":0}};with(document)0[(getElementsByTagName('head')[0]||body).appendChild(createElement('script')).src=shareApiUrl];

});
