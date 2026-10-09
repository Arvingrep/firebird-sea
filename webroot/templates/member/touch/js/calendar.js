// (function (_) {
//   _.fn.calendar
// })($)


function getCalendar(options){  //options表示显示几个月的数据
/**
  *  options 是个对象
  *    其中 type = -1时是向前数  否则是向后
  *
  *
*/
  var currDate = new Date();  //当前时间
  currDate = options?.showDate? new Date(options.showDate+'/1'):currDate;

  var defaultDataLength  = 1;  //默认获取两个月 的数据
  var monArr = [], dateArr = [];
  var mLen =   (options?.months)??defaultDataLength;
  if(options?.type == -1){
    var currMon = currDate.getMonth() + 1;  //当前月
    var currYear = currDate.getFullYear();  //当前年
    for(var i = 0; i < mLen; i++){
      currMon > 1 ? currMon-- : (currMon = 12, currYear--);
      var data = new Date(currYear, currMon); // 从当前月开始算 一共个6个月的数据
      dateArr.push(data);
    }
  }else{
    var currMon = currDate.getMonth() - 1;  //当前月
    var currYear = currDate.getFullYear();  //当前年
    for(var i = 0; i < mLen; i++){
      currMon <= 12 ? currMon++ : (currMon = 1, currYear++);
      var data = new Date(currYear, currMon); // 从当前月开始算 一共个6个月的数据
      dateArr.push(data);
    }
  }

  dateArr.forEach(function(val){
    var year = val.getFullYear();  //获取年份
    var month = val.getMonth() + 1;  //获取当前月份
    var nowweek = val.getDay(); // 当月1号是星期几
    var days = mGetDate(val);
    monArr.push({
      year:year,
      month:month,
      days: days,
      weekFirst:nowweek,
      weekdays:(days + nowweek)
    })
  })
  if(mLen == 1) {
    monArr = monArr[0];
    // console.log(monArr)
  }
  return monArr;
}


// 获取当前月的天数
function mGetDate(date){
  //构造当前日期对象
  var date = date;
  //获取年份
  var year = date.getFullYear();
  //获取当前月份
  var month = date.getMonth() + 1;
  var d = new Date(year, month, 0);
  return d.getDate();
}
