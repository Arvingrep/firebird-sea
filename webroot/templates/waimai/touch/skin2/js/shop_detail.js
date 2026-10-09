var natureConfig = {
	id: 0,
	title: "",
	pic: "",
	unit: "",
	unitPrice: 0,
	dabao: 0,
	selectNature: "",
	selectPrice: 0,
	names: [],
	prices: []
};
// 获取参数
function getParam(paramName) {
	paramValue = "", isFound = !1;
	if (this.location.search.indexOf("?") == 0 && this.location.search.indexOf("=") > 1) {
		arrSource = unescape(this.location.search).substring(1, this.location.search.length).split("&"), i = 0;
		while (i < arrSource.length && !isFound) arrSource[i].indexOf("=") > 0 && arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() && (paramValue = arrSource[i].split("=")[1], isFound = !0), i++
	}
	return paramValue == "" && (paramValue = null), paramValue
}
var cmpage = 1,
	cmload = 0;
$(function() {
	let timer;
	
	function handleVisibilityChange() {
	  if (document.hidden) {
		// 页面隐藏时执行的操作，例如暂停视频播放
		clearInterval(timer);
	  } else {
		// 页面可见时执行的操作，例如恢复视频播放
		let cartInfo=localStorage.getItem(`wm_cart_${shopid}`);
		let blank=(!cartInfo||JSON.stringify(cartInfo)=='{}');
		if(!blank){ //页面显示先进行一次判断，是否需要设置定时器，本地为空不需要
			timer = setInterval(function(){
				let cartInfo=localStorage.getItem(`wm_cart_${shopid}`);
				let blank=(!cartInfo||JSON.stringify(cartInfo)=='{}');
				if(blank){ //本地为空的话，清掉页面按钮状态并清除定时器
					$(".cart_content .cart_list").html("");
					$(".left_box i").remove();
					$(".change_cart span").html(0);
					$('.change_cart span, .sub').removeClass('show');
					$('.cart_box').addClass('null_cart');
					$('.left_box li').attr('data-count',0);
					cartInit.statistic();
					clearInterval(timer);
				}
			},2000);
		}
	  }
	}
	 
	// 监听 visibilitychange 事件
	document.addEventListener('visibilitychange', handleVisibilityChange);
  	$('.appMapBtn').attr('href', OpenMap_URL);
	$(".toGet").click(function () {
		var qid = $(this).attr('data-id');
		var li = $(this).closest('li');
		var userid = $.cookie(cookiePre+"login_user");
      	if(userid == null || userid == ""){
          location.href = masterDomain + "/login.html";
          return false;
      	}
		if(li.hasClass('has_get')){
			showErrAlert('已领取该优惠券！');
			return false;
		}
		$.ajax({
			url: "/include/ajax.php?service=waimai&action=getWaimaiQuan&qid="+qid,
			type:'POST',
			dataType: "json",
			success:function (data) {
				if(data.state ==100){

					showErrAlert(data.info)
					$(".quan_mask,.quan_pop").hide();
				}else{
					showErrAlert(data.info)
					$(".quan_mask,.quan_pop").hide();
				}
			},
			error:function () {

			}
		});
	});

    $('.announce').bind('click', function(){
        var t = $(this);
        confirmPop({
            title:t.find('h5').text(),
            confirmTip:t.find('p').text(),
            isShow:true,
            btnSure:'确定',
            noCancel:true,
        }, function(){})
    });

	var hui_len  = $(".hui_box .p_tip").length;
	if(hui_len>0){
		$('.shop_info .hui_num i').text(hui_len);
	}else{
		if($(".quan_ul li").length == 0){
			$(".hui_box").remove();
		}
	}
	toggleDragRefresh('off');
	//商家商品较多 做处理
	//0.moreShopFlag 商品大于50条时 采用分类加载数据 否则则全部加载数据
	//1.clickCart 商品多时点击购物车列表
	//2.firstStatic 商品多时 初次加载
	//3.allFoodList 存放所有商品数据 用于商品多时 按分类加载数据 无需多次请求ajax  商品不多时则一次全部加载出来
	//4.foodlist 所有商品数据 用于搜索结果页面查询
	var moreShopFlag = false,clickCart = false,firstStatic = false,allFoodList = [],foodlist = [];
    var sortArr = [];//海报销量排序
    var descArr =[];//商品描述 body
    var tzTypeid = getParam('typeid');//搜索结果的分类
	// 获取所有商品
    getallFood();
    function getallFood(){
    	var url = '/include/ajax.php?service=waimai&action=food&shop='+shopid;
		$.ajax({
			url: url,
			type: 'get',
			dataType: 'json',
			success: function(data) {
				if(data && data.state == 100){
					var list = data.info;
					if(list.length > 0){
						foodlist = list;
						if(list.length > 200){//商品大于50条时 采用分类加载数据
							moreShopFlag = true;
						}else{
							moreShopFlag = false;
						}
						if(moreShopFlag){//数据按各分类处理
							$('.left_box li').each(function(){
								var tid = $(this).attr('data-id'),neArr = [];
								for(var m=0; m<list.length; m++){
									var itId = list[m].typeid;
									if(tid == itId){
										neArr.push(list[m])
									}

								}
								allFoodList.push({'id':tid,'arr':neArr});
							})

							if(tzTypeid){//分类id
						    	$(".left_box li[data-id='"+tzTypeid+"']").click();
						    	getfoodType(1,1);//商家商品较多新写法  第一次搜索进来
						    }else{
						    	getfoodType(1);//商家商品较多新写法
						    }
						}else{
							allFoodList = list;
							if(tzTypeid){//分类id
								getfoodType('',1);//第一次搜索进来
							}else{
								getfoodType();
							}
						}
                      //针对销量排序 填充海报
                        sortArr = list;
                        sortArr.sort(newSort);
                        var hpoArr1=[],hpoArr2=[];
                        for(var h = 0;h<sortArr.length;h++){
                            descArr.push({'id':sortArr[h].id,'descbody':sortArr[h].body});

                            var hhPrice = (sortArr[h].price).split('.');
                            if(h<6){
                                hpoArr1.push('<li>');
                                hpoArr1.push('<div class="h_foodImg">');
                                hpoArr1.push('<img src="'+sortArr[h].pics[0]+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/404.jpg\';this.onerror=this.src=\''+staticPath+'images/food.png\';">');
                                if(h==0){
                                    hpoArr1.push('<span>销量第一</span>');
                                }
                                hpoArr1.push('</div>');
                                hpoArr1.push('<h4>'+sortArr[h].title+'</h4>');
                                hpoArr1.push('<div class="h_foodPrice">');
                                hpoArr1.push(echoCurrency('symbol')+'<b>'+hhPrice[0]+'</b>');
                                if(hhPrice[1] > 0){
                                    hpoArr1.push('.'+hhPrice[1]);
                                }
                                if(sortArr[h].formerprice > 0){
                                    hpoArr1.push('<s>'+echoCurrency('symbol')+sortArr[h].formerprice+'</s>');
                                }
                                hpoArr1.push('</div>');
                                hpoArr1.push('</li>');
                            }else if(h<20){
                                // if(sortArr[h].title.length >7){//控制标题字数
                                //     sortArr[h].title=sortArr[h].title.substring(0,7)
                                // }
                                hpoArr2.push('<li>');
                                hpoArr2.push('<span class="h_foodName">'+sortArr[h].title+'</span>');
                                hpoArr2.push('<span class="h_foodPrice">'+hhPrice[0]+(hhPrice[1]>0?'.'+hhPrice[1]:'')+'<b>'+echoCurrency('short')+'</b></span>');
                                hpoArr2.push('</li>');
                            }
                        }
                        $('.waimaiStore .html2_node .html2ConShow .h_mListImg').html(hpoArr1.join(''));
                        $('.waimaiStore .html2_node .html2ConShow .h_menuList').html(hpoArr2.join(''));
					}
				}else{
					$('.loading_pro').text(data.info);
				}
			},
			error: function(){
				$('.loading_pro').text(langData['siteConfig'][20][458]);     /* 网络错误，获取失败！*/
			}
		});


    }
  	function newSort(x,y){
	 	return y.sale-x.sale;
	}

	$(".right_list img").scrollLoading();
	// 设置滚动到高度
	// $('.right_list').height($(window).height() - $('.tab_box').height());
	$('.left_box').height($(window).height() - $('.tab_box').height());

	var isclick = 0;
	$(window).scroll(function() {
		if ($(window).scrollTop() >= ($('.tab_con').offset().top)) {
			$('.tab_box').addClass('fixedtop');
			$('.right_list').css('padding-top',".72rem");
		} else {
			$('.tab_box').removeClass('fixedtop');
			$('.right_list').css('padding-top',"0");
		}
		// 滚动定位
		if (isclick) return false;

		if(!moreShopFlag){//商家商品较多的 不做滚动效果
			if($(".right_list dl").size()== $('.left_box li').length){
				for (var i = 0; i < $('.left_box li').length; i++) {
					var scroll = $('.right_list .dl_box').eq(i).offset().top;
					var h = $('.right_list .dl_box dt').eq(i).height();
					if($(window).scrollTop() >=(scroll+h)){
						$('.left_box li').eq(i).addClass('type_active').siblings('li').removeClass('type_active');
					}

				}
			}
		}


	});



	// $('.left_box li').each(function() {
	// 	var id = $(this).attr('data-id');
	// 	var scTop = $('#item' + id).offset().top;
	// 	$(this).attr('data-top', scTop)
	// })
	// 左侧点击
	$('.left_box li').click(function() {
		isclick = 1;
		var t = $(this),
			id = t.attr("data-id");
		t.addClass('type_active').siblings('li').removeClass('type_active');
		if(moreShopFlag){//商家商品较多
			getfoodType();
			clickCart = false;
			if($('.tab_box').hasClass('fixedtop')){
				// $(window).scrollTop($('.tab_con').offset().top);
				$('html,body').animate({'scrollTop': $('.tab_con').offset().top}, 500);
			}else{
				$(window).scrollTop(0);
			}

		}else{
			
			$('html,body').animate({'scrollTop': t.attr('data-top') - $(".dl_box dt").outerHeight()}, 500);
			setTimeout(function() {
				isclick = 0;
			}, 600)
		}

	});

	$('.mask').click(function(){
		$('.hide_btn').click(); //隐藏产品展示
		$('.close_shop_detail').click();
	})
	//点击商品 查看详情
	$('.right_list ').delegate('.pro_img','click', function() {
		$('html').addClass('noscroll')
		var id = $(this).parents('dd').attr('data-id');
		var chosed_num = Number($(this).parents('dd').find('.change_cart span').text());
		var p = $(this).parents('.dd_box');
		var pro_name = p.find('.pro_detail>h3').text();
		var sale_count = p.attr("data-sale") * 1;
		var price = Number(p.attr('data-price')).toFixed(2);
		var des;
		var src = $(this).find('img').attr('data-url');
		var pic = JSON.parse($(this).find('img').attr('data-pic'));
		var html = [];
		for (var i = 0; i < pic.length; i++) {
			html.push('<li class="swiper-slide"><img src=' + pic[i] + ' /></li>');
		}
        for (var j = 0; j < descArr.length; j++) {
          if(descArr[j].id == id){
            des = descArr[j].descbody;
            $('.detail_info .descInfo').html(des ? des : langData['waimai'][7][144])   /* 暂无介绍*/
          }
		}
		$('.pro_imglist .swiper-wrapper').html(html.join(''));
		$('.pro_show').animate({
			'bottom': 0
		}, 200);
		$('.show_info>h2').text(pro_name);
		$('.prosale_count>em').text(sale_count);
		$('.show_price').html('<em>' + echoCurrency('symbol') + '</em>' + price);

		$('.mask').show();
		$('.pro_show').attr('data-id',id).attr('data-num',chosed_num);

		$('.pro_show .show_info').find('.change_cart').remove();
		$('.pro_show .show_info').append(p.find('.change_cart').clone());
		//产品展示
		var swiper1 = new Swiper('.pro_imglist.swiper-container', {
			pagination: {
				el: '.img_page',
				type: 'fraction',
			},
			observer: true,
			loop: false,
		});
	});

	//隐藏商品详情
	$('.hide_btn').click(function() {
		$('.mask').hide();
		$('html').removeClass('noscroll')
		$('.pro_show').animate({
			'bottom': "-12rem"
		}, 200);
	})


	//设置滑动
	var swiper0 = new Swiper('.tab_con.swiper-container', {
		autoHeight: true,
		on: {
			slideChangeTransitionStart: function() {
				$('.tab_ul li').eq(this.activeIndex).addClass('li_active').siblings('li').removeClass('li_active');
				if (this.activeIndex == 0) {
					$('.bottom').show();
					$('.left_box').show();
				} else {
					if (this.activeIndex == 1) {
						if($(".commt_list li").size()==0){
							getcmtList()
						}

					} else {
						//查看大图
						$.fn.bigImage({
							artMainCon: ".shop_imgbox", //图片所在的列表标签
							show_Con: '.swiper-slide',
						});
					}
					$('.bottom').hide();
					$('.left_box').hide();
				}
			},
		}
	});



	// 输入框绑定
	$('#keywords').bind('input propertychange', function() {
		var t = $(this),
			val = t.val(),
			searchHtml = [];

		if (val != "") {
			$('.wordsBox').hide();
			for (var m = 0; m < foodlist.length; m++) {
				var name = foodlist[m].title,
					ftitle = foodlist[m].title,
					id = foodlist[m].id,
					typeid = foodlist[m].typeid,
					src = foodlist[m].pics?foodlist[m].pics[0]:'/static/images/food.png',
					descript = foodlist[m].descript,
					dabao = foodlist[m].is_dabao!="0"?foodlist[m].dabao_money:0, //是否打包
					litpic = foodlist[m].pics?foodlist[m].pics[0]:'/static/images/food.png', //图片
					price = foodlist[m].price, //价格
					vipprice = foodlist[m].vipprice?foodlist[m].vipprice:(foodlist[m].minprice?foodlist[m].minprice:"0"), //会员价格
					nature = (foodlist[m].is_nature!="0" && foodlist[m].nature_json != "[]")?foodlist[m].nature_json:"", //规格
					limitfood = foodlist[m].is_limitfood, //限购
					stock = foodlist[m].stock, //库存
					stockvalid = foodlist[m].stockvalid, //库存
					formerprice = foodlist[m].formerprice,
					unit = foodlist[m].unit,
					chose_num = 0,//已加购的数量
					is_discount = foodlist[m].is_discount,
					discount_value = foodlist[m].discount_value,
					sale = foodlist[m].sale;

					nature = nature.replace(' ',"")
				if (name.indexOf(val) >= 0) {

					var cartFood = $('.cart_list .cart_dd[data-id="'+id+'"]');
					if(cartFood.length > 0){
						var choseNum = cartFood.find('.change_cart span').text();
						chose_num = choseNum;
					}

					var stime = " data-stime=" + foodlist[m].start_time,
						etime = " data-etime=" + foodlist[m].stop_time,
						times = " data-times=" + foodlist[m].limit_time_json,
						foodnum = " data-foodnum=" + foodlist[m].foodnum;
					searchHtml.push('<li class="dd_box" data-id="' + id + '" data-partype="'+typeid+'" data-title="' + ftitle + '" data-src="' + src +
						'" data-price="' + price + '" data-unit="' + unit + '" data-dabao="' + dabao + '" data-stock="' + stock +
						'"  data-limitfood="' + limitfood + '"  data-is_discount="'+is_discount+'" data-discount_value="'+discount_value+'" data-sale="'+sale+'" '+(limitfood!="0"?(stime+' '+etime+' '+times+' '+foodnum):"")+' data-nature='+nature+'>');
					searchHtml.push('<div class="pro_img"><a href="javascript:;"><img src="'+litpic+'" data-url="' +
						litpic + '" data-pic=' + price + ' onerror="this.src=\'/static/images/food.png\'"></a></div>');
					searchHtml.push('<div class="pro_detail"><h3>' + name + '</h3>');
					searchHtml.push('<div class="pro_info"><p class="pro_descript">' + descript + '</p>');
					searchHtml.push('<p class="sale_count"><span>'+langData['waimai'][7][84]+'<em>' + sale + '</em></span>' + (stock != '' ?
						"<span>"+langData['waimai'][7][145]+"<em>" + stock + "</em></span>" : "") + '</p></div>');   /*已售--库存 */
					searchHtml.push('<div class="pro_price"><span class="now_price"><em>' + echoCurrency("symbol") + '</em>' +
						price + (unit ? '/'+unit : '') + '</span>' + (formerprice > 0 ? "<i class='o_price'>" + echoCurrency("symbol") + formerprice + "</i>" :
							"") );
					if(vipprice!='0'){
						searchHtml.push("<span class='vip_price'><em>"+echoCurrency("symbol")+"</em>"+vipprice+"</span>");
					}
					searchHtml.push('<div class="limit_gou">'+(is_discount=="1"?"<span class='discount_num'>"+discount_value+"折</span>":"")+'</div>');
					if (nature != '') {
						searchHtml.push('<div class="chose_type add_c">'+langData['waimai'][7][89]+'</div>');   /* 选规格 */
					} else {

						searchHtml.push('<div class="change_cart null_chose" data-limit="' + stock + '">' + ((stock!='' && stock==0 && stockvalid != 0)?langData['waimai'][7][90]:"<i class='sub "+(chose_num>0?'show':'')+"'></i><span class='"+(chose_num>0?'show':'')+"'>"+chose_num+"</span><i class='add'></i>") + '</div>');
					}
					searchHtml.push('</div>');
					searchHtml.push('</li>');

				}
			}
			if (searchHtml.length > 0) {
				$('.slist_box ul').html(searchHtml.join(""));
				$('.sload').hide();
			} else {
				$('.slist_box ul').html('');
				$('.sload').show();
			}

			$(".right_list img").scrollLoading({
				container: $(".slist_box"),
			});
		} else {
			$('.sload').hide();
			$('.slist_box ul').html('');
			$('.wordsBox').show();
		}
	})


	//店铺图片
	var swiper2 = new Swiper('.shopimg_box.swiper-container', {
		slidesPerView: 'auto',
	});


	$('.hui_num').click(function() {
		$(window).scrollTop(0)
		$('.info_box').toggleClass('open').css('transition','.3s height');
		$('.mask').toggle();
		$('html').toggleClass('noscroll');
	});

	// //关闭店铺介绍
	$('.close_shop_detail').on('click',function() {
		$('.mask').hide();
		$('html').removeClass('noscroll');
		$('.info_box').removeClass('open').css('transition','0s height');
	});



	//评论、点单、商家切换
	$('.tab_ul li').click(function() {
		swiper0.slideTo($(this).index())
	});

	// 搜索
	$('.search_btn').click(function() {
		$('html').addClass("noscroll");
		$('.search_page').fadeIn(150);
		//cartInit.update_pro()
		$('.tab_box, .bottom').hide();
	});
	$('.goBack_btn').click(function() {
		$('html').removeClass("noscroll");
		$('.search_page').fadeOut(150);
		$('#keywords').val('');
		$('.slist_box ul').html('');
		$('.wordsBox').show();
		$('.tab_box, .bottom').show();
	})


	// 结算购物车
	$('.right_btn').click(function() {
		var t = $(this),
			p = t.parents('.cart_box');
		if (p.hasClass('no_base')) return false;
		if($(".wx_miniprogram").size()==0 && $(".qq_miniprogram").size()==0 && $(".baidu_miniprogram").size()==0){
			location.href = t.attr('data-url');
		}
	});

	// 收藏店铺
	$('.soucan').click(function() {
		var t = $(this);
		var userid = $.cookie(cookiePre + "login_user");
		if (userid == null || userid == "") {
			window.location.href = masterDomain + '/login.html';
			return false;
		}
		if (t.hasClass('shou')) {
			t.removeClass('shou');
			$.post("/include/ajax.php?service=member&action=collect&module=waimai&temp=shop&type=del&id=" + id);
		} else {
			t.addClass('shou');
			showMsg('收藏成功')
			$.post("/include/ajax.php?service=member&action=collect&module=waimai&temp=shop&type=add&id=" + id);
		}
	});
 //提示窗
    var showErrTimer;
    var showMsg = function(txt,time){
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
    }

    //商品
	var symbol = echoCurrency("symbol");
  	var lang_7_84 = langData['waimai'][7][84];
  	var lang_8_40 = langData['waimai'][8][40];
  	var lang_2_102 = langData['waimai'][2][102];
  	var lang_7_89 = langData['waimai'][7][89];
  	var lang_7_90 = langData['waimai'][7][90];

    function getfoodType(firLoad,firstClcik){// 商家商品很多 特殊写 -- firstClcik第一次搜索进来
    	if(firLoad){//第一次加载
    		firstStatic = true;//第一次汇总 统计左侧边栏数据
    	}else{
    		firstStatic = false;

    	}
    	var infoList = [];

    	if(moreShopFlag){//商品多
    		$('.right_list').html('<p class="loading_pro">加载中~</p>');
			var moreId = $('.left_box li.type_active').attr('data-id');
			for(var j = 0 ; j< allFoodList.length; j++){
    			 if(allFoodList[j].id == moreId){
    			 	infoList=allFoodList[j].arr;
    			 }
    		}

    	}else{
    		infoList = allFoodList;
    	}
    	if(infoList.length >0){
    		$("p.loading_pro").remove();
    		var html = [];
    		if(moreShopFlag){//商家商品很多
				var typename = $('.left_box li.type_active').text(),
				 	typeid = $('.left_box li.type_active').data('id');
				html.push('<dl class="dl_box" id="item'+typeid+'" data-id="'+typeid+'">');
				html.push('<dt>'+typename+'</dt>');
				html.push('</dl>');
			}else{
				$('.left_box li').each(function(){
					var t = $(this), typeid = t.data('id'), typename = t.text();
					if(typeid){
						html.push('<dl class="dl_box" id="item'+typeid+'" data-id="'+typeid+'">');
						html.push('<dt>'+typename+'</dt>');
						html.push('</dl>');
					}
				});
			}
			$(".right_list").append(html.join(''));
			for(var m=0; m<infoList.length; m++){
				var html = [];
				var food = infoList[m];
				var nature = (food.is_nature!="0" && food.nature_json != "[]")?food.nature_json:"";
				nature = nature.replace(' ',"");
				var foodnum = '', start_time = '', stop_time = '',limit_time_json ='';
				var pics = food.pics?food.pics[0]:'/static/images/food.png';
				html.push('<dd class="dd_box"  id="food'+food.id+'" data-partype="'+food.typeid+'" data-id="'+food.id+'" data-title="'+food.title+'" data-src="'+pics+'" data-price="'+food.price+'" data-unit="'+food.unit+'" data-dabao="'+(food.is_dabao!="0"?food.dabao_money:0)+'" data-stockvalid="'+food.stockvalid+'" data-stock="'+(food.stockvalid!="0"?food.stock:0)+'" data-dealcount="'+food.dealcount+'"  data-daylimitfood = "'+food.is_day_limitfood+'" '+(food.is_day_limitfood !="0" ? "data-dayfoodnum='"+food.day_foodnum+"'" : "")+' data-limitfood="'+food.is_limitfood+'" '+(food.is_limitfood!="0"?"data-foodnum='"+food.foodnum+"' data-stime='"+food.start_time+"' data-etime='"+food.stop_time+"' data-times='"+food.limit_time_json+"'":"" )+' data-sale="'+food.sale+'" data-descript= "'+food.descript+'" data-formerprice ="'+food.formerprice+'" data-is_discount="'+food.is_discount+'" data-discount_value="'+food.discount_value+'" data-vipprive="'+(food.vipprice?food.vipprice:(food.minprice?food.minprice:"0"))+'" data-nature='+nature+' >' );
				if(m < 6){
					html.push('<div class="pro_img"><a href="javascript:;"><img src="'+pics+'"  onerror="this.src=\'/static/images/food.png\'" data-pic='+JSON.stringify(food.pics)+'></a></div>');
				}else{
					var defaultPic = m <= 10 ? pics : '/static/images/blank.gif'
					html.push('<div class="pro_img"><a href="javascript:;"><img src="'+defaultPic+'" data-url="'+pics+'"  onerror="this.src=\'/static/images/food.png\'" data-pic='+JSON.stringify(food.pics)+'></a></div>');
				}


				html.push('<div class="pro_detail"><h3>'+(food.label!=""?"<span class='label'>"+food.label+"</span>":"")+food.title+'</h3>');
				html.push('<div class="pro_info"><p class="pro_descript">'+food.descript+'</p>');
				if(detail_showsales){
					html.push('<p class="sale_count"><span>'+lang_7_84+' <em>'+food.sale+'</em></span><span>'+(food.stockvalid?("库存<em>"+food.stock+"</em>"):"")+'</span></p>');// 已售
				}
				html.push('</div>');
				var oprice = (1*food.formerprice!=0)?"<i class='o_price'>"+symbol+(1*food.formerprice)+"</i>":"";
				var vipprice = "";
				if(food.vipprice){
					vipprice = "<span class='vip_price'><em>"+symbol+"</em>"+food.vipprice+"</span>";
				}else if(food.minprice*1){
					vipprice = "<span class='vip_price'><em>"+symbol+"</em>"+food.minprice+"</span>";
				}
				html.push('<div class="pro_price"><span class="now_price"  data-p="'+food.minprice+'"><em>'+symbol+'</em>'+((1*food.price)) + (food.unit ? '/'+food.unit : '')+'</span>'+oprice+vipprice);
				html.push('<div class="limit_gou">'+(food.is_discount=="1"?"<span class='discount_num'>"+food.discount_value+"折</span>":""));
				html.push(food.is_limitfood=="1"?"<em class='xian'>"+lang_8_40.replace("1",food.foodnum)+"</em>":"");
				html.push('</div></div>');
				if(detail_yingye !=1 || detail_status !=1 || detail_ordervalid !=1 ){
					html.push('<div class="change_cart null_chose" data-limit="'+food.stock+'" style="color: #999;">'+lang_2_102+'</div>')
				}else if(food.is_nature!="0" && food.nature_json != "[]"){
					html.push('<div class="chose_type add">'+lang_7_89+'</div>') ;    /*  选规格  */
				}else{
					html.push('<div class="change_cart null_chose" data-limit="'+food.stock+'">')/*  已售罄  */
						if(food.stock=="0" && food.stockvalid!="0"){
							html.push(lang_7_90);

						}else{
							html.push('<i class="sub"></i><span>0</span><i class="add"></i>')
						}
					html.push('</div>');
				}
				html.push('</div></dd>');
				$('#item' + food.typeid).append(html.join(''));

			}

			$(".right_list img").scrollLoading();
			swiper0.updateAutoHeight(100);
			if(firstClcik){
				setTimeout(function(){
					if(getParam('foodid') ){
						var fd = $("#food"+getParam('foodid'));
						if(fd.length){
							fd.addClass('choose_food');
							var imgpath = fd.find('.pro_img img').attr('data-url');
							fd.find('.pro_img img').attr('src',imgpath);
							$(window).scrollTop(fd.offset().top-50)

	                      	var fd_next = fd.next('.dd_box');
	                        var imgpath = fd_next.find('.pro_img img').attr('data-url');
							fd_next.find('.pro_img img').attr('src',imgpath);
						}
					}
				},500)
			}else{//商品较多时  再点击搜索结果的分类时  搜索结果不会scrollTop 0

				if(getParam('foodid') ){
					var fd = $("#food"+getParam('foodid'));
					if(fd.length){
						fd.addClass('choose_food');
						var imgpath = fd.find('.pro_img img').attr('data-url');
						fd.find('.pro_img img').attr('src',imgpath);
                      	var fd_next = fd.next('.dd_box');
                        var imgpath = fd_next.find('.pro_img img').attr('data-url');
						fd_next.find('.pro_img img').attr('src',imgpath);
					}
				}

			}

			if(!moreShopFlag){
				if($(".right_list .dl_box").size()==$('.left_box li').length){
					cartInit.init();
					$('.left_box li').each(function() {
						var tid = $(this).attr('data-id');
						var scTop = $('#item' + tid).offset().top;
						$(this).attr('data-top', scTop)
					})
					//setInterval(function(){
						var cartHistory = utils.getStorage("wm_cart_" + shopid);
						if(!cartHistory){

							$(".cart_content .cart_list").html("");
							$(".left_box i").remove();
							$(".change_cart span").html(0);
							$('.change_cart span, .sub').removeClass('show');
							$('.cart_box').addClass('null_cart')
							cartInit.statistic();
						}
					//}, 500);

				}
			}else{
				cartInit.init();
				//setInterval(function(){
					var cartHistory = utils.getStorage("wm_cart_" + shopid);
					if(!cartHistory){
						$(".cart_content .cart_list").html("");
						$(".left_box i").remove();
						$(".change_cart span").html(0);
						$('.change_cart span, .sub').removeClass('show');
						$('.cart_box').addClass('null_cart')
						cartInit.statistic();
					}
				//}, 500);
			}
    	}else{
			$('.loading_pro').text(langData['siteConfig'][21][64]);//暂无数据！
    	}


	}


	// 获取评论
	var loading = $('.loading');

	// 滚动加载
	$(window).scroll(function(){
		if($(".tab_li[data-type='comment']").hasClass("li_active")){
			var allh = $('body').height();
			var w = $(window).height();
			var scroll = allh - w - 200;

			if ($(window).scrollTop() >= scroll && !cmload) {
				getcmtList()
			}
		}
	})


	function getcmtList() {
		cmload = 1;
		var data = [];
		data.push('sid=' + shopid);
		$.ajax({
			url: '/include/ajax.php?service=waimai&action=common&page=' + cmpage + '&pageSize=10',
			type: 'get',
			data: data.join("&"),
			dataType: 'json',
			success: function(data) {
				if (data && data.state == 100) {
					var list = data.info.list,
						html = [];
					if (list.length > 0) {
						for (var i = 0; i < list.length; i++) {
							var obj = list[i],
								item = [];
							var score = [];
							for (var n = 0; n < 5; n++) {
								if (n < (obj.star * 10 / 10)) {
									score.push('<i class="star_on"></i>')
								} else {
									score.push('<i></i>')
								}
							}
							item.push('<li class="comm_li fn-clear">'); //li
							item.push('<div class="left_head"><img src="' + (obj.photo ? obj.photo :
								'/static/images/default_user.jpg') + '" onerror="this.src=\'/static/images/default_user.jpg\'" /></div>');
							item.push('<div class="right_con">') //div
							item.push('<div class="comm_score fn-clear"><h3><p class="nickname">' + (obj.user ? obj.user :
									obj.user) + '</p><p class="score">' + score.join('') + '</p></h3><p class="comm_time">' + obj.pubdatef +
								'</p></div>');
							item.push('<div class="commt"><p class="commt_txt over-text">' + obj.content + '</p>');
							if (obj.pics != '') {
								item.push('<ul class="commt_img ">');
								for (var m = 0; m < obj.pics.length; m++) {

									var pic = obj.pics[m];
									item.push('<li class="li_img ' + (m >= 3 ? "fn-hide" : "") + '"><img src="' + pic + '" /></li>');
								}
								item.push('<i>' + obj.pics.length + langData['siteConfig'][13][17]+'</i></ul></div>');  /* 张 */
							}
							if (obj.reply != "" && obj.replydate != 0) {
								item.push('<div class="b_reply">' + langData['siteConfig'][16][67] + ': ' + obj.reply + '</div>');  /* 【店家回复】 */
							}
							item.push('</div></li>')
							html.push(item.join(""));
						}
						cmpage++;
						$('.commt_list').append(html.join(''));
						$.fn.bigImage({
							artMainCon: ".right_con", //图片所在的列表标签
							show_Con: '.li_img',
						})
						swiper0.updateAutoHeight(100)
						cmload = 0;
						if(cmpage>data.info.pageInfo.totalPage){
							cmload = 1;
							loading.text(langData['waimai'][2][20]);   /* 已加载全部评价*/
						}

					} else {
						loading.text(langData['waimai'][2][20]);   /* 已加载全部评价*/
					}
				} else {
					loading.text(langData['waimai'][2][20]);       /* 已加载全部评价*/
				}
			},
			error: function() {
				cmload = 0;
				loading.text(langData['siteConfig'][20][458]);     /* 网络错误，获取失败！*/
			}
		})


	}

	//购物车相关功能集合
	var cartInit = {

		//加载
		init: function() {
				// 读取当前所有商品id
				var foodIds = [];
				$(".dd_box").each(function() {
					foodIds.push($(this).attr("data-id"));
				})
				// cartInit.update_pro()
				//加载历史已选记录

				var cartHistory = utils.getStorage("wm_cart_" + shopid);
				if (cartHistory && foodIds.length > 0) {
					var list = [],
						dabaoPrice = 0;
					if (cartHistory.length > 0) {
						$('.cart_box').removeClass('null_cart');
					}
					for (var i = 0; i < cartHistory.length; i++) {
						// 购物车中商品不在当前页面中跳过

						if(!moreShopFlag){
							if (!foodIds.in_array(cartHistory[i].id)) {
								continue;
							}
						}


						list.push('<li class="cart_dd" data-id="' + cartHistory[i].id + '" data-name="' + cartHistory[i].title +
							'" data-pic="' + cartHistory[i].pic + '" data-unit="' + cartHistory[i].unit + '" data-price="' + cartHistory[
								i].price + '" data-dabao="' + cartHistory[i].dabao + '" data-ntitle="' + cartHistory[i].ntitle +
							'" data-nprice="' + cartHistory[i].nprice + '"data-is_discount="'+ cartHistory[i].is_discount+'" data-discount_value="'+cartHistory[i].discount_value+'"  data-partype="'+cartHistory[i].partype+'">');
						list.push('<div class="cart_img"><img src="' + cartHistory[i].pic + '"></div>');
						list.push('<div class="cart_info">')
						list.push('<h3>' + cartHistory[i].title + '</h3>');
						if (cartHistory[i].ntitle) {
							list.push('<p class="natureTitle">' + cartHistory[i].ntitle + '</p>');
						}

						list.push('<p class="price"><span><em>' + echoCurrency("symbol") + '</em>' + Number(cartHistory[i].price +
							cartHistory[i].nprice).toFixed(2) + '</span><i class="o_price '+(cartHistory[i].is_discount=="0"?"fn-hide":"")+'">' + echoCurrency('symbol') + (Number(cartHistory[i].price + cartHistory[i].nprice)/(cartHistory[i].discount_value==0?1:(cartHistory[i].discount_value/10))).toFixed(2) + '</i></p>');
						list.push('</div>');
						list.push('<div class="change_cart"><i class="sub"></i><span>' + cartHistory[i].count +
							'</span><i class="add"></i></div>')
						list.push('</li>');

						if (cartHistory[i].dabao && shopin!='1') {
							dabaoPrice += Number(cartHistory[i].dabao) * cartHistory[i].count;
						}

						//更新页面已选数量
						var numAccount = $("#food" + cartHistory[i].id).find(".change_cart span");
						var foodCount = Number(numAccount.text());
						var parsentCount = foodCount + cartHistory[i].count;
						if (parsentCount > 0) {
							numAccount.siblings('.sub').addClass('show');
						}
						numAccount.html(parsentCount).addClass('show');

						if(firstStatic){//第一次加载统计数量
							var calcpartype = cartHistory[i].partype;
							var calcCount = cartHistory[i].count;
							var parLeft = $(".left_box li[data-id='"+calcpartype+"']");
							var oldCount = parLeft.attr('data-count');
							var nowCount = Number(oldCount) + calcCount;
							parLeft.attr('data-count',nowCount);
							if(nowCount >0){
								var mi = parLeft.find("i");
								if (mi.size() > 0) {
									mi.html(nowCount);
								}else{
									parLeft.append("<i>" + nowCount + "</i>");
								}

							}

						}else{
							cartInit.updateTypeSelectCount(numAccount,'','','');
						}



					}

					//打包费用
					if (dabaoPrice > 0) {
						list.push('<li class="cart_dd dabao fn-clear">');
						list.push('<div class="info">');
						list.push('<h3>' + langData['siteConfig'][19][890] + '</h3>');
						list.push('<p class="price"><span><em>' + echoCurrency('symbol') + '</em>' + dabaoPrice.toFixed(2) +
							'</span></p>')
						list.push('</div>');
						list.push('</li>');

					}
					$(".cart_content .cart_list").html(list.join(""));
					cartInit.statistic();
					let blank = (!cartHistory || JSON.stringify(cartHistory) == '{}');
					if (!blank) { //页面显示先进行一次判断，是否需要设置定时器，本地为空不需要
						timer = setInterval(function () {
							let cartInfo = localStorage.getItem(`wm_cart_${shopid}`);
							let blank = (!cartInfo || JSON.stringify(cartInfo) == '{}');
							if (blank) { //本地为空的话，清掉页面按钮状态并清除定时器
								$(".cart_content .cart_list").html("");
								$(".left_box i").remove();
								$(".change_cart span").html(0);
								$('.change_cart span, .sub').removeClass('show');
								$('.cart_box').addClass('null_cart');
								$('.left_box li').attr('data-count',0);
								cartInit.statistic();
								clearInterval(timer);
							}
						}, 2000);
					}
				}

				//点击购物车图标，显示购物车
				$(".cart_box a.cart").off('click').bind("click", function() {
					if ($('.cart_box').hasClass('null_cart')) return;
					if ($(".cart_content").is(":visible")) {
						cartInit.hide();
					} else {
						cartInit.show();
					}
				});

				//点击购物车图标，显示购物车
				$(".mask_cart").bind("click", function() {
					cartInit.hide();
				});

				//页面加 搜索页面加
				$('.slist_box').off('click').delegate('.dd_box .add','click',function(){
					var t = $(this),par = t.parents('.dd_box'),id = par.attr('data-id');
					cartInit.plusORreduce("plus", this ,'');
					var num = $(this).siblings('span').text();

					$('#food'+id).find('.change_cart span').addClass('show').text(num);
					$('#food'+id).find('.change_cart .sub').addClass('show');

				});
				//搜索页面减
				$('.slist_box').delegate('.dd_box .sub','click',function(){

					var t = $(this),par = t.parents('.dd_box'),id = par.attr('data-id');
					cartInit.plusORreduce("reduce", this,'');
					var num = $(this).siblings('span').text();
					if(num>0){
						$('#food'+id).find('.change_cart span').addClass('show').text(num)
					}else{
						$('#food'+id).find('.change_cart span').removeClass('show').text(num)
					}
				});

				//搜索页面选项
				$('.slist_box').delegate('.chose_type.add_c','click',function(){

					var t = $(this),par = t.parents('.dd_box'),id = par.attr('data-id');
					if(moreShopFlag){
						cartInit.plusORreduce("plus", this,'');
					}else{
						$('#food'+id).find('.chose_type.add').click()
					}

				});


				//页面列表加
				$(".right_list .change_cart .add").bind("click", function() {
					cartInit.plusORreduce("plus", this,'');
				});
				//页面选项加
				$(".right_list .dd_box  .chose_type.add").bind("click", function() {
					cartInit.plusORreduce("plus", this,'');
				});

				//购物车加
				$(".cart_content").off('click').delegate(".change_cart .add", "click", function() {
					var t = $(this),
						par = t.closest(".cart_dd"),
						id = par.attr("data-id"),
						title = par.attr("data-title"),
						price = par.attr("data-price"),
						dabao = par.attr("data-dabao"),
						ntitle = par.attr("data-ntitle"),
						partype = par.attr("data-partype"),
						nprice = par.attr("data-nprice");
						is_discount 	= par.attr("data-is_discount");
						discount_value 	= par.attr("data-discount_value");
					if (ntitle == "") {
						if(moreShopFlag){
							cartInit.plusORreduce("plus", this,1);

						}else{
							$("#food" + id).find(".change_cart .add").click();
						}



					} else {
						//多规格商品在购物车中增加数量
						var listAccount = $("#food" + id).find(".change_cart span"),
							newListAccount = Number(listAccount.text()) + 1;
							var nowCart = Number(par.find(".change_cart span").text());
							if($("#food" + id).data('limitfood') && nowCart>=Number($("#food" + id).data('foodnum'))){
								alert(langData['siteConfig'][20][447]);    /* 已达到该商品的购买数量上限！*/
								return false;
							};
						listAccount.html(newListAccount).show();

						if(moreShopFlag){
							clickCart = true;

						}else{
							clickCart = false;
						}
						cartInit.updateFood("plus", $("#food" + id).find(".add"), id, title, "", "", parseFloat(price), parseFloat(
							dabao), ntitle, parseFloat(nprice),is_discount,discount_value,partype);

					}
				});

				// 详情页加
				$('.pro_show').delegate('.change_cart .add','click',function(){
					var id = $('.pro_show').attr('data-id')
					$('#food'+id).find('.change_cart .add').click();
					$('.pro_show').find('.change_cart').remove();
					$('.pro_show .show_info').append($('#food'+id).find('.change_cart').clone());
				});
				// 详情页减
				$('.pro_show').delegate('.change_cart .sub','click',function(){
					var id = $('.pro_show').attr('data-id')
					$('#food'+id).find('.change_cart .sub').click();
					$('.pro_show').find('.change_cart').remove();
					$('.pro_show .show_info').append($('#food'+id).find('.change_cart').clone());
				});
				//页面减
				$(".dd_box .change_cart .sub").bind("click", function() {
					cartInit.plusORreduce("reduce", this,'');
				});

				//购物车减
				$(".cart_content").delegate(".change_cart .sub", "click", function() {
					var t = $(this),
						par = t.closest(".cart_dd"),
						id = par.attr("data-id"),
						title = par.attr("data-title"),
						price = par.attr("data-price"),
						dabao = par.attr("data-dabao"),
						ntitle = par.attr("data-ntitle"),
						partype = par.attr("data-partype"),
						nprice = par.attr("data-nprice");
						is_discount = par.attr("data-is_discount");
						discount_value 	= par.attr("data-discount_value");

					if (ntitle == "") {
						if(moreShopFlag){
							cartInit.plusORreduce("reduce", this,1);
						}else{
							if($("#food" + id).find(".sub").size() > 0){
								$("#food" + id).find(".sub").click();
							}else{
								cartInit.plusORreduce("reduce", $("#food" + id).find(".change_cart"),'');
							}
						}


					} else {

						//多规格商品在购物车中减少数量
						var listAccount = $("#food" + id).find(".change_cart span"),
							newListAccount = Number(listAccount.text()) - 1;
						if (newListAccount == 0) {
							listAccount.hide();
						}
						listAccount.html(newListAccount);
						if(moreShopFlag){
							clickCart = true;

						}else{
							clickCart = false;
						}
						cartInit.updateFood("reduce", $("#food" + id).find(".add"), id, title, "", "", parseFloat(price), parseFloat(
							dabao), ntitle, parseFloat(nprice),is_discount,discount_value,partype);

					}
				});

				//清空购物车
				$(".cart_content .clear_btn").off('click').bind("click", function() {
					cartInit.clean();
				});

				//关闭多规格浮动层
				$(".mask_nature, .rank_box h2 i.close_btn").bind("click", function() {
					cartInit.hideNature();
				});

				//选择多规格商品
				$(".rank_box .chose_box").off('click').delegate("dd", "click", function() {
					var t = $(this),txt=t.find('.foodname').text();
					if (t.hasClass("disabled")) {
						return;
					}

					var maxchoose = parseInt(t.closest('dl').attr('data-maxchoose'));
					var nowchoose = t.parent().children('dd.curr').length;
					var itemid = t.attr('data-id');  //获取当前的序号
					if (t.hasClass("curr")) {
						t.removeClass("curr");
						$('.chose_price span').find('em[data-item='+itemid+']').remove();
						if($('.chose_price span em').length==0){
							$('.chose_price span').hide();
						}
					} else {
						if (nowchoose == maxchoose) {
							var item0 = t.parent().children("dd.curr:eq(0)").attr('data-id');
							t.parent().children("dd.curr:eq(0)").removeClass("curr");
							$('.chose_price span').find('em[data-item='+item0+']').remove();
						}
						t.addClass("curr");
						$('.chose_price span').show();
						if($('.chose_price span').find('em[data-item='+itemid+']').length==0){
							$('.chose_price span').append('<em data-item="'+itemid+'">'+txt+'</em>');
						}

					}

					//计算已选的价格
					var is = 1,
						selectArr = [];
					$(".rank_box .chose_box").find("dl").each(function() {
						var curr = $(this).find(".curr");
						if (curr.length <= 0) {
							is = 0;
						} else {
							var itemSel = [];
							curr.each(function() {
								itemSel.push($(this).find('.foodname').text());
							})
							selectArr.push(itemSel.join("#"));
						}
					});

					var selectNames = selectArr.join("/");

					if (is) {
						$(".rank_box .sure_cart").removeAttr("disabled");

						var only = false;
                        var selectPrice = 0;
                        $('.chose_box .curr').each(function(){
                            only = true;
                            var unat = $(this).attr('data-natprice');
                            selectPrice += parseFloat(unat);
                        })
                        natureConfig.selectNature = selectNames;
                        natureConfig.selectPrice = selectPrice;
                       $(".chose_price .price_show").html(echoCurrency('symbol') + (natureConfig.unitPrice + selectPrice).toFixed(2));

						if (!only) {
							natureConfig.selectNature = selectNames;
						}


					} else {
						$(".rank_box .sure_cart").attr("disabled", true);
						$(".rank_box .chose_price .price_show").html(echoCurrency('symbol') + natureConfig.unitPrice.toFixed(2));
					}

				});

				//确认已选规格
				$(".rank_box .sure_cart").unbind('click').bind('click', function() {
					var btn,nis_discount,nis_partype,ndiscount_value,parBox;
					if( $("#food" + natureConfig.id).size() > 0){
						parBox = $("#food" + natureConfig.id);
						btn = parBox.find(".add");
					}else{//多商品分类加载 搜索结果选规格
						parBox = $('.slist_box .dd_box[data-id="'+natureConfig.id+'"]');
						btn = parBox.find(".add_c");
					}

                    nis_discount = parBox.attr("data-is_discount");
                    nis_partype = parBox.attr("data-partype");
					ndiscount_value = parBox.attr("data-discount_value");

					//				var countObj = btn.prev(".num-account"), count = Number(countObj.text());
					//				btn.append('<i>'+count+'</i>')
					//				countObj.html(count+1).show();
					cartInit.updateFood("plus", btn, natureConfig.id, natureConfig.title, natureConfig.pic, natureConfig.unit,
						natureConfig.unitPrice, natureConfig.dabao, natureConfig.selectNature, natureConfig.selectPrice,nis_discount,ndiscount_value,nis_partype);
					cartInit.hideNature();
				});

			}

			//显示
			,
		show: function() {
				if ($(".cart_content ").find(".cart_list").length > 0) {
					$(".cart_content, .mask_cart").attr("style", "display: block");
				}
			}

			//隐藏
			,
		hide: function() {
				$(".cart_content, .mask_cart").attr("style", "display: none");
			}

			//隐藏
			,
		hideNature: function() {
				$(".rank_box, .mask_nature").attr("style", "display: none");
				$('.chose_price span').html('').hide();

			}

			//统计汇总
			,
		statistic: function() {
				var totalCount = 0,
					totalPrice = 0.00,
					totalzhe   = 0.00, //打折商品
					totalno    = 0.00;//不打折打折商品
          		var countPrice = 0.00;  //20200330 zt新增
				if ($(".cart_content").find(".cart_dd").length > 0) {
					var data = [];
					$(".left_box li").attr('data-count',0);
					$(".cart_content").find(".cart_dd").each(function(i) {
						var t = $(this),
							id = t.attr("data-id"),
							title = t.attr("data-name"),
							pic = t.attr("data-pic"),
							unit = t.attr("data-unit"),
							price = parseFloat(t.attr("data-price")),
							count = Number(t.find(".change_cart span").text()),
							dabao = parseFloat(t.attr("data-dabao")),
							// dabao = shopin=='1'?0:dabao,
							ntitle = t.attr("data-ntitle"),
							nprice = parseFloat(t.attr("data-nprice"));
							is_discount = t.attr("data-is_discount");
							discount_value 	= t.attr("data-discount_value");
						var partype = t.attr('data-partype');
						var yuanprice = discount_value > 0 ? ((price + nprice)/(discount_value/10)) : (price + nprice);  //原价//20200330 zt新增

						if (!t.hasClass("dabao")) {

							totalCount += count;
							totalPrice += (price + nprice) * count + count * (shopin=='1'?0:dabao);
							totalzhe += is_discount=="0"?0:((price + nprice) * count + count * dabao); //打折商品
							totalno += is_discount=="0"?((price + nprice) * count + count * dabao):0; //不打折打折商品
                            // countPrice += (yuanprice  + nprice) * ((vipdiscount_value*1>(discount_value>0?discount_value:10)*1)?discount_value:vipdiscount_value)/10 * count + count * dabao;
                            countPrice += (yuanprice  ) * ((vipdiscount_value*1>(discount_value>0?discount_value:10)*1)?discount_value:vipdiscount_value)/10 * count + count * (shopin=='1'?0:dabao);
                          //20200330 zt新增

							$('.hui_tip').addClass('fn-hide');
								if (totalPrice >= Number(baseprice)) {
								$('.cart_box').removeClass('no_base');
                                $('.buy_tip').addClass('fn-hide');
								var o_arr = $('.buy_tip').attr('data-promotion').split('-');

								var p_arr = []
								for(let i=0; i<o_arr.length; i++){
									if(o_arr[i]!='' && (o_arr[i].split(',')[1]!=0 && o_arr[i].split(',')[0]!=0)){
										p_arr.push(o_arr[i])
									}
								}
								 // if($(".cart_list .cart_dd[data-is_discount=1]").size()==0){

                                  if($('.buy_tip').attr('data-promotion')){
                                    $('.buy_tip').removeClass('fn-hide');
                                  }
									for(let i=0; i<p_arr.length; i++){
										if(totalno<p_arr[i].split(',')[i] && i==0){
											$('.buy_tip').html(langData['waimai'][7][150]+'<em>'+echoCurrency('symbol')+(p_arr[i].split(',')[0]-totalno).toFixed(2)+'</em>,'+langData['waimai'][7][151]+echoCurrency('symbol')+p_arr[i].split(',')[1]).attr('data-jian',0);  //还差~可省
										}else if((totalno>=p_arr[i].split(',')[0]) && p_arr[i+1]  && (totalno<p_arr[i+1].split(',')[0])  ){
											$('.buy_tip').html(langData['waimai'][7][150]+'<em>'+echoCurrency('symbol')+(p_arr[i+1].split(',')[0]-totalno).toFixed(2)+'</em>,'+langData['waimai'][7][151]+echoCurrency('symbol')+p_arr[i+1].split(',')[1]).attr("data-jian",p_arr[i].split(',')[1]); //还差~可省
										}else if(totalno>=p_arr[i].split(',')[0] && !(p_arr[i+1]) ){
											$('.buy_tip').html(langData['waimai'][7][152]+'<em>'+echoCurrency('symbol')+(p_arr[i].split(',')[0])+'</em>,'+langData['waimai'][7][151]+echoCurrency('symbol')+p_arr[i].split(',')[1]).attr("data-jian",p_arr[i].split(',')[1]); //已满~可省
										}
									}
								// }else{
									// $('.buy_tip').removeClass('fn-hide').html('折扣商品不参与满减');
								// }

								$('.right_btn ').html(langData['waimai'][7][101]);  //去结算
							}  else {
								$('.cart_box').addClass('no_base');
								$('.buy_tip').removeClass('fn-hide').html(langData['waimai'][7][153]+'<em>'+echoCurrency('symbol')+(Number(baseprice)-totalPrice).toFixed(2)+'</em>,'+langData['waimai'][7][154]).attr('data-jian',0); //还差多少起送
								$('.right_btn ').html(langData['waimai'][7][153]+'<em>'+echoCurrency('symbol')+(Number(baseprice)-totalPrice).toFixed(2)+'</em>,'+langData['waimai'][7][154]).attr('data-jian',0);   //还差多少起送

							}

							//将数据保存至
							data[i] = {
								"id": id,
								"title": title,
								"pic": pic,
								"unit": unit,
								"price": price,
								"count": count,
								"dabao": dabao,
								"ntitle": ntitle,
								"is_discount":is_discount,
								"partype":partype,
								"discount_value":discount_value,
								"nprice": nprice
							};
						}

						var calcpartype = partype;
						var calcCount = count;
						var parLeft = $(".left_box li[data-id='"+calcpartype+"']");
						var oldCount = parLeft.attr('data-count');
						var nowCount = Number(oldCount) + calcCount;
						parLeft.attr('data-count',nowCount);
						if(nowCount >0){
							var mi = parLeft.find("i");
							if (mi.size() > 0) {
								mi.html(nowCount);
							}else{
								parLeft.append("<i>" + nowCount + "</i>");
							}

						}

					});


					utils.setStorage("wm_cart_" + shopid, JSON.stringify(data));


				} else {
					$('.hui_tip').removeClass('fn-hide');
					$('.buy_tip').addClass('fn-hide');
					$('.right_btn ').html(echoCurrency('symbol')+(Number(baseprice))+langData['waimai'][7][154]);  //多少起送
					cartInit.hide();
					utils.removeStorage("wm_cart_" + shopid);
				}
				$(".cart_box .cart em").html(totalCount);
				var manjian =  (totalCount>0 && Number($(".buy_tip").attr('data-jian')))?Number($(".buy_tip").attr('data-jian')):0;
				var delivery = totalCount>0? Number(detail_delivery_fee):0;

				var hui_i = (manjian>0 || (userlevel>0))?('<i>' + echoCurrency('symbol') + '</em>' + (totalPrice).toFixed(2) + '</i>'):'';

          		countPrice = userlevel>0?countPrice:totalPrice;
				$(".left_con h4").html('<span><em>' + echoCurrency('symbol') + '</em>' + (countPrice-manjian).toFixed(2) + '</span>'+hui_i);
				//$(".left_con h4").html('<span><em>' + echoCurrency('symbol') + '</em>' + (totalPrice-manjian+delivery).toFixed(2) + '</span>'+hui_i);

			}

			//选择多规格
			//btn: 按钮，id：商品ID，title：商品名，nature：属性json，price：单价，dabao：打包费
			,
		naturePopup: function(btn, id, title, nature, price, dabao) {

				var list = [],
					skuDataNames = [],
					skuDataPrices = [];
				if (nature && nature.length > 0) {
					for (var i = 0; i < nature.length; i++) {
						var ifnoAddFee = nature[i].data.every(function(feature){
							return (feature.price == '0')
						})
						var clsName = (nature.length == 1 && nature[i].maxchoose == 1) && !ifnoAddFee ? 'oneFeature' : ''
						list.push('<dl  data-maxchoose="' + (nature[i].maxchoose ? nature[i].maxchoose : 1) +
							'" class="chose_item '+ clsName +(nature[i].data.length == 0? 'fn-hide':'')+'"><dt>' + nature[i].name + '</dt>');
						var data = nature[i].data;
						skuDataNames[i] = [];
						skuDataPrices[i] = [];
						
						for (var d = 0; d < data.length; d++) {
							skuDataNames[i].push(data[d].value);
							skuDataPrices[i].push(data[d].price);
							var cls = data[d].is_open == undefined || data[d].is_open == 0 ? '' : ' class="disabled"';
							var currPrice = (Number(data[d].price) + Number(price)).toFixed(2)
							// var currPrice = (Number(data[d].price) + Number(price) + Number(dabao)).toFixed(2)
							
							if(data[d].value){
								list.push('<dd data-id="'+i+d+'" class="fn-clear" data-natPrice="'+(data[d].price?data[d].price:0)+'"><span class="foodname">'+ data[d].value + '</span><span class="feature_price">'+echoCurrency("symbol")+'<b>'+parseFloat(currPrice)+'</b></span></dd>');
							}
							
						}
						list.push('</dl>');
					}
				}

				if (list) {
					$(".rank_box h2 strong").html(title);
					$(".rank_box .chose_box").html(list.join(""));
					$(".rank_box .chose_box dl").each(function(){
						var dl = $(this);
						if(dl.find('dd').length == 0){
							dl.remove()
						}
					})
					$(".rank_box .chose_price .price_show").html(echoCurrency('symbol') + price.toFixed(2));
				}

				$(".rank_box, .mask_nature").attr("style", "display: block");
				$(".rank_box .sure_cart").attr("disabled", true);

				var pic = btn.closest(".dd_box").data("src"),
					unit = btn.closest(".dd_box").data("unit");

				natureConfig.id = id;
				natureConfig.title = title;
				natureConfig.pic = pic;
				natureConfig.unit = unit;
				natureConfig.unitPrice = price;
				natureConfig.dabao = dabao;
				natureConfig.names = cartInit.descartes(skuDataNames);
				natureConfig.prices = cartInit.descartes(skuDataPrices);
			
			}

			//更新购物车商品
			,
		updateFood: function(type, btn, id, title, pic, unit, price, dabao, ntitle, nprice,is_discount,discount_value,partype) {
				//先删除打包费
				$(".cart_content").find(".dabao").remove();

				//先验证购物车中是否已经存在
				var has, dabaoPrice = 0,
					dabao = parseFloat(dabao);

				$(".cart_content").find(".cart_list li").each(function() {
					var lb = $(this),
						lid = Number(lb.attr("data-id")),
						lpartype = Number(lb.attr("data-partype")),
						lntitle = lb.attr("data-ntitle");
					var dabao_ = parseFloat(lb.attr("data-dabao"));
					var accountObj = lb.find(".change_cart span"),
						account = Number(accountObj.text());

					if (!lb.hasClass("dabao")) {
						if (lid == id && lntitle == ntitle) {
							has = true;

							//如果是减少则删除当前商品在购物车的内容
							if (account == 0 || (type == "reduce" && account == 1)) {
								dabao_ = 0;
								//在remove之前计算
								if(ntitle){
									cartInit.updateTypeSelectCount(btn,1,type,id);
								}else{
									if(clickCart){
										cartInit.updateTypeSelectCount(btn,'',type,id);
									}else{
										cartInit.updateTypeSelectCount(btn,'',type,'');
									}
								}

								lb.remove();
							} else {
								account = type == "plus" ? account + 1 : account - 1;
								accountObj.html(account).show();
								lb.find(".left_con h4").html('<span><em>' + echoCurrency("symbol") + '</em>' + Number((account * Number(
									nprice + price))).toFixed(2) + '</span>');

								if(ntitle){
									cartInit.updateTypeSelectCount(btn,1,type,id);
								}else{
									if(clickCart){
										cartInit.updateTypeSelectCount(btn,'',type,id);
									}else{
										cartInit.updateTypeSelectCount(btn,'',type,'');
									}
								}
							}
							if(clickCart){
								if($("#food" + lid).size() > 0){
									$("#food" + lid).find('.change_cart span').html(account);
								}
							}
						}

						if (dabao_ && shopin != '1') {
							dabaoPrice += dabao_ * account;
						}
					}
				});
				if (!has && type == "plus") {
					var list = [];
					list.push('<li class="cart_dd fn-clear" data-id="' + id + '" data-name="' + title + '" data-pic="' + pic +
						'" data-unit="' + unit + '" data-price="' + price + '" data-dabao="' + dabao + '" data-ntitle="' + ntitle +
						'" data-nprice="' + nprice + '" data-is_discount="'+is_discount+'" data-discount_value="'+discount_value+'" data-partype="'+partype+'">');
					list.push('<div class="cart_img"><img src="' + pic + '"></div>')
					list.push('<div class="cart_info">');
					list.push('<h3>' + title + '</h3>');
					if (ntitle) {
						list.push('<p class="natureTitle">' + ntitle + '</p>');
					}
					list.push('<p class="price"><span><em>' + echoCurrency('symbol') + '</em>' + (Number(price + nprice)).toFixed(2) +
						'</span><i class="o_price '+(is_discount=="0"?"fn-hide":"")+'">' + echoCurrency('symbol') + (Number(price + nprice)/(discount_value==0?1:(discount_value/10))).toFixed(2) + '</i></p>')
					list.push('</div>');
					list.push('<div class="change_cart"><i class="sub"></i><span>1</span><i class="add"></i></div>');
					list.push('</li>');

					$(".cart_content .cart_list").append(list.join(""));

					if (dabao && shopin != '1') {
						dabaoPrice += dabao;
					}
				}


				//打包费用
				if (dabaoPrice > 0) {
					var list = [];
					list.push('<li class="cart_dd dabao fn-clear">');
					list.push('<div class="info">');
					list.push('<h3>' + langData['siteConfig'][19][890] + '</h3>');  /* 打包费 */
					list.push('<p class="price"><span><em>' + echoCurrency('symbol') + '</em>' + dabaoPrice.toFixed(2) +
						'</span></p>')
					list.push('</div>');
					list.push('</li>');
					$(".cart_content .cart_list").append(list.join(""));
				}




				//统计汇总
				cartInit.statistic();

				// 购物车效果
				if (type == "plus" && !$(".cart_content ").is(":visible")) {
					var offset = $(".cart_box .cart").offset();
					var t = btn.offset();
					var scH = $(window).scrollTop();
					var img = btn.closest(".dd_box").find('.pro_img img').attr('src'); //获取当前点击图片链接
					var flyer = $('<img class="flyer-img" src="' + img + '">'); //抛物体对象
					flyer.fly({
                        speed: 4,
						start: {
							left: t.left - 50, //抛物体起点横坐标
							top: t.top - scH - 30 //抛物体起点纵坐标
						},
						end: {
							left: offset.left + 15, //抛物体终点横坐标
							top: offset.top - scH, //抛物体终点纵坐标
							width: 15,
							height: 15

						},
						onEnd: function() {
							this.destroy(); //销毁抛物体
							$('.cart_box .cart').addClass('swing');
							$('.cart_box').removeClass('null_cart')
							setTimeout(function() {
								$('.cart_box .cart').removeClass('swing')
							}, 300);
						}
					});
				}
				let cartInfo=localStorage.getItem(`wm_cart_${shopid}`);
				let blank=(!cartInfo||JSON.stringify(cartInfo)=='{}');
				if(!blank){ //页面显示先进行一次判断，是否需要设置定时器，本地为空不需要
					clearInterval(timer); //清除之前设置的，重新设置定时器
					timer = setInterval(function(){
						let cartInfo=localStorage.getItem(`wm_cart_${shopid}`);
						let blank=(!cartInfo||JSON.stringify(cartInfo)=='{}');
						if(blank){ //本地为空的话，清掉页面按钮状态并清除定时器
							$(".cart_content .cart_list").html("");
							$(".left_box i").remove();
							$(".change_cart span").html(0);
							$('.change_cart span, .sub').removeClass('show');
							$('.cart_box').addClass('null_cart');
							$('.left_box li').attr('data-count',0);
							cartInit.statistic();
							clearInterval(timer);
						}
					},2000);
				}
			}

			//统计分类已选数量
			,
		updateTypeSelectCount: function(btn,natureClick,type,btId) {
				var mainId,mainItem,mainCount = 0;
				if(clickCart){//点击购物车加减
					mainId =$(".cart_list li.cart_dd[data-id='"+btId+"']").attr('data-partype')
				}else{
					if(natureClick)
					mainId =$(".cart_list li.cart_dd[data-id='"+btId+"']").attr('data-partype')
				}

				var parLeft = $(".left_box li[data-id='"+mainId+"']");

				//针对选规格的商品数量
				if(natureClick){
					mainCount = parLeft.attr('data-count');
					if(type == 'plus'){
						mainCount++;
					}else{
						mainCount = mainCount > 1 ? mainCount - 1 : 0;
					}
					parLeft.attr('data-count',mainCount);
				}else{
					if(clickCart){
						mainCount = parLeft.attr('data-count');
						if(type == 'plus'){
							mainCount++;
						}else{
							mainCount = mainCount > 1 ? mainCount - 1 : 0;
						}
						parLeft.attr('data-count',mainCount);
					}else{
						mainItem = btn.closest(".dl_box");
						mainId = Number(mainItem.attr("data-id"));
						mainItem.find(".change_cart span").each(function() {
							mainCount += Number($(this).text());
						});
					}
				}

				//更新侧栏已点数量
				$(".left_box li").each(function() {
					var mli = $(this),
						mlid = mli.data("id"),
						mi = mli.find("i");
					if (mlid == mainId) {
						if (mainCount == 0) {
							mi.html(0).remove();
						} else {
							if (mi.size() > 0) {
								mi.html(mainCount);
							} else {
								mli.append("<i>" + mainCount + "</i>");
							}
						}
					}
				});
			}

			//增加或减少
			,
		plusORreduce: function(type, btn,speClick) {//speClick 1为购物车加减 2为规格加减
			var t = $(btn);
			var par;

			if(moreShopFlag && speClick == 1){//商品较多商家 点击 购物车中的加减
				par = t.closest(".cart_dd");
				clickCart = true;
			}else{
				par = t.closest(".dd_box");
				clickCart = false;

			}

			var	id = par.data("id"), //商品ID
				title = par.data("title"), //商品名称
				src = par.data("src"), //商品图片
				price = parseFloat(par.data("price")), //商品单价
				unit = par.data("unit"), //商品单位
				dabao = par.data("dabao"), //打包费
				stock = par.data("stock"), //商品库存
				nature = par.data("nature"), //商品自定义属性  [{"name":"类型","data":[{"value":"大杯","price":"2"},{"value":"中杯","price":"1"},{"value":"小杯","price":"0"}]},{"name":"辣度","data":[{"value":"微辣","price":"0"},{"value":"中辣","price":"0"},{"value":"特辣","price":"0"}]}]
				limitfood = Number(par.data("limitfood")), //是否限购
				foodnum = Number(par.data("foodnum")), //限购数量
				dealcount =  Number(par.data("dealcount")), //限购期间已下单数量

				daylimitfood = Number(par.data("daylimitfood")), //是否每天限购
				dayfoodnum = Number(par.data("dayfoodnum")),  //每天限购数量


				stime = par.data("stime"), //限购开始日期
				etime = par.data("etime") + 86400, //限购结束日期
				times = par.data("times"); //限购时间段  [["06:00","10:00"],["10:00","14:00"],["14:00","17:00"],["00:00","00:00"],["00:00","00:00"],["00:00","00:00"]]
				isDiscount = par.data("is_discount");
				discount_value = par.data("discount_value");
				dabao = dabao ? dabao : 0;
			var partype = par.data('partype');
			var count = Number(par.find(".change_cart span").text());
			//增加
			if (type == "plus") {
				if (nature && nature.length > 0 && limitfood) {
					$(".cart_list li[data-id='" + id + "']").each(function () {
						var dd = $(this), num = Number(dd.find('.change_cart span').text());
						count += num;
					});
					if(clickCart){//商品较多商家 点击 购物车中的加减
						count = count;
					}else{
						count++;
					}

				} else {
					if(clickCart){//商品较多商家 点击 购物车中的加减
						count = count;
					}else{
						count++;
					}
				}
				//减少
			} else {

				//如果是多规格，需要在购物车中操作减少
				if (count > 0 && nature && nature.length > 0) {
					alert(langData['siteConfig'][20][445]);
					return false;
				}
				if(moreShopFlag && speClick ==1){//商品较多商家 点击 购物车中的加减
					count = count > 1 ? count : 0;
				}else{
					count = count > 1 ? count - 1 : 0;
				}


				if ($('.cart_list li').length == 1 && Number($('.cart_list .change_cart span').text()) == 1) {
					$('.cart_box').addClass('null_cart');
				} else {
					$('.cart_box').removeClass('null_cart');
				}
			}

			//最多限制99个
			count = count > 99 ? 99 : count;

			if (limitfood) {
				//时间段
				var inTime = 0;
				for (var i = 0; i < times.length; i++) {
					var start = times[i][0],
						end = times[i][1];
					// if (start != "" && start != "00:00" && end != "" && end != "00:00") {
					if (start != "" && end != "" && end != "00:00") {
						//限购验证
						start = Number(start.replace(":", ""));
						end = Number(end.replace(":", ""));
						ntime = Number(nowTime.replace(":", ""));

						if (start < ntime && end > ntime) {
							inTime = 1;
						}
					}

					if (!inTime) {
						alert(langData['siteConfig'][20][446]);   /* 未到该商品的购买时间，暂时无法购买！*/
						return false;
					}
					if ((foodnum < count || foodnum <= dealcount) && stime < nowDate && etime > nowDate) {
						alert(langData['siteConfig'][20][447]);    /* 已达到该商品的购买数量上限！*/
						return false;
					}
				}



			}else if(daylimitfood){
				if(dayfoodnum < count || foodnum < dayfoodnum){
					alert(langData['siteConfig'][20][447]);    /* 已达到该商品的购买数量上限！*/
					return false;
				}
			}

			//库存验证
			if (stock != "" && (stock == 0 || stock - count < 0)) {
				alert(langData['siteConfig'][20][448]);   /* 该商品库存不足！*/
				return false;

				//如果购物车数量超出库存，将购物车数量更新为库存的量
				if (stock - count < 0) {
					par.find("change_cart span").html(stock).show();
					par.find('.sub').addClass('show');
				}
			} else {

				//如果是添加多规格的商品，需要在浮动层中选择
				if (type == "plus" && nature) {
					cartInit.naturePopup(t, id, title, nature, price, dabao);
					return false;
				}

				par.find(".change_cart span").html(count).addClass('show');
				if (count != 0) {
					par.find('.sub').addClass('show');
					par.find('.change_cart span').addClass('show');
				} else {
					par.find('.sub').removeClass('show');
					par.find('.change_cart span').removeClass('show');
					if(moreShopFlag){
						$(".right_list .dd_box[data-id='" + id + "']").find('.sub').removeClass('show');
						$(".right_list .dd_box[data-id='" + id + "']").find('.change_cart span').removeClass('show');
					}

				}

			}

			//更新购物车商品
			cartInit.updateFood(type, t, id, title, src, unit, price, dabao, "", 0, isDiscount, discount_value,partype);
			
		}

			//清空购物车
			,
		clean: function() {
				if (confirm(langData['siteConfig'][20][449])) {  /* 确认要清空吗？ */
					$(".cart_content .cart_list").html("");
					$(".left_box i").remove();
					$(".change_cart span").html(0);
					$('.change_cart span, .sub').removeClass('show');
					$('.cart_box').addClass('null_cart');
					$('.left_box li').attr('data-count',0);
					cartInit.statistic();
				}
			}

			//笛卡儿积组合
			,
		descartes: function(list) {
			//parent上一级索引;count指针计数
			var point = {};
			var result = [];
			var pIndex = null;
			var tempCount = 0;
			var temp = [];
			//根据参数列生成指针对象

			for (var index in list) {
				if (index != 'in_array' && typeof list[index] == 'object') {
					point[index] = {
						'parent': pIndex,
						'count': 0
					}
					pIndex = index;
				}
			}
			//单维度数据结构直接返回
			if (pIndex == null) {
				return list;
			}
			//动态生成笛卡尔积
			while (true) {
				var index_ = null;
				for (var index in list) {
					if (index != 'in_array') {
						tempCount = point[index]['count'];
						temp.push(list[index][tempCount]);
						index_ = index;
					}
				}
				index = index_;
				//压入结果数组
				result.push(temp);
				temp = [];
				//检查指针最大值问题
				while (true) {
					if (point[index]['count'] + 1 >= list[index].length) {
						point[index]['count'] = 0;
						pIndex = point[index]['parent'];
						if (pIndex == null) {
							return result;
						}
						//赋值parent进行再次检查
						index = pIndex;
					} else {
						point[index]['count']++;
						break;
					}
				}
			}
		}

		// 更新所有商品
		,
		update_pro:function(){
			//foodlist = [];
			// $('.dd_box').each(function() {
			// 	var t = $(this);
			// 	var dd_info = {};
			// 	dd_info = {
			// 		fname: t.find('h3').html(),
			// 		ftitle: t.find('h3').text(),
			// 		id: t.attr('data-id'),
			// 		src: t.attr('data-src'),
			// 		descript: t.attr('data-descript'), //描述
			// 		dabao: t.attr('data-dabao'), //是否打包
			// 		litpic: t.find('.pro_img img').attr('data-url'), //图片
			// 		price: t.attr('data-price'), //价格
			// 		nature: t.attr('data-nature'), //规格
			// 		limitfood: t.attr('data-limitfood'), //限购
			// 		unit: t.attr('data-unit'),
			// 		stock: t.attr('data-stock'), //库存
			// 		stockvalid: t.attr('data-stockvalid'), //库存状态
			// 		sale: t.attr("data-sale"),
			// 		foodnum: t.attr('data-foodnum'),
			// 		stime: t.attr('data-stime'),
			// 		etime: t.attr('data-etime'),
			// 		times: t.attr('data-times'),
			// 		formerprice: t.attr('data-formerprice'),
			// 		chose_num: Number(t.find('.change_cart span').text()),
			// 		vipprice:t.attr('data-vipprive'),
			// 		is_discount : t.attr("data-is_discount"),
			// 		discount_value : t.attr("data-discount_value"),
			// 	}
			// 	foodlist.push(dd_info);
			// });
		}
	}
	//cartInit.init();



});
Array.prototype.in_array = function(e) {
	for (i = 0; i < this.length && this[i] != e; i++);
	return !(i == this.length);
}
