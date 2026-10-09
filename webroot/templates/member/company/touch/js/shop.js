var huoniao = {
    operaJson: function (url, action, callback) {
        $.ajax({
            url: url,
            data: action,
            type: "POST",
            dataType: "json",
            success: function (data) {
                typeof callback == "function" && callback(data);
            },
            error: function () {

                $.post("../login.php", "action=checkLogin", function (data) {
                    if (data == "0") {
                        huoniao.showTip("error", langData['siteConfig'][20][262]);//登录超时，请重新登录！
                        setTimeout(function () {
                            location.reload();
                        }, 500);
                    } else {
                        huoniao.showTip("error", langData['siteConfig'][6][203]);//网络错误，请重试！
                    }
                });

            }
        });
    }
}

$(function () {





    //APP端取消下拉刷新
    toggleDragRefresh('off');

    //初始加载分类
    if (!editTypeid) {
        getTypeList(0, 0, 0);
    }
    var loadFlag = 0;//第一次进入页面 并且是编辑；
    var ttcount = 0, parid = 0, ttflag = false;
    if (editTypeid) {
        huoniao.operaJson("/include/ajax.php?service=shop&action=typeParent", "typeid=" + editTypeid, function (data) {
            if (data.state == 100 && data.info) {
                data = data.info;
                ttcount = data.length;
                parid = data[0];
                ttflag = true;
                var sshtml = [];
                sshtml.push('<div class="fchoose" id="choose0"></div>');
                getTypeList(0, 0, 0);
                for (var i = 0; i < data.length - 1; i++) {
                    sshtml.push('<div class="fchoose" id="choose' + data[i] + '"></div>');
                    getTypeList(data[i], i, data[i + 1]);
                }
                $("#tlist").html(sshtml.join(''));

            }else{
                showErrAlert(data.info);
            }
        });
    }

    //点击分类验证是否有子级
    $("#tlist").delegate("li", "click", function () {
        loadFlag = 1;
        var t = $(this), selected = t.attr("class"), typeid_ = t.attr("data-id"), pClass = t.parent().parent().attr("class"), ite = 0, lower = t.attr('data-lower');
        t.closest('.fchoose').nextAll('.fchoose').remove();
        //之前被选中的typeid  
        var chosId = t.closest('.fchoose').find('.selected').attr('data-id');
        if (pClass != undefined && pClass.indexOf("exp") > -1) {
            t.parent().parent().parent().parent().find("li").removeClass("selected");
        } else {
            ite = t.parent().parent().parent().index();
            t.siblings("li").removeClass("selected");
        }
        t.addClass("selected");

        t.closest('.fchoose').find("li").removeClass('spe spee');
        t.prev().addClass('spe');
        t.next().addClass('spee');


        var tindex = t.closest('.fchoose').index();
        if (lower != 'undefined') {//有二级时
            $('.fchoose').removeClass('active');

            t.closest('.fchoose').prev().removeClass().addClass('fchoose leftHide');

            getTypeList(typeid_, ite, 0);
            //头部
            var ttxt = t.text();
            if ($('.typeHead a').eq(tindex + 1).size() > 0) {//头部这个阶级已存在

                $('.typeHead a').removeClass('active');
                $('.typeHead a').eq(tindex + 1).addClass('active').find('span').text(ttxt);

                $('.typeHead a').eq(tindex + 1).attr('data-id', typeid_);
                if (chosId != undefined && chosId != typeid_) {//新选择了分类
                    $('.typeHead a').eq(tindex + 1).nextAll().remove();
                }

            } else {//没有时 则追加
                $('.typeHead a').removeClass('active');
                $('.typeHead').append('<a href="javascript:;" data-level="' + (tindex + 1) + '" data-id="' + (typeid_) + '" class="active"><span>' + ttxt + '</span></a>');

            }

        } else {
            var url = fabuUrl.replace("%typeid%", typeid_);
            if (id != 0) {
                if (url.indexOf("?") > -1) {
                    url += "&id=" + id;
                } else {
                    // url += "?id="+id;
                }
            }
            if (editTypeid) {
                var hasId = $('.typeHead a[data-level="1"]').attr('data-id');
                if (hasId != parid) {
                    var popOptions = {
                        title: '确定更改分类么？',
                        confirmTip: '修改分类后部分已填内容可能会丢失',
                        isShow: true,
                        btnSure: '确定'
                    }
                    confirmPop(popOptions, function () {
                        if (url.indexOf('?') > -1) {
                            location.href = url + "&modAdrr=" + modAdrr;
                        } else {
                            location.href = url + "?modAdrr=" + modAdrr;
                        }

                    })
                } else {
                    location.href = url + "?modAdrr=" + modAdrr;
                }
            } else {
                location.href = url + "?modAdrr=" + modAdrr;
            }

        }

    });

    //点击头部
    var sflag = 0;
    $('.typeHead').delegate('a', 'click', function () {
        var tindex = $(this).index();
        if (!$(this).hasClass('active')) {
            var ssi = $('.typeHead .active').index();
            if (tindex < ssi) {//点了当前前面的分类
                sflag = 1
            } else {
                sflag = 0;
            }

            $(this).addClass('active').siblings('a').removeClass('active');
            if (tindex == 0) {//点击第一个
                $('#choose0').removeClass().addClass('fchoose active');
                $('#choose0').nextAll().removeClass().addClass('fchoose rightHide');
            } else {
                var choseFc = $('.fchoose').eq(tindex - 1);
                if (sflag == 1) {
                    choseFc.removeClass().addClass('fchoose rightShow');
                    choseFc.nextAll().removeClass().addClass('fchoose rightHide');
                    choseFc.next().removeClass().addClass('fchoose active');
                } else {
                    choseFc.removeClass().addClass('fchoose leftShow');
                    choseFc.prevAll().removeClass().addClass('fchoose leftHide');
                    choseFc.next().removeClass().addClass('fchoose active');
                }

            }

        }
    })


    //获取分类列表
    function getTypeList(tid, ite, cid) {
        huoniao.operaJson("/include/ajax.php?service=shop&action=getTypeList", "tid=" + tid, function (data) {
            if (data.state == 100 && data.info) {
                var list = [];
                if (!editTypeid || loadFlag == 1) {
                    list.push('<div class="fchoose active" id="choose' + tid + '">');
                }

                list.push('<ul>');
                //第一级
                if (tid == 0) {
                    for (var i = 0; i < data.info.length; i++) {
                        var parentArr = [], selected = '';

                        if (data.info[i].typeid == parid) {
                            selected = " class='selected'"
                        }
                        list.push('<li data-id="' + data.info[i].typeid + '" data-lower="1"' + selected + '>' + data.info[i].typename + '</li>');

                    }
                } else {
                    for (var i = 0; i < data.info.length; i++) {
                        var lower, selected = "", subnav = data.info[i].subnav;
                        if (data.info[i].id == typeid || data.info[i].id == cid) {
                            selected = " class='selected'"
                        }
                        if (data.info[i].type == 1) {
                            lower = 1;
                        } else {
                            lower = undefined;
                        }
                        list.push('<li data-id="' + data.info[i].id + '"' + selected + ' data-lower="' + lower + '">' + data.info[i].typename + '</li>');

                    }
                }
                list.push('</ul>');
                if (!editTypeid || loadFlag == 1) {
                    list.push('</div>');
                }



                if (!editTypeid || loadFlag == 1) {
                    $("#tlist").find('.fchoose:last-child').addClass('leftFd')
                    $("#tlist").find('.fchoose:first-child').removeClass('leftFd')
                }


                if (editTypeid && loadFlag == 0) {
                    $("#tlist").find('.fchoose[id="choose' + tid + '"]').html(list.join(""))
                } else {
                    $("#tlist").append(list.join(""));
                }


                if (editTypeid && $('.fchoose').length == ttcount && ttflag) {
                    $('.fchoose').removeClass('active');
                    $("#tlist").find('.fchoose:last-child').addClass('active')
                    $("#tlist").find('.fchoose').eq(ttcount - 2).addClass('leftFd');
                    var ssArr = [];
                    $('.fchoose .selected').each(function () {
                        var sid = $(this).attr('data-id'), stxt = $(this).text();
                        ssArr.push({ 'sid': sid, 'stxt': stxt })
                    })
                    var shtml = [];
                    shtml.push('<a href="javascript:;"><span>全部</span></a>');
                    for (var j = 0; j < ssArr.length - 1; j++) {

                        shtml.push('<a href="javascript:;" data-level="' + (j + 1) + '" data-id="' + ssArr[j].sid + '"><span>' + ssArr[j].stxt + '</span></a>');
                    }
                    $('.typeHead').html(shtml.join(''));
                    $('.typeHead a:last-child').addClass('active')
                }


                if (tid == 0 && !editTypeid) {
                    $('#choose0 li:first-child').click();
                }

            }else{
                showErrAlert('没有子分类');
            }
        });
    }

    $('.top .prev').click(function () {
        var active = $('.fchoose.active'), id = active.attr('id');
        if (id != 'choose0') {
            active.removeClass('active').prev().show().addClass('active');
        }
    })

});



// 扩展zepto
$.fn.prevAll = function (selector) {
    var prevEls = [];
    var el = this[0];
    if (!el) return $([]);
    while (el.previousElementSibling) {
        var prev = el.previousElementSibling;
        if (selector) {
            if ($(prev).is(selector)) prevEls.push(prev);
        }
        else prevEls.push(prev);
        el = prev;
    }
    return $(prevEls);
};

$.fn.nextAll = function (selector) {
    var nextEls = [];
    var el = this[0];
    if (!el) return $([]);
    while (el.nextElementSibling) {
        var next = el.nextElementSibling;
        if (selector) {
            if ($(next).is(selector)) nextEls.push(next);
        }
        else nextEls.push(next);
        el = next;
    }
    return $(nextEls);
};
