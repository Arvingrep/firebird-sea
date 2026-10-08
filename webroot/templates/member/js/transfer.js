new Vue({
	el: '#app',
	data() {
		return {
		    isBtnDisabled:false,
		    btnText:'申请提现',
			// 显示赠与账号头像
			showUserPhoto:false,
			formData:{
				// 赠与账号
				user:'',
				// 支付密码
				paypwd:'',
				// 转赠数量
				amount:'',
				// 是否勾选 提现协议
				agree:''
			}
		}
	},
	methods: {
		// 转赠数量输入框
		getPointNum(){
			const regex = /^-?\d+\.?\d*$/;
			if (!regex.test(this.formData.amount) || this.formData.amount == '' || this.formData.amount<=0) {
				this.$message.error('请输入正确的数量');
			    this.formData.amount = ''
			    return
			}else if(this.formData.amount >totalPoint){
				this.$message.error('转赠数量不能大于当前'+pointName);
			    this.formData.amount = totalPoint
			    return
			}
		},
		// 赠与账号输入框
		getAccount(){
			this.showUserPhoto=true;
			if(this.formData.user==''){
				this.showUserPhoto=false
			}
		},
		// 支付密码输入框
		getPwd(){
			if(this.formData.paypwd == ''){
				this.$message.error('请输入支付密码');
			}
		},
		// 表单提交按钮
		submitBtn() {
			if (this.formData.amount == '') {
				this.$message.error('请输入转赠数量');
				return;
			}else if(this.formData.user == ''){
				this.$message.error('请输入赠与用户名');
				return;
			}else if(this.formData.paypwd == ''){
				this.$message.error('请输入支付密码');
				return;
			}else if (!this.formData.agree) {
				this.$message.error('请勾选'+pointName+'转赠服务协议');
				return;
			}else{
			    if (this.isBtnDisabled) {
                     return;
                }
                this.isBtnDisabled = true;
                this.btnText='提交中...';
				this.formData.agree=1;
				const data=`user=${this.formData.user}&paypwd=${this.formData.paypwd}&amount=${this.formData.amount}&agree=${this.formData.agree}`;
				axios.post(`/include/ajax.php?service=member&action=transfer`,data)
				.then(response =>{
					if(response.data.state == 100){
						this.$message.success(response.data.info);
						setTimeout(() => {
							location.reload()
						}, 500);
					}else{
						this.$message.error(response.data.info);
					}
				}).catch(error =>{
					console.log(error);
				}).finally(()=>{
				    setTimeout(()=>{
				        this.isBtnDisabled = false;
				        this.btnText='确认兑换';
				    },2000)
				})
			}
		},
	},
})
