var pageVue = new Vue({
	el:'#page',
	data:{
		pwd:[],
		totalPayAmount:totalAmount, //总价
		totalBalance:totalBalance, //总余额
		balance:false,
		point:false,
		totalPoint:totalPoint,  //总积分
		zuhe:false,    //组合支付
		click:0,    //先点
		timeCut:'00:00:00',  //计时
		dataList:[],
		loading:false,
		paysuccess:0, //订单是否提交
		btn_bottom:true,
		curDown:curDown,
	},
	mounted() {
		var tt = this;
		// 判断支付方式超过2个时按钮置底部
		if($("li.pay").size()>2){
			tt.btn_bottom = true;
		}else{
			tt.btn_bottom = false;
		}
		// $("input[name=paytype]:first").attr("checked", true);
		$(".paytype li").click(function(){
			$(".link_to li").removeClass('selected')
			if($(".paytype li.selected").length > 0){
				$(this).addClass('selected').siblings('li').removeClass('selected')
			}else{
				tt.balance = false;
				setTimeout(function(){
					tt.point = false;
				},10)
			}
		});

		if(tt.curDown){ //支付倒计时
			setInterval(function(){
				tt.timeCut = tt.timer()
			}, 1000)
		}

		// 输入密码
		$(".num_keyboard li:not(.nobg)").off('click').bind('click',function(){
			var t = $(this),txt = t.text();
			if(tt.pwd.length <= 6){
				tt.pwd.push(txt);
			}
		})

		//验证是否在客户端访问
		setTimeout(function(){
			if (device.indexOf('huoniao') > -1) {
				$("#payform").append('<input type="hidden" name="app" value="1" />');
			}else{
				if(navigator.userAgent.toLowerCase().match(/micromessenger/)){
					$("#alipayObj").remove();
				}
			}
			$("input[name=paytype]:first").attr("checked", true);

		}, 500);

		//支付密码回调链接
		if($('.fpwtbox a').size() > 0) {
		    var fogetpwdUrl = $('.fpwtbox a').attr('href');
		    $('.fpwtbox a').attr('href', fogetpwdUrl + (fogetpwdUrl.indexOf('?') > -1 ? '&' : '?') + 'furl=' + encodeURIComponent(location.href));
		}

		//积分商城强制选中使用积分
		if(service =='integral'){
			$('.usePoint').click();
		}


		//验证是否支付成功，如果成功跳转到指定页面
		peerpay = $("#peerpay").val();
		service = $("#service").val();
		if(peerpay!=1 && service!='shop') {
			setTimeout(function () {
				var timer2 = setInterval(function () {

					var type = 1;
					if ($('#service').val() == 'member' || $('#service').val() == 'video') {
						type = 3;
					}

					$.ajax({
						type: 'POST',
						async: false,
						url: '/include/ajax.php?service=member&action=tradePayResult&type=' + type + '&order=' + $("#ordernum").val(),
						dataType: 'json',
						success: function (str) {
							if (str.state == 100 && str.info != "") {
								clearInterval(timer2);
								//如果已经支付成功，则跳转到指定页面
								location.href = str.info;
							}
						}
					});
				}, 2000);
			}, 3000)
		}
	},
	methods:{
		// 密码输入显示
		pwdShow:function(){
			var tt = this;
			$(".mask").show();
			$(".pop_pwd").css({
				'transform':'translateY(0)'
			});
			setTimeout(function(){
				$(".num_keyboard").css({
					'transform':'translateY(0)'
				});
			},100);


		},

		// 隐藏密码
		hidePop:function(){
			var tt =this;

			$(".num_keyboard").css({
				'transform':'translateY(100%)'
			});
			setTimeout(function(){
				$(".pop_pwd").css({
					'transform':'translateY(100%)'
				});
				$(".mask").fadeOut(300);
			},100);
			tt.pwd = [];

		},

		// 删除密码
		delNum:function(){
			var tt = this;
			tt.pwd.pop();
		},


		// 点击提交按钮
		submit(){
			var tt = this;
			var deviceUserAgent = navigator.userAgent;
			var noH5 = deviceUserAgent.indexOf('huoniao') > -1 || deviceUserAgent.toLowerCase().match(/micromessenger/);
			if(tt.pwd.length == 0 && (service=='integral' || $(".useBalance").hasClass('selected'))){
				tt.pwdShow();
				return false;
			}

			if(tt.loading) return false;
			tt.loading = true;

			if(service == 'integral'){
				tt.loading = true;
				$("#payform").submit();
				return;
			}
			$("#action").val(service == "waimai" || service == "huodong" || service == "live" || service == "info"  || service == "video" ? "pay" : ($('#action_1').size() > 0 ? $('#action_1').val() : "checkPayAmount"));

			var data = $("#payform").serialize();

			if(!noH5){
				/*在浏览器中*/
				data += "&returnjson=1";
			}else{
				/*在其他*/
				data += "&returnjson=2";
			}
			if(service == "waimai" || service == "huodong" || service == "live" || service == "info" || service == "video"){
				data += "&check=1";
			}
			var paytype = $("input[name='paytype']").val();
			var useBcount = $("#useBcount").val();
			var usePcount = $("#usePcount").val();
			axios({
				method: 'post',
				url: "/include/ajax.php", // 加随机数防止缓存,
				data:data,
			})
			.then((response)=>{
				var data = response.data;
				tt.loading = false;
				if(data && data.state == 100){
					// 隐藏密码输入框
					$(".mask").hide();
					$(".num_keyboard,.pop_pwd").css({
						'transform':'translateY(100%)'
					});

					$("#action").val($('#action_2').size() > 0 ? $('#action_2').val() : "pay");

					if(service == 'waimai'){
					  utils.removeStorage("wm_cart_" + $('#shopid').val());
					}
					$("#payform").submit();
					paysuccess = 1;  //订单已经成功提交
					setTimeout(function(){
					    if(device.indexOf('huoniao') > -1) {
					        setupWebViewJavascriptBridge(function (bridge) {
					            bridge.callHandler('pageClose', {}, function (responseData) {
					            });
					        });
					    }

					}, 3000);
					// 调用微信支付
					if(noH5) {
						if (paytype == 'wxpay' && data.info && (data.info * 1) > 0) {
							if (typeof WeixinJSBridge == "undefined") {
								if (document.addEventListener) {
									document.addEventListener('WeixinJSBridgeReady', tt.jsApiCall, false);
								} else if (document.attachEvent) {
									document.attachEvent('WeixinJSBridgeReady', tt.jsApiCall);
									document.attachEvent('onWeixinJSBridgeReady', tt.jsApiCall);
								}
							} else {
								tt.jsApiCall();
							}
						}
					}else{
						// location.href = data.info;
						// $("#payform").submit();
					}

				}else{
					if(!tt.paysuccess){
						if(data.info.indexOf('超时') > -1){
							location.href = location.href + (location.href.indexOf('?') > -1 ? '&' : '?') + 'currentPageOpen=1'
						}else{
							$("#action").val("pay");
							if(data.info.indexOf('密码') <= -1){
								tt.hidePop();  //隐藏密码框
								setTimeout(function(){
									showErrAlert(data.info);
								},500)

							}else{
								showErrAlert(data.info);
								tt.pwd = [];
							}

						}
					}
				}
			})

		},

		// 倒计时

		timer:function() {
			var timenow = new Date();
			timenow = timenow.valueOf()
			timeEnd = (new Date('2021-05-10')).valueOf()
			timeCount = parseInt((timeEnd - timenow)/1000)

			if(timeCount <= 0){
				$('.timebox').hide();
				return;
			}
			var time = timeCount;
			var d = parseInt(time / (60 * 60 * 24));
			var h = parseInt(time / 60 / 60 % 24);
			var m = parseInt(time / 60 % 60);
			var s = parseInt(time % 60);
			return (h>9?h:'0'+h)+':'+(m>9?m:'0'+m)+':'+(s>9?s:'0'+s);
		},

		// 计算
		computed:function(){
			var tt = this;
			$(".link_to li").removeClass('selected')
			$(".paytype li").removeClass('selected');
			// $(".paytype li input[name='paytype']").removeAttr('checked')
			if(tt.click == 1 && tt.balance){
				if( tt.totalBalance >= tt.totalPayAmount){
					var txt = langData['siteConfig'][56][5]+ echoCurrency('symbol') + tt.totalPayAmount.toFixed(2);  //本次使用
					$(".useBalance").find('.rtx').hide();
					$(".useBalance").find('.pay_tip').html(txt).show();
					tt.zuhe = false;
					$('#useBcount').val(tt.totalPayAmount)
					tt.totalPayAmount = 0;
				}else{
					tt.totalPayAmount = tt.totalPayAmount - tt.totalBalance.toFixed(2)
					var txt = langData['siteConfig'][56][5] + echoCurrency('symbol') + tt.totalBalance.toFixed(2);
					$(".useBalance").find('.rtx').show();
					$(".useBalance").find('.pay_tip').html(txt).show();
					$('#useBcount').val(tt.totalBalance)
					$(".paytype li:first-child").addClass('selected').find("input[name='paytype']").attr('checked',true)
					tt.zuhe = true;  //需要组合
				}
			}

			if(tt.click == 2 && tt.point){
				if( tt.totalPoint/pointRatio >= tt.totalPayAmount){
					if(tt.totalPayAmount*pointRatio == parseInt(tt.totalPayAmount*pointRatio)){
						var txt = langData['siteConfig'][56][4].replace('0',(tt.totalPayAmount*pointRatio + pointName)) .replace(' 1 ',(echoCurrency('symbol') + tt.totalPayAmount))
						$(".usePoint").find('.rtx').hide();
						$(".usePoint").find('.pay_tip').html(txt).show();
						$('#usePcount').val(parseInt(tt.totalPayAmount*pointRatio))
						tt.totalPayAmount = 0
						tt.zuhe = false;
					}else{
						var txt = langData['siteConfig'][56][4].replace(' 0 ',(parseInt(tt.totalPayAmount*pointRatio) + pointName)) .replace(' 1 ',(echoCurrency('symbol') + parseInt(tt.totalPayAmount*pointRatio)))
						$(".usePoint").find('.rtx').show();
						$(".usePoint").find('.pay_tip').html(txt).show();
						$('#usePcount').val(parseInt(tt.totalPayAmount*pointRatio));
						tt.totalPayAmount = tt.totalPayAmount - parseInt(tt.totalPayAmount*pointRatio)/pointRatio;
						tt.zuhe = true;
						$(".paytype li:first-child").addClass('selected').find("input[name='paytype']").attr('checked',true)
					}

				}else{
					tt.totalPayAmount = tt.totalPayAmount - tt.totalPoint/pointRatio
					$(".usePoint").find('.rtx').show();
					// var txt = '本次使用'+tt.totalPoint+'积分抵扣'+ echoCurrency('symbol') + tt.totalPoint/pointRatio;
					var txt = langData['siteConfig'][56][4].replace(' 0 ',(tt.totalPoint + pointName)).replace(' 1 ',(echoCurrency('symbol') + tt.totalPoint/pointRatio))
					$(".usePoint").find('.pay_tip').html(txt).show();
					$('#usePcount').val(tt.totalPoint);

					$(".paytype li:first-child").addClass('selected').find("input[name='paytype']").attr('checked',true)
					tt.zuhe = true;  //需要组合
				}
			}

			if(!tt.click){
				tt.totalPayAmount = totalAmount;
				$(".usePoint").find('.rtx').hide();
				$(".useBalance").find('.rtx').hide();
				$(".usePoint").find('.pay_tip').html('').hide();
				$(".useBalance").find('.pay_tip').html('').hide();
				if($('.paytype li.selected').size() == 0){
					$(".paytype li:first-child").addClass('selected').find("input[name='paytype']").attr('checked',true)
				}
			}



		},

		// 微信支付
		onBridgeReady:function(){
			WeixinJSBridge.invoke(
			    'getBrandWCPayRequest', {
			         "appId":"wx2421b1c4370ec43b",     //公众号ID，由商户传入
			         "timeStamp":"1395712654",         //时间戳，自1970年以来的秒数
			         "nonceStr":"e61463f8efa94090b1f366cccfbbb444", //随机串
			         "package":"prepay_id=u802345jgfjsdfgsdg888",
			         "signType":"MD5",         //微信签名方式：
			         "paySign":"70EA570631E4BB79628FBCA90534C63FF7FADD89" //微信签名
			      },
			      function(res){
			      if(res.err_msg == "get_brand_wcpay_request:ok" ){
					alert(111)
			      // 使用以上方式判断前端返回,微信团队郑重提示：
			            //res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
			      }
			   });

		},

		// 微信或者小程序
		jsApiCall:function(){
			var tt = this;
			var wx_miniprogram;
			wx.miniProgram.getEnv(function (res) {
			    wx_miniprogram = res.miniprogram;
			});

			//小程序
			if(window.__wxjs_environment == 'miniprogram' || wx_miniprogram){
			    var params = '?timestamp='+jsApiParameters.timeStamp+'&nonceStr='+jsApiParameters.nonceStr+'&signType='+jsApiParameters.signType+'&paySign='+encodeURIComponent(jsApiParameters.paySign)+'&prepay_id='+(jsApiParameters.package).replace('prepay_id=', '')+'&returnUrl='+encodeURIComponent('{#$returnUrl#}');
			    var path = '/pages/pay/pay'+params;
			    wx.miniProgram.redirectTo({url: path});

			//公众号
			}else{
			    tt.onBridgeReady()
			}
		},

		// 代付
		shareTo:function(){
			$(".HN_PublicShare").click();
			var el = event.currentTarget;
			$('.pay_list li').removeClass('selected')
			$(el).addClass('selected')

		},

	},
	watch:{
		pwd:function(){
			var tt = this
			if(tt.pwd.length == 6){  //密码输入6位
				$("#pwd").val(tt.pwd.join(''))
				tt.submit(pwd);  //提交

			}
		},
		point:function(){
			var tt = this;
			if(tt.point){  //选中情况下
				if(tt.click == 0){
					tt.click = 2;
					tt.computed()
				}else{
					if(!tt.zuhe){
						tt.balance = false;
						tt.click = 2;
						tt.computed()
					}else{
						$(".paytype li").removeClass('selected');
						// $(".paytype li input[name='paytype']").removeAttr('checked')
						if( tt.totalPoint/pointRatio >= tt.totalPayAmount){
							if(tt.totalPayAmount*pointRatio == parseInt(tt.totalPayAmount*pointRatio)){
								// var txt = '本次使用'+(tt.totalPayAmount*pointRatio)+'积分抵扣'+ echoCurrency('symbol') + tt.totalPayAmount;
								var txt = langData['siteConfig'][56][4].replace(' 0 ',(tt.totalPayAmount*pointRatio + pointName)) .replace(' 1 ',(echoCurrency('symbol') + tt.totalPayAmount))
								$(".usePoint").find('.rtx').hide();
								$(".usePoint").find('.pay_tip').html(txt).show();
								$('#usePcount').val(parseInt(tt.totalPayAmount*pointRatio))
								tt.totalPayAmount = 0
								tt.zuhe = false;
							}else{
								// var txt = '本次使用'+parseInt(tt.totalPayAmount*pointRatio)+'积分抵扣'+ echoCurrency('symbol') + parseInt(tt.totalPayAmount*pointRatio);
								var txt = langData['siteConfig'][56][4].replace(' 0 ',(parseInt(tt.totalPayAmount*pointRatio) + pointName)) .replace(' 1 ',(echoCurrency('symbol') + parseInt(tt.totalPayAmount*pointRatio)))
								$(".usePoint").find('.rtx').show();
								$(".usePoint").find('.pay_tip').html(txt).show();
								$('#usePcount').val(parseInt(tt.totalPayAmount*pointRatio));
								tt.totalPayAmount = tt.totalPayAmount - parseInt(tt.totalPayAmount*pointRatio)/pointRatio;
								$(".paytype li:first-child").addClass('selected').find("input[name='paytype']").attr('checked',true)
								tt.zuhe = true;
							}
						}else{
							tt.totalPayAmount = tt.totalPayAmount - tt.totalPoint/pointRatio
							// var txt = '本次使用'+tt.totalPoint+'积分抵扣'+ echoCurrency('symbol') + tt.totalPoint/pointRatio;
							var txt = langData['siteConfig'][56][4].replace(' 0 ',(tt.totalPoint + pointName)) .replace('1',(echoCurrency('symbol') + tt.totalPoint/pointRatio))
							$(".usePoint").find('.rtx').show();
							$(".usePoint").find('.pay_tip').html(txt).show();
							$('#usePcount').val(tt.totalPoint)
							$(".paytype li:first-child").addClass('selected').find("input[name='paytype']").attr('checked',true)
							tt.zuhe = true;  //需要组合
						}
					}
				}

			}else{
				if((tt.click == 2 && !$(".useBalance").hasClass('selected')) ||  $(".otherType li.selected").length==0){
					tt.click = 0;
				}else{
					tt.click = 1;
				}
				$(".usePoint").find('.pay_tip').html('').hide();
				$(".usePoint").find('.rtx').hide();
				$('#usePcount').val('');
				tt.totalPayAmount = totalAmount
				tt.computed()
			}

		},

		balance:function(){
			var tt = this;
			if(tt.balance){  //选中情况下
				if(tt.click == 0){
					tt.click = 1;
					tt.computed()
				}else{
					if(!tt.zuhe){
						tt.click = 1;
						tt.point = false;
						tt.computed()
					}else{
						$(".paytype li").removeClass('selected');
						// $(".paytype li input[name='paytype']").removeAttr('checked')
						console.log($(".paytype li input[name='paytype']").length)
						if( tt.totalBalance >= tt.totalPayAmount){
							var txt = langData['siteConfig'][56][5] + echoCurrency('symbol') + tt.totalPayAmount.toFixed(2);
							$(".useBalance").find('.rtx').hide();
							$(".useBalance").find('.pay_tip').html(txt).show();
							$('#useBcount').val(tt.totalPayAmount);
							tt.totalPayAmount = 0;
							tt.zuhe = false;
						}else{
							tt.totalPayAmount = tt.totalPayAmount - tt.totalBalance
							var txt = langData['siteConfig'][56][5] + echoCurrency('symbol') + tt.totalBalance.toFixed(2);
							$(".useBalance").find('.rtx').show();
							$(".useBalance").find('.pay_tip').html(txt).show();
							$('#useBcount').val(tt.totalBalance)
							$(".paytype li:first-child").addClass('selected').find("input[name='paytype']").attr('checked',true)
							tt.zuhe = true;  //需要组合
						}
					}
				}
			}else{
				if((tt.click == 1 && !$(".usePoint").hasClass('selected')) || $(".otherType li.selected").length==0){
					tt.click = 0;
				}else{
					tt.click = 2;
				}
				$(".useBalance").find('.rtx').hide();
				$(".useBalance").find('.pay_tip').html('').hide();
				$('#useBcount').val('');
				tt.totalPayAmount = totalAmount
				tt.computed();
				console.log(tt.click)
			}

		}
	}

})
