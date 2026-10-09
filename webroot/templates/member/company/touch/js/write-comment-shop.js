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
      var obj = $(this), pid = obj.data("id"), speid = obj.data("speid"), specation = obj.data("specation"),
          rating = obj.find('.widgt li.on').attr('data-id'),
          score1 = obj.find("[data-id='score"+pid+"_"+speid+"1']").find('.on').length,
          score2 = obj.find("[data-id='score"+pid+"_"+speid+"2']").find('.on').length,
          score3 = obj.find("[data-id='score"+pid+"_"+speid+"3']").find('.on').length,
          note   = obj.find("textarea").val();

      var img = [];
      obj.find('#litpic li.item').each(function(){
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
      var data = "aid=" + id + "&" + ratingArr.join("&") + "&" + score1Arr.join("&") + "&" + score2Arr.join("&") + "&" + score3Arr.join("&") + "&" + noteArr.join("&") + "&" + imgArr.join("&") + "&type=shop-order";

      t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

  		$.ajax({
  			url: masterDomain+"/include/ajax.php?service=member&action=sendComment",
  			data: data,
  			type: "POST",
  			dataType: "jsonp",
  			success: function (data) {
  				if(data && data.state == 100){
  					alert(langData['siteConfig'][20][196]);
            location.reload();
  				}else{
  					alert(data.info);
  					t.removeClass("disabled").html(langData['siteConfig'][8][3]);
  				}
  			},
  			error: function(){
  				alert(langData['siteConfig'][20][183]);
  				t.removeClass("disabled").html(langData['siteConfig'][8][3]);
  			}
  		});

    }

  });



});
