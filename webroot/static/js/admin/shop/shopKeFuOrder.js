$(function(){

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
                        id.push($("#list tbody tr.selected:eq("+i+")").attr("data-orderid"));
                    }

                    huoniao.operaJson("shopKeFuOrder.php?dopost=del", "id="+id, function(data){
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
                            $.dialog.alert("<div class='errInfo'><strong>以下信息删除失败：</strong><br />" + info.join("<br />") + '</div>', function(){
                                getList();
                            });
                        }
                    });
                    $("#selectBtn a:eq(1)").click();
                }
            }
            //快速编辑
            ,quickEdit: function(){
                var checked = $("#list tbody tr.selected");
                if(checked.length < 1){
                    huoniao.showTip("warning", "未选中任何信息！", "auto");
                }else{
                    id = checked.attr("data-id");
                    orderid = checked.attr("data-orderid");
                    huoniao.showTip("loading", "正在获取信息，请稍候...");

                    huoniao.operaJson("shopKeFuOrder.php?dopost=getDetail", "id="+id, function(data){
                        if(data != null && data.length > 0){
                            data = data[0];
                            huoniao.hideTip();
                            //huoniao.showTip("success", "获取成功！", "auto");
                            $.dialog({
                                fixed: true,
                                title: '快速编辑',
                                content: $("#quickEdit").html(),
                                width: 870,
                                // height:'80%',
                                ok: function(){
                                    //提交
                                    var serialize = self.parent.$(".quick-editForm").serialize();
                                    serialize = serialize;

                                    huoniao.operaJson("shopKeFuOrder.php?dopost=refund", "tuikuantype=1&id="+id+"&orderid="+orderid+"&"+serialize, function(data){
                                        if(data.state == 100){
                                            huoniao.showTip("success", data.info, "auto");
                                            setTimeout(function() {
                                                getList();
                                            }, 800);
                                        }else if(data.state == 101){
                                            alert(data.info);
                                            return false;
                                        }else{
                                            huoniao.showTip("error", data.info, "auto");
                                            //getList();
                                        }
                                    });

                                },
                                cancel: true
                            });

                            //填充信息
                            self.parent.$("#store").html(data.user_exptypename);
                            self.parent.$("#user").html(data.ret_datetime);
                            self.parent.$("#applyer_mobile").html(data.mobile);
                            self.parent.$("#applyer").html(data.name);
                            self.parent.$("#price").html('￥' + data.price);

                            // 退款凭证
                            var imgArr = []; //退款凭证
                            var imgsArr = []; //申请客服介入的图片
                            if(data.pic && data.pic.length > 0){
                                var picsArr = data.pic;
                                imgArr.push('<div class="imgsbox" style="overflow:hidden;">')
                                for(var i = 0; i < picsArr.length; i++){
                                    imgArr.push('<a class="imgs" href="'+picsArr[i]+'" target="_blank" style="float:left; width:100px; height:100px; cursor:pointer; margin-right:6px; margin-bottom:6px;"><img  style="float:left; width:100px; height:100px; object-fit:cover;" src="'+picsArr[i]+'" /></a>')
                                }
                                imgArr.push('</div>');
                                // self.parent.$("#pic").html(imgArr.join("")); 
                            }


                            // 图片遍历
                            if(data.pics && data.pics.length > 0){
                                var picsArr = data.pics;
                                imgsArr.push('<div class="imgsbox" style="overflow:hidden;">')
                                for(var i = 0; i < picsArr.length; i++){
                                    imgsArr.push('<a class="imgs" href="'+picsArr[i]+'" target="_blank" style="float:left; width:100px; height:100px; cursor:pointer; margin-right:6px; margin-bottom:6px;"><img  style="float:left; width:100px; height:100px; object-fit:cover;" src="'+picsArr[i]+'" /></a>')
                                }
                                imgsArr.push('</div>');
                               self.parent.$("#pics").html(imgsArr.join("")); 
                            }

                            if(data.ret_negotiate){
                                var negotiate = [];

                                var ret_negotiate = data.ret_negotiate.refundinfo;
                                negotiate.push('<div>');
                                for(var i = 0; i < ret_negotiate.length; i++){
                                    var typetext = ret_negotiate[i].type == 1 ? '商家' :  '买家'
                                    negotiate.push('<div class="line" style="margin-bottom:6px; border-bottom: solid 1px #eee;"><p style="margin-bottom:0;">申请时间：'+huoniao.transTimes(ret_negotiate[i].datetime,1)+'</p><p style="margin-bottom:0;">申请类型：'+ret_negotiate[i].typename+'</p><p>'+typetext+'原因：'+ret_negotiate[i].refundinfo+'</p></div>');
                                }
                                negotiate.push('</div>');
                                negotiate = imgArr.concat(negotiate)
                            }

                            self.parent.$("#negotiate").html(negotiate.join(""));

                        }else{
                            huoniao.showTip("error", "信息获取失败！", "auto");
                        }
                    });
                }

            }

        };

    //填充分站列表
    huoniao.choseCity($(".choseCity"),$("#cityList"));

    $(".chosen-select").chosen();

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
    $("#typeBtn a").bind("click", function(){
        var id = $(this).attr("data-id"), title = $(this).text();
        $("#typeBtn").attr("data-id", id);
        $("#typeBtn button").html(title+'<span class="caret"></span>');
    });

    $("#stateBtn, #pageBtn, #paginationBtn").delegate("a", "click", function(){
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

            $("#addrBtn")
                .attr("data-id", "")
                .find("button").html('全部地区<span class="caret"></span>');

            $("#sAddr").html("");

            if(obj.attr("id") != "propertyBtn"){
                obj.find("button").html(title+'<span class="caret"></span>');
            }
            $("#list").attr("data-atpage", 1);
        }
        getList();
    });

    //下拉菜单过长设置滚动条
    $(".dropdown-toggle").bind("click", function(){
        if($(this).parent().attr("id") != "typeBtn" && $(this).parent().attr("id") != "addrBtn"){
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
            checkedBtn.hide();
        }else{
            $("#selectBtn .check").removeClass("checked");
            $("#list tr").removeClass("selected");

            defaultBtn.hide();
            checkedBtn.show();
        }
    });

    //修改
    $("#list").delegate(".edit", "click", function(event){
        var id = $(this).attr("data-id"),
            title = $(this).attr("data-title"),
            href = $(this).attr("href");
        try {
            event.preventDefault();
            parent.addPage("edithomemakingorder"+id, "homemaking", title, "homemaking/"+href);
        } catch(e) {}
    });

    //付款
    $("#list").delegate(".payment", "click", function(){
        var id = $(this).attr("data-id");
        if(id != ""){
            $.dialog.confirm('此操作不可恢复，您确定要付款吗？', function(){
                huoniao.showTip("loading", "正在操作，请稍候...");
                huoniao.operaJson("shopKeFuOrder.php?dopost=payment", "id="+id, function(data){
                    if(data.state == 100){
                        huoniao.showTip("success", data.info, "auto");
                        setTimeout(function() {
                            getList();
                        }, 800);
                    }else{
                        huoniao.showTip("error", data.info, "auto");
                    }
                });
                $("#selectBtn a:eq(1)").click();
            });
        }
    });

    //退款
    $("#list").delegate(".refund", "click", function(){
        var id = $(this).attr("data-id");
        if(id != ""){
            $.dialog.confirm('此操作不可恢复，您确定要退款吗？', function(){
                huoniao.showTip("loading", "正在操作，请稍候...");
                huoniao.operaJson("shopKeFuOrder.php?dopost=refund", "id="+id, function(data){
                    if(data.state == 100){
                        huoniao.showTip("success", data.info, "auto");
                        setTimeout(function() {
                            getList();
                        }, 800);
                    }else{
                        huoniao.showTip("error", data.info, "auto");
                    }
                });
                $("#selectBtn a:eq(1)").click();
            });
        }
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

    //详情、修改
    $("#list").delegate(".ptjieru", "click", function(e){
        var t = $(this);
        t.closest('tr').addClass('selected')
        init.quickEdit();
        e.stopPropagation()
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
});



//获取列表
function getList(){
    huoniao.showTip("loading", "正在操作，请稍候...");
    $("#list table, #pageInfo").hide();
    $("#selectBtn a:eq(1)").click();
    $("#loading").html("加载中，请稍候...").show();
    var sKeyword = encodeURIComponent($("#sKeyword").html()),
        start    = $("#start").html(),
        end      = $("#end").html(),
        state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
        pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
        page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

    var data = [];
    data.push("sKeyword="+sKeyword);
    data.push("adminCity="+$("#cityList").val());
    data.push("start="+start);
    data.push("end="+end);
    data.push("state="+state);
    data.push("pagestep="+pagestep);
    data.push("page="+page);

    huoniao.operaJson("shopKeFuOrder.php?dopost=getList", data.join("&"), function(val){
        var obj = $("#list"), list = [], i = 0, shopKeFuOrder = val.kefuOrder;
        obj.attr("data-totalpage", val.pageInfo.totalPage);
        $(".totalCount").html(val.pageInfo.totalCount);
        $("#totalPrice").html(val.totalPrice);

        if(val.state == "100"){
            //huoniao.showTip("success", "获取成功！", "auto");
            huoniao.hideTip();
            for(i; i < shopKeFuOrder.length; i++){
                list.push('<tr data-id="'+shopKeFuOrder[i].productid+'" data-orderid="'+shopKeFuOrder[i].orderid+'">');
                list.push('  <td class="row3"><span class="check"></span></td>');
                list.push('  <td class="row10 left">'+shopKeFuOrder[i].ordernum+'</td>');
                list.push('  <td class="row10 left">'+shopKeFuOrder[i].ret_datetime+'</td>');
                list.push('  <td class="row15 left">'+shopKeFuOrder[i].retnote+'</td>');
                var info = '';
                if (shopKeFuOrder[i].ret_ptaudittype == 0){
                    info ='申请退款';
                }else if(shopKeFuOrder[i].ret_ptaudittype == 1){
                    info ='退款成功';
                }else{
                    info = '拒绝退款'
                }
                list.push('  <td class="row10 left">'+info+'</td>');
                list.push('  <td class="row15 left">'+shopKeFuOrder[i].rettype+'</td>');
                list.push('  <td class="row7 left">'+shopKeFuOrder[i].name+'</td>');
                list.push('  <td class="row10 left">'+shopKeFuOrder[i].mobile+'</td>');
                var ptjieru = '';
                if (shopKeFuOrder[i].user_refundtype == 2) {
                    ptjieru = '<a href="javascript:;" data-id="'+shopKeFuOrder[i].id+'" class="ptjieru"><code>用户申请平台介入</code></a>';
                }
                list.push('  <td class="row10 left"> '+ptjieru+' </td>');

                list.push('  <td class="row5 left">&yen;'+shopKeFuOrder[i].price+'</td>');

                var btn = "";

                list.push('  <td class="row5"><a href="javascript:;" title="删除" class="del">删除</a>'+btn+'</td>');
            }

            obj.find("tbody").html(list.join(""));
            $("#loading").hide();
            $("#list table").show();
            huoniao.showPageInfo();
        }else{

            obj.find("tbody").html("");
            huoniao.showTip("warning", val.info, "auto");
            $("#loading").html(val.info).show();
        }
    });

};