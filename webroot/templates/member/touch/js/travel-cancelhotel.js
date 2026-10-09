$(function () {

    //提交发布
	$(".cancel_btn").bind("click", function(event){
        event.preventDefault();

        var t           = $(this);

        var form = $("#fabuForm"), action = form.attr("action");
        data = form.serialize();

        t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

        $.ajax({
			url: action,
			data: data,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					setTimeout(function () {
                        bridge.callHandler("goBack", {}, function (responseData) {
                        });
                    }, 200);
                    history.go(-1);
				}else{
					alert(data.info);
					t.removeClass("disabled").html(langData['siteConfig'][11][19]);
				}
			},
			error: function(){
				t.removeClass("disabled").html(langData['siteConfig'][11][19]);
			}
		});
    });



});