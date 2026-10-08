$(function(){
	$('#btnSubmit').bind('click',function(){
		console.log(basehost);
		var name = $('#username').val(),
			amount = $('#amount').val(),
			method = $("input[name='method']:checked").val();

		if (method == "weixin") {
			cardnum =  $("#openid").val();
			// if (cardnum == undefined||cardnum =='') {
			// 	alert("暂未绑定微信，请先绑定");
			// 	window.open(basehost+'/api/login.php?type=wechat')
			// }
		}else{
			cardnum = $("#alicard").val();
		}
		if (name=="") {
			alert("请先实名认证");
			return;
		}
		$.ajax({
			type: "POST",
			url: "userWithdraw.php?dopost=withdraw",
			data: {bank:method,cardnum:cardnum,cardname:name,amount:amount},
			dataType: "json",
			success: function(data){
				console.log(data);
				if(data.state == 100){
					location.reload();
					alert(data.info);
				}else{
					if (data.state==2000) {
						alert(data.info);
						// window.open(basehost+'/api/login.php?type=wechat&getopenid='+userid);return;
						window.open(basehost+'/api/login.php?type=wechat&getopenid='+userid);return;
					}
					alert(data.info);
				};
			},
			error: function(msg){

			}
		});
	});
});
