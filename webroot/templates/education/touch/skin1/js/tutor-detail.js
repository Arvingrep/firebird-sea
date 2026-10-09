$(function(){
    // 点击收藏
    $('.follow-wrapper').click(function(){
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            location.href = masterDomain + '/login.html';
            return false;
        }

        var t = $(this), type = '';
        if(t.find('.follow-icon').hasClass('active')){
            t.find('.follow-icon').removeClass('active');
            t.find('.text-follow').text(langData['education'][0][2]);//收藏
            type = 'del';
        }else{
            t.find('.follow-icon').addClass('active');
            t.find('.text-follow').text(langData['education'][4][6]);//已收藏
            type = 'add';
        }
        $.post("/include/ajax.php?service=member&action=collect&module=education&temp=tutor-detail&type="+type+"&id="+pageData.id);
    });

    // 错误提示
    function showMsg(str){
        var o = $(".error");
        o.html('<p>'+str+'</p>').show();
        setTimeout(function(){o.hide()},1000);
    }

    //我要预约
    $('.yue .tec_yuyue').bind('click', function(){
        if(!$(this).hasClass('noyue')){
            $('.work_mask').show();
        }
    });
    $('.peo_footer .class_yuyue').bind('click', function(){
        if(!$(this).hasClass('noyue')){
            $('.work_mask').show();
        }
    });

    $('.step .cancel').bind('click', function(){
        $('.work_mask').hide();
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
        console.log(txt)
        $(".areacode_span label").text(txt);
        $("#areaCode").val(txt.replace("+",""));

        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function(){
        $('.layer_code, #popupReg-captcha-mobile').hide();
        $('.mask-code').removeClass('show');
    })


    $('.step .sure').bind('click', function(e){
        e.preventDefault();

        var t = $("#fabuForm"), action = t.attr('action'), r = true;

        var username = $('#username').val();
        var tel      = $('#tel').val();
        if(!username){
            r = false;
            showMsg(langData['education'][6][32]); //请输入姓名
            return;
        }else if(!tel){
            r = false;
            showMsg(langData['education'][6][24]); //请输入手机号
            return;
        }

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
                    showMsg(data.info);
                    $('.work_mask').hide();
                }else{
                  showMsg(data.info);
                }
            },
            error: function(){
              showMsg(langData['education'][5][33]);
            }
        });

    });



})