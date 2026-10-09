
; (function ($) {
	$.fn.getAjax = function (options) {
		var timer = null; //定时器
		var setTime = true; //控制事件触发
		var defaults = {
			page: 1,
			pageSize: 3
		}
		var settings = $.extend({}, defaults, options);
		var container = $(settings.container)
		var page = settings.page;
		var flag = false;
		var keywords = window.keywords ? window.keywords : '';
		function getDatas(settings, page) {
			var time = new Date().getTime();
			flag = true;

			var url = '';
			if (settings.typeid) {
				url = masterDomain+'/include/ajax.php?service=article&action=alist&typeid=' + settings.typeid + '&mold='+mold+'&title='+keywords+'&page=' + page + '&pageSize=' + settings.pageSize + ''
			} else if (settings.title) {
				url = masterDomain+'/include/ajax.php?service=article&action=alist&mold='+mold+'&title='+keywords+'&page=' + page + '&pageSize=' + settings.pageSize + '&title=' + settings.title + ''
			} else {
				url = masterDomain+'/include/ajax.php?service=article&action=alist&mold='+mold+'&title='+keywords+'&page=' + page + '&pageSize=' + settings.pageSize + ''
			}
			$.ajax({
				url: url,
				type: 'GET',
				dataType: 'jsonp',

				success: function (respon) {
					if (respon.state == 100) {
						var datas = respon.info.list;
						// console.log(datas);

						var totalPage = respon.info.pageInfo.totalPage; //总页码

						for (var i = 0; i < datas.length; i++) {

							var da = datas[i].pubdate;
							var tim = dateTimes(da)
							var url=datas[i].url+'#comment'
							var reg = /<strong>|<\/strong>/g;
							var title = datas[i].title.replace(reg, '');
							var tags = [];

							tags.push(datas[i].description);  //tag改为描述
							// var list = [];
							// if(datas[i].keywords){
							// 	var tagslist = datas[i].keywords.split(' ');
							// 	for(var t = 0; t < tagslist.length; t++){
							// 		tags.push('<a href="'+searchPage+encodeURI(tagslist[t])+'" class="tag" target="_blank">'+tagslist[t]+'</a>');
							// 	}
							// }

							if (datas[i].mold == 1 && datas[i].group_img.length >= 3) {
								var imgs=datas[i].group_img;
								var img='';
								for(var l=0;l<imgs.length&&l<3;l++){
									img +="<img class='picture fl' src='"+imgs[l].path+"' alt='"+title+"'>"
								}

									list = `
									  <li class="item-pics">
                      <h3><a href="${datas[i].url}" target="_blank">`+(datas[i].flag.indexOf('r') >= 0 ? `<span class="icon-hots"></span>` : ``)+`${datas[i].title}</a></h3>
                      <a class="pics fn-clear" href="${datas[i].url}" target="_blank">
                        ${img}
                      </a>
                      <div class="binfo fn-clear">
                          <div class="fl"><a href="${datas[i].typeUrl[0]}" class="souce">${datas[i].typeName[0]}</a><span class="time">${tim}</span></div>
                          <div class="tags fl">`+tags.join('')+`</div>
                          <div class="fr">
                              <a href="javascript:;" class="newBtn_share t listBtnShare" data-title="`+title.replace(/(<([^>]+)>)/ig, '')+`" data-url="${datas[i].url}" data-pic="${datas[i].litpic}">分享</a>
                              <a href="${datas[i].url}#comment" class="cmt" target="_blank">${datas[i].common}</a></div>
                      </div>
                  </li>
									`
									$(container).append(list)

								flag = false;

							} else {

								list = `
										<li class="item fn-clear">
											`+(datas[i].litpic != '' ? `<div class="picture"><a href="${datas[i].url}" target="_blank"><img src="${datas[i].litpic}" alt=""></a></div>` : ``)+
											`<div class="detail">
												<h3><a href="${datas[i].url}"  target="_blank">`+(datas[i].flag.indexOf('r') >= 0 ? `<span class="icon-hots"></span>` : ``)+`${datas[i].title}</a></h3>
												<div class="tags">`+tags.join('')+`</div>
												<div class="binfo cf">
													<div class="fl"><a href="${datas[i].typeUrl[0]}" class="souce">${datas[i].typeName[0]}</a><span class="time">${tim}</span></div>
													<div class="fr">
														<a href="javascript:;" class="newBtn_share t listBtnShare" data-title="`+title.replace(/(<([^>]+)>)/ig, '')+`" data-url="${datas[i].url}" data-pic="${datas[i].litpic}">分享</a>
														<a href="${datas[i].url}#comment" class="cmt" target="_blank">${datas[i].common}</a></div>
												</div>
											</div>
										</li>
										`
								$(container).append(list)
								flag = false;

							}

						}
						flag = false;
					}
					if (page == totalPage) {
						$('.loa').text('没有更多数据');
						getDatas = null;
						flag = false;
						return;

					}else{
						$('.loa').text('暂无相关数据');
					}

				},

				error: function () {
					$('.loa').text('数据加载失败，请刷新后重新尝试')
					flag = false;
				}
			})
		}
		getDatas(settings, page);
		$(window).scroll(function () {
			var height = document.documentElement.clientHeight || window.innerHeight;
			var scrollHeight = document.documentElement.scrollTop || document.body.scrollTop;
			var elementHeight = null;

			var viewHeight = parseFloat($(window).height()) + parseFloat($(window).scrollTop());
			if ($(container).children().length >= 1) {
					elementHeight = $(container).children().last().offset().top;

			}
			if (elementHeight - scrollHeight < height && !flag) {

				page++;
				try {
					getDatas(settings, page);
				} catch (erro) {
					getDatas = null;
				}


			}
		});
		function dateTimes(times) {
			var d = new Date(times * 1000);
			var date = (d.getFullYear()) + "-" + (d.getMonth() + 1) + "-" + (d.getDate()) + "-" + (d.getHours()) + ":" + (d.getMinutes()) + ":" + (d.getSeconds());
			var startTime = date;
			var currTime = new Date(); //当前时间
			//将xxxx-xx-xx的时间格式，转换为 xxxx/xx/xx的格式
			startTime = startTime.replace(/\-/g, "/");
			var sTime = new Date(startTime);
			var totalTime = currTime.getTime() - sTime.getTime();
			var days = parseInt(totalTime / parseInt(1000 * 60 * 60 * 24));
			totalTime = totalTime % parseInt(1000 * 60 * 60 * 24);
			var hours = parseInt(totalTime / parseInt(1000 * 60 * 60));
			totalTime = totalTime % parseInt(1000 * 60 * 60);
			var minutes = parseInt(totalTime / parseInt(1000 * 60));
			totalTime = totalTime % parseInt(1000 * 60);
			var seconds = parseInt(totalTime / parseInt(1000));
			var time = "";
			if (days >= 1) {
				time = days + "天";
				if (days > 3) {
					time = d;


					return time = d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日';

				}
			} else if (hours >= 1) {
        time = hours + "小时";
	    } else if (minutes >= 1) {
	        time = minutes + "分钟"
	    } else {
	        time = seconds + "秒";
	    }
	    return time+'前';

		}
	}
})(window.jQuery)
