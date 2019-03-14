/*
 * @Author: DuanXiBao
 * @Date: 2018-06-12 18:37:00
 * @LastEditors: DuanXiBao
 * @LastEditTime: 2018-11-07 14:42:12
 * @Description: 滚动列表组件：支持下拉刷新，上拉刷新，基于Bscroller封装
 * @Company: doctorgroup.com.cn
 * 
 * Demo:
 * <scroller class="wrapper"
          :data="data"
          :pulldown="pulldown"
          @pulldown="loadData">
        <div v-for="item in data">{{item}}</div>
  </scroller>
 */

/* bubble 组件*/
Vue.component('bubble', {
    template: '<canvas ref="bubble" :width="width" :height="height" :style="style"></canvas>',
    props: {
        y: {
            type: Number,
            default: 0
        }
    },
    data: function data() {
        return {
            width: 50,
            height: 80
        };
    },

    computed: {
        distance: function distance() {
            return Math.max(0, Math.min(this.y * this.ratio, this.maxDistance));
        },
        style: function style() {
            return 'width:' + this.width / this.ratio + 'px;height:' + this.height / this.ratio + 'px';
        }
    },
    created: function created() {
        this.ratio = window.devicePixelRatio;
        this.width *= this.ratio;
        this.height *= this.ratio;
        this.initRadius = 18 * this.ratio;
        this.minHeadRadius = 12 * this.ratio;
        this.minTailRadius = 5 * this.ratio;
        this.initArrowRadius = 10 * this.ratio;
        this.minArrowRadius = 6 * this.ratio;
        this.arrowWidth = 3 * this.ratio;
        this.maxDistance = 40 * this.ratio;
        this.initCenterX = 25 * this.ratio;
        this.initCenterY = 25 * this.ratio;
        this.headCenter = {
            x: this.initCenterX,
            y: this.initCenterY
        };
    },
    mounted: function mounted() {
        this._draw();
    },

    methods: {
        _draw: function _draw() {
            var bubble = this.$refs.bubble;
            var ctx = bubble.getContext('2d');
            ctx.clearRect(0, 0, bubble.width, bubble.height);
            this._drawBubble(ctx);
            this._drawArrow(ctx);
        },
        _drawBubble: function _drawBubble(ctx) {
            ctx.save();
            ctx.beginPath();
            var rate = this.distance / this.maxDistance;
            var headRadius = this.initRadius - (this.initRadius - this.minHeadRadius) * rate;
            this.headCenter.y = this.initCenterY - (this.initRadius - this.minHeadRadius) * rate;
            // 画上半弧线
            ctx.arc(this.headCenter.x, this.headCenter.y, headRadius, 0, Math.PI, true);
            // 画左侧贝塞尔
            var tailRadius = this.initRadius - (this.initRadius - this.minTailRadius) * rate;
            var tailCenter = {
                x: this.headCenter.x,
                y: this.headCenter.y + this.distance
            };
            var tailPointL = {
                x: tailCenter.x - tailRadius,
                y: tailCenter.y
            };
            var controlPointL = {
                x: tailPointL.x,
                y: tailPointL.y - this.distance / 2
            };
            ctx.quadraticCurveTo(controlPointL.x, controlPointL.y, tailPointL.x, tailPointL.y);
            // 画下半弧线
            ctx.arc(tailCenter.x, tailCenter.y, tailRadius, Math.PI, 0, true);
            // 画右侧贝塞尔
            var headPointR = {
                x: this.headCenter.x + headRadius,
                y: this.headCenter.y
            };
            var controlPointR = {
                x: tailCenter.x + tailRadius,
                y: headPointR.y + this.distance / 2
            };
            ctx.quadraticCurveTo(controlPointR.x, controlPointR.y, headPointR.x, headPointR.y);
            ctx.fillStyle = 'rgb(170,170,170)';
            ctx.fill();
            ctx.strokeStyle = 'rgb(153,153,153)';
            ctx.stroke();
            ctx.restore();
        },
        _drawArrow: function _drawArrow(ctx) {
            ctx.save();
            ctx.beginPath();
            var rate = this.distance / this.maxDistance;
            var arrowRadius = this.initArrowRadius - (this.initArrowRadius - this.minArrowRadius) * rate;
            // 画内圆
            ctx.arc(this.headCenter.x, this.headCenter.y, arrowRadius - (this.arrowWidth - rate), -Math.PI / 2, 0, true);
            // 画外圆
            ctx.arc(this.headCenter.x, this.headCenter.y, arrowRadius, 0, Math.PI * 3 / 2, false);
            ctx.lineTo(this.headCenter.x, this.headCenter.y - arrowRadius - this.arrowWidth / 2 + rate);
            ctx.lineTo(this.headCenter.x + this.arrowWidth * 2 - rate * 2, this.headCenter.y - arrowRadius + this.arrowWidth / 2);
            ctx.lineTo(this.headCenter.x, this.headCenter.y - arrowRadius + this.arrowWidth * 3 / 2 - rate);
            ctx.fillStyle = 'rgb(255,255,255)';
            ctx.fill();
            ctx.strokeStyle = 'rgb(170,170,170)';
            ctx.stroke();
            ctx.restore();
        }
    },
    watch: {
        y: function y() {
            this._draw();
        }
    }
});
/* scroller组件 */
Vue.component('scroller', {
    template: '<div class="scroller" :class="stylename" ref="wrapper">\
                    <div class="content">\
                        <slot></slot>\
                        <slot name="pullup">\
                            <div class="pullup-wrapper" v-if="pullup">\
                                <span v-if="!isPullUpLoad">{{refreshTxt}}</span>\
                                <span v-else class="loading" >\
                                <img src="/static/imgs/vuemodal/loading-bubbles.svg" />\
                                </span>\
                            </div>\
                        </slot>\
                    </div>\
                    <slot name="pulldown">\
                        <div ref="pulldown" class="pulldown-wrapper" :style="pullDownStyle" v-if="pulldown">\
                            <div class="before-trigger" v-if="beforePullDown">\
                                <bubble :y="bubbleY"></bubble>\
                            </div>\
                            <div class="after-trigger" v-else>\
                                <div v-if="isPullingDown" class="loading">\
                                <img src="/static/imgs/vuemodal/loading-bubbles.svg" />\
                                </div>\
                                <div v-else><span>{{refreshTxt}}</span></div>\
                            </div>\
                        </div>\
                    </solt>\
                </div>',
    props: {
        /**
         * 1 滚动的时候会派发scroll事件，会截流。
         * 2 滚动的时候实时派发scroll事件，不会截流。
         * 3 除了实时派发scroll事件，在swipe的情况下仍然能实时派发scroll事件
         */
        probeType: {
            type: Number,
            default: 1
        },
        /**
         * 点击列表是否派发click事件
         */
        click: {
            type: Boolean,
            default: true
        },
        /**
         * 是否开启横向滚动
         */
        scrollX: {
            type: Boolean,
            default: false
        },
        /**
         * 是否派发滚动事件
         */
        listenScroll: {
            type: Boolean,
            default: false
        },
        /**
         * 列表的数据
         */
        data: {
            type: Array,
            default: null
        },
        /**
         * 是否派发滚动到底部的事件，用于上拉加载
         */
        pullup: {
            type: Boolean,
            default: false
        },
        /**
         * 是否派发顶部下拉的事件，用于下拉刷新
         */
        pulldown: {
            type: Boolean,
            default: false
        },
        /**
         * 是否派发列表滚动开始的事件
         */
        beforeScroll: {
            type: Boolean,
            default: false
        },
        /**
         * 当数据更新后，刷新scroll的延时。
         */
        refreshDelay: {
            type: Number,
            default: 20
        },
        stylename: {
            type: String,
            default: ''
        },
        scrollToEndFlag: {
            type: Boolean,
            default: false
        }
    },
    data: function data() {
        return {
            pullUpDirty: true,
            isPullUpLoad: false,
            isPullingDown: false,
            beforePullDown: true,
            pullDownStyle: '',
            bubbleY: 0,
            isRebounding: false
        };
    },

    computed: {
        refreshTxt: function refreshTxt() {
            return this.pullUpDirty ? '加载成功' : '没有更多的数据';
        }
    },
    created: function created() {
        this.pullDownInitTop = -50;
        this.pullDownRefreshStop = 40;
    },
    mounted: function mounted() {
        var _this = this;

        // 保证在DOM渲染完毕后初始化better-scroll
        setTimeout(function () {
            _this._initScroll();
        }, 20);
    },

    methods: {
        _initScroll: function _initScroll() {
            var _this2 = this;

            if (!this.$refs.wrapper) {
                return;
            }
            // better-scroll的初始化
            this.scroll = new BScroll(this.$refs.wrapper, {
                probeType: this.probeType,
                click: this.click,
                preventDefaultException: {className:/(^|\s)prevent-exception(\s|$)/},
                scrollX: this.scrollX,
                pullUpLoad: this.pullup, //开启上拉加载
                pullDownRefresh: this.pulldown //开启下拉刷新
            });

            // 是否派发滚动事件
            if (this.listenScroll) {
                this.scroll.on('scroll', function (pos) {
                    _this2.$emit('scroll', pos);
                });
            }

            // 是否派发滚动到底部事件，用于上拉加载
            if (this.pullup) {
                // this.scroll.on('scrollEnd', () => {
                //     // 滚动到底部
                //     if (this.scroll.y <= (this.scroll.maxScrollY + 50)) {
                //         this.$emit('pullup');
                //     }
                // })
                this.scroll.on('pullingUp', function () {
                    _this2.isPullUpLoad = true;
                    _this2.$emit('pullup');
                });
            }

            // 是否派发顶部下拉事件，用于下拉刷新
            if (this.pulldown) {
                // this.scroll.on('touchend', (pos) => {
                //     // 下拉动作
                //     if (pos.y > 50) {
                //         this.$emit('pulldown')
                //     }
                // })
                this.scroll.on('pullingDown', function () {
                    _this2.beforePullDown = false;
                    _this2.isPullingDown = true;
                    _this2.$emit('pulldown');
                });

                this.scroll.on('scroll', function (pos) {
                    if (!_this2.pulldown) {
                        return;
                    }
                    if (_this2.beforePullDown) {
                        _this2.bubbleY = Math.max(0, pos.y + _this2.pullDownInitTop);
                        _this2.pullDownStyle = 'top:' + Math.min(pos.y + _this2.pullDownInitTop, 10) + 'px';
                    } else {
                        _this2.bubbleY = 0;
                    }
                    if (_this2.isRebounding) {
                        _this2.pullDownStyle = 'top:' + (10 - (_this2.pullDownRefreshStop - pos.y)) + 'px';
                    }
                });
            }

            // 是否派发列表滚动开始的事件
            if (this.beforeScroll) {
                this.scroll.on('beforeScrollStart', function () {
                    _this2.$emit('beforeScroll');
                });
            }

            // 是否滚动到底部
            if (this.scrollToEndFlag) {
                this.scrollToEnd();
            }
        },
        disable: function disable() {
            // 代理better-scroll的disable方法
            this.scroll && this.scroll.disable();
        },
        enable: function enable() {
            // 代理better-scroll的enable方法
            this.scroll && this.scroll.enable();
        },
        refresh: function refresh() {
            // 代理better-scroll的refresh方法
            this.scroll && this.scroll.refresh();
        },
        forceUpdate: function forceUpdate(dirty) {
            var _this3 = this;

            if (this.pullup && this.isPullUpLoad) {
                this.isPullUpLoad = false;
                this.scroll.finishPullUp();
                this.pullUpDirty = dirty;
                this.refresh();
            } else if (this.pulldown && this.isPullingDown) {
                this.isPullingDown = false;
                this.pullUpDirty = dirty;
                this._reboundPullDown(function () {
                    _this3._afterPullDown();
                });
            } else {
                this.refresh();
            }
        },
        _reboundPullDown: function _reboundPullDown(callback) {
            var _this4 = this;

            var _pulldown$stopTime = this.pulldown.stopTime,
                stopTime = _pulldown$stopTime === undefined ? 600 : _pulldown$stopTime;

            setTimeout(function () {
                _this4.isRebounding = true;
                _this4.scroll.finishPullDown();
                callback();
            }, stopTime);
        },
        _afterPullDown: function _afterPullDown() {
            var _this5 = this;

            setTimeout(function () {
                _this5.pullDownStyle = 'top:' + _this5.pullDownInitTop + 'px';
                _this5.beforePullDown = true;
                _this5.isRebounding = false;
                _this5.refresh();
            }, this.scroll.options.bounceTime);
        },
        scrollTo: function scrollTo() {
            // 代理better-scroll的scrollTo方法
            this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments);
        },
        scrollToEnd: function scrollToEnd(speed) {
            var _this6 = this;

            speed = speed || 0;
            setTimeout(function () {
                _this6.scroll.scrollTo(0, _this6.scroll.maxScrollY, speed);
            }, 200);
        },
        scrollToElement: function scrollToElement() {
            // 代理better-scroll的scrollToElement方法
            this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments);
        }
    },
    watch: {
        // 监听数据的变化，延时refreshDelay时间后调用refresh方法重新计算，保证滚动效果正常
        data: function data() {
            var _this7 = this;

            setTimeout(function () {
                _this7.forceUpdate(true);
            }, this.refreshDelay);
        }
    }
});
