$(function(){
var hpage = 1, hisload = false;
var orderby = 1;



	function getList(){
		var data = [];
		if(hisload) return false;
		hisload = true;
		$.ajax({
			url: '/include/ajax.php?service=shop&action=myquanlist&orderby='+orderby+'&getype=1&pageSize=10&page='+hpage,
			type: 'post',
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
					var list = data.info.list, len = list.length, html = [];
					var totalCount = data.info.pageInfo.totalCount;

					for(var i = 0; i < len; i++){

						var quanmoney = '';
						var quantext = '';
						var quanType = list[i].bear === '1' ? '全场' : ''
						if(list[i].promotiotype ==0){
							quanmoney = echoCurrency('symbol') + '<b>'+list[i].promotio.replace(/(?:\.0*|(\.\d+?)0+)$/,'$1')+'</b>';
							if(list[i].bear === '1'){
								if(list[i].basic_price > 0){
									quantext =  '全场满'+parseFloat(list[i].basic_price)+'减'+list[i].promotio.replace(/(?:\.0*|(\.\d+?)0+)$/,'$1')
								}else{
									quantext = '全场无门槛减'+list[i].promotio.replace(/(?:\.0*|(\.\d+?)0+)$/,'$1')
								}
							}else{
								if(list[i].basic_price > 0){
									quantext =  '满'+parseFloat(list[i].basic_price)+'可用'
								}else{
									quantext = '无门槛'
								}
							}
							
						}else{
							quanmoney = '<b>'+list[i].promotio.replace(/(?:\.0*|(\.\d+?)0+)$/,'$1')+'</b>折';
							if(list[i].bear === '1'){
								if(list[i].basic_price > 0){
									quantext = '全场满'+parseFloat(list[i].basic_price)+'打'+list[i].promotio.replace(/(?:\.0*|(\.\d+?)0+)$/,'$1')+'折'
								}else{
									quantext = '全场无门槛'+list[i].promotio.replace(/(?:\.0*|(\.\d+?)0+)$/,'$1')+'折'
								}
							}else{
								if(list[i].basic_price > 0){
									quantext = '满'+parseFloat(list[i].basic_price)+'可用'
								}else{
									quantext = '无门槛'
								}
							}
							
						}
                   		




						// 通用
						if(list[i].bear === '1'){  //实际数据不需要这个判断条件  需要判断券的类型
							html.push(`<a class="quan toMini" href="${list[i].url}" data-temp="index" data-module="shop">`);
							html.push('<div class="q_amount">');
							// html.push(echoCurrency('symbol'));
							html.push('<span style="white-space:nowrap; display:inline-block;">' + quanmoney+'</span></div>');
							html.push('<div class="q_info">');
							html.push('<h4>'+quantext+'</h4>');
							html.push('<span class="lab">商城通用券</span>');
							html.push('<p>'+list[i].ymdetime+'到期</p></div>');
							html.push('<div class="btn tose">去使用</div></a>');
						}else{
							console.log(list[i])
							// 店铺
							html.push('<div class="shopQuan">');
							html.push(`<a class="shopinfo toMini" href="${list[i].url}" data-temp="store-detail" data-module="shop" data-id="${list[i].shopids}">`);
							html.push('<div class="shop_logo"><img src="'+huoniao.changeFileSize(list[i].logo,100,100)+'" onerror="this.src=\'/static/images/shop.png\'" alt=""></div>');
							html.push('<div class="shop_name">'+list[i].title+'</div></a>');
							html.push('<div class="shop_qlist">');
							// for(var m = i; m>=0; m--){
								html.push(`<div class="shop_q">`);
								html.push(`<a class="q_amount toMini" href="${shopUrl}?id=${list[i].qid}" data-temp="quanDetail" data-module="shop" data-id="${list[i].qid}">`);
								// html.push();
								html.push('<span style="white-space:nowrap; display:inline-block;">' +quanmoney +'</span></a>');
								html.push(`<a class="q_info toMini" href="${shopUrl}?id=${list[i].qid}" data-temp="quanDetail" data-module="shop" data-id="${list[i].qid}">`);
								html.push('<h4>'+quantext+'</h4>');
								html.push('<span class="lab">店铺券</span>');
								html.push('<p>'+list[i].ymdetime+'到期</p>');
								html.push(`</a> <a class="btn tose toMini" href="${list[i].url}" data-temp="store-detail" data-module="shop" data-id="${list[i].shopids}">去使用</a> </div>`);
							// }
							html.push(' </div> </div>');
						}
					}
					$('#unused').html(totalCount);

					
					hisload = false;
					$(".coupon_list .ul_list").html(html.join(""));
					$(".canUseQuan .loading").html('没有更多了')
					$(".shop_q").each(function(){
						changeFont($(this))
					})
				}else{
					hisload = false;
					$(".canUseQuan .loading").addClass('noData').html('还没有优惠券哦');  /* 暂无优惠券 */
					$(".canUseQuan .linkTo").removeClass('fn-hide');
					$(".cancel.mgb").hide();
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
		url: '/include/ajax.php?service=shop&action=myquanlist&getype=2&pageSize=10&page='+hpage,
		type: "POST",
		dataType: "json",
		success: function (data) {
			if(data.state == 100){
				var list = data.info.list;
				var totalCount = data.info.pageInfo.totalCount;
				var quanlist = []
				for(var i = 0; i < list.length; i++){
					var quanmoney = '';

					if(list[i].promotiotype ==0){
						quanmoney = echoCurrency("symbol")+list[i].promotio;

					}else{
						quanmoney = list[i].promotio+'折';

					}

					var quantypnename = '';
					if(list[i].bear === '1'){
						quantypnename = '商城通用券'
					}else{

						if(list[i].quantype == 1){
							quantypnename = '指定商品';
						}else{
							quantypnename = '店铺券';
						}
					}
                  var qstate = list[i].state=='0'?"guoqi":"user"
					quanlist.push('<li class="fn-clear '+qstate+'">');
					quanlist.push('<div class="left_con">');
					quanlist.push('<h2>'+quanmoney+'</h2>');
					quanlist.push('<p>满'+list[i].basic_price+'可用</p>');
					quanlist.push('</div>');
					quanlist.push('<div class="quan_info">');
					quanlist.push('<h3>'+list[i].name+'</h3>');
					quanlist.push('<p class="quantype"><span>'+quantypnename+'</span></p>');
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
			}else{
              $(".historyQuan .loading").addClass('noData').html('暂无优惠券使用记录');  /* 暂无优惠券 */;
            }
		},
		error: function(){
			hisload = false;
			$(".historyQuan .loading").html(data.info);
		}
	});



	}

})

// 修改字体大小 使其自适应div宽度
function changeFont(t){

    let boxWidth  = t.find('.q_amount').width()
    let txtWidth  = t.find('.q_amount span').width()
    if(txtWidth <= boxWidth) {
        // domText.style.transform = 'none';
        t.find('.q_amount span').css('transform','none')
    } else {
        let r = boxWidth/txtWidth;
        // domText.style.transform = `scale(${r})`;
        t.find('.q_amount span').css('transform',`scale(${r})`)
    }
}