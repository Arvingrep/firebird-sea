$(function(){

	var objId = $(".his-fb");
	getList();


	function transTimes(timestamp, n){
		
        const dateFormatter = huoniao.dateFormatter(timestamp);
        const year = dateFormatter.year;
        const month = dateFormatter.month;
        const day = dateFormatter.day;
        const hour = dateFormatter.hour;
        const minute = dateFormatter.minute;
        const second = dateFormatter.second;
        
		if(n == 1){
			return (month+'-'+day+' '+hour+':'+minute);
		}else{
			return 0;
		}
	}

	//活动列表
	function getList(){

		$.ajax({
			url: masterDomain+"/include/ajax.php?service=huodong&action=hlist&uid="+id+"&pageSize=9999",
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state != 200){
					if(data.state == 101){
						objId.html("<div class='loading'>暂无活动信息！</div>");
					}else{
						var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

						//拼接列表
						if(list.length > 0){
							for(var i = 0; i < list.length; i++){
								var title    = list[i].title,
									litpic   = list[i].litpic,
									began    = list[i].began,
									addrname = list[i].addrname,
									address  = list[i].address,
									reg      = list[i].reg,
									click    = list[i].click,
									pubdate  = huoniao.transTimes(list[i].pubdate, 1),
									url      = list[i].url,
									feetype  = list[i].feetype;

								html.push('<li class="first fn-clear">');

								if(i == 0){
									html.push('<div class="ff"><p></p><i>'+addDateInV1_2(pubdate.split(' ')[0])+'</i></div>');
								}else{
									if(pubdate.split(' ')[0] != huoniao.transTimes(list[i-1].pubdate, 1).split(' ')[0]){
										html.push('<div class="ff"><p></p><i>'+addDateInV1_2(pubdate.split(' ')[0])+'</i></div>');
									}
								}

								html.push('<div class="first-txt">');
								html.push('<div class="first-txt-1">');
								html.push('<a href="'+url+'" target="_blank">');

								if(feetype == 1){
									html.push('<img src="'+templatePath+'images/pay_icon.png" class="img-1">');
								}
								html.push('<img src="'+litpic+'" class="img-2">');
								html.push('<div class="first-main">');
								html.push('<p>'+title+'</p>');
								html.push('<div class="main-time">');
								html.push('<em><img src="'+templatePath+'images/icon_time.png">'+transTimes(began, 1)+'</em>');
								html.push('<em><img src="'+templatePath+'images/icon_addr.png">'+addrname[0]+' '+addrname[1]+' '+address+'</em>');
								html.push('</div>');
								html.push('<div class="main-b">');
								html.push('<b><span>'+reg+'</span>报名 | <span>'+click+'</span>浏览</b>');
								html.push('</div>');
								html.push('</div>');
								html.push('</a>');
								html.push('</div>');
								html.push('</div>');

								html.push('</li>');

							}

							objId.html('<ul><li class="dd-d"><img src="'+templatePath+'images/xuhaoBj24_2.png"></li>'+html.join("")+'</ul>');

						}else{
							objId.html("<div class='loading'>暂无相关信息！</div>");
						}

					}
				}else{
					objId.html("<div class='loading'>暂无相关信息！</div>");
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
			return "今天";
		}else{
			return monthTmp + "月" + tmp + "日";
		}
	}

})
