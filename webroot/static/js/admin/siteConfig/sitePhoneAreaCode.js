$(function(){
	var init = {

		//拖动排序
		dragsort: function(){
			//一级
			$('.root').sortable({
	      		items: '>li',
				placeholder: 'placeholder',
			    orientation: 'vertical',
			    axis: 'y',
				handle:'>div.tr',
			    opacity: .5,
			    revert: 0,
				stop:function(){
					saveOpera(1);
					// huoniao.stopDrag();
				}
	    	});
		}
	};


	//拼接现有分类
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
			// huoniao.stopDrag();
		}
	});

	//排序向下
	$(".root").delegate(".down", "click", function(){
		var t = $(this), parent = t.parent().parent().parent(), index = parent.index(), length = parent.siblings("li").length;
		if(index != length){
			parent.before(parent.next("li"));
			saveOpera(1);
			// huoniao.stopDrag();
		}
	});

	//删除
	$(".root").delegate(".del", "click", function(event){
		event.preventDefault();
		var t = $(this), id = t.closest('li').data("val"), type = t.parent().text();

		//从异步请求
		if(type.indexOf("编辑") > -1){
			$.dialog.confirm("确定要删除吗？", function(){
				huoniao.showTip("loading", "正在删除，，请稍候...");
				huoniao.operaJson("sitePhoneAreaCode.php?dopost=del", "id="+id, function(data){
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
			//跳转到对应删除页面
		}else{
			t.parent().parent().parent().remove();
		}

	});

	//保存
	$("#saveBtn").bind("click", function(){
		saveOpera("");
	});

	//返回最近访问的位置
	huoniao.scrollTop();


	//开通国家/地区
	$("#batch").bind("click", function(){
		$.dialog({
			fixed: true,
			title: '开通国家/地区',
			content: $("#addCity").html(),
			width: 300,
			ok: function(){

				var pBtn = parent.$("#pBtn").val();

				if(pBtn == '' || pBtn == null){
					alert("请选择要开通的国家/地区！");
					return false;
				}

				huoniao.operaJson("sitePhoneAreaCode.php?dopost=add", "data=" + pBtn, function(data){
					if(data && data['state'] == 100){
						location.reload();
					}else{
						alert(data.info);
					}
				});
				return false;

			}
		});
	});


});

//保存
function saveOpera(type){
	var val = [];
	$('.root li').each(function(){
		val.push($(this).data('val'));
	});

	var scrolltop = $(document).scrollTop();
	var href = huoniao.changeURLPar(location.href, "scrolltop", scrolltop);

	var pid = $("#pBtn").attr("data-id"), cid = $("#cBtn").attr("data-id"), did = $("#dBtn").attr("data-id");

	huoniao.showTip("loading", "正在保存，请稍候...");
	huoniao.operaJson("sitePhoneAreaCode.php?dopost=typeAjax", "data="+val.join(','), function(data){
		if(data.state == 100){
			huoniao.showTip("success", data.info, "auto");
			if(type == ""){
				//window.scroll(0, 0);
				//setTimeout(function() {
					location.href = href;
				//}, 800);
			}
		}else{
			huoniao.showTip("error", data.info, "auto");
		}
	});
}
