$(function(){
// 券查看

  

// 火热抢券没有数据
  if($(".hotquan li").length == 0){
    $(".hotquan").addClass('fn-hide')
  }
  var tswiper = $('.quan-swiper .swiper-wrapper');
  var swiperNav = [], mainNavLi = tswiper.find('.qlist');
  if(mainNavLi.length > 2){
    for (var i = 0; i < mainNavLi.length; i++) {
      if(i%3 == 0){

        swiperNav.push('<div class="qlist q_big">'+tswiper.find('.qlist:eq('+i+')').html()+'</div>');
      }else{
        swiperNav.push('<div class="qlist q_small">'+tswiper.find('.qlist:eq('+i+')').html()+'</div>');

      }
    }

    var liArr = [];
    for(var i = 0; i < swiperNav.length; i++){
      liArr.push(swiperNav.slice(i, i + 3).join(""));
      i += 2;
    }

    tswiper.html('<div class="quanbox fn-clear swiper-slide">'+liArr.join('</div><div class="quanbox fn-clear swiper-slide">')+'</div>');
    $('.quan-swiper').removeClass('fn-hide');
    var swiper2 = new Swiper('.quan-swiper.swiper-container',{
      pagination: {
        el: '.pagination',
        type: 'progressbar',
      },
    });
  }else {
    mainNavLi.addClass('q_big');
    $('.pagination').remove()
    $('.quan-swiper .swiper-wrapper').html('<div class="quanbox fn-clear swiper-slide">'+$('.quan-swiper .swiper-wrapper').html()+'</div>')
    $('.quan-swiper').removeClass('fn-hide');
  }

// 火热抢券
   var swiper = new Swiper('.hotquan.swiper-container',{
     on: {
        slideChangeTransitionStart: function(){
          $(".hotbox .tabbox li").eq(this.activeIndex).addClass('curr').siblings('li').removeClass('curr')
        },
      },
   });
   $(".hotbox .tabbox li").click(function(){
     var index = $(this).index()
     swiper.slideTo(index);//切换到第一个slide，速度为1秒
   })

// 商品商铺切换
var swiper3 = new Swiper('.scrollBox.swiper-container',{
  on: {
    init:function(){
      getquan();
    },
     slideChangeTransitionStart: function(){
       $(".scrollBox .tabbox li").eq(this.activeIndex).addClass('curr').siblings('li').removeClass('curr');
       if($(".scroll_ul").eq(this.activeIndex).find('li').length == 0){
         getquan();
       }
     },
   },
});
$(".scrollBox .tabbox li").click(function(){
  var index = $(this).index()
  swiper3.slideTo(index);//切换到第一个slide，速度为1秒
})

$(window).scroll(function(event) {
  /* Act on the event */
  var wh = $(window).height();
  var bh = $('body').height();
  var sch = $(window).scrollTop();
  var sel_top = $('.scrollBox').offset().top;
  var page = $('.scrollBox .tabbox li.curr').attr('data-page');
  var isload = $('.scrollBox .tabbox li.curr').attr('data-load');
  if((sel_top - sch) <= bh && page == '1' && isload=='0'){
    getquan();
  }
  // 下拉加载更多
  if((wh + sch + 50) >= bh && isload=='0'){
     getquan()
  }
});


function getquan(){
  var type = $('.scrollBox .tabbox li.curr').attr('data-type');
  var page = $('.scrollBox .tabbox li.curr').attr('data-page');
  var isload = $('.scrollBox .tabbox li.curr').attr('data-load');
  if(isload == '1') return false;
  var index = $('.scrollBox .tabbox li.curr').index();
  $('.scrollBox .tabbox li.curr').attr('data-load','1');
  $(".scroll_ul").eq(index).find('.loading').html('加载中');
  $.ajax({
        url: '/include/ajax.php?service=shop&action=quanList&gettype='+type+'&pageSize=10&page='+page,
        type: "POST",
        dataType: "json",
        success: function (data) {
        $(".scroll_ul").eq(index).find('.loading').remove()
				if(data.state == 100){
          var list = data.info.list;
          var html = [];
          for(var i = 0; i < list.length; i++){

            //if(list[i].is_lingqu==1){
              // continue;
            //}
            var quanmoney = daoshouprice ='';
            if(list[i].promotiotype ==0){
              quanmoney = '<b>'+list[i].promotio.replace(/(?:\.0*|(\.\d+?)0+)$/,'$1') +'</b>';
              daoshouprice =  list[i].mprice*1 - list[i].promotio*1;
            }else{
              quanmoney = '<b>'+list[i].promotio.replace(/(?:\.0*|(\.\d+?)0+)$/,'$1') +'</b>折';
              daoshouprice = list[i].mprice*1 - list[i].mprice*1 *(list[i].promotio*1)/100;
            }

            var daoshoupricearr =   daoshouprice.toFixed(2).split('.');
            if(list[i].shoptype == 1){
              html.push('<li class="quan_li fn-clear">');
              html.push('<div class="quan_info">');
              html.push('<p>领券立减</p>');

              html.push('<h2>'+echoCurrency("symbol")+quanmoney+'</h2>');
              if(list[i].is_lingqu == 1){
               html.push('<a class="btn_use" href="'+list[i].url+'" data-id="'+list[i].id+'">去使用</a>');
              }else{
                html.push('<button type="button" class="btn_buy" data-id="'+list[i].id+'">领券购买</button>');
              }

              html.push('</div><a class="pro_info" href="'+list[i].url+'">');
              html.push('<div class="pro_img"><img src="'+list[i].logo+'" onerror="this.src=\'/static/images/404.jpg\'"></div>');
              html.push('<div class="pro_detail">');
              html.push('<h2>'+list[i].storename+'</h2>');
              html.push('<div class="price">');
              html.push('<p><s>'+echoCurrency("symbol")+list[i].mprice+'</s></p>');


              html.push('<h4><span>'+echoCurrency("symbol")+'<b>'+daoshoupricearr[0]+'</b><i>.'+daoshoupricearr[1]+'</i></span> <em>到手价</em></h4>');
              html.push('</div> </div> </a> </li>');
            }else{
              var shoppro = list[i].shoppro;
              html.push('<li class="quan_li squan_li fn-clear">');
              html.push('<div class="quan_info">');
              html.push('<p>满'+parseFloat(list[i].basic_price)+'</p>');
              html.push('<h2>'+(list[i].promotiotype != 0 ? "" : "减")+quanmoney+'</h2>');
              if(list[i].is_lingqu == 1){
               html.push('<a class="btn_use" href="'+list[i].url+'" data-id="'+list[i].id+'">去使用</a>');
              }else{
                html.push('<button type="button" class="btn_buy" data-id="'+list[i].id+'">领券购买</button>');
              }

              html.push('</div><div class="shop_info">');
              html.push('<a href="'+list[i].url+'" class="shop_detail">');
              html.push('<div class="shop_logo"><img src="'+list[i].logo+'" onerror="this.src=\'/static/images/404.jpg\'"></div>');
              html.push('<div class="shop_name">'+list[i].storename+'</div></a>');
              html.push('<div class="prolist fn-clear">');
              // 下面这个3是根据店铺的产品 最大不超过3
              var len = list[i].shoppro.length;
              len = len > 3 ? 3 : len;
              for(var m=0; m<len; m++){
                html.push('<div class="spro">');
                html.push('<div class="spro_img"><img src="'+shoppro[m].litpic+'" onerror="this.src=\'/static/images/404.jpg\'"></div>');
                html.push('<div class="spro_price">'+echoCurrency("symbol")+shoppro[m].price+'</div>');
                html.push('</div>');
              }
             html.push('</div> </div> </li>');
            }
          }
          $(".scroll_ul").eq(index).append(html.join(''));
          page++;
          $('.scrollBox .tabbox li.curr').attr('data-page',page);
          $('.scrollBox .tabbox li.curr').attr('data-load','0');
          $(".scroll_ul").eq(index).append('<div class="loading">下拉加载更多~</div>');
          if(page > data.info.pageInfo.totalPage){
            $('.scrollBox .tabbox li.curr').attr('data-load','1');
              $(".scroll_ul").eq(index).find('.loading').html('没有更多了~')
          }
        }else{
          $(".scroll_ul").eq(index).append('<div class="loading">'+data.info+'</div>')
        }
			},
			error: function(){}
		});


}

  $('.scroll_ul').delegate('.btn_buy','click',function(){
    var userid = $.cookie("HN_login_user");
    if(userid == null || userid == ""){
      window.location.href = masterDomain+'/login.html';
      return false;
    }
    if($(this).hasClass('noChose')){
      showMsg('您的此券领取数量已达上限');
      return false;
    }

    var qid = $(this).attr('data-id');
    $.ajax({
      url: "/include/ajax.php?service=shop&action=getQuan&qid="+qid,
      type:'POST',
      dataType: "json",
      success:function (data) {
        if(data.state ==100){

          $(this).text('已领取');
          $(this).addClass('noChose');
          showErrAlert(data.info)

        }else{
          showErrAlert(data.info)
        }
      },
      error:function () {

      }
    });

  })

  $(".toget").click(function () {

    var qid = $(this).attr('data-id');
    $.ajax({
      url: "/include/ajax.php?service=shop&action=getQuan&qid="+qid,
      type:'POST',
      dataType: "json",
      success:function (data) {
        if(data.state ==100){

          $(this).text('已领取');
          $(this).addClass('noChose');
          showErrAlert(data.info)

        }else{
          showErrAlert(data.info)
        }
      },
      error:function () {

      }
    });

    return false;
  })




})
