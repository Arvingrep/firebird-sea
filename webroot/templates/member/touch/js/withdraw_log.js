new Vue({
	el: '#app',
	data() {
		return {
			refuseColor: true,
			withdrawDetailObj: [],
			// 每页显示的数据数量
			pageSize: 10,
			// 当前页码
			currentPage: 1,
			// 是否正在加载中
			isLoading: false,
			// 是否还有更多数据可加载
			hasMoreData: true,
			isNoData:false,
			pageInfo:{
			    "page": '',
                "pageSize": '',
                "totalPage": '',
                "totalCount": '',
                "totalAdd": '',
                "totalLess": ''
			},
		}
	},
	methods: {
		// 跳转到详情页
		toWithdrawDetail(url) {
			location.href = url;
		},
		// 格式化金额
		formatAmountNum(detail) {
			return Number(detail).toFixed(2);
		},
		// 格式化日期
		formatCurrDate(item){
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
		// 根据不同的提现编号，显示不同的名称
		formatWithdrawWay(detail) {
			if (detail.bank == 'weixin') {
				return '微信'
			} else if(detail.bank == 'alipay'){
				return '支付宝'
			}else{
				return '银行卡'
			}
		},
		// 格式化收货人姓名
		formatWithdrawUser(detail) {
			if (detail.withdrawWayNum == 0) {
				return detail.withdrawUser.replace(detail.withdrawUser.charAt(0), "*");
			} else {
				return '(' + detail.withdrawNum.slice(-4) + ')';
			}
		},
		// 不同的提现状态显示不同的名称
		formatState(detail) {
			if (detail.state == 0) {
				return '审核中'
			} else if (detail.state == 2) {
				return '提现失败'
			} else if (detail.state == 1) {
				return '提现成功'
			} else if (detail.state == 3) {
				return '打款中'
			}else if (detail.state == 6) {
				return '待收款'
			}
		},
		loadNextPage() {
			// 如果正在加载中或没有更多数据，不执行加载操作
			if (this.isLoading || !this.hasMoreData) return;
			// 设置加载状态为true
			this.isLoading = true; 
			setTimeout(() => {
				// 更新page的值
				const nextPage = this.currentPage + 1;
				// 发送网络请求，获取下一页数据
				axios.get(
					`/include/ajax.php?service=member&action=withdraw_log&page=${this.currentPage}&pageSize=${this.pageInfo.pageSize}`
					)
					.then(response => {
						if (response.data.state == 100) { 
							if(response.data.info.list == 0){
								this.hasMoreData = false;
							}else{
								// 将下一页数据添加到withdrawDetailObj数组中
								this.withdrawDetailObj = [...this.withdrawDetailObj, ...response.data.info.list];
								// 更新页码
								this.currentPage = nextPage; 
								this.pageInfo=response.data.info.pageInfo;
							}
						}else if(response.data.state == 101) { 
							this.isNoData=true
						} 
						// 设置加载状态为false
						this.isLoading = false; 
					})
					.catch(error => {
						console.error('加载下一页失败:', error);
						// 设置加载状态为false
						this.isLoading = false; 
					});
			}, 500);
		},
		handleScroll() {
			// 滚动到页面底部时，加载下一页数据
     		// 滚动事件处理逻辑
			const wrapper = this.$refs.wrapper;
			const scrollTop = wrapper.scrollTop;
			const clientHeight = wrapper.clientHeight;
			const scrollHeight = wrapper.scrollHeight;
	 		if (scrollTop + clientHeight >= scrollHeight) {
	    		this.loadNextPage();
	   		}
		},
	},
	mounted() {
		this.loadNextPage();
		window.addEventListener('scroll', this.handleScroll);
	},
	destroyed() {
		// 移除滚动事件监听
		window.removeEventListener('scroll', this.handleScroll);
	},
})
