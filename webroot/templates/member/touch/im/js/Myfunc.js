
//提示窗
var showErrTimer;
var showMsg = function(txt,time){
	ht = time?time:1500
	showErrTimer && clearTimeout(showErrTimer);
	$(".im-popMsg").remove();
	$("body").append('<div class="im-popMsg"><p>'+txt+'</p></div>');
	$(".im-popMsg p").css({ "left": "50%"});
	$(".im-popMsg").css({"visibility": "visible"});
	showErrTimer = setTimeout(function(){
	    $(".im-popMsg").fadeOut(300, function(){
	        $(this).remove();
	    });
	}, ht);
}

//底部弹出层
var showBottom = function(){
	$("body").append('<div class="im-deltip_box"><ul><li class="im-delf_tip">'+langData['siteConfig'][47][21]+'</li><li class="im-delf_confirm"><a href="javascript:;">'+langData['siteConfig'][46][20]+'</a></li><li class="im-delf_cancel" onclick="closebottom()";><a href="javascript:;" >'+langData['siteConfig'][6][12]+'</a></li></ul></div>');//确定将此用户从你的好友列表删除 -- 删除好友 --取消
	setTimeout(function(){$('.im-mask0').show();$('.im-deltip_box').animate({'bottom':'0'},'fast');},100);	
}

var closebottom =function (){
	$('.im-deltip_box').animate({'bottom':'-3rem'},'fast');
	$('.im-mask0').hide();
	setTimeout(function(){$('.im-deltip_box').remove()},100);
}

var  img_url = function(pageData){
		console.log('4')
	// 根据经纬度获取地图IMG
	if (pageData.mapType == "baidu") {
	    MapImg_URL = "http://api.map.baidu.com/staticimage?width=300&height=100&zoom=16&markers="+pageData.lng+","+pageData.lat+"&markerStyles=m,Y"
	}else if (pageData.mapType == "google") {
	    MapImg_URL = "https://maps.googleapis.com/maps/api/staticmap?zoom=16&size=300x100&maptype=roadmap&markers="+pageData.lat+","+pageData.lng+"&key="+pageData.mapKey+""
	}else if (pageData.mapType == "amap") {
	    MapImg_URL = "http://restapi.amap.com/v3/staticmap?location="+pageData.lng+","+pageData.lat+"&zoom=16&size=750*300&markers=mid,,A:"+pageData.lng+","+pageData.lat+"&key="+pageData.mapKey+""
	}else if (pageData.mapType == "qq") {
	    MapImg_URL = "http://apis.map.qq.com/ws/staticmap/v2/?center="+pageData.lat+","+pageData.lng+"&zoom=16&size=600*300&maptype=roadmap&markers=size:large|color:0xFFCCFF|label:k|"+pageData.lat+","+pageData.lng+"&key="+pageData.mapKey+""
    }else if (pageData.mapType == "tmap") {
        MapImg_URL = "//api.tianditu.gov.cn/staticimage?center="+pageData.lng+","+pageData.lat+"&markers="+pageData.lng+","+pageData.lat+"&width=300&height=130&zoom=13&tk="+pageData.mapKey+""
	};

}


var stopDrop = function() {
    var lastY;  //最后一次y坐标点
    $(document.body).on('touchstart', function(event) {
        lastY = event.originalEvent.changedTouches[0].clientY;//点击屏幕时记录最后一次Y度坐标。
    });
    $(document.body).on('touchmove', function(event) {
        var y = event.originalEvent.changedTouches[0].clientY;
        var st = $(this).scrollTop(); //滚动条高度  
        if (y >= lastY && st <= 10) {//如果滚动条高度小于0，可以理解为到顶了，且是下拉情况下，阻止touchmove事件。
            lastY = y;
            event.preventDefault();
        }
        lastY = y;
 
    });
}

//文本框过滤样式，由于touchScal.js中的checkhtml方法已经执行，所以这里不再需要
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
//             text = (e.originalEvent || e).clipboardData.getData('text/plain') || prompt(langData['siteConfig'][47][22]);//在这里输入文本
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