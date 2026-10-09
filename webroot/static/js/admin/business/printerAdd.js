$(function(){

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
        var obj = $(this);
        huoniao.regex(obj);
    });

    $("#editform").delegate("select", "change", function(){
        if($(this).parent().siblings(".input-tips").html() != undefined){
            if($(this).val() == ""){
                $(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
            }else{
                $(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
            }
        }
    });

    $("#printTemplateObj").bind("click", function(){
        $.dialog({
            id: "printTemplatePopup",
            title: "打印机小票DIY自定义",
            content: 'url:'+adminPath+'../include/printTemplate.php?module=waimai&template=' + encodeURIComponent($('#printTemplate').val()),
            width: 890,
            height: 700,
            button: [
                {
                    name: '确认',
                    callback: function(){
                        var doc = $(window.parent.frames["printTemplatePopup"].document),
                            templateVal = doc.find("#templateVal").val();
                        $("#printTemplate").val(templateVal);
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

    //提交表单
    $("#btnSubmit").bind("click", function(event){
        event.preventDefault();
        var t            = $(this),
            print_config   = [],
            action       = $("#action").val(),
            id           = $("#id").val(),
            code         = $("#code").val(),
            print_name     = $("#print_name"),
            print_desc     = $("#print_desc").val(),
            state        = $("input[name='state']:checked").val();

        //名称
        if(!huoniao.regex(print_name)){
            huoniao.goInput(print_name);
            return false;
        };

        $("#printConfig").find("input, select, textarea").each(function(index, element) {
            var name = $(this).attr("name"), val = $(this).val();
            if (name == 'printTemplate'){
                val = $(this).val()
            }
            if(val == '' || name == 'MembrID' || name == 'signkey' || name =='user' || name == 'ukey' || name == 'clientId' || name == 'client_secret' || name == 'UserKEY' || name == 'appid' || name == 'appsecrect'){
                print_config.push('{"name": "'+name+'", "value": "'+encodeURIComponent(val.replace(/\n/g,""))+'"}');
            }else{
                print_config.push('{"name": "'+name+'", "value": '+encodeURIComponent(val.replace(/\n/g,""))+'}');

            }

        });

        if(print_config.length == 0){
            $.dialog.alert("请输入帐号信息");
            return false;
        }

        var form = [];
        form.push("id="+id);
        form.push("code="+code);
        form.push("print_name="+print_name.val());
        form.push("print_desc="+print_desc);
        form.push("print_config="+'['+print_config.join(",")+']');
        form.push("state="+state);
        form.push("submit=提交");

        t.attr("disabled", true);

        $.ajax({
            type: "POST",
            url: "printerType.php?action="+action,
            data: form.join("&"),
            dataType: "json",
            success: function(data){
                if(data.state == 100){
                    $.dialog({
                        fixed: true,
                        title: "配置成功",
                        icon: 'success.png',
                        content: "配置成功！",
                        ok: function(){
                            try{
                                $("body",parent.document).find("#nav-printerTypebusiness").click();
                                //parent.reloadPage($("body",parent.document).find("#body-siteHelpsphp")[0].contentWindow);
                                parent.reloadPage($("body",parent.document).find("#body-printerTypebusiness"));
                                $("body",parent.document).find("#nav-printerType"+(id ? id : code)+" s").click();
                            }catch(e){
                                location.href = thisPath + "printerType.php";
                            }
                        },
                        cancel: false
                    });
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
    });

});
