import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {func} from '../../util';

/**
 * slider dots
 * 导航锚点
 */


const {noop} = func;

export default class Dots extends React.Component {
    static propTypes = {
        prefix: PropTypes.string,
        currentSlide: PropTypes.number,
        changeSlide: PropTypes.func,
        dotsClass: PropTypes.string,
        slideCount: PropTypes.number,
        slidesToScroll: PropTypes.number,
        dotsDirection: PropTypes.oneOf(['hoz', 'ver']),
        dotsRender: PropTypes.func,
        triggerType: PropTypes.string
    };

    static defaultProps = {
        changeSlide: noop
    };

    handleChangeSlide(options, e) {
        e.preventDefault();

        this.props.changeSlide(options);
    }

    render () {
        const {prefix, slideCount, slidesToScroll, currentSlide, dotsClass, dotsDirection, dotsRender, triggerType} = this.props;

        const dotsClazz = classNames(`${prefix}slick-dots`, dotsDirection, dotsClass);
        const dotCount = Math.ceil(slideCount / slidesToScroll);
        const children = [];

        for (let i = 0; i < dotCount; i++) {
            const leftBound = i * slidesToScroll;
            const rightBound = leftBound + slidesToScroll - 1;
            const itemClazz = classNames(`${prefix}slick-dots-item`, {
                active: (currentSlide >= leftBound) && (currentSlide <= rightBound)
            });
            const dotOptions = {
                message: 'dots',
                index: i,
                slidesToScroll,
                currentSlide
            };
            // 除非设置为hover，默认使用click触发
            const handleProp = {
                [(triggerType.toLowerCase() === 'hover') ? 'onMouseEnter' : 'onClick']: this.handleChangeSlide.bind(this, dotOptions)
            };

            children.push(
                <li key={i} className={itemClazz}>
                    {
                        (dotsRender instanceof Function) ?
                            <span {...handleProp}>
                                {dotsRender(i, currentSlide)}
                            </span> :
                            <button {...handleProp} />
                    }
                </li>
            );
        }

        return <ul className={dotsClazz}>{children}</ul>;
    }
}
