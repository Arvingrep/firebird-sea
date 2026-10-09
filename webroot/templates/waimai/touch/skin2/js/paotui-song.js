$(function () {
    //APP端取消下拉刷新
    toggleDragRefresh('off');

    //选择收货取货地址
    $('.shoptype li').click(function () {
        var turl = $(this).find('a').attr('data-url1');
        if ($(this).index() == 0) {// 取货时传收货坐标过去

            var quAdrr = { 'quLng': sqLng, 'quLat': sqLat, 'quAdrs': sqAdr, 'quDet': sqDetail }
            utils.setStorage('songshouAdress', JSON.stringify(quAdrr));
        } else {// 收货时传取货坐标过去
            var shouAdrr = { 'quLng': qhLng, 'quLat': qhLat, 'quAdrs': qhAdr, 'quDet': qhDetail }
            utils.setStorage('songquAdress', JSON.stringify(shouAdrr));

        }
        utils.setStorage('songgoAdress', 1);
        var goodsType = $('.goodsType li.active').find('a').text(),
            goodsValue = $('.goodsValue li.active').find('a').attr('data-id'),
            weightValue = $('.goodsWeight #weight').text(),
            goodInfo = $('#goodsinfo').val(),
            note = $('#note').val(),
            tipPrice = $('#tipPrice').val(),
            quan = $('.youhui .hasQuan em').text(),
            sdtime = $('#time').val(),
            sdval = $('.qjTime').attr('data-time');
        var paotuisongInfo = { 'goodsType': goodsType, 'goodsValue': goodsValue, 'weightValue': weightValue, 'tipPrice': tipPrice, 'quan': quan, 'sdval': sdval, 'sdtime': sdtime, 'note': note, 'goodInfo': goodInfo }

        utils.setStorage('paotuisongInfo', JSON.stringify(paotuisongInfo));

        window.location.href = turl;
    })


    // 点击遮罩层 取消按钮
    $('.mask,.cancelBtn').on('click', function () {
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
        location.href = ptUrl;

    })
    //继续订单
    $('.orderAlert ul li.continue').click(function () {
        clickMask();
    })
    //价格明细
    $('.orderPrice').click(function () {
        if (!$(this).hasClass('showPrice')) {
            $(this).addClass('showPrice');
            $(".orTop").animate({ "bottom": "1.08rem" }, 300, "swing");
            $('.order_bottom').addClass('spe');
            $('.mask').show();
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
        $('.orderWrap').addClass('fn-hide');
    })

    //计价规则返回
    $('.rule-header-back').click(function () {

        $('.ruleWrap').hide();
        $('.orderWrap').removeClass('fn-hide');
    })

    //选择物品信息
    $('.goodsInfo').click(function () {
        $('.mask').show();
        $(".goodsAlert").animate({ "bottom": "0" }, 300, "swing");
    })

    $('.goodsCon li').click(function () {
        $(this).toggleClass('active').siblings('li').removeClass('active')
    })

    //物品重量 加
    $('.addWeight').click(function () {
        var val = $('#weight').text();
        if ($(this).hasClass('disabled'))
            return false;
        if (val <= (maxxWeight - 1)) {
            val++;
        }
        if (val == maxxWeight) {
            $(this).addClass('disabled');
        }
        $('.minusWeight').removeClass('disabled');

        $('#weight').text(val)
    })

    //物品重量 减
    $('.minusWeight').click(function () {
        var val = $('#weight').text();
        if ($(this).hasClass('disabled'))
            return false;
        if (val > 1) {
            val--;
        }
        if (val == 1) {
            $(this).addClass('disabled');
        }
        $('.addWeight').removeClass('disabled');
        $('#weight').text(val)
    })

    //物品信息确定
    $('.goodsAlert .sureGoods').click(function () {
        var goodsType = $('.goodsType li.active').find('a').text(),
            goodsValue1 = $('.goodsValue li.active').find('a').text(),
            goodsValue = $('.goodsValue li.active').find('a').attr('data-id'),
            weight = $('.goodsWeight').find('.realWeight').text(),
            weightValue = $('.goodsWeight #weight').text();
        goodsType = goodsType ? goodsType + '/' : '';
        goodsValue1 = goodsValue1 ? goodsValue1 + '/' : '';
        var goodInfo = goodsType + goodsValue1 + weight;
        $('#goodsinfo').val(goodInfo);
        clickMask();
        pathInit.getMoney();

    })

    formatTime(); //取件时间选择
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
            $('#time').val(date + '  ' + date2);
            var ymd = $('.left_day li.on_chose').attr('data-date') + ' ' + date2 + ':00';
            var ymd2 = DateToUnix(ymd);
            $('.qjTime').attr('data-time', ymd2);
            pathInit.sdTimeCalc();
        }
        clickMask();
        pathInit.getMoney();

    })


    //订单备注
    $('.qjNote').click(function () {
        $('.mask').show();
        $(".noteAlert").animate({ "bottom": "0" }, 300, "swing");
    })
    //监听备注字数
    $("#txtarea").on("input", function () {
        var t = $(this);
        if (t.text().length > 100) {
            t.text(t.text().substring(0, 100));
        } else {
            $(".inp_limit em").text(t.text().length);
        }

    })

    //备注快捷输入
    $('.noteAlert li').click(function () {
        var txt = $('#txtarea').text();
        if (!$(this).hasClass('curr')) {
            var ntxt = $(this).find('a').text();

            var eTxt = ntxt;
            if (txt != '') {
                eTxt = txt + '，' + ntxt;
            }
            if (eTxt.length > 100) {
                showMsg('最多100个字哦~')
            } else {
                $('#txtarea').text(eTxt);
                $(".inp_limit em").text(eTxt.length);
            }
        }
    })

    //确认备注
    $('.noteAlert .sureNote').click(function () {
        var txt = $('#txtarea').text();
        $('#note').val(txt);
        clickMask();
    })

    //优惠券返回
    $('.quan-header-back').click(function () {

        $('.quanWrap').hide();
        $('body').css('overflow', 'auto');
        $('.orderWrap').removeClass('fn-hide');
    })
    //打开优惠券
    $('.youhui').click(function () {
        if (!$(this).hasClass('disabled')) {
            $('.quanWrap').show();
            $('.orderWrap').addClass('fn-hide');
            $('body').css('overflow', 'hidden')
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
                $('.orderWrap').removeClass('fn-hide');
                $('body').css('overflow', 'auto');
            } else {
                $(this).removeClass('active');
                $('.youhui .hasHb').removeClass('fn-hide');
                $('.youhui .hasQuan').addClass('fn-hide');
                $('.youhui .hasQuan em').text(0);
            }

            pathInit.getMoney();

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
            $('.addTips #tips').val(tipNum + echoCurrency('short'));
        } else {
            $('.addTips #tips').val('');
        }
        $('#tipPrice').val(tipNum);
        clickMask();
        pathInit.getMoney();
    })

    //小费取消
    $('.tipsAlert .cancelTips').click(function () {
        clickMask();
    })

    //选择积分抵扣
    $(".jfchose .jscheck").click(function () {
        var t = $(this);
        t.toggleClass('hasgou');
        $('.priceBox .jfPrice').toggleClass('show');
        pathInit.getMoney();
    });
    $(".jfchose .jscheck").click();
    $(".tjBtn,.shareTo").click(function () {
        var t = $(this);
        if (t.hasClass("disabled")) return;


        var faaddress = $.trim($(".qh .qhAddress").text()),
            getName = $.trim($(".qh .qhInfo s").text()),
            getTel = $.trim($(".qh .qhInfo em").text()),
            shouaddress = $.trim($(".sq .sqAddress").text()),
            takeName = $.trim($(".sq .sqInfo s").text()),
            takeTel = $.trim($(".sq .sqInfo em").text()),
            gettime = $(".qjTime").attr("data-time"),
            note = $("#note").val(),
            goodsinfo = $("#goodsinfo").val(),
            price = $(".goodsValue li.active a").attr("data-id"),
            relweight = ($('.realWeight #weight').text()) * 1,
            juli = ($('.distance span').attr('data-juli')) * 1,
            tipPrice = $("#tipPrice").val(),
            usePinput = $("#usePinput").val();

        if (faaddress == '') {
            showMsg(langData['waimai'][3][92]);

            return;
        }
        if (getTel == '') {
            showMsg(langData['siteConfig'][20][433]);
            return;
        }
        if (shouaddress == '') {
            showMsg(langData['waimai'][3][93]);
            return;
        }
        if (takeTel == '') {
            showMsg(langData['siteConfig'][20][433]);
            return;
        }
        //物品信息
        if ($('.goodsType li.active').length == 0) {
            showMsg('请选择物品类型');
            return;
        }
        if ($('.goodsValue li.active').length == 0) {
            showMsg('请选择物品价值');
            return;
        }
        //取件时间
        if (!gettime) {
            showMsg('请选择取件时间');
            return;
        }



        var peerpay = $(this).attr('data-paytype')

        var data = [];
        data.push("type=2");
        data.push("shop=" + goodsinfo);
        data.push("price=" + price);
        data.push("faaddress=" + faaddress);
        data.push("faname=" + getName);
        data.push("fatel=" + getTel);
        data.push("shouaddress=" + shouaddress);
        data.push("shoutel=" + takeTel);
        data.push("shouname=" + takeName);
        data.push("buylng=" + qhLng);
        data.push("buylat=" + qhLat);
        data.push("lng=" + sqLng);
        data.push("lat=" + sqLat);
        data.push("gettime=" + gettime);
        data.push("totime=" + $("#sdtime").val());
        data.push("tip=" + tipPrice);
        data.push("note=" + note);
        data.push("weight=" + relweight);
        data.push("juli=" + juli);
        data.push("peerpay=" + peerpay);
        data.push("usePinput=" + usePinput);

        $('.payBeforeLoading').show();
        t.addClass("disabled").text('提交订单');

        $.ajax({
            url: '/include/ajax.php?service=waimai&action=paotuiDeal',
            data: data.join("&"),
            type: 'post',
            dataType: 'json',
            success: function (data) {
                if (data && data.state == 100) {
                    // t.removeClass("disabled").text("提交订单");
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
                } else {
                    showMsg(data.info);
                    t.removeClass("disabled").text(langData['siteConfig'][19][665]);
                    $('.payBeforeLoading').hide();
                }
            },
            error: function () {
                showMsg(langData['siteConfig'][20][183]);
                t.removeClass("disabled").text(langData['siteConfig'][19][665]);
                $('.payBeforeLoading').hide();
            }

        })



    })
    songInit.get();




})
var songInit = {
    get: function () {
        //var typeList = ['goodsType','goodsValue','weightValue','note','tipPrice','quan','sdval','sdtime','goodInfo'];
        var goAdr1 = utils.getStorage('songgoAdress');
        var songAll = utils.getStorage('paotuisongInfo');
        if (goAdr1) {
            if (songAll) {
                if (songAll.goodsType) {
                    $(".goodsType li[data-type='" + songAll.goodsType + "']").addClass('active');

                }

                if (songAll.goodsValue) {
                    $(".goodsValue li a[data-id='" + songAll.goodsValue + "']").closest('li').addClass('active');
                }

                if (songAll.weightValue) {
                    $("#weight").text(songAll.weightValue);
                }
                if (songAll.goodInfo) {
                    $('#goodsinfo').val(songAll.goodInfo);
                }


                if (songAll.note) {
                    $("#note").val(songAll.note);
                    $('#txtarea').html(songAll.note);
                }

                if (songAll.tipPrice) {
                    $('.addTips #tips').val(songAll.tipPrice + echoCurrency('short'));
                    $('#tipPrice').val(songAll.tipPrice);
                    var tipObj = $(".tipsBox a[data-tips='" + songAll.tipPrice + "']");
                    if (tipObj.length == 0) {
                        $("#otherTips").val(songAll.tipPrice);
                        $(".inpbox").click();
                    } else {
                        tipObj.click();
                    }
                }

                if (songAll.quan) {
                    $('.youhui .hasHb').addClass('fn-hide');
                    $('.youhui .hasQuan').removeClass('fn-hide');
                    $('.youhui .hasQuan em').text(songAll.quan);
                }

                if (songAll.sdtime) {
                    $("#time").val(songAll.sdtime);
                }

                if (songAll.sdval) {
                    $('.qjTime').attr('data-time', songAll.sdval);
                }
                utils.removeStorage('paotuisongInfo');

            }
            utils.removeStorage('songgoAdress');

        }

    },
    set: function (type, value) {
        utils.setStorage('paotui_song_' + type, JSON.stringify(value));
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
            daytxt = '今天' + dayD.w;

        } else if (i == 1) {
            daytxt = '明天' + dayD.w;
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
    var h = nowDate.getHours();
    var nowmin = nowDate.getMinutes();
    var nDat = $('.left_day li.on_chose').attr('data-today');
    for (var i = 0; i < 24; i++) {
        i = i < 10 ? '0' + i : i;//小于10 补0
        for (var m = 0; m < (60 / 15); m++) {//15分钟一间隔
            var min = m ? ((m * 15 == 60 ? (m * 15 - 1) : m * 15)) : "00";
            var cls = "";
            if (i < h || (i == h && nowmin > (min * 1))) {
                cls = "hide";
            }
            var min2, i2;
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
            //送达时间第二天时
            if (i2 == 24) {

                if (nDat == 1) {
                    i2 = '明天00';
                } else {
                    i2 = '后天00';
                }
            }

            //right_ul.push('<li class="'+cls+'"><span>'+i+':'+min+'</span><em class="speEm">(预计'+i2+':'+min2+'送达)</em>'+'</li>');
            right_ul.push('<li class="' + cls + '"><span>' + i + ':' + min + '</span>' + '</li>');

        }
    }

    $('.right_time ul').html(right_ul.join(''));

    if (nDat == '1') {
        $('.right_time li.hide').hide();
    } else {
        $('.right_time li.hide').show();
    }
}

// 错误提示
function showMsg(str) {
    var o = $(".error");
    o.html(str).css('display', 'inline-block');
    setTimeout(function () { o.css('display', 'none') }, 1000);
}

function showMsg2(str) {
    var o = $(".tipError");
    o.html(str).css('display', 'inline-block');
    setTimeout(function () { o.css('display', 'none') }, 1000);
}

  // 定位
  // var localData = utils.getStorage('waimai_local');
  // var localData = '';
  // if(localData){
  //   lat = localData.lat;
  //   lng = localData.lng;
  //   address = localData.address;
  //   $('.gz-addr-seladdr,.choseWrap').attr('data-lng',lng);
  //   $('.gz-addr-seladdr,.choseWrap').attr('data-lat',lat);
  //   $('.gz-addr-seladdr').find("input#addr").val(address);
  //   $('.choseWrap').attr('data-address',address);
  // }else{
  //   HN_Location.init(function(data){
  //       if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
  //           $("#local strong").text(langData['siteConfig'][27][136]);

  //       }else{
  //         var name = data.name;
  //         lng = data.lng;
  //         lat = data.lat;
  //         city = data.city;
  //         $('.gz-addr-seladdr').find("input#addr").val(name);
  //         $('.gz-addr-seladdr,.choseWrap').attr('data-lng',lng);
  //         $('.gz-addr-seladdr,.choseWrap').attr('data-lat',lat);
  //         $('.choseWrap').attr('data-address',name);
  //       }
  //   })
  // }
