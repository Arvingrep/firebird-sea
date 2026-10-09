$(function(){

	var foo = $('.main tbody tr').length;

	//手机底部按钮
	$('#bottomButton').bind('click', function(){
		var href = $(this).attr("href");
	  	try {
	  		event.preventDefault();
	  		parent.$(".h-nav a").each(function(index, element) {
	        	if($(this).attr("href") == href){
	  				parent.$(this).click();
	  				return false;
	  			}
	  		});
	  	} catch(e) {}
	});

	//删除按钮
	$('.main').delegate('.del', 'click', function(){
		var t = $(this), tr = t.closest('tr');
		$.dialog.confirm('确认要删除吗？', function(){
			tr.remove();
			$('.addBtn').show();
		})
	});

	//新增按钮
	$('.addBtn').bind('click', function(){
		var html = '<tr>';
			html += '<td><input type="text" class="input-mini" name="bottomButton[name]['+foo+']" /></td>';
			html += '<td class="thumb clearfix listImgBox">';
			html += '<div class="uploadinp filePicker thumbtn uplogo" id="filePicker'+foo+'" data-type="logo"  data-count="1" data-size="'+thumbSize+'" data-imglist=""><iframe src ="/include/upfile.inc.php?mod=siteConfig&type=logo&obj=icon'+foo+'&filetype=image" scrolling="no" class="h" frameborder="0" marginwidth="0" marginheight="0" ></iframe></div>';
			html += '<ul id="listSection'+foo+'" class="listSection thumblist fn-clear"></ul>';
			html += '<input type="hidden" id="icon'+foo+'" name="bottomButton[icon]['+foo+']" class="imglist-hidden">';
			html += '</td>';
			html += '<td>';
			html += '<br><div class="input-prepend input-append">';
			html += '	<span class="add-on">默认链接</span>';
			html += '	<input class="input-large" type="text" name="bottomButton[url]['+foo+']" value="" placeholder="移动端默认链接">';
			html += '</div>';
			html += '<br><div class="input-prepend input-append">';
			html += '	<span class="add-on">小程序端</span>';
			html += '	<input class="input-large" type="text" name="bottomButton[miniPath]['+foo+']" value="" placeholder="跳转路径，如/pages/info/index，可留空">';
			html += '</div>';
			html += '<br><div class="input-prepend input-append">';
			html += '	<span class="add-on">app端</span>';
			html += '	<input class="input-large" type="text" name="bottomButton[appPath]['+foo+']" value="" placeholder="跳转路径，如/pages/info/index，可留空">';
			html += '</div>';
			html += '</td>';
			html += '<td><a href="javascript:;" class="del"><i class="icon-trash"></i></a></td>';
			html += '</tr>';
		foo++;
		$('.main tbody').append(html);

		if($('.main tbody tr').length == 5){
			$('.addBtn').hide();
		}
	});

	//删除图片
	$('.main').delegate('.delpic', 'click', function(){
		var t = $(this), td = t.closest('td'), uploadinp = td.find('.uploadinp'), listSection = td.find('.listSection'), val = td.find('img').attr('data-val'), iframe = td.find('iframe');
		var imginp = td.find('.imglist-hidden');
		delFile(val, false, function(){
			uploadinp.show();
			listSection.hide();
			imginp.val('');
			iframe.attr('src', iframe.attr('src'));
		});
	});


	//重置当前模块链接
    $("#resetCurrent").bind("click", function(event) {
		$.dialog.confirm('确定要重置当前模块的链接吗？<br />此操作不可恢复，请谨慎操作！', function(){
			$('.main tbody').html('');
			$("#btnSubmit").click();
		});
    });


	//重置所有模块链接
    $("#resetAll").bind("click", function(event) {
		$.dialog.confirm('确定要重置所有模块的链接吗？<br />此操作不可恢复，请谨慎操作！', function(){
			huoniao.operaJson("?dopost=reset", '', function(data){
				var state = "success";
				if(data.state != 100){
					state = "error";
				}
				huoniao.showTip(state, data.info, "auto");
				location.reload();
			});
		});
    });


	//表单提交
    $("#btnSubmit").bind("click", function(event) {
        event.preventDefault();

        //异步提交
        var post = $("#editform").serialize();

        huoniao.operaJson("?dopost=save", post, function(data){
            var state = "success";
            if(data.state != 100){
                state = "error";
            }
            huoniao.showTip(state, data.info, "auto");
			location.reload();
        });
    });


});

//上传成功
function uploadSuccess(obj, file, filetype){
	var inp = $('#' + obj);
	inp.val(file);
	inp.siblings('.uploadinp').hide();
	inp.siblings('.listSection').html('<li><a href="'+cfg_attachment+file+'" target="_blank" title=""><img src="'+cfg_attachment+file+'" data-val="'+file+'"/></a><a class="reupload li-rm delpic" href="javascript:;">重新上传</a></li>').attr('style', 'display: inline-block');
}

//删除已上传的文件
function delFile(b, d, c) {
	var g = {
		mod: "siteConfig",
		type: "delLogo",
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
