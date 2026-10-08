'use strict';

// 日期选择插件(自定义)

var date = function ($) {

  $.fn.hotelDate = function (options) {

    var nowdate = new Date(); // 获取当前时间
    var dateArr = new Array(); // 获取到的时间数据集合
    var btn = $(this);
    btn.on('click', initTemplate); // 初始化(显示)插件

    // 初始化模板
    function initTemplate() {
    	$('.mask').fadeIn();
      var oldYear = new Date().getFullYear()
      var oldMonth = new Date().getMonth()+1;
      var oldDay = new Date().getDate()
      var todayDate = oldYear+'-'+oldMonth+'-'+oldDay
      var chosedDate = btn.val();
      console.log(chosedDate)


      var listIndex = 0;
      
      $('body').css({
        overflow: 'hidden'
      });
      // 主容器模板
      var dateTemplate = '\n        <div class =\'date container c-gray\'>\n        <div class=\'date-header\'>\n  <h4 class="tac bold">选择日期</h4>\n          <ul class=\'week border-bottom\'><li>\u65E5</li><li>\u4E00</li><li>\u4E8C</li><li>\u4E09</li><li>\u56DB</li><li>\u4E94</li><li>\u516D</li></ul>\n    </div>\n  <div class=\'date-content\'>\n   </div>\n        <div class=\'sure-btn\'>确定</div>\n   <div class=\'close-btn\'><a href="javascript:;">取消</a></div>\n        </div>      \n     ';
	
      //$('body').append(dateTemplate); // 向body添加插件
      $('.date-wrap').append(dateTemplate); // 向body添加插件
	   $('.date-wrap').animate({'bottom': '0',}, 100);
      // action容器模板
      dateArr.forEach(function (item, index) {
        var template = '\n          <div class=\'action mt10\'>\n            <div class=\'line\'><div class=\'title tac c-blue\'><div class="m">' + (item.getMonth() + 1) + '</div>\u6708<div class="y">' + item.getFullYear() + '</div></div></div>\n                      <ul class=\'day f-small\'></ul>\n          </div>        \n        ';
        $('.date-content').append(template);
      });

      // 天数模板 
      $('.action').each(function (index, item) {

        var days = getDays(dateArr[index]); // 当月天数
        var nowweek = dateArr[index].getDay(); // 当月1号是星期几
        for (var i = 0; i < days + nowweek; i++) {
          var template = '';
          // 空白填充
          if (i < nowweek) {
            template = '<li></li>';
          } else if (i < nowdate.getDate() + nowweek - 1 && dateArr[index].getMonth() === nowdate.getMonth()) {
            // 当月已经过去的日期 不能点击
            listIndex++;
            template = '<li index=\'' + listIndex + '\' class=\'disable\'><span>' + (i - nowweek + 1) + '<span></p></li>';
          } else{
            listIndex++;
      			var date = dateArr[index].getFullYear() + '-' + (dateArr[index].getMonth() + 1) + '-' + (i - nowweek + 1);
      			var stdate = new Date(date);
      			var clsname2 = date==todayDate?" current":""
            var clsname = date==chosedDate?"chosed":""
				    template = '<li index=\'' + listIndex + '\' data-date="'+date+'"  class="'+clsname+clsname2+'"><span>' + (i - nowweek + 1) + '</span></li>';          
          }
          $(item).find('.day').append(template);

        }
      });

      // 事件监听
      // 关闭插件
      $('.sure-btn').on('click', function () {      	

        $('.mask').fadeOut();
        var date = $('.day li.chosed').attr('data-date');
        if(date!=undefined){
          btn.addClass('hastime').val(date);
          $('.timeStart s').show();
          $('.timeStart input.clock').show();
          $('#clockChose').click();
        }
        
        $('.date').remove(); // 移除插件
        $('.date-wrap').animate({'bottom': '-100%',}, 100);
        $('body').css({ overflow: 'auto' });

      });
			
			//关闭
			$('.close-btn,.mask').click(function(){
				$('.date').remove(); // 移除插件
        $('.date-wrap').animate({'bottom': '-100%',}, 100);
				$('.mask').fadeOut();
			})
      var num = 0;
      // 时间选择
      $('.day li').on('click', function () {
		    var t = $(this);
        if (!$(this).hasClass('disable')) {
            $('.day li').removeClass("chosed");
      			t.addClass("chosed");
      	}
      });
    }
    // 获取num个月的时间数据
    function getDate(num) {

      var year = nowdate.getFullYear();
      var month = nowdate.getMonth() - 1;

      for (var i = 0; i < num; i++) {
        month <= 12 ? month++ : (month = 1, year++);
        var data = new Date(year, month); // 从当前月开始算 一共个2个月的数据
        dateArr.push(data);
      }
	  
    }

    // 获取当月天数
    function getDays(date) {
      //构造当前日期对象
      var date = date;
      //获取年份
      var year = date.getFullYear();
      //获取当前月份
      var mouth = date.getMonth() + 1;
      //定义当月的天数；
      var days;
      //当月份为二月时，根据闰年还是非闰年判断天数
      if (mouth == 2) {
        days = year % 4 == 0 ? 29 : 28;
      } else if (mouth == 1 || mouth == 3 || mouth == 5 || mouth == 7 || mouth == 8 || mouth == 10 || mouth == 12) {
        //月份为：1,3,5,7,8,10,12 时，为大月.则天数为31；
        days = 31;
      } else {
        //其他月份，天数为：30.
        days = 30;
      }
      return days;
    }


    getDate(3); // 获取数据 参数: 拿2个月的数据
  };
}(Zepto);
