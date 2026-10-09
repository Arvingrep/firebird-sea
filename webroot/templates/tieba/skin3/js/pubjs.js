$(function(){

	//广告图
	if($('.slideBox1').length>0){
	   $(".slideBox1").slide({titCell:".hd ul",mainCell:".bd .slideobj",effect:"leftLoop",autoPlay:true,autoPage:"<li></li>",prevCell:".prev",nextCell:".next"});
    }

	//生成二维码
	$("#qrcode,.qrcode").qrcode({
		render: window.applicationCache ? "canvas" : "table",
		width: 74,
		height: 74,
		text: huoniao.toUtf8(window.location.href)
	});

	//导航栏点击
	$('.nav li').click(function(){
		$(this).addClass('onnav').siblings('li').removeClass('onnav')
	});
	//搜索框切换
	$('.label-box span').click(function(){
		$(this).addClass('onlabel').siblings().removeClass('onlabel');
		console.log($(this).index());
		if($(this).index()==1){
			$("#keywords").attr("name","username");
		}
		//切换时可能会把值传给隐藏域
	});

	//用户关注
	$(".follow").delegate("button","click",function(e){
		e.preventDefault();
		var userid = $.cookie(cookiePre+"login_user");
	    if(userid == null || userid == ""){
	      location.href = masterDomain + '/login.html';
	      return false;
	    }

		var t=$(this),type=t.parent('.follow').hasClass('concerned-btn') ? "del" : "add";
		var uid = $(this).parent('.follow').attr('data-uid');
		$.post("/include/ajax.php?service=member&action=followMember&id="+uid, function(){
	    	if(type=="del"){
				t.parent('.follow').removeClass('concerned-btn').addClass('concern-btn');
				t.html('关注');
			}else{
				t.parent('.follow').removeClass('concern-btn').addClass('concerned-btn');
				t.html('已关注');
			}
	    });
	});



	$('.top-icon').click(function(){
		$("html,body").animate({scrollTop:0},500);
	});
	//查看图片
	$('body').delegate('.pics-box li','click',function(){
    	$(this).addClass('onImg').siblings('li').removeClass('onImg')
    	$(this).parents('.pics-news').find('.pic_big li').eq($(this).index()).show().siblings('li').hide();
    	var len = $(this).parents('.pics-news').find('.pics-box li').length;
//  	$(this).parents('.pics-news').find('.pic_big i').css('display','block');
		if($(this).index()==0){
			$(this).parents('.pics-news').find('.pic_big .right').css('display','block').siblings('i').css('display','none');
		}else if($(this).index()==len-1){
			$(this).parents('.pics-news').find('.pic_big .left').css('display','block').siblings('i').css('display','none');

		}else{
			$(this).parents('.pics-news').find('.pic_big i').css('display','block');
		}
    });
    $('body').delegate('.pic_big li img','click',function(){
		$(this).parents('.pic_big').find('i').css('display','none');
    	$(this).parents('.pic_big li').hide();

    });
    //查看前一张
    $('body').delegate('.pic_big .left','click',function(){
    	var index =$(this).parents('.pics-news').find('.pics-box li.onImg').index();
    	var parent = $(this).parents('.pic_big');
    	var len = $(this).parents('.pics-news').find('.pics-box li').length;
    	if(index>1){
    		parent.find('li').eq(index-1).show().siblings('li').hide();
    		$(this).parents('.pics-news').find('.pics-box li').eq(index-1).addClass('onImg').siblings('li').removeClass('onImg');
    	}else{
    		parent.find('li').eq(0).show().siblings('li').hide();
    		$(this).hide()
    		$(this).parents('.pics-news').find('.pics-box li').eq(0).addClass('onImg').siblings('li').removeClass('onImg')
    	}
    	$(this).siblings('i.right').show();
    });
     //查看后一张
	 $('body').delegate('.pic_big .right','click',function(){
    	var index =$(this).parents('.pics-news').find('.pics-box li.onImg').index();
    	var len = $(this).parents('.pics-news').find('.pics-box li').length;
    	var parent = $(this).parents('.pic_big');
//  	alert(len)

		if(index<len-2){
			parent.find('li').eq(index+1).show().siblings('li').hide();
			$(this).parents('.pics-news').find('.pics-box li').eq(index+1).addClass('onImg').siblings('li').removeClass('onImg');
		}else if(index==len-2){
			$(this).hide();
			parent.find('li').eq(index+1).show().siblings('li').hide();
			$(this).parents('.pics-news').find('.pics-box li').eq(index+1).addClass('onImg').siblings('li').removeClass('onImg');
		}
		$(this).siblings('i.left').show();
    });

	//更新验证码
	var verifycode = $("#verifycode").attr("src");
	$("#verifycode").bind("click", function(){
		$(this).attr("src", verifycode+"?v="+Math.random());
	});

	//文本框
	 var ue
	 var userid = $.cookie(cookiePre+"login_user");
		if(userid && $(".editor").length > 0){
        ue = UE.getEditor("container", {toolbars: [['source', '|', 'fullscreen', 'undo', 'redo', '|', 'fontfamily', 'fontsize', '|', 'forecolor', 'bold', 'italic', 'underline', '|', 'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|', 'insertorderedlist', 'insertunorderedlist', '|','simpleupload', 'insertimage', '|', 'link', 'unlink','emotion']], initialStyle:'p{line-height:1.5em; font-size:13px; font-family:microsoft yahei;}'});
    }
//	 var ue = UE.getEditor('container');

	$('.editor .sub_btn ').off('click').on('click',function(){
//	$('.editor .sub_btn').click(function(){
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			huoniao.login();
			return false;
		}
		var t = $(this), type = $(".editor").data("type"), typeid = $(".editor").data("typeid");
//		console.log(typeid)
		if(t.hasClass("disabled")) return false;
		if(type != "detail"){
            var cityid = $(".citychose:first").val();
              if(!cityid){
                  alert("请选择城市！");
                  return false;
              }
         }

            //首页
            if(type == "index"){

                var typeid = $(".editor-label").find(".typechose:last").val();

               if(!typeid){
                    alert("请选择分类");
                    return false;
                }

            }

            if(type == "index" || type == "list"){
                var title = $(".editor-title input").val();
                if($.trim(title) == ""){
                    alert("请填写标题！");
                    return false;
                }
            }

            ue.sync();
            if(!ue.hasContents()){
    			alert("请填写内容！");
                return false;
    		}
            var content = ue.getContent();

            var pubCode = $("#pubCode").val();
            if(pubCode == ""){
                alert("请填写验证码！");
                return false;
            }

            t.addClass("disabled");
            if(type == "index" || type == "list"){
                $.ajax({
    				url: "/include/ajax.php?service=tieba&action=sendPublish",
                    data: "vdimgck="+pubCode+"&typeid="+typeid+"&cityid="+cityid+"&title="+encodeURIComponent(title)+"&content="+encodeURIComponent(content),
    				type: "POST",
    				dataType: "json",
    				success: function (data) {
    					if(data && data.state == 100){

    						fabuPay.check(data, document.URL, t);

    					}else{
    						alert(data.info);
                            $("#verifycode").click();
    						t.removeClass("disabled");
    					}
    				},
    				error: function(){
    					alert("网络错误，发表失败，请稍候重试！");
                        $("#verifycode").click();
    					t.removeClass("disabled");
    				}
    			});
            }else{
                $.ajax({
    				url: "/include/ajax.php?service=member&action=sendComment&check=1&type=tieba-detail&aid="+id,
                    data: "vdimgck="+pubCode+"&content="+encodeURIComponent(content),
    				type: "POST",
    				dataType: "json",
    				success: function (data) {
    					if(data && data.state == 100){

                            if(data.info.ischeck == 1){
                                alert("发表成功！");
                                location.reload();
                            }else{
                                alert("发表成功，请等待管理员审核！");
                            }
                            ue.setContent("");
                            $("#pubCode").val('');

    					}else{
    						alert(data.info);
//  						console.log(data.info)
                            $("#verifycode").click();
    						t.removeClass("disabled");
    					}
    				},
    				error: function(){
    					alert("网络错误，发表失败，请稍候重试！");
                        $("#verifycode").click();
    					t.removeClass("disabled");
    				}
    			});
            }


	})



	//图片铺满整个div
//	var h = $('.pic-box').height();
//	var h1 = $('.pics-box li').height();
	$(' .pics-box li a').each(function(){
		var img_h = $(this).find('img').height();
		var img_w = $(this).find('img').width();
		if(img_h<=img_w){
			$(this).find('img').css({'height':'100%','width':'auto'})
		}else{
			$(this).find('img').css({'width':'100%','height':'auto'})
		}
	});

    $(' .pic-box').each(function(){
		var img_h = $(this).find('img').height();
		var img_w = $(this).find('img').width();
		if(img_h<=img_w){
			$(this).find('img').css({'height':'100%','width':'auto'})
		}else{
			$(this).find('img').css({'width':'100%','height':'auto'})
		}
	});
	$('.activist-list li a .lImg').each(function(){
		var img_h = $(this).find('img').height();
		var img_w = $(this).find('img').width();
		if(img_h<=img_w){
			$(this).find('img').css({'height':'100%','width':'auto'})
		}else{
			$(this).find('img').css({'width':'100%','height':'auto'})
		}
	});
	$('.city-activity li ').each(function(){
		var img_h = $(this).find('img').height();
		var img_w = $(this).find('img').width();
		if(img_h<=img_w){
			$(this).find('img').css({'height':'100%','width':'auto'})
		}else{
			$(this).find('img').css({'width':'100%','height':'auto'})
		}
	});

	//左侧浮动导航定位
	 $(document).scroll(function(){
    	var top =  $('.left-content').offset().top;
    	var left =  $('.left-content').offset().left;
    	if($(document).scrollTop()>top){
//  		console.log($('.left-content').offset().top)
    		$('.fudong-nav').css({'left':left-124,'position':'fixed','z-index':'12'})
    	}else{
    		$('.fudong-nav').css({'left':'-124px','position':'absolute','z-index':'12'})
    	}

    });

    //左侧浮动导航栏二级导航定位

     $('.fudong-nav>li').hover(function(){
    	var nav_H = $('.fudong-nav').height();
    	var nav_second = $(this).find('.secondnac-box');
    	var li_top =  $(this).offset().top;
    	var ul_top =  $(this).parents('.fudong-nav').offset().top;
    	if(nav_second.find('li').length==0){
    		nav_second.remove()
    	}
    	if(nav_second.height()>nav_H){
    		nav_second.css('top','0');
    		$(this).css('position','static')
    	}else if(li_top<nav_second.height()){
    		nav_second.css('top','0');
    		$(this).css('position','relative')

    	}else if(li_top>nav_second.height()){
  			console.log()
    		nav_second.css('bottom',-.5*(nav_second.height()));
    		$(this).css('position','relative')
    	}

    },function(){});



	//分享功能
	$("html").delegate(".sharebtn", "mouseenter", function(){
		var t = $(this), title = t.attr("data-title"), url = t.attr("data-url"), pic = t.attr("data-pic"), site = encodeURIComponent(document.title);
		title = title == undefined ? "" : encodeURIComponent(title);
		url   = url   == undefined ? "" : encodeURIComponent(url);
		pic   = pic   == undefined ? "" : encodeURIComponent(pic);
		if(title != "" || url != "" || pic != ""){
			$("#shareBtn").remove();
			var offset = t.offset(),
					left   = offset.left - 42 + "px",
					top    = offset.top + 20 + "px",
					shareHtml = [];
			shareHtml.push('<s></s>');
			shareHtml.push('<ul>');
            shareHtml.push('<li class="popup_weixin"><a href="javascript:;" class="weixina" data-url="'+url+'">微信</a></li>');
            shareHtml.push('<li class="qzone"><a href="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url='+url+'&desc='+title+'&pics='+pic+'" target="_blank" class="sharea">QQ空间</a></li>');
            shareHtml.push('<li class="qq"><a href="http://connect.qq.com/widget/shareqq/index.html?url='+url+'&desc='+title+'&title='+title+'&summary='+site+'&pics='+pic+'" target="_blank" class="sharea">QQ好友</a></li>');
            shareHtml.push('<li class="sina"><a href="http://service.weibo.com/share/share.php?url='+url+'&title='+title+'&pic='+pic+'" target="_blank"  class="sharea">新浪微博</a></li>');
            shareHtml.push('</ul>');

			$("<div>")
				.attr("id", "shareBtn")
				.css({"left": left, "top": top})
				.html(shareHtml.join(""))
				.mouseover(function(){
					$(this).show();
					return false;
				})
				.mouseout(function(){
					$(this).hide();
				})
				.appendTo("body");
		}
	});




//单点登录执行脚本
function ssoLogin(info){

	$("#navLoginBefore, #navLoginAfter").remove();

	//已登录
	if(info){
		$(".loginbox").prepend('<div class="loginafter fn-clear" id="navLoginBefore"><span class="fn-left">欢迎您回来，</span><a href="'+info['userDomain']+'" target="_blank">'+info['nickname']+'</a><a href="'+masterDomain+'/logout.html" class="logout">退出</a></div>');
		$.cookie(cookiePre+'login_user', info['uid'], {expires: 365, domain: channelDomain.replace("http://", ""), path: '/'});

	//未登录
	}else{
		$(".loginbox").prepend('<div class="loginbefore fn-clear" id="navLoginAfter"><a href="'+masterDomain+'/register.html" class="regist">免费注册</a><span class="logint"><a href="'+masterDomain+'/login.html">请登录</a></span><a class="loginconnect" href="'+masterDomain+'/api/login.php?type=qq" target="_blank"><i class="picon picon-qq"></i>QQ登陆</a><a class="loginconnect" href="'+masterDomain+'/api/login.php?type=wechat" target="_blank"><i class="picon picon-weixin"></i>微信登陆</a><a class="loginconnect" href="'+masterDomain+'/api/login.php?type=sina" target="_blank"><i class="picon picon-weibo"></i>新浪登陆</a></div>');
		$.cookie(cookiePre+'login_user', null, {expires: -10, domain: channelDomain.replace("http://", ""), path: '/'});

	}

}
	//首页、列表页面
	$.ajax({
		"url": "/include/ajax.php?service=tieba&action=tlist&orderby=click&pageSize=5&ispic=" + (typeof ispic != 'undefined' ? ispic : ''),
		"dataType": "jsonp",
		"success": function(data){
			if(data.state==100){
				var html = [], list = data.info.list;
				for(var i = 0; i < list.length; i++){
					if(i==0){
						html.push('<dt><a href="'+list[i].url+'" class="topic-tit" target="_blank">'+list[i].title+'</a></dt>');
					}else{
						html.push('<dd><a href="'+list[i].url+'" class="topic-tit" target="_blank"><p><i>●</i>'+list[i].title+'</p><span class="topic-num">['+list[i].typename[0]+']</span></a></dd>');
					}
				}
				$(".news-part1 dl").html(html.join(""));
			}else{
				$('.news-part1').hide();
			}
		}
	});

	//帖子数量、签到人数、注册会员
	$.ajax({
		"url": "/include/ajax.php?service=tieba&action=getFormat",
		"dataType": "jsonp",
		"success": function(data){
			if(data.state==100){
				$('#qiandaonum').html(data.info.qiandaoTotal);
				$('#todaynum').html(data.info.tiziTodayTotal);
				$('#tiezinum').html(data.info.tiziTotal);
				$('#membernum').html(data.info.memberTotal);
			}
		}
	});

})
