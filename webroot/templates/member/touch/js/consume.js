//消费金2021-12-13
$(function(){
  getList();
  function getList(){
    $.ajax({
      url: "/include/ajax.php?service=member&action=bonus&page=1&pageSize=6",
      type: "GET",
      dataType: "json",
      success: function (data) {
        if(data && data.state == 100){
          var list = data.info.list, html=[];
          if(list.length > 0){
            for(var i = 0; i < list.length; i++){
              var recordurltext = recordurl+'?recordid='+list[i].id;
              if(list[i].is_open == 0){
                recordurltext = 'javascript:;'
              }
              html.push('<li><a href="'+recordurltext+'">');
              html.push('  <h3><span>'+list[i].info+'</span><strong class="'+(list[i].type == 1 ? " plus" : " ")+'">'+(list[i].type == 1 ? "+" : "-")+Number(list[i].amount).toFixed(2)+'</strong></h3>');
              var dateA = list[i].date.split(' ');
              var sfar = dateA[1].split(':');
              var sf = sfar[0]+':'+sfar[1];
              html.push('  <p><em>'+addDateInV1_2(dateA[0])+'</em>'+sf+'</p>');
              html.push('</a></li>');
            }
            $('.xfList').show();
            $('.xfList ul').html(html.join(''))
          }
        }
      },
      error: function(){

      }
    })
  }


})
function addDateInV1_2(strDate){
  var d = new Date();
  var day = d.getDate();
  var month = d.getMonth() + 1;
  var year = d.getFullYear();
  var dateArr = strDate.split('-');
  var tmp;
  var monthTmp;
  if(dateArr[0] == year){//今年
    if(dateArr[1] == month){//当月
      if(dateArr[2] == day){//今天
        return langData['siteConfig'][13][24];//今天
      }else{
        return dateArr[1]+'-'+dateArr[2]
      }
    }else{
      return dateArr[1]+'-'+dateArr[2]
    }

  }else{
    return strDate;
  }
  // if(dateArr[2].charAt(0) == '0'){
  //  tmp = dateArr[2].substr(1);
  // }else{
  //  tmp = dateArr[2];
  // }
  // if(dateArr[1].charAt(0) == '0'){
  //  monthTmp = dateArr[1].substr(1);
  // }else{
  //  monthTmp = dateArr[1];
  // }
  // if(day == tmp && month == monthTmp && year == dateArr[0]){
  //  return langData['siteConfig'][13][24];//今天
  // }else{
  //  return dateArr[0] + langData['siteConfig'][13][14] + monthTmp + langData['siteConfig'][13][18] + tmp + langData['siteConfig'][13][25];//今天--月--日
  // }
}
// 错误提示
function showMsg(str){
  var o = $(".error");
  o.html('<p>'+str+'</p>').show();
  setTimeout(function(){o.hide()},1000);
}
