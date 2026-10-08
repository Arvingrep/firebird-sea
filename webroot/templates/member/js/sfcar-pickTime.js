var pickuptime = {
  init: function (a, top, left, tflag, nowflag, _t, b) {
    this.setuptime = a;
    this.settop = top;
    this.setleft = left;
    this.nowflag = nowflag;
    this._t = _t;
    if (tflag == 1) {
      this.run(b)
    } else {
      $("#pickuptimeContener").remove();
    }
  },
  marketgetTime: function () {
    var k = this.setuptime;
    var g = new Date();
    g.setDate(g.getDate() + k);
    var h = g.getDay();
    var l = g.getHours();
    var min = g.getMinutes();
    var f = parseInt(h);
    var d = "";
    var a = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    var e = new Array();
    var b, j;
    for (var c = k; c < 3 + k; c++) {
      if (f == 7) {
        f = 0
      }
      if (c == 0) {
        b = g.getMonth() + 1;
        j = g.getDate();
        e.push(b + "月" + j + "日 " + a[f] + " (今天)")
      } else {
        if (c == 1) {
          g.setDate(g.getDate() + 1);
          b = g.getMonth() + 1;
          j = g.getDate();
          e.push(b + "月" + j + "日 " + a[f] + " (明天)")
        } else {
          if (c == 2) {
            g.setDate(g.getDate() + 1);
            b = g.getMonth() + 1;
            j = g.getDate();
            e.push(b + "月" + j + "日 " + a[f] + " (后天)")
          } else {
            g.setDate(g.getDate() + 1);
            b = g.getMonth() + 1;
            j = g.getDate();
            e.push(b + "月" + j + "日 " + a[f])
          }
        }
      }
      f++;
      j++
    }
    e.push(l, min);
    return e
  },
  todoble: function (a) {
    a = a < 10 ? "0" + a : a;
    return a
  },
  run: function (f) {
    var c = this.marketgetTime();
    var a = "";
    var min = '';
    for (var b = 0; b < 24; b++) {
      if (b < c[3]) {
        a += "<li data-on='0' class='pickuptime pichours pickuptime-sp hide'>" + this.todoble(b) + "时</li>"
      } else {
        if (b == Number(c[3])) {
          a += "<li data-on='2' class='pickuptime pichours pickuptime-on'>" + this.todoble(b) + "时</li>"
        } else {
          a += "<li data-on='1' class='pickuptime pichours'>" + this.todoble(b) + "时</li>"
        }
      }
    }
    for (var b = 0; b < 12; b++) {
      if (5 * b <= c[4]) {
        min += "<li class='pickuptime picmin pickupmin-sp hide'>" + this.todoble(5 * b) + "分</li>"
      } else {
        if (b == Number(c[4]) + 1) {
          min += "<li class='pickuptime picmin pickuptime-on'>" + this.todoble(5 * b) + "分</li>"
        } else {
          min += "<li class='pickuptime picmin'>" + this.todoble(5 * b) + "分</li>"
        }
      }
    }
    var e = "<div id='pickuptimeContener' style='top:" + this.settop + "px;left:" + this.setleft + "px;bottom:auto;width:193px;height:165px;background:transparent;padding-bottom:20px;'><div class='pickuptime-close-empty' style='position: fixed;top:0;left:0;width:100%;height:100%;'></div><div id='pickuptime' style='position:absolute;bottom:0;'><p class='pickuptime-title' style='display:none;'>请选择取货时间</p><div class='pickuptime-box'><div class='pickuptime-data hide'><p class='pickuptime-datap pickuptime-data-on'>" + c[0] + "</p><p class='pickuptime-datap'>" + c[1] + "</p><p class='pickuptime-datap'>" + c[2] + "</p></div>";
    e += "<ul style='width:50%'>" + a + "</ul><ul style='width:50%'>" + min + "</ul></div><div class='pickuptime-close' style='display:none;'>关闭</div></div>";
    if ($("#pickuptimeContener").length > 0) {
      $("#pickuptimeContener").remove()
    }
    $("body").append(e);
    var _ta = this._t;
    $(".pickuptime-close-empty,.pickuptime-close").on("click", function () {
 
      $(_ta).removeClass('on');
      $('html').removeClass('noscroll');
      $("#pickuptimeContener").remove()
    });

    if (this.nowflag == 0) { // 是当前日期
      $(".pickuptime-sp").hide()
      $(".pickupmin-sp").hide()
    } else {
      $(".pickuptime-sp").show().attr('data-on','1')
      $(".pickupmin-sp").show()
    }

    $(".pichours").on("click", function () {
      var g = $(this).attr('data-on');
      if (g == 1) {
        $(".pickupmin-sp").show()
      } else {
        $(".pickupmin-sp").hide()
      }
      $(this).addClass("pickuptime-on").siblings().removeClass("pickuptime-on")
    });

    $(".picmin").on("click", function () {
      $(this).addClass("pickuptime-on").siblings().removeClass("pickuptime-on");
      var g = $(".pickuptime-on").text();
      $(".pickuptime-close-empty").click();
      if (Object.prototype.toString.call(f) === "[object Function]") {
        f(g)
      } else {
        return false
      }
    })
  }
};