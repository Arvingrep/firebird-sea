$(function(){


  //下拉菜单
  $('.demo-test-select').scroller(
    $.extend({preset: 'select'})
  );


  // 出租、出售、转让
  $('.radioBox label').click(function(){
    var t = $(this), id = t.find('a').attr('data-id'), type = $('.sharetype');
    t.addClass('active').siblings('label').removeClass('active');
    $('#lei').attr('value', id);
    if (id == 0) {
      $('#priceType').text(''+echoCurrency('short')+'/'+langData['siteConfig'][13][18]);$('.transfer, .industry').hide();
    }else {
      $('#priceType').text(langData['siteConfig'][13][27]+echoCurrency('short'));$('.transfer, .industry').hide();
      if (id == 1) {
        $('.transfer, .industry').show();
      }
    }
  })



  // 选择特色
  $('.facility li').click(function(){
    var t = $(this);
    if (t.hasClass('on')) {
      $(this).removeClass('on');
    }else {
      $(this).addClass('on');
    }
  })




  //提交发布
	$("#submit").bind("click", function(event){

    var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url"), tj = true;

		event.preventDefault();

		var t           = $(this),
        lei         = $("#lei"),
        title       = $("#title"),
        addrid      = $("#addrid").val(),
        address     = $("#address"),
        litpic      = $("#litpic").val(),
        price       = $("#price"),
        area        = $("#area"),
        litpic      = $("#litpic"),
        person      = $("#person"),
        tel         = $("#tel"),
        error       = $(".error"),
        text        = error.find('p');

		if(t.hasClass("disabled")) return;

		else if(addrid == 0 || addrid == ""){
      showMsg(langData['siteConfig'][20][365]);
      tj = false;
		}
    else if(address.val() == ""){
      showMsg(langData['siteConfig'][20][366]);
      tj = false;
		}
    else if(area.val() == "" || area.val() == 0){
      showMsg(langData['siteConfig'][20][352]);
      tj = false;
		}
    else if(price.val() == "" || price.val() == 0){
      showMsg(langData['siteConfig'][20][328]);
      tj = false;
		}
    else if(title.val() == "" || title.val() == 0){
      showMsg(langData['siteConfig'][20][343]);
      tj = false;
		}
    else if(litpic.find('li').length == 1){
      showMsg(langData['siteConfig'][20][357]);
      tj = false;
		}
    else if(person.val() == "" || person.val() == 0){
      showMsg(langData['siteConfig'][20][345]);
      tj = false;
      return false;
    }
    var personRegex = '[\u4E00-\u9FA5\uF900-\uFA2Da-zA-Z]{2,15}', personErrTip = langData['siteConfig'][20][346];
    var exp = new RegExp("^" + personRegex + "$", "img");
    if(!exp.test(person.val())){
      showMsg(langData['siteConfig'][20][347]);
      tj = false;
    }
    else if(tel.val() == "" || tel.val() == 0){
      showMsg(langData['siteConfig'][20][239]);
      tj = false;
    }
    else if(!(/^1[34578]\d{9}$/.test(tel.val()))){
      // showMsg('手机号码有误，请重填');
      // tj = false;
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
