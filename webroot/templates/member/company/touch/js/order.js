var objId = $("#list"), isload = true;
$(function(){

  var device = navigator.userAgent;
  if (device.indexOf('huoniao_iOS') > -1) {
    $('body').addClass('huoniao_iOS');
  }

  // 选择模块
  $('.orderbtn').click(function(){
    var t = $(this);
    if (!t.hasClass('on')) {
      if (device.indexOf('huoniao_iOS') > -1) {
    		$('.orderbox').css("top", "calc(.9rem + 20px)");
    	}else {
        $('.orderbox').animate({"top":".9rem"},200);
    	}
      $('.mask').show().animate({"opacity":"1"},200);
      $('body').addClass('fixed');
      t.addClass('on');
    }else {
      hideMask();
    }
  })

  $('.mask').click(function(){
    hideMask();
  })

  $('.orderbox li').click(function(){
    var t = $(this), tab = t.attr('data-tab');
    t.addClass('curr').siblings('li').removeClass('curr');
    $('.tab-'+tab).removeClass('dn').siblings().addClass('dn');
    hideMask();
  })

  // 隐藏下拉框跟遮罩层
  function hideMask(){
    $('body').removeClass('fixed');
    $('.orderbtn').removeClass('on');
    $('.orderbox').animate({"top":"-100%"},200);
    $('.mask').hide().animate({"opacity":"0"},200);
  }


	//状态切换
	$(".tab li").bind("click", function(){
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
    var h = $('.item').height();
    var allh = $('body').height();
    var w = $(window).height();
    var scroll = allh - w - h;
    if ($(window).scrollTop() > scroll && !isload) {
      atpage++;
      getList();
    };
  });

  if (module == "") {
  	getList(1);
  }

	// 删除
	objId.delegate(".del", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		if(id){
			if(confirm(langData['siteConfig'][20][182])){
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: "/include/ajax.php?service=tuan&action=delOrder&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){

							//删除成功后移除信息层并异步获取最新列表
							objId.html('');
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


  // 送餐电话
  $('.list').delegate('.wmSure', 'click', function(){
    $(this).closest('.item').addClass('wcurr');
    $('.waimai-tel, .disk').show();
  })

	// 关闭送餐电话
  $('.waimai-tel .close, .canExp').click(function(){
    $('.waimai-tel, .disk').hide();
  })

  $('#expBtn').click(function(){
    var id = $('.wcurr').attr('data-id'), songNote = self.parent.$("#exp-number").val();
		$.ajax({
			url: "/include/ajax.php?service=waimai&action=peisongOrder",
			data: "id="+id+"&songNote="+encodeURIComponent(songNote),
			type: "POST",
			dataType: "json",
			success: function(data){
				if(data && data.state == 100){
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
				}
			}
		});
		return false;
  })


})


function getList(is){

  isload = true;

	if(is != 1){
		// $('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();


	$.ajax({
		url: "/include/ajax.php?service=member&action=storeOrderList&state="+state+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+data.info+"</p>");
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
          var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";

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
							totalCount = pageInfo.refund;
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

					$("#total").html(pageInfo.totalCount);
					$("#unpaid").html(pageInfo.unpaid);
					$("#unused").html(pageInfo.unused);
					$("#recei").html(pageInfo.recei);
					$("#used").html(pageInfo.used);
					$("#refund").html(pageInfo.refund);


					//拼接列表
					if(list.length > 0){
						for(var i = 0; i < list.length; i++){
              var tab = list[i].tab;
              if (tab == 'tuan') {
                var item       = [],
										id         = list[i].id,
										company    = list[i].company,
										ordernum   = list[i].ordernum,
										proid      = list[i].proid,
										procount   = list[i].procount,
										orderprice = list[i].orderprice,
										orderstate = list[i].orderstate,
										retState   = list[i].retState,
										expDate    = list[i].expDate,
										orderdate  = huoniao.transTimes(list[i].orderdate, 1),
										title      = list[i].product.title,
										enddate    = huoniao.transTimes(list[i].product.enddate, 2),
										litpic     = list[i].product.litpic,
										url        = list[i].product.url;

								var stateInfo = btn = "";
								var urlString = tuanEditUrl.replace("%id%", id);

								switch(orderstate){
									case "0":
										stateInfo = langData['siteConfig'][9][22];
										break;
									case "1":
										stateInfo = langData['siteConfig'][9][25];
										btn = '<a href="'+urlString+t+"rates=1"+'" class="sureBtn">'+langData['siteConfig'][6][154]+'</a>';
										break;
									case "2":
										stateInfo = langData['siteConfig'][9][29];
										break;
									case "3":
										stateInfo = langData['siteConfig'][9][37];
										break;
									case "6":
										//申请退款
										if(retState == 1){

											//还未发货
											if(expDate == 0){
												stateInfo = langData['siteConfig'][9][55];

											//已经发货
											}else{
												stateInfo = langData['siteConfig'][9][56];
											}

										//未申请退款
										}else{
											stateInfo = langData['siteConfig'][9][58];
										}
										break;
									case "7":
										stateInfo = langData['siteConfig'][9][34];
										break;
								}

								html.push('<div class="item" data-id="'+id+'">');
								html.push('<p class="order-number fn-clear"><span class="fn-left">'+langData['siteConfig'][19][308]+'：'+ordernum+'</span><span class="time">'+orderdate+'</span></p>');
								html.push('<p class="store fn-clear">');
								html.push('<span class="title fn-clear"><img src="'+templateSkin+'images/order_tuan.png"><em class="sname">'+company+'</em></span>');
								html.push('<span class="state">'+stateInfo+'</span>');
								html.push('</p>');

								html.push('<a href="'+urlString+'">');
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
								html.push('<p class="btns fn-clear"><a href="'+urlString+'" class="blueBtn">'+langData['siteConfig'][19][313]+'</a>'+btn+'</p>');
								html.push('</div>');

              }else if (tab == 'shop') {
                var item       = [],
  									id         = list[i].id,
  									store     = list[i].store,
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
  									member     = list[i].member,
  									product    = list[i].product;

  							var detailUrl = shopEditUrl.replace("%id%", id);
  							var fhUrl = detailUrl.indexOf("?") > -1 ? detailUrl + "&rates=1" : detailUrl + "?rates=1";
  							var stateInfo = btn = "";

  							switch(orderstate){
  								case "1":
  									stateInfo = "<span class='state'>"+langData['siteConfig'][9][25]+"</span>";
  									btn = '<a href="'+fhUrl+'" class="sureBtn">'+langData['siteConfig'][6][154]+'</a>';
  									break;
  								case "3":
  									stateInfo = "<span class='state'>"+langData['siteConfig'][9][37]+"</span>";
  									break;
  								case "4":
  									stateInfo = "<span class='state'>"+langData['siteConfig'][9][27]+"</span>";
  									break;
  								case "6":

  									//申请退款
  									if(retState == 1){

  										//还未发货
  										if(expDate == 0){
  											stateInfo = "<span class='state'>"+langData['siteConfig'][9][43]+"</span>";

  										//已经发货
  										}else{
  											stateInfo = "<span class='state'>"+langData['siteConfig'][9][42]+"</span>";
  										}
  										btn = '<a href="'+detailUrl+'" class="sureBtn">'+langData['siteConfig'][6][153]+'</a>';

  									//未申请退款
  									}else{
  										stateInfo = "<span class='state'>"+langData['siteConfig'][9][26]+"</span>";
  										//btn = '<a href="javascript:;" class="sh">确认收货</a>';
  									}
  									break;
  								case "7":
  									stateInfo = "<span class='state'>"+langData['siteConfig'][9][34]+"</span>";
  									// btn = '<a href="javascript:;" class="edit">退款去向</a>';
  									break;
  							}

								html.push('<div class="item" data-id="'+id+'">');
								html.push('<p class="order-number fn-clear"><span class="fn-left">'+langData['siteConfig'][19][308]+'：'+ordernum+'</span><span class="time">'+orderdate+'</span></p>');
								html.push('<p class="store fn-clear">');
								html.push('<span class="title fn-clear"><img src="'+templateSkin+'images/order_shop.png"><em class="sname">'+store.title+'</em></span>'+stateInfo+'</p>');
								html.push('<div class="shop-list">');
								var totalCount = 0;
                                if(product && product.length > 0){
    								for(var p = 0; p < product.length; p++){
    									totalCount = totalCount + Number(product[p].count);
    									html.push('<div class="shop-item">');
    									html.push('<a href="'+product[p].url+'" class="fn-clear">');
    									html.push('<div class="imgbox"><img src="'+product[p].litpic+'" alt=""></div>');
    									html.push('<div class="txtbox">');
    									html.push('<p class="gname">'+product[p].title+'</p>');
    									html.push('</div>');
    									html.push('<div class="pricebox">');
    									html.push('<p class="price">'+(echoCurrency('symbol'))+product[p].price+'</p>');
    									html.push('<p class="mprice">×'+product[p].count+'</p>');
    									html.push('</div>');
    									html.push('</a>');
    									html.push('</div>');
    								}
                                }
								html.push('</div>');
								html.push('<p class="sum">'+langData['siteConfig'][19][689].replace('1', totalCount)+langData['siteConfig'][19][319]+'：<font class="blue">'+totalPayPrice+'</font></p>');
								html.push('<p class="btns fn-clear"><a href="'+detailUrl+'" class="blueBtn">'+langData['siteConfig'][19][313]+'</a>'+btn+'</p>');
								html.push('</div>');

              }else {
                var item      = [],
									id        = list[i].id,
									ordernum  = list[i].ordernum,
									state     = list[i].state,
									storename = list[i].storename,
									orderdate = huoniao.transTimes(list[i].orderdate, 1),
									price     = parseFloat(list[i].price),
									paytype   = list[i].paytype,
									peisong   = parseFloat(list[i].peisong),
									offer     = parseFloat(list[i].offer),
									note      = list[i].note;
									menus     = list[i].menus;

								var stateInfo = btn = "";

								switch(state){
									case "1":
										stateInfo = "<span class='state'>"+langData['siteConfig'][9][25]+"</span>";
										btn = '<a href="javascript:;" class="btn wmSure sureBtn">'+langData['siteConfig'][6][155]+'</a>';
										break;
									case "3":
										stateInfo = "<span class='state'>"+langData['siteConfig'][9][37]+"</span>";
										break;
								}

								html.push('<div class="item" data-id="'+id+'">');
								html.push('<p class="order-number fn-clear"><span class="fn-left">'+langData['siteConfig'][19][308]+'：'+ordernum+'</span><span class="time">'+orderdate+'</span></p>');
								html.push('<p class="store fn-clear">');
								html.push('<span class="title fn-clear"><img src="'+templateSkin+'images/order_waimai.png"><em class="sname">'+storename+'</em></span>'+stateInfo+'</p>');
								html.push('<a href="javascript:;">');
								html.push('<div class="waimai-list">');

								var totalCount = 0;
                for (var j = 0; j < menus.length; j++) {
									totalCount = totalCount + Number(menus[j].count);
    							html.push('<p class="fn-clear"><span class="waimai-name">'+menus[j].pname+'</span><span class="waimai-amount">×'+menus[j].count+'</span></p>');
                }

                html.push('</div>');
                html.push('</a>');
								html.push('<p class="sum">'+langData['siteConfig'][19][689].replace('1', totalCount)+langData['siteConfig'][19][319]+'：<font class="blue">'+list[i].price+'</font></p>');
								html.push('<p class="btns fn-clear">'+btn+'</p>');
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

				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
