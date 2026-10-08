$(function(){


  var page = 1, pageSize = 10, isload = false;

  function getComment(tr){
    if(tr){
      page = 1;
      isload = false;
      $('.showlist').html('');
    }
    var where = $('.goodMark li.active').data('id');
    where = where ? '&'+where : '';

    isload = true;

    var data = [];
    data.push('type='+type);
    data.push('aid='+aid);
    data.push('oid='+oid);
    data.push('page='+page);
    data.push('pageSize='+pageSize);

    data = data.join("&") + where;

    $.ajax({
        url: masterDomain + '/include/ajax.php?service=member&action=getComment&son=1&' + data,
        type: 'get',
        dataType: 'jsonp',
        success: function(data){
          if(data && data.state == 100){
              var list = data.info.list;
              var pageInfo = data.info.pageInfo;
              var html = [];
              for(var i = 0; i < list.length; i++){
                  var d = list[i];
                  if(d.content == '' && d.pics.length == 0) continue;

                  html.push('<li class="fn-clear" data-id="'+d.id+'" data-url="comdetail.html">');
                  html.push('    <div class="lileft">');
                  html.push('        <a href="javascript:;" class="headImg">');
                  html.push('            <img src="'+(d.user.photo ? d.user.photo : (staticPath + 'images/noPhoto_60.jpg') )+'" alt="">');
                  html.push('        </a>');
                  html.push('    </div>');
                  html.push('    <div class="liCon">');
                  html.push('        <div class="faComment-tit fn-clear"><h4 class="fn-clear">'+d.user.nickname+'</h4><p class="fa-star"><s style="width: '+parseInt(d.sco1/5*100 ) + '%'+';"></s></p></div>');
                  html.push('        <div class="conInfo">');
                  html.push('          <a href="'+businessUrl+'/comdetail-'+d.id+'.html" class="link">');
                  html.push('            <p>'+d.content.replace(/\n/g, '<br>')+'</p>');
                  if(d.pics.length){
                      html.push('            <div class="comPic">');
                      html.push('                <div class="wrapper fn-clear">');
                      html.push('          <div class="my-gallery comment-pic-slide" itemscope="" itemtype="" data-pswp-uid="1">');
                      html.push('              <div class="swiper-wrapper">');

                      for(var n = 0; n < d.pics.length; n++){
                          html.push('                  <figure itemprop="associatedMedia" itemscope="" itemtype="" class="swiper-slide">');
                          html.push('                        <div itemprop="contentUrl" data-size="800x800" class="picarr" id="pic0">');
                          html.push('                          <img src="'+d.pics[n]+'" itemprop="thumbnail" alt="Image description">');
                          html.push('                        </div>');
                          html.push('                   </figure>');
                      }
                      html.push('              </div>');
                      html.push('          </div>');
                      html.push('        </div>');
                      html.push('                <span class="vmark picNum">'+d.pics.length+'张</span>');
                      html.push('            </div>');
                  }
                  html.push('         </a>');
                  html.push('            <div class="conBottom">');
                  html.push('                <em>'+huoniao.transTimes(d.dtime, 2).replace(/-/g, '.')+'</em>');
                  html.push('               <a href="'+businessUrl+'/comdetail-'+d.id+'.html" class="fn-right"><span class="comment"><i></i><em>'+d.lower.count+'</em></span></a>');
                  if(d.is_self != "1"){
                      html.push('                <span class="like'+(d.zan_has == "1" ? " like1" : "")+'"><i></i><em>'+d.zan+'</em></span>');
                  }
                  html.push('            </div>');
                  if(d.lower.list!=null && d.lower.list!=undefined){//有二级回复时

                      html.push('<div class="replyCon">');
                      html.push('<a href="'+businessUrl+'/comdetail-'+d.id+'.html">');
                      for(var j =0; j <d.lower.list.length; j++){//循环二级回复

                          html.push('<dl><dt><span class="spColor">'+ d.lower.list[j].user.nickname +'：</span></dt><dd>'+ d.lower.list[j].content +'</dd></dl>');
                          if(d.lower.list[j].lower!=null && d.lower.list[j].lower!=undefined){//有三级回复时
                              var comdUrl = comdetailUrl.replace("%id%", d.lower.list[j].id);
                              for(var k =0; k <d.lower.list[j].lower.length; k++){
                                  html.push('<dl><dt><span class="spColor">'+ d.lower.list[j].lower[k].user.nickname +'</span>回复 <span class="spColor">'+ d.lower.list[j].user.nickname +'：</span></dt><dd>'+ d.lower.list[j].lower[k].content +'</dd></dl>');
                              }

                          }

                      }

                      if(d.lower.list.length>2){
                          html.push('<span class="pmore">'+langData['business'][5][134].replace('1',d.lower.list.length)+' ></span>');//全部1条回复
                      }
                      html.push('</a>');
                      html.push('</div>');
                  }
                  html.push('        </div>');
                  html.push('    </div>');
                  html.push('</li>');
              }
              $('.comment_total').text(pageInfo.totalCount);
              $('#comment_good').text(pageInfo.sco4 + pageInfo.sco5);
              $('#comment_middle').text(pageInfo.sco2 + pageInfo.sco3);
              $('#comment_bad').text(pageInfo.sco1);
              $('#comment_pic').text(pageInfo.pic);

              $('.proBox').each(function(i){
                  var t = $(this), s = t.find('s'), num = t.find('.num'), r = 0, n = 0;
                  if(i == 0){
                      n = pageInfo.sco5;
                  }else if(i == 1){
                      n = pageInfo.sco4;
                  }else if(i == 2){
                      n = pageInfo.sco3;
                  }else if(i == 3){
                      n = pageInfo.sco2;
                  }else if(i == 4){
                      n = pageInfo.sco1;
                  }
                  r = (n / pageInfo.totalCount * 100).toFixed(2);
                  s.width(r + '%');
                  num.text(n > 999 ? '999+' : n);
              })

              $('#comment_good_ratio').text(parseInt((pageInfo.sco4+pageInfo.sco5)/pageInfo.totalCount*100 ) + '%');
              $('.showlist').append(html.join(""));
              //只显示三条 二级回复
              $('.conInfo .replyCon dl').each(function(){
                var t = $(this).index();
                if(t>2){
                  $(this).hide();
                }
              })
              if(pageInfo.totalPage > page){
                isload = false;
              }else{
                $('.loading').text(langData['business'][5][135]);//已加载全部数据
              }
          }else{
            $('.loading').text(langData['siteConfig'][20][126]);//暂无相关信息
          }
        }
    })
  }
    // 获取回复
  // function getreplyList(list,replyer){
  //   var html = [];
  //   for(var i = 0; i < list.length; i++){
  //       html.push('<li class="comm_li fn-clear fn-hide" data-id="'+list[i]['id']+'">');

  //       var photo = list[i].user['photo'] == "" ? staticPath+'images/noPhoto_40.jpg' : huoniao.changeFileSize(list[i].user['photo'], "small");

  //       html.push('  <div class="left_head"><img onerror="javascript:this.src=\''+staticPath+'images/noPhoto_40.jpg\';" data-uid="'+list[i].user['userid']+'" src="'+photo+'" alt="'+list[i].user['nickname']+'"></div>');
  //     html.push('<div class="right_con">');
  //     html.push('<h4>'+list[i].user.nickname+'</h4>');
  //     html.push(' <div class="comm_con">');
  //     html.push('   <p>回复<em>'+(replyer?replyer:list[i].member.nickname)+'</em>'+list[i].content+'</p>');
  //     html.push('   <div class="com_detail fn-clear">');
  //     html.push('     <span class="com_time">'+list[i].ftime+'</span>');
  //     var up = list[i].zan_has?"uped":""
  //     html.push('<div class="right_commt"><span class="btn_reply" data-rid="'+list[i]['id']+'" data-replyer="'+list[i].user.nickname+'"><i></i>回复('+(list[i].lower?list[i].lower.count:0)+')</span><span class="com_num '+up+'"><i></i>'+list[i].zan+'</span></div>');
  //     html.push(' </div></div>');
  //       html.push('</li>');
  //     if(list[i].lower && list[i].lower.count>0){
  //       console.log(list[i].lower.list)
  //       html.push(getreplyList(list[i].lower.list));
  //     }
  //   }
  //   return html.join("");
  // }

  $(window).scroll(function(){
    var sct = $(window).scrollTop(), winh = $(window).height(), bh = $('body').height();
    if(!isload && winh + sct + 50 >= bh){
      page ++;
      getComment();
    }
  })

  // 全部评论
  $(".goodMark ul li").on("click",function(){
      $(this).addClass("active").siblings().removeClass("active");
      var i = $(this).index();
      $('.detailBox ul').eq(i).addClass('showlist').siblings().removeClass("showlist");
      getComment(1);
  })



    function getParameter(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)","i");
        var r = location.search.substr(1).match(reg);
        if (r!=null) return (r[2]); return null;
    }
      var urlSearch = location.search;
      var string = urlSearch.split("=")[1]; //分割取出typeid
      var typePram = getParameter("typename"); //通过getParameter获取
      if(typePram == null || typePram == undefined || typePram==''){
        getComment();
        return false;
      }
      console.log(typePram)
     $(".goodMark ul li").each(function(){
      var t = $(this), typename = t.attr("data-typename");

      if(typePram == typename){
        console.log(typename)
        $(this).click();
      }
    })

})
