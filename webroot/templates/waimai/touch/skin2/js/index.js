
new Vue({
  el:'#page',
  data:{
    jxList:[], //精选列表
    spList:[], //店铺列表
    lng:0, //坐标
    lat:0,
    address:'定位中...',
    islocal:false,
    page:1,
    isload:false,
    loadText:'加载中',
    quanList:[],
    showPop:false,
    searchpage:false,
    keywords:'',
    waimaiHistory:[], //历史搜索
    placeholderText:'',
    cityid:JSON.parse(siteCityInfo_chose)['cityid'],
    cityname:JSON.parse(siteCityInfo_chose)['name'],
    orderby:'',
  },
  mounted(){
    var tt = this;
    // banner轮播图
   var swper2 = new Swiper('.banner .swiper-container', {
     pagination: {
       el: '.banner .pagination'
     },
     autoplay: {
       delay: 4000,
       disableOnInteraction: false,
     },

     direction: 'horizontal',
     loop: true,
     slidesPerView: 1.2,
     centeredSlides: true,
     loopedSlides: 3,
   });
   if($('.banner .swiper-slide').length == 0){
    $('.banner').hide()
   }
   if($('.preferential_box .tap_box li').length == 0){
    $('.preferential_box').hide()
   }
   if($('.toQuan .siteAdvObj').length == 0){
    $('.toQuan').hide()
   }
   // 搜索框
   var swper3 = new Swiper('.swiper-container.hotSearch', {

     autoplay: {
       delay: 2000,
       disableOnInteraction: false,
     },

     direction: 'vertical',
     loop: true,

   });

   // 判断优惠推荐有没有
    if($(".recbox li").length == 0){
      $(".recbox").remove();
    }

   //加载历史记录
   var history = utils.getStorage('wm_history_search');
   if(history){
     tt.waimaiHistory = history.reverse();
   }

    // 滑动导航
	  var swiperNav = [], mainNavLi = $('.nav li');
	  if(mainNavLi.length>=10){
	  	$('.nav').css('height','3.4rem')
	  	for (var i = 0; i < mainNavLi.length; i++) {
		    swiperNav.push('<li>'+$('.nav li:eq('+i+')').html()+'</li>');
		  }

		  var liArr = [];
		  for(var i = 0; i < swiperNav.length; i++){
		    liArr.push(swiperNav.slice(i, i + 10).join(""));
		    i += 9;
		  }

		  $('.nav .swiper-wrapper').html('<div class="swiper-slide"><ul class="fn-clear">'+liArr.join('</ul></div><div class="swiper-slide"><ul class="fn-clear">')+'</ul></div>');

		  var mySwiperNav = new Swiper('.nav',{pagination: {
	        el: '.nav-pagination',
	      },});
	  }

    // 获取坐标
    tt.getLnglat();

    // 滚动加载
    var searchTop = 0;
    if($(".searchBox").length){
      searchTop = $(".searchBox").offset().top
    }
    $(window).scroll(function(){
      // 搜索置顶
      if($(window).scrollTop() >= searchTop){
        $(".headBox").addClass('black');
        $(".searchBox").addClass('fixedHead');
      }else{
        $(".headBox").removeClass('black');
        $(".searchBox").removeClass('fixedHead');
      }

      // 筛选置顶
      if($(".noFixed").size() > 0){
        var noFixed_top = $(".noFixed").offset().top;
        var scrollTop = $(window).scrollTop();
        // if(!$(".px_mask").hasClass('show')){}
        if(scrollTop + $(".headBox ").height() >= noFixed_top){
          if(!$(".order_box.fixedTop").hasClass('show')){
            $(".order_box.fixedTop").addClass('show').html($(".noFixed").html())
          }

        }else{
          if($(".order_box.fixedTop").hasClass('show')){
            $(".order_box.fixedTop").removeClass('show');
            $(".noFixed").html($(".dt_box.fixedTop").html());
            $(".px_mask,.px_box").removeClass('show');
          }
        }
      }



      // 滚动加载
  		var allh = $('body').height();
  		var w = $(window).height();
  		var scroll = allh - w - 200;
      let param = ''
  		if ($(window).scrollTop() >= scroll && !tt.isload && tt.lng != 0 && tt.lat != 0) {
        if(tt.orderby){
          param = '&orderby=' + tt.orderby
        }
  			tt.getshopList(param);
  		}
    });

    // 排序
    $('body').delegate(".px_box li,.left_tab li",'click',function(){
      var t = $(this);
      if(!t.hasClass('composite')){
        var orderby = t.attr('data-id');
        tt.page = 1;
        tt.isload = false;
        var param = '&orderby='+orderby;
        tt.orderby = orderby
        tt.getshopList(param);
        if(t.closest('ul').hasClass('left_tab')){
          t.addClass('li_click').siblings('li').removeClass('li_click');
        }
        if(t.closest('.px_box').length){
          $(".px_mask").click();
          $(".composite.px_li a").text(t.find('a').text())
        }else{
          $(".composite.px_li a").text('综合排序')
        }
      }else{

        var listTop = $(".shopList").offset().top;
        var scrollTop = $(window).scrollTop();
        if(scrollTop >= listTop){
          $(".px_box,.px_mask").addClass('show');
        }else{
          $(window).scrollTop(listTop);
          setTimeout(function(){
            $(".px_box,.px_mask").addClass('show');
          },200)
        }
      }
    });

    $(".px_mask").click(function(){
      $(".px_box,.px_mask").removeClass('show');
    })
    // var quanPop = sessionStorage.getItem("quanPop");
    // if(!quanPop){
     
    // }
   
    setTimeout(function(){
      tt.getQUanList()
    },500)


  },
  computed:{
    delivery(){ //配送费计算
      return function(delivery_fee){
        var text = delivery_fee == 0 ? "免配送费" : (langData['waimai'][2][7]+"<em>"+echoCurrency('symbol')+delivery_fee+"</em>");
        return text;
      }
    },

    // 首单优惠
    countHtml(){
      return function(first,type){
        if(type == '1'){
          var html = '<i>'+langData['waimai'][7][137]+'</i>'+langData['waimai'][2][8].replace('1', first);
        }else{
          var html = '<i>'+langData['waimai'][7][138]+'</i>'+langData['waimai'][2][120].replace('1', first)
        }
        return html;
      }
    },
  },
  methods:{
    // 获取精选列表
    getJXlist(lat,lng){
      var tt = this;
      $.ajax({
		    url: '/include/ajax.php?service=waimai&action=shopList&recBrand=1',
		    data: {
		        lng: lng,
		        lat: lat,
				    orderby: 1,
		        page: 1,
		        pageSize: 6
		    },
		    type: 'get',
		    dataType: 'json',
		    success: function(data){
          if(data.state == 100){
            tt.jxList = data.info.list;
          }
        },
		    error: function(data){},
      })
    },

    // 获取坐标
    getLnglat(){
      var tt = this;
      var localData = utils.getStorage('waimai_local');
    	if(localData != null && localData.address && localData.lng && localData.lat){
    		var last = localData.time;
    	}else{
    		var last = 0;
    	}
    	var time = Date.parse(new Date())/1000;
      if((time - last < 10)){
        tt.islocal = true;
        // $('.posiChose span').html(localData.address);
        tt.lat = localData.lat;
        tt.lng = localData.lng;
        tt.address = localData.address;
        tt.cityid = localData.cityid;
        tt.cityname = localData.cityname;

        tt.getshopList();
        tt.getJXlist(tt.lat,tt.lng);
        // tt.checkCity(localData)  //新版本会自动定位当前城市，这里不需要有这个提示层了
        utils.setStorage('waimai_local', JSON.stringify({'time': time, 'lng': tt.lng, 'lat': tt.lat, 'address': localData.address, 'cityid': localData.cityid, 'cityname': localData.cityname,site_map:site_map}));
      }else{
        HN_Location.init(function(data){
        if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
            tt.address = langData['siteConfig'][27][136];
          // $('.posiChose span').html(langData['siteConfig'][27][136]);    /* 定位失败 */
          $('.loading').html(langData['siteConfig'][27][137]).show();    /* 定位失败，请重新刷新页面！ */
        }else{
          if(!tt.islocal){
              tt.lng = data.lng;
              tt.lat = data.lat;
              tt.address = data.name;

            tt.page = 1;
            tt.getJXlist(tt.lat,tt.lng);
            tt.getshopList();
          
            utils.setStorage('waimai_local', JSON.stringify({'time': time, 'lng': tt.lng, 'lat': tt.lat, 'address':data.name,'cityname':tt.cityname ,'cityid':tt.cityid,site_map:site_map}));
          }



        }
        }, device.indexOf('huoniao') > -1 ? false : true);
      }



    },

    // 精选切换
    changeShow(ind){
      var tt = this;
      var el = event.currentTarget;
      $(el).addClass('active').siblings('li').removeClass('active');
      $('.tab_con li').eq(ind).addClass('show').siblings('li').removeClass('show');
      var left = $(el).offset().left,
	      	w = $(el).width(),
	      	l = parseFloat($('.tab_con').css('padding-left'));
	    $('.tab_con li').eq(ind).css('transform-orgin',"bottom "+(left+.5*w-l))
    	l2 = $('.tab_con li').eq(ind).find('em.zhe').width();
    	$('.tab_con li').eq(ind).find('.jiao').css('left',(left+.5*w-l));
    	$('.tab_con li').eq(ind).find('em.zhe').css('left',(left+.5*w-.5*l2-l));
    },

    // 验证城市
    checkCity(data){
      var tt = this;
      //判断当前城市
      HN_Location.lnglatGetTown(data,function(){
        var siteCityInfo = $.cookie("HN_siteCityInfo");
        var province = data.province, city = data.city, district = data.district, town = data.town;
        $.ajax({
            url: "/include/ajax.php?service=siteConfig&action=verifyCity&region="+province+"&city="+city+"&district="+district+"&module=waimai"+"&town="+town,
            type: "POST",
            dataType: "json",
            success: function(data){
              if(data && data.state == 100){
                var siteCityInfo_ = JSON.parse(siteCityInfo);
                var nowCityInfo = data.info;
                if(!siteCityInfo_ || siteCityInfo_.cityid != nowCityInfo.cityid){
                  // $.cookie("HN_changAutoCity", '1', {expires: 1, path: '/'});

                  if(device.toLowerCase().indexOf('huoniao') > -1 &&  device.toLowerCase().indexOf('android') > -1){
                    setupWebViewJavascriptBridge(function(bridge) {
                        bridge.callHandler('changeCity', JSON.stringify(nowCityInfo), function(){
                        location.href = nowCityInfo.url + '?currentPageOpen=1' + (device.indexOf('huoniao') > -1 ? '&appIndex=1&appFullScreen' : '');
                      });
                    });
                  }else{
                    var channelDomainClean = typeof masterDomain != 'undefined' ? masterDomain.replace("http://", "").replace("https://", "") : window.location.host;
                    var channelDomain_1 = channelDomainClean.split('.');
                    var channelDomain_1_ = channelDomainClean.replace(channelDomain_1[0]+".", "");

                    channelDomain_ = channelDomainClean.split("/")[0];
                    channelDomain_1_ = channelDomain_1_.split("/")[0];

                    $.cookie(cookiePre + 'siteCityInfo', JSON.stringify(nowCityInfo), {expires: 7, domain: channelDomainClean, path: '/'});
                    $.cookie(cookiePre + 'siteCityInfo', JSON.stringify(nowCityInfo), {expires: 7, domain: channelDomain_1_, path: '/'});

                    location.href = nowCityInfo.url + '?currentPageOpen=1' + (device.indexOf('huoniao') > -1 ? '&appIndex=1&appFullScreen' : '');
                 }

                }
              }
            }
        })
      })
    },

    // 获取商家
    getshopList(param){
      var tt = this;
      if(tt.isload) return false;
      tt.isload = true;
      tt.loadText = '加载中~';
      if(!param){
        param = '&orderby=0'
      }
      $.ajax({
        url: '/include/ajax.php?service=waimai&action=shopList'+param,
        data: {
            lng: tt.lng,
            lat: tt.lat,
    				// orderby: orderby,
    				// yingye:1,
            page: tt.page,
            pageSize: 10
        },
        type: 'get',
        dataType: 'json',
        success: function(data){
          if(data.state == 100 ){
            tt.loadText = '下拉加载更多'
            if(tt.page == 1){
              tt.spList = data.info.list
            }else{

              tt.spList = tt.spList.concat(data.info.list);
            }
            tt.page++;
            tt.isload = false;
            if(tt.page > data.info.pageInfo.totalPage){
              tt.isload = true;
              tt.loadText = '没有更多了';
            }
          }else{
            tt.loadText = data.info;
          }
        },
        error:function(){},
      })
    },

    openbox(){
      $(".header-search .dropnav").click()
    },

    // 获取优惠券
    getQUanList(){
      var tt = this;
    	$.ajax({
    		url: "/include/ajax.php?service=waimai&action=receiveQuanList&recommend=1&pageSize=3&getype=2",
    		type:'GET',
    		dataType:'json',
    		success:function (data) {
    			if(data.state == 100) {
    				var list = data.info.list;
            tt.quanList = data.info.list;
    			}
    		},
    		error:function () {

    		}
    	})
    },

    // 领券
    getQuan(quan){
      var tt = this;
      var userid = $.cookie(cookiePre+"login_user");
      if(userid == null || userid == ""){
    			window.location.href = masterDomain+'/login.html';
    			return false;
    		}
    		$.ajax({
    			url: "/include/ajax.php?service=waimai&action=getWaimaiQuan&qid="+quan.id,
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
    },

    // 清空关键
    clearKeywords(){
       var tt = this;
       tt.keywords = '';
     },

     // 清除历史记录
    del_history(){
      var tt = this;
      tt.waimaiHistory = [];
      utils.setStorage('wm_history_search', JSON.stringify(tt.waimaiHistory));
      showErrAlert('清除成功'); //'清除成功'
    },

    // 隐藏弹窗
    hidePop(){
      var tt = this;
      tt.showPop = false;
    },
  },
  watch:{
    quanList(quan){
      var tt = this;
      var count = 0;
      quan.forEach(function(val){
        if(val.is_lingqu == 1){
          count++;
        }
      });
      if(quan.length > count){
        tt.showPop = true;
        // sessionStorage.setItem("quanPop", 1);
      }
    },

    searchpage(val){
      if(!val){
        $(".index_bg").show();
      }else{
          $(".index_bg").hide();
      }
    }
  }
})
