var shareflag=1  //设置长按标识符
var sharetimeOutEvent=0;
  //长按执行的方法
function slongPressPoster(){
    var imgsrc = $(".official_img").find('img').attr('src');
    if(imgsrc==''||imgsrc==undefined){
        alert(langData['siteConfig'][44][94]);//下载失败，请重试
        return 0
    }
    shareflag=0;
    utils.setStorage("huoniao_poster", imgsrc);
    setupWebViewJavascriptBridge(function(bridge) {
        bridge.callHandler(
            'saveImage',
            {'value': 'huoniao_poster'},
            function(responseData){
                if(responseData == "success"){
                    setTimeout(function(){
                        shareflag=1;
                    }, 200)
                }
            }
        );
    });
}
function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays*24*60*60*1000));
	var expires = "expires="+d.toUTCString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
}

$(function(){


	var is_staffsuccess = $.cookie(cookiePre+'is_staffsuccess');
	var storetitle 	    = $.cookie(cookiePre+'storetitle');
	if(is_staffsuccess == 1){
		$('.bindAccBox,.manage-mask').addClass('show');
		$('#storetitle').text(storetitle);

		var channelDomainClean = typeof channelDomain != 'undefined' ? channelDomain.replace("http://", "").replace("https://", "") : window.location.host;
		var channelDomain_1 = channelDomainClean.split('.');
		var channelDomain_1_ = channelDomainClean.replace(channelDomain_1[0]+".", "");

		channelDomain_ = channelDomainClean.split("/")[0];
		channelDomain_1_ = channelDomain_1_.split("/")[0];

		$.cookie(cookiePre + 'is_staffsuccess', null, {domain: channelDomainClean, path: '/'});
		$.cookie(cookiePre + 'is_staffsuccess', null, {domain: channelDomain_1_, path: '/'});
		$.cookie(cookiePre + 'is_staffsuccess', null, {path: '/', domain: '.' + channelDomainClean});

		$.cookie(cookiePre + 'storetitle', null, {domain: channelDomainClean, path: '/'});
		$.cookie(cookiePre + 'storetitle', null, {domain: channelDomain_1_, path: '/'});
		$.cookie(cookiePre + 'storetitle', null, {path: '/', domain: '.' + channelDomainClean});

	}

	if($('.orderBusi').size() > 0){
        $.ajax({
          url: '/include/ajax.php?service=member&action=storeOrderList&page=1&pageSize=1',
          type: 'get',
          dataType: 'json',
          success: function(data){
            if(data && data.state == 100){
              var list = data.info;
              var pageInfo = list.pageInfo;
              
			  if(pageInfo.unused > 0 || pageInfo.refund > 0 ){
				$(".orderBusi .orderDot").addClass('showDot')
			  }else{
				$(".orderBusi .orderDot").removeClass('showDot')
			  }
            }
          },
          error: function(){

          }
        })
    }



	$('.bindAccBox .btn_close, .bindAccBox .close_pop').click(function () {
		$('.bindAccBox,.manage-mask').removeClass('show');
	})

	var userid = $.cookie(cookiePre + "login_user");
	//客户端发帖
	setupWebViewJavascriptBridge(function(bridge) {
		$(".fabuTieba").bind("click", function(event){
			if (device.indexOf('huoniao_Android') > -1) {
				event.preventDefault();
				var userid = $.cookie(cookiePre+"login_user");
				if(userid == null || userid == ""){
					location.href = masterDomain + "/login.html";
					return false;
				}
				bridge.callHandler("postTieba", {}, function(responseData) {});
			}
		});
	});

    //获取待处理订单
    if(userid != null && userid != "" && $('.order_box').size() > 0){

        $.ajax({
            url: '/include/ajax.php?service=member&action=getModuleOrderCount&need_data=daifukuan,daixiaofei,daifahuo,daishouhuo,daipingjia' ,
            type: 'post',
            dataType: 'json',
            success: function(data){
              if(data.state==100){
                var daifukuan = data.info.daifukuan;
                var daixiaofei = data.info.daixiaofei;
                var daifahuo = data.info.daifahuo;
                var daishouhuo = data.info.daishouhuo;
                var daipingjia = data.info.daipingjia;
                if(daifukuan > 0){
                    $('.order1').append('<s>'+daifukuan+'</s>');
                }
                if(daixiaofei > 0){
                    $('.order2').append('<s>'+daixiaofei+'</s>');
                }
                if(daifahuo > 0){
                    $('.order3').append('<s>'+daifahuo+'</s>');
                }
                if(daishouhuo > 0){
                    $('.order4').append('<s>'+daishouhuo+'</s>');
                }
                if(daipingjia > 0){
                    $('.order5').append('<s>'+daipingjia+'</s>');
                }
              }
            }
        })

    }

	//关注微信公众号
	$('.official_account').click(function(){
		$('.official_mask,.official_alert').addClass('showGzh');
	})

    if(!$.cookie('showGzhTips')){
        $('.showGzh_').addClass('showGzh');
    }

	//关闭弹出公众号
	$('.official_alert .closeOfficial,.official_mask').click(function(){
		$('.official_mask,.official_alert').removeClass('showGzh');
        $.cookie('showGzhTips', 1, {expires: 1});
	})

	//app端保存公众号图片
	 $(".official_img.wechatGzun").on({
        touchstart: function(e){
            if(shareflag){
                clearTimeout(sharetimeOutEvent);
                sharetimeOutEvent = setTimeout("slongPressPoster()",800);
            }
            // e.preventDefault();
        },
        touchmove:function () {
            clearTimeout(sharetimeOutEvent);
            sharetimeOutEvent = 0;
        },
        touchend:function () {
            shareflag = 1;
        }

    });

  //获取券数目
  if (userid != null && userid != "") {
    getQuan();
  }
  function getQuan(){
    var total = 0
    $.ajax({
      url: '/include/ajax.php?service=member&action=userQuanList&gettype=1',
      type: 'post',
      dataType: 'json',
      success: function(data){
        if(data.state==100){
          total = data.info.pageInfo.totalCount1 + data.info.pageInfo.totalCount2;
          $(".acc_box .quan_count h3").html(total)
        }else{
          $(".acc_box .quan_count h3").html(total)
        }
      },
      error:function(data){
         $(".acc_box .quan_count h3").html(total)
      }
    })
  }




	$('.card_box').delegate('.manage_card','click',function(){
	  $('.manage-mask').addClass('show');
	  $('.manage-alert').animate({"bottom":'0'},200);
	  $('html').addClass('noscroll');
	});
	$('.ruzhu').on('click',function(){
	  $('.manage-mask').addClass('show');
	  $('.manage-alert').animate({"bottom":'0'},200);
	  $('html').addClass('noscroll');
	});
	//关闭 管理卡片
	$(".close_alert,.manage-mask").bind("click", function(){
	  $('.manage-mask').removeClass('show');
	  $('.manage-alert').animate({"bottom":'-200%'},200);
	  $('html').removeClass('noscroll');
	});
	 $('.has-add').delegate('i','click',function(){
	    var par = $(this).parent('li')
	    var hasId = par.attr('type-id');
	    var hasTitle = par.find('span').text();
	    par.remove();//移除自身父元素
	    //添加到其他管理中
	    $('.no-add ul').prepend("<li type-id='"+hasId+"'><i></i><span>"+hasTitle+"</span></li>")
	  })

	    //2.添加新模块
	  $('.no-add').delegate('i','click',function(){
	    var par = $(this).parent('li')
	    var noId = par.attr('type-id');
	    var noTitle = par.find('span').text();
	    par.remove();//移除自身父元素
	    //添加到其他管理中
	    $('.has-add ul').append("<li type-id='"+noId+"'><i></i><span>"+noTitle+"</span><s class='sort-down'></s><s class='sort-up'></s></li>")
	});
	   //3.已有模块上移
	  $('.has-add').delegate('.sort-up','click',function(){
	    if($(this).hasClass('disabled')) return false;
	    var par = $(this).parent('li');
		$('.sort-up').addClass('disabled')
	    if(par.prev().size()>0){
	      par.addClass('slide-top');
	      par.prev().addClass('slide-bottom');
	      setTimeout(function(){
	        $('.has-add li').removeClass('slide-top');
	        $('.has-add li').removeClass('slide-bottom');
	        par.prev().before(par);

	      },500)
	    }
        setTimeout(function(){
          $('.sort-up').removeClass('disabled');
        })
	  })
	    //3.已有模块下移
	  $('.has-add').delegate('.sort-down','click',function(){
	    var par = $(this).parent('li');
		if($(this).hasClass('disabled')) return false;
		$('.sort-down').addClass('disabled')
	    if(par.next().size()>0){
	      par.addClass('slide-bottom');
	      par.next().addClass('slide-top');
	      setTimeout(function(){
	        $('.has-add li').removeClass('slide-top');
	        $('.has-add li').removeClass('slide-bottom');
	        par.next().after(par);

	      },500)
	    }
        setTimeout(function(){
          $('.sort-down').removeClass('disabled');
        })
	  })


	  //管理功能卡片完成
	  $('.manage-alert').delegate('.finish','click',function(){

	    if (userid == null || userid == "") {
	      window.location.href = masterDomain + '/login.html';
	      return false;
	    }

	    var t = $(this);
	    if(t.hasClass('disabled')) return false;
	    t.addClass('disabled');
	    showMsg('保存中...', 60000, false);

	    //将已添加 未添加的id 传给接口 接口处进行排序 页面重新刷新 请求数据
	    //已添加
	    var dataHas= [];
	    $('.has-add li').each(function(){
	      var addId = $(this).attr('type-id');
	      dataHas.push(addId);
	    })

	    //未添加
	    var dataNo= [];
	    $('.no-add li').each(function(){
	      var noId = $(this).attr('type-id');
	      dataNo.push(noId);
	    })

	    //保存数据
	    $.ajax({
	        url: '/include/ajax.php',
	        data: 'service=member&action=updateUserModule&sort=' + dataHas.join(',') + '&hide=' + dataNo.join(','),
	        type: 'post',
	        dataType: 'json',
	        success: function (res) {
	            t.removeClass('disabled');
	            if(res.state == 100){

	                $('.manage-mask').removeClass('show');
	                $('.manage-alert').animate({"bottom":'-88%'},200);
	                $('html').removeClass('noscroll');

	                showMsg(langData['siteConfig'][6][39], 2000, false); //保存成功

	                setTimeout(function(){
	                    location.reload();
	                }, 1000);

	            }else{
	                showMsg(res.info, 2000, false);
	            }
	        },
	        error: function (res) {
	            t.removeClass('disabled');
	            showMsg(langData['siteConfig'][6][201], 2000, false); //网络错误，保存失败，请稍候重试！
	        }
	    })


	  })



	  var nav_click = 1;
	  $(window).scroll(function(){
		  var scroll = $(window).scrollTop();
		  var nav_top = $('.card_nav').offset().top - $(".fixedtop").height();
		  if(device.indexOf('huoniao_iOS') > -1){
               if(scroll>0){
               	  $('.fixedtop').addClass('slide-in-top').removeClass('slide-out-top');

               }else{
               	  $('.fixedtop').removeClass('slide-in-top').addClass('slide-out-top')
               }
		  }
		  if(scroll>=nav_top){
			  $('.fixedtop').addClass('show')
			  $('.fixedtop').append($('.card_nav ul'))

		  }else{
			  $('.fixedtop').removeClass('show');
			  $('.card_nav').append($('.fixedtop ul'))
		  }

		  // 内容滑动到哪,导航跟着变化
		  $(".mod_dl").each(function(){
			  var t = $(this);
			  if((t.offset().top - 50 - $(".fixedtop").height())<=scroll && nav_click){
				  $('.fixedtop li').eq(t.index()).addClass('active').siblings().removeClass('active');
				   var end = $('.active').offset().left + $('.active').width() / 2 - $('body').width() /2;
				   var star = $(".fixedtop ul").scrollLeft();
				   $('.fixedtop ul').scrollLeft(end + star);
			  }
			  if($(".manage_card").offset().top<=scroll){
				  $('.ruzhu').addClass('active');
				  $('.fixedtop li').removeClass('active');
				  var end = $('.active').offset().left + $('.active').width() / 2 - $('body').width() /2;
				  var star = $(".fixedtop ul").scrollLeft();
				  $('.fixedtop ul').scrollLeft(end + star);
			  }
		  });

	  });
	  $('.fixedtop,.card_nav').delegate('li','click',function(){
		  let t = $(this),index = t.index();
		  t.addClass('active').siblings().removeClass('active');
		  var end = $('.active').offset().left + $('.active').width() / 2 - $('body').width() /2;
		  var star = $(".fixedtop ul").scrollLeft();
		  $('.fixedtop ul').scrollLeft(end + star);
		  nav_click = 0;
		  var scTop = $('.card_content dl').eq(index).offset().top  -$(".fixedtop ").height();
		  $(window).scrollTop(scTop);
		  setTimeout(function(){
			   nav_click = 1;
		  },500)
	  });

	  //客户端登录验证
      if (device.indexOf('huoniao') > -1) {
          setupWebViewJavascriptBridge(function(bridge) {
              //未登录状态下，隔时验证是否已登录，如果已登录，则刷新页面
              var userid = $.cookie(cookiePre+"login_user");
              if(userid == null || userid == ""){
                  var timer = setInterval(function(){
                      userid = $.cookie(cookiePre+"login_user");
                      if(userid){
                          $.ajax({
                              url: '/getUserInfo.html',
                              type: "get",
                              async: false,
                              dataType: "jsonp",
                              success: function (data) {
                                  if(data){
                                      clearInterval(timer);
                                      bridge.callHandler('appLoginFinish', {'passport': data.userid, 'username': data.username, 'nickname': data.nickname, 'userid_encode': data.userid_encode, 'cookiePre': data.cookiePre, 'photo': data.photo, 'dating_uid': data.dating_uid}, function(){});
                                      bridge.callHandler('pageReload', {}, function(responseData){});
                                  }
                              }
                          });

                          // location.reload();
                      }
                  }, 500);
              }else if($('.nlogin').size() > 0){
                  location.reload();
              }
          })
      }


	  // 消息提示
	    function showMsg(msg, time, showbg){
	        var time = time ? time : 2000;
	        var sowbg = showbg !== undefined ? showbg : true;
	        $('.dialog_msg').remove();

	        var html = '<div class="dialog_msg'+(showbg ? ' dialog_top' : '')+'">';
	        html += '<div class="box">'+msg+'</div>';
	        html += sowbg ? '<div class="bg"></div>' : '';
	        html += '</div>';
	        $('body').append(html);
	        setTimeout(function(){
	            $('.dialog_msg').remove();
	        }, time)
	    }

})
