
// 取消积分勾选
$(".integral .gou").click(function(){
	var t = $(this);
	t.toggleClass('hasgou');
	priceCalculator();
})

function priceCalculator(){
		var peoplenum = $('.jian').siblings('span').text();//人数
		 peoplenum = peoplenum ? parseInt(peoplenum) : 1;
		// // var walktime  = $(".datebox .date_chose").find('h3').data('id');//日期
		// var walktime = $(".entertime").text();
		// var leavetime = $('.leavetime').text();
		// var daynum = $('#datein').val()
		// walktime = walktime.replace("/", '-').replace("/", '-');
		// leavetime = leavetime.replace("/", '-').replace("/", '-');
		// var pricePay = price;//原来的价格
		// walktime = new Date(walktime);
		// leavetime =  new Date(leavetime);

		// var priceArr = [];
		// if(specialtimejson!=''){
		// 	var specialtime = JSON.parse(specialtimejson);//特殊时刻
		// 	if(specialtime.length>0){
		// 		for(var o in specialtime){
		// 			var stime = new Date(specialtime[o].stime);
		// 			var etime = new Date(specialtime[o].etime);
		// 			if(walktime.getTime() >= stime.getTime() && walktime.getTime() <= etime.getTime()){
		// 				priceArr.push(specialtime[o].price);
		// 			}
		// 		}
		// 	}
		// }
		// if (priceArr.length == 0){
		// 	pricePay = (pricePay * peoplenum*daynum).toFixed(2);
		// }else{
		// 	pricePay = (priceArr.pop() * peoplenum*daynum).toFixed(2);
		// }

		function RemoveArr(arr) {
		    for (var i = 0; i < arr.length; i++) {
		        for (var j = i+1; j < arr.length; ) {
		            if(arr[i].day==arr[j].day){
		                arr.splice(j,1)
		            }else{
		                j++
		            }
		        }
		    }
		    return arr
		}
	dayprice = RemoveArr(dayprice)
		var price = 0;
		// priceAll = price + Number($(".date-content .leave").attr('data-price'));
		// console.log(priceAll)
		var price = 0
		for(var i=0; i<dayprice.length; i++){
			price += Number(dayprice[i].price);
			console.log(price)
		}
		var priceAll = price * peoplenum;
		$('.price_all em').html(priceAll);
		$('.detail_all em').html(priceAll);


		jifen_di = parseInt(jifen_ * priceAll  * pointRatio / 100);
		jifen_di = hasPoint <= jifen_di ? hasPoint : jifen_di;
		jian = parseFloat((jifen_di/pointRatio).toFixed(2));
		$(".integral .jifen").html(jifen_di) ;
		$(".integral .jian").html(jian) ;
		if($(".integral .gou").hasClass('hasgou')){
			$('.price_all em').html(priceAll-jian);
			$('.detail_all em').html(priceAll-jian);
		}else{
			$('.price_all em').html(priceAll);
			$('.detail_all em').html(priceAll);
		}

		if(jifen_di == 0 || jian == 0){
	  		$(".integral").hide()
	  	}

	  	if((priceAll-jian).toFixed(2) == 0){
			$(".right_btn").html(langData['siteConfig'][23][113]); //立即支付
		}

	}
$(function(){
	//入住时间显示
	$('.select-time').hotelDate();

	//增加房间数目
	var i = $('.num_room span').text()*1;
	$('.add').click(function(){
		i=i+1;
		$('.num_room span').text(i);
		$('.person').append('<div class="per"><label>房间'+i+'</label><p class="person_name"><input type="text" name="person_name" placeholder="'+langData['travel'][7][11]+'"/></p><p class="person_id"><input type="text" name="person_id" placeholder="住客身份证号"/></p></div>');   //入住人姓名   //新增入住人
		priceCalculator();
	});

	$('.jian').click(function(){

		if(i<=1){
			showErrAlert(langData['travel'][7][59]);   //不能再减了
			return 0;
		}
		i=i-1;
		$('.num_room span').text(i);
		$(".per:last").remove(); //减少入住人

		priceCalculator();
	});

	//计算总价 包含特殊时刻
	priceCalculator();




    //提交
    $('.right_btn').click(function(){
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			window.location.href = masterDomain+'/login.html';
			return false;
		}

		var tel = $('#tel').val();
		var person = [];
		var tel_d = /^(1[0-9])\d{9}$/;
		if(tel==''){
			showErrAlert(langData['travel'][7][60]);   // 请输入手机号
			return 0;
		}else if(!tel.match(tel_d)){
			showErrAlert(langData['travel'][7][61]);   //请输入正确的手机号
			return 0;
		}

		var r_flag = 1;
		// $(".person .per").each(function(){
		// 	var t = $(this);
		// 	if(t.find("input[name='person_name']").val()==''){
		// 		r_flag = 0;
		// 		alert(langData['travel'][7][62]); //请输入入住人
		// 		return false;
		// 	}else if(t.find("input[name='person_id']").val()==''){
		// 		r_flag = 0;
		// 		alert('请输入住客身份证号'); //请输入入住人
		// 		return false;
		// 	}
		// })

		// else if($('.person input.person_name').val()==''){
		// 	alert(langData['travel'][7][62]); //请输入入住人
		// 	return 0;
		// }if($('.person input.person_id').val()==''){
		// 	alert('请输入住客身份证号'); //请输入住客身份证号
		// 	return 0;
		// }

		var data = [];
		data.push('proid=' + $("#proid").val());
		data.push('type=' + type);
		data.push('procount=' + $('.jian').siblings('span').text());

		var person = [];

		var r_flag = 1;
		var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
		$(".person .per").each(function(){
			var t = $(this);
			if(t.find('input[name="person_name"]').val()!='' && t.find('input[name="person_id"]').val()!=''){
				var name = t .find('input[name="person_name"]').val(),id = t .find('input[name="person_id"]').val();
				person.push({'name':name,'id':id});
			}
			if(t.find("input[name='person_name']").val()==''){
				r_flag = 0;
				showErrAlert(langData['travel'][7][62]); //请输入入住人
				return false;
			}else if(t.find("input[name='person_id']").val()==''){
				r_flag = 0;
				showErrAlert('请输入住客身份证号'); //请输入入住人
				return false;
			}
			if(reg.test(t.find("input[name='person_id']").val()) === false)
			{
				r_flag = 0;
				showErrAlert("身份证输入不合法");
				return  false;
			}

		});

		if(!r_flag) return false;

		$(".payBeforeLoading").show();
		// data.push('people=' + person.join('|'));
		data.push('people=' + JSON.stringify(person));
		data.push('contact=' + $("#tel").val());

		var walktime = $(".entertime").text();
		walktime = walktime.replace("/", '-').replace("/", '-');

		var departuretime = $(".leavetime").text();
		departuretime = departuretime.replace("/", '-').replace("/", '-');

		data.push('walktime=' + walktime);
		data.push('departuretime=' + departuretime);
		data.push('usePinput=' + ($('.integral .gou').hasClass('hasgou')?'1':'0'));


		$.ajax({
			url: masterDomain + '/include/ajax.php?service=travel&action=deal',
			data: data.join("&"),
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				$(".payBeforeLoading").hide();
				if(data && data.state == 100){
					if (typeof (data.info) == 'object') {
						sinfo = data.info;
						service = 'travel';
						$('#ordernum').val(sinfo.ordernum);
						$('#action').val('pay');

						$('#pfinal').val('1');
						$("#amout").text(sinfo.order_amount);
						$('.payMask').show();
						$('.payPop').css('transform', 'translateY(0)');

						// if (totalBalance * 1 < sinfo.order_amount * 1) {
						//
						// 	$("#moneyinfo").text('余额不足，');
						//
						// 	$('#balance').hide();
						// }
						if (totalBalance * 1 < sinfo.order_amount * 1) {

							$("#moneyinfo").text('余额不足，');
							$("#moneyinfo").closest('.check-item').addClass('disabled_pay')

							$('#balance').hide();
						}

						if(monBonus * 1 < sinfo.order_amount * 1  &&  bonus * 1 >= sinfo.order_amount * 1){
              $("#bonusinfo").text('额度不足，');
              $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
            }else if( bonus * 1 < sinfo.order_amount * 1){
              $("#bonusinfo").text('余额不足，');
              $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
            }else{
              $("#bonusinfo").text('');
              $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
            }


						ordernum = sinfo.ordernum;
						order_amount = sinfo.order_amount;

						payCutDown('', sinfo.timeout, sinfo);
					}else {
						if(device.indexOf('huoniao_Android') > -1) {
							setupWebViewJavascriptBridge(function (bridge) {
								bridge.callHandler('pageClose', {}, function (responseData) {
								});
							});
							location.href = data.info;
						}else{
							location.href = data.info + (data.info.indexOf('?') > -1 ? '&' : '?') + 'currentPageOpen=1';
						}
					}

				}else{
					showErrAlert(data.info);
				}
			},
			error: function(){
				$(".payBeforeLoading").hide();
				showErrAlert(langData['siteConfig'][20][183]);
				t.removeClass("disabled").html(langData['shop'][1][8]);
			}
		});

	});

	//价格明细
	$('.price_all a').click(function(){
		$('.mask').show();
		$('.detail_price').animate({'bottom':'0'},200)
	});

	$('.detail_price h2>i,.mask').click(function(){
		$('.mask').hide();
		$('.detail_price').animate({'bottom':'-20rem'},200)
	});


})
