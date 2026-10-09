$(function(){


    var isload = false,page=1,pageSize=3;

    // 筛选评价
    $('.com-tab li').click(function(){
        var filter = $(this).attr('data-type') || '';
        $(this).addClass('active').siblings().removeClass('active');
        getComment(filter,1)
    })

	/*调起大图 S*/
   var mySwiper = new Swiper('.bigBoxShow .bigSwiper', {pagination: {el:'.bigBoxShow .bigPagination',type: 'fraction',},loop: false})
    $(".com-list").delegate('.picbox img', 'click', function() {
        var trc = $(this).attr("src");
        var imgBox = $('.imgWrap').find("img");
        var i = $('.imgWrap img[data-src="'+trc+'"]').attr('data-id');
        console.log(i)

        $(".bigBoxShow .swiper-wrapper").html("");
        for(var j = 0 ,c = imgBox.length; j < c ;j++){
         $(".bigBoxShow .swiper-wrapper").append('<div class="swiper-slide"><div class="swiper-img"><img src="' + imgBox.eq(j).attr("src") + '" / ></div><div class="pjDetail"><p>' + imgBox.eq(j).attr("data-text")+ '</p><em class="zk">展开<s></s></em></div></div>');
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

    //展开收起
    $('.bigBoxShow').delegate('.zk', 'click', function() {
        var par = $(this).closest('.pjDetail')
        if(!par.hasClass('active')){
            par.addClass('active');
            $(this).html('收起<s></s>');
        }else{
            par.removeClass('active');
            $(this).html('展开<s></s>');
        }
    })
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
            $(".guigeBoxShow .swiper-wrapper").append('<div class="swiper-slide"><div class="swiper-img"><img src="' + imgBox.eq(j).find('img').attr("src") + '" / ></div><div class="pjDetail">' + imgBox.eq(j).text()+ '</div></div>');
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


  // 选择颜色、尺码
    var myscroll = null;
    $('body').delegate('.btn-guige', 'click', function(event) {
        $('.mask').css({'opacity':'1','z-index':'100000'});
        $('.color-box').addClass('sizeShow').show();
        $('.closed').removeClass('sizeHide');
        // if(myscroll == null){
        //     myscroll = new iScroll("color-main", {vScrollbar: false,});
        // }
    });

    // 关闭规格弹出层
    $('.mask, .closed').click(function(){
          $('.mask').css({'opacity':'0','z-index':'-1'});
          $('.color-box').removeClass('sizeShow');
    })
    //滚动加载
    $(window).scroll(function(){
        var allh = $('body').height();
        var w = $(window).height();
        var s_scroll = allh - w - 100;
        if ($(window).scrollTop() > s_scroll && !isload) {
            page++;
            var filter = $('.com-tab li.active').attr('data-type') || '';
            getComment(filter,'');

        }
    })

    // 获取评论
    var combox = $('.comment-box ul');
    getComment('',1);
    function getComment(filter,tr){
        isload = true;
        if(tr){
          page = 1;
          combox.html('');
        }
        $('.loading').remove();
        combox.append('<div class="loading"><span></span><span></span><span></span><span></span><span></span></div>');
        var data = [];
        filter = filter || '';
        data.push('aid='+detailID);
        data.push('filter='+filter);
        data.push('page='+page);
        data.push('pageSize='+pageSize);
        $.ajax({
            url: "/include/ajax.php?service=member&action=getComment&type=shop-order",//&pageSize=8
            data : data.join("&"),
            type: "GET",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    $('.loading').remove();
                    var list = data.info.list,pageinfo = data.info.pageInfo,page = pageinfo.page,html = [];
                    var totalCount = pageinfo.totalCount;

                    if(filter == ''){
                    	$('.all').text(totalCount);
                        $('.hp').text(pageinfo.sco6);
                        $('.zp').text(pageinfo.sco7);
                        $('.cp').text(pageinfo.sco8);
                        $('.sp').text(pageinfo.pic);

                        //好评率
                        var hpl = ((pageinfo.sco6*1)/totalCount)*100;
                        $('.pjTop .hpl').text(hpl.toFixed(2)+'%')

	                }

                    for(var i = 0; i < list.length; i++){
                        var info = list[i];
                        var nickname = info.user.nickname;
                        var photo = info.user.photo == "" ? staticPath+'images/noPhoto_40.jpg' : info.user.photo;
                        
                        // 图集
                        var pics = info.pics;
                        html.push('<li>');
                        html.push('<div class="headtop fn-clear">');
                        html.push('<div class="headImg"><img src="'+photo+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>');
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
                            var imgCla = '';
                            if(pics.length == 1){
                                imgCla ='imgb1'
                            }else if(pics.length == 2){
                                imgCla ='imgb2'
                            }else if(pics.length >= 3){
                                imgCla ='imgb3'
                            }
                            html.push('<div class="picbox '+imgCla+'">');
                            for(var m = 0; m < pics.length; m++){
                                html.push('<img src="'+pics[m]+'">');
                            }
                            html.push('</div>');
                            html.push('</div>');
                        }
                        html.push('</div>');

                        html.push('</li>');
                    }

                    $('.comment-box ul').append(html.join(""));
                    var imgHtml = [];
                    var ss = 0 ;
                    $('.picbox').each(function(){
                        var ttx = $(this).closest('.main').find('p').text();
                        $(this).find('img').each(function(){
                            var src = $(this).attr('src');
                            imgHtml.push('<img src="'+src+'" data-text="'+ttx+'" data-id="'+ss+'" data-src="'+src+'">');
                            ss++;
                        })


                    })
                    $('.imgWrap').html(imgHtml.join(""))

                    isload = false;
                    //最后一页
                    if(page >= data.info.pageInfo.totalPage){
                        isload = true;
                        combox.append('<div class="loading">已加载全部评论</div>');
                    }

                }else {

                    $('.comment-box ul .loading').html(data.info);
                }
            },
            error: function(){
                isload = false;
                $('.comment-box ul .loading').html(langData['siteConfig'][20][227]);
            }
        })
    }


})
