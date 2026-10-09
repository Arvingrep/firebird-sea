$(function(){

    // 导航栏置顶
    var Ggoffset = $('.teac_tab ').offset().top - 50;
    $(window).bind("scroll",function(){
        var d = $(document).scrollTop();
        if(Ggoffset < d){
                $('.teac_tab').addClass('fixed');
        }else{
            $('.teac_tab').removeClass('fixed');
        }
    });
    //家教详情切换
    var isClick = 0;
    //左侧导航点击
    $(".teac_tab a").bind("click", function(){

        isClick = 1; //关闭滚动监听
        var t = $(this), parent = t.parent(), index = parent.index(), theadTop = $(".teac_con:eq("+index+")").offset().top - 100;
        parent.addClass("active").siblings("li").removeClass("active");
        $('html, body').animate({
            scrollTop: theadTop
        }, 300, function(){
            isClick = 0; //开启滚动监听
        });
    });
    //滚动监听
    $(window).scroll(function() {
        if(isClick) return false;
        var scroH = $(this).scrollTop();
        var theadLength = $(".teac_con").length;
        $(".teac_tab li").removeClass("active");

        $(".teac_con").each(function(index, element) {
            var offsetTop = $(this).offset().top;
            if (index != theadLength - 1) {
                var offsetNextTop = $(".teac_con:eq(" + (index + 1) + ")").offset().top - 80;
                if (scroH < offsetNextTop) {
                    $(".teac_tab li:eq(" + index + ")").addClass("active");
                    return false;
                }
            } else {
                $(".teac_tab li:last").addClass("active");
                return false;
            }
        });
    });

    // 在授课程下拉加载
    var atpage=1;
    var pageSize=3;
    var isload=false;
    $(document).ready(function() {
        $(window).scroll(function() {
          var allh = $('body').height();
          var w = $(window).height();
          var scroll = allh - w - 100;
          if ($(window).scrollTop() > scroll && !isload) {
            atpage++;
            getList();
          };
        });
    });


    //初始加载
    getList();

    //数据列表
    function getList(tr){


        isload = true;

        $(".teac_ul2 .loading").remove();
         $(".teac_ul2").append('<div class="loading"><span>'+langData['education'][9][17]+'</span></div>');  //加载中

        //请求数据
        var data = [];
        data.push("pageSize="+pageSize);
        data.push("page="+atpage);
        data.push("teacherid="+id);
        $.ajax({
            url: "/include/ajax.php?service=education&action=coursesList",
            data: data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if(data){                  
                    $(".teac_ul2 .loading").remove();
                    if(data.state == 100){                       
                        var list = data.info.list, html = [], pageinfo = data.info.pageInfo;
                        if(list.length > 0){
                          for(var i = 0; i < list.length; i++){               

                            html.push('<li class="fn-clear">');
                            html.push('     <div class="left_b">');
                            html.push('         <a href="'+list[i].url+'" target="_blank">');
                            var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";
                            html.push('             <img src="'+pic+'" alt="">');
                            html.push('         </a>');
                            html.push('     </div>');
                            html.push('     <div class="mid_b">');
                            html.push('         <h2 class="cla_title">');
                            html.push('             <a href="'+list[i].url+'" target="_blank">'+list[i].title+'</a>');
                            html.push('         <h2>');
                            html.push('         <p class="tip">'+list[i].classname+'</p>');
                            html.push('         <div class="cla_info fn-clear">');
                            html.push('             <div class="class_l">');
                            html.push('                 <dl>');
                            html.push('                     <dt><img src="'+templetPath+'images/cla_peo.png" alt=""></dt>');
                            html.push('                     <dd><span class="peo_num">'+list[i].sale+'</span>'+langData['education'][9][59].replace('1','')+'</dd>');//人已报名
                            html.push('                 </dl>');
                            html.push('                 <dl>');
                            var time1=list[i].openStart,time2=list[i].openEnd;;
                            openStart=huoniao.transTimes(time1, 2);
                            openEnd=huoniao.transTimes(time2, 2);

                            html.push('                     <dt><img src="'+templetPath+'images/cla_time.png" alt=""></dt>');
                            html.push('                     <dd><span class="cla_start">'+openStart+'</span>  ~ <span class="cla_end">'+openEnd+'</span></dd>');
                            html.push('                 </dl>');
                            html.push('                 <dl>');
                            html.push('                     <dt><img src="'+templetPath+'images/cla_place.png" alt=""></dt>');
                            html.push('                     <dd>'+list[i].user.addrname[0]+list[i].user.addrname[1]+list[i].user.addrname[2]+'</dd>');
                            html.push('                 </dl>');
                            html.push('             </div>');
                            html.push('             <p class="enroll"><a href="'+list[i].url+'" target="_blank">'+langData['education'][8][23]+'</a></p>');//去报名
                            html.push('         </div>');
                            html.push('     <div class="new_info fn-clear">');
                            html.push('         <div class="img_l">');
                            html.push('             <a href="'+list[i].url+'" target="_blank">');
                            var photo = list[i].photo != "" && list[i].photo != undefined ? huoniao.changeFileSize(list[i].photo, "small") : "/static/images/noPhoto_100.jpg";

                            html.push('                 <img src="'+photo+'" alt="" class="l_img">');
                            if(list[i].store.flag == 1){
                                html.push('            <i class="vip"></i>');
                            }
                            html.push('             </a>');
                            html.push('         </div>');
                            var nickname ;
                            if(list[i].usertype==1){
                                nickname=list[i].user.title;
                            }else{
                                nickname=list[i].user.nickname;
                            }
                            html.push('         <div class="org_name">');
                            html.push('             <a href="'+list[i].url+'" target="_blank">'+nickname+'</a>');
                            html.push('         </div>');
                            html.push('         <div class="right_b">');
                            html.push('             <p class="new_price"><strong>'+list[i].price+'</strong><em class="price_sy">'+langData['education'][9][58].replace('1','')+'</em></p>');//元起
                            html.push('            ');
                            html.push('         </div>');
                            html.push('     </div> ');
                            html.push('  </div>');
                            html.push('</li>');


                          }

                          $(".teac_ul2").append(html.join(""));
                          isload = false;

                          //最后一页
                          if(atpage >= data.info.pageInfo.totalPage){
                            isload = true;
                            $(".teac_ul2").append('<div class="loading_all">'+langData['education'][9][18]+'</div>');//已经到最后一页了
                          }
                          $(".zskc").html(pageinfo.totalCount);
                          
                        //没有数据
                        }else{
                          isload = true;
                          $(".teac_ul2").append('<div class="loading_all">'+langData['education'][9][55]+'</div>');//已加载全部
                        }
                      //请求失败
                      }else{
                        $(".teac_ul2").append('<div class="loading_all">'+data.info+'</div>');//已加载全部
                      }

                //加载失败
                }else{
                $(".teac_ul2 .loading").remove();
                $(".teac_ul2").append('<div class="loading_all">'+langData['education'][9][20]+'</div>');//加载失败
                }
            },
            error: function(){
                isload = false;
                $(".zskc").html(0);
                $(".teac_ul2 .loading").remove();
                $(".teac_ul2").append('<div class="loading_all">'+langData['education'][4][0]+'</div>');//网络错误，加载失败！
            }
        });
    }




})