$(function(){

	$('.see_more').click(function(){
		page++;
		getList();
	})

    $('.content').delegate('.result_li','click',function(){
        if($(this).hasClass('active')){
            $(this).toggleClass('active');

        }else{
            if($('.result_ul li.result_li.active').size() < 3){
                $(this).toggleClass('active');


            }else{
                alert(langData['renovation'][4][31]);//最多只能选择三个

            }
        }
    })

    $('.submit').click(function(){
        if(!($('.result_ul li').hasClass('active'))){
            alert(langData['renovation'][14][5]);//请选择装修公司
        }else{
            var store = [];
            $('.result_ul li.active').each(function(){
                var tid = $(this).attr("data-id");
                store.push(tid)
            })
            data = [];
            data.push("people="+people);
            data.push("address="+address);
            data.push("contact="+contact);
            data.push("addrid="+addrid);
            data.push("stype="+stype);
            data.push("style="+style);
            data.push("comstyle="+comstyle);
            data.push("jiastyle="+jiastyle);
            data.push("stype="+stype);
            data.push("is_smart=1");
            data.push("community="+community);
            company  = store.join(",");
            data.push("company="+company);
            data.push("bid="+company);

            param = data.join("&");

            $.ajax({
                url:  "/include/ajax.php?service=renovation&action=sendRese&"+param,
                type: "POST",
                dataType: "jsonp",
                success: function (data) {
                    if(data.state !=100){
                        alert(data.info)
                    }else{
                        alert(data.info)
                        $('.order_mask2').show()
                    }
                },
                error:function(){
                    $('.re_more').hide();
                    $(".loading").html(langData['renovation'][2][29]);//网络错误，加载失败...
                }
            })

        }
    })
    $('.order_mask2 .t3').click(function(){
        $('.order_mask2').hide()
        location.href = channelDomain+"/index.html";
    })

 // 下拉加载
    var isload  = false;
    var page=1;
    var pageSize=5;
    getList();
    $('.content').delegate('.re_more','click',function(){
        page++;
        getList();
    })
    //获取信息列表
    function getList(){
        //console.log(1111)
        if(isload) return false;
        $(".content .result_ul").append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
        var data = [];
        data.push("jiastyle="+jiastyle);
        data.push("comstyle="+comstyle);
        data.push("style="+style);
        data.push("page="+page);
        data.push("pageSize="+pageSize);
        isload = true;
        $.ajax({
            url:"/include/ajax.php?service=renovation&action=store&"+data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
                    $(".loading").remove();
                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo;

                    for (var i = 0; i < list.length; i++) {

                        html.push('<li class="result_li" data-id="'+list[i].id+'">');
                        html.push('<div class="middle">');
                        html.push('<div class="left_b">');
                        var pic = list[i].logo != "" && list[i].logo != undefined ? list[i].logo : "/static/images/404.jpg";
                        html.push('<img src="'+pic+'" alt="">');
                        html.push('</div>');
                        html.push('<div class="right_b">');
                        html.push('<div class="com1">');
                        html.push('<h4 class="com_type">'+list[i].company+'</h4>');
                        if(list[i].safeguard > 0){
                            html.push('<i class="defend"></i>');
                        }
                        if (list[i].certi == 1) {
                            html.push('<i class="certify"></i>');
                        }
                        html.push('</div>');
                        html.push('<ul class="right_ul">');
                        html.push('<li>'+langData['renovation'][0][24]+'：<span>'+list[i].diaryCount+'</span></li>'); //   案例
                        html.push('<li>'+langData['renovation'][0][25]+'：<span>'+list[i].constructionCount+'</span></li>'); //  工地
                        html.push('<li>'+langData['renovation'][0][4]+'：<span>'+list[i].teamCount+'</span></li>'); //   设计师
                        html.push('</ul>');
                        html.push('</div>');
                        html.push('</div>');
                        html.push('</li>');


                    }

                    if(page == 1){

                        $(".content .result_ul").html(html.join(""))

                    }else{

                        $(".content .result_ul").append(html.join(""));

                    }
                    $('.see_more').show();
                    isload = false;

                    if(page >= pageinfo.totalPage){
                        isload = true;
                        if(page != 1){
                            $(".content .result_ul").append('<div class="loading">到底了...</div>');
                            $('.see_more').hide();
                        }
                    }

                }else{
                    if(page == 1){
                        $(".content .result_ul").html("");
                    }
                    $(".content .result_ul").html('<div class="loading">'+data.info+'</div>');
                }
            },
            error: function(){
                isload = false;
                if(page == 1){
                    $(".content .result_ul").html("");
                }
                $(".content .result_ul .loading").html('网络错误，加载失败...').show();
            }
        });

    }




})