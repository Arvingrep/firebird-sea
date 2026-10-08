var chatLib, AccessKeyID, userinfo, chatToken, chatServer, toUserinfo, toChatToken;
var isload = false, page = 1, pageSize = 20, totalPage = 1, stop = 0, time = Math.round(new Date().getTime() / 1000).toString();
var audio = new Audio();
audio.src = staticPath + 'audio/notice02.mp3';
var msgUnread = 0;
var isCleaning = false;  //是否正在操作全部已读

var appNumInterVal = null,frendListInterval = null

$(function () {
    //抖音小程序 团购页面时
    var isBytemini = device.toLowerCase().includes("toutiaomicroapp");
    if (isBytemini) {
        $('body').delegate('.footer_4_3 a', 'click', function () {
            var par = $(this).closest('li');
            var thref = $(this).attr('href');
            if (par.attr('data-code') == 'tuan') {
                tt.miniProgram.navigateTo({ url: '/pages/packages/tuan/index/index' });
                return false;
            } else if (thref.indexOf('tuan') > -1 && thref.indexOf('haodian') > -1) {
                tt.miniProgram.navigateTo({ url: '/pages/packages/tuan/haodian/haodian' });
                return false;
            }

        })
    }
    if (navigator.userAgent.toLowerCase().match(/micromessenger/)) {
        document.addEventListener('WeixinJSBridgeReady', function () {
            audio.muted = true;
            audio.play();
        });
    } else {
        document.addEventListener('touchstart', function () {
            audio.muted = true;
            audio.play();
        });
    }

    $('.tip_list').css('min-height', $(window).height());
    function getunread() {
        var im_unread = $('.message_icon').attr('data-im') ? $('.message_icon').attr('data-im') : 0;
        var msg_unread = $('.message_icon').attr('data-unread') ? $('.message_icon').attr('data-unread') : 0;
        var up_unread = $('.message_icon').attr('data-upunread') ? $('.message_icon').attr('data-upunread') : 0;
        var commt_unread = $('.message_icon').attr('data-commentunread') ? $('.message_icon').attr('data-commentunread') : 0;
        if (msg_unread > 0) {
            $('.tab_box li[data-type="notice"]').addClass('msg_unread');
        } else {
            $('.tab_box li[data-type="notice"]').removeClass('msg_unread');
        }
        if (up_unread > 0) {
            // $('.zan.link_li').addClass('tip_num');
            // $('.zan.link_li').find('.right_con i').text(up_unread)
            $(".zanBox .count").text(up_unread)
        } else {
            // $('.zan.link_li').removeClass('tip_num');
            // $('.zan.link_li').find('.right_con i').text('');
            $(".zanBox .count").text('')
        }
        if (commt_unread > 0) {
            // $('.commt.link_li').addClass('tip_num');
            // $('.commt.link_li').find('.right_con i').text(commt_unread)
            $('.commtBox .count').text(commt_unread)
        } else {
            // $('.commt.link_li').removeClass('tip_num');
            $('.commtBox .count').text('')
        }

    }



    
    // if (device.indexOf('huoniao') > -1) {
    //    getAppnum()
    // setInterval(getAppnum,5000);
    // console.log('app')
    // }else{
    // 	setTimeout(function(){
    //  	getunread()
    // },800)
    //  setInterval(getunread,5000);
    //  console.log('html')
    // }


    var getAppnum = function () {
        if(isCleaning) return false; //如果正在操作全部已读角标，则不进行以下操作
        $.ajax({
            url: '/include/ajax.php?service=member&action=message&type=tongji&im=1',
            type: "GET",
            dataType: "json",
            timeout: 3000,
            success: function (data) {

                var html = [];
                if (data.state == 100) {
                    var info = data.info.pageInfo;
                    var count = info.im + info.unread + info.upunread + info.commentunread;

                    var im_unread = info.im;
                    var msg_unread = info.unread;
                    // msgUnread = info.im;
                    msgUnread = info.total;
                    var up_unread = info.upunread;
                    var commt_unread = info.commentunread;
                    if (msg_unread > 0) {
                        getSystemInfo(msg_unread);
                        $('.tab_box li[data-type="notice"]').addClass('msg_unread');
                    } else {
                        getSystemInfo();
                        $('.tab_box li[data-type="notice"]').removeClass('msg_unread');
                    }
                    if (up_unread > 0) {
                        $(".zanBox .count").text(up_unread)
                    } else {
                        $(".zanBox .count").text('')
                    }
                    if (commt_unread > 0) {
                        $('.commtBox .count').text(commt_unread)

                    } else {
                        $('.commtBox .count').text('')
                    }

                    //更新底部导航消息角标
                    $('.footer_4_3 li.message_show').find('em').remove();
                    if (count <= 99 && count > 0) {
                        $('.footer_4_3 li.message_show').find('a i').prepend('<em>' + count + '</em>');
                        $('.footer_4_3 li.message_show').attr('data-unread', info.unread);
                        $('.footer_4_3 li.message_show').attr('data-im', info.im);
                        $('.footer_4_3 li.message_show').attr('data-upunread', info.upunread);
                        $('.footer_4_3 li.message_show').attr('data-commentunread', info.commentunread)
                    } else if (count > 99) {
                        $('.footer_4_3 li.message_show').find('a i').prepend('<em>99+</em>')
                    }

                }
            },
            error: function () {
                // $('.loading').html('<span>'+langData['siteConfig'][37][80]+'</span>');  //请求出错请刷新重试
            }
        });
    }

    getAppnum()
    appNumInterVal = setInterval(getAppnum, 5000);

    function getSystemInfo(unread) {
        unread = unread ? (unread > 99 ? '99+' : unread) : 0;
        $.ajax({
            url: '/include/ajax.php?service=member&action=message&page=1&pageSize=1',
            type: "GET",
            dataType: "json",
            success: function (data) {
                if (data.state == 100) {
                    var infoList = data.info.list;
                    $(".msglist .sysMsg").remove();
                    //  if($(".msglist li").length == 0){
                    //  	$(".msglist").append('<li class="noData"><img src="'+templets_skin+'/images/noMsg.png"><p>在这里你可以收发消息哦~</p></li>')
                    // }
                    $(".msglist").prepend('<li class="msgBox sysMsg"> <a class="msgCon" href="' + userDomain + 'systemMsg.html""> <div class="icon"> <s class="mNum">' + (unread ? unread : "") + '</s> <div class="img"></div> </div> <div class="msgInfo"> <h3 class="nick">系统通知</h3> <p>' + infoList[0].title + '</p> </div> <div class="msgTime">' + (infoList[0]['timestamp'] ? getDateDiff(infoList[0]['timestamp']) : '') + '</div> </a> </li>');
                } else {
                    if ($(".msglist li").length == 0 && !cfg_ios_shelf) {
                        $(".msglist").append('<li class="noData"><img src="' + templets_skin + '/images/noMsg.png"><p>在这里你可以收发消息哦~</p></li>')
                    }
                }
            },
            error: function () { },
        });
    };

    //初始化用户信息
    var kumanIMLib = function (wsHost) {

        var lib = this;

        this.timeOut = 30000;  // 每30秒发送一次心跳
        this.timeOutObj = null;

        // 重置心跳
        this.reset = function () {
            clearTimeout(this.timeOutObj);
            lib.start();
        }

        // 启动心跳
        this.start = function () {
            lib.timeOutObj = setInterval(function () {
                lib.socket.send('HeartBeat');
            }, lib.timeOut);
        }

        // 初始化连接
        if (window['WebSocket']) {
            this.socket = new WebSocket(wsHost);
            //this.socket.onopen = this.evt.onopen;  // 连接成功

            // 关闭
            this.socket.onclose = function () {
                lib.socket = new WebSocket(lib.socket.url);
            };

            // 异常
            this.socket.onerror = function () {
                this.close();
            };

            // 收到消息
            this.socket.onmessage = function (evt) {
                lib.reset();  //重置心跳
                var msg = JSON.parse(evt.data);
                switch (msg.type) {
                    case "init":
                        break;
                    default:
                        if (userinfo['uid'] == msg.info.to && msg.info.type == 'member') {
                            var unread = '';
                            if (msg.info.unread > 0) {
                                unread = '<span class="tip_num">' + msg.info.unread + '</span>';
                                getunread();
                            }
                            audio.muted = false;
                            audio.play();
                            if (msg.type == 'text') {
                                $('.info_li[data-id="' + msg.info.from + '"]').find('.left_text p').html(msg.info.content.replace(/\\/g, ""));
                            } else if (msg.type == 'image') {
                                $('.info_li[data-id="' + msg.info.from + '"]').find('.left_text p').html('[图片]');
                            } else if (msg.type == 'apply') {
                                $('.info_li[data-id="' + msg.info.from + '"]').find('.left_text p').html(msg.info.content.replace(/\\/g, ""));
                            }
                            $('.info_li[data-id="' + msg.info.from + '"]').find('.time').html(getDateDiff(msg.info.time, 4));
                            $('.info_li[data-id="' + msg.info.from + '"]').find('.right_info .tip_num').remove();
                            $('.info_li[data-id="' + msg.info.from + '"]').find('.right_info').append(unread);
                            if ($('.info_li[data-id="' + msg.info.from + '"]').length == 0 && !cfg_ios_shelf) {
                                msg_list()
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
    $.ajax({
        url: '/include/ajax.php?service=siteConfig&action=getImToken',
        type: 'post',
        dataType: 'json',
        success: function (data) {
            if (data.state == 100) {
                var info = data.info;
                userinfo = info;
                chatToken = info.token;
                chatServer = info.server;
                AccessKeyID = info.AccessKeyID;
                //创建连接
                chatLib = new kumanIMLib(chatServer + "?AccessKeyID=" + AccessKeyID + "&token=" + chatToken + "&type=member");
                //获取消息列表

                //获取好友列表
                if (!cfg_ios_shelf) {

                    msg_list();
                    // notice_list();
                    frendListInterval = setInterval(msg_list, 5000);
                }

            } else {
                console.log(data.info);
                if(data.info != 'No data!'){
                    alert(data.info);
                    window.location.href = masterDomain + '/login.html';
                }
                return false;
            }
        },
        error: function () {
            console.log(langData['siteConfig'][46][63]);//网络错误，初始化失败！
        }
    });



    var msg_list = function () {

        $.ajax({
            url: '/include/ajax.php?service=siteConfig&action=getImFriendList&userid=' + userinfo['uid'] + '&type=temp',
            type: "GET",
            dataType: "json",
            success: function (data) {
                var datalist = data.info;

                var html = [];
                // html.push('<li class="msgBox sysMsg"> <a class="msgCon" href="'+userDomain+'systemMsg.html""> <div class="icon"> <s></s> <div class="img"></div> </div> <div class="msgInfo"> <h3 class="nick">系统通知</h3> <p>切勿直接展示联系方式谨防诈骗</p> </div> <div class="msgTime">昨天 17:42</div> </a> </li>');
                if (data.state == 100) {
                    if (datalist.length == 0) {
                        //       		$('.loading').html('<div class="im-no_list"><img src="'+templets_skin+'images/no_img.png"/><p>暂无会话~</p></div>');
                    } else {
                        var unread = '';
                        $('.message_list .loading').remove();
                        // console.log(datalist)
                        for (var i = 0; i < datalist.length; i++) {
                            // console.log(datalist[i].lastMessage.unread,datalist[i].unread)
                            if (datalist[i].lastMessage.unread > 0) {

                                unread = '<span class="tip_num">' + datalist[i]['lastMessage']['unread'] + '</span>';
                            } else {

                                unread = '';
                            }

                            var list = [];
                            var unread = datalist[i]['lastMessage']['unread'];
                            var headIcon = (datalist[i].userinfo.photo ? datalist[i].userinfo.photo : staticPath + "images/noPhoto_60.jpg")
                            list.push('<li class="msgBox" data-id="' + datalist[i].id + '" data-uid="' + datalist[i].userinfo.uid + '">');
                            list.push('<div class="msgLi" >');
                            list.push('<a class="msgCon" href="' + userDomain + 'chat-' + datalist[i].userinfo.uid + '.html">');
                            list.push('<div class="icon">');
                            list.push('<s class="mNum">' + (unread > 0 ? (unread > 99 ? '99+' : unread) : "") + '</s>');
                            list.push('<div class="img"><img src="' + headIcon + '"  onerror="this.src=\'/static/images/noPhoto_100.jpg\'"></div>');
                            list.push('</div>');
                            list.push('<div class="msgInfo">');
                            list.push('<h3 class="nick">' + datalist[i].userinfo.name + '</h3>');

                            if (datalist[i]['lastMessage']['type'] == "link") {
                                list.push('<p>[' + langData['siteConfig'][47][12] + ']</p>');
                            } else if (datalist[i]['lastMessage']['type'] == "orderlist") {
                                list.push('<p>[订单信息]</p>');
                            } else {
                                if (datalist[i]['lastMessage']['type']) {
                                    list.push('<p>' + datalist[i]['lastMessage']['content'] + '</p>');
                                } else {
                                    list.push('<p>暂无消息</p>');
                                }
                            }
                            list.push('</div>');
                            list.push('<div class="msgTime">' + (datalist[i]['lastMessage']['time'] ? getDateDiff(datalist[i]['lastMessage']['time']) : '') + '</div>');
                            list.push('</a>');
                            list.push('<div class="delBox">');
                            list.push('<s class="del_btn"></s>');
                            list.push('</div> </div> </li>');
                            html.push(list.join(''))


                        }
                        $('.msgBox:not(.sysMsg),.noData').remove()
                        $('.msglist').append(html.join(''));
                    }
                    $('.msglist .loading').remove();

                } else {
                    $('.msglist .loading').remove()
                    if ($(".msglist li").length == 0) {
                        $(".msglist").append('<li class="noData"><img src="' + templets_skin + '/images/noMsg.png"><p>在这里你可以收发消息哦~</p></li>')
                    }
                }
            },
            error: function () {
                $('.loading').html('<span>' + langData['siteConfig'][37][80] + '</span>');  //请求出错请刷新重试
            }
        });
    }

    $(document).on('visibilitychange', function (e) {
        clearInterval(appNumInterVal)
        clearInterval(frendListInterval)
        if (e.target.visibilityState === "visible") {
            // 页面显示
            getAppnum()
            msg_list()
            appNumInterVal = setInterval(getAppnum, 5000);
            frendListInterval = setInterval(msg_list, 5000);
            pageShowCheck(5)
        } else if (e.target.visibilityState === "hidden") {
            // 页面隐藏
            clearInterval(appNumInterVal)
            clearInterval(frendListInterval)
        }
    });

    pageShowCheck(5)
    function pageShowCheck(timeOut){ // timeOut => 单位是分钟 一段时间过后 修改定时器  interval请求时间间隔 单位是秒
        let next_timeOut = timeOut;
        switch(timeOut){
            case 5: 
                next_timeOut = 10,
                interval = 10;
                break;
            case 10: 
                next_timeOut = 20,
                interval = 20;
                break;
            case 20: 
                next_timeOut = 30,
                interval = 30;
                break;
            case 30: 
                next_timeOut = 60,
                interval = 60;
                break;
            case 60: 
                next_timeOut = 0,
                interval = 0;
                break;
        }
        setTimeout(() => {
            clearInterval(appNumInterVal)
            clearInterval(frendListInterval)
            if(timeOut && interval){
                appNumInterVal = setInterval(getAppnum, interval * 1000);
                frendListInterval = setInterval(msg_list,interval * 1000)
            }
            if(next_timeOut){
                pageShowCheck(next_timeOut)
            }
        },timeOut * 60 * 1000);
    }

    //调起原生应用
    $('.listBox').delegate('.msgBox', 'click', function (t) {
        var to = $(this).attr('data-uid');
        if (device.indexOf('huoniao') > -1 && t.target != $(this).find('.del_btn')[0] && to) {
            var param = {
                from: userinfo['uid'],
                to: to,
            };
            setupWebViewJavascriptBridge(function (bridge) {
                bridge.callHandler('invokePrivateChat', param, function (responseData) {
                    console.log(responseData)
                });
            });
            return false;
        }
    })

    $(window).scroll(function () {
        var sct = $(window).scrollTop();
        // console.log(sct,$(".msglist").offset().top)
        if ((sct + 100) > $(".msglist").offset().top) {
            $(".topFixed,body").addClass('bg_white')
        } else {
            $(".topFixed,body").removeClass('bg_white')
        }
    })

    function nofind() {
        var img = event.srcElement;
        img.src = staticPath + "images/noPhoto_60.jpg";
        img.onerror = null;
    }
    // //获取通知列表
    // var notice_load = 0,notice_page = 1;
    // function notice_list(){
    // 	notice_load=1
    // 	$.ajax({
    //        url: '/include/ajax.php?service=member&action=message&page='+notice_page+'&pageSize=10',
    //        type: "GET",
    //        dataType: "json",
    //        success: function (data) {
    //
    // 	       var html = [];
    // 	       if(data.state == 100){
    // 	       	  var datalist = data.info.list;
    // 		       var totalpage = data.info.pageInfo.totalPage;
    //
    // 		       $('.tip_list').attr('data-total',totalpage);
    // 	          if(datalist.length==0){
    // 	          	$('.tip_list .loading').html('<div class="im-no_list"><img src="'+templets_skin+'images/no_notice.png"/><p>'+langData['siteConfig'][47][18]+'~</p></div>');//暂无未读通知
    // 	          }else{
    // 	          	var unread = '';
    // 	            for(var i=0; i<datalist.length; i++){
    // 	            	if(datalist[i].state=="0"){
    // 	            		unread='unread'
    // 	            	}else{
    // 	            		unread=''
    // 	            	}
    // 	            	var info = datalist[i].body;
    // 	            		var list =[];
    // 	            		list.push('<dl data-id="'+datalist[i].id+'"><dt >'+datalist[i].date+'</dt>');
    // 	            		list.push('<dd class="tip_con" data-url="'+datalist[i].url+'">');
    //
    // 						if(info && datalist[i].body.first){
    // 							list.push('<h2 class="'+unread+'">'+datalist[i].title+'</h2>');
    // 							list.push('<ul class="tip_detail">');
    // 							for(var m=0; m<Object.keys(info).length; m++){
    // 								if(Object.keys(info)[m]!='first' && Object.keys(info)[m]!='remark'){
    // 									list.push('<li class="fn-clear"><label>'+Object.keys(info)[m]+'</label><span>'+info[Object.keys(info)[m]].value+'</span></li>');
    // 								}
    // 							}
    // //							list.push('<li class="fn-clear"><label>'+Object.keys(info)[1]+'</label><span>'+info[Object.keys(info)[1]].value+'</span></li>');
    // //							list.push('<li class="fn-clear yue_sub" ><label>'+Object.keys(info)[3]+'</label><span>'+info[Object.keys(info)[3]].value+'</span></li>');
    // //							list.push('<li class="fn-clear"><label>'+Object.keys(info)[2]+'</label><span>'+info[Object.keys(info)[2]].value+'</span></li>');
    // 							list.push('</ul>');
    // 						}else{
    // 							list.push('<h2 class="'+unread+'">'+datalist[i].title+'</h2>');
    // 							list.push('<ul class="tip_detail"><li>'+datalist[i].body+'</li></ul>');
    // 						}
    //
    // 						list.push('<button class="del_btn">'+langData['siteConfig'][6][8]+'</button></dd></dl>')//删除
    // 						html.push(list.join(''));
    //
    //
    // 	            }
    // 	           $('.tip_list .scrollbox').append(html.join(''))
    // 	          }
    // 			  $('.tip_list.ulbox .loading').remove();
    // 	          notice_load =0;
    // 	          if(totalpage == notice_page){
    // 	          	$('.tip_list .scrollbox').append('<div class="loading"><span>'+langData['siteConfig'][47][6]+'</span></div>');//已经全部加载
    // 	          	console.log('已经全部加载');
    // 	          	notice_load=1;
    //
    // 	          }
    // 	          notice_page++;
    // 	          $('.list_box .tip_list ').attr('data-page',notice_page);
    // 	       }else{
    // 	       		$('.tip_list  .loading').html('<div class="im-no_list"><img src="'+templets_skin+'images/no_notice.png"/><p>'+langData['siteConfig'][47][18]+'~</p></div>');//暂无未读通知
    // 	       }
    //        },
    //        error: function(){
    //          $('.loading').html('<span>'+langData['siteConfig'][37][80]+'</span>');  //请求出错请刷新重试
    //        }
    //     });
    //
    // }
    //







    $('.tab_box li').click(function () {
        var i = $(this).index(), type = $(this).attr('data-type'), total = $('.ulbox').eq(i).attr("data-total"), page = $('.ulbox').eq(i).attr("data-page");
        $(this).addClass('on').siblings('li').removeClass('on');
        $('.ulbox').eq(i).addClass('show').siblings('.ulbox').removeClass('show');

        if ($('.message_list .info_li').length == 0 && !cfg_ios_shelf) {
            msg_list();
        }
        // else if(type=="notice"&&$('.tip_list dl').length==0){
        // 	notice_list();
        // }

        if (total <= page) {
            info_load = 1;
            return false;
        } else {
            setTimeout(function () {
                info_load = 0;
            }, 500);
            return false;

        }
    });

    //通知删除
    $('body').delegate('.del_btn', 'click', function (e) {
        var t = $(this), par = t.closest("li"), del_id = par.attr("data-uid");
        
        var delPopOptions = {
            title: '确认删除消息？',
            isShow: true,
        }
        e.preventDefault()
        e.stopPropagation();
        confirmPop(delPopOptions, function () {
            $.ajax({
                url: '/include/ajax.php?service=siteConfig&action=delFriend&tid=' + del_id + '&type=temp',
                type: 'post',
                dataType: 'json',
                success: function (data) {
                    if (data.state == 100) {
                        var detail = data.info;
                        par.remove();
                        showMsg(langData['siteConfig'][47][20])//已删除对话
                    } else {
                        showMsg(data.info);
                    }
                },
                error: function () {
                    showMsg(langData['siteConfig'][46][63]);//网络错误，初始化失败！
                }
            });
        });


    });

    //跳转url
    $('.scrollbox').delegate('dd', 'click', function (t) {
        console.log(t.target != $(this).find('button.del_btn')[0])
        if (t.target != $(this).find('button.del_btn')[0]) {
            var url = $(this).attr('data-url');
            window.location.href = url;
        }

    })

    //左滑删除
    var lines = $(".message_list .info_li");//左滑对象
    var len = lines.length;
    var lastXForMobile;//上一点位置
    var pressedObj;  // 当前左滑的对象
    var lastLeftObj; // 上一个左滑的对象
    var start;//起点位置
    //         for (var i = 0; i < len; i++) {
    //             $(".message_list ").delegate('.info_li','touchstart', function (e) {
    //             	// $(this).find('.del_btn').show() //显示删除按钮
    //             	// $(this).siblings().find('.del_btn').hide();  //隐藏删除按钮
    // //          	console.log(e)
    // //                e.preventDefault();//加上这句的话删除按钮就无法点击了
    // 				// $('.del_btn').hide();  //隐藏删除按钮
    //                 lastXForMobile = e.changedTouches[0].pageX;
    //                 pressedObj = this; // 记录被按下的对象
    //                 // 记录开始按下时的点
    //                 var touches = event.touches[0];
    //                 start = {
    //                     x: touches.pageX, // 横坐标
    //                     y: touches.pageY  // 纵坐标
    //                 };
    //             });
    //            $(".message_list ").delegate('.info_li','touchmove', function (e) {
    //                 // 计算划动过程中x和y的变化量
    //                 var touches = event.touches[0];
    //                 delta = {
    //                     x: touches.pageX - start.x,
    //                     y: touches.pageY - start.y
    //                 };
    //                 // 横向位移大于纵向位移，阻止纵向滚动
    //                 if (Math.abs(delta.x) > Math.abs(delta.y)) {
    // 					$(this).find('.del_btn').show() //显示删除按钮
    // 					$(this).siblings().find('.del_btn').hide();  //隐藏删除按钮
    //                     event.preventDefault();
    //                 }
    //                 if (lastLeftObj && pressedObj != lastLeftObj) { // 点击除当前左滑对象之外的任意其他位置
    //                     $(lastLeftObj).animate({'transform': 'translateX(0px)'},100); // 右滑
    //                     lastLeftObj = null; // 清空上一个左滑的对象
    //                 }
    //                 var diffX = e.changedTouches[0].pageX - lastXForMobile;
    //                 $('.message_list .info_li .del_btn').text(langData['siteConfig'][47][17]).removeClass('sure_btn');//删除对话
    //                 if (diffX < -50) {
    //                     $(pressedObj).animate({'transform': 'translateX(-1.8rem) '},100).siblings('li').animate({'transform': 'translateX(0px)'}); // 左滑
    //                     lastLeftObj = pressedObj; // 记录上一个左滑的对象
    //                 } else if (diffX > 50) {
    //                     if (pressedObj == lastLeftObj) {
    //                         $(pressedObj).animate({'transform': 'translateX(0px)'},100);// 右滑
    //                         lastLeftObj = null; // 清空上一个左滑的对象
    //                     }
    //                 }
    //             });
    //
    //             $(".message_list ").delegate('.info_li','touchend', function (e) {
    //
    //             });
    //
    //     }




    // $(window).scroll(function(){
    // 	var allh = $('body').height();
    //       var w = $(window).height();
    //       var scroll = allh - w;
    //       type = $('.tab_box li.on').attr('data-type');
    //       if ($(window).scrollTop() >= scroll && !notice_load) {
    //       	notice_list();
    //       }
    // })


    // 点击清空按钮
    $(".clearOut").click(function () {
        $(".mask_clear").show();
        $(".bottom_clear").animate({ "bottom": 0 }, 100)
    })
    $(".mask_clear,.clear_cancel").click(function () {
        $(".mask_clear").hide();
        $(".bottom_clear").animate({ "bottom": '-3.5rem' }, 100)
    });
    // 确认清空
    $(".clear_sure").click(function () {
        clearNotice();
        $(".mask_clear").click();
    });


    // 全部清除消息
    function clearNotice() {

        isCleaning = true;

        //先删除页面元素角标
        $('.count, .mNum').html('');
        $('.message_show em').remove();

        showMsg('操作成功');

        $.ajax({
            url: "/include/ajax.php?service=member&action=readAllMessage",
            type: "GET",
            dataType: "json",
            success: function (data) {
                isCleaning = false;
                if (data && data.state == 100) {
                    $('.tip_list .scrollbox').html('');
                    // msg_list();
                    $('.mNum').html('');
                } else {
                    showMsg(data.info)
                }
            },
            error: function () {
                isCleaning = false;
                showMsg(data.info)
            }
        });
    }


    // 左滑删除
    $(".msglist").on('touchstart', 'li:not(.sysMsg) .msgLi', function (e) {

        lastXForMobile = e.changedTouches[0].pageX;
        pressedObj = this; // 记录被按下的对象
        // 记录开始按下时的点
        var touches = event.touches[0];
        start = {
            x: touches.pageX, // 横坐标
            y: touches.pageY  // 纵坐标
        };
    })

    $(".msglist").on('touchmove', 'li:not(.sysMsg) .msgLi', function (e) {
        var li = $(this).closest('li.msgBox');
        // 计算划动过程中x和y的变化量
        var touches = event.touches[0];
        delta = {
            x: touches.pageX - start.x,
            y: touches.pageY - start.y
        };
        // 横向位移大于纵向位移，阻止纵向滚动
        if (Math.abs(delta.x) > Math.abs(delta.y) * 2 && Math.abs(delta.y) < li.height()) {
            $(this).find('.del_btn').show() //显示删除按钮
            // $(this).siblings().find('.del_btn').hide();  //隐藏删除按钮


            li.addClass('touchOn');
            e.preventDefault();
        }
        if (lastLeftObj && pressedObj != lastLeftObj) { // 点击除当前左滑对象之外的任意其他位置
            li.siblings('li').removeClass('touchOn');
            $(lastLeftObj).animate({ 'transform': 'translateX(0px)' }, 100); // 右滑
            lastLeftObj = null; // 清空上一个左滑的对象

        }
        // var li = $(this).closest('li.msgBox');
        // $('.msglist li.msgBox').removeClass('touchOn');
        // 	li.addClass('touchOn');
        var diffX = e.changedTouches[0].pageX - lastXForMobile;
        $('.message_list .info_li .del_btn').text(langData['siteConfig'][47][17]).removeClass('sure_btn');//删除对话
        if (diffX < -50) {
            $(pressedObj).animate({ 'transform': 'translateX(-1.58rem) ' }, 100).siblings('li').animate({ 'transform': 'translateX(0px)' }); // 左滑
            lastLeftObj = pressedObj; // 记录上一个左滑的对象
        } else if (diffX > 50) {
            if (pressedObj == lastLeftObj) {
                $(pressedObj).animate({ 'transform': 'translateX(0px)' }, 100);// 右滑
                lastLeftObj = null; // 清空上一个左滑的对象
            }
        }
    })

    // var clearPopOptions = {
    //       	title:'确认清空全部未读消息？',
    //       	btnTrggle:'.clear_all'
    //     }
    // 	confirmPop(clearPopOptions,function(){
    // 		clearNotice();
    // 	});


    $('.clear_all').click(function () {
        if (msgUnread == 0) {
            showMsg('暂无未读消息');
        } else {
            clearNotice();
            msgUnread = 0;
        }
    })

});


