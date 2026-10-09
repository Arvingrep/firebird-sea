var objId = $("#list");

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


    $(".wrap").delegate(".del","click",function(){
        showMsg();
        var that=$(this)
        $('.yes').click(function(){
            that.parents('.tutor').remove();
            closeMsg()
        })
         $('.no').click(function(){
            closeMsg()
        })

    });

    $(".cont_ul").delegate(".tel","click",function(){
        var that=$(this)
        var id   = that.attr('data-id');
        if(id){
            $.ajax({
                url: masterDomain+"/include/ajax.php?service=education&action=receipt&id="+id,
                type: "GET",
                dataType: "jsonp",
                success: function (data) {
                    if(data && data.state == 100){
                        getList(1);
                    }else{
                        // alert(data.info);
                    }
                },
                error: function(){
                    alert(langData['siteConfig'][20][183]);
                }
            });
        }
    });

     //加载
     $(window).scroll(function() {
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w;
        if ($(window).scrollTop() >= scroll && !isload) {
            atpage++;
            getList();

        };
    });

    getList();

    function getList(item) {

        isload = true;
        if(item==1){
            atpage= 1;
            objId.html('');
        }

        objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');
        $('.loading').remove();

        var state = $('.order_nav .on').attr('data-id') ? $('.order_nav .on').attr('data-id') : '';

        $.ajax({
            url: masterDomain+"/include/ajax.php?service=education&action=orderList&store=1&state="+state+"&page="+atpage+"&pageSize="+pageSize,
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state != 200){
                    if(data.state == 101){
                        objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
                    }else{
                        var list = data.info.list, pageInfo = data.info.pageInfo, html = [],
                        durl = $(".order_nav ul").data("url"),
                        cdurl = $(".order_nav ul").data("cancel"),
                        rhUrl = $(".order_nav ul").data("refundhotel"),
                        rtUrl = $(".order_nav ul").data("refundticket"),
                        cUrl = $(".order_nav ul").data("comment");
                        var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";

                        switch(state){
                            case "":
                                totalCount = pageInfo.totalCount;
                                break;
                            case "0":
                                totalCount = pageInfo.state0;
                                break;
                            case "1":
                                totalCount = pageInfo.state1;
                                break;
                            case "2":
                                totalCount = pageInfo.state2;
                                break;
                            case "3":
                                totalCount = pageInfo.state3;
                                break;
                            case "4":
                                totalCount = pageInfo.state4;
                                break;
                            case "5":
                                totalCount = pageInfo.state5;
                                break;
                            case "6":
                                totalCount = pageInfo.state6;
                                break;
                            case "7":
                                totalCount = pageInfo.state7;
                                break;
                            case "8":
                                totalCount = pageInfo.state8;
                                break;
                            case "9":
                                totalCount = pageInfo.state9;
                                break;
                            case "20":
                                totalCount = pageInfo.state20;
                                break;
                        }

                        var msg = totalCount == 0 ? langData['siteConfig'][20][126] : langData['siteConfig'][20][185];

                        $("#state").html(pageInfo.totalCount);
                        $("#state0").html(pageInfo.state0);
                        $("#state1").html(pageInfo.state1);
                        $("#state2").html(pageInfo.state2);
                        $("#state3").html(pageInfo.state3);
                        $("#state4").html(pageInfo.state4);
                        $("#state5").html(pageInfo.state5);
                        $("#state6").html(pageInfo.state6);
                        $("#state7").html(pageInfo.state7);
                        $("#state8").html(pageInfo.state8);
                        $("#state9").html(pageInfo.state9);
                        $("#state20").html(pageInfo.state20);

                        //拼接列表
					    if(list.length > 0){
                            for(var i = 0; i < list.length; i++){
                                var id            = list[i].id,
                                    ordernum      = list[i].ordernum,
                                    orderstate    = list[i].orderstate,
                                    orderprice    = list[i].orderprice,
                                    procount      = list[i].procount,
                                    litpic        = list[i].product.litpic,
                                    title         = list[i].product.title,
                                    homemakingtype= list[i].homemakingtype,
                                    payurl        = list[i].payurl,
                                    usertel       = list[i].usertel,
                                    cardnum       = list[i].cardnum,
                                    proid         = list[i].proid,
                                    cardnumUrl    = list[i].cardnumUrl,
                                    type          = list[i].type

                                    ;

                                var stateInfo = btn = contactbtn = "";
                                //var urlString = durl.replace("%id%", id);//详情
                                //var cdurls    = cdurl.replace("%id%", id);//退款详情
                                //var refundUrl = rtUrl.replace("%id%", id);
                                //var cancelserviceUrl = cUrl.replace("%id%", id);//评论

                                /**
                                 * 0 、待付款
                                 * 1、已付款 待使用
                                 * 3、交易完成
                                 * 订单取消   7
                                 * 申请退款   8
                                 * 退款成功   9
                                 */
                                switch(orderstate){
                                    case "0":
                                        stateInfo = langData['homemaking'][4][1];//待付款
                                        //btn = '<a href="javascript:;" class="cancel_order del">'+langData['travel'][13][38]+'</a><a href="'+payurl+'" class="pay_order sure">'+langData['travel'][13][37]+'</a>';
                                        //取消订单 付款
                                        break;
                                    case "1":
                                        stateInfo = langData['travel'][13][36];//待使用
                                        //btn = '<a href="'+travelQR+'" class="refund_order sure">'+langData['travel'][13][51]+'</a>';
                                        //验证券码
                                        break;
                                    case "3":
                                        stateInfo = langData['travel'][13][62];//交易完成
                                        break;
                                    case "7":
                                        stateInfo = langData['homemaking'][9][53]; //已取消
                                        break;
                                    case "8":
                                        stateInfo = langData['homemaking'][9][71]; //退款中
                                        //btn = '<a href="javascript:;" class="refund del">'+langData['travel'][13][63]+'</a><a href="'+cdurls+'" class="cancel sure">'+langData['travel'][13][49]+'</a>';
                                        //确认退款 退款详情
                                        break;
                                    case "9":
                                        stateInfo = langData['homemaking'][10][14]; //退款成功
                                        //btn = '<a href="'+cdurls+'" class="cancel sure">'+langData['travel'][13][49]+'</a>';//删除订单 退款详情
                                        break;
                                }

                                html.push('<li class="tutor fn-clear">');
                                html.push('<div class="top fn-clear">');
                                if(orderstate==3){
                                    html.push('<div class="left_b_on">'+langData['education'][3][28]+'</div>');
                                }else{
                                    html.push('<div class="left_b"><span>'+huoniao_.transTimes(list[i].orderdate, 5)+'</span><span>'+huoniao_.transTimes(list[i].orderdate, 4)+'</span></div>');
                                }
                                html.push('<div class="middle_b">');//<span data-id="'+list[i].id+'" class="del">'+langData['education'][3][20]+'</span>
                                html.push('<h2><span style="margin:0;">'+list[i].people+'</span></h2>');
                                html.push('<p>'+list[i].contact+'</p>');
                                html.push('</div>');
                                html.push('<div class="right_b">');
                                html.push('<a data-id="'+list[i].id+'" class="tel" href="tel:'+list[i].contact+'"><img src="'+templatePath+'images/education/call.png" alt=""></a>');
                                html.push('</div>');
                                html.push('</div>');
                                html.push('<div class="bottom fn-clear">');
                                html.push('<h3>'+list[i].product.coursestitle+'</h3>');

                                html.push('<div class="entroll fn-clear">');
                                if(list[i].product.classtitle!=''){
                                    html.push('<p class="entroll_class">'+list[i].product.classtitle+'</p>');
                                }
                                html.push('<p class="entroll_price"><span>'+echoCurrency('symbol')+'</span><span class="price">'+list[i].product.price+'</span></p>');
                                html.push('</div>');
                                html.push('</div>');
                                html.push('</li>');

                            }
                            if(atpage == 1){
                                objId.html("");
                                objId.html(html.join(""));
                            }else{
                                objId.append(html.join(""));
                            }
                            isload = false;
                            if(atpage >= pageInfo.totalPage){
                                isload = true;
                                objId.append('<p class="loading">'+langData['homemaking'][8][65]+'</p>');
                            }
                        }else{
                            $('.loading').remove();
						    objId.append("<p class='loading'>"+msg+"</p>");
                        }
                    }
                }else{
                    objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
                }
            }
        });
    }


});
