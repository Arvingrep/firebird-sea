var userinfo,chatToken,chatServer,AccessKeyID;

var url = window.location.pathname;
var user_id = url.slice(url.indexOf("-")+1,url.indexOf("."));  //获取聊天对象的id

$(function(){
//获取当前用户的信息
 $.ajax({
        url: '/include/ajax.php?service=siteConfig&action=getImToken',
        type: 'post',
        dataType: 'json',
        success: function(data){
            if(data.state == 100){
                var info = data.info;
                userinfo = info;
                chatToken = info.token;
                chatServer = info.server;
                AccessKeyID = info.AccessKeyID;
				console.log(info);
				
            }else{
                alert(data.info);
            }
        },
        error: function(){
            alert(langData['siteConfig'][46][63]);//网络错误，初始化失败！
        }
    });

});

//获取好友信息
getinfo(user_id)
function getinfo(user_id){
	$.ajax({
        url: '/include/ajax.php?service=member&action=detail&id='+user_id+'&friend=1',
        type: 'post',
        dataType: 'json',
        success: function(data){
            if(data.state == 100){
                console.log(data)
                var src = data.info.photo != ""?data.info.photo:staticPath+"images/noPhoto_60.jpg";
				$('.im-right_info h2').text(data.info.nickname);
				$('.im-left_head').children('img').attr('src',src);
				if(data.info.addrName!=''){
					var addr = data.info.addrName.split('>'); 
					$('.im-right_info p').text(addr[0]+addr[1])
				}else{
					$('.im-right_info p').text('');
				}
//				$('.im-right_info p').text()
				if(data.info.levelIcon!=""){
					$('.vip_level').show().find('img').attr('src',src);
				}else{
					$('.vip_level').hide()
					
				}
            }else{
                alert(data.info);
            }
        },
        error: function(){
            alert(langData['siteConfig'][46][63]);//网络错误，初始化失败！
        }
    });
}

$('.im-send_btn,.im-send_sure').click(function(){
	var note = $('#im-test_info').html()==''?langData['siteConfig'][46][6]+userinfo['name']:$('#im-test_info').html();//我是
	f_test(user_id,note);
	
})
//好友验证发送
function f_test(id,note){
	
	$.ajax({
        url: '/include/ajax.php?service=siteConfig&action=applyFriend&tid='+id+'&note='+note,
        type: 'post',
        dataType: 'json',
        success: function(data){
            if(data.state == 100){
            	if(data.info==langData['siteConfig'][46][79]){//申请成功
            		showMsg(langData['siteConfig'][47][4]);//已发送验证消息
               		$('#im-test_info').html('');
            	}else{
            		showMsg(langData['siteConfig'][46][82]);//已成功添加对方为好友
            		$('#im-test_info').html('');
            	}
              
            }else{
                showMsg(data.info);
            }
        },
        error: function(){
            alert(langData['siteConfig'][46][63]);//网络错误，初始化失败！
        }
    });
}
