$(function(){
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
        $(".areacode_span em").text(txt);
        $("#areaCode").val(txt.replace("+",""));

        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function(){
        $('.layer_code, #popupReg-captcha-mobile').hide();
        $('.mask-code').removeClass('show');
    })

    //提交
    $('#right_btn').click(function(){
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            window.location.href = masterDomain+'/login.html';
            return false;
        }

        var t = $(this);
        var people  = $('#people').val();
        var contact = $('#contact').val();

        var tel_d = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/;
        var id_d = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
        if(people==''){
            alert(langData['travel'][8][63]);  //请输入联系人
            return 0;
        }else if(contact==''){
            alert(langData['travel'][7][60]);//请输入手机号
            return 0;
        }
        // else if(!contact.match(tel_d)){
        //     alert(langData['travel'][7][61]);   //请输入正确的手机号
        //     return 0;
        // }

        var data = [];
        data.push('proid=' + pageData.id);
        data.push('procount=1');
        data.push('people=' + $("#people").val());
        data.push('contact=' + $("#contact").val());
        data.push('areaCode=' + $("#areaCode").val());
        data.push('usePinput=' + ($('.integral .gou').hasClass('hasgou')?'1':'0'));

        $.ajax({
            url: masterDomain + '/include/ajax.php?service=education&action=deal',
            data: data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){

                    if (typeof (data.info) == 'object') {
                        sinfo = data.info;
                        service = 'education';
                        $('#ordernum').val(sinfo.ordernum);
                        $('#action').val('pay');

                        $('#pfinal').val('1');
                        $("#amout").text(sinfo.order_amount);
                        $('.payMask').show();
                        $('.payPop').css('transform', 'translateY(0)');

                        if (totalBalance * 1 < sinfo.order_amount * 1) {

                            $("#moneyinfo").text('余额不足，');
                            $("#moneyinfo").closest('.check-item').addClass('disabled_pay')
                            $('#balance').hide();
                        }
                        if(monBonus * 1 < sinfo.order_amount * 1  &&  bonus * 1 >= sinfo.order_amount * 1){
                          $("#bonusinfo").text('额度不足，');
                          $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
                        }else if( bonus * 1 < sinfo.order_amount * 1){
                          $("#bonusinfo").text('余额不足，');
                          $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
                        }else{
                          $("#bonusinfo").text('');
                          $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
                        }
                        ordernum = sinfo.ordernum;
                        order_amount = sinfo.order_amount;

                        payCutDown('', sinfo.timeout, sinfo);
                    }else{
                        if(device.indexOf('huoniao_Android') > -1) {
                            setupWebViewJavascriptBridge(function (bridge) {
                                bridge.callHandler('pageClose', {}, function (responseData) {
                                });
                            });
                            location.href = data.info;
                        }else{
                            location.href = data.info + (data.info.indexOf('?') > -1 ? '&' : '?') + 'currentPageOpen=1';
                        }
                    }
                }else{
                    alert(data.info);
                }
            },
            error: function(){
                alert(langData['siteConfig'][20][183]);
                t.removeClass("disabled").html(langData['shop'][1][8]);
            }
        });

    });
});

checkPrice();

// 计算价格
function checkPrice(){
  var priceAll = $(".footer").attr('data-price');
  jifen_di = parseInt(jifen_ * priceAll * pointRatio / 100 );
    console.log(jifen_,priceAll)
    jifen_di = hasPoint <= jifen_di ? hasPoint : jifen_di;
    jian = parseFloat((jifen_di / pointRatio ).toFixed(2));
    console.log(hasPoint,jian)
    // if(jian <= 0){
  //     $(".integral").hide() ;
  // }
  $(".integral .jifen").html(jifen_di) ;
  $(".integral .jian").html(jian) ;
  if($(".integral .gou").hasClass('hasgou')){
    $('.price_all').html(priceAll-jian);
  }else{
    $('.price_all').html(priceAll);
  }
}
// 取消积分勾选
$(".integral .gou").click(function(){
	var t = $(this);
	t.toggleClass('hasgou');
  checkPrice()
})
