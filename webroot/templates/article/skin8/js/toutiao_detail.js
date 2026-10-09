$(function(){
    //缩略图
    var index=0
    var i=1;

     var w=$('.slides_box li').width()+500;
    function setWidth(){

        var l=$('.slides_box li').length;

        $('.slides_box ul').width(w*l)
    }

    var length=$('.slides_box ul li').length;
    $('.slides_box ul li').eq(0).find('a').addClass('actives')
   function slideNext(){
        if(index >= 0 && index < length-1) {
            ++index;
            showImg(index);
        }else{
                if($('.slides_box ul li').length>=8){


                        showImg(0);
                        index=0;
                        aniPx=(length-8)*88+'px'; //所有图片数 - 可见图片数 * 每张的距离 = 最后一张滚动到第一张的距离
                        $(".slides_box ul").animate({ "left": "+="+aniPx },200);
                        i=1;
                  }

            return false;
        }
        if(i<0 || i>length-8){
            return false;
        }
        $(".slides_box ul").animate({ "left": "-=88px" },200)

        i++;
    }
    function slideFront(){
        if(index >= 1 ) {
            --index;
            showImg(index);
        }
        if(i<2 || i>length+8){
            return false;
        }
        $(".slides_box ul").animate({ "left": "+=88px" },200)
        i--;
    }
    function showImg(index){

        $('#featured>div').eq(index).fadeIn().siblings().fadeOut();
        $('.slides_box ul li').eq(index).find('a').addClass('actives').parent('li').siblings().find('a').removeClass('actives')

    }
    $('.btnNext').click(function(){

        console.log($('.slides_box ul li').length)
        if($('.slides_box ul').is(':animated')){
            return;
        }
         setWidth()
         slideNext();

     if($('.slides_box ul li').length<=8){
            return;
        }




    })
    $('.btnPrev').click(function(){
        if($('.slides_box ul').is(':animated')){
            return;
        }
        slideFront()


    })
    $('.slides_box ul li').click(function(){
       index=$(this).index();
       showImg(index)
    })

    //点击更多打赏

    // 查看更多打赏列表
    $(".rewardS .gra-member .moveButton img").click(function(){
            $(".gratuity_record, .rewardS-mask").show();
    })

    // 关闭打赏列表
    $(".gratuity_record .record_top span").click(function(){
        $(".gratuity_record, .rewardS-mask").hide();
    })
    var rew=null;
    $.ajax({
        url: masterDomain+'/include/ajax.php?service=article&action=rewardList&aid='+aid+'',
        type: 'GET',
        dataType: 'jsonp',
        success: function(respon){
            if(respon.state==100){
                rew=respon.info.list;

                var num=respon.info.pageInfo.totalCount;
                $('.totalRew').html(num)
                if(rew.length<=0)return;
                var total=null;
                if(rew.length<=0){
                    otal=0;
                }else{
                    total=Math.ceil(rew.length/7);
                }


                function ceaete(datas,num){
                    var lens=datas.length; //一共多少数据
                    var totals=Math.ceil(lens/num); //设置一共多少页
                    var idx=num;

                    function createData(start,end){

                        var records='';

                         for(var k=start;k<end;k++){
                            var time=datas[k].date;
                            var dates=getDate(time)
                            records+=`<li>
                                <div class="gra-info">
                                    <img src="${datas[k].photo}">
                                    <strong>${datas[k].username}</strong>
                                </div>
                                <p>￥<span>${datas[k].amount}</span></p>
                                <div class="gra-time">
                                    <em>${dates}</em>
                                </div>
                            </li>`

                        }

                        function getDate(times){
                            var d = new Date(times * 1000);
                            return date = (d.getFullYear()) + "-" + (d.getMonth() + 1) + "-" + (d.getDate());

                        }

                        $('.record-list').append(records);

                    }

                    $('#pages').jqPaginator({
                        totalPages: total,
                        visiblePages: 5,
                        currentPage: 1,
                        activeClass:'on',
                        prev: '<li class="record-prev"><a href="javascript:void(0);">上一页</a></li>',
                        next: '<li class="record-next"><a href="javascript:void(0);">下一页</a></li>',
                        page: '<li class="page"><a href="javascript:void(0);">{{page}}</a></li>',

                        onPageChange: function (num) {
                            $('.record-list').empty();
                            var start=(num-1)*7;
                            var ends=(num-1)*7+7;
                            if(ends>=lens){
                                ends=lens
                            }

                            createData(start,ends)

                        }
                    });

                }
                ceaete(rew,7) //rewa传入的数据，num每页显示多少条
            }
        },
    })



//收藏
    $(".collect").bind("click", function(){
        var t = $(this), type = "add", oper = "+1", txt = "已关注";

        if(t.hasClass('disabled')) return;

        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            huoniao.login();
            return false;
        }
        $(this).toggleClass("active");
        if(!t.hasClass("curr")){
            t.addClass("curr");
             $(".keyAndshare .share-oper .collect").text('关注');
        }else{
            type = "del";
            t.removeClass("curr");
            oper = "-1";
            txt = "关注";
             $(".keyAndshare .share-oper .collect").text('取消关注');
        }

        var $i = $("<b>").text(oper);
        var x = t.offset().left, y = t.offset().top;
        $i.css({top: y - 10, left: x + 17, position: "absolute", "z-index": "10000", color: "#E94F06"});
        $("body").append($i);
        $i.animate({top: y - 50, opacity: 0, "font-size": "2em"}, 800, function(){
            $i.remove();
        });

        t.html("<i></i>"+txt);

        $.post("/include/ajax.php?service=member&action=followMember&for=media&id="+media);

    });
    var complain = null;
    $(".tool .report").bind("click", function(){

        var domainUrl = masterDomain;
        complain = $.dialog({
            fixed: false,
            title: "信息举报",
            content: 'url:'+domainUrl+'/complain-info-detail-'+id+'.html',
            width: 460,
            height: 280
        });
    });

    //评论登录
    $(".comment").delegate(".login", "click", function(){
        if ($.browser.msie && ($.browser.version == "6.0") && !$.support.style) {
            $("html, body").scrollTop(0);
        }
        huoniao.login();
    });

    var commentObj = $("#commentList");
    var isLoad = 0;

    //页面打开时默认不加载，当滚动条到达评论区域的时候再加载
    $(window).scroll(function(){
        var commentStop = commentObj.offset().top;
        var windowStop = $(window).scrollTop();
        var windowHeight = $(window).height();
        if(windowStop+windowHeight >= commentStop && !isLoad){
            isLoad = 1;
            loadComment();
        }

    });

    //评论筛选【时间、热度】
    $(".c-orderby a").bind("click", function(){
        if(!$(this).hasClass("active")){
            $(".c-orderby a").removeClass("active");
            $(this).addClass("active");

            commentObj
            .attr("data-page", 1)
            .html('<div class="loading"></div>');
            $("#loadMore").removeClass().hide();

            loadComment();
        }
    });

    // //点赞
    // $(".keyAndshare .share-oper .thumbs-up").on("click",function(){
    //  $(this).toggleClass("active");
    //  if ($(".thumbs-up").text() == '点赞' ) {
    //      $(".keyAndshare .share-oper .thumbs-up").text('取消点赞');
    //  } else {
    //      $(".keyAndshare .share-oper .thumbs-up").text('点赞');
    //  }
    // })

    //加载评论
    function loadComment(){
        if(aid && aid != undefined){
            var page = commentObj.attr("data-page");
            var orderby = $(".c-orderby .active").attr('data-id');
            //异步获取用户信息
            $.ajax({
                url: "/include/ajax.php?service=member&action=getComment&type=article-detail&son=1&aid="+aid+"&page="+page+"&orderby="+orderby+"&pageSize=20",
                type: "GET",
                dataType: "json",
                success: function (data) {
                    if(data && data.state == 100){

                        if(commentObj.find("li").length > 0){
                            commentObj.append(getCommentList(data.info.list));
                        }else{
                            commentObj.html(getCommentList(data.info.list));
                        }

                        page = commentObj.attr("data-page", (Number(page)+1));

                        var pageInfo = data.info.pageInfo;
                        if(Number(pageInfo.page) < Number(pageInfo.totalPage)){
                            $("#loadMore").removeClass().show();
                        }else{
                            $("#loadMore").removeClass().hide();
                        }

                    }else{
                        if(commentObj.find("li").length <= 0){
                            commentObj.html("<div class='empty'>暂无相关评论</div>");
                            $("#loadMore").removeClass().hide();
                        }
                    }
                },
                error: function(){
                    if(commentObj.find("li").length <= 0){
                        commentObj.html("<div class='empty'>暂无相关评论</div>");
                        $("#loadMore").removeClass().hide();
                    }
                }
            });
        }else{
            commentObj.html("Error!");
        }
    }

    //拼接评论列表
    function getCommentList(list){
        var html = [];
        for(var i = 0; i < list.length; i++){
            html.push('<li class="fn-clear" data-id="'+list[i]['id']+'">');

            var photo = list[i].user['photo'] == "" ? staticPath+'images/noPhoto_40.jpg' : list[i].user['photo'];

            html.push('  <img onerror="javascript:this.src=\''+staticPath+'images/noPhoto_40.jpg\';" data-uid="'+list[i].user['userid']+'" src="'+photo+'" alt="'+list[i].user['nickname']+'">');
            html.push('  <div class="c-body">');
            html.push('    <div class="c-header">');
            html.push('      <a href="javascript:;" data-id="'+list[i].user['userid']+'">'+list[i].user['nickname']+'</a>');
            html.push('      <span>'+list[i]['ftime']+(list[i].iphome ? ' · ' + list[i].iphome : '')+'</span>');
            html.push('    </div>');
            html.push('    <p>'+list[i]['content']+'</p>');
            html.push('    <div class="c-footer">');

            var praise = "praise";
            if(list[i]['zan_has'] == 1){
                praise = "praise active";
            }
            html.push('      <a href="javascript:;" class="'+praise+'">(<em>'+list[i]['zan']+'</em>)</a>');

            html.push('      <a href="javascript:;" class="reply">回复(<em>'+(list[i]['lower']!=undefined && list[i]['lower'].count ? list[i]['lower'].count : 0)+'</em>)</a>');
            html.push('    </div>');
            html.push('  </div>');
            if(list[i]['lower']!=undefined && list[i]['lower'].count > 0 && list[i]['lower'].list!=null){
                html.push('  <ul class="children">');
                html.push(getCommentList(list[i]['lower']['list']));
                html.push('  </ul>');
            }
            html.push('</li>');
        }
        return html.join("");
    }

    //加载更多评论
    $("#loadMore").bind("click", function(){
        $(this).addClass("loading");
        loadComment();
    });

    //顶
    commentObj.delegate(".praise", "click", function(){
        var t = $(this), id = t.closest("li").attr("data-id");
        if(t.hasClass("active")) return false;
        if(id != "" && id != undefined){
            $.ajax({
                url: "/include/ajax.php?service=member&action=dingComment&type=add&id="+id,
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

    //评论回复
    commentObj.delegate(".reply", "click", function(){

        var carea = commentObj.find(".c-area");
        if(carea.html() != "" && carea.html() != undefined){
            carea.stop().slideUp("fast");

            commentObj.find(".reply").removeClass("active");
        }

        var areaObj = $(this).closest(".c-body"),
        replaytemp = $("#replaytemp").html();
        if(areaObj.find(".c-area").html() == "" || areaObj.find(".c-area").html() == undefined){
            areaObj.append(replaytemp);
            clearContenteditableFormat(areaObj.find(".c-area .textarea"));
        }
        areaObj.find(".c-area").stop().slideToggle("fast");

    });

    //提交评论回复
    $(".comment").delegate(".subtn", "click", function(){
        var t = $(this), id = t.closest("li").attr("data-id");
        if(t.hasClass("login") || t.hasClass("loading")) return false;

        var contentObj = t.closest(".c-area").find(".textarea"),
        content = contentObj.html();

        if(content == ""){
            return false;
        }
        if(huoniao.getStrLength(content) > 200){
            alert("超过200个字了！");
        }

        if(id == undefined){
            var url = '/include/ajax.php?service=member&action=sendComment&check=1&type=article-detail&aid=' + aid;
        }else{
            var url = '/include/ajax.php?service=member&action=replyComment&check=1&id=' + id;
        }
        id = id == undefined ? 0 : id;

        t.addClass("loading");

        $.ajax({
            url: url,
            data: "content="+content,
            type: "POST",
            dataType: "json",
            success: function (data) {

                t.removeClass("loading");
                contentObj.html("");
                if(data && data.state == 100){

                    var info = data.info;
                    var list = [];
                    list.push('<li class="fn-clear colorAnimate" data-id="'+info['id']+'">');
                    list.push('  <img onerror="javascript:this.src=\''+staticPath+'images/noPhoto_40.jpg\';" data-uid="'+info.userinfo['userid']+'" src="'+info.userinfo['photo']+'" alt="'+info.userinfo['nickname']+'">');
                    list.push('  <div class="c-body">');
                    list.push('    <div class="c-header">');
                    list.push('      <a href="javascript:;" data-id="'+info.userinfo['userid']+'">'+info.userinfo['nickname']+'</a>');
                    list.push('      <span>'+info['ftime']+(list[i].iphome ? ' · ' + list[i].iphome : '')+'</span>');
                    list.push('    </div>');
                    list.push('    <p>'+info['content']+'</p>');
                    list.push('    <div class="c-footer">');
                    list.push('      <a href="javascript:;" class="praise">(<em>'+info['zan']+'</em>)</a>');
                    list.push('      <a href="javascript:;" class="reply">回复(<em>'+(info['lower']!=undefined && info['lower'].count ? info['lower'].count : 0)+'</em>)</a>');
                    list.push('    </div>');
                    list.push('  </div>');
                    list.push('</li>');

                    //一级评论
                    if(contentObj.attr("data-type") == "parent"){
                        if(commentObj.find("li").length <= 0){
                            commentObj.html("");
                            $("#loadMore").removeClass().hide();
                        }

                        commentObj.prepend(list.join(""));

                    //子级
                }else{

                    t.closest(".c-area").hide();

                    var children = t.closest("li").find(".children");
                        //判断子级是否存在
                        if(children.html() == "" || children.html() == undefined){
                            t.closest("li").append('<ul class="children"></ul>');
                        }

                        t.closest("li").find("ul.children").prepend(list.join(""));


                    }

                }else{
                    alert(data.info);
                }

            }
        });

    });


    //退出
    $("body").delegate(".logout", "click", function(){
        $.cookie(cookiePre+'login_user', null, {expires: -10, domain: channelDomain.replace("http://", ""), path: '/'});
    });


    // 打赏金额
    $('.rewardS-pay-select li').click(function(){
        var t = $(this), li = t.text(), num = parseInt(li);
        $('.rewardS-pay-box .rewardS-pay-money .inp').focus().val(num);
    })

    // 打赏金额验证
    var rewardInput = $('.rewardS-pay-box .rewardS-pay-money .inp');
    rewardInput.blur(function(){
        var t = $(this), val = t.val();

        var regu = "(^[1-9]([0-9]?)+[\.][0-9]{1,2}?$)|(^[1-9]([0-9]+)?$)|(^[0][\.][0-9]{1,2}?$)";
        var re = new RegExp(regu);
        if (!re.test(val)) {
            t.val(0);
        }
    })

    // 支付方式
    $('.rewardS-pay-way ul li').click(function(){
        $(this).addClass('on').siblings('li').removeClass('on');
    })

    //打开
    $('.rewardS .rewardS-support .money').click(function(){
        var t = $(this);
        if(t.hasClass("loading")) return;
        t.addClass("loading");

        //验证文章状态
        $.ajax({
            "url": masterDomain + "/include/ajax.php?service=article&action=checkRewardState",
            "data": {"aid": aid},
            "dataType": "jsonp",
            success: function(data){
                t.removeClass("loading");
                if(data && data.state == 100){
                    // $('.rewardS-pay').show(); $('.rewardS-mask').show();
                    // rewardInput.focus().val(rewardInput.val());
                    // 新版打赏弹窗
                    $("#ds_page .dsMask,#ds_page .dsPop").show();
                }else{
                    alert(data.info);
                }
            },
            error: function(){
                t.removeClass("loading");
                alert("网络错误，操作失败，请稍候重试！");
            }
        });
    })

    //关闭
    $('.rewardS-pay-tit .close').click(function(){
        $('.rewardS-pay').hide(); $('.rewardS-mask').hide();
    })

    //立即支付
    $('.rewardS-pay .rewardS-sumbit a').bind("click", function(event){
        var t = $(this);
        var amount = rewardInput.val();
        var regu = "(^[1-9]([0-9]?)+[\.][0-9]{1,2}?$)|(^[1-9]([0-9]+)?$)|(^[0][\.][0-9]{1,2}?$)";
        var re = new RegExp(regu);
        if (!re.test(amount)) {
            event.preventDefault();
            alert("打赏金额格式错误，最少0.01元！");
        }

        var paytype = $(".rewardS-pay-way .on").data("type");
        if(paytype == "" || paytype == undefined || paytype == null){
            event.preventDefault();
            alert("请选择支付方式！");
        }

        var url = t.data("url").replace("$amount", amount).replace("$paytype", paytype);
        t.attr("href", url);
        $('.rewardS-pay-tit .close').click();

    })

    // 查看更多打赏列表
    $(".rewardS-support .num").click(function(){
        var num = parseInt($(this).find("font").text());
        if (num > 10) {
            $(".pop_main_box, .rewardS-mask").show();
        }
    })

    // 关闭打赏列表
    $(".pop-close").click(function(){
        $(".pop_main_box, .rewardS-mask").hide();
    })

    pageInfo();

    // 打赏分页
    function pageInfo(){

        var pageSize = 10, total = Math.ceil($(".gratuity_list li").length / pageSize);
        var current = 1, pageHtml = [];
        $(".gratuity_list li:lt("+pageSize+")").show();

        // 打印页数
        pageHtml.push('<li id="btnPrev" class="btn disabled always">上一页</li>');
        for (var i = 0; i < total; i++) {
            if (i == 0) {
                pageHtml.push('<li data-id="'+(i+1)+'" class="always"><a href="javascript:;" class="pageCurrent">'+(i+1)+'</a></li>');
                pageHtml.push('<li class="prevdot"><span>...</span></li>');
            }else if (i == total - 1) {
                pageHtml.push('<li class="nextdot"><span>...</span></li>');
                pageHtml.push('<li data-id="'+(i+1)+'" class="always"><a href="javascript:;">'+(i+1)+'</a></li>');
            }else {
                pageHtml.push('<li data-id="'+(i+1)+'"><a href="javascript:;">'+(i+1)+'</a></li>');
            }
        }
        pageHtml.push('<li id="btnNext" class="btn always">下一页</li>');
        if (total > 1) {
            $("#page-list-content .rwPage").html(pageHtml.join(""));
        }

        pagedot();

        // 上一页
        $("#btnPrev").click( function() {
            var t = $(this);
            if (t.hasClass("disabled")) return;

            $("#btnNext").removeClass("disabled");
            var cur = $('.rwPage .pageCurrent'), li = cur.parent("li");
            cur.removeClass("pageCurrent");
            $(".rwPage li[data-id="+(current - 1)+"]").find('a').addClass("pageCurrent");

            current -= 1;
            var indexStart = (current - 1) * pageSize, indexEnd = indexStart + pageSize - 1;
            $(".gratuity_list li").show();
            $(".gratuity_list li:lt(" + indexStart + "), .gratuity_list li:gt(" + indexEnd + ")").hide();

            if (current == 1) t.addClass("disabled");
            pagedot();
        });

        // 下一页
        $("#btnNext").click( function() {

            var t = $(this);
            if (t.hasClass("disabled")) return;

            $("#btnPrev").removeClass("disabled");
            var cur = $('.rwPage .pageCurrent'), li = cur.parent("li");
            cur.removeClass("pageCurrent");
            $(".rwPage li[data-id="+(current + 1)+"]").find('a').addClass("pageCurrent");


            current += 1;
            $(".gratuity_list li").show();
            var indexStart = (current - 1) * pageSize,
            indexEnd = current * pageSize - 1 > $(".gratuity_list li").length - 1 ? $(".gratuity_list li").length - 1 : current * pageSize - 1;
            $(".gratuity_list li:lt(" + indexStart + "), .gratuity_list li:gt(" + indexEnd +")").hide();
            if (current == total) t.addClass("disabled");
            pagedot();
        });

        // 点击页数
        $('.rwPage li').click(function(){
            var t = $(this);
            if (t.hasClass("btn")) return;

            current = parseInt(t.attr("data-id"));
            $('.rwPage .pageCurrent').removeClass("pageCurrent");
            $(".rwPage li[data-id="+current+"]").find('a').addClass("pageCurrent");

            var indexStart = (current - 1) * pageSize, indexEnd = indexStart + pageSize - 1;
            $(".gratuity_list li").show();
            $(".gratuity_list li:lt(" + indexStart + "), .gratuity_list li:gt(" + indexEnd + ")").hide();

            if (current == 1) {
                $("#btnPrev").addClass("disabled");
            }else {
                $("#btnPrev").removeClass("disabled");
            }
            if (current == total) {
                $("#btnNext").addClass("disabled");
            }else {
                $("#btnNext").removeClass("disabled");
            }

            pagedot();

        })

        function pagedot(){

            if (total < 6) {
                $(".nextdot, .prevdot").hide();
            }else {

                if (current > 3) {
                    $('.prevdot').show();
                    $(".rwPage li").show();
                    $(".rwPage li:lt(" + current + ")").hide();


                    if (current > (total - 3)) {
                        $(".rwPage li:gt(" + (total - 3) + ")").show();
                        $('.nextdot').hide();
                    }else {
                        $(".rwPage li:gt(" + (current + 2) + ")").hide();
                        $('.nextdot').show();
                    }
                    $(".prevdot").show();

                }else {
                    $(".rwPage li").show();
                    $('.prevdot').hide();
                    $(".rwPage li:gt(5)").hide();
                    $('.nextdot').show();

                }

                $(".always").show();

            }
        }

    }

    function ssoLogin(info){

        $("#navLoginAfter, #navLoginBefore").remove();

    //已经登录
    if(info){

        //头部
        $(".topbarlink").append('<div class="userinfo" id="navLoginAfter"><div id="upic"><a href="'+info['userDomain']+'" target="_blank"><img onerror="javascript:this.src=\''+masterDomain+'/static/images/noPhoto_40.jpg\';" src="'+info['photo']+'" /></a></div><li><a href="'+info['userDomain']+'" id="uname" target="_blank">'+info['nickname']+'</a></li><li><a href="'+masterDomain+'/logout.html" class="logout">安全退出</a></li></div>');

        //评论
        $(".c-area .c-sub").html('<div class="np-login"><a href="'+info['userDomain']+'" target="_blank" class="u"><img onerror="javascript:this.src=\''+masterDomain+'/static/images/noPhoto_40.jpg\';" src="'+info['photo']+'" /><span>'+info['nickname']+'</span></a><a href="'+masterDomain+'/logout.html" class="o logout">安全退出</a></div><a href="javascript:;" class="subtn">发表</a>');

    }else{

        //头部
        $(".topbarlink").append('<div id="navLoginBefore" class="fn-left"><li><a href="javascript:;" id="login">登录</a></li><li><a href="{#$cfg_basehost#}/register.html">注册</a></li></div>');

        //评论
        $(".c-area .c-sub").html('<a href="javascript:;" class="subtn login">登录</a>');

    }

    }



    //点击关注

     $(".foll").bind("click", function(){
        var t = $(this),  txt = "已关注";

        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            huoniao.login();
            return false;
        }

        $(this).toggleClass('foll_active');
        if($(this).hasClass('foll_active')){
            $(this).find('label').text('已关注')
        }else{
            $(this).find('label').text('关注')
        }

        var x = t.offset().left, y = t.offset().top;
        $i.css({top: y - 10, left: x + 17, position: "absolute", "z-index": "10000", color: "#E94F06"});
        $("body").append($i);
        $i.animate({top: y - 50, opacity: 0, "font-size": "2em"}, 800, function(){
            $i.remove();
        });

        t.html("<i></i>"+txt);

        $.post("/include/ajax.php?service=member&action=collect&module=info&temp=detail&type="+type+"&id="+id);

    });


    // 信息举报
    var complain = null;
    $(".report").bind("click", function () {

        var domainUrl = masterDomain;
        complain = $.dialog({
            fixed: true,
            title: "信息举报",
            content: 'url:' + domainUrl + '/complain-article-detail-' + aid + '.html',
            width: 460,
            height: 300
        });
    });


})
