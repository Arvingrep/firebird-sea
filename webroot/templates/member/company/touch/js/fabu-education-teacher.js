
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
    params: 'type=thumb',
    atlasMax: 2,
    deltype: 'delthumb',
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
        showErr(langData['siteConfig'][44][19].replace('1',(this.totalCount - this.sucCount)));//1张图片上传失败
      }
      

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

  })


  // 上传学历认证
  var upqjShow2 = new Upload({
    btn: '#up_other',
    bindBtn: '#other_box .addbtn_more',
    title: 'Images',
    mod: 'education',
    params: 'type=thumb',
    atlasMax: 2,
    deltype: 'delthumb',
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
        showErr(langData['siteConfig'][44][19].replace('1',(this.totalCount - this.sucCount)));//1张图片上传失败
      }

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

  })
  // 上传头像
  var upqjShow3 = new Upload({
    btn: '#up_logo',
    bindBtn: '#logoshow_box .addbtn_more',
    title: 'Images',
    mod: 'education',
    params: 'type=thumb',
    atlasMax: 2,
    deltype: 'delthumb',
    replace: false,
    fileQueued: function(file, activeBtn){
      var btn = activeBtn ? activeBtn : $("#up_logo");
      var p = btn.parent(), index = p.index();
      $("#logoshow_box li").each(function(i){
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
        showErr(langData['siteConfig'][44][19].replace('1',(this.totalCount - this.sucCount)));//1张图片上传失败
      }
      

    },
    uploadError: function(){

    },
    showErr: function(info){
      showErr(info);
    }
  });
  $('#logoshow_box').delegate('.del_btn', 'click', function(){
    var t = $(this), val = t.siblings('img').attr('data-url');
    upqjShow3.del(val);
    t.siblings('.img').remove();
    t.remove();

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

        var t = $("#fabuForm"), action = t.attr("action"), url = t.attr("data-url"), r = true;

        var comname = $('#comname').val();//姓名
        var education = $('#education').val();//学历
        var school_name = $('#school_name').val();//院校
        var age = $('#age').val();//教龄
        var main_class = $('#main_class').val();//主要课程

        if(!comname){
            r = false;
            showMsg(langData['education'][6][32]); //请输入姓名
            return;
        }else if($('.img_box .img').length == 0){
            r = false;
            showMsg(langData['education'][6][34]);  //请上传人员照片
            return;
        }else if(!education){
            r = false;
            showMsg(langData['education'][6][36]);  //请选择学历
            return;
        }else if(!school_name){
            r = false;
            showMsg(langData['education'][6][35]);  //请填写毕业院校
            return;
        }else if(!age){
            r = false;
            showMsg(langData['education'][6][37]);  //请选择教龄
            return;
        }else if(!main_class){
            r = false;
            showMsg(langData['education'][6][38]);  //请填写主要课程
            return;
        }


        var photo = $("#logoshow_box li").eq(0).find('img').attr('data-url');
        if(photo != undefined && photo != null && photo != ''){
          $("#photo").val(photo);
        }else{
          $("#photo").val('');
        }

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
                    location.href = url;
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