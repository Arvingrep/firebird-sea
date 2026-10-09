$(function (){
    $("#editform").submit(function (){
        event.preventDefault();
        let data = $(this).serialize();

        $.post("ajax.php?action=read_addTask", data, function(res){
            if(res.errno==0){
                $.dialog({
                    icon: 'success.png',
                    title: '提示',
                    content: '新增成功',
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