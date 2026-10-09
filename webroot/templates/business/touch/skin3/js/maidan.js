// 计算实付金额
function getTotalMoney() {
    console.log($("#all_money_show").val(), $("#all_money_show").val().replace(/^\D*(\d*(?:\.\d{0,2})?).*$/g, '$1'))
    $("#all_money").val($("#all_money_show").val().replace(/^\D*(\d*(?:\.\d{0,2})?).*$/g, '$1'))
    if ($("#out_money_show").size() > 0) {
        $("#out_money").val($("#out_money_show").val().replace(/^\D*(\d*(?:\.\d{0,2})?).*$/g, '$1'))
    }
    var all_money = $("#all_money").val() ? parseFloat($("#all_money").val()) : 0,
        out_money = $('#out_money').val() ? parseFloat($('#out_money').val()) : 0;

    var out_money_ = out_money;
    var money = (all_money) * (100 - (youhui_open ? youhui_value : 0)) / 100 + out_money_;

    //实际支付金额 = (消费总额 - 不参与优惠金额) * 优惠比例 + 不参与优惠金额;
    var money = all_money >= out_money_ ? ((all_money - out_money_) * (100 - (youhui_open ? youhui_value : 0)) / 100 + out_money_) : 0;
    money = parseFloat(money.toFixed(2));

    //优惠金额
    var youhui_money = (all_money - out_money_) * (youhui_open ? youhui_value : 0) / 100;
    if(youhui_money && youhui_money > 0){
        $('.discount').html('-' + echoCurrency('symbol') + parseFloat(youhui_money.toFixed(2)));
    }else{
        $('.discount').html('');
    }

    $(".count em").text(money);

    if(money > 0){
        $("#selfNumBox .btn_pay").removeClass('disabled');
    }else{
        $("#selfNumBox .btn_pay").addClass('disabled');
    }

    return { amount: all_money, amount_alone: out_money_ };

}

$(function () {

    getTotalMoney();
    if (state == 0){
        alert('该店铺未开通在线买单！');
        location.href = detailUrl;
        return;
    }

    // 输入框
    $(".inpbox input[type='text']").focus(function () {
        $('.focus').removeClass('focus');
        var t = $(this), inp = t.closest('.inpbox');
        inp.addClass('focus');
    });

    $(".inpbox input[type='text']").blur(function () {
        var t = $(this), inp = t.closest('.inpbox');
        // inp.removeClass('focus');
    })


    $(".inpbox input[type='text']").on('input', function () {
        var t = $(this), inp = t.closest('.inpbox');
        var val = t.val().replace(/^\D*(\d*(?:\.\d{0,2})?).*$/g, '$1')
        if (val != '') {
            t.val(echoCurrency('symbol') + val);
        } else {
            t.val(val);
        }
        t.siblings('input[type="hidden"]').val(val.replace(echoCurrency('symbol'), ''));
        getTotalMoney();
    });

    
    //显示买单说明
    $('.sale_tips').bind('click', function () {
        $('.sale_tips_box').show();
    });
    $('.sale_tips_box_bg').bind('click', function () {
        $('.sale_tips_box').hide();
    });


    // 支付
    $("#selfNumBox .btn_pay").click(function(){
    	var t = $(this);    
    	if(t.hasClass("disabled") ) return;
    
    	// 支付
        var price = getTotalMoney();

        if ($("#all_money_show").val() == '') {
            showErr('请输入总金额');
            return false;
        }

        $.ajax({
            url: '/include/ajax.php?service=business&action=maidanDeal',
            type: 'post',
            data: {
                store: shopid,
                amount: price.amount,
                amount_alone: price.amount_alone
            },
            dataType: 'json',
            success: function (data) {
                if (data && data.state == 100) {
                    if (typeof (data.info) == 'object') {
                        sinfo = data.info;
                        service = 'business';
                        $('#ordernum').val(sinfo.ordernum);
                        $('#action').val('pay');

                        $('#pfinal').val('1');
                        $("#amout").text(sinfo.order_amount);
                        $('.payMask').show();
                        $('.payPop').css('transform', 'translateY(0)');

                        if (totalBalance * 1 < sinfo.order_amount * 1) {
                            $("#moneyinfo").text('余额不足，');
                            $('#balance').hide();
                        }

                        ordernum = sinfo.ordernum;
                        order_amount = sinfo.order_amount;
                        orderurl = sinfo.orderurl;

                        payCutDown('', sinfo.timeout, sinfo);
                    } else {

                        if (data && data.state == 100) {
                            location.href = payUrl.replace('%ordernum%', data.info);
                        } else {
                            alert(data.info);
                        }
                    }
                }else{
                    showErr(data.info);
                }

            },
            error: function () {
                alert(langData['siteConfig'][20][183]);
            }
        })

    })



    setTimeout(function () {
        getTotalMoney();
    }, 500)


    var showErrTimer;
    function showErr(data) {
        showErrTimer && clearTimeout(showErrTimer);
        $(".popErr").remove();
        $("body").append('<div class="popErr"><p>' + data + '</p></div>');
        $(".popErr p").css({
            "margin-left": -$(".popErr p").width() / 2,
            "left": "50%"
        });
        $(".popErr").css({
            "visibility": "visible"
        });
        showErrTimer = setTimeout(function () {
            $(".popErr").fadeOut(300, function () {
                $(this).remove();
            });
        }, 1500);
    }


})



var slfBox = new Vue({
    el: "#selfNumBox",
    data: {
        ds_inp: false,
        dsNum: '',
        noDot: false,
        ds_num_in: [],
        currInd: '0', //当前所在inp
    },
    created() {
        var tt = this;
        if (typeof (maidan) != 'undefined') { //买单

            tt.ds_inp = true
        }
    },
    mounted() {
        var tt = this;
        if (typeof (type) != 'undefined' && type == '') {
            this.noDot = true;
        }
    },
    methods: {
        numIn: function (e) {
            var tt = this;
            var el = event.currentTarget;
            var num = $(el).attr('data-id');
            if (tt.ds_num_in.indexOf('.') <= -1 || num != '.') {
                tt.ds_num_in.push(num);
            }
            $('.focus').removeClass('focus');
            $('#selfNumBox .inpbox:eq('+this.currInd+')').addClass('focus');
            e.stopPropagation()
        },
        checkInp: function (ind) {
            var tt = this;
            tt.ds_inp = true;
            tt.currInd = ind.toString();
            setTimeout(function () {
                tt.ds_num_in = $(".currInd").val().split('')
            }, 500)
        },
        // 删除输入的数字
        ds_delNum: function () {
            var tt = this;
            tt.ds_num_in.pop();
        }
    },
    watch: {
        ds_num_in: function () {
            var tt = this;
            tt.dsNum = tt.ds_num_in.join('');
            if (tt.dsNum.toString().split('.').length > 1 && tt.dsNum.toString().split('.')[1].length > 2) {
                tt.ds_num_in.pop();
            }
            if (tt.dsNum.split('.')[0].length > 1 && tt.dsNum.split('.')[0] == 0) {
                tt.ds_num_in.pop();
            }
        },
        dsNum: function () {
            var tt = this;

            if (typeof (maidan) != 'undefined') { //买单
                // $("#all_money_show").val(tt.dsNum)
                $(".currInd").val(tt.dsNum)
                getTotalMoney()
            }

            if (tt.dsNum == '') return false;
            pointNum = Number(tt.dsNum);
            if (typeof (type) != 'undefined') { //积分充值
                jsPrice()
            }

        },
        ds_inp: function () {
            var tt = this;
            if (tt.ds_inp) {
                $("body").css({
                    'padding-bottom': '2.5rem'
                })
                $(window).scrollTop($("body").height());
                $(".mainUl li").removeClass('active')
            } else {
                $("body").css({
                    'padding-bottom': '0'
                })
            }
        }
    }
})