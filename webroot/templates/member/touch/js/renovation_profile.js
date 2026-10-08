$(function () {
//年
  $('#work_year').blur(function(){

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

    
  //工长类型
    if(typeId == 1){
      getgztype();
      //性别
      var numArr =[langData['siteConfig'][13][4],langData['siteConfig'][13][5]];//自定义数据
      var sexSelect = new MobileSelect({
          trigger: '.sex ',
          title: '',
          wheels: [
              {data: [
                      {id:'1',value:langData['siteConfig'][13][4]},//男
                      {id:'0',value:langData['siteConfig'][13][5]}//女
                  ]
                } 
              
          ],
          position:[0, 0],
          callback:function(indexArr, data){
              $('#sexName').val(data[0].value);
              $('#sexId').val(data[0].id);
              $('.sex .choose span').hide();
          }
          ,triggerDisplayData:false,
      });
    }
  	
    function getgztype(){
        $.ajax({
          type: "POST",
          url: "/include/ajax.php?service=renovation&action=type&type=591",
          dataType: "json",
          success: function(res){
                if(res.state==100 && res.info){
                    var list = res.info;                   
                    var huxinSelect = new MobileSelect({
                          trigger: '.foremanType',
                          title: '',
                          wheels: [
                              {data:list}
                          ],
                          keyMap: {
                            id: 'id',
                            value: 'typename'
                          },
                          position:[0, 0],
                          callback:function(indexArr, data){
                            $('#foremanTypeName').val(data[0].typename);
                            $('.foremanType .choose span').hide();
                            $('#foremanType').val(data[0].id)
                          }
                          ,triggerDisplayData:false,
                    });
                }
          }
      });
    }

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
          $('#'+file.id).html('<img src="'+response.turl+'" data-url="'+response.url+'" data-val="'+response.url+'" />');

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
          // showMsg('所有图片上传成功');
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

    //擅长风格
    $('.art_ul').delegate('li', 'click', function () {
      $(this).toggleClass('active')
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
    $('#btn-keep').click(function () {
        var f =$(this);
        var txt = f.text();
        if(f.hasClass('disabled')) return false;
       var major = $('#studied');//所学专业
       var phone = $('#phone');//联系方式
       var work_year = $('#works');//工作经验
       var design_works = $('#design_works');//设计作品
       var idea = $('#design_concept');//设计理念
       var art_style=$('.art_ul li');
       var company = $('#tec_num').val();
       var sex = $('#sexId').val();//工长性别
       var age = $('#age');//工长年龄
       var foremanstyle = $('#foremanType');//工长类型
       var profile = $('#profile').val();//工长简介
       var addrid = $('#addrid').val();//现居地址
        var address = $('.gz-addr-seladdr p').text();
        if((!major.val()) && typeId == 2){
            major.focus()
            showMsg(langData['renovation'][7][20]);  //请输入所学专业
            
        }else if(!sex && typeId == 1){//工长性别
             showMsg(langData['renovation'][8][26]);  //请选择性别
            
        }else if(!foremanstyle && typeId == 1){//工长类型
             showMsg(langData['renovation'][15][40]);  //请选择工长类型
            
        }else if(!phone.val()){
            phone.focus()
             showMsg(langData['renovation'][1][29]);  //请输入联系方式
            
        }else if(!work_year.val()){
            work_year.focus()
             showMsg(langData['renovation'][7][29]);  //请输入工作年数
            
        }else if(age.val() <= 0 && typeId == 1){//工长年龄
            age.focus()
            showMsg(langData['renovation'][8][28]);  //请输入年龄
            
        }else if(!addrid){//现居地址
             showMsg(langData['renovation'][8][29]);  //请选择现居地址
            
        }else if(!design_works.val() && typeId == 2){
            design_works.focus()
             showMsg(langData['renovation'][7][24]);  //请输入您的设计作品
            
        }else if((!idea.val()) && typeId == 2){
            idea.focus()
             showMsg(langData['renovation'][7][25]);  //请输入您的设计理念
        }else if((!art_style.hasClass('active'))  && typeId == 2){
            
             showMsg(langData['renovation'][7][30]);  //请选择您的擅长风格 

        }else if(!profile  && typeId == 1){//工长 简介
            
             showMsg(langData['renovation'][8][25]);  //请输入您的个人简介           
        }else{

            f.addClass("disabled").text(langData['siteConfig'][7][9]+'...');//保存中...
            var data,form = $("#fabuForm"), action = form.attr("action");
            var style =[];
            
            $('.art_ul li.active').each(function(){
                var sId = $(this).attr('data-id');
                style.push(sId);
            })
            data = form.serialize()+"&style="+style.join(',');
            if(addrid!= ''){

                data += "&address= "+address;
            }
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