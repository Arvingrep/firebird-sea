$(function(){
  //订单详情
  $(".orDetail").click(function(){
    alert('请在移动端查看订单详情');
  })
	//取消订单
    $(".cancel_btn").click(function(){
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            window.location.href = masterDomain+'/login.html';
            return false;
        }

        var t = $(this), id = t.attr("data-id");
        if(id){
            if(confirm(langData['travel'][13][76])){
                $.ajax({
                    url: "/include/ajax.php?service=travel&action=operOrder&oper=cancel&id="+id,
                    type: "GET",
                    dataType: "jsonp",
                    success: function (data) {
                        if(data && data.state == 100){
                  location.href = location.href + (location.href.indexOf('?') > -1 ? '&' : '?') + 'currentPageOpen=1';
                        }else{
                            alert(data.info);
                        }
                    },
                    error: function(){
                        alert(langData['siteConfig'][20][183]);
                    }
                });
            }
        }
    });

    //一键续住
    $(".go_btn").unbind("click").click(function (){
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            window.location.href = masterDomain+'/login.html';
            return false;
        }

        var t = $(this), id = t.attr("data-id");
        if(id){
            if(confirm(langData['travel'][13][101])){
                $.ajax({
                    url: "/include/ajax.php?service=travel&action=oneKeyContinued&id="+id,
                    type: "GET",
                    dataType: "jsonp",
                    success: function (data) {
                        if(data && data.state == 100){
                            
                                location.href = data.info + (data.info.indexOf('?') > -1 ? '&' : '?') + 'currentPageOpen=1';
                        }else{
                            alert(data.info);
                        }
                    },
                    error: function(){
                        alert(langData['siteConfig'][20][183]);
                    }
                });
            }
        }
    });

})
