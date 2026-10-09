var huoniaoTools = {

    //转换PHP时间戳
    transTimes: function(timestamp, n){
        
        const dateFormatter = huoniao.dateFormatter(timestamp);
        const year = dateFormatter.year;
        const month = dateFormatter.month;
        const day = dateFormatter.day;
        const hour = dateFormatter.hour;
        const minute = dateFormatter.minute;
        const second = dateFormatter.second;
        
        if(n == 1){
            return (year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second);
        }else if(n == 2){
            return (year+'-'+month+'-'+day);
        }else if(n == 3){
            return (month+'-'+day);
        }else if(n == 4){
            return (hour+':'+minute);
        }else{
            return 0;
        }
    }
}
$(function(){
    //点赞
    var commentObj=$('#commentList');
    commentObj.delegate(".zan_num", "click", function(){
        var t = $(this), id = t.closest("li").attr("data-id");
        if(t.hasClass("active")) return false;
        var ncount = Number(t.text());
        var ncount1=ncount+1;

        if(id != "" && id != undefined){
            $.ajax({
                url: "/include/ajax.php?service=member&action=dingComment&type=add&id="+id,
                type: "GET",
                dataType: "json",
                success: function (data) {
                    t.addClass("active").html(ncount1);
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
    //统计评论的图片数量
    var img_num=$('.img_ul li').size();
    $('.img_num span').text(img_num);

     //放大图片
    $.fn.bigImage({
        artMainCon:".img_ul",  //图片所在的列表标签
    });
     //评论类型
    $('.goodMark ul').delegate('li', 'click', function(){
        $(this).addClass('active').siblings().removeClass('active')
        page=1;
        getList();
    })
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
        var h = $('.comm_c .comm_li').height();  
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - h - w;
        if ($(window).scrollTop() > scroll && !isload) {
            page++;
            getList();
        };
    });

    getList();

    //获取信息列表
    function getList(tr){

        // if(isload) return false;
        var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);
        data.push("aid="+id);
        var where = $('.goodMark li.active').data('id');
        where = where ? '&'+where : '';
        isload = true;
        if(page == 1){
            //数据加载中...
            $(".comm_c .all_ul").html('<div class="empty">'+langData['education'][4][1]+'</div>');
        }else{
            //数据加载中...
            $(".comm_c .all_ul").append('<div class="empty">'+langData['education'][4][1]+'</div>');
        }
        
        $.ajax({
            url: masterDomain + "/include/ajax.php?service=member&action=getComment&type=pension-store&isAjax=0&"+data.join("&")+where,
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
                    $(".empty").remove();
                    var html = [], list = data.info.list, pageInfo = data.info.pageInfo;

                    for (var i = 0; i < list.length; i++) {
                        var d = list[i];
                        if(d.content == '' && d.pics.length == 0) continue;

                        html.push('<li class="fn-clear comm_li" data-id="'+d.id+'">');
                        html.push('<div class="pic_l"><img src="'+(d.user.photo ? d.user.photo : (staticPath + 'images/noPhoto_60.jpg') )+'" alt=""></div>');
                        html.push('<div class="right_c">');
                        html.push('<p class="peo_name">'+(d.isanony==1 ? '匿名' : d.user.nickname)+'</p>');
                        html.push('<p class="comm_p">'+d.content+'</p>');
                        if(d.pics.length){
                            html.push('<div class="img_ul">');
                            html.push('<ul class="fn-clear">');
                            for(var n = 0; n < d.pics.length; n++){
                                if(n>2) break;
                                html.push('<li><img src="'+d.pics[n]+'" alt=""></li>');
                            }
                            html.push('</ul>');
                            html.push('<p class="img_num"><span>'+d.pics.length+'</span>张</p>');
                            html.push('</div>');
                        }
                        html.push('<div class="pub_time fn-clear">');
                        html.push('<span class="time">'+huoniaoTools.transTimes(d.dtime,3)+'<em class="clock">'+huoniaoTools.transTimes(d.dtime,4)+'</em></span>');
                        html.push('<p class="pub_hd"><span class="zan_num'+(d.zan_has == "1" ? " active" : "")+'">'+d.zan+'</span></p>');
                        html.push('</div>');
                        html.push('</div>');
                        html.push('</li>');
                    }

                    $('.comment_total').text(pageInfo.totalCount);
                    $('#comment_good').text(pageInfo.sco4 + pageInfo.sco5);
                    $('#comment_middle').text(pageInfo.sco2 + pageInfo.sco3);
                    $('#comment_bad').text(pageInfo.sco1);
                    $('#comment_pic').text(pageInfo.pic);

                    $('.proBox').each(function(i){
                        var t = $(this), s = t.find('s'), num = t.find('.num'), r = 0, n = 0;
                        if(i == 0){
                            n = pageInfo.sco5;
                        }else if(i == 1){
                            n = pageInfo.sco4;
                        }else if(i == 2){
                            n = pageInfo.sco3;
                        }else if(i == 3){
                            n = pageInfo.sco2;
                        }else if(i == 4){
                            n = pageInfo.sco1;
                        }
                        r = (n / pageInfo.totalCount * 100).toFixed(2);
                        s.width(r + '%');
                        num.text(n > 999 ? '999+' : n);
                    })

                    $('#comment_good_ratio').text(parseInt((pageInfo.sco4+pageInfo.sco5)/pageInfo.totalCount*100 ) + '%');
                    // $('.showlist').append(html.join(""));

                    if(page == 1){
                        $(".comm_c .all_ul").html("");
                        setTimeout(function(){$(".comm_c .all_ul").html(html.join(""))}, 200);
                    }else{
                        $(".comm_c .all_ul").append(html.join(""));
                    }
                    isload = false;

                    if(page >= pageInfo.totalPage){
                        isload = true;
                        if(page != 1){
                            $(".comm_c .all_ul").append('<div class="empty">到底了...</div>');
                        }
                    }

                }else{
                    if(page == 1){
                        $(".comm_c .all_ul").html("");
                    }
                    $(".comm_c .all_ul").html('<div class="empty">'+data.info+'</div>');
                }
            },
            error: function(){
                isload = false;
                if(page == 1){
                    $(".comm_c .all_ul").html("");
                }
                $(".comm_c .all_ul .empty").html('网络错误，加载失败...').show();
            }
        });

    }


})
