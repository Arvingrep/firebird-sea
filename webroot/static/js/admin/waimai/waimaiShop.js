
$(function(){

    // $(".chosen-select").chosen();
	//填充分站列表
	huoniao.choseCity($(".choseCity"),$("#cityid"),$("#searchf"));  //城市分站选择初始化
	

    //筛选需要审核的价格
    $('.reviewPrice').bind('click', function(){
        var t = $(this), _id = parseInt(t.attr('data-id'));
        if(_id == 0){
            $('#reviewPrice').val(1);
        }else{
            $('#reviewPrice').val(0);
        }
        t.closest('form').submit();
    });
    
	
    //下拉选择控件
    $(".chosen-select").chosen().change(function() {
        $('#searchf').submit();
    })

    //新增店铺
    $("#addNew").bind("click", function(){
        var href = $(this).attr("href");
		try {
			event.preventDefault();
			parent.addPage("waimaiShopAdd", "waimai", "新增店铺", "waimai/"+href);
		} catch(e) {}
    });

    //店铺回收站
    $("#recycle").bind("click", function(){
        var href = $(this).attr("href");
        try {
            event.preventDefault();
            parent.addPage("waimaiShopDel", "waimai", "店铺回收站", "waimai/waimaiShop.php?del=1");
        } catch(e) {}
        // location.href = '?del=1';
    });

    //从回收站恢复店铺
    $(".recycleback").bind("click", function(){
        var t = $(this), tr = t.closest("tr"), id = t.data("id");

        $.dialog.confirm("确定要从回收站恢复该店铺吗？", function(){
            $.ajax({
                url: "waimaiShop.php",
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

    $(".synshop").bind("click",function () {

        var t = $(this), tr = t.closest("tr"), id = t.data("id");

        $.dialog.confirm("确认要同步第三方跑腿店铺吗？", function(){
            $.ajax({
                url: "waimaiShop.php",
                type: "post",
                data: {action: "ynchronize", id: id},
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
    })

	//彻底删除店铺
    $(".destory").bind("click", function () {
        var t = $(this), id = t.data("id");
        $.dialog.confirm("确定要彻底删除该店铺吗？", function(){
            $.ajax({
                url: "waimaiShop.php",
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
                    $.dialog.alert("网络错误，保存失败！");
                }
            })
        })
    });
  
    //同步店铺
    $("#syncShop").bind("click", function(){
        var href = $(this).attr("href");

        try {
            event.preventDefault();
            parent.addPage("waimaiShopSync", "waimai", "同步店铺", "waimai/"+href);
        } catch(e) {}
    });

    //商品管理
    $(".food").bind("click", function(){
        var href = $(this).attr("href"), id = $(this).data("id"), shopname = $(this).data("shopname");

		try {
			event.preventDefault();
			parent.addPage("waimaiShopFood" + id, "waimai", "商品-"+shopname, "waimai/"+href);
		} catch(e) {}
    });

    //商品分类管理
    $(".foodtype").bind("click", function(){
        var href = $(this).attr("href"), id = $(this).data("id"), shopname = $(this).data("shopname");

		try {
			event.preventDefault();
			parent.addPage("waimaiShopFoodType" + id, "waimai", "商品分类-"+shopname, "waimai/"+href);
		} catch(e) {}
    });

    //修改店铺
    $(".edit").bind("click", function(){
        var href = $(this).attr("href"), id = $(this).data("id"), shopname = $(this).data("shopname");

		try {
			event.preventDefault();
			parent.addPage("waimaiShopEdit" + id, "waimai", "修改店铺-"+shopname, "waimai/"+href);
		} catch(e) {}
    });



    //店铺状态
    $(".statusSwitch input").bind("click", function(){
        var input = $(this), id = input.data("id"), val = input.is(":checked") ? 1 : 0;

        $.ajax({
            url: "waimaiShop.php",
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

    //下单状态
    $(".orderValidSwitch input").bind("click", function(){
        var input = $(this), id = input.data("id"), val = input.is(":checked") ? 1 : 0;

        var des = '';
        if(val == 0){
            des = prompt('请填写暂停营业原因');
            if(des == ''){
                $.dialog.alert('操作已取消');
                return false;
            }
        }

        $.ajax({
            url: "waimaiShop.php",
            type: "post",
            data: {action: "updateValid", id: id, val: val, des: des},
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

    //下单状态
    $(".reservestatusSwitch input").bind("click", function(){
        var input = $(this), id = input.data("id"), val = input.is(":checked") ? 1 : 0;
        $.ajax({
            url: "waimaiShop.php",
            type: "post",
            data: {action: "updateReservestatus", id: id, val: val},
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

    // 一键操作
    $(".updateState").click(function(){
        var val = $(this).attr("data-state");

        var des = '';
        if(val == 0){
            des = prompt('请填写暂停营业原因');
            if(des == ''){
                $.dialog.alert('操作已取消');
                return false;
            }
        }
        
        $.ajax({
            url: "waimaiShop.php",
            type: "post",
            data: {action: "updateValid", id: 'all', val: val, des: des},
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


    // 店铺管理页面中店铺连接查看,二维码查看
    $('.shopurl').click(function(){
      var t = $(this), url = t.closest("tr").data("url");
      $(".seeurl").html(url);
      if ($('.meng').hasClass('aa')) {
        $('.meng').removeClass('aa');
        $('.disk').hide();
      }else{
        $('.meng').addClass('aa');
        $('.disk').show();
      };
    })
    $('.order_true').click(function(){
      $('.meng').addClass('aa');
    })


    $('.shopticket').click(function(){
      var t = $(this), url = t.closest("tr").data("url");
      $("#seeticket").html('<img src="/include/qrcode.php?data='+url+'" />');
      if ($('.feng').hasClass('aa')) {
        $('.feng').removeClass('aa');
        $('.disk').hide();
      }else{
        $('.feng').addClass('aa');
        $('.disk').show();
      };
    })
    $('.order_true').click(function(){
      $('.feng').addClass('aa');
    })


    //删除
    $(".del").bind("click", function(){
        var t = $(this), tr = t.closest("tr"), id = t.data("id");

        $.dialog.confirm("删除后可在回收站恢复，确认要删除吗？", function(){
            $.ajax({
                url: "waimaiShop.php",
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
            url: "waimaiShop.php",
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
