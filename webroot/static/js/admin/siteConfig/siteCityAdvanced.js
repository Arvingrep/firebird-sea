if(action == 'siteConfig') {
    var ue = UE.getEditor('powerby', {'enterTag': ''});
}
//上传成功接收
function uploadSuccess(obj, file){
	$("#"+obj).val(file);
	$("#"+obj).siblings(".spic").find(".sholder").html('<img src="'+cfg_attachment+file+'" />');
	$("#"+obj).siblings(".spic").find(".reupload").attr("style", "display: inline-block");
	$("#"+obj).siblings(".spic").show();
	$("#"+obj).siblings("iframe").hide();
}
$(function(){
    $("#postRefreshCreatePeriodInp").focus(function(){
        $("input[name='postRefreshCreatePeriodShow'][value='1']").attr('checked', true)
    })
    //复制模板
    $('.copyTemplate').change(function(){
        var t = $(this), type = t.data('type'), val = t.val();
        huoniao.showTip("loading", "正在复制模板，请稍候！");
        huoniao.operaJson("?cid=" + cid, "action="+action+"&dopost=copyTemplate&type="+type+"&template="+val, function (data) {
            huoniao.showTip("success", "复制成功！");
            setTimeout(function(){
                getCityTemplate();
            }, 2000);
        });
    });


    $("input[name='autojobup']").change(function(){
        let t = $(this),val = t.val();
        if(val == 2){
            $('.refreshConfig').removeClass('hide');
        }else{
            $('.refreshConfig').addClass('hide');
        }
    })

    getCityTemplate();


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


    //表单提交
    $("#btnSubmit").bind("click", function(event) {
        event.preventDefault();
        
       
        if(action == 'zhaopin'){
            let postRefreshCreatePeriod = $("input[name='postRefreshCreatePeriodShow']:checked").val()
            if(postRefreshCreatePeriod === '1'){
                postRefreshCreatePeriod = $("#postRefreshCreatePeriodInp").val()
                if(!postRefreshCreatePeriod){
                    huoniao.showTip("error", "请填写职位发布时间限制", "auto");
                    return false;
                }
            }
            $("#postRefreshCreatePeriod").val(postRefreshCreatePeriod)
            let autojobup = $("input[name='autojobup']:checked").val()
            let autojobfrequency = $("input[name='autojobfrequency']").val()
            if(autojobup == 2 && (autojobfrequency == '' || isNaN(autojobfrequency))){
                huoniao.showTip("error", "请填写正确的自动更新频率！", "auto");
                return false;
            }
        }
         //异步提交
         var post = $("#editform").serialize();

         if(action == 'siteConfig'){
             ue.sync();
         }
        huoniao.operaJson("?dopost=save", post, function(data){
            var state = "success";
            if(data.state != 100){
                state = "error";
            }
            huoniao.showTip(state, data.info, "auto");
            // parent.getPreviewInfo();
        });
    });

    $("#badWeatherStart").datetimepicker({format: 'yyyy-mm-dd hh:ii:ss', autoclose: true, language: 'ch'});
    $("#badWeatherEnd").datetimepicker({format: 'yyyy-mm-dd hh:ii:ss', autoclose: true, language: 'ch'});

});




//获取模板
function getCityTemplate(){
    huoniao.showTip("loading", "正在获取模板，请稍候！");
    huoniao.operaJson("?cid=" + cid, "action="+action+"&dopost=getTemplate", function (data) {
        huoniao.hideTip();
        if (data) {
            var current = data.current;
            var defaultTplList = data.defaultTplList;
            var tplList = data.tplList;
            var touchCurrent = data.touchCurrent;
            var touchDefaultTplList = data.touchDefaultTplList;
            var touchTplList = data.touchTplList;

            //PC端默认模板
            var defaultTplArr = [];
            defaultTplArr.push('<option value="">请选择要复制的模板</option>');
            for (var i = 0; i < defaultTplList.length; i++){
                defaultTplArr.push('<option value="'+defaultTplList[i].directory+'">'+defaultTplList[i].tplname+'('+defaultTplList[i].directory+')</option>');
            }
            $('#defaultTplList').html(defaultTplArr.join(''));

            //PC端已复制模板
            var tplListArr = [];
            for (var i = 0; i < tplList.length; i++){
                tplListArr.push('<li'+(current == tplList[i].directory ? ' class="current"' : '')+'>');
                tplListArr.push('<a href="javascript:;" data-id="'+tplList[i].directory+'" data-title="'+tplList[i].tplname+'" class="img" title="模板名称：'+tplList[i].tplname+'&#10;版权所有：'+tplList[i].copyright+'"><img src="'+adminPath+'../templates/'+action+'/'+tplList[i].directory+'/preview.jpg?v='+cfg_staticVersion+'" /></a>');
                tplListArr.push('<p>');
                tplListArr.push('<span title="{#$tplItem.tplname#}">'+tplList[i].tplname+'('+tplList[i].directory+')</span><br />');
                tplListArr.push('<a href="javascript:;" class="choose">选择</a><br />');
                tplListArr.push('<a href="javascript:;" class="edit">编辑模板</a><br />');
                tplListArr.push('<a href="javascript:;" class="del">卸载</a>');
                tplListArr.push('</p>');
                tplListArr.push('</li>');
            }
            $('#tplListUl').html(tplListArr.join(''));
            $('#template').val(current);

            //移动端默认模板
            var touchDefaultTplArr = [];
            touchDefaultTplArr.push('<option value="">请选择要复制的模板</option>');
            for (var i = 0; i < touchDefaultTplList.length; i++){
                touchDefaultTplArr.push('<option value="'+touchDefaultTplList[i].directory+'">'+touchDefaultTplList[i].tplname+'('+touchDefaultTplList[i].directory+')</option>');
            }
            $('#touchDefaultTplList').html(touchDefaultTplArr.join(''));

            //移动端已复制模板
            var tplListArr = [];
            for (var i = 0; i < touchTplList.length; i++){
                tplListArr.push('<li'+(touchCurrent == touchTplList[i].directory ? ' class="current"' : '')+'>');
                tplListArr.push('<a href="javascript:;" '+(touchTplList[i].tplname == 'diy' ? 'style="cursor: default;"' : '')+' data-id="'+touchTplList[i].directory+'" data-title="'+touchTplList[i].tplname+'" class="img" title="模板名称：'+(touchTplList[i].tplname == 'diy' ? 'DIY模板' : touchTplList[i].tplname)+'&#10;版权所有：'+touchTplList[i].copyright+'"><img src="'+(touchTplList[i].tplname == 'diy' ? '/static/images/admin/diy_template_icon.png?v=' + cfg_staticVersion : (adminPath+'../templates/'+action+'/touch/'+touchTplList[i].directory+'/preview.jpg?v='+cfg_staticVersion))+'" /></a>');
                tplListArr.push('<p>');
                if(touchTplList[i].tplname != 'diy'){
                    tplListArr.push('<span title="{#$tplItem.tplname#}">'+touchTplList[i].tplname+'('+touchTplList[i].directory+')</span><br />');
                }else{
                    tplListArr.push('<span>DIY模板</span><br />');
                }
                tplListArr.push('<a href="javascript:;" class="choose">选择</a><br />');
                if(touchTplList[i].tplname != 'diy'){
                    tplListArr.push('<a href="javascript:;" class="edit">编辑模板</a><br />');
                    tplListArr.push('<a href="javascript:;" class="del">卸载</a>');
                }else{
                    tplListArr.push('<a href="sitePageDiy.php?cityid='+cid+'" target="_blank" class="edit">装修页面</a><br />');
                }
                tplListArr.push('</p>');
                tplListArr.push('</li>');
            }
            $('#touchTplListUl').html(tplListArr.join(''));
            $('#touchTemplate').val(touchCurrent);

        } else {
            huoniao.showTip("error", "暂无相关模板！", "auto");
        }
    });
}

//删除已上传的文件
function delFile(b, d, c) {
	var g = {
		mod: "siteConfig",
		type: "delCard",
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