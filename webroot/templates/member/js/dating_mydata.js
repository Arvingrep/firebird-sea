$(function(){

  // 判断浏览器是否是ie8
  if($.browser.msie && parseInt($.browser.version) >= 8){
    $('.slider').css('border','1px solid #a0a0a0;');
  }
  // 交友开关
  honeySwitch.themeColor="#007cff";
 
  // 请下载移动端版本
  $('.w-form .down').hover(function(){
    $(this).closest('.voice').find('.voice-app').show();
  },function(){
    $(this).closest('.voice').find('.voice-app').hide();
  })

  //选择兴趣爱好
  $("#selTags").bind("click", function(){
    var input = $(this).siblings("input"), valArr = input.val().split(",");

    $.ajax({
      url: masterDomain+"/include/ajax.php?service=dating&action=skill",
      dataType: "JSONP",
      success: function(data){
        if(data && data.state == 100){
          data = data.info;
          var content = [], selected = [];
          content.push('<div class="selectedTags">'+langData['siteConfig'][6][21]+'：</div>');     //已选
          content.push('<ul class="nav nav-tabs fn-clear">');
          for(var i = 0; i < data.length; i++){
            content.push('<li'+ (i == 0 ? ' class="active"' : "") +'><a href="#tab'+i+'">'+data[i].typename+'</a></li>');
          }
          content.push('</ul><div class="tagsList">');
          for(var i = 0; i < data.length; i++){
            content.push('<div class="tag-list'+(i == 0 ? "" : " fn-hide")+'" id="tab'+i+'">')
            for(var l = 0; l < data[i].lower.length; l++){
              var id = data[i].lower[l].id, name = data[i].lower[l].typename;
              if($.inArray(id, valArr) > -1){
                selected.push('<span data-id="'+id+'">'+name+'<a href="javascript:;">&times;</a></span>');
              }
              content.push('<span'+($.inArray(id, valArr) > -1 ? " class='checked'" : "")+' data-id="'+id+'">'+name+'<a href="javascript:;">+</a></span>');
            }
            content.push('</div>');
          }
          content.push('</div>');

          $.dialog({
            id: "memberInfo",
            fixed: true,
            title: langData['siteConfig'][6][76],    //选择标签
            content: '<div class="selectTags">'+content.join("")+'</div>',
            width: 600,
            okVal: langData['siteConfig'][6][1],     //确定
            ok: function(){

              //确定选择结果
              var html = parent.$(".selectedTags").html().replace(langData['siteConfig'][6][21]+"：", ""), ids = [];
              parent.$(".selectedTags").find("span").each(function(){
                var id = $(this).attr("data-id");
                if(id){
                  ids.push(id);
                }
              });
              input.val(ids.join(","));
              input.siblings(".selectedTag").html(html);

            },
            cancelVal: langData['siteConfig'][6][15],   //关闭
            cancel: true
          });

          var selectedObj = parent.$(".selectedTags");
          //填充已选
          selectedObj.append(selected.join(""));

          //TAB切换
          parent.$('.nav-tabs a').click(function (e) {
            e.preventDefault();
            var obj = $(this).attr("href").replace("#", "");
            if(!$(this).parent().hasClass("active")){
              $(this).parent().siblings("li").removeClass("active");
              $(this).parent().addClass("active");

              $(this).parent().parent().next(".tagsList").find("div").hide();
              parent.$("#"+obj).show();
            }
          });

          //选择标签
          parent.$(".tag-list span").click(function(){
            if(!$(this).hasClass("checked")){
              var length = selectedObj.find("span").length;
              if(length >= graspLength){
                alert(langData['siteConfig'][20][299].replace('1', graspLength));    //交友标签最多可选择1个！
                return false;
              }

              var id = $(this).attr("data-id"), name = $(this).text().replace("+", "");
              $(this).addClass("checked");
              selectedObj.append('<span data-id="'+id+'">'+name+'<a href="javascript:;">&times;</a></span>');
            }
          });

          //取消已选
          selectedObj.delegate("a", "click", function(){
            var pp = $(this).parent(), id = pp.attr("data-id");

            parent.$(".tagsList").find("span").each(function(index, element) {
              if($(this).attr("data-id") == id){
                $(this).removeClass("checked");
              }
            });

            pp.remove();
          });

        }
      }
    })
  });

  //删除已选择的标签/技能（非浮窗）
  $(".selectedTag").delegate("span a", "click", function(){
    var pp = $(this).parent(), id = pp.attr("data-id"), input = pp.parent().siblings("input");
    pp.remove();

    var val = input.val().split(",");
    val.splice($.inArray(id,val),1);
    input.val(val.join(","));
  });


  // 选择语言
  $("#languageCon label").click(function(e){
    var t = $(this), input = t.find("input");
    var con = $("#languageCon");
    setTimeout(function(){
      if(input.is(":checked")){
        var count = con.find("input:checked").length;
        if(count > languageLengh){
          input.prop("checked", false);
        }
      }
    }, 200)
  })

  // 择偶意向 关联选项
  $('#need .sel-menu a').click(function(){
    var t = $(this), id = parseInt(t.data('id')), g = t.closest('.sel-group'), index = g.index(), p = t.closest('dl');
    var o = g.siblings('.sel-group'), oid = parseInt(o.next('input').val());
    p.removeClass('error').find('.tip-inline').remove();
    if(id && oid){
      setTimeout(function(){
        // 左
        if(index == 0){
          if(id > oid){
            p.addClass('error').children('dd').append('<span class="tip-inline" style="display:inline-block;color:#f00;">'+langData['siteConfig'][29][153]+'</span>');   //范围错误
          }
        }else{
          if(id < oid){
            p.addClass('error').children('dd').append('<span class="tip-inline" style="display:inline-block;color:#f00;">'+langData['siteConfig'][29][153]+'</span>');
          }
        }
      }, 200)
    }
  })
  //生日
  $("#birthday").click(function(){
    WdatePicker({
      el: 'birthday',
      doubleCalendar: true,
      isShowClear: false,
      isShowOK: false,
      isShowToday: false,
      maxDate: '{%y-18}-%M-%d',
      onpicking: function(dp){

      }
    });
  });

  $('#dating_switch').click(function(){
    var t = $(this), state = t.hasClass('switch-on') ? 1 : 0;
    $('#dateswitch').val(state);
    if(user.id == 0){
      $.ajax({
        url: masterDomain + '/include/ajax.php?service=dating&action=datingSwitch&state='+state,
        type: 'get',
        dataType: 'jsonp',
        success: function(data){
          if(data && data.state == 100){
            location.reload();
          }else{
            $.dialog.alert(data.info);
          }
        },
        error: function(){
          $.dialog.alert(langData['siteConfig'][6][203]);   //网络错误，请重试！
        }
      })
    }
  })
  //国际手机号获取
  getNationalPhone();
  function getNationalPhone(){
    $.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'JSONP',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   var listLen = list.length;
                   var codeArea = list[0].code;
                   if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        $('.areaCode').hide();
                        $('#fabuForm .date_inter .inp#phone').css({'padding-left':'10px','width':'255px'});
                        return false;
                   }
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li data-cn="'+list[i].name+'" data-code="'+list[i].code+'">'+list[i].name+' +'+list[i].code+'</li>');
                   }
                   $('.areaCode_wrap ul').append(phoneList.join(''));
                }else{
                   $('.areaCode_wrap ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                        $('.areaCode_wrap ul').html('<div class="loading">加载失败！</div>');
                    }

        })
  }
  //显示区号
  $('.areaCode').bind('click', function(){
    var areaWrap =$(this).closest("dd").find('.areaCode_wrap');
    if(areaWrap.is(':visible')){
      areaWrap.fadeOut(300)
    }else{
      areaWrap.fadeIn(300);
      return false;
    }
  });

  //选择区号
  $('.areaCode_wrap').delegate('li', 'click', function(){
    var t = $(this), code = t.attr('data-code');
    var par = t.closest("dd");
    var areaIcode = par.find(".areaCode");
    areaIcode.find('i').html('+' + code);
    $('#areaCode').val(code)
  });

  $('body').bind('click', function(){
    $('.areaCode_wrap').fadeOut(300);
  });


  function err(obj, title){
    $.dialog.alert(title);
    var obj = obj.is(':input') && obj.attr('type') == 'hidden' ? obj.closest('dl') : obj;
    $('html,body').animate({
      'scrollTop':obj.offset().top - 20
    }, 200, function(){
      if(obj.is(':input')){
        obj.focus();
      }
    });
  }
  // 提交
  $('#fabuForm').submit(function(e){
    e.preventDefault();
    var form = $(this),
        url = form.attr('action'),
        t = $('#submit'),
        phone = $('#phone'),
        nickname = $('#nickname'),
        birthday = $('#birthday'),
        height = $('#height'),
        addrid = $('#addrid');

    // 联系方式
    if(phone.val() == ''){
      return err(phone, langData['siteConfig'][29][154]);  //请填写手机号码
    }

    // 择偶意向
    var glerr = $('#need .error');
    if(glerr.length){
      var gl = glerr.eq(0);
      return err(gl, langData['siteConfig'][29][155]+gl.children('dt').text().replace('：',''));  //请选择正确的
    }

    $('.addrBtn').each(function(I){
      var t = $(this), field = t.data('field'), ids = t.attr('data-ids'), id = t.attr('data-id');
      if(id && ids){
        t.parent().siblings('input').val(id);
        if(field == 'addrid'){
          $('#cityid').val(ids.split(' ')[0]);
        }
      }else{
        t.parent().siblings('input').val(0);
      }
    })

    // 基本资料
    if(nickname.val() == ''){
      return err(nickname, langData['siteConfig'][29][156]);  //请填写昵称
    }
    if(birthday.val() == ''){
      return err(birthday, langData['siteConfig'][20][224]);  //请填写出生日期
    }
    if(height.val() == 0 || height.val() == ''){ 
      return err(height, langData['siteConfig'][29][157]);  //请填写身高
    }
    if(addrid.val() == 0 || addrid.val() == ''){
      return err(addrid, langData['siteConfig'][29][158]);  //请选择居住地
    }

    $.ajax({
      url : url,
      type: 'post',
      data: form.serialize(),
      dataType: 'json',
      success: function(data){
        if(data && data.state == 100){
          $.dialog({
            title: langData['siteConfig'][19][216],//信息
            icon: 'success.png',
            content: data.info,
            close: false,
            ok: function(){
              location.reload();
            },
            cancel: function(){
              location.reload();
            }
          });
        }else{
          $.dialog.alert(data.info);
        }
      },
      error: function(){
        $.dialog.alert(langData['siteConfig'][6][203]);//网络错误，请重试！
      }
    })
  })

});
