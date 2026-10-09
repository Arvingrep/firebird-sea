$(function(){
    var atpage = 1,isload = false;
	console.log($("#stock").text());
    // 分销分享
    $(".fenxiao_share").click(function(){
        if (device.indexOf('huoniao_iOS') > -1 || device.indexOf('huoniao_Android') > -1){
            setupWebViewJavascriptBridge(function(bridge) {
                bridge.callHandler("appShare", {
                    "platform": "all",
                    "title": wxconfig.title,
                    "url": wxconfig.link,
                    "imageUrl": wxconfig.imgUrl,
                    "summary": wxconfig.description
                }, function(responseData){
                    var data = JSON.parse(responseData);
                })
            });
        }else{
            $("#postFast").click();
        }
    })

    //购买者滚动
    $.ajax({
        type: "GET",
        url: "/include/ajax.php",
        dataType: "json",
        data: 'service=shop&action=buyList&id='+detailID,
        success: function(data) {

            if(data.state == 100){
                var tcNewsHtml = [], list = data.info;

                for (var i = 0; i < list.length; i++){
                    if(list[i].nickname){
                        tcNewsHtml.push('<div class="swiper-slide"><div>');
                        tcNewsHtml.push('<div class="buyImg"><img src="'+list[i].photourl+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\'"></div>');
                        tcNewsHtml.push('<p><em>'+list[i].nickname+'</em>刚刚购买了该商品</p>');
                        tcNewsHtml.push('</div></div>');
                    }

                }

                $('.buyGun .swiper-wrapper').html(tcNewsHtml.join(''));
                $('.buyGun').show();
                var mySwiper = new Swiper('.buyGun .swiper-container',{
                    direction : 'vertical',
                    autoplay: {
                        delay: 2000,
                        stopOnLastSlide: false,
                        disableOnInteraction: true,
                    },
                    slidesPerView:1,
                    loop : true,
                })

            }else{
                $('.buyGun').hide();
            }
        },
        error: function(){
            $('.buyGun').hide();
        }
    });

    //判断返积分状态 如果是关闭的就是没有
    if($(".yhBox>div").length>0){
        $(".youhui").removeClass('fn-hide')
    }

    /*调起大图 S*/
    $.fn.bigImage({
        artMainCon:".det-con",  //图片所在的列表标签
    });
    var commonLoad = null,page=1,pageSize=20;
    // tabTop = $('.shop-info').offset().top;
    // 收藏
    $('.soucang').click(function(){
        var t = $(this), type = t.hasClass("hascang") ? "del" : "add";
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            location.href = masterDomain + '/login.html';
            return false;
        }
        var t = $(this), type = t.hasClass("hascang") ? "del" : "add";
        if(type == 'add'){
            t.addClass('niceIn');
            t.addClass('hascang');
            setTimeout(function() {
              t.removeClass('niceIn');
              t.find('span').text('已收藏');
            }, 500)
        }else{
            t.removeClass('hascang');
            t.find('span').text('收藏');
            showMsg2('取消收藏成功');
        }
        
        $.post("/include/ajax.php?service=member&action=collect&module=shop&temp=detail&type="+type+"&id="+detailID);

    });
    // 关注
    $('.btn-care').click(function(){
        var t = $(this), type = t.hasClass("cared") ? "del" : "add";
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            location.href = masterDomain + '/login.html';
            return false;
        }
        if(type == 'add'){
            showMsg2('关注成功');
            t.addClass('cared').html('已关注');
        }else{
            showMsg2('取消关注成功');
            t.removeClass('cared').html('关注店铺');
        }
        $.post("/include/ajax.php?service=member&action=collect&module=shop&temp=store-detail&type="+type+"&id="+storeid);

    });
    // 轮播图

    $('.markBox').find('a:first-child').addClass('curr');
    var bannerSw = new Swiper('.topSwiper .swiper-container', {pagination: {el: '.topSwiper .swiper-pagination',type: 'fraction',} ,loop: false,grabCursor: true,paginationClickable: true,
        on: {
            slideChangeTransitionStart: function(){
                var len = $('.markBox').find('a').length;
                var sindex = this.activeIndex;
                if(len==1){
                    $('.markBox').find('a:first-child').addClass('curr');
                }else{
                    if(sindex > 0){
                        $('.pmark').removeClass('curr');
                        $('.picture').addClass('curr');
                    }else{
                        $('.pmark').removeClass('curr');
                        $('.video').addClass('curr');
                    }
                }

            },
        }
    });


    // 图片放大
    var videoSwiper = new Swiper('.videoModal .swiper-container', {pagination: {el:'.videoModal .swiper-pagination',type: 'fraction',},loop: false})
    $(".topSwiper").delegate('.swiper-slide', 'click', function() {
        var imgBox = $('.topSwiper .swiper-slide');
        var i = $(this).index();
        $(".videoModal .swiper-wrapper").html("");
        for(var j = 0 ,c = imgBox.length; j < c ;j++){
            if(j==0){
                if(detail_video!=''){
                    $(".videoModal .swiper-wrapper").append('<div class="swiper-slide"><video width="100%" height="100%" controls preload="meta" x5-video-player-type="h5" x5-playsinline playsinline webkit-playsinline  x5-video-player-fullscreen="true" id="video" src="'+detail_video+'"  poster="' + imgBox.eq(j).find("img").attr("src") + '"></video></div>');
                }else{
                    $(".videoModal .swiper-wrapper").append('<div class="swiper-slide"><img src="' + imgBox.eq(j).find("img").attr("src") + '" / ></div>');
                }
            }else{
                $(".videoModal .swiper-wrapper").append('<div class="swiper-slide"><img src="' + imgBox.eq(j).find("img").attr("src") + '" / ></div>');
            }

        }
        videoSwiper.update();
        $(".videoModal").addClass('vshow');
        $('.markBox').toggleClass('show');
        videoSwiper.slideTo(i, 0, false);
        return false;
    });

    $(".videoModal").delegate('.vClose', 'click', function() {
        var video = $('.videoModal').find('video').attr('id');
        $(video).trigger('pause');
        $(this).closest('.videoModal').removeClass('vshow');
        $('.videoModal').removeClass('vshow');
        $('.markBox').removeClass('show');
    });


    $(".kj").click(function () {
        var t = $(this);
        if(t.hasClass('disabled')) return false;
        //验证登录
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            window.location.href = masterDomain+'/login.html'
            return false;
        }

        t.addClass('disabled');
        $.ajax({
            type: "GET",
            url: "/include/ajax.php",
            dataType: "json",
            data: 'service=shop&action=bargaining&id='+detailID+'&hid='+huodongid,
            success:function (data) {
                if(data.state ==100){

                    var url = bargainingurl.replace('%id',data.info)
                    window.location.href= url;

                }else{
                    t.removeClass('disabled');
                    showErrAlert(data.info)
                }
            },
            error:function () {
                showErrAlert(data.info)
                t.removeClass('disabled');
            }
        })
    });

    // 参数弹窗
    $('.btn-parm').click(function(){
        $('.comMak').show();
        $('.paramAlert').animate({'bottom':'0'},200)
    })

    // 关闭参数弹窗、关闭服务说明弹窗、
    $('.finishA a').click(function(){
        $('.comMak').hide();
        $('.paramAlert').animate({'bottom':'-100%'},200)
        $('.fuwuAlert').animate({'bottom':'-100%'},200)
    })
    $('.comMak').click(function(){
        $('.comMak').hide();
        $('.paramAlert').animate({'bottom':'-100%'},200)
        $('.quanAlert').animate({'bottom':'-100%'},200)
        $('.fuwuAlert').animate({'bottom':'-100%'},200)
    })
    //查看购买数量
    $('.paramAlert .mincoutNote a').click(function(){
        if(!$(this).hasClass('clicka')){
            $(this).addClass('clicka')
            $('.mincoutTip').show();
        }else{
            $(this).removeClass('clicka')
            $('.mincoutTip').hide();
        }

    })

    // 优惠券弹窗
    $('.youhui .qyouhui').click(function(){
        $('.comMak').show();
        $('.quanAlert').animate({'bottom':'0'},200)
    })

    // 关闭优惠券弹窗
    $('.closeQuan a').click(function(){
        $('.comMak').hide();
        $('.quanAlert').animate({'bottom':'-100%'},200)
    })

    //选择优惠券
    $('.quanAlert').delegate('.toUse','click',function(){
        $('.closeQuan a').click();
    })
    $('.quanAlert').delegate('.canGet','click',function(){
        var t = $(this)
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            location.href = masterDomain + '/login.html';
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

                    // $(this).text('已领取');
                    // $(this).addClass('noChose');
                    t.closest('li').addClass('chosed')
                    t.text('继续领取')
                    showMsg(data.info)

                }else{
                    t.addClass('noChose')
                    showMsg(data.info)
                }
            },
            error:function () {

            }
        });
        // var num = $(this).closest('li').attr('data-num');
        // if(num >=1){
        //     if(num == 1){
        //        $(this).text('已领取');
        //     }else{
        //         $(this).text('继续领取');
        //     }
        //     $(this).closest('li').addClass('chosed');
        //     num--;
        //     $(this).closest('li').attr('data-num',num);
        //     showMsg('领取成功');
        //
        // }else{
        //     $(this).text('已领取');
        //     $(this).addClass('noChose');
        //     showMsg('您的此券领取数量已达上限');
        //     return false;
        // }
    })

    // 服务说明弹窗
    $('.sbright p').click(function(){
        $('.comMak').show();
        $('.fuwuAlert').animate({'bottom':'0'},200)
    })

    //拼团
    // var a = $('.people_list .swiper-slide').length;
    // if(a == 1){
    //   $(".people .swiper-wrapper").css('height','1.1rem');
    // }else if(a>=2){
    //     var tuanSwiper = new Swiper('.people .swiper-container', {
    //         direction: 'vertical',
    //         autoplay:{delay: 5000,},
    //         slidesPerView:2,
    //         slidesPerGroup : 2,
    //         loop:true
    //     });
    // }else{
    //   $('.people').html('').hide();
    // }
    $.ajax({
        type: "GET",
        url: "/include/ajax.php",
        dataType: "json",
        data: 'service=shop&action=pinuserList&tid='+huodongid +'&pageSize=20',
        success: function(data) {

            if(data.state == 100){
                var tcNewsHtml = [], list = data.info.list;
                if(list.length > 0){
                    tcNewsHtml.push('<div class="swiper-slide time_each">');
                    // if(list.length%2 == 1){//奇数
                    //     list = list.concat(list);//为实现swiper效果
                    // }

                    for (var i = 0; i < list.length; i++){

                        tcNewsHtml.push('<div class="fn-clear info_list">');
                        var pic = list[i].photo != "" && list[i].photo != undefined ? list[i].photo : "/static/images/noPhoto_100.jpg";
                        tcNewsHtml.push('<div class="list_img"><img src="'+pic+'" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>');
                        tcNewsHtml.push('<div class="list_name">'+list[i].name+'</div>');
                        tcNewsHtml.push('<a href="'+list[i].url+'">去拼单</a>');
                        tcNewsHtml.push('<div class="list_time"><p>还差<em>'+list[i].rest+'人</em>拼成</p><p class="time_show" data-time="'+list[i].enddate+'" data-now="'+list[i].now+'">剩余'+list[i].time+'</p></div>');
                        tcNewsHtml.push('</div>');
                        if((i + 1) % 2 == 0 && i + 1 < list.length){
                            tcNewsHtml.push('</div>');
                            tcNewsHtml.push('<div class="swiper-slide time_each swiper-no-swiping">');
                        }


                    }

                    tcNewsHtml.push('</div>');
                    if(list.length == 1){
                        $('.people .swiper-wrapper').addClass('lowerHeight')
                    }
                    $('.people .swiper-wrapper').html(tcNewsHtml.join(''));
                    $('.people').show();
                    $('#totalcount').text(data.info.pageInfo.totalCount)
                    var tuanSwiper = new Swiper('.people .swiper-container', {direction: 'vertical',autoplay:{delay: 5000,},slidesPerView:"auto",loop:true });

                }else{
                    $('.people').html('').hide();
                }

            }else{
                $('.people').html('').hide();
            }
        },
        error: function(){
            $('.people').html('').hide();
        }
    });

    // 点击
    $(".people .info_list").on("click",function(){
        $.smartScroll($('.pd_list'),'.pd_title_txt');
        $('html').addClass('nos');
        $('.pd_list').addClass('curr');
        return false;
    });
    $(".pd_list .modal-main .close").on("touchend",function(){
        $("html, .pd_list").removeClass('curr nos');
        return false;
    })
    $(".bgCover").on("click",function(){
        $("html, .pd_list").removeClass('curr nos');
    })

    $('.people .info_title a').click(function(){
        $.smartScroll($('.pd_list'),'.pd_title_txt');
        $('html').addClass('nos');
        $('.pd_list').addClass('curr');
        return false;
    })


    // 错误提示
    function showMsg(str){
        var o = $(".errorTip");
        o.html(str).show();
        setTimeout(function(){o.hide()},1000);
    }

    function showMsg2(str){
        var o = $(".error");
        o.html(str).show();
        setTimeout(function(){o.hide()},1000);
    }



    // 筛选评价
    $('.com-tab li').click(function(){
        var filter = $(this).attr('data-type') || '';
        $(this).addClass('active').siblings().removeClass('active');
        getComment(filter)
    })

    // 导航吸顶
    var navHeight = $('.shopInfo').offset().top;
    $(window).on("scroll",function() {
        var sct = $(window).scrollTop();
        if(sct >= navHeight) {
            //$('.det-tab').show();
            // $('.det-tab').animate({'top':'.9rem'},200);
            $('.det-tab').addClass('topfixed')
        }else{
            //$('.det-tab').hide();
            //$('.det-tab').animate({'top':'-100%'},200);
            $('.det-tab').removeClass('topfixed')
        }


    });

    // 导航切换
    var isClick = 0;
    //左侧导航点击
    $(".det-tab li").bind("click", function(){
        isClick = 1; //关闭滚动监听
        var t = $(this), index = t.index(), theadTop;
        if((device.indexOf('huoniao_iOS') > -1) && !(window.__wxjs_environment == 'miniprogram')){
            theadTop = $(".mainBox:eq("+index+")").offset().top - 190;
        }else{
            theadTop = $(".mainBox:eq("+index+")").offset().top - 100;
        }
        t.addClass("active").siblings("li").removeClass("active");
        $(window).scrollTop(theadTop);
        setTimeout(function(){
            isClick = 0;//开启滚动监听
        },800);
    });
    var h=$(window).height();
    $(window).scroll(function() {
        var scroH = $(this).scrollTop();
        var thh =scroH + h;
        if(isClick) return false;//点击切换时关闭滚动监听

        var theadLength = $(".mainBox").length;
        $(".det-tab li").removeClass("active");

        $(".mainBox").each(function(index, element) {
            var offsetTop = $(this).offset().top;
            if (index != theadLength - 1) {

                var offsetNextTop;
                if((device.indexOf('huoniao_iOS') > -1) && !(window.__wxjs_environment == 'miniprogram')){
                    offsetNextTop = $(".mainBox:eq(" + (index + 1) + ")").offset().top - 190;
                }else{
                    offsetNextTop = $(".mainBox:eq(" + (index + 1) + ")").offset().top - 120;
                }
                if (scroH < offsetNextTop) {
                    $(".det-tab li:eq(" + index + ")").addClass("active");
                    return false;
                }
            } else {
                $(".det-tab li:not(.fn-hide):last").addClass("active");
                return false;
            }
        });

    });


    /*调起大图 S*/
    var mySwiper = new Swiper('.bigBoxShow .bigSwiper', {pagination: {el:'.bigBoxShow .bigPagination',type: 'fraction',},loop: false})
    $(".com-list").delegate('.picbox img', 'click', function() {
        var imgBox = $(this).parents(".picbox").find("img");
        var i = $(imgBox).index(this);
        $(".bigBoxShow .swiper-wrapper").html("");
        for(var j = 0 ,c = imgBox.length; j < c ;j++){
            $(".bigBoxShow .swiper-wrapper").append('<div class="swiper-slide"><div class="swiper-img"><img src="' + imgBox.eq(j).attr("src") + '" / ></div></div>');
        }
        mySwiper.update();
        $(".bigBoxShow").css({
            "z-index": 999999,
            "opacity": "1"
        });
        mySwiper.slideTo(i, 0, false);
        return false;
    });

    $(".bigBoxShow").delegate('.vClose', 'click', function() {
        $(this).closest('.bigBoxShow').css({
            "z-index": "-1",
            "opacity": "0"
        });

    });
    /*调起大图 E*/

    // 规格弹窗 图片切换
    var guigeSwiper = new Swiper('.guigeBoxShow .guigeSwiper',{
        pagination:{el:'.guigeBoxShow .guigePagination',type: 'fraction',},
        loop: false,
        on: {
            slideChangeTransitionEnd: function(){
                var acIndex = this.activeIndex;
                $('.speColor li').eq(acIndex).addClass('active').siblings('li').removeClass('active');
                var nSrc = $('.speColor li').eq(acIndex).find('img').attr('src');
                $('.color-info-img img').attr('src',nSrc);
                $('.color-info-img img').attr('data-src',nSrc);
            },
        }
    })
    $('#color-main .color-info-img').off('click').click(function(){
        var imgSrc = $(this).find('img').attr('src');
        var i;
        if($('.speColor').size() > 0){
            var imgBox = $(".speColor").find("li");
            $(".guigeBoxShow .swiper-wrapper").html("");
            imgBox.each(function(){
                var trc = $(this).find('img').attr('src');
                if(imgSrc == trc){
                    i = $(this).index();
                }
            })
            for(var j = 0 ,c = imgBox.length; j < c ;j++){
                $(".guigeBoxShow .swiper-wrapper").append('<div class="swiper-slide"><div class="swiper-img"><img onerror="this.src=\''+wxconfig.imgUrl+'\'" src="' + imgBox.eq(j).find('img').attr("src") + '" / ></div><div class="pjDetail">' + imgBox.eq(j).text()+ '</div></div>');
            }
            guigeSwiper.update();
            $(".guigeBoxShow").css({
                "z-index": 99999999,
                "opacity": "1"
            });
            guigeSwiper.slideTo(i, 0, false);
            return false;

        }
    })

    $(".guigeBoxShow").delegate('.vClose', 'click', function() {
        $(this).closest('.guigeBoxShow').css({
            "z-index": "-1",
            "opacity": "0"
        });

    });

    // 店铺推荐
    $('.sbotab li').click(function() {
        $(this).addClass('active').siblings().removeClass('active')
        var index = $(this).index();
        $('.sbocon').eq(index).addClass('sbshow').siblings().removeClass('sbshow');
    });

    // 选择颜色、尺码
    var myscroll = null;
    $('body').delegate('.btn-guige', 'click', function(event) {
        $('.mask').css({'opacity':'1','z-index':'100000'});

        $('.color-box').addClass('sizeShow').show();
        $('.closed').removeClass('sizeHide');
        $('.color-footer-select').removeClass('dn').siblings().addClass('dn');
        // if(myscroll == null){
        //     myscroll = new iScroll("color-main", {vScrollbar: false,});
        // }
    });
    //if(myscroll == null){
    //myscroll = new iScroll("scrollbox", {vScrollbar: false,});
    //}

    // 关闭规格弹出层
    $('.mask, .closed').click(function(){
        $('.mask').css({'opacity':'0','z-index':'-1'});
        $('.color-box').removeClass('sizeShow');
        $('.sku').removeClass('active')
    })

    // 获取评论
    var combox = $('.comment-box ul');
    getComment();
    function getComment(filter){
        $('.comment-box .cotmorebox').hide();
        combox.html('<div class="loading"><span></span><span></span><span></span><span></span><span></span></div>');
        var data = [];
        filter = filter || '';
        data.push('aid='+detailID);
        data.push('filter='+filter);
        $.ajax({
            url: "/include/ajax.php?service=member&action=getComment&type=shop-order&pageSize=2",//&pageSize=8
            data : data.join("&"),
            type: "GET",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    var list = data.info.list,pageinfo = data.info.pageInfo,page = pageinfo.page,html = [];
                    var totalCount = pageinfo.totalCount;
                    var hp = 0, zp = 0, cp = 0;
                    for(var i = 0; i < list.length; i++){
                        var info = list[i];
                        var nickname = info.user.nickname;
                        var photo = info.user.photo == "" ? staticPath+'images/noPhoto_40.jpg' : info.user.photo;
                        rat = parseInt(info.rating);
                        //sco1 = rat/5*100;
                        //console.log(rat,sco1)
                        switch (rat) {
                            case 1:
                                hp++;
                                break;
                            case 2:
                                zp++;
                                break;
                            case 3:
                                cp++;
                                break;
                        }
                        // 图集
                        var pics = info.pics;
                        html.push('<li>');
                        html.push('<div class="headtop fn-clear">');
                        html.push('<div class="headImg"><img src="'+photo+'" alt=""></div>');
                        html.push('<div class="headInfo">');
                        html.push('<h2 class="headName">'+nickname+'</h2>');
                        html.push('<p>'+info.specation+'</p>');
                        html.push('</div>');
                        html.push('<div class="bottime">'+huoniao.transTimes(info.dtime, 2)+'</div>');
                        html.push('</div>');
                        html.push('<div class="main">');
                        html.push('<p>'+info.content+'</p>');
                        if(pics.length > 0){
                            html.push('<div class="mainPic">');
                            if(pics.length>3){
                                html.push('<span class="picNum">'+pics.length+'张</span>');
                            }
                            html.push('<div class="picbox">');
                            for(var m = 0; m < pics.length; m++){
                                html.push('<img src="'+pics[m]+'">');
                            }
                            html.push('</div>');
                            html.push('</div>');
                        }
                        html.push('</div>');

                        html.push('</li>');
                    }


                    if(filter == ''){
                        $('.all').text(totalCount);
                        $('.hp').text(pageinfo.sco6);
                        $('.zp').text(pageinfo.sco7);
                        $('.cp').text(pageinfo.sco8);
                        //好评率
                        var hpl = ((pageinfo.sco6)/totalCount)*100;
                        $('.pjTop .hpl').text(parseFloat(hpl.toFixed(2))+'%')

                    }
                    $('.comment-box ul').html(html.join(""));
                    $('.comment-box .cotmorebox').show();

                }else {
                    //团购商品的详情
                    if((!$(".com-tab li.active").attr('data-type') || $(".com-tab li.active").attr('data-type') == 'undefined')){
                        $('.commentWrap .com-tab').hide();
                        $('.commentWrap .comment-box').hide();
                        $('.comment-box .cotmorebox').hide();
                        $('.commentWrap .pjTop h3').addClass('nopj').html('还没有相应评价哦');

                    }else{
                        $('.comment-box .cotmorebox').hide();
                        $('.comment-box ul').html('<div class="loading">'+data.info+'</div>');

                        // $('.commentWrap .com-tab').hide();
                        // $('.commentWrap .comment-box').hide();
                        // $('.comment-box .cotmorebox').hide();
                        // $('.commentWrap .pjTop h3').addClass('nopj').html('还没有相应评价哦');
                    }

                }
            },
            error: function(){
                $('.comment-box .cotmorebox').hide();
                $('.comment-box ul').html('<div class="loading">'+langData['siteConfig'][20][227]+'</div>');
            }
        })
    }


    var nowDate = -1;
    getCountDown();
    setInterval(getCountDown,1000)
    function getCountDown(){
        $(".time_each").each(function(){
            var t = $(this);
            if(nowDate==-1){
                nowDate = t.find('.time_show').attr('data-now');
            }
            endtime = t.find('.time_show').attr('data-time');
            var countTime = Number(endtime) - Number(nowDate)  ;
            if(countTime<=0){
                countTime = 0;
                clearInterval(getCountDown)
            }
            var days = parseInt(countTime / 60 / 60 / 24 , 10); //计算剩余的天数
            var hours = parseInt(countTime / 60 / 60 % 24 , 10); //计算剩余的小时
            var minutes = parseInt(countTime / 60 % 60, 10);//计算剩余的分钟
            var seconds = parseInt(countTime % 60, 10);//计算剩余的秒数
            t.find('.time_show').text("剩余"+(hours>9?hours:"0"+hours)+":"+(minutes>9?minutes:"0"+minutes)+":"+(seconds>9?seconds:"0"+seconds))

        });
        nowDate ++;
    }



    // 倒计时
    var eday = 3;


    var timer_people = setInterval(function(){
        cutDownTime($('.people .jsTime'));

    },1000) ;

    var timer_kan = setInterval(function(){
        cutDownTime($('.kanprocess .jsTime'));

    },1000) ;

    var timer_miaosha = setInterval(function(){
        cutDownTime($('.rtime .jsTime'));

    },1000)

    // timeOffset  是服务器和本地时间的时间差
    function cutDownTime(dom){
        //timer = setInterval(function(){
        var end = dom.attr("data-time")*1000;  //点击的结束抢购时间的毫秒数
        var newTime = Date.parse(new Date()) - timeOffset;  //当前时间的毫秒数
        var youtime = end - newTime; //还有多久时间结束的毫秒数
        if(youtime <= 0){
            if(dom.parents('.people').size()>0){
                clearInterval(timer_people);
                return;
            }else if(dom.parents('.kanprocess').size()>0){
                clearInterval(timer_kan);
                return;
            }

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
    /****************团购详情新增 2021-11-8 *********************/
    //地址跳转
    if($('.appMapBtn').size() > 0){
        $('.appMapBtn').attr('href', OpenMap_URL);
        var userLng = userLat = '';
        // 定位
        var localData = utils.getStorage('user_local');
        if(localData){
            userLat = localData.lat;
            userLng = localData.lng;
            if(userLng!='' && userLat!='' && pageData.lng !='' && pageData.lat !=''){
                calcJuli();
            }
            gettuanList();
        }else{
            HN_Location.init(function(data){
                if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
                    showErrAlert(langData['siteConfig'][27][136]);
                    gettuanList();
                }else{
                    userLng = data.lng;
                    userLat = data.lat;
                    if(userLng!='' && userLat!='' && pageData.lng !='' && pageData.lat !=''){
                        calcJuli();
                    }
                    gettuanList();
                }
            })
        }
        function calcJuli(){
            $.ajax({
                "url": "/include/ajax.php?service=waimai&action=getroutetime&originlng="+userLng+"&originlat="+userLat+"&destinationlng="+pageData.lng+"&destinationlat="+pageData.lat,
                "dataType": "json",
                async:false,
                "success": function(data){
                  if(data && data.state == 100){
                    var info = data.info;
                    if(info.juli !=0 ){
                        $('.storeAdr .storeJuli').html(info.juli+'km').show();
                    }
                  }
                }
            });
        }



    }
    //其他须知
    if($('.otNoteCon').size() >0){
        var h1 = $('.otNoteCon .otNote').height();
        var h2 = $('.otNoteCon .otNote div').height();
        if(h2 > h1){
            $('.otNoteCon .seeOtnote').css('display','block');
        }else{
            $('.otNoteCon .otNote').css('height',h2+'px');
        }
        //查看更多
        $('.otNoteCon .seeOtnote').click(function(){
            if(!$(this).hasClass('hst')){
                $('.otNoteCon .otNote').css('height',h2+'px');
                $(this).html('收起<i></i>').addClass('hst');
            }else{
                $('.otNoteCon .otNote').css('height',h1+'px');
                $(this).html('查看更多<i></i>').removeClass('hst');
            }

        })
    }

    //过期退弹窗
    $('.bo_info .tuiType').click(function(){
        $('.tkcomMak').show();
        $('.tkAlert').addClass('tkshow');
    })
    //关闭弹窗
    $('.tkcomMak,.tkAlert .tkFinish').click(function(){
        $('.tkcomMak').hide();
        $('.tkAlert').removeClass('tkshow');
    })


    //初始加载
    var tload = false,atpage = 1;
    if($('.tuanTj').size() > 0){//团购商品
        $(window).scroll(function() {
            var scrolls = $(window).scrollTop();
            var allh = $('body').height();
            var w = $(window).height();
            var scroll = allh - w;
            if ((scrolls + 50) > scroll && !tload) {
                // atpage++;
                gettuanList();
            };
        })

    }else{//电商商品

        $(window).scroll(function() {
            var scrolls = $(window).scrollTop();
            var allh = $('body').height();
            var w = $(window).height();
            var scroll = allh - w;
            if ((scrolls + 50) > scroll && !isload) {
                // atpage++;
               getList();
            };
        })
        
    }
    function gettuanList(tr){
        if(tload) return false;
        tload = true;
        //如果进行了筛选或排序，需要从第一页开始加载
        if(tr){
            atpage = 1;
            $(".proList ul").html("");
        }
        $(".proList  .loading").remove();
        $(".proList").append('<div class="loading">加载中~</div>');

        //请求数据
        var data = [];
        data.push("pageSize=10");
        data.push("page="+atpage);
        $.ajax({
            url: "/include/ajax.php?service=shop&action=slist&pagetype="+pagetype+"&moduletype="+moduletype,
            data: data.join("&"),
            type: "GET",
            dataType: "json",
            success: function (data) {

                if(data && data.state == 100){
                    $(".proList .loading").remove();
                    var list = data.info.list, lr, html1 = [],html2=[];
                    var html3 = [],html4=[];//用于分类页面的4个商品
                    if(list.length > 0){
                        for(var i = 0; i < list.length; i++){
                            lr = list[i];
                            var html=[];
                            var pic = lr.litpic == false || lr.litpic == '' ? '/static/images/blank.gif' : lr.litpic;
                            var specification = lr.specification;
                            html.push('<li class="pro_li tc_li">');
                            html.push(' <a href="'+lr.url+'">');
                            html.push('     <div class="goodImg"><img src="'+pic+'" alt="" onerror="this.src=\'/static/images/404.jpg\'">');
                            html.push('     </div>');
                            html.push('     <div class="goodInfo">');
                            html.push('      <h2 class="goodTitle">'+lr.title+'</h2>');
                            html.push('    <div class="goodSale">');
                            if(lr.sales > 0){

                                html.push('      <span>已售'+lr.sales+'</span>');
                                html.push('      <em></em>');
                            }
                            html.push('      <span>2.5km</span>');
                            html.push('    </div>');
                            html.push('    <div class="goodPrice">');
                            var priArr = parseFloat(lr.price).toString().split('.');
                            var smallPoint = priArr.length > 1 ? '<em>.'+priArr[1]+'</em>' : '';
                            html.push('      <span class="newPrice">'+echoCurrency('symbol')+'<strong>'+priArr[0]+'</strong>'+smallPoint+'</span>');
                            if(parseFloat(lr.mprice) > parseFloat(lr.price)){

                             html.push('      <span class="oldPrice">'+echoCurrency('symbol')+'<em>'+parseFloat(lr.mprice)+'</em></span>');
                            }
                            html.push('    </div>  ');
                            html.push('  </div>');
                            html.push('</a></li>');

                              if(i % 2 == 0){
                                html1.push(html.join(""))
                              }else{
                                html2.push(html.join(""))
                              }

                            //listArr[lr.id] = lr;
                        }
                        $(".tuanTj .proList ul.proUl").eq(0).append(html1.join(""));
                        $(".tuanTj .proList ul.proUl").eq(1).append(html2.join(""));
                        tload = false;
                        atpage++
                        //最后一页
                        if(atpage > data.info.pageInfo.totalPage){
                            tload = true;
                            $(".proList").append('<div class="loading">'+langData['siteConfig'][57][5]+'</div>');
                        }
                    //没有数据
                    }else{
                        tload = true;
                        $(".proList").append('<div class="loading">'+langData['siteConfig'][20][126]+'</div>');
                        if($(".goodlist li").length == 0){
                            $(".other ").addClass('fn-hide');
                            $(".det-tab li:last").addClass("fn-hide")
                        }
                    }

                //请求失败
                }else{
                    $(".proList .loading").html(data.info);
                    if($(".goodlist li").length == 0){
                            $(".other ").addClass('fn-hide');
                            $(".det-tab li:last").addClass("fn-hide")
                        }
                }


            },
            error: function(){
                tload = false;
                $(".proList .loading").html(langData['siteConfig'][20][227]);
            }
        });
    }

    //电商商品--数据列表
    function getList(tr){
        if(isload) return false;
        isload = true;

        //如果进行了筛选或排序，需要从第一页开始加载
        if(tr){
            atpage = 1;
            $(".goodlist").html("");
        }
        $(".listbox loading").html('数据加载中~')
        // $(".goodlist .loading").remove();
        // $(".goodlist").append('<div class="loading">'+langData['siteConfig'][20][184]+'...</div>');

        //请求数据
        var data = [];
        data.push("pageSize="+pageSize);
        data.push("page="+atpage);

        $.ajax({
            url: "/include/ajax.php?service=shop&action=slist&rec=1&pagetype="+pagetype+"&moduletype="+moduletype,
            data: data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if(data){
                    if(data.state == 100){
                        

                        $(".listbox .loading").remove();
                        var list = data.info.list, lr, html = [];
                        var html1 = [],html2 = [];
                         if(list.length > 0){
                        for(var i = 0; i < list.length; i++){
                            lr = list[i];
                            var html=[];
                             var tcs = '';
                              if(list[i].typesalesarr.indexOf('2') || list[i].typesalesarr.indexOf('3') ) {
                                  tcs = "<span>同城送</span>";
                              }
                            var pic = lr.litpic == false || lr.litpic == '' ? '/static/images/blank.gif' : lr.litpic;
                            var specification = lr.specification;
                            html.push('<li class="shopPro"><a href="'+list[i].url+'" class="proLink">');
                            html.push('<div class="pro_img"><img src="'+list[i].litpic+'" alt="" onerror="this.src=\'/static/images/404.jpg\'"></div>');
                            html.push('<div class="pro_info">');
                            html.push('<h4>'+list[i].title+'</h4>');
                          // html1.push('<p class="sale_info"><span>已售'+list[i].sales+'</span><em>|</em><span>2.5km</span></p>');
                          var price = list[i].price ? list[i].price : '';
                              price = parseFloat(price).toString()
                          var priceArr = price.split('.')
                            html.push('<div class="pro_price">');
                            html.push('<div class="price"><span class="symbol">'+echoCurrency("symbol")+'</span><span class="num">'+priceArr[0]+'<em>'+(priceArr.length > 1 ? "." + priceArr[1] : "")+'</em></span></div>');
                          if(list[i].sales > 0){
                            html.push('<span class="sale">'+list[i].sales+'件已售</span>');
                          }
                            html.push('</div><p class="sale_lab">'+tcs+(list[i].youhave?"<span>包邮</span>":"")+'</p>');
                            html.push('</div></a></li>');

                              if(i % 2 == 0){
                                html1.push(html.join(""))
                              }else{
                                html2.push(html.join(""))
                              }

                            //listArr[lr.id] = lr;
                        }
                         $(".listbox .goodlist").eq(0).append(html1.join(""));
                         $(".listbox .goodlist").eq(1).append(html2.join(""));
                        isload = false
                        atpage++
                        //最后一页
                        if(atpage > data.info.pageInfo.totalPage){
                            isload = true;
                            $(".listbox").append('<div class="loading">'+langData['siteConfig'][57][5]+'</div>');
                        }
                    //没有数据
                    }else{
                        isload = true;
                        $(".listbox").append('<div class="loading">'+langData['siteConfig'][20][126]+'</div>');
                        if($(".goodlist li").length == 0){
                            $(".other ").addClass('fn-hide');
                            $(".det-tab li:last").addClass("fn-hide")
                        }
                    }

                        //请求失败
                    }else{
                        if($(".goodlist li").length == 0){
                            $(".other ").addClass('fn-hide');
                            $(".det-tab li:last").addClass("fn-hide")
                        }
                        $(".goodlist").next('.morebox').remove();
                        $(".loading").html(data.info);
                    }

                    //加载失败
                }else{
                    if($(".goodlist li").length == 0){
                        $(".other ").addClass('fn-hide');
                        $(".det-tab li:last").addClass("fn-hide")
                    }
                    $(".goodlist").next('.morebox').remove();
                    $(".loading").html(langData['siteConfig'][20][462]);
                }
            },
            error: function(){
                isload = false;
                $(".goodlist").next('.morebox').remove();
                $(".loading").html(langData['siteConfig'][20][227]);
            }
        });
    }


})
