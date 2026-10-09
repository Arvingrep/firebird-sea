$(function () {
    //服务选择
    $('.service-box .service li').click(function () {
        $(this).toggleClass('active');
        var ids = [];
        $('.service-box .service li').each(function(){
            if($(this).hasClass('active')){
                ids.push($(this).data('id'));
            }
        })
        $('#tag').val(ids.join("|"));
    });

    //营业时间
    var numArr =['01时','02时','03时','04时','05时','06时','07时','08时','09时','10时','11时','12时','13时','14时','15时','16时','17时','18时','19时','20时','21时','22时','23时','24时'
],numArr1 =['00分','10分','20分','30分','40分','50分'],numArr2 =['01时','02时','03时','04时','05时','06时','07时','08时','09时','10时','11时','12时','13时','14时','15时','16时','17时','18时','19时','20时','21时','22时','23时','24时'
],numArr3 =['00分','10分','20分','30分','40分','50分'];//自定义数据
    var huxinSelect = new MobileSelect({
        trigger: '.time ',
        title: '',
        wheels: [
            {data: numArr},
            {data: numArr1},
            {data: numArr2},
            {data: numArr3}
        ],
        position:[0, 0],
        callback:function(indexArr, data){
            console.log(data);
            var h = parseInt(data[0].replace(/[^0-9]/ig,"")), i = parseInt(data[1].replace(/[^0-9]/ig,"")), h1 = parseInt(data[2].replace(/[^0-9]/ig,"")), i1 = parseInt(data[3].replace(/[^0-9]/ig,""));
            $('#openStart').val(h+':'+i);
            $('#openEnd').val(h1+':'+i1);
            $('#open-time').val(parseInt(data[0].replace(/[^0-9]/ig,""))+'时 '+parseInt(data[1].replace(/[^0-9]/ig,""))+'分-'+parseInt(data[2].replace(/[^0-9]/ig,""))+'时 '+parseInt(data[3].replace(/[^0-9]/ig,""))+'分');
            $('.time .choose span').hide();
        }
        ,triggerDisplayData:false,
    });
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
    $('#btn-keep').click(function (e) {
        e.preventDefault();
        var t = $("#fabuForm"), action = t.attr('data-action');
        t.attr('action', action);

        var comname = $('#comname').val();
        var address = $('#address').val();
        var phone = $('#phone').val();
        var tag = $('#tag').val();
        var opentime = $('#open-time').val();
        var addrid = 0, cityid = 0, r = true;

        if(!comname){
            r = false;
            $('.maskbg').show();
            $('.maskbg .msg-box .msg').html(''+langData['car'][4][14]+'');
        }else if(!address){
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
        }else if($('.update-logo dt .pic').length == 0){
            r = false;
            $('.maskbg').show();
            $('.maskbg .msg-box .msg').html(''+langData['car'][4][39]+'');
        }else if($('.store-imgs .imgshow_box').length == 0){
            r = false;
            $('.maskbg').show();
            $('.maskbg .msg-box .msg').html(''+langData['car'][4][0]+'');
        }else if(!tag){
            r = false;
            $('.maskbg').show();
            $('.maskbg .msg-box .msg').html(''+langData['car'][4][40]+'');
        }else if(!opentime){
            //r = false;
            //$('.maskbg').show();
            //$('.maskbg .msg-box .msg').html(''+langData['car'][4][41]+'');
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

        var pics = [];
        $("#fileList").find('.thumbnail').each(function(){
            var src = $(this).find('img').attr('data-val');
            pics.push(src);
        });
        $("#pics").val(pics.join(','));

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
                    $('.maskbg').show();
                    $('.maskbg .msg-box .msg').html(data.info);
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