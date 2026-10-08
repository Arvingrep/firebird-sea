$(function(){

    //状态切换
    $(".tab ul li").bind("click", function(){
        var t = $(this), id = t.attr("data-id");
        if(!t.hasClass("curr") && !t.hasClass("sel")){
            state = id;
            atpage = 1;
            t.addClass("curr").siblings("li").removeClass("curr");
            objId.html('');
            getList();
        }
    });

    // 下拉加载
    $(window).scroll(function() {
        var h = $('.myitem').height();
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w - h;
        if ($(window).scrollTop() > scroll && !isload) {
            atpage++;
            getList();
        };
    });

    //收货
    objId.delegate(".sh", "click", function(){
        var t = $(this), par = t.closest(".myitem"), id = par.attr("data-id");
        if(id){
            if(confirm(langData['siteConfig'][20][188])){
                t.siblings("a").hide();
                t.addClass("load");

                $.ajax({
                    url: masterDomain+"/include/ajax.php?service=info&action=receipt&id="+id,
                    type: "GET",
                    dataType: "jsonp",
                    success: function (data) {
                        if(data && data.state == 100){

                            t.removeClass("load").html(langData['siteConfig'][6][108]);
                            setTimeout(function(){objId.html('');getList();}, 1000);

                        }else{
                            alert(data.info);
                            t.siblings("a").show();
                            t.removeClass("load");
                        }
                    },
                    error: function(){
                        alert(langData['siteConfig'][20][183]);
                        t.siblings("a").show();
                        t.removeClass("load");
                    }
                });
            };
        }
    });

});

function getList(is){

    isload = true;

    if(is != 1){
        // $('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
    }

    state = state=='' ? 1 : state;

    objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');
    $(".pagination").hide();

    $.ajax({
        url: masterDomain+"/include/ajax.php?service=info&action=orderList&store=1&type=out&state="+state+"&page="+atpage+"&pageSize="+pageSize,
        type: "GET",
        dataType: "jsonp",
        success: function (data) {
            if(data && data.state != 200){
                if(data.state == 101){
                    objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
                }else{
                    var list = data.info.list, pageInfo = data.info.pageInfo, html = [], durl = $(".tab ul").data("url"), rUrl = $(".tab ul").data("refund"), cUrl = $(".tab ul").data("comment");
                    console.log(state);
                    switch(state){
                        case "":
                            totalCount = pageInfo.totalCount;
                            break;
                        case "0":
                            totalCount = pageInfo.unpaid;
                            break;
                        case "1":
                            totalCount = pageInfo.ongoing;
                            break;
                        case "3":
                            totalCount = pageInfo.recei;
                            break;
                        case "4":
                            totalCount = pageInfo.success;
                            break;
                        case "5":
                            totalCount = pageInfo.rates;
                            break;
                        case "6":
                            totalCount = pageInfo.refunded;
                            break;
                        case "7":
                            totalCount = pageInfo.closed;
                            break;
                        case "10":
                            totalCount = pageInfo.cancel;
                            break;
                    }

                    var msg = totalCount == 0 ? langData['siteConfig'][20][126] : langData['siteConfig'][20][185];

                    //拼接列表
                    if(list.length > 0){
                    	$('.no-data').show();
                        for(var i = 0; i < list.length; i++){
                            var item       = [],
                                id         = list[i].id,
                                ordernum   = list[i].ordernum,
                                orderstate = list[i].orderstate,
                                retState   = list[i].retState,
                                orderdate  = huoniao.transTimes(list[i].orderdate, 1),
                                expDate    = list[i].expDate,
                                payurl     = list[i].payurl,
                                member     = list[i].member,
                                common     = list[i].common,
                                commonUrl  = list[i].commonUrl,
                                paytype    = list[i].paytype,
                                totalPayPrice  = list[i].totalPayPrice,
                                store      = list[i].store,
                                product    = list[i].product;

                            var detailUrl = durl.replace("%id%", id);
                            var refundlUrl = rUrl.replace("%id%", id);
                            var commentUrl = cUrl.replace("%id%", id);
                            var stateInfo = btn = "";

                            switch(orderstate){
                                case "1":
                                    stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][25]+'</span></p>';
                                    btn = '<a href="'+refundlUrl+'" class="sureBtn btn-bg">'+langData['siteConfig'][6][154]+'</a>';
                                    break;
                                case "3":
									//申请退款
									if(retState == 1){

										//还未发货
										if(expDate == 0){
											stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][55]+'</span></p>';  //未发货，买家申请退款

											//已经发货
										}else{
											stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][56]+'</span></p>';  //已发货，买家申请退款
										}
										// btn = '<a href="'+detailUrl+'" class="sureBtn btn-bg">'+langData['siteConfig'][26][169]+'</a>'; // 确认退款

										//未申请退款
									}else{
										stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][26]+'</span></p>';
										//btn = '<a href="'+detailUrl+'" class="sureBtn sh">'+langData['siteConfig'][6][45]+'</a>';
									}
                                    // stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][41]+'</span></p>';
                                    break;
                                case "4":
                                    stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][6][3]+'</span></p>';
                                    break;
                                case "6":

                                    //申请退款
                                    if(retState == 1){

                                        //还未发货
                                        if(expDate == 0){
                                            stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][43]+'</span></p>';

                                            //已经发货
                                        }else{
                                            stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][42]+'</span></p>';
                                        }

                                        //未申请退款
                                    }else{
                                        stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][26]+'</span></p>';
                                        //btn = '<a href="'+detailUrl+'" class="sureBtn sh">'+langData['siteConfig'][6][45]+'</a>';
                                    }
                                    break;
                                case "7":
                                    stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][34]+'</span></p>';
                                    break;
                            }

							html.push('<dl class="myitem" data-id="'+list[i].id+'">');
							html.push('<dt><p class="shop_name"><i></i><span>'+member.nickname+'</span></p><p class="order-state"><span>'+stateInfo+'</span></p></dt>');
							html.push('<dd class="info-content">');
							//var totalCount = 0;
							for(var p = 0; p < product.length; p++){
								html.push('<a href="'+detailUrl+'">');
								html.push('<div class="fn-clear"><div class="imgbox-l"><img src="'+product[p].litpic+'" /></div><div class="info-proname"><p>'+product[p].title+'</p><p class="price"><em>'+(echoCurrency('symbol'))+'</em>'+Math.floor(product[p].price)+'<em>'+(product[p].price).substring((product[p].price).indexOf('.'),(product[p].price).length)+'</em></p></div></div>')
								html.push('</a>');
							}
							html.push('<div class="btn-group" data-action="info">'+btn+'</div>');
							html.push('</dd>');
							html.push('</dl>');


                        }

                        objId.append(html.join(""));
                        $('.no-data').hide();
                        $('.loading').remove();
                        isload = false;

                    }else{
                       $('.loading').remove();
						if(totalCount==0 && atpage==1){
							$('.no-data').show();
						}else{
							objId.append("<p class='loading'>"+msg+"</p>");
						}
                    }

                    $("#total").html(pageInfo.totalCount);
                    $("#unpaid").html(pageInfo.unpaid);
                    $("#unused").html(pageInfo.ongoing);
                    $("#used").html(pageInfo.success);
                    $("#refund").html(pageInfo.refunded);
                    $("#rates").html(pageInfo.rates);
                    $("#recei").html(pageInfo.recei);
                    $("#closed").html(pageInfo.closed);
                    $("#cancel").html(pageInfo.cancel);

                }
            }else{
                objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
            }
        }
    });
}
