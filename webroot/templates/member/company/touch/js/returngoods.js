// 同意退货--确认收货地址 2021-10-25
$(function () {
    //国际手机号获取
    getNationalPhone();
    function getNationalPhone(){
        $.ajax({
            url: "/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'jsonp',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   var listLen = list.length;
                   var codeArea = list[0].code;
                   if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        $('.areacode_span').hide();
                        $('.areacode_span').siblings('input').css({'paddingTop':'.2rem','paddingLeft':'.24rem'})
                        return false;
                   }
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li data-cn="'+list[i].name+'" data-code="'+list[i].code+'"><span>'+list[i].name+'<span><em class="fn-right">+'+list[i].code+'</em></span></span></li>');
                   }
                   $('.areacodeList ul').append(phoneList.join(''));
                }else{
                   $('.areacodeList ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                    $('.areacodeList ul').html('<div class="loading">加载失败！</div>');
                }

        })
    }
    // 打开手机号地区弹出层
    $(".areacode_span").click(function(){
        $(".popl_box").animate({"bottom":"0"},300,"swing");
        $('.mask-code').addClass('show');
    })
    // 选中区域
    $('.areacodeList').delegate('li','click',function(){
        var t = $(this), txt = t.attr('data-code');
        t.addClass('achose').siblings('li').removeClass('achose');
        $(".areacode_span label").text('+'+txt);
        $("#areaCode").val(txt);

        $(".popl_box").animate({"bottom":"-100%"},300,"swing");
        $('.mask-code').removeClass('show');
    })


    // 关闭弹出层
    $('.anum_box .back, .mask-code').click(function(){
        $(".popl_box").animate({"bottom":"-100%"},300,"swing");
        $('.mask-code').removeClass('show');
    })
    var txt = $('.cancel_submit a').text();
    $('.cancel_submit a').click(function(){
        var t = $(this);
        if(t.hasClass('disabled')) return false;
        var busname = $('#busname').val(),
            bustel  = $('#bustel').val(),
            addrid  = $('#addrid').val(),
            addr    = $('#addr').html();
        var cityId = $('.chose_area').attr('data-ids').split(' ')[0]  
        $('#cityid').val(cityId);
        if(!busname){
            showMsg('请填写收货人姓名');
            return false;
        }
        if(!bustel){
            showMsg('请填写收货人电话');
            return false;
        }
        if(!addrid){
            showMsg('请选择地区');
            return false;
        }
        if(!addr){
            showMsg('请填写详细地址');
            return false;
        }
        t.addClass('disabled').html('提交中...');
        var form = $('.fabuform'),data = form.serialize(),url = form.attr('data-url');
        data = data+'&address='+addr;
        // setTimeout(function(){location.href = url;},200);
        // return false;
        $.ajax({
            url: '/include/ajax.php?service=shop&action=refundPay&id='+id+'&proid='+proid+'&returngoods=1',
            type: 'post',
            data:data,
            dataType: 'json',
            success: function(data){
                if(data && data.state == 100){
                    t.removeClass("disabled").html(txt);
                    showMsg('提交成功');
                    setTimeout(function(){
                        if(device.indexOf('huoniao') > -1) {
                            setupWebViewJavascriptBridge(function (bridge) {
                              bridge.callHandler("goBack", {}, function (responseData) {
                              });
                            });
                        }else{
                            $('.goBack').click();
                        }
                    }, 2000);
                }else{
                    showMsg(data.info);
                     t.removeClass("disabled").html(txt);
                }
            },
            error: function(){
                showMsg(langData['siteConfig'][6][203]);
                t.removeClass("disabled").html(txt);
            }
        });
    })


    



});
 // 错误提示
function showMsg(str){
    var o = $(".error");
    o.html('<p>'+str+'</p>').css('display','block');
    setTimeout(function(){o.css('display','none');},1000);
}
