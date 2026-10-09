$(function(){

  var Quanlen = $(".bannerquanbox .quanbox li").size()
  if(Quanlen == 0){
    $(".bannerquanbox").addClass('topCenter')
  }



  //销量，人气，价格
	$(".bread span.left").hover(function(){
		var $this=$(this);
		$this.find("ul").show();
	},function(){
		var $this=$(this);
		$this.find("ul").hide();
	});

getQuanList1('.showNow');

getQuanList1('.chaozhi_quan');

// 滚动加载更多
$(window).scroll(function(){
  var scrtop = $(window).scrollTop();
  var ofsetTop = $(".ensure").offset().top;
  var winH = $(window).height();
  var isload = $('.chaozhi_quan').attr('data-load')
  if((scrtop + winH) >= ofsetTop && isload!='1'){
    getQuanList1('.chaozhi_quan');
  }
});

// 显示更多分类
$('.more_show').hover(function(){
  $(this).hide();
  $('.navbox,.quanContainer .container_tit').css('height','auto')
});

// 点击显示
$('.navbox li').click(function(){
  var t = $(this);
  if(!t.hasClass('more_show')){
    t.addClass('curr').siblings().removeClass('curr');
    var typeid = t.attr('data-id');
    $('.shopquanBox>div').addClass('fn-hide').removeClass('showNow')
    $('.shopquanBox>div[data-id="'+typeid+'"]').addClass('showNow').removeClass('fn-hide');
    if($('.shopquanBox>div[data-id="'+typeid+'"]').find('li').length == 0){
      getQuanList1('.showNow');
    }
  }
})

  //我的券
  $('.myQuan').click(function(){
    $('.showQuan').click();
  })
  
// 点击加载更多
$('.showNow .more_quan').click(function(){
  getQuanList1('.showNow');
})
  function getQuanList1(dom){
    var typeid = 0;
    var storetype = '';
    if(dom == '.showNow'){
      typeid = $(dom).attr('data-id'); //id
        storetype = '&storetype='+typeid+'&lingquancenter=1&gettype=2';

    }

    if(dom == '.chaozhi_quan'){
        storetype = '&gettype=1&lingquancenter=1';
    }

    var isload = $(dom).attr('data-load');
    var page = Number($(dom).attr('data-page')); //当前页码
    if(isload == '1') return false;
    $(dom).attr('data-load',1);
    $(dom).find('ul').append('<div class="loading"><s></s>加载中</div>')
    $.ajax({
			url: '/include/ajax.php?service=shop&action=quanList'+storetype+'&pageSize=6&page='+page,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data.state == 100){
                  var list = data.info.list;
                  var html = [];
                  for(var i=0; i<list.length; i++){
                    html.push('<li><a href="'+list[i].url+'" class="quan '+(list[i].is_lingqu ==1?"hasget":"")+'">');
                            if(list[i].is_lingqu ==1){

                                html.push('<div class="right_btn to_use">去 使 用</div>');
                            }else{
                              	if(list[i].sent > 0){
                                   html.push('<div class="right_btn to_get" data-id="'+list[i].id+'">立 即 领 取</div>');
                                }else{
                                  html.push('<div class="right_btn to_use " data-id="'+list[i].id+'">已 抢 完</div>');
                                }
                               
                            }
                            html.push('<div class="left_info">');
                            html.push('<s class="get_icon"></s>');
                            
                            html.push('<div class="quan_img"><img src="'+list[i].logo+'" alt="" onerror="this.src=\'/static/images/shop.png\'"></div>');
                            html.push('<div class="quan_detail">');

                          var quanmoney = daoshouprice ='';
                          if(list[i].promotiotype ==0){
                              quanmoney = echoCurrency("symbol")+'<span>'+list[i].promotio+'</span>';
                          }else{
                              quanmoney = '<span>'+list[i].promotio+'</span>折';
                          }
                            html.push('<h1>'+quanmoney+'<em>满'+list[i].basic_price+'可用</em></h1>');
                            html.push('<div class="use_info">');
                            html.push('<h4>'+list[i].storename+'</h4>');
                            html.push('<p>店铺商品券</p></div>');
                            html.push('<div class="quan_num"><span class="all"><s style="width:'+list[i].percentage+'%;"></s></b></span>已抢'+list[i].percentage+'%</div>');
                            html.push('</div> </div> </a></li>');
                  }
                  $(dom).find('.loading').remove();
                  $(dom).find('ul').append(html.join(''));
                  $(dom).attr('data-load',0);
                  page++;
                  $(dom).attr('data-page',page)
                  if(page > data.info.pageInfo.totalPage){
                    $(dom).attr('data-load',1);
                    $(dom).find('.more_quan').remove()
                  }
                }else{
                  $(dom).find('.loading').html(data.info);
                  $(dom).find('.more_quan').remove()
                }
			},
			error: function(){
               $(dom).find('.loading').html(data.info);
              $(dom).find('.more_quan').remove()
            }
		});
  }

    $(".getQuan").click(function () {

        var qid = $(this).attr('data-id');
        var t   = $(this)
        $.ajax({
            url: "/include/ajax.php?service=shop&action=getQuan&qid="+qid,
            type:'POST',
            dataType: "json",
            success:function (data) {
                if(data.state ==100){
                    t.text('去 使 用 ');
                    t.addClass('noChose').removeClass('to_get');
                    t.closest('a.quan').addClass('hasget')
                    alert(data.info)

                }else{
                    alert(data.info)
                }
            },
            error:function () {

            }
        });
        return false;
    })

    $('.quanlistbox ').delegate('.to_get','click',function () {
        var t = $(this);
        var qid = $(this).attr('data-id');
        $.ajax({
            url: "/include/ajax.php?service=shop&action=getQuan&qid="+qid,
            type:'POST',
            dataType: "json",
            success:function (data) {
                if(data.state ==100){

                    t.text('去 使 用 ');
                    t.closest('a.quan').addClass('hasget')
                    t.addClass('noChose').removeClass('to_get');
                    alert(data.info)

                }else{
                    alert(data.info)
                }
            },
            error:function () {

            }
        });
        return false;
    })
})
