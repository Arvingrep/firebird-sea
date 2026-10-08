var userinfo;
$(function(){
//获取当前登录用户的信息
    $.ajax({
        url: '/include/ajax.php?service=siteConfig&action=getImToken',
        type: 'post',
        dataType: 'json',
        success: function(data){
            if(data.state == 100){
                var info = data.info;
               userinfo = info;
//              chatToken = info.token;
//              chatServer = info.server;
//              AccessKeyID = info.AccessKeyID;
				console.log(userid)
            }else{
                alert(data.info);
            }
        },
        error: function(){
            alert(langData['siteConfig'][46][63]);//网络错误，初始化失败！
        }
    });
$('body').delegate('.search_btn','click',function(){
	var val = $("#search_val").val();
	if(val==''){
		showMsg(langData['siteConfig'][47][24])//请输入ID或者手机号
	}else{
		search_list(val);
	}
});

$('body').delegate('.im-del_btn.im-add_btn','click',function(){
		$.ajax({
	        url: '/include/ajax.php?service=siteConfig&action=delFriend&tid='+userid,
	        type: 'post',
	        dataType: 'json',
	        success: function(data){
	            if(data.state == 100){
	            	showMsg(data.info);
	            	$('.im-add_btn_group .im-add_btn').removeClass('im-del_btn').text(langData['siteConfig'][46][21]);//加好友
	            }else{
	                alert(data.info);
	            }
	        },
	        error: function(){
	            alert(langData['siteConfig'][46][63]);//网络错误，初始化失败！
	        }
	    });
		showMsg(langData['siteConfig'][46][23]);//已经删除好友
		return false;
	});
	
$('.search_result').delegate('.im-chat_width','click',function(){
	var to = $(this).attr('data-id');
	if(device.indexOf('huoniao') > -1){
		var param = {
		    from: userinfo['uid'],
		    to: to,
		}; 
		setupWebViewJavascriptBridge(function(bridge) {
		     bridge.callHandler('invokePrivateChat',  param, function(responseData){});
		});
		return false;      
	}
	
})

});