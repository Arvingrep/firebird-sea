$(function () {
    // 信息提示框
    // 错误提示
    function showMsg(str){
      var o = $(".error");
      o.html('<p>'+str+'</p>').show();
      setTimeout(function(){o.hide()},1000);
    }


    $('#btn-keep').click(function () {
      var f = $(this),txt = f.text();
       var article_tit = $('#article_tit');//标题
       var article_info = $('#article_info');//文章详情
       var art_style=$('.art_ul li')
        if(!article_tit.val()){
              article_tit.focus()
             showMsg(langData['renovation'][7][13]);  //请输入标题
            
        }else if(!article_info.val()){
            article_info.focus()
            showMsg(langData['renovation'][7][14]);  //请输入动态详情
            
        }else if($('.store-imgs .imgshow_box').length == 0){
             showMsg(langData['renovation'][7][15]);  //请上传照片
            
        }else{
            f.addClass("disabled").text(langData['renovation'][14][58]);//保存中...
            //图集
            var pics1 = [];
            $("#fileList").find('.thumbnail').each(function(){
                var src = $(this).find('img').attr('data-val');
                pics1.push(src);
            });
            $("#imgList").val(pics1.join(','));
            
            var form = $("#fabuForm"),data = form.serialize(), action = form.attr('action'), url = form.attr('data-url');
            $.ajax({
                url: action,
                data: data,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    f.removeClass("disabled").text(txt);
                    if(data && data.state == 100){
                        
                        if(data.info != undefined && data.info != "" && data.info != 0){
                          $('.order_mask').show();
                          setTimeout(function(){
                            location.href = url;
                          },1000)

                        }

                        
                    }else{
                        alert(data.info);
                    }
                },
                error: function(){
                    alert(langData['renovation'][15][16]);//保存失败，请重试！
                    f.removeClass("disabled").text(txt);//
                }
            });
        }

    });
    // 立即预约关闭
     $('.order_mask .t3').click(function(){
        $('.order_mask').hide();
   
     })

});