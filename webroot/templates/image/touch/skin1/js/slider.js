!function() {
	var mycallback;
	var moveHorizoLock = false;
	var againLock = false;
	function d(b, c) {
		$.extend(this, {
			content: "ul",
			item: "li",
			loop: !0,
			speed: 300,
			duration: 3000,
			autoScroll: !0,
			pagePar:'',
			pageStr:[],
			changedFun : ""
		}, c), b = $(b);
		if(typeof this.changedFun === 'function') {
			mycallback = this.changedFun;
		}
		var i = $(this.content, b),
			j = $(this.item, i);
		if (this.elem = b, this.content = i, this.index = 0, this.length = j.length, j.length <= 1) {
			return this
		}
		b.css({
			overflow: "hidden",
			position: "relative"
		}), i.css({
			position: "relative",
			width: "100%"
		});
		for (var k = 1, l = j.length; l > k; k++) {
			$(j[k]).css({
				position: "absolute",
				width: "100%",
				top: 0,
				left: 100 * k + "%"
			})
		}
		f.call(this, j.length), this.loop && $(j.first().clone()).css({
			position: "absolute",
			width: "100%",
			top: 0,
			left: 100 * j.length + "%"
		}).appendTo(i), this.to(this.active ? this.active : 0), e.call(this), this.autoScroll && this.start()

	}

	function e() {
		var b = this;
		var timeStart,timeEnd;
		this.elem.on("touchstart", function(a) {
			if(againLock) return;
			timeStart = new Date().getTime();
			var g = a.touches[0];
			b._startLocation = {
				x: g.pageX,
				y: g.pageY
			}, b._isStart = !1
		}).on("touchmove", function(a) {
			if(againLock || moveHorizoLock) return;
			if (!(a.touches.length > 1 || a.scale && 1 !== a.scale)) {
				var g = a.touches[0],
					h = g.pageX - b._startLocation.x;
				if (b._isStart || (b._isStart = Math.abs(h) > Math.abs(g.pageY - b._startLocation.y)), b._isStart) {
					a.preventDefault(), clearTimeout(b.timer);
					var i = b.index,
						j = b.elem.width();
					b.loop ? 0 === b.index && h > 0 && (i = b.length) : h /= 0 === b.index && h > 0 || b.index == b.length && 0 > h ? Math.abs(h) / j + 1 : 1, b.content.css({
						"-webkit-transform": "translate3d(-" + b.content.width() * (i - h / j) + "px, 0, 0)"
					}), b._distX = h
				} else {
					moveHorizoLock = true;
				}
			}
		}).on("touchend touchcancel", function(a) {
			moveHorizoLock = false;
			timeEnd = new Date().getTime();
			if(Math.abs(b._distX) < (window.innerWidth * 0.4) && Math.abs(b._distX) / (timeEnd - timeStart) < 0.5) {
				b.nochange();
			} else {
				b._isStart && (b._distX < 0 ? (a.preventDefault(), b.next()) : (a.preventDefault(), b.previous(!0)))
			}
		}), $(window).on("resize", function() {
			b._animating || b.content.css({
				"-webkit-transform": "translate3d(-" + b.index * b.content.width() + "px, 0, 0)"
			})
		})
	}

	function f(g) {
		var b = this;
		var pagesid = 'indicator_' + new Date().getTime();
		var h = '<span class="indicator" id="' + pagesid + '"></span>';
		this.pagePar ? this.elem.closest(this.pagePar.split('&')[0]).find(this.pagePar.split('&')[1]).append(h) : this.elem.append(h);
		for (i = 0; g > i; i++) {
			var o = document.createElement('i');
				o.className = 'indicator-item';
				o.innerText = this.pageStr.length == g ? this.pageStr[i]  :'';
				document.getElementById(pagesid).appendChild(o)
				o.onclick = function(){
					b.index = $(this).index();
					b.to(b.index);
				}
		}
		var j = $(".indicator", this.elem);
		this.indicators = this.pagePar ? this.elem.closest(this.pagePar.split('&')[0]).find('.indicator i') : $("i", j), $(this.indicators[0]).addClass("active")
		// this.indicators = $("i", j), $(this.indicators[0]).addClass("active")
	}
	$.fn.slider = function(a) {
		for (var g = [], h = 0, i = this.length; i > h; h++) {
			g.push(new d(this[h], a))
		}
		return 1 === g.length ? g[0] : g.length > 1 ? g : void 0
	}, d.prototype.to = function(c,s) {
		this.stop();
		var g = this;
		againLock = true;
		this.content.find(this.item).eq(c).addClass('active').siblings().removeClass('active');
		this._animating = !0, this.content.animate({
			"-webkit-transform": "translate3d(-" + c * this.content.width() + "px, 0, 0)"
		}, s === undefined ? this.speed : s,"ease-out", function() {
			againLock = false;
			c === g.length ? (g.content.css({
				"-webkit-transform": "translate3d(0, 0, 0)"
			}), c = 0) : g.content.css({
				"-webkit-transform": "translate3d(-" + c * g.content.width() + "px, 0, 0)"
			}), g._animating = !1, g.index = c, $(g.indicators.removeClass("active")[c]).addClass("active"), g.fn && g.fn()
			if(typeof mycallback === 'function') {
				mycallback(c);
			}
		})
	}, d.prototype.previous = function(c) {
		if (!this.loop && 0 === this.index) {
			return void this.to(this.index)
		}
		var g = this.index - 1;
		0 === this.index && (g = this.length - 1, c || this.content.css({
			"-webkit-transform": "translate3d(-" + this.content.width() * this.length + "px, 0, 0)"
		})), this.to(g), this.autoScroll && this.start()
	}, d.prototype.next = function() {
		return this.loop || this.index !== this.length - 1 ? (this.to(this.index + 1), void(this.autoScroll && this.start())) : void this.to(this.index)
	}, d.prototype.start = function() {
		var b = this;
		this.timer = setTimeout(function() {
			b.next()
		}, this.duration)
	}, d.prototype.stop = function() {
		clearTimeout(this.timer)
	}, d.prototype.nochange = function() {
		return this.to(this.index)
	}


	function browser() {var t; var el = document.createElement('fakeelement'); var transitions = {'transition': 'transitionend', 'OTransition': 'oTransitionEnd', 'MozTransition': 'transitionend', 'WebkitTransition': 'webkitTransitionEnd'}; for (t in transitions) {if (el.style[t] !== undefined) {return transitions[t]; } } }
	var brow = browser();
	brow && this.addEventListener(brow, function() {againLock = false; });
}();
