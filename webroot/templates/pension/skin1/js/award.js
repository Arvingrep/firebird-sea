$(function(){
	//选择居住类型 更改tip提示
	$("#choose_type").change(function(){

		var i = $(this).val();
		$(".type_div .type_tip").eq(i).addClass("type_show").siblings().removeClass("type_show");

		

	})

	//提交申请
	$('.apply').click(function(){
		var f = $(this);
		var str = '',r = true;
		if(f.hasClass("disabled")) return false;
		// 选择居住类型
		var choose_type = $('#choose_type');
		if(choose_type.val() == 0 || choose_type.val() == "") {
			if (r) {
				errmsg(choose_type, '选择居住类型');	
				//滚动条滚动到对应位置		
				var x=choose_type.offset().top - 100;
				$("body,html").scrollTop(x);
			}
			r = false;
		}
		if(!r) {
			return false;
		}

		var form = $("#awardForm"), action = form.attr("action");

		$.ajax({
			url: action,
			data: form.serialize(),
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					$('.award_mask').show();
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




	//弹窗关闭
	$('.award_mask .close_alert').click(function(){
		$('.award_mask').hide();
	})
	$('.award_mask .t3').click(function(){
		location.href = channelDomain+"/index.html"; //立即查看 链接应为 到后台去看积分
	})

	//错误提示
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
