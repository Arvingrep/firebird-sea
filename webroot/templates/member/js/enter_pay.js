$(function(){

	$("#paytype").val($(".pay-bank .active:eq(0)").data("type"));

	//支付倒计时
	var intDiff = parseInt(orderdate);    //倒计时总秒数量
	timerPay(intDiff);
	var timer2 = null;
  	function timerPay(intDiff) {
   		window.setInterval(function () {
    		var day = 0,
     		hour = 0,
     		minute = 0,
     		second = 0;//时间默认值
    		if (intDiff > 0) {
		     	//计算相关的天，小时，还有分钟，以及秒
		   		day = Math.floor(intDiff / (60 * 60 * 24));
		   		hour = Math.floor(intDiff / (60 * 60)) - (day * 24);
		   		minute = Math.floor(intDiff / 60) - (day * 24 * 60) - (hour * 60);
		  		second = Math.floor(intDiff) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
		    }
		    if (minute <= 9) minute = '0' + minute;
		    if (second <= 9) second = '0' + second;
		    $('#day_show').html(day);
		    $('#hour_show').html('<s id="h"></s>' + hour);
		    $('#minute_show').html('<s></s>' + minute);
		    $('#second_show').html('<s></s>' + second);
		    intDiff--;
		   }, 1000);
 			//循环函数，是时钟运动起来
			 setInterval(function(){
			  if($('#minute_show').text() =='00' && $('#second_show').text() =='00'){
			   clearInterval(timer2);
			  }
		 },1000)
	}

	//展开商品详情
	$(".bot_div2 .more_storeInfo").bind("click", function(){
		if($(this).hasClass('active')){
			$(this).removeClass('active');
			$(this).find('span').text('展开');
			$('.bot_div1').stop(true,false).slideUp();
			$('.pay_bot').css('padding-top',0)

		}else{
			$(this).addClass('active');
			$(this).find('span').text('收起');
			$('.bot_div1').stop(true,false).slideDown();
			$('.pay_bot').css('padding-top','30px')
		}
	})


	var timer = null;

	var init = {
		popshow: function() {
			$("body").append($('<div id="shadowlayer" style="display:block"></div>'));
			$("#feedback").show();
		},
		pophide: function() {
			$("#shadowlayer").remove();
			$("#feedback").hide();
			clearInterval(timer);
		}
	};

	$(".pay-pop .pop-close, .pay-pop .gray").bind("click", function(){
		init.pophide();
	});

	//支付方式
	$(".pay-bank .tab a").bind("click", function(){
		var t = $(this), index = t.index();
		!t.hasClass("current") ? t.addClass("current").siblings("a").removeClass("current") : "";
		$(".pay-bank .blist").hide();
		$(".pay-bank .blist:eq("+index+")").show();
	});

	$(".pay-bank .bank-icon").bind("click", function(){
		var t = $(this);
		!t.hasClass("active") ? t.addClass("active").siblings("a").removeClass("active") : "";
		$("#paytype").val(t.data("type"));
	});

	//计算最多可用多少个积分
	if(totalPoint > 0){

		var pointMoney = totalPoint / pointRatio, cusePoint = totalPoint;
		if(pointMoney > totalAmount){
			cusePoint = totalAmount * pointRatio;
		}

		//填充可使用的最大值
		$("#cusePoint").html(parseInt(cusePoint));
		$("#usePcount").val(parseInt(cusePoint));

	}

	//计算最多可用多少余额
	if(totalBalance > 0){

		var cuseBalance = totalBalance;
		if(totalBalance > totalAmount){
			cuseBalance = totalAmount;
		}
		$("#cuseBalance").html(cuseBalance);

	}

	var anotherPay = {

		//使用积分
		usePoint: function(){
			$("#usePcount").val(parseInt(cusePoint));  //重置为最大值
			$("#disMoney").html(cusePoint / pointRatio);  //计算抵扣值

			//判断是否使用余额
			if($("#useBalance").attr("checked") == "checked"){
				this.useBalance();
			}
		}

		//使用余额
		,useBalance: function(){

			var balanceTotal = totalBalance;

			//判断是否使用积分
			if($("#usePinput").attr("checked") == "checked"){

				var pointSelectMoney = $("#usePcount").val() / pointRatio;
				//如果余额不够支付所有费用，则把所有余额都用上
				if(totalAmount - pointSelectMoney < totalBalance){
					balanceTotal = totalAmount - pointSelectMoney;
				}

			//没有使用积分
			}else{

				//如果余额大于订单总额，则将可使用额度重置为订单总额
				if(totalBalance > totalAmount){
					balanceTotal = totalAmount;
				}

			}

			balanceTotal = balanceTotal < 0 ? 0 : balanceTotal;
			balanceTotal = balanceTotal.toFixed(2);
			cuseBalance = balanceTotal;
			$("#useBcount").val(balanceTotal);
			$("#balMoney, #cuseBalance").html(balanceTotal);  //计算抵扣值
		}
		//计算总抵扣值
		,all_disMoney: function(){
			var usePcountInput = $("#usePcount").val(), useBcountInput = $("#useBcount").val();
			var disMoney=Number($("#disMoney").html()?$("#disMoney").html():0);//积分抵扣
		    var balMoney=Number($("#balMoney").html()?$("#balMoney").html():0);//余额抵扣
			console.log(disMoney,balMoney);
			var all_disMoney=disMoney+ balMoney;
			$('#all_disMoney').html(all_disMoney);


		}

		//重新计算还需支付的值
		,resetTotalMoney: function(){

			var totalPayMoney = totalAmount, usePcountInput = $("#usePcount").val(), useBcountInput = $("#useBcount").val();

			if($("#usePinput").attr("checked") == "checked" && usePcountInput > 0){
				totalPayMoney -= usePcountInput / pointRatio;
			}
			if($("#useBalance").attr("checked") == "checked" && useBcountInput > 0){
				totalPayMoney -= useBcountInput;
			}

			$("#totalPayMoney").html(totalPayMoney.toFixed(2));
			var realMoney=$("#totalPayMoney").html();
			$('#realMoney').text(realMoney)
			if(realMoney == 0){
				$('.code_div').hide();
				$('.qrpay').hide();
				$('.pay-bank').hide();
				$('.all_pay').show();
				$('.all_paypwd').find('.all_left').remove();
				$('.all_paypwd').append('<span class="all_left">'+langData['education'][9][92]+'</span>')//已使用账户资产全额抵扣
			}else{
				if($("#usePinput").attr("checked") == "checked" || $("#useBalance").attr("checked") == "checked"){
					$('.code_div').show();
					$('.qrpay').hide();
				}


				$('.pay-bank').show();
				$('.all_pay').hide();
				$('.all_paypwd').find('.all_left').remove();
			}
			getQrCode()
		}

	}

	anotherPay.resetTotalMoney();
	$('#usePcount').val('')

	//使用积分抵扣/余额支付

	$("#usePinput, #useBalance").bind("click", function(){
		var t = $(this), ischeck = t.attr("checked"), parent = t.closest(".account-summary"), type = t.attr("name"), label = t.closest('label')
				discharge = parent.find('.discharge');
		if(ischeck == "checked"){
			parent.find('.inpu').attr('disabled',false)
			parent.addClass('active');
			discharge.addClass('show');
			$(".common_paypwd").stop(true,false).slideDown();

			if($('.no_paypwd').size() > 0){
				$('.code_div .code_tip').text(langData['education'][9][93]);//点击下方按钮，扫码支付余款
			}

		}else{
			parent.removeClass('active');
			parent.find('.inpu').attr('disabled','disabled')
			if(t.val()==''){
				discharge.removeClass('show');
			}

			if(($('#usePinput').attr("checked") == undefined) && ($('#useBalance').attr("checked") == undefined)){
				$(".common_paypwd").stop(true,false).slideUp();
				$('.qrpay').show();//点击更新二维码页面
				$('.code_div').hide();
			}



		}

		//积分
		if(type == "usePinput"){
			$("#disMoney").html("0");  //重置抵扣值

			//确定使用
			if(ischeck == "checked"){
				anotherPay.usePoint();
				anotherPay.all_disMoney()
			//如果不使用积分，重新计算余额
			}else{

				$("#usePcount").val("0");

				//判断是否使用余额
				if($("#useBalance").attr("checked") == "checked"){
					anotherPay.useBalance();
					anotherPay.all_disMoney()
				}
			}

		//余额
		}else if(type == "useBalance"){
			$("#balMoney").html("0");

			//确定使用
			if(ischeck == "checked"){
				anotherPay.useBalance();
				anotherPay.all_disMoney()
			}else{
				$("#useBcount").val("0");
			}
		}

		anotherPay.resetTotalMoney();
		anotherPay.all_disMoney()
	});

	//更新二维码
	$('.code_div .pay_fresh').bind("click", function(){
		//验证密码输入
			var paypwd= $('#paypwd').val();
			if(paypwd == ""){
				$('.paypwd_tip').show();
				$('.paypwd .true').hide();
				return false;
			}else{
				//验证密码是否正确
				//正确
				// $('.paypwd_tip').hide();
				// $('.paypwd .true').show();

				// $('.code_div').hide();
				// $('.qrpay').show();//二维码页面
				//错误时
				//$('.paypwd .true').hide();
				//$('.paypwd_tip em').text('密码错误');
				//$('.paypwd_tip').show();


				var data = $('#payform').serialize(), action = $('#payform').attr('action');
				$.ajax({
					url: "/include/ajax.php?service=member&action=sweepcode&final=1&qr=1",
					type: "POST",
					data:data,
					dataType: "json",
					success: function (data) {
						if(data && data.state == 100){
							getQrCode();
							$('.code_div').hide();
							$('.qrpay').show();//二维码页面
							$('.paypwd_tip').hide();
							$('.paypwd .true').show();
						}else{
							alert(data.info);//订单不存在
							// t.attr("disabled", false).html("立即支付");
						}
					},
					error: function(){
						console.log(333)
						alert("网络错误，请重试！");
						// t.attr("disabled", false).html("立即支付");
					}
				});
			}


	})
	//全额抵扣确认支付
	// $('.all_pay').bind("click", function(){
	//
	// })
	//稍后设置密码
	$(".wait_set").bind("click", function(){

		$(".common_paypwd").stop(true,false).slideUp();
	})

	//验证积分输入
	var lastInputVal = 0;

	function myBrowser(){
	    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
	    var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; //判断是否IE浏览器
	    if (isIE) {
	        return "IE";
	    }//isIE end
	}//myBrowser() end
	if(myBrowser() == "IE" ) {

	    $('#usePcount').bind('blur',function(){
			var t = $(this), val = t.val();

			//判断输入是否有变化
			if(lastInputVal == val) return;

			if(val > cusePoint){
				alert("此单最多可用 "+cusePoint+" 个"+pointName);
				$("#usePcount").val(cusePoint);
				$("#disMoney").html(cusePoint / pointRatio);
				lastInputVal = cusePoint;
			}else{

				lastInputVal = val;
				$("#disMoney").html(val / pointRatio);
				anotherPay.all_disMoney();


			}

			//判断是否使用余额
			if($("#useBalance").attr("checked") == "checked"){
				anotherPay.useBalance();
				anotherPay.all_disMoney()

			}
			anotherPay.resetTotalMoney();
			anotherPay.all_disMoney()
		})


		$("#useBcount").bind("blur", function(){
			var t = $(this), val = Number(t.val()), check = true;

			cuseBalance = Number(cuseBalance);

			var exp = new RegExp("^(?:[1-9]\\d*|0)(?:.\\d{1,2})?$", "img");
			if(!exp.test(val)){
				check = false;
			}

			if(!check){
				alert(langData['education'][9][94]);//请输入正确的数值，最多支持两位小数！
				$("#useBcount").val("0");
				$("#balMoney").html("0");
			}else if(val > cuseBalance){
				alert("此单最多可用 "+cuseBalance+" "+echoCurrency('short'));
				$("#useBcount").val(cuseBalance);
				$("#balMoney").html(cuseBalance);
			}else{
				$("#balMoney").html(val);
				anotherPay.all_disMoney()
			}
			anotherPay.resetTotalMoney();
			anotherPay.all_disMoney()
		});
	}else{
		$('#usePcount').bind('input porpertychange',function(){
				var t = $(this), val = t.val();

				//判断输入是否有变化
				if(lastInputVal == val) return;

				if(val > cusePoint){
					alert("此单最多可用 "+cusePoint+" 个"+pointName);
					$("#usePcount").val(cusePoint);
					$("#disMoney").html(cusePoint / pointRatio);
					lastInputVal = cusePoint;
				}else{

					lastInputVal = val;
					$("#disMoney").html(val / pointRatio);
					anotherPay.all_disMoney();


				}

				//判断是否使用余额
				if($("#useBalance").attr("checked") == "checked"){
					anotherPay.useBalance();
					anotherPay.all_disMoney()

				}
				anotherPay.resetTotalMoney();
				anotherPay.all_disMoney()
			})

			$('#useBcount').bind('input porpertychange',function(){
				var t = $(this), val = Number(t.val()), check = true;

				cuseBalance = Number(cuseBalance);

				var exp = new RegExp("^(?:[1-9]\\d*|0)(?:.\\d{1,2})?$", "img");
				if(!exp.test(val)){
					check = false;
				}

				if(!check){
					alert(langData['education'][9][58]);//请输入正确的数值，最多支持两位小数！
					$("#useBcount").val("0");
					$("#balMoney").html("0");
				}else if(val > cuseBalance){
					alert("此单最多可用 "+cuseBalance+" "+echoCurrency('short'));
					$("#useBcount").val(cuseBalance);
					$("#balMoney").html(cuseBalance);
				}else{
					$("#balMoney").html(val);
					anotherPay.all_disMoney()
				}
				anotherPay.resetTotalMoney();
				anotherPay.all_disMoney()
			});
	}


	//获取付款二维码
	function getQrCode(){
	   // $('.payTab li:eq(0)').hasClass('curr') ? $('.stepBtn').hide() : null;
	    var data = $('#payform').serialize(), action = $('#payform').attr('action');

	    $.ajax({
	      type: 'POST',
	      url: '/include/ajax.php?service=member&action=sweepcode',
	      data: data  + '&qr=1',
	      dataType: 'jsonp',
	      success: function(str){
	      	console.log('code 执行2')
	        if(str.state == 100){
	          var data = [], info = str.info;
	          for(var k in info) {
	            data.push(k+'='+info[k]);
	          }
	          var src = masterDomain + '/include/qrPay.php?' + data.join('&');
	          console.log(src);
	          $('#qrimg').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));

	          //验证是否支付成功，如果成功跳转到指定页面
	      		if(timer != null){
	      			clearInterval(timer);
	      		}

	          timer = setInterval(function(){

	      			$.ajax({
	      				type: 'POST',
	      				async: false,
	      				url: '/include/ajax.php?service=member&action=tradePayResult&type=3&order=' + info['ordernum'],
	      				dataType: 'json',
	      				success: function(str){
	      					if(str.state == 100 && str.info != ""){
	      						//如果已经支付成功，则跳转到会员中心页面
	                  clearInterval(timer);
	      						location.href = str.info;
	      					}else if(str.state == 101 && str.info == langData['siteConfig'][21][162]){   //订单不存在！
	                  getQrCode();
	                }
	      				}
	      			});

	      		}, 2000);


	        }
	      }
	    });

	  }

	//刷新二维码
	$(".code_fresh").bind("click", function(event){
		$('#qrimg').attr('src','')
		getQrCode();

	})
	//提交支付
	$(".pay_p").bind("click", function(event){
		var t = $(this);

		//验证密码输入
		if($('#useBalance').is(':checked')){
			var paypwd= $('#paypwd').val();
			if(paypwd == ""){
				$('.paypwd_tip').show();
				$('.paypwd .true').hide();
				return false;
			}else{
				//验证密码是否正确
				//正确
				$('.paypwd_tip').hide();
				$('.paypwd .true').show();
			}
		}

		if($("#ordernum").val() == ""){
			alert(langData['education'][9][95]);//订单号获取失败，请刷新页面重试！
			return false;
		}
		if($("#paytype").val() == ""){
			alert(langData['siteConfig'][21][75]);//请选择支付方式！
			return false;
		}


		var pinputCheck  = $("#usePinput").attr("checked"),
				point        = $("#usePcount").val(),
				balanceCheck = $("#useBalance").attr("checked"),
				balance       = $("#useBcount").val(),
				paypwd       = $("#paypwd").val();

		if((pinputCheck == "checked" && point > 0) || (balanceCheck == "checked" && balance > 0)){

			var data = [];
			data.push('ordernum='+ordernum);

			//积分
			if(pinputCheck == "checked" && point > 0){
				data.push('point='+point);
			}

			//余额
			if(balanceCheck == "checked" && balance > 0){
				data.push('useBalance=1');
				data.push('balance='+balance);
				data.push('paypwd='+paypwd);
			}

			t.attr("disabled", true).html(""+langData['siteConfig'][6][35]+"...");//提交中

			$.ajax({
				url: "/include/ajax.php?service=member&action=checkJoinPayAmount",
				data: data.join("&"),
				type: "POST",
				dataType: "json",
				success: function (data) {
					if(data && data.state == 100){

						$("#payform").submit();
						init.popshow();
						t.attr("disabled", false).html(langData['siteConfig'][23][113]);//立即支付


						//验证是否支付成功，如果成功跳转到指定页面
						if(timer != null){
							clearInterval(timer);
						}
						timer = setInterval(function(){

							$.ajax({
								type: 'POST',
								async: false,
								url: '/include/ajax.php?service=member&action=tradePayResult&type=3&order='+ordernum,
								dataType: 'json',
								success: function(str){
									if(str.state == 100 && str.info != ""){
										//如果已经支付成功，则跳转到指定页面
										location.href = str.info;
									}
								}
							});

						}, 2000);

					}else{
						alert(data.info);//订单不存在
						t.attr("disabled", false).html(langData['siteConfig'][23][113]);//立即支付
					}
				},
				error: function(){
					alert(langData['siteConfig'][6][203]);//网络错误，请重试！
					t.attr("disabled", false).html(langData['siteConfig'][23][113]);//立即支付
				}
			});



		}else{

			$("#usePcount, #useBcount, #paypwd").val("");

			$("#payform").submit();
			init.popshow();


			//验证是否支付成功，如果成功跳转到指定页面
			if(timer != null){
				clearInterval(timer);
			}
			timer = setInterval(function(){

				$.ajax({
					type: 'POST',
					async: false,
					url: '/include/ajax.php?service=member&action=tradePayResult&type=3&order='+ordernum,
					dataType: 'json',
					success: function(str){
						if(str.state == 100 && str.info != ""){
							//如果已经支付成功，则跳转到指定页面
							location.href = str.info;
						}
					}
				});

			}, 2000);

		}





	});


});
