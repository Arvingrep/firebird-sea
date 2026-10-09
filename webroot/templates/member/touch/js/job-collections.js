/**
 * 会员中心招聘投递职位列表
 *  at: 20221018
 */


 var page = new Vue({
	el:'#page',
	data:{
		tabList:[  { id:1, tit:'职位', noread:0 }, { id:2, tit:'公司', noread:0 } ],
		currOnTab:1,  //当前选中的 tab
		tabOffLeft:0, //tab底边偏移
		collectList:[], //收藏列表
		tdpage:1,
		isload:false,  
		loadEnd:false,  //加载完成
		onManage:false, //是否处于管理
		onChoseArr:[], //选中的

	},
	mounted(){
		var tt = this;
		if(tt.getUrlParam('company')){
			tt.currOnTab = 2
		}else{

			tt.checkLeft();
			// 获取数据
			tt.getMytdList();
		}

		$(window).scroll(function(){
			var scrollTop = $(window).scrollTop();
			var domH = $('body').height();
			var winH = $(window).height();
			if(scrollTop + winH >= (domH - 50) && !tt.isload){
				tt.getMytdList()
			}
		})
	},
	methods:{
		checkLeft(){
			var tt = this;
			var el = $('.tabBox li[data-id="'+tt.currOnTab+'"]');
			var left = el.offset().left + el.width()/2 - $('.tabBox .line').width() / 2;
			tt.tabOffLeft = left;
		},

		// 获取投递列表
		getMytdList(){
			var tt = this;
			if(tt.isload) return false;
			tt.isload = true;
			var str = '&temp=' + (tt.currOnTab == 1 ? 'job':'company');
			if(tt.tdpage == 1){
				tt.collectList = [];
			}
			$.ajax({
				url: "/include/ajax.php?service=member&action=collectList&module=job"+str+"&page=" + tt.tdpage  ,
				type: "GET",
				dataType: "json",
				success: function (data) {
					tt.isload = false;
					
					if(data.state == 100){
						var  list = data.info.list;
						for(var i = 0; i< list.length; i++ ){
							tt.collectList.push(list[i])
						}
						tt.tdpage++;
						if(tt.tdpage > data.info.pageInfo.totalPage){
							tt.isload = true;
							tt.loadEnd = true;
						}

					}else{
						tt.isload = true;
						tt.loadEnd = true;
					}
				},
				error:function(data){ }
			})
		},

		// 获取url参数
		getUrlParam(name){
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
			var reg_rewrite = new RegExp("(^|/)" + name + "/([^/]*)(/|$)", "i");
			var r = window.location.search.substr(1).match(reg);
			var q = window.location.pathname.substr(1).match(reg_rewrite);
			if(r != null){
				return unescape(r[2]);
			}else if(q != null){
				return unescape(q[2]);
			}else{
				return null;
			}
		},

		// 多选
		choseItem(item){  //此处缺少进入招聘流程的状态
			var tt = this;
			if(tt.onManage){
				if(tt.onChoseArr.indexOf(item.id) > -1){
					tt.onChoseArr.splice(tt.onChoseArr.indexOf(item.id),1)
				}else{
					tt.onChoseArr.push(item.id)
				}
			}else if(item.detail.state === 2 || item.detail.off || item.detail.del){
				showErrAlert('该职位已被招聘方下架或删除');
				return false;
			}else if(item.detail.state === 0){
				const options = {
					title: '<s></s>该职位审核中',    // 提示标题
					confirmHtml:'<p>该职位内容可能有变动，平台正在审核中</p>',
					btnSure: '好的',
					isShow: true,
					popClass:'myConfirm',
					noCancel:true
				}
				confirmPop(options,function(){
					
				})
			}
		},

		// 全选
		choseAll(){
			var tt = this;
			if(tt.onChoseArr.length == tt.collectList.length){
				tt.onChoseArr = []
			}else{
				tt.onChoseArr = tt.collectList.map(function(item){
					return item.id
				})
			}
			
		},

		// 确定取消
		confirmCancel(){
			var tt = this;
			var options = {
				isShow:true,
				btnSure : '确定',
				btnColor:'#1861F2',
				title : '确定要取消收藏这'+tt.onChoseArr.length+'条信息?'
			}
			confirmPop(options,function(){
				tt.cancelCollecct();
			})
		},

		// 取消收藏
		cancelCollecct(){
			var tt = this;
			var ids = tt.onChoseArr.join(',')
			$.ajax({
				url: "/include/ajax.php?service=member&action=delCollect&id="+ids,
				type: "GET",
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100){
						showErrAlert(data.info);
						tt.tdpage = 1;
						tt.isload = false;
						tt.loadEnd = false;
						tt.getMytdList()
					}else{
						alert(data.info);
					}
				},
				error: function(){
					alert(langData['siteConfig'][20][183]);
				}
			});
		},

		timeStrToDate(timeStr,type){
			var now = new Date();
			var date = new Date(timeStr * 1000)
			var year = date.getFullYear();  //取得4位数的年份
			var month = date.getMonth()+1;  //取得日期中的月份，其中0表示1月，11表示12月
			var dates = date.getDate();      //返回日期月份中的天数（1到31）
			var day = date.getDay();
			var hour = date.getHours();     //返回日期中的小时数（0到23）
			var minute = date.getMinutes(); //返回日期中的分钟数（0到59）
			var second = date.getSeconds(); //返回日期中的秒数（0到59）
			var weekDay = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
			var datestr = month + '/' + dates ;
			minute = minute > 9 ? minute : '0' + minute;
			if(now.toDateString() === date.toDateString() ){
				datestr = '今天'
			}
			datestr = datestr +' '+ hour +  ':' + minute;

			if(type == 1){
				datestr = month + '/' + dates 
			}
			return datestr;
		},


		
	},
	watch:{
		currOnTab(val){
			var tt = this;
			tt.checkLeft();
			tt.onManage = false;
			tt.tdpage = 1;
			tt.isload = false;
			tt.loadEnd = false;
			tt.getMytdList()
		},
	}
})