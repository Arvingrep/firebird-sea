$(function(){
    var page = 1, pageSize = 10, isload =false;

    getList();

    function getList(){
		var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);
        data.push("teacherid="+pageData.id);
        
        $(".content_tab li").each(function(){
          if($(this).attr("data-type") != '' && $(this).attr("data-type") != null  && $(this).attr("data-id") != null){
            data.push($(this).attr("data-type") + "=" + $(this).attr("data-id"));
          }
        });

        isload = true;
        if(page == 1){
            $(".teacher_info ul").html();
            $(".tip").html(langData['travel'][12][57]).show();
        }else{
            $(".tip").html(langData['travel'][12][57]).show();
        }

        $.ajax({
                url: masterDomain + "/include/ajax.php?service=education&action=coursesList&"+data.join("&"),
                type: "GET",
                dataType: "jsonp",
                success: function (data) {
                    isload = false;
                    if(data && data.state == 100){
                        var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                        for (var i = 0; i < list.length; i++) {
                            html.push('<li>');
                            html.push('<a href="'+list[i].url+'">');
                            if(list[i].rec==1){
                                html.push('<img src="'+templets_skin+'images/new_recom.png" class="new_recom">');
                            }
                            html.push('<div class="left_b"><img src="'+huoniao.changeFileSize(list[i].litpic, "small")+'" class="new_descrip_img"></div>');
                            html.push('<div class="right_b">');
                            html.push('<p class="class_title">'+list[i].title+'</p>');
                            html.push('<p class="recom_zu"><span>'+list[i].classname+'</span></p>');
                            html.push('<p class="class_price"><span>'+list[i].price+'</span><span>'+echoCurrency('short')+langData['education'][7][17]+'</span><span>'+list[i].sale+langData['education'][7][19]+'</span></p>');
                            html.push('</div>');
                            html.push('</a>');
                            html.push('</li>');
                      }
                      if(page == 1){
                            $(".teacher_info ul").html(html.join(""));
                        }else{
                            $(".teacher_info ul").append(html.join(""));
                        }
                        isload = false;

                        if(page >= pageinfo.totalPage){
                            isload = true;
                            $(".tip").html(langData['travel'][0][9]).show();
                        }
                        $(".zskc").html(pageinfo.totalCount);
                  }else{
                    if(page == 1){
                        $(".teacher_info ul").html("");
                    }
                    $(".tip").html(data.info).show();
                    $(".zskc").html(0);
                  }
          },
            error: function(){
              isload = false;
              $(".teacher_info ul").html("");
              $(".zskc").html(0);
              $('.tip').text(langData['travel'][0][10]).show();//请求出错请刷新重试
            }
		});
    }
    

});
