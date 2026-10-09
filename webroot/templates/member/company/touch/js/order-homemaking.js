//删除订单
function close_li(thisli){
    $('.alert_tip').show();
}

function clic(){
    getList2(objId)
}
$(function () {
    var atpage = 1;
    var pageSize = 10;
    var isload = false;

    //原生APP后退回来刷新页面
    pageBack = function(data) {
        getList();
    }

    //申请退款弹出层
    $('.nomoney_back').click(function () {
        $('.work_mask').show();
    })
    $('.work_close').click(function () {
        $('.work_mask').hide();
    })
    $('.sale_confirm').click(function () {
        $('.work_mask').hide();
    })
      //取消订单之后  变成删除订单
    $('.sale_cancel').click(function () {
        $('.content_bottom2 .nomoney_back').remove();
        $('.content_bottom2 .contact_com').remove();
        $('.content_bottom2').html('<span class="del_cancel" onclick="close_li(this)">'+langData['homemaking'][7][18]+'</span>'); //删除订单
        $('.order_confirm2').text(langData['homemaking'][7][19]);   //已取消
        $('.work_mask').hide();
    })
  
    $('.del_cancel').click(function () {
        $('.alert_tip').show();
        $('.alert_tip .alert_content ul li').removeClass('active')
        var that=$(this);
        //one()绑定click事件
        $("#cancel_order1").one("click",(function(){
          $('.alert_tip').hide();
          that.parents('li').remove()
        }));
    })

    $('.cancel_order2').click(function () {
       $(this).toggleClass('active')
       $('.alert_tip').hide();
    })

    //验证成功
    $(".jz_data").delegate(".confirm_service2","click",function(){
        $('.confirm_tip').show();
    })
    $('.confirm_tip .t3').click(function () {
        $('.confirm_tip').hide();
    })
    $('.confirm_tip .work_close2').click(function () {
        $('.confirm_tip').hide();
    })
    //验证服务码
    $(".jz_data").delegate(".service_code","click",function(){
        $('.company_code').show();
    })
    $('.company_code .t3').click(function () {
        var t = $(this), cardnum = $("#confim_sure").val();
        if(cardnum==''){
            alert(langData['homemaking'][9][77]);
            return;
        }
        var data = [];
        data.push('cardnum='+cardnum);
        $.ajax({
            url: '/include/ajax.php?service=homemaking&action=useCode',
            data: data.join("&"),
            type: 'post',
            dataType: 'json',
            success: function(data){
                if(data && data.state == 100){
                    $('.company_code').hide();
                    $('.confirm_tip').show();
                    getList(1);
                }else{
                    alert(data.info);
                }
            },
            error: function(){
                alert(langData['siteConfig'][6][203]);
            }
        });
    })
    $('.company_code .work_close2').click(function () {
        $('.company_code').hide();
    })
    //顾客已线上付款
    $(".jz_data").delegate(".confirm_service3","click",function(){
        $('.fuwu_alert2').show();
    })
    $('.fuwu_alert2 .t4').click(function () {
        $('.fuwu_alert2').hide();
    })
    $('.fuwu_alert2 .t6').click(function () {
        $('.fuwu_alert2').hide();
    })

    //确认有效
    $(".jz_data").delegate(".confirm_use","click",function(){
        var t = $(this), id = t.attr('data-id');
        if(id!=''){
            $("#orderids").val(id);
        }
        $('.use_tip').show();
        $('.use_tip .use_content ul li').removeClass('active')
    })

    //退款
    $(".jz_data").delegate(".refundBtn","click",function(){
        var t = $(this), id = t.attr('data-id');
        if(id){
            var data = [];
            data.push('id='+id);
            $.ajax({
                url: '/include/ajax.php?service=homemaking&action=refundPay',
                data: data.join("&"),
                type: 'post',
                dataType: 'json',
                success: function(data){
                    if(data && data.state == 100){
                        $('.use_tip').hide();
                        getList(1);
                    }else{
                        alert(data.info);
                    }
                },
                error: function(){
                    alert(langData['siteConfig'][6][203]);
                }
            });
        }
    });

    
    //是
    $('.use1').click(function () {
        var id = $("#orderids").val();
        $(this).toggleClass('active');
        if(id){
            var data = [];
            data.push('id='+id);
            $.ajax({
                url: '/include/ajax.php?service=homemaking&action=operOrder&oper=yes',
                data: data.join("&"),
                type: 'post',
                dataType: 'json',
                success: function(data){
                    if(data && data.state == 100){
                        $('.use_tip').hide();
                        getList(1);
                    }else{
                        alert(data.info);
                    }
                },
                error: function(){
                    alert(langData['siteConfig'][6][203]);
                }
            });
        }
    })
    //否
     
    $('.use2').click(function () {
        $(this).toggleClass('active')
        $('.use_tip').hide();
    })
    //确认无效
    $(".jz_data").delegate(".confirm_none","click",function(){
        var t = $(this), id = t.attr('data-id');
        if(id!=''){
            $("#orderids").val(id);
        }
        $('.nouse_tip').show();
    })
    //订单确定无效
    $('.nouse_sure').click(function () {
        $('.nouse_tip').hide();
        var nouse_tip=$('#nouse_tip').val()//获取订单失败的原因
        if(nouse_tip==''){
            alert(langData['homemaking'][9][48]);
            return;
        }
        var id = $("#orderids").val();
        if(id){
            var data = [];
            data.push('id='+id);
            data.push('failnote='+nouse_tip);

            $.ajax({
                url: '/include/ajax.php?service=homemaking&action=operOrder&oper=no',
                data: data.join("&"),
                type: 'post',
                dataType: 'json',
                success: function(data){
                    if(data && data.state == 100){
                        
                        $('#nouse_tip').val('');
                        getList(1);
                    }else{
                        alert(data.info);
                    }
                },
                error: function(){
                    alert(langData['siteConfig'][6][203]);
                }
            });
        }
        
    })

    
    //取消
    $('.nouse_cancel').click(function () {
        $('.nouse_tip').hide();    
    })
   
    //取消预约
    $('.yuyue_cancel').click(function () {
        $('.alert_tip2').show();
        $('.alert_tip2 .alert_content ul li').removeClass('active')
    })

    $('.yuyue_yes').click(function () {
        $(this).toggleClass('active');
        $('.content_bottom3 .yuyue_cancel').remove();
        $('.content_bottom3 .contact_com').remove();
        $('.content_bottom3').html('<span class="del_cancel" onclick="close_li(this)">'+langData['homemaking'][7][18]+'</span>'); //删除订单
        $('.order_confirm2').text(langData['homemaking'][7][19]);   //已取消
        $('.alert_tip2').hide();
    })
    $('.yuyue_no').click(function () {
        $(this).toggleClass('active')
        $('.alert_tip2').hide();
    })
    //选择状态
    var  objId = $('.jz_data ul');

    $(".tab li").bind("click", function(){
        var t = $(this);
        if(!t.hasClass("curr")){
            t.addClass("curr").siblings("li").removeClass("curr");
            objId.html('');
            getList(1);
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

    

    var flag=0;
    function getList(item) {
        isload = true;
        if(item==1){
            atpage= 1;
            objId.html('');
        }

        objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');
        $('.loading').remove();
        $(".pagination").hide();
        
        var state = $('.tab .curr').attr('data-id') ? $('.tab .curr').attr('data-id') : '';
        $.ajax({
            url: masterDomain+"/include/ajax.php?service=homemaking&action=orderList&store=1&state="+state+"&page="+atpage+"&pageSize="+pageSize+"&dispatchid="+dispatchid,
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state != 200){
                    if(data.state == 101){
                        objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
                    }else{
                        var list = data.info.list, pageInfo = data.info.pageInfo, html = [], durl = $(".tab ul").data("url"), rUrl = $(".tab ul").data("refund"), cUrl = $(".tab ul").data("comment");
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
                             case "11":
                                totalCount = pageInfo.state11;
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
                        $("#state11").html(pageInfo.state11);
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
                                    courier       = list[i].dispatch.courier,
                                    title         = list[i].product.title,
                                    homemakingtype= list[i].homemakingtype,
                                    usercontact   = list[i].usercontact,
                                    dispatchid    = list[i].dispatchid,
                                    aftersale     = list[i].aftersale,
                                    grabtype      = list[i].grabtype,
                                    statementtime      = list[i].statementtime,
                                    doortime      = list[i].doortime

                                    ;
                                var stateInfo = btn = contactbtn = dispatchbtn = "";
                                var urlString = homemakingEditUrl.replace("%id%", id);
                                var serviceUrl= homemakingserviceUrl.replace("%id%", id);
                                var dispatchUrl= dispatchurl.replace("%id%", id);
                                var repairURL = homemakingRepairUrl.replace("%id%", id);
                                /**
                                 * 0 、待付款
                                 * 1、已付款 待确认
                                 * 点击确认有效 2
                                 * 点击确认无效 3
                                 * 有预约金的 验证服务码  4
                                 * 确认服务   5
                                 * 待商家确认 6
                                 * 服务完成   11
                                 * 取消订单   7
                                 * 退款中   8
                                 * 服务码已确认 9######
                                 * 已退款   9
                                 */

                                switch(orderstate){
                                    case "0":
										stateInfo = langData['homemaking'][4][1];//待付款
										break;
									case "1":
										stateInfo = langData['homemaking'][4][2]; //已付款，待确认
                                        btn = '<span data-id="'+id+'" class="confirm_none btn1">'+langData['homemaking'][9][45]+'</span><span data-id="'+id+'" class="confirm_use btn1">'+langData['homemaking'][9][46]+'</span>';//确认无效 确认有效
                                        contactbtn = '<a href="tel:'+usercontact+'" class="btn1"><span class="contact_buyer">'+langData['homemaking'][9][47]+'</span></a>';
                                        break;
                                    case "2":

                                        stateInfo = langData['homemaking'][4][3]; //待服务
                                        btn = '<span data-id="'+id+'" class="confirm_none btn1">'+langData['homemaking'][9][45]+'</span>';//确认无效
                                        if(homemakingtype == 1){
                                            btn += '<span data-id="'+id+'" class="service_code btn1">'+langData['homemaking'][9][74]+'</span>';//服务码
                                        }else{
                                            // btn = '<span data-id="'+id+'" class="confirm_service confirm_service2 btn1">'+langData['homemaking'][9][75]+'</span>';//确认服务
                                        }
                                        contactbtn = '<a href="tel:'+usercontact+'" class="btn1"><span class="contact_buyer">'+langData['homemaking'][9][47]+'</span></a>';//联系顾客

                                        if(dispatchid!=0){

                                            contactbtn += '<a href="'+dispatchUrl+'" class="btn2 fn-hide"><span class="dispatch_man">'+langData['homemaking'][9][97]+'</span></a>';//改派
                                        }else{
                                            if (grabtype==0) {
                                                contactbtn += '<a href="'+dispatchUrl+'" class="btn2 fn-hide"><span class="dispatch_man">'+langData['homemaking'][4][6]+'</span></a>';//派单
                                                btn = '<span data-id="'+id+'" class="grab">'+langData['homemaking'][4][46]+'</span>';//抢单
                                            }else if(grabtype==1){
                                                contactbtn += '<a href="'+dispatchUrl+'" class="btn2 fn-hide"><span class="dispatch_man">'+langData['homemaking'][4][6]+'</span></a>';//派单
                                                btn = '<span data-id="'+id+'" >'+langData['homemaking'][10][32]+'</span>';//抢单
                                            }else{
                                                btn = '<span data-id="'+id+'" >'+langData['homemaking'][10][33]+'</span>';//抢单
                                            }
                                        }
                                        break;
                                    case "3":
                                        stateInfo = langData['homemaking'][9][59]; //服务无效
                                        break;
                                    case "4":
                                        stateInfo = langData['homemaking'][4][3]; //待服务
                                        btn = '<a href="'+serviceUrl+'"><span data-id="'+id+'" class="confirm_service btn1">'+langData['homemaking'][9][75]+'</span></a>';//确认服务
                                        contactbtn = '<a href="tel:'+usercontact+'" class="btn1"><span class="contact_buyer">'+langData['homemaking'][9][47]+'</span></a>';//联系顾客
                                        if(dispatchid!=0){
                                            contactbtn += '<a href="'+dispatchUrl+'" class="btn2 fn-hide"><span class="dispatch_man">'+langData['homemaking'][9][97]+'</span></a>';//改派
                                        }else{
                                            if (grabtype==0) {
                                                contactbtn += '<a href="'+dispatchUrl+'" class="btn2 fn-hide"><span class="dispatch_man">'+langData['homemaking'][4][6]+'</span></a>';//派单
                                                btn = '<span data-id="'+id+'" class="grab">'+langData['homemaking'][4][46]+'</span>';//抢单
                                            }else if(grabtype==1){
                                                contactbtn += '<a href="'+dispatchUrl+'" class="btn2 fn-hide"><span class="dispatch_man">'+langData['homemaking'][4][6]+'</span></a>';//派单
                                                btn = '<span data-id="'+id+'" >'+langData['homemaking'][10][32]+'</span>';//抢单
                                            }else{
                                                btn = '<span data-id="'+id+'" >'+langData['homemaking'][10][33]+'</span>';//抢单
                                            }
                                        }
                                        break;
                                    case "5":
                                        stateInfo = langData['homemaking'][9][88]; //已服务，待客户验收
                                        contactbtn = '<a href="tel:'+usercontact+'" class="btn1"><span class="contact_buyer">'+langData['homemaking'][9][47]+'</span></a>';//联系顾客
                                        break;
                                    case "6":
                                        stateInfo = langData['homemaking'][9][93]; //服务完成,等待商家结单
                                        btn = '<span class="statement" data-id="'+id+'" >'+langData['homemaking'][7][14]+'</span>';//结单
                                        // if(aftersale==1){
                                        //     btn = '<a href="'+repairURL+'" class="btn1"><span class="sale_treat">'+langData['homemaking'][9][95]+'</span></a>';//处理售后
                                        // }
                                        contactbtn = '<a href="tel:'+usercontact+'" class="btn1"><span class="contact_buyer">'+langData['homemaking'][9][47]+'</span></a>';//联系顾客
                                        // if(dispatchid!=0){
                                        //     contactbtn += '<a href="'+dispatchUrl+'" class="btn2 fn-hide"><span class="dispatch_man">'+langData['homemaking'][9][97]+'</span></a>';//改派
                                        // }else{
                                        //     contactbtn += '<a href="'+dispatchUrl+'" class="btn2 fn-hide"><span class="dispatch_man">'+langData['homemaking'][4][6]+'</span></a>';//派单
                                        // }
                                        break;
                                    case "7":
                                        stateInfo = langData['homemaking'][9][53]; //已取消
                                        break;
                                    case "8":
                                        stateInfo = langData['homemaking'][9][71]; //退款中
                                        btn = '<span data-id="'+id+'" class="refundBtn btn1">'+langData['homemaking'][9][72]+'</span>';//确认退款
                                        if(dispatchid!=0){
                                            contactbtn = '<a href="'+dispatchUrl+'" class="btn2 fn-hide"><span class="dispatch_man">'+langData['homemaking'][9][97]+'</span></a>';//改派
                                        }else{
                                            contactbtn = '<a href="'+dispatchUrl+'" class="btn2 fn-hide"><span class="dispatch_man">'+langData['homemaking'][4][6]+'</span></a>';//派单
                                        }
                                        break;
                                    case "9":
                                        stateInfo = langData['homemaking'][10][14]; //退款成功
                                        break;
                                    case "11":
                                        stateInfo = langData['homemaking'][10][34];
                                        if(aftersale==1){
                                            btn = '<a href="'+repairURL+'" class="btn1"><span class="sale_treat">'+langData['homemaking'][9][95]+'</span></a>';//处理售后
                                        }
                                        contactbtn = '<a href="tel:'+usercontact+'" class="btn1"><span class="contact_buyer">'+langData['homemaking'][9][47]+'</span></a>';//联系顾客
                                        break;
                                    
                                }
                                if (grabtype==1&&orderstate==2&&dispatchid==0){
                                    stateInfo = langData['homemaking'][9][101];
                                }else if(grabtype==2 &&orderstate!=11 &&orderstate!=6){
                                    stateInfo = langData['homemaking'][10][33];
                                }
                                html.push('<li class="fn-clear">');
                                html.push('<p class="jz_order_company"><span>'+langData['homemaking'][4][7]+'：<span>'+ordernum+'</span></span><span class="jz_order_type">'+stateInfo+'</span></p>');
                                html.push('<div class="content_top fn-clear">');
                                html.push('<a href="'+urlString+'">');
                                if(courier!=''){
                                    html.push('<p class="courier">'+courier+'</p>');
                                }
                                html.push('<div class="left_b"><img src="'+litpic+'" alt=""></div>');
                                html.push('<div class="right_b">');
                                html.push('<p class="jz_order_title">'+title+'</p>');
                                html.push(' <p class="jz_order_time"><span>'+langData['homemaking'][4][8]+'：</span><span>'+doortime+'</span></p>');//预约时间
                                if(orderstate==11){
                                html.push(' <p class="jz_order_time"><span>'+langData['homemaking'][10][36]+'：</span><span>'+statementtime+'</span></p>');//结单时间
                                }
                                if(homemakingtype==1){
                                    html.push('<p class="jz_order_price"><span>'+echoCurrency('symbol')+'</span><span>'+orderprice+'</span><span>'+langData['homemaking'][8][60]+'</span></p>');
                                }else if(homemakingtype==0){
                                    html.push('<p class="jz_order_free"><span>'+langData['homemaking'][9][44]+'</span></p>');
                                }
                                html.push('</div>');
                                html.push('</a>');
                                html.push('</div>');
                                html.push('<div class="content_bottom">');
                                html.push(btn);
                                html.push(contactbtn);
                                // html.push('<span class="confirm_none btn1">确认无效</span>');
                                // html.push('<span class="service_code btn1">服务码</span>');
                                // html.push('<a href="tel" class="btn1"><span class="contact_buyer">联系顾客</span></a>');
                                // html.push('<a href="jz_dispatch_page.html" class="btn2 fn-hide"><span class="dispatch_man">'+langData['homemaking'][4][6]+'</span></a>');//派单
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

    let url=location.search;
    let params = new URLSearchParams(url.slice(1));
    let urlState=params.get('state');
    if(urlState){
        $('.tab ul li').eq(urlState).click();
    }else{
        getList(1);
    }

    
    $('.dispatch').click(function(){
        if(!$(this).hasClass('curr')){
            $(this).addClass("curr")
            flag=1;
            $('.btn1').css('display','none');
            $('.btn2').css('display','inline-block');
            $(this).text(langData['homemaking'][4][9]);//完成
        }else{
            flag=0;
            $('.btn1').css('display','inline-block');
            $('.btn2').css('display','none');
            $(this).text(langData['homemaking'][4][6])  //派单
            $(this).removeClass("curr")
        }
    })

     $('.dispatchqd').click(function(){
        if(!$(this).hasClass('curr')){
            $(this).addClass("curr")
            flag=1;
            $('.btn1').css('display','none');
            $('.btn2').css('display','inline-block');
            $(this).text(langData['homemaking'][4][9]);//完成
        }else{
            flag=0;
            $('.btn1').css('display','inline-block');
            $('.btn2').css('display','none');
            $(this).text('抢单')  //派单
            $(this).removeClass("curr")
        }
    })

    $('.jz_data').delegate('.grab','click',function(){
        var id=$(this).attr('data-id');
        $.ajax({
            url: '/include/ajax.php?service=homemaking&action=operOrder',
            data:{grabid:id},
            type: 'post',
            dataType: 'json',
            success: function(data){
                console.log(data);
                if(data.state == 100){
                   alert(data.info);
                   window.location.reload();
                }else{
                    alert(data.info);
                }
            },
            error: function(){
                alert(langData['siteConfig'][6][203]);
            }
        });
    })

    $('.jz_data').delegate('.statement','click',function(){
        var id=$(this).attr('data-id');
        $.ajax({
            url: '/include/ajax.php?service=homemaking&action=addservice',
            data:{orderid:id,type:'statement'},
            type: 'post',
            dataType: 'json',
            success: function(data){
                console.log(data);
                if(data.state == 100){
                   alert(data.info);
                   window.location.reload();
                }else{
                    alert(data.info);
                }
            },
            error: function(){
                alert(langData['siteConfig'][6][203]);
            }
        });
      
    })
   

});