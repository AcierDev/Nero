"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbManager = void 0;
require("reflect-metadata");
const nedb_promises_1 = __importDefault(require("nedb-promises"));
const class_transformer_1 = require("class-transformer");
class DbManager {
    static db = new nedb_promises_1.default({ autoload: true, filename: "./data/moderation.db" });
    static async storeAction(action) {
        const plainActionObj = (0, class_transformer_1.classToPlain)(action);
        await this.db.insert(plainActionObj);
    }
    static async fetchAction(fetchOptions) {
        return await this.db.find(fetchOptions);
    }
}
exports.DbManager = DbManager;
