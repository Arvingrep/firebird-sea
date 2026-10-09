$(function(){

    //新增优惠券
    $("#addNew").bind("click", function(){
        var href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("waimaiQuanAdd", "waimai", "新建优惠券", "waimai/"+href);
		} catch(e) {}
    });

    //修改优惠券
    $(".edit").bind("click", function(){
        var href = $(this).attr("href"), id = $(this).data("id"), name = $(this).data("name");

		try {
			event.preventDefault();
			parent.addPage("waimaiQuanEdit" + id, "waimai", "修改优惠券-"+name, "waimai/"+href);
		} catch(e) {}
    });


    //删除
    $(".del").bind("click", function(){
        var t = $(this), tr = t.closest("tr"), id = t.data("id");

        $.dialog.confirm("确认要删除吗？", function(){
            $.ajax({
                url: "waimaiQuan.php",
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

});
