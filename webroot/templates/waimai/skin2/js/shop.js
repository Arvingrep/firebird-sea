$(function(){
    $('.food_list dl:nth-child(3n)').css('border-right','none');
    $('.my-gallery ul li:last-child').css('margin-right','0');
    $('.certy .img_div:nth-child(3n)').css('margin-right','0');
    var alerTxt='';
    //判断店铺是否关闭

    if(detail_status == 0){
        console.log(111)
        if(detail_closeinfo){
           alerTxt = detail_closeinfo
        }else{
           alerTxt = langData['waimai'][8][29];// 该店铺关闭了
        }
        //商家休息弹窗
        $('.store_alert .alert_title').text(alerTxt);
        $('.storePop,.store_alert').show();
    }else{

        if(detail_ordervalid == 0){
            console.log(222)
            if(detail_closeorder){
                alerTxt = detail_closeorder;
            }else{
                alerTxt = langData['waimai'][8][30];//该店铺关闭了微信下单
            }
            //商家休息弹窗
        $('.store_alert .alert_title').text(alerTxt);
        $('.storePop,.store_alert').show();

        }
        if(detail_yingye == 0){
            console.log(333)
            if(detail_yingyeWeek != 1){
                alerTxt = langData['waimai'][8][32];//该店铺本周暂停营业！
            }else if(yingyeTime == 0){
                alerTxt = langData['waimai'][8][33];// 未到店铺营业时间
            }else{
                alerTxt = langData['waimai'][8][34];// 该店铺暂不营业
            }
            //商家休息弹窗
        $('.store_alert .alert_title').text(alerTxt);
        $('.storePop,.store_alert').show();
        }


    }


    $(".doSearch").click(function(){
    var url = $("#searchForm").attr('action');
    location.href = url + '?keywords=' + $("#keywords").val();
    });

    //点击商品 查看详情
    $('.food_list .pro_img').bind('click', function() {
        var mainId=$(this).parents('.main_item').attr('id');
        $('.food_alert').attr('id',mainId);
        //获取原本带的属性值
        var p = $(this).closest('.main_item').find('.car_t1');
        var id = p.attr('id');
        var dataid = p.attr('data-id');
        var title = p.attr('data-title');
        var src = p.attr('data-src');
        var price = p.attr('data-price');
        var unit = p.attr('data-unit');
        var dabao = p.attr('data-dabao');
        var stock = p.attr('data-stock');
        var nature = p.attr('data-nature');
        var limitfood = p.attr('data-limitfood');
        var foodnum = p.attr('data-foodnum');
        var stime = p.attr('data-stime');
        var etime = p.attr('data-etime');
        var times = p.attr('data-times');

        var foodDescp = p.find('.food_desc').text();
        var pic = JSON.parse($(this).find('img').attr('data-pic'));
        var html = [];
        for (var i = 0; i < pic.length; i++) {
            html.push('<li><img src=' + pic[i] + ' /></li>');
        }
        $('#slideBox ul').html(html.join(''));

        $('.food_cont .foodTit').text(title);
        $('.food_cont .foodDescp').text(foodDescp);
        $('.foodPrice .detPrice').text(price);
        if(unit){
            $('.foodPrice .foodUnit').text('/'+unit);
         }

        if(stock==0 &&stock!=''){
            $('.food_cont .addcar').text(langData['waimai'][8][42]);//已售空
            $('.food_cont .addcar').addClass('disabled').removeClass('plus');
        }else{
            $('.food_cont .addcar').text(langData['waimai'][8][78]);//加入到购物车
            $('.food_cont .addcar').addClass('plus').removeClass('disabled');
        }

        $('.food_alert').show();
        $('.mask_food').show();

        //产品展示
        $(".slideBox").slide({mainCell:".bd ul",autoPlay:true});
        //弹窗里 car_t1所需属性
        var catT=$('.food_alert .car_t1');
        catT.attr('id',id);
        catT.attr('data-id',dataid);
        catT.attr('data-title',title);
        catT.attr('data-src',src);
        catT.attr('data-price',price);
        catT.attr('data-unit',unit);
        catT.attr('data-dabao',dabao);
        catT.attr('data-stock',stock);
        catT.attr('data-nature',nature);
        catT.attr('data-limitfood',limitfood);
        catT.attr('data-foodnum',foodnum);
        catT.attr('data-stime',stime);
        catT.attr('data-etime',etime);
        catT.attr('data-times',times);
        console.log(title)
        console.log(catT.attr('data-title'))
    });
    // 鼠标经过头部商家
    // $('.store_hide .det_pic,.store_hide .det_mid h2').hover(function () {
    $('.store_hide').hover(function () {
        $('.saleBox').show();
        $('.store_hide').addClass('show');

    },function () {
        $('.saleBox').hide();
        $('.store_hide').removeClass('show');
    });
    //控制标题的字数
    $('.det_title').each(function(index, el) {
        var num = $(this).attr('data-num');
        var text = $(this).text();
        var len = text.length;
        if(len > num){
            $(this).html(text.substring(0,num));
        }
    });

    //关闭商家休息弹窗
    $(".storePop, .store_alert s.cha, .store_alert .see_out").bind("click", function(){
        $('.storePop,.store_alert').hide();
    });
    //收藏
    $(".store-btn").bind("click", function(){
        var t = $(this), type = "add", oper = "+1", txt = "已收藏";

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
            txt = "收藏";
        }

        var $i = $("<b>").text(oper);
        var x = t.offset().left, y = t.offset().top;
        $i.css({top: y - 10, left: x + 17, position: "absolute", "z-index": "10000", color: "#E94F06"});
        $("body").append($i);
        $i.animate({top: y - 50, opacity: 0, "font-size": "2em"}, 800, function(){
            $i.remove();
        });

        t.children('button').html("<em></em><span>"+txt+"</span>");

        $.post("/include/ajax.php?service=member&action=collect&module=waimai&temp=shop&type="+type+"&id="+id);

    });
    //点击分类
    $(".food_cate ul li").bind("click", function(){
        $(this).addClass('curr').siblings().removeClass('curr')
    })

    var firstLoad = true, subpage = 1, isload = false, loading = $('.loading');

    //商品 评论 商家切换
    $('.tab_ul li').click(function() {
        var index = $(this).index();
        $(this).addClass('active').siblings().removeClass('active');
        $('.common_con').eq(index).show().siblings().hide();

        if(index == 1 && firstLoad){//显示评论
            firstLoad = false;
            getList(true);
        }
    })
    //不同评论切换
    $('.comm_ul li').click(function() {
        var index = $(this).index();
        $(this).addClass('active').siblings().removeClass('active');
        var id=$(this).attr('data-id');
        //获取不同等级的评论
        subpage = 1;
        getList();
    })

    function getList(){

        isload = true;
        var data = [];
        data.push('sid='+shopid);
        data.push($('.comm_ul li.active').attr('data-id'));
        var prame = $('.comm_ul li.active').attr('data-id');
        loading.show();
        $.ajax({
            url: masterDomain + '/include/ajax.php?service=waimai&action=common&page='+subpage+'&pageSize=10',
            type: 'get',
            data: data.join("&"),
            dataType: 'jsonp',
            success: function(data){
                $(".comment-list").remove()
                if(data && data.state == 100){

                    var list = data.info.list, html = [],totalCount = data.info.pageInfo.totalCount;
                    $('.comment_good').text(data.info.pageInfo.totalCount3)
                    $('.comment_bad').text(data.info.pageInfo.totalCount1)
                    $('.comment_middle').text(data.info.pageInfo.totalCount2)
                    $('.comment_pic').text(data.info.pageInfo.totalCount5);

                    var total = 0;
                    if(prame == 'starpstype=3'){
                      total = data.info.pageInfo.totalCount3
                    }else if(prame == 'starpstype=2'){
                      total = data.info.pageInfo.totalCount2
                    }else if(prame == 'starpstype=1'){
                      total = data.info.pageInfo.totalCount1
                    }else if(prame == 'picgettype=1'){
                      total = data.info.pageInfo.totalCount5

                    }else{
                      total = totalCount;
                    }
                    showPageInfo(total)


                    if(list.length > 0){
                        for(var i = 0; i < list.length; i++){
                            var obj = list[i], item = [];

                            item.push('<div class="comment-list" data-id="'+obj.id+'">');
                            item.push(' <div class="comment-user">');
                            item.push('     <img src="'+(obj.user.photo ? obj.user.photo : '/static/images/default_user.jpg')+'" alt="">');
                            item.push(' </div>');
                            item.push(' <div class="comment-info">');
                            item.push('     <h3>'+(obj.user)+'</h3>');
                            item.push('     <div class="judge-box">');
                            item.push('         <div class="judge-star l"><s style="width:'+obj.star/5*100+'%;"></s></div>');
                            item.push('         <span class="sale-time">'+obj.time+langData['siteConfig'][22][93]+'</span>');
                            item.push('         <div class="clear"></div>');
                            item.push('     </div>');
                            item.push('     <div class="comment-txt">'+obj.content+'</div>');
                            if(obj.pics != ''){
                                item.push('     <div class="my-gallery">');
                                var n=obj.pics.length;
                                item.push('         <ul class="img_ul" data-len="'+n+'">');
                                for(var m = 0; m < n; m++){
                                    var pic = obj.pics[m];
                                    item.push('          <li>');
                                    item.push('               <img src="'+pic+'">');
                                    item.push('          </li>');
                                }
                                item.push('         </ul>');
                                item.push('         <div class="next-btn"><a><i></i></a></div>');
                                item.push('         <div class="prev-btn"><a><i></i></a></div>');
                                if(96*n + 5*(n-1) > 750){
                                    $('.next-btn').show();
                                }
                                item.push('     </div>');
                            }
                            item.push('    <div class="pub_time fn-clear">');
                            item.push('     <span class="time">'+obj.pubdatef+'</span><span class="zan_num">5015</span>');
                            item.push('     </div>');
                            if(obj.reply != "" && obj.replydate != 0){
                                item.push('<div class="reply">');
                                item.push('<p>'+langData['siteConfig'][16][67]+obj.reply+'<span>'+obj.replydatef+'</span></p>');
                                item.push('</div>');
                            }
                            item.push(' </div>');
                            item.push('</div>');

                            html.push(item.join(""));
                        }

                        loading.hide().before(html.join(""));
                        isload = false;

                    }else{
                        loading.text(langData['waimai'][2][20]);
                    }
                }else{
                    loading.text(data.info);
                }
            },
            error: function(){
                isload = false;
                loading.text(langData['siteConfig'][20][458]);
            }
        })

    }
    $('.comment-box').delegate(".next-btn", "click", function(){
        var t=$(this),par=t.closest('.comment-list');
        var imgPrev=par.find('.prev-btn');
        var imgList=par.find('.img_ul'),imgLen=imgList.attr('data-len');
        var imgLeft= -(101*imgLen-755);// 图片宽度*数量 + marginRight*(数量-1) - 总得宽度my-gallery 96n+5(n-1)-750
        imgList.css('left',imgLeft+'px');
        t.hide();imgPrev.show();
    })
    $('.comment-box').delegate(".prev-btn", "click", function(){
       var t=$(this),par=t.closest('.comment-list');
       var imgNext=par.find('.next-btn');
       var imgList=par.find('.img_ul');
       imgList.css('left','0');
       t.hide();imgNext.show();
    })

    //相册图片放大
    $('.my-gallery ul').viewer({
        url: 'data-original',
    });
    //点赞
    var commentObj=$('.comment-box');
    commentObj.delegate(".zan_num", "click", function(){
        var userid = $.cookie(cookiePre + "login_user");
        if (userid == null || userid == "") {
            location.href = masterDomain + '/login.html';
            return false;
        }
        var t = $(this), id = t.closest(".comment-list").attr("data-id");
        if(t.hasClass("active")) return false;
        if(id != "" && id != undefined){
            $.ajax({
                url: "/include/ajax.php?service=member&action=dingComment&type=add&id="+id,//点赞接口
                type: "GET",
                dataType: "json",
                success: function (data) {
                    var ncount = Number(t.text().replace("(", "").replace(")", ""));
                    t
                    .addClass("active")
                    .html('(<em>'+(ncount+1)+'</em>)');

                    //加1效果
                    var $i = $("<b>").text("+1");
                    var x = t.offset().left, y = t.offset().top;
                    $i.css({top: y - 10, left: x + 17, position: "absolute", color: "#E94F06"});
                    $("body").append($i);
                    $i.animate({top: y - 50, opacity: 0, "font-size": "2em"}, 800, function(){
                        $i.remove();
                    });

                }
            });
        }
    });
     //打印分页
    function showPageInfo(totalCount) {

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
                prev.setAttribute('href','javascript:;');
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

})
