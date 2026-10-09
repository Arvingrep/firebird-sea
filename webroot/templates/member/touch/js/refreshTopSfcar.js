var refreshTopFunc, refreshTopConfig, refreshSmart, refreshTopModule, refreshTopAction, refreshTopTimer, topNormal, topPlan, refreshTopID = refreshTopAmount = refreshFreeTimes = refreshNormalPrice = memberFreeCount = surplusFreeRefresh = refreshTopPayAmount = 0, check_zjuser = false, zjuser_meal = {};
var topPlanData = [];

$(function(){

  var refreshTopPopup = $('.refreshTopPopup');

  //验证是否在客户端访问
  setTimeout(function(){
    if(device.indexOf('huoniao') > -1){
      $("#refreshTopForm").append('<input type="hidden" name="app" value="1" />');
    }else{
      if(navigator.userAgent.toLowerCase().match(/micromessenger/)){
        $("#alipay, #globalalipay").remove();
      }
    }
    $(".refreshTopPaybox dl:eq(0)").addClass("active");
    $("#paytype").val($(".refreshTopPaybox dl:eq(0)").attr("id"));
  }, 500);

  refreshTopFunc = {

		//初始加载
		// type: refresh、top
		// mod: 系统模块
		// act: 类目
		// aid: 信息ID
		// btn: 触发元素  非必传
		init: function(type, mod, act, aid, btn, title){

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
				url: "/include/ajax.php",
				dataType: "json",
				data: {
					'service': 'siteConfig',
					'action': 'refreshTopConfig',
					'module': mod,
					'act': act
				},
				success: function(data) {
					if(data && data.state == 100){
						refreshTopConfig = data.info;
						refreshTopFunc.show(type, title);
					}else{
						alert(data.info);
					}
					btn ? btn.removeClass('load') : null;
				},
				error: function(){
					alert(langData['siteConfig'][20][227]);//网络错误，加载失败！
					btn ? btn.removeClass('load') : null;
				}
			});

			refreshTopModule = mod;
			refreshTopAction = act;
			refreshTopID = aid;
			$('#refreshTopForm #type').val(type == 'refresh' ? 'smartRefresh' : type);
			$('#refreshTopForm #act').val(act);
			$('#refreshTopForm #aid').val(aid);
			$('#refreshTopForm #useBalance').val(userTotalBalance > 0 ? 1 : 0);

			//关闭窗口
	      refreshTopPopup.find('.rtClose, .refreshTopPrev').bind('click', function(){
	        refreshTopFunc.close();
	      });
		},

	    update_zjuser_btn: function(type, need){
	      var rtConfig = refreshTopConfig.config;
	      var btn = $('#zjuser_refresh'), href = btn.data('url1');

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

	        var info = langData['siteConfig'][45][43]+'<br>'+langData['siteConfig'][45][44]+name+langData['siteConfig'][45][45].replace('1','<font color="#ff6600">'+count+'</font>')+'<br>'+langData['siteConfig'][45][46].replace('1','<font style="color:#f60;">'+need+'</font>');//您是经纪人，已购买套餐--剩余--次数共1次--当前操作需要消耗1次


	        if(type == 'topping'){
	          info = langData['siteConfig'][45][43]+'<br>'+langData['siteConfig'][45][44]+name+langData['siteConfig'][45][48].replace('1','<font color="#ff6600">'+count+'</font>')+'<br>'+langData['siteConfig'][45][49].replace('1','<font style="color:#f60;">'+need+'</font>');//您是经纪人，已购买套餐--剩余--天数共1天--当前操作需要消耗1天
	        }
	        if(has >= need){
	          btn.attr('href', 'javascript:;').text(name);
	        }else{
	          btn.attr('href', href).text(langData['siteConfig'][30][71]);//升级套餐
	          info += langData['siteConfig'][30][72];//<br>请购买或升级套餐
	        }
	        $('.zjuser_info').html(info);
	      }
	    },

		//显示业务窗口，以及填充初始数据
		show: function(type, title){

      		var that_ = this;

			$('.rtRefresh, .normalRefresh, .rtTopping').hide();
			var rtConfig = refreshTopConfig.config;

      		// 房产模块、经纪人、后台配置了经纪人套餐
      		if(refreshTopModule == 'house' && rtConfig.zjuserMeal.iszjuser == "1" && rtConfig.zjuserMeal.meal_check.state != 101){
		        check_zjuser = true;
		        $('.refreshTopPopup').addClass('check_zjuser');

	        	if(type == "refresh"){
	          		$('.freeRefresh, .rtSett, .paySubmit, .normalRefresh').addClass('hide_impt');

	          		$('.house_zjuser_choose').show().children('li').click(function(){
			            var t = $(this), index = t.index();
			            t.addClass('curr').siblings().removeClass('curr');
			            if(index == 1){
			              that_.update_zjuser_btn(type, 1);
			              $('#refreshTopForm #type').val('refresh');
			            }else{
			              $('.rtSmartPackage li.curr').click();
			              $('#refreshTopForm #type').val('smartRefresh');
			            }
	          		})
		        }else{
		          this.update_zjuser_btn(type, 7);
		        }
		    }else{
		        $('#zjuser_refresh').remove();
		    }

			//刷新业务
			if(type == 'refresh'){

				$('.rtRefresh, .normalRefresh').show();
				$('.rtHeader h5').html(langData['siteConfig'][16][70]);//刷新

				refreshFreeTimes = rtConfig.refreshFreeTimes;  //可免费刷新次数
				refreshNormalPrice = rtConfig.refreshNormalPrice;  //普通刷新价格
				refreshSmart = rtConfig.refreshSmart;  //智能刷新配置
				memberFreeCount = refreshTopConfig.memberFreeCount;
				surplusFreeRefresh = parseInt(refreshFreeTimes - memberFreeCount);

        		//普通刷新单价
        		$('.refreshNormalPrice').html(refreshNormalPrice + echoCurrency("short"));

				//拼接智能刷新方案
				if(refreshSmart.length > 0){
					var smartHtml = [];
					for (var i = 0; i < refreshSmart.length; i++) {
			            if(i == 0){
			    			refreshTopAmount = refreshTopPayAmount = refreshSmart[i].price;
			              	$('#refreshTopForm #amount').val(refreshTopAmount);
			          		$('#refreshTopForm #config').val(0);
			            }
						smartHtml.push('<li class="fn-clear'+(i == 0 ? ' curr' : '')+'">');
			          	smartHtml.push('<div class="tit">'+refreshSmart[i].day+langData['siteConfig'][13][6]+'/'+refreshSmart[i].times+langData['siteConfig'][13][26]+(refreshSmart[i].offer > 0 ? '<em>'+refreshSmart[i].discount+'</em>' : langData['siteConfig'][45][50])+'</div>');//天--次--（无优惠）
		            	smartHtml.push('<div class="pri"><small>'+echoCurrency("symbol")+'</small>'+refreshSmart[i].price+'</div>');
						smartHtml.push('<div class="rad"><s><img src="/templates/member/images/radio_check.png" /></s></div>');
			          	smartHtml.push('</li>');
						}
						$('.rtSmartPackage').html(smartHtml.join(''));
				        if(smartHtml.length == 0){
				            $('.house_zjuser_choose li:eq(1)').addClass('curr').siblings().hide();
				            that_.update_zjuser_btn(type, 1);
				        }else{
				            $('.rtSmartPackage li.curr').click();
				        }

		          		//如果还有免费次数
		  				if(surplusFreeRefresh > 0){
		  					$('.newFreshAlert').animate({"bottom":'0'},200);
		  					$('.newTopMask').fadeIn();
		  					$('.refreshNow').html('<i class="refresh-i"></i>'+langData['siteConfig'][32][31])//立即刷新
		  					$('.tollRefresh, .rtBody .rtSett, .rtBody .paySubmit, .rtBody .normalRefresh,.rtHeader').hide();
		  					$('.refreshFreeSurplus').html(surplusFreeRefresh);
		  					refreshTopAmount = refreshTopPayAmount = 0;
		  				}else{//没有次数了
		  					//显示浮动窗口
      						$('body').addClass('bodyFixed');
							refreshTopPopup.show();

  							$('.tollRefresh').show();
  							$('#refreshTopForm #amount').val(refreshTopAmount);
		  				}

				//没有智能刷新方案
				}else{
					$('.normalTips, .rtSmart').hide();
				}

			//智能刷新业务 顺风车特改
			}else if(type == 'newSmartfresh'){
				//显示浮动窗口
      			$('body').addClass('bodyFixed');
				refreshTopPopup.show();

				$('.rtRefresh, .normalRefresh').show();
				$('.normalTips').hide();
				$('.rtHeader h5').html(langData['siteConfig'][32][28]);//智能刷新
				refreshSmart = rtConfig.refreshSmart;  //智能刷新配置

        		//普通刷新单价
				refreshNormalPrice = rtConfig.refreshNormalPrice;  //普通刷新价格
        		$('.refreshNormalPrice').html(refreshNormalPrice + echoCurrency("short"));

				//拼接智能刷新方案
				if(refreshSmart.length > 0){
					var smartHtml = [];
					for (var i = 0; i < refreshSmart.length; i++) {
			            if(i == 0){
			    			refreshTopAmount = refreshTopPayAmount = refreshSmart[i].price;
			              	$('#refreshTopForm #amount').val(refreshTopAmount);
			          		$('#refreshTopForm #config').val(0);
			            }
						smartHtml.push('<li class="fn-clear'+(i == 0 ? ' curr' : '')+'">');
			          	smartHtml.push('<div class="tit">'+refreshSmart[i].day+langData['siteConfig'][13][6]+'/'+refreshSmart[i].times+langData['siteConfig'][13][26]+(refreshSmart[i].offer > 0 ? '<em>'+refreshSmart[i].discount+'</em>' : langData['siteConfig'][45][50])+'</div>');//天--次--（无优惠）
		            	smartHtml.push('<div class="pri"><small>'+echoCurrency("symbol")+'</small>'+refreshSmart[i].price+'</div>');
						smartHtml.push('<div class="rad"><s><img src="/templates/member/images/radio_check.png" /></s></div>');
			          	smartHtml.push('</li>');
						}
						$('.rtSmartPackage').html(smartHtml.join(''));
				        if(smartHtml.length == 0){
				            $('.house_zjuser_choose li:eq(1)').addClass('curr').siblings().hide();
				            that_.update_zjuser_btn(type, 1);
				        }else{
				            $('.rtSmartPackage li.curr').click();
				        }

	  					$('.tollRefresh,.rtHeader').show();
	  					$('#refreshTopForm #amount').val(refreshTopAmount);


				//没有智能刷新方案
				}else{
					$('.normalTips, .rtSmart').hide();
				}
			//置顶业务
			}else if(type == 'topping'){
				//显示浮动窗口
      			$('body').addClass('bodyFixed');
				refreshTopPopup.show();

				$('.rtTopping').show();
				$('.rtHeader h5').html(langData['siteConfig'][19][762]);//置顶

				$('.rtTopping .topTit').html(title);

				//初始化默认选中普通刷新
				$('.rtToppingType li').removeClass('curr');
				$('.rtToppingType li:eq(0)').addClass('curr');
				$('.rtToppingPlan').hide();
				$('.rtToppingNormal').show();

				topNormal = rtConfig.topNormal;  //普通置顶
				topPlan = rtConfig.topPlan;  //计划置顶

				//将周日的数据移到第一位
				topPlan.unshift(1);
				topPlan[0] = topPlan[7];
				topPlan.pop();

				//拼接普通置顶时长
				var	topNormalHtml = [];
				if(topNormal.length > 0){
					for (var i = 0; i < topNormal.length; i++) {
						if(i == 0){
							refreshTopAmount = refreshTopPayAmount = parseFloat(topNormal[i].price);
							$('#refreshTopForm #amount').val(refreshTopAmount);
						}
						topNormalHtml.push('<li class="fn-clear'+(i == 0 ? ' curr' : '')+'">');
						topNormalHtml.push('<div class="tit">'+topNormal[i].day+langData['siteConfig'][13][6]);//天
			            if(topNormal[i].offer > 0){
			              	topNormalHtml.push('<em>'+topNormal[i].discount+'</em><span>'+langData['siteConfig'][45][51].replace('1',(topNormal[i].offer+echoCurrency("short")))+'</span>');//省1元
			            }
            			topNormalHtml.push('</div>');
						topNormalHtml.push('<div class="pri"><small>'+echoCurrency("symbol")+'</small>'+topNormal[i].price+'</div>');
						topNormalHtml.push('<div class="rad"><s><img src="/templates/member/images/radio_check.png"></s></div>');
            			topNormalHtml.push('</li>');
					}
				}
				$('.rtToppingPackage').html(topNormalHtml.join(''));
				$('#refreshTopForm #config').val(0);

		        // 房产经纪人操作
		        if(check_zjuser){
		          $('.rtToppingType li:eq(1)').click().siblings().hide();
		          $('.rtToppingPlan .rtToppingPlan, .rtSett, .paySubmit').addClass('hide_impt');
		          $('.house_zjuser_choose').hide()
		        }

			}

			//余额选项
			if(userTotalBalance){
				var rtUseBalance = userTotalBalance > refreshTopAmount ? parseFloat(refreshTopAmount).toFixed(2) : userTotalBalance.toFixed(2);
        		refreshTopPayAmount = (refreshTopAmount - rtUseBalance).toFixed(2);
				$('.rtBody .reduce-yue').text(rtUseBalance);
	      		$('.rtBody .pay-total').text(refreshTopPayAmount);
			}
			refreshTopFunc.calculationPayPrice();

            //APP端取消下拉刷新
            toggleDragRefresh('off');

		},

		//关闭
		close: function(){
			if(refreshTopTimer != null){
				clearInterval(refreshTopTimer);
			}
      		$('body').removeClass('bodyFixed');
			refreshTopPopup.hide();

            //APP端取消下拉刷新
            toggleDragRefresh('on');
		},

		//价格业务，判断是否显示支付
		calculationPayPrice: function(){
			if(refreshTopAmount){
        $('.rtBody .rtSett, .rtBody .paySubmit').show();
				var rtUseBalance = userTotalBalance > refreshTopAmount ? parseFloat(refreshTopAmount).toFixed(2) : userTotalBalance.toFixed(2);
				var rtTotalPay = parseFloat(refreshTopAmount).toFixed(2);

        $('.totalAmount').html(parseFloat(refreshTopAmount).toFixed(2));

				if($('.rtBody .yue-btn').hasClass('active')){
					$('#refreshTopForm #useBalance').val(1);
		      rtTotalPay = (refreshTopAmount - rtUseBalance).toFixed(2);
		      $('.rtBody .reduce-yue').text(rtUseBalance);
		    }else{
					$('#refreshTopForm #useBalance').val(0);
		    }
        refreshTopPayAmount = parseFloat(rtTotalPay).toFixed(2);
				$('.rtBody .pay-total').text(refreshTopPayAmount);
			}else{
        $('.rtBody .rtSett, .rtBody .paySubmit').hide();
			}
		},

		//计算计划置顶费用
		toppingPlan: function(){
			var beganDate = $('#topPlanBeganObj').val(),
					endDate = $('#topPlanEndObj').val();
			var diffDays = parseInt(getRtDays(beganDate, endDate)) + 1;

			//统计费用明细
			if(topPlan){

				refreshTopAmount = refreshTopPayAmount = 0;

				//获取已选时段
				var rtPlanSelected = [];
				$('.rtToppingPlanList span').each(function(){
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
						refreshTopPayAmount += topPlan[week][rtPlanSelected[week]];
					}
				}

				//将配置信息写入表单
				$('#refreshTopForm #amount').val(refreshTopAmount);
				$('#refreshTopForm #config').val(beganDate+'|'+endDate+'|'+rtPlanSelected.join(','));

				refreshTopFunc.calculationPayPrice();

			}

		}

	}


  //选择智能刷新方案
	$('.rtSmart').delegate('li', 'click', function(){
		var t = $(this), index = t.index(), times = parseInt(refreshSmart[index].times);
		t.addClass('curr').siblings('li').removeClass('curr');

    // 房产经纪人
    if(check_zjuser){
      var rtType = $('.house_zjuser_choose .curr').index();

      // 超过套餐剩余刷新次数
      refreshTopFunc.update_zjuser_btn('refresh', rtType == 0 ? times : 1);
      $('#refreshTopForm #config').val(index);
    }else{
      refreshTopAmount = refreshTopPayAmount = parseFloat(refreshSmart[index].price);
      $('#refreshTopForm #type').val('smartRefresh');
      $('#refreshTopForm #amount').val(refreshTopAmount);
      $('#refreshTopForm #config').val(index);
      refreshTopFunc.calculationPayPrice();
    }
	});

	//免费刷新
	$('.newFreshAlert .refreshNow').bind('click', function(){
		var t = $(this);
		if(surplusFreeRefresh > 0){
			t.addClass('transform');
			t.html('<i class="refresh-i"></i>'+langData['siteConfig'][30][75]+'...').attr('disabled', true);//刷新中
			$.ajax({
				type: "POST",
				url: "/include/ajax.php",
				dataType: "json",
				data: {
					'service': 'siteConfig',
					'action': 'freeRefresh',
					'module': refreshTopModule,
					'act': refreshTopAction,
					'aid': refreshTopID
				},
				success: function(data) {
					if(data && data.state == 100){
						var nowRefreshNum = surplusFreeRefresh-1;
						setTimeout(function(){
							$('.refreshFreeSurplus').html(nowRefreshNum);
							t.removeClass('transform');
							t.html('<s class="freshScuecess"></s>'+langData['siteConfig'][32][33]).attr('disabled', false);//刷新成功
						},300)
					}else{
						alert(data.info);
						if(data.info == '您的免费刷新次数已用完，不再享有免费刷新。'){//关闭免费刷新 显示智能刷新
							$('.newTopMask').fadeOut();
							$('.newFreshAlert').animate({"bottom":'-100%'},200);
							//显示浮动窗口
      						$('body').addClass('bodyFixed');
							refreshTopPopup.show();
							$('.tollRefresh').show();
              				refreshTopAmount = refreshTopPayAmount = refreshSmart[i].price;
              				$('#refreshTopForm #amount').val(refreshTopAmount);
          					$('#refreshTopForm #config').val(0);
							refreshTopFunc.calculationPayPrice();
						}
						setTimeout(function(){
							t.removeClass('transform');
							t.html('<i class="refresh-i"></i>'+langData['siteConfig'][32][31]).attr('disabled', false);//立即刷新
						},300)
					}
				},
				error: function(){
					alert(langData['siteConfig'][30][78]);//网络错误，刷新失败！
					setTimeout(function(){
						t.removeClass('transform');
						t.html('<i class="refresh-i"></i>'+langData['siteConfig'][32][31]).attr('disabled', false);//立即刷新
					},300)
				}
			});
		}else{
			alert(langData['siteConfig'][30][77]);//您的免费刷新次数已用完，不再享有免费刷新。
		    $('.newTopMask').fadeOut();
			$('.newFreshAlert').animate({"bottom":'-100%'},200);
			//显示浮动窗口
      		$('body').addClass('bodyFixed');
			refreshTopPopup.show();
		    $('.tollRefresh').show();
		    refreshTopAmount = refreshTopPayAmount = refreshSmart[i].price;
		    $('#refreshTopForm #amount').val(refreshTopAmount);
		    $('#refreshTopForm #config').val(0);
		    refreshTopFunc.calculationPayPrice();
		}
		return false;
	});

	//取消刷新
	$('.newFreshAlert .cancelFresh,.newTopMask').bind('click', function(){

  		if(refreshTopTimer != null){
			clearInterval(refreshTopTimer);
		}
		$('.newTopMask').fadeOut();
		$('.newFreshAlert').animate({"bottom":'-100%'},200);

        //APP端取消下拉刷新
        toggleDragRefresh('on');
	});

  //置顶方式切换
	$('.rtToppingType').delegate('li', 'click', function(){
		var t = $(this), index = t.index();
		if(!t.hasClass('curr')){
			t.addClass('curr').siblings('li').removeClass('curr');

			if(index == 0){
				$('.rtToppingPlan').hide();
				$('.rtToppingNormal').show();
				$('#refreshTopForm #type').val('topping');
				var rtTopNormalIndex = $('.rtToppingPackage .curr').index();
				refreshTopAmount = refreshTopPayAmount = parseFloat(topNormal[rtTopNormalIndex].price);
				$('#refreshTopForm #amount').val(refreshTopAmount);
				$('#refreshTopForm #config').val(rtTopNormalIndex);
				refreshTopFunc.calculationPayPrice();
			}else{
				$('.rtToppingPlan').show();
				$('.rtToppingNormal').hide();
				$('#refreshTopForm #type').val('toppingPlan');
				refreshTopFunc.toppingPlan();
			}

		}
	});

  //选择置顶时长
	$('.rtToppingPackage').delegate('li', 'click', function(){
		var t = $(this), index = t.index();
		if(!t.hasClass('curr')){
			t.addClass('curr').siblings('li').removeClass('curr');
			var rtTopNormalIndex = $('.rtToppingPackage .curr').index();
			refreshTopAmount = refreshTopPayAmount = parseFloat(topNormal[rtTopNormalIndex].price);
			$('#refreshTopForm #amount').val(refreshTopAmount);
			$('#refreshTopForm #config').val(rtTopNormalIndex);
			refreshTopFunc.calculationPayPrice();
		}
	});


  var currYear = (new Date()).getFullYear();

  //选择计划置顶日期
  $('#topPlanBeganObj').mobiscroll().date({
    theme: 'android-ics light', //皮肤样式
    display: 'bottom', //显示方式
    mode: 'scroller', //日期选择模式
    dateFormat: 'yyyy-mm-dd',
    lang: 'zh',
    startYear: currYear,
    endYear: currYear + 2,
    minDate: new Date($("#topPlanBeganObj").val()),
    onSelect: beganonSelect
  });
  var beganonSelect = function(valueText, inst){
      var beganDate = valueText;
      var endDate = $('#topPlanEndObj').val();

      var diffDays = parseInt(getRtDays(beganDate, endDate));
      console.log(diffDays)
      if(diffDays < 6){
        var endDate_ = getRtDate(beganDate, 6);
        $('#topPlanEndObj').val(endDate_);
        requestDate = new Date(endDate_);
        $("#topPlanEndObj").scroller('setDate', requestDate, true);
        $('#topPlanEndObj').mobiscroll().date({minDate: requestDate, dateFormat: 'yyyy-mm-dd', onSelect: endonSelect});
      }else{
        var endDate_ = getRtDate($("#topPlanBeganObj").val(), 6);
        $('#topPlanEndObj').mobiscroll().date({minDate: new Date(endDate_), dateFormat: 'yyyy-mm-dd', onSelect: endonSelect});
      }
      refreshTopFunc.toppingPlan();

      if(check_zjuser){
        diffDays = diffDays < 6 ? 6 : diffDays;
        refreshTopFunc.update_zjuser_btn('topping', diffDays + 1);
      }
  }

  function endonSelect(valueText, inst){
    var beganDate = $('#topPlanBeganObj').val();
    var endDate = valueText;

    if(!checkRtDate(beganDate)){
      beganDate = getRtDate(0, 1);
      $('#topPlanBeganObj').val(beganDate);
      requestDate = new Date(beganDate);
      $("#topPlanBeganObj").scroller('setDate', requestDate, true);
      $('#topPlanBeganObj').mobiscroll().date({minDate: requestDate, dateFormat: 'yyyy-mm-dd', onSelect: beganonSelect});
    }
    var diffDays = getRtDays(beganDate, endDate);

    if(diffDays < 6){
      var endDate_ = getRtDate(beganDate, 6);
      $('#topPlanEndObj').val(endDate_);
      requestDate = new Date(endDate_);
      $("#topPlanEndObj").scroller('setDate', requestDate, true);
      $('#topPlanEndObj').mobiscroll().date({minDate: requestDate, dateFormat: 'yyyy-mm-dd', onSelect: endonSelect});
    }else{
      var endDate_ = getRtDate($("#topPlanBeganObj").val(), 6);
      requestDate = new Date(endDate_);
      $('#topPlanEndObj').mobiscroll().date({minDate: requestDate, dateFormat: 'yyyy-mm-dd', onSelect: endonSelect});
    }
    refreshTopFunc.toppingPlan();

    if(check_zjuser){
      diffDays = diffDays < 6 ? 6 : diffDays;
      refreshTopFunc.update_zjuser_btn('topping', diffDays + 1);
    }
  }

  var requestDate = $("#topPlanBeganObj").val();
  if(requestDate != ""){
    requestDate = new Date(requestDate);
    $("#topPlanBeganObj").scroller('setDate', requestDate, true);
  }

  //选择计划置顶日期
  $('#topPlanEndObj').mobiscroll().date({
    theme: 'android-ics light', //皮肤样式
    display: 'bottom', //显示方式
    mode: 'scroller', //日期选择模式
    dateFormat: 'yyyy-mm-dd',
    lang: 'zh',
    startYear: currYear,
    endYear: currYear + 2,
    minDate: new Date($("#topPlanEndObj").val()),
    onSelect: endonSelect
  });

  var requestDate = $("#topPlanEndObj").val();
  if(requestDate != ""){
    requestDate = new Date(requestDate);
    $("#topPlanEndObj").scroller('setDate', requestDate, true);
  }

	//选择置顶时段
	$('.rtToppingPlanList').delegate('span', 'click', function(){
		var t = $(this);
		if(!t.hasClass('curr')){
			t.addClass('curr').siblings('span').removeClass('curr');
			refreshTopFunc.toppingPlan();
		}
	});


  //选择余额
	$('.rtBody .yue-btn').click(function(){
    var t = $(this);
    t.hasClass('active') ? t.removeClass('active') : t.addClass('active');
    refreshTopFunc.calculationPayPrice();
  })

  //普通刷新，购买立即刷新
  $('.paySubmit1').bind('click', function(){
    $('#refreshTopForm #type').val('refresh');
    $('#refreshTopForm #amount').val(refreshNormalPrice);
  });

  //购买并支付
  $('.paySubmit, .paySubmit1').bind('click', function(){
    var t = $(this);
    if(t.hasClass('disabled')) return;
    if(t.attr('href') == undefined || t.attr('href').indexOf('javascript') == 0){
      if(check_zjuser){
        $('#refreshTopForm').submit();
      }else{
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
				  if(str.state == 100 && str.info != ""){

					  $("#amout").text(info.order_amount);
					  $('.payMask').show();
					  $('.payPop').css('transform','translateY(0)');

					  // if(usermoney*1 < info.order_amount *1){
					  //
						//   $("#moneyinfo").text('余额不足，');
					  // }
					  if (usermoney * 1 < info.order_amount * 1) {

						  $("#moneyinfo").text('余额不足，');
						  $("#moneyinfo").closest('.check-item').addClass('disabled_pay')

						  $('#balance').hide();
					  }


					  if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
						  $("#bonusinfo").text('额度不足，');
						  $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
					  }else if( bonus * 1 < info.order_amount * 1){
						  $("#bonusinfo").text('余额不足，');
						  $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
					  }else{
						  $("#bonusinfo").text('');
						  $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
					  }
					  ordernum     = info.ordernum;
					  order_amount = info.order_amount;

					  payCutDown('',info.timeout,info);
				  }
			  }
		  });
        // $('#refreshTopForm').submit();
        // 转到公共支付页面
        // if(refreshTopPayAmount > 0){
        //   $('.refreshTopPaybox').addClass('show').animate({"bottom":"0"},300);
        //   $('.refreshTopMask').show();
        // }else{
        //   $('#refreshTopForm').submit();
        // }
      }
    }
  });


  $('#refreshTopForm').submit(function(e){
    if(check_zjuser){
      e.preventDefault();
      $('.rtBody .paySubmit').addClass('disabled');

      $.ajax({
        url: '/include/ajax.php',
        type : 'post',
        data: $(this).serialize(),
        dataType: 'json',
        success: function(data){
          $('.rtBody .paySubmit').removeClass('disabled');
          if(data && data.state == 100){
            $('.zjuser_info').html(data.info);
            setTimeout(function(){
              location.reload();
            }, 1000)
          }else{
            alert(data.info);
          }
        },
        error: function(){
          alert(langData['siteConfig'][6][203]);//网络错误，请重试！
          $('.rtBody .paySubmit').removeClass('disabled');
        }
      })
    }
  })

  // 点击遮罩层
  $('.refreshTopMask').on('click',function(){
    $('.refreshTopMask').hide();
    $('.refreshTopPaybox').animate({"bottom":"-100%"},300)
    setTimeout(function(){
      $('.refreshTopPaybox').removeClass('show');
    }, 300);
  })

  //支付方式
  $('.refreshTopPaybox li').bind('click', function(){
    var t = $(this), type = t.data('type');
    if(!t.hasClass('on')){
      t.addClass('on').siblings('li').removeClass('on');
  		$('#refreshTopForm #paytype').val(type);
    }
  });

  //确认支付
  $('.refreshTopPaybox .paybtn').bind('click', function(){
    $('#refreshTopForm').submit();
  });

    //查看计划置顶详情
    $('body').delegate('.topPlanDetail', 'click', function(){
        var t = $(this), module = t.attr('data-module'), aid = t.attr('data-id');
        topPlanCalUtil.setMonthAndDay();
        topPlanCalUtil.init(topPlanData[module][aid]);
    });


});

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
        $('.topCalendar, .topCalendarBg').attr('style', 'display: block;');
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
        aMonth[0][0] = langData['siteConfig'][13][25]; //日
        aMonth[0][1] = langData['siteConfig'][30][61]; //一
        aMonth[0][2] = langData['siteConfig'][30][62]; //二
        aMonth[0][3] = langData['siteConfig'][30][63]; //三
        aMonth[0][4] = langData['siteConfig'][30][64]; //四
        aMonth[0][5] = langData['siteConfig'][30][65]; //五
        aMonth[0][6] = langData['siteConfig'][30][66]; //六
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
                        'type': item.type == 'day' ? langData['siteConfig'][45][52] : langData['siteConfig'][14][11],//早8晚8 --全天
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
        htmls.push("<th>"+langData['siteConfig'][13][25]+"</th>");//日
        htmls.push("<th>"+langData['siteConfig'][30][61]+"</th>");//一
        htmls.push("<th>"+langData['siteConfig'][30][62]+"</th>");//二
        htmls.push("<th>"+langData['siteConfig'][30][63]+"</th>");//三
        htmls.push("<th>"+langData['siteConfig'][30][64]+"</th>");//四
        htmls.push("<th>"+langData['siteConfig'][30][65]+"</th>");//五
        htmls.push("<th>"+langData['siteConfig'][30][66]+"</th>");//六
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
                        htmls.push("<td data-id='"+myMonth[w][d]+"' class='today'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + " <span>"+langData['siteConfig'][32][43]+"</span></td>");//不置顶
                    }else{
                        htmls.push("<td class='empty'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] + "<span>"+langData['siteConfig'][32][43]+"</span>" : "") + " </td>");//不置顶
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
