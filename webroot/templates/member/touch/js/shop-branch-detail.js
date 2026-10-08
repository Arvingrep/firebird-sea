$(function(){

  //APP端取消下拉刷新
  toggleDragRefresh('off');


  // 表单提交
  $(".tjBtn").bind("click", function(event){

		event.preventDefault();

		var t           = $(this),
        people     = $("#people"),
        telphone     = $("#telphone");

		if(t.hasClass("disabled")) return;

    // 联系人
    if($.trim(people.val()) == ''){
        showErrAlert('请输入联系人');
        return
    }
    // 联系电话
    if($.trim(telphone.val()) == ''){
        showErrAlert('请输入联系电话');
        return
    }


		var form = $("#fabuForm"), action = form.attr("action"),url = form.attr("data-url");
    var data = form.serialize();
    t.addClass('disabled').find('a').html('保存中');
		$.ajax({
			url: action,
			data: data,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
          showErrAlert(langData['siteConfig'][6][39])
          setTimeout(function(){
            window.location.href=url;
          },500)
				}else{
          showErrAlert(data.info)
				}
        t.removeClass('disabled').find('a').html('保存设置');
			},
			error: function(){
				showErrAlert(langData['siteConfig'][20][183]);
        t.removeClass('disabled').find('a').html('保存设置');
			}
		});


  });


})


