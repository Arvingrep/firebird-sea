/**
 * Created by Administrator on 2018/5/18.
 */
$(function(){
    //地图链接
    $('.appMapBtn').attr('href', OpenMap_URL);
        //收藏
    $(".store-btn").bind("click", function(){
        var t = $(this), type = "add", oper = "+1", txt = langData['siteConfig'][44][0];//已收藏

        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            huoniao.login();
            return false;
        }

        if(!t.hasClass("curr")){
            t.addClass("curr");
        }else{
            type = "del";
            t.removeClass("curr");
            oper = "-1";
            txt = langData['siteConfig'][19][240];//收藏
        }

        var $i = $("<b>").text(oper);
        var x = t.offset().left, y = t.offset().top;
        $i.css({top: y - 10, left: x + 17, position: "absolute", "z-index": "10000", color: "#E94F06"});
        $("body").append($i);
        $i.animate({top: y - 50, opacity: 0, "font-size": "2em"}, 800, function(){
            $i.remove();
        });

        t.children('button').html("<em></em><span>"+txt+"</span>");

        $.post("/include/ajax.php?service=member&action=collect&module=car&temp=store-detail&type="+type+"&id="+id);

    });
    // 判断浏览器是否是ie8
     if($.browser.msie && parseInt($.browser.version) >= 8){
        $('.app-con .down .con-box:last-child').css('margin-right','0');
        $('.wx-con .c-box:last-child').css('margin-right','0');
        $('.module-con .box-con:last-child').css('margin-right','0');
        $('.list_left .list_ul li:nth-child(5n)').css('margin-right','0');

    }
    //点击电话
    $(".l_phone2").bind("click", function(){
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            location.href = '/login.html';
            return false;
        }
        $(this).hide()
        $('.l_phone3').show()

    })

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
            url: "/include/ajax.php?service=car&action=car&orderby=1&page="+subpage+"&pageSize="+pageSize+"",
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

                                    var l_flag = list[i].flag;
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
 
                                    html.push('<li>');
                                    html.push('   <a href="'+list[i].url+'">');
                                    html.push('     <div class="icon_img">'+is_new+z_new+'</div>');
                                    html.push('     <div class="icon_img2">'+hot_tag+'</div>');
                                    var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";
                                    html.push('     <div class="top_img">');
                                    html.push('             <img src="'+pic+'" alt="">');
                                    html.push('     </div>');
                                    html.push('     <div class="car_info">');
                                    html.push('         <h3 class="car_name ">'+list[i].title+'</h3>');
                                    html.push('         <p class="by_time"> ');
                                    var timestamp = list[i].cardtime;
                                    var date = new Date(timestamp*1000);//时间戳
                                    var cardtime=date.getFullYear();
                                    html.push('         <span>'+cardtime+langData['car'][6][55]+'</span><em>|</em><span>'+list[i].mileage+langData['car'][6][21]+'</span> ');//年 万公里
                                    html.push('         </p>');
                                    html.push('         <p class="car_price"><span>'+list[i].price+langData['car'][6][20]+'</span>');// 万
                                    if(list[i].sf){
                                        html.push('         <em>'+langData['car'][6][68]+list[i].sf+langData['car'][6][20]+'</em>');//首付   万
                                    }                                   
                                    html.push('         </p>');
                                    html.push('     </div> ');
                                    html.push('  </a>');
                                    html.push('</li>');
                                }
                            
                                 $(".list_left .list_ul").append(html.join(""));
                                 $('.list_left .list_ul li:nth-child(5n)').css('margin-right','0');
                            }
                           
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
                prev.innerHTML = langData['siteConfig'][6][33];//上一页
                prev.setAttribute('href','#');
                prev.onclick = function () {
                    subpage = nowPageNum - 1;
                    getList();
                }
            } else {
                var prev = document.createElement("span");
                prev.className = "prev disabled";
                prev.innerHTML = langData['siteConfig'][6][33];//上一页
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
                next.innerHTML = langData['siteConfig'][6][34];//下一页
                next.setAttribute('href','#');
                next.onclick = function () {
                    subpage = nowPageNum + 1;
                    getList();
                }
            } else {
                var next = document.createElement("span");
                next.className = "next disabled";
                next.innerHTML = langData['siteConfig'][6][34];//下一页
            }
            info.find(".pagination-pages").append(next);

            info.show();

        } else {
            info.hide();
        }
    } 

    //点击预约
    $(".order").bind("click", function(){
        $('.order_mask').show()
    })
    //预约提交
    $(".order_mask .order_submit").bind("click", function(){
        var f = $(this);
        var str = '',r = true;
        if(f.hasClass("disabled")) return false;        

        // 手机号
        var order_phone = $('#order_phone')
        var order_phonev = $.trim(order_phone.val());
        if(order_phonev == '') {
            if (r) {
                order_phone.focus();
                errmsg(order_phone, langData['car'][8][15]);//请输入手机号码
            }
            r = false;
        } else {
            // var telReg = !!order_phonev.match(/^(13|14|15|17|18)[0-9]{9}$/);
            // if(!telReg){
            // if (r) {
            //     order_phone.focus();
            //     errmsg(order_phone,langData['car'][8][16]);//请输入正确手机号码
            // }
            // r = false;
            // }
        }

        if(!r) {
            return false;
        }       
        $('.order_mask').hide()
        $('.order_success').show()

    });
    //关闭预约弹窗
    $(".order_mask .close_alert,.order_mask .cancel").bind("click", function(){
        $('.order_mask').hide();
    })

    //关闭预约成功弹窗
    $(".order_success .close_alert,.order_success .t3").bind("click", function(){
        $('.order_success').hide();
    })


    //数量错误提示
    var errmsgtime;
    function errmsg(div,str){
        $('#errmsg').remove();
        clearTimeout(errmsgtime);
        var top = div.offset().top - 33;
        var left = div.offset().left;

        var msgbox = '<div id="errmsg" style="position:absolute;top:' + top + 'px;left:' + left + 'px;height:30px;line-height:30px;text-align:center;color:#f76120;font-size:14px;display:none;z-index:99999;background:#fff;">' + str + '</div>';
        $('body').append(msgbox);
        $('#errmsg').fadeIn(300);
        errmsgtime = setTimeout(function(){
            $('#errmsg').fadeOut(300, function(){
                $('#errmsg').remove()
            });
        },2000);
    };




})
