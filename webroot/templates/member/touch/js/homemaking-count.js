$(function() {
	dateToStr(new Date()); //初始化时间
	var opt1 = {};
	var opt2 = {};
	opt1.date = {
		preset: 'date'
	};
	opt1.datetime = {
		preset: 'datetime'
	};
	opt1.time = {
		preset: 'time'
	};
	opt1.default = {
		dateFormat: 'yy-mm-dd',
		mode: 'scroller', //日期选择模式
		lang: 'zh',
		maxDate: new Date(),
		onCancel: function() { //点击取消按钮

		},

	};
	var data = new Date(); //本月
	    data.setDate(1);
	    data.setHours(0);
	    data.setSeconds(0);
	    data.setMinutes(0);
	opt2.date = {
		preset: 'date'
	};
	opt2.datetime = {
		preset: 'datetime'
	};
	opt2.time = {
		preset: 'time'
	};
	opt2.default = {
		dateFormat: 'yy-mm-dd',
		minDate:data,
		mode: 'scroller', //日期选择模式
		lang: 'zh',
		maxDate: new Date(),
		onCancel: function() { //点击取消按钮
		},
		
	};
	
	var time = $.extend(opt1['date'], opt1['default']);
	var time2 = $.extend(opt2['date'], opt2['default']);
	$("#ftime").scroller($.extend(opt1['date'], opt1['default']));
	$("#etime").scroller($.extend(opt2['date'], opt2['default']));
	$("#etime").change(function(){
		var maxDate = new Date($("#etime").val());
		opt1.default.maxDate = maxDate;
		$("#ftime").scroller($.extend(opt1['date'], opt1['default']));
	});
	$("#ftime").change(function(){
		var minDate = new Date($("#ftime").val());
		opt2.default.minDate = minDate;
		$("#etime").scroller($.extend(opt2['date'], opt2['default']));
	});
	

	// 根据时间查询
	$('.r_btn').click(function(){
		var ftime = $('#ftime').val();
		var etime = $('#etime').val();
		console.log(ftime);
		data = {
			'ftime':ftime,
			'etime':etime,
		}
		getresult(data)
	});
	
	
	
	// 时间转换
	function dateToStr(datetime) {
		var year = datetime.getFullYear();
		var month = datetime.getMonth() + 1; //js从0开始取 
		var date = datetime.getDate();
		var hour = datetime.getHours();
		var minutes = datetime.getMinutes();
		var second = datetime.getSeconds();
	
		if (month < 10) {
			month = "0" + month;
		}
		if (date < 10) {
			date = "0" + date;
		}
		if (hour < 10) {
			hour = "0" + hour;
		}
		if (minutes < 10) {
			minutes = "0" + minutes;
		}
		if (second < 10) {
			second = "0" + second;
		}
	
		var time = year + "-" + month + "-" + date;
	
		$('#etime').val(time);
		$("#ftime").val(year + "-" + month + "-1");
		var data = {
			"ftime": year + "-" + month + "-1",
			"etime": time
		}
		 getresult(data);  //初始化加载
		return time;
	}
	function getresult(data){
		var url = "/include/ajax.php?service=homemaking&action=orderList&state=11&dispatchid="+dispatchid+"&model=1";
		$.ajax({
			url: url,
			type: "GET",
			data:data,
			dataType: "json", //指定服务器返回的数据类型
			crossDomain: true,
			success: function(data) {
				if (data.state == 100) {
					var list = [],count = 0,coutnum = 0;
					var coutresult = data.info.coutresult;
					for (var i = 0; i < coutresult.length; i++) {
						var d = coutresult[i];
						list.push('<li class="item_li" data-id="'+d.id+'">');
						list.push('<h4 class="iname">'+d.title+'</h4>');
						list.push('<div class="num_box fn-clear">');
						list.push('<div class="l_num">'+d.num+'</div>');
						list.push('<div class="r_price"><em>'+echoCurrency('symbol')+'</em>'+(Number(d.yuyue)+Number(d.follow))+'</div>');
						list.push('</div></li>');
						count = count + Number(d.yuyue)+Number(d.follow);
						coutnum +=  Number(d.num);
					}
					$('.right_count span').text(count);
					$('.left_num span').text(coutnum+"单")
					$('.item_List').html(list.join(''));
					$('.loading_tip').remove();
					
					
				} else {
					$('.listBox').append('<div class="loading_tip">暂无数据</div>');
				}
			},
			error: function(err) {
				console.log('fail');
			}
		});
	}
});


