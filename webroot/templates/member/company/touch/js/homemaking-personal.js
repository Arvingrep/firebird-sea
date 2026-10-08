$(function () {
    //信息提示框
    function showMsg(){
      var alert_tip = $(".alert_tip");
      alert_tip.show();
    }
    function closeMsg(){
      var alert_tip = $(".alert_tip");
      alert_tip.hide();
    }

    $(".wrap").delegate(".del","click",function(){
        showMsg();
        var that=$(this), id = that.attr('data-id');
        $('.yes').click(function(){
            if(id!=''){
              $.ajax({
                url: masterDomain + "/include/ajax.php?service=homemaking&action=operPersonal&oper=del&id="+id,
                type: "GET",
                dataType: "jsonp",
                success: function (data) {
                  if(data.state=100){
                    that.closest('.fuwu_peo').remove();
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

    //添加人员信息提示框
    function addMsg(){
      var add_tip = $(".add_tip");
      add_tip.show();
    }
    function cloMsg(){
      var add_tip = $(".add_tip");
      add_tip.hide();
    }
    $('.alert_tip .alert_content ul li').click(function () {
        //$(this).toggleClass('active').siblings().removeClass('active')
     });
    $('.baomu_manage_footer p').click(function () {
        addMsg();
        $('.cancel').click(function(){
            cloMsg();
        })

    });

    $(".confirm").click(function(e){
      e.preventDefault();
      var t = $("#fabuForm"), action = t.attr('data-action'), r = true;t.attr('action', action);

      var add_account = $('#add_account').val();

      if(add_account==''){
        r = false;
        alert(langData['homemaking'][9][6]);
      }

      if(!r){
        return;
      }

      $.ajax({
        url: action,
        data: t.serialize(),
        type: 'post',
        dataType: 'json',
        success: function(data){
          if(data && data.state == 100){
            cloMsg();
            getList(1);
          }else{
            alert(data.info);
          }
        },
        error: function(){
          alert(langData['siteConfig'][6][203]);
        }
      });

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
            orderpage++;
            getList();

        };
    });

    getList(1);

	// 页面跳转
	$('body').delegate('span','click',function(){
		var t = $(this);
		if(!t.hasClass('del')){
			console.log('hah')
			var url = t.attr('data-url');
			if(url){
				window.location.href = url;
			}
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
                    var urlString = editUrl + param;

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

                        var courierURl = courierurl.replace("%id%", id);
                        var countrURL = countrurl.replace("%id%", id);
                        html.push('<li class="fuwu_peo fn-clear">');
                        // if(photo!=''){
                            html.push('<div class="left_b"><a href="'+courierURl+'"><img src="'+(photo?photo:"/static/images/noPhoto_60.jpg")+'" alt=""></a></div>');
                        // }
                        html.push('<div class="right_b">');
                        html.push('<p class="peo_manage"><a href="'+courierURl+'"><span class="peo_name">'+username+'</span></a><span data-id="'+id+'" class="mana del fn-hide">'+langData['homemaking'][3][20]+'</span></p>');//删除
                        html.push('<ul class="info fn-clear">');
                        html.push('<li><span class="order">'+langData['homemaking'][9][4]+'</span><span class="order_num">'+onlineorder+'</span></li>');//服单
                        html.push('<li><span class="order">'+langData['homemaking'][9][5]+'</span><span class="order_num">'+endorder+'</span></li>');//结单
                        html.push('</ul>');
                        html.push('<p class="tel"><a href="tel:'+tel+'">'+tel+'</a></p>');
                        html.push('</div>');
						html.push('<div class="btn_group"><span style="display: none;" class="c_btn" data-url="">'+langData['homemaking'][11][1]+'</span><span class="o_btn"  data-url="'+courierURl+'">'+langData['homemaking'][11][2]+'</span><span class="del d_btn" data-id="'+id+'">'+langData['homemaking'][11][3]+'</span></div>') /*统计 订单 移除*/

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
