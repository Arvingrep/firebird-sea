// $('.appMapBtn').attr('href', OpenMap_URL);
var page = new Vue({
	el:'#page',
	data:{
		invitation_state:invitation_state, //面试或者投递的状态
		popInfoDetail:'',
		recPostList:[],
		chosePostArr:[],
		infoType:0,  //0是投递详情，1是面试详情
		infoId:0,
		pltou:false, //批量投递
		showBtn:false, //按钮显示
		showPop:false, //显示弹窗
		menuList:[{
			id:1,
			title:'该工作不适合我'
		},{
			id:2,
			title:'双方沟通一致取消面试'
		},{
			id:3,
			title:'已找到工作'
		},{
			id:4,
			title:'其他'
		}]
	},
	created:function(){
		var tt = this;
		// 查看参数
		tt.infoId = tt.getUrlParam('id');
		var urlType = tt.getUrlParam('type')
		if(urlType && urlType == 'delivery'){
			tt.infoType = 0;
			tt.invitation_state = 2 ; //待定
		}else if(urlType && urlType == 'invitation'){
			tt.infoType = 1
		}

	},
	mounted:function(){
		var tt = this;
		tt.getInfoDetail()
		if(!tt.infoType){  //投递详情才有 批量投递
			tt.getrecPost()
		}


		mobiscroll.settings = {
		    theme: 'ios',
		    themeVariant: 'light',
			height:40,
			lang:'zh',
			
			headerText:true,
			calendarText:'选择',  //时间区间选择
		};

		mobiscroll.select('#scollObj', {
			data:tt.menuList,
			inputElement: document.getElementById('my-input'),
			display: 'inline',
			dataText:'title',
			dataValue:'id',
			onSet: function (event, inst) {
				
			},
		})
	},
	methods:{

		// 职位待审核
		toPostLink(job){
			if(job.state === 2 || job.off == 1 || job.del == 1 || job.state === 0){
				let options = {
					title: '<s></s>该职位已失效',    // 提示标题
					confirmHtml:'<p>该职位已被下架或删除，如需沟通投递或面试事宜，请与招聘方核实</p>',
					btnSure: '好的',
					isShow: true,
					popClass:'myConfirm',
					noCancel:true
				}
				
				if(job.state === 0){
					options = {
						title: '<s></s>该职位审核中',    // 提示标题
						confirmHtml:'<p>该职位内容可能有变动，平台正在审核中</p>',
						btnSure: '好的',
						isShow: true,
						popClass:'myConfirm',
						noCancel:true
					}
				}
				confirmPop(options,function(){
					// 该职位不能预览正常操作
				})
			}

			
		},

		// 获取详情
		getInfoDetail(){
			var tt = this;
			var url = '/include/ajax.php?service=job&action=myDeliveryDetail&id=' + tt.infoId
			if(tt.infoType){
				url = '/include/ajax.php?service=job&action=myInterviewDetail&id=' + tt.infoId
			}

			$.ajax({
				url: url,
				type: "GET",
				dataType: "json",
				success: function (data) {
					if(data.state == 100){
						tt.popInfoDetail = data.info;
						pageData['lng'] = data.info.company.lng;
						pageData['lat'] = data.info.company.lat;
						pageData['addrDetail'] = data.info.company.address;
						pageData['address'] = data.info.company.address;
						pageData['title'] = data.info.company.title;
						getMapUrl();
						setTimeout(() => {
							$('.appMapBtn').attr('href',OpenMap_URL)
						}, 1000);
					}
				},
				error:function(data){ }
			})
		},

		// 获取推荐
		getrecPost(){
			var tt = this;
			$.ajax({
				url: '/include/ajax.php?service=job&action=jobRecommend',
				type: "GET",
				dataType: "json",
				success: function (data) {
					tt.isload = false;
					if(data.state == 100){
						tt.recPostList = data.info.list;
						tt.chosePostArr = data.info.list.map(item => {
							return item.id
						})
					}
				},
				error:function(data){ }
			})
		},

		// 批量投递职位
		diliveryPost(){
			var tt = this;
			$.ajax({
				url: '/include/ajax.php?service=job&action=delivery&rid='+tt.popInfoDetail.rid+'&rec='+tt.infoId+'&pid=' + tt.chosePostArr.join(','),
				type: "GET",
				dataType: "json",
				success: function (data) {
					if(data.state == 100){
						showSuccessTip('投递成功','', templets_skin + 'images/job/successIcon.png','successTip');
						tt.pltou = true;
					}
				},
				error:function(data){ }
			})
		},

		// 取消/选择推荐职位
		changePostChose(id){
			var tt = this;
			if(tt.chosePostArr.indexOf(id) > -1){
				tt.chosePostArr.splice(tt.chosePostArr.indexOf(id),1)
			}else{
				tt.chosePostArr.push(id)
			}
		},

		// 回绝面试
		refuseInvitation(){
			var tt = this;
			tt.showPop = false;
			var refuse_msg = $("#scollObj_dummy").val()
			showSuccessTip('已回绝面试邀请','', '','successTip');
			$.ajax({
				url: '/include/ajax.php?service=job&action=refuseInterview&id=' + tt.infoId + '&refuse_msg=' + refuse_msg,
				type: "GET",
				dataType: "json",
				success: function (data) {
					if(data.state == 100){
						showSuccessTip('已回绝面试邀请','', '','successTip');
					}
				},
				error:function(data){ }
			})
		},


		// 标注
		changeUreamark(flag){
			var tt = this;
			$.ajax({
				url: '/include/ajax.php?service=job&action=userUpdateInvitationRemark&id=' + tt.infoId +'&flag=' + flag,
				type: "GET",
				dataType: "json",
				success: function (data) {
					if(data.state == 100){
						showSuccessTip('标注成功','', '','successTip');
						tt.showBtn = false;
					}
				},
				error:function(data){ }
			})
		},

		// 获取url参数
		getUrlParam(name){
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]); return null;
		},


		// timeStrToDate(timeStr,type){
		// 	var now = new Date();
		// 	var date = new Date(timeStr * 1000)
		// 	var year = date.getFullYear();  //取得4位数的年份
		// 	var month = date.getMonth()+1;  //取得日期中的月份，其中0表示1月，11表示12月
		// 	month = month > 9 ? month : '0' + month;
		// 	var dates = date.getDate();      //返回日期月份中的天数（1到31）
		// 	dates = dates > 9 ? dates : '0' + dates;
		// 	var day = date.getDay();
		// 	var hour = date.getHours();     //返回日期中的小时数（0到23）
		// 	var minute = date.getMinutes(); //返回日期中的分钟数（0到59）
		// 	var second = date.getSeconds(); //返回日期中的秒数（0到59）
		// 	var weekDay = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
		// 	var datestr = month + '/' + dates ;
		// 	hour = hour > 9 ? hour : '0' + hour;
		// 	minute = minute > 9 ? minute : '0' + minute;
		// 	if(now.toDateString() === date.toDateString() ){
		// 		datestr = '今天'
		// 	}

		// 	if(now.getFullYear() != year){
		// 		datestr = year + '/' + datestr
		// 	}

		// 	datestr = datestr +' '+ hour +  ':' + minute;

		// 	if(type == 1){
		// 		datestr = month + '/' + dates 
		// 	}
		// 	return datestr;
		// },

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

		
	},

	watch:{
		showPop:function(val){

		}
	}
})


