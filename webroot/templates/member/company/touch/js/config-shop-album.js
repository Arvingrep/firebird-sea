$(function(){

  //APP端取消下拉刷新
  toggleDragRefresh('off');
   // 上传店铺幻灯
  var hasCout = $('#slideShow_choose .hasimg').length; 
  var upslideShow = new Upload({
    btn: '#up_slideShow',
    bindBtn: '',
    title: 'Images',
    mod: 'shop',
    params: 'type=atlas',
    atlasMax: 100,
    has:hasCout,
    deltype: 'delAtlas',
    replace: true,
    fileQueued: function(file){
      $("#up_slideShow").before('<li id="'+file.id+'" class="hasimg"><a href="javascript:;" class="close"></a></li>');
    },
    uploadSuccess: function(file, response){
      if(response.state == "SUCCESS"){
        $('#'+file.id).html('<img src="'+response.turl+'" data-url="'+response.url+'" alt=""><a href="javascript:;" class="close"></a>');
      }
    },
    uploadFinished: function(){
      if(this.sucCount == this.totalCount){
        // showErr('所有图片上传成功');
      }else{
        showErrAlert((this.totalCount - this.sucCount) + langData['siteConfig'][44][19].replace('1',''));//1张图片上传失败
      }

    },
    uploadError: function(){

    },
    showErr: function(info){
      showErrAlert(info);
    }
  });
  $('#slideShow_choose .slideshow').delegate('.close', 'click', function(){
    var t = $(this), val = t.siblings('img').attr('data-url');
    upslideShow.del(val);
    $("#up_videoShow").removeClass('fn-hide');

    t.parent().remove();

  })


  // 上传店铺视频
  var hasCout2 = $('#videoShow_choose .hasimg').length; 
  var upvideoShow = new Upload({
    btn: '#up_videoShow',
    bindBtn: '',
    title: 'Video',
    mod: 'shop',
    params: 'type=thumb&filetype=video',
    atlasMax: 1,
    has:hasCout2,
    deltype: 'delVideo',
    replace: true,
    fileQueued: function(file){
      var has = $("#up_videoShow").next();
      // if(has.length){
      //   has.find('.close').click();
      //   has.remove();
      // }
      $("#up_videoShow").addClass('fn-hide').before('<li id="'+file.id+'"  class="vid"><a href="javascript:;" class="close"></a></li>');
    },
    uploadSuccess: function(file, response){
      if(response.state == "SUCCESS"){
        $('#'+file.id).html('<video src="'+response.turl+'" data-url="'+response.url+'" /><a href="javascript:;" class="close"></a>');
        $("#video").val(response.url)
      }
    },
    uploadFinished: function(){
      if(this.sucCount == this.totalCount){
        // showErr('所有图片上传成功');
      }else{
        showErrAlert((this.totalCount - this.sucCount) + langData['siteConfig'][44][20].replace('1',''));//1个视频上传失败
      }

    },
    uploadError: function(){

    },
    showErr: function(info){
      showErrAlert(info);
    }
  });
  $('.videoshow.video').delegate('.close', 'click', function(){
    if($(this).closest('li').hasClass('vid')){
      var t = $(this), val = t.siblings('video').attr('data-url');
      upvideoShow.del(val);
      t.parent().remove();
      $("#up_videoShow").removeClass('fn-hide');
      $("#video").val('');

    }else if($(this).closest('li').hasClass('vpic')){//视频封面
      var t = $(this), val = t.siblings('img').attr('data-url');
      $("#up_videoPicShow").removeClass('fn-hide');
      upvideopicShow.del(val);
      t.parent().remove();
    }
  })

  // 表单提交
  $(".tjBtn").bind("click", function(event){

    event.preventDefault();

    var t= $(this);

    if(t.hasClass("disabled")) return;
    //图集
    var imgList = [],litpic   = '';
    // $("#slideShow_choose .hasimg").each(function(){
    //     var x = $(this),
    //         url = x.find('img').attr("data-url");
    //     if (url != undefined && url != '') {
    //         imgList.push(url+'||');
    //     }
    // });
    $("#slideShow_choose .hasimg").each(function(i){
      var val = $(this).find('img').attr('data-url');
      if(i == 0){
        litpic = val;
      }else{
        imgList.push(val+'||');
      }
    })
    $('#litpic').val(litpic);
    $("#imglist").val(imgList.join('###'));
    if($("#imglist").val() == ''){
      showErrAlert('请上传店铺图集');
      return;
    }

    var form = $("#fabuForm"), action = form.attr("action");
    var data = form.serialize();
    t.addClass('disabled').find('a').html('保存中');
    $.ajax({
      url: action,
      data: data,
      type: "POST",
      dataType: "json",
      success: function (data) {
        if(data && data.state == 100){
          showErrAlert(langData['siteConfig'][6][39])

        }else{
          showErrAlert(data.info)
        }
        t.removeClass('disabled').find('a').html('保存设置');
        window.history.back();
      },
      error: function(){
        showErrAlert(langData['siteConfig'][20][183]);
        t.removeClass('disabled').find('a').html('保存设置');
      }
    });


  });






})






// 扩展zepto
$.fn.prevAll = function(selector){
    var prevEls = [];
    var el = this[0];
    if(!el) return $([]);
    while (el.previousElementSibling) {
        var prev = el.previousElementSibling;
        if (selector) {
            if($(prev).is(selector)) prevEls.push(prev);
        }
        else prevEls.push(prev);
        el = prev;
    }
    return $(prevEls);
};

$.fn.nextAll = function (selector) {
    var nextEls = [];
    var el = this[0];
    if (!el) return $([]);
    while (el.nextElementSibling) {
        var next = el.nextElementSibling;
        if (selector) {
            if($(next).is(selector)) nextEls.push(next);
        }
        else nextEls.push(next);
        el = next;
    }
    return $(nextEls);
};
