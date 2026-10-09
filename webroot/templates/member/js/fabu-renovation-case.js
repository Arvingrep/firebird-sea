$(function(){

	$('.typeObj').change(function(){
		var sel = $(this), id = sel.val();
		$("#type0, #type1").hide();
		$("#type"+id).show();
	})

	//时间
	var selectDate = function(el, func){
		WdatePicker({
			el: el,
			isShowClear: false,
			isShowOK: false,
			isShowToday: false,
			qsEnabled: false,
			dateFmt: 'yyyy-MM-dd'
		});
	}
	$("#began").focus(function(){
		selectDate("began");
	});
	$("#end").focus(function(){
		selectDate("end");
	});
	//擅长风格
    $('.art_ul').off('click').delegate('li', 'click', function () {

      $(this).toggleClass('curr').siblings('li').removeClass('curr')
		$("#style").val($(this).attr("data-id"));
    })

	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();

		var t        = $(this),				
				title    = $.trim($('#title').val()),//标题
				type = $("#type").val(),//类别
				area = $("#area").val(),//面积
				price = $("#price").val(),//造价
				style = $("#style").val(),//风格
				units = $("#units").val(),//户型
				btype = $("#btype").val(),//装修方式
				comstyle = $("#comstyle").val(),//公装类型
				began = $("#began").val(),//开工日期
				end = $("#end").val();//竣工日期

		if(t.hasClass("disabled")) return;

		var offsetTop = 0;


		if(title == ""){//标题
			var hline = $('#title').next(".tip-inline"), tips = $('#title').data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;
		}

		if(area == ""){//面积
			var par = $("#area").closest('dd');
			var hline = par.find(".tip-inline"), tips = $("#area").data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;
		}

		if(price == ""){//造价
			var par = $("#price").closest('dd');
			var hline = par.find(".tip-inline"), tips = $("#price").data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;
		}

		if(style == ""){//风格
			$.dialog.alert(langData['renovation'][9][37]);
			offsetTop = $("#selTeam").position().top;

		}

		if(units == "" && type == 0){//户型
			var par = $("#units").closest('dd');
			var hline = par.find(".tip-inline"), tips = par.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;

		}

		if(comstyle == ""  && type == 1){//公装类型
			var par = $("#comstyle").closest('dd');
			var hline = par.find(".tip-inline"), tips = par.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;

		}

		if(btype == ""){//装修方式
			var par = $("#btype").closest('dd');
			var hline = par.find(".tip-inline"), tips = par.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;
		}

		if(began == ""){//开工日期
			var par = $("#began").closest('dd');
			var hline = par.find(".tip-inline"), tips = $("#began").data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;
		}else{
			var par = $("#began").closest('dd');
			par.find(".tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
		}

		if(end == ""){//竣工日期
			var par = $("#end").closest('dd');
			var hline = par.find(".tip-inline"), tips = $("#end").data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;
		}else{
			var par = $("#end").closest('dd');
			par.find(".tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
		}

		//平面户型图
		var imgli = $("#listSection4 li");
		if(imgli.length <= 0 && offsetTop <= 0){
			$.dialog.alert(langData['renovation'][9][33]);//请上传平面户型图
			offsetTop = $("#selTeam").position().top;
		}

		var unitspic = $("#unitspic").val();
		$("#unitspic").attr("value", unitspic);


		//效果图
		var imgli = $("#listSection3 li");
		if(imgli.length <= 0 && offsetTop <= 0){
			$.dialog.alert(langData['renovation'][9][34]);//请上传效果图
			offsetTop = $("#selTeam").position().top;
		}

		var certs = $("#imglist").val();
		$("#imglist").attr("value", certs);
		if(offsetTop){
			$('html,body').animate({scrollTop: offsetTop + 10}, 300);
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

//上传成功接收
function uploadSuccess(obj, file, type, path){
	$("#"+obj).val(file);
	$("#"+obj).siblings(".spic").find(".sholder").html('<img src="'+path+'" />');
	$("#"+obj).siblings(".spic").find(".reupload").attr("style", "display: inline-block");
	$("#"+obj).siblings(".spic").show();
	$("#"+obj).siblings("iframe").hide();
}
