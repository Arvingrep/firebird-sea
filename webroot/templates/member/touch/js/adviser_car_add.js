$(function () {
    // 金牌顾问
    $('.info-b li.stages').click(function () {
        $(this).toggleClass('chose_btn');
        if($(this).hasClass('chose_btn')){
            $("#quality").val(1);
        }else{
            $("#quality").val(0);
        }
    });
    // 信息提示框
    $('.maskbg .msg-box .btn-close').click(function () {
        $('.maskbg').hide();
    });
    //表单验证
    function isPhoneNo(p) {
        var areaCode = parseInt($("#areaCode").val());
        if(areaCode == 86){
            var pattern = /^1[23456789]\d{9}$/;
            return pattern.test(p);
        }
        return true;
    }
    $('.add-btn span').on('click',function () {
        var f = $('#zjuserForm'), r = true;;

        var phone = $('#phone').val()
        if($('.up-box dt .pic').length == 0){
            r = false;
            $('.maskbg').show();
            $('.maskbg .msg-box .msg').html(langData['siteConfig'][44][16]);//请上传头像
        }else if(!phone){
            r = false;
            $('.maskbg').show();
            $('.maskbg .msg-box .msg').html(langData['siteConfig'][21][185]);//请填写手机号
        }else if (isPhoneNo($.trim($('#phone').val())) == false) {
            r = false;
            $('.maskbg').show();
            $('.maskbg .msg-box .msg').html(langData['siteConfig'][44][17]);//请输入正确的手机号!
        }

        if(!r){
            return;
        }

        var userid = $('#userid').val();

        var action = userid == 0 ? 'addAdviser' : 'operAdviser&type=update';
		$.ajax({
			url: '/include/ajax.php?service=car&action='+action,
			type: 'GET',
			data: f.serialize(),
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
                    location.href = gourl;
				}else{
                    $('.maskbg').show();
                    $('.maskbg .msg-box .msg').html(data.info);
                }
			},
			error: function(){
                $('.maskbg').show();
                $('.maskbg .msg-box .msg').html(langData['siteConfig'][6][203]);//网络错误，请重试！
			}
        })
        
    });
});