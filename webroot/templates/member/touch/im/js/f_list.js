var chatLib, AccessKeyID, userinfo, chatToken, chatServer, toUserinfo, toChatToken;
var isload = false, page = 1, pageSize = 20, totalPage = 1, stop = 0, time = Math.round(new Date().getTime()/1000).toString();
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
                chatToken = info.token;
                chatServer = info.server;
                AccessKeyID = info.AccessKeyID;

                f_list('friend'); //获取好友列表
                console.log('111')
            }else{
                alert(data.info);
            }
        },
        error: function(){
            alert(langData['siteConfig'][46][63]);//网络错误，初始化失败！
        }
    });





	$('.tab_box li').click(function(){
		$(this).addClass('on').siblings('li').removeClass('on');
		var type=$(this).attr('data-type');
		var  i = $(this).index(),txt = $(this).text();
		$('.ulbox').eq(i).addClass('show').siblings('.ulbox').removeClass('show');
		$('.top_head span').text(txt);
		console.log($('.ulbox').eq(i).find('li').length)
		if($('.ulbox').eq(i).find('li').length==0){
			f_list(type)
		}
	});

	//取消关注
	$('body').delegate('.no_focus','click',function(){
		var id =$(this).attr('data-id');
		showBottom(id);
		console.log(id)
//		var t= $(this);
//		follow(t, function(){
//			showMsg('已经取消关注')
//			t.parents('li').remove();
//		});
		return false;
	});
	//确认删除好友
$('body').delegate('.im-delf_confirm','click',function(){
		var id = $(this).attr('data-id')
		var t= $('.no_focus[data-id="'+id+'"]');
		console.log(t)
		follow(t, function(){
			showMsg(langData['siteConfig'][47][1])//已经取消关注
			t.parents('li').remove();
		});

	closebottom()
});
	//底部弹出层
function showBottom(id){
	$("body").append('<div class="im-deltip_box"><ul><li class="im-delf_tip">'+langData['siteConfig'][47][1]+'</li><li class="im-delf_confirm" data-id="'+id+'"><a href="javascript:;" >'+langData['siteConfig'][6][1]+'</a></li><li class="im-delf_cancel" onclick="closebottom()";><a href="javascript:;" >'+langData['siteConfig'][6][12]+'</a></li></ul></div>');//确定不在关注此人 -- 确定--取消
	setTimeout(function(){$('.im-mask0').show();$('.im-deltip_box').animate({'bottom':'0'},'fast');},100);
}

function closebottom(){
	$('.im-deltip_box').animate({'bottom':'-3rem'},'fast');
	$('.im-mask0').hide();
	setTimeout(function(){$('.im-deltip_box').remove()},100);
}
	//点击关注

	$('body').delegate('.to_focus','click',function(){
		var t= $(this);
		if(!t.parents('li').hasClass('f_li')){
			follow(t, function(){
				t.text(langData['siteConfig'][47][3]);//相互关注
				t.parents('li').addClass('f_li');

			});
			return false;

		}else{
			follow(t, function(){
				t.text(langData['siteConfig'][19][846]);//关注
				t.parents('li').removeClass('f_li');

			});

			return false;
		}

	});

	$('body').delegate('.chat_to','click',function(){

		var uid = $(this).parents('.libox').attr('data-id');
		if(device.indexOf('huoniao') > -1){
		      var param = {
		        from: userinfo['uid'],
		        to: uid,
		      }; 
		      setupWebViewJavascriptBridge(function(bridge) {
		        bridge.callHandler('invokePrivateChat',  param, function(responseData){});
		      });
		      
		}else{
			location.href=userDomain+"chat-"+uid+".html";
		}
		return false;
	})



	var follow = function(t, func){
	    var userid = $.cookie(cookiePre+"login_user");
	    if(userid == null || userid == ""){
	      location.href = masterDomain + '/login.html';
	      return false;
	    }

	    if(t.hasClass("disabled")) return false;
	    t.addClass("disabled");
	    $.post("/include/ajax.php?service=member&action=followMember&id="+t.attr("data-id"), function(){
	      t.removeClass("disabled");
	      func();
	    });
	  }
})
