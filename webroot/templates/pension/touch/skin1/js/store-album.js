$(function(){
    //相册 详细信息 
    $('.head_wrap .detail_tab li').click(function(){
        $(this).addClass('active').siblings().removeClass('active');
        var i = $(this).index();
        $('.con_wrap').eq(i).addClass('con_show').siblings().removeClass('con_show');
    });
     //放大图片
    $.fn.bigImage({
        artMainCon:".album_wrap",  //图片所在的列表标签
    });
     //联系方式弹出
    $('.org_footer').delegate('.contact', 'click', function(){
        $('.contact_mask').show();

    })
    //联系方式关闭
    $('.contact_mask').delegate('.know', 'click', function(){
        $('.contact_mask').hide();

    })
    // 下拉加载
    var isload = isend = false;
    $(window).scroll(function() {
        var h = $('.album_wrap ul li').height();  
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - h - w;
        if ($(window).scrollTop() > scroll && !isload && !isend) {
            page++;
            getList();
        };
    });

    getList();

    //获取信息列表
    function getList(tr){

        if(isload) return false;
        var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);
        data.push("store="+infoData.id);
        isload = true;
        if(page == 1){
            //数据加载中...
            $(".album_wrap ul").html('<div class="empty">'+langData['education'][4][1]+'</div>');
        }else{
            //数据加载中...
            $(".album_wrap ul").append('<div class="empty">'+langData['education'][4][1]+'</div>');
        }
        
        $.ajax({
            url: masterDomain + "/include/ajax.php?service=pension&action=albumsList&"+data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
                    $(".empty").remove();
                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo;

                    for (var i = 0; i < list.length; i++) {
                        html.push('<li>');
                        html.push('<div class="det_img"><img src="'+list[i].litpic+'" alt=""></div>');
                        html.push('<p class="det_p">'+list[i].title+'</p>');
                        html.push('</li>');             
                    }

                    if(page == 1){
                         $(".album_wrap ul").html("");
                      
                        setTimeout(function(){$(".album_wrap ul").html(html.join(""))}, 200);
                       
                    }else{
                     
                        $(".album_wrap ul").append(html.join(""));
                        
                    }
                    isload = false;

                    if(page >= pageinfo.totalPage){
                        isload = true;
                        if(page != 1){
                            $(".album_wrap ul").append('<div class="empty">到底了...</div>');
                        }
                    }

                }else{
                    if(page == 1){
                        $(".album_wrap ul").html("");
                    }
                    $(".album_wrap ul").html('<div class="empty">'+data.info+'</div>');
                }
            },
            error: function(){
                isload = false;
                if(page == 1){
                    $(".album_wrap ul").html("");
                }
                $(".album_wrap ul .empty").html('网络错误，加载失败...').show();
            }
        });

    }


})
