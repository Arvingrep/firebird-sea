$(function () {
    var orderpage = 1;
    var pageSize  = 10;
    var isload = false;
    var  objId = $('.wrap .cont_ul');

    //加载
    $(window).scroll(function() {
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w;
        if ($(window).scrollTop() >= scroll && !isload) {
			orderpage++;
            getList();
        };
    });
	
	 $(".wrap").delegate(".del","click",function(){ 
	        showMsg();
	        var that=$(this), id = that.attr('data-id');
	        $('.yes').click(function(){
	            if(id!=''){
	              $.ajax({
	                url:"/include/ajax.php?service=homemaking&action=operNanny&oper=del&id="+id,
	                type: "GET",
	                dataType: "json",
	                success: function (data) {
	                  if(data.state=100){
	                    that.closest('li').remove();
	                    closeMsg();
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
	         $('.no').click(function(){
	            closeMsg()
	        })
	
	    });

	 //信息提示框
	    function showMsg(){
	      var alert_tip = $(".alert_tip");
	      alert_tip.show();
	    }
	    function closeMsg(){
	      var alert_tip = $(".alert_tip");
	      alert_tip.hide();
	    }
    getList(1);
    objId.delegate('li','click',function(e){
      var url = $(this).attr('data-url');
      // if(e.target == $(this).find('tel a')[0] || e.target == $(this).find('tel a')[0])
      if($(e.target).closest('.tel').length > 0 || $(e.target).closest('.btn_group').length > 0){

      }else{
        window.location.href = url
      }


    })
    function getList(item) {
        if(isload) return false;
        isload = true;
        if(item){
            objId.html('');
        }
        objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');

        $.ajax({
            url: masterDomain+"/include/ajax.php?service=homemaking&action=nannyList&u=1&orderby=2&page="+orderpage+"&pageSize="+pageSize,
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
                    var urlString = editUrl + param;

                    for(var i = 0; i < list.length; i++){
                      var item           = [],
                          id             = list[i].id,
                          username       = list[i].username,
                          age            = list[i].age,
                          placename      = list[i].placename,
                          educationname  = list[i].educationname,
                          url            = list[i].url,
                          photo          = list[i].photo,
                          experiencename = list[i].experiencename,
                          tel            = list[i].tel,
                          pubdate        = huoniao.transTimes(list[i].pubdate, 1);

                        url = list[i].state != "1" ? 'javascript:;' : url;

                        html.push('<li class="fn-clear" data-url="'+list[i].url+'">');
                        html.push('<div class="left_b"><a href="'+url+'"><img src="'+huoniao.changeFileSize(photo, "small")+'" alt=""></a></div>');
                        html.push('<div class="right_b">');
                        html.push('<p class="peo_manage"><span class="peo_name">'+username+'</span></p>');//管理
                        html.push('<ul class="info">');
                        html.push('<li>'+age+langData['homemaking'][8][82]+'</li><li>'+placename+langData['homemaking'][8][83]+'</li><li>'+educationname+'</li><li>'+experiencename+'</li>');
                        html.push('</ul>');
                        html.push('<p class="tel"><a href="tel:'+tel+'">'+tel+'</a></p>');
                        html.push('</div>');
						html.push('<div class="btn_group"><span class="mana"><a href="'+urlString+id+'">'+langData['homemaking'][3][30]+'</a></span><span class="del d_btn" data-id="'+id+'">'+langData['homemaking'][11][3]+'</span></div>') /*统计 订单 移除*/
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
