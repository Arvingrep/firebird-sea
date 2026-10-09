$(function(){

	//同意退款
	$('.refund_sure').click(function () {	
		$('.agreekuanWrap').css('display','flex');
    	$('.agreelegouMask').show();
	});	

	//同意退款--同意
	$('.agreekuanWrap .sureTuikuan').click(function () {
        var t = $(this), id = detailID;
        if(t.hasClass('disabled')) return false;

        if(id){
        	t.addClass('disabled');
            var data = [];
            data.push('id='+id);
            $.ajax({
                url: '/include/ajax.php?service=travel&action=refundPay',
                data: data.join("&"),
                type: 'post',
                dataType: 'json',
                success: function(data){
                    if(data && data.state == 100){
                        $(".legouComWrap .closeAlert").click();                       
                    }else{
                        $.dialog.alert(data.info);
                        t.removeClass('disabled');
                    }
                },
                error: function(){
                    $.dialog.alert(langData['siteConfig'][6][203]);
                    t.removeClass('disabled');
                }
            });
        }
        
    })

    //关闭弹窗
	$(".legouComWrap .closeAlert,.agreelegouMask,.legouComWrap .cancelTui").click(function(e){
    	$('.legouComWrap').css('display','none');
    	$('.agreelegouMask').hide();

    })

	//拒绝退款
	$(".refund_refuse,.refundCon a.cancel").bind("click", function(){
		$(".refundCon").toggle();
	});




	//字数限制
	var commonChange = function(t){
		var val = t.val(), maxLength = 500, tip = $(".lim-count");
		var charLength = val.replace(/<[^>]*>|\s/g, "").replace(/&\w{2,4};/g, "a").length;
		var surp = maxLength - charLength;
		surp = surp <= 0 ? 0 : surp;
		var txt = langData['siteConfig'][23][63].replace('1', '<strong>' + surp + '</strong>');  //还可输入 1 个字。
		tip.html(txt);

		if(surp <= 0){
			t.val(val.substr(0, maxLength));
		}
	}

	$("#content").focus(function(){
		commonChange($(this));
	});
	$("#content").keyup(function(){
		commonChange($(this));
	});
	$("#content").keydown(function(){
		commonChange($(this));
	});
	$("#content").bind("paste", function(){
		commonChange($(this));
	});


	//提交申请
	$("#refundBtn").bind("click", function(){
		var t      = $(this),
				content = $("#content").val();

		if(content == "" || content.length < 15){
			alert(langData['siteConfig'][20][195]);  //说明内容至少15个字！
			return;
		}

		var pics = [];
		$("#listSection1 li").each(function(){
			var val = $(this).find("img").attr("data-val");
			if(val != ""){
				pics.push(val);
			}
		});

		var data = {
			id: detailID,
			// type: type,
			content: content,
			pics: pics.join(",")
		}

		t.attr("disabled", true).html(langData['siteConfig'][6][35]+"...");  //提交中

		$.ajax({
			url: masterDomain+"/include/ajax.php?service=travel&action=refuseRefund",
			data: data,
			type: "POST",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					// alert("提交成功，请耐心等待申请结果！");
					location.reload();
				}else{
					alert(data.info);
					t.attr("disabled", false).html(langData['siteConfig'][6][118]);//重新提交
				}
			},
			error: function(){
				alert(langData['siteConfig'][20][183]);  //网络错误，请稍候重试！
				t.attr("disabled", false).html(langData['siteConfig'][6][118]);//重新提交
			}
		});
	});


});
