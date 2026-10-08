var ue;
var pageVue = new Vue({
  el:"#page",
  data:{
    loading:false,
    navList:navList,  //左侧导航
    currid:currid, //左侧导航当前高亮
    hoverid:'',
    loading:false,
    article_id:id,
    buildListData:buildList, //楼栋列表
    buildActive:'', //选中的楼栋名
    houseNumber:'', //房号
    houseId:'', //关联户型
    unitNumber:'', //单元号
    priceNumber:'', //活动价
    oldPrice:'', //挂牌价
    startTime:'', //开始时间
    endTime:'', //结束时间
  },
  mounted(){
    let tt = this;
    $("#deliverdate, #opendate").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch'}).on('change',function(e){
      const id = $(this).attr('id');
      switch(id) {
        case 'deliverdate':
          tt.startTime = $(this).val();
          break;
        case 'opendate':
          tt.endTime = $(this).val();
          break;
      }
    });
    if(this.article_id) this.getDetail();
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
      axios({
				method: 'post',
				url:`/include/ajax.php?service=house&action=route&route=property/${this.article_id?'editLoupanSpecial':'addLoupanSpecial'}&lpid=${loupanid}&id=${this.article_id||''}`,
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
    },
    async getDetail() {
      let result = await axios({
        method: 'post',
        url: `/include/ajax.php?service=house&action=route&route=property/loupanSpecialData&id=${this.article_id}`,
      });
      if (result.data.state == 100) {
        let detail = result.data.info.data;
        this.buildActive = detail.building; //选择楼栋
        this.unitNumber = detail.unit; //单元号
        this.houseNumber = detail.number; //房号
        this.houseId = detail.housetype; //关联户型
        this.priceNumber = detail.price; //活动价
        this.oldPrice = detail.oldprice; //挂牌价
        let sdate = new Date(detail.start_time*1000);
        this.startTime = `${sdate.getFullYear()}-${sdate.getMonth()+1}-${sdate.getDate()}`; //开始时间
        let edate = new Date(detail.end_time*1000);
        this.endTime = `${edate.getFullYear()}-${edate.getMonth()+1}-${edate.getDate()}`; //结束时间
      }
    }
  },
  computed: {
    buildItem(){ //选中楼栋项
      return this.buildListData.filter(res=>res.name == this.buildActive)[0];
    },
    houseListData(){
      return this.buildItem?.houseType;
    }
  }
})
