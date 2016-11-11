var Swipe = function(container){
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