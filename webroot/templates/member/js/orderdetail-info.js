$(function(){

    //收货
    $(".sh").bind("click", function(){
        var t = $(this);
        if(t.attr("disabled") == "disabled") return;

        if(confirm(langData['siteConfig'][20][188])){  //确定要收货吗？确定后费用将直接转至卖家账户，请谨慎操作！
            t.html(langData['siteConfig'][6][35]+"...").attr("disabled", true);  //提交中

            $.ajax({
                url: "/include/ajax.php?service=info&action=receipt",
                data: "id="+id,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if(data && data.state == 100){
                        location.reload();

                    }else{
                        alert(data.info);
                        t.attr("disabled", false).html(langData['siteConfig'][6][45]);//确认收货
                    }
                },
                error: function(){
                    $.dialog.alert(langData['siteConfig'][20][183]);//网络错误，请稍候重试！
                    t.attr("disabled", false).html(langData['siteConfig'][6][45]);//确认收货
                }
            });

        }

    });

    //申请退款
    $(".fahuo").bind("click", function(){
        $(".fh").toggle();
    });

     //提交快递信息
     $("#expBtn").bind("click", function(){
        var t = $(this),
            company = $("#exp-company"),
            number  = $("#exp-number");

        if($.trim(company.val()) == ""){
            alert(langData['siteConfig'][27][60]);  //请选择快递公司
            return false;
        }

        if($.trim(number.val()) == ""){
            alert(langData['siteConfig'][27][406]);  //面试邀请
            return false;
        }

        var data = [];
        data.push("id="+id);
        data.push("company="+company.val());
        data.push("number="+number.val());

        t.attr("disabled", true).html(langData['siteConfig'][6][35]+"...");  //提交中

        $.ajax({
            url: "/include/ajax.php?service=info&action=delivery",
            data: data.join("&"),
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    alert(data.info);
                    location.reload();
                }else{
                    alert(data.info);
                    t.attr("disabled", false).html(langData['siteConfig'][6][0]);  //确认
                }
            },
            error: function(){
                alert(langData['siteConfig'][20][183]); //网络错误，请稍候重试！
                t.attr("disabled", false).html(langData['siteConfig'][6][0]);    //确认
            }
        });

    });

    //确定退款
    $(".tuikuan").bind("click", function(){
        var t = $(this);

        if(t.attr("disabled") == "disabled") return;

        $.dialog.confirm(langData['siteConfig'][20][407], function(){   //确定退款吗？

            t.html(langData['siteConfig'][6][35]+"...").attr("disabled", true);//提交中

            $.ajax({
                url: "/include/ajax.php?service=info&action=refundPay",
                data: "id="+id,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if(data && data.state == 100){
                        $.dialog({
                            fixed: true,
                            title: langData['siteConfig'][20][244],  //操作成功
                            icon: 'success.png',
                            content: data.info,
                            ok: function(){
                                location.reload();
                            },
                            cancel: false
                        });

                    }else{
                        $.dialog.alert(data.info);
                        t.attr("disabled", false).html(langData['siteConfig'][6][153]); //确定退款
                    }
                },
                error: function(){
                    $.dialog.alert(langData['siteConfig'][20][183]);  //网络错误，请稍候重试！
                    t.attr("disabled", false).html(langData['siteConfig'][6][153]);//确定退款
                }
            });

        });
    });

});
