$(function(){
    $('.chooseTime').timepicker($.extend($.datepicker.regional['zh-cn'], {'timeFormat':'hh:mm','hour':'09','minute':'40'}));
})

//表单提交
function checkFrom(form){

    var form = $("#shop-form"), action = form.attr("action"), data = form.serialize();
    var btn = $("#submitBtn");

    btn.attr("disabled", true);

    $.ajax({
        url: action,
        type: "post",
        data: data,
        dataType: "json",
        success: function(res){
            if(res.state == 100){
                location.href = "waimaiFoodType.php?sid="+sid;
            }else{
                $.dialog.alert(res.info);
                btn.attr("disabled", false);
            }
        },
        error: function(){
            $.dialog.alert(langData['siteConfig'][20][253]);
            btn.attr("disabled", false);
        }
    })

}
