

$(function () {
    var go = false;
    $('#submit').click(function () {
        if(go) return false;
        go = true;
        $.ajax({
            type: 'POST',
            url: '/include/ajax.php?service=business&action=staffUpdateAuth&dotype=update&id='+id,
            data:$("#fabuForm").serialize(),
            dataType: "jsonp",
            success: function (data) {
                go = false;
                if(data.state ==100){
                    alert(data.info);
                    location.href = businessstaffurl;
                }else{
                    alert(data.info);
                }
            },
            error:function () {
                go = false;
            }
        })
        return false;
    })


})