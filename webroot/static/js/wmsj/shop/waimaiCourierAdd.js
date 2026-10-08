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
                $.dialog({
					title: langData['waimai'][6][123],
					icon: 'success.png',
					content: langData['siteConfig'][6][39],
					ok: function(){
                        window.scroll(0, 0);
                        location.reload();
					}
				});
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
