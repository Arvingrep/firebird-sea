$(function () {
    $('.summary .img a.f_img').abigimage();

    // 广告图
    $(".slideBox1").slide({titCell:".hd ul",mainCell:".bd",effect:"leftLoop",autoPlay:true,autoPage:"<li></li>",prevCell:".prev",nextCell:".next"});
    
    //导航全部分类
    $(".lnav").find('.category-popup').hide();
    $(".lnav").hover(function(){
        $(this).find(".category-popup").show();
    }, function(){
        $(this).find(".category-popup").hide();
    });

    //二维码效果
    $(".summary .morder").hover(function(){
        $(this).addClass("hide");
    }, function(){
        $(this).removeClass("hide");
    });

    //二维码
    $("#qrcode").qrcode({
        render: window.applicationCache ? "canvas" : "table",
        width: 66,
        height: 66,
        text: huoniao.toUtf8(window.location.href)
    });

    $('.appMapBtn').attr('href', OpenMap_URL);

    //收藏
    $(".favorite").bind("click", function(){
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
            txt = "收藏本店";
        }

        var $i = $("<b>").text(oper);
        var x = t.offset().left, y = t.offset().top;
        $i.css({top: y - 10, left: x + 17, position: "absolute", "z-index": "10000", color: "#E94F06"});
        $("body").append($i);
        $i.animate({top: y - 50, opacity: 0, "font-size": "2em"}, 2000, function(){
            $i.remove();
        });

        t.html("<s></s>"+txt);

        $.post("/include/ajax.php?service=member&action=collect&module=tuan&temp=store&type="+type+"&id="+detailID);

    });

    //举报
	var complain = null;
	$(".jb").bind("click", function(){

		var domainUrl = channelDomain.replace(masterDomain, "").indexOf("http") > -1 ? channelDomain.replace("/tuan", "") : masterDomain;
		complain = $.dialog({
			fixed: true,
			title: "团购商家举报",
			content: 'url:'+domainUrl+'/complain-tuan-store-'+detailID+'.html',
			width: 500,
			height: 300
		});
	});

    //消费评价
    //初始点击定位当前位置
    $("html").delegate(".carousel .thumb li", "click", function(){
        var t = $(this), carousel = t.closest(".carousel"), album = carousel.find(".album");
        if(album.is(":hidden")){
            t.addClass("on");
            $('html, body').animate({scrollTop: carousel.offset().top - 45}, 300);
            album.show();
        }
    });

    //收起图集
    $("html").delegate(".carousel .close", "click", function(){
        var t = $(this), carousel = t.closest(".carousel"), thumb = carousel.find(".thumb"), album = carousel.find(".album");
        album.hide();
        thumb.find(".on").removeClass("on");
    });


    var isLoad = 0;


    var atpage = 1, totalCount = 0, pageSize = 6;
    var ratelist = $(".ratelist"), loading = ratelist.find(".loading"), ul = $("#rateList");

    getComments();

    //获取评价
    function getComments(){
        loading.show();
        ul.html("");

        var data = [];
        data.push('aid='+detailID);
        data.push('page='+atpage);
        data.push('pageSize='+pageSize);
        data.push('filter='+$(".review-list .filter .current").data("filter"));
        data.push('orderby='+$(".review-list .filter select").val());

        $.ajax({
            url: masterDomain+"/include/ajax.php?service=tuan&action=getComment&type=tuan-store",
            data: data.join("&"),
            type: "POST",
            dataType: "jsonp",
            success: function (data) {
                loading.hide();
                if(data && data.state == 100){

                    var list = data.info.list,
                        pageinfo = data.info.pageInfo,
                        html = [];

                    totalCount = pageinfo.totalCount;
                    for(var i = 0; i < list.length; i++){
                        html.push('<li class="rate-item fn-clear">');
                        html.push('<div class="user-info">');

                        var photo = list[i].user.photo == "" ? staticPath+'images/noPhoto_40.jpg' : list[i].user.photo;

                        html.push('<a href="'+masterDomain+'/user/'+list[i].user.id+'"><img class="avatar" src="'+photo+'" /></a>');
                        html.push('<p><a href="'+masterDomain+'/user/'+list[i].user.id+'">'+list[i].user.nickname+'</a></p>');
                        html.push('</div>');
                        html.push('<div class="review">');
                        html.push('<div class="view">');
                        html.push('<p>'+list[i].content+'</p>');

                        //图集
                        var pics = list[i].pics;
                        if(pics.length > 0){
                            var thumbArr = [], albumArr = [];
                            for(var p = 0; p < pics.length; p++){
                                thumbArr.push('<li><a href="javascript:;"><img src="'+pics[p]+'" /></a></li>');
                                albumArr.push('<div class="aitem"><i></i><img src="'+pics[p]+'" /></div>');
                            }

                            html.push('<div class="carousel">');
                            html.push('<div class="thumb">');
                            html.push('<div class="plist">');
                            html.push('<ul>'+thumbArr.join("")+'<ul>');
                            html.push('</div>');

                            if(pics.length > 7){
                                html.push('<a href="javascript:;" class="sprev"><i></i></a>');
                                html.push('<a href="javascript:;" class="snext"><i></i></a>');
                            }
                            html.push('</div>');
                            html.push('<div class="album">');
                            html.push('<a href="javascript:;" hidefocus="true" class="prev"></a>');
                            html.push('<a href="javascript:;" hidefocus="true" class="close"></a>');
                            html.push('<a href="javascript:;" hidefocus="true" class="next"></a>');
                            html.push('<div class="albumlist">'+albumArr.join("")+'</div>');
                            html.push('</div>');
                            html.push('</div>');
                        }

                        html.push('</div>');
                        html.push('</div>');
                        html.push('</li>');
                    }

                    ul.html(html.join(""));
                    showPageInfo();

                    //切换效果
                    $(".ratelist").find(".carousel").each(function(){
                        var t = $(this), album = t.find(".album");
                        //大图切换
                        t.slide({
                            titCell: ".plist li",
                            mainCell: ".albumlist",
                            trigger:"click",
                            autoPlay: false,
                            delayTime: 0,
                            startFun: function(i, p) {
                                if (i == 0) {
                                    t.find(".sprev").click()
                                } else if (i % 8 == 0) {
                                    t.find(".snext").click()
                                }
                            }
                        });
                        //小图左滚动切换
                        t.find(".thumb").slide({
                            mainCell: "ul",
                            delayTime: 300,
                            vis: 10,
                            scroll: 8,
                            effect: "left",
                            autoPage: true,
                            prevCell: ".sprev",
                            nextCell: ".snext",
                            pnLoop: false
                        });
                    });
                    $(".carousel .thumb li.on").removeClass("on");

                }else{
                    ul.html('<li class="empty">'+data.info+'</li>');
                }
            },
            error: function(){
                loading.hide();
                ul.html('<li class="empty">网络错误，加载失败！</li>');
            }
        });
    }


    //打印分页
    function showPageInfo() {
        var info = $(".ratelist .pagination");
        var nowPageNum = atpage;
        var allPageNum = Math.ceil(totalCount/pageSize);
        var pageArr = [];

        info.html("").hide();

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
                    getComments();
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
                            getComments();
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
                            getComments();
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
                                    getComments();
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
                            getComments();
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
                    getComments();
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
                    getComments();
                } else {
                    $("#prependedInput").focus();
                }
            });

            info.show();

        }else{
            info.hide();
        }
    }





});