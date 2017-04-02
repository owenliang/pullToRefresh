# pullToRefresh

>![load your world](logo.png)
>load your world

# Contribute or Issue
There is 1 new feature to implement, JUST DO IT AND JOIN US!

* pack this plugin into a npm package.

If you have problems with this plugin, then just create an issue, and I will solve it as soon as possible.

# Experience
[click to experience](https://owenliang.github.io/pullToRefresh/)
（switch to mobile device in browser）

# Description
* *Complete features*: both support "pull-down-to-refresh" and "pull-up-to-load".
* *Simple API*: only need to provide your data-callback-function, the plugin will do the left.
* *Configurable*: you can specific the position where "refresh/load" will be triggered, the images that show up...But the default config already works well.
* *Flexibility*: "pull-down/pull-up" features can be "open/close" separately, and "pull-up-to-load" anamition can be added by yourself additionaly.

# Dependency
* *iscroll5*: high performance, small footprint, dependency free, multi-platform javascript scroller.
* *jquery*: make it much easier to use JavaScript on your website.

# Implement
* use "*CSS Transition*" for "bounce animation".
* use "*CSS Anamation*" for "loading anamation".
* use IScroll5's "*Scroll Event*" for "pull-up-to-load"
* assign to jquery as a *Static Function*

# Tested
* wechat
* mobile-chrome
* safari

# WARNING
There is some tricks for IScroll5 codes, all modification listed below:

    // NEW FEATURE:
    // user can lock scroll Y for certain direction, used by pull-to-refresh-like scenarios
	lockScrollUp: function() {
		this.isScrollUpLocked = true;
	},

	unlockScrollUp: function() {
		this.isScrollUpLocked = false;
	},
	////////////////////////////////////////

	_move: function (e) {

	...

    deltaX = this.hasHorizontalScroll ? deltaX : 0;
    deltaY = this.hasVerticalScroll ? deltaY : 0;

    // NEW FEATURE:
    // user can lock scroll Y for certain direction, used by pull-to-refresh-like scenarios
    deltaY = deltaY < 0 && this.isScrollUpLocked ? 0 : deltaY;

    ...

* lockScrollUp: is used to prevent iscroll's from scrolling while the user pull up the "pull-down-to-refresh".
* unlockScrollUp: free the iscroll's scrolling-up lock.
* _move: if scroll-y direction is up and lockScrollUp is called before, then reset deltaY to ZERO.

# Usage
### Import js and css
    <script src="https://code.jquery.com/jquery-2.2.4.min.js"></script>
    <script src="iscroll.js"></script>
    <script src="pullToRefresh.js"></script>
    <link rel='stylesheet' type='text/css' href = 'pullToRefresh.css'>

### Prepare Container
	<div id="container">
		<div id="content"></div>
	</div>
* scroll-bar will appear inside container, you should add CSS below for it:
	* 	position: absolute/relative/fixed.
	*  height: any container can't have scroll-bar without a fixed height.
* content should hold your html, and the scroll-bar will appear when content is higher than container.
* this plugin doesn't need "id" attribute in container and content, it is just an example here.

### Install plugin
            var pullToRefresh = $.installPullToRefresh("#container", {
                onRefresh: function(refreshDone) {
                    setTimeout(function() {
                        refreshDone();
                    }, 0)
                },
                onLoad: function(loadDone) {
                    setTimeout(function() {
                        loadDone();
                    }, 0);
                },
                // noRefresh: true,
                // noLoad: true,
                // pauseBound: 40,
                // lowerBound: 80,
                // loadImg: "load.png",
                // pullImg: "pull.png",
                // bottomHeight: 1,
            });
* *first param*: the javascript dom object or query-string of container.
* *second param*: the config for plugin:
	* *onRefresh*: callback when refresh is triggered, you may do ajax here to fill the latest data into "#content".
	* *onLoad*: callback when load is triggered, you may do ajax here to append more data to "#content".
	* *noRefresh*：set to true if you do not need "pull-down-to-refresh" featrue.
	* *noLoad*：set to true if you do not need "pull-up-to-load" feature.
	* *pauseBound*: the height where loading image stays while refreshing.
	* *lowerBound*: the max height that user can pull down.
	* *loadImg*: the url of refreshing image.
	* *pullImg*: the url of pulling image.
	* *bottomHeight*: the distance from content's bottom when "pull-up-to-load" will be triggered.

### Redraw
If you have updated the html in "#content" that changes the height of "#content" outside onRefresh/onLoad callback, you *MUST* do the following, otherwise the iscroll5-bar may occur a drawing error:

	pullToRefresh.refresh();

### Force refresh
You may need to load data for the first screen in app without user's touch, the following method will trigger a "pull-down-to-refresh" immediately:

    pullToRefresh.triggerPull();
# pullToRefresh 

>![加载你的世界](logo.png)
>加载你的世界

# 贡献与提问
现在有一个待实现的功能，希望你加入一起搞定！

* 将插件打包成npm可用形式
 
如果你对插件使用过程有任何BUG与需求，请创建一个ISSUE，我会尽快回复与解决

# 效果
[点击体验](https://owenliang.github.io/pullToRefresh/)
（选择手机模式）

# 说明
* 完整的功能：同时支持"下拉刷新"，"上拉加载"
* 简单的接口：用户仅需提供数据回调函数，框架负责剩余任务
* 参数化配置：用户可自定义"下拉/上拉"的触发位置、图片等，但是默认值通常可以满足需求
* 灵活的设定："下拉/上拉"特性可独立"开启/关闭","上拉加载"特效交由用户订制

# 依赖
* iscroll5：兼容各移动平台的滚动条方案
* jquery：高效跨平台的DOM操作

# 实现
* 基于transition实现bounce回弹动画
* 基于anamation实现自旋loading加载动画
* 基于iscroll5滚动事件实现"上拉加载"
* 基于jquery静态函数实现为插件

# 原理
参考[鱼儿的博客](http://yuerblog.cc)

# 测试
* 微信浏览器
* chrome移动浏览器
* safari浏览器

# 注意
我为IScroll5打了一个小补丁, 所有的修改列举如下：

    // NEW FEATURE:
    // user can lock scroll Y for certain direction, used by pull-to-refresh-like scenarios
	lockScrollUp: function() {
		this.isScrollUpLocked = true;
	},

	unlockScrollUp: function() {
		this.isScrollUpLocked = false;
	},
	////////////////////////////////////////

	_move: function (e) {

	...

    deltaX = this.hasHorizontalScroll ? deltaX : 0;
    deltaY = this.hasVerticalScroll ? deltaY : 0;

    // NEW FEATURE:
    // user can lock scroll Y for certain direction, used by pull-to-refresh-like scenarios
    deltaY = deltaY < 0 && this.isScrollUpLocked ? 0 : deltaY;

    ...

* lockScrollUp: 当用户下拉刷新并将动画向反方向拉回的时候，阻止IScroll5跟随滚动
* unlockScrollUp: 解除对IScroll5的Y轴上拉锁定
* _move: 如果当前正在向上拉动Y轴，并且Y轴上拉已锁定，那么重置本次移动的deltaY为0

# 用法
## 引入文件
    <script src="https://code.jquery.com/jquery-2.2.4.min.js"></script>
    <script src="iscroll.js"></script>
    <script src="pullToRefresh.js"></script>
    <link rel='stylesheet' type='text/css' href = 'pullToRefresh.css'>

## 准备容器

	<div id="container">
		<div id="content"></div>
	</div>

* container内的区域将出现滚动条，需添加以下CSS：
	* position：relative/absolute/fixed
	* height：固定高度,才能出现滚动条
* content容纳内容，必须是container的唯一子元素
* 注：插件并不会依赖2个div的id属性, 这里仅仅为了演示用途

## 初始化插件
            // 安装下拉刷新插件
            var pullToRefresh = $.installPullToRefresh("#container", {
                onRefresh: function(refreshDone) {
                    setTimeout(function() {
                        refreshDone();
                    }, 0)
                },
                onLoad: function(loadDone) {
                    setTimeout(function() {
                        loadDone();
                    }, 0);
                },
                // noRefresh: true,
                // noLoad: true,
                // pauseBound: 40,
                // lowerBound: 80,
                // loadImg: "load.png",
                // pullImg: "pull.png",
                // bottomHeight: 1,
            });

* 第一个参数：container的节点Jquery选择语法或者dom对象
* 第二个参数：插件配置，所有内容列举如下：
	* *onRefresh*：刷新回调函数，你应该在此发起ajax请求完整数据并覆盖到content内部，最后调用refreshDone通知插件完成
	* *onLoad*：加载回调函数，你应该在此发起ajax请求增量数据并追加到content末尾，最后调用loadDone通知插件完成
	* *noRefresh*：设置为true将禁止下拉刷新特性
	* *noLoad*：设置为true将禁止上拉加载特性
	* *pauseBound*： 刷新数据时loading图标的停留高度
	* *lowerBound*： 下拉的最大高度
	* *loadImg*：等待刷新图标的URL
	* *pullImg*：下拉图标的URL
	* *bottomHeight*：当距离内容底部小于该距离时触发上拉加载
    
## 重新绘制
如果你在onRefresh与onLoad之外更新了content里的内容，影响了其总高度，那么请主动发起如下重绘调用，否则可能导致滚动条绘制错误：

	pullToRefresh.refresh();

## 主动刷新
app首屏通常需要异步获取数据，因此你可以通过下面的方式主动触发一次刷新，效果和手势滑动触发的刷新一致：

    pullToRefresh.triggerPull();
