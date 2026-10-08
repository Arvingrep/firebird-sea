var pageVue = new Vue({
  el: "#page",
  data: {
    showPop: false,
    navList: navList,
    currid: currid,
    hoverid: "",
    onStatus_ind: 'total1',
    statusList: {
     total1:{
        id: "",
        name: "全部",
        count: 0,
      },
      total2:{
        id: 1,
        name: "合作中",
        count: 0,
      },
      total3:{
        id: 2,
        name: "暂停合作",
        count: 0,
      },
    },
    keyword: "",
    page: 1,
    isload: false,
    loadEnd: false,
    list: [],

    showPover: false, //是否显示陪陪窗口
    c_load: false, //是否正在匹配
    c_keyword: "", // 创建分销公司 匹配账号
    c_list: [], // 匹配账号列表
    c_ajax: null, // 匹配账号ajax 便于abort
    fxConfig: {},
  },
  mounted() {
    const that = this;
    that.getAllCount()
    that.getList();
    that.getConfig()
    $("body").delegate(".linkbtn ", "click", function () {
      that.copyToClipboard("1111");
    });

    // showErrAlert('成功','success')
  },
  methods: {
    // 显示切换账户
    show_change: function () {
      $(".change_account").show();
    },

    // 隐藏切换账户
    hide_change: function () {
      $(".change_account").hide();
    },
    // 获取配置信息
    getConfig(){
      const that = this;
       let url = `/include/ajax.php?service=house&action=route&route=marketing/getDistributorSystemConfig&lpid=${loupanid}`;
       $.ajax({
           url: url,
           dataType: "json",
           success: function (data) {
              if(data.state == 100){
                that.fxConfig = data.info.list;
              }
           }
       });
  },

    getList() {
      const that = this;
      if (that.isload) return false;
      that.isload = true;
      let url = `/include/ajax.php?service=house&action=route&route=marketing/distributorCompanyList&lpid=${loupanid}`;
      if (that.page == 1) {
        that.list = [];
      }
      that.showPageInfo()
      $.ajax({
        data: {
          status: that.statusList[that.onStatus_ind].id,
          page: that.page,
          pageSize: pageSize,
          keyword: that.keyword,
        },
        url: url,
        dataType: "json",
        success: (res) => {
            that.isload = false;
            if (res.state == 100) {
                that.list = res.info.list;
                totalCount = res.info.pageInfo.totalCount
                if(that.page == 1){
                    that.showPageInfo()
                }
            }
        },
        error:() =>{
            that.isload = false;
        }
      });
    },

    getAllCount(){
        const that = this;
        let url = `/include/ajax.php?service=house&action=route&route=marketing/distributorCompanyListStatus&lpid=${loupanid}`
        $.ajax({
           
            url: url,
            dataType: "json",
            success: (res) => {
                if(res.state == 100){
                    for(let item in res.info){
                        that.statusList[item]['count'] = res.info[item]
                    }
                }
            },
            
          });
    },

    reGetList() {
      const that = this;
      that.isload = false;
      that.page = 1;
      that.getList();
    },

    keyChange(e) {
      const that = this;

      that.showPover = (e && true) || false;
      if (that.c_load && that.c_ajax) {
        //放弃之前的请求
        that.c_ajax.abort();
        that.c_ajax = null;
      }
      that.c_load = true;
      let url = `/include/ajax.php?service=house&action=route&route=marketing/searchDistributor&keyword=${e}`;
      that.c_ajax = $.ajax({
        url: url,
        dataType: "json",
        success: (data) => {
          that.c_load = false;
          that.c_ajax = null;
          that.c_list = [];
          if (data.state == 100 && data.info.list.length > 0) {
            let list = data.info.list;
            that.c_list = list;
          } else {
            // let list = [{
            //     id:1,
            //     name:'上海瑞家信息技术有限公司',
            //     phone:'13888888888',
            //     logo:'',
            // }]
            // that.c_list = list;
          }
        },
        error: (jqXHR, textStatus, errorThrown) => {
          console.log(textStatus);
          that.c_load = false;
        },
      });
    },
    // 分页
    showPageInfo: function () {
        var tt = this;
        var info = $(".pagination");
        var nowPageNum = tt.page;
        var allPageNum = Math.ceil(totalCount / pageSize);
        var pageArr = [];
        info.html("").hide();
        var pages = document.createElement("div");
        pages.className = "pagination-pages";
        info.append(pages);
        //拼接所有分页
        if (allPageNum > 1) {
            //上一页
            if (nowPageNum > 1) {
                var prev = document.createElement("a");
                prev.className = "prev";
                prev.innerHTML = '上一页'; //上一页langData["siteConfig"][6][33]
                prev.onclick = function () {
                    tt.page = nowPageNum - 1;
                    tt.getList();
                };
                info.find(".pagination-pages").append(prev);
            }

            //分页列表
            if (allPageNum - 2 < 1) {
                for (var i = 1; i <= allPageNum; i++) {
                    if (nowPageNum == i) {
                        var page = document.createElement("span");
                        page.className = "curr";
                        page.innerHTML = i;
                    } else {
                        var page = document.createElement("a");
                        page.innerHTML = i;
                        page.onclick = function () {
                            tt.page = Number($(this).text());
                            tt.getList();
                        };
                    }
                    info.find(".pagination-pages").append(page);
                }
            } else {
                for (var i = 1; i <= 2; i++) {
                    if (nowPageNum == i) {
                        var page = document.createElement("span");
                        page.className = "curr";
                        page.innerHTML = i;
                    } else {
                        var page = document.createElement("a");
                        page.innerHTML = i;
                        page.onclick = function () {
                            tt.page = Number($(this).text());
                            tt.getList();
                        };
                    }
                    info.find(".pagination-pages").append(page);
                }
                var addNum = nowPageNum - 4;
                if (addNum > 0) {
                    var em = document.createElement("span");
                    em.className = "interim";
                    em.innerHTML = "...";
                    info.find(".pagination-pages").append(em);
                }
                for (var i = nowPageNum - 1; i <= nowPageNum + 1; i++) {
                    if (i > allPageNum) {
                        break;
                    } else {
                        if (i <= 2) {
                            continue;
                        } else {
                            if (nowPageNum == i) {
                                var page = document.createElement("span");
                                page.className = "curr";
                                page.innerHTML = i;
                            } else {
                                var page = document.createElement("a");
                                page.innerHTML = i;
                                page.onclick = function () {
                                    tt.page = Number($(this).text());
                                    tt.getList();
                                };
                            }
                            info.find(".pagination-pages").append(page);
                        }
                    }
                }
                var addNum = nowPageNum + 2;
                if (addNum < allPageNum - 1) {
                    var em = document.createElement("span");
                    em.className = "interim";
                    em.innerHTML = "...";
                    info.find(".pagination-pages").append(em);
                }
                for (var i = allPageNum - 1; i <= allPageNum; i++) {
                    if (i <= nowPageNum + 1) {
                        continue;
                    } else {
                        var page = document.createElement("a");
                        page.innerHTML = i;
                        page.onclick = function () {
                        tt.page = Number($(this).text());
                        tt.getList();
                        };
                        info.find(".pagination-pages").append(page);
                    }
                }
            }

            //下一页
            if (nowPageNum < allPageNum) {
                var next = document.createElement("a");
                next.className = "next";
                next.innerHTML = '下一页'; //下一页langData["siteConfig"][6][34]
                next.onclick = function () {
                    tt.page = nowPageNum + 1;
                    tt.getList();
                };
                info.find(".pagination-pages").append(next);
            }

            info.show();
        } else {
            info.hide();
        }
    },

    // 确认选中
    handleSelect(item) {
      const  that = this;
      let url = `/include/ajax.php?service=house&action=route&route=marketing/createDistributor&lpid=${loupanid}`;
      $.ajax({
          url: url,
          data: {dcoid:item.id},
          type: "POST",
          dataType: "json",
          success: function(data){
              if(data.state == 100 ){
                  that.$message({
                      message: '创建成功',
                      type: 'success'
                  })
                  setTimeout(function(){
                      location.reload()
                  },1000)
              }else{
                  that.$message({
                      message: data.info,
                      type: 'error'
                  })

              }
          }
      })
    },

    copyToClipboard() {
      const range = document.createRange();
      range.selectNode(document.getElementById("copyInner"));
      const selection = window.getSelection();
      if (selection.rangeCount > 0) selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand("copy");
    },


    // 创建分销公司
    newBranch(){
      const that = this;
      console.log('newBranch');
      that.showPop = true;
    },

    linkTo(url,redirect){
      if(redirect){
        window.open(url)
      }else{
        window.location.href = url
      }
    },
    
    // 修改密码链接
    changePsd() {
      this.$confirm(
        `<div class="con">
                    <h6>分销公司如遇密码问题无法登录，可使用账号手机号等找回密码<br> 请复制链接给其负责人：</h6>
                    <div class="disflex a-c">
                        <div class="linkbox">重置密码：<span id="copyInner">${memberDomain}/security-chpassword.html</span></div>
                        <div class="linkbtn disflex a-c j-c">复制链接</div>
                    </div>
                </div>`,
        "确认删除分销公司",
        {
          customClass: "confirmInp-dialog",
          dangerouslyUseHTMLString: true,
          showCancelButton: false,
          showConfirmButton: false,
        }
      )
        .then(() => {
          this.$message({
            type: "success",
            message: "删除成功!",
          });
        })
        .catch(() => {
          console.log("取消了");
        });
    },
  },
});

/**
 * this.$confirm的配置说明
 * confirm_del_btn => 按钮是红色  默认蓝色
 * 
 *  this.$confirm(
        "确定删除 苏州房有家房地产经纪有限公司？<br><span style='color:#FF3419;'>删除后公司信息、对应分销分案不可恢复；历史报备客户记录仍留存</span>",
        "确认删除分销公司",
        {
            customClass:"confirm-dialog",
            dangerouslyUseHTMLString: true,
            confirmButtonText: "确认删除",
            cancelButtonText: "取消",
            confirmButtonClass:'confirm_del_btn'
        })
        .then(() => {
            this.$message({
                type: "success",
                message: "删除成功!",
            });
        })
        .catch(() => {
            console.log("取消了");
        });

 * **/