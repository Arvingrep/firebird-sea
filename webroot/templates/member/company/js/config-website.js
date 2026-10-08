$(function(){

	getEditor("touch_about");

	$('.radio span').bind('click', function(){
      var t = $(this);
      t.addClass('curr').siblings('span').removeClass('curr');
      t.siblings('input').val(t.data('id'));
      $('#qj_0, #qj_1').hide();
      $('#qj_' + t.data('id')).show();
  })

	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();

		var t       = $(this),
			title   = $("#title");

		var o = $('.uploadVideo ul li');
		var video = '';
		if(o.length > 0){
			video = o.eq(0).find('video').attr('data-val');
		}
		$('#video').val(video);

		var qj_type = $('#qj_type').val();
		var qj_pics = [];
		if(qj_type == 0){
			$('#listSection6 li').each(function(){
				var img = $(this).find('img').attr('data-val');
				qj_pics.push(img)
			})
		}
		$('#qj_pics').val(qj_pics.join(','));

		if(t.hasClass("disabled")) return;

		var offsetTop = 0;

		//公司名称
		if($.trim(title.val()) == "" || title.val() == 0){
			title.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][27][37]);
			offsetTop = offsetTop == 0 ? title.position().top : offsetTop;
		}

		if(offsetTop){
			$('.main').animate({scrollTop: offsetTop + 10}, 300);
			return false;
		}

		var form = $("#fabuForm"), action = form.attr("action");
		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

		$.ajax({
			url: action,
			data: form.serialize(),
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){

					$.dialog({
						title: langData['siteConfig'][19][287],
						icon: 'success.png',
						content: data.info,
						ok: function(){
							location.reload();
						}
					});
					t.removeClass("disabled").html(langData['siteConfig'][6][63]);

				}else{
					$.dialog.alert(data.info);
					t.removeClass("disabled").html(langData['siteConfig'][6][63]);
					$("#verifycode").click();
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
				t.removeClass("disabled").html(langData['siteConfig'][6][63]);
				$("#verifycode").click();
			}
		});


	});
});
