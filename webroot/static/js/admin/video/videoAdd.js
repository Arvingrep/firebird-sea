var tp_ajax	, sp_ajax , pl_alax ;
var lpage = 0,  ltotalPage = 0, ltotalCount = 0, lload = false ;

$(function () {

    //填充城市列表
    huoniao.choseCity($(".choseCity"),$("#cityid"));
    $(".chosen-select").chosen();

	huoniao.parentHideTip();
	//下拉选择控件
	$(".chosen-select").chosen();
	$(".chosen-select1").chosen();

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	var init = {
		//菜单递归分类
		selectTypeList: function(){
			var typeList = [];
			typeList.push('<ul class="dropdown-menu">');
			typeList.push('<li><a href="javascript:;" data-id="0">选择分类</a></li>');

			var l=typeListArr.length;
			for(var i = 0; i < l; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower, cl = "";
					if(jArray.length > 0){
						cl = ' class="dropdown-submenu"';
					}
					typeList.push('<li'+cl+'><a href="javascript:;" data-id="'+jsonArray["id"]+'">'+jsonArray["typename"]+'</a>');
					if(jArray.length > 0){
						typeList.push('<ul class="dropdown-menu">');
					}
					for(var k = 0; k < jArray.length; k++){
						if(jArray[k]['lower'] != null){
							arguments.callee(jArray[k]);
						}else{
							typeList.push('<li><a href="javascript:;" data-id="'+jArray[k]["id"]+'">'+jArray[k]["typename"]+'</a></li>');
						}
					}
					if(jArray.length > 0){
						typeList.push('</ul></li>');
					}else{
						typeList.push('</li>');
					}
				})(typeListArr[i]);
			}

			typeList.push('</ul>');
			return typeList.join("");
		}
	};

	//平台切换
	$('.nav-tabs a').click(function (e) {
		e.preventDefault();
		var obj = $(this).attr("href").replace("#", "");
		if(!$(this).parent().hasClass("active")){
			$(".nav-tabs li").removeClass("active");
			$(this).parent().addClass("active");

			$(".nav-tabs").parent().find(">div").hide();
			cfg_term = obj;
			$("#"+obj).show();
		}
	});

	//填充栏目分类
	$("#typeBtn").append(init.selectTypeList());

	//二级菜单点击事件
	$("#typeBtn a").bind("click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
		$("#typeid").val(id);
		$("#typeBtn button").html(title+'<span class="caret"></span>');

		if(id != 0){
			$("#typeid").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}else{
			$("#typeid").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
		}
	});

	//表单验证
	$("#editform").delegate("input,textarea", "focus", function(){
		var tip = $(this).siblings(".input-tips");
		if(tip.html() != undefined){
			tip.removeClass().addClass("input-tips input-focus").attr("style", "display:inline-block");
		}
	});

	$("#editform").delegate("input,textarea", "blur", function(){
		var obj = $(this);
		huoniao.regex(obj);
	});

	$("#editform").delegate("select", "change", function(){
		if($(this).parent().siblings(".input-tips").html() != undefined){
			if($(this).val() == 0){
				$(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			}else{
				$(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
			}
		}
	});
	//模糊匹配会员
	$("#user").bind("input", function(){
		$("#userid").val("0");
		$("#userPhone").html("").hide();
		$("#album").html('<option value="0" ></option>');
		var t = $(this), val = t.val();
		if(val != ""){
			t.addClass("input-loading");
			huoniao.operaJson("../inc/json.php?action=checkUser", "key="+val, function(data){
				t.removeClass("input-loading");
				if(!data) {
					$("#userList, #userPhone").html("").hide();
					return false;
				}
				var list = [];
				for(var i = 0; i < data.length; i++){
					list.push('<li data-id="'+data[i].id+'" data-phone="'+data[i].phone+'">'+data[i].nickname+'</li>');
				}
				if(list.length > 0){
					var pos = t.position();
					$("#userList")
						.css({"left": pos.left, "top": pos.top + 36, "width": t.width() + 12})
						.html('<ul>'+list.join("")+'</ul>')
						.show();
				}else{
					$("#userList, #userPhone").html("").hide();
				}
			});

		}else{
			$("#userList, #userPhone").html("").hide();
		}
	});
	$("#userList").delegate("li", "click", function(){
		var name = $(this).text(), id = $(this).attr("data-id"), phone = $(this).attr("data-phone");
		$("#user").val(name);
		$("#userid").val(id);
		$("#userList").html("").hide();
		$("#userPhone").html("电话："+phone).show();
		$("#user").siblings(".input-tips").removeClass().addClass("input-tips input-ok");
		return false;
	});

	// if($("#userList").size() > 0){
	// 	$(document).click(function (e) {
	// 		var s = e.target;
	// 		if (!jQuery.contains($("#userList").get(0), s)) {
	// 			if (jQuery.inArray(s.id, "user") < 0) {
	// 				$("#userList").hide();
	// 			}
	// 		}
	// 		if (!jQuery.contains($("#userListP").get(0), s)) {
	// 			if (jQuery.inArray(s.id, "user") < 0) {
	// 				$("#userListP").hide();
	// 			}
	// 		}
	// 	});
	// }

	//来源、作者选择
	var editDiv;
	$(".chooseData").bind("click", function(){
		var type = $(this).attr("data-type"), title = "";
		if(type == "source"){
			title = "来源";
		}else if(type == "writer"){
			title = "作者";
		}
		$.ajax({
			url: "videoJson.php?action=chooseData",
			data: "type="+type,
			type: "POST",
			dataType: "json",
			success: function(data){
				var content = [], edit = [];
				for(var i = 0; i < data.length; i++){
					content.push('<a href="javascript:;">'+data[i]+'</a>');
					edit.push(data[i]);
				};
				editDiv = $.dialog({
					id: "chooseData"+type,
					fixed: false,
					lock: false,
					title: "选择"+title,
					content: '<div class="choose-data" data-type="'+type+'">'+content.join("")+'</div>',
					width: 360,
					button:[
						{
							name: '设置',
							callback: function(){
								$.dialog({
									id: "changeData"+type,
									title: "设置"+title,
									content: '<textarea id="changeData" style="width:95%; height:100px; padding:2%;">'+edit.join(",")+'</textarea>',
									width: 360,
									ok: function(){
										var val = self.parent.$("#changeData").val();
										$.ajax({
											url: "videoJson.php?action=saveChooseData",
											data: "type="+type+"&val="+val,
											type: "POST",
											dataType: "json",
											success: function(){}
										});
									},
									cancel: true
								});
							}
						}
					]
				});
			}
		});
	});

	//选择来源、作者
	self.parent.$(".choose-data a").live("click", function(){
		var type = $(this).parent().attr("data-type"), txt = $(this).text();
		$("#"+type).val(txt);
		try{
			$.dialog.list["chooseData"+type].close();
		}catch(ex){

		}
	});

	//配置站内链接
	$("#allowurl").bind("click", function(){
		$.ajax({
			url: "videoJson.php?action=allowurl",
			type: "POST",
			dataType: "html",
			success: function(data){
				$.dialog({
					id: "allowurlData",
					title: "配置站内链接",
					content: '<textarea id="allowurl" style="width:95%; height:100px; padding:2%;">'+data+'</textarea>',
					width: 360,
					ok: function(){
						var val = self.parent.$("#allowurl").val();
						$.ajax({
							url: "videoJson.php?action=saveAllowurl",
							data: "val="+val,
							type: "POST",
							dataType: "json",
							success: function(){}
						});
					},
					cancel: true
				});
			}
		});
	});

	$("#pubdate").bind("blur", function(){
		huoniao.resetDate($(this));
		return false;
	});

	//发布时间
	$(".form_datetime .add-on").datetimepicker({
		format: 'yyyy-mm-dd hh:ii:ss',
		autoclose: true,
		language: 'ch',
		todayBtn: true,
		minuteStep: 5,
		linkField: "pubdate"
	});

	$("#album").bind("click", function(){
		var uid = $('#userid').val();
		if($('#album').attr('data-uid') == uid){
			return false;
		}
		if(uid == '' ||uid == 0 ){
			$.dialog.alert('请先选择作者!');
			return false;
		}else{
			getAlbum(uid);
		}
	});

	function getAlbum(uid){
		huoniao.operaJson("videoAdd.php?dopost=getAlbum", "uid="+uid+"&videoid="+video, function(data){

			if(data != null && data.state == 100){
				$("#album").html(data.info);
				$("#album").attr('data-uid',data.uid);
				$("#categoryObj").show();
			}else{
				$("#album").html('<option value="0" >暂无</option>');
				$('#album').attr('data-uid','')
				$.dialog.alert('暂无数据!');
			}
		});
	}

	$(".color_pick").colorPicker({
		callback: function(color) {
			var color = color.length === 7 ? color : '';
			$("#color").val(color);
			$(this).find("em").css({"background": color});
		}
	});

	//跳转表单交互
	$("input[name='flags[]']").bind("click", function(){
		if($(this).val() == "t"){
			if(!$(this).is(":checked")){
				$("#rDiv").hide();
			}else{
				$("#rDiv").show();
			}
		}
	});

	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t            = $(this),
			id           = $("#id").val(),
			title        = $("#title"),
			subtitle     = $("#subtitle"),
			creturn      = $("input[type=checkbox][value=t]"),
			redirecturl  = $("#redirecturl"),
			weight       = $("#weight"),
			keywords     = $("#keywords"),
			description  = $("#description"),
			typeid       = $("#typeid"),
			tj           = true,
        	cityid       = $("#cityid").val();

        //城市
        if(cityid == '' || cityid == 0){
            $.dialog.alert('请选择城市');
            return false;
        };

		//标题
		if(!huoniao.regex(title)){
			tj = false;
			huoniao.goTop();
			return false;
		};

		//简略标题
		if($.trim(subtitle.val()) != ""){
			if(!huoniao.regex(subtitle)){
				tj = false;
				huoniao.goTop();
				return false;
			};
		}else{
			subtitle.siblings(".input-tips").removeClass().addClass("input-tips input-ok");
		}

		//分类
		if(typeid.val() == "" || typeid.val() == 0){
			typeid.siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			tj = false;
			huoniao.goTop();
			return false;
		}else{
			typeid.siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}

		//跳转
		if(creturn.is(":checked")){
			if(!huoniao.regex(redirecturl)){
				tj = false;
				huoniao.goTop();
				return false;
			};
		}

		//排序
		if(!huoniao.regex(weight)){
			tj = false;
			huoniao.goTop();
			return false;
		}

		//关键词
		if(keywords.val() != ""){
			if(!huoniao.regex(keywords)){
				tj = false;
				huoniao.goTop();
				return false;
			};
		}

		//描述
		if(description.val() != ""){
			if(!huoniao.regex(description)){
				tj = false;
				huoniao.goTop();
				return false;
			};
		}

		var data = [] ,proList = [];
		$('.pro_show li').each(function(){
			var t = $(this);
			var pro = {
				'url'   : encodeURIComponent(t.attr('data-url')),
				'id'    : t.attr('data-id'),
				'ltype' : t.attr('data-type'),
				'price' : t.attr('data-price')?t.attr('data-price'):"",
				'litpic': t.attr('data-litpic')?t.attr('data-litpic'):t.find('.l_img img').attr('src'),
				'title' : encodeURIComponent(t.attr('data-title')),
			}
			proList.push(pro);
		});
		data.push("commodity="+(JSON.stringify(proList)));

		t.attr("disabled", true);

		if(tj){
			$.ajax({
				type: "POST",
				url: "videoAdd.php?action="+action,
				data: data+"&"+$(this).parents("form").serialize() + "&submit=" + encodeURI("提交"),
				dataType: "json",
				success: function(data){
					if(data.state == 100){
						if($("#dopost").val() == "save"){

							huoniao.parentTip("success", "信息发布成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
							huoniao.goTop();
							location.href = "videoAdd.php?action=video&typeid="+typeid.val()+"&typename="+$("#typeBtn button").text();

						}else{

							huoniao.parentTip("success", "信息修改成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
							t.attr("disabled", false);

							// try{
							// 	$("body",parent.document).find("#nav-imageListphpaction"+action).click();
							// 	$("body",parent.document).find("#nav-edit"+action+id+" s").click();
							// }catch(e){
							// 	location.href = thisPath + "videoList.php?action="+action;
							// }

						}
					}else{
						$.dialog.alert(data.info);
						t.attr("disabled", false);
					};
				},
				error: function(msg){
					$.dialog.alert("网络错误，请刷新页面重试！");
					t.attr("disabled", false);
				}
			});
		}
	});

	//视频预览
	$("#videoPreview").delegate("a", "click", function(event){
		event.preventDefault();
		var href = $(this).attr("href"),
			id   = $(this).attr("data-id");

		window.open(href+id, "videoPreview", "height=500, width=650, top="+(screen.height-500)/2+", left="+(screen.width-650)/2+", toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");
	});

	//删除文件
	$(".spic .reupload").bind("click", function(){
		var t = $(this), parent = t.parent(), input = parent.prev("input"), iframe = parent.next("iframe"), src = iframe.attr("src");
		delFile(input.val(), false, function(){
			input.val("");
			t.prev(".sholder").html('');
			parent.hide();
			iframe.attr("src", src).show();
		});
	});


//视频类型切换
	$("input[name='videotype']").bind("click", function(){
		$("#type0, #type1").hide();
		$("#type"+$(this).val()).show();
	});

// $("input[name='videocharge']").bind("click", function(){
// 	alert($(this).val() ==1)
// 	if($(this).val() ==1){
// 		// $("#videotype1").show();
// 		$("#videotype1").removeClass('hide');
//
// 	}else{
// 		$("#videotype1").hide();
// 		// $("#videotype"+$(this).val()).show();
// 	}
// });
	$("input[name='videocharge[]']").bind("click", function(){

		var t = $(this), val = parseInt(t.val());
		if(val != 0){
			$('.videocharge input:eq(0)').removeAttr('checked',false);
		}

		var ischeck = 0;
		$('.videocharge input').each(function(){
			var t = $(this), val = parseInt(t.val());
			if(val == 0){
				if(t.is(':checked')) {
					$('#videotype1, #videotype3').hide();
					$('.videocharge input:eq(1), .videocharge input:eq(2)').removeAttr('checked',false);
				}
			}

			if(val == 1){
				if(t.is(':checked')){
					$('.videocharge input:eq(0)').removeAttr('checked',false);
					$('#videotype1').show();
				}else{
					$('#videotype1').hide();
				}
			}

			if(val == 3){
				if(t.is(':checked')){
					$('.videocharge input:eq(0)').removeAttr('checked',false);
					$('#videotype3').show();
				}else{
					$('#videotype3').hide();
				}
			}

			if(t.is(':checked')){
				ischeck++;
			}
		});

		if(ischeck == 0){
			$('.videocharge input:eq(0)').prop('checked',true);
		}
	})

//商品类型切换
// 链接选择
	$('.link_opt .li_opt').click(function() {
		var t = $(this);
		var type = t.attr('data-type');
		$('.mask_pl').show();
		if (type == 0) {
			$('.link_pro').show();
			if($('.pro_box .show').find('li').size()==0){
				lpage = 1
				get_prolist()
			}

		} else {
			$('.link_in').show();
		}
		$('html').addClass('noscroll');
	});

// 隐藏
	$('.mask_pl,.link_pro .cancel_btn,.link_in .cancel_btn').click(function() {
		$('.mask_pl').hide();
		$('.link_in').hide();
		$('.link_pro').hide();
		$('html').removeClass('noscroll');
	});

// 选择关联商品

	$('.pro_box').delegate('.pro_li', 'click', function() {
		var t = $(this)
		if (!t.hasClass('chosed')) {
			t.addClass('chosed');
			$('.link_pro h1 a').hide();
			$('.link_pro h1 a.sure_btn').show();
		} else {
			t.removeClass('chosed');
			if ($('.pro_li.chosed').size() == 0) {
				$('.link_pro h1 a').hide();
				$('.link_pro h1 a.cancel_btn').show();
			}
		}
	});

// 点击关联商品确定按钮
	$('.link_pro .sure_btn').click(function() {
		var prolist = [];
		$('.pro_li').each(function() {
			var pro = {};
			var t = $(this);
			var p_name = t.find('.right_info h2').text(); //商品名称
			var p_id = t.attr('data-id'); //商品id
			var p_price = t.find('.right_info .price').text(); //商品价格
			var p_url = t.find('.left_proimg').attr('href'); //商品链接
			var p_img = t.find('.left_proimg img').attr('src');
			var p_type = t.parents('ul').attr('data-type')
			if (t.hasClass('chosed')) {
				pro = {
					"id": p_id,
					"name": p_name,
					"price": p_price,
					"url": p_url,
					"litpic": p_img,
					'type' : p_type
				}
				if ($('.li_show[data-id="' + p_id + '"][data-link="'+p_type+'"]').size() == 0) {
					// 新增未添加的商品
					prolist.push('<li class="li_show fn-clear" data-litpic="' + p_img + '" data-link="'+p_type+'" data-type="pro" data-url="' + p_url + '" data-id="' + p_id + '" data-title="' + p_name + '" data-price="' + p_price + '">');
					prolist.push('<div class="l_img"><img src="' + p_img + '" /></div>');
					prolist.push('<div class="r_info"><h2> ' + p_name + ' </h2>');
					prolist.push('<p>' + p_price + '</p></div><i class="clear"></i></li>');
				}

			}

		})
		$('.pro_show ul').append(prolist.join(''));
		$('.mask_pl').click();
	});
	//拖拽排序
	$(".pro_show ul").dragsort({ dragSelector: "li", placeHolderTemplate: '<li class="holder"></li>', dragEnd: function(){}});

// 链接
	$('.l_inbox').focus(function() {
		$('.l_inbox').find('span').remove();
	});

	$('.l_inbox').blur(function() {
		if($('.l_inbox').text()==''){
			$('.l_inbox').append('<span class="tip">在这里粘贴链接</span>'); /* 在这里粘贴链接*/
		}
	});

	$('.l_inbox').bind('input propertychange', function() {
		var url = $('.l_inbox').text();
		if (url != '') {
			$('.link_in h1 a').hide();
			$('.link_in h1 a.sure_btn').show();
		} else {
			$('.link_in h1 a').hide();
			$('.link_in h1 a.cancel_btn').show();
		}
	});

// 链接确定点击
	$('.link_in h1 a.sure_btn').click(function() {
		var uText = $('.l_inbox').text().replace(/(^\s*)|(\s*$)/g, "");
		var reg = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
		var title = $('.l_title').val();
		var li_litpic = $('.link_info #goodlitpic').val();
		if(reg.test(uText)){
			$('.mask_pl').click();
			var src = li_litpic?'/include/attachment.php?f='+li_litpic:'/static/images/link_icon.png';
			$('.pro_show ul').append(
				'<li class="li_show fn-clear" data-type="link" data-title="'+title+'" data-url="'+uText+'"><div class="l_img"><img src="'+src+'"></div><div class="r_info"><h2> '+title+' </h2></div><i class="clear"></i></li>');
		}else{
			alert('这不是正确的链接') ; /* 这不是正确的链接*/
		}

	});

// 到底加载
	$('.pro_box').scroll(function(){
		var type = $('.pro_box>ul').attr('data-type');
		if ($('.pro_box').scrollTop() >= $('.pro_box>ul').height() - $('.pro_box').height() - 80 && !lload && lpage < ltotalPage)
		{
			lpage++;
			get_prolist();
		}
	});

// 搜索
	$('#search_pro').bind('input propertychange',function(){
		var t = $(this);
		if($('#search_pro').val()!=''){
			$('.link_pro .clear').show();
		}else{
			$('.link_pro .clear').hide();
		};
		lpage = 1 ;
		get_prolist();
	});

// 清空搜索框
	$('.link_pro .clear').click(function(){
		$('#search_pro').val('');
		lpage = 1 ;
		get_prolist();
	});

});

function get_prolist(){
	if(pl_alax){
		pl_alax.abort();
	}
	var type = $('.pro_box ul').attr('data-type');

	lload = true;
	keywords = $('#search_pro').val();
	var data = [];
	data.push('page='+lpage);
	data.push('keywords='+keywords);
	url = '/include/ajax.php?service=shop&action=slist&pageSize=20&'+data.join('&');
	$('.pro_box ul .loading').remove();
	$('.pro_box ul').append('<div class="loading"><span>加载中~</span></div>');
	console.log(url)
	pl_alax = $.ajax({
		url: url,
		type: "GET",
		dataType: "json", //指定服务器返回的数据类型
		crossDomain: true,
		success: function(data) {
			lload = false;
			$('.pro_box ul .loading').remove();
			if (data.state == 100) {
				console.log(5555)
				var list = [],item = data.info.list;
				ltotalPage = data.info.pageInfo.totalPage;
				ltotalCount = data.info.pageInfo.totalCount;
				var label = $('.pro_box ul').attr('data-name');
				if(item.length>0){

					for(var i = 0; i<item.length; i++){
						var chosed = '';
						$('.pro_show li').each(function(){
							var t = $(this);
							if(t.attr('data-link') == type && t.attr('data-id') == item[i].id){
								chosed = "chosed";
							}
						});
						list.push('<li class="pro_li '+chosed+'" data-id="'+item[i].id+'" >');
						list.push('<a href="'+item[i].url+'" class="left_proimg">');
						//list.push('<i>'+label+'</i>');
						// list.push('<img data-url="'+item[i].litpic+'" src="/static/images/blank.gif" />');
						list.push('<img data-url="'+item[i].litpic+'" src="'+item[i].litpic+'" />');
						list.push('</a>');
						list.push('<div class="right_info">');
						list.push('<h2>'+item[i].title+'</h2>');
						if(item[i].price){
							list.push('<p class="price"><em>'+echoCurrency('symbol')+'</em>'+item[i].price+'</p>');
						}else{
							list.push('<p class="price"><em>'+echoCurrency('symbol')+'</em>'+item[i].price+'</p>');
						}

						list.push('</div>');
						list.push('</li>');

					}
					if(lpage==1){
						$('.pro_box ul').html(list.join(''));
					}else{
						$('.pro_box ul').append(list.join(''));
					}

					// $('.pro_box ul img').scrollLoading(); //懒加载
				}else{
					if(ltotalPage < lpage && lpage > 0){

						$('.pro_box ul').append('<div class="noData loading"><p>已经到底啦！</p></div>')
					}else{
						$('.pro_box ul').html('<div class="noData loading"><img src="/static/images/f_null.png"><p>暂无符合条件的商品哦</p></div>')   /* 暂无符合条件的商品哦~*/
					}
				}

			} else {
				$('.pro_box ul').html('<div class="noData loading"><img src="/static/images/f_null.png"><p>暂无符合条件的商品哦</p></div>')  /* 暂无符合条件的商品哦~*/
			}
		},
		error: function(err) {
			console.log('fail');

		}
	});

}

// 删除已关联商品
$('.pro_show').delegate('.clear','click',function(){
	var par = $(this).closest('.li_show');
	if(par.attr("data-gid") == undefined || par.attr("data-gid") == 0){
	     par.remove();
	     return false;
	}
	$.ajax({
		type: "POST",
		url: "videoAdd.php?dopost=delgoods&id="+par.attr("data-gid"),
		data: '',
		dataType: "json",
		success: function(data){
		    if(data.state == 100){
		        alert("删除成功");
		        par.remove();       
		    }else{
		        alert(data.info);
		    }
		    
		},
		error:function(){
		    
		}
	})
})



//上传成功接收
function uploadSuccess(obj, file, filetype, fileurl){
	$("#"+obj).val(file);
	$("#"+obj).siblings(".spic").find(".sholder").html('<a href="/include/videoPreview.php?f=" data-id="'+file+'">预览视频</a>');
	$("#"+obj).siblings(".spic").find(".reupload").attr("style", "display: inline-block");
	$("#"+obj).siblings(".spic").show();
	$("#"+obj).siblings("iframe").hide();
}


//删除已上传的文件
function delFile(b, d, c) {
	var g = {
		mod: "video",
		type: "delVideo",
		picpath: b,
		randoms: Math.random()
	};
	$.ajax({
		type: "POST",
		cache: false,
		async: d,
		url: "/include/upload.inc.php",
		dataType: "json",
		data: $.param(g),
		success: function(a) {
			try {
				c(a)
			} catch(b) {}
		}
	})
}
