$(function(){
$(".section1 ul li:nth-child(3n)").css("margin-right","0");
     //放大图片
    $.fn.bigImage({
        artMainCon:".build_container",  //图片所在的列表标签
    });

    //预约参观
    $('.build_foot').delegate(".order_see", "click", function(){
        $('.order_mask').show();

    })
  
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
                        $('.areacode_span').hide();
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
        var par = $('.formCommon')
        var arcode = par.find('.areacode_span')
        arcode.find("label").text(txt);
        par.find(".areaCodeinp").val(txt.replace("+",""));

        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function(){
        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })
    // 预约参观 表单验证
    $('.free').click(function(){

        var f = $(this);        
        var name = $('#order_name').val(), 
            tel = $('#order_phone').val(),
            siteType = $('.site_type').text(),
            siteArea = $('.site_area').text(),
            siteId = f.attr('data-id');
        var txt = f.text();
        if(f.hasClass("disabled")) return false;
        var par = f.closest('.formCommon');
        var areaCodev = $.trim(par.find('.areaCodeinp').val());

        if (!name) {

            $('.name-1').show();
            setTimeout(function(){$('.name-1').hide()},1000);

        }else if (!tel) {

            $('.phone-1').show();
            setTimeout(function(){$('.phone-1').hide()},1000);

        }else {

            f.addClass("disabled").text(langData['renovation'][14][58]);//预约中...
            var data = [];
            data.push("siteType="+siteType);
            data.push("siteArea="+siteArea);
            data.push("people="+name);
            data.push("areaCode="+areaCodev);
            data.push("contact="+tel);
            data.push("conid="+siteId);

            $.ajax({
                url: "/include/ajax.php?service=renovation&action=sendConstruction",
                data: data.join("&"),
                type: "POST",
                dataType: "json",
                success: function (data) {
                    f.removeClass("disabled").text(txt);//
                    if(data && data.state == 100){
                        $('.order_mask').hide();
                        $('.order_mask2').show();
                        
                    }else{
                        alert(data.info);
                    }
                },
                error: function(){
                    alert(langData['renovation'][14][90]);//预约失败，请重试！
                    f.removeClass("disabled").text(txt);//
                }
            });
        }
    })
    // 立即预约关闭
     $('.order_mask .work_close').click(function(){
        $('.order_mask').hide();
   
     })
     $('.order_mask2 .t3').click(function(){
        $('.order_mask2').hide();
   
     })

  

})