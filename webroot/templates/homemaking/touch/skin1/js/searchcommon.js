// 判断设备类型，ios全屏
var device = navigator.userAgent;
if (device.indexOf('huoniao_iOS') > -1) {
  $('body').addClass('huoniao_iOS');
  $('.head .close').hide();
}
var huoniao = {
  
    //转换PHP时间戳
    transTimes: function(timestamp, n){

        const dateFormatter = this.dateFormatter(timestamp);
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
            return dateFormatter;
        }else{
            return 0;
        }
    },

    //判断是否为合法时间戳
    isValidTimestamp: function(timestamp) {
        return timestamp = timestamp * 1, Number.isFinite(timestamp) && timestamp > 0;
    },

    //创建 Intl.DateTimeFormat 对象并设置格式选项
    dateFormatter: function(timestamp){
        
        if(!this.isValidTimestamp(timestamp)) return {year: '-', month: '-', day: '-', hour: '-', minute: '-', second: '-'};

        const date = new Date(timestamp * 1000);  //创建一个新的Date对象，使用时间戳
        
        // 使用Intl.DateTimeFormat来格式化日期
        const dateTimeFormat = new Intl.DateTimeFormat('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: typeof cfg_timezone == 'undefined' ? 'PRC' : cfg_timezone,  //指定时区，cfg_timezone变量已在页面中通过程序自动声明
        });
        
        // 获取格式化后的时间字符串
        const formatted = dateTimeFormat.format(date);
        
        // 将格式化后的字符串分割为数组
        const [year, month, day, hour, minute, second] = formatted.match(/\d+/g);

        // 返回一个对象，包含年月日时分秒
        return {year, month, day, hour, minute, second};
    }

  /**
     * 获取附件不同尺寸
     * 此功能只适用于远程附件（非FTP模式）
     * @param string url 文件地址
     * @param string width 兼容老版本(small/middle)
     * @param int width 宽度
     * @param int height 高度
     * @return string *
     */ 
   ,changeFileSize: function(url, width, height){
    if(url == "" || url == undefined) return "";

    //小图尺寸
    if(width == 'small'){
        width = 200;
        height = 200;
    }

    //中图尺寸
    if(width == 'middle'){
        width = 500;
        height = 500;
    }

    //默认尺寸
    width = typeof width === 'number' ? width : 800;
    height = typeof height === 'number' ? height : 800;

    //阿里云、华为云
    url = url.replace('w_4096', 'w_' + width);
    url = url.replace('h_4096', 'h_' + height);

    //七牛云
    url = url.replace('w/4096', 'w/' + width);
    url = url.replace('h/4096', 'h/' + height);

    //腾讯云
    url = url.replace('4096x4096', width+"x"+height);

    return url;

    // 以下功能弃用
		if(to == "") return url;
		var from = (from == "" || from == undefined) ? "large" : from;
		var newUrl = "";
		if(hideFileUrl == 1){
			newUrl =  url + "&type=" + to;
		}else{
			newUrl = url.replace(from, to);
		}

		return newUrl;

	}

}
var history_search = 'index_history_search';
$(function(){ 


	
	var loadMoreLock = false, page = 1, isend = false;
	//点击搜索按钮
  $('.btn-go').click(function(){
  	var keywords = $('#keywords').val()
  	
	$('.textIn-box ').submit();
	
  });
	//点击搜索记录时搜索
	$('.search-history,.search-hot').delegate('li','click',function(){
		var keywords= $(this).find('a').text();
		$('#keywords').val(keywords);
//		alert($('#keywords').val())
		$('.textIn-box ').submit();
		
	})
		
		
	//切换导航
	$('.slideNav a').click(function(){
		$(this).addClass('slide-on').siblings().removeClass('slide-on');
		$('#action').val($('.slide-on').attr('data-action'));
	});
	$('.slideNav a').first().click();
	


	//加载历史记录
	var hlist = [];
	var history = utils.getStorage(history_search);
	if(history){
		history.reverse();
		for(var i = 0; i < history.length; i++){
			hlist.push('<li><a href="javascript:;">'+history[i]+'</a></li>');
		}
		$('.search-history ul').html(hlist.join(''));
		$('.all_shan, .search-history').show();
	}

	
	

	//清空
	$('.all_shan').bind('click', function(){
		utils.removeStorage(history_search);
		$('.all_shan, .search-history').hide();
		$('.search-history ul').html('');
	});
	
	
	
	
})

$('.textIn-box').submit(function(e){
	var keywords = $('#keywords').val(); 
	//记录搜索历史
	var history = utils.getStorage(history_search);
	history = history ? history : [];
	if(history && history.length >= 10 && $.inArray(keywords, history) < 0){
		history = history.slice(1);
	}
	// 判断是否已经搜过
	if($.inArray(keywords, history) > -1){
		for (var i = 0; i < history.length; i++) {
			if (history[i] === keywords) {
				history.splice(i, 1);
				break;
			}
		}
	}
	history.push(keywords);
	var hlist = [];
		for(var i = 0; i < history.length; i++){
			hlist.push('<li><a href="javascript:;">'+history[i]+'</a></li>');
		}
		$('.search-history ul').html(hlist.join(''));
		$('.all_shan, .search-history').show();

	utils.setStorage(history_search, JSON.stringify(history));
})

