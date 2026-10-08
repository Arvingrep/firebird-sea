$(function(){
  var typeChange = false;

  // 上传店铺相册
  var upslideShow = new Upload({
    btn: '#uploadFile',
    bindBtn: '.addbtn',
    title: 'Images',
    mod: 'business',
    params: 'type=atlas',
    atlasMax: 999,
    deltype: 'delAtlas',
    replace: true,
    fileQueued: function(file){
      var isface = $(".item.curr .upload-file ul li").length == 1 ? 1 : 0;
      $(".item.curr .upload-file ul").append('<li id="'+file.id+'" data-face="'+isface+'"><a href="javascript:;" class="close">×</a></li>');
    },
    uploadSuccess: function(file, response){
      if(response.state == "SUCCESS"){
        var li = $('#'+file.id), isface = li.attr("data-face");
        if(isface == 1){
          $('#'+file.id).html('<img src="'+response.turl+'" data-url="'+response.url+'" alt=""><a href="javascript:;" class="close">×</a>');//封面
        }else{
          $('#'+file.id).html('<img src="'+response.turl+'" data-url="'+response.url+'" alt=""><a href="javascript:;" class="close">×</a>');//设为封面
        }
      }
    },
    uploadError: function(){

    },
    showErr: function(info){
      showErr(info);
    }
  });
  $('.typeList').delegate('.close', 'click', function(){
    var t = $(this), val = t.siblings('img').attr('data-url'), id = t.closest("li").attr("data-id");
    upslideShow.del(val);
    t.parent().remove();
    if(id){
      $.post(masterDomain+'/include/ajax.php?service=business&action=delalbums&id='+id);
    }
  })
  // 设为封面
  $('.typeList').delegate('.face', 'click', function(){
    var t = $(this);
    t.closest('ul').children('li').attr('data-face', 0).find('.face').text(langData['siteConfig'][19][909]).removeClass('on');//设为封面
    t.text(langData['siteConfig'][19][908]).addClass('on').closest('li').attr('data-face', 1);//封面
  })

  // 选中分类
  $(".typeList").delegate(".inpbox, .choose_state", "click", function(){
    var t = $(this), p = t.closest(".item");
    if(p.hasClass("edit") || p.hasClass("curr")) return;
    p.addClass("curr").siblings().removeClass("curr").find('.type_title').attr("readonly", true);
  })

  // 分类操作
  $(".typeList").delegate(".btns span", "click", function(){
    var t = $(this), p = t.closest(".item"), p_clone = p.clone();
    // 上移
    if(t.hasClass('arrow_up')){
      if(!p.siblings().length) return;
      var prev = p.prev();
      if(!prev.length) return;
      prev.before(p_clone);
      p.remove();

    // 下移
    }else if(t.hasClass('arrow_down')){
      if(!p.siblings().length) return;
      var next = p.next();
      if(!next.length) return;
      next.after(p_clone);
      p.remove();

    // 编辑
    }else if(t.hasClass('edit')){
      p.addClass("curr").siblings().removeClass("curr").find('.type_title').attr("readonly", true);
      p.find('.type_title').attr("readonly", false).focus();

    // 删除
    }else if(t.hasClass('del')){
      if(confirm(langData['siteConfig'][44][21])){//确定要删除该分类及分类下的照片吗？该操作无法撤销
        var type = p.attr("data-id")
        p.find('.upload-file li').each(function(){
          var li = $(this);
          if(li.hasClass('addbtn')) return;
          var img = li.find('img').attr('data-url');
          if(img){
            upslideShow.del(img);
          }
        })
        p.remove();
        $.post(masterDomain+'/include/ajax.php?service=business&action=delAlbumsType&id='+type);
      }
    }

    typeChange = true;
  })

  // 添加分类
  $(".titleinfo a").click(function(){
    var html = $('<div class="item" data-id="0"> <div class="type_info fn-clear"> <div class="choose_state"><span></span></div> <div class="inpbox"><input type="text" class="type_title" value="" readonly="readonly"></div> <div class="btns"> <span class="arrow arrow_up"></span> <span class="arrow arrow_down"></span> <span class="edit"></span> <span class="del"></span> </div> </div> <div class="upload-file slideshow"> <ul class="fn-clear"> <li class="addbtn up_slideShow"></li> </ul> </div> </div>');
    // var picCon = '<div class="upload-file slideshow"> <ul class="fn-clear"> <li class="addbtn up_slideShow"></li> </ul> </div>';

    $('.typeList').append(html);
    html.find('.edit').click();
    $(".submit").show();

    typeChange = true;
  })

  // 提交 - 仅用作保存分类
  var error = [];
  $(".submit").click(function(){
    var btn = $(this);
    if(btn.hasClass('disabled')) return;

    var json = '[';
    var r = true;
    $(".typeList .item").each(function(i){
      var t = $(this), id = t.attr("data-id"), weight_ = t.attr("data-weight"), typename = t.find('.type_title').val(), weight = i;
      if(typename != ''){
        json += '{"id": '+id+', "val": "'+typename+'", "weight": '+weight+'},';
      }else{
        showErr(langData['siteConfig'][44][22]);//您还有分类没有名称
        r = false;
      }
    })
    if(!r) return;
    if(json != '['){
      json = json.substr(0, json.length - 1);
    }
    json += ']';

    btn.addClass('disabled');

    // 保存分类
    $.ajax({
      url: masterDomain + '/include/ajax.php?service=business&action=updateAlbumsType',
      data: {data: json},
      type: 'post',
      dataType: 'json',
      success: function(data){
        if(data && data.state == 100){

          $(".typeList .item").each(function(i){
            $(this).attr("data-id", data.info[i].id)
          })
          saveAlbum();
        }else{
          showErr(data.info);
          btn.removeClass('disabled');
        }
      },
      error: function(){
        btn.removeClass('disabled');
        showErr(langData['siteConfig'][44][23]);//网络错误，请重试
      }
    })

  })

  function saveAlbum(){

    $(".typeList .item").each(function(i){
      var t = $(this), id = t.attr("data-id");
      var picsList = [];
      t.find('.upload-file li').each(function(n){
        if(n > 0){
          var li = $(this), aid = li.attr("data-id"), img = li.find('img').attr('data-url'), face = li.attr("data-face");
          aid = aid == undefined ? 0 : aid;
          picsList.push(img+'|'+face+'|'+aid);
        }
      })
      if(picsList.length){
        $.ajax({
          url: masterDomain+'/include/ajax.php?service=business&action=addalbums&typeid='+id+'&pics='+picsList.join(','),
          type: 'get',
          dataType: 'jsonp',
          success: function(data){
            if(!data || data.state != 100){
              error.push(id);
            }
            if(i + 1 == $(".typeList .item").length){
              saveAlbumComplete();
            }
          },
          error: function(){
            if(i + 1 == $(".typeList .item").length){
              saveAlbumComplete();
            }
          }
        })
      }else{
        if(i + 1 == $(".typeList .item").length){
          saveAlbumComplete();
        }
      }

    })
  }

  function saveAlbumComplete(){
    if(error.length){
      console.log(error)
      showErr(langData['siteConfig'][44][24])//部分图片保存失败
    }else{
      showErr(langData['siteConfig'][6][39]);//保存成功
    }
    setTimeout(function(){
        if(device.indexOf('huoniao') > -1){
            setupWebViewJavascriptBridge(function(bridge) {
                bridge.callHandler("pageRefresh", {}, function(responseData){});
            });
        }else {
            location.reload();
        }
    }, 1000)
  }



})

// 错误提示
function showErr(str){
  var o = $(".error");
  o.html('<p>'+str+'</p>').show();
  setTimeout(function(){o.hide()},1000);
}
