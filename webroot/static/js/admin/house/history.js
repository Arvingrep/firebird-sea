$(function(){

    var defaultBtn = $("#delBtn"),
        init = {

            //选中样式切换
            funTrStyle: function(){
                var trLength = $("#list tbody tr").length, checkLength = $("#list tbody tr.selected").length;
                if(trLength == checkLength){
                    $("#selectBtn .check").removeClass("checked").addClass("checked");
                }else{
                    $("#selectBtn .check").removeClass("checked");
                }

                if(checkLength > 0){
                    defaultBtn.css('display', 'inline-block');
                }else{
                    defaultBtn.hide();
                }
            }

            //删除
            ,del: function(){
                var checked = $("#list tbody tr.selected");
                if(checked.length < 1){
                    huoniao.showTip("warning", "未选中任何信息！", "auto");
                }else{
                    huoniao.showTip("loading", "正在操作，请稍候...");
                    var id = [];
                    for(var i = 0; i < checked.length; i++){
                        id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
                    }

                    huoniao.operaJson("history.php?dopost=delAppoint", "id="+id, function(data){
                        if(data.state == 100){
                            huoniao.showTip("success", data.info, "auto");
                            setTimeout(function() {
                                getList();
                            }, 800);
                        }else{
                            var info = [];
                            for(var i = 0; i < $("#list tbody tr").length; i++){
                                var tr = $("#list tbody tr:eq("+i+")");
                                for(var k = 0; k < data.info.length; k++){
                                    if(data.info[k] == tr.attr("data-id")){
                                        info.push("▪ "+tr.find("td:eq(1)").text());
                                    }
                                }
                            }
                            $.dialog.alert("<div class='errInfo'><strong>以下信息删除失败：</strong><br />" + info.join("<br />") + '</div>', function(){
                                getList();
                            });
                        }
                    });
                    $("#selectBtn a:eq(1)").click();
                }
            }

        };

    huoniao.choseCity($(".choseCity"),$("#cityid"));

    //初始加载
    getList();

    $(".chosen-select").chosen();

    //搜索
    $("#searchBtn").bind("click", function(){
        $("#sKeyword").html($("#keyword").val());
        $("#sType").html($("#sTypeBtn").attr("data-id"));
        $("#state").html($("#stateBtn").attr("data-id"));
        $("#type").html($("#typeBtn").attr("data-id"));
        $("#list").attr("data-atpage", 1);
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

    //搜索分类菜单点击事件
    $("#sTypeBtn a").bind("click", function(){
        var id = $(this).attr("data-id"), title = $(this).text();
        $("#sTypeBtn").attr("data-id", id);
        $("#sTypeBtn button").html(title+'<span class="caret"></span>');
    });
    $("#typeBtn a").bind("click", function(){
        var id = $(this).attr("data-id"), title = $(this).text();
        $("#typeBtn").attr("data-id", id);
        $("#typeBtn button").html(title+'<span class="caret"></span>');
    });
    $("#stateBtn a").bind("click", function(){
        var id = $(this).attr("data-id"), title = $(this).text();
        $("#stateBtn").attr("data-id", id);
        $("#stateBtn button").html(title+'<span class="caret"></span>');
    });

    $("#pageBtn, #paginationBtn").delegate("a", "click", function(){
        var id = $(this).attr("data-id"), title = $(this).html(), obj = $(this).parent().parent().parent();
        obj.attr("data-id", id);
        if(obj.attr("id") == "paginationBtn"){
            var totalPage = $("#list").attr("data-totalpage");
            $("#list").attr("data-atpage", id);
            obj.find("button").html(id+"/"+totalPage+'页<span class="caret"></span>');
            $("#list").attr("data-atpage", id);
        }else{

            if(obj.attr("id") != "propertyBtn"){
                obj.find("button").html(title+'<span class="caret"></span>');
            }
            $("#list").attr("data-atpage", 1);
        }
        getList();
    });

    //下拉菜单过长设置滚动条
    $(".dropdown-toggle").bind("click", function(){
        if($(this).parent().attr("id") != "typeBtn"){
            var height = document.documentElement.clientHeight - $(this).offset().top - $(this).height() - 30;
            $(this).next(".dropdown-menu").css({"max-height": height, "overflow-y": "auto"});
        }
    });

    //全选、不选
    $("#selectBtn a").bind("click", function(){
        var id = $(this).attr("data-id");
        if(id == 1){
            $("#selectBtn .check").addClass("checked");
            $("#list tr").removeClass("selected").addClass("selected");

            defaultBtn.css('display', 'inline-block');
        }else{
            $("#selectBtn .check").removeClass("checked");
            $("#list tr").removeClass("selected");

            defaultBtn.hide();
        }
    });

    //查看
    $("#list").delegate(".edit", "click", function(){
        var t = $(this), id = t.attr("data-id");
        huoniao.showTip("loading", "正在查询，请稍候...");
        huoniao.operaJson("history.php?dopost=getDetail", "id="+id, function(data){
            huoniao.hideTip();
            $.dialog({
                fixed: true,
                title: '举报内容',
                content: data.desc,
                width: 800,
                ok: true
            });
        });
    });

    //删除
    $("#delBtn").bind("click", function(){
        if($.dialog.confirm("确定要删除吗？", function(){
            init.del("del");
        }));
    });

    //单选
    $("#list tbody").delegate("tr", "click", function(event){
        var isCheck = $(this), checkLength = $("#list tbody tr.selected").length;
        if(event.target.className.indexOf("check") > -1) {
            if(isCheck.hasClass("selected")){
                isCheck.removeClass("selected");
            }else{
                isCheck.addClass("selected");
            }
        }else if(event.target.className.indexOf("edit") > -1 || event.target.className.indexOf("del") > -1) {
            $("#list tr").removeClass("selected");
            isCheck.addClass("selected");
        }else{
            if(checkLength > 1){
                $("#list tr").removeClass("selected");
                isCheck.addClass("selected");
            }else{
                if(isCheck.hasClass("selected")){
                    isCheck.removeClass("selected");
                }else{
                    $("#list tr").removeClass("selected");
                    isCheck.addClass("selected");
                }
            }
        }

        init.funTrStyle();
    });

    //拖选功能
    // $("#list tbody").selectable({
    //     distance: 3,
    //     cancel: '.check, a',
    //     start: function(){
    //         $("#smartMenu_state").remove();
    //     },
    //     stop: function() {
    //         init.funTrStyle();
    //     }
    // });

});

//获取列表
function getList(){
    huoniao.showTip("loading", "正在操作，请稍候...");
    $("#list table, #pageInfo").hide();
    $("#selectBtn a:eq(1)").click();
    $("#loading").html("加载中，请稍候...").show();
    var sKeyword = encodeURIComponent($("#sKeyword").html()),
        sType = $("#sType").html(),
        state = $("#state").html(),
        type   = $("#type").html(),
        cityid   = $("#cityid").val(),
        pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
        page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

    var data = [];
    data.push("sKeyword="+sKeyword);
    data.push("sType="+sType);
    data.push("state="+state);
    data.push("type="+type);
    data.push("cityid="+cityid);
    data.push("pagestep="+pagestep);
    data.push("page="+page);

    huoniao.operaJson("history.php?dopost=getList", data.join("&"), function(val){
        var obj = $("#list"), list = [], i = 0, history = val.bookingList;
        if(val.state == "100"){
            huoniao.hideTip();
            //huoniao.showTip("success", "获取成功！", "auto");

            obj.attr("data-totalpage", val.pageInfo.totalPage);

            for(i; i < history.length; i++){
                var user = '<a href="javascript:;" data-id="'+history[i].uid+'" class="userinfo">'+history[i].username+'</a>';

                list.push('<tr data-id="'+history[i].id+'">');
                list.push('  <td class="row5"><span class="check"></span></td>');
                list.push('  <td class="row25 left"><a target="_blank" href="'+history[i].url+'">'+history[i].title+'</a></td>');
                list.push('  <td class="row15">'+history[i].date+'</td>');
                list.push('  <td class="row20">'+user+'</td>');
                list.push('  <td class="row20">'+history[i].mobile+'</td>');
                list.push('  <td class="row15">'+history[i].status+'</td>');
                list.push('</tr>');
            }

            obj.find("tbody").html(list.join(""));
            $("#loading").hide();
            $("#list table").show();
            huoniao.showPageInfo();

        }else{
            obj.attr("data-totalpage", "1");

            huoniao.showPageInfo();

            obj.find("tbody").html("");
            huoniao.showTip("warning", val.info, "auto");
            $("#loading").html(val.info).show();
        }
    });

};
