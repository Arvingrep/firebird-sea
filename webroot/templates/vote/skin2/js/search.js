$(function () {
	//查出结果
	$("#total").text('共找到'+total+'个结果');

    $('.page .page_item').click(function () {
        $(this).addClass('active');
        $(this).siblings().removeClass('active');
    });


    // 鼠标经过下拉排序框
   $('.selectbox .sort').hover(function(){
        $('.selectbox .sort .ModuleBox').show();
     },function(){
        $('.selectbox .sort .ModuleBox').hide();
     });
   $('.selectbox .state').hover(function(){
        $('.selectbox .state .ModuleBox').show();
     },function(){
        $('.selectbox .state .ModuleBox').hide();
     });

   //鼠标点击下拉列表项
   $('.selectbox .sort a').click(function(){
   		$('.selectbox .sort dt').text($(this).text());
   		$('.selectbox .sort .ModuleBox').hide();
   });
   $('.selectbox .state a').click(function(){
   		$('.selectbox .state dt').text($(this).text());
   		$('.selectbox .state .ModuleBox').hide();
   });

});