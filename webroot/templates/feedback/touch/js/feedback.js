$(function () {

    //点击发布
    $('#sendBtn').click(function () {

        var userid = $.cookie(cookiePre+"login_user");
        if(  from !='wmsj' && userid == null || userid == ""  ){
          window.location.href = masterDomain+'/login.html';
          return false;
        }

        var t = $(this);
        var contentObj = $(".feednews"), content = contentObj.val();
        if(content == ""){
            alert("请输入您要评论的内容！");
            return false;
        }
        if(huoniao.getStrLength(content) > 200){
            alert("超过200个字了！");
            return false;
        }
        var data = [];
        data.push("desc="+content);
        data.push("phone="+$("#phone").val());
        $.ajax({
            url: "/include/ajax.php?service=member&action=suggestion",
            data: data.join("&"),
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    contentObj.val('');
                    showErrAlert('提交成功')
                    // alert('提交成功！');
                    // location.reload();
                }else{
                    alert(data.info);
                }
            }
        });


    });

    $('.list_box').hide();


    //上滑加载更多
    $(window).scroll(function() {
        var h = $('.load').height();
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - h - w;

        //已经到底部，并且数据不在请求状态
        if ($(window).scrollTop() > scroll && !isload) {
            $('.load').hide();
            $('.list_box').show();
        };
    });



    var page = 1, totalPage, isload =false;

    getList(1);

    //获取意见列表
    function getList(tr){
        isload = true;

        if(tr){
            page = 1;
            $("#feed_list").html("");
        }

        $("#feed_list").append('<div class="loading">'+langData['siteConfig'][20][184]+'</div>');
        $(".loading").remove();

        $.ajax({
            url: masterDomain + "/include/ajax.php?service=member&action=suggestionlist&page=" + page + "&pageSize=10",
            type:'GET',
            dataType: "jsonp",
            success:function (data) {
                if(data.state==100){
                    $(".loading").remove();
                    var list = data.info.list;
                    var pageInfo = data.info.pageInfo;
                    var html = [];
                    for(var i = 0; i < list.length; i++){
                        var d = list[i];

                        html.push('<li>');
                        html.push('<div class="use_msg fn-clear">');
                        html.push('<div class="img"><img src="'+(d.member.photo ? d.member.photo : (staticPath + 'images/noPhoto_60.jpg') )+'" alt=""></div>');
                        html.push('<div class="msg"><p class="name">'+ d.member.nickname +'</p><p class="time">'+ d.pubdate1 +'</p></div>');
                        html.push('</div>');
                        html.push('<div class="info">'+ d.desc +'</div>');
                        if(d.note!='' && d.note!=null && d.note!=undefined){
                            html.push('<div class="reply"><div class="re-info"><span class="bt">网站回复:</span> <span class="time">'+ d.optime1 +'</span></div><p class="info">'+ d.note +'</p></div>');
                        }
                        html.push('</li>');
                    }
                    isload = false;
                  
                    $("#feed_list").append(html.join(""));
                    $('.list_box').show();

                    if(page >= pageInfo.totalPage){
                        isload = true;
                        $(".loading").remove();
                        $("#feed_list").append('<div class="loading">'+langData['siteConfig'][18][7]+'</div>');
                    }
                }else{
                    isload = true;
                    $(".loading").remove();
                    $("#feed_list").append('<div class="loading">'+data.info+'</div>');
                }
            },
            error: function () {
                $("#feed_list").append('<div class="loading">数据加载失败，请刷新后重新尝试</div>');
                isload = false;
            }
        });

    }


    // 下拉加载

    $(window).scroll(function() {
        var h = $('.feedlist li').height();
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - h - w - 10;

        //已经到底部，并且数据不在请求状态
        if ($(window).scrollTop() > scroll && !isload) {
            page++;
            isload = true;
            getList();
        };
    });





});