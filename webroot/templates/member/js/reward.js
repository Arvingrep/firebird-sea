/**
 * 会员中心交易明细
 * by guozi at: 20151109
 */

var objId = $("#list");
var currYear = (new Date()).getFullYear();
$(function(){
	//当前月份

    var currMonth = (new Date()).getMonth() + 1;
    currMonth = currMonth < 10 ? '0'+currMonth : currMonth;
    var activeDate = currYear+'-'+currMonth;
    // $('.monthC').attr('data-date',activeDate);

	var joinYear = joinDate.split('-')[0];//成为合伙人的年份
    var joinMonth = joinDate.split('-')[1];//成为合伙人的月份

    //收入来源 类型 金额
    $('.sameChose .comX').click(function(){
    	var par = $(this).closest('.sameChose')
    	var index = par.index();
    	if(!par.hasClass('click')){
    		$('.sameChose').removeClass('click');
    		par.addClass('click');
    		$('.comWrap').removeClass('show');
    		par.find('.comWrap').addClass('show');

    		if(index == 0){//展开日历
				nowM();
				$('.fakeMask').show();
    		}
    	}else{
    		par.removeClass('click');
    		par.find('.comWrap').removeClass('show');
    		if(index == 0)
    		$('.fakeMask').hide();
    	}
    	$('.tipI').removeClass('click');
    	$('.tipCon').hide();
    })




    function nowM(){//已选择的年月
    	var hasD = $('.monthC').attr('data-date');
        var hasY,hasM;
        if(hasD ==' '){
            hasY = currYear;
            hasM = currMonth;
        }else{
            hasY = hasD.split('-')[0];
            hasM = hasD.split('-')[1];
        }
    	$('.dateTop h2').text(hasY ? hasY : (new Date()).getFullYear());
        //年份加减箭头
        $('.dateTop a.minusDate,.dateTop a.addDate').removeClass('disabled')
    	if(hasY == joinYear){
			monthSt(2);
            $('.dateTop a.minusDate').addClass('disabled');
    	}else if(hasY == currYear){
			monthSt(1);
            $('.dateTop a.addDate').addClass('disabled');
    	}
    	$('.dateCon li a').removeClass('curr');
    	$('.dateCon li a[data-id="'+hasM+'"]').addClass('curr');

    }

    function monthSt(str){
		$('.dateCon li a').each(function(){
	    	var tid = $(this).attr('data-id');

	    	if(str == 1){//当年当月添加样式
				if(tid > currMonth){
		    		$(this).addClass('disabled');
		    	}

	    	}else{//成为合伙人之前年月样式
				if(tid < joinMonth){
		    		$(this).addClass('disabled');
		    	}
	    	}
	    })
    }


    // 年份切换
    //年份减
    $('.dateTop .minusDate').click(function(){
    	if(!$(this).hasClass('disabled')){
    		var nowYear = $('.dateTop h2').text();
    		var prevYear = nowYear - 1;
    		$('.dateTop h2').text(prevYear);
    		if(joinYear == prevYear){//加入之前不显示
    			$(this).addClass('disabled');
    			monthSt(2);
    		}else{
    			$('.dateCon li a').removeClass('disabled curr');
    		}
    		$('.dateTop a.addDate').removeClass('disabled');

    	}

    })

    //年份加
    $('.dateTop .addDate').click(function(){
    	if(!$(this).hasClass('disabled')){
    		var nowYear = $('.dateTop h2').text();
    		var nextYear = Number(nowYear*1 + 1);
    		$('.dateTop h2').text(nextYear);
    		if(nextYear == currYear){
    			$(this).addClass('disabled');
    			monthSt(1);
    		}else{
    			$('.dateCon li a').removeClass('disabled curr');
    		}
    		$('.dateTop a.minusDate').removeClass('disabled');

    	}

    })

    //选择月份
    $('.dateCon li a').click(function(){
    	if(!$(this).hasClass('disabled')){
    		var chooseY = $('.dateTop h2').text();
    		var chooseM = $(this).attr('data-id');
    		var chDate = chooseY+'-'+chooseM;
    		$('.monthC').attr('data-date',chDate);
    		$('.monthC span').text(chDate);
    		$('.sameChose').removeClass('click');
    		$('.comWrap').removeClass('show');
    		$('.fakeMask').hide();
    		getList();
    	}
    })

    //查看全部
    $('.dateCon h3.seeAll').click(function(){
        $('.monthC').attr('data-date','');
        $('.monthC span').text('全部时间');
        $('.sameChose').removeClass('click');
        $('.comWrap').removeClass('show');
        $('.fakeMask').hide();
        getList();
    })
    //关闭弹出
    $('.fakeMask').click(function(){
    	$('.sameChose').removeClass('click');
    	$('.comWrap').removeClass('show');
    	$('.fakeMask').hide();
    })

    //收入提示
    $('.tipI').click(function(){
    	$('.sameChose').removeClass('click');
    	$('.comWrap').removeClass('show');
    	if(!$(this).hasClass('click')){
    		$(this).addClass('click');
    		$('.tipCon').show();
    	}else{
    		$(this).removeClass('click');
    		$('.tipCon').hide();
    	}

    })
    //确定金额
    $("#price_sure").bind("click",function () {
        var price1 = $.trim($("#price1").val()) > 0 ? parseFloat($.trim($("#price1").val())) : 0,
        	price2 = $.trim($("#price2").val()) > 0 ? parseFloat($.trim($("#price2").val())) : 0;
        var price = [];
        if((price1 > 0 && price2 > 0) && (price2 > price1)){

        	$('.amoutMoney .comX span').html(echoCurrency('symbol')+price1+'~'+echoCurrency('symbol')+price2);
        	$('.amoutMoney').attr('data-id',price1+','+price2);

        }else if((price1 == '' || price1 == 0) && price2>0){

        	$('.amoutMoney .comX span').html(echoCurrency('symbol')+price2+'以下');
			$('.amoutMoney').attr('data-id',' ,'+price2);

        }else if((price2 == '' || price2 == 0) && price1>0){

        	$('.amoutMoney .comX span').html(echoCurrency('symbol')+price1+'以上');
        	$('.amoutMoney').attr('data-id',price1+', ')
        }else{

			$('.amoutMoney .comX span').html('金额');
			$('.amoutMoney').attr('data-id',' ')
        }
        $('.amoutMoney').removeClass('click');
        $('.amoutMoney .comWrap').removeClass('show');
        getList();

    });

    //来源 类型选择
    $('.sameList li').click(function(){
    	var par = $(this).closest('.sameChose')
    	if(!$(this).hasClass('curr')){

    		$(this).addClass('curr').siblings('li').removeClass('curr');
    		var orId = $(this).find('a').attr('data-id'),txt = $(this).find('a').text();
    		par.attr('data-id',orId);
    		par.find('.comX span').text(txt);
    		par.find('.comWrap').removeClass('show');
    		atpage = 1;
    		getList();
    	}
    	$('.sameChose').removeClass('click');
    	par.find('.comWrap').removeClass('show');
    })


	getList(1);
});

function getList(is){

	if(is != 1){
		$('html, body').animate({scrollTop: $(".dsTitle").offset().top}, 300);
	}

	objId.html('<tr><td colspan="4"><p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p></td></tr>');//加载中，请稍候
	var activeDate = $('.monthC').attr('data-date'),
	 	soure = $('.incomeSor').attr('data-id'),
	 	type = $('.incomeType').attr('data-id'),
	 	price = $.trim($('.amoutMoney').attr('data-id'));
	var data = [];
	data.push('page='+atpage);
	data.push('pageSize='+pageSize);
	data.push('date='+(activeDate ? activeDate : ''));
	data.push('soure='+(soure ? soure : ''));
	data.push('type='+(type ? type : ''));
	data.push('price='+(price ? price :''));

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=member&action=reward",
		type: "GET",
		data: data.join('&'),
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<tr><td colspan='4'><p class='loading'>"+langData['siteConfig'][20][126]+"</p></td></tr>");  //暂无相关信息！
					$('#allMoney').html(0)
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

					//拼接列表
					if(list.length > 0){
						//var allMoy = pageInfo.totalMoney;
						//$('#allMoney').html(allMoy);
						var allamount = 0;
						for(var i = 0; i < list.length; i++){
							var item   = [],
									title  = list[i].title,
									url    = list[i].url,
									user   = list[i].user,
									amount = list[i].amount,
									date   = list[i].date;
									type   = list[i].type;
									reward_userid   = list[i].reward_userid;
									allamount += amount *1;
							var d = date.split(' '),da = d[0].split('-'),dateYear = da[0];
							var date2 = currYear == dateYear ? date.replace(currYear+'-',' '):date;
							// 打赏来的 dsImg 礼物来的giftImg
							var typeclass = '';
							typeclass = type ==0 ? 'dsImg' : 'giftImg' ;
							html.push('<tr><td class="sped"><span class="'+typeclass+'"></span>'+(reward_userid > 0 ? ('<a href="/user/'+reward_userid+'" target="_blank">'+user+'</a>') : user)+'</td><td class="dated">'+date2+'</td><td class="deCon" style="color: #999;">'+(url ? '<a href="'+url+'" target="_blank">'+title+'</a>' : title)+'</td><td>'+echoCurrency('symbol')+amount+'</td></tr>');
						}
						$("#allMoney").html(allamount.toFixed(2));
						objId.html(html.join(""));

					}else{
						$('#allMoney').html(0)
						objId.html("<tr><td colspan='4'><p class='loading'>"+langData['siteConfig'][20][126]+"</p></td></tr>");//暂无相关信息！
						$(".pagination").hide();
					}

					totalCount = pageInfo.totalCount;
					showPageInfo();
				}
			}else{
				$('#allMoney').html(0)
				$(".pagination").hide();
				objId.html("<tr><td colspan='4'><p class='loading'>"+langData['siteConfig'][20][126]+"</p></td></tr>");//暂无相关信息！
			}
		}
	});
}

function addDateInV1_2(strDate){
	var d = new Date();
	var day = d.getDate();
	var month = d.getMonth() + 1;
	var year = d.getFullYear();
	var dateArr = strDate.split('-');
	var tmp;
	var monthTmp;
	if(dateArr[2].charAt(0) == '0'){
		tmp = dateArr[2].substr(1);
	}else{
		tmp = dateArr[2];
	}
	if(dateArr[1].charAt(0) == '0'){
		monthTmp = dateArr[1].substr(1);
	}else{
		monthTmp = dateArr[1];
	}
	if(day == tmp && month == monthTmp && year == dateArr[0]){
		return langData['siteConfig'][13][24];   //今天
	}else{
		return dateArr[0] + langData['siteConfig'][13][14] + monthTmp + langData['siteConfig'][13][18] + tmp + langData['siteConfig'][13][25];
		//年--月--日
	}
}
