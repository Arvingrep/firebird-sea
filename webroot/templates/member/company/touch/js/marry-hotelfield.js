$(function () {
    var huoniao_ = {
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
            }else{
                return 0;
            }
        }
    };

    var atpage = 1, pageSize = 10, isload = false;

    $('.tab-box a').click(function () {
        var t = $(this), id = t.attr("data-state");
        if(!t.hasClass("active") && !t.hasClass('more')){
          state = id;
          atpage = 1;
          t.addClass("active").siblings("a").removeClass("active");
          getList(1);
        }
    });

    // 删除
    $(".list").delegate(".del", "click", function(){
        var t = $(this), par = t.closest(".car-box"), id = par.attr("data-id");
        if(id){
            var result = confirm(langData['siteConfig'][20][211]);
            if(result){
                $.ajax({
                    url: masterDomain+"/include/ajax.php?service=marry&action=operHotelfield&oper=del&id="+id,
                    type: "GET",
                    dataType: "jsonp",
                    success: function (data) {
                        if(data && data.state == 100){

                            //删除成功后移除信息层并异步获取最新列表
                            par.slideUp(300, function(){
                                par.remove();
                                setTimeout(function(){getList(1);}, 200);
                            });
                            alert(langData['siteConfig'][20][444]);

                        }else{
                            alert(data.info);
                        }
                    },
                    error: function(){
                        alert(langData['siteConfig'][20][183]);
                    }
                });

            }else{
            }
        }
    });

    // 下拉加载
    $(window).scroll(function() {
        var h = $('#list').height();
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
            $("#list").html('<div class="empty">'+langData['siteConfig'][20][184]+'</div>');
        }

        $.ajax({
            url: masterDomain+"/include/ajax.php?service=marry&action=hotelfieldList&u=1&orderby=5&state="+state+"&page="+atpage+"&pageSize="+pageSize,
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
                        var param = t + "do=edit&id=";
                        var urlString = editUrl + param;

                        html.push('<div class="car-box item" data-id="'+list[i].id+'" data-title="'+list[i].title+'">');
                        html.push('<div class="title fn-clear"><span style="color:#919191;font-size: .24rem;">'+langData['marry'][5][24]+'：'+huoniao_.transTimes(list[i].pubdate, 1)+'</span></div>');
                        html.push('<div class="car-item fn-clear">');
                        html.push('<div class="car-img fn-left"><a href="'+url+'"><img src="'+huoniao.changeFileSize(list[i].litpic, "small")+'" alt=""></a></div>');

                        html.push('<dl><a href="'+url+'">');
                        html.push('<dt>'+list[i].title+'</dt>');
                        html.push('<dd class="msg"><em>'+list[i].maxtable+langData['marry'][5][25]+'</em> <em>'+list[i].columnname+langData['marry'][5][26]+'</em> <span>'+list[i].fieldsname+'</span></dd>');
                        html.push('<dd class="info">'+langData['marry'][5][27]+' '+list[i].floorheight+'m '+langData['marry'][5][28]+' '+list[i].area+'m<sup>2</sup></dd>');
                        html.push('</a></dl>');
                        html.push('</div>');

                        html.push('<div class="o fn-clear"><a href="'+urlString+list[i].id+'" class="edit">'+langData['car'][5][41]+'</a><a href="javascript:;" class="del">'+langData['car'][5][42]+'</a></div>');

                        html.push('</div>');
                    }

                    $("#list").append(html.join(""));
                    isload = false;

                    if(atpage >= pageinfo.totalPage){
                        isload = true;
                        $("#list").append('<div class="empty">'+langData['marry'][5][29]+'</div>');
                    }

                    if(pageinfo.gray>0){
                        $("#gray").show().html(pageinfo.gray);
                    }else{
                        $("#gray").hide();
                    }
                    if(pageinfo.audit>0){
                        $("#audit").show().html(pageinfo.audit);
                    }else{
                        $("#audit").hide();
                    }
                    if(pageinfo.refresh>0){
                        $("#refuse").show().html(pageinfo.refresh);
                    }else{
                        $("#refuse").hide();
                    }
                }else{
                    $("#gray").hide().html(0);
                    $("#audit").hide().html(0);
                    $("#refuse").hide().html(0);
                    $("#list").html('<div class="empty">'+data.info+'</div>');
                }
            },
            error: function(){
                isload = false;
                //网络错误，加载失败
                $("#gray").hide().html(0);
                $("#audit").hide().html(0);
                $("#refuse").hide().html(0);
                $("#list .empty").html(''+langData['marry'][5][23]+'...').show();   
            }
        });
    }
});