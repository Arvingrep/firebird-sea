$(function(){

  // 选择好评、中评、差评
  $('.widgt li').click(function(){
    $(this).addClass('on').siblings('li').removeClass('on');
  })

  // 店铺评分
  $('.pingfen i').click(function(){
    var t = $(this);
    t.addClass('on');
    t.prevAll().addClass('on');
    t.nextAll().removeClass('on');
  })





  //提交评价
  $("#commonBtn").bind("click", function(){

    var idArr = [], ratingArr = [], score1Arr = [], score2Arr = [], score3Arr = [], noteArr = [], imgArr = [], t = $(this), tj = true;

    if(t.hasClass('disabled')) return;

    $(".comment").each(function(){
      var obj = $(this), pid = obj.data("id"),
          rating = obj.find('.widgt li.on').attr('data-id'),
          score1 = obj.find("[data-id='score"+pid+"1']").find('.on').length,
          score2 = obj.find("[data-id='score"+pid+"2']").find('.on').length,
          score3 = obj.find("[data-id='score"+pid+"3']").find('.on').length,
          note   = obj.find("textarea").val();

      var img = [];
      obj.find('#litpic li.item').each(function(){
        var src = $(this).find("img").attr("data-val");
        if(src != ''){
          img.push(src);
        }
      });

      if(rating == undefined){
        alert(langData['siteConfig'][20][396]); //请选择商品评价
        tj = false;
        return false;
      }

      if(score1 == "0"){
        alert(langData['siteConfig'][20][397]); //请给商品描述打分
        tj = false;
        return false;
      }

      if(score2 == "0"){
        alert(langData['siteConfig'][20][398]); //请给商家服务打分
        tj = false;
        return false;
      }

      if(score3 == "0"){
        alert(langData['siteConfig'][20][399]); //请给商品质量打分
        tj = false;
        return false;
      }

      if(note == ""){
        alert(langData['siteConfig'][20][400]); //请输入评价内容
        tj = false;
        return false;
      }

      ratingArr.push("rating["+pid+"]="+rating);
      score1Arr.push("score1["+pid+"]="+score1);
      score2Arr.push("score2["+pid+"]="+score2);
      score3Arr.push("score3["+pid+"]="+score3);
      noteArr.push("note["+pid+"]="+note);
      imgArr.push("img["+pid+"]="+img.join(","));
    });

    if(tj){
      var data = "orderid=" + id + "&" + ratingArr.join("&") + "&" + score1Arr.join("&") + "&" + score2Arr.join("&") + "&" + score3Arr.join("&") + "&" + noteArr.join("&") + "&" + imgArr.join("&");

      t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");//提交中

  		$.ajax({
  			url: masterDomain+"/include/ajax.php?service=home&action=sendCommon",
  			data: data,
  			type: "POST",
  			dataType: "jsonp",
  			success: function (data) {
  				if(data && data.state == 100){
  					alert(langData['siteConfig'][20][196]);//评价成功！
            location.reload();
  				}else{
  					alert(data.info);
  					t.removeClass("disabled").html(langData['siteConfig'][8][3]);//发表评价
  				}
  			},
  			error: function(){
  				alert(langData['siteConfig'][6][203]);//网络错误，请重试！
  				t.removeClass("disabled").html(langData['siteConfig'][8][3]);//发表评价
  			}
  		});

    }

  });



});
