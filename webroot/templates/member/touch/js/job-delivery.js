/**
 * 会员中心招聘投递职位列表
 *  at: 20221018
 */


var page = new Vue({
	el:'#page',
	data:{
		tabList:[ { id:'', tit:'全部' }, { id:1, tit:'被查看', noread:0 }, { id:2, tit:'有意向', noread:0 }, { id:3, tit:'邀面试', noread:0 }, { id:4, tit:'不合适', noread:0 }, ],
		currOnTab:'',  //当前选中的 tab
		tabOffLeft:0, //tab底边偏移
		tdList:[],
		tdpage:1,
		isload:false,  
		loadEnd:false,  //加载完成
		batch:'', //单投/批量投 选中
		batch0:'',
		batch1:'', //多投
		showtdPop:false,
		popInfoDetail:'', //弹窗信息
	},
	mounted(){
		var tt = this;
		
		if(tt.getUrlParam('state')){
			tt.currOnTab = tt.getUrlParam('state');
			// tt.getMytdList();
		}else{
			tt.getMytdList();
		}
		tt.checkLeft();
		// 获取数据
	

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
				url: "/include/ajax.php?service=job&action=myDeliveryList&page=" + tt.tdpage + '&state=' + tt.currOnTab + '&batch=' + tt.batch,
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

						for(var i in tt.tabList){
							var m = tt.tabList[i].id;
							tt.tabList[i]['noread'] = data.info.pageInfo['state' + m]
						}
						tt.batch1 = data.info.pageInfo['batch1'];
						tt.batch0 = data.info.pageInfo['batch0'];



					}
				},
				error:function(data){ }
			})
		},

		changeBacth(d){
			var tt = this;

			if(tt.batch === d){
				tt.batch = ''
			}else{
				tt.batch = d
			}
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


		// 点击投递信息
		showtdPopInfo(item){
			var tt = this;
			if(item.postState < 3){
				tt.showtdPop = true;
				tt.popInfoDetail = item;
				var arr = []
				for(var i = 0 ; i < (item.postState + 1); i ++ ){
					var state = item.postState - i;
					var tipText = '';
					var titleText = '';
					var time = ''
					switch (state){
						case 0:
							titleText = '投递成功'
							tipText = '等待招聘方查收'
							time = tt.timeStrToDate(item.date);
							break;
						case 1:
							titleText = '已查阅'
							tipText = ''
							time = tt.timeStrToDate(item.read_time);
							break;
						case 2:
							titleText = '有意向'
							tipText = '招聘方对你的简历很感兴趣！'
							time = tt.timeStrToDate(item.pass_time);
							break;
						
						

					}
					console.log(state,titleText)
					arr.push({
						tipText:tipText,
						titleText:titleText,
						time:time,
					})
				}
				console.log(arr)
				tt.popInfoDetail['postNum'] = arr;
			}
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
	},
	watch:{
		currOnTab(val){
			var tt = this;
			tt.checkLeft();
			tt.tdpage = 1;
			tt.isload = false;
			tt.loadEnd = false;
			tt.getMytdList();

			// 改变url
			let url = memberDomain + '/job-delivery.html?appFullScreen&state=' + val 
			window.history.replaceState({}, 0, url);
		},

		//单投/批量投
		batch(val){
			var tt = this;
			tt.tdpage = 1;
			tt.isload = false;
			tt.loadEnd = false;
			tt.getMytdList()
		},

		showtdPop(val){
			var tt = this;
			if(val){
				$('html').addClass('noScroll')
			}else{
				$('html').removeClass('noScroll')

			}
		}
	}
})