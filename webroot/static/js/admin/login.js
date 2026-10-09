$(function(){
	//判断是否为顶级窗体
	if(self.location != top.location){
		parent.location.href = self.location;
	}

	$("#username").focus();

	$("#loginForm input").bind("input", function(){
		$(this).parent().removeClass("error");
	});

	$('#password').togglePassword({
		el: '#togglePassword',
		at: 'active',
		sh: '显示密码',
		hd: '隐藏密码'
	});

	//登录检测
	$("#submit").bind("click", function(event){
		event.preventDefault();
		var username = $("#username"), password = $("#password"), rember = $("#rember");
		if(username.val() == ""){
			username.parent().addClass("error");
			username.focus();
			return false;
		}
		if(password.val() == ""){
			password.parent().addClass("error");
			password.focus();
			return false;
		}

		var t = $(this);
		t.val("登录中...").attr("disabled", true);
		$.ajax({
			url: "login.php",
			data: $("#loginForm").serialize(),
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data.state == 100){
					gotopage = $("#gotopage").val();
					if(gotopage != ""){
						location.href = gotopage;
					}else{
						location.href = "index.php";
					}
				}else if(data.state == 200){
					t.val("登录").attr("disabled", false);
					if(data.count >= 5){
						$("#loginInfo").html('<p style="padding-top:150px; font-size:16px; color:#333;">由于您的登录密码错误次数过多，<br />本次登录请求已经被拒绝，请 15 分钟后重新尝试。</p>');
						fBodyVericalAlign();
					}else{
						alert(data.info);
					}
				}else if(data.state == 300){
					alert(data.info);
				};;
			}
		});
	});

	//设置垂直居中
	fBodyVericalAlign();

	//onresize事件
	$(window).resize(function () {
		fBodyVericalAlign();
	});

});

//设置垂直居中
function fBodyVericalAlign(){
	var nBodyHeight = $(".wrap").height();
	var nClientHeight = document.documentElement.clientHeight;
	if(nClientHeight >= nBodyHeight + 2){
		var nDis = (nClientHeight - nBodyHeight)/2;
		document.body.style.paddingTop = nDis + 'px';
	}else{
		document.body.style.paddingTop = '0px';
	}
}

var t = "\u5b98\u65b9\u7f51\u7ad9\uff1a\u0068\u0074\u0074\u0070\u0073\u003a\u002f\u002f\u0077\u0077\u0077\u002e\u006b\u0075\u006d\u0061\u006e\u0079\u0075\u006e\u002e\u0063\u006f\u006d\n\u4f7f\u7528\u534f\u8bae\uff1a\u0068\u0074\u0074\u0070\u0073\u003a\u002f\u002f\u0077\u0077\u0077\u002e\u006b\u0075\u006d\u0061\u006e\u0079\u0075\u006e\u002e\u0063\u006f\u006d\u002f\u0074\u0065\u0072\u006d\u0073\u002e\u0068\u0074\u006d\u006c\n\u300a\u8ba1\u7b97\u673a\u8f6f\u4ef6\u4fdd\u62a4\u6761\u4f8b\u300b\uff1a\u0068\u0074\u0074\u0070\u003a\u002f\u002f\u0077\u0077\u0077\u002e\u0067\u006f\u0076\u002e\u0063\u006e\u002f\u0067\u006f\u006e\u0067\u0062\u0061\u006f\u002f\u0063\u006f\u006e\u0074\u0065\u006e\u0074\u002f\u0032\u0030\u0031\u0033\u002f\u0063\u006f\u006e\u0074\u0065\u006e\u0074\u005f\u0032\u0033\u0033\u0039\u0034\u0037\u0031\u002e\u0068\u0074\u006d\n\u300a\u4e2d\u534e\u4eba\u6c11\u5171\u548c\u56fd\u8457\u4f5c\u6743\u6cd5\u300b\uff1a\u0068\u0074\u0074\u0070\u0073\u003a\u002f\u002f\u0077\u0077\u0077\u002e\u006e\u0063\u0061\u0063\u002e\u0067\u006f\u0076\u002e\u0063\u006e\u002f\u0063\u0068\u0069\u006e\u0061\u0063\u006f\u0070\u0079\u0072\u0069\u0067\u0068\u0074\u002f\u0063\u006f\u006e\u0074\u0065\u006e\u0074\u0073\u002f\u0031\u0032\u0032\u0033\u0030\u002f\u0033\u0035\u0033\u0037\u0039\u0035\u002e\u0073\u0068\u0074\u006d\u006c";
console.log("%c\u706b\u9e1f\u95e8\u6237\u7cfb\u7edf %c \u0043\u006f\u0070\u0079\u0072\u0069\u0067\u0068\u0074 \xa9 \u0032\u0030\u0031\u0033-%s \u82cf\u5dde\u9177\u66fc\u8f6f\u4ef6\u6280\u672f\u6709\u9650\u516c\u53f8\n\n%c" + t + "\n ", 'font-family: "Microsoft Yahei", Helvetica, Arial, sans-serif;font-size:30px;color:#333;-webkit-text-fill-color:#333;-webkit-text-stroke: 1px #333; line-height:40px;', "font-size:12px;color:#999999;", (new Date).getFullYear(), "color:#333;font-size:12px;")