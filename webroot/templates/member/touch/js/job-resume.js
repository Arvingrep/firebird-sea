var startDate, endDate;
var nextFreshIntferval = null;
var workStateItem = null,
  startWorkItem = null,
  experienceItem = null,
  sexitem = null; //选择器
  var experienceArr = []
  for(var i = 0; i <= 11; i++){
    experienceArr.push({
      id:i,
      title: i == 0 ? '暂无' : ( i > 10 ? '10年以上' : i + '年')
    })
  }
  toggleDragRefresh('off');

  let arr_salary = []
  for(let i = 1; i <= 40; i++){
    if( i <= 30){
      arr_salary.push(i * 1000)

    }else{
      arr_salary.push( (i - 30) * 5000 + 30000)
    }
  }


var page = new Vue({
  el: '#page',
  data: {
    submit_loading: false, //是否正在提交中
    loading: false, //加载中
    pageLoad: false, //只在第一次加载
    pageShow: 1, //当前显示  1是简历列表  2是基本信息 3是求职意向  4是工作经历  5是教育背景   6是个人优势  7语言技能  8是新建简历  9是简历预览
    currResume: {
      title: '', //简历名称
      birth: '', //出生年月
      sex: '', //性别
      work_jy: '', //工作经验
      phone: phone, //电话
      wechat: '', //微信
      email: '',
      identify: 0, //身份
      photo_url: '', //头像地址
      photo: '',
      name: userName ? userName : '', //名称
      type: '', //期望行业
      type_name: '', //行业文字
      job: '', //期望职位
      job_name: [], //职位文字
      jobArr: [], //意向职位id数组
      min_salary: '', //最低薪资
      max_slary: '', //最高薪资
      work_jl: '',
      advantage: '', //个人优势
      work_jl_none:0, //1表示无工作经历， 为0则必须填写work_jl 
      skill:{}, //技能

    },

    jobText: [], //职位文字
    typeText: [], //行业文字
    baseConfig: '',

    // 手机绑定相关数据
    showPrivatePop: false, //显示弹窗
    phoneCheck: phone ? 1 : 0,
    showKeyBoard: false, //显示软键盘
    showKeyBoard2: false, // 验证码软键盘
    //telphone:phone, //手机号
    telphone: '18206192021', //手机号
    phoneCode: '', //手机验证码
    areaCode: '86', //区号
    dataGeetest: '',
    // 期望行业弹窗
    showIndustryPop: false,
    industryList: '',
    choseIndustry: [], //期望行业的id对象
    choseIndustryObj: [],
    showChildPop: false,
    currChoseOn: '', //当前选择的

    // 期望职位
    // popType:
    showPostPop: false, // 弹窗显示隐藏
    postList: '', //职位分类列表
    currChoseType: '', // 当前选择的一级分类
    currChoseStype: '', //二级分类
    showLeftPop: false, //二级分类页面左滑
    showRightPop: false, //三级分类页面左滑
    choseTypeArr: [], //选择的id
    choseTypeObj: [], //选中的内容

    // 期望薪资
    salaryArr: arr_salary, //薪资配置
    salaryText: '', //文字显示


    /* ******************工作经历********************** */
    textCount: 0, //工作内容文字已输入
    //  当前编辑的工作
    edit_page: '', //是否处于编辑
    workjl: {
      content: '', //工作内容
      job: '', //职位
      job: '',
      jobid: [], //曾经的职位id[1,2,3],
      startDate: '',
      endDate: '',
      department: '',
    },
    initNote: '', //文字存放
    exampleShow: false, //是否显示案例

    // 滚轮弹窗
    showScrollPop: false, //选择器弹窗
    endDate: ['至今', ''], //选择器的结束时间
    startDate: new Date(), //选择器的开始时间
    minDate: new Date('1968-01-01'), //时间选择器配置
    maxDate: new Date(), //时间选择器配置
    yearArr: [], //结束时间的数据
    showScrollType: '', //弹窗类型

    /****************教育背景****************/
    // 当前编辑的教育经历
    startJoin: '', //入学时间
    endLeave: '', //毕业时间
    eduObjIndex: 0, //学历默认选中
    educationJl: {
      endDate: '', //毕业时间
      startDate: '', //入学时间
      xl: '', //学历
      xl_id:'', //学历id
      zy: '', //专业
      school: '', //学校
    },


    /****************** 优势 **************/
    advantage: '',


    /****************** 技能 **************/
    languageArr: ['英语', '汉语', '日语', '韩语', '法语', '德语', '俄语', '西班牙语', '阿拉伯语', '意大利语', '瑞典语', '泰国语', '波兰语', '荷兰语', '捷克语', '拉丁语', '挪威语', '世界语'],
    levelArr: ['一般', '良好', '熟练', '优秀'],
    skillIndex: 0, //擅长语言
    levelIndex_l: 0, //听说
    levelIndex_r: 0, //读写
    skillObj: {
      type: 0, //类型 0 => 语言  1 => 技能
      lang: '', //语种
      level_speak: '', //听说
      level_read: '', //读写
      time: '', //证书获取时间
      certificate: '', //证书类型
      certificateType:'',//证书类型
      cer_fullName: '', //证书
    },
    skillTime: '', //获取证书时间

    /***************创建简历****************/
    copyOptions: [{
      tit: '基本信息',
      id: 'info'
    }, {
      tit: '求职意向',
      id: 'job'
    }, {
      tit: '工作经历',
      id: 'work'
    }, {
      tit: '教育背景',
      id: 'education'
    }, {
      tit: '技能/语言',
      id: 'skill'
    }, {
      tit: '个人优势',
      id: 'advance'
    }, ],
    copyInfoArr: ['info'], //必须拷贝的信息
    resumeInfo: { //创建/修改
      id: '',
      title: '',
    },

    resumeList: [], //简历列表
    newResume: 0, //创建/修改简历
    // 上传头像
    uploadInfo: {
      loading: false,
      message: '',
      noClick: false, //上传时禁止点击
    },

    advSelfDefine: false, //是否自定义
    advantage_define: '', //自定义加分项的值
    complete: 0, //是否完善， 0是没有完善，  1是部分完善  2是全部完善
    toFinish: 0, //待完善的项目数

    /***************个人信息****************/
    birthShow: '',
    basic: {
      birth: '', //出生年月
      sex: '', //性别
      work_jy: '', //工作经验
      phone: phone, //电话
      wechat: '', //微信
      email: '',
      identify: 1, //身份
      photo_url: '', //头像地址
      photo: '',
      name: userName ? userName : '', //名称
      work_jy_name: '',
      work_jy: '',
      
      workState: '', //就职状态、
      workState_name: '', //就职状态名字
    },


    /********************意向职位*********************/
    intention: {
      addr: '', //区域id
      addr_list: [], //区域id全
      addr_list_Name: [], //区域全名
      job: [], //意向职位id
      job_name: [], //意向职位
      job_list: [], //意向职位 id全
      job_list_name: [], //意向职位 全名
      max_salary: '', //最高
      min_salary: '', //最低
      nature: '', //职位性质 id
      nature_name: '', //职位性质 名
      type: [], // 行业id
      type_list: [], //行业id 全
      type_list_name: [], //行业全名
      type_name: [], //行业名
      workState: '', //就职状态、
      workState_name: '', //就职状态名字
      startWork: '', //就职时间
    },

    // 求职状态弹窗
    joinStatePop: false, //弹窗显示
    joinPopConfig: {
      title: '求职状态',
      stateGroup: [
        [{
          id: 1,
          title: '离职，正在找工作'
        }],
        [{
          id: 2,
          title: '在职，正在找工作'
        }, {
          id: 3,
          title: '在职，看看新机会'
        }, {
          id: 4,
          title: '在职，暂不找工作'
        }, ],
        [{
          id: 5,
          title: '应届毕业生'
        }, {
          id: 6,
          title: '在校生'
        }],
      ],
      name: 'workState',
      btnCancel: false,
    },


    resumeSetting: false, //简历设置弹窗
    directInpage: false, //是否直接通过参数进入页面
    certificateArr:['计算机证书','注册会计师(CPA)','注册消防工程师','CAD证书','注册金融分析师(CFA)','注册安全工程师','中小学教师资格证','特许公认会计师(ACCA)','造价工程师','国际双语教师资格证','人力资源管理师','注册建造师','秘书资格证','PMP项目资源管理证','注册建筑师','律师资格证',],
    showCard:false, //隐藏身份卡    
  },
  computed: {
    // 号码隐私
    phoneChange() {
      return function (tel) {
        if (tel) {

          return tel.replace(/^(\d{3})\d{4}(\d+)/, "$1****$2")
        }
      }
    },

    // 验证是否被选中
    checkHasChosed() {
      return function (id, ind) {
        var tt = this;
        var index = tt.choseTypeArr.findIndex(function (val) {
          return val && val.length && val.indexOf(id) == ind
        })
        return index;
      }
    },

    checkCount: function () {
      return function (obj) {
        var count = 0;
        if (Array.isArray(obj) && obj.length > 0) {
          count = obj.length;
        } else if (typeof (obj) == 'object') {
          for (var item in obj) {
            if (obj[item].length && obj[item][0]) {
              count = obj[item].length + count;
            }
          }
        }

        return count;
      }
    },
  },
  mounted: function () {
    var tt = this;
    mobiscroll.settings = {
      theme: 'ios',
      themeVariant: 'light',
      lang: 'zh',
      height: 40,
      headerText: true,
      buttons: [{
          text: '确定', //完成
          handler: 'set'
        },
        'cancel',
      ]

    };




    // 极验相关
    if (geetest) {
      tt.$nextTick(() => {
        captchaVerifyFun.initCaptcha('h5','#codeButton',tt.sendVerCode)	
      })
    }
    if(tt.getUrlParam('pageShow')){
      tt.directInpage = true;
      tt.pageShow = tt.getUrlParam('pageShow');
    }
    tt.$nextTick(function(){

      // 初始化滚轮选择器
      tt.initChoose();
  
  
      // 数据初始简单处理
      tt.initData()
  
      tt.getYearData();
    })


  },
  methods: {

    // 编辑基本信息的提示
    checkResumeState(ind,callBack,param1,param2,param3){
      const that = this;
      let curr = parseInt(new Date().valueOf() / 1000)

      if(!fabuResumeCheck && (that.currResume.state == 1 || that.currResume.refreshNext > curr || that.currResume.bid_end > curr)){
        var setOptions = {
            btnSure: '继续修改',
            btnColor: '#256CFA',
            title: '修改此内容将重新审核简历',
            confirmTip: (that.currResume.refreshNext > curr || that.currResume.bid_end > curr) ? '提交修改后，进行中的简历推广将直接结束' : '审核中简历暂不可用于投递' ,
            isShow: true,
            popClass: 'setConfirmPop'
    
          };
          confirmPop(setOptions, function () {
            if(callBack){
              callBack(param1,param2,param3)
            }else if(ind){
              that.pageShow = ind
            }
          })
      }else{
        if(callBack){
          callBack(param1,param2,param3)
        }else if(ind){
          that.pageShow = ind
        }
      }
    },

    // 修改个人优势
    changeAdv(){
      const that = this;
      that.pageShow = 6; 
      that.advantage = that.currResume.advantage
    },

    // 换一个
    changeModule(){
      let length=$('.exp_con').length;
      let index=$('.exp_con.active').index();
      if(index==length){
        index=0
      };
      $('.exp_con').eq(index).addClass('active').siblings('.exp_con').removeClass('active');
      let title=$('.exp_con.active p').text();
      $('.page_workjy .exampleCon .exp_head h4').text(title);
    },
    // 初始化选择框
    initChoose(type) {
      var tt = this;
      if (tt.pageShow == 2) {
        // 最大出生年月
        let year = new Date().getFullYear()
        let maxDate = new Date().setFullYear(year - 16)
        let minDate = new Date().setFullYear(year - 70)
        // 初始化出生年月选择
        if (!type || type == 'birth') {
          dateitem = mobiscroll.date('.dateitem input.small_inp', {
            display: 'bottom',
            touchUi: false,
            monthText: '月',
            yearText: '年',
            headerText: '出生年月',
            min: new Date(minDate),
            max: new Date(maxDate),
            dateFormat: 'yy/mm',
            onSet: function (inst, event) {
              tt.basic.birth = parseInt(new Date(inst.valueText + '/01').valueOf() / 1000);
              tt.birthShow = inst.valueText;
            	console.log(tt.basic.birth)

            },
          })
        }

        // 性别
        if ((!type || type == 'sex')) {

          sexitem = mobiscroll.select('.sexitem  input', {
            data: [{
              id: 0,
              title: '男'
            }, {
              id: 1,
              title: '女'
            }],
            inputElement: $('.sexitem input.small_inp'),
            dataText: 'title',
            dataValue: 'id',
            headerText: '性别选择',
            onInit: function () {
              tt.basic.sex = 0;
            },
            onSet: function (inst, event) {
              tt.basic.sex = inst.valueText == '女' ? 1 : 0;
            },
          })
        }
        // 工作经验
        if ( (!type || type == 'experience')) {
          experienceItem = mobiscroll.select('.experienceItem  input.small_inp', {
            data: experienceArr,
            // inputElement: $('.sexitem input'),
            dataText: 'title',
            dataValue: 'id',
            headerText: '工作经验',
            onInit: function () {
              // tt.basic.work_jy = tt.baseConfig && tt.baseConfig.experience && tt.baseConfig.experience.length ? tt.baseConfig.experience[0].id : '';
              tt.basic.work_jy = 0; //暂无经验
            },
            onSet: function (inst, event) {
              tt.basic.work_jy = event._wheelArray[0];
              tt.basic.work_jy_name = inst.valueText;
            },
          })

        } 

     

        // else if (!type || type == 'experience') {
        //   tt.getBaseConfig('experience')
        // }
      } else if (tt.pageShow == 3) {
        // 薪资选择
        var min_salary = tt.intention.min_salary;
        var max_salary = tt.intention.max_salary;

        var salaryText = min_salary > 0 || max_salary > 0 ? [min_salary, max_salary] : ''
        mobiscroll.treelist('#salaryList', {
          display: 'bottom',
          circular: false,
          headerText: '期望薪资',
          defaultValue: salaryText,
          onSet: function (valueText, inst) {
            var salaryArr = valueText.valueText.split(' ');
            tt.intention.min_salary = salaryArr[0]
            tt.intention.max_salary = salaryArr[1]
            tt.salaryText = salaryArr[0] >= 1000 ? ((salaryArr[0] == salaryArr[1] ? salaryArr[0] : valueText.valueText.replace(' ', '-')) + echoCurrency("short") + ' /月') : ('1000以下')
          },
        })

        // 求职状态
        if (tt.baseConfig && (!type || type == 'workState')) {
          // workStateItem = mobiscroll.select('.workStateItem  input.big_small', {
          //   data:tt.baseConfig.workState,
          //   // inputElement: $('.sexitem input'),
          //   dataText:'typename',
          //   dataValue:'id',
          //   headerText:'求职状态',
          //   onInit:function(){
          //     tt.intention.workState = tt.baseConfig.workState[0].id
          //   },
          //   onSet: function (inst,event) {
          //       // console.log(event._wheelArray[0])
          //       tt.intention.workState = event._wheelArray[0]
          //   },
          // })
        } else if (!type || type == 'workState') {
          tt.getBaseConfig('workState')
        }

        // 到岗时间
        if (tt.baseConfig && (!type || type == 'startWork')) {
          startWorkItem = mobiscroll.select('.startWorkItem  input.big_small', {
            data: tt.baseConfig.startWork,
            // inputElement: $('.sexitem input'),
            dataText: 'typename',
            dataValue: 'id',
            headerText: '到岗时间',
            onInit: function () {
              tt.intention.startWork = tt.baseConfig.startWork[0].id
            },
            onSet: function (inst, event) {
              tt.intention.startWork = event._wheelArray[0]
            },
          })
        }



      } else if (tt.pageShow == 5 && !tt.baseConfig) {
        tt.getBaseConfig()
      }

    },


    // 获取相关配置
    getBaseConfig(typename) {
      var tt = this;
      $.ajax({
        url: '/include/ajax.php?service=job&action=getItem&name=jobTag,jobNature,education,experience,workState,startWork,advantage,identify&type=auto',
        type: "POST",
        dataType: "json",
        success: function (data) {
          if (data.state == 100) {
            tt.baseConfig = data.info;
            tt.initChoose(typename);
            if (typename == 'workState') {
              tt.initChoose('startWork');
            }
          }
        },
        error: function () {

        }
      });
    },

    // 点击改变手机号
    changeBindPhone() {
      var tt = this;
      tt.telphone = tt.currResume.phone;
      tt.showPrivatePop = true; //显示手机号的弹窗
      tt.showKeyBoard = true;
      // if(phoneCheck){  //
      // }
    },
    // 发送验证码
    sendVerCode: function (captchaVerifyParam,callback) {
      var tt = this;
      let btn = $('.pp_getCode')
      btn.addClass('noclick');
      var phone = tt.telphone;
      var areacode = tt.areaCode;

      var param = "&phone=" + phone + "&areaCode=" + areacode ;
      if(captchaVerifyParam && geetest == 2){
        param = param + '&geetest_challenge=' + captchaVerifyParam
      }else if(geetest == 1 && captchaVerifyParam){
        param = param +  captchaVerifyParam
      }
      var codeType = 'verify';
      // var codeType = (tt.changePhone || !tt.phoneCheck) && tt.if_login ? "verify" : "sms_login"
      $.ajax({
        url: "/include/ajax.php?service=siteConfig&action=getPhoneVerify&terminal=mobile&type=" + codeType + param,
        type: "POST",
        dataType: "json",
        success: function (data) {
          if(callback){
            callback(data)
          }
          //获取成功
          if (data && data.state == 100) {
            tt.showKeyBoard2 = true
            tt.showKeyBoard = false;
            tt.countDown(60, btn);
            //获取失败
          } else {
            btn.removeClass("noclick").text(langData['siteConfig'][4][1]); //获取验证码
            showErrAlert(data.info);
          }
        },
        error: function () {
          btn.removeClass("noclick").text(langData['siteConfig'][4][1]); //获取验证码
          showErrAlert(langData['siteConfig'][20][173]); //网络错误，发送失败！
        }
      });
    },

    countDown: function (time, obj, func) {
      times = obj;
      obj.addClass("noclick").text(langData['siteConfig'][20][5].replace('1', time)); //1s后重新发送
      mtimer = setInterval(function () {
        obj.text(langData['siteConfig'][20][5].replace('1', (--time))); //1s后重新发送
        if (time <= 0) {
          clearInterval(mtimer);
          obj.removeClass('noclick').text(langData['siteConfig'][4][2]);
        }
      }, 1000);
    },


    // 极验
    handlerPopupReg: function (captchaObjReg) {
      // 成功的回调
      var t = this;
      captchaObjReg.onSuccess(function () {
        var validate = captchaObjReg.getValidate();
        t.dataGeetest = "&geetest_challenge=" + validate.geetest_challenge + "&geetest_validate=" + validate.geetest_validate + "&geetest_seccode=" + validate.geetest_seccode;
        t.sendVerCode();

      });
      captchaObjReg.onClose(function () {})

      window.captchaObjReg = captchaObjReg;
    },

    // 确定修改绑定手机号
    changePhone() {
      var tt = this;
      $.ajax({
        url: '/include/ajax.php?service=job&action=verResumePhone&phone=' + tt.telphone + '&vercode=' + tt.phoneCode,
        type: "POST",
        dataType: "json",
        success: function (data) {
          if (data.state == 100) {
            console.log('修改成功')
            tt.basic.phone = tt.telphone;
            tt.showPrivatePop = false; //隐藏弹窗
          }
        },
        error: function () {}
      });

    },

    // 获取短信验证码
    getPhoneMsg: function () {
      var tt = this;
      var btn = event.currentTarget;
      var phone = tt.telphone,
        areacode = tt.areaCode;

      if (phone == '') {
        showErrAlert(langData['siteConfig'][20][463]); //请输入手机号码
        return false;
      } else if (areacode == "86") {
        var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
        if (!phoneReg.test(phone)) {
          showErrAlert('请输入正确的手机号码'); //手机号码格式不正确
          return false;
        }
      }

      // 需要极验
      if (geetest) {
        //弹出验证码
				if (geetest == 1) {
					captchaVerifyFun.config.captchaObjReg.verify();
				} else {
					$('#codeButton').click()
				}
      }

      // 不需要极验
      if (!geetest) {
        tt.sendVerCode();
      }

    },


    // 获取行业类别
    getJobIndustry() {
      var tt = this;
      $.ajax({
        url: '/include/ajax.php?service=job&action=industry&son=1',
        type: "POST",
        dataType: "jsonp",
        success: function (data) {
          if (data.state == 100) {
            tt.industryList = data.info;
            for (var i = 0; i < tt.industryList.length; i++) {
              if (tt.currResume.type) {

              }
            }
          }
        },
        error: function () {

        }
      });
    },

    // 点击选择
    choseItem(item, type) {
      var tt = this;
      var hasFull = tt.choseIndustryObj && tt.choseIndustryObj.length >= 3 ? true : false;
      if (!type) {
        tt.currChoseOn = item;
        //有多级
        if (item.lower && item.lower.length) {
          tt.showChildPop = true;
        } else {
          // 只选1级
          if (tt.choseIndustry.indexOf(item.id) > -1) { //清除
            tt.choseIndustry.splice(tt.choseIndustry.indexOf(item.id), 1)
            tt.choseIndustryObj.splice(tt.choseIndustry.indexOf(item.id), 1)
            hasFull = false;
          } else if (!tt.choseIndustryObj || tt.choseIndustryObj.length < 3) {
            tt.choseIndustry.push(item.id)
            tt.choseIndustryObj.push({
              id: item.id,
              title: item.typename
            })
          }
          if (hasFull) {
            showErrAlert('行业最多只能选择3个')
          }
          // tt.currResume.type =  tt.choseIndustry;
        }
        return false;
      }

      // 多级
      tt.choseIndustry = Array.isArray(tt.choseIndustry) ? {} : tt.choseIndustry;
      if (tt.choseIndustry[tt.currChoseOn.id]) {
        if (tt.choseIndustry[tt.currChoseOn.id].indexOf(item.id) > -1 || tt.choseIndustry[tt.currChoseOn.id].indexOf(Number(item.id)) > -1) { //清除
          tt.choseIndustry[tt.currChoseOn.id].splice(tt.choseIndustry[tt.currChoseOn.id].indexOf(item.id), 1)
          const index = tt.choseIndustryObj.findIndex(function (val) {
            return val.id == item.id
          })

          tt.choseIndustryObj.splice(index, 1)


          hasFull = false;
        } else if ((!tt.choseIndustryObj || tt.choseIndustryObj.length < 3)) {
          tt.choseIndustry[tt.currChoseOn.id].push(item.id)
          tt.choseIndustryObj.push({
            id: item.id,
            title: item.typename
          })
        }
      } else if (!tt.choseIndustryObj || tt.choseIndustryObj.length < 3) {
        tt.choseIndustry[tt.currChoseOn.id] = [item.id]
        tt.choseIndustryObj.push({
          id: item.id,
          title: item.typename
        })
      }
      if (hasFull) {
        showErrAlert('行业最多只能选择3个')
      }
      tt.checkChoseItem()
      tt.$forceUpdate(); //强制更新

    },
    // 获取选中的id,只有多级可用
    checkChoseItem() {
      var tt = this;
      var choseArr = [];
      for (var item in tt.choseIndustry) {
        for (var i = 0; i < tt.choseIndustry[item].length; i++) {
          choseArr.push(tt.choseIndustry[item][i])
        }
      }
      tt.currResume.type = choseArr;
    },
    // 清除选中的 
    removeChose(item, ind, type) {
      var tt = this;
      if (!type) { //意向行业

        if (Array.isArray(tt.choseIndustry) && tt.choseIndustry.indexOf(item.id) > -1) {
          tt.choseIndustry.splice(tt.choseIndustry.indexOf(item.id), 1);
          tt.choseIndustryObj = tt.choseIndustry;
        } else {
          for (var industry in tt.choseIndustry) {
            for (var i = 0; i < tt.choseIndustry[industry].length; i++) {
              var obj = tt.choseIndustry[industry][i]
              if (item.id == obj) {
                tt.choseIndustry[industry].splice(i, 1);
                break;
              }
            }
          }
          // var choseArr = tt.currResume.type;
          // tt.currResume.type = choseArr.splice(choseArr.indexOf(item.id),1);
        }

        tt.choseIndustryObj.splice(ind, 1);
      } else { //意向职位
        var index = tt.choseTypeArr.findIndex(function (val) {
          return val.indexOf(item.id) > -1;
        })

        if (index > -1) {
          tt.choseTypeArr.splice(index, 1)

        }
        tt.choseTypeObj.splice(ind, 1)


      }

    },

    // 清除所有选中的
    clearAll(type) {
      var tt = this;
      if (type === 'industry') {
        // tt.currResume.type = '';
        tt.choseIndustryObj = [];
        tt.choseIndustry = [];
      } else {
        //  tt.currChoseType = '',// 当前选择的一级分类
        //  tt.currChoseStype = '',//二级分类
        // tt.showLeftPop = false, //二级分类页面左滑
        // tt.showRightPop = false, //三级分类页面左滑
        tt.choseTypeArr = [], //选择的id
          tt.choseTypeObj = []; //选中的内容
      }
    },

    // 获取职位类别
    getJobPostType() {
      var tt = this;
      $.ajax({
        url: '/include/ajax.php?service=job&action=type&son=1',
        type: "POST",
        dataType: "jsonp",
        success: function (data) {
          if (data.state == 100) {
            tt.postList = data.info;
            if (tt.currResume.job_list) {
              tt.choseTypeObj = [];
              for (var m = 0; m < tt.currResume.job_list.length; m++) {
                tt.checkJobType(data.info, 0, tt.currResume.job_list[m])
              }
            }

          }
        },
        error: function () {

        }
      });
    },

    checkJobType(item, ind, obj) {
      var tt = this;
      for (var i = 0; i < item.length; i++) {
        if (item[i].id == obj[ind]) {
          if(ind === 0){
            tt.currChoseType = item[i]
            
          }else if(ind == 1){
            tt.currChoseStype = item[i]
          }
          ind++;
          if (ind != obj.length) {
            tt.checkJobType(item[i].lower, ind, obj)
          } else {
            tt.showLeftPop = true;
            tt.showRightPop = true;
            tt.choseTypeObj.push({
              id: item[i].id,
              title: item[i].typename
            })
          }
          break;
        }
      }
    },


    // 选择当前分类
    chosePostType(item, type) {
      var tt = this;
      type = type ? type : 0;

      var hasFull = tt.choseTypeArr && tt.choseTypeArr.length >= 3 ? true : false;

      if (tt.pageShow !== 4) {
        if (!type) { //一级分类
          tt.currChoseType = item;
          tt.currChoseStype = []; //清空二级
          tt.showRightPop = false;
          setTimeout(() => {
            tt.showLeftPop = true;
          }, 50);

          return false;
        }
        if (type === 1) { //二级分类
          tt.currChoseStype = item;
          setTimeout(() => {
            tt.showRightPop = true;
          }, 50);

          if (!item.lower || item.lower.length == 0) {
            var choseArr = [tt.currChoseType.id, item.id]
            var index = tt.choseTypeArr.findIndex(function (val) {
              return tt.currChoseType.id == val[0] && item.id == val[1]
            });
            if (index > -1) {
              tt.choseTypeArr.splice(index, 1)
              tt.choseTypeObj.splice(index, 1)
              hasFull = false;
            } else {
              if (hasFull) {
                showErrAlert('职位最多只能选3个 ')
                return false;
              }
              tt.choseTypeArr.push(choseArr);
              tt.choseTypeObj.push({
                id: item.id,
                title: item.typename
              })
            }
          }


        }

        if (type === 2) {
          var choseArr = [tt.currChoseType.id, tt.currChoseStype.id, item.id];
          var index = tt.choseTypeArr.findIndex(function (val) {
            return tt.currChoseType.id == val[0] && tt.currChoseStype.id == val[1] && item.id == val[2]
          });
          if (index > -1) {
            hasFull = false;
            tt.choseTypeArr.splice(index, 1)
            tt.choseTypeObj.splice(index, 1)
          } else {
            if (hasFull) {
              showErrAlert('职位最多只能选3个 ')
              return false;
            }
            tt.choseTypeArr.push(choseArr)
            tt.choseTypeObj.push({
              id: item.id,
              title: item.typename
            })
          }
        }

      } else {

        tt.choseMyJob(item, type);
      }



    },

    // 确定选择
    sureChose(type) {
      var tt = this;
      if (type == 'post') {
        tt.intention.job = tt.choseTypeObj.map(function (val) {
          return val.id
        })
        tt.jobText = tt.choseTypeObj.map(function (val) {
          return val.title
        })
        tt.intention.job_list = tt.choseTypeArr;
        tt.intention.job_name = tt.jobText;
        tt.showPostPop = false;
      } else {
        tt.typeText = tt.choseIndustryObj.map(function (val) {
          return val.title
        })
        tt.intention.type_name = tt.typeText;
        tt.intention.type = tt.choseIndustryObj.map(function (val) {
          return val.id
        })
        tt.showIndustryPop = false;
      }
    },

    // 将意向职位选中的值赋值一下
    checkIntentionPostTypeChosed() {
      var tt = this;
      if (tt.intention.job_list && tt.intention.job_list.length) {
        tt.choseTypeArr = tt.intention.job_list
      }
      if (tt.intention.type && tt.intention.type.length) {
        for (var i = 0; i < tt.intention.type.length; i++) {
          if (tt.intention.type[i]) {

            tt.choseIndustryObj.push({
              id: tt.intention.type[i],
              title: tt.intention.type_name[i]
            });
          }

        }

        var arr1 = [];
        tt.choseIndustry = Array.isArray(tt.choseIndustry) ? {} : tt.choseIndustry;
        for (var i = 0; i < tt.intention.type_list.length; i++) {
          var typearr = tt.intention.type_list[i]
          if (arr1.indexOf(typearr[0]) <= -1) {
            arr1.push(typearr[0]);
            tt.choseIndustry[typearr[0]] = [typearr[1]]
          } else {
            tt.choseIndustry[typearr[0]].push(typearr[1])
          }
        }


      }
    },

    // 将担任职位选中的值赋值一下
    checkPostTypeChosed() {
      var tt = this;
      tt.currChoseType = tt.postList.find(item => {
        return item.id == tt.workjl.jobid[0]
      });

      if (tt.currChoseType && tt.currChoseType.lower) {
        tt.currChoseStype = tt.currChoseType.lower.find(item => {
          return item.id == tt.workjl.jobid[1]
        });
      }

      if (tt.currChoseStype) {
        tt.choseTypeArr = [tt.workjl.jobid];
        if (tt.workjl.jobid.length >= 2) {
          tt.showLeftPop = true;
        }
        if (tt.workjl.jobid.length >= 3) {
          tt.showRightPop = true;

        }
      }
    },


    // 曾经的职位选择
    showPostPopSingle() {
      var tt = this;
      tt.showPostPop = true;
      if (tt.workjl.jobid && tt.workjl.jobid.length) {
        tt.checkPostTypeChosed()
      }

    },

    /**********工作经历*********/
    // 修改工作经历
    changeWork(item, index) {
      var tt = this;
      if (item && index != undefined) {
        tt.workjl = JSON.parse(JSON.stringify(item));
        tt.edit_page = index; //当前编辑的索引
      } else {
        tt.edit_page = ''; //当前编辑的索引
        tt.textCount = 0;
        for (var key in tt.workjl) {
          tt.workjl[key] = key == 'jobid' ? [] : '';
        }
      }
      tt.pageShow = 4;

    },



    // 计算输入框输入的字数
    changeTextCount(action) {
      var tt = this;
      var el = event.currentTarget;
      if (event.keyCode != 8 && event.keyCode != 13 && !tt.textCount && !action) {
        tt.textCount = 1
      } else {
        var conText = $(el).text()
        tt.textCount = conText.length;
      }
      if (tt.textCount >= 500 && event.keyCode != 8) {
        event.returnValue = false;
      } else {
        event.returnValue = true;
      }

      tt.workjl.content = encodeURIComponent($(el).html());
    },


    


    // 初始化
    initData() {
      var tt = this;
      if (!tt.resumeList.length) {
        tt.getResumeList()
      }
      if (tt.pageShow == 1 ) {
        if (!tt.baseConfig) {
          tt.getBaseConfig();
        }
      } else if (tt.pageShow == 3) { //意向岗位

        tt.getJobIndustry(); //获取行业分类
        if (!tt.postList) {
          tt.getJobPostType(); //获取职位分类
        }

        tt.choseIndustry = []
        tt.choseIndustryObj = []
        tt.checkIntentionPostTypeChosed()


      } else if (tt.pageShow == 4) { //工作经历
        tt.choseTypeArr = []; //清空数据
        tt.choseTypeObj = [];

        if (!tt.postList) {
          tt.getJobPostType(); //获取职位分类
        }

        // 职位初始化


        // 工作内容初始化
        if (tt.workjl.content) {
          var regex = /(<([^>]+)>)/ig;
          var conText = tt.workjl.content;
          conText = conText.replace(regex, 1);
          tt.textCount = conText.length;
          tt.initNote = tt.workjl.content;
        } else {
          tt.initNote = ''
        }

        // 工作时间初始化
        if (tt.workjl.work_start) {
          tt.startDate = new Date(tt.workjl.work_start)
        }
      }
    },

    // 选择担任职位
    choseMyJob(item, type) {
      var tt = this;
      tt.choseTypeArr = [];
      tt.choseTypeObj = [];
      var endChose = false;
      if (!type) { //一级分类
        tt.currChoseType = item;
        tt.currChoseStype = []; //清空二级
        tt.showRightPop = false;
        setTimeout(() => {
          tt.showLeftPop = true;
        }, 50);

        return false;
      }

      if (type === 1) { //二级分类
        tt.currChoseStype = item;
        setTimeout(() => {
          tt.showRightPop = true;
        }, 50);

        if (!item.lower || item.lower.length == 0) {
          var choseArr = [tt.currChoseType.id, item.id]
          var index = tt.choseTypeArr.findIndex(function (val) {
            return tt.currChoseType.id == val[0] && item.id == val[1]
          });
          if (index <= -1) {
            tt.choseTypeArr.push(choseArr);
            tt.choseTypeObj.push({
              id: item.id,
              title: item.typename
            })
          }
          endChose = true;
        }


      }

      if (type === 2) {
        var choseArr = [tt.currChoseType.id, tt.currChoseStype.id, item.id];
        var index = tt.choseTypeArr.findIndex(function (val) {
          return tt.currChoseType.id == val[0] && tt.currChoseStype.id == val[1] && item.id == val[2]
        });
        if (index <= -1) {
          tt.choseTypeArr.push(choseArr)
          tt.choseTypeObj.push({
            id: item.id,
            title: item.typename
          })
        }
        endChose = true;
      }
      if (endChose) {

        tt.workjl.job = item.id;
        tt.workjl.job = item.typename;
        tt.workjl.jobid = tt.choseTypeArr[0];
        tt.showPostPop = false; //隐藏职位
      }

    },

    // 时间选择器相关
    formatter(type, val) {

      if (type === 'year') {
        var currYear = new Date().getFullYear()
        var text = `${val}年`;
        return text;
      } else if (type === 'month') {
        return `${val}月`
      } else if (type === 'day') {
        return `${val}日`
      }

      return val;
    },


    // 离职日期改变
    checkDate(picker, value, index) {
      var tt = this;
      tt.endDate = value;
    },

    getYearData() {
      var tt = this;
      var currY = new Date().getFullYear();
      var currM = new Date().getMonth() + 1;
      // var startY = tt.startDate ? tt.startDate.getFullYear() : 1968;
      // var startM = tt.startDate ? tt.startDate.getMonth() + 1 : 1;
      var startY = 1968;
      var startM = 1;
      var dateArr = [];
      var indexArr = []
      for (var i = startY; i <= currY; i++) {
        var monthArr = []
        for (var m = 1; m <= 12; m++) {
          if ((i != currY && startY != i) || (m <= currM && i == currY && startY != i) || (startY == i && m >= startM)) {
            monthArr.push({
              text: m,
              title: m + '月',
            })
          }
        }
        dateArr.push({
          text: i,
          children: monthArr,
          title: i + '年',
        })
        if (currY == i) {
          dateArr.push({
            text: 0,
            title: '至今',
            children: [{
              title: '',
              text: 0
            }],
          })
        }



      }
      tt.yearArr = dateArr;

    },

    addWorkDate() {
      var tt = this;
      if (tt.pageShow == 4) { //工作经验

        var work_start = tt.startDate.getFullYear() + '/' + (tt.startDate.getMonth() + 1);
        var work_end = tt.endDate[0].replace('年', '') + (tt.endDate[1] ? ('/' + tt.endDate[1].replace('月', '')) : '');

        var endDate = work_end == '至今' ? new Date() : new Date(work_end);
        if (new Date(work_start).valueOf() > endDate.valueOf()) {
          showErrAlert('离职时间不能早于早于入职时间！')
          return false;
        }



        tt.workjl.work_start = work_start;
        tt.workjl.work_end = work_end;
      } else if (tt.pageShow == 5) { //开学时间
        if (tt.showScrollType == 'edutime') {
          tt.educationJl.start = tt.startJoin.getFullYear() + '/' + (tt.startJoin.getMonth() + 1);
          tt.educationJl.end = tt.endLeave.getFullYear() + '/' + (tt.endLeave.getMonth() + 1);
        } else if (tt.showScrollType == 'edu') {
          var choseItem = tt.$refs.eductionPicker.getValues();
          tt.educationJl.xl = choseItem[0].typename;
          tt.educationJl.xl_id = choseItem[0].id;
          console.log(choseItem)
        }
      } else if (tt.pageShow == 7) {
        if (tt.showScrollType == 'lang') {
          tt.$refs.langPicker.confirm()
          var choseItem = tt.$refs.langPicker.getValues();
          var skillIndex = tt.$refs.langPicker.getIndexes();
          tt.skillIndex = skillIndex[0]
          tt.skillObj.lang = choseItem[0]
        } else if (tt.showScrollType == 'skill_time') {
          tt.skillObj.time = (tt.skillTime.getFullYear()).toString()

        } else if (tt.showScrollType == 'level') {
          var choseItem_l = tt.$refs.levelPicker_l.getValues();
          var choseItem_r = tt.$refs.levelPicker_r.getValues();
          var index_l = tt.$refs.levelPicker_l.getIndexes();
          var index_r = tt.$refs.levelPicker_r.getIndexes();
          tt.skillObj.level_read =  choseItem_r[0]
          tt.skillObj.level_speak =  choseItem_l[0]
        }
      }
      tt.showScrollPop = false;
    },

    // 点击删除按钮
    confirmDelResume() {
      var tt = this;
      var delResumeOptions = {
        btnSure: '删除简历',
        btnColor: '#F21818',
        title: '确定删除《' + tt.currResume.alias + '》？',
        confirmTip: '此操作不可恢复，请谨慎删除',
        isShow: true,
        popClass: 'delConfirmPop'

      };
      confirmPop(delResumeOptions, function () {
        tt.delResume(tt.currResume.id);
      })
    },

    // 确删除
    delResume(id) {
      var tt = this;
      $.ajax({
        url: '/include/ajax.php?service=job&action=delResume&id=' + id,
        type: "POST",
        dataType: "json",
        success: function (data) {
          if (data.state == 100) {
            showErrAlert('简历已删除');
            tt.resumeSetting = false;
            tt.getResumeList();
          }
        },
        error: function () {

        }
      });
    },

    // 显示选择弹窗
    showScrollPopFun(type) {
      var tt = this;
      if (tt.pageShow == 4) { //入职/离职时间
        setTimeout(() => {
          tt.$refs.endDatePicker.setValues(tt.endDate)
        }, 300);
      } else if (tt.pageShow == 5) { //入学/毕业时间
        if (type == 'edutime') {
          tt.startJoin = tt.educationJl.start ? new Date(tt.educationJl.start) : new Date();
          tt.endLeave = tt.educationJl.end ? new Date(tt.educationJl.end) : new Date();
        } else if (type == 'edu') {
          if (tt.educationJl.xl) {
            
            tt.eduObjIndex = tt.baseConfig.education.findIndex(function (val) {
              return val.typename == tt.educationJl.xl
            })
            if(!tt.educationJl.xl_id){
              tt.educationJl['xl_id'] = tt.baseConfig.education[tt.eduObjIndex].id
            }
          }
        }
      } else if (tt.pageShow == 7) {
        tt.skillIndex = tt.languageArr.findIndex(item => {
          return item == tt.skillObj.lang
        });
        tt.skillTime = tt.skillObj.time ? new Date(String(tt.skillObj.time)): new Date()
        tt.levelIndex_l = tt.levelArr.indexOf(tt.skillObj.level_speak)
        tt.levelIndex_r = tt.levelArr.indexOf(tt.skillObj.level_read)
      }
      tt.showScrollType = type
      tt.showScrollPop = true;
    },


    // 创建简历时是否删除
    copyInfo(item) {
      if (item.id == 2) return false;
      var tt = this;
      if (tt.copyInfoArr.includes(item.id)) {
        tt.copyInfoArr.splice(tt.copyInfoArr.indexOf(item.id), 1)
      } else {
        tt.copyInfoArr.push(item.id)
      }
    },

    // 上传照片
    afterRead(data) {
      var tt = this;
      let fileObj = data.file;
      tt.currResume.photo_url = data.content;
      let formData = new FormData();
      formData.append('size', fileObj.size);
      formData.append('lastModifiedDate', fileObj.lastModifiedDate);
      formData.append('name', fileObj.name);
      formData.append('Filedata', fileObj);
      tt.uploadInfo.loading = true;
      tt.uploadInfo.noClick = true;
      tt.uploadInfo.message = '上传中...';
      tt.uploadFile(formData, function (data) {
        tt.uploadInfo.noClick = false;
        if (data.url != '') {
          tt.uploadInfo.loading = false;
          tt.uploadInfo.message = '';
        } else {
          tt.uploadInfo.status = true;
          tt.uploadInfo.message = '上传失败'
        }
      })
    },
    // 提交服务器
    uploadFile(file, fun) {
      var tt = this;
      $.ajax({
        url: '/include/upload.inc.php?mod=job&type=atlas',
        data: file,
        type: "POST",
        dataType: "json",
        processData: false, // jQuery不要去处理发送的数据
        contentType: false, // jQuery不要去设置Content-Type请求头
        success: function (data) {
          tt.basic.photo = data.url;
          tt.basic.photo_url = data.turl;
          fun(data)
        },
        error: function () {

        }
      });
    },

    // 获取简历列表  
    getResumeList(id) {
      var tt = this;
      if (tt.loading) return false;
      if (!tt.pageLoad) {
        tt.loading = true;
        tt.pageLoad = true;
      }
      $.ajax({
        url: '/include/ajax.php?service=job&action=resumeList&page=1&pageSize=50&u=1',
        type: "POST",
        dataType: "json",
        success: function (data) {
          tt.loading = false;
          if (data.state == 100) {
            tt.resumeList = data.info.list;
            if (!id) {
              tt.currResume = data.info.list[0];
              // tt.checkRunTime(tt.currResume.refreshNext)
              // 此处应验证刷新

            } else {
              tt.currResume = data.info.list.find(item => {
                return id == item.id;
              });
              tt.pageShow = 1;
            }
            tt.checkResumeComplete(tt.currResume); //验证完成度
            tt.salaryText = tt.currResume.min_salary || tt.currResume.max_salary ? tt.currResume.show_salary + echoCurrency('short') + '/月' : ''; //价格
            if (tt.getUrlParam('pageShow')) {
              tt.directInpage = Number(tt.getUrlParam('pageShow'));
              if (tt.resumeList.length && tt.complete >= 1 && tt.directInpage == 9) { //已经有简历，并且基本完成的才会进入简历预览
                tt.pageShow = Number(tt.getUrlParam('pageShow'));
              } else if (tt.directInpage != 9) {
                tt.pageShow = Number(tt.getUrlParam('pageShow'));
              }else{
                if(!tt.currResume.name){
                  tt.pageShow = 2;
                }else if(tt.currResume.need_complete == '0'){
                  tt.pageShow = 1;
                }

              }
            }
            tt.$set(tt.resumeList)
          }
        },
        error: function () {
          tt.loading = false;
        }
      });
    },

    // 显示自定义输入框
    showSelfDefine(){
      const that= this;
      if(that.currResume.ad_tag.length >= 3){
        showErrAlert('最多选择3个标签')
        return false;
      }
      that.advSelfDefine = true;
    },

    // checkRunTime(time){
    //   if(time > 0){
    //       time = Number(time);
    //       let curr = parseInt(new Date().valueOf()/1000);
    //       if(curr > time){
    //           clearInterval(nextFreshIntferval);
    //           $('.onfreshPop .refreshBox,.bgbox .refreshBox').remove(); //没有刷新
    //       }else{
    //           nextFreshIntferval = setInterval(function(){
    //               const timeOff = time - parseInt(new Date().valueOf()/1000) ;
    //               const hh = parseInt(timeOff / (60 * 60 ))
    //               const mm = parseInt(timeOff % (60 * 60 ) / 60)
    //               const ss = timeOff % (60 * 60 ) % 60;
    //               $('.onfreshPop .refreshBox em,.bgbox .refreshBox em').text(hh + ':' + mm + ':' + ss)
    //               if(timeOff <= 0){
    //                   clearInterval(nextFreshIntferval);
    //               }
    //           },1000)
    //       }
    //   }
    // },

    // 验证简历的完整性
    checkResumeComplete(resume, type) {
      var tt = this;
      var baseInfo = ['photo', 'name', 'birth', 'identify', 'sex', 'work_jy', 'phone', ]; //基本信息
      var intentionInfo = ['type', 'job', 'nature', 'addr', 'min_salary', 'max_salary', 'startWork', 'workState'] //意向工作
      var notFillItem = ['advantage', 'skill.lng', 'skill.ski', 'skill.ad_tag']; //非必填项
      var complete = 2;
      tt.toFinish = 0;
      var flag_addr = 0,
        flag_edu = 0
      for (item in resume) {
        if (resume[item] === '' || resume[item] === null || resume[item].length == 0 || ((item.indexOf('salary') > -1 || item.indexOf('nature') > -1) && item === 0)) {
          if (item.indexOf('addr') > -1) {
            flag_addr = flag_addr + 1;
          } else if (item.indexOf('edu') > -1) {
            flag_edu = flag_edu + 1;
          } else if(item.indexOf('bid_') < -1){
            tt.toFinish = tt.toFinish + 1;
          }
          if ((baseInfo.includes(item) || intentionInfo.includes(item)) && item != 'email' || item == 'eductaion') {
            complete = 0;
            break;
          } else if (item == 'work_jl') {
            if (resume.identify && !resume.work_jl_none) {
              complete = 0;
              break;
            } else {
              complete = 1
            }
          } else if (!notFillItem.includes[item] || item == 'email') {
            complete = 1;
          }
        }

      }
      tt.toFinish = tt.toFinish + (flag_addr > 0 ? 1 : 0) + (flag_edu > 0 ? 1 : 0)

      tt.complete = complete;
    },

    //  编辑教育背景
    changeEdu(item, index) {
      var tt = this;
      if (item) {
        tt.edit_page = index;
        tt.educationJl = item
      } else {
        tt.edit_page = '';
        for (var key in tt.educationJl) {
          tt.educationJl[key] = ''
        }
      }
      tt.pageShow = 5;
    },

    // 编辑技能
    editSkill(item, type, ind) {
      var tt = this;
      console.log(item);
      tt.pageShow = 7;
      if (item && type !== undefined) {
        tt.edit_page = ind;
        tt.skillObj = JSON.parse(JSON.stringify(item));
      } else {
        tt.edit_page = '';
        for (var item in tt.skillObj) {
          tt.skillObj[item] = item == 'type' ? 0 : '';
        }
      }
    },

    // 编辑个人加分项
    editAdTag() {
      var tt = this;
      if (event.keyCode == 13) {

          tt.sureEdit();

      }
    },

    sureEdit(){
      const tt = this;
      tt.advSelfDefine = false;
      let arrHas = tt.currResume.ad_tag.filter(item => {
        let arr = [];
        for(var i = 0; i < tt.baseConfig['advantage'].length; i++){
          if(item == tt.baseConfig['advantage'][i].typename){
            arr.push(item)
          }
        }
        return arr.includes(item)
      })
      if(arrHas.length >= 3){
        showErrAlert('最多只能选择3个')
        return false;
      }
      if(tt.advantage_define){
        arrHas.push(tt.advantage_define)
      }

      tt.currResume.ad_tag = arrHas
      tt.submit('ad_tag', function (data) {
        tt.advSelfDefine = false;
        if (data.state != 100) {
          tt.currResume.ad_tag = or_tag;
        }
      })
    },

  

    
    // 选择加分项
    choseAdTag(item) {
      var tt = this;
      var or_tag = JSON.parse(JSON.stringify(tt.currResume.ad_tag));
  
      if (tt.currResume.ad_tag.includes(item.typename)) {
        tt.currResume.ad_tag.splice(tt.currResume.ad_tag.indexOf(item.typename), 1)
      } else {
        if(tt.currResume.ad_tag.length >= 3){
          showErrAlert('最多只能选择3个')
          return false;
        }
        tt.currResume.ad_tag.push(item.typename);
      }

      tt.submit('ad_tag', function (data) {
        if (data.state != 100) {
          tt.currResume.ad_tag = or_tag;
        }
      })
    },

    // 点击保存按钮，保存数据
    saveData(key) { //key表示当前要保存的数据
      var tt = this;
      var wrong = tt.checkRules(key);
      if (!wrong) return false;

      if (key == 'work_jl') { //工作经历
        tt.currResume.work_jl = tt.currResume.work_jl ? tt.currResume.work_jl : []
        if (tt.edit_page !== '') {
          tt.currResume.work_jl.splice(tt.edit_page, 1, tt.workjl)
        } else {
          tt.currResume.work_jl.push(tt.workjl)
        }
      }
      if (key == 'education') { //教育背景
        if (tt.edit_page !== '') {
          tt.currResume.education.splice(tt.edit_page, 1, tt.educationJl)
        } else {
          if(!Array.isArray(tt.currResume.education)){
            tt.currResume.education = []
          }
          tt.currResume.education.push(tt.educationJl)
        }

      }

      if (key == 'advantage') {
        tt.currResume[key] = tt.advantage;
      }

      if (key == 'skill') {
        var type = tt.skillObj.type == 0 || tt.skillObj.type == '语言能力' ? 'lng' : 'ski'
        if (tt.edit_page !== '') {
          tt.currResume.skill[type].splice(tt.edit_page, 1, tt.skillObj)
        } else {
          if(tt.currResume.skill[type] && Array.isArray(tt.currResume.skill[type])){
            tt.currResume.skill[type].push((tt.skillObj))
          }else{

            tt.currResume.skill[type] = [(tt.skillObj)]
          }
        }
      }


      



      tt.submit(key, '', function (data) {
        if (data.state == 100) {
          tt.getResumeList(tt.currResume.id)
        }
      })
    },


    // 提交表单
    submit(item, type, callback) {
      var tt = this;
      var param = [];

      if (tt.submit_loading) return false;
      tt.submit_loading = true;
      var id = tt.currResume.id ? tt.currResume.id : 0;
      param.push('id=' + id)
      if (item && item != 'work_jl_none') {
        param.push('columns=' + item);
        if (item == 'work_jl' || item == 'education' || item == 'skill') {
          param.push(item + '=' + JSON.stringify(tt.currResume[item]))
        } else if (item == 'ad_tag') {
          param.push(item + '=' + tt.currResume[item].join('||'))
        } else if (item == 'basic' || item == 'intention') {
          for (var key in tt[item]) {
            param.push(key + '=' + tt[item][key]);
          }
          if(item == 'intention' && (!tt.currResume.workState ||!tt.currResume.startWork )){
            let ind = param.indexOf('columns=intention')
            param.splice(ind,1,'columns=type')
          }
        } else {
          param.push(item + '=' + tt.currResume[item]);
        }
      }else if(item == 'work_jl_none'){
        param.push('columns=work_jl');
        param.push(item + '=' + tt.currResume[item]);
      }
      param.push('cityid=' + cityid);
      // return false;
      $.ajax({
        url: '/include/ajax.php?service=job&action=aeResume',
        data: param.join('&'),
        type: "POST",
        dataType: "json",
        success: function (data) {
          tt.submit_loading = false;
          if (data.state == 100) {
            if (callback) {
              callback(data);
            }
            if (type == 'del') {
              showErrAlert('删除成功')
            } else {
              showErrAlert('保存成功')
            }

            if (item == 'basic') {
              for (var key in tt.basic) {
                tt.currResume[key] = tt.basic[key];
              }
            } else if (item == 'intention') {
              for (var key in tt.intention) {
                tt.currResume[key] = tt.intention[key];
              }
            }


            tt.pageShow = 1;
            if (id === 0) { //创建简历
              tt.getResumeList()
            }
          } else {
            showErrAlert(data.info)
          }
        },
        error: function () {}
      });
    },

    // 删除工作经历/教育背景/语言/技能
    delResume_item: function (item) {
      var tt = this;
      if (item != 'skill') {
           var delResumeOptions = {
            btnSure: '删除',
            btnColor: '#F21818',
            title: '确定删除'+(item == 'work_jl' ? '工作经历' : '教育背景')+'？',
            confirmTip: '此操作不可恢复，请谨慎删除',
            isShow: true,
            popClass: 'delConfirmPop'

          };
          confirmPop(delResumeOptions, function () {
            tt.currResume[item].splice(tt.edit_page, 1)
            tt.submit(item, 'del');
          })
        
      } else {
        if (tt.skillObj.type === 0 || tt.skillObj.type == '语言能力') {
          tt.currResume['skill'].lng.splice(tt.edit_page, 1)
        } else if (tt.skillObj.type === 1 || tt.skillObj.type == '专业技能') {
          tt.currResume['skill'].ski.splice(tt.edit_page, 1)
        }
        tt.submit(item, 'del');
      }
    },

 

    // 选择无工作经历
    noWork_jl(){
      const tt = this;
      tt.currResume.work_jl_none = 1;
      tt.saveData('work_jl_none'); //无工作经历
      tt.pageShow = 1
    },

    // 验证表单
    checkRules(key) {
      var tt = this;
      var checkRules = false;
      var errTip = '';
      if (key == 'work_jl') { //新增编辑工作经历
        itemArrObj = [{
          key: 'company',
          tip: '请先输入公司名称'
        }, {
          key: 'content',
          tip: '请先输入工作内容'
        }, {
          key: 'department',
          tip: '请先输入部门'
        }, {
          key: 'work_start',
          tip: '请先选择入职时间'
        }, {
          key: 'work_end',
          tip: '请先选择离职时间'
        }]
        for (var i = 0; i < itemArrObj.length; i++) {
          if (!tt.workjl[itemArrObj[i].key]) {
            checkRules = itemArrObj[i].key;
            errTip = itemArrObj[i].tip
            break;
          }
        }

      } else if (key == 'education') { //教育背景
        itemArrObj = [{
          key: 'xl',
          tip: '请先选择学历'
        }, {
          key: 'school',
          tip: '请先输入学校名称'
        },  {
          key: 'start',
          tip: '请先选择入学时间'
        }, {
          key: 'end',
          tip: '请选择毕业时间'
        }]
        for (var i = 0; i < itemArrObj.length; i++) {
          if (!tt.educationJl[itemArrObj[i].key]) {
            checkRules = itemArrObj[i].key;
            errTip = itemArrObj[i].tip
            break;
          }
        }
      } else if (key == 'advantage') { //个人优势
        if (tt.advantage == '') {
          checkRules = 'advantage';
          errTip = '请先完善个人优势';
        }
      } else if (key == 'skill') {
        itemArrObj = tt.skillObj.type === 0 || tt.skillObj.type === '语言能力' ? [{
          key: 'lang',
          tip: '请先选择语言'
        }, {
          key: 'level_read',
          tip: '请先选择熟练程度',
        }, {
          key: 'level_speak',
          tip: '请先选择熟练程度',
        }, {
          key: 'certificate',
          tip: '请先填写证书名称',
        }] : [{
          key: 'certificateType',
          tip: '请先填写证书类型',
        }, {
          key: 'time',
          tip: '请先选择获取证书的时间'
        }]
        for (var i = 0; i < itemArrObj.length; i++) {
          if (!tt.skillObj[itemArrObj[i].key]) {
            checkRules = itemArrObj[i].key;
            errTip = itemArrObj[i].tip
            break;
          }
        }
      } else if (key == 'basic') { //基本信息

        itemArrObj = [{
          key: 'photo',
          tip: '请先上传照片'
        }, {
          key: 'name',
          tip: '请先填写姓名'
        }, {
          key: 'identify',
          tip: '请选择身份'
        }, {
          key: 'birth',
          tip: '请选择出生年月'
        }, {
          key: 'sex',
          tip: '请选择性别'
        }, {
          key: 'work_jy',
          tip: '请选择工作经验'
        }, {
          key: 'phone',
          tip: '请填写手机号'
        }];

        for (var i = 0; i < itemArrObj.length; i++) {
          if (itemArrObj[i].key == 'sex') {
            tt.basic[itemArrObj[i].key] = tt.basic[itemArrObj[i].key] ? tt.basic[itemArrObj[i].key] : 0;
          } else if (itemArrObj[i].key == 'work_jy') {
            console.log(itemArrObj[i],tt.basic.work_jy)
            // tt.basic.work_jy = tt.basic.work_jy ? tt.basic.work_jy : tt.baseConfig.experience[0].id;
          }
          if ((tt.basic[itemArrObj[i].key] === '' && itemArrObj[i].key != 'sex') || (itemArrObj[i].key == 'sex' && (tt.basic[itemArrObj[i].key] !== 0 && tt.basic[itemArrObj[i].key] !== 1))) {
            checkRules = itemArrObj[i].key;
            errTip = itemArrObj[i].tip
            break;
          }
        }
      } else if (key == 'intention') {
        itemArrObj = [{
          key: 'type',
          tip: '请先选择期望行业'
        }, {
          key: 'job',
          tip: '请先选择意向职位'
        }, {
          key: 'nature',
          tip: '请选择工作性质'
        }, {
          key: 'addr',
          tip: '请选择工作地点'
        }, {
          key: 'min_salary',
          tip: '请选择期望薪资'
        }, {
          key: 'max_salary',
          tip: '请选择期望薪资'
        }, {
          key: 'workState',
          tip: '请先选择求职状态'
        }, {
          key: 'startWork',
          tip: '请先选择到岗时间'
        }]
        for (var i = 0; i < itemArrObj.length; i++) {
          if (!tt.intention[itemArrObj[i].key] || ((itemArrObj[i].key == 'type' || itemArrObj[i].key == 'job') && itemArrObj[i].key.length == 0)) {
            checkRules = itemArrObj[i].key;
            errTip = itemArrObj[i].tip
            break;
          }
        }
      }
      if (checkRules) {
        showErrAlert(errTip)
      }
      return checkRules ? false : true;
    },

    editReusmetit (){
      const tt = this;
      tt.resumeSetting = true; 
      tt.newResume = 0; 
      tt.resumeInfo.title = tt.currResume.alias
      tt.resumeInfo.id = tt.currResume.id
    },


    // 创建新简历
    createResume() {
      var tt = this;
      if (tt.resumeInfo.title == '') {
        showErrAlert('请输入简历名称');
        return false;
      }

      if (!tt.newResume) { //修改简历名称
        var or_name = tt.currResume.alias;
        tt.currResume.alias = tt.resumeInfo.title;
        tt.submit('alias', function (data) {
          if (data.state != 100) {
            tt.currResume.alias = or_name;
          }
        });
        return false;
      }

      $.ajax({
        url: '/include/ajax.php?service=job&action=copyNewResume&name=' + tt.resumeInfo.title + '&columns=' + tt.copyInfoArr.join(',') + '&cityid=' + cityid,
        type: "POST",
        dataType: "json",
        success: function (data) {
          if (data.state == 100) {
            tt.getResumeList(data.aid);
          }
        },
        error: function () {

        }
      });

    },



    // 改变工作地址
    changeAddr() {
      var tt = this;
      cityChosePage.showPop = true;
      cityChosePage.endChoseCity = tt.intention.addr_list;
      // cityChosePage.cityLevel = 2; 城市层级
      cityChosePage.currTabShow = tt.intention.addr_list.length - 1;
      cityChosePage.successCallBack = function (data) {
        // 地址选择点击完成之后
        tt.intention.addr_list = data.map(item => {
          return item.id
        })
        tt.intention.addr_list_Name = data.map(item => {
          return item.typename
        })
        tt.intention.addr = tt.intention.addr_list[tt.intention.addr_list.length - 1];
        console.log(tt.intention.addr_list)
      };
    },


    // 设置默认简历
    setDefaultResume(resume) {
      var tt = this;

      if(resume.state == 0 || resume.state == 2 || !tt.complete){
        var setOptions = {
          btnSure: '好的',
          btnColor: '#256CFA',
          title: tt.complete ? ((resume.state == 0 ? '简历审核中' : '简历审核不通过') + '，不可设为默认') : '简历未完善，不可设为默认',
          confirmTip: !tt.complete ? '未完善简历不可用于投递，请先填写完整' : ((resume.state == 0 ? '审核中简历暂不可用于投递' : '未通过审核的简历暂不可用于投递') ),
          isShow: true,
          noCancel:true,
          popClass: 'setConfirmPop'
  
        };
        confirmPop(setOptions, function () {
          
        })

        return false;
      }




      $.ajax({
        url: '/include/ajax.php?service=job&action=setDefaultResume&id=' + resume.id,
        type: "POST",
        dataType: "json",
        success: function (data) {
          if (data.state == 100) {
            showErrAlert('设置成功！')
            tt.getResumeList(resume.id);
          }
        },
        error: function () {

        }
      });
    },


    // 点击返回按钮
    pageBack() {
      var tt = this;
      if ((tt.resumeList.length == 0 || tt.currResume.default == 1) && tt.complete === 0) {
        var options = {
          btnSure: '继续填写',
          btnColor: '#196DF3',
          title: '简历未填写完整，无法用于投递哦',
          btnCancel: '仍然退出',
          isShow: true,
          popClass: 'delConfirmPop'

        };
        confirmPop(options, function () {
        }, function () {
          
           //APP端后退、目前只有安卓端有此功能
          var deviceUserAgent = navigator.userAgent;
          if (deviceUserAgent.indexOf('huoniao') > -1) {
            setupWebViewJavascriptBridge(function (bridge) {
              bridge.callHandler("goBack", {}, function (responseData) { });
            })

          }else if(window.wx_miniprogram_judge){
            // 在小程序中
            wx.miniProgram.navigateBack(-1); //返回上一页
          }else{
            window.history.go(-1);
          }
        })
      } else {
        var deviceUserAgent = navigator.userAgent;
        if (deviceUserAgent.indexOf('huoniao') > -1) {
          setupWebViewJavascriptBridge(function (bridge) {
            bridge.callHandler("goBack", {}, function (responseData) { });
          })

        }else if(window.wx_miniprogram_judge){
          // 在小程序中
          wx.miniProgram.navigateBack(-1); //返回上一页
        }else{
          window.history.go(-1);
        }

      }
    },

    // 其他页面直接进入
    pageBackParam() {
      var tt = this;
      if (tt.directInpage == tt.pageShow) {

        if (tt.pageShow == 9 || (tt.resumeList.length >= 1 && tt.complete >= 1)) {
          var deviceUserAgent = navigator.userAgent;
          if (deviceUserAgent.indexOf('huoniao') > -1) {
            setupWebViewJavascriptBridge(function (bridge) {
              bridge.callHandler("goBack", {}, function (responseData) { });
            })

          }else if(window.wx_miniprogram_judge){
            // 在小程序中
            wx.miniProgram.navigateBack(-1); //返回上一页
          }else{
            window.history.go(-1);
          }
        } else {
          var options = {
            btnSure: '继续填写',
            btnColor: '#196DF3',
            title: '简历未填写完整，无法用于投递哦',
            btnCancel: '仍然退出',
            isShow: true,
            popClass: 'delConfirmPop'

          };
          confirmPop(options, function () {
            console.log('继续填写')
          }, function () {
            window.history.go(-1);
          })
        }
      } else {
        setTimeout(() => {
          tt.pageShow = 1;
        }, 500);
      }
    },

    // 更新简历
    updateResume(name, state) {
      var tt = this;
      tt.joinStatePop = false;
      // var param = [];
      // param.push('columns=' + name);
      // param.push('id=' + tt.reseumeDetail.id);
      // param.push(name + '=' + state.id);
      // tt.updateResumeConfirm(param); //提交数据
      if(tt.currResume.identify == 2 || tt.basic.identify ==2){
        tt.basic.workState = state.id
        tt.basic.workState_name = state.title
      }else{

        tt.intention.workState = state.id
        tt.intention.workState_name = state.title
      }

    },

    // 升级简历 == 刷新简历
    uplevelResume(){
      var tt = this;
      intention_pop.refreshPopShow = true;
    },


    // 获取url参数
    getUrlParam(name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
      var reg_rewrite = new RegExp("(^|/)" + name + "/([^/]*)(/|$)", "i");
      var r = window.location.search.substr(1).match(reg);
      var q = window.location.pathname.substr(1).match(reg_rewrite);
      if (r != null) {
        return unescape(r[2]);
      } else if (q != null) {
        return unescape(q[2]);
      } else {
        return null;
      }
    },


  },


  watch: {
    
    pageShow: function (val) {
      var tt = this;
      if(tt.currResume && tt["currResume.id"] && !tt.currResume.name && val !== 2 && val !== 1){
        tt.pageShow = 2;
      }

      if (val === 1) {
        tt.edit_page = '';
      }

      if (val == 8) {
        if (tt.newResume) {
          tt.resumeInfo = {
            id: 0,
            title: '简历' + (tt.resumeList.length + 1),
          }
        } else {
          tt.resumeInfo = {
            id: tt.currResume.id,
            title: tt.currResume.alias,
          }
        }
      }

      


      tt.$nextTick(function(){
        tt.initData()
        // 初始化滚轮选择器
        tt.initChoose();
        if(!tt.baseConfig){
          tt.getBaseConfig()
        }
        tt.getYearData();
        // 当url携带参数，更改时需要去除参数
        // history.replaceState('', "", "job-resume.html");
      })


    },

    // 显示的工作开始时间
    startDate: function (val) {
      var tt = this;
      var picker = tt.$refs.endDatePicker
      var indexArr = []
      for (i = 0; i < tt.yearArr.length; i++) {
        var val = tt.yearArr[i]
        if (val.title == tt.endDate[0]) {
          indexArr.push(i);
          var optIndex = val.children.findIndex(function (opt, ind) {})
          if (optIndex > -1) {
            indexArr.push(optIndex)
          } else {
            indexArr.push(0)
          }
          break;
        }
      }

    },

    // 监听选择器弹窗
    showScrollPop(val) {
      if (!val) {
        this.showScrollType = '';
      }
    },


    // 出生年月
    'basic.birth': function (val) {
      var tt = this;
      var yy = new Date(val * 1000).getFullYear();
      var mm = new Date(val * 1000).getMonth() + 1;
      tt.birthShow = yy + '/' + mm
    },

    //身份切换
    'basic.identify':function(){
      const that = this;
      that.showCard = true;
      setTimeout(() => {
        that.showCard = false;
      }, 5000);
    },

    // 设置tab 距离左边的
    resumeList: function () {
      var tt = this;
      setTimeout(() => {
        $(".page_resume .header-address li").each(function () {
          $(this).attr('data-left', $(this).offset().left - $(".page_resume .header-address").width() / 2 - $(".page_resume .header-l").width());
        })
      }, 100);
    },

    // 获取距离边框的距离 头部
    'currResume.id': function (val) {
      var tt = this;
      var leftOff = 0;
      // 基本信息赋值
      for (var item in tt.basic) {
        tt.basic[item] = tt.currResume[item];
      }

      // 意向工作赋值
      tt.salaryText = tt.currResume.min_salary || tt.currResume.max_salary ? tt.currResume.show_salary + echoCurrency('short') + '/月' : ''; //价格
      for (var item in tt.intention) {
        tt.intention[item] = tt.currResume[item];

      }
      var el = $(".page_resume .header-address li[data-id='" + val + "']");
      if (el.attr('data-left')) {
        leftOff = el.attr('data-left')
      } else {

        leftOff = el.attr('data-left')
      }
      $(".page_resume .header-address").scrollLeft(leftOff);
      tt.checkResumeComplete(tt.currResume)
    },

    // 监听加分项
    'currResume.ad_tag': function (val) {
      var tt = this;
      tt.advantage_define = '';
      if (!tt.baseConfig) {
        var interval = setInterval(function () {
          if(tt.baseConfig){
            var adv_arr = tt.baseConfig.advantage.map(item => {
              return item.typename;
            })
            for (var i = 0; i < val.length; i++) {
              if (!adv_arr.includes(val[i])) {
                tt.advantage_define = val[i];
                break;
              }
            }
            clearInterval(interval)
          }
        }, 1000);
      }else{
        var adv_arr = tt.baseConfig.advantage.map(item => {
          return item.typename;
        })
        for (var i = 0; i < val.length; i++) {
          if (!adv_arr.includes(val[i])) {
            tt.advantage_define = val[i];
            break;
          }
        }
      }
    },

    // input自动聚焦
    advSelfDefine: function (val) {
      var tt = this;
      if (val) {
        setTimeout(function () {
          $("#editInp").focus()
        }, 300)
      }
    },

    // 意向行业
    industryList(val) {
      var tt = this;
      setTimeout(() => {
        tt.currChoseOn = tt.industryList.find(item => {
          if (tt.intention.type_list && tt.intention.type_list.length) {

            return tt.intention.type_list[0][0] == item.id
          }
        })
        tt.showChildPop = true;
      }, 500);
    },

    // 'skillObj.type':function(){
    //   const that = this;
    //   if(typeof(that.edit_page) == 'string'){
    //     that.skillObj.certificate = '';
    //   }     
    // } 

  },
})