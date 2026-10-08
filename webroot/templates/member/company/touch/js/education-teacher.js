$(function () {
    var atpage = 1, pageSize = 10, isload = false;

    //信息提示框
    function showMsg(){
      var alert_tip = $(".alert_tip");
      alert_tip.show();
    }
    function closeMsg(){
      var alert_tip = $(".alert_tip");
      alert_tip.hide();
    }

    $(".wrap").delegate(".del","click",function(){ 
        var that = $(this);
        var id   = that.attr('data-id');
        showMsg();
        
        $('.yes').click(function(){
            if(id){
                $.ajax({
                    url: masterDomain+"/include/ajax.php?service=education&action=operTeacher&oper=del&id="+id,
                    type: "GET",
                    dataType: "jsonp",
                    success: function (data) {
                        if(data && data.state == 100){
                            //删除成功后移除信息层并异步获取最新列表
                            that.parents('.fuwu_peo').remove();
                            closeMsg()
                            setTimeout(function(){getList(1);}, 200);
                        }else{
                            alert(data.info);
                        }
                    },
                    error: function(){
                        alert(langData['siteConfig'][20][183]);
                    }
                });
            }
        });

        $('.no').click(function(){
            closeMsg()
        })
    });

    // 下拉加载
    $(window).scroll(function() {
        var h = $('.cont_ul').height();
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w - h;
        if ($(window).scrollTop() > scroll && !isload) {
            atpage++;
            getList();
        };
    });

    getList(1);

    function getList(tr){

        isload = true;
        if(tr){
            $(".cont_ul").html('<div class="empty">'+langData['siteConfig'][20][184]+'</div>');
        }

        $.ajax({
            url: masterDomain+"/include/ajax.php?service=education&action=teacherList&u=1&orderby=2&state="+state+"&page="+atpage+"&pageSize="+pageSize,
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
                    $(".empty").remove();
                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    for (var i = 0; i < list.length; i++) {
                        var url = list[i].state == 1 ? list[i].url : 'javascript:;';

                        var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";
                        var param = t + "id=";
                        var urlString = editUrl + param;

                        html.push('<li class="fuwu_peo fn-clear">');
                        html.push('<span data-id="'+list[i].id+'" class="tutor del">'+langData['education'][3][20]+'</span>');//删除 
                        html.push('<a href="'+urlString+list[i].id+'">');
                        html.push('<div class="teacher_info fn-clear">');
                        html.push('<div class="left_b"><img src="'+huoniao.changeFileSize(list[i].photo, "small")+'" alt=""></div>');
                        html.push('<div class="right_b fn-clear">');
                        var sex = list[i].sex == 1 ? 'sex_nan' : 'sex_nv';
                        html.push('<div class="tec_name"><h1>'+list[i].name+'</h1><span class="'+sex+'"></span></div>');
                        html.push('<div class="tec_class">'+langData['siteConfig'][45][98]+'：'+list[i].courses+'</div>');//主授课程
                        var sk1 = list[i].certifyState == 1 ? '<span class="sk1">'+langData['siteConfig'][47][67]+'</span>' : '';//身份认证
                        var sk2 = list[i].degreestate == 1 ? '<span class="sk2">'+langData['siteConfig'][47][68]+'</span>' : '';//学历认证
                        html.push('<div class="tec_skill">'+sk1+sk2+'</div>');
                        html.push('</div>');
                        html.push('</div>');
                        html.push('</a>');
                        html.push('</li>');
                    }

                    $(".cont_ul").append(html.join(""));
                    isload = false;

                    if(atpage >= pageinfo.totalPage){
                        isload = true;
                        $(".cont_ul").append('<div class="empty">'+langData['marry'][5][29]+'</div>');
                    }

    				$("#total").html(pageinfo.totalCount);
                }else{
                    isload = false;
                    $(".cont_ul").html('<div class="empty">'+data.info+'</div>');
                }
            },
            error: function(){
                isload = false;
                //网络错误，加载失败
                $(".cont_ul .empty").html(''+langData['marry'][5][23]+'...').show();   
            }
        });

    }

});