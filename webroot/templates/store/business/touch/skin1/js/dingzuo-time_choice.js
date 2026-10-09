$(function(){

	// 日期推延
	$(".time_lead ul li").each(function(i){
		var t = $(this), date = t.attr('data-date');
		if(i < 2){
			var d = GetDateStr(date, 1);
			t.next().attr('data-date', d.full).children('.day').text(d.day).removeClass('vh');
		}
		if(i == 0){
			var d = GetDateStr(date, 30);
			$('#time').attr("max", d.full)
		}
	})

	// 日期选择插件

	var currYear = (new Date()).getFullYear();
	$('#time').mobiscroll().date({
	    theme: 'mobiscroll',
	    display: 'bottom',
	    showNow: true,
		nowText: langData['siteConfig'][13][24],
		startYear: currYear-0,
		endYear: currYear +1,
		dateFormat: 'yyyy-mm-dd',

	}).change(function(){
		var date = $(this).val(), today = $('#time').attr('min');
		var html = [];
		for(var i = 0; i < 3; i++){
			var m = 0, cls = '';
			if(date == today){
				m = i, cls = i == 0 ? 'class="tl_bc"' : '';
			}else{
				if(i == 0){
					m = -1;
				}else if(i == 1){
					cls = 'class="tl_bc"';
				}else if(i == 2){
					m = 1;
				}
			}
			var d = GetDateStr(date, m);
			html.push('<li data-date="'+d.full+'"'+cls+'><p>'+d.year+'</p><p class="day">'+d.day+'</p></li>');
		}
		$(".time_lead ul").html(html.join(""));

		getTable();
	});


	$('.time_lead').delegate('ul li', 'click', function(){
		var x = $(this),
			index = x.index();
		x.addClass('tl_bc').siblings().removeClass('tl_bc');

		getTable();

	})
	// 选择时间
	$('.Time_box').delegate('.time_detail ul li', 'click', function(){
		var x = $(this);
		if (x.hasClass('tl_bc')) {
			$('.time_detail ul li').removeClass('tl_bc');
			x.removeClass('tl_bc');
			$('.sure_btn').removeClass('sure_bc');
		}else{
			$('.time_detail ul li').removeClass('tl_bc');
			x.addClass('tl_bc');
			$('.sure_btn').addClass('sure_bc');
		}
	})


	// 时间更多展开
	$('.Time_box').delegate('.Time_More', 'click', function(){
		var x = $(this);
		x.closest('.time_detail').addClass('height');
		x.remove();
		$('.sure_btn').removeClass('sure_bc');
	})

	// 底部确认
	$(".sure_btn").click(function(){
		if(!$(this).hasClass("sure_bc")) return;
		var obj = $(".Time_list li.tl_bc");
		if(obj.length == 0) return;
		var date = obj.attr("data-date");
		location.href = onlineUrl.replace('%date%', date);
	})

	function getTable(){
		var date = $('.time_lead ul li.tl_bc').attr('data-date');
		$.ajax({
			url: '/include/ajax.php?service=business&action=dingzuoGetTable&store='+shopid+'&date='+date,
			type: 'post',
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
					var stage = data.info.stage, tableList = data.info.tableList, tableCount = data.info.tableCount;


					var html = [];

					if(stage.length > 0){

						for(var i = 0; i < stage.length; i++){
							if(stage[i].time.length > 0){

								var hasReserve = stage[i].hasReserve;

								// 如果已预定座位数达到总座位数，查找下一个时间段
								if(hasReserve.length == tableCount) break;

								html.push('<div class="Time_list" data-id="'+stage[i].id+'">');
								html.push('<h1>'+stage[i].typename+' ('+stage[i].start+'-'+stage[i].end+')</h1>');
								html.push('<div class="last_box">');

								html.push('<ul>');

								for(var m = 0; m < tableList.length; m++){
									var typename = tableList[m].typename,
										min = tableList[m].min,
										max = tableList[m].max,
										lower = tableList[m].lower;

									var over = lower.length;

									// 遍历桌位
									for(var n = 0; n < lower.length; n++){
										// 遍历已预定桌位
										for(var o = 0; o < hasReserve.length; o++){
											// 如果此桌位已被预定，可预定数量减1;
											if(hasReserve[o].tableid == lower[n].id){
												over--;
											}
										}
									}
									if(over){
										html.push('<li>• '+min+'-'+max+langData['siteConfig'][13][32]+'('+langData['siteConfig'][22][94].replace('1', over)+')</li>');
									}
								}
								html.push('</ul>');

								html.push('<i></i>');
								html.push('</div>');
								html.push('<div class="time_detail fn-clear">');
								html.push('<ul>');

								for(var p = 0; p < stage[i].time.length; p++){
									if(p == 7){
										html.push('<li class="Time_More">'+langData['siteConfig'][18][18]+'</li>');
									}
									html.push('<li data-date="'+date+' '+stage[i].time[p].time+'">'+stage[i].time[p].time+'</a></li>');
								}

								html.push('</ul>');
								html.push('</div>');
								html.push('</div>');

							}
						}

						$(".Time_box").html(html.join(""));

					}else{
						$(".Time_box").html("");
					}
				}
			},
			error: function(){

			}
		})
	}

	getTable();

	function GetDateStr(date, AddCount, type) {
	    var dd = new Date(date);
	    if(type == 'monty'){
	    	dd.setDate(dd.getMonth()+AddCount);//获取AddCount月后的日期
	    }else{
	    	dd.setDate(dd.getDate()+AddCount);//获取AddCount天后的日期
	    }
	    var y = dd.getFullYear();
	    var m = dd.getMonth()+1;//获取当前月份的日期
	    var d = dd.getDate();

	    m = m < 10 ? '0'+m : m;
	    d = d < 10 ? '0'+d : d;

	    return {full : y+'-'+m+'-'+d, year: y, day : m+'-'+d};
	}
})
