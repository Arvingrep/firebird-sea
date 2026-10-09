	var bodyheight = $(window).height();
	//分类弹窗显示
	function showNav() {
		$('body').css({
			overflow: 'hidden',
			height: bodyheight
		})
		$('.nav-container').addClass('active');
		$('.nav-mask').addClass('active');
	}
	//分类弹窗关闭
	function closeNav() {
		$('.nav-container').removeClass('active');
			$('.nav-mask').removeClass('active');
			$('.nav-second li').removeClass('active');
			$('body').css({
				overflow: 'auto',
				height: 'auto'
			})
	}
$(function(){

    toggleDragRefresh('off');  //取消下拉刷新

	$('.nav-mask').click(function () {
		closeNav()
	})
	$('.nav_header .go_back i').click(function () {
		closeNav()
	})
	$('.nav-second>li>p').click(function () {
		var nowtext = $(this).text(), id = $(this).attr('data-id');
		if($(this).next('.nav-third').find('li').length > 0){
			$(this).parents('li').addClass('active');
		}else{
			closeNav();
			$('.classify .text').text(nowtext);
			$(".classify .text").css("color","#45464f");
		}
		$("#typeid").val(id);
	})
	$('.nav-third li>p').click(function () {
		var nowtext = $(this).text(), id = $(this).attr('data-id');
		closeNav();
		$('.classify .text').text(nowtext);
		$("#typeid").val(id);
	})
	$('.nav-third h3 img').click(function () {
		$(this).parents('li').removeClass('active');
	})

	//预约形式
	$('.surep input').click(function(){
        var ordradio = $(this).attr('id');
        if(ordradio == 'free_ord'){
            $('.or_price').hide();
        }else if(ordradio == 'pay_ord'){
            $('.or_price').show();
        }else if(ordradio == 'payall_ord'){
            $('.or_price').show();
        }
    })

	// 信息提示框
    // 错误提示
    function showMsg(str){
      var o = $(".error");
      o.html('<p>'+str+'</p>').show();
      setTimeout(function(){o.hide()},1000);
    }
    //表单验证
    //手机号
    function isPhoneNo(p) {
        var areaCode = parseInt($("#areaCode").val());
        if(areaCode == 86){
            var pattern = /^1[23456789]\d{9}$/;
            return pattern.test(p);
        }
        return true;
    }

	$('.sub_btn').bind('click',function(){
		$('#addrid').val($('.gz-addr-seladdr').attr('data-id'));
		var addrids = $('.gz-addr-seladdr').attr('data-ids').split(' ');
		$('#cityid').val(addrids[0]);
		event.preventDefault();
        var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url"), tj = true;
		var t = $(this),
		classify_choose=$('#typeid').val(),//选择分类
		fabu_jz_title=$('#fabu_jz_title').val(),//标题
		addrid=$('#addrid').val(),//地区
		or_type = $('[name=homemakingtype]:checked').val(),//预约类型
		or_price=$('#or_price').val(),//预约价格
		or_time = $('[name=flag]:checked').val(),//预约时间
		fuwu_detail=$('#fuwu_detail').val(),// 服务详情
		contact_man=$('#contact_man').val(),//联系人
		phone_confirm = $('#phone_confirm').val(),//验证码
		contact=$('#contact').val();//联系电话

		if(t.hasClass("disabled")) return;

		if($('#fileList li.thumbnail').length<=0){
	    	showMsg(langData['homemaking'][5][26]);      //请至少上传一张图片
	    	tj = false;
	    }else if(classify_choose==''){
	    	showMsg(langData['homemaking'][5][27]);      //请选择分类
	    	tj=false;
	    }else if(!fabu_jz_title){
	    	showMsg(langData['homemaking'][5][28]);      //请输入标题
	    	tj=false;
	    }else if(!addrid){
	    	showMsg(langData['homemaking'][5][29]);      //请选择地区
	    	tj=false;
	    }else if(or_type==""){
	    	showMsg(langData['homemaking'][5][30]);      //请选择预约类型
	    	tj=false;
		}else if(or_type!=0 && or_price == ''){
			showMsg(langData['homemaking'][5][31]);      //请填写价格
	    	tj=false;
		}else if(!contact_man){
	    	showMsg(langData['homemaking'][5][34]);		//请填写联系人
	    	tj=false;
	    }else if(!contact){
	    	showMsg(langData['homemaking'][2][50]);		//请填写手机号
	    	tj=false;
	    }else if (isPhoneNo($.trim($('#contact').val())) == false) {
            // showMsg(langData['homemaking'][5][7]);		//手机号码不正确
			// tj=false;
		}
		// }else if($('.test_code').css('display')=='block' && $(".codes").val() == ''){
		// 	showMsg(langData['homemaking'][8][19]);		//手机号码不正确
		// 	tj=false;
		// }

	    if(!tj) return;

		//获取图片的
		var pics = [];
        $("#fileList").find('.thumbnail').each(function(){
            var src = $(this).find('img').attr('data-val');
            pics.push(src);
        });
        $("#pics").val(pics.join(','));

		$('.sub_btn').addClass("disabled").html(langData['siteConfig'][6][35]+"...");	//提交中

	    $.ajax({
	        url: action,
	        data: form.serialize(),
	        type: "POST",
	        dataType: "json",
	        success: function (data) {
	            if(data && data.state == 100){
	            	var tip = langData['siteConfig'][20][341];
					if(id != undefined && id != "" && id != 0){
						tip = langData['siteConfig'][20][229];
					}
					location.href = url;
	            }else{
					showMsg(data.info);
	            	t.removeClass("disabled").html(langData['homemaking'][10][24]);		//立即编辑
	            }
	        },
	        error: function(){
				showMsg(langData['siteConfig'][20][183]);
	            t.removeClass("disabled").html(langData['homemaking'][10][24]);		//立即编辑
	        }
        });

	});



})
