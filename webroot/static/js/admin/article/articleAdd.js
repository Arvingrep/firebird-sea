//实例化编辑器
var ue = UE.getEditor('body');
var mue = UE.getEditor('mbody', {"term": "mobile"});

var uploadCustom = {
	//旋转图集文件
	rotateAtlasPic: function(mod, direction, img, c) {
		var g = {
			mod: mod,
			type: "rotateAtlas",
			direction: direction,
			picpath: img,
			randoms: Math.random()
		};
		$.ajax({
			type: "POST",
			cache: false,
			async: false,
			url: "/include/upload.inc.php",
			dataType: "json",
			data: $.param(g),
			success: function(a) {
				try {
					c(a)
				} catch(b) {}
			}
		});
	}
}

$(function () {

	huoniao.parentHideTip();

    //填充城市列表
    //huoniao.buildAdminList($("#cityid"), cityList, '请选择分站', cityid);

    $(".chosen-select").chosen();

	huoniao.choseCity($(".choseCity"),$("#cityid"))




	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	var init = {
		//菜单递归分类
		selectTypeList: function(data){
			var typeList = [];
			typeList.push('<ul class="dropdown-menu">');
			typeList.push('<li><a href="javascript:;" data-id="0">选择分类</a></li>');

			var eachData = data ? data : typeListArr;
			var l=eachData.length;
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
				})(eachData[i]);
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
	$("#typeBtn").delegate("a", "click", function(){
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


	// 模糊匹配
	//模糊匹配会员
	// $("#user").bind("input", function(){
	// 	$("#userid").val("0");
	// 	var t = $(this), val = t.val();
	// 	var id = $("#media").val()
	// 	if(val != "" && (id == '' || id == "0" )){
	// 		t.addClass("input-loading");
	// 		huoniao.operaJson("?dopost=checkUser&aid="+id, "name="+val, function(data){
	// 			t.removeClass("input-loading");
	// 			if(!data) {
	// 				$("#media_manager").html("").hide();
	// 				return false;
	// 			}
	// 			var list = [];
	// 			for(var i = 0; i < data.length; i++){
	// 				list.push('<li data-id="'+data[i].id+'" data-sid="'+data[i].sid+'" data-ac_name="'+data[i].ac_name+'">'+data[i].username+'</li>');
	// 			}
	// 			if(list.length > 0){
	// 				var pos = t.position();
	// 				$("#media_manager")
	// 					.css({"left": pos.left, "top": pos.top + 36, "width": t.width() + 12})
	// 					.html('<ul>'+list.join("")+'</ul>')
	// 					.show();
	// 			}else{
	// 				$("#media_manager").html("").hide();
	// 			}
	// 		});

	// 	}else{
	// 		$("#media_manager").html("").hide();
	// 	}
    // });

    // $("#media_manager").delegate("li", "click", function(){
	// 	var name = $(this).text(), id = $(this).attr("data-id"), sid = $(this).attr("data-sid"),ac_name = $(this).attr("data-ac_name");
	// 	$("#user").val(name);
	// 	$("#userid").val(id);
	// 	$("#media_manager").html("").hide();
	// 	// checkGw($("#user"), name, $("#id").val());
	// 	$('#mediaText').val(ac_name)
	// 	$('#media').val(sid)
	// 	checkMediaManager(sid);
	//     getMediaArcType({aid:sid});
	// 	return false;
	// });

    // $(document).click(function (e) {
    //     var s = e.target;
    //     if (!jQuery.contains($("#media_manager").get(0), s)) {
    //         if (jQuery.inArray(s.id, "user") < 0) {
    //             $("#media_manager").hide();
    //         }
    //     }
    // });

    // $("#user").bind("blur", function(){
	// 	var t = $(this), val = t.val(), id = $("#id").val();
	// 	if(val != ""){
	// 		// checkGw(t, val, id);
	// 	}else{
	// 		t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>请从列表中选择会员');
	// 	}
	// });


// 模糊匹配媒体号

$("#mediaText").bind("input", function(){
	$("#media").val("0");
	var t = $(this), val = t.val();
	if(val != ""){
		t.addClass("input-loading");
		huoniao.operaJson("?dopost=checkMedia", "name="+val, function(data){
			t.removeClass("input-loading");
			if(!data) {
				$("#media_list").html("").hide();
				return false;
			}
			var list = [];
			for(var i = 0; i < data.length; i++){
				list.push('<li data-id="'+data[i].id+'">'+data[i].ac_name+'</li>');
			}
			if(list.length > 0){
				var pos = t.position();
				$("#media_list")
					.css({"left": pos.left, "top": pos.top + 36, "width": t.width() + 12})
					.html('<ul>'+list.join("")+'</ul>')
					.show();
			}else{
				$("#media_list").html("").hide();
			}
		});

	}else{
		$("#media_list").html("").hide();
		$("#user").removeAttr('readonly').val('')
		$("#userid").val('')

	}
});

$("#media_list").delegate("li", "click", function(){
	var name = $(this).text(), id = $(this).attr("data-id"), phone = $(this).attr("data-phone");
	$("#mediaText").val(name);
	$("#media").val(id);
	$("#media_list").html("").hide();
	// checkGw($("#mediaText"), name, $("#id").val());
	getMediaArcType({'aid':id});
	checkMediaManager(id, 'from_media')
	return false;
});

if($('#media').val() != ''){
    checkMediaManager($('#media').val(), 'from_media')
}


// 来源切换
	$('input[name="article_prop"]').change(function(){
		var article_prop = $(this).val();
		if(article_prop == '1'){
			$(".editInfoBox").addClass('reEdit')
			$("#source,#sourceurl").val('')
		}else{
			$(".editInfoBox").removeClass('reEdit')
		}
	})

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
			url: "articleJson.php?action=chooseData",
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
											url: "articleJson.php?action=saveChooseData",
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
			url: "articleJson.php?action=allowurl",
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
							url: "articleJson.php?action=saveAllowurl",
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


	//自动获取关键词、描述
	$(".autoget").bind("click", function(){
		var t = $(this), type = t.data("type");
		var title = $('#title').val();
		var body = ue.getContentTxt();
		if(body != ""){
			if(t.text() == "自动获取" || t.text() == "重新获取"){
				$.ajax({
					url: "/include/ajax.php?service=siteConfig&action=autoget",
					data: "type="+type+"&title="+title+"&body="+body,
					type: "POST",
					dataType: "json",
					success: function(data){
						if(data.state == 100){
							$("#"+type).val(data.info);
							t.html("重新获取");
						}else{
							t.html("获取失败，请稍后重试！");
							setTimeout(function(){
								t.html("重新获取");
							}, 2000);
						}
					}
				});
			}
		}else{
			$.dialog.alert("请先输入内容！");
		}
	});

	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t            = $(this),
			id           = $("#id").val(),
            cityid       = $("#cityid").val(),
			title        = $("#title"),
			subtitle     = $("#subtitle"),
			creturn      = $("input[type=checkbox][value=t]"),
			redirecturl  = $("#redirecturl"),
			weight       = $("#weight"),
			keywords     = $("#keywords"),
			description  = $("#description"),
			typeid       = $("#typeid"),
			tj           = true;

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


		ue.sync();
		mue.sync();

		var zhuanti = $('#zhuanti').val(), zhuantitype = $('#zhuantitype').val();
		if(zhuanti && !zhuantitype){
			$.dialog.alert('请选择专题分类');
			return false;
			// if($('#zhuantitype option').length > 1){
			//  $.dialog.alert('请选择专题分类');
			// 	$('html,body').animate({"scrollTop":9999}, 500);
			// 	return false;
			// }
		}

		t.attr("disabled", true);

		if(tj){
			$.ajax({
				type: "POST",
				url: "articleAdd.php?action="+action,
				data: $(this).parents("form").serialize() + "&submit=" + encodeURI("提交"),
				dataType: "json",
				success: function(data){
					if(data.state == 100){
						if($("#dopost").val() == "save"){

							huoniao.parentTip("success", "信息发布成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
							huoniao.goTop();
							location.href = "articleAdd.php?action=article&typeid="+typeid.val()+"&typename="+$("#typeBtn button").text();

						}else{

							huoniao.parentTip("success", "信息修改成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
							t.attr("disabled", false);

							//更新列表页数据
							// $("body",parent.document).find("#body-articleListphp")[0].contentWindow.getList()

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

	//头部导航切换
	$(".config-nav button").bind("click", function(){
		var index = $(this).index(), type = $(this).attr("data-type");
		if(!$(this).hasClass("active")){
			$(".item").hide();
			$(".item:eq("+index+")").fadeIn();
		}
	});

	// 修改审核状态
	$("#btnSuccess, #btnRefuse").click(function(){
		var t = $(this), tr = t.closest('tr'), state = t.attr("id") == "btnSuccess" ? 1 : 2, p = t.closest('tr');
		$.dialog.prompt('选填备注信息', function(note){
			$.ajax({
				type: "POST",
				url: "articleJson.php?action=audit",
				data: {id:id,state:state,note:note},
				dataType: "json",
				success: function(data){
					if(data.state == 100){
						huoniao.parentTip("success", "操作成功！");
						if(state == 1){
							p.find('.state').html('<span style="color:#51a351;">审核通过</span>');
						}else{
							p.find('.state').html('<span style="color:#da4f49;">审核拒绝</span>');
						}
						p.find('.pubdate').text(data.pubdate);
						p.find('.note').text(note);
						var nickname = p.find('.nickname').text();
						if(nickname == ''){
							p.find('.nickname').text('我');
						}
						if(tr.index() != 0 && state == 2){
							location.reload();
						}else{
							t.attr("disabled", true).siblings().attr("disabled", false);
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
		})
	})


	// 切换新闻类型
	$('[name="mold"]').change(function(){
		var val = $(this).val();
		// if(val == "3" || mold == "3"){
		// 	$.dialog.alert(mold == "3" ? "短视频类型不支持更改操作" : "短视频类型仅支持在APP端上传并发布");
		// 	setTimeout(function(){
		// 		$('[name="mold"][value="'+mold+'"]').prop('checked', true);
		// 	}, 300)
		// 	return;
		// }
		mold = val;
		changeItem(val);
		getType(val);
	})
	function getType(id){
		$('#typeid').val(0);
		$.ajax({
			url: 'articleJson.php?action=getArticleType',
			type: 'post',
			data: 'mold='+id,
			dataType: 'json',
			success: function(data){
				$('#typeBtn .btn').html('选择分类<span class="caret"></span>').siblings('.dropdown-menu').remove();
				if(data){
					typeListArr = data;
					$("#typeBtn").append(init.selectTypeList());
				}
			},
			error: function(){
				$('#typeBtn .btn').html('选择分类<span class="caret"></span>').siblings('.dropdown-menu').remove();
			}
		})
	}

	//视频类型切换
	$("input[name='videotype']").bind("click", function(){
		$(".type0, .type1").hide();
		$(".type"+$(this).val()).show();
	});

	function changeItem(id){
		// not('[name="imglist"], [name="body"], [name="mbody"]')
		$('.variable').hide().find('input, textarea, select').filter('[name=video]').prop('disabled', true);
		$('.variable-'+id).show().find('input, textarea, select').prop('disabled', false);
		if(mold == 2){
			if($("input[name='videotype']:checked").val() == '1'){
				$('.type1').show();
				$('.type0').hide();
			}else{
				$('.type0').show();
				$('.type1').hide();
			}
		}
	}
	changeItem(mold);

	//视频预览
	$("#videoPreview, #videoPreview3").delegate("a", "click", function(event){
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

	function getMediaArcType(param, type){
		$("#typeMediaBtn ul").remove();
		if(type == undefined){
			$("#media_arctype").val(0);
			$("#typeMediaBtn button").html('请选择<span class="caret"></span>');
		}
		$("#typeMediaBtn ul").remove();
		$.ajax({
			url: '?dopost=getMediaArcType',
			type: 'post',
			data: param,
			dataType: 'json',
			success: function(res){
				if(res){
					$("#typeMediaBtn").append(init.selectTypeList(res));
				}else{
					$("#typeMediaBtn button").html('暂无分类<span class="caret"></span>');
				}
			},
			error: function(){
				$("#typeMediaBtn button").html('分类获取失败<span class="caret"></span>');
			}
		})
	}
	if(detail.media){
		getMediaArcType({aid: detail.media}, true);
	}

	//二级菜单点击事件
	$("#typeMediaBtn").delegate("a", "click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
		$("#media_arctype").val(id);
		$("#typeMediaBtn button").html(title+'<span class="caret"></span>');

		if(id != 0){
			$("#media_arctype").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}else{
			$("#media_arctype").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
		}
	});

	$('body').delegate('.sametitle a', 'click', function(e){
		e.preventDefault();
		var t = $(this), title = t.text(), id = t.attr('data-id');
		var href = "articleAdd.php?dopost=edit&id="+id+"&action=article";
		try {
			event.preventDefault();
			parent.addPage("editarticle"+id, "article", title, "article/"+href);
		} catch(e) {}
	})
	var checkTitleTime;
	$("#title").on("input propertychange", function(){
		var t = $(this), val = $.trim(t.val()), par = t.closest('dl');
		clearTimeout(checkTitleTime);
		$('.sametitle').remove();
		if(val){
			checkTitleTime = setTimeout(function(){
				$.post('articleJson.php?action=checkTitle', 'id='+id+'&title='+val, function(aid){
					if(aid > 0){
						par.after('<dl class="clearfix sametitle" style="color:#666;"><dt><label for="">&nbsp;</label></dt><dd>已存在相同标题的信息：<a href="javascript:;" data-id="'+aid+'">'+val+'</a></dd></dl>');
					}
				})
			}, 200)
		}
	})

	$("#zhuanti").change(function(){
		var t = $(this), val = t.val();
		var html = [];
		if(val){
			$.ajax({
				url: 'articleJson.php?action=getZhuantiType',
				data: {type: val},
				type: 'post',
				dataType: 'json',
				success: function(res){
					html.push('<option value="0">请选择</option>');
					for(var i = 0; i < res.length; i++){
						var d = res[i];
						html.push('<option value="'+d.id+'">'+d.typename+'</option>');
					}
					$('#zhuantitype').html(html.join(""));
				},
				error: function(){
					var html = [];
					html.push('<option value="0">获取失败</option>');
					$('#zhuantitype').html(html.join(""));
				}
			})
		}else{
			html.push('<option value="0">请选择</option>');
			$('#zhuantitype').html(html.join(""));
		}
	})

	// 输入筛选自媒体
	// $('#media').select2({
	//     placeholder          : "请输入",
	//     minimumInputLength   : 1,
	//     multiple             : false,
	//     separator            : "^",                             // 分隔符
	//     maximumSelectionSize : 10,                               // 限制数量
	//     initSelection        : function (element, callback) {   // 初始化时设置默认值
	//         var data = [];
	//         $(element.val().split("^")).each(function () {
	//             data.push({id: this, ac_name: this});
	//         });
	//     },
	//     createSearchChoice   : function(term, data) {           // 创建搜索结果（使用户可以输入匹配值以外的其它值）
	//         // return { id: term, ac_name: term };
	//     },
	//     formatSelection : function (item) {
	//     	getMediaArcType({aid: item.id});
	//     	$('#source').val(item.ac_name);

	//     	checkMediaManager(item.id, 'from_media');
	//     	return item.ac_name;
    // 	},  // 选择结果中的显示
	//     formatResult    : function (item) { return item.ac_name; },  // 搜索列表中的显示
	//     ajax : {
	//         url      : "articleAdd.php?dopost=checkMedia",              // 异步请求地址
	//         dataType : "json",                  // 数据类型
	//         data     : function (term, page) {  // 请求参数（GET）
	//             return { name: term };
	//         },
	//         results      : function (data, page) {
	//           return {results: data};
	//         },  // 构造返回结果
	//         escapeMarkup : function (m) { return m; }               // 字符转义处理
	//     }
	// });




	// 输入筛选发布人
	// $('#admin').select2({
	//     placeholder          : "请输入",
	//     minimumInputLength   : 1,
	//     multiple             : false,
	//     separator            : "^",                             // 分隔符
	//     maximumSelectionSize : 10,                               // 限制数量
	//     initSelection        : function (element, callback) {   // 初始化时设置默认值
	//         var data = [];
	//         $(element.val().split("^")).each(function () {
	//             data.push({id: this, username: this});
	//         });
	//         callback(data);
	//     },
	//     createSearchChoice   : function(term, data) {           // 创建搜索结果（使用户可以输入匹配值以外的其它值）
	//         // return { id: term, ac_name: term };
	//     },
	//     formatSelection : function (item) {
	//     	// 如果没有选择自媒体，则填入自媒体信息并且获取自定义分类
	//     	if(item.sid && ($('#media').val() == '' || $('#media').val() == 0)){
	//     		$('#media').val(item.sid);
	//     		$('#s2id_media > a').removeClass('select2-default')
	//     			.children('span').text(item.ac_name);
	//     		$('#source').val(item.ac_name);
	//     		checkMediaManager(item.sid);
	//     		getMediaArcType({aid: item.sid});
	//     	}
	//     	return item.username;
    // 	},  // 选择结果中的显示,插入可见的文本域
	//     formatResult    : function (item) {
	//     	return item.username;
    // 	},  // 搜索列表中的显示
	//     ajax : {
	//         url      : "articleAdd.php?dopost=checkUser",              // 异步请求地址
	//         dataType : "json",                  // 数据类型
	//         type     : 'post',
	//         data     : function (term, page) {  // 请求参数（GET）
	//             return { name: term, aid: $('#media').val() };
	//         },
	//         results      : function (data, page) {
	// 			console.log(data)
	//           return {results: data};
	//         },  // 构造返回结果
	//         escapeMarkup : function (m) { return m; }               // 字符转义处理
	//     }
	// });
	$("#media_manager").change(function(){
		var t = $(this), val = t.val();
		if(val){
			var txt = t.find('option[value="'+val+'"]').text();
			$('#admin').val(val);
			// $('#s2id_admin > a').removeClass('select2-default')
			// 	.children('span').text(txt);
		}
	})
	function checkMediaManager(aid, type){
  	//如果已经填写了发布人，需要重新验证
  	var adminid = parseInt($('#admin').val()||0);
		$.ajax({
			url: '?dopost=getUser&aid='+aid,
			type: 'get',
			dataType: 'json',
			success: function(res){
				if(res && res.length){
					var ok = false;
					var html = [];
					html.push('<option value="">请选择</option>');
					var selected = res.length == 1 ? ' selected="selected"' : '';
					for(var i = 0; i < res.length; i++){
						if(res[i].id == adminid){
							ok = true;
						}
						html.push('<option value="'+res[i].id+'"'+selected+'>'+res[i].username+'</option>');
					}
					$('#media_manager').html(html.join(""));
					$("#media_manager_g").show();

					if(type == 'from_media'){
						// $('#s2id_admin').remove();
						// $('#admin').removeClass("select2-offscreen").select2({
						//     placeholder          : "请输入",
						//     minimumInputLength   : 1,
						//     multiple             : false,
						//     separator            : "^",                             // 分隔符
						//     maximumSelectionSize : 10,                               // 限制数量
						//     initSelection        : function (element, callback) {   // 初始化时设置默认值
						//         var data = [];
						//         $(element.val().split("^")).each(function () {
						//             data.push({id: this, username: this});
						//         });
						//         callback(data);
						//     },
						//     createSearchChoice   : function(term, data) {           // 创建搜索结果（使用户可以输入匹配值以外的其它值）
						//         // return { id: term, ac_name: term };
						//     },
						//     formatSelection : function (item) { 
						//     	return item.username;
					    // 	},  // 选择结果中的显示,插入可见的文本域
						//     formatResult    : function (item) { 
						//     	return item.username; 
					    // 	},  // 搜索列表中的显示
						//     data: res
						// });
						if(adminid && !ok){
							$('#admin').val('0');
							$('#s2id_admin > a').addClass('select2-default')
								.children('span').text('请重新输入');
						}
					}
					if(res.length == 1){
						$('#admin').val(res[0].id);
						$('#s2id_admin > a').removeClass('select2-default')
								.children('span').text(res[0].username);
					}
				}
			}
		})
	}

	// function checkContent(id){
	//   var content = ue.getContent();
	//   if($.trim(content) == ''){
	//     return;
	//   }
	//   var patt = /\<video class="edui-upload-video(.*)src="(.*)"(.*)data-setup="{}"\>/g;
	//   var video = [];
	//   while ((res = patt.exec(content)) != null)  {
	//   }
	// }
	// 监听编辑器内容包含
	// ue.addListener("contentChange",function(){
	// 	checkContent();
	// });
});

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
		mod: "article",
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
