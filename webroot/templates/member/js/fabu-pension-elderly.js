$(function(){
  //国际手机号获取
  getNationalPhone();
  function getNationalPhone(){
    $.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'JSONP',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   var listLen = list.length;
                   var codeArea = list[0].code;
                   if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        $('.areaCode').hide();
                        $('.w-form .inp#tel').css({'padding-left':'10px','width':'175px'});
                        return false;
                   }
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li data-cn="'+list[i].name+'" data-code="'+list[i].code+'">'+list[i].name+' +'+list[i].code+'</li>');
                   }
                   $('.areaCode_wrap ul').append(phoneList.join(''));
                }else{
                   $('.areaCode_wrap ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                        $('.areaCode_wrap ul').html('<div class="loading">加载失败！</div>');
                    }

        })
  }
  //显示区号
  $('.areaCode').bind('click', function(){
    var areaWrap =$(this).closest("dd").find('.areaCode_wrap');
    if(areaWrap.is(':visible')){
      areaWrap.fadeOut(300)
    }else{
      areaWrap.fadeIn(300);
      return false;
    }
  });

  //选择区号
  $('.areaCode_wrap').delegate('li', 'click', function(){
    var t = $(this), code = t.attr('data-code');
    var par = t.closest("dd");
    var areaIcode = par.find(".areaCode");
    areaIcode.find('i').html('+' + code);
    $('#areaCode').val(code)
  });

  $('body').bind('click', function(){
    $('.areaCode_wrap').fadeOut(300);
  });

  function showErr(obj, type){
    if(type == 'suc'){
      obj.siblings('.tip-inline').removeClass().addClass("tip-inline success").show();
    }else{
      obj.siblings('.tip-inline').addClass("tip-inline error").html('<s></s>'+obj.data('title')).css('display','inline-block');
    }
  }

  $("#submit").bind("click", function(e){
    e.preventDefault();
    $('#addrid').val($('.addrBtn').attr('data-id'));
    var addrids = $('.addrBtn').attr('data-ids').split(' ');
    $('#cityid').val(addrids[0]);
    var t              = $(this),
        offsetTop      = 0,
        elderlyname    = $("#elderlyname"),
        addrid         = $("#addrid").val(),
        address        = $("#address"),
        people         = $("#people"),
        tel            = $("#tel"),
        relationship   = $("#relationship");
    var form = $("#fabuForm"), action = form.attr("action");

    if(t.hasClass("disabled")) return;

    if(elderlyname.val() == ''){
      showErr(elderlyname);
      offsetTop = offsetTop == 0 ? elderlyname.closest('dl').offset().top : offsetTop;
    }

    if(offsetTop == 0 && (addrid == '' || addrid == 0) ){
      $.dialog.alert(langData['siteConfig'][28][63]);   //请选择所在地
      offsetTop = offsetTop == 0 ? $('.addrBtn').closest('dl').offset().top : offsetTop;
    }

    if(address.val() == ''){
      showErr(address);
      offsetTop = offsetTop == 0 ? address.closest('dl').offset().top : offsetTop;
    }

    if(people.val() == ''){
      showErr(people);
      offsetTop = offsetTop == 0 ? people.closest('dl').offset().top : offsetTop;
    }

    if(tel.val() == ''){
      showErr(tel);
      offsetTop = offsetTop == 0 ? tel.closest('dl').offset().top : offsetTop;
    }

    if(relationship.val() == ''){
      showErr(relationship);
      offsetTop = offsetTop == 0 ? relationship.closest('dl').offset().top : offsetTop;
    }

    if(offsetTop){
      $('html,body').animate({'scrollTop':offsetTop}, 500);
      return false;
    }

    $.ajax({
			url: action,
			data: form.serialize(),
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){

					$.dialog({
						title: langData['siteConfig'][19][287],
						icon: 'success.png',
						content: data.info,
						ok: function(){}
					});
					t.removeClass("disabled").html(langData['siteConfig'][6][63]);

				}else{
					$.dialog.alert(data.info);
					t.removeClass("disabled").html(langData['siteConfig'][6][63]);
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
				t.removeClass("disabled").html(langData['siteConfig'][6][63]);
			}
		});

  });


  
})