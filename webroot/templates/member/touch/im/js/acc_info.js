var url = window.location.pathname;
var user_id = url.slice(url.indexOf("-")+1,url.indexOf("."));  //获取聊天对象的id

var chatLib, AccessKeyID, userinfo, chatToken, chatServer, toUserinfo, toChatToken;
var  stop = 0, time = Math.round(new Date().getTime()/1000).toString();
JubaoConfig = {
    "module" : 'member',
    "action" : 'im',
    "id" : user_id,
}
//初始化用户信息
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

        // 初始化连接
        if (window['WebSocket']) {
            this.socket = new WebSocket(wsHost);
            //this.socket.onopen = this.evt.onopen;  // 连接成功

            // 关闭
            this.socket.onclose = function(){
                lib.socket = new WebSocket(lib.socket.url);
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
                        	var data ={
                        		 content: msg.info.content,
			                     contentType: msg.type,
			                     from: msg.info.from,
			                     to: msg.info.to,
			                     type: "person",
			                     time: msg.info.time
                        	}
                        	console.log(msg)
                            createEle(data, '', 1, lib);
                        }
                        break;
                }

            };

        } else {
            alert(langData['siteConfig'][46][62]);//您的浏览器不支持WebSockets
            return false;
        }

        this.start();  //启动心跳检测

    };

 //初始化
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

                //创建连接
                chatLib = new kumanIMLib(chatServer + "?AccessKeyID=" + AccessKeyID + "&token=" + chatToken + "&type=member");
				console.log(userinfo)

            }else{
                alert(data.info);
            }
        },
        error: function(){
            alert(langData['siteConfig'][46][63]);//网络错误，初始化失败！
        }
    });

//查找聊天记录
$('.im-record_link').click(function(){
	window.location.href=userDomain+'chat_record-'+user_id+'.html';
})

//======== 推荐好友弹出框 ==========
var M={};
$('body').delegate('.im-f_list li','click',function(){
//	alert('111')
//	var nickname = $(this).find('.im-f_nickname').text();
	var f_nickname = $('.im-right_info').find('h2').text();
	var f_photo = $('.im-left_head').find('img').attr('src');
	var f_id = user_id ;
	toUserinfo = {
		'photo': f_photo,
		'name': f_nickname,
		'uid': f_id,
	}
	toChatToken = $(this).attr('data-token');
	var r_nickname = $('.im-acc_info .im-right_info h2').text();
	var r_id = user_id;
	var r_photo = $('.im-acc_info .im-left_head img').attr('src');
    var quxiao = langData['siteConfig'][6][12]; //取消
    var fasong = langData['siteConfig'][6][139]; //发送
	console.log(f_nickname)
	M.dialog = jqueryAlert({
      'title'   :  langData['siteConfig'][46][1]+f_nickname,//发送给
      'content' : '<div class="fn-clear im-pop_recf"><div class="im-recf_head"><img src="'+r_photo+'"/><i class="level"></i></div><div class="im-recf_info"><h2>'+r_nickname+'</h2><p>ID：'+r_id+'</p></div></div>',
       'modal'   : true,
       'width':'5rem',
       'height':'3.5rem',
       'contentTextAlign':'left',
       'className':'im-recf_modal',
       'isModalClose':true,
       'buttons' :{
          quxiao : function(){//取消
             M.dialog.close();
           },
           fasong : function(){//发送
			 M.dialog.close();

			 msg = {
			 	'f_id':f_id,
			 	'f_name':f_nickname,
			 	'f_photo':f_photo
			 }
			 msgto(msg,'recfriend');//推荐好友
//			 $('.im-chat_content_box').scrollTop($('.im-chat_content_box')[0].scrollHeight)
			 showMsg('<img class="gou" src="'+templets_skin+'images/gou.png">'+langData['siteConfig'][44][91]);//已发送
			 setTimeout(function(){
			 	$('.im-friendlist_page').animate({'bottom':'-100%'},150)
			 },1500)
           },

      }
})
});
//确认删除好友
$('body').delegate('.im-delf_confirm','click',function(){
	 $.ajax({
        url: '/include/ajax.php?service=siteConfig&action=delFriend&tid='+user_id,
        type: 'post',
        dataType: 'json',
        success: function(data){
            if(data.state == 100){
              showMsg(data.info);
            }else{
                alert(data.info);
            }
        },
        error: function(){
            alert(langData['siteConfig'][46][63]);//网络错误，初始化失败！
        }
    });

	closebottom()
});

//分享好友
$('body').delegate('.im-recm_btn','click',function(){
	$('.im-friendlist_page').animate({'bottom':'0'},200);
	//获取好友列表
	r_flist(userinfo['uid']);

});

$('.im-close_page').click(function(){
	$('.im-friendlist_page').animate({'bottom':'-100%'},200);;
})

//查看好友详细信息  detail_info.html
$('.im-acc_info').click(function(){
	window.location.href = userDomain+"detail_info-"+user_id+".html";
});


//获取用户信息
    $.ajax({
        url: '/include/ajax.php?service=member&action=detail&id='+user_id+'&friend=1',
        type: 'post',
        dataType: 'json',
        success: function(data){
            if(data.state == 100){
               var detail = data.info;
               $('.im-left_head').children('img').attr('src',detail.photo?detail.photo:staticPath+"images/noPhoto_60.jpg"); //头像
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
               if(!detail.isfriend){          //是否为好友
               	    $('.im-delf_btn').css('display','none').siblings('.im-add_btn').css('display','block');
               }else{
               		$('.im-delf_btn').css('display','block').siblings('.im-add_btn').css('display','none');
               }
            }else{
                alert(data.info);
            }
        },
        error: function(){
            alert(langData['siteConfig'][46][63]);//网络错误，初始化失败！
        }
    });


function nofind(){
	var img = event.srcElement;
	img.src = staticPath+"images/noPhoto_60.jpg";
	img.onerror = null;
}
//加好友
$('.im-add_btn').click(function(){
	var url = userDomain+'f_test-'+user_id+'.html'
	window.location.href = url;
})

function msgto(msg,type){
	if(msg==''){
//		showMsg('不能发送空消息');
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
        //更新好友列表最新消息

		 data.from = userinfo['uid'];
         data.to = toUserinfo['uid'];
		 createEle(data);
	}
}

// 业务层
    var createEle = function(data, type, newMessage, lib){
        var from = data.from;
        var to = data.to;
        var sf = false;
        //更新对话窗体内容，如果没有选择会员，不执行
        if(!toUserinfo || (newMessage && toUserinfo['uid'] != from)) return;
		var gest = typemsg = imghead = style = attrbuite=lng=lat ='' ;
        //拼接对话
        if (from == userinfo['uid']) {
        	gest ='im-to_other';
        	imghead = '<div class="im-m_head"><a href="javascript:;"><img src="'+(userinfo['photo']?userinfo['photo']:staticPath+"images/noPhoto_60.jpg")+'"></a></div>';
            var fromUser = "<span style='color: red;'>你</span>";
            sf = true;
        } else {
            var fromUser = toUserinfo['name'];
        }

        if (to == userinfo['uid']) {
        	gest ='im-from_other';
        	imghead = '<div class="im-m_head"><a href="'+userDomain+'acc_info-'+toUserinfo['uid']+'.html"><img src="'+(toUserinfo['photo']?toUserinfo['photo']:staticPath+"images/noPhoto_60.jpg")+'"></a></div>';

        } else {
            var toUser = toUserinfo['name'];
        }

        var text =''

        // 文本
        if(data.contentType == "text"){
            text = '<div class="im-text_msg">'+data.content.replace(/\\/g,"")+'</div>';
            typemsg= '';
            style="";
            attrbuite=""
        }

        // 图片
        if(data.contentType == 'image'){
            content = data.content;
            text = '<div class="im-img_msg"><img src="/include/attachment.php?f='+content.url+'" /></div>';
            typemsg= 'im-file_content';
            attrbuite = data.content.width+'X'+data.content.height;

            if(data.content.width>150 && ((data.content.height-data.content.width)<=0)){
            	var h =  data.content.height*150/data.content.width
            	style ='height:'+h+'px';
            }else if(data.content.height>150&&((data.content.height-data.content.width)>0)){
            	style ='height:150px';

            }

        }
        //视频
        if(data.contentType == 'video'){
        	 content = data.content;
        	 console.log(data)
        	 text = '<div class="im-video_msg"><video style="background:#000;" poster="'+(content.poster?content.poster:"")+'" src="/include/attachment.php?f='+content.url+'"></video></div>';

        	 typemsg= 'im-file_content';
            attrbuite = data.content.width+'X'+data.content.height;

            if(data.content.width>150 && ((data.content.height-data.content.width)<=0)){
            	var h =  data.content.height*150/data.content.width
            	style ='height:'+h+'px';
            }else if(data.content.height>150&&((data.content.height-data.content.width)>0)){
            	style ='height:150px';

            }
        }
        //语音消息
        if(data.contentType == 'audio'){
        	 typemsg= 'im-s_content';
        	 text = '<div class="im-speak_msg"><em>23"</em></div>'
        }

        //好友推荐
        if(data.contentType == 'recfriend'){
        	typemsg = 'im-recf_content';
        	text = '<a href="add_friend-'+data.content.f_id+'.html"><dl><dt>推荐好友</dt><dd class="fn-clear"><div class="im-recf_head"><img src="'+(data.content.f_photo?data.content.f_photo:staticPath+"images/noPhoto_60.jpg")+'"/><i class="level"></i></div><div class="im-recf_info"><h2>'+data.content.f_name+'</h2><p>ID：'+data.content.f_id+'</p></div></dd></dl></a>'
			console.log(data)
        }

        //地图分享
        if(data.contentType == 'mapshare'){
        	typemsg = 'im-post_content';
        	lng =  data.content.lng;
        	lat = data.content.lat;
        	text = '<a class="appMapBtn" target="_blank" href="javascript:;"><div class="im-post_text"><h2>'+data.content.name+'</h2><p>'+data.content.address+'</p></div><div class="im-area_show"><img src="'+data.content.mapimg+'" /></div></a>'
			console.log(data)

        }

        //好友申请
        if(data.contentType == 'apply'){
        	var date1 =new Date();
        	var date2 = date1.getTime()-data.time*1000;
        	var day = Math.floor(date2/(24*3600*1000)); //相差天数
        	var hour =  Math.floor((date2%(24*3600*1000))/(3600*1000));
        	var min =  Math.floor(((date2%(24*3600*1000))%(3600*1000))/(60*1000));
        	var timemsg ='';
        	if(day>0){
        		timemsg ='apply_timeout';
        	}else{
        		timemsg ='im-apply_msg';
        	}
        	if(min<=5&&day==0&&hour==0 && (data.from==toUserinfo['uid'])){
        		console.log(data.from+langData['siteConfig'][46][64]+toUserinfo['uid'])//测试消息在5分钟以内
        		$('.im-tip_box').html('<a href="javascript:;" class="im-agree_f">'+langData['siteConfig'][46][65]+'<button>'+langData['siteConfig'][6][2]+'</button><i class="im-close_tip"></i></a>')//对方申请加为好友--同意
        	}
        	text ='<div class="im-img_msg '+timemsg+'"><span>'+langData['siteConfig'][46][66]+'</span>-'+data.content+'</div>';//验证消息
        }
        var item = '<div class="'+gest+' im-chat_item fn-clear" data-time="'+data.time+'" data-size="'+attrbuite+'" >'+imghead+'<div style="'+style+'" class="im-m_content '+typemsg+'" data-lng="'+lng+'" data-lat="'+lat+'">'+text+'</div></div>';

        appendLog('mine', item, type, data.time);
		if(newMessage&&(data.contentType == 'image')){
         	console.log('有新图片消息')
         	setTimeout(function(){
        	 //放大图片
				    Zepto.fn.bigImage({
				        artMainCon:".im-chat_content",  //图片所在的列表标签
				        show_Con:'.im-img_msg',
				    });
        },500)
         }
        //已读上报
        if(newMessage && data.to == userinfo['uid'] && data.from == toUserinfo['uid']){
            var data = {
                contentType: 'read',
                from: chatToken,
                to: toChatToken,
                time: data.time
            };

            lib.reset();
            lib.socket.send(JSON.stringify(data));
        }

//		console.log(newMessage)
    };


  //创建历史对话
    var appendLog = function (ele, item, type, time) {
        var log = $('.im-chat_content_box');

        if(log.find('.im-chat_item').size() == 0){
            $('.im-chat_content').append('<div class="im-msg_time" data-time="'+time+'">'+getDateDiff(time)+'</div>');

        }else{

            if(type != 'prepend'){
                var lastTime = parseInt($('.im-chat_content').find('.im-chat_item:last').attr('data-time'));
                var timeCalcu = time-lastTime;
            }else{
                var lastTime = parseInt(log.find('.im-msg_time:eq(0)').attr('data-time'));
                var timeCalcu = lastTime-time;
            }

            if(timeCalcu > 300){
                if(type != 'prepend'){
                    $('.im-chat_content').append('<div class="im-msg_time" data-time="'+time+'">'+getDateDiff(time)+'</div>');
                }else{
                    $('.im-chat_content').prepend('<div class="im-msg_time" data-time="'+time+'">'+getDateDiff(time)+'</div>');
                }
            }
        }

        if(type != 'prepend'){
            $('.im-chat_content').append(item);
//          log.scrollTop(log[0].scrollHeight);
        }else{
            $('.im-chat_content').prepend(item);
            stop += $('.im-chat_content').find('.im-chat_item:eq(0)').height();
            log.scrollTop(stop);
        }

    }
