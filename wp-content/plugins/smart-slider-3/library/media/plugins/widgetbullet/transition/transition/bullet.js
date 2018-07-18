N2D('SmartSliderWidgetBulletTransition', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param slider
     * @param parameters
     * @constructor
     */
    function SmartSliderWidgetBulletTransition(slider, parameters) {
        this.slider = slider;

        this.slider.started($.proxy(this.start, this, parameters));
    }

    SmartSliderWidgetBulletTransition.prototype.start = function (parameters) {

        if (this.slider.sliderElement.data('bullet')) {
            return false;
        }
        this.slider.sliderElement.data('bullet', this);

        this.axis = 'horizontal';
        this.offset = 0;
        this.parameters = parameters;

        this.bar = this.slider.sliderElement.find('.nextend-bullet-bar');

        var event = 'universalclick';
        if (parameters.action == 'mouseenter') {
            event = 'mouseenter';
        }
        this.originalDots = this.dots = this.bar.find('div').on(event, $.proxy(this.onDotClick, this));

        if (this.slider.isShuffled) {
            var dots = [],
                thumbnails = [];
            for (var i = 0; this.slider.realSlides.length > i; i++) {
                var slide = this.slider.realSlides[i];
                dots.push(this.dots.get(slide.originalIndex));
                thumbnails.push(this.parameters.thumbnails[slide.originalIndex]);
                if (parameters.numeric) {
                    this.dots.eq(slide.originalIndex).html(i + 1);
                }
            }
            this.originalDots = this.dots = $(dots).appendTo(this.dots.parent());
            this.parameters.thumbnails = thumbnails;
        }

        this.slider.sliderElement.on({
            slideCountChanged: $.proxy(this.onSlideCountChanged, this),
            sliderSwitchTo: $.proxy(this.onSlideSwitch, this)
        });

        this.slider.firstSlideReady.done($.proxy(this.onFirstSlideSet, this));

        if (parameters.overlay == 0) {
            var side = false;
            switch (parameters.area) {
                case 1:
                    side = 'Top';
                    break;
                case 12:
                    side = 'Bottom';
                    break;
                case 5:
                    side = 'Left';
                    this.axis = 'vertical';
                    break;
                case 8:
                    side = 'Right';
                    this.axis = 'vertical';
                    break;
            }
            if (side) {
                this.offset = parseFloat(this.bar.data('offset'));
                this.slider.responsive.addStaticMargin(side, this);
            }
        }

        this.initThumbnails();
    };

    SmartSliderWidgetBulletTransition.prototype.onFirstSlideSet = function (slide) {
        this.dots.eq(slide.index).addClass('n2-active');
    };

    SmartSliderWidgetBulletTransition.prototype.onDotClick = function (e) {
        this.slider.directionalChangeToReal(this.originalDots.index(e.currentTarget));
        $(e.target).blur();
    };

    SmartSliderWidgetBulletTransition.prototype.onSlideSwitch = function (e, targetSlideIndex) {
        this.dots.filter('.n2-active').removeClass('n2-active');
        this.dots.eq(targetSlideIndex).addClass('n2-active');
    };

    SmartSliderWidgetBulletTransition.prototype.isVisible = function () {
        return this.bar.is(':visible');
    };

    SmartSliderWidgetBulletTransition.prototype.getSize = function () {
        if (this.axis == 'horizontal') {
            return this.bar.height() + this.offset;
        }
        return this.bar.width() + this.offset;
    };

    SmartSliderWidgetBulletTransition.prototype.initThumbnails = function () {
        if (this.parameters.thumbnails.length > 0) {
            this.dots.each($.proxy(function (i, el) {
                if (this.parameters.thumbnails[i] != '') {
                    $(el).on({
                        universalenter: $.proxy(this.showThumbnail, this, i)
                    }, {
                        leaveOnSecond: true
                    })
                }
            }, this));
        }
    };

    SmartSliderWidgetBulletTransition.prototype.showThumbnail = function (i, e) {
        var thumbnail = this.getThumbnail(i);

        NextendTween.to(thumbnail, 0.3, {
            opacity: 1
        });

        this.originalDots.eq(i).on('universalleave.thumbnailleave', $.proxy(this.hideThumbnail, this, i, thumbnail));
    };

    SmartSliderWidgetBulletTransition.prototype.hideThumbnail = function (i, thumbnail, e) {
        e.stopPropagation();

        this.originalDots.eq(i).off('universalleave.thumbnailleave');

        NextendTween.to(thumbnail, 0.3, {
            opacity: 0,
            onComplete: function () {
                thumbnail.remove();
            }
        });
    };

    SmartSliderWidgetBulletTransition.prototype.getThumbnail = function (i) {
        var target = this.originalDots.eq(i);
        var sliderOffset = this.slider.sliderElement.offset(),
            targetOffset = target.offset(),
            targetW = target.outerWidth(),
            targetH = target.outerHeight();

        var thumbnail = $('<div/>')
            .append($('<div/>')
                .css({
                    width: this.parameters.thumbnailWidth,
                    height: this.parameters.thumbnailHeight,
                    backgroundImage: 'url("' + this.parameters.thumbnails[i] + '")'
                })
                .addClass('n2-ss-bullet-thumbnail'))
            .addClass(this.parameters.thumbnailStyle)
            .addClass('n2-ss-bullet-thumbnail-container')
            .appendTo(this.slider.sliderElement);

        switch (this.parameters.thumbnailPosition) {
            case 'right':
                thumbnail.css({
                    left: (targetOffset.left - sliderOffset.left) + targetW,
                    top: (targetOffset.top - sliderOffset.top) + targetH / 2 - thumbnail.outerHeight(true) / 2
                });
                break;
            case 'left':
                thumbnail.css({
                    left: (targetOffset.left - sliderOffset.left) - thumbnail.outerWidth(true),
                    top: (targetOffset.top - sliderOffset.top) + targetH / 2 - thumbnail.outerHeight(true) / 2
                });
                break;
            case 'top':
                thumbnail.css({
                    left: (targetOffset.left - sliderOffset.left) + targetW / 2 - thumbnail.outerWidth(true) / 2,
                    top: (targetOffset.top - sliderOffset.top) - thumbnail.outerHeight(true)
                });
                break;
            case 'bottom':
                thumbnail.css({
                    left: (targetOffset.left - sliderOffset.left) + targetW / 2 - thumbnail.outerWidth(true) / 2,
                    top: (targetOffset.top - sliderOffset.top) + targetH
                });
                break;
        }

        target.data('thumbnail', thumbnail);
        return thumbnail;
    };

    SmartSliderWidgetBulletTransition.prototype.onSlideCountChanged = function (e, newCount, slidesInGroup) {
        this.dots = $();
        for (var i = 0; this.originalDots.length > i; i++) {
            if (i % slidesInGroup == 0) {
                this.dots = this.dots.add(this.originalDots.eq(i).css("display", ""));
            } else {
                this.originalDots.eq(i).css("display", "none");
            }
        }
        if (this.parameters.numeric) {
            this.dots.each(function (i, el) {
                el.innerHTML = i + 1;
            });
        }
    };

    return SmartSliderWidgetBulletTransition;
});