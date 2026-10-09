$(function(){

	//大图幻灯
	$("#slide").cycle({
		pager: '#slidebtn'
	});

	//验证是否已经登录
	if($("#isLogin").html() == 1){
		location.href = busiDomain;
	}

	//表单占位符
	$(".logFrame dd span").bind("click", function(){
		var t = $(this);
		t.hide();
		t.prev("input").focus();
	});

	//表单聚焦时状态
	$(".logFrame dd input").bind("focus", function(){
		var t = $(this), id = t.attr("id");
		t.next("span").hide();
	});

	//表单失去焦点时状态
	$(".logFrame dd input").bind("blur", function(){
		var t = $(this), id = t.attr("id");
		if($.trim(t.val()) == ""){
			t.next("span").show();

			if(id == "username"){
				showTip(langData['siteConfig'][27][110]);
			}else if(id == "password"){
				showTip(langData['siteConfig'][20][164]);
			}else if(id == "vdimgck"){
				showTip(langData['siteConfig'][20][176]);
			}
		}else{
			if(id == "password" && !/^.{5,}$/.test($.trim($("#password").val()))){
				showTip(langData['siteConfig'][21][103]);
			}
		}
	});

	function showTip(info){
		$(".logFrame h3").hide();
		$(".err-tip span").html(info);
		$(".err-tip").show();
	}

	//更新验证码
	var verifycode = $("#verifycode").attr("src");
	$("#verifycode").bind("click", function(){
		$(this).attr("src", verifycode+"?v="+Math.random());
	});

	setTimeout(function(){
		var username = $("#username"),
				password = $("#password");
		if($.trim(username.val()) != ""){
			username.next("span").hide();
			password.next("span").hide();
		}
	}, 100);

	//回车提交
	$(".logFrame input").keyup(function (e) {
		if (!e) {
			var e = window.event;
		}
		var code;
		if (e.keyCode) {
			code = e.keyCode;
		}else if (e.which) {
			code = e.which;
		}
		if (code === 13) {
			$("#submit").click();
		}
	});

	//提交
	$("#submit").bind("click", function(){
		var t = $(this),
				username = $("#username"),
				password = $("#password"),
				vdimgck = $("#vdimgck"),
				data = [];

		if(t.hasClass("disabled")) return false;

		if($.trim(username.val()) == ""){
			showTip(langData['siteConfig'][27][110]);
			username.focus();
			return false;
		}

		if($.trim(password.val()) == ""){
			showTip(langData['siteConfig'][20][164]);
			password.focus();
			return false;
		}

		if(!/^.{5,}$/.test($.trim(password.val())) && $.trim(password.val()) != ""){
			showTip(langData['siteConfig'][21][103]);
			password.focus();
			return false;
		}

		if(vdimgck && $.trim(vdimgck.val()) == "" && vdimgck.val() != undefined){
			showTip(langData['siteConfig'][20][176]);
			vdimgck.focus();
			return false;
		}

		data.push("username="+username.val());
		data.push("password="+password.val());
		if(vdimgck.val() != undefined){
			data.push("vericode="+vdimgck.val());
		}

		t.attr("disabled", true).val(langData['siteConfig'][2][5]+"...");

		//异步提交
		$.ajax({
			url: "/loginCheck.html",
			data: data.join("&"),
			type: "POST",
			dataType: "html",
			success: function (data) {
				if(data){
					if(data.indexOf("100") > -1){
						$("body").append(data);
						t.html(langData['siteConfig'][21][0]);
						setTimeout(function(){
							location.href = busiDomain;
						}, 500);
					}else if(data.indexOf("201") > -1){
						var data = data.split("|");
						showTip(data[1]);
						t.attr("disabled", false).val(langData['siteConfig'][2][0]);
						$("#verifycode").click();
					}else if(data.indexOf("202") > -1){
						var data = data.split("|");
						showTip(data[1]);
						t.attr("disabled", false).val(langData['siteConfig'][2][0]);
						$("#verifycode").click();
					}
				}else{
					alert(langData['siteConfig'][20][167]);
					t.attr("disabled", false).val(langData['siteConfig'][2][0]);
					$("#verifycode").click();
				}
			}
		});
		return false;
	});


	//第三方登录
	$(".qlogin a").click(function(e){
		e.preventDefault();
		var href = $(this).attr("href");
		loginWindow = window.open(href, 'oauthLogin', 'height=565, width=720, left=100, top=100, toolbar=no, menubar=no, scrollbars=no, status=no, location=yes, resizable=yes');

		mtimer = setInterval(function(){
			if(loginWindow.closed){
				clearInterval(mtimer);
				location.href = busiDomain;
			}
		}, 1000);
	});

});
