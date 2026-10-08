new Vue({
	el: '#app',
	data() {
		return {
			// 选中状态
			curr: 50,
			// 是否勾选 提现协议
			isChecked: false,
			// 首次进入页面默认选中50
			needAmount:(50/pointRatio).toFixed(2),
			// 自定义输入数量
			userAmount:'',
			// 后台设置的兑换比例
			pointRatio:''
		}
	},
	methods: {
		// 选择充值多少积分
		selectWithdrawWay(item) {
			this.curr = item
			this.needAmount=(item/this.pointRatio).toFixed(2);
		},
		// 自定义输入数量方法
		changeNeedAmount(){
			const regex = /^-?\d+\.?\d*$/;
			if (!regex.test(this.userAmount) || this.userAmount == '' || this.userAmount<=0) {
				this.$message.error('请输入正确的金额');
			    this.userAmount = ''
				this.needAmount=0
			    return
			}
			console.log(this.userAmount);
			this.needAmount=(this.userAmount/this.pointRatio).toFixed(2);
		},
		// 自定义输入数量失去焦点方法
		focusNeedAmount(){
		    this.curr=null;
		    this.needAmount=0;
			if(this.userAmount != ''){
				this.needAmount=(this.userAmount/this.pointRatio).toFixed(2);
			}
		},
		// 表单提交按钮,不同的提现方式,调用不同的提现方法
		submitBtn() {
			if (this.needAmount <=0 ) {
				this.$message.error('请输入正确的金额');
				return;
			}else if (!this.isChecked) {
				this.$message.error('请勾选'+pointName+'充值协议');
				return;
			}else{
                 $(".submit").prop("disabled", true);
				/**接口请求方法开始*/
				var depositPrice=this.needAmount;
				var timer = null;
				var timer_trade = null;
				var t = $(this);
				$('.pay_balance').hide();
				$('.pay_bonus').hide();
				$('#balance').hide();
				$.ajax({
					type: 'POST',
					url: '/include/ajax.php?service=member&action=recharge&amount='+depositPrice,
					dataType: 'json',
					success: function(str){
						var cutDown;
						info = str.info;
						if(str.state == 100 && str.info != ""){
							cutDown = setInterval(function () {
								$(".payCutDown").html(payCutDown(info.timeout));
							},1000)
							var datainfo = [];
							for(var k in info) {
								datainfo.push(k+'='+info[k]);
							}
							$("#module").val('deposit');
							$("#amout").text(info.order_amount);
							$('.payMask').show();
							$('.payPop').show();
							if(timer_trade != null){
								clearInterval(timer_trade);
							}
							ordernum     = info.ordernum;
							order_amount = info.order_amount;
							var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
							$('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));
						}
					},
					complete: function() {
                    setTimeout(function() {
                       $(".submit").prop("disabled", false); // 请求完成后，启用按钮
                    }, 1000); // 延迟1000毫秒后再启用按钮
                     }
				});
				//验证是否支付成功，如果成功跳转到指定页面
				if(timer != null){
					clearInterval(timer);
				}
				timer = setInterval(function(){
					$.ajax({
						type: 'POST',
						async: false,
						  url: '/include/ajax.php?service=member&action=tradePayResult&type=2&order='+ordernum,
						dataType: 'json',
						success: function(str){
							if(str.state == 100 && str.info != ""){
								//如果已经支付成功，则跳转到指定页面
								location.href = str.info;
							}
						}
					});
				}, 2000);
				/**接口请求方法结束*/
			}
		},
	},
	mounted() {
		this.pointRatio=pointRatio
	}
})
