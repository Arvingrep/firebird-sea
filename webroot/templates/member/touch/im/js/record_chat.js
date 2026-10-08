var chatLib, AccessKeyID, userinfo, chatToken, chatServer, toUserinfo, toChatToken;
var isload = false, page = 1, pageSize = 20, totalPage = 1, stop = 0, time = Math.round(new Date().getTime()/1000).toString();
$(function(){
    
    //APP端取消下拉刷新
    toggleDragRefresh('off');
	
	//初始化当前用户信息
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

				//获取聊天对象信息
				var url = window.location.pathname;
				
				if (url.indexOf("-") != -1){
					
					var userid = url.slice(url.indexOf("-")+1,url.indexOf("."));
					console.log(userid)
			//		可以根据userid获取好友的信息
					$.ajax({
				       url: '/include/ajax.php?service=siteConfig&action=getImToken&userid=' + userid,
				       type: "GET",
				       dataType: "json",
				       success: function (data) {
					       if(data.state==100){
					       	  var datalist = data.info;
					       	  toChatToken = datalist.token;
					       	  toUserinfo = {
					       		'uid': datalist.uid,
								'name': datalist.name,
								'photo': datalist.photo
					       	  };
					       	  getrecord();				       	 
					       }
				       },
				       error: function(){
				          $('.loading').html('<span>'+langData['siteConfig'][37][80]+'</span>');  //请求出错请刷新重试
				       }
				    });
				    

				}
            }else{
                alert(data.info);
            }
        },
        error: function(){
            alert(langData['siteConfig'][46][63]);//网络错误，初始化失败！
        }
    });
	
	
	
	
	
	
	
	
	
//	日期插件初始化
	$('#chosedate').mdater({
        maxDate: new Date(),
        minDate: new Date(2019,4,20),  //最早的聊天记录的日期
        disableDate:[new Date(2019,4,25),new Date(2019,4,27)],  //没有聊天记录的日期
    });
    
    //切换日期加载聊天记录
	$('body').delegate('.md_datearea li','click',function(){
		if(!$(this).hasClass('disabled')){
			record_page=1;
			getrecord();
		}
	});
	
	//触顶加载更多
	$('.im-chat_record').scroll(function(){
//		console.log($(this).scrollTop());
		if($(this).scrollTop()==0 && !record_load){
			getrecord('prepend');
		}
	});
	
$('body').delegate('.im-close_page,.im-hb_cancel','click',function(){
	$(this).parents('.im-pop_page').animate({'bottom':'-100%'},200)
});

//红包消息点击
$('body').delegate('.im-hb_content','click',function(){
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
//			console.log(111)
			$('.im-hb_box_null').show().siblings('.im-hb_box_full').hide();
		}else{
			$('.im-hb_box_full').show().siblings('.im-hb_box_null').hide();
		}
		
	}
});

//关闭红包
$('body').delegate('.im-hb_box_form i','click',function(){
	$('.im-special_mask').hide();
	$(this).parents('.im-hb_box_form').hide();
});

});

var record_load = 0;record_page=1;
function getrecord(type){
	
	$('.im-chat_content').prepend('<div class="laoding"><img src="'+templets_skin+'images/loading.gif"/></div>');
	var url = "/include/ajax.php?service=siteConfig&action=getImChatLog";
     $.ajax({
       url: url,
       data: {from: chatToken, to: toChatToken, page: record_page, pageSize: 20, time: time},
       type: "GET",
       dataType: "json",
       success: function (data) {
	       if(data && data.state == 100){
            data = data.info;
            var pageInfo = data.pageInfo;
            var list = data.list;

            if(record_page == 1){
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
            setTimeout(function(){
            	 //放大图片
   				    $.fn.bigImage({
				        artMainCon:".im-chat_record",  //图片所在的列表标签
				        show_Con:'.im-img_msg',
				    });
                record_load = false;
                 
            }, 1000);

            //最后一页显示时间
           if(record_page > 1 && record_page == pageInfo.totalPage){
           		$('.im-more').remove();
                var time = parseInt($('.im-record_box').find('.im-chat_item:eq(0)').attr('data-time'));
                 $('.im-record_box').prepend('<p class="im-msg_time" data-time="'+time+'">'+getDateDiff(time)+'</p>');
           }
                   if(record_page>=pageInfo.totalPage){
                   	$('.im-more').remove();
                   }

                   record_page++; 
					fin =1;
                }else{
                    console.log(data.info);
                    record_load = false;
                }
            },
            error: function(){
                console.log('network error');
                record_load = false;
            }
    });
}
// 业务层
    var createEle = function(data, type, newMessage, lib){
    
        var from = data.from;
        var to = data.to;
        var sf = false;
        
        //更新对话窗体内容，如果没有选择会员，不执行
        if(!toUserinfo || (newMessage && toUserinfo['uid'] != from)) return;
		var gest = typemsg = imghead = style = attrbuite =lng=lat ='';
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
        	imghead = '<div class="im-m_head"><a href="'+channelDomain+'/acc_info-'+toUserinfo['uid']+'.html"><img src="'+(toUserinfo['photo']?toUserinfo['photo']:staticPath+"images/noPhoto_60.jpg")+'"></a></div>';
           
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
        	 text = '<div class="im-video_msg"><video controls="controls" src="/include/attachment.php?f='+content.url+'"></video></div>';
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
        	text = '<a href="add_friend-'+data.content.f_id+'.html"><dl><dt>'+langData['siteConfig'][46][32]+'</dt><dd class="fn-clear"><div class="im-recf_head"><img src="'+data.content.f_photo+'"/><i class="level"></i></div><div class="im-recf_info"><h2>'+data.content.f_name+'</h2><p>ID：'+data.content.f_id+'</p></div></dd></dl></a>'//推荐好友
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
        if(data.contentType == 'apply'){
        	var date1 =new Date();
        	var date2 = date1.getTime()-data.time*1000;
        	var day = Math.floor(date2/(24*3600*1000)); //相差天数
        	var hour =  Math.floor((date2%(24*3600*1000))/(3600*1000));
        	var min =  Math.floor(((date2%(24*3600*1000))%(3600*1000))/(60*1000));
        	var timemsg ='';
        	if(day>0&&data.to==toUserinfo['uid']){
        		timemsg ='apply_timeout';
        	}else{
        		timemsg ='im-apply_msg';
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
        		ctn_text =  '<p class="'+ cname +'">'+info.description+'</p><p class="'+ cname +'">'+langData['siteConfig'][19][633]+'：'+ info.salary +'</p>'	//薪资范围
        		title = langData['siteConfig'][46][69]+info.title;//[招聘]
        	}else{
        		cname = "pro_price";
        		title = info.title;
        		ctn_text = '<p class="'+cname+'">'+ (info.price==''?langData['siteConfig'][46][70]:info.price) +'</p>';//面议
        		
        	}
        	item = '<a href="'+info.link+'" class="im-Linkbox fn-clear"><div class="im_left '+hide+'"><img onerror="nofind_c();" src="'+(info.imgUrl?info.imgUrl:"/static/images/404.jpg")+'" /></div><div class="im-pro_text '+cname_txt+'"><h3>'+title+'</h3>'+ctn_text+'</div></a>'
        }else{
        	item = '<div class="'+gest+' im-chat_item fn-clear" data-time="'+data.time+'" data-size="'+attrbuite+'" >'+imghead+'<div style="'+style+'" class="im-m_content '+typemsg+'" data-lng="'+lng+'" data-lat="'+lat+'">'+text+'</div></div>';
        }
       
        appendLog('mine', item, type, data.time);
		if(newMessage&&(data.contentType == 'image')){
         	console.log('有新图片消息')
         	setTimeout(function(){
        	 //放大图片
//				    $.fn.bigImage({
//				        artMainCon:".im-chat_content",  //图片所在的列表标签
//				        show_Con:'.im-img_msg',
//				    });
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
            log.scrollTop(log[0].scrollHeight);
        }else{
            $('.im-chat_content').prepend(item);
            stop += $('.im-chat_content').find('.im-chat_item:eq(0)').height();
            log.scrollTop(stop);
        }
       
    }
