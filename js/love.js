	//动画结束事件
	var animationEnd= (function(){
		var explorer = navigator.userAgent;
		if(~explorer.indexOf('WebKit')){
			return 'webkitAnimationEnd';
		}
		return 
	})();
	
	//	灯动画
	var lamp = {
		elem:$('.b-background'),
		bright: function(){
			this.elem.addClass('lamp-bright');
		},
		dark: function(){
			this.elem.removeClass('lamp-bright');
		}
	};
	
	var container = $('#content');
	var swipe = Swipe(container);
	var visualWidth = container.width();
	var visualHeight = container.height();
	
	//页面滚动到指定位置
	function scrollTo(time,proportionX){
		var distX = container.width() * proportionX;
		swipe.scrollTo(distX,time);
	}
	
	//获取数据
	var getValue = function(className){
		var $elem = $('' + className + '')
		//走路坐标
		return{
			height: $elem.height(),
			top: '$elem.position().top'
		};
	};
	
	//桥的Y轴
	var bridgeY = function(){
		var data = getValue('.c-background-middle');
		return data.top;
	}();
	
	//自定义小女孩的top
	function girlTop(){
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
		setOffset: function(){
			this.elem.css({
				left: visualWidth / 2,
				bottom: girlTop()
			});
		}
	}
	
	//修正小女孩的位置
	girl.setOffset();
	
	//临时调整页面
	swipe.scrollTo(visualWidth * 2,0);
	
	function doorAction(left,right,time){
		var $door = $('.door');
		var doorLeft = $('.door-left');
		var doorRight = $('.door-right');
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
	function openDoor(){
		return doorAction('-50%','100%',2000);
	}
	
	//关门
	function shutDoor(){
		return doorAction('0%','50%',2000);
	}
	
	var instanceX;
	
	//自定义方法确定小男孩的位置
	var boyTop = function(){
		var $bottomHeight = $('.a-background-bottom').height();
		var $middleHeight = $('.a-background-middle').height() / 2;
		return $bottomHeight;
	}
	
	function boyWalk(){
		var container = $('#content');
		
		//页面可视区域
		var visualWidth = container.width();
		var visualHeight = container.height();
		
		//获取数据
		var getValue = function(className) {
	        var $elem = $('' + className + '');
	            // 走路的路线坐标
	        return {
	            height: $elem.height(),
	            top: '$elem.position().top'
	        };
	    };
	    
	    //路线的Y轴
		var pathY = function(){
			var data = getValue('.a-backgroud-middle');
			return data.top + data.height / 2;
		}();
		
		var $boy = $('#boy');
		var boyWidth = $boy.width();
		var boyHeight = $boy.height();
		//修正小男孩的正确位置，路线的中间位置减去小男孩的高度，25是一个修正值
//		$boy.css({
//			top: pathY - boyHeight + 50
//		});
		
		$boy.css({
			bottom: boyTop
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
				transform: 'translateX(' + instanceX + 'px),translateY(-'+ instanceY +'px),scale(0.5,0.5)',
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
			setFlolerWalk: function(){
				$boy.addClass('slowFlolerWalk');
			},
			//取花
			talkFlower:function(){
				$boy.addClass('slowFlolerWalk');
			}
		}
		
		//小男孩取鲜花
		function talkFlower(){
			//增加延时等待效果
			var defer = $.Deferred();
			setTimeout(function(){
				//取花
				$boy.addClass('slowFlolerWalk');
				defer.resolve();
			},1000);
			return defer;
		}
		
	}
//})(jQuery);
