function formatDate(date) {
    var date = new Date(date);
    var YY = date.getFullYear() + '-';
    var MM = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var DD = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate());
    var hh = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    var mm = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    var ss = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
    return YY + MM + DD + " " + hh + mm + ss;
}
function dateFtt(fmt, d) { //author: meizz   
    date = new Date(d);
    var o = {
        "M+": date.getMonth() + 1,                 //月份   
        "d+": date.getDate(),                    //日   
        "h+": date.getHours(),                   //小时   
        "m+": date.getMinutes(),                 //分   
        "s+": date.getSeconds(),                 //秒   
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度   
        "S": date.getMilliseconds()             //毫秒   
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

//弹出消息提醒 
function openMsg(msg, type) {
    let icon = 6;
    if (type < 0) {//失败提醒
        icon = 5;
    }
    layer.msg(msg, { icon: icon });
}
//千分符
function format(num) {
    return (num.toFixed(2) + '').replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,');
}
//弹出消息提醒 
//msg 消息内容
//type -1 失败消息 其他 成功
//title 提醒头
function openMsg1(msg, type, title) {
    title = title || "提示";
    let content = '<div class="deliver-success"><span class="iconfont icon-wancheng"></span><span class="text">' + msg + '</span></div>';
    if (type == -1) {//失败提醒
        content = '<div class="deliver-error"><span class="iconfont icon-quxiao"></span><span class="text">' + msg + '</span></div>';
    }
    layer.open({
        title: title,
        shadeClose: true,
        skin: 'crm-layer-deliver',
        content: content,
        btn: false,
    })
}

//弹出询问窗口 
//content 询问内容
//func 点确定的回调方法 参数 index 弹出层的index 用于操作完成 关闭该层
//title 提醒头 默认 提示
function openConfirm(content, func, title) {
    title = title || "提示";
    layer.confirm(content, { icon: 3, title: title }, function (index) {
        //do something
        func(index);
    });
}

//ajax
function ajax($, type, url, param, succ, fail,async = true) {
    $.ajax({
        type: type,
        url: url,
        data: param,
        dataType: "json",
        async: async,
        timeout: 15000, //超时设置，15秒钟
        success: function (res) {
            if (typeof (succ) == "function") {
                return succ(res);
            } else {
                console.log(res)
            }
        },
        error: function (res) {
            if (typeof (fail) == "function") {
                return fail(res);
            } else {
                console.log(res)
            }
        },
        complete: function (XMLHttpRequest, status) {
            if (status == 'timeout') {
                console.log('请求超时')
            }
        }
    })
}
//ajax
function ajaxAsync($, type, url, param, succ, fail) {
    $.ajax({
        type: type,
        url: url,
        data: param,
        async: true,
        dataType: "json",
        timeout: 15000, //超时设置，15秒钟
        success: function (res) {
            if (typeof (succ) == "function") {
                return succ(res);
            } else {
                console.log(res)
            }
        },
        error: function (res) {
            if (typeof (fail) == "function") {
                return fail(res);
            } else {
                console.log(res)
            }
        },
        complete: function (XMLHttpRequest, status) {
            if (status == 'timeout') {
                console.log('请求超时')
            }
        }
    })
}

//计算时间
function getDateDiff(dateTimeStamp) {
    var minute = 1000 * 60;
    var hour = minute * 60;
    var day = hour * 24;
    var halfamonth = day * 15;
    var month = day * 30;
    var now = new Date().getTime();
    var diffValue = now - dateTimeStamp;
    if (diffValue < 0) { return; }
    var monthC = diffValue / month;
    var weekC = diffValue / (7 * day);
    var dayC = diffValue / day;
    var hourC = diffValue / hour;
    var minC = diffValue / minute;
    if (monthC >= 1) {
        result = "" + parseInt(monthC) + "月前";
    }
    else if (weekC >= 1) {
        result = "" + parseInt(weekC) + "周前";
    }
    else if (dayC >= 1) {
        result = "" + parseInt(dayC) + "天前";
    }
    else if (hourC >= 1) {
        result = "" + parseInt(hourC) + "小时前";
    }
    else if (minC >= 1) {
        result = "" + parseInt(minC) + "分钟前";
    } else
        result = "刚刚";
    return result;
}


//计算时间two
function getDateDiff2(dateTimeStamp) {
    var minute = 1000 * 60;
    var hour = minute * 60;
    var day = hour * 24;
    var now = new Date().getTime();
    var diffValue = now - FormatJsonDate(dateTimeStamp);
    if (diffValue < 0) { return; }
    var dayC = diffValue / day;
    if (dayC >= 1) {
        result = "" + parseInt(dayC) + "天";
    }
    else
        result = parseInt(dayC * 24) + "小时";
    return result;
}

//json格式时间转换 js /Date(1550273700000)/ 格式转换
function FormatJsonDate(jsonStr) {
    var tmp = "";
    if (jsonStr == null || jsonStr == '')
        return '';
    if (jsonStr != null || jsonStr != undefined)
        tmp = jsonStr.toString();
    //如果jsonStr的长度是10位的，则将其转换成13位
    if (tmp.length == 10) {
        tmp = tmp + '000';
    }
    var seconds = tmp.replace(/\/Date\(/, "").replace(/\)\//, "");

    return new Date(parseInt(seconds));
    //return now.asString("yyyy-mm-dd hh:ii:ss");
};
//格式化时间
function GetFormatDate(jsonStr, type) {
    type = type || 1;
    var date = new Date(FormatJsonDate(jsonStr));
    if (type == 1) {
        return date.getFullYear() + "-" + num(date.getMonth() + 1) + "-" + num(date.getDate());
    } else if (type == 2) {
        return date.getFullYear() + "-" + num(date.getMonth() + 1) + "-" + num(date.getDate()) + " " + num(date.getHours()) + ":" + num(date.getMinutes());
    } else if (type == 3) {
        return date.getFullYear() + "-" + num(date.getMonth() + 1) + "-" + num(date.getDate()) + " " + num(date.getHours()) + ":" + num(date.getMinutes()) + ":" + num(date.getSeconds());
    }

}

function num(s) {
    return s < 10 ? '0' + s : s;
}


/**
* 将秒转换为 分:秒
* s int 秒数
*/
function s_to_hs(s,type) {
    //计算分钟
    //算法：将秒数除以60，然后下舍入，既得到分钟数
    var h;
    h = Math.floor(s / 60);
    //计算秒
    //算法：取得秒%60的余数，既得到秒数
    s = s % 60;
    //将变量转换为字符串
    h += '';
    s += '';
    //如果只有一位数，前面增加一个0
    h = (h.length == 1) ? '0' + h : h;
    s = (s.length == 1) ? '0' + s : s;
    if (type == 1) {
        return h+'H'+s+'m'
    }
    return h + ':' + s;
}

//监听F5，只刷新当前页面
function _attachEvent(obj, evt, func, eventobj) {
    eventobj = !eventobj ? obj : eventobj;
    if (obj.addEventListener) {
        obj.addEventListener(evt, func, false);
    } else if (eventobj.attachEvent) {
        obj.attachEvent('on' + evt, func);
    }
}

var ISFRAME = 1;
if (ISFRAME) {
    try {
        _attachEvent(document.documentElement, 'keydown', parent.resetEscAndF5);
    } catch (e) {
    }
}