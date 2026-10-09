$(function(){
	// 上移改变背景色
	$('body').delegate('dd.dd_item','mouseover',function(){
		$('dd').removeClass('bg1');
		$('dd').removeClass('bg2');
		var t= $(this),par = t.parents('dl').index();
		var cls = ''
		if(t.index()%2==0){
			cls = 'bg1'
		}else{
			cls = 'bg2'
		}
		$('.table_right dl').eq(par).find('dd').eq(t.index()-1).addClass(cls);
		$('.table_left dl').eq(par).find('dd').eq(t.index()-1).addClass(cls);

		 $('.table_mid .liBox').each(function(){
			 var p = $(this).children('.tb_con');
			 p.children('dl').eq(par).find('dd').eq(t.index()-1).addClass(cls);
		 });
	})	;
	//鼠标离开变回原来的背景色
	$('body').delegate('dd.dd_item','mouseleave',function(){
		$('dd').removeClass('bg1');
		$('dd').removeClass('bg2');
	});


	// 选择
	$('body').delegate('.item_chose','click',function(){
		var t = $(this);
		var allprice = 0 ,time = $('.tc_time').attr('data-year');
		if(t.hasClass('no_change')) return;
		if(!t.hasClass('chosed')){
			t.addClass('chosed');
			t.find('span').html(langData['business'][1][36]); //已勾选
		}else{
			t.removeClass('chosed');
			t.find('span').html(langData['business'][1][35]); //勾选
		}

		$('.table_right .dd_item.chosed').each(function(){
			var dd = $(this);
			allprice = allprice + dd.attr('data-price')*1;
			$('.all_price').attr('data-price',allprice);
			//formatNum((parseFloat(allprice)*time).toString());
			var self_all = (parseFloat(allprice)*time).toString();
			formatNum(self_all);
			for(var m = 0; m < promotions.length; m++){
				if(self_all>=promotions[m][0] && m<(promotions.length-1) && self_all<promotions[m+1][0] ){
					$('.hui_tip').removeClass('fn-hide');
					$('.hui_tip em.num_show').html(promotions[m][1]);
					formatNum(self_all-promotions[m][1]);
				}else if(self_all>=promotions[promotions.length-1][0]){
					$('.hui_tip').removeClass('fn-hide');
					$('.hui_tip em.num_show').html(promotions[promotions.length-1][1]);
					formatNum(self_all-promotions[promotions.length-1][1]);
				}else if(self_all<promotions[0][0]){
					$('.hui_tip').addClass('fn-hide');
					formatNum(self_all);
				}
			}

			for(var n=0; n<integrals.length; n++){
				if(time>=integrals[n][0] && n<(integrals.length-1) && time<integrals[n+1][0]){
					$('.point_tip').removeClass('fn-hide');
					//langData['business'][1][49].replace('1',integrals[integrals.length-1][0]).replace('2',integrals[integrals.length-1][1])
					$('.integral_show').html(langData['business'][1][49].replace('$1',integrals[n][0]).replace('$2',integrals[n][1]).replace('积分', cfg_pointName));  //满1年送2积分
				}else if(time>=integrals[integrals.length-1][0]){
					$('.point_tip').removeClass('fn-hide');
					$('.integral_show').html(langData['business'][1][49].replace('$1',integrals[integrals.length-1][0]).replace('$2',integrals[integrals.length-1][1]).replace('积分', cfg_pointName))
				}else  if(time<integrals[0][0]){
					$('.point_tip').addClass('fn-hide');
				}
			}
		})

	});


	var allprice = 0,time = $('.tc_time').attr('data-year')
	$('.table_right .dd_item.chosed').each(function(){
		var dd = $(this);
		allprice = allprice + dd.attr('data-price')*1;
		$('.all_price').attr('data-price',allprice);
		//formatNum((parseFloat(allprice)*time).toString());
		var self_all = (parseFloat(allprice)*time).toString();
		formatNum(self_all);
		for(var m = 0; m < promotions.length; m++){
			if(self_all>=promotions[m][0] && m<(promotions.length-1) && self_all<promotions[m+1][0] ){
				$('.hui_tip').removeClass('fn-hide');
				$('.hui_tip em.num_show').html(promotions[m][1]);
				formatNum(self_all-promotions[m][1]);
			}else if(self_all>=promotions[promotions.length-1][0]){
				$('.hui_tip').removeClass('fn-hide');
				$('.hui_tip em.num_show').html(promotions[promotions.length-1][1]);
				formatNum(self_all-promotions[promotions.length-1][1]);
			}else if(self_all<promotions[0][0]){
				$('.hui_tip').addClass('fn-hide');
				formatNum(self_all);
			}
		}

		for(var n=0; n<integrals.length; n++){
			if(time>=integrals[n][0] && n<(integrals.length-1) && time<integrals[n+1][0]){
				$('.point_tip').removeClass('fn-hide');
				//langData['business'][1][49].replace('1',integrals[integrals.length-1][0]).replace('2',integrals[integrals.length-1][1])
				$('.integral_show').html(langData['business'][1][49].replace('$1',integrals[n][0]).replace('$2',integrals[n][1]).replace('积分', cfg_pointName));  //满1年送2积分
			}else if(time>=integrals[integrals.length-1][0]){
				$('.point_tip').removeClass('fn-hide');
				$('.integral_show').html(langData['business'][1][49].replace('$1',integrals[integrals.length-1][0]).replace('$2',integrals[integrals.length-1][1]).replace('积分', cfg_pointName))
			}else  if(time<integrals[0][0]){
				$('.point_tip').addClass('fn-hide');
			}
		}
	})



	// 格式化数组
	function formatNum(num){
		num = parseFloat(num).toFixed(2);
		num = num.toString();
		var qian = (num.indexOf(".")<0)?num:num.substring(0,num.indexOf("."));
		var hou = '00';
		if(num.indexOf(".")>-1){
			hou = (num.substr(num.indexOf(".")+1,2).length==2)?num.substr(num.indexOf(".")+1,2):(num.substr(num.indexOf(".")+1,2)+'0')
		}
		$('.all_price').html('<i>'+echoCurrency('symbol')+'</i><em class="p_num">'+qian+'</em>.'+hou);
	}

	//国际区号获取
    getNationalPhone();
    function getNationalPhone(){
        $.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'jsonp',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   var listLen = list.length;
                   var codeArea = list[0].code;
                   if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        $('.areaCode').hide();
                        $('#phone').css({'padding-left':'0'});
                        return false;
                   }
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li data-cn="'+list[i].name+'" data-code="'+list[i].code+'"><span>'+list[i].name+'<span><em class="fn-right">+'+list[i].code+'</em></li>');
                   }
                   $('.areaList ul').append(phoneList.join(''));
                }else{
                   $('.areaList ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                    $('.areaList ul').html('<div class="loading">加载失败！</div>');
                }

        })
    }

	//查看所有行业
	$('.toall_link').bind('click', function(){
		if($(this).hasClass('curr')){
			$(this).removeClass('curr');
			$('.chosed_item .dd_item').hide();
			$('.chosed_item .curr').show();
			$(this).find('a').html(langData['business'][1][46]);  //查看所有行业 ↓
		}else{
			$(this).addClass('curr');
			$('.chosed_item .dd_item').show();
			$(this).find('a').html(langData['business'][1][51]);  //收起所有行业 ↑
		}
	});

	// 同意协议
	$('.agree_box i').click(function(){
		// $(this).toggleClass('agreed')
	});

	// 选择时间
	$('.tc_time input').click(function(e){
		$('.time_chose').addClass('show');

		$('body').one('click',function(){
			$('.time_chose').removeClass('show');
		});
		e.stopPropagation();
	});

	$('.time_chose li').click(function(){
		var t  = $(this)
		$('.tc_time input').val($(this).text());
		$('.tc_time').attr('data-year',t.attr('data-year'));
		var price = $('.all_price').attr('data-price');
		//formatNum((parseFloat(price)*t.attr('data-year')).toString());
		var allprice = (parseFloat(price)*t.attr('data-year')).toString();
		formatNum(allprice);
		var time = t.attr('data-year');
		for(var m = 0; m < promotions.length; m++){
			if(allprice>=promotions[m][0] && m<(promotions.length-1) && allprice<promotions[m+1][0] ){
				$('.hui_tip').removeClass('fn-hide');
				$('.hui_tip em.num_show').html(promotions[m][1]);
				formatNum(allprice-promotions[m][1])
			}else if(allprice>=promotions[promotions.length-1][0]){
				$('.hui_tip').removeClass('fn-hide');
				$('.hui_tip em.num_show').html(promotions[promotions.length-1][1]);
				formatNum(allprice-promotions[promotions.length-1][1])
			}else if(allprice<promotions[0][0]){
				$('.hui_tip').addClass('fn-hide');
				formatNum(allprice)
			}
		}

		for(var n=0; n<integrals.length; n++){
			if(time>=integrals[n][0] && n<(integrals.length-1) && time<integrals[n+1][0]){
				$('.point_tip').removeClass('fn-hide');
				//langData['business'][1][49].replace('1',integrals[integrals.length-1][0]).replace('2',integrals[integrals.length-1][1])
				$('.integral_show').html(langData['business'][1][49].replace('$1',integrals[n][0]).replace('$2',integrals[n][1]).replace('积分', cfg_pointName));  //满1年送2积分
			}else if(time>=integrals[integrals.length-1][0]){
				$('.point_tip').removeClass('fn-hide');
				$('.integral_show').html(langData['business'][1][49].replace('$1',integrals[integrals.length-1][0]).replace('$2',integrals[integrals.length-1][1]).replace('积分', cfg_pointName))
			}else  if(time<integrals[0][0]){
				$('.point_tip').addClass('fn-hide');
			}
		}
	});

	// 选择区号
	$('#form_box .left_area').click(function(e){
		$('#areaList').addClass('show');
		$('#areaList li').click(function(){
			var txt = $(this).find('.fn-right').text();
			$('#areaCode').val(txt.replace('+', ''));
			$('.left_area span').text(txt)
		})
		$(document).one('click',function(){
			$('#areaList').removeClass('show');
		});
		e.stopPropagation()
	});

	// 绑定手机号
	$('#form_box .sure_btn').click(function(){
		var t = $(this);
		if(t.hasClass('disabled')) return false;
		t.addClass('disabled');
		$.ajax({
			url: masterDomain+"/include/ajax.php?service=member&action=updateAccount&do=chphone",
			data: "areaCode="+$("#areaCode").val()+"&phone="+$('#tel').val()+"&vdimgck="+$('#code').val(),
			type: "POST",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					phonecheck = 1;
					$('.count_box .right_btn').click();

					$('.mask').hide();
					$('html').removeClass('noscroll');
					$('.pop_box').removeClass('show');

				}else{
					alert(data.info);
				}
				t.removeClass('disabled');
			}
		});

	});

	// 绑定手机号的弹窗
	$('.count_box .right_btn').click(function(){
		var packageCurr = -1;
		if(phonecheck==0){
			$('.mask').show();
			$('html').addClass('noscroll');
			$('.pop_box').addClass('show');
			return false;
		}else if(phonecheck==''){
			window.location.href = masterDomain + "/login.html";
		}
		if($('#time').val()==''){
			alert(langData['business'][1][48])  //请选择时间
			return false;
		}
		//自选套餐
		var packageCon = [];
		if(packageCurr < 0){
			$('.table_right').find('.chosed').each(function(){
				packageCon.push($(this).data('name'));
			});
			if(packageCon.length == 0){
				alert("请勾选要开通的特权！");
				return false;
			}
		}

		//获取套餐信息、开通时长
		var tc_time = parseInt($('.tc_time').attr('data-year'));


		//提交订单
		var t = $(this);
		if(t.hasClass('disabled')) return false;
		t.addClass('disabled');
		t.find('a').html('提交中...');

		$.ajax({
			url: "/include/ajax.php",
			type: "post",
			data: {
				'service': 'member',
				'action': 'joinBusinessOrder',
				'package': packageCurr,
				'packageItem': packageCon.join(','),
				'time': tc_time
			},
			dataType: "json",
			success: function (data) {
				console.log(data);
				if(data && data.state == 100){
					var info = data.info;
					//提交成功，跳转到支付页面
					cutDown = setInterval(function () {
						$(".payCutDown").html(payCutDown(info.timeout));
					},1000)

					var datainfo = [];
					for(var k in info) {
						datainfo.push(k+'='+info[k]);
					}

					$('#action_1').val('checkJoinPayAmount');
					$('#action_2').val('joinBusinessOrder');
					$("#amout").text(info.order_amount);
					$('.payMask').show();
					$('.payPop').show();

					if(typeof(timer_trade)!='undefined' && timer_trade != null){
						clearInterval(timer_trade);
					}

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
						$("#bonusinfo").text('余额不足，可用');
						$("#bonusinfo").closest('.pay_item').addClass('disabled_pay')
					}else{
						$("#bonusinfo").text('可用');
						$("#bonusinfo").closest('.pay_item').removeClass('disabled_pay')
					}

					timer_trade = setInterval(function(){
						$.ajax({
							type: 'POST',
							// async: false,
							url: '/include/ajax.php?service=member&action=tradePayResult&type=1&order='+ordernum,
							dataType: 'json',
							success: function(str){
								if(str.state == 100 && str.info != ""){
									//如果已经支付成功，则跳转到指定页面
									location.href = str.info;
								}
							}
						});

					}, 2000);
					ordernum     = info.ordernum;
					order_amount = info.order_amount;
					service		 = 'member';
					var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
					$('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));
				}else{
					alert(data.info);
					t.removeClass('disabled');
					t.find('a').html('重新提交');
				}
			},
			error: function(){
				alert('网络错误，请稍候重试！');
				t.removeClass('disabled');
				t.find('a').html('重新提交');
			}
		});

		return false;
	});


	$('.mask ,.pop_box .close_btn').click(function(){
		$('.mask').hide();
		$('html').removeClass('noscroll')
		$('.pop_box').removeClass('show');
	});


	// 显示按钮
	 $('#tel,#code').bind('input propertychange', function() {
		 $('.code_tip').hide();
	     if($('#tel').val()!='' && $('#code').val()!=''){
			 $('.sure_btn').removeClass('disabled');
		 }else{
			  $('.sure_btn').addClass('disabled')
		 }
	 });

	 $('#form_box>div').click(function(){
		$(this).find('input').focus();
	 });

	  var dataGeetest = "";
	 //发送验证码
	    function sendVerCode(captchaVerifyParam,callback){
	        var form = $("#form_box");
	        var btn = form.find('.acc_code'), v = form.find("#tel").val(), areaCode = $("#areaCode").val();

	        if(v == ''){
	            alert(langData['siteConfig'][20][463]);  //请输入手机号码
	            form.find("#phone").focus();
	            return false;
	        }else{

	            //中国大陆手机格式验证
	            if(areaCode == '86'){
	                var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
	                if(!phoneReg.test(v)) {
	                    alert(langData['siteConfig'][20][232]);   //请输入正确的手机号码
	                    form.find("#tel").focus();
	                    return false;
	                }
	            }
				let param = "type=verify&phone="+v+'&areaCode='+areaCode
				if(captchaVerifyParam && geetest == 2){
					param = param + '&geetest_challenge=' + captchaVerifyParam
				}else if(geetest == 1 && captchaVerifyParam){
					param = param +  captchaVerifyParam
				}
	            btn.attr('disabled', true).val(langData['siteConfig'][7][10]+"..");   //发送中
	            $.ajax({
	                url: masterDomain+"/include/ajax.php?service=siteConfig&action=getPhoneVerify",
	                data: param,
	                type: "GET",
	                dataType: "jsonp",
	                success: function (data) {
						if(callback){
							callback(data)
						}
	                    //获取成功
	                    if(data && data.state == 100){
	                        countDown(60, btn);
	                        //获取失败
	                    }else{
	                        btn.removeAttr('disabled').val(langData['siteConfig'][4][1]);   //获取验证码
	                        if(data.info != '图形验证错误，请重试！'){
								alert(data.info);
							}
	                    }
	                },
	                error: function(){
	                    btn.removeAttr('disabled').val(langData['siteConfig'][4][1]);   //获取验证码
	                    alert(langData['siteConfig'][20][173]);  //网络错误，发送失败！
	                }
	            });
	        }
	    }

		if(geetest){

			captchaVerifyFun.initCaptcha('web','#codeButton',sendVerCode)
			//获取验证码
			$("#form_box").delegate('.acc_code', 'click', function () {

				var form = $("#form_box");
				var c = form.find("#areaCode").val();
				var v = form.find("#tel").val();

				if (v == '') {
					//  alert('请输入手机号码');
					$('.tel_box .code_tip').text(langData['business'][1][47]).show();   //请输入手机号
					form.find("#tel").focus();
					return false;
				}
				//中国大陆手机格式验证
				if (c == '86') {
					var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
					if (!phoneReg.test(v)) {
						// alert(langData['siteConfig'][20][232]);  //请输入正确的手机号码
						$('.tel_box .code_tip').text(langData['siteConfig'][20][232]).show();
						form.find("#phone").focus();
						return false;
					}
				}

				//弹出验证码
				if (geetest == 1) {
					captchaVerifyFun.config.captchaObjReg.verify();
				} else {
					$('#codeButton').click()
				}
			});

		}

		    if(!geetest){
		          $("#form_box").delegate('.acc_code', 'click', function(){
		            sendVerCode();
		        });
		    }


			//倒计时
			function countDown(time, obj){
				obj.html(time+(langData['siteConfig'][44][1].replace('1',''))).attr('disabled', true);//1秒后重发
			    mtimer = setInterval(function(){
			        obj.html((--time)+(langData['siteConfig'][44][1].replace('1',''))).attr('disabled', true);//1秒后重发
			        if(time <= 0) {
			            clearInterval(mtimer);
			            obj.html(langData['siteConfig'][6][55]).removeAttr('disabled');//重新发送
			        }
			    }, 1000);
			}
})
