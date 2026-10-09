$(function(){
	$(".build_con ul li:nth-child(5n)").css("margin-right","0");
	$(".honor_content ul li:nth-child(3n)").css("margin-right","0");

	//装修案例 效果图切换
	$('.design_tab li').click(function(){
        $(this).addClass('active').siblings().removeClass('active');
        var i = $(this).index();
        $('.lr_profile .pro_content').eq(i).addClass('des_show').siblings().removeClass('des_show');
    });
	//免费设计 在线报切换
    $('.free_tab li').click(function(){
        $(this).addClass('active').siblings().removeClass('active');
        var i = $(this).index();
        $('.design_content .con').eq(i).addClass('con_show').siblings().removeClass('con_show');
    });

    //提交获取报价
	$(".design_content #submit_price").bind("click", function(){
		var f = $(this);
		var str = '',r = true;
		if(f.hasClass("disabled")) return false;
		var par = f.closest('.formCommon').find('form');
		var areaCodev = $.trim(par.find('.areaCodeinp').val());
		// 区域
		var addr1 = $('#addr1');
		if(addr1.val() == 0 || addr1.val() == "") {
			if (r) {
				errmsg(addr1, langData['renovation'][14][47]);//请选择区域
			}
			r = false;
		}
		// 街道
		var addr2 = $('#addr2');
      	// if(!$('#addr1').hasClass('noSon')){//没有二级区域时
       //    if(addr2.val() == 0 || addr2.val() == "") {
       //        if (r) {
       //            errmsg(addr2, langData['renovation'][14][48]);//请选择街道
       //        }
       //        r = false;
       //    }
       //  }
		// 户型
		var house_type = $('#house_type');
		// if(house_type.val() == 0 || house_type.val() == "") {
		// 	if (r) {
		// 		errmsg(house_type, langData['renovation'][4][33]);//请选择户型
		// 	}
		// 	r = false;
		// }
		// 面积
		var house_area = $('#house_area');
		var house_areav = $.trim(house_area.val());
		// if(house_areav == '') {
		// 	if (r) {
		// 		house_area.focus();
		// 		errmsg(house_area, langData['renovation'][9][28]);//请输入面积
		// 	}
		// 	r = false;
		// }		

		// 称呼
		var price_name = $('#price_name');
		var price_namev = $.trim(price_name.val());
		// if(price_namev == '') {
		// 	if (r) {
		// 		price_name.focus();
		// 		errmsg(price_name, langData['renovation'][14][45]);//请填写您的称呼
		// 	}
		// 	r = false;
		// }
		// 手机号
		var price_phone = $('#price_phone')
		var price_phonev = $.trim(price_phone.val());
		if(price_phonev == '') {
			if (r) {
				price_phone.focus();
				errmsg(price_phone, langData['renovation'][12][0]);// 请输入手机号码
			}
			r = false;
		}
		if(!r) {
			return false;
		}		

		f.addClass("disabled").text(langData['renovation'][14][49]);//正在获取，请稍后

		var data = [];
		data.push("units="+house_type.val());
		data.push("are="+house_areav);
		data.push("people="+price_namev);
		data.push("areaCode="+areaCodev);
		data.push("contact="+price_phonev);
		data.push("bid="+id);
		data.push("type=0");
      	if(!$('#addr1').hasClass('noSon')){
			data.push("addrid="+addr2.val());
        }else{
          	data.push("addrid="+addr1.val());
        }
		data.push("resetype=1");

		$.ajax({
			url: "/include/ajax.php?service=renovation&action=sendRese",
			data: data.join("&"),
			type: "POST",
			dataType: "jsonp",
			success: function (data) {
				f.removeClass("disabled").text(langData['renovation'][0][18]);//立即获取报价
				if(data && data.state == 100){//要返回价格回来
					$('.price_mask').show();
					
				}else{
					alert(data.info);
				}
			},
			error: function(){
				alert(langData['renovation'][14][88]);//获取失败，请重试！
				f.removeClass("disabled").text(langData['renovation'][0][18]);//立即获取报价
			}
		});
	})    	
	//提交预约
	$(".design_content #submit_design").bind("click", function(){
		var f = $(this);
		var str = '',r = true;
		if(f.hasClass("disabled")) return false;
		var par = f.closest('.formCommon').find('form');
		var areaCodev = $.trim(par.find('.areaCodeinp').val());
		// 称呼
		var order_name = $('#order_name');
		var order_namev = $.trim(order_name.val());
		// if(order_namev == '') {
		// 	if (r) {
		// 		order_name.focus();
		// 		errmsg(order_name, langData['renovation'][14][45]);//请填写您的称呼
		// 	}
		// 	r = false;
		// }
		// 手机号
		var order_phone = $('#order_phone')
		var order_phonev = $.trim(order_phone.val());
		if(order_phonev == '') {
			if (r) {
				order_phone.focus();
				errmsg(order_phone, langData['renovation'][12][0]);// 请输入手机号码
			}
			r = false;
		} 
		// 区域
		var addr11 = $('#addr11');
		if(addr11.val() == 0 || addr11.val() == "") {
			if (r) {
				errmsg(addr11, langData['renovation'][14][47]);//请选择区域
			}
			r = false;
		}
		// 街道
		var addr22 = $('#addr22');
        // if(!$('#addr11').hasClass('noSon')){ 
        //   if(addr22.val() == 0 || addr22.val() == "") {
        //       if (r) {
        //           errmsg(addr22, langData['renovation'][14][48]);//请选择街道
        //       }
        //       r = false;
        //   }
        // }
		// 小区
		var price_origin = $('#price_origin');
		var price_originv = $.trim(price_origin.val());
		// if(price_originv == '') {
		// 	if (r) {
		// 		price_origin.focus();
		// 		errmsg(price_origin, langData['renovation'][1][5]);//请填写您的小区
		// 	}
		// 	r = false;
		// }

		

		if(!r) {
			return false;
		}		
		var company = $(this).attr("data-id");
		f.addClass("disabled").text(langData['renovation'][14][58]);//预约中...
		var data = [];
		data.push("community="+price_originv);
		data.push("people="+order_namev);
		data.push("company="+company);
		data.push("bid="+company);
		data.push("areaCode="+areaCodev);
		data.push("contact="+order_phonev);
       	if(!$('#addr11').hasClass('noSon')){ 
			data.push("addrid="+addr22.val());
        }else{
            data.push("addrid="+addr11.val());
        }
		data.push("type=0");
		

		$.ajax({
			url: "/include/ajax.php?service=renovation&action=sendRese",
			data: data.join("&"),
			type: "POST",
			dataType: "jsonp",
			success: function (data) {
				f.removeClass("disabled").text(langData['renovation'][0][20]);//立即预约
				if(data && data.state == 100){
					$('.order_mask').show()
					
				}else{
					alert(data.info);
				}
			},
			error: function(){
				alert(langData['renovation'][14][87]);//申请失败，请重试！
				f.removeClass("disabled").text(langData['renovation'][0][20]);//立即预约
			}
		});
	})

	//设计师工长 立即预约
	$('.go_order').click(function(){
		$('.team_mask').show();
		var team_man=$(this).parents('.content').find('.name a').text();
		$('.team_man').text(team_man);
		$("#userid").val($(this).attr("data-id"));
		$("#type").val($(this).attr("data-type"));
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



})
