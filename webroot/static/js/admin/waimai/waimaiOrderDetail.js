$(function(){

    //确认订单
    $("#confirmObj").bind("click", function(){

        $.dialog.confirm("是否确认？", function(){
            $.ajax({
                url: "waimaiOrder.php",
                type: "post",
                data: {action: "confirm", id: id},
                dataType: "json",
                success: function(res){
                    if(res.state != 100){
                        $.dialog.alert(res.info);
                    }else{
                        location.reload();
                    }
                },
                error: function(){
                    $.dialog.alert("网络错误，操作失败！");
                }
            })
        })
        return false;

    });

	//店铺链接
	$('.shopname').bind('click', function(){
		var t = $(this), shopname = t.data('title'), sid = t.data('id'), href = t.attr('href');
		try {
			event.preventDefault();
			parent.addPage("waimaiShopEdit" + sid, "waimai", "修改店铺-"+shopname, "waimai/"+href);
		} catch(e) {}
	});


    //确认赔付
    $("#confirmpf").bind("click",function(){
        var cptype = $("#cptype").val();
         $.dialog.confirm("是否确认？", function(){
            $.ajax({
                url: "waimaiOrder.php",
                type: "post",
                data: {action: "peifu", id: id,cptype:cptype},
                dataType: "json",
                success: function(res){
                    if(res.state != 100){
                        $.dialog.alert(res.info);
                    }else{
                        location.reload();
                    }
                },
                error: function(){
                    $.dialog.alert("网络错误，操作失败！");
                }
            })
        })
        return false;

    });

    //成功订单
    $("#okObj").bind("click", function(){

        $.dialog.confirm("是否确认为成功订单？", function(){
            $.ajax({
                url: "waimaiOrder.php",
                type: "post",
                data: {action: "ok", id: id},
                dataType: "json",
                success: function(res){
                    if(res.state != 100){
                        $.dialog.alert(res.info);
                    }else{
                        location.reload();
                    }
                },
                error: function(){
                    $.dialog.alert("网络错误，操作失败！");
                }
            })
        })
        return false;

    });



    //无效订单
    $("#failedObj").bind("click", function(){

        $.dialog.prompt("请输入原因：", function(val){
            $.ajax({
                url: "waimaiOrder.php",
                type: "post",
                data: {action: "failed", id: id, note: val},
                dataType: "json",
                success: function(res){
                    if(res.state != 100){
                        $.dialog.alert(res.info);
                    }else{
                        location.reload();
                    }
                },
                error: function(){
                    $.dialog.alert("网络错误，操作失败！");
                }
            })
        })
        return false;

    });



    //打印订单
    $("#printObj").bind("click", function(){

        $.dialog.confirm("是否打印？", function(){
            $.ajax({
                url: "waimaiOrder.php",
                type: "post",
                data: {action: "print", id: id},
                dataType: "json",
                success: function(res){
                    if(res.state != 100){
                        $.dialog.alert(res.info);
                    }else{
						$.dialog.tips('打印成功',1,'success.png');
                    }
                },
                error: function(){
                    $.dialog.alert("网络错误，操作失败！");
                }
            })
        })
        return false;

    });



});
