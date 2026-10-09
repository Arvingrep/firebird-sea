$(function(){

  $(".submit").click(function(){
    $("#submitForm").submit();
  })
  $("#submitForm").submit(function(e){
    e.preventDefault();
    var form = $(this), btn = $(".submit");
    if(btn.hasClass("disabled")) return;

    btn.addClass('disabled');

    // 图片
    var pics = [];
    $("#fileList .thumbnail").each(function(){
      var img = $(this).find('img'), val = img.attr('data-val');
      if(val){
        pics.push(val);
      }
      $("#shop_banner").val(pics.join(","));
    })

    formSubmit('image-info');

  })


})
