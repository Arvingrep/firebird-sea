/**
 * 会员中心商家点评
 * by guozi at: 20170328
 */

var objId = $("#list"), isload = false, pageSize = 20, sdate = edate = 0;
$(function(){

    //时间区域
    var date = new Date();
    var optionSet2 = {
        opens: 'left',
        autoUpdateInput: true,
        autoApply: true,
        maxDate: date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate(),
        ranges: {
            '最近一周': [moment().subtract(6, 'days'), moment()],
            '最近一个月': [moment().subtract(29, 'days'), moment()],
            '本月': [moment().startOf('month'), moment().endOf('month')],
            '上个月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        },
        locale: {
            customRangeLabel: '选择日期'
        }
    };

    //清除日期
    $('.ditem s').bind('click', function(){
        $('#sDate').html('日期<i></i>');
        $('.ditem').removeClass('active');
        sdate = 0;
        edate = 0;
        atpage = 1;
        getList(1);
    });

    //筛选日期
    $('#sDate').daterangepicker(optionSet2, function(start, end, label) {
        $('#sDate').html(start.format('YYYY-MM-DD') + ' - ' + end.format('YYYY-MM-DD'));
        $('.ditem').addClass('active');
        sdate = start.format('YYYY-MM-DD');
        edate = end.format('YYYY-MM-DD');
        $('#tjDate').html(sdate + ' 至 ' + edate);
        atpage = 1;
        getList(1);
    });

	getList(1);

    //平台佣金提示
    $('#list').delegate('.help-icon', 'hover', function(){
        console.log($(this).offset().top);
        $(this).siblings('.help-tips').toggle();
    }, function(){
        var right = $(this).parent().width() - $(this).position().left - 14;
        $(this).siblings('.help-tips').find('s').css('right', right + 'px');
        $(this).siblings('.help-tips').toggle();
    })

    //搜索
    $('#tjSearch').bind('click', function(){
        $(this).hide();
        $('#clearKeyword').show();
        atpage = 1;
        getList(1);
    });

    $('#keyword').bind('input', function(){
        $('#tjSearch').show();
        $('#clearKeyword').hide();
    });

    //清除搜索
    $('#clearKeyword').bind('click', function(){
        $(this).hide();
        $('#tjSearch').show();
        $('#keyword').val('');
        atpage = 1;
        getList(1);
    });



});



function getList(is){

	if(isload) return;

	$('.main').animate({scrollTop: 0}, 300);

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();

    var keyword = $('#keyword').val();

    if(sdate && edate){
        $('.tj-normal').hide();
        $('.tj-filter').css('display', 'inline-block');
    }else{
        $('.tj-normal').show();
        $('.tj-filter').hide();
    }

	isload = true;
	$.ajax({
		url: masterDomain+"/include/ajax.php?service=business&action=maidanOrder&u=1&keyword="+encodeURIComponent(keyword)+"&starttime="+sdate+"&endtime="+edate+"&page="+atpage+"&pageSize=20",
		type: "GET",
		dataType: "jsonp",
		success: function (data) {

			// return;
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='empty'>没有相关记录</p>");
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

					//拼接列表
					if(list.length > 0){

                        //第一页输出统计数据
                        if(atpage == 1){
                            $('#curdayMoney').html(pageInfo.curday.money);
                            $('#curdayCount').html(pageInfo.curday.count);
                            $('#predayMoney').html(pageInfo.preday.money);
                            $('#predayCount').html(pageInfo.preday.count);
                            $('#curMonMoney').html(pageInfo.curMon.money);
                            $('#curMonCount').html(pageInfo.curMon.count);
                            $('#preMonMoney').html(pageInfo.preMon.money);
                            $('#preMonCount').html(pageInfo.preMon.count);
                            $('.totalCount').html(pageInfo.totalCount);
                            $('.totalAmount').html(pageInfo.totalAmount);
                        }

                        html.push('<table data-id="'+id+'" style="margin-top:0;border:none;"><col style="width:15%;"><col style="width:10%;"><col style="width:15%;"><col style="width:10%;"><col style="width:10%;"><col style="width:10%;"><col style="width:10%;"><col style="width:10%;"><col style="width:10%;"></colgroup>');
                        html.push('<tbody>');

						for(var i = 0; i < list.length; i++){
							var id           = list[i].id,
								ordernum     = list[i].ordernum,
								tg_yj        = list[i].tg_yj,
								amount       = list[i].amount,
								amount_alone = list[i].amount_alone,
								payamount    = list[i].payamount,
								paytype      = list[i].paytype,
								daozhang     = list[i].daozhang,
								xinke        = list[i].xinke,
                                yj_per       = list[i].yj_per,
                                pt_yj_per    = list[i].pt_yj_per,
								paydate      = huoniao.transTimes(list[i].paydate, 1);

							html.push('<tr>');
							html.push('<td class="nb">'+ordernum+'</td>');
							html.push('<td class="nb">'+paytype+'</td>');
							html.push('<td class="nb">'+paydate+'</td>');
							html.push('<td class="nb bl">'+amount+'</td>');

                            var sale = (amount - payamount).toFixed(2);
							html.push('<td class="nb">'+(sale > 0 ? sale : '-')+'</td>');
							html.push('<td class="nb">'+(amount_alone > 0 ? amount_alone : '-')+'</td>');
							html.push('<td class="nb">'+payamount+'</td>');
							html.push('<td class="nb bl">'+(tg_yj > 0 ? tg_yj + ((xinke ? '&nbsp;<font color="#FF8C00">(新客' : '&nbsp;<font color="#808080">(老客') + yj_per + '%)</font>') : '-')+'</td>');
							html.push('<td class="nb bl">'+daozhang+(pt_yj_per ? '<i class="help-icon"></i><span class="help-tips"><s></s>最后实收款将扣除平台手续费'+pt_yj_per+'%</span>' : '')+'</td>');
							html.push('</tr>');

						}

                        html.push('</tbody>');
						objId.html(html.join(""));

					}else{
						objId.html("<p class='empty'>没有相关记录</p>");
					}

					totalCount = pageInfo.totalCount;

					showPageInfo();

				}
			}else{
				objId.html("<p class='empty'>没有相关记录</p>");
			}

			isload = false;

		}
	});
}
