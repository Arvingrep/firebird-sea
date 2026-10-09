$(function(){
    $('.navbar a:last-child').css('margin-right','0')
    $('.strategy-list li:last-child').css('margin-right','0')
    $('.video-list li:last-child').css('margin-right','0')
	
    // 焦点图 banner
    $(".slideBox1").slide({titCell:".hd ul",mainCell:".bd .slideobj",effect:"leftLoop",autoPlay:true,autoPage:"<li></li>"});

    // 搜索头部样式
    $('.search-top li').click(function(){
        $(this).addClass('active').siblings().removeClass('active');
        var dtype = $(this).data('type');
        var sTxt = '',dTxt = '';
        if(dtype == 'strategy'){
            sTxt = langData['travel'][14][50];  //搜索目的地
            dTxt = langData['travel'][14][51];  //输入您想去的目的地
        }else if(dtype == 'store'){
            sTxt = langData['travel'][14][52];  //搜索旅行社
            dTxt = langData['travel'][14][53];  //输入旅行社名称
        }else if(dtype == 'rentcar'){
            sTxt = langData['travel'][14][54];  //搜索租车
            dTxt = langData['travel'][14][55];  //输入您想租的车
        }else{
            sTxt = langData['travel'][14][46];  //搜索酒店
            dTxt = langData['travel'][14][56];  //输入酒店名
        }
        $('.searchBtn').html(sTxt);
        $('#keywords').attr('placeholder',dTxt)
    })

    $(".searchBtn").bind('click', function () {
        var a = $(".search-top .active a");       
        var keywords = $("#keywords"), txt = $.trim(keywords.val());
        if(txt != ""){
            var href = a.attr("data-href");
            if(href != ""){
                location.href = href + (href.indexOf("?") > -1 ? "&" : "?") + "keywords="+txt;
            }
        }else{
            keywords.focus();
        }
    })


    //回车搜索
    $("#keywords").keyup(function (e) {
        if (!e) {
            var e = window.event;
        }

        if (e.keyCode === 13) {
            $(".searchBtn").click();
        }
    });

    // 跟团游--焦点图
    var swiperNav = [], mainNavLi = $('.slideBox2 .bd').find('li');
    for (var i = 0; i < mainNavLi.length; i++) {
        swiperNav.push($('.slideBox2 .bd').find('li:eq('+i+')').html());
    }
    var liArr = [];
    for(var i = 0; i < swiperNav.length; i++){
        liArr.push(swiperNav.slice(i, i + 3).join(""));
        i += 2;
    }

    $('.slideBox2 .bd').find('ul').html('<li>'+liArr.join('</li><li>')+'</li>');
    $(".slideBox2").slide({titCell:".hd ul", mainCell:".bd ul",effect:"leftLoop", autoPage:"<li></li>",autoPlay: true});
    // $('.slideBox2 .bd li a:last-child').css('margin-right','0')
      // 鼠标经过产品列表
    $('.buss-list li').hover(function () {
		$(this).find('.move-info').hide();
        $(this).find('.see').addClass('show');
    },function () {
        $(this).find('.move-info').show();
        $(this).find('.see').removeClass('show');
    });

})
