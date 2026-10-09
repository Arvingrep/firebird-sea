$(function(){
	 //菜品
	$('.route').delegate('.inp','input propertychange',function(){
		var inpVal = $(this).val();
	    var par = $(this).closest('.route-div');
	    if(inpVal !=""){
	    	par.find('.del-route').show();
	    	par.addClass('has');
	    }else{
			par.find('.del-route').hide();
			par.removeClass('has');
	    }	      	   
	});
	//添加菜品
	var rflag=1;
	$(".add-route").bind("click", function(event){
		var inpArray = [];
		$('.route-div').each(function(){
			var that = $(this).find('.inp');
			var inp = that.val();	 
			// if(inp == ''){
			// 	that.focus();
			// 	rflag=0
			// 	return false;
			// }else{
			// 	rflag=1
			// }			
			inpArray.push(inp);	    			
		})
		var nary=inpArray.sort(); 
		for(var i=0;i<inpArray.length;i++){
		if ((nary[i]==nary[i+1])&&nary[i]!=''){
				rflag=0;
				alert(langData['marry'][8][25]);	//菜品不能重复	        
				return false;

			}
		}
		var inpLen = $('.route .route-div.has').length;
		if(rflag){			
			//输入菜品名称
			$(this).before('<div class="route-div fn-clear"><input type="text" placeholder="'+langData['marry'][8][24]+'" class="inp" name="dishname[]"><i class="del-route"></i></div>');
			$('.del-route').show();
			return false
			
		}

		
	})

	//删除菜品
	$('.route').delegate('.del-route','click',function(e){
		var par = $(this).closest('.route-div');
		par.remove();
		var rLen = $('.route .route-div').length
		var lastInp = $('.route .route-div:last-child').find('.inp').val();
		if(rLen == 0){
			alert(langData['marry'][8][26]);	//至少保留一个菜品
			//输入菜品名称
			$('.add-route').before('<div class="route-div fn-clear"><input type="text" placeholder="'+langData['marry'][8][24]+'" class="inp" name="dishname[]"><i class="del-route"></i></div>');
		}
		e.stopPropagation();
	})


	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();

		var t        = $(this),				
			comname    = $("#comname"),		
			price    = $("#price");						
			

		if(t.hasClass("disabled")) return;

		var offsetTop = 0;
		if($.trim(comname.val()) == ""){
			var hline = comname.next(".tip-inline"), tips = comname.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;
		}

		if($.trim(price.val()) == ""){
			var hline = price.closest('dd').find(".tip-inline"), tips = price.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;
		}

		if($('.route .has').length == 0){
			$.dialog.alert(langData['marry'][4][29]);//请至少上传一道菜名！
			offsetTop = $("#selTeam").position().top;
		}


		if(offsetTop){
			$('.main').animate({scrollTop: offsetTop + 10}, 300);
			return false;
		}

		var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url");
		data = form.serialize();
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
