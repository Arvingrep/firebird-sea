$(function(){

    //新增优惠券
    $("#addNew").bind("click", function(){
        var href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("shopQuanAdd", "shop", "新建优惠券", "shop/"+href);
		} catch(e) {}
    });

    //修改优惠券
    $(".edit").bind("click", function(){
        var href = $(this).attr("href"), id = $(this).data("id"), name = $(this).data("name");

		try {
			event.preventDefault();
			parent.addPage("shopQuanEdit" + id, "shop", "修改优惠券-"+name, "shop/"+href);
		} catch(e) {}
    });


    //删除
    $(".del").bind("click", function(){
        var t = $(this), tr = t.closest("tr"), id = t.data("id");

        $.dialog.confirm("确认要删除吗？", function(){
            $.ajax({
                url: "shopQuan.php",
                type: "post",
                data: {action: "delete", id: id},
                dataType: "json",
                success: function(res){
                    if(res.state != 100){
                        $.dialog.alert(res.info);
                    }else{
                        // location.reload();
                    }
                },
                error: function(){
                    $.dialog.alert("网络错误，保存失败！");
                }
            })
        })

    });

    $(".hot").click(function(){
        var t = $(this), id = t.attr("data-id"), state = t.is(":checked") ? 1 : 0;

        huoniao.operaJson("shopQuan.php?dopost=hot", "id="+id+"&state="+state, function(data){
            if(data.state != 100){
                huoniao.showTip("error", data.info, "auto");
            }else{
                huoniao.showTip("success", data.info, "auto");
            }
        });
    })

});
