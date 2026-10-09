$(function(){
	// 判断浏览器是否是ie8
    if($.browser.msie && parseInt($.browser.version) >= 8){
        $('.tab_content ul li:last-child').css('margin-right','0');
        $('.adviBox .bd .slitem:nth-child(3n)').css('margin-right','0');
        $('.lpAround .midbox ul li:nth-child(4n)').css('margin-right','0');
        $('.quanjing .ullist li:nth-child(4n)').css('margin-right','0');
    }

	$("img").scrollLoading();
	 //焦点图
    $(".slideBox1").cycle({pager: '#slidebtn',pause: true,timeout: 3000,});
    
	//二维码
	$(".mobile_kf #qrcode").qrcode({
		render: window.applicationCache ? "canvas" : "table",
		width: 74,
		height: 74,
		text: huoniao.toUtf8(window.location.href)
	});

	//收藏
	$(".btnSc").bind("click", function(){
		var t = $(this), type = "add", oper = "+1", txt = "已收藏";

		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			huoniao.login();
			return false;
		}

		if(!t.hasClass("btnYsc")){
			t.addClass("btnYsc");
		}else{
			type = "del";
			t.removeClass("btnYsc");
			oper = "-1";
			txt = "收藏";
		}

		var $i = $("<b>").text(oper);
		var x = t.offset().left, y = t.offset().top;
		$i.css({top: y - 10, left: x + 17, position: "absolute", "z-index": "10000", color: "#f1370b"});
		$("body").append($i);
		$i.animate({top: y - 50, opacity: 0, "font-size": "2em"}, 800, function(){
			$i.remove();
		});

		t.html("<i></i>"+txt);

		$.post("/include/ajax.php?service=member&action=collect&module=house&temp=loupan_detail&type="+type+"&id="+pageData_.id);

	});

    //举报
    $(".btnJb").bind("click", function(){

        var domainUrl = masterDomain;
        $.dialog({
            fixed: false,
            title: "房源举报",
            content: 'url:'+domainUrl+'/complain-house-sale-'+pageData_.id+'.html',
            width: 460,
            height: 300
        });
    });

	//通知
	var noticeCla = "";
	$(".bm, .kp").bind("click", function(){
		var cla = $(this).attr("class");

		var hid = $(this).attr('data-id');
		$('#huodongid').val(hid);
		noticeCla = cla;
		
		$(".modal-dy").addClass("popup").fadeIn();

		$(".popup_bg").show();

		//根据按钮选中不同的选项
		$(".modal-dy.popup dl .checkbox").removeClass("checked");
		$(".modal-dy.popup .c"+cla).addClass("checked");
		return false;
	});
	
	$("body").delegate(".close", "click", function(){
		if(noticeCla == "bm"){
			$(this).parent().hide();
		}else{
			$(this).parent().hide();
			$("#verifycode").click();
		}
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

	//复选框
	$("body").delegate(".dc dl", "click", function(){
		var t = $(this).find(".checkbox");
		t.hasClass("checked") ? t.removeClass("checked") : t.addClass("checked");
	});

	$("body").delegate(".checkbox", "click", function(){
		var t = $(this);
		t.hasClass("checked") ? t.removeClass("checked") : t.addClass("checked");
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
	$("body").delegate("#tj", "click", function(){
		var type =[3],t = $(this), obj = t.closest(".dy"), btnhtml = t.html();

		if(t.hasClass("disabled")) return false;

		// obj.find("dl").each(function(){
		// 	var checkbox = $(this).find(".checkbox");
		// 	if(checkbox.hasClass("checked")){
		// 		type.push(checkbox.attr('data-val'));
		// 	}
		// });

		// if(type.length == 0){
		// 	errMsg = "请选择要订阅的信息类型";
		// 	showMsg(errMsg);
		// 	return false;
		// }

		var name = obj.find("#name");
		var phone = obj.find("#phone");
		var vercode = obj.find("#vercode");
		var huodongid     = obj.find("#huodongid");
		var xy = obj.find(".xy");
		let phoneRule=/^[1][3-8]\d{9}$|^([6|9])\d{7}$|^[0][9]\d{8}$|^[6]([8|6])\d{5}$/;//验证国内手机号

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

		var sex = $('[name="sex"]:checked').val();

		var data = [];
		data.push("act=loupan");
		data.push("aid="+pageData_.id);
		data.push("type="+type.join(","));
		data.push("name="+name.val());
		data.push("phone="+phone.val());
		data.push("sex="+sex);
		data.push("vercode="+vercode.val());
		data.push("hid="+huodongid.val());



		data = data.join("&");

		$.ajax({
			url: masterDomain+"/include/ajax.php?service=house&action=subscribe",
			data: data,
			dataType: "JSONP",
			success: function(data){
				if(data && data.state == 100){
					t.removeClass("disabled").html("订阅成功");
					setTimeout(function(){
						t.closest(".dy").find(".close").click();
					}, 1000);
				}else{
					t.removeClass("disabled").html(btnhtml);
					alert(data.info);
				}
			},
			error: function(){
				t.removeClass("disabled").html(btnhtml);
				alert("网络错误，请稍候重试！");
			}
		})

	});


	$("html").delegate(".bdshare_popup_box", "mouseover", function(){
		$(".share").addClass("curr");
	});
	$("html").delegate(".bdshare_popup_box", "mouseout", function(){
		$(".share").removeClass("curr");
	});


	//增加浏览历史
  var house_loupan_history = $.cookie(cookiePre+'house_loupan_history');
  if (house_loupan_history == null) house_loupan_history = "";
  if (house_loupan_history.indexOf(pageData_.id) == -1) {
  	if (house_loupan_history.length > 0) {
  		house_loupan_history += ':'+pageData_.id;
  	} else {
  		house_loupan_history += pageData_.id;
  	}
  	if (house_loupan_history.length > 128) {
  		var pos = house_loupan_history.indexOf(':');
  		house_loupan_history = house_loupan_history.substr(pos + 1);
  	}
  	$.cookie(cookiePre+'house_loupan_history', house_loupan_history, {expires: 365, domain: masterDomain.replace("http://", "").replace("https://", ""), path: '/'});
  }
  // 修改
  let pictureSwiper = new Swiper('.ep-swiper', {
    loop: true,//无限循环
    spaceBetween: 10
  });
  $('.epc-show').click(function () { //点击切换
    let element = $(this);
    pictureSwiper.slideToLoop(element.index(), 300, false);//切换到第一个slide，速度为1秒
  });
  // 订阅弹窗
  $('.eitp-left .label,.edi-list .item .label').click(function () {
    $('.dy.other').css({ 'display': 'flex' });
  });
  // 收藏
  $('.edi-more .btn .collect').click(async function () {
    let type = $(this).attr('data-type');
    let data = {
      service: 'member',
      action: 'collect',
      module: 'house',
      temp: 'loupan_detail',
      type: type == 1 ? 'del' : 'add',
      id: pageData_.id,
    }
    let result = await ajax(data, { dataType: 'json' });
    if (result.state == 100) {
      if (type == 1) {
        $('.edi-more .btn .item.collect').removeClass('has');
        $('.edi-more .btn .item.collect').attr('data-type', 0);
      } else {
        $('.edi-more .btn .item.collect').addClass('has');
        $('.edi-more .btn .item.collect').attr('data-type', 1);
      }
    }
  });
  //二维码
  $(".scanCheck").qrcode({
    render: window.applicationCache ? "canvas" : "table",
    width: 74,
    height: 74,
    text: huoniao.toUtf8(window.location.href)
  });
  // 在线咨询
  $('.eic-right .btn').click(function () {
    let userid = $(this).attr('data-userid');
    imconfig.chatid = userid;
  });
});

