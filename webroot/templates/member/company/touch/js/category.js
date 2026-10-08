$(function(){

    if(modelType == '') location.href = masterDomain;

    var delIds = [];

    // 展开收起
    $(".PackageList").delegate(".PackageBox_arrow","click",function(){
        var x = $(this),
            box = x.closest('.PackageBox').find('.PackageBox_List');
            height = box.height();
        if (height == "0") {
            box.css({"height":"auto","padding":"0.1rem .25rem","border":"0.02rem solid #ededed","border-top":"none"});
            x.removeClass('rog')
        }else{
            box.css({"height":"0","padding":"0","border":"none"});
            x.addClass('rog')
        }
    })
    // 新增删除子分类
    $(".PackageList").delegate(".PackageBox_ADD","click",function(){
        var x = $(this),
            box = x.closest('.PackageBox_List').find('.PackageBox_LL');
        box.append('<div class="PackageBox_de"><div class="PackageBox_littledel"></div><div class="PL_Name fn-clear"><input type="text"class="tit"value=""placeholder="'+langData['siteConfig'][19][485]+'"></div></div>')

    })
    $(".PackageList").delegate(".PackageBox_littledel","click",function(){
        var x = $(this),
            id = x.parent().attr('data-id');
            box = x.closest('.PackageBox_de');
        if (confirm(langData['siteConfig'][20][211])==true){
            box.remove();
        }
        if(id) delIds.push(id);
    })

    // 上下移动
    $(".PackageList").delegate(".PackageBox_up","click",function(){
        var x = $(this),
            box = x.closest('.PackageBox'),
            index = box.index(),
            nextbox = index-1;
        $(".PackageBox_up").show();
        $(".PackageBox_down").show();
        $('.PackageList .PackageBox').eq(nextbox).before(box).fadeIn();
        PackageHiddenbox();
    })
    $(".PackageList").delegate(".PackageBox_down","click",function(){
        var x = $(this),
            box = x.closest('.PackageBox'),
            index = box.index(),
            nextbox = index+1;
        $(".PackageBox_up").show();
        $(".PackageBox_down").show();
        $('.PackageList .PackageBox').eq(nextbox).after(box).fadeIn();
        PackageHiddenbox();
    })
    // 删除一级分类
    $(".PackageList").delegate(".PackageBox_del","click",function(){
        var x = $(this),
            box = x.closest('.PackageBox'),
            id = box.attr('data-id');
        if (confirm(langData['siteConfig'][20][211])==true){
          box.remove();
          if(id) delIds.push(id);
        }
    })

    $('.Package_ADD').click(function(){
        $(".PackageList").append('<div class="PackageBox"><div class="PackageBox_Lead fn-clear"><input type="text"placeholder="'+langData['siteConfig'][20][420]+'"value=""><div class="PackageBox_btn"><div class="PackageBox_up"><i></i></div><div class="PackageBox_down"><i></i></div><div class="PackageBox_del"><i></i></div><div class="PackageBox_arrow"><i></i></div></div></div><div class="PackageBox_List"><div class="PackageBox_LL"><div class="PackageBox_de"><div class="PackageBox_littledel"></div><div class="PL_Name fn-clear"><input type="text"class="tit"value=""placeholder="'+langData['siteConfig'][19][485]+'"></div></div></div><div class="PackageBox_ADD"><i></i>'+langData['siteConfig'][6][91]+'</div></div></div>').fadeIn();
        $(".PackageBox_up").show();
        $(".PackageBox_down").show();
        PackageHiddenbox();
        var sct = $(".PackageList .PackageBox:last-child").offset().top;
        $(window).scrollTop(sct);
    })
    PackageHiddenbox();
    function PackageHiddenbox(){
        var MaxIndex = $('.PackageList .PackageBox:last-child'),
            MinIndex = $('.PackageList .PackageBox:first-child');
        MaxIndex.find('.PackageBox_down').hide();
        MinIndex.find('.PackageBox_up').hide();
    }

    //点击保存
  $("#saveType").bind("click", function(){
    saveOpera();
  });

  //保存
  function saveOpera(){

    var first = $(".PackageBox"), json = '[';

    for(var i = 0; i < first.length; i++){
      (function(){
        var html = arguments[0], count = 0, jArray = $(html).find(".PackageBox_de"), id = $(html).data("id"), val = $(html).find(".PackageBox_Lead input[type=text]").val();

        if(jArray.length > 0 && val != ""){
          json = json + '{"id": "'+id+'", "name": "'+val+'", "lower": [';
          for(var k = 0; k < jArray.length; k++){

              var id = $(jArray[k]).data("id"), val = $(jArray[k]).find("input[type=text]").val();
              if(val != ""){
                json = json + '{"id": "'+id+'", "name": "'+val+'"},';
              }else{
                count++;
              }

          }
          json = json.substr(0, json.length-1);
          if(count == jArray.length){
            json = json + 'null},';
          }else{
            json = json + ']},';
          }
        }else{
          if(val != ""){
            json = json + '{"id": "'+id+'", "name": "'+val+'", "lower": null},';
          }
        }
      })(first[i]);
    }
    json = json.substr(0, json.length-1);
    json = json + ']';

    if(json == "]" && delIds.length == 0) return false;

    showErr(langData['siteConfig'][27][85]+"...");

    $.ajax({
      url: "/include/ajax.php?service="+modelType+"&action=operaCategory",
      type: 'post',
      data: {data: json},
      dataType: 'json',
      success: function(data){
        if(data.state == 100){
          if(delIds.length){
            del(delIds.join(","));
            $.post("/include/ajax.php?service="+modelType+"&action=delCategory&id="+delIds.join(","));
            delIds = [];
          }
          showErr(data.info, 1000, function(){
            location.reload();
          });
        }else{
          showErr(data.info, 1000);
        }
      },
      error: function(){
        showErr(langData['siteConfig'][6][203], 1000);//网络错误，请重试！
      }
    })

  }

  //异步删除分类
  function del(id){
    $.ajax({
      url: "/include/ajax.php?service="+modelType+"&action=delCategory",
      type: 'post',
      data: {id: id},
      dataType: 'json',
      success: function(data){
        if(data.state == 100){
          showErr(data.info, 1000, function(){
            location.reload();
          });
        }else{
          showErr(data.info, 1000);
        }
      },
      error: function(){
        showErr(langData['siteConfig'][6][203], 1000);//网络错误，请重试！
      }
    })
  }

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