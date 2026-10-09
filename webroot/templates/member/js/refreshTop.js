var refreshTopFunc, refreshTopConfig, refreshSmart, refreshTopModule, refreshTopAction, refreshTopTimer, topNormal, topPlan, refreshTopID = refreshTopAmount = refreshFreeTimes = refreshNormalPrice = memberFreeCount = surplusFreeRefresh = 0, check_zjuser = false, zjuser_meal = {};
var topPlanData = [];
var houseTop = 6;
$(function(){

	refreshTopFunc = {

		//初始加载
		// type: refresh、top
		// mod: 系统模块
		// act: 类目
		// aid: 信息ID
		// btn: 触发元素  非必传
		// obj:传过来的配置  有配置 根据type使用
		init: function(type, mod, act, aid, btn, title,obj = ''){

			if(!type || !mod || !act || !aid) return false;
			btn ? btn.addClass('load') : null;  //给触发元素增加load样式

			var userid = $.cookie(cookiePre+"login_user");
			if(userid == null || userid == ""){
				location.reload();
				return false;
			}

			//初始加载配置信息，包括会员相关信息
			$.ajax({
				type: "POST",
				url: masterDomain + "/include/ajax.php",
				dataType: "jsonp",
				data: {
					'service': 'siteConfig',
					'action': 'refreshTopConfig',
					'module': mod,
					'act': act
				},
				success: function(data) {
					if(data && data.state == 100){
						refreshTopConfig = data.info;
						refreshTopFunc.show(type, title, obj);
					}else{
						alert(data.info);
					}
					btn ? btn.removeClass('load') : null;
				},
				error: function(){
					alert(langData['siteConfig'][20][227]);//'网络错误，加载失败！'
					btn ? btn.removeClass('load') : null;
				}
			});

			refreshTopModule = mod;
			refreshTopAction = act;
			refreshTopID = aid;
			$('#refreshTopForm #type').val(type);
			$('#refreshTopForm #aid').val(aid);
			$('#refreshTopForm #useBalance').val(userTotalBalance > 0 ? 1 : 0);

			//关闭窗口
			$('.refreshTopPopup .rtClose').bind('click', function(){
				refreshTopFunc.close('refresh');
			});
		},

		update_zjuser_btn: function(type, need){
			var rtConfig = refreshTopConfig.config;
			var btn = $('#zjuser_refresh'), href = btn.data('url');

			if(rtConfig.zjuserMeal.meal_check.state == 200){
				$('.zjuser_info').html(rtConfig.zjuserMeal.meal_check.info);
				btn.attr('href', href).text(langData['siteConfig'][30][67]);//马上购买套餐
			}else{

				zjuser_meal = rtConfig.zjuserMeal.meal;

				var has = 0, count, name;
				if(type == 'refresh'){
					count = rtConfig.zjuserMeal.meal.refresh;
					name = langData['siteConfig'][16][70];//刷新
					has = zjuser_meal.refresh;
				}else if(type == 'topping'){
					count = rtConfig.zjuserMeal.meal.settop;
					name = langData['siteConfig'][19][762];//置顶
					has = zjuser_meal.settop;
				}

				var info = langData['siteConfig'][30][68]+name+langData['siteConfig'][30][69]+'<font color="#ff6600">'+count+'</font>'+langData['siteConfig'][13][26]+'<br>'+langData['siteConfig'][30][70]+'<font style="color:#f60;">'+need+'</font>'+langData['siteConfig'][13][26];
				//您是经纪人，已购买套餐<br>剩余---次数共-----次---当前操作需要消耗----次

				if(type == 'topping'){
					info = info.replace(/次/g, langData['siteConfig'][13][6]);//天
				}
				if(has >= need){
					btn.attr('href', 'javascript:;').text(name);
				}else{
					btn.attr('href', href).text(langData['siteConfig'][30][71]);//升级套餐
					info += langData['siteConfig'][30][72];
				}
				$('.zjuser_info').html(info);
			}
		},

		//显示业务窗口，以及填充初始数据
		// obj 是函数传过来的配置 刷新就是刷新配置  置顶就是置顶配置  目前只有分类信息才有  20250226新增
		show: function(type, title,obj = ''){

			$('.rtRefresh, .rtTopping, .rtBody .paytypeObj, .rtBody .paySubmit').hide();
			var rtConfig = refreshTopConfig.config;

			// 房产模块、经纪人、后台配置了经纪人套餐
			if(refreshTopModule == 'house' && rtConfig.zjuserMeal.iszjuser == "1" && rtConfig.zjuserMeal.meal_check.state != 101){
				check_zjuser = true;
				$('.refreshTopPopup').addClass('check_zjuser');

				if(type == "refresh"){
					$('.freeRefresh, .normalRefresh, .rtPayObj').addClass('hide_impt');
					this.update_zjuser_btn(type, 1);
				}else{
					houseTop = 0;
					$('.rtPayObj').addClass('hide_impt');
					$("#topPlanEndObj").val($("#topPlanBeganObj").val())
					this.update_zjuser_btn(type, 1);
				}
			}else{
				$('.zjuser_tj, .zjuser_info').remove();
			}

			//刷新业务
			if(type == 'refresh'){

				$('.rtRefresh').show();
				$('.rtHeader h5').html(langData['siteConfig'][16][70]);//刷新
				var smart = $('#type').val();
				//初始化默认选中普通刷新
				$('.rtTab li').removeClass('curr');
				$('.rtTab li:eq(1)').addClass('curr');
				$('.rtCon .rtItem, .rtPayObj').hide();
				$('.rtCon .rtItem:eq(1)').show();

				refreshFreeTimes = obj && obj.refreshFreeTimes || rtConfig.refreshFreeTimes;  //可免费刷新次数
				refreshNormalPrice = obj ? (obj.refreshNormalPrice || 0) : rtConfig.refreshNormalPrice;  //普通刷新价格
				refreshSmart = obj ? (obj.refreshSmart ) : rtConfig.refreshSmart;  //智能刷新配置
				memberFreeCount = obj && obj.memberFreeCount || refreshTopConfig.memberFreeCount;
				surplusFreeRefresh = parseInt(refreshFreeTimes - memberFreeCount);

				if(refreshSmart && refreshSmart.length > 0){
					var unit = refreshSmart[refreshSmart.length - 1].unit;
					$('.normalTips .smartUnit').html(unit);
				}

				//如果还有免费次数
				if(surplusFreeRefresh > 0){
					$('.freeRefresh').show();
					$('.normalRefresh').hide();
					$('.refreshFreeSurplus').html(surplusFreeRefresh);
					refreshTopAmount = 0;
				}else{
					$('.freeRefresh').hide();
					$('.normalRefresh').show();

					refreshTopAmount = refreshNormalPrice;
					$('#refreshTopForm #amount').val(refreshTopAmount);

					$('.rtPayObj').show();
				}

				//拼接智能刷新方案
				console.log(refreshSmart);
				console.log(rtConfig.refreshSmart);
				if(refreshSmart.length > 0){
					var smartHtml = [];
					for (var i = 0; i < refreshSmart.length; i++) {
						smartHtml.push('<li class="fn-clear'+(i == 0 ? ' checked' : '')+'">');
			          smartHtml.push('<i class="radio"><s></s></i>');
			          smartHtml.push('<span class="sm-tit">'+langData['siteConfig'][16][70]+refreshSmart[i].times+langData['siteConfig'][13][26]+'<em>（'+refreshSmart[i].day+langData['siteConfig'][13][6]+'）</em></span>');
			           //刷新---次 ----天
			          smartHtml.push('<span class="sm-pri"><strong>'+refreshSmart[i].price+'</strong>'+echoCurrency('short')+'（<em>'+(refreshSmart[i].discount || '')+'</em>'+langData['siteConfig'][30][73]+(refreshSmart[i].unit || (refreshSmart[i].price / (refreshSmart[i].times || 1)).toFixed(2))+echoCurrency('short')+'/'+langData['siteConfig'][13][26]+'）</span>');
			          //仅---元/次
								if(refreshSmart[i].offer > 0){
				          smartHtml.push('<span class="sm-off">'+langData['siteConfig'][30][74]+'<strong>'+refreshSmart[i].offer+'</strong>'+echoCurrency('short')+'</span>');  //省
								}
			          smartHtml.push('</li>');

					}
					0
					$('.rtSmart').html(smartHtml.join(''));

				//没有智能刷新方案
				}else{
					$('.rtRefresh .rtTab li:eq(0)').hide();
				}

				if(check_zjuser){

				}

			//置顶业务
			}else if(type == 'topping'){

				$('.rtTopping').show();
				$('.rtHeader h5').html(langData['siteConfig'][19][762]);  //置顶

				$('.rtTopping .topTit').html(title);

				//初始化默认选中普通刷新
				$('.topType label').removeClass('checked');
				$('.topType label:eq(0)').addClass('checked');
				$('.rtTopping .topPlan').hide();
				$('.rtTopping .topNormal').show();

				topNormal = obj ? obj.topNormal : rtConfig.topNormal;  //普通置顶
				topPlan = obj ? obj.topPlan : rtConfig.topPlan;  //计划置顶
                if(!topPlan) {
                    alert(rtConfig);
                    return false;
				}
				//将周日的数据移到第一位
				topPlan.unshift(1);
				topPlan[0] = topPlan[7];
				topPlan.pop();

				//拼接普通置顶时长
				var	topNormalHtml = [];
				if(topNormal.length > 0){
					for (var i = 0; i < topNormal.length; i++) {
						if(i == 0){
							refreshTopAmount = parseFloat(topNormal[i].price);
							$('#refreshTopForm #amount').val(refreshTopAmount);
						}
						topNormalHtml.push('<li'+(i == 0 ? ' class="checked"' : '')+'>'+(topNormal[i].offer > 0 ? '<sup>'+(topNormal[i].discount || '')+'</sup>' : '')+'<p>'+topNormal[i].day+langData['siteConfig'][13][6]+'</p><strong><small>&yen;</small>'+topNormal[i].price+'</strong><em></em><img src="'+masterDomain+'/templates/member/images/refreshTop_checked.png"></li>');//天
					}
				}
				$('.rtTopping .topDays').html(topNormalHtml.join(''));
				$('#refreshTopForm #config').val(0);

				//显示支付
				$('.rtPayObj').show();

				// 房产经纪人操作
				if(check_zjuser){

					$('.topType label:eq(1)').click();
					$('.topType label:eq(1)').hide();
					$('.rtTopping .topPlan').show().children('dl:eq(1)').hide();
					$('.topType label:eq(0)').addClass('checked').show();
					$('.rtTopping .topNormal').hide();
					$('#refreshTopForm #type').val('toppingPlan');
				}

			}

			//余额选项
			if(userTotalBalance){
				var rtUseBalance = userTotalBalance > refreshTopAmount ? refreshTopAmount.toFixed(2) : userTotalBalance.toFixed(2);
				$('.rtBody .reduce-yue').text(rtUseBalance);
	      $('.rtBody .pay-total').text((refreshTopAmount - rtUseBalance).toFixed(2));
			}

			if(check_zjuser){
					$('.normalRefresh, .rtPayObj').hide();
					$('.freeRefresh').show();
			}else{
				refreshTopFunc.calculationPayPrice();
			}

			//显示浮动窗口
			$('.refreshTopPopup, .refreshTopMask').show();
			resetRefreshPopupPos();

		},

		//关闭
		close: function(){
			if(refreshTopTimer != null){
				clearInterval(refreshTopTimer);
			}
			$('.refreshTopPopup, .refreshTopMask').hide();
		},

		//价格业务，判断是否显示支付
		calculationPayPrice: function(){
			if(!check_zjuser){
				if(refreshTopAmount){
					var rtUseBalance = userTotalBalance > refreshTopAmount ? refreshTopAmount.toFixed(2) : userTotalBalance.toFixed(2);
					var rtTotalPay = refreshTopAmount.toFixed(2);
					$('.rtPayObj, .rtBody .paySubmit').show();

					if($('.rtBody .yue-btn').hasClass('active')){
						$('#refreshTopForm #useBalance').val(1);
                        rtTotalPay = (refreshTopAmount - rtUseBalance).toFixed(2);
                        if(rtTotalPay <= 0){
                            $('.rtBody .paytypeObj').hide();
                                    if(refreshTopTimer != null){
                            clearInterval(refreshTopTimer);
                            }
                        }else{
                            $('.rtBody .paytypeObj').show();
                            //refreshTopFunc.getQrCode();
                        }
                        $('.rtBody .reduce-yue').text(rtUseBalance);
                    }else{
                        $('#refreshTopForm #useBalance').val(0);
                        $('.rtBody .reduce-yue').text('0.00');
                        $('.rtBody .paytypeObj').show();
                        //refreshTopFunc.getQrCode();
                    }
					$('.rtBody .pay-total').text(rtTotalPay);
				}else{
					if(refreshTopTimer != null){
						clearInterval(refreshTopTimer);
					}
					$('.rtPayObj, .rtBody .paySubmit').show();
				}
			}
			resetRefreshPopupPos();
		},

		//计算计划置顶费用
		toppingPlan: function(){
			var beganDate = $('#topPlanBeganObj').val(),
					endDate = $('#topPlanEndObj').val();
			var diffDays = parseInt(getRtDays(beganDate, endDate)) + 1;

			//统计费用明细
			if(topPlan){

				refreshTopAmount = 0;

				//获取已选时段
				var rtPlanSelected = [];
				$('.rtPlanList td').each(function(){
					var t = $(this), week = t.data('week'), type = t.data('type');
					if(type && t.hasClass('curr')){
						rtPlanSelected[week] = type;
					}
				});

				//根据时长计算每天的费用
				for (var i = 0; i < diffDays; i++) {
					var date = getRtDate(beganDate, i);
					var dateFormat = new Date(Date.parse(date.replace(/\-/g,"/")));
					var week = dateFormat.getDay();

					if(rtPlanSelected[week]){
						refreshTopAmount += topPlan[week][rtPlanSelected[week]];
					}
				}

				//将配置信息写入表单
				$('#refreshTopForm #amount').val(refreshTopAmount);
				$('#refreshTopForm #config').val(beganDate+'|'+endDate+'|'+rtPlanSelected.join(','));

				refreshTopFunc.calculationPayPrice();

			}

		},

		//生成付款二维码
		getQrCode: function(){
			$('.rtBody .payTab li:eq(0)').hasClass('curr') ? $('.rtBody .paySubmit').hide() : null;
			var data = $('#refreshTopForm').serialize(), action = $('#refreshTopForm').attr('action');

			var userid = $.cookie(cookiePre+"login_user");
			if(userid == null || userid == ""){
				location.reload();
				return false;
			}

		  $.ajax({
		    type: 'POST',
		    url: action,
		    data: data  + '&qr=1&final=1',
		    dataType: 'jsonp',
		    success: function(str){
		      if(str.state == 100){
		        var data = [], info = str.info;
		        for(var k in info) {
		          data.push(k+'='+info[k]);
		        }
		        var src = masterDomain + '/include/qrPay.php?' + data.join('&');
		        $('.rtBody .qrimg').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));

		        //验证是否支付成功，如果成功跳转到指定页面
		        if(refreshTopTimer != null){
		          clearInterval(refreshTopTimer);
		        }

		        refreshTopTimer = setInterval(function(){

		          $.ajax({
		            type: 'POST',
		            async: false,
		            url: '/include/ajax.php?service=member&action=tradePayResult&type=3&order=' + info['ordernum'],
		            dataType: 'json',
		            success: function(str){
		              if(str.state == 100 && str.info != ""){
		                //如果已经支付成功，则跳转到会员中心页面
		                clearInterval(refreshTopTimer);
										refreshTopFunc.close();
		                getList(1);
		              }else if(str.state == 101 && str.info == langData['siteConfig'][21][162]){  //订单不存在
		                refreshTopFunc.getQrCode();
		              }
		            }
		          });

		        }, 2000);

		      }
		    }
		  });

		}
	}



	//切换刷新类型
	$('.rtTab li').bind('click', function(){
		var t = $(this), index = t.index();
		if(!t.hasClass('curr')){
			t.addClass('curr').siblings('li').removeClass('curr');
			$('.rtCon .rtItem').hide();
			$('.rtCon .rtItem:eq('+index+')').show();

			//计算要支付费用
			if(index){
				//免费
				if(surplusFreeRefresh > 0){
					refreshTopAmount = 0;
				//普通收费
				}else{
					refreshTopAmount = refreshNormalPrice;
				}
				$('#refreshTopForm #type').val('refresh');
				$("#amount").val(refreshTopAmount)
			//智能
			}else{
				var rtSmartIndex = $('.rtSmart .checked').index();
				refreshTopAmount = parseFloat(refreshSmart[rtSmartIndex].price);
				$('#refreshTopForm #type').val('smartRefresh');
				$('#refreshTopForm #config').val(rtSmartIndex);
				$("#amount").val(refreshTopAmount)
			}
			refreshTopFunc.calculationPayPrice();

			// 经纪人需要验证剩余刷新次数
			if(check_zjuser){
				if(index == 0){
					$(".rtSmart li.checked").click();
				}else{
					refreshTopFunc.update_zjuser_btn('refresh', 1);
				}
			}
		}
	});

	//选择智能刷新方案
	$('.rtSmart').delegate('li', 'click', function(){
		var t = $(this), index = t.index(), times = parseInt(refreshSmart[index].times);
		t.addClass('checked').siblings('li').removeClass('checked');

		// 房产经纪人
		if(check_zjuser){
			// 超过套餐剩余刷新次数
			refreshTopFunc.update_zjuser_btn('refresh', times);
			$('#refreshTopForm #config').val(index);
		}else{
			refreshTopAmount = parseFloat(refreshSmart[index].price);
			$('#refreshTopForm #amount').val(refreshTopAmount);
			$('#refreshTopForm #config').val(index);
			refreshTopFunc.calculationPayPrice();
		}
	});

	//免费刷新
	$('.rtBody .refreshNow').bind('click', function(){
		var t = $(this);
		if(surplusFreeRefresh > 0){
			t.html(langData['siteConfig'][30][75]+'...').attr('disabled', true);//刷新中
			$.ajax({
				type: "POST",
				url: masterDomain + "/include/ajax.php",
				dataType: "jsonp",
				data: {
					'service': 'siteConfig',
					'action': 'freeRefresh',
					'module': refreshTopModule,
					'act': refreshTopAction,
					'aid': refreshTopID
				},
				success: function(data) {
					if(data && data.state == 100){
						t.html(langData['siteConfig'][30][76]).attr('disabled', false); //免费刷新
						$('.rtBody .freeRefresh .ny').hide();
						$('.rtBody .freeRefresh .sc').show();
						resetRefreshPopupPos();
						// t.html('刷新成功');
						// setTimeout(function(){
						// 	refreshTopFunc.close();
						// 	getList(1);
						// }, 1000);
					}else{
						alert(data.info);
						if(data.info == langData['siteConfig'][30][77]){//您的免费刷新次数已用完，不再享有免费刷新
							$('.freeRefresh').hide();
							$('.normalRefresh').show();
							refreshTopAmount = refreshNormalPrice;
							$('#refreshTopForm #amount').val(refreshTopAmount);
							$('.rtPayObj').show();
							refreshTopFunc.calculationPayPrice();
						}
						t.html(langData['siteConfig'][30][76]).attr('disabled', false);//免费刷新
					}
				},
				error: function(){
					alert(langData['siteConfig'][30][78]);//网络错误，刷新失败！
					t.html(langData['siteConfig'][30][76]).attr('disabled', false);//免费刷新
				}
			});
		}else{
			alert(langData['siteConfig'][30][77]); //您的免费刷新次数已用完，不再享有免费刷新
			$('.freeRefresh').hide();
			$('.normalRefresh').show();
			refreshTopAmount = refreshNormalPrice;
			$('#refreshTopForm #amount').val(refreshTopAmount);
			$('.rtPayObj').show();
			refreshTopFunc.calculationPayPrice();
		}
	});

	//刷新成功
	$('.rtBody .refreshConfirm').bind('click', function(){
		refreshTopFunc.close();
		$('.rtBody .freeRefresh .ny').show();
		$('.rtBody .freeRefresh .sc').hide();
		getList(1);
	});


	//置顶方式切换
	$('.rtTopping .topType').delegate('label', 'click', function(){
		var t = $(this), index = t.index();
		if(!t.hasClass('checked')){
			t.addClass('checked').siblings('label').removeClass('checked');

			if(index == 0){
				$('.rtTopping .topPlan').hide();
				$('.rtTopping .topNormal').show();
				$('#refreshTopForm #type').val('topping');
				var rtTopNormalIndex = $('.topNormal .topDays .checked').index();
				refreshTopAmount = parseFloat(topNormal[rtTopNormalIndex].price);
				$('#refreshTopForm #amount').val(refreshTopAmount);
				$('#refreshTopForm #config').val(rtTopNormalIndex);
				refreshTopFunc.calculationPayPrice();
			}else{
				$('.rtTopping .topPlan').show();
				$('.rtTopping .topNormal').hide();
				$('#refreshTopForm #type').val('toppingPlan');
				refreshTopFunc.toppingPlan();
			}

		}
	});

	//选择置顶时长
	$('.rtTopping .topDays').delegate('li', 'click', function(){
		var t = $(this), index = t.index();
		if(!t.hasClass('checked')){
			t.addClass('checked').siblings('li').removeClass('checked');
			var rtTopNormalIndex = $('.topNormal .topDays .checked').index();
			refreshTopAmount = parseFloat(topNormal[rtTopNormalIndex].price);
			$('#refreshTopForm #amount').val(refreshTopAmount);
			$('#refreshTopForm #config').val(rtTopNormalIndex);
			refreshTopFunc.calculationPayPrice();
		}
	});

	//选择计划置顶日期
	$("#topPlanBegan").click(function(){
		WdatePicker({
			el: 'topPlanBeganObj',
			doubleCalendar: true,
			isShowClear: false,
			isShowOK: false,
			isShowToday: false,
			minDate: '%y-%M-{%d}',
			onpicked: function(dp){
				var beganDate = dp.cal.getNewDateStr();
				var endDate = $('#topPlanEndObj').val();

				var diffDays = parseInt(getRtDays(beganDate, endDate));
				if(diffDays < houseTop){
					$('#topPlanEndObj').val(getRtDate(beganDate, houseTop));
				}
				refreshTopFunc.toppingPlan();

				if(check_zjuser){
					refreshTopFunc.update_zjuser_btn('topping', diffDays + 1);
				}
			}
		});
	});

	//结束时间最少是一周的时间
	$("#topPlanEnd").click(function(){
		var endDate = $("#topPlanEndObj").val(); //'#F{$dp.$D(\'topPlanBeganObj\',{d:6});}'
		WdatePicker({
			el: 'topPlanEndObj',
			doubleCalendar: true,
			isShowClear: false,
			isShowOK: false,
			isShowToday: false,
			minDate: endDate,
			onpicked: function(dp){
				var beganDate = $('#topPlanBeganObj').val();
				var endDate = dp.cal.getNewDateStr();

				if(!checkRtDate(beganDate)){
					beganDate = getRtDate(0, 1);
					$('#topPlanBeganObj').val(beganDate);
				}
				var diffDays = getRtDays(beganDate, endDate);
				if(diffDays < houseTop){
					$('#topPlanEndObj').val(getRtDate(beganDate, houseTop));
				}
				refreshTopFunc.toppingPlan();

				if(check_zjuser){
					refreshTopFunc.update_zjuser_btn('topping', diffDays + 1);
				}
			}
		});
	});

	//选择置顶时段
	$('.rtTopping .rtPlanList').delegate('em', 'click', function(){
		var t = $(this), td = t.closest('td'), tr = t.closest('tr'), index = td.index(), trIndex = tr.index();
		if(!td.hasClass('curr')){
			td.addClass('curr');
			tr.siblings('tr').each(function(){
				$(this).find('td:eq('+index+')').removeClass('curr');
			});
			refreshTopFunc.toppingPlan();
		}
	});

  //选择余额
	$('.rtBody .yue-btn').click(function(){
    var t = $(this);
    t.hasClass('active') ? t.removeClass('active') : t.addClass('active');
    refreshTopFunc.calculationPayPrice();
  })

  //支付方式切换
  $('.rtBody .payTab li').bind('click', function(){
    var t = $(this), index = t.index();
    t.addClass('curr').siblings('li').removeClass('curr');
    if(index == 0){
      $('.rtBody .qrpay').show();
      $('.rtBody .payway, .rtBody .paySubmit').hide();
    }else{
      $('.rtBody .qrpay').hide();
      $('.rtBody .payway, .rtBody .paySubmit').show();
    }
		resetRefreshPopupPos();
  })

	//支付方式
	$('.rtBody .payway li').click(function(){
		var t = $(this);
		t.addClass('active').siblings('li').removeClass('active');
		$('#refreshTopForm #paytype').val(t.data('id'));
	})

	//支付
	$('.rtBody .paySubmit').bind('click', function(){
		var t = $(this);
		if(t.hasClass('disabled')) return;
		if(t.attr('href').indexOf('javascript') == 0){
			// $('#refreshTopForm').submit();
			var type 	= $("#refreshTopForm input[name='type']").val();
			var module  = $("#refreshTopForm input[name='module']").val();
			var act  	= $("#refreshTopForm input[name='act']").val();
			var aid  	= $("#refreshTopForm input[name='aid']").val();
			var amount  = $("#refreshTopForm input[name='amount']").val();
			var config  = $("#refreshTopForm input[name='config']").val();
			var tourl   = $("#refreshTopForm input[name='tourl']").val();
			$.ajax({
				type: 'POST',
				url: '/include/ajax.php?service=siteConfig&action=refreshTop&type='+type+'&module='+module+'&act='+act+'&aid='+aid+'&amount='+amount+'&config='+config+'&tourl='+tourl,
				dataType: 'json',
				success: function(str){

					info = str.info;

                    if(typeof(info) == 'string' && (info.indexOf('https://') != -1 || info.indexOf('http://') != -1)){
                        atpage = 1;
                        getList();
                        $('.rtClose').click();
                        return false;
                    }
                    
                    if (typeof (str.info) == 'object') {
							
						cutDown = setInterval(function () {
							$(".payCutDown").html(payCutDown(info.timeout));
						},1000)

						var datainfo = [];
						for(var k in info) {
							datainfo.push(k+'='+info[k]);
						}
						$("#amout").text(info.order_amount);
						$('.payMask').show();
						$('.payPop').show();

							if (usermoney * 1 < info.order_amount * 1) {

								$("#moneyinfo").text('余额不足，');
								$("#moneyinfo").closest('.pay_item').addClass('disabled_pay')
							}else{
								$("#moneyinfo").text('可用');
								$("#moneyinfo").closest('.pay_item').removeClass('disabled_pay')
							}
							if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
								$("#bonusinfo").text('额度不足，可用');
								$("#bonusinfo").closest('.pay_item').addClass('disabled_pay')
							}else if( bonus * 1 < info.order_amount * 1){
								$("#bonusinfo").text('余额不足，可用');
								$("#bonusinfo").closest('.pay_item').addClass('disabled_pay')
							}else{
								$("#bonusinfo").text('可用');
								$("#bonusinfo").closest('.pay_item').removeClass('disabled_pay')
							}

						ordernum     = info.ordernum;
						order_amount = info.order_amount;
						$("#ordertype").val('refreshTop');
						$("#service").val('siteConfig');
						var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
						$('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));

					}else {
                        $('.rtClose').click();
                        alert(str.info);
                    }
				}
			});
		}
	});
	// $('#refreshTopForm').submit(function(e){
	// 	if(check_zjuser){
	// 		e.preventDefault();
	// 		$('.rtBody .paySubmit').addClass('disabled');
	//
	// 		$.ajax({
	// 			url: masterDomain + '/include/ajax.php',
	// 			type : 'post',
	// 			data: $(this).serialize(),
	// 			dataType: 'jsonp',
	// 			success: function(data){
	// 				$('.rtBody .paySubmit').removeClass('disabled');
	// 				if(data && data.state == 100){
	// 					$('.zjuser_info').html(data.info);
	// 					setTimeout(function(){
	// 						location.reload();
	// 					}, 1000)
	// 				}else{
	// 					$.dialog.alert(data.info);
	// 				}
	// 			},
	// 			error: function(){
	// 				$.dialog.alert(langData['siteConfig'][6][203]);//网络错误，请重试！
	// 				$('.rtBody .paySubmit').removeClass('disabled');
	// 			}
	// 		})
	// 	}
	// })

	//查看计划置顶详情
    $('body').delegate('.topPlanDetail', 'click', function(){
        var t = $(this), module = t.attr('data-module'), aid = t.attr('data-id');
        topPlanCalUtil.setMonthAndDay();
        topPlanCalUtil.init(topPlanData[module][aid]);
    });

})

//倒计时
var timeComputeRefresh = function (a, b) {
    if (this.time = a, !(0 >= a)) {
        for (var c = [3600 / b, 60 / b, 1 / b], d = .1 === b ? 1 : .01 === b ? 2 : .001 === b ? 3 : 0, e = 0; d > e; e++) c.push(b * Math.pow(10, d - e));
        for (var f, g = [], e = 0; e < c.length; e++) f = Math.floor(a / c[e]),
            g.push(f),
            a -= f * c[e];
        return g
    }
}
,CountDownRefresh = function(a) {
    this.time = a,
        this.countTimer = null,
        this.run = function(a) {
            var b, c = this;
            this.countTimer = setInterval(function() {
                b = timeComputeRefresh.call(c, c.time - 1, 1);
                b || (clearInterval(c.countTimer), c.countTimer = null);
                "function" == typeof a && a(b || [0, 0, 0, 0, 0], !c.countTimer)
            }, 1000);
        }
};

function countDownRefreshSmart(){
	$('body').find('.refreshSmartTime').each(function(){
		var t = $(this), stime = t.attr('data-time');
		var begin = stime - nowTime;
		var time = begin > 0 ? begin : 0;
        var countDown = new CountDownRefresh(time);
        countDownRunRefreshSmart(countDown, 0, t, time);
	});
}

function countDownRunRefreshSmart(c, m, obj, time) {
    m && (c.time = m);
    c.run(function(times, complete) {
        var html = times[0] + ':' + times[1] + ':' + times[2];
        obj.html(html);
    });
}

// 日历加载主要代码
var topPlanCalUtil = {

    eventName:"load",
    //初始化日历
    init:function(signList){
        topPlanCalUtil.eventName="load";
        topPlanCalUtil.draw(signList);
        topPlanCalUtil.bindEnvent(signList);
    },
    draw:function(signList){
        //绑定日历
        var str = topPlanCalUtil.drawCal(topPlanCalUtil.showYear,topPlanCalUtil.showMonth,signList);
        $(".topCalendar").html(str);
        $('.topCalendar, .topCalendarBg').show();
        //绑定日历表头
        var calendarName=topPlanCalUtil.showYear+"/"+topPlanCalUtil.showMonth;
        $(".calendar_month_span").html(calendarName);
    },
    //绑定事件
    bindEnvent:function(signList){

        //绑定上个月事件
        $(".calendar_month_prev").click(function(){
            var t = $(this);
            if(t.hasClass("disabled")) return false;
            topPlanCalUtil.eventName="prev";
            topPlanCalUtil.setMonthAndDay();
            topPlanCalUtil.init(signList);
        });

        //绑定下个月事件
        $(".calendar_month_next").click(function(){
            var t = $(this);
            if(t.hasClass("disabled")) return false;
            topPlanCalUtil.eventName="next";
            topPlanCalUtil.setMonthAndDay();
            topPlanCalUtil.init(signList);
        });

        //关闭
        $(".calendar_close").click(function(){
            $('.topCalendar, .topCalendarBg').hide();
        })

    },
    //获取当前选择的年月
    setMonthAndDay:function(){
        switch(topPlanCalUtil.eventName)
        {
            case "load":
                topPlanCalUtil.showYear=currentYear;
                topPlanCalUtil.showMonth=currentMonth < 10 ? "0" + currentMonth : currentMonth;
                break;
            case "prev":
                var nowMonth=$(".calendar_month_span").html().split("/")[1];
                var newMonth = parseInt(nowMonth)-1;
                topPlanCalUtil.showMonth=newMonth < 10 ? "0" + newMonth : newMonth;
                if(topPlanCalUtil.showMonth==0)
                {
                    topPlanCalUtil.showMonth=12;
                    topPlanCalUtil.showYear-=1;
                }
                break;
            case "next":
                var nowMonth=$(".calendar_month_span").html().split("/")[1];
                var newMonth = parseInt(nowMonth)+1;
                topPlanCalUtil.showMonth=newMonth < 10 ? "0" + newMonth : newMonth;
                if(topPlanCalUtil.showMonth==13)
                {
                    topPlanCalUtil.showMonth="01";
                    topPlanCalUtil.showYear+=1;
                }
                break;
        }
    },
    getDaysInmonth : function(iMonth, iYear){
        var dPrevDate = new Date(iYear, iMonth, 0);
        return dPrevDate.getDate();
    },
    bulidCal : function(iYear, iMonth) {
        var aMonth = new Array();
        aMonth[0] = new Array(7);
        aMonth[1] = new Array(7);
        aMonth[2] = new Array(7);
        aMonth[3] = new Array(7);
        aMonth[4] = new Array(7);
        aMonth[5] = new Array(7);
        aMonth[6] = new Array(7);
        var dCalDate = new Date(iYear, iMonth - 1, 1);
        var iDayOfFirst = dCalDate.getDay();
        var iDaysInMonth = topPlanCalUtil.getDaysInmonth(iMonth, iYear);
        var iVarDate = 1;
        var d, w;
        aMonth[0][0] = langData['siteConfig'][13][25];//日
	    aMonth[0][1] = langData['siteConfig'][30][61];//一
	    aMonth[0][2] = langData['siteConfig'][30][62];//二
	    aMonth[0][3] = langData['siteConfig'][30][63];//三
	    aMonth[0][4] = langData['siteConfig'][30][64];//四
	    aMonth[0][5] = langData['siteConfig'][30][65];//五
	    aMonth[0][6] = langData['siteConfig'][30][66];//六
        for (d = iDayOfFirst; d < 7; d++) {
            aMonth[1][d] = iVarDate;
            iVarDate++;
        }
        for (w = 2; w < 7; w++) {
            for (d = 0; d < 7; d++) {
                if (iVarDate <= iDaysInMonth) {
                    aMonth[w][d] = iVarDate;
                    iVarDate++;
                }
            }
        }
        return aMonth;
    },
    ifHasSigned : function(signList, day){
        var ret;
        if(day != undefined){
            $.each(signList,function(index,item){
                if(item.date == day) {
                    ret = {
                        'type': item.type == 'day' ? langData['siteConfig'][30][79] : langData['siteConfig'][14][11] ,//早8-晚8--全天
                        'state': item.state
                    };
                }
            });
        }
        return ret;
    },
    Retroactive : function(RetroList,day){
        var Retro = false;
        $.each(RetroList,function(index,item){
            if(item == day) {
                Retro = true;
                return false;
            }
        });
        return Retro ;
    },
    SpecialData : function(SpecialList, Year, Month, day){
        var data = [], day = day < 10 ? "0" + day : day;
        $.each(SpecialList,function(index,item){
            if (item['date'] == Year + "-" + Month + "-" + day) {
                data = {'title': item.title, 'color': item.color}
            }
        });
        return data;
    },
    TodayData : function(TrueYear, TrueMonth, TrueDay, Year, Month, day){
        var Retro = false;
        if(TrueYear == Year && TrueMonth == Month && TrueDay == day) {
            Retro = true;
        }
        return Retro;
    },
    drawCal : function(iYear,iMonth ,signList) {
        var myMonth = topPlanCalUtil.bulidCal(iYear, iMonth);
        var htmls = new Array();
        htmls.push("<div class='sign_main' id='sign_layer'>");
        htmls.push("<div class='sign_succ_calendar_title'>");
        htmls.push("<div class='calendar_month_prev'>◀</div>");
        htmls.push("<div class='calendar_month_span'></div>");
        htmls.push("<div class='calendar_month_next'>▶</div>");
        htmls.push("<div class='calendar_close'></div>");
        htmls.push("</div>");
        htmls.push("<div class='sign' id='sign_cal'>");
        htmls.push("<table valign='top'>");
        htmls.push("<tr>");
        htmls.push("<th>" + langData['siteConfig'][14][10] + "</th>");//星期日
        htmls.push("<th>" + langData['siteConfig'][14][4] + "</th>");//星期一
        htmls.push("<th>" + langData['siteConfig'][14][5] + "</th>");//星期二
        htmls.push("<th>" + langData['siteConfig'][14][6] + "</th>");//星期三
        htmls.push("<th>" + langData['siteConfig'][14][7] + "</th>");//星期四
        htmls.push("<th>" + langData['siteConfig'][14][8] + "</th>");//星期五
        htmls.push("<th>" + langData['siteConfig'][14][9] + "</th>");//星期六
        htmls.push("</tr>");
        var d, w;

        for (w = 1; w < 7; w++) {
            htmls.push("<tr  class='WeekDay'>");
            for (d = 0; d < 7; d++) {

                // 当前日期高亮提示
                var TodayData = topPlanCalUtil.TodayData(currentYear, currentMonth, currentDay, iYear, iMonth, myMonth[w][d]);
                // 已置顶日期循环对号
                var ifHasSigned = topPlanCalUtil.ifHasSigned(signList, iYear + '-' + (iMonth < 10 ? "0" + parseInt(iMonth) : iMonth) + '-' + (myMonth[w][d] < 10 ? "0" + myMonth[w][d] : myMonth[w][d]));

                if(ifHasSigned){
                    if(TodayData) {
                        htmls.push("<td data-id='" + myMonth[w][d] + "' class='today isTop" + ifHasSigned.state + "' title='" + ifHasSigned.type + "'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + " <span>"+ifHasSigned.type+"</span></td>");
                    }else {
                        htmls.push("<td data-id='" + myMonth[w][d] + "' class='isTop" + ifHasSigned.state + "' title='" + ifHasSigned.type + "'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + " <span>"+ifHasSigned.type+"</span></td>");
                    }
                }else{
                    if(TodayData){
                        htmls.push("<td data-id='"+myMonth[w][d]+"' class='today'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + " <span>" + langData['siteConfig'][32][43] + "</span></td>");//不置顶
                    }else{
                        htmls.push("<td class='empty'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] + "<span>" + langData['siteConfig'][32][43] + "</span>" : "") + " </td>");//不置顶
                    }
                }
            }
            htmls.push("</tr>");
        }
        htmls.push("</table>");
        htmls.push("</div>");
        htmls.push("</div>");
        return htmls.join('');
    }
};


//重置浮动层位置
function resetRefreshPopupPos(){
  var top = $('.refreshTopPopup').height() / 2;
  $('.refreshTopPopup').css({'margin-top': -top + 'px'});
}

//获得两个日期之间相差的天数
function getRtDays(date1 , date2){
	var date1Str = date1.split("-"); //将日期字符串分隔为数组,数组元素分别为年.月.日
	//根据年 . 月 . 日的值创建Date对象
	var date1Obj = new Date(date1Str[0],(date1Str[1]-1),date1Str[2]);
	var date2Str = date2.split("-");
	var date2Obj = new Date(date2Str[0],(date2Str[1]-1),date2Str[2]);
	var t1 = date1Obj.getTime();
	var t2 = date2Obj.getTime();
	var dateTime = 1000*60*60*24; //每一天的毫秒数
	var minusDays = Math.floor(((t2-t1)/dateTime));//计算出两个日期的天数差
	var days = minusDays;//取绝对值
	return days;
}

//使用正则表达式去判断日期格式是否正确
function checkRtDate(date){
	var regExp = /^([1][7-9][0-9][0-9]|[2][0][0-9][0-9])(\-)([0][1-9]|[1][0-2])(\-)([0-2][1-9]|[3][0-1])$/g;
	if(regExp.test(date)){
		return true;
	}else{
		return false;
	}
}

//获取客户端当前时间
function getRtDate(date, day){
	var time = date ? new Date(date) : new Date();//获取当前时间
	if(day){
		time.setDate(time.getDate()+day);
	}
	var m = time.getMonth() + 1;
	var d = time.getDate();
	var t = time.getFullYear() + "-" + (m < 10 ? '0' + m : m) + "-" + (d < 10 ? '0' + d : d);
	return t;
}
