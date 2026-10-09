
var page = new Vue({
	el:'#page',
	data:{
		navList:navList,
		currid:0,
		hoverid:'',
		loading:false,
	},
	mounted() {
		var tt = this;
		// var chartDom = document.getElementById('read');
		// var myChart = echarts.init(chartDom);
		// tt.drawChart('read',tt.getDay(7),data_read);
		//
		// var data_yixiang =  [100,265,78,40,150,156,100];  //意向
		// var chartDom2 = document.getElementById('yixiang');
		// var myChart2 = echarts.init(chartDom2);
		// tt.drawChart('yixiang',tt.getDay(7),data_yixiang.reverse());
		tt.getData(7)
		$(".date_chose span").click(function(){
			var t = $(this);
			if(!t.hasClass('curr_chose')){
				t.addClass('curr_chose').siblings('span').removeClass('curr_chose');
				var dom = t.closest('.chartsbox').find('.charts').attr('id');
				var day = t.attr('data-day');
				tt.getData(day);
			}
		})
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

		// 获取数据
		getData:function(day){
			var tt = this;
			if(tt.loading) return false;
			tt.loading = true;
			axios({
				method: 'post',
				url: masterDomain + '/include/ajax.php?service=house&action=loupanStatistics&loupanid='+loupanid+'&day='+day,
			})
			.then((response)=>{
				tt.loading = false;
				var data = response.data;
				tt.drawChart("read",tt.getDay(day),data.info.clickarr.reverse());
				tt.drawChart("yixiang",tt.getDay(day),data.info.yxarr.reverse());
			})
		},

		//获取最近几天
		getDay:function(day){
		   var day = -day;
		   var tt = this;
		   var today = new Date();
		   var dateArr = [];
		   var dayCount = Math.abs(day);
		   var nmon = today.getMonth()+1;
		   nmon = nmon>9?nmon:('0'+nmon)
		   dateArr.push(nmon+"."+today.getDate());
		   for(var i = 1; i <= dayCount-1; i++){
			   if(day>0){
				    var targetday_milliseconds= today.getTime() + 1000*60*60*24;
			   }else{
				    var targetday_milliseconds= today.getTime() - 1000*60*60*24;
			   }

			   today.setTime(targetday_milliseconds); //注意，这行是关键代码

			   var tYear = today.getFullYear();
			   var tMonth = today.getMonth();
			   var tDate = today.getDate();
			   tMonth = tt.doHandleMonth(tMonth + 1);
			   tDate = tt.doHandleMonth(tDate);
			   dateArr.push(tMonth+"."+tDate)
			   console.log(tMonth+"."+tDate)
		   }
			dateArr = dateArr.reverse();
			return dateArr;
		},
		doHandleMonth:function(month){
		       var m = month;
		       if(month.toString().length == 1){
		          m = "0" + month;
		       }
		       return m;
		},

		// 画图
		drawChart:function(dom,dateArea,dataList){
			var chartDom2 = document.getElementById(dom);
			var myChart2 = echarts.init(chartDom2);
			var myChartoption2;
				myChartoption2 = {
					color: [ '#0986FF'],
				    tooltip: {
				        trigger: 'axis',
						backgroundColor:'#fff',
						borderWidth:0,
				        axisPointer: {
				            type: 'cross',
				            label: {backgroundColor: '#6a7985'}
				        },
						shadowBlur:20,
						borderRadius:19,
						shadowColor:'rgba(59, 55, 85, 0.2)',
						padding:0,
						formatter : function (params,ticket, callback) {
							var htmlEle = '';
							params.forEach(function(val,index){
								htmlEle += '<div style="min-width:82px; border-radius:30px; height:38px; text-align:center; line-height:38px; color:#534F71; font-size:16px;">'+val.value+'</div>'
							})
							 return htmlEle;
						},
				    },

					grid: {bottom: 40},
				    xAxis: [
				        {
				            type: 'category',
				            boundaryGap: false,
				            data: dateArea,
							axisTick: {show:false},
							axisLine: {show: false},
							axisLabel: {color: 'rgba(80, 87, 106, .6)'},
				        }
				    ],
				    yAxis: [
				        {
				            type: 'value',
							show: true,
							min: 0,
							splitLine: {
							    lineStyle: {
							        // 使用深浅的间隔色
							        color: ['#f0f0f0']
							    }
							},
							boundaryGap: false,
							axisLabel: {color:'rgba(80, 87, 106, .6)'},
				        }
				    ],
				    series: [
				        {
				            // name: '用户',
				            type: 'line',
				            smooth: true,
				            lineStyle: {width: 2, color: '#0986FF'},
							symbol: 'emptyCircle',
							showSymbol: false,
							symbolSize: 6,
							yAxisIndex: 0,
				            areaStyle: {
				                opacity: 0.8,
				                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
				                    offset: 0,
				                    color: '#ECF6FF'
				                }, {
				                    offset: 1,
				                    color: '#ECF6FF00'
				                }])
				            },
				            emphasis: {focus: 'series'},
				            data: dataList
				        }
					]
				};
				myChartoption2 && myChart2.setOption(myChartoption2);
		}
	}

})
