/**
 * @ProjectName flutter-hearts-zmt
 * @Version 0.0.0
 * @Author Jiangshilong(https://github.com/JSL8023)
 * @Update 2018-03-22 17:24 pm 
 */
! function(t, e) {
	"object" == typeof exports && "undefined" != typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : t.BubbleHearts = e()
}(this, function() {
	"use strict";

	function t(t, n, r) {
		var i = e.uniformDiscrete(80, 91) / 100,   //89, 91
			o = 1 - i,
			u = (e.uniformDiscrete(15, 60) + e.uniformDiscrete(45, 60)) / 100,
			a = function(t) {
				return t > i ? Math.max(((1 - t) / o).toFixed(2), .1) * u : u
			},
			c = e.uniformDiscrete(-30, 30),
			f = function(t) {
				return c
			},
			h = 10,
			s = n.width / 2 + e.uniformDiscrete(-h, h),
			d = (n.width - Math.sqrt(Math.pow(t.width, 2) + Math.pow(t.height, 2))) / 2 - h,
			l = e.uniformDiscrete(.8 * d, d) * (e.uniformDiscrete(0, 1) ? 1 : -1),
			m = e.uniformDiscrete(300, 450),
			w = function(t) {
				return t > i ? s : s + l * Math.sin(m * (i - t) * Math.PI / 180)
			},
			v = function(e) {
				return t.height / 2 + (n.height - t.height / 2) * e
			},
			p = e.uniformDiscrete(14, 18) / 100,
			g = function(t) {
				return t > p ? 1 : 1 - ((p - t) / p).toFixed(2)
			};
		return function(e) {
			if(!(e >= 0)) return !0;
			r.save();
			var n = a(e),
				i = f(e),
				o = w(e),
				u = v(e);
			r.translate(o, u), 
			r.scale(n, n),  
			r.globalAlpha = g(e),
			r.drawImage(t, -t.width / 2, -t.height / 2, t.width/2, t.height/2),
			
			r.restore();
		}
	}
	var e = function(t) {
			var e = t,
				n = Math.floor,
				r = Math.random;
			return t.uniform = function(t, e) {
				return t + (e - t) * r()
			}, t.uniformDiscrete = function(t, r) {
				return t + n((r - t + 1) * e.uniform(0, 1))
			}, t
		}({}),
		n = function(t, e) {
			if(!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
		},
		r = function() {
			function t(t, e) {
				for(var n = 0; n < e.length; n++) {
					var r = e[n];
					r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(t, r.key, r)
				}
			}
			return function(e, n, r) {
				return n && t(e.prototype, n), r && t(e, r), e
			}
		}(),
		i = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function(t) {
			return setTimeout(t, 10)
		},
		o = function() {
			function o() {
				n(this, o);
				var t = this.canvas = document.createElement("canvas"),
					e = this.context = t.getContext("2d"),
					r = this._children = [],
					u = function n() {
						i(n), e.clearRect(0, 0, t.width, t.height);
						for(var o = 0, u = r.length; o < u;) {
							var a = r[o];
							a.render.call(null, (a.timestamp + a.duration - new Date) / a.duration) ? (r.splice(o, 1), u--) : o++
						}
					};
				i(u)
			}
			return r(o, [{
				key: "bubble",
				value: function(n) {
					var r = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : e.uniformDiscrete(1600, 2800),
						i = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : t(n, this.canvas, this.context);
					return this._children.push({
						render: i,
						duration: r,
						timestamp: +new Date
					}), this
				}
			}]), o
		}();
	return o
});
// // 图片地址在此处更换  可换成你的图片
// var assets = [
// 	templets_skin+'images/kanjia/6.png',
// 	templets_skin+'images/kanjia/7.png',
// 	templets_skin+'images/kanjia/8.png',
// ];
// assets.forEach(function(src, index) {
// 	assets[index] = new Promise(function(resolve) {
// 		var img = new Image;
// 		img.onload = resolve.bind(null, img);
// 		img.src = src;
// 	});
// });

// Promise.all(assets).then(function(images) {

// 	var random = {
// 		uniform: function(min, max) {
// 			return min + (max - min) * Math.random();
// 		},
// 		uniformDiscrete: function(i, j) {
// 			return i + Math.floor((j - i + 1) * random.uniform(0, 1));
// 		},
// 	};
	
	
// 	// var allleftImg = document.getElementsByClassName('leftImg');
// 	// var bubbleArr = [];
// 	// for(var m = 0;m<allleftImg.length;m++ ){

// 	// 	var stage = new BubbleHearts();
// 	// 	var canvas = stage.canvas;
// 	// 	canvas.width = 100;
// 	// 	canvas.height = 130;
// 	// 	canvas.style['width'] = '1rem';
// 	// 	canvas.style['height'] = '1.3rem';
// 	// 	allleftImg[m].appendChild(canvas);

// 	// 	bubbleArr.push(stage);         
// 	// }
// 	// //随机飘动
// 	// setInterval(function(){
// 	// 	for(var n = 0;n<bubbleArr.length;n++ ){
// 	//  		bubbleArr[n].bubble(images[random.uniformDiscrete(0, images.length - 1)]);
// 	//  	}
//  // 	},300)


// });