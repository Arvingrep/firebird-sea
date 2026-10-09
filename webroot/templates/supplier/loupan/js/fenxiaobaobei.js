var page = new Vue({
	el:'#page',
	data:{
		navList:navList,  //左侧导航
		currid:currid, //左侧导航当前高亮
		hoverid:'',
		list:[],  //数据
		editArr:[],  //批量编辑
		shaixuanid:99,
		loading:false,
	},
	mounted(){
		var tt = this;
		if(typeof(atpage) !='undefined'){
			tt.getList(currid);
		}
		// 顾客筛选
		$('.shaixuan span').click(function(){
			var t = $(this);
			t.addClass('curr').siblings('span').removeClass('curr');
			tt.shaixuanid = t.attr('data-id');
			atpage = 1;
			tt.getList(currid);
		});



	},
	computed:{

	},
  methods:{
    // 显示切换账户
		show_change:function(){
			$(".change_account").show()
		},

		// 隐藏切换账户
		hide_change:function(){
			$(".change_account").hide()
		},

		// 获取列表
		getList:function(currid,dotype){
			var tt = this;
			// atpage  页码  pageSize 单页加载数据条数      totalCount  数据总数  需在加载之后复制
			tt.showPageInfo(currid)
			if(tt.shaixuanid == 99 && currid != 11){
				tt.shaixuanid = '';
			}
			if(tt.loading == true) return false;
			tt.loading = true;
			var keywords = $("#search").val();
			var url = '';
			if(currid == 11){
				var dotype = dotype?'&do=export':'';
				url = '/include/ajax.php?service=house&action=loupanFenxiaoList&manageid=1&state='+tt.shaixuanid+'&page='+atpage+'&pageSize='+pageSize+'&keywords='+keywords+dotype;
			}else if(currid == 10){
					url = '/include/ajax.php?service=house&action=loupanProspective&loupanid='+loupanid+'&protype='+tt.shaixuanid+'&page='+atpage+'&pageSize='+pageSize+'&keywords='+keywords;
			}else if(currid == 9){
					url = '/include/ajax.php?service=house&action=loupanHuodongList&loupanid='+loupanid+'&page='+atpage+'&pageSize='+pageSize;
			}

			if(dotype){  //导出excel表格
				window.location.href = url;
				tt.loading = false;
				return false;
			}
			axios({
				method: 'post',
				url: url,
			  })
			  .then((response)=>{
					tt.loading = false;
					var data = response.data;
					if(data.state == 100){

						tt.list = data.info.list
						totalCount = data.info.pageInfo.totalCount;
						if(atpage == 1){
							tt.showPageInfo(currid);
						}

					}else{
						tt.list = [];
						totalCount = 0;
					}
			  });
		},
// 转时间
		dateTo:function(timestamp,n){

            const dateFormatter = this.dateFormatter(timestamp);
            const year = dateFormatter.year;
            const month = dateFormatter.month;
            const day = dateFormatter.day;
            const hour = dateFormatter.hour;
            const minute = dateFormatter.minute;
            const second = dateFormatter.second;

			if(n == 1){
				return (year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second);
			}else if(n == 2){
				return (year+'-'+month+'-'+day);
			}else if(n == 3){
				return (month+'-'+day);
			}else{
				return 0;
			}
		},

        //判断是否为合法时间戳
        isValidTimestamp: function(timestamp) {
            return timestamp = timestamp * 1, Number.isFinite(timestamp) && timestamp > 0;
        },

        //创建 Intl.DateTimeFormat 对象并设置格式选项
        dateFormatter: function(timestamp){
            
            if(!this.isValidTimestamp(timestamp)) return {year: '-', month: '-', day: '-', hour: '-', minute: '-', second: '-'};

            const date = new Date(timestamp * 1000);  //创建一个新的Date对象，使用时间戳
            
            // 使用Intl.DateTimeFormat来格式化日期
            const dateTimeFormat = new Intl.DateTimeFormat('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: typeof cfg_timezone == 'undefined' ? 'PRC' : cfg_timezone,  //指定时区，cfg_timezone变量已在页面中通过程序自动声明
            });
            
            // 获取格式化后的时间字符串
            const formatted = dateTimeFormat.format(date);
            
            // 将格式化后的字符串分割为数组
            const [year, month, day, hour, minute, second] = formatted.match(/\d+/g);

            // 返回一个对象，包含年月日时分秒
            return {year, month, day, hour, minute, second};
        },
        
		// excel
		toExcel:function(){
			var tt = this;
			tt.getList(currid,'export')
		},
		// 修改状态
		changeState:function(state,id,index){
			state = Number(state);
			var tt = this;
			if(tt.loading) return false;
			tt.loading = true;

			axios({
				method: 'post',
				url: '/include/ajax.php?service=house&action=loupanFenxiaoUpdate&loupanid='+loupanid+'&state='+state+'&aid='+id,
				})
				.then((response)=>{
						var data = response.data;
						tt.loading = false;
						if(data.state == 100){
							tt.list[index].state = state;
							alert('修改成功');
							// $(".btngroup").css('display','none');
						}else{
							alert(data.info)
						}
				});
		},

		// 搜索
		search:function(){
			var tt = this;
			var keywords = $("#search").val();
			// if(keywords == ''){
			// 	alert('请输入关键字');
			// 	return false;
			// }
			atpage = 1;
			tt.getList(currid);
		},
		// 修改意向客户
		change_customer:function(dopost,id,state,type,index){
			var  tt = this;
			if(tt.loading) return false;
			tt.loading = true;
			var uid = '';
			var statePrame  = '';
			if(dopost == 'del'){//删除用户
				uid = $(".Popbox").attr('data-id');
				type = $(".Popbox").attr('data-type');
				index = $(".Popbox").attr('data-index');
			}else{
				uid = id;
				statePrame = dopost=='update'?'&state='+state:"";
			}
			var url = '/include/ajax.php?service=house&action=loupanProspectiveOperation&optype='+type+'&loupanid='+loupanid+'&dopost='+dopost+statePrame+'&aid='+uid;
			axios({
				method: 'post',
				url: url,
				})
				.then((response)=>{
						var data = response.data;
						tt.loading = false;
						if(dopost == 'del'){
							tt.close_pop(); //关闭弹窗
						}
						if(data.state == 100){
							if(dopost == 'del'){
								tt.list.splice(index,1)
							}else{
								tt.list[index].state = state;
							}
							alert(data.info);
						}else{
							alert(data.info)
						}
				});
		},
		showPop:function(id,type,index){
			$(".Popbox").attr('data-id',id)
									.attr('data-type',type)
									.attr('data-index',index)
			$(".Popbox,.pop_mask").show();
		},
		close_pop:function(){
			$(".Popbox,.pop_mask").hide();
		},

		// 删除活动
		del_huodong:function(){
			var tt = this;
			if(tt.loading) return false;
			tt.loading = true;
			var aid = $(".Popbox").attr('data-id');
			axios({
				method: 'post',
				url: '/include/ajax.php?service=house&action=loupanHuodongEdit&dopost=del&loupanid='+loupanid+'&aid='+aid,
			  })
			  .then((response)=>{
					tt.loading = false;
					var data = response.data;
					if(data.state == 100){
            alert(data.info);
					}else{
            alert(data.info);
					}
			  });
		},
		// 批量选择
		edit_pl:function(i){
			var tt = this;
			if(tt.editArr.indexOf(i)>-1){
				tt.editArr.splice(tt.editArr.indexOf(i),1)
			}else{
				tt.editArr.push(i)
			}
		},
		// 分页
		showPageInfo:function(currid){
			var tt = this;
			var info = $(".pagination");
			var nowPageNum = atpage;
			var allPageNum = Math.ceil(totalCount/pageSize);
			var pageArr = [];
			info.html("").hide();
			var pages = document.createElement("div");
			pages.className = "pagination-pages";
			info.append(pages);
			//拼接所有分页
			if (allPageNum > 1) {

				//上一页
				if (nowPageNum > 1) {
					var prev = document.createElement("a");
					prev.className = "prev";
					prev.innerHTML = langData['siteConfig'][6][33];//上一页
					prev.onclick = function () {
						atpage = nowPageNum - 1;
						tt.getList(currid);
					}
					info.find(".pagination-pages").append(prev);
				}

				//分页列表
				if (allPageNum - 2 < 1) {
					for (var i = 1; i <= allPageNum; i++) {
						if (nowPageNum == i) {
							var page = document.createElement("span");
							page.className = "curr";
							page.innerHTML = i;
						} else {
							var page = document.createElement("a");
							page.innerHTML = i;
							page.onclick = function () {
								atpage = Number($(this).text());
								tt.getList(currid);
							}
						}
						info.find(".pagination-pages").append(page);
					}
				} else {
					for (var i = 1; i <= 2; i++) {
						if (nowPageNum == i) {
							var page = document.createElement("span");
							page.className = "curr";
							page.innerHTML = i;
						}
						else {
							var page = document.createElement("a");
							page.innerHTML = i;
							page.onclick = function () {
								atpage = Number($(this).text());
								tt.getList(currid);
							}
						}
						info.find(".pagination-pages").append(page);
					}
					var addNum = nowPageNum - 4;
					if (addNum > 0) {
						var em = document.createElement("span");
						em.className = "interim";
						em.innerHTML = "...";
						info.find(".pagination-pages").append(em);
					}
					for (var i = nowPageNum - 1; i <= nowPageNum + 1; i++) {
						if (i > allPageNum) {
							break;
						}
						else {
							if (i <= 2) {
								continue;
							}
							else {
								if (nowPageNum == i) {
									var page = document.createElement("span");
									page.className = "curr";
									page.innerHTML = i;
								}
								else {
									var page = document.createElement("a");
									page.innerHTML = i;
									page.onclick = function () {
										atpage = Number($(this).text());
										tt.getList(currid);
									}
								}
								info.find(".pagination-pages").append(page);
							}
						}
					}
					var addNum = nowPageNum + 2;
					if (addNum < allPageNum - 1) {
						var em = document.createElement("span");
						em.className = "interim";
						em.innerHTML = "...";
						info.find(".pagination-pages").append(em);
					}
					for (var i = allPageNum - 1; i <= allPageNum; i++) {
						if (i <= nowPageNum + 1) {
							continue;
						}
						else {
							var page = document.createElement("a");
							page.innerHTML = i;
							page.onclick = function () {
								atpage = Number($(this).text());
								tt.getList(currid);
							}
							info.find(".pagination-pages").append(page);
						}
					}
				}

				//下一页
				if (nowPageNum < allPageNum) {
					var next = document.createElement("a");
					next.className = "next";
					next.innerHTML = langData['siteConfig'][6][34];//下一页
					next.onclick = function () {
						atpage = nowPageNum + 1;
						tt.getList(currid);
					}
					info.find(".pagination-pages").append(next);
				}

				info.show();

			}else{
				info.hide();
			}
		},

  }
})
