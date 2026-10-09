$(function(){
	//放大图片
    $.fn.bigImage({
        artMainCon:".artMainBody",  //图片所在的列表标签
    });
    $('img').scrollLoading();

    // 关注
    $('.btn_care').click(function() {
      var userid = $.cookie(cookiePre+"login_user");
      if(userid == null || userid == ""){
        window.location.href = masterDomain+'/login.html';
        return false;
      }
      var t=$(this),type=t.hasClass('cared') ? "del" : "add";
    
      if(type=="del"){
        t.removeClass('cared');
        t.html('<s></s>'+langData['travel'][6][11]);   //关注
      }else{
        t.addClass('cared');
        t.html('<s></s>'+langData['travel'][6][12]);  //已关注
      }

      var mediaid = t.attr("data-id");

      $.post("/include/ajax.php?service=member&action=followMember&for=media&id="+mediaid);

    });

    // 赞
    $('.btnUp').on('click',function(){
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
          window.location.href = masterDomain+'/login.html';
          return false;
        }
        
        var t = $(this), id = t.attr("data-id");
        // if(t.hasClass("active")) return false;
        var num = t.find('em').html();
        if( typeof(num) == 'object') {
          num = 0;
        }
        var type = 'add';
        if(t.hasClass("active")){
            type = 'del';
            num--;
        }else{
            num++;
        }

        $.ajax({
          url: '/include/ajax.php?service=member&action=dingComment&id=' + id + "&type=" + type,
          type: "GET",
          dataType: "json",
          success: function (data) {
            if(data.state==100){
              if(t.hasClass("active")){
                  t.removeClass('active');
              }else{
                  t.addClass('active');
              }
              t.find('em').html(num);
            }else{
                alert(data.info);
                t.removeClass('active');
            }
          }
        });
    })

  



    

  	

  

    // 返回顶部
    var windowTop=0;
    $(window).on("scroll", function(){
    	
        var scrolls = $(window).scrollTop();//获取当前可视区域距离页面顶端的距离
        if(scrolls>=windowTop){//当B>A时，表示页面在向上滑动
            //需要执行的操作
            windowTop=scrolls;
            $('.nfooter').hide();

        }else{//当B<a 表示手势往下滑动
            //需要执行的操作
            windowTop=scrolls;
            $('.nfooter').show();
        }
    });

})



//单点登录执行脚本
function ssoLogin(info){


	//已登录
	if(info){
    $(".nav .login").html('<img onerror="javascript:this.src=\'/static/images/noPhoto_40.jpg\';"src="'+info['photo']+'">').removeClass().addClass("user");
    $(".user_info .fl a").html('<img onerror="javascript:this.src=\'/static/images/noPhoto_40.jpg\';"src="'+info['photo']+'">'+info['nickname']);

    $.cookie(cookiePre+'login_user', info['uid'], {expires: 365, domain: channelDomain.replace("http://", ""), path: '/'});

	//未登录
	}else{
    $(".nav .user").html('').removeClass().addClass("login");
    $.cookie(cookiePre+'login_user', null, {expires: -10, domain: channelDomain.replace("http://", ""), path: '/'});
	}

}