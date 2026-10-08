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
	//此处为积分充值 的js
//	$('.im-integral_box').delegate('a','click',function(){
//		var integral = $(this).find('.im-get_integral').text();
//		var money = $(this).find('.im-button_money').text();
//		var dialog = jqueryAlert({
//	      'title'   : '',
//	      'content' : ' 确定充值'+integral+'？<br/> 实际支付'+money,
//	       'modal'   : true,
////	       'animateType':'linear',
//	       'height':'2.6rem',
//	       'buttons' :{
//	          '去支付' : function(){
//	             dialog.close();
//	             setTimeout(function(){
//	             	showMsg('此处应该跳转页面')//跳转支付页面
//	             },400)
//	           },
//	           '再看看' : function(){
//	               dialog.close();
//	           },
//	           
//	      }
//		});
//	});

	//截取url
	var str = window.location.hash;
//	var type = str.slice(1);//1是好友  2是关注  3是粉丝
//	if(type==1){
//		$('.im-add_btn_group .im-add_btn').addClass('im-del_btn').text('删除好友');  //删除好友
//	}else if(type==2||type==3){
//		$('.im-add_btn_group .im-add_btn').removeClass('im-del_btn').text('加好友');  //删除好友
//	}

	//获取用户信息
	var url = window.location.pathname;
	if (url.indexOf("-") != -1){
		var userid = url.slice(url.indexOf("-")+1,url.indexOf("."));
//		可以根据userid获取好友的信息
		 $.ajax({
	        url: '/include/ajax.php?service=member&action=detail&id='+userid+'&friend=1',
	        type: 'post',
	        dataType: 'json',
	        success: function(data){
	            if(data.state == 100){
	            	var detail = data.info;
	                $('.im-left_head').children('img').attr('src',detail.photo);   //头像
	                $('.im-right_info h2').text(detail.nickname);
	               if(detail.levelIcon != ''){
	               		$('.vip_level img').attr('src',detail.levelIcon);   //vip的图标
	               }else{
	               		$('.vip_level').hide();
	               }
	               if(!detail.person){
	               	$('.im-name_cfirm').hide();   //实名认证
	               }
	               if(!detail.phoneCheck){
	               	$('.im-phone_cfirm').hide();   //手机认证
	               }
	               if(!detail.emailCheck){
	               	$('.im-email_cfirm').hide();    //邮箱认证
	               }
	               if(detail.isfriend){          //是否为好友
	               	 $('.im-add_btn_group .im-add_btn').addClass('im-del_btn').text('删除好友');  //删除好友
	               }else{
	               		$('.im-add_btn_group .im-add_btn').removeClass('im-del_btn').text('加好友');  //删除好友
	               }
					$('.userid .im-info_right').html(detail.userid + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a style="color: #ff0000;" href="/user/'+detail.userid+'" target="_blank">' + langData['siteConfig'][47][87] + '</a>');
					var addr =  detail.addrName?(detail.addrName.split('>')[0]+detail.addrName.split('>')[1]):''
					$('.userarea .im-info_right').text(addr);


	            }else{
	                alert(data.info);
	            }
	        },
	        error: function(){
	            alert(langData['siteConfig'][46][63]);//网络错误，初始化失败！
	        }
	    });



	}



	//添加好友
	$('body').delegate('.im-add_btn','click',function(){
		if($(this).hasClass('im-del_btn')){
			$.ajax({
		        url: '/include/ajax.php?service=siteConfig&action=delFriend&tid='+userid,
		        type: 'post',
		        dataType: 'json',
		        success: function(data){
		            if(data.state == 100){
		            	showMsg(langData['siteConfig'][46][67]);//正在删除中</br>请稍后
		            	setTimeout(function(){
		            		showMsg(data.info);
		            		$('.im-add_btn_group .im-add_btn').removeClass('im-del_btn').text(langData['siteConfig'][46][21]);//加好友
		            	},500)

		            }else{
		                alert(data.info);
		            }
		        },
		        error: function(){
		            alert(langData['siteConfig'][46][63]);//网络错误，初始化失败！
		        }
		    });
			return false;
		}else{
			var url = 'f_test-'+userid+'.html';
			window.location.href = url;
		}
	});
	
//	$('body').delegate('.im-chat_width','click',function(){
//		var url = 'chat-'+userid+'.html';
//		window.location.href = url;
//	});
	$('.im-add_infobox').delegate('.im-chat_width','click',function(){
		var to = $(this).attr('data-id');
		if(device.indexOf('huoniao') > -1){
			var param = {
			    from: userinfo['uid'],
			    to: userid,
			}; 
			setupWebViewJavascriptBridge(function(bridge) {
			     bridge.callHandler('invokePrivateChat',  param, function(responseData){});
			});
			return false;
		}else{
			var url = 'chat-'+userid+'.html';
			window.location.href = url;
		}
	})
})
