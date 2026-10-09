$(function(){

	$('.chooseDateInput,.time-icon').click(function(){
		if($('#range-pick').hasClass('show')){
			$('#range-pick').hide();
			$('#range-pick').removeClass('show');
			$('.tou-mask').hide();
		}else{
			$('#range-pick').show();
			$('#range-pick').addClass('show');
			$('.tou-mask').show();
		}

		return false;
	})
	//选择房间数量
	$('.roomNum span').click(function(){
		$(this).addClass('checked').siblings('span').removeClass('checked');
		var roomNum = $(this).data('room');
		var roomList=[];
		for(var n = 1;n<=roomNum;n++){
			roomList.push('<div class="spe_input">')
			// roomList.push('<input type="text" placeholder="'+langData['travel'][14][41]+'" class="person_name" name="person_name">');
			roomList.push('<input type="text" placeholder="'+langData['travel'][14][41].replace('1',n)+'"  class="person_name"  name="person_name">')
			roomList.push('<input type="text" placeholder="身份证号" name="person_id"  class="person_id">')
			roomList.push('</div> ')
		}
			roomList.push('<span class="tip_span">'+langData['travel'][14][42]+'</span>')
		$('.person').html(roomList.join(''));
		priceAll();

	})
	function DateDiff(sDate1, sDate2) {  //sDate1和sDate2是yyyy-MM-dd格式

	    var aDate, oDate1, oDate2, iDays;
	    aDate = sDate1.split("-");
	    oDate1 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0]);  //转换为yyyy-MM-dd格式
	    aDate = sDate2.split("-");
	    oDate2 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0]);
	    iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24); //把相差的毫秒数转换为天数

	    return iDays;  //返回相差天数
	}
	function weekDiff(weekVal){ //weekVal是yyyy-MM-dd格式
		var a = langData['siteConfig'][34][5]; //周日--周六
		var week = new Date(weekVal).getDay();
		var str = a[week];
		return str;
	}

	function hasPicked(){
		pickList = [];
		$('.cal-date.cal-picked').each(function(){
			var hasDate = $(this).data('date');
			pickList.push(hasDate);
		})
		//console.log(pickList)
	}
	new Calendar({
	  // 设置显示位置
	  parent: 'range-pick',
	  // 初始化显示时间（默认选中时间）
	  time: '',
	  // viewMode：
	  // 0 - 日期模式（默认值）
	  viewMode: 0,
	  // pickMode：
	  // range - 多选模式
	  pickMode: 'range',
	  hasFooter: false,
	  // 配置日期选择的事件处理器 onDatePick，参数如下：
	  // time - 选中的日期时间
	  // $el - 点击的 DOM 节点
	  // calendar - 日历控件的实例
	  onDatePick: function (time, $el, calendar) {
	  	if(time.length == 2){
	  		var dt11 = new Date(time[0]);
        	var dt22 = new Date(time[1]);
           	var htime11 = dt11.getTime();
           	var htime22 = dt22.getTime();

	  		var sTime,eTime;
	  		if(htime11 > htime22){
	  			sTime = time[1];
	  			eTime = time[0];
	  		}else{
	  			sTime = time[0];
	  			eTime = time[1];
	  		}
	  		$('.entertime').val(sTime);
	  		$('.leavetime').val(eTime);
	  		$('#range-pick').hide();
	  		$('#range-pick').removeClass('show');
	  		$('.tou-mask').hide();
	  		var night=DateDiff(sTime,eTime);
	  		$('.night').html(langData['travel'][14][43].replace('1',night));   //共1晚
	  		$('#datein').val(night);
	  		//开始和结束 对应周几
	  		var sWeek = weekDiff(sTime);
			var eWeek = weekDiff(eTime);
			$('.week1').text(sWeek);
			$('.week2').text(eWeek);
			hasPicked();
			priceAll();
	  	}
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




	//先赋值默认当天为选中
	var nowVal = $('.cal-dates .cal-current').attr('data-date');
	$('.entertime').val(nowVal);
	$('.cal-dates .cal-current').addClass('cal-picked');
	var nextVal = $('.cal-dates .cal-current').next().attr('data-date');
	$('.leavetime').val(nextVal);
	$('.cal-dates .cal-current').next().addClass('cal-picked');
	var sweek1 = weekDiff(nowVal);
	var sweek2 = weekDiff(nextVal);
	$('.week1').text(sweek1)
	$('.week2').text(sweek2)

	function priceAll(){
		var roomNum = $('.roomNum .checked').data('room');//房间数
		roomNum = roomNum ? parseInt(roomNum) : 1;
		var priceAll;
		var sumPrice=0;
		var rangLen = $('.cal-dates .cal-picked').length;
		var lPrice = $('.detail_all').attr('data-price');
		if(rangLen == 0){
			console.log('没选');
			priceAll = (lPrice*roomNum).toFixed(2);
		}else{
			$('.cal-dates .cal-picked').each(function(k,v){//循环已选中的范围
				if(k<rangLen-1){
					var hprice = $(this).find('.hprice span').text();
					sumPrice = Number(sumPrice) + Number(hprice);
				}
			})
			priceAll = (sumPrice*roomNum).toFixed(2);
		}

		$('.price_all em').html(priceAll)
		$('.detail_all em').html(priceAll);


		jifen_di = parseInt(jifen_ * priceAll  * pointRatio / 100);
		jifen_di = hasPoint <= jifen_di ? hasPoint : jifen_di;
		jian = parseFloat((jifen_di/pointRatio).toFixed(2));
		$(".integral .jifen").html(jifen_di) ;
		$(".integral .jifen_jian").html(jian) ;
		$(".integral .amount_jian span").html(jian)
		if($(".integral .gou").hasClass('hasgou')){
			$('.price_all em').html(priceAll-jian);
			// $('.detail_all em').html(priceAll-jian);
		}else{
			$('.price_all em').html(priceAll);
			// $('.detail_all em').html(priceAll);
		}
	}

	//计算总价 包含特殊时刻
	priceCalculator();

	function priceCalculator(){

		var walktime2  = $(".entertime").val();//日期
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
		if(specialtimejson!=''){
			var specialtime = JSON.parse(specialtimejson);//特殊时刻
			if(specialtime.length>0){
				for(var o=0; o<specialtime.length; o++){//特殊日期循环
					var stime = new Date(specialtime[o].stime);
					var etime = new Date(specialtime[o].etime);
					if(walktime2.getTime() >= stime.getTime() && walktime2.getTime() <= etime.getTime()){
						priceArr.push(specialtime[o].price);
					}
				}
			}
		}

		if (priceArr.length == 0){
			pricePay = (pricePay*1).toFixed(2);
		}else{
			pricePay = (priceArr.pop()).toFixed(2);
		}
		$('.price_all em').html(pricePay);
		$('.detail_all em').html(pricePay);
		$('.detail_all').attr('data-price',pricePay);

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
		priceAll();
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
	});
	$('.tou-mask').bind('click', function(){
		$('#range-pick').hide().removeClass('show');
		$('.tou-mask').hide();
	})


	otherModify2();
	function otherModify2(){
		//找到当前日期的前面的所有日期
		var len = $('.cal-date').length;
		$('.cal-date').each(function(){
			var $index = $('.cal-date.cal-current').index();
			if($(this).index()<$index){
				$(this).addClass('cal-disabled').removeClass('cal-data-now');
			}
		})

		//修改当天为 今天
		$('.cal-date.cal-current').find('.cal-text').text('今天')
		$('.cal-date.cal-current').next().find('.cal-text').text('明天')
		$('.cal-date.cal-current').next().next().find('.cal-text').text('后天')

		//剩下的可点日期
		$('.cal-date').each(function(){
			if(!$(this).hasClass('cal-disabled')){
				var walktime  = $(this).attr('data-date');//日期
				var txt = $(this).find('.cal-text').text();

				if($(this).hasClass('cal-current')){
					walktime = new Date();
				}
				walktime = new Date(walktime);
				$(this).html('<span class="cal-text">'+txt+'</span><p class="hprice"><em>'+echoCurrency('symbol')+'</em><span>'+Number(price)+'</span></p>');
				if(specialtimejson!=''){//有特殊时刻
					var specialtime = JSON.parse(specialtimejson);//特殊时刻
					if(specialtime.length>0){

						for(var o=0; o<specialtime.length; o++){//特殊日期循环
							var stime = new Date(specialtime[o].stime);
							var etime = new Date(specialtime[o].etime);
							if(walktime.getTime() >= stime.getTime() && walktime.getTime() <= etime.getTime()){
								$(this).html('<span class="cal-text">'+txt+'</span><p class="hprice"><em>'+ echoCurrency('symbol')+'</em><span>'+Number(specialtime[o].price)+'</span></p>')
							}
						}

					}
				}
			}

		})
	}

	//提交
	$('.submit_a').click(function(){
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			window.location.href = masterDomain+'/login.html';
			return false;
		}

		var t = $(this);
		var tel = $('#tel').val();
		var areaCode = $('#areaCode').val();
		var tel_d = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/;

		var person = [];
		var r_flag = 0;
		var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
		$(".person .spe_input").each(function () {
			var t = $(this);
			if(t.find('input[name="person_name"]').val()!='' && t.find('input[name="person_id"]').val()!=''){
				var name = t .find('input[name="person_name"]').val(),id = t .find('input[name="person_id"]').val();
				person.push({'name':name,'id':id});
			}
			if(t.find("input[name='person_name']").val()==''){
				r_flag = 1;
				alert(langData['travel'][7][62]); //请输入入住人
				return false;
			}else if(t.find("input[name='person_id']").val()==''){
				r_flag = 1;
				alert('请输入住客身份证号'); //请输入入住人
				return false;
			}
			if(reg.test(t.find("input[name='person_id']").val()) === false)
			{
				r_flag = 1;
				alert("身份证输入不合法");
				return  false;
			}
		});
		if(r_flag) return false;
		if (person.length != 0) {
			if (tel == '') {
				alert(langData['travel'][7][60]); //请输入手机号
				return false;
			}
		}
		var walktime = $(".entertime").val();
		walktime = walktime.replace("/", '-').replace("/", '-');

		var departuretime = $(".leavetime").val();
		departuretime = departuretime.replace("/", '-').replace("/", '-');

		var data = [];
		data.push('proid=' + $("#proid").val());
		data.push('type=' + type);
		data.push('procount=' + $('.roomNum .checked').data('room'));
		data.push('people=' + JSON.stringify(person));
		data.push('areaCode=' + $("#areaCode").val());
		data.push('contact=' + $("#tel").val());
		data.push('walktime=' + walktime);
		data.push('departuretime=' + departuretime);
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
