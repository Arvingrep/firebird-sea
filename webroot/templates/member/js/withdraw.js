new Vue({
	el: '#app',
	data() {
		return {
			BindWeixin:'',
		    isBtnDisabled:false,
		    btnText:'申请提现',
			isNoData:true,
			isAlipayNoData:true,
			isBankNoData:true,
			// 提现方式 2 微信 0 支付宝 1 银行卡
			withdrawWay: currType,
			// 选中状态
			curr: currType,
			// 显示 选择银行弹窗
			showBankContent: false,
			// 显示 历史记录弹窗
			showHistory: false,
			// 提现金额
			amountNum: '',
			placeholderText:'',
			// 所有提现金额
			allAmount: null,
			minAmount:null,
			maxWithdraw:null,
			// 费率
			rate: 0,
			withdrawFee:0,
			// 输入金额之后，改变费率金额
			changeRateColor: false,
			// 是否勾选 提现协议
			isChecked: false,
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
				bank:'请选择',
				bankCode:'',
				// 开户行
				bankName: '',
				// 开户人姓名
				cardname:'',
				// 银行卡号
				cardnum:'',
				cardnumLast:''
			},
			// 支付宝和银行卡的账号历史记录
			historyData: {
				alipay:[],
				bank:[]
			},
			// 选择银行的数据
			bankNameData: {},
			// element ui弹窗提示
			isMessageShowing: false
		}
	},
	methods: {
		// 防止重复点击提示弹窗
		showMessage(msg,type='error') {
			// 检查 isMessageShowing 状态，避免同时触发多个提示框
			if (this.isMessageShowing) {
			  return;
			}
			// 更新状态为提示框正在显示
			this.isMessageShowing = true; 
			this.$message({
				message: msg,
				type:type,
				onClose: () => {
					// 提示框关闭后更新状态为提示框已关闭
				this.isMessageShowing = false; 
			  }
			});
		  },
		// 选择哪种提现方式
		selectWithdrawWay(item) {
			this.withdrawWay = item;
			this.curr = item
		},
		// 金额输入框的方法
		changeAmount() {
			const regex = /^-?\d+\.?\d*$/;
			if(!regex.test(this.amountNum) || this.amountNum==''){
				this.showMessage('请输入正确的金额')
				this.amountNum=''
				this.changeRateColor = false;
				this.withdrawFee=withdrawFee
				return
			}else if(this.amountNum < this.minAmount){
				this.showMessage('单笔提现最小金额为'+this.minAmount+echoCurrency('short'))
				this.amountNum=0;
				this.changeRateColor = false;
				this.withdrawFee=withdrawFee
				return
			}else if(this.amountNum > this.maxWithdraw && this.maxWithdraw > 0){
				this.showMessage('单次最多提现'+this.maxWithdraw+echoCurrency('short'))
				this.amountNum=this.maxWithdraw
				this.rate=(Number(this.amountNum) * Number(this.withdrawFee) *0.01).toFixed(2);
				return
			}else if(this.amountNum > this.allAmount){
				this.showMessage('提现金额不能大于余额')
				this.amountNum=this.allAmount
				this.rate=(Number(this.amountNum) * Number(this.withdrawFee) *0.01).toFixed(2);
				return
			}
			this.changeRateColor = true;
			this.rate=(Number(this.amountNum) * Number(this.withdrawFee) *0.01).toFixed(2);
		},
		// 所有金额都提现
		allWithdraw() {
			if(this.allAmount !=0){
				this.amountNum = this.allAmount;
				this.changeAmount();
			}else{
				this.showMessage('没有可提现金额')
			}
		},
		// 格式化历史记录中的  支付宝和银行卡
		formatWithdrawWay(item) {
			// 如果这条账号历史记录里面有支付宝账号,说明是支付宝,否则就是银行卡
			if (item.bank == 'alipay') {
				return '支付宝'
			} else {
				return '银行卡'
			}
		},
		// 选择历史记录中的账号
		selectAccount(item) {
			if (this.withdrawWay == 0 & item.cardnum !=undefined) {
				this.alipayData.cardname = item.cardname;
				this.alipayData.cardnum = item.cardnum;
			} else if(this.withdrawWay ==1 & item.cardnum != undefined) {                
				this.bankData.bank=item.bank;
				this.bankData.bankCode=item.bankCode
				this.bankData.bankName = item.bankName;
				this.bankData.bank = item.bank
				this.bankData.cardnum = item.cardnum;
				this.bankData.cardname = item.cardname
			}
			this.showHistory=false;
		},
		// 删除历史记录中的账号
		deleteAccount(item){
			this.showHistory=false;
			this.$confirm('是否删除这条记录?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			  }).then(() => {
				if (item.bank == 'alipay') {
					const data=`id=${item.id}`
					axios.post(`/include/ajax.php?service=member&action=withdraw_card_del`,data).then(res=>{
						const alipayData=this.historyData.alipay;
						this.historyData.alipay=alipayData.filter(obj=>obj.id!=item.id)
						if(this.historyData.alipay.length == 0){
							this.isAlipayNoData=true;
						}
					}).catch(error =>{
						console.log(error);
					})
				} else {
					const data=`id=${item.id}`
					axios.post(`/include/ajax.php?service=member&action=withdraw_card_del`,data).then(res=>{
						const bankData=this.historyData.bank;
						this.historyData.bank=bankData.filter(obj=>obj.id!=item.id)
						if(this.historyData.bank.length == 0){
							this.isBankNoData=true;
						}
					}).catch(error =>{
						console.log(error);
					})
				}
				this.$message.success('删除成功!');
			  }).catch((err) => {
				console.log(err);
				this.$message.info('已取消删除!');   
			  });
		},
		// 在银行弹窗中选择银行名称
		selectBankName(name,code) {
			this.bankData.bank = name
			this.bankData.bankCode=code
			this.showBankContent=false;
		},
		// 微信提现,提交方法
		submitWeixin() {
			if (!this.isChecked) {
				this.showMessage('请勾选提现协议')
				return;
			} else if(!this.BindWeixin){
				this.$confirm('您还没有绑定微信，请先绑定微信后再进行提现', '提示信息', {
					confirmButtonText: '去绑定',
					cancelButtonText: '取消',
					// type: 'warning'
				  }).then(() => {
					location.href=memberDomain+ '/connect.html'
				  }).catch(() => {
					this.$message({
					  type: 'info',
					  message: '已取消'
					});          
				  });
				return
			} else {
			if (this.isBtnDisabled) {
                 return;
           	}
            this.isBtnDisabled = true;
            this.btnText='提交中...'
			const data=`bank=weixin&amount=${this.amountNum}`;
			axios.post(`/include/ajax.php?service=member&action=withdraw`,data)
				.then(response =>{
					if(response.data.state == 100){
						var url = withdrawLog.replace("%id%", response.data.info);
						setTimeout(() => {
							location.href = url;
						}, 500);
					}else{
						this.$message.error(response.data.info);
					}
				})
				.catch(error => {
					console.log(error);
				}).finally(()=>{
				    setTimeout(()=>{
				        this.isBtnDisabled = false;
				        this.btnText='申请提现'
				    },2000)
				})
			}
		},
		// 支付宝提现,提交方法
		submitAlipay() {
			if (this.alipayData.cardnum == '' || this.alipayData.cardnum == undefined) {
				this.showMessage('请输入支付宝账号')
			} else if (this.alipayData.cardname == ''|| this.alipayData.cardname == undefined) {
				this.showMessage('请输入收款人姓名')
			} else if (!this.isChecked) {
				this.showMessage('请勾选提现协议')
				return;
			} else {
			    if (this.isBtnDisabled) {
                     return;
                }
                this.isBtnDisabled = true;
                this.btnText='提交中...'
				// 调用支付宝提现方法
				const data=`bank=alipay&cardnum=${this.alipayData.cardnum}&cardname=${this.alipayData.cardname}&amount=${this.amountNum}`;
				axios.post(`/include/ajax.php?service=member&action=withdraw`,data)
				.then(response =>{
					if(response.data.state == 100){
						var url = withdrawLog.replace("%id%", response.data.info);
						setTimeout(() => {
							location.href = url;
						}, 500);
					}else{
						this.$message.error(response.data.info);
					}
				})
				.catch(error => {
					console.log(error);
				}).finally(()=>{
				    setTimeout(()=>{
				        this.isBtnDisabled = false;
				        this.btnText='申请提现'
				    },2000)
				})
			}
		},
		// 银行卡提现,提交方法
		submitBank() {
			const regex = /^-?\d+\.?\d*$/;
			if (this.bankData.bank == '请选择' || this.bankData.bank == undefined) {
				this.showMessage('请选择银行')
			} else if (this.bankData.bankName == '' || this.bankData.bankName == undefined) {
				this.showMessage('请输入开户行')
			} else if (this.bankData.cardnum == '' || this.bankData.cardnum == undefined) {
				this.showMessage('请输入银行卡号议')
			} else if (!regex.test(this.bankData.cardnum)){
				this.showMessage('请输入正确的银行卡号')
			} else if (this.bankData.cardname == '' || this.bankData.cardname == undefined) {
				this.showMessage('请输入开户人姓名')
			} else if (!this.isChecked) {
				this.showMessage('请勾选提现协议')
				return;
			} else {
			    if (this.isBtnDisabled) {
                     return;
                }
                this.isBtnDisabled = true;
                this.btnText='提交中...'
				// 调用银行卡提现方法
				const data=`bank=${this.bankData.bank}&bankCode=${this.bankData.bankCode}&bankName=${this.bankData.bankName}&cardnum=${this.bankData.cardnum}&cardname=${this.bankData.cardname}&amount=${this.amountNum}`;
				axios.post(`/include/ajax.php?service=member&action=withdraw`,data)
				.then(response =>{
					if(response.data.state == 100){
						var url = withdrawLog.replace("%id%", response.data.info);
						setTimeout(() => {
							location.href = url;
						}, 500);
					}else{
						this.$message.error(response.data.info);
					}
				})
				.catch(error => {
					console.log(error);
				}).finally(()=>{
				    setTimeout(()=>{
				        this.isBtnDisabled = false;
				        this.btnText='申请提现.'
				    },2000)
				})
			}
		},
		// 表单提交按钮,不同的提现方式,调用不同的提现方法
		submitBtn() {
			if (this.amountNum == '') {
				this.showMessage('请输入提现金额')
				return;
			}
			if (this.withdrawWay == 2) {
				this.submitWeixin()
			} else if (this.withdrawWay == 0) {
				this.submitAlipay()
			} else if (this.withdrawWay == 1) {
				this.submitBank()
			}
		},
		// 点击空白处 隐藏历史记录弹窗 
		// 只有当点击的元素属于弹窗或者 historyClick 按钮才会执行 if 里面的代码
		hideHistory(e) {
			if (!this.$refs.historyButton.contains(e.target) && !this.$refs.historyPopup.contains(e.target)) {
				this.showHistory = false
				document.removeEventListener('click', this.hideHistory, false)
			}
		},
		historyClick() {            
            
            //设置历史记录的左边距
            var posi = $('.withdrawWay .record').position().left;
            $('.historyList').css('margin-left',posi);

			this.showHistory = !this.showHistory
			if (this.showHistory) {
				// 弹窗显示时监听点击事件
				document.addEventListener('click', this.hideHistory, false)
			} else {
				// 弹窗隐藏时撤销监听事件
				document.removeEventListener('click', this.hideHistory, false)
			}
		},
		// 点击空白处 隐藏选择银行弹窗弹窗 
		// 只有当点击的元素属于弹窗或者 bankContentClick 按钮才会执行 if 里面的代码
		hideBankContent(e) {
			if (!this.$refs.bankContentButton.contains(e.target) && !this.$refs.bankContentPopup.contains(e.target)) {
				this.showBankContent = false
				document.removeEventListener('click', this.hideBankContent, false)
			}
		},
		bankContentClick() {
			this.showBankContent = !this.showBankContent
			if (this.showBankContent) {
				// 弹窗显示时监听点击事件
				document.addEventListener('click', this.hideBankContent, false)
			} else {
				// 弹窗隐藏时撤销监听事件
				document.removeEventListener('click', this.hideBankContent, false)
			}
		},
		// 获取所有的账号历史记录
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
			})
		},
	},
	mounted() {
		this.getAllData()
		this.allAmount=money;
		const shortMoney = echoCurrency('short');
		this.placeholderText=`最多可提现${this.allAmount}${shortMoney}`
		this.withdrawFee=withdrawFee;
		this.minAmount=minWithdraw
		this.maxWithdraw=maxWithdraw
		this.bankNameData=bankConfig
		if(BindWeixin== 1){
			this.BindWeixin=true;
		}else{
			this.BindWeixin=false;
		}
	}
})
