$(function(){

  var CommunityObj = $(".autocomplete-suggestions");  //地址列表




  //下拉菜单
  $('.demo-test-select').scroller(
    $.extend({preset: 'select'})
  );


  // 整租、合租
  $('.radioBox label').click(function(){
    var t = $(this), id = t.find('a').attr('data-id'), type = $('.sharetype');
    t.addClass('active').siblings('a').removeClass('active');
    $('#rentype').attr('value',id);
    if (id == 0) {
      type.hide();
    }else {
      type.show();
    }
  })


  // 删除已添加的图片
  $('.addimg .close').click(function(){
    var t = $(this), li = t.parents('li'), ul = li .parents('ul');
    li.remove();
    if ($('.addimg li').length == 1) {
      ul.addClass('noimg')
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




  //小区模糊搜索
  $('#community').bind("input", function(){
    $('#communityid').val('0');
    var title = $(this).val();

    $.ajax({
          url: masterDomain + '/include/ajax.php?service=house&action=communityList',
          data: "keywords="+title,
          dataType: "jsonp",
          success: function (data) {
              if(data){

                  var list = data.info.list, addrList = [];
                  if(data.state == 100 && list.length > 0){

                      for (var i = 0, addr, contact; i < list.length; i++) {
                          addr = list[i];
                          addrList.push('<div class="autocomplete-suggestion" data-id="'+list[i].id+'">'+list[i].title+'</div>');
                      }
                      CommunityObj.html(addrList.join(""));

                      $('.autocomplete-suggestions').show();
                      $(".community-addr").hide();

                  }else{
                      if(list && list.length == 0){
                          CommunityObj.html('<div class="empty">'+langData['siteConfig'][20][349]+'</empty>');
                      }else{
                          CommunityObj.html('<div class="empty">'+data.info+'</empty>');
                      }

                      $('.autocomplete-suggestions').hide();
                      $(".community-addr").show();
                  }

              }else{
                  CommunityObj.html('<div class="empty">'+langData['siteConfig'][20][228]+'</empty>');

                    $('.autocomplete-suggestions').hide();
                    $(".community-addr").show();
              }
          },
          error: function(){
              CommunityObj.html('<div class="empty">'+langData['siteConfig'][20][227]+'</empty>');

                $('.autocomplete-suggestions').hide();
                $(".community-addr").show();
          }
      });


  })


  $('.autocomplete-suggestions').delegate('.autocomplete-suggestion', 'click', function(){
    var t = $(this), val = t.text(), id = t.attr('data-id');
    $('#community').val(val);
    $('#communityid').val(id);
    $('.autocomplete-suggestions').hide();
    $(".community-addr").hide();
  })

  $("#community").bind("blur", function(){
    setTimeout(function(){
      if(($("#communityid").val() == 0 || $("#communityid").val() =="") && $("#community").val() != ""){
          $('.autocomplete-suggestions').hide();
        $(".community-addr").show();
      }else{
        $(".community-addr").hide();
      }
    },100)
  });


  //提交发布
	$("#submit").bind("click", function(event){

    var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url"), tj = true;

		event.preventDefault();

		var t           = $(this),
        title       = $("#title"),
        community   = $("#community"),
        communityid = $("#communityid").val(),
        addrid      = $("#addrid").val(),
        address     = $("#address"),
        rentype     = $("#rentype").val(),
        sharetype   = $("#sharetype"),
        sharesex    = $("#sharesex"),
        litpic      = $("#litpic").val(),
        price       = $("#price"),
        paytype     = $("#paytype"),
        area        = $("#area"),
        litpic      = $("#litpic"),
        person      = $("#person"),
        tel         = $("#tel"),
        error       = $(".error"),
        text        = error.find('p');

		if(t.hasClass("disabled")) return;


    if (community.val() == "") {
      showMsg(langData['siteConfig'][20][350]);
      tj = false;
    }
    else if(community.val() != "" && (communityid == 0 || communityid == "") && address.val() == ""){
      showMsg(langData['siteConfig'][20][351]);
      tj = false;
		}
    else if(community.val() != "" && (communityid == 0 || communityid == "") && addrid == 0){
      showMsg(langData['siteConfig'][20][344]);
      tj = false;
		}
    else if(area.val() == "" || area.val() == 0){
      showMsg(langData['siteConfig'][20][352]);
      tj = false;
		}
		else if(rentype == 1 && sharetype.val() == ""){
      showMsg(langData['siteConfig'][20][353]);
      tj = false;
		}
    else if(rentype == 1 && sharesex.val() == ""){
      showMsg(langData['siteConfig'][20][354]);
      tj = false;
		}
    else if(price.val() == "" || price.val() == 0){
      showMsg(langData['siteConfig'][20][355]);
      tj = false;
		}
    else if(paytype.val() == ""){
      showMsg(langData['siteConfig'][20][356]);
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
    }
    else if(tel.val() == "" || tel.val() == 0){
      showMsg(langData['siteConfig'][20][239]);
      tj = false;
    }
    else if(!(/^1[34578]\d{9}$/.test(tel.val()))){
      // showMsg('手机号码有误，请重填');
      // tj = false;
    }

    // 选择特色
    form.find('.flag').remove();
    $('.facility li.on').each(function(){
      var a = $(this), id = a.data('id'), name = a.closest('.facility').data('type');
      form.append('<input type="hidden" name="'+name+'" class="flag" value="'+id+'">');
    })

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
    console.log(data)
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
