$(function(){
var hpage = 1, hisload = false;
var orderby = 1;



	function getList(){
		var data = [];

		$.ajax({
			url: '/include/ajax.php?service=waimai&action=quanList&orderby='+orderby,
			type: 'post',
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
					var list = data.info.list, len = list.length, html = [];

					for(var i = 0; i < len; i++){
						var obj = list[i], item = [];
						var shopList = obj.shopList, foodList = obj.foodList;
						choseid = 0
						var limit = [];
						// var quanToUrl = url.indexOf('type=no')>-1?waimaiUrl:( obj.fail == 1 ? 'javascript:;' : cartUrl.replace('#quan', obj.id) )

						if(shopList.length > 0){
							if(shopList.length > 3){
								limit.push(langData['waimai'][2][110].replace('1', shopList[0]).replace('2', shopList.length));   /* 限1等2家店铺使用*/
							}else{
								limit.push(langData['waimai'][2][111].replace('1', shopList.join("、")));   /* 限1使用*/
							}
						}
						if(foodList.length > 0){
							if(foodList.length > 3){
								limit.push(langData['waimai'][2][112].replace('1', foodList[0]).replace('2', foodList.length));    /* 限1等2件商品使用*/
							}else{
								limit.push(langData['waimai'][2][111].replace('1', foodList.join("、")));   /* 限1使用*/
							}
						}

						limit.push(langData['waimai'][2][111].replace('1', obj.username));

						var guoqi = obj.kuaiexp ? "chosed" : "";
						item.push('<li data-id="'+obj.id+'" class="li_list '+guoqi+'"><a href="'+obj.url+'" class="fn-clear">');    //选择的class名chosed
						item.push('<div class="left_num"><h3>' + echoCurrency("symbol") + '<em>'+(obj.money/1)+'</em></h3><p>'+langData['waimai'][2][114].replace('1', obj.basic_price/1)+'</p></div>');
					  	item.push('<p class="right_btn">去使用</p>');   /*  立<br />即<br />使<br />用 */
						var quanname = '';
						if(obj.shoptype ==0){
							quanname = obj.money+echoCurrency("short")+'外卖通用券';
						}else{
							quanname = obj.name;
						}
						item.push('<div class="coupon_info"><h2>'+quanname+'</h2><p class="dead_tip">'+langData['waimai'][7][143]+'<em>'+obj.deadline+'</em></p></div>');  /*有效期至 */
						if(obj.fail == 1){
							item.push('<div class="no_tip">'+obj.failnote+'</div>');

						}
						item.push('</a></li>');

						html.push(item.join(""));
						$(".canUseQuan .loading").remove()
					}
					$('#totalcount').text(data.info.totalCount);
					$(".coupon_list ul").html(html.join(""));
					$(".coupon_list ul").prepend($(".coupon_list ul .li_list.chosed"))
				}else{

					$(".canUseQuan .loading").html('<div class="noData"></div><p>还没有优惠券哦</p>');  /* 暂无优惠券 */
				}
			}
		})
	}
	getList();


	// 切换
$(".tabbox .left_tab span").click(function(){
	if(!$(this).hasClass('curr')){
		$(this).addClass('curr').siblings('span').removeClass('curr');
		var ind = $(this).index();
		$(".quanbox>div").eq(ind).removeClass('fn-hide').siblings('div').addClass('fn-hide');
		if(	ind == 1 && $(".ul_history li").length==0){
			getHistory()
		}
	}
});

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
	$(this).attr('data-id');
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
		url: '/include/ajax.php?service=waimai&action=quanList&getype=2&pageSize=10&page='+hpage,
		type: "POST",
		dataType: "json",
		success: function (data) {
			if(data.state == 100){
				var list = data.info.list;
				var totalCount = data.info.totalCount;
				var quanlist = []
				for(var i = 0; i < list.length; i++){
                  var qstate = list[i].state=='0'?"guoqi":"user"
					quanlist.push('<li class="fn-clear '+qstate+'">');
					quanlist.push('<div class="left_con">');
					quanlist.push('<h2>'+echoCurrency("symbol")+'<b>'+parseFloat(list[i].money)+'</b></h2>');
					quanlist.push('<p>满'+list[i].basic_price+'可用</p>');
					quanlist.push('</div>');
					quanlist.push('<div class="quan_info">');
					quanlist.push('<h3>'+list[i].name+'</h3>');
					quanlist.push('<p class="quantype"><span>'+(list[i].shoptype== 0 ?"平台通用券":"店铺券" )+'</span></p>');
					quanlist.push('<p class="time">'+list[i].deadline+'</p>');
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
			}else{
              hisload = false;
              $(".historyQuan .loading").html('<div class="noData"></div><p>还没有优惠券哦</p>');
            }
		},
		error: function(){
			hisload = false;
			$(".historyQuan .loading").html(data.info);
		}
	});



	}

})
