  var ue;
$(function(){
    ue = UE.getEditor("container");
})
var page = new Vue({
  el:"#page",
  data:{
    loading:false,
    navList:navList,  //左侧导航
    currid:currid, //左侧导航当前高亮
    hoverid:'',
    loading:false,
    article_id:id,
  },
  mounted(){

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
