 //服务范围 点击叉号 关闭标签       
function close_li(thisli){
    $(thisli).parent().remove();
    var range_num=$('.service-box .service li').length;
    $('.service-box .ser_range .num1').text(range_num);
}

$(function () {

     toggleDragRefresh('off');  //取消下拉刷新
     
    //服务选择
     $('.service-box .ser_range .range_sure').click(function (e) {
          e.preventDefault();

        var range_value=$('.service_input').val();
       if(range_value.length>0){
            $('.service-box .service').append("<li><span>"+ range_value +"</span><img src='"+templatePath+"images/education/close_icon1.png' alt='' class='close_img' onclick='close_li(this)'></li>");
            var range_value=$('.service_input').val('');
            var range_num=$('.service-box .service li').length;
            $('.service-box .ser_range .num1').text(range_num);
       }
        
        if(range_num==10){
            $('.service-box .ser_range .range_sure button').attr({"disabled":"disabled"});
            var range_value=$('.service_input').val(langData['education'][5][50]);//最多只能添加10个
        }

        
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
    // 错误提示
    function showMsg(str){
      var o = $(".error");
      o.html('<p>'+str+'</p>').show();
      setTimeout(function(){o.hide()},1000);
    }

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
          var addrid = 0, cityid = 0, r = true;
     
        var comname = $('#comname').val();//公司名称
        var addrid = $('#addrid').val();//选择区域
        var address = $('#address').val();//详细地址
        var phone = $('#phone').val();//联系电话
        var num1=$(".num1").text();//学习方向

        if(!comname){
          r = false;
          showMsg(langData['education'][5][40]); //请输入公司名称
          return;
        }else if(!address){
          r = false;
          showMsg(langData['education'][5][43]);    //请填入详细地址
          return;
        }else if(!phone){
          r = false;
          showMsg(langData['education'][5][45]);    //请输入联系方式
          return;
        }
        // else if (isPhoneNo($.trim($('#phone').val())) == false) {
        //   r = false;
        //   showMsg(langData['education'][5][51]);    //手机号码不正确
        //   return;
        // }
        else if($('#fileList li.thumbnail').length == 0){
          r = false;
          showMsg(langData['education'][5][52]);    //请上传店铺图集
          return;
        }else if(num1==0){
          r = false;
          showMsg(langData['education'][5][53]);    //请输入学习方向
          return;
        }

        var ids = $('.gz-addr-seladdr').attr("data-ids");
          if(ids != undefined && ids != ''){
               addrid = $('.gz-addr-seladdr').attr("data-id");
               ids = ids.split(' ');
               cityid = ids[0];
          }else{
               r = false;
               showMsg(langData['homemaking'][5][19]);  //请选择所在地
               return;
          }
          $('#addrid').val(addrid);
          $('#cityid').val(cityid);

          var pics = [];
          $("#fileList").find('.thumbnail').each(function(){
               var src = $(this).find('img').attr('data-val');
               pics.push(src);
          });
          $("#pics").val(pics.join(','));

          //获取酒店特色
          var tag = [];
          $('.service-box ul.service').find('li').each(function(){
               var t = $(this),val = t.find('span').text();
               if(val!=''){
                    tag.push(val);
               }
          })
          $("#tag").val(tag.join('|'));

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
                    }else{
                         showMsg(data.info);
                    }
               },
               error: function(){
                    showMsg(langData['siteConfig'][6][203]);
               }
          })



    });


});