$(function(){
	$('.rightList.albumList li:nth-child(4n)').css('margin-right','0');
	//控制简介的字数
	var yuanTxt = $('.dtt').html();
	txtslice();
	function txtslice(){
		$('.dtt').each(function(index, el) {
	        var num = $(this).attr('data-num');
	        var text = $(this).text();
	        var len = text.length;
	        if(len > num){
	            $(this).html(text.substring(0,num) + '...');
	            $('.zk').show();
	        }
	    });
	}
    

    //展开收起
    $('.proCon .zk').click(function(){
        if(!$('.proDetail').hasClass('active')){
            $('.proDetail').addClass('active');
            $(this).text('收起');
            $('.dtt').html(yuanTxt);
        }else{
            $('.proDetail').removeClass('active');
            txtslice();
            $(this).text('展开');
        }
    })

    // 点击关注
	$('.follow').off('click').click(function (e) {
	    var t = $(this);
	    var par = t.closest('.guanzhu');
	    var tid = par.attr('data-id');
	    if (t.hasClass('add_follow')) {//去关注
	        t.removeClass('add_follow');
            t.text('已关注');
            $(this).parent().find('.appo_sec').show();
            fadeOut();
			sureGuan(tid);

	    } else {//取消关注
	    	if(par.hasClass('detailGuan')){//本页作者可取消 列表不可取消

	            $(this).parent().find('.appo_cancel').show();
	            $(document).one("click",function(){
					$('.appo_cancel').fadeOut()
				});

	    	}
	        

	    }
	    e.stopPropagation();
	});
	$('.gz_sure').click(function () {
        $(this).parents('.guanzhu').find('.follow').addClass("add_follow");
        $(this).parents('.guanzhu').find('.follow').html('<i></i>关注');
        $(this).parents('.appo_cancel').fadeOut();
        var id = $(this).parents('.guanzhu').attr("data-id");
        cancalGuan(id);

    });

    $('.gz_cancel').click(function () {
        $(this).parents('.appo_cancel').fadeOut();
    });

	function cancalGuan(sid){
		$.post("/include/ajax.php?service=video&action=follow&type=0&temp=video&userid=" + sid);
	}
	function sureGuan(sid){
		$.post("/include/ajax.php?service=video&action=follow&type=1&temp=video&userid=" + sid);
	}

	function fadeOut(){
        setTimeout(function () {
            $('.appo_sec').fadeOut();
        },1500);
    }

})
