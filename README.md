# pullToRefresh 

>![加载你的世界](logo.png)
>加载你的世界

# 贡献与提问
现在有一个待实现的功能，希望你加入一起搞定！

* 将插件打包成npm可用形式
 
如果你对插件使用过程有任何BUG与需求，请创建一个ISSUE，我会尽快回复与解决

## 效果
[点击体验](https://owenliang.github.io/pullToRefresh/)
（选择手机模式）

## 说明
* 完整的功能：同时支持"下拉刷新"，"上拉加载"
* 简单的接口：用户仅需提供数据回调函数，框架负责剩余任务
* 参数化配置：用户可自定义"下拉/上拉"的触发位置、图片等，但是默认值通常可以满足需求
* 灵活的设定："下拉/上拉"特性可独立"开启/关闭","上拉加载"特效交由用户订制

## 依赖
* iscroll5：兼容各移动平台的滚动条方案
* jquery：高效跨平台的DOM操作

## 实现
* 基于transition实现bounce回弹动画
* 基于anamation实现自旋loading加载动画
* 基于iscroll5滚动事件实现"上拉加载"
* 基于jquery静态函数实现为插件

## 原理
参考[鱼儿的博客](http://yuerblog.cc)

## 测试
* 微信浏览器
* chrome移动浏览器
* safari浏览器

## 用法
### 引入文件
    <script src="https://code.jquery.com/jquery-2.2.4.min.js"></script>
    <script src="iscroll.js"></script>
    <script src="pullToRefresh.js"></script>
    <link rel='stylesheet' type='text/css' href = 'pullToRefresh.css'>

### 准备容器

	<div id="container">
		<div id="content"></div>
	</div>

* container内的区域将出现滚动条，需添加以下CSS：
	* position：relative/absolute/fixed
	* height：固定高度,才能出现滚动条
* content容纳内容，必须是container的唯一子元素
* 注：插件并不会依赖2个div的id属性, 这里仅仅为了演示用途

### 初始化插件
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
            });

* 第一个参数：container的节点Jquery选择语法或者dom对象
* 第二个参数：插件配置，其中核心配置：
	* onRefresh：刷新回调函数，你应该在此发起ajax请求完整数据并覆盖到content内部，最后调用refreshDone通知插件完成
	* onLoad：加载回调函数，你应该在此发起ajax请求增量数据并追加到content末尾，最后调用loadDone通知插件完成
	* noRefresh：设置为true将禁止下拉刷新特性
	* noLoad：设置为true将禁止上拉加载特性
	* 其他专家参数通常用不到，你可以阅读源码了解
    
### 重新绘制
如果你在onRefresh与onLoad之外更新了content里的内容，影响了其总高度，那么请主动发起如下重绘调用，否则可能导致滚动条绘制错误：

	pullToRefresh.refresh();

### 主动刷新
app首屏通常需要异步获取数据，因此你可以通过下面的方式主动触发一次刷新，效果和手势滑动触发的刷新一致：

    pullToRefresh.triggerPull();
