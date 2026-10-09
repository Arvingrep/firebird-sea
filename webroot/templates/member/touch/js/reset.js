$(function(){

	$("#resetForm").submit(function(event){
		event.preventDefault();
		$('.login-btn input').click();
	});

	$('.login-btn input').click(function(){
		var btn = $(this);
		var pwd = $('.password').val();
		if (pwd == '') {
			alert(langData['siteConfig'][20][84]);
			return false;
		}else{
			var repwd = $('.repassword').val();
			if (repwd == '') {
				alert(langData['siteConfig'][20][24]);
				return false;
			}else{
				if (pwd != repwd) {
					alert(langData['siteConfig'][20][381]);
					return false;
				}else{

					btn.attr("disabled", true).val(langData['siteConfig'][6][35]+"...");

					//异步提交
					$.ajax({
						url: masterDomain+"/include/ajax.php?service=member&action=resetpwd",
						data: $("#resetForm").serialize(),
						type: "GET",
						dataType: "jsonp",
						success: function (data) {
							if(data){

								if(data.state == 100){

									btn.val(langData['siteConfig'][20][382]);
									setTimeout(function(){
										location.href = userDomain;
									}, 500);

								}else{
									alert(data.info);
									btn.removeAttr("disabled", false).val(langData['siteConfig'][6][1]);
								}

							}else{
								alert(langData['siteConfig'][20][180]);
								btn.removeAttr("disabled", false).html(langData['siteConfig'][6][1]);
							}
						}
					});

				}
			}
		}
	})

})
