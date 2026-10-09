new Vue({
    el:'#page',
    data:{
        slideList:[{
            id:1,
            code:'zan',
            text:'收到点赞',
            list:[],
            page:1,
            isload:false,
            loadEnd:false
        },{
            id:2,
            code:'commt',
            text:'收到评论',
            list:[],
            page:1,
            isload:false,
            loadEnd:false
        },{
            id:3,
            code:'commt_from',
            text:'发布评论',
            list:[],
            page:1,
            isload:false,
            loadEnd:false
        }],
        slideShow:false, //是否显示选项
        slideChose:0, 
        replySlide:false, //评论弹窗
        replyObj:'',
        replyCon:'',
        userInfo:userInfo,
        gettype:gettype,
        zanPop:'',
        zanIng:[], //正在点赞
    },
    mounted(){
        const that = this;
        var str = window.location.hash;
        var type = str.slice(1);
        if(type.indexOf('&')){
            let _type = type.split('&');
            type = _type[0];
        }
        if(type.indexOf('?')>-1){
            type = type.split('?')[0];
            // that.gettype = (window.location.hash.split('?')[1]).split('=')[1]
        }
        if(type == 'zan'){
            that.slideChose = 0
        }else if(type == 'commt'){
            that.slideChose = 1;
        }else{
            that.slideChose = 2;

        }
       		
       	

        that.updateRead()
        that.getUpList();
        $(window).scroll(function(){
            let bodyH = $('body').height();
            let winH = $(window).height();
            let scrH = $(window).scrollTop()
            if(bodyH <= (winH + scrH + 50)){
                that.getUpList();
            }
        })
    },
    methods:{
        updateRead(){
            const that = this;
            $.ajax({
                url: '/include/ajax.php?service=member&action=updateRead&type=' + (that.slideChose == 0 ? 'zan':'commt'),
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if(data && data.state == 100){
                        // 更新成功
                    }
                },
                error: function () { }
            });
        },
        // 获取获赞列表
        getUpList(){
            const that = this;
            let ind = that.slideChose
            let isload = that.slideList[ind].isload;
            let page = that.slideList[ind].page;
            let loadEnd = that.slideList[ind].loadEnd;
            if(isload) return false; // 表示正在加载
            that.slideList[ind].isload = true
            let param = [];
                param.push('page=' + page)
                param.push('gettype=' + that.gettype)
            let url = '/include/ajax.php?service=member&action=getComment&son=1&onlyself=1&pageSize=10';
            if(ind == 0){
                url ='/include/ajax.php?service=member&action=upList&pageSize=10'
                param.push('u=1')
            }else if(ind == 1){
                param.push('u=1');
            }else{
                param.push('u=2');

            }
            $.ajax({
                url: url,
                type: "POST",
                data:param.join('&'),
                dataType: "json",
                success: function (data) {
                    that.slideList[ind].isload  = false;
                    let list = that.slideList[ind].list
                    if(data.state == 100){
                        if(page == 1){
                            list = [];
                        }
                        that.slideList[ind].list = list.concat(data.info.list)
                        page++;

                        if(page > data.info.pageInfo.totalPage){
                            that.slideList[ind].isload  = true;
                            that.slideList[ind].loadEnd  = true;
                        }
                        that.slideList[ind].page = page;
                        that.$nextTick(() => {
                            if(ind){
                                for(let i = 0; i < that.slideList[ind].list.length; i++){
                                    let item = that.slideList[ind].list[i];
                                    let li = $(".listShow").eq(ind).find('li[data-ind="'+i+'"]');
                                    let li_h1 = li.find('.cont').height(),li_h2 = li.find('.contentBox').height()
                                    if(li_h1 >= (li_h2 + li_h2 / 4)){
                                        that.$set(that.slideList[ind].list[i],'unflod',true)
                                    }else{
                                        that.$set(that.slideList[ind].list[i],'unflod',false)
                                    }
                                    that.$set(that.slideList[ind].list[i],'hasCheck',true)
                                    // if(i == (that.slideList[ind].list.length - 1)){
                                    //     that.hasCheckHeight = true; // 表示已查找所有li
                                    // }
                                }
                            }
                        })
                    }else{
                        // 没有数据
                        that.slideList[ind].isload  = true;
                        that.slideList[ind].loadEnd  = true;
                    }
                },
                error: function () { 
                    that.slideList[ind].isload  = false;
                    showErrAlert('网络错误，请稍后重试')
                }
            });
        },

        // 时间戳转换
        transTime(timestamp){
            let now_timestamp = parseInt(new Date().valueOf() / 1000)
            const dateFormatter = huoniao.dateFormatter(timestamp);
            const year = dateFormatter.year;
            const month = dateFormatter.month;
            const day = dateFormatter.day;
            const hour = dateFormatter.hour;
            const minute = dateFormatter.minute;
            const second = dateFormatter.second;
            const dateFormatter_n = huoniao.dateFormatter(now_timestamp);
            const year_n = dateFormatter_n.year;
            const month_n = dateFormatter_n.month;
            const day_n = dateFormatter_n.day;
            const hour_n = dateFormatter_n.hour;
            const minute_n = dateFormatter_n.minute;
            const second_n = dateFormatter_n.second;
            let timeStr = ''
            let offDay = Math.ceil((now_timestamp - timestamp)/3600/24)
            if(year == year_n){
                if(month == month_n){
                    if(day == day_n){
                        timeStr = hour + ':' + minute
                    }else if(offDay < 7){
                        timeStr = offDay + '天前'
                    }else{
                        timeStr =  month + '/' + day
                    }
                }else{
                    timeStr =  month + '/' + day
                }
            }else{
                timeStr = year + '/' + month + '/' + day
            }

            return timeStr
        },

        // 验证信息
        checkInfo(list,type){
            const that = this
            let rdetail = list.detail
            if(list.module == 'live'){
                rdetail = rdetail['0']
            }
            let str = ''
            if(!rdetail){
                // console.log(rdetail)
                if(type != 'url') return false;
                str = 'javascript:;'
                return str;
            }
            
            if(rdetail){

                switch(type){
                    case 'pic':
                        if(rdetail.litpic){
                            str = rdetail.litpic
                        }else if(rdetail.imglist && Array.isArray(rdetail.imglist) && rdetail.imglist.length){
                            str = rdetail.imglist[0].path
                        }else if(rdetail.imgGroup  && Array.isArray(rdetail.imgGroup) && rdetail.imgGroup.length){
                            str = rdetail.imgGroup[0]
                        }else if(rdetail.thumbnail){
                            str = rdetail.thumbnail
                        }else if(list.type == 'business'){
                            str = rdetail.logo;
                        }
                    break;
                    case 'content':
                        if(rdetail.newTitle){
                            str = rdetail.newTitle
                        }else if(rdetail.content){
                            str = rdetail.content
                        }else if(rdetail.title){
                            str = rdetail.title
                        }
                        str = that.delHtmlTag(str)
                        break;
                    case 'url':
                        if(list.module == 'live'){
                            str = list.url
                        }else {
                            str = rdetail.url
                        }
                        if(!str){
                            str = 'javascript:;'
                        }
                    break;
                }
            }
        
            return str
        },

        delHtmlTag(str){
            return str.replace(/<[^>]+>/g,"");//去掉所有的html标记
        } ,

        choseSlide(ind){
            const that = this;
            that.slideChose = ind;
            that.slideShow = false;
            if(that.slideList[ind] && that.slideList[ind].list && Array.isArray(that.slideList[ind].list) && that.slideList[ind].list.length == 0){
                that.getUpList()
            }
            let url = window.location.href;
            let location = window.location
            let hash = location.hash;
            let n_hash = ''
            if(ind == 0){
                n_hash = '#zan'
            }else if(ind == 1){
                n_hash = '#commt'
            }else {
                n_hash = '#commt_from'
            }
            let n_url = url.replace(hash,n_hash)
            if(!hash){
                n_url = url + n_hash
            }
            window.history.replaceState({}, 0, n_url);
        },

        zanComment(item){
            const that = this;
            if(that.zanIng.includes(item.id)) {
                // console.log(item.id,that.zanIng)
                return false
            };
            that.zanIng.push(item.id)
            let zan = item.zan_has
            that.$set(item,'zan_has',(zan ? 0 : 1))
            that.zanPop = item.id
            setTimeout(() => {
                that.zanPop = ''
            }, 300);
            let ind = that.zanIng.indexOf(item.id)

            $.ajax({
                url: '/include/ajax.php?service=member&action=dingComment&id='+ item.id +'&type=' + (zan ? 'del' :'add'),
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if(that.zanIng.includes(item.id)){
                        that.zanIng.splice(ind,1)
                        console.log('---')
                    }
                    if(data.state == 100){
                       
                        that.$set(item,'zan_has',(zan ? 0 : 1))
                    }else{
                        that.$set(item,'zan_has',zan)

                    }
                },
                error: function () { 
                    showErrAlert('网络错误，请稍后重试')
                    that.$set(item,'zan_has',zan)
                    if(that.zanIng.includes(item.id)){
                        that.zanIng.splice(ind,1)
                        console.log('===')
                    }
                }
            });
        },

        // 调起输入框
        replyItem(item){
            const that = this;
            that.replyObj = item
            that.replySlide = true;
            that.$nextTick(() => {
                $("#reply").focus()
            })
        },

        // 阻止换行
        enterKey(){
            if(event.keyCode == 13){
                event.preventDefault()
                event.stopPropagation();
            }
        },
        // 发送评论
        sendReply(e){
            const that = this
            if(!(that.replyCon).trim()) return false;
            $.ajax({
                url: '/include/ajax.php?service=member&action=replyComment&id='+that.replyObj.id+'&content=' + that.replyCon,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if(data.state == 100){
                        showErrAlert('评论成功！')
                        that.replySlide = false;
                        that.replyCon = ''
                        that.replyObj = ''
                    }
                },
                error: function () { }
            });
            e.preventDefault()
            e.stopPropagation();//阻止事件冒泡
        }
    },

    watch:{
        slideShow:function(val){
            if(val){
                $('html').css({'overflow':'hidden'})
            }else{
                $('html').css({'overflow':'auto'})

            }
        }
    }
})