new Vue({
	el: '#app',
	data() {
		return {
			from:'',
			isShowConent: false,
			isCurr: false,
			// 支付宝信息
			alipayData: {
				// 收款方式
				bank:'alipay',
				// 收款人姓名
				cardname:'',
				// 支付宝账号
				cardnum:'',
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
			},
			bankshow: false,
			bankConfig: {},
			bankSelectData:[]
		}
	},
	methods: {
		// tab样式切换
		showContent() {
			this.isShowConent = !this.isShowConent;
			this.isCurr = !this.isCurr;
		},
		// 判断填写的支付宝信息是否为空
		isAlipayEmpty() {
			if (this.alipayData.cardname == '') {
				vant.Dialog({
					message: '请输入收款人姓名'
				});
				return false;
			} else if (this.alipayData.cardnum == '') {
				vant.Dialog({
					message: '请输入支付宝账号'
				});
				return false;
			} else {
				return true;
			}
		},
		// 判断填写的银行卡信息是否为空
		isBankEmpty() {
			if (this.bankData.bank == '请选择') {
				vant.Dialog({
					message: '请选择银行'
				});
				return false;
			} else if (this.bankData.bankName == '') {
				vant.Dialog({
					message: '请输入开户行'
				});
				return false;
			} else if (this.bankData.cardnum == '') {
				vant.Dialog({
					message: '请输入银行卡号'
				});
				return false;
			} else if (this.bankData.cardname == '') {
				vant.Dialog({
					message: '请输入开户人姓名'
				});
				return false;
			} else {
				return true;
			}
		},
		// 添加支付宝信息提交按钮
		alipaySubmit() {
			if (this.isAlipayEmpty()) {
				const params = new URLSearchParams({
					'withdrawtype':'alipay',
					'bank': 'alipay',
					'cardnum': this.alipayData.cardnum,
					'cardname': this.alipayData.cardname,
					'from':this.from
				});
				const url = `withdraw.html?${params.toString()}`;
				console.log(url);
				window.location.replace(url);
			}
		},
		// 银行名称选择框确认按钮
		bankConfirm(value) {
			this.bankData.bank = value;
			this.bankshow = false;
		},
		// 银行名称选择框显示按钮
		bankShow() {
			this.bankshow = true;
		},
		// 银行名称选择框取消按钮
		bankCancel() {
			this.bankshow = false;
		},
		// 添加银行卡确认按钮
		bankSubmit() {
			if (this.isBankEmpty()) {
				this.bankData.bankCode = Object.entries(this.bankConfig).find(([key, value]) => value === this.bankData.bank)[0];
				const params = new URLSearchParams({
					'withdrawtype':'bank',
					'bank': this.bankData.bank,
					'bankCode':this.bankData.bankCode,
					'bankName':this.bankData.bankName,
					'cardnum': this.bankData.cardnum,
					'cardname': this.bankData.cardname,
					'from':this.from
				});
				const url = `withdraw.html?${params.toString()}`;
				window.location.replace(url);
			}
		}
	},
	mounted() {
		// APP上取消下拉刷新
		toggleDragRefresh('off');
		// 如果跳转过来的页面携带参数，tab就切换到添加银行卡
		const urlParams = new URLSearchParams(window.location.search);
		const isShowConent = urlParams.get('isShowConent');
		const from=urlParams.get('from')
		if(from){
			this.from=from
		}
		if (isShowConent === 'true') {
			this.isShowConent = true;
			this.isCurr = true;
		}
		this.bankConfig=bankConfig
		this.bankSelectData=Object.values(this.bankConfig)
	}
})
