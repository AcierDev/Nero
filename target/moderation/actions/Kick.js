"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Kick = void 0;
const AbstractModerationAction_1 = require("../abstract/AbstractModerationAction");
class Kick extends AbstractModerationAction_1.AbstractModerationAction {
    // -------------------------------------------- //
    // STATIC FACTORIES
    // Static methods to return an instance of the class
    // because this shitty language doesn't have constructor overloading
    // --------------------------------------------//
    /**
     * Generate an instance of a kick from an interaction
     */
    static async interactionFactory(interaction) {
    }
}
exports.Kick = Kick;
