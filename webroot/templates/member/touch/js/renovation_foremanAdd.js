
$(function () {

    //年
    $('#works').blur(function(){
        if($(this).val().length > 0 ){       
           $(this).siblings('label').css("color","#45464f");
        }
      });

    //岁
    $('#age').blur(function(){
        if($(this).val().length > 0 ){       
           $(this).siblings('label').css("color","#45464f");
        }
      });

    // 点击上传照片(一张)
    var upqjShow = new Upload({
      btn: '#up_qj',
      title: 'Images',
      mod: 'renovation',
      params: 'type=atlas',
      atlasMax: 1,
      deltype: 'delAtlas',
      replace: false,
      fileQueued: function(file, activeBtn){
        var btn = activeBtn ? activeBtn : $("#up_qj");
        var p = btn.parent(), index = p.index();
        $("#qjshow_box li").each(function(i){
          if(i >= index){
            var li = $(this), t = li.children('.img_show'), img = li.children('.img');
            if(img.length == 0){
              t.after('<div class="img" id="'+file.id+'"></div><i class="del_btn">+</i>');
              return false;
            }

          }
        })
      },
      uploadSuccess: function(file, response, btn){
        if(response.state == "SUCCESS"){
          $('#'+file.id).html('<img src="'+response.turl+'" data-url="'+response.url+'" />');

        }
      },
      uploadFinished: function(){
        if(this.sucCount == this.totalCount){
          // showErr('所有图片上传成功');
        }else{
          showMsg((this.totalCount - this.sucCount) + '张图片上传失败');
        }
        
        updateQj();
      },
      uploadError: function(){

      },
      showErr: function(info){
        showMsg(info);
      }
    });
    $('#qjshow_box').delegate('.del_btn', 'click', function(){
      var t = $(this), val = t.siblings('img').attr('data-url');
      t.siblings('.img').remove();
      t.remove();
      updateQj('del');
    })
    function updateQj(){

      var qj_file = [];      
      $("#qjshow_box li").each(function(i){
        var img = $(this).find('img');
        if(img.length){
          var src = img.attr('data-url');
          qj_file.push(src);
        }
      })
      $('#photo').val(qj_file.join(','));
        
    }
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
    $(".areacode-li").click(function(){
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
   //工长类型
    var huxinSelect = new MobileSelect({
        trigger: '.forman_type ',
        title: '',
        wheels: [
            {data: [
                    {id:'1',value:langData['renovation'][0][34]},//工长
                    {id:'2',value:langData['renovation'][3][30]},//水电工
                    {id:'3',value:langData['renovation'][3][31]},//泥瓦工
                    {id:'4',value:langData['renovation'][3][32]},//油漆工
                    {id:'5',value:langData['renovation'][6][10]}//木工
                ]
            }            
        ],
        position:[0, 0],
        callback:function(indexArr, data){
            $('#forman_type').val(data[0].value);
            $('.forman_type .choose span').hide();
            $('#typeId').val(data[0].id)
        }
        ,triggerDisplayData:false,
    });

    // 信息提示框
    // 错误提示
    function showMsg(str){
      var o = $(".error");
      o.html('<p>'+str+'</p>').show();
      setTimeout(function(){o.hide()},1000);
    }


    $('#btn-keep').click(function () {
      var f = $(this),txt= f.text();
      if(f.hasClass("disabled")) return false;
       var art_name = $('#art_name');//姓名
       var phone = $('#phone');//联系方式
       var tec_num=$('#tec_num').val();//选择所属公司

        if($('.qjimg_box .img').length == 0){
             showMsg(langData['renovation'][7][15]);  //请上传照片
            
        }else if(!art_name.val()){
             showMsg(langData['renovation'][8][3]);  //请输入姓名
            
        }else if(!phone.val()){
            phone.focus()
             showMsg(langData['renovation'][10][11]);  //请输入联系方式
            
        }else{
          f.addClass("disabled").text(langData['renovation'][14][58]);//保存中...
          var form = $("#fabuForm"), action = form.attr("action"),data = form.serialize();
          $.ajax({
                url: action,
                data: data,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    f.removeClass("disabled").text(txt);
                    if(data && data.state == 100){
                        showMsg(langData['siteConfig'][6][39]);//保存成功
                        
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

});