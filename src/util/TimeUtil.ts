export class TimeUtil {
    public static generateDuration(args: string[]) {
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

    public static isDateFormat(str: string) {
        return (!Number.isNaN(str.slice(0, -1))) && TimeUtil.getDateDeliminator(str) !== null
    }

    public static getDateDeliminator(str: string) {
        if (str.endsWith('s')) return 's';
        if (str.endsWith('m')) return 'm';
        if (str.endsWith('h')) return 'h';
        if (str.endsWith('d')) return 'd';
        else return null;
    }

    public static getMilScndsMultiplier(str: string) {
        if (str.length !== 1) console.error(`getMilScnds error. Input string doesn't have length 1`)
        switch (str[0]) {
            case 's': return 1000;
            case 'm': return 1000 * 60;
            case 'h': return 1000 * 60 * 60;
            case 'd': return 1000 * 60 * 60 * 24;
        }
    }
}