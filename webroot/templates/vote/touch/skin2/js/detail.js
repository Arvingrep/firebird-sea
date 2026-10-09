$(function(){

    //回到顶部
    var h2_height = $(".center .title").offset().top;
    $(window).scroll(function(){
        var this_scrollTop = $(this).scrollTop();
        if(this_scrollTop>h2_height ){
            $(".gotop").show();
        }else{
            $(".gotop").hide();
        }
    });


      // 勾选
    $(".vote_before .xuan").click(function(e){
		if(e.target!=$(this).find('.pic_box img')[0]){  //判断是否点击在图片上
			var t = $(this).find('.choose'), b = t.closest('.body'), g = b.closest('.item'), type = g.attr('data-type');
	        if(type == 0){
	            b.find('.choose').removeClass('active');
	            t.addClass('active');
	        }else{
	            t.toggleClass('active');
	        }
		}
    });

    //多列勾选
    $(".item_columns .xuan").click(function(){
        var t = $(this).find('.icon_btn'), b = t.closest('.body'), g = b.closest('.item_columns'), type = g.attr('data-type');
        if(type == 0){
            b.find('.icon_btn').removeClass('active');
            t.addClass('active');
            // $('.ratio_dalog').show();
            // setTimeout("$('.ratio_dalog').fadeOut()",1000);
        }else{
            t.toggleClass('active');
        }
    });


   // 提交
   $('.container .submit').click(function(){
        $('.dalog').show();
   });
   $('.container .cancel').click(function(){
        $('.dalog').hide();
        $('.dalog>div .msg').text('确定要提交选票吗');
        $('.dalog>div .sure').removeClass('disabled');
        $('.dalog>div .cancel').text('否');

   });


     // 提交
    $('.dalog>div .sure').click(function(){
        if(detail.has_vote){
            $('.dalog>div .msg').text('您已经参与过此投票！');
            return;
        }
        if(detail.state == 2){
            $('.dalog>div .msg').text('投票已结束！');
            return;
        }
        var userid = $.cookie(cookiePre + 'login_user');
        if(userid == undefined || userid == 0 || userid == ''){
            location.href = masterDomain+'/login.html';
            return;
        }
        var t = $(this), result = [], count = 0, tj = true;
        if(t.hasClass('disabled')) return;
        $('#groupList .item').each(function(index){
            var g = $(this), x = g.find('.choose'),  type = g.attr('data-type');
            var c = [];
            x.each(function(){
                var t = $(this);
                if(t.hasClass('active')){
                    c.push(t.closest('.xuan').attr('data-index'));
                }
            })
            if(!c.length || (type == 0 && c.length > 1)){
                $('.dalog>div .msg').text('请检查第'+(index+1)+'题');
                $('.dalog>div .cancel').text('好');
                t.addClass('disabled');
                tj = false;
                return false;
            }
            result.push(c)
            count++;
        })
        if(!tj) return false;
        if(count && count == result.length){
            t.addClass('disabled');
            $.ajax({
                url: masterDomain + '/include/ajax.php?service=vote&action=vote&id='+detail.id,
                data: {"result": result},
                type: 'get',
                dataType: 'json',
                success: function(data){
                    if(data && data.state == 100){
                        $('.has_vote').show();
                        setTimeout(function(){
                            location.reload();
                        },1000)
                    }else{
                        alert(data.info);
                    }
                    t.removeClass('disabled');
                },
                error: function(){
                    alert('网络错误，请重试！');
                    t.removeClass('disabled');
                }
            })
        }
    })



	//放大图片
	 $.fn.bigImage({
		 artMainCon:"#groupList",  //图片所在的列表标签
		 show_Con:'.pic_box',
	});			   


    
});