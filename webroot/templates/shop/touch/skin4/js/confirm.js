$.fn.nextAll = function (selector) {
  var nextEls = [];
  var el = this[0];
  if (!el) return $([]);
  while (el.nextElementSibling) {
    var next = el.nextElementSibling;
    if (selector) {
      if($(next).is(selector)) nextEls.push(next);
    }
    else nextEls.push(next);
    el = next;
  }
  return $(nextEls);
};
var quanUse = [], quanjianTotal = 0;
var currQuanList = [];
$(function(){

    //APP端取消下拉刷新
    toggleDragRefresh('off');

    if($('.otherInfoLi>div').size() == 0){
    	$('.otherInfoLi').hide();
	}

	if($('.address-info.empty').length >　0){
		$(".addressbox").attr('href',addressAdd)
	}else{
		$(".addressbox").attr('href',addressList)
	}

	// 修改地址时如果添加了备注 需要保存
	$(".addressbox").click(function(){
		var note = $(".shop-msg-input[name='note[]']").val();
		if(note){
			$.cookie('note',note)
		}
	});

	if($.cookie('note')){
		$(".shop-msg-input[name='note[]']").val($.cookie('note'));
		$.cookie('note',null)
	}


    var quanFlag = false;
    // 如果有会员折扣
	check_integral(totalAmount-quanjianTotal)
    //到店消费和送到家切换
    $('.confirmTab li').click(function(){
    	var t = $(this),obj = $('.shop-list-li')
    	if(!$(this).hasClass('active')){
    		$(this).addClass('active').siblings('li').removeClass('active');
    		var tindex = $(this).index();
    		$('.twoWrap .comTwo').eq(tindex).addClass('twoshow').siblings('.comTwo').removeClass('twoshow');
    		var nowPrice = $('.shop-list-li').attr('data-price');
    		var nowNum = $('.shop-info-num .num em').text();
    		var nowYunf = $('.peisongItem').attr('data-logistic');
    		function checkAuth(type){
	            var type = type == undefined ? 'discount' : type;
	            var r = {"type" : 0, "val" : 0};
	            for(var i in privilege){
	                if(i == type){
	                    r = privilege[i];
	                    break;
	                }
	            }
	            return r;
	        }
    		if(tindex == 1){//送到家
    			getLogisticPrice(t,function(data){
    				var logst = 0;
					logst = data.state == 100 &&  data.info && data.info[0].logistic ? data.info[0].logistic : 0;
					var ologst = logst;
					var free = data.state == 100 &&  data.info && data.info[0].free ? data.info[0].free : 0; //是否达到免配送费
					$('.peisongItem').attr('data-orlog',logst);
					var choseid = $(".confirmTab .active a").attr('data-id');
					if(choseid == '1'){
						logst = 0;
					}

		            var auth = checkAuth('delivery');
		            if(auth != 0 && auth[0]){

		                // 打折
		                if(auth[0].type == 'discount'){
		                    if(auth[0].val > 0 && auth[0].val < 10){
		                        auth_delivery_price = (logst * (1 - auth[0].val / 10)).toFixed(2);
		                        logst = logst - auth_delivery_price;
		                    }
		                // 计次
		                }else if(auth[0].type == 'count'){
		                    // 限次数
		                    if(auth[0].val > 0){
		                        if(userinfovip.delivery_count == 0){

		                        }else{
		                            auth_delivery_price = logst;
		                            logst = logst - auth_delivery_price;
		                        }
		                    }
		                }
		            }

		            ologst = logst;
		            if(logst > 0){
		            	$(".fn-right.rope").removeClass('fn-hide')
		            }else{
						$(".fn-right.rope").addClass('fn-hide')
		            }
		            nowYunf = $('.peisongItem').attr('data-orlog');
		            obj.find('.rope .ps_yh b').html(data.info[0].mlogistic);
					if(logst > 0){
						// var sslogt = Number(logst)*val;
						$(".logistic_errMsg").hide().siblings('.ps').show()
						var sslogt = logst;
						obj.find('.peisongItem').attr('data-logistic',parseFloat(sslogt));
						obj.find('.rope em').removeClass('fn-hide').html(echoCurrency('symbol')+parseFloat(sslogt));
					}else{
						obj.find('.peisongItem').attr('data-logistic',logst);
						if($(".logistic_errMsg").text() != '' && !free){
							$(".logistic_errMsg").show().siblings('.ps').hide()	
						}
						if(ologst == 0){
							obj.find('.rope em').removeClass('fn-hide').html(echoCurrency('symbol')+0);

						}else{
							obj.find('.rope em').removeClass('fn-hide').html(echoCurrency('symbol')+parseFloat(ologst))
						}
						
					}
	    			quanItem();
	    			//有店铺优惠 和 配送
	    			$('.peisongItem,.quan-item,.shoppayLi').show();
	    			//计算价格
	    			var nowTotprice = (Number(nowPrice*nowNum) + Number(logst)).toFixed(2);
					quanjianCount();
			      	//店铺统计完的钱
			      	var qjian = $('.quan-item').attr('data-quanjian')?$('.quan-item').attr('data-quanjian'):'0';
			      	var everyStoreprice = Number(nowTotprice) - qjian;
			      	// everyStoreprice = everyStoreprice > 0 ? everyStoreprice : 0
			      	var vipdesc = $('.vip_jian').attr('data-desc_curr');
			      	vipdesc = vipdesc ? Number(vipdesc) : 0
					var shoppriceArr = parseFloat(((everyStoreprice + Number(vipdesc)) > 0 ? (everyStoreprice + Number(vipdesc)) : 0).toFixed(2)).toString().split('.');

					$('.shoptprice strong').text(shoppriceArr[0]);
				    $('.shoptprice span').text('.'+(shoppriceArr[1]?shoppriceArr[1]:'00'));

				    check_integral(nowTotprice-quanjianTotal);
    			})
    			

    		}else{//到店消费
    			//没有优惠券 没有配送
    			$('.peisongItem,.shoppayLi').hide();
    			var nowTotprice = Number(nowPrice*nowNum).toFixed(2);
    			/*******新增s*********/ 
    			var vipdesc = $('.vip_jian').attr('data-desc_curr');
    			vipdesc = vipdesc ? Number(vipdesc) : 0
    			quanjianCount();
		      	//店铺统计完的钱
		      	var qjian = $('.quan-item').attr('data-quanjian')?$('.quan-item').attr('data-quanjian'):'0';
    			var everyStoreprice = Number(nowTotprice) - qjian;
		      	// everyStoreprice = everyStoreprice > 0 ? everyStoreprice : 0
    			var nowPriceArr = (everyStoreprice + Number(vipdesc) > 0 ? (everyStoreprice + Number(vipdesc)) : 0).toString().split('.');
    			/*******新增e*********/ 
			  	$('.shoptprice strong').text(nowPriceArr[0]);
		    	$('.shoptprice span').text('.'+(nowPriceArr[1]?nowPriceArr[1]:'00'));
		    	check_integral(nowTotprice-quanjianTotal);
    		}
    		$('.shop-item-price .shoptprice').attr('data-shopprice',nowTotprice);
    	}
    })
    if(adsid && adsid != '0'){
		$('.confirmTab li').eq(1).click()
	}else if(confirmtype == '1'){//购物车--送到家 跳转来的
    	quanItem();
    	var shoptprice = $(".footer .total-num").attr('data-totalprice')
    	check_integral(shoptprice-quanjianTotal);
    }else if(confirmtype == '0' ){//购物车--到店优惠 跳转来的
    	if(frompage == '1'){
    		$('.confirmTab li:first-child').click();
    	}
    	
    }else if( confirmtype == '2'  || frompage == '1'){//商品详情页-- 跳转来的
    	$('.confirmTab li:first-child').click();
    }


    // if(confirmtype == 2 || frompage == '1' || frompage == '2' ){
    // 	$('.confirmTab li:first-child').click();
    // }else if(confirmtype == 1){//购物车--送到家 跳转来的
    // 	quanItem();
    // }

    var speCart = $('.speCart')
    //购物车加减
    var dflag =1;
	//数量增加、减少
	$('.rec').click(function(){
		var t = $(this).closest('.shop-list-li');
		if($(this).hasClass('unclick')){
			return false;
		}
		if($(this).hasClass('disabled')){

			showMsg(langData['shop'][6][28]);
			return false;
		}
		t.find('.append').removeClass('disabled');
		//2021-9-13 增加最小起订量和每次装箱数量
		//每次装箱数量
		var eachcout = $(this).closest('.shop-info-num').attr('data-eachcout');
		var mincout = $(this).closest('.shop-info-num').attr('data-mincout');//最小起订量
		var li = t.closest('.cart-list')
		var val = Number($(this).siblings('.num').find('em').html());
		val = (val-eachcout*1)<mincout?mincout:(val-eachcout*1);
		$(this).siblings('.num').find('em').html(val);
		
		checkCount(t,'',$(this));
		var num = $(this).siblings('.num').find('em').text()
		$(".totNum").html('共'+num+'件,')
		li.find('.shop-item-price label').html('共'+num+'件')
		t.find('.shop-info-price .num').html('x'+Number($(this).siblings('.num').find('em').html()))
		//操作相应的商品
		if(dflag){
			var id=t.attr("data-id");
			var spe=t.attr("data-specation");
			speCart.find('li').each(function(){
				var tl = $(this), tid = tl.attr('data-id'), tspe = tl.attr('data-specation');
				if(tid == id && tspe == spe){
					tl.attr("data-count", val);
				}
			})
			//shopInit.update();
		}

	})
	var flag =1;
	$('.append').click(function(){
		var t = $(this).closest('.shop-list-li');
		var sid = t.closest('.cart-list').attr('data-id');
		if($(this).hasClass('disabled')){
			showMsg(langData['shop'][2][13]);//不能再多啦
			return false;
		}

		t.find('.rec').removeClass('disabled');
		//2021-9-13 增加最小起订量和每次装箱数量
		//每次装箱数量
		var eachcout = $(this).closest('.shop-info-num').attr('data-eachcout');
		var mincout = $(this).closest('.shop-info-num').attr('data-mincout');//最小起订量
		var li = t.closest('.cart-list')
		var val = Number($(this).siblings('.num').find('em').html());
		val = val+eachcout*1;
		$(this).siblings('.num').find('em').html(val);
		
		checkCount(t,1,$(this));
		t.find('.shop-info-price .num').html('x'+Number($(this).siblings('.num').find('em').html()))
		var num = $(this).siblings('.num').find('em').text()
		$(".totNum").html('共'+num+'件,')
		li.find('.shop-item-price label').html('共'+num+'件')
		//操作相应的商品
		if(flag){
			val = Number($(this).siblings('.num').find('em').html());
			var id=t.attr("data-id");
			var spe=t.attr("data-specation");
			speCart.find('li').each(function(){
				var tl = $(this), tid = tl.attr('data-id'), tspe = tl.attr('data-specation');
				if(tid == id && tspe == spe){
					tl.attr("data-count", val);
				}
			})
			//shopInit.update();
		}

	})
    // 错误提示
	function showMsg(str){
	  var o = $(".error");
	  o.html('<p>'+str+'</p>').css('display','block');
	  setTimeout(function(){o.css('display','none')},1000);
	}
	//验证数量
	function checkCount(obj, t , click){
		flag = 1;
		var count = obj.find(".num em"), val = Number(count.html());
		var plus = obj.find('.append'),desc = obj.find('.rec');

		//2021-9-13 增加最小起订量和每次装箱数量
		//每次装箱数量
		var eachcout = obj.find('.shop-info-num').attr('data-eachcout');
		var mincout = obj.find('.shop-info-num').attr('data-mincout');//最小起订量
		var id = obj.data("id"),
			price = Number(obj.data("price")),
			oprice = Number(obj.data("oprice")),
			maxCount = Number(obj.data("limit"));
			inventor = Number(obj.data("inventor"));
		//数量是最小起订量 时就变灰
		if(val < (mincout*1 + eachcout*1)){
			if(val == mincout*1){
				desc.addClass('disabled');
			}

			//最小
			if(val<mincout*1){
				count.html(mincout*1);
				val = mincout*1;
				dflag = 0;

			}
		//最大
		}else if(val > maxCount && maxCount != 0){
			count.html(maxCount);
			val = maxCount;
			showMsg(langData['shop'][2][13]);//不能再多啦
			plus.addClass('disabled');
			//flag = 0;


		//超出库存
		}else if((val >= inventor && !t) || (val > inventor && t)){

			count.html(inventor);
			val = inventor;
			showMsg(langData['shop'][2][13]);

		}else{
			// $('#errmsg').remove();
		}
		if($(".shop-info-num").length){
			var count = $(".shop-info-num .num em").text();	
				var pros = $("#pros").val();
				var prosArr = pros.split(',');
				prosArr[prosArr.length-1] = count;
				$("#pros").val(prosArr.join(','))
		}

    
        function checkAuth(type){
            var type = type == undefined ? 'discount' : type;
            var r = {"type" : 0, "val" : 0};
            for(var i in privilege){
                if(i == type){
                    r = privilege[i];
                    break;
                }
            }
            return r;
        }

		//运费
		

		getLogisticPrice(click,function(data){     //click表示当前点击的按钮
			//计算价格
			var logst = 0;
			logst = data.state == 100 &&  data.info && data.info[0].logistic ? data.info[0].logistic : 0;
			var ologst = logst;
			var free = data.state == 100 &&  data.info && data.info[0].free ? data.info[0].free : 0; //是否达到免配送费
			$('.peisongItem').attr('data-orlog',logst);
			var choseid = $(".confirmTab .active a").attr('data-id');
			if(choseid == '1'){
				logst = 0;
			}

            var auth = checkAuth('delivery');
            if(auth != 0 && auth[0]){

                // 打折
                if(auth[0].type == 'discount'){
                    if(auth[0].val > 0 && auth[0].val < 10){
                        auth_delivery_price = (logst * (1 - auth[0].val / 10)).toFixed(2);
                        logst = logst - auth_delivery_price;
                    	$(".ps_yh ").removeClass('fn-hide')

                    }else{
                    	$(".ps_yh ").addClass('fn-hide')
                    }
                // 计次
                }else if(auth[0].type == 'count'){
                    // 限次数
                    if(auth[0].val > 0){
                        if(userinfovip.delivery_count == 0){
                   			 $(".ps_yh ").addClass('fn-hide')

                        }else{
                            auth_delivery_price = logst;
                            logst = logst - auth_delivery_price;
                    		$(".ps_yh ").removeClass('fn-hide')

                        }
                    }
                }

            }

            ologst = logst;
			if(logst > 0){
            	$(".fn-right.rope").removeClass('fn-hide')
            }else{
				$(".fn-right.rope").addClass('fn-hide')
            }


            var smallCount = $(".shop-info-num").attr('data-mincout')
			var shopprice = Number(price * val) + logst * 1;
			var oshopprice = Number(oprice * val) + logst * 1;
			$('.shop-item-price .shoptprice').attr('data-shopprice',shopprice);
			$('.quan-item').attr('data-total',shopprice - logst * 1);
			if(data.info && data.info[0].quanarr && data.info[0].quanarr.length){
				quanItem(data.info[0].quanarr)
				currQuanList = data.info[0].quanarr
			}else{
				$(".quan-item").addClass('fn-hide').attr('data-quanjian','').attr('data-quanid','')
			}
			obj.find('.rope .ps_yh b').html(data.info[0].mlogistic);
			if(logst > 0){
				// var sslogt = Number(logst)*val;
				$(".logistic_errMsg").hide().siblings('.ps').show()
				var sslogt = logst;
				obj.find('.peisongItem').attr('data-logistic',parseFloat(sslogt));
				obj.find('.rope em').removeClass('fn-hide').html(echoCurrency('symbol')+parseFloat(sslogt));
			}else{
				obj.find('.peisongItem').attr('data-logistic',logst);
				if($(".logistic_errMsg").text() != '' && !free){
					$(".logistic_errMsg").show().siblings('.ps').hide()	
				}
				if(ologst == 0){
					obj.find('.rope em').removeClass('fn-hide').html(echoCurrency('symbol')+0);

				}else{
					obj.find('.rope em').removeClass('fn-hide').html(echoCurrency('symbol')+parseFloat(ologst))
				}
				
			}

			
			// var shopprice = Number(price * val) + Number(logst)*val;
		
			//黄金会员折扣
			var vipdesc = $('.vip_jian').attr('data-desc');
			vipdesc = vipdesc ? vipdesc : 0 ; 
			var vipdesc1 = Number(vipdesc / smallCount * val).toFixed(2);
			var vipdescArr = vipdesc1.toString().split('.');
			$('.vip_jian strong').text(vipdescArr[0]);
		    $('.vip_jian span').text('.'+vipdescArr[1]);
		    $('.vip_jian').attr('data-desc_curr',vipdesc1)
			quanjianCount();
	      	//店铺统计完的钱
	      	var qjian = $('.quan-item').attr('data-quanjian');
	      	qjian = qjian ? qjian : 0;
	      	var everyStoreprice = Number(oshopprice) - qjian -vipdesc1;
	      	// everyStoreprice = everyStoreprice > 0 ? everyStoreprice : 0;

			var shoppriceArr = parseFloat(((everyStoreprice *1 + vipdesc1 * 1) > 0 ? (everyStoreprice *1 + vipdesc1 * 1) : 0).toFixed(2)).toString().split('.');
		    $('.shoptprice strong').text(shoppriceArr[0]);
		    $('.shoptprice span').text('.'+(shoppriceArr[1]?shoppriceArr[1]:'00'));

		    check_integral(shopprice-qjian);


		}); 

		
	}


	// 获取运费
	function getLogisticPrice(t,func){
		if(t.hasClass('noClick')) return false;
		var sid = t.closest('.cart-list').attr('data-id')
		t.addClass('noClick')
		var pros = $("#pros").val();
		var addressid = $("#address").val();
		var data = [];
		data.push('addressid='+addressid)
		data.push('pros='+pros)
		data.push('sid='+sid)
		var confirmTo = confirmtype == 2 ? $(".confirmTab li.active").index() : confirmtype;
		$.ajax({
	      url: '/include/ajax.php?service=shop&action=getLogisticPrice&confirmtype='+confirmTo,
	      data: data.join('&'),
	      type: "POST",
	      dataType: "json",
	      success: function (data) {
	      	t.removeClass('noClick')
	      	// 运费改变  配送方式也可能改变
	        if(data.state == 100){
	        	let psname = '';
	        	if(data.info[0].logistictype == 0){
	        		psname = '普通快递'
	        	}else if(data.info[0].logistictype == 1){
					psname = '商家配送'
	        	}else if(data.info[0].logistictype == 2){
	        		psname = '平台配送'
	        	}
	        	if(psname){
	        		$(".midDesc .ps").text(psname)

	        	}

	        }
	        func(data)
	        
	      },
	      error: function(){
	      	t.removeClass('noClick')
	      }
	    });
	}



    // 选择优惠券
  	$(".quseList").delegate('li','click',function(){
	    $(this).addClass('chosed').siblings('li').removeClass('chosed');
	    var quanid = $(this).attr('data-id');
	    var quantype = $(this).attr('data-type');
	    var qjian = $(this).attr('data-jian');
	    var quankey = $('.quan_pop').attr('data-quankey');
	    var that = $(".quan-item[data-quankey='"+quankey+"']");
	    var shoptotal = that.attr('data-total');
	    var everyStoreprice = that.closest('.cart-list').find('.shoptprice').attr('data-shopprice');
	     // 确定选择
	    $(".btn_sure").off('click').click(function(){
	      	$(".quan_mask").click();
	      	that.find(".quan_touse").addClass('fn-hide').siblings().removeClass('fn-hide');

	      	that.attr('data-qid',quanid).attr('data-qjian',Number(qjian).toFixed(2))

	      	that.find(".quan_use").html('-'+echoCurrency('symbol') + Number(qjian).toFixed(2));
	      	var qintxt = "商城通用券";
		    if(quantype == '0'){
				qintxt  = "店铺通用券";
			}else if(quantype == '1'){
				qintxt  = "指定商品";

			}
			
			qjian = parseFloat(Number(qjian).toFixed(2))
	      	that.attr('data-quanjian',qjian);
	      	that.attr('data-qjian',qjian);

	      	let realQuanUse = qjian > shoptotal ? shoptotal : qjian; //实际优惠券减免的金额
	      	var quanjianArr = realQuanUse.toString().split('.');

	      	// var quanjianArr = qjian.toString().split('.');
	      	that.find('.qdprice').show();
	      	that.find('.quanNochose').hide();
	      	that.find('.qdprice strong').text(quanjianArr[0])
		    that.find('.qdprice span').text('.'+(quanjianArr[1]?quanjianArr[1]:'00'))
		    that.find('.midDesc').html('省'+qjian+echoCurrency('short')+':'+qintxt);
		    that.attr('data-quanid',quanid);

	      	quanjianCount();
	      	//店铺统计完的钱
	      	everyStoreprice = Number(everyStoreprice) - qjian;
	      	var vipdesc = $('.vip_jian').attr('data-desc_curr');
      			vipdesc = vipdesc ? Number(vipdesc) : 0
			var shoppriceArr = parseFloat(((everyStoreprice + vipdesc) > 0 ? (everyStoreprice + vipdesc) : 0 ).toFixed(2)).toString().split('.');
		    that.closest('.cart-list').find('.shoptprice strong').text(shoppriceArr[0]);
		    that.closest('.cart-list').find('.shoptprice span').text('.'+(shoppriceArr[1]?shoppriceArr[1]:'00'));

            everyStoreprice = everyStoreprice > 0 ? everyStoreprice : 0;

		  	if(confirmtype == 2){//详情页进来的 数量可改变的
		  		check_integral(everyStoreprice)
		  	}else{//购物车过来的
		  		check_integral(totalAmount-quanjianTotal)
		  	}

	    });
  	});
  	function quanItem(quanlist){
  		if(quanFlag) return false;
  		quanFlag = true;
	  	if ($(".quan-item").size()>0){
	    	$('.quan-item').each(function(){
	    		var everyStoreprice = $(this).closest('.cart-list').find('.shoptprice').attr('data-shopprice');
	    		var quankey   = $(this).attr('data-quankey');
			  	var quanid  = $(this).attr('data-qid');
			  	var shoptotal 	= $(this).attr('data-total');
		    	var quancount = noquancount =  0;
			  	var carlistarr = JSON.parse(carlist);
				  quancount = carlistarr[quankey] &&  carlistarr[quankey].quanarr ?  carlistarr[quankey].quanarr.length : 0;
				  noquancount = carlistarr[quankey] &&  carlistarr[quankey].noquanarr ? carlistarr[quankey].noquanarr.length : 0;
				 if(quanlist){
				 	quancount = quanlist.length;
				 	$(".quan-item").removeClass('fn-hide')
				 }
				if(quancount!=0){
				  	var quanhtml = [];
				  	var quanmoney = quantype = '';

					var quanarr 	= carlistarr[quankey].quanarr;
					var noquanarr 	= carlistarr[quankey].noquanarr;
					if(quanlist){
						quanarr = quanlist;
					}
					var canQuanM = [];
					console.log(shoptotal)
				  	for(var i = 0; i <quanarr.length; i++){
				  		var canQuanJ = quanarr[i].promotiotype == '0' ? quanarr[i].promotio : (shoptotal - shoptotal * quanarr[i].promotio / 10);
				  		canQuanJ = Number(canQuanJ).toFixed(2);
						canQuanM.push(Number(canQuanJ))

					}
				    //算出可用优惠券的最大值
				    var quanJianMoney = Math.max.apply(null,canQuanM);
				    // if(quanJianMoney > shoptotal){ //新增:当优惠券大于店铺商品总价时，优惠金额是店铺商品总价格
				    // 	quanJianMoney = shoptotal
				    // }
				    quanJianMoney = parseFloat(Number(quanJianMoney).toFixed(2))
				    $(this).attr('data-quanjian',quanJianMoney);
				    let realQuanUse = quanJianMoney > shoptotal ? shoptotal : quanJianMoney; //实际优惠券减免的金额
	      			var quanjianArr = realQuanUse.toString().split('.');

				    // var quanjianArr = quanJianMoney.toString().split('.');
				    var qindex = canQuanM.indexOf(quanJianMoney);//最大值是第几个优惠券
				    var qintxt = "指定商品";
					if(quanarr[qindex].bear == '1'){
						qintxt = "商城通用券";
					}
				    if(quanarr[qindex].quantype ==0){
						qintxt  = "店铺通用券";
					}

				    $(this).find('.qdprice strong').text(quanjianArr[0])
				    $(this).find('.qdprice span').text('.'+(quanjianArr[1]?quanjianArr[1]:'00'))
				    $(this).find('.midDesc').html('省'+quanJianMoney+echoCurrency('short')+':'+qintxt);
				    $(this).attr('data-quanid',quanarr[qindex].id);
				    quanjianCount();
				    everyStoreprice = Number(everyStoreprice) - quanJianMoney;
				    // everyStoreprice = everyStoreprice > 0 ? everyStoreprice : 0;
				    // var vipdesc = $('.vip_jian').attr('data-desc_curr');  // 原先计算方法有误 忽略多个店铺的情况
                    // vipdesc = vipdesc ? Number(vipdesc) : 0


				    var everyStoreVipjian = $(this).closest('.cart-list').find('.shoptprice').attr('data-vipjian');
                    vipdesc = everyStoreVipjian ? Number(everyStoreVipjian) : 0; //新增 单个计算每个店铺会员折扣

				    var shoppriceArr = parseFloat(((everyStoreprice + vipdesc) > 0 ? (everyStoreprice + vipdesc) : 0).toFixed(2)).toString().split('.')
				    $(this).closest('.cart-list').find('.shoptprice strong').text(shoppriceArr[0])
				    $(this).closest('.cart-list').find('.shoptprice span').text('.'+(shoppriceArr[1]?shoppriceArr[1]:'00'));
				    quanFlag = false;

				}
	    	})

		}
  	}


  	//弹出优惠券
  	$(".quan-item").click(function(){
    	$('.quan_mask').show();
		
	 
    	$(".quan_pop").css('transform','translateY(0)');
    	checkQuan($(this),'',currQuanList)
  	});

  	
  	$('.quan-item').each(function(){
  		var t = $(this)
  		checkQuan(t,1)
  	})
  function checkQuan(t,click){
  		var quankey   = t.attr('data-quankey');
		var quanid  = t.attr('data-qid');
		var quanjian  = t.attr('data-quanjian');
		var shoptotal 	= t.attr('data-total');
		$(".quan_pop").attr('data-quankey',quankey);
  	 	var quancount = noquancount =  0;
	  	var carlistarr = JSON.parse(carlist);
	  	if(carlistarr[quankey] && carlistarr[quankey].quanarr){
	  		 quancount = carlistarr[quankey].quanarr.length;
	  	}
	  	if(carlistarr[quankey] && carlistarr[quankey].noquanarr){
	  		noquancount = carlistarr[quankey].noquanarr.length;
	  	}

		 if(currQuanList && currQuanList.length > 0){
		 	quancount = currQuanList.length
		 }
		  
		  $("#quan").text(quancount);
		  $("#noquan").text(noquancount);

		if(quancount!=0){
		  	var quanhtml = [];
		  	var quanmoney = quantype = '';

			var quanarr 	= carlistarr[quankey].quanarr;
			var noquanarr 	= carlistarr[quankey].noquanarr;

			if(currQuanList && currQuanList.length > 0){
			 	quanarr = currQuanList
			 }
		  	for(var i = 0; i <quanarr.length; i++){
		  		var basicPrice = parseFloat(quanarr[i].basic_price);  //使用门槛
		  		var quantext = basicPrice > 0 ? '满'+basicPrice : '无门槛';
		  		if(quanarr[i].promotiotype ==0){
					quanmoney  = echoCurrency('symbol')+'<b>'+parseFloat(quanarr[i].promotio)+'</b>';
					quantext = quantext +'减'+ parseFloat(quanarr[i].promotio) 
				}else{
					quanmoney  = '<b>'+parseFloat(quanarr[i].promotio)+"</b>折";
					quantext = quantext + (basicPrice > 0 ? '打' : '') + parseFloat(quanarr[i].promotio) +'折'
				}
		  		var canQuanJ = quanarr[i].promotiotype == '0' ? quanarr[i].promotio : (shoptotal - shoptotal * quanarr[i].promotio / 10);

		  		var clsname = quanid == quanarr[i].id?'chosed':''
		  		var quanName = quanarr[i].bear === '1' ? 'platformQuan':''
				quanhtml.push('<li class="quan '+clsname +' '+ quanName +'" data-id="'+quanarr[i].id+'" data-money="'+quanarr[i].promotio+'" data-type="'+(quanarr[i].bear === '1' ? 2 : quanarr[i].quantype)+'" data-promotio="'+quanarr[i].promotiotype+'" data-jian="'+Number(canQuanJ)+'">');
				if(quanarr[i].bear === '1'){
					quantype  = "商城通用券";
				}else{

					if(quanarr[i].quantype ==0){
						quantype  = "店铺通用券";
					}else{
						quantype  = "指定商品";
					}
				}


		  		quanhtml.push('<div class="q_amount">'+quanmoney+'</div>');
		  		quanhtml.push('<div class="q_info"><h4>'+quantext+'</h4><span class="lab">'+quantype+'</span><p>'+huoniao.transTimes(quanarr[i].etime,2)+'到期</p></div></li>');

			}
		    $('.quseList').html(quanhtml.join(''));
		    if(quanjian){
		    	$('.quseList li[data-jian="'+quanjian+'"]').click();
	    	}else if(click){
	    		
	    		$('.quseList li').eq(0).click();
	    		$(".btn_sure").click()
	    	}
		   

		}
  }

  	// 隐藏优惠券
  	$('.quan_mask').click(function(){
    	$('.quan_mask').hide();
    	$(".quan_pop").css('transform','translateY(9.5rem)');
  	});
  	// 不使用优惠券
	$('.quan_pop .noUse').click(function(){
	    $('.quan_mask').hide();
	    $(".quan_pop").css('transform','translateY(9.5rem)');
	    $(".quseList li").removeClass('chosed');
	    var quankey = $('.quan_pop').attr('data-quankey');
	    var that = $(".quan-item[data-quankey='"+quankey+"']");
	    var everyStoreprice = Number(that.closest('.cart-list').find('.shoptprice').attr('data-shopprice'));
	    that.find(".quan_touse").removeClass('fn-hide').siblings().addClass('fn-hide');
	    that.find(".quan_use").html('');
		that.removeAttr('data-qid').removeAttr('data-qjian');

		that.find('.qdprice').hide();
		that.find('.quanNochose').show();
	    that.find('.midDesc').html('');
	    that.removeAttr('data-quanid').removeAttr('data-quanjian');

      	quanjianCount();
      	//店铺统计完的钱
      	var vipdesc = Number($('.vip_jian').attr('data-desc_curr'));
      	vipdesc = vipdesc ? vipdesc : 0

		var shoppriceArr = parseFloat((Number(everyStoreprice + Number(vipdesc)) > 0 ? Number(everyStoreprice + Number(vipdesc))  : 0).toFixed(2)).toString().split('.');
	    that.closest('.cart-list').find('.shoptprice strong').text(shoppriceArr[0]);
	    that.closest('.cart-list').find('.shoptprice span').text('.'+(shoppriceArr[1]?shoppriceArr[1]:'00'));

	    if(confirmtype == 2){//详情页进来的 数量可改变的
	  		check_integral(everyStoreprice-quanjianTotal)
	  	}else{//购物车过来的
	  		check_integral(totalAmount-quanjianTotal)
	  	}
	})

	

	$('.jfdi').click(function(){
	 	$('.jifMask').show();
	    $(".jf_pop").css('transform','translateY(0)');
	})
	$('.jifMask').click(function(){
	 	$('.jifMask').hide();
	    $(".jf_pop").css('transform','translateY(100%)');
	})
	$('.jf_pop li').click(function(){
		$('.jf_pop ul li .gou').removeClass('hasgou');
		$(this).find('.gou').addClass('hasgou');
		$('.jf_pop .jfsure a').click()
	})
	//使用积分确认
	$('.jf_pop .jfsure a').click(function(){
		$('.jifMask').hide();
	    $(".jf_pop").css('transform','translateY(100%)');

	    var total = $(".jf_pop").attr('data-total')
	    check_integral(total)  //商品数量变化
	    // if($(".nousejf .gou").hasClass('hasgou')){
	    // 	console.log('11111')
	    // 	var integral_jian = Number($(".integral .jian").text()) / jifen_ * 100 ;
	    // 	integral_jian = integral_jian.toFixed(2);
	    // }else{
	    // 	var total = $(".jf_pop").attr('data-total')
	    	
	    // }
	    
		 
		
	})


	//计算优惠券减价
	function quanjianCount(){
	    quanUse = [],quanjianTotal=0
	    $(".cart-list").each(function(){
	      var t = $(this);
	      var sid = t.attr('data-id'); //店铺id;
	      var quan = t.find('.quan-item')

	      if(quan.size() > 0){
	        if(quan.attr('data-quanid')){//第一次进页面时
	        	quanUse.push({
		            'shopid': sid,
		            'quanid': quan.attr('data-quanid')
	          	});
	          	let qjian = Number(quan.attr('data-quanjian'))
	          	let total = Number(quan.attr('data-total'))
	          	quanjianTotal = quanjianTotal + (qjian > total ? total : qjian);
	        }else  if(quan.attr('data-qid')){
	          quanUse.push({
	            'shopid': sid,
	            'quanid': quan.attr('data-qid')
	          });
	          let qjian = Number(quan.attr('data-qjian'))
	          let total = Number(quan.attr('data-total'))
	          quanjianTotal = quanjianTotal + (qjian > total ? total : qjian);
	        }
	      }
	    })
	}

	function check_integral(priceAll){
        priceAll = parseFloat(priceAll).toFixed(2);
		$(".jf_pop").attr('data-total',priceAll);
		if(priceAll > 990000){
			$(".total-num").addClass('verAlign')
		}else{
			$(".total-num").removeClass('verAlign')
		}
		priceAll= priceAll > 0 ? priceAll : 0
		var priceAllArr = priceAll.toString().split('.');
		  $(".footer .total-num .totPrice strong").html(priceAllArr[0]);

		  $(".footer .total-num .totPrice span").html('.'+(priceAllArr[1]?priceAllArr[1]:'00'));
	    if(hasPoint <= 0) return false;
	  	jifen_di = parseInt(jifen_ * priceAll * pointRatio / 100 );
	    jifen_di = hasPoint <= jifen_di ? hasPoint * 1  : jifen_di;
	    jifen_di = Number(jifen_di);
	    jian = parseFloat((jifen_di / pointRatio ).toFixed(2));
	    // console.log(jifen_di)
	  	$(".integral .jifen").html(parseFloat(jifen_di.toFixed(2))) ;
	  	$(".integral .jian").html(parseFloat(jian.toFixed(2))) ;
	  	var jianArr = (parseFloat(jian.toFixed(2))).toString().split('.')
	  	$('.jfdi .jianPrice .jian strong').text(jianArr[0]);
      if(jianArr[1]){
        $('.jfdi .jianPrice .jian span').text('.'+jianArr[1]);
      }else{
      	$('.jfdi .jianPrice .jian span').text('');
      }

	  	if(jifen_di == 0 || jian == 0){
	  		$(".jfdi").hide();
	  	}else{
	  		$(".jfdi").show();
	  	}

	  	if($(".integral .gou").hasClass('hasgou')){//使用积分
	  		$('.jfdi .jianPrice').show();
	  		$('.jfdi .jfright').hide();

	  		$('.ac_show em').html(parseFloat((priceAll-jian).toFixed(2)));
	  		$('.count_fee em').html(parseFloat((priceAll-jian).toFixed(2)));
	  		var allPrice = parseFloat((priceAll-jian).toFixed(2));
	  	}else{//不使用积分
	  		var allPrice = parseFloat(priceAll).toFixed(2);
	  		$('.jfdi .jianPrice').hide();
	  		$('.jfdi .jfright').show();
	  	}
	  	allPrice = allPrice > 0 ? allPrice : 0
		  var allPriceArr = allPrice.toString().split('.');
		  $(".footer .total-num .totPrice strong").html(allPriceArr[0]);

		  $(".footer .total-num .totPrice span").html('.'+(allPriceArr[1]?allPriceArr[1]:'00'));

	  	if((priceAll-jian).toFixed(2) == 0){
			$(".account-btn.r .submit").html(langData['siteConfig'][23][113]); //立即支付
		}
	}




  	// 切换
  	$('.qtab_box a').click(function(){
	    var t = $(this), ind = t.index();
	    t.addClass('on_tab').siblings('a').removeClass('on_tab');
	    if(!ind){
	      $('.qnouseListBox').addClass('fn-hide').siblings('div').removeClass('fn-hide')
	    }else{
			var carlistarr = JSON.parse(carlist);
			var quankey   = $('.quan_pop').attr('data-quankey');
			noquancount = carlistarr[quankey].noquanarr.length;
			if(noquancount!=0){
				var quanhtml = [],quanhtml1 = [];
				var quanmoney = quantype = nousetype = '';

				var noquanarr 	= carlistarr[quankey].noquanarr;
				var num_noQuan = 0
				var now = Math.round(new Date() / 1000); //没过期的券显示
				console.log(noquanarr)
				for(var i = 0; i <carlistarr[quankey].noquanarr.length; i++){
					var quanid = noquanarr[i].id;
					var basicPrice = parseFloat(noquanarr[i].basic_price);  //使用门槛
			  		var quantext = basicPrice > 0 ? '满'+basicPrice+'': '无门槛';
					if($(".quseListBox .quan[data-id='"+quanid+"']").length == 0){
						num_noQuan = num_noQuan + 1;

						if(noquanarr[i].promotiotype ==0){
							quanmoney  = parseFloat(noquanarr[i].promotio);
							quantext = quantext +'减'+ parseFloat(noquanarr[i].promotio) 
						}else{
							quanmoney  = parseFloat(noquanarr[i].promotio)+"折";
							quantext = quantext +(basicPrice > 0 ? '打' : '')+ parseFloat(noquanarr[i].promotio) +'折'
						}
						if(noquanarr[i].bear === '1'){
							quantype = '商城通用券'
						}else{
							if(noquanarr[i].quantype != '1'){
								quantype  = "店铺通用券";
							}else{
								quantype  = "指定商品";
							}
						}
						
						if(noquanarr[i].nousetype ==1){
							nousetype = '该券不支持使用';
						}else{
							nousetype = '此券需满'+noquanarr[i].basic_price+'元使用';
						}
						quanhtml.push('<li class="quan" data-money="'+quanmoney+'">');
						quanhtml.push('<div class="q_amount">'+echoCurrency('symbol')+'<b>'+quanmoney+'</b></div>');
						quanhtml.push('<div class="q_info"><h4>'+quantext+'</h4><span class="lab">'+quantype+'</span><p>'+huoniao.transTimes(noquanarr[i].etime,2)+'到期</p><p class="tip_no">'+nousetype+'</p></div></li>');
					}
				}
				$("#noquan").text(num_noQuan)
				$('.qnouseListBox ul').html(quanhtml.join(''));
			}

	      $('.quseListBox').addClass('fn-hide').siblings('div').removeClass('fn-hide')

	    }
  	})



	//支付方式弹窗
	$('.shoppayLi.morePay').click(function(){
	 	$('.zhifMask').show();
	    $(".zhif_pop").css('transform','translateY(0)');
	})

	$('.zhifMask').click(function(){
	 	$('.zhifMask').hide();
	    $(".zhif_pop").css('transform','translateY(100%)');
	})
	$('.zhif_pop li').click(function(){
		$(this).addClass('chose').siblings('li').removeClass('chose');
		$('.zhif_pop ul li .gou').removeClass('hasgou');
		$(this).find('.gou').addClass('hasgou');
		$('.zhif_pop .zhifsure a').click()
	})
	//支付方式确认
	$('.zhif_pop .zhifsure a').click(function(){
		$('.zhifMask').hide();
	    $(".zhif_pop").css('transform','translateY(100%)');
		var zfindex = $('.zhif_pop li.chose').index();
		var zftxt = $('.zhif_pop li.chose em').text();
		var zftype = $('.zhif_pop li.chose a').attr('data-type');
		$('.shoppayt span').text(zftxt);
		$('#payway').val(zftype);
		if(zfindex == 0){//在线支付
			$('.footer .account-btn a.shareTo').show();
			$(".otherInfoLi .jfdi").removeClass('fn-hide').show()
			$(".integral").click()
		}else{//货到付款
			$('.footer .account-btn a.shareTo').hide();
			$(".otherInfoLi .jfdi").addClass('fn-hide').hide();
			$(".nousejf").click()
		}
	})

	//配送方式弹窗
	// $('.peisongItem').click(function(){
	// 	var logitxt = $(this).attr('data-logistic');
	// 	if(logitxt == 0){
	// 		$('.ps_pop ul li .psspan').html('快递免邮');
	// 	}else{
	// 		$('.ps_pop ul li .psspan').html('快递'+echoCurrency('symbol')+logitxt);
	// 	}
	//  	$('.psMask').show();
	//     $(".ps_pop").css('transform','translateY(0)');
	// })

	// $('.psMask,.pssure').click(function(){
	//  	$('.psMask').hide();
	//     $(".ps_pop").css('transform','translateY(100%)');
	// })


	//计算最多可用多少个积分
	if(totalPoint > 0 && totalCoupon > 0){

		var pointMoney = totalPoint / pointRatio, cusePoint = totalPoint;

		//填充可使用的最大值
		$("#cusePoint").html(cusePoint.toFixed(2));
		// $("#usePcount").val(cusePoint.toFixed(2));
		$("#disMoney").html(cusePoint / pointRatio);
	}



	var anotherPay = {

		//使用积分
		usePoint: function(){
			// $("#usePcount").val(cusePoint.toFixed(2));  //重置为最大值

			//判断是否使用余额
			if($("#useBalance").attr("checked")){
				this.useBalance();
			}
		}

		//使用余额
		,useBalance: function(){

			var balanceTotal = totalBalance;

			//判断是否使用积分
			if($("#usePinput").attr("checked")){

				// var pointSelectMoney = Number($("#usePcount").val()) / pointRatio;
				// //如果余额不够支付所有费用，则把所有余额都用上
				// if(totalAmount - pointSelectMoney < totalBalance){
				// 	balanceTotal = totalAmount - pointSelectMoney;
				// }

			//没有使用积分
			}else{

				//如果余额大于订单总额，则将可使用额度重置为订单总额
				if(totalBalance > totalAmount){
					balanceTotal = totalAmount;
				}

			}

			balanceTotal = balanceTotal < 0 ? 0 : balanceTotal;
			balanceTotal = balanceTotal.toFixed(2);
			cuseBalance = balanceTotal;
			$("#useBcount").val(balanceTotal);
			// $("#balMoney, #cuseBalance").html(balanceTotal);  //计算抵扣值
		}

		//重新计算还需支付的值
		,resetTotalMoney: function(){

			var totalPayMoney = totalAmount, usePcountInput = Number($("#usePcount").val()), useBcountInput = Number($("#useBcount").val());

			if($("#usePinput").attr("checked") && usePcountInput > 0){
				totalPayMoney -= usePcountInput / pointRatio;
			}
			if($("#useBalance").attr("checked") && useBcountInput > 0){
				totalPayMoney -= useBcountInput;
			}

			$("#totalPayMoney").html(totalPayMoney.toFixed(2));

			if(totalPayMoney <= 0){
				$(".btmCartWrap .submit").val(langData['shop'][1][7]);
			}else{
				$(".btmCartWrap .submit").val(langData['shop'][1][8]);
			}
		}

	}


	//使用积分抵扣/余额支付
	$("#usePinput, #useBalance").bind("click", function(){
		var t = $(this), ischeck = t.attr("checked"), type = t.attr("name");

		//积分
		if(type == "usePinput"){

			//确定使用
			if(ischeck){
				anotherPay.usePoint();

			//如果不使用积分，重新计算余额
			}else{

				$("#usePcount").val("0");

				//判断是否使用余额
				if($("#useBalance").attr("checked")){
					anotherPay.useBalance();
				}
			}

		//余额
		}else if(type == "useBalance"){

			//确定使用
			if(ischeck){
				anotherPay.useBalance();
				$("#userYue").show();
				$("#paypwd").focus();
			}else{
				$("#useBcount").val("0");
				$("#userYue").hide();
			}
		}

		anotherPay.resetTotalMoney();
	});


	//提交支付
	$(".submit,.shareTo").bind("click", function(event){
		var t = $(this);

		if(t.hasClass("disabled")) return false;

		if($("#pros").val() == ""){
			showErrAlert(langData['shop'][2][21]);
			$('.payBeforeLoading').hide()
			return false;
		}
		if(confirmtype == 1 && ($("#address").val() == 0 || $("#address").val() == "")){
            if($(".confirmTab .active a").size() > 0 && $(".confirmTab .active a").attr('data-id') == 1){

            }else{
                showErrAlert(langData['shop'][2][22]);
                $('.payBeforeLoading').hide()
                return false;
            }
		}

        if($(".confirmTab .active a").size() > 0 && $(".confirmTab .active a").attr('data-id') == 2 && !$("#address").val()){
            showErrAlert(langData['shop'][2][22]);
            $('.payBeforeLoading').hide()
            return false;
        }

		var tuantel = ''
		if(frompage == 1 && confirmtype == 0){
			if($("#customtel").val() == ''){
				showErrAlert('请输入手机号');
				$(".payBeforeLoading").hide()
				return false;
			}

			var reg_tel = /^1[0-9]{10}$/
			if(!reg_tel.test($("#customtel").val())){
				showErrAlert('请输入正确的手机号');
				$(".payBeforeLoading").hide()
				return false;
			}

			tuantel = '&tuantel='+$("#customtel").val();

		}

		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");
		var  quanUsestr = "&quanuse=";

		if(quanUse.length != 0){
			 quanUsestr = '&quanuse='+JSON.stringify(quanUse);
		}

		$("#payform").append("<input type='hidden' name='usePinput' value='"+($('.integral .gou').hasClass('hasgou')?'1':'0')+"'>");

		var paytype = $(this).attr('data-paytype')
		if(confirmtype == 2 && $(".confirmTab .active a").size() > 0){//详情页
			confirmtype = $(".confirmTab .active a").attr('data-id');
		} else {
			confirmtype = confirmtype == 2 ? confirmtype : (confirmtype*1 +1);
		}


		var paywaytype = $('#payway').val();//2为线上支付 1为货到付款
		if($(".shop-info-num").length){
			var count = $(".shop-info-num .num em").text();	
			var pros = $("#pros").val();
			var prosArr = pros.split(',');
			if(prosArr[2] <= count){
				prosArr[2] = count;
			}

			$("#pros").val(prosArr.join(','))
		}
		var delivery = '';
		if(confirmtype == 2 && $(".zhif_pop li.chose").length &&  $(".zhif_pop li.chose a").attr('data-type') == '1'){
			delivery = '&paytype=delivery'
		}
		$.ajax({
			url: $("#payform").attr("data-action"),
			data: $("#payform").serialize() +quanUsestr+"&peerpay="+paytype+"&confirmtype="+confirmtype+tuantel+delivery,
			type: "GET",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					orderurl = data.info.orderurl;
					//从购物车中删除提交后的商品
					// var cartData = $.cookie(cookiePre+"shop_cart"), prosval = $("#pros").val();
					// if(cartData && prosval){
					// 	var cartDataArr = cartData.split("|"), newCartData = cartDataArr, proArr = prosval.split("|");
					// 	for(var p = 0; p < proArr.length; p++){
					// 		val = proArr[p].split(",");
					// 		for(var i = 0; i < cartDataArr.length; i++){
					// 			var cData = cartDataArr[i].split(",");
					// 			if(val[0] == cData[0] && val[1] == cData[1]){
					// 				newCartData.splice(i,1);
					// 			}
					// 		}
					// 	}

					// 	$.cookie(cookiePre+"shop_cart", newCartData.join("|"), {expires: 7, domain: cookieDomain, path: '/'});
					// }

					if((typeof(paytype) !='undefined' && paytype == 1) || typeof (data.info) != 'object'){//找人付
						location.href = data.info;

					}else {
						// if (device.indexOf('huoniao') > -1) {
						// 	setupWebViewJavascriptBridge(function (bridge) {
						// 		bridge.callHandler('pageClose', {}, function (responseData) {
						// 		});
						// 	});
						// }

						var prosval = $("#pros").val();
						if (prosval) {
							shopInit.database('get', '', function (cartData) {
								var cartDataArr = cartData.split("|"), newCartData = cartDataArr,
									proArr = prosval.split("|");
								for (var p = 0; p < proArr.length; p++) {
									val = proArr[p].split(",");
									for (var i = 0; i < cartDataArr.length; i++) {
										var cData = cartDataArr[i].split(",");
										if (val[0] == cData[0] && val[1] == cData[1]) {
											newCartData.splice(i, 1);
										}
									}
								}
								shopInit.database('update', newCartData.join('|'));
							})

						}

						sinfo = data.info;
						service = 'shop';
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
						confirmtype = confirmtype;

						payCutDown('', sinfo.timeout, sinfo);

						// setTimeout(function(){
						//     t.removeClass("disabled").html(langData['shop'][1][8]);
						// }, 500);
					}
				}else{
					var popOptions = {
						btnCancel:'确定',
				      	title:data.info,
				      	btnColor:'#222',
				      	noSure:true,
				      	isShow:true
				    }
					confirmPop(popOptions);
					$('.payBeforeLoading').hide()
					t.removeClass("disabled").html(langData['shop'][1][8]);
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
				$('.payBeforeLoading').hide()
				t.removeClass("disabled").html(langData['shop'][1][8]);
			}
		});

	});

	//软键盘监听
	$(".shop-msg-input").on("keydown",function(e){
		e = event || window.event;

		if(e.keyCode == 13 && !e.ctrlKey){
			$(".submit").click();
			return false;
		}
	})


	// 关闭提示
	$('.add-tip i').click(function(){
		$(this).parent().remove();
	})












})
