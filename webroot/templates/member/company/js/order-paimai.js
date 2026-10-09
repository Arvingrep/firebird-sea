/**
 * 会员中心团购订单
 * by guozi at: 20150928
 */

 var objId = $("#list");
 $(function(){
 
     state = state == "" ? 1 : state;
     $(".nav-tabs li[data-id='"+state+"']").addClass("active");
 
     $(".nav-tabs li").bind("click", function(){
         var t = $(this), id = t.attr("data-id");
         if(!t.hasClass("active") && !t.hasClass("add")){
             state = id;
             atpage = 1;
             t.addClass("active").siblings("li").removeClass("active");
             getList();
         }
     });
 
     getList(1);
 
 });
 
 
 function getList(is){
 
     $('.main').animate({scrollTop: 0}, 300);
 
     objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
     $(".pagination").hide();
 
     $.ajax({
         url: "/include/ajax.php?service=paimai&action=orderList&store=1&state="+state+"&page="+atpage+"&pageSize="+pageSize,
         type: "GET",
         dataType: "jsonp",
         success: function (data) {
             if(data && data.state != 200){
                 if(data.state == 101){
                     objId.html("<p class='loading'>"+data.info+"</p>");
                 }else{
                     var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
 
                     var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";
 
                     //拼接列表
                     if(list.length > 0){
                         for(var i = 0; i < list.length; i++){
                             var item       = [],
                                     id         = list[i].id,
                                     ordernum   = list[i].ordernum,
                                     proid      = list[i].proid,
                                     procount   = list[i].procount,
                                     orderprice = list[i].product.money,  //商品价格
                                     bao_money = list[i].product.bao_money,  //保证金价格
                                     orderstate = list[i].orderstate,
                                     retState   = list[i].retState,
                                     expDate    = list[i].expDate,
                                     orderdate  = list[i].orderdate,
                                     title      = list[i].product.title,
                                     enddate    = huoniao.transTimes(list[i].product.enddate, 2),
                                     litpic     = list[i].product.litpic,
                                     url        = list[i].product.url;
 
                             var stateInfo = btn = "";
                             var urlString = editUrl.replace("%id%", id);
                             switch(orderstate){
                                 case 0:
                                     stateInfo = langData['siteConfig'][9][22];
                                     break;
                                 case 1:
                                     stateInfo = langData['siteConfig'][9][25];
                                     btn = '<a href="'+urlString+t+"rates=1"+'">'+langData['siteConfig'][6][154]+'</a>';
                                     break;
                                 case 2:
                                     stateInfo = '已过期';
                                     break;
                                 case 3:
                                     stateInfo = '已发货';
                                     break;
                                case 4:
                                    stateInfo = '已完成';
                                    break;
                                case 5:
                                    stateInfo = '未获拍';
                                    break;
                                case 6:
                                    stateInfo = '已付款';
                                    break;
                                case 7:
                                    stateInfo = '待补款';
                                    break;
                                
                             }
                            if(list[i].type != 'pai'){
                                btn = '';
                                switch(list[i].paistate){
                                    case 0:
                                        stateInfo = '未出价';
                                        break;
                                    case 1:
                                        stateInfo = '已出价';
                                        break;
                                    case 3:
                                        stateInfo = '已中拍';
                                        break;
                                }
                            }
                             html.push('<div class="item fn-clear" data-id="'+id+'">');
                             html.push('<div class="p"><a href="'+url+'" target="_blank"><i></i><img src="'+litpic+'"></a></div>');
                             html.push('<div class="o">'+btn+'</div>');
                             html.push('<div class="i">');
                             html.push('<p>'+langData['siteConfig'][19][308]+'：'+ordernum+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][19][51]+'：'+orderdate+'</p>');
                             html.push('<h5><a href="'+url+'" target="_blank" title="'+title+'">'+title+'</a></h5>');
                             html.push('<p>'+langData['siteConfig'][19][310]+'：'+enddate+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][19][311]+'：'+procount+langData['siteConfig'][13][53]+'&nbsp;&nbsp;·&nbsp;&nbsp;保证金：'+bao_money+'&nbsp;&nbsp;·&nbsp;&nbsp;商品价格：'+orderprice+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][19][307]+'：'+stateInfo+'&nbsp;&nbsp;·&nbsp;&nbsp;<a href="'+urlString+'">'+langData['siteConfig'][19][313]+'</a></p>');
                             html.push('</div></div>');
 
                         }
 
                         objId.html(html.join(""));
 
                     }else{
                         objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
                     }
 
                     state = state.toString();
                     switch(state){
                         case "":
                             totalCount = pageInfo.totalCount;
                             break;
                         case "0":
                             totalCount = pageInfo.unpaid;
                             break;
                         case "1":
                             totalCount = pageInfo.ongoing;
                             break;
                         case "2":
                             totalCount = pageInfo.expired;
                             break;
                         case "3":
                             totalCount = pageInfo.success;
                             break;
                         case "4":
                             totalCount = pageInfo.refunded;
                             break;
                         case "5":
                             totalCount = pageInfo.rates;
                             break;
                         case "6":
                             totalCount = pageInfo.recei;
                             break;
                         case "7":
                             totalCount = pageInfo.closed;
                             break;
                     }
 
 
                     $("#unused").html(pageInfo.state1);
                     $("#used").html(pageInfo.state4);
                     $("#refund").html(pageInfo.state5);
                     $("#recei").html(pageInfo.state3);
                     $("#topay").html(pageInfo.state0);
                     $("#toFahuo").html(pageInfo.state6);
                     $("#guoqi").html(pageInfo.state2);
                     showPageInfo();
                 }
             }else{
                 objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
             }
         }
     });
 }
 