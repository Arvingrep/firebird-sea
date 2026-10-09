 // var logininfo = utils.getStorage("lwm_courier_login");
 var logininfo = utils.getStorage("wmsj_login_user");
 var appSign = [];
 var isapp = 0;
 var user = pass = '';
    if(logininfo){
    	user = logininfo.username;
    	pass = logininfo.password;
    }
var dataGeetest = "";	

// input输入框 组件
var InputText = {
	props: ['type','placeholder','name','areacode','readonly','value'],
	data:function(){
		return {
			eyeshow:true,
			input_ :'',
			password_:'',
		}
	},
	
	methods:{
		input(){
			var el = event.target;
			input_ = event.target.value;
			var name = $(el).attr('name');
			if(name=='username'){
				 this.$parent.userinfo.username = input_
			}else if(name=='password'){
				this.input_ = input_
				this.$parent.userinfo.password = input_;
			}else if(name=='telphone'){
				this.$parent.userphone.userphone = input_
			}else if(name=='captcha'){
				this.$parent.userphone.validcode = input_
			}else if(name=='areaCode'){
				console.log(input_);
				this.$parent.userphone.areaCode = input_
			}else if(name=='nickname'){
				this.$parent.reg_info.nickname = input_
			}else if(name=='sex'){
				this.$parent.reg_info.sex = input_;
			}else if(name=='age'){
				this.$parent.reg_info.age = input_
			}else if(name=='sure_password'){
				this.input_ = input_
				this.$parent.userinfo.password = input_;
			}
			
			if(name=='password' || name=='sure_password'){
				this.password_ = input_
			}else{
				this.password_ = ''
			}
		},
		
		// 显示弹窗
		pop_show:function(){
			$(".popl_mask").show();
			$(".popl_box").css('bottom','0')
		},
		getCode:function(){
			// 获取验证码
			var el = event.currentTarget;
			var phone = $('input[name="telphone"]').val();

			if(phone==''||phone==undefined){
				showErr(langData['siteConfig'][20][239]);//'请输入手机号'
				return false;
			}else{
				if(!geetest){
					this.$options.methods.sendVerCode();
				}else{
					this.$options.methods.yanzheng()
				}
				
			}
			// this.$options.methods.coutDown();
		},
		openeye:function(){
			this.eyeshow = !this.eyeshow;
			this.$root.psd_show = this.eyeshow ;
			if(!this.eyeshow){
				$("input[name='sure_password']").attr('type','text')
			}else{
				$("input[name='sure_password']").attr('type','password')
			}
		},
		yanzheng:function(){
			console.log(111);return  false;

			
		},
	
		 //发送验证码
		sendVerCode:function(){
		        var btn = $(".get_code");
		        var phone = $.trim($("input[name='telphone']").val())
				var areacode = $.trim($("input[name='areaCode']").val())
		        if(btn.hasClass("disabled")) return;
		        btn.addClass("disabled").text(langData['siteConfig'][23][99]);
				data = {'rsaEncrypt':1,'phone':rsaEncrypt(phone),"areaCode":areacode}
				var tt = this;
		        $.ajax({
		            url: "/include/ajax.php?service=siteConfig&action=getPhoneVerify&type=auth",
		            data: data+dataGeetest,
		            type: "GET",
		            dataType: "jsonp",
		            success: function (data) {
		                //获取成功
		                if(data && data.state == 100){
		                    tt.$options.methods.coutDown();
		                    //获取失败
		                }else{
		                    btn.removeClass("disabled").text(langData['siteConfig'][19][736]);
		                    showErr(data.info);
		                }
		            },
		            error: function(){
		                btn.removeClass("disabled").text(langData['siteConfig'][19][736]);
		                showErr(langData['siteConfig'][20][173]);
		            }
		        });
		    }
	},
	template: `
	<div v-bind:class="['inpbox',{tel_inpbox:name =='telphone'}]">
		<span v-if='name =="telphone"' class="areacode" v-on:click="pop_show">{{areacode}}</span>
		<input v-if='name =="telphone"' type="hidden" name="areaCode" v-model="areacode" >
		<button v-if='name =="captcha"' class="get_code">`+langData['siteConfig'][19][736]+`</button>
		<input v-bind:type="name==('password'||'sure_password')?(eyeshow === true?'password':'text'):type" v-bind:placeholder="placeholder"  v-bind:name="name" v-bind:readonly="readonly"  v-on:input="input"   :value="value?value:input_">
		
		<em></em>
		<i v-if='name=="password"' v-on:click="openeye" v-bind:class="[{ eye_open: !eyeshow === true }]"></i>
	</div>
	`,
};

// loading组件
var loading = {
	template:`
	<div class="loading"></div>	
	`,
}

// 按钮组件
var btnLogin = {
	data:function(){
		return {
			info:'',
			params:'',
			load:false,
			
		}
	},
	components:{
		'loading-div':loading,
		
	},
	methods:{
		// 登录
		login:function(){
			var logintype = this.$parent.currentTab;
			if(logintype=='accountLogin'){
				var ainfo = this.$parent.userinfo;
				if(ainfo.username==''){
					showErr(langData['waimai'][10][120]);  //请输入账号
					return false;
				}else if(ainfo.password==''){
					showErr(langData['waimai'][10][119]);  //'请输入密码'
					return false;
				}else{
					params = {
						'username' :ainfo.username,
						'password' :ainfo.password,
						'logintype':this.$parent.currentTab,
					}
					this.login_access(params)
				}
				this.$parent.codetype  = 2;
			}else{
				var ainfo = this.$parent.userphone;
				if(ainfo.userphone==''){
					showErr(langData['siteConfig'][20][239]); //'请输入手机号'
					return false;
				}else if(ainfo.validcode==''){
					showErr(langData['siteConfig'][20][176]);  //'请输入验证码'
					return false;
				}else{
					params = {
						'userphone':$.trim(ainfo.userphone),
						'validcode':$.trim(ainfo.validcode),
						'areaCode':$.trim(ainfo.areaCode),
						'logintype':this.$parent.currentTab,
					}
					this.login_access(params)
				}
			}
		},
		login_access:function(params){
			var logintype = this.$parent.currentTab;
			if(this.load) return false;
			this.load = true;
			let param = [];
            param.push('rsaEncrypt=1');
			if(logintype == 'accountLogin'){
				param.push('username='+ rsaEncrypt(params.username))
				param.push('password='+ rsaEncrypt(params.password))
				param.push('logintype='+ params.logintype)
			}else{
				param.push('phone='+ rsaEncrypt(params.userphone))
				param.push('code='+ params.validcode)
				param.push('areaCode='+ params.areaCode)
				param.push('logintype='+ params.logintype)
			}
			param.push(appSign.join('&'));
			var loginUrl = logintype=='accountLogin'?'/loginCheck.html':"/include/ajax.php?service=member&action=smsLogin";
			axios({
				method: 'post',
				url: loginUrl,
				data: param.join('&'),
			})
			.then((response)=>{
				tt = 1;
				var data = response.data;
				this.load = false;
				if(logintype=='accountLogin'){
					$("body").append('<div style="display:none;">' + data + '</div>');
					if(data.indexOf("100") > -1){
						var dataStr = {'username':params.username,'password':params.password};
						utils.setStorage("wmsj_login_user",JSON.stringify(dataStr))
						if (device.indexOf('huoniao') <= -1 && !isapp) {
							top.location.href = decodeURIComponent(redirectUrl);
						} else {
                            top.location.href = decodeURIComponent(redirectUrl+'?currentPageOpen=1');
							setupWebViewJavascriptBridge(function (bridge) {
								if (redirectUrl.indexOf('wmsj') > -1) {
									bridge.callHandler('appLoginFinish', {'passport': userinfo.userid}, function () {});
                                    setTimeout(function(){
                                        bridge.callHandler('pageClose', function(){});
                                    }, 500);
								} 
							});
						}
					}else{
						showErr(data.split('|')[1])
					}
				}else{
					if(data.state!=100){
						showErr(data.info)
					}else{
						 userinfo = data.info;
						if (device.indexOf('huoniao') <= -1) {
							top.location.href = redirectUrl;
						} else {
                            
                            top.location.href = decodeURIComponent(redirectUrl+'?currentPageOpen=1');
							setupWebViewJavascriptBridge(function (bridge) {
								bridge.callHandler('appLoginFinish', {
									'passport': userinfo.userid,
									'username': userinfo.username,
									'nickname': userinfo.nickname,
									'userid_encode': userinfo.userid_encode,
									'cookiePre': userinfo.cookiePre,
									'photo': userinfo.photo,
									'dating_uid': userinfo.dating_uid
								}, function () {});
                                setTimeout(function(){
                                    bridge.callHandler('pageClose', function(){});
                                }, 500);
							});
                            
						}
					}
				}
			});
				
		},
		
		showPop(){
			$(".pop_mask,.pop_agree").show()
		}
		
		
		
	},
	template: `
	<div class="btn_box">
		<button v-if="this.$parent.login && !this.$root.noagree" type="button" class="login_btn" @click="login"><slot></slot></button>
		<button v-if="this.$parent.login && this.$root.noagree" type="button" class="login_btn login_opciaty" @click="showPop"><slot></slot></button>
		<a v-if="this.$parent.login" href="javascript:;" class="reg_url" style="display:none;">我要开店</a>
		
		<loading-div v-if="load"></loading-div>
	</div>
	
	`,
}


// 登录
var pageVue = new Vue({
	el: "#page",
	data: {
	  currentTab: "accountLogin",  //默认账号登录
	  tabs: [{'id':"accountLogin",'name':langData['waimai'][10][124]}, {'id':"noPsdLogin",'name':langData['waimai'][10][125]}],  //账号登录  免密登录
	  userinfo:{'username':user,'password':pass,'areaCode':''},
	  userphone:{'userphone':'','validcode':'','areaCode':86},
	  areaCode:86,
	  login:true,   //登录页
      codetype:'',
      noagree:consult=='0'?true:false, //不同意勾选协议
	  reg_info:{
	  	'nickname':'',
	  	'age':'',
	  	'sex':'',
	  },
	  psd_show:true,
	  LOADING:false,
	},
	created() {
		setTimeout(function(){
		  //获取APP信息
		  setupWebViewJavascriptBridge(function(bridge) {
			bridge.callHandler("getAppInfo", {}, function(responseData){
				isapp = 1;
				var data = JSON.parse(responseData);
				if(data.device && data.title && data.serial){
					appSign.push('deviceTitle='+data.title);
					appSign.push('deviceType='+data.device);
					appSign.push('deviceSerial='+data.serial);
				}
			});
		  });
		}, 500);
	},
	components:{
		'input-txt':InputText,
		'btn-login':btnLogin,
		'loading-div':loading,
	},
	methods:{
		pop_hide:function(){
			$(".popl_mask").hide();
			$(".popl_box").css('bottom','-9rem')
		},
		Changecode:function(){
			var el = event.currentTarget;
			areaCode = $(el).attr('data-code');
			$(el).addClass('achose').siblings('li').removeClass('achose');
			this.$options.methods.pop_hide();
			$("input[name='areaCode']").val(areaCode);
			$(".areacode").text(areaCode)
			this.userphone.areaCode = areaCode
		},
		
		// 隐藏同意弹窗
		hidePop(){
			$(".pop_mask,.pop_agree").hide()
		},

		// 点击确认
		sureClick(){
			var t = this;
			t.noagree = !t.noagree;
			$(".pop_agree .cancel").click();
			setTimeout(function(){
				$(".show .login_btn").click();
			},300)

			
		}



		
		
	},
	mounted(){
		if(!geetest){
		    $('body').delegate(".get_code",'click',function(){
				if($(this).hasClass("disabled")) return;
				var areaCode = $.trim($("input[name='areaCode']").val());
				 var phone = $.trim($("input[name='telphone']").val());
				 if(phone == ''){
					 showErr(langData['siteConfig'][20][463]);//请输入手机号码
					 return false;
				 }
					 
				 if(areaCode == "86"){
					var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
					if(!phoneReg.test(phone)){
						showErr(langData['siteConfig'][20][465]);   //手机号码格式不正确
						return false;
					}
				}
		        sendVerCode();
		      
		    });
		  }else{
			//获取验证码
			this.$nextTick(() => {
				captchaVerifyFun.initCaptcha('h5', '#codeButton', sendVerCode)
			})
			$('body').delegate(".get_code", 'click', function () {
				if ($(this).hasClass("disabled")) return;
				var areaCode = $("input[name='areaCode']").val();
				var phone = $("input[name='telphone']").val();
				if (phone == '') {
					showErr(langData['siteConfig'][20][463]);//请输入手机号码
					return false;
				}

				if (areaCode == "86") {
					var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
					if (!phoneReg.test(phone)) {
						showErr(langData['siteConfig'][20][465]);   //手机号码格式不正确
						return false;
					}
				}

				if (geetest == 1) {
					captchaVerifyFun.config.captchaObjReg.verify();
				} else {
					$('#codeButton').click()
				}


			})
		  }
		
		
		    
		
	},
	watch:{
		login:function(){
			$(".mobileSelect").remove();
			if(!this.login){
				setTimeout(function(){
					sexSelect = new MobileSelect({
						trigger: '.reg_box .inpbox input[name="sex"] ',
						title: '',//房型选择
						wheels: [
									{data: [langData['waimai'][10][128],langData['waimai'][10][129]]},
								   
								],
						position:[0],
						callback:function(indexArr, data){
							$('.reg_box .inpbox input[name="sex"]').val(data);
							changeval(data)
						}
					});
				},600)
				
			}
			
		}
	}
	
	
});



//注册

var showErrTimer;
function showErr(data) {
	showErrTimer && clearTimeout(showErrTimer);
	$(".popErr").remove();
	$("body").append('<div class="popErr"><p>' + data + '</p></div>');
	$(".popErr p").css({
		"margin-left": -$(".popErr p").width() / 2,
		"left": "50%"
	});
	$(".popErr").css({
		"visibility": "visible"
	});
	showErrTimer = setTimeout(function() {
		$(".popErr").fadeOut(300, function() {
			$(this).remove();
		});
	}, 1500);
 }
 
 function changeval(data){
	 console.log(data);
	 pageVue.reg_info.sex = data[0]
 }
 
 
 function coutDown(){
 	// 倒计时
 	var mydate= new Date();
 	mydate.setMinutes(mydate.getMinutes()+1); //当前时间加1分钟
 	var end_time = new Date(mydate).getTime();//月份是实际月份-1
 	var sys_second = (end_time-new Date().getTime())/1000;
 	var timer = setInterval(function(){
 		if (sys_second > 1) {
 			sys_second -= 1;
 			var second = Math.floor(sys_second % 60);
 			$(".get_code").attr("disabled","true");//添加disabled属性
 			$(".get_code").addClass("disabled");//添加disabled属性
 			$(".get_code").css("opacity",".5");
 			$(".get_code").html(second+"s");
 	
 		} else { 
 			$(".get_code").removeAttr("disabled");//移除disabled属性
 			$(".get_code").removeClass("disabled");//添加disabled属性
 			$(".get_code").css("opacity","1");
 			$(".get_code").html(langData['siteConfig'][19][736]);  //"获取"
 			clearInterval(timer);//清楚定时器
 		}
 	}, 1000);
 }
   
   
   function sendVerCode(captchaVerifyParam,callback){
	   	var btn = $(".get_code");
	   	var phone = $.trim($("input[name='telphone']").val())
		var areacode = $.trim($("input[name='areaCode']").val())
	    var codetype = pageVue.codetype;
	   	if(btn.hasClass("disabled")) return;
	   	btn.addClass("disabled").text(langData['siteConfig'][23][99]);
		data = 'rsaEncrypt=1&phone='+rsaEncrypt(phone)+'&areaCode='+areacode
		if(captchaVerifyParam && geetest == 2){
			data = data + '&geetest_challenge=' + captchaVerifyParam
		}else if(geetest == 1 && captchaVerifyParam){
			data = data +  captchaVerifyParam
		}
		var tt   = this;
		var type = '';

		if(codetype == 1){
			type = 'signup';
		}else{
			type = 'sms_login';
		}
		$.ajax({
			url: "/include/ajax.php?service=siteConfig&action=getPhoneVerify&vertype=1&type=" + type,
			data: data,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if (callback) {
					callback(data)
				}
				//获取成功
				if (data && data.state == 100) {
					coutDown();
					//获取失败
				} else {
					btn.removeClass("disabled").text(langData['siteConfig'][19][736]);
					showErr(data.info);
				}
			},
			error: function () {
				btn.removeClass("disabled").text(langData['siteConfig'][19][736]);
				showErr(langData['siteConfig'][20][173]);
			}
		});
   }
