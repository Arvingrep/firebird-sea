$(function(){
    $('.car-list li:nth-child(4n)').css('margin-right','0')
	//公共头部搜索
    //搜索栏切换
    $('.search2 dl').hover(function(){
	      var a = $(this);
	      a.addClass('hover');
	      a.find('dd .curr').addClass('active').siblings().removeClass();
	  },function(){
	      $(this).removeClass('hover');
	  }).find('dd a').click(function(){
	      var a = $(this);
	      var index = $(this).attr("data-type");	      
          $('.FormBox').find('.'+index+'').show().siblings().hide();
          $('.FormBox').find('.'+index+'').find(".inpbox input").focus();
          $('.keytype').text(a.text());
          a.addClass('active curr').siblings().removeClass();
          $('.search2 dl').removeClass('hover');
	      
	  }).hover(function(){
	      var a = $(this);
	      a.addClass('active').siblings().removeClass('active');
	})

        //收藏
    $(".soucan").bind("click", function(){
        var t = $(this), type = "add", oper = "+1", txt = langData['travel'][5][13];   //"已收藏"
        
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            top.location.href = masterDomain + '/login.html';
            return false;
        }

        if(!t.hasClass("curr")){
            t.addClass("curr");
        }else{
            type = "del";
            t.removeClass("curr");
            oper = "-1";
            txt = langData['travel'][5][12];  //收藏
        }

        var $i = $("<b>").text(oper);
        var x = t.offset().left, y = t.offset().top;
        $i.css({top: y - 10, left: x + 17, position: "absolute", "z-index": "10000", color: "#E94F06"});
        $("body").append($i);
        $i.animate({top: y - 50, opacity: 0, "font-size": "2em"}, 800, function(){
            $i.remove();
        });

        t.find('span').html(txt);
        
        var temp = '';
        if(catid == 'rentcar'){
            temp = 'rentcar-detail';
        }else if(catid == 'store'){
            temp = 'store-detail';
        }else if(catid == 'agency'){
            temp = 'agency-detail';
        }else if(catid == "visa"){
            temp = 'visa-detail';
        }

        $.post("/include/ajax.php?service=member&action=collect&module=travel&temp="+temp+"&type="+type+"&id="+id);   //收藏提交

    });

})
