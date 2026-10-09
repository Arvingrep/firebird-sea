
/*家政--申请退款*/
$(function(){
    //申请退款原因弹出
    $('.time-div #reason').click(function(e){
        var par = $(this).closest('.down-div');
        if(par.hasClass('hasc')){
            par.removeClass('hasc');
            par.find('.time_choose').removeClass('active');
        }else{
            par.addClass('hasc');
            par.find('.time_choose').addClass('active');
        }
        $(document).click(function(){
            par.removeClass('hasc');
            par.find('.time_choose').removeClass('active');
        })
        e.stopPropagation();
        
    })

    $('.firstDown .pro-choose p').click(function(){
        $(this).addClass('curr').siblings('p').removeClass('curr');
        var tit = $(this).find('a').text();
        $('.time-div #reason').val(tit)
    })
    //平台介入--弹出
    $('.kefuJoin').click(function(){
        $('.joinMask').show();
        $('.kefuJoinWrap').css('display','flex')
    })

    //平台介入-- 关闭
    $('.kefuJoinWrap .closeJoin,.joinMask').click(function(){
        $('.joinMask').hide();
        $('.kefuJoinWrap').css('display','none');
    })

    //平台介入--申请退款原因弹出
    $('.time-div #reason2').click(function(e){
        var par = $(this).closest('.down-div');
        if(par.hasClass('hasc')){
            par.removeClass('hasc');
            par.find('.time_choose').removeClass('active');
        }else{
            par.addClass('hasc');
            par.find('.time_choose').addClass('active');
        }
        $(document).click(function(){
            par.removeClass('hasc');
            par.find('.time_choose').removeClass('active');
        })
        e.stopPropagation();
        
    })
    //平台介入--申请退款原因选择
    $('.secondDown .pro-choose p').click(function(){
        $(this).addClass('curr').siblings('p').removeClass('curr');
        var tit = $(this).find('a').text();
        $('.time-div #reason2').val(tit)
    })



    var timer2 = null;
    //商家处理倒计时
    if(datedjs){
       var intDiff = parseInt(datedjs);    //倒计时总秒数量
        timerPay(intDiff); 
    }
    
    
    function timerPay(intDiff) {
        timer2 = setInterval(function () {
            var day = 0,
            hour = 0,
            minute = 0,
            second = 0;//时间默认值
            if (intDiff > 0) {
                //计算相关的天，小时，还有分钟，以及秒
                day = Math.floor(intDiff / (60 * 60 * 24));
                hour = Math.floor(intDiff / (60 * 60)) - (day * 24);
                minute = Math.floor(intDiff / 60) - (day * 24 * 60) - (hour * 60);
                second = Math.floor(intDiff) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
            }
            if (minute <= 9) minute = '0' + minute;
            if (second <= 9) second = '0' + second;
            $('#day_show').html(day);
            $('#hour_show').html('<s id="h"></s>' + hour);
            $('#minute_show').html('<s></s>' + minute);
            $('#second_show').html('<s></s>' + second);
            intDiff--;
            if($('#minute_show').text() =='00' && $('#second_show').text() =='00'){
               clearInterval(timer2);
            }
         }, 1000);

    }

    //修改申请
    $('.changeAply').click(function(){
        $.ajax({
            url: '/include/ajax.php?service=homemaking&action=setRefund&status=0&id='+id,
            type: 'post',
            dataType: 'json',
            success: function(data){
                if(data && data.state == 100){
                    $('#cancelIng,.talkList,.tuiCon').css('display','none');
                    $('#cancelApplay').css('display','block');
                    $('.tjbtn').html('提交修改');
                    $('.secLi').removeClass('active');

                }else{
                    $.dialog.alert(data.info);
                }
            },
            error: function(){
                $.dialog.alert(langData['siteConfig'][6][203]);
            }
        });


        if($(this).hasClass('refuseApply')){//第二次申请
            $('#changeType').val('1');
        }else{
            $('#changeType').val('2');//修改
        }

    })

    //撤销申请
    $('.cancelApply').click(function(){
        $.dialog.confirm('确定要撤销申请吗？',function(){
            $.ajax({
                url: '/include/ajax.php?service=shop&action=operOrder&oper=cancelrefund&id='+id,
                type: 'post',
                dataType: 'json',
                success: function(data){
                    if(data && data.state == 100){
                        setTimeout(function(){location.href = orderdetailUrl;},200)
                        
                    }else{
                        $.dialog.alert(data.info);
                    }
                },
                error: function(){
                    $.dialog.alert(langData['siteConfig'][6][203]);
                }
            });
        });
    })
    if(orderState == 8 || orderState == 9){
        getList();
    }
    //协商历史
    function getList(tr){

        $.ajax({
            url: "/include/ajax.php?service=shop&action=getrefund&page="+atpage+"&pageSize="+pageSize+"&id="+id,
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var list = data.info.list,html = [];
                    if(list.length > 0){
                        for(var i = 0;i < list.length;i++){
                            html.push('<li class="fn-clear">');
                            html.push('<div class="userImg"><img src="'+list[i].litpic+'" alt=""></div>');
                            html.push('<div class="userIxt">');
                            html.push('<h3>'+ list[i].title+'<span>'+huoniao.transTimes(list[i].retokdate,1)+'</span></h3>');
                            html.push('<p>买家创建了退款申请，退款类型：'+list[i].rettype+'，金额：'+ list[i].price+echoCurrency('short')+'。</p>');//元
                            html.push('</div>');
                            html.push('</li>');
                        }
                        $('.talkList ul').html(html.join(''));
                        $('.talkList').css('display','block');

                    }else{
                        $('.talkList').css('display','none');
                    }
                    totalCount = data.info.pageInfo.totalCount;
                    showPageInfo();
                }else{
                    $('.talkList').css('display','none');
                }
            },
            error: function(){
                $('.talkList').css('display','none');
            }
        });


    }
    //填充退款数据
    function getRefundData(tuinum){
        var cancel_desc = $("#cancel_desc").val(),//说明
            cancel_price= $("#cancel_price").val(),//退款金额
            reason      = $("#reason").val();//原因

        $('#tuinum').text(tuinum);
        $('#tuimoney').text(echoCurrency('symbol')+cancel_price);
        $('#tuiType').text(reason);
        $('#tuiNote').text(cancel_desc);
    }

    //第一次申请退款 提交发布
    $(".tjbtn").bind("click", function(event){
        event.preventDefault();


        var t           = $(this),
            cancel_desc = $("#cancel_desc").val(),
            cancel_price= $("#cancel_price").val(),
            oldprice    = $("#oldprice").val(),
            reason      = $("#reason").val();

        if(cancel_price == ''){
            $.dialog.alert('请输入退款金额');
            return;
        }
            
        if(cancel_price>oldprice){
            $.dialog.alert(langData['homemaking'][10][13]);
            return;
        }

        if(reason == ''){
            $.dialog.alert(langData['homemaking'][9][68]);
            return;
        }

        if(cancel_desc == ''){
            $.dialog.alert(langData['homemaking'][9][69]);
            return;
        }
        var imglist = [];
        $('#listSection2 li').each(function(){
            var tval = $(this).find('img').attr('data-val');
            imglist.push(tval);
        })
        $('#retpics').val(imglist.join(','));
        var form = $("#fabuForm"), action = form.attr("action");
        data = form.serialize();

        t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");


        $.ajax({
            url: action,

            data: data,
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    if(data.state == 100) {//第一次申请
                        $('#cancelApplay').css('display','none');
                        $('#cancelIng,.tuiCon').css('display','block');
                        getList();
                        //重新计时
                        clearInterval(timer2);
                        var intDiff2 = parseInt(datetds);    //自动关闭本次退款
                        timerPay(intDiff2);
                        $('.secLi').addClass('active');
                        t.removeClass("disabled").html(langData['siteConfig'][11][19]);

                        if (data.state == 100) {//第一次申请
                            getRefundData(1233445);

                        } else {//修改过的申请
                            $('.firstApply,.refuseApply').css('display','none');//第一次申请
                            $('.hasChangeApply').css('display','block');//修改的申请
                            $('.ingApply.changeAply').show();
                        }
                    }
                }else{
                    $.dialog.alert(data.info);
                    t.removeClass("disabled").html(langData['siteConfig'][11][19]);
                }
            },
            error: function(){
                t.removeClass("disabled").html(langData['siteConfig'][11][19]);
            }
        });
    });

    //提交平台申请介入
    $(".joinbtn").bind("click", function(event){
        event.preventDefault();


        var t           = $(this),
            username = $("#username").val(),
            usertel     = $("#usertel").val(),
            cancel_desc = $("#cancel_desc2").val(),          
            cancel_price= $("#cancel_price2").val(),
            oldprice    = $("#oldprice2").val(),
            reason      = $("#reason2").val();

        if(username == ''){
            $.dialog.alert('请输入联系人姓名');
            return;
        }
        if(usertel == ''){
            $.dialog.alert('请输入联系电话');
            return;
        }
        if(cancel_price == ''){
            $.dialog.alert('请输入退款金额');
            return;
        }
        if(cancel_price>oldprice){
            $.dialog.alert(langData['homemaking'][10][13]);
            return;
        }

        if(reason == ''){
            $.dialog.alert(langData['homemaking'][9][68]);
            return;
        }

        if(cancel_desc == ''){
            $.dialog.alert(langData['homemaking'][9][69]);
            return;
        }
        if($("#listSection1 li").length == 0){
            $.dialog.alert('请上传凭证');
            return;
        }
        var imglist = [];
        $('#listSection1 li').each(function(){
            var tval = $(this).find('img').attr('data-val');
            imglist.push(tval);
        })
        $('#proof').val(imglist.join(','));
        var form = $("#joinForm"), action = form.attr("action");
        data = form.serialize();
        $('.joinMask').hide();
        $('.kefuJoinWrap').css('display','none');
        $('.finishBot .stxt2').css('display','none');
        $('.finishBot .waitTxt').css('display','block');

        t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");
        $.ajax({
            url: action,
            data: data+'&proof='+$('#proof').val()+'&type=3'+'&status=2'+'&customer=1'+'&proid='+$('#proid').val()+'',
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    if(data.state == 100){//
                        location.href = refunddetailUrl;
                    }
                }else{
                    $.dialog.alert(data.info);
                    t.removeClass("disabled").html(langData['siteConfig'][11][19]);
                }
            },
            error: function(){
                t.removeClass("disabled").html(langData['siteConfig'][11][19]);
            }
        });

    });
})
