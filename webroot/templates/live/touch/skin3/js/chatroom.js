
var chatLib, AccessKeyID, userinfo, chatToken, chatServer;
var isload = false, page = 1, pageSize = 20, totalPage = 1, stop = 0, time_now = Math.round(new Date().getTime()/1000).toString();

$(function(){

   // var room = getQueryString('room');

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
                initRoom();
            };

            // 异常
            this.socket.onerror = function(){
                // alert('error')
                this.close()
            };

            // 收到消息
            this.socket.onmessage = function (evt) {
                lib.reset();  //重置心跳
                var msg = JSON.parse(evt.data);
                
                switch (msg.contentType) {
                    case "init":
                        console.log(msg.content);
                        break;
                    default:
                        if(userinfo['uid'] != msg.info.from && msg.info.type == 'chat'){
                        	// console.log(msg.info)
                        	var data = {
					            content: msg.info.content,
					            contentType: msg.type,
					            mark: 'chatRoom' + room,
					            from: msg.info.from,
					            name:msg.info.name,
					            photo:msg.info.photo,
					            time: time_now,
					        }
                            createEle(data, '', 1, lib);
                        }else if(userinfo['uid'] == msg.info.from && msg.info.type == 'chat'){
							if($(".chat_item[data-time='"+msg.info.time+"']").size()==0){
								var data =msg.info;
								data.contentType = msg.type
								createEle(data);
							}
						}
                        break;
                }

            };

        } else {
            alert('您的浏览器不支持WebSockets.');
            return false;
        }

        this.start();  //启动心跳检测

    };

    function initRoom(){
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

                    // console.log(userinfo)

                    //创建连接
                    chatLib = new kumanIMLib(chatServer + "?AccessKeyID=" + AccessKeyID + "&token=" + chatToken + "&type=chat&uid=" + userinfo.uid + "&mark=" + 'chatRoom' + room);
                    // console.log(time_now)
//                  loadMessage();

                    //加入聊天室
                    var data = {
                        mark: 'chatRoom' + room,
                        from: chatToken,
                    }
                    $.ajax({
                        url: '/include/ajax.php?service=siteConfig&action=joinChatRoom',
                        data: data,
                        type: 'post',
                        dataType: 'json',
                        success: function(data){
                             changeCon();
                        },
                        error: function(){

                        }
                    });

                }else{
                    console.log(data.info);
                }
            },
            error: function(){
                alert('网络错误，初始化失败！');
            }
        });
    }
    //初始化
    if(room){
       initRoom();
    }
// 点击导航切换

    $('.tab_box ul li').click(function(){
         var t = $(this),i=t.index();
         if(!t.hasClass('on_chose')){
            t.addClass('on_chose').siblings().removeClass('on_chose');
         }

         changeCon();

    });

    function changeCon(){
        var id = $(".tab_box li.on_chose").attr('data-id')

        if(id && id != '' && id != null ){//互动 图文 榜单
            $('.con_box>.con_li').each(function(){
                var sid=$(this).data('id');
                if(id==sid){
                    $(this).fadeIn();
                    $(this).siblings().hide();
                    if($(this).find('.interact').length>0 && chatToken != 'undefined'){
                        if($(this).find('.interact .chat_item').length==0){//互动里的图片
                            loadMessage();
                        }

                        Zepto.fn.bigImage({
                            artMainCon:"#main_info ",  //图片所在的列表标签
                            show_Con:".img_con .reply_con"
                        });

                    }else if($(this).find('.libox').length>0){//图文里的图片
                        //查看大图
                        Zepto.fn.bigImage({
                            artMainCon:".con_li.ulbox",  //图片所在的列表标签
                            show_Con:".thumb"
                         });
                    }
                }
            })

         }else{
            $('.con_box>.con_li').hide();
            $('.con_box>.jieshao').fadeIn();
            if($('.con_box>.jieshao').find('.introduce_title img').length>0){
                //图文介绍
                Zepto.fn.bigImage({
                    artMainCon:".introduce ",  //图片所在的列表标签
                    show_Con:".introduce_title"
                });
            }
         }
    }


    $('.tab_box ul li.on_chose').click();

	/*图片上传*/
	var upPhoto = new Upload({
		btn: '.photograph',
		bindBtn: '.topbox .album .null',
		title: 'Images',
		mod: modelType,
		deltype: 'delAtlas',
		params: 'type=atlas',
		fileQueued: function(file) {},
		uploadSuccess: function(file, response, btn) {
			$(".mask_01").click();
			if (response.state == "SUCCESS") {
				delete response._raw;
				msgto(response,'image');
				setTimeout(function(){
					 Zepto.fn.bigImage({
						artMainCon:"#main_info ",  //图片所在的列表标签
						show_Con:".img_con .reply_con"
					});
				},500)
			}
		}
	});


    //创建历史对话
    var appendLog = function (ele, item, type, time) {
        var log = $('#main_info');

        if(log.find('.chat_item').size() == 0){
            log.append('<p class="hour" data-time="'+time+'">'+getDateDiff(time)+'</p>');
        }else{
            if(type != 'prepend'){
                var lastTime = parseInt(log.find('.chat_item:last').attr('data-time'));
                var timeCalcu = time-lastTime;
            }else{
                var lastTime = parseInt(log.find('.hour:eq(0)').attr('data-time'));
                var timeCalcu = lastTime-time;
            }

            if(timeCalcu > 300){
                if(type != 'prepend'){
                    log.append('<div class="hour" data-time="'+time+'">'+getDateDiff(time)+'</div>');
                }else{
                    log.prepend('<div class="hour" data-time="'+time+'">'+getDateDiff(time)+'</div>');
                }
            }
        }

        if(type != 'prepend'){
            log.append(item);
//          console.log($("#main_info")[0].scrollHeight)
            log.scrollTop(log[0].scrollHeight - log.height());
        }else{

            log.prepend(item);

            stop += log.find('.chat_item:eq(0)').height();
            console.log(stop)
            log.scrollTop(stop);

        }
    }

    // 业务层
    var createEle = function(data, type, newMessage, lib){
        var from = data.from;
        var sf = false;
		 if(newMessage){
			console.log(data)
		 }
        //拼接对话
        var fromUser = '';

        var imghead = ''
        if (from == userinfo['uid']) {
        	imghead = '<div class="head_portrait"><img src="'+userinfo['photo']+'"></div>'
            fromUser = '<p class="nickname">'+userinfo['name']+'</p>';
            sf = true;

        }else{
        	imghead = '<div class="head_portrait"><img src="'+data.photo+'"></div>';
        	fromUser = '<p class="nickname">'+data.name+'</p>';
        }

        var text = fromUser;

        // 文本
        var gift = 0;
        if(data.contentType == "text"){
            if(data.content.indexOf("__L__:") != -1){//礼物
                var giftcontent  = data.content;
                var giftArr      = giftcontent.split(":");
                if(giftArr[1]!=''){
                    var html = getChatDetail(giftArr[1] , 1, data.name, data.photo);
                    text = html;
                    gift = 1;
                }
            }else if(data.content.indexOf("__H__:") != -1){//红包
                var hongbaocontent  = data.content;
                var hongbaoArr      = hongbaocontent.split(":");
                if(hongbaoArr[1]!=''){
                    var html = getChatDetail(hongbaoArr[1] , 2, data.name, data.photo);
                    text += html;
                }
            }else{
                text += '<div class="text_con"><p class="reply_con">'+data.content+'</p></div>';
            }
        }

        // 图片
        if(data.contentType == 'image'){
            content = data.content;
            text += '<div class="text_con img_con"><p class="reply_con"><img class="img_msg" src="/include/attachment.php?f='+content.url+'" /></p></div>';;
        }

		if(gift==1){
          var item = text;
        }else{
          var item = '<div class="fn-clear chat_item" data-user="'+data.from+'" data-time="'+data.time+'"'+(sf ? ' style="text-align: right;"' : '')+'>'+imghead+'<div class="text">'+text+'</div></div>';
        }
        appendLog('mine', item, type, data.time);

    };

    //获取礼物，红包
    function getChatDetail(h_id, type, name, photo){
        var html = '';
        $.ajax({
            url: '/include/ajax.php?service=live&action=getChatDetail&h_id=' + h_id + "&type=" + type,
            type: 'post',
            dataType: 'json',
            async : false,
            success: function(data){
                if(data.state == 100 && data.info){
                    if(data.info.type == 1){
                        //礼物
                        if(data.info.is_gift == 0){
                            //打赏
                            html = '<div class="liwu_list"><p>'+name+'打赏了'+live_user_n+' '+data.info.amount+' 元</p></div>';
                        }else{
                            //礼物
                            html = '<div class="liwu_list"><p>'+name+'送了'+live_user_n+' '+data.info.num+' 个 <em>'+data.info.gift_name+'</em></p></div>';
                        }
                    }else if(data.info.type == 2){
                        var is_fin = '1';
                        var data_state = '0';
                        if(data.info.h_state == 1){
                            is_fin = '2';
                            data_state = 1;
                        }else if(data.info.h_state == 2){
                            data_state = 2;
                        }

                        html += '<div class="fn-clear">' +
                            '<div class="text">' +
                            '<div class="hongbao hongbao_bg_0'+is_fin+'" data-state="'+data_state+'" data-liveid="'+h_id+'">' +
                            '<img src="'+templets_skin+'images/bb_xiao.png">' +
                            '<div class="hongbao_top">' +
                            '<p class="h_01">'+data.info.note+'</p>' +
                            '<p class="h_02">领取红包</p>' +
                            '</div>' +
                            '<div class="hongbao_bottom">普通红包</div>' +
                            '</div>' +
                            '</div>' +
                            '</div>';
                    }
                }
            },
            error: function(){
                console.log(data);
            }
        });
        return html;

    }

    //发消息
    $(".ios-input-submit").bind('click', function(event) {
		$("#content_text img").each(function(){
			var t = $(this);
			var txt = t.attr('data-txt');
			t.after(txt)
			t.remove();
		})
        var msg = $("#content_text").html();

        msg = $.trim(msg);
        msgto(msg,'text');
        $("#content_text").html('').attr('data-reply', '');
		$('.ios-input-close').click();
		  $('#content_text').html('');//清空消息
    });

    document.getElementById("content_text").onkeyup = function(event) {
        if (event.keyCode == "13") {
            $(".ios-input-submit").trigger("click");
        }
    };

	function msgto(msg,type){
		if (! msg) {
            return false;
        }

        if (msg == '') {
            alert("消息内容为空");
            return false;
        }

        var time = Math.round(new Date().getTime()/1000).toString();
        var data = {
            content: msg,
            contentType: type,
            mark: 'chatRoom' + room,
            from: chatToken,
            time: time
        }
        $.ajax({
            url: '/include/ajax.php?service=siteConfig&action=sendImChatRoom',
            data: data,
            type: 'post',
            dataType: 'json',
            success: function(data){
				if(data && data.state == 100){
	                chatLib.reset();
				}else{
					alert(data.info);
				}

            },
            error: function(){

            }
        });

        data.from = userinfo['uid'];
        data.name = userinfo['name'];
        data.photo = userinfo['photo'];
        // createEle(data);

	}

    //加载聊天记录
    function loadMessage(type){
        if(isload || page > totalPage) return false;
        isload = true;

        $.ajax({
            url: '/include/ajax.php?service=siteConfig&action=getImChatRoomLog',
            data: {from: chatToken, mark: "chatRoom" + room, page: page, pageSize: pageSize, time: time_now},
            type: 'post',
            dataType: 'json',
            success: function(data){
				// console.log(room)
                if(data && data.state == 100){
                    data = data.info;
                    var pageInfo = data.pageInfo;
                    var list = data.list;
                    if(page == 1){
                        list.reverse();
                    }
                    totalPage = pageInfo.totalPage;
                    for(var i = 0; i < list.length; i++){
                        var data = {
                            content: list[i].info.content,
                            contentType: list[i].type,
                            from: list[i].info.uid,
                            name: list[i].info.name,
                            photo: list[i].info.photo,
                            type: "person",
                            time: list[i].info.time
                        }
                        createEle(data, type);

                    }
                    setTimeout(function(){
                        isload = false;
                        Zepto.fn.bigImage({
								artMainCon:"#main_info ",  //图片所在的列表标签
								show_Con:".img_con .reply_con"
							});
                    }, 1000);

                    //最后一页显示时间
                    if(page > 1 && page == pageInfo.totalPage){
                        var time = parseInt($('#main_info').find('.chat_item:eq(0)').attr('data-time'));
                        $('#main_info').prepend('<p class="hour" data-time="'+time+'">'+getDateDiff(time)+'</p>');
                    }

                    page++;

                }else{
                    console.log(data.info);
                    isload = false;
                }
            },
            error: function(){
                console.log('network error');
                isload = false;
            }
        });

    }





    function getDateDiff(theDate){
        var nowTime = (new Date());    //当前时间
        var date = (new Date(theDate*1000));    //当前时间
        var today = new Date(nowTime.getFullYear(), nowTime.getMonth(), nowTime.getDate()).getTime(); //今天凌晨
        var yestday = new Date(today - 24*3600*1000).getTime();
        var is = date.getTime() < today && yestday <= date.getTime();

        var Y = date.getFullYear(),
        M = date.getMonth() + 1,
        D = date.getDate(),
        H = date.getHours(),
        m = date.getMinutes(),
        s = date.getSeconds();
        //小于10的在前面补0
        if (M < 10) {
            M = '0' + M;
        }
        if (D < 10) {
            D = '0' + D;
        }
        if (H < 10) {
            H = '0' + H;
        }
        if (m < 10) {
            m = '0' + m;
        }
        if (s < 10) {
            s = '0' + s;
        }

        if(is){
            return '昨天 ' + H + ':' + m;
        }else if(date > today){
            return H + ':' + m;
        }else{
            return Y + '-' + M + '-' + D + '&nbsp;' + H + ':' + m;
        }
    }

    function transTimes(timestamp, n){
		
        const dateFormatter = huoniao.dateFormatter(timestamp);
        const year = dateFormatter.year;
        const month = dateFormatter.month;
        const day = dateFormatter.day;
        const hour = dateFormatter.hour;
        const minute = dateFormatter.minute;
        const second = dateFormatter.second;
        
		if(n == 1){
			return (year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second);
		}else if(n == 2){
			return (year+'-'+month+'-'+day);
		}else if(n == 3){
			return (month+'-'+day);
		}else if(n == 4){
			return (hour+':'+minute);
		}else{
			return 0;
		}
	}


    function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }



	//提示窗
	var showErrTimer;
	var showMsg = function(txt,time){
		showErrTimer && clearTimeout(showErrTimer);
		$(".popMsg").remove();
		$("body").append('<div class="popMsg"><p>'+txt+'</p></div>');
		$(".popMsg p").css({ "left": "50%"});
		$(".popMsg").css({"visibility": "visible"});
		showErrTimer = setTimeout(function(){
		    $(".popMsg").fadeOut(300, function(){
		        $(this).remove();
		    });
		}, time);
    }

    if(showTip == 1){
        // showMsg('<span class="gou"><img src="'+templets_skin+'images/gou.png"/></span>回放正在制作中，先看看别的吧~',5000);
    }else if(showTip == 3 && showTipCookie !=1){
        // showMsg('<span class="gou"><img src="'+templets_skin+'images/gou.png"/></span>付费成功</br>欢迎继续观看直播',5000);
    }
	// if($('.live_state').hasClass('live_after') && $('#player-con').attr('data-src')==''){
        // showMsg('回放正在制作中，先看看别的吧~',3000);
        // $(".popMsg").css({'width':'4.6rem'})
		// showMsg('<span class="gou"><img src="'+templets_skin+'images/gou.png"/></span>付费成功</br>欢迎继续观看直播',5000);
        // showMsg('<span class="tip"><img src="'+templets_skin+'images/tip.png"/></span>邀请码错误',1500)
    // }

	$('#main_info').scroll(function() {
        var scroH = $(this).scrollTop();  //滚动高度
        stop = scroH;
        if(scroH < 50 && !isload){  //距离顶部大于100px时
            loadMessage('prepend');
        }
    });

    // 验证邀请码
    $('.go_sure').click(function (e) {
        checkLogin();
        e.preventDefault();
        var invite = $('.code_in').val();
        var msg;
        if(invite==''){
            msg = "请输入邀请码";
            showMsg(msg, 500);
            return false;
        }

        var url = $("#pForm").attr('action'), data = $("#pForm").serialize();

        $.ajax({
			url: url,
			data: data,
			type: "POST",
			dataType: "html",
			success: function (data) {
                if(data!='密码错误'){
                    location.reload();
                }else{
                    showMsg(data, 500);
                }
            },
			error: function(){
                showMsg(langData['siteConfig'][20][183], 300); //网络错误，请稍候重试！
            }
        });

    });

    //付费观看
    $(".go_pay").click(function(){
        checkLogin();
        var regu = "(^[1-9]([0-9]?)+[\.][0-9]{1,2}?$)|(^[1-9]([0-9]+)?$)|(^[0][\.][0-9]{1,2}?$)";
        var re = new RegExp(regu);
        if (!re.test(amount)) {
            amount = 0;
            alert("最少0.01元！");
            return false;
        }
        var app = device.indexOf('huoniao') >= 0 ? 1 : 0;
        // location.href = masterDomain + "/include/ajax.php?service=live&action=livePay&liveid="+id+"&amount="+amount+"&app="+app;
        // return;

        var data = [];
        data.push("liveid="+id);
        data.push("amount="+amount);
        // data.push("paytype=wxpay");
        data.push("qr=1");

        $.ajax({
            url:'/include/ajax.php?service=live&action=livePay',
            data:data.join('&'),
            type:'GET',
            dataType:'json',
            success: function (data) {
                if(data && data.state == 100){
                    orderurl = data.info.orderurl;
                    if((typeof(paytype) !='undefined' && paytype == 1) || typeof (data.info) != 'object'){//找人付
                        location.href = data.info;

                    }else {
                        sinfo = data.info;
                        service = 'live';
                        $('#ordernum').val(sinfo.ordernum);
                        $('#action').val('pay');

                        $('#pfinal').val('1');
                        $("#amout").text(sinfo.order_amount);
                        $('.payMask').show();
                        $('.payPop').css('transform', 'translateY(0)');

                        if (totalBalance * 1 < sinfo.order_amount * 1) {

                            $("#moneyinfo").text('余额不足，');

                            $('#balance').hide();
                        }

                        if(monBonus * 1 < sinfo.order_amount * 1  &&  bonus * 1 >= sinfo.order_amount * 1){
                            $("#bonusinfo").text('额度不足，');
                            $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
                        }else if( bonus * 1 < sinfo.order_amount * 1){
                            $("#bonusinfo").text('余额不足，');
                            $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
                        }else{
                            $("#bonusinfo").text('');
                            $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
                        }

                        ordernum = sinfo.ordernum;
                        order_amount = sinfo.order_amount;

                        payCutDown('', sinfo.timeout, sinfo);
                        if(!sinfo.timeout){
                            $(".payInfoShow p").hide();
                            $(".payCancelPop p").css('visibility','hidden')
                        }

                        // setTimeout(function(){
                        //     t.removeClass("disabled").html('立即支付');
                        // }, 500);
                    }
                }else{
                    var popOptions = {
                        btnCancel:'确定',
                        title:data.info,
                        btnColor:'#222',
                        noSure:true,
                        isShow:true
                    }
                    confirmPop(popOptions);
                    $('.payBeforeLoading').hide()
                    t.removeClass("disabled").html('立即支付');
                }
            },
            error: function(){
                var popOptions = {
                    btnCancel:'确定',
                    title:langData['siteConfig'][20][183],
                    btnColor:'#222',
                    noSure:true,
                    isShow:true
                }
                confirmPop(popOptions);
                $('.payBeforeLoading').hide()
                t.removeClass("disabled").html('立即支付');
            }
        });
    });

})

//判断登录
function checkLogin(){
    var userid = $.cookie(cookiePre+"login_user");
    if(userid == null || userid == ""){
        window.location.href = masterDomain+'/login.html';
        return false;
    }
}
