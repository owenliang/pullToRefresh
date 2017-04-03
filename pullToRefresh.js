/**
 * 为指定的容器添加滚动条,支持下拉刷新与上拉加载功能
 * @param container 需要滚动的容器,要求设置css: position!=static,height=
 * @param option 配置项,详见下方defaultOption说明
 * @return 返回对象用于操控此区域,当前暴露了iscroll的refresh函数,当你在插件之外向滚动区域增加/删除内容后应该主动调用一次
 * @description
 *
 * 2017-03-29
 * 1）支持上拉加载
 * 2017-03-30
 * 1）改为jquery静态函数插件
 * 2）支持关闭下拉刷新或上拉加载
 */
$.installPullToRefresh =
function (container, option) {
    // 上一次移动的位置
    var touchLastY = null;
    // 当前的触摸事件
    var touchEvent = null;
    // 当前的刷新事件
    var refreshEvent = null;
    // 当前图标位置
    var curY = -55;
    // 当前的加载事件
    var loadEvent = null;

    // 默认参数
    var defaultOption = {
        // 刷新相关
        noRefresh: false, // 关闭下拉刷新特性
        pauseBound: 40,  // 触发刷新的位置(也是图标loading暂停的位置)
        lowerBound: 80, // 最大下拉到多少px
        loadImg: "load.png", // loading图片
        pullImg: "pull.png", // 下拉图片
        onRefresh: function (refreshDone) { // 刷新数据回调
            setTimeout(function() { // 默认不做任何事
                refreshDone();
            }, 0);
        },

        // 加载相关
        noLoad: false, // 关闭上拉加载特性
        bottomHeight: 1, // 距离滚动条底部多少px发起刷新
        onLoad: function (loadDone) {
            setTimeout(function() {
                loadDone();
            }, 0);
        },
    };
    var finalOption = $.extend(true, defaultOption, option);

    // 创建iscroll5滚动区域
    var iscroll = new IScroll(container, {
        bounce: false,
    });

    // 关闭上拉加载特性
    if (!finalOption.noLoad) {
        // 监听滚动结束事件,用于上拉加载
        iscroll.on('scrollEnd', function () {
            // 有滚动条的情况下,才允许上拉加载
            if (iscroll.maxScrollY < 0) { // maxScrollY<0表明出现了滚动条
                var bottomDistance = (iscroll.maxScrollY - iscroll.y) * -1;
                // 距离底部足够近，触发加载
                if (bottomDistance <= finalOption.bottomHeight) {
                    // 当前没有刷新和加载事件正在执行
                    if (!loadEvent && !refreshEvent) {
                        loadEvent = {}; // 生成新的加载事件
                        finalOption.onLoad(function (error, msg) {
                            loadEvent = null; // 清理当前的加载事件
                            // 延迟重绘滚动条
                            setTimeout(function () {
                                iscroll.refresh();
                            }, 0);
                        });
                    }
                }
            }
        });
    }

    // 关闭下拉刷新特性
    if (!finalOption.noRefresh) {
        // 紧邻滚动区域,容纳刷新图标
        var pullContainer = $('<div class="pullContainer"></div>');
        // 设置下拉条宽度与容器宽度一致
        pullContainer.css("width", $(container).css("width"));
        // 创建小图标
        var pullToRefresh = $('<div class="pullToRefresh"><img src="' + finalOption.pullImg + '"></div>');
        // 保留小图标的快捷方式
        var pullImg = pullToRefresh.find("img");
        // 小图标加入到容器
        pullContainer.append(pullToRefresh);
        // 小图标容器添加到滚动区域之前
        $(container).before(pullContainer);
        // 预加载loadImg
        $('<img src="' + finalOption.loadImg + '">');

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

        // 开启回弹动画
        function tryStartBackTranTop() {
            // 启动回弹动画
            pullToRefresh.addClass("backTranTop");
            // 判断是否触发刷新
            if (curY >= finalOption.pauseBound) {
                goTowards(finalOption.pauseBound);
                // 回弹动画结束发起刷新
                pullToRefresh.on('transitionend webkitTransitionEnd oTransitionEnd', function (event) {
                    // 由于transitionend会对每个属性回调一次,所以只处理其中一个
                    if (event.originalEvent.propertyName == "transform") {
                        // 暂停动画
                        pullToRefresh.removeClass("backTranTop");
                        pullToRefresh.unbind();
                        // 透明度重置为1
                        goTowards(finalOption.pauseBound, undefined, 1);
                        // 切换图片为loading图
                        pullImg.attr("src", finalOption.loadImg);
                        // 因为anamition会覆盖transform的原因,使用top临时定位元素
                        pullToRefresh.addClass("loadingAnimation");
                        pullToRefresh.css("top", finalOption.pauseBound + "px");
                        // 回调刷新数据,最终应将refreshEvent传回校验
                        finalOption.onRefresh(function (error, msg) {
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
                                refreshEvent = null;
                                // 弹回顶部
                                goTowards(-55);
                            }, 100);
                        });
                    }
                });
            } else {
                goTowards(-55); // 弹回顶部
                refreshEvent = null; // 未达成刷新触发条件
            }
        }

        // 父容器注册下拉事件
        $(container).on("touchstart", function (event) {
            // 新的触摸事件
            touchEvent = {};
            // 有一个刷新事件正在进行
            if (refreshEvent) {
                return;
            }

            // 一个新的刷新事件
            refreshEvent = touchEvent;
            // 重置下拉启动时的手势位置
            touchLastY = null;
            // 如果存在,则关闭回弹动画与相关监听
            pullToRefresh.removeClass("backTranTop");
            pullToRefresh.unbind();
            // 切换为pull图
            pullImg.attr("src", finalOption.pullImg);
        }).on("touchmove", function (event) {
            var touchCurY = event.originalEvent.changedTouches[0].clientY;

            // 在刷新未完成前触摸,将被忽略
            if (touchEvent != refreshEvent) {
                return;
            }

            // 滚动条必须到达顶部,才开始下拉刷新动画
            if (iscroll.y != 0) {
                return;
            } else if (touchLastY === null) {
                touchLastY = touchCurY; // 下拉启动时的手势位置
            }

            // 计算与前一次事件之间移动的距离
            var delta = touchCurY - touchLastY;
            touchLastY = touchCurY;

            // 图标的目标位置
            var destY = curY + delta;
            // 向下不能拉出范围
            if (destY > finalOption.lowerBound) {
                destY = finalOption.lowerBound;
            }
            // 向上不能拉出范围
            if (destY <= -55) {
                destY = -55;
            }
            // 更新图标的位置
            goTowards(destY);
            // 一旦小图标进入视野, Y轴向上的滚动条将锁定
            if (destY >= 0) {
                iscroll.lockScrollUp();
            } else { // 一旦小图标离开视野, Y轴向上的滚动条释放锁定
                iscroll.unlockScrollUp();
            }
        }).on("touchend touchcancel", function (event) {
            // 在刷新未完成前触摸,将被忽略
            if (touchEvent != refreshEvent) {
                return;
            }

            // 解锁iscroll向上拉动
            iscroll.unlockScrollUp();

            // 尝试启动回弹动画
            tryStartBackTranTop();
        });
    }

    // 初始化iscroll
    setTimeout(function() {
        iscroll.refresh();
    }, 0);

    // 返回操作此区域的工具对象
    return {
        // 用户如果在下拉刷新之外修改了滚动区域的内容，需要主动调用refresh
        refresh: function() {
            // 延迟以便配合浏览器重绘
            setTimeout(function() {
                iscroll.refresh();
            }, 0);
        },
        // 触发下拉刷新
        triggerPull: function() {
            // 正在刷新或者禁止刷新
            if (refreshEvent || finalOption.noRefresh) {
                return false;
            }
            // 暂停可能正在进行的最终阶段回弹动画
            pullToRefresh.removeClass("backTranTop");
            // 小图标移动到lowerbound位置
            goTowards(finalOption.lowerBound);
            // 创建新的刷新事件,占坑可以阻止在setTimeout之前的触摸引起刷新
            refreshEvent = {};
            // 延迟到浏览器重绘
            setTimeout(function() {
                tryStartBackTranTop();
            }, 100);
        },
    };
};