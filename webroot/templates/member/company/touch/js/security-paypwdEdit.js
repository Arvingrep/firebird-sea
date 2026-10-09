$(function(){

  //设置支付密码
	$("#paypwdAdd").bind("click", function(){
		var pay1 = $("#pay1"), pay2 = $("#pay2"), passwordStrengthDiv = $("#passwordStrengthDiv").attr("class"), btn = $(this);
		if($.trim(pay1.val()) == ""){
			showMsg(langData['siteConfig'][20][213]);
			pay1.focus();
			return "false";
		}
		if(passwordStrengthDiv == "" || passwordStrengthDiv == undefined || Number(passwordStrengthDiv.replace("is", "")) < 50){
			showMsg(langData['siteConfig'][20][241]);
			pay1.focus();
			return "false";
		}
		if($.trim(pay2.val()) == ""){
			showMsg(langData['siteConfig'][5][21]);
			pay2.focus();
			return "false";
		}
		if(pay1.val() != pay2.val()){
			showMsg(langData['siteConfig'][20][242]);
			pay2.focus();
			return "false";
		}

    var param = "pay1="+pay1.val()+"&pay2="+pay2.val();
    modifyFun(btn,langData['siteConfig'][6][128],'paypwdAdd',param);

});

		$(".editForm #pay1").passwordStrength();


    $('.tab li').click(function(){
      var t = $(this), index = t.index(), editForm = $('.editForm');
      t.addClass('curr').siblings('li').removeClass('curr');
      editForm.hide().eq(index).show();
    })


  //修改支付密码
  $("#paypwdEdit").bind("click", function(){
    var old = $("#old"), newest = $("#new"), confirm = $("#confirm"), passwordStrengthDiv = $("#passwordStrengthDiv").attr("class"), btn = $(this);

    if(btn.hasClass('disabled')) return;

    if(old.val() == ""){
      showMsg(langData['siteConfig'][20][83]);
      old.focus();
      return "false";
    }
    if(newest.val() == ""){
      showMsg(langData['siteConfig'][20][84]);
      newest.focus();
      return "false";
    }
    if(passwordStrengthDiv == "" || passwordStrengthDiv == undefined || Number(passwordStrengthDiv.replace("is", "")) < 50){
      showMsg(langData['siteConfig'][20][241]);
      newest.focus();
      return "false";
    }
    if(confirm.val() == ""){
      showMsg(langData['siteConfig'][5][21]);
      confirm.focus();
      return "false";
    }
    if(newest.val() != confirm.val()){
			showMsg(langData['siteConfig'][20][242]);
      confirm.focus();
      return "false";
    }

    var param = "old="+old.val()+"&new="+newest.val()+"&confirm="+confirm.val();
    modifyFun(btn,langData['siteConfig'][6][128],'paypwdEdit',param);

  });

    $(".editForm #new").passwordStrength();

    //重置支付密码
  	$("#paypwdReset").bind("click", function(){
  		opera = "paypwd";
  		authentication(bindPaypwdUrl);
  	});

    $('.checkway').change(function(){
      var t = $(this), val = t.val();
      if (!val == "") {
        $('.authlist .item').hide();
        $('.authlist .item'+val).show();
      }else {
        $('.authlist .item').hide();
      }

    })

    //短信验证
    $("html").delegate("#getPhoneAuthVerify", "click", function(){
      var t = $(this);

      if(t.hasClass("disabled")) return false;
      t.addClass("disabled");
      t.html('<img src="'+staticPath+'images/loading_16.gif" /> '+langData['siteConfig'][7][3]+'...');

      $('.edit-tip').text(langData['siteConfig'][20][101], "");

      $.ajax({
        url: masterDomain+"/include/ajax.php?service=siteConfig&action=getPhoneVerify&type=auth",
        type: "POST",
        dataType: "jsonp",
        success: function (data) {
          //获取成功
          if(data && data.state == 100){
            countDown(t);

          //获取失败
          }else{
            t.removeClass("disabled").html(langData['siteConfig'][4][4]);
            showMsg(data.info);
          }
        }
      });

      $("#vdimgck").focus();
    });

    var wait = 60;
    function countDown(t) {
      if (wait == 0) {
        t.removeClass("disabled");
        t.html(langData['siteConfig'][4][2]);
        wait = 60;
      } else {
        t.addClass("disabled");
        t.html(langData['siteConfig'][20][234].replace('1', wait));
        wait--;
        setTimeout(function() {
          countDown(t)
        }, 1000);
      }
    }



  	//验证身份信息
  	function authentication(url){
  		if(phoneCheck == 1 || emailCheck == 1 || questionSet == 1){

  			returnUrl = url;
  			authVerifyFun();
  			$(".ui_buttons").hide();

  		}else{
  			showMsg(langData['siteConfig'][20][235]);
  		}
  	}

  	//异步提交修改
  	function authVerifyFun(){
  		var button = [{
  					id: "okBtn",
  					name: langData['siteConfig'][6][32],
  					callback: function(){

  						if(verifyFunc() == "false") return false;
  						var t = this;

  						t.button({
  							id:'okBtn',
  							name: langData['siteConfig'][7][8]+'...',
  							disabled: true
  						});

  						$.ajax({
  							url: masterDomain+"/include/ajax.php?service=member&action=authentication&do="+verifyType+"&opera="+opera,
  							data: verifyData(),
  							type: "POST",
  							dataType: "jsonp",
  							success: function (data) {
  								if(data && data.state == 100){
  									t.button({
  										id:'okBtn',
  										name: langData['siteConfig'][20][244],
  										disabled: true
  									});

  									showMsg(data.info, "success");
  									setTimeout(function(){
  										authVerifyPop.close();
  										location.href = returnUrl;
  									}, 1000);

  								}else{
  									showMsg(data.info, "error");
  									t.button({
  										id:'okBtn',
  										name: langData['siteConfig'][6][32],
  										disabled: false
  									});
  								}
  							}
  						});

  						return false;
  					},
  					focus: true
  				}]
  	}


})

function modifyFun(btn, btnstr, type, param, func){
  var data = param == undefined ? '' : param;
  btn.addClass('disabled').text(langData['siteConfig'][6][35]+'...');
  $.ajax({
    url: masterDomain+"/include/ajax.php?service=member&action=updateAccount&do="+type,
    data: data,
    type: "POST",
    dataType: "jsonp",
    success: function (data) {
      if(data && data.state == 100){
        alert(data.info);
        location.href = pageUrl;
      }else{
        alert(data.info);
        btn.removeClass('disabled').text(btnstr);
      }
    },
    error: function(){
      alert(langData['siteConfig'][20][183]);
      btn.removeClass('disbaled').text(btnstr);
    }
  })
}


// 错误提示
function showMsg(str){
  var o = $(".error");
  o.html('<p>'+str+'</p>').show();
  setTimeout(function(){o.hide()},1000);
}
