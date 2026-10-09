$(function () {

    //APP端取消下拉刷新
    toggleDragRefresh('off');

    //原生APP后退回来刷新页面
    pageBack = function (data) {
        setupWebViewJavascriptBridge(function (bridge) {
            bridge.callHandler("pageRefresh", {}, function (responseData) { });
        });
    }

    var currYear = (new Date()).getFullYear();
    var opt = {};
    opt.date = { preset: 'date' };
    opt.datetime = { preset: 'datetime' };
    opt.time = { preset: 'time' };
    opt.default = {
        theme: 'android-ics light', //皮肤样式
        display: 'bottom', //显示方式
        mode: 'scroller', //日期选择模式
        dateFormat: 'yy-mm-dd',
        lang: 'zh',
    };

    $("#birth").mobiscroll($.extend(opt['date'], opt['default']));

    //性别
    var dataArr = [
        { id: '1', value: langData['siteConfig'][13][4] },//男
        { id: '0', value: langData['siteConfig'][13][5] },//女
    ];
    var typeSelect = new MobileSelect({
        trigger: '.sexdl',
        title: '',
        wheels: [
            { data: dataArr }
        ],
        position: [0, 0],
        callback: function (indexArr, data) {
            $('.sexChoose').text(data[0]['value']);
            $('#sex').val(data[0]['id']);
        }
        , triggerDisplayData: false,
    });

    
    $("#sex").change(function () {
        var opt = $("#sex").val();
        if (opt == 1) {
            $('.isex').removeClass('isex0').addClass('isex1');
        } else {
            $('.isex').removeClass('isex1').addClass('isex0');
        }
    });

    //民族
    var dataArr = [
        { id: '汉族', value: '汉族' },
        { id: '壮族', value: '壮族' },
        { id: '满族', value: '满族' },
        { id: '回族', value: '回族' },
        { id: '苗族', value: '苗族' },
        { id: '维吾尔族', value: '维吾尔族' },
        { id: '土家族', value: '土家族' },
        { id: '彝族', value: '彝族' },
        { id: '蒙古族', value: '蒙古族' },
        { id: '藏族', value: '藏族' },
        { id: '布依族', value: '布依族' },
        { id: '侗族', value: '侗族' },
        { id: '瑶族', value: '瑶族' },
        { id: '朝鲜族', value: '朝鲜族' },
        { id: '白族', value: '白族' },
        { id: '哈尼族', value: '哈尼族' },
        { id: '哈萨克族', value: '哈萨克族' },
        { id: '黎族', value: '黎族' },
        { id: '傣族', value: '傣族' },
        { id: '畲族', value: '畲族' },
        { id: '傈僳族', value: '傈僳族' },
        { id: '仡佬族', value: '仡佬族' },
        { id: '东乡族', value: '东乡族' },
        { id: '高山族', value: '高山族' },
        { id: '拉祜族', value: '拉祜族' },
        { id: '水族', value: '水族' },
        { id: '佤族', value: '佤族' },
        { id: '纳西族', value: '纳西族' },
        { id: '羌族', value: '羌族' },
        { id: '土族', value: '土族' },
        { id: '仫佬族', value: '仫佬族' },
        { id: '锡伯族', value: '锡伯族' },
        { id: '柯尔克孜族', value: '柯尔克孜族' },
        { id: '达斡尔族', value: '达斡尔族' },
        { id: '景颇族', value: '景颇族' },
        { id: '毛南族', value: '毛南族' },
        { id: '撒拉族', value: '撒拉族' },
        { id: '布朗族', value: '布朗族' },
        { id: '塔吉克族', value: '塔吉克族' },
        { id: '阿昌族', value: '阿昌族' },
        { id: '普米族', value: '普米族' },
        { id: '鄂温克族', value: '鄂温克族' },
        { id: '怒族', value: '怒族' },
        { id: '京族', value: '京族' },
        { id: '基诺族', value: '基诺族' },
        { id: '德昂族', value: '德昂族' },
        { id: '保安族', value: '保安族' },
        { id: '俄罗斯族', value: '俄罗斯族' },
        { id: '裕固族', value: '裕固族' },
        { id: '乌孜别克族', value: '乌孜别克族' },
        { id: '门巴族', value: '门巴族' },
        { id: '鄂伦春族', value: '鄂伦春族' },
        { id: '独龙族', value: '独龙族' },
        { id: '塔塔尔族', value: '塔塔尔族' },
        { id: '赫哲族', value: '赫哲族' },
        { id: '珞巴族', value: '珞巴族' },
    ];
    var typeSelect = new MobileSelect({
        trigger: '.nationdl',
        title: '',
        wheels: [
            { data: dataArr }
        ],
        position: [0, 0],
        callback: function (indexArr, data) {
            $('.nationChoose').text(data[0]['value']);
            $('#nation').val(data[0]['id']);
        }
        , triggerDisplayData: false,
    });


    //提交
    $("#submit").bind("click", function (event) {
        event.preventDefault();

        var id = $('.gz-addr-seladdr').attr("data-id");
        if (id != 0) {
            $('#addr').val(id);
        }

        var t = $(this), form = $("#fabuForm"), serialize = form.serialize(), action = form.attr("action");
        if (t.hasClass('disabled')) return;

        var nickname = $('#nickname').val();
        serialize += '&nickname=' + nickname;

        t.addClass("disabled").html(langData['siteConfig'][6][35] + "...");

        var data = [];
        data.push("rsaEncrypt=1");
        data.push("nickname="+rsaEncrypt($('#nickname').val()));
        data.push("qq="+rsaEncrypt($('#qq').val()));
        data.push("sex="+rsaEncrypt($('#sex').val()));
        data.push("birthday="+rsaEncrypt($('#birth').val()));
        data.push("addr="+rsaEncrypt($('#addr').val()));
        data.push("nation="+rsaEncrypt($('#nation').val()));

        $.ajax({
            url: action,
            data: data.join('&'),
            type: "POST",
            dataType: "json",
            success: function (data) {
                if (data && data.state == 100) {
                    t.removeClass("disabled").html(langData['siteConfig'][20][229]);
                    setTimeout(function () {
                        t.html(langData['siteConfig'][6][27]);
                    }, 2000);
                } else {
                    alert(data.info);
                    t.removeClass("disabled").html(langData['siteConfig'][6][27]);
                }
            },
            error: function () {
                alert(langData['siteConfig'][20][183]);
                t.removeClass("disabled").html(langData['siteConfig'][6][27]);
            }
        });

    });

})
