/**
 * 为容器添加下拉刷新功能
 * @param container 滚动容器，需要设置height与position:relative/absolute，只能有1个孩子
 * @param content 滚动内容，cotainer的唯一孩子，内容超过container则产生滚动条
 * @param option 配置项
 */
function installPullToRefresh(container, content, option) {
    // 起始触摸位置
    var touchStartY = 0;
    // 起始图标位置
    var pullStartY = 0;
    // 当前的触摸事件
    var touchEvent = null;
    // 当前的加载事件
    var loadEvent = null;
    // 当前图标位置
    var curY = -55;

    // 默认参数
    var defaultOption = {
        pauseBound: 40,  // 触发刷新的位置(也是图标加载时暂停的位置)
        lowerBound: 80, // 最大下拉到多少px
        loadImg: "load.png", // 加载图片
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

    // 紧邻滚动区域,容纳刷新图标
    var pullContainer = $('<div class="pullContainer"></div>')
    // 创建小图标
    var pullToRefresh = $('<div class="pullToRefresh"><img src="' + finalOption.pullImg + '"></div>');
    // 保留小图标的快捷方式
    var pullImg = pullToRefresh.find("img");
    // 小图标加入到容器
    pullContainer.append(pullToRefresh);
    // 小图标容器添加到滚动区域之前
    $(container).before(pullContainer);

    // 初始化iscroll5滚动区域
    var iscroll = new IScroll(container, {
        bounce: false,
    });
    iscroll.refresh();

    // 预加载loadImg
    $('<img src="' + finalOption.loadImg + '">');

    // 调整小图标位置,角度,透明度
    function goTowards(translateY, rotate, opcaticy) {
        // 更新当前小图标的位置，获取css(transform)比较麻烦,所以每次变更时自己保存
        curY = translateY;

        // 旋转图标（根据抵达lowerBound的比例旋转,最大转1圈)
        if (rotate === undefined) {
            rotate = (curY / finalOption.lowerBound) * 360;
        }
        // 透明度根据抵达pauseBound的比例计算
        if (opcaticy === undefined) {
            opcaticy = (curY / finalOption.pauseBound) * 1;
            if (opcaticy > 1) {
                opcaticy = 1;
            }
        }
        // 改变位置和旋转角度
        cssTransform(pullToRefresh, "translateY(" + translateY + "px) translateZ(0)" + "rotateZ(" + rotate + "deg)");
        // 改变透明度
        pullToRefresh.css("opacity", opcaticy);
    }

    // 父容器注册下拉事件
    $(container).on("touchstart", function (event) {
        // 新的触摸事件
        touchEvent = {};
        // 有一个刷新事件正在进行
        if (loadEvent) {
            return;
        }
        // 只有滚动轴位置接近顶部, 才可以生成新的刷新事件
        if (iscroll.y < -1 * finalOption.lowerBound) {
            return;
        }

        // 一个新的刷新事件
        loadEvent = touchEvent;

        touchStartY = event.originalEvent.changedTouches[0].clientY;
        pullStartY = curY;
        // 如果存在,则关闭回弹动画与相关监听
        pullToRefresh.removeClass("backTranTop");
        pullToRefresh.unbind();
        // 切换为pull图
        pullImg.attr("src", finalOption.pullImg);
    }).on("touchmove", function (event) {
        // 在刷新未完成前触摸,将被忽略
        if (touchEvent != loadEvent) {
            return;
        }
        var touchCurY = event.originalEvent.changedTouches[0].clientY;
        var touchDistance = touchCurY - touchStartY; // 本次移动的距离
        var curPullY = pullStartY + touchDistance; // 计算图标应该移动到的位置
        // 向下不能拉出范围
        if (curPullY > finalOption.lowerBound) {
            curPullY = finalOption.lowerBound;
        }
        // 向上不能拉出范围
        if (curPullY <= -55) {
            curPullY = -55;
        }
        // 更新图标的位置
        goTowards(curPullY);
    }).on("touchend", function (event) {
        // 在刷新未完成前触摸,将被忽略
        if (touchEvent != loadEvent) {
            return;
        }
        // 启动回弹动画
        pullToRefresh.addClass("backTranTop");
        // 判断是否触发加载
        if (curY >= finalOption.pauseBound) {
            goTowards(finalOption.pauseBound);
            // 回弹动画结束发起加载
            pullToRefresh.on('transitionend webkitTransitionEnd oTransitionEnd', function (event) {
                // 由于transitionend会对每个属性回调一次,所以只处理其中一个
                if (event.originalEvent.propertyName == "transform") {
                    // 暂停动画
                    pullToRefresh.removeClass("backTranTop");
                    pullToRefresh.unbind();
                    // 透明度重置为1
                    goTowards(finalOption.pauseBound, undefined, 1);
                    // 切换图片为load图
                    pullImg.attr("src", finalOption.loadImg);
                    // 因为anamition会覆盖transform的原因,使用top临时定位元素
                    pullToRefresh.addClass("loadingAnimation");
                    pullToRefresh.css("top", finalOption.pauseBound + "px");
                    // 回调加载数据,最终应将loadEvent传回校验
                    finalOption.onLoad(function (error, msg) {
                        // 用户回调时DOM通常已经更新, 需要通知iscroll调整（官方建议延迟执行，涉及到浏览器重绘问题）
                        setTimeout(function () {
                            iscroll.refresh();
                        }, 0);
                        // 重置角度,切换为pull图
                        goTowards(finalOption.pauseBound);
                        // 取消animation,重置top
                        pullToRefresh.removeClass("loadingAnimation");
                        pullToRefresh.css("top", "");
                        // 延迟过渡动画100毫秒,给浏览器重绘的机会
                        setTimeout(function () {
                            // 切换为pull图
                            pullImg.attr("src", finalOption.pullImg);
                            // 恢复动画
                            pullToRefresh.addClass("backTranTop");
                            // 刷新完成
                            loadEvent = null;
                            // 弹回顶部
                            goTowards(-55);
                        }, 100);
                    });
                }
            });
        } else {
            goTowards(-55); // 弹回顶部
            loadEvent = null; // 未达成刷新触发条件
        }
    });

    return {
        // 用户如果在下拉刷新之外修改了滚动区域的内容，需要主动调用refresh
        refresh: function() {
            // 延迟以便配合浏览器重绘
            setTimeout(function() {
                iscroll.refresh();
            }, 0);
        }
    };
}