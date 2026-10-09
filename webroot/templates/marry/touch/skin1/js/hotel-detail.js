$(function () {
    $('.appMapBtn').attr('href', OpenMap_URL);
    //放大图片
    $.fn.bigImage({
        artMainCon:".introBox",  //图片所在的列表标签
    });

  
    // 赞
    $('.btnUp').on('click',function(){
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            window.location.href = masterDomain+'/login.html';
            return false;
        }

        var t = $(this), id = t.attr("data-id");
        // if(t.hasClass("active")) return false;
        var num = t.find('em').html();
        if( typeof(num) == 'object') {
            num = 0;
        }
        var type = 'add';
        if(t.hasClass("active")){
            type = 'del';
            num--;
        }else{
            num++;
        }

        $.ajax({
            url: '/include/ajax.php?service=member&action=dingComment&id=' + id + "&type=" + type,
            type: "GET",
            dataType: "json",
            success: function (data) {
                if(data.state==100){
                    if(t.hasClass("active")){
                        t.removeClass('active');
                    }else{
                        t.addClass('active');
                    }
                    t.find('em').html(num);
                }else{
                    alert(data.info);
                    t.removeClass('active');
                }
            }
        });
    })

    // 轮播图
    $('.markBox').find('a:first-child').addClass('curr');
    new Swiper('.topSwiper .swiper-container', {pagination: {el: '.topSwiper .swiper-pagination',type: 'fraction',} ,loop: false,grabCursor: true,paginationClickable: true,
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

    //猜你喜欢
    getLike();
    function getLike(){
        var data = [];
        data.push("page=1");
        data.push("pageSize=2");
        data.push("istype=1");
        $.ajax({
            url: "/include/ajax.php?service=marry&action=storeList&filter=8&"+data.join("&"),
            type: "GET",
            dataType: "json",
            success: function (data) {

                if(data && data.state == 100){
                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    for (var i = 0; i < list.length; i++) {
                        html.push('<li class="fn-clear">');
                        html.push('<a href="'+list[i].url+'" data-url="'+list[i].url+'">');
                        var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";
                        html.push('<div class="img"><img src="'+pic+'" alt=""></div>');
                        html.push('<div class="info">');
                        html.push('<p class="name">'+list[i].title+'</p>');
                        html.push('<p class="type">'+list[i].typename+'<em>|</em>0-10桌</p>');
                        if(list[i].flagAll!=''){
                            html.push('<p class="tip">');
                            for(var m=0;m<list[i].flagAll.length;m++){
                                var className = '';
                                if(m==0){
                                    className = 'dt';
                                }else if(m==1){
                                    className = 'dl';
                                }else if(m==2){
                                    className = 'gg';
                                }
                                if(m>2) break;
                                html.push('<span class="'+className+'">'+list[i].flagAll[m].jc+'</span>');
                            }
                            html.push('</p>');
                        }
                        var newPrice = list[i].pricee.split('.');
                        if(newPrice[1]==0){
                            newPrice = newPrice[0];
                        }else{
                            newPrice = list[i].pricee;
                        }
                        var adrLen = list[i].addrname.length;
                        html.push('<p class="area">'+list[i].addrname[adrLen-2]+' <span class="price"><strong>'+echoCurrency('symbol')+newPrice+'</strong><i>/'+langData['marry'][5][25]+'</i><em>'+langData['marry'][5][40]+'</em></span></p>');
                        html.push('</div>');
                        html.push('</a>');
                        html.push('</li>');
                    }
                    $(".like .loading").remove(); 
                    $(".like ul").html(html.join(""));
                }else{

                    $(".like .loading").html('<span>'+data.info+'</span>');
                }
            },
            error: function(){
                //网络错误，加载失败
                $(".like .loading").html('<span>'+langData['marry'][5][23]+'</span>');
            }
        });
    }
     //国际手机号获取
    getNationalPhone();
    function getNationalPhone(){
        $.ajax({
            url: "/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'json',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   var listLen = list.length;
                   var codeArea = list[0].code;
                   if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        $('.areacode_span').closest('li').hide();
                        return false;
                   }
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li><span>'+list[i].name+'</span><em class="fn-right">+'+list[i].code+'</em></li>');
                   }
                   $('.layer_list ul').append(phoneList.join(''));
                }else{
                   $('.layer_list ul').html('<div class="loading">'+langData['siteConfig'][21][64]+'</div>');//暂无数据！
                  }
            },
            error: function(){
                    $('.layer_list ul').html('<div class="loading">'+langData['siteConfig'][20][486]+'</div>');//加载失败！
                }

        })
    }
    // 打开手机号地区弹出层
    $(".areacode_span").click(function(){
        $('.layer_code').show();
        $('.mask-code').addClass('show');
    })
    // 选中区域
    $('.layer_list').delegate('li','click',function(){
        var t = $(this), txt = t.find('em').text();
        var par = $('.formCommon')
        var arcode = par.find('.areacode_span')
        arcode.find("label").text(txt);
        par.find(".areaCodeinp").val(txt.replace("+",""));

        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function(){
        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    //立即预约
    //预约弹窗弹出
    $('.seeStore').click(function(e){
        $('.order_mask').show();
        return false;

    })
    // 立即预约 表单验证
    $('.btns .sure').click(function(){
        var f = $(this);  
        var txt = f.text();      
        var name = $('#order_name').val(), 
            tel = $('#order_phone').val();  
        if(f.hasClass("disabled")) return false;
        var par = f.closest('.formCommon');
        var areaCodev = par.find('.areaCodeinp').val();
        if (!name) {

            $('.name-1').show();
            setTimeout(function(){$('.name-1').hide()},1000);

        }else if (!tel) {

            $('.phone-1').show();
            setTimeout(function(){$('.phone-1').hide()},1000);

        }else {
            f.addClass("disabled").text(langData['renovation'][14][58]);//预约中...
            var data = [];
            data.push("bid="+storeId);//公司id
            data.push("people="+name);
            data.push("areaCode="+areaCodev);
            data.push("contact="+tel);
            data.push("comtype=2");
          
            $.ajax({
                url: "/include/ajax.php?service=marry&action=sendRese",
                data: data.join("&"),
                type: "POST",
                dataType: "json",
                success: function (data) {
                    f.removeClass("disabled").text(txt);//
                    if(data && data.state == 100){
                        $('.order_mask').hide();
                        $('.order_mask2').show();
                        
                    }else{
                        alert(data.info);
                    }
                },
                error: function(){
                    alert(langData['renovation'][14][90]);//预约失败，请重试！
                    f.removeClass("disabled").text(txt);//
                }
            });
        }
    })

    // 立即预约关闭
     $('.btns .cancel').click(function(){
        $('.order_mask').hide();
   
     })
     $('.order_mask2 .t3').click(function(){
        $('.order_mask2').hide();
   
     })


});