var Swipe = function(container){
	//获取第一个子节点
	var element = container.find(':first');
	
	//滑动对象
	var swipe = {};
	
	//li页面的数量
	var slides = element.find('li');
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
		slide.css({
			width:width + 'px',
			height:height + 'px'
		});
	});
	
	
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

//自定义方法确定小男孩的位置
var boyTop = function(){
	var $bottomHeight = $('.a-background-bottom').height();
	var $middleHeight = $('.a-background-middle').height() / 2;
	return $bottomHeight + $middleHeight - 20;
} 

;(function($){
	
	var swipe = Swipe($("#content"));
	
	//获取数据
	var getValue = function(className) {
            var $elem = $('' + className + '');
                // 走路的路线坐标
            return {
                height: $elem.height(),
//              top: $elem.position().top
            };
        };
	
	//路线的Y轴
	var pathY = function(){
		var data = getValue('.a-backgroud-middle');
		return data.top + data.height / 2;
	}();
	
	var $boy = $('#boy');
	var boyHeight = $boy.height();
	
	
	//修正小男孩的正确位置，路线的中间位置减去小男孩的高度，25是一个修正值
//	$boy.css({
//		top: pathY - boyHeight + 25
//	});
	$boy.css({
		bottom: boyTop() +'px'
	});
	
	//增加精灵动画
	$('button').on('click',function(event){
		//增加走路的css3关键帧规则
		$boy.addClass('slowWalk');
	});
})(jQuery);



