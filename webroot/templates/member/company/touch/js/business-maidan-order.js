/**
 * 会员中心商家买单记录
 */

 var maidanOrderSummary = [];
 var atpage = 1, isload = false;

$(function(){

    //搜索我的订单
	$('.maidan-search form').submit(function(e){
		e.preventDefault();
		atpage = 1;
		getMonthData();
	})


    //获取月度汇总
	function getMonthData(){
        var data = [];
        var keyword = $('#keyword').val();
        data.push('u=1');
		data.push('keyword='+keyword);
		$.ajax({
			url: "/include/ajax.php?service=business&action=maidanOrderSummary",
			data: data.join('&'),
			type: "GET",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
                    
                    if(keyword){
                        $('#list').addClass('mtop').show();
                        $('.empty, .maidan-statistics').hide();
                    }else{
                        $('#list').removeClass('mtop');
                        $('#list, .maidan-statistics').show();
                        $('.empty').hide();
                    }

					maidanOrderSummary = data.info;
					getList1();
				}else{
                    $('#list').hide();
                    if(keyword){
                        $('.empty').addClass('mtop');
                        $('.maidan-statistics').hide();
                        $('.empty .download').hide();
                    }else{
                        $('.empty').removeClass('mtop');
                        $('.maidan-statistics, .empty .download').show();
                    }
                    $('.empty').show();
                }
			}
		});
	}
	getMonthData();

    // 下拉加载
    $(window).scroll(function() {
        var h = $('.item').height();
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w - h;
        if ($(window).scrollTop() > scroll && !isload && maidanOrderSummary) {
            atpage++;
            getList1();
        };
    });

});

//弃用
function getList(){}

//新版
function getList1(keyword){

    if(!maidanOrderSummary) return;

    isload = true;

    if(atpage == 1){
	    objId.html('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');
    }else{
        objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');
    }

    var keyword = $('#keyword').val();

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=business&action=maidanOrder&u=1&page="+atpage+"&pageSize="+pageSize+"&keyword="+keyword,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {

            objId.find('.loading').remove();

			if(data && data.state != 200){
				if(data.state == 101){
                    if(atpage == 1){
                        $('#list, .maidan-statistics').hide();
                        $('.empty').show();
                    }else{
					    objId.append("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
                    }
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

                    if(atpage == 1){
                        $("#predayMoney").text(parseFloat(pageInfo.preday.money).toFixed(2));
                        $("#curdayMoney").text(parseFloat(pageInfo.curday.money).toFixed(2));
                        $("#preMonMoney").text(parseFloat(pageInfo.preMon.money).toFixed(2));
                        $("#curMonMoney").text(parseFloat(pageInfo.curMon.money).toFixed(2));
                        $("#preMonCount").text(pageInfo.preMon.count);
                        $("#curMonCount").text(pageInfo.curMon.count);

                        totalCount = pageInfo.totalCount;
                    }

                    var msg = totalCount == 0 ? langData['siteConfig'][20][126] : langData['siteConfig'][20][185];

					//拼接列表
					if(list.length > 0){
                        isload = false;
						for(var i = 0; i < list.length; i++){

                            var html = [],html2=[];
							var item   = [],prev_time,prev_YM,next_YM,next_time,
                                ordernum   = list[i].ordernum,
                                time   = list[i].date,
                                xinke = list[i].xinke,
                                id   = list[i].id,
                                payamount   = list[i].payamount,
                                amount   = list[i].amount,
                                daozhang = parseFloat(list[i].daozhang).toFixed(2);

                            var url = orderdetailUrl + '?id=' + id;

							if(i>0){
								prev_time = list[i-1].date;
								prev_YM = (prev_time.split(' ')[0]).split('-')[0]+''+(prev_time.split(' ')[0]).split('-')[1];
							}
							if( i !=(list.length -1)){
								next_time = list[i+1].date;
								next_YM = (next_time.split(' ')[0]).split('-')[0]+''+(next_time.split(' ')[0]).split('-')[1];
							}

							var dYear = (time.split(' ')[0]).split('-')[0];//年份
							var dMonth = (time.split(' ')[0]).split('-')[1];//月份

							var YM = dYear+''+dMonth;
							var oldDate = $('dt[data-date="'+dYear+''+dMonth+'"]').length;//下一页数据加载判断月份是否存在

							//判断下一页第一条数据是不是已存在的月份
							// if(atpage >1){
								var tdate = (list[i].date.split(' ')[0]).split('-')[0]+''+(list[i].date.split(' ')[0]).split('-')[1];
								var oLen = $('dt[data-date="'+tdate+'"]').length;//
								if(oLen > 0){//月份已存在
									flag =1;
								}else{
									flag =0;
								}
							// }

							if((i==0 || (i!=0 && YM != prev_YM)) && oldDate==0){
								html.push('<dl>')
								html.push('<dt data-date="'+dYear+''+dMonth+'">');
								html.push('<div class="dm"><p class="month"><span>'+dYear+'年'+dMonth+'月</span> / '+maidanOrderSummary[dYear+'-'+dMonth]['count']+'条记录</p><div class="mtotal">合计收款'+maidanOrderSummary[dYear+'-'+dMonth]['daozhang']+''+echoCurrency('short')+'</div></div>');
								html.push('</dt>');
								if(atpage == 1 && i==0){
									//$('.yearly-time').val(dYear+'-'+dMonth);
			            		}
							}

                            var symbol = echoCurrency('symbol');
                            var usertype = xinke ? '<span class="new">(新客)</span>' : '<span class="old">(老客)</span>';
                            var day = (time.split(' ')[0]).split('-')[2]; //日
                            var hour = (time.split(' ')[1]).split(':')[0]; //时
                            var minute = (time.split(' ')[1]).split(':')[1]; //分
                            var datetime = dMonth + '/' + day + ' ' + hour + ':' + minute;
                            var daozhangArr = daozhang.split('.');
                            var daozhang = '<strong>' + daozhangArr[0] + '</strong><small>.' + daozhangArr[1] + '</small>';
                            var youhui = (amount - payamount).toFixed(2);
                            var youhuiHtml = '';
                            if(youhui > 0){
                                youhuiHtml = '&nbsp;&nbsp;优惠' + symbol + '' + youhui;
                            }

							if(flag ==1){//月份已存在
								
                                var dl = `
                                    <dd>
                                        <a class="item" href="${url}">
                                            <div class="mtop fn-clear">
                                                <label>账单</label>
                                                <span>${ordernum}</span>
                                                ${usertype}
                                                <span class="time">${datetime}</span>
                                            </div>
                                            <div class="mtxt fn-clear">
                                                <span>消费${symbol}${amount}${youhuiHtml}</span>
                                                <span class="amount">到账<small>${symbol}</small>${daozhang}</span>
                                            </div>
                                        </a>
                                    </dd>
                                `;
                                html2.push(dl);

							}else{
								var dl = `
                                    <dd>
                                        <a class="item" href="${url}">
                                            <div class="mtop fn-clear">
                                                <label>账单</label>
                                                <span>${ordernum}</span>
                                                ${usertype}
                                                <span class="time">${datetime}</span>
                                            </div>
                                            <div class="mtxt fn-clear">
                                                <span>消费${symbol}${amount}${youhuiHtml}</span>
                                                <span class="amount">到账<small>${symbol}</small>${daozhang}</span>
                                            </div>
                                        </a>
                                    </dd>
                                `;
                                html.push(dl);
							}

							if(flag ==1){//月份已存在
								objId.find('dl:last').append(html2.join(""));
							}

							if(( YM != next_YM && i !=(list.length -1))){
								html.push('</dl>');
								flag = 0;
							}

							if(flag ==0){//月份已存在
								objId.append(html.join(""));
							}

						}



					}else{
                        if(atpage == 1){
                            $('#list, .maidan-statistics').hide();
                            $('.empty').show();
                        }else{
						    objId.append("<p class='loading'>"+msg+"</p>");
                        }
					}
				}
			}else{
                if(atpage == 1){
                    $('#list, .maidan-statistics').hide();
                    $('.empty').show();
                }else{
				    objId.append("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
                }
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
	if(dateArr[0] == year){//今年
		if(dateArr[1] == month){//当月
			if(dateArr[2] == day){//今天
				return langData['siteConfig'][13][24];//今天
			}else{
				return dateArr[1]+'-'+dateArr[2]
			}
		}else{
			return dateArr[1]+'-'+dateArr[2]
		}

	}else{
		return strDate;
	}
}

// 判断时间
function judgeTime(time){
    var strtime = time.replace(/-/g, "/");//时间转换
    var endtime = "2021-07-13 00:00:00".replace(/-/g, "/");//时间转换
    //时间
    var date1=new Date(strtime);
    //现在时间
    var date2=new Date(endtime);
    //判断时间是否过期
    return date1>date2?true:false;
}