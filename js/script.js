var music = function(){
	var audioConfig = {
		keepZoomRatio: false,
		layer:{
			"width":"100%",
			"height":"100%",
			"top":0,
			"left":0
		},
		//音乐配置
		audio:{
			enable: true,   //是否开启音乐
			playURL:'vedio/happy.wav',  //正常播放地址
			cycleURL: 'vedio/circulation.wav'   //正常循环播放地址
		},
		setTime:{
			walkToThird:6000,
			walkToMiddle:6500,
			walkToEnd:6500,
			walkToBridge:2000,
			bridgeWalk:2000,
			walkToShop:1500,
			walkOutShop:1500,
			openDoorTime:800,
			shutDoorTime:500,
			waitRotate:850,
			waitFlower:800
		},
		snowflakeURL:[
			'http://img.mukewang.com/55adde120001d34e00410041.png',
			'http://img.mukewang.com/55adde2a0001a91d00410041.png',
			'http://img.mukewang.com/55adde5500013b2500400041.png',
			'http://img.mukewang.com/55adde62000161c100410041.png',
			'http://img.mukewang.com/55adde7f0001433000410041.png',
			'http://img.mukewang.com/55addee7000117b500400041.png'
		]
	};
	var debug = 0;
	if(debug){
		$.each(audioConfig.setTime, function(key,val) {
			audioConfig.setTime[key] = 500;
		});
	}
	if(audioConfig.keepZoomRatio){
		var proportionY = 900/1440;
		var screenHeight = $(document).height();
		var zoomHeight = screenHeight * proportionY;
		var zoomTop = (screenHeight - zoomHeight)/2;
		audioConfig.layer.height = zoomHeight;
		audioConfig.layer.top = zoomTop;
	}
	
	var instanceX;
	var container = $('#content');
	container.css(audioConfig.layer);
	
	//页面可视区域
	var visualWidth = container.width();
	var visualHeight = container.height();
	
	
	//动画结束事件
	var animationEnd= (function(){
		var explorer = navigator.userAgent;
		if(~explorer.indexOf('WebKit')){
			return 'webkitAnimationEnd';
		}
		return "animationend"
	})();
	
	if(audioConfig.audio.enable){
		var audio1 = musicAudio(audioConfig.audio.playURL);
		audio1.end(function(){
			musicAudio(audioConfig.audio.cycleURL,true);
		})
	}
	
	var swipe = Swipe(container);
	
	//页面滚动到指定位置
	function scrollTo(time,proportionX){
		var distX = visualWidth * proportionX;
		swipe.scrollTo(distX,time);
	}
	
	//自定义小女孩的top
	function girlBottom(){
		var middleHeight = $('.c-background-middle').height();
		var bottomHeight = $('.c-background-bottom').height();
		return middleHeight + bottomHeight;
	}
	
	//小女孩
	var girl = {
		elem:$('.girl'),
		getHeight: function(){
			return this.elem.height();
		},
		//转身动作
		rotate: function(){
			this.elem.addClass('girl-rotate');
		},
		setOffset: function(){
			this.elem.css({
				left: visualWidth / 2,
				bottom: girlBottom    //动态设置小女孩距离底部的高度
			});
		},
		getOffset: function(){
			return this.elem.offset();
		},
		getWidth: function(){
			return this.elem.width();
		}
	};
	
	//	鸟从右边飞出
	var bird = {
		elem: $('.bird'),
		fly: function(){
			this.elem.addClass('birdFly')
			this.elem.transition({
				right: visualWidth
			},15000,'linear');
		}
	};
	
	//小男孩走路
	var boy = boyWalk();
	boy.walkTo(audioConfig.setTime.walkToThird,0.6)
		.then(function(){
			scrollTo(audioConfig.setTime.walkToMiddle,1);
			return boy.walkTo(audioConfig.setTime.walkToMiddle,0.5);
		}).then(function(){
			bird.fly();
		}).then(function(){
			boy.stopWalk();
			return boyToShop(boy);
		}).then(function(){
			girl.setOffset();
			scrollTo(audioConfig.setTime.walkToEnd,2);
			return boy.walkTo(audioConfig.setTime.walkToEnd,0.15);
		}).then(function(){
			//第二次走路到桥上
			return boy.walkTo(audioConfig.setTime.walkToBridge,0.25,girl.getOffset().top / visualHeight);
		}).then(function(){
			//实际走路的比例
			var proportionX = (girl.getOffset().left - boy.getWidth() -instanceX + girl.getWidth() / 5) / visualWidth;
			//第三次小男孩在桥上走到小女孩面前
			return boy.walkTo(audioConfig.setTime.bridgeWalk,proportionX);
		}).then(function(){
			boy.resetOriginal();
			setTimeout(function(){
				girl.rotate();
				boy.rotate(function(){
					snowflake();
				})
			},audioConfig.setTime.waitRotate)
		});
		
	function boyWalk(){
		
		var $boy = $('#boy');
		var boyWidth = $boy.width();
		var boyHeight = $boy.height();
		
		//自定义方法确定小男孩的位置
		var boyBottom= function(){
			var $bottomHeight = $('.a-background-bottom').height();
			var $middleHeight = $('.a-background-middle').height() / 2;
			return $bottomHeight;
		}
		
		//修正小男孩的正确位置，路线的中间位置减去小男孩的高度，25是一个修正值
		$boy.css({
			bottom: boyBottom
		});
		
		
		//暂停走路
		var pauseWalk = function(){
			$boy.addClass('pauseWalk');
		}
		
		//恢复走路
		var restoreWalk = function(){
			$boy.removeClass('pauseWalk');
		}
		
		//css3动作变化
		var slowWalk = function(){
			$boy.addClass('slowWalk');
		}
		
		//用transition做运动
		var startRun = function(options,runTime){
			var play = $.Deferred();
			//恢复走路
			restoreWalk();
			//运动的属性
			$boy.transition(
				options,
				runTime,
				'linear',
				function(){
					play.resolve();
				});
			return play;
		}
		
		//开始走路
		var walkRun = function(time,dist,disY){
			time = time || 3000;
			//小男孩的脚动作
			slowWalk();
			//开始走路
			var d1 = startRun({
				'left':dist + 'px',
				'top':disY ? disY : undefined
			},time);
			return d1;
		}
		
		//走进商店
		function walkToShop(runTime){
			var defer = $.Deferred();
			var doorObj = $('.door');
			//门的坐标
			var offsetDoor = doorObj.offset();
			var doorOffsetLeft = offsetDoor.left;
			var doorOffsetTop = offsetDoor.top;
			
			//小男孩当前的坐标
			var offsetBoy = $boy.offset();
			var boyOffsetLeft = offsetBoy.left;  
			var boyOffsetTop = offsetBoy.top;
			
			//中间位置
			var boyMiddle = $boy.width() / 2;
			var doorMiddle = doorObj.width() / 2;
			var doorTopMiddle = doorObj.height() / 2;
			
			//当前移动的坐标
			instanceX = (doorOffsetLeft + doorMiddle) - (boyOffsetLeft + boyMiddle);
			
			//Y的坐标
			//top = 人物底部的top - 门中间的top
			instanceY = boyOffsetTop + boyHeight - doorOffsetTop + doorTopMiddle;
			
			//开始走路
			var walkPlay = startRun({
				transform: 'translateX(' + instanceX + 'px),translateY(0),scale(0.3,0.3)',
				opacity: 0.1
			},2000);
			
			//走路完毕
			walkPlay.done(function(){
				$boy.css({
					opacity: 0
				})
				defer.resolve();
			})
			return defer;
		}
		
		//走出商店
		function walkOutShop(runTime){
			var defer = $.Deferred();
			restoreWalk();
			
			//开始走路
			var walkPlay = startRun({
				transform: 'translateX(' + instanceX + 'px),translateY(0),scale(1,1)',
				opacity: 1
			},runTime);
			
			//走路完毕
			walkPlay.done(function(){
				defer.resolve();
			});
			return defer;
		}
		
		//计算小男孩移动的距离
		var calculateDist = function(direction,proportion){
			return (direction == "x" ? visualWidth : visualHeight) * proportion;
		}
		
		return {
			//开始走路
			walkTo:function(time,proportionX,proportionY){
				var distX = calculateDist('x',proportionX);
				var distY = calculateDist('y',proportionY);
				return walkRun(time,distX,distY);
			},
			//走进商店
			toShop:function(){
				return walkToShop.apply(null,arguments);
			},
			//走出商店
			outShop:function(){
				return walkOutShop.apply(null,arguments);
			},
			//停止走路
			stopWalk:function(){
				pauseWalk();
			},
			setColoer:function(value){
				$boy.css('background-color',value);
			},
			//获取男孩的宽度
			getWidth: function(){
				return $boy.width();
			},
			//复位初始状态
			resetOriginal: function(){
				this.stopWalk();
				//恢复图片
				$boy.removeClass('slowWalk slowFlolerWalk').addClass('boyOriginal');
			},
			//转身动作
			rotate: function(callback){
				restoreWalk();
				$boy.addClass('boy-rotate');
				//监听转身完毕
				if(callback){
					$boy.on(animationEnd,function(){
						callback();
						$(this).off();
					})
				}
			},
			getDistance:function(){
				return $boy.offset().left;
			},
			setFlolerWalk: function(){
				$boy.addClass('slowFlolerWalk');
			},
			//取花
			talkFlower:function(){
				$boy.addClass('slowFlolerWalk');
			}
		}
		
	}
		
	var boyToShop = function(boyObj){
		var defer = $.Deferred();
		var $door = $('.door');
		var doorLeft = $('.door-left');
		var doorRight = $('.door-right');
		
		function doorAction(left,right,time){
			var defer = $.Deferred();
			var count = 2;
			//等待门开
			var complete = function(){
				if(count == 1){
					defer.resolve();
					return;
				}
				count--;
			}
			
			doorLeft.transition({
				'left': left
			},time,complete);
			
			doorRight.transition({
				'left': right
			},time,complete);
			return defer;
		}
		
		//开门
		function openDoor(time){
			return doorAction('-50%','100%',time);
		}
		
		//关门
		function shutDoor(time){
			return doorAction('0%','50%',time);
		}
		
		//小男孩取鲜花
		function talkFlower(){
			//增加延时等待效果
			var defer = $.Deferred();
			boyObj.talkFlower();
			setTimeout(function(){
				//取花
//					$boy.addClass('slowFlolerWalk');
				defer.resolve();
			},audioConfig.setTime.waitFlower);
			return defer;
		}
		
		var lamp = {
			elem:$('.b-background'),
			bright:function(){
				this.elem.addClass('lamp-bright');
			},
			dark:function(){
				this.elem.removeClass('lamp-bright');
			}
		}
		
		var waitOpen = openDoor(audioConfig.setTime.openDoorTime);
		waitOpen.then(function(){
			lamp.bright();
			return boyObj.toShop($door,audioConfig.setTime.walkToShop);
		}).then(function(){
			return talkFlower();
		}).then(function(){
			return boy.outShop(audioConfig.setTime.walkOutShop);
		}).then(function(){
			shutDoor(audioConfig.setTime.shutDoorTime);
			lamp.dark();
			defer.resolve();
		});
		return defer;
	}
		
	//	飘雪花
	function snowflake(){
		//雪花容器
		var $flakeContainer = $('#snowflake');
		
		//随机选取六张花瓣的图片
		function getImagesName(){
			return audioConfig.snowflakeURL[[Math.floor(Math.random() * 6)]];
		}
		
		//创建一个雪花元素
		function createSnowBox(){
			var url = getImagesName();
			return $('<div class="snowbox"></div>').css({
				'width': 41,
				'height': 41,
				'position' :'absolute',
				'background-size' :'cover',
				'z-index' :10000,
				'top' :'-41px',
				'background-image' :'url('+url+')'
			}).addClass('snowRoll');
		}
		
		//开始飘花
		setInterval(function(){
			//运动轨迹
			var startPositionLeft = Math.random() * visualWidth - 100,
				startOpacity = 1,
				endPositionTop = visualHeight - 40,
				endPositionLeft = startPositionLeft - 100 + Math.random() * 500,
				duration = visualHeight * 10 + Math.random() * 5000;
			
			
			//随机透明度，不小于0.5
			var randomStart = Math.random();
			randomStart = randomStart < 0.5 ? startOpacity : randomStart;
			
			//创建一个雪花
			var $flake = createSnowBox();
			
			//设计飘花的起点位置
			$flake.css({
				left : startPositionLeft,
				opacity : randomStart
			});
			
			//加入到容器
			$flakeContainer.append($flake);
			
			//开始执行动画
			$flake.transition({
				'top':endPositionTop,
				'left':endPositionLeft,
				'opacity':0.7
			},duration,'ease-out',function(){
				$(this).remove();   //花飘落到地面之后消失
			});
		},200);
	}
		
	//背景音乐
	function musicAudio(url,isloop){
		var audio = new Audio(url);
		audio.autoplay = true;
		audio.loop = isloop || false;
		audio.play();
		return{
			end:function(callback){
				audio.addEventListener("ended",function(){
					callback();
				},false);
			}
		};
	}
}

var Swipe = function(container,options){
	//获取第一个子节点
	var element = container.find(':first');
	
	//滑动对象
	var swipe = {};
	
	//li页面的数量
	var slides = element.find('>');
	//获取容器的尺寸
	var width = container.width();
	var height = container.height();
	
	//设置li页面总宽度
	element.css({
		width:(slides.length * width) + 'px',
		height:height + 'px'
	});
	
	//设置每一个li的页面宽度
	$.each(slides, function(index) {
		var slide = slides.eq(index);   //获取到每个li元素
		slide.eq(index).css({
			width:width + 'px',
			height:height + 'px'
		});
	});
	
	var isComplete = false;
	var timer;
	var callbacks = {};
	container[0].addEventListener("animationend",function(){
		isComplete = true;
	},false);
	
	function monitorOffset(element){
		timer = setTimeout(function(){
			if(isComplete){
				clearInterval(timer);
				return
			}
			callbacks.move(element.offset().left);
			monitorOffset(element);
		},500);
	}
	
	swipe.watch = function(eventName,callback){
		callbacks[eventName] = callback;
	};
	
	//监控完成与移动
	swipe.scrollTo = function(x,speed){
		//执行动画移动
		element.css({
			'transition-timing-function': 'linear',
			'transition-duration': speed +'ms',
			'transform': 'translate3d(-' + x + 'px,0px,0px)'  //设置页面x轴的转动
		});
		return this;
	}
	return swipe;
}



;(function($){
	
	music();
})(jQuery);



