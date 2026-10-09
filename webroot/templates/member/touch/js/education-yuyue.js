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
      }else if(n == 4){
        return (hour+':'+minute);
      }else if(n == 5){
        return (month+'/'+day);
      }else{
        return 0;
      }
    }
    /**
     * 获取附件不同尺寸
     * 此功能只适用于远程附件（非FTP模式）
     * @param string url 文件地址
     * @param string width 兼容老版本(small/middle)
     * @param int width 宽度
     * @param int height 高度
     * @return string *
     */ 
     ,changeFileSize: function(url, width, height){
        if(url == "" || url == undefined) return "";
    
        //小图尺寸
        if(width == 'small'){
            width = 200;
            height = 200;
        }
    
        //中图尺寸
        if(width == 'middle'){
            width = 500;
            height = 500;
        }
    
        //默认尺寸
        width = typeof width === 'number' ? width : 800;
        height = typeof height === 'number' ? height : 800;
    
        //阿里云、华为云
        url = url.replace('w_4096', 'w_' + width);
        url = url.replace('h_4096', 'h_' + height);
    
        //七牛云
        url = url.replace('w/4096', 'w/' + width);
        url = url.replace('h/4096', 'h/' + height);
    
        //腾讯云
        url = url.replace('4096x4096', width+"x"+height);
    
        return url;
    
        // 以下功能弃用
      if(to == "") return url;
      var from = (from == "" || from == undefined) ? "large" : from;
      var newUrl = "";
      // if(hideFileUrl == 1){
      //   newUrl =  url + "&type=" + to;
      // }else{
        newUrl = url.replace(from, to);
      // }

      return newUrl;
    }
}

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


    $(".wrap").delegate(".tel","click",function(){
        var that=$(this)
        var id   = that.attr('data-id');
        if(id){
            $.ajax({
                url: masterDomain+"/include/ajax.php?service=education&action=booking&oper=update&id="+id,
                type: "GET",
                dataType: "jsonp",
                success: function (data) {
                    if(data && data.state == 100){
                        getList(1);
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
    $(".wrap").delegate(".del","click",function(){
        showMsg();
        var that=$(this)
        var id   = that.attr('data-id');
        $('.yes').click(function(){
            if(id){
                $.ajax({
                    url: masterDomain+"/include/ajax.php?service=education&action=booking&oper=del&id="+id,
                    type: "GET",
                    dataType: "jsonp",
                    success: function (data) {
                        if(data && data.state == 100){
                            //删除成功后移除信息层并异步获取最新列表
                            that.parents('.tutor').remove();
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
            url: masterDomain+"/include/ajax.php?service=education&action=bookingList&u=1&page="+atpage+"&pageSize="+pageSize,
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
                    $(".empty").remove();
                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    for (var i = 0; i < list.length; i++) {
                        html.push('<li class="tutor fn-clear">');
                        var state = list[i].state == 1 ? langData['education'][3][28] : '<span>'+huoniao_.transTimes(list[i].pubdate, 5)+'</span><span>'+huoniao_.transTimes(list[i].pubdate, 4)+'</span>';
                        if(list[i].state==1){
                            html.push('<div class="left_b_on">'+state+'</div>');
                        }else{
                            html.push('<div class="left_b">'+state+'</div>');
                        }
                        html.push('<div class="middle_b">');
                        html.push('<h2><span>'+list[i].username+'</span><span data-id="'+list[i].id+'" class="del">'+langData['education'][3][20]+'</span></h2> ');
                        html.push('<p>'+list[i].tel+'</p>');
                        html.push('</div>');
                        html.push('<div class="right_b">');
                        html.push('<a data-id="'+list[i].id+'" class="tel" href="tel:'+list[i].tel+'"><img src="'+templets_skin+'images/education/call.png" ></a>');
                        html.push('</div>');
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
