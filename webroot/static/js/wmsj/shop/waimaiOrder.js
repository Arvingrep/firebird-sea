$(function(){

    $(document).on('click','#order-grid-open_c0_all',function() {
        var checked=this.checked;
        $("input[name='selectorderl\[\]']:enabled").each(function() {this.checked=checked;});
    });
    $(document).on('click', "input[name='selectorderl\[\]']", function() {
        $('#order-grid-open_c0_all').prop('checked', $("input[name='selectorderl\[\]']").length==$("input[name='selectorderl\[\]']:checked").length);
    });


    //下拉选择控件
    $(".chosen-select").chosen();



    /*//查看订单
	$(".orderdetail").bind("click", function(event){
		event.preventDefault();
		var href = $(this).attr("href"), id = $(this).data("id"), num = $(this).data("num");
		try {
			event.preventDefault();
			parent.addPage("waimaiOrderDetail"+id, "waimai", "订单"+num, "waimai/"+href);
		} catch(e) {}
	});*/



    /*//地图派单
	$("#map").bind("click", function(event){
		event.preventDefault();
		var href = $(this).attr("href");
		try {
			event.preventDefault();
			parent.addPage("waimaiMapAssign", "waimai", "地图派单", "waimai/"+href);
		} catch(e) {}
	});*/



    //确认订单
    $("#confirmObj").bind("click", function(){
        var data = new Array();
        $("input[name='selectorderl\[\]']:enabled").each(function (){
            if(this.checked == true){
                data.push(this.value);
            }
        });
        if(data.length > 0){

            $.dialog.confirm(langData['waimai'][6][138], function(){
                $.ajax({
                    url: "waimaiOrder.php",
                    type: "post",
                    data: {action: "confirm", id: data.join(",")},
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

        }else{
            $.dialog.alert(langData['waimai'][6][139]);
            return false;
        }
    });



    //成功订单
    $("#okObj").bind("click", function(){
        var data = new Array();
        $("input[name='selectorderl\[\]']:enabled").each(function (){
            if(this.checked == true){
                data.push(this.value);
            }
        });
        if(data.length > 0){

            $.dialog.confirm(langData['waimai'][5][9], function(){
                $.ajax({
                    url: "waimaiOrder.php",
                    type: "post",
                    data: {action: "ok", id: data.join(",")},
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

        }else{
            $.dialog.alert(langData['waimai'][6][139]);
            return false;
        }
    });



    //无效订单
    $("#failedObj").bind("click", function(){
        var data = new Array();
        $("input[name='selectorderl\[\]']:enabled").each(function (){
            if(this.checked == true){
                data.push(this.value);
            }
        });
        if(data.length > 0){

            $.dialog.prompt(langData['waimai'][6][140], function(val){
                $.ajax({
                    url: "waimaiOrder.php",
                    type: "post",
                    data: {action: "failed", id: data.join(","), note: val},
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

        }else{
            $.dialog.alert(langData['waimai'][6][139]);
            return false;
        }
    });



    //打印订单
    $("#printObj").bind("click", function(){
        var data = new Array();
        $("input[name='selectorderl\[\]']:enabled").each(function (){
            if(this.checked == true){
                data.push(this.value);
            }
        });
        if(data.length > 0){

            $.dialog.confirm(langData['waimai'][6][141], function(){
                $.ajax({
                    url: "waimaiOrder.php",
                    type: "post",
                    data: {action: "print", id: data.join(",")},
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

        }else{
            $.dialog.alert(langData['waimai'][6][139]);
            return false;
        }
    });



    //设置配送员
    $("#setCourier").bind("click", function(){
        var data = new Array();
        $("input[name='selectorderl\[\]']:enabled").each(function (){
            if(this.checked == true){
                data.push(this.value);
            }
        });

        var courier_id = $("#courier_id").val();
        if(data.length > 0 && courier_id && courier_id != 0){

            $.dialog.confirm(langData['waimai'][6][143], function(){
                $.ajax({
                    url: "waimaiOrder.php",
                    type: "post",
                    data: {action: "setCourier", id: data.join(","), courier: courier_id},
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

        }else{
            $.dialog.alert(langData['waimai'][6][144]);
            return false;
        }
    });



    //取消配送员
    $("#cancelCourier").bind("click", function(){
        var data = new Array();
        $("input[name='selectorderl\[\]']:enabled").each(function (){
            if(this.checked == true){
                data.push(this.value);
            }
        });

        if(data.length > 0){

            $.dialog.confirm(langData['waimai'][6][145], function(){
                $.ajax({
                    url: "waimaiOrder.php",
                    type: "post",
                    data: {action: "cancelCourier", id: data.join(",")},
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

        }else{
            $.dialog.alert(langData['waimai'][6][144]);
            return false;
        }
    });

    // 退款
    $("#list .refund").click(function(){
        var t = $(this), id = t.closest('tr').attr('data-id');
        if(t.hasClass('disabled')) return;
        $.dialog.confirm(langData['waimai'][6][146], function(){
            huoniao.showTip("loading", langData['siteConfig'][7][8]);
            $.ajax({
                url: 'waimaiOrder.php?action=refund&id='+id,
                type: 'post',
                dataType: 'json',
                success: function(data){
                    if(data && data.state == 100){
                        huoniao.showTip("success", langData['siteConfig'][20][244], "auto");
                        $('.refrundState').html('<div class="refundYes">'+langData['siteConfig'][9][30]+'</div>');
                        t.remove();
                    }else{
                        huoniao.showTip("error", data.info, "auto");
                        $.dialog.alert(data.info);
                        t.removeClass('disabled');
                    }
                },
                error: function(){
                    huoniao.showTip("error", langData['waimai'][4][11], "auto");
                    t.removeClass('disabled');
                    $.dialog.alert(langData['waimai'][4][11]);
                }
            })
        })
    })



});
