
var page = new Vue({
  el:'#page',
  data:{
    navList:navList,  //左侧导航
    currid:currid, //左侧导航当前高亮
    hoverid:'',
    show:'album',  //album和video; 默认显示相册
    videotype:typeof(uptype)!='undefined'?uptype:0, //上传视频默认本地 --- 上传全景
    loading:false, //加载中
    albumList:[],
    videoList:[],  //视频数据 --数组
    quanjingList:[], //全景数据 --数组
    huxingList:[],
    optType:'add',  //add和edit
    // 图片详情
    piliang:false, //批量操作相册
    albumDetailList:typeof(albumDetailList)!='undefined'?albumDetailList:'',  //相册图片列表
    all_chose:false, //是否全选
    delType:1,  //删除类型  1是相册  0是图片
    editArr:'', //编辑数据
  },
  mounted(){
    var tt = this;
    $(".shaixuan span").click(function(){
      var t = $(this);
      tt.show = t.attr('data-id');
      atpag = 1;
      tt.getList(currid,tt.show)
    });
    if(typeof(atpage) != 'undefined'){
      if(currid==3 ){
        // 获取列表
        tt.getList(currid,tt.show)
      }else{
        tt.getList(currid)
      }
    }




/**********************图片详情****************************/
    // 监听图片值变化
    if($('#litpic').size() > 0){

      Object.defineProperty(document.getElementById("litpic"),"value",{
        set:(v)=>{
          document.getElementById("litpic").setAttribute("value",v);
          /**
          *触发chang事件的代码
          */
          if(typeof(v)=='string'){
            var imgList = v.split(',');
            if(imgList > tt.albumDetailList.length){

              var litpic = imgList[imgList.length -  1];
            }
          }
          if(v == ''){
            tt.piliang = false;
            tt.albumDetailList = [];
          }
        }
      });
    }

   $('.piliang').delegate('.pubitem','click',function(){
     var t = $(this);
     t.toggleClass('chosed');
     if($(".pubitem.chosed").length == $(".pubitem").length){
       tt.all_chose = true;
     }else{
        tt.all_chose = false;
     }
   });

   /**********************图片详情****************************/
  },
  methods:{
    // 显示切换账户
    show_change:function(){
      $(".change_account").show();
    },

    // 隐藏切换账户
    hide_change:function(){
      $(".change_account").hide();
    },

    // 显示新增相册的弹窗
    showPop:function(el,type,id,arr){
      var tt = this;
        $(".pop_mask").show();
        if(el == '.confirm_del'){
          tt.delType = type;
          var txt = '',ptxt='';
          if(type == 1){  //删除相册
            var len = $(".imgList_ul li").length;
            txt = '确定删除相册？相册中有<em>'+len+'</em>张照片' ;
            ptxt = '相册一经删除，不可恢复，请谨慎操作';
            $(".confirm_del").attr('data-type',type);
          }else{   //删除所选图片
            var len = $(".imgList_ul li.chosed").length;
            txt = '确定删除选中的'+len+'张照片?' ;
            ptxt = '图片一经删除，不可恢复，请谨慎操作'
            $(".confirm_del").attr('data-type',type);
          }
          $('.confirm_del h3').html(txt);
          $('.confirm_del p').html(ptxt)
        }else if($(el).find('.submit').size()>0){
          if(type=='edit'){
            tt.editArr = arr[id];
            if(tt.editArr.videotype != undefined){
              tt.videotype = Number(tt.editArr.videotype);
            }else if(tt.editArr.typeid != undefined){
              var typeid = tt.editArr.typeid;
              if(typeid ==2 ){
                tt.videotype = 2
              }else {
                tt.videotype = 0
              }
            }

            $(el).find('form').attr('data-id',arr[id].id)
          }else{
            tt.editArr = '';
          }
          $(el).find('.submit').attr('data-type',type)
        }
        $(el).show();
    },

    // 隐藏弹窗
    close_pop:function(){
        $(".pop_mask,.Popbox").hide();
    },

    // 获取数据
    getList:function(currid,type){
      var tt = this;
      // 多页面公用， 需要将接口地址写在页面

      var url = '';

      if(currid == 3){

        if(type == 'video'){
          /*视频*/
          url = masterDomain + '/include/ajax.php?service=house&action=loupanMangeList&type=video&loupanid='+loupanid+"&page="+atpage+"&pageSize=8";

        }else{

          /*相册*/
          url = masterDomain + '/include/ajax.php?service=house&action=loupanMangeList&type=album&loupanid='+loupanid+"&page="+atpage+"&pageSize=8";
        }
      }else if(currid == 4){
        /*全景*/
        url = masterDomain + '/include/ajax.php?service=house&action=loupanMangeList&type=quanjing&loupanid='+loupanid+"&page="+atpage+"&pageSize=8";

      }else if(currid == 5){

        /*户型*/
        url = masterDomain + '/include/ajax.php?service=house&action=apartmentList&act=loupan&loupanid='+loupanid+"&page="+atpage+"&pageSize=8";
      }
      var urlPath = '';
      if(tt.loading) return false;
      tt.loading = true;
      axios({
        method: 'post',
        url: url,
      })
      .then((response)=>{
        tt.loading = false;
        var data = response.data;
        if(data.state ==100){
          if(currid==3){
            if(type == 'video'){

              tt.videoList = data.info.list;
            }else{

              tt.albumList = data.info.list;
            }
          }else if(currid==4){
            tt.quanjingList = data.info.list;
          }else if(currid==5){
            tt.huxingList   = data.info.list;
          }
           totalCount = data.info.pageInfo.totalCount;
           if(atpage==1){
             tt.showPageInfo(currid);
           }
        }else{
          // alert(data.info);
        }
      });
    },
    // 新增相册
    add_album:function(opt){
      /*新增  opt=='add'
      *编辑  opt=='edit'
      */
      var tt = this;
      var title = $('.albuminp input').val();
      $('.albuminp .err_tip').hide()
      if(title == ''){
        $('.albuminp .err_tip').show().html('请输入相册标题');
        return false;
      }
      tt.albumList.push({
        title:title,
        imglist:[],
      });
      tt.close_pop();
      var url ='';
      if(opt =='add'){

        url = masterDomain + '/include/ajax.php?service=house&action=loupanAlbuAdd&actionname=loupan&dopost=add&title='+title+'&loupanid='+loupanid;
      }else {

        url = masterDomain + '/include/ajax.php?service=house&action=loupanAlbuAdd&dopost=edit&dotopost=albumedit&albumid='+albumid+'&title='+title+'&loupanid='+loupanid;

      }

      tt.loading = true;
      axios({
        method: 'post',
        url: url,
      })
      .then((response)=>{
        var data = response.data;
        if(data.state == 100){
          tt.loading = false;
          if(opt == 'edit'){
            alert(data.info);
            window.location.reload()
          }else {
            tt.albumList.push({
              title:title,
              imglist:[],
            });
            tt.close_pop();
            alert(data.info);
            window.location.reload()
          }
        }else{
            $('.err_tip').show().text(data.info);
        }
      });

    },

    // 上传相册
    uploadimg:function(){
      var tt = this;
      $('.pop_videos #filePicker1 input').click();
      $('.pop_videos #filePicker1 input[type="file"]').change(function(){
        tt.showPop('.pop_videos');
      })

    },

    add_img(){
      var tt = this;
      var albunimg = $('.albunimg').val().split('###').join('');

      if(albunimg == ''){
        $('.albuminp .err_tip').show().text('请上传图片');
        return false;
      }
      tt.loading = true;
      axios({
        method: 'post',
        url: masterDomain + '/include/ajax.php?service=house&action=loupanAlbuAdd&dopost=edit&dotopost=picedit&albumid='+albumid+'&imglist='+albunimg+'&loupanid='+loupanid,
      })
          .then((response)=>{
            var data = response.data;
            if(data.state == 100){
              tt.loading = false;
              $("#listSection1 li").remove();
              tt.close_pop();
              // albumDetailList.push(JSON.parse(data.info)[0]);
              tt.albumDetailList = [...tt.albumDetailList,...JSON.parse(data.info)]
              console.log(tt.albumDetailList);
            }else{
              $('.err_tip').show().text(data.info);
            }
          });
    },
    //删除图片
    del_img:function(id,i){
      var tt = this;
      axios({
        method: 'post',
        url: masterDomain + '/include/ajax.php?service=house&action=loupanDel&dopost=delpic&type=album&loupanid='+loupanid+'&delid='+id+'&deltype=1',
      })
      .then((response)=>{
        var data = response.data;
        if(data.state ==100){
          tt.albumDetailList.splice(i,1)
        }else{
          alert(data.info);
        }
      });
    },
    del_video:function(id,i){
      var tt = this;
      axios({
        method: 'post',
        url: masterDomain + '/include/ajax.php?service=house&action=loupanDel&dopost=delAlbum&deltype=3&loupanid='+loupanid+'&delid='+id,
      })
      .then((response)=>{
        var data = response.data;
        if(data.state ==100){
          tt.videolist.splice(i,1)
          alert(data.info);
        }else{
          alert(data.info);
        }
      });
    },
    del_quanjing:function(id,i){
      var tt = this;
      axios({
        method: 'post',
        url: masterDomain + '/include/ajax.php?service=house&action=loupanDel&dopost=delAlbum&deltype=2&loupanid='+loupanid+'&delid='+id,
      })
      .then((response)=>{
        var data = response.data;
        if(data.state ==100){
          tt.quanjingList.splice(i,1)
          alert(data.info);
        }else{
          alert(data.info);
        }
      });
    },
    // 新增视频
    add_video:function(){
      var tt = this;
      var videp_title = $('.videoinp input[name="title"]').val();
      var videp_litpic = $('.videoinp input[name="litpic"]').val();
      var videourl = $('.videoinp input[name="videourl"]').val();
      var video = $('.videoinp input[name="video"]').val();
      var form = $('.pop_videos form')
      var type = $('.pop_videos').find('.submit').attr('data-type');
      var edit_id = form.attr('data-id');
      if(videp_title == ''){
        // $('.videoinp .err_tip').show().text('请输入视频标题');
        alert('请输入视频标题');
        return false;
      }
      if(videp_litpic == ''){
        // $('.videoinp .err_tip').show().text('请上传视频缩略图');
        alert('请上传视频缩略图');
        return false;
      }
      if(video == '' && !tt.videotype){
        // $('.videoinp .err_tip').show().text('请上传视频');
        alert('请上传视频');
        return false;
      }
      if(videourl == '' && tt.videotype){
        // $('.videoinp .err_tip').show().text('请输入视频地址');
        alert('请输入视频地址');
        return false;
      }
      var dopost = 'add';
      if(type =='edit'){
        dopost = 'edit&&aid='+edit_id;
      }
      axios({
        method: 'post',
        data:form.serialize(),
        url: masterDomain + '/include/ajax.php?service=house&action=loupanVideoAdd&dopost='+dopost+'&loupanid='+loupanid,
      })
      .then((response)=>{
        var data = response.data;
        if(data.state ==100){
          tt.close_pop();
          alert(data.info);
        }else{
          alert(data.info);
        }
      });
    },

    // 新增全景
    add_quanjing:function(){
      var tt = this;
      var qj_title = $('.videoinp input[name="title"]').val();
      var qj_litpic = $('.videoinp input[name="litpic"]').val();
      var qj_type   = $('.videoinp input[name="qjtype"]').val();

      var qjurl = $('.videoinp input[name="url"]').val();
      // var qjImgList = $('.videoinp input[name="imglist"]').val();
      var form = $('.pop_videos form');
      // var el = event.currentTarget;
      var optType = $('.formbox').find('.submit').attr('data-type');  //操作 新增还是编辑
      var edit_id = form.attr("data-id");
      optType = optType?optType:'add';
      if(qj_title == ''){
        // $('.videoinp .err_tip').show().text('请输入视频标题');
        alert('请输入全景标题');
        return false;
      }
      if(qj_litpic == ''){
        // $('.videoinp .err_tip').show().text('请上传视频缩略图');
        alert('请上传全景缩略图');
        return false;
      }
      var qjimgArr = [],qjImgList = '';
      $('#listSection2 li').each(function () {
        qjimgArr.push($(this).find('img').attr('data-val'))
      })
      qjImgList = qjimgArr.join(',');
      console.log(tt.videotype)
      if(qjimgArr.length < 6 && !tt.videotype){
        // $('.videoinp .err_tip').show().text('请上传视频');
        alert('请上传全景图片');
        return false;
      }
      if(qjurl == '' && tt.videotype){
        // $('.videoinp .err_tip').show().text('请输入视频地址');
        alert('请输入全景地址');
        return false;
      }

      axios({
        method: 'post',
        data:form.serialize()+'&imgList='+qjImgList,
        url: masterDomain + '/include/ajax.php?service=house&action=loupanQjAdd&dopost='+optType+'&loupanid='+loupanid,
      })
      .then((response)=>{
        var data = response.data;
        if(data.state ==100){
          tt.close_pop();
          alert(data.info);
        }else{
          alert(data.info);
        }
      });
    },

    // 批量选择
    piliang_chose:function(){
      var tt = this;
      var el = event.currentTarget ,par = $(el).closest('.listImgBox');
      $(el).toggleClass('chosed');
      if(par.find('.pubitem.chosed').length == tt.albumDetailList.length){
        tt.all_chose = true;
      }else{
        tt.all_chose = false;
      }
    },

    // 删除所有所选图片
    del_all:function(){
      var tt = this;
      if($(".pubitem.chosed").size()>0){
        tt.showPop('.confirm_del',0);
      }else{
        alert('请至少选择一个删除');
      }
    },

    // 删除相册
    delAlbum:function(){
      var tt = this;
      var type = $(".confirm_del").attr('data-type')
      if(type == 1){  //确认删除相册
        axios({
          method: 'post',
          url: masterDomain + '/include/ajax.php?service=house&action=loupanDel&dopost=delAlbum&deltype=1&loupanid='+loupanid+'&delid='+albumid,
        })
        .then((response)=>{
          var data = response.data;
          if(data.state ==100){
            alert(data.info);
            window.location.href = masterDomain+'/supplier/loupan/albums.html';
          }else{
            alert(data.info);
          }
        });
      }else{  //确认删除图片
          // $(".pubitem.chosed").find('.del_btn').click();
        var idArr = [];
        $(".imgList_li.chosed").each(function () {
          var t = $(this);
          idArr.push(t.attr('data-id'));
          tt.del_img(idArr.join(','))
        })
      }
      tt.close_pop();
    },

    // 分页
    showPageInfo:function(currid) {
      var tt = this;
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
        if (nowPageNum > 1) {
          var prev = document.createElement("a");
          prev.className = "prev";
          prev.innerHTML = langData['siteConfig'][6][33];//上一页
          prev.onclick = function () {
            atpage = nowPageNum - 1;
            tt.getList(currid);
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
                tt.getList(currid);
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
                tt.getList(currid);
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
                    tt.getList(currid);
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
                tt.getList(currid);
              }
              info.find(".pagination-pages").append(page);
            }
          }
        }

        //下一页
        if (nowPageNum < allPageNum) {
          var next = document.createElement("a");
          next.className = "next";
          next.innerHTML = langData['siteConfig'][6][34];//下一页
          next.onclick = function () {
            atpage = nowPageNum + 1;
            tt.getList(currid);
          }
          info.find(".pagination-pages").append(next);
        }

        info.show();

      }else{
        info.hide();
      }
    },

  },
  watch:{
    all_chose:function(){
      var tt = this;
      if(tt.all_chose){
        $(".pubitem").addClass('chosed')
      }else{
        var el = event.currentTarget;
        if($(el).hasClass('all_select')){
            $(".pubitem").removeClass('chosed')
        }
      }

    }
  }
});
