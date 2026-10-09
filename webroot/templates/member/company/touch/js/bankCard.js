$(function(){

  // 选择银行卡号
  $('.item').click(function(){
    var t = $(this), list = $('.list'), length = $('.item').length;

    // 选择使用
    if (!list.hasClass('select')) {
      t.addClass('active').siblings('.item').removeClass('active');

    // 选择删除
    }else {
      if (t.hasClass('selected')) {
        t.removeClass('selected');
      }else {
        t.addClass('selected');
      }
      if ($('.item.selected').length == length) {
        $('.all').addClass('selected');
      }else {
        $('.all').removeClass('selected');
      }
    }
  })

  // 点击编辑
  $('.editBtn').click(function(){
    var t = $(this);
    if (!t.hasClass('cancel')) {
      $('.list').addClass('select');
      $('.all, .del').addClass('show');
      $('.other-card, .confirm').removeClass('show');
      t.text(langData['siteConfig'][6][12]).addClass('cancel');
    }else {
      $('.list').removeClass('select');
      $('.all, .del').removeClass('show');
      $('.other-card, .confirm').addClass('show');
      t.text(langData['siteConfig'][6][6]).removeClass('cancel');
    }
  })

  // 全选
  $('.all').click(function(){
    var t = $(this);
    if (t.hasClass('selected')) {
      t.removeClass('selected');
      $('.item').removeClass('selected');
    }else {
      t.addClass('selected');
      $('.item').addClass('selected');
    }
  })

  // 删除
  $('.del').click(function(){

    var ids = [];
    $('.list .item').each(function(){
      if($(this).hasClass('selected')){
        ids.push($(this).data('id'));
      }
    });

    if(ids.length <= 0){
      alert(langData['siteConfig'][20][210]);
      return false;
    }

    if(confirm(langData['siteConfig'][20][211])){
      var all = $('.all');
      if (all.hasClass('selected')) {
        $('.item.selected').remove();
        $('.contain').hide();
        $('.header-r').css('visibility', 'hidden');
        $('.empty').show();
      }else {
        $('.item.selected').remove();
      }

      $.ajax({
  			url: "/include/ajax.php?service=member&action=withdraw_card_del",
  			type: "GET",
  			data: "id="+ids.join(","),
  			dataType: "jsonp",
  			success: function (data) {

  			},
  			error: function(){

  			}
  		});
    }
  })

  //确定
  $('.confirm').bind("click", function(){
    var id = $('.item.active').data('id');
    if(id && id != undefined){
      location.href = $(this).data('href').replace('%id%', id);
    }
  });

})
