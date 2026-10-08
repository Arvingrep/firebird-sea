$(function(){
	var zindex = 1000, showTip = function(obj, state, txt){
		var offset = obj.parent().offset(),
				objwid = obj.parent().width() + 15,
				left = offset.left + objwid + "px",
				top  = offset.top + "px",
				id   = obj.attr("id"),
				nid  = id+"_Tip";
		state == "error" ? obj.addClass("err") : "";
		$(".inptip").remove();
		$("body").append('<div id="'+nid+'" class="inptip '+state+'" style="left: '+left+'; top: '+top+'; z-index: '+zindex+'"><s></s><i></i><p>'+txt+'</p></div>');
		zindex++;
	};

	var verifyInput = function(t){
		var id = t.attr("id");
		t.removeClass("focus");
		if($.trim(t.val()) == ""){
			t.next("span").show();

			if(id == "username"){
				showTip(t, "error", langData['siteConfig'][21][225]);  //请输入用户名！
			}else if(id == "password"){
				showTip(t, "error", langData['siteConfig'][20][163]);  //请输入密码！
			}else if(id == "nickname"){
				showTip(t, "error", langData['siteConfig'][32][50]);  //请输入您的真实姓名！
			}else if(id == "email"){
				showTip(t, "error", langData['siteConfig'][21][36]);  //请输入邮箱地址！
			}else if(id == "phone"){
				showTip(t, "error", langData['siteConfig'][20][463]);  //请输入手机号码！
			}else if(id == "company" && $("input[name=mtype]:checked").val() == "2"){
				showTip(t, "error", langData['siteConfig'][21][232]);   //请输入公司名称！
				return false;
			}else if(id == "answer"){
				showTip(t, "error", langData['siteConfig'][30][85]);  //请输入安全问题答案！
			}else if(id == "vericode"){
				showTip(t, "error", langData['siteConfig'][20][176]);  //请输入验证码！
			}

			if(id == "company" && $("input[name=mtype]:checked").val() == "1"){
				return true;
			}else{
				return false;
			}
		}else{
			if(id == "username" && !/^[a-zA-Z]{1}[0-9a-zA-Z_]{4,15}$/.test($.trim(t.val()))){
				showTip(t, "error",  langData['siteConfig'][30][80]);//用户名格式：英文字母、数字、下划线以内的5-20个字！<br />并且只能以字母开头！
				return false;
			}else if(id == "password" && !/^.{5,}$/.test($.trim(t.val()))){
				showTip(t, "error", langData['siteConfig'][21][103]);//密码长度最少为5位
				return false;
			}else if(id == "nickname" && !/^[a-z\/ ]{2,20}$/i.test($.trim(t.val())) && !/^[\u4e00-\u9fa5 ]{2,20}$/.test($.trim(t.val()))){
				showTip(t, "error", langData['siteConfig'][30][86]);//姓名格式：中文、英文字母、空格、反斜线(/)以内的2-20个字！<br />如：刘德华、刘 德华、Last/Frist Middle
				return false;
			}else if(id == "email" && !/^[a-z0-9]+([\+_\-\.]?[a-z0-9]+)*@([a-z0-9]+\.)+[a-z]{2,6}$/i.test($.trim(t.val()))){
				showTip(t, "error", langData['siteConfig'][20][511]); //邮箱格式错误！
				return false;
			}else if(id == "phone" && !/1[0-9]{10}/.test($.trim(t.val()))){
				showTip(t, "error", langData['siteConfig'][21][98]);//手机号码格式错误！
				return false;
			}else if(id == "vericode"){
				t.removeClass("err");
				$.ajax({
					url: "/include/ajax.php?service=siteConfig&action=checkVdimgck&code="+t.val(),
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){
							if(data.info == "error"){
								t.addClass("err");
								showTip(t, "error", langData['siteConfig'][21][222]);//验证码输入错误，请重试！
							}
						}
					}
				});
			}else{
				t.removeClass("err");
			}
		}
		return true;
	}


	//类型切换
	$("input[name=mtype]").bind("click", function(){
    if($(this).val() == 2){
      $("#companyObj").show();
    }else{
      $("#companyObj").hide();
    }
  });


	//表单占位符
	$(".form-horizontal li span").bind("click", function(){
		var t = $(this);
		t.hide();
		t.prev("input").focus();
	});

	//表单聚焦时状态
	$(".form-horizontal li input").bind("focus", function(){
		var t = $(this), id = t.attr("id");
		t.next("span").hide();
		t.removeClass("error").addClass("focus");
		$(".inptip").remove();
	});

	//表单失去焦点时状态
	$(".form-horizontal li input").bind("blur", function(){
		verifyInput($(this));
	});

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
		}
		if($.trim(password.val()) != ""){
			password.next("span").hide();
		}
	}, 100);

	//回车提交
	$(".form-horizontal input").keyup(function (e) {
		if (!e) {
			var e = window.event;
		}
		if (e.keyCode) {
			code = e.keyCode;
		}else if (e.which) {
			code = e.which;
		}
		if (code === 13) {
			$("#submitRegister").click();
		}
	});

	//提交
	$("#submitRegister").bind("click", function(){
		var t = $(this), tj = true;

		if(t.hasClass("disabled")) return false;

		$(".form-horizontal li input").each(function(){
			if(!verifyInput($(this))){
				tj = false;
				return false;
			}
		});

		if(!$("#xieyi").is(":checked")){
			alert(langData['siteConfig'][30][87]);  //请同意《网站服务使用协议》！
			return false;
		}

		if(!tj) return false;

		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");//提交中

		//异步提交
		$.ajax({
			url: masterDomain+"/registerCheck.html",
			data: $(".form-horizontal").serialize(),
			type: "POST",
			dataType: "html",
			success: function (data) {
				if(data){
					var dataArr = data.split("|");
					var info = dataArr[1];
					if(data.indexOf("100|") > -1){
						$("body").append(data);
						location.href = info;

					}else if(data.indexOf("201|") > -1){
						showTip($("#username"), "error", info);

					}else if(data.indexOf("202|") > -1){
						showTip($("#password"), "error", info);

					}else if(data.indexOf("203|") > -1){
						showTip($("#nickname"), "error", info);

					}else if(data.indexOf("204|") > -1){
						showTip($("#email"), "error", info);

					}else if(data.indexOf("205|") > -1){
						showTip($("#phone"), "error", info);

					}else if(data.indexOf("206|") > -1){
						showTip($("#company"), "error", info);

					}else if(data.indexOf("207|") > -1){
						showTip($("#answer"), "error", info);

					}else if(data.indexOf("208|") > -1){
						showTip($("#vericode"), "error", info);

					}else{
						alert(info);
					}
					$("#verifycode").click(); //更新验证码
					t.removeClass("disabled").html(langData['siteConfig'][1][0]);  //注册
				}else{
					alert(langData['siteConfig'][20][174]);//注册失败，请重试！
					t.removeClass("disabled").html(langData['siteConfig'][1][0]);//注册
				}
			}
		});
		return false;

	});
});
