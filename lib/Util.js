"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Util {
    static keyByValue(object, value) {
        const inverted = Object.keys(object)
            .reduce((reverted, key) => {
            reverted[object[key]] = key;
            return reverted;
        }, {});
        return inverted[value];
    }
    // accepts seconds as Number or String. Returns m:ss
    // take value s and subtract (will try to convert String to Number)
    // the new value of s, now holding the remainder of s divided by 60
    // (will also try to convert String to Number)
    // and divide the resulting Number by 60
    // (can never result in a fractional value = no need for rounding)
    // to which we concatenate a String (converts the Number to String)
    // who's reference is chosen by the conditional operator:
    // if    seconds is larger than 9
    // then  we don't need to prepend a zero
    // else  we do need to prepend a zeroa
    // and we add Number s to the string (converting it to String as well)
    static formatSecondsToMSS(s) {
        if (typeof s === 'string') {
            s = parseFloat(s);
        }
        // eslint-disable-next-line no-return-assign
        return (s - (s %= 60)) / 60 + (s > 9 ? ':' : ':0') + s;
    }
    static hsl2rgb(h, s, l) {
        let a = s * Math.min(l, 1 - l);
        let f = (n, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return [
            Math.trunc(f(0) * 255),
            Math.trunc(f(8) * 255),
            Math.trunc(f(4) * 255)
        ];
    }
    static rgb2hsl(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max == min) {
            h = s = 0; // achromatic
        }
        else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            // @ts-ignore
            h /= 6;
        }
        // @ts-ignore
        return [h, s, l];
    }
    static rgb2hex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
    static hex2rgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : null;
    }
    static scale(from, fromRange, toRange) {
        const d = (toRange[1] - toRange[0]) / (fromRange[1] - fromRange[0]);
        const result = (from - fromRange[0]) * d + toRange[0];
        // We have to clamp because sometimes we get small rounding errors
        // causing us to end up with a value slightly outside the range.
        return this.clamp(result, toRange[0], toRange[1]);
    }
}
Util.clamp = (num, min, max) => {
    return Math.min(Math.max(num, min), max);
};
exports.default = Util;
