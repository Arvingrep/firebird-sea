$(function(){
	var treeLevel = 1;
	var init = {

		//拼接分类
		printTypeTree: function(){
			var typeList = [], l=typeListArr.length, cl = -45, level = 0, addType = '';
			var iconIdx = 0;
			for(var i = 0; i < l; i++){
				(function(){
					iconIdx++;

					var jsonArray =arguments[0], jArray = jsonArray.lower;
					typeList.push('<li class="li'+level+'">');
					if(level < treeLevel){
						addType = '<a href="javascript:;" class="add-type" data-level="'+level+'">添加下级分类</a>';
					}else{
						addType = '';
					}

					typeList.push('<div class="tr clearfix tr_'+jsonArray["id"]+'">');
					if(jsonArray["parentid"] == 0){
						typeList.push('  <div class="row3"><a href="javascript:;" class="fold">折叠</a></div>');
						typeList.push('  <div class="row40 left"><input type="text" data-id="'+jsonArray["id"]+'" value="'+jsonArray["typename"]+'">'+addType+'</div>');
					}else{
						typeList.push('  <div class="row3"></div>');
						typeList.push('  <div class="row40 left"><span class="plus-icon" style="margin-left:'+cl+'px;"></span><input type="text" data-id="'+jsonArray["id"]+'" value="'+jsonArray["typename"]+'">'+addType+'</div>');
					}
					typeList.push('  <div class="row20">'+(jsonArray["icon"] != '' ? '<img src="'+jsonArray["iconturl"]+'" class="img" alt="" style="height:40px;">' : '')+'<a href="javascript:;" class="upfile" title="删除">上传图标</a><input type="file" name="Filedata" value="" class="imglist-hidden Filedata hide" id="Filedata_'+iconIdx+'"><input type="hidden" name="icon" class="icon" value="'+jsonArray["icon"]+'"></div>');
					typeList.push('  <div class="row20"><a href="javascript:;" class="up">向上</a><a href="javascript:;" class="down">向下</a></div>');
					typeList.push('  <div class="row17 left">');
					if(jsonArray["parentid"] == 0){
						typeList.push(' <a href="javascript:;" class="edit" title="编辑">编辑</a>');
					}
					typeList.push('<a href="javascript:;" class="del" title="删除">删除编辑</a></div>')
					typeList.push('</div>');

					if(jArray.length > 0){
						typeList.push('<ul class="subnav ul'+level+'">');
					}
					for(var k = 0; k < jArray.length; k++){

						cl = cl + 45, level = level + 1;

						if(jArray[k]['lower'] != null){
							arguments.callee(jArray[k]);
						}
					}
					if(jsonArray["parentid"] == 0){
						cl = -45, level = 0;
					}else{
						cl = cl - 45, level = level - 1;
					}
					if(jArray.length > 0){
						typeList.push('</ul></li>');
					}else{
						typeList.push('</li>');
					}
				})(typeListArr[i]);
			}
			$(".root").html(typeList.join(""));
			init.dragsort();
		}
		//树形递归分类
		,treeTypeList: function(id, parentid, rank){
			var l=typeListArr.length, typeList = [], cl = "", level = 0;
			typeList.push('<option value="0">顶级分类</option>');
			for(var i = 0; i < l; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower, selected = "";
					//移动分类限制：下级往上级移，不可上级往下级或同级移
					if(id == jsonArray["id"] || rank == level){
						cl = cl.replace("&nbsp;&nbsp;&nbsp;&nbsp;", ""), level = level - 1;
						return;
					}
					//选中
					if(parentid == jsonArray["id"]){
						selected = " selected";
					}
					typeList.push('<option value="'+jsonArray["id"]+'"'+selected+'>'+cl+"|--"+jsonArray["typename"]+'</option>');
					for(var k = 0; k < jArray.length; k++){
						cl += '&nbsp;&nbsp;&nbsp;&nbsp;', level = level + 1;
						var selected = "";
						if(parentid == jArray[k]["id"]){
							selected = " selected";
						}
						if(jArray[k]['lower'] != null){
							arguments.callee(jArray[k]);
						}else{
							typeList.push('<option value="'+jArray[k]["id"]+'"'+selected+'>'+cl+"|--"+jArray[k]["typename"]+'</option>');
						}
					}
					if(jsonArray["lower"] == null){
						cl = "", level = 0;
					}else{
						cl = cl.replace("&nbsp;&nbsp;&nbsp;&nbsp;", ""), level = level - 1;
					}
				})(typeListArr[i]);
			}
			return typeList.join("");
		}
		//树形递归分类
		,treeTypeList_: function(){
			var typeList = [], cl = "";
			var l=typeListArr;
			for(var i = 0; i < l.length; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower;
					typeList.push('<option value="'+jsonArray["id"]+'">'+cl+"|--"+jsonArray["typename"]+'</option>');
					for(var k = 0; k < jArray.length; k++){
						cl += '    ';
						if(jArray[k]['lower'] != ""){
							arguments.callee(jArray[k]);
						}else{
							typeList.push('<option value="'+jArray[k]["id"]+'">'+cl+"|--"+jArray[k]["typename"]+'</option>');
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
				//快速编辑
		,quickEdit: function(id, rank){
			if(id == ""){
				huoniao.showTip("warning", "请选择要修改的分类！", "auto");
			}else{
				huoniao.showTip("loading", "正在获取信息，请稍候...");

				huoniao.operaJson("homemakingType.php?dopost=getTypeDetail&action="+action, "id="+id, function(data){
					if(data != null){
						var retData = data;
						data = retData[0];
						huoniao.hideTip();
						//huoniao.showTip("success", "获取成功！", "auto");

						var content = $("#editForm").html();
						var width = 480;

						// // 拼接管理员列表
						// if(auditSwitch){
						// 	width = 700;
						// 	var adminList = retData[1];
						// 	var admin = $('#edit_'+id).attr('data-admin');
						// 	var adminArr = admin != '' ? admin.split(',') : [];
						// 	var options = [];
						// 	for(var i in adminList){
						// 		if(i == 'in_array') continue;
						// 		var d = adminList[i];
						// 		var selected = $.inArray(d.id, adminArr) > -1 ? ' selected' : '';
						// 		options.push('<option value="'+d.id+'"'+selected+'>'+d.nickname+(d.mtype == 3 ? ' -- 分站管理员' : '')+'</option>');
						// 	}
						// 	content = content.replace(/-xlarge/g, '-xxlarge');
						// 	content = content.replace('auditStyle', 'style="width:530px;"');

						// 	content = content.replace('$adminList', options.join(""));
						// }

						$.dialog({
							fixed: true,
							title: '修改分类',
							content: content,
							width: width,
							init: function(){
								// if(auditSwitch){
								// 	var pg = self.parent;
								// 	var d = $('#editForm');
								// 	if(pg.$('#chosenCss').length == 0){
								// 		pg.$('head').append('<link rel="stylesheet" type="text/css" href="'+chosenCss+'" id="chosenCss">')
								// 		pg.$.getScript(chosenJs, function(response,status){
								// 			pg.$(".chosen-select").chosen();
								// 		})
								// 	}else{
								// 		pg.$(".chosen-select").chosen();
								// 	}
								// }
							},
							ok: function(){
								//提交
								var title    = self.parent.$("#title").val(),
									litpic   = self.parent.$("#litpic").val(),
									note  	 = self.parent.$("#note").val(),
									serialize = self.parent.$(".quick-editForm").serialize();


								if($.trim(title) == ""){
									alert("请输入标题名称");
									return false;
								}
								if(litpic == ""){
									alert("请上传图片");
									return false;
								}

								huoniao.operaJson("homemakingType.php?dopost=updateType&action="+action, "id="+id+"&"+serialize+"&type1=1", function(data){
									if(data.state == 100){
										huoniao.showTip("success", data.info, "auto");
										setTimeout(function() {
											location.reload();
										}, 800);
									}else if(data.state == 101){
										alert(data.info);
										return false;
									}else{
										huoniao.showTip("error", data.info, "auto");
									}
								});

							},
							cancel: true
						});

						//填充信息
						self.parent.$("#title").val(data.title);
						self.parent.$("#note").val(data.note);
						self.parent.$("#litpic_").val(data.litpic);
						if(data.litpic){
							self.parent.$(".spic").show();
							self.parent.$(".sholder").append("<img style='max-width:200px; max-height:300px;' src='/include/attachment.php?f="+data.litpic+"'>");
							// self.parent.$("#iframe").hide();
						}

						// if(auditSwitch){
						// 	self.parent.$("#admin").val(data.admin);
						// 	var adminName = '';
						// 	if(data.admin != '0'){
						// 		for(var i = 0; i < adminList.length; i++){
						// 			if(adminList[i].id == data.admin){
						// 				adminName = adminList[i].nickname;
						// 			}
						// 		}
						// 	}
						// 	self.parent.$("#adminName").val(adminName);
						// }

					}else{
						huoniao.showTip("error", "信息获取失败！", "auto");
					}
				});
			}

		}
		//拖动排序
		,dragsort: function(){
			//一级
			$('.root').sortable({
	            items: '>li.li0',
				placeholder: 'placeholder',
	            orientation: 'vertical',
	            axis: 'y',
				handle:'>div.tr',
	            opacity: .5,
	            revert: 0,
				stop:function(){
					// saveOpera(1);
					huoniao.stopDrag();
				}
	        });
			for(var i = 0; i <= treeLevel; i++){
				$('.root .li'+i).sortable({
					items: '.li'+(i+1),
					placeholder: 'placeholder',
					orientation: 'vertical',
					axis: 'y',
					handle:'>div.tr',
					opacity: .5,
					revert: 0,
					stop:function(){
						// saveOpera(1);
						huoniao.stopDrag();
					}
				});
			}
		}
	};

	// $(".quick-editForm").on("load", function(event){//判断 iframe是否加载完成  这一步很重要
	// 　　$(".reupload",this.contentDocument).click(function(){//添加点击事件
	// 　　　　alert("就是这样");
	// 　　});
	// });
	// function cxsc(){
	// 	var t = $(this), parent = t.parent(), input = parent.prev("input"), iframe = parent.next("iframe"), src = iframe.attr("src");
	// 	delFile(input.val(), false, function(){
	// 		input.val("");
	// 		t.prev(".sholder").html('');
	// 		parent.hide();
	// 		iframe.attr("src", src).show();
	// 	});
	// }
	//拼接现有分类
	if(typeListArr != ""){
		init.printTypeTree();
	};

	//搜索
	$("#searchBtn").bind("click", function(){
		var keyword = $("#keyword").val(), typeList = [], l=typeListArr.length, addType = '';
		if(keyword == "") {
			$("#keyword").focus(); return false;
		}
		$("#list .tr").removeClass("light");
		for(var i = 0; i < l; i++){
			(function(){
				var jsonArray =arguments[0], jArray = jsonArray.lower;
				if(jsonArray["typename"].indexOf(keyword) > -1){
					$(".tr_"+jsonArray["id"]).addClass("light");
				}
				for(var k = 0; k < jArray.length; k++){
					if(jArray[k]['lower'] != null){
						arguments.callee(jArray[k]);
					}
				}

			})(typeListArr[i]);
		}
		//定位第一个
		if($('#list .light').length > 0){
			$(document).scrollTop(Number($('#list .light:first').offset().top));
		}
	});

	//搜索回车提交
    $("#keyword").keyup(function (e) {
        if (!e) {
            var e = window.event;
        }
        if (e.keyCode) {
            code = e.keyCode;
        }
        else if (e.which) {
            code = e.which;
        }
        if (code === 13) {
            $("#searchBtn").click();
        }
    });

	//头部添加新分类
	$("#addNew_").bind("click", function(){
		var html = [];

		html.push('<li class="li0">');
		html.push('  <div class="tr clearfix">');
		html.push('    <div class="row3"><a href="javascript:;" class="fold">折叠</a></div>');
		html.push('    <div class="row60 left"><input data-id="0" type="text" value=""><a href="javascript:;" class="add-type" data-level="0">添加下级分类</a></div>');
		html.push('    <div class="row20"><a href="javascript:;" class="up">向上</a><a href="javascript:;" class="down">向下</a></div>');
		html.push('    <div class="row17 left"><a href="javascript:;" class="del">删除</a></div>');
		html.push('  </div>');
		html.push('</li>');

		$(".root").prepend(html.join(""));
	});

	//底部添加新分类
	$("#addNew").bind("click", function(){
		var html = [];

		html.push('<li class="li0">');
		html.push('  <div class="tr clearfix">');
		html.push('    <div class="row3"><a href="javascript:;" class="fold">折叠</a></div>');
		html.push('    <div class="row60 left"><input data-id="0" type="text" value=""><a href="javascript:;" class="add-type" data-level="0">添加下级分类</a></div>');
		html.push('    <div class="row20"><a href="javascript:;" class="up">向上</a><a href="javascript:;" class="down">向下</a></div>');
		html.push('    <div class="row17 left"><a href="javascript:;" class="del">删除</a></div>');
		html.push('  </div>');
		html.push('</li>');

		$(this).parent().parent().prev(".root").append(html.join(""));
	});

	//全部展开
	$("#unfold").bind("click", function(){
		$(".root .li0 .fold").removeClass("unfold");
		$(".root .subnav").show();
	});

	//全部收起
	$("#away").bind("click", function(){
		$(".root .li0 .fold").addClass("unfold");
		$(".root .subnav").hide();
	});

	//添加下级分类
	$(".root").delegate(".add-type", "click", function(){
		var parent = $(this).parent().parent(), level = Number($(this).attr("data-level")), m = $(this).siblings(".plus-icon").css("margin-left"), margin = Number(m == undefined ? -45 : m.replace("px", "")), html = [], addType = '';
		if(level < treeLevel - 1){
			addType = '<a href="javascript:;" class="add-type" data-level="'+Number(level+1)+'">添加下级分类</a>';
		}else{
			addType = '';
		};
		html.push('<li class="li'+Number(level+1)+'">');
		html.push('  <div class="tr clearfix">');
		html.push('    <div class="row3"></div>');
		html.push('    <div class="row60 left"><span class="plus-icon" style="margin-left:'+Number(margin+45)+'px"></span><input data-id="" type="text" value="">'+addType+'</div>');
		html.push('    <div class="row20"><a href="javascript:;" class="up">向上</a><a href="javascript:;" class="down">向下</a></div>');
		html.push('    <div class="row17 left"><a href="javascript:;" class="del">删除</a></div>');
		html.push('  </div>');
		html.push('</li>');
		if(parent.next("ul").html() != undefined){
			parent.next("ul").append(html.join(""));
		}else{
			parent.after('<ul class="subnav">'+html.join("")+'</ul>');
		}

		$(this).parent().siblings(".row3").find(".fold").removeClass("unfold");
		parent.next("ul").show();
		//parent.next("ul").find("input:last").focus();
	});

	//折叠、展开
	$(".root").delegate(".fold", "click", function(){
		if($(this).hasClass("unfold")){
			$(this).removeClass("unfold");
			$(this).parent().parent().parent().find("ul").show();
		}else{
			$(this).addClass("unfold");
			$(this).parent().parent().parent().find("ul").hide();
		}
	});

	//表单回车提交
	$("#list").delegate("input", "keyup", function(e){
        if (!e) {
            var e = window.event;
        }
        if (e.keyCode) {
            code = e.keyCode;
        }
        else if (e.which) {
            code = e.which;
        }
        if (code === 13) {
            //$("#saveBtn").click();
        }
    });

	//input焦点离开自动保存
	$("#list").delegate("input", "blur", function(){
		var id = $(this).attr("data-id"), value = $(this).val();
		if(id != "" && id != 0){
			huoniao.operaJson("homemakingType.php?dopost=updateType&id="+id+"&action="+action, "type=single&typename="+value, function(data){
				if(data.state == 100){
					huoniao.showTip("success", data.info, "auto");
				}else if(data.state == 101){
					//huoniao.showTip("warning", data.info, "auto");
				}else{
					huoniao.showTip("error", data.info, "auto");
				}
			});
		}
	});

	//鼠标经过li
	$("#list").delegate(".tr", "mouseover", function(){
		$(this).parent().addClass("hover");
	});
	$("#list").delegate(".tr", "mouseout", function(){
		$(this).parent().removeClass("hover");
	});

	//排序向上
	$(".root").delegate(".up", "click", function(){
		var t = $(this), parent = t.parent().parent().parent(), index = parent.index(), length = parent.siblings("li").length;
		if(index != 0){
			parent.after(parent.prev("li"));
			//saveOpera(1);
			huoniao.stopDrag();
		}
	});

	//排序向下
	$(".root").delegate(".down", "click", function(){
		var t = $(this), parent = t.parent().parent().parent(), index = parent.index(), length = parent.siblings("li").length;
		if(index != length){
			parent.before(parent.next("li"));
			//saveOpera(1);
			huoniao.stopDrag();
		}
	});

	//删除
	$(".root").delegate(".del", "click", function(event){
		event.preventDefault();
		var t = $(this), id = t.parent().parent().find("input").attr("data-id"), type = t.parent().text();

		if(t.parent().parent().next("ul").html() != undefined && t.parent().parent().next("ul").html() != ""){
			$.dialog.alert("该分类下含有子级分类，请先删除(或转移)子级内容！");
		}else{
			//从数据库删除
			if(type.indexOf("编辑") > -1){
				huoniao.operaJson("homemakingType.php?dopost=del&action="+action, "id="+id, function(data){
					if(data.state == 100){
						huoniao.showTip("success", data.info, "auto");
						setTimeout(function() {
							location.reload();
						}, 800);
					}else{
						alert(data.info);
						return false;
					}
				});
				//跳转到对应删除页面
			}else{
				t.parent().parent().parent().remove();
			}
		}
	});

	//保存
	$("#saveBtn").bind("click", function(){
		saveOpera("");
	});

	//批量删除
	$("#batch").bind("click", function(){
		$.dialog({
			fixed: false,
			title: "批量删除",
			content: '<div class="batch-data"><p class="muted">选择要删除的分类，多个按【ctrl+点击】选择</p><select id="category" multiple>'+init.treeTypeList_()+'</select></div>',
			width: 310,
			ok: function(){
				var ids = [];
				self.parent.$("#category option:selected").each(function(){
					ids.push($(this).val());
				});
				if(ids.length <= 0){
					alert("请选择要删除的分类");
					return false;
				}else{

					$.dialog.confirm("确定后，此分类下的子级和帖子信息也将同时删除！<br />删除后无法恢复，请谨慎操作！！！", function(){

						huoniao.showTip("loading", "正在删除，，请稍候...");
						huoniao.operaJson("homemakingType.php?dopost=del&action="+action, "id="+ids.join(","), function(data){
							if(data.state == 100){

								huoniao.showTip("success", data.info, "auto");
								setTimeout(function() {
									location.reload();
								}, 800);

							}else{
								alert(data.info);
								return false;
							}
						});

					}, function(){});

				}
			},
			cancel: true
		});
	});

	//修改
	$(".root").delegate(".edit", "click", function(){
		var id = $(this).parent().parent().find("input").attr("data-id"), rank = $(this).parent().parent().find(".add-type").attr("data-level");
		rank = rank == undefined ? treeLevel : rank;
		init.quickEdit(id, rank);
	});


	//返回最近访问的位置
	huoniao.scrollTop();

	//上传单张图片
	function mysub(id){
	    var t = $("#"+id), p = t.parent(), img = t.parent().children(".img"), uploadHolder = t.siblings('.upfile');

	    var data = [];
	    data['mod'] = 'homemaking';
	    data['filetype'] = 'image';
	    data['type'] = 'adv';

	    $.ajaxFileUpload({
	      url: "/include/upload.inc.php",
	      fileElementId: id,
	      dataType: "json",
	      data: data,
	      success: function(m, l) {
	        if (m.state == "SUCCESS") {
	        	if(img.length > 0){
	        		img.attr('src', m.turl);
	        		delAtlasPic(p.find(".icon").val());
	        	}else{
	        		p.prepend('<img src="'+m.turl+'" alt="" class="img" style="height:40px;">');
	        	}
	        	p.find(".icon").val(m.url);

	        	uploadHolder.removeClass('disabled').text('上传图标');

	        } else {
	          uploadError(m.state, id, uploadHolder);
	        }
	      },
	      error: function() {
	        uploadError("网络错误，请重试！", id, uploadHolder);
	      }
	  	});
	}

	function uploadError(info, id, uploadHolder){
		$.dialog.alert(info);
		uploadHolder.removeClass('disabled').text('上传图标');
	}

	//删除已上传图片
	var delAtlasPic = function(picpath){
		var g = {
			mod: "homemaking",
			type: "deladv",
			picpath: picpath,
			randoms: Math.random()
		};
		$.ajax({
			type: "POST",
			url: "/include/upload.inc.php",
			data: $.param(g)
		})
	};

	$("#list").delegate(".upfile", "click", function(){
		var t = $(this), inp = t.siblings("input");
		if(t.hasClass("disabled")) return;
		inp.click();
	})

	$("#list").delegate(".Filedata", "change", function(){
		if ($(this).val() == '') return;
		$(this).siblings('.upfile').addClass('disabled').text('正在上传···');
	    mysub($(this).attr("id"));
	})


});

//保存
function saveOpera(type){
	var first = $("ul.root>li"), json = '[';
	for(var i = 0; i < first.length; i++){
		(function(){
			var html =arguments[0], count = 0, jArray = $(html).find(">ul>li"), tr = $(html).find(".tr input"), id = tr.attr("data-id"), val = tr.val(), icon = $(html).find(".tr .icon").val();

			if(jArray.length > 0 && val != ""){
				json = json + '{"id": "'+id+'", "name": "'+encodeURIComponent(val)+'", "icon": "'+icon+'", "lower": [';
				for(var k = 0; k < jArray.length; k++){
					if($(jArray[k]).find(">ul>li").length > 0){
						arguments.callee(jArray[k]);
					}else{
						var tr = $(jArray[k]).find(".tr input"), id = tr.attr("data-id"), val = tr.val();
						icon = $(jArray[k]).find(".tr .icon").val();
						if(val != ""){
							json = json + '{"id": "'+id+'", "name": "'+encodeURIComponent(val)+'", "icon": "'+icon+'", "lower": null},';
						}else{
							count++;
						}
					}
				}
				json = json.substr(0, json.length-1);
				if(count == jArray.length){
					json = json + 'null},';
				}else{
					json = json + ']},';
				}
			}else{
				if(val != ""){
					json = json + '{"id": "'+id+'", "name": "'+encodeURIComponent(val)+'", "icon": "'+icon+'", "lower": null},';
				}
			}
		})(first[i]);
	}
	json = json.substr(0, json.length-1);
	json = json + ']';

	if(json == "]") return false;

	var scrolltop = $(document).scrollTop();
	var href = huoniao.changeURLPar(location.href, "scrolltop", scrolltop);

	huoniao.showTip("loading", "正在保存，请稍候...");
	huoniao.operaJson("homemakingType.php?dopost=typeAjax", "data="+json, function(data){
		if(data.state == 100){
			huoniao.showTip("success", data.info, "auto");
			if(type == ""){
					location.href = href;
			}
		}else{
			huoniao.showTip("error", data.info, "auto");
		}
	});
}
