/**
 * 会员中心积分明细
 * by guozi at: 20150717
 */

new Vue({
	el: '#app',
	data() {
		return {
			ponitName:'',
			billData: [],
			pageInfo:{
			    "page": '',
                "pageSize": '',
                "totalPage": '',
                "totalCount": '',
                "totalAdd": '',
                "totalLess": ''
			},
			// 接口传参 筛选 type=0 或 tyep=1
			billType: '',
			// 接口传参 筛选 ordertype
			orderType: '',
			// 接口传参 筛选日期
			dateType:'',
			// 选择类型样式
			isTypeBox: false,
			isTypeBoxCurr: false,
			currType: '类型',
			// 选择类型弹出框中 选中状态
			orderTypeColor: '',
			// 选择类型弹出框中，选择的数据
			orderTypeData: null,
			// 没有数据时显示
			isNoData: false,
			isPageNoData:false,
			loading:true,
			recordSummary:{},
			// 选择日期样式
			currDate: null,
			previousDate: null,	
			dateFlag: false,
			isDateBox: false,
			isDateBoxCurr: false,
			isDateFilter: false,
			pickerOptions: {
				disabledDate(time) {
					// 获取当前日期
					const today = new Date();
					// 设置截止日期为当前日期
					return time.getTime() > today.getTime();
				},
			},
			// 选择金额样式
			amountType:'',
			isAmountBox: false,
			isAmountBoxCurr: false,
			// 最高金额
			topAmount: '',
			// 最低金额
			bottomAmount: '',
		}
	},
	methods: {
		// 格式化标题前面模块名称
		formatOrderType(item) {
			var value = item.ctype;
			var result = this.orderTypeData
			return result[value]
		},
		// 格式化金额前面的正负符号，0表示 - 1表示 +
		formatType(item) {
			if (item.type == '0') {
				return '-'
			} else {
				return '+'
			}
		},
		// 格式化日期，只保留月份和时间
		formatDate(item) {
			return item.date.slice(5)
		},
		// 格式化年月
		formatYearMonth(item){
			// 使用Date对象解析日期
			var dateParts = item.split("-");
			var year = parseInt(dateParts[0]);
			var month = parseInt(dateParts[1]);
			// 构建转换后的日期字符串
			return year + "年" + month + "月";
		},
		// 根据页码跳转到对应页面
		pagingChange(val) {
			this.pageInfo.page=val
			this.getRecord();
			document.getElementById("main").scrollIntoView({ behavior: "smooth" });
		},
		// 从接口中获取页面展示的数据
		getRecord(){
			this.loading = true;
			axios.get(`/include/ajax.php?service=member&action=point${this.billType}${this.orderType}${this.amountType}${this.dateType}&page=${this.pageInfo.page}&pageSize=${this.pageInfo.pageSize}`)
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
				this.loading = false;
			})
			.catch(error => {
				console.error('加载下一页失败:', error);
			});
		},
		// 支出和收入总计
		getRecordSummary(){
			axios.get(`/include/ajax.php?service=member&action=pointSummary`)
				.then(response => {
				    this.recordSummary=response.data.info
				}).catch(error => {
				console.error('加载下一页失败:', error);
			});
		},
		// 点击空白处 隐藏选择类型弹窗弹窗 
		hideTypeBox(e) {
			if (!this.$refs.refTypeBox.contains(e.target) && !this.$refs.popupTypeBox.contains(e.target)) {
				this.isTypeBox = false
				this.isTypeBoxCurr = false
				document.removeEventListener('click', this.hideHistory, false)
			}
		},
		// 显示选择类型弹窗
		showTypeBox() {
			this.isTypeBox = !this.isTypeBox;
			this.isTypeBoxCurr = !this.isTypeBoxCurr;
			if (this.isTypeBox) {
				// 弹窗显示时监听点击事件
				document.addEventListener('click', this.hideTypeBox, false)
			} else {
				// 弹窗隐藏时撤销监听事件
				document.removeEventListener('click', this.hideTypeBox, false)
			}
		},
		// 选择了哪个ordertype,传到接口地址中进行筛选
		filterOrderType(item,index){
			if (this.orderTypeColor == index) {
				this.orderTypeColor = '';
				this.orderType = '';
				this.currType = '类型';
				this.pagingChange()
				this.getRecordSummary();
				this.pageInfo.page = 1
			} else {
				this.orderTypeColor = index;
				this.orderType = `&ctype=${index}`;
				this.currType = item;
				this.pagingChange()
				this.getRecordSummary();
				this.pageInfo.page = 1
			}
		},
		// 筛选收入
		filterShouru(){
		    if(this.orderTypeColor == '收入'){
		        this.orderTypeColor = '';
		    	this.orderType = ``;
			    this.currType = '类型';
			    this.pagingChange()
			    this.getRecordSummary();
				this.pageInfo.page = 1
		    }else{
		        this.orderTypeColor = '收入';
		    	this.orderType = `&type=1`;
			    this.currType = '收入';
			    this.pagingChange()
			    this.getRecordSummary();
				this.pageInfo.page = 1
		    }
		},
		// 筛选支出
		filterZhichu(){
		    if(this.orderTypeColor == '支出'){
		        this.orderTypeColor = '';
		    	this.orderType = ``;
			    this.currType = '类型';
			    this.pagingChange()
			    this.getRecordSummary();
				this.pageInfo.page = 1
		    }else{
		        this.orderTypeColor = '支出';
		    	this.orderType = `&type=0`;
			    this.currType = '支出';
			    this.pagingChange()
			    this.getRecordSummary();
				this.pageInfo.page = 1
		    }
		},
		// 显示选择日期弹窗
		showDateBox() {
			var date = new Date(this.currDate);
			var year = date.getFullYear();
			var month = (date.getMonth() + 1).toString().padStart(2, '0');
			var formattedDate = year + '-' + month;
			this.dateType = `&date=${formattedDate}`;
			this.pagingChange()
			this.isDateBox = !this.isDateBox
			this.isDateBoxCurr = !this.isDateBoxCurr
		},
		// 控制选择日期显示和隐藏
		showDateDiv(){
			this.isDateBox = !this.isDateBox
			this.isDateBoxCurr = !this.isDateBoxCurr
			if(!this.isDateBox){
				$('.el-picker-panel').css('display', 'none')
			}else{
				$('.el-picker-panel').css('display', 'block')
			}
			if (this.isDateBox) {
				// 弹窗显示时监听点击事件
				document.addEventListener('click', this.hideDateBox, false)
			} else {
				// 弹窗隐藏时撤销监听事件
				document.removeEventListener('click', this.hideDateBox, false)
			}
		},
		// 点击空白处 隐藏选择类型弹窗弹窗 
		hideDateBox(e) {
			if (!this.$refs.refDateBox.contains(e.target) && !this.$refs.popupTypeBox.contains(e.target)) {
				this.isDateBox = false
				this.isDateBoxCurr = false
				document.removeEventListener('click', this.hideHistory, false)
			}
		},
		// 根据年份和月份组合以及类型筛选数组中的对象，并根据日期降序排列
		filterItems(yearMonth, type) {
			return this.billData
				.filter(item => item.date.startsWith(yearMonth) && Number(item.type) === type)
				.sort((a, b) => new Date(b.date) - new Date(a.date));
		},
		// 点击空白处 隐藏选择金额弹窗弹窗 
		hideAmountBox(e) {
			if (!this.$refs.refAmountBox.contains(e.target) && !this.$refs.popupAmountBox.contains(e.target)) {
				if (this.isDateFilter) {
					this.isAmountBox = false

				} else {
					this.isAmountBox = false
					this.isAmountBoxCurr = false
				}
				document.removeEventListener('click', this.hideHistory, false)
			}
		},
		// 显示选择金额弹窗
		showAmountBox() {
			if (this.isDateFilter) {
				this.isAmountBox = !this.isAmountBox
			} else {
				this.isAmountBox = !this.isAmountBox
				this.isAmountBoxCurr = !this.isAmountBoxCurr
			}
			if (this.isAmountBox) {
				// 弹窗显示时监听点击事件
				document.addEventListener('click', this.hideAmountBox, false)
			} else {
				// 弹窗隐藏时撤销监听事件
				document.removeEventListener('click', this.hideAmountBox, false)
				this.isAmountBox = false
			}
		},
		// 选择金额确认按钮
		submitAmount() {
			const regex = /^-?\d+\.?\d*$/;
			if (this.topAmount == '' || this.bottomAmount == "" || !regex.test(this.topAmount) || !regex.test(
					this.bottomAmount)) {
				this.$message.error('请正确的'+this.pointName);
				return;
			} else if(Number(this.bottomAmount) > Number(this.topAmount)){
				this.$message.error('最低'+this.pointName+'不能大于最高'+this.pointName);
				return;
			} else if(Number(this.topAmount) < Number(this.bottomAmount)){
				// this.$message.error('最高金额不能小于最低金额');
				this.$message.error('最高'+this.pointName+'不能小于最低'+this.pointName);
				return;
			} else {
				this.isDateFilter = !this.isDateFilter
				this.isAmountBox = false
			}
			if (!this.isDateFilter) {
				this.topAmount = '';
				this.bottomAmount = '';
				this.isAmountBoxCurr = false;
				this.pageInfo.page = 1
				this.amountType=''
			}
			if(this.topAmount != '' && this.bottomAmount !=''){
				this.pageInfo.page = 1
				this.amountType=`&point=${this.bottomAmount},${this.topAmount}`;
			}else{
				this.amountType=''
			}
			this.pagingChange()
			this.getRecordSummary();
			this.isAmountBoxCurr = false;
		},
		// 最低输入金额焦点事件
		bottomAmountFocus() {
			this.isDateFilter = false
		},
		// 最高输入金额焦点事件
		topAmountFocus() {
			this.isDateFilter = false
		},
	},
	computed: {
		// 处理billData中数据，v-for渲染到页面上
		yearMonths() {
			// 获取数组中所有不同的年份和月份组合
			const yearMonths = [...new Set(this.billData.map(item => item.date.slice(0, 7)))];
			const recordSummary=this.recordSummary;
			// 计算每个年月的收入和支出总和并添加到年月对象中
			const sortedYearMonths = yearMonths.map(yearMonth => {
				// 1表示支出，0表示收入
				// 筛选出支出和收入的数据
				const income = this.filterItems(yearMonth, 1);
				const expense = this.filterItems(yearMonth, 0);
				// 当前月份的所有数据，并进行排序
				const items = [...income, ...expense].sort((a, b) => new Date(b.date) - new Date(a
					.date));
				// 统计当前月份收入
				const totalIncome = income.reduce((total, item) => total + Number(item.amount), 0);
				// 统计当前月份支出
				const totalExpense = expense.reduce((total, item) => total + Number(item.amount), 0);
				return {
					month: yearMonth,
					items,
					totalIncome,
					totalExpense
				};
			});
			// 将接口中获取到收入和支出总计，赋值给页面中
			for(let key in recordSummary){
			    let obj = sortedYearMonths.find(obj => obj.month === key);
			        if (obj) {
                        obj.totalIncome = recordSummary[key].income;
                        obj.totalExpense = recordSummary[key].expenditure;
                }
			}
			// 对年份和月份进行排序
			return sortedYearMonths.sort((a, b) => new Date(b.month) - new Date(a.month));
		},
	},
	mounted() {
		this.pointName=pointName
		// 初始化积分类型中的数据
		const orderTypeData={
			'tixian':'提现',
			'ruzhang':'入账'
		}
		this.orderTypeData = {...leimuarr,...orderTypeData};
		// 初始化加载第一页数据
		this.pageInfo.pageSize=pageSize;
		this.getRecord();
		this.getRecordSummary();
	}
})
