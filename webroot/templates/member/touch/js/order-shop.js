/**
 * 会员中心商城订单列表
 * by guozi at: 20151130
 */

 var recPage = 1, recLoad = false;

 var listload = false;
$(function(){

	//状态切换
	$(".tab ul li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("curr") && !t.hasClass("sel")){
			$(".recBox").addClass('fn-hide')
			listload = false;
			state = id;
			atpage = 1;
			t.addClass("curr").siblings("li").removeClass("curr");
			objId.html('');
			getList();
		}
	});
	$(".quanTip").bind("click", function(){
		$(".tab ul li.waituse").click()
	})

	//搜索我的订单
	$('.ordershopForm form').submit(function(e){
		e.preventDefault();
		console.log(333)
		atpage = 1;
		objId.html('');
		getList();
		return false;
	})

	// 获取url参数

	function getParam(paramName) {
	    paramValue = "", isFound = !1;
	    if (this.location.search.indexOf("?") == 0 && this.location.search.indexOf("=") > 1) {
	        arrSource = unescape(this.location.search).substring(1, this.location.search.length).split("&"), i = 0;
	        while (i < arrSource.length && !isFound) arrSource[i].indexOf("=") > 0 && arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() && (paramValue = arrSource[i].split("=")[1], isFound = !0), i++
	    }
	    return paramValue == "" && (paramValue = null), paramValue
	}
	if(getParam('state')){
		$(".tab ul li[data-id='"+getParam('state')+"']").click()
	}
	// 下拉加载
	$(window).scroll(function() {
		var h = $('.myitem').height();
		var h2 = $(".recBox").height()
		var allh = $('body').height();
		var w = $(window).height();
		var scroll = allh - w - h;

		var scroll2 =  allh - w - 20;

		if ($(window).scrollTop() >= scroll && !listload) {
			atpage++;
			getList();
		};


		// 推荐
		if(!$(".recBox").hasClass('fn-hide') && $(window).scrollTop() > scroll2 && !recLoad){
			getRecList()
		}
	});

	//收货
	objId.delegate(".sh", "click", function(){
		var t = $(this), par = t.closest(".myitem"), id = par.attr("data-id");
		if(id){
			$('.sureshmask').show();
			$('.sureshAlert').addClass('show');
			$('.sureshAlert .suresh').attr('data-id',id);

		}
	});
	//收货--确认
	$('.sureshAlert .suresh').click(function(){
		var t = $(this);
		var id = t.attr("data-id");
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
                      objId.html('');
                      atpage = 1;
            		  isload = false; //还原
                      getList();
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
	objId.delegate(".btn-cancel", "click", function(){
		var t = $(this), par = t.closest(".myitem"), id = par.attr("data-id");
		if(id){
			$('.cancelOrmask').show();
			$('.surecanOrAlert').addClass('show');
			$('.surecanOrAlert .surecanOr').attr('data-id',id);

		}
	});
	//取消订单--确认
	$('.surecanOrAlert .surecanOr').click(function(){
		var t = $(this);
		var id = t.attr("data-id");
		if(t.hasClass('disabled')) return;
		t.addClass("disabled");
		$.ajax({
			url: "/include/ajax.php?service=shop&action=cancelOrder&id="+id,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){

					t.removeClass("disabled");
					showErrAlert(data.info);
					$('.cancelOrmask').hide();
					$('.surecanOrAlert').removeClass('show');
					setTimeout(function(){objId.html('');getList();}, 1000);

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


	//再次购买
  	var cartList = utils.getStorage('shopCartList');
  	var allData = [];
  	$('body').delegate('.btn-buyAgain', 'click', function(e) {
        e.preventDefault();
  		var $btn=$(this);
  		if($btn.hasClass("disabled") || $btn.hasClass("doing")) return false;
  		$('.btn-buyAgain').addClass('doing');
  		var par = $(this).closest('.order-content');
		var itemEach = par.find('.img');

		//限购的和没有库存的商品筛选出来
		if(cartList){
			cartList.forEach(function(cart){
				itemEach.each(function(){
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
			itemEach.each(function(){
				var dinventory = $(this).attr('data-inventory');
				if(parseInt(dinventory) <= 0){//
					$(this).addClass('nokucun');
				}

			})
		}


		var nokcHtml = [];
		var mm = 0, nn = 0;
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
				data.specation = t;
				data.count = num;
				data.title = detailTitle;
				data.url = detailUrl;
				data.hid = hid;

				allData.push(data);
			}


		})
		console.log(mm)
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
			$('.btn-buyAgain').removeClass('doing');
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
		$('.btn-buyAgain').removeClass('doing');
		allData = [];
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
		setTimeout(function(){
			showErrAlert('成功加入购物车');
			allData = [];
			$('.btn-buyAgain').removeClass('doing');
		},1000);

		setTimeout(function(){
			location.href = cartUrl;
		},1200)
	}






});
// 倒计时
var eday = 3;
// timeOffset  是服务器和本地时间的时间差
	function cutDownTime(dom){
	//timer = setInterval(function(){
    var end = dom.attr("data-time")*1000;  //点击的结束抢购时间的毫秒数
    var newTime = Date.parse(new Date()) - timeOffset;  //当前时间的毫秒数
    var youtime = end - newTime; //还有多久时间结束的毫秒数
    if(youtime <= 0){
      	dom.find("span.day").html('00');
      	dom.find("span.hour").html('00');
        dom.find("span.minute").html('00');
        dom.find("span.second").html('00');
        return false;
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
function getList(is){
	if(state != ''){
		$(".quanTip").addClass('hide')
	}else{
		$(".quanTip").removeClass('hide')
	}
  if(listload) return false;
  listload = true;
  isload = true;

	if(is != 1){
		// $('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();
	var keywords = $('#keyword').val();

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=shop&action=orderList&state="+state+"&title="+keywords+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					listload = false;
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
					$('.recBox').removeClass('fn-hide')
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [], durl = $(".tab ul").data("url"), rUrl = $(".tab ul").data("refund"), cUrl = $(".tab ul").data("comment");
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
						case "10":
							totalCount = pageInfo.cancel;
							break;
					}

					var msg = totalCount == 0 ? langData['siteConfig'][20][126] : langData['siteConfig'][20][185];
					//拼接列表
					if(list.length > 0){
						$('.no-data').hide();
						if(list.length >= 10 || atpage != 1){
							$(".recBox").addClass('fn-hide')
						}else{
							$(".recBox").removeClass('fn-hide')
						}
						for(var i = 0; i < list.length; i++){
							var item       = [],
									id         = list[i].id,
									ordernum   = list[i].ordernum,
									orderstate = list[i].orderstate,
									retState   = list[i].retState,
									orderdate  = huoniao.transTimes(list[i].orderdate, 1),
									expDate    = list[i].expDate,
									expireddate    = list[i].expireddate?list[i].expireddate:'',
									payurl     = list[i].payurl,
									common     = list[i].common,
									commonUrl  = list[i].commonUrl,
									paytype    = list[i].paytype,
									protype    = list[i].protype,
									shopquan   = list[i].shopquan,
									paytypeold    = list[i].paytypeold,
									totalPayPrice  = list[i].totalPayPrice,
									// store      = list[i].branch ? list[i].branch : list[i].store,
									store      = list[i].store,
									// storeUrl      = list[i].branch ? list[i].branch.domain : list[i].store.domain,
									storeUrl      =  store != undefined ? list[i].store.domain : '',
									product    = list[i].product;
									huodongtype    = list[i].huodongtype;
									huodongarr    = list[i].huodongarr;
									is_tuikuan = product[0].is_tuikuan;

									totalPayPrice_str = totalPayPrice.toString();
									if(totalPayPrice_str.split('.').length > 1 && totalPayPrice_str.split('.')[1].length>2){
										totalPayPrice = totalPayPrice.toFixed(2);
									}
							var detailUrl = durl.replace("%id%", id);
							var refundlUrl = rUrl.replace("%id%", id);
							var commentUrl = cUrl.replace("%id%", id);
							var wUrl = wuliuUrl+"?oid="+id;
							var stateInfo = btn = "";
							var tktxt = '';
							switch(orderstate){
								case "0":
									stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][23]+'</span></p>';  //待付款
									btn = '<a href="javascript:;" class="btn-cancel btn-nobg">'+langData['siteConfig'][6][65]+'</a><a href="javascript:;" class=" btn-pay btn-bg popPay" data-ordernum ="'+ordernum+'">'+langData['siteConfig'][57][13]+'</a>';  //取消订单 -- 去付款
									break;
								case "1":
									stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][25]+'</span></p>';  //待发货
									btn = '<a href="'+detailUrl+'" class=" btn-pay btn-nobg">查看详情</a>';  //查看详情

									if(protype ==1 ){//电子券
										var Ret = new RegExp("\\.","g");//替换所有的点为-
										expireddate = expireddate.replace(Ret,"-")
										var nowDateArr = (new Date()).getTime();
										var expDateArr = (new Date(expireddate)).getTime();
										if(shopquan!=0){
											if(expDateArr >nowDateArr){
												stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][57][27]+'</span></p>';  //待使用
												btn 	  = '<a href="'+detailUrl+'" class=" btn-pay btn-borbg">查看券码</a>';
											}else{
												stateInfo = '<p class="order-state"><span>已过期</span></p>';  //已过期
												btn 	  = '<a href="'+detailUrl+'" class=" btn-pay btn-nobg">申请退款</a>';
											}


										}else{
											stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][19][706]+'</span></p>';  //已使用
											btn 	  = '<a href="'+detailUrl+'" class=" btn-pay btn-nobg">查看详情</a>';


										}
									}
									if(list[i].pinid!=0 &&list[i].pinstate==0){
										stateInfo = '<p class="order-state"><span>拼团中</span></p>';
									}
									//if(paytypeold != 'delivery' && is_tuikuan==0){
									//}

									break;
								case "11":
									stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][25]+'</span></p>';  //待发货
									//if(paytypeold != 'delivery' && is_tuikuan==0){
										btn = '<a href="'+detailUrl+'" class=" btn-pay btn-nobg">查看详情</a>';  //
									//}
									break;
								case "3":

									if(common == '1'){
										stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][52]+'</span></p>';  //交易完成
										btn = '<a href="javascript:;" class="btn-pay btn-nobg btn-buyAgain">'+langData['siteConfig'][57][16]+'</a>';  //再次购买
									}else{
										stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][28]+'</span></p>';  //待评价
										btn = '<a href="'+commentUrl+'" class="btn-pay btn-borbg">'+langData['siteConfig'][19][365]+'</a>';  //评价
									}
									break;
								case "4":
									stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][27]+'</span></p>';   //退款中
									btn = '<a href="#" class="btn-pay btn-bg">'+langData['siteConfig'][45][28]+'</a>'  //退款进度
									break;
								case "6":

									//申请退款
									if(retState == 1){

										//还未发货
										if(expDate == 0){

											if(protype ==1 && shopquan!=0) {

												stateInfo = '<p class="order-state"><span>退款中</span></p>';  //未发货  申请退款
												btn 	  = '<a href="'+detailUrl+'" class=" btn-pay btn-nobg">查看详情</a>';
											}else {

                                                //待处理
                                                if(list[i].ret_audittype == 0){
                                                    stateInfo = '<p class="order-state"><span>退款中</span></p>';  //未发货  申请退款
                                                }
                                                //已拒绝
                                                else if(list[i].ret_audittype == 1){
                                                    stateInfo = '<p class="order-state"><span>商家拒绝退款</span></p>';
                                                }
											}
										//已经发货
										}else{
											stateInfo = '<p class="order-state"><span>退款中</span></p>';   //已发货  退款  langData['siteConfig'][9][42]
										}

									//未申请退款
									}else{
										stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][26]+'</span></p>';   //待收货
										if(list[i].shipping == '1'){
											btn = '<a href="'+wUrl+'" class="btn-pay btn-nobg">'+langData['siteConfig'][57][15]+'</a><a href="javascript:;" class="btn-pay btn-borbg sh">'+langData['siteConfig'][6][45]+'</a>';  //查看物流--确认收货
										}else{
											btn = '<a href="javascript:;" class="btn-pay btn-borbg sh">'+langData['siteConfig'][6][45]+'</a>';  //查看物流--确认收货
										}
										
									}
									break;
								case "7"://退款成功
									stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][57][26]+'</span></p>';  //交易关闭
									tktxt = '<span class="tktxt">'+langData['siteConfig'][9][34]+'</span>';//退款成功
									break;
								case "10":
									stateInfo = '<p class="order-state"><span >'+langData['siteConfig'][57][26]+'</span></p>';  //交易关闭
									break;
							}


								//砍价中
								// html.push('<dl class="myitem kanprocess" data-id="">');
								// html.push('	<dt>');
								// html.push('		<p class="shop_name"><i></i><span>森马官方旗舰店</span></p>');
								// html.push('		<div class="jsTime fn-clear" data-time="1625821200">');
								// html.push('			<div>');
								// html.push('				<i>仅剩：</i>');
								// html.push('				<span class="day">00</span><em class="speDot">:</em>');
								// html.push('				<span class="hour">00</span><em>:</em>');
								// html.push('				<span class="minute">00</span><em>:</em>');
								// html.push('				<span class="second">00</span>');
								// html.push('			</div>');
								// html.push('		</div>');
								// html.push('	</dt>');
								// html.push('	<dd class="order-content">');
								// html.push('		<a href="">');
								// html.push('			<div class="proImg"><img src="{#$templets_skin#}images/mcenter/female.png" alt=""></div>');
								// html.push('			<div class="proInfo">');
								// html.push('				<h2 class="proTitle">Beats Studio3 Wireless 录Beats Studio3 Wireless 录  </h2>');
								// html.push('				<div class="kanP">');
								// html.push('					<div class="kanPro">');
								// html.push('	                    <s style="left: 10.47%;"></s>');
								// html.push('						<span class="kanSpan" style="left: 26%;">已砍至¥ <strong id="hasKan" data-price="56.01">56.01</strong></span>');
								// html.push('	                    <i style="width: 10.47%;"></i>');
								// html.push('	                </div>');
								// html.push('	                <strong class="nPrice">¥1967.00</strong>');
								// html.push('				</div>');

								// html.push('			</div>');
								// html.push('		</a>');
								// html.push('		<div class="btn-group" data-action="shop">');
								//       html.push('        	<a href="javascript:;" class="btn-yuanbuy btn-nobg">原价购买</a>');
								//       html.push('        	<a href="" class=" btn-gokan btn-bg">继续砍价</a>');
								//       html.push('        </div>');
								// html.push('	</dd>');
								// html.push('</dl>');
							if(huodongtype == 4 && huodongarr.length>0) {
								html.push('<dl class="myitem tuanprocess" data-id="">');
								html.push('	<dt>');
                                if(store != undefined){
								    html.push(`<a href="${storeUrl}" class="toMini" data-temp="store-detail" data-module="shop" data-id="${store.id}"><i></i><span>${store.title}</span></a></p>`);
                                }
								html.push('		<div class="jsTime fn-clear" data-time="'+huodongarr.enddate+'">');
								html.push('			<div>');
								html.push('				<i>仅剩：</i>');
								html.push('				<span class="day">00</span><em class="speDot">:</em>');
								html.push('				<span class="hour">00</span><em>:</em>');
								html.push('				<span class="minute">00</span><em>:</em>');
								html.push('				<span class="second">00</span>');
								html.push('			</div>');
								html.push('		</div>');
								html.push('	</dt>');
								html.push('	<dd class="order-content">');
								html.push('		<a href="'+detailUrl+'">');
								html.push('			<div class="proImg"><img src="'+product[0].litpic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/good_default.png\';this.onerror=this.src=\''+staticPath+'images/good_default.png\';"></div>');
								html.push('			<div class="proInfo">');
								html.push('				<h2 class="proTitle">'+product[0].title+'</h2>');
								html.push('				<div class="tuanPro fn-clear">');
								html.push('					<div class="tuanImg">');
								var uslen = 0 ;
								if(huodongarr.userarr){

									uslen = huodongarr.userarr.length >3?3:huodongarr.userarr.length;
								}
								for(var a = 0; a < uslen; a++){
									html.push('						<img src="'+huodongarr.userarr[a]+'" alt="" class="img'+(a+1)+'">');
								}

								html.push('					</div>');
								html.push('					<span>差<em>'+huodongarr.chanume+'</em>人</span>');
								html.push('                </div>');
								html.push('			</div>');
								html.push('			<div class="tuanPrice">');
								html.push('            	<p class="proPrice">￥<em>'+huodongarr.huodongprice+'</em></p>');
								html.push('            	<p class="proNum">x <span>'+product[0].count+'</span></p>');
								html.push('            </div>');
								html.push('		</a>');
								html.push('		<div class="btn-group" data-action="shop">');
								html.push('       	<a href="'+detailUrl+'" class=" btn-goShare btn-bg">邀请好友</a>');
								html.push('        </div>');
								html.push('	</dd>');
								html.push('</dl>');
							}else if(orderstate ==3) {
								//交易成功--再次购买
								html.push('<dl class="myitem complete" data-id="">');
								html.push('	<dt><p class="shop_name">');
                                if(store != undefined){
								    html.push(`<a href="${storeUrl}" class="toMini" data-temp="store-detail" data-module="shop" data-id="${store.id}"><i></i><span>${store.title}</span></a></p>`);
                                }
								html.push(stateInfo);
								html.push('	</dt>');
								html.push('	<dd class="order-content">');

								if(product.length >2){
									html.push('		<a href="'+detailUrl+'">');
									html.push('			<div class="completeImg fn-clear">');

									for (var a = 0; a < product.length; a++) {
										html.push('				<div class="img" data-id="' + product[a].proid + '" data-maxcount="' + product[a].limit + '" data-title="' + product[a].title + '" data-url="' + product[a].url + '" data-inventory="' + product[a].inventory + '" data-hid="" data-speid="' + product[a].speid + '" data-specation="' + product[a].specation + '" data-litpic="' + product[a].litpic + '"><img src="' + product[a].litpic + '" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/good_default.png\';"></div>');
									}
									html.push('			</div>');
									html.push('			<div class="completeNum">共<br/><em>' + list[i].countall + '</em><br/>件</div>');
									html.push('	    <div class="shop_price">');
									html.push('	      <p class="pprice">');
									html.push('	        <em>实付款</em>');
									var priceArr = totalPayPrice.split('.');
									html.push('	        <span>' + echoCurrency('symbol') + '<strong>'+ priceArr[0]+'</strong><i>.'+ priceArr[1]+'</i></span>');
									html.push('	      </p>');
									html.push('			</div>');
									html.push('		</a>');
								}else{
									var totalCount = 0;
									for (var p = 0; p < product.length; p++) {
										html.push('<a href="' + detailUrl + '"><div class="fn-clear">');
										html.push('<div class="imgbox-l img" data-id="' + product[p].proid + '" data-maxcount="' + product[p].limit + '" data-title="' + product[p].title + '" data-url="' + product[p].url + '" data-inventory="' + product[p].inventory + '" data-hid="" data-speid="' + product[p].speid + '" data-specation="' + product[p].specation + '" data-litpic="' + product[p].litpic + '"><img src="' + product[p].litpic + '" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/good_default.png\';"/></div>');
										var specTxt = '';
										if (product[p].specation != "") {
											var speArr = product[p].specation.split('$$$');
											var shtml = [];
											for (var j = 0; j < speArr.length; j++) {
												var speArr1 = speArr[j].split('：');
												shtml.push(speArr1[1])

											}
											specTxt = '<h3 class="spec">' + shtml.join(';') + '</h3>'

										}

										html.push('<div class="txtbox-c"><p>' + product[p].title + '</p>' + specTxt + '</div>');
										html.push('<div class="pricebox-r"><p class="price"><span>' + (echoCurrency('symbol')) + '</span>' + product[p].price + '</p><p class="mprice">x' + product[p].count + '</p></div>');
										html.push(tktxt)
										html.push('</div></a>');
									}
									var priceArr = totalPayPrice.split('.');
									html.push('<div class="shop_price"><span class="shop_pnum">' + langData['siteConfig'][57][14].replace('1', (list[i].countall)) + '</span><p class="pprice"><em>' + langData['siteConfig'][19][316] + '</em><span>   ' + echoCurrency('symbol') + '<strong>' + priceArr[0] + '</strong><i>.' + priceArr[1] + '</i></span></p></div>');//共1件商品 -- 实付款
								}

								html.push('		<div class="btn-group" data-action="shop">');
								// html.push('        	<a href="javascript:;" class=" btn-buyAgain btn-nobg">再次购买</a>');
								html.push(btn)
								html.push('       </div>');
								html.push('	</dd>');
								html.push('</dl>');
							}else if( protype ==1 && shopquan!=0){

								// 待使用
								html.push('<dl class="myitem waitUse" data-id="">');
								html.push('  	<dt>');
                                if(store != undefined){
								    html.push(`<p class="shop_name"><a href="${storeUrl}" class="toMini" data-temp="store-detail" data-module="shop" data-id="${store.id}"><i></i><span>${store.title}</span></a></p>`);
                                }
								html.push('    	<p class="order-state"><span>'+stateInfo+'</span></p>');
								html.push('  	</dt>');
								html.push('  	<dd class="order-content">');
								html.push('	    <a href="'+detailUrl+'">');
								html.push('	      	<div class="fn-clear">');
								html.push('	        	<div class="imgbox-l">');
								html.push('	          		<img src="'+product[0].litpic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/good_default.png\';">');
								html.push('	          	</div>');
								html.push('		        <div class="txtbox-c">');
								html.push('		          	<p>'+product[0].title+'</p>');
								html.push('		          	<h3 class="spec">有效期至：'+list[i].expireddate+'</h3>');
								html.push('		        </div>');
								html.push('		        <div class="pricebox-r">');
								html.push('		          <p class="price">');
								html.push('		            <span>' + echoCurrency('symbol') + '</span>'+product[0].price+'</p>');
								html.push('		          <p class="mprice">x'+ product[0].count +'</p></div>');
								html.push(tktxt)
								html.push('		      	</div>');
								html.push('	    </a>');
								html.push('	    <div class="shop_price">');
								html.push('	      <span class="shop_pnum">共');
								html.push('	        <em>'+ list[i].countall +'</em>件商品</span>');
								html.push('	      <p class="pprice">');
								html.push('	        <em>实付款</em>');
								var priceArr = totalPayPrice.split('.');
								html.push('	        <span>' + echoCurrency('symbol') + '<strong>'+ priceArr[0]+'</strong><i>.'+ priceArr[1]+'</i></span>');
								html.push('	      </p>');
								html.push('	    </div>');
								html.push('	    <div class="btn-group" data-action="shop">');
								html.push(btn);
								html.push('	  	</div>');
								html.push('	</dd>');
								html.push('</dl>');

							}else {
								html.push('<dl class="myitem" data-id="' + id + '">');
                                if(store != undefined){
								    html.push(`<dt><p class="shop_name"><a href="${storeUrl}" class="toMini" data-temp="store-detail" data-module="shop" data-id="${store.id}"><i></i><span>${store.title}</span></a></p>${stateInfo}</dt>`)
                                }
								html.push('<dd class="order-content">');
								var totalCount = 0;
								for (var p = 0; p < product.length; p++) {
									html.push('<a href="' + detailUrl + '"><div class="fn-clear">');
									html.push('<div class="imgbox-l"><img src="' + product[p].litpic + '" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/good_default.png\';"/></div>');
									var specTxt = '';
									if (product[p].specation != "") {
										var speArr = product[p].specation.split('$$$');
										var shtml = [];
										for (var j = 0; j < speArr.length; j++) {
											var speArr1 = speArr[j].split('：');
											shtml.push(speArr1[1])

										}
										specTxt = '<h3 class="spec">' + shtml.join(';') + '</h3>'

									}

									html.push('<div class="txtbox-c"><p>' + product[p].title + '</p>' + specTxt + '</div>');
									html.push('<div class="pricebox-r"><p class="price"><span>' + (echoCurrency('symbol')) + '</span>' + product[p].price + '</p><p class="mprice">x' + product[p].count + '</p></div>');
									html.push(tktxt)
									html.push('</div></a>');
								}
								var priceArr = totalPayPrice.split('.');
								html.push('<div class="shop_price"><span class="shop_pnum">' + langData['siteConfig'][57][14].replace('1', (list[i].countall)) + '</span><p class="pprice"><em>' + langData['siteConfig'][19][316] + '</em><span>   ' + echoCurrency('symbol') + '<strong>' + priceArr[0] + '</strong><i>.' + priceArr[1] + '</i></span></p></div>');//共1件商品 -- 实付款
								html.push('<div class="btn-group" data-action="shop">' + btn + '</div>');
								html.push('</dd>');
								html.push('</dl>');
							}

						}

						objId.append(html.join(""));
						$('.kanprocess').each(function(){
							var jsDom = $(this).find('.jsTime');
							var timer_kan = setInterval(function(){
							    cutDownTime(jsDom);
							},1000) ;
						})
						$('.tuanprocess').each(function(){
							var jsDom = $(this).find('.jsTime');
							var timer_tuan = setInterval(function(){
							    cutDownTime(jsDom);
							},1000) ;
						})
            			$('.loading').remove();
            			isload = false;
            			listload = false
					}else{
						$('.loading').remove();
						listload = true;
						if(totalCount==0 || (list.length==0 && atpage == 1)){
							$('.no-data').show();
							$(".recBox").removeClass('fn-hide')
						}else{
							objId.append("<p class='loading'>"+msg+"</p>");
						}
					}
                    
                    $("#all").text(pageInfo.totalCount)
                    $("#topay").text(pageInfo.unpaid)
                    $("#touse").text(pageInfo.tobeuse)
                    $("#toshare").text(pageInfo.tobefenx)
                    $("#tofahuo").text(pageInfo.ongoing)
                    $("#torecive").text(pageInfo.recei)
                    $("#toComm").text(pageInfo.rates)
                    $("#guoqi").text(pageInfo.tobeguoqi)

				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});

	$('body').undelegate(".popPay",'click').delegate(".popPay", "click", function(){

		var ordernum1 = $(this).attr('data-ordernum');

		$.ajax({
			url: masterDomain+"/include/ajax.php?service=shop&action=pay",
			type: 'post',
			data: {'ordernum':ordernum1,'orderfinal':1},
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){

					sinfo = data.info;
					if(typeof(sinfo) == 'string' && (sinfo.indexOf('https://') != -1 || sinfo.indexOf('http://') != -1)){
						window.location.href = sinfo;
						return false;
					}
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
					alert(data.info);
				}
			},
			error: function(){
				alert('网络错误，请重试！');
				t.removeClass('disabled');
			}
		})
	});
}

getRecList(type)
//推荐列表
  function getRecList(type){
  	if(recLoad) return false;
  	recLoad = true;
    $(".command-list-con  .loading").html(langData['siteConfig'][20][184]);	
     
    //请求数据
    $.ajax({
      url: "/include/ajax.php?service=shop&action=slist&page="+recPage+"&pageSize=10",
      type: "GET",
      dataType: "jsonp",
      success: function (data) {
        if(data){
          if(data.state == 100){
            var list = data.info.list, lr, html = [];
            if(list.length > 0){
              $(".command-list-con  .loading").html('');
              var html1 = [],html2 = [];
              for(var i = 0; i < list.length; i++){
                lr = list[i];
                var pic = lr.litpic == false || lr.litpic == '' ? '/static/images/blank.gif' : lr.litpic;
                var specification = lr.specification
                
                if(list[i].typesalesarr.indexOf('1') <= -1){
                  var tcs = '';
	              if(list[i].typesalesarr.indexOf('2') > -1 || list[i].typesalesarr.indexOf('3') > -1 || list[i].typesalesarr.indexOf('4') > -1) {
	                  tcs = "<span>同城送</span>";
	              }
                  if(i%2 == 0){
                      html1.push(`<li class="shopPro"><a href="${list[i].url}" class="proLink toMini" data-temp="detail" data-module="shop" data-id="${list[i].id}">`);
                      html1.push('<div class="pro_img"><img src="'+list[i].litpic+'" alt="" onerror="this.src=\'/static/images/404.jpg\'"></div>');
                      html1.push('<div class="pro_info">');
                      html1.push('<h4>'+list[i].title+'</h4>');
                      // html1.push('<p class="sale_info"><span>已售'+list[i].sales+'</span><em>|</em><span>2.5km</span></p>');
                      var price = list[i].price ? list[i].price : '';
                      var priceArr = price.split('.')
                      html1.push('<div class="pro_price">');
                      html1.push('<div class="price"><span class="symbol">'+echoCurrency("symbol")+'</span><span class="num">'+priceArr[0]+'<em>'+(priceArr.length > 1 ? "." + priceArr[1] : "")+'</em></span></div>');
                      if(list[i].sales > 0){
                      	 html1.push('<span class="sale">'+list[i].sales+'件已售</span></div>');
                      }
                     
                      html1.push('<p class="sale_lab">'+tcs+(list[i].youhave?"<span>包邮</span>":"")+'</p>');
                      html1.push('</div></a></li>');
                  }else{
                      html2.push(`<li class="shopPro"><a href="${list[i].url}" class="proLink toMini" data-temp="detail" data-module="shop" data-id="${list[i].id}">`);
                      html2.push('<div class="pro_img"><img src="'+list[i].litpic+'" alt="" onerror="this.src=\'/static/images/404.jpg\'"></div>');
                      html2.push('<div class="pro_info">');
                      html2.push('<h4>'+list[i].title+'</h4>');
                      // html2.push('<p class="sale_info"><span>已售'+list[i].sales+'</span><em>|</em><span>2.5km</span></p>');
                      
                      var price = list[i].price ? list[i].price : '';
                      var priceArr = price.split('.')
                      html2.push('<div class="pro_price">');
                      html2.push('<div class="price"><span class="symbol">'+echoCurrency("symbol")+'</span><span class="num">'+priceArr[0]+'<em>'+(priceArr.length > 1 ? "." + priceArr[1] : "")+'</em></span></div>');
                      if(list[i].sales > 0){
	                      html2.push('<span class="sale">'+list[i].sales+'件已售</span></div>');
	                  }
                      html2.push('<p class="sale_lab">'+tcs+(list[i].youhave?"<span>包邮</span>":"")+'</p>');
                      html2.push('</div></a></li>');
                  }
                }else{

                  if(i%2 == 0){
                      html1.push('<li class="tuanPro"><a href="'+list[i].url+'" class="proLink">');
                      html1.push('<div class="pro_img"><img src="'+list[i].litpic+'" alt="" onerror="this.src=\'/static/images/404.jpg\'"></div>');
                      html1.push('<div class="pro_info">');
                      html1.push('<h4>'+list[i].title+'</h4>');
                      html1.push('<p class="sale_info">');
                      if(list[i].sales > 0){
                      	html1.push('<span>已售'+list[i].sales+'</span>');
                      }
                      
                      html1.push('<em>|</em><span>2.5km</span></p>');
                      var price = list[i].price ? list[i].price : '';
                      var priceArr = price.split('.')
                      html1.push('<p class="pro_price"><span class="symbol">'+echoCurrency("symbol")+'</span><span class="num">'+priceArr[0]+'<em>'+(priceArr.length > 1 ? "." + priceArr[1] : "")+'</em></span></p>');
                      html1.push('</div></a></li>');
                  }else{
                      html2.push('<li class="tuanPro"><a href="'+list[i].url+'" class="proLink">');
                      html2.push('<div class="pro_img"><img src="'+list[i].litpic+'" alt="" onerror="this.src=\'/static/images/404.jpg\'"></div>');
                      html2.push('<div class="pro_info">');
                      html2.push('<h4>'+list[i].title+'</h4>');
                      html2.push('<p class="sale_info">');
                      if(list[i].sales > 0){
                      	html2.push('<span>已售'+list[i].sales+'</span>');
                      }
                      html2.push('<em>|</em><span>2.5km</span></p>');
                      var price = list[i].price ? list[i].price : '';
                      var priceArr = price.split('.')
                      html2.push('<p class="pro_price"><span class="symbol">'+echoCurrency("symbol")+'</span><span class="num">'+priceArr[0]+'<em>'+(priceArr.length > 1 ? "." + priceArr[1] : "")+'</em></span></p>');
                      html2.push('</div></a></li>');
                  }
                }

              }
	            $(".command-list-con .goodlist").eq(0).append(html1.join(""));
	            $(".command-list-con .goodlist").eq(1).append(html2.join(""));
	            recPage++;
	            recLoad = false;
	            if(recPage > data.info.pageInfo.totalPage){
	            	recLoad = true;
	            }
              
            //没有数据
            }else{
              $(".command-list-con .loading").html(langData['siteConfig'][20][126]);
             
            }

          //请求失败
          }else{
            
              $(".command-list-con .loading").html(data.info);
            
          }
        //加载失败
        }else{
          
            $(".command-list-con .loading").html(langData['siteConfig'][20][462]);
            
        }
      },
      error: function(){
      	 $(".command-list-con .loading").html(langData['siteConfig'][20][227]);
        
      }
    });
  }