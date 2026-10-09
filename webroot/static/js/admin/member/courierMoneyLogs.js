$(function(){
    huoniao.choseCity($(".choseCity"),$("#cityid"));
    $(".chosen-select").chosen();

    var defaultBtn = $("#delBtn"),
        checkedBtn = $("#stateBtn"),
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
                    defaultBtn.show();
                    checkedBtn.hide();
                }else{
                    defaultBtn.hide();
                    checkedBtn.show();
                }
            },del: function(type){
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
                    huoniao.operaJson("?dopost=delAmount", "id="+id, function(data){
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

    //初始加载
    getList();

    //开始、结束时间
    $("#stime, #etime").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 3, language: 'ch'});

    //搜索
    $("#searchBtn").bind("click", function(){
        $("#sKeyword").html($("#keyword").val());
        $("#start").html($("#stime").val());
        $("#end").html($("#etime").val());
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

    //二级菜单点击事件
    $("#stateBtn, #pageBtn, #paginationBtn,#leimuBtn,#shouruBtn").delegate("a", "click", function(){
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
        var nolist = $(this).data("nolist");
        if(!nolist){
            getList();
        }
    });

    //全选、不选
    $("#selectBtn a").bind("click", function(){
        var id = $(this).attr("data-id");
        if(id == 1){
            $("#selectBtn .check").addClass("checked");
            $("#list tr").removeClass("selected").addClass("selected");

            defaultBtn.show();
            checkedBtn.hide();
        }else{
            $("#selectBtn .check").removeClass("checked");
            $("#list tr").removeClass("selected");

            defaultBtn.hide();
            checkedBtn.show();
        }
    });

    //下拉菜单过长设置滚动条
    $(".dropdown-toggle").bind("click", function(){
        if($(this).parent().attr("id") != "typeBtn" && $(this).parent().attr("id") != "addrBtn"){
            var height = document.documentElement.clientHeight - $(this).offset().top - $(this).height() - 30;
            $(this).next(".dropdown-menu").css({"max-height": height, "overflow-y": "auto"});
        }
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
        }else if(event.target.className.indexOf("edit") > -1 || event.target.className.indexOf("revert") > -1 || event.target.className.indexOf("del") > -1) {
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

    //删除
    $("#delBtn").bind("click", function(){
        $.dialog.confirm('此操作不可恢复，您确定要删除吗？', function(){
            init.del();
        });
    });

    //单条删除
    $("#list").delegate(".del", "click", function(){
        $.dialog.confirm('此操作不可恢复，您确定要删除吗？', function(){
            init.del();
        });
    });

    // 导出
    $("#export").click(function(e){
        var  list = '';

        list = "list"
        pageInfo = "pageInfo";
        selectBtn = "selectBtn"
        loading  = "loading"
        pageBtn   = "pageBtn"


        var page = $("#"+list).attr("data-atpage") ? $("#"+list).attr("data-atpage") : "1";

        sKeyword = encodeURIComponent($("#sKeyword").html());

        let start = $("#stime").val();
        let end = $("#etime").val();
        let cityid = $("#cityid").val();
        let state = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "";


        var data = [];
        data.push("search="+sKeyword);
        data.push("pay="+state);
        data.push("start="+start);
        data.push("end="+end);
        data.push("cityid="+cityid);
        data.push("pagestep=200000");
        data.push("page="+page);
        huoniao.showTip("loading", "正在导出，请稍候...", "auto");
        $(this).attr('href', '?dopost=getList&do=export&'+data.join('&'));

    })
});

//获取列表
function getList(){
    huoniao.showTip("loading", "正在操作，请稍候...");
    var  list = '';

    list = "list"
    pageInfo = "pageInfo";
    selectBtn = "selectBtn"
    loading  = "loading"
    pageBtn   = "pageBtn"

    $("#"+list+" table, #"+pageInfo).hide();
    $("#"+selectBtn+" a:eq(1)").click();
    $("#"+loading).html("加载中，请稍候...").show();

    var page = $("#"+list).attr("data-atpage") ? $("#"+list).attr("data-atpage") : "1";

    sKeyword = encodeURIComponent($("#sKeyword").html());

    let start = $("#stime").val();
    let end = $("#etime").val();
    let cityid = $("#cityid").val();
    let state = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "";


    var data = [];
    data.push("search="+sKeyword);
    data.push("pay="+state);
    data.push("start="+start);
    data.push("end="+end);
    data.push("cityid="+cityid);
    data.push("pagestep=20");
    data.push("page="+page);
        huoniao.operaJson("?dopost=getList", data.join("&"), function(val){
        var obj = $("#"+list), listArr = [], i = 0, memberList = val.memberList;

        obj.attr("data-totalpage", val.pageInfo.totalPage);
        $(".totalCount").html(val.pageInfo.totalCount);
        $(".state1").html(val.pageInfo.countPayPrice);
        $(".state2").html(val.pageInfo.countPrice);
        $(".state3").html(val.pageInfo.countTiPrice);

        $("#totalIncourier").html(val.pageInfo.totalPrice);
        $("#totalOutcourier").html(val.pageInfo.totalPayPrice);
        $("#totaltixiancourier").html(val.pageInfo.totalTiPrice);

        if(val.state == "100"){
            huoniao.hideTip();

            for(i; i < memberList.length; i++){
                listArr.push('<tr data-id="'+memberList[i].id+'">');

                listArr.push('  <td class="row3"><span class="check"></span></td>');
                var type = '<span class="text-success">收入</span>';
                if(memberList[i].type == 0 && memberList[i].cattype==0){
                    type = '<span class="text-error">支出</span>';
                }else if(memberList[i].type == 0 && memberList[i].cattype==1){
                    type = '<span class="text-error">提现</span>';
                }
                listArr.push('  <td class="row7 left">'+memberList[i].cityname+'</td>');
                listArr.push('  <td class="row15 left">'+memberList[i].username+'</td>');
                listArr.push('  <td class="row10 left">'+type+'</td>');
                listArr.push('  <td class="row10 left">'+memberList[i].amount+'</td>');
                listArr.push('  <td class="row35 left">'+memberList[i].info+'</td>');
                listArr.push('  <td class="row15 left">'+memberList[i].date+'</td>');
                listArr.push('  <td class="row5 left"><a href="javascript:;" class="del" title="删除记录">删除</a></td>');
                listArr.push('</tr>');

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
