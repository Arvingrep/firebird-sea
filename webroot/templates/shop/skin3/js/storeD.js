var showAlertErrTimer;
function showErrAlert(data) {
  showAlertErrTimer && clearTimeout(showAlertErrTimer);
  $(".popErrAlert").remove();
  $("body").append('<div class="popErrAlert"><p>' + data + '</p></div>');
  $(".popErrAlert p").css({
    "margin-left": -$(".popErrAlert p").width() / 2,
    "left": "50%"
  });
  $(".popErrAlert").css({
    "visibility": "visible"
  });
  showAlertErrTimer = setTimeout(function() {
    $(".popErrAlert").fadeOut(300, function() {
      $(this).remove();
    });
  }, 1500);
}
$(function () {
  showPageInfo()


    //导航全部分类
    $(".lnav").find('.category-popup').hide();

    $(".lnav").hover(function(){
        $(this).find(".category-popup").show();
    }, function(){
        $(this).find(".category-popup").hide();
    });
    $('.type span').click(function () {
        $(this).addClass('curr');
        $(this).siblings().removeClass('curr');
    });

    // 筛选
    $('.searchType').click(function(event) {
      /* Act on the event */
      $('.typeSel').toggleClass('show')
    });
    $('.typeSel li').click(function(){
      var t = $(this),action = t.attr('data-action')
      $('.typetxt').html(t.text() +'<s></s>');
      $("#sform").attr('action', action)
    })
    //客服
    $('.qqkfu').hover(function () {
        $('.qqkfu_box').addClass('show');
    },function () {
        $('.qqkfu_box').removeClass('show');
    });
    $('.wxkfu').hover(function () {
        $('.wxkfu_box').addClass('show');
    },function () {
        $('.wxkfu_box').removeClass('show');
    });

    //二级导航
    $('.category-popup ul li').find('.sub-category').hide();
    $('.category-popup ul li').hover(function () {
        $(this).find('.ycate').addClass('on');
        $(this).find('.sub-category').show();
    },function () {
        $(this).find('.ycate').removeClass('on');
        $(this).find('.sub-category').hide();
    });

	//上传单张图片
    var uploadHolder;
	function mysub(id){
        var t = $("#"+id), p = t.parent(), uploadHolder = t.siblings('.imgsearch-btn');

        var data = [];
        data['mod'] = 'shop';
        data['filetype'] = 'image';
        data['type'] = 'single';

        $.ajaxFileUpload({
          url: "/include/upload.inc.php",
          fileElementId: id,
          dataType: "json",
          data: data,
          success: function(m, l) {
            if (m.state == "SUCCESS") {
                var action = $('#sform').attr('action');
                location.href = action + '?image=' + m.url;
            } else {
              uploadError(m.state, id, uploadHolder);
            }
          },
          error: function() {
            uploadError("网络错误，请重试！", id, uploadHolder);
          }
      	});

	}

	function uploadError(info, id, uploadHolder){
		alert(info);
		uploadHolder.removeClass('disabled');
	}

	$(".imgsearch-btn").bind("click", function(){
		var t = $(this), inp = t.siblings("input");
		if(t.hasClass("disabled")) return;
		inp.click();
	})

	$("#Filedata_imgsearch").bind("change", function(){
		if ($(this).val() == '') return;
		$(this).siblings('.imgsearch-btn').addClass('disabled');
	    mysub($(this).attr("id"));
	})

    $('.imgsearch-holder').bind('click', function(){
        $(this).hide();
    });

    //侧边分类
    //$('.left .storeCategory ').find('.sub_category').hide();
    /* $('.left .storeCategory .icon_category').click(function () {
        var t=$(this);
        t.toggleClass('on');
        if(!t.hasClass("on")){
            $(this).siblings('.sub_category').hide();
        }else {
            $(this).siblings('.sub_category').show();
        }
    }); */

    // $('.storeCategory .partype').click(function () {
    //     var t = $(this);
    //     $('.right .allgoods').addClass('show');
    //     $('.right .shouypage').removeClass('show');
    //
    //     t.parent('li').siblings('li').children('.icon_category').removeClass('on');
    //     t.parent('li').siblings('li').children('.partype').removeClass('on');
    //     t.siblings('.icon_category').addClass('on');
    //     t.addClass('on');
    //     t.parent('li').siblings('li').children('.sub_category').children('a').removeClass('on');
    //     t.siblings('.sub_category').children('a').removeClass('on');
    //     if(t.hasClass("on")){
    //         t.parent('li').siblings('li').children('.sub_category').hide();
    //         t.siblings('.sub_category').show();
    //     }
    //     $('html, body').animate({scrollTop: $('#contain').offset().top}, 500);
    //     getList(1);
    //
    // });

    $('.storeCategory .sub_category a').click(function () {
        var t = $(this);
        $('.right .allgoods').addClass('show');
        $('.right .shouypage').removeClass('show');
        t.siblings().removeClass('on');
        t.addClass('on');
        $('html, body').animate({scrollTop: $('#contain').offset().top}, 500);
        getList(1);
    });



    //顶部图片轮播
    $(".adbox .slideBox").slide({mainCell:".bd ul",effect:"left",autoPlay:true, autoPage:'<li></li>', titCell: '.hd ul'});
    $('.cartOpen').click(function(){
      $(".topcart").click();
    })
    //收藏
    $(".soucang,.gz").bind("click", function(){
        var t = $(this), type = "add", oper = "+1", txt = "已关注";

        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            huoniao.login();
            return false;
        }

        if(!t.hasClass("has")){
            t.addClass("has");
        }else{
            type = "del";
            t.removeClass("has");
            oper = "-1";
            txt = "关注店铺";
        }

        var $i = $("<b>").text(oper);
        var x = t.offset().left, y = t.offset().top;
        $i.css({top: y - 10, left: x + 17, position: "absolute", "z-index": "5000", color: "#E94F06"});
        $("body").append($i);
        $i.animate({top: y - 50, opacity: 0, "font-size": "2em"}, 2000, function(){
            $i.remove();
        });

        $(".soucang,.gz").html("<s></s>"+txt);
        $.post("/include/ajax.php?service=member&action=collect&module=shop&temp=store-detail&type="+type+"&id="+id);
        showErrAlert(type=='del'?"已取消关注" : "已成功关注");

    });

    //搜索
    $("#search").bind("click", function(){
        var keywords = $.trim($("#keywords").val()), price1 = $.trim($("#price1").val()), price2 = $.trim($("#price2").val());
        if (price1 && price2 && parseInt(price1) > parseInt(price2)) {
            alert('价格上限应该大于下限');return false;
        }
        $('.right .allgoods').addClass('show');
        $('.right .shouypage').removeClass('show');
        $('html, body').animate({scrollTop: $('#contain').offset().top}, 500);
        $("#contain").addClass('allbox');
        $('.storeD_left').hide();
        $('.navShow li').eq(1).addClass('on').siblings('li').removeClass('on')
        getList(1);
    });

    var locSearch = window.location.search;
    if(locSearch.indexOf('keywords') > -1){
      $("#search").click();
    }
    //搜索
    $("#searchbtn").bind("click", function(){
        var price1 = $.trim($("#price3").val()), price2 = $.trim($("#price4").val());
        if (price1 && price2 && parseInt(price1) > parseInt(price2)) {
            alert('价格上限应该大于下限');return false;
        }
        $('html, body').animate({scrollTop: $('#contain').offset().top}, 500);
        getList(1);
    });

    // 侧边栏列表切换
    $('.left .storeCategory .all').click(function () {
        $('.right .allgoods').addClass('show');
        $('.right .shouypage').removeClass('show');
        $('.left .storeCategory .partype').removeClass('on');
        $('.left .storeCategory .icon_category').removeClass('on');
        $('.left .storeCategory .sub_category').hide();
        $('.left .storeCategory .sub_category').children('a').removeClass('on');
        $('html, body').animate({scrollTop: $('#contain').offset().top}, 500);
        getList(1);
    });
    $('.nav .sypagebtn').click(function () {
        $('.right .allgoods').removeClass('show');
        $('.right .shouypage').addClass('show');
    });

    // 鼠标经过产品列表
    $('.right .list').on('mouseover','.itembox',function () {
        $(this).find('.name').hide();
        $(this).find('.btn').addClass('show');
    });
    $('.right .list').on('mouseleave','.itembox',function () {
        $(this).find('.name').show();
        $(this).find('.btn').removeClass('show');
    });

    if(typeid>0){
        $('.right .allgoods').addClass('show');
        $('.right .shouypage').removeClass('show');
    }





    //筛选排序
    $('.choose-tab').delegate('li', 'click', function() {
        $(this).addClass('active').siblings().removeClass('active');
        var $t = $(this), index = $t.index();
        if (index == 0) {
            $t.attr("data-id",'1');
        }else if(index==1){
            $t.attr("data-id",'4');
        }
        getList(1)
    });

    //数据列表
    getList(1);
    function getList(tr){

        //如果进行了筛选或排序，需要从第一页开始加载
        if(tr){
            atpage = 1;
            $(".list-box ul").html("");
        }

        $(".list-box .loading").remove();
        $(".list-box").append('<div class="loading"><span></span><span></span><span></span><span></span><span></span></div>');

        //请求数据
        var data = [];
        data.push("pageSize="+pageSize);
        data.push("page="+atpage);
        data.push("store="+storeid);

        var orderbyType = $('.choose-tab li.active').attr('data-id');
        if(orderbyType != undefined && orderbyType != ''){
            data.push("orderby="+orderbyType);
        }

        // 商品类别
        // $(".storeCategory li").each(function(){
        //     var t = $(this);
        //     if(t.find('.partype').hasClass('on')){
        //         typeid = t.find('.partype').attr('data-id');
        //         if(typeid != undefined && typeid != ''){
        //             data.push("storetype="+typeid);
        //         }
        //     }
        // });

        // typeid = $('.sub_category a.on').attr('data-id');
        if(typeid != undefined && typeid != ''){
            data.push("storetype="+typeid);
        }
        if(tid != undefined && tid != ''){
            data.push("storetype="+tid);
        }
        var keywords = $('#keywords').val();
        if(keywords != null && keywords != ''){
            data.push("title="+keywords);
        }

        var txt = $('#searchPro').val();
        if(txt != null && txt != ''){
            data.push("title="+txt);
        }
        var price1 = parseInt($.trim($('#price1').val()));
        var price2 = parseInt($.trim($('#price2').val()));

        var price3 = parseInt($.trim($('#price3').val()));
        var price4 = parseInt($.trim($('#price4').val()));

        price1 = isNaN(price1) ? '' : price1;
        price2 = isNaN(price2) ? '' : price2;

        price3 = isNaN(price3) ? '' : price3;
        price4 = isNaN(price4) ? '' : price4;

        if(price1 || price2){
            var price = price1 + ',' + price2;
            data.push("price="+price);
        }else if(price3 || price4){
            var price = price3 + ',' + price4;
            data.push("price="+price);
        }console.log(data);

        $.ajax({
            url: "/include/ajax.php?service=shop&action=slist",
            data: data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if(data){
                    if(data.state == 100){
                        $(".list-box .loading").remove();
                        var list = data.info.list, lr, html = [];
                        if(list.length > 0){
                            for(var i = 0; i < list.length; i++){
                                lr = list[i];
                                var pic = lr.litpic == false || lr.litpic == '' ? '/static/images/blank.gif' : lr.litpic;

                                html.push('<li class="itembox" data-id="'+lr.id+'"><div class="con"><a href="'+lr.url+'" target="_blank">');
                                html.push('<img src="'+(huoniao.changeFileSize(pic,440,440))+'" alt="">');
                                html.push('<p class="name">'+lr.title+'</p>');
                                html.push('<span>'+echoCurrency('symbol')+'<strong>'+lr.price+'</strong> </span>');//<em>优惠券</em>
                                html.push('<i class="btn">立即购买</i>');
                                html.push('</a></div></li>');

                            }

                            $(".list-box ul").append(html.join(""));
                            totalCount = data.info.pageInfo.totalCount;
                            //
                            showPageInfo();
                        }else{
                            $(".list-box").append('<div class="loading">'+langData['siteConfig'][20][126]+'</div>');
                        }

                        //请求失败
                    }else{
                        $(".list-box .loading").html(data.info);
                        $(".pagination").html('').hide();
                    }
                    //加载失败
                }else{
                    $(".list-box .loading").html(langData['siteConfig'][20][462]);
                    $(".pagination").html('').hide();
                }
            },
            error: function(){
                $(".list-box .loading").html(langData['siteConfig'][20][227]);
                $(".pagination").html('').hide();
            }
        });
    }
    //翻页
    $("#bar-area .pagination").delegate("a", "click", function(){
        var cla = $(this).attr("class");
        if(cla == "pg-prev"){
            atpage -= 1;
        }else{
            atpage += 1;
        }
        $("#mod-item .list").empty();
        getList();
    });

    //打印分页
    function showPageInfo() {
        var info = $("#mod-item .pagination");
        var nowPageNum = atpage;
        var allPageNum = Math.ceil(totalCount/pageSize);
        var pageArr = [];

        info.html("").hide();

        var pageList = [];
        //上一页
        if(atpage > 1){
            pageList.push('<a href="javascript:;" class="pg-prev"><i class="trigger"></i><span class="text"></span></a>');
        }else{
            pageList.push('<span class="pg-prev"><i class="trigger"></i><span class="text"></span></span>');
        }

        //下一页
        if(atpage >= allPageNum){
            pageList.push('<span class="pg-next"><span class="text"></span><i class="trigger"></i></span>');
        }else{
            pageList.push('<a href="javascript:;" class="pg-next"><span class="text"></span><i class="trigger"></i></a>');
        }

        //页码统计
        pageList.push('<span class="sum"><e>'+atpage+'</e>/'+allPageNum+'</span>');

        $("#bar-area .pagination").html(pageList.join(""));

        var pages = document.createElement("div");
        pages.className = "pagination-pages fn-clear";
        info.append(pages);

        //拼接所有分页
        if (allPageNum > 1) {

            //上一页
            if (nowPageNum > 1) {
                var prev = document.createElement("a");
                prev.className = "prev";
                prev.innerHTML = '上一页';
                prev.onclick = function () {
                    atpage = nowPageNum - 1;
                    $("#mod-item .list").empty();
                    $('html, body').animate({scrollTop: $('#contain').offset().top}, 500);
                    getList();
                }
                info.find(".pagination-pages").append(prev);
            }

            //分页列表
            if (allPageNum - 2 < 1) {
                for (var i = 1; i <= allPageNum; i++) {
                    if (nowPageNum == i) {
                        var page = document.createElement("span");
                        page.className = "curr";
                        page.innerHTML = i;
                    } else {
                        var page = document.createElement("a");
                        page.innerHTML = i;
                        page.onclick = function () {
                            atpage = Number($(this).text());
                            $("#mod-item .list").empty();
                            $('html, body').animate({scrollTop: $('#contain').offset().top}, 500);
                            getList();
                        }
                    }
                    info.find(".pagination-pages").append(page);
                }
            } else {
                for (var i = 1; i <= 2; i++) {
                    if (nowPageNum == i) {
                        var page = document.createElement("span");
                        page.className = "curr";
                        page.innerHTML = i;
                    }
                    else {
                        var page = document.createElement("a");
                        page.innerHTML = i;
                        page.onclick = function () {
                            atpage = Number($(this).text());
                            $("#mod-item .list").empty();
                            $('html, body').animate({scrollTop: $('#contain').offset().top}, 500);
                            getList();
                        }
                    }
                    info.find(".pagination-pages").append(page);
                }
                var addNum = nowPageNum - 4;
                if (addNum > 0) {
                    var em = document.createElement("span");
                    em.className = "interim";
                    em.innerHTML = "...";
                    info.find(".pagination-pages").append(em);
                }
                for (var i = nowPageNum - 1; i <= nowPageNum + 1; i++) {
                    if (i > allPageNum) {
                        break;
                    }
                    else {
                        if (i <= 2) {
                            continue;
                        }
                        else {
                            if (nowPageNum == i) {
                                var page = document.createElement("span");
                                page.className = "curr";
                                page.innerHTML = i;
                            }
                            else {
                                var page = document.createElement("a");
                                page.innerHTML = i;
                                page.onclick = function () {
                                    atpage = Number($(this).text());
                                    $("#mod-item .list").empty();
                                    $('html, body').animate({scrollTop: $('#contain').offset().top}, 500);
                                    getList();
                                }
                            }
                            info.find(".pagination-pages").append(page);
                        }
                    }
                }
                var addNum = nowPageNum + 2;
                if (addNum < allPageNum - 1) {
                    var em = document.createElement("span");
                    em.className = "interim";
                    em.innerHTML = "...";
                    info.find(".pagination-pages").append(em);
                }
                for (var i = allPageNum - 1; i <= allPageNum; i++) {
                    if (i <= nowPageNum + 1) {
                        continue;
                    }
                    else {
                        var page = document.createElement("a");
                        page.innerHTML = i;
                        page.onclick = function () {
                            atpage = Number($(this).text());
                            $("#mod-item .list").empty();
                            $('html, body').animate({scrollTop: $('#contain').offset().top}, 500);
                            getList();
                        }
                        info.find(".pagination-pages").append(page);
                    }
                }
            }

            //下一页
            if (nowPageNum < allPageNum) {
                var next = document.createElement("a");
                next.className = "next";
                next.innerHTML = '下一页';
                next.onclick = function () {
                    atpage = nowPageNum + 1;
                    $("#mod-item .list").empty();
                    $('html, body').animate({scrollTop: $('#contain').offset().top}, 500);
                    getList();
                }
                info.find(".pagination-pages").append(next);
            }

            //输入跳转
            var insertNum = Number(nowPageNum + 1);
            if (insertNum >= Number(allPageNum)) {
                insertNum = Number(allPageNum);
            }

            var redirect = document.createElement("div");
            redirect.className = "redirect";
            redirect.innerHTML = '<i>到</i><input id="prependedInput" type="number" placeholder="页码" min="1" max="'+allPageNum+'" maxlength="4"><i>页</i><button type="button" id="pageSubmit">确定</button>';
            info.find(".pagination-pages").append(redirect);

            //分页跳转
            info.find("#pageSubmit").bind("click", function(){
                var pageNum = $("#prependedInput").val();
                if (pageNum != "" && pageNum >= 1 && pageNum <= Number(allPageNum)) {
                    atpage = Number(pageNum);
                    $("#mod-item .list").empty();
                    $('html, body').animate({scrollTop: $('#contain').offset().top}, 500);
                    getList();
                } else {
                    $("#prependedInput").focus();
                }
            });

            info.show();

        }else{
            info.hide();
        }
    }

    // 2021-12-7新增
    //优惠券轮播
    if($('.quanbox li').size() > 0){
        var swiperNav = [], mainNavLi = $('#slideBox3 .bd').find('li');

        for (var i = 0; i < mainNavLi.length; i++) {
            swiperNav.push($('#slideBox3 .bd').find('li:eq('+i+')').html());
        }
        var liArr = [];
        for(var i = 0; i < swiperNav.length; i++){
            liArr.push(swiperNav.slice(i, i + 2).join(""));
            i += 1;
        }

        $('#slideBox3 .bd').find('ul').html('<li>'+liArr.join('</li><li>')+'</li>');
        $("#slideBox3").slide({mainCell:".bd ul", autoPage:"<li></li>",autoPlay: true});
    }
    $('#slideBox3').delegate('.canGet','click',function(){
        var t = $(this);
        var qid = t.attr('data-id');
        $.ajax({
            url: "/include/ajax.php?service=shop&action=getQuan&qid="+qid,
            type:'POST',
            dataType: "json",
            success:function (data) {
                if(data.state ==100){
                    t.text('已领取');
                    showErrAlert(data.info)
                }else{
                    showErrAlert(data.info)
                }
            },
            error:function () {

            }
        });

    })
    //爆热活动轮播
    $("#slideBox2").slide({mainCell:".bd ul",autoPlay:false});

    //拼团未开始倒计时
    if($('.ptdjs').size() > 0){

        var stimes =$('.ptdjs').attr('data-time');
        var pttml = [];
        setInterval(function(){
            pttml = cutDownTime(serviceTime,stimes)
            if(pttml[0] > 0){
                $('.ptdjs').find('.day').text(pttml[0]).show();
                $('.ptdjs').find('.daypot').show();
            }else{
                $('.ptdjs').find('.day').hide();
                $('.ptdjs').find('.daypot').hide();
            }
            // if(pttml[1] > 0){
            //      $('.ptdjs').find('.hour').text(pttml[1]).show();
            //      $('.ptdjs').find('.hourpot').show();
            // }else{
            //      $('.ptdjs').find('.hour').hide();
            //      $('.ptdjs').find('.hourpot').hide();
            // }
            $('.ptdjs').find('.hour').text(pttml[1]);
            $('.ptdjs').find('.minute').text(pttml[2]);
            $('.ptdjs').find('.second').text(pttml[3]);
        },1000) ;
    }
    //倒计时
    function cutDownTime(setime,datatime){
        var eday = 3;
        var jsTime = parseInt((new Date()).valueOf()/1000);
        var timeOffset = parseInt(jsTime - setime);
          var end = datatime*1000;  //点击的结束抢购时间的毫秒数
          var newTime = Date.parse(new Date()) - timeOffset;  //当前时间的毫秒数
          var youtime = end - newTime; //还有多久时间结束的毫秒数
          var timeArr = [];
          if(youtime <= 0){
            timeArr = ['00','00','00','00'];
            return timeArr;
            return false;
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
            timeArr = [CDay,CHour,CMinute,CSecond];
            return timeArr;
          }else{
            timeArr = ['00',CHour,CMinute,CSecond];
            return timeArr;
          }
    }
    if($('.saleGoods')[0]){
        $('.saleOne').show();
    }
});
