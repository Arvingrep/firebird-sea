$(function(){

  // 展开收起
  $(".PackageList").delegate(".PackageBox_arrow","click",function(){
      var x = $(this),
          box = x.closest('.PackageBox').find('.PackageBox_List');
          height = box.height();
      if (x.hasClass('rog')) {
          box.show();
          x.removeClass('rog');
      }else{
          box.hide();
          x.addClass('rog')
      }
  })

  // 删除
  $(".PackageList").delegate(".PackageBox_del","click",function(){
    var t = $(this), p = t.closest('.PackageBox'), id = p.attr('data-id');

    if (confirm(langData['siteConfig'][20][211])==true){
      p.hide();
      $.ajax({
        url: masterDomain+"/include/ajax.php?service="+module+"&action=delLogistic&id="+id,
        type: "GET",
        dataType: "jsonp",
        success: function (data) {
          if(data && data.state != 200){
            p.remove();
          }else{
            showErr(langData['siteConfig'][27][77], 1000);
            p.show();
          }
        },
        error: function(){
          showErr(langData['siteConfig'][20][183], 1000);
          p.show();
        }
      });
    }
  })


  //错误提示
  var showErrTimer;
  function showErr(txt, time, callback){
      showErrTimer && clearTimeout(showErrTimer);
      $(".popErr").remove();
      if(txt == '' || txt == undefined) return;
      $("body").append('<div class="popErr"><p>'+txt+'</p></div>');
      $(".popErr p").css({"margin-left": -$(".popErr p").width()/2, "left": "50%"});
      $(".popErr").css({"visibility": "visible"});
      if(time){
        showErrTimer = setTimeout(function(){
            $(".popErr").fadeOut(300, function(){
                $(this).remove();
                callback && callback();
            });
        }, time);
      }
  }


})