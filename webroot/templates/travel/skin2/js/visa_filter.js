$(function () {
   $("img").scrollLoading();
  $('.filter dl:last-child').css('border-bottom', 'none')
  $('.ticket-list li:nth-child(4n)').css('margin-right', '0')

  //排序切换
  $('.sort ul li').click(function () {
    if(!$(this).hasClass('curr')){
        $(this).addClass('curr').siblings().removeClass('curr');
    }else{
        if($(this).hasClass('up')){
            $(this).removeClass('up').addClass('down')
        }else{
            $(this).removeClass('down').addClass('up')
        }
    }
  })

  //更多 收起展开
  $('.item_box').each(function () {
    var lens = $(this).find('a').length;
    if (lens <= 15) {
      $(this).siblings(".f_more").hide();
    } else {
      $(this).siblings(".f_more").show();
    }
  })

  //折叠筛选
  $(".f_more").bind("click", function () {
    var t = $(this);
    t.hasClass("curr") ? t.removeClass("curr") : t.addClass("curr");
    if (t.hasClass("curr")) {
      t.next('.item_box').addClass('on');

      t.html("收起 <i></i>");
    } else {
      t.next('.item_box').removeClass('on');

      t.html("更多 <i></i>");
    }

  });


  //筛选
  $('.filter a').click(function () {
    $(this).addClass('curr').siblings().removeClass('curr')
    var chooseType = $(this).parents('.chooseClass').attr('data-chose');
    var _that = $(this),
      t = _that.text(),
      stateDiv = $('.fi-state dd a');
    if (t != '不限') {
      if (chooseType == 'hot') {
        var flag = 0;
        $('.subnav').find('a').removeClass('curr');
        stateDiv.each(function () { //遍历条件里的a
          var thisType = $(this).attr('data-chose');
          if (thisType == 'destination_sub' || thisType == 'destination') {
            flag = 0;
            $(this).remove();
          } else if (thisType == 'hot') {
            flag = 1;
            $(this).find('span').text(t);
          }
        })
        if (flag == 0) {
          // $('.deletebox .fi-state dd').append('<a href="javascript:;" data-chose="' + chooseType + '"><span>' + t + '</span><i class="idel"></i></a>');
        }
      } else if (chooseType == 'visa') {
        var flag = 0,
          _t;
        stateDiv.each(function () { //遍历条件里的a
          var thisType = $(this).attr('data-chose');
          if (thisType == 'visa') {
            flag = 1;
            _t = $(this);
          }
        })
        if (flag == 0) {
          // $('.deletebox .fi-state dd').append('<a href="javascript:;" data-chose="' + chooseType + '"><span>' + t + '</span><i class="idel"></i></a>');
        } else {
          $(_t).find('span').text(t);
        }
      } else {
        $('#hotPlace a').removeClass('curr');
        if (chooseType == 'destination_sub') {
          var pt = $('#continent>a.curr').text();
          var flag = 0,
            _t;
          stateDiv.each(function () { //遍历条件里的a
            var thisType = $(this).attr('data-chose');
            if (thisType == 'destination_sub') {
              flag = 1;
              _t = $(this);
            }
            if (thisType == 'destination') {
              flag = 2;
              _t = $(this);
            }
            if (thisType == 'hot') {
              flag = 3;
              $(this).remove();
              _t = $(this);
            }
          })
          if (flag == 0 || flag == 3) {
            // $('.deletebox .fi-state dd').append('<a href="javascript:;" data-chose="destination"><span>' + pt + '</span><i class="idel"></i></a>');
            // $('.deletebox .fi-state dd').append('<a href="javascript:;" data-chose="' + chooseType + '"><span>' + t + '</span><i class="idel"></i></a>');
          } else if (flag == 1) {
            $(_t).find('span').text(t);
          } else if (flag == 2) {
            $(_t).after('<a href="javascript:;" data-chose="' + chooseType + '"><span>' + t + '</span><i class="idel"></i></a>');
          }
        } else {
          var flag = 0,
            _t;
          stateDiv.each(function () { //遍历条件里的a
            var thisType = $(this).attr('data-chose');
            if (thisType == 'destination') {
              flag = 1;
              _t = $(this);
            }
            if (thisType == 'destination_sub') {
              flag = 1;
              $(this).remove();
            }
            if (thisType == 'hot') {
              flag = 2;
              $(this).remove();
            }
          })
          if (flag == 0 || flag == 2) {
          } else if (flag == 1) {
            $(_t).find('span').text(t);
          }
        }
      }
    }

    $('.fi-state').show();

  })


  //二级目的地
  $("#destination dd>a").bind("click", function () {
    var t = $(this),
      id = t.attr("data-id"),
      type = t.closest("dl").attr("id");
    if (type == "subnav") typeid = id;
    if (type == "destination") addrid = id;
    if (id == 0 || $("#" + type + id).size() == 0) {
      $("#" + type).find(".subnav").hide();
    } else {
      $("#" + type).find(".subnav").show()
      $("#" + type).find(".subnav div").hide();
      $("#" + type + id).show();
      $("#" + type + id).find("a").removeClass("curr");
    }
  });
  // 单个删除
  $(".fi-state").delegate(".idel", "click", function () {
    var par = $(this).parent();
    par.remove();
    if ($('.fi-state dd a').length == 0) {
      clearAll();
    }

  });

  // 清空条件
  $(".btn_clear").on("click", function () {
    clearAll();
    return false;
  });
  //清除所有筛选条件
  function clearAll() {
    $(".fi-state").hide().children('dd').html('');
    $(".fi-state").hide();
    $(".subnav").hide();
    $('.filter a').removeClass('curr');
  }




})