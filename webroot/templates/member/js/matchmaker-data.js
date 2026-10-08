$(function(){

	//出生日期
	$("#birthday").click(function(){
		WdatePicker({
			el: 'birthday',
			isShowClear: false,
			isShowOK: false,
			isShowToday: false,
			qsEnabled: false,
			maxDate: '%y-%M-%d',
			onpicking: function(dp){
			}
		});
	});

	//提交
	$("#submit").bind("click", function(event){
		event.preventDefault();
		$('#addr').val($('#selAddr .addrBtn').attr('data-id'));

		var t = $(this), form = $("#fabuForm"), serialize = form.serialize(), action = form.attr("action");
		t.attr("disabled", true).html(langData['siteConfig'][6][35]+'...');
	});
	//添加新会员弹窗
	$('#add-maker').click(function(){
		$('.desk').show();
		$('#add-member-popup').show();
	})
	//添加标签
  	$(".tags_enter").blur(function() { //焦点失去触发 
	    var txtvalue=$(this).val().trim();
	    if(txtvalue!=''){
	      addTag($(this));
	      $(this).parents(".tags").css({"border-color": "#d5d5d5"})
	    }
  	}).keydown(function(event) {
	    var key_code = event.keyCode;
	    var txtvalue=$(this).val().trim(); 
	    if (key_code == 13&& txtvalue != '') { //enter
	      addTag($(this));
	    }
	    if (key_code == 32 && txtvalue!='') { //space
	      addTag($(this));
	    }
  	});
	$(".close").live("click", function() {
	  $(this).parent(".tag").remove();
	});
	$(".tags").click(function() {
	  $(this).css({"border-color": "#f59942"})
	}).blur(function() {
	  $(this).css({"border-color": "#d5d5d5"})
	})
  	checkInfo = function(event,self){
	    if (event.keyCode == 13) {
	      event.cancleBubble = true;
	      event.returnValue = false;
	      return false;
	    }
  	}
  	function addTag(obj) {
  	var tag = obj.val();
    if (tag != '') {
      	var i = 0;
      	$(".tag").each(function() {
        	if ($(this).text() == tag + "×") {
          	$(this).addClass("tag-warning");
          	setTimeout("removeWarning()", 400);
          	i++;
        }
    })
	    obj.val('');
	    if (i > 0) { //说明有重复
	      return false;
	    }
    	$("#form-field-tags").before("<span class='tag'>" + tag + "<button class='close' type='button'>×</button></span>"); //添加标签
    	}
  	}
  	function removeWarning() {
    	$(".tag-warning").removeClass("tag-warning");
  	}
	

	
})