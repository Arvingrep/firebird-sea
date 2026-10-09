$(function(){
	huoniao.choseCity($(".choseCity"),$("#cityid"),$("#search_form"));  //城市分站选择初始化
    $(".chosen-select").chosen();

    //下拉选择控件
    $(".chosen-select").chosen().change(function() {
        location.href = '?'+$(this).attr('name')+'='+$(this).val();
    })

    //新增店铺
    $("#addNew").bind("click", function(){
        var href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("waimaiCourierAdd", "waimai", "新建配送员", "waimai/"+href);
		} catch(e) {}
    });

    //修改配送员
    $(".edit").bind("click", function(){
        var href = $(this).attr("href"), id = $(this).data("id"), name = $(this).data("name");

		try {
			event.preventDefault();
			parent.addPage("waimaiCourierEdit" + id, "waimai", "修改配送员-"+name, "waimai/"+href);
		} catch(e) {}
    });

    $(".statusSwitch input").bind("click", function(){
        var input = $(this), id = input.data("id"), val = input.is(":checked") ? 1 : 0;

        $.ajax({
            url: "waimaiCourier.php",
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


    //查看位置
    $(".location").bind("click", function(){
        var t = $(this), name = t.data("name"), id = t.data("id"), lng = t.data("lng"), lat = t.data("lat");

        $.dialog({
			id: "markDitu",
			title: "配送员（"+name+"）的位置",
			content: 'url:/api/map/mark.php?mod=waimai&lnglat='+lat+","+lng+"&city=&onlyshow=1",
			width: 1000,
			height: 600,
			max: true,
			ok: function(){

			},
			cancel: true
		});
    });


    //删除
    $(".del").bind("click", function(){
        var t = $(this), tr = t.closest("tr"), id = t.data("id");

        $.dialog.confirm("确认要删除吗？", function(){
            $.ajax({
                url: "waimaiCourier.php",
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
