$(function(){
  //第三方登录
	$("body").delegate(".loginconnect", "click", function(e){
		e.preventDefault();
		var href = $(this).attr("href");
		loginWindow = window.open(href, 'oauthLogin', 'height=565, width=720, left=100, top=100, toolbar=no, menubar=no, scrollbars=no, status=no, location=yes, resizable=yes');

		//判断窗口是否关闭
		mtimer = setInterval(function(){
			if(loginWindow.closed){
				clearInterval(mtimer);
				huoniao.checkLogin(function(){
					location.reload();
				});
			}
		}, 1000);
	});
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
		$(".loginbox").prepend('<div class="loginbefore fn-clear" id="navLoginAfter"><a href="'+masterDomain+'/register.html" class="regist">免费注册</a><span class="logint"><a href="'+masterDomain+'/login.html">请登录</a></span><a class="loginconnect" href="'+masterDomain+'/api/login.php?type=qq" target="_blank"><i class="picon picon-qq"></i>QQ登陆</a><a  class="loginconnect"href="'+masterDomain+'/api/login.php?type=wechat" target="_blank"><i class="picon picon-weixin"></i>微信登陆</a><a class="loginconnect" href="'+masterDomain+'/api/login.php?type=sina" target="_blank"><i class="picon picon-weibo"></i>新浪登陆</a></div>');
		$.cookie(cookiePre+'login_user', null, {expires: -10, domain: channelDomain.replace("http://", ""), path: '/'});

	}

}
