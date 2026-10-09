$(function(){
	

	//textarea 高度自适应 没有滚动条的实现
	$('textarea').each(function () {
        this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
    }).on('input', function () {
      this.style.height = '50px';
      this.style.height = (this.scrollHeight) + 'px';
    });

    	$('.info_con ul li').hover(function(){
		$(this).addClass('active').siblings().removeClass('active')
		
	})

	//列表页可预约
	$('.can_visit').click(function(){
		$('.info_mask').css('visibility','visible');
		$("#elderly").val($(this).closest('li').data('id'));
		$(".info_con .info_inp .tip").html('尊敬的'+$(this).closest('li').data('name')+'，您好：');
	})
	//列表页预约权限
	$('.no_visit').click(function(){
		$('.info_mask2').show();
	})

	//详情页立即预约
	$('.invite').click(function(){
		if($(this).data('id')==1){
			$('.info_mask').css('visibility','visible');
		}else{
			$('.info_mask2').show();
		}
		
	})
	//详情页查看联系方式
	$('.contact').click(function(){
      	if($(this).data('id')==1){
          $('.contact_mask').show();
        }else{
          $('.info_mask2').show();
        }
		
	})
	$('.contact_mask .close_alert').click(function(){
		$('.contact_mask').hide();
	})

		//表单验证
	$(".info_mask .sure").bind("click", function(){
		var f = $(this);
		var str = '',r = true;
		if(f.hasClass("disabled")) return false;
		// 称呼
		var info_name = $('#info_name');
		var info_namev = $.trim(info_name.val());
		if(info_namev == '') {
			if (r) {
				info_name.focus();
				errmsg(info_name, '请填写您的称呼');
			}
			r = false;
		}
		// 手机号
		var info_phone = $('#info_phone')
		var info_phonev = $.trim(info_phone.val());
		if(info_phonev == '') {
			if (r) {
				info_phone.focus();
				errmsg(info_phone, '请输入手机号码');
			}
			r = false;
		} else {
			var telReg = !!info_phonev.match(/^(13|14|15|17|18)[0-9]{9}$/);
			if(!telReg){
		    if (r) {
		    	info_phone.focus();
		    	errmsg(info_phone,'请输入正确手机号码');
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
					$('.info_mask').css('visibility','hidden');
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
	$('.info_mask .close_alert,.info_mask .cancel').click(function(){
		$('.info_mask').css('visibility','hidden');
	})

	$('.info_mask2 .close_alert').click(function(){
		$('.info_mask2').hide();
	})
	$('.info_mask2 .t3').click(function(){
		
		$('.info_mask2').hide();
	})
	$('.org_mask2 .close_alert,.org_mask2 .t3').click(function(){
		$('.org_mask2').hide();
	})


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

	
	$("#price_sure2").bind("click",function () {
        var price1 = $.trim($("#price11").val()), price2 = $.trim($("#price22").val());
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

        location.href = priceUrl.replace("rzmaxprice", price.join(""));
	});
	
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

        location.href = priceUrl1.replace("monthmaxprice", price.join(""));
    });




})
