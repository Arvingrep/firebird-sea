$(function(){
var hpage = 1, hisload = false;

var orderby = 1;

	function getList(){
		var data = [];
		if(hisload) return false;
		hisload = true;
		$.ajax({
			url: '/include/ajax.php?service=member&action=userQuanList&gettype=1&orderby='+orderby,
			type: 'post',
			dataType: 'json',
			success: function(data){

				if(data && data.state == 100){
					var list = data.info.list, len = list.length, html = [],pageInfo = data.info.pageInfo;

					for(var i = 0; i < len; i++){
						var quanmoney = '';
						if(list[i].promotiotype ==0){
							quanmoney = echoCurrency('symbol')+'<b>'+parseFloat(list[i].promotio)+'</b>';
						}else{
							quanmoney = '<b>'+parseFloat(list[i].promotio)+'</b>折';
						}
						// 通用
						if(list[i].bear === '1'){  //实际数据不需要这个判断条件  需要判断券的类型
							html.push(`<a class="quan toMini" href="${list[i].url}" data-temp="index" data-module="shop">`);
							html.push('<div class="q_amount">');
							html.push(quanmoney+'</div>');
							html.push('<div class="q_info">');
							html.push('<h4>'+list[i].name+'</h4>');
							html.push('<span class="lab">商城通用券</span>');
							html.push('<p>'+list[i].ymdetime+'到期</p></div>');
							html.push('<div class="btn tose">去使用</div></a>');
						}else{
							// 店铺
							html.push('<div class="shopQuan">');
							html.push(`<a class="shopinfo toMini" href="${list[i].url}" data-temp="store-detail" data-module="shop" data-id="${list[i].shopids}">`);
							html.push('<div class="shop_logo"><img src="'+list[i].logo+'" alt=""></div>');
							html.push('<div class="shop_name">'+list[i].title+'</div></a>');
							html.push('<div class="shop_qlist">');
							// for(var m = i; m>=0; m--){
							html.push('<div class="shop_q">');
							html.push(`<a class="q_amount toMini" href="${shopUrl}?id=${list[i].qid}" data-temp="quanDetail" data-module="shop" data-id="${list[i].qid}">`);
							html.push(quanmoney+'</a>');
							html.push(`<a class="q_info toMini" style="display:block;" href="${shopUrl}?id=${list[i].qid}" data-temp="quanDetail" data-module="shop" data-id="${list[i].qid}">`);
							html.push('<h4>'+list[i].name+'</h4>');
							html.push('<span class="lab">'+(list[i].quantype === '1' ?'商品券':'店铺券')+'</span>');
							html.push('<p>'+list[i].ymdetime+'到期</p>');
							html.push(`</a> <a href="${list[i].url}" class="btn tose toMini" data-temp="store-detail" data-module="shop" data-id="${list[i].shopids}">去使用</a> </div>`);
							// }
							html.push(' </div> </div>');
						}
					}
					hisload = false;
					$(".shop_qlist .ul_list").html(html.join(""));
					$(".shop_qlist .loading").html('没有更多了')

					$("#shop").text(pageInfo.totalCount1);
					$("#waimai").text(pageInfo.totalCount2);
				}else{
					hisload = false;
					$(".shop_qlist .loading").addClass('noData').html('还没有优惠券哦');  /* 暂无优惠券 */
					$(".shop_qlist .linkTo").removeClass('fn-hide');
					$(".cancel.mgb").hide();
				}
			}
		})
	}

	function getwmQuqn(){
		var data = [];
		$.ajax({
			url: '/include/ajax.php?service=member&action=userQuanList&gettype=2',
			type: 'post',
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
					var list = data.info.list, len = list.length, html = [],pageInfo = data.info.pageInfo;

					for(var i = 0; i < len; i++){
						var obj = list[i], item = [];
						var shopList = obj.shopList, foodList = obj.foodList;
						choseid = 0
						var limit = [];
						let paramStr = '',clsMini = ''
						if(obj.quantype == '0'){
							paramStr = "data-temp='index' data-module='waimai'"
							clsMini = 'toMini'
						}
						limit.push(langData['waimai'][2][111].replace('1', obj.username));

						item.push('<li data-id="'+obj.id+'" class="li_list "><a href="'+obj.url+'" '+paramStr+' class="fn-clear '+ clsMini +'">');    //选择的class名chosed
						item.push('<div class="left_num"><h3>' + echoCurrency("symbol") + '<em>'+(obj.money/1)+'</em></h3><p>'+langData['waimai'][2][114].replace('1', obj.basic_price/1)+'</p></div>');
					  	item.push('<p class="right_btn">去使用</p>');   /*  立<br />即<br />使<br />用 */
						
                      	var btm = '<p class="dead_tip">全店通用</p><p class="dead_tip" style="margin-top: .1rem;">'+langData['waimai'][7][143]+'<em>'+obj.ymdetime+'</em></p>';  /*有效期至 */
                      
                      	//店铺信息
                      	if(obj.title){
                        	var btm = '<p class="dead_tip">'+obj.title+'</p><p class="dead_tip" style="margin-top: .1rem;">'+langData['waimai'][7][143]+'<em>'+obj.ymdetime+'</em></p>';  /*有效期至 */
                        }
                      
						item.push('<div class="coupon_info"><h2>'+obj.name+'</h2>'+btm+'</div>');

						item.push('</a></li>');

						html.push(item.join(""));
						$(".waimai_qlist .loading").remove()
					}
					$(".waimai_qlist ul").html(html.join(""));
					$(".waimai_qlist ul").prepend($(".waimai_qlist ul .li_list.chosed"))

					$("#shop").text(pageInfo.totalCount1);
					$("#waimai").text(pageInfo.totalCount2);
				}else{

					$(".waimai_qlist .loading").html('<div class="noData"></div><p>还没有优惠券哦</p>');  /* 暂无优惠券 */
				}
			}
		})
	}

	// 切换
$(".tabbox .left_tab span").click(function(){
	if(!$(this).hasClass('curr')){
		$(this).addClass('curr').siblings('span').removeClass('curr');
		var ind = $(this).index(), type = $(this).data('id');
		$(".quanbox>div").eq(ind).removeClass('fn-hide').siblings('div').addClass('fn-hide');
		if(	type == 'history' && $(".ul_history li").length==0){
			getHistory();
		}else if(type == 'shop' && $(".shop_qlist li").length==0){
			getList();
		}else if(type == 'waimai' && $(".waimai_qlist li").length==0){
			getwmQuqn();
          
		}
	}
});

$(".tabbox .left_tab span:eq(0)").click();

// 点击最近领取
$(".right_shai").click(function(){
	$(".mask,.shaiItembox").addClass('show')
});

$(".mask").click(function(){
	$(".mask,.shaiItembox").removeClass('show')
})

$(".shaiItembox li").click(function(){
	$(this).addClass('on_chose').siblings('li').removeClass('on_chose');
	orderby = $(this).attr('data-id');
	$('.right_shai').text($(this).text())
	$(".mask").click();
	getList();
})

// 滚动加载
$(window).scroll(function(){
  var bh = $('body').height();
  var wh = $(window).height() + 50;
  var sch = $(window).scrollTop();
  if(sch >= bh - wh && !hisload && !$(".historyQuan").hasClass('fn-hide')){
    getHistory();
  }
})

function getHistory(){
	if(hisload) return false;
	hisload = true;
	$(".historyQuan .loading").html('加载中~')
	$.ajax({
		url: '/include/ajax.php?service=member&action=userQuanList&gettype=3&pageSize=10&page='+hpage,
		type: "POST",
		dataType: "json",
		success: function (data) {
			if(data.state == 100){
				var list = data.info.list;
				var totalCount = data.info.pageInfo.totalCount;
				var quanlist = []
				for(var i = 0; i < list.length; i++){

					var lsclass = '';
					if(list[i].state ==0){
						lsclass = 'guoqi';
					}else{
						lsclass = 'user';
					}
					quanlist.push('<li class="fn-clear '+lsclass+'">');
					quanlist.push('<div class="left_con">');
					if(list[i].quantype=='waimai'){

						quanlist.push('<h2>'+echoCurrency("symbol")+'<b>'+parseFloat(list[i].money)+'</b></h2>');
					}else{

						var quanmoney = '';
						if(list[i].promotiotype ==0){
							quanmoney = echoCurrency("symbol")+'<b>'+parseFloat(list[i].promotio)+'</b>';
						}else{
							quanmoney = '<b>'+parseFloat(list[i].promotio)+'</b>折';
						}

						quanlist.push('<h2>'+quanmoney+'</h2>');

					}
					quanlist.push('<p>满'+list[i].basic_price+'可用</p>');
					quanlist.push('</div>');
					quanlist.push('<div class="quan_info">');
					quanlist.push('<h3>'+list[i].name+'</h3>');

					var quanname  = '';

					if(list[i].quantype =='waiami'){
						quanname ='外卖优惠券';
					}else{
						quanname ='商城优惠券';
					}
					quanlist.push('<p class="quantype"><span>'+quanname+'</span></p>');
					quanlist.push('<p class="time">'+list[i].ymdktime+'-'+list[i].ymdetime+'</p>');
					quanlist.push('</div> </li>');
				}


				$('.ul_history').append(quanlist.join(''));
				hpage++;
				hisload = false;
				$(".historyQuan .loading").html('下拉加载更多~');
				if(hpage > data.info.pageInfo.totalPage){
					hisload = true;
					$(".historyQuan .loading").html('没有更多了~');
				}
			}
		},
		error: function(){
			hisload = false;
			$(".historyQuan .loading").html(data.info);
		}
	});



	}

})
