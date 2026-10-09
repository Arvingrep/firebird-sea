$(function(){

	//关闭弹窗
    $('.order_container2 .close_alert').click(function(){
    	$('.order_mask2').hide();
    })



    //提交预约参观
	$(".order_mask2 .submit").bind("click", function(){
		var f = $(this);
		var str = '',r = true;
		var txt = f.text();
		if(f.hasClass("disabled")) return false;
		var par = f.closest('.formCommon').find('form');
		var areaCodev = $.trim(par.find('.areaCodeinp').val());

		// 称呼
		var name 	= $('#name');
		var namev 	= $.trim(name.val());
		var conid 	= $('#conid').val(); 
		if(namev == '') {
			if (r) {
				name.focus();
				errmsg(name, langData['renovation'][14][45]);//请填写您的称呼
			}
			r = false;
		}
		// 手机号
		var phone = $('#phone')
		var phonev = $.trim(phone.val());
		if(phonev == '') {
			if (r) {
				phone.focus();
				errmsg(phone, langData['renovation'][12][0]);// 请输入手机号码
			}
			r = false;
		}

		if(!r) {
			return false;
		}	
		f.addClass("disabled").text(langData['renovation'][14][58]);//预约中...
		var site = par.find('.home_tit').text();
		var houseType = par.find('.home').text();
		var houseArea = par.find('.home_area').text();
		// var conid = par.find('.visit').attr("data-id");
		// alert(conid);
		var data = [];
		data.push("conid="+conid);
		data.push("people="+namev);
		data.push("areaCode="+areaCodev);
		data.push("contact="+phonev);

		$.ajax({
			url: "/include/ajax.php?service=renovation&action=sendConstruction",
			data: data.join("&"),
			type: "POST",
			dataType: "jsonp",
			success: function (data) {
				f.removeClass("disabled").text(txt);//
				if(data && data.state == 100){
					$('.order_mask2').hide()
					$('.order_mask').show()
					
				}else{
					alert(data.info);
				}
			},
			error: function(){
				alert(langData['renovation'][14][90]);//预约失败，请重试！
				f.removeClass("disabled").text(txt);//
			}
		});		
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
