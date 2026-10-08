
   var staticPath = typeof staticPath != "undefined" && staticPath != "" ? staticPath : "/static/";
   var emojiText = "😄 😝 😜 😪 😞 😚 😏 😎 😌 😋 😊 😍 😷 😘 😖 😳 😲 😱 😰 😩 😨 😭 😥 😤 😣 😢 😡 😠 😆 😅 😃 😂 😔 😓 😒 😫 😐 😉 😈 😇 😁 👽 🙊 🐻 🚗 🎵 ❤ 💔 👻 🎁 🎉 🎂 👀 🙋 🙏 🌹 🐴 🐶 🐠 🐔 🐼 🐺 🐭 🐌 🐷 🐯 🐍 🐮 🐝 ⚽ 💊 🍔 🍊 🍎 🍉 ☕ 🍜 🍚 🍞 🍺 ☀ ⛅ ☁ ☔ ⚡ ⛄ 💰 💕 💏 💎 💍 ✌ 👍 👎 👏 👌";

	var new_element1=document.createElement("script"),
	new_element2=document.createElement("script"),
	new_element3=document.createElement("script"),
	new_element4=document.createElement("script"),
	new_element5=document.createElement("script"),
	new_element6=document.createElement("script"),
	new_element7=document.createElement("script");
	new_element8=document.createElement("script");
	//new_element9=document.createElement("script");
	new_element1.setAttribute("type","text/javascript");
	new_element2.setAttribute("type","text/javascript");
	new_element3.setAttribute("type","text/javascript");
	new_element4.setAttribute("type","text/javascript");
	new_element5.setAttribute("type","text/javascript");
	new_element6.setAttribute("type","text/javascript");
	new_element7.setAttribute("type","text/javascript");
	new_element8.setAttribute("type","text/javascript");
	new_element1.setAttribute("src",staticPath+"js/im/jquery-migrate-1.2.1.js?v=" + ~(-new Date()));
	new_element2.setAttribute("src",staticPath+"js/ui/calendar/WdatePicker.js?v=" + ~(-new Date()));
	new_element3.setAttribute("src","//g.alicdn.com/de/prismplayer/2.8.2/aliplayer-min.js");
	new_element4.setAttribute("src",staticPath+"js/ui/jquery.dragsort-0.5.1.min.js?v=" + ~(-new Date()));
	new_element5.setAttribute("src",staticPath+"js/ui/jquery.ajaxFileUpload.js?v=" + ~(-new Date()));
	new_element6.setAttribute("src",staticPath+"js/im/getlist.js?v=" + ~(-new Date()));
	new_element7.setAttribute("src",staticPath+"js/im/Map_position.js?v=" + ~(-new Date()));
	new_element8.setAttribute("src",staticPath+"js/im/chat.js?v=" + ~(-new Date()));
	//new_element9.setAttribute("src",staticPath+"js/im/BenzAMRRecorder.js?v=" + ~(-new Date()));
	//document.body.appendChild(new_element9);
	document.body.appendChild(new_element1);
	document.body.appendChild(new_element2);
	document.body.appendChild(new_element3);
	document.body.appendChild(new_element4);
	document.body.appendChild(new_element5);
	document.body.appendChild(new_element6);
	document.body.appendChild(new_element7);
	document.body.appendChild(new_element8);
	
var css_1;
    css_0 = document.getElementsByTagName('head')[0].appendChild(document.createElement('link'));
    css_0.href = staticPath+'css/im/chat.css?v=' + ~(-new Date());
    css_0.rel ="stylesheet";
    css_0.type= "text/css";
    css_2 = document.getElementsByTagName('head')[0].appendChild(document.createElement('link'));
    css_2.href ="//g.alicdn.com/de/prismplayer/2.8.2/skins/default/aliplayer-min.css";
    css_2.rel ="stylesheet";
    css_2.type= "text/css";

;(function(){ //code
	// <!--新消息底部弹出框s-->
	$('body').append('<div class="im-msg_tip  fn-clear"><span class="im-tip_head"><img onerror="nofind();" src="'+staticPath+'images/noPhoto_60.jpg"/></span><i></i><p>'+langData['siteConfig'][38][2]+'~</p></div>');//加载中
	// <!--新消息底部弹出框e-->
	//聊天框
	var html = [], login=0;
	var login_if = !login?"im-no_login":''
	html.push('<div class="im-panel_box" ><div class="im-mask"></div>')
	//==-----==
	html.push('<div class="im-panel_list"><div class="im-pub_box"><div class="im-user_info fn-clear"><a class="im-_left '+login_if+'" href="javascript:;">');
	html.push('<i><img onerror="nofind();" src="'+staticPath+'images/noPhoto_60.jpg"/></i><span>'+langData['siteConfig'][47][77]+'</span></a><a href="javascript:;" class="im-hide_btn" title="'+langData['siteConfig'][22][8]+'"></a></div>');//未登录--收起
	html.push('<ul class="im-tab_ul fn-clear"><li class="im-cur_btn im-on"><a href="javascript:;" title="'+langData['siteConfig'][47][78]+'"><i></i></a></li><li class="im-F_btn"><a href="javascript:;" title="'+langData['siteConfig'][46][49]+'"><i ></i></a></li><li class="im-tip_btn"><a href="javascript:;" title="'+langData['siteConfig'][46][56]+'"><i class="im-tip_num">0</i></a></li></ul></div>	');//进行中的会话--好友--通知
	//==-----==
	html.push('<div class="im-listBox"><a href="javascript:;" class="im-clearOut">清空通知</a>');
	html.push('<ul class="im-cur_chat im-chat_list im-box  im-show"></ul><ul class="im-f_list im-chat_list im-box"></ul><ul class="im-msg_list im-box"></ul>');
	html.push('</div>');
	//==---此处需要根据后台请求获取数据--==
	html.push('<div class="im-bottom_btn im-btn_group"><a href="javascript:;" class="im-search_btn" title="'+langData['siteConfig'][47][35]+'"></a>');//搜索用户
	html.push('<a href="javascript:;" class="im-msg_btn"><div class="im-op_tip"><ul><li class="im-btn_comm"><span>'+langData['siteConfig'][6][114]+'</span></li><li class="im-btn_zan"><span>'+langData['siteConfig'][46][57]+'</span></li></ul></div></a>');//评论--赞
	html.push('</div></div>');
	$('body').append(html.join(''));

	//删除好友
	$('body').append('<div class="im-f_del im-tip_p"><h2>'+langData['siteConfig'][46][20]+'   <i title="'+langData['siteConfig'][6][15]+'" class="im-close_p"></i></h2><div class="im-con_del"><p>'+langData['siteConfig'][47][79]+'</p><div class="im-del_box"><div class="im-del_head im-vip_head"><img src="'+staticPath+'images/noPhoto_60.jpg" /></div><div class="im-del_info"><h2>'+langData['siteConfig'][19][6]+'</h2><p>(ID:'+langData['siteConfig'][38][3]+')</p></div></div><div class="im-btn_group"><a href="javascript:;" class="im-sure_del">'+langData['siteConfig'][6][1]+'</a><a href="javascript:;" class="im-cancel">'+langData['siteConfig'][6][12]+'</a></div></div></div>');//删除好友--关闭--删除后将互相从对方好友列表中消失--昵称--加载中--确定--取消

	//好友验证
	$('body').append('<div class="im-f_add im-tip_p"><h2>'+langData['siteConfig'][46][3]+'   <i title="'+langData['siteConfig'][6][15]+'" class="im-close_p"></i></h2><div class="im-con_del"><textarea id="im-msg_txt"></textarea><div class="im-btn_group"><a href="javascript:;" class="im-cancel">'+langData['siteConfig'][6][12]+'</a><a href="javascript:;" class="im-send_test">'+langData['siteConfig'][6][139]+'</a></div></div></div>');//好友验证--关闭--取消--发送

	//表情
	$('body').find('.im-panel_box').append('<div class="im-emoji-hide"><h2>'+langData['siteConfig'][47][80]+'</h2><ul class="im-emoji-list"></ul></div>');//选择表情
	// var emoj_list = emojiText.split(' ');
	// var emoji_html = []
	// for(var i=1;i<emoj_list.length;i++){
	// 	emoji_html.push('<li class="emot_li" data-txt="'+emoj_list[i]+'"><a href="javascript:;"><img src="/static/images/ui/emot/default/defult_'+(i+1)+'.png?v=1"></a></li>');
	// }
	// $('.im-emoji-hide .im-emoji-list').html(emoji_html.join(''));

	//大图显示
	$('body').append('<div class="im-big_img"><img src="" /><i></i></div>');
	$('body').append('<div class="im-photo"><input type="file" name="Filedata" class="Filedata" id="image"></div>')
	//聊天记录
	$('body').append('<div class="im-notebox im-notes_panel"><h2>'+langData['siteConfig'][47][81].replace('1','<span>SIMMON</span>')+'<i title="'+langData['siteConfig'][6][15]+'" class="im-close_btn"></i></h2><div class="im-msg_record"><ul></ul><div class="im-rec_loading2"><i></i><p>'+langData['siteConfig'][38][3]+'</p></div></div><div class="im-bottom_box" ><div class="im-date_chose" onclick="WdatePicker({el:\'im-date\', opposite:true, showButtonPanel: false,isShowClear:false, disabledDates:datelist})"   id="im-chose_date" title="'+langData['siteConfig'][26][28]+'"  ><input size="16" type="text" value="" readonly="readonly" id="im-date"></div><div class="im-page_chose"><a href="javascript:;" class="im-to_first" title="'+langData['siteConfig'][47][82]+'"></a><a href="javascript:;" class="im-prev" title="'+langData['siteConfig'][6][33]+'"></a><input type="text" class="im-page_mum" value="" readonly="readonly"/><a href="javascript:;" class="im-next" title="'+langData['siteConfig'][6][34]+'"></a><a href="javascript:;" class="im-to_last" title="'+langData['siteConfig'][47][83]+'"></a><i title="'+langData['siteConfig'][31][78]+'" class="im-btn_op"></i><div class="im-zhe"><div class="im-pop_record"><a href="javascript:;" class="im-pop_btn">'+langData['siteConfig'][47][84]+'</a></div></div></div></div></div>');//与1的聊天记录--关闭--加载中--选择日期--第一页--上一页--下一页--最后一页--选项--导出记录
	//播放器
	$('body').append('<div class="im-video_box"><div class="prism-player" id="im-video_player"></div><i class="im-close_video"></i></div>')
})();

function appendEmoji() {
    var emojiList = emojiText.split(' ');
    // var html = '';
    var list = [];
    for (var i = 0; i < emojiList.length; i++) {
        list.push('<li class="emot_li" data-txt="' + emojiList[i] + '"><img src="/static/images/ui/emot/default/defult_' + (i + 1) + '.png?v=1"></li>');
    }
    // html = '<ul class="fn-clear">' + list.join('') + '</ul>';
    return list.join('');
}