/**
 * 为容器添加下拉刷新功能
 * @param container query选择器或者节点对象,需要position:relative;
 * @param option 配置项
 */
function installPullToRefresh(container, option) {
    // 起始触摸位置
    var touchStartY = 0;
    // 起始图标位置
    var pullStartY = 0;
    // 当前的加载事件
    var loadEvent = null;
    // 当前图标位置
    var curY = -60;

    // 默认参数
    var defaultOption = {
        pauseBound: 40,  // 触发刷新的位置(也是图标加载时暂停的位置)
        lowerBound: 80, // 最大下拉到多少px
        loadImg: "load.gif", // 加载图片
        pullImg: "pull.png", // 下拉图片
        onLoad: function () {}, // 加载数据回调
    };
    var finalOption = $.extend(true, defaultOption, option);

    // 设置transform的函数
    function cssTransform(node, content) {
        node.css({
            '-webkit-transform' : content,
            '-moz-transform'    : content,
            '-ms-transform'     : content,
            '-o-transform'      : content,
            'transform'         : content,
        });
    }

    // 创建小图标
    var pullToRefresh = $('<div class="pullToRefresh"><img src="' + finalOption.pullImg + '"></div>');
    // 添加到父容器
    $(container).prepend(pullToRefresh);

    // 调整小图标位置的函数
    function goTowards(translateY, rotate) {
        // 切换为pull图
        pullToRefresh.find("img").attr("src", finalOption.pullImg);
        // 更新当前小图标的位置，获取css(transform)比较麻烦,所以每次变更时自己保存
        curY = translateY;
        // 改变位置和旋转角度
        cssTransform(pullToRefresh, "translateY(" + translateY + "px) translateZ(0)" + "rotateZ(" + rotate + "deg)");
    }

    // 父容器注册下拉事件
    $(container).on("touchstart", function (event) {
        touchStartY = event.originalEvent.changedTouches[0].clientY;
        pullStartY = curY;
        // 记录本次加载事件（JS对象唯一性）
        loadEvent = {};
        // 如果存在,则关闭回弹动画与相关监听
        pullToRefresh.removeClass("backTranTop");
        pullToRefresh.unbind();
    }).on("touchmove", function (event) {
        var touchCurY = event.originalEvent.changedTouches[0].clientY;
        var touchDistance = touchCurY - touchStartY; // 本次移动的距离
        var curPullY = pullStartY + touchDistance; // 计算图标应该移动到的位置
        // 向下不能拉出范围
        if (curPullY > finalOption.lowerBound) {
            curPullY = finalOption.lowerBound;
        }
        // 向上不能拉出范围
        if (curPullY <= -60) {
            curPullY = -60;
        }
        var rotateDeg = 0;
        if (curPullY >= 0) {
            var pullRate = curPullY / finalOption.lowerBound;
            rotateDeg = pullRate * 360;
        }
        // 更新图标的位置, 旋转图标（根据抵达lowerBound的比例旋转,最大转1圈)
        goTowards(curPullY, rotateDeg);
    }).on("touchend", function (event) {
        // 启动回弹动画
        pullToRefresh.addClass("backTranTop");
        // 判断是否触发加载
        if (curY >= finalOption.pauseBound) {
            goTowards(finalOption.pauseBound, (finalOption.pauseBound / finalOption.lowerBound) * 360);
            // 回弹动画结束发起加载
            pullToRefresh.on('transitionend webkitTransitionEnd oTransitionEnd', function (event) {
                // 暂停动画
                pullToRefresh.removeClass("backTranTop");
                pullToRefresh.unbind();
                // 角度恢复为0
                goTowards(finalOption.pauseBound, 0);
                // 切换图片为load图
                pullToRefresh.find("img").attr("src", finalOption.loadImg);
                // 回调加载数据,最终应将loadEvent传回校验
                finalOption.onLoad(loadEvent, function (userLoadEvent, error, msg) {
                    if (loadEvent === userLoadEvent) { // 在刷新数据期间，没有发起新的触摸
                        // 重置角度,切换为pull图
                        goTowards(finalOption.pauseBound, (finalOption.pauseBound / finalOption.lowerBound) * 360);
                        // 延迟过渡动画,给浏览器重绘的机会
                        setTimeout(function() {
                            if (loadEvent == userLoadEvent) {
                                // 恢复动画
                                pullToRefresh.addClass("backTranTop");
                                // 弹回顶部
                                goTowards(-60, 0);
                            } else {
                                console.log("loadDone expires before repainted"); // 在等待绘制过渡动画前，重新触摸了屏幕
                            }
                        }, 0);
                        console.log("loadDone done");
                    } else {
                        console.log("loadDone expires before data loaded"); // 在刷新数据期间，重新触摸了屏幕
                    }
                });
            });
        } else {
            goTowards(-60, 0); // 弹回顶部
        }
    });
}