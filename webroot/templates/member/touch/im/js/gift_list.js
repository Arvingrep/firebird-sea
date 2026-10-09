

$(function(){
	gift_list();
//时间选择器
    var opt={};
    opt.date = {preset : 'date'};
    opt.default = {
        dateFormat:'yy-mm',
        mode: 'scroller', //日期选择模式
        lang:'zh',
        minDate:new Date(2010,0,1),
        maxDate: new Date(),
        onCancel:function(){//点击取消按钮

        },
        onSelect:function(valueText,inst){//点击确定按钮
            $(".time_chose").text(valueText);
            //数据筛选
            $('.gift_list ul').html('')
            gift_list()
        },
    };
    var time = $.extend(opt['date'], opt['default']);
    $(".time_chose").scroller($.extend(opt['date'], opt['default']));

//点击切换
$('body').delegate('.history_list','click',function(){
	if($(this).hasClass('curr_month')){
		$(this).removeClass('curr_month').text(langData['siteConfig'][46][51]);//查看历史
		//数据请求
		$('.time_chose').hide();
		$('.im-giftbrief_box').find('h1').html('<em>'+echoCurrency('symbol')+'</em>4500');
		$('.im-giftbrief_box').find('p').html(langData['siteConfig'][46][50]);//本月礼物总收益
	}else{
		var mydate = new Date();
		year = mydate.getFullYear();
		month = mydate.getMonth()+1;
		if(month<10){
			month='0'+month
		}
		$('.im-giftbrief_box').find('h1').html('<em>'+echoCurrency('symbol')+'</em>500000');
		$('.im-giftbrief_box').find('p').html(langData['siteConfig'][47][15]);//历史礼物总收益
		$(this).addClass('curr_month').text(langData['siteConfig'][47][14]);//查看本月
		$('.time_chose').show().text(year+'-'+month);

	}
});

$(window).scroll(function(){
	var allh = $('body').height();
	var w = $(window).height();
	var scroll = allh - w;
	if ($(window).scrollTop() >= scroll && !gift_load) {
	   gift_list()

	};
});

})
