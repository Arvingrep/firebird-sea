$(function(){

	var transferCount = 0;

	//数量验证
	$("#amount").bind("blur", function(){
		var t = $(this), val = t.val();
		var fee = val * pointFee / 100;

		var regu = "(^[1-9]([0-9]?)+[\.][0-9]{1,2}?$)|(^[1-9]([0-9]+)?$)|(^[0][\.][0-9]{1,2}?$)";
		var re = new RegExp(regu);
		if (!re.test(val)) {

			showMsg(langData['siteConfig'][20][218]);
			$("#fee").html(0);
			$("#true").html(0);
			transferCount = 0;

		}else if(val > totalPoint){

			showMsg(langData['siteConfig'][20][219]);
			$("#fee").html(0);
			$("#true").html(0);
			transferCount = 0;

		}else{
			$("#fee").html(fee);
			$("#true").html(val - fee);
			transferCount = val;
		}

	});


	//提交支付
	$("#tj").bind("click", function(event){
		var t = $(this);

		if($("#user").val() == ""){
			showMsg(langData['siteConfig'][20][220]);
			return false;
		}
		if(transferCount == 0){
			showMsg(langData['siteConfig'][20][221]);
			return false;
		}
		if(transferCount > totalPoint){
			showMsg(langData['siteConfig'][20][222]);
			return false;
		}
		if($("#paypwd").val() == ""){
			showMsg(langData['siteConfig'][20][213]);
			return false;
		}

		var action = $("#payform").attr("action"), data = $("#payform").serialize();

		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

		$.ajax({
			url: action,
			data: data,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){

					t.removeClass('disabled').text(langData['siteConfig'][20][223]);
					setTimeout(function(){
						location.reload();
					},500);

				}else{
					t.text(data.info);
					setTimeout(function(){
						t.removeClass('disabled').text(langData['siteConfig'][6][46]);
					},500);
				}
			},
			error: function(){
				alert(langData['siteConfig'][20][183]);
				t.removeClass('disabled').html(langData['siteConfig'][6][46]);
			}
		});


	});

});


// 错误提示
function showMsg(str){
  var o = $(".error");
  o.html('<p>'+str+'</p>').show();
  setTimeout(function(){o.hide()},1000);
}
