$(function(){
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

//单选框切换
$('.right_value .active').click(function(){
	var val = $(this).children('a').attr('data-id');
	$(this).addClass('chose_btn').siblings('.active').removeClass('chose_btn');
	$(this).siblings('input[type="hidden"]').val(val)
});

//新增房源特色
$('.add_feature .add_btn').click(function(){
	var t = $(this),l = $('.add_feature ul').find('li').length;
	t.siblings('ul').append('<li data-id="'+l+'"><input type="text" placeholder="请输入"><i class="del_label"></i></li>');
	
});

//房源特色删除
$('.add_feature').delegate('.del_label','click',function(){
	$(this).parent('li').remove();
});

//房间信息删除
$('.room_list').delegate('.delbtn','click',function(){
	var t = $(this);
	var id = t.parent().attr("data-id");
	if(id.indexOf("A")==-1){
		$.ajax({
			url: '/include/ajax.php?service=travel&action=operHotel&oper=delhotelroom&id='+id,
			type: 'post',
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
					t.parents('.room_info').remove();
				}else{
					showErr(data.info)
				}
			},
			error: function(){
				showErr(langData['siteConfig'][6][203]);
			}
		})
	}else{
		t.parents('.room_info').remove();
	}
		
	
	
});

//时间选择
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
//新增特殊时间
$('.add_time').click(function(){
	var s_price = $('.s_price').val(),end_day = $('.end_day').val(),start_day = $('.start_day').val();
	
	if(s_price==''){
		showErr(langData['travel'][3][24]);  //请输入此阶段的价格
		$('.s_price').focus();
		return 0;
	}else if(end_day=='' && start_day==''){
		showErr(langData['travel'][3][25]);//请选择特殊时间段
		return 0;
	};
	
	$('.special_list dt').after('<dd data-stime="'+start_day+'" data-etime="'+end_day+'" data-price="'+s_price+'" class="ticket_info"><div class="_left">'+start_day+((end_day!=''&&start_day!='')?'~':'')+end_day+'</div><div class="_right"><span class="price">'+echoCurrency('symbol')+'<em>'+s_price+'</em></span><a href="javascript:;"></a></div></dd>');
	$('.special_list').show();  //显示
	$('.s_price,.end_day,.start_day').val('');  //清空
});

//删除特殊时间

$('.special_list').delegate('a','click',function(){
	var len = $('.special_list').find('dd.ticket_info').length;
	$(this).parents('dd.ticket_info').remove();
	if(len<=1){
		$('.special_list').hide();
	}
});

//添加房间信息
var m = 0;
$('.tj_btn').click(function(){
	var bed,ifwin,ifood,room_info = [];
	var id = $('#roomid').val(),    //房间id
	roomname = $('#roomname').val(),    //房间名称
	roomarea = $('#roomarea').val(),   //房间大小
	win = $('#win').val(),     //是否有窗
	bed_c = $('#bed_c').val(),     //什么床型
	food = $('#food').val(),  //是否包含早餐
	roomprice = $('#roomprice').val();   //房间价格
	if(roomname==''){
		showErr(langData['travel'][3][36]);//请输入房间名
		return 0;
	}else if(roomprice==''){
		showErr(langData['travel'][3][35]);//请输入房间价位
		return 0;
	}
	
	if(bed_c =='0'){
		bed=langData['travel'][11][77];   //大床
	}else if(bed_c =='1'){
		bed=langData['travel'][11][79];   //双床
	}else if(bed_c =='2'){
		bed=langData['travel'][11][78];   //多床
	}
	if(win =='1'){
		ifwin=langData['travel'][11][74];//有窗
	}else if(win =='0'){
		ifwin=langData['travel'][11][75];//无窗
	}
	if(food =='0'){
		ifood=langData['travel'][11][82];//不含早餐
	}else if(food =='1'){
		ifood=langData['travel'][11][81];//含早餐
	}
	
	// 房间图片
	var roomImgPath = [];
	$(".imgDd #fileList1 .thumbnail").each(function(){
		var t = $(this);
		var imgPath = t.find('img').attr('data-val');
		roomImgPath.push(imgPath)
	})
	
	
	var priceinfoArr = [];
	$('.special_list dd').each(function(){
		var t = $(this), price = t.data('price'), stime = t.data('stime'), etime = t.data('etime');
		priceinfoArr.push({"price":price, "stime":stime, "etime":etime});
	});

	id = id!=0 && id!='' && id!=undefined && id!=null ? id : 'A' + m;

	if(id){
		$('.room_list ul li[data-id="'+id+'"]').remove();
	}
	var imgHtml = '';
	if(roomImgPath.length>0){
		imgHtml = '<div class="rimg" data-imgpath="'+(roomImgPath.join(','))+'"><img src="/include/attachment.php?f='+roomImgPath[0]+'"><span></span></div>';
		$(".imgDd #fileList1 .thumbnail").remove();
	}
	m = m + 1;
	var list = '<li class="room_info" data-id="'+id+'" data-info=\''+JSON.stringify(priceinfoArr)+'\'><div class="delbtn"><a href="javascript:;" ></a></div><div class="r_info">'+imgHtml+'<div class="_left"><h3>'+roomname+'</h3><p><span class="area">'+(roomarea!=''?'<em>'+roomarea+'</em>m<sup>2</sup>':'')+'</span><span class="if_win" data-value='+win+'>'+ifwin+'</span><span class="bed_c" data-value='+bed_c+'>'+bed+'</span><span class="if_food" data-value='+food+'>'+ifood+'</span></p><h4><span class="price">'+echoCurrency('symbol')+'<em>'+roomprice+'</em></span></h4></div></div></li>';

	$('.room_list ul').append(list);
	$('#roomname,#roomarea,#roomprice').val('');
	$('.ticket_info').remove();
	$('.special_list').hide();  //显示
	$('#win,#bed_c,#food').val(0);
	$('#roomid').val(0);
	$('.tictet_box .active').removeClass('chose_btn');
	$('.tictet_box .active').click();
	$('.tictet_box').animate({'right':'-100%'},150);
});

//打开维护房间信息页面
$('.intro a.add_btn').click(function(){
	$('.tictet_box').animate({'right':'0'},150);
});
//关闭维护页面
$('.top_return a').click(function(){
	$('.tictet_box').animate({'right':'-100%'},150);
	$('#roomname,#roomarea,#roomprice').val('');
	$('.ticket_info').remove();
	$('.special_list').hide();  //显示
	$('#win,#bed_c,#food').val(0);
	$('#roomid').val(0);
});

//修改房间信息
$('.room_list').delegate('.room_info .r_info','click',function(){
	$('.tictet_box').animate({'right':'0'},150);
	var roomname = $(this).find('h3').text(),
		roomprice = $(this).find('.price em').text(),
		roomarea  = $(this).find('.area em').text(),
		special_day = $(this).parent('li').attr('data-info'),
		id = $(this).parent('li').attr('data-id'),
		win = $(this).find('.if_win').attr('data-value') ,
		bed_c = $(this).find('.bed_c').attr('data-value') ,
		food = $(this).find('.if_food').attr('data-value') ,
		r_area = $(this).find('.area').attr('data-value') ,
		r_imgpath = $(this).find('.rimg').attr('data-imgpath');
	var imgpathArr = r_imgpath?r_imgpath.split(','):[];  //房间图片
	
	$('#roomname').val(roomname);
	$('#roomarea').val(r_area);
	$('#win').val(win);
	$('#bed_c').val(bed_c);
	$('#food').val(food);

	$('#roomprice').val(roomprice);
	$('#roomarea').val(roomarea);
	$('#roomid').val(id);

	var iswindow_type = $('.iswindow_type').siblings("#win").val();
	$('.iswindow_type').removeClass('chose_btn');
	$('.iswindow_type a[data-id="'+iswindow_type+'"]').parents('.iswindow_type').addClass('chose_btn');

	var room_type = $('.room_type').siblings("#bed_c").val();
	$('.room_type').removeClass('chose_btn');
	$('.room_type a[data-id="'+room_type+'"]').parents('.room_type').addClass('chose_btn');

	var breakfast_type = $('.breakfast_type').siblings("#food").val();
	$('.breakfast_type').removeClass('chose_btn');
	$('.breakfast_type a[data-id="'+breakfast_type+'"]').parents('.breakfast_type').addClass('chose_btn');
	
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
	
	// 房间图片
	var imgArr = []
	$("#fileList1 .thumbnail").remove()
	if(imgpathArr.length>0){
		imgpathArr.forEach(function(val,index){
			imgArr.push('<li id="WU_FILE_room_'+index+'" class="thumbnail complete"><img src="/include/attachment.php?f='+val+'" data-val="'+val+'"><div class="file-panel"><span class="cancel"></span></div></li>')
		})
		$("#fileList1").append(imgArr.join(''));
	}
});
getRoom();
//获取房间信息
async function getRoom(){
	let quest={
		service:'travel',
		action:'hotelDetail',
		id:id
	}
	let param={
		type:'GET',
		dataType:'json'
	}
	let data=await ajax(quest,param);
	if(data && data.state == 100){
		var html = '', list = data.info.workArr;
		for (var i = 0; i < list.length; i++) {
			var imgHtml = '';
			if(list[i].roomImgPath && list[i].roomImgPath.length>0){
				imgHtml = '<div class="rimg" data-imgpath="'+(list[i].roomImgPath.join(','))+'"><img src="/include/attachment.php?f='+list[i].roomImgPath[0]+'"></div>'
			}
			html += '<li class="room_info" data-id="'+list[i].id+'" data-info=\''+JSON.stringify(list[i].specialtime)+'\'><div class="delbtn"><a href="javascript:;"></a></div><div class="r_info">'+imgHtml+'<div class="_left"><h3>'+list[i].title+'</h3><p><span class="area"><em>'+list[i].area+'</em>m<sup>2</sup></span><span class="if_win" data-value="'+list[i].iswindow+'">'+list[i].iswindowname+'</span><span class="bed_c" data-value="'+list[i].typeid+'">'+list[i].typename+'</span><span class="if_food" data-value="'+list[i].breakfast+'">'+list[i].breakfastname+'</span></p><h4><span class="price">'+echoCurrency('symbol')+'<em>'+list[i].price+'</em></span></h4></div></div></li>';
		}
		$('.room_list ul').append(html);
	}
	
	let params = new URLSearchParams(location.search.slice(1));
	let urlState=params.get('scroll');
	if(urlState){
		$("html,body").scrollTop($('#intro').offset().top);
	}
}

//点击提交
$('#btn-keep').click(function(e){
	e.preventDefault();

	var t = $("#fabuForm"), action = t.attr("action"), url = t.attr("data-url");
	var addrid = 0, cityid = 0, r = true;

	var hotelname =$('#hotelname').val(),      //商铺名称
		addrid = $('#addrid').val(),           //城市id
		address = $('#address').val(),         //详细地址
		hotel_c = $('#hotel_c').val(),    	   //酒店类型
		price_area = $('#price_area').val();   //起步价格

	if($('#fileList li.thumbnail').length<=0){
		r = false;
		showErr(langData['travel'][3][27]);   //请至少上传1张图片
		return;
	}else if(hotelname=='' ||hotelname==undefined){
		r = false;
		showErr(langData['travel'][3][34]);//请输入商铺名称
		return;
	}else if(hotel_c==''){
		r = false;
		showErr(langData['travel'][3][38]);//请选择酒店类型
		return;
	}else if(address=='' ||address==undefined){
		r = false;
		showErr(langData['travel'][8][61]);//请输入详细地址
		return 0;
	}else if(price_area==''){
		r = false;
		showErr(langData['travel'][12][26]);//请输入服务时间
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

	//获取房间信息列表
	var roomlist = [],room_len = $('.room_list ul').find('li').length;
	if(room_len!=0){
		$('.room_list ul').find('li').each(function(){
			var d = $(this), name_r = d.find('h3').text(),
			if_win = d.find('span.if_win').attr('data-value'),
			bed_r = d.find('span.bed_c').attr('data-value'),
			if_food = d.find('span.if_food').attr('data-value'),
			area_r = d.find('span.area em').text(),
			specialtime = d.attr('data-info'),
			id = d.attr('data-id'),
			price_r = d.find('span.price em').text();
			imgpath = d.find('.rimg').attr('data-imgpath')
			if(isNaN(id) || id == null || id == undefined){
				id = 0;
			}
			id = id ? id : 0;
				roomlist.push({
				"id":id,
				"title":name_r,
				"area":area_r,
				"iswindow":if_win,
				"typeid":bed_r,
				"breakfast":if_food,
				"price":price_r,
				"specialtime":specialtime,
				"imgpath":imgpath,
				
			})
		});
	}

	if(!r){
		return;
	}

	$("#btn-keep").addClass("disabled").html(langData['siteConfig'][6][35]+"...");	//提交中

	$.ajax({
		url: action,
		data: t.serialize() + "&roomlist=" + JSON.stringify(roomlist),
		type: 'post',
		dataType: 'json',
		success: function(data){
			if(data && data.state == 100){
				var tip = langData['siteConfig'][20][341];
				if(id != undefined && id != "" && id != 0){
					tip = langData['siteConfig'][20][229];
				}
				showErr(tip);
				setTimeout(function(){
					location.href = url;
				}, 500);
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
})
