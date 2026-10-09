new Vue({
    el:'#page',
    data:{
        terminalList:[{ id:'h5', name:'H5' ,hasSet:0,busiHasSet:0},{ id:'android', name:'安卓端' ,hasSet:0,busiHasSet:0},{ id:'ios', name:'苹果端' ,hasSet:0,busiHasSet:0},{ id:'harmony', name:'鸿蒙端' ,hasSet:0,busiHasSet:0},{ id:'wxmini', name:'微信小程序',hasSet:0,busiHasSet:0 },{ id:'dymini', name:'抖音小程序',hasSet:0,busiHasSet:0 }],
        keyword:'', //搜索关键字
        useDiy:userCenterTouchTemplateType == 0 ? false : true, //是否开启diy模式,
        busiDiy:busiCenterTouchTemplateType == 0 ? false : true, //是否开启diy模式,
        currPage:pagetype, //index => 首页  member => 个人中心  business => 商家中心
        indexList:[], //首页列表
        memberList:[], //个人中心的模板列表
        businessList:[], //个人中心的模板列表
        delObj:{}, //删除的对象
        dialogVisible:false, //确认删除弹窗是否显示
        stateList:[{val:1,text:'应用中'},{val:0,text:'未应用'}],
        formData:{
            state:'',
            platform:'',
            keyword:'',
        },
        indexPageCount:indexPageCount,
        memberPageCount:memberPageCount,
        businessPageCount:businessPageCount,
        platformList:JSON.parse(platformList)
    },
    mounted(){
        const that = this;
        that.getModelList(); //模板列表获取
    },
    methods:{
        changeUrl(){
            let type = this.currPage;
            let url = location.href;
            url = url.split('?')[0]
            history.replaceState('','',url + '?type=' + type )
        },
        // 获取模板列表
        getModelList(reload){
            const that = this;
            if(that[that.currPage + 'List'] &&  that[that.currPage + 'List'].length > 0 && !reload) return false; // 已获取过
            let formData = {};
            if(that.currPage == 'index'){
                formData = that.formData
            }
            $.ajax({
                url: `?dopost=${that.currPage}`,
                type: "GET",
                dataType: "json",
                data:formData,
                success: function (data) {
                    if(data.state == 100){
                        that.$set(that,that.currPage + 'List',data.info);
                        console.log(that.businessList)
                        if(that.currPage == 'member' || that.currPage == 'business' ){
                            that.checkModelIn(data.info)
                        }
                        if(that.currPage == 'business'){
                            that.businessPageCount = that.businessList.length;
                        }
                    }
                },
                error: function () { }
            });
        },

        // 验证是否设置过模板
        checkModelIn(list){
            const that = this;
            for(let i = 0 ; i < list.length; i++){
                let dItem = list[i];
                let obj = that.terminalList.find(item => {
                    return dItem.key == item.id
                })
                if(that.currPage == 'member'){
                    that.$set(obj,'hasSet',1)
                    that.$set(obj,'obj',dItem)
                }else{
                    that.$set(obj,'busiHasSet',1)
                    that.$set(obj,'busiObj',dItem)

                }
            }
        },


        // 取消/应用/删除
        updateState(item,type){
            const that = this;
            let param = [];
            param.push(`platform=${item.key ? item.key : item.id}`); //终端
            if(type == 'state'){
                param.push(`state=${item.state == 0 ? 1 : 0}`); //状态
            }else{
                param.push(`del=1`); //删除
            }
            if(that.currPage == 'index'){
                param.push(`cityid=${item.cityid}`); //城市分站
            }

            
           
            $.ajax({
                url: `?dopost=updateState&type=${that.currPage}`,
                type: "POST",
                dataType: "json",
                data:param.join('&'),
                success: function (data) {
                    if(data.state == 100){
                        that.$message({
                            message: '操作成功',
                            type: 'success'
                        });
                        if(type == 'state'){
                            // 修改应用状态时 需要进行下一步操作
                            if(that.currPage == 'index' && item.cityid == 0 && item.key != 'app'){
                                that.toNextStep(item)
                            }
                            that.$set(item,'state',(item.state == 0 ? 1 : 0));
                        }else{
                            let ind = that[that.currPage + 'List'].findIndex(obj => {
                                return item.cityid == obj.cityid && item.key == obj.key
                            })
                            that[that.currPage + 'List'].splice(ind,1);
                            if(that.currPage == 'member'){
                                that.checkModelIn(that.memberList);
                            }
                        }
                    }else{
                        that.$message({
                            message: data.info,
                            type: 'error'
                        });
                    }
                },
                error: function () { }
            });
        },

        // 应用时 需要进行下一步
        toNextStep(item){ //item表示当前应用的  没有表示设置个人中心diy模式是否开启
            const that = this;
            let state = that.currPage == 'member' ? that.useDiy  : that.busiDiy 
            let originState = item ? item.state : (state ? 1 : 0);
            let template = that.currPage == 'index' ? (originState == 1 ? '' : 'diy') : (originState == 1 ? 0 : 1); 
            let action = that.currPage == 'index' ? 'touchTemplate' : (that.currPage == 'member' ? 'userCenterTemplate' : 'busiCenterTemplate')
            let url = `siteConfig.php?action=${action}`;
            if(that.currPage == 'index'){
                switch(item.key){
                    case 'wxmini':
                        url = `../wechat/wechatConfig.php?action=touchTemplate`
                    break;

                    case 'dymini':
                        url = `/include/plugins/20/index.php?action=save&dopost=touchTemplate`
                    break;
                }
            }
            $.ajax({
                url: url,
                type: "POST",
                dataType: "json",
                data:`template=${template}&token=${token}`,
                success: function (data) {
                    if(data.state == 100){
                        $.get("siteClearCache.php?action=do");
                        if(that.currPage == 'member'){
                            that.useDiy = !that.useDiy;
                            that.$message({
                                message: data.info,
                                type: 'success'
                            });
                        }else if(that.currPage == 'business'){
                            that.busiDiy = !that.busiDiy;
                            that.$message({
                                message: data.info,
                                type: 'success'
                            });
                        }
                    }else{
                        that.$message({
                            message: data.info,
                            type: 'error'
                        });
                    }
                },
                error: function () { }
            });
        },


        // 弹窗提示
        showDialog(item){
            const that = this;
            console.log(item)
            that.delObj = item;
            that.dialogVisible = true
        },

        //转换PHP时间戳
        transTimes: function(timestamp, n){
    
            const dateFormatter = this.dateFormatter(timestamp);
            const year = dateFormatter.year;
            const month = dateFormatter.month;
            const day = dateFormatter.day;
            const hour = dateFormatter.hour;
            const minute = dateFormatter.minute;
            const second = dateFormatter.second;
    
            if(n == 1){
                return (year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second);
            }else if(n == 2){
                return (year+'-'+month+'-'+day);
            }else if(n == 3){
                return (month+'-'+day);
            }else if(n == 4){
                let curryear  = new Date().getFullYear();
                if(curryear == year){
                    return ( month + '-' + day + ' ' + hour + ':' + minute );
                }else{
                    return (year + '-' + month + '-' + day + ' ' + hour + ':' + minute );
                }
            }else{
                return 0;
            }
        },
    
        //判断是否为合法时间戳
        isValidTimestamp: function(timestamp) {
            return timestamp = timestamp * 1, Number.isFinite(timestamp) && timestamp > 0;
        },
    
        //创建 Intl.DateTimeFormat 对象并设置格式选项
        dateFormatter: function(timestamp){
            
            if(!this.isValidTimestamp(timestamp)) return {year: '-', month: '-', day: '-', hour: '-', minute: '-', second: '-'};
    
            const date = new Date(timestamp * 1000);  //创建一个新的Date对象，使用时间戳
        
            var cfg_timezone = $.cookie('HN_cfg_timezone');
            
            // 使用Intl.DateTimeFormat来格式化日期
            const dateTimeFormat = new Intl.DateTimeFormat('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: typeof cfg_timezone == 'object' ? 'PRC' : cfg_timezone,  //指定时区，cfg_timezone变量已在页面中通过程序自动声明
            });
            
            // 获取格式化后的时间字符串
            const formatted = dateTimeFormat.format(date);
            
            // 将格式化后的字符串分割为数组
            const [year, month, day, hour, minute, second] = formatted.match(/\d+/g);
    
            // 返回一个对象，包含年月日时分秒
            return {year, month, day, hour, minute, second};
        },

        toPage(url){
            try {
                event.preventDefault();
                parent.addPage("siteConfig", "siteConfig", "系统基本参数", "siteconfig/siteConfig.php");
            } catch(e) {}
        },



    }
})