$(function(){
	
	var bmType = 0;

	//大图切换
  $(".hx_slide").slide({titCell: ".plist li",mainCell: ".album",effect: "fold",autoPlay: true,delayTime: 500,switchLoad: "_src",pageStateCell:".pageState",startFun: function(i, p) {if (i == 0) {$(".sprev").click()} else if (i % 5 == 0) {$(".snext").click()}}});

  //小图左滚动切换
  $(".hx_slide .thumb").slide({mainCell: "ul",delayTime: 300,vis: 5,scroll: 5,effect: "left",autoPage: true,prevCell: ".sprev",nextCell: ".snext",pnLoop: false});

    //报名
	$(".bm-btn, .bj").bind("click", function(){
		$(".modal-bm").addClass("popup").fadeIn();
		$(".popup_bg").show();
		if($(this).hasClass('bm-btn')){
			bmType = 3;
			$('.lp_title').text('报名');
			$('#bm').text('立即报名');
		}else{
			bmType = 1;
			$('.lp_title').text('变价通知');
			$('#bm').text('立即订阅');
		}
		return false;
	});
	
	$("body").delegate(".close", "click", function(){
		$(this).parent().hide();
		$("#verifycode").click();
		$(".popup_bg").hide();
	});

	//修复订阅浮动层IE下不兼容placeholder
	$("body").delegate(".popup input", "click", function(){
		var t = $(this), val = t.val(), placeholder = t.attr("placeholder");
		if(val == placeholder){
			t.val("").removeClass("placeholder");
		}
	});
	$("body").delegate(".popup input", "blur", function(){
		var t = $(this), val = t.val(), placeholder = t.attr("placeholder");
		if(val == ""){
			t.val(placeholder).addClass("placeholder");
		}
	});

	// 单选框
	var sexval='';
	$("body").delegate(".sexbox input[type='radio']", "click", function(){
		var t = $(this);
		if(this.checked){
	        sexval= t.val();
	    }
	});

	//更新验证码
	var verifycode = $("#verifycode").attr("src");
	$("body").delegate("#verifycode", "click", function(){
		$(this).attr("src", verifycode+"?v="+Math.random());
	});

	//验证提示弹出层
	function showMsg(msg){
	  $('.dy .dc').append('<p class="ptip">'+msg+'</p>')     
	  setTimeout(function(){   
		$('.ptip').remove();
	  },2000);
	}


	//提交订阅信息
	$("body").delegate("#bm", "click", function(){
		var type =[],t = $(this), obj = t.closest(".modal-bm"), btnhtml = t.html();

		if(t.hasClass("disabled")) return false;

		var name = obj.find("#name");
		var phone = obj.find("#phone");
		var vercode = obj.find("#vercode");
		var xy = obj.find(".xy");


		if(name.val() == "" || name.val() == name.attr("placeholder")){
			errMsg = "请输入您的姓名";
			showMsg(errMsg);
			return false;
		}else if(phone.val() == "" || phone.val() == phone.attr("placeholder")){
			errMsg = "请输入您的手机号码";
			showMsg(errMsg);
			return false;
		}else if(!/(13|14|15|17|18)[0-9]{9}/.test($.trim(phone.val()))){
			errMsg = "手机号码格式错误，请重新输入！";
			showMsg(errMsg);
			return false;
		}else if(vercode.val() == "" || vercode.val() == vercode.attr("placeholder")){
			errMsg = "请输入验证码";
			showMsg(errMsg);
			return false;
		}

		if(!xy.hasClass("checked")){
			errMsg = "请先同意[免责协议]";
			showMsg(errMsg);
			return false;
		}
		t.addClass("disabled").html("提交中...");

		var data = [];
		data.push("act=loupan");
		data.push("aid="+pageData_.id);
		data.push("type="+bmType);
		data.push("name="+name.val());
		data.push("phone="+phone.val());
		// data.push("sex="+sex);
		data.push("vercode="+vercode.val());
		data = data.join("&");

		$.ajax({
			url: masterDomain+"/include/ajax.php?service=house&action=subscribe",
			data: data,
			dataType: "JSONP",
			success: function(data){
				if(data && data.state == 100){
					showMsg(data.info);
					setTimeout(function(){
						$('#vercode').val('');
						$("#verifycode").click();
						t.closest(".dy").find(".close").click();
						t.removeClass("disabled").html(btnhtml);
					}, 1000);
				}else{
					t.removeClass("disabled").html(btnhtml);
					showMsg(data.info);
				}
			},
			error: function(){
				t.removeClass("disabled").html(btnhtml);
				showMsg("网络错误，请稍候重试！");
			}
		})

	});
})