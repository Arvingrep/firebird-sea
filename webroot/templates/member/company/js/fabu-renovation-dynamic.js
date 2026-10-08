$(function(){
	function getEditor(id){
		ue = UE.getEditor(id, {toolbars: [['fullscreen', 'undo', 'redo', '|', 'fontfamily', 'fontsize', '|', 'removeformat', 'formatmatch', 'autotypeset', '|', 'forecolor', 'bold', 'italic', 'underline', '|', 'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|', 'simpleupload', '|', 'insertimage', '|', 'insertorderedlist', 'insertunorderedlist', '|', 'link', 'unlink']], initialStyle:'p{line-height:1.5em; font-size:13px; font-family:microsoft yahei;}'});
		ue.on("focus", function() {ue.container.style.borderColor = "#999"});
		ue.on("blur", function() {ue.container.style.borderColor = ""})
	}

	getEditor("body");

	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();

		var t        = $(this),				
			title    = $("#title");			
			
		console.log()

		if(t.hasClass("disabled")) return;

		var offsetTop = 0;
		if($.trim(title.val()) == ""){
			var hline = title.next(".tip-inline"), tips = title.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;
		}

		 ue.sync();
       if(!ue.hasContents()){
    		$.dialog.alert(langData['renovation'][15][57]);//请填写详情！
            offsetTop = $("#selTeam").position().top;
    	}


		if(offsetTop){
			$('.main').animate({scrollTop: offsetTop + 10}, 300);
			return false;
		}

		var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url");
		fid = Identity.store.id;
		data = form.serialize();
		data += "&fid="+fid;//发布者
		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

		$.ajax({
			url: action,
			data: data,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					var tip = langData['siteConfig'][20][341];
					if(id != undefined && id != "" && id != 0){
						tip = langData['siteConfig'][20][229];
					}

					$.dialog({
						title: langData['siteConfig'][19][287],
						icon: 'success.png',
						content: tip,
						ok: function(){
							location.href = url;
						}
					});

				}else{
					$.dialog.alert(data.info);
					t.removeClass("disabled").html(langData['shop'][1][7]);
					$("#verifycode").click();
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
				t.removeClass("disabled").html(langData['shop'][1][7]);
				$("#verifycode").click();
			}
		});

	});

});
