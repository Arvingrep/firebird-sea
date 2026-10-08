
$(function () {


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
          $('#'+file.id).html('<img src="'+response.turl+'" data-url="'+response.url+'"  data-val="'+response.url+'"/>');

        }
      },
      uploadProgress:function(file,percentage){
        var $li = $('#'+file.id),
			$percent = $li.find('.progress span');
			// 避免重复创建
			if (!$percent.length) {

				$percent = $('<p class="progress"><span></span></p>')
					.appendTo($li)
					.find('span');

			}
			$percent.css('width', percentage * 100 + '%');
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
     	var t = $(this),li = t.closest('li');
      	upqjShow.del(li.find(".img img").attr("data-val"));
        t.remove();
      	li.find(".img").remove();
       $('#logo').val('');
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
      $('#logo').val(qj_file.join(','));


    }



    //家装服务类型(单选)
    $('.house_type').delegate('li', 'click', function () {
      $(this).toggleClass('active')
    })
    //工装服务类型
    $('.pub_type').delegate('li', 'click', function () {
      $(this).toggleClass('active')
    })
    //擅长风格
    $('.exper_style').delegate('li', 'click', function () {
      $(this).toggleClass('active');
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


    // 信息提示框
    // 错误提示
    function showMsg(str){
      var o = $(".error");
      o.html('<p>'+str+'</p>').show();
      setTimeout(function(){o.hide()},1000);
    }

    //表单验证


    $('#btn-keep').click(function () {
        var f =$(this),txt=f.text();
        if(f.hasClass("disabled")) return false;
       var addrid = $('#addrid');//选择所在地
       var com_name = $('#com_name');//公司名称
       var com_add = $('#com_add');//详细地址
       var phone = $('#phone');//联系方式
       var qq = $('#qq');//qq
       var wechat = $('#wechat');//wechat
       var com_site = $('#com_site');//公司网址
       var com_profile=$('#com_profile')//公司简介
       var house_type=$('.house_type li')//家装服务类型
       var pub_type=$('.pub_type li')//工装服务类型
       var exper_style=$('.exper_style li')//专长风格
        if(!addrid.val()){
             showMsg(langData['renovation'][1][46]);  //请选择所在地

        }else if(!com_name.val()){
            com_name.focus()
            showMsg(langData['renovation'][1][31]);  //请输入公司名称

        }else if(!com_add.val()){
            com_add.focus()
            showMsg(langData['renovation'][1][42]);  //请输入详细地址

        }else if(!phone.val()){
            phone.focus()
             showMsg(langData['renovation'][1][29]);  //请输入联系方式

        }else if(!qq.val()){
            qq.focus()
             showMsg(langData['renovation'][9][3]);  //请输入qq

        }else if(!wechat.val()){
            wechat.focus()
             showMsg(langData['renovation'][9][4]);  //请输入微信

        }else if(!(com_site.val())){
            com_site.focus()
             showMsg(langData['renovation'][9][5]);  //请输入您的公司网址

        }else if($('.qjimg_box .img').length == 0){
             showMsg(langData['renovation'][9][13]);  //请上传店铺LOGO

        }else if(!(com_profile.html())){
            com_profile.focus()
             showMsg(langData['renovation'][9][8]);  //请输入公司简介
        }else if($('.store-imgs').length == 0){
             showMsg(langData['renovation'][7][15]);  //请上传照片

        }else if(!(house_type.hasClass('active'))){
             showMsg(langData['renovation'][9][14]);  //请选择家装服务类型

        }else if(!(pub_type.hasClass('active'))){
             showMsg(langData['renovation'][9][15]);  //请选择工装服务类型

        }else if(!(exper_style.hasClass('active'))){
             showMsg(langData['renovation'][9][16]);  //请选择专长风格

        }else{


          f.addClass("disabled").text(langData['siteConfig'][7][9]+'...');//保存中...
            var data,form = $("#fabuForm"), action = form.attr("action");
            var imgList = [];
            $("#fileList li.thumbnail").each(function(){
                var x = $(this),url = x.find('img').attr("data-val");
                imgList.push(url);
            })
            $("#certs").val(imgList.join('||'));

            var style =[],jiastyle=[],comstyle=[];

            $('.house_type li.active').each(function(){//家装
              var sId = $(this).attr('data-id');
              jiastyle.push(sId);
            })
            $('.pub_type li.active').each(function(){//公装
              var sId = $(this).attr('data-id');
              comstyle.push(sId);
            })
            $('.exper_style li.active').each(function(){//专长风格
              var sId = $(this).attr('data-id');
              style.push(sId);
            })
            var ad = $('.position_box p.adname').text();
            $('#addrname').val(ad);
            data = form.serialize()+"&jiastyle="+jiastyle.join(',')+"&comstyle="+comstyle.join(',')+"&style="+style.join(',')+"&body="+encodeURIComponent(com_profile.html());
            $.ajax({
                url: action,
                data: data,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    f.removeClass("disabled").text(txt);
                    if(data && data.state == 100){
                        $('.order_mask').show();

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

    });
    // 立即预约关闭
     $('.order_mask .t3').click(function(){
        $('.order_mask').hide();

     })

});
