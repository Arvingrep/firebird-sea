var interCheckPay = null;
$(function(){


	if(orderstate == '0'){
		interCheckPay = setInterval(function(){
			checkPayState()
		},5000)
	}


    $('.info-block .more').click(function () {
		$('.loc_name_box').addClass('show');
		$('.info-block .xInfo_box').addClass('hide');
		$('.wInfo_box').addClass('show');
	});

	$('.info-block .more_active').click(function () {
        $('.loc_name_box').removeClass('show');
        $('.info-block .xInfo_box').removeClass('hide');
        $('.wInfo_box').removeClass('show');
    });




	$('.info-block').each(function(){
		if($(this).find('div').length == 0 && $(this).index() > 0){
			$(this).remove()
		}
	})


	//导航
  $('.header-r .screen').click(function(){
    var nav = $('.nav'), t = $('.nav').css('display') == "none";
    if (t) {nav.show();}else{nav.hide();}
  });

  (function ($) {
   $.getUrlParam = function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
   }
  })(jQuery);
   var rates = $.getUrlParam('rates');
   console.log(rates)


   // if (rates == 1) {
   //   $('.layer').addClass('show').css({"left":"0"});
   // }

  // 退款
  // $('.apply-refund-link').click(function(){
  //   var t = $(this);
  //   $('.layer').addClass('show').animate({"left":"0"},100);
  // })

  // // 隐藏退款
  // $('#typeback').click(function(){
  //   $('.layer').animate({"left":"100%"},100);
  //   setTimeout(function(){
  //     $('.layer').removeClass('show');
  //   }, 100)
  // })




	//收货
	$(".sh").bind("click", function(){
		$('.sureshmask').show();
		$('.sureshAlert').addClass('show');
	});
	//收货--确认
	$('.sureshAlert .suresh').click(function(){
		var t = $(this);
		if(t.hasClass('disabled')) return;
		t.addClass("disabled");
		$.ajax({
			url: "/include/ajax.php?service=shop&action=receipt&id="+id,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){

					t.removeClass("disabled");
					$('.sureshmask').hide();
					$('.sureshAlert').removeClass('show');
					showErrAlert('确认成功');
                    setTimeout(function(){
                        window.location.reload(true);
                    }, 1000);

				}else{
					showErrAlert(data.info);
					t.removeClass("disabled");
				}
			},
			error: function(){
				showErrAlert(langData['siteConfig'][20][183]);
				t.removeClass("disabled");
			}
		});

	})
	//收货--取消
	$('.sureshAlert .cancelsh,.sureshmask').click(function(){
		$('.sureshmask').hide();
		$('.sureshAlert').removeClass('show');
	})

	//取消订单
	$(".btn-cancel").bind("click", function(){
		$('.cancelOrmask').show();
		$('.surecanOrAlert').addClass('show');
	});
	//取消订单--确认
	$('.surecanOrAlert .surecanOr').click(function(){
		var t = $(this);
		if(t.hasClass('disabled')) return;
		t.addClass("disabled");
		$.ajax({
			url: "/include/ajax.php?service=shop&action=cancelOrder&id="+id,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){

					t.removeClass("disabled");
					showErrAlert('取消成功');
					$('.cancelOrmask').hide();
					$('.surecanOrAlert').removeClass('show');
                    setTimeout(function(){
                        location.reload();
                    }, 500);

				}else{
					showErrAlert(data.info);
					t.removeClass("disabled");
				}
			},
			error: function(){
				showErrAlert(langData['siteConfig'][20][183]);
				t.removeClass("disabled");
			}
		});

	})

	//取消订单--取消
	$('.surecanOrAlert .cancelOr,.cancelOrmask').click(function(){
		$('.cancelOrmask').hide();
		$('.surecanOrAlert').removeClass('show');
	})

	//删除订单
	$(".delOrder").bind("click", function(){
		$('.delOrmask').show();
		$('.suredelOrAlert').addClass('show');
	});
	//删除--确认
	$('.suredelOrAlert .suredelOr').click(function(){
		var t = $(this);
		if(t.hasClass('disabled')) return;
		t.addClass("disabled");
		$.ajax({
			url: "/include/ajax.php?service=shop&action=delOrder&id="+id,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){

					t.removeClass("disabled");
					$('.delOrmask').hide();
					$('.suredelOrAlert').removeClass('show');
					showErrAlert('删除成功');

				}else{
					showErrAlert(data.info);
					t.removeClass("disabled");
				}
			},
			error: function(){
				showErrAlert(langData['siteConfig'][20][183]);
				t.removeClass("disabled");
			}
		});

	})
	//删除--取消
	$('.suredelOrAlert .nodelOr,.delOrmask').click(function(){
		$('.delOrmask').hide();
		$('.suredelOrAlert').removeClass('show');
	})


	//邀请好友拼团
	$('.tuanIng .inviteTuan,.bottomOper .inviteTuan').bind("click", function(){
		$.smartScroll($('.modal-public'), '.inviting_friends');
        $('html').addClass('nos');
        $('.in_friends').addClass('curr');
        return false;
	})

	$('.inviting_img ul li').click(function(){
        var t = $(this);
         $("html, .modal-public").removeClass('curr nos');
    });
    $('.inviting_img ul li .HN_button_code').click(function(){
        $('.bgCover').css('visibility','visible');
        $('.bgCover').css('opacity','.2');
    });
 
 	var clipboardShare;
 	if(!clipboardShare){
        clipboardShare = new ClipboardJS('.HN_button_link1');
        clipboardShare.on('success', function(e) {
            alert(langData['siteConfig'][46][101]);  //复制成功
        });

        clipboardShare.on('error', function(e) {
            alert(langData['siteConfig'][46][102]); //复制失败
        });
    }
    $('.inviting_img ul li .HN_button_link1').click(function(){
        
    });
    $('.HN_PublicShare_cancel').click(function(){
        $('.bgCover').css('visibility','hidden');
        $('.bgCover').css('opacity','1');
    });
    $(".bgCover").on("click",function(){
        $("html, .modal-public").removeClass('curr nos');
    })

    // 实付款 -- 展开
    $(".sum").bind("click", function(){
    	var sch = $('.calcDiv ul').height();
    	if($(this).hasClass('curr')){
    		$(this).removeClass('curr');
    		$('.calcDiv').css('height','0');
    	}else{
    		$(this).addClass('curr');
    		$('.calcDiv').css('height','auto');
    	}

    })

  	//提交申请
	$("#submit").bind("click", function(){
		var t       = $(this),
			type    = $("#type").val(),
			content = $("#textarea").val();

		if(t.hasClass('disabled')) return;

		if(type == 0 || type == ""){

			showErrAlert(langData['siteConfig'][20][194]);
			return;
		}

		if(content == "" || content.length < 15){
			// showErrAlert(langData['siteConfig'][20][195]);
			// return;
		}

		var pics = [];
		$("#fileList li.thumbnail").each(function(){
			var val = $(this).find("img").attr("data-val");
			if(val != ""){
				pics.push(val);
			}
		});

		var data = {
			id: id,
			type: type,
			content: content,
			pics: pics.join(",")
		}

		console.log(data)
		t.addClass("disabled", true).html(langData['siteConfig'][6][35]+"...");

		$.ajax({
			url: masterDomain+"/include/ajax.php?service=shop&action=refund",
			data: data,
			type: "POST",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					// alert(langData['siteConfig'][20][193]);
					var popOptions = {
						btnCancel:'确定',
				      	title:data.info,
				      	btnColor:'#222',
				      	noSure:true,
				      	isShow:true
				    }
					confirmPop(popOptions);
					location.reload();
				}else{
					var popOptions = {
						btnCancel:'确定',
				      	title:data.info,
				      	btnColor:'#222',
				      	noSure:true,
				      	isShow:true
				    }
					confirmPop(popOptions);
					t.addClass("disabled").html(langData['siteConfig'][6][118]);
				}
			},
			error: function(){
				var popOptions = {
					btnCancel:'确定',
			      	title:langData['siteConfig'][20][183],
			      	btnColor:'#222',
			      	noSure:true,
			      	isShow:true
			    }
				confirmPop(popOptions);
				t.removeClass("disabled").html(langData['siteConfig'][6][118]);
			}
		});
	});

	//未付款 倒计时
	if($('.nopay').size()>0){
		var timer_nopay = setInterval(function(){
		    cutDownTime($('.nopay'));
		},1000) ;
	}

	//商家已发货倒计时
	if($('.hasfa').size()>0){
		var timer_hasfa = setInterval(function(){
		    cutDownTime($('.hasfa'));
		},1000) ;
	}

	//拼团中 还未成功 倒计时
	if($('.jsTime2').size()>0){
		var timer_tuanin = setInterval(function(){
		    cutDownTime($('.jsTime2'));
		},1000) ;
	}



	// 倒计时
    var eday = 3;
	// timeOffset  是服务器和本地时间的时间差
  	function cutDownTime(dom){
    	//timer = setInterval(function(){
        var end = dom.attr("data-time")*1000;  //点击的结束抢购时间的毫秒数
        var newTime = Date.parse(new Date()) - timeOffset;  //当前时间的毫秒数
        var youtime = end - newTime; //还有多久时间结束的毫秒数
        if(youtime <= 0){
        	if(dom.hasClass('hasfa')){
        		clearInterval(timer_hasfa);
        	}else if(dom.hasClass('tuanIn')){
        		clearInterval(timer_tuanin);
        	}else if(dom.hasClass('nopay')){
        		clearInterval(timer_nopay);
        	}

            return;

        }
        var seconds = youtime/1000;//秒
        var minutes = Math.floor(seconds/60);//分
        var hours = Math.floor(minutes/60);//小时
        var days = Math.floor(hours/24);//天

        var CDay= days ;
        var CHour= hours % 24 ;
        if(CDay <= eday){//3天之内的只要小时 不要天
            CHour = CHour + CDay*24;
            CDay = 0;
        }
        var CMinute= minutes % 60;
        var CSecond= Math.floor(seconds%60);//"%"是取余运算，可以理解为60进一后取余数
        var c = new Date(Date.parse(new Date()) - timeOffset);
        var millseconds=c.getMilliseconds();
        var Cmillseconds=Math.floor(millseconds %100);
        if(CSecond<10){//如果秒数为单数，则前面补零
          CSecond="0"+CSecond;
        }
        if(CMinute<10){ //如果分钟数为单数，则前面补零
          CMinute="0"+CMinute;
        }
        if(CHour<10){//如果小时数为单数，则前面补零
          CHour="0"+CHour;
        }
        if(CDay<10){//如果天数为单数，则前面补零
          CDay="0"+CDay;
        }
        if(Cmillseconds<10) {//如果毫秒数为单数，则前面补零
          Cmillseconds="0"+Cmillseconds;
        }
        if(CDay > 0){
         dom.find("span.day").html(CDay);
        }else{
        	dom.find("span.day").hide();
        	dom.find("em.speDot").hide();
        }

        dom.find("span.hour").html(CHour);
        dom.find("span.minute").html(CMinute);
        dom.find("span.second").html(CSecond);

  	//}, 1000);
  	}


  	function checkPayState(){
  		console.log(111)
  		$.ajax({
            url: '/include/ajax.php?service=member&action=tradePayResult&order='+ordernum,
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data.state == 100){
                	clearInterval(interCheckPay);
                	var location = window.location.href
                	window.location.href = location + (location.indexOf('?') > -1 ? '&currentPageOpen=1':'?currentPageOpen=1')
                }
            },
            error: function () { }
        });
  	}

  	//再次购买
  	var cartList = utils.getStorage('shopCartList');
	//限购的和没有库存的商品筛选出来
	if(cartList){
		cartList.forEach(function(cart){
			$('.shop-pro .item').each(function(){
				var maxCount = $(this).attr('data-maxcount'),detailID = $(this).attr('data-id'),dinventory = $(this).attr('data-inventory');
				if(cart.id == detailID){//购物车中存在此商品
					if(((cart.count*1 + 1)> parseInt(maxCount) && parseInt(maxCount)>0) ) {//
						$(this).addClass('overcount')
					}else if(parseInt(dinventory) <= 0){
						$(this).addClass('nokucun');
					}
				}else{//购物车中没有此商品

					if(parseInt(dinventory) <= 0){//
						$(this).addClass('nokucun');
					}
				}
			})
		})

	}else{
		$('.shop-pro .item').each(function(){
			var dinventory = $(this).attr('data-inventory');
			if(parseInt(dinventory) <= 0){//
				$(this).addClass('nokucun');
			}

		})
	}


	var allData = [];
  	$('body').delegate('.buyAgain,.againaddcart', 'click', function() {
		var $btn=$(this);

		if($btn.hasClass("disabled") || $btn.hasClass("doing")) return false;

		$btn.addClass('doing');
		setTimeout(function(){
			$btn.removeClass('doing');
		}, 200)

		var nokcHtml = [];
		var mm = 0, nn = 0;
		if($(this).hasClass('againaddcart')){//单个的加入购物车
			var itemEach = $(this).closest('.item');
		}else{//全部购买
			var itemEach = $('.shop-pro .item');
		}
		itemEach.each(function(){
			var detailTitle = $(this).attr('data-title'),detailID = $(this).attr('data-id'),detailUrl = $(this).attr('data-url'),hid = $(this).attr('data-hid'),detailspeid = $(this).attr('data-speid'),detailspecation = $(this).attr('data-specation'),detailLitpic = $(this).attr('data-litpic');

			if($(this).hasClass('nokucun')){//库存没有了
				nokcHtml.push('<div class="noproitem">');
				nokcHtml.push('<div class="noproimg"><img src="'+detailLitpic+'" alt=""></div>');
				nokcHtml.push('<div class="noproTit">'+detailTitle+'</div>');
				nokcHtml.push('</div>');
				mm++;
			}else if($(this).hasClass('overcount')){//超出限购数量
				nn++;
			}else{//可正常购买的
				var inputValue= 1;	// 购买数量
		 		var info = [];
				var t=''; //该商品的属性编码 以“-”链接个属性
				if(detailspeid && detailspecation){//有多规格时
					var despeidArr = detailspeid.split('-');
					var despecationArr = detailspecation.split('$$$');
					var shtml = [];
					for(var j = 0;j<despecationArr.length;j++){
						var speArr1 = despecationArr[j].split('：');
						shtml.push(speArr1[1])

					}

					for(var k = 0;k<despeidArr.length;k++){
						info.push(shtml[k]);
						var y=despeidArr[k];
						t=t+"-"+y;

					}
				}


				var t=t.substr(1);
				var num=1;

				//操作购物车
				var data = [];
				data.id = detailID;
				data.specation = detailspeid;
				data.count = num;
				data.title = detailTitle;
				data.url = detailUrl;
				data.hid = hid;
				allData.push(data);
			}


		})

		if(mm > 0){//存在没有库存
			$('.nobuymask').show();
			$('.nobuyAlert').addClass('show');

			if(itemEach.size() == mm){//全部没有库存
				$('.nobuyAlert .haspro').hide();
				$('.nobuyAlert .nopro').show();
			}else{
				$('.nobuyAlert .haspro').show();
				$('.nobuyAlert .nopro').hide();
			}
			$('.nobuyPro').html(nokcHtml.join(''))
		}else if(nn>0){
			if(itemEach.size() == nn){//全部限购了 -- 直接跳转购物车
				location.href = cartUrl;
			}else{
				 buyagain();
			}
		}else{//全部可买
			buyagain();
		}


	})
	//我再想想 -- 我知道了
	$('.nobuyAlert .think').click(function(){
		$('.nobuymask').hide();
		$('.nobuyAlert').removeClass('show');
	})

	//加购 -- 加购物车
	$('.nobuyAlert .addCart').click(function(){
		$('.nobuymask').hide();
		$('.nobuyAlert').removeClass('show');
		buyagain();
	})

	function buyagain(){
		for(var m = 0;m<allData.length;m++){
			shopInit.add(allData[m],1);
		}
		setTimeout(function(){showErrAlert('成功加入购物车');},1000);

		setTimeout(function(){
			location.href = cartUrl;
		},1200)
	}


	$('.popPay').bind("click", function(){

		var ordernum1 = $(this).attr('data-ordernum');

		$.ajax({
			url: masterDomain+"/include/ajax.php?service=shop&action=pay",
			type: 'post',
			data: {'ordernum':ordernum1,'orderfinal':1},
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){

					sinfo = data.info;
					service   = 'shop';
					$('#ordernum').val(sinfo.ordernum);
					$('#action').val('pay');

					$('#pfinal').val('1');
					$("#amout").text(sinfo.order_amount);
					$('.payMask').show();
					$('.payPop').css('transform', 'translateY(0)');

					if (totalBalance * 1 < sinfo.order_amount * 1) {

						$("#moneyinfo").text('余额不足，');

						$('#balance').hide();
					}

					ordernum = sinfo.ordernum;
					order_amount = sinfo.order_amount;

					payCutDown('', sinfo.timeout, sinfo);
				}else{
					var popOptions = {
						btnCancel:'确定',
				      	title:data.info,
				      	btnColor:'#222',
				      	noSure:true,
				      	isShow:true
				    }
					confirmPop(popOptions);
				}
			},
			error: function(){
				var popOptions = {
					btnCancel:'确定',
			      	title:langData['siteConfig'][20][183],
			      	btnColor:'#222',
			      	noSure:true,
			      	isShow:true
			    }
				confirmPop(popOptions);
				t.removeClass('disabled');
			}
		})
	});

	//团购订单 --查看更多
	//其他须知
    if($('.mealWrap').size() >0){
        var h1 = $('.mealWrap .mealCon').outerHeight();
        var h4 = $('.mealWrap .mealCon').css("margin-bottom").replace('px', '');
        var h3 = $('.mealWrap .buynoteCon').css("padding-bottom").replace('px', '');
        var h2 = $('.buynoteCon').outerHeight() - $('.useMust').outerHeight() - h3*1 - h4*1;
        // if(h2 > h1){
        //     $('.otNoteCon .seeOtnote').css('display','block');
        // }else{
        //     $('.otNoteCon .otNote').css('height',h2+'px');
        // }
        var allH= $('.mealBox').height();
        $('.mealWrap').css('height',h1+h2+'px');
        if($('.buynoteCon .useMust').size() > 0 || $('.mealWrap .detailBox').size() > 0 ){
        	$('.mealWrap .seeOtnote').css('display','block');
        }
        //查看更多
        $('.mealWrap .seeOtnote').click(function(){
            if(!$(this).hasClass('hst')){
                $('.mealWrap').css('height',allH+'px');
                $(this).html('收起<i></i>').addClass('hst');
            }else{
                $('.mealWrap').css('height',h1+h2+'px');
                $(this).html('更多详情<i></i>').removeClass('hst');
            }
            
        })
    }

})
