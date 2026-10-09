$(function () {

    //往期
    $('.nav-l li.date .btn-date').click(function () {
        $('#date').focus();
    });

    $('.content .article-box .btn_close').click(function () {
        $(this).parent().hide();
    });

    // 版式
    $('.nav-l .edit .btn-edit').click(function () {
        $('.content .choose-box').toggleClass('show');
    });
    $('.content .choose-box li').click(function () {
        var edit = $(this).find('span').html();
        $('.edit-name').html(edit);
        $('.content .choose-box').removeClass('show');
    });

    $(document).bind('click', function (e) {
        var e = e || window.event; //浏览器兼容性
        var elem = e.target || e.srcElement;
        while (elem) { //循环判断至跟节点，防止点击的是div子元素
            if (elem.id && elem.id == 'edit') {
                return;
            }
            elem = elem.parentNode;
        }

        $('.content .choose-box').removeClass('show'); //点击的不是div或其子元素
    });

    // 右侧版式
    $('.content .content-r .tit .btn_choose').click(function () {
        $('.content .content-r .choose-list').toggleClass('show');
    });

    $('.content .content-r .choose-list').delegate('li', 'click', function () {
        $('.btn_choose').html($(this).text());
        $('.content .content-r .choose-list').removeClass('show');
    });

    $(document).bind('click', function (e) {
        var e = e || window.event; //浏览器兼容性
        var elem = e.target || e.srcElement;
        while (elem) { //循环判断至跟节点，防止点击的是div子元素
            if (elem.id && elem.id == 'btn_choose') {
                return;
            }
            elem = elem.parentNode;
        }

        $('.content .content-r .choose-list').removeClass('show'); //点击的不是div或其子元素
    });




    //控制标题的字数
    $('.sliceFont').each(function (index, el) {
        var num = $(this).attr('data-num');
        var text = $(this).text();
        var len = text.length;
        $(this).attr('title', $(this).text());
        if (len > num) {
            $(this).html(text.substring(0, num) + '...');
        }
    });


    // 文章详情
    $('.content .content-r ul.article-list').delegate('li','click',function () {
        $('.content .article-box').show();
        var id = $(this).attr('data-id');
        getContent(id);

    });

    //获取文章内容
    // getContent();
    function getContent(id){
        var url = "/include/ajax.php?service=paper&action=forumDetail&id="+id+"";
        $.ajax({
            url:url,
            type:"GET",
            dataType: "jsonp",
            success:function (data) {
                var datalist = data.info;
                var html=[];
                var time =huoniao.transTimes(datalist.pubdate,2);
                if(data.state == 100){

                    html.push('<p class="title">'+datalist.title+'</p>');
                    html.push('<p class="time"><span>'+datalist.author+'</span>');
                    if(datalist.author){
                        html.push('<span class="point">.</span> ');
                    }
                    html.push('<span>'+time+' </span></p>');
                    html.push('<div class="content-box"><p>'+datalist.body+'</p></div>');

                    $('#con_box').html(html.join(""));
                }
            }
        });
    }
    // console.log(id);

    // 获取版本列表
    getforumList();
    function getforumList() {


        // console.log(id);

        var url ="/include/ajax.php?service=paper&action=forumList&company="+companyid+"&date="+date+"&list=1&pageSize=1000";
        $.ajax({
            url: url,
            type: "GET",
            dataType: "jsonp",
            success:function (data) {
                console.log(data)
                if(data.state ==100){
                    var list = data.info.list;
                    var html=[];
                    for(var i=0;i<list.length;i++){
                        if(list[i].id == id){
                            html.push('<li class="active"><a data-id="'+list[i].id+'" href="'+list[i].url+'">'+list[i].title+'</a></li>');
                            $('.edit .edit-name').html(list[i].title);
                            $('.now_page').html(i+1);
                            $('#btn_choose').html(list[i].title);
                        }else {
                            html.push('<li><a data-id="'+list[i].id+'" href="'+list[i].url+'">'+list[i].title+'</a></li>');
                        }


                    }
                    $('.list-box .choose-list').html(html.join(""));

                    $('.choose-box .choose-list').html(html.join(""));
                    totalCount =data.info.pageInfo.totalCount;
                    $('.total_page').html(totalCount);


                }

            }


        });





    }




    var w1,h1,w0,h0,len;
    var n,m,d1,d2,d3,d4;

    var aload = 0;

    var w0;

    var screenImage = $("#imageth");
    w1 = screenImage[0].clientWidth;
    h1 = screenImage[0].clientHeight;

    imgSize();
    function imgSize(){

        $('#IECN').find('canvas').remove();
        $('#IECN, #imageth').attr('style', '');
        mapinit();

    }

    var img_w;
    getcontentList();

    function getcontentList() {
        var p1,p2,p3,p4,right_top,right_bottom;
        var url ="/include/ajax.php?service=paper&action=contentList&des_count=45&id="+id+"";
        $.ajax({
            url: url,
            type: "GET",
            dataType: "jsonp",
            success:function (data) {
                if(data.state == 100) {
                    var datalist = data.info;
                    var html1=[],html2=[];
                    len = datalist.length;
                    for (var i=0;i<datalist.length;i++) {
                        w0 = datalist[i].size.width;
                        img_w = datalist[i].size.width;
                        h0 = datalist[i].size.height;
                        n=w1/w0;
                        console.log("w1"+w1);
                        d1 = datalist[i].position[0];
                        d2 = datalist[i].position[1];
                        d3 = datalist[i].position[2];
                        d4 = datalist[i].position[3];

                        p1 = n*d1;
                        p2 = n*d2;
                        p3 = n*d3;
                        p4 = n*d4;
                        // console.log(p1);
                        right_top = p1+p3;
                        right_bottom = p2+p4;

                        // 插入area
                        html1.push('<area id="items'+i+'" data-id="'+datalist[i].id+'" data-posion="'+datalist[i].position+'"  class="areablock" shape="POLY" onmouseover="draw(this,\''+p1+','+p2+','+(p1+p3)+','+p2+','+(p1+p3)+','+(p2+p4)+','+p1+','+(p2+p4)+'\')"   onmouseout="undraw();" coords="'+p1+','+p2+','+right_top+','+p2+','+right_top+','+right_bottom+','+p1+','+right_bottom+'" >');
                        // 插入文章列表
                        html2.push('<li class="'+datalist[i].id+'" data-id="'+datalist[i].id+'" data-url="'+datalist[i].url+'" data-posion="'+datalist[i].position+'" onmouseout="undraw();">');
                        html2.push(' <p class="title sliceFont"  data-num="34">'+datalist[i].title+'</p>');
                        html2.push('<div class="info fn-clear">');
                        if(datalist[i].litpic){
                            html2.push('<div class="img fn-right"><img src="'+datalist[i].litpic+'" alt=""></div>');
                        }
                        if(datalist[i].description){
                            html2.push(' <div class="con">'+datalist[i].description+'......</div>');
                        }

                        html2.push('</div>');
                        html2.push('</li>');

                    }
                    console.log(1)
                    // $("#map_of_yyb").html(html1.join(""));
                    $('.content-r ul.article-list').html(html2.join(""));
                    // getSize();

                    setTimeout(function(){
                        // $('#IECN').find('canvas').remove();
                        // $('#IECN, #imageth').attr('style', '');
                        // mapinit();
                        drowarea()
                    }, 500);

                    // mapAreaHover("AREA.areablock");
                }
            }
        });
    }
    // var win0 = window.innerWidth;

    $(window).resize(function () {
        drowarea();

        // var screenImage = $("#imageth");
        // w1 = screenImage[0].clientWidth;



        // console.log($(w));
    });

    function drowarea() {
        imgSize();

        var screenImage = $("#imageth");
        w1 = screenImage[0].clientWidth;
        h1 = screenImage[0].clientHeight;

        console.log("w2"+w1);
        var p ,data_id,url;
        $('#IECN').find('canvas').remove();
        $('#IECN, #imageth').attr('style', '');
        mapinit();

        var win = window.innerWidth;
        // m =w1/win;

         n = w1/w0;
        var html1=[];
        var list1;

        for(var i=0;i<len;i++){
         p = $('.article-list li').eq(i).attr('data-posion');
         data_id = $('.article-list li').eq(i).attr('data-id');
         url = $('.article-list li').eq(i).attr('data-url');


         var arr = p.split(',');
         var p1 = arr[0]*n;
         var p2 = arr[1]*n;
         var p3 = arr[2]*n;
         var p4 = arr[3]*n;


           var right_top = p1+p3;
           var right_bottom = p2+p4;
            html1.push('<area id="items'+i+'" data-id="'+data_id+'" data-posion="'+p+'"  class="areablock" shape="POLY" onmouseover="draw(this,\''+p1+','+p2+','+(p1+p3)+','+p2+','+(p1+p3)+','+(p2+p4)+','+p1+','+(p2+p4)+'\')"  onmouseout="undraw();" coords="'+p1+','+p2+','+right_top+','+p2+','+right_top+','+right_bottom+','+p1+','+right_bottom+'" >');

        }
         console.log(2)
        $("#map_of_yyb").html(html1.join(""));

    }









    $('#map_of_yyb').delegate('area','click',function () {
        $('.content .article-box').show();
        var id = $(this).attr("data-id");
        getContent(id);
    });

    $('#map_of_yyb').delegate('area','mouseover',function () {
    	 console.log(3)
        var id = $(this).attr("data-id");
        $('.article-list li.'+id+'').addClass('active');
        var liHeigth =   $('.article-list li.'+id+'').offset().top;
        $('.content-r').scrollTop(liHeigth);
    });
    $('#map_of_yyb').delegate('area','mouseout',function () {
    	console.log(4)
        var id = $(this).attr("data-id");
        $('.article-list li.'+id+'').removeClass('active');
    });



    $('body').delegate('.article-list li','mouseover',function () {
        p = $(this).attr('data-posion');

        var arr = p.split(',');
        var p1 = arr[0]*n;
        var p2 = arr[1]*n;
        var p3 = arr[2]*n;
        var p4 = arr[3]*n;

        draw($(this),''+p1+','+p2+','+(p1+p3)+','+p2+','+(p1+p3)+','+(p2+p4)+','+p1+','+(p2+p4)+'');
    })


    //选择日期
    $(".laydate-icon").bind("click", function(){
        laydate({
            choose: function(dates){
                console.log(dates);
                location.href = searchUrl.replace("%1", dates);
            }
        });
    });


});