$(function(){
    var page = 1;
    var title = '';
getList();
  // 吸顶
var xiding = $(".search-box"),chtop = parseInt(xiding.offset().top);
$(window).on("scroll", function() {
    var thisa = $(this);
    var st = thisa.scrollTop();
    var sct = $(window).scrollTop();
    if (st >= chtop) {
      $(".search-box").addClass('choose-top');
    } else {
      $(".search-box").removeClass('choose-top');
    }
    if (sct + $(window).height() >= $(document).height()) {
        page++;
       getList();
    }

  });






function getList(){
    $.ajax({
        url : '/include/ajax.php?service=video&action=alist&pageSize=10&page=' + page + '&title=' + title + '&orderby=2',
        data : '',
        type : 'get',
        dataType : 'json',
        success : function (data) {
            if(data.state == 100){
                var list = data.info.list;
                var len = list.length;
                var html = [];
                for (var i = 0; i < len; i++) {
                    html.push('<li>');
                    html.push('<a href="'+list[i].url+'">');
                    html.push('<div class="tc_img"><img src="'+list[i].litpic+'"></div>');
                    html.push('  <div class="zhezhao"></div>');
                    html.push('<p class="text">'+list[i].title+'</p>');
                    html.push('<p class="ic_list"><span class="ic_01">'+list[i].click+'</span><span class="ic_02">'+list[i].zanCount+'</span><span class="ic_03">'+list[i].common+'</span></p>');
                    html.push('</a>');
                    html.push('</li>');
                }
                $(".tc_list ul").append(html.join(""));

            }else{
                $(".tc_list ul").html('<p style="color: #fff2f2; margin-top: 5px; margin-left: 169px;">暂无数据！</p>');

            }

        }
    })


}

    $(".search-btn").click(function () {
        var key = $(".txt_search").val();
        title = key;
        $(".tc_list .fn-clear").html('');
        getList();
    })


})
