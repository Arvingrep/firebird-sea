/**
 * Created by Administrator on 2018/5/22.
 */
$(function(){
    var commentObj = $("#commentList");

    //评论登录
    $(".comment").delegate(".login", "click", function(){
        if ($.browser.msie && ($.browser.version == "6.0") && !$.support.style) {
            $("html, body").scrollTop(0);
        }
        huoniao.login();
    });


    //评论筛选【时间、热度】
    $(".c-orderby a").bind("click", function(){
        if(!$(this).hasClass("active")){
            $(".c-orderby a").removeClass("active");
            $(this).addClass("active");

            commentObj.attr("data-page", 1).html('<div class="loading"></div>');
            $("#loadMore").removeClass().hide();

            loadComment();
        }
    });

    //加载评论
    function loadComment(){
        if(id && id != undefined){
            var page = commentObj.attr("data-page");
            var orderby = $(".c-orderby .active").attr('data-id');
            //异步获取用户信息
            $.ajax({
                url: "/include/ajax.php?service=member&action=getComment&type=quanjing-detail&son=1&aid="+id+"&page="+page+"&orderby="+orderby,
                type: "GET",
                dataType: "jsonp",
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
                        $('#count').text(pageInfo.totalCount);

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

            var photo = list[i].user['photo'] == "" ? staticPath+'images/noPhoto_40.jpg' : huoniao.changeFileSize(list[i].user['photo'], "small");

            html.push('  <img onerror="javascript:this.src=\''+staticPath+'images/noPhoto_40.jpg\';" data-uid="'+list[i].user['userid']+'" src="'+photo+'" alt="'+list[i].user['nickname']+'">');
            html.push('  <div class="c-body">');
            html.push('    <div class="c-header">');
            html.push('      <a href="javascript:;" class="colorAnimate"  data-id="'+list[i].user['userid']+'">'+list[i].user['nickname']+'</a>');
            html.push('      <span>'+list[i]['ftime']+'</span>');
            html.push('    </div>');
            html.push('    <p>'+list[i]['content']+'</p>');
            html.push('    <div class="c-footer">');

            var praise = "praise";
            if(list[i]['zan_has'] == 1){
                praise = "praise active";
            }
            html.push('      <a href="javascript:;" class="'+praise+'"><s></s>(<em>'+list[i]['zan']+'</em>)</a>');

            html.push('      <a href="javascript:;" class="reply"><s></s>回复(<em>'+(list[i]['lower']!=undefined && list[i]['lower'].count ? list[i]['lower'].count : 0)+'</em>)</a>');
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

    loadComment();

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
                    t.addClass("active").html('<s></s>(<em>'+(ncount+1)+'</em>)');

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

        var areaObj = $(this).closest(".c-body"), replaytemp = $("#replaytemp").html();
        if(areaObj.find(".c-area").html() == "" || areaObj.find(".c-area").html() == undefined){
            areaObj.append(replaytemp);
            clearContenteditableFormat(areaObj.find(".c-area .textarea"));
        }
        areaObj.find(".c-area").stop().slideToggle("fast");

    });

    //提交评论回复
    $(".comment").delegate(".subtn", "click", function(){
        var t = $(this), cid = t.closest("li").attr("data-id");

        if(t.hasClass("login") || t.hasClass("loading")) return false;

        var contentObj = t.closest(".c-area").find(".textarea"),
            content = contentObj.html();

        if(content == ""){
            return false;
        }
        if(huoniao.getStrLength(content) > 200){
            alert("超过200个字了！");
        }

        if(cid == undefined){
            var url = '/include/ajax.php?service=member&action=sendComment&check=1&type=quanjing-detail&aid=' + id;
        }else{
            var url = '/include/ajax.php?service=member&action=replyComment&check=1&id=' + cid;
        }
        cid = cid == undefined ? 0 : cid;

        t.addClass("loading");

        $.ajax({
            url: url,
            data: "content="+content,
            type: "POST",
            dataType: "json",
            success: function (data) {
                console.log(data)
                t.removeClass("loading");
                contentObj.html("");
                if(data && data.state == 100){

                    var info = data.info;
                    var list = [];

                    var photo = info.userinfo['photo'] == "" ? staticPath+'images/noPhoto_40.jpg' : huoniao.changeFileSize(info.userinfo['photo'], "small");

                    list.push('<li class="fn-clear colorAnimate" data-id="'+info['id']+'">');
                    list.push('  <img data-uid="'+info.userinfo['userid']+'" src="'+photo+'" alt="'+info.userinfo['nickname']+'">');
                    list.push('  <div class="c-body">');
                    list.push('    <div class="c-header">');
                    list.push('      <a href="javascript:;" class="colorAnimate"  data-id="'+info.userinfo['userid']+'">'+info.userinfo['nickname']+'</a>');
                    list.push('      <span>'+info['ftime']+'</span>');
                    list.push('    </div>');
                    list.push('    <p>'+info['content']+'</p>');
                    list.push('    <div class="c-footer">');
                    list.push('      <a href="javascript:;" class="praise"><s></s>(<em>'+info['zan']+'</em>)</a>');
                    list.push('      <a href="javascript:;" class="reply">回复(<em>'+(info['lower'] ? info['lower'].list.length : 0)+'</em>)</a>');
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

                }
            }
        });

    });



});




