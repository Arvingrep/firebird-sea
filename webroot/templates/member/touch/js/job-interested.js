/**
 * 会员中心招聘投递职位列表
 *  at: 20221018
 */


var page = new Vue({
	el:'#page',
	data:{
		tabList:[ { id:'', tit:'全部' }, { id:1, tit:'收藏我', noread:0 }, { id:2, tit:'看过我', noread:0 } ],
		currOnTab:'',  //当前选中的 tab
		tabOffLeft:0, //tab底边偏移
		tdList:[],
		tdpage:1,
		isload:false,  
		loadEnd:false,  //加载完成
	},
	mounted(){
		var tt = this;
		tt.checkLeft();
		// 获取数据
		tt.getMytdList();

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
			$.ajax({
				url: "/include/ajax.php?service=job&action=interestMe&page=" + tt.tdpage + '&type=' + tt.currOnTab ,
				type: "GET",
				dataType: "jsonp",
				success: function (data) {
					tt.isload = false;
					console.log(10)
					if(data.state == 100){
						if(tt.tdpage == 1){
							tt.tdList = [];
						}
						var  list = data.info.list;
						for(var i = 0; i< list.length; i++ ){
							let url = list[i].companyUrl
							let param = url.split('?')[1]
							let paramArr = param.split('&')
							let idParam = paramArr.find(item => {
								return item.indexOf('id=') > -1
							})
							let id = idParam.replace('id=','')
							list[i]['companyId'] = id
							tt.tdList.push(list[i])
						}
						tt.tdpage++;
						if(tt.tdpage > data.info.pageInfo.totalPage){
							tt.isload = true;
							tt.loadEnd = true;
						}

						for(var i in tt.tabList){
							var m = tt.tabList[i].id;
							tt.tabList[i]['noread'] = data.info.pageInfo['state' + m]
						}



					}
				},
				error:function(data){ }
			})
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

		// 升级简历 == 刷新简历
		uplevelResume(){
			var tt = this;
			intention_pop.toTopPopShow = true;
		},
		
	},
	watch:{
		currOnTab(val){
			var tt = this;
			tt.checkLeft();
			tt.tdpage = 1;
			tt.isload = false;
			tt.loadEnd = false;
			tt.getMytdList()
		},
	}
})