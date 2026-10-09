$(function(){

    // $(".chosen-select").chosen();

    // //下拉选择控件
    // $(".chosen-select").chosen().change(function() {
    //     $('#searchf').submit();
    // })
    //填充分站列表
    huoniao.choseCity($(".choseCity"),$("#cityid"),$("#searchf"));  //城市分站选择初始化

    //修改分成
    $(".edit").bind("click", function(){
        var href = $(this).attr("href"), shopname = $(this).attr("data-shopname");

        try {
            event.preventDefault();
            parent.addPage("waimaiFenchengEdit", "waimai", "修改分成-"+shopname, "waimai/"+href);
        } catch(e) {}
    });

    //店铺链接
    $('.shopname').bind('click', function(){
        var t = $(this), shopname = t.text(), id = t.data('id'), href = t.attr('href');
        try {
            event.preventDefault();
            parent.addPage("shopStoreAdd" + id, "shop", "修改店铺-"+shopname, "shop/"+href);
        } catch(e) {}
    });


    //一键删除
    $("#delprint").bind("click", function(){
        var t = $(this),id = $(this).attr("data-id");
        $.dialog.confirm('此操作不可恢复，您确定要删除吗？', function(){
            t.attr("disabled", true).html("删除中...");
            huoniao.operaJson("?action=delBinding&id="+id+"", "", function(data){
                huoniao.showTip("success", "操作成功！", "auto");
                t.attr("disabled", false).html("一键删除待审核");
                setTimeout(function() {
                    getList();
                }, 800);
            });
        });
    });

    // 绑定打印机
    $('body').delegate('.bindPrint','click',function(){
        var t = $(this), tr = t.closest('tr'), id = tr.attr('data-id');
        $.ajax({
            url: "?action=printList&id="+id,
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data.state == 100){
                    var list = data.pageInfo.printList;
                    var html = [];
                    var num = 0;
                    for(var i = 0; i < list.length; i++){
                        if(!list[i].state){
                            html.push('<tr data-id="'+list[i].id+'"><td class="row3"><input type="checkbox"></td><td class="row20">'+list[i].title+'</td></tr>')
                            num++;
                        }
                    }
                    if(num){
                        $('#printList tbody').html(html.join());
                    }else{
                        $('#printList tbody').html('<tr><td colspan="2" style="text-align:center; line-height:100px;">暂无要绑定的打印机</td></tr>')
                    }

                    $.dialog({
                        id: 'showDetail',
                        title: '选择打印机',
                        lock: true,
                        content: '<div class="printList" style="overflow:auto; max-height:400px;">'+$('#printList').html()+'</div>',
                        padding: 0,
                        width:500,
                        button:[
                            {
                                name:'绑定',
                                callback:function(){

                                    var idArr = [];
                                    self.parent.$(".printList tbody tr").each(function(){
                                        var item = $(this);
                                        if(item.find('input[type="checkbox"]:checked').length){
                                            idArr.push(item.attr('data-id'))
                                        }
                                    });

                                    if(idArr.length > 0){
                                        $.ajax({
                                            url: "?action=printBinding&sid="+id+"&id="+idArr.join(','),
                                            type: "POST",
                                            dataType: "json",
                                            success: function (data) {
                                                if(data.state == 100){
                                                    location.reload();
                                                }
                                            },
                                        })
                                    }else{

                                    }
                                },
                                focus: true
                            },
                        ],
                        cancel: true,
                    });

                }else{
                    $.dialog({
                        title: '提示',
                        content: '该商家未添加打印机，请到商家配置中添加打印机！',
                        icon: 'alert.png',
                        ok: true
                    })
                }



            },
            error: function(data){
                $.dialog.alert(data.info)
            }
        })

    });



    // 删除绑定的打印机
    $('.del_btn').bind('click',function(){
        var t = $(this),li = t.closest('.dropdown'),
            printorId = li.attr('data-id');
        $.dialog.confirm("确定要取消绑定该打印机吗？", function(){
            li.remove();
            $.ajax({
                url: "?action=delBinding&id="+printorId,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if(data.state == 100){
                        li.remove();
                    }else{
                        $.dialog.alert(data.info)
                    }
                },
            })
        });
    })

    //标注地图
    $(".edit_btn").bind("click", function(){
        var t = $(this), pid = t.closest('.dropdown').attr('data-pid'),sid=t.closest('tr').attr('data-id');
        var id = t.closest('.dropdown').attr('data-id')
        $.dialog({
            id: "printTemplatePopup",
            title: "打印机小票DIY自定义",
            content: 'url:'+adminPath+'../include/printTemplate.php?module=waimai&printid='+pid+'&sid='+sid,
            width: 890,
            height: 700,
            button: [
                {
                    name: '确认',
                    callback: function(){
                        var doc = $(window.parent.frames["printTemplatePopup"].document),
                            templateVal = doc.find("#templateVal").val();
                        $("#printTemplate").val(templateVal);
                        $.ajax({
                            url: "?action=editBinding&id="+id+"&print_config="+templateVal,
                            type: "POST",
                            dataType: "json",
                            success: function (data) {
                                if(data.state == 100){
                                    console.log(data.info)
                                }
                            },
                        })
                    },
                    focus: true
                },
                {
                    name: '恢复默认',
                    callback: function(){
                        $("#printTemplate").val('');
                    }
                },
                {
                    name: '取消'
                }
            ]
        });
    });

});
