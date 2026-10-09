$(function(){

	//底部添加新分类
	$("#addNew").bind("click", function(){
		var html = [];

		var len = $("#list ul li").length;

		html.push('<li class="clearfix tr">');
		html.push('  <div class="row20 left">&nbsp;&nbsp;&nbsp;&nbsp;<input class="updateName" data-id="0" type="text" value="" /></div>');
		html.push('  <div class="row20 left"><input class="updatePrice" data-id="0" type="text" value="" /></div>');
		html.push('	 <div class="row50 left"><a href="javascript:;" class="upfile" title="删除">上传图标</a><input type="file" name="Filedata" value="" class="imglist-hidden Filedata hide" id="Filedata_'+len+'"><input type="hidden" name="icon" class="icon" value=""></div>')
		html.push('  <div class="row10 left"><a href="javascript:;" class="del">删除</a></div>');
		html.push('</li>');

		$(this).parent().parent().prev(".root").append(html.join(""));
	});

	//input焦点离开自动保存
	$("#list").delegate("input", "blur", function(){
		var id = $(this).attr("data-id"), value = $(this).val(), cla = $(this).attr('class');
		if(id != "" && id != 0){
			huoniao.operaJson("?dopost="+cla+"&id="+id, "name="+value+"&token="+$("#token").val(), function(data){
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

	//删除
	$(".root").delegate(".del", "click", function(event){
		event.preventDefault();
		var t = $(this), id = t.parent().parent().find("input").attr("data-id"), type = t.parent().text();
		//从数据库删除
		if(type.indexOf("编辑") > -1){
			$.dialog.confirm("确认要删除吗？", function(){
				huoniao.operaJson("?dopost=del", "id="+id+"&token="+$("#token").val(), function(data){
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
		}else{
			t.parent().parent().remove();
		}
	});

	//保存
	$("#saveBtn").bind("click", function(){
		var first = $("ul.root>li"), json = '[';
		for(var i = 0; i < first.length; i++){
			var tr = $("ul.root>li:eq("+i+")"), inp = tr.find(".updateName"), pri = tr.find(".updatePrice"), id = inp.attr("data-id"), val = inp.val(), price = pri.val(), icon = tr.find(".icon").val();
			json = json + '{"id": "'+id+'", "name": "'+encodeURIComponent(val)+'", "price": "'+encodeURIComponent(price)+'", "icon": "'+icon+'"},';
		}
		json = json.substr(0, json.length-1);
		json = json + ']';

		huoniao.operaJson("?dopost=update", "data="+json+"&token="+$("#token").val(), function(data){
			if(data.state == 100){
				huoniao.showTip("success", data.info, "auto");
				window.scroll(0, 0);
				setTimeout(function() {
					location.reload();
				}, 800);
			}else{
				huoniao.showTip("error", data.info, "auto");
			}
		});

	});

	//上传单张图片
  	function mysub(id){
	    var t = $("#"+id), p = t.parent(), img = t.parent().children(".img"), uploadHolder = t.siblings('.upfile');

	    var data = [];
	    data['mod'] = 'live';
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
			mod: "member",
			type: "delthumb",
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

		console.log($(this).val())
	    mysub($(this).attr("id"));
	})

});
