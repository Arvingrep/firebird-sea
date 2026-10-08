$(function(){

    // 店铺管理页面中店铺连接查看,二维码查看
    $('.shopurl').click(function(){
      var t = $(this), url = t.closest("tr").data("url");
      $(".seeurl").html(url);
      if ($('.meng').hasClass('aa')) {
        $('.meng').removeClass('aa');
        $('.disk').hide();
      }else{
        $('.meng').addClass('aa');
        $('.disk').show();
      };
    })
    $('.order_true').click(function(){
      $('.meng').addClass('aa');
    })


    $('.shopticket').click(function(){
      var t = $(this), url = t.closest("tr").data("url");
      $("#seeticket").html('<img src="/include/qrcode.php?data='+url+'" />');
      if ($('.feng').hasClass('aa')) {
        $('.feng').removeClass('aa');
        $('.disk').hide();
      }else{
        $('.feng').addClass('aa');
        $('.disk').show();
      };
    })
    $('.order_true').click(function(){
      $('.feng').addClass('aa');
    })

    //删除
    $(".del").bind("click", function(){
        var t = $(this), tr = t.closest("tr"), id = t.data("id");

        $.dialog.confirm(langData['siteConfig'][20][211], function(){
            $.ajax({
                url: "waimaiType.php",
                type: "post",
                data: {action: "delete", id: id},
                dataType: "json",
                success: function(res){
                    if(res.state != 100){
                        $.dialog.alert(res.info);
                    }else{
                        location.reload();
                    }
                },
                error: function(){
                    $.dialog.alert(langData['siteConfig'][20][253]);
                }
            })
        })

    });

});
