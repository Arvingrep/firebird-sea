

var map ,  point,myIcon,marker,myGeo;
var map_default_lng = $("#lng").val() ? $("#lng").val() : 0;  //定位
var map_default_lat = $("#lat").val()? $("#lat").val() : 0;
var city = $("#city").val();
var addr = $("#addr").val();
var pid,cid,did,tid;
var autocomplete
mapPop = new Vue({
    el:'#public_mapContainer',
    data:{
        // 弹窗
        confirmPop:false, //显示or隐藏
        confirmPopInfo:{
            icon:'error',
            title:'企业资料保存成功',
            tip:'继续完善信息可优化企业形象、提升招聘效果！',
            btngroups:[
                {   
                    tit:'继续完善资料',
                    fn:'',
                    type:'primary',
                },
                {
                    tit:'直接发布职位',
                    fn:'',
                    type:'primary',
                },
                {
                    tit:'预览主页',
                    fn:'',
                }
            ]
        },

       
       
    },
    mounted(){

    },

    methods:{   
        btnClick(fn){
            var tt = this;
            if(fn){
                fn()
            }
            tt.confirmPop = false;
        }
    },


    watch:{

        
    }
})