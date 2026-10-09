$(function(){
	//全选、反选
	$("#selectAll").bind("click", function(){
		if($(this).is(":checked")){
			$("#editform").find("input[type=checkbox]").attr("checked", true);
			$(this).next("span").html("反选");
		}else{
			$("#editform").find("input[type=checkbox]").removeAttr("checked");
			$(this).next("span").html("全选");
		}
	});

    $('#btnSubmit').bind('click', function(){
        var t = $(this);
        t.attr('disabled', true);
        t.html('正在清除，请稍候...');
        t.closest('form').submit();
    })


    //查看缓存目录大小
    $('.checkCacheFolderSize').bind('click', function(){
        var t = $(this), type = t.attr('data-type');
        if(t.hasClass('disabled')) return;
        t.addClass('disabled').html('<img src="/static/images/loading_16.gif" />');
        huoniao.operaJson("siteClearCache.php", "dopost=check"+type+"FolderSize", function(data){
            t.removeClass('disabled').text(data.state == 100 ? data.size : "获取失败！");
        })
    });
    $('.checkCacheFolderSize').click();
});