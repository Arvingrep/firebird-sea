$(function(){

	var transferCount = 0;
	//最多可赠送的积分
	var canPoint = totalPoint / ((100 + pointFee) / 100);
	var resPoint = Math.floor(canPoint*100)/100;//取小数点后两位
	$('#canTrans').html(resPoint);

	//数量验证
	$("#amountp").bind("blur", function(){
		var t = $(this), val = t.val();
		var fee = val * pointFee / 100;
		var regu = "(^[1-9]([0-9]?)+[\.][0-9]{1,2}?$)|(^[1-9]([0-9]+)?$)|(^[0][\.][0-9]{1,2}?$)";
		var re = new RegExp(regu);
		if(val != 0 && val){
			if (!re.test(val)) {
				showMsg(langData['siteConfig'][54][135]);//最多输入两位小数
				$("#fee").html(0);
				$("#amount").val(0);
				$('#allPoint').html(0);
				transferCount = 0;

			}else if(val > canPoint){

				showMsg(langData['siteConfig'][20][579].replace('1', pointName)); //可用1不足
				$("#fee").html(0);
				$("#amount").val(0);
				$('#allPoint').html(0);
				transferCount = 0;

			}else{
				var feeP = Math.floor(fee*100)/100;
				$("#fee").html(feeP);
				var allP = parseFloat(val) + parseFloat(fee);
				var allMo = Math.floor(allP*100)/100;
				$("#amount").val(allMo);
				$('#allPoint').html(allMo);
				transferCount = val;
			}
		}


	});


	//提交支付
	$("#tj").bind("click", function(event){
		var t = $(this);

		if($("#user").val() == ""){
			showMsg(langData['siteConfig'][20][220]);
			return false;
		}
		if(!transferCount){
			showMsg(langData['siteConfig'][20][221]);
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
					showMsg(data.info);
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
