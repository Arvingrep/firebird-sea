//文字横向滚动
function ScrollImgLeft(){
    var speed=50;//初始化速度 也就是字体的整体滚动速度
    var MyMar = null;//初始化一个变量为空 用来存放获取到的文本内容
    var scroll_begin = document.getElementById("scroll_begin");//获取滚动的开头id
    var scroll_end = document.getElementById("scroll_end");//获取滚动的结束id
    var scroll_div = document.getElementById("scroll_div");//获取整体的开头id
	if(scroll_end  && scroll_begin){
		scroll_end.innerHTML=scroll_begin.innerHTML;//滚动的是html内部的内容,原生知识!
		//定义一个方法
		function Marquee(){
		    if(scroll_end.offsetWidth-scroll_div.scrollLeft<=0)
		        scroll_div.scrollLeft-=scroll_begin.offsetWidth;
		    else
		        scroll_div.scrollLeft++;
		}
		MyMar = setInterval(Marquee,speed);//给上面的方法设置时间  setInterval
		//鼠标点击这条公告栏的时候,清除上面的方法,让公告栏暂停
		scroll_div.onmouseover = function(){
		    clearInterval(MyMar);
		}
		//鼠标点击其他地方的时候,公告栏继续运动
		scroll_div.onmouseout = function(){
		    MyMar = setInterval(Marquee,speed);
		}
	}
}
ScrollImgLeft();

$(function(){

	if($.cookie('tip')!=1){
		$('.mask_show').show();
		$('html').addClass('noscroll');
		$('.bottom_box .right_btn').removeClass('rz_btn');
		$('.hui_box').hide();
	}

	// 点击知道了
	$('.btn_close').click(function(){
		$('.mask_show').hide();
		$('html').removeClass('noscroll');
		$('.bottom_box .right_btn').addClass('rz_btn');
		$('.hui_box').show();
		setCookie('tip',1,7)
	});

	//套餐选择
	$('.tb_right .li_box').click(function(){
		var t = $(this), index = t.index();
		var price = t.attr('data-aprice');
		var time = $('.price_show').attr('data-year');
		var allprice = 0,count_price = 0;

        packageCurr = index;
        t.addClass('tc_chosed').siblings('li').removeClass('tc_chosed');

		$('.tc_info .tc_name').html(t.find('.tb_title').text());
		if(!t.hasClass('self_define')){
			allprice = price;
			$('.price_show').attr('data-price',price);
			count_price = allprice;
		}else{
            packageCurr = -1;
			$('.self_define .dd_item').each(function(){
				if($(this).hasClass('item_chosed')){
					var t = $(this);
					allprice = t.attr('data-price')*1+allprice
				}
			});
			$('.price_show').attr('data-price',allprice);
			count_price = allprice;
		}

		formatNum(count_price)

		for(var m = 0; m < promotions.length; m++){
			if(allprice>=promotions[m][0] && m<(promotions.length-1) && allprice<promotions[m+1][0] ){
				$('#scroll_div').hide();
				$('.hui_tip').removeClass('fn-hide');
				$('.hui_tip em.num_show').html(promotions[m][1]);
				formatNum(allprice)
			}else if(allprice>=promotions[promotions.length-1][0]){
				$('.hui_tip').removeClass('fn-hide');
				$('.hui_tip em.num_show').html(promotions[promotions.length-1][1]);
				$('#scroll_div').hide();
				formatNum(allprice)
			}else if(allprice<promotions[0][0]){
				$('.hui_tip').addClass('fn-hide');
				$('#scroll_div').show();
				formatNum(allprice)
			}
		}
	});

    if(packageCurr == -1){
        $('.tb_right .self_define').click();
    }else{
        $('.tb_right li:eq('+packageCurr+')').click();
    }


	// 同意条款
	$('.agree_box i').click(function(){
		$(this).toggleClass('agreed')
	})

	// 自定义套餐
	$('.dd_item.item_chose').click(function(){
		if(!$(this).hasClass('item_chosed')){
			$(this).addClass('item_chosed').find('span').text(langData['business'][1][12]);  //已选择
		}else{
			$(this).removeClass('item_chosed').find('span').text(langData['business'][0][38])  //选择
		}
	});


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
				   $('.left_area span').html('+' + codeArea);
				   $('#areaCode').val(codeArea);
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

	// 区号
	$('.anum_box').delegate('li', 'click', function(){
		var t = $(this);
		var txt = t.find('.fn-right').text();
		t.addClass('achose').siblings('li').removeClass('achose');
		$('.tel_box .left_area span').html(txt)
		$('#areaCode').val(txt.replace('+', ''));
		$('.pop_box.anum_box').animate({'bottom':'-88%'},200);
		$('html').addClass('noscroll');
	});

	// 时间选择窗口
	$('.bottom_box .left_box').click(function(){
		$('.pop_box').animate({"bottom":'-88%'},200);
		$('.mask_pop1').show();
		$('.tl_box').animate({"bottom":'0'},200);
		$('html').addClass('noscroll');
	});

	// 选择时间
	$('.tl_box').delegate('.timeList li','click',function(){
		var t = $(this),time = t.attr('data-year')
		val = t.text();
		$('#time').val(time)
		t.addClass('click').siblings('li').removeClass('click');
		$('.pop_box').animate({"bottom":'-88%'},200);
		$('.tc_time').html(val);
		$('.pop_box').animate({"bottom":'-88%'},200);
		$('html').removeClass('noscroll');
		$('.mask_pop1').hide();
		$('.price_show').attr('data-year',time);
		var price = $('.price_show').attr('data-price');
		allprice = (parseFloat(price)*time).toString();
		formatNum(price);
	});

	// 格式化数组
	function formatNum(price){
       console.log(price)
        var time = $('.price_show').attr('data-year');
        var allprice = allprice_ = price*time;
        var hflag = 0,pflag = 0;
		for(var m = 0; m < promotions.length; m++){

			if(allprice>=promotions[m][0] && m<(promotions.length-1) && allprice<promotions[m+1][0] ){
				$('#scroll_div').hide();
				$('.hui_tip').removeClass('fn-hide');
				$('.hui_tip em.num_show').html(promotions[m][1]);
				allprice = allprice_-promotions[m][1]
			}else if(allprice>=promotions[promotions.length-1][0]){
				$('.hui_tip').removeClass('fn-hide');
				$('.hui_tip em.num_show').html(promotions[promotions.length-1][1]);
				$('#scroll_div').hide();
				allprice = allprice_-promotions[promotions.length-1][1]
			}else if(allprice<promotions[0][0]){
				$('.hui_tip').addClass('fn-hide');
				hflag = 1;
			}
		}
		for(var n=0; n<integrals.length; n++){
			if(time>=integrals[n][0] && n<(integrals.length-1) && time<integrals[n+1][0]){
				pflag = 0;
				$('#scroll_div').hide();
				$('.point_tip').removeClass('fn-hide');
				$('.integrals_show').html(integrals[n][1])
			}else if(time>=integrals[integrals.length-1][0]){
				pflag = 0;
				$('#scroll_div').hide();
				$('.point_tip').removeClass('fn-hide');
				$('.integrals_show').html(integrals[integrals.length-1][1])
			}else  if(time<integrals[0][0]){
				$('.point_tip').addClass('fn-hide');
				pflag = 1;
			}
		}
		if(hflag && pflag){
			 $('#scroll_div').show();
		}

        allprice = parseFloat(allprice).toFixed(2);
		var num = allprice.toString()
		var qian = (num.indexOf(".")<0)?num:num.substring(0,num.indexOf("."));
		var hou = '00';
		if(num.indexOf(".")>-1){
			hou = (num.substr(num.indexOf(".")+1,2).length==2)?num.substr(num.indexOf(".")+1,2):(num.substr(num.indexOf(".")+1,2)+'0')
		}
		$('.price_show').html(echoCurrency('symbol')+'<span class="dot_left">'+qian+'</span>.<span class="dot_right">'+hou+'</span>' );
	}


	// 取消按钮
	$('.cancel').click(function(){
		var t = $(this);
		t.parents('.pop_box').animate({"bottom":'-88%'},200);
		$('.mask_pop,.mask_pop1').hide();
		$('html').removeClass('noscroll');
	});

	// 显示优惠信息
	$('.hui_box').click(function(){
		$('.pop_box').animate({"bottom":'-88%'},200);
		$('.mask_pop1').show();
		$('.hd_box').animate({"bottom":'0'},200);
		$('html').addClass('noscroll');
	});

	//隐藏弹出层
	$('.mask_pop1').click(function(){
		$(this).hide();
		$('.pop_box').animate({"bottom":'-88%'},200);
		$('html').removeClass('noscroll');
	});


	// 模拟绑定手机
	$('.right_btn').click(function(){

		//提交订单
		var t = $(this);
		if(t.hasClass('disabled')) return false;

		//判断是否登录
		var userid = $.cookie(cookiePre + "login_user");
		if (userid == null || userid == "") {
			window.location.href = masterDomain + '/login.html';
			return false;
		}else if(!$('.agree_box i').attr('class').includes('agreed')){
            $(".payBeforeLoading").hide();
			showMsg('请同意《商家入驻服务协议》');
			return false
		}

		$('.pop_box').animate({"bottom":'-88%'},200);
		var tctime = $("#time").val();
		if(!tctime){
			showMsg(langData['business'][1][13]);   //请选择套餐时间
			return false;
		}
		if(t.hasClass('rz_btn') && phonecheck ==0 && joinCheckPhone == 0){
			$('.mask_pop').show();
			$('.bp_box').animate({"bottom":'0'},200);
			$('html').addClass('noscroll');
			return false;
		}else if(phonecheck ==''){
			window.location.href= masterDomain+"/login.html";
		}


        //自选套餐
		var packageCon = [];
		if(packageCurr < 0){
			$('.self_define').find('.item_chosed').each(function(){
				packageCon.push($(this).data('name'));
			});
			if(packageCon.length == 0){
				showErrAlert("请勾选要开通的特权！");
				return false;
			}
		}

		t.addClass('disabled');
		t.html('提交中...');

		$.ajax({
			url: masterDomain+"/include/ajax.php",
			type: "post",
			data: {
				'service': 'member',
				'action': 'joinBusinessOrder',
				'package': packageCurr,
				'packageItem': packageCon.join(','),
				'time': tctime
			},
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){

                    payVue.paySuccessCall = function(){
                        location.href = busiDomain;
                    }

                    if(typeof data.info == 'string' && data.info.indexOf('http') > -1){
                        showErrAlert('入驻成功');
                        $('.payBeforeLoading').hide();
                        setTimeout(function(){
                            location.href = data.info;
                        }, 1000);
                        return;
                    }

					//提交成功，跳转到支付页面
					t.removeClass('disabled');
					t.html('立即入驻');
					sinfo = data.info;
					service   = 'member';
					$('#ordernum').val(sinfo.ordernum);
					$('#action').val('pay');

					$('#action_1').val('checkJoinPayAmount');
					$('#action_2').val('joinBusinessPay');

					$("#paction").val('joinBusinessPay');
					$("#amout").text(sinfo.order_amount);
					$('.payMask').show();
					$('.payPop').css('transform', 'translateY(0)');
					//
					// if (totalBalance * 1 < sinfo.order_amount * 1) {
					//
					// 	$("#moneyinfo").text('余额不足，');
					//
					// 	$('#balance').hide();
					// }
					if (totalBalance * 1 < sinfo.order_amount * 1) {

						$("#moneyinfo").text('余额不足，');
						$("#moneyinfo").closest('.check-item').addClass('disabled_pay')

						$('#balance').hide();
					}



		          if(monBonus * 1 < sinfo.order_amount * 1  &&  bonus * 1 >= sinfo.order_amount * 1){
		            $("#bonusinfo").text('额度不足，');
		            $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
		          }else if( bonus * 1 < sinfo.order_amount * 1){
		            $("#bonusinfo").text('余额不足，');
		            $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
		          }else{
		            $("#bonusinfo").text('');
		            $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
		          }


					ordernum = sinfo.ordernum;
					order_amount = sinfo.order_amount;

					payCutDown('', sinfo.timeout, sinfo);

				}else{
					showErrAlert(data.info);
					t.removeClass('disabled');
					t.html('重新提交');
				}
			},
			error: function(){
				showErrAlert('网络错误，请稍候重试！');
				t.removeClass('disabled');
				t.html('重新提交');
			}
		});

	});

	// 区号
	$('#form_box .left_area').click(function(){
		$('.anum_box').animate({"bottom":'0'},200);
		$('html').addClass('noscroll');
	});

	$('.back').click(function(){
		$('.anum_box').animate({"bottom":'-88%'},200);
		$('html').removeClass('noscroll');
	});


	$('#tel,#code').bind('input propertychange', function() {
		$('.code_tip').hide();
		if($('#tel').val()!='' && $('#code').val()!=''){
			 $('.sure_btn').removeClass('disabled');
		 }else{
			  $('.sure_btn').addClass('disabled')
		 }
	});


    // 绑定手机号
	$('#form_box .sure_btn').click(function(){
		var t = $(this);
		if(t.hasClass('disabled')) return false;
		t.addClass('disabled');
		$.ajax({
			url: masterDomain+"/include/ajax.php?service=member&action=updateAccount&do=chphone",
			data: "areaCode="+$("#areaCode").val()+"&phone="+$('#tel').val()+"&vdimgck="+$('#code').val(),
			type: "get",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					phonecheck = 1;
					$('.bottom_box .right_btn').addClass('publicpaybtn').click();
					$('.bp_box .cancel').click();
				}else{
					showErrAlert(data.info);
				}
				t.removeClass('disabled');
			},
            error: function(){
                showErrAlert(langData['siteConfig'][20][173]);  //网络错误，发送失败！
                t.removeClass('disabled');
            }
		});

	});



	var dataGeetest = "";
	//发送验证码
   function sendVerCode(captchaVerifyParam,callback){
	   var form = $("#form_box");
	   var btn = form.find('.acc_code'), v = form.find("#tel").val(), areaCode = $("#areaCode").val();

	   if(v == ''){
		   showErrAlert(langData['siteConfig'][20][463]);  //请输入手机号码
		   form.find("#phone").focus();
		   return false;
	   }else{

		   //中国大陆手机格式验证
		   if(areaCode == '86'){
			   var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
			   if(!phoneReg.test(v)) {
				   showErrAlert(langData['siteConfig'][20][232]);   //请输入正确的手机号码
				   form.find("#tel").focus();
				   return false;
			   }
		   }

		   btn.attr('disabled', true).val(langData['siteConfig'][7][10]+"..");   //发送中
		   let param = "type=verify&phone="+v+'&areaCode='+areaCode
			if(captchaVerifyParam && geetest == 2){
				param = param + '&geetest_challenge=' + captchaVerifyParam
			}else if(geetest == 1 && captchaVerifyParam){
				param = param +  captchaVerifyParam
			}
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
						// countDown(60, btn);
					   btn.removeAttr('disabled').val(langData['business'][1][1]);   //获取验证码
					   showErrAlert(data.info);
				   }
			   },
			   error: function(){
				   btn.removeAttr('disabled').val(langData['business'][1][1]);   //获取验证码
				   showErrAlert(langData['siteConfig'][20][173]);  //网络错误，发送失败！
			   }
		   });
	   }
   }

	if(geetest){

			//极验验证
			// var handlerPopupReg = function (captchaObjReg) {

			// 	// 成功的回调
			// 	captchaObjReg.onSuccess(function () {
			// 		var validate = captchaObjReg.getValidate();
			// 		dataGeetest = "&terminal=mobile&geetest_challenge="+validate.geetest_challenge+"&geetest_validate="+validate.geetest_validate+"&geetest_seccode="+validate.geetest_seccode;
			// 		sendVerCode();
			// 	});

			// 	window.captchaObjReg = captchaObjReg;
			// };

			captchaVerifyFun.initCaptcha('h5','#codeButton',sendVerCode)	
			//获取验证码
			$("#form_box").delegate('.acc_code', 'click', function(){

				var form = $("#form_box");
				var c = form.find("#areaCode").val();
				var v = form.find("#tel").val();

				if(v == '') {
				  //  alert('请输入手机号码');
					//$('.tel_box .code_tip').text('请输入手机号').show();
					showMsg('请输入手机号')
					form.find("#tel").focus();
					return false;
				}
				//中国大陆手机格式验证
				if(c == '86'){
					var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
					if(!phoneReg.test(v)) {
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
		obj.html(time+(langData['siteConfig'][44][1].replace('1',''))).addClass('disabled');//1秒后重发
		mtimer = setInterval(function(){
			obj.html((--time)+(langData['siteConfig'][44][1].replace('1',''))).addClass('disabled');//1秒后重发
			if(time <= 0) {
				clearInterval(mtimer);
				obj.html(langData['siteConfig'][6][55]).removeClass('disabled');//重新发送
			}
		}, 1000);
	}


	//提示窗
	var showErrTimer;
	function showMsg(txt,time){
		ht = time?time:1500
		showErrTimer && clearTimeout(showErrTimer);
		$(".popMsg").remove();
		$("body").append('<div class="popMsg"><p>'+txt+'</p></div>');
		$(".popMsg p").css({ "left": "50%"});
		$(".popMsg").css({"visibility": "visible"});
		showErrTimer = setTimeout(function(){
			$(".popMsg").fadeOut(300, function(){
				$(this).remove();
			});
		}, ht);
	};

	/**
		* 设置cookie
		* @param name cookie的名称
		* @param value cookie的值
		* @param day cookie的过期时间
		*/
		 function setCookie(name, value, day) {
		  if(day !== 0){     //当设置的时间等于0时，不设置expires属性，cookie在浏览器关闭后删除
			var expires = day * 24 * 60 * 60 * 1000;
			var date = new Date(+new Date()+expires);
			document.cookie = name + "=" + escape(value) + ";expires=" + date.toUTCString();
		  }else{
			document.cookie = name + "=" + escape(value);
		  }
		};

})
