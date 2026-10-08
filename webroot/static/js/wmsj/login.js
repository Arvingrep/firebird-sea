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
		sh: langData['waimai'][6][173],
		hd: langData['waimai'][6][175],
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
		t.val(langData['siteConfig'][2][5]+"...").attr("disabled", true);
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
					t.val(langData['siteConfig'][2][0]).attr("disabled", false);
					if(data.count >= 5){
						$("#loginInfo").html('<p style="padding-top:150px; font-size:16px; color:#333;">'+langData['waimai'][6][176]+'</p>');
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
