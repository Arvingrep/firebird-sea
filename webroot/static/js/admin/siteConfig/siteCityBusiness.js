$(function(){
	//新增商圈
	$(".btn-primary").bind("click", function(){
		$.dialog({
			fixed: true,
			title: '新增商圈',
			content: $("#addNew").html(),
			width: 450,
			ok: function(){
				var qid = parent.$("#qBtn").val(), hot = parent.$("#hot").is(":checked") ? 1 : 0, name = $.trim(parent.$("#name").val());

				if(qid == 0){
					alert("请选择所属区域！");
					return false;
				}

				if(name == ""){
					alert("请输入商圈名称");
					return false;
				}

				var data = [],
				t = this;
				data.push("qid="+qid);
				data.push("hot="+hot);
				data.push("name="+name);

				huoniao.operaJson("siteCityBusiness.php?dopost=add&cid="+cid, data.join("&"), function(data){
					if(data && data['state'] == 100){
						t.close();
						location.reload();
					}else{
						alert(data.info);
					}
				});
				return false;

			}
		});
	});

	//input焦点离开自动保存
	$("#list").delegate("input", "blur", function(){
		var id = $(this).attr("data-id"), value = $(this).val();
		if(id != "" && id != 0 && id != undefined){
			huoniao.operaJson("siteCityBusiness.php?dopost=updateType&id="+id, "type=single&name="+value, function(data){
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

	//input焦点离开自动保存
	$("#list").delegate("input[type=checkbox]", "click", function(){
		var id = $(this).parent().prev("input").attr("data-id"), value = $(this).is(":checked");
		value = value ? 1 : 0;
		if(id != "" && id != 0 && id != undefined){
			huoniao.operaJson("siteCityBusiness.php?dopost=updateType&id="+id, "type=hot&val="+value, function(data){
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

	//input焦点离开自动保存
	$(".citylist").delegate("#tel", "blur", function(){
		var id = $(this).parent().parent().attr("data-id"), value = $(this).val();
		if(id != "" && id != 0 && id != undefined){
			huoniao.operaJson("siteCityBusiness.php?dopost=updateType&id="+id, "type=tel&tel="+value, function(data){
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

	$(".citylist").delegate("#address", "blur", function(){
		var id = $(this).parent().parent().attr("data-id"), value = $(this).val();
		if(id != "" && id != 0 && id != undefined){
			huoniao.operaJson("siteCityBusiness.php?dopost=updateType&id="+id, "type=address&address="+value, function(data){
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

	//下拉菜单过长设置滚动条
	$(".dropdown-toggle").bind("click", function(){
		if($(this).parent().attr("id") != "typeBtn" && $(this).parent().attr("id") != "addrBtn"){
			var height = document.documentElement.clientHeight - $(this).offset().top - $(this).height() - 30;
			$(this).next(".dropdown-menu").css({"max-height": height, "overflow-y": "auto"});
		}
	});


	//删除
	$("#list").delegate(".del", "click", function(event){
		event.preventDefault();
		var t = $(this), id = t.parent().parent().find("input").attr("data-id"), type = t.parent().text();
		//从异步请求
		$.dialog.confirm("删除后无法恢复，确定要删除吗？", function(){
			huoniao.showTip("loading", "正在删除，，请稍候...");
			huoniao.operaJson("siteCityBusiness.php?dopost=del", "id="+id, function(data){
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
		});

	});

	$(".openStart").datetimepicker({format: 'hh:ii', startView: 1, minView: 0, autoclose: true, language: 'ch'}).on('change',function(){
      	var id = $(this).parent().parent().parent().attr("data-id"), value = $(this).val();
		if(id != "" && id != 0 && id != undefined){
			huoniao.operaJson("siteCityBusiness.php?dopost=updateType&id="+id, "type=openStart&openStart="+value, function(data){
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

    $(".openEnd").datetimepicker({format: 'hh:ii', startView: 1, minView: 0, autoclose: true, language: 'ch'}).on('change',function(){
      	var id = $(this).parent().parent().parent().attr("data-id"), value = $(this).val();
		if(id != "" && id != 0 && id != undefined){
			huoniao.operaJson("siteCityBusiness.php?dopost=updateType&id="+id, "type=openEnd&openEnd="+value, function(data){
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

    //上传单张图片
	function mysub(id){
		var t = $("#"+id), p = t.parent(), img = t.parent().children(".img"), uploadHolder = t.siblings('.upfile');

		var data = [];
    	data['mod'] = 'tuan';
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
			mod: "tuan",
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

	$(".citylist").delegate(".upfile", "click", function(){
		var t = $(this), inp = t.siblings("input");
		if(t.hasClass("disabled")) return;
		inp.click();
	})

	$(".citylist").delegate(".Filedata", "change", function(){
		if ($(this).val() == '') return;
		$(this).siblings('.upfile').addClass('disabled').text('正在上传···');

		console.log($(this).attr("id"))
	    mysub($(this).attr("id"));
	});

	//保存
	$("#saveBtn").bind("click", function(){
		saveOpera();
	});


});
//标注地图
$(".citylist").on("click", ".markditu", function(){
	var address = $(this).attr("data-city"),lnglat = $(this).attr("data-lnglat");
	var id = $(this).attr("data-id"),t = $(this);
    $.dialog({
		id: "markDitu",
		title: "标注地图位置<small>（请点击/拖动图标到正确的位置，再点击底部确定按钮。）</small>",
		content: 'url:'+adminPath+'../api/map/mark.php?mod=siteConfig&lnglat='+lnglat+"&city="+cid+"&address="+address,
		width: 800,
		height: 500,
		max: true,
		ok: function(){
			var doc = $(window.parent.frames["markDitu"].document),
				lng = doc.find("#lng").val(),
				lat = doc.find("#lat").val(),
				address = doc.find("#addr").val();
			t.siblings("#lnglat").val(lng+","+lat);
			t.siblings("#lng").val(lng);
			t.siblings("#lat").val(lat);
			t.siblings("#address").val(address);
			var value = lng+","+lat;
			if(id != "" && id != 0 && id != undefined){
				huoniao.operaJson("siteCityBusiness.php?dopost=updateType&id="+id, "type=lnglat&lnglat="+value+"&address="+address+"&lng="+lng+"&lat="+lat, function(data){
					if(data.state == 100){
						huoniao.showTip("success", data.info, "auto");
					}else if(data.state == 101){
						//huoniao.showTip("warning", data.info, "auto");
					}else{
						huoniao.showTip("error", data.info, "auto");
					}
				});
			}
		},
		cancel: true
	});
});

function saveOpera(){
	var first = $("#list .citylist"), json = '[';
	for(var i = 0; i < first.length; i++){
		var html = first[i],id = $(html).attr("data-id"),icon = $(html).find(".icon").val();
		json = json + '{"id": "'+id+'", "icon": "'+icon+'"' + '},';
	}
	json = json.substr(0, json.length-1);
	json = json + ']';
	if(json == "]") return false;
	huoniao.showTip("loading", "正在保存，请稍候...");
	huoniao.operaJson("siteCityBusiness.php?dopost=typeAjaxImg", "data="+json, function(data){
		if(data.state == 100){
			huoniao.showTip("success", data.info, "auto");
			location.reload();
		}else{
			huoniao.showTip("error", data.info, "auto");
		}
	});
}
