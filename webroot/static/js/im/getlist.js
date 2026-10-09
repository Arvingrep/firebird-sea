var countInterview = null;

//时间格式化方法
Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
//获取当前时间

var getCurrentDate = function(format) {
	  var now = new Date();
	  var year = now.getFullYear(); //得到年份
	  var month = now.getMonth();//得到月份
	  var date = now.getDate();//得到日期
	  var day = now.getDay();//得到周几
	  var hour = now.getHours();//得到小时
	  var minu = now.getMinutes();//得到分钟
	  var sec = now.getSeconds();//得到秒
	  month = month + 1;
	  if (month < 10) month = "0" + month;
	  if (date < 10) date = "0" + date;
	  if (hour < 10) hour = "0" + hour;
	  if (minu < 10) minu = "0" + minu;
	  if (sec < 10) sec = "0" + sec;
	  var time = "";
	  //精确到天
	  if(format==1){
		time = year + "-" + month + "-" + date;
	  }
	  //精确到分
	  else if(format==2){
		time = year + "-" + month + "-" + date+ " " + hour + ":" + minu + ":" + sec;
	  }
	  //只获取时和分
	  else if(format==3){
	  	time = hour + ":" + minu
	  }
	  return time;
	}

//获取好友列表
var getflist = function (){
	$.ajax({
        url: '/include/ajax.php?service=siteConfig&action=getImFriendList&userid='+ userinfo['uid'],
        type: "GET",
        dataType: "json", //指定服务器返回的数据类型
        crossDomain:true,
        success: function (data) {
         if(data && data.state == 100){
         	 datalist = data.info;
         	 var html = [];
         	if(datalist.length==0){
         		$('.im-f_list.im-chat_list').html('<div class="im-no_list" style="display: none;"><img src="'+staticPath+'images/im/no_img.png" /><p>'+langData['siteConfig'][47][58]+'~</p></div>');//
         	}else{
         		for(var i=0; i< datalist.length; i++ ){
         			var val = datalist[i];
         			var online = '';
         			if(val['online']){
         				 online = '<i>'+langData['siteConfig'][29][139]+'</i>';//在线
         			}
					var list = [];
					list.push('<li class="fn-clear friend'+datalist[i].userinfo.uid+'" data-id="'+datalist[i].userinfo.uid+'" data-token = '+datalist[i].token+' data-f= "1">');
						list.push('<div class="im-headimg"><img onerror="nofind();"  src="'+(datalist[i].userinfo.photo?datalist[i].userinfo.photo:staticPath+"images/noPhoto_60.jpg")+'"></div>');
							list.push('<div class="im-_right">');
								list.push('<h2 class="im-f_name" title="'+datalist[i].userinfo.name+'"><span>'+datalist[i].userinfo.name+'</span>'+online+'</h2>');
								if(val.lastMessage.type=="link"){
									list.push('<div class="im-f_msg"><span>['+langData['siteConfig'][47][12]+']</span></div>');//链接消息
								}else if(typeof datalist[i].lastMessage.content == 'string'){
									list.push('<div class="im-f_msg"><span>'+datalist[i].lastMessage.content.replace(/△(.+?)△/g,'<img src="$1"/>')+'</span></div>');
								}
							list.push('</div>');
							list.push('<div class="im-op_box">');
								list.push('<ul><li class="im-chat_to">'+langData['siteConfig'][47][59]+'</li>');//和他聊天
									list.push('<li class="im-look_info">'+langData['siteConfig'][19][21]+'</li>');//基本资料
									list.push('<li class="im-del_f">'+langData['siteConfig'][46][20]+'</li>');//删除好友
						list.push('</ul></div></li>');
         			html.push(list.join(''));
         		}
         		$('.im-f_list.im-chat_list').html(html);

         	}

         }else{
         	$('.im-f_list.im-chat_list').html('<div class="im-no_list" ><img src="'+staticPath+'images/im/no_img.png" /><p>'+langData['siteConfig'][47][58]+'~</p></div>');//暂未添加任何好友
         }

        },
        error:function(err){
        	console.log('network error');
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
            return langData['siteConfig'][13][34] + H + ':' + m;//昨天
        }else if(date > today){
            return H + ':' + m;
        }else{
            return Y + '-' + M + '-' + D + '&nbsp;' + H + ':' + m;
        }
    }
//时间转换
	var transTimes=function(timestamp, n){

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
pageShowCheck(5)
function pageShowCheck(timeOut){ // timeOut => 一段时间过后 修改定时器  interval请求时间间隔
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
		let hasload = countInterview ? true : false;
		clearInterval(refreshTimeout)
		clearInterval(countInterview)
		if(timeOut && interval){
			refreshTimeout = setInterval(function(){
				checkGetList()
			},interval * 1000)
			if(hasload){
				countInterview = setInterval(getnum,interval * 1000)
			}
		}
		if(next_timeOut){
			pageShowCheck(next_timeOut)
		}
	},timeOut * 60 * 1000);
}
//获取最新会话列表
var getcurlist = function (){
	$.ajax({
        url: '/include/ajax.php?service=siteConfig&action=getImFriendList&userid='+userinfo['uid']+'&type=temp',
        type: "GET",
        dataType: "json", //指定服务器返回的数据类型
        crossDomain:true,
        success: function (data) {
         if(data && data.state == 100){
         	var datalist = data.info;
         	var html = [];
         	if(datalist.length==0){
         		$('.im-cur_chat.im-chat_list').html('<div class="im-no_list" style="display: none;"><img src="'+staticPath+'images/im/no_img.png" /><p>'+langData['siteConfig'][47][60]+'~</p></div>');//没有最近聊天记录
         	}else{
         		var news_num = 0;
         		for(var i=0; i< datalist.length; i++ ){
					var list = [],unread = '';
					var val = datalist[i];
					if(val['lastMessage']['unread']!=undefined){
						news_num =news_num + val['lastMessage']['unread']*1;
					}
		         	if(val['lastMessage'] && val['lastMessage'] != false && val['lastMessage']['unread'] > 0 && (!toUserinfo || (toUserinfo && val['userinfo']['uid'] != toUserinfo['uid']))){
		                unread = '<i>'+val['lastMessage']['unread']+'</i>';

		            }
		            var curr = '';
		            if(toUserinfo && val['userinfo']['uid'] == toUserinfo['uid']){
		               curr = 'im-pannel_curr';
		            }
		            if(datalist[i].userinfo.uid != '0'){
		            	list.push('<li class="fn-clear '+curr+' friend'+datalist[i].userinfo.uid+'" data-token = '+datalist[i].token+' data-id="'+datalist[i].userinfo.uid+'" data-type = "'+val['lastMessage']['type']+'" data-read="'+val['lastMessage']['unread']+'">' );
						list.push('<div class="im-headimg"><img onerror="nofind();"  src="'+(datalist[i].userinfo.photo?datalist[i].userinfo.photo:staticPath+"images/noPhoto_60.jpg")+'"></div>')
						list.push('<div class="im-_right">');
						list.push('<h2 class="im-f_name" title="'+datalist[i].userinfo.name+'"><span>'+datalist[i].userinfo.name+'</span><i>'+(val['lastMessage'] && val['lastMessage'] != false ? transTimes(val['lastMessage']['time'], 4):'') + '</i></h2>');
						if(val.lastMessage.type=="link"){
							list.push('<div class="im-f_msg"><span>['+langData['siteConfig'][47][12]+']</span>'+unread+'</div>');//链接消息
						}else{							
							list.push('<div class="im-f_msg"><span>'+(val['lastMessage'] && val['lastMessage'] != false && typeof val['lastMessage']['content'] == 'string' ? (val['lastMessage']['content'].replace(/△(.+?)△/g,'<img src="$1"/>')) : '')+'</span>'+unread+'</div>');
						}

						list.push('</div>')
						list.push('<div class="im-delbox"><a href="javascript:;" title="'+langData['siteConfig'][47][45]+'"></a></div>')//删除会话
						list.push('</li>')
	         			html.push(list.join(''));
		            }


         		}

//       		getnum();
         		$('.im-cur_chat.im-chat_list').html(html)
         	}
         }else{
         	$('.im-cur_chat.im-chat_list').html('<div class="im-no_list" ><img src="'+staticPath+'images/im/no_img.png" /><p>'+langData['siteConfig'][47][61]+'~</p></div>');//暂无进行中的会话哦
         }
        },
        error:function(err){
        	console.log('fail');
        }
     });
}

var checkGetList = function(){
	if($('.im-on').hasClass('im-cur_btn')){
		getcurlist();//获取最新聊天
	}else if($('.im-on').hasClass('im-F_btn')){
		getflist();//获取好友列表
	}else if($('.im-on').hasClass('im-tip_btn')){
		gettiplist();//获取账户消息
	}
}
function nofind(){
	// console.log(langData['siteConfig'][47][62])//图片异常
	var img = event.srcElement;
	img.src = staticPath+"images/noPhoto_60.jpg";
	img.onerror = null;
}
function nofind_c(){
	console.log(langData['siteConfig'][47][62])//图片异常
	var img = event.srcElement;
	img.src = staticPath+"images/404.jpg";
	img.onerror = null;
}
//获取最新消息的列表
var totalpage = 0,req_page=1,isload=0;
var gettiplist = function (){
//	$('.im-msg_list').append('<p class="im-msg_loading"><i></i>加载中</p>');
	$.ajax({
        url: "/include/ajax.php?service=member&action=message&state=0&page=1&pageSize=100",
        type: "GET",
        dataType: "json", //指定服务器返回的数据类型
        crossDomain:true,
        success: function (data) {
         if(data.state == 100){

         	var datalist = data.info.list,
         	pageinfo = data.info.pageInfo,
         	totalpage = data.info.pageInfo.totalPage;
         	var html = [];

         	if(datalist.length==0 ){
         		$('.im-tip_btn .im-tip_num').hide();
         		$('.im-msg_list').html('<div class="im-no_list"><img src="'+staticPath+'images/im/no_notice.png" /><p>'+langData['siteConfig'][47][18]+'~</p><a class="im-notice_all" href="'+masterDomain+'/u/message.html">'+langData['siteConfig'][46][51]+'</a></div>');//暂无未读通知--查看历史
         	}else{
         		$('.im-tip_btn .im-tip_num').show();
         		for(var i=0; i< datalist.length; i++ ){
					var list  = [];
					var info = datalist[i].body
					//有新消息的类名
					var newtip = datalist[i].state==0?'im-new':'';

					if(info.first){
						list.push('<li class="fn-clear" data-url="'+datalist[i].url+'" data-id="'+datalist[i].id+'"><a href="javascript:;"><dl>');
						list.push('<dt class="'+newtip+'">'+info.first.value+'</dt>');
	         			for(var m = 0; m < Object.keys(info).length; m++){
	         				if(Object.keys(info)[m] != 'first' && Object.keys(info)[m]!='remark'){
	         					list.push('<dd class="fn-clear"><label>'+Object.keys(info)[m]+'</label><span>'+info[Object.keys(info)[m]].value+'</span></dd>');
	         				}
	         			}
					}else{
						list.push('<li class="fn-clear" data-url="'+datalist[i].url+'" data-id="'+datalist[i].id+'"><dl>');
						list.push('<dt class="'+newtip+'"><span>'+datalist[i].title+'</span></dt>');
						list.push('<dd>'+info+'</dd>');
						list.push('<dd><label>'+langData['siteConfig'][47][63]+'</label><span>'+datalist[i].date+'</span></dd>');//变动时间

					}
         			list.push('<dd class="im-delbox"><i></i></dd>');
         			list.push('</dl></li>');

//       			list.push('<li class="fn-clear"><a href="'+datalist[i].url+'"><dl>');
//					list.push('<dt class="'+newtip+'">您的账户有新的消息</dt>');
//       			list.push('<dd><label>消息内容</label><span>'+datalist[i].title+'</span></dd>');
//       			list.push('<dd class="im-acc_jian"><label>余额变化</label><span>-38.99</span></dd>');
//       			list.push('<dd><label>变动时间</label><span>'+datalist[i].date+'</span></dd>');
//       			list.push('<dd class="im-delbox"><i></i></dd>');
//       			list.push('</dl></a></li>');
         			html.push(list.join(''))
         		}
         		$('.im-msg_list').html(html);

         		$('.im-panel_list .im-tip_btn .im-tip_num').text(pageinfo.unread);
         		if(pageinfo.unread==0){
         			$('.im-panel_list .im-tip_btn .im-tip_num').hide();
         		}else{
         			$('.im-panel_list .im-tip_btn .im-tip_num').show();
         		}
         		$('.im-msg_loading').remove();
         	}
//       	if(req_page == totalpage){
////              console.log('true')
//              isload = 1;
////              $('.im-msg_list').append('<p class="im-msg_loading">已经全部加载</p>');
//           }
//       	req_page++;
         }else{
         	$('.im-tip_btn .im-tip_num').hide();
         	$('.im-msg_list').html('<div class="im-no_list"><img src="'+staticPath+'images/im/no_notice.png" /><p>'+langData['siteConfig'][47][18]+'~</p><a class="im-notice_all" href="'+masterDomain+'/u/message.html">'+langData['siteConfig'][46][51]+'</a></div>');//暂无未读通知--查看历史
         }
        },
        error:function(err){
        	console.log('fail');
        }
     });
}

//获取聊天记录
var rec_page=1,recload=0,fin=1,totalPage=0;
var getrecord = function(type){
	console.log(rec_page)
	$('.im-more').remove();
	if((recload || rec_page > totalPage) && rec_page!=1) return false;
        recload = 1;
	$.ajax({
         url: '/include/ajax.php?service=siteConfig&action=getImChatLog',
         data: {from: chatToken, to: toChatToken, page: rec_page, pageSize: 20, time: time},
        type: "post",
        dataType: "json", //指定服务器返回的数据类型
        crossDomain:true,
        success: function (data) {
		if(data && data.state == 100){
            data = data.info;
            var pageInfo = data.pageInfo;
            var list = data.list;
            if(rec_page == 1){
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
            $('.im-record_box').prepend('<a href="javascript:;" class="im-more"><span><i></i>'+langData['siteConfig'][47][64]+'</span></a>');//查看更多记录
            setTimeout(function(){
                recload = false;
            }, 1000);

            //最后一页显示时间
           if(rec_page > 1 && rec_page == pageInfo.totalPage){
           		$('.im-more').remove();
                var time = parseInt($('.im-record_box').find('.im-chat_item:eq(0)').attr('data-time'));
                 $('.im-record_box').prepend('<p class="im-msg_time" data-time="'+time+'">'+getDateDiff(time)+'</p>');
           }
                   if(rec_page>=pageInfo.totalPage){
                   	$('.im-more').remove();
                   }

                   rec_page++;
					fin =1;
               }else{
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
    var createEle = function(data, type, newMessage, lib){
        var from = data.from;
        var to = data.to;
        var sf = false;
        //更新好友列表最新消息
        if(newMessage){
            $('.im-cur_chat .friend' + from).find('.im-f_name i').html(transTimes(data.time, 4) );
            if(data.contentType == "text"){
            	$('.im-cur_chat .friend' + from).find('.im-f_msg span').html( data.content.replace(/\\/g,""))
            }else if(data.contentType == "image"){
            	$('.im-cur_chat .friend' + from).find('.im-f_msg span').html(langData['siteConfig'][47][65]);//[图片]
            }else if(data.contentType == "apply"){
            	$('.im-cur_chat .friend' + from).find('.im-f_msg span').html(langData['siteConfig'][47][57])//[验证消息]
            }else if(data.contentType == "link"){
            	$('.im-cur_chat .friend' + from).find('.im-f_msg span').html(langData['siteConfig'][47][66])//[链接消息]
            }
            if(!$('.im-cur_chat .friend' + from).hasClass('im-pannel_curr')){
                if($('.im-cur_chat .friend' + from).find('.im-f_msg i').size() == 0){
                    $('.im-cur_chat .friend' + from).find('.im-f_msg').append('<i></i>');
                }
                $('.im-cur_chat .friend' + from).find('.im-f_msg i').html(data.unread);
//              newTip(data.unread);
				getnum();

            }

        }
        //更新对话窗体内容，如果没有选择会员，不执行
        if(!toUserinfo || (newMessage && toUserinfo['uid'] != from)) return;
		var gest = typemsg = imghead = style = attrbuite = lng = lat ='';
        //拼接对话
        if (from == userinfo['uid']) {
        	gest ='im-to_other';
        	imghead = '<div class="im-m_head"><img onerror="nofind();"  src="'+(userinfo['photo']?userinfo['photo']:staticPath+"images/noPhoto_60.jpg")+'"></div>';
            var fromUser = "<span style='color: red;'>"+langData['siteConfig'][47][67]+"</span>";//你
            sf = true;
        } else {
            var fromUser = toUserinfo['name'];
        }

        if (to == userinfo['uid']) {
        	gest ='im-from_other';
        	imghead = '<div class="im-m_head im-to_fdetail"><img onerror="nofind();"   src="'+(toUserinfo['photo']?toUserinfo['photo']:staticPath+"images/noPhoto_60.jpg")+'"></div>';
            var toUser = "<span style='color: red;'>"+langData['siteConfig'][47][67]+"</span>";//你
        } else {
            var toUser = toUserinfo['name'];
        }



        // 文本
        if(data.contentType == "text"){
        	var pattern =/△(.+?)△/g;
        	var mytext;
        	mytext = data.content.replace(/△(.+?)△/g,'<img src="$1"/>');
            text = '<div class="im-text_msg">'+mytext+'</div>';
            typemsg= '';
            style="";
            attrbuite=""
        }

        // 图片
        if(data.contentType == 'image'){
            content = data.content;
            text = '<img src="'+content.turl+'" />';
            typemsg= 'im-img_content';
            attrbuite = data.content.width+'X'+data.content.height;
            if(data.content.width>180 && (data.content.height<=data.content.width)){
            	var h =  data.content.height*180/data.content.width
            	style ='height:'+h+'px';

            }else if(data.content.height>180){
            	style ='height:180px';
            }

        }

         //语音消息
        if(data.contentType == 'audio'){
        	console.log(data)
        	 typemsg= 'im-s_content';
        	 text = '<div class="im-speak_msg" data-id="'+data.content.voiceId+'" style="width:'+(50+5*data.content.audioTime)+'px; max-width:328px;"><em>'+data.content.audioTime+'"</em><audio class="chat_audio" src="'+data.content.audioUrl+'" ></audio></div>'
        }

        //视频
        if(data.contentType == 'video'){
        	 content = data.content;
        	 text = '<div class="im-video_msg"><video src="'+content.turl+'"></video></div>';
        	 typemsg= 'im-img_content';
            attrbuite = data.content.width+'X'+data.content.height;

            if(data.content.width>100 && ((data.content.height-data.content.width)<=0)){
            	var h =  data.content.height*100/data.content.width
            	style ='height:'+h+'px';
            }else if(data.content.height>100&&((data.content.height-data.content.width)>0)){
            	style ='height:100px';

            }
        }

        //地图分享
        if(data.contentType == 'mapshare'){
			typemsg = 'im-post_content';
        	lng =  data.content.lng;
        	lat = data.content.lat;
        	text = '<a class="IMappMapBtn" target="_blank" href="javascript:;"><div class="im-post_text"><h2>'+data.content.name+'</h2><p>'+data.content.address+'</p></div><div class="im-area_show"><img src="'+data.content.mapimg+'" /></div></a>'
        }

         //好友推荐
        if(data.contentType == 'recfriend'){
        	typemsg = 'im-recf_content';
        	text = '<a data-id="'+data.content.f_id+'" href="add_friend-'+data.content.f_id+'.html"><dl><dt>'+langData['siteConfig'][46][32]+'</dt><dd class="fn-clear"><div class="im-recf_head"><img onerror="nofind();"  src="'+(data.content.f_photo?data.content.f_photo:staticPath+"images/noPhoto_60.jpg")+'"/><i class="level"></i></div><div class="im-recf_info"><h2>'+data.content.f_name+'</h2><p>ID：'+data.content.f_id+'</p></div></dd></dl></a>';//推荐好友
        }
        //好友申请
        if(data.contentType == "apply"){
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
            text = '<div class="im-text_msg '+timemsg+'"><span class="im-test_msg">'+langData['siteConfig'][46][3]+' -</span>'+data.content+'</div>';//好友验证

            if(min<=2&&hour==0&&day==0 && (data.from == toUserinfo['uid']) &&data.content!=langData['siteConfig'][46][68]){//你们已成功添加为好友

        		$('.im-btn_group .im-to_f').html(langData['siteConfig'][47][26]+'<a href="javascript:;" class="im-btn_agree">'+langData['siteConfig'][6][2]+'</a><a class="im-btn_refuse" href="javascript:;">'+langData['siteConfig'][47][25]+'</a>');//对方请求加为好友--同意--忽略
        	}
            typemsg= '';
            style="";
            attrbuite="";
        }
        var item;

        if(data.contentType=="link"){
        	var content = data.content;
        	var im_class = '', ctn_text ='',title = content.title;
        	if(content.mod == 'job'){
        		im_class = 'im-pro_description';
        		ctn_text =  '<p class="'+ im_class +'">'+content.description+'</p><p class="'+ im_class +'">'+langData['siteConfig'][19][633]+'：'+ content.salary +'</p>'//薪资范围
        		title = langData['siteConfig'][46][69]+content.title;//[招聘]
        	}else{
        		im_class = 'im-pro_price';
        		title = content.title;
                if(content.mod != 'info'){
        		    ctn_text = '<p class="'+im_class+'">'+ (content.price!=""?(content.price):langData['siteConfig'][46][70]) +'</p>';//面议
                }
//      		if(content.mod == 'house'){
//      			if(content.housetype=="sale"){
//      				title = '[二手房]'+content.title;
//      				ctn_text = '<p class="'+im_class+'">'+ (content.price>0?("￥"+content.price+" 万"):"面议") +'</p>';
//      			}else if(content.housetype=="cf"){
//      				ctn_text = '<p class="'+im_class+'">'+ (content.price>0?("￥"+content.price+" /月"):"面议") +'</p>';
//      			}else if(content.housetype=="xzl"){
//      				ctn_text = '<p class="'+im_class+'">'+ (content.price>0?(content.price+" 元/m<sup>2</sup>·月"):"面议") +'</p>';
//      			}else if(content.housetype=="zu"){
//      				title = '[出租]'+content.title;
//      				ctn_text = '<p class="'+im_class+'">'+ (content.price>0?(content.price+" 元/月"):"面议") +'</p>';
//      			}else if(content.housetype=="sp" || content.housetype=="cw"){
//      				if(content.sptype=="出售"){
//      					title = '[出售]'+content.title;
//      					ctn_text = '<p class="'+im_class+'">'+ (content.price>0?("￥"+content.price+" 万"):"面议") +'</p>';
//      				}else if(content.sptype=="出租"){
//      					title = '[出租]'+content.title;
//      					ctn_text = '<p class="'+im_class+'">'+ (content.price>0?(content.price+" 元/月"):"面议") +'</p>';
//      				}else{
//      					title = '[转让]'+content.title;
//      					ctn_text = '<p class="'+im_class+'">'+ (content.price>0?(content.price+" 元/月"):"面议") +'</p>';
//      				}
//
//      			}else{
//      				ctn_text = '<p class="'+im_class+'">'+ (content.price!=""?(content.price):"面议") +'</p>';
//      			}
//      		}else{
//      			ctn_text = '<p class="'+im_class+'">'+ (content.price>0?("￥"+content.price):"面议") +'</p>';
//      		}

        	}
	        item = '<div class="im-LinkBox im-chat_item"><a href="'+content.link+'"><div class="im-pro_img"><img onerror="nofind_c();" src="'+ (content.imgUrl?content.imgUrl:"/static/404.jpg") +'" /></div><div class="im-pro_info"><h2>'+title+'</h2>'+ ctn_text +'</div></a></div>'
	    }else{
	    	item = '<div class="'+gest+' im-chat_item fn-clear" data-time="'+data.time+'" data-size="'+attrbuite+'">'+imghead+'<div style="'+style+'" class="im-m_content '+typemsg+'" data-lng="'+lng+'" data-lat="'+lat+'">'+text+'</div></div>';
	    }
        appendLog('mine', item, type, data.time);

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

    };

     //创建历史对话
    var appendLog = function (ele, item, type, time) {
        var log = $('.im-record_box');
        if(log.find('.im-chat_item').size() == 0 ){
            log.append('<div class="im-msg_time" data-time="'+time+'">'+getDateDiff(time)+'</div>');


        }else{

            if(type != 'prepend'){
                var lastTime = parseInt(log.find('.im-chat_item:last').attr('data-time'));
                var timeCalcu = time-lastTime;
            }else{
                var lastTime = parseInt(log.find('.im-msg_time:eq(0)').attr('data-time'));
                var timeCalcu = lastTime-time;
            }

            if(timeCalcu > 300){
                if(type != 'prepend'){
                    log.append('<div class="im-msg_time" data-time="'+time+'">'+getDateDiff(time)+'</div>');
                }else{
                    log.prepend('<div class="im-msg_time" data-time="'+time+'">'+getDateDiff(time)+'</div>');
                }
            }
        }

        if(type != 'prepend'){
            log.append(item);
            log.scrollTop(log[0].scrollHeight - log.innerHeight());
        }else{
            log.prepend(item);
            stop += log.find('.im-chat_item:eq(0)').outerHeight();
            log.scrollTop(stop);
        }
    }


//弹出层消息
var showErrTimer;
var showMsg = function(txt){
	showErrTimer && clearTimeout(showErrTimer);
	$(".im-popMsg").remove();
	$(".im-big_panel").append('<div class="im-popMsg"><p>'+txt+'</p></div>');
	$(".im-popMsg p").css({ "left": "50%"});
	$(".im-popMsg").css({"visibility": "visible"});
	showErrTimer = setTimeout(function(){
	    $(".im-popMsg").fadeOut(300, function(){
	        $(this).remove();
	    });
	}, 1500);
}

 //根据光标位置插入指定内容
var pasteHtmlAtCaret = function(html) {
      var sel, range;
      if (window.getSelection) {
          sel = memerySelection;
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
      } else if (document.selection && document.selection.type != "Control") {
          document.selection.createRange().pasteHTML(html);
      }
  }
	//光标定位到最后
var set_focus = function(el){
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
		}else{
			var range = document.createRange();
			range.selectNodeContents(el);
			range.collapse(false);
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		}
	}

//加载聊天记录
var datelist = []
var getrecord_1 = function(page,datachose){
	if(!datachose){
		datachose='';
	}
	$('.im-rec_loading2').show();
	$.ajax({
        url: '/include/ajax.php?service=siteConfig&action=getImChatLog',
        data: {from: chatToken, to: toChatToken, page: page, pageSize: 20, time: time},
        type: "GET",
        dataType: "json", //指定服务器返回的数据类型
        crossDomain:true,
        success: function (data) {
         if(data.state == 100){
         	var datalist = data.info.list;
         	var total = data.info.pageInfo.totalPage;
         	var page = data.info.pageInfo.page;
         	var html = [];
			//有聊天记录的日期

         	for(var i=0; i< datalist.length; i++ ){
         		var value_time = transTimes(datalist[0].time,2);
				$('#im-date').val(value_time);
				var list  = [];
				var msgt,nickname;
				if(datalist[i].info.fid==userinfo['uid']&&datalist[i].info.tid==toUserinfo['uid']){
					msgt='im-msg_to';
					nickname=userinfo['name']
				}else if(datalist[i].info.fid==toUserinfo['uid']&&datalist[i].info.tid==userinfo['uid']){
					msgt='im-msg_from';
					nickname=toUserinfo['name']
				}
					list.push('<li class="im-msg_content">');
	         			list.push('<div class="im-chat-user '+msgt+'">');
	         				list.push('<span>'+nickname+'</span> <em>'+transTimes(datalist[i].info.time,1)+'</em>')
	         			list.push('</div>');
	         			list.push('<div class="im-chat-text">');
	         			if(datalist[i].type=='text'){
	         				list.push('<div class="im-text-msg">');
	         					list.push(datalist[i].info.content.replace(/△(.+?)△/g,'<img src="$1"/>'))
	         				list.push('</div>');
	         			}else if(datalist[i].type=='image'){
	         				list.push('<img src="'+datalist[i].info.content.turl+'">');
						}else if(datalist[i].type == 'video'){
							list.push('<div class="im-video_msg"><video src="'+datalist[i].info.content.turl+'"></video></div>');
	         			}else if(datalist[i].type=='apply'){
	         				list.push('<span>'+langData['siteConfig'][46][66]+'</span> - '+datalist[i].info.content);//验证消息
	         			}else if(datalist[i].type=='mapshare'){
	         				list.push(langData['siteConfig'][47][68]);//地图分享
	         			}else if(datalist[i].type=='recfriend'){
	         				list.push(langData['siteConfig'][47][69]);//[好友分享]
	         			}else if(datalist[i].type=='link'){
	         				list.push(langData['siteConfig'][47][70]);//[链接分享]
	         			}
	         			list.push('</div>');
	         		list.push('</li>');


         		html.push(list.join(''))
         	}
         	$('.im-msg_record ul').html(html);
         	$('.im-page_mum').val(page);
         	$('.im-to_first').attr('data-total',total);
         	if(page==1){
         		$('.im-next').css('background-image','url('+staticPath+'images/im/right1.png)')
		        $('.im-to_last').css('background-image','url('+staticPath+'images/im/to_right1.png)');
		        $('.im-prev').css('background-image','url('+staticPath+'images/im/left.png)')
		        $('.im-to_first').css('background-image','url('+staticPath+'images/im/to_left.png)');
         	}else if(page==total){
         		$('.im-rec_loading2').hide();
         		$('.im-prev').css('background-image','url('+staticPath+'images/im/left1.png)')
		        $('.im-to_first').css('background-image','url('+staticPath+'images/im/to_left1.png)');
		        $('.im-next').css('background-image','url('+staticPath+'images/im/right.png)')
		        $('.im-to_last').css('background-image','url('+staticPath+'images/im/to_right.png)');
         	}else{
         		$('.im-prev').css('background-image','url('+staticPath+'images/im/left.png)')
		        $('.im-to_first').css('background-image','url('+staticPath+'images/im/to_left.png)');
		        $('.im-next').css('background-image','url('+staticPath+'images/im/right.png)')
		        $('.im-to_last').css('background-image','url('+staticPath+'images/im/to_right.png)');
         	}
         	$('.im-rec_loading2').hide();
         }
        },
        error:function(err){
        	console.log('fail');
        }
     });
}

//加载评论和点赞
var zan_page=1, zan_total=0, zanload=0,fin_zan=1;
var getzan = function(){
	$('.com_loading').show();
	$.ajax({
        url: "/include/ajax.php?service=member&action=upList&u=1&pageSize=10&zan_page="+zan_page,
        type: "GET",
        dataType: "jsonp", //指定服务器返回的数据类型
        crossDomain:true,
        success: function (data) {
         if(data.state == 100){
         	var datalist = data.info.list;
         	zan_total = data.info.pageInfo.totalPage;
         	var html = [];
         	if(datalist.length==0){
         		$('.im-act_box .im-zan').html('<div class="im-no_list"><img src="'+staticPath+'images/im/no_img.png" /><p>'+langData['siteConfig'][47][71]+'~</p></div>');//没有任何点赞
         	}else{
         		for(var i=0; i< datalist.length; i++ ){
					var list  = [];
					if(datalist[i].detail){
						list.push('<li><a href="'+datalist[i].detail.url+'" class="fn-clear" data-type="'+datalist[i].detail.type+'">');
							list.push('<div class="im-zan_head"><img onerror="nofind();" src="'+(datalist[i].photo?datalist[i].photo:"/static/images/noPhoto_60.jpg")+'" /></div>');
							list.push('<div class="im-zan_con">');
								if(datalist[i].detail.litpic){
									list.push('<div class="im-con_img"><img onerror="nofind_c();" src="'+(datalist[i].detail.litpic?datalist[i].detail.litpic:"/static/images/404.jpg")+'" /></div>');
								}else if(datalist[i].detail.imglist && datalist[i].detail.imglist.length>0){
									list.push('<div class="im-con_img"><img onerror="nofind_c();"  src="'+(datalist[i].detail.imglist[0].path?"/include/attachment.php?f="+datalist[i].detail.imglist[0].path:"/static/images/404.jpg")+'" /></div>');
								}else if(datalist[i].detail.imgGroup && datalist[i].detail.imgGroup.length>0){
									list.push('<div class="im-con_img"><img onerror="nofind_c();"  src="'+datalist[i].detail.imgGroup[0]+'" /></div>');
								}else if(datalist[i].detail.pics && datalist[i].detail.pics.length>0){
									list.push('<div class="im-con_img"><img onerror="nofind_c();"  src="'+(datalist[i].detail.pics[0])+'" /></div>');
								}
								if(datalist[i].type=='1'){
										className="commt_con";
										list.push('<h3><span class="im-nicname">'+datalist[i].username+'</span>'+langData['siteConfig'][47][72]+'</h3>');//赞了我的评论
										list.push('<p>'+datalist[i].detail.commentcontent+'</p>');
								}else{
										className="con_box";
										list.push('<h3><span class="im-nicname">'+datalist[i].username+'</span>'+langData['siteConfig'][47][73]+'</h3>');//赞了我的发布
										list.push('<p>'+(datalist[i].detail.description?datalist[i].detail.description:datalist[i].detail.title)+'</p>');
								}
								list.push('<div class="im-reply_box"><em>'+(getDateDiff(datalist[i].puctime))+'</em></div>');
							list.push('</div>');
						list.push('</a></li>');
						
					}else{
						list.push('<li><a class="fn-clear" href="javascript:;" ><div class="im-zan_head"><img onerror="nofind();" src="'+(datalist[i].photo?datalist[i].photo:"/static/images/noPhoto_60.jpg")+'" /></div>');
						list.push('<div class="im-zan_con">');
						if(datalist[i].type=='1'){
								className="commt_con";
								list.push('<h3><span class="im-nicname">'+datalist[i].username+'</span>'+langData['siteConfig'][47][72]+'</h3>');//赞了我的评论
								
						}else{
								className="con_box";
								list.push('<h3><span class="im-nicname">'+datalist[i].username+'</span>'+langData['siteConfig'][47][73]+'</h3>');//赞了我的发布
						}
						list.push('</div>');
						list.push('</a></li>');
					}
					html.push(list.join(''));
				}
         		$('.im-act_box .im-zan').append(html);
         		$('.com_loading').hide();
         	}
         	if(zan_page == zan_total){
	            console.log(langData['siteConfig'][47][6]);//已经全部加载
	            zanload = 1;
	            $('.com_loading').hide();
	        }
         	zan_page++;
         	fin_zan=1;
         }else{
         	 $('.com_loading').hide();
         		$('.im-act_box .im-zan').html('<div class="im-no_list"><img src="'+staticPath+'images/im/no_img.png" /><p>'+langData['siteConfig'][47][71]+'~</p></div>');//没有任何点赞
         }

        },
        error:function(err){
        	console.log('fail');
        }
     });
}

var cm_page=1,cm_total=0,cmload=0,fin_comm=1;
var getcommt = function(){
	$('.com_loading').show();
	$.ajax({
        url: "/include/ajax.php?service=member&action=getComment&u=1&son=1&onlyself=1&page="+cm_page+"&pageSize=10",
        type: "GET",
        dataType: "jsonp", //指定服务器返回的数据类型
        crossDomain:true,
        success: function (data) {
         if(data.state == 100){
         	var datalist = data.info.list,
         	cm_total = data.info.pageInfo.totalPage;
         	var html = [];
         	if(datalist.length==0){
         		$('.im-act_box .im-commt').html('<div class="im-no_list" ><img src="'+staticPath+'images/im/no_img.png" /><p>'+langData['siteConfig'][47][74]+'~</p></div>');//没有任何消息
         	}else{
         		for(var i=0; i< datalist.length; i++ ){
					var list  = [];
					list.push('<li><a href="'+(datalist[i].detail?datalist[i].detail.url:'javascript:;')+'" class="fn-clear">');
						list.push('<div class="im-zan_head"><img src="'+(datalist[i].user.photo?datalist[i].user.photo:"/static/images/noPhoto_60.jpg")+'" /></div>');
						list.push('<div class="im-zan_con">');
							if(datalist[i].detail && datalist[i].detail.litpic){
								list.push('<div class="im-con_img"><img  onerror="nofind_c();"  src="'+(datalist[i].detail.litpic?datalist[i].detail.litpic:"/static/images/noPhoto_60.jpg")+'" /></div>');
							}else if(datalist[i].detail && datalist[i].detail.imglist){
								if(datalist[i].detail.imglist.length>0){
									list.push('<div class="im-con_img"><img onerror="nofind_c();"  src="'+datalist[i].detail.imglist[0].path+'" /></div>');
								}

							}else if(datalist[i].detail && datalist[i].detail.imgGroup){  //评论
								list.push('<div class="im-con_img"><img onerror="nofind_c();"  src="'+datalist[i].detail.imgGroup[0]+'" /></div>');

							}
							list.push('<h3><span class="im-nicname">'+datalist[i].user.username+'</span></h3>');
				            list.push('<p>'+datalist[i].content+'</p>');
							list.push('<div class="im-reply_box"><em>'+(getDateDiff(datalist[i].dtime))+'</em><span data-id="'+datalist[i].id+'" class="im-btn_reply">'+langData['siteConfig'][6][29]+'</span></div>');//回复
						list.push('</div>');
         			list.push('</a></li>');
         			html.push(list.join(''));
         		}
         		$('.im-act_box .im-commt').append(html);
         		$('.com_loading').hide();


         	}
         	 if(cm_page == cm_total){
				    console.log(langData['siteConfig'][47][6]);//已经全部加载
				    cmload = 1;
				    $('.com_loading').hide();
			}
         cm_page++;
         fin_comm=1;
         }else{
         		$('.com_loading').remove();
         		$('.im-act_box .im-commt').html('<div class="im-no_list" ><img src="'+staticPath+'images/im/no_img.png" /><p>'+langData['siteConfig'][47][75]+'~</p></div>');//没有任何评论
         }

        },
        error:function(err){
        	console.log('fail');
        }
     });
}

////加载个人资料
//var getinfo =  function(id){
//	$.ajax({
//      url: "/include/ajax.php?service=member&action=getComment&u=1&son=1",
//      type: "GET",
//      dataType: "jsonp", //指定服务器返回的数据类型
//      crossDomain:true,
//      success: function (data) {
//       if(data.state == 100){
//       	var datalist = data.info.list;
//       	var html = [],info=[];
//
//       		for(var i=0; i< datalist.length; i++ ){
//					var list  = [];
//					if(i!=2){
//						list.push('<li class="im-shop"><a href="#" class=" fn-clear"><div class="im-_leftLogo "><i></i><span>商城</span></div><div class="im-shop_info"><h3>蔓延时尚潮流女装  </h3><p>服装服饰、鞋帽、针纺织品、服装辅料、</p></div></a></li>');
//					}else{
//						list.push('<li class="im-zhaopin"><a href="#" class=" fn-clear"><div class="im-_leftLogo"><i></i><span>招聘</span></div><div class="im-shop_info"><h3>蔓延时尚潮流女装  </h3><p><span>在招职位  12</span><em>|</em><span>薪资  5000~7000</span></p></div></a></li>');
//					}
//       			html.push(list.join(''))
//       		}
//       		$('.im-shop_box ul').html(html)
//       }
//      },
//      error:function(err){
//      	console.log('fail');
//      }
//   });
//}

var timer,step=0;
var newTip = function(num){
	//新消息闪烁
	clearInterval(timer);
	if(num==0){
		$('.im-msg_tip').html('<span class="im-tip_head"><img onerror="nofind();"   src="'+(userinfo["photo"]?userinfo["photo"]:staticPath+"images/noPhoto_60.jpg")+'"/></span><p>'+userinfo["name"]+'</p><i></i>');
		return false;

	}else{

		timer = setInterval(function(){
			step++;
			if(step == 3) {step = 1};
			if(step == 1) {$('.im-msg_tip p').text('  ') };
			if(step == 2) {
				$('.im-msg_tip p').html(langData['siteConfig'][47][76]+'<span class="im-news_num">'+num+'</span>');//有新消息
			};
		}, 500);
	}

}
//获取消息数目
var getnum = function(){
		$.ajax({
	       url: '/include/ajax.php?service=member&action=message&type=tongji&im=1',
	       type: "GET",
	       dataType: "json",
           timeout: 3000,
	       success: function (data) {
		       var html = [];
		       if(data.state == 100){
		       	  var info = data.info.pageInfo;
		       	  var count = info.im + info.unread + info.upunread + info.commentunread;
		       	  if(info.commentunread>0){
		       	  	$('.im-btn_comm span').html(langData['siteConfig'][6][114]+info.commentunread);//评论
		       	  }else{
		       	  	$('.im-btn_comm span').html(langData['siteConfig'][6][114]);//评论
		       	  }
		       	  if(info.upunread>0){
		       	  	$('.im-btn_zan span').html(langData['siteConfig'][46][57]+info.upunread);//赞
		       	  }else{
		       	  	$('.im-btn_zan span').html(langData['siteConfig'][46][57]);//赞
		       	  }
		       	  $('.im-msg_btn .im-tip_num').remove();
		       	  if(info.commentunread>0 || info.upunread>0){
		       	  	$('.im-msg_btn').append('<i class="im-tip_num">'+(info.commentunread+info.upunread)+'</i>');
		       	  }
		       	  newTip(count);
		       }
	       },
	       error: function(){
	         console.log(langData['siteConfig'][47][80]);  //请求出错请刷新重试
	       }
	    });
	}
//	setTimeout(function(){
//		getnum();
//	},500);

countInterview = setInterval(getnum,5000)
//文本框过滤样式
// $('[contenteditable]').each(function() {
//     // 干掉IE http之类地址自动加链接
//     try {
//         document.execCommand("AutoUrlDetect", false, false);
//     } catch (e) {}

//     $(this).on('paste', function(e) {
//         e.preventDefault();
//         var text = null;

//         if(window.clipboardData && clipboardData.setData) {
//             // IE
//             text = window.clipboardData.getData('text');
//         } else {
//             text = (e.originalEvent || e).clipboardData.getData('text/plain') || prompt('在这里输入文本');
//         }
//         if (document.body.createTextRange) {
//             if (document.selection) {
//                 textRange = document.selection.createRange();
//             } else if (window.getSelection) {
//                 sel = window.getSelection();
//                 var range = sel.getRangeAt(0);

//                 // 创建临时元素，使得TextRange可以移动到正确的位置
//                 var tempEl = document.createElement("span");
//                 tempEl.innerHTML = "&#FEFF;";
//                 range.deleteContents();
//                 range.insertNode(tempEl);
//                 textRange = document.body.createTextRange();
//                 textRange.moveToElementText(tempEl);
//                 tempEl.parentNode.removeChild(tempEl);
//             }
//             textRange.text = text;
//             textRange.collapse(false);
//             textRange.select();
//         } else {
//             // Chrome之类浏览器
//             document.execCommand("insertText", false, text);
//         }
//     });
//     // 去除Crtl+b/Ctrl+i/Ctrl+u等快捷键
//     $(this).on('keydown', function(e) {
//         // e.metaKey for mac
//         if (e.ctrlKey || e.metaKey) {
//             switch(e.keyCode){
//                 case 66: //ctrl+B or ctrl+b
//                 case 98:
//                 case 73: //ctrl+I or ctrl+i
//                 case 105:
//                 case 85: //ctrl+U or ctrl+u
//                 case 117: {
//                     e.preventDefault();
//                     break;
//                 }
//             }
//         }
//     });
// });



$(function(){
	$(document).on('visibilitychange', function (e) {
		clearInterval(refreshTimeout)
		clearInterval(countInterview)
        if (e.target.visibilityState === "visible") {
			// 页面显示
			if ($(".im-msg_tip").css("display") == "none"){
				checkGetList()
				refreshTimeout = setInterval(function(){
					checkGetList()
				},5000)
			}
			countInterview = setInterval(getnum,5000)
			pageShowCheck(5)
        } else if (e.target.visibilityState === "hidden") {
			// 页面隐藏
			clearInterval(refreshTimeout)
			clearInterval(countInterview)
        }
    });
})