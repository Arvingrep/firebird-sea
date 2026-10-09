var chatLib, AccessKeyID, userinfo, chatToken, chatServer, toUserinfo, toChatToken;
var isload = false, page = 1, pageSize = 20, totalPage = 1, stop = 0, time = Math.round(new Date().getTime()/1000).toString();
var url = window.location.pathname;
var userid = url.slice(url.indexOf("-")+1,url.indexOf("."));
var currecord_page=1 ,currecord_load=0;



$(function(){
  if(navigator.userAgent.indexOf('huoniao') > -1){ //在app中
       
      // setupWebViewJavascriptBridge(function (bridge) {
      //     // bridge.callHandler("goBack", {}, function (responseData) { });
      //     bridge.callHandler('invokePrivateChat', param, function (responseData) {
      //         console.log(responseData)
      //     });
      // });

      

      let uid = $.cookie(cookiePre + "userid");
       var param = {
            from: uid,
            to: userid,
        };
        setupWebViewJavascriptBridge(function (bridge) {
           bridge.callHandler("goBack", {}, function (responseData) { });
            bridge.callHandler('invokePrivateChat', param, function (responseData) {
                console.log(responseData)
            });
        });
  }



	$('.huoniao_iOS .im-yuyin').removeClass('disabled');
	if(navigator.userAgent.toLowerCase().match(/micromessenger/)) {
		$('.im-yuyin').removeClass('disabled');
	}

    if((navigator.userAgent.toLowerCase().match(/miniprogram/) && navigator.userAgent.toLowerCase().match(/qq/)) || navigator.userAgent.toLowerCase().indexOf('swan-baiduboxapp')) {
        // console.log(111)
        $('.im-yuyin').addClass('disabled');
    }

  // //创建历史对话
  //   var appendLog = function (ele, item, type, time) {
  //       var log = $('.im-chat_content_box');

  //       if(log.find('.im-chat_item').size() == 0){
  //           $('.im-chat_content').append('<div class="im-msg_time" data-time="'+time+'">'+getDateDiff(time)+'</div>');

  //       }else{

  //           if(type != 'prepend'){
  //               var lastTime = parseInt($('.im-chat_content').find('.im-chat_item:last').attr('data-time'));
  //               var timeCalcu = time-lastTime;
  //           }else{
  //               var lastTime = parseInt(log.find('.im-msg_time:eq(0)').attr('data-time'));
  //               var timeCalcu = lastTime-time;
  //           }

  //           if(timeCalcu > 300){
  //               if(type != 'prepend'){
  //                   $('.im-chat_content').append('<div class="im-msg_time" data-time="'+time+'">'+getDateDiff(time)+'</div>');
  //               }else{
  //                   $('.im-chat_content').prepend('<div class="im-msg_time" data-time="'+time+'">'+getDateDiff(time)+'</div>');
  //               }
  //           }
  //       }

  //       if(type != 'prepend'){
  //           $('.im-chat_content').append(item);
  //           log.scrollTop(log[0].scrollHeight);
  //       }else{
  //           $('.im-chat_content').prepend(item);
  //           stop += $('.im-chat_content').find('.im-chat_item:eq(0)').height();
  //           log.scrollTop(stop);
  //       }

  //   }



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
                // alert('close');
                initChat(1)
                // this.createSocket(wsHost)
                // lib.socket = new WebSocket(lib.socket.url);
            };

            // 异常
            this.socket.onerror = function(){
                 // alert('error')
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
                            createEle(data, '', 1, lib);
                            if(msg.type=='apply'){
                            	if(msg.info.content!=langData['siteConfig'][46][68]){//你们已成功添加为好友
                            		$('.im-tip_box').html('<a href="javascript:;" class="im-agree_f">'+langData['siteConfig'][46][65]+'<button>'+langData['siteConfig'][6][2]+'</button><i class="im-close_tip"></i></a>');//对方申请加为好友--同意
                            	}else{
                            		$('.im-tip_box').hide();
                            		$('.im-chat_content').css('padding-top','1.2rem')
                            	}


                            }
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
//              console.log(info)
//              $("#welcome").html("你好：" + userinfo['name']);

                //创建连接
                chatLib = new kumanIMLib(chatServer + "?AccessKeyID=" + AccessKeyID + "&token=" + chatToken + "&type=member");

                //获取聊天对象信息
                var url = window.location.pathname;
                if (url.indexOf("-") != -1){
                    var userid = url.slice(url.indexOf("-")+1,url.indexOf("."));
            //      可以根据userid获取好友的信息
                    $.ajax({
                       url: '/include/ajax.php?service=siteConfig&action=getImToken&userid='+userid,
                       type: "GET",
                       dataType: "json",
                       success: function (data) {
                           if(data.state==100){
                              var datalist = data.info;
                              //判断是否为好友
                              if(datalist.isfriend){
                                $('.im-tip_box').hide();
                                $('.im-chat_content').css('padding-top','1.2rem');
                                $('.huoniao_iOS .im-chat_content').css('padding-top','.2rem !important');
                              }else{
                                $('.im-tip_box').show();
                                $('.im-chat_content').css('padding-top','2.1rem');
                                $('.huoniao_iOS .im-chat_content').css('padding-top','1.2rem !important');
                              }
                              $('.header-address').attr('data-token',datalist.token).find('span').text(datalist.name);
                              wxconfig.title = datalist.name;
							  document.title = datalist.name;

                              toChatToken = datalist.token;
                              toUserinfo = {
                                  'uid': datalist.uid,
                                  'name': datalist.name,
                                  'photo': datalist.photo
                              }
                              if(!d){
                                getcur_record();
                              }
                           }
                       },
                       error: function(){
                          $('.loading').html('<span>'+langData['siteConfig'][37][80]+'</span>');  //请求出错请刷新重试
                       }
                    });
                        //初次加载聊天记录

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

//获取当前聊天对象的最新聊天记录
function getcur_record(type){
	if($('.laoding').length==0){
		$('.im-chat_content').prepend('<div class="laoding"><img src="'+templets_skin+'images/loading.gif"/></div>');
	}
	var url = "/include/ajax.php?service=siteConfig&action=getImChatLog";
    $.ajax({
       url: url,
       data: {from: chatToken, to: toChatToken, page: currecord_page, pageSize: 20, time: time},
       type: "GET",
       dataType: "json",
       success: function (data) {
	       if(data && data.state == 100){
            data = data.info;
            var pageInfo = data.pageInfo;
//          console.log(currecord_page+'总页数'+pageInfo.totalPage)
            var list = data.list;

            if(currecord_page == 1){
                list.reverse();
            }
            totalPage = pageInfo.totalPage;
            for(var i = 0; i < list.length; i++){
                var data = {
                        content: list[i].info.content,
                        contentType: list[i].type,
                        from: list[i].info.fid,
                        to: list[i].info.tid,
                        type: "person",
                        time: list[i].info.time
                    }

                createEle(data, type);
            }
            $('.laoding').remove();
//          $('.im-record_box').prepend('<a href="javascript:;" class="im-more"><span><i></i>查看更多记录</span></a>');
            setTimeout(function(){
            	 //放大图片
				    Zepto.fn.bigImage({
				        artMainCon:".im-chat_content",  //图片所在的列表标签
				        show_Con:'.im-img_msg',
				    });
                recload = false;

            }, 1000);

            //最后一页显示时间
           if(currecord_page > 1 && currecord_page == pageInfo.totalPage){
           		$('.im-more').remove();
                var time = parseInt($('.im-record_box').find('.im-chat_item:eq(0)').attr('data-time'));
                 $('.im-record_box').prepend('<p class="im-msg_time" data-time="'+time+'">'+getDateDiff(time)+'</p>');
           }
                   if(currecord_page>=pageInfo.totalPage){
                   	$('.im-more').remove();
                   }

                   currecord_page++;
					fin =1;
                }else{
                	$('.laoding').remove();
                    console.log(data.info);
                    recload = false;
                }
            },
            error: function(){
                console.log('network error');
                recload = false;
            }
    });
}



// 业务层
 function createEle(data, type, newMessage, lib){
        var from = data.from;
        var to = data.to;
        var sf = false;
        //更新对话窗体内容，如果没有选择会员，不执行
        if(!toUserinfo || (newMessage && toUserinfo['uid'] != from)) return;
		var gest = typemsg = imghead = style = attrbuite=lng=lat ='' ;
        //拼接对话
        if (from == userinfo['uid']) {
        	gest ='im-to_other';
        	imghead = '<div class="im-m_head"><a href="'+masterDomain+'/user-'+userinfo['uid']+'.html"><img src="'+(userinfo['photo']?userinfo['photo']:staticPath+"images/noPhoto_60.jpg")+'"></a></div>';
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
            text = '<div class="im-text_msg">'+data.content.replace(/△(.+?)△/g,'<img src="$1"/>')+'</div>';
            typemsg= '';
            style="";
            attrbuite=""
        }

        // 图片
        if(data.contentType == 'image'){
            content = data.content;
            text = '<div class="im-img_msg"><img src="'+content.turl+'" /></div>';
            typemsg= 'im-file_content';
            attrbuite = data.content.width+'X'+data.content.height;
            if(data.content.width>150 && ((data.content.height-data.content.width)<=0)){
            	var h =  data.content.height*150/data.content.width
            	style ='height:'+h+'px; width:3rem;';
            }else if(data.content.height>150&&((data.content.height-data.content.width)>0)){
            	style ='height:3rem; width:'+(3 / data.content.height * data.content.width)+'rem;';

            }
            // alert(style)

        }
        //视频
        if(data.contentType == 'video'){
        	 content = data.content;
        	 console.log(data)
        	 text = '<div class="im-video_msg"><video style="background:#000;" poster="'+(content.poster?content.poster:"")+'" src="'+content.turl+'"></video></div>';

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
        	console.log(data)
        	 typemsg= 'im-s_content';
			 //data.content.audioUrl
        	 text = '<div class="im-speak_msg" style="width:'+(.5+.2*data.content.audioTime)+'rem; max-width:3rem;" data-id="'+data.content.voiceId+'" data-width="'+data.content.audioWidth+'"><audio class="chat_audio" src="'+data.content.audioUrl+'"></audio><em>'+data.content.audioTime+'"</em></div>'

        }

        //好友推荐
        if(data.contentType == 'recfriend'){
        	typemsg = 'im-recf_content';
        	text = '<a href="'+userDomain+'add_friend-'+data.content.f_id+'.html"><dl><dt>推荐好友</dt><dd class="fn-clear"><div class="im-recf_head"><img src="'+(data.content.f_photo?data.content.f_photo:staticPath+"images/noPhoto_60.jpg")+'"/><i class="level"></i></div><div class="im-recf_info"><h2>'+data.content.f_name+'</h2><p>ID：'+data.content.f_id+'</p></div></dd></dl></a>'
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

        var item;
        if(data.contentType == 'link'){
        	var info = data.content;
        	var cname = '',ctn_text='',title=info.title;

        	var hide = (info.imgUrl==''?"fn-hide":"");
        	var cname_txt = (info.imgUrl==''?"change_p":"");
        	if(info.mod == 'job'){
        		cname = "pro_description";
        		ctn_text =  '<p class="'+ cname +'">'+info.description+'</p><p class="'+ cname +'">'+langData['siteConfig'][19][633]+'：'+ info.salary +'</p>'//薪资范围
        		title = langData['siteConfig'][46][69]+info.title;//[招聘]
        	}else{
        		cname = "pro_price";
//      		if(info.mod=="house"){
//      			title = info.title;
//      			ctn_text = '<p class="'+cname+'">'+ (info.price==''?"面议":info.price) +'</p>';
//      		}else{
//      			ctn_text = '<p class="'+cname+'">'+(info.price==""?"面议":info.price)+'</p>';
//      		}
        		title = info.title;
            if(info.price != undefined){
              ctn_text = '<p class="'+cname+'">'+ (info.price==''?langData['siteConfig'][46][70]:info.price) +'</p>';//面议
            }
        		

        	}
          let toMini = ['info','job','titba','article','sfcar'].includes(info.mod) ? 'toMini':'';
          let temp = info.mod == 'job' ? 'job' : 'detail'
          let url = info.link.replace('.html','');
          let urlArr = url.split('-');
          let id = urlArr.length > 1 ? urlArr[1] : ''
          item = '<a href="'+info.link+'" data-module="'+info.mod+'" data-id="'+ id +'" data-temp="'+ temp +'" class="im-Linkbox fn-clear '+toMini+'"><div class="im_left '+hide+'"><img onerror="nofind_c();" src="'+(info.imgUrl?info.imgUrl:"/static/images/404.jpg")+'" /></div><div class="im-pro_text '+cname_txt+'"><h3>'+title+'</h3>'+ctn_text+'</div></a>'
        }else if(data.contentType == 'orderlist'){//订单列表
          var info = data.content;
          var cname = '',ctn_text='',title=info.title;

          var hide = (info.imgUrl==''?"fn-hide":"");
          var cname_txt = (info.imgUrl==''?"change_p":"");
          cname = "pro_price";
          ctn_text = '<p class="'+cname+'"><span>合计：</span>'+ (info.price==''?langData['siteConfig'][46][70]:info.price) +'</p>';//面议
          item = '<div class="im-Linkbox fn-clear im-orderBox"><h2 class="im-orderTip">你正在咨询的订单</h2><a href="'+info.link+'" class="fn-clear"><div class="im_left '+hide+'"><img onerror="nofind_c();" src="'+(info.imgUrl?info.imgUrl:"/static/images/404.jpg")+'" /></div><div class="im-pro_text '+cname_txt+'"><h3>'+title+'</h3><h4>共'+info.ordercount+'件商品</h4>'+ctn_text+'</div></a><p class="im-orderP">订单号：'+info.ordernum+'</p><p class="im-orderP">创建时间：'+info.orderdate+'</p></div>';
        }else{
        	item = '<div class="'+gest+' im-chat_item fn-clear" data-time="'+data.time+'" data-size="'+attrbuite+'" >'+imghead+'<div style="'+style+'" class="im-m_content '+typemsg+'" data-lng="'+lng+'" data-lat="'+lat+'">'+text+'</div></div>';
        }


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
 function appendLog(ele, item, type, time) {
        var log = $('.im-chat_content_box');

        if(log.find('.im-chat_item').size() == 0 && log.find('.im-Linkbox').length == 0){
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
            log.scrollTop(log[0].scrollHeight);
        }else{
            $('.im-chat_content').prepend(item);
            stop += $('.im-chat_content').find('.im-chat_item:eq(0)').height();
            log.scrollTop(stop);
        }

    }



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
		 //放大图片
		Zepto.fn.bigImage({
			artMainCon:".im-chat_content",  //图片所在的列表标签
			show_Con:'.im-img_msg',
		});
	}
}


var userAgent = navigator.userAgent.toLowerCase();

	//下滑触顶加载
	$('.im-chat_content_box').scroll(function(event){
		if($('.im-chat_content').offset().top==0 && !currecord_load){
			getcur_record('prepend');
		    event.preventDefault();
		}
	})

	//对于移动端隐藏软键盘时的高度
	$(".im-input").on("blur",function(){
		$(".im-bottom_all").css('min-height','auto')
		setTimeout(function(){
			window.scroll(0,0);//失焦后强制让页面归位
			}, 100);

	});


	//关闭好友提示
	$('body').delegate('.im-close_tip','tap',function(){
		$('.im-tip_box').remove();
		$('.im-chat_content').css('padding-top','1.2rem');
		$('.huoniao_iOS .im-chat_content').css('padding-top','.2rem !important');
	});
	//同意添加为好友
	$('body').delegate('.im-agree_f button','tap',function(){
		//请求后台
		var note = langData['siteConfig'][46][68];//你们已成功添加为好友
		$.ajax({
	        url: '/include/ajax.php?service=siteConfig&action=applyFriend&tid='+toUserinfo['uid']+'&note='+note,
	        type: 'post',
	        dataType: 'json',
	        success: function(data){
	            if(data.state == 100){
	            	showMsg(langData['siteConfig'][46][71])//成功添加为好友
	            }else{
	                alert(data.info);
	            }
	        },
	        error: function(){
	            alert(langData['siteConfig'][46][63]);//网络错误，初始化失败！
	        }
	    });

		$('.im-tip_box').remove();
		$('.im-chat_content').css('padding-top','1.2rem');
		$('.huoniao_iOS .im-chat_content').css('padding-top','.2rem !important');
	});
	//添加为好友
	$('body').delegate('.im-add_f','tap',function(){
		//请求后台
//		$('.im-tip_box').remove();
//		$('.im-chat_content').css('padding-top','1.2rem');
//		/include/ajax.php?service=member&action=detail&id=11&friend=1
		$.ajax({
	       url: "/include/ajax.php?service=member&action=detail&id="+toUserinfo['uid']+"&friend=1",
	       type: "GET",
	       dataType: "json",
	       success: function (data) {
		       var datalist = data.info;
		       var html = [];
		       if(data.state == 100){
		       	var detail = data.info;
		         console.log(data);
		         $('.im-f_test_page').find('.im-right_info h2').text(detail.nickname);
		         $('.im-f_test_page').find('.im-left_head>img').attr('src',detail.photo?detail.photo:staticPath+"images/noPhoto_60.jpg");
		         $('.im-f_test_page').find('.vip_level').html(detail.levelIcon?'<img src="'+detail.levelIcon+'"/>':'');
		         if(detail.addrName!=''){
		         	var addr = detail.addrName.split('>');
		         	if(addr.length>1){
		         		area = addr[0]+addr[1];
		         	}else{
		         		area = addr[0];
		         	}
		         	$('.im-f_test_page').find('.im-right_info p').text(area)
		         }else{
		         	$('.im-f_test_page').find('.im-right_info p').text(langData['siteConfig'][31][108]);//未填写
		         }

		       }
	       },
	       error: function(){

	       }
	    });
	    $('.im-f_test_page .im-back_btn').attr('href','javascript:;');
		$('.im-f_test_page').animate({'bottom':'0'},150)
	});


	//录音表情和菜单的切换
	 var tabsSwiper = null;



	$('.im-input_box').on('tap','a',function(e){

		if($(this).hasClass('im-yuyin')&&!$(this).hasClass('im-keyboard')){

			if($(this).hasClass('disabled')){
				showMsg(langData['siteConfig'][46][72]);//语音聊天只能在微信或者APP端
				return false;
			}
			$('.im-chat_content').css('padding-bottom','5.1rem');
			$('.im-chat_content_box').scrollTop($('.im-chat_content_box')[0].scrollHeight);
			$('.im-audio_box').addClass('im-show').siblings('div').removeClass('im-show');
			$(this).addClass('im-keyboard').siblings('a').removeClass('im-keyboard');
			if (!tabsSwiper) {
		      tabsSwiper = new Swiper('.swiper-audio',{
		        speed:500,
		        on:{
		        	slideChangeTransitionStart: function(){
			          $(".swiper-tab .active-nav").removeClass('active-nav');
			          $(".swiper-tab .swiper-slide").eq(this.activeIndex).addClass('active-nav');
			          $(window).scrollTop(0);
			        },

			        slideChangeTransitionEnd: function(){
			          $('.nolock .second').text('0');
//			          $('.nolock .tips').text('点击开始录音');
			          $('.swiper-slide-active .swiper-no-swiping').removeClass('start');
			          $('.swiper-slide-active .swiper-no-swiping').removeClass('stop');
			          $('.swiper-slide-active .swiper-no-swiping').removeClass('pause');
			          isload = false;
			        }
		        }
		      })
		    }
		}else if($(this).hasClass('im-upload')){
			$('.im-chat_content').css('padding-bottom','5.1rem');
			$('.im-chat_content_box').scrollTop($('.im-chat_content_box')[0].scrollHeight)
			$(this).siblings('a').removeClass('im-keyboard');
			$('.im-filebtn_box').addClass('im-show').siblings('div').removeClass('im-show');
		}else if($(this).hasClass('im-biaoq')&&!$(this).hasClass('im-keyboard')){

			$('.im-chat_content').css('padding-bottom','5.1rem');
			$('.im-chat_content_box').scrollTop($('.im-chat_content_box')[0].scrollHeight)
			memerySelection = window.getSelection;

            if($('.im-bq_chose').find('li').length == 0){
        	    $(".im-bq_chose").html(appendEmoji());
                $(".im-bq_chose ul").addClass('im-emoji-list');
            }

			$('.im-bq_chose').addClass('im-show').siblings('div').removeClass('im-show');
			$(this).addClass('im-keyboard').siblings('a').removeClass('im-keyboard');
		}else if($(this).hasClass('im-send_btn')){
			//发送消息的方法
			var html = $('.im-input').html();
			for(var i=0;i<$('.im-input img').length; i++){
				var t = $('.im-input img').eq(i);
				var txt = t.attr('data-txt')
				t.after(txt);
			}
			$('.im-input img').remove();
			var con  = $('.im-input').html();
			// console.log(con)
			msgto(con,'text')
//
			$('.im-input').html(''); //清空输入框
			$(this).removeClass('im-show').siblings('.im-upload').addClass('im-show');
		}else if($(this).hasClass('im-keyboard')){
			$('.im-menu_box').removeClass('im-show');
			$('.im-input_box a').removeClass('im-keyboard');
			$('.im-chat_content').css('padding-bottom','1.3rem');
			$('.im-chat_content_box').scrollTop($('.im-chat_content_box')[0].scrollHeight)
		}
	});

	//发送图片
	$('body').delegate('.im-btn_img input','change',function(){
		console.log($(this).val() )
		if ($(this).val() == '') return;
		var photo = $('.im-btn_img');
		showMsg(langData['siteConfig'][46][73],10000);//图片上传中
		mysub(photo,'image');

	});

	$('body').delegate('.im-btn_photo input','change',function(){
		console.log($(this).val() );
		showMsg(langData['siteConfig'][46][74],10000);//文件上传中
		var filetype;
		var photo = $('.im-btn_photo');
		var index = $(this).val().indexOf(".");
		var imgval = $(this).val().substring(index);
		if(imgval==".bmp"||imgval==".png"||imgval==".gif"||imgval==".jpg"||imgval==".jpeg"){
			filetype = 'image'
		}else{
			filetype = 'video'
		}
		console.log(imgval)
		if ($(this).val() == '') return;
		mysub(photo,filetype);


	});
		//上传图片
	  function mysub(photo,filetype){
	    var data = [];
	    data['mod']  = "siteConfig";
	    data['type'] = "im";
	    data['filetype'] = filetype;
	    var fileId = photo.find("input[type=file]").attr("id");
	    $.ajaxFileUpload({
	      url: "/include/upload.inc.php",
	      fileElementId: fileId,
	      dataType: "json",
	      data: data,
	      success: function(m, l) {
	        if (m.state == "SUCCESS") {
				    $(".im-popMsg").remove();
				    msgto(m,filetype);
	        } else {
	          alert(langData['siteConfig'][20][306]);   //上传失败
	        }
	      },
	      error: function(res) {
         
			   alert(langData['siteConfig'][20][531]);  //网络错误，上传失败！
	      }
	    });

	  }





//===========================================文本框相关操作===========================================================
	//光标定位在文本框内
//	$('body').delegate('.im-input','focus',function(){
//		setTimeout(function(){
//			$(window).scrollTop($(window).height());//失焦后强制让页面归位
//		}, 100);
//		$('.im-input_box a').removeClass('im-keyboard')
//		set_focus($('.im-input:last'));
//	});
	$('body').delegate('.im-input','tap',function(){
		$('.im-menu_box').removeClass('im-show');  //其他框
		$('.im-gift_box').removeClass('im-show');  //礼物框
		$('.im-chat_content').css('padding-bottom','1.3rem');
		$('.im-input_box a').removeClass('im-keyboard')
		if(device.toLowerCase().indexOf('android') > -1){
			$('.im-bottom_all').css('min-height','2.5rem')
		}
		setTimeout(function(){
			$(window).scrollTop($(window).height());//失焦后强制让页面归位
		}, 100);

	});
	//文本框内容发生变化
	$('body').delegate('.im-input','input',function(){
		var t = $(this);
		var str = t.html().toString();
		if(t.html() =='<br>'||t.html()==''){
			$('.im-send_btn').removeClass('im-show').siblings('.im-upload').addClass('im-show');
		}else{
			$('.im-send_btn').addClass('im-show').siblings('.im-upload').removeClass('im-show');
		}
	});
	//点击表情，输入
	var memerySelection
	$('body').delegate('.im-emoji-list li','tap',function(e){

		memerySelection = window.getSelection();
		var t = $(this),emojsrc = t.find('img').attr('src');
		var txt = t.attr('data-txt')
		$('.im-send_btn').addClass('im-show').siblings('.im-upload').removeClass('im-show');
		if (/iphone|ipad|ipod/.test(userAgent)) {
	      $('.im-input').append('<img src="'+emojsrc+'" class="emotion-img" data-txt="'+txt+'"/>');
	      return false;

	   }else {
	   	  set_focus($('.im-input:last'));
	      pasteHtmlAtCaret('<img src="'+emojsrc+'" data-txt="'+txt+'" class="emotion-img" />');
	    }

	    document.activeElement.blur();
        return false;
	});
	 //根据光标位置插入指定内容
	function pasteHtmlAtCaret(html) {

      var sel, range;
      if (window.getSelection) {
          sel = memerySelection;
          console.log(sel)
          if (sel.anchorNode == null) {return;}
          if (sel.anchorNode.className != undefined && sel.anchorNode.className.indexOf('placeholder') > -1 || sel.anchorNode.parentNode.className != undefined && sel.anchorNode.parentNode.className.indexOf('placeholder') > -1) {

          if (sel.getRangeAt && sel.rangeCount) {

              range = sel.getRangeAt(0);
              range.deleteContents();
              var el = document.createElement("div");
              el.innerHTML = html;
              var frag = document.createDocumentFragment(), node, lastNode;
              while ( (node = el.firstChild) ) {
                lastNode = frag.appendChild(node);
              }
              range.insertNode(frag);
              if (lastNode) {
                range = range.cloneRange();
                range.setStartAfter(lastNode);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
              }
          }
        }
      } else if (document.selection && document.selection.type != "Control") {
          document.selection.createRange().pasteHTML(html);
      }
  }

  //光标定位到最后
	function set_focus(el){
		el=el[0];
		el.focus();
		if($.browser.msie){
			var rng;
			el.focus();
			rng = document.selection.createRange();
			rng.moveStart('character', -el.innerText.length);
			var text = rng.text;
			for (var i = 0; i < el.innerText.length; i++) {
				if (el.innerText.substring(0, i + 1) == text.substring(text.length - i - 1, text.length)) {
					result = i + 1;
				}
			}
      return false;
		}else{
			var range = document.createRange();
			range.selectNodeContents(el);
			range.collapse(false);
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		}
	}
//=============关闭底部=============

$('.im-chat_content').on('touchend',function(e){

		$(".im-input").blur();
		$('.im-input_box a').removeClass('im-keyboard');
		$('.im-menu_box').removeClass('im-show');
		$('.im-gift_box').removeClass('im-show');  //礼物框
		$('.im-chat_content').css('padding-bottom','1.3rem');
})

//======== 推荐好友弹出框 ==========
var M={};
$('body').delegate('.im-f_list li','tap',function(){
//	var nickname = $(this).find('.im-f_nickname').text();
	var f_nickname = $(this).find('.im-f_nickname').text();
	var f_photo = $(this).find('.im-f_head img').attr('src');
	var f_id =$(this).attr('data-id');
    var quxiao = langData['siteConfig'][6][12]; //取消
    var fasong = langData['siteConfig'][6][139]; //发送
	M.dialog = jqueryAlert({
      'title'   : langData['siteConfig'][46][1]+' '+toUserinfo['name'],//发送给
      'content' : '<div class="fn-clear im-pop_recf"><div class="im-recf_head"><img src="'+f_photo+'"/><i class="level"></i></div><div class="im-recf_info"><h2>'+f_nickname+'</h2><p>ID：'+f_id+'</p></div></div>',
       'modal'   : true,
       'width':'5rem',
       'height':'3.5rem',
       'contentTextAlign':'left',
       'className':'im-recf_modal',
       'isModalClose':true,
       'buttons' :{
          [quxiao] : function(){
             M.dialog.close();
           },
           [fasong] : function(){
			 M.dialog.close();
			 msg = {
			 	'f_id':f_id,
			 	'f_name':f_nickname,
			 	'f_photo':f_photo
			 }
			 msgto(msg,'recfriend');//推荐好友
			 $('.im-chat_content_box').scrollTop($('.im-chat_content_box')[0].scrollHeight)
			 showMsg('<img class="gou" src="'+templets_skin+'images/gou.png">'+langData['siteConfig'][44][91]);//已发送
			 setTimeout(function(){
			 	$('.im-friendlist_page').animate({'bottom':'-100%'},150)
			 },1500)
           },

      }
  })
});

//分享好友
$('body').delegate('.im-btn_rec','tap',function(){
	$('.im-friendlist_page').animate({'bottom':'0'},200);
	r_flist(userid);

});

$('body').delegate('.im-close_page,.im-hb_cancel','tap',function(){
	$(this).parents('.im-pop_page').animate({'bottom':'-100%'},200)
});

//发红包
$('body').delegate('.im-btn_hb','tap',function(){
	$('.im-fahb_page').animate({'bottom':'0'},200);
});

//点击验证
	$('body').delegate('.im-hb_money_in','tap',function(){
		var money = $('#hb_money').val();

		if(!money){
			errorMsg=langData['siteConfig'][46][76];//总金额不能为空
	        showMsg(errorMsg);return;
		}
		var note = $(".im-fahb_text").text();
		$.ajax({
			url :'/include/ajax.php?service=live&action=makeHongbao',
			data : {
                amount : money,
                note : note,
                chatid : chatid
			},
			type : 'GET',
			dataType : 'JSON',
			success : function (data) {
				data = JSON.parse(data);
				if(data.state == 100){
					window.location.href = data.info;
				}else{
					if(data.info == langData['siteConfig'][46][75]){//最少金额为1元
						alert(data.info);return;
					}
                    location.href = masterDomain + '/login.html';
                }
            }
		})


	});

//红包消息点击
$('body').delegate('.im-hb_content','tap',function(){
	var t=$(this);
	if(t.parents('.im-to_other').length>0){
		$('.im-hbdetail_page').animate({'bottom':'0'},200);
		if(t.find('.im-hb_null').length>0){
			$('.im-hbdetail_null').show().siblings('.im-hbdetail_full').hide();
		}else{
			$('.im-hbdetail_full').show().siblings('.im-hbdetail_null').hide();
		}
	}else{
		$('.im-special_mask').show();
		if(t.find('.im-hb_null').length>0){
			$('.im-hb_box_null').show().siblings('.im-hb_box_full').hide();
		}else{
			$('.im-hb_box_full').show().siblings('.im-hb_box_null').hide();
		}

	}
});

//关闭红包
$('body').delegate('.im-hb_box_form i','tap',function(){
	$('.im-special_mask').hide();
	$(this).parents('.im-hb_box_form').hide();
});

//礼物选择框显示

$('body').delegate('.im-btn_gift','tap',function(){
	$('.im-menu_box').removeClass('im-show');
	$('.im-gift_box').addClass('im-show');

});

$('body').delegate('.im-gift_warp li','tap',function(){
	var t = $(this);
	t.addClass('im-gift_chose').siblings('li').removeClass('im-gift_chose');

});

//礼物数目增加
$('body').delegate('.im-gift_num i','tap',function(){
	var num = $(this).siblings('input').val();
	if($(this).hasClass('im-gift_add')){
		if(num*1!=99){
			$(this).siblings('input').val(num*1+1);
		}else{
			showMsg(langData['siteConfig'][46][77]);//一次只能赠送99个哦
		}

	}else{
		if(num*1!=1){
			$(this).siblings('input').val(num*1-1);
		}else{
			showMsg(langData['siteConfig'][46][78]);//不能再减了哦
		}

	}

});

$('body').delegate('.im-gift_num input','change',function(){
	var num = $(this).val();
	if(num*1>99){
		$(this).val(99);

	}else if(100>num*1>0){
		$(this).val(num);
	}else{
		$(this).val(1);
	}
});

//关闭好友验证
$('body').delegate('.im-f_test_page .im-back_btn','tap',function(){
	$('.im-f_test_page').animate({'bottom':'-100%'},150);
});

//关闭好友验证
$('body').delegate('.im-f_test_page .im-send_btn,.im-f_test_page  .im-send_sure','tap',function(){
	if(!$(this).hasClass('im-disabled')){
		$(this).addClass('im-disabled').html('提交中...');
		var note ;
		if($('.im-test_info').text()==''){
			note = langData['siteConfig'][46][6]+ userinfo['name'];//我是
		}else{
			note = $('.im-test_info').text();
		}
		$.ajax({
	        url: '/include/ajax.php?service=siteConfig&action=applyFriend&tid='+toUserinfo['uid']+'&note='+note,
	        type: 'post',
	        dataType: 'json',
	        success: function(data){
	            if(data.state == 100){
	            	if(data.info==langData['siteConfig'][46][79]){ //申请成功
	            		showMsg(langData['siteConfig'][46][80]); //好友申请已发送，请等待
		            	var data = {
			            	content: note,
				            contentType: 'apply',
				            from: userinfo['uid'],
				            to: toUserinfo['uid'],
				            type: "person",
				            time: time
			            }
		            	 createEle(data);
	            	}else if(data.info==langData['siteConfig'][46][81]){ //添加成功
	            		showMsg(langData['siteConfig'][46][82]); //已成功添加对方为好友
	            		$('.im-tip_box').hide();
	            	}else{
	            		showMsg(data.info);
	            	}

	            }else{
	                showMsg(data.info);
	            }
	        },
	        error: function(){
	            alert(langData['siteConfig'][46][63]);//网络错误，初始化失败！
	        }
	    });
		setTimeout(function(){
			$('.im-f_test_page').animate({'bottom':'-100%'},150);
			$('.im-send_sure').html('已提交');
			setTimeout(function(){
				$('.im-send_sure').removeClass('im-disabled');
			},500)
		},500)
	}else{
		return false;
	}

});


//按键发送

$('body').delegate('.placeholder','keydown',function(e){

	e = event || window.event;
	if(e.keyCode == 13){
		var html = $('.im-input').html();
		for(var i=0;i<$('.im-input img').length; i++){
			var t = $('.im-input img').eq(i);
			txt = t.attr('data-txt');
			t.after("<em>"+txt+"</em>");
			//t.after('△'+t.attr('src')+'△');
		}
		$('.im-input img').remove();
		var msg = $('.im-input').html()
		msgto(msg,'text');
		$('.im-send_btn').removeClass('im-show').siblings('.im-upload').addClass('im-show');

		$('.im-input').html('');
   		e.returnValue = false;
		return false;
	}


});


//消息被忽略
$('body').delegate('.im-apply_msg','tap',function(){
	if($(this).parents('.im-chat_item').hasClass('im-from_other')){
		$('.im-tip_box').html('<a href="javascript:;" class="im-agree_f">'+langData['siteConfig'][46][65]+'<button>'+langData['siteConfig'][6][2]+'</button><i class="im-close_tip"></i></a>');//对方申请加为好友--同意
	}

});


 //发送定位
 $('body').delegate('.im-map_send','tap',function(){

 		var chose = $('.im-onchose'), h = chose.find('h5').text(), p = chose.find('p').text();
 		lng = chose.attr('data-lng'),
 		lat = chose.attr('data-lat');
 		pageData = {
  		mapType: site_map,
  		lng    : lng,
  		lat    : lat,
  		title  : h,
  		address: p,
  		lnglat:[lng,lat],
        mapKey:mapkey,
  	}
 		img_url(pageData)
 		if(chose.length==0){
 			showMsg(langData['siteConfig'][40][10])//请选择所在位置
 			return false;
 		}else{
 			msg = {
 				lng:lng,
 				lat:lat,
 				mapimg:MapImg_URL,
 				name:h,
 				address:p
 			}
 			msgto(msg,'mapshare')
// 			$('.im-chat_content').append('<div class="im-to_other fn-clear"><div class="im-m_head"><img src="'+templets_skin+'upfile/img.png" /></div><div class="im-m_content im-post_content" data-lng='+lng+' data-lat='+lat+'><a class="appMapBtn" target="_blank" href="javascript:;"><div class="im-post_text"><h2>'+h+'</h2><p>'+p+'</p></div><div class="im-area_show"><img src="'+MapImg_URL+'" /></div></div></a></div>');
   			$('#im-map').hide();
   			$('.im-chat_content_box').scrollTop($('.im-chat_content_box')[0].scrollHeight);
 		}
 });

//视频播放
var player
$('body').delegate('.im-video_msg','tap',function(){
	var src = $(this).children('video').attr('src');
	$('.video_box').show()
	  player = new Aliplayer({
	  "id": "im-video_show",
	  "source": src,
//	  "cover": litpic,
	  "width": "100%",
	  "height":"100%",
	  "autoplay": true,
	  "rePlay": false,
	  "playsinline": true,
	  "preload": true,
	  "controlBarVisibility": "hover",
	  "useH5Prism": true,
//	  "skinLayout": [],
	}, function (player) {
	    console.log("创建成功");
	  }
	);
});

$('.im-close_video').click(function(){
	$('.video_box').hide();
	player.dispose();

});




	wx.config({
	    debug: false,
	    appId: wxconfig.appId,
	    timestamp: wxconfig.timestamp,
	    nonceStr: wxconfig.nonceStr,
	    signature: wxconfig.signature,
	    jsApiList: ['chooseImage', 'previewImage', 'uploadImage', 'downloadImage','startRecord', 'stopRecord', 'onVoiceRecordEnd', 'playVoice', 'pauseVoice', 'stopVoice', 'onVoicePlayEnd', 'uploadVoice', 'downloadVoice', 'openLocation']
	  });
	var iswechat = false;
	//微信分享
	wx.ready(function() {
//
	    iswechat = true;
	    $('.im-yuyin').removeClass('disabled');
        if((navigator.userAgent.toLowerCase().match(/miniprogram/) && navigator.userAgent.toLowerCase().match(/qq/)) || navigator.userAgent.toLowerCase().indexOf('swan-baiduboxapp') > -1) {
            $('.im-yuyin').addClass('disabled');
        }
	    wx.error(function(res){
	       console.log(res);
	    });
	    wx.onVoicePlayEnd({
	      success: function (res) {
	        $('.second').removeClass('pause');
	        $('.nolock .audioBtn span').removeClass('pause');
	        $('.nolock').removeClass('swiper-no-swiping');
	        $('.nolock .tips').text(langData['siteConfig'][46][83]).show();//播放完成
	        $('.im-speak_msg').removeClass('im-voicePlay');
	        stopWave();
	      }
	    });
	});


	 //计时器（开始时间、结束时间、显示容器）
  var mtimer, audioTime;
	function countDown(time, obj){

    var active = $('.swiper-slide-active');
		obj.text(time);

		mtimer = setInterval(function(){
			obj.text(++time);
			if(time >= 60) {
				clearInterval(mtimer);
        audioTime = 60;
		console.log('录音完成，点击播放')
        if (active.hasClass('nolock')) {
          var t = $('.nolock .audioBtn span'), btn = t.closest('.audioBtn'), tips = btn.siblings('.tips');
          $('.second').removeClass('pause').addClass('stop');
          t.removeClass('pause').addClass('stop');
          clearTimeout(recordTimer1);
          tips.text(langData['siteConfig'][46][84]).show();//录音完成，点击播放

          $('.nolock').removeClass('swiper-no-swiping');

          wx.stopRecord({
            success: function (res) {
              voiceId = res.localId;
              // alert(voiceId);

            },
            fail: function (res) {
              //alert(JSON.stringify(res));
            }
          });
        }else {
          var t = $('.lock .audioBtn span'), timeObj = t.closest('.audioBtn').siblings('.second');
          t.removeClass('pause');
          $('.second').removeClass('pause');

          timeObj.text('0');

          event.preventDefault();
          wx.stopRecord({
            success: function (res) {
              voiceId = res.localId;
              uploadVoice(1);
            },
            fail: function (res) {
              //alert(JSON.stringify(res));
            }
          });

        }

			}
		}, 1000);
	}

	var voiceId, recordTimer1;
	 // 点击开始录音
  $('.nolock .audioBtn span').click(function(){
    var t = $(this), btn = t.closest('.audioBtn'), tips = btn.siblings('.tips'), timeObj = btn.siblings('.second');
    if (!t.hasClass('stop')) {
      if (!t.hasClass('pause')&&!t.hasClass('record_end')) {
      		console.log('222')
        START = new Date().getTime();
        countDown(0, timeObj);
        recordTimer1 = setTimeout(function(){
//           alert(voiceId);
          wx.startRecord({
            success: function(){
                // localStorage.rainAllowRecord = 'true';
                $('.nolock').addClass('swiper-no-swiping');
                $('.second').addClass('pause');
                t.addClass('record_end');
                tips.text(langData['siteConfig'][46][85]).hide();//正在录音，点击停止录音
            },
            cancel: function () {
                alert(langData['siteConfig'][46][86]);//用户拒绝授权录音
            }
          });
        },300);
      }else {
      		console.log('333')
        END = new Date().getTime();
        clearInterval(mtimer);
        // alert(voiceId);
        audioTime = timeObj.text();

        $('.second').removeClass('pause').addClass('stop');
        t.removeClass('record_end').addClass('stop');
        clearTimeout(recordTimer1);
        tips.text(langData['siteConfig'][46][84]).show();//录音完成，点击播放
        $('.im-btn_group').show();
        $('.nolock').removeClass('swiper-no-swiping');

        if((END - START) < 300){
            END = 0;
            START = 0;
        }else{
            wx.stopRecord({
              success: function (res) {
                voiceId = res.localId;
              },
              fail: function (res) {
                //alert(JSON.stringify(res));
              }
            });
        }
      }
    }else {
    		console.log('444')
      if (t.hasClass('pause')) {
        t.removeClass('pause');
        $('.second').removeClass('pause');
        wx.stopVoice({
            localId: voiceId, // 需要停止的音频的本地ID，由stopRecord接口获得
            success: function(res){
              $('.nolock').removeClass('swiper-no-swiping');
              tips.text(langData['siteConfig'][46][87]);//停止播放
            },
            fail: function(res){
              //alert(JSON.stringify(res));
            }
        });
      }else {
        t.addClass('pause');
        wx.playVoice({
            localId: voiceId, // 需要播放的音频的本地ID，由stopRecord接口获得
            success: function(res){
              $('.nolock').addClass('swiper-no-swiping');
              tips.text(langData['siteConfig'][46][88]);//正在播放
            },
            fail: function(res){
              //alert(JSON.stringify(res));
            }
        });
      }
    }
  });

   var recordTimer;
  // 按住录音
  $('.lock .audioBtn span').on('touchstart', function(){
    var t = $(this), timeObj = t.closest('.audioBtn').siblings('.second');
    START = new Date().getTime();
    if (iswechat) {
      event.preventDefault();
      recordTimer = setTimeout(function(){
        wx.startRecord({
          success: function(){
            // localStorage.rainAllowRecord = 'true';
            t.closest('.swiper-slide-active').find('.tips').text(langData['siteConfig'][46][90]).hide();//正在录音，松手停止录音
            $('.lock .audioBtn').removeClass('stop');
            t.removeClass('stop').addClass('pause');
            $('.second').removeClass('stop').addClass('pause');
            countDown(0, timeObj);
          },
          cancel: function () {
            alert(langData['siteConfig'][46][86]);//用户拒绝授权录音
          }
        });
      },300);
    }
  });

  $('.lock .audioBtn span').on('touchend', function(event){
    var t = $(this), timeObj = t.closest('.audioBtn').siblings('.second');
    END = new Date().getTime();
    clearInterval(mtimer);
    t.closest('.swiper-slide-active').find('.tips').text(langData['siteConfig'][46][89]).show();//按住说话
    clearTimeout(recordTimer);
    t.removeClass('pause');
    $('.second').removeClass('pause');
    audioTime = timeObj.text();
    timeObj.text('0');

    if (iswechat) {
      event.preventDefault();
      if((END - START) < 300){
          END = 0;
          START = 0;
      }else{
          wx.stopRecord({
            success: function (res) {
              voiceId = res.localId;
              uploadVoice(1);
            },
            fail: function (res) {
                 alert(JSON.stringify(res));
            }
          });
      }
    }
  });

// 重新录音
  $('.im-audio_box .reset').click(function(){
    $('.swiper-slide-active .second').text('0');
//  $('.lock .tips').text('按住按钮开始录音').show();
    $('.nolock .tips').text(langData['siteConfig'][46][91]).show();//点击开始录音
    $('.second').removeClass('pause');
    $('.second').removeClass('stop');
    $('.swiper-slide-active .audioBtn span').removeClass('start');
    $('.swiper-slide-active .audioBtn span').removeClass('stop');
    $('.swiper-slide-active .audioBtn span').removeClass('pause');
    $('.swiper-slide-active .audioBtn span').removeClass('record_end');
    $('.swiper-slide-active.swiper-no-swiping').removeClass('swiper-no-swiping');
    $('body').unbind('touchmove');
    clearInterval(mtimer);
    clearTimeout(recordTimer);
    clearTimeout(recordTimer1);

    // 停止录音
    wx.stopRecord({
      success: function (res) {
        voiceId = res.localId;
      },
      fail: function (res) {
        // alert(JSON.stringify(res));
      }
    });

  });

   // 录音完成

  $('.im-audio_box .finish').click(function(){
    var active = $('.swiper-slide-active'), btn = active.find('.audioBtn span');
    if (!btn.hasClass('record_end')&&!btn.hasClass('pause')) {
      	hideAudioBox();
		$('.im-audio_box').find('audio').remove();  //删除之前的录音
    }
  });



  // 隐藏录音弹出层
  function hideAudioBox(){
    var active = $('.swiper-slide-active'), noSwiper = active.find('.audioBtn span');
    if (active.hasClass('nolock') && noSwiper.hasClass('stop')) {
      uploadVoice();
    }
    $('.second').text('0');
    $('.audioBtn span').removeClass('pause');
    $('.audioBtn span').removeClass('stop');
    $('.second').removeClass('stop');
    $('.lock .tips').text(langData['siteConfig'][46][92]);//按住按钮说话
    $('.unlock .tips').text(langData['siteConfig'][46][91]);//点击开始录音
//  $('mask').hide();
	$('.im-yuyin').removeClass('im-keyboard');
    $('.im-menu_box').removeClass('im-show');  //其他框
	$('.im-gift_box').removeClass('im-show');  //礼物框
	$('.im-chat_content').css('padding-bottom','1.3rem');
	$('.im-btn_group').hide(); //发送按钮隐藏
    $('body').unbind('touchmove');
  }


//上传录音
  function uploadVoice(dom){
      //调用微信的上传录音接口把本地录音先上传到微信的服务器
      if (dom == "1") {
        $('.lock .tips').text(langData['siteConfig'][46][92]);//按住按钮说话
      }else {
        $('.nolock .tips').text(langData['siteConfig'][46][91]);//点击开始录音
      }

	  showMsg(langData['siteConfig'][45][73], 2000);	//正在上传...

      wx.uploadVoice({
          localId: voiceId, // 需要上传的音频的本地ID，由stopRecord接口获得
          isShowProgressTips: 1, // 默认为1，显示进度提示
          success: function (res) {
              //把录音在微信服务器上的id（res.serverId）发送到自己的服务器供下载。
      			  // alert(res.serverId);

                $.ajax({
                  url: masterDomain+'/api/weixinAudioUpload.php',
                  type: 'POST',
                  data: {"service": "siteConfig", "action": "uploadWeixinAudio", "module": "siteConfig", "media_id": res.serverId},
                  dataType: "json",
                  success: function (data) {
                    var audioWidth = (1 + (audioTime / 30)) + 'rem';
                    var textIndent = (2.9 + (audioTime / 30)) + 'rem';
                    if (data.info == '云端下载失败！') {
                      alert(langData['siteConfig'][46][93]);//云端下载失败！
                    }else {

                      showMsg(langData['siteConfig'][46][94], 2000);//正在发送...

                      // setTimeout(function(){

                      	if (dom == "1") {
							var msg = {
								voiceId:voiceId,
								audioWidth:audioWidth,
								audioTime:audioTime,
								audioUrl:data.info,
								textIndent:textIndent,
							}
							msgto(msg,'audio');
	                        hideAudioBox();
	                      }else {
							var msg = {
								voiceId:voiceId,
								audioWidth:audioWidth,
								audioTime:audioTime,
								audioUrl:data.info,
								textIndent:textIndent,
							}
							msgto(msg,'audio');
							$('.im-audio_box').append('<audio class="msg_audio" data-indent="'+textIndent+'" data-id="'+voiceId+'" data-width="'+audioWidth+'" controls="" data-time="'+audioTime+'" src="'+data.info+'"></audio>');

	                      }

                      // }, 2500);

                    }
                  },
                  error: function(XMLHttpRequest, textStatus, errorThrown){
                    // $('body').html(res.serverId)
                    // alert(res.serverId)
                    alert('Error:' + XMLHttpRequest.status + '_' + XMLHttpRequest.readyState + '_' + textStatus);
                  }
                });

            },
            fail: function (res) {
              alert(JSON.stringify(res));
            }
      });
  }

//播放语音
var amr = new BenzAMRRecorder();
$('body').delegate('.im-m_content.im-s_content', 'tap', function(){
    var t = $(this).children('.im-speak_msg'), id = t.attr('data-id');
    var init = t.find('audio.chat_audio');
	var aUrl = init.attr('src');
	if(amr.isInit()){
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




});
