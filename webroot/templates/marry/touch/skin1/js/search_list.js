$(function(){
  
  var isload = 0, page = 1, totalpage = 0;
  var aload = 0 , apage = 1, atotalpage = 0
  var keywords = decodeURI(getUrlParam('keywords'));  //搜索关键字

  $('#keywords').val(keywords);
    getlist(3,1); //首次搜索数据

   
    //点击切换直播类型
  $('.tabbox li').click(function(){
    var state = $(this).attr('data-state');
    var box = $('.ulbox').eq($(this).index()).find('li');
    var total = $('.tabbox li.active').attr('data-total');
    var page = $(this).attr("data-page")
    if(page<total){
      isload=0;
    }
    if(!$(this).hasClass('active')){
      $(this).addClass('active').siblings('li').removeClass('active');
      $('.video_list .ulbox').eq($(this).index()).addClass('show').siblings('ul').removeClass('show');
      if(box.length==0){
        getlist(state,page,'')
      }
    }
  });

  //商家跳转
    $('.list').delegate('.storeLi','click',function(e){
        var ahref = $(this).attr('data-url');
        
        if(e.target == $(this).find('.rCall')[0]){
            
        }else{
            window.location.href = ahref;
        }
    })

  
  //下拉加载
  $(window).scroll(function(){
    var page = $('.tabbox li.active').attr('data-page');
    var state = $('.tabbox li.active').attr('data-state');
    var srollPos = $(window).scrollTop(); //滚动条距顶部距离(页面超出窗口的高度)
    totalheight = parseFloat($(window).height()) + parseFloat(srollPos);
    
    if(($(document).height()-50) <= totalheight && !isload) {
      page++;
      $('.tabbox li.active').attr('data-page',page );
      getlist(state,page);
    }
    
  });
    

   //获取数据
   function getlist(state,page){

        $('rec_video.video_list .ulbox.show').append('<div class="loading"><img src="'+templatePath+'images/loading.png"/></div>');
      isload = 1;
      var data = [];
        data.push("page="+page);
        data.push("pageSize=10");
        data.push("keywords="+keywords);
    var url;
      if(state == "1"){//酒店
            url = "/include/ajax.php?service=marry&action=storeList&filter=8&istype=1&"+data.join("&");          
      }else if(state == "2"){//商家
            url = "/include/ajax.php?service=marry&action=storeList&"+data.join("&");
        }else{//套餐
          url = "/include/ajax.php?service=marry&action=planmealList&"+data.join("&");
      }
     $.ajax({
        url: url,
        type: "GET",
        dataType: "json", //指定服务器返回的数据类型
        success: function (data) {
         if(data.state == 100){
          var list = data.info.list;
          var totalpage = data.info.pageInfo.totalPage;
          $('.tabbox li.active').attr('data-total',totalpage );
          var html = [];
          for(var i=0 ; i<list.length; i++){
            var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";
                if(state == '3'){//套餐
                    var stype = list[i].type;//分类
                    html.push('<li class="mealLi"><a href="'+list[i].url+'">')
                    html.push('<div class="topImg">')                                 
                    html.push('<img src="'+pic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';">')                   
                    html.push('<span class="clafy">'+list[i].typename+'</span>')
                    html.push('</div>')
                    html.push('<div class="mealInfo">')
                    html.push('<h2>'+list[i].title+'</h2>')
                    var len = list[i].addrname.length;
                    html.push('<p class="addr">'+list[i].addrname[len-2]+'<em></em>'+list[i].companyname+'</p>')
                    html.push('<div class="other">') 
                    var tLen = list[i].tagAll.length <2 ?list[i].tagAll.length : 2;
                    for(var m=0;m<tLen;m++){                       
                        html.push('<span class="'+list[i].tagAll[m].py+'">'+list[i].tagAll[m].jc+'</span>');
                        
                    } 
                    var sameTxt = '';
                    if(stype == 7){//婚礼主持
                        sameTxt = list[i].stylename;
                    }else if(stype == 10){//租婚车
                        sameTxt = list[i].carname;
                    }else if(stype == 9){//婚礼策划
                        sameTxt = list[i].classificationname;
                    }else{
                        sameTxt = list[i].stylename;
                    }
                    html.push('<span class="same">'+sameTxt+'</span>')

                    html.push('<strong class="pri">'+echoCurrency('symbol')+list[i].price+'</strong>')
                    html.push('</div>')
                    html.push('</div>')
                    html.push('</a></li>')
                }else if(state == '2'){//商家
                    html.push('<li class="storeLi" data-url="'+list[i].url+'">')
                    html.push('<div class="leftImg">')
                    var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg"; 
                    html.push('<img src="'+pic+'" alt="">')
                    html.push('</div>') 
                    html.push('<div class="rightb">') 
                    html.push('<h2 class="sName">'+list[i].title+'</h2>') 
                    var newPrice = list[i].pricee.split('.');
                    if(newPrice[1]==0){
                        newPrice = newPrice[0];
                    }else{
                        newPrice = list[i].pricee;
                    }
              
                    html.push('<p class="sPrice">'+echoCurrency('symbol')+newPrice+'<em>起</em></p>');                     
                    html.push('<p class="sInfo">案例 '+list[i].plancaseCount+'<em>/</em>套系 '+list[i].planmealCount+'</p>')

                    html.push('<div class="fn-clear">')
                    var tLen = list[i].taocan.length <3 ?list[i].taocan.length : 3;
                    for(var t=0;t<tLen;t++){
                        var picc = list[i].taocan[t].litpic != "" && list[i].taocan[t].litpic != undefined ? list[i].taocan[t].litpic : "/static/images/404.jpg";
                    html.push('<dl>')

                    html.push('<dt><img src="'+picc+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></dt>')
                    html.push('<dd>'+echoCurrency('symbol')+''+ list[i].taocan[t].price+'</dd>')
                    html.push('</dl>')
                    }

                    html.push('</div>')
                    html.push('<a href="tel:'+list[i].tel+'" class="rCall"></a>') 
                    html.push('</li>')
                }else{//酒店
                    html.push('<li class="fn-clear hotelLi">');
                    html.push('<a href="'+list[i].url+'">');
                    html.push('<div class="img"><img src="'+pic+'" alt=""></div>');
                    html.push('<div class="info">');
                    html.push('<p class="name">'+list[i].title+'</p>');
                    html.push('<p class="type">'+list[i].typename+'<em>|</em>0-10桌</p>');
                    if(list[i].flagAll!=''){
                        html.push('<p class="tip">');
                        for(var m=0;m<list[i].flagAll.length;m++){
                            var className = '';
                            if(m==0){
                                className = 'dt';
                            }else if(m==1){
                                className = 'dl';
                            }else if(m==2){
                                className = 'gg';
                            }
                            if(m>2) break;
                            html.push('<span class="'+className+'">'+list[i].flagAll[m].jc+'</span>');
                        }
                        html.push('</p>');
                    }
                    var newPrice = list[i].pricee.split('.');
                    if(newPrice[1]==0){
                        newPrice = newPrice[0];
                    }else{
                        newPrice = list[i].pricee;
                    }
                    html.push('<p class="area">'+list[i].addrname[1]+' '+list[i].addrname[2]+' <span class="price"><strong>'+echoCurrency('symbol')+newPrice+'</strong><i>/'+langData['marry'][5][25]+'</i><em>'+langData['marry'][5][40]+'</em></span></p>');
                    html.push('</div>');
                    html.push('</a>');
                    html.push('</li>');
                } 
           }

          $('.rec_video .show.ulbox .loading').remove();
          $('.rec_video .show.ulbox').append(html.join(''));
          isload = 0;
          if(page>=totalpage){
            isload = 1;
            $('.rec_video .show.ulbox').append('<div class="loading"><span>已经全部加载</span></div>');
          }
          
         }else{
          $('.rec_video .show.ulbox .loading').remove();
          $('.rec_video .show.ulbox').append('<div class="loading"><span>暂无数据</span></div>');
         }
        },
        error:function(err){
          console.log('fail');
        }
     });  
    
   }
   
  
});

//获取url中的参数
function getUrlParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  var r = window.location.search.substr(1).match(reg);
  if ( r != null ){
     return decodeURI(r[2]);
  }else{
     return null;
  }
}



  var follow = function(t, func){
    var userid = $.cookie(cookiePre+"login_user");
    if(userid == null || userid == ""){
      location.href = masterDomain + '/login.html';
      return false;
    }

    if(t.hasClass("disabled")) return false;
    t.addClass("disabled");
    $.post("/include/ajax.php?service=member&action=followMember&id="+t.attr("data-id"), function(){
      t.removeClass("disabled");
      func();
    });
  }
  
    
 //图片2报错
var nofind_c = function(){ 
  var img = event.srcElement; 
  img.src = staticPath+"images/404.jpg"; 
  img.onerror = null;
} 
    