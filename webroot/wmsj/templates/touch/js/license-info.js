$(function(){

  // <li id="WU_FILE_1" class="thumbnail"><img src="" data-val="" data-url=""><div class="file-panel"><span class="cancel"></span></div></li>

  // 调整顺序
  $('.changesort').click(function(){
    var con = $("#fileList"), item = con.children(".thumbnail");
    if(item.length == 1){
      return;
    }else{
      item.eq(0).insertAfter(item.eq(1));
    }
  })

  $(".submit").click(function(){
    $("#submitForm").submit();
  })
  $("#submitForm").submit(function(e){
    e.preventDefault();
    var form = $(this), btn = $(".submit");
    if(btn.hasClass("disabled")) return;

    btn.addClass('disabled');

    // 图片
    var food_license_img = business_license_img = '';
    $("#fileList .thumbnail").each(function(i){
      console.log("aaa " + i);
      var img = $(this).find('img'), val = img.attr('data-val');
      if(val){
        if(i == 0){
          food_license_img = val;
        }else if(i == 1){
          business_license_img = val;
        }
      }

    })

    $("#food_license_img").val(food_license_img);
    $("#business_license_img").val(business_license_img);

    formSubmit('license-info');

  })


})
