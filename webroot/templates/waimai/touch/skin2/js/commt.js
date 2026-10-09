$(function() {

	//点星星
	$('.star_box i').click(function() {
		var t = $(this),
			index = t.index(),
			p = t.parents('.star_box');
		var txt = t.attr('data-title');
		p.find('i').removeClass('click');
		t.addClass('click');
		for (var i = 0; i < index; i++) {
			p.find('i').eq(i).addClass('click');
		};
		p.find('.com_tip').text(txt).show();
		if (index < 2) {
			$('.label_tip .bad_ul').show().siblings('ul').hide();
		} else {
			$('.label_tip .comon_ul').show().siblings('ul').hide();
		}
		$('.label_tip li').removeClass('on_chose')
	});

	// 点击标签
	$('.label_tip').delegate('li', 'click', function() {
		var t = $(this);
		t.toggleClass('on_chose');
		if(t.hasClass('commt_btn')){
			$('#comm_d').show();
		}
	});

    // 匿名评价
	$('.hide_tip').click(function(){
		$(this).toggleClass('show');
	})

});
