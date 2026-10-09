$(function () {
    // 判断浏览器是否是ie8
    if($.browser.msie && parseInt($.browser.version) >= 8){

        $("#txt").ajaxComplete(function(){
            $('.container ul.list li:nth-child(3n)').css('margin-right','0');
        });

        $('#date').val('选择时间');


    }


    $('.nav li').hover(function () {
        $(this).toggleClass('active');
    });
    $('#date').hover(function () {
        $(this).addClass('active');
    },function(){
        $(this).removeClass('active');
    });


    $('.nav-box .choose-box li').click(function () {
        $(this).addClass('active').siblings().removeClass('active');
    });

    $('body').delegate('.nav-box .choose-box li span','click',function () {
        $('.nav li.edit span').html($(this).text());
        $('.nav-box .choose-box').removeClass('show');
    })

    $(document).bind('click',function(e){
        var e = e || window.event; //浏览器兼容性
        var elem = e.target || e.srcElement;
        while (elem) { //循环判断至跟节点，防止点击的是div子元素
            if (elem.id && elem.id=='edit') {
                return;
            }
            elem = elem.parentNode;
        }

        $('.nav-box .choose-box').removeClass('show'); //点击的不是div或其子元素
    });
    $('.nav li.edit').click(function () {
        $('.nav-box .choose-box').toggleClass('show');
    });



    var pageSize = 6;
    var atpage =1;
    getList();
    //获取数据
    function getList(type){
        var orderby = $("#bar-area .l").find(".active").attr("data-sort");


        var item = [];
        $(".filter-wrapper .items").each(function(){
            var t = $(this), field = t.data("field").replace("field_", ""), active = t.find(".active");
            if(!active.hasClass("qb")){
                item.push(field+","+active.text());
            }
        });

        var flag = [];
        $(".flags label").each(function(){
            var t = $(this);
            t.hasClass("curr") ? flag.push(t.data("val")) : "";
        });

        $("#mod-item .loading").html("加载中，请稍候...").show();
        $.ajax({
            url: "/include/ajax.php?service=paper&action=store&pageSize="+pageSize+"&typeid=0&addrid=0&business=0&subway=0&station=0&&page="+atpage,
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                $("#mod-item .loading").hide();
                if(data && data.state == 100 && data.info.list.length > 0){
                    var datalist = data.info.list,
                        pageinfo = data.info.pageInfo,
                        html = [];
                    for(var i = 0; i < datalist.length; i++){
						if(datalist[i].forum){
	                        html.push('<li>');
	                        html.push('<a class="fn-clear" target="_blank" href="'+datalist[i].forum.url+'">');
	                        html.push('<div class="img-box"><div class="img"><img src="'+datalist[i].forum.litpic+'" alt=""></div></div>');
	                        html.push('<div class="info">');
	                        html.push('<p class="name">'+datalist[i].title+'</p>');
	                        html.push('<p class="time">'+datalist[i].forum.date+'</p>');
	                        html.push('<a class="btn_others" href="'+datalist[i].url+'">'+langData['paper'][0][17]+'</a>'); //全部往期
	                        html.push('</div>');
	                        html.push('</a>');
	                        html.push('</li>');
						}
                    }

                    $("#mod-item ul").html(html.join(""));

                    totalCount = pageinfo.totalCount;

                    showPageInfo();

                }else{
                    $("#mod-item ul").empty();
                    $("#mod-item .loading").html(""+langData['paper'][0][18]+"").show();//暂无数据
                    $("#mod-item .pagination").html("").hide();

                }
            }
        });
    }


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
                    $("#mod-item ul").html(" ");
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
                            $("#mod-item ul").html(" ");
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
                            $("#mod-item ul").html(" ");
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
                                    $("#mod-item ul").html(" ");
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
                            $("#mod-item ul").html(" ");
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
                    $("#mod-item ul").html(" ");
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
            redirect.innerHTML = '<input id="prependedInput" type="number" placeholder="" min="1" max="'+allPageNum+'" maxlength="4"><i>页</i><button type="button" id="pageSubmit">GO</button>';
            info.find(".pagination-pages").append(redirect);

            //分页跳转
            info.find("#pageSubmit").bind("click", function(){
                var pageNum = $("#prependedInput").val();
                if (pageNum != "" && pageNum >= 1 && pageNum <= Number(allPageNum)) {
                    atpage = Number(pageNum);
                    $("#mod-item ul").html(" ");
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





});
