var atpage = 1, pageSize = 10, totalCount = 0, container = $("#list");
$(function(){

	var dopost = 'configZjUser';

	var timer = null;
	$(".seabox .title").keyup(function(e){
		var t = $(this), title = $.trim(t.val());
		if(title != ''){
			clearTimeout(timer);
			timer = setTimeout(function(){
				checkStore(title)
			}, 200)
		}
	});
	function checkStore(title){
		$.ajax({
			url: '/include/ajax.php?service=house&action=zjComList&keywords='+title,
			type: 'get',
			dataType: 'jsonp',
			success: function(data){
				if(data.state == 100){
					var html = [];
					for(var i = 0; i < data.info.list.length; i++){
						var d = data.info.list[i];
						html.push('<li data-id="'+d.id+'" data-title="'+d.title+'" data-logo="'+d.litpic+'" data-tel="'+d.tel+'" data-address="'+d.address+'" data-url="'+d.url+'">'+d.title+'</li>');
					}
					$('.seabox .result').html(html.join("")).show();
				}else{
					$('.seabox .result').html('').hide();
				}
			}
		})
	}

	$("#searchForm").submit(function(e){
		e.preventDefault();
		var t = $(".seabox .title"), title = $.trim(t.val());
		atpage = 1;
		$('.storelist').show().siblings().hide();
		dopost = 'configZjUser';
		getList(title);
	})

	// 选中公司
	$("body").delegate("#list .join, .seabox li", "click", function(){

		if(enter_zjuser){
			$.dialog.confirm(langData['siteConfig'][30][44], function(){   //您已经入驻经纪人，查看资料？
				location.href = zjuser_url;
			})
			return;
		}

		var t = $(this), id = t.attr("data-id"), title = t.attr("data-title"), logo = t.attr("data-logo"), tel = t.attr("data-tel"), address = t.attr("data-address"), url = t.attr("data-url");
		$(".activeStore .m-box .logo").attr("href", url).html('<img src="'+logo+'" alt="">');
		$(".activeStore .m-box .name").attr("href", url).html(title);
		$(".activeStore .m-box .txt p").html(address);
		$(".activeStore .m-box .tel span").html(tel);

		$("#zjcom").val(id);
		$("#companyInfo, .result").hide();
		$(".activeStore, #zjuserInfo").show();
		$(".formbox").show().siblings().hide();

		checkPhone('#phone');

		dopost = 'configZjUser';
	})
	$("body").click(function(e){
		var o = $(e.target);
		if(o.closest('.seabox').length == 0){
			$(".result").hide();
		}
	})
	// 重新选择公司
	$(".activeStore").delegate(".choseAgain", "click", function(){
		$(".storelist").show().siblings().hide();
	})

	// 展开收起详细资料
	$(".toggleMore").click(function(){
		var t = $(this);
		if(t.hasClass('open')){
			$('.moreinfo').slideUp();
			t.removeClass('open');
		}else{
			t.addClass('open');
			$('.moreinfo').slideDown();
		}
	})

	// 创建公司
	$(".creatStore").click(function(){
		if(enter_zjcom){
			$.dialog.confirm(langData['siteConfig'][30][45], function(){   //您已经入驻经纪公司，查看资料？
				location.href = zjcom_url;
			})
			return;
		}
		if($('.alone').hasClass('checked')){
			dopost = 'configZjUser';
		}else{
			dopost = 'storeConfig';
		}
		$(".formbox, #companyInfo").show();
		$(".activeStore, .storelist").hide();
		if($(".alone").hasClass("checked")){
			$("#zjuserInfo").show();
		}else{
			$("#zjuserInfo").hide();
		}
	})
	// 独立经纪人
	$(".alone").click(function(){
		var t = $(this);
		if(t.hasClass('checked')){

			dopost = 'storeConfig';

			$('#alone').val(0);
			checkName('#title');
			$('#zjuserInfo').hide();
			$('#companyInfo input').prop("disabled", false);
			$('.unable').remove();
			$('#companyInfo dl:eq(0)').nextAll().slideDown(100);

			$('#zjuserInfo input').prop('disabled', true);
		}else{

			if(enter_zjuser){
				$.dialog.confirm(langData['siteConfig'][30][44], function(){   //您已经入驻经纪人，查看资料？
					location.href = zjuser_url;
				})
				return;
			}
			dopost = 'configZjUser';

			checkPhone('#phone');

			$('#alone').val(1);
			$('.company-name .tip-inline').removeClass('success error');
			$('#zjuserInfo').show();
			$('#companyInfo input[type=text]').prop("disabled", true);
			$(".company-logo .listImgBox, #selAddr .sel-group").append('<div class="unable"></div>')
			$('#companyInfo dl:eq(0)').nextAll().slideUp(100);
			if(!$(".toggleMore").hasClass("open")){
				$(".toggleMore").click();
			}
			$('#zjuserInfo input').prop('disabled', false);
		}
		t.toggleClass('checked');
	})


	// 经纪人---------------------------

	function checkName(id){
		var t = $(id), val = $.trim(t.val());
		var writerRegex = '.{2,20}', writerErrTip = langData['siteConfig'][20][37];  //输入错误，请正确填写，2-20个字！
		var exp = new RegExp("^" + writerRegex + "$", "img");
		if(!exp.test(val)){
			t.siblings('.tip-inline').addClass('error').removeClass('success').html('<s></s>');
			return false;
		}else{
			t.siblings('.tip-inline').addClass('success').removeClass('error').html('<s></s>');
			return true;
		}
	}
	function checkPhone(id){
		var t = $(id), val = $.trim(t.val()), old = t.data("val"), areaCode = $('#areaCode').val();
		var par = t.closest('dd');
		var telErrTip = langData['siteConfig'][20][525];  //输入错误，请正确填写手机号码
		if(areaCode == '86'){
			var telRegex = '(12|13|14|15|16|17|18|19)[0-9]{9}';
		}else{
			var telRegex = '[0-9]{4,15}';
		}
		var exp = new RegExp("^" + telRegex + "$", "img");
		if(!val){
			par.find('.tip-inline').addClass('error').removeClass('success').html('<s></s>');
			$('.sendcode').addClass("disabled");
			return false;
		}else{
			par.find('.tip-inline').addClass('success').removeClass('error').html('<s></s>');
			if(id == '#phone'){
				if(old == '' || val != old || !userinfo.phoneCheck){
					if($('#vdimgckInfo').attr('data-hide') != '1'){
						$('.sendcode').removeClass("disabled").show();
						$('#vdimgckInfo').show();
					}

				}else{
					if($('#vdimgckInfo').attr('data-hide') != '1') {
						$('.sendcode').addClass("disabled").hide();
						$('#vdimgckInfo').hide();
					}
				}
			}
			return true;
		}
	}
	// 姓名
	$("#nickname").bind("input, blur", function(){
		checkName("#nickname");
	})
	// 电话号码
	$("#phone").on("input propertychange, blur",function(){
		$('#vdimgckInfo').attr('data-hide','0');
		checkPhone("#phone");
	})

	var sendSmsData = [];

  if(geetest){
	captchaVerifyFun.initCaptcha('web','#codeButton',sendSmsFunc)
    //极验验证
	$('.sendcode').bind("click", function () {
		if ($(this).hasClass('disabled') || $(this).hasClass('not')) return false;
		if ($("#phone").val() == '') {
			$('.senderror').text(langData['siteConfig'][20][463]).show();   //请输入手机号码
			$("#phone").focus();
			return false;
		}
		//弹出验证码
		if (geetest == 1) {
			captchaVerifyFun.config.captchaObjReg.verify();
		} else {
			$('#codeButton').click()
		}
	})
  }else{
    $(".sendcode").bind("click", function (){
			if($(this).hasClass('disabled') || $(this).hasClass('not')) return false;
			if($("#phone").val() == ''){
				$('.senderror').text(langData['siteConfig'][20][463]).show();  //请输入手机号码
				$("#phone").focus();
				return false;
			}
			$("#vercode").focus();
			sendSmsFunc();
    })
  }

	//发送验证码
	function sendSmsFunc(captchaVerifyParam,callback){
		var tel = $("#phone").val();
		var areaCode = $("#areaCode").val().replace('+', '');
		var sendSmsUrl = "/include/ajax.php?service=siteConfig&action=getPhoneVerify";

		endSmsData = []
		sendSmsData.push('type=verify');
		sendSmsData.push('areaCode=' + areaCode);
		sendSmsData.push('phone=' + tel);
		let param = sendSmsData.join('&')
		if(captchaVerifyParam && geetest == 2){
			param = param + '&geetest_challenge=' + captchaVerifyParam
		}else if(geetest == 1 && captchaVerifyParam){
			param = param +  captchaVerifyParam
		}


		$('.senderror').text('');
		$.ajax({
			url: sendSmsUrl,
			data: param,
			type: 'POST',
			dataType: 'json',
			success: function (res) {
				if(callback){
					callback(res)
				}
				if (res.state == 101) {
					$('.senderror').text(res.info);
				}else{
					countDown(60, $('.sendcode'));
				}
			}
		})
	}

	//倒计时
	function countDown(time, obj){
		obj.html(time+langData['siteConfig'][30][46]).addClass('disabled not');   //秒后重发
		mtimer = setInterval(function(){
			obj.html((--time)+langData['siteConfig'][30][46]).addClass('disabled not');  //秒后重发
			if(time <= 0) {
				clearInterval(mtimer);
				obj.html(langData['siteConfig'][6][55]).removeClass('disabled not');  //重新发送
			}
		}, 1000);
	}

	// 公司-------------------
	// 公司名
	$("#title").bind("input, blur", function(){
		checkName("#title");
	})
	//国际手机号获取
	getNationalPhone();
	function getNationalPhone(){
		$.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'JSONP',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   var listLen = list.length;
                   var codeArea = list[0].code;
                   if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        $('.areaCode').hide();
                        $('.enter_zjcom #fabuForm .inp#tel').css({'padding-left':'10px','width':'295px'});
                        $('.enter_zjcom .inp#phone').css({'padding-left':'10px','width':'295px'});
                        return false;
                   }
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li data-cn="'+list[i].name+'" data-code="'+list[i].code+'">'+list[i].name+' +'+list[i].code+'</li>');
                   }
                   $('.areaCode_wrap ul').append(phoneList.join(''));
                }else{
                   $('.areaCode_wrap ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                        $('.areaCode_wrap ul').html('<div class="loading">加载失败！</div>');
                    }

        })
	}
	//显示区号
	$('.areaCode').bind('click', function(){
		var areaWrap =$(this).closest("dd").find('.areaCode_wrap');
		if(areaWrap.is(':visible')){
			areaWrap.fadeOut(300)
		}else{
			areaWrap.fadeIn(300);
			return false;
		}
	});

	//选择区号
	$('.areaCode_wrap').delegate('li', 'click', function(){
		var t = $(this), code = t.attr('data-code');
		var par = t.closest("dd");
		var areaIcode = par.find(".areaCode");
		areaIcode.find('i').html('+' + code);
		$('#areaCode').val(code);
	});

	$('body').bind('click', function(){
		$('.areaCode_wrap').fadeOut(300);
	});

	// 提交表单
	$("#fabuForm").submit(function(e){
		e.preventDefault();
		var t = $(this), btn = $('#submit'), action = t.attr('data-action') + dopost, gourl = '';
		t.attr('action', action);
		$('.listSection').each(function(){
			var c = $(this), li = c.children('li'), inp = c.prev('input');
			if(li.length){
				inp.val(li.eq(0).find('img').attr('data-val'));
			} else{
				inp.val('');
			}
		})

		// 入驻经纪人
		if(dopost == 'configZjUser'){

			gourl = zjuser_url;

			var nickname = $('#nickname').val(),
					phone = $('#phone').val(),
					phone_ = $('#phone').data("val"),
					vdimgck = $('#vdimgck').val(),
					zjcom = $('#zjcom').val(),
					alone = $('#alone').val();

			if(!checkName("#nickname")){
				$("#nickname").focus();
				return;
			}
			if(!checkPhone("#phone")){
				$("#phone").focus();
				return;
			}
			if((phone != phone_ || phone_ == "") && vdimgck == ""){
				$('#vdimgck').focus().siblings('.tip-inline').addClass('error').removeClass('success');
				return;
			}else{
				$('#vdimgck').siblings('.tip-inline').addClass('success').removeClass('error');
			}

			if(alone == "0" && zjcom == "0"){
				$.dialog.alert(langData['siteConfig'][30][47]);  //操作错误！
				return;
			}

			$('#companyInfo input').prop('disabled', true);

		// 创建公司
		}else if(dopost == 'storeConfig'){

			gourl = zjcom_url;

			var title = $('#title').val(),
					logo = $('#litpic_').val(),
					addrid = 0,
					cityid = 0,
					address = $('#address').val(),
					tel = $('#tel').val(),
					r = true;

			if(!checkName("#title")){
				r = false;
			}

			if(logo == ''){
				$('.company-logo .tip-inline').addClass("error").removeClass("success").html('<s></s>');
				r = false;
			}else{
				$('.company-logo .tip-inline').addClass("success").removeClass("error").html('<s></s>');
			}

			var ids = $('.addrBtn').attr("data-ids");
			if(ids != undefined && ids != ''){
				addrid = $('.addrBtn').attr("data-id");
				ids = ids.split(' ');
				cityid = ids[0];
				$("#selAddr .tip-inline").addClass("success").removeClass("error").html('<s></s>');
			}else{
				$("#selAddr .tip-inline").addClass("error").removeClass("success").html('<s></s>');
				r = false;
			}
			$('#addr').val(addrid);
			$('#cityid').val(cityid);

			if(address == ''){
				$('#address').siblings('.tip-inline').addClass("error").removeClass("success").html('<s></s>');
				r = false;
			}else{
				$('#address').siblings('.tip-inline').addClass("success").removeClass("error").html('<s></s>');
			}

			if(!checkPhone("#tel")){
				r = false;
			}

			if(!r){
				return;
			}

			$('#zjuserInfo input').prop('disabled', true);

		}

		btn.prop('disabled', true);


		$.ajax({
			url: action,
			data: t.serialize(),
			type: 'post',
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
					$.dialog.confirm(data.info, function(){
						location.href = gourl;
					}, function(){
						location.href = gourl;
					});
				}else{
					$.dialog.alert(data.info);
					btn.prop('disabled', false);
				}
			},
			error: function(){
				btn.prop('disabled', false);
				$.dialog.alert(langData['siteConfig'][6][203]);   //网络错误，请重试！
			}
		})

	})

	if(type == 'enterstore'){
		$('.creatStore').click();
	}else{
		getList();
	}

})

function getList(title){
	var keywords = title == undefined ? '' : title;
	var data = [];
	data.push('keywords='+keywords);
	data.push('page='+atpage);
	data.push('pageSize='+pageSize);

	// $('.loading').html('').hide();

	$.ajax({
		url: '/include/ajax.php?service=house&action=zjComList',
		type: 'get',
		data: data.join("&"),
		dataType: 'jsonp',
		success: function(data){
			if(data.state == 100){
				var html = [];
				totalCount = data.info.pageInfo.totalCount;

				for(var i = 0; i < data.info.list.length; i++){
					var d = data.info.list[i];
					html.push('<li class="fn-clear" data-id="'+d.id+'">');
					html.push('	<a href="'+d.url+'" target="_blank" class="logo"><img src="'+d.litpic+'" alt="'+d.id+'"></a>');
					html.push('	<div class="txt">');
					html.push('		<a href="'+d.url+'" target="_blank" class="name">'+d.title+'</a>');
					html.push('		<p>'+d.city+'<span>'+d.address+'</span></p>');
					html.push('	</div>');
					html.push('	<a href="javascript:;" class="join" data-id="'+d.id+'" data-title="'+d.title+'" data-logo="'+d.litpic+'" data-tel="'+d.tel+'" data-address="'+d.address+'" data-url="'+d.url+'">'+langData['siteConfig'][30][48]+'</a>');
					//申请加入
					html.push('</li>');
				}
				$('.loading').fadeOut(200, function(){
					$('#list').html(html.join(""));
				})
				showPageInfo();

			}else{
				$('#list').html('');
				$('.loading').html(langData['siteConfig'][30][49]).show();  //暂无相关中介公司
			}
		}
	})
}
