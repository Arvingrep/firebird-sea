//实例化编辑器
var ue = UE.getEditor('note');

$(function(){

	huoniao.parentHideTip();

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	var init = {
		//提示信息
		showTip: function(type, message){
			var obj = $("#infoTip");
			obj.html('<span class="msg '+type+'">'+message+'</span>').show();

			setTimeout(function(){
				obj.fadeOut();
			}, 5000);
		},

		//树形递归分类
		treeTypeList: function(){
			var typeList = [], cl = "";
			var l=addrListArr;
			typeList.push('<option value="0">请选择</option>');
			for(var i = 0; i < l.length; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower, selected = "";
					if(addrid == jsonArray["id"]){
						selected = " selected";
					}
					typeList.push('<option value="'+jsonArray["id"]+'"'+selected+'>'+cl+"|--"+jsonArray["typename"]+'</option>');
					for(var k = 0; k < jArray.length; k++){
						cl += '    ';
						var selected = "";
						if(addrid == jArray[k]["id"]){
							selected = " selected";
						}
						if(jArray[k]['lower'] != ""){
							arguments.callee(jArray[k]);
						}else{
							typeList.push('<option value="'+jArray[k]["id"]+'"'+selected+'>'+cl+"|--"+jArray[k]["typename"]+'</option>');
						}
						if(jsonArray["lower"] == null){
							cl = "";
						}else{
							cl = cl.replace("    ", "");
						}
					}
				})(l[i]);
			}
			return typeList.join("");
		}
	};

	//填充区域
	$("#addrid").html(init.treeTypeList());

	//头部导航切换
	$(".config-nav button").bind("click", function(){
		var index = $(this).index(), type = $(this).attr("data-type");
		if(!$(this).hasClass("active")){
			$(".item").hide();
			$(".item:eq("+index+")").fadeIn();
		}
	});

	//标注地图
	$("#mark").bind("click", function(){
		$.dialog({
			id: "markDitu",
			title: "标注地图位置<small>（请点击/拖动图标到正确的位置，再点击底部确定按钮。）</small>",
			content: 'url:'+adminPath+'../api/map/mark.php?mod=house&lnglat='+$("#lnglat").val()+"&city="+mapCity+"&addr="+$("#addr").val(),
			width: 800,
			height: 500,
			max: true,
			ok: function(){
				var doc = $(window.parent.frames["markDitu"].document),
					lng = doc.find("#lng").val(),
					lat = doc.find("#lat").val(),
					addr = doc.find("#addr").val();
				$("#lnglat").val(lng+","+lat);
				if($("#addr").val() == ""){
					$("#addr").val(addr);
				}
				huoniao.regex($("#addr"));
			},
			cancel: true
		});
	});

	//选择附近地铁站
	$(".chooseData").bind("click", function(){
		var addrids = $('.addrBtn').attr('data-ids').split(' ');
		var cityid = addrids[0];
		if(cityid == 0 || cityid == "" || cityid == undefined){
			$.dialog.alert("请先选择区域板块！");
			return false;
		}
		var type = $(this).prev("input").attr("id"), input = $(this).prev("input"), valArr = input.val().split(",");
		huoniao.showTip("loading", "数据读取中，请稍候...");
		huoniao.operaJson("../siteConfig/siteSubway.php?dopost=getSubway", "addrids="+addrids.join(","), function(data){
			huoniao.hideTip();
			if(data && data.state == 100){

				var data = data.info;

				var content = [], selected = [];
				content.push('<div class="selectedTags">已选：</div>');
				content.push('<ul class="nav nav-tabs" style="margin-bottom:5px;">');
				for(var i = 0; i < data.length; i++){
					content.push('<li'+ (i == 0 ? ' class="active"' : "") +'><a href="#tab'+i+'">'+data[i].title+'</a></li>');
				}
				content.push('</ul><div class="tagsList">');
				for(var i = 0; i < data.length; i++){
					content.push('<div class="tag-list'+(i == 0 ? "" : " hide")+'" id="tab'+i+'">')
					for(var l = 0; l < data[i].lower.length; l++){
						var id = data[i].lower[l].id, name = data[i].lower[l].title;
						if($.inArray(id, valArr) > -1){
							selected.push('<span data-id="'+id+'">'+name+'<a href="javascript:;">&times;</a></span>');
						}
						content.push('<span'+($.inArray(id, valArr) > -1 ? " class='checked'" : "")+' data-id="'+id+'">'+name+'<a href="javascript:;">+</a></span>');
					}
					content.push('</div>');
				}
				content.push('</div>');

				$.dialog({
					id: "subwayInfo",
					fixed: false,
					title: "选择附近地铁站",
					content: '<div class="selectTags">'+content.join("")+'</div>',
					width: 1000,
					okVal: "确定",
					ok: function(){

						//确定选择结果
						var html = parent.$(".selectedTags").html().replace("已选：", ""), ids = [];
						parent.$(".selectedTags").find("span").each(function(){
							var id = $(this).attr("data-id");
							if(id){
								ids.push(id);
							}
						});
						input.val(ids.join(","));
						input.prev(".selectedTags").html(html);

					},
					cancelVal: "关闭",
					cancel: true
				});

				var selectedObj = parent.$(".selectedTags");
				//填充已选
				selectedObj.append(selected.join(""));

				//TAB切换
				parent.$('.nav-tabs a').click(function (e) {
					e.preventDefault();
					var obj = $(this).attr("href").replace("#", "");
					if(!$(this).parent().hasClass("active")){
						$(this).parent().siblings("li").removeClass("active");
						$(this).parent().addClass("active");

						$(this).parent().parent().next(".tagsList").find("div").hide();
						parent.$("#"+obj).show();
					}
				});

				//选择标签
				parent.$(".tag-list span").click(function(){
					if(!$(this).hasClass("checked")){
						var length = selectedObj.find("span").length;
						if(type == "tags" && length >= tagsLength){
							alert("交友标签最多可选择 "+tagsLength+" 个，可在模块设置中配置！");
							return false;
						}
						if(type == "grasp" && length >= graspLength){
							alert("会的技能最多可选择 "+graspLength+" 个，可在模块设置中配置！");
							return false;
						}
						if(type == "learn" && length >= learnLength){
							alert("想学技能最多可选择 "+learnLength+" 个，可在模块设置中配置！");
							return false;
						}

						var id = $(this).attr("data-id"), name = $(this).text().replace("+", "");
						$(this).addClass("checked");
						selectedObj.append('<span data-id="'+id+'">'+name+'<a href="javascript:;">&times;</a></span>');
					}
				});

				//取消已选
				selectedObj.delegate("a", "click", function(){
					var pp = $(this).parent(), id = pp.attr("data-id");

					parent.$(".tagsList").find("span").each(function(index, element) {
                        if($(this).attr("data-id") == id){
							$(this).removeClass("checked");
						}
                    });

					pp.remove();
				});

			}
		});
	});

    $("#previewQj").bind("click", function(){
        if($("#listSection2").find("li").length == 6){

            event.preventDefault();
            var href = $(this).attr("href");

            pics = [];
            $("#listSection2").find("img").each(function(index, element) {
                pics.push($(this).attr("data-val"));
            });

            window.open(href+pics.join(","), "videoPreview", "height=500, width=650, top="+(screen.height-500)/2+", left="+(screen.width-650)/2+", toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");

        }else{
            $.dialog.alert("请上传6张完整的全景图片！");
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

	//竣工时间
	$("#opendate").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch'});

	//经纪人模糊匹配
	$("#user").bind("input", function(){
		$("#userid").val("0");
		var t = $(this), val = t.val();
		if(val != ""){
			t.addClass("input-loading");
			huoniao.operaJson("../inc/json.php?action=checkZjUser", "key="+val, function(data){
				t.removeClass("input-loading");
				if(!data) {
					$("#userList").html("").hide();
					return false;
				}
				var list = [];
				for(var i = 0; i < data.length; i++){
					list.push('<li data-id="'+data[i].id+'" title="'+data[i].username+'">'+data[i].username+'</li>');
				}
				if(list.length > 0){
					var pos = t.position();
					$("#userList")
						.css({"left": pos.left, "top": pos.top + 36, "width": t.width() + 12})
						.html('<ul>'+list.join("")+'</ul>')
						.show();
				}else{
					$("#userList").html("").hide();
				}
			});

		}else{
			$("#userList").html("").hide();
		}
    });

	$("#userList").delegate("li", "click", function(){
		var name = $(this).text(), id = $(this).attr("data-id");
		$("#user").val(name);
		$("#userid").val(id);
		$("#userList").html("").hide();
		$("#user").siblings(".input-tips").removeClass().addClass("input-tips input-ok");
        checkZjUser($("#user"),name);
		return false;
	});

	// $(document).click(function (e) {
 //      var s = e.target;
 //      if (!jQuery.contains($("#userList").get(0), s)) {
 //          if (jQuery.inArray(s.id, "user") < 0) {
 //              $("#userList").hide();
 //          }
 //      }
 //  });

	$("#user").bind("blur", function(){
		var t = $(this), val = t.val(), flag = false;
		if(val != ""){
            checkZjUser(t, val);
		}else{
			t.siblings(".input-tips").removeClass().addClass("input-tips input-error");
		}
	});

	function checkZjUser(t, val){
        t.addClass("input-loading");
        huoniao.operaJson("../inc/json.php?action=checkZjUser", "key="+val, function(data){
            t.removeClass("input-loading");
            if(data) {
                for(var i = 0; i < data.length; i++){
                    if(data[i].username == val){
                        flag = true;
                        $("#userid").val(data[i].id);
                    }
                }
            }
            if(flag){
                t.siblings(".input-tips").removeClass().addClass("input-tips input-ok");
            }else{
                t.siblings(".input-tips").removeClass().addClass("input-tips input-error");
            }
        });
	}

	//建筑类型选择
	$("#buildTypeInput input[type='checkbox']").bind("click", function(){
		var val = [];
		$("#buildTypeInput input[type='checkbox']:checked").each(function(index, element) {
            val.push($(this).val());
        });
		$("#buildtype").val(val.join(" "));
	});

	//增加一条周边信息
	$("#addConfig").click(function(){
		var obj = $(this).closest(".item");
		obj.append('<dl class="clearfix"><dt><input type="text" placeholder="名称" class="input-small" /></dt><dd><textarea rows="3" class="input-xxlarge" placeholder="内容"></textarea><a href="javascript:;" class="icon-trash" title="删除"></a></dd></dl>');
	});

	$(".item").delegate(".icon-trash", "click", function(){
		$(this).closest("dl").remove();
	});

	//表单提交
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		$('#addrid').val($('.addrBtn').attr('data-id'));
        var addrids = $('.addrBtn').attr('data-ids').split(' ');
        $('#cityid').val(addrids[0]);
		var t            = $(this),
			id           = $("#id").val(),
			title        = $("#title"),
			addrid       = $("#addrid").val(),
			addr         = $("#addr"),
			litpic       = $("#litpic_").val(),
			opendate     = $("#opendate"),
			price        = $("#price"),
			typeid       = $("input[name='typeidArr']:checked").val(),
			userid       = $("#userid").val(),
			user         = $("#user").val();

		if(!huoniao.regex(title)){
			huoniao.goTop();
			$(".config-nav button:eq(0)").click();
			return false;
		};

		if(addrid == "" || addrid == 0){
			huoniao.goTop();
			$(".config-nav button:eq(0)").click();
			$("#addrList").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			return false;
		}else{
			$("#addrList").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}

		if(!huoniao.regex(addr)){
			huoniao.goTop();
			$(".config-nav button:eq(0)").click();
			return false;
		};

		if(litpic == ""){
			huoniao.goTop();
			$(".config-nav button:eq(0)").click();
			init.showTip("error", "请上传小区图片！", "auto");
			return false;
		};

		if(!huoniao.regex(price)){
			huoniao.goTop();
			$(".config-nav button:eq(0)").click();
			return false;
		};

		if(userid == "" || userid == 0 || user == ""){
			// huoniao.goTop();
			// $("#user").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			// return false;
		}

		var configItem = $("#editform .item:eq(2)").find("dl");
		var configArr = [];
		if(configItem.length > 1){
			for(var i = 1; i < configItem.length; i++){
				var obj = configItem.eq(i);
				var name = obj.find("input").val(), note = obj.find("textarea").val();
				configArr.push(name+"###"+note);
			}
		}
		configArr = configArr.join("|||");

		var pics = [];
		if(typeid == 0){
			if($("#listSection2").find("li").length > 0 && $("#listSection2").find("li").length != 6){
				$.dialog.alert("请上传6张完整的全景图片！");
				return false;
			}

			$("#listSection2").find("img").each(function(index, element) {
        pics.push($(this).attr("data-val"));
	    });
			
		}else if(typeid == 1){
			// if($("#url").val() == ""){
			// 	$.dialog.alert("请输入URL地址！");
			// 	return false;
			// }
		}
		$("#litpic").val(pics.join(","));

		t.attr("disabled", true);

		//异步提交
		huoniao.operaJson("communityAdd.php", $("#editform").serialize() + "&config="+configArr+"&token="+$("#token").val() + "&submit="+encodeURI("提交"), function(data){
			if(data.state == 100){
				if($("#dopost").val() == "save"){
					huoniao.parentTip("success", "小区发布成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
					huoniao.goTop();
					location.reload();
				}else{
					huoniao.parentTip("success", "小区修改成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
					t.attr("disabled", false);
				}
			}else{
				$.dialog.alert(data.info);
				t.attr("disabled", false);
			};
		});
	});

		//视频预览
	$("#videoPreview").delegate("a", "click", function(event){
		event.preventDefault();
		var href = $(this).attr("href"),
			id   = $(this).attr("data-id");

		window.open(href+id, "videoPreview", "height=500, width=650, top="+(screen.height-500)/2+", left="+(screen.width-650)/2+", toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");
	});
	
	//全景类型切换
	$("input[name='typeidArr']").bind("click", function(){
		$("#qj_type0, #qj_type1").hide();
		$("#qj_type"+$(this).val()).show();
	});

	//全景预览
	// $("#licenseFiles a").bind("click", function(event){
	// 	event.preventDefault();
	// 	var id   = $(this).attr("data-id");

	// 	window.open(cfg_attachment+id, "videoPreview", "height=600, width=650, top="+(screen.height-600)/2+", left="+(screen.width-600)/2+", toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");
	// });

	//删除文件
	$(".spic .reupload").bind("click", function(){
		var t = $(this), parent = t.parent(), input = parent.prev("input"), iframe = parent.next("iframe"), src = iframe.attr("src");
		delFile(input.val(), false, function(){
			input.val("");
			input.val("");
			t.prev(".sholder").html('');
			parent.hide();
			iframe.attr("src", src).show();
		});
	});

	$('body').delegate('.sametitle a', 'click', function(e){
		e.preventDefault();
		var t = $(this), title = t.text(), id = t.attr('data-id');
		var href = "communityAdd.php?dopost=edit&id="+id;
		try {
			event.preventDefault();
			parent.addPage("communityEdit"+id, "house", title, "house/"+href);
		} catch(e) {}
	})
	var checkTitleTime;
	$("#title").on("input propertychange", function(){
		var t = $(this), val = $.trim(t.val()), par = t.closest('dl');
		clearTimeout(checkTitleTime);
		$('.sametitle').remove();
		if(val){
			checkTitleTime = setTimeout(function(){
				$.post('?action=checkTitle', 'id='+infoid+'&title='+val, function(aid){
					if(aid > 0){
						par.after('<dl class="clearfix sametitle" style="color:#666;"><dt><label for="">&nbsp;</label></dt><dd>已存在相同标题的信息：<a href="javascript:;" data-id="'+aid+'">'+val+'</a></dd></dl>');
					}
				})
			}, 200)
		}
	})


});

//上传成功接收
function uploadSuccess(obj, file, filetype, fileurl){
	$("#"+obj).val(file);
	var media = "";
	if(filetype == "swf" || file.split(".")[1] == "swf"){
		media = '<embed src="'+fileurl+'" type="application/x-shockwave-flash" quality="high" wmode="transparent">';
	}else if(obj == "video"){
		media = '<video src="'+cfg_attachment+file+'"></video>';
	}else{
		media = '<img src="'+cfg_attachment+file+'" />';
	}
	$("#"+obj).siblings(".spic").find(".sholder").html(media);
	$("#"+obj).siblings(".spic").find(".reupload").attr("style", "display: inline;");
	$("#"+obj).siblings(".spic").show();
	$("#"+obj).siblings("iframe").hide();
}

//删除已上传的文件
function delFile(b, d, c) {
	var g = {
		mod: "house",
		type: "delThumb",
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
