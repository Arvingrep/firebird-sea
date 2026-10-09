$(function(){

	//出生日期
	$("#birthday").click(function(){
		WdatePicker({
			el: 'birthday',
			isShowClear: false,
			isShowOK: false,
			isShowToday: false,
			qsEnabled: false,
			maxDate: '%y-%M-%d',
			onpicking: function(dp){

			}
		});
	});

	//提交
	$("#submit").bind("click", function(event){
		event.preventDefault();
		$('#addr').val($('#selAddr .addrBtn').attr('data-id'));

		var t = $(this), form = $("#fabuForm"), serialize = form.serialize(), action = form.attr("action");
		t.attr("disabled", true).html(langData['siteConfig'][6][35]+"...");//提交中

        var data = [];
        data.push("rsaEncrypt=1");
        data.push("sex="+rsaEncrypt($('#sex').val()));
        data.push("qq="+rsaEncrypt($('#qq').val()));
        data.push("addr="+rsaEncrypt($('#addr').val()));
        data.push("birthday="+rsaEncrypt($('#birthday').val()));
        data.push("nation="+rsaEncrypt($('#nation').val()));

		$.ajax({
			url: action,
			data: data.join('&'),
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					t.removeAttr("disabled").html(langData['siteConfig'][20][229]);//修改成功！
					setTimeout(function(){
						t.html(langData['siteConfig'][6][122]);//提交修改
					}, 2000);
				}else{
					$.dialog.alert(data.info);
					t.removeAttr("disabled").html(langData['siteConfig'][6][122]);//提交修改
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);//网络错误，请稍候重试！
				t.removeAttr("disabled").html(langData['siteConfig'][6][122]);//提交修改
			}
		});

	});

});
