$(function(){

    jQuery('.chooseDate').datepicker(jQuery.extend({
        showMonthAfterYear: false
    },
    jQuery.datepicker.regional['zh_cn'], {
        'showSecond': true,
        'changeMonth': true,
        'changeYear': true,
        'tabularLevel': null,
        'yearRange': '2013:' + new Date().getFullYear(),
        'minDate': new Date(2013, 1, 1, 00, 00, 00),
        'timeFormat': 'hh:mm:ss',
        'dateFormat': 'yy-mm-dd',
        'timeText': '时间',
        'hourText': '时',
        'minuteText': '分',
        'secondText': '秒',
        'currentText': '当前时间',
        'closeText': '关闭',
        'showOn': 'focus'
    }));

    jQuery('.chooseDateTime').datetimepicker(jQuery.extend({
        showMonthAfterYear: false
    },
    jQuery.datepicker.regional['zh_cn'], {
        'showSecond': true,
        'changeMonth': true,
        'changeYear': true,
        'tabularLevel': null,
        'yearRange': '2013:' + new Date().getFullYear(),
        'minDate': new Date(2013, 1, 1, 00, 00, 00),
        'timeFormat': 'hh:mm:ss',
        'dateFormat': 'yy-mm-dd',
        'timeText': '时间',
        'hourText': '时',
        'minuteText': '分',
        'secondText': '秒',
        'currentText': '当前时间',
        'closeText': '关闭',
        'showOn': 'focus'
    }));

 //填充分站列表
 huoniao.choseCity($(".choseCity"),$("#cityid"));  //城市分站选择初始化

 //查看订单
$(".orderdetail").bind("click", function(event){
    event.preventDefault();
    var href = $(this).attr("href"), id = $(this).data("id"), num = $(this).data("num");
    try {
        event.preventDefault();
        parent.addPage("waimaiOrderDetail"+id, "waimai", "订单"+num, "waimai/"+href);
    } catch(e) {}
});

$(".chosen-select").chosen();
});
