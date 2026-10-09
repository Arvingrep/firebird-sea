new Vue({
	el:'#app',
	data(){
		return {
			pluginTitle:'', //组件标题
			isUnInstall:false, //卸载状态
			isUnLoad:false,
			pluginsList:[], //组件列表
			deleteId:-1,
			defaultImageUrl:'https://obs.kumanyun.com/upfile/plugins/default/',
			keyword:'', //搜索关键字
			noData:false, //没有数据
			loading:true, //加载中
			unInstallText:'卸载',
			enterHref:'',
			pagestep:20, //pageSize
			page:1,
			totalCount:0,
			loadEnd:false,
		}
	},
	methods:{
		enterLink(item,event){
			let id = item.pid;
			let title = item.title;
			let link=`/include/plugins/${id}/index.php?adminRoute=${adminRoute}`;
        	if(id != 22){
				event.preventDefault()
				this.enterHref = link
				parent.addPage("plugins"+id, "plugins", title, link);
        	}else{
				this.enterHref = link
			}
		},

		// 进入卸载组件的状态
		uninstallPlugin(){
			this.isUnInstall = !this.isUnInstall
		},

		// 点击卸载按钮
		uninstallBtn(id){
			const that = this;
			$.dialog.confirm('此操作不可恢复，您确定要卸载吗？', function(){
				that.confirmUninstall(id);
			},function(){
				that.$message({
					type: 'info',
					message: '已取消卸载'
				});
			});
		},


		// 卸载插件、
		confirmUninstall(id){
			const that = this;
			axios.get(`?dopost=del&id=${id}`).then(res => {
				if (res.data.state == 100) {
					that.$message({
						type: 'success',
						message: '卸载成功!'
					});
					that.page = 1;
					that.loadEnd = false;
					that.getPluginsData()
				} else {
					that.$message({
						type: 'info',
						message: res.data.info
					});
				}
			}).catch(err => {
				// console.log(err);

			}).finally(() => {
				that.loading = false
			})
		},

		// 搜索已安装组件
		searchPlugin(){
			const that= this;
			that.loading = true;
			that.page = 1;
			that.loadEnd = false;
			that.getPluginsData()
		},

		// 获取组件列表
		getPluginsData(){
			const that = this;
			that.loading = true;
			axios.get(`?dopost=getList&pagestep=${this.pagestep}&page=${this.page}&sKeyword=${this.keyword}`).then(res=>{
				if(res.data.state == 100){
					if(this.page == 1){
						that.pluginsList = []
					}
					that.pluginsList = that.pluginsList.concat(res.data.list)
					that.noData = false;
					that.page = that.page + 1;
					console.log('页面：' + that.page)
					if(that.page > res.data.pageInfo.totalPage){
						that.loadEnd = true
					}
				}else{
					this.noData = true
				}
			}).catch(err=>{
				// console.log(err);

			}).finally(()=>{
				this.loading = false
			})
		},

		handleScroll(){
			const that = this;
			let scrollTop = document.getElementsByClassName('listBox')[0].scrollTop;
			let ch = document.getElementsByClassName('listBox')[0].clientHeight;
			let sh = document.getElementsByClassName('listBox')[0].scrollHeight - 10;
			if((scrollTop + ch) >= sh && !that.loading && !that.loadEnd ){
				this.getPluginsData();
			}
		},
		installNew(){
			try {
				event.preventDefault();
				parent.addPage("store", "store", "商店", "siteConfig/store.php");
			} catch(e) {}
		}
	},
	mounted(){
		this.getPluginsData();
		window.addEventListener('scroll', this.handleScroll, true)
	}
})