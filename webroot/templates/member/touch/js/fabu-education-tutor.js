$(function () {
    //最高学历
    function getType(){
      $.ajax({
          type: "POST",
          url: masterDomain + "/include/ajax.php?service=education&action=educationitem&type=1&value=1",
          dataType: "jsonp",
          success: function(res){
              if(res.state==100 && res.info){
                  var eduSelect = new MobileSelect({
                      trigger: '.edu',
                      title: '',
                      wheels: [
                          {data:res.info}
                      ],
                      position:[0, 0],
                      callback:function(indexArr, data){
                          $('#education').val(data[0]['value']);
                          $('#educations').val(data[0]['id']);
                          $('.edu .choose span').hide();
                      }
                      ,triggerDisplayData:false,
                  });
              }
          }
      });

      $.ajax({
        type: "POST",
        url: masterDomain + "/include/ajax.php?service=education&action=educationitem&type=2&value=1",
        dataType: "jsonp",
        success: function(res){
            if(res.state==100 && res.info){
                var ageSelect = new MobileSelect({
                    trigger: '.age',
                    title: '',
                    wheels: [
                        {data:res.info}
                    ],
                    position:[0, 0],
                    callback:function(indexArr, data){
                        $('#age').val(data[0]['value']);
                        $('#teachingage').val(data[0]['id']);
                        $('.age .choose span').hide();
                    }
                    ,triggerDisplayData:false,
                });
            }
        }
      });

      $.ajax({
        type: "POST",
        url: masterDomain + "/include/ajax.php?service=education&action=educationtype&value=1",
        dataType: "jsonp",
        success: function(res){
            if(res.state==100 && res.info){
                var ageSelect = new MobileSelect({
                    trigger: '.cat',
                    title: '',
                    wheels: [
                        {data:res.info}
                    ],
                    position:[0, 0],
                    callback:function(indexArr, data){
                        $('#catname').val(data[0]['value']);
                        $('#catid').val(data[0]['id']);
                        $('.cat .choose span').hide();
                    }
                    ,triggerDisplayData:false,
                });
            }
        }
      });

    }

    getType();

    //性别
    $('.user_sex .active').bind('click',function(){
      $(this).addClass('chose_btn').siblings('.active').removeClass('chose_btn');
      $('#usersex').val($(this).find('a').data('id'));
    });


  var showErrTimer;
  function showErr(txt){
      showErrTimer && clearTimeout(showErrTimer);
      $(".popErr").remove();
      $("body").append('<div class="popErr"><p>'+txt+'</p></div>');
      $(".popErr p").css({"margin-left": -$(".popErr p").width()/2, "left": "50%"});
      $(".popErr").css({"visibility": "visible"});
      showErrTimer = setTimeout(function(){
          $(".popErr").fadeOut(300, function(){
              $(this).remove();
          });
      }, 1500);
  }

// 上传身份证
  var upqjShow = new Upload({
    btn: '#up_qj',
    bindBtn: '#qjshow_box .addbtn_more',
    title: 'Images',
    mod: 'education',
    params: 'type=atlas',
    atlasMax: 2,
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
        showErr((this.totalCount - this.sucCount) + (langData['siteConfig'][44][19].replace('1','')));//1张图片上传失败
      }
      updateQj();

    },
    uploadError: function(){

    },
    showErr: function(info){
      showErr(info);
    }
  });
  $('#qjshow_box').delegate('.del_btn', 'click', function(){
    var t = $(this), val = t.siblings('img').attr('data-url');
    upqjShow.del(val);
    t.siblings('.img').remove();
    t.remove();
    updateQj('del');
  });
  function updateQj(){
    var qj_type = $('#qj_type').val();
    var qj_file = [];
    if(qj_type == 0){
      $("#qjshow_box li").each(function(i){
        var img = $(this).find('img');
        if(img.length){
          var src = img.attr('data-url');
          qj_file.push(src);
        }
      })
      $('#qj_pics').val(qj_file.join(','));
      $('#qj_url').val('');
    }else{
      $('#qj_pics').val('');
    }
  }


  // 上传学历认证
  var upqjShow2 = new Upload({
    btn: '#up_other',
    bindBtn: '#other_box .addbtn_more',
    title: 'Images',
    mod: 'education',
    params: 'type=atlas',
    atlasMax: 2,
    deltype: 'delAtlas',
    replace: false,
    fileQueued: function(file, activeBtn){
      var btn = activeBtn ? activeBtn : $("#up_other");
      var p = btn.parent(), index = p.index();
      $("#other_box li").each(function(i){
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
        showErr((this.totalCount - this.sucCount) + (langData['siteConfig'][44][19].replace('1','')));//1张图片上传失败
      }
      updateQj();
    },
    uploadError: function(){

    },
    showErr: function(info){
      showErr(info);
    }
  });
  $('#other_box').delegate('.del_btn', 'click', function(){
    var t = $(this), val = t.siblings('img').attr('data-url');
    upqjShow2.del(val);
    t.siblings('.img').remove();
    t.remove();
    updateQj('del');
  });

  function updateQj(){
    var qj_type = $('#qj_type').val();
    var qj_file = [];
    if(qj_type == 0){
      $("#other_box li").each(function(i){
        var img = $(this).find('img');
        if(img.length){
          var src = img.attr('data-url');
          qj_file.push(src);
        }
      })
      $('#qj_pics').val(qj_file.join(','));
      $('#qj_url').val('');
    }else{
      $('#qj_pics').val('');
    }
  }

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

        var t = $("#fabuForm"), action = t.attr('action');
        var addrid = 0, cityid = 0, r = true;

        var comname = $('#comname').val();//姓名
        var addrid = $('#addrid').val();//所在地区
        var education = $('#education').val();//学历
        var school_name = $('#school_name').val();//院校
        var age = $('#age').val();//教龄
        var subject = $('#subject').val();//教学科目

        if(!comname){
          r = false;
          showMsg(langData['education'][6][32]); //请输入姓名
          return;
        }else if($('.store-imgs .imgshow_box').length == 0){
          r = false;
          showMsg(langData['education'][6][34]);  //请上传人员照片
          return;
        }else if(!school_name){
          r = false;
          showMsg(langData['education'][6][35]);  //请填写毕业院校
          return;
        }else if(!education){
          r = false;
          showMsg(langData['education'][6][36]);  //请选择学历
          return;
        }else if(!age){
          r = false;
          showMsg(langData['education'][6][37]);  //请选择教龄
          return;
        }else if(!subject){
          r = false;
          showMsg(langData['education'][6][19]);  //请填写教学科目
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

        var photo = [];
        $("#fileList").find('.thumbnail').each(function(){
            var src = $(this).find('img').attr('data-val');
            photo.push(src);
        });
        $("#photo").val(photo.join(','));

        var idcardFront = $("#qjshow_box li").eq(0).find('img').attr('data-url');
        if(idcardFront != undefined && idcardFront != null && idcardFront != ''){
          $("#idcardFront").val(idcardFront);
        }else{
          $("#idcardFront").val('');
        }

        var idcardBack = $("#qjshow_box li").eq(1).find('img').attr('data-url');
        if(idcardBack != undefined && idcardBack != null && idcardBack != ''){
          $("#idcardBack").val(idcardBack);
        }else{
          $("#idcardBack").val('');
        }

        var degree = $("#other_box li").eq(0).find('img').attr('data-url');
        if(degree != undefined && degree != null && degree != ''){
          $("#degree").val(degree);
        }else{
          $("#degree").val('');
        }

        var diploma = $("#other_box li").eq(1).find('img').attr('data-url');
        if(diploma != undefined && diploma != null && diploma != ''){
          $("#diploma").val(diploma);
        }else{
          $("#diploma").val('');
        }

        if(!r){
          return;
        }

        $("#btn-keep").addClass("disabled").html(langData['siteConfig'][6][35]+"...");	//提交中

        $.ajax({
            url: action,
            data: t.serialize(),
            type: 'post',
            dataType: 'json',
            success: function(data){
                if(data && data.state == 100){
                    var tip = langData['siteConfig'][20][341];
                    if(id != undefined && id != "" && id != 0){
                        tip = langData['siteConfig'][20][229];
                    }
                    $("#btn-keep").removeClass("disabled").html(langData['education'][5][33]);		//立即发布
                    showMsg(tip);
                }else{
                  showMsg(data.info);
                  $("#btn-keep").removeClass("disabled").html(langData['education'][5][33]);		//立即发布
                }
            },
            error: function(){
              showMsg(langData['education'][5][33]);
            }
        })
        



    });


});