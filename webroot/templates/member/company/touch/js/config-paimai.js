new Vue({
    el:"#fabuContainer",
    data:{
        showPicker:false, //是否显示分类弹窗
        typeList:[],
        formData:{
            id:0,
            tel:tel,
            wechatcode:wechatcode, //微信号
            // stype:type,  //分类id
            stypename:typename, //分类名

            address:address, //地址
            cityid:cityid, //城市id
            addrid:addrid, //区域id
            lng:lng, //经度
            lat:lat, //纬度
        },

        showArea:false,
        areaList:[],
        cascaderValue:[],
        typename:'',
    },
    mounted(){
        var tt = this;
        tt.getCategory();

        var infoData = localStorage.getItem('infoData');
        if(infoData){
            infoData = JSON.parse(infoData);
            tt.checkData(infoData);
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

        


        // 获取分类
        getCategory(){
            var tt = this;
            $.ajax({
                url:'/include/ajax.php?service=paimai&action=type',
                type:'get',
                dataType:'json',
                success:function(data){
                    if(data.state == 100){
                       console.log(data.info)
                       tt.typeList = data.info.map(function(item){
                           
                            return {
                                value:item.id,
                                text:item.typename,
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
            // var idArr = [];
            // var arr = tt.typeList;
            // console.log(value)
            // for(var i = 0; i < ind.length; i++){
            //     idArr.push( arr[ind[i]].value);
            //     arr = arr[ind[i]].children;
            // }
           tt.formData.stypename = value['text']
           tt.formData.stype = value['value'];
           tt.showPicker = false;
        },

        // 数据处理
        checkData(data){
            var tt = this;
            for(var i = 0; i < data.length; i++){
                if(tt.formData[data[i].name] != undefined){
                    tt.formData[data[i].name] = data[i].value;
                    
                }

                if(data[i].name == 'stypename'){
                    tt.typename = tt.formData[data[i].name]
                    console.log(tt.formData[data[i].name])
                }

                if(data[i].name == 'district'){
                    district = JSON.parse(data[i].value);  
                    console.log(district)
                    tt.formData['lng'] = district.point.lng;
                    tt.formData['lat'] = district.point.lat;
                    tt.checkAddr(district)
                }
            }
        },

        // 地区选择
        checkAddr(districtInfo){
            var city = districtInfo.address.split(' ')[0]
            var district = districtInfo.title
            var tt = this;
            $.ajax({
            url: '/include/ajax.php?service=siteConfig&action=verifyCityInfo&city='+city+'&district='+district,
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    var addrArr = data.info.ids;
                    var addrname = data.info.names;
                    $(".chose_area").attr('data-ids',addrArr.join(' ')).attr('data-id',addrArr[addrArr.length - 1]);
                    $(".chose_area p.city").text(addrname.join(' '))
                    $('.chose_area ').attr('data-addrname',addrname.join(' '));
                    tt.formData['addrid'] = addrArr[addrArr.length - 1];
                    tt.formData['cityid'] = addrArr[0];

                }
            },
            error: function(){}
            });
        },

        // 跳转至地址选择
        toAddress(){
            var tt = this;
            var infoData = [];
            for(item in tt.formData){
                infoData.push({name:item,'value':tt.formData[item]});
            }
            infoData.push({name:'returnUrl','value':window.location.href});
            localStorage.setItem('infoData',JSON.stringify(infoData))
            window.location.href = (memberUrl + '/mapPosi.html?noPosi=1&currentPageOpen=1');
        },



        //   获取区域

        getArea(){
            var tt = this;
            $.ajax({
                url:'/include/ajax.php?service=siteConfig&action=addr',
                type:'get',
                dataType:'json',
                success:function(data){
                    if(data.state == 100){
                        tt.areaList = data.info;
                    }
                }
            });
        },

        //  地址选择
        onFinish(e){},

        // 提交数据
        onSubmit:function(values){
            var tt = this;
            var idStr  = '';
            if(id){
                idStr = '&id='+id;
            }
            $.ajax({
                url:'/include/ajax.php?service=paimai&action=storeConfig' + idStr,
                type:'post',
                data:tt.formData,
                dataType:'json',
                success:function(data){
                    if(data.state == 100){
                        showErrAlert(data.info);
                    }else{
                        showErrAlert(data.info)
                        
                    }
                },
                error:function(err){}
            })
        },

      


      
    },
    
})