$(function(){

	//选择区域
	// $("#selAddr").delegate("a", "click", function(){
	// 	if($(this).text() != langData['siteConfig'][7][2] && $(this).attr("data-id") != $("#addr").val()){
	// 		var id = $(this).attr("data-id");
	// 		$(this).closest(".sel-group").nextAll(".sel-group").remove();
	// 		getChildAddr(id);
	// 	}
	// });
	//
	// //获取子级区域
	// function getChildAddr(id){
	// 	if(!id) return;
	// 	$.ajax({
	// 		url: "/include/ajax.php?service=siteConfig&action=addr&type="+id,
	// 		type: "GET",
	// 		dataType: "jsonp",
	// 		success: function (data) {
	// 			if(data && data.state == 100){
	// 				var list = data.info, html = [];
	//
	// 				html.push('<div class="sel-group">');
	// 				html.push('<button class="sel">请选择<span class="caret"></span></button>');
	// 				html.push('<ul class="sel-menu">');
	// 				html.push('<li><a href="javascript:;" data-id="'+id+'">请选择</a></li>');
	// 				for(var i = 0; i < list.length; i++){
	// 					html.push('<li><a href="javascript:;" data-id="'+list[i].id+'">'+list[i].typename+'</a></li>');
	// 				}
	// 				html.push('</ul>');
	// 				html.push('</div>');
	//
	// 				$("#addr").before(html.join(""));
	//
	// 			}
	// 		}
	// 	});
	// }

	//提交
	$(".w-form form").bind("submit", function(event){
		event.preventDefault();

		$('#addr').val($('#selAddr .addrBtn').attr('data-id'));

		if($.trim($("#company").val()) == ""){
			$.dialog.alert(langData['siteConfig'][21][232]);
			return false;
		}

		if($("#addr").val() == "" || $("#addr").val() == 0){
			$.dialog.alert(langData['siteConfig'][20][68]);
			return false;
		}

		if($.trim($("#address").val()) == ""){
			$.dialog.alert(langData['siteConfig'][27][68]);
			return false;
		}


		var t = $(this), serialize = t.serialize(), action = t.attr("action"), sbtn = $("#sbtn");
		sbtn.attr("disabled", true).html(langData['siteConfig'][6][35]+"...");

		$.ajax({
			url: action,
			data: serialize,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					sbtn.removeAttr("disabled").html(langData['siteConfig'][20][229]);
					setTimeout(function(){
						sbtn.html(langData['siteConfig'][6][122]);
					}, 2000);
				}else{
					$.dialog.alert(data.info);
					sbtn.removeAttr("disabled").html(langData['siteConfig'][6][122]);
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
				sbtn.removeAttr("disabled").html(langData['siteConfig'][6][122]);
			}
		});

	});

});
