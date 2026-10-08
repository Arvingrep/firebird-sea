$(function () {
    
    var orderpage = 1;
    var totalpage = 0;
    var isload = false;
    var objId = $('.free_design .cont_ul');
    //加载
    $(window).scroll(function() {       
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w - 60;
        if ($(window).scrollTop() >= scroll && !isload) {           
            orderpage++;
            getList();
                           
        };
    });
    getList();

    function getList(tr) {
        if(tr){
          orderpage = 1;
          objId.html('');
      }
      if(isload) return false;
      isload = true;
      objId.append('<div class="loading">'+langData['siteConfig'][20][184]+'...</div>');//加载中，请稍候
        var url ="/include/ajax.php?service=renovation&action=rese&type="+Identity.typeid+"&bid="+Identity.id+"&page="+orderpage +"&pageSize=10";
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
                    var list = data.info.list,html=[];
                    totalpage = data.info.pageInfo.totalPage;
                    if(list.length > 0){
                        $('.loading').remove();
                        for(var i=0;i<list.length;i++){

                            html.push('<li class="tutor fn-clear">');
                            html.push('    <div class="top fn-clear">');
                            if(list[i].state != 0){

                                // 如果是已联系
                                html.push(' <div class="left_b_on">已联系</div>');
                            }else{

                                html.push('  <div class="left_b"><span>'+list[i].md+'</span><span>'+list[i].his+'</span></div>');
                            }
                            html.push('        <div class="middle_b">');
                            html.push('            <h2 class="person_name">'+list[i].people+'</h2>');
                            html.push('            <p>'+list[i].contact+'</p>');
                            html.push('        </div>');
                            html.push('        <div class="right_b">');
                            html.push('            <a href="tel:13056220120"><img src="'+templateSkin+'images/renovation/call.png" alt=""></a>');
                            html.push('        </div>');
                            html.push('    </div>');

                            html.push('    <div class="bottom fn-clear">');
                            html.push('        <h3 class="village">'+langData['renovation'][4][5]+'：<span>'+list[i].community+'</span></h3>');//小区

                            html.push('    </div>');
                            html.push('</li>');
                        }
                        objId.append(html.join(""));
                        isload = false;
                        if(orderpage >= totalpage){ 
                          isload = true;                 
                          objId.append('<div class="loading">'+langData['renovation'][2][25]+'</div>');   //已显示全部
                        }
                    }else{
                        objId.find(".loading").html(langData['siteConfig'][20][126]);//暂无相关信息！
                    }
                    

                }else {
                        objId.find(".loading").html(data.info);
                }
            },
            error: function(){
                isload = false;
                objId.find(".loading").html(langData['renovation'][2][29]);//网络错误，加载失败...
            }
        })
    }




});