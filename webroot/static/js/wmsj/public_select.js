$(function(){
  // 选择店铺
  // $('.chosen-single').click(function(){
  //   var x = $(this),
  //   close = x.closest('.chosen-container-single');
  //   if (close.hasClass('chosen-with-drop')) {
  //     close.removeClass('chosen-with-drop');
  //   }else{
  //     close.addClass('chosen-with-drop');
  //   };
  // })
  // $('.active-result').click(function(){
  //   var x = $(this);
  //   var z = x.closest('.chosen-container-single').find('.chosen-single span');
  //   var test = x.text();
  //   $('.chosen-container-single').removeClass('chosen-with-drop');
  //   z.text(test);
  // })
  // $('body').delegate("#ui-id-1","click",function(){
  //   var  txt = $('#tags').val();
  //   $('.chosen-single span').text(txt);
  // })
  // 店铺管理页面中批量处理
  $('.btn-group').click(function(){
    if ($('.btn-group').hasClass('open')) {
      $('.btn-group').removeClass('open');
    }else{
      $('.btn-group').addClass('open');
    };
  })
  // 店铺管理页面中复制店铺
  $('.btn-info').click(function(){
    var  x = $(this),
        find = x.closest('.col-xs-12').find('.modal');
    if (x.css("display")=='none') {
      find.hide();
      $('.disk').hide();
    }else{
      find.show();
      $('.disk').show();
    };
  })
  $('#modal-close-trigger,.quxiao').click(function(){
    $('.modal').hide();
    $('.disk').hide();
  })

  // 点击关闭按钮
  $('.close').click(function(){
    var x = $(this);
    x.closest('.alert').hide();
  })
  // 设置tab切换
  $('.tt li').click(function(){
      var  u = $(this);
      var index = u.index();
      $('.tab-content .tt_1').eq(index).addClass('active');
      $('.tab-content .tt_1').eq(index).siblings().removeClass('active');
      u.addClass('active');
      u.siblings('li').removeClass('active');
    })
  $('.yy li').click(function(){
      var  u = $(this);
      var index = u.index();
      $('.tab-content .yy_1').eq(index).addClass('active');
      $('.tab-content .yy_1').eq(index).siblings().removeClass('active');
      u.addClass('active');
      u.siblings('li').removeClass('active');
    })
  // 全选
  $('#yw0_c0_all,#order-grid-open_c0_all').bind("click", function (){
  var x = $(this);
  if (x.is(':checked')) {
    $(".table-striped tbody input").attr("checked", true);
  }else{
    $(".table-striped tbody input").attr("checked", false);
  };
  })

})
$(function() {
    var availableTags = [
      "AppleScript",
      "AppleScript",
      "Asp",
      "BASIC",
      "C",
      "C++",
      "Clojure",
      "COBOL",
      "ColdFusion",
      "Erlang",
      "Fortran",
      "Groovy",
      "Haskell",
      "Java",
      "JavaScript",
      "Lisp",
      "Perl",
      "PHP",
      "Python",
      "Ruby",
      "Scala",
      "Scheme"
    ];
    $( "#tags" ).autocomplete({
      source: availableTags
    });
  });
