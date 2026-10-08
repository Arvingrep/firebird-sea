$(function(){

    var M={};
      // 结束招标
      $('.btn-box').delegate("#btn-keep", "click", function(){
        var f = $(this);
        if(f.hasClass("disabled")) return false;
            M.dialog = jqueryAlert({
                  'title'   : '',
                  'content' : langData['renovation'][8][37],//确定要结束招标吗?
                  'modal'   : true,
                  'buttons' :{
                      '是' : function(){
                          M.dialog.close();
                          $('#btn-keep').css('background','#a0a0a0');
                          f.addClass("disabled").text(langData['renovation'][8][36]);//招标已结束
                      },
                      '否' : function(){
                          M.dialog.close();
                      }
                  }
            })
        
      });
    var isload = false,page=1,pageSize=5;
    // 下拉加载    
    $(window).scroll(function() {
        var h = $('.reno_company .com_li').height();  
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - h - w;
        if ($(window).scrollTop() > scroll && !isload) {
          page++;
          getList();
        };
    });
    getList();
    function getList(){
      if(isload) return false;
      isload = true;
      $(".loading").remove();
      $('.com_ul').append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
      var data = [];
      data.push("page="+page);
      data.push("pageSize="+pageSize);
      $.ajax({
            url:  "/include/ajax.php?service=renovation&action=store&"+data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
                    
                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    if(list.length>0){
                        $(".com_ul .loading").remove();
                        for (var i = 0; i < list.length; i++) {
                            html.push('<li class="com_li" data-id="'+list[i].id+'">');
                            html.push('<a href="'+list[i].url+'">');
                            var pic = list[i].logo != "" && list[i].logo != undefined ? list[i].logo : "/static/images/404.jpg";
                            html.push('<div class="com_bottom">');                        
                            html.push('<div class="left_b">');                        
                            html.push('<img src="'+pic+'" alt="">');
                            html.push('</div>');
                            html.push('<div class="right_b">');
                            html.push('<div class="com1">');
                            html.push('<h4 class="com_type">'+list[i].company+'</h4>');
                            if(list[i].safeguard > 0){
                                 html.push('<span class="defend"></span>'); 
                            }
                            if (list[i].certi == 1) {
                                html.push('<span class="certify"></span>'); 
                            }                
                            html.push('</div>'); 
                            html.push('<ul class="right_ul">');                 
                            html.push('<li>'+langData['renovation'][0][24]+':<span>'+list[i].diaryCount+'</span></li>'); //  案例              
                            html.push('<li>'+langData['renovation'][0][25]+':<span>'+list[i].constructionCount+'</span></li>'); //   工地
                            html.push('<li>'+langData['renovation'][0][4]+':<span>'+list[i].teamCount+'</span></li>');   //     设计师         
                            html.push('</ul>');                                     
                            html.push('</div>');                                     
                            html.push('<p class="apply">'+langData['renovation'][8][34]+'</p>');//查看主页                                 
                            html.push('</div> ');                 
                            html.push('</a>');
                            html.push('</li>');                                               

                        }
                        $(".reno_company .com_ul").append(html.join(""));  
                        isload = false;

                        if(page >= pageinfo.totalPage){
                            isload = true;                            
                            $(".reno_company .com_ul").append('<div class="loading">'+langData['renovation'][2][28]+'</div>');//到底了...                            
                        }
                    }else{
                        $(".com_ul .loading").html(langData['siteConfig'][20][126]);//暂无相关信息！
                    }                                      
                }else{
                    $(".reno_company .com_ul .loading").html(data.info);
                }
            },
            error: function(){
                isload = false;
                $(".reno_company .com_ul .loading").html(langData['renovation'][2][29]);//网络错误，加载失败...
            }
        });
    }




});
