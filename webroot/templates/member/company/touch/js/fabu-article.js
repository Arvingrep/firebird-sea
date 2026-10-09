$(function(){

  //提交发布
  $("#submit").bind("click", function(event){

    var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url"), tj = true;

    event.preventDefault();

    var t           = $(this),
				title       = $("#title"),
				typeid      = $("#typeid").val(),
				writer      = $("#writer").val(),
				source      = $("#source"),
				textarea    = $("#textarea"),
				sourceurl   = $("#sourceurl"),
        error       = $(".error"),
        text        = error.find('p');


    if(t.hasClass("disabled")) return;

    var titleRegex = '[\u4E00-\u9FA5\uF900-\uFA2Da-zA-Z]{2,50}';
    var exp = new RegExp("^" + titleRegex + "$", "img");


    if(!exp.test(title.val())){
      showMsg(langData['siteConfig'][20][343]);
      return false;
    }
    else if(typeid == 0 || typeid == ''){
      showMsg(langData['siteConfig'][20][367]);
      return false;
    }
    else if(textarea.val() == "" || textarea.val() == 0){
      showMsg(langData['siteConfig'][20][368]);
      return false;
    }

    var personRegex = '[\u4E00-\u9FA5\uF900-\uFA2Da-zA-Z]{2,15}';
    var exp = new RegExp("^" + personRegex + "$", "img");
    if(!exp.test(writer)){
      showMsg(langData['siteConfig'][20][369]);
      return false;
    }
    else if(source.val() == "" || source.val() == 0){
      showMsg(langData['siteConfig'][20][39]);
      return false;
    }

    if(!tj) return;

      data = form.serialize();

      var imglist = [], imgli = $("#fileList li.thumbnail");

      imgli.each(function(index){
        var t = $(this), val = t.find("img").attr("data-val");
        if(val != ''){
          if(index == 1){
            data += "&litpic="+val;
          }else{
            var val = $(this).find("img").attr("data-val");
            if(val != ""){
              imglist.push(val+"|");
            }
          }
        }
      })


    if(imglist){
      data += "&imglist="+imglist.join(",");
    }

    t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

    $.ajax({
      url: action,
      data: data,
      type: "POST",
      dataType: "json",
      success: function (data) {
        if(data && data.state == 100){
          var tip = langData['siteConfig'][20][341];
          if(id != undefined && id != "" && id != 0){
            tip = langData['siteConfig'][20][229];
          }
          alert(tip + "，" + langData['siteConfig'][20][404])
          location.href = url;
        }else{
          alert(data.info)
          t.removeClass("disabled").html(langData['siteConfig'][11][19]);
        }
      },
      error: function(){
        alert(langData['siteConfig'][20][183]);
        t.removeClass("disabled").html(langData['siteConfig'][11][19]);
      }
    });


  });


})
