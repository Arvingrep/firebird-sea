var validTrade = null;
$(function () {
    if ($('video').length > 0) {
        $("video").attr('playsinline', true);
        var players = Plyr.setup('video', {
            // enabled: !/Android|webOS|BlackBerry/i.test(a),
            update: !0,
            controls: ["play-large", "play", "progress", "current-time", "mute", "volume", "fullscreen"],
            fullscreen: {
                enabled: !0,
                fallback: !0,
                iosNative: !0
            }
        });
    }
    $(".btn_hb").css('left', ($(".body_container>.wrap").offset().left + 1220) + 'px')
    if ($('#my-video').size() > 0) {
        var myPlayer = videojs('my-video');
        videojs("my-video").ready(function () {
            var myPlayer = this;
        });
    }

    if(payPhone){
        setTimeout(function(){
            $('.privatePhoneBtn').click();
        }, 1000);
    }

    // 查看电话
    // $('.phone_btn ').click(function(event) {
    //   /* Act on the event */
    //   var t = $(this),tel = t.attr('href');
    //   if(cfg_privateNumber_state!='1'){
    //     var userid = $.cookie(cookiePre+"login_user");
    //     if(userid == null || userid == ""){
    //         huoniao.login();
    //         return false;
    //     }
    //     t.find('span').text(tel)
    //   }else{
    //     var detailInfo = {};
    //     detailInfo.url = window.location.href;
    //     detailInfo.phone_id = id
    //     detailInfo.phone_temp = 'detail';
    //     detailInfo.phone_module = 'info';
    //     if(!if_login || !phoneCheck){  //未登录
    //       private_phone.loginPopShow(); //显示短信登录/跳转登录
    //     }else{
    //       private_phone.callPopShow(detailInfo); //显示电话弹窗
    //     }
    //   }
    //   event.preventDefault()
    // });

    // 更新有效期
    function updateValid(valid, editId, haspayVal) {
        var url = '/include/ajax.php?service=info&action=zvalid&id=' + editId;
        var amount = Number($('.validBox li.on_chose').attr('data-price'));
        if (haspayVal) {
            var dataTo = {
                hasPay: 1,
                valid: valid,
                amount: amount,
            }
        } else {
            var dataTo = {
                valid: valid,
                amount: amount,
            }
        }
        $.ajax({
            url: url,
            data: dataTo,
            type: "POST",
            dataType: "json",
            success: function (data) {
                if (data.state == 100) {
                    if (!haspayVal) {
                        keepPay(data.info, valid)
                    } else {
                        alert('成功增加信息曝光时长');
                        location.reload();
                    }
                }
            },
            error: function (data) {
                alert(data.info)
            },
        })
    }

    // 支付

    function keepPay(payInfo, valid) {

        var tt = this;
        var t = $(event.currentTarget), aid = payInfo.aid;

        $('.payPop').removeClass('payPhonePop');
        $('.payTitle').html('收银台');
        $('#payInfoSubject').html('订单总价');

        if (typeof (aid) != 'undefined' && aid != '') {

            $("#payform input[name='aid']").val(aid);
            $("#payform").append(
                '<input type="hidden" name="aid"  value="' + aid + '" />'
            );
        } else {
            $("#payform").append(
                '<input type="hidden" name="aid"  value="' + $("#aid").val() + '" />'
            );
        }

        if (typeof (module) == 'undefined' || typeof (module) != 'string' || module == '') {

            module = $("#module").val();
        }
        $("#ordertype").val('fabupay');
        $("#payform input[name='service']").val('member');
        $("#payform input[name='action']").val('fabuPay');
        $("#payform input[name='amount']").val(payInfo.order_amount);
        if ($('#payform input[name="balance"]').length == 0) {
            $('#payform').append('<input type="hidden" value="' + payInfo.order_amount + '" name="balance">')
        } else {
            $('#payform input[name="balance"]').val(payInfo.order_amount)
        }
        $("#payform input[name='valid']").val(valid);
        $("#payform input[name='validType']").val(1);
        ordernum = payInfo.ordernum;
        if($("#payform input[name='ordernum']").size() > 0){
            $("#payform input[name='ordernum']").val(ordernum);
        }else{
            $('#payform').append('<input type="hidden" value="' + ordernum + '" name="ordernum">')
        }
        // $("#payform #tourl").val( document.URL);
        // orderurl = document.URL
        $.ajax({
            type: 'POST',
            url: '/include/ajax.php?service=member&action=fabuPay',
            dataType: 'json',
            data: $("#payform").serialize(),
            success: function (sdata) {
                if (sdata && sdata.state == 100) {
                    sinfo = sdata.info;
                    // ordertype = 'fabuPay';

                    $("#amout").text(sinfo.order_amount);
                    if(sinfo.order_amount > 0){
                        $('.payMask,.payPop').show();
                    }

                    // if (totalBalance * 1 < sinfo.order_amount * 1) {
                    //
                    //   $("#moneyinfo").text('余额不足，');
                    //
                    //   $('#balance').hide();
                    // }

                    if (totalBalance * 1 < sinfo.order_amount * 1) {

                        $("#moneyinfo").text('余额不足，');
                        $('#balance').hide();
                        $("#moneyinfo").closest('.pay_item').addClass('disabled_pay')

                    } else {
                        $("#moneyinfo").text('可用');
                        $("#moneyinfo").closest('.pay_item').removeClass('disabled_pay')
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
                    var datainfo = [];
                    for (var k in sdata.info) {
                        datainfo.push(k + '=' + sdata.info[k]);
                    }
                    $("#service").val('member');
                    if ($(".pay_item.pay_balance").hasClass('chose_pay')) {
                        $("#useBalance").val('1');
                    }
                    var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
                    $('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));
                    // payCutDown('', sinfo.timeout);
                    cutDown = setInterval(function () {
                        $(".payCutDown").html(payCutDown(sinfo.timeout));
                    }, 1000)
                    if (validTrade) {
                        clearInterval(validTrade)
                    }

                    checkPayResult(ordernum)
                    validTrade = setInterval(function () {
                        checkPayResult(ordernum)
                    }, 2000)

                }
            },
            error: function () {

            }
        })

    }
    // 显示延长时间
    $('.delayTime').click(function () {
        $('.changeValidMask,.changeValidPop').show()
    })

    // 选择有效期
    $('.validBox li').click(function () {
        var t = $(this);
        t.addClass('on_chose').siblings('li').removeClass('on_chose');
        $('.validbtnBox p em').html($('.validBox li.on_chose h3').text())
    });

    // 去支付
    $('.changeValidPop .btn_valid').click(function () {
        var nowDate = parseInt((new Date()).valueOf() / 1000)
        var nowValid = (editValid - nowDate) > 0 ? editValid : nowDate;
        var addValid = Number($('.validBox li.on_chose').attr('data-time'));
        var amount = Number($('.validBox li.on_chose').attr('data-price'));
        nowValid = nowValid * 1 + addValid;
        updateValid(nowValid, editId)
    })

    // 关闭有效期
    $('.changeValidMask,.close_validPop').click(function () {
        $('.changeValidMask,.changeValidPop').hide();
        // editValid = 0;
        // editId = 0;
        $('html').removeClass('noscroll')
    })
    // 验证支付成功
    function checkPayResult(ordernum) {
        var tt = this;

        $.ajax({
            type: 'POST',
            async: false,
            url: '/include/ajax.php?service=member&action=tradePayResult&order=' + ordernum,
            dataType: 'json',
            success: function (str) {
                if (str.state == 100 && str.info != "") {
                    clearInterval(validTrade);
                    var nowDate = parseInt((new Date()).valueOf() / 1000)
                    var nowValid = (editValid - nowDate) > 0 ? editValid : nowDate;
                    var addValid = Number($('.validBox li.on_chose').attr('data-time'));
                    var amount = Number($('.validBox li.on_chose').attr('data-price'));
                    nowValid = nowValid * 1 + addValid;
                    $(".close_validPop").click()
                    updateValid(nowValid, editId, 1)

                }
            }
        });

    }


    // 分享

    $('.otherShare li').click(function () {
        var userid = $.cookie(cookiePre + "login_user");
        // if(userid == null || userid == ""){
        //     location.href = masterDomain + '/login.html';
        //     return false;
        // }
        if (share && fxState != '1' && userid != null && userid != '') {
            var url = '';
            url = '/include/ajax.php?service=info&action=sharePrice&uid=' + gz_userid + '&proid=' + detail_id
            $.ajax({
                url: url,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if (data && data.state == 100) {
                        fxState = '1'; //修改状态
                        // $('#HN_PublicShare_cancelShear').click();
                        // location.reload();
                        // $('.tjBtn').hide();//成功之后不可再修改
                        // tt.showSharePop();
                        $('.shareMask ,.sharePop').show()
                    } else {
                        alert(data.info);
                    }
                },
                error: function () {
                    showErrAlert(langData['siteConfig'][6][203]);


                }
            });

        }
        $.ajax({
            url: '/include/ajax.php?service=info&action=shareInfo&id=' + detail_id,
            type: "POST",
            dataType: "json",
            success: function (data) {
                if (data && data.state == 100) {
                    // location.reload();
                    // $('.tjBtn').hide();//成功之后不可再修改
                    // tt.showSharePop();
                    console.log('分享成功')
                } else {
                    // showErrAlert(data.info);
                }
            },
            error: function () {
                // showErrAlert(langData['siteConfig'][6][203]);


            }
        });
    })

    $('.video_icon').bind('click', function () {
        $('.popupVideo').show();
        $(".popupVideo video")[0].play();
    });
    $('.popupVideo .close').bind('click', function () {
        $('.popupVideo').hide();
        $(".popupVideo video")[0].pause();
    });

    //相册图片放大
    $('.img_list').viewer({
        url: 'data-original',
    });
    // 信息举报
    var complain = null;
    $(".report").bind("click", function () {

        var domainUrl = masterDomain;
        complain = $.dialog({
            fixed: true,
            title: "信息举报",
            content: 'url:' + domainUrl + '/complain-info-detail-' + id + '.html',
            width: 460,
            height: 300
        });
    });

    //收藏
    $(".store-btn").bind("click", function () {
        var t = $(this), type = "add", oper = "+1", txt = "已收藏";

        var userid = $.cookie(cookiePre + "login_user");
        if (userid == null || userid == "") {
            huoniao.login();
            return false;
        }

        if (!t.hasClass("curr")) {
            t.addClass("curr");
            t.find('s').addClass('niceIn');
            setTimeout(function () {
                t.find('s').removeClass('niceIn');
            }, 1200)
        } else {
            type = "del";
            t.removeClass("curr");
            oper = "-1";
            txt = "收藏";
        }

        // var $i = $("<b>").text(oper);
        var x = t.offset().left, y = t.offset().top;
        // $i.css({top: y - 10, left: x + 17, position: "absolute", "z-index": "10000", color: "#E94F06"});
        // $("body").append($i);
        // $i.animate({top: y - 50, opacity: 0, "font-size": "2em"}, 800, function(){
        //     $i.remove();
        // });

        t.find('span').text(txt);

        $.post("/include/ajax.php?service=member&action=collect&module=info&temp=detail&type=" + type + "&id=" + id);

    });
    /**
     * 文本框根据输入内容自适应高度
     * @param                {HTMLElement}        输入框元素
     * @param                {Number}                设置光标与输入框保持的距离(默认0)
     * @param                {Number}                设置最大高度(可选)
     */
    var autoTextarea = function (elem, extra, maxHeight) {
        extra = extra || 0;
        var isFirefox = !!document.getBoxObjectFor || 'mozInnerScreenX' in window,
            isOpera = !!window.opera && !!window.opera.toString().indexOf('Opera'),
            addEvent = function (type, callback) {
                elem.addEventListener ?
                    elem.addEventListener(type, callback, false) :
                    elem.attachEvent('on' + type, callback);
            },
            getStyle = elem.currentStyle ? function (name) {
                var val = elem.currentStyle[name];

                if (name === 'height' && val.search(/px/i) !== 1) {
                    var rect = elem.getBoundingClientRect();
                    return rect.bottom - rect.top -
                        parseFloat(getStyle('paddingTop')) -
                        parseFloat(getStyle('paddingBottom')) + 'px';
                };

                return val;
            } : function (name) {
                return getComputedStyle(elem, null)[name];
            },
            minHeight = parseFloat(getStyle('height'));


        elem.style.resize = 'none';

        var change = function () {
            var scrollTop, height,
                padding = 0,
                style = elem.style;

            if (elem._length === elem.value.length) return;
            elem._length = elem.value.length;

            if (!isFirefox && !isOpera) {
                padding = parseInt(getStyle('paddingTop')) + parseInt(getStyle('paddingBottom'));
            };
            scrollTop = document.body.scrollTop || document.documentElement.scrollTop;

            elem.style.height = minHeight + 'px';
            if (elem.scrollHeight > minHeight) {
                if (maxHeight && elem.scrollHeight > maxHeight) {
                    height = maxHeight - padding;
                    style.overflowY = 'auto';
                } else {
                    height = elem.scrollHeight - padding;
                    style.overflowY = 'hidden';
                };
                style.height = height + extra + 'px';
                scrollTop += parseInt(style.height) - elem.currHeight;
                document.body.scrollTop = scrollTop;
                document.documentElement.scrollTop = scrollTop;
                elem.currHeight = parseInt(style.height);
            };
        };

        addEvent('propertychange', change);
        addEvent('input', change);
        addEvent('focus', change);
        change();
    };
    var text = document.getElementById("textarea");
    autoTextarea(text);// 调用


    // 导航栏置顶
    var Ggoffset = $('.list-lead').offset().top - 140;
    $(window).bind("scroll", function () {
        var d = $(document).scrollTop();
        if (Ggoffset < d) {
            $('.list-lead,.rightCon').addClass('fixed');
            //var leftOff = $(".list-lead").offset().left + $(".list-lead").width() + 10
            // $('.rightCon').css({
            //   'left':leftOff+'px'
            // })
            //  console.log($(".list-lead").offset().left,$(".list-lead").width())
        } else {
            $('.list-lead,.rightCon').removeClass('fixed');
        }
    });

    var isClick = 0;
    //左侧导航点击
    $(".list-lead a").bind("click", function () {
        isClick = 1; //关闭滚动监听
        var t = $(this), parent = t.parent(), index = parent.index(), theadTop = $(".con-tit:eq(" + index + ")").offset().top - 200;
        parent.addClass("current").siblings("li").removeClass("current");
        $('html, body').animate({
            scrollTop: theadTop
        }, 300, function () {
            isClick = 0; //开启滚动监听
        });
    });
    //滚动监听
    $(window).scroll(function () {
        if (isClick) return false;
        var scroH = $(this).scrollTop();
        var theadLength = $(".con-tit").length;
        $(".list-lead li").removeClass("current");

        $(".con-tit").each(function (index, element) {
            var offsetTop = $(this).offset().top;
            if (index != theadLength - 1) {
                var offsetNextTop = $(".con-tit:eq(" + (index + 1) + ")").offset().top - 260;
                if (scroH < offsetNextTop) {
                    $(".list-lead li:eq(" + index + ")").addClass("current");
                    return false;
                }
            } else {
                $(".list-lead li:last").addClass("current");
                return false;
            }
        });
    });
    $(".fb_time em").text(returnHumanTime(fbTime, 1))
    function returnHumanTime(t, type) {
        var n = new Date().getTime() / 1000;
        var c = n - t;
        var str = '';
        if (c < 60) {
            str = '刚刚';
        } else if (c < 3600) {
            str = parseInt(c / 60) + '分钟前';
        } else if (c < 86400) {
            str = parseInt(c / 3600) + '小时前';
        } else if (c < 604800) {
            str = parseInt(c / 86400) + '天前';
        } else {
            str = transTimes(t, type);
        }
        return str;
    }

    function transTimes(timestamp, n) {
        
        const dateFormatter = huoniao.dateFormatter(timestamp);
        const year = dateFormatter.year;
        const month = dateFormatter.month;
        const day = dateFormatter.day;
        const hour = dateFormatter.hour;
        const minute = dateFormatter.minute;
        const second = dateFormatter.second;
        
        if (n == 1) {
            return (year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second);
        } else if (n == 2) {
            return (year + '-' + month + '-' + day);
        } else if (n == 3) {
            return (month + '-' + day);
        } else {
            return 0;
        }
    }


    //发表评论
    var rid = 0, uid = 0; uname = "";
    $("#rtj").bind("click", function () {
        var t = $(this), content = $(".writ textarea");
        rid = 0;
        sendReply(t, content);
    });

    var businessUrl = $("#replyList").data("url");

    function sendReply(t, content) {
        var userid = $.cookie(cookiePre + "login_user");
        if (userid == null || userid == "") {
            huoniao.login();
            return false;
        }

        var url, data;
        if (rid == 0) {
            url = '/include/ajax.php?service=member&action=sendComment&type=info-detail&&check=1';
            data = "aid=" + id + "&content=" + encodeURIComponent(content.val())
        } else {
            replyid = t.parents('li').attr('data-id')
            url = '/include/ajax.php?service=member&action=replyCommenton&check=1';
            data = "id=" + replyid + "&content=" + encodeURIComponent(content.val())

        }
        if (!t.hasClass("disabled") && $.trim(content.val()) != "") {
            t.addClass("disabled");

            $.ajax({
                url: url,
                data: data,
                type: "POST",
                dataType: "jsonp",
                success: function (data) {
                    if (data && data.state == 100) {

                        var info = data.info;
                        content.val("");

                        //一级评论
                        if (rid == 0) {
                            if ($("#replyList ul").size() == 0) {
                                $("#replyList").html('<ul></ul>');
                            }
                            //                          $("#replyList ul").prepend('<li data-id="'+info.aid+'" data-uid="'+info.id+'" data-name="'+info.nickname+'"><p><a href="'+(businessUrl.replace("%id", info.id))+'" target="_blank"><img onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';" src="'+info.photo+'"></a></p><div class="wr-name"><span><a href="'+(businessUrl.replace("%id", info.id))+'" target="_blank">'+info.nickname+'</a>：</span><div class="wr-da"><em>'+info.pubdate+'</em><b><a href="javascript:;">回复</a></b></div></div><div class="wr-txt">'+info.content+'</div></li>');
                            $("#replyList ul").prepend('<li data-id="' + info.id + '" data-uid="' + info.userinfo.userid + '" data-name="' + info.userinfo.nickname + '"><p><a href="' + (businessUrl.replace("%id", info.id)) + '" target="_blank"><img onerror="javascript:this.src=\'' + staticPath + 'images/noPhoto_100.jpg\';" src="' + info.userinfo.photo + '"></a></p><div class="wr-name"><span><a href="' + (businessUrl.replace("%id", info.id)) + '" target="_blank">' + info.userinfo.nickname + '</a>：</span><div class="wr-da"><em>' + info.ftime + (info.iphome ? ' · ' + info.iphome : '') + '</em><b><a href="javascript:;">回复</a></b></div></div><div class="wr-txt">' + info.content + '</div></li>');

                            //子级评论
                        } else {
                            var par = t.closest("li");
                            t.closest(".writ-reply").remove();
                            par.after('<li class="writ-repeat" data-id="' + info.id + '" data-uid="' + info.userinfo.userid + '" data-name="' + info.userinfo.nickname + '"><p><a href="' + (businessUrl.replace("%id", info.userinfo.id)) + '" target="_blank"><img onerror="javascript:this.src=\'' + staticPath + 'images/noPhoto_100.jpg\';" src="' + info.userinfo.photo + '"></a></p><div class="wr-name"><span><a href="' + (businessUrl.replace("%id", info.userinfo.id)) + '" target="_blank">' + info.userinfo.nickname + '</a>&nbsp;回复&nbsp;<a href="' + (businessUrl.replace("%id", uid)) + '" target="_blank">' + uname + '</a>：</span><div class="wr-da"><em>' + info.ftime + (info.iphome ? ' · ' + info.iphome : '') + '</em><b><a href="javascript:;">回复</a></b></div></div><div class="wr-txt">' + info.content + '</div></li>');
                        }


                        t.removeClass("disabled");

                    } else {
                        alert(data.info);
                        t.removeClass("disabled");
                    }
                },
                error: function () {
                    alert("网络错误，发表失败，请稍候重试！");
                    t.removeClass("disabled");
                }
            });
        }
    }


    //获取评论
    var atpage = 1;
    function getReplyList() {
        $.ajax({

            url: "/include/ajax.php?service=member&action=getComment&type=info-detail&son=1&orderby=time&aid=" + id + "&page=" + atpage + "&pageSize=5",
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if (data && data.state == 100) {
                    var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
                    for (var i = 0; i < list.length; i++) {
                        var src = staticPath + 'images/noPhoto_100.jpg';
                        if (list[i].user.photo) {
                            src = huoniao.changeFileSize(list[i].user.photo, "middle");
                        }
                        html.push('<li data-id="' + list[i].id + '" data-uid="' + list[i].user.userid + '" data-name="' + list[i].user.nickname + '"><p><a href="' + (businessUrl.replace("%id", list[i].user.userid)) + '" target="_blank"><img onerror="javascript:this.src=\'' + staticPath + 'images/noPhoto_100.jpg\';" src="' + src + '" /></a></p><div class="wr-name"><span><a href="' + (businessUrl.replace("%id", list[i].user.userid)) + '" target="_blank">' + list[i].user.nickname + '</a>：</span><div class="wr-da"><em>' + list[i].ftime + (list[i].iphome ? ' · ' + list[i].iphome : '') + '</em><b><a href="javascript:;">回复</a></b></div></div><div class="wr-txt">' + list[i].content + '</div></li>');

                        if (list[i].lower.list != null) {
                            html.push(getLowerReply(list[i].lower.list, list[i].user));
                        }
                    }

                    if ($("#replyList ul").size() == 0) {
                        $("#replyList").html('<ul>' + html.join("") + '</ul>');
                    } else {
                        $("#replyList ul").append(html.join(""));
                    }

                    if (atpage < pageInfo.totalPage) {
                        $("#replyList").append('<div class="more"><a href="javascript:;"><span>展开更多评论</span></a></div>');
                    }
                } else {
                    if (atpage == 1) {
                        $("#replyList").html('<div class="loading">暂无评论！</div>');
                    }
                }
            }
        });
    }

    //评论子级
    function getLowerReply(arr, member) {
        if (arr) {
            var html = [];
            for (var i = 0; i < arr.length; i++) {
                var src = staticPath + 'images/noPhoto_100.jpg';
                if (arr[i].user.photo) {
                    src = huoniao.changeFileSize(arr[i].user.photo, "middle");
                }
                html.push('<li class="writ-repeat" data-id="' + arr[i].id + '" data-uid="' + arr[i].user.uid + '" data-name="' + arr[i].user.nickname + '"><p><a href="' + (businessUrl.replace("%id", arr[i].user.userid)) + '" target="_blank"><img onerror="javascript:this.src=\'' + staticPath + 'images/noPhoto_100.jpg\';" src="' + src + '" /></a></p><div class="wr-name"><span><a href="' + (businessUrl.replace("%id", arr[i].user.userid)) + '" target="_blank">' + arr[i].user.nickname + '</a>&nbsp;回复&nbsp;<a href="' + (businessUrl.replace("%id", member.userid)) + '" target="_blank">' + member.nickname + '</a>：</span><div class="wr-da"><em>' + arr[i].ftime + (arr[i].iphome ? ' · ' + arr[i].iphome : '') + '</em><b><a href="javascript:;">回复</a></b></div></div><div class="wr-txt">' + arr[i].content + '</div></li>');

                if (arr[i].lower != null) {
                    html.push(getLowerReply(arr[i].lower.list, arr[i].user));

                }
            }
            return html.join("");
        }
    }

    //加载评论
    getReplyList();


    //加载更多评论
    $("#replyList").delegate(".more", "click", function () {
        atpage++;
        $(this).remove();
        getReplyList();
    });

    //回复评论
    $("#replyList").delegate(".wr-da b a", "click", function () {
        var t = $(this), li = t.closest("li");
        rid = li.attr("data-id");
        uid = li.attr("data-uid");
        uname = li.attr("data-name");
        if (li.find(".writ-reply").size() == 0) {
            $("#replyList .writ-reply").remove();
            li.append('<div class="writ-reply"><textarea placeholder="回复' + uname + '：" autoHeight="true"></textarea><button>回复</button></div>');
        }
    });

    //提交回复
    $("#replyList").delegate(".writ-reply button", "click", function () {
        var t = $(this), content = t.prev("textarea");
        sendReply(t, content);
    });
    $.fn.autoHeight = function () {
        function autoHeight(elem) {
            elem.style.height = 'auto';
            elem.scrollTop = 0; //防抖动
            elem.style.height = elem.scrollHeight + 'px';
        }
        this.each(function () {
            autoHeight(this);
            $(this).on('keyup', function () {
                autoHeight(this);
            });
        });
    }
    $('textarea[autoHeight]').autoHeight();

    // 红包弹出
    $(".btn_hb").click(function () {
        $('html').addClass('noscroll')
        $(".hbMask").show();
        $(".hbPop").show()
    });

    // 关闭红包弹窗
    $(".close_hbpop").click(function (event) {
        /* Act on the event */
        $('html').removeClass('noscroll')
        $(".hbMask").hide();
        $(".hbPop").hide()
    });
    $(".hbQrBox .Qr").qrcode({
        render: window.applicationCache ? "canvas" : "table",
        width: 140,
        height: 140,
        text: toUtf8(window.location.href)
    });

    function toUtf8(str) {
        var out, i, len, c;
        out = "";
        len = str.length;
        for (i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            if ((c >= 0x0001) && (c <= 0x007F)) {
                out += str.charAt(i);
            } else if (c > 0x07FF) {
                out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
                out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            } else {
                out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            }
        }
        return out;
    }
})
