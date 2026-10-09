 window.onload = function(){
      pubuliu("ulwrap",4,285);
  };
  
  //实现ul下的li瀑布流
  //cols 表示一行几列，liWidth 表示一列的宽度
  function pubuliu(ulId,cols,liWidth){
      var wrap = document.getElementById(ulId);
      var lis = wrap.getElementsByTagName("li");
      
      var li_h = [];
      for(var i=0; i<lis.length; i++){
          if(i < cols){
              li_h[i] = lis[i].scrollHeight;
              //定位元素
              lis[i].style.left = i * liWidth + 20 * i+"px";
              lis[i].style.top = "0px";
          }else{
              //获取数组最小值
              var min_liH = Math.min.apply( Math, li_h );
              var key = getKeyByValue(li_h,min_liH);
              //重定义最小高度
              li_h[key] = min_liH + lis[i].scrollHeight;
              
            //定位元素
              lis[i].style.left = key * liWidth + 20 * key+"px";
              lis[i].style.top = min_liH + 20+"px";
          }
      }
  }
  
  //根据数组中的值获取索引
  function getKeyByValue(arr,value){
      for(var i=0; i<arr.length; i++){
          if(arr[i] == value){
              return i;
          }
      }
  }

$(function(){

	// 焦点图
  $(".slideBox1").slide({titCell:".hd ul",mainCell:".bd",effect:"leftLoop",autoPlay:true,autoPage:"<li></li>",prevCell:".prev",nextCell:".next"});


  //免费设计 在线报切换
  $('.reno_tab li').click(function(){
    $(this).addClass('active').siblings().removeClass('active');
    var i = $(this).index();
    $('.price_order .dcontent').eq(i).addClass('design_show').siblings().removeClass('design_show');
  });
  //国际手机号获取
  getNationalPhone();
  function getNationalPhone(){
      $.ajax({
              url: "/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
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
    var par = $(this).closest('form');
    var areaWrap =par.find('.areaCode_wrap');
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
    var par = t.closest('form');
    var areaIcode = par.find(".areaCode");
    areaIcode.find('i').html('+' + code);
    par.find('.areaCodeinp').val(code);
  });

  $('body').bind('click', function(){
    $('.areaCode_wrap').fadeOut(300);
  });



});

