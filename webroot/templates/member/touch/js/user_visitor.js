$(function(){
  var objId = $('.list');

  // 关注按钮
  $('body').off("click").delegate('.nofollow', 'click', function(){
    var x = $(this);
    if (x.hasClass('follow')) {
			$('.mask_pop').fadeIn();
			$('.pop_box').animate({"bottom":0},200);
			$(".pop_box .sure_btn").off("click").click(function(){
				  follow(x, function(){
				  	x.removeClass('follow').text(langData['siteConfig'][19][846]);  //关注
				  });
				  $('.mask_pop').fadeOut();
				  $('.pop_box').animate({"bottom":'-4.2rem'},200);
			})
    }else{
			follow(x, function(){
				x.addClass('follow').text(langData['siteConfig'][19][845]);  //已关注
			});
    }
  });
  
  $(".pop_box .cancel_btn,.mask_pop").click(function(){
	  $('.mask_pop').fadeOut();
	  $('.pop_box').animate({"bottom":'-4.2rem'},200);
  });
  

  var follow = function(t, func){
    var userid = $.cookie(cookiePre+"login_user");
    if(userid == null || userid == ""){
      location.href = masterDomain + '/login.html';
      return false;
    }

    if(t.hasClass("disabled")) return false;
    t.addClass("disabled");
    $.post("/include/ajax.php?service=member&action=followMember&id="+t.attr("data-id"), function(){
      t.removeClass("disabled");
      func();
    });
  }

    // 下拉加载
    var isload = false;
    $(window).scroll(function() {
        var h = $('.item').height();
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w - h;
        if ($(window).scrollTop() > scroll && !isload) {
            atpage++;
            getList();
        };
    });


  getList();

  function getList(is){
    isload = true;
  	if(is != 1){
  		// $('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
  	}

  	objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');

  	$.ajax({
  		url: masterDomain+"/include/ajax.php?service=member&action=visitor&uid="+uid+"&page="+atpage+"&pageSize="+pageSize,
  		type: "GET",
  		dataType: "jsonp",
  		success: function (data) {
  			if(data && data.state != 200){
  				if(data.state == 101){
  					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
  				}else{
  					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

            var msg = pageInfo.totalCount == 0 ? langData['siteConfig'][20][126] : langData['siteConfig'][20][185];

  					//拼接列表
  					if(list.length > 0){
  						for(var i = 0; i < list.length; i++){
  							var isfollow = list[i].isfollow, state = list[i].state, uid = list[i].uid,
                    url = state == 1 ? 'javascript:;' : masterDomain + '/user/' + uid;


  							html.push('<div class="item fn-clear">');
  							html.push('<a href="'+url+'" class="imgbox fn-left"><img src="'+list[i].photo+'" alt="" onerror="javascript:this.src=\''+masterDomain+'/static/images/noPhoto_100.jpg\';" /></a>');

                if (!state) {
    							html.push('<div class="fn-left txtbox">');
    							html.push('<p class="nickname"><a href="'+url+'">'+list[i].nickname+'</a></p><p class="gray"></p><p class="fans_num gray">'+list[i].date+'</p>');
    							html.push('</div>');

                  if (isfollow) {
                    html.push('<div class="fn-right"><a href="javascript:;" class="nofollow follow " data-id="'+uid+'">'+langData['siteConfig'][19][845]+'</a></div>');  //相互关注
                  }else {
                    html.push('<div class="fn-right"><a href="javascript:;" class="nofollow" data-id="'+uid+'">'+langData['siteConfig'][19][846]+'</a></div>');
                  }
                }else {
                  html.push('<div class="fn-left txtbox">'+langData['siteConfig'][19][850]+'</div>')
                }
  							html.push('</div>');

  						}

              objId.append(html.join(""));
              $('.loading').remove();
              isload = false;

  					}else{
              $('.loading').remove();
  						objId.append("<p class='loading'>"+msg+"</p>");
  					}

  				}
  			}else{
  				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");  //暂无相关信息
  			}
  		}
  	});
  }




})
