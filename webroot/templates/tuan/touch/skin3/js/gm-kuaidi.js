$(function(){
	intergal = false;

	total();
	$('.num-rec').click(function(){
		var account = Number($('.num-account').val());
		if (account>1) {
			account --;
			$('.num-account').val(account);
			total();
		}
	});

	$('.num-add').click(function(){
		var account = Number($('.num-account').val());
		if (account < max) {
			account++;
			$('.num-account').val(account);
			total();
		}else{
			$('.num-account').val(max<=0?1:max);
			alert(limit_msg);
		}
	});

	$('.num-account').bind('input propertychange', function(){
		total();
	});

	function total(){
		var num = Number($('.num-account').val()), frei = 0;

		if(tuantype == 2){
			if(num <= freeshi){
				frei = freight;
				$(".order-fare .name-r").html("含运费 "+freight);
			}else{
				frei = 0;
				$(".order-fare .name-r").html("免运费");
			}
		}
		if(type!=''){
			var total = Number(num*pinprice+frei).toFixed(2);
		}else{
			var total = Number(num*price+frei).toFixed(2);
		}
		$('.order-price .name-r em').html(total);

		jifen_di = parseInt(jifen_ * total  * pointRatio  / 100);
		jifen_di = hasPoint <= jifen_di ? hasPoint : jifen_di;
		jifen_di = Number(jifen_di);
		jian = parseFloat((jifen_di/pointRatio).toFixed(2));
		$(".integral .jifen").html(jifen_di) ;
		$(".integral .jian").html(jian) ;
		if($(".integral .gou").hasClass('hasgou')){
			$(".left_price").attr('data-price',total).find(".amount").html((total-jian).toFixed(2))
		}else{
			$(".left_price").attr('data-price',total).find(".amount").html(total);
		}

		if(jifen_di == 0 || jian == 0){
	  		$(".integral").hide()
	  	}

	  	if((price-jian).toFixed(2) == 0){
			$("#submit").html(langData['siteConfig'][23][113]); //立即支付
		}
	}

	// 是否积分抵扣
	$(".integral .gou").click(function() {
		var t = $(this);
		t.toggleClass('hasgou');
		if (t.hasClass('hasgou')) {
			$("#if_jifen").val(1)
		} else {
			$("#if_jifen").val(0)
		}
		total();
	})


	$("#orderForm").submit(function(){
		$("#submit").click();
	});

	//提交
	$("#submit,.shareTo").bind("click", function(){

		//验证登录
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			location.href = masterDomain+'/login.html';
			return false;
		}

		var paytype = $(this).attr('data-paytype')

		var t = $(this), data = [], isaddr = 0, action = t.closest("form").attr("action"), num = Number($('.num-account').val());

		if(t.hasClass("disabled")) return false;

		data.push('pros[]='+id+","+num);
		data.push('type='+type);
		data.push('pinid='+pinid);
		if(paytype == '1'){
			data.push('peerpay=1');
		}
		data.push('voucher='+voucher);
		data.push('usePinput='+$("#if_jifen").val());



		if(tuantype == 2){
			var addressid = $("#addressid").val();
			if(addressid == undefined || addressid == 0 || addressid == null){
				alert("请选择收货地址！");
				$('.payBeforeLoading').hide()
				return false;
			}else{
				data.push("addrid="+addressid);
				data.push("deliveryType="+$("#deliveryType").val());
				data.push("comment="+encodeURIComponent($("#comment").val()));
			}
		}

		t.addClass("disabled").html("提交中...");

		$.ajax({
			url: action,
			data: data.join("&"),
			type: "POST",
			dataType: "json",
			success: function (data) {
				$('.payBeforeLoading').hide()
				if(data && data.state == 100){
					orderurl = data.info.orderurl;
					// if(device.indexOf('huoniao_Android') > -1) {
                    //     setupWebViewJavascriptBridge(function (bridge) {
                    //         bridge.callHandler('pageClose', {}, function (responseData) {
                    //         });
                    //     });
                    //     location.href = data.info;
                    // }else{
                    //     location.href = data.info + (data.info.indexOf('?') > -1 ? '&' : '?') + 'currentPageOpen=1';
                    // }

					if(typeof(paytype) !='undefined' && paytype == 1 || typeof (data.info) != 'object'){
						location.href = data.info;

					}else{

						info = data.info;
						$("#amout").text(info.order_amount);
						$('.payMask').show();
						$('.payPop').css('transform','translateY(0)');

						// if(usermoney*1 < info.order_amount *1){
						//
						// 	$("#moneyinfo").text('余额不足，');
						// }
						if (usermoney * 1 < info.order_amount * 1) {

							$("#moneyinfo").text('余额不足，');
							$("#moneyinfo").closest('.check-item').addClass('disabled_pay')

							$('#balance').hide();
						}

						if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
							$("#bonusinfo").text('额度不足，');
							$("#bonusinfo").closest('.check-item').addClass('disabled_pay')
						}else if( bonus * 1 < info.order_amount * 1){
							$("#bonusinfo").text('余额不足，');
							$("#bonusinfo").closest('.check-item').addClass('disabled_pay')
						}else{
							$("#bonusinfo").text('');
							$("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
						}



						ordernum     = info.ordernum;
						order_amount = info.order_amount;

						payCutDown('',info.timeout,info);
					}
				}else{
					alert(data.info);
					t.removeClass("disabled").html("提交订单");
				}
			},
			error: function(){
				$('.payBeforeLoading').hide()
				alert("网络错误，请重试！");
				t.removeClass("disabled").html("提交订单");
			}
		});

	})


})


//地址选择成功
function chooseAddressOk(addrArr){
	$("#addressid").val(addrArr.id);
	$(".chooseAddress").html('<div class="name-l"><p><span>'+addrArr.people+'</span><span>'+addrArr.contact+'</span></p><p>'+addrArr.addrname+' '+addrArr.address+'</p></div><div class="name-r">＞</div><div class="clear"></div>');
}
