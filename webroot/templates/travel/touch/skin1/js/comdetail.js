$(function(){
    //点赞
    $(".commentBox").delegate(".btnUp","click", function(){console.log(11);
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
          window.location.href = masterDomain+'/login.html';
          return false;
        }
        var t = $(this), id = t.attr("data-id");
        if(t.hasClass("active")) return false;
        var num = t.find("em").html();
        if( typeof(num) == 'object') {
            num = 0;
        }
        var type = 'add';
        if(t.hasClass("active")){
            type = 'del';
            num--;
        }else{
            num++;
        }

        $.ajax({
            url: "/include/ajax.php?service=member&action=dingComment&id="+id+ "&type=" + type,
            type: "GET",
            dataType: "json",
            success: function (data) {
              if(data.state==100){
                if(t.hasClass("active")){
                    t.removeClass('active');
                }else{
                    t.addClass('active');
                }
                t.find('em').html(num);
              }else{
                  alert(data.info);
                  t.removeClass('active');
              }
            }
        });
    });

    $('.wcmt_send, .submit_top').click(function(){
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			top.location.href = masterDomain + '/login.html';
			return false;
		}

		var t = $(this);
		if(t.hasClass("loading")) return false;

		var contentObj = t.hasClass("submit_top") ? $(".newcomment") : $(".newcomment1"), content = contentObj.val();

		if(content == ""){
            alert(langData['travel'][4][3]);  //请输入您要评论的内容！
			return false;
		}
		if(huoniao.getStrLength(content) > 200){
			alert(langData['travel'][4][4]);   //超过200个字了！
			return false;
		}

		t.addClass("loading").html(langData['travel'][4][2]+'...');  //提交中
		$.ajax({
			url: "/include/ajax.php?service=member&action=replyComment&id="+comdetailid,
			data: "content="+content,
			type: "POST",
			dataType: "json",
			success: function (data) {
				t.removeClass("loading").html(langData['travel'][4][1]);  //评论
				if(data && data.state == 100){
                    contentObj.val('');
					alert(langData['travel'][4][5]);   //提交成功！
					location.reload();
				}else{
                    alert(data.info);
                }
			}
		});
	})

    var page = 1, pageSize = 10, isload = false;

    $(window).scroll(function(){
        var sct = $(window).scrollTop(), winh = $(window).height(), bh = $('body').height();
        if(!isload && winh + sct + 50 >= bh){
          page ++;
          getComment();
        }
    });

    getComment(1);

    function getComment(tr){
        isload = true;

        if(tr){
            page = 1;
            $(".commentList ul").html("");
        }

        $(".commentList ul").append('<div class="loading"><img src="'+templets_skin+'images/loading.gif" alt=""><span>'+langData['siteConfig'][20][184]+'</span></div>');  //加载中，请稍候
        $(".commentList ul .loading").remove();
  
        $.ajax({
          url: '/include/ajax.php?service=member&action=getChildComment&sid='+comdetailid+'&page='+page+'&pageSize='+pageSize,
          type: 'get',
          dataType: 'json',
          success: function(data){
              if(data && data.state == 100){
                  $(".loading").remove();
                  var list = data.info.list;
                  var pageInfo = data.info.pageInfo;
                  var html = [];
                  for(var i = 0; i < list.length; i++){
                      var d = list[i];
                      html.push('<li>');
                      html.push('<div class="imgbox"><img src="'+(d.user.photo ? d.user.photo : (staticPath + 'images/noPhoto_60.jpg') )+'" alt=""></div>');
                      html.push('<div class="rightInfo">');
                      html.push('<h4>'+ d.user.nickname +'</h4>');
                      html.push('<p class="txtInfo">'+ d.content +'</p>');
                      html.push('<div class="rbottom">');
                      html.push('<div class="rtime">'+ huoniao.transTimes(d.dtime, 2).replace(/-/g, '.')+(d.iphome ? ' · ' + d.iphome : '') +'</div>');
                      html.push('<div class="rbInfo">');
                      var comdUrl = comdetailUrl.replace("%id%", d.id);
                      html.push('<a href="'+ comdUrl +'" class="btnReply"> <s></s> '+langData['travel'][3][11]+' </a>');   //回复
                      if(d.zan_has==1){
                        html.push('<a href="javascript:;" data-id="'+ d.id +'" class="btnUp active"> <s></s> <em>'+ d.zan +'</em> </a>');
                      }else{
                        html.push('<a href="javascript:;" data-id="'+ d.id +'" class="btnUp"> <s></s> <em>'+ d.zan +'</em> </a>');
                      }
                      html.push('</div>');
                      html.push('</div>');
                      html.push('</div>');
                      html.push('</li>');
                  }
                  isload = false;
                  
                  $(".commentList ul").append(html.join(""));

                  if(page >= pageInfo.totalPage){
                    isload = true;
                    $(".commentList ul .loading").remove();
                    $(".commentList ul").append('<div class="loading"><span>'+langData['siteConfig'][18][7]+'</span></div>');  //已经到最后一页了
                  }
              }else{
                  isload = true;
                  $(".loading").remove();
                  $(".commentList ul").append('<div class="loading"><img src="'+templets_skin+'images/loading.gif" alt=""><span>'+data.info+'</span></div>');
              }
          },
          error: function(XMLHttpRequest, textStatus, errorThrown){
             isload = false;
             $(".commentList ul").html('<div class="loading"><span>'+langData['siteConfig'][20][184]+'</span></div>'); //加载中，请稍候
          }
        })
    }
	

})

