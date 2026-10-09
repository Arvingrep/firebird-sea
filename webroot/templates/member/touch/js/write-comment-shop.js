$(function(){

  // 选择好评、中评、差评
  $('.pleased li').click(function(){
    $(this).addClass('on').siblings('li').removeClass('on');
  })

  // 店铺评分
  $('.pingfen i').click(function(){
    var t = $(this);
    t.addClass('on');
    t.prevAll().addClass('on');
    t.nextAll().removeClass('on');
  })
  //匿名
  $('.anony').click(function(){
    var t = $(this);
    if(!$(this).hasClass('curr')){
      t.addClass('curr');
      $('#anonymous').val(1);
    }else{
      t.removeClass('curr');
      $('#anonymous').val(0);
    }  
  })
  $('.header .goBack').click(function(){
    var popOptions = {
        title:'确定要退出评价？',
        confirmTip:'退出后编辑过的内容将不再保留',
        btnColor:'#EC3628',
        btnCancelColor:'#000',
        isShow:true
    }
    confirmPop(popOptions,function(){
      history.go(-1);
    });
    return false;
  })


  //提交评价
  $("#commonBtn").bind("click", function(){

    var idArr = [], ratingArr = [], score1Arr = [], score2Arr = [], score3Arr = [], noteArr = [], imgArr = [], t = $(this), tj = true;

    if(t.hasClass('disabled')) return;

    $(".comment").each(function(){
      var obj = $(this), pid = obj.data("id"), speid = obj.data("speid"), specation = obj.data("specation"),
          rating = obj.find('.pleased li.on').attr('data-id'),
          score1 = obj.find("[data-id='score"+pid+"_"+speid+"1']").find('.on').length,
          score2 = obj.find("[data-id='score"+pid+"_"+speid+"2']").find('.on').length,
          score3 = obj.find("[data-id='score"+pid+"_"+speid+"3']").find('.on').length,
          note   = obj.find(".selftxt").html();

      var img = [];
      obj.find('#fileList0 li.thumbnail').each(function(){
        var src = $(this).find("img").attr("data-val");
        if(src != ''){
          img.push(src);
        }
      });

      if(rating == undefined){
        alert(langData['siteConfig'][20][396]);
        tj = false;
        return false;
      }

      if(score1 == 0){
        alert(langData['siteConfig'][20][397]);
        tj = false;
        return false;
      }

      if(score2 == 0){
        alert(langData['siteConfig'][20][398]);
        tj = false;
        return false;
      }

      if(score3 == 0){
        alert(langData['siteConfig'][20][399]);
        tj = false;
        return false;
      }

      if(note == ""){
        alert(langData['siteConfig'][20][40]);
        tj = false;
        return false;
      }

      ratingArr.push("rating["+pid+"_"+speid+"]="+rating);
      score1Arr.push("sco1["+pid+"_"+speid+"]="+score1);
      score2Arr.push("sco2["+pid+"_"+speid+"]="+score2);
      score3Arr.push("sco3["+pid+"_"+speid+"]="+score3);
      noteArr.push("content["+pid+"_"+speid+"]="+note);
      imgArr.push("pics["+pid+"_"+speid+"]="+img.join(","));
    });

    if(tj){
      var anony = $("#anonymous").val();
      var data = "aid=" + id + "&" + ratingArr.join("&") + "&" + score1Arr.join("&") + "&" + score2Arr.join("&") + "&" + score3Arr.join("&") + "&" + noteArr.join("&") + "&" + imgArr.join("&") + "&type=shop-order&isanony="+anony;

      t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");
      
  		$.ajax({
  			url: masterDomain+"/include/ajax.php?service=member&action=sendComment",
  			data: data,
  			type: "POST",
  			dataType: "jsonp",
  			success: function (data) {
  				if(data && data.state == 100){
            $('.shopComWrap').hide();
            $('.shopcomSuc').show();
            $('body,html').css('background','#fff');
  				}else{
  					showErrAlert(data.info);
  					t.removeClass("disabled").html(langData['siteConfig'][8][3]);
  				}
  			},
  			error: function(){
  				showErrAlert(langData['siteConfig'][20][183]);
  				t.removeClass("disabled").html(langData['siteConfig'][8][3]);
  			}
  		});

    }

  });



});
