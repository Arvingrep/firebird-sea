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
// 侧边栏点击字幕条状
    var navBar = $(".navbar");
    navBar.on("touchstart", function (e) {
        $(this).addClass("active");
        $('.letter').html($(e.target).html()).show();


        var width = navBar.find("li").width();
        var height = navBar.find("li").height();
        var touch = e.touches[0];
        var pos = {"x": touch.pageX, "y": touch.pageY};
        var x = pos.x, y = pos.y;
        console.log($(this));
        $(this).find("li").each(function (i, item) {
            var offset = $(item).offset();
            var left = offset.left, top = offset.top;
            if (x > left && x < (left + width) && y > top && y < (top + height)) {
                var id = $(item).find('a').attr('data-id');
                console.log(id);
                var cityHeight = $('#'+id).offset().top + $('.area_list').scrollTop();
                if(cityHeight>45){
                    $('.area_list').scrollTop(cityHeight-45);
                    $('.letter').html($(item).html()).show();
                }

            }
        });
    });

    navBar.on("touchmove", function (e) {
        e.preventDefault();
        var width = navBar.find("li").width();
        var height = navBar.find("li").height();
        var touch = e.touches[0];
        var pos = {"x": touch.pageX, "y": touch.pageY};
        var x = pos.x, y = pos.y;
        $(this).find("li").each(function (i, item) {
            var offset = $(item).offset();
            var left = offset.left, top = offset.top;
            if (x > left && x < (left + width) && y > top && y < (top + height)) {
                var id = $(item).find('a').attr('data-id');
                console.log(id)
                var cityHeight = $('#'+id).offset().top + $('.area_list').scrollTop();
                if(cityHeight>45) {
                    $('.area_list').scrollTop(cityHeight - 45);
                    $('.letter').html($(item).html()).show();
                }
            }
        });
    });


    navBar.on("touchend", function () {
        $(this).removeClass("active");
        $(".letter").hide();
    });
    
//目的地选择
$('.chose_area').click(function(){
	$('.mask0').show();
	$('.areaBox').animate({"right":0},150);
	$('.chosecontent').removeClass('chosing');
	$('.mask').hide();
})
$('.goback,.mask0').click(function(){
	$('.mask0').hide();
	$('.areaBox').animate({"right":'-85%'},150)
});
//热门国家选择
$('.hot_country').delegate('dd','click',function(){
	$(this).addClass('c_chose').siblings('dd').removeClass('c_chose');
	$('.zm dd').removeClass('z_chose');
	$('.mask0').hide();
	$('.areaBox').animate({"right":'-85%'},150);
	$('#dest').val($(this).text());
	$('#country').val($(this).attr('data-id'));
	//筛选数据
});

$('.zm').delegate('dd','click',function(){
	$(this).addClass('z_chose').siblings('dd').removeClass('z_chose');
	$('.hot_country dd').removeClass('c_chose');
	$('.mask0').hide();
	$('.areaBox').animate({"right":'-85%'},100);
	$('#dest').val($(this).text());
	$('#country').val($(this).attr('data-id'));
	//筛选数据
});

//签证类型
function getType(){
	$.ajax({
		type: "POST",
		url: masterDomain + "/include/ajax.php?service=travel&action=visatype&value=1",
		dataType: "jsonp",
		success: function(res){
			if(res.state==100 && res.info){
				var visaSelect = new MobileSelect({
					trigger: '.visaselect ',
					title: langData['travel'][8][4],   //签证类型
					wheels: [
								{data:res.info}
							],
					position:[0, 0, 0],
					callback:function(indexArr, data){
						$('#category').val(data[0]['value']);
						$('#typeid').val(data[0]['id']);
					}
				   ,triggerDisplayData:false,
				});
			}
		}
	});
}

getType();

//选择材料类型
$('.fileBox').delegate('.chosebox dd','click',function(){
	var t = $(this),parent = t.parent('.chosebox'),r =[],t_chose = t.siblings('input[type=hidden]'),fileid = t.attr('data-id');
	t.toggleClass('on');
	parent.children('dd').each(function(){
		var d = $(this), id = d.attr('data-id'),typename=d.attr('data-name');
		if($(this).hasClass('on')){
			// r.push(id);
			r.push(typename);
		}
	});
	// t_chose.val(r.join(","));
	t_chose.val(r.join("|||"));
	
})

//添加流程
$('.addflow').click(function(){
	$(this).before('<dl class="flow"><dt><input type="text" placeholder="'+langData['travel'][11][27]+'"/></dt><dd class="text-content"><textarea placeholder="'+langData['travel'][11][25]+'"></textarea></dd><dd class="btn_group"><a href="javascript:;" class="up">'+langData['travel'][11][28]+'</a><a href="javascript:;" class="down">'+langData['travel'][11][29]+'</a><a href="javascript:;" class="del"></a></dd></dl>')
	//请输入标题----请输入内容---上移----下移
});

//删除其中一个流程
$('.flowBox').delegate('.flow .del','click',function(){
	var l = $('.flow').length;
	if(l==1){
		showErr(langData['travel'][7][59]);//'不能在减少了'
		return 0;
	}
	$(this).parents('.flow').remove();
});

//上移
$('.flowBox').delegate('.flow .up','click',function(){
	var parent = $(this).parents('.flow') ;
	parent.prev('.flow').before(parent.clone());
	$(this).parents('.flow').remove();
	
});

//下移
$('.flowBox').delegate('.flow .down','click',function(){
	var parent = $(this).parents('.flow') ;
	parent.next('.flow').after(parent.clone());
	$(this).parents('.flow').remove();
	
});


//时间选择器
    var opt={};
    opt.date = {preset : 'date'};
    opt.datetime = {preset : 'datetime'};
    opt.time = {preset : 'time'};
    opt.default = {
        dateFormat:'yy-mm-dd',
        mode: 'scroller', //日期选择模式
        lang:'zh',
        minDate: new Date(),
        onCancel:function(){//点击取消按钮
                 
        },
        onSelect:function(valueText,inst){//点击确定按钮
            $('#depart_date').val(valueText)
            
			
        },
    };
    var time = $.extend(opt['date'], opt['default']);
    $(".chose_date").scroller($.extend(opt['date'], opt['default']));
    

//提交数据
$('#btn-keep').click(function(e){
	e.preventDefault();

	var t = $("#fabuForm"), action = t.attr("action"), url = t.attr("data-url");
	var r = true;

	var dest = $('#dest').val(),      //选择目的地
	    category = $('#category').val(),   //签证类型
	    price_area = $('#price_area').val(),   //价位
	    times = $('#times').val(),    //签证次数
	    days = $('#days').val(),    //停留天数
	    depart_date = $('#depart_date').val(),   //最早出发时间
	    edate = $('#edate').val(),      //有效时间
	    handle_len = $('#handle_len').val(),  //办理时长
	    title_visa = $('#title_visa').val(),    //签证标题
	    second_title = $('#second_title').val(),  //副标题
	    sl_area = $('#sl_area').val(),  //受理范围
	    dj_file = $('#dj_file').val(),    //递交材料
	    service = $("#service").val(),    //服务包含
	    tip = $('#tip').val(),    //重要提醒
		know = $('#know').val();   //签证须知
		
	if($('#fileList li.thumbnail').length<=0){
		r = false;
		showErr(langData['travel'][3][27]);   //请至少上传1张图片
		return;
	}else if(dest==''){
		r = false;
		showErr(langData['travel'][8][78]);//请选择目的地
		return;
	}else if(category==''){
		r = false;
		showErr(langData['travel'][8][70]);  //请选择签证类型
		return;
	}else if(times==''){
		r = false;
		showErr(langData['travel'][8][71]);//请输入签证次数
		return;
	}else if(days==''){
		r = false;
		showErr(langData['travel'][8][72]);//请输入停留天数
		return;
	}else if(depart_date==''){
		r = false;
		showErr(langData['travel'][8][73]);//请选择最早可预订时间
		return;
	}else if(edate==''){
		r = false;
		showErr(langData['travel'][8][74]);  //请输入有效时间
		return;
	}else if(handle_len==''){
		r = false;
		showErr(langData['travel'][8][75]);   //请输入办理时长
		return;
	}else if(title_visa==''){
		r = false;
		showErr(langData['travel'][11][27]);  //请输入标题
		return;
	}else if(sl_area==''){
		r = false;
		showErr(langData['travel'][8][76]);  //请输入受理范围
		return;
	}else if(service==''){
		r = false;
		showErr(langData['travel'][8][77]);   //请输入包含的服务内容
		return;
	}

	$("#others").val($("#addfiles").html());

	//流程
	var flow = [];    //流程
	$('.flowBox').find('.flow').each(function(){
		var d = $(this),index=d.index();
		var flow_tit = d.find('dt input').val(),flow_con = d.find('.text-content textarea').val();
		if(flow_tit !="" || flow_con !=''){
			flow.push(flow_tit+"$$$"+flow_con);
			// flow.push({"flow_tit":flow_tit,"flow_con":flow_con,"index":index})
		}
	});

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

	if(!r){
		return;
	}

	$("#btn-keep").addClass("disabled").html(langData['siteConfig'][6][35]+"...");	//提交中

	$.ajax({
		url: action,
		data: t.serialize() + "&processingflow="+flow.join("|||"),
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
	});

	
})
