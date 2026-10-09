$(function(){

	var foo = $('.main tbody tr').length;

	//APP配置跳转
	$('.bottomButton').bind('click', function(){
		var href = $(this).attr("href");
	  	try {
	  		event.preventDefault();
            parent.addPage("appConfigphp", "app", "APP配置", "app/appConfig.php");
	  	} catch(e) {}
	});

	//删除按钮
	$('.main').delegate('.del', 'click', function(){
		var t = $(this), tr = t.closest('tr');
		$.dialog.confirm('确认要删除吗？', function(){
			tr.remove();
			$('.addBtn').removeClass('disabled').html('+增加一个按钮');
		})
	});

	//新增按钮
	$('.addBtn').bind('click', function(){

        if($(this).hasClass('disabled')) return false;

		var html = '<tr>';
			html += '<td><input type="text" class="input-mini" name="bottomButton[name]['+foo+']" /></td>';
			html += '<td class="thumb clearfix listImgBox">';
			html += '<div class="uploadinp filePicker thumbtn uplogo" id="filePicker'+foo+'" data-type="logo"  data-count="1" data-size="'+thumbSize+'" data-imglist=""><iframe src ="/include/upfile.inc.php?mod=siteConfig&type=logo&obj=icon'+foo+'&filetype=image" scrolling="no" class="h" frameborder="0" marginwidth="0" marginheight="0" ></iframe></div>';
			html += '<ul id="listSection'+foo+'" class="listSection thumblist fn-clear"></ul>';
			html += '<input type="hidden" id="icon'+foo+'" name="bottomButton[icon]['+foo+']" class="imglist-hidden">';
			html += '</td>';
			html += '<td class="thumb clearfix listImgBox">';
			html += '<div class="uploadinp filePicker thumbtn" id="filePicker'+foo+'1" data-type="logo"  data-count="1" data-size="'+thumbSize+'" data-imglist=""><iframe src ="/include/upfile.inc.php?mod=siteConfig&type=logo&obj=icon_h'+foo+'&filetype=image" scrolling="no" class="h" frameborder="0" marginwidth="0" marginheight="0" ></iframe></div>';
			html += '<ul id="listSection'+foo+'1" class="listSection thumblist fn-clear"></ul>';
			html += '<input type="hidden" id="icon_h'+foo+'" name="bottomButton[icon_h]['+foo+']" class="imglist-hidden">';
			html += '</td>';
			html += '<td>';
            html += '<input class="input-large" type="text" name="bottomButton[url]['+foo+']" value="" placeholder="链接地址">';
			// html += '<div class="input-prepend input-append">';
			// html += '	<span class="add-on">默认链接</span>';
			// html += '	<input class="input-large" type="text" name="bottomButton[url]['+foo+']" value="" placeholder="移动端默认链接">';
			// html += '</div>';
			// html += '<div class="input-prepend input-append">';
			// html += '	<span class="add-on">小程序端</span>';
			// html += '	<input class="input-large" type="text" name="bottomButton[miniPath]['+foo+']" value="" placeholder="跳转路径，如/pages/info/index，可留空">';
			// html += '</div>';
			html += '</td>';
			html += '<td><input type="checkbox" name="bottomButton[fabu]['+foo+']" value="1"></td>';
			html += '<td><input type="checkbox" name="bottomButton[message]['+foo+']" value="1"></td>';
            if(platform == 'app'){
			    html += '<td><input type="hidden" class="input-mini" name="bottomButton[code]['+foo+']" /><small>保存后选择</small></td>';
            }
			html += '<td><a href="javascript:;" class="del"><i class="icon-trash"></i></a></td>';
			html += '</tr>';
		foo++;
		$('.main tbody').append(html);

		if($('.main tbody tr').length == 5){
			$('.addBtn').addClass('disabled').html('最多5个按钮');
		}else{
			$('.addBtn').removeClass('disabled').html('+增加一个按钮');
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

    var platformName = 'H5端';
    if(platform == 'app'){
        platformName = 'APP端';
    }else if(platform == 'wxmini'){
        platformName = '微信小程序端';
    }else if(platform == 'dymini'){
        platformName = '抖音小程序端';
    }

    var moduleName = $('.modulelist .current').text();

	//H5端重置当前模块链接
    $("#resetCurrent").bind("click", function(event) {
        if(!$(this).hasClass('operBtn')){
            $.dialog.confirm('确定要重置'+platformName+moduleName+'的导航链接吗？<br />此操作不可恢复，请谨慎操作！', function(){
                $('.main tbody').html('');
                $("#btnSubmit").click();
            });
        }
    });

    //其他终端重置当前模块链接
    $("#resetCurrent a").bind("click", function(event) {
        var id = $(this).attr('data-id');
        var typeName = '恢复系统默认';
        if(id == 'h5'){
            typeName = '使用H5端的配置';
        }
        else if(id == 'wxmini'){
            typeName = '使用微信小程序端的配置';
        }
        else if(id == 'dymini'){
            typeName = '使用抖音小程序端的配置';
        }
        $.dialog.confirm('确定要将'+platformName+moduleName+'的导航链接'+typeName+'吗？<br />此操作不可恢复，请谨慎操作！', function(){
            $('#resetType').val(id);
            $('.main tbody').html('');
            $("#btnSubmit").click();
        });
    });


	//H5端重置所有模块链接
    $("#resetAll").bind("click", function(event) {
        if(!$(this).hasClass('operBtn')){
            $.dialog.confirm('确定要重置'+platformName+'所有模块的导航链接吗？<br />此操作不可恢复，请谨慎操作！', function(){
                huoniao.operaJson("?dopost=reset&platform="+platform, '', function(data){
                    var state = "success";
                    if(data.state != 100){
                        state = "error";
                    }
                    huoniao.showTip(state, data.info, "auto");

                    if(data.state == 100){
                        setTimeout(function(){
                            location.reload();
                        }, 1000);
                    }
                });
            });
        }
    });


	//其他终端重置所有模块链接
    $("#resetAll a").bind("click", function(event) {
        var id = $(this).attr('data-id');
        var typeName = '恢复系统默认';
        if(id == 'h5'){
            typeName = '使用H5端的配置';
        }
        else if(id == 'wxmini'){
            typeName = '使用微信小程序端的配置';
        }
        else if(id == 'dymini'){
            typeName = '使用抖音小程序端的配置';
        }
        $.dialog.confirm('确定要将'+platformName+'所有模块的导航链接'+typeName+'吗？<br />此操作不可恢复，请谨慎操作！', function(){
            huoniao.operaJson("?dopost=reset&platform="+platform+"&resetType="+id, '', function(data){
                var state = "success";
                if(data.state != 100){
                    state = "error";
                }
                huoniao.showTip(state, data.info, "auto");
                
                if(data.state == 100){
                    setTimeout(function(){
                        location.reload();
                    }, 1000);
                }
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
