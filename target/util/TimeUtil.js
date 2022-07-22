"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeUtil = void 0;
class TimeUtil {
    static generateDuration(args) {
        if (!args[0] || !TimeUtil.isDateFormat(args[0])) {
            return null;
        }
        let ms = 0;
        while (args[0] && TimeUtil.isDateFormat(args[0])) {
            let str = args.shift();
            ms += Number.parseInt(str.slice(0, -1)) * TimeUtil.getMilScndsMultiplier(TimeUtil.getDateDeliminator(str));
        }
        return ms;
    }
    static isDateFormat(str) {
        return (!Number.isNaN(str.slice(0, -1))) && TimeUtil.getDateDeliminator(str) !== null;
    }
    static getDateDeliminator(str) {
        if (str.endsWith('s'))
            return 's';
        if (str.endsWith('m'))
            return 'm';
        if (str.endsWith('h'))
            return 'h';
        if (str.endsWith('d'))
            return 'd';
        else
            return null;
    }
    static getMilScndsMultiplier(str) {
        if (str.length !== 1)
            console.error(`getMilScnds error. Input string doesn't have length 1`);
        switch (str[0]) {
            case 's': return 1000;
            case 'm': return 1000 * 60;
            case 'h': return 1000 * 60 * 60;
            case 'd': return 1000 * 60 * 60 * 24;
        }
    }
}
exports.TimeUtil = TimeUtil;
