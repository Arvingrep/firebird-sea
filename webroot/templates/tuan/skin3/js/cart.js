$(function(){

	var cartData = $.cookie(cookiePre+"tuan_cart");

	$(".error-tips .close").bind("click", function(){
		$(".error-tips").hide();
	});

	//数量增加、减少
	$(".counter button").bind("click", function(){
		var t = $(this), type = t.attr("class"), inp = t.siblings("input"), val = Number(inp.val());

		//减少
		if(type == "minus"){
			inp.val(val-1);
			checkCount(t.closest("tr"));

		//增加
		}else if(type == "add"){
			inp.val(val+1);
			checkCount(t.closest("tr"));

		}
	});

	$(".counter input").bind("blur", function(){
		checkCount($(this).closest("tr"));
	});


	checkTotal()
	//验证数量
	function checkCount(t){
		var count = t.find(".counter input"), val = Number(count.val()), tips = $(".error-tips"), freight = 0,
				maxCount = t.data("max"), price = t.data("price"), type = t.data("type");

		//最小
		if(val < 1){
			count.val(1);
			val = 1;
			tips.find("p span").html("您最少需要购买 1 件");
			tips.show();

		//最大
		}else if(val > maxCount){
			count.val(maxCount);
			val = maxCount;
			tips.find("p span").html("每人最多只能购买 "+maxCount+" 单");
			tips.show();

		}else{
			tips.hide();

			if(type == 2){
				var freeshi = t.data("freeshi");
				if(val <= freeshi){
					freight = t.data("freight");

					t.find(".total .del").html("含运费 "+freight);
				}else{
					t.find(".total .del").html("免运费");
				}

			}

		}

		t.find(".total strong").html((price * val + freight).toFixed(2));

		checkTotal();

		//同步更新购物车数量
		cartlist.find("li[data-id="+t.attr("data-id")+"]").attr("data-count", val);
		tuanInit.update();

	}

	//计算总额
	function checkTotal(){
		var price = 0;
		$(".section tbody tr").each(function(){
			var t = $(this);
			if(t.find("input[type=checkbox]").attr("checked") == "checked" || t.find("input[type=checkbox]").attr("checked") == true){
				var count = t.find(".counter input").val(), pri = t.data("price"), freight = 0, type = t.data("type");

				if(type == 2){
					var freeshi = t.data("freeshi");
					if(count <= freeshi){
						freight = t.data("freight");
					}
				}

				price += count * pri + freight;
			}
		});

		jifen_di = parseInt(jifen_ * price  * pointRatio /100);
		jifen_di = hasPoint <= jifen_di ? hasPoint : jifen_di;
		jian = parseFloat((jifen_di/pointRatio).toFixed(2));
		$(".integral .jifen").html(jifen_di) ;
		$(".integral .jian").html(jian) ;
		$(".integral .amount_jian span").html(jian) ;
		if($(".integral .gou").hasClass('hasgou')){
			$("#totalPrice").html(echoCurrency('symbol')+(price-jian).toFixed(2));
		}else{
			$("#totalPrice").html(echoCurrency('symbol')+price.toFixed(2));
		}

		if(jifen_di == 0 || jian == 0){
	  		$(".integral").hide()
	  	}

	  	if((price-jian).toFixed(2) == 0){
			$("#submit").html(langData['siteConfig'][23][113]); //立即支付
		}
		
		var totalLength = $(".section tbody input[type=checkbox]:checked").length;
		$(".total-fee .amount strong").html(totalLength);



		totalLength <= 0 || price <= 0 ? $("#submit").addClass("disabled") : $("#submit").removeClass("disabled");
	}

	//全选
	$("#selectAll").bind("click", function(){
		if($(this).attr("checked") == true || $(this).attr("checked") == "checked"){
			$(".section tbody input[type=checkbox]").attr("checked", true);
		}else{
			$(".section tbody input[type=checkbox]").attr("checked", false);
		}
		checkTotal();
	});

	// 是否积分抵扣
	$(".integral .gou").click(function(){
		var t = $(this);
		t.toggleClass('hasgou');
		if(t.hasClass('hasgou')){
			$("#if_jifen").val(1)
		}else{
			$("#if_jifen").val(0)
		}
			checkTotal();
	})

	//单选
	$(".section tbody input[type=checkbox]").bind("click", function(){
		if($(this).attr("checked") == true || $(this).attr("checked") == "checked"){
			var total = $(".section tbody input[type=checkbox]").length, checked = $(".section tbody input[type=checkbox]:checked").length;
			if(total == checked){
				$("#selectAll").attr("checked", true);
			}
		}else{
			$("#selectAll").attr("checked", false);
		}
		checkTotal();
	});

	//删除购物车内容
	$(".section .delete").bind("click", function(){
		if(!confirm("确定删除该商品吗？")) return false;

		var tr = $(this).closest('tr'), id = tr.attr('data-id');
		cartlist.find("li[data-id="+id+"]").remove();
		tuanInit.update();

		tr.fadeOut(500, function(){
			tr.remove();
			checkTotal();

			var dizhi = 0;
			$(".section tbody tr").each(function(){
				var t = $(this);
				if(t.data("type") == 2){
					dizhi = 1;
				}
			});

			if(!dizhi) $(".delivery").remove();

			//如果删完了
			if($(".section tbody tr").length <=0){
				$(".section tbody").html('<tr><td colspan="6" class="empty">购物车内没有商品</td></tr>');
				$(".total-fee, .delivery, .submit").remove();
				$(".section").after('<div class="empty-split"></div>');
			}
		});


	});


	//使用其它地址
	$(".radlist li").bind("click", function(){
		var t = $(this);
		t.addClass("selected").siblings("li").removeClass("selected");

		if(t.closest(".radlist").attr("id") == "delivery"){
			t.index() == $("#delivery li").length - 1 ? $(".address-field").show() : $(".address-field").hide();
		}
	});


	//区域
	$("#addrlist").delegate("select", "change", function(){
		var sel = $(this), id = sel.val(), index = sel.index();
		if(id == 0){
			sel.parent().parent().addClass("error");
			sel.nextAll("select").remove();
		} else if(id != 0 && id != ""){
			$.ajax({
				type: "GET",
				url: "/include/ajax.php",
				data: "service=siteConfig&action=addr&son=0&type="+id,
				dataType: "json",
				success: function(data){
					var i = 0, opt = [];
					if(data instanceof Object && data.state == 100){
						for(var key in data.info){
							if(key != "in_array"){
								opt.push('<option value="'+data.info[key]['id']+'">'+data.info[key]['typename']+'</option>');
							}
						}
						sel.nextAll("select").remove();
						$("#addrlist").append('<select name="addrid[]"><option value="0">请选择区域</option>'+opt.join("")+'</select>');
						sel.parent().parent().addClass("error");
					}else{
						sel.parent().parent().removeClass("error");
					}
				},
				error: function(msg){
					alert(msg.status+":"+msg.statusText);
				}
			});
		}
	});

	//新地址表单验证
	var inputVerify = {
		addrid: function(){
			if($("#addrlist select:last").val() == 0){
				$("#addrlist").parent().addClass("error");
				return false;
			}
			return true;
		}
		,address: function(){
			var t = $("#address"), val = t.val(), par = t.parent();
			if(val.length < 5 || val.length > 60 || /^\d+$/.test(val)){
				par.addClass("error");
				return false;
			}
			return true;
		}
		,person: function(){
			var t = $("#person"), val = t.val(), par = t.parent();
			if(val.length < 2 || val.length > 15){
				par.addClass("error");
				return false;
			}
			return true;
		}
		,mobile: function(){
			var t = $("#mobile"), val = t.val(), par = t.parent();
			var exp = /^(13|14|15|17|18)[0-9]{9}$/;
			if(!exp.test(val) && $("#tel").val() == ""){
				// par.addClass("error");
				// par.find(".input-tips").html("<s></s>请输入正确的手机号码").show();
				// return false;
			}else{
				if(!exp.test(val)){
					// par.addClass("error");
					// par.find(".input-tips").html("<s></s>请输入正确的手机号码").show();
					// return false;
				}else{
					par.find(".input-tips").html("<s></s>手机号码和固定电话最少填写一项").hide();
				}
			}
			return true;
		}
		,tel: function(){
			var t = $("#tel"), val = t.val(), par = t.parent();
			if($("#mobile").val() == "" && val == ""){
				par.addClass("error");
				return false;
			}
			return true;
		}
	}
	$(".address-field input").bind("click", function(){
		$(this).parent().removeClass("error");
		if($(this).attr("id") == "mobile"){
			$("#tel").parent().removeClass("error");
		}
		if($(this).attr("id") == "tel"){
			$("#mobile").parent().removeClass("error");
			$("#mobile").parent().find(".input-tips").hide();
		}
	});

	$(".address-field input").bind("blur", function(){
		var id = $(this).attr("id");

		if((id == "address" && inputVerify.address()) ||
			 (id == "person" && inputVerify.person()) ||
			 (id == "mobile" && inputVerify.mobile()) ||
			 (id == "tel" && inputVerify.tel()) ){

			$(this).parent().removeClass("error");
		}

	});


	//提交订单
	$("#submit").bind("click", function(){

		//验证登录
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			huoniao.login();
			return false;
		}

		//验证表单
		if($("#delivery").length > 0 && $("#delivery li.selected").index() == $("#delivery li").length-1 && (!inputVerify.addrid() || !inputVerify.address() || !inputVerify.person() || !inputVerify.mobile() || !inputVerify.tel())){
			$('html, body').animate({scrollTop: $(".address-field").offset().top}, 300);
			return false;
		}

		//提交
		var t = $(this), data = [], action = t.closest("form").attr("action");

		$(".section tbody tr").each(function(){
			var t = $(this), id = t.data("id"), type = t.data("type"), count = t.find(".counter input").val();
			if(t.find("input[name=pid]").attr("checked") == true || t.find("input[name=pid]").attr("checked") == "checked"){
				data.push('pros[]='+id+","+count);
				cartlist.find('li[data-id='+id+']').remove();
			}
		});
		tuanInit.update();



		//邮寄信息
		if($("#delivery").length > 0){
			var addrid = $("input[name='addressid']:checked").val();
			data.push("addrid="+addrid);

			if(addrid == 0){
				data.push("addressid="+$("#addrlist select:last").val());
				data.push($(".address-field input").serialize());
			}

			data.push("deliveryType="+$("input[name=deliveryType]:checked").val());
			data.push("comment="+encodeURIComponent($("input[name=comment]").val()));
		}

		data.push('usePinput='+$("#if_jifen").val());

		t.addClass("disabled").html("提交中...");

		$.ajax({
			url: action,
			data: data.join("&"),
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){

					info = data.info;
					cutDown = setInterval(function () {
						$(".payCutDown").html(payCutDown(info.timeout));
					}, 1000)

					var datainfo = [];
					for (var k in info) {
						datainfo.push(k + '=' + info[k]);
					}
					$("#amout").text(info.order_amount);
					$('.payMask').show();
					$('.payPop').show();

					// if (usermoney * 1 < info.order_amount * 1) {
					//
					// 	$("#moneyinfo").text('余额不足，');
					// }
					if (usermoney * 1 < info.order_amount * 1) {

						$("#moneyinfo").text('余额不足，');
						$("#moneyinfo").closest('.pay_item').addClass('disabled_pay')
					}else{
						$("#moneyinfo").text('可用');
						$("#moneyinfo").closest('.pay_item').removeClass('disabled_pay')
					}
					if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
						$("#bonusinfo").text('额度不足，可用');
						$("#bonusinfo").closest('.pay_item').addClass('disabled_pay')
					}else if( bonus * 1 < info.order_amount * 1){
						$("#bonusinfo").text('余额不足，');
						$("#bonusinfo").closest('.pay_item').addClass('disabled_pay')
					}else{
						$("#bonusinfo").text('');
						$("#bonusinfo").closest('.pay_item').removeClass('disabled_pay')
					}
					ordernum  = info.ordernum;
					order_amount = info.order_amount;

					$("#ordertype").val('');
					$("#service").val('tuan');
					service = 'tuan';
					var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
					$('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));

				}else{
					alert(data.info);
					t.removeClass("disabled").html("提交订单");
				}
			},
			error: function(){
				alert("网络错误，请重试！");
				t.removeClass("disabled").html("提交订单");
			}
		});


	});


});
