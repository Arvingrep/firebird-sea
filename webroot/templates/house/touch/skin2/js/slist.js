$(function(){
    

    var atpage = 1,isload = false;
    // 下拉加载
    $(window).scroll(function() {
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w - 50;
        if ($(window).scrollTop() > scroll && !isload) {
            atpage++;
            getList();
        };
    });


    getList(1)
    //数据列表
    function getList(tr){

        isload = true;

        //如果进行了筛选或排序，需要从第一页开始加载
        if(tr){
            atpage = 1;
            $(".list ul").html("");
        }

        $(".list .loading").remove();
        $(".list").append('<div class="loading">加载中...</div>');
        var data = [];
        data.push("page="+atpage);
        data.push("pageSize=6");
        data.push("sid="+sid);

        var url="/include/ajax.php?service=house&action=schoolList&"+data.join("&");
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (data) {
                if(data){
                    if(data.state == 100){
                        $(".list .loading").remove();
                        var list = data.info.list, html = [];
                        if(list.length > 0){
                            for(var i = 0; i < list.length; i++){
                                var pic = list[i].logopath != "" && list[i].logopath != undefined ? list[i].logopath : "/static/images/404.jpg";
                                var typearr = list[i].typearr;
                                // 查小区
                                html.push('<li class="scLi"><a href="'+dUrl+'?id='+ list[i].id +'">');
                                html.push('<div class="left_img"><img src="'+pic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';"></div>');
                                html.push('<div class="rightSc">');
                                html.push('<h3>'+list[i].title+'</h3> ');
                                html.push('<p class="addr"><i></i>'+list[i].addrName+'</p> ');
                                html.push('<p class="tag">');
                                html.push('<span class="nature">'+list[i].schoolnaturename+'</span>');//民办或者公办必有
                                for(var a = 0; a < typearr.length; a++){
                                    var cla = '3';
                                    if(typearr[a].typename == '幼儿园'){
                                        cla ='1'
                                    }else if(typearr[a].typename == '小学'){
                                        cla ='2'
                                    }
                                    html.push('<span class="slevel-'+cla+'">'+typearr[a].typename+'</span>');//幼儿园等 可多个
                                }

                                html.push('</p>');
                                html.push('<p class="fire"><i></i>'+list[i].click+'</p>');//热度
                                html.push('</div>');
                                html.push('</a></li>');


                            }

                            $(".list ul").append(html.join(""));
                            isload = false;

                            //最后一页
                            if(atpage >= data.info.pageInfo.totalPage){
                                isload = true;
                                $(".list ul").append('<div class="loading">已经到最后一页了</div>');
                            }

                            //没有数据
                        }else{
                            isload = true;
                            $(".list ul").append('<div class="loading">暂无相关信息</div>');
                        }

                        //请求失败
                    }else{
                        $(".list .loading").html(data.info);
                    }

                    //加载失败
                }else{
                    $(".list .loading").html('加载失败');
                }
            },
            error: function(){
                isload = false;
                $(".list .loading").html('网络错误，加载失败！');
            }
        });
    }



});



    