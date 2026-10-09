$(function(){
	// $("body").delegate('.add-page','click',function(e){
	// 	let url = $(this).attr('href');
	// 	let id = $(this).attr('data-id')
	// 	let title = $(this).attr('data-title')
	// 	try {
	// 		console.log(url)
	// 		e.preventDefault();
	// 		parent.addPage(id, "job", title, "job/"+url);
	// 	} catch(e) {}
	// })
    $("#btnSubmit").click(function(e){
		e.preventDefault();
        var post = $("#editform").serialize();
        var formAction = $("#editform").attr("action");
        huoniao.operaJson(formAction+"?action="+action+"&type=charge", post + "&token="+token, function(data){
			var state = "success";
			if(data.state != 100){
				state = "error";
			}

			if(data.state == 2001){
				$.dialog.alert(data.info);
			}else{
				huoniao.showTip(state, data.info, "auto");
			}

			if(data.state == 100){
				huoniao.showTip(state, data.info, "auto");
			}
		});
    })

});
