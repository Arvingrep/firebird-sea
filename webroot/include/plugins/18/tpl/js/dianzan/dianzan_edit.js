$(function (){
    $("#editform").submit(function (){
        event.preventDefault();
        let data = $(this).serialize();

        $.post("ajax.php?action=dianzan_editTask", data, function(res){
            if(res.errno==0){
                $.dialog({
                    icon: 'success.png',
                    title: '提示',
                    content: '修改成功',
                    ok: function(){
                        location.reload();
                    }
                });
            }else{
                $.dialog({
                    icon: 'error.png',
                    title: '提示',
                    content: res.errmsg,
                    ok: true
                });
            }
        },"json");
    });
})