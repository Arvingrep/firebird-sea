$(function(){

    //发放优惠券
    $("#addNew1, #addNew2").bind("click", function(){
        var t = $(this), id = t.attr("id").substr(1), type = t.attr("data-type"), href = t.attr("href");
        var title = type == 'only' ? '发放优惠券' : '全顾客发放优惠券';
		try {
			event.preventDefault();
			parent.addPage("waimaiQuanListA"+id, "waimai", title, "waimai/"+href);
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

        if(t.hasClass('disabled')) return;

        $.dialog.confirm("确认要删除吗？", function(){
            del(t, id);
        })

    });

    // 全选
    $("#list input").click(function(){
        var t = $(this), ischeckall = t.hasClass('checkall'), checked = t.is(':checked');
        if(ischeckall){
            $("#list .ck").prop("checked", checked ? true : false);
        }
    })

    // 批量删除
    $("#del").click(function(){
        var btn = $(this), check = [];
        if(btn.hasClass("disabled")) return;

        $("#list tbody tr").each(function(){
            var t = $(this), id = t.attr('data-id'), checked = t.find('.ck').is(':checked');
            if(checked){
                check.push(id);
            }
        })
        if(check.length == 0){
            $.dialog.alert("您没有选择任何优惠券");
            return;
        }

        $.dialog.confirm("确认要删除吗？", function(){

            

            del(btn, check.join(","));

        })

    })

    function del(btn, id){

        btn.addClass('disabled');

        $.ajax({
            url: 'waimaiQuanList.php?action=delete',
            data: 'id='+id,
            type: 'post',
            dataType: 'json',
            success: function(res){

                if(res.state != 100){
                    $.dialog.alert(res.info);
                    btn.removeClass('disabled');
                }else{
                    huoniao.showTip("success", res.info, "auto");
                    var g = id.toString().split(',');
                    for(var i = 0; i < g.length; i++){
                        $('#list tr[data-id='+g[i]+']').remove();
                    }
                    // location.reload();
                }
            },
            error: function(){
                $.dialog.alert("网络错误，保存失败！");
            }
        })
    }


});
