$(function() {

    var mask = $(window).height();
    $('.mask').css('height', mask);

    $('.h-menu').on('click', function() {
        if ($('.nav,.mask').css("display") == "none") {
            $('.nav,.mask').show();
            $('.header').css('z-index', '101');

        } else {
            $('.nav,.mask').hide();
            $('.header').css('z-index', '99');

        }
    })
    $('.mask').on('touchmove', function() {
        $(this).hide();
        $('.nav').hide();

    })
    $('.mask').on('click', function() {
        $(this).hide();
        $('.nav').hide();
        $('.header').css('z-index', '99');

    })

    $('.tab-area').click(function() {
        $(this).addClass('active');
        $(this).siblings().removeClass('active')
        $('.form-section-1,.form-item-sf').show();
        $('.form-item-sy').hide();
        $('.result-box').hide();

    })

    $('.tab-much').click(function() {
        $(this).addClass('active');
        $(this).siblings().removeClass('active')
        $('.form-section-1,.form-item-sf').hide();
        $('.form-item-sy').css('display', '-webkit-box');
        $('.result-box').hide();
    })

    $("input").keyup(function() {
        var tmptxt = $(this).val();
        $(this).val(tmptxt.replace(/[^\d\.]/g, ''));
    }).bind("paste", function() {
        var tmptxt = $(this).val();
        $(this).val(tmptxt.replace(/[^\d\.]/g, ''));
    }).css("input", "disabled");

    // 计算结果画圆
    var pie = {
        run: function(opts) {
            if (!opts.id) {
                throw new Error("must be canvas id.");
            }
            var canvas = document.getElementById(opts.id),
                ctx;

            if (canvas && (ctx = canvas.getContext("2d"))) {
                var noop = function() {};
                var before = opts.onBefore || noop;
                var after = opts.onAfter || noop;
                before(ctx);
                ctx.fillStyle = opts.color || "#f76220";
                var step = opts.step || 1;
                var delay = opts.delay || 5;
                var i = 0,
                    rage = 360 * (opts.percent || 0);
                var sRage = -Math.PI * 1.3;
                var djs = function() {
                    i = i + step;
                    if (i <= rage) {
                        ctx.beginPath();
                        ctx.moveTo(canvas.width / 2, canvas.width / 2);
                        ctx.arc(canvas.width / 2, canvas.width / 2, canvas.width / 2 - 0.5, sRage, Math.PI * 1.6 * (i / 360) + sRage);
                        ctx.fill();
                        setTimeout(djs, delay)
                    } else {
                        after(ctx)
                    }
                };
                djs()
            }
        }
    };

    //统计结果
    function compute_result() {
        var month = $('#ul-year').val() * 12;
        //------------ 根据贷款总额计算

        //--  组合型贷款(组合型贷款的计算，只和商业贷款额、和公积金贷款额有关，和按贷款总额计算无关)
        var total_sy = $('#shangdai').val() * 10000;
        var total_gjj = $('#gongdai').val() * 10000;

        //贷款总额
        var daikuan_total = total_sy + total_gjj;
        $('#total_loan_bx, #total_loan_bj').text(Math.round(daikuan_total * 100) / 100);

        var lilv_sd = $('#lilv_shang').val() / 100; //得到商贷利率
        var lilv_gjj = $('#lilv_gong').val() / 100; //得到公积金利率

        $('#loan_month_bx, #loan_month_bj').text(month);

        // var end_pay = getMonthMoney2(lilv, daikuan_total, month, month)
        // var last_pay = Math.round(end_pay * 100) / 100;

        //1.本金还款
        //月还款
        var first_pay = 0;
        var all_total2 = 0;
        var average_pay_bj = 0;
        var last_pay = 0;
        // poputData = "";
        for (j = 0; j < month; j++) {
            //调用函数计算: 本金月还款额
            huankuan = getMonthMoney2(lilv_sd, total_sy, month, j) + getMonthMoney2(lilv_gjj, total_gjj, month, j);
            all_total2 += huankuan;
            if (j == 0)
                average_pay_bj = Math.round(huankuan * 100) / 100;
            if (j == 1)
                decrease = Math.round((average_pay_bj - huankuan) * 100) / 100;
            if( j + 1 == month)
                last_pay = Math.round(huankuan * 100) / 100;
            // huankuan = Math.round(huankuan * 100) / 100;
            // poputData += '<li><span style="width: ' + (huankuan / average_pay_bj * 100) + '%;">第' + (j + 1) + '期<em>' + huankuan + echoCurrency('short')+'</em></span></li>';
        }
        $('#average_pay_bj').text(average_pay_bj);
        $('#last_pay').text(last_pay);
        //还款总额
        $('#total_pay_bj').text(Math.round(all_total2 * 100) / 100);
        //支付利息款
        $('#interest_bj').text(Math.round((all_total2 - daikuan_total) * 100) / 100);


        //2.本息还款
        //月均还款
        var month_money1 = getMonthMoney1(lilv_sd, total_sy, month) + getMonthMoney1(lilv_gjj, total_gjj, month); //调用函数计算
        $('#average_pay_bx').text(Math.round(month_money1 * 100) / 100);
        //还款总额
        var all_total1 = month_money1 * month;
        $('#total_pay_bx').text(Math.round(all_total1 * 100) / 100);
        //支付利息款
        $('#interest_bx').text(Math.round((all_total1 - daikuan_total) * 100) / 100);
    }

    //本金还款的月还款额(参数: 年利率 / 贷款总额 / 贷款总月份 / 贷款当前月0～length-1)
    function getMonthMoney2(lilv, total, month, cur_month) {
        var lilv_month = lilv / 12; //月利率
        var benjin_money = total / month;
        return (total - benjin_money * cur_month) * lilv_month + benjin_money;

    }

    //本息还款的月还款额(参数: 年利率/贷款总额/贷款总月份)
    function getMonthMoney1(lilv, total, month) {
        var lilv_month = lilv / 12; //月利率
        return total * lilv_month * Math.pow(1 + lilv_month, month) / (Math.pow(1 + lilv_month, month) - 1);
    }

    //在GBK编码里，除了ASCII字符，其它都占两个字符宽
    function getBytesLength(str) {
        return str.replace(/[^\x00-\xff]/g, 'xx').length;
    };

    var arr = []
    var top = parseInt($('.top').offset().top);
    $('.generate-btn').on("click", function() {

        if ($('#shangdai').val() == '') {
            alert('请填写商贷金额');
        } else if ($('#gongdai').val() == '') {
            alert('请填写公贷金额');
        } else {
            var top = $('.top').offset().top;
            $('.result-box').show();
            $('.footer').removeClass('footer-fixed');
            $('body').scrollTop(top);
            compute_result();

            var total_bx = $('#total_pay_bx').text();
            var daikuan_bx = $('#total_loan_bx').text();
            var lixi_bx = $('#interest_bx').text();
            var circle1 = 1; //百分百
            var circle2 = daikuan_bx / total_bx; //贷款百分比
            var circle3 = lixi_bx / total_bx; //贷款利息百分比
            arr = [circle1, circle2, circle3]

            $('.tit1').find('.title-2').text((circle2 * 100).toFixed(2) + "%");
            $('.tit2').find('.title-2').text((circle3 * 100).toFixed(2) + "%");

            var p = 0;
            var len = $(".jqm-round-wrap").length;
            for (p = 0; p < len; p++) {
                pie.run({
                    id: "jqm-round-sector-" + p,
                    percent: arr[p],
                    color: $("#jqm-round-sector-" + p).attr("data-color"),
                    onBefore: function(ctx) {
                        ctx.fillStyle = "#ececec";
                        ctx.beginPath();
                        ctx.moveTo(ctx.canvas.width / 2, ctx.canvas.width / 2);
                        ctx.arc(ctx.canvas.width / 2, ctx.canvas.width / 2, ctx.canvas.width / 2, -Math.PI * 1.3, Math.PI * 0.3);
                        ctx.fill()
                    }
                })
            }

        }

    })
    $('#bx').click(function() {
        var top = $('.top').offset().top;
        $('body').scrollTop(top);
        $(this).addClass('active');
        $('#bj').removeClass('active')
        $('.average-month').css('display', '-webkit-box');
        $('.first-month,.last-month').hide();
        $('#bx-info').show();
        $('#bj-info').hide();
        // $('.shoufu').hide();

        var p = 0;
        var len = $(".jqm-round-wrap").length;
        for (p = 0; p < len; p++) {
            pie.run({
                id: "jqm-round-sector-" + p,
                percent: arr[p],
                color: $("#jqm-round-sector-" + p).attr("data-color"),
                onBefore: function(ctx) {
                    ctx.fillStyle = "#ececec";
                    ctx.beginPath();
                    ctx.moveTo(ctx.canvas.width / 2, ctx.canvas.width / 2);
                    ctx.arc(ctx.canvas.width / 2, ctx.canvas.width / 2, ctx.canvas.width / 2, -Math.PI * 1.3, Math.PI * 0.3);
                    ctx.fill()
                }
            })
        }
    })
    $('#bj').click(function() {
        var top = $('.top').offset().top;
        $('body').scrollTop(top);
        compute_result();
        $(this).addClass('active');
        $('#bx').removeClass('active')
        $('.first-month,.last-month').css('display', '-webkit-box');
        $('.average-month').hide();
        $('#bx-info').hide();
        $('#bj-info').show();
        // $('.shoufu').show();

        var total_bj = $('#total_pay_bj').text();
        var daikuan_bj = $('#total_loan_bj').text();
        var lixi_bj = $('#interest_bj').text();
        var circle1 = 1; //百分百
        var circle2 = daikuan_bj / total_bj; //贷款百分比
        var circle3 = lixi_bj / total_bj; //贷款利息百分比

        var arr1 = [circle1, circle2, circle3];
        $('.tit3').find('.title-2').text((circle2 * 100).toFixed(2) + "%");
        $('.tit4').find('.title-2').text((circle3 * 100).toFixed(2) + "%");

        var p = 0;
        var len = $(".jqm-round-wrap").length;
        for (p = 0; p < len; p++) {
            pie.run({
                id: "jqm-round-sector" + p,
                percent: arr1[p],
                color: $("#jqm-round-sector" + p).attr("data-color"),
                onBefore: function(ctx) {
                    ctx.fillStyle = "#ececec";
                    ctx.beginPath();
                    ctx.moveTo(ctx.canvas.width / 2, ctx.canvas.width / 2);
                    ctx.arc(ctx.canvas.width / 2, ctx.canvas.width / 2, ctx.canvas.width / 2, -Math.PI * 1.3, Math.PI * 0.3);
                    ctx.fill()
                }
            })
        }
    })


})
