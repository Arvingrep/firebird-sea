var showAlertErrTimer  = null;
var pageVue = new Vue({
    el:'#detailPage',
    data:{
        invitationDetail:{},
        infoType:0,  //信息类型
        infoId:0, //信息id
        showPop:false, //
        refuseMsg:'', //拒绝的理由
        menuList:[{
			id:1,
			title:'该工作不适合我'
		},{
			id:2,
			title:'双方沟通一致取消面试'
		},{
			id:3,
			title:'已找到工作'
		},{
			id:4,
			title:'其他'
		}],

        weekArr:['周日','周一','周二','周三','周四','周五','周六'],
        stateArr:['已投递','被查看','有意向','邀面试','不合适'],
        postList:[], //职位列表 -- 推荐
        tdPostArr:[],
        tdSuccessArr:[], //投递成功
        successTdPop:false,
    },
    mounted:function(){
        const that = this;
        // 查看参数
		that.infoId = that.getUrlParam('id');
		var urlType = that.getUrlParam('type')
		if(urlType && urlType == 'delivery'){
			that.infoType = 0;
			that.invitation_state = 2 ; //待定
            
		}else if(urlType && urlType == 'invitation'){
			that.infoType = 1
		}

        that.getInvitationDetail();
    },
    methods:{
        // 获取详情
        getInvitationDetail(){
            const that = this;
			var url = '/include/ajax.php?service=job&action=myDeliveryDetail&id=' + that.infoId
			if(that.infoType){
				url = '/include/ajax.php?service=job&action=myInterviewDetail&id=' + that.infoId
			}

			$.ajax({
				url: url,
				type: "GET",
				dataType: "json",
				success: function (data) {
					if(data.state == 100){
						that.invitationDetail = data.info;
                        console.log(that.invitationDetail.deliveryDetailPost)
						pageData['lng'] = data.info.lng;
						pageData['lat'] = data.info.lat;
						pageData['addrDetail'] = data.info.company.address;
						pageData['address'] = data.info.company.address;
						pageData['title'] = data.info.company.title;
                        console.log(pageData)
                        that.$nextTick(() => {
                            if(!that.invitationDetail.stating && that.infoType){  //面试结束的 显示地图
                                that.drawMap(); //地图
                            }

                            if(!that.infoType){ //获取流程
                                that.getStep();
                                that.getPostList()
                            }
                        })
                        
					}
				},
				error:function(data){ }
			})
        },

        // 获取url参数
		getUrlParam(name){
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]); return null;
		},

        // 时间转换
        transTimes(timeStr,type){
            const that = this;
            update = new Date(timeStr * 1000);//时间戳要乘1000
            year = update.getFullYear();
            month = (update.getMonth() + 1 < 10) ? ('0' + (update.getMonth() + 1)) : (update.getMonth() + 1);
            day = (update.getDate() < 10) ? ('0' + update.getDate()) : (update.getDate());
            hour = (update.getHours() < 10) ? ('0' + update.getHours()) : (update.getHours());
            minute = (update.getMinutes() < 10) ? ('0' + update.getMinutes()) : (update.getMinutes());
            second = (update.getSeconds() < 10) ? ('0' + update.getSeconds()) : (update.getSeconds());
            var date = update.getDay()
            const weekInfo = !type ? '('+ that.weekArr[date]+ ') ' : ' '
            if (new Date(Number(timeStr)* 1000).toDateString() === new Date().toDateString()) {
                return ('今天' + weekInfo  + hour + ':' + minute )
            } else if (year == new Date().getFullYear()){
                return ( month + '/' + day +  '('+ that.weekArr[date]+ ') ' + hour + ':' + minute )
            }else{
                return (year + '-' + month + '-' + day +  '('+ that.weekArr[date]+ ') ' + hour + ':' + minute );
            }
            
        },

        // 回绝面试
		refuseInvitation(){
			var that = this;
			that.showPop = false;
			$.ajax({
				url: '/include/ajax.php?service=job&action=refuseInterview&id=' + that.infoId + '&refuse_msg=' + that.refuseMsg,
				type: "GET",
				dataType: "json",
				success: function (data) {
					if(data.state == 100){
						showSuccessTip('已回绝面试邀请','', '','successTip');
					}
				},
				error:function(data){ }
			})
		},

        drawMap(){
            const that = this;
            let map = new BMap.Map("map", {enableMapClick: false});
            point = new BMap.Point(pageData.lng, pageData.lat);
            setTimeout(function(){
                map.centerAndZoom(point, 13);
            }, 500);
            var labelStyle = {
                color: "#fff",
                borderWidth: "0",
                padding: "0",
                zIndex: "2",
                backgroundColor: "transparent",
                textAlign: "center",
                fontFamily: '"Hiragino Sans GB", "Microsoft Yahei UI", "Microsoft Yahei", "微软雅黑", "Segoe UI", Tahoma, "宋体b8bf53", SimSun, sans-serif'
            };
            var bLabel = new BMap.Label('<div class="markerBox"><div class="address" title="'+that.invitationDetail.company.address+'">'+that.invitationDetail.company.address+'</div><div class="marker_customn"></div></div>', {
                position: point,
                offset: new BMap.Size(-10, -10)
            });
            map.addOverlay(bLabel);
    
        },

        getStep(){
            const that = this;
            var arr = []
            for (var i = 0; i < (that.invitationDetail.postState + 1); i++) {
                var state = that.invitationDetail.postState - i;
                var tipText = '';
                var titleText = '';
                var time = ''
                switch (state) {
                    case 0:
                        titleText = '投递成功'
                        tipText = '等待招聘方查收'
                        time = that.timeStrToDate(that.invitationDetail.date);
                        break;
                    case 1:
                        titleText = '已查阅'
                        tipText = ''
                        time = that.timeStrToDate(that.invitationDetail.read_time);
                        break;
                    case 2:
                        titleText = '有意向'
                        tipText = '招聘方对你的简历很感兴趣！'
                        time = that.timeStrToDate(that.invitationDetail.pass_time);
                        break;
                    case 4:
                        titleText = '不合适'
                        tipText = that.invitationDetail.refuse_msg
                        time = that.timeStrToDate(that.invitationDetail.pass_time);
                        break;
                    



                }
                arr.push({
                    tipText: tipText,
                    titleText: titleText,
                    time: time,
                })
            }
            console.log(arr)
        },

        timeStrToDate(timeStr,type){
			var now = new Date();
			var date = new Date(timeStr * 1000)
			var year = date.getFullYear();  //取得4位数的年份
			var month = date.getMonth()+1;  //取得日期中的月份，其中0表示1月，11表示12月
			var dates = date.getDate();      //返回日期月份中的天数（1到31）
			var day = date.getDay();
			var hour = date.getHours();     //返回日期中的小时数（0到23）
			var minute = date.getMinutes(); //返回日期中的分钟数（0到59）
			var second = date.getSeconds(); //返回日期中的秒数（0到59）
			var weekDay = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
			var datestr = month + '/' + dates ;
			minute = minute > 9 ? minute : '0' + minute;
			if(now.toDateString() === date.toDateString() ){
				datestr = '今天'
			}
			datestr = datestr +' '+ hour +  ':' + minute;

			if(type == 1){
				datestr = month + '/' + dates 
			}
			return datestr;
		},

        // 获取职位推荐
        getPostList(){
            const that = this;
            $.ajax({
                url: '/include/ajax.php?service=job&action=postList&page=1&pageSize=6&filterDelivery=1&type=' + that.invitationDetail.job.typeid,
                type: "GET",
                dataType: "json",
                success: function (data) {
                    if (data.state == 100) {
                        that.postList = data.info.list
                    }
                    
                },
                error: function () {

                }
            });
        },

        // 选择职位
        chosePost(item){
            const that = this;
            // that.tdPostArr.push()
            if(that.tdPostArr.includes(item.id)){
                that.tdPostArr.splice(that.tdPostArr.indexOf(item.id),1)
            }else{
                that.tdPostArr.push(item.id)
            }
        },

        // 一键投递
        pltdPost(){
            const that = this;
            if(!that.tdPostArr.length){  //直接一键投递
                that.tdPostArr = that.postList.map(item => {
                    return item.id;
                })
            }
            
            // setTimeout(() => {
            //     that.tdSuccessArr = that.tdSuccessArr.concat(that.tdPostArr)
            //     that.tdPostArr = []; //清空
            //     that.successTdPop = true;
            //     setTimeout(() => {
            //         that.successTdPop = false;
            //     }, 2500);
            // }, 1500);

            const url= 'include/ajax.php?service=job&action=delivery&rid='+ defaultResumeId +'&pid=' + that.tdPostArr;

            $.ajax({
				url: url,
				type: "POST",
				dataType: "json",
				success: function (data) {
                    if (data.state == 100) {
                        that.tdSuccessArr = that.tdSuccessArr.concat(that.tdPostArr)
                        that.tdPostArr = []; //清空
                        that.successTdPop = true;
                        setTimeout(() => {
                            that.successTdPop = false;
                        }, 2500);
                    }
				},
				error:function(data){ }
			})
        },
        
    }
})

function showSuccessTip(title, content, icon, cls) {
    // title 标题,content 内容,icon  图标
    if (!title) return false;
    console.log(title)
    showAlertErrTimer && clearTimeout(showAlertErrTimer);
    $(".popSuccessTip").remove();
    var iconHtml = icon ? '<s class="ps_tip_icon"><img src="' + icon + '" alt=""></s>' : '';
    var conTxt = content ? '<p>' + content + '</p>' : "";
    $("body").append('<div class="popSuccessTip ' + cls + '">' + iconHtml + '<div class="popSuccessText"> <h2>' + title + '</h2>' + conTxt + '</div></div>');
    $(".popSuccessTip").css({
        "visibility": "visible"
    });
    showAlertErrTimer = setTimeout(function () {
        $(".popSuccessTip").fadeOut(300, function () {
            $(this).remove();
        });
    }, 1500);
}