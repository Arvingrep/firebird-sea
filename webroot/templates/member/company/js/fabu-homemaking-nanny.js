
$(function(){

	var isClick = 0; //是否点击跳转至锚点，如果是则不监听滚动
	
	//下拉弹窗
	$('.w-form#jzbaomu .down-div .inp').click(function(e){
		var par = $(this).closest('.down-div');
		var downCon = par.find('.time_choose');
		if(!par.hasClass('curr')){
			par.addClass('curr');
			$('.time_choose').removeClass('active');
			downCon.addClass('active');
		}else{
			par.removeClass('curr');
			downCon.removeClass('active');
		}
			
		$(document).one('click',function(){
			par.removeClass('curr');
			downCon.removeClass('active');
		})
		e.stopPropagation();
	})

	//选择下拉
	$('.time_choose p').click(function(){
		$(this).addClass('curr').siblings('p').removeClass('curr');
		var par = $(this).closest('.time_choose');
		var timeDiv = $(this).closest('.down-div').find('.time-div');
		var tid = $(this).find('a').attr('data-id');
		var txt = $(this).find('a').text();
		par.siblings('input').val(tid);
		if(timeDiv.hasClass('huNum')){
			timeDiv.find('input').val(tid);
		}else{
			timeDiv.find('input').val(txt);
		}
		var pardl = $(this).closest('dl');
        var hline = pardl.find(".tip-inline");
        hline.removeClass().addClass("tip-inline success").html("<s></s>");
		
	})

	$(".w-form").delegate("input[type=text],textarea", "focus", function(){
        var t = $(this), dl = t.closest("dl"), hline = dl.find(".tip-inline");
        var errrTip = t.attr('data-title');

        if(dl.attr("data-required") == 1){
            if($(this).val() ==" " || $(this).val() ==""){
                hline.removeClass().addClass("tip-inline focus").html("<s></s>"+errrTip)
            }
        }        
    })

	$(".w-form").delegate("input[type=text],textarea", "blur", function(){
        var t = $(this), dd = t.closest("dd"),dl = t.closest("dl"), hline = dd.find(".tip-inline");
        var errrTip = t.attr('data-title');
        if(dl.attr("data-required") == 1){
            if($(this).val() !=" " && $(this).val() !=""){
                hline.removeClass().addClass("tip-inline success").html("<s></s>");
            }else{
                hline.removeClass().addClass("tip-inline error").html("<s></s>"+errrTip)
            }
        }

        
    })



	//提交发布
	$("#submit").bind("click", function(event){
		$('#addrid').val($('#selAddr .addrBtn').attr('data-id'));
		var addrids = $('#selAddr .addrBtn').attr('data-ids').split(' ');
		$('#cityid').val(addrids[0]);
		$('#place').val(addrids[0]);
		event.preventDefault();

		var t           = $(this),
				title       = $("#username"),
				tel     = $("#tel").val(),
				photo     = $("#photo").val(),
				age    = $("#age").val(),
				addrid = $("#addrid").val(),
				educationname     = $("#educationname").val(),
				experiencename     = $("#experiencename").val(),
				salary     = $("#salary").val(),
				nature     = $('input.natureStr:checked'),//工作类型
				naturedesc     = $('input.naturedescStr:checked');//服务内容


		if(t.hasClass("disabled")) return;

		var offsetTop = 0;

		//验证标题
		var exp = new RegExp("^" + titleRegex + "$", "img");
		if(!exp.test(title.val())){
			var titleErrTip = title.attr('data-title');
			title.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+titleErrTip);
			offsetTop = title.position().top;
		}

		if(tel == ""){
			var titleErrTip = $('#tel').attr('data-title');
			$('#tel').siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+titleErrTip);
			offsetTop = $('#tel').position().top;
		}

		if(age == ""){//年龄
            var pardl = $('#age').closest('dl');
            var hline = pardl.find(".tip-inline"), tips = $('#age').data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = pardl.position().top;
        }
        if(addrid == ""){//籍贯
            var pardl = $('#addrid').closest('dl');
            var hline = pardl.find(".tip-inline"), tips = $('#addrid').data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = pardl.position().top;
        }
        if(educationname == ""){//学历
            var pardl = $('#educationname').closest('dl');
            var hline = pardl.find(".tip-inline"), tips = $('#educationname').data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = pardl.position().top;
        }
        if(experiencename == ""){//从业经验
            var pardl = $('#experiencename').closest('dl');
            var hline = pardl.find(".tip-inline"), tips = $('#experiencename').data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = pardl.position().top;
        }
        if(salary == ""){//薪资
            var pardl = $('#salary').closest('dl');
            var hline = pardl.find(".tip-inline"), tips = $('#salary').data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = pardl.position().top;
        }
        if(nature.length == 0){//工作类型
            var pardl = $('input.natureStr').closest('dl');
            var hline = pardl.find(".tip-inline"), tips = pardl.find('.checkbox').data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = pardl.position().top;
        }
        if(naturedesc.length == 0){//服务内容
            var pardl = $('input.naturedescStr').closest('dl');
            var hline = pardl.find(".tip-inline"), tips = pardl.find('.checkbox').data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = pardl.position().top;
        }


		if(!photo){
			$.dialog.alert(langData['homemaking'][5][8]);//请上传人员照片
			offsetTop = $(".listImgBox").position().top;
		}


		if(offsetTop){
			$('.main').animate({scrollTop: offsetTop+10}, 300);
			return false;
		}
		var nartxt = '',nardesctxt = '';
		$('input.natureStr:checked').each(function(){
			var ttid = $(this).val();
			nartxt += ttid+','
		})
		nartxt = nartxt.substr(0, nartxt.length - 1);

		$('input.naturedescStr:checked').each(function(){
			var ttid = $(this).val();
			nardesctxt += ttid+','
		})		
		nardesctxt = nardesctxt.substr(0, nardesctxt.length - 1);
		$('#nature').val(nartxt)
		$('#naturedesc').val(nardesctxt)

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
						content: tip + "，"+langData['siteConfig'][20][404],
						ok: function(){
							location.href = url;
						}
					});

				}else{
					$.dialog.alert(data.info);
					t.removeClass("disabled").html(langData['siteConfig'][11][19]);

				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
				t.removeClass("disabled").html(langData['siteConfig'][11][19]);
			}
		});


	});
});
