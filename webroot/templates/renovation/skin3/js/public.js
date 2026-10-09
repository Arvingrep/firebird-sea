$(function(){

	$("img").scrollLoading();

	$(".reno3_l ul li:nth-child(2n)").css("margin-right","0");
	$(".deco_li:nth-child(2n)").css("margin-right","0");
	$(".reno4_content  ul li:nth-child(4n)").css("margin-right","0");
	$(".reno8_content ul li:nth-child(5n)").css("margin-right","0");
	
	
	if(typeof (cityid) != 'undefined'){
		location();
		
	}
	// 定位
	function location(force){
		if(site_map=='baidu'){
			HN_Location.baiduMap(function(data){
				if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
					$('.loading').html(''+langData['siteConfig'][27][137]+'').show();
				}else{
					var lng = data.lng, lat = data.lat, name = data.name, page = 1;
					var time = Date.parse(new Date());
					console.log(data)
					$("#addr1 option").each(function(){
						var t = $(this);
						$("#addr1").val(cityid)
						if(data.city.indexOf(t.text()) >-1 || data.district.indexOf(t.text())>-1){
							$("#addr1").val(t.val());
							return false;
						}else{
							return;
						}
					});
					
					$("#addr11 option").each(function(){
						var t = $(this);
						$("#addr11").val(cityid)
						if(data.city.indexOf(t.text()) >-1 || data.district.indexOf(t.text())>-1){
							$("#addr11").val(t.val());
							return false;
						}else{
							return;
						}
					})
				}
			}, force);
		}else if(site_map=='google'){
			HN_Location.googleMap(function(data){
				if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
					$('.loading').html(''+langData['siteConfig'][27][137]+'').show();
				}else{
					var lng = data.lng, lat = data.lat, name = data.name, page = 1;
					var time = Date.parse(new Date());
					console.log(data)
					$("#addr1 option").each(function(){
						var t = $(this);
						$("#addr1").val(cityid)
						if(data.city.indexOf(t.text()) >-1 || data.district.indexOf(t.text())>-1){
							$("#addr1").val(t.val());
							return false;
						}else{
							return;
						}
					});
					
					$("#addr11 option").each(function(){
						var t = $(this);
						$("#addr11").val(cityid)
						if(data.city.indexOf(t.text()) >-1 || data.district.indexOf(t.text())>-1){
							$("#addr11").val(t.val());
							return false;
						}else{
							return;
						}
					})
				}
			}, force);
		}else if(site_map=='amap'){
			HN_Location.amap(function(data){
				if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
					$('.loading').html(''+langData['siteConfig'][27][137]+'').show();
				}else{
					var lng = data.lng, lat = data.lat, name = data.name, page = 1;
					var time = Date.parse(new Date());
					console.log(data)
					$("#addr1 option").each(function(){
						var t = $(this);
						$("#addr1").val(cityid)
						if(data.city.indexOf(t.text()) >-1 || data.district.indexOf(t.text())>-1){
							$("#addr1").val(t.val());
							return false;
						}else{
							return;
						}
					});
					
					$("#addr11 option").each(function(){
						var t = $(this);
						$("#addr11").val(cityid)
						if(data.city.indexOf(t.text()) >-1 || data.district.indexOf(t.text())>-1){
							$("#addr11").val(t.val());
							return false;
						}else{
							return;
						}
					})
				}
			}, force);
		}
	}
	
	
	
	
	


	//免费设计 区域选择
	$("#addr1").change(function(){
		
		var sel = $(this), id = sel.val();
		if(id != 0 && id != ""){
			$.ajax({
				type: "GET",
				url: masterDomain+"/include/ajax.php",
				data: "service=renovation&action=addr&son=0&type="+id,
				dataType: "jsonp",
				success: function(data){
					var i = 0, opt = [];
					if(data instanceof Object && data.state == 100){
					
						for(var key = 0; key < data.info.length; key++){
							opt.push('<option value="'+data.info[key]['id']+'">'+data.info[key]['typename']+'</option>');
							
						}
						
						$("#addr2").html('<option value="">'+langData['renovation'][11][11]+'</option>'+opt.join(""));//街道
                        $("#addr1").removeClass('noSon');
                        setTimeout(function(){
                           $("#addr2").show();
                        },300)
                       
                        
						
					}else{
                        $("#addr2").hide();
                        $("#addr1").addClass('noSon');
					}
				},
				error: function(msg){
					alert(msg.status+":"+msg.statusText);
				}
			});
		}else{
          	$("#addr2").hide();
           $("#addr1").addClass('noSon');

		}
	});
	//装修报价 区域选择
	$("#addr11").change(function(){
		var sel = $(this), id = sel.val();
		if(id != 0 && id != ""){
			$.ajax({
				type: "GET",
				url: masterDomain+"/include/ajax.php",
				data: "service=renovation&action=addr&son=0&type="+id,
				dataType: "jsonp",
				success: function(data){
					var i = 0, opt = [];
					if(data instanceof Object && data.state == 100){
						for(var key = 0; key < data.info.length; key++){
							opt.push('<option value="'+data.info[key]['id']+'">'+data.info[key]['typename']+'</option>');
						}
						$("#addr22").html('<option value="">'+langData['renovation'][11][11]+'</option>'+opt.join(""));//街道
                      	$("#addr11").removeClass('noSon');
                        setTimeout(function(){
                           $("#addr22").show();
                        },300)
					}else{
						$("#addr22").hide();
                        $("#addr11").addClass('noSon');
					}
				},
				error: function(msg){
					alert(msg.status+":"+msg.statusText);
				}
			});
		}else{
			$("#addr22").hide();
           $("#addr11").addClass('noSon');
		}
	});

	// 区域选择3
	$("#addr111").change(function(){
		var sel = $(this), id = sel.val();
		if(id != 0 && id != ""){
			$.ajax({
				type: "GET",
				url: masterDomain+"/include/ajax.php",
				data: "service=renovation&action=addr&son=0&type="+id,
				dataType: "jsonp",
				success: function(data){
					var i = 0, opt = [];
					if(data instanceof Object && data.state == 100){
						for(var key = 0; key < data.info.length; key++){
							opt.push('<option value="'+data.info[key]['id']+'">'+data.info[key]['typename']+'</option>');
						}
						$("#addr222").html('<option value="">'+langData['renovation'][11][11]+'</option>'+opt.join(""));//街道
                      $("#addr111").removeClass('noSon');
                        setTimeout(function(){
                           $("#addr222").show();
                        },300)
					}else{
						$("#addr222").hide();
                        $("#addr111").addClass('noSon');
					}
				},
				error: function(msg){
					alert(msg.status+":"+msg.statusText);
				}
			});
		}else{
			$("#addr222").hide();
            $("#addr111").addClass('noSon');
		}
	});


	//提交立即预约
	$(".design_content #design_submit").bind("click", function(){
		var f = $(this);
		var txt = f.text();
		var str = '',r = true;
		if(f.hasClass("disabled")) return false;
		var par = f.closest('.formCommon').find('form');
		var areaCodev = $.trim(par.find('.areaCodeinp').val());
		// 称呼
		var name = $('#price_name');
		var namev = $.trim(name.val());
		// if(namev == '') {
		// 	if (r) {
		// 		name.focus();
		// 		errmsg(name, langData['renovation'][14][45]);//请填写您的称呼
		// 	}
		// 	r = false;
		// }
		// 手机号
		var phone = $('#price_phone')
		var phonev = $.trim(phone.val());
		if(phonev == '') {
			if (r) {
				phone.focus();
				errmsg(phone, langData['renovation'][15][83]);// 请输入手机号码，输入号码免费
			}
			r = false;
		}
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
      	// if(!$('#addr1').hasClass('noSon')){ 
       //    if(addr2.val() == 0 || addr2.val() == "") {
       //        if (r) {
       //            errmsg(addr2, langData['renovation'][14][48]);//请选择街道
       //        }
       //        r = false;
       //    }
       //  }
		// 小区
		var origin = $('#price_origin');
		var originv = $.trim(origin.val());
		// if(originv == '') {
		// 	if (r) {
		// 		origin.focus();
		// 		errmsg(origin, langData['renovation'][1][5]);//请填写您的小区
		// 	}
		// 	r = false;
		// }

		if(!r) {
			return false;
		}		

		var type = $(this).attr("data-type");
		var bid  = $(this).attr("data-id");
		f.addClass("disabled").text(langData['renovation'][14][58]);//预约中...
		var data = [];
		data.push("community="+originv);
		data.push("people="+namev);
		data.push("bid="+bid);
		if(type ==0){
			data.push("company ="+bid);
		}
		data.push("areaCode="+areaCodev);
		data.push("contact="+phonev);
		data.push("type="+type);
		data.push("contact="+phonev);
        if(!$('#addr1').hasClass('noSon')){ 
          data.push("addrid="+addr2.val());
        }else{
          data.push("addrid="+addr1.val());
        }

		$.ajax({
			url: "/include/ajax.php?service=renovation&action=sendRese",
			data: data.join("&"),
			type: "POST",
			dataType: "jsonp",
			success: function (data) {
				f.removeClass("disabled").text(txt);//立即预约免费设计
				if(data && data.state == 100){
					$('.order_mask').show()
					
				}else{
					alert(data.info);
				}
			},
			error: function(){
				alert(langData['renovation'][14][87]);//申请失败，请重试！
				f.removeClass("disabled").text(txt);//立即预约免费设计
			}
		});
	});

	//首页提交免费设计
	$(".indexDesign #design_submit").bind("click", function(){
		var f = $(this);
		var txt = f.text();
		var str = '',r = true;
		if(f.hasClass("disabled")) return false;
		var par = f.closest('.formCommon').find('form');
		var areaCodev = $.trim(par.find('.areaCodeinp').val());
		// 称呼
		var name = $('#price_name');
		var namev = $.trim(name.val());
		// if(namev == '') {
		// 	if (r) {
		// 		name.focus();
		// 		errmsg(name, langData['renovation'][14][45]);//请填写您的称呼
		// 	}
		// 	r = false;
		// }
		// 手机号
		var phone = $('#price_phone')
		var phonev = $.trim(phone.val());
		if(phonev == '') {
			if (r) {
				phone.focus();
				errmsg(phone, langData['renovation'][15][83]);// 请输入手机号码，输入号码免费
			}
			r = false;
		}
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
      	// if(!$('#addr1').hasClass('noSon')){ 
       //    if(addr2.val() == 0 || addr2.val() == "") {
       //        if (r) {
       //            errmsg(addr2, langData['renovation'][14][48]);//请选择街道
       //        }
       //        r = false;
       //    }
       //  }
		// 小区
		var origin = $('#price_origin');
		var originv = $.trim(origin.val());
		// if(originv == '') {
		// 	if (r) {
		// 		origin.focus();
		// 		errmsg(origin, langData['renovation'][1][5]);//请填写您的小区
		// 	}
		// 	r = false;
		// }

		if(!r) {
			return false;
		}		

		f.addClass("disabled").text(langData['renovation'][14][58]);//预约中...

		var data = [];
		data.push("community="+originv);
		data.push("people="+namev);
		data.push("areaCode="+areaCodev);
		data.push("contact="+phonev);
        if(!$('#addr1').hasClass('noSon')){ 
          	data.push("addrid="+addr2.val());
        }else{
			data.push("addrid="+addr1.val());
        }
		$.ajax({
			url: "/include/ajax.php?service=renovation&action=sendEntrust",
			data: data.join("&"),
			type: "POST",
			dataType: "jsonp",
			success: function (data) {
				f.removeClass("disabled").text(txt);//立即预约免费设计
				if(data && data.state == 100){
					$('.order_mask').show()
					
				}else{
					alert(data.info);
				}
			},
			error: function(){
				alert(langData['renovation'][14][87]);//申请失败，请重试！
				f.removeClass("disabled").text(txt);//立即预约免费设计
			}
		});
	});

	//关闭设计弹窗
	$(".order_mask .close_alert").bind("click", function(){
			$('.order_mask').hide()
	})
	$(".order_mask .t3").bind("click", function(){
			$('.order_mask').hide()
	})

	//提交获取报价
	$(".dcontent #price_submit").bind("click", function(){
		var f = $(this);
		var txt = f.text();
		var str = '',r = true;
		if(f.hasClass("disabled")) return false;
		var par = f.closest('.formCommon').find('form');
		var areaCodev = $.trim(par.find('.areaCodeinp').val());
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

		// 户型
		var house_type = $('#house_type');
		// if(house_type.val() == 0 || house_type.val() == "") {
		// 	if (r) {
		// 		errmsg(house_type, langData['renovation'][4][33]);//请选择户型
		// 	}
		// 	r = false;
		// }
		

		// 称呼
		var house_name = $('#house_name');
		var house_namev = $.trim(house_name.val());
		// if(house_namev == '') {
		// 	if (r) {
		// 		house_name.focus();
		// 		errmsg(house_name, langData['renovation'][14][45]);//请填写您的称呼
		// 	}
		// 	r = false;
		// }
		// 手机号
		var house_phone = $('#house_phone')
		var house_phonev = $.trim(house_phone.val());
		if(house_phonev == '') {
			if (r) {
				house_phone.focus();
				errmsg(house_phone, langData['renovation'][15][83]);// 请输入手机号码，输入号码免费
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
		data.push("people="+house_namev);
		data.push("areaCode="+areaCodev);
		data.push("contact="+house_phonev);
        if(!$('#addr11').hasClass('noSon')){ 
          	data.push("addrid="+addr22.val());
        }else{
 			data.push("addrid="+addr11.val());
        }
		data.push("resetype=1");

		$.ajax({
			url: "/include/ajax.php?service=renovation&action=sendRese",
			data: data.join("&"),
			type: "POST",
			dataType: "jsonp",
			success: function (data) {
				f.removeClass("disabled").text(txt);//10秒快速获取报价
				if(data && data.state == 100){//要返回价格回来
					$('.price_mask').show();
					
				}else{
					alert(data.info);
				}
			},
			error: function(){
				alert(langData['renovation'][14][88]);//获取失败，请重试！
				f.removeClass("disabled").text(txt);//10秒快速获取报价
			}
		});

	});

	//关闭报价弹窗
	$(".price_mask .close_alert").bind("click", function(){
			$('.price_mask').hide();

	})
	$(".price_mask .t3").bind("click", function(){
			$('.price_mask').hide()
	})
		    //收藏
	$(".store-btn").bind("click", function(){
		var t = $(this), type = "add", oper = "+1", txt = "已收藏";

		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			huoniao.login();
			return false;
		}

		if(!t.hasClass("curr")){
			t.addClass("curr");
		}else{
			type = "del";
			t.removeClass("curr");
			oper = "-1";
			txt = "收藏";
		}

		var $i = $("<b>").text(oper);
		var x = t.offset().left, y = t.offset().top;
		$i.css({top: y - 10, left: x + 17, position: "absolute", "z-index": "10000", color: "#E94F06"});
		$("body").append($i);
		$i.animate({top: y - 50, opacity: 0, "font-size": "2em"}, 800, function(){
			$i.remove();
		});

		t.children('button').html("<em></em><i></i>"+txt);

		$.post("/include/ajax.php?service=member&action=collect&module=renovation&temp="+collectType+"&type="+type+"&id="+detailId);

	});


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
