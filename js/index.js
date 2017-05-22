(function() { // requestAnimationFrame 在不支持情况下的回退方法
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
	}
	if (!window.requestAnimationFrame) window.requestAnimationFrame = function(callback, element) {
		var currTime = new Date().getTime();
		var timeToCall = Math.max(0, 16 - (currTime - lastTime));
		var id = window.setTimeout(function() {
			callback(currTime + timeToCall);
		}, timeToCall);
		lastTime = currTime + timeToCall;
		return id;
	};
	if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function(id) {
		clearTimeout(id);
	};
}());

(function() {
	'use strict';

	var idListHtml = jhtmls.render($('#id_list_template').html());
	var target; // 当前的元素
	var photoList = [];

	getIdList();
	$('.swipe_style_photo li').eq(0)[0].style.pointerEvents = 'auto';

	function getIdList() {
		$.getJSON = function(url, callback) { // 模拟数据
			console.log(url);
			callback({
				"status": 200,
				"desc": "succ",
				"data": [
					9008000000001904,
					9008000000001894,
					9008000000001918,
					9008000000001906,
					9008000000001897,
					9008000000001898,
					9008000000001899,
					9008000000001908,
					9008000000001901,
					9008000000001902,
					9008000000001910,
				]
			});
		};
		$.getJSON('/step/getInfo/', function(reply) {
			if (reply.status == 200) {
				photoList = reply.data;
				renderPhoto();
			}
		});
	}

	function renderPhoto() {
		if ($('.swipe_style_photo li').length < 10) {
			if (photoList.length > 0) {
				$('.swipe_style_photo').append(idListHtml({
					id: photoList[0]
				}));
				photoList.shift();
				renderPhoto();
			} else {
				getIdList();
			}
		}
	}

	$(document).on('touchstart', function(e) { // 防止拖动
		e.preventDefault();
	})

	var startX,
		startY,
		moveX,
		moveY,
		endX,
		lastTime;

	$('body').on('touchstart touchmove touchend tap', '.photo_item', function(e) {
		console.log(e.type);
		switch (e.type) {
			case 'tap':
				//alert('tap');
				break;
			case 'touchstart':
				$(this).removeClass('tocenter'); // 初始化

				target = e.currentTarget;
				lastTime = Date.now();

				isLike = true;
				isUnLike = true;

				startX = e.changedTouches[0].pageX;
				startY = e.changedTouches[0].pageY;


				$(this).css({
					"transform": "translate3d(0, 0, 0)",
					"-webkit-transform": "translate3d(0, 0, 0)"
				}).next().css({
					'transform': 'translate3d(0, 0, 0)',
					'-webkit-transform': 'translate3d(0, 0, 0)'
				}).next().css({
					'transform': 'translate3d(0,.5rem,0)',
					'-webkit-transform': 'translate3d(0,.5rem,0)'
				});
				break;
			case 'touchmove':
				moveX = e.changedTouches[0].pageX;
				moveY = e.changedTouches[0].pageY;
				requestAnimationFrame(step);
				break;
			case 'touchend':
				moveX = 0;
				moveY = 0;
				endX = e.changedTouches[0].pageX;

				if (Math.abs(startX - endX) > ($(".swipe_style_photo img").width() / 2) || Math.abs(startX - endX) / (Date.now() - lastTime) > 0.6) {
					if (startX - endX > 0) { // 向左侧滑动
						$(this).addClass('swipeleft');
					} else { // 向右侧滑动
						$(this).addClass('swiperight');
					}
					initActive(e.currentTarget);
				} else { // 回退到位置
					$(this).addClass('tocenter').removeClass('like').removeClass('unlike');
					$(this).next().css({
						'transform': 'translate3d(0,.5rem,0)',
						'-webkit-transform': 'translate3d(0,.5rem,0)'
					}).next().css({
						'transform': 'translate3d(0,1rem,0)',
						'-webkit-transform': 'translate3d(0,1rem,0)'
					});
				}
				break;
		}
	});

	var isLike, isUnLike;
	var oldMoveX, oldStartX;

	function step() {
		if (!moveX || !startX) {
			requestAnimationFrame(step);
			return;
		}
		if (oldMoveX == moveX && oldStartX == startX) { // 如果停止没动则不往下执行
			requestAnimationFrame(step);
			return;
		}
		oldMoveX = moveX;
		oldStartX = startX;

		$(target).css({
			"transform": "translate3d(" + (moveX - startX) + "px," + (moveY - startY) + "px, 0)",
			"-webkit-transform": "translate3d(" + (moveX - startX) + "px," + (moveY - startY) + "px, 0)"
		});

		if (startX - moveX > 0) {
			if (isLike) { // 如果这个状态已经存在就不再重复
				$(target).addClass('like').removeClass('unlike');
				isLike = false;
				isUnLike = true;
			}
		} else {
			if (isUnLike) {
				$(target).addClass('unlike').removeClass('like');
				isLike = true;
				isUnLike = false;
			}
		}
		requestAnimationFrame(step);
	}

	function initActive(target) {
		$(target)[0].style.pointerEvents = 'none';
		$(target).next()[0].style.pointerEvents = 'auto'; // 任何时候能够点击的只有一张
		setTimeout(function() {
			$(target).remove();
			renderPhoto();
		}, 450);
	}
})()