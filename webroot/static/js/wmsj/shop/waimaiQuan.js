$(function(){
  var atpage = 1, isload = false,pageSize=10,totalCount=0;
  getList();


$("#state").change(function(){
  atpage = 1;
  getList();
})

$(".search_btn").click(function(){
  atpage = 1;
  isload = false;
  getList();
})











  // 获取表格数据
  function getList(){
    if(isload) return false;
    isload = true;
    $(".load-container.load6").show();
    var state = $("#state").val();
    var keywd = $(".search_inp input").val();
    $.ajax({
      url: '?action=quanList&page='+atpage+'&state='+state+'&keywords='+keywd,
      type: "POST",
      dataType: "json",
      success: function (data) {
        if(data.state == 100){
          var list  = data.info.list;
          var len = list.length;
          var html = [];
          totalCount = data.info.pageInfo.totalCount;

          showPageInfo()
          $(".noData").html('');
          for(var i = 0; i<len; i++){
            var state = list[i].state;
            var statename = '';
            if(state ==0){
                statename = '领取中';
                if(list[i].sent == 0){
                  statename = '已领完';
                }
            }else{
              statename = '已结束';
            }
            html.push('<tr>');
            html.push('<td>'+list[i].name+'</td>');
            html.push('<td>'+statename+'</td>');
            html.push('<td>'+list[i].deadline+'</td>');
            html.push('<td>'+list[i].limit+'</td>');
            html.push('<td>'+(list[i].received)+' / '+list[i].number+'</td>');
            html.push('<td class="align_center">');
            html.push('<a href="waimaiQuan.php?id='+list[i].id+'&action=quandetail" class="to_link">查看</a>');

            if(statename =='已结束'){

              html.push('<a href="javascript:;" data-id="'+list[i].id+'" class="del">删除</a>');

            }else{

              html.push('<a href="waimaiQuanAdd.php?id='+list[i].id+'" class="edit">修改</a>');
              html.push('<a href="javascript:;" data-id="'+list[i].id+'" onclick="update()" class="end">结束</a>');
              // html.push('<a href="javascript:;" class="link">链接</a>');
            }
            html.push('</td></tr>');
          }
          $("#QuanList table tbody").html(html.join(''));
          atpage++;
          isload = false;
          $(".load-container.load6").hide()
          if(atpage > data.info.pageInfo.totalPage){
            isload = true;
          }
        }else{
          $(".load-container.load6").hide();
          isload = false;
          $("#QuanList table tbody").html('');
          $(".noData").html('');
          $("#QuanList").append('<div class="noData">暂无数据</div>');

        }
      },
      error: function(data){
        alert(data.info)
      },
    })
  };


/*状态更新*/
  $(".page-content").delegate('.end','click', function () {
    var id = $(this).attr('data-id');
    $.ajax({
      url:'?action=end&id='+id,
      type:"POST",
      dataType: "json",
      success:function (data) {
          if(data.state ==100){
            alert("更新成功")
            // windows.reload();
            getList()
          }else{
            alert("更新失败")
          }

      },
      error:function () {

      }
    })
  });

  /*删除*/
  $(".page-content").delegate('.del','click', function () {
    var id = $(this).attr('data-id');
    $.ajax({
      url:'?action=del&id='+id,
      type:"POST",
      dataType: "json",
      success:function (data) {
        if(data.state ==100){
          alert("删除成功")
          // windows.reload();
          getList()
        }else{
          alert("删除失败")
        }

      },
      error:function () {

      }
    })
  });


  // 获取页码信息
  function showPageInfo() {
    var info = $(".pagination");
    var nowPageNum = atpage;
    var allPageNum = Math.ceil(totalCount/pageSize);
    var pageArr = [];
    info.html("").hide();

    var pages = document.createElement("div");
    pages.className = "pagination-pages";
    info.append(pages);

    //拼接所有分页
    if (allPageNum > 1) {

      //上一页
      if (nowPageNum >= 1) {
        var prev = document.createElement("a");
        if(nowPageNum == 1){
          prev.className = "prev disabled";
        }else{
          prev.className = "prev";

        }
        prev.innerHTML = langData['siteConfig'][6][33];//上一页
        prev.onclick = function () {
          atpage = nowPageNum - 1;
          getList();
        }
        info.find(".pagination-pages").append(prev);
      }

      //分页列表
      if (allPageNum - 2 < 1) {
        for (var i = 1; i <= allPageNum; i++) {
          if (nowPageNum == i) {
            var page = document.createElement("span");
            page.className = "curr";
            page.innerHTML = i;
          } else {
            var page = document.createElement("a");
            page.innerHTML = i;
            page.onclick = function () {
              atpage = Number($(this).text());
              getList();
            }
          }
          info.find(".pagination-pages").append(page);
        }
      } else {
        for (var i = 1; i <= 2; i++) {
          if (nowPageNum == i) {
            var page = document.createElement("span");
            page.className = "curr";
            page.innerHTML = i;
          }
          else {
            var page = document.createElement("a");
            page.innerHTML = i;
            page.onclick = function () {
              atpage = Number($(this).text());
              getList();
            }
          }
          info.find(".pagination-pages").append(page);
        }
        var addNum = nowPageNum - 4;
        if (addNum > 0) {
          var em = document.createElement("span");
          em.className = "interim";
          em.innerHTML = "...";
          info.find(".pagination-pages").append(em);
        }
        for (var i = nowPageNum - 1; i <= nowPageNum + 1; i++) {
          if (i > allPageNum) {
            break;
          }
          else {
            if (i <= 2) {
              continue;
            }
            else {
              if (nowPageNum == i) {
                var page = document.createElement("span");
                page.className = "curr";
                page.innerHTML = i;
              }
              else {
                var page = document.createElement("a");
                page.innerHTML = i;
                page.onclick = function () {
                  atpage = Number($(this).text());
                  getList();
                }
              }
              info.find(".pagination-pages").append(page);
            }
          }
        }
        var addNum = nowPageNum + 2;
        if (addNum < allPageNum - 1) {
          var em = document.createElement("span");
          em.className = "interim";
          em.innerHTML = "...";
          info.find(".pagination-pages").append(em);
        }
        for (var i = allPageNum - 1; i <= allPageNum; i++) {
          if (i <= nowPageNum + 1) {
            continue;
          }
          else {
            var page = document.createElement("a");
            page.innerHTML = i;
            page.onclick = function () {
              atpage = Number($(this).text());
              getList();
            }
            info.find(".pagination-pages").append(page);
          }
        }
      }

      //下一页
      if (nowPageNum <= allPageNum) {
        var next = document.createElement("a");
        if(nowPageNum == allPageNum){
          next.className = "next disabled";
        }else{
          next.className = "next";
        }
        next.innerHTML = langData['siteConfig'][6][34];//下一页
        next.onclick = function () {
          atpage = nowPageNum + 1;
          getList();
        }
        info.find(".pagination-pages").append(next);
      }

      info.show();

    }else{
      info.hide();
    }
  }


















})
