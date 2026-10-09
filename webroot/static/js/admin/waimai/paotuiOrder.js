$(function(){





	huoniao.choseCity($(".choseCity"),$("#cityid"),$("#search_form"));  //城市分站选择初始化

    $('#waimaiOrder_start_time').datetimepicker($.extend($.datepicker.regional['zh_cn'], {'showSecond':true,'changeMonth':true,'changeYear':true,'tabularLevel':null,'yearRange':'2013:' + new Date().getFullYear(),'minDate':new Date(2013,1,1,00,00,00),'timeFormat':'hh:mm:ss','dateFormat':'yy-mm-dd','timeText':'时间','hourText':'时','minuteText':'分','secondText':'秒','currentText':'当前时间','closeText':'关闭','showOn':'focus','hour':'0','minute':'0','second':'0'}));
    $('#waimaiOrder_end_time').datetimepicker($.extend($.datepicker.regional['zh_cn'], {'showSecond':true,'changeMonth':true,'changeYear':true,'tabularLevel':null,'yearRange':'2013:' + new Date().getFullYear(),'minDate':new Date(2013,1,1,00,00,00),'timeFormat':'hh:mm:ss','dateFormat':'yy-mm-dd','timeText':'时间','hourText':'时','minuteText':'分','secondText':'秒','currentText':'当前时间','closeText':'关闭','showOn':'focus','hour':'23','minute':'59','second':'59'}));



    $(document).on('click','#order-grid-open_c0_all',function() {
        var checked=this.checked;
        $("input[name='selectorderl\[\]']:enabled").each(function() {this.checked=checked;});
    });
    $(document).on('click', "input[name='selectorderl\[\]']", function() {
        $('#order-grid-open_c0_all').prop('checked', $("input[name='selectorderl\[\]']").length==$("input[name='selectorderl\[\]']:checked").length);
    });


    //下拉选择控件
    $(".chosen-select").chosen();

    // //下拉选择控件
    // $(".chosen-select").chosen().change(function() {
    //     location.href = '?state='+state+'&'+$(this).attr('name')+'='+$(this).val();
    // })

    //查看订单
	$(".orderdetail").bind("click", function(event){
		event.preventDefault();
		var href = $(this).attr("href"), id = $(this).data("id"), num = $(this).data("num");
		try {
			event.preventDefault();
			parent.addPage("paotuiOrderDetail"+id, "waimai", "订单"+num, "waimai/"+href);
		} catch(e) {}
	});



    //地图派单
	$("#map").bind("click", function(event){
		event.preventDefault();
		var href = $(this).attr("href");
		try {
			event.preventDefault();
			parent.addPage("waimaiMapAssign", "waimai", "地图派单", "waimai/"+href);
		} catch(e) {}
	});



    //确认订单
    $("#confirmObj").bind("click", function(){
        var data = new Array();
        $("input[name='selectorderl\[\]']:enabled").each(function (){
            if(this.checked == true){
                data.push(this.value);
            }
        });
        if(data.length > 0){

            $.dialog.confirm("是否确认？", function(){
                $.ajax({
                    url: "paotuiOrder.php",
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
                        $.dialog.alert("网络错误，操作失败！");
                    }
                })
            })
            return false;

        }else{
            $.dialog.alert("请选择要操作的订单!");
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

            $.dialog.confirm("是否确认为成功订单？", function(){
                $.ajax({
                    url: "paotuiOrder.php",
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
                        $.dialog.alert("网络错误，操作失败！");
                    }
                })
            })
            return false;

        }else{
            $.dialog.alert("请选择要操作的订单!");
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

            $.dialog.prompt("请输入原因：", function(val){
                $.ajax({
                    url: "paotuiOrder.php",
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
                        $.dialog.alert("网络错误，操作失败！");
                    }
                })
            })
            return false;

        }else{
            $.dialog.alert("请选择要操作的订单!");
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

            $.dialog.confirm("是否打印？", function(){
                $.ajax({
                    url: "paotuiOrder.php",
                    type: "post",
                    data: {action: "print", id: data.join(",")},
                    dataType: "json",
                    success: function(res){
                        if(res.state != 100){
                            $.dialog.alert(res.info);
                        }else{
                            $.dialog({
            					title: '提醒',
            					icon: 'success.png',
            					content: '操作成功！'
            				});
                        }
                    },
                    error: function(){
                        $.dialog.alert("网络错误，操作失败！");
                    }
                })
            })
            return false;

        }else{
            $.dialog.alert("请选择要操作的订单!");
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

            $.dialog.confirm("确定设置？", function(){
                $.ajax({
                    url: "paotuiOrder.php",
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
                        $.dialog.alert("网络错误，操作失败！");
                    }
                })
            })
            return false;

        }else{
            $.dialog.alert("请选择要操作的订单和配送员!");
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

            $.dialog.confirm("确定取消？", function(){
                $.ajax({
                    url: "paotuiOrder.php",
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
                        $.dialog.alert("网络错误，操作失败！");
                    }
                })
            })
            return false;

        }else{
            $.dialog.alert("请选择要操作的订单和配送员!");
            return false;
        }
    });
    
    // 退款
    $("#list .refund").click(function(){
        var t = $(this), id = t.closest('tr').attr('data-id');
        if(t.hasClass('disabled')) return;
        $.dialog.confirm("确定要退款吗？", function(){
            huoniao.showTip("loading", "操作中···");
            $.ajax({
                url: 'paotuiOrder.php?action=refund&id='+id,
                type: 'post',
                dataType: 'json',
                success: function(data){
                    if(data && data.state == 100){
                        huoniao.showTip("success", "操作成功", "auto");
                        t.closest('tr').find('.refrundState').html('<div class="refundYes">已退款</div>');
                        t.remove();
                    }else{
                        huoniao.showTip("error", data.info, "auto");
                        $.dialog.alert(data.info);
                        t.removeClass('disabled');
                    }
                },
                error: function(){
                    huoniao.showTip("error", "网络错误，操作失败！", "auto");
                    t.removeClass('disabled');
                    $.dialog.alert('网络错误，操作失败！');
                }
            })
        })
    })

});
