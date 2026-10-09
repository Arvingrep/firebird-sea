var print_page = new Vue({
    el: '#printPage',
    data: {
        resumeDetail: '',
    },
    mounted() {
    },
    computed: {
        salaryChange() {
            return function (item) {
                if (!item) return false;
                var minS = item.min_salary,
                    maxS = item.max_salary;
                var text = minS + ' - ' + maxS
                if (item.min_salary > 10000 || item.max_salary > 10000) {
                    minS = parseFloat((item.min_salary / 1000).toFixed(2));
                    maxS = parseFloat((item.max_salary / 1000).toFixed(2));
                    text = minS + ' - ' + maxS + 'k'
                }
                return text;
            }
        },
        jobNameChange() {
            return function (arr) {
                return arr.join('、')
            }
        }
    },

})
var page = new Vue({
    el: '#page',
    data: {
        education: [{
            "xl": "博士",
            "start": "2013-9-9",
            "end": "2016-3-3",
            "school": "北京大学",
            "zy": "计算机科学与技术"
        }, {
            "xl": "硕士",
            "start": "2010-9-9",
            "end": "2013-3-3",
            "school": "北京大学",
            "zy": "计算机科学与技术"
        }, {
            "xl": "学士",
            "start": "2006-9-9",
            "end": "2010-3-3",
            "school": "北京大学",
            "zy": "计算机科学与技术"
        }],
        work_jl: [{
            company: "泛微网络",
            content: "1、熟悉lmnp环境开发，熟悉服务器配置<br>2、根据客户需求对产品进行组织和规划<br>3、主要负责后端php开发，完成过公众号、小程序、websocket聊天、app的开发",
            department: "技术部",
            work_end: "至今",
            work_start: "2019-6-6",
            work_time_count: "3年4个月",
        }, {
            company: "泛微网络",
            content: "1、熟悉lmnp环境开发，熟悉服务器配置<br>2、根据客户需求对产品进行组织和规划<br>3、主要负责后端php开发，完成过公众号、小程序、websocket聊天、app的开发",
            department: "技术部",
            work_end: "至今",
            work_start: "2019-6-6",
            work_time_count: "3年4个月",
        }],
        resumeDetail: '',
    },
    mounted() {
        var tt = this;

        tt.getResumeDetail();
    },
    computed: {
        salaryChange() {
            return function (item) {
                if (!item) return false;
                var minS = item.min_salary,
                    maxS = item.max_salary;
                var text = minS + ' - ' + maxS
                if (item.min_salary > 10000 || item.max_salary > 10000) {
                    minS = parseFloat((item.min_salary / 1000).toFixed(2));
                    maxS = parseFloat((item.max_salary / 1000).toFixed(2));
                    text = minS + ' - ' + maxS + 'k'
                }
                return text;
            }
        },
        jobNameChange() {
            return function (arr) {
                return arr.join('、')
            }
        }
    },
    methods: {
        getResumeDetail() {

            var tt = this;
            axios({
                method: 'post',
                url: '/include/ajax.php?service=job&action=resumeDetail&id=' + id,
            })
                .then((response) => {
                    var data = response.data;
                    if (data.state == 100) {
                        let url = location.search;
                        let params = new URLSearchParams(url.slice(1));
                        tt.resumeDetail = data.info;
                        if (!params.get('preview')) {
                            mapPop.downResumeDetail = data.info;
                            if (data.info.work_jl) {
                                for (let i = 0; i < data.info.work_jl.length; i++) {
                                    let text = data.info.work_jl[i].content.replaceAll('\r\n', '<br>');
                                    $('.cle-exp ul li').eq(i).find('.job div').eq(1).html(text); //工作内容文本容置换换行符
                                }
                            }
                        }
                        print_page.resumeDetail = data.info
                    }
                });
        },
        printFn() {
            window.print();
        },
        saveFn() {
            if (!userid) { //未登录
                location.href = `${masterDomain}/login.html`;
                return
            };
        }
    }
})