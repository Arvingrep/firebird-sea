$(function(){
	$(".link_btn").click(function(){
		$(".mask_pop").show();
		$(".pop").css({'display':"block",});
		$(".pop").animate({'bottom':"0",},100)
	});
	
	$(".mask_pop,.pop .cancel_btn").click(function(){
		$(".mask_pop").hide();
		$(".pop").animate({'bottom':"-5rem",},100)
	})
	// var flag= 0
	$.ajax({
		url: masterDomain + "/include/ajax.php?service=member&action=getRelation&tuikuantype="+tuikuantype+"&ctype="+ctype+"&ordernum=" + ordernum + "&ordertype=" + ordertype,
		type: "GET",
		dataType: "json",
		success: function (data) {
			if (data.state == 100) {
				var list = data.info, html = [], objId = $(".link_box");
				if (list.length > 0) {
					html.push('<dt>全部关联记录</dt>');
					for (var i = 0; i < list.length; i++) {
						var stateinfo ='';
						html.push('<dd>');
						if(recordid == list[i].id){
							stateinfo = '<em>当前</em>';
						}
						html.push('<a  href="' + recordurl + '?recordid=' + list[i].id + '"> <h4>'+stateinfo +list[i].ctypename+ list[i].info + '</h4> <span>' + list[i].amount + '</span> </a>');
						html.push('</dd>');

					}
					objId.html(html.join(""));
				}
				flag = 1;
			}
		},
		error: function () {

		}
	});
	// $(".recordto").click(function () {
	// 	if(flag) return false;
	//
	// });
})