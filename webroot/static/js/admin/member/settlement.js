$(function(){
	sceneArr = sceneArr && JSON.parse(sceneArr) || [];
	//表单验证
	$("#editform").delegate("input,textarea", "focus", function(){
		var tip = $(this).siblings(".input-tips");
		if(tip.html() != undefined){
			tip.removeClass().addClass("input-tips input-focus").attr("style", "display:inline-block");
		}
	});

	$("#editform").delegate("input,textarea", "blur", function(){
		var obj = $(this);
		huoniao.regex(obj);
	});

	$("input[name='withdrawWxVersion']").change(function(){
		let val = $(this).val();
		if(val == 4){
			$('.withdrawWxVersion4').removeClass('hide');
		}else{
			$('.withdrawWxVersion4').addClass('hide');
		}
	})
	$('.sceneSelect').change(function(){
		let par = $(this).parents('.input-prepend');
		var val = $(this).val();
		let labelArr = sceneArr[val] && sceneArr[val].label;
		let html = [];
		let conText = $(this).attr('data-con')
		let name = $(this).attr('name')
		var valArr = []
		if(window[name] && window[conText] && val == window[name]){
			valArr = JSON.parse(window[conText])
		}
		if( $(".sceneText[data-con='"+ conText +"']").length){
			$(".sceneText[data-con='"+ conText +"']").remove();
		}
		console.log(val)
		for(let i = 0; i < labelArr.length; i++){
			html.push(`<div class="input-prepend sceneText input-append" data-con="${conText}" style="display:block;">
				<span class="add-on" style="vertical-align: top!important;">${labelArr[i]}：</span>
                <input class="input-xlarge" type="text" name="${conText}[]" value="${valArr.length && valArr[i] || ''}">
			</div>`)
		}
		par.after(html.join(''))
	})

	//表单提交
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		let tip = ''
		if($("input[name='withdrawWxVersion']:checked").val() == 4){
			if($("select[name='businessAutoWithdrawSceneSelectV4']").val() == ''){
				tip = '请选择商家自动提现场景'
			}else{
				let val = $("select[name='businessAutoWithdrawSceneSelectV4']").val()
				let conText = 'businessAutoWithdrawSceneContentV4';
				$(".sceneText[data-con='"+ conText +"']").each(function(){
					let val = $(this).find('input').val(),title = $(this).find('.add-on').text();
					if(!val){
						tip = '请填写' +   title.replace('：','')
						return false;
					}
				})
			}
			if(tip){ 
				alert(tip);
				return false;
			}
			if($("select[name='commonWithdrawSceneSelectV4']").val() == ''){
				tip = '请选择普通自动提现场景'
			}else{
				let val = $("select[name='commonWithdrawSceneSelectV4']").val()
				let conText = 'commonWithdrawSceneContentV4';
				$(".sceneText[data-con='"+ conText +"']").each(function(){
					let val = $(this).find('input').val(),title = $(this).find('.add-on').text();
					if(!val){
						tip = '请填写' + title.replace('：','')
						return false;
					}
				})
			}
			if(tip){ 
				huoniao.showTip('error', tip, "auto");
				alert(tip);
				return false;
			}
			if($("select[name='courierWithdrawSceneSelectV4']").val() == ''){
				tip = '请选择骑手自动提现场景'
			}else{
				let val = $("select[name='courierWithdrawSceneSelectV4']").val()
				let conText = 'courierWithdrawSceneContentV4';
				$(".sceneText[data-con='"+ conText +"']").each(function(){
					let val = $(this).find('input').val(),title = $(this).find('.add-on').text();
					if(!val){
						tip = '请填写'  + title.replace('：','')
						return false;
					}
				})
			}

			if(tip){ 
				// huoniao.showTip('error', tip, "auto");
				alert(tip);
				return false;
			}
		}
		//异步提交
		var post = $("#editform").find("input, select, textarea").serialize();
		huoniao.operaJson("settlement.php", post + "&token="+$("#token").val(), function(data){
			var state = "success";
			if(data.state != 100){
				state = "error";
			}
			huoniao.showTip(state, data.info, "auto");
		});
	});


});
