$(function(){

    //分类状态
    $(".statusSwitch input").bind("click", function(){
        var input = $(this), id = input.data("id"), val = input.is(":checked") ? 1 : 0;
        $.ajax({
            url: "waimaiFoodType.php",
            type: "post",
            data: {action: "updateStatus", id: id, val: val},
            dataType: "json",
            success: function(res){
                if(res.state != 100){
                    $.dialog.alert(res.info);
                }
            },
            error: function(){
                $.dialog.alert("网络错误，保存失败！");
            }
        })
    });

    //分类回收站
    $("#recycle").bind("click", function(){
        var href = $(this).attr("data-href");
        try {
            event.preventDefault();
            parent.addPage("waimaiFoodTypeDel", "waimai", "商品分类回收站-"+shopname, "waimai/"+href);
        } catch(e) {}
        // location.href = '?del=1';
    });

    //微信下单状态
    $(".weekShowSwitch input").bind("click", function(){
        var input = $(this), id = input.data("id"), val = input.is(":checked") ? 1 : 0;
        $.ajax({
            url: "waimaiFoodType.php",
            type: "post",
            data: {action: "updateWeekShow", id: id, val: val},
            dataType: "json",
            success: function(res){
                if(res.state != 100){
                    $.dialog.alert(res.info);
                }
            },
            error: function(){
                $.dialog.alert("网络错误，保存失败！");
            }
        })
    });


    //删除
    $(".del").bind("click", function(){
        var t = $(this), tr = t.closest("tr"), id = t.data("id");

        $.dialog.confirm("删除后可在回收站恢复，确认要删除吗？", function(){
            $.ajax({
                url: "waimaiFoodType.php",
                type: "post",
                data: {action: "delete", id: id},
                dataType: "json",
                success: function(res){
                    if(res.state != 100){
                        $.dialog.alert(res.info);
                    }else{
                        location.reload();
                    }
                },
                error: function(){
                    $.dialog.alert("网络错误，保存失败！");
                }
            })
        })

    });

    //从回收站恢复分类
    $(".recycleback").bind("click", function(){
        var t = $(this), tr = t.closest("tr"), id = t.data("id");

        $.dialog.confirm("确定要从回收站恢复该分类吗？", function(){
            $.ajax({
                url: "waimaiFoodType.php",
                type: "post",
                data: {action: "recycleback", id: id},
                dataType: "json",
                success: function(res){
                    if(res.state != 100){
                        $.dialog.alert(res.info);
                    }else{
                        location.reload();
                    }
                },
                error: function(){
                    $.dialog.alert("网络错误，保存失败！");
                }
            })
        })
    });
    //从回收站彻底删除分类
    $(".destory").bind("click", function(){
        var t = $(this), tr = t.closest("tr"), id = t.data("id");

        $.dialog.confirm("确定要从回收站删除该分类吗？", function(){
            $.ajax({
                url: "waimaiFoodType.php",
                type: "post",
                data: {action: "destory", id: id},
                dataType: "json",
                success: function(res){
                    if(res.state != 100){
                        $.dialog.alert(res.info);
                    }else{
                        location.reload();
                    }
                },
                error: function(){
                    $.dialog.alert("网络错误，删除失败！");
                }
            })
        })
    });
    // 快速编辑
    $(".fastedit").blur(function(){
        var t = $(this), id = t.closest("tr").attr("data-id"), val = $.trim(t.text()), val_ = $.trim(t.attr("data-val")), type = $.trim(t.attr("class").replace("fastedit", ""));

        if(val == "") return;

        if(type == "sort"){
            val = parseInt(val);
            if(isNaN(val)){
                t.text(val_);
                huoniao.showTip("error", "输入错误", "auto");
                return;
            }else{
                t.text(val);
            }
        }

        if(val == val_){
            huoniao.showTip("success", "信息未改变", "auto");
            return;
        }

        $.ajax({
            url: "waimaiFoodType.php",
            type: "post",
            data: {action: "fastedit", id: id, type: type, val: val},
            dataType: "json",
            success: function(res){
                if(res.state == 100){
                    huoniao.showTip("success", "修改成功！", "auto");
                    t.attr("data-val", val);
                }else{
                    t.text(val_);
                    huoniao.showTip("error", res.info, "auto");
                }
            },
            error: function(){
                t.text(val_);
                huoniao.showTip("error", "修改失败！", "auto");
            }
        })
    })

});
