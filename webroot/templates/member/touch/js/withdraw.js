new Vue({
	el: '#app',
	data() {
		return {
			from:'',
			isDataReady:false,
			realname:'',
			BindWeixin:'',
			// 存储到localStorage中的所有用户数据
			userData: {},
			// 全部提现金额
			allAmount: null,
			minAmount:null,
			maxWithdraw:null,
			// 手续费率
			rate: 0,
			withdrawFee:0,
			// 改变手续费率颜色
			changeRateColor: false,
			// 请选择账号 是否显示
			isShow: true,
			// 申请提现按钮 disabled状态
			isClick: true,
			// 选择微信账号 是否显示
			weixinIsShow: false,
			// 选择支付宝账号 是否显示
			alipayIsShow: false,
			// 选择银行卡账号 是否显示
			bankIsShow: false,
			// 首次提现未绑定微信弹出框 是否显示
			firstPopup: false,
			// 未绑定微信弹出框 是否显示
			noWeixinPopup: false,
			// 已绑定微信弹出框 是否显示
			hasWeixinPopup: false,
			// 全部添加过弹出框 是否显示
			allAddPopup: false,
			// 用户输入的提现金额
			amountNum: '',
			// 金额小于1元提示
			showWithdrawLimit: false,
			// 用户选银行名称
			bank: '请选择',
			bankCode:'',
			// 开户行
			bankName:'',
			// 开户人姓名
			cardname:'',
			// 银行卡号
			cardnum:'',
			// 支付宝信息
			alipayData: {
				// 收款方式
				bank:'alipay',
				// 收款人姓名
				cardname:'',
				// 支付宝账号
				cardnum:'',
				cardnumLast:''
			},
			// 银行卡信息
			bankData: {
				// 用户选银行名称
				bank: '请选择',
				bankCode:'',
				// 开户行
				bankName:'',
				// 开户人姓名
				cardname:'',
				// 银行卡号
				cardnum:'',
				cardnumLast:''
			},
			// 支付宝和银行卡的账号记录
			historyData: {
				alipay:[],
				bank:[]
			},
            loading: false
		}
	},
	methods: {
		// 格式化日期
		formatDate() {
			// 创建一个新的Date对象
			var currentDate = new Date();
			// 获取年、月、日、小时、分钟和秒
			var year = currentDate.getFullYear();
			var month = ('0' + (currentDate.getMonth() + 1)).slice(-2); // 月份从0开始，所以要加1
			var day = ('0' + currentDate.getDate()).slice(-2);
			var hours = ('0' + currentDate.getHours()).slice(-2);
			var minutes = ('0' + currentDate.getMinutes()).slice(-2);
			var seconds = ('0' + currentDate.getSeconds()).slice(-2);
			// 格式化日期和时间
			var formattedDateTime = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' +
				seconds;
			return formattedDateTime;
		},
		// 选择对应的账号，弹出对应的提示框
		
		selectAccount() {
			if(!this.isDataReady){
				return;
			}
				if(this.BindWeixin==true && this.historyData.alipay.length != 0 && this.historyData.bank.length != 0){
					this.allAddPopup = true;
					return;
			}else if  (this.BindWeixin == true && (this.historyData.alipay.length==0 || this.historyData.bank.length ==0)){
					this.hasWeixinPopup=true
					return;
			} else if (this.BindWeixin==false && this.historyData.alipay.length != 0 || this.historyData.bank.length != 0) {
					this.noWeixinPopup = true;
					return;
			} else {
					this.firstPopup = true;
					return;
			}
		},
		addWeixinAccount(){
            if(from == 'wmsj'){

                var that = this;
                var ahref = bindwxUrl.replace('wxMiniprogram://',"");
                var miniId = ahref.split('?/')[0],  //小程序原始id
                path = ahref.split('?/')[1];  //跳转的路径
                miniId = miniId.split('/')[0];
                path = path == undefined ? '' : path;

                this.allAddPopup = false;
                this.hasWeixinPopup=false;
                this.noWeixinPopup = false;
                this.firstPopup = false;

                that.loading = true;
                setTimeout(function(){
                    setupWebViewJavascriptBridge(function(bridge) {
                        if(path){
                            bridge.callHandler('redirectToWxMiniProgram', {'id':miniId,'path': path},  function(responseData){});
                        }else{
                            bridge.callHandler('redirectToWxMiniProgram', {'id':miniId,'path':''},  function(responseData){});
                        }
                        bindwxInterval = setInterval(function(){
                            that.checkBindWx()
                        },1000)
                    });
                },1000)

                setTimeout(function(){
                    that.loading = false;
                }, 2000);

                // var popOptions = {
                //     title: '温馨提示', //'确定删除信息？',  //提示文字
                //     btnCancelColor: '#407fff',
                //     isShow: true,
                //     confirmHtml: '<p style="margin-top:.2rem;">请在微信中登录商家账号后绑定微信！</p>' , //'一经删除不可恢复',  //副标题
                //     btnCancel: '好的，知道了',
                //     noSure: true
                // }
                // confirmPop(popOptions);
                
            }else{
                location.href=memberDomain+'/connect.html'
            }
		},

        checkBindWx(){

            $.ajax({
                url: '/include/ajax.php?service=waimai&action=getWmsjOpenid&did='+wmsj_userid,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if(data && data.state == 100){
                        clearInterval(bindwxInterval);
                        location.reload();                  
                    }
                },
                error: function(){}
            });

        },

		// 跳转到添加账号页面，默认选择支付宝
		addAlipayAccount() {
			location.href = memberDomain+'/addAccount.html'+'?from=' + this.from
		},
		// 跳转到添加账号页面,如果带有参数，就跳转到选择银行卡
		addBankAccount() {
			location.href = memberDomain+'/addAccount.html?isShowConent=true'+'&from=' + this.from
		},
		// 提现金额输入框的change事件
		changeAmount() {
			const regex = /^\d+(\.\d{1,2})?$/;
			if (this.amountNum < this.minAmount) {
				this.showWithdrawLimit = true;
				this.rate = withdrawFee;
				this.changeRateColor = false;
				this.isClick = true;
			}else if(this.amountNum > this.maxWithdraw && this.maxWithdraw > 0){
				vant.Dialog({
				message: '单次最多提现'+this.maxWithdraw+echoCurrency('short')
				});
				this.amountNum=this.maxWithdraw
				this.isClick = false;
			}else if(this.amountNum > this.allAmount){
					vant.Dialog({
					message: '提现金额不能大于余额'
				});
				this.amountNum=this.allAmount
				this.isClick = false;
			}else if(!regex.test(this.amountNum)){
				vant.Dialog({
					message: '请输入正确的金额'
				});
				this.amountNum=''
			}else {
				this.showWithdrawLimit = false;
				this.rate=(Number(this.amountNum) * Number(this.withdrawFee) *0.01).toFixed(2);
				this.changeRateColor = true;
				this.isClick = false;
			}
			this.changeRateColor = true;
			this.rate=(Number(this.amountNum) * Number(this.withdrawFee) *0.01).toFixed(2);
		},
		// 选择微信账号
		selectWeixin() {
			let device = navigator.userAgent.toLowerCase();
			// 判断是否在微信浏览器内
			if(!device.toLowerCase().match(/huoniao_ios/) && device.match(/MicroMessenger/i) != "micromessenger"){  // h5
				var popOptions = {
                      title: '温馨提示', //'确定删除信息？', //提示文字
                      btnCancelColor: '#407fff',
                      isShow:true,
                      confirmHtml: '<p style="margin-top:.2rem;">请在微信浏览器端操作</p>' , //'一经删除不可恢复', //副标题
                      btnCancel: '好的，知道了',
                      noSure: true
                    }
                    confirmPop(popOptions);
			}else if(device.toLowerCase().match(/huoniao_ios/) && (!device.toLowerCase().includes('huoniao_android') || device.toLowerCase().includes('huoniao_harmony')) ){
				// 在苹果端app中 需要用到appid
				let miniGh = wxminiPath_withdraw.replace('wxMiniprogram://','')
				let miniId = miniGh.split('/')[0]
				setupWebViewJavascriptBridge(function (bridge) {
                    bridge.callHandler('redirectToWxMiniProgram', { 'id': miniId, 'path': `/pages/redirect/index?url=${encodeURIComponent(window.location.href)}` }, function (responseData) { });
                });
			}else {
				this.isShow = false;
				this.hasWeixinPopup = false;
				this.allAddPopup = false;
				this.noWeixinPopup = false;
				this.weixinIsShow = true;
				this.bankIsShow = false;
				this.alipayIsShow = false;
				this.bank = 'weixin';
				this.cardname = '';
				this.cardnum = ''
			}
		},
		// 微信用户确认收款
		wechatSureGet(rdata,id){
			const that = this;
			if(wx_miniprogram){
				// alert('是在小程序中,需要跳转页面')
				let params = `?package=${encodeURIComponent(rdata.package_info)}&appid=${rdata.appid}&mchid=${rdata.mchid}`
				wx.miniProgram.navigateTo({url: '/pages/merchantTransfer/merchantTransfer' + params});
			}else{
				wx.ready(function(res){
			    	wx.checkJsApi({
						jsApiList: ['requestMerchantTransfer'],
						success: function (res) {
							if (res.checkResult['requestMerchantTransfer']) {
								WeixinJSBridge.invoke('requestMerchantTransfer', {
									mchId: rdata.mchid ,
									appId: rdata.appid ,
									package: rdata.package_info ,
								},
								function (res) {
									var url = withdrawLog.replace("%id%", id);
									setTimeout(() => {
										location.href = url+'?from=' + that.from;
									}, 500);
									if (res.err_msg === 'requestMerchantTransfer:ok') {
									// res.err_msg将在页面展示成功后返回应用时返回success，并不代表付款成功
									}
								});
							} else {
								alert('你的微信版本过低，请更新至最新版本。');
								var url = withdrawLog.replace("%id%", id);
								setTimeout(() => {
									location.href = url+'?from=' + that.from;
								}, 500);
							}
						},
						fail:function(res){
							console.log(res)
						},
					});
			    })
			}
		},
		// 选择支付宝账号
		selectAlipay(item) {
			this.isShow = false;
			this.allAddPopup = false;
			this.hasWeixinPopup = false;
			this.noWeixinPopup = false;
			this.weixinIsShow = false;
			this.alipayIsShow = true;
			this.bankIsShow = false;
			this.bank = item.bank;
			this.cardname = item.cardname;
			this.cardnum = item.cardnum
		},
		// 选择银行卡账号
		selectBank(item) {
			this.isShow = false;
			this.hasWeixinPopup = false;
			this.allAddPopup = false;
			this.noWeixinPopup = false;
			this.weixinIsShow = false;
			this.alipayIsShow = false;
			this.bankIsShow = true;
			this.bank = item.bank;
			this.bankCode=item.bankCode
			this.bankName = item.bankName;
			this.cardnum = item.cardnum;
			this.cardname = item.cardname;
		},
		// 全部提现的点击事件
		allWithdraw() {
			this.amountNum = this.allAmount;
			this.changeAmount();
		},
		// 申请提现按钮的点击事件
		submitBtn() {
			if (this.isShow) {
				vant.Dialog({
					message: '请选择提现账号'
				});
				return false;
			}
			this.isClick = true;

			const that = this;
			that.otherApply()
		},

		weixinApply(id){
			const that = this;
			let device = navigator.userAgent.toLowerCase();
			that.loading = true;
			$.ajax({
				url: '/include/ajax.php?service=member&action=getWithdrawInfo&id=' + id,
				type: "POST",
				dataType: "json",
				success: function (data) {
					that.loading = false;
					if(data.state == 100){
						// 此处需要区分是微信浏览器还是app
						if(device.match(/MicroMessenger/i) == "micromessenger"){
							that.wechatSureGet(data.info,id); //微信端
						}else if(device.toLowerCase().includes('huoniao_android')){ //安卓端
							let rdata = data.info
							setupWebViewJavascriptBridge(function(bridge) {
								bridge.callHandler('wxConfirmReceipt', {'mchId': rdata.mchid,'appId': rdata.appid,'package': encodeURIComponent(rdata.package_info),}, function(res){
									console.log('安卓端提现,需判断是否成功');
									setTimeout(() => {
										var url = withdrawLog.replace("%id%", response.data.info);
										setTimeout(() => {
											location.href = url+'?from=' + that.from;
										}, 500);
									}, 2000);
								});
							})
						}
					}else{
						var url = withdrawLog.replace("%id%", id);
						setTimeout(() => {
							location.href = url+'?from=' + that.from;
						}, 500);
					}
				},
				error: function (xhr, status, error) {
					that.loading = false;
				}
			});
		},

		otherApply(){
			let that = this;
			that.loading = true;
			const data=`bank=${this.bank}&bankCode=${this.bankCode}&bankName=${this.bankName}&cardnum=${this.cardnum}&cardname=${this.cardname}&amount=${this.amountNum}&from=${this.from}`;
			axios.post(`/include/ajax.php?service=member&action=withdraw`,data)
			.then(response =>{
				that.loading = false;
				if(response.data.state == 100){
					if(that.bank == 'weixin'){
						that.weixinApply(response.data.info);
					}else{
						var url = withdrawLog.replace("%id%", response.data.info);
						setTimeout(() => {
							location.href = url+'?from=' + this.from;
						}, 500);
					}
					
				}else{
                    //请先进行实名认证
                    if(response.data.info == langData['siteConfig'][33][49]){
                        vant.Dialog.alert({
                            message: response.data.info
                        }).then(() => {
                            location.href = memberDomain + '/security-shCertify.html';
                        });
                    }
                    //请先绑定微信账号
                    else if(response.data.info == langData['siteConfig'][36][7]){
                        vant.Dialog.alert({
                            message: response.data.info
                        }).then(() => {
                            var userid = $.cookie(cookiePre + 'userid');
                            location.href = '/api/login.php?type=wechat&qr='+userid+'&furl='+memberDomain+'/withdraw.html';
                        });
                    }
                    else{
                        vant.Dialog({
                            message: response.data.info
                        });
                    }
				}
			})
			.catch(error => {
				console.log(error);
			}).finally(()=>{
				setTimeout(()=>{
					this.isClick = false;
				},2000)
			})
		},
		// 获取支付宝和银行卡账号记录
		getAllData(){
			axios.all([
				axios.get(`/include/ajax.php?service=member&action=withdraw_card&type=alipay`),
				axios.get(`/include/ajax.php?service=member&action=withdraw_card`)
			]).then(axios.spread((alipayData, bankData) => {
				if(alipayData.data.state == 100){
					this.historyData.alipay=alipayData.data.info;
					this.isAlipayNoData=false;
				}
				if(bankData.data.state == 100){
					this.historyData.bank=bankData.data.info;
					this.isBankNoData=false;
				}
			})).catch(error => {
				console.error(error)
			}).finally(()=>{
				this.isDataReady=true;
			})
		},
	},
	mounted() {
		// APP上取消下拉刷新
		toggleDragRefresh('off');
		this.getAllData()
		// 费率
		this.withdrawFee=withdrawFee;
		// 起提金额
		this.minAmount=minWithdraw
		// 单次最多提现
		this.maxWithdraw=maxWithdraw;
		this.from=from;
		if(this.from == 'invite'){
			this.allAmount=totalCanWithdrawn;
		}else{
			this.allAmount=money;
		}
		this.realname=realname
		if(BindWeixin== 1){
			this.BindWeixin=true;
		}else{
			this.BindWeixin=false;
		}
		// addAccount页面携带参数跳转页面，获取参数
		const params = new URLSearchParams(window.location.search);
		if(params.get('withdrawtype') == 'alipay'){
			this.isShow=false
			this.alipayIsShow=true;
			this.bank=params.get('bank')
			this.cardname=params.get('cardname')
			this.cardnum=params.get('cardnum')
		}else if(params.get('withdrawtype') == 'bank'){
			this.isShow=false
			this.bankIsShow=true;
			this.bank=params.get('bank')
			this.bankCode=params.get('bankCode')
			this.bankName=params.get('bankName')
			this.cardname=params.get('cardname')
			this.cardnum=params.get('cardnum')
		}


		if (navigator.userAgent.toLowerCase().match(/micromessenger/) && typeof(wxconfig) != 'undefined') {
		    wx.config({
		      debug: false,
		      appId: wxconfig.appId,
		      timestamp: wxconfig.timestamp,
		      nonceStr: wxconfig.nonceStr,
		      signature: wxconfig.signature,
		      jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone', 'openLocation', 'scanQRCode', 'chooseImage', 'previewImage', 'uploadImage', 'downloadImage'],
		      openTagList: ['wx-open-launch-app', 'wx-open-launch-weapp'] // 可选，需要使用的开放标签列表，例如['wx-open-launch-app']
		    });


		}
	}
})
