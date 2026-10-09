//文字横向滚动
function ScrollImgLeft(){
    var speed=50;//初始化速度 也就是字体的整体滚动速度
    var MyMar = null;//初始化一个变量为空 用来存放获取到的文本内容
    var scroll_begin = document.getElementById("scroll_begin");//获取滚动的开头id
    var scroll_end = document.getElementById("scroll_end");//获取滚动的结束id
    var scroll_div = document.getElementById("scroll_div");//获取整体的开头id
	if(scroll_end  && scroll_begin){
		scroll_end.innerHTML=scroll_begin.innerHTML;//滚动的是html内部的内容,原生知识!
		//定义一个方法
		function Marquee(){
		    if(scroll_end.offsetWidth-scroll_div.scrollLeft<=0)
		        scroll_div.scrollLeft-=scroll_begin.offsetWidth;
		    else
		        scroll_div.scrollLeft++;
		}
		MyMar=setInterval(Marquee,speed);//给上面的方法设置时间  setInterval
		//鼠标点击这条公告栏的时候,清除上面的方法,让公告栏暂停
		scroll_div.onmouseover = function(){
		    clearInterval(MyMar);
		}
		//鼠标点击其他地方的时候,公告栏继续运动
		scroll_div.onmouseout = function(){
		    MyMar = setInterval(Marquee,speed);
		}
	}
}
ScrollImgLeft();

$(function(){

    //当前已选套餐临时变量
    var packageActive = packageCurr;
    var packagePrice = 0;
    var packageItem = [];

	//单个开通
	$('.det-content a.opening').click(function(){
		$('.bottom_wrap').addClass('show');
		$('.all-choo').removeClass('show');
		var t = $(this);
		var par = t.closest('li');
		var price = par.attr('data-price');
		var name = par.attr('data-name');
		var time = $('.price_show').attr('data-year');
		t.addClass('tc_chosed').siblings('li').removeClass('tc_chosed');
		var allprice = 0,count_price = 0;
		$('.tc_info .tc_name').html(par.find('.no-title em').text());
		$('.rz_btn').html(langData['siteConfig'][6][185]);//立即开通
		allprice =(parseFloat(price)*time).toString();
		$('.price_show').attr('data-price',price);//原来的价格
		// formatNum(allprice);
		count_price = allprice;

		calcPrice(count_price);
        setTimeout(function(){
            $('.left_box').click();
        }, 500);

        //更新当前选择的套餐
        packageActive = -1;
        packagePrice = count_price;
        packageItem = [name];
	});

	//单个续期
	$('.det-content a.xuqi').click(function(){
		$('.bottom_wrap').addClass('show');
		$('.all-choo').removeClass('show');
		var t = $(this);
		var par = t.closest('li');
		var price = par.attr('data-price');
		var name = par.attr('data-name');
		var time = $('.price_show').attr('data-year');
		t.addClass('tc_chosed').siblings('li').removeClass('tc_chosed');
		var allprice = 0,count_price = 0;
		$('.tc_info .tc_name').html(par.find('.xuqi-tit').text());
		$('.rz_btn').html(langData['siteConfig'][49][60]);//立即续期
		allprice =(parseFloat(price)*time).toString();
		$('.price_show').attr('data-price',price);//原来的价格
		// formatNum(allprice);
		count_price = allprice;

		calcPrice(count_price);
        setTimeout(function(){
            $('.left_box').click();
        }, 500);

        //更新当前选择的套餐
        packageActive = -1;
        packagePrice = count_price;
        packageItem = [name];
	});

	//一键开通
	$('.openbtn a').click(function(){
		var allText=$('.no-open li:first-child').find('.no-title em').text();
		$('.tc_info .tc_name').html(allText+langData['siteConfig'][49][59]);//等多项服务

		var txt=[];
		$('.no-open li').each(function(){
			var liTxt = $(this).find('.no-title em').text();
			txt.push(liTxt);
		})
		$('.all-choo span').html(txt.join('、'))
		$('.all-choo').addClass('show');
		$('.rz_btn').html(langData['siteConfig'][6][185]);//立即开通
		$('.bottom_wrap').removeClass('show').addClass('hide');
		setTimeout(function(){
			$('.bottom_wrap').addClass('show').removeClass('hide');
		},300);

        var nameArr = [], count_price = 0;

        if(packageCurr == -1){
            $('.main-con3').find('li').each(function(){
                nameArr.push($(this).data('name'));
                count_price += $(this).data('price');
            });
        }else{
            $('.no-open').find('li').each(function(){
                nameArr.push($(this).data('name'));
                count_price += $(this).data('price');
            });
        }

        $('.price_show').attr('data-price',count_price);
		calcPrice(count_price);
        setTimeout(function(){
            $('.left_box').click();
        }, 500);

        //更新当前选择的套餐
        packageActive = -1;
        packagePrice = count_price;
        packageItem = nameArr;
	})
	//banner的续期 一键续期套餐服务
	$('.renewal').click(function(){
		$('.all-choo').removeClass('show');
		var count_price = $(this).attr('data-aprice');
		$('.tc_info .tc_name').html(packageTitle);//全部套餐
		$('.rz_btn').html(langData['siteConfig'][49][60]);//立即续期
		$('.bottom_wrap').removeClass('show').addClass('hide');
		setTimeout(function(){
			$('.bottom_wrap').addClass('show').removeClass('hide');
		},300);


        //自选套餐续费
        if(packageCurr == -1){
            var nameArr = [], count_price = 0;
            $('.main_con').find('li').each(function(){
                nameArr.push($(this).data('name'));
                count_price += parseFloat($(this).data('price'), 2);
            });
            packageItem = nameArr;
        }

		$('.price_show').attr('data-price',count_price);
		calcPrice(count_price);
        setTimeout(function(){
            $('.left_box').click();
        }, 500);

        //更新当前选择的套餐
        packageActive = packageCurr;
        packagePrice = count_price;
	})

	//一键续期 套餐外服务
	$('.xuqibtn a').click(function(){
		$('.all-choo').removeClass('show');
		var allText=$('.has-open li:first-child').find('.left-title').text();
		$('.tc_info .tc_name').html(allText+langData['siteConfig'][49][59]);//等多项服务

        var txt=[];
		$('.has-open li').each(function(){
			var liTxt = $(this).find('.xuqi-tit').text();
			txt.push(liTxt);
		})
		$('.all-choo span').html(txt.join('、'))
		$('.all-choo').addClass('show');

		$('.rz_btn').html(langData['siteConfig'][49][60]);//立即续期
		$('.bottom_wrap').removeClass('show').addClass('hide');
		setTimeout(function(){
			$('.bottom_wrap').addClass('show').removeClass('hide');
		},300);

        var nameArr = [], count_price = 0;
        $('.has-open').find('li').each(function(){
            nameArr.push($(this).data('name'));
            count_price += $(this).data('price');
        });

        $('.price_show').attr('data-price',count_price);
		calcPrice(count_price);
        setTimeout(function(){
            $('.left_box').click();
        }, 500);

        //更新当前选择的套餐
        packageActive = -1;
        packagePrice = count_price;
        packageItem = nameArr;
	})

	// 时间选择窗口
	$('.bottom_box .left_box').click(function(){
		$('.pop_box').animate({"bottom":'-88%'},200);
		$('.mask_pop1').show();
		$('.tl_box').animate({"bottom":'0'},200);
		$('html').addClass('noscroll');
	});

	// 选择时间
	$('.tl_box').delegate('.timeList li','click',function(){
		var t = $(this),time = t.attr('data-year')
		val = t.text();
		$('#time').val(time)
		t.addClass('click').siblings('li').removeClass('click');
		$('.pop_box').animate({"bottom":'-88%'},200);
		$('.tc_time').html(val);
		$('.pop_box').animate({"bottom":'-88%'},200);
		$('html').removeClass('noscroll');
		$('.mask_pop1').hide();
		$('.price_show').attr('data-year',time);
		var price = $('.price_show').attr('data-price');
		allprice = (parseFloat(price)*time).toString();
		formatNum(allprice);
		var hflag = 0,pflag = 0;
		for(var m = 0; m < promotions.length; m++){

			if(allprice>=promotions[m][0] && m<(promotions.length-1) && allprice<promotions[m+1][0] ){
				$('#scroll_div').hide();
				$('.hui_tip').removeClass('fn-hide');
				$('.hui_tip em.num_show').html(promotions[m][1]);
				var subafter = allprice-promotions[m][1]
				formatNum(subafter);
			}else if(allprice>=promotions[promotions.length-1][0]){
				$('.hui_tip').removeClass('fn-hide');
				$('.hui_tip em.num_show').html(promotions[promotions.length-1][1]);
				$('#scroll_div').hide();
				var subafter = allprice-promotions[promotions.length-1][1]
				formatNum(subafter);
			}else if(allprice<promotions[0][0]){
				$('.hui_tip').addClass('fn-hide');
				hflag = 1;
				formatNum(allprice);
			}
		}
		for(var n=0; n<integrals.length; n++){
			if(time>=integrals[n][0] && n<(integrals.length-1) && time<integrals[n+1][0]){
				pflag = 0;
				$('#scroll_div').hide();
				$('.point_tip').removeClass('fn-hide');
				$('.integrals_show').html(integrals[n][1])
			}else if(time>=integrals[integrals.length-1][0]){
				pflag = 0;
				$('#scroll_div').hide();
				$('.point_tip').removeClass('fn-hide');
				$('.integrals_show').html(integrals[integrals.length-1][1])
			}else  if(time<integrals[0][0]){
				$('.point_tip').addClass('fn-hide');
				pflag = 1;
			}
		}
		if(hflag && pflag){
			 $('#scroll_div').show();
		}
	});

	//计算有无优惠价
	function calcPrice(priceParam){
        if(promotions.length > 0){
    		for(var m = 0; m < promotions.length; m++){

    			if(priceParam>=promotions[m][0] && m<(promotions.length-1) && priceParam<promotions[m+1][0] ){//实价在优惠范围内

    				$('#scroll_div').hide();
    				$('.hui_tip').removeClass('fn-hide');
    				$('.hui_tip em.num_show').html(promotions[m][1]);
    				formatNum(priceParam-promotions[m][1])

    			}else if(priceParam>=promotions[promotions.length-1][0]){//实价大于最大优惠 取最大优惠值

    				$('.hui_tip').removeClass('fn-hide');
    				$('.hui_tip em.num_show').html(promotions[promotions.length-1][1]);
    				$('#scroll_div').hide();
    				formatNum(priceParam-promotions[promotions.length-1][1])

    			}else if(priceParam<promotions[0][0]){ //实价小于最小优惠

    				$('.hui_tip').addClass('fn-hide');
    				$('#scroll_div').show();
    				formatNum(priceParam)
    			}
    		}
        }else{
            formatNum(priceParam)
        }
	}
	// 格式化数组
	function formatNum(num){
		var num = num.toString()
		var qian = (num.indexOf(".")<0)?num:num.substring(0,num.indexOf("."));
		var hou = '00';
		if(num.indexOf(".")>-1){
			hou = (num.substr(num.indexOf(".")+1,2).length==2)?num.substr(num.indexOf(".")+1,2):(num.substr(num.indexOf(".")+1,2)+'0')
		}
		if($('.tc_time').text() == langData['siteConfig'][49][21]){

			$('.price_show').html(echoCurrency('symbol')+'<span class="dot_left">'+qian+'</span>.<span class="dot_right">'+hou+'</span><em>'+langData['siteConfig'][19][836]+'</em>' );//起
		}else{
			$('.price_show').html(echoCurrency('symbol')+'<span class="dot_left">'+qian+'</span>.<span class="dot_right">'+hou+'</span>' );
		}

	}


	// 取消按钮
	$('.cancel').click(function(){
		var t = $(this);
		t.parents('.pop_box').animate({"bottom":'-88%'},200);
		$('.mask_pop,.mask_pop1').hide();
		$('html').removeClass('noscroll');
	});

	// 显示优惠信息
	$('.hui_box').click(function(){
		$('.pop_box').animate({"bottom":'-88%'},200);
		$('.mask_pop1').show();
		$('.hd_box').animate({"bottom":'0'},200);
		$('html').addClass('noscroll');
	});

	//隐藏弹出层
	$('.mask_pop1').click(function(){
		$(this).hide();
		$('.pop_box').animate({"bottom":'-88%'},200);
		$('html').removeClass('noscroll');
	});


    //提交订单
    $('.right_btn').bind('click', function(){
        //提交订单
		var t = $(this);
		if(t.hasClass('disabled')) return false;

		//判断是否登录
		var userid = $.cookie(cookiePre + "login_user");
		if (userid == null || userid == "") {
			window.location.href = masterDomain + '/login.html';
			return false;
		};

		var tctime = $("#time").val();
		if(!tctime){
			showMsg(langData['business'][1][13]);   //请选择套餐时间
			return false;
		}

        //自选套餐
		var packageCon = [];
		if(packageActive < 0){
			if(packageItem.length == 0){
				alert("请选择要开通的特权！");
				return false;
			}
            packageCon = packageItem;
		}

		t.addClass('disabled');
		t.html('提交中...');

		$.ajax({
			url: "/include/ajax.php",
			type: "post",
			data: {
				'service': 'member',
				'action': 'joinBusinessOrder',
				'package': packageActive,
				'packageItem': packageCon.join(','),
				'time': tctime
			},
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					sinfo = data.info;

                    if(typeof(sinfo) == 'string'){
						var reg=/^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+).)+([A-Za-z0-9-~\/])+$/;
						if(reg.test(sinfo)){
							window.location.href = sinfo;
							return false;
						}
					}

					service   = 'member';
					$('#ordernum').val(sinfo.ordernum);
					$('#action').val('pay');

					$('#action_1').val('checkJoinPayAmount');
					$('#action_2').val('joinBusinessPay');

					$("#paction").val('joinBusinessPay');
					$("#amout").text(sinfo.order_amount);
					$('.payMask').show();
					$('.payPop').css('transform', 'translateY(0)');

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
				}else{
					alert(data.info);
					t.removeClass('disabled');
					t.html('重新提交');
				}
			},
			error: function(){
				alert('网络错误，请稍候重试！');
				t.removeClass('disabled');
				t.html('重新提交');
			}
		});
    });


    //提示窗
	var showErrTimer;
	function showMsg(txt,time){
		ht = time?time:1500
		showErrTimer && clearTimeout(showErrTimer);
		$(".popMsg").remove();
		$("body").append('<div class="popMsg"><p>'+txt+'</p></div>');
		$(".popMsg p").css({ "left": "50%"});
		$(".popMsg").css({"visibility": "visible"});
		showErrTimer = setTimeout(function(){
			$(".popMsg").fadeOut(300, function(){
				$(this).remove();
			});
		}, ht);
	};


})
