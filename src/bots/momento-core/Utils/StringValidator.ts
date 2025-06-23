import { emojiRegex } from "./EmojiUnicode";

export class StringValidator {
    static hasSpecialCharacters(str: string): boolean {
        if (typeof str !== 'string') {
            return false;
        }

        const regex = /^[a-zA-Z0-9 ]*$/;

        return !regex.test(str);
    }

    static hasEmoji(str: string): boolean {
        const emojis = emojiRegex;
        return emojis.test(str);
    }

    static formatForProfile(num: number, digits: number) {
        if (num < 9999) {
            return String(num)
        }
        const lookup = [
            { value: 1, symbol: "" },
            { value: 1e3, symbol: "k" },
            { value: 1e6, symbol: "mi" },
            { value: 1e9, symbol: "bi" },
            { value: 1e12, symbol: "tri" }
        ];
        const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
        var item = lookup.slice().reverse().find(function (item) {
            return num >= item.value;
        });
        return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
    }


    static padToTwoDigits(num: number): string {
        return num.toString().padStart(2, '0');
    }

    static formatDate(date: Date, desiredFormat: string): string {
        const day = this.padToTwoDigits(date.getDate());
        const month = this.padToTwoDigits(date.getMonth() + 1);
        const year = date.getFullYear().toString();

        switch (desiredFormat) {
            case 'DD/MM/YYYY':
                return `${day}/${month}/${year}`;
            default:
                console.error('Formato de data não suportado:', desiredFormat);
                return '';
        }
    }
}