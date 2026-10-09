$(function(){

    var defaultBtn = $("#delBtn"),
        init = {

            //选中样式切换
            funTrStyle: function(){
                var trLength = $("#list .item").length, checkLength = $("#list .selected").length;
                if(trLength == checkLength){
                    $("#selectBtn .check").removeClass("checked").addClass("checked");
                }else{
                    $("#selectBtn .check").removeClass("checked");
                }

                if(checkLength > 0){
                    defaultBtn.show();
                }else{
                    defaultBtn.hide();
                }
            }

            //删除
            ,del: function(){
                var checked = $("#list .selected");
                if(checked.length < 1){
                    huoniao.showTip("warning", "未选中任何信息！", "auto");
                }else{
                    huoniao.showTip("loading", "正在操作，请稍候...");
                    var id = [];
                    for(var i = 0; i < checked.length; i++){
                        id.push($("#list .selected:eq("+i+")").attr("data-qq"));
                    }

                    huoniao.operaJson("ajax.php?action=del", "qq="+id, function(data){
                        if(data.errno == 0){
                            huoniao.showTip('success', data.errmsg, "auto");
                            setTimeout(function(){
                                location.reload();
                            }, 500);
                        }else{
                            huoniao.showTip('error', data.errmsg);
                        }
                    });
                }
            }

        };

    $("#pageBtn, #paginationBtn").delegate("a", "click", function(){
        var id = $(this).attr("data-id"), title = $(this).html(), obj = $(this).parent().parent().parent();
        obj.attr("data-id", id);
        if(obj.attr("id") == "paginationBtn"){
            var totalPage = $("#list").attr("data-totalpage");
            $("#list").attr("data-atpage", id);
            obj.find("button").html(id+"/"+totalPage+'页<span class="caret"></span>');
            $("#list").attr("data-atpage", id);
        }else{
            $("#list").attr("data-atpage", 1);
        }
        getList();
        
    });

    //下拉菜单过长设置滚动条
    $(".dropdown-toggle").bind("click", function(){
        if($(this).parent().attr("id") != "typeBtn"){
            var height = document.documentElement.clientHeight - $(this).offset().top - $(this).height() - 30;
            $(this).next(".dropdown-menu").css({"max-height": height, "overflow-y": "auto"});
        }
    });

    //全选、不选
    $("#selectBtn a").bind("click", function(){
        var id = $(this).attr("data-id");
        if(id == 1){
            $("#selectBtn .check").addClass("checked");
            $("#list .item").removeClass("selected").addClass("selected");

            defaultBtn.show();
        }else{
            $("#selectBtn .check").removeClass("checked");
            $("#list .item").removeClass("selected");

            defaultBtn.hide();
        }
    });

    $('#list').delegate('.check', 'click', function(){
        var t = $(this), item = t.closest('.item');
        item.hasClass('selected') ? item.removeClass('selected') : item.addClass('selected');
        init.funTrStyle();
    });

    //删除
    $("#delBtn").bind("click", function(){
        $.dialog.confirm('确定要删除吗？', function(){
            init.del();
        });
    });

    //单条删除
    $("#list").delegate(".del", "click", function(){
        var t = $(this).closest('.item');
        $.dialog.confirm('确定要删除吗？', function(){
            t.addClass('selected').siblings('.item').removeClass('selected');
            init.del();
        });
    });

    //生成虚拟账号
    $('#create').bind('click', function(){

        $.dialog.prompt('请输入要生成的数量(建议20条左右)：',
            function(val){
                huoniao.showTip('loading', '正在生成，请稍等...');
                // 发送给后端校验
                $.get("?action=cat&num="+val,function (data){
                    if(data.errno == 0){
                        huoniao.showTip('success', data.errmsg, "auto");
                        setTimeout(function(){
                            location.reload();
                        }, 1000);
                    }else{
                        huoniao.showTip('error', data.errmsg);
                    }
                },"json");
            },
            20
        );


        // $.dialog.confirm('确定要生成吗？', function(){
        //     huoniao.showTip('loading', '正在生成，请稍等...');
        //     huoniao.operaJson("?action=cat", "", function(data){
        //         if(data.errno == 0){
        //             huoniao.showTip('success', data.errmsg, "auto");
        //             setTimeout(function(){
        //                 location.reload();
        //             }, 500);
        //         }else{
        //             huoniao.showTip('error', data.errmsg);
        //         }
        //     });
        // });
    });

    //将虚拟账号导入系统用户库
    $('#import').bind('click', function(){
        $.dialog.prompt('请输入要导入的数量：',
            function(val){
                // 发送给后端校验
                $.post("./ajax.php?action=create",{"num":val},function (data){
                    if(data.errno == 0){
                        huoniao.showTip('success', data.errmsg, "auto");
                        setTimeout(function(){
                            location.reload();
                        }, 2000);
                    }else{
                        huoniao.showTip('error', data.errmsg);
                    }
                },"json");
            },
            allCount
        );
    });

    //清空虚拟账号
    $('#clear').bind('click', function(){
        $.dialog.confirm('确定要清空吗？', function(){
            huoniao.showTip('loading', '正在清空，请稍等...');
            huoniao.operaJson("?action=clear", "", function(data){
                if(data.errno == 0){
                    huoniao.showTip('success', data.errmsg, "auto");
                    setTimeout(function(){
                        location.reload();
                    }, 500);
                }else{
                    huoniao.showTip('error', data.errmsg);
                }
            });
        });
    });
    
    huoniao.showPageInfo();

});

function getList(){
    var page = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";
    location.href = '?action=getList&page=' + page;
}

// 单击删除
$(".fileicon").click(function(){
    let check = confirm("删除该条信息？");
    if(check){
        let qq = $(this).attr("qq");
        $.get("./ajax.php?action=del",{"qq":qq},function(data){
            auto_message(data);
        },"json");
    }
    return false;
});
// 设置抓取数量
function setNum(){
    let num = $("#num").val();
    $.post("./ajax.php?action=setConfig",{"default_num":num},function (data){
        if(data.errno==0){
            window.location.href = "./user.php?action=cat&num="+num;
        }else{
            message("设置错误","error");
        }
    },"json")
}

$("#upload").change(function(){

    if(!this.files[0]) {
        this.value = "";
        return;
    }
    let ext,idx;
    let imgName = this.value;
    idx = imgName.lastIndexOf(".");
    if (idx != -1){
        ext = imgName.substr(idx+1).toUpperCase();
        ext = ext.toLowerCase();
        // alert("ext="+ext);
        if (ext != 'json'){
            alert("只能上传.json 类型的文件!");
            this.value="";
            return;
        }
    }
    if(this.files[0].size>20971520) {
        alert('文件不得超过20M')
        this.value = "";
        return
    }
    let formData = new FormData();
    formData.append('file', this.files[0]);
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4 && xhr.status == 200)
        {
            if(this.responseText){
                let jsonObj = JSON.parse(this.responseText);
                if(jsonObj.errno==0){
                    message("导入成功","success");
                }else{
                    message("导入失败","error");
                }
            }else{
                message("导入失败","error");
            }
        }
    }
    xhr.open('post', './user.php?action=setData', true);
    xhr.send(formData);
})