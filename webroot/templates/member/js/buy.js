$(function(){

    //setDate() 方法用于设置一个月的某一天
    var g = new Date();
    g.setDate(g.getDate());//当前月份的日期
    var h = g.getDay();
    var l = g.getHours();
    var f = parseInt(h);
    var d = "";
    var e = new Array();
    var b, j;
    var Tyear = new Date();
    var year = Tyear.getFullYear();//获取年份
    var tDay = g.getDate();
    e.push(g.getMonth()+1 + "月" + tDay + "日");//getMonth 返回月份字段，使用本地时间。返回值是 0（一月） 到 11（十二月） 之间的一个整数。
    var tmou = g.getMonth()+1;
    e.push((tmou<10 ? '0'+tmou : tmou) + "-" + (tDay <10 ? '0'+tDay : tDay));
    for (var c = 0; c < 6; c++) {
            if (f == 7) {
                f = 0
            }
            if (c == 3) {
                b = g.getMonth() + 1;
                j = g.getDate();
                e.push(b + "月" + j + "日");
                e.push((b<10 ? '0'+b : b) + "-" + (j<10 ? '0'+j : j));
            } else {
                if (c == 4) {
                    g.setDate(g.getDate() + 1);
                    b = g.getMonth() + 1;
                    j = g.getDate();
                    e.push(b + "月" + j + "日");
                    e.push((b<10 ? '0'+b : b) + "-" + (j<10 ? '0'+j : j));
                } else {
                    if (c == 5) {
                        g.setDate(g.getDate() + 1);
                        b = g.getMonth() + 1;
                        j = g.getDate();
                        e.push(b + "月" + j + "日");
                        e.push((b<10 ? '0'+b : b) + "-" + (j<10 ? '0'+j : j));
                    } else {
                        g.setDate(g.getDate() + 1);
                        b = g.getMonth() + 1;
                        j = g.getDate();
                        e.push(b + "月" + j + "日");
                        e.push((b<10 ? '0'+b : b) + "-" + (j<10 ? '0'+j : j));
                    }
                }
            }
            f++;
            j++
        }
        console.log(e)
        var html=[];
        html.push("<p data-id='"+year+'-'+e[1]+"' class='on'>"+langData['homemaking'][3][3]+"</p>");//今日
        html.push("<p data-id='"+year+'-'+e[3]+"'>"+langData['homemaking'][3][4]+"</p>");//明日
        html.push("<p data-id='"+year+'-'+e[5]+"'>"+langData['homemaking'][3][5]+"</p>");//后日
        html.push("<p data-id='"+year+'-'+e[7]+"'>" + e[6] + "</p>");
        html.push("<p data-id='"+year+'-'+e[11]+"' >" + e[10] + "</p>");
        html.push("<p data-id='"+year+'-'+e[13]+"'>" + e[12] + "</p>");
        $('.pickmonth').append(html.join(''))

    //选择时间弹窗
    $('.chose-month').on('click', function () {
        if($(this).hasClass('curr')){
            $(this).find('.pickmonth').stop(false,false).slideUp();
            $(this).removeClass('curr');
        }else{
            $(this).addClass('curr');
            $(this).find('.pickmonth').stop(false,false).slideDown();
        }

    });
    $('.chose-time').on('click', function () {
        if($(this).hasClass('curr')){
            $(this).find('.picktime').stop(false,false).slideUp();
            $(this).removeClass('curr');
        }else{
            $(this).addClass('curr');
            $(this).find('.picktime').stop(false,false).slideDown();
        }
    });
    //选择时间
    $('.time_div').delegate('p','click',function(){
        $(this).addClass('on').siblings('p').removeClass('on');
        var time = $(this).attr('data-id');
        var par = $(this).closest('.chose');
        par.find('.time-txt').text(time);
        par.addClass('has-cho');
        if(($('.chose-month').hasClass('has-cho')) && ($('.chose-time').hasClass('has-cho'))){
            console.log(333)
            var yuTime = $(".pickmonth p.on").attr('data-id') + '|' + $(".picktime p.on").attr('data-id');
            $("#doortime").val(yuTime);
        }

    })


    //商品详情页--数量的加减
    function getTotalPrice(){
        var inputValue=parseInt($(".count").val());//商品数量
        var or_price=parseFloat($(".dan_price").text());//商品单价
        var ord_price=or_price*inputValue//总价
        $('#ord_price').text(ord_price);
        $('.yufu strong').text(ord_price);

        jifen_di = parseInt(jifen_ * ord_price * pointRatio / 100 );
        jifen_di = hasPoint <= jifen_di ? hasPoint : jifen_di;
        jian = parseFloat((jifen_di / pointRatio ).toFixed(2));

        $(".integral .jifen").html(jifen_di) ;
        $(".integral .jian").html(jian) ;
        $(".integral .amount_jian span").html(jian) ;
        if($(".integral .gou").hasClass('hasgou')){
          $('.yufu strong').html(ord_price-jian);
        }else{
          $('.yufu strong').html(ord_price);
        }
    }

    getTotalPrice();

    // 取消积分勾选
    $(".integral .gou").click(function(){
    	var t = $(this);
    	t.toggleClass('hasgou');
      getTotalPrice()
    })

    //加
    $('.numadd').on("click",function(){
        var value;
        value=parseInt($(this).siblings(".count").val());
        if(value<50){
            value=value+1;
            $(this).siblings(".count").val(value);
            getTotalPrice();

        }else{
            alert(langData['shop'][2][23]);//库存不足
        }
    })

    //减
    $(".reduce").on("click",function(){
        var value;
        value=parseInt($(this).siblings(".count").val());
        if(value>1){
            value=value-1;
            $(this).siblings(".count").val(value);
            getTotalPrice();

        }else{
            alert(langData['shop'][2][12]);//最少一件起拍哦
        }
    })
    //数量输入变化
    $(".sizeBtn").delegate("input", "keyup", function(){
        var value;
        value=parseInt($(this).val());
        if(value > 0){
            getTotalPrice();
        }else{
            alert(langData['shop'][2][12]);//最少一件起拍哦
            inputValue = 1;
            $(".count").val('1')
        }
    });

    //提交订单
    $("#tj").bind("click", function(event){
        console.log('333')
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
                location.href = masterDomain + '/login.html';
                return false;
        }

        var t = $(this);

        if(t.hasClass("disabled")) return false;

        if($("#pros").val() == ""){
            alert(langData['shop'][2][21]);//商品获取失败，请刷新页面重试！
            return false;
        }
        if($("#addressid").val() == 0 || $("#addressid").val() == ""){
            alert(langData['shop'][2][22]);//请选择收货地址！
            return false;
        }
        var time = $("#doortime").val();
            if (!time) {
                alert(langData['shop'][2][25]);//预约时间未填写
                return false;
            }
        //获取图片的
        var pics = [];
        $("#fileList").find('.thumbnail').each(function(){
                var src = $(this).find('img').attr('data-val');
                pics.push(src);
        });
        $("#pics").val(pics.join(','));

        t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");//提交中
        $.ajax({
            url: '/include/ajax.php?service=homemaking&action=deal',
            data: {
                pros: $("#pros").val(),
                addressid: $("#addressid").val(),
                count: $(".count").val(),
                doortime: time,
                pics: $("#pics").val(),
                usernote: $("#usernote").val(),
                usePinput:($('.integral .gou').hasClass('hasgou')?'1':'0')
            },
            type: 'post',
            dataType: 'json',
            success: function(data){
                if(data && data.state == 100){
                    if (typeof (data.info) == 'object') {

                        info = data.info;
                        cutDown = setInterval(function () {
                            $(".payCutDown").html(payCutDown(info.timeout));
                        }, 1000)

                        var datainfo = [];
                        for (var k in info) {
                            datainfo.push(k + '=' + info[k]);
                        }
                        $("#amout").text(info.order_amount);
                        $('.payMask').show();
                        $('.payPop').show();

                        if (usermoney * 1 < info.order_amount * 1) {

                            $("#moneyinfo").text('余额不足，');
                            $("#moneyinfo").closest('.pay_item').addClass('disabled_pay')
                        }else{
                             $("#moneyinfo").text('可用');
                             $("#moneyinfo").closest('.pay_item').removeClass('disabled_pay')
                        }

                        if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
                            $("#bonusinfo").text('额度不足，可用');
                            $("#bonusinfo").closest('.pay_item').addClass('disabled_pay')
                        }else if( bonus * 1 < info.order_amount * 1){
                            $("#bonusinfo").text('余额不足，');
                            $("#bonusinfo").closest('.pay_item').addClass('disabled_pay')
                        }else{
                            $("#bonusinfo").text('');
                            $("#bonusinfo").closest('.pay_item').removeClass('disabled_pay')
                        }
                        ordernum = info.ordernum;
                        order_amount = info.order_amount;

                        $("#ordertype").val('');
                        $("#service").val('homemaking');
                        service = 'homemaking';
                        var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
                        $('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));
                    }else{
                        if(data.info.indexOf('pay') < 0){
                            alert('订单信息请登录移动端查看！');
                        }
                        location.href = data.info + (data.info.indexOf('?') > -1 ? '&' : '?') + 'currentPageOpen=1';
                    }


                }else{
                    alert(data.info);
                    t.removeAttr("disabled").html(langData['waimai'][2][40]);//去支付
                }
            },
            error: function(){
                alert(langData['siteConfig'][20][181]);//提交失败，请重试！
                t.removeAttr("disabled").html(langData['waimai'][2][40]);//去支付
            }
        });

    });


})
