/**
 * 会员中心商城订单列表
 * by guozi at: 20151130
 */

var objId = $("#list");
$(function(){
	var sFlag = false;//false 我买的 true 我服务的
	$(".main-sub-tab li[data-id='"+state+"']").addClass("curr");

	//状态切换
	$(".main-sub-tab li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("curr") && !t.hasClass("sel")){
			state = id;
			atpage = 1;
			t.addClass("curr").siblings("li").removeClass("curr");
			getList();
		}
	});

	//导航切换
	$(".jzfilterTab a").bind("click", function(){
		var t = $(this),tindex = $(this).index();
		if(!t.hasClass("curr")){
			atpage = 1;
			t.addClass("curr").siblings("a").removeClass("curr");
			getList();
		}
		if(tindex == 0){//我买的
			$('.courierSpe,.canQiang').addClass('fn-hide');
			$('.myorder').removeClass('fn-hide');
		}else{//我服务的
			$('.courierSpe,.canQiang').removeClass('fn-hide');
			$('.myorder').addClass('fn-hide');
		}
	});

	//可抢订单
	$(".jztopTab a.canQiang").bind("click", function(){
		var t = $(this);
		atpage = 1;
		$('.main-sub-tab li').removeClass('curr')
		t.addClass("curr");
        state =t.attr('data-id');
		getList(1);

	})

	getList(1);

	//删除订单
	objId.delegate(".del_cancel", "click", function(){
		var t = $(this), par = t.closest("table"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm(langData['siteConfig'][20][182], function(){ //确定删除订单？删除后本订单将从订单列表消失，且不能恢复。
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: "/include/ajax.php?service=homemaking&action=delOrder&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){

							//删除成功后移除信息层并异步获取最新列表
							par.remove();
							setTimeout(function(){getList(1);}, 1000);

						}else{
							$.dialog.alert(data.info);
							t.siblings("a").show();
							t.removeClass("load");
						}
					},
					error: function(){
						$.dialog.alert(langData['siteConfig'][20][183]);//网络错误，请稍候重试！
						t.siblings("a").show();
						t.removeClass("load");
					}
				});
			});
		}
	});
	//取消订单/取消预约
	objId.delegate(".yuyue_cancel", "click", function(){
		var t = $(this), par = t.closest("table"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm('确定取消订单？', function(){ //确定取消订单？
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: "/include/ajax.php?service=homemaking&action=operOrder&oper=cancel&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){

							setTimeout(function(){getList(1);}, 1000);

						}else{
							$.dialog.alert(data.info);
							t.siblings("a").show();
							t.removeClass("load");
						}
					},
					error: function(){
						$.dialog.alert(langData['siteConfig'][20][183]);//网络错误，请稍候重试！
						t.siblings("a").show();
						t.removeClass("load");
					}
				});
			});
		}
	});

	//公共关闭
	$('.fwMask').click(function(){
    	$('.jzComWrap').css('display','none');
    	$('.fwMask').hide();
    })

    /***************************  售后维保 ***********************/
	//售后维保
	objId.delegate(".shouhou", "click", function(){
		var par = $(this).closest('table'); 
    	var ordtime = par.attr('data-ordertime');
    	var infoPar = par.find('.productInfo');
    	var infoTit = infoPar.attr('data-title'),
    		infoUrl = infoPar.attr('data-url'),
    		infoOprice = infoPar.attr('data-oprice'),
    		infoLitpic = infoPar.attr('data-litpic'),
    		infoPrice = infoPar.attr('data-price'),
    		infoCount = infoPar.attr('data-count');
    	$('.repairAlert .ordtime').text(ordtime);
    	$('.repairAlert .jz_title').text(infoTit);
    	$('.repairAlert .jz_price').html('<strong>'+echoCurrency('symbol')+infoOprice+'</strong><span>x'+infoCount+'</span>');
    	$('.repairAlert .rpleft_b img').attr('src',infoLitpic);
    	$('.repairAlert .repairCon3 a').attr('href',infoUrl);
    	$('.repairAlert .reOprice').text(infoPrice);
    	$('.repairAlert .jztotal_price span').text(infoPrice*1+infoOprice*1);
    	$('.repairWrap').css('display','flex');
    	$('.repairMask').show();
    	
    	if($(this).hasClass('fwshouhou')){////我服务的 -- 售后维保
    		$('.repairCon5').addClass('fn-hide');
    	}else{//我买的 -- 售后维保
			$('.repairCon5').removeClass('fn-hide');
    	}

	});

	//售后维保 -- 关闭
    $('.repairWrap .close,.repairMask').click(function(){
    	$('.repairWrap').css('display','none');
    	$('.repairMask').hide();
    })


	/***************************  我服务的 -- 服务码 ***********************/
	//我服务的 -- 服务码
	objId.delegate(".service_code", "click", function(){
		$('.fwcodeWrap').css('display','flex');
    	$('.fwMask').show();
    	var parid = $(this).closest('table').attr('data-id');
    	$('.scodesubmit').attr('data-id',parid);
	});
	//我服务的 --服务码 -- 关闭
    $('.fwcodeWrap .close').click(function(){
    	$('.fwcodeWrap').css('display','none');
    	$('.fwMask').hide();
    })
    //我服务的 --服务码 -- 确认
    $('.fwcodeWrap .scodesubmit').click(function () {
        var t = $(this), cardnum = $("#confim_sure").val();
        if(t.hasClass('disabled')) return;
        if(cardnum==''){
            alert(langData['homemaking'][9][77]);
            return;
        }
        t.addClass('disabled').find('a').html('验证中...');
        var data = [];
        data.push('cardnum='+cardnum);
        $.ajax({
            url: '/include/ajax.php?service=homemaking&action=useCode',
            data: data.join("&"),
            type: 'post',
            dataType: 'json',
            success: function(data){
                if(data && data.state == 100){
                    t.removeClass('disabled').find('a').html('验证成功');
                    $('.fwcodeWrap .close').click();
    				setTimeout(function(){getList(1);}, 1000);
                }else{
                	t.removeClass('disabled').find('a').html('验证服务码');
                    $.dialog.alert(data.info);
                }
            },
            error: function(){
            	t.removeClass('disabled').find('a').html('验证服务码');
                $.dialog.alert(langData['siteConfig'][6][203]);
            }
        });
    })


    /***************************  我买的 -- 服务码 ***********************/
	//我买的 -- 服务码
	objId.delegate(".buy_service_code", "click", function(){
		$('.buycodeWrap').css('display','flex');
    	$('.fwMask').show();
    	var parcode = $(this).closest('table').attr('data-cardnum');
        var parcodeList = parcode.split(',');
        var parlist = [];
        if(parcodeList){
            for(var i = 0; i < parcodeList.length; i++){
                parlist.push('<li'+(parcodeList[i].indexOf('used') >= 0 ? ' class="used"' : '')+'>'+parcodeList[i].replace(/used/g, '').replace(/,/g, '</li><li>')+'</li>');
            }
        }
    	$('.buycodeWrap .fwcodeCon ol').removeClass('one').html(parlist.join(''));
        if(parcode.indexOf(',') <= 0){
            $('.buycodeWrap .fwcodeCon ol').addClass('one');
        }
	});

	//我买的 -- 服务码-- 关闭/我知道了
	$('.buycodeWrap .close,.buycodeWrap .knowA').click(function(){
		$('.fwMask').hide();
		$('.buycodeWrap').css('display','none');
	})

	/***************************  我服务的 -- 待服务 -- 预付金--申请售后 ***********************/
	//待服务 --预付金-- 申请售后（预付金不可退）
	objId.delegate(".nomoney_back", "click", function(){
		$('.saleAfterWrap').css('display','flex');
    	$('.fwMask').show();
    	var parid = $(this).closest('table').attr('data-id');
    	$('.sale_cancel').attr('data-id',parid);
	});

	//待服务 -- 申请售后-- 关闭/继续服务
	$('.saleAfterWrap .close,.saleAfterWrap .sale_confirm').click(function(){
		$('.fwMask').hide();
		$('.saleAfterWrap').css('display','none');
	})
	//待服务 -- 申请售后-- 取消订单
	$('.saleAfterWrap .sale_cancel').click(function(){
		var tid = $('.sale_cancel').attr('data-id');

        $.ajax({
            url: '/include/ajax.php?service=homemaking&action=operOrder&oper=cancel&id='+tid,
            type: 'post',
            dataType: 'json',
            success: function(data){
                if(data && data.state == 100){
                    $.dialog.alert('订单取消成功');
                    setTimeout(function(){getList(1);},200) 
                }else{
                    $.dialog.alert(data.info);
                }
            },
            error: function(){
                $.dialog.alert(langData['siteConfig'][6][203]);
            }
        });

	})
	/***************************  我服务的 -- 验收完成 ***********************/
	//我买的--验收完成--线下/线下--二维码去移动端验证
	objId.delegate(".jz_yanshou", "click", function(){
		$('.jzysWrap').css('display','flex');
    	$('.fwMask').show();

	})

	//我买的 -- 验收完成-- 关闭
	$('.jzysWrap .close').click(function(){
		$('.fwMask').hide();
		$('.jzysWrap').css('display','none');
	})

	/***************************  我服务的 -- 确认无效 ***********************/
	//我服务的 -- 确认无效
	objId.delegate(".confirm_none", "click", function(){
		$('.jznouseWrap').css('display','flex');
    	$('.fwMask').show();
    	var pdid = $(this).closest("table").attr('data-id');
    	$('.jznouseWrap .snousesubmit').attr('data-id',pdid);
	})

	//我服务的 -- 确认无效--关闭
	$(".jznouseWrap .close").click(function(e){
    	$('.jzComWrap').css('display','none');
    	$('.fwMask').hide();

    })
    //我服务的 -- 确认无效 -- 确认
    $('.jznouseWrap .snousesubmit').click(function () {
        var t = $(this), id = t.attr("data-id");
        var nouse_tip=$('#nouse_tip').val()//获取订单失败的原因
        if(nouse_tip==''){
            $.dialog.alert(langData['homemaking'][9][48]);
            return false;
        }
        if(id){
            var data = [];
            data.push('id='+id);
            data.push('failnote='+nouse_tip);

            $.ajax({
                url: '/include/ajax.php?service=homemaking&action=operOrder&oper=no',
                data: data.join("&"),
                type: 'post',
                dataType: 'json',
                success: function(data){
                    if(data && data.state == 100){
                        t.html('确认成功');
                        $('#nouse_tip').val('');
                        $(".jznouseWrap .close").click();                       
                        setTimeout(function(){getList(1);}, 1000);
                    }else{
                        $.dialog.alert(data.info);
                    }
                },
                error: function(){
                    $.dialog.alert(langData['siteConfig'][6][203]);
                }
            });
        }
        
    })


	/***************************  我服务的 -- 确认服务 **************************************/
	//我服务的 -- 确认服务 -- 有无手续费
    $('.no_pay li').click(function () {
      $(this).toggleClass('active').siblings().removeClass('active')
      if($(this).hasClass("active") ){
          var price_typ=$(this).attr('data-id');
          if(price_typ==1){
            $('.need_pay').show();
            $('.wrhomeCon2').show();
            $('.wrhometip').show();
          }else if(price_typ==0){
            $('.need_pay').hide();
            $('.wrhomeCon2').hide();
            $('.wrhometip').hide();
            
          }
        }


    });
	//我服务的 -- 确认服务 -- 线上/线下 手续费
    $('.need_pay li').click(function () {
      $(this).toggleClass('active').siblings().removeClass('active')
      if($(this).hasClass("active") ){
          var price_typ=$(this).attr('data-id');
          if(price_typ==1){           
            $('.wrhomeCon2 p').text(langData['homemaking'][7][5]+'：');     //线下收费
            $('.wrhometip').text(langData['homemaking'][7][11]);     //请务必确保顾客当面结清所有费用
            $('.baomu_manage_footer p').text(langData['homemaking'][7][10]);      //确认已线下收款

          }else if(price_typ==0){           
            $('.wrhomeCon2 p').text(langData['homemaking'][7][4]+'：');     //线上收费
            $('.wrhometip').text(langData['homemaking'][7][9]);      //提交后请确保顾客当面结清所有费用
            $('.baomu_manage_footer p').text(langData['homemaking'][7][0]);     //确认服务费用

          }
        }


    });
	//我服务的 -- 确认服务
	objId.delegate(".sureFw", "click", function(){
		$('.fwWrap').css('display','flex');
    	$('.fwMask').show();
    	var pdid = $(this).closest('table').attr('data-id');
    	$('.sureFwAlert .surefwsubmit').attr('data-id',pdid);
	})
	//我服务的 -- 确认服务 -- 关闭
	$(".sureFwAlert .close").click(function(e){
    	$('.fwWrap').css('display','none');
    	$('.fwMask').hide();

    })
    //我服务的 -- 确认服务 -- 确认
    $(".sureFwAlert .surefwsubmit").click(function(e){
      e.preventDefault();
      var type = $(".no_pay .active").attr('data-id'), online = $(".need_pay .active").attr('data-id'), price = $("#price").val(), servicedesc = $("#demo").val();
      var tid = $(this).attr('data-id');
      if(type==1){
        if(price<0 || price==''){
          $.dialog.alert(langData['homemaking'][9][87]);
          return;
        }
      }

      var data =[], t = $(this);
      data.push('id='+tid);
      data.push('servicetype='+type);
      data.push('guarantee='+$("#guarantee").val());
      data.push('online='+online);
      data.push('price='+price);
      data.push('servicedesc='+servicedesc);

      t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

      $.ajax({
        url: '/include/ajax.php?service=homemaking&action=addservice',
        data: data.join("&"),
        type: "POST",
        dataType: "json",
        success: function (data) {
          if(data && data.state == 100){
            $('.fwWrap').css('display','none');
    		$('.fwMask').hide();
    		setTimeout(function(){getList(1);}, 1000);

          }else{
            $.dialog.alert(data.info);
            t.removeClass("disabled").html(langData['siteConfig'][11][19]);
          }
        },
        error: function(){
          t.removeClass("disabled").html(langData['siteConfig'][11][19]);
        }
      });

    });

	/***************************  我服务的 -- 结单 **************************************/
	//我服务的 -- 结单
	objId.delegate(".fwjiedan", "click", function(){
		var id=$(this).closest('table').attr('data-id');
		$.dialog.confirm('确定结单吗？',function(){
			$.ajax({
	            url: '/include/ajax.php?service=homemaking&action=addservice',
	            data:{orderid:id,type:'statement'},
	            type: 'post',
	            dataType: 'json',
	            success: function(data){
	                if(data.state == 100){
	                   $.dialog.alert(data.info);
	                   setTimeout(function(){getList(1);}, 1000);
	                }else{
	                    $.dialog.alert(data.info);
	                }
	            },
	            error: function(){
	                $.dialog.alert(langData['siteConfig'][6][203]);
	            }
	        });
		})
	})

	/***************************  服务人员 -- 抢单 **************************************/
	//抢单
	objId.delegate('.grab','click',function(){
        var orderid=$(this).closest('table').attr('data-id');
        $.ajax({
            url: '/include/ajax.php?service=homemaking&action=operOrder&oper=grab',
            data:{dispatchid:dspid,orderid:orderid},
            type: 'post',
            dataType: 'json',
            success: function(data){
                console.log(data);
                if(data.state == 100){
                   alert(data.info);
                   window.location.reload();
                }else{
                    alert(data.info);
                }
            },
            error: function(){
                alert(langData['siteConfig'][6][203]);
            }
        });
    })


});

function getList(is){

	if(is != 1){
		$('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');//加载中，请稍候
	$(".pagination").hide();
	var data = [];
	data.push('state='+state);
	data.push('page='+atpage);
	data.push('pageSize='+pageSize);
	if($('.jzfilterTab .jzmyfw').hasClass('curr')){
		data.push('dispatchid='+dspid);
		sFlag = true;
	}else{
		sFlag = false;
	}

	$.ajax({
		url: "/include/ajax.php?service=homemaking&action=orderList",
		data:data.join('&'),
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					$(".main-sub-tab, .oh").hide();
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

					//拼接列表
					if(list.length > 0){
						for(var i = 0; i < list.length; i++){
							var item       = [],
							    id            = list[i].id,
							    company       = list[i].title,
                                ordernum      = list[i].ordernum,
                                orderstate    = list[i].orderstate,
                                orderdate     = huoniao.transTimes(list[i].orderdate, 1),
                                orderprice    = list[i].orderprice,
                                procount      = list[i].procount,
                                prourl        = list[i].product.url,
                                litpic        = list[i].product.litpic,
                                courier       = list[i].dispatch.courier,
                                title         = list[i].product.title,
                                homemakingtype= list[i].homemakingtype,//0--免费预约 1--预付金 2--实价
                                usercontact   = list[i].usercontact,
                                tel           = list[i].tel,
                                payurl        = list[i].payurl,
                                usertel       = list[i].usertel,
                                cardnum       = list[i].cardnum,
                                proid         = list[i].proid,
                                servicetype   = list[i].servicetype,
                                price         = list[i].price,
                                online        = list[i].online,
                                doortime      = list[i].doortime,
                                aftersale     = list[i].aftersale,
                                statementtime     = list[i].statementtime,
                                paytype     = list[i].paytype,
                                orderdate  = huoniao.transTimes(list[i].orderdate, 1);
                            // if(list[i].product.length == 0){
                            //         continue;
                            // }
							var urlString = homemakingEditUrl.replace("%id%", id);
                            var cancelserviceUrl = homemakingcancelserviceUrl.replace("%id%", id);
                            var refundUrl = homemakingrefundUrl.replace("%id%", id);
							var stateInfo = btn = "";

							var refundserviceUrl = homemakingrefundserviceUrl.replace("%id%", id);

							/**
                             * 0 、待付款
                             * 1、已付款 待确认
                             * 点击确认有效 2
                             * 点击确认无效 3
                             * 有预约金的 验证服务码  4
                             * 确认服务   5
                             * 服务完成   6
                             * 订单取消   7
                             * 申请退款   8
                             */
							switch(orderstate){
								case "0":
									stateInfo = "<span class='state0'>"+langData['siteConfig'][9][22]+"</span>";//未付款
									btn = '<div><a href="javascript:;" class="edit popPay" data-ordernum="'+ordernum+'">'+langData['siteConfig'][6][64]+'</a></div><div><a href="javascript:;" class="yuyue_cancel">'+langData['siteConfig'][6][65]+'</a></div>';//立即付款  取消订单
									break;
                                case "1":
                                	stateInfo = "<span class='state1'>"+langData['siteConfig'][9][11]+"</span>";//待确认

									if(homemakingtype==0){//免费预约的
										
										btn = '<div><a href="javascript:;" class="yuyue_cancel redColor">'+langData['homemaking'][10][11]+'</a></div>';//取消预约
										
									}else if (list[i].refundnumber == 0 ){
										
										btn = '<div><a href="'+urlString+'" class="moneyback">'+langData['siteConfig'][6][66]+'</a></div>';//申请退款
									}else if (list[i].refundnumber == 1){
										btn = '<div><a href="'+urlString+'" class="moneyback">修改申请</a></div>';//修改申请

									}else if(list[i].refundnumber == 2){
										btn = '<div><a href="'+refundserviceUrl+'" class="moneyback">查看退款详情</a></div>';//查看退款详情

									}
									break;
								case "2":
                                	stateInfo = "<span class='state2'>"+langData['homemaking'][4][3]+"</span>";//待服务
                                	if(!sFlag){//我买的
                                		if(homemakingtype==1){//预付金
                                			btn = '<div><a href="javascript:;"	 class="nomoney_back">'+langData['homemaking'][10][15]+'</a></div><div><a href="javascript:;" class="buy_service_code redColor">'+langData['homemaking'][9][74]+'</a></div>';//申请售后--服务码

                                		}else if(homemakingtype==0){//免费预约的
										
											btn = '<div><a href="javascript:;" class="yuyue_cancel redColor">'+langData['homemaking'][10][11]+'</a></div>';//取消预约
											
										}
                                	}else{//我服务的
                                		btn = '<div><a href="javascript:;" class="confirm_none redColor">'+langData['homemaking'][9][45]+'</a></div>';//确认无效
                                		if(homemakingtype == 1){
                                			btn += '<div><a href="javascript:;" class="service_code redColor">'+langData['homemaking'][9][74]+'</a></div>';//服务码
                                		}
                                		

                                	}
									break;
								case "3":
									stateInfo = "<span class='state3'>"+langData['siteConfig'][9][59]+"</span>";//服务无效
									btn = '<div><a href="javascript:;" class="del_cancel">'+langData['homemaking'][9][54]+'</a></div>';//删除订单
									break;
								case "4":
									stateInfo = "<span class='state4'>"+langData['homemaking'][4][3]+"</span>";//待服务

									if(!sFlag){//我买的

										if(homemakingtype==2){//实价
                                			btn = '<div><a href="'+refundUrl+'" class="redColor">'+langData['homemaking'][10][15]+'</a></div>';//申请售后

                                		}else if(homemakingtype==0){//免费预约的
										
											btn = '<div><a href="javascript:;" class="yuyue_cancel redColor">'+langData['homemaking'][10][11]+'</a></div>';//取消预约
											
										}
									}else{//我服务的
	
                                    	btn = '<div><a href="javascript:;" class="sureFw redColor">'+langData['homemaking'][7][1]+'</a></div>';//确认服务	
                                    }
									
									break;
								case "5":
									if(sFlag){//我服务的
										stateInfo = "<span class='state5'>已服务，待客户验收</span>";//已服务，待客户验收
									}else{
										stateInfo = "<span class='state5'>"+langData['homemaking'][9][89]+"</span>";//商家已服务，待验收
									}
									
									if(homemakingtype == 2 && !sFlag){//实价
										btn = '<div><a href="'+cancelserviceUrl+'" class="redColor">'+langData['homemaking'][9][76]+'</a></div>';//申请售后
									}
									if(servicetype==0 || (servicetype==1 && online==1)){//线下
                                        paybtn = 'jz_yanshou2';
                                    }else{//线上
                                        paybtn = 'jz_yanshou1';
                                    }
                                    if(!sFlag){//我买的
                                    	btn +='<div><a href="javascript:;" class="jz_yanshou '+paybtn+'" data-proid="'+proid+'">验收完成</a></div>';//验收完成
                                    }
                                    
									break;	
								case "6":
									stateInfo = "<span class='state6'>"+langData['homemaking'][9][93]+"</span>";//服务完成
									if(!sFlag){//我买的
										
										btn = '<div><a href="javascript:;" class="buyjiedan redColor">'+langData['homemaking'][10][35]+'</a></div>';//等待商家结单
										if(aftersale==1){
											btn += '<div><a href="javascript:;" class="buyshouhou shouhou">'+langData['homemaking'][9][94]+'</a></div>';//售后维保
										}else{
											btn +='<div><a href="javascript:;" class="del_cancel">'+langData['homemaking'][9][54]+'</a></div>';//删除订单
										}
									}else{//我服务的
										
										btn = '<div><a href="javascript:;" class="fwjiedan redColor">'+langData['homemaking'][7][14]+'</a></div>';//结单
										
									}
									
																		
									break;
								case "7":
									stateInfo = "<span class='state7'>"+langData['homemaking'][9][53]+"</span>";//已取消
									btn ='<div><a href="javascript:;" class="del_cancel">'+langData['homemaking'][9][54]+'</a></div>';//删除订单
									break;
								case "8":
									stateInfo = "<span class='state8'>"+langData['homemaking'][9][71]+"</span>";//退款中
									btn ='<div><a href="javascript:;" class="refund_cancel">'+langData['homemaking'][10][22]+'</a></div>';//取消退款
									break;
								case "9":
									stateInfo = "<span class='state9'>"+langData['siteConfig'][9][34]+"</span>";//退款成功
									btn ='<div><a href="javascript:;" class="del_cancel">'+langData['homemaking'][9][54]+'</a></div>';//删除订单
									break;	
								case "11":
									stateInfo = "<span class='state11'>"+langData['homemaking'][10][34]+"</span>";	//已结单
									btn ='<div><a href="javascript:;" class="del_cancel">'+langData['homemaking'][9][54]+'</a></div>';//删除订单
									if(aftersale==1){
										if(!sFlag){//我买的
											btn += '<div><a href="javascript:;" class="buyshouhou shouhou">'+langData['homemaking'][9][94]+'</a></div>';//售后维保
										}else{
											btn = '<div><a href="javascript:;" class="fwshouhou shouhou">'+langData['homemaking'][9][94]+'</a></div>';//售后维保
										}
									}
									
									break;
							}

                            var cardnumList = [];
                            if(cardnum){
                                for(var index = 0; index < cardnum.length; index++){
                                    cardnumList.push((cardnum[index]['usedate'] != '0' ? 'used' : '') + cardnum[index]['cardnum'].replace(/\s/g, ''));
                                }
                            }

							html.push('<table data-id="'+id+'" data-cardnum="'+cardnumList.join(',')+'" data-orderTime="'+orderdate+'"><colgroup><col style="width:38%;"><col style="width:5%;"><col style="width:12%;"><col style="width:17%;"><col style="width:16%;"><col style="width:12%;"></colgroup>');
							html.push('<thead><tr class="placeh"><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td colspan="5">');
							html.push('<span class="dealtime" title="'+orderdate+'">'+orderdate+'</span>');
							if(!sFlag){//我买的
								html.push('<span class="number">分类：<a href="javascript:;">服务项目</a></span>');
								html.push('<span class="store"><a href="" target="_blank">'+company+'</a></span>');
							}else{
								html.push('<span>订单编号：<a href="javascript:;">'+ordernum+'</a></span>');
							}
							html.push('</td>');
							html.push('<td colspan="1"></td></tr></thead>');
							html.push('<tbody>');
						

							html.push('<tr class="lt">');
							html.push('<td class="nb"><div class="info productInfo" data-title="'+title+'" data-url="'+prourl+'" data-litpic="'+litpic+'" data-oprice="'+orderprice+'" data-count="'+procount+'" data-price="'+price+'"><a href="'+prourl+'" title="'+title+'" target="_blank" class="pic"><img src="'+huoniao.changeFileSize(litpic, "small")+'" /></a><div class="txt"><a href="'+prourl+'" title="'+title+'" target="_blank"><h2>'+title+'</h2><div class="timeDiv">');							
							html.push('<p>预约上门时间：'+doortime+'</p>');
							if(orderstate==11){
								html.push('<p>'+langData['homemaking'][10][36]+'：'+statementtime+'</p>');//结单时间
							}
							html.push('<p>联系电话：'+usertel+'</p></div></a></div></div></td>');
							html.push('<td class="nb"></td>');
							html.push('<td>'+procount+'</td>');
							
							html.push('<td class="bf priceTd" rowspan="1">');
							html.push('<div class="bfmoney">');
							if(homemakingtype==1){
								html.push('<strong>'+orderprice+'</strong><span class="moneyTxt">'+langData['homemaking'][8][60]+'</span>');//
							}else if(homemakingtype==0){
								html.push('<span class="moneyTxt">'+langData['homemaking'][0][21]+'</span>');//免费预约
							}else{
								html.push('<strong>'+orderprice+'</strong>');
							}
							html.push('</div>');
							html.push('<div class="paytype">'+paytype+'</div></td>');
							html.push('<td class="bf" rowspan="1"><div><a href="'+refundserviceUrl+'" target="_blank">'+stateInfo+'</a></div></td>');//
							html.push('<td class="bf nb" rowspan="1">'+btn+'<a href="'+refundserviceUrl+'" target="_blank">'+langData['siteConfig'][19][313]+'</a></td>');//订单详情
							
							html.push('</tr>');
							

							html.push('</tbody>');

						}

						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
					}

					switch(state){
                        case "":
                            totalCount = pageInfo.totalCount;
                            break;
                        case "0":
                            totalCount = pageInfo.state0;
                            break;
                        case "1":
                            totalCount = pageInfo.state1;
                            break;
                        case "2":
                            totalCount = pageInfo.state2;
                            break;
                        case "3":
                            totalCount = pageInfo.state3;
                            break;
                        case "4":
                            totalCount = pageInfo.state4;
                            break;
                        case "5":
                            totalCount = pageInfo.state5;
                            break;
                        case "6":
                            totalCount = pageInfo.state6;
                            break;
                        case "7":
                            totalCount = pageInfo.state7;
                            break;
                        case "8":
                            totalCount = pageInfo.state8;
                            break;
                        case "9":
                            totalCount = pageInfo.state9;
                        case "10":
                            totalCount = pageInfo.state10;
                        case "11":
                            totalCount = pageInfo.state11;
                            break;
                        case "20":
                            totalCount = pageInfo.state20;
                            break;
                    }


					$("#state").html(pageInfo.totalCount);
					$("#state0").html(pageInfo.state0);
					$("#state1").html(pageInfo.state1);
					$("#state20").html(pageInfo.state20);
					$("#state5").html(pageInfo.state5);
					$("#state6").html(pageInfo.state6);
					$("#state11").html(pageInfo.state11);
					$("#state9").html(pageInfo.state9);
                    $("#canQiang").html(pageInfo.state10);

					showPageInfo();
				}
			}else{
				$(".main-sub-tab, .oh").hide();
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
			}
		}
	});
	$('body').delegate(".popPay", "click", function(){

		var ordernum1 = $(this).attr('data-ordernum');

		$.ajax({
			url: masterDomain+"/include/ajax.php?service=homemaking&action=pay",
			type: 'post',
			data: {'ordernum':ordernum1,'orderfinal':1},
			dataType: 'json',
			success: function(data){
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

					ordernum  = info.ordernum;
					order_amount = info.order_amount;

					$("#ordertype").val('');
					$("#service").val('homemaking');
					service = 'homemaking';
					var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
					$('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));
				}else {
						if (device.indexOf('huoniao_Android') > -1) {
							setupWebViewJavascriptBridge(function (bridge) {
								bridge.callHandler('pageClose', {}, function (responseData) {
								});
							});
							location.href = data.info;
						} else {
							location.href = data.info + (data.info.indexOf('?') > -1 ? '&' : '?') + 'currentPageOpen=1';
						}
					}
				}
			},
			error: function(){
				alert('网络错误，请重试！');
				t.removeClass('disabled');
			}
		})
	});



}
