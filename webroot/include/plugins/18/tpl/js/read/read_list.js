$(function (){

    $("#addNew").bind("click", function(event){
        try {
            event.preventDefault();
            var href = $(this).attr("href");
            parent.addPage("sitePlugin18_read_add", "plugins", "新增虚拟阅读量任务", "../include/plugins/18/" + href);
        } catch(e) {}
    });

    var defaultBtn = $("#openBtn, #closeBtn, #delBtn"),
        checkedBtn = $("#moduleBtn, #addNew, #deleteRepeat"),
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

        };

    //单选
    $("#list tbody").delegate("tr", "click", function(event){
        var isCheck = $(this), checkLength = $("#list tbody tr.selected").length;
        if(event.target.className.indexOf("check") > -1) {
            if(isCheck.hasClass("selected")){
                isCheck.removeClass("selected");
            }else{
                isCheck.addClass("selected");
            }
        }else if(event.target.className.indexOf("edit") > -1 || event.target.className.indexOf("run") > -1 || event.target.className.indexOf("del") > -1 || event.target.className.indexOf("link") > -1) {
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
            checkedBtn.hide();
        }else{
            $("#selectBtn .check").removeClass("checked");
            $("#list tr").removeClass("selected");

            defaultBtn.hide();
            checkedBtn.show();
        }
    });

    // 删除选中
    $("#delBtn").bind("click", function(){
        $.dialog.confirm('确定要删除吗？', function(){
            var checked = $("#list tbody tr.selected");
            if(checked.length < 1){
                huoniao.showTip('error', '请选择要操作的任务', "auto");
            }else{
                var id = [];
                for(var i = 0; i < checked.length; i++){
                    id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
                }
                $.post("ajax.php?action=read_del","tids="+id.join(","),function (res){
                    if(res.errno==0){
                        huoniao.showTip('success', '删除成功', "auto");
                        setTimeout(function(){
                            location.reload();
                        }, 500);
                    }else{
                        huoniao.showTip('error', '删除失败');
                    }
                },"json");
            }
        });
    });

    // 全部打开
    $("#openBtn").bind("click", function(){
        $.dialog.confirm('确定要启用吗？', function(){
            var checked = $("#list tbody tr.selected");
            if(checked.length < 1){
                huoniao.showTip('error', '请选择要操作的任务', "auto");
            }else{
                var id = [];
                for(var i = 0; i < checked.length; i++){
                    id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
                }
                $.post("ajax.php?action=read_changeState","tids="+id.join(",")+"&state=1",function (res){
                    if(res.errno==0){
                        huoniao.showTip('success', '操作成功', "auto");
                        setTimeout(function(){
                            location.reload();
                        }, 500);
                    }else{
                        huoniao.showTip('error', '操作失败');
                    }
                },"json");
            }
        });
    });

    // 全部关闭
    $("#closeBtn").bind("click", function(){
        $.dialog.confirm('确定要停用吗？', function(){
            var checked = $("#list tbody tr.selected");
            if(checked.length < 1){
                message("未选中数据","error");
            }else{
                var id = [];
                for(var i = 0; i < checked.length; i++){
                    id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
                }
                $.post("ajax.php?action=read_changeState","tids="+id.join(",")+"&state=0",function (res){
                    if(res.errno==0){
                        huoniao.showTip('success', '操作成功', "auto");
                        setTimeout(function(){
                            location.reload();
                        }, 500);
                    }else{
                        huoniao.showTip('error', '操作失败');
                    }
                },"json");
            }
        });
    });


    //变更状态
    $("#list").delegate(".changeState", "click", function(){
        let state = $(this).attr("state");
        let tid   =$(this).closest('tr').attr("data-id");
        let changeText = state==1?"停用":"开启";  // 转换操作
        let changeState;
        if(state == 1){
            changeState = 0;
        }else{
            changeState = 1;
        }
        $.dialog.confirm('确定要'+changeText+'吗？', function(){
            $.post("ajax.php?action=read_changeState",{"tids":tid,"state":changeState},function (res){
                if(res.errno==0){
                    huoniao.showTip('success', changeText+"成功", "auto");
                    setTimeout(function(){
                        location.reload();
                    }, 500);
                }else{
                    huoniao.showTip('error', changeText+'失败');
                }
            },"json");
        });
    });


    //删除任务
    $("#list").delegate(".del", "click", function(){
        let tid   =$(this).closest('tr').attr("data-id");
        $.dialog.confirm('确定要删除吗？', function(){
            $.post("ajax.php?action=read_del",{"tids":tid},function (res){
                if(res.errno==0){
                    huoniao.showTip('success', "删除成功", "auto");
                    setTimeout(function(){
                        location.reload();
                    }, 500);
                }else{
                    huoniao.showTip('error', '删除失败');
                }
            },"json");
        });
    });


    //手动执行
    $("#list").delegate(".run", "click", function(){
        let tid   =$(this).closest('tr').attr("data-id");
        $.dialog.confirm('确定要执行吗？', function(){
            $.post("ajax.php?action=read_runTask",{"tid":tid},function (res){
                if(res.errno==0){
                    huoniao.showTip('success', "执行成功", "auto");
                    setTimeout(function(){
                        location.reload();
                    }, 500);
                }else{
                    huoniao.showTip('error', '执行失败');
                }
            },"json");
        });
    });


    //修改任务
    $("#list").delegate(".edit", "click", function(){
        let tid   =$(this).closest('tr').attr("data-id");
        try {
            event.preventDefault();
            var href = $(this).attr("href");
            parent.addPage("sitePlugin18_read_edit_"+tid, "plugins", "修改虚拟阅读量任务", "../include/plugins/18/" + href);
        } catch(e) {}
    });

})