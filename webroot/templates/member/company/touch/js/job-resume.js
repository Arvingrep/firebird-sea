$(function(){

  //导航
  $('.header-r .screen').click(function(){
    var nav = $('.nav'), t = $('.nav').css('display') == "none";
    if (t) {nav.show();}else{nav.hide();}
  })



  //下拉菜单
  $('.demo-test-select').scroller(
    $.extend({preset: 'select'})
  );

  //年月日
  $('.demo-test-date').scroller(
  	$.extend({preset: 'date', dateFormat: 'yy-mm-dd'})
  );


  // 选择区域
  var typeCon = $("#addrBox");
  function getSelTxt(sel,check){
    var id = sel.val();
    if((id == 0 || id == '') && check) return '';
    return sel.find('[value="'+id+'"]').text();
  }

  // 简历预览
  $('.look').click(function(){
    var t = $(this);
    var lookCon = $('.myresume');
    if($('#fileList .thumbnail').length > 0){
      var photo = $('#fileList .thumbnail img').attr('data-url');
      if(photo != undefined && photo != ''){
        lookCon.find('.photo').attr('src',photo);
      }
    }
    lookCon.find('.name').text($('#name').val());
    lookCon.find('.sex').text(getSelTxt($('#sex')));
    lookCon.find('.home').text($('#home').val());
    lookCon.find('.address').text($('#address').val());
    lookCon.find('.phone').text($('#phone').val());
    lookCon.find('.email').text($('#email').val());
    lookCon.find('.addr').text($('.gz-addr-seladdr p').text());
    lookCon.find('.nature').text(getSelTxt($('#nature')));
    lookCon.find('.type').text($('.gz-addr-type p').text());
    lookCon.find('.salary').text($('#salary').val());
    lookCon.find('.startwork').text(getSelTxt($('#startwork')));
    lookCon.find('.workyear').text($('#workyear').val());

    var html = [];
    $("#experience").find(".experience").each(function(){
      var t = $(this), company = $.trim(t.find(".company").val()), date1 = t.find(".date1 input").val(), date2 = t.find(".date2 input").val(), bumen = $.trim(t.find(".bumen").val()), zhiwei = $.trim(t.find(".zhiwei").val()), neirong = $.trim(t.find(".neirong").val());
      if(company != ""){
        html.push('<div class="experience"> <dl class="ritem"> <dt>'+langData['siteConfig'][20][354]+'</dt> <dd class="company">'+company+'</dd> </dl> <dl class="ritem"> <dt>'+langData['siteConfig'][19][770]+'</dt> <dd class="zztimes">'+date1+' '+langData['siteConfig'][13][7]+' '+date2+'</dd> </dl> <dl class="ritem"> <dt>'+langData['siteConfig'][20][139]+'</dt> <dd class="bumen">'+bumen+'</dd> </dl> <dl class="ritem"> <dt>'+langData['siteConfig'][20][140]+'</dt> <dd class="zhiwei">'+zhiwei+'</dd> </dl> <dl class="ritem"> <dt>'+langData['siteConfig'][20][141]+'</dt> <dd class="neirong">'+neirong+'</dd> </dl> </div>');
      }
    });
    lookCon.find('.experienceCon').html(html.join(""));

    lookCon.find('.educational').text(getSelTxt($('#educational')));
    lookCon.find('.college').text($('#college').val());
    lookCon.find('.graduation').text($('#graduation').val());
    lookCon.find('.professional').text($('#professional').val());
    lookCon.find('.language').text($('#language').val());
    lookCon.find('.computer').text($('#computer').val());
    lookCon.find('.education').text($('#education').val());
    lookCon.find('.evaluation').text($('#evaluation').val());
    lookCon.find('.objective').text($('#objective').val());

    $('.myresume').addClass('show').animate({"left":"0"},100);

  })

  // 退出预览
  $('#lookback').click(function(){
    $('.myresume').animate({"left":"100%"},100);
    setTimeout(function(){
      $('.myresume').removeClass('show');
    }, 100)
  })



  // 工作经历
  var experienceHtml = '<div class="experience"><div class="ml4r"><dl class="inpbox"><dt><span><label for="company">'+langData['siteConfig'][20][354]+'</label></span></dt><dd><input type="text" class="inp company" placeholder="'+langData['siteConfig'][20][274]+'" id="company"></dd></dl></div><div class="ml4r"><dl class="inpbox ex_date"><dt><span>'+langData['siteConfig'][19][138]+'</span></dt><dd><div data-role="fieldcontain" class="dom_select date1"><input autocomplete="off" class="demo-test-date" placeholder="2017-01-01"></div><font>'+langData['siteConfig'][13][7]+'</font><div data-role="fieldcontain" class="dom_select date2"><input autocomplete="off" class="demo-test-date" placeholder="2017-01-01"></div></dd></dl></div><div class="ml4r"><dl class="inpbox"><dt><span>'+langData['siteConfig'][20][139]+'</span></dt><dd><input type="text" class="inp bumen" placeholder="'+langData['siteConfig'][20][275]+'"></dd></dl></div><div class="ml4r"><dl class="inpbox"><dt><span>'+langData['siteConfig'][20][140]+'</span></dt><dd><input type="text" class="inp zhiwei" placeholder="'+langData['siteConfig'][20][276]+'"></dd></dl></div><div class="mulinpbox mb4r"><p class="multit">'+langData['siteConfig'][20][141]+'</p><div class="mulcon"><textarea placeholder="'+langData['siteConfig'][7][0]+'" class="textarea"></textarea></div></div><div class="exbtn"><a href="javascript:;" class="btn add">'+langData['siteConfig'][6][136]+'</a><a href="javascript:;" class="btn del">'+langData['siteConfig'][6][8]+'</a></div></div>';

  var experienceHtml1 = '<div class="exbtn exbtn1"> <a href="javascript:;" class="btn add">'+langData['siteConfig'][6][18]+'</a></div>';

  $(".list").delegate('.add', "click", function(){
    $('.exbtn1').remove();

    var date1 = new Date().getTime();
    var date2 = new Date().getTime() + 1;

		var newexperience = $(experienceHtml);
		newexperience.appendTo("#experience");
		// newexperience.slideDown(300);
    var sct = newexperience.offset().top;
    //年月日
    $('.demo-test-date').scroller(
      $.extend({preset: 'date', dateFormat: 'yy-mm-dd'})
    );

    $('html,body').animate({
      'scrollTop':sct
    },300)
	});

  // 删除工作经历
  $(".list").delegate('.del', "click", function(){
    var p = $(this).closest('.experience'), num = p.siblings('.experience').length;
    p.addClass('del-load');
    // 不加延时不能应用新加的class样式?
    setTimeout(function(){
      if(confirm(langData['siteConfig'][20][211])){
        p.remove();
        if(num == 0){
          $('#experience').append(experienceHtml1);
        }
      }else{
        p.removeClass('del-load');
      }
    },100)
  });




  //提交发布
  $("#submit").bind("click", function(event){

    var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url"), tj = true;

    event.preventDefault();

    var t           = $(this),
        name        = $("#name"),
        birth       = $("#birth"),
        home        = $("#home"),
        address     = $("#address"),
        phone       = $("#phone"),
        email       = $("#email"),
        addr        = $("#addr"),
        type        = $("#type"),
        salary      = $("#salary"),
        startwork   = $("#startwork"),
        workyear    = $("#workyear"),
        educational = $("#educational"),
        error       = $(".error"),
        text        = error.find('p');

    if(t.hasClass("disabled")) return;

    if(name.val() == ""){
      showMsg(langData['siteConfig'][20][268]);
      tj = false;
    }

    else if(birth.val() == ""){
      showMsg(langData['siteConfig'][20][283]);
      tj = false;
    }

    else if(home.val() == ""){
      showMsg(langData['siteConfig'][20][269]);
      tj = false;
    }

    else if(address.val() == ""){
      showMsg(langData['siteConfig'][20][270]);
      tj = false;
      return false;
    }

    else if(phone.val() == ""){
      showMsg(langData['siteConfig'][20][27]);
      tj = false;
    }

    else if(!(/^1[34578]\d{9}$/.test(phone.val()))){
      showMsg(langData['siteConfig'][20][232]);
      tj = false;
    }

    else if(email.val() == ""){
      showMsg(langData['siteConfig'][20][31]);
      tj = false;
    }

    else if(!/\w+((-w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+/.test(email.val())){
      showMsg(langData['siteConfig'][20][178]);
      tj = false;
    }

    else if(addr.val() == "" || addr.val() == 0){
      showMsg(langData['siteConfig'][20][284]);
      tj = false;
		}

    else if(type.val() == "" || type.val() == 0){
      showMsg(langData['siteConfig'][20][285]);
      tj = false;
		}

		else if(salary.val() == ""){
      showMsg(langData['siteConfig'][20][286]);
      tj = false;
		}

		else if(startwork.val() == langData['siteConfig'][7][2] || startwork.val() == 0){
      showMsg(langData['siteConfig'][20][287]);
      tj = false;
		}

		else if(workyear.val() == ""){
      showMsg(langData['siteConfig'][20][288]);
      tj = false;
		}

		else if(educational.val() == langData['siteConfig'][7][2] || educational.val() == 0){
      showMsg(langData['siteConfig'][20][289]);
      tj = false;
		}

    if(!tj) return;

    var data = form.serialize();
    var imgli = $("#fileList li.thumbnail");
    if(imgli.length >= 1){
      var src = imgli.eq(0).find("img").attr("data-val");
      data += '&photo='+src;
    }

    var experience = [];
    $("#experience").find(".experience").each(function(){
      var t = $(this), company = $.trim(t.find(".company").val()), date1 = t.find(".date1 input").val(), date2 = t.find(".date2 input").val(), bumen = $.trim(t.find(".bumen").val()), zhiwei = $.trim(t.find(".zhiwei").val()), neirong = $.trim(t.find(".neirong").val());
      if(company != ""){
        experience.push(company+"$$"+date1+"$$"+date2+"$$"+bumen+"$$"+zhiwei+"$$"+neirong);
      }
    });

    data += "&experience=" + experience.join("|||||");

    $.ajax({
      url: action,
      data: data,
      type: "POST",
      dataType: "json",
      success: function (data) {
        if(data && data.state == 100){
          alert(langData['siteConfig'][6][39]);
        }else{
          alert(data.info)
          t.removeClass("disabled").html(langData['siteConfig'][11][0]);
          $("#verifycode").click();
        }
      },
      error: function(){
        alert(langData['siteConfig'][20][183]);
        t.removeClass("disabled").html(langData['siteConfig'][11][0]);
        $("#verifycode").click();
      }
    });

  });

  // 错误提示
  function showMsg(str){
    var o = $(".error");
    o.html('<p>'+str+'</p>').show();
    setTimeout(function(){o.hide()},1000);
  }

})
