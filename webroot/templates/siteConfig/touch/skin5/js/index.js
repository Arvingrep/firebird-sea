$(function(){
	var miniprogram = false;
	if(window.__wxjs_environment == 'miniprogram'){
		miniprogram = true;
	}else{
		if(navigator.userAgent.toLowerCase().match(/micromessenger/)) {
			if(typeof(wx) != 'undefined'){
				wx.miniProgram.getEnv(function (res) {
					miniprogram = res.miniprogram;
				});
			}
		}
	}
	var tcInfoList = [];
	if(miniprogram){
		$(".swipre00 li.wx-hide").remove();
	}
	// 滑动导航
	var tswiper = $('.swipre00 .swiper-wrapper');
	var swiperNav = [], mainNavLi = tswiper.find('li');
	for (var i = 0; i < mainNavLi.length; i++) {
		swiperNav.push('<li class="ceshi">'+tswiper.find('li:eq('+i+')').html()+'</li>');
	}

	var liArr = [];
	for(var i = 0; i < swiperNav.length; i++){
		liArr.push(swiperNav.slice(i, i + 10).join(""));
		i += 9;
	}

	tswiper.html('<div class="swiper-slide"><ul class="fn-clear">'+liArr.join('</ul></div><div class="swiper-slide"><ul class="fn-clear">')+'</ul></div>');
	$(".tabMain").removeClass("noslide");
	new Swiper('.swipre00', {pagination: '.pag00', loop: false, grabCursor: true, paginationClickable: true});

    var isBytemini = device.toLowerCase().includes("toutiaomicroapp");


    //模块链接跳原生

    $('.tcInfo').delegate('a', 'click', function(e){
        var t = $(this), name = t.attr('data-name'), code = t.attr('data-code'), href = t.attr('data-url') ? t.attr('data-url') : t.attr('href');
        if(!t.hasClass('toMini')){
           if(href != 'javascript:;' && device.indexOf('huoniao') > -1){
                e.preventDefault();
                setupWebViewJavascriptBridge(function(bridge) {
                    bridge.callHandler('redirectNative', {'name': name, 'code': code, 'link': href}, function(){});
                });
            }else{
                //抖音小程序 团购
                if(isBytemini){
                    switch (code){
                        case 'tuan':{
                            tt.miniProgram.navigateTo({ url: '/pages/packages/tuan/index/index' });
                            break;
                        }
                        case 'info':{
                            tt.miniProgram.navigateTo({ url: '/pages/packages/info/index/index' });
                            break;
                        }
                        case 'job':{
                            tt.miniProgram.navigateTo({ url: '/pages/packages/job/index/index' });
                            break;
                        }
                        default:{
                            tt.miniProgram.navigateTo({ url: '/pages/redirect/index?url=' + encodeURIComponent(url.replace('?', 'huoniaowh').replace(/\&/g, 'huoniaolj').replace(/\=/g, 'huoniaodh')) });
                        }
                    }
                    return false;
                }
            } 
        }
        
    });

    $('.tcInfo a').each(function(){
        var t = $(this);
        t.attr('href',t.attr('data-url'))
    })

    //同城头条动态数据
    if($('.tcNews').size() > 0){
        $.ajax({
            type: "POST",
            url: "/include/ajax.php",
            dataType: "json",
            data: 'service=article&action=alist&flag=h&pageSize=10',
            success: function(data) {

                if(data.state == 100){
                    var tcNewsHtml = [], list = data.info.list;
                    tcNewsHtml.push('<div class="swiper-slide">');
                    for (var i = 0; i < list.length; i++){
                        tcNewsHtml.push(`<p><a href="${list[i].url}" data-id="${list[i].id}" data-temp="detail" data-module="article" class="toMini"><span>${list[i].typeName[(list[i].typeName.length)-1]}</span>${list[i].title}</a></p>`);
                        if((i + 1) % 2 == 0 && i + 1 < list.length){
                        tcNewsHtml.push('</div>');
                        tcNewsHtml.push('<div class="swiper-slide swiper-no-swiping">');
                        }

                    }
                    tcNewsHtml.push('</div>');
                    $('.tcNews .swiper-wrapper').html(tcNewsHtml.join(''));
                    new Swiper('.tcNews .swiper-container', {pagination: '.tcNews .pagination',direction: 'vertical',paginationClickable: true, loop: true, autoplay: 2000, autoplayDisableOnInteraction : false});

                }else{
                    $('.tcNews').hide();
                }
            },
            error: function(){
                $('.tcNews').hide();
            }
        });
    }





	 //广告位滚动
    new Swiper('.banner .swiper-container', {pagination: '.banner .pagination',paginationClickable: true, loop: true, autoplay: 2000, autoplayDisableOnInteraction : false});



    $.fn.numberRock=function(options){
      var defaults={
        speed:24,
        count:100
      };
      var opts=$.extend({}, defaults, options);
      var div_by = 100,count = opts["count"],speed = Math.floor(count / div_by),sum=0, $display = this,run_count = 1,int_speed = opts["speed"];
      var int = setInterval(function () {
        if (run_count <= div_by&&speed!=0) {
          $display.text(sum=speed * run_count);
          run_count++;
        } else if (sum < count) {
          $display.text(++sum);
        } else {
          clearInterval(int);
        }
      }, int_speed);
    }
    //数字滚动
    $.ajax({
        type: "GET",
        url: "/include/ajax.php?service=siteConfig&action=getStatistics",
        dataType: "jsonp",
        success: function (data) {
            if(data.state == 100){
                $("#datanums1").html(data.info.business);
                $("#datanums2").html(data.info.info);
                $("#datanums3").html(data.info.tieba);
                //数字滚动
                $(".row-all").on('inview', function(event, isInview) {
                    if(isInview){
                        $("#datanums1").numberRock({speed:10,count:$("#datanums1").text()  })
                        $("#datanums2").numberRock({speed:10,count:$("#datanums2").text() })
                        $("#datanums3").numberRock({speed:10,count:$("#datanums3").text() })
                    }
                })
            }
        },
        error:function(){

        }
    });
    var loadMoreLock=false,datingLoad=false,liveLoad=false,huodongLoad=false,bussinessLoad=false,tiebaLoad=false,houseload=false,jobLoad=false,infoLoad=false,shopload=false,tuanload =false,wmload =false,carload=false,travelload=false,sfcarload=false;
    $(window).scroll(function () {

            var t=$(window).scrollTop();
            var h=$(window).height();
            var th =t + h;

            //热门话题
            if($('.hot-talk').size()>0){
                var a1 = $(".hot-talk").offset().top -100;
                var p1 = $(".hot-talk").height();
                var tp1=a1 + p1;
                if (tp1 > t && a1 < th && !loadMoreLock) {
                    console.log('热门话题开始')
                    htList();
                }
            }

            //互动交友
            if($('.jiaoyou-online').size()>0){
                var a2 = $(".jiaoyou-online").offset().top - 100;
                var p2 = $(".jiaoyou-online").height();
                var tp2=a2 + p2;
                if (tp2 > t && a2 < th && !datingLoad) {
                    console.log('互动交友开始')
                    tjMember();
                    tjHn();
                }
            }

            //视频直播
            if($('.live_wrap').size()>0){
                var a3 = $(".live_wrap").offset().top - 100;
                var p3 = $(".live_wrap").height();
                var tp3=a3 + p3;
                if (tp3 > t && a3 < th && !liveLoad) {
                    console.log('视频直播开始')
                    liveNum();
                }
            }

            //同城活动
            if($('.tc-activity-box').size()>0){
                var a3 = $(".tc-activity-box").offset().top - 100;
                var p3 = $(".tc-activity-box").height();
                var tp3=a3 + p3;
                if (tp3 > t && a3 < th && !huodongLoad) {
                    console.log('同城活动开始')
                    huodong();
                }
            }

            //推荐商家
            if($('.Business-box').size()>0){
                var a3 = $(".Business-box").offset().top - 100;
                var p3 = $(".Business-box").height();
                var tp3=a3 + p3;
                if (tp3 > t && a3 < th && !bussinessLoad) {
                    console.log('推荐商家开始')
                    bussiness();
                    getList();
                }
            }
            //贴吧社区
            if($('.tieba_wrap').size()>0){
                var a3 = $(".tieba_wrap").offset().top - 100;
                var p3 = $(".tieba_wrap").height();
                var tp3=a3 + p3;
                if (tp3 > t && a3 < th && !tiebaLoad) {
                    console.log('贴吧社区开始')
                    tieba();
                }
            }
            //职业招聘s
            if($('.job-box').size()>0){
                var a3 = $(".job-box").offset().top - 100;
                var p3 = $(".job-box").height();
                var tp3=a3 + p3;
                if (tp3 > t && a3 < th && !jobLoad) {
                    console.log('职业招聘s开始')
                    zhiweiList();
                }
            }
            //出租房源s
            if($('.house-resource').size()>0){
                var a3 = $(".house-resource").offset().top - 100;
                var p3 = $(".house-resource").height();
                var tp3=a3 + p3;
                if (tp3 > t && a3 < th && !houseload) {
                    console.log('出租房源开始')
                    houseList();
                }
            }
            //出租房源s
            if($('.classify-info').size()>0){
                var a3 = $(".classify-info").offset().top - 100;
                var p3 = $(".classify-info").height();
                var tp3=a3 + p3;
                if (tp3 > t && a3 < th && !infoLoad) {
                    console.log('分类信息开始')
                    infoList();
                }
            }

            //商城商品s
            if($('.goodBox').size()>0){
                var a3 = $(".goodBox").offset().top - 100;
                var p3 = $(".goodBox").height();
                var tp3=a3 + p3;
                if (tp3 > t && a3 < th && !shopload) {
                    console.log('商城商品开始')
                    shopList();
                }
            }

            //团购s
            if($('.tuanBox').size()>0){
                var a3 = $(".tuanBox").offset().top - 100;
                var p3 = $(".tuanBox").height();
                var tp3=a3 + p3;
                if (tp3 > t && a3 < th && !tuanload) {
                    console.log('团购开始')
                    tuanList();
                }
            }
            //外卖s
            if($('.wmBox').size()>0){
                var a3 = $(".wmBox").offset().top - 100;
                var p3 = $(".wmBox").height();
                var tp3=a3 + p3;
                if (tp3 > t && a3 < th && !wmload) {
                    console.log('外卖开始')
                    wmList();
                }
            }

            //汽车s
            if($('.carBox').size()>0){
                var a3 = $(".carBox").offset().top - 100;
                var p3 = $(".carBox").height();
                var tp3=a3 + p3;
                if (tp3 > t && a3 < th && !carload) {
                    console.log('汽车s')
                    carList();
                }
            }

            //旅游s
            if($('.travelBox').size()>0){
                var a3 = $(".travelBox").offset().top - 100;
                var p3 = $(".travelBox").height();
                var tp3=a3 + p3;
                if (tp3 > t && a3 < th && !travelload) {
                    console.log('旅游s')
                    travelList();
                }
            }

            //顺风车s
            if($('.sfcarBox').size()>0){
                var a3 = $(".sfcarBox").offset().top - 100;
                var p3 = $(".sfcarBox").height();
                var tp3=a3 + p3;
                if (tp3 > t && a3 < th && !sfcarload) {
                    console.log('顺风车s')
                    sfcarList();
                }
            }


    });
    //热门话题
    function htList(){
        loadMoreLock = true;
        $.ajax({
            type: "GET",
            url: "/include/ajax.php?service=circle&action=ranking&mold=0&page=1&pageSize=30&flag=h&type=topic",
            dataType: "json",
            crossDomain: true,
            success: function (data) {
                if(data && data.state == 100){
                    $('.hot-con .loading').remove();
                    var html1 = [],html2 = [],html3 = [], list = data.info.list;
                    var sum1 = 0,sum2 = 0,sum3 = 0;
                    var len=list.length;
                    var ulen = Math.ceil(len/3);
                    var hlen = 2*ulen;
                    if(len%3 == 1){//当数据分三行有余数为1时  比如 7 10 13 等 需特殊处理
                        hlen = 2*ulen-1
                    }
                    var claHot = '',claTj ='',claCom ='',txt='';
                    var sumRec = 0
                    for(var k=0;k<len;k++){//求出所有数据的topic和
                        sumRec += Number(list[k].topic);
                    }
                    var lastUn = Math.round(sumRec/len);//topic的平均值，大于平均值的是热，小于平均值的是普通
                    for (var i = 0; i < len; i++){
                        if(list[i].rec == 1){
                            claTj = 'new_blue';
                            txt = '荐';
                            claHot = '',claCom ='';
                        }else{
                            if(list[i].topic >= lastUn){

                                claHot ='hot';
                                claTj ='',claCom ='';
                                txt = '热';
                            }else{
                                claCom = 'jin_grey';
                                txt = '#';
                                claHot = '',claTj ='';
                            }
                        }

                        if(len < 4){
                            html1.push('<li><a href="'+list[i].url+'"><span class="hot-tip '+claHot+claTj+claCom+'">'+txt+'</span><span class="hot-txt">'+list[i].title+'</span></a></li>')

                        }else if(len < 6){
                            if(i < 2){
                                html1.push('<li><a href="'+list[i].url+'"><span class="hot-tip '+claHot+claTj+claCom+'">'+txt+'</span><span class="hot-txt">'+list[i].title+'</span></a></li>')
                            }else{
                                html2.push('<li><a href="'+list[i].url+'"><span class="hot-tip '+claHot+claTj+claCom+'">'+txt+'</span><span class="hot-txt">'+list[i].title+'</span></a></li>')
                            }
                        }else {
                            if(i < ulen){
                                html1.push('<li><a href="'+list[i].url+'"><span class="hot-tip '+claHot+claTj+claCom+'">'+txt+'</span><span class="hot-txt">'+list[i].title+'</span></a></li>')
                            }else if(i < hlen){
                                html2.push('<li><a href="'+list[i].url+'"><span class="hot-tip '+claHot+claTj+claCom+'">'+txt+'</span><span class="hot-txt">'+list[i].title+'</span></a></li>')
                            }else{
                                html3.push('<li><a href="'+list[i].url+'"><span class="hot-tip '+claHot+claTj+claCom+'">'+txt+'</span><span class="hot-txt">'+list[i].title+'</span></a></li>')
                            }
                        }

                    }

                    $('.hot-con .fir_ul').html(html1.join(''));
                    $('.hot-con .sec_ul').html(html2.join(''));
                    $('.hot-con .th_ul').html(html3.join(''));

                    $('.hot-con .fir_ul li').each(function(){
                        sum1 += $(this).outerWidth(true);
                    })
                    $('.hot-con .sec_ul li').each(function(){
                        sum2 += $(this).outerWidth(true);
                    })
                    $('.hot-con .th_ul li').each(function(){
                        sum3 += $(this).outerWidth(true);
                    })
                    //取出最大值给 ul
                    var alWidth = Math.max(sum1,sum2,sum3);
                    $('.hot-con .fir_ul,.hot-con .sec_ul,.hot-con .th_ul').css('width',alWidth+10)
                }else{
                    $('.hot-con').html('<div class="loading">'+langData['siteConfig'][21][64]+'</div>');//暂无数据！
                }
            },
            error: function(){
                $('.hot-con').html('<div class="loading">'+langData['siteConfig'][20][462]+'</div>');//加载失败！
            }
        });
    }

    //推荐会员
    function tjMember(){
        datingLoad=true;
        $.ajax({
            type: "GET",
            url: "/include/ajax.php?service=dating&action=memberList&orderby=5&pageSize=4",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var newsList = [], list = data.info.list;
                    for (var i = 0; i < list.length; i++){
                        newsList.push('<li><img src="'+list[i].photo+'"></li>');
                    }
                    $('.head-icon').html(newsList.join(''));
                }
            },
            error: function(){

            }
        });
    }

    //专业红娘
    function tjHn(){
        datingLoad=true;
        $.ajax({
            type: "GET",
            url: "/include/ajax.php?service=dating&action=hnList&pageSize=1",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var newsList = [], list = data.info.list;
                    for (var i = 0; i < list.length; i++){
                        newsList.push('<div class="hn_img"><img src="'+list[i].photo+'" alt=""></div>');
                        newsList.push('<p class="hn_txt">'+list[i].advice+'</p>');
                    }
                    $('.hn-info').html(newsList.join(''));
                }
            },
            error: function(){

            }
        });
    }

    //获取正在直播人数
    function liveNum(){
        liveLoad=true;
       $.ajax({
            type: "GET",
            url: "/include/ajax.php?service=live&action=alive&orderby=click&state=1",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var totalCount = data.info.pageInfo.totalCount;
                    $('.live_wrap span').html(langData['siteConfig'][53][12].replace('1',totalCount));//1人正在直播
                }else{
                    $('.live_wrap span').html(langData['siteConfig'][53][12].replace('1','0'));//1人正在直播
                }
            },
            error: function(){
                $('.live_wrap span').html(langData['siteConfig'][53][12].replace('1','0'));//1人正在直播
            }
        });
    }

    //同城活动
    function huodong(){
        huodongLoad=true;
        $.ajax({
            url: '/include/ajax.php',
            type: 'get',
            dataType: 'json',
            data:'service=huodong&action=hlist&page=1&pageSize=4&keywords=&typeid=0',

            success: function(data){
                if(data && data.state == 100){
                   var newsList = [], list = data.info.list;
                   for(var i=0; i<list.length; i++){
                        newsList.push('<div class="activity swiper-slide">');
                        newsList.push('<a href="'+list[i].url+'">');
                        newsList.push('<div class="act-img" >');
                        newsList.push('<img src="'+list[i].litpic+'"/>')
                        newsList.push('</div>');
                        newsList.push('<div class="act-info">');
                                newsList.push('<p class="act-name">'+list[i].title+'</p>');
                               newsList.push('<p class="act-time">'+huoniao.transTimes(list[i].began,2)+langData['siteConfig'][53][19]+'</p>');//开始
                        newsList.push('</div>');
                        newsList.push('</a>');
                        newsList.push('</div>');

                   }
                   //newsList.push('<div class="activity-kong swiper-slide"></div>');
                   $('.tc-activity').html(newsList.join(''));
                   //同城活动滚动
                    var swiper = new Swiper('.tc-activity-box .swiper-container', {

                        slidesPerView: 2,
                        spaceBetween:0,
                        pagination: {
                            el: '.swiper-pagination',
                            clickable: true,
                        },
                    });
                }else{
                   $('.tc-activity').html('<div class="loading">'+langData['siteConfig'][21][64]+'</div>');//暂无数据！

                  }
            },
            error: function(){
                    $('.info-list-box ul').html('<div class="loading">'+langData['siteConfig'][20][462]+'</div>');//加载失败！
                }

        })
    }

    //商家导航
    function bussiness(){
        bussinessLoad=true;
        $.ajax({
            type: "POST",
            url: "/include/ajax.php",
            dataType: "json",
            data: 'service=business&action=type&pageSize=5',
            success: function (data) {
                if(data && data.state == 100){
                    var tcInfoList = [], list = data.info;
                    for (var i = 0; i < list.length; i++){
                        if(list[i].code != 'special' && list[i].code != 'paper' && list[i].code != 'website'){
                            tcInfoList.push('<li data-id="'+list[i].id+'">'+list[i].typename+'</li>');
                        }

                    }
                    $('.tit_ul ul').append(tcInfoList.join(''));

                }else{

                }
            },
            error: function(){

            }
        });
    }
    //精选商家导航切换
    $('.tit_ul').delegate('li','click',function(){
        $(this).addClass('active').siblings().removeClass('active');
        var typeid = $(this).data('id');
        getList();
    })
    // 获取推荐商家
    var lng = lat = 0;
    var page = 1;
    function getList(){
        bussinessLoad = true;
        var pageSize = 10;
        var typeid = $('.tit_ul li.active').data('id');
        $('.business-list-box').html('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
        $.ajax({
            url: masterDomain+'/include/ajax.php?service=business&action=blist&store=2&typeid='+typeid+'&page='+page+'&pageSize='+pageSize+'&lng='+lng+'&lat='+lat,
            type: 'get',
            dataType: 'jsonp',
            success: function(data){
                if(data && data.state == 100){
                    var html = [];
                    for(var i = 0; i < data.info.list.length; i++){
                        var d = data.info.list[i];
                        html.push('<li class="activity swiper-slide">');
                        html.push(' <a href="'+d.url+'">');
                        html.push('  <div class="business-img">');
                        html.push('<img src="'+(d.logo ? d.logo : (templets + 'images/fShop.png'))+'" alt="">');
                        html.push('  </div>');
                        html.push('  <p>'+d.title+'</p>')
                        html.push('  </a>');
                        html.push('</li>');
                    }
                    $('.business-list-box').html(html.join(''));

					var swiper = new Swiper('.Business-box .swiper-container', {
                        slidesPerView: 3,
                        spaceBetween:0,
                        pagination: {
                            el: '.swiper-pagination',
                            clickable: true,
                        },
                    });
                }else{
                    $('.business-list-box .loading').text(langData['siteConfig'][21][64]);//暂无数据！
                }
            },
            error: function(){
                $('.business-list-box .loading').text(langData['siteConfig'][44][23]);   //    网络错误，请重试
            }
        })
    }
    //贴吧社区
    function tieba(){
        tiebaLoad = true;
        $.ajax({
            type: "GET",
            url: "/include/ajax.php?service=tieba&action=tlist&istop=1&page=1&pageSize=5",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var newsList = [], list = data.info.list;
                    for (var i = 0; i < list.length; i++){
                        newsList.push('<div class="tiezi swiper-slide">');
                        newsList.push(`<a href="${list[i].url}" class="toMini" data-module="tieba" data-temp="detail" data-id="${list[i].id}">`);
                        //暂无图片
                        var pic;

                        if(list[i].imgGroup.length > 0){
                            pic = list[i].imgGroup[0] != undefined ? list[i].imgGroup[0] : "/static/images/404.jpg";
                        }else{
                            pic = "/static/images/404.jpg";
                        }

                        newsList.push('<div class="tie_img"><img src="'+pic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>');
                        newsList.push('<div class="tieCon">');
                        newsList.push('<h3>'+list[i].title+'</h3>');
                        newsList.push('<div class="tie_bot">');
                        newsList.push('<strong>'+langData['siteConfig'][54][137]+'</strong><span>'+langData['siteConfig'][53][21].replace('1',list[i].reply)+'</span>');//热帖 -- 1人参与评论
                        newsList.push('</div>');
                        newsList.push('</div>');
                        newsList.push('</a>');
                        newsList.push('</div>');
                    }
                    $('.tieba_con').html(newsList.join(''));
                    var swiperTieba = new Swiper('.tieba_wrap .swiper-container', {pagination: '.tieba_wrap .pagination',paginationClickable: true, loop: true, autoplay: 3000, autoplayDisableOnInteraction : false});
                }else{
                    $('.tieba_con').html('<div class="loading">'+langData['siteConfig'][21][64]+'</div>');//暂无数据！

                }
            },
            error: function(){
                $('.tieba_con').html('<div class="loading">'+langData['siteConfig'][20][462]+'</div>');//加载失败！
            }
        });
    }
    //企业招聘
    function zhiweiList(){
        jobLoad=true;
        $.ajax({
            type: "POST",
            url: "/include/ajax.php",
            dataType: "json",
            data: 'service=job&action=postList&pageSize=2',
            success: function (data) {
                if(data && data.state == 100){
                    var newsList = [], list = data.info.list;
                    console.log(list);
                    for (var i = 0; i < list.length; i++){
                        //福利待遇
                        var welfare = list[i]['companyDetail'] ? list[i]['companyDetail']['welfareNames'] : '';
                        var welfare_html = '';
                        if(welfare != ''){
                            for (var j = 0; j < welfare.length; j++){
                                welfare_html += '<span>'+welfare[j]+'</span>';
                            }
                        };
                        let date=new Date(list[i].update_time*1000);
                        let update_time=date.getFullYear() + '-'+(date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-'+date.getDate();
                        var price= list[i].show_salary ;
                            newsList.push('<li class="job-list">');
                            newsList.push('<div class="job">');
                            newsList.push('<a class="go_job" href="'+list[i].url+'">');
                            newsList.push('<div class="for-margin">');
                            newsList.push('<div class="job-name"><span>'+list[i].title+'</span>');
                            if(price != '面议'){
                                newsList.push('<b class="price-area">'+ price +'<em>'+langData['siteConfig'][31][111]+'</em></b> </div>');//元/月
                            }else{
                                newsList.push('<b class="price-area">'+langData['siteConfig'][46][70]+'</b> </div>');//面议
                            }
                            newsList.push('<p class="job-need">'+(list[i].job_addr_detail?list[i].job_addr_detail.addrName[list[i].job_addr_detail.addrName.length-1]:'')+(list[i].job_addr_detail&&list[i].experience?'<em>|</em>':'')+list[i].experience+'<em>|</em>'+list[i].educational+'<em>|</em>'+getNatureText(list[i].nature)+'<b class="news-state">'+update_time+'</b></p>');
                           if(welfare != ''){
                                newsList.push('          <div class="welfare">'+welfare_html+'</div>');
                            }
                            newsList.push('</div>');
                            newsList.push('</a>');

                            if(list[i].companyDetail) {
                                newsList.push('<div class="enterise-info">');
                                newsList.push('<a href="' + list[i].companyDetail.url + '" class="go_enterise">');
                                newsList.push('<div class="enterise-logo"><img src="' + list[i].companyDetail.logo + '"></div>');
                                newsList.push('<div class="enterise-info-detail"><h3>' + list[i].companyDetail.title + '</h3>');
                                newsList.push('<p>' + list[i].companyDetail.scale_name + '·' + list[i].companyDetail.nature_name + '·' + (list[i].companyDetail.industry ? list[i].companyDetail.industry_name : '') + '</p>');
                                newsList.push('</div>');

                                newsList.push('</a>');
                                newsList.push('</div>');
                            }
                            newsList.push('</div>');
                        newsList.push('</li>');
                    }
                    $('.job-list-box ul').html(newsList.join(''));

                }else{
                    $('.job-list-box ul').html('<li class="loading">'+langData['siteConfig'][21][64]+'</li>');//暂无数据！

                }
            },
            error: function(){
                $('.job-list-box').html('<li class="loading">'+langData['siteConfig'][20][462]+'</li>');//加载失败！
            }

        });
    }

	//房源
    function houseList(){
        houseload=true;
        $.ajax({
            type: "GET",
            url: "/include/ajax.php?service=house&action=saleList&page=1&pageSize=4",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var newsList = [], list = data.info.list;
                    for (var i = 0; i < list.length; i++){
                        newsList.push('<li class="house-list">');
                        newsList.push('<a href="'+list[i].url+'">');
                        newsList.push('<div class="for-margin">');
                        newsList.push('<div class="house-img">');
                        newsList.push('<img src="'+list[i].litpic+'">');
                        newsList.push('</div>');
                        newsList.push('<div class="house-info ">');
                        newsList.push('<h3 class="house-detail ">'+list[i].title+'</h3>');
                        newsList.push('<p class="price_p"><span class="house-spec">'+list[i].room+'<em>|</em>'+list[i].area+echoCurrency('areasymbol')+'</span>  <span class="house-price"><b>'+(list[i].price > 0 ? list[i].price + '<em>'+langData['siteConfig'][13][27]+'</em>' : langData['siteConfig'][46][70])+'</b></span></p>');//万 面议
                        newsList.push('<p class="house-distance pub-list-style ">'+list[i].community+'<b>'+(list[i].unitprice > 0 ? list[i].unitprice+echoCurrency('short')+'/'+echoCurrency('areasymbol') : langData['siteConfig'][46][70])+'</b></p>');//面议
                        newsList.push('</div>');
                        newsList.push('</div>');
                        newsList.push('</a>');
                        newsList.push('</li>');
                    }
                    $('.house-list-box ul').html(newsList.join(''));
                }else{
                    $('.house-list-box ul').html('<li class="loading">'+langData['siteConfig'][21][64]+'</li>');//暂无数据！

                }
            },
            error: function(){
                $('.house-list-box ul').html('<li class="loading">'+langData['siteConfig'][20][462]+'</li>');//加载失败！
            }
        });
    }

    //同城分类信息
    function infoList(){
        infoLoad=true;
        $.ajax({
            type: "POST",
            url: "/include/ajax.php",
            dataType: "json",
            data: 'service=info&action=ilist_v2&orderby=1&pageSize=5',
            success: function (data) {
                if(data && data.state == 100){
                    var html = [], list = data.info.list;
                    for (var i = 0; i < list.length; i++){

                        html.push('<li class="fn-clear"><a href="'+list[i].url+'" class="toMini" data-module="info"  data-temp="detail" data-id="'+list[i].id+'"><p><strong>【'+list[i].typename+'】</strong><span>'+list[i].title+'</span></p><em>'+list[i].pubdate1+'</em></a></li>');
                    }
                    $('.info-list-box ul').html(html.join(''));


                }else{
                    $('.info-list-box ul').html('<li class="loading">'+langData['siteConfig'][21][64]+'</li>');//暂无数据！

                }
            },
            error: function(){
                $('.info-list-box ul').html('<li class="loading">'+langData['siteConfig'][20][462]+'</li>');//加载失败！
            }
        });
    }

    // 2020-10-20新增板块
    $('.goodBox .topBox li').click(function(){
        if(!$(this).hasClass('active')){
            $(this).addClass('active').siblings('li').removeClass('active');
           shopList();
        }
    })


    //抢购倒计时
    $.ajax({
        url: "/include/ajax.php",
        dataType: "jsonp",
        data: 'service=system&action=getSysTime',
        success: function(data) {

            var date = new Date();
            var nowtime = data.now;
            var time = data.nextHour - nowtime;
            var nowupdate = new Date(nowtime*1000),//时间戳要乘1000
                nowHour   = (nowupdate.getHours()<10)?('0'+nowupdate.getHours()):(nowupdate.getHours());
            $('.timeCl').html(langData['tuan'][0][24].replace('1',nowHour));//1点场
            setInterval(function () {
                var hour = parseInt(time/ 60 / 60 % 24);
                var minute = parseInt(time/ 60 % 60);
                var seconds = parseInt(time% 60);

                $('#time_h').text(hour < 10 ? '0' + hour : hour);
                $('#time_m').text(minute < 10 ? '0' + minute : minute);
                $('#time_s').text(seconds < 10 ? '0' + seconds : seconds);

                time--;
            }, 1000);
        }
    });

    //商城商品
    function shopList(){
        shopload=true;
        var shopType = $('.goodBox .topBox li.active').index();
        var url;
        // if(shopType == 0){//推荐
        //    url = "/include/ajax.php?service=shop&action=slist&flag=0&page=1&pageSize=8";
        // }else{//最新
            url = "/include/ajax.php?service=shop&action=slist&orderby=5&page=1&pageSize=8";
        // }
        $.ajax({
            type: "GET",
            url: url,
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var html = [], list = data.info.list;
                    for (var i = 0; i < list.length; i++){
                        var pic = list[i].litpic!='' && list[i].litpic != undefined ? list[i].litpic : "/static/images/404.jpg";
                        html.push('<div class="swiper-slide">');
                        html.push('<a href="'+list[i].url+'">');
                        html.push('<div class="top_img">');
                        html.push('<img src="'+pic+'" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';">');
                        html.push('</div>');
                        html.push('<div class="goodInfo ">');
                        html.push('<h4>'+list[i].title+'</h4>');
                        html.push('<h5><em>'+echoCurrency('symbol')+'</em><strong>'+list[i].price+'</strong><del>'+list[i].mprice+'</del></h5>');

                        html.push('</div>');
                        html.push('</a>');
                        html.push('</div>');
                    }
                    $('.goodList').html(html.join(''));
                    var goodSwiper = new Swiper('.goodBox .swiper-container', {
                        slidesPerView: 'auto',
                    });
                }else{
                    $('.goodList').html('<div class="loading">'+langData['siteConfig'][21][64]+'</div>');//暂无数据！

                }
            },
            error: function(){
                $('.goodList').html('<div class="loading">'+langData['siteConfig'][20][462]+'</div>');//加载失败！
            }
        });
    }
    var qgSwiper,tuanSwiper;
    //推荐团购 -- 限时秒杀 后台数据添加必须为整点
    function tuanList(){
        tuanload=true;
        $.ajax({
            type: "GET",
            url: "/include/ajax.php?service=tuan&action=tlist&iscity=1&rec=1&orderby=1&page=1&pageSize=8",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100 && data.info.list.length > 0){
                    var html = [], list = data.info.list;
                    for (var i = 0; i < list.length; i++){
                        var pic = list[i].litpic!='' && list[i].litpic != undefined ? list[i].litpic : "/static/images/404.jpg";
                        html.push('<div class="swiper-slide">');
                        html.push('<a href="'+list[i].url+'">');
                        html.push('<div class="top_img">');
                        html.push('<img src="'+pic+'" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';">');
                        html.push('</div>');
                        html.push('<div class="goodInfo ">');
                        html.push('<h4>'+list[i].title+'</h4>');
                        html.push('<h5><em>'+echoCurrency('symbol')+'</em><strong>'+list[i].price+'</strong><del>'+list[i].market+'</del></h5>');
                        var lsale = list[i].sale;
                        if(lsale > 10000){
                            lsale = (lsale/10000).toFixed(1)+'w';
                        }
                        html.push('<div class="ytDiv"><span class="pin_num">'+langData['siteConfig'][54][138].replace('1',lsale)+'</span></div>');//<strong>1</strong>人已团

                        html.push('</div>');
                        html.push('</a>');
                        html.push('</div>');
                    }
                    $('.tuanList').html(html.join(''));
                    tuanSwiper = new Swiper('.tuanCom .swiper-container', {
                        slidesPerView: 'auto',
                    });
                }else{
                    $('.tuanList').html('<div class="loading">'+langData['siteConfig'][21][64]+'</div>');//暂无数据！

                }
            },
            error: function(){
                $('.tuanList').html('<div class="loading">'+langData['siteConfig'][20][462]+'</div>');//加载失败！
            }
        });
        $.ajax({
          url: "/include/ajax.php?service=tuan&action=systemTime",
          type: "GET",
          dataType: "jsonp",
          success: function (data) {
            if(data.state == 100){
                var list = data.info.list, now = data.info.now, nowTime = data.info.nowTime, html = [], className='';
                if(list.length > 0){
                    var time = list[0].nextHour;
                }
                if(time!='' && time!=undefined){
                    nextHour = time;
                }
                $.ajax({
                    url: "/include/ajax.php?service=tuan&action=tlist&hourly=1&iscity=1&time="+nextHour+"&page=1&pageSize=8",
                    type: "GET",
                    dataType: "jsonp",
                    success: function (data) {
                        if(data && data.state == 100 && data.info.list.length > 0){
                            var list = data.info.list, html = [];

                            for(var i = 0; i < list.length; i++){
                                var pic = list[i].litpic!='' && list[i].litpic != undefined ? list[i].litpic : "/static/images/404.jpg";
                                html.push('<div class="swiper-slide">');
                                html.push('<a href="'+list[i].url+'">');
                                html.push('<div class="top_img">');
                                html.push('<img src="'+pic+'" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';">');
                                html.push('</div>');
                                html.push('<div class="goodInfo ">');
                                html.push('<h4>'+list[i].title+'</h4>');
                                html.push('<h5><em>'+echoCurrency('symbol')+'</em><strong>'+list[i].price+'</strong><del>'+list[i].market+'</del></h5>');

                                html.push('</div>');
                                html.push('</a>');
                                html.push('</div>');
                            }
                            $('.qgList').html(html.join(''));
                            qgSwiper = new Swiper('.qgCom .swiper-container', {
                                slidesPerView: 'auto',
                            });

                        }else{
                            $('.qgList').html('<div class="loading">'+langData['siteConfig'][21][64]+'</div>');//暂无数据！
                        }
                    },
                    error: function(){
                        $('.qgList').html('<div class="loading">'+langData['siteConfig'][20][462]+'</div>');//加载失败！
                    }
                });
            }
          }
        });
    }
    //抢购 秒杀切换
    $('.tuanBox .topBox li').click(function(){
        if(!$(this).hasClass('active')){
            $(this).addClass('active').siblings('li').removeClass('active');
            var i = $(this).index();
            $('.tuanCon .tuanComm').eq(i).addClass('show').siblings('.tuanComm').removeClass('show');
            if(i == 0){
                tuanSwiper.update();
            }else{
                qgSwiper.update();
            }
        }
    })

    //外卖美食
    checkLocal();
    function wmList(){
        wmload=true;
        $.ajax({
            type: "GET",
            url: "/include/ajax.php?service=waimai&action=foodRank&pageSize=3",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var html = [], list = data.info;
                    for (var i = 0; i < list.length; i++){
                        var pic = list[i].pics && list[i].pics != undefined ? list[i].pics[0] : "/static/images/404.jpg";
                        var cla = '';
                        if(i==0){
                            cla = 'first_li';
                        }
                        html.push('<li class='+cla+'>');
                        html.push('<a href="'+list[i].url+'">');
                        html.push('<div class="top_img">');
                        html.push('<img src="'+pic+'" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';">');
                        if(i==0){
                            html.push('<span>销量第一</span>');
                        }
                        html.push('</div>');
                        html.push('<div class="wmInfo ">');
                        html.push('<h3>'+list[i].title+'</h3>');
                        html.push('<p class="wmPrice"><em>'+echoCurrency('symbol')+'</em><strong>'+list[i].price+'</strong></h5>');
                        html.push('<p class="wmSale">'+langData['siteConfig'][54][140].replace('1',list[i].sale)+'</p>');//1份已售
                        html.push('</div>');
                        html.push('</a>');
                        html.push('</li>');
                    }
                    $('.wmList ul').html(html.join(''));
                }else{
                    $('.wmList ul').html('<div class="loading">'+langData['siteConfig'][21][64]+'</div>');//暂无数据！

                }
            },
            error: function(){
                $('.wmList ul').html('<div class="loading">'+langData['siteConfig'][20][462]+'</div>');//加载失败！
            }
        });
    }

    //汽车市场
    function carList(){
        carload=true;
        $.ajax({
            type: "GET",
            url: "/include/ajax.php?service=car&action=car&orderby=1&page=1&pageSize=8",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var html = [], list = data.info.list;
                    for (var i = 0; i < list.length; i++){
                        var pic = list[i].litpic!='' && list[i].litpic != undefined ? list[i].litpic : "/static/images/404.jpg";
                        html.push('<div class="swiper-slide">');
                        html.push('<a href="'+list[i].url+'">');
                        html.push('<div class="top_img">');
                        html.push('<img src="'+pic+'" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';">');
                        html.push('</div>');
                        html.push('<div class="goodInfo ">');
                        html.push('<h4>'+list[i].title+'</h4>');
                        html.push('<h5><strong>'+list[i].price+'</strong><em>万</em></h5>');
                        html.push('</div>');
                        html.push('</a>');
                        html.push('</div>');
                    }
                    $('.carList').html(html.join(''));
                    var carSwiper = new Swiper('.carBox .swiper-container', {
                        slidesPerView: 'auto',
                    });
                }else{
                    $('.carList').html('<div class="loading">'+langData['siteConfig'][21][64]+'</div>');//暂无数据！

                }
            },
            error: function(){
                $('.carList').html('<div class="loading">'+langData['siteConfig'][20][462]+'</div>');//加载失败！
            }
        });
    }
    //旅游
    $('.travelBox .topBox li').click(function(){
        if(!$(this).hasClass('active')){
            $(this).addClass('active').siblings('li').removeClass('active');
           travelList();
        }
    })

    function travelList(){
        travelload=true;
        var shopType = $('.travelBox .topBox li.active').index();
        var url;
        if(shopType == 0){//酒店
           url = "/include/ajax.php?service=travel&action=hotelList&orderby=1&page=1&pageSize=8";
        }else if(shopType == 1){//景点
			 url = "/include/ajax.php?service=travel&action=ticketList&orderby=1&page=1&pageSize=8";
        }else{//旅行社
            url = "/include/ajax.php?service=travel&action=storeList&filter=4&page=1&pageSize=8";

		}
        $.ajax({
            type: "GET",
            url: url,
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var html = [], list = data.info.list;
                    for (var i = 0; i < list.length; i++){
                        var pic = list[i].litpic!='' && list[i].litpic != undefined ? list[i].litpic : "/static/images/404.jpg";
                        var tCla = '',tCla2 ='';
                        if(shopType ==2){
                            tCla = 'tstore';
                            tCla2 = 'tsh';
                        }
                        html.push('<div class="swiper-slide '+tCla+'">');
                        html.push('<a href="'+list[i].url+'">');
                        html.push('<div class="top_img">');
                        html.push('<img src="'+pic+'" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';">');
                        if(shopType ==2 && list[i].flag == 2){//旅行社已认证

                            html.push('<div class="rz"><i></i>'+langData['siteConfig'][9][18]+'</div>');//已认证

                        }
                        html.push('</div>');
                        html.push('<div class="goodInfo ">');
                        html.push('<h4 class="'+tCla2+'">'+list[i].title+'</h4>');
                        if(shopType == 0 || shopType == 1){
                           html.push('<h5><em>'+echoCurrency('symbol')+'</em><strong>'+list[i].price+'</strong></h5>');
                        }


                        html.push('</div>');
                        html.push('</a>');
                        html.push('</div>');
                    }
                    $('.travelList').html(html.join(''));
                    var travelSwiper = new Swiper('.travelBox .swiper-container', {
                        slidesPerView: 'auto',
                    });
                }else{
                    $('.travelList').html('<div class="loading">'+langData['siteConfig'][21][64]+'</div>');//暂无数据！

                }
            },
            error: function(){
                $('.travelList').html('<div class="loading">'+langData['siteConfig'][20][462]+'</div>');//加载失败！
            }
        });
    }

    //顺风车
    function sfcarList(){
        sfcarload=true;
        $.ajax({
            type: "GET",
            url: "/include/ajax.php",
            dataType: "json",
            data: 'service=sfcar&action=getsfcarlist&cityid='+cityid+'&page=1&pageSize=5',
            success: function (data) {
                if(data && data.state == 100){
                    var html = [], list = data.info.list;
                    for (var i = 0; i < list.length; i++){
                        var cartype ='';
                        if(list[i].usetype ==0){
                            cartype = "car";
                        }else{
                            cartype = "truck";

                        }
                        html.push('<li class="fn-clear"><a href="'+list[i].url+'">');
                        html.push('<div class="sfcarInfo">');
                        html.push('<strong class="sfType '+cartype+'">'+list[i].usetypename+'</strong>');
                        html.push('<h2 class="liTitle">'+list[i].startaddr+'<s></s>'+list[i].endaddr+'</h2>');
                        html.push('</div>');
                        html.push('<em>'+list[i].pubdatetime+'</em>');
                        html.push('</a></li>');
                    }
                    $('.sfcarList ul').html(html.join(''));


                }else{
                    $('.sfcarList ul').html('<li class="loading">'+langData['siteConfig'][21][64]+'</li>');//暂无数据！

                }
            },
            error: function(){
                $('.sfcarList ul').html('<li class="loading">'+langData['siteConfig'][20][462]+'</li>');//加载失败！
            }
        });
    }

    //滚动加载视频
    var vpage = 1,videoLoad =false,vload;
    $(window).on("scroll", function() {
        var thisa = $(this);
        var st = thisa.scrollTop();
        var sct = $(window).scrollTop();
        var h=$(window).height();
        var th = st + h;
        var allH = sct + $(window).height();

        if (allH >= $(document).height() - 100 && !videoLoad) {
           vpage++;
           videoList();
        }

        var a3 = $(".videoBox").offset().top - 100;
        var p3 = $(".videoBox").height();
        var tp3=a3 + p3;
        if (tp3 > st && a3 < th && !vload) {
            console.log('视频s')
            videoList();


        }

    });

    function videoList(){
        vload = true;
        videoLoad = true;
        $('.videoList .loading').remove();
        $(".videoList").append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
        $.ajax({
            type: "GET",
            url: "/include/ajax.php",
            dataType: "json",
            data: 'service=video&action=alist&orderby=2&page='+vpage+'&pageSize=8',
            success: function (data) {
                if(data && data.state == 100){
                    $(".videoList .loading").remove();
                    var html = [],html2=[], list = data.info.list,pageinfo = data.info.pageInfo;
                    for (var i = 0; i < list.length; i++){

                        if(i%2 == 0){
                            var pic = list[i].litpic!='' && list[i].litpic != undefined ? list[i].litpic : "/static/images/404.jpg";
                            html2.push('<li><a href="'+list[i].url+'">');
                            html2.push('<div class="videoImg">');
                            html2.push('<i class="vIcon"></i>');
                            html2.push('<img src="'+pic+'" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';">');
                            html2.push('</div>');
                            html2.push('<div class="videoInfo">');
                            html2.push('<h2>'+list[i].title+'</h2>');
                            html2.push('<p class="seePeo"><s></s><strong>'+list[i].click+'</strong></p>');
                            html2.push('</div>');
                            html2.push('</a></li>');

                        }else{
                            var pic = list[i].litpic!='' && list[i].litpic != undefined ? list[i].litpic : "/static/images/404.jpg";
                            html.push('<li><a href="'+list[i].url+'">');
                            html.push('<div class="videoImg">');
                            html.push('<i class="vIcon"></i>');
                            html.push('<img src="'+pic+'" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';">');
                            html.push('</div>');
                            html.push('<div class="videoInfo">');
                            html.push('<h2>'+list[i].title+'</h2>');
                            html.push('<p class="seePeo"><s></s><strong>'+list[i].click+'</strong></p>');
                            html.push('</div>');
                            html.push('</a></li>');
                        }

                    }
                    videoLoad = false;
                    $('.videoList ul.box1').append(html.join(''));
                    $('.videoList ul.box2').append(html2.join(''));

                    if(vpage >= pageinfo.totalPage){
                        videoLoad = true;
                        $(".videoList").append('<div class="loading">'+langData['siteConfig'][20][429]+'</div>');
                    }

                }else{
                    videoLoad = false;
                    $('.videoList .loading').html(langData['siteConfig'][21][64]);//暂无数据！


                }
            },
            error: function(){
                videoLoad = false;
                $('.videoList .loading').html(langData['siteConfig'][20][462]);//加载失败！
            }
        });
    }


    function getNatureText(num){
        switch (num){
            case '0' :
                return langData['siteConfig'][19][129];//全职
            case '1':
                return langData['siteConfig'][19][130];//兼职
            case '2':
                return langData['siteConfig'][19][131];//临时
            case '3':
                return langData['siteConfig'][19][132];//实习
            default :
                return langData['siteConfig'][21][67];//未知
        }
    }



    function checkLocal(){
        var local = false;
        var localData = utils.getStorage("user_local");
        if(localData){
            var time = Date.parse(new Date());
            time_ = localData.time;
            // 缓存1小时
            if(time - time_ < 3600 * 1000){
                lat = localData.lat;
                lng = localData.lng;
                local = true;
            }

        }
        if(!local){
            HN_Location.init(function(data){
                if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
                    lng = lat = -1;
                }else{
                    lng = data.lng;
                    lat = data.lat;

                    var time = Date.parse(new Date());
                    utils.setStorage('user_local', JSON.stringify({'time': time, 'lng': lng, 'lat': lat, 'address': data.address}));
                }
            })
        }else{
        }
    }


    var siteCityInfo = $.cookie("HN_siteCityInfo");
    //-------
    document.addEventListener('visibilitychange', function () {
        let pageVisibility = document.visibilityState;
        // 页面变为不可见时触发
        if (pageVisibility == 'hidden') {
            console.log("离开时间点：" + new Date());
        }
        // 页面变为可见时触发
        if (pageVisibility == 'visible') {
            // console.log("重新进入时间点：" + new Date());
            var currCityInfo = $.cookie("HN_siteCityInfo");
            currCityInfo = currCityInfo ? JSON.parse(currCityInfo) : {}
            var oldCityInfo = siteCityInfo ? JSON.parse(siteCityInfo) : {}
            if(currCityInfo.cityid != oldCityInfo.cityid){
                location.reload()
            }
        }
    })

	//切换城市、搜索跳转
	$('.head-search .areachose').bind('click', function(){
        let url = $(this).data('url');
        if(device.indexOf('huoniao') > -1 ){
            if(navigator.userAgent.indexOf('huoniao_Android') > -1){

                setupWebViewJavascriptBridge(function(bridge) {
                  bridge.callHandler('goToCity', {}, function(){});
                });
            }else{
                setupWebViewJavascriptBridge(function(bridge) {
                    bridge.callHandler('redirectNative', {
                        'name': '',
                        'code': '',
                        'link': url
                    }, function() {});
                });

            }
          e.preventDefault();
        }else{
            location.href = $(this).data('url');
        }
	});

	// $('.head-search .search').bind('click', function(){
    //     location.href = $(this).data('url');
	// });


	//扫一扫
	$(".search-scan").delegate(".scan", "click", function(){

		//APP端
		if(device.indexOf('huoniao') > -1){
			setupWebViewJavascriptBridge(function(bridge) {
				bridge.callHandler("QRCodeScan", {}, function callback(DataInfo){
					if(DataInfo){
						// APP端已做处理，不需要前端跳转
						// if(DataInfo.indexOf('http') > -1){
						// 	location.href = DataInfo;
						// }else{
						// 	alert(DataInfo);
						// }
					}
				});
			});

		//微信端
		}else if(device.toLowerCase().match(/micromessenger/) && device.toLowerCase().match(/iphone|android/)){

			wx.scanQRCode({
				// 默认为0，扫描结果由微信处理，1则直接返回扫描结果
				needResult : 1,
				desc: '扫一扫',
				success : function(res) {
					if(res.resultStr){
						if(res.resultStr.indexOf('http') > -1){
							if(wx_miniprogram){
								wx.miniProgram.navigateTo({url: '/pages/redirect/index?url=' + encodeURIComponent(res.resultStr)});
							}else{
								location.href = res.resultStr;
							}
						}else if(res.resultStr.indexOf('EAN_13,') > -1){
							var resultStr = res.resultStr.split('EAN_13,');
							if(wx_miniprogram){
								wx.miniProgram.navigateTo({url: '/pages/redirect/index?url=' + encodeURIComponent(masterDomain + '/include/ajax.php?service=shop&action=barcodeSearch&type=redirect&code=' + resultStr[1])});
							}else{
								location.href = '/include/ajax.php?service=shop&action=barcodeSearch&type=redirect&code=' + resultStr[1];
							}
						}else{
							alert(res.resultStr);
						}
					}
				},
				fail: function(err){
					alert(langData['siteConfig'][20][183]);
				}
			});

		//浏览器
		}else{
			$('.downloadAppFixed').css("visibility","visible");
			$('.downloadAppFixed .con').show();
		}

	});
    var ua = navigator.userAgent;
	var appVersion = '1.0';
	if(ua.match(/(iPhone|iPod|iPad);?/i)) {
		appVersion = $('.downloadAppFixed .app dd p').attr('data-ios');
	}else{
		appVersion = $('.downloadAppFixed .app dd p').attr('data-android');
	}
	$('.downloadAppFixed .app dd em').html(appVersion);
	$('.downloadAppFixed .close').bind('click', function(){
		$('.downloadAppFixed .con').hide();
		$('.downloadAppFixed').css("visibility","hidden");
	});

    //验证当前访问页面是否为当前城市(2023.7.17)
	let manualChange=localStorage.getItem('manualChange');
	if(Boolean(manualChange)){ //未检测到HN_Location
		localStorage.removeItem('manualChange');
		return false
	}

	//验证当前访问页面是否为当前城市
	// var changAutoCity = $.cookie("HN_changAutoCity");
	var isChecked = false;
	// var siteCityInfo = $.cookie("HN_siteCityInfo");
    var changeAutoCity;
	if(siteCityInfo){
		HN_Location.init(function(data){
		if(isChecked) return;
		isChecked = true;
	    if (data != undefined && data.province != "" && data.city != "" && data.district != "" && cfg_auto_location == '1' && !changeAutoCity) {
	      var province = data.province, city = data.city, district = data.district, town = data.town;
				$.ajax({
			    url: "/include/ajax.php?service=siteConfig&action=verifyCity&region="+province+"&city="+city+"&town="+town+"&district="+district,
			    type: "POST",
			    dataType: "json",
			    success: function(data){
			      if(data && data.state == 100){
					var siteCityInfo_ = JSON.parse(siteCityInfo);
					var nowCityInfo = data.info;
					if(siteCityInfo_.cityid != nowCityInfo.cityid){
						// $.cookie("HN_changAutoCity", '1', {expires: 1, path: '/'});

						changeAutoCity = $.dialog({
                          width: 250,
                          buttons: {
                            "取消": function() {
                              this.close();
                            },
                            "确定": function() {

							  if(device.toLowerCase().indexOf('huoniao') > -1 && device.toLowerCase().indexOf('android') > -1){
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
                          },
                          content: '<div style="text-align: center"> '+langData['siteConfig'][53][22]+'<div style="font-size: .5rem; color: #ff6600; padding: .1rem 0;"><strong>' + nowCityInfo.name + '</strong></div>'+langData['siteConfig'][53][23]+' </div>'//检测到你目前的城市为 是否切换
                        }).open();

					}
			      }
			    }
			  })
	    }
	  })
	}
});
