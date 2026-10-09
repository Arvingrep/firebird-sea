/**
 * 会员中心家政服务人员
 * 
 */

var objId = $("#list");
$(function(){

	//开始时间
	$(".form_datetime #startTime").datetimepicker({
		minView: 2,//设置只显示到月份
		format: 'yyyy-mm-dd',
		linkFormat: 'yyyy-mm-dd',
		autoclose: true,
		language: 'ch',
		todayBtn: true,
		minuteStep: 15,
		endDate:new Date(),
		linkField: "startTime",
	})
	//结束时间
	$(".form_datetime #endTime").datetimepicker({
		minView: 2,//设置只显示到月份
		format: 'yyyy-mm-dd',
		linkFormat: 'yyyy-mm-dd',
		autoclose: true,
		language: 'ch',
		todayBtn: true,
		minuteStep: 15,
		endDate:new Date(),
		linkField: "endTime",
	})

	$('.tjfilter .searTj').click(function(){
		var stime = $('#startTime').val(),etime = $('#endTime').val();
		if(!stime){
			$.dialog.alert('请选择开始时间');
			return false;
		}else if(!etime){
			$.dialog.alert('请选择开始时间');
			return false;
		}else{
			var sdate = new Date(stime),sdate1=sdate.getTime()/1000;
			var edate = new Date(etime),edate1=edate.getTime()/1000;
			if(edate<sdate){
				startval = etime;
				endval   = stime;
			}else{
				startval = stime;
				endval   = etime;
			}
			data = {
				'ftime':startval,
				'etime':endval,
			}
			getresult(data);

		}
	})
	dateToStr(new Date()); //初始化时间
	// 时间转换
	function dateToStr(datetime) {
		var year = datetime.getFullYear();
		var month = datetime.getMonth() + 1; //js从0开始取 
		var date = datetime.getDate();
		var hour = datetime.getHours();
		var minutes = datetime.getMinutes();
		var second = datetime.getSeconds();
	
		if (month < 10) {
			month = "0" + month;
		}
		if (date < 10) {
			date = "0" + date;
		}
		if (hour < 10) {
			hour = "0" + hour;
		}
		if (minutes < 10) {
			minutes = "0" + minutes;
		}
		if (second < 10) {
			second = "0" + second;
		}
	
		var time = year + "-" + month + "-" + date;
	
		$('#endTime').val(time);
		$("#startTime").val(year + "-" + month + "-1");
		var data = {
			"ftime": year + "-" + month + "-1",
			"etime": time
		}
		getresult(data);  //初始化加载
		return time;
	}



});

function getresult(data){

	$('.main').animate({scrollTop: 0}, 300);

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();

	var url = "/include/ajax.php?service=homemaking&action=orderList&state=11&dispatchid="+dispatchid+"&model=1&page="+atpage+"&pageSize="+pageSize;
	$.ajax({
		url: url,
		data:data,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+data.info+"</p>");
				}else{
					var list = data.info.coutresult, html = [],count = 0,coutnum = 0;

					//拼接列表
					if(list.length > 0){

						html.push('<table><thead><tr><td class="fir"></td>');
						html.push('<td style="width:24%">项目</td>');
						html.push('<td>'+langData['siteConfig'][19][311]+'</td>');//数量
						html.push('<td>'+langData['siteConfig'][19][360]+'</td>');//金额
			
						html.push('</tr></thead>');

						for(var i = 0; i < list.length; i++){
							var item      = [],
									id        =	 list[i].id,
									title    = list[i].title,
									litpic    = list[i].litpic,
									follow   = list[i].follow,
									num   = list[i].num,
									yuyue   = list[i].yuyue;
							html.push('<tr data-id="'+id+'"><td class="fir"></td>');
							html.push('<td><div class="left_b"><a href="javascript:;"><img src="'+(litpic?litpic:"/static/images/404.jpg")+'" alt=""></a></div><h2 class="uname"><a href="javascript:;">'+title+'</a></h2></td>');
							html.push('<td>x'+num+'</td>');
							html.push('<td>'+echoCurrency('symbol')+(Number(yuyue)+Number(follow))+'</td>');
							html.push('</tr>');
							count = count + Number(yuyue)+Number(follow);
							coutnum +=  Number(num);
							$('.tjAllprice strong').text(count);
							$('.tjNum em').text(coutnum+"单")


						}

						objId.html(html.join("")+"</table>");

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
					}

					totalCount = 10;
					
					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
