$(function(){
$(".itemList").each(function(){
  if($(this).find(".bd li").size()==0){
    console.log(111)
    $(this).closest('.item_box').hide();
  }
})
var utils = {
	 canStorage: function(){
        if (!!window.localStorage){
            return true;
        }
        return false;
    },
    setStorage: function(a, c){
        try{
            if (utils.canStorage()){
                localStorage.removeItem(a);
                localStorage.setItem(a, c);
            }
        }catch(b){
            if (b.name == "QUOTA_EXCEEDED_ERR"){
                alert("您开启了秘密浏览或无痕浏览模式，请关闭");
            }
        }
    },
	 getStorage: function(b){
        if (utils.canStorage()){
            var a = localStorage.getItem(b);
            return a ? JSON.parse(localStorage.getItem(b)) : null;
        }
    },
    removeStorage: function(a){
        if (utils.canStorage()){
            localStorage.removeItem(a);
        }
    },
    cleanStorage: function(){
        if (utils.canStorage()){
            localStorage.clear();
        }
    }
}

	$(".slider .bd li").first().before($(".slider .bd li").last());
	$(".slider").hover(function() {
	    $(this).find(".arrow").stop(true, true).fadeIn(300)
	},
	function() {
	    $(this).find(".arrow").fadeOut(300)
	});
	$(".slider").slide({
	    titCell: ".hd ul",
	    mainCell: ".bd ul",
	    effect: "leftLoop",
	    autoPlay: true,
	    vis: 3,
	    autoPage: '<li><a></a></li>',
	    trigger: "click"
	});

   $(".rec_hd .itemList .slideBox2").slide({titCell:".hd ul",mainCell:".bd ul",autoPage:"<li></li>",effect:"leftLoop",autoPlay:true,vis:4,scroll:4});
   $(".free_hd .itemList .slideBox2").slide({titCell:".hd ul",mainCell:".bd ul",autoPage:"<li></li>",effect:"leftLoop",autoPlay:true,vis:4,scroll:4});
   $(".like_hd .itemList .slideBox2").slide({titCell:".hd ul",mainCell:".bd ul",autoPage:"<li></li>",effect:"leftLoop",autoPlay:true,vis:4,scroll:4});
   //显示二维码
	 $('.bd .t_bg,.lang_con .t_bg').hover(function () {
		 $(this).parents('a').find('.code_bg').css('display','block');
	 },function () {
		 $(this).parents('a').find('.code_bg').hide();
	 });


	// 跳转主页
	$(".sponor_info .btn_group span,.tab_con .care_btn").click(function(e){
		var t = $(this);
		if(t.hasClass("home_btn")){
			var url = t.attr('data-url')
			window.open(url)
		}else if(t.hasClass("care_btn")){
			var t = $(this),userid = t.attr('data-id');
			if (t.hasClass('cared')) {
				follow(t, function(){
					t.removeClass('cared');  //关注
					t.find('em').html(langData['siteConfig'][19][846]);
				});
			}else{
				follow(t, function(){
					t.addClass('cared');
					t.find('em').text(langData['siteConfig'][19][845]);  //已关注
				});
			}
		}

		return false;
	});





	// 粉丝参与切换
	$(".right_con .tab_ul li").click(function(){
		$(this).addClass("on_tab").siblings().removeClass("on_tab");
		$('.right_con .tab_con').eq($(this).index()).addClass("show").siblings().removeClass("show")
	})

	function follow(t, func){
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			location.href = masterDomain + '/login.html';
			return false;
		}

		if(t.hasClass("disabled")) return false;
		t.addClass("disabled");
		$.post("/include/ajax.php?service=member&action=followMember&id="+t.data("id"), function(){
			t.removeClass("disabled");
			func();
		});
	}

})
