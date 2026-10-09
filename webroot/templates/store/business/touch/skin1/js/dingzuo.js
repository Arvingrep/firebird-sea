$(function(){

	if(!state){
		$(".onlineUrl").attr("href", "javascript:;");
		setTimeout(function(){
			alert(langData['siteConfig'][22][95]);
			$(".order").css({"transition":"opacity .3s", "opacity":.3});
		}, 500)
		return false;
	}

	// 日期tab切换
	$('.data_nav ul li').click(function(){
		var x = $(this),
			index = x.index();
		x.addClass('dn_bc').siblings().removeClass('dn_bc');
		getTable();
	}).each(function(i){
		var x = $(this), date = x.attr('data-date');
		if(i < 2){
			x.next().attr('data-date', GetDateStr(date, 1));
		}
	})

	function getTable(){
		var date = $('.data_nav ul li.dn_bc').attr('data-date');
		$.ajax({
			url: '/include/ajax.php?service=business&action=dingzuoGetTable&store='+shopid+'&date='+date,
			type: 'post',
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
					// var have = data.info.have, time = data.info.time;

					// var haveArr = [];
					// var timeArr = [];

					// if(have.length > 0 && time.length > 0){
					// 	for(var i = 0; i < time.length; i++){
					// 		timeArr.push('<li><a href="'+onlineUrl.replace("%date%", time[i].date)+'">'+time[i].time+'</a></li>');
					// 	}

					// 	$(".time_list ul").html(timeArr.join("")).addClass("has");

					// 	for(var i = 0; i < have.length; i++){
					// 		haveArr.push('<li>• '+have[i].min+'-'+have[i].max+'人(余'+have[i].count+'桌)</li>');
					// 	}

					// 	$(".residue_box ul").html(haveArr.join(""));

					// }else{
					// 	$(".time_list ul").html("").removeClass("has");
					// 	$(".residue_box ul").html("<li>抱歉，没有可预定的桌位了，看看后一天的吧~</li>");
					// }
				}
			},
			error: function(){

			}
		})
	}

	function GetDateStr(date, AddDayCount) {
	    var dd = new Date(date);
	    dd.setDate(dd.getDate()+AddDayCount);//获取AddDayCount天后的日期
	    var y = dd.getFullYear();
	    var m = dd.getMonth()+1;//获取当前月份的日期
	    var d = dd.getDate();

	    return y+'-'+m+'-'+d;
	}

	getTable();

})
