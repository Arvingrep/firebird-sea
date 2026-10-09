$(function(){


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
            alert('请输入您要评论的内容！');
			return false;
		}
		if(huoniao.getStrLength(content) > 200){
			alert('超过200个字了！');
			return false;
        }


		t.addClass("loading").html(langData['marry'][5][58]);
		$.ajax({
			url: "/include/ajax.php?service=house&action=sendCommon&aid=" + newsid,
			data: "content="+content,
			type: "POST",
			dataType: "json",
			success: function (data) {
				t.removeClass("loading").html(langData['marry'][5][50]);//评论
				if(data && data.state == 100){
                    contentObj.val('');
					alert(langData['marry'][5][59]);//提交成功！
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

    getComment();

    function getComment(tr){
        isload = true;

        if(tr){
            page = 1;
            $(".newList ul").html("");
        }

        $(".newList ul").append('<div class="loading"><img src="'+templets_skin+'images/loading.gif" alt=""><span>'+langData['siteConfig'][20][184]+'</span></div>');
        $(".newList ul .loading").remove();

        var url = '/include/ajax.php?service=house&action=common&aid=' + newsid + '&order=1&page=' + page + '&pageSize=' + pageSize;
  
        $.ajax({
          url: url,
          type: 'get',
          dataType: 'json',
          success: function(data){
              if(data && data.state == 100){
                  $(".loading").remove();
                  var list = data.info.list;
                  var pageInfo = data.info.pageInfo;
                  var html = [], html1 = [];
                  for(var i = 0; i < list.length; i++){
                      var d = list[i];
                      
                        html1.push('<li>');
                        html1.push('<div class="imgbox"><img src="'+(d.photo ? d.photo : (staticPath + 'images/noPhoto_60.jpg') )+'" alt=""></div>');
                        html1.push('<div class="rightInfo">');
                        html1.push('<h4>'+ d.username +'</h4>');
                        html1.push('<p class="txtInfo">'+ d.content +'</p>');
                        if(d.reply){
                            html1.push('<div class="replyCon">');
                            html1.push('<dl><dt><span class="spColor">小编回复：</span></dt><dd>'+ d.reply +'</dd></dl>');
                            html1.push('</div>');
                        }
                        html1.push('<div class="rbottom">');
                        html1.push('<div class="rtime">'+ d.dtime +'</div>');
                        html1.push('</div>');
                        html1.push('</div>');
                        html1.push('</li>');
                      }
                  
                  isload = false;
                  if(page==1){
                    if(html1==''){
                        $(".newList ul").html('<div class="loading"><span>'+langData['marry'][5][62]+'</span></div>');
                    }else{
                        $(".newList ul").html(html1.join(""));
                    }
                  }else{
                    $(".newList ul").append(html1.join(""));
                  }
                  if(page >= pageInfo.totalPage){
                    isload = true;
                    $(".newList ul .loading").remove();
                    $(".newList ul").append('<div class="loading"><span>'+langData['siteConfig'][18][7]+'</span></div>');
                  }
              }else{
                  isload = true;
                  $(".loading").remove();
                  $(".newList ul").append('<div class="loading">'+data.info+'</span></div>');
              }
          },
          error: function(XMLHttpRequest, textStatus, errorThrown){
             isload = false;
             $(".newList ul").html('<div class="loading"><span>'+langData['siteConfig'][20][184]+'</span></div>');
          }
        })
    }
	

})

