$(function(){
  var action, objId = $('#list'), lei = 0;
  var page = 1;
  var isload = false;

  getList();
//切换
  $(".tab .type").bind("click", function(){
    var t = $(this), id = t.attr("data-id"), index = t.index();
    if(!t.hasClass("curr")){
      state = id;

      t.addClass("curr").siblings("li").removeClass("curr");
      getList(1);
    }
  });
  var M={};
  // 删除
  objId.delegate(".del", "click", function(){

    var t = $(this), par = t.closest(".house-box"), id = par.attr("data-id");

    if(id){

        M.dialog = jqueryAlert({
              'title'   : '',
              'content' : '确定要删除吗?',
              'modal'   : true,
              'buttons' :{
                  '是' : function(){
                      M.dialog.close();
                      $.ajax({
                          url: "/include/ajax.php?service=renovation&action=delAlbums&id="+id,
                          type: "GET",
                          dataType: "jsonp",
                          success: function (data) {
                            if(data && data.state == 100){
                              //删除成功后移除信息层并异步获取最新列表
                              objId.html('');
                              getList(1);

                            }else{
                              alert(data.info);
                              t.siblings("a").show();
                              t.removeClass("load");
                            }
                          },
                          error: function(){
                            alert(langData['siteConfig'][20][183]);
                            t.siblings("a").show();
                            t.removeClass("load");
                          }
                        });
                  },
                  '否' : function(){
                      M.dialog.close();
                  }
              }
        })
    }
  });

  // 下拉加载
  //加载
$(window).scroll(function() {
    var allh = $('body').height();
    var w = $(window).height();
    var scroll = allh - w -60;
    if ($(window).scrollTop() >= scroll && !isload) {
        page++;
        getList();
        
    };
});

function getList(tr) {
      if(tr){
          isload = false;
          page = 1;
          objId.html('');
      }
      if(isload) return false;
      isload = true;
      objId.append('<div class="loading">'+langData['siteConfig'][20][184]+'...</div>');//加载中，请稍候
      
         var url ="/include/ajax.php?service=renovation&action=rcase&u=1&orderby=1&company="+Identity.store.id+"&state="+state+"&page="+page +"&pageSize=5";

        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (data) {
              isload = false;          
              if(data && data.state == 100){
                  var list = data.info.list,html=[], pageInfo = data.info.pageInfo;
                  var totalpage = pageInfo.totalPage;
                  if(list.length > 0){
                    var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";
                    var param = t + "id=";
                    var urlString = editUrl + param;
                    $('.loading').remove();
                    for(var i=0;i<list.length;i++){
                      var id= list[i].id,
                          title  = list[i].title,
                          litpic = list[i].litpic,
                          picarr = list[i].picarr,
                          click  = list[i].click,
                          url    = list[i].url; 
                        html.push('<div class="house-box item" data-id="'+id+'" data-title="'+title+'">');
                        html.push('      <div class="title">');
                        html.push('        <span>'+title+'</span>');
                        if(list[i].state == "0"){//待审核
                          html.push('<span style="color:#F9412E; float: right;">'+langData['siteConfig'][19][556]+'</span>');
                        }else if(list[i].state == "2"){//审核拒绝
                          html.push('<span style="color:#F9412E; float: right;">'+langData['siteConfig'][9][35]+'</span>');
                        }
                        html.push('      </div>');
                        html.push('      <div class="house-item fn-clear">');
                        html.push('        <ul class="house-img fn-clear">');
                        for (var a = 0; a < picarr.length; a++){
                            if(a == 3){
                                break;
                            }
                            html.push('          <li><img src="'+picarr[a].picpath+'"></li>');
                        }

                                  
                        html.push('      </ul>');
                        html.push('    </div>');
                        html.push('      <div class="o fn-clear">');
                        html.push('        <p class="img_num">共<span class="num">'+list[i].countpics+'</span>张</p>');
                        html.push('<a href="'+urlString+id+'" class="edit">'+langData['renovation'][7][4]+'</a>');//编辑
                        html.push('<a href="javascript:;" class="del">'+langData['renovation'][7][5]+'</a>');//删除
                        html.push('      </div>');
                        html.push('  </div>');
                    }
                    objId.append(html.join(""));
                    isload = false;
                    if(page >= totalpage){ 
                      isload = true;                 
                      objId.append('<div class="loading">'+langData['renovation'][2][25]+'</div>');   //已显示全部
                    }
                    if(pageInfo.audit>0){
                        $("#audit").show().html(pageInfo.audit);
                      }else{
                        $("#audit").hide();
                      }
                      if(pageInfo.gray>0){
                          $("#gray").show().html(pageInfo.gray);
                      }else{
                          $("#gray").hide();
                      }
                      if(pageInfo.refuse>0){
                          $("#refuse").show().html(pageInfo.refuse);
                      }else{
                          $("#refuse").hide();
                      }
                  }else{
                     objId.find(".loading").html(langData['siteConfig'][20][126]);//暂无相关信息！
                  }
                  
              }else {
                    objId.find(".loading").html(data.info);
              }
            },
            error: function(){
                $('.tip').text(langData['renovation'][2][26]);  //请求出错请刷新重试
            }
        })
    }

})




