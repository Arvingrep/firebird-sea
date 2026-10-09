$(function () {
    //APP端取消下拉刷新
    toggleDragRefresh('off');
    $("#tip").prop("checked", false);

    // 选择商品
    var shop = $("#shop");
    $(".noteCon li").click(function () {
        var t = $(this).find('a'), val = t.text(), last = shop.text();
        var now = last == "" ? val : (last + '，' + val);
        if (now.length > 100) {
            showMsg(langData['waimai'][3][86]);
        } else {
            shop.text(now);
        }

    })

    shop.on("input propertychange", function () {
        var val = shop.text();
        if (val.length > 100) {
            val = val.substr(0, 100);
            shop.text(val);
            showMsg(langData['waimai'][3][86]);
        }
    })




    // 切换购买方式
    $(".buyfrom label").click(function () {
        var t = $(this), index = t.index();
        if (t.hasClass("checked")) return;
        t.addClass("checked").siblings().removeClass("checked");
        $('.buyCon .comCon').eq(index).addClass('show').siblings('.comCon').removeClass('show');
        buyinit.getMoney();
    })
    //指定购买地址
    $('.selfBuy').click(function () {
        var ahref = $(this).find('a').attr('data-url');
        utils.setStorage('goAdress', 1);
        var quLng = $('#takelng').val();
        var quLat = $('#takelat').val();
        var shouAdrr = { 'quLng': quLng, 'quLat': quLat }
        utils.setStorage('buyshouAdress', JSON.stringify(shouAdrr));
        saveStore();
        setTimeout(function () {
            window.location.href = ahref;
        }, 200)




    })
    //存储页面已选择信息
    function saveStore() {
        var shop = $('#shop').text(),
            planPrice = $('#planPrice').val(),
            buyfrom = $(".buyfrom label.checked").index(),
            tipPrice = $('#tips').val(),
            quan = $('.youhui .hasQuan em').text(),
            sdval = $('#time').val(),
            sdtime = $('.qjTime').attr('data-time');
        var agreeswitch = 0;
        if (!$('.agree').hasClass('checked')) {
            agreeswitch = 1;
        }
        var paotuibuyInfo = { 'shop': shop, 'planPrice': planPrice, 'buyfrom': buyfrom, 'tipPrice': tipPrice, 'quan': quan, 'sdval': sdval, 'sdtime': sdtime, 'agreeswitch': agreeswitch }
        utils.setStorage('paotuibuyInfo', JSON.stringify(paotuibuyInfo));
    }

    //选择取货地址
    $('.more .dom_select.take .option').click(function () {
        var turl = $(this).find('.chooseaddrss').attr('data-url');
        utils.setStorage('goAdress', 1);
        var quLng = $('#buylng').val();
        var quLat = $('#buylat').val();
        var shouAdrr = { 'quLng': quLng, 'quLat': quLat }
        utils.setStorage('buyquAdress', JSON.stringify(shouAdrr));
        saveStore();

        setTimeout(function () {
            window.location.href = turl;
        }, 200)


    })


    // 点击遮罩层
    $('.mask').on('click', function () {
        clickMask();
    })

    // 隐藏遮罩层
    function clickMask() {
        $('.mask').hide();
        $(".comAlert").animate({ "bottom": "-100%" }, 300, "swing");
        $('.orderAlert').removeClass('show');
        $(".orTop").animate({ "bottom": "-100%" }, 300, "swing");
        setTimeout(function () {
            $('.order_bottom').removeClass('spe')
        }, 200)
        $('.orderPrice').removeClass('showPrice');
    }
    //订单返回
    $('.order-header-back').click(function () {
        $('.mask').show();
        $('.orderAlert').addClass('show');
    })
    //放弃订单
    $('.orderAlert ul li.giveup').click(function () {
        clickMask();
        window.location.href = indexUrl;

    })
    //继续订单
    $('.orderAlert ul li.continue').click(function () {
        clickMask();
    })

    //预估商品费弹出
    $('.planPrice').click(function () {
        $('.mask').show();
        $(".planAlert").animate({ "bottom": "0" }, 300, "swing");
    })

    //预估商品费--预估价格
    $('.planAlert .inpbox').click(function () {
        $('.otPrice span').text('预估价格:￥').addClass('curr');
        $('#otherplan').focus();
    })
    //监听预估价格 不可超出500元
    $("#otherplan").bind('input propertychange', function () {
        var tipVal = $(this).val();
        var mostVal = $('.planAlert .wtip2').attr('data-most');
        if (tipVal * 1 > mostVal) {
            showMsg2('最高' + mostVal + '元哦~');
            $(this).val(mostVal);
        }
    })
    //确认预估价格
    $('.planAlert .surePlan').click(function () {
        var planNum = $("#otherplan").val();
        if (planNum > 0) {
            $('#planPriceTxt').val(planNum + echoCurrency('short'));
            $('#planPrice').val(planNum);
        } else {
            $('#planPriceTxt').val('');
            $('#planPrice').val(0);
        }

        clickMask();
    })

    //预估价格取消
    $('.planAlert .cancelPlan').click(function () {
        clickMask();
    })

    //小费弹出
    $('.addTips').click(function () {
        $('.mask').show();
        $(".tipsAlert").animate({ "bottom": "0" }, 300, "swing");
    })

    //超出最高小费则隐藏
    $('.tipsBox li').each(function () {
        var thisTip = $(this).find('a').attr('data-tips');
        if (thisTip > maxtip) {
            $(this).remove();
        }
    })


    //小费--其他金额
    $('.tipsAlert .inpbox').click(function () {
        $('.otMoney span').text('其他金额:￥').addClass('curr');
        $('#otherTips').focus();
    })
    //监听小费 不可超出200元
    $("#otherTips").bind('input propertychange', function () {
        var tipVal = $(this).val();
        if (tipVal > 0) {
            $('.tipsBox li').removeClass('active');
        }
        var mostTips = $('.tipsAlert .wtip2').attr('data-most');
        if (tipVal * 1 > mostTips * 1) {
            showMsg2('最高' + mostTips + '元哦~');
            $(this).val(mostTips);
        }
    })
    //选择小费
    $('.tipsBox li').click(function () {
        $(this).toggleClass('active').siblings('li').removeClass('active');
        $("#otherTips").val('');
    })

    //确认小费金额
    $('.tipsAlert .sureTips').click(function () {
        var tipNum = 0;
        if ($('.tipsBox li.active').length > 0) {
            tipNum = $('.tipsBox li.active a').attr('data-tips');
        } else {
            tipNum = $("#otherTips").val();
        }
        if (tipNum > 0) {
            $('.addTips #tipsTxt').val(tipNum + echoCurrency('short'));
        } else {
            $('.addTips #tipsTxt').val('');
        }
        $('#tips').val(tipNum);
        clickMask();
        buyinit.getMoney();
    })
    //小费取消
    $('.tipsAlert .cancelTips').click(function () {
        clickMask();
    })

    formatTime(); //送达时间选择
    rightTime();//右侧时间
    //时间弹窗
    $('.qjTime').click(function () {
        $('.mask').show();
        $(".time_chose").animate({ "bottom": "0" }, 300, "swing");
    })

    $('.left_day').delegate('li', 'click', function () {
        var t = $(this);
        t.addClass('on_chose').siblings('li').removeClass('on_chose');
        rightTime()
    });
    function DateToUnix(string) {
        var f = string.split(' ', 2);
        var d = (f[0] ? f[0] : '').split('-', 3);
        var t = (f[1] ? f[1] : '').split(':', 3);
        return (new Date(
            parseInt(d[0], 10) || null,
            (parseInt(d[1], 10) || 1) - 1,
            parseInt(d[2], 10) || null,
            parseInt(t[0], 10) || null,
            parseInt(t[1], 10) || null,
            parseInt(t[2], 10) || null
        )).getTime() / 1000;
    }

    $('.right_time').delegate('li', 'click', function () {
        var t = $(this);
        t.addClass('active').siblings('li').removeClass('active');
    });

    //确定取件时间
    $('.time_chose .sureTime').click(function () {

        var date = $('.left_day .on_chose').text();
        var date2 = $('.right_time li.active').find('span').text();
        if (date2) {
            var torM = $('.left_day .on_chose').attr('data-today');
            if (torM == '1') {
                $('#time').val(date + '  ' + date2); ('预计今天10:50送达')
            }

            if ($('.right_time li.active').hasClass('nowt')) {
                var tit = $('.right_time li.active').find('.yjTIme').text();
                $('#time').val(date2 + ',' + tit);
            } else {
                $('#time').val('预计' + date + '  ' + date2 + '送达');
            }
            var dateR = $('.right_time li.active').attr('data-time');
            var ymd = $('.left_day li.on_chose').attr('data-date') + ' ' + dateR + ':00';
            var ymd2 = DateToUnix(ymd);
            $('.qjTime').attr('data-time', ymd2);

            var sdval = $('#time').val();
        }

        clickMask();
        buyinit.getMoney();
    })

    //优惠券返回
    $('.quan-header-back').click(function () {
        $('.quanWrap').hide();
        $('body').css('overflow', 'auto');
        $('.mainWrap').removeClass('fn-hide');
    })
    //打开优惠券
    $('.youhui').click(function () {
        if (!$(this).hasClass('disabled')) {
            $('.quanWrap').show();
            $('.mainWrap').addClass('fn-hide');
            $('body').css('overflow', 'hidden');
            getquanList();
        }
    })


    //选择优惠券
    $('.coupon_list').off('click').delegate('li', 'click', function (e) {
        //优惠券详细展开
        if (e.target == $(this).find('.moreQuan')[0]) {
            if ($(this).find('.moreQuan').hasClass('click')) {
                $(this).find('.moreQuan').removeClass('click');
                $(this).find('.showCon').show();
                $(this).find('.hideCon').hide();
                $(this).find('.quanBot').animate({ 'height': '.3rem' }, 200)
            } else {
                $(this).find('.moreQuan').addClass('click');
                $(this).find('.showCon').hide();
                $(this).find('.hideCon').show();
                $(this).find('.quanBot').animate({ 'height': '1.9rem' }, 200)
            }
            return false;
        }

        if (!$(this).hasClass('disabled')) {
            if (!$(this).hasClass('active')) {
                $(this).addClass('active').siblings('li').removeClass('active');
                var nowPrice = $('.orderPrice strong').text();
                var $dt = $(this).find('.quanTop dt');
                var yhz = $dt.find('strong').text();
                var yhPrice = 0;
                if ($dt.hasClass('zhe')) {//优惠折扣
                    yhPrice = ((1 - yhz / 10) * nowPrice).toFixed(2);
                } else {//优惠红包
                    yhPrice = yhz;
                }
                $('.youhui .hasHb').addClass('fn-hide');
                $('.youhui .hasQuan').removeClass('fn-hide');
                $('.youhui .hasQuan em').text(yhPrice);

                $('.quanWrap').hide();
                $('body').css('overflow', 'auto');
                $('.mainWrap').removeClass('fn-hide');

            } else {
                $(this).removeClass('active');
                $('.youhui .hasHb').removeClass('fn-hide');
                $('.youhui .hasQuan').addClass('fn-hide');
                $('.youhui .hasQuan em').text(0);
            }
            buyinit.getMoney();

        }

    })

    var quanpage = 1, quanload = false;
    $('.quanWrap').scroll(function () {
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w;

        if ($(window).scrollTop() >= scroll && !quanload) {
            quanpage++;
            getquanList();

        }
    });

    function getquanList() {
        quanload = true;
        $('.coupon_list .loading').remove();
        $(".coupon_list").append('<div class="loading">' + langData['siteConfig'][38][8] + '</div>');//加载中...

        var data = [];
        data.push("page=" + quanpage);
        data.push("pageSize=10");
        data.push("orderby=1");

        $.ajax({
            url: "/include/ajax.php?service=info&action=ilist_v2&" + data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if (data && data.state == 100) {

                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    if (list.length > 0) {
                        $(".coupon_list .loading").remove();
                        for (var i = 0; i < list.length; i++) {

                            html.push('<li class="' + ((i == 1) ? 'disabled' : '') + '"><a href="javascript:;">');
                            html.push('<div class="linBg1"></div>');
                            html.push('<div class="quanTop">')
                            html.push(' <dl class="fn-clear">');
                            if (i == 1) {
                                html.push('   <dt>' + echoCurrency('symbol') + '<strong>5</strong></dt>');
                            } else {
                                html.push('   <dt class="zhe"><strong>7.5</strong>折</dt>');
                            }
                            html.push('   <dd>');
                            html.push('     <h2>新人超值礼包</h2>');
                            html.push('     <div class="quanType">');
                            html.push('       <span>满减券</span><em>满1元可用</em>');
                            html.push('     </div>');
                            html.push('    </dd>');
                            html.push('   </dl>');
                            html.push('</div>');

                            html.push('<div class="qLine"></div>');
                            html.push('<div class="quanBot">');
                            html.push(' <s class="moreQuan"></s>');
                            html.push(' <div class="showCon ' + ((i == 1) ? 'noUse' : '') + '">');
                            if (i == 1) {
                                html.push('    <p><i></i>不可用原因<span>满100元可用</span></p>');
                            } else {
                                html.push('   <p>生效日期：2020年02月12日、失效日期：2020年02月ggggg</p>');
                            }

                            html.push(' </div>');
                            html.push(' <div class="hideCon">');
                            html.push('   <p>生效日期：2020年02月12日</p>');
                            html.push('   <p>失效日期：2020年02月12日</p>');
                            html.push('   <p>满12元可用</p>');//已使用
                            html.push('   <p>可用订单：取送件、帮我买</p>');
                            html.push('   <p>优惠券不能抵扣小费、保费等</p>');//更多券码
                            html.push(' </div>');
                            html.push('</div>');
                            html.push('<div class="bLine"></div>');
                            html.push('</a></li>');
                        }

                        $(".coupon_list ul").append(html.join(""));
                        quanload = false;
                        if (quanpage >= pageinfo.totalPage) {
                            quanload = true;
                            $(".coupon_list").append('<div class="loading">' + langData['siteConfig'][20][429] + '</div>');//已加载全部数据
                        }
                    } else {
                        quanload = false;
                        $(".coupon_list .loading").html(langData['siteConfig'][20][126]);//暂无相关信息！
                    }

                } else {
                    quanload = false;
                    $(".coupon_list .loading").html(data.info);
                }
            },
            error: function () {
                quanload = false;
                //网络错误，加载失败
                $(".coupon_list .loading").html(langData['siteConfig'][20][227]); // 网络错误，加载失败
            }
        });
    }

    //价格明细
    $('.orderPrice').click(function () {
        if (!$(this).hasClass('showPrice')) {
            $(this).addClass('showPrice');
            $('.mask').show();
            $(".orTop").animate({ "bottom": "1.08rem" }, 300, "swing");
            $('.order_bottom').addClass('spe');
        } else {
            clickMask();
        }

    })
    //价格详情取消
    $('.priceDetail a.cancelRules').click(function () {
        clickMask();
    })
    //计价规则新页面
    $('.priceDetail a.priceRules').click(function () {
        $('.ruleWrap').show();
        $('.mainWrap').addClass('fn-hide');
    })

    //计价规则返回
    $('.rule-header-back').click(function () {

        $('.ruleWrap').hide();
        $('.mainWrap').removeClass('fn-hide');
    })


    //选择积分抵扣
    $(".jfchose .jscheck").click(function () {
        var t = $(this);
        t.toggleClass('hasgou');
        $('.priceBox .jfPrice').toggleClass('show');
        buyinit.getMoney();
    });
    $(".jfchose .jscheck").click();

    //同意帮买协议
    $('.agree i').click(function () {
        var par = $(this).closest('.agree');
        if (!par.hasClass('checked')) {
            par.addClass('checked');
        } else {
            par.removeClass('checked');
        }
    })

    // 提交订单
    $(".tjBtn,.shareTo").click(function () {
        var t = $(this);
        if (t.hasClass("disabled")) return;
        var addr = $(".buyfrom1");
        var buyfrom = $(".buyfrom .checked").index(),
            buyaddress = $.trim($("#buyaddress").val()),
            address = saddress,
            shopdes = $.trim(shop.text()),
            price = $("#planPrice").val(),
            hastip = $('#tips').val() > 0 ? 1 : 0,
            tip = $('#tips').val() > 0 ? $('#tips').val() : 0,
            gettime = parseInt($(".qjTime").attr("data-time")),
            takelat = $('#takelat').val(),
            takelng = $('#takelng').val(),
            buylng = $('#buylng').val(),
            buylat = $('#buylat').val(),
            juli = ($('.distance span').text()) * 1,
            usePinput = $("#usePinput").val();

        if (shopdes == '') {
            showMsg(langData['waimai'][3][89]);//请填写商品需求
            return;
        }


        if (buyfrom == 0) {
            if (buyaddress == '') {
                showMsg(langData['waimai'][3][90]);//请填写您指定的购买地址
                return;
            }
        } else {
            buyaddress = langData['siteConfig'][17][19];//就近购买
            juli = 0;
        }

        if (!saddress) {
            showMsg(langData['waimai'][3][91]);//请选择送达的位置
            return;
        }
        if (!gettime) {
            showMsg('请选择送达时间');//请选择送达时间
            return;
        }
        if (!$('.agree').hasClass('checked')) {
            showMsg('请先同意服务协议');//请先同意服务协议
            return;
        }

        var peerpay = $(this).attr('data-paytype')

        var data = [];
        data.push("type=1");
        data.push("shop=" + shopdes);
        data.push("buyfrom=" + buyfrom);
        data.push("buyaddress=" + buyaddress);
        data.push("buylng=" + buylng);
        data.push("buylat=" + buylat);
        data.push("lat=" + takelat);
        data.push("lng=" + takelng);
        data.push("gettime=" + gettime);
        data.push("address=" + address);
        data.push("price=" + price);
        data.push("hastip=" + hastip);
        data.push("tip=" + tip);
        data.push("juli=" + juli);
        data.push("peerpay=" + peerpay);
        data.push("usePinput=" + usePinput);

        $('.payBeforeLoading').show();
        t.addClass("disabled").text(langData['siteConfig'][6][35]);
        // console.log(data.join("&"))
        // return false;
        $.ajax({
            url: '/include/ajax.php?service=waimai&action=paotuiDeal',
            data: data.join("&"),
            type: 'post',
            dataType: 'json',
            success: function (data) {

                if(data.state == 100){
                    sinfo = data.info;

                    if (typeof (sinfo) != 'object') {
                        location.href = sinfo;
                    } else {
                        service = 'waimai';
                        $('#ordernum').val(sinfo.ordernum);
                        $('#paction').val('paotuipay');

                        $('#pfinal').val('1');
                        $("#amout").text(sinfo.order_amount);
                        $('.payMask').show();
                        $('.payPop').css('transform', 'translateY(0)');

                        $("#pordertype").val('paotui');
                        // if (totalBalance * 1 < sinfo.order_amount * 1) {
                        //
                        //   $("#moneyinfo").text('余额不足，');
                        //
                        //   $('#balance').hide();
                        // }
                        if (totalBalance * 1 < sinfo.order_amount * 1) {

                            $("#moneyinfo").text('余额不足，');
                            $("#moneyinfo").closest('.check-item').addClass('disabled_pay')

                            $('#balance').hide();
                        }

                        if (monBonus * 1 < sinfo.order_amount * 1 && bonus * 1 >= sinfo.order_amount * 1) {
                            $("#bonusinfo").text('额度不足，');
                            $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
                        } else if (bonus * 1 < sinfo.order_amount * 1) {
                            $("#bonusinfo").text('余额不足，');
                            $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
                        } else {
                            $("#bonusinfo").text('');
                            $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
                        }


                        ordernum = sinfo.ordernum;
                        order_amount = sinfo.order_amount;

                        payCutDown('', sinfo.timeout, sinfo);
                    }
                }else{
                    $('.payBeforeLoading').hide();
                    showMsg(data.info);
                    t.removeClass("disabled").text(langData['waimai'][2][40]);
                }
            },
            error: function () {
                $('.payBeforeLoading').hide();
                showMsg(langData['siteConfig'][20][183]);
                t.removeClass("disabled").text(langData['waimai'][2][40]);
            }

        })
    })

    buyinit.get();
    buyinit.getMoney();

})

var buyinit = {
    get: function () {
        //var typeList = ['shop','buyfrom','planPrice','agreeswitch','tipPrice','quan','sdval','sdtime'];
        var goAdr = utils.getStorage('goAdress');

        var buyInfoAll = utils.getStorage('paotuibuyInfo');
        // this.set('lastshop', shoptype);

        // if(lastshop && lastshop != shoptype){
        //   for(var i = 0; i < typeList.length; i++){
        //     utils.removeStorage('paotui_buy_'+typeList[i]);
        //   }
        //   return;
        // }
        if (goAdr) {
            if (buyInfoAll) {
                if (buyInfoAll.shop) {
                    $("#shop").html(buyInfoAll.shop);
                }

                if (buyInfoAll.buyfrom && buyInfoAll.buyfrom == '1') {
                    $('.buyfrom label').eq(buyInfoAll.buyfrom).click();
                }

                if (buyInfoAll.planPrice) {
                    $("#planPriceTxt").val(buyInfoAll.planPrice + echoCurrency('short'));
                    $("#planPrice").val(buyInfoAll.planPrice);
                }

                if (buyInfoAll.agreeswitch && buyInfoAll.agreeswitch == '1') {
                    $(".agree").click();
                }

                if (buyInfoAll.tipPrice) {
                    $('.addTips #tipsTxt').val(buyInfoAll.tipPrice + echoCurrency('short'));
                    $('#tips').val(buyInfoAll.tipPrice);
                    var tipObj = $(".tipsBox a[data-tips='" + buyInfoAll.tipPrice + "']");
                    if (tipObj.length == 0) {
                        $("#otherTips").val(buyInfoAll.tipPrice);
                        $(".inpbox").click();
                    } else {
                        tipObj.click();
                    }
                }

                if (buyInfoAll.quan) {
                    $('.youhui .hasHb').addClass('fn-hide');
                    $('.youhui .hasQuan').removeClass('fn-hide');
                    $('.youhui .hasQuan em').text(buyInfoAll.quan);
                }

                if (buyInfoAll.sdval) {
                    $("#time").val(buyInfoAll.sdval);
                }

                if (buyInfoAll.sdtime) {
                    $('.qjTime').attr('data-time', buyInfoAll.sdtime);
                }

                utils.removeStorage('paotuibuyInfo');
            }

            var buyInfo = utils.getStorage('paotui_buyInfo');
            if (buyInfo) {
                $("#buyaddress").val(buyInfo.buyaddress);
                $("#buylng").val(buyInfo.buyLng);
                $("#buylat").val(buyInfo.buyLat);
                if (buyInfo.buyLng && buyInfo.buyLat) {
                    buyinit.GetDistance(smylat, smylng, buyInfo.buyLat, buyInfo.buyLng);

                }

            }

            utils.removeStorage('goAdress');

        }

    },
    set: function (type, value) {
        utils.setStorage('paotui_buy_' + type, JSON.stringify(value));
    }
    // 计算距离
    , GetDistance: function (lat1, lng1, lat2, lng2) {

        $.ajax({
            "url": "/include/ajax.php?service=waimai&action=getroutetime&originlng=" + lng1 + "&originlat=" + lat1 + "&destinationlng=" + lng2 + "&destinationlat=" + lat2,
            "dataType": "json",
            "success": function (data) {
                if (data && data.state == 100) {
                    var info = data.info;
                    var julival = info.juli;
                    if (julival > 0) {
                        $('.distance span').text(julival);
                    } else {
                        $('.distance span').text(0);
                    }
                    buyinit.getMoney();
                    buyinit.confirmAdr(julival);
                }
            }
        });

    }
    // 计算费用
    , getMoney: function () {
        var tipPrice = 0;
        var hb = 0;
        if ($('#tips').val() > 0) {//小费
            tipPrice = $('#tips').val();
            $('.priceBox .xfPrice').addClass('show');
            $('.priceBox .xfPrice em').text(tipPrice);
        } else {
            $('.priceBox .xfPrice').removeClass('show');
        }
        if ($('.hasQuan em').text() > 0) {//优惠
            hb = $('.hasQuan em').text();
            $('.priceBox .hbPrice').addClass('show');
            $('.priceBox .hbPrice em').text(hb);
        } else {
            $('.priceBox .hbPrice').removeClass('show');
        }
        //距离价格计算
        var juliFee = 0, juliTxt = '';
        var buystyle = $(".buyfrom .checked").index();
        var psjuli = buystyle == 0 ? $('.distance span').text() : 0;//公里数
        if (juliCalc) {
            // juliCalc.reverse();
            // for(var i = 0; i < juliCalc.length; i++){
            //   var sj = parseFloat(juliCalc[i][0]), ej = parseFloat(juliCalc[i][1]), ps = parseFloat(juliCalc[i][2]);
            //   if(sj <= psjuli && ej >= psjuli){
            //     juliFee = ps;
            //   }

            //   juliTxt += '<p><span>'+sj+'-'+ej+'公里时</span><em>+'+ps+echoCurrency("short")+'</em></p>';
            //   $(".juliAdd dd").html(juliTxt)
            //   $('.ruleBox dl.juliAdd').addClass('show');
            // }
            juliCalc.forEach(function (val, index) {
                var sj = parseFloat(val[0]),  //上限
                    ej = parseFloat(val[1]), //下限
                    ps = parseFloat(val[2]);  //单价
                if (sj <= psjuli && ej <= psjuli) {
                    juliFee += ps * (ej - sj);
                    juliTxt += '<p><span>' + sj + '-' + ej + '公里时</span><em>每公里+' + ps + echoCurrency("short") + '</em></p>';
                } else if (sj <= psjuli && ej >= psjuli) {
                    juliFee += (psjuli - sj) * ps;
                    juliTxt += '<p><span>' + sj + '-' + ej + '公里时</span><em>每公里+' + ps + echoCurrency("short") + '</em></p>';
                }
                if (ej < psjuli && index == (juliCalc.length - 1)) {
                    juliFee += (psjuli - ej) * ps;
                    juliTxt += '<p><span>' + sj + '公里以上时</span><em>每公里+' + ps + echoCurrency("short") + '</em></p>';
                }
            });

            $(".juliAdd dd").html(juliTxt);
            $('.ruleBox dl.juliAdd').addClass('show');
        }

        if (juliFee > 0) {
            $('.priceBox .juliPrice').addClass('show');
            $('.priceBox .juliPrice em').text(juliFee.toFixed(2));
        } else {
            $('.priceBox .juliPrice').removeClass('show');
        }

        //特殊时段
        var addservicePrice = 0;
        var addserviceTxt = "";
        var choseTime = $('.right_time li.active').attr('data-time');
        if (speTimeCalc) {
            for (var i = 0; i < speTimeCalc.length; i++) {
                var start = Number(speTimeCalc[i][0].replace(":", "")), end = Number(speTimeCalc[i][1].replace(":", "")), pri = parseFloat(speTimeCalc[i][2]);

                if (choseTime) {
                    var choset = Number(choseTime.replace(":", ""));
                    if (start < choset && end > choset && pri > 0) {
                        addservicePrice += pri;
                    }
                }

                if (end > start) {//计价规则填充
                    addserviceTxt += '<p><span>' + speTimeCalc[i][0] + '-' + speTimeCalc[i][1] + '</span><em>+' + pri + echoCurrency("short") + '</em></p>';
                }

            }
            $(".speAdd dd").html(addserviceTxt)
            $('.ruleBox dl.speAdd').addClass('show');
        }
        if (addservicePrice > 0) {
            $('.priceBox .spePrice').addClass('show');
            $('.priceBox .spePrice em').text(addservicePrice);
        } else {
            $('.priceBox .spePrice').removeClass('show');
        }

        var totalAmount = totalPrice + juliFee + addservicePrice + tipPrice * 1 - hb * 1;
        if (hasPoint > 0) {
            buyinit.check_integral(totalAmount);
        } else {
            $(".orderPrice strong").html(totalAmount.toFixed(2));
        }
    }
    //积分抵扣
    , check_integral: function (allprice) {

        jifen_di = parseInt(jifen_ * allprice * pointRatio / 100);
        jifen_di = hasPoint <= jifen_di ? hasPoint * 1 : jifen_di;
        jifen_di = Number(jifen_di);
        jian = parseFloat((jifen_di / pointRatio).toFixed(2));
        $(".jfchose .jifen").html(parseFloat(jifen_di.toFixed(2)));
        $(".jfchose .jian").html(parseFloat(jian.toFixed(2)));
        $(".priceBox .jfPrice em").html(parseFloat(jian.toFixed(2)));

        if (jifen_di == 0 || jian == 0) {
            $(".jfchose").hide()
        } else {
            $(".jfchose").show()
        }
        if ($(".jfchose .jscheck").hasClass('hasgou')) {
            $('#usePinput').val(1);
            $(".orderPrice strong").html(parseFloat((allprice - jian).toFixed(2)));
        } else {
            $('#usePinput').val(0);
            $(".orderPrice strong").html(allprice.toFixed(2));

        }
    }
    //判断收取货地址是否相同
    , confirmAdr: function (val) {
        if (val <= 0) {
            $('.pop_confirm').addClass('show');
            $('.mask_pop').show();
            $('.pop_confirm .cancle_btn').click(function (e) {
                $('.pop_confirm').removeClass('show');
                $('.mask_pop').hide();
                e.stopImmediatePropagation();   //阻止事件继续执行
            });

            $('.pop_confirm .sure_btn').off('click').click(function (e) {
                $('.pop_confirm').removeClass('show');
                $('.mask_pop').hide();
            })
            $('.mask_pop').click(function () {
                $('.mask_pop').hide();
                $('.pop_confirm').removeClass('show');
            });
        }
    }
}
var dates = {

    //获取日期
    FunGetDateStr: function (p_count) {
        var dd = new Date();
        dd.setDate(dd.getDate() + p_count);//获取p_count天后的日期
        var y = dd.getFullYear();
        var m = dd.getMonth() + 1;//获取当前月份的日期
        var d = dd.getDate();
        var w = dd.getDay();
        var dayTo = ''
        if (w == 0) {
            dayTo = '(' + langData['siteConfig'][34][5][0] + ')';         /* 周一*/
        } else if (w == 1) {
            dayTo = '(' + langData['siteConfig'][34][5][1] + ')';        /* 周二 */
        } else if (w == 2) {
            dayTo = '(' + langData['siteConfig'][34][5][2] + ')';        /* 周三 */
        } else if (w == 3) {
            dayTo = '(' + langData['siteConfig'][34][5][3] + ')';        /* 周四 */
        } else if (w == 4) {
            dayTo = '(' + langData['siteConfig'][34][5][4] + ')';         /* 周五 */
        } else if (w == 5) {
            dayTo = '(' + langData['siteConfig'][34][5][5] + ')';        /* 周六 */
        } else if (w == 6) {
            dayTo = '(' + langData['siteConfig'][34][5][6] + ')';        /* 周日 */
        }
        var dateData = {
            y: dd.getFullYear(),
            m: dd.getMonth() + 1,//获取当前月份的日期
            d: dd.getDate(),
            w: dayTo,
        }
        return dateData;
    },
    FunGetTimeStr: function (start, p_time, end) {
        var dd = new Date(start);
        dd.setDate(dd.getMinutes()() + p_time);//获取p_time分钟后的时间
        var y = dd.getFullYear();
        var m = dd.getMonth() + 1;//获取当前月份的日期
        var d = dd.getDate();
        var w = dd.getDay();
    },

    //获取当前时间
    FunGetDate: function () {
        var date = new Date(); //日期对象
        var now = "";
        now = date.getFullYear() + "-";
        now = now + (date.getMonth() + 1) + "-";//取月的时候取的是当前月-1如果想取当前月+1就可以了
        now = now + date.getDate() + " ";
        now = now + date.getHours() + ":";
        now = now + date.getMinutes() + ":";
        now = now + date.getSeconds() + "";
        return now;
    },


}


var Today = dates.FunGetDate();
var days = 2;
var sdTime = 50;//送达间隔时间

function formatTime() {
    var list_left = [], list_right = [];

    // 左侧日期
    for (var i = 0; i < days; i++) {
        var dayD = dates.FunGetDateStr(+i);
        var daytxt = '', dayId = dayD.y + '-' + dayD.m + '-' + dayD.d;
        if (i == 0) {
            daytxt = '今日' + dayD.w;

        } else if (i == 1) {
            daytxt = '明日' + dayD.w;
        } else {
            daytxt = dayD.m + '月' + dayD.d + '日' + dayD.w
        }
        list_left.push('<li class="' + (i ? "" : "on_chose") + '"  data-today="' + (i ? 0 : 1) + '" data-date= "' + dayId + '">' + daytxt + '</li>');
    }
    $('.left_day ul').html(list_left.join(''));
}

//右侧时间
function rightTime() {
    var right_ul = [];
    // 右侧时间
    var nowDate = new Date();
    var h = nowDate.getHours();//
    var nowmin = nowDate.getMinutes();
    var nDat = $('.left_day li.on_chose').attr('data-today');
    var mm = 0;
    for (var i = 0; i < 24; i++) {

        i = i < 10 ? '0' + i : i;//小于10 补0
        for (var m = 0; m < (60 / 15); m++) {//15分钟一间隔
            var min = m ? ((m * 15 == 60 ? (m * 15 - 1) : m * 15)) : "00";
            var min2, i2, sdTxt;
            //min2 立即送达时的 送达分钟
            //i2 立即送达时的 送达小时 用于比较
            //sdTxt 立即送达时的 送达小时 用来存放明后天文字 不用做比较
            if (nDat == "1") {//今天时 需判断立即送达时间

                if (i > h || (i == h && (min * 1) > nowmin)) {

                    if (mm == 0) {
                        //只需要得到立即送达时的 送达时间
                        if ((min * 1) + sdTime > 60) {//sdTime送达间隔时间
                            min2 = ((min * 1) + sdTime) - 60;
                            i2 = i * 1 + 1;
                            min2 = min2 < 10 ? '0' + min2 : min2;//小于10 补0
                            i2 = i2 < 10 ? '0' + i2 : i2;//小于10 补0
                        } else {
                            min2 = min * 1 + sdTime;
                            i2 = i * 1;
                            i2 = i2 < 10 ? '0' + i2 : i2;//小于10 补0
                        }
                        sdTxt = i2;
                        //送达时间第二天时
                        if (i2 == 24) {

                            if (nDat == 1) {
                                sdTxt = '明天00';
                            } else {
                                sdTxt = '后天00';
                            }
                        }
                        right_ul.push('<li data-time="' + i2 + ':' + min2 + '" class="nowt"><span>尽快送达</span><em class="sline">|</em><em class="yjTIme">预计' + sdTxt + ':' + min2 + '送达</em></li>');
                    } else {
                        if (i > i2 || (i == i2 && (min * 1) > min2)) {//取大于立即送达时间的 送达时间
                            right_ul.push('<li data-time="' + i + ':' + min + '"><span>' + i + ':' + min + '</span></li>');
                        }

                    }
                    mm++;
                }

            } else {
                right_ul.push('<li data-time="' + i + ':' + min + '"><span>' + i + ':' + min + '</span></li>');
            }




        }
    }

    $('.right_time ul').html(right_ul.join(''));

}

// 错误提示
function showMsg(str) {
    var o = $(".error");
    o.html(str).css('display', 'inline-block');
    setTimeout(function () { o.css('display', 'none') }, 1000);
}

// 错误提示
function showMsg2(str) {
    var o = $(".tipError");
    o.html(str).css('display', 'inline-block');
    setTimeout(function () { o.css('display', 'none') }, 1000);
}
