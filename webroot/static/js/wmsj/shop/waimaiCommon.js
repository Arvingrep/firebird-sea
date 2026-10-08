$(function(){

	//下拉选择控件
	$(".chosen-select").chosen().change(function() {
		location.href = '?shopid='+$(this).val();
	})

	// 回复评论
	/*$(".reply").click(function(e){
		event.preventDefault();
		var href = $(this).attr("href"), id = $(this).data("id"), uid = $(this).data("uid");
		try {
			event.preventDefault();
			parent.addPage("waimaiCommonReply"+id, "waimai", "回复"+uid, "waimai/"+href);
		} catch(e) {}
	})*/

})