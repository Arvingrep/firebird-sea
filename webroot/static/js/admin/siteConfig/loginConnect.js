$(function(){
	
	var init = {
		
		//拖动排序
		dragsort: function(){
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
					saveOpera(1);
				}
	        });
		}
	};
	
	init.dragsort();
	
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
			saveOpera(1);
		}
	});
	
	//排序向下
	$(".root").delegate(".down", "click", function(){
		var t = $(this), parent = t.parent().parent().parent(), index = parent.index(), length = parent.siblings("li").length;
		if(index != length){
			parent.before(parent.next("li"));
			saveOpera(1);
		}
	});
	
	//说明
	$(".explain").bind("click", function(){
		var t = $(this), obj = t.parent().parent();
		$.dialog({
			fixed: true,
			title: '支付方式说明',
			content: obj.find("div:last").html(),
			width: 800,
			ok: true
		});
	});
	
	//卸载
	$(".modify").bind("click", function(event){
		var href  = $(this).attr("href"), 
			id    = $(this).attr("data-id"), 
			title = $(this).attr("data-title");
		
		try {
			event.preventDefault();
			parent.addPage("loginConnect"+id, "siteConfig", title, "siteConfig/"+href);
		} catch(e) {}
	});
	
	//卸载
	$(".uninstall").bind("click", function(event){
		event.preventDefault();
		var href = $(this).attr("href");
		$.dialog.confirm('您确定要卸载吗？', function(){
			huoniao.operaJson(href, "", function(data){
				if(data.state == 100){
					huoniao.showTip("success", data.info, "auto");
					setTimeout(function() {
						location.reload();
					}, 800);
				}else{
					huoniao.showTip("error", data.info, "auto");
				}
			});
		});
	});
});

//保存
function saveOpera(type){
	var first = $("ul.root>li"), json = '[';
	for(var i = 0; i < first.length; i++){
		(function(){
			var html =arguments[0], count = 0, jArray = $(html).find(">ul>li"), id = $(html).find(".tr").attr("data-id");
			json = json + '{"id": "'+id+'"},';
		})(first[i]);
	}
	json = json.substr(0, json.length-1);
	json = json + ']';
	
	huoniao.operaJson("loginConnect.php?action=sort", "data="+json, function(data){
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