new Vue({
    el:"#fabuContainer",
    data:{
        fileList:[],  //上传的图片
        picsObj:[],
        litpicObj:[],
        formData:{
            title:"", //标题
            amount:"",  //保证金
            start_money:"", //起拍价
            min_money:'', //最低价/保留价
            add_money:"", //加价幅度

            add_interval:'',  //延时周期
            pay_limit:'', //支付限制
            startdate:'', //开始时间
            enddate:'', //结束时间

            maxnum:'1', //最大拍品数
            jy_type:'0', //交易类型
            ptype:'', //类型id
            typename:'', //类型id
            pics:'', //图片
            picsArr:[],
            
            body:'', //详情
        },
        date:'',
        show:false, //日期显示,
        typeList:[], //类型列表
        showPicker:false, //日期选择器显示

        minDate:new Date(), //开始最小日期
        showStarttime:false, //开始时间显示
        startdate:'', //开始时间


        minDate2:new Date(), //结束最小日期
        showEndtime:false, //结束时间显示
        enddate:'', //结束时间
    },
    mounted(){
        var tt = this;
        tt.getCategory();

        var isStart = false;

        $('.editCon').on('blur',function(){
            tt.formData.body =  $(this).html();
        })

        if(id){
            tt.getDetail();
        }
    },
    computed:{
        transTime(){
            return function(timeStr){
                var time = timeStr ?  huoniao.transTimes(timeStr, 1) : '';
                return time;
            }
        }
    },
    methods:{

        getDetail:function(){
            var tt = this;
            if(id){
                $.ajax({
                    url:'/include/ajax.php?service=paimai&action=detail&id='+id,
                    type:'get',
                    dataType:'json',
                    success:function(data){
                        if(data.state == 100){
                           for(item in data.info){
                                tt.formData[item] = data.info[item];
                                if(item == 'enddate' || item == 'startdate'){
                                    tt[item] = new Date(data.info[item]);
                                }

                                if(item == 'ptype' ||  item == 'typeid'){
                                    tt['ptype'] = data.info[item]
                                }
                                if(item == 'litpicUrl'){
                                    tt.litpicObj = [{
                                        url:data.info[item].toString()
                                    }];
                                }
                                if(item == 'jy_type'){
                                    tt.formData[item] = data.info[item].toString();
                                }
                                if(item == 'pics'){
                                    tt.formData.picsArr = data.info[item];
                                    tt.formData.pics = data.info[item].join('||');
                                }
                                if(item == 'picsUrl'){
                                    tt.picsObj = data.info[item];
                                    tt.fileList = data.info[item].map(function(pic){
                                        return {
                                            url:pic,
                                        
                                        }
                                    });
                                }
                           }
                        }
                    }
                });
            }
        },


        // 获取分类
        getCategory(){
            var tt = this;
            $.ajax({
                url:'/include/ajax.php?service=paimai&action=type&son=1',
                type:'get',
                dataType:'json',
                success:function(data){
                    if(data.state == 100){
                       console.log(data.info)
                       tt.typeList = data.info.map(function(item){
                            var children = item.lower.map(function(item){
                                return {
                                    value:item.id,
                                    text:item.typename
                                }
                            })
                            return {
                                value:item.id,
                                text:item.typename,
                                children:children,
                            }
                        });
                        console.log(tt.typeList)
                    }
                }
            });
        },

        // 分类选择
        onConfirmType(value,ind){
            var tt = this;
            var idArr = [];
            var arr = tt.typeList;
            for(var i = 0; i < ind.length; i++){
                idArr.push( arr[ind[i]].value);
                arr = arr[ind[i]].children;
            }
           tt.formData.typename = value[value.length - 1]
           tt.formData.ptype = idArr[idArr.length-1];
           tt.showPicker = false;
        },

        // 拍卖开始时间确认
        onConfirmStarttime(value){
            var tt = this;
            tt.formData.startdate = parseInt(value.getTime()/1000);
            console.log(tt.formData.startdate)
            tt.minDate2 = value;
            tt.showStarttime = false;
            tt.startdate = value
        },
        // 拍卖end时间确认
        onConfirmEndtime(value){
            var tt = this;
            tt.formData.enddate = parseInt(value.getTime()/1000);
            tt.showEndtime = false;
            tt.enddate = value
        },

        formatter(type, val) {
            if (type === 'year') {
              return val + '年';
            }
            if (type === 'month') {
              return val + '月';
            }
            if (type === 'day') {
              return val + '日';
            }
            if (type === 'minute') {
              return val + '分';
            }
            if (type === 'hour') {
              return val + '时';
            }
            return val;
          },

        // 提交数据
        onSubmit:function(values){
            var tt = this;
            if(tt.formData.litpic == ''){
                showErrAlert('请上传商品主图');
                return false;
            }
            if(tt.formData.picsArr.length <= 1){
                showErrAlert('请至少上传2张图集');
                return false;
            }
            tt.formData.pics = tt.formData.picsArr.join('||');

            var idStr = '';
            var opt = 'put';
            if(id != '0'){
                idStr = '&id='+id;
                opt = 'edit';
            }
            $.ajax({
                url:'/include/ajax.php?service=paimai&action='+ opt + idStr,
                type:'post',
                data:tt.formData,
                dataType:'json',
                success:function(data){
                    if(data.state == 100){
                        showErrAlert('发布成功')
                        window.location.href = manageURl;
                    }else{
                        showErrAlert(data.info)
                        
                    }
                },
                error:function(err){}
            })
        },

      


        // 图集
        onRead(file) {
            var tt = this;
            if(file && file.length && file.length > 0){
                for(var i = 0; i < file.length; i++){
                    tt.uploadImg(file[i].file);
                }
            }else{
                tt.uploadImg(file.file);
            }   
        },
        onReadLitpic(file) {
            var tt = this;
            if(file && file.length && file.length > 0){
                for(var i = 0; i < file.length; i++){
                    tt.uploadImg(file[i].file,1);
                }
            }else{
                tt.uploadImg(file.file,1);
            }   
        },

        onReadBody(file) {
            var tt = this;
            if(file && file.length && file.length > 0){
                for(var i = 0; i < file.length; i++){
                    tt.uploadImg(file[i].file,2);
                }
            }else{
                tt.uploadImg(file.file,2);
            }   
        },

        /**
         * 上传图片
        */
        uploadImg (file,type) {
            var tt = this;
            // 创建form对象
            let formdata1 = new FormData();
            // 通过append向form对象添加数据,可以通过append继续添加数据
            
            formdata1.append('Filedata', file);
            formdata1.append('name',  file.name);
            formdata1.append('lastModifiedDate',   file.lastModifiedDate);
            formdata1.append('id',  'WU_FILE_' + tt.fileList.length);


            // return false;
            //设置请求头
            let config = {
                headers:{
                    'Content-Type':'multipart/form-data'
                }
            };  
            //this.axios 是因为在main.js写在vue实例里
            const axiosAjax = axios.create({
                timeout: 1000 * 60, //时间
                withCredentials: true //跨域携带cookie
            });
            axiosAjax.post('/include/upload.inc.php?mod=paimai&type=atlas',formdata1,config).then((res)=>{   //这里的url为后端接口
                // console.log(res.data);
                //res 为接口返回值
                if(type && type == 1){
                    tt.formData.litpic = res.data.url; //图片值
                    // tt.litpicObj.push(res.data)
                }else if(type && type == 2){
                    tt.formData.body = tt.formData.body + '<div class="imgPath"><img src='+res.data.turl+'></div>'; //图片值
                }else{
                    tt.formData.picsArr.push(res.data.url); //图片值
                    tt.picsObj.push(res.data)
                    tt.formData.pics = tt.formData.picsArr.join('||');
                    console.log(tt.fileList)
                }
            }).catch(() => {})
        }
    },
    // watch:{
    //     picsArr(val){
    //         var tt = this;
    //         tt.formData.pics = val.join('||');
    //     }
    // }
})