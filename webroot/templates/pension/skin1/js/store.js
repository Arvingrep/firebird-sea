$(function(){
	$("#count").html(totalCount);

	$('.choose span').click(function(){
		$(this).toggleClass('active');

	});

	$('.org_con ul li').hover(function(){
		$(this).addClass('active').siblings().removeClass('active')
		
	})

	//立即预约
	$('.order').click(function(){
		$('.org_mask').show();
		$("#store").val($(this).closest('li').data('id'));
	})
		//表单验证
	$(".org_mask .sure").bind("click", function(){
		var f = $(this);
		var str = '',r = true;
		if(f.hasClass("disabled")) return false;
		// 称呼
		var org_name = $('#org_name');
		var org_namev = $.trim(org_name.val());
		if(org_namev == '') {
			if (r) {
				org_name.focus();
				errmsg(org_name, '请填写您的称呼');
			}
			r = false;
		}
		// 手机号
		var org_phone = $('#org_phone')
		var org_phonev = $.trim(org_phone.val());
		if(org_phonev == '') {
			if (r) {
				org_phone.focus();
				errmsg(org_phone, '请输入手机号码');
			}
			r = false;
		} else {
			var telReg = !!org_phonev.match(/^(13|14|15|17|18)[0-9]{9}$/);
			if(!telReg){
		    if (r) {
		    	org_phone.focus();
		    	errmsg(org_phone,'请输入正确手机号码');
		    }
		    r = false;
			}
		}
		if(!r) {
			return false;
		}		

		var form = $("#yuform"), action = form.attr("action");

		$.ajax({
			url: action,
			data: form.serialize(),
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					$("#org_name").val('');
					$("#org_phone").val('');
					$('.org_mask').hide();
					$('.org_mask2').show();
					f.removeClass("disabled").html(langData['siteConfig'][6][63]);
				}else{
					alert(data.info);
					f.removeClass("disabled").html(langData['siteConfig'][6][63]);
				}
			},
			error: function(){
				alert(langData['siteConfig'][20][183]);
				f.removeClass("disabled").html(langData['siteConfig'][6][63]);
			}
		});

		
	})
	$('.org_mask .close_alert,.org_mask .cancel').click(function(){
		$('.org_mask').hide();
	})

	$('.org_mask2 .close_alert,.org_mask2 .t3').click(function(){
		$('.org_mask2').hide();
	})

	$("#price_sure").bind("click",function () {
        var price1 = $.trim($("#price1").val()), price2 = $.trim($("#price2").val());
        var price = [];
        if(price1 == 0 && price2 == ''){
            return false;
        }
        if(price1 != "" || price2 != ""){
            if(price1 != ""){
                price.push(price1);
            }
            price.push(",");

            if(price2 != ""){
                price.push(price2);
            }
        }

        location.href = priceUrl.replace("pricePlaceholder", price.join(""));
    });



	//数量错误提示
	var errmsgtime;
	function errmsg(div,str){
		$('#errmsg').remove();
		clearTimeout(errmsgtime);
		var top = div.offset().top - 33;
		var left = div.offset().left;

		var msgbox = '<div id="errmsg" style="position:absolute;top:' + top + 'px;left:' + left + 'px;height:30px;line-height:30px;text-align:center;color:#f76120;font-size:14px;display:none;z-index:99999;background:#fff;">' + str + '</div>';
		$('body').append(msgbox);
		$('#errmsg').fadeIn(300);
		errmsgtime = setTimeout(function(){
			$('#errmsg').fadeOut(300, function(){
				$('#errmsg').remove()
			});
		},2000);
	};




})
