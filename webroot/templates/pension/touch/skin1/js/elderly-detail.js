$(function(){

  
    //参观权限弹出
    $('.info_list').delegate('.no_visit', 'click', function(){
        $('.info_mask2').show();
        return false;

    })
    //参观权限关闭
    $('.info_mask2').delegate('.know', 'click', function(){
        $('.info_mask2').hide();
  

    })
    //允许参观弹出
    $('.info_list').delegate('.can_visit', 'click', function(){
        $('.info_mask').css('visibility','visible');
        return false;

    })
    //联系方式弹出
    $('.detail_bot').delegate('.contact', 'click', function(){
        if($(this).data('id')==1){
        	$('.contact_mask').show();
        }else{
            $('.info_mask2').show();
        }

    })
    //联系方式关闭
    $('.contact_mask').delegate('.know', 'click', function(){
        $('.contact_mask').hide();

    })

    //详情页允许参观弹出
    $('.detail_bot').delegate('.invite', 'click', function(){
        if($(this).data('id')==1){
            $('.info_mask').css('visibility','visible');
        }else{
            $('.info_mask2').show();
        }
        return false;

    })
    // 错误提示
    function showMsg(str){
      var o = $(".error");
      o.html('<p>'+str+'</p>').show();
      setTimeout(function(){o.hide()},1000);
    }
    //  表单验证
    function isPhoneNo(p) {
        var pattern = /^1[34578]\d{9}$/;
        return pattern.test(p);
    }
    $('.info_con .sure').click(function(){

        var info_name = $('#info_name').val(), 
            info_phone = $('#info_phone').val(), 
            f = $(this) ;

        if(f.hasClass("disabled")) return false;

        if (!info_name) {

            showMsg('请填写联系人'); //请填写联系人

        }else if (!info_phone) {

           showMsg('请填写联系电话'); //请填写联系电话

        }else if (isPhoneNo($.trim(info_phone)) == false){
            showMsg('请填写正确的手机号');   //请填写正确的手机号
        }

        var form = $("#yuform"), action = form.attr("action");

		$.ajax({
			url: action,
			data: form.serialize(),
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					$("#info_name").val('');
					$("#info_phone").val('');
					$('.info_mask').css('visibility','hidden');
					$('.org_mask2').show();
					f.removeClass("disabled").html(langData['siteConfig'][6][63]);
				}else{
					showMsg(data.info);
					f.removeClass("disabled").html(langData['siteConfig'][6][63]);
				}
			},
			error: function(){
				showMsg(langData['siteConfig'][20][183]);
				f.removeClass("disabled").html(langData['siteConfig'][6][63]);
			}
        });
    })
    $('.info_con .cancel').click(function(){
         $('.info_mask').css('visibility','hidden');
    })

    // 关闭
     $('.org_mask2 .konw').click(function(){
        $('.org_mask2').hide();
   
     })
})
