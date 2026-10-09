var chatLib, AccessKeyID, userinfo, chatToken, chatServer, toUserinfo, toChatToken;
var stop = 0, time = Math.round(new Date().getTime()/1000).toString();
var amr  = '';  //amr播放
// isload = false, page = 1, pageSize = 20, totalPage = 1,
//以上为新添加的
var audio = new Audio();
audio.src = staticPath+'audio/notice02.mp3';

$(function(){
	 //im sdk
    var kumanIMLib = function (wsHost) {

        var lib = this;

        this.timeOut = 30000;  // 每30秒发送一次心跳
        this.timeOutObj = null;

        // 重置心跳
        this.reset = function(){
            clearTimeout(this.timeOutObj);
            lib.start();
        }

        // 启动心跳
        this.start = function(){
            lib.timeOutObj = setInterval(function(){
                lib.socket.send('HeartBeat');
            }, lib.timeOut);
        }

          // 链接
        this.createSocket = function(url){
            lib.socket && lib.socket.close();
            if (!lib.socket) {
                console.log('建立websocket连接')
                lib.socket = new WebSocket(url);
                lib.socket.onmessage = lib.socket.onmessage;
                lib.socket.onerror = lib.socket.onerror;
                lib.socket.onclose = lib.socket.onclose;
            } else {
                console.log('websocket已连接')
            }
        }

        // 初始化连接
        if (window['WebSocket']) {
            // this.socket = new WebSocket(wsHost);
            //this.socket.onopen = this.evt.onopen;  // 连接成功

            this.createSocket(wsHost)
            // 关闭
            this.socket.onclose = function(){
                // alert('close')
                initChat(1);
            };

            // 异常
            this.socket.onerror = function(){
                this.close();
            };

            // 收到消息
            this.socket.onmessage = function (evt) {
                lib.reset();  //重置心跳
                var msg = JSON.parse(evt.data);
                switch (msg.type) {
                    case "init":
                        console.log(msg.info.content);
                        break;
                    default:
                        if(userinfo['uid'] == msg.info.to && msg.info.type == 'member'){
                        	audio.play();
//                      	getnum();
                        	$('.im-cur_btn').click();
                        	var data ={
                        		content: msg.info.content,
		                        contentType: msg.type,
		                        from: msg.info.from,
		                        to: msg.info.to,
		                        unread:msg.info.unread,
		                        type: "person",
		                        time: msg.info.time
                        	};
                        	if(msg.type=='apply'&&$('.im-chat_panel').find('h2').attr("data-id")==msg.info.from ){
                        		if(msg.info.content != langData['siteConfig'][46][68]){//你们已成功添加为好友
                        			$('.im-chat_panel').find('.im-btn_group p').html(langData['siteConfig'][46][65]+'<a href="javascript:;" class="im-btn_agree">'+langData['siteConfig'][6][2]+'</a><a class="im-btn_refuse" href="javascript:;">'+langData['siteConfig'][47][25]+'</a>');//对方申请加为好友--同意--忽略
                        		}else{
                        			$('.im-btn_group').removeClass('im-show');
                        		}

                        	}
                        	if($('.im-cur_chat li.friend'+data.to).length==0){
                            	//聊天列表中没有，更新一下聊天列表
                            	getcurlist();
                            }
                            createEle(data, '', 1, lib);

                        }
                        break;
                }

            };

        } else {
            alert(langData['siteConfig'][46][62]);//您的浏览器不支持WebSockets.
            return false;
        }

        this.start();  //启动心跳检测

    };

	//初始化登录用户的信息
	initChat();
    function initChat(d){
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
                $('.im-user_info .im-_left').removeClass('im-no_login');
                $('.im-tip_head img').attr('src',(info.photo?info.photo:staticPath+"images/noPhoto_60.jpg"));
				$('.im-user_info .im-_left img').attr('src',(info.photo?info.photo:staticPath+"images/noPhoto_60.jpg"));
                $('.im-msg_tip').find('p').text(info.name);
                $('.im-user_info .im-_left').find('span').text(info.name);
                //创建连接
                chatLib = new kumanIMLib(chatServer + "?AccessKeyID=" + AccessKeyID + "&token=" + chatToken + "&type=member");

                if(!d){
	                
	                // getflist();//获取好友列表
	                // getcurlist();//获取最新聊天
	                // gettiplist();//获取账户消息

	                //查看语音消息

					setTimeout(function(){
						amr = new BenzAMRRecorder();
					},5000)
                }

            }else{
                if(data.info != 'No data!'){
                    alert(data.info);
                }
                $('.im-msg_tip').hide();
            }
        },
        error: function(){
            console.log(langData['siteConfig'][46][63]);//网络错误，初始化失败！
            $('.im-msg_tip').hide();
        }
    });
    }


	//点击最新会话列表，弹出对话框
$('body').delegate('.im-cur_chat li','click',function(){
	rec_page=1,recload=0; totalPage = 1;
	var uid = $(this).attr('data-id'),if_f, add_f;
	var name = $(this).find('.im-f_name span').text(),
	token = $(this).attr('data-token'),
	datatype='',
	photo= $(this).find('.im-headimg img').attr('src');
	if($(this).attr('data-type')=='apply' && $(this).attr('data-read')>0){
		datatype = langData['siteConfig'][47][26]+'<a href="javascript:;" class="im-btn_agree">'+langData['siteConfig'][6][2]+'</a><a class="im-btn_refuse" href="javascript:;">'+langData['siteConfig'][47][25]+'</a>'//对方请求加为好友--同意--忽略
	}else{
		datatype = '<a href="javascript:;" class="im-btn_add">'+langData['siteConfig'][46][28]+'</a>';//加为好友

	}
	var html = [];

	 toUserinfo = {
            'uid': uid,
            'name': name,
            'photo': photo
      };
      toChatToken = token;
      time = Math.round(new Date().getTime()/1000).toString();
      //判断聊天窗口是否已存在
		if($(this).hasClass('im-pannel_curr') && $('.im-chat_panel').hasClass('im-show')){
			return false;
		}
		$(this).addClass('im-pannel_curr').siblings('li').removeClass('im-pannel_curr');
		$(this).find('.im-f_msg i').remove();

		$(this).attr('data-read','0')
	$.ajax({
        url: '/include/ajax.php?service=member&action=detail&id='+uid+'&friend=1',
        type: 'post',
        dataType: 'json',
        success: function(data){
            if(data.state == 100){
            	if_f = data.info.isfriend;
            	add_f = if_f=='1'?'':'im-show';
            	$('.im-panel_box').find('.im-big_panel').remove();
				html.push('<div class="im-big_panel im-chat_panel im-show">');
				html.push('<h2 data-id="'+uid+'"><span class="im-to_fdetail">'+name+'</span><div class="im-btn_group '+add_f+'"><p class="im-to_f">'+datatype+'</p></div><i title="'+langData['siteConfig'][47][27]+'" class="im-close_btn"></i></h2>');//关闭聊天窗口
				html.push('<div class="im-record_box"></div>');
				html.push('<div class="im-msgto_box im-chat_box"><div class="im-btn_group fn-clear"><div class="im-left_icon"><a href="javascript:;" class="im-emoj_btn"></a><a href="javascript:;" class="im-img_btn"></a></div><a href="javascript:;" class="im-record_btn">'+langData['siteConfig'][47][31]+'</a></div><div class="im-textarea" contenteditable></div><div class="im-msg_sendbox"><a href="javascript:;" class="im-msg_send">'+langData['siteConfig'][6][139]+'</a><span ><i title="'+langData['siteConfig'][47][28]+'"></i></span><ul class="im-send_way"><li class="im-active" data-value="enter">'+langData['siteConfig'][47][29]+'</li><li data-value="center">'+langData['siteConfig'][47][30]+'</li></ul></div></div>');//消息记录--发送--按Enter键发送或者按Ctrl+Enter键发送--按Enter键发送--按Ctrl+Enter键发送
				html.push('</div>');
				$('.im-panel_box').append(html.join(''));
			    getrecord();
				getnum();
            }else{
                console.log(data.info);
            }
        },
        error: function(){
            console.log(langData['siteConfig'][46][63]);//网络错误，初始化失败！
        }
    });



});




});













/*---------------------此处是列表面板的相关脚本s----------------------*/

//点击隐藏面板
$('body').delegate('.im-hide_btn','click',function(){
	$('.im-panel_box').animate({'bottom':'-550px'},150)
	$('.im-msg_tip').show();
	clearInterval(refreshTimeout);

});

//点击切换面板
$('body').delegate('.im-tab_ul li','click',function(){
	$(this).addClass('im-on').siblings('li').removeClass('im-on');
	var index = $(this).index();
	if(index==2){
		$(".im-listBox a.im-clearOut").css('display','block');
	}else{
		$(".im-listBox a.im-clearOut").css('display','none');
	}
	$('.im-listBox ul.im-box').eq(index).addClass('im-show').siblings('ul').removeClass('im-show');

});

//点击删除按钮， 删除最新会话
$('body').delegate('.im-cur_chat .im-delbox a','click',function(){
	var t= $(this), parent = t.parents('li'),id = parent.attr('data-id'),to_f = parent.attr('data-f'),len = parent.parents('ul').find('li').length;
	//删除最新聊天
	delfriend(id,'temp',parent);
	if(len==1){
		$('.im-listBox .im-cur_chat').append('<div class="im-no_list" ><img src="'+staticPath+'images/im/no_img.png" /><p>'+langData['siteConfig'][47][32]+'~</p></div>');//没有任何会话
	}
	return false;

});

$('.im-listBox').scroll(function(){
	$('.im-op_box').removeClass('im-show');
});


//点击好友列表 显示菜单选项
$('body').delegate('.im-f_list>li','mousedown',function(e){
	var t= $(this),sib = t.siblings('li'),t_o = t.find('.im-op_box');
	var b_top = $('.im-bottom_btn').offset().top,op_top = t.offset().top+t.height(),op_h = t.find('.im-op_box').height();
	var op_left = e.clientX+$(this).scrollLeft(),w = $(window).width(),h=$(window).height(),op_w =t.find('.im-op_box').width() ;
	var top ,left,right,bottom;
	//设置菜单位置
	if(b_top-op_top>op_h&&w > (e.clientX + op_w)){
		top=e.clientY+$(this).scrollTop(),
		left=e.clientX+$(this).scrollLeft(),
		right='',
		bottom='';
	}else if(w < (e.clientX + op_w)&&(b_top-op_top>op_h)){

		top=e.clientY+$(this).scrollTop(),
		right=w-(e.clientX+$(this).scrollLeft()),
		left='',
		bottom='';

	}else if((b_top-op_top<=op_h)&&w >= (e.clientX + op_w)){
		top='',
		left=e.clientX+$(this).scrollLeft(),
		right='',
		bottom=h-(e.clientY+$(this).scrollTop());
	}else{
		top='',
		right=w-(e.clientX+$(this).scrollLeft()),
		left='',
		bottom=h-(e.clientY+$(this).scrollTop());
	}

		if(e.which == 3){
			t.find('.im-op_box').addClass('im-show');
			sib.find('.im-op_box').removeClass('im-show');
			t_o.css({
				'top':top,
				'bottom':bottom,
				'right':right,
				'left':left,

			});
		}

	$(document).one('click',function(){
		$('.im-op_box').removeClass('im-show');
	});
	 e.stopPropagation();  //停止事件传播
});

//好友列表菜单点击
$('body').delegate('.im-op_box li','click',function(e){
	var t = $(this), p = t.parents('.im-op_box'),pp = t.parents('li.fn-clear');
	p.removeClass('im-show');
	var uid = pp.attr('data-id'),
		if_f = pp.attr('data-f'),
		name = pp.find('.im-f_name span').text(),
		token = pp.attr('data-token'),
		photo= pp.find('.im-headimg img').attr('src');
	if(t.hasClass('im-chat_to')){
	 //和他聊天
	var html = [];
	var add_f = if_f=='1'?'':'im-show';
	$('.im-tab_ul .im-cur_btn').click(); //进入最新会话面板
	if($('.im-chat_panel>h2').attr('data-id')==uid){
		 return false;
	}

	if($('.im-cur_chat li[data-id='+uid+']').size()>0){
		$('.im-cur_chat li[data-id='+uid+']').click();
	}else{
		rec_page=1,recload=0; totalPage = 1;
		$('.im-cur_chat').prepend('<li class="fn-clear friend'+uid+'" data-id="'+uid+'" data-token="'+token+'" data-f="1"><div class="im-headimg"><img src="'+photo+'"></div><div class="im-_right"><h2 class="im-f_name"><span>'+name+'</span><i>'+getCurrentDate(3)+'</i></h2><div class="im-f_msg"><span></span></div></div><div class="im-delbox"><a href="javascript:;"></a></div></li>');
		$('.im-no_list').remove();
		$('.im-panel_box').find('.im-big_panel').remove();
		html.push('<div class="im-big_panel im-chat_panel im-show">');
		html.push('<h2 data-id="'+uid+'"><span class="im-to_fdetail">'+name+'</span><div class="im-btn_group '+add_f+'"><p class="im-to_f"><a href="javascript:;" class="im-btn_add">'+langData['siteConfig'][46][28]+'</a></p></div><i title="'+langData['siteConfig'][47][27]+'" class="im-close_btn"></i></h2>');//加为好友--关闭聊天窗口
		html.push('<div class="im-record_box"></div>');
		html.push('<div class="im-msgto_box im-chat_box"><div class="im-btn_group fn-clear"><div class="im-left_icon"><a href="javascript:;" class="im-emoj_btn"></a><a href="javascript:;" class="im-img_btn"></a></div><a href="javascript:;" class="im-record_btn">'+langData['siteConfig'][47][31]+'</a></div><div class="im-textarea" contenteditable></div><div class="im-msg_sendbox"><a href="javascript:;" class="im-msg_send">'+langData['siteConfig'][6][139]+'</a><span ><i title="'+langData['siteConfig'][47][28]+'"></i></span><ul class="im-send_way"><li class="im-active" data-value="enter">'+langData['siteConfig'][47][29]+'</li><li data-value="center">'+langData['siteConfig'][47][30]+'</li></ul></div></div>');//消息记录--发送--按Enter键发送或者按Ctrl+Enter键发送--按Enter键发送--按Ctrl+Enter键发送
		html.push('</div>');
		$('.im-panel_box').append(html.join(''));
		$('.im-cur_chat li[data-id='+uid+']').click();
	}



	}else if(t.hasClass('im-look_info')){
		//查看资料
		$('.im-cur_chat li').removeClass('im-pannel_curr');
		getf_info(uid)
	}else if(t.hasClass('im-del_f')){

		//删除好友
		$('.im-f_del').delay(100).addClass('im-an_show').attr('data-id',uid);
		$('.im-mask').show();
		//更改删除好友的信息
		$('.im-del_info').find('h2').text(name);
		$('.im-del_info').find('p').text('(ID:'+uid+')');
		$('.im-del_box').find('.im-del_head img').attr('src',photo)
	}
	return false;
//	 e.stopPropagation();  //停止事件传播
});
//确定删除好友
$('body').delegate('.im-sure_del','click',function(){
	var len_li = $('.im-f_list>li').length;

	if(len_li==1){
		$('.im-listBox .im-f_list').append('<div class="im-no_list" ><img src="'+staticPath+'images/im/no_img.png" /><p>'+langData['siteConfig'][47][33]+'~</p></div>')//还没有好友哦
	}
	var id=$(this).parents('.im-f_del').attr('data-id');
	var li = $('.im-f_list li[data-id='+id+']');
	delfriend(id,'',li); //删除好友


	$('.im-f_del').removeClass('im-an_show');
	$('.im-mask').hide();
})

//单击好友列表查看好友信息
$('body').delegate('.im-f_list.im-chat_list li.fn-clear','click',function(e){
	var uid = $(this).attr('data-id');
	getf_info(uid)
});


//搜索用户
$('body').delegate('.im-search_btn','click',function(){
$('.im-cur_chat li').removeClass('im-pannel_curr');
$('.im-panel_box').find('.im-big_panel').remove();
$('.im-panel_box').append('<div class="im-big_panel im-info_box im-show "><h2><span>'+langData['siteConfig'][47][35]+'</span><i title="'+langData['siteConfig'][47][36]+'" class="im-close_btn"></i></h2><div class="im-s_box" style="display: block;"><div class="im-f_search"><input type="text" placeholder="'+langData['siteConfig'][47][37]+'" /><a href="javascript:;">'+langData['siteConfig'][6][151]+'</a></div><div class="im-s_list"><ul></ul></div></div><div class="im-f_test"><div class="im-text-box"><textarea placeholder="'+langData['siteConfig'][47][34]+'"></textarea></div><a href="javascript:;" class="im-send_btn">'+langData['siteConfig'][6][139]+'</a></div>');//搜索用户--关闭窗口--请输入用户ID/手机号--搜索--请输入验证消息--发送

});

//返回搜索
$('body').delegate('.im-back_btn.im-back_search','click',function(){
	$('.im-search_btn').click();
});

//点击底部互动按钮
$('body').delegate('.im-op_tip li','click',function(){
	var t = $(this);
	if($('.im-big_panel.im-act_panel').length==0){
		var inhtml = [];
		inhtml.push('<div class="im-big_panel im-act_panel im-show"><h2><ul><li class="im-li_com im-on_panel"><a href="javascript:;">评论</a></li><li class="im-li_zan "><a href="javascript:;">'+langData['siteConfig'][47][38]+'</a></li></ul><i title="'+langData['siteConfig'][47][36]+'" class="im-close_btn"></i></h2>');//点赞--关闭窗口
		inhtml.push('<div class="im-act_box"><ul class="im-commt im-show"></ul><ul class="im-zan "></ul></div>');
		inhtml.push('<div class="im-replyto_box im-msgto_box"><div class="im-btn_group fn-clear"><div class="im-left_icon"><a href="javascript:;" class="im-emoj_btn" title="'+langData['siteConfig'][47][39]+'"></a></div></div><div class="im-area_box im-textarea" contenteditable ></div><div class="im-com_sendbox"><a href="javascript:;" class="im-comt_send">'+langData['siteConfig'][6][139]+'</a></div></div>');//表情--发送
		inhtml.push('<div class="com_loading"><i></i><p>'+langData['siteConfig'][38][2]+'</p></div></div>');//加载中
		$('.im-panel_box').find('.im-big_panel').remove();
		$('.im-panel_box').append(inhtml.join(''));
	}
	if(t.hasClass('im-btn_comm')){
		$('.im-act_box .im-commt').addClass('im-show').siblings('.im-zan').removeClass('im-show');
		$('.im-li_com').addClass('im-on_panel').siblings('li').removeClass('im-on_panel');
		if($('.im-act_box .im-commt li').length==0){
			getcommt();
		}
		$.ajax({
	       url: '/include/ajax.php?service=member&action=updateRead&type=commt',
	       type: "GET",
	       dataType: "json",
	       success: function (data) {
		     console.log('更新完成');
		     $('.im-btn_comm span').html(langData['siteConfig'][6][114]);//评论
		     getnum();
	       },
	       error: function(){
	         console.log(langData['siteConfig'][37][80]);  //请求出错请刷新重试
	       }
		});
	}else {
		$('.im-act_box .im-zan').addClass('im-show').siblings('.im-commt').removeClass('im-show');
		$('.im-li_zan').addClass('im-on_panel').siblings('li').removeClass('im-on_panel');
		if($('.im-act_box .im-zan li').length==0){
			getzan()
		}
		$.ajax({
	       url: '/include/ajax.php?service=member&action=updateRead&type=zan',
	       type: "GET",
	       dataType: "json",
	       success: function (data) {
	       	 $('.im-btn_comm span').html(langData['siteConfig'][46][57]);//赞
		     console.log('更新完成');
		     getnum();
	       },
	       error: function(){
	         console.log(langData['siteConfig'][37][80]);  //请求出错请刷新重试
	       }
		});
	}
	$('.im-op_tip').hide();
});
$('body').delegate('.im-bottom_btn .im-msg_btn','mouseenter',function(){
	$('.im-op_tip').show();
});
$('body').delegate('.im-bottom_btn .im-msg_btn','mouseleave',function(){
	$('.im-op_tip').hide();
});
//点击删除按钮， 删除最新消息
$('body').delegate('.im-msg_list .im-delbox','click',function(){
	var t = $(this),p=t.parents('li'),id = p.attr('data-id');len = p.parents('ul.im-msg_list').find('li').length;
		 $.ajax({
	          url: "/include/ajax.php?service=member&action=delMessage&id="+id,
	          type: "GET",
	          dataType: "jsonp",
	          success: function (data) {
	            if(data && data.state == 100){
	              gettiplist()
				  showMsg(langData['siteConfig'][47][40])//已删除
	            }else{
	              alert(data.info);
	              t.siblings("a").show();
	              t.removeClass("load");
	            }
	          },
	          error: function(){
	            alert(langData['siteConfig'][20][183]);
	            t.siblings("a").show();
	            t.removeClass("load");
	          }
	        });

	     return false;
	p.remove();
	if(len==1){
		$('.im-listBox .im-msg_list').append('<div class="im-no_list" ><img src="images/no_img.png" /><p>'+langData['siteConfig'][47][41]+'~</p></div>')//暂时没有新消息
	}

});

/*---------------------此处是列表面板的相关脚本e----------------------*/
/*=======================================================================*/
/*---------------------此处是搜索添加好友的相关脚本s----------------------*/
//点击搜索
$('body').delegate('.im-f_search a','click',function(){
	var val = $('.im-f_search input').val(),data;
	if(val==''){
		showMsg(langData['siteConfig'][47][42]);//请输入手机号或者ID账号
		return 0;
	}
	$.ajax({
        url: '/include/ajax.php?service=siteConfig&action=searchMember&keywords='+val,
        type: 'post',
        dataType: 'json',
        success: function(data){

            if(data.state == 100){
               var data = data.info;
               var isfriend = data[0].isfriend?'fn-hide':'';
               var addr = data[0].addrName?data[0].addrName.split('>'):'';
               $('.im-s_list ul').html('<li class="fn-clear" data-id="'+data[0].userid+'" data-f="0"><a href="javascript:;" class="im-right_addbtn '+isfriend+'">'+langData['siteConfig'][46][28]+'</a><div class="im-left_info" title="'+langData['siteConfig'][47][43]+'"><span class="im-s_head"><img onerror="nofind();" src="'+(data[0].photo?data[0].photo:staticPath+"images/noPhoto_60.jpg")+'" /></span><div class="im-_info"><h3>'+data[0].nickname+'<span class="im-keyval">('+val+')</span></h3><p>'+(data[0].addrName?(addr[0]+addr[1]):langData['siteConfig'][31][108])+'</p></div></div></li>');//加为好友--点击查看资料--未填写
            }else{
               //没有找到
               $('.im-s_list ul').html('<div class="im-no_list" ><img src="'+staticPath+'images/im/no_img.png" /><p>'+langData['siteConfig'][47][44]+'~</p></div>')//没有符合条件的用户
            }
        },
        error: function(){
            console.log(langData['siteConfig'][46][63]);//网络错误，初始化失败！
        }
    });

});

//点击查看资料
$('body').delegate('.im-left_info','click',function(){
	var f_id = $(this).parents('li').attr('data-id'),if_f =$(this).parents('li').attr('data-f') ;
	var f_name = $(this).find('.im-_info h3').text();
	//查看资料
	getf_info(f_id,'info');
});

//点击添加好友
$('body').delegate('.im-right_addbtn','click',function(e){
	var t=$(this),p=t.parents('li'),f_id = p.attr('data-id'),f_name = p.find('.im-_info h3').text();
	$('.im-f_test').attr('data-id',f_id).animate({'bottom':0},150);
	$('.im-f_test').find('textarea').text(langData['siteConfig'][46][6] +userinfo['name'])//我是
	$(document).one('click',function(){
		$('.im-f_test').attr('data-id','').animate({'bottom':'-150px'},150);
	});
	//根据id查找token
	$.ajax({
        url: '/include/ajax.php?service=siteConfig&action=getImToken&userid='+f_id,
        type: 'post',
        dataType: 'json',
        success: function(data){
        	if(data.state==100){

        		toUserinfo = {
		            'uid': data.info.uid,
		            'name': data.info.name,
		            'photo':data.info.photo
		        };
		        toChatToken = data.info.token;
        	}
        },
        error: function(){
            console.log(langData['siteConfig'][46][63]);//网络错误，初始化失败！
            return false;
        }
    });
	 e.stopPropagation();  //停止事件传播
});
$('body').delegate('.im-f_test','click',function(e){
	e.stopPropagation();  //停止事件传播
})
//发送验证信息
$('body').delegate('.im-f_test .im-send_btn','click',function(){
	var userid = $('.im-f_test').attr('data-id');
	var note = $('.im-text-box textarea').val();
	addfirend(userid,note);
   if($('.im-cur_chat li.friend'+userid).length==0){
   		//聊天列表中没有，更新一下聊天列表
         getcurlist();

   }

});
//关闭搜索框
$('body').delegate('.im-big_panel .im-close_btn','click',function(){
	$(this).parents('.im-big_panel').remove();
	$('.im-cur_chat').find('li').removeClass('im-pannel_curr');
	toUserinfo='';
});


/*---------------------此处是搜索添加好友的相关脚本e----------------------*/

/*=======================================================================*/

/*---------------------此处是查看好友资料的相关脚本s----------------------*/
//和TA聊天
$('body').delegate('.im-info_btn .im-chat_with','click',function(){

	var t = $(this),p = t.parents('.im-info_box'),if_f = p.find('h2').attr('data-f');
	var to_id = p.find('h2').attr('data-id'),to_name = p.find('h2').find('span').text();
	$('.im-cur_btn').click();
	if($('.im-cur_chat li[data-id="'+to_id+'"]').size()>0){
		$('.im-cur_chat li[data-id="'+to_id+'"]').click();
		return false;
	}
    //根据id查找token
	$.ajax({
        url: '/include/ajax.php?service=siteConfig&action=getImToken&userid='+to_id,
        type: 'post',
        dataType: 'json',
        success: function(data){
        	if(data.state==100){
        		toUserinfo = {
		            'uid': data.info.uid,
		            'name': data.info.name,
		            'photo':data.info.photo
		        };
		        toChatToken = data.info.token;
		        $('.im-cur_chat').prepend('<li class="fn-clear  friend'+toUserinfo["uid"]+' im-pannel_curr" data-token="'+toChatToken+'" data-id="'+toUserinfo['uid']+'"><div class="im-headimg"><img src="'+toUserinfo["photo"]+'"></div><div class="im-_right"><h2 class="im-f_name" title="'+toUserinfo["name"]+'"><span>'+toUserinfo["name"]+'</span><i></i></h2><div class="im-f_msg"><span></span></div></div><div class="im-delbox"><a href="javascript:;" title="'+langData['siteConfig'][47][45]+'"></a></div></li>')//删除会话
        	}
        },
        error: function(){
            console.log(langData['siteConfig'][46][63]);//网络错误，初始化失败！
            return false;
        }
    });


	//获取聊天记录
	var html = [];
	var add_f = if_f=='1'?'':'im-show';
	$('.im-panel_box').find('.im-big_panel').remove();
	html.push('<div class="im-big_panel im-chat_panel im-show">');
	html.push('<h2 data-id="'+to_id+'"><span class="im-to_fdetail">'+to_name+'</span><div class="im-btn_group '+add_f+'"><p class="im-to_f"><a href="javascript:;" class="im-btn_add">'+langData['siteConfig'][46][28]+'</a></p></div><i title="'+langData['siteConfig'][47][27]+'" class="im-close_btn"></i></h2>');//加为好友--关闭聊天窗口
	html.push('<div class="im-record_box"></div>');
	html.push('<div class="im-msgto_box im-chat_box"><div class="im-btn_group fn-clear"><div class="im-left_icon"><a href="javascript:;" class="im-emoj_btn"></a><a href="javascript:;" class="im-img_btn">  </a></div><a href="javascript:;" class="im-record_btn">'+langData['siteConfig'][47][31]+'</a></div><div class="im-textarea" contenteditable></div><div class="im-msg_sendbox"><a href="javascript:;" class="im-msg_send">'+langData['siteConfig'][6][139]+'</a><span ><i title="'+langData['siteConfig'][47][28]+'"></i></span><ul class="im-send_way"><li class="im-active" data-value="enter">'+langData['siteConfig'][47][29]+'</li><li data-value="center">'+langData['siteConfig'][47][30]+'</li></ul></div></div>');//消息记录--发送--按Enter键发送或者按Ctrl+Enter键发送--按Enter键发送--按Ctrl+Enter键发送
	html.push('</div>');
	$('.im-panel_box').append(html.join(''));
	$('.im-f_test').animate({'bottom':'-150px'});   //隐藏验证框
	var totolPage = 1;
	getrecord();  //首次加载聊天记录

});

//返回和TA聊天
$('body').delegate('.im-back_btn.im-back_chat','click',function(){
	var t = $(this),p = t.parents('.im-info_box'),if_f = p.find('h2').attr('data-f');
	var to_id = p.find('h2').attr('data-id'),to_name = p.find('h2').find('span').text();
	$('.im-cur_btn').click();
	if($('.im-cur_chat li[data-id="'+to_id+'"]').size()>0){
		$('.im-cur_chat li[data-id="'+to_id+'"]').click();
		return false;
	}
    //根据id查找token
	$.ajax({
        url: '/include/ajax.php?service=siteConfig&action=getImToken&userid='+to_id,
        type: 'post',
        dataType: 'json',
        success: function(data){
        	if(data.state==100){
        		toUserinfo = {
		            'uid': data.info.uid,
		            'name': data.info.name,
		            'photo':data.info.photo
		        };
		        toChatToken = data.info.token;
		        $('.im-cur_chat').prepend('<li class="fn-clear  friend'+toUserinfo["uid"]+' im-pannel_curr" data-token="'+toChatToken+'" data-id="'+toUserinfo['uid']+'"><div class="im-headimg"><img src="'+toUserinfo["photo"]+'"></div><div class="im-_right"><h2 class="im-f_name" title="'+toUserinfo["name"]+'"><span>'+toUserinfo["name"]+'</span><i></i></h2><div class="im-f_msg"><span></span></div></div><div class="im-delbox"><a href="javascript:;" title="'+langData['siteConfig'][47][45]+'"></a></div></li>')//删除会话
        	}
        },
        error: function(){
            console.log(langData['siteConfig'][46][63]);//网络错误，初始化失败！
            return false;
        }
    });




	//获取聊天记录
	var html = [];
	var add_f = if_f=='1'?'':'im-show';
	$('.im-panel_box').find('.im-big_panel').remove();
	html.push('<div class="im-big_panel im-chat_panel im-show">');
	html.push('<h2 data-id="'+to_id+'"><span class="im-to_fdetail">'+to_name+'</span><div class="im-btn_group '+add_f+'"><p class="im-to_f"><a href="javascript:;" class="im-btn_add">'+langData['siteConfig'][46][28]+'</a></p></div><i title="'+langData['siteConfig'][47][27]+'" class="im-close_btn"></i></h2>');//加为好友--关闭聊天窗口
	html.push('<div class="im-record_box"></div>');
	html.push('<div class="im-msgto_box im-chat_box"><div class="im-btn_group fn-clear"><div class="im-left_icon"><a href="javascript:;" class="im-emoj_btn"></a><a href="javascript:;" class="im-img_btn">  </a></div><a href="javascript:;" class="im-record_btn">'+langData['siteConfig'][47][31]+'</a></div><div class="im-textarea" contenteditable></div><div class="im-msg_sendbox"><a href="javascript:;" class="im-msg_send">'+langData['siteConfig'][6][139]+'</a><span ><i title="'+langData['siteConfig'][47][28]+'"></i></span><ul class="im-send_way"><li class="im-active" data-value="enter">'+langData['siteConfig'][47][29]+'</li><li data-value="center">'+langData['siteConfig'][47][30]+'</li></ul></div></div>');//消息记录--发送--按Enter键发送或者按Ctrl+Enter键发送--按Enter键发送--按Ctrl+Enter键发送
	html.push('</div>');
	$('.im-panel_box').append(html.join(''));
	$('.im-f_test').animate({'bottom':'-150px'});   //隐藏验证框
	var totolPage = 1;
	getrecord();  //首次加载聊天记录

});

$('body').delegate('.im-add_f','click',function(e){
	var f_id = $('.im-big_panel.im-info_box').find('h2').attr('data-id')
	$('.im-f_test').attr('data-id',f_id).animate({'bottom':0},150);
	$(document).one('click',function(){
		$('.im-f_test').attr('data-id','').animate({'bottom':'-150px'},150);
	});
	 e.stopPropagation();  //停止事件传播
})

//发送图片

$('body').delegate('.im-img_btn','click',function(){
	$('.im-photo input').click();
})
$('body').delegate('.im-photo input','change',function(){
	if ($(this).val() == '') return;
	mysub();

})
	//上传图片
  function mysub(){
	var photo = $('.im-photo')
    var data = [];
    data['mod']  = "siteConfig";
    data['type'] = "im";
    data['filetype'] = "image";
    var fileId = photo.find("input[type=file]").attr("id");
    $.ajaxFileUpload({
      url: "/include/upload.inc.php",
      fileElementId: fileId,
      dataType: "json",
      data: data,
      success: function(m, l) {
        if (m.state == "SUCCESS") {
			msgto(m,'image')
        } else {
          alert(langData['siteConfig'][20][306]);   //上传失败
        }
      },
      error: function() {
		alert(langData['siteConfig'][20][531]);  //网络错误，上传失败！
      }
    });

  }

/*---------------------此处是查看好友资料的相关脚本e----------------------*/

/*=======================================================================*/

/*---------------------聊天窗口相关脚本s----------------------*/


//添加好友
$('body').delegate('.im-btn_group .im-btn_add','click',function(){

	var t =$(this),p = t.parents('h2'),f_name = p.children('span').text(),f_id = p.attr('data-id');
	$('.im-f_add').addClass('im-an_show').find('textarea').val(langData['siteConfig'][46][6]+userinfo['name']);//我是
	$('.im-mask').show();
	$('.im-notes_panel').animate({'right':'-540px'},150);
	$('.im-panel_box').animate({'right':'0'},150);
	r_show=0;

});

//点击取消，此处与删除好友的取消操作一致
$('body').delegate('.im-close_p,.im-cancel','click',function(){
	var t = $(this);
	t.parents('.im-tip_p').removeClass('im-an_show');
	$('.im-mask').hide();
});

//点击发送
$('body').delegate('.im-send_test','click',function(){
	var t = $(this),msg_test = $('#im-msg_txt').val();
	addfirend(toUserinfo['uid'],msg_test);
	$('.im-record_box').scrollTop( $('.im-record_box')[0].scrollHeight );//自动滚到最底
	t.parents('.im-tip_p').removeClass('im-an_show');
	$('.im-mask').hide();
	$('#im-msg_txt').val('');
});

//选择表情
var memerySelection
var emj_f = 0;
$('body').delegate('.im-emoj_btn','click',function(e){

    if($('.im-emoji-list').find('li').length == 0){
        $(".im-emoji-list").html(appendEmoji());
    }

	if(!emj_f){
		emj_f = 1;
		$('.im-emoji-hide').addClass('im-show');
	}else{
		emj_f = 0;
		$('.im-emoji-hide').removeClass('im-show');
	}

	$(document).one('click',function(){
		$('.im-emoji-hide').removeClass('im-show');
	});
	e.stopPropagation();  //停止事件传播
});

$('body').delegate('.im-emoji-list li','click',function(e){
	memerySelection = window.getSelection();
	$('.im-big_panel.im-show .im-textarea').focus();
	var t = $(this),emojsrc = t.find('img').attr('src');
	var txt = t.attr('data-txt');
	pasteHtmlAtCaret('<img src="'+emojsrc+'" data-txt="'+txt+'" />');
	$('.im-emoji-hide').removeClass('im-show');
	$(document).one('click',function(){
		$('.im-replyto_box').animate({'height':'0'},150);
	});
	 e.stopPropagation();  //停止事件传播

});



//查看语音消息
// var amr  = '';
// setTimeout(function(){
// 	amr = new BenzAMRRecorder();
// },5000)

$('body').delegate('.im-m_content.im-s_content', 'click', function(){
    var t = $(this).children('.im-speak_msg'), id = t.attr('data-id');
    var init = t.find('audio.chat_audio');
	var aUrl = init.attr('src');
	if(amr && amr.isInit()){
		amr.stop();
	}
	amr = new BenzAMRRecorder();
	if(amr.isPlaying()){   //是否正在播放
		t.removeClass('im-voicePlay');
		amr.stop();
	}else{
		t.addClass('im-voicePlay');
		amr.initWithUrl(aUrl).then(function() {  //重新初始化
		  amr.play();
		});
	}
	amr.onEnded(function(){
		t.removeClass('im-voicePlay');  //是否播放完成
	})
    return false;
  })

//发送消息相关操作

$('body').delegate('.im-msg_sendbox span','click',function(e){
	$('.im-send_way').show();

	$(document).one('click',function(){
		$('.im-send_way').hide();
	});
	e.stopPropagation();  //停止事件传播
});
$('body').delegate('.im-send_way li','click',function(e){
	$(this).addClass('im-active').siblings('li').removeClass('im-active');
	$(this).parents('.im-send_way').hide();
	e.stopPropagation();  //停止事件传播
});

$('body').delegate('.im-msg_sendbox ','click',function(e){
	var id = $('.im-chat_panel h2').attr('data-id');
	var html = $('.im-textarea').html();
	for(var i=0; i<$('.im-textarea img').length; i++){
		var t = $('.im-textarea img').eq(i);
		var txt = t.attr('data-txt');
		t.after(txt);
		// t.after('△'+t.attr('src')+'△');
	}
	$('.im-textarea img').remove();

	var msg = $('.im-textarea').html();
	msgto(msg,'text');
	$('.im-textarea').html('');
});


//按键发送

$('body').delegate('.im-chat_box .im-textarea','keydown',function(e){
	var keydo = $('.im-send_way li.im-active').attr('data-value');
	var html = $('.im-textarea').html();

	e = event || window.event;
	if(keydo=='enter'&&e.keyCode == 13&&!e.ctrlKey){
		for(var i=0;i<$('.im-textarea img').length; i++){
			var t = $('.im-textarea img').eq(i)
			var txt = t.attr('data-txt');
			t.after(txt);
			// t.after('△'+t.attr('src')+'△');
		}
		$('.im-textarea img').remove()
		var msg = $('.im-textarea').html();
		msgto(msg,'text');
		$('.im-textarea').html('');
   		e.returnValue = false;
		return false;
	}else if(keydo=='center'&&e.ctrlKey && e.keyCode == 13) {
		for(var i=0;i<$('.im-textarea img').length; i++){
			var t = $('.im-textarea img').eq(i);
			var txt = t.attr('data-txt');
			t.after(txt);
			// t.after('△'+t.attr('src')+'△');
		}
		$('.im-textarea img').remove()
		var msg = $('.im-textarea').html();
		msgto(msg,'text');
		$('.im-textarea').html('');
    	e.returnValue = false;
		return false;
   }
});

//按键搜索
$('body').delegate('.im-f_search input','keydown',function(e){
	e = event || window.event;
	if(e.keyCode == 13){
		$('.im-f_search a').click();
	}
});

//资料面板搜索
$('body').delegate('.im-btn_group .im-del_f','click',function(){
	var id = $('.im-info_box h2').attr('data-id');
	var li = $('.im-f_list li[data-id="'+id+'"]');
	var name = $('.im-f_list li[data-id="'+id+'"]').find('.im-f_name').text();
	var photo = $('.im-f_list li[data-id="'+id+'"]').find('.im-headimg img').attr('src');
	$('.im-f_del').delay(100).addClass('im-an_show').attr('data-id',id);
	$('.im-mask').show();
		//更改删除好友的信息
	$('.im-del_info').find('h2').text(name);
	$('.im-del_info').find('p').text('(ID:'+id+')');
	$('.im-del_box').find('.im-del_head img').attr('src',photo)
})


//查看大图
$('body').delegate('.im-img_content img,.im-chat-text>img','click',function(e){
	var bigimg = $(this).attr('src');
	$('.im-big_img').addClass('im-show');
	$('.im-big_img img').attr('src',bigimg);
	$(document).one('click',function(){
		$('.im-big_img').removeClass('im-show');
		$('.im-big_img img').attr('src','');
	});
	e.stopPropagation();  //停止事件传播
});



function msgto(msg,type){
	if(msg==''){
		showMsg('不能发送空消息');
	}else{
		var time = Math.round(new Date().getTime()/1000).toString();
        var imgData = {
            fileSize: "2203",
            fileType: ".png",
            name: "15570260876393.png",
            original: "aficon1.png",
            poster: "",
            state: "SUCCESS",
            turl: "http://gz.215000.com/uploads/article/thumb/large/2019/05/05/15570260876393.png",
            type: "thumb",
            url: "VlRsVE9sTTdWbUpWWlE9PQ==",
            height: "110",
            width: "110"
        };
        var data = {
            content: msg,
            contentType: type,
            from: chatToken,
            fid: userinfo['uid'],
            to: toChatToken,
            tid: toUserinfo['uid'],
            type: "person",
            time: time
        }
        $.ajax({
            url: '/include/ajax.php?service=siteConfig&action=sendImChat',
            data: data,
            type: 'post',
            dataType: 'json',
            success: function(data){
                chatLib.reset();
            },
            error: function(){

            }
        });
        if(type!="link"){
        	//更新好友列表最新消息
	        $('.im-cur_chat .friend' + toUserinfo['uid']).find('.im-f_name i').html(transTimes(time, 4) );
	        if(data.contentType=='text'){
	        	$('.im-cur_chat .friend' + toUserinfo['uid']).find('.im-f_msg span').html(msg.replace(/△(.+?)△/g,'<img src="$1"/>'));
	        }else{
	        	$('.im-cur_chat .friend' + toUserinfo['uid']).find('.im-f_msg span').html('[图片]');
	        }

			 data.from = userinfo['uid'];
	         data.to = toUserinfo['uid'];
	         createEle(data);
        }


	}
}

//查看聊天记录
var r_show=0
$('body').delegate('.im-record_btn,.im-notes_panel .im-close_btn','click',function(){
	if(!r_show){
		$('.im-notes_panel').animate({'right':0},150);
		$('.im-panel_box').animate({'right':'172px'},150);
		$('.im-notebox.im-notes_panel h2').find('span').text($('.im-to_fdetail').text())
		r_show=1;
		getrecord_1(1);
	}else{
		$('.im-notes_panel').animate({'right':'-540px'},150);
		$('.im-panel_box').animate({'right':'0'},150);
		r_show=0;
	}

});



/*---------------------聊天窗口相关脚本e----------------------*/

/*=======================================================================*/

/*---------------------查看聊天记录相关脚本s----------------------*/
//设置聊天记录框的高度
$('.nim-otes_panel').height($(window).height());
$('body').delegate('.im-page_chose>a','click',function(){
	var classname = $(this).attr('class'),page;
	var page_show = $(".im-page_mum").val(),total = $('.im-to_first').attr('data-total');
	if(classname=='im-to_first'){
		if(page_show==total){
			return 0;
		}
		page = total
	}else if(classname=='im-prev'){
		if(page_show==total){
			return 0;
		}
		page=page_show*1+1;

	}else if(classname=='im-next'){
		if(page_show==1){
			return 0;
		}
		page=page_show*1-1;

	}else if(classname=='im-to_last'){
		if(page_show==1){
			return 0;
		}
			page=1;
	}
	getrecord_1(page);
});

//导出聊天记录
$('body').delegate('.im-btn_op','mouseenter',function(e){
	$('.im-zhe').show();

});
$('body').delegate('.im-zhe','mouseenter',function(e){
	$('.im-pop_record').show();

});
$('body').delegate('.im-zhe','mouseleave',function(e){
	$('.im-pop_record').hide();
});

/*---------------------查看聊天记录相关脚本e----------------------*/

/*---------------------点赞评论相关脚本s----------------------*/
//点赞评论切换
$('body').delegate('.im-act_panel h2 li','click',function(e){
	var index =$(this).index(),t=$(this);
	t.addClass('im-on_panel').siblings('li').removeClass('im-on_panel');
	$('.im-act_box ul').eq(index).addClass('im-show').siblings('ul').removeClass('im-show');
	if($('.im-act_box .im-show').find('li').length==0){
		if($('.im-act_box .im-show').hasClass('im-commt')){
			getcommt()
		}else if($('.im-act_box .im-show').hasClass('im-zan')){
			getzan()
		}
	}
});

//回复
$('body').delegate('.im-zan_con span.im-btn_reply','click',function(e){
	var t = $(this), p=t.parents('li'),nic = p.find('h3 span.im-nicname').text();
	$('.im-replyto_box .im-comt_send').attr('data-id',$(this).attr('data-id'));
	$('.im-replyto_box').find('.im-area_box').attr('placeholder',langData['siteConfig'][6][29]+'  '+nic+'：')//回复
	$('.im-replyto_box').animate({'height':'150px'},150);
	set_focus($('.im-area_box'));
	$(document).one('click',function(){
		$('.im-replyto_box').animate({'height':'0'},150);
	});
	 e.stopPropagation();  //停止事件传播
	 return false;
});

//发送回复

$('body').delegate('.im-replyto_box .im-comt_send','click',function(){
	var re_con = $(".im-area_box").html();
	var id = $(this).attr('data-id');
	if(re_con==''){
		showMsg(langData['siteConfig'][47][46]);//请输入评论内容
		return false;
	}
	$.ajax({
		url: '/include/ajax.php?service=member&action=replyComment&id='+id+'&content='+re_con,
		type: 'post',
		dataType: 'json',
		success: function(data){
			if(data.state == 100){
			    showMsg(langData['siteConfig'][44][91]);//已发送
			    $('.im-replyto_box').animate({'height':'0'},150);
			}else{
			    alert(data.info);
			}
		},
		error: function(){
			alert(langData['siteConfig'][46][63]);//网络错误，初始化失败！
		}
	});

	showMsg(langData['siteConfig'][44][91])//已发送
});

$('body').delegate('.im-replyto_box','click',function(e){
	 e.stopPropagation();  //停止事件传播
});

/*---------------------点赞评论相关脚本e----------------------*/



//点击消息提示，出现面板
var refreshTimeout;
$('body').delegate('.im-msg_tip','click',function(){
	$(this).hide();
	refreshTimeout = setInterval(function(){
		checkGetList()
	},5000)
    getflist();//获取好友列表
    getcurlist();//获取最新聊天
    gettiplist();//获取账户消息
	$('.im-panel_box').animate({'bottom':'0'},150)

});



//消息点击跳转消息详情
$('body').delegate('.im-msg_list li','click',function(){
	var url = $(this).attr('data-url');
	window.open(url) ;
	return false;
})

//最新消息加载
var nDivHight = $(".im-listBox").height();
$('.im-listBox').scroll(function(){
	 nScrollHight = $(this)[0].scrollHeight;
     nScrollTop = $(this)[0].scrollTop;
     if (nScrollTop + nDivHight >= nScrollHight&&$(".im-msg_list").hasClass('im-show')&&!isload) {
         gettiplist()
     }
});

//聊天记录翻页
$('body').delegate('.im-record_box','mousewheel',function(e){
	var p = e.originalEvent.deltaY;

	if($(this)[0].scrollTop<=50 && !recload && $(this).html()!=''&& p<0&&fin){
		fin=0;
		$('.im-more').addClass(' im-rec_loading1').find('span').html('');
		setTimeout(function(){
			getrecord('prepend');
		},500);

	}
});
//聊天记录翻页
$('body').delegate('.im-record_box','DOMMouseScroll',function(e){
	var p = e.originalEvent.deltaY;

	if($(this)[0].scrollTop<=50 && !recload && $(this).html()!=''&&fin){
		fin=0;
		$('.im-more').addClass(' im-rec_loading1').find('span').html('');
		setTimeout(function(){
			getrecord('prepend');
		},500);

	}
});

$('body').delegate('.im-more','click',function(){
	if( !recload){
		$('.im-more').addClass(' im-rec_loading1').find('span').html('');
		setTimeout(function(){
			getrecord('prepend');
		},500);
	}

});

//验证消息重复查看
$('body').delegate('.im-apply_msg','click',function(){
	var p = $(this).parents('.im-chat_item');
	if(p.hasClass('im-from_other') ){
		$('.im-chat_panel').find('h2 .im-btn_group.im-show p.im-to_f').html(langData['siteConfig'][47][26]+'<a href="javascript:;" class="im-btn_agree">'+langData['siteConfig'][6][2]+'</a><a class="im-btn_refuse" href="javascript:;">'+langData['siteConfig'][47][25]+'</a>')//对方请求加为好友--同意--忽略
	}
});

//同意添加好友
$('body').delegate('.im-btn_agree','click',function(){
	$('.im-btn_group').removeClass('im-show')
	var note = langData['siteConfig'][46][82];//已成功添加对方为好友
	var id = $('.im-chat_panel').find('h2').attr('data-id')
	addfirend(id,note);
});

//忽略
$('body').delegate('.im-btn_refuse','click',function(){
	$(this).parents('.im-to_f').html('<a href="javascript:;" class="im-btn_add">'+langData['siteConfig'][46][28]+'</a>');//加为好友

});



//评论点赞加载更多
$('body').delegate('.im-act_box','mousewheel',function(e){
 var nDivHight2 = $(".im-act_box").height();
	 rec_con = $('.im-record_box').html();
	 nScrollHight = $(this)[0].scrollHeight;
     nScrollTop = $(this)[0].scrollTop;
     if (nScrollTop + nDivHight2 >= nScrollHight&&$(".im-zan").hasClass('im-show')&&!zanload&&fin_zan) {
     	 fin_zan=0
         getzan();
     }else if(nScrollTop + nDivHight2 >= nScrollHight&&$(".im-commt").hasClass('im-show')&&!cmload&&fin_comm) {
     	fin_comm=0
     	getcommt();
     }
});


 //删除好友
 function delfriend(id,type,li){ //好友id,好友列表/最新对话列表,li

 	$.ajax({
        url: '/include/ajax.php?service=siteConfig&action=delFriend&tid='+id+'&type='+type,
        type: 'post',
        dataType: 'json',
        success: function(data){
        	if(data.state == 100){
        		showMsg(langData['siteConfig'][47][47]);//已经删除
            	li.remove();
            	var chatid = $('.im-chat_panel.im-show').find('h2').attr('data-id');
				if(id==chatid){
					$('.im-chat_panel').remove();
				}
        	}
        },
        error: function(){
            console.log(langData['siteConfig'][46][63]);//网络错误，初始化失败！
            return false;
        }
    });
 }


//获取好友资料
function getf_info(id,type){

	$.ajax({
        url: '/include/ajax.php?service=member&action=detail&id='+id+'&friend=1&shop=1',
        type: 'post',
        dataType: 'json',
        success: function(data){
        	if(data.state == 100){
        		var detail = data.info;
				if(detail.addrName){
					var addr = detail.addrName.split('>');
				}
        		var isfriend = '';
        		if(detail.isfriend){
        			isfriend='<a href="javascript:;" class="im-del_f">'+langData['siteConfig'][46][20]+'</a>'//删除好友
        		}else{
        			isfriend='<a href="javascript:;" class="im-add_f">'+langData['siteConfig'][46][28]+'</a>'//加为好友
        		}
				var backtype = '';
				if(type=='info'){
					backtype = 'im-back_search';
				}else if(type=='chatlog'){

					backtype = 'im-back_chat';
				}
        		var infohtml = [];
				infohtml.push('<div class="im-big_panel im-info_box im-show "><h2 class="'+(type?"center_align":"")+'" data-f="'+detail.isfriend+'" data-id="'+detail.userid+'">'+(type?"<i class='im-back_btn "+backtype+"' title ='"+langData['siteConfig'][47][49]+"'>"+langData['siteConfig'][6][117]+"</i>"+detail.nickname:langData['siteConfig'][47][48].replace('1','<span>'+detail.nickname+'</span>')+"<i title='"+langData['siteConfig'][47][36]+"' class='im-close_btn'></i>")+'</h2>');//返回聊天窗口 -- 返回--1的基本资料--关闭窗口
				infohtml.push('<div class="im-f_box im-show" ><div class="im-info_list"><ul><li><label>'+langData['siteConfig'][47][50]+'</label><span>'+detail.nickname+'</span></li><li><label>'+langData['siteConfig'][47][51]+'</label><span>'+(detail.sex=='0'?langData['siteConfig'][13][5]:langData['siteConfig'][13][4])+'</span></li><li class="huoniao_privacy"><label>Q&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Q</label><span>'+detail.qq+'</span></li><li class="huoniao_privacy"><label>'+langData['siteConfig'][47][52]+'</label><span>'+transTimes(detail.birthday,2)+'</span></li><li><label>'+langData['siteConfig'][19][27]+'</label><span>'+(detail.addrName?(addr[0]+addr[1]):"")+'</span></li></ul><div class="im-btn_group im-info_btn"><a target="_blank" href="/user/'+detail.userid+'" class="im-homepage">'+langData['siteConfig'][47][87]+'</a><a href="javascript:;" class="im-chat_with">'+langData['siteConfig'][47][53]+'</a>'+isfriend+'</div></div><div class="im-f_test"><div class="im-text-box"><textarea placeholder="'+langData['siteConfig'][47][34]+'"></textarea></div><a href="javascript:;" class="im-send_btn">'+langData['siteConfig'][6][139]+'</a></div>');//昵&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;称--性&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;别--女--男--生&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;日--所在区域--注册时间--TA的主页--和TA聊天--请输入验证消息
				var shop =[];
        		if(detail.shopList){
        			var slist = detail.shopList
        			for(var i=0; i<slist.length; i++){
        				if(slist[i].module=='job'){
        					shop.push('<li class="im-zhaopin"><a href="'+slist[i].url+'" class=" fn-clear"><div class="im-_leftLogo"><i></i><span>'+langData['siteConfig'][19][241]+'</span></div><div class="im-shop_info"><h3>'+slist[i].title+'  </h3><p><span>'+(slist[i].item[0]?slist[i].item[0].title:langData['siteConfig'][47][55])+'</span><em>|</em><span>'+(slist[i].item[1]?slist[i].item[1].title:langData['siteConfig'][47][54])+'</span></p></div></a></li>');//招聘--暂无招聘职位--暂无信息
        				}else{
        					var module=langData['siteConfig'][17][12];//店铺
        					if(slist[i].module=='article'){
        						module = langData['siteConfig'][18][91]//资讯
        					}else if(slist[i].module=='tuan'){
        						module = langData['siteConfig'][16][46]//团购
        					}else if(slist[i].module=='waimai'){
        						module = langData['siteConfig'][16][48]//外卖
        					}else if(slist[i].module=='shop'){
        						module = langData['siteConfig'][16][47]//商城
        					}
        					shop.push('<li class="im-shop"><a href="'+slist[i].url+'" class=" fn-clear"><div class="im-_leftLogo "><i></i><span>'+module+'</span></div><div class="im-shop_info"><h3>'+slist[i].title+'</h3><p>'+slist[i].note+'</p></div></a></li>')
        				}
        			}
        			infohtml.push('<div class="im-shop_box"><h3>'+langData['siteConfig'][46][47]+'</h3><ul>'+shop.join('')+'</ul></div></div>');//TA的店铺
        		}

				$('.im-panel_box').find('.im-big_panel').remove();
				$('.im-panel_box').append(infohtml.join(''));

        	}
        },
        error: function(){
            console.log(langData['siteConfig'][46][63]);//网络错误，初始化失败！
            return false;
        }
    });
}

 function addfirend(id,note){
 	$.ajax({
        url: '/include/ajax.php?service=siteConfig&action=applyFriend&tid='+id+'&note='+note,
        type: 'post',
        dataType: 'json',
        success: function(data){
        	if(data.state==100){
        		if(data.info==langData['siteConfig'][46][79]){ //申请成功
        			showMsg(langData['siteConfig'][47][56])//已发送好友申请，等待对方验证通过
        		}else if(data.info==langData['siteConfig'][46][81]){ //添加成功
        			showMsg(langData['siteConfig'][46][82]); //已成功添加对方为好友
        		}


	            $('.im-f_test').animate({'bottom':'-150px'},150);
	            var data = {
	            	content: note,
		            contentType: 'apply',
		            from: chatToken,
		            fid: userinfo['uid'],
		            to: toChatToken,
		            tid: toUserinfo['uid'],
		            type: "person",
		            time: time
	            };
	            $('.im-cur_chat ').click();
	            $('.im-cur_chat .friend' + toUserinfo['uid']).find('.im-f_name i').html(transTimes(time, 4) );
	            $('.im-cur_chat .friend' + toUserinfo['uid']).find('.im-f_msg span').html(langData['siteConfig'][47][57]);//[验证消息]
	            if($('.im-chat_panel').length>0){
	            	data.from = userinfo['uid'];
			         data.to = toUserinfo['uid'];
			         createEle(data);
	            }

        	}else{
        		showMsg(data.info)
        	}
        },
        error: function(){
            console.log(langData['siteConfig'][46][63]);//网络错误，初始化失败！
            return false;
        }
   });
 }

 var player
 //视频播放
 $('body').delegate('.im-video_msg','click',function(){
 	var src = $(this).children('video').attr('src');
 	$('.im-video_box').show();
 	 player = new Aliplayer({
		  "id": "im-video_player",
		  "source": src,
		  "width": "",
		  "height": "500px",
		  "autoplay": true,
		  "isLive": false,
		  "rePlay": false,
		  "playsinline": true,
		  "preload": true,
		  "controlBarVisibility": "hover",
		  "useH5Prism": true
		}, function (player) {
		    console.log("The player is created");
		  }
		);
 });

 //关闭视频
 $('body').delegate('.im-close_video','click',function(e){
 	$('.im-video_box').hide();
 	player.dispose();
 	e.stopPropagation();  //停止事件传播
 });

   $('body').delegate('.im-video_box','click',function(e){
   	$(document).one('click',function(){
   		$('.im-video_box').hide();
   		player.dispose();
   	});
   	e.stopPropagation();  //停止事件传播
   });


//好友推荐
$('body').delegate('.im-recf_content','click',function(){
	var id= $(this).children('a').attr('data-id');
	getf_info(id)
//	showMsg('请在移动端查看好友名片');
	return false;
});


//点击查看好友资料
$('body').delegate('.im-to_fdetail','click',function(){
	var userid = $(this).parents('.im-chat_panel').find('h2').attr('data-id');
	getf_info(userid,'chatlog')
});


//双击好友列表
$('body').on('dblclick','.im-f_list li',function(){
	var uid = $(this).attr('data-id'),
		if_f = $(this).attr('data-f'),
		name = $(this).find('.im-f_name span').text(),
		token = $(this).attr('data-token'),
		photo= $(this).find('.im-headimg img').attr('src');
	 //和他聊天
	var html = [];
	var add_f = if_f=='1'?'':'im-show';
	$('.im-tab_ul .im-cur_btn').click(); //进入最新会话面板
	if($('.im-chat_panel>h2').attr('data-id')==uid){
		 return false;
	}

	if($('.im-cur_chat li[data-id='+uid+']').size()>0){
		$('.im-cur_chat li[data-id='+uid+']').click();
	}else{
		rec_page=1,recload=0; totalPage = 1;
		$('.im-cur_chat').prepend('<li class="fn-clear friend'+uid+'" data-id="'+uid+'" data-token="'+token+'" data-f="1"><div class="im-headimg"><img src="'+photo+'"></div><div class="im-_right"><h2 class="im-f_name"><span>'+name+'</span><i>'+getCurrentDate(3)+'</i></h2><div class="im-f_msg"><span></span></div></div><div class="im-delbox"><a href="javascript:;"></a></div></li>');
		$('.im-no_list').remove();
		$('.im-panel_box').find('.im-big_panel').remove();
		html.push('<div class="im-big_panel im-chat_panel im-show">');
		html.push('<h2 data-id="'+uid+'"><span class="im-to_fdetail">'+name+'</span><div class="im-btn_group '+add_f+'"><p class="im-to_f"><a href="javascript:;" class="im-btn_add">'+langData['siteConfig'][46][28]+'</a></p></div><i title="'+langData['siteConfig'][47][27]+'" class="im-close_btn"></i></h2>');//加为好友--关闭聊天窗口
		html.push('<div class="im-record_box"></div>');
		html.push('<div class="im-msgto_box im-chat_box"><div class="im-btn_group fn-clear"><div class="im-left_icon"><a href="javascript:;" class="im-emoj_btn"></a><a href="javascript:;" class="im-img_btn"></a></div><a href="javascript:;" class="im-record_btn">'+langData['siteConfig'][47][31]+'</a></div><div class="im-textarea" contenteditable></div><div class="im-msg_sendbox"><a href="javascript:;" class="im-msg_send">'+langData['siteConfig'][6][139]+'</a><span ><i title="'+langData['siteConfig'][47][28]+'"></i></span><ul class="im-send_way"><li class="im-active" data-value="enter">'+langData['siteConfig'][47][29]+'</li><li data-value="center">'+langData['siteConfig'][47][30]+'</li></ul></div></div>');
		 //消息记录--发送--按Enter键发送或者按Ctrl+Enter键发送--按Enter键发送--按Ctrl+Enter键发送
		html.push('</div>');
		$('.im-panel_box').append(html.join(''));
		$('.im-cur_chat li[data-id='+uid+']').click();
	}
});



$('body').delegate('.chat_to-Link','click',function(){
	/*
	 * 1.打开对话窗口
	 * 2.需要判断是否为详情页
	 * 3.获取对方的token,信息
	 * 4.发送链接消息
	 *
	 */
	event.preventDefault();
	event.stopPropagation();
	rec_page = 1;
	var type = $(this).attr('data-type');
	var html = [],linkHtml = [];

	var b_id = imconfig['chatid'];
	if(imconfig.chatType && imconfig.chatType =='list'){//针对列表中的联系用户
		b_id = $(this).attr('data-chatId');
	}
	//获取聊天对象的id、token
	$.ajax({
        url: '/include/ajax.php?service=siteConfig&action=getImToken&userid='+b_id,
        type: 'post',
        dataType: 'json',
        success: function(data){
        	if(data.state == 100){
        		toUserinfo  = {
        			'uid':data.info.uid,
        			'name':data.info.name,
        			'photo':data.info.photo,
        		}
        		toChatToken = data.info.token;
        		$('.im-msg_tip').click(); //打开聊天列表窗口
        		if_f = data.info.isfriend;
            	add_f = if_f=='1'?'':'im-show';
            	$('.im-panel_box').find('.im-big_panel').remove();
            	//创建聊天窗口
				html.push('<div class="im-big_panel im-chat_panel im-show">');
				html.push('<h2 data-id="'+toUserinfo['uid']+'"><span class="im-to_fdetail">'+toUserinfo['name']+'</span><div class="im-btn_group '+add_f+'"><p class="im-to_f"><a href="javascript:;" class="im-btn_add">'+langData['siteConfig'][46][28]+'</a></p></div><i title="'+langData['siteConfig'][47][27]+'" class="im-close_btn"></i></h2>');//加为好友--关闭聊天窗口
				html.push('<div class="im-record_box"></div>');
				html.push('<div class="im-msgto_box im-chat_box"><div class="im-btn_group fn-clear"><div class="im-left_icon"><a href="javascript:;" class="im-emoj_btn"></a><a href="javascript:;" class="im-img_btn"></a></div><a href="javascript:;" class="im-record_btn">'+langData['siteConfig'][47][31]+'</a></div><div class="im-textarea" contenteditable></div><div class="im-msg_sendbox"><a href="javascript:;" class="im-msg_send">'+langData['siteConfig'][6][139]+'</a><span ><i title="'+langData['siteConfig'][47][28]+'"></i></span><ul class="im-send_way"><li class="im-active" data-value="enter">'+langData['siteConfig'][47][29]+'</li><li data-value="center">'+langData['siteConfig'][47][30]+'</li></ul></div></div>'); //消息记录--发送--按Enter键发送或者按Ctrl+Enter键发送--按Enter键发送--按Ctrl+Enter键发送
				html.push('</div>');
				$('.im-panel_box').append(html.join(''));
				if(type=='detail'){
					msgto(imconfig,'link');
				}
				setTimeout(function(){
					time = Math.round(new Date().getTime()/1000).toString() ; //重置获取聊天记录的时间
					getnum();
					getrecord();
				},500)


        	}
        },
        error: function(){
            console.log(langData['siteConfig'][46][63]);//网络错误，初始化失败！
            return false;
        }
    });

	// 更新房产用户联系经纪人
	if(imconfig.mod && imconfig.mod=='house' && type=='detail'){
		updateContact(b_id,imconfig.housetype,imconfig.title);
	}


});
// 更新房产用户联系经纪人
function updateContact(id,type,title){
	var houseid = pageData_?pageData_.id:'';
	if(houseid != ''){
		$.ajax({
			url: '/include/ajax.php?service=house&action=updateContactlog&jzuid='+id+'&aid='+houseid+'&title='+title+'&type='+type,
			type: 'post',
			dataType: 'json',
			success: function(data){
				if(data.state==100){

				}
			},
			error: function(data){},
		});
	}
}


function sendLink(type){
	rec_page = 1;
	var html = [],linkHtml = [];
	//获取聊天对象的id、token
	$.ajax({
        url: '/include/ajax.php?service=siteConfig&action=getImToken&userid='+imconfig['chatid'],
        type: 'post',
        dataType: 'json',
        success: function(data){
        	if(data.state == 100){
        		toUserinfo  = {
        			'uid':data.info.uid,
        			'name':data.info.name,
        			'photo':data.info.photo,
        		}
        		toChatToken = data.info.token;
        		$('.im-msg_tip').click(); //打开聊天列表窗口
        		if_f = data.info.isfriend;
            	add_f = if_f=='1'?'':'im-show';
            	$('.im-panel_box').find('.im-big_panel').remove();
            	//创建聊天窗口
				html.push('<div class="im-big_panel im-chat_panel im-show">');
				html.push('<h2 data-id="'+toUserinfo['uid']+'"><span class="im-to_fdetail">'+toUserinfo['name']+'</span><div class="im-btn_group '+add_f+'"><p class="im-to_f"><a href="javascript:;" class="im-btn_add">'+langData['siteConfig'][46][28]+'</a></p></div><i title="'+langData['siteConfig'][47][27]+'" class="im-close_btn"></i></h2>');//加为好友--关闭聊天窗口
				html.push('<div class="im-record_box"></div>');
				html.push('<div class="im-msgto_box im-chat_box"><div class="im-btn_group fn-clear"><div class="im-left_icon"><a href="javascript:;" class="im-emoj_btn"></a><a href="javascript:;" class="im-img_btn"></a></div><a href="javascript:;" class="im-record_btn">'+langData['siteConfig'][47][31]+'</a></div><div class="im-textarea" contenteditable></div><div class="im-msg_sendbox"><a href="javascript:;" class="im-msg_send">'+langData['siteConfig'][6][139]+'</a><span ><i title="'+langData['siteConfig'][47][28]+'"></i></span><ul class="im-send_way"><li class="im-active" data-value="enter">'+langData['siteConfig'][47][29]+'</li><li data-value="center">'+langData['siteConfig'][47][30]+'</li></ul></div></div>'); //消息记录--发送--按Enter键发送或者按Ctrl+Enter键发送--按Enter键发送--按Ctrl+Enter键发送
				html.push('</div>');
				$('.im-panel_box').append(html.join(''));
				if(type=='detail'){
					msgto(imconfig,'link');
					console.log(imconfig)
				}
				setTimeout(function(){
					time = Math.round(new Date().getTime()/1000).toString() ; //重置获取聊天记录的时间
					getnum();
					getrecord();
				},500)


        	}
        },
        error: function(){
            console.log(langData['siteConfig'][46][63]);//网络错误，初始化失败！
            return false;
        }
    });
}

//鼠标移动到标签按钮上显示
$('body').on('mouseenter','.im-emoj_btn',function(){

    if($('.im-emoji-list').find('li').length == 0){
        $(".im-emoji-list").html(appendEmoji());
    }

	$('.im-emoji-hide').addClass('im-show');
});
$('body').on('mouseleave','.im-emoj_btn',function(){
	$('.im-emoji-hide').on('mouseenter',function(){
		clearTimeout(timestate);
	});
	$('.im-emoji-hide').on('mouseleave',function(){
		$('.im-emoji-hide').removeClass('im-show');
	});
	var timestate =  setTimeout(function(){
		$('.im-emoji-hide').removeClass('im-show');
	},300)
});


//禁止浏览器默认事件
$(document).delegate('.im-f_list>li','contextmenu', function (e) {
　 e.preventDefault();
});

var showErrTimer;
var showMsgErr = function(txt){
	showErrTimer && clearTimeout(showErrTimer);
	$(".im-popMsg").remove();
	$(".im-panel_list").append('<div class="im-popMsg"><p>'+txt+'</p></div>');
	$(".im-popMsg p").css({ "left": "50%"});
	$(".im-popMsg").css({"visibility": "visible"});
	showErrTimer = setTimeout(function(){
	    $(".im-popMsg").fadeOut(300, function(){
	        $(this).remove();
	    });
	}, 1500);
}
// 一键清空
$('body').delegate('.im-clearOut','click',function(){
	$.ajax({
      url: "/include/ajax.php?service=member&action=clearMessage",
      type: "GET",
      dataType: "json",
      success: function (data) {
        if(data && data.state == 100){
		  // showMsgErr(langData['siteConfig'][47][40])//已删除
		  $(".im-msg_list").html('')
          gettiplist()
        }else{
          showMsgErr(data.info);
        }
      },
      error: function(){
        showMsgErr(langData['siteConfig'][20][183]);
      }
    });
})
