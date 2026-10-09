$(function(){
    //点赞
    $(".commentList").delegate(".btnUp","click", function(){
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
          window.location.href = masterDomain+'/login.html';
          return false;
        }
        var t = $(this), id = t.attr("data-id");
        // if(t.hasClass("active")) return false;
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
            url: '/include/ajax.php?service=member&action=dingComment&id=' + id + "&type=" + type,
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
            alert(langData['marry'][5][56]);
			return false;
		}
		if(huoniao.getStrLength(content) > 200){
			alert(langData['marry'][5][57]);
			return false;
        }
        
        var typetemp = '';
        if(type==0){
            typetemp = 'marry-0';
        }else{
            typetemp = 'marry-'+type;
        }

		t.addClass("loading").html(langData['marry'][5][58]);
		$.ajax({
			url: "/include/ajax.php?service=member&action=sendComment&type=" + typetemp +'&aid=' + newsid,
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
            $(".hotList ul").html("");
            $(".newList ul").html("");
        }

        $(".newList ul").append('<div class="loading"><img src="'+templets_skin+'images/loading.gif" alt=""><span>'+langData['siteConfig'][20][184]+'</span></div>');
        $(".newList ul .loading").remove();

        var typetemp = '';
        if(type==0){
            typetemp = 'marry-0';
        }else{
            typetemp = 'marry-'+type;
        }

        var url = '/include/ajax.php?service=member&action=getComment&aid=' + newsid + "&type=" + typetemp +'&page=' + page + '&pageSize=' + pageSize + "&son=1";
  
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
                      if(i<2){
                        html.push('<li>');
                        html.push('<div class="imgbox"><img src="'+(d.user.photo ? d.user.photo : (staticPath + 'images/noPhoto_60.jpg') )+'" alt=""></div>');
                        html.push('<div class="rightInfo">');
                        html.push('<h4>'+ d.user.nickname +'</h4>');
                        html.push('<p class="txtInfo">'+ d.content +'</p>');
                        if(d.lower.list!=null && d.lower.list!=undefined){
                            html.push('<div class="replyCon">');
                            for(var j =0; j <d.lower.list.length; j++){
                                html.push('<dl><dt><span class="spColor">'+ d.lower.list[j].user.nickname +'：</span></dt><dd>'+ d.lower.list[j].content +'</dd></dl>');
                                if(d.lower.list[j].lower!=null && d.lower.list[j].lower!=undefined){
                                    var comdUrl = comdetailUrl.replace("%id%", d.lower.list[j].id);
                                    for(var k =0; k <d.lower.list[j].lower.length; k++){
                                        html.push('<dl><dt><span class="spColor">'+ d.lower.list[j].lower[k].user.nickname +'</span>'+langData['marry'][5][55]+' <span class="spColor">'+ d.lower.list[j].user.nickname +'：</span></dt><dd>'+ d.lower.list[j].lower[k].content +'</dd></dl>');
                                    }
                                    if(d.lower.list[j].lower.length>2){
                                        html.push('<a href="'+ comdUrl +'" class="pmore">'+langData['marry'][5][60]+ d.lower.list[j].lower.length +langData['marry'][5][61]+' ></a>');
                                    }
                                }
                            }
                            html.push('</div>');
                        }
                        html.push('<div class="rbottom">');
                        html.push('<div class="rtime">'+huoniao.transTimes(d.dtime, 2).replace(/-/g, '.')+(d.iphome ? ' · ' + d.iphome : '')+'</div>');
                        html.push('<div class="rbInfo">');
                        var comdReplayUrl = comdetailUrl.replace("%id%", d.id);
                        html.push('<a href="'+ comdReplayUrl +'" class="btnReply"> <s></s> '+langData['marry'][5][55]+' </a>');
                        var praise = "";
                        if(d.zan_has == 1){
                            praise = " active";
                        }
                        html.push('<a href="javascript:;" class="btnUp '+praise+'" data-id="'+d.id+'"> <s></s> <em>'+d.zan+'</em> </a>');
                        html.push('</div>');
                        html.push('</div>');

                        html.push('</div>');
                        html.push('</li>');
                      }else{
                        html1.push('<li>');
                        html1.push('<div class="imgbox"><img src="'+(d.user.photo ? d.user.photo : (staticPath + 'images/noPhoto_60.jpg') )+'" alt=""></div>');
                        html1.push('<div class="rightInfo">');
                        html1.push('<h4>'+ d.user.nickname +'</h4>');
                        html1.push('<p class="txtInfo">'+ d.content +'</p>');
                        if(d.lower.list!=null && d.lower.list!=undefined){
                            html1.push('<div class="replyCon">');
                            for(var j =0; j <d.lower.list.length; j++){
                                html1.push('<dl><dt><span class="spColor">'+ d.lower.list[j].user.nickname +'：</span></dt><dd>'+ d.lower.list[j].content +'</dd></dl>');
                                if(d.lower.list[j].lower!=null && d.lower.list[j].lower!=undefined){
                                    var comdUrl = comdetailUrl.replace("%id%", d.lower.list[j].id);
                                    for(var k =0; k <d.lower.list[j].lower.length; k++){
                                        html1.push('<dl><dt><span class="spColor">'+ d.lower.list[j].lower[k].user.nickname +'</span>'+langData['marry'][5][55]+' <span class="spColor">'+ d.lower.list[j].user.nickname +'：</span></dt><dd>'+ d.lower.list[j].lower[k].content +'</dd></dl>');
                                    }
                                    if(d.lower.list[j].lower.length>2){
                                        html1.push('<a href="'+ comdUrl +'" class="pmore">'+langData['marry'][5][60]+ d.lower.list[j].lower.length +langData['marry'][5][61]+' ></a>');
                                    }
                                }
                            }
                            html1.push('</div>');
                        }
                        html1.push('<div class="rbottom">');
                        html1.push('<div class="rtime">'+huoniao.transTimes(d.dtime, 2).replace(/-/g, '.')+(d.iphome ? ' · ' + d.iphome : '')+'</div>');
                        html1.push('<div class="rbInfo">');
                        var comdReplayUrl = comdetailUrl.replace("%id%", d.id);
                        html1.push('<a href="'+ comdReplayUrl +'" class="btnReply"> <s></s> '+langData['marry'][5][55]+' </a>');
                        var praise = "";
                        if(d.zan_has == 1){
                            praise = " active";
                        }
                        html1.push('<a href="javascript:;" class="btnUp '+praise+'" data-id="'+d.id+'"> <s></s> <em>'+d.zan+'</em> </a>');
                        html1.push('</div>');
                        html1.push('</div>');
                        html1.push('</div>');
                        html1.push('</li>');
                      }
                  }
                  isload = false;
                  if(page==1){
                    $(".hotList ul").html(html.join(""));
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
             $(".hotList ul").html("");
             $(".newList ul").html('<div class="loading"><span>'+langData['siteConfig'][20][184]+'</span></div>');
          }
        })
    }
	

})

