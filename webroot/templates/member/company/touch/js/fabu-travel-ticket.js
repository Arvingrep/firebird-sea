var flag ; //定义标识符，0为新增，1为修改


//错误提示
	var showErrTimer;
	function showErr(txt){
	    showErrTimer && clearTimeout(showErrTimer);
	    $(".popErr").remove();
	    $("body").append('<div class="popErr"><p>'+txt+'</p></div>');
	    $(".popErr p").css({"margin-left": -$(".popErr p").width()/2, "left": "50%"});
	    $(".popErr").css({"visibility": "visible"});
	    showErrTimer = setTimeout(function(){
	        $(".popErr").fadeOut(300, function(){
	            $(this).remove();
	        });
	    }, 1500);
	}
	


//增加景点特色
$('.add_feature .add_btn').click(function(){
	var len = $('.add_feature ul li').length;
	$('.add_feature ul').append('<li data-type = "'+(len)+'" ><input type="text" placeholder="'+langData['siteConfig'][7][0]+'" maxlength="4" name="feature"/><i class="del_label"></i></li>')//请输入
});

//删除景点特色
$('.add_feature').delegate('.del_label','click',function(){
	var len = $('.add_feature ul li').length;
	$(this).parents('li').remove();
});


//删除门票信息
$('.ticket_list').delegate('.delbtn','click',function(){
	$(this).parents('li').remove();
});


var opt1={};
    opt1.date = {preset : 'date'};
    opt1.datetime = {preset : 'datetime'};
    opt1.time = {preset : 'time'};
    opt1.default = {
        dateFormat:'yy-mm-dd',
        mode: 'scroller', //日期选择模式
        lang:'zh',
        minDate: new Date(),
        onCancel:function(){//点击取消按钮
                 
        },
       
    };
    var time = $.extend(opt1['date'], opt1['default']);
    $(".start_day").scroller($.extend(opt1['date'], opt1['default']));
	$(".end_day").scroller($.extend(opt1['date'], opt1['default']));
//	$(".end_day").live(scroller($.extend(opt1['date'], opt1['default'])))
	$(".end_day").delegate('scroller',function(){
		$.extend(opt1['date'], opt1['default']);
	})

$('.add_time').click(function(){
	var s_price = $('.s_price').val(),end_day = $('.end_day').val(),start_day = $('.start_day').val();
	
	if(s_price==''){
		showErr(langData['travel'][3][21]);//请输入此阶段的价格
		$('.s_price').focus();
		return 0;
	}else if(end_day=='' && start_day==''){
		showErr(langData['travel'][3][25]);//请选择特殊时间段
		return 0;
	};
	
	$('.special_list dt').after('<dd data-stime="'+start_day+'" data-etime="'+end_day+'" data-price="'+s_price+'" class="ticket_info"><div class="_left">'+start_day+((end_day!=''&&start_day!='')?'~':'')+end_day+'</div><div class="_right"><span class="price">'+echoCurrency('symbol')+'<em>'+s_price+'</em></span><a href="javascript:;"></a></div></dd>');
	$('.special_list').show();  //显示
	$('.s_price,.end_day,.start_day').val('');  //清空
})

//删除特殊时间

$('.special_list').delegate('a','click',function(){
	var len = $('.special_list').find('dd.ticket_info').length;
	$(this).parents('dd.ticket_info').remove();
	if(len<=1){
		$('.special_list').hide();
	}
});

//获取房间信息
$.ajax({
	url: '/include/ajax.php?service=travel&action=ticketDetail&id='+id,
	type: 'get',
	dataType: 'json',
	success: function(data){
		if(data && data.state == 100){
			var html = '', list = data.info.workArr;
			for (var i = 0; i < list.length; i++) {
				html += '<li class="ticket_info" data-id="'+list[i].id+'" data-info=\''+JSON.stringify(list[i].specialtime)+'\'><div class="d_btn"><a href="javascript:;"></a></div><div class="t_info"><p class="_left">'+list[i].title+'</p><p class="_right"><span class="price">'+echoCurrency('symbol')+'<em>'+list[i].price+'</em></span></p></div></li>';
			}
			$('.ticket_list ul').append(html);
		}
	}

});

//提交门票信息
var m = 0;
$('.tj_btn').click(function(){
	if(!flag){
		m++;
		var ticket_info = [];
		var type_tic = $('#type_ticket').val(),price_avg = $('#price_avg').val(), id = $('#ticketid').val();
		if(type_tic==''){
			showErr(langData['travel'][11][45]);//请输入门票名称
			return 0;
		}else if(price_avg==''){
			showErr(langData['travel'][3][26]);//请输门票的常价
			return 0;
		};
		
		$('.special_list dd').each(function(){
			var t = $(this), price = t.data('price'), stime = t.data('stime'), etime = t.data('etime');
			ticket_info.push({"price":price, "stime":stime, "etime":etime});
		});

		id = id!=0 && id!='' && id!=undefined && id!=null ? id : 'A' + m;

		if(id){
			$('.ticket_list ul li[data-id="'+id+'"]').remove();
		}
	
		$('.tictet_box').animate({'right':"-100%"},150);
		$('.ticket_list ul').append('<li class="ticket_info" data-id="'+id+'" data-info=\''+JSON.stringify(ticket_info)+'\'><div class="d_btn"><a href="javascript:;"></a></div><div class="t_info"><p class="_left">'+type_tic+'</p><p class="_right"><span class="price">'+echoCurrency('symbol')+'<em>'+price_avg+'</em></span></p></div></li>');

		$('.special_list .ticket_info').remove();
		$('.special_list').hide();  //显示
		$('#type_ticket,#price_avg').val('');
		$('#ticketid').val(0);

	}
	
});

//修改门票信息
$('.ticket_list ul').delegate('.t_info','click',function(){
	$('.tictet_box').animate({'right':0},150);
	var tictettitle = $(this).find('._left').text(),
		tictetprice = $(this).find('.price em').text(),
		special_day = $(this).parent('li').attr('data-info'),
		id = $(this).parent('li').attr('data-id');

	$('#type_ticket').val(tictettitle);
	$('#price_avg').val(tictetprice);
	$('#ticketid').val(id);


	if(special_day!=''){
		var specialtime = JSON.parse(special_day);
		if(specialtime.length>0){
			var list = '';
			for(var o in specialtime){
				list += '<dd data-stime="'+specialtime[o].stime+'" data-etime="'+specialtime[o].etime+'" data-price="'+specialtime[o].price+'" class="ticket_info"><div class="_left">'+specialtime[o].stime+((specialtime[o].etime!=''&&specialtime[o].stime!='')?'~':'')+specialtime[o].etime+'</div><div class="_right"><span class="price">'+echoCurrency('symbol')+'<em>'+specialtime[o].price+'</em></span><a href="javascript:;"></a></div></dd>';
			}
			$('.special_list dt').after(list);
			$('.special_list').show();  //显示
			$('.s_price,.end_day,.start_day').val('');  //清空
		}
	}
	//flag=1;
});

//增加门票信息
$('.info a.add_btn').click(function(){
	$('.tictet_box').animate({'right':0},150);
	
	flag=0;
});

//删除门票信息

$('.ticket_list').delegate('.ticket_info .d_btn','click',function(){
	$(this).parents('li.ticket_info').remove()
})
//返回
$('.top_return a').click(function(){
	$('.special_list .ticket_info').remove();
	$('.special_list').hide();  //显示
	$('#type_ticket,#price_avg').val('');
	$('#ticketid').val(0);
	$('.tictet_box').animate({'right':"-100%"},150);
})

//提交
$('#btn-keep').click(function(e){
	e.preventDefault();

	var t = $("#fabuForm"), action = t.attr("action"), url = t.attr("data-url");
	var addrid = 0, cityid = 0, r = true;

	var jingname = $('#jingname').val(),          //景点名称
		address = $('#address').val(),            //详细地址
		open_time = $('#open_time').val(),        //开放时间
		agency = $('#agency').val(),              //旅行社名称
		fee_content =$('#fee_content').text(),    //费用说明
		know_content = $('#know_content').text(); //购票须知


	if($('#fileList li.thumbnail').length<=0){
		r = false;
		showErr(langData['travel'][3][27]);//请至少上传一张图片
		return;
	}else if(jingname==''){
		r = false;
		showErr(langData['travel'][3][30]);//请输入景点名称
		return;
	}else if(address==''){
		r = false;
		showErr(langData['travel'][8][61]);//请输入详细地址
		return;
	}else if(open_time==''){
		r = false;
		showErr(langData['travel'][5][56]);//请输入开放时间
		return;
	}

	var ids = $('.gz-addr-seladdr').attr("data-ids");
	if(ids != undefined && ids != ''){
		addrid = $('.gz-addr-seladdr').attr("data-id");
		ids = ids.split(' ');
		cityid = ids[0];
	}else{
		r = false;
		showErr(langData['homemaking'][5][19]);  //请选择所在地
		return;
	}
	$('#addrid').val(addrid);
	$('#cityid').val(cityid);

	var pics = [];
	$("#fileList").find('.thumbnail').each(function(){
		var src = $(this).find('img').attr('data-val');
		pics.push(src);
	});
	$("#pics").val(pics.join(','));

	var video = [];
	$("#fileList2").find('.thumbnail').each(function(){
		var src = $(this).find('video').attr('data-val');
		video.push(src);
	});
	$("#video").val(video.join(','));

	//获取酒店特色
	var feature = [];
	$('.add_feature ul').find('li').each(function(){
		var t = $(this),val = t.find('input').val(), featureid = t.data('type');
		if(val!=''){
			feature.push(val);
		}
	})
	$("#shop_type").val(feature.join('|'));

	//获取门票信息
	var ticketlist = [],ticket_len = $('.ticket_list ul').find('li').length;
	if(ticket_len!=0){
		$('.ticket_list ul').find('li').each(function(){
			var d = $(this), id = d.attr('data-id'), title = d.find('._left').text(), price = d.find('._right .price em').text(), specialtime = d.attr('data-info');
			if(isNaN(id) || id == null || id == undefined){
				id = 0;
			}
			ticketlist.push({
				"id":id,
				"title":title,
				"price":price,
				"specialtime":specialtime
			});
		});
	}

	if(!r){
		return;
	}

	$("#btn-keep").addClass("disabled").html(langData['siteConfig'][6][35]+"...");	//提交中

	$.ajax({
		url: action,
		data: t.serialize() + "&ticketlist=" + JSON.stringify(ticketlist) + "&note=" + $("#know_content").html(),
		type: 'post',
		dataType: 'json',
		success: function(data){
			if(data && data.state == 100){
				var tip = langData['siteConfig'][20][341];
				if(id != undefined && id != "" && id != 0){
					tip = langData['siteConfig'][20][229];
				}
				location.href = url;
			}else{
				showErr(data.info);
				$("#btn-keep").removeClass("disabled").html(langData['marry'][2][58]);		//立即发布
			}
		},
		error: function(){
			showErr(langData['siteConfig'][6][203]);
		}
	})
		
})
	