var objId = $("#list"), isload = true;
$(function(){

    //APP端取消下拉刷新
    toggleDragRefresh('off');

  var device = navigator.userAgent;
  if (device.indexOf('huoniao_iOS') > -1) {
    $('body').addClass('huoniao_iOS');
  }

  //获取待处理订单
  if(module == "" && state != '' && $('.tabList').size() > 0){

      $.ajax({
          url: '/include/ajax.php?service=member&action=getModuleOrderList&state=' + state,
          type: 'post',
          dataType: 'json',
          success: function(data){
            if(data.state==100){
              var shop = data.info.shop;
              var tuan = data.info.tuan;
              var waimai = data.info.waimai;
              var paotui = data.info.paotui;
              var jfsc = data.info.jfsc;
              var homemaking = data.info.homemaking;
              var travel = data.info.travel;
              var education = data.info.education;
              var legou = data.info.legou;
              var paimai = data.info.paimai;
              if(shop > 0){
                  $('.shop-li').addClass('number').find('.right_number').text(shop>99?'99+':shop);
              }
              if(tuan > 0){
                  $('.tuan-li').addClass('number').find('.right_number').text(tuan>99?'99+':tuan);
              }
              if(waimai > 0){
                $('.waimai-li').addClass('number').find('.right_number').text(waimai>99?'99+':waimai);
              }
              if(paotui > 0){
                $('.paotui-li').addClass('number').find('.right_number').text(paotui>99?'99+':paotui);
              }
              if(jfsc > 0){
                $('.integral-li').addClass('number').find('.right_number').text(jfsc>99?'99+':jfsc);
              }
              if(homemaking > 0){
                $('.homemaking-li').addClass('number').find('.right_number').text(homemaking>99?'99+':homemaking);
              }
              if(travel > 0){
                $('.travel-li').addClass('number').find('.right_number').text(travel>99?'99+':travel);
              }
              if(education > 0){
                $('.education-li').addClass('number').find('.right_number').text(education>99?'99+':education);
              }
              if(legou > 0){
                $('.awardlegou-li').addClass('number').find('.right_number').text(legou>99?'99+':legou);
              }
              if(paimai > 0){
                $('.paimai-li').addClass('number').find('.right_number').text(paimai>99?'99+':paimai);
              }

            }
          }
      })

      //订单链接增加状态
      if(state == 1){
        let moldArr=['tuan','shop','waimai','paotui','integral','homemaking','travel','education','paimai'];
        for(let i=0;i<moldArr.length;i++){
          let item=moldArr[i];
          $(`.${item}-li a`).attr('href', $(`.${item}-li a`).attr('href') + '?state=0').attr('data-param',$(`.${item}-li a`).attr('data-param') + '&state=0');
        }
      }
      if(state == 2){
        $('.tuan-li a').attr('href', $('.tuan-li a').attr('href') + '?state=1').attr('data-param',$('.tuan-li a').attr('data-param') + '&state=1');
        $('.shop-li a').attr('href', $('.shop-li a').attr('href') + '?state=6,3').attr('data-param',$('.shop-li a').attr('data-param') + '&state=6,3');
        $('.travel-li a').attr('href', $('.travel-li a').attr('href') + '?state=1').attr('data-param',$('.travel-li a').attr('data-param') + '&state=1');
        $('.education-li a').attr('href', $('.education-li a').attr('href') + '?state=1').attr('data-param',$('.education-li a').attr('data-param') + '&state=1');
      }
      if(state == 3){
        $('.shop-li a').attr('href', $('.shop-li a').attr('href') + '?state=1').attr('data-param',$('.tuan-li a').attr('data-param') + '&state=1');
        $('.integral-li a').attr('href', $('.integral-li a').attr('href') + '?state=1').attr('data-param',$('.integral-li a').attr('data-param') + '&state=1');
        $('.awardlegou-li a').attr('href', $('.awardlegou-li a').attr('href') + '?state=5').attr('data-param',$('.awardlegou-li a').attr('data-param') + '&state=5');
        $('.paimai-li a').attr('href', $('.paimai-li a').attr('href') + '?state=6').attr('data-param',$('.paimai-li a').attr('data-param') + '&state=6');
      }
      if(state == 4){
        $('.tuan-li a').attr('href', $('.tuan-li a').attr('href') + '?state=6').attr('data-param',$('.tuan-li a').attr('data-param') + '&state=6');
        $('.shop-li a').attr('href', $('.shop-li a').attr('href') + '?state=6').attr('data-param',$('.shop-li a').attr('data-param') + '&state=6');
        $('.integral-li a').attr('href', $('.integral-li a').attr('href') + '?state=6').attr('data-param',$('.integral-li a').attr('data-param') + '&state=6');
        $('.homemaking-li a').attr('href', $('.homemaking-li a').attr('href') + '?state=5').attr('data-param',$('.homemaking-li a').attr('data-param') + '&state=5');
        $('.paimai-li a').attr('href', $('.paimai-li a').attr('href') + '?state=3').attr('data-param',$('.paimai-li a').attr('data-param') + '&state=3');
      }
      if(state == 5){
        $('.tuan-li a').attr('href', $('.tuan-li a').attr('href') + '?state=5').attr('data-param',$('.tuan-li a').attr('data-param') + '&state=5');
        $('.shop-li a').attr('href', $('.shop-li a').attr('href') + '?state=5').attr('data-param',$('.shop-li a').attr('data-param') + '&state=5');
        $('.waimai-li a').attr('href', $('.waimai-li a').attr('href') + '?state=1').attr('data-param',$('.waimai-li a').attr('data-param') + '&state=1');
        $('.paotui-li a').attr('href', $('.paotui-li a').attr('href') + '?state=8').attr('data-param',$('.paotui-li a').attr('data-param') + '&state=8');
      }
      if(state == 6){
        $('.shop-li a').attr('href', $('.shop-li a').attr('href') + '?state=6,4').attr('data-param',$('.shop-li a').attr('data-param') + '&state=6,4');
      }
      if(state == 7){
        $('.tuan-li a').attr('href', $('.tuan-li a').attr('href') + '?state=4').attr('data-param',$('.tuan-li a').attr('data-param') + '&state=4');
        $('.shop-li a').attr('href', $('.shop-li a').attr('href').replace('order-shop', 'refundlist_shop'));
        $('.homemaking-li a').attr('href', $('.homemaking-li a').attr('href') + '?state=8').attr('data-param',$('.homemaking-li a').attr('data-param') + '&state=08');
        $('.travel-li a').attr('href', $('.travel-li a').attr('href') + '?state=8').attr('data-param',$('.travel-li a').attr('data-param') + '&state=8');
        $('.awardlegou-li a').attr('href', $('.awardlegou-li a').attr('href') + '?state=9,9').attr('data-param',$('.awardlegou-li a').attr('data-param') + '&state=9,9');
      }


  }
  if (dispatchid) {
    (async res => {
      let data = {
        service: 'homemaking',
        action: 'orderList',
        state: 10,
        page: 1,
        pageSize: 1,
        dispatchid: dispatchid,
      }
      let result = await ajax(data, { dataType: 'json' });
      console.log(result);
      if (result.state == 100) {
        let pageInfo = result.info.pageInfo;
        if (pageInfo.state10 > 0) {
          $('.ts-right span').css({ 'display': 'flex' }).text(pageInfo.state10)
        }
      }
    })()
  }
  // 选择模块
//$('.orderbtn').click(function(){
//  var t = $(this);
//  if (!t.hasClass('on')) {
//    if (device.indexOf('huoniao_iOS') > -1) {
//  		$('.orderbox').css("top", "calc(.9rem + 20px)");
//  	}else {
//      $('.orderbox').animate({"top":".9rem"},200);
//  	}
//    $('.mask').show().animate({"opacity":"1"},200);
//    $('body').addClass('fixed');
//    t.addClass('on');
//  }else {
//    hideMask();
//  }
//})
//
//$('.mask').click(function(){
//  hideMask();
//})

  // 隐藏下拉框跟遮罩层
  function hideMask(){
    $('body').removeClass('fixed');
    $('.orderbtn').removeClass('on');
    $('.orderbox').animate({"top":"-100%"},200);
    $('.mask').hide().animate({"opacity":"0"},200);
  }

	//状态切换
	$(".tab ul li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("curr") && !t.hasClass("sel") && module == ""){
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

	getList(1);

	// 删除
	objId.delegate(".del", "click", function(){
		var t = $(this), par = t.closest(".myitem"), id = par.attr("data-id"), action = t.closest('.btn-group').attr('data-action');

		if(id){
			if(confirm(langData['siteConfig'][20][182])){
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service="+action+"&action=delOrder&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){

							//删除成功后移除信息层并异步获取最新列表
							objId.html('');
							atpage = 1;
							getList();

						}else{
							var popOptions = {
                btnCancel:'确定',
                    title:data.info,
                    btnColor:'#222',
                    noSure:true,
                    isShow:true
                }
              confirmPop(popOptions);
							t.siblings("a").show();
							t.removeClass("load");
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
						t.siblings("a").show();
						t.removeClass("load");
					}
				});
			};
		}
	});

	//退款
	objId.delegate(".refund", "click", function(){
		var t = $(this), url = t.parent().siblings('a').attr('href');
		if(url != '' && url != undefined){
			location.href = url;
		}
	});

	//团购券
	objId.delegate(".showQrcode", "click", function(){
		var t = $(this), url = t.data('code');
		if(url != '' && url != undefined){
			url = tuanQR + url ;
			$('.tymodal img').attr('src', url);
			$('.disk').show();
			$('.tymodal').removeClass('fn-hide');
		}
	});


	$('.tymodal .close,.disk').click(function(){
			$('.tymodal').addClass('fn-hide');
			$('.disk').hide();
	})

  if($('.tab-ul li').length>9){
    $('.tab-ul.order').addClass('more');
  }else{
    $('.tab-ul.order .tab-li.business-order').eq(1).css({'margin-left':'.2rem'});
    $('.tab-ul.order .tab-li.business-order').eq(3).css({'margin-left':'.2rem'});
  }
  $('.tab-ul.order').css({'display':'flex'});
})


function getList(is){

	return false;

  isload = true;

	if(is != 1){
		// $('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();


	$.ajax({
		url: masterDomain+"/include/ajax.php?service=member&action=orderList&state="+state+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+data.info+"</p>");
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [],
              tuanUrl = $(".tab ul").data("tuanurl"),
              shopUrl = $(".tab ul").data("shopurl"),
              infoUrl = $(".tab ul").data("infourl"),
              waimaiUrl = $(".tab ul").data("waimaiurl"),
              shopRefund = $(".tab ul").data("shoprefund"),
              shopComment = $(".tab ul").data("shopcomment");
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
						case "2":
							totalCount = pageInfo.expired;
							break;
						case "3":
							totalCount = pageInfo.success;
							break;
						case "4":
							totalCount = pageInfo.refunded;
							break;
						case "5":
							totalCount = pageInfo.rates;
							break;
						case "6":
							totalCount = pageInfo.recei;
							break;
						case "7":
							totalCount = pageInfo.closed;
							break;
					}

					var msg = totalCount == 0 ? langData['siteConfig'][20][126] : langData['siteConfig'][20][185];
					//拼接列表
					if(list.length > 0){
						for(var i = 0; i < list.length; i++){
              var tab = list[i].tab;
              if (tab == 'tuan') {
                var item     = [],
  								id         = list[i].id,
  								company    = list[i].company,
  								ordernum   = list[i].ordernum,
  								proid      = list[i].proid,
  								procount   = list[i].procount,
  								orderprice = list[i].orderprice,
  								orderstate = list[i].orderstate,
  								paydate    = list[i].paydate,
  								retState   = list[i].retState,
  								expDate    = list[i].expDate,
  								orderdate  = huoniao.transTimes(list[i].orderdate, 1).replace(new Date().getFullYear() + "-", ""),
  								title      = list[i].product.title,
  								enddate    = huoniao.transTimes(list[i].product.enddate, 2),
  								litpic     = list[i].product.litpic,
  								url        = list[i].product.url,
  								payurl     = list[i].payurl,
  								common     = list[i].common,
  								commonUrl  = list[i].commonUrl;

                var stateInfo = btn = "";
                var detailUrl = tuanUrl.replace("%id%", id);

                switch(orderstate){
                  case "0":
                    stateInfo = '<span class="state">'+langData['siteConfig'][9][22]+'</span>';
                    btn = '<a href="javascript:;" class="blueBtn del">'+langData['siteConfig'][6][65]+'</a><a href="'+payurl+'" class="sureBtn">'+langData['siteConfig'][6][64]+'</a>';
                    break;
                  case "1":
                    stateInfo = '<span class="state">'+langData['siteConfig'][9][24]+'</span>';
                    break;
                  case "2":
                    if(paydate != 0){
                      stateInfo = '<span class="state">'+langData['siteConfig'][9][29]+'</span>';
                    }else{
                      stateInfo = '<span class="state">'+langData['siteConfig'][9][40]+'</span>';
                      btn = '<a href="javascript:;" class="blueBtn del">'+langData['siteConfig'][6][65]+'</a>';
                    }
                    break;
                  case "3":
                    stateInfo = '<span class="state">'+langData['siteConfig'][9][37]+'</span>';
                    if(common == 1){
                      btn = '<a href="'+commonUrl+'" class="sureBtn">'+langData['siteConfig'][8][2]+'</a>';
                    }else{
                      btn = '<a href="'+commonUrl+'" class="sureBtn">'+langData['siteConfig'][19][365]+'</a>';
                    }

                    break;
                  case "4":
                    stateInfo = '<span class="state">'+langData['siteConfig'][9][27]+'</span>';
                    // btn = '<a href="javascript:;" class="edit">退款去向</a>';
                    break;
                  case "6":

                    //申请退款
                    if(retState == 1){

                      //还未发货
                      if(expDate == 0){
                        stateInfo = '<span class="state">'+langData['siteConfig'][9][44]+'</span>';

                      //已经发货
                      }else{
                        stateInfo = '<span class="state">'+langData['siteConfig'][9][42]+'</span>';
                      }

                    //未申请退款
                    }else{
                      stateInfo = '<span class="state">'+langData['siteConfig'][9][26]+'</span>';
                      btn = '<a href="'+detailUrl+'" class="sureBtn">'+langData['siteConfig'][6][45]+'</a>';
                    }
                    break;
                  case "7":
                    stateInfo = '<span class="state">'+langData['siteConfig'][9][34]+'</span>';
                    // btn = '<a href="javascript:;" class="edit">退款去向</a>';
                    break;
                }


  							html.push('<div class="item" data-id="'+id+'">');
  							html.push('<p class="order-number fn-clear"><span class="fn-left">'+langData['siteConfig'][19][308]+'：'+ordernum+'</span><span class="time">'+orderdate+'</span></p>');
  							html.push('<p class="store fn-clear">');
  							html.push('<span class="title fn-clear"><img src="'+templateSkin+'images/order_tuan.png"><em class="sname">'+company+'</em></span>');
  							html.push('<span class="state">'+stateInfo+'</span>');
  							html.push('</p>');

  							html.push('<a href="'+detailUrl+'">');
  							html.push('<div class="fn-clear">');
  							html.push('<div class="imgbox"><img src="'+litpic+'" alt=""></div>');
  							html.push('<div class="txtbox">');
  							html.push('<p class="gname">'+title+'</p>');
  							html.push('</div>');
  							html.push('<div class="pricebox">');
  							html.push('<p class="price">'+(echoCurrency('symbol'))+orderprice+'</p>');
  							html.push('<p class="mprice">×'+procount+'</p>');
  							html.push('</div>');
  							html.push('</div>');
  							html.push('</a>');
  							html.push('<p class="btns fn-clear" data-action="tuan"><a href="'+detailUrl+'" class="blueBtn">'+langData['siteConfig'][19][313]+'</a>'+btn+'</p>');
  							html.push('</div>');

              }else if (tab == 'shop') {
                var item       = [],
  									id         = list[i].id,
  									ordernum   = list[i].ordernum,
  									orderstate = list[i].orderstate,
  									retState   = list[i].retState,
  									orderdate  = huoniao.transTimes(list[i].orderdate, 1),
  									expDate    = list[i].expDate,
  									payurl     = list[i].payurl,
  									common     = list[i].common,
  									commonUrl  = list[i].commonUrl,
  									paytype    = list[i].paytype,
  									totalPayPrice  = list[i].totalPayPrice,
  									store      = list[i].store,
  									product    = list[i].product;

                var detailUrl = shopUrl.replace("%id%", id);
  							var refundlUrl = shopRefund.replace("%id%", id);
  							var commentUrl = shopComment.replace("%id%", id);
  							var stateInfo = btn = "";

  							switch(orderstate){
  								case "0":
  									stateInfo = '<span class="state">'+langData['siteConfig'][9][22]+'</span>';
  									btn = '<a href="javascript:;" class="blueBtn del">'+langData['siteConfig'][6][65]+'</a><a href="'+payurl+'" class="sureBtn">'+langData['siteConfig'][6][64]+'</a>';
  									break;
  								case "1":
  									stateInfo = '<span class="state">'+langData['siteConfig'][9][25]+'</span>';
  									btn = '<a href="'+refundlUrl+'" class="sureBtn">'+langData['siteConfig'][6][66]+'</a>';
  									break;
  								case "3":
  									stateInfo = '<span class="state">'+langData['siteConfig'][9][37]+'</span>';
  									if(common == 1){
  										btn = '<a href="'+commentUrl+'" class="sureBtn">'+langData['siteConfig'][8][2]+'</a>';
  									}else{
  										btn = '<a href="'+commentUrl+'" class="sureBtn">'+langData['siteConfig'][19][365]+'</a>';
  									}
  									break;
  								case "4":
  									stateInfo = '<span class="state">'+langData['siteConfig'][9][27]+'</span>';
  									break;
  								case "6":

  									//申请退款
  									if(retState == 1){

  										//还未发货
  										if(expDate == 0){
  											stateInfo = '<span class="state">'+langData['siteConfig'][9][43]+'</span>';

  										//已经发货
  										}else{
  											stateInfo = '<span class="state">'+langData['siteConfig'][9][42]+'</span>';
  										}

  									//未申请退款
  									}else{
  										stateInfo = '<span class="state">'+langData['siteConfig'][9][26]+'</span>';
  										btn = '<a href="'+detailUrl+'" class="sureBtn sh">'+langData['siteConfig'][6][45]+'</a>';
  									}
  									break;
  								case "7":
  									stateInfo = '<span class="state">'+langData['siteConfig'][9][34]+'</span>';
  									break;
  								case "10":
  									stateInfo = '<span class="state">'+langData['siteConfig'][6][15]+'</span>';
  									break;
  							}

  							html.push('<div class="item" data-id="'+list[i].id+'">');
  							html.push('<p class="order-number fn-clear"><span class="fn-left">'+langData['siteConfig'][19][308]+'：'+ordernum+'</span><span class="time">'+orderdate+'</span></p>');
  							html.push('<p class="store fn-clear">');
  							html.push('<span class="title fn-clear"><img src="'+templateSkin+'images/order_shop.png"><em class="sname">'+store.title+'</em></span>'+stateInfo+'</p>');
  							html.push('<div class="shop-list">');
  							var totalCount = 0;
  							if(product) {
                                for (var p = 0; p < product.length; p++) {
                                    totalCount = totalCount + Number(product[p].count);
                                    html.push('<div class="shop-item">');
                                    html.push('<a href="' + product[p].url + '" class="fn-clear">');
                                    html.push('<div class="imgbox"><img src="' + product[p].litpic + '" alt=""></div>');
                                    html.push('<div class="txtbox">');
                                    html.push('<p class="gname">' + product[p].title + '</p>');
                                    // html.push('<p class="gray">颜色：白色</p>');
                                    html.push('</div>');
                                    html.push('<div class="pricebox">');
                                    html.push('<p class="price">' + (echoCurrency('symbol')) + product[p].price + '</p>');
                                    html.push('<p class="mprice">×' + product[p].count + '</p>');
                                    html.push('</div>');
                                    html.push('</a>');
                                    html.push('</div>');
                                }
                            }
  							html.push('</div>');
  							html.push('<p class="sum">'+langData['siteConfig'][19][689].replace('1', totalCount)+langData['siteConfig'][19][319]+'：<font class="blue">'+totalPayPrice+'</font></p>');
  							html.push('<p class="btns fn-clear" data-action="shop"><a href="'+detailUrl+'" class="blueBtn">'+langData['siteConfig'][19][313]+'</a>'+btn+'</p>');
  							html.push('</div>');

              }else if (tab == 'info') {
                  var item       = [],
                      id         = list[i].id,
                      ordernum   = list[i].ordernum,
                      orderstate = list[i].orderstate,
                      retState   = list[i].retState,
                      orderdate  = huoniao.transTimes(list[i].orderdate, 1),
                      expDate    = list[i].expDate,
                      payurl     = list[i].payurl,
                      common     = list[i].common,
                      commonUrl  = list[i].commonUrl,
                      paytype    = list[i].paytype,
                      totalPayPrice  = list[i].totalPayPrice,
                      store      = list[i].store,
                      product    = list[i].product;

                  var detailUrl = infoUrl.replace("%id%", id);
                  var refundlUrl = shopRefund.replace("%id%", id);
                  var commentUrl = shopComment.replace("%id%", id);
                  var stateInfo = btn = "";

                  switch(orderstate){
                      case "0":
                          stateInfo = '<span class="state">'+langData['siteConfig'][9][22]+'</span>';
                          btn = '<a href="javascript:;" class="blueBtn del">'+langData['siteConfig'][6][65]+'</a><a href="'+payurl+'" class="sureBtn">'+langData['siteConfig'][6][64]+'</a>';
                          break;
                      case "1":
                          stateInfo = '<span class="state">'+langData['siteConfig'][9][25]+'</span>';
                          btn = '<a href="'+refundlUrl+'" class="sureBtn">'+langData['siteConfig'][6][66]+'</a>';
                          break;
                      case "3":
                          stateInfo = '<span class="state">'+langData['siteConfig'][9][26]+'</span>';
                          btn = '<a href="'+detailUrl+'" class="sureBtn sh">'+langData['siteConfig'][6][45]+'</a>';
                          break;
                      case "4":
                          stateInfo = '<span class="state">'+langData['siteConfig'][9][27]+'</span>';
                          break;
                      case "6":

                          //申请退款
                          if(retState == 1){

                              //还未发货
                              if(expDate == 0){
                                  stateInfo = '<span class="state">'+langData['siteConfig'][9][43]+'</span>';

                                  //已经发货
                              }else{
                                  stateInfo = '<span class="state">'+langData['siteConfig'][9][42]+'</span>';
                              }

                              //未申请退款
                          }else{
                              stateInfo = '<span class="state">'+langData['siteConfig'][9][26]+'</span>';
                              btn = '<a href="'+detailUrl+'" class="sureBtn sh">'+langData['siteConfig'][6][45]+'</a>';
                          }
                          break;
                      case "7":
                          stateInfo = '<span class="state">'+langData['siteConfig'][9][34]+'</span>';
                          break;
                      case "10":
                          stateInfo = '<span class="state">'+langData['siteConfig'][6][15]+'</span>';
                          break;
                  }

                  html.push('<div class="item" data-id="'+list[i].id+'">');
                  html.push('<p class="order-number fn-clear"><span class="fn-left">'+langData['siteConfig'][19][308]+'：'+ordernum+'</span><span class="time">'+orderdate+'</span></p>');
                  html.push('<p class="store fn-clear">');
                  html.push('<span class="title fn-clear"><img src="'+templateSkin+'images/order_shop.png"><em class="sname">'+store.title+'</em></span>'+stateInfo+'</p>');
                  html.push('<div class="shop-list">');
                  var totalCount = 0;
                  if(product) {
                      for (var p = 0; p < product.length; p++) {
                          totalCount = totalCount + Number(product[p].count);
                          html.push('<div class="shop-item">');
                          html.push('<a href="' + product[p].url + '" class="fn-clear">');
                          html.push('<div class="imgbox"><img src="' + product[p].litpic + '" alt=""></div>');
                          html.push('<div class="txtbox">');
                          html.push('<p class="gname">' + product[p].title + '</p>');
                          // html.push('<p class="gray">颜色：白色</p>');
                          html.push('</div>');
                          html.push('<div class="pricebox">');
                          html.push('<p class="price">' + (echoCurrency('symbol')) + product[p].price + '</p>');
                          html.push('<p class="mprice">×' + 1 + '</p>');
                          html.push('</div>');
                          html.push('</a>');
                          html.push('</div>');
                      }
                  }
                  html.push('</div>');
                  html.push('<p class="sum">'+langData['siteConfig'][19][689]+langData['siteConfig'][19][319]+'：<font class="blue">'+totalPayPrice+'</font></p>');
                  html.push('<p class="btns fn-clear" data-action="info"><a href="'+detailUrl+'" class="blueBtn">'+langData['siteConfig'][19][313]+'</a>'+btn+'</p>');
                  html.push('</div>');

              }else {
                var item       = [],
  									id         = list[i].id,
  									ordernum   = list[i].ordernum,
  									proid      = list[i].proid,
                    menus     = list[i].menus,
  									storename  = list[i].storename,
  									orderprice = list[i].orderprice,
  									orderstate = list[i].state,
  									paydate    = list[i].paydate,
  									retState   = list[i].retState,
  									expDate    = list[i].expDate,
  									orderdate  = huoniao.transTimes(list[i].orderdate, 1),
  									payurl     = list[i].payurl,
  									common     = list[i].common,
  									commonUrl  = list[i].commonUrl;

                    var stateInfo = btn = "";
                    switch(orderstate){
                      case "0":
                        stateInfo = '<span class="state">'+langData['siteConfig'][9][22]+'</span>';
                        btn = '<a href="javascript:;" class="blueBtn del">'+langData['siteConfig'][6][65]+'</a><a href="'+payurl+'" class="sureBtn">'+langData['siteConfig'][6][64]+'</a>';
                        break;
                      case "1":
                        stateInfo = '<span class="state">'+langData['siteConfig'][9][24]+'</span>';
                        break;
                      case "2":
                        if(paydate != 0){
                          stateInfo = '<span class="state">'+langData['siteConfig'][9][45]+'</span>';
                        }else{
                          stateInfo = '<span class="state">'+langData['siteConfig'][9][40]+'</span>';
                          btn = '<a href="javascript:;" class="blueBtn del">'+langData['siteConfig'][6][65]+'</a>';
                        }
                        break;
                      case "3":
                        stateInfo = '<span class="state">'+langData['siteConfig'][9][37]+'</span>';

                        break;
                    }

                    var detailUrl = waimaiUrl.replace("%id%", id);

    							html.push('<div class="item" data-id="'+id+'">');
  								html.push('<p class="order-number fn-clear"><span class="fn-left">'+langData['siteConfig'][19][308]+'：'+ordernum+'</span><span class="time">'+orderdate+'</span></p>');
  								html.push('<p class="store fn-clear">');
  								html.push('<span class="title fn-clear"><img src="'+templateSkin+'images/order_waimai.png"><em class="sname">'+storename+'</em></span>'+stateInfo+'</p>');
  								html.push('<a href="javascript:;">');
  								html.push('<div class="waimai-list">');

  								var totalCount = 0;
  								if(menus) {
                      for (var j = 0; j < menus.length; j++) {
                          totalCount = totalCount + Number(menus[j].count);
                          html.push('<p class="fn-clear"><span class="waimai-name">' + menus[j].pname + '</span><span class="waimai-amount">×' + menus[j].count + '</span></p>');
                      }
                  }

                  html.push('</div>');
                  html.push('</a>');
  								html.push('<p class="sum">'+langData['siteConfig'][19][319].replace('1', totalCount)+langData['siteConfig'][19][319]+'：<font class="blue">'+list[i].price+'</font></p>');
  								html.push('<p class="btns fn-clear" data-action="waimai"><a href="'+detailUrl+'" class="blueBtn">'+langData['siteConfig'][19][313]+'</a>'+btn+'</p>');
    							html.push('</div>');
              }
						}

						objId.append(html.join(""));
            $('.loading').remove();
            isload = false;

					}else{
            $('.loading').remove();
						objId.append("<p class='loading'>"+msg+"</p>");
					}

					$("#total").html(pageInfo.totalCount);
					$("#unpaid").html(pageInfo.unpaid);
					$("#unused").html(pageInfo.unused);
					$("#recei").html(pageInfo.recei);
					$("#used").html(pageInfo.used);

				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][19][308]+"</p>");
			}
		}
	});
}
