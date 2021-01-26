import { lgQuery } from '../../lgQuery';
import { LightGallery } from '../../lightgallery';
import { RotateSettings } from './lg-rotate-settings';

declare global {
    interface Window {
        $LG: (selector: any) => lgQuery;
    }
}

const $LG = window.$LG;

const rotateSettings = {
    rotate: true,
    rotateLeft: true,
    rotateRight: true,
    flipHorizontal: true,
    flipVertical: true,
};

export class Rotate {
    core: LightGallery;
    settings: RotateSettings;
    rotateValuesList!: {
        [key: string]: any;
    };
    constructor(instance: LightGallery) {
        // get lightGallery core plugin data
        this.core = instance;
        // extend module default settings with lightGallery core settings
        this.settings = Object.assign({}, rotateSettings, this.core.settings);

        if (this.settings.rotate && this.core.doCss()) {
            this.init();
        }

        return this;
    }
    buildTemplates(): void {
        let rotateIcons = '';
        if (this.settings.flipVertical) {
            rotateIcons +=
                '<button type="button" id="lg-flip-ver" aria-label="flip vertical" class="lg-flip-ver lg-icon"></button>';
        }
        if (this.settings.flipHorizontal) {
            rotateIcons +=
                '<button type="button" id="lg-flip-hor" aria-label="Flip horizontal" class="lg-flip-hor lg-icon"></button>';
        }
        if (this.settings.rotateLeft) {
            rotateIcons +=
                '<button type="button" id="lg-rotate-left" aria-label="Rotate left" class="lg-rotate-left lg-icon"></button>';
        }
        if (this.settings.rotateRight) {
            rotateIcons +=
                '<button type="button" id="lg-rotate-right" aria-label="Rotate right" class="lg-rotate-right lg-icon"></button>';
        }
        this.core.outer.find('.lg-toolbar').append(rotateIcons);
    }

    init(): void {
        this.buildTemplates();

        // Save rotate config for each item to persist its rotate, flip values
        // even after navigating to diferent slides
        this.rotateValuesList = {};

        // event triggered after appending slide content
        this.core.LGel.on('onAferAppendSlide.lg.rotate', (event) => {
            const { index } = event.detail;
            const imageWrap = this.core
                .getSlideItem(index)
                .find('.lg-img-wrap')
                .first();

            imageWrap.wrap('lg-img-rotate');
        });

        this.core.outer
            .find('#lg-rotate-left')
            .first()
            .on('click.lg', this.rotateLeft.bind(this));

        this.core.outer
            .find('#lg-rotate-right')
            .first()
            .on('click.lg', this.rotateRight.bind(this));

        this.core.outer
            .find('#lg-flip-hor')
            .first()
            .on('click.lg', this.flipHorizontal.bind(this));

        this.core.outer
            .find('#lg-flip-ver')
            .first()
            .on('click.lg', this.flipVertical.bind(this));

        // Reset rotate on slide change
        this.core.LGel.on('onBeforeSlide.lg.rotate', (event) => {
            if (!this.rotateValuesList[event.detail.index]) {
                this.rotateValuesList[event.detail.index] = {
                    rotate: 0,
                    flipHorizontal: 1,
                    flipVertical: 1,
                };
            }
        });
    }

    applyStyles(): void {
        const $image = this.core
            .getSlideItem(this.core.index)
            .find('.lg-img-rotate')
            .first();

        $image.css(
            'transform',
            'rotate(' +
                this.rotateValuesList[this.core.index].rotate +
                'deg)' +
                ' scale3d(' +
                this.rotateValuesList[this.core.index].flipHorizontal +
                ', ' +
                this.rotateValuesList[this.core.index].flipVertical +
                ', 1)',
        );
    }

    rotateLeft(): void {
        this.rotateValuesList[this.core.index].rotate -= 90;
        this.applyStyles();
    }

    rotateRight(): void {
        this.rotateValuesList[this.core.index].rotate += 90;
        this.applyStyles();
    }

    getCurrentRotation(el: HTMLElement): number {
        if (!el) {
            return 0;
        }
        const st = $LG(el).style();
        const tm =
            st.getPropertyValue('-webkit-transform') ||
            st.getPropertyValue('-moz-transform') ||
            st.getPropertyValue('-ms-transform') ||
            st.getPropertyValue('-o-transform') ||
            st.getPropertyValue('transform') ||
            'none';
        if (tm !== 'none') {
            const values = tm.split('(')[1].split(')')[0].split(',') as any;
            if (values) {
                const angle = Math.round(
                    Math.atan2(values[1], values[0]) * (180 / Math.PI),
                );
                return angle < 0 ? angle + 360 : angle;
            }
        }
        return 0;
    }

    flipHorizontal(): void {
        const rotateEl = this.core
            .getSlideItem(this.core.index)
            .find('.lg-img-rotate')
            .first()
            .get();
        const currentRotation = this.getCurrentRotation(rotateEl);
        let rotateAxis = 'flipHorizontal';
        if (currentRotation === 90 || currentRotation === 270) {
            rotateAxis = 'flipVertical';
        }
        this.rotateValuesList[this.core.index][rotateAxis] *= -1;
        this.applyStyles();
    }

    flipVertical(): void {
        const rotateEl = this.core
            .getSlideItem(this.core.index)
            .find('.lg-img-rotate')
            .first()
            .get();
        const currentRotation = this.getCurrentRotation(rotateEl);
        let rotateAxis = 'flipVertical';
        if (currentRotation === 90 || currentRotation === 270) {
            rotateAxis = 'flipHorizontal';
        }
        this.rotateValuesList[this.core.index][rotateAxis] *= -1;

        this.applyStyles();
    }

    destroy(clear?: boolean): void {
        this.rotateValuesList = {};

        if (clear) {
            // Unbind all events added by lightGallery rotate plugin
            this.core.LGel.off('.lg.rotate');
        }
    }
}

window.lgModules = window.lgModules || {};
window.lgModules.rotate = Rotate;
