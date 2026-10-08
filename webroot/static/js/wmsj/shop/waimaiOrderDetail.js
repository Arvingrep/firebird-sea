$(function(){

    //确认订单
    $("#confirmObj").bind("click", function(){

        $.dialog.confirm(langData['waimai'][6][138], function(){
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
                    $.dialog.alert(langData['waimai'][4][11]);
                }
            })
        })
        return false;

    });



    //成功订单
    $("#okObj").bind("click", function(){

        $.dialog.confirm(langData['waimai'][5][9], function(){
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
                    $.dialog.alert(langData['waimai'][4][11]);
                }
            })
        })
        return false;

    });



    //无效订单
    $("#failedObj").bind("click", function(){

        $.dialog.prompt(langData['waimai'][6][140], function(val){
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
                    $.dialog.alert(langData['waimai'][4][11]);
                }
            })
        })
        return false;

    });



    //打印订单
    $("#printObj").bind("click", function(){

        $.dialog.confirm(langData['waimai'][6][141], function(){
            $.ajax({
                url: "waimaiOrder.php",
                type: "post",
                data: {action: "print", id: id},
                dataType: "json",
                success: function(res){
                    if(res.state != 100){
                        $.dialog.alert(res.info);
                    }else{
                        $.dialog({
        					title: langData['waimai'][6][123],
        					icon: 'success.png',
        					content: langData['waimai'][6][142]
        				});
                    }
                },
                error: function(){
                    $.dialog.alert(langData['waimai'][4][11]);
                }
            })
        })
        return false;

    });



});
