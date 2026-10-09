var huoniao_ = {
    
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

$(function(){
    //APP端取消下拉刷新
    toggleDragRefresh('off');

     //排序
     $('.choose_li li').click(function () {
        if($('.choose_order').hasClass('active')){
              $('.choose_order').removeClass('active')
              $('.mask').hide();
              $(this).removeClass('active');
        }else{
            $('.choose_order').addClass('active')
            $('.mask').show();
            $(this).addClass('active');
        }
    });

    var mask=$('.mask')
  
    $('#choose-info').delegate("li", "click", function(){
        var $t = $(this), id = $t.attr("data-id"), val = $t.html();
        $t.addClass('active').siblings().removeClass('active');
        $('.choose_li li').find('span').text(val);
        $('.choose_li li').removeClass('active')
        $('.choose_order').removeClass('active')
        $('.orderby').attr("data-id", id);
        mask.hide();
        page = 1;
        getList();
    });
  
    //点击小箭头 收起
    $('.sort').click(function () {
        $('#choose-info').removeClass('active')
        $('.mask').hide();
        $('.choose_li li').removeClass('active');
    });

    var	isload = false;

    var detailList;
	detailList = new h5DetailList();
	setTimeout(function(){detailList.removeLocalStorage();}, 500);

	var dataInfo = {
        id: '',
        url: '',
        orderby: '',
        orderbyname: '',
        class_num:'',
        isBack: true
    };

    $('.word-list').delegate('li', 'click', function(){
		var t = $(this), a = t.find('a'), url = a.attr('data-url'), typeid = $('.choose-tab .food').attr('data-id'),
				typename = $('.choose-tab .food span').text(), id = t.attr('data-id');

		var orderby     = $('.choose_order li.active').attr('data-id');
    var orderbyname = $('.choose_order li.active').text();
    var class_num = $(".class_num span").text();
		
		dataInfo.url = url;
    dataInfo.orderby = orderby;
    dataInfo.class_num = class_num;
		dataInfo.orderbyname = orderbyname;

		detailList.insertHtmlStr(dataInfo, $("#word").html(), {lastIndex: page});

		location.href = url;

    });

    //初始加载
	if($.isEmptyObject(detailList.getLocalStorage()['extraData']) || !detailList.isBack()){
		getList();
		window.addEventListener("mousewheel", (e) => {
			if (e.deltaY === 1) {
				e.preventDefault();
			}
		});
	}else {
		getData();
		setTimeout(function(){
			detailList.removeLocalStorage();
		}, 500)
	}
    
    function getList(){
		var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);
        
        $(".content_tab li").each(function(){
			if($(this).attr("data-type") != '' && $(this).attr("data-type") != null  && $(this).attr("data-id") != null){
				data.push($(this).attr("data-type") + "=" + $(this).attr("data-id"));
			}
		});

		isload = true;
        if(page == 1){
			$(".class_plan ul").html();
            $(".tip").html(langData['travel'][12][57]).show();
        }else{
            $(".tip").html(langData['travel'][12][57]).show();
		}

		$.ajax({
            url: masterDomain + "/include/ajax.php?service=education&action=wordList&"+data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
					var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    for (var i = 0; i < list.length; i++) {
                        html.push('<li>');
                        html.push('<a href="javascript:;" data-url="'+list[i].url+'">');
                        html.push('<div class="comp_content">');
                        html.push('<p class="com_name">'+list[i].title+'</p><p class="p2"><span class="month">'+huoniao_.transTimes(list[i].pubdate, 3)+'</span><span class="time_clock">'+huoniao_.transTimes(list[i].pubdate, 4)+'</span></p>');
                        html.push('</div>');
                        html.push('<div class="plan_time">');

                        html.push('<p><span>'+langData['education'][1][34]+'</span><span>'+list[i].subjects+'</span></p>');
                        html.push('<p><span>'+langData['education'][1][35]+'</span><span>'+list[i].price+echoCurrency('short')+langData['education'][7][20]+'</span></p>');
                        html.push('<p><span>'+langData['education'][1][36]+'</span><span>'+list[i].educationname+'</span></p>');
                        html.push('<p><span>'+langData['education'][1][37]+'</span><span>'+list[i].addrname[0]+list[i].addrname[1]+'</span></p>');
                        html.push('<p><span>'+langData['education'][1][38]+'</span><span>'+list[i].subjectstime+'</span></p>');
                        html.push('</div>');
                        html.push('</a>');
                        html.push('</li>');
					}
					if(page == 1){
                        $(".class_plan ul").html(html.join(""));
                    }else{
                        $(".class_plan ul").append(html.join(""));
                    }
                    isload = false;

                    if(page >= pageinfo.totalPage){
                        isload = true;
                        $(".tip").html(langData['travel'][0][9]).show();
                    }
				}else{
					if(page == 1){
                        $(".class_plan ul").html("");
                    }
					$(".tip").html(data.info).show();
				}
			},
            error: function(){
				isload = false;
				$(".class_plan ul").html("");
				$('.tip').text(langData['travel'][0][10]).show();//请求出错请刷新重试
            }
		});

	}

	//滚动底部加载
	$(window).scroll(function() {
        var allh = $('body').height();
        var w = $(window).height();
        var s_scroll = allh - 30 - w;
        if ($(window).scrollTop() > s_scroll && !isload) {
            page++;
            getList();
        };
	});
	
	// 本地存储的筛选条件
    function getData() {
        var filter = $.isEmptyObject(detailList.getLocalStorage()['filter']) ? dataInfo : detailList.getLocalStorage()['filter'];
		page = detailList.getLocalStorage()['extraData'].lastIndex;
		
        if (filter.orderbyname != '' && filter.orderbyname != null) {$('.orderby span').text(filter.orderbyname);}
        if (filter.class_num != '' && filter.class_num != null) {$('.class_num span').text(filter.class_num);}

        if (filter.orderby != '') {
            $('.orderby').attr('data-id', filter.orderby);
            $('.choose_order li[data-id="'+filter.orderby+'"]').addClass('active').siblings('li').removeClass('active');
		}
    }
    
});
