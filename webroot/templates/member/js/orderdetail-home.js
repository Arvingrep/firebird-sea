$(function(){

	//收货
	$(".sh").bind("click", function(){
		var t = $(this);
		if(t.attr("disabled") == "disabled") return;

		if(confirm(langData['siteConfig'][30][55])){//确定要收货吗？\r确定后费用将直接转至卖家账户，请谨慎操作！
			t.html(langData['siteConfig'][6][35]+"...").attr("disabled", true);//提交中

			$.ajax({
				url: "/include/ajax.php?service=home&action=receipt",
				data: "id="+id,
				type: "POST",
				dataType: "json",
				success: function (data) {
					if(data && data.state == 100){
						location.reload();

					}else{
						alert(data.info);
						t.attr("disabled", false).html(langData['siteConfig'][30][56]);//确定收货
					}
				},
				error: function(){
					$.dialog.alert(langData['siteConfig'][6][203]);//网络错误，请重试！
					t.attr("disabled", false).html(langData['siteConfig'][30][56]);//确定收货
				}
			});

		}

	});

});
