$(function(){

  toggleDragRefresh('off');

  // 清除cookie
  var activeIndex = 0;
  // tab切换
  var tabsSwiper = new Swiper('#tabs-container',{
    speed:500,
    autoHeight: true,
    onSlideChangeStart: function(){
      activeIndex = tabsSwiper.activeIndex;
      $(".tabs a").eq(activeIndex).addClass('active').siblings().removeClass('active');
      if(activeIndex == 0){
        $('.topMap').removeClass('fn-hide');
        $('.banner').addClass('fn-hide');
      }else{
        $('.topMap').addClass('fn-hide');
        $('.banner').removeClass('fn-hide');
      }
    },
    onSlideChange: function(){
        activeIndex = tabsSwiper.activeIndex;
    },
    on:{
        slideChange: function(){
            $(".tabs .active").removeClass('active');
            $(".tabs a:eq("+this.activeIndex+")").addClass('active');
        },
    }
  })

  $(".tabs a").on('touchstart mousedown',function(e){
    e.preventDefault();
    $(".tabs .active").removeClass('active')
    $(this).addClass('active')
    tabsSwiper.slideTo( $(this).index() )
  })
  $(".tabs a").click(function(e){
    e.preventDefault()
  })

  getList()
  function getList(){
    $.ajax({
      url: '/include/ajax.php?service=waimai&action=paotuiLastOrder',
      type: 'POST',
      dataType: 'json',
      success: function(data){
        if(data.state == 100){
         var list = data.info;
         var html = [];
         if(list.length > 0){
          $(".lasteListBox").removeClass('fn-hide')
         }
         for(var i = 0; i< list.length; i++){
          var str = list[i].type == 2 ? '帮我取件' :'帮我买'+ list[i].shop
          html.push('<li class="swiper-slide"> <span class="headIcon"><img src="'+list[i].photo+'" onerror="this.src=\'/static/images/noPhoto_60.jpg\'"/></span> <span class="oTime">'+list[i].pubdate+'</span> <span>'+list[i].name + str +'<em>下单成功</em></span> </li>')
         }
         $(".lasteList ul").html(html.join(''));
         if(list.length >= 4){
          var mySwiper = new Swiper('.lasteListBox .swiper-container',{
            direction : 'vertical',
            speed:2000, 
            autoplay: {
                delay:0,
                stopOnLastSlide: false,
                disableOnInteraction: true,
                waitForTransition:true,
                disableOnInteraction:false,
            },
            freeMode:true,
            slidesPerGroup : 1,
            slidesPerView: 4,
            spaceBetween: 0,
            loop : true,
          })
         }
      }
    },
    error: function(data){},
  })
}

  
  // 帮我买 自定义商品
  $(".buy .submit").click(function(){
    $(this).parent().submit();
  })
  //选择收货取货地址
  $('.song .shoptype li').click(function(){
    var turl = $(this).find('a').attr('data-url1');
    var quLng = $('.gz-addr-seladdr').attr('data-lng'),quLat = $('.gz-addr-seladdr').attr('data-lat');
    let addr=$('.gz-addr-seladdr #addr').val();
    let address=$('.gz-addr-seladdr #address').val();
    var quAdrs = `${addr} ${address}`;
    let people=$('.gz-addr-seladdr #people').val();
    let mobile=$('.gz-addr-seladdr #mobile').val();
    var quAdrr = {'quLng': quLng, 'quLat': quLat,'quAdrs':quAdrs,'addr':addr,'address':address,'people':people,'mobile':mobile}
    if($(this).index() == 0){
      utils.setStorage('indexquAdress',JSON.stringify(quAdrr));
    }else{
      var quDet = $('.shoptype .qhInfo').html();
      var shouAdrr = {'quLng': quLng, 'quLat': quLat,'quAdrs':quAdrs,'quDet':quDet}
      utils.setStorage('indexshouAdress',JSON.stringify(shouAdrr));
    }

	//if(!wx_miniprogram && !baidu_miniprogram && !qq_miniprogram){
	    window.location.href = turl;
	//}
  })

  $('.header .goBack').click(function(){
    window.location.href = channelDomain;
  })


})
  var quAdrrData = utils.getStorage('indexquAdress');
  // 定位
  var localData = utils.getStorage('waimai_local');
  var localData = '';
  if(localData){
    lat = localData.lat;
    lng = localData.lng;
    address = localData.address;
    //定位点
    stLng = lng;
    stLat = lat;
    stAdress = name;
    if(!qaddress){//取货地址未选择
      if(quAdrrData){//已拖动定位过的情况
        lng = quAdrrData.quLng;
        lat = quAdrrData.quLat;
        address = quAdrrData.quAdrs;
        utils.removeStorage('indexquAdress');
      }
      $('.gz-addr-seladdr').attr('data-lng',lng);
      $('.gz-addr-seladdr').attr('data-lat',lat);
      $('.gz-addr-seladdr').find("input#addr").val(address);
      // 取货默认地址
      $('.shoptype .qhAddress').html(address);
      $('.shoptype .qhInfo').html('填写联系人');
      //中心点坐标
      oldPointLng = lng;
      oldPointLat = lat;
      oldAdress = address;

    }else{//取货地址已选
      oldPointLng = qmylng;
      oldPointLat = qmylat;
      utils.removeStorage('indexquAdress');
    }
    if(oldPointLng && oldPointLat){
      $('.topmap_bg').fadeOut();
      init.createMap();
      setInterval(function(){init.createMap();},5000);
    }

  }else{
    HN_Location.init(function(data){
    
        if (data == undefined || (data.address == "" && data.name == "") || data.lat == "" || data.lng == "") {
            $(".qsNum").text('定位失败，请刷新页面');
        }else{
          var name = data.name ==''?data.address:data.name;
          lng = data.lng;
          lat = data.lat;
          city = data.city;
          //定位点
          stLng = lng;
          stLat = lat;
          stAdress = name;
          if(!qaddress){
            if(quAdrrData){//已拖动定位过的情况
              lng = quAdrrData.quLng;
              lat = quAdrrData.quLat;
              address = quAdrrData.quAdrs;
              utils.removeStorage('indexquAdress');
            }
            $('.gz-addr-seladdr').find("input#addr").val(name);
            $('.gz-addr-seladdr').attr('data-lng',lng);
            $('.gz-addr-seladdr').attr('data-lat',lat);
            $('.choseWrap').attr('data-address',name);
            // 取货默认地址
            $('.shoptype .qhAddress').html(name);
            $('.shoptype .qhInfo').html('填写联系人');
            //定位点坐标
            oldPointLng = lng;
            oldPointLat = lat;
            oldAdress = name;

          }else{
            oldPointLng = qmylng;
            oldPointLat = qmylat;
            utils.removeStorage('indexquAdress');
          }

		  if(oldPointLng && oldPointLat){//绘制初始地图
            $('.topmap_bg').fadeOut();
            init.createMap();
            setInterval(function(){init.createMap();},5000);
          }

        }
    })
  }
