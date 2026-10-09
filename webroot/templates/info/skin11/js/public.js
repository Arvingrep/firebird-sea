$(function(){
    // 判断浏览器是否是ie8
    if($.browser.msie && parseInt($.browser.version) >= 8){
        $('.recom_box:last-child,.toptab li:last-child,.bInfoCon .bIbox:last-child').css('margin-right','0');
        $('.bmain ul li:nth-child(5n),.care_fans ul li:nth-child(5n)').css('margin-right','0');
        $('.main ul.recTop li:last-child, .main ul.recCom li:last-child').css('margin-bottom','0');

        $('.fixedwrap .search .type dd a:last-child').css('border-bottom','none');
    }
    //弹出二级分类
    $(".nav-con .all_cate3").hover(function(){
        $('#navlist_wrap .NavList').addClass('navshow');
    },function(){
        $('#navlist_wrap .NavList').removeClass('navshow');
    });

    //搜索栏切换
    $(".search dd a").bind("click", function(){
        var val = $(this).text(), id = $(this).attr("data-id");
        $(".keytype").attr("data-id", id).html(val);
        $(".search dd").hide();
        $(this).addClass('active').siblings().removeClass('active');
        console.log($(".FormBox form").attr('action'))
        var action = $(".FormBox form").attr('action')
        if(id){

          $(".FormBox form").attr('action',action+'?nature='+id)
        }
        // if(val == '信息'){
        //     $(".form").eq(1).hide();
        //     $(".form").eq(0).show();
        // }else{
        //     $(".form").eq(1).show();
        //     $(".form").eq(0).hide();
        // }
    });


    $('.search .type').hover(function(){
        $(this).find('dd').show();
    },function(){
        $(this).find('dd').hide();
    })

    // 搜索
    $(".search-btn").bind("click", function(){
          var keywords = $(".searchkey"), txt = $.trim(keywords.val()),
              type = $('.search .active').attr('data-type');
              id = $('.search .active').attr('data-id');
              var str = ''
              if(id){
                str = '&nature='+id
              }
          if(txt != ""){
            location.href = masterDomain +"/info/list/.html?keywords="+txt+str;

          }else{
              keywords.focus();
          }
    });


    var lens = $(".NavList li").length;
    if(lens<=11){
        $(".moreList").hide();
    }else{
        $(".moreList").show();
    }

    $(".NavList").hover(function(){
        var t = $(this);

        t.find("li:not(.moreList)").show();
        t.find("li").each(function(){
            var index = $(this).index();
            if(index == 20){
                $(this).find(".sub-category").hide();
            }
        });
    });


    $(".NavList li").hover(function(){
        var t = $(this);
        if(!t.hasClass("active")){
            t.parent().find("li").removeClass("active");
            t.addClass("active");
        }
    }, function(){
        $(this).removeClass("active");
    });

    $(".more_list li").hover(function(){
        $(this).find('.sub-category').show();
    },function(){
        $(this).find('.sub-category').hide();
    });



})
