$(function(){

	$("#totalCount").html(totalCount);
	$(".lr_bottom ul li:nth-child(3n)").css("margin-right","0");
		    // 焦点图
    $(".slideBox1").slide({titCell:".hd ul",mainCell:".bd",effect:"leftLoop",autoPlay:true,autoPage:"<li></li>",prevCell:".prev",nextCell:".next"});
    	scrollTopFn(6, ".scrolldiv li");
  
    if($('.slideBox1 .slideshow-item').length == 0){
		$('.PicFocus').hide();
    }
    	//滚动
	function scrollTopFn(num,selc) {
		var curNum = $(selc).length;
		if(curNum > num) {
			var SD=24,
				myScroll,
				tardiv = document.getElementById('scrolldiv'),
				tardiv1 = document.getElementById('scroll1'),
				tardiv2 = document.getElementById('scroll2');

			tardiv2.innerHTML=tardiv1.innerHTML;
			function Marquee2(){
				if(tardiv2.offsetTop-tardiv.scrollTop<=0)
					tardiv.scrollTop-=tardiv1.offsetHeight;
				else{
					tardiv.scrollTop++;
				}
			}
			myScroll=window.setInterval(Marquee2,24); ;
			tardiv.onmouseover=function() {clearInterval(myScroll)};
			tardiv.onmouseout=function() {myScroll=setInterval(Marquee2,SD)};
		}
	}

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


})
