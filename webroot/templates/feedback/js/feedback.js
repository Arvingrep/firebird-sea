$(function () {
    var userid = $.cookie(cookiePre+"login_user");
    if(  from !='wmsj' && userid == null || userid == ""  ){
        window.location.href = masterDomain+'/login.html';
        return false;
    }
       //提交评论回复
    $(".txt_box").delegate(".subtn", "click", function(){
        var t = $(this);
        if(t.hasClass("login") || t.hasClass("loading")) return false;

        var contentObj = $(".feednews"), content = contentObj.val();

        if(content == ""){
            alert("请输入您要评论的内容！");
            return false;
        }
        if(huoniao.getStrLength(content) > 200){
            alert("超过200个字了！");
        }
        var data = [];
        data.push("desc="+content);
        data.push("phone="+$("#phonetxt").val());
        $.ajax({
            url: "/include/ajax.php?service=member&action=suggestion",
            data: data.join("&"),
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    contentObj.val('');
                    alert('提交成功！');
                    location.reload();
                }else{
                    alert(data.info);
                }
            }
        });

    });

    getTuanData();
    //获取团购数据
    function getTuanData(){
        $(".feedlist").html('<div class="loading">正在获取，请稍后</div>');
    	$(".pagination").html('').hide();

    	var data = [];
    	data.push('page='+atpage);
    	data.push('pageSize='+pageSize);

        $.ajax({
            url: masterDomain + "/include/ajax.php?service=member&action=suggestionlist",
            type: "get",
            data: data.join("&"),
            dataType: "jsonp",
            success: function (data) {
                if (data.state == 100) {
                    var list = data.info.list,
                        html = [],
                        pageInfo  = data.info.pageInfo;
                        totalCount = pageInfo.totalCount;
                    for (var i = 0; i < list.length; i++) {
                        var d = list[i];
                        html.push('<li>');
                        html.push('<div class="uimg"><img src="'+(d.member.photo ? d.member.photo : (staticPath + 'images/noPhoto_60.jpg') )+'" alt=""></div>');
                        html.push('<p class="name">'+ d.member.nickname +'</p>');
                        html.push('<p class="time">'+ d.pubdate2 +'</p>');
                        html.push('<p class="info">'+ d.desc +'</p>');
                        if(d.note!='' && d.note!=null && d.note!=undefined){
                            html.push('<div class="reply"><div class="re-info"><span class="bt">网站回复:</span> <span class="time">'+ d.optime1 +'</span></div><p class="info">'+ d.note +'</p></div>');
                        }
                        html.push('</li> ');
                    }
                    $(".feedlist").html(html.join(""));
                    showPageInfo();
                } else {
                    $(".feedlist").html('<div class="empty">抱歉！ 未找到相关留言</div>');
                }
            },
            error: function(){
                $(".feedlist").html('<div class="empty">网络错误，请刷新重试</div>');
            }
        })
    }
    // getTuanData(1);


    //翻页
    $("#bar-area .pagination").delegate("a", "click", function(){
        var cla = $(this).attr("class");
        if(cla == "pg-prev"){
            atpage -= 1;
        }else{
            atpage += 1;
        }
        getTuanData();
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
            pageList.push('<a href="javascript:;" class="pg-prev"><i class="trigger"></i><span class="text">上一页</span></a>');
        }else{
            pageList.push('<span class="pg-prev"><i class="trigger"></i><span class="text">上一页</span></span>');
        }

        //下一页
        if(atpage >= allPageNum){
            pageList.push('<span class="pg-next"><span class="text">下一页</span><i class="trigger"></i></span>');
        }else{
            pageList.push('<a href="javascript:;" class="pg-next"><span class="text">下一页</span><i class="trigger"></i></a>');
        }

        //页码统计
        pageList.push('<span class="sum"><em>'+atpage+'</em>/'+allPageNum+'</span>');

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
                    getTuanData();
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
                            getTuanData();
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
                            getTuanData();
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
                                    getTuanData();
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
                            getTuanData();
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
                    getTuanData();
                }
                info.find(".pagination-pages").append(next);
            }

            // //输入跳转
            // var insertNum = Number(nowPageNum + 1);
            // if (insertNum >= Number(allPageNum)) {
            //     insertNum = Number(allPageNum);
            // }
            //
            // var redirect = document.createElement("div");
            // redirect.className = "redirect";
            // redirect.innerHTML = '<i>到</i><input id="prependedInput" type="number" placeholder="页码" min="1" max="'+allPageNum+'" maxlength="4"><i>页</i><button type="button" id="pageSubmit">确定</button>';
            // info.find(".pagination-pages").append(redirect);

            //分页跳转
            info.find("#pageSubmit").bind("click", function(){
                var pageNum = $("#prependedInput").val();
                if (pageNum != "" && pageNum >= 1 && pageNum <= Number(allPageNum)) {
                    atpage = Number(pageNum);
                    getTuanData();
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