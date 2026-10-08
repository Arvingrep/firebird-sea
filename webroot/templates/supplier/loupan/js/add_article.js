
var ue;
$(function(){
    ue = UE.getEditor("container");
})
var pageVue = new Vue({
  el:"#page",
  data:{
    loading:false,
    navList:navList,  //左侧导航
    currid:currid, //左侧导航当前高亮
    hoverid:'',
    loading:false,
    article_id:id,
    type:[
      {
        id:5,
        title:'公告',
      },
      {
        id:3,
        title:'样板间',
      },
      {
        id:4,
        title:'社区配套',
      },
      {
        id:2,
        title:'周边设施',
      },
      {
        id:1,
        title:'现场动态',
      }
    ],
    typeActive:detailData.type||5,
    title:detailData.title||'',//标题
    info:detailData.body||'', //动态详情
    images:detailData.images||'', //图片
    images_url:detailData.images_url||'',
    videos:detailData.videos||'',//视频
    videos_url:detailData.videos_url||'',
  },
  mounted(){
    backsuccessFn = result => {
      this.$nextTick(res=>{
        if(result.type=='video'){
          this.videos = result.url;
          this.videos_url = result.turl;
        }else{
          this.images = result.url;
          this.images_url = result.turl;
        }
      })
    }
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

    // 提交
    submit:function(){
      var tt = this;
      var form  = $("#form");
      if(tt.loading) return false;
      tt.loading = true;
      if($('input[name="title"]').val() == ''){
        alert($('input[name="title"]').attr('placeholder'));
        return false;
      }
      var dopost = id==''?'add':'edit';
      ue.sync()
      axios({
				method: 'post',
				url:'/include/ajax.php?service=house&action=loupanNewAdd&dopost='+dopost+'&loupanid='+loupanid+"&aid="+id,
        data:form.serialize(),
			  })
			  .then((response)=>{
				var data = response.data;
				tt.loading = false;
				if(data.state == 100){
					alert(data.info);
				  location.reload();
				}else{
					alert(data.info)
				}
			 });
      console.log(form.serializeArray())
    },
  }
})
