
var  ctype = "";
var keywords = '';
$(function () {
//头部导航切换
    $("#myTab li").click(function (){
        // console.log(111)
        var index = $(this).index(), type = $(this).find('a').attr("data-type");
        if (!$(this).hasClass("active")) {
            $(this).addClass("active").siblings('li').removeClass('active')
            $(".qswrap .item").addClass('fn-hide');
            $(".qswrap .item:eq(" + index + ")").removeClass('fn-hide');
            if (index != 0) {
                ctype = type;
                var oobj = "list";

                if ($("#" + oobj).find("tbody").html() == "") {
                    getList();
                }
            }
        }
    })

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
    
    // $(".config-nav button").bind("click", function () {
    //     var index = $(this).index(), type = $(this).attr("data-type");
    //     if (!$(this).hasClass("active")) {
    //         $(".item").hide();
    //         $(".item:eq(" + index + ")").fadeIn();
    //         if (index != 0) {
    //             ctype = type;
    //             var oobj = "list";
    //             if (ctype == "couriermoney") {
    //                 oobj = "list_";
    //             }
    //             if (ctype == "invite") {
    //                 oobj = "list_1";
    //             }
    //             if (ctype == "bonus") {
    //                 oobj = "list_2";
    //             }
    //             if ($("#" + oobj).find("tbody").html() == "") {
    //                 getList();
    //             }
    //         }
    //     }
    // });
    //全选、不选
    $("#selectBtn a").bind("click", function(){
        var id = $(this).attr("data-id");
        if(id == 1){
            $("#selectBtn .check").addClass("checked");
            $("#list tr").removeClass("selected").addClass("selected");

        }else{
            $("#selectBtn .check").removeClass("checked");
            $("#list tr").removeClass("selected");
        }
    });
})
if ($(".choseCity").length){
    huoniao.choseCity($(".choseCity"),$("#cityid"),$("#search_form"));  //城市分站选择初始化
}


//表单提交
function checkFrom(form){

    var form = $("#shop-form"), action = form.attr("action"), data = form.serialize();
    var btn = $("#submitBtn");
    btn.attr("disabled", true);

    $.ajax({
        url: action,
        type: "post",
        data: data + '&submit=保存',
        dataType: "json",
        success: function(res){
            if(res.state == 100){
                $.dialog({
					title: '提醒',
					icon: 'success.png',
					content: '保存成功！',
					ok: function(){
                        window.scroll(0, 0);
                        location.reload();
					}
				});
            }else{
                $.dialog.alert(res.info);
                btn.attr("disabled", false);
            }
        },
        error: function(){
            $.dialog.alert("网络错误，保存失败！");
            btn.attr("disabled", false);
        }
    })

    return false;

}

//填充城市列表
huoniao.buildAdminList($("#cityid"), cityList, '请选择分站', cityid);
$(".chosen-select").chosen();


var  init = {
    //选中样式切换
    //选中样式切换
    funTrStyle: function(){
        // var list = ctype == "money" ? "list" : "list_",
        // 	selectBtn = ctype == "money" ? "selectBtn" : "selectBtn_";
        var list =" ",
            selectBtn =" ";



            list = "list"
            pageInfo = "pageInfo";
            selectBtn = "selectBtn"
            loading  = "loading"
            pageBtn   = "pageBtn"

        var trLength = $("#"+list+" tbody tr").length, checkLength = $("#"+list+" tbody tr.selected").length;
        if(trLength == checkLength){
            $("#"+selectBtn+" .check").removeClass("checked").addClass("checked");
        }else{
            $("#"+selectBtn+" .check").removeClass("checked");
        }
    }
    ,del: function(type){
    var list = "list"
        selectBtn = "selectBtn"
    var checked = $("#"+list+" tbody tr.selected");
    console.log(checked);
    if(checked.length < 1 && type == ""){
        huoniao.showTip("warning", "未选中任何信息！", "auto");
    }else{
        huoniao.showTip("loading", "正在操作，请稍候...");
        var id = [];
        for(var i = 0; i < checked.length; i++){
            id.push($("#"+list+" tbody tr.selected:eq("+i+")").attr("data-id"));
        }

        var action = type == "all" ? "clear" : "";
        huoniao.operaJson("waimaiCourierAdd.php?dopost=delAmount", "peisongid="+$("#id").val()+"&action="+action+"&id="+id, function(data){
            huoniao.hideTip();
            if(data.state == 100){
                huoniao.showTip("success", "操作成功！", "auto");
                $("#"+selectBtn+" a:eq(1)").click();
                setTimeout(getList, 2000);
            }else if(data.state == 101){
                $.dialog.alert(data.info);
            }else{
                var info = [];
                for(var i = 0; i < $("#"+list+" tbody tr").length; i++){
                    var tr = $("#"+list+" tbody tr:eq("+i+")");
                    for(var k = 0; k < data.info.length; k++){
                        if(data.info[k] == tr.attr("data-id")){
                            info.push("▪ "+tr.find("td:eq(3)").text());
                        }
                    }
                }
                $.dialog.alert("<div class='errInfo'><strong>以下信息删除失败：</strong><br />" + info.join("<br />") + '</div>', function(){
                    getList();
                });
            }
        });
        $("#"+selectBtn+" a:eq(1)").click();
    }
}
};
//获取列表
function getList(){
    huoniao.showTip("loading", "正在操作，请稍候...");
    var  list = '';
    // var list = ctype == "money" ? "list" : (ctype == "point" ? "list_" : "list_1"),

    // pageInfo = ctype == "money" ? "pageInfo" : (ctype == "point" ? "pageInfo_" : "pageInfo_1"),
    // selectBtn = ctype == "money" ? "selectBtn" : (ctype == "point" ? "selectBtn_" : "selectBtn_1"),
    // loading = ctype == "money" ? "loading" : (ctype == "point" ? "loading_" : "loading_1"),
    // pageBtn = ctype == "money" ? "pageBtn" : (ctype == "point" ? "pageBtn_" : "pageBtn_1");

 if(ctype == "couriermoney"){
        list = "list"
        pageInfo = "pageInfo";
        selectBtn = "selectBtn"
        loading  = "loading"
        pageBtn   = "pageBtn"
    }

    $("#"+list+" table, #"+pageInfo).hide();
    $("#"+selectBtn+" a:eq(1)").click();
    $("#"+loading).html("加载中，请稍候...").show();

    var page = $("#"+list).attr("data-atpage") ? $("#"+list).attr("data-atpage") : "1";
    var sKeyword ="";
    // if(ctype == 'money'){
    //     sKeyword = encodeURIComponent($("#sKeyword").html());
    // }else if(ctype == 'point'){
    //     sKeyword = encodeURIComponent($("#pointsKeyword").html())
    // }else{
      sKeyword = encodeURIComponent($("#sKeyword").html());
    //     console.log(sKeyword);
    // }

    filtertype    = $("#filtertype").html();


    var data = [];
    data.push("search="+sKeyword);
    data.push("pay="+filtertype);
    data.push("type="+ctype);
    data.push("userid="+$("#id").val());
    data.push("pagestep=20");
    data.push("keywords=" + keywords);
    data.push("page="+page);
    data.push("id="+id);
    huoniao.operaJson("waimaiCourierAdd.php?dopost=amountList", data.join("&"), function(val){
        var obj = $("#"+list), listArr = [], i = 0, memberList = val.memberList;
        if(ctype == 'couriermoney'){
            $(".totalCount").html(val.pageInfo.totalCount);
            $(".allIncourier").html(val.pageInfo.countPrice);
            $(".allOutcourier").html(val.pageInfo.countPayPrice);
            $(".alltixiancourier").html(val.pageInfo.countTiPrice);
            $("#totalIncourier").html(val.pageInfo.totalPrice);
            $("#totalOutcourier").html(val.pageInfo.totalPayPrice);
            $("#totaltixiancourier").html(val.pageInfo.totalTiPrice);
            $("#totalMoney").html(val.pageInfo.money);
        }
        if(val.state !="200"){
            $("#totalMoney").html(val.pageInfo.money);
        }
        if(val.state == "100"){
            obj.attr("data-totalpage", val.pageInfo.totalPage);

            huoniao.hideTip();

            for(i; i < memberList.length; i++){
                listArr.push('<tr data-id="'+memberList[i].id+'">');

                if(ctype != 'invite'){
                    listArr.push('  <td class="row3"><span class="check"></span></td>');
                    var type = '<span class="text-success">收入</span>';
                    if(memberList[i].type == 0 && memberList[i].cattype==0){
                        type = '<span class="text-error">支出</span>';
                    }else if(memberList[i].type == 0 && memberList[i].cattype==1){
                        type = '<span class="text-error">提现</span>';
                    }
                    listArr.push('  <td class="row15 left">'+type+'</td>');
                    listArr.push('  <td class="row15 left">'+memberList[i].amount+'</td>');
                    listArr.push('  <td class="row15 left">'+memberList[i].balance+'</td>');
                    listArr.push('  <td class="row25 left">'+memberList[i].info+'</td>');
                    listArr.push('  <td class="row20 left">'+memberList[i].date+'</td>');
                    listArr.push('  <td class="row7"><a href="javascript:;" class="del" title="删除记录">删除</a></td>');
                    listArr.push('</tr>');
                }else{
                    listArr.push('  <td class="row3">&nbsp;</td>');
                    listArr.push('  <td class="row20 left">'+memberList[i].nickname+'</td>');
                    listArr.push('  <td class="row17 left">'+memberList[i].phone+'</td>');
                    listArr.push('  <td class="row20 left">'+memberList[i].regtime+'</td>');
                    listArr.push('  <td class="row40 left">'+memberList[i].money+'</td>');
                    listArr.push('</tr>');
                }

            }

            obj.find("tbody").html(listArr.join(""));
            $("#"+loading).hide();
            $("#"+list+" table").show();
            huoniao.showPageInfo(list, pageInfo);
        }else{
            huoniao.showPageInfo(list, pageInfo);

            obj.find("tbody").html("");
            huoniao.showTip("warning", val.info, "auto");
            $("#"+loading).html(val.info).show();
        }
    });

};
// 判断时间
function judgeTime(time){
    var strtime = time.replace(/-/g, "/");//时间转换
    var endtime = "2021-07-13 00:00:00".replace(/-/g, "/");//时间转换
    //时间
    var date1=new Date(strtime);
    //现在时间
    var date2=new Date(endtime);
    //判断时间是否过期
    return date1>date2?true:false;
}

//余额、积分回车提交
$("input[name='operaCourier'],input[name='keywords']").keyup(function (e) {
    if (!e) {
        var e = window.event;
    }
    if (e.keyCode) {
        code = e.keyCode;
    }
    else if (e.which) {
        code = e.which;
    }
    if (code === 13) {
        $(this).closest("dl").find(".btn").click();
    }
});

//筛选收入 支出
$("#stateBtn a,#stateBtn_ a").bind("click", function(){
    var id = $(this).attr("data-id"), title = $(this).html(), obj = $(this).parent().parent().parent();
    $('#filtertype').html($(this).attr("data-id"));
    $("#list").attr("data-atpage", 1);
    obj.find("button").html(title+'<span class="caret"></span>');
    getList();


});




//帐户余额操作
$("#operaCourier").bind("click", function(){
    var type = $("input[name=courierOpera]:checked").val(),
        amount = $("input[name=operaCourier]").val(),
        operaCourierInfo = $("input[name=operaCourierInfo]").val();
    if(!/^[1-9]\d*$/.test(amount)){
        huoniao.showTip("error", "请输入正确的金额！", "auto");
    }
    if($.trim(operaCourierInfo) == ""){
        huoniao.showTip("error", "请输入操作原因！", "auto");
    }
    var data = [];
    data.push("action=courier");
    data.push("userid="+$("#id").val());
    data.push("type="+type);
    data.push("amount="+amount);
    data.push("info="+operaCourierInfo);
    data.push("id="+id);
    huoniao.showTip("loading", "正在操作，请稍候...");
    huoniao.operaJson("waimaiCourierAdd.php?dopost=operaAmount", data.join("&"), function(val){
        if(val.state == "100"){
            huoniao.showTip("success", "操作成功！", "auto");
            $("input[name=operaCourier], input[name=operaCourierInfo]").val("");
            $("#courierObj").html(val.money.toFixed(2));
            setTimeout(function(){
                getList();
            }, 1000);
        }else{
            huoniao.showTip("error", val.info, "auto");
        }
    });
});


//余额搜索
$("#searchBtn").bind("click", function(){
    $("#sKeyword").html($("#keyword").val());
    $("#list").attr("data-atpage", 1);
    getList();
});

//余额搜索回车提交
$("#keyword").keyup(function (e) {
    if (!e) {
        var e = window.event;
    }
    if (e.keyCode) {
        code = e.keyCode;
    }
    else if (e.which) {
        code = e.which;
    }
    if (code === 13) {
        $("#searchBtn").click();
    }
});


// 余额导出
$("#export").click(function(e){
    // e.preventDefault();
    var sKeyword = $("#keyword").val(),
        cityid = $("#cityid").val(),
        filtertype = $("#filtertype").html();
    var data = [];
    data.push("search="+sKeyword);
    data.push("cityid="+cityid);
    data.push("pay="+filtertype);
    data.push("userid="+$("#id").val());
    data.push("pagestep=200000");
    data.push("page=1");
    data.push("id="+id);

    $(this).attr('href', 'waimaiCourierAdd.php?dopost=amountList&type=courier&do=export&'+data.join('&'));

})
$("#list tbody").delegate("tr", "click", function(event){
    var isCheck = $(this), checkLength = $("#list_ tbody tr.selected").length;
    if(event.target.className.indexOf("check") > -1) {
        if(isCheck.hasClass("selected")){
            isCheck.removeClass("selected");
        }else{
            isCheck.addClass("selected");
        }
    }else{
        if(checkLength > 1){
            $("#list_ tr").removeClass("selected");
            isCheck.addClass("selected");
        }else{
            if(isCheck.hasClass("selected")){
                isCheck.removeClass("selected");
            }else{
                $("#list_ tr").removeClass("selected");
                isCheck.addClass("selected");
            }
        }
    }

    init.funTrStyle();
});

//删除
$("#delCourier").bind("click", function(){
    $.dialog.confirm('此操作不可恢复，您确定要删除吗？', function(){
        init.del();
    });
});

$("#ClearCourier").bind("click", function(){
    $.dialog.confirm('此操作不可恢复，您确定要删除吗？', function(){
        init.del("all");
    });
});

//单条删除
$("#list").delegate(".del", "click", function(){
    $.dialog.confirm('此操作不可恢复，您确定要删除吗？', function(){
        init.del();
    });
});