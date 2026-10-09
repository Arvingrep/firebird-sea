$(function(){

  function showErr(obj, type){
    if(type == 'suc'){
      obj.siblings('.tip-inline').removeClass().addClass("tip-inline success").show();
    }else{
      obj.siblings('.tip-inline').addClass("tip-inline error").html('<s></s>'+obj.data('title')).css('display','inline-block');
    }
  }

  $("#submit").bind("click", function(e){
    e.preventDefault();
    $('#addrid').val($('.addrBtn').attr('data-id'));
    var addrids = $('.addrBtn').attr('data-ids').split(' ');
    $('#cityid').val(addrids[0]);
    var t              = $(this),
        offsetTop      = 0,
        title          = $("#title"),
        addrid         = $("#addrid").val(),
        address        = $("#address"),
        people         = $("#people"),
        tel            = $("#tel");
    var form = $("#fabuForm"), action = form.attr("action");

    if(t.hasClass("disabled")) return;

    if(title.val() == ''){
      showErr(title);
      offsetTop = offsetTop == 0 ? title.closest('dl').offset().top : offsetTop;
    }

    if(offsetTop == 0 && (addrid == '' || addrid == 0) ){
      $.dialog.alert(langData['siteConfig'][28][63]);   //请选择所在地
      offsetTop = offsetTop == 0 ? $('.addrBtn').closest('dl').offset().top : offsetTop;
    }

    if(address.val() == ''){
      showErr(address);
      offsetTop = offsetTop == 0 ? address.closest('dl').offset().top : offsetTop;
    }

    if(people.val() == ''){
      showErr(people);
      offsetTop = offsetTop == 0 ? people.closest('dl').offset().top : offsetTop;
    }

    if(tel.val() == ''){
      showErr(tel);
      offsetTop = offsetTop == 0 ? tel.closest('dl').offset().top : offsetTop;
    }

    if(offsetTop){
      $('html,body').animate({'scrollTop':offsetTop}, 500);
      return false;
    }

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
						ok: function(){}
					});
					t.removeClass("disabled").html(langData['siteConfig'][6][63]);

				}else{
					$.dialog.alert(data.info);
					t.removeClass("disabled").html(langData['siteConfig'][6][63]);
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
				t.removeClass("disabled").html(langData['siteConfig'][6][63]);
			}
		});

  });


  
})