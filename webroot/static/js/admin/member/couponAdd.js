$(function(){
  $("#expire").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 3, language: 'ch'});

  $("#editform").submit(function(e){
    e.preventDefault();
    var f = $(this),
        t = $('#btnSubmit'),
        amount = $('#amount'),
        count = $('#count'),
        expire = $('#expire');

    if(amount.val() == "" || amount.val() <= 0){
      $.dialog.alert('请输入金额');
      return;
    }
    if(expire.val() == ""){
      $.dialog.alert('请输入过期时间');
      return;
    }

    $.ajax({
      url: '?',
      type: 'post',
      data: f.serialize(),
      dataType: 'json',
      success: function(data){
        if(data && data.state == 100){
          $.dialog({
            title: '提示信息',
            icon: 'success.png',
            content: data.info,
            ok: function(){
              location.reload();
            },
            cancel: function(){
              location.reload();
            }
          })
        }else{
          $.dialog.alert(data.info);
          t.attr('disabled', false);
        }
      },
      error: function(){
        $.dialog.alert('网络错误，请重试');
        t.attr('disabled', false);
      }
    })
  })
})