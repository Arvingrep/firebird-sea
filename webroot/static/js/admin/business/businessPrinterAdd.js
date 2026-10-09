$(function () {

    var thisURL   = window.location.pathname;
    tmpUPage  = thisURL.split( "/" );
    thisUPage = tmpUPage[ tmpUPage.length-1 ];
    thisPath  = thisURL.split(thisUPage)[0];

    //表单验证
    $("#editform").delegate("input,textarea", "focus", function(){
        var tip = $(this).siblings(".input-tips");
        if(tip.html() != undefined){
            tip.removeClass().addClass("input-tips input-focus").attr("style", "display:inline-block");
        }
    });

    $("#editform").delegate("input,textarea", "blur", function(){
        var obj = $(this), tip = obj.siblings(".input-tips");
        if(obj.attr("data-required") == "true"){
            if($(this).val() == ""){
                tip.removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
            }else{
                tip.removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
            }
        }else{
            huoniao.regex(obj);
        }
    });

    $("#editform").delegate("select", "change", function(){
        if($(this).parent().siblings(".input-tips").html() != undefined){
            if($(this).val() == 0){
                $(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
            }else{
                $(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
            }
        }
    });

    $(".chosen-select").chosen();

    //提交表单
    $("#btnSubmit").bind("click", function(event){
        event.preventDefault();
        var t         = $(this),
            id        = $("#id").val(),
            dopost    = $("#dopost").val(),
            typeid    = $("#typeid").val(),
            title     = $("#title"),
            tj        = true;

        //标题
        if(!huoniao.regex(title)){
            tj = false;
            huoniao.goTop();
            return false;
        };

        t.attr("disabled", true);

        var data = [];
        data.push('id='+id);
        data.push('dopost='+dopost);
        data.push('print='+$("#typeid").val());
        data.push('typeid='+typeid);
        data.push('title='+title.val());
        data.push('shopid='+$("#shopid").val());
        data.push('mcode='+$("#mcode").val());
        data.push('msign='+$("#msign").val());
        data.push('token='+$("#token").val());
        data.push('waimaiprintTemplate='+$("#waimaiprintTemplate").val());
        data.push('printmodule='+$("#printMode").val());
        data.push('clientId='+$("#clientId").val());
        data.push('client_secret='+$("#client_secret").val());

        if(tj){
            $.ajax({
                type: "POST",
                url: "businessPrinterAdd.php?dopost="+$("#dopost").val(),
                data: data.join("&") + "&submit=" + encodeURI("提交"),
                dataType: "json",
                success: function(data){
                    if(data.state == 100){
                        if($("#dopost").val() == "save"){

                            $.dialog({
                                fixed: true,
                                title: "添加成功",
                                icon: 'success.png',
                                content: '添加成功！',
                                ok: function(){
                                    huoniao.goTop();
                                    window.location.reload();
                                },
                                cancel: false
                            });

                        }else{
                            $.dialog({
                                fixed: true,
                                title: "修改成功",
                                icon: 'success.png',
                                content: '修改成功！',
                                ok: function(){
                                    try{
                                        huoniao.goTop();
                                        window.location.reload();
                                    }catch(e){
                                        location.href = thisPath + "businessPrinterAdd.php?action="+action;
                                    }
                                },
                                cancel: false
                            });
                        }
                    }else{
                        $.dialog.alert(data.info);
                        t.attr("disabled", false);
                    };
                },
                error: function(msg){
                    $.dialog.alert("网络错误，请刷新页面重试！");
                    t.attr("disabled", false);
                }
            });
        }
    });

});