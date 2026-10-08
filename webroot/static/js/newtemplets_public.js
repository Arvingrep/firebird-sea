$(function(){
	// 搜索
	$('.type dd a').click(function(){
		$('.type dt em').text($(this).text());
		$('.search .type dl dd').hide();
	})
	$('.search1 .type dl').hover(function(){
		var x = $(this);
		x.find('dd').show();
	},function(){
		var x = $(this);
		x.find('dd').hide();
	})

	// 幻灯片
	$('.flash ').slide({mainCell:".bd", titCell:".hd ul", autoPlay:true, autoPage:"<li><a></a></li>",effect:"fold"});

	// 贴吧点赞效果
	$("#EXhand_List").delegate('.zan','click',function(){
		var x = $(this);
		var praise_img = $(".EF_right span i");
		var text_box = x.closest('.EF_right').find('.add-num');
		var praise_txt = x.closest('.EF_right').find('.zan em');
		var num=parseInt(praise_txt.text());
		if(x.hasClass('zan_bc')){
			x.removeClass('zan_bc');
			text_box.show().html("<em class='add-animation'>-1</em>");
			$(".add-animation").removeClass("hover");
			num -=1;
			praise_txt.text(num)
		}else{
			x.addClass('zan_bc');
			text_box.show().html("<em class='add-animation'>+1</em>");
			$(".add-animation").addClass("hover");
			num +=1;
			praise_txt.text(num)
		}
	});

	// 资讯页面点赞
	$("#NewList32").delegate('.zan','click',function(){
		var x = $(this);
		if (x.hasClass('zan_bc')) {
			x.removeClass('zan_bc')
		}else{
			x.addClass('zan_bc')
		}
	})

	// 资讯页面hover发布信息便民工具遮罩层
	$('.fabu').hover(function(){
		$('.tool_bc').show();
	},function(){
		$('.tool_bc').hide();
	})

	// 资讯页面关注
	$('.vip_club ul li p').click(function(){
		var x = $(this), id = x.attr('data-id');
		if(x.hasClass('disabled')) return;
		var userid = $.cookie(cookiePre+'login_user');
		if (userid == undefined || userid == '' || userid == 0) {
			location.href = '/login.html';
			return;
		}
		
		$.post('/include/ajax.php?service=member&action=followMember&id='+id, function(){
			if(x.hasClass('guanzhu')){
				x.removeClass('guanzhu').text(langData['siteConfig'][19][846]);//关注
			}else{
				x.addClass('guanzhu').text(langData['siteConfig'][19][845]);//已关注
			}
		})
	})

	$('.attention').click(function(){
		$(this).remove();
	})

	// 二手信息点击显示全文
	$('.all').click(function(){
		var x =$(this).closest('.EL_detail').find('.Summarize');
		if (x.hasClass('height')) {
			x.removeClass('height');
			$(this).text(langData['siteConfig'][38][7]);//全文
		}else{
			x.addClass('height');
			$(this).text(langData['siteConfig'][22][8]);//收起
		}
	})

})


//单点登录执行脚本
// function ssoLogin(info){

// 	$("#navLoginBefore, #navLoginAfter").remove();

// 	//已登录
// 	if(info){
// 		$(".loginbox").prepend('<div class="loginafter fn-clear" id="navLoginAfter"><span class="fn-left">欢迎您回来，</span><a href="'+info['userDomain']+'" target="_blank">'+info['nickname']+'</a><a href="'+masterDomain+'/logout.html" class="logout">退出</a></div>');

// 		$.cookie(cookiePre+'login_user', info['uid'], {expires: 365, domain: channelDomain.replace("http://", ""), path: '/'});

// 	//未登录
// 	}else{
// 		$(".loginbox").prepend('<div class="loginbefore fn-clear" id="navLoginBefore"><a href="'+masterDomain+'/register.html" class="regist">免费注册</a><span class="logint"><a href="'+masterDomain+'/login.html">请登录</a></span><a class="loginconnect" href="'+masterDomain+'/api/login.php?type=qq" target="_blank"><i class="picon picon-qq"></i>QQ登陆</a><a  class="loginconnect"href="'+masterDomain+'/api/login.php?type=wechat" target="_blank"><i class="picon picon-weixin"></i>微信登陆</a><a class="loginconnect" href="'+masterDomain+'/api/login.php?type=sina" target="_blank"><i class="picon picon-weibo"></i>新浪登陆</a></div>');

// 		$.cookie(cookiePre+'login_user', null, {expires: -10, domain: channelDomain.replace("http://", ""), path: '/'});

// 	}

// }
