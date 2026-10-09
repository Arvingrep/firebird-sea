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
    var areaWrap =$(this).closest("#f_submit").find('.areaCode_wrap');
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
    var par = t.closest("#f_submit");
    var areaIcode = par.find(".areaCode");
    areaIcode.find('i').html('+' + code);
  });

  $('body').bind('click', function(){
    $('.areaCode_wrap').fadeOut(300);
  });

	$("#f_submit").submit(function(event){
		event.preventDefault();
		var body = $("#body").val(), people = $("#people").val(), phone = $("#phone").val();
        var areaCode = $(".areaCode i").text().replace('+', '');
		var data = [];
		data.push("body="+encodeURIComponent(body));
		data.push("people="+encodeURIComponent(people));
		data.push("phone="+encodeURIComponent(phone));
		data.push("areaCode="+areaCode);
		data.push("typeid="+typeid);

		$.ajax({
			url: "/include/ajax.php?service=house&action=fabuFaq&"+data.join("&"),
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data.state == 100){
					alert('提交成功！');
					location.reload();
				}else{
					alert(data.info);
				}
			},
			error: function(){
				alert('网络错误，提交失败！');
			}
		});

	})

})
