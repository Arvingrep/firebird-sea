$(function(){
	var cN = ['订单数', '支付人数', '支付金额']
	var myChart = echarts.init(document.getElementById('lineBox'));
	var sflag = false,pflag =false;
	// 折线图
	function lineChart(chartName) {
		sflag = true;
	    // 基于准备好的dom，初始化echarts实例	    
	    var option = {
	      	color: ['#1495EB', '#5D7092', '#00CC66', '#ff9900', '#9860DF'],
		    tooltip: { // hover 后，竖直放向指示线
		        trigger: 'axis',
		        backgroundColor: "rgba(0, 0, 0, .5)", //设置背景图片 rgba格式
		        borderWidth: '0',
		        axisPointer: {
		          lineStyle: {
		            color: '#1495EB',
		            type: "solid"
		          }
		        },
		        textStyle: {
		          color: '#fff'
		        }
		    },
		    legend: {
		        show: true,
		        left: '0',
		        data: chartName
		    },
			grid: {
				left: 30,
				right: 25,
				bottom: 10,
				top: 60,
				containLabel: true
			},
	      	calculable: true,
	      	xAxis: [{
		        type: 'category',
		        boundaryGap: false,
		        axisLine: {
		          lineStyle: {
		            color: '#1495EB' // x轴颜色
		          }
		        },
		        axisTick: {
		          show: false //是否显示x轴刻度
		        },
		        splitLine: { //是否在chart区域显示竖直线
		          show: false,
		          lineStyle: {
		            color: '#ff0000'
		          }
		        },
		        // axisPointer: {
		        //     type: 'shadow'
		        // },
		        axisLabel: {
		          	interval: 0,
			        textStyle: {
			            color: '#999', // x轴文字颜色

			        }
	        	}

	      	}],
	      	yAxis: [
	      		{	 name: '订单/支付人数',
			        axisLine: {
			          show: true,
			          lineStyle: {
			            color: '#1495EB' // x轴颜色
			          }
			        },
			        axisTick: {
			          show: true
			        },
			        splitArea: { //分隔区域
			          show: true,
			          areaStyle: {
			            color: ['#FDFDFD', '#F4F4F4']
			          }
			        },
			        axisLabel: {
			          textStyle: {
			            color: '#1495EB'
			          }
			        },
			        axisPointer: {
			          show: true,
			          triggerTooltip: false
			        },
			        splitLine: {
			          show: true,
			          lineStyle: {
			            color: '#F5F7F9'
			          }
			        },
		        	type: 'value'
		      	},
		      	{
		      		 name: '支付金额',
			        axisLine: {
			          show: true,
			          lineStyle: {
			            color: '#1495EB' // x轴颜色
			          }
			        },
			        axisTick: {
			          show: true
			        },
			        splitArea: { //分隔区域
			          show: true,
			          areaStyle: {
			            color: ['#FDFDFD', '#F4F4F4']
			          }
			        },
			        axisLabel: {
			          textStyle: {
			            color: '#1495EB'
			          }
			        },
			        axisPointer: {
			          show: true,
			          triggerTooltip: false
			        },
			        splitLine: {
			          show: true,
			          lineStyle: {
			            color: '#F5F7F9'
			          }
			        },
		        	type: 'value'
		      	}
	      	],
	      	series: [
		      	{
			        name: '订单数',
			        type: 'line',
			        yAxisIndex:0,
			        markPoint: {
			          data: [{
			            type: 'max',
			            name: '最大值'
			          }],
			          label: {
			            color: '#fff'
			          }
			        }
			    },
			    {
			        name: '支付人数',
			        type: 'line',
			        yAxisIndex:0,
			        markPoint: {
			          data: [{
			            type: 'max',
			            name: '最大值'
			          }],
			          label: {
			            color: '#fff'
			          }
			        }
			    },
			    {
			        name: '支付金额',
			        type: 'line',
			        yAxisIndex:1,
			        markPoint: {
			          data: [{
			            type: 'max',
			            name: '最大值'
			          }],
			          label: {
			            color: '#fff'
			          }
			        }
			    }
		    ]

	    }

	    // 使用制定的配置项和数据显示图表
	    if (option && typeof option === "object") {
	      myChart.setOption(option, true);
	    }
	    
	}

	
    var pieLegendData = ['新成交客户', '老客户']

    var myChart2 = echarts.init(document.getElementById('pieBox'));
    
    // 饼状图
    function pieChart(chartTitle, legendData) {
    	pflag = true;
        // 基于准备好的dom，初始化echarts实例
        var option = {
          color: ['#1495EB', '#00CC66', '#F9D249', '#ff9900', '#9860DF'],
          title: {
            text: chartTitle,
            left: 'center',
            textStyle:{
            	fontSize:14
            }
          },
          tooltip: { // hover 当前块的数据
            trigger: 'item',
            formatter: "{a} <br>{b} : {c} ({d}%)",
            backgroundColor: "rgba(0, 0, 0, .5)", //设置背景图片 rgba格式
            borderWidth: '0',
            textStyle: {
              color: '#fff'
            }
          },
          legend: {
            show: true,
            left: "center",
            top: "75%",
            itemWidth: 24,
            itemHeight: 14,
            data: legendData,
            textStyle: {
              // color: '#fff'
            }
          },

          calculable: true,
          series: [{
            name: '成交比',
            type: 'pie',
            radius: '45%',
            center: ['50%', '40%'],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            labelLine: {
              length: 5,
              length2: 10,
              smooth: true,
            },
   //          label: {
			//   normal: {
			//     position: 'inner',
			//     show : false
			//   }
			// },
            data: [{
		        'name': '新成交客户',
		        'value': 20
		      }, {
		        'name': '老客户',
		        'value': 30
		    }]
          }]
        }

        // 使用制定的配置项和数据显示图表
        if (option && typeof option === "object") {
          myChart2.setOption(option, true);
        }

    }

    window.onresize = function(){
	    myChart.resize();
	    myChart2.resize();
	}

	//主要数据
	$.ajax({
		url: "/include/ajax.php?service=business&action=orderList",
		type: "GET",
		dataType: "json",
		success: function (data) {
			if(data && data.state != 200){
				var info = data.info[0];
				$('.mainData .pannel1 .panNum').text(info.ordercount);
				$('.mainData .pannel1 .yesNum').text(info.yesterdayorderCount);
				$('.mainData .pannel1 .calcNum span').text(info.proportionorder+'%');
				if(info.proportionorder < 0){
					$('.mainData .pannel1 .calcNum').addClass('numDown');
				}

				$('.mainData .pannel2 .panNum').text(info.orderpricecount);
				$('.mainData .pannel2 .yesNum').text(info.yesorderpriceCount);
				$('.mainData .pannel2 .calcNum span').text(info.proportionpriceorder+'%');
				if(info.proportionpriceorder < 0){
					$('.mainData .pannel2 .calcNum').addClass('numDown');
				}

				$('.mainData .pannel4 .panNum').text(info.history);
				$('.mainData .pannel4 .yesNum').text(info.yesterdayhistory);
				$('.mainData .pannel4 .calcNum span').text(info.proportionhistory+'%');
				if(info.proportionhistory < 0){
					$('.mainData .pannel4 .calcNum').addClass('numDown');
				}

				$('.mainData .pannel5 .panNum').text(info.collect);
				$('.mainData .pannel5 .yesNum').text(info.yesterdaycollect);
				$('.mainData .pannel5 .calcNum span').text(info.proportioncollect+'%');
				if(info.proportioncollect < 0){
					$('.mainData .pannel5 .calcNum').addClass('numDown');
				}

				$('.mainData .pannel3 .panNum').text(info.people);
				$('.mainData .pannel3 .yesNum').text(info.yesterdaypeople);
				$('.mainData .pannel3 .calcNum span').text(info.paypeople+'%');
				console.log(info.paypeople)
				if(info.paypeople < 0){
					$('.mainData .pannel3 .calcNum').addClass('numDown');
				}

			}
		},
	})

    // 折线图 日期切换
    $('.orderDate .dateItem,.orderDate .icon-rili').click(function(){
    	var par = $(this).closest('.orderDate');
    	var downItem = par.find('.downItem');
    	downItem.toggleClass('show');

    })

    //选择日期
    $('.downItem li').click(function(){
    	var txt = $(this).find('span').text();
    	$(this).addClass('selected').siblings('li').removeClass('selected');
    	var par = $(this).closest('.downItem');
    	var parid = $(this).closest('.downList').attr('data-id');
    	par.siblings('.dateItem').find('input').val(txt);
		par.toggleClass('show');
    	getRepose(parid);
    	return false;
    })
    for(var j = 1;j<7;j++){
    	getRepose(j);
    }

    //金额 客户数切换
    $('.pieChart-switch button').click(function(){
    	$(this).addClass('active').siblings('button').removeClass('active');
    	getRepose(3)
    })
    

    function getRepose(tid) {
    	var date = $('.downList[data-id="'+tid+'"]').find('li.selected').attr('data-id');
    	if(tid ==1){//支付订单
    		if(sflag == false){
    			lineChart(cN);
    		}
    		$.ajax({
				url: "include/ajax.php?service=business&action=paymentOrder&date="+date,
				type: "GET",
				dataType: "json",
				success: function (data) {
					if(data && data.state != 200){
						var yxdata1 = [],yxdata2 = [],yxdata3 = [],xData = [];
						var list = data.info;
						for(var i = 0; i < list.length; i++){
							if(list[i].amount*1 >= 2100){
									list[i].amount = 18;
								}
							var pay_price = list[i].pay_price*1,
								user   = list[i].user*1,
								total = list[i].total*1,
								xdate = list[i].date;
								
							yxdata1.push(total);
							yxdata2.push(user);
							yxdata3.push(pay_price);
							xData.push(xdate)
						}
						myChart.setOption({
							xAxis: {
					            data: xData
					        },
							series: [{
					            data: yxdata1
					        },{
					            data: yxdata2
					        },{
					            data: yxdata3
					        },
					        ]
						});

					}
				},
			})
    	}else if(tid ==2){//成交客户
    		$.ajax({
				url: "include/ajax.php?service=business&action=dealCustomer&date="+date,
				type: "GET",
				dataType: "json",
				success: function (data) {
					if(data && data.state != 200){
						var list = data.info;
						$('.fkorderPer').text(list.payOrderRate+'%');
						$('.xdorderPer').text(list.orderRate+'%');
						$('.fkNum').text(list.histroy);
						$('.xdNum').text(list.orderUser);
						$('.xdmoneyNum').text(list.orderPrice);
						$('.zfNum').text(list.payOrderUser);
						$('.zfmoneyNum').text(list.payOrderPrice);
						$('.kdNum').text(list.userRate);

					}
				},
			})
    	}else if(tid ==3){//成交客户占比
    		if(pflag == false){
    			pieChart('成交金额占比', pieLegendData);
    		}
    		var cuper = $('.pieChart-switch button.active').attr('data-id');

    		$.ajax({
				url: "/include/ajax.php?service=business&action=customer&date="+date,
				type: "GET",
				dataType: "json",
				success: function (data) {
					if(data && data.state != 200){
						var list = data.info[0];
						if(cuper == 1){//金额
							myChart2.setOption({
								series: [{
									data: [{
								        'name': '新成交客户',
								        'value': list.newTotalPrice
								      }, {
								        'name': '老客户',
								        'value': list.oldTotalPrice
								    }]
								}]
							});
						}else{//客户数
							myChart2.setOption({
								series: [{
									data: [{
								        'name': '新成交客户',
								        'value': list.newUser
								      }, {
								        'name': '老客户',
								        'value': list.oldUser
								    }]
								}]
							});
						}
						

					}
				},
			})
    	}else if(tid ==4 || tid ==5 || tid ==6){//商品支付排行
    		var url = "include/ajax.php?service=business&action=payRanking&date="+date;
    		if(tid ==5){//商品访客
    			url = "include/ajax.php?service=business&action=hisRanking&date="+date;;
    		}else if(tid ==6){//商品加购
    			url = "include/ajax.php?service=business&action=shopIncrease&date="+date;;
    		}
    		$.ajax({
				url: url,
				type: "GET",
				dataType: "json",
				success: function (data) {
					if(data && data.state != 200){
						var list = data.info.list, pageInfo = data.info.pageInfo;
						var html = [];
						if(list.length > 0){
							for(var i = 0; i < list.length; i++){
								var cla = (i<3)?'navy-blue':'gray';
								html.push('<div class="rankRow fn-clear">');
								html.push('<div class="ranklist col4"><span class="'+cla+'">'+(i+1)+'</span></div>');
								html.push('<div class="ranklist col16">');
								html.push('<img src="'+list[i].pic+'" alt="">');
								html.push('<span><a href="'+list[i].url+'">'+list[i].title+'</a></span>');
								html.push('</div>');
								html.push('<div class="ranklist col4">'+list[i].sales+'</div>');
								html.push('</div>');
							}
							if(tid == 4){
								$('.rankData.payD .rankContent').html(html.join(''));
							}else if(tid == 5){
								$('.rankData.seeD .rankContent').html(html.join(''));
							}else if(tid == 6){
								$('.rankData.buyD .rankContent').html(html.join(''));
							}
						}
						

					}
				},
			})
    	}
    }



});
