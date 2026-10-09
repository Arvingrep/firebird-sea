$(function () {
	//获取url的参数
	function getParam(paramName) {
	    paramValue = "", isFound = !1;
	    if (this.location.search.indexOf("?") == 0 && this.location.search.indexOf("=") > 1) {
	        arrSource = unescape(this.location.search).substring(1, this.location.search.length).split("&"), i = 0;
	        while (i < arrSource.length && !isFound) arrSource[i].indexOf("=") > 0 && arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() && (paramValue = arrSource[i].split("=")[1], isFound = !0), i++
	    }
	    return paramValue == "" && (paramValue = null), paramValue
	}

	var aid = getParam('id');
	var hid = getParam('hid');
	
	var page = 1, isload = 0;
	if(pageType == 'hdlist'){
		gethdList();

		// 下拉加载
		$(window).scroll(function() {
			// var h = $('.myitem').height();
			var allh = $('body').height();
			var w = $(window).height();
			var scroll = allh - w - 50;
			if ($(window).scrollTop() > scroll && !isload) {
				gethdList();
			};
		});
	}else{
		//国际手机号获取
	    getNationalPhone();
	    function getNationalPhone(){
	        $.ajax({
	            url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
	            type: 'get',
	            dataType: 'jsonp',
	            success: function(data){
	                if(data && data.state == 100){
	                   var phoneList = [], list = data.info;
	                   for(var i=0; i<list.length; i++){
	                        phoneList.push('<li><span>'+list[i].name+'</span><em class="fn-right">+'+list[i].code+'</em></li>');
	                   }
	                   $('.layer_list ul').append(phoneList.join(''));
	                }else{
	                   $('.layer_list ul').html('<div class="loading">暂无数据！</div>');
	                  }
	            },
	            error: function(){
	                        $('.layer_list ul').html('<div class="loading">加载失败！</div>');
	                    }

	        })
	    }
	}

	// 打开手机号地区弹出层
    $(".areacode_span").click(function(){
        $('.layer_code').show();
        $('.mask-code').addClass('show');
    })
    // 选中区域
    $('.layer_list').delegate('li','click',function(){
        var t = $(this), txt = t.find('em').text();
        console.log(txt)
        $(".areacode_span label").text(txt);
        $("#areaCode").val(txt.replace("+",""));

        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function(){
        $('.layer_code, #popupReg-captcha-mobile').hide();
        $('.mask-code').removeClass('show');
    })
	//提交订阅信息
	$("body").delegate(".btn button", "click", function(){
		var type =[3],t = $(this), obj = $(".main_type"), btnhtml = t.html();

		if(t.hasClass("disabled")) return false;

		var name = obj.find(".contact_name");
		var phone = obj.find(".contact_phone");
		var vercode = obj.find(".contact_yzm");
		var areaCode = $("#areaCode")
		// var xy = obj.find(".xy");
		// var huodongid     = obj.find("#huodongid");

		if(name.val() == "" || name.val() == name.attr("placeholder")){
			errMsg = "请输入您的姓名";
			showErrAlert(errMsg);
			return false;
		}else if(phone.val() == "" || phone.val() == phone.attr("placeholder")){
			errMsg = "请输入您的手机号码";
			showErrAlert(errMsg);
			return false;
		}else if(!/(13|14|15|17|18)[0-9]{9}/.test($.trim(phone.val()))){
			errMsg = "手机号码格式错误，请重新输入！";
			showErrAlert(errMsg);
			return false;
		}else if(vercode.val() == "" || vercode.val() == vercode.attr("placeholder")){
			errMsg = "请输入验证码";
			showErrAlert(errMsg);
			return false;
		}

		// if(!xy.hasClass("checked")){
		// 	errMsg = "请先同意[免责协议]";
		// 	showMsg(errMsg);
		// 	return false;
		// }
		t.addClass("disabled").html("提交中...");

		var sex = $('[name="sex"]:checked').val();

		var data = [];
		data.push("act=loupan");
		data.push("aid="+aid);
		data.push("type="+type.join(","));
		data.push("name="+name.val());
		data.push("phone="+phone.val());
		// data.push("sex="+sex);
		data.push("hid="+hid);
		data.push("vercode="+vercode.val());
		data = data.join("&");

		$.ajax({
			url: "/include/ajax.php?service=house&action=subscribe",
			data: data,
			dataType: "JSON",
			success: function(data){
				console.log(typeof(data))

				if(data && data.indexOf('100')>-1){
					t.removeClass("disabled").html("报名成功");
					showErrAlert('报名成功');
					var device = navigator.userAgent;
					if(device.indexOf('huoniao_iOS') <= -1){
						window.location.href = channelDomain+'/loupan-detail-26.html';
					}
					// else{
					// 	 setupWebViewJavascriptBridge(function(bridge) {
					// 	 	bridge.callHandler('pageClose',	{},	function(responseData){});
    	// 				 });
					// }
				}else{
					t.removeClass("disabled").html(btnhtml);
					showErrAlert(data.info);
				}
			},
			error: function(){
				t.removeClass("disabled").html(btnhtml);
				alert("网络错误，请稍候重试！");
			}
		})

	});

	function gethdList(){
		if(isload) return false;
		isload = true;
		$(".loading").remove();
		$(".huodong").append('<div class="loading">加载中~</div>')
		var now = (new Date()).valueOf();
		$.ajax({
			url: "/include/ajax.php?service=house&action=loupanHuodongList&nomanage=1&pageSize=15&page="+page+"&loupanid="+aid,
			type: "GET",	
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					var list = data.info.list;
					var totalCount = data.info.pageInfo.totalCount
					var html = [];
					for(var i =0; i<list.length; i++){
						var etime = (new Date(list[i].etime)).valueOf()
						var cls = now > etime?'noClick':'';

						html.push('<div class="hd '+cls+'">');
						html.push('<div class="left_img fn-left">');
						if(list[i].litpic){
							html.push('<img src="'+masterDomain+'/include/attachment.php?f='+list[i].litpic+'" alt="'+list[i].title+'" onerror="javascript:this.src=\''+templets_skin+'images/default_hd.png\';">');
						}else{
							html.push('<img src="'+templets_skin+'images/default_hd.png" alt="'+list[i].title+'">');
						}
						html.push('</div>');
						html.push('<div class="right_detail">');
						html.push('<h4>'+list[i].title+'</h4>');
						html.push('<p class="time" data-etime="'+etime+'">剩余<em>0</em>天<em>0</em>小时<em>00</em>分<em>00</em>秒</p>');
						html.push('<p class="bm_count"><em>'+list[i].huodongmember+'</em>人已报名</p>');
						if(now>etime){
							html.push('<a href="javascript:;" data-id="'+list[i].id+'" data-type="huodong" class="bm disabled">活动已过期</a>');
						}else{

							html.push('<a href="'+channelDomain+'/baom.html?id='+aid+'&hid='+list[i].id+'" data-id="'+list[i].id+'" data-type="huodong" class="bm">立即报名</a>');
						}
					
						html.push('</div></div>');
					}

					$(".loading").remove();
					$(".huodong").append(html.join(''));
					$('.huodong .hd').each(function(){
						var t = $(this);
						cutTimeNew(t)
					})
					$(".huodong").append('<div class="loading">下拉加载更多~</div>')
					page++;
					isload = false;
					if(page > data.info.pageInfo.totalPage){
						isload = true;
						$(".loading").remove();
						$(".huodong").append('<div class="loading">没有更多了~</div>')
					}
				}else{
					$(".loading").remove();
						$(".huodong").append('<div class="loading">'+data.info+'</div>')
				}
			},
		})

	}
})





function cutTimeNew(el){
      var content = el.find('.right_detail');
      var endtime = content.find('.time').attr('data-etime');
      var timer = setInterval(function(){
           var now = (new Date()).valueOf();
           var time = parseInt(endtime/1000) - parseInt(now/1000);
           time = time > 0 ? time : 0;
           var d = parseInt(time / (60 * 60 * 24));
           var h = parseInt(time / 60 / 60 % 24);
           var m = parseInt(time / 60 % 60);
           var s = parseInt(time % 60);
           var html = '剩余'+d+'天'+h+'小时'+(m>9?m:'0'+m)+'分钟'+(s>9?s:'0'+s)+'秒';
           el.find('.time').html(html)
            if(time == 0) {
              clearInterval(timer)
            }
          },1000)

    }