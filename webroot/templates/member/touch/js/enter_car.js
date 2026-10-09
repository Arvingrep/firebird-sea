$(function () {
    //国际手机号获取
    getNationalPhone();
    function getNationalPhone(){
        $.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'jsonp',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   var listLen = list.length;
                   var codeArea = list[0].code;
                   if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        $('.areacode_span').closest('li').hide();
                        return false;
                   }
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li><span>'+list[i].name+'</span><em class="fn-right">+'+list[i].code+'</em></li>');
                   }
                   $('.layer_list ul').append(phoneList.join(''));
                }else{
                   $('.layer_list ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                    $('.layer_list ul').html('<div class="loading">加载失败！</div>');
                }

        })
    }
    // 打开手机号地区弹出层
    $(".areacode_span").click(function(){
        $('.layer_code').show();
        $('.mask-code').addClass('show');
    })
    // 选中区域
    $('.layer_list').delegate('li','click',function(){
        var t = $(this), txt = t.find('em').text();
        $(".areacode_span label").text(txt);
        $("#areaCode").val(txt.replace("+",""));

        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function(){
        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })


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
    $('#submit').on('click',function (e) {
        var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			window.location.href = masterDomain+'/login.html';
			return false;
        }
        e.preventDefault();
        var t = $("#fabuForm"), action = t.attr('data-action');
        t.attr('action', action);
        
        var comname = $('#comname').val();
        var addressdetail = $('#add-detail').val();
        var phone = $('#phone').val();
        var addrid = 0, cityid = 0, r = true;

        if(!comname){
            r = false;
            $('.maskbg').show();
            $('.maskbg .msg-box .msg').html(''+langData['car'][4][14]+'');
        }else if(!addressdetail){
            r = false;
            $('.maskbg').show();
            $('.maskbg .msg-box .msg').html(''+langData['car'][4][15]+'');
        }else if(!phone){
            r = false;
            $('.maskbg').show();
            $('.maskbg .msg-box .msg').html(''+langData['car'][4][16]+'');
        }else if (isPhoneNo($.trim($('#phone').val())) == false) {
            r = false;
            $('.maskbg').show();
            $('.maskbg .msg-box .msg').html(''+langData['car'][4][17]+'');
        }else if($('.up dt .pic').length == 0){
            r = false;
            $('.maskbg').show();
            $('.maskbg .msg-box .msg').html(''+langData['car'][4][18]+'');
        }

        var ids = $('.gz-addr-seladdr').attr("data-ids");
        if(ids != undefined && ids != ''){
            addrid = $('.gz-addr-seladdr').attr("data-id");
            ids = ids.split(' ');
            cityid = ids[0];
        }else{
            r = false;
            $('.maskbg').show();
            $('.maskbg .msg-box .msg').html(''+langData['car'][6][48]+'');
        }
        $('#addrid').val(addrid);
        $('#cityid').val(cityid);

        if(!r){
            return;
        }

        $.ajax({
			url: action,
			data: t.serialize(),
			type: 'post',
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
                $('.maskbg .msg-box .msg').html(''+langData['siteConfig'][6][203]+'');
			}
		})


    });
});