$(function(){

  var layer = $('.layer');

  // 子类弹出层
  $('.addbtn').click(function(){
    layer.addClass('show').animate({"opacity":"1"}, 100);
  })

  // 修改
  $('.item .edit').click(function(){
    layer.addClass('show').animate({"opacity":"1"}, 100);
  })

  $('.mask').click(function(){
    layerHide();
  })


  // 新增子类
  $('.layer .confirm').click(function(){
    var html = [],
        name = $('#name').val(),
        number = $('#number').val();
    if (name == "") {
      showError(langData['waimai'][5][78]);
    }
    else if(number == ""){
      showError(langData['waimai'][5][30]);
    }else {
      html.push('<div class="item"><div class="title"><p class="name">'+name+'</p><p class="num">'+number+'</p></div><a href="javascript:;" class="del">'+langData['siteConfig'][6][8]+'</a><a href="javascript:;" class="edit">'+langData['siteConfig'][6][7]+'</a></div>');
      $('.container').append(html.join(""));
      layerHide();
    }
  })

  // 删除子类
  $('.container').delegate(".del", "click", function(){
    if (confirm(langData['waimai'][5][80])) {
      $(this).closest('.item').remove();
    }
  })



  // 隐藏弹出层
  function layerHide(){
    $('.layer').animate({'opacity':'0'}, 100);
    setTimeout(function(){
      $('.layer').removeClass('show');
    }, 100)
  }

  function showError(str){
    var o = $(".error");
    o.html('<span>'+str+'</span>').addClass('show');
    setTimeout(function(){o.removeClass('show')},1000);
  }

})
