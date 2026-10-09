$(function(){
	//增加人数目
	$('.add').click(function(){
		var i = $(this).siblings('span').text()*1;
		i=i+1;
		$(this).siblings('span').text(i);
		priceCalculator();
	});
	//减少人数目
	$('.jian').click(function(){
		var i = $(this).siblings('span').text()*1;
		i=i-1;
		if(i==0){
			alert(langData['travel'][7][59]);//不能再减少
			return 0;
		}
		$(this).siblings('span').text(i);

		priceCalculator();
	});
	$('#chooseDateInput_1,.time-icon').click(function(){
		if($('#single-pick').hasClass('show')){
			$('#single-pick').hide();
			$('#single-pick').removeClass('show')
		}else{
			$('#single-pick').show();
			$('#single-pick').addClass('show')
		}
		return false;
	})


	new Calendar({
	  // 设置显示位置
	  parent: 'single-pick',
	  // 初始化显示时间（默认选中时间）
	  time: firTime,
	  // viewMode：
	  // 0 - 日期模式（默认值）
	  viewMode: 0,
	  // pickMode：
	  // single - 单选模式
	  pickMode: 'single',
	  hasFooter: false,
	  // 配置日期选择的事件处理器 onDatePick，参数如下：
	  // time - 选中的日期时间
	  // $el - 点击的 DOM 节点
	  // calendar - 日历控件的实例
	  onDatePick: function (time, $el, calendar) {
	  	var choseTime = time
	    $("#chooseDateInput_1").val(choseTime);
	    $('#single-pick').hide();
	    priceCalculator();
	  },
	  // 配置今天选择的事件处理器 onTodayPick，参数如下：
	  // 1. 先切换到日期试图模式；
	  // 2. 触发日期选择的业务逻辑；
	  onTodayPick: function (time, $el, calendar) {
	    console.log('选择时间：', time)
	    console.log('选择的 DOM 节点：', $el)
	    console.log('日历实例：', calendar)
	  }
	})
	var firTime = '';//先赋值默认当天为选中
	var nowVal = $('.cal-date.cal-current').attr('data-date');
	if(st ==1){
		if(chosetimeArr!=''){
			firTime = chosetimeArr[0];
			$('#chooseDateInput_1').val(firTime);
		}
	}else{
		$('#chooseDateInput_1').val(nowVal);
	}

	//计算总价 包含特殊时刻
	priceCalculator();

	function priceCalculator(){
		var peoplenum = $('.jian').siblings('span').text();//人数
		peoplenum = peoplenum ? parseInt(peoplenum) : 1;
		$('.peoNum').text(peoplenum);
		var walktime2  = $(".chooseDateInput").val();//日期
		var pricePay = price;//原来的价格
		walktime2 = new Date(walktime2);
		var nowDate = walktime2.getDate();
		var nowMonth = walktime2.getMonth()+1;
		var nowYear = walktime2.getFullYear();
		var myDate = new Date();
		var nowDate2 = myDate.getDate();
		var nowMonth2 = myDate.getMonth()+1;
		var nowYear2 = myDate.getFullYear();
		if(nowDate == nowDate2&& nowMonth == nowMonth2 && nowYear == nowYear2){//要判断是否是今天 因为walktime2 是从零点开始计算的 要让它从当前时间计算
			walktime2 = new Date();
		}

		var priceArr = [];
        var oldPrice = 0;
		if(specialtimejson!=''){
			var specialtime = JSON.parse(specialtimejson);//特殊时刻
			if(specialtime.length>0){
				for(var o=0; o<specialtime.length; o++){//特殊日期循环
					var stime = new Date(specialtime[o].stime + " 00:00:00");
					var etime = new Date(specialtime[o].etime + " 23:59:59");
					if(walktime2.getTime() >= stime.getTime() && walktime2.getTime() <= etime.getTime()){
						priceArr.push(specialtime[o].price);
                        oldPrice = specialtime[o].price;
					}
				}
			}
		}

		if (priceArr.length == 0){
			pricePay = (pricePay * peoplenum).toFixed(2);
            $('.tour_bot p').html(deTitle+echoCurrency('symbol')+'<em class="peoUnit">'+price+'</em> x <span class="peoNum">'+peoplenum+'</span></p>');
		}else{
			pricePay = (priceArr.pop() * peoplenum).toFixed(2);
            $('.tour_bot p').html(deTitle+'-'+langData['travel'][13][11]+echoCurrency('symbol')+'<em class="peoUnit">'+oldPrice+'</em> x <span class="peoNum">'+peoplenum+'</span></p>');
		}
		$('.price_all em').html(pricePay);
		$('.detail_all em').html(pricePay);


		jifen_di = parseInt(jifen_ * pricePay  * pointRatio / 100);
		jifen_di = hasPoint <= jifen_di ? hasPoint : jifen_di;
		jian = parseFloat((jifen_di/pointRatio).toFixed(2));
		$(".integral .jifen").html(jifen_di) ;
		$(".integral .jifen_jian").html(jian) ;
		$(".integral .amount_jian span").html(jian)
		if($(".integral .gou").hasClass('hasgou')){
			$('.price_all em').html(pricePay-jian);
			// $('.detail_all em').html(pricePay-jian);
		}else{
			$('.price_all em').html(pricePay);
			// $('.detail_all em').html(pricePay);
		}

	}

	$(".integral .gou").click(function(){
		$(this).toggleClass('hasgou');
		priceCalculator();
	})


	//国际手机号获取
    getNationalPhone();
	function getNationalPhone(){
	    $.ajax({
            url: "/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'JSONP',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li data-cn="'+list[i].name+'" data-code="'+list[i].code+'">'+list[i].name+' +'+list[i].code+'</li>');
                   }
                   $('.areaCode_wrap ul').append(phoneList.join(''));
                }else{
                   $('.areaCode_wrap ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                        $('.areaCode_wrap ul').html('<div class="loading">加载失败！</div>');
                    }

	    })
	}
	//显示区号
	$('.areaCode').bind('click', function(){

	    var areaWrap =$(this).closest(".inpbdr").find('.areaCode_wrap');
	    if(areaWrap.is(':visible')){
	      areaWrap.fadeOut(300)
	    }else{
	      areaWrap.fadeIn(300);
	      return false;
	    }
	});

	  //选择区号
	$('.areaCode_wrap').delegate('li', 'click', function(){
	    var t = $(this), code = t.attr('data-code');
	    var par = t.closest(".inpbdr");
	    var areaIcode = par.find(".areaCode");
	    areaIcode.find('i').html('+' + code);
	    $("#areaCode").val(code);
	});

	$('body').bind('click', function(e){
	    $('.areaCode_wrap').fadeOut(300);
	    if(e.target!=$('.icon-angle-down')[0]&&e.target!=$('.icon-angle-up')[0]){
	    	$('#single-pick').hide().removeClass('show');
	    }
	});


	otherModify2();
	function otherModify2(){
		//找到当前日期的前面的所有日期
		var len = $('.cal-date').length;
		$('.cal-date').each(function(){
			if(st == 1){//某些时间发团而非天天发团
		      $(this).addClass('cal-disabled');
		    }else{//天天发团
		      var $index = $('.cal-date.cal-current').index();
		      if($(this).index()<$index){
		        $(this).addClass('cal-disabled').removeClass('cal-data-now');
		      }else{

		      }
		    }
		})

		//修改当天为 今天
		$('.cal-date.cal-current').find('.cal-text').text('今天')
		$('.cal-date.cal-current').next().find('.cal-text').text('明天')
		$('.cal-date.cal-current').next().next().find('.cal-text').text('后天')
		if(st == 1){
			var $calFor = $('.cal-date');//找到所有date
		}else{
			var $calFor = $('.cal-data-now');//找到当月剩下的可点日期
		}

		//找到当月剩下的可点日期
		$calFor.each(function(){
			var walktime  = $(this).attr('data-date');//日期
			var txt = $(this).find('.cal-text').text();

            $(this).html('<span class="cal-text">'+txt+'</span><p class="hprice"><em>'+echoCurrency('symbol')+'</em>'+Number(price)+'</p>');

			if($(this).hasClass('cal-current')){
				walktime = new Date();
			}
			walktime = new Date(walktime);
			if(specialtimejson!=''){//有特殊时刻
				var specialtime = JSON.parse(specialtimejson);//特殊时刻
				if(specialtime.length>0){
					for(var o=0; o<specialtime.length; o++){//特殊日期循环
						var stime = new Date(specialtime[o].stime + " 00:00:00");
						var etime = new Date(specialtime[o].etime + " 23:59:59");
						if(walktime.getTime() >= stime.getTime() && walktime.getTime() <= etime.getTime()){
							$(this).html('<span class="cal-text">'+txt+'</span><p class="hprice"><em>'+echoCurrency('symbol')+'</em>'+Number(specialtime[o].price)+'</p>')
                            break;
						}
					}
				}
			}
			if(st == 1){//某些时间发团而非天天发团
				$('.cal-date.cal-current').addClass('curr-chose');
				if(chosetimeArr!=''){
					for(var t=0; t<chosetimeArr.length; t++){//特殊日期循环
						var time = new Date(chosetimeArr[t]);
						if((time.getDate() == walktime.getDate())&&(time.getMonth())==(walktime.getMonth())&&(time.getFullYear())==(walktime.getFullYear())){
							$(this).removeClass('cal-disabled');

						}
					}
				}
			}

		})
	}

	//景点门票预订时  展开预订说明
	$('.more-icon').click(function(){
		if($(this).hasClass('more-hide')){
			$('.buy_note').hide();
			$(this).removeClass('more-hide');
		}else{
			$('.buy_note').show();
			$(this).addClass('more-hide');
		}
	})
	//点击收起
	$('.hide_con').click(function(){
		$('.buy_note').hide();
		$('.more-icon').removeClass('more-hide');

	})

	//提交
	$('.submit_a').click(function(){
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			window.location.href = masterDomain+'/login.html';
			return false;
		}

		var t = $(this);
		var contact = $('#contact').val();
		var tel = $('#tel').val();
		var person_id =$('#person_id').val();
		var areaCode = $('#areaCode').val();
		var tel_d = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/;
		var id_d = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
		if(contact==''){
			alert(langData['travel'][8][63]);  //请输入联系人
			return 0;
		}else if(tel==''){
			alert(langData['travel'][7][60]);//请输入手机号
			return 0;
		}else if(person_id==''){
			alert(langData['travel'][7][64]);   //请输入身份证号
			return 0;
		}else if(!person_id.match(id_d)){
			alert(langData['travel'][7][65]);    //请输入正确身份证号
			return 0;
		}

		var data = [];
		data.push('proid=' + $("#proid").val());
		data.push('type=' + type);
		data.push('procount=' + $('.jian').siblings('span').text());
		data.push('people=' + $("#contact").val());
		data.push('areaCode=' + $("#areaCode").val());
		data.push('contact=' + $("#tel").val());
		data.push('idcard=' + $("#person_id").val());
		data.push('walktime=' + $("#chooseDateInput_1").val());
		data.push('usePinput=' + ($('.integral .gou').hasClass('hasgou')?'1':'0'));

		$.ajax({
			url: '/include/ajax.php?service=travel&action=deal',
			data: data.join("&"),
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					if (typeof (data.info) == 'object') {
						info = data.info;
						cutDown = setInterval(function () {
							$(".payCutDown").html(payCutDown(info.timeout));
						}, 1000)

						var datainfo = [];
						for (var k in info) {
							datainfo.push(k + '=' + info[k]);
						}
						$("#amout").text(info.order_amount);
						$('.payMask').show();
						$('.payPop').show();

						// if (totalBalance * 1 < info.order_amount * 1) {
						//
						// 	$("#moneyinfo").text('余额不足，');
						// }
						if (totalBalance * 1 < info.order_amount * 1) {

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
							$("#bonusinfo").text('余额不足，');
							$("#bonusinfo").closest('.pay_item').addClass('disabled_pay')
						}else{
							$("#bonusinfo").text('');
							$("#bonusinfo").closest('.pay_item').removeClass('disabled_pay')
						}

						ordernum = info.ordernum;
						order_amount = info.order_amount;

						$("#ordertype").val('');
						$("#service").val('travel');
						service = 'travel';
						var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
						$('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));
					}else {
						location.href = data.info + (data.info.indexOf('?') > -1 ? '&' : '?') + 'currentPageOpen=1';
					}
				}else{
					alert(data.info);
				}
			},
			error: function(){
				alert(langData['siteConfig'][20][183]);
				t.removeClass("disabled").html(langData['shop'][1][8]);
			}
		});

	});

})
