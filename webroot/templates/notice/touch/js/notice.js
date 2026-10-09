$(function(){

  var listObj = $('.list');

	// 下拉加载
	var isload = false, isend = false;
	$(window).scroll(function() {
		var h = $('.list .item').height();
		var allh = $('body').height();
		var w = $(window).height();
		var scroll = allh - h - w;
		if ($(window).scrollTop() > scroll && !isload && !isend) {
			page++;
			getList();
		};
	});

  getList();

  // 异步获取列表
  function getList(){
    isload = true;

    listObj.append('<div class="loading">加载中..</div>');

    $.ajax({
      url: "include/ajax.php?service=siteConfig&action=notice&page="+page+"&pageSize="+pageSize,
      type: "GET",
      dataType: "json",
      success: function(data){

        if (data) {
          $('.loading').remove();
          if (data.state == 100) {
            var list = data.info.list, html = [], pageInfo = data.info.pageInfo;
            for (var i = 0; i < list.length; i++) {
              var pubdate = huoniao.transTimes(list[i].pubdate, 1);

              html.push('<div class="item">');
              html.push('<a href="'+list[i].url+'">');
              var color = list[i].color ? ' style="color: '+list[i].color+'"' : '';
              html.push('<p class="title"'+color+'>'+list[i].title+'</p>');
              html.push('<p class="desc">'+list[i].description+'</p>');
              html.push('<p class="time">'+pubdate+'</p>');
              html.push('</a>');
              html.push('</div>');

            }
            listObj.append(html.join(""));

            if(page >= pageInfo.totalPage){
              isend = true;
  						$(".list").append('<div class="empty">已加载全部信息！</div>');
  					}
            isload = false;

          }else {
            isload = false;
            listObj.append('<div class="loading">'+data.info+'</div>')
          }
        }
      }
    })
  }


})
