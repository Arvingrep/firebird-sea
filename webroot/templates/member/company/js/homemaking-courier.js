/**
 * 会员中心家政服务人员订单
 * by zmy at: 20210323
 */

var objId = $("#list");
$(function(){

	//state = state == "" ? 1 : state;
	$(".main-sub-tab li[data-id='"+state+"']").addClass("curr");

	$(".main-sub-tab li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("curr")){
			state = id;
			atpage = 1;
			t.addClass("curr").siblings("li").removeClass("curr");
			getList();
		}
	});

	getList(1);


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

	$.ajax({
		url: "/include/ajax.php?service=homemaking&action=orderList&store=1&state="+state+"&dispatchid="+dispatchid+"&page="+atpage+"&pageSize="+pageSize,
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
                                grabtype      = list[i].grabtype,
                                aftersale     = list[i].aftersale,
                                dispatchid     = list[i].dispatchid,
                                courier     = list[i].dispatch.courier,
                                statementtime     = list[i].statementtime;	
                               // product    = list[i].product;	
							product.push(list[i].product);
                            if(list[i].product.length == 0){
                                    continue;
                            }
                            var detailUrl = homemakingEditUrl.replace("%id%", id);
							var urlString = homemakingEditUrl.replace("%id%", id);
 
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


								case "2":
									stateInfo = "<span class='state2'>待服务</span>";//待服务
									
	
                                    if(homemakingtype == 1){
                                        btn = '<div><a href="javascript:;" class="sureNo clred">'+langData['homemaking'][9][45]+'</a><a href="javascript:;" class="fwCode clred">'+langData['homemaking'][9][74]+'</a><a href="'+urlString+'">订单详情</a></div>';//确认无效--服务码
                                    }else{
                                        btn = '<div><a href="javascript:;" class="sureNo clred">'+langData['homemaking'][9][45]+'</a><a href="'+urlString+'">订单详情</a></div>';//确认无效
                                    }
																											
									break;
                                        	
								case "4":
									stateInfo = "<span class='state4'>待服务</span>";//待服务
									btn = '<div><a href="javascript:;" class="sureFw clred">'+langData['homemaking'][7][1]+'</a><a href="'+urlString+'">订单详情</a></div>';//确认服务
									break;
								case "5":
									stateInfo = "<span class='state5'>已服务，待客户验收</span>";//已服务，待客户验收
									btn = '<div><a href="'+urlString+'">订单详情</a></div>';//订单详情
									break;
								case "6":
									stateInfo = "<span class='state6'>"+langData['homemaking'][9][93]+"</span>";//服务完成,服务完成
									btn = '<div><a href="javascript:;" class="statement clred" data-id="'+id+'">'+langData['homemaking'][7][14]+'</a><a href="'+urlString+'">订单详情</a></div>';//结单--订单详情
									break;
                                case "9":
                                    stateInfo = "<span class='state9'>"+langData['homemaking'][10][14]+"</span>";//退款成功
                                    btn = '<div><a href="'+urlString+'">订单详情</a></div>';//订单详情
                                    break;

                                case "11":
									stateInfo = "<span class='state11'>"+langData['homemaking'][10][34]+"</span>"; //已结单

									if(aftersale==1){//订单完成 有售后
										btn = '<div><a href="javascript:;" class="sale_treat clred">'+langData['homemaking'][9][94]+'</a><a href="'+urlString+'">订单详情</a></div>';//售后维保

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
                            for(var f = 0; f < product.length; f++) {

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
                                    html.push(moneyTxt+'</div><div class="paytype">'+product[p].price+'</div></td>');
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
  

					$("#totalCount").html(totalCount);
					$("#state1").html(pageInfo.state1);//待确认
					$("#state20").html(pageInfo.state20);//待服务
					$("#state5").html(pageInfo.state5);//待验收
					$("#state6").html(pageInfo.state6);//服务完成
					$("#state9").html(pageInfo.state8+pageInfo.state9+pageInfo.state11);//退款/售后					
					$("#state11").html(pageInfo.state11);//已结单

					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
