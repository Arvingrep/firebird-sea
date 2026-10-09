$(function(){

  var ue;
  function getEditor(id){
    ue = UE.getEditor(id, {toolbars: [['fullscreen', 'undo', 'redo', '|', 'fontfamily', 'fontsize', '|', 'forecolor', 'bold', 'italic', 'underline', '|', 'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|', 'insertorderedlist', 'insertunorderedlist', '|', 'link', 'unlink', '|', 'simpleupload', 'insertimage']], initialStyle:'p{line-height:1.5em; font-size:13px; font-family:microsoft yahei;}'});
    ue.on("focus", function() {ue.container.style.borderColor = "#999"});
    ue.on("blur", function() {ue.container.style.borderColor = ""})
  }

  getEditor("body");

  //提交发布
  $("#submit").bind("click", function(event){

    event.preventDefault();

    var t = $(this),
      cityid = $('select[name=cityid]').val(),
      typeid      = $("#typeid").val(),
      writer      = $("#writer"),
      title   = $("#title");

    if(t.hasClass("disabled")) return;

    var offsetTop = 0;

    //验证城市
    if(cityid == "" || cityid == 0){
        var dl = $("#cityid").closest("dl");
        dl.find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+$("#cityid").attr("data-title"));
        offsetTop = offsetTop == 0 ? dl.offset().top : offsetTop;
    }

    //验证分类
    if(typeid == "" || typeid == 0){
      var dl = $("#typeid").closest("dl");
      dl.find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+dl.find(".sel-group:eq(0)").attr("data-title"));
      offsetTop = offsetTop == 0 ? dl.offset().top : offsetTop;
    }

    //验证名称
    if($.trim(title.val()) == ""){
      title.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+title.data("title"));
      offsetTop = title.offset().top;
    }

    ue.sync();

    if(!ue.hasContents() && offsetTop == 0){
      $.dialog.alert(langData['siteConfig'][20][329]);  //请输入内容
      offsetTop = offsetTop == 0 ? $("#body").offset().top : offsetTop;
    }

    if(offsetTop){
      $('.main').animate({scrollTop: offsetTop - 5}, 300);
      return false;
    }

    var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url");
    data = form.serialize();

    t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");   //提交中

    $.ajax({
      url: action,
      data: data,
      type: "POST",
      dataType: "json",
      success: function (data) {
        if(data && data.state == 100){
          // var tip = langData['siteConfig'][22][107];
          // if(id != undefined && id != "" && id != 0){
          //   tip = langData['siteConfig'][20][229];
          // }
          $.dialog({
            title: langData['siteConfig'][19][287],   //提示消息
            icon: 'success.png',
            content: data.info,
            ok: function(){
              location.href = url;
            }
          });
        }else{
          $.dialog.alert(data.info);
          t.removeClass("disabled").html(langData['shop'][1][7]);    //注册中
          $("#verifycode").click();
        }
      },
      error: function(){
        $.dialog.alert(langData['siteConfig'][20][183]);  //网络错误，请稍候重试！
        t.removeClass("disabled").html(langData['shop'][1][7]); //注册中
        $("#verifycode").click();
      }
    });


  });
  

    //模糊匹配商家
    $("#storename").bind("input", function(){
      var t = $(this), val = t.val(), id = $("#id").val();
      if(val != ""){
        t.addClass("input-loading");
        huoniao.operaJson("/include/ajax.php?service=business&action=blist", "title="+val, function(data){
          t.removeClass("input-loading");
          if(!data || data.state != 100) {
            $("#companyList").html("").hide();
            return false;
          }
          data = data.info.list;
          var list = [];
          for(var i = 0; i < data.length; i++){
            var name = data[i].title;
            var time = new Date().getTime();
            var ifr_id = 'iframe_'+i+'_'+time;
            list.push('<li data-id="'+data[i].id+'" data-company="'+name+'"><iframe src="/include/ajax.php?service=business&action=detailHtml&dataType=html&id='+data[i].id+'&iframe='+ifr_id+'" style="width:100%;border:none;" id="'+ifr_id+'"></iframe><div class="m"></div></li>');
          }
          if(list.length > 0){
            var pos = t.position();
            $("#companyList")
              // .css({"left": pos.left, "top": pos.top + 36, "width": t.width() + 12})
              .html('<ul>'+list.join("")+'</ul>')
              .show();

          }else{
            $("#companyList").html("").hide();
          }
        });

      }else{
        $("#companyList").html("").hide();
      }
    });

    $("#companyList").delegate("li", "click", function(){
      var name = $(this).attr('data-company'), id = $(this).attr("data-id");
      $("#storename").val(name);
      $("#uid").val(id);
      $("#companyList").html("").hide();
      $('#storename').val('');
      checkBusiness($("#storename"), name, $("#id").val(), function(sid){
        console.log(sid)
        // if(checkContent(sid)){
        //  $.dialog.alert('店铺已存在');
        //  return false;
        // }
        var time = new Date().getTime();
        var id = 'iframe_'+time;
        ue.setContent('<iframe src="/include/ajax.php?service=business&action=detailHtml&dataType=html&id='+sid+'&iframe='+id+'" style="width:100%;border:none;" id="'+id+'"></iframe>', true);
        $.dialog.tips(langData['siteConfig'][30][50], 1, 'success.png');   //店铺已插入文章
      });
      return false; 
    });

    $(document).click(function (e) {
      var s = e.target;
      if (!jQuery.contains($("#companyList").get(0), s)) {
        if (jQuery.inArray(s.id, "user") < 0) {
            $("#companyList").hide();
        }
      }
    });

    $("#storename").bind("blur", function(){
      var t = $(this), val = t.val(), id = $("#id").val();
      if(val != ""){
        checkBusiness(t, val, id);
      }else{
        t.siblings(".input-tips").removeClass().addClass("input-tips input-ok").html('<s></s>&nbsp;');
      }
    });

    function checkBusiness(t, val, id, callback){
      var flag = false;
      t.addClass("input-loading");
      huoniao.operaJson("/include/ajax.php?service=business&action=blist", "title="+val, function(data){
        t.removeClass("input-loading");
        if(data && data.state == 100) {
          for(var i = 0; i < data.info.list.length; i++){
            if(data.info.list[i].title == val){
              flag = true;
              callback && callback(data.info.list[i].id);
              break;
            }
          }
          if(flag){
            t.siblings(".input-tips").removeClass().addClass("input-tips input-ok").html('<s></s>&nbsp;');
          }else{
            t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>'+langData['siteConfig'][30][51]);   //请从列表中选择商家
          }
        }
      });
    }

    function checkContent(id){
      var content = ue.getContent();
      if($.trim(content) == ''){
        $('#sid').val('');
        return;
      }
      var patt = /action=detailHtml&dataType=html&id=(\d+)/g;

      var sid = [];
      while ((res = patt.exec(content)) != null)  {
        sid.push(res[1]);
      }
      $('#sid').val(sid.join(','));
    }
    ue.addListener("contentChange",function(){
      checkContent();
    });

});
