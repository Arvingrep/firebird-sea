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
                    defaultBtn.show();
                }else{
                    defaultBtn.hide();
                }
            }

            //菜单递归分类
            ,selectTypeList: function(){
                var typeList = [], title = "全部分类";
                typeList.push('<ul class="dropdown-menu">');
                typeList.push('<li><a href="javascript:;" data-id="">'+title+'</a></li>');

                var l = typeListArr;
                for(var i = 0; i < l.length; i++){
                    (function(){
                        var jsonArray =arguments[0], jArray = jsonArray.lower, cl = "";
                        if(jArray.length > 0){
                            cl = ' class="dropdown-submenu"';
                        }
                        typeList.push('<li'+cl+'><a href="javascript:;" data-id="'+jsonArray["id"]+'">'+jsonArray["typename"]+'</a>');
                        if(jArray.length > 0){
                            typeList.push('<ul class="dropdown-menu">');
                        }
                        for(var k = 0; k < jArray.length; k++){
                            if(jArray[k]['lower'] != ""){
                                arguments.callee(jArray[k]);
                            }else{
                                typeList.push('<li><a href="javascript:;" data-id="'+jArray[k]["id"]+'">'+jArray[k]["typename"]+'</a></li>');
                            }
                        }
                        if(jArray.length > 0){
                            typeList.push('</ul></li>');
                        }else{
                            typeList.push('</li>');
                        }
                    })(l[i]);
                }

                typeList.push('</ul>');
                return typeList.join("");
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

                    huoniao.operaJson("businessPrinterList.php?dopost=del&action="+action+"&type="+atype, "id="+id, function(data){
                        if(data.state == 100){
                            //huoniao.showTip("success", data.info, "auto");
                            $("#selectBtn a:eq(1)").click();
                            getList();
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
                            $.dialog.alert("<div class='errInfo'><strong>以下信息删除失败：</strong><br />" + info.join("<br />") + '</div>', function(){
                                getList();
                            });
                        }
                    });
                    $("#selectBtn a:eq(1)").click();
                }
            }

            //更新信息状态
            ,updateState: function(t){
                huoniao.showTip("loading", "正在操作，请稍候...");

                var id = t.attr("data-id"), pid = t.closest("tr").attr("data-id");

                var arcrank = id == 1 ? 0 : 1, title = id == 1 ? "隐藏" : "显示", cla = id == 1 ? "gray" : "audit";

                huoniao.operaJson("advList.php?dopost=updateState&action="+action, "id="+pid+"&state="+arcrank, function(data){
                    if(data.state == 100){
                        huoniao.showTip("success", data.info, "auto");
                        t.attr("data-id", arcrank).text(title).removeClass().addClass(cla);
                    }else{
                        huoniao.showTip("error", "修改失败，请重试！");
                    }
                });
                $("#selectBtn a:eq(1)").click();
            }

        };

    //菜单递归分类
    if(atype && typeListArr){
        var list = [];
        list.push('<ul class="dropdown-menu">');
        for (var i = 0; i < typeListArr.length; i++) {
            list.push('<li><a href="javascript:;" data-id="'+typeListArr[i]["directory"]+'">'+typeListArr[i]["tplname"]+'</a></li>');
        };
        list.push('</ul>');
        $("#typeBtn").append(list.join(""));
    }else{
        $("#typeBtn").append(init.selectTypeList());
    }

    //导入历史打印机
    var importPopup;
    $('#importPrint').bind('click', function(){

        var url = $(this).data('url');
        parent.importPopup = $.dialog({
            id: 'importPopup',
            title: '重要提示',
            width: 600,
            ok: false,
            content: '<div style="padding: 15px 25px;"><p><h3><center>导入前请认真阅读此内容！</center></h3></p><ul><li>请确认已经将系统升级到最新版本，商店中的<strong style="color:red;">数据库和文件均已校验并同步完成</strong>！</li><li>请确认【打印机平台管理】已经安装并配置好平台信息！</li><li>请确认[business_print]、[business_shop_print]这两个数据表已经清空，如果不清空会导致重复导入！</li><li>如果导入失败，请先尝试清空[business_print]、[business_shop_print]这两个表再重新导入，如果还是失败，请到酷曼云官网会员中心<a href="https://www.kumanyun.com/my/ticketList.html" target="_blank">提交工单！</a></li></ul><p style="padding-top: 15px;"><center><a href="'+url+'" target="_blank" onclick="javascript:window.importPopup.close();" class="btn btn-primary">确认无误，开始同步=></a></center></p></div>'
        });

    });

    //初始加载
    getList();

    //搜索
    $("#searchBtn").bind("click", function(){
        $("#sKeyword").html($("#keyword").val());
        $("#sType").html($("#typeBtn").attr("data-id"));
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

    //广告分类管理
    $("#typeManage").bind("click", function(event){
        event.preventDefault();
        var href = $(this).attr("href"), type = action == "pic" ? "article" : action;

        try {
            event.preventDefault();
            parent.addPage("printerType"+action, type, "打印机平台管理", "business/"+href);
        } catch(e) {}
    });

    //新增广告
    $("#addNew").bind("click", function(event){
        event.preventDefault();
        var href = $(this).attr("href"), type = action == "pic" ? "article" : action;
        try {
            event.preventDefault();
            parent.addPage("businessPrinterAdd"+action+atype, type, "新增店铺打印机", "business/"+href);
        } catch(e) {}
    });

    //二级菜单点击事件
    $("#typeBtn a").bind("click", function(){
        var id = $(this).attr("data-id"), title = $(this).text();
        $("#typeBtn").attr("data-id", id);
        $("#typeBtn button").html(title+'<span class="caret"></span>');
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

            $("#typeBtn")
                .attr("data-id", "")
                .find("button").html('全部分类<span class="caret"></span>');

            $("#sType").html("");

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

            defaultBtn.show();
        }else{
            $("#selectBtn .check").removeClass("checked");
            $("#list tr").removeClass("selected");

            defaultBtn.hide();
        }
    });

    //修改
    $("#list").delegate(".edit", "click", function(event){
        var id = $(this).attr("data-id"),
            title = $(this).attr("data-title"),
            href = $(this).attr("href");

        try {
            event.preventDefault();
            parent.addPage("businessPrinterAdd"+action+id, action, title, "business/"+href);
        } catch(e) {}
    });

    //分站城市
    $("#list").delegate(".cityAd", "click", function(event){
        var id = $(this).closest('tr').attr("data-id"), title = $(this).closest('tr').attr("data-title");

        try {
            event.preventDefault();
            parent.addPage("cityAdv"+action+id, action, title, "siteConfig/advCityList.php?aid="+id+"&action="+action);
        } catch(e) {}
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

    //拖选功能
    // $("#list tbody").selectable({
    // 	distance: 3,
    // 	cancel: '.check, a',
    // 	start: function(){
    // 		//$("#smartMenu_state").remove();
    // 	},
    // 	stop: function() {
    // 		init.funTrStyle();
    // 	}
    // });

    //分类链接点击
    $("#list").delegate(".type", "click", function(event){
        event.preventDefault();
        var id = $(this).attr("data-id"), txt = $(this).text();

        $("#typeBtn")
            .attr("data-id", id)
            .find("button").html(txt+'<span class="caret"></span>');

        $("#sType").html(id);

        $("#list").attr("data-atpage", 1);
        getList();

        $("#selectBtn a:eq(1)").click();
    });

    $("#list").delegate(".state a", "click", function(){
        var t = $(this);
        init.updateState(t);
    });

    //广告预览
    $("#list").delegate(".preview-ad", "click", function(){
        var id = $(this).closest("tr").attr("data-id"), cla = $(this).closest("tr").attr("data-class");
        var width = height = "auto";

        if(cla == "对联广告"){
            width = "1480px";
            height = "600px";
        }else if(cla == "多图广告"){
            height = '500px';
        }else if(cla == "拉伸广告"){
            width = '1215px';
            height = '600px';
        }

        $.dialog({
            fixed: true,
            title: '广告预览',
            width: width,
            height: height,
            content: 'url:siteConfig/advList.php?dopost=preview&action='+action+'&id='+id
        });

    });

});


//获取列表
function getList(){
    huoniao.showTip("loading", "正在操作，请稍候...");
    $("#list table, #pageInfo").hide();
    $("#selectBtn a:eq(1)").click();
    $("#loading").html("加载中，请稍候...").show();
    var sKeyword = encodeURIComponent($("#sKeyword").html()),
        sType    = $("#sType").html(),
        state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
        pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
        page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

    var data = [];
    data.push("sKeyword="+sKeyword);
    data.push("sType="+sType);
    data.push("state="+state);
    data.push("pagestep="+pagestep);
    data.push("page="+page);

    huoniao.operaJson("businessPrinterList.php?dopost=getList&action="+action+"&type="+atype, data.join("&"), function(val){
        var obj = $("#list"), list = [], i = 0, adList = val.adList;
        if(val.state == "100"){
            huoniao.hideTip();

            obj.attr("data-totalpage", val.pageInfo.totalPage);

            for(i; i < adList.length; i++){

                list.push('<tr data-id="'+adList[i].id+'" data-title="'+adList[i].title+'">');
                list.push('  <td class="row3">'+(userType != 3 ? '<span class="check"></span>' : '')+'</td>');
                list.push('  <td class="row25 left">'+adList[i].title+'</td>');
                list.push('  <td class="row25 left">'+adList[i].nickname+'</td>');
                list.push('  <td class="row10 left">'+adList[i].type+'</td>');
                list.push('  <td class="row12 left">'+adList[i].mcode+'</td>');
                list.push('  <td class="row13 left">'+adList[i].dateArr[0]+' '+adList[i].dateArr[1]+'</td>');
                list.push('  <td class="row12"><a data-id="'+adList[i].id+'" data-title="'+adList[i].title+'" href="businessPrinterAdd.php?dopost=edit&action='+action+'&id='+adList[i].id+'&type='+atype+'" title="修改" class="edit">修改</a><a href="javascript:;" title="删除" class="del">删除</a></td>');

                list.push('</tr>');
            }

            obj.find("tbody").html(list.join(""));
            $("#loading").hide();
            $("#list table").show();

            $("#list .copy").each(function(){
                var t = $(this), id = t.data("id"), type = t.data("type"), tit = t.data("title");

                var clipboardShare = new ClipboardJS('.btn_copy'+id);
                clipboardShare.on('success', function(e) {
                    huoniao.showTip("success", "复制成功", "auto");
                });

                clipboardShare.on('error', function(e) {
                    huoniao.showTip("error", "复制失败", "auto");
                });
            });

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
