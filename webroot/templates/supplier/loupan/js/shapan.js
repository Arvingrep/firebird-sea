// {"name": "22222", "state": "1", "floor": "12", "hushu": "212", "tishu": "2121", "price": "3", "began": "", "end": "", "coorx": "816", "coory": "604"},{"name": "1111", "state": "1", "floor": "sad", "hushu": "sadas", "tishu": "sadas", "price": "asda", "began": "1899-12-31", "end": "", "coorx": "", "coory": ""}
var page = new Vue({
    el: "#page",
    data: {
        navList: navList,  //左侧导航
        currid: currid, //左侧导航当前高亮
        hoverid: '',
        loading: false, //加载中
        litpic: litpic,
        dataList: dataList,
        currChosed: 0,//沙盘当前选择楼栋
        apartmentArr: apartmentList,//户型数据
    },
    mounted() {
        var tt = this;
        var num = 1, item = [], html = [], dzshapan = "#dzshapan", dzObj = $(dzshapan);
        //沙盘图拖动
        var shapanImg = $("#shapan-box");
        shapanImg.jqDrag({
            dragParent: dzshapan,
            dragHandle: "#shapan-obj"
        });
        //开盘、交房时间
        $(".began, .end").datetimepicker({ format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch' });

        $(".filePicker input[type='file']").change(function () {
            $('.listSection .li-rm').click();
        })

        $(".chosen-select").chosen();


        $('body').on('change', 'input[name="end"],input[name="began"]', function () {
            var t = $(this), name = t.attr('name');
            var form = t.closest('.form'), id = form.attr('data-id');
            tt.dataList[id][name] = t.val();
        })

        $('body').on('change', 'select[name="apartment"]', function () {
            var t = $(this), name = 'apartment';
            var form = t.closest('.form'), id = form.attr('data-id');
            tt.dataList[id][name] = t.val();
        })
    },
    methods: {
        // 显示切换账户
        show_change: function () {
            $(".change_account").show()
        },

        // 隐藏切换账户
        hide_change: function () {
            $(".change_account").hide()
        },
        // 删除图片
        delimg: function () {
            var el = event.currentTarget
            var par = $(el).parents(".listImgBox");
            par.find('.listSection .li-rm').click();
            $(".filePicker label").click()
            // $('#dzshapan .li-rm').hide();
            // $('#dzshapan #shapan-obj').html('');


        },

        // 删除楼栋
        del_lou: function (i) {
            var tt = this;
            tt.dataList.splice(i, 1);
            tt.currChosed = 0;
        },

        // 新增楼栋
        addHouse: function () {
            var tt = this;
            var startTop = parseInt($('#shapan-box').css('top'));
            var startLeft = parseInt($('#shapan-box').css('left'));
            startTop = startTop > 0 ? 70 : 70 - startTop;
            startLeft = startLeft > 0 ? 50 : 50 - startLeft;
            tt.dataList.push(
                { "name": "", "state": "1", "floor": "", "hushu": "", "tishu": "", "price": "", "began": "", "end": "", "coorx": startLeft, "coory": startTop, "apartment": "" })
            tt.currChosed = tt.dataList.length - 1;

            setTimeout(function () {
                $(".chosen-select").chosen();
            }, 100);

        },
        show_tip: function (type) {
            if (type) {
                $(".pop_tip").show()
            } else if (type == 0) {
                $(".pop_tip").hide()
            }
        },
        // 拖拽
        drag: function (i) {
            var tt = this, el = event.currentTarget;
            $(el).drag("start", function (ev, dd) {
                dd.limit = $("#shapan-box").position();

                dd.limit.bottom = dd.limit.top + $("#shapan-box").outerHeight() - $(this).outerHeight();
                dd.limit.right = dd.limit.left + $("#shapan-box").outerWidth() - $(this).outerWidth();
                console.log(dd.limit, $("#shapan-box").offset())
            }).drag(function (ev, dd) {
                pos = $("#shapan-box").position();
                pos_ = $("#shapan-box").offset();
                var top = parseInt(Math.min(dd.limit.bottom, Math.max(dd.limit.top, dd.offsetY - pos_.top + pos.top)) - pos.top),
                    left = parseInt(Math.min(dd.limit.right, Math.max(dd.limit.left, dd.offsetX - pos_.left + pos.left)) - pos.left);
                $(this).css({
                    top: top,
                    left: left
                });

                var t = $(this), idStr = t.attr('id'), id = idStr.substr(4);
                $('#sandtxt' + id).find('.topVal').val(top);
                $('#sandtxt' + id).find('.leftVal').val(left);
                tt.dataList[i].coorx = left;
                tt.dataList[i].coory = top;
            });
        },

        // 修改时间
        changeTime() {
            var el = event.currentTarget;
        },

        // 提交数据
        submit: function () {
            var tt = this;
            let param = new URLSearchParams();  //提交的数据

            param.append('litpic', $("#shapan-obj img").attr('data-val'));
            param.append('dopost', 'add');

            var dataList = tt.dataList;
            dataList.forEach(function (item, index) {
                dataList[index]['apartment'] = item['apartment'] ? item['apartment'].join(',') : '';
            })

            param.append('data', JSON.stringify(dataList));

            axios({
                method: 'post',
                url: '/include/ajax.php?service=house&action=loupanShapanAdd&loupanid=' + loupanid,
                data: param
            })
                .then((response) => {
                    var data = response.data;
                    tt.loading = false;
                    alert(data.info)
                    if (data.state == 100) {
                        location.reload();
                    } else {

                    }
                });
        },
    },
    watch: {
        dataList: function () {
            var tt = this;
            //开盘、交房时间
            setTimeout(function () {
                $(".began, .end").datetimepicker({ format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch' });
            }, 300)
        }
    }
})
