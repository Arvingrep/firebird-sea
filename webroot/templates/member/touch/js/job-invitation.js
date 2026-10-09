
var page = new Vue({
	el:'#page',
	data:{
		end:0, //面试结束
		end0:'', //待面试的数量
		end1:'', //已结束的数量
		isload:false,
		loadEnd:false,
		tdList:[],
		tdpage:1,
		arrayData:'',
		showBtn:false,
		showId:0
	},
	mounted(){
		var tt = this;
		tt.getMyInvitationList(1);

		// 滚动加载
		$(window).scroll(function(){
			var scrollTop = $(window).scrollTop();
			var domH = $('body').height();
			var winH = $(window).height();
			if(scrollTop + winH >= (domH - 50) && !tt.isload){
				tt.getMyInvitationList()
			}
		})
	},
	methods:{
		changeEnd:function(val){
			var tt = this;
			tt.end = val;
		},

		// 获取投递列表
		getMyInvitationList(once){
			var tt = this;
			if(tt.isload) return false;
			tt.isload = true;
			$.ajax({
				url: "/include/ajax.php?service=job&action=myInterviewList&pageSize=10&page=" + tt.tdpage + '&state=' + tt.end,
				type: "GET",
				dataType: "jsonp",
				success: function (data) {
					tt.isload = false;
					if(data.state == 100){
						
						if(tt.tdpage == 1){
							tt.tdList = [];
						}
						var  list = data.info.list;
						for(var i = 0; i< list.length; i++ ){
							tt.tdList.push(list[i])
						}
						tt.tdpage++;
						if(tt.tdpage > data.info.pageInfo.totalPage){
							tt.isload = true;
							tt.loadEnd = true;
						}
						if(once && !data.info.list.length && data.info.pageInfo.state1){
							tt.end = 1;
						}
						tt.end0 = data.info.pageInfo.state0;
						tt.end1 = data.info.pageInfo.state1;
					}else {
						if(once){
							tt.end = 1;
						}
					}
				},
				error:function(data){ }
			})
		},

		// 时间转换
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
			var datestr = month + '月' + dates + '日('+weekDay[day]+')';
			minute = minute > 9 ? minute : '0' + minute;
			if(now.toDateString() === date.toDateString() ){
				datestr = '今天'
			}
			datestr = datestr +' '+ hour +  ':' + minute;
			if(now.getFullYear() != year){
				datestr = year + '年' + datestr;
			}
			// if(type == 1){
			// 	datestr = month + '/' + dates 
			// }
			return datestr;
		},

		// 标注
		changeUreamark(flag,item){
			var tt = this;
			$.ajax({
				url: '/include/ajax.php?service=job&action=userUpdateInvitationRemark&id=' + item.id +'&flag=' + flag,
				type: "GET",
				dataType: "json",
				success: function (data) {
					if(data.state == 100){
						tt.$set(item,'u_remark',flag)
						tt.showBtn = false;
						showSuccessTip('标注成功','', '','successTip');
					}
				},
				error:function(data){ }
			})
		},


	},

	watch:{
		end:function(val){
			var tt = this;
			console.log(val)
			tt.tdpage = 1;
			tt.loadEnd = false;
			tt.isload = false;
			tt.getMyInvitationList();
		},
	}
})


