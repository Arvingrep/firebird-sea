$(function(){

	var getData = {};
	var stageId = 0; // 所选时间段
	var count = 0; // 可选桌位数
	var isBaofang = false; // 是否包房

	// 人数加减
	$('.plus').click(function(){
		var number =Number($('.num-account').text());
		NewCount = number+1;
		$('.num-account').text(NewCount);
		people = NewCount;
		getTable();
	})
	$('.reduce').click(function(){
		var number =Number($('.num-account').text()), min = Number($('.num-account').attr('data-min'));
		min = min < 1 ? 1 : min;
		NewCount = number-1;

		if(isBaofang){
			var baofangMin = parseInt($("#baofang").attr('data-min'));
			if(NewCount < baofangMin){
				alert(langData['siteConfig'][22][35].replace('1', baofangMin));
				return;
			}
		}

		if (NewCount >= min) {
			$('.num-account').text(NewCount);

			people = NewCount;
			getTable();
		}
	})


	// 是否定包房Check
	$(".open_btn input").click(function(){
		var inp = $(this), min = parseInt(inp.attr('data-min'));
		min = min < 1 ? 1 : min;
		if(inp.is(':checked')) {
			if(parseInt($(".num-account").text()) < min){
				inp.prop("checked", false);
				alert(langData['siteConfig'][22][35].replace('1', min));
				return;
			}
			isBaofang = true;
		}else{
			isBaofang = false;
		}

		changeShow();
	})

	// 部分提示信息显示状态
	function changeShow(){
		if(isBaofang){
			$(".accept").show();
			$(".table_num").hide();
		}else{
			$(".accept").hide();
			$(".table_num").show();

			if(count){
				$(".table_num").show();
			}else{
				$(".table_num").hide();
			}
		}

		if(isBaofang || !count){
			$(".warninginfo").show();
		}else{
			$(".warninginfo").hide();
		}
	}

	// 选择包房后确定是否可以接受大厅
	$('.accept_box').click(function(){
		var x = $(this);
		if (x.find('i').hasClass('check')) {
			x.find('i').removeClass('check');
		}else{
			x.find('i').addClass('check');
		}
	})


	// 桌位号码3选一
	$('.table_num').delegate('.tn_list ul li', 'click', function(){
		var  x = $(this);
		x.addClass('tn_bc').siblings().removeClass('tn_bc');
	})

	// 性别选择
	$('.proposer .name  ul li').click(function(){
		var  x = $(this);
		x.addClass('check').siblings().removeClass('check');
	})


	// 桌位选择展开层
	$('.table_num').delegate('.tn_list a', 'click', function(){
		if ($('.TableChoice_box').css("display") == "none") {
			$('.TableChoice_box').show();
			$('body').addClass('fix');
		}else{
			$('.TableChoice_box').hide();
			$('body').removeClass('fix');
		}
	})
	$('.TableChoice_back').click(function(){
		$('.TableChoice_box').hide();
	})

	// 桌位选择展开层单选，点击确认后将选中内容放入主页面
	$('.table_box').delegate('ul li', 'click', function(){
		var x = $(this);
		$('.table_list ul li').removeClass('tl_bc');
		x.addClass('tl_bc');
	})
	$('.table_sure').click(function(){
		var t = $('.table_list ul li.tl_bc'), txt = t.text(), id = t.attr('data-id');
		var o = null;
		$('.tn_list li').each(function(){
			var a = $(this);
			if(a.text() == txt){
				o = a;
				return false;
			}
		})
		o = o == null ? $('.tn_list li:last-child') : o;
		o.text(txt).attr('data-id', id).addClass('tn_bc').siblings('li').removeClass('tn_bc');

		$('.TableChoice_box').hide();
	})

	// 提交
	$("#submit").click(function(){
		var t = $(this);
		if(t.hasClass('disabled')) return;

		//验证登录
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			location.href = masterDomain + '/login.html';
			return false;
		}

		var name = $.trim($("#name").val()),
			contact = $.trim($("#contact").val()),
			sex = $(".sex_box li.check").index(),
			table = $(".tn_list li.tn_bc").attr("data-id"),
			baofang = $("#baofang").is(":checked") ? 1 : 0,
			baofang_only = $(".accept_box i").hasClass("check") ? 0 : 1,
			note = $.trim($("#note").val());

		if(baofang){
			table = '';
		}

		if(name == ""){
			alert(langData['siteConfig'][20][268]);
			return false;
		}
		if(contact == ""){
			alert(langData['siteConfig'][20][459]);
			return false;
		}

		$.ajax({
			url: '/include/ajax.php?service=business&action=dingzuoDeal',
			data: {
				store   	 : shopid,
				time    	 : date,
				baofang 	 : baofang,
				baofang_only : baofang_only,
				people  	 : people,
				table   	 : table,
				name    	 : name,
				sex     	 : sex,
				contact 	 : contact,
				note    	 : note
			},
			type: 'post',
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
					location.href = retUrl.replace("%ordernum%", data.info);
				}else{
					alert(data.info);
					t.removeClass("disabled");
				}
			},
			error: function(){
				alert(langData['siteConfig'][20][183]);
				t.removeClass("disabled");
			}
		})

	})

	// 处理数据
	function dealData(){

		var data = getData;
		if(data && data.state == 100){
			var stage = data.info.stage, tableList = data.info.tableList, tableCount = data.info.tableCount;
			if(date.indexOf(":") < 0){
				for(var i = 0; i < stage.length; i++){
					if(stage[i].time.length > 0){
						stageId = stage[i].id;
						date = stage[i].time[0].date;
						$(".choice_box .time span").html(date+'<i></i>');
						break;
					}
				}
			}else{
				for(var i = 0; i < stage.length; i++){
					if(stage[i].time.length > 0){
						for(var t = 0; t < stage[i].time.length; t++){
							if(date == stage[i].time[t].date){
								stageId = stage[i].id;
								break;
							}
						}
					}
				}
			}

			var html = [], listArr = [];
			for(var i = 0; i < tableList.length; i++){
				var typename = tableList[i].typename,
					min = tableList[i].min,
					max = tableList[i].max,
					lower = tableList[i].lower;


				listArr.push('<div class="table_list">');
				listArr.push('<p class="tit">'+typename+'</p>');
				listArr.push('<ul class="fn-clear">');

				// 人数限制
				if(people >= min && people <= max){
					for(var m = 0; m < lower.length; m++){
						html.push('<li data-id="'+lower[m].id+'" class="table_'+lower[m].id+' fn-hide">'+lower[m].typename+'</li>');

						listArr.push('<li data-id="'+lower[m].id+'" class="table_'+lower[m].id+' fn-hidea">'+lower[m].typename+'</li>');
					}
				}

				listArr.push('</ul>');
				listArr.push('</div>');
				listArr.push('</div>');
			}


			$(".table_num").show().children(".tn_list").html('<em>'+langData['siteConfig'][22][37]+'</em><ul>' + html.join("") + '</ul><a href="javascript:;"></a>');
			$(".table_box").html(listArr.join(""));

			for(var n = 0; n < stage.length; n++){
				var hasReserve = stage[n].hasReserve;
				if(hasReserve.length > 0){
					for(var o = 0; o < hasReserve.length; o++){
						if(hasReserve[o].stageid == stageId){
							$(".table_"+hasReserve[o].tableid).remove();
						}
					}
				}
			}

			count = $(".table_num li").length;

			$(".table_num li").removeClass("fn-hide").slice(3).remove();
			$(".table_num li").eq(0).addClass("tn_bc");

			$(".table_num .last i").html(langData['siteConfig'][22][94].replace('1', count));

			$(".table_list").each(function(i){
				var t = $(this), li = t.find("ul li");
				if(li.length == 0){
					t.remove();
				}else{
					li.eq(0).addClass("tl_bc");
				}
			})

			changeShow();
		}else{
			alert(langData['siteConfig'][20][183]);
		}

	}

	function getTable(){

		if(isBaofang) return;

		$.ajax({
			url: '/include/ajax.php?service=business&action=dingzuoGetTable&store='+shopid+'&people='+people+'&date='+date,
			type: 'post',
			dataType: 'json',
			success: function(data){
				getData = data;
				dealData();
			},
			error: function(){
				getData = {"state":200, "info":langData['siteConfig'][20][183]};
				dealData();
			}
		})
	}

	if(state){
		getTable();
	}else{
		alert(langData['siteConfig'][22][95]);
	}

})
