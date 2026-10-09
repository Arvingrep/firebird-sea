$(function(){
    var commentObj = $("#commentList"), isload = false;
    //导航
    var device = navigator.userAgent;
    // 判断设备类型，ios全屏
    if (device.indexOf('huoniao_iOS') > -1) {
        $('.header').addClass('padTop20');
    }

    // parse slide data (url, title, size ...) from DOM elements
    // (children of gallerySelector)

    // --------------------------评论 s
    var atpage = 1, totalPage = 1;
    var commonTop = $('.fabu-comment').offset().top - $('.head').height();
    // 加载更多
    // $(".see-more").bind("click", function(){
    //     getReplyList(1);
    // });
    //顶
    commentObj.delegate(".praise", "click", function(){
        var t = $(this), id = t.closest("li").attr("data-id");
        if(t.hasClass("active")) return false;
        if(id != "" && id != undefined){
            $.ajax({
                url: "/include/ajax.php?service=member&action=dingComment&type=add&id="+id,
                type: "GET",
                dataType: "jsonp",
                success: function (data) {
                    var ncount = Number(t.text());
                    t.addClass("active").html('<s></s><em>'+(ncount+1)+'</em>');

                    //加1效果
                    var $i = $("<b>").text("+1");
                    var x = t.offset().left, y = t.offset().top;
                    $i.css({top: y - 10, left: x + 17, position: "absolute", color: "#4f8cfa"});
                    $("body").append($i);
                    $i.animate({top: y - 50, opacity: 0, "font-size": "2em"}, 800, function(){
                        $i.remove();
                    });

                }
            });
        }
    });


    //获取评论
    function getReplyList(go){
        if(isload) return;
        isload = true;
        if(go){
            atpage = 1;
            commentObj.html("");
        }
        $('.loading').show();
        $.ajax({
            url: "/include/ajax.php?service=member&action=getComment&type=quanjing-detail&son=1&aid="+id+"&page="+atpage+"&pageSize=10",
            type: "GET",
            dataType: "jsonp",
            success: function (data) {

                if(data && data.state == 100){
                    var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
                    $('#count').text('('+pageInfo.totalCount+')');
                    if(list.length > 0){
                        for(var i = 0; i < list.length; i++){
                            var src = staticPath+'images/noPhoto_100.jpg';
                            if(list[i].user.photo){
                                src = huoniao.changeFileSize(list[i].user.photo, "middle");
                            }

                            html.push('<li class="fn-clear" data-id="'+list[i].id+'" data-uid="'+list[i].userid+'" data-name="'+list[i].user.nickname+'">');
                            html.push('<img src="'+src+'" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_40.jpg\';">');
                            html.push('<div class="c-body">');
                            html.push('<div class="c-header">');
                            html.push('<a href="'+masterDomain+'/user/'+list[i].userid+'" class="c-name ">'+list[i].user.nickname+'</a>');
                            html.push('<div class="c-right">');
                            var praise = "praise";
                            if(list[i]['zan_has'] == 1){
                                praise = "praise active";
                            }
                            html.push('<a href="javascript:;" class="'+praise+'"><s></s><em>'+list[i].zan+'</em></a>');
                            html.push('<a href="javascript:;" class="reply"><s></s>回复</a>');
                            html.push('</div>');
                            html.push('</div>');
                            html.push('<p class="c-time">'+list[i].ftime+'</p>');
                            html.push('<p>'+list[i].content+'</p>');
                            html.push('</div>');
                            html.push('</li>');

                            if(list[i]['lower']!=undefined && list[i]['lower'].count > 0 && list[i]['lower'].list!=null){
                                html.push(getLowerReply(list[i].lower.list, list[i].user));
                            }
                        }
                        isload = false;
                        $('.loading').hide();
                        commentObj.append(html.join(""));
                    }else{
                        $('.loading').removeClass('ing').text(pageInfo.totalCount ? '已加载全部评论！' : '暂无相关评论');
                    }

                    $('.commcount').text(pageInfo.totalCount);

                }else{
                    $('.loading').removeClass('ing').html('暂无相关评论');
                    $('.see-more').hide();
                }
            },
            error: function(){
                isload = false;
                $('.loading').html('网络错误，请重试！');
            }
        });
    }

    //评论子级
    function getLowerReply(arr, member){
        if(arr){
            var html = [];
            for(var i = 0; i < arr.length; i++){
                var src = staticPath+'images/noPhoto_100.jpg';
                if(arr[i].user.photo){
                    src = huoniao.changeFileSize(arr[i].user.photo, "middle");
                }

                html.push('<li class="fn-clear" data-id="'+arr[i].id+'" data-uid="'+arr[i].userid+'" data-name="'+arr[i].user.nickname+'">');
                html.push('<img src="'+src+'" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_40.jpg\';">');
                html.push('<div class="c-body">');
                html.push('<div class="c-header">');
                html.push('<a href="javascript:;" class="c-name ">'+arr[i].user.nickname+'</a>');
                html.push('<div class="c-right">');
                var praise = "praise";
                if(arr[i]['zan_has'] == 1){
                    praise = "praise active";
                }
                html.push('<a href="javascript:;" class="'+praise+'"><s></s><em>'+arr[i].zan+'</em></a>');
                html.push('<a href="javascript:;" class="reply"><s></s>回复</a>');
                html.push('</div>');
                html.push('</div>');
                html.push('<p class="c-time">'+arr[i].ftime+'</p>');
                html.push('<p>回复 <a href="'+masterDomain+'/user/'+member.userid+'" class="c-name">'+member.nickname+'</a>：'+arr[i].content+'</p>');
                html.push('</div>');
                html.push('</li>');

                if(arr[i]['lower']!=undefined && arr[i]['lower'].count > 0 && arr[i]['lower'].list!=null){
                    html.push(getLowerReply(arr[i].lower.list, arr[i].user));
                }
            }
            return html.join("");
        }
    }

    $(window).scroll(function(){
        var wsct = $(window).scrollTop();
        if(!isload && wsct + $(window).height() > commonTop){
            atpage++;
            getReplyList();
        }
    })


    getReplyList();
    var rid = 0, ruid = 0, runame = '', sct = 0;
    // 发表评论
    $('.fabu-comment').click(function(){
        rid = 0;
        ruid = uid;
        runame = uname;
        replyFun();
    })
    // 发表回复
    $('#commentList').delegate(".reply","click",function(){
        var t = $(this).closest('li');
        rid = t.data('id');
        ruid = t.data('uid');
        runame = t.data('name');
        replyFun();
    })

    function replyFun(){
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            location.href = masterDomain + '/login.html';
            return false;
        }

        sct = $(window).scrollTop();

        $('body').addClass('fixed');

        $('.layer').addClass('show').animate({"left":"0%"},100);

        $('.editor .img').css("display","table-cell");
    }

      //发表回复
    $(".top-r").bind("click", function(){
        var t = $(this), content = $(".textarea").html();
        if(!t.hasClass("disabled") && $.trim(content) != ""){
            t.addClass("disabled");

            if(rid == '' || rid == undefined){
                var url = '/include/ajax.php?service=member&action=sendComment&check=1&type=quanjing-detail&aid=' + id;
            }else{
                var url = '/include/ajax.php?service=member&action=replyComment&check=1&id=' + rid;
            }
            $.ajax({
                url: url,
                data: "content="+encodeURIComponent(content),
                type: "POST",
                dataType: "json",
                success: function (data) {
                    t.removeClass("disabled");
                    if(data && data.state == 100){
                        var info = data.info;
                        $(".top-l").click();
                        $('.top-r').text('发表成功！');
                        $('.layer').animate({"left":"100%"},1,function(){
                            $('.layer').removeClass('show');

                            getReplyList(1);

                            t.removeClass("disabled").text('发表');
                        });
                    }else{
                        t.removeClass("disabled").text('发表');
                        alert(data.info);
                    }
                },
                error: function(){
                    t.removeClass("disabled").text('发表');
                    alert("网络错误，发表失败，请稍候重试！");
                }
            });
        }
    });

    // 隐藏回复
    $('.top-l').click(function(){
        $('body').removeClass('fixed');
        $(window).scrollTop(sct);
        $('.layer').removeClass('show').animate({"left":"100%"},100);
        $('.layer .textarea').html('');
    });

    // 选择表情
    var memerySelection;
    $('.editor .emotion').click(function(){
        var t = $(this), box = $('.emotion-box');
        memerySelection = window.getSelection();
        if (box.css('display') == 'none') {
        $('.emotion-box').show();
        t.addClass('on');
        return false;
    }else {
        $('.emotion-box').hide();
        t.removeClass('on');
    }
    });

    $('.emotion-box li').click(function(){
        var t = $(this).find('img'), textarea = $('.textarea'), hfTextObj = textarea;
        hfTextObj.focus();
        pasteHtmlAtCaret('<img src="'+t.attr("src")+'" />');
    });

    //根据光标位置插入指定内容
    function pasteHtmlAtCaret(html) {
      var sel, range;
      if (window.getSelection) {
          sel = memerySelection;
          if (sel.getRangeAt && sel.rangeCount) {
              range = sel.getRangeAt(0);
              range.deleteContents();
              var el = document.createElement("div");
              el.innerHTML = html;
              var frag = document.createDocumentFragment(), node, lastNode;
              while ( (node = el.firstChild) ) {
                  lastNode = frag.appendChild(node);
              }
              range.insertNode(frag);
              if (lastNode) {
                  range = range.cloneRange();
                  range.setStartAfter(lastNode);
                  range.collapse(true);
                  sel.removeAllRanges();
                  sel.addRange(range);
              }
          }
      } else if (document.selection && document.selection.type != "Control") {
          document.selection.createRange().pasteHTML(html);
      }
    }

    //光标定位到最后
    function set_focus(el){
        el=el[0];
        el.focus();
        if($.browser.msie){
            var rng;
            el.focus();
            rng = document.selection.createRange();
            rng.moveStart('character', -el.innerText.length);
            var text = rng.text;
            for (var i = 0; i < el.innerText.length; i++) {
                if (el.innerText.substring(0, i + 1) == text.substring(text.length - i - 1, text.length)) {
                    result = i + 1;
                }
            }
        }else{
            var range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }
    // --------------------------评论 e






})
