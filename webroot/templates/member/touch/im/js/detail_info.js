var url = window.location.pathname;
var user_id = url.slice(url.indexOf("-")+1,url.indexOf("."));  //获取好友的id


//获取用户信息
    $.ajax({
        url: '/include/ajax.php?service=member&action=detail&id='+user_id+'&friend=1&shop=1',
        type: 'post',
        dataType: 'json',
        success: function(data){
            if(data.state == 100){
               var detail = data.info;
               $('.nid .im-info_right').html(detail.userid + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a style="color: #ff0000;" href="/user/'+detail.userid+'" target="_blank">' + langData['siteConfig'][47][87] + '</a>');
               $('.nic .im-info_right').text(detail.nickname);
               $('.sig .im-info_right').text(langData['siteConfig'][31][108]);//未填写
               $('.sex .im-info_right').text(detail.sex=='1'?langData['siteConfig'][13][4]:langData['siteConfig'][13][5]);//男--女
               $('.q_num .im-info_right').text(detail.qq?detail.qq:langData['siteConfig'][31][108]);//未填写
               $('.birth .im-info_right').text(detail.birthday?transTimes(detail.birthday,2):langData['siteConfig'][31][108]);//未填写
               $('.area .im-info_right').text(detail.addrName?detail.addrName.replace(/\>/g,"-"):langData['siteConfig'][31][108]);  //替换所有> //未填写
               $('.reg_time .im-info_right').text(detail.regtime);
               if(detail.shopList){
               	var  shop = detail.shopList
               	 for(var i=0; i<shop.length; i++){
               	 	var list = []
               	 	if(shop[i].module=='job'){
               	 		list.push('<dd class=" im-li_shop"><a href="'+shop[i].url+'" class="fn-clear"><div class="im-icon_left"><img src="'+templets_skin+'images/icon2.png"/></div> <h2>'+shop[i].title+'</h2></dd>')
               	 	}else{
               	 		list.push('<dd class=" im-li_shop"><a href="'+shop[i].url+'" class="fn-clear"><div class="im-icon_left"><img src="'+templets_skin+'images/icon.png"/></div> <h2>'+shop[i].title+'</h2></dd>')
               	 	}
               	 	 $('.im-shop_list dl').append(list.join(''))
               	 }

               }else{
               	$('.im-shop_list').hide();
               }
            }else{
                alert(data.info);
            }
        },
        error: function(){
            alert(langData['siteConfig'][46][63]);//网络错误，初始化失败！
        }
    });


function transTimes(timestamp, n){
	
        const dateFormatter = huoniao.dateFormatter(timestamp);
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
			return (hour+':'+minute);
		}else{
			return 0;
		}
	}
