$(function(){

    //导航
    $('.header-r .screen').click(function(){
        var nav = $('.nav'), t = $('.nav').css('display') == "none";
        if (t) {nav.show();}else{nav.hide();}
    });

    (function ($) {
        $.getUrlParam = function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]); return null;
        }
    })(jQuery);
    var rates = $.getUrlParam('rates');
    //var type  = $.getUrlParam('type');



    if (rates == 1) {
        $('.layer').addClass('show').css({"left":"0"});
    }

    // 退款
    $('.apply-refund-link').click(function(){
        var t = $(this);
        $('.layer').addClass('show').animate({"left":"0"},100);
    })

    $('.fahuo').click(function(){
        var t = $(this);
        $('.layer').addClass('show').animate({"left":"0"},100);
    })

    // 隐藏退款
    $('#typeback').click(function(){
        $('.layer').animate({"left":"100%"},100);
        setTimeout(function(){
            $('.layer').removeClass('show');
        }, 100)
    })


    //收货
    $(".sh").bind("click", function(){
        var t = $(this);
        if(t.attr("disabled") == "disabled") return;

        if(confirm(langData['siteConfig'][20][188])){
            t.html(langData['siteConfig'][6][35]+"...").attr("disabled", true);

            $.ajax({
                url: "/include/ajax.php?service=info&action=receipt",
                data: "id="+id,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if(data && data.state == 100){
                        location.reload();

                    }else{
                        alert(data.info);
                        t.attr("disabled", false).html(langData['siteConfig'][6][45]);
                    }
                },
                error: function(){
                    alert(langData['siteConfig'][20][183]);
                    t.attr("disabled", false).html(langData['siteConfig'][6][45]);
                }
            });

        }

    });

	//确定退款
	$(".tuikuan").bind("click", function(){
		var t = $(this);
		if(t.attr("disabled") == "disabled") return;

		if(confirm(langData['siteConfig'][20][407])){
			t.html(langData['siteConfig'][6][35]+"...").attr("disabled", true);

			$.ajax({
				url: "/include/ajax.php?service=info&action=refundPay",
				data: "id="+id,
				type: "POST",
				dataType: "json",
				success: function (data) {
					if(data && data.state == 100){
						location.reload();
					}else{
						alert(data.info);
						t.attr("disabled", false).html(langData['siteConfig'][6][153]);
					}
				},
				error: function(){
					alert(langData['siteConfig'][20][183]);
					t.attr("disabled", false).html(langData['siteConfig'][6][153]);
				}
			});
  	}
  });

    //提交申请
    $("#submit").bind("click", function(){
        var t       = $(this),
            type    = $("#type").val(),
            content = $("#textarea").val();

        if(t.hasClass('disabled')) return;

        if(type == 0 || type == ""){
            alert(langData['siteConfig'][20][194]);
            return;
        }

        if(content == "" || content.length < 15){
            // alert(langData['siteConfig'][20][195]);
            // return;
        }

        var pics = [];
        $("#litpic li.item").each(function(){
            var val = $(this).find("img").attr("data-val");
            if(val != ""){
                pics.push(val);
            }
        });

        var data = {
            id: id,
            type: type,
            content: content,
            pics: pics.join(",")
        }


        t.addClass("disabled", true).html(langData['siteConfig'][6][35]+"...");

        $.ajax({
            url: masterDomain+"/include/ajax.php?service=info&action=refund",
            data: data,
            type: "POST",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    alert(langData['siteConfig'][20][193]);
                    location.reload();
                }else{
                    alert(data.info);
                    t.addClass("disabled").html(langData['siteConfig'][6][118]);
                }
            },
            error: function(){
                alert(langData['siteConfig'][20][183]);
                t.removeClass("disabled").html(langData['siteConfig'][6][118]);
            }
        });
    });

    //提交快递信息
    $("#expBtn").bind("click", function(){
        var t = $(this),
            company = $("#exp-company"),
            number  = $("#exp-number");

        if($.trim(company.val()) == ""){
            alert(langData['siteConfig'][27][60]);
            return false;
        }

        if($.trim(number.val()) == ""){
            alert(langData['siteConfig'][27][406]);
            return false;
        }

        var data = [];
        data.push("id="+id);
        data.push("company="+company.val());
        data.push("number="+number.val());

        t.attr("disabled", true).html(langData['siteConfig'][6][35]+"...");

        $.ajax({
            url: "/include/ajax.php?service=info&action=delivery",
            data: data.join("&"),
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    alert(data.info);
                    location.reload();
                }else{
                    alert(data.info);
                    t.attr("disabled", false).html(langData['siteConfig'][6][0]);
                }
            },
            error: function(){
                alert(langData['siteConfig'][20][183]);
                t.attr("disabled", false).html(langData['siteConfig'][6][0]);
            }
        });

    });



})
