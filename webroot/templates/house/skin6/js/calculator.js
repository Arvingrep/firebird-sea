var decrease = 0;
var poputData = '';

$(function(){

	//控制输入框只能输入数字
	var inputs = $('input[data-type="number"]');

  var keypressFunction = this.keypressFunction = function (e) {
      var code = (e.keyCode ? e.keyCode : e.which); //firefox IE      
      if (!/msie/.test(navigator.userAgent.toLowerCase()) && (e.keyCode == 0x8) || code == 9)  //firefox does not suppor backspace
      {
          return;
      }
      var text = $(this).val() + String.fromCharCode(code);
      var hasError = false;
      if ((code < 48 || code > 57) && isNaN(text)) {
          hasError = true;
      }
      return !hasError;
  };

  inputs.bind("keypress", keypressFunction);

  var blurFunction = this.blurFunction = function () {
      if (this.value.lastIndexOf(".") == (this.value.length - 1)) {
          this.value = this.value.substr(0, this.value.length - 1);
      } else if (isNaN(this.value)) {
          this.value = "";
      }
  }

  inputs.bind("blur", blurFunction);

  var dragenterFunction = this.dragenterFunction = function () {
      return false;
  };

  inputs.bind("dragenter", dragenterFunction);

  var keyupFunction = this.keyupFunction = function () {
      if (/(^0+)/.test(this.value)) {
          this.value = this.value.replace(/^0*/, '');
      }
  }
  inputs.bind("keyup", keyupFunction);

  //验证输入是否为空
  inputs.blur(function () {
      var $this = $(this), value = $this.val();
      if ($.trim(value) === '') {
          $this.addClass('error_txt');
          $this.closest("dd").find(".error_msg").css('visibility', 'visible');
      }
  })
  .focus(function () {
      var $this = $(this);
      $this.removeClass('error_txt');
      $this.closest("dd").find(".error_msg").css('visibility', 'hidden');
  });


  //模拟下拉菜单
  $(".sel-con").hide();
  $(".sel").bind("click", function(){
  	$(this).next(".sel-con").fadeIn(200);
  	return false;
  });

  $(".sel-con a").bind("click", function(){
  	var t = $(this), txt = t.text(), li = t.parent(), sel = t.closest("ul").prev(".sel").find("span");
  	sel.html(txt);
  	li.addClass("curr").siblings("li").removeClass("curr");
  });

  $(document).click(function(event){
		$(".sel-con").fadeOut(200);
	});

	//气泡提示
	$(".tips").hover(function(){
		$(this).find(".tips_div").show();
	}, function(){
		$(this).find(".tips_div").hide();
	});


  // 计算方式切换
  $("input[name=mode]").bind("click", function(){
    var type = $(this).data("type");
    $(".mode-item").hide();
    $(".mode-item."+type).show();
  });


  //等额本金还款明细
  $(".mx").bind("click", function(){

    $.dialog({
      fixed: true,
      title: "等额本金每月还款明细",
      content: (decrease != 0 ? '<div class="mxtit">每月递减：<strong>'+decrease+'</strong>'+echoCurrency('short')+'</div>' : '')+'<ul class="bj_popup">'+poputData+'</ul>',
      width: 460
    });

  });

});