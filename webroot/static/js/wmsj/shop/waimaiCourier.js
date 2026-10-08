$(function(){

    //新增店铺
    $("#addNew").bind("click", function(){
        var href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("waimaiCourierAdd", "waimai", langData['waimai'][6][120], "waimai/"+href);
		} catch(e) {}
    });

    //修改配送员
    $(".edit").bind("click", function(){
        var href = $(this).attr("href"), id = $(this).data("id"), name = $(this).data("name");

		try {
			event.preventDefault();
			parent.addPage("waimaiCourierEdit" + id, "waimai", langData['waimai'][6][121]+"-"+name, "waimai/"+href);
		} catch(e) {}
    });


    //查看位置
    $(".location").bind("click", function(){
        var t = $(this), name = t.data("name"), id = t.data("id"), lng = t.data("lng"), lat = t.data("lat");

        $.dialog({
			id: "markDitu",
			title: langData['waimai'][6][122].replace('1', name),
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

        $.dialog.confirm(langData['siteConfig'][20][211], function(){
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
                    $.dialog.alert(langData['siteConfig'][20][253]);
                }
            })
        })

    });

});
