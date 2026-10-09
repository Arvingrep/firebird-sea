//实例化编辑器
var ue = UE.getEditor('note');

$(function(){
	huoniao.parentHideTip();

	//下拉选择控件
  $(".chosen-select").chosen();

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


	//头部导航切换
	$(".config-nav button").bind("click", function(){
		var index = $(this).index(), type = $(this).attr("data-type");
		if(!$(this).hasClass("active")){
			$(".item").hide();
			$(".item:eq("+index+")").fadeIn();
		}
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

	//删除已选择的标签/技能（非浮窗）
	$(".selectedTags").delegate("span a", "click", function(){
		var pp = $(this).parent(), id = pp.attr("data-id"), input = pp.parent().next("input");
		pp.remove();

		var val = input.val().split(",");
		val.splice($.inArray(id,val),1);
		input.val(val.join(","));
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

   	$("[name='fenxaiotype']").click(function () {
   		var fenxaiotypeval = $(this).val();
   		if(fenxaiotypeval ==1){
			$("#fenxiaonote").show();
		}else{
			$("#fenxiaonote").hide();
		}
	})

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

	//开盘、交房时间
	$("#deliverdate, #opendate").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch'});

	$("#fenxiaotime").datetimepicker({format: 'yyyy-mm-dd hh:ii:ss', pickerPosition: "top-right", autoclose: true, language: 'ch'});

	//团购开始、结束时间
	$("#tuanbegan, #tuanend").datetimepicker({format: 'yyyy-mm-dd hh:ii:ss', pickerPosition: "top-right", autoclose: true, language: 'ch'});

	//模糊匹配会员
	$("#manage").bind("input", function(){
		$("#manageuid").val("0");
		$("#managePhone").html("");
		var t = $(this), val = t.val();
		if(val != ""){
			t.addClass("input-loading");
			huoniao.operaJson("../inc/json.php?action=checkUser", "key="+val, function(data){
				t.removeClass("input-loading");
				if(!data) {
					$("#manageList").html("").hide();
					$("#managePhone").html("");
					return false;
				}
				var list = [];
				for(var i = 0; i < data.length; i++){
					list.push('<li data-id="'+data[i].id+'" data-phone="'+data[i].phone+'">'+data[i].username+'</li>');
				}
				if(list.length > 0){
					var pos = t.position();
					$("#manageList")
						.css({"left": pos.left, "top": pos.top + 36, "width": t.width() + 12})
						.html('<ul>'+list.join("")+'</ul>')
						.show();
				}else{
					$("#manageList").html("").hide();
					$("#managePhone").html("");
				}
			});

		}else{
			$("#manageList").html("").hide();
			$("#managePhone").html("");
		}
	});

	$("#manageList").delegate("li", "click", function(){
		var name = $(this).text(), id = $(this).attr("data-id"), phone = $(this).attr("data-phone");
		$("#manage").val(name);
		$("#manageuid").val(id);
		$("#manageList").html("").hide();
		$("#managePhone").html("电话："+phone);
		return false;
	});
	//顾问模糊匹配
	// $("#user").bind("input", function(){
	// 	$("#userid").val("0");
	// 	var t = $(this), val = t.val();
	// 	if(val != ""){
	// 		t.addClass("input-loading");
	// 		huoniao.operaJson("../inc/json.php?action=checkGw", "key="+val, function(data){
	// 			t.removeClass("input-loading");
	// 			if(!data) {
	// 				$("#userList").html("").hide();
	// 				return false;
	// 			}
	// 			var list = [];
	// 			for(var i = 0; i < data.length; i++){
	// 				list.push('<li data-id="'+data[i].id+'" title="'+data[i].username+'">'+data[i].username+'</li>');
	// 			}
	// 			if(list.length > 0){
	// 				var pos = t.position();
	// 				$("#userList")
	// 					.css({"left": pos.left, "top": pos.top + 36, "width": t.width() + 12})
	// 					.html('<ul>'+list.join("")+'</ul>')
	// 					.show();
	// 			}else{
	// 				$("#userList").html("").hide();
	// 			}
	// 		});

	// 	}else{
	// 		$("#userList").html("").hide();
	// 	}
 //    });

	// $("#userList").delegate("li", "click", function(){
	// 	var name = $(this).text(), id = $(this).attr("data-id");
	// 	$("#user").val(name);
	// 	$("#userid").val(id);
	// 	$("#userList").html("").hide();
	// 	$("#user").siblings(".input-tips").removeClass().addClass("input-tips input-ok");
	// 	return false;
	// });

	// $(document).click(function (e) {
 //        var s = e.target;
 //        if (!jQuery.contains($("#userList").get(0), s)) {
 //            if (jQuery.inArray(s.id, "user") < 0) {
 //                $("#userList").hide();
 //            }
 //        }
 //    });

	// $("#user").bind("blur", function(){
	// 	var t = $(this), val = t.val(), flag = false;
	// 	if(val != ""){
	// 		t.addClass("input-loading");
	// 		huoniao.operaJson("../inc/json.php?action=checkGw", "key="+val, function(data){
	// 			t.removeClass("input-loading");
	// 			if(data) {
	// 				for(var i = 0; i < data.length; i++){
	// 					if(data[i].username == val){
	// 						flag = true;
	// 						$("#userid").val(data[i].id);
	// 					}
	// 				}
	// 			}
	// 			if(flag){
	// 				t.siblings(".input-tips").addClass("input-ok");
	// 			}else{
	// 				t.siblings(".input-tips").addClass("input-error");
	// 			}
	// 		});
	// 	}else{
	// 		t.siblings(".input-tips").removeClass().addClass("input-tips input-error");
	// 	}
	// });

	//建筑类型选择
	$("#buildTypeInput input[type='checkbox']").bind("click", function(){
		var val = [];
		$("#buildTypeInput input[type='checkbox']:checked").each(function(index, element) {
            val.push($(this).val());
        });
		$("#buildtype").val(val.join(" "));
	});

	//团购交互
	$("input[type=checkbox][name=tuan]").bind("click", function(){
		if($(this).is(":checked")){
			$("#tuanObj").show();
		}else{
			$("#tuanObj").hide();
		}
	});

	//增加一条周边信息
	$("#addConfig").click(function(){
		var obj = $(this).closest(".item");
		obj.append('<dl class="clearfix"><dt><input type="text" placeholder="名称" class="input-small" /></dt><dd><textarea rows="3" class="input-xxlarge" placeholder="内容"></textarea><a href="javascript:;" class="icon-trash" title="删除"></a></dd></dl>');
	});

	$(".item").delegate(".icon-trash", "click", function(){
		$(this).closest("dl").remove();
	});


	$(document).mousemove(function(e) {
        if (!!this.move) {
            var posix = !document.move_target ? {
                'x': 0,
                'y': 0
            } : document.move_target.posix
              , callback = document.call_down || function() {
                $(this.move_target).css({
                    'top': e.pageY - posix.y,
                    'left': e.pageX - posix.x
                });
            }
            ;
            callback.call(this, e, posix);
        }
    }).mouseup(function(e) {
        if (!!this.move) {
            var callback = document.call_up || function() {}
            ;
            callback.call(this, e);
            $.extend(this, {
                'move': false,
                'move_target': null,
                'call_down': false,
                'call_up': false
            });
        }
    });

	//上传单张图片
    function mysub(id){
        var t = $("#"+id), p = t.parent(), img = t.parent().children(".img"), uploadHolder = t.siblings('.upfile');
		if(id == 'FiledataTemp'){
			img = $('.recTempObj').find('img:eq(0)');
		}else if(id.indexOf('FiledataStyle') > -1){
			var style = p.closest('.style').attr('data-style');
			img = $('.recTempObj .style' + style).find('img');
		}

        var data = [];
        data['mod'] = 'siteConfig';
        data['filetype'] = 'image';
        data['type'] = 'card';

        $.ajaxFileUpload({
            url: "/include/upload.inc.php",
            fileElementId: id,
            dataType: "json",
            data: data,
            success: function(m, l) {
                if (m.state == "SUCCESS") {

                    if(img.length > 0){
                        img.attr('src', m.turl);

						if(id == 'FiledataTemp'){
							$('.recTempObj').attr('data-img', m.url);
						}else if(id.indexOf('FiledataStyle') > -1){
							var style = p.closest('.style').attr('data-style');
							$('.recTempObj .style' + style).attr('data-pic', m.url);
							$('.recTempObj .style' + style).find('img').attr('src', m.turl);
						}else{
	                        delAtlasPic(p.find(".icon").val());
						}
                    }else{
						if(id == 'FiledataTemp'){
							$('.recTempObj').attr('data-img', m.url).html('<img src="'+m.turl+'" />');
						}else if(id.indexOf('FiledataStyle') > -1){
							var style = p.closest('.style').attr('data-style');
							$('.recTempObj .style' + style).attr('data-pic', m.url);
							$('.recTempObj .style' + style).find('p').remove();
							$('.recTempObj .style' + style).append('<img src="'+m.turl+'" />');
						}else{
	                        p.prepend('<img src="'+m.turl+'" alt="" class="img" style="height:40px;">');
						}
                    }

					if(id == 'FiledataTemp'){
						uploadHolder.removeClass('disabled').text('重新上传带访确认单模板');
					}else if(id.indexOf('FiledataStyle') > -1){
						uploadHolder.removeClass('disabled').text('重新上传');
					}else{
	                    p.find(".pic").val(m.url);
						uploadHolder.removeClass('disabled').text('上传图标');
					}


                } else {
                    uploadError(m.state, id, uploadHolder);
                }
            },
            error: function(a, b, c, d) {
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
            mod: "siteConfig",
            type: "delcard",
            picpath: picpath,
            randoms: Math.random()
        };
        $.ajax({
            type: "POST",
            url: "/include/upload.inc.php",
            data: $.param(g)
        })
    };

    $(".table").delegate(".upfile", "click", function(){
        var t = $(this), inp = t.siblings("input");
        if(t.hasClass("disabled")) return;
        inp.click();
    })

    $(".table").delegate(".Filedata", "change", function(){
        if ($(this).val() == '') return;
        $(this).siblings('.upfile').addClass('disabled').text('正在上传···');

        mysub($(this).attr("id"));
    })


	$(".recTemp").delegate(".upfile", "click", function(){
		var t = $(this), inp = t.siblings("input");
		if(t.hasClass("disabled")) return;
		inp.click();
	})

    $(".recTemp").delegate(".Filedata", "change", function(){
        if ($(this).val() == '') return;
        $(this).siblings('.upfile').addClass('disabled').text('正在上传···');

        mysub($(this).attr("id"));
    })

	var styleID = 0;

	//选择打印项
	$('.recItem').delegate('li', 'click', function(){
		var t = $(this), rid = t.attr('data-id'), txt = t.text();
		createDrag(rid, txt, 16, '#000000', 150, 30, 0, 0, '', '');
	});

	//删除打印项
	$('.recTempObj').delegate('s', 'click', function(){
		var t = $(this), par = t.closest('.drag'), style = par.attr('data-style');
		$('.style' + style).remove();
	});
	$('.recStyle').delegate('.del', 'click', function(){
		var t = $(this), par = t.closest('.style'), style = par.attr('data-style');
		$('.style' + style).remove();
	});

	if(receiptData){

		var cycleData_ = [];
		$('.table tbody tr').each(function(index){
			var t = $(this), tit = t.find('.title').val();
			cycleData_['f'+index] = tit;
		});

		for (var i = 0; i < receiptData.length; i++) {
			var d = receiptData[i], rid = d.id;
			var txt = '';

			switch (rid) {
				case 'name':
					txt = '客户姓名';
					break;
				case 'tel':
					txt = '客户电话';
					break;
				case 'channel':
					txt = '报备渠道';
					break;
				case 'loupan':
					txt = '报备楼盘';
					break;
				case 'seller':
					txt = '渠道销售';
					break;
				case 'time':
					txt = '报备时间';
					break;
				case 'note':
					txt = '备注';
					break;
				case 'custom':
					txt = '自定义';
					break;
				default:
					txt = cycleData_[rid];
					break;
			}

			createDrag(rid, txt, d.fontsize, d.color, d.width, d.height, d.left, d.top, d.pic, d.note);
		}
	}

	//创建可拖拽的层
	function createDrag(rid, txt, fontsize, color, width, height, left, top, pic, note){

		var content = '<p>'+(rid == 'custom' && note ? note.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>') : txt)+'</p>';
		if(rid == 'custom' && pic){
			content = '<img src="/include/attachment.php?f='+pic+'" />';
		}

		$('<div data-id="'+rid+'" data-style="'+styleID+'" data-fontsize="'+fontsize+'" data-color="'+color+'" data-width="'+width+'" data-height="'+height+'" data-left="'+left+'" data-top="'+top+'" data-pic="'+pic+'" data-note="'+note+'" class="drag style'+styleID+'" title="'+txt+'"><s>&times;</s>'+content+'<span class="resize"></span></div>')
			.appendTo(".recTempObj")
			.on('mousedown', '.resize', function(e) {
				var obj = $(this).parent();
		        var posix = {
		            'w': obj.width(),
		            'h': obj.height(),
		            'x': e.pageX,
		            'y': e.pageY
		        };
		        $.extend(document, {
		            'move': true,
		            'call_down': function(e) {
						var wid = Math.max(30, e.pageX - posix.x + posix.w);
						var hei = Math.max(30, e.pageY - posix.y + posix.h);
		                obj.css({
		                    'width': wid,
		                    'height': hei
		                });
						obj.attr('data-width', wid);
						obj.attr('data-height', hei);
		            }
		        });
		        return false;
		    })
			.drag(function(ev, dd){
				$(this)
					.css({
						top: dd.offsetY,
						left: dd.offsetX
					})
					.attr('data-left', dd.offsetX)
					.attr('data-top', dd.offsetY);
	  		}, {relative: true})
			.css({
				'width': (width ? width + 'px' : 'auto'),
				'height': (height ? height + 'px' : 'auto'),
				'font-size': fontsize + 'px',
				'color': color,
				'left': left + 'px',
				'top': top + 'px'
			});

		//if(width && height){
			var obj = $('.recTempObj .style' + styleID);
			obj.attr('data-width', obj.width()).attr('data-height', obj.height()).css('width', obj.width()).css('height', obj.height());
		//}

		var html = [];
		html.push('<div class="style style'+styleID+'" data-style="'+styleID+'">');

		html.push('<label>'+txt+'</label>');
		html.push('<div class="input-prepend input-append">');
		html.push('<span class="add-on">字体大小</span>');
		html.push('<input style="width: 50px;" min="1" class="fontsize" type="number" value="'+fontsize+'">');
		html.push('<span class="add-on">px</span>');
		html.push('</div>');
		html.push('<div class="input-prepend">');
		html.push('<span class="add-on">颜色</span>');
		html.push('<div class="color_pick"><em style="background:'+(color ? color : '#000000')+';"></em></div>');
		html.push('</div>');

		//自定义
		if(rid == 'custom'){
			html.push('<div class="pic">');
			if(pic){
				html.push('<img src="/include/attachment.php?f='+pic+'" />');
			}
			html.push('<a href="javascript:;" class="upfile" title="上传图片">上传图片</a>');
			html.push('<input type="file" name="Filedata" class="imglist-hidden Filedata hide" id="FiledataStyle'+styleID+'">');
			html.push('</div>');
			html.push('<div class="input-prepend">');
			html.push('<span class="add-on">自定义内容</span>');
			html.push('<textarea class="input-xxlarge note" style="height: 80px;">'+note+'</textarea>');
			html.push('</div>');
		}

		html.push('<s class="del">&times;</s>');
		html.push('</div>');

		$('.recStyle').append(html.join(''));

		$('.recStyle').find('.style:last .color_pick').colorPicker({
			callback: function(color) {
				var color = color.length === 7 ? color : '';
				var style = $(this).closest('.style').attr('data-style');
				$(this).find("em").css({"background": color});
				$('.recTempObj .style' + style).attr('data-color', color);
				$('.recTempObj .style' + style).css('color', color);
			}
		});

		styleID++;

	}



	//自定义图片
	var clickPic = 0;
	$(".recStyle").delegate(".upfile", "click", function(){
		var t = $(this), inp = t.siblings("input");
		if(t.hasClass("disabled")) return;
		inp.click();
		clickPic = 1;
		return false;
	});
    $(".recStyle").delegate(".Filedata", "change", function(){
        if ($(this).val() == '') return;
        $(this).siblings('.upfile').addClass('disabled').text('正在上传···');
        mysub($(this).attr("id"));
    });

	//编辑自定义样式
	$('.recStyle').delegate('.style', 'click', function(){
		var t = $(this), style = t.attr('data-style');
		$('.recTempObj .drag, .recStyle .style').removeClass('curr');
		$('.style' + style).addClass('curr');
		if(!clickPic){
			return false;
		}
	});
	$('.recTempObj').delegate('.drag', 'click', function(){
		var t = $(this), style = t.attr('data-style');
		$('.recTempObj .drag, .recStyle .style').removeClass('curr');
		$('.style' + style).addClass('curr');
		if(!clickPic){
			return false;
		}
	});

	//字体大小
	$('.recStyle').delegate('.fontsize', 'input', function(){
		var t = $(this), val = t.val(), par = t.closest('.style'), style = par.attr('data-style');
		$('.recTempObj .style' + style).attr('data-fontsize', val);
		$('.recTempObj .style' + style).css('font-size', val + 'px');
	});

	//自定义内容
	$('.recStyle').delegate('.note', 'input', function(){
		var t = $(this), val = t.val(), par = t.closest('.style'), style = par.attr('data-style');
		$('.recTempObj .style' + style).attr('data-note', val);
		$('.recTempObj .style' + style).find('p').html((val == '' ? '自定义' : val.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>')));
	});

	$('body').bind('click', function(){
		$('.recTempObj .drag, .recStyle .style').removeClass('curr');
		clickPic = 0;
	});



	//表单提交
	$("#editform").submit(function(e){
		e.preventDefault();
		$("#btnSubmit").click();
	})
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
			litpic       = $("#litpic").val(),
			deliverdate  = $("#deliverdate").val(),
			opendate     = $("#opendate").val(),
			price        = $("#price"),
			tuan         = $("input[type=checkbox][name=tuan]"),
			tuantitle    = $("#tuantitle"),
			tuanbegan    = $("#tuanbegan").val(),
			tuanend      = $("#tuanend").val(),
			userid       = $("#userid").val(),
			user         = $("#user").val(),
			investor     = $("#investor"),
			protype      = $("#protype").val(),
			address      = $("#address"),
			tel          = $("#tel"),
			zhuangxiu    = $("#zhuangxiu").val(),
			buildage     = $("#buildage");

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
			init.showTip("error", "请上传楼盘图片！", "auto");
			return false;
		};

		// if(deliverdate == ""){
		// 	huoniao.goTop();
		// 	$(".config-nav button:eq(0)").click();
		// 	init.showTip("error", "请选择预计开盘时间！", "auto");
		// 	return false;
		// };

		// if(opendate == ""){
		// 	huoniao.goTop();
		// 	$(".config-nav button:eq(0)").click();
		// 	init.showTip("error", "请选择预计交房时间！", "auto");
		// 	return false;
		// };

		if(!huoniao.regex(price)){
			huoniao.goTop();
			$(".config-nav button:eq(0)").click();
			return false;
		};

		if(tuan.is(":checked")){
			if(!huoniao.regex(tuantitle)){
				$(".config-nav button:eq(0)").click();
				return false;
			};

			if(tuanbegan == ""){
				$.dialog.alert("请选择团购开始时间！");
				return false;
			}

			if(tuanend == ""){
				$.dialog.alert("请选择团购结束时间！");
				return false;
			}

			if(Date.ParseString(tuanbegan) - Date.ParseString(tuanend) > 0){
				$.dialog.alert("团购结束时间必须大于开始时间！");
				return false;
			}
		}

		// if(userid == "" || userid == 0 || user == ""){
		// 	huoniao.goTop();
		// 	$(".config-nav button:eq(1)").click();
		// 	$("#userid").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
		// 	return false;
		// }

		if(!huoniao.regex(investor)){
			huoniao.goTop();
			$(".config-nav button:eq(1)").click();
			return false;
		};

		if(protype == "" || protype == 0){
			huoniao.goTop();
			$(".config-nav button:eq(1)").click();
			$("#proList").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			return false;
		}else{
			$("#proList").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}

		if(!huoniao.regex(address)){
			huoniao.goTop();
			$(".config-nav button:eq(1)").click();
			return false;
		};

		// if(!huoniao.regex(tel)){
		// 	huoniao.goTop();
		// 	$(".config-nav button:eq(1)").click();
		// 	return false;
		// };

		if(zhuangxiu == "" || zhuangxiu == 0){
			$(".config-nav button:eq(1)").click();
			$("#zhuangxiuList").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			return false;
		}else{
			$("#zhuangxiuList").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}

		if(!huoniao.regex(buildage)){
			$(".config-nav button:eq(1)").click();
			return false;
		};

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

		//带访确认单打印模板
		var receiptData = [];
		var receiptImg = $('.recTempObj').attr('data-img');
		receiptData.push('&receiptImg=' + receiptImg);

		var recData = [];
		$('.recTempObj').find('.drag').each(function(){
			var t = $(this);
			var rid = t.attr('data-id'),
				fontsize = t.attr('data-fontsize'),
				color = t.attr('data-color'),
				width = t.attr('data-width'),
				height = t.attr('data-height'),
				left = t.attr('data-left'),
				top = t.attr('data-top'),
				pic = encodeURIComponent(t.attr('data-pic')),
				note = encodeURIComponent(t.attr('data-note'));

			recData.push(rid + '@@' + fontsize + '@@' + color + '@@' + width + '@@' + height + '@@' + left + '@@' + top + '@@' + pic + '@@' + note);
		});
		receiptData.push('receiptData=' + recData.join('|||'));

		t.attr("disabled", true);

		//异步提交
		huoniao.operaJson("loupanAdd.php", $("#editform").serialize() + "&config="+configArr+receiptData.join("&")+"&token="+$("#token").val() + "&submit="+encodeURI("提交"), function(data){
			if(data.state == 100){
				if($("#dopost").val() == "save"){
					huoniao.parentTip("success", "楼盘发布成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
					huoniao.goTop();
					location.reload();
				}else{
					huoniao.parentTip("success", "楼盘修改成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
					t.attr("disabled", false);
				}
			}else{
				$.dialog.alert(data.info);
				t.attr("disabled", false);
			};
		});
	});

	//销售状态切换
	$("input[type=radio][name=salestate]").change(function(){
		var t = $(this), val = t.val(), n = t.closest('dl').next().find('input');
		if(val == "1" || val == "2"){
			n.prop('readonly', false);
		}else{
			n.prop('readonly', true);
		}
	})

	$('body').delegate('.sametitle a', 'click', function(e){
		e.preventDefault();
		var t = $(this), title = t.text(), id = t.attr('data-id');
		var href = "loupanAdd.php?dopost=edit&id="+id;
		try {
			event.preventDefault();
			parent.addPage("loupanEdit"+id, "house", title, "house/"+href);
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
