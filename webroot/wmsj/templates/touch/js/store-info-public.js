function formSubmit(dotype){
	msg.show('', langData['siteConfig'][7][9]);
	var form = $("#submitForm"), btn = $('.submit');
	btn.addClass('disabled');

    $.ajax({
      url: '?id='+sid,
      type: "post",
      data: form.serialize()+'&dotype='+dotype,
      dataType: "json",
      success: function(res){
          msg.show('', res.info, 'auto');
          if(res.state == 100){
            location.href = '/wmsj/shop/manage-store.php?sid='+sid;
          }else{
            msg.show('', res.info, 'auto');
            btn.removeClass("disabled");
          }
      },
      error: function(){
      		msg.show('', langData['siteConfig'][20][253], 'auto');
          	btn.removeClass("disabled");
      }
    })
}
