$(function(){

  //开关
  $('.manage').delegate('li input', 'click', function(){
    var t = $(this), state = t.is(':checked') ? 1 : 0, mod = $(this).closest('li').attr('data-module');

    // 没有权限开启的模块
    if(t.attr("readonly") != undefined){
      t.prop('checked', false);
      showErr('<p style="padding:10px 0;">'+langData['siteConfig'][31][92]+'<br><a href="'+upgradeUrl+'" style="margin-left:10px;color:#56ac0b;text-decoration:underline;margin-top:10px;display:block;">'+langData['siteConfig'][31][92]+'</a></p>', 2000);//您没有权限开通此模块，请升级商家类型--马上升级
      return;
    }
    $.ajax({
			url: masterDomain + '/include/ajax.php?service=business&action=updateBusinessModuleSwitch&module=' + mod + '&state=' + state,
			dataType: 'jsonp',
			success: function(data){
        if(data && data.state == 100){
        }else{
          setTimeout(function(){
            t.prop("checked", false)
            showErr(data.info, 1000);
          }, 300)
        }
      },
      error: function(){
        $(this).prop('checked', false);
        showErr(langData['siteConfig'][45][89], 1000);//网络错误
      }
    });
  });

  //错误提示
  var showErrTimer;
  function showErr(txt, time, callback){
      showErrTimer && clearTimeout(showErrTimer);
      $(".popErr").remove();
      if(txt == '' || txt == undefined) return;
      $("body").append('<div class="popErr"><div>'+txt+'</div></div>');
      $(".popErr div").css({"margin-left": -$(".popErr div").width()/2, "left": "50%"});
      $(".popErr").css({"visibility": "visible"});
      if(time){
        showErrTimer = setTimeout(function(){
            $(".popErr").fadeOut(300, function(){
                $(this).remove();
                callback && callback();
            });
        }, time);
      }
  }

});
