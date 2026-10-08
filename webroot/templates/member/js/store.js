/**
 * Created by Administrator on 2018/5/18.
 */
$(function(){
    // 判断浏览器是否是ie8
     if($.browser.msie && parseInt($.browser.version) >= 8){
        $('.app-con .down .con-box:last-child').css('margin-right','0');
        $('.wx-con .c-box:last-child').css('margin-right','0');
        $('.module-con .box-con:last-child').css('margin-right','0');
        $('.list_left .store_ul li:nth-child(3n)').css('margin-right','0');

    }

    //控制标题的字数
    $('.sliceFont').each(function(index, el) {
        var num = $(this).attr('data-num');
        var text = $(this).text();
        var len = text.length;
        if(len > num){
            $(this).html(text.substring(0,num));
        }
    });

    //头部分页
    $(".views .tpage a").bind("click", function(){
        var t = $(this);
        if(!t.hasClass("diabled")){
            //上一页
            if(t.hasClass("prev")){
                subpage = Number(subpage) - 1;
                //下一页
            }else{
                subpage = Number(subpage) + 1;
            }
            getList();
        }
    });


    var fload = 1; // 是否第一次加载第一页
    getList()
    //数据列表
    function getList(tr){

       
        if( fload != 1){
            $(".list_left .list_ul").html('<div class="loading"><span>'+langData['car'][6][79]+'</span></div>'); //加载中
        }
        $.ajax({
            url: "/include/ajax.php?service=car&action=storeList&page="+subpage+"&pageSize="+pageSize+"",
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if(data){
                    if(data.state == 100){
                        $(".list_left .list_ul .loading").remove();
                        
                        var list = data.info.list, html = [],totalCount = data.info.pageInfo.totalCount,pageInfo = data.info.pageInfo;
                        $("#totalCount").html(totalCount);
                        var tpage = Math.ceil(totalCount/pageSize);
                        $(".views .tpage .atpage").html("<em>"+subpage+"</em>/"+tpage);

                        var prev = $(".views .tpage .prev"), next = $(".views .tpage .next");
                        if(subpage == 1){
                            prev.addClass("diabled");
                        }else{
                            prev.removeClass("diabled");
                        }

                        if(tpage > 0 && subpage < tpage){
                            next.removeClass("diabled");
                        }else{
                            next.addClass("diabled");
                        }
                       
                        if(list.length > 0){
                            if( fload != 1){
                                for(var i = 0; i < list.length; i++){  

                                    
                                    var iconA = '';
                                    if(list[i].authattrAll.length>0){
                                        for(var j=0;j<list[i].authattrAll.py.length;j++){
                                            iconA += ' <i class="icon_'+list[i].authattrAll['py'][j]+'"></i> ';
                                        }
                                    }
                                    var addrName = '';
                                    if(list[i].addrName.length>0){
                                        for(var j=0;j<list[i].addrName.length;j++){
                                            addrName = list[i].addrName[j -1]+list[i].addrName[j -2]+list[i].addrName[j -3];
                                        }
                                    }
                                    var salenums = list[i].salenums ? list[i].salenums : 0;//在售
                                    var soldnums = list[i].soldnums ? list[i].soldnums : 0;//已售
                                                       
                                    html.push('<li class="list_li fn-clear">');
                                    html.push(' <div class="left_con">');
                                    html.push('     <div class="left_top fn-clear">');
                                    html.push('         <div class="left_img">');
                                    html.push('             <a href=""><img src="'+list[i].logo+'" alt=""></a></div>');
                                    html.push('         <div class="left_info">');
                                    html.push('             <h2 class="store_tit"><a href="">'+list[i].title+'</a>'+iconA+'</h2>');
                                    html.push('             <p class="store_place"><span class="sliceFont" data-num="30">'+addrName+list[i].address+'</span>');
                                    html.push('             <a href="javascript:;" class="see_map appMapBtn2" data-lng="120.726626" data-lat="31.25849" data-title="'+list[i].title+'" data-address="'+list[i].address+'">'+langData['car'][8][11]+'</a></p>');//查看地图
                                    html.push('         </div>');
                                    html.push('      </div>');
                                    html.push('     <div class="left_bot fn-clear">');
                                    html.push('         <dl><dt>'+salenums+'</dt><dd>'+langData['car'][0][27]+'</dd></dl>');//在售车源
                                    html.push('         <dl class="spe_dl"><dt>'+soldnums+'</dt><dd>'+langData['car'][0][28]+'</dd></dl>');//已售车源
                                    html.push('         <dl><dt>2</dt><dd>'+langData['car'][0][29]+'</dd></dl>');//上新
                                    html.push('     </div>');
                                    html.push('     <div class="store_in"><a href="">'+langData['car'][0][30]+'</a></div>');//进店逛逛
                                    html.push(' </div>');
                                    html.push('<div class="right_con">');
                                    html.push('<ul class="store_ul fn-clear">');
                                    //加载 店铺车辆
                                    $.ajax({
                                        url: "/include/ajax.php?service=car&action=car&orderby=1&page=1&pageSize=3",
                                        type: "GET",
                                        dataType: "jsonp",

                                        success: function(data2){
                                            if(data2 && data2.state == 100){
                                                console.log(data2)
                                               var html2 = [], list2 = data2.info.list;
                                               for(var k=0; k<list2.length; k++){
                                                    var l_flag = list2[k].flag;
                                                    if(l_flag){                                        
                                                        var flag = l_flag.split(',')
                                                        for(var j = 0; j <flag.length;j++){
                                                            var is_new = '';
                                                            if(flag[j] == 2) {
                                                                 is_new = '<span class="new"></span>';//新车
                                                            }
                                                            var z_new = '';
                                                            if(flag[j] == 1) {
                                                                 z_new = '<span class="z_new"></span>'; //准新车
                                                            }
                                                            var hot_tag = '';
                                                            if(flag[j] == 4) {
                                                                 hot_tag = '<span class="hot_tag"></span>'; //急售
                                                            }
                                                        }
                                                    }

                                                    html2.push('<li>');
                                                    html2.push('   <a href="'+list2[k].url+'">');
                                                    html2.push('     <div class="icon_img">'+is_new+z_new+'</div>');
                                                    html2.push('     <div class="icon_img2">'+hot_tag+'</div>');
                                                    var pic = list2[k].litpic != "" && list2[k].litpic != undefined ? huoniao.changeFileSize(list2[k].litpic, "small") : "/static/images/404.jpg";
                                                    html2.push('     <div class="top_img">');
                                                    html2.push('             <img src="'+pic+'" alt="">');
                                                    html2.push('     </div>');
                                                    html2.push('     <div class="car_info">');
                                                    html2.push('         <h3 class="car_name ">'+list2[k].title+'</h3>');
                                                    html2.push('         <p class="car_price"><span>'+list2[k].price+langData['car'][6][20]+'</span>');// 万
                                                    if(list2[k].sf){
                                                        html2.push('         <em>'+langData['car'][6][68]+list2[k].sf+langData['car'][6][20]+'</em>');//首付   万
                                                    }                                   
                                                    html2.push('         </p>');
                                                    html2.push('     </div> ');
                                                    html2.push('  </a>');
                                                    html2.push('</li>');
                                               }
                                               html2.push('<div class="activity-kong swiper-slide"></div>');
                                               $('.store_ul').html(html2.join(''));

                                            }else{
                                               $('.store_ul').html('<div class="loading">'+langData['education'][9][12]+'</div>');//暂无数据！
                                              }
                                        },
                                        error: function(){
                                                    $('.store_ul').html('<div class="loading">'+langData['education'][9][13]+'</div>');//加载失败！
                                                }

                                    })
                                    
                                    html.push('</ul>');
                                    html.push('</div>');
                                }
                            
                                 $(".list_left .list_ul").append(html.join(""));

                            }
                            isload = 1;
                            showPageInfo(totalCount);

                        //没有数据
                        }else{
                        
                          $(".list_left .list_ul").append('<div class="loading_all">'+langData['car'][8][1]+'</div>');//暂无相关信息
                        }

                    //请求失败
                    }else{
                        $(".list_left .list_ul .loading").remove();
                        $(".list_left .list_ul .loading_all").html(data.info);
                    }

                //加载失败
                }else{
                    $(".list_left .list_ul .loading").remove();
                    $(".list_left .list_ul").append('<div class="loading_all">'+langData['car'][8][2]+'</div>');//加载失败
                }
            },
            error: function(){
                
                $(".list_left .list_ul .loading").remove();
                $(".list_left .list_ul").append('<div class="loading_all">'+langData['car'][8][3]+'</div>');//网络错误，加载失败！
            }
        });
    }

    //打印分页1
    function showPageInfo(totalCount) {
        fload++;
        var info = $(".pagination");
        var nowPageNum = subpage;
        var totalCount=totalCount
        var allPageNum = Math.ceil(totalCount / pageSize);
        var pageArr = [];

        info.html("").hide();


        var pages = document.createElement("div");
        pages.className = "pagination-pages";
        info.append(pages);

        //拼接所有分页
        if (allPageNum > 1) {

            //上一页
            if (nowPageNum > 1) {
                var prev = document.createElement("a");
                prev.className = "prev";
                prev.innerHTML = '上一页';
                prev.setAttribute('href','#');
                prev.onclick = function () {
                    subpage = nowPageNum - 1;
                    getList();
                }
            } else {
                var prev = document.createElement("span");
                prev.className = "prev disabled";
                prev.innerHTML = '上一页';
            }
            info.find(".pagination-pages").append(prev);

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
                        page.setAttribute('href','#');
                        page.onclick = function () {
                            subpage = Number($(this).text());
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
                    } else {
                        var page = document.createElement("a");
                        page.innerHTML = i;
                        page.setAttribute('href','#');
                        page.onclick = function () {
                            subpage = Number($(this).text());
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
                    } else {
                        if (i <= 2) {
                            continue;
                        } else {
                            if (nowPageNum == i) {
                                var page = document.createElement("span");
                                page.className = "curr";
                                page.innerHTML = i;
                            } else {
                                var page = document.createElement("a");
                                page.innerHTML = i;
                                page.setAttribute('href','#');
                                page.onclick = function () {
                                    subpage = Number($(this).text());
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
                    } else {
                        var page = document.createElement("a");
                        page.innerHTML = i;
                        page.setAttribute('href','#');
                        page.onclick = function () {
                            subpage = Number($(this).text());
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
                next.setAttribute('href','#');
                next.onclick = function () {
                    subpage = nowPageNum + 1;
                    getList();
                }
            } else {
                var next = document.createElement("span");
                next.className = "next disabled";
                next.innerHTML = '下一页';
            }
            info.find(".pagination-pages").append(next);

            info.show();

        } else {
            info.hide();
        }
    } 





})
