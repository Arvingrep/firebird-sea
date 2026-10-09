new Vue({
  el:'#page',
  data:{
    searchpage:true,
    keywords:'',
    waimaiHistory:[],
  },
  mounted(){
    var tt = this;
    //加载历史记录
    var history = utils.getStorage('wm_history_search');
    if(history){
      tt.waimaiHistory = history.reverse();
    }
  },
  methods:{
    // 清空关键
    clearKeywords(){
       var tt = this;
       tt.keywords = '';
     },

     // 清除历史记录
    del_history(){
      var tt = this;
      tt.waimaiHistory = [];
      utils.setStorage('wm_history_search', JSON.stringify(tt.waimaiHistory));
      showErrAlert('清除成功'); //'清除成功'
    },
  },
});
