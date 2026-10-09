function getBusiConfig(){
    $.ajax({
        accepts:{},
        url: '/include/ajax.php?service=business&action=config',
        type: "POST",
        dataType: "json",
        success: function (data) {
            if(data.state == 100){
                if(data.info.joinState == 0){
                    getBusiStoreDetail(); //商家信息
                }else{
                    alert('已关闭入驻功能，请联系网站管理员')
                    window.history.go(-1)
                }
            }
        },
        error: function () { }
    });
}


function getBusiStoreDetail(){
    $.ajax({
        accepts:{},
        url: '/include/ajax.php?service=business&action=storeDetail',
        type: "POST",
        dataType: "json",
        success: function (data) {
            if(data.state == 100 && data.info.state == '1'){
                // 表示已成功入驻
                $(".buyModQr,.buyMod_title").removeClass('hide')
                $(".ruzhuQr,.ruzhu_title").addClass('hide')

            }else{
                // 表示没有入驻商家
                $(".buyModQr,.buyMod_title").addClass('hide')
                $(".ruzhuQr,.ruzhu_title").removeClass('hide')
            }
        },
        error: function () { }
    });
}


getBusiStoreDetail()