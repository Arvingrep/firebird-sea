new Vue({
	el: '#app',
	data() {
		return {
			billData: [],
			// 页数
			currentPage: 1,
			// 每页个数
			pageSize: 5,
			// 一共多少页
			pageCount: 12,
			pageInfo:{
			    "page": '',
                "pageSize": '',
                "totalPage": '',
                "totalCount": '',
                "totalAdd": '',
                "totalLess": ''
			},
			// 1 全部 2 收入 3 支出 选中状态
			filterCurrBill: 1,
			// 接口传参 筛选 type=0 或 tyep=1
			billType: '',
			// 没有数据时显示
			isNoData: false,
			isPageNoData:false,
			loading:true,
			recordSummary:{}
		}
	},
	methods: {
		formatState(item){
			var result = {
			    '0':'审核中',
				'1':'成功',
				'2':'失败',
				'3':'打款中',
				'6':'待收款',
			}
			return result[item]
		},
		formatYearMonth(item){
			// 使用时间戳创建Date对象
			const date = new Date(item * 1000); 
			// 获取年份
			const year = date.getFullYear(); 
			// 获取月份，补0
			const month = (date.getMonth() + 1).toString().padStart(2, '0');
			// 获取日期，补0
			const day = date.getDate().toString().padStart(2, '0');
			// 获取小时，补0
			const hours = date.getHours().toString().padStart(2, '0');
			// 获取分钟，补0
			const minutes = date.getMinutes().toString().padStart(2, '0');
			// 获取秒钟，补0
			const seconds = date.getSeconds().toString().padStart(2, '0');
			return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
		},
		formatAccount(item){
			var bank;
			if(item.bank =='alipay'){
				bank='支付宝'
			}else if(item.bank =='weixin'){
				bank='微信'
			}else{
				bank='银行卡'
			}
			const cardname=item.cardname;
			const cardnum=item.cardnum;
			return bank
		},
		// 根据页码跳转到对应页面
		pagingChange(val) { 
			this.pageInfo.page=val
			this.getBillData();
			document.getElementById("main").scrollIntoView({ behavior: "smooth" });
		},
		// 从接口中获取页面展示的数据
		getBillData(){
			this.loading = true;
			axios.get( `/include/ajax.php?service=member&action=withdraw_log${this.billType}&page=${this.pageInfo.page}&pageSize=${this.pageInfo.pageSize}` ) 
			.then(response => {
					if (response.data.state == 100) { 
						if(response.data.info.pageInfo.totalPage <=1){
							this.isNoData = false
							this.isPageNoData=false
							this.billData = response.data.info.list
							this.pageInfo=response.data.info.pageInfo;
						}else{
							this.isNoData = false
							this.isPageNoData=true
							 this.billData = response.data.info.list
							this.pageInfo=response.data.info.pageInfo;
							if(this.pageInfo.page == 1){
								$('.btn-prev').hide();
							}else{
								$('.btn-prev').show();
							}
							if(this.pageInfo.page == this.pageInfo.totalPage){
								$('.btn-next').hide();
							}else{
								$('.btn-next').show();
							}
						}
					}else if(response.data.state== 101) { 
						this.isNoData = true
						this.isPageNoData=false
				 		this.billData = []
					} 
					this.loading=false
				}) .catch(error => { 
					console.error('加载下一页失败:', error); 
			}); 
		},
		// 全部数据筛选
		allBill() {
			this.pageInfo.page = 1
			this.filterCurrBill = 1;
			this.billType = '';
			this.pagingChange()
		},
		// 审核中筛选
		checkBill() {
			this.pageInfo.page = 1
			this.filterCurrBill = 2;
			this.billType = '&state=0';
			this.pagingChange()
		},
		// 成功筛选
		succssBill() {
			this.pageInfo.page = 1
			this.filterCurrBill = 3
			this.billType = '&state=1'
			this.pagingChange()
		},
		// 失败筛选
		failBill() {
			this.pageInfo.page = 1
			this.filterCurrBill = 4
			this.billType = '&state=2'
			this.pagingChange()
		},
	},
	mounted() {
		// 初始化加载第一页数据
		this.pageInfo.pageSize=pageSize;
		this.getBillData();
	}
})
