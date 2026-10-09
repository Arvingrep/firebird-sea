$(function(){

    //APP端取消下拉刷新
    toggleDragRefresh('off');

	var isClick = 0;
	var h=$(window).height();
	 var deviceUserAgent = navigator.userAgent;
    //左侧导航点击
    $(".left-box li").bind("click", function(){

        isClick = 1; //关闭滚动监听
        var t = $(this), index = t.index(), theadTop;
        if((device.indexOf('huoniao_iOS') > -1) && !(window.__wxjs_environment == 'miniprogram')){

          theadTop = $(".box_content:eq("+index+")").offset().top-25;
        }else{
          theadTop = $(".box_content:eq("+index+")").offset().top - 55;
        }
        t.addClass("active").siblings("li").removeClass("active");
        $(window).scrollTop(theadTop);
        setTimeout(function(){
          isClick = 0;//开启滚动监听
        },800);
    });
    //滚动监听
    $(window).scroll(function() {
        var scroH = $(this).scrollTop();
        var thh =scroH + h;
        if(isClick) return false;//点击切换时关闭滚动监听
        
        var theadLength = $(".box_content").length;
        $(".left-box li").removeClass("active");

        $(".box_content").each(function(index, element) {
            var offsetTop = $(this).offset().top;
            if (index != theadLength - 1) {
                var offsetNextTop
                if((device.indexOf('huoniao_iOS') > -1) && !(window.__wxjs_environment == 'miniprogram')){
                  offsetNextTop = $(".box_content:eq(" + (index + 1) + ")").offset().top-10;
                }else{
                  offsetNextTop = $(".box_content:eq(" + (index + 1) + ")").offset().top - 70;
                }
                if (scroH < offsetNextTop) {
                    $(".left-box li:eq(" + index + ")").addClass("active");
                    return false;
                }
            } else {
                $(".left-box li:last").addClass("active");
                return false;
            }
        });     
    });
    getList()
    function getList(tr){
        $.ajax({
          url: "/include/ajax.php?service=shop&action=type&gettype=all",
          type: "GET",
          dataType: "jsonp",
          success: function (data) {

            if(data.state == 100){
                $('.right-box .loading').remove();
                var list = data.info,html=[],flag=1;
                if(list.length > 0){
                    for(var i = 0; i < list.length; i++){//一级分类
                        var html2=[],html3=[];
                        if(i>=1){
                            html.push('<h2 class="line-title"><span>'+langData['shop'][6][30]+'</span></h2>');//下一项分类
                        }
                        html.push('<div class="box_content" data-type="'+list[i].id+'">');
                        
                        if(list[i].lowerarr!=''){//有二级分类
                            var dlist = list[i].lowerarr;
                            for(var j = 0;j < dlist.length; j++){
                                var sub = dlist[j].sublowerarr;
                                
                                if(sub){//有三级分类
                                    html.push('<div class="box-con">');
                                    html.push('<div class="ultitle">'+dlist[j].typename+'</div>');
                                    html.push('<ul class="fn-clear">');
                                    for(var m = 0;m < sub.length; m++){
                                        html.push('<li>');
                                        html.push('<a href="'+channelDomain+'/search_list.html?typeid='+sub[m].id+'&pid='+list[i].id+'" class="toMini" data-module="shop" data-temp="list" data-id="'+sub[m].id+'" data-typename="'+sub[m].typename+'"> ');
                                        html.push('<div class="imgbox">');
                                        var iconturl = sub[m].iconturl;
                                      	html.push('<img onerror="this.src=\'/static/images/404.jpg\'" src="/static/images/type_default.png" data-url="'+iconturl+'" alt="">');
                                        html.push('</div>');
                                        html.push('<div class="imgtxt">'+sub[m].typename+'</div>');
                                        html.push('</a>');
                                        html.push('</li>');
                                    }
                                    html.push('</ul>');
                                    html.push('</div>');
                                    
                                }else{//没有三级分类

                                    html2.push('<li>');
                                    html2.push('<a href="'+channelDomain+'/search_list.html?typeid='+dlist[j].id+'&pid='+list[i].id+'" class="toMini" data-module="shop" data-temp="list" data-id="'+dlist[j].id+'" data-typename="'+dlist[j].typename+'">');
                                    html2.push('<div class="imgbox">');
                                    var iconturl = dlist[j].iconturl;
                                    html2.push('<img onerror="this.src=\'/static/images/404.jpg\'" src="/static/images/type_default.png" data-url="'+iconturl+'" alt="">');
                                    html2.push('</div>');
                                    html2.push('<div class="imgtxt">'+dlist[j].typename+'</div>');
                                    html2.push('</a>');
                                    html2.push('</li>');

                                }

                            }
                          if(html2!=''){
                            html3.push('<div class="box-con">')
                            html3.push('<div class="ultitle">'+list[i].typename+'</div>')
                            html3.push('<ul class="fn-clear">')
                            html3.push(html2.join(''))
                            html3.push('</ul>')
                            html3.push('</div>')
                            html.push(html3.join(''))
                          }
                            
                            
                        }else{//没有二级
                            html.push('<div class="box-con">')
                            html.push('<div class="ultitle">'+list[i].typename+'</div>')
                            html.push('<ul class="fn-clear">')
                            html.push('<li>');
                            html.push('<a href="'+channelDomain+'/search_list.html?typeid='+list[i].id+'" class="toMini" data-module="shop" data-temp="list" data-id="'+list[i].id+'" data-typename="'+list[i].typename+'">');
                            html.push('<div class="imgbox">');
                            var iconturl = list[i].iconturl;
                            html.push('<img onerror="this.src=\'/static/images/404.jpg\'" src="/static/images/type_default.png" data-url="'+iconturl+'" alt="">');
                            html.push('</div>');
                            html.push('<div class="imgtxt">'+list[i].typename+'</div>');
                            html.push('</a>');
                            html.push('</li>');
                            html.push('</ul>')
                            html.push('</div>') 
                        }
                        html.push('</div>')
                        
                    }
                    
                    
                    $('.right-box').append(html.join(''))
                  	$('.right-box .box_content:first-child .box-con:first-child li').each(function(){
                      var imgurl = $(this).find('img').attr('data-url');
                      $(this).find('img').attr('src',imgurl)
                    })
                  	$("img").scrollLoading();

                }
            }else{
               $(".right-box").html(data.info);  
            }
          },
          error: function(){
            $(".right-box").html(langData['siteConfig'][20][227]);//网络错误，加载失败！
          }
        });

    }
  
})