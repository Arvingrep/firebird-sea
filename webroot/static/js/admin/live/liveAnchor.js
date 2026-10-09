var defaultBtn = $("#delBtn, #fullyDelBtn, #addProperty, #delProperty, #moveBtn, #batchAudit"),
    rDefaultBtn = $("#revertBtn, #fullyDelBtn"),
    checkedBtn = $("#stateBtn, #propertyBtn"),
    init = {
        //选中样式切换
        funTrStyle: function () {
            var trLength = $("#list tbody tr").length, checkLength = $("#list tbody tr.selected").length;
            if (trLength == checkLength) {
                $("#selectBtn .check").removeClass("checked").addClass("checked");
            } else {
                $("#selectBtn .check").removeClass("checked");
            }

            var recycle = $("#recycleBtn").attr("data-id") ? $("#recycleBtn").attr("data-id") : "";

            if (checkLength > 0) {
                if (recycle != "") {
                    rDefaultBtn.css('display', 'inline-block');
                } else {
                    defaultBtn.css('display', 'inline-block');
                }
                checkedBtn.hide();
            } else {
                if (recycle != "") {
                    rDefaultBtn.hide();
                } else {
                    defaultBtn.hide();
                }
                checkedBtn.css('display', 'inline-block');
            }
        }

        //菜单递归分类
        , selectTypeList: function () {
            var typeList = [];
            typeList.push('<ul class="dropdown-menu">');
            typeList.push('<li><a href="javascript:;" data-id="">全部分类</a></li>');
            var l = typeListArr.length;
            for (var i = 0; i < l; i++) {
                (function () {
                    var jsonArray = arguments[0], jArray = jsonArray.lower, cl = "";
                    if (jArray.length > 0) {
                        cl = ' class="dropdown-submenu"';
                    }
                    typeList.push('<li' + cl + '><a href="javascript:;" data-id="' + jsonArray["id"] + '">[' + jsonArray["id"] + ']' + jsonArray["typename"] + '</a>');
                    if (jArray.length > 0) {
                        typeList.push('<ul class="dropdown-menu">');
                    }
                    for (var k = 0; k < jArray.length; k++) {
                        if (jArray[k]['lower'] != null) {
                            arguments.callee(jArray[k]);
                        } else {
                            typeList.push('<li><a href="javascript:;" data-id="' + jArray[k]["id"] + '">[' + jsonArray[k]["id"] + ']' + jArray[k]["typename"] + '</a></li>');
                        }
                    }
                    if (jArray.length > 0) {
                        typeList.push('</ul></li>');
                    } else {
                        typeList.push('</li>');
                    }
                })(typeListArr[i]);
            }

            typeList.push('</ul>');
            return typeList.join("");
        }

        //树形递归分类
        , treeTypeList: function () {
            var l = typeListArr.length, typeList = [], cl = "";
            typeList.push('<option value="">选择分类</option>');
            for (var i = 0; i < l; i++) {
                (function () {
                    var jsonArray = arguments[0], jArray = jsonArray.lower;
                    typeList.push('<option value="' + jsonArray["id"] + '">' + cl + "|--" + jsonArray["typename"] + '</option>');
                    for (var k = 0; k < jArray.length; k++) {
                        cl += '    ';
                        if (jArray[k]['lower'] != null) {
                            arguments.callee(jArray[k]);
                        } else {
                            typeList.push('<option value="' + jArray[k]["id"] + '">' + cl + "|--" + jArray[k]["typename"] + '</option>');
                        }
                    }
                    if (jsonArray["lower"] == null) {
                        cl = "";
                    } else {
                        cl = cl.replace("    ", "");
                    }
                })(typeListArr[i]);
            }
            return typeList.join("");
        }

        //拉入黑名单
        ,del: function(t, type){
            var id = t.attr("data-id");
            var stream = t.attr("data-streamname");

            if(id){
                huoniao.showTip("loading", "正在操作，请稍候...");

                huoniao.operaJson("liveJson.php?action="+type+"&dopost="+action, "id="+id+"&stream="+stream, function(data){


                    if(data.state == 100){
                        huoniao.showTip("success", data.info, "auto");
                        $("#selectBtn a:eq(1)").click();
                        setTimeout(function() {
                            getList();
                        }, 800);
                    }else{
                        var info = [];
                        for(var i = 0; i < $("#list tbody tr").length; i++){
                            var tr = $("#list tbody tr:eq("+i+")");
                            for(var k = 0; k < data.info.length; k++){
                                if(data.info[k] == tr.attr("data-id")){
                                    info.push("▪ "+tr.find("td:eq(1) a").text());
                                }
                            }
                        }
                        $.dialog.alert("<div class='errInfo'><strong>以下信息操作失败：</strong><br />" + info.join("<br />") + '</div>', function(){
                            getList();
                        });
                    }
                });
            }else{
                huoniao.showTip("warning", "未选中任何信息！", "auto");
            }

        }
        //删除live
        ,dellive: function(stream, id){

            if(id){
                huoniao.showTip("loading", "正在操作，请稍候...");

                huoniao.operaJson("liveJson.php?action=dellive&dopost="+action+"&id="+id+"&stream="+stream, '', function(data){


                    if(data.state == 100){
                        huoniao.showTip("success", data.info, "auto");
                        $("#selectBtn a:eq(1)").click();
                        setTimeout(function() {
                            getList();
                        }, 800);
                    }else{
                        var info = [];
                        for(var i = 0; i < $("#list tbody tr").length; i++){
                            var tr = $("#list tbody tr:eq("+i+")");
                            for(var k = 0; k < data.info.length; k++){
                                if(data.info[k] == tr.attr("data-id")){
                                    info.push("▪ "+tr.find("td:eq(1) a").text());
                                }
                            }
                        }
                        $.dialog.alert("<div class='errInfo'><strong>以下信息操作失败：</strong><br />" + info.join("<br />") + '</div>', function(){
                            getList();
                        });
                    }
                });
            }else{
                huoniao.showTip("warning", "未选中任何信息！", "auto");
            }

        }

        //还原
        , revert: function () {
            var checked = $("#list tbody tr.selected");
            if (checked.length < 1) {
                huoniao.showTip("warning", "未选中任何信息！", "auto");
            } else {
                huoniao.showTip("loading", "正在操作，请稍候...");
                var id = [];
                for (var i = 0; i < checked.length; i++) {
                    id.push($("#list tbody tr.selected:eq(" + i + ")").attr("data-id"));
                }

                huoniao.operaJson("liveJson.php?action=revert&dopost=" + action, "id=" + id, function (data) {
                    if (data.state == 100) {
                        huoniao.showTip("success", data.info, "auto");
                        setTimeout(function () {
                            getList();
                        }, 800);
                    } else {
                        var info = [];
                        for (var i = 0; i < $("#list tbody tr").length; i++) {
                            var tr = $("#list tbody tr:eq(" + i + ")");
                            for (var k = 0; k < data.info.length; k++) {
                                if (data.info[k] == tr.attr("data-id")) {
                                    info.push("▪ " + tr.find(".row2 a").text());
                                }
                            }
                        }
                        $.dialog.alert("<div class='errInfo'><strong>以下信息操作失败：</strong><br />" + info.join("<br />") + '</div>', function () {
                            getList();
                        });
                    }
                });
                $("#selectBtn a:eq(1)").click();
            }
        }

        //更新信息状态
        ,updateState: function(type){
            huoniao.showTip("loading", "正在操作，请稍候...");
            $("#smartMenu_state").remove();

            var checked = $("#list tbody tr.selected");
            if(checked.length < 1){
                huoniao.showTip("warning", "未选中任何信息！", "auto");
            }else{
                var arcrank = "";
                if(type == "待审核"){
                    arcrank = 0;
                }else if(type == "已审核"){
                    arcrank = 1;
                }else if(type == "拒绝审核"){
                    arcrank = 2;
                }

                huoniao.showTip("loading", "正在操作，请稍候...");
                var id = [];
                for(var i = 0; i < checked.length; i++){
                    id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
                }
                huoniao.operaJson("liveJson.php?action=updateState&dopost="+action, "id="+id+"&arcrank="+arcrank, function(data){
                    if(data.state == 100){
                        huoniao.showTip("success", data.info, "auto");
                        setTimeout(function() {
                            getList();
                        }, 800);
                    }else{
                        var title = '';
                        if(typeof data.info == 'string'){
                            title = data.info;
                        }else{
                            var info = [];
                            for(var i = 0; i < $("#list tbody tr").length; i++){
                                var tr = $("#list tbody tr:eq("+i+")");
                                for(var k = 0; k < data.info.length; k++){
                                    if(data.info[k] == tr.attr("data-id")){
                                        info.push("▪ "+tr.find(".row2 a").text());
                                    }
                                }
                            }
                            title = '<strong>以下信息修改失败：</strong><br />' + info.join("<br />");
                        }
                        $.dialog.alert("<div class='errInfo'>" + title + "</div>", function(){
                            getList();
                        });
                    }
                });
                $("#selectBtn a:eq(1)").click();
            }
        }

    };

$(function () {

    //菜单递归分类
    // $("#typeBtn").append(init.selectTypeList());

    //初始加载
    getList();

    //搜索
    $("#searchBtn").bind("click", function () {
        $("#sKeyword").html($("#keyword").val());
        $("#sType").html($("#typeBtn").attr("data-id"));
        $("#list").attr("data-atpage", 1);
        $("#start").html($("#stime").val());
        $("#end").html($("#etime").val());
        getList();
    });

    //搜索回车提交
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


    //二级菜单点击事件
    $("#typeBtn a").bind("click", function () {
        var id = $(this).attr("data-id"), title = $(this).text();
        $("#typeBtn").attr("data-id", id);
        $("#typeBtn button").html(title + '<span class="caret"></span>');
    });

    $("#stateBtn, #propertyBtn, #pageBtn, #paginationBtn").delegate("a", "click", function () {
        var id = $(this).attr("data-id"), title = $(this).html(), obj = $(this).parent().parent().parent();
        obj.attr("data-id", id);
        if (obj.attr("id") == "paginationBtn") {
            var totalPage = $("#list").attr("data-totalpage");
            $("#list").attr("data-atpage", id);
            obj.find("button").html(id + "/" + totalPage + '页<span class="caret"></span>');
            $("#list").attr("data-atpage", id);
        } else {

            $("#typeBtn")
                .attr("data-id", "")
                .find("button").html('全部分类<span class="caret"></span>');

            $("#sType").html("");

            if (obj.attr("id") != "propertyBtn") {
                obj.find("button").html(title + '<span class="caret"></span>');
            }
            $("#list").attr("data-atpage", 1);
        }
        getList();
    });

    //下拉菜单过长设置滚动条
    $(".dropdown-toggle").bind("click", function () {
        if ($(this).parent().attr("id") != "typeBtn") {
            var height = document.documentElement.clientHeight - $(this).offset().top - $(this).height() - 30;
            $(this).next(".dropdown-menu").css({"max-height": height, "overflow-y": "auto"});
        }
    });



    //移动
    $("#moveBtn").bind("click", function () {
        init.move();
    });

    //批量审核
    $("#batchAudit a").bind("click", function () {
        init.updateState($(this).text());
    });

    //回收站
    $("#recycleBtn").bind("click", function () {
        var t = $(this);

        $("#typeBtn")
            .attr("data-id", "")
            .find("button").html('全部分类<span class="caret"></span>');

        $("#sType").html("");

        if (t.text() == "回收站") {
            t.attr("data-id", 1);
            t.html("返回");
        } else {
            t.attr("data-id", "");
            t.html("回收站");
        }
        $("#list").attr("data-atpage", 1);
        getList();
    });


    //分类链接点击
    $("#list").delegate(".type", "click", function (event) {
        event.preventDefault();
        var id = $(this).attr("data-id"), txt = $(this).text();

        $("#typeBtn")
            .attr("data-id", id)
            .find("button").html(txt + '<span class="caret"></span>');

        $("#sType").html(id);
        $("#list").attr("data-atpage", 1);
        getList();

        $("#selectBtn a:eq(1)").click();
    });

    $(document).click(function (e) {
        var s = e.target;
        if ($("#smartMenu_state").html() != undefined) {
            if (!jQuery.contains($("#smartMenu_state").get(0), s)) {
                if (jQuery.inArray(s, $(".smart_menu_body")) < 0) {
                    $("#smartMenu_state").remove();
                }
            }
        }
    });

});

//单条删除
$("#list").delegate(".addblack", "click", function(){
    var t = $(this);
    var recycle = t.attr("data-type") ? t.attr("data-type") : "";
    var stream = t.attr("data-title");
    if(recycle == 3){
        $.dialog.confirm('您确定要将流'+stream+'从黑名单中恢复吗？', function(){
            init.del(t, "delblack");
        });
    }else{
        $.dialog.confirm('您确定要将流'+stream+'加入黑名单吗？', function(){
            init.del(t,"addblack");
        });
    }
});

//开始直播
$("#list").delegate(".start, .stop", "click", function(){
    var t = $(this), id = t.attr("data-id"), p = t.parent(), isstart = t.hasClass('start'), state = isstart ? 1 : 2;
    $.ajax({
        url: 'liveJson.php?action=updateLiveState&id='+id+'&state='+state,
        type: 'get',
        dataType: 'json',
        success: function(res){
            if(res && res.state == 100){
                huoniao.showTip('success', res.info);
                p.addClass('hide');
                if(isstart){
                    p.next().removeClass('hide');
                }
            }else{
                huoniao.showTip('error', res.info);
            }
        },
        error: function(){
            huoniao.showTip('error', '网络错误');
        }
    })
    
});

//单条删除
$("#list").delegate(".del", "click", function(){
    var stream = $(this).attr("data-title");
    var id = $(this).attr("data-id");
    $.dialog.confirm('您确定要将流'+stream+'删除吗？', function(){
        init.dellive(stream, id);
    });
});

//推荐设置
$("#list").delegate(".rec", "click", function(event){
    event.preventDefault();
    var t = $(this), rec = t.attr('data-rec') == 1 ? 0 : 1, id = t.closest('tr').data('id');
    huoniao.operaJson("liveJson.php?action=liveAnchorRec", 'id='+id+'&rec='+rec, function (val) {
        if (val.state == "100") {
            if(rec == 1){
                t.text('已推荐').attr('data-rec', 1).removeClass('gray').addClass('audit');
            }else{
                t.text('未推荐').attr('data-rec', 0).removeClass('audit').addClass('gray');
            }
            huoniao.showTip("success", "操作成功", "auto");
        }else{
            huoniao.showTip("error", "操作失败", "auto");
        }
    })
    return false;
});

$(document).click(function (e) {
    var s = e.target;
    if ($("#smartMenu_state").html() != undefined) {
        if (!jQuery.contains($("#smartMenu_state").get(0), s)) {
            if (jQuery.inArray(s, $(".smart_menu_body")) < 0) {
                $("#smartMenu_state").remove();
            }
        }
    }
});

//获取列表
function getList() {
    huoniao.showTip("loading", "正在操作，请稍候...");
    $("#list table, #pageInfo").hide();
    $("#selectBtn a:eq(1)").click();
    $("#loading").html("加载中，请稍候...").show();
    var sKeyword = encodeURIComponent($("#sKeyword").html()),
        sType = $("#sType").html(),
        pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
        page = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

    var data = [];
    data.push("sKeyword=" + sKeyword);
    data.push("pagestep=" + pagestep);
    data.push("page=" + page);

    huoniao.operaJson("liveJson.php?action=" + action, data.join("&"), function (val) {
        var obj = $("#list"), list = [], i = 0, anchorList = val.anchorList;
        obj.attr("data-totalpage", val.pageInfo.totalPage);
        $(".totalCount").html(val.pageInfo.totalCount);
        if (val.state == "100") {
            //huoniao.showTip("success", "获取成功！", "auto");
            huoniao.hideTip();

            for (i; i < anchorList.length; i++) {
                list.push('<tr data-id="' + anchorList[i].id + '">');
                list.push('<td class="row3"></td>');
                list.push('  <td class="row20 left">'+anchorList[i].username+'</td>');
                list.push('  <td class="row15">' + anchorList[i].phone + '</td>');
                list.push('  <td class="row15">' + anchorList[i].total + '</td>');
                list.push('  <td class="row15">' + anchorList[i].totalFans + '</td>');

                var rec = '';
                if(anchorList[i].rec == '1'){
                    rec = '<a href="javascript:;" class="rec audit" data-rec="'+anchorList[i].rec+'" title="取消推荐">已推荐</a>';
                }else{
                    rec = '<a href="javascript:;" class="rec gray" data-rec="'+anchorList[i].rec+'" title="设为推荐">未推荐</a>';
                }
                list.push('  <td class="row15 center">' + rec + '</td>');
                list.push('  <td class="row17 center">' + anchorList[i].pubdate + '</td>');
            }

            obj.find("tbody").html(list.join(""));
            $("#loading").hide();
            $("#list table").show();
            huoniao.showPageInfo();

        } else {
            obj.find("tbody").html("");
            huoniao.showTip("warning", val.info, "auto");
            $("#loading").html(val.info).show();
        }
    });

    //修改
    $("#list").delegate(".edit", "click", function(event){
        var id = $(this).attr("data-id"),
            title = $(this).attr("data-title"),
            href = $(this).attr("href");

        try {
            event.preventDefault();
            parent.addPage("editlive"+id, "live", title, "live/"+href);
        } catch(e) {}
    });

    //开始、结束时间
    $("#stime, #etime").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch'});

};
