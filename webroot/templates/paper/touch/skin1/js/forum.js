$(function () {
    // 首次点开触发
    var res = document.cookie.indexOf("name");
    // console.log(res);
    if(res!=0){
        var oDate =new Date();
        document.cookie ="name=zheng;";
        document.getElementById('first').style.display ='block';
        $('.guide-mask').click(function () {
            $(this).hide();
        });
    }





    $('.news_btn').click(function () {
        $('.main .main-inside').toggleClass('show');
        $(this).toggleClass('btn_go_right');
    });

    // 选择日期
    $('#choosedate').mdater({
        maxDate: new Date(),
    });
    $('#choosedate').on('input propertychange', function(){
        date = $('#choosedate').val();
        var href = companyUrl.replace('#date', date);
        location.href = href;
    })
    

    $("#choosedate").focus(function(){
        document.activeElement.blur();
    });


    //修改日期格式
    $('body').delegate('.md_datearea li.current','click',function () {
        var date = $('#choosedate').val();
        var arr = new Array();
        arr = date.split('-');
        var newdate = arr[1]+"/"+arr[2];
        $('#date-text').html(newdate);
    });
    $('body').delegate('.md_ok','click',function () {
        var date = $('#choosedate').val();
        var arr = new Array();
        arr = date.split('-');
        var newdate = arr[1]+"/"+arr[2];
        $('#date-text').html(newdate);
    });



    console.log(id);

    var n = $('.swiper_'+id+'').attr('data-index');
    console.log(n);


    //报刊切换
    new Swiper('.topSwiper .swiper-container', {
        pagination: {el: '.topSwiper .pagination',type: 'fraction',} ,
        slideClass:'swiper-slide',
        initialSlide:n,
        on:{
            slideChangeTransitionEnd:function () {
                var id = $('.topSwiper .swiper-slide-active img').attr('data-id');
                $("#map_of_yyb").html(" ");
                getcontentList(id);
                getforum();


            }
        },
    });

    // $('.edit-box ul').delegate('li','click',function () {
    //
    // });


    // 获取当前版本
    // getforumList();
    function getforum(){
        var title = $('.topSwiper .swiper-slide-active img').attr('data-title');
        $('.nav li.edit span').html(title);
    }

    // 获取版本列表

    // function getforumList() {
    //     var url ="/include/ajax.php?service=paper&action=forumList&company="+companyid+"&list=1&pageSize=100;";
    //     $.ajax({
    //         url: url,
    //         type: "GET",
    //         dataType: "jsonp",
    //         success:function (data) {
    //             console.log(data);
    //             if(data.state ==100){
    //                 var list = data.info.list;
    //                 var html=[],html2=[];
    //                 for(var i=0;i<list.length;i++){

    //                     if(list[i].id == id){
    //                         html.push('<li class="active" id="edit_'+list[i].id+'"><a data-id="'+list[i].id+'" href="'+list[i].url+'">'+list[i].title+'</a></li>');
    //                         $('.nav li.edit span').html(list[i].title);
    //                     }else {
    //                         html.push('<li id="edit_'+list[i].id+'"><a data-id="'+list[i].id+'" href="'+list[i].url+'">'+list[i].title+'</a></li>');
    //                     }


    //                 }
    //                 $('.edit-box ul').html(html.join(""));
    //             }

    //         }
    //     });
    // }

    var formHtml = [];
    $('.topSwiper .swiper-slide').each(function(){
        var t = $(this), fid = t.data('id'), title = t.data('title'), url = t.data('url');
        if(fid == id){
            formHtml.push('<li class="active" id="edit_'+fid+'"><a data-id="'+fid+'" href="'+url+'">'+title+'</a></li>');
            $('.nav li.edit span').html(title);
        }else {
            formHtml.push('<li id="edit_'+fid+'"><a data-id="'+fid+'" href="'+url+'">'+title+'</a></li>');
        }
    })
    $('.edit-box ul').html(formHtml.join(""));

    // 获取文章列表

    var w1 = $('.img-box').width();
    getcontentList(id);
    function getcontentList(id) {
        var p1,p2,p3,p4,right_top,right_bottom;
        var url ="/include/ajax.php?service=paper&action=contentList&id="+id+"";
        $.ajax({
            url: url,
            type: "GET",
            dataType: "jsonp",
            success:function (data) {
                // console.log(data);
                if(data.state == 100) {
                    var datalist = data.info;
                    var html1=[],html2=[];
                    len = datalist.length;
                    for (var i=0;i<datalist.length;i++) {
                        w0 = datalist[i].size.width;
                        n=w1/w0;
                        d1 = datalist[i].position[0];
                        d2 = datalist[i].position[1];
                        d3 = datalist[i].position[2];
                        d4 = datalist[i].position[3];
                        //
                        p1 = n*d1;
                        p2 = n*d2;
                        p3 = n*d3;
                        p4 = n*d4;
                        right_top = p1+p3;
                        right_bottom = p2+p4;

                        // 插入area
                        html1.push('<area id="items'+i+'" data-id="'+datalist[i].id+'" data-posion="'+datalist[i].position+'"  class="areablock" shape="POLY" coords="'+p1+','+p2+','+right_top+','+p2+','+right_top+','+right_bottom+','+p1+','+right_bottom+'"  href="'+datalist[i].url+'">');
                        // 插入文章列表
                        html2.push('<li><a href="'+datalist[i].url+'">');
                        html2.push(' <h3 class="title sliceFont"  data-num="34">'+datalist[i].title+'</h3>');
                        html2.push('<div class="con-box fn-clear">');
                        if(datalist[i].img){
                            html2.push('<div class="img-box fn-right"><img src="{#$templets_skin#}upfile/eg05.png" alt=""><em>7图</em></div>');
                        }
                        if(datalist[i].con){
                            html2.push('<div class="info"><p class="con sliceFont" data-num="80">018年4月17日，中国华融资产管理股份有限公司（下简称“中国华融”）原党委书记、董事长赖小民被查。2018年10月15日，赖 原党委书记、董事长赖小民被查。2018年10月15日，赖</p></div>');
                        }

                        html2.push('</div>');
                        html2.push('</a></li>');

                    }
                    $("#map_of_yyb").html(html1.join(""));
                    $('.news-list-wrap ul.list').html(html2.join(""));

                }else {
                    $('.news-list-wrap ul.list').html("暂无文章");
                }
            }
        });
    }



    // 版式选择
    $('.nav li.edit').click(function () {
        $('.edit-box').addClass('show');
        $('.edit-bg').addClass('out');
    });

    $('.edit-box ul li').click(function () {
        $(this).addClass('active').siblings().removeClass('active');
        var edit = $(this).find('span').html();
        $('.nav li.edit span').html(edit);
        $('.edit-box').removeClass('show');
        $('.edit-bg').removeClass('out');
    });
    $('.edit-bg').click(function () {
        $('.edit-box').removeClass('show');
        $('.edit-bg').removeClass('out');
    });

    var _listHeight = $(window).height() - 90;
    $('.news-list-wrap').height(_listHeight);


    //点击pdf
    
    $('.nav li.pdf').click(function () {

        var lhref = $(this).find('a').attr('data-url');
        var u = navigator.userAgent; 
        if (u.indexOf('iPhone') > -1) {//苹果手机           
            location.href=lhref
        }else{
            window.open('/include/pdf/viewer.html?file=' + lhref);
            return false;
        }
      
    })


});