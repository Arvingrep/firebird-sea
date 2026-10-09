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
    $("#typeBtn").append(init.selectTypeList());

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
	$.dialog.confirm('确认要操作吗？', function(){
		$.ajax({
	        url: 'liveJson.php?action=updateLiveState&id='+id+'&state='+state,
	        type: 'get',
	        dataType: 'json',
	        success: function(res){
	            if(res && res.state == 100){
	                huoniao.showTip('success', res.info);
	                // p.addClass('hide');
	                // if(isstart){
	                //     p.next().removeClass('hide');
	                // }
					setTimeout(getList, 500);
					// getList();
	            }else{
	                huoniao.showTip('error', res.info);
	            }
	        },
	        error: function(){
	            huoniao.showTip('error', '网络错误');
	        }
	    })
	});
});

//单条删除
$("#list").delegate(".del", "click", function(){
    var stream = $(this).attr("data-title");
    var id = $(this).attr("data-id");
    $.dialog.confirm('您确定要将流'+stream+'删除吗？', function(){
        init.dellive(stream, id);
    });
});

//审核状态更新
$("#list").delegate(".more", "click", function(event){
    event.preventDefault();

    $.smartMenu.remove();

    var t = $(this), top = t.offset().top - 5, left = t.offset().left + 15, obj = "smartMenu_state";
    if($("#"+obj).html() != undefined){
        $("#"+obj).remove();
    }

    t.parent().parent().removeClass("selected").addClass("selected");

    var htmlCreateStateMenu = function(){
        var htmlMenu = [];
        htmlMenu.push('<div id="'+obj+'" class="smart_menu_box">');
        htmlMenu.push('  <div class="smart_menu_body">');
        htmlMenu.push('    <ul class="smart_menu_ul">');
        htmlMenu.push('      <li class="smart_menu_li"><a href="javascript:" class="smart_menu_a">待审核</a></li>');
        htmlMenu.push('      <li class="smart_menu_li"><a href="javascript:" class="smart_menu_a">已审核</a></li>');
        htmlMenu.push('      <li class="smart_menu_li"><a href="javascript:" class="smart_menu_a">拒绝审核</a></li>');
        htmlMenu.push('    </ul>');
        htmlMenu.push('  </div>');
        htmlMenu.push('</div>');

        return htmlMenu.join("");
    }

    $("body").append(htmlCreateStateMenu());

    $("#"+obj).find("a").bind("click", function(event){
        event.preventDefault();
        init.updateState($(this).text());
    });

    $("#"+obj).css({
        top: top,
        left: left - $("#"+obj).width()/2
    }).show();

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
        state = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
        property = $("#propertyBtn").attr("data-id") ? $("#propertyBtn").attr("data-id") : "",
        pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
        page = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1",
        aType = $("#recycleBtn").attr("data-id") ? $("#recycleBtn").attr("data-id") : "",
        start = $("#stime").val(),
        end   = $("#etime").val();

    var data = [];
    data.push("sKeyword=" + sKeyword);
    data.push("sType=" + sType);
    data.push("state=" + state);
    data.push("property=" + property);
    data.push("pagestep=" + pagestep);
    data.push("page=" + page);
    data.push("aType=" + aType);
    data.push("start=" + start);
    data.push("end=" + end);

    huoniao.operaJson("liveJson.php?action=" + action, data.join("&"), function (val) {
        var obj = $("#list"), list = [], i = 0, articleList = val.articleList;
        obj.attr("data-totalpage", val.pageInfo.totalPage);
        // $(".totalCount").html(val.pageInfo.totalCount);
        $(".totalGray").html(val.pageInfo.totalGray);
        $(".totalAudit").html(val.pageInfo.totalAudit);
        $(".totalRefuse").html(val.pageInfo.totalRefuse);
        $(".initCount").html(val.pageInfo.initCount);
        $(".nowCount").html(val.pageInfo.nowCount);
        $(".hisCount").html(val.pageInfo.hisCount);
        // $(".blackCount").html(val.pageInfo.blackCount);
        $(".totalCount").html(val.pageInfo.totalCount);
        if (val.state == "100") {
            //huoniao.showTip("success", "获取成功！", "auto");
            huoniao.hideTip();

            for (i; i < articleList.length; i++) {
                var stateStr = '';
                if(articleList[i].state == '0'){
                    stateStr = '&nbsp;&nbsp;&nbsp;&nbsp;<span class="label label-inverse">未开始</span>';
                }else if(articleList[i].state == '1'){
                    stateStr = '&nbsp;&nbsp;&nbsp;&nbsp;<span class="label label-warning">直播中</span>';
                }else if(articleList[i].state == '2'){
                    stateStr = '&nbsp;&nbsp;&nbsp;&nbsp;<span class="label label-success">已结束</span>';
                }
                var recycle = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "";
                list.push('<tr data-id="' + articleList[i].id + '">');
                list.push('<td class="row3"></td>');
                list.push('  <td class="row30 left"><a href="'+(articleList[i].url != '无' ? articleList[i].url : 'javascript:;')+'" '+(articleList[i].url != '无' ? 'target="_blank"' : '')+'>'+articleList[i].title+'</a>'+stateStr+'</td>');
                list.push('  <td class="row15"><input type="text" value="' + articleList[i].pushurl + '" readonly="" /></td>');
                list.push('  <td class="row10">' + articleList[i].PublishTime + '</td>');
				list.push('  <td class="row10"><a href="javascript:;" class="userinfo" data-id="'+articleList[i].user+'">' + articleList[i].username + '</a></td>');

                var arcrank = "";
                switch (articleList[i].arcrank) {
                    case "等待审核":
                        arcrank = '<span class="gray">待审核</span>';
                        break;
                    case "审核通过":
                        arcrank = '<span class="audit">已审核</span>';
                        break;
                    case "审核拒绝":
                        arcrank = '<span class="refuse">审核拒绝</span>';
                        break;
                }
                list.push('  <td class="row10 state">'+(arcrank+'<span class="more"><s></s></span>')+'</td>');

                list.push('  <td class="row8">');
                list.push('<a data-id="'+articleList[i].id+'" data-title="'+articleList[i].title+'" href="liveAdd.php?dopost=edit&id='+articleList[i].id+'&action='+action+'" title="修改" class="edit">修改</a>');
                list.push('</td>');
                list.push('<td class="row5">');
            	list.push('<a href="javascript:;" data-id="'+articleList[i].id+'" data-type="'+articleList[i].state+'" data-streamname="' + articleList[i].streamname+ '" data-title="' + articleList[i].title+ '"  class="del">删除</a>');
                list.push('</td>');

                list.push('  <td class="row9">');

				//未直播
				if(articleList[i].state == '0'){
					list.push('<a href="javascript:;" class="start"  data-id="'+articleList[i].id+'" data-type="'+articleList[i].state+'" data-streamname="' + articleList[i].streamname+ '" data-title="' + articleList[i].title+ '" style="color:#2672ec">开始直播</a>');
				}
				//已直播
				if(articleList[i].state == '1'){
					list.push('<a href="javascript:;" class="stop"  data-id="'+articleList[i].id+'" data-type="'+articleList[i].state+'" data-streamname="' + articleList[i].streamname+ '" data-title="' + articleList[i].title+ '" style="color:#ff0000">结束直播</a>');
				}

                if(recycle != 3){
                    // list.push('<a href="javascript:;" data-id="'+articleList[i].id+'" data-title="' + articleList[i].title+ '" style="color:#2672ec;margin-left:5px;" class="dellive">删除</a>');
                }
                list.push('</td>');
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
