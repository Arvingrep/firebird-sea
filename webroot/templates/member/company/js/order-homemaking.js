/**
 * 会员中心家政订单
 * by zmy
 */

var objId = $("#list");
$(function(){

	//state = state == "" ? 1 : state;
	$(".nav-tabs li[data-id='"+state+"']").addClass("active");

	$(".nav-tabs li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("active") && !t.hasClass("add")){
			state = id;
			atpage = 1;
			t.addClass("active").siblings("li").removeClass("active");
			getList();
		}
	});

	getList(1);
	//搜索
	$('.searchItem').click(function(){
		atpage = 1;
		getList();
	})

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

	//发布抢单
	objId.delegate('.fabuQiang','click',function(){
        var id=$(this).closest('table').attr('data-id');
        $.ajax({
            url: '/include/ajax.php?service=homemaking&action=operOrder',
            data:{grabid:id},
            type: 'post',
            dataType: 'json',
            success: function(data){
                console.log(data);
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

	//结单
    objId.delegate('.statement','click',function(){
        var id=$(this).attr('data-id');
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

    //确认退款 refundBtn
    objId.delegate('.refundBtn','click',function(){
        var t = $(this), par = t.closest("table"), id = par.attr("data-id");
        var title = par.find('.productInfo').attr('data-title');
        var pics = par.find('.productInfo').attr('data-litpic');
        $.dialog.confirm('确定退款吗?', function() {
            $.ajax({
                url: '/include/ajax.php?service=homemaking&action=refundPay&id=' + id+'&title='+title+'&pics='+pics+'&type=3'+'&status=1',
                type: 'post',
                dataType: 'json',
                success: function (data) {
                    if (data.state == 100) {
                        $.dialog.alert(data.info);
                        setTimeout(function () {
                            getList(1);
                        }, 1000);
                    } else {
                        $.dialog.alert(data.info);
                    }
                },
                error: function () {
                    $.dialog.alert(langData['siteConfig'][6][203]);
                }
            });
        })

    })

	//确认有效
	objId.delegate(".sureOk", "click", function(){
		var t = $(this), par = t.closest("table"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm('确认订单有效吗？', function(){
				$.ajax({
					url: masterDomain+"/include/ajax.php?service=homemaking&action=operOrder&oper=yes&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){
							t.html('确认成功');
							setTimeout(function(){getList(1);}, 1000);
						}else{
							$.dialog.alert(data.info);
						}
					},
					error: function(){
						$.dialog.alert(langData['siteConfig'][20][183]);
					}
				});
			});
		}
	});

	//确认无效
	objId.delegate(".sureNo", "click", function(){
		$('.jznouseWrap').css('display','flex');
    	$('.fwMask').show();
    	var pdid = $(this).closest("table").attr('data-id');
    	$('.jznouseWrap .snousesubmit').attr('data-id',pdid);
	});
	

	//无效--关闭
	$(".jznouseWrap .close").click(function(e){
    	$('.jzComWrap').css('display','none');
    	$('.fwMask').hide();

    })
    //无效 -- 确认
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


	
	 //手续费
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
    //确认服务
    objId.delegate('.sureFw','click',function(){
    	$('.fwWrap').css('display','flex');
    	$('.fwMask').show();
    	var pdid = $(this).closest('table').attr('data-id');
    	$('.sureFwAlert .surefwsubmit').attr('data-id',pdid);
    })
    $(".sureFwAlert .close").click(function(e){
    	$('.fwWrap').css('display','none');
    	$('.fwMask').hide();

    })
    //公共--弹窗关闭
    $('.fwMask').click(function(){
		$('.jzComWrap').css('display','none');
    	$('.fwMask').hide();
    })
    //确认服务
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
            t.removeClass("disabled").html(langData['siteConfig'][11][19]);
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
    //售后
    objId.delegate('.sale_treat','click',function(){
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
    })
    //关闭售后
    $('.repairMask,.repairAlert .close').click(function(){
    	$('.repairWrap').css('display','none');
    	$('.repairMask').hide();
    })
    //派单--弹出
    objId.delegate('.paidan','click',function(){
    	$('.jzpdWrap').css('display','flex');
    	$('.fwMask').show();
    	$('.jzpdAlert .fwPeoList li').removeClass('active');
    	var pdid = $(this).attr('data-id');
    	$('.jzpdWrap .surepdsubmit').attr('data-id',pdid);
    })
    //改派 -- 弹出
    objId.delegate('.changepaidan','click',function(){
    	$('.jzpdWrap').css('display','flex');
    	$('.fwMask').show();
    	$('.jzpdAlert .fwPeoList li').removeClass('active');
    	var pdid = $(this).attr('data-id'),cdid = $(this).attr('data-cid');
    	$('.jzpdWrap .surepdsubmit').attr('data-id',pdid);
    	$('#jzcourier').val(cdid);
    	$('.jzpdAlert .fwPeoList li a[data-id="'+cdid+'"]').closest('li').addClass('active');
    })
    //派单--关闭
    $('.jzpdWrap .close').click(function(){
    	$('.jzpdWrap').css('display','none');
    	$('.fwMask').hide();
    })


    //更多服务人员
    var orderpage = 1;
    var objFw = $('.fwPeoList ul');
    $('.fwPeoList .fwMore').click(function(){
    	orderpage++;
    	getpeoList();
    })
    getpeoList()
    //服务人员列表  
    function getpeoList(item) {
    	if(item){
    		orderpage =1;
    		objFw.html('');
    	}

        objFw.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');

        $.ajax({
            url: "/include/ajax.php?service=homemaking&action=personalList&u=1&orderby=2&page="+orderpage+"&pageSize=10",
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
              if(data && data.state != 200){
                if(data.state == 101){
                	$('.fwPeoList .fwMore').hide();
                  	objFw.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
                }else{
                   	var list = data.info.list, pageinfo = data.info.pageInfo, html = [];
                  
                  	//拼接列表
                  	if(list.length > 0){
        
	                    var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";
	                    var param = t + "id=";
	                    //var urlString = editUrl + param;
	        
	                    for(var i = 0; i < list.length; i++){
	                      var item           = [],
	                          id             = list[i].id,
	                          photo          = list[i].photo,
	                          username       = list[i].username,
	                          tel            = list[i].tel,
	                          onlineorder    = list[i].onlineorder,
	                          endorder       = list[i].endorder,
	                          photo          = list[i].photo;	        

	                        html.push('<li class="fn-clear"><a href="javascript:;" data-id="'+id+'">');
	                        if(photo!=''){
	                            html.push('<div class="jzpd_left"><img src="'+photo+'" alt=""></div>');
	                        }
	                        html.push('<div class="jzpd_right">');
	                        html.push('<h3>'+username+'</h3>');
	                        html.push('<p>服务中：'+onlineorder+'<span>'+langData['homemaking'][9][5]+'：'+endorder+'</span></p>');//服务中--结单
	                        html.push('<h5>'+tel+'</h5>');
	                        html.push('</div>');
	                        html.push('<s></s>');
	                        html.push('</a></li>');
	                
	                    }
        				$('.fwPeoList .fwMore').show();
	                    objFw.append(html.join(""));
	                    $('.fwPeoList .loading').remove();

	                    if(orderpage >= pageinfo.totalPage){
	                        $('.fwPeoList .fwMore').hide();
	                        objFw.append('<p class="loading">'+langData['homemaking'][8][65]+'</p>');
	                    }
        
                  	}else{
                  		$('.fwPeoList .fwMore').hide();
                    	$('.fwPeoList .loading').remove();
                    	objFw.append("<p class='loading'>"+langData['siteConfig'][20][185]+"</p>");
                  	}
                }
              }else{
              	$('.fwPeoList .fwMore').hide();
                objFw.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
              }
            }
        });
    }
    //派单--选择
    $('.jzpdAlert .fwPeoList').delegate('li','click',function(){
    	$(this).toggleClass('active').siblings('li').removeClass('active');
    })
    //确认派单--确定
    $(".jzpdAlert .surepdsubmit").click(function(){
        var orderid = $(".jzpdAlert .surepdsubmit").attr('data-id'), courier = $('.jzpdAlert li.active a').attr('data-id');
        if($(this).hasClass('disabled')) return false;
        
        if(orderid && courier){
        	$(this).addClass('disabled');
        	$(this).find('a').html('派单中...');
            var data = [];
            data.push('id='+orderid);
            data.push('courier='+courier);
            $.ajax({
                url: '/include/ajax.php?service=homemaking&action=operOrder&oper=dispatch',
                data: data.join("&"),
                type: 'post',
                dataType: 'json',
                success: function(data){
                    if(data && data.state == 100){
                    	$('.jzpdWrap').css('display','none');
                        $('.fwMask').hide();
                        getpeoList(1);
                        getList(1)
                        $('.jzpdAlert .surepdsubmit').removeClass('disabled');
       					$('.jzpdAlert .surepdsubmit').find('a').html('确定派单');
                    }else{
                        alert(data.info);
                        $('.jzpdAlert .surepdsubmit').removeClass('disabled');
       					$('.jzpdAlert .surepdsubmit').find('a').html('确定派单');
                    }
                },
                error: function(){
                    alert(langData['siteConfig'][6][203]);
                    $('.jzpdAlert .surepdsubmit').removeClass('disabled');
       				$('.jzpdAlert .surepdsubmit').find('a').html('确定派单');
                }
            });
        }else{
        	alert('请选择服务人员');
        	return false;
        }
    })

    //服务码 -- 弹出
    objId.delegate('.fwCode','click',function(){
    	$('.fwcodeWrap').css('display','flex');
    	$('.fwMask').show();
    	var pdid = $(this).closest('table').attr('data-id');
    	$('.fwcodeWrap .scodesubmit').attr('data-id',pdid);
    })

    //服务码 -- 关闭
    $('.fwcodeWrap .close').click(function(){
    	$('.fwcodeWrap').css('display','none');
    	$('.fwMask').hide();
    })
    //服务码 -- 确认
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
                    t.find('a').html('验证成功');
                    setTimeout(function(){
                        $("#confim_sure").val('');
                        $('.fwcodeWrap .close').click();
                        t.removeClass('disabled');
                        getList(1);
                    }, 1000);
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



});

function CheckInfo() {
    if (event.keyCode == 13) {
        atpage = 1;
		getList();
    }
}

function getList(is){

	$('.main').animate({scrollTop: 0}, 300);

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide().html('');
	var keyNum = $('#searchTit').val();
    if($('.jzfilterTab .jzmyfw').hasClass('curr')){
        data.push('dispatchid='+dspid);
        sFlag = true;
    }else{
        sFlag = false;
    }
	$.ajax({
		url: "/include/ajax.php?service=homemaking&action=orderList&store=1&ordernum="+keyNum+"&state="+state+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+data.info+"</p>");
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

					var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";

					//拼接列表
					if(list.length > 0){
						for(var i = 0; i < list.length; i++){
							var item       = [],product =[],
							    id            = list[i].id,
                                ordernum      = list[i].ordernum,
                                orderdate     = huoniao.transTimes(list[i].orderdate, 1),
                                orderstate    = list[i].orderstate,
                                orderprice    = list[i].orderprice,
                                procount      = list[i].procount,
                                litpic        = list[i].product.litpic,
                                courier       = list[i].dispatch.courier,
                                title         = list[i].product.title,
                                homemakingtype= list[i].homemakingtype,
                                usercontact   = list[i].usercontact,
                                typename   = list[i].typename,
                                tel           = list[i].tel,
                                payurl        = list[i].payurl,
                                usertel       = list[i].usertel,
                                cardnum       = list[i].cardnum,
                                proid         = list[i].proid,
                                price         = list[i].price,
                                servicetype   = list[i].servicetype,
                                price         = list[i].price,
                                online        = list[i].online,
                                doortime      = list[i].doortime,
                                paytype       =list[i].paytype,
                                grabtype      = list[i].grabtype,
                                aftersale     = list[i].aftersale,
                                dispatchid     = list[i].dispatchid,
                                courier     = list[i].dispatch.courier,
                                statementtime     = list[i].statementtime;	
                               // product    = list[i].product;	
							product.push(list[i].product)
							var detailUrl = editUrl.replace("%id%", id);
							var fhUrl = detailUrl.indexOf("?") > -1 ? detailUrl + "&rates=1" : detailUrl + "?rates=1";
							var urlString = homemakingEditUrl.replace("%id%", id);
                            var refundUrl = homemakingRefundUrl.replace("%id%", id);


                            var stateInfo = btn = "";
                             /**
                             * 0 、待付款
                             * 1、已付款 待确认
                             * 点击确认有效 2
                             * 点击确认无效 3
                             * 有预约金的 验证服务码  4
                             * 确认服务   5
                             * 待商家确认 6
                             * 服务完成   11
                             * 取消订单   7
                             * 退款中   8
                             * 服务码已确认 9######
                             * 已退款   9
                             */
							switch(orderstate){
								case "0":
										stateInfo = "<span class='state0'>"+langData['siteConfig'][9][23]+"</span>";//待付款
										btn = '<div><a href="'+urlString+'">订单详情</a></div>';//订单详情
									break;
								case "1":
									stateInfo = "<span class='state1'>"+langData['siteConfig'][9][11]+"</span>";//待确认
									btn = '<div><a href="javascript:;" class="sureOk clred">确认有效</a><a href="javascript:;" class="sureNo">确认无效</a><a href="'+urlString+'">订单详情</a></div>';//确认有效--确认无效--订单详情
									break;


								case "2":
									stateInfo = "<span class='state2'>待服务</span>";//待服务
									
									if(dispatchid!=0){//已被抢单
										stateInfo = "<span class='state2'>已被抢单<br/>"+(courier?'<em>'+courier+'</em>':'')+"</span>";//已被抢单
										btn = '<div><a href="javascript:;" class="sureFw clred">确认服务</a><a href="javascript:;" class="changepaidan" data-cid="'+dispatchid+'"  data-id="'+id+'">改派</a><a href="'+urlString+'">订单详情</a></div>';//确认服务--改派--订单详情
									}else{//未被抢单 要发布抢单
										if (grabtype==0) {//未发布抢单
											btn = '<div><a href="javascript:;" class="fabuQiang clred">发布抢单</a><a href="'+urlString+'">订单详情</a></div>';//发布抢单-订单详情
										}else if(grabtype==1){//已发布抢单 
											btn = '<div><a href="javascript:;" class="paidan clred" data-id="'+id+'">'+langData['homemaking'][4][6]+'</a><a href="'+urlString+'">订单详情</a></div>';//派单-订单详情
										}
									}
									if(homemakingtype==1){
										if(dispatchid!=0){
											btn = '<div><a href="javascript:;" class="fwCode clred">服务码</a><a href="javascript:;" class="changepaidan" data-cid="'+dispatchid+'"  data-id="'+id+'">改派</a><a href="javascript:;" class="sureNo">确认无效</a><a href="'+urlString+'">订单详情</a></div>';//服务码--改派--确认无效--订单详情
										}else{
											btn = '<div><a href="javascript:;" class="fwCode clred">服务码</a><a href="javascript:;" class="sureNo">确认无效</a><a href="'+urlString+'">订单详情</a></div>';//服务码--确认无效--订单详情
										}
										
									}
																											
									break;

								case "3":
                                    stateInfo = "<span class='state4'>"+langData['homemaking'][9][59]+"</span>"; //服务无效
                                    btn = '<div><a href="'+urlString+'">订单详情</a></div>';//订单详情
                                    break;
                                        	
								case "4":
									stateInfo = "<span class='state4'>待服务</span>";//待服务
									btn = '<div><a href="'+urlString+'">订单详情</a></div>';//订单详情
									if(dispatchid!=0){//已被抢单
										stateInfo = "<span class='state4'>已被抢单<br/>"+(courier?'<em>'+courier+'</em>':'')+"</span>";//已被抢单
										btn = '<div><a href="javascript:;" class="sureFw clred">确认服务</a><a href="javascript:;" class="changepaidan"  data-cid="'+dispatchid+'"  data-id="'+id+'">改派</a><a href="'+urlString+'">订单详情</a></div>';//订单详情
									}else{//未被抢单 要发布抢单
										if (grabtype==0) {//未发布抢单
											btn = '<div><a href="javascript:;" class="fabuQiang clred">发布抢单</a><a href="'+urlString+'">订单详情</a></div>';//发布抢单-订单详情
										}else if(grabtype==1){//已发布抢单 
											btn = '<div><a href="javascript:;" class="paidan clred" data-id="'+id+'">'+langData['homemaking'][4][6]+'</a><a href="'+urlString+'">订单详情</a></div>';//派单-订单详情
										}
									}
									break;
								case "5":
									stateInfo = "<span class='state5'>已服务，待客户验收</span>";//已服务，待客户验收
									btn = '<div><a href="'+urlString+'">订单详情</a></div>';//订单详情
									break;
								case "6":
									stateInfo = "<span class='state6'>"+langData['homemaking'][9][93]+"</span>";//服务完成,等待商家结单
									btn = '<div><a href="javascript:;" class="statement clred" data-id="'+id+'">'+langData['homemaking'][7][14]+'</a><a href="'+urlString+'">订单详情</a></div>';//结单--订单详情
									break;
								case "7":
									stateInfo = "<span class='state7'>已取消</span>";//已取消
									btn = '<div><a href="javascript:;" class="del_cancel">删除订单</a><a href="'+urlString+'">订单详情</a></div>';//订单详情
									
									break;	
								case "8":
									stateInfo = "<span class='state8'>"+langData['homemaking'][9][71]+"</span>";//退款中
									if(dispatchid!=0){//已派单
										btn = '<div><a href="javascript:;" class="refundBtn clred">'+langData['homemaking'][9][72]+'</a><a href="'+refundUrl+'" class="refuseCancel">拒绝退款</a><a href="javascript:;" class="changepaidan"  data-cid="'+dispatchid+'"  data-id="'+id+'">改派</a><a href="'+urlString+'">订单详情</a></div>';//确认退款--拒绝退款--改派--订单详情

									}else{//未派单
										btn = '<div><a href="javascript:;" class="refundBtn clred">'+langData['homemaking'][9][72]+'</a><a href="'+refundUrl+'" class="refuseCancel">拒绝退款</a><a href="javascript:;" class="paidan" data-id="'+id+'">'+langData['homemaking'][4][6]+'</a><a href="'+urlString+'">订单详情</a></div>';//确认退款--拒绝退款---派单--订单详情
									}
									
									
									break;
								case "9":
									stateInfo = "<span class='state9'>"+langData['homemaking'][10][14]+"</span>";//退款成功	
									btn = '<div><a href="'+urlString+'">订单详情</a></div>';//订单详情
									break;			
								
								case "11":
									if(aftersale==1){//订单完成 有售后
										stateInfo = "<span class='state11'>"+langData['homemaking'][10][9]+"</span>";//待售后
										btn = '<div><a href="javascript:;" class="sale_treat clred">处理售后</a><a href="'+urlString+'">订单详情</a></div>';//订单详情

									}else{//订单完成
										stateInfo = "<span class='state11'>交易完成</span>";//交易完成
										btn = '<div><a href="'+urlString+'">订单详情</a></div>';//订单详情
									}
									
									break;	

								
							}
							
							var timeTxt = '';

                            if(orderstate==11){
                                timeTxt=' <p class="jz_order_time"><span>'+langData['homemaking'][10][36]+'：</span><span>'+statementtime+'</span></p>';//结单时间
                            }else{
                            	timeTxt='<p class="jz_order_time"><span>'+langData['homemaking'][4][8]+'：</span><span>'+doortime+'</span></p>';//预约时间
                            }

							html.push('<table data-id="'+id+'" data-orderTime="'+orderdate+'"><colgroup><col style="width:38%;"><col style="width:10%;"><col style="width:7%;"><col style="width:17%;"><col style="width:16%;"><col style="width:12%;"></colgroup>');
							html.push('<thead><tr class="placeh"><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td colspan="5">');
							html.push('<span class="dealtime" title="'+orderdate+'">'+orderdate+'</span>');
                            for(var f = 0; f < product.length; f++){

                                html.push('<span class="fenlei">分类：<em>'+product[f].typename+'</em></span>')
                            }

                            html.push('<span class="number">'+langData['siteConfig'][19][308]+'：<a href="'+detailUrl+'">'+ordernum+'</a></span>');
							html.push('</td>');
							html.push('<td colspan="1"></td></tr></thead>');
							html.push('<tbody>');
							for(var p = 0; p < product.length; p++){
								cla = p == product.length - 1 ? ' class="lt"' : "";
								html.push('<tr'+cla+'>');
								html.push('<td class="nb"><div class="info productInfo" data-title="'+product[p].title+'" data-url="'+product[p].url+'" data-litpic="'+product[p].litpic+'" data-oprice="'+orderprice+'" data-count="'+procount+'" data-price="'+price+'"><a href="'+product[p].url+'" title="'+product[p].title+'" target="_blank" class="pic"><img src="'+huoniao.changeFileSize(product[p].litpic, "small")+'" /></a><div class="txt"><a href="'+product[p].url+'" title="'+product[p].title+'" target="_blank">'+product[p].title+'</a>'+timeTxt+'</div></div></td>');
								html.push('<td class="nb">'+echoCurrency('symbol')+orderprice+'</td>');
								html.push('<td>'+procount+'</td>');
								var totalPayPrice =0.00,moneyTxt='';
								if(homemakingtype== 0){
									totalPayPrice = 0.00;
								}else{
									totalPayPrice = orderprice;
								}
								//预约金--
								if(homemakingtype ==1){
									moneyTxt='<span class="moneyTxt">预付金</span>';
								}else if(homemakingtype ==0){//免预约
									moneyTxt='<span class="moneyTxt">免费预约</span>'
								}
								if(p == 0){
									html.push('<td class="bf paybf" rowspan="'+product.length+'"><div class="bfmoney">');
                                    if(totalPayPrice >0){
                                        html.push('<strong>'+echoCurrency('symbol')+totalPayPrice+'</strong>')
                                    }
                                    html.push(moneyTxt+'</div><div class="paytype">'+paytype+'</div></td>');
									html.push('<td class="bf ddanstate" rowspan="'+product.length+'"><div>'+stateInfo+'</div></td>');
									html.push('<td class="bf nb ddanOper" rowspan="'+product.length+'">'+btn+'</td>');
								}
								html.push('</tr>');
                            }

							html.push('</tbody>');

						}

						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
					}

	
                     totalCount = pageInfo.totalCount;
  

					$("#alldA").html(totalCount);
					$("#unsured").html(pageInfo.state1);//待确认
					$("#unused").html(pageInfo.state20);//待服务
					$("#unreceive").html(pageInfo.state5);//待验收
					$("#used").html(pageInfo.state6);//服务完成
					$("#refund").html(pageInfo.state8+pageInfo.state9+pageInfo.state11);//退款/售后					
					$("#finished").html(pageInfo.state11);//已结单

					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
