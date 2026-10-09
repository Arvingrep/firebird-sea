$(function(){

	//类型切换
	$(".list").delegate(".sel input", "click", function(){
		var t = $(this), val = t.val(), sel = t.closest(".sel");
		if(val == 1){
			sel.siblings("textarea, .media").hide();
			sel.siblings("textarea").show();
		}else{
			sel.siblings("textarea, .media").hide();
			sel.siblings(".media").show();
		}
	});

    //开启搜索优化配置
    $("#elasticSearch").bind("click", function(event){
		var href  = $(this).attr("href");
		try {
			event.preventDefault();
			parent.addPage("elasticSearchphp", "siteConfig", "搜索优化配置", href);
		} catch(e) {}
	});

	//选择素材
	var offset = 0, selResource;
	$(".list").delegate(".media a", "click", function(){
		var t = $(this), label = t.prev("label"), input = t.closest(".media").siblings("input");
		t.addClass("disabled");
		offset = 0;

		selResource = $.dialog({
			id: 'selResource',
			title: '选择微信素材',
			width: 950,
			height: 700,
			content: '<div id="wechatResource"><div id="loading" class="loading" style="text-align:center;">获取中，请稍候...</div></div><div id="pageInfo" class="pagination pagination-centered"></div>'
		});

		getWechatResource(t, label, input);
	});

	function getWechatResource(btn, label, input){
		huoniao.showTip("loading", "获取中，请稍候...");
		huoniao.operaJson("wechatAutoreply.php?dopost=resource", "page="+offset, function(data){
			if(data && data.state == 100){
				huoniao.showTip("success", "获取成功！", "auto");
				btn.addClass("disabled");

				var info = data.data, total_count = info.total_count, total_page = Math.ceil(total_count/data.pageSize), item = info.item;
				atpage = Math.ceil(offset/data.pageSize);

				//没有素材
				if(total_count == 0){
					parent.$("#wechatResource").html('<div class="loading" style="text-align:center;">暂无素材，请在<a href="http://mp.weixin.qq.com" target="_blank">微信公众平台</a>中添加！</div>');
					return;
				}

				var list = [];
				list.push('<ul>');

				for (var i = 0; i < item.length; i++) {

					var media_id = item[i].article_id, update_time = huoniao.transTimes(item[i].update_time, 2), content = item[i].content;
					var news_item = content['news_item'], litpic = news_item[0]['thumb_url'], digest = news_item[0]['digest'], title = news_item[0]['title'];

					list.push('<li class="clearfix" data-id="'+media_id+'">');
					list.push('<img src="wechat/wechatAutoreply.php?dopost=getLitpic&id='+litpic+'" style="object-fit: contain;">');
					list.push('<div class="info">');

					if(news_item.length > 1){

						for (var b = 0; b < news_item.length; b++) {
							list.push('<p>'+(b+1)+'. '+news_item[b].title+'</p>');
						}

					}else{
						list.push('<p><strong>'+title+'</strong></p>');
						list.push('<p>'+digest+'</p>');
					}
					list.push('</div>');
					list.push('<span>'+update_time+'</span>');
					list.push('<div class="mask"><i></i><s></s></div>')
					list.push('</li>');
				}

				list.push('</ul>');

				parent.$("#wechatResource").html(list.join(""));


				parent.$("#wechatResource").delegate("li", "click", function(){
					var t = $(this), id = t.attr("data-id");
					if(id){
						input.val(id);
						label.html('素材ID【'+id+'】');
					}
					selResource.close();
				});




				//拼接分页
				if(total_page > 1){

					pageinfo = parent.$("#pageInfo");
					pageinfo.html('');
					var ul = document.createElement("ul");
					pageinfo.append(ul);

					//上一页
					if (atpage >= 1) {
						var prev = document.createElement("li");
						prev.innerHTML = '<a href="javascript:;">« 上一页</a>';
						prev.onclick = function () {
							offset -= Number(data.pageSize);
							getWechatResource(btn, label, input);
						}
					} else {
						var prev = document.createElement("li");
						prev.className = "disabled";
						prev.innerHTML = '<a href="javascript:;">« 上一页</a>';
					}
					pageinfo.find("ul").append(prev);

					//下一页
					if (atpage < total_page - 1) {
						var next = document.createElement("li");
						next.innerHTML = '<a href="javascript:;">下一页 »</a>';
						next.onclick = function () {
							offset += Number(data.pageSize);
							getWechatResource(btn, label, input);
						}
					} else {
						var next = document.createElement("li");
						next.className = "disabled";
						next.innerHTML = '<a href="javascript:;">下一页 »</a>';
						$("#nextBtn").addClass("disabled").show();
					}
					pageinfo.find("ul").append(next);

					var pinfo = document.createElement("div");
					pinfo.className = "input-prepend input-append";
					pinfo.innerHTML = '<span class="add-on">'+(atpage+1)+'/'+total_page+'</span>';
					pageinfo.append(pinfo);

					pageinfo.show();
				}



			}else{
				huoniao.showTip("error", "获取失败！", "auto");
				if(data){
					$.dialog.alert(data.info);
				}else{
					$.dialog.alert("网络错误，获取失败！");
				}
				btn.addClass("disabled");
			}
		}, function(){
			huoniao.showTip("error", "获取失败！", "auto");
			btn.addClass("disabled");
		});

	}



	//添加新关键字
	$("#addNew").bind("click", function(){
		var index = $("#list").find("dl").length - 1;
		var html = [];
		html.push('<dl class="tr clearfix">');
		html.push('  <input type="hidden" name="ids[]" />');
		html.push('  <dt class="row3">&nbsp;</dt>');
		html.push('  <dt class="row30"><input type="text" class="input-large" name="keyword[]" placeholder="关键字" value=""></dt>');
		html.push('  <dd class="row50"><div class="sel"><label><input type="radio" name="type['+index+']" value="1" checked>自定义</label><label><input type="radio" name="type['+index+']" value="2">微信素材</label></div><textarea name="body[]" class="input-xxlarge" placeholder="请输入响应内容"></textarea><div class="media hide"><label></label><a href="javascript:;">选择素材</a></div><input type="hidden" name="media[]" value=""></dd>');
		html.push('  <dd class="row17"><a href="javascript:;" class="del" title="删除">删除</a></dd>');
		html.push('</dl>');
		$(this).closest(".tr").before(html.join(""));
	});

	//删除
	$(".list").delegate(".del", "click", function(event){
		event.preventDefault();
		var t = $(this), id = t.closest(".tr").attr("data-id");

		//从异步请求
		if(id){
			$.dialog.confirm("删除后无法恢复，请谨慎操作！！！", function(){
				huoniao.showTip("loading", "正在删除，请稍候...");
				huoniao.operaJson("wechatAutoreply.php?dopost=del", "id="+id, function(data){
					if(data.state == 100){
						huoniao.showTip("success", data.info, "auto");
						location.reload();
					}else{
						alert(data.info);
						return false;
					}
				});
			});
			//跳转到对应删除页面
		}else{
			t.closest(".tr").remove();
		}

	});

	//保存
	$("#saveBtn").bind("click", function(){
		saveOpera();
	});


});


//保存
function saveOpera(){
	huoniao.showTip("loading", "正在保存，请稍候...");
	huoniao.operaJson("wechatAutoreply.php?dopost=save", $("#editform").serialize()+'&'+$("#list").serialize(), function(data){
		if(data.state == 100){
			huoniao.showTip("success", data.info, "auto");
            setTimeout(function(){
                location.reload();
            }, 1500);
		}else{
			huoniao.showTip("error", data.info, "auto");
		}
	});
}
