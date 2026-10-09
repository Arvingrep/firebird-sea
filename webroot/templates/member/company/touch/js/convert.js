$(function(){

  var convertPrice = 0;

  $("#amount").bind("blur", function(){
		var t = $(this), val = t.val();

    var regu = "(^[1-9]([0-9]?)+[\.][0-9]{1,2}?$)|(^[1-9]([0-9]+)?$)|(^[0][\.][0-9]{1,2}?$)";
		var re = new RegExp(regu);
		if (!re.test(val)) {

			showMsg(langData['siteConfig'][20][63]);
			$("#count").html(0);
			convertPrice = 0;

		}else if(val > totalMoney){

			showMsg(langData['siteConfig'][20][214]);
			$("#count").html(0);
			convertPrice = 0;

		}else{
			$("#count").html(val * pointRatio);
			convertPrice = val;
		}

	});

  //提交支付
	$("#tj").bind("click", function(event){
		var t = $(this), val = $('#amount').val();

		if(t.hasClass('disabled')) return;

		if(convertPrice == 0){
			showMsg(langData['siteConfig'][20][212]);
			return false;
		}
		else if(convertPrice > totalMoney){
			showMsg(langData['siteConfig'][20][215]);
			return false;
		}
		if($("#paypwd").val() == ""){
			showMsg(langData['siteConfig'][20][216]);
			return false;
		}

		var action = $("#payform").attr("action"), data = $("#payform").serialize();

		t.addClass('disabled').html(langData['siteConfig'][6][35]+"...");

		$.ajax({
			url: action,
			data: data,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					t.removeClass('disabled').text(langData['siteConfig'][20][217]);
					setTimeout(function(){
						location.reload();
					},500);

				}else{
					t.text(data.info);
					setTimeout(function(){
						t.removeClass('disabled').text(langData['siteConfig'][6][43]);
					},500);
				}
			},
			error: function(){
				alert(langData['siteConfig'][20][183]);
				t.removeClass('disabled').html(langData['siteConfig'][6][43]);
			}
		});


	});



})



// 错误提示
function showMsg(str){
  var o = $(".error");
  o.html('<p>'+str+'</p>').show();
  setTimeout(function(){o.hide()},1000);
}
