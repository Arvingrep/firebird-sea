$(function(){

  //APP端取消下拉刷新
  toggleDragRefresh('off');
  
  $('#subForm').submit(function(e){
    e.preventDefault();
  })
  $('.submit').click(function(){
    var t = $(this), f = $('#subForm');
    if(t.hasClass('disabled')) return;

    var ids = $('.gz-addr-seladdr').attr('data-ids');
    if(ids == undefined || ids == ""){
      alert(langData['siteConfig'][20][131]);//请选择服务区域
      return false;
    }
    var cityid = ids.split(' ')[0];
    $('#cityid').val(cityid);

    t.addClass('disabled');

    $.ajax({
      url: '/include/ajax.php?service=house&action=configZjUserGroup',
      type: 'post',
      data: f.serialize(),
      dataType: 'json',
      success: function(data){
        if(data && data.state == 100){
          $('.goBack').click();
        }else{
          alert(data.info);
          t.removeClass('disabled');
        }
      },
      error: function(){
        alert(langData['siteConfig'][6][203]);//网络错误，请重试！
        t.removeClass('disabled');
      }
    })
  })

})