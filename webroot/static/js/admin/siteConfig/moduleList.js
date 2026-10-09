$(function(){
	var init = {

		//拼接分类
		printTypeTree: function(){
			var typeList = [], l=moduleList.length, cl = -45, level = 0;
			var iconIdx = 0;
			for(var i = 0; i < l; i++){
				(function(){
					iconIdx++;
					var jsonArray =arguments[0], jArray = jsonArray.lower;
					if(jsonArray["parentid"] == 0){
						// typeList.push('  <div class="row3"><a href="javascript:;" class="fold">折叠</a></div>');
						// typeList.push('  <div class="row60 left" style="width:65%;"><input type="text" data-id="'+jsonArray["id"]+'" value="'+jsonArray["title"]+'"></div>');
					}else{
						typeList.push('<li class="li0">');
						typeList.push('<div class="tr clearfix tr_'+jsonArray["id"]+'" data-id="'+jsonArray["id"]+'" data-type="'+jsonArray["type"]+'">');

						if(jsonArray["type"] == 0){
							typeList.push('  <div class="row7"><label class="label label-info">'+jsonArray["title"]+'</label></div>');
						}else{
							typeList.push('  <div class="row7"><label class="label label-warning">自定义</label></div>');
						}
						typeList.push('  <div class="row10 left"><input class="input-small title" type="text" data-id="'+jsonArray["id"]+'" value="'+jsonArray["subject"]+'"></div>');

						if(jsonArray["type"] == 0){
							typeList.push('  <div class="row17 left"><input class="input-large link" readonly type="text" data-id="'+jsonArray["id"]+'" value="{#$'+jsonArray["name"]+'_channelDomain#}"></div>');
						}else{
							typeList.push('  <div class="row17 left"><input class="input-large link" type="text" data-id="'+jsonArray["id"]+'" value="'+jsonArray["link"]+'"></div>');
						}
						typeList.push('  <div class="row10 left">'+(jsonArray["icon"] != '' ? '<img src="'+jsonArray["iconturl"]+'" class="img" alt="" style="height:40px;">' : '')+'<a href="javascript:;" class="upfile" title="删除">'+(jsonArray["icon"] ? '重新上传' : '上传图标')+'</a><input type="file" name="Filedata" value="" class="imglist-hidden Filedata hide" id="Filedata_'+iconIdx+'"><input type="hidden" name="icon" class="icon" value="'+jsonArray["icon"]+'"></div>');

						typeList.push('  <div class="row7 left filter">');

						// typeList.push('<div class="color_pick"><em style="background:'+jsonArray["color"]+';"></em></div><input type="hidden" class="color-input" value="'+jsonArray["color"]+'" />');

						// if(jsonArray["type"] == 0){
							if(jsonArray['name'] == defaultindex || jsonArray['id'] == defaultindex){
								typeList.push('<a href="javascript:;" class="index curr"><s class="check checked"></s><br/>取消首页</a>&nbsp;&nbsp;&nbsp;&nbsp;');
							}else{
								typeList.push('<a href="javascript:;" class="index"><s class="check"></s><br/>设为首页</a>&nbsp;&nbsp;&nbsp;&nbsp;');
							}
						// }else{
						// 	typeList.push('<a href="javascript:;" class="index"><s class="check"></s><br/>设为首页</a>&nbsp;&nbsp;&nbsp;&nbsp;');
						// }

						// if(jsonArray['bold'] == 1){
						// 	typeList.push('<a href="javascript:;" class="bold curr"><s class="check checked"></s><br/>加粗</a>&nbsp;&nbsp;&nbsp;&nbsp;');
						// }else{
						// 	typeList.push('<a href="javascript:;" class="bold"><s class="check"></s><br/>加粗</a>&nbsp;&nbsp;&nbsp;&nbsp;');
						// }

						// if(jsonArray['target'] == 1){
						// 	typeList.push('<a href="javascript:;" class="target curr"><s class="check checked"></s><br/>新窗口</a>');
						// }else{
						// 	typeList.push('<a href="javascript:;" class="target"><s class="check"></s><br/>新窗口</a>');
						// }
						typeList.push('</div>');


						typeList.push('  <div class="row30 left filter">');
						if(jsonArray['pc'] == 1){
							typeList.push('<a href="javascript:;" class="pc curr" title="电脑端开关"><s class="check checked"></s><br/>电脑</a>&nbsp;&nbsp;&nbsp;');
						}else{
							typeList.push('<a href="javascript:;" class="pc" title="电脑端开关"><s class="check"></s><br/>电脑</a>&nbsp;&nbsp;&nbsp;');
						}

						if(jsonArray['name'] != 'special' && jsonArray['name'] != 'website'){
							if(jsonArray['h5'] == 1){
								typeList.push('<a href="javascript:;" class="h5 curr" title="H5端开关"><s class="check checked"></s><br/>H5</a>&nbsp;&nbsp;<s class="split"></s>&nbsp;&nbsp;');
							}else{
								typeList.push('<a href="javascript:;" class="h5" title="H5端开关"><s class="check"></s><br/>H5</a>&nbsp;&nbsp;<s class="split"></s>&nbsp;&nbsp;');
							}
						}

						if(jsonArray['name'] != 'special' && jsonArray['name'] != 'website'){
							// if(jsonArray['app'] == 0){
							// 	typeList.push('<a href="javascript:;" class="app curr" title="APP端开关"><s class="check checked"></s><br/>APP</a>&nbsp;&nbsp;');
							// }else{
							// 	typeList.push('<a href="javascript:;" class="app" title="APP端开关"><s class="check"></s><br/>APP</a>&nbsp;&nbsp;');
							// }

                            if(jsonArray['android'] == 1){
								typeList.push('<a href="javascript:;" class="android curr" title="安卓端开关"><s class="check checked"></s><br/>安卓</a>&nbsp;&nbsp;');
							}else{
								typeList.push('<a href="javascript:;" class="android" title="安卓端开关"><s class="check"></s><br/>安卓</a>&nbsp;&nbsp;');
							}

                            if(jsonArray['ios'] == 1){
								typeList.push('<a href="javascript:;" class="ios curr" title="苹果端开关"><s class="check checked"></s><br/>苹果</a>&nbsp;&nbsp;');
							}else{
								typeList.push('<a href="javascript:;" class="ios" title="苹果端开关"><s class="check"></s><br/>苹果</a>&nbsp;&nbsp;');
							}

                            if(jsonArray['harmony'] == 1){
								typeList.push('<a href="javascript:;" class="harmony curr" title="鸿蒙端开关"><s class="check checked"></s><br/>鸿蒙</a>&nbsp;&nbsp;<s class="split"></s>&nbsp;&nbsp;');
							}else{
								typeList.push('<a href="javascript:;" class="harmony" title="鸿蒙端开关"><s class="check"></s><br/>鸿蒙</a>&nbsp;&nbsp;<s class="split"></s>&nbsp;&nbsp;');
							}
						}


						// if(jsonArray["type"] == 0){
							if(jsonArray['name'] != 'special' && jsonArray['name'] != 'website'){
								if(jsonArray['wx'] == 1){
									typeList.push('<a href="javascript:;" class="wx curr" title="微信小程序"><s class="check checked"></s><br/>微信</a>&nbsp;&nbsp;&nbsp;&nbsp;');
								}else{
									typeList.push('<a href="javascript:;" class="wx" title="微信小程序"><s class="check"></s><br/>微信</a>&nbsp;&nbsp;&nbsp;&nbsp;');
								}
							}
						// }

						// if(jsonArray['name'] != 'special' && jsonArray['name'] != 'website'){
						// 	if(jsonArray['bd'] == 1){
						// 		typeList.push('<a href="javascript:;" class="bd curr" title="百度小程序"><s class="check checked"></s><br/>百度</a>&nbsp;&nbsp;&nbsp;&nbsp;');
						// 	}else{
						// 		typeList.push('<a href="javascript:;" class="bd" title="百度小程序"><s class="check"></s><br/>百度</a>&nbsp;&nbsp;&nbsp;&nbsp;');
						// 	}
						// }

						// if(jsonArray['name'] != 'special' && jsonArray['name'] != 'website'){
						// 	if(jsonArray['qm'] == 1){
						// 		typeList.push('<a href="javascript:;" class="qm curr" title="QQ小程序"><s class="check checked"></s><br/>QQ</a>&nbsp;&nbsp;&nbsp;&nbsp;');
						// 	}else{
						// 		typeList.push('<a href="javascript:;" class="qm" title="QQ小程序"><s class="check"></s><br/>QQ</a>&nbsp;&nbsp;&nbsp;&nbsp;');
						// 	}
						// }

						if(jsonArray['name'] != 'special' && jsonArray['name'] != 'website'){
							if(jsonArray['dy'] == 1){
								typeList.push('<a href="javascript:;" class="dy curr" title="抖音小程序"><s class="check checked"></s><br/>抖音</a>');
							}else{
								typeList.push('<a href="javascript:;" class="dy" title="抖音小程序"><s class="check"></s><br/>抖音</a>');
							}
						}

						typeList.push('</div>');

						typeList.push('  <div class="row9"><a href="javascript:;" class="up">向上</a><a href="javascript:;" class="down">向下</a></div>');
					}

					if(jsonArray["parentid"] == 0){
						// typeList.push('  <div class="row17 left"><a href="javascript:;" class="del" title="删除">删除编辑</a></div>');
					}else{
						typeList.push('  <div class="row10 left">');
						if(jsonArray["type"] == 0){
							if(jsonArray["state"] == 0){
								typeList.push('<a href="javascript:;" title="停用" class="disable">停用</a>');
							}else{
								typeList.push('<a href="javascript:;" title="启用" class="enable" style="color:#f00">启用</a>');
							}
							typeList.push('&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+location.href+'?dopost=uninstall&id='+jsonArray["id"]+'" title="卸载" class="uninstall">卸载</a></div>');
						}else{
							typeList.push('<a href="javascript:;" class="del">编辑</a>');
						}
					}

					typeList.push('</div>');

					if(jArray.length > 0){
						//typeList.push('<ul class="subnav ul'+level+'">');
					}
					for(var k = 0; k < jArray.length; k++){

						cl = cl + 45, level = level + 0;

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
						typeList.push('</li>');
					}else{
						typeList.push('</li>');
					}
				})(moduleList[i]);
			}
			$(".root").html(typeList.join(""));
			init.dragsort();
		}

		//树形递归分类
		,treeTypeList: function(id, parentid){
			var l=moduleList.length, typeList = [], cl = "", level = 0;
			for(var i = 0; i < l; i++){
				(function(){
					var jsonArray =arguments[0], selected = "";
					//选中
					if(parentid == jsonArray["id"]){
						selected = " selected";
					}
					typeList.push('<option value="'+jsonArray["id"]+'"'+selected+'>'+cl+"|--"+jsonArray["title"]+'</option>');
				})(moduleList[i]);
			}
			return typeList.join("");
		}

		//拖动排序
		,dragsort: function(){
			$('.root').sortable({
				items: '.li0',
				placeholder: 'placeholder',
				orientation: 'vertical',
				axis: 'y',
				handle:'>div.tr',
				opacity: .5,
				revert: 0,
				stop:function(){
					// saveOpera(1);
				}
			});
		}
	};

	//拼接现有分类
	if(moduleList != ""){
		init.printTypeTree();
	};

	//批量修改
	$(".operBtn a").bind("click", function(){
		var platform = $(this).attr('data-platform'), type = $(this).attr("data-type"), txt = $(this).text();
		var dopost = platform == 'subnav' ? 'importDefaultData' : 'batchModuleState';
        var title = '确定要' + txt + '吗？';
        if(platform == 'subnav'){
            title += '<br />该功能主要用于恢复【后台模块管理菜单】和【系统管理组权限设置】中的内容。<br />操作前请先到商店中校验并同步最新文件！';
        }
        $.dialog.confirm(title, function(){
            huoniao.operaJson("moduleList.php?dopost="+dopost, "&platform="+platform+"&state="+type+"&token="+token, function(data){
                if(data.state == 100){
                    huoniao.showTip("success", data.info);
                    setTimeout(function(){
                        //停用或者启用模块需要刷新后台
                        if(platform == 'state' || platform == 'subnav'){
                            top.location.href = "../index.php?gotopage=siteConfig/moduleList.php";
                        }else{
                            location.reload();
                        }
                    }, 1000);
                }else{
                    huoniao.showTip("error", data.info, "auto");
                }
            });
        });        

    });

	//选择颜色
	$(".root").find('.color_pick').each(function(){
		var t = $(this);
		t.colorPicker({
			callback: function(color) {
				var color = color.length === 7 ? color : '';
				t.siblings(".color-input").val(color);
				$(this).find("em").css({"background": color});
				saveOpera(1);
			}
		});
	});

	var cid = 0;

	//底部添加自定义链接
	$("#addNew").bind("click", function(){
		var html = [];
		cid++;
		html.push('<li class="li0">');
		html.push('  <div class="tr clearfix" data-id="0" data-type="1">');
		html.push('    <div class="row7"><label class="label label-warning">自定义</label></div>');
		html.push('	  <div class="row10 left"><input class="input-small title" type="text" data-id="0" /></div>');
		html.push('	  <div class="row17 left"><input class="input-large link" type="text" data-id="0" /></div>');
		html.push('	  <div class="row10 left">');
		html.push('	    <img src="" class="img" style="height: 40px;" />');
		html.push('	    <a href="javascript:;" class="upfile" title="删除">上传图标</a>');
		html.push('	    <input type="file" name="Filedata" class="imglist-hidden Filedata hide" id="Filedata_cus_'+cid+'" />');
		html.push('	    <input type="hidden" name="icon" class="icon" value="" />');
		html.push('	  </div> ');
		html.push('	  <div class="row15 left filter">');
		html.push('<div class="color_pick"><em style="background:;"></em></div>');
		html.push('<input type="hidden" class="color-input" value="" />');
		html.push('<a href="javascript:;" class="bold"><s class="check"></s>加粗</a>&nbsp;&nbsp;&nbsp;&nbsp;');
		html.push('<a href="javascript:;" class="target"><s class="check"></s>新窗口</a>&nbsp;&nbsp;&nbsp;&nbsp;');
		html.push('	  </div> ');
		html.push('	  <div class="row22"></div> ');
		html.push('	  <div class="row9"><a href="javascript:;" class="up">向上</a><a href="javascript:;" class="down">向下</a></div> ');
		html.push('	  <div class="row10 left"><a href="javascript:;" class="del">删除</a></div>');
		html.push('</li>');

		$(this).parent().parent().prev(".root").append(html.join(""));

		var t = $(this).parent().parent().prev(".root").find('li:last-child .color_pick');
		t.colorPicker({
			callback: function(color) {
				var color = color.length === 7 ? color : '';
				t.siblings(".color-input").val(color);
				$(this).find("em").css({"background": color});
			}
		});
	});

	//安装新模块
	$("#installNew").bind("click", function(){
		try {
			event.preventDefault();
			parent.addPage("store", "store", "商店", "siteConfig/store.php");
		} catch(e) {}
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
			// saveOpera(1);
		}
	});

	//排序向下
	$(".root").delegate(".down", "click", function(){
		var t = $(this), parent = t.parent().parent().parent(), index = parent.index(), length = parent.siblings("li").length;
		if(index != length){
			parent.before(parent.next("li"));
			// saveOpera(1);
		}
	});

	//设为首页
	$(".list").delegate(".index", "click", function(){
		var t = $(this), id = t.closest(".tr").attr("data-id"), type = 'set';
		if(!t.hasClass("curr")){
			//t.closest(".list").find(".index").removeClass("curr").html("设为首页");
			// t.addClass("curr").html("取消首页");
		}else{
			// t.removeClass("curr").html("设为首页");
			type = 'clear';
		}

		huoniao.operaJson("siteConfig.php?action=setSystemIndex", "&type="+type+"&module="+id+"&token="+token, function(data){
			location.reload();
		});

	});


	//微信小程序启用、停用
	$(".list").delegate(".wx", "click", function(){
		var t = $(this), id = t.closest(".tr").attr("data-id"), type = 1;
		if(!t.hasClass("curr")){
		}else{
			type = 0;
		}

		huoniao.operaJson("moduleList.php?dopost=updateModuleWx", "&id="+id+"&state="+type+"&token="+token, function(data){
			if(data.state == 100){
				if(!t.hasClass("curr")){
					t.addClass('curr');
					t.find('.check').addClass('checked');
				}else{
					t.removeClass('curr');
					t.find('.check').removeClass('checked');
				}
			}else{
				huoniao.showTip("error", data.info, "auto");
			}
		});

	});


	//百度小程序启用、停用
	$(".list").delegate(".bd", "click", function(){
		var t = $(this), id = t.closest(".tr").attr("data-id"), type = 1;
		if(!t.hasClass("curr")){
		}else{
			type = 0;
		}

		huoniao.operaJson("moduleList.php?dopost=updateModuleBd", "&id="+id+"&state="+type+"&token="+token, function(data){
			if(data.state == 100){
				if(!t.hasClass("curr")){
					t.addClass('curr');
					t.find('.check').addClass('checked');
				}else{
					t.removeClass('curr');
					t.find('.check').removeClass('checked');
				}
			}else{
				huoniao.showTip("error", data.info, "auto");
			}
		});

	});


	//QQ小程序启用、停用
	$(".list").delegate(".qm", "click", function(){
		var t = $(this), id = t.closest(".tr").attr("data-id"), type = 1;
		if(!t.hasClass("curr")){
		}else{
			type = 0;
		}

		huoniao.operaJson("moduleList.php?dopost=updateModuleQm", "&id="+id+"&state="+type+"&token="+token, function(data){
			if(data.state == 100){
				if(!t.hasClass("curr")){
					t.addClass('curr');
					t.find('.check').addClass('checked');
				}else{
					t.removeClass('curr');
					t.find('.check').removeClass('checked');
				}
			}else{
				huoniao.showTip("error", data.info, "auto");
			}
		});

	});


	//抖音小程序启用、停用
	$(".list").delegate(".dy", "click", function(){
		var t = $(this), id = t.closest(".tr").attr("data-id"), type = 1;
		if(!t.hasClass("curr")){
		}else{
			type = 0;
		}

		huoniao.operaJson("moduleList.php?dopost=updateModuleDy", "&id="+id+"&state="+type+"&token="+token, function(data){
			if(data.state == 100){
				if(!t.hasClass("curr")){
					t.addClass('curr');
					t.find('.check').addClass('checked');
				}else{
					t.removeClass('curr');
					t.find('.check').removeClass('checked');
				}
			}else{
				huoniao.showTip("error", data.info, "auto");
			}
		});

	});


	//APP启用、停用
	$(".list").delegate(".app", "click", function(){
		var t = $(this), id = t.closest(".tr").attr("data-id"), type = 0;
		if(!t.hasClass("curr")){
		}else{
			type = 1;
		}

		huoniao.operaJson("moduleList.php?dopost=updateModuleApp", "&id="+id+"&state="+type+"&token="+token, function(data){
			if(data.state == 100){
				if(!t.hasClass("curr")){
					t.addClass('curr');
					t.find('.check').addClass('checked');
				}else{
					t.removeClass('curr');
					t.find('.check').removeClass('checked');
				}
			}else{
				huoniao.showTip("error", data.info, "auto");
			}
		});

	});


	//鸿蒙启用、停用
	$(".list").delegate(".harmony", "click", function(){
		var t = $(this), id = t.closest(".tr").attr("data-id"), type = 0;
		if(t.hasClass("curr")){
		}else{
			type = 1;
		}

		huoniao.operaJson("moduleList.php?dopost=updateModuleHarmony", "&id="+id+"&state="+type+"&token="+token, function(data){
			if(data.state == 100){
				if(!t.hasClass("curr")){
					t.addClass('curr');
					t.find('.check').addClass('checked');
				}else{
					t.removeClass('curr');
					t.find('.check').removeClass('checked');
				}
			}else{
				huoniao.showTip("error", data.info, "auto");
			}
		});

	});


	//安卓启用、停用
	$(".list").delegate(".android", "click", function(){
		var t = $(this), id = t.closest(".tr").attr("data-id"), type = 0;
		if(t.hasClass("curr")){
		}else{
			type = 1;
		}

		huoniao.operaJson("moduleList.php?dopost=updateModuleAndroid", "&id="+id+"&state="+type+"&token="+token, function(data){
			if(data.state == 100){
				if(!t.hasClass("curr")){
					t.addClass('curr');
					t.find('.check').addClass('checked');
				}else{
					t.removeClass('curr');
					t.find('.check').removeClass('checked');
				}
			}else{
				huoniao.showTip("error", data.info, "auto");
			}
		});

	});


	//鸿蒙启用、停用
	$(".list").delegate(".ios", "click", function(){
		var t = $(this), id = t.closest(".tr").attr("data-id"), type = 0;
		if(t.hasClass("curr")){
		}else{
			type = 1;
		}

		huoniao.operaJson("moduleList.php?dopost=updateModuleIos", "&id="+id+"&state="+type+"&token="+token, function(data){
			if(data.state == 100){
				if(!t.hasClass("curr")){
					t.addClass('curr');
					t.find('.check').addClass('checked');
				}else{
					t.removeClass('curr');
					t.find('.check').removeClass('checked');
				}
			}else{
				huoniao.showTip("error", data.info, "auto");
			}
		});

	});


	//PC启用、停用
	$(".list").delegate(".pc", "click", function(){
		var t = $(this), id = t.closest(".tr").attr("data-id"), type = 1;
		if(!t.hasClass("curr")){
		}else{
			type = 0;
		}

		huoniao.operaJson("moduleList.php?dopost=updateModulePc", "&id="+id+"&state="+type+"&token="+token, function(data){
			if(data.state == 100){
				if(!t.hasClass("curr")){
					t.addClass('curr');
					t.find('.check').addClass('checked');
				}else{
					t.removeClass('curr');
					t.find('.check').removeClass('checked');
				}
			}else{
				huoniao.showTip("error", data.info, "auto");
			}
		});

	});


	//H5启用、停用
	$(".list").delegate(".h5", "click", function(){
		var t = $(this), id = t.closest(".tr").attr("data-id"), type = 1;
		if(!t.hasClass("curr")){
		}else{
			type = 0;
		}

		huoniao.operaJson("moduleList.php?dopost=updateModuleH5", "&id="+id+"&state="+type+"&token="+token, function(data){
			if(data.state == 100){
				if(!t.hasClass("curr")){
					t.addClass('curr');
					t.find('.check').addClass('checked');
				}else{
					t.removeClass('curr');
					t.find('.check').removeClass('checked');
				}
			}else{
				huoniao.showTip("error", data.info, "auto");
			}
		});

	});


	//加粗启用、停用
	$(".list").delegate(".bold", "click", function(){
		var t = $(this), id = t.closest(".tr").attr("data-id"), type = 1;
		if(id == 0){
			if(!t.hasClass("curr")){
				t.addClass('curr');
				t.find('.check').addClass('checked');
			}else{
				t.removeClass('curr');
				t.find('.check').removeClass('checked');
			}
			return false;
		}else{
			if(!t.hasClass("curr")){
			}else{
				type = 0;
			}

			huoniao.operaJson("moduleList.php?dopost=updateModuleBold", "&id="+id+"&state="+type+"&token="+token, function(data){
				if(data.state == 100){
					if(!t.hasClass("curr")){
						t.addClass('curr');
						t.find('.check').addClass('checked');
					}else{
						t.removeClass('curr');
						t.find('.check').removeClass('checked');
					}
				}else{
					huoniao.showTip("error", data.info, "auto");
				}
			});
		}

	});


	//新窗口启用、停用
	$(".list").delegate(".target", "click", function(){
		var t = $(this), id = t.closest(".tr").attr("data-id"), type = 1;
		if(id == 0){
			if(!t.hasClass("curr")){
				t.addClass('curr');
				t.find('.check').addClass('checked');
			}else{
				t.removeClass('curr');
				t.find('.check').removeClass('checked');
			}
			return false;
		}else{
			if(!t.hasClass("curr")){
			}else{
				type = 0;
			}

			huoniao.operaJson("moduleList.php?dopost=updateModuleTarget", "&id="+id+"&state="+type+"&token="+token, function(data){
				if(data.state == 100){
					if(!t.hasClass("curr")){
						t.addClass('curr');
						t.find('.check').addClass('checked');
					}else{
						t.removeClass('curr');
						t.find('.check').removeClass('checked');
					}
				}else{
					huoniao.showTip("error", data.info, "auto");
				}
			});
		}

	});


	//删除
	$(".root").delegate(".del", "click", function(event){
		event.preventDefault();
		var t = $(this), id = t.parent().parent().find(".title").attr("data-id"), type = t.parent().text();

		if(t.parent().parent().next("ul").html() != undefined && t.parent().parent().next("ul").html() != ""){
			$.dialog.alert("该目录下含有已安装模块<br />请先卸载(或转移至其它目录下)！");
		}else{
			//从数据库删除
			if(type.indexOf("编辑") > -1){
				$.dialog.confirm('确定要删除吗？', function(){
					huoniao.operaJson("moduleList.php?dopost=del", "id="+id, function(data){
						if(data.state == 100){
							huoniao.showTip("success", data.info, "auto");
							setTimeout(function() {
								location.reload();
								// top.location.href = "../index.php?gotopage=siteConfig/moduleList.php";
							}, 800);
						}else{
							alert(data.info);
							return false;
						}
					});
				});
			}else{
				t.parent().parent().parent().remove();
			}
		}
	});

	//停用
	$(".root").delegate(".disable", "click", function(){
		var t = $(this), id = t.parent().parent().attr("data-id");
		huoniao.showTip("loading", "正在操作，请稍候...");
		huoniao.operaJson("moduleList.php?dopost=disable", "id="+id, function(data){
			huoniao.hideTip();
			if(data.state == 100){
				huoniao.showTip("success", data.info, "auto");
				setTimeout(function() {
					//location.reload();
					top.location.href = "../index.php?gotopage=siteConfig/moduleList.php";
				}, 800);
			}else{
				alert(data.info);
				return false;
			}
		});
	});

	//启用
	$(".root").delegate(".enable", "click", function(){
		var t = $(this), id = t.parent().parent().attr("data-id");
		huoniao.showTip("loading", "正在操作，请稍候...");
		huoniao.operaJson("moduleList.php?dopost=enable", "id="+id, function(data){
			huoniao.hideTip();
			if(data.state == 100){
				huoniao.showTip("success", data.info, "auto");
				setTimeout(function() {
					//location.reload();
					top.location.href = "../index.php?gotopage=siteConfig/moduleList.php";
				}, 800);
			}else{
				alert(data.info);
				return false;
			}
		});
	});

	//卸载
	$(".root").delegate(".uninstall", "click", function(event){
		event.preventDefault();
		var url = $(this).attr("href");
		$.dialog.confirm('<font color="#ff0000">卸载后此模块下的所有数据将被清空，如有重要资料，请提前做好备份！！！</font><br />此操作不可恢复，您确定要卸载吗？', function(){
			location.href = url;
		});
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
          $("#saveBtn").click();
      }
  });

	//保存
	$("#saveBtn").bind("click", function(){
		saveOpera("");
	});



	//上传单张图片
	function mysub(id){
    var t = $("#"+id), p = t.parent(), img = t.parent().children(".img"), uploadHolder = t.siblings('.upfile');

    var data = [];
    data['mod'] = 'siteConfig';
    data['filetype'] = 'image';
    data['type'] = 'logo';

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

        	uploadHolder.removeClass('disabled').text('重新上传');
					if(t.closest('.tr').attr('data-id')){
						saveOpera(1);
					}

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
		uploadHolder.removeClass('disabled').text('重新上传');
	}

	//删除已上传图片
	var delAtlasPic = function(picpath){
		var g = {
			mod: "siteConfig",
			type: "delLogo",
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
			var html =arguments[0],
				count = 0,
				jArray = $(html).find(">ul>li"),
				type = $(html).find(".tr").attr("data-type"),
				title = $(html).find(".tr .title").val(),
				link = $(html).find(".tr .link").val(),
				icon = $(html).find(".tr .icon").val(),
				color = $(html).find(".tr .color-input").val(),
				index = $(html).find(".tr .index").hasClass("curr") ? '1' : '0',
				bold = $(html).find(".tr .bold").hasClass("curr") ? '1' : '0',
				target = $(html).find(".tr .target").hasClass("curr") ? '1' : '0',
				wx = $(html).find(".tr .wx").hasClass("curr") ? '1' : '0',
				id = $(html).find(".tr").attr("data-id");

			if(jArray.length > 0 && title != ""){
				json = json + '{"id": "'+id+'", "type": "'+type+'", "title": "'+encodeURIComponent(title)+'", "link": "'+encodeURIComponent(link)+'", "icon": "'+encodeURIComponent(icon)+'", "color": "'+encodeURIComponent(color)+'", "index": "'+index+'", "bold": "'+bold+'", "target": "'+target+'", "wx": "'+wx+'", "lower": [';
				for(var k = 0; k < jArray.length; k++){
					if($(jArray[k]).find(">ul>li").length > 0){
						arguments.callee(jArray[k]);
					}else{
						var title = $(jArray[k]).find(".tr .title").val(), id = $(jArray[k]).find(".tr").attr("data-id");
						if(title != ""){
							json = json + '{"id": "'+id+'"},';
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
				if(title != ""){
					json = json + '{"id": "'+id+'", "type": "'+type+'", "title": "'+encodeURIComponent(title)+'", "link": "'+encodeURIComponent(link)+'", "icon": "'+encodeURIComponent(icon)+'", "color": "'+encodeURIComponent(color)+'", "index": "'+index+'", "bold": "'+bold+'", "target": "'+target+'", "wx": "'+wx+'", "lower": null},';
				}
			}
		})(first[i]);
	}
	json = json.substr(0, json.length-1);
	json = json + ']';

	if(json == "]") return false;

	huoniao.operaJson("moduleList.php?dopost=typeAjax", "data="+json, function(data){
		if(data.state == 100){
			huoniao.showTip("success", data.info, "auto");
			if(type == ""){
				window.scroll(0, 0);
				setTimeout(function() {
					location.reload();
				}, 800);
			}
		}else{
			huoniao.showTip("error", data.info, "auto");
		}
	});
}
