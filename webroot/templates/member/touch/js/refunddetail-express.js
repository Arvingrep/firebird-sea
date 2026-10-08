//2021-11-29 填写物流信息
$(function () {
    //选择快递
    if($('.fakeData').size() > 0){
        var companyList = [];
        $('.fakeData span').each(function(){
          var tid = $(this).attr('data-id');
          var tval= $(this).text();
            companyList.push({
              id: tid,
              value: tval,//时
            })
        })
          
        var showFlag =false;
        //选择快递公司
        var clockSelect = new MobileSelect({
            trigger: '.tk_typeW',
            title: '选择快递公司',//选择快递公司
            ensureBtnText: '确定',//不选择
            wheels: [
              {data : companyList}
            ],
            transitionEnd:function(indexArr, data){
                var fir = indexArr[0];
                var firWheel =$('.mobileSelect-show .wheels .selectContainer');
                firWheel.find('li').removeClass('onchose');
                firWheel.find('li').eq(fir).addClass('onchose');
            },
            callback:function(indexArr, data){
              $('#expcompanytxt').val(data[0].value);
              $('#exp-company').val(data[0].id);
              $('.tk_typeW .choose span').hide();
            }
            ,triggerDisplayData:false
        });
        $('.wheels .wheel:first-child').find('li:first-child').addClass('onchose');
    }
    //提交
    $(".cancel_submit a").bind("click", function(event){
        event.preventDefault();


        var t           = $(this),
            expcompany = $("#exp-company").val(),
            expnumber= $("#exp-number").val();
           
        if(!expcompany){
            showMsg('请选择快递');
            return;
        }

        if(!expnumber){
            showMsg('请填写物流单号');
            return;
        }

        var form = $("#fabuForm"), action = form.attr("action");
        data = form.serialize();
        t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

        $.ajax({
            url: action,
            data: data,
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    location.href = refunddetailUrl;
                }else{
                    showMsg(data.info);
                    t.removeClass("disabled").html(langData['siteConfig'][11][19]);
                }
            },
            error: function(){
                t.removeClass("disabled").html(langData['siteConfig'][11][19]);
            }
        });
    });


});
 // 错误提示
function showMsg(str){
    var o = $(".error");
    o.html('<p>'+str+'</p>').css('display','block');
    setTimeout(function(){o.css('display','none')},1000);
}
