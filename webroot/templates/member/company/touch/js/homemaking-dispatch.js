$(function () {
    $(".wrap").delegate(".fuwu_peo","click",function(){ 
     
        $(this).addClass('active').siblings().removeClass('active');
        $('.baomu_manage_footer').show();

        var people_name=$(this).find('.peo_name').text();
        var id = $(this).attr('data-id');
        $("#courier").val(id);
        $('.coutier_man').text(people_name)
    });

    var orderpage = 1;
    var pageSize  = 10;
    var isload = false;
    var objId = $('.wrap .cont_ul');

    //加载
    $(window).scroll(function() {
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w;
        if ($(window).scrollTop() >= scroll && !isload) {
            getList(objId);
            orderpage++;
        };
    });

    getList(1);

    $(".baomu_manage_footer p").click(function(){
        var orderid = $("#orderid").val(), courier = $("#courier").val();
        if(orderid && courier){
            var data = [];
            data.push('id='+orderid);
            data.push('courier='+courier);
            $.ajax({
                url: '/include/ajax.php?service=homemaking&action=operOrder&oper=dispatch',
                data: data.join("&"),
                type: 'post',
                dataType: 'json',
                success: function(data){
                    if(data && data.state == 100){
                        getList(1);
                    }else{
                        alert(data.info);
                    }
                },
                error: function(){
                    alert(langData['siteConfig'][6][203]);
                }
            });
        }
    })

    function getList(item) {
        isload = true;
        if(item){
            objId.html('');
        }
        objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');

        $.ajax({
            url: masterDomain+"/include/ajax.php?service=homemaking&action=personalList&u=1&orderby=2&page="+orderpage+"&pageSize="+pageSize,
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
              if(data && data.state != 200){
                if(data.state == 101){
                  objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
                }else{
                  var list = data.info.list, pageinfo = data.info.pageInfo, html = [];
                  
                  //拼接列表
                  if(list.length > 0){
        
                    var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";
                    var param = t + "id=";
                    //var urlString = editUrl + param;
        
                    for(var i = 0; i < list.length; i++){
                      var item           = [],
                          id             = list[i].id,
                          photo          = list[i].photo,
                          username       = list[i].username,
                          tel            = list[i].tel,
                          onlineorder    = list[i].onlineorder,
                          endorder       = list[i].endorder,
                          photo          = list[i].photo,
                          experiencename = list[i].experiencename,
                          tel            = list[i].tel,
                          pubdate        = huoniao.transTimes(list[i].pubdate, 1);
        
                        url = list[i].state != "1" ? 'javascript:;' : url;

                        html.push('<li data-id="'+id+'" class="fuwu_peo fn-clear">');
                        if(photo!=''){
                            html.push('<div class="left_b"><img src="'+photo+'" alt=""></div>');
                        }
                        html.push('<div class="right_b">');
                        html.push('<p class="peo_manage"><span class="peo_name">'+username+'</span></p>');
                        html.push('<ul class="info fn-clear">');
                        html.push('<li><span class="order">'+langData['homemaking'][9][4]+'</span><span class="order_num">'+onlineorder+'</span></li>');//服单
                        html.push('<li><span class="order">'+langData['homemaking'][9][5]+'</span><span class="order_num">'+endorder+'</span></li>');//结单
                        html.push('</ul">');
                        html.push('<p class="tel"><a href="tel:'+tel+'">'+tel+'</a></p>');
                        html.push('</div>');
                        html.push('</li>');
                
                    }
        
                    objId.append(html.join(""));
                    $('.loading').remove();
                    isload = false;
                    if(orderpage >= pageinfo.totalPage){
                        isload = true;
                        objId.append('<p class="loading">'+langData['homemaking'][8][65]+'</p>');
                    }
        
                  }else{
                    $('.loading').remove();
                    objId.append("<p class='loading'>"+langData['siteConfig'][20][185]+"</p>");
                  }
                }
              }else{
                objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
              }
            }
        });
    }



});